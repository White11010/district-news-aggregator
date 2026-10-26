<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import type { MarketingNewsItem } from '@/types/news'
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
}>()

type ColumnKey =
  | 'num'
  | 'link'
  | 'date'
  | 'time'
  | 'preview'
  | 'service'
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
}

const COLUMNS: ColumnDef[] = [
  { key: 'num', label: '№', minWidth: 48, defaultWidth: 56 },
  { key: 'link', label: 'Ссылка', minWidth: 100, defaultWidth: 160 },
  { key: 'date', label: 'Дата', minWidth: 90, defaultWidth: 110 },
  { key: 'time', label: 'Время', minWidth: 70, defaultWidth: 90 },
  { key: 'preview', label: 'Превью текста', minWidth: 160, defaultWidth: 360 },
  { key: 'service', label: 'Сервис', minWidth: 140, defaultWidth: 200 },
  { key: 'likes', label: 'Лайки', minWidth: 70, defaultWidth: 90, align: 'right' },
  { key: 'comments', label: 'Комментарии', minWidth: 90, defaultWidth: 120, align: 'right' },
  { key: 'reposts', label: 'Репосты', minWidth: 80, defaultWidth: 100, align: 'right' },
  { key: 'views', label: 'Просмотры', minWidth: 90, defaultWidth: 110, align: 'right' },
  { key: 'err', label: 'ERR', minWidth: 70, defaultWidth: 90, align: 'right' },
]

const STORAGE_KEY = 'marketing-table-col-widths-v2'

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
  url: string | null
  date: string
  time: string
  preview: string
  fullText: string
  service: string
  category: string
  likes: string
  comments: string
  reposts: string
  views: string
  err: string
}

const rows = computed<TableRow[]>(() =>
  props.items.map((item, i) => {
    const plain = stripHtml(item.text || '')
    const preview = truncateText(plain, 140)
    return {
      key: item.id || `${item.community_id}-${item.vk_post_id}-${i}`,
      num: (props.page - 1) * props.pageSize + i + 1,
      url: item.url?.trim() || null,
      date: formatDate(item.date),
      time: formatTime(item.time),
      preview: preview.text || '—',
      fullText: plain,
      service: item.community_name?.trim() || '—',
      category: item.community_category?.trim() || '',
      likes: formatCount(item.likes_count),
      comments: formatCount(item.comments_count),
      reposts: formatCount(item.reposts_count),
      views: formatCount(item.views_count),
      err: formatErr(item.err),
    }
  }),
)

function linkLabel(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\//, '')
    return path || 'VK'
  } catch {
    return 'Открыть'
  }
}

function cellValue(row: TableRow, key: ColumnKey): string {
  if (key === 'num') return String(row.num)
  if (key === 'link') return row.url || ''
  return row[key] as string
}

const resizing = ref<{
  key: ColumnKey
  startX: number
  startWidth: number
  minWidth: number
} | null>(null)

function onResizeStart(event: PointerEvent, col: ColumnDef) {
  event.preventDefault()
  event.stopPropagation()
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
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
    <table
      class="news-table"
      :style="{ width: '100%', minWidth: `${tableWidth}px` }"
    >
      <colgroup>
        <col v-for="col in COLUMNS" :key="col.key" :style="{ width: `${widths[col.key]}px` }" />
      </colgroup>
      <thead>
        <tr>
          <th
            v-for="col in COLUMNS"
            :key="col.key"
            :class="{ 'is-right': col.align === 'right' }"
            :style="{ width: `${widths[col.key]}px` }"
          >
            <span class="th-label">{{ col.label }}</span>
            <span
              class="resize-handle"
              role="separator"
              aria-orientation="vertical"
              :aria-label="`Изменить ширину столбца «${col.label}»`"
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
            }"
            :title="col.key === 'preview' && row.fullText ? row.fullText : undefined"
          >
            <template v-if="col.key === 'link'">
              <a
                v-if="row.url"
                :href="row.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="row.url"
              >
                {{ linkLabel(row.url) }}
              </a>
              <span v-else class="muted">—</span>
            </template>
            <template v-else-if="col.key === 'service'">
              <div class="service">
                <span class="service__name">{{ row.service }}</span>
                <span v-if="row.category" class="service__category">{{ row.category }}</span>
              </div>
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

.th-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 6px;
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

.news-table a {
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.news-table a:hover {
  text-decoration: underline;
}

.service {
  display: grid;
  gap: 2px;
}

.service__name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service__category {
  font-size: 0.8rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.muted {
  color: var(--text-muted);
}
</style>

<style>
/* Global while dragging so cursor stays correct over all elements */
body.col-resizing {
  cursor: col-resize !important;
  user-select: none !important;
}

body.col-resizing * {
  cursor: col-resize !important;
}
</style>
