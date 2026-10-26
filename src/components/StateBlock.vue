<script setup lang="ts">
import { NAlert, NButton, NSpin } from 'naive-ui'

defineProps<{
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyText?: string
  loadingText?: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="state-block">
    <div v-if="loading" class="state-block__loading">
      <NSpin size="large" />
      <p>{{ loadingText || 'Загружаем публикации…' }}</p>
    </div>

    <NAlert v-else-if="error" type="error" title="Не удалось загрузить данные" :bordered="false">
      <p class="state-block__error-text">{{ error }}</p>
      <NButton
        class="touch-target state-block__retry"
        type="primary"
        secondary
        size="large"
        @click="$emit('retry')"
      >
        Повторить
      </NButton>
    </NAlert>

    <div v-else-if="empty" class="state-block__empty">
      <p>{{ emptyText || 'Публикаций не найдено' }}</p>
    </div>

    <slot v-else />
  </div>
</template>

<style scoped>
.state-block__loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 16px;
  color: var(--text-muted);
}

.state-block__error-text {
  margin: 0 0 12px;
}

.state-block__retry {
  min-height: var(--touch-min);
  padding-inline: 18px;
}

.state-block__empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}
</style>
