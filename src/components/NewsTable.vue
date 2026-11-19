<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import type {
  MarketingNewsItem,
  MarketingSortField,
  MarketingSortOrder,
} from '@/types/news'
import {
  formatCount,
  formatDate,
  formatErr,
  formatTime,
  stripHtml,
  truncateText,
} from '@/utils/format'

const props = defineProps<{
  items: MarketingNewsItem[]
  page: number
  pageSize: number
  sortField: MarketingSortField
  sortOrder: MarketingSortOrder
}>()

const emit = defineEmits<{
  sort: [field: MarketingSortField]
}>()

type ColumnKey =
  | 'num'
  | 'source'
  | 'date'
  | 'time'
  | 'preview'
  | 'category'
  | 'district'
  | 'likes'
  | 'comments'
  | 'reposts'
  | 'views'
  | 'err'

interface ColumnDef {
  key: ColumnKey
  label: string
  minWidth: number
  defaultWidth: number
  align?: 'left' | 'right'
  sortField?: MarketingSortField
}

const COLUMNS: ColumnDef[] = [
  { key: 'num', label: '№', minWidth: 48, defaultWidth: 56 },
  { key: 'source', label: 'Наименование источника', minWidth: 160, defaultWidth: 260 },
  { key: 'date', label: 'Дата', minWidth: 90, defaultWidth: 110, sortField: 'date' },
  { key: 'time', label: 'Время', minWidth: 70, defaultWidth: 90 },
  { key: 'preview', label: 'Превью текста', minWidth: 160, defaultWidth: 320 },
  { key: 'category', label: 'Категории', minWidth: 120, defaultWidth: 160 },
  { key: 'district', label: 'Район', minWidth: 110, defaultWidth: 140, sortField: 'district' },
  { key: 'likes', label: 'Лайки', minWidth: 70, defaultWidth: 90, align: 'right', sortField: 'likes_count' },
  { key: 'comments', label: 'Комментарии', minWidth: 90, defaultWidth: 120, align: 'right', sortField: 'comments_count' },
  { key: 'reposts', label: 'Репосты', minWidth: 80, defaultWidth: 100, align: 'right', sortField: 'reposts_count' },
  { key: 'views', label: 'Просмотры', minWidth: 90, defaultWidth: 110, align: 'right', sortField: 'views_count' },
  { key: 'err', label: 'ERR', minWidth: 70, defaultWidth: 90, align: 'right', sortField: 'err' },
]

function isSorted(col: ColumnDef): boolean {
  return !!col.sortField && props.sortField === col.sortField
}

function sortAriaSort(col: ColumnDef): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortField) return undefined
  if (!isSorted(col)) return 'none'
  return props.sortOrder === 'asc' ? 'ascending' : 'descending'
}

function sortAriaLabel(col: ColumnDef): string {
  if (!col.sortField) return col.label
  if (!isSorted(col)) return `Сортировать по «${col.label}»`
  const next = props.sortOrder === 'desc' ? 'по возрастанию' : 'по убыванию'
  return `«${col.label}»: сейчас ${props.sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'}. Нажмите, чтобы сортировать ${next}`
}

const STORAGE_KEY = 'marketing-table-col-widths-v3'

function loadWidths(): Record<ColumnKey, number> {
  const defaults = Object.fromEntries(
    COLUMNS.map((c) => [c.key, c.defaultWidth]),
  ) as Record<ColumnKey, number>

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<Record<ColumnKey, number>>
    for (const col of COLUMNS) {
      const value = parsed[col.key]
      if (typeof value === 'number' && value >= col.minWidth) {
        defaults[col.key] = value
      }
    }
  } catch {
    // ignore
  }

  return defaults
}

const widths = reactive(loadWidths())

const tableWidth = computed(() => COLUMNS.reduce((sum, col) => sum + widths[col.key], 0))

interface TableRow {
  key: string
  num: number
  sourceName: string
  sourceUrl: string | null
  date: string
  time: string
  preview: string
  fullText: string
  category: string
  district: string
  likes: string
  comments: string
  reposts: string
  views: string
  err: string
}

