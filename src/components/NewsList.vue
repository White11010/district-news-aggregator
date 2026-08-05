<script setup lang="ts">
import type { NewsItem } from '@/types/news'
import NewsCard from './NewsCard.vue'

defineProps<{
  items: NewsItem[]
}>()
</script>

<template>
  <div class="list">
    <NewsCard v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>

<style scoped>
.list {
  display: grid;
  gap: 14px;
}
</style>
