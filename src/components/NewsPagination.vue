<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NPagination } from 'naive-ui'

defineProps<{
  page: number
  pageCount: number
  disabled?: boolean
}>()

defineEmits<{
  'update:page': [page: number]
}>()

const pageSlot = ref(5)
const mediaQuery = window.matchMedia('(max-width: 640px)')

function syncPageSlot() {
  pageSlot.value = mediaQuery.matches ? 1 : 5
}

onMounted(() => {
  syncPageSlot()
  mediaQuery.addEventListener('change', syncPageSlot)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', syncPageSlot)
})
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination" aria-label="Пагинация">
    <NPagination
      :page="page"
      :page-count="pageCount"
      :disabled="disabled"
      :page-slot="pageSlot"
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
  -webkit-overflow-scrolling: touch;
}

.pagination :deep(.n-pagination) {
  flex-wrap: nowrap;
  justify-content: center;
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
  flex-shrink: 0;
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

@media (max-width: 640px) {
  .pagination :deep(.n-pagination) {
    column-gap: 4px;
  }

  .pagination :deep(.n-pagination-item),
  .pagination :deep(.n-pagination-item--button) {
    min-width: 40px;
    min-height: 40px;
  }
}
</style>