function resolveDistrict(item: MarketingNewsItem): string {
  const fromApi = item.district?.trim()
  if (fromApi) return fromApi
  if (item.community_category?.trim() === 'Районы' && item.community_name?.trim()) {
    return item.community_name.trim()
  }
  return '—'
}

const rows = computed<TableRow[]>(() =>
  props.items.map((item, i) => {
    const plain = stripHtml(item.text || '')
    const preview = truncateText(plain, 140)
    return {
      key: item.id || `${item.community_id}-${item.vk_post_id}-${i}`,
      num: (props.page - 1) * props.pageSize + i + 1,
      sourceName: item.community_name?.trim() || '—',
      sourceUrl: item.url?.trim() || null,
      date: formatDate(item.date),
      time: formatTime(item.time),
      preview: preview.text || '—',
      fullText: plain,
      category: item.community_category?.trim() || '—',
      district: resolveDistrict(item),
      likes: formatCount(item.likes_count),
      comments: formatCount(item.comments_count),
      reposts: formatCount(item.reposts_count),
      views: formatCount(item.views_count),
      err: formatErr(item.err),
    }
  }),
)

function cellValue(row: TableRow, key: ColumnKey): string {
  switch (key) {
    case 'num':
      return String(row.num)
    case 'source':
      return row.sourceName
    case 'date':
      return row.date
    case 'time':
      return row.time
    case 'preview':
      return row.preview
    case 'category':
      return row.category
    case 'district':
      return row.district
    case 'likes':
      return row.likes
    case 'comments':
      return row.comments
    case 'reposts':
      return row.reposts
    case 'views':
      return row.views
    case 'err':
      return row.err
  }
}

const resizing = ref<{
  key: ColumnKey
  startX: number
  startWidth: number
  minWidth: number
} | null>(null)
const suppressSortClick = ref(false)

function onSortClick(col: ColumnDef) {
  if (!col.sortField || resizing.value || suppressSortClick.value) return
  emit('sort', col.sortField)
}

function onResizeStart(event: PointerEvent, col: ColumnDef) {
  event.preventDefault()
  event.stopPropagation()
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  suppressSortClick.value = true
  resizing.value = {
    key: col.key,
    startX: event.clientX,
    startWidth: widths[col.key],
    minWidth: col.minWidth,
  }
  document.body.classList.add('col-resizing')
}

function onResizeMove(event: PointerEvent) {
  if (!resizing.value) return
  const delta = event.clientX - resizing.value.startX
  widths[resizing.value.key] = Math.max(
    resizing.value.minWidth,
    Math.round(resizing.value.startWidth + delta),
  )
}

function persistWidths() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...widths }))
  } catch {
    // ignore
  }
}

function onResizeEnd() {
  if (!resizing.value) return
  resizing.value = null
  document.body.classList.remove('col-resizing')
  persistWidths()
  // Ignore the click that follows pointerup on the resize handle
  requestAnimationFrame(() => {
    suppressSortClick.value = false
  })
}

function resetWidth(col: ColumnDef) {
  widths[col.key] = col.defaultWidth
  persistWidths()
}

onUnmounted(() => {
  document.body.classList.remove('col-resizing')
})
</script>

