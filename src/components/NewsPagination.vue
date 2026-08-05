<script setup lang="ts">
import { NPagination } from 'naive-ui'

defineProps<{
  page: number
  pageCount: number
  disabled?: boolean
}>()

defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination" aria-label="Пагинация">
    <NPagination
      :page="page"
      :page-count="pageCount"
      :disabled="disabled"
      :page-slot="5"
      size="large"
      @update:page="$emit('update:page', $event)"
    />
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
  overflow-x: auto;
}

.pagination :deep(.n-pagination) {
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 10px;
  column-gap: 6px;
}

.pagination :deep(.n-pagination-item),
.pagination :deep(.n-pagination-item--button) {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px solid var(--border) !important;
  border-radius: 10px !important;
  background: var(--surface) !important;
  color: var(--text) !important;
  font-weight: 600;
}

.pagination :deep(.n-pagination-item:hover) {
  background: var(--accent-soft) !important;
  border-color: var(--accent) !important;
  color: var(--accent) !important;
}

.pagination :deep(.n-pagination-item--active) {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  color: #fff !important;
  font-weight: 700;
}

.pagination :deep(.n-pagination-item--disabled) {
  opacity: 0.45;
}
</style>
