<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PAGE_SIZE, useNewsStore } from '@/stores/news'
import NewsTable from '@/components/NewsTable.vue'
import NewsPagination from '@/components/NewsPagination.vue'
import StateBlock from '@/components/StateBlock.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'

const store = useNewsStore()
const { items, newsLoading, newsError, page, totalPages, totalCount } = storeToRefs(store)

onMounted(() => {
  void store.init()
})
</script>

<template>
  <div class="page">
    <header class="page__header">
      <h1 class="page__title">Маркетинговые публикации ВКонтакте</h1>
      <p class="page__subtitle">
        Публикации из отслеживаемых сообществ с показателями вовлечённости
      </p>
    </header>

    <div class="page__meta" v-if="!newsError">
      <span v-if="!newsLoading">Найдено: {{ totalCount }}</span>
    </div>

    <StateBlock
      :loading="newsLoading"
      :error="newsError"
      :empty="!newsLoading && !newsError && items.length === 0"
      empty-text="Публикаций нет"
      @retry="store.retryNews()"
    >
      <div class="page__content">
        <NewsTable :items="items" :page="page" :page-size="PAGE_SIZE" />
        <NewsPagination
          :page="page"
          :page-count="totalPages"
          :disabled="newsLoading"
          @update:page="store.setPage($event)"
        />
      </div>
    </StateBlock>

    <ScrollTopButton />
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  margin: 0;
  padding: 28px 16px 72px;
  display: grid;
  gap: 18px;
}

.page__header {
  display: grid;
  gap: 8px;
}

.page__title {
  margin: 0;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.page__subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.4;
}

.page__meta {
  font-size: 0.9rem;
  color: var(--text-muted);
  min-height: 1.2em;
}

.page__content {
  position: relative;
  display: grid;
  gap: 16px;
  min-width: 0;
}

@media (max-width: 640px) {
  .page {
    padding: 18px 10px 72px;
  }
}
</style>