<template>
  <div class="table-wrap">
    <table class="news-table" :style="{ width: '100%', minWidth: `${tableWidth}px` }">
      <colgroup>
        <col v-for="col in COLUMNS" :key="col.key" :style="{ width: `${widths[col.key]}px` }" />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="col in COLUMNS"
            :key="col.key"
            :class="{
              'is-right': col.align === 'right',
              'is-sortable': !!col.sortField,
              'is-sorted': col.sortField === sortField,
            }"
            :style="{ width: `${widths[col.key]}px` }"
            :aria-sort="sortAriaSort(col)"
            @click="onSortClick(col)"
          >
            <button
              v-if="col.sortField"
              type="button"
              class="th-sort"
              :aria-label="sortAriaLabel(col)"
              @click.stop="onSortClick(col)"
            >
              <span class="th-label">{{ col.label }}</span>
              <span
                class="sort-icon"
                :class="{
                  'is-active': isSorted(col),
                  'is-asc': isSorted(col) && sortOrder === 'asc',
                  'is-desc': isSorted(col) && sortOrder === 'desc',
                }"
                aria-hidden="true"
              >
                <svg class="sort-icon__svg" viewBox="0 0 12 16" width="12" height="16" fill="none">
                  <path
                    class="sort-icon__up"
                    d="M6 2.5 2.5 7h7L6 2.5Z"
                    fill="currentColor"
                  />
                  <path
                    class="sort-icon__down"
                    d="M6 13.5 9.5 9h-7L6 13.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
            <span v-else class="th-label">{{ col.label }}</span>
            <span
              class="resize-handle"
              role="separator"
              aria-orientation="vertical"
              :aria-label="`Изменить ширину столбца «${col.label}»`"
              @click.stop
              @pointerdown="onResizeStart($event, col)"
              @pointermove="onResizeMove"
              @pointerup="onResizeEnd"
              @pointercancel="onResizeEnd"
              @dblclick.stop="resetWidth(col)"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td
            v-for="col in COLUMNS"
            :key="col.key"
            :class="{
              'is-right': col.align === 'right',
              'is-muted': col.key === 'num',
              'is-preview': col.key === 'preview',
              'is-source': col.key === 'source',
            }"
            :title="col.key === 'preview' && row.fullText ? row.fullText : undefined"
          >
            <template v-if="col.key === 'source'">
              <a
                v-if="row.sourceUrl && row.sourceName !== '—'"
                :href="row.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                :title="row.sourceName"
              >
                {{ row.sourceName }}
              </a>
              <span v-else>{{ row.sourceName }}</span>
            </template>
            <template v-else>
              {{ cellValue(row, col.key) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.news-table {
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.news-table th,
.news-table td {
  position: relative;
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f5f8fc;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  user-select: none;
}

.is-sortable {
  cursor: pointer;
}

.is-sortable:hover .th-sort,
.is-sorted .th-sort {
  color: var(--text);
}

.is-sortable:hover .sort-icon:not(.is-active) {
  opacity: 0.72;
}

.th-sort {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  text-align: inherit;
  cursor: pointer;
}

.is-right .th-sort {
  flex-direction: row-reverse;
  margin-left: auto;
}

.th-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-icon {
  flex: 0 0 auto;
  display: inline-flex;
  opacity: 0.38;
  color: var(--text-muted);
  transition: opacity 0.15s ease, color 0.15s ease;
}

.sort-icon.is-active {
  opacity: 1;
  color: var(--accent);
}

.sort-icon__svg {
  display: block;
}

.sort-icon__up,
.sort-icon__down {
  opacity: 0.55;
  transition: opacity 0.15s ease;
}

.sort-icon.is-asc .sort-icon__up,
.sort-icon.is-desc .sort-icon__down {
  opacity: 1;
}

.sort-icon.is-asc .sort-icon__down,
.sort-icon.is-desc .sort-icon__up {
  opacity: 0.28;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  z-index: 2;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 3px;
  width: 2px;
  border-radius: 1px;
  background: transparent;
  transition: background 0.15s ease;
}

.resize-handle:hover::after,
.resize-handle:active::after {
  background: var(--accent);
}

.news-table tbody tr:last-child td {
  border-bottom: none;
}

.news-table tbody tr:hover td {
  background: color-mix(in srgb, var(--accent-soft) 45%, transparent);
}

.is-right {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}

.is-muted {
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.is-preview {
  line-height: 1.45;
  color: #243247;
  white-space: normal;
  word-break: break-word;
}

.is-source {
  white-space: normal;
  word-break: break-word;
  line-height: 1.35;
}

.news-table a {
  font-weight: 600;
  text-decoration: none;
  color: var(--accent);
}

.news-table a:hover {
  text-decoration: underline;
}

.muted {
  color: var(--text-muted);
}
</style>

<style>
body.col-resizing {
  cursor: col-resize !important;
  user-select: none !important;
}

body.col-resizing * {
  cursor: col-resize !important;
}
</style>
