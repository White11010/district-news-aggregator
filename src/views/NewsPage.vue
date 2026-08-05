<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import NewsFilters from '@/components/NewsFilters.vue'
import NewsList from '@/components/NewsList.vue'
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
      <h1 class="page__title">Новости районов Санкт-Петербурга</h1>
    </header>

    <NewsFilters />

    <div class="page__meta" v-if="!newsError">
      <span v-if="!newsLoading">Найдено: {{ totalCount }}</span>
    </div>

    <StateBlock
      :loading="newsLoading"
      :error="newsError"
      :empty="!newsLoading && !newsError && items.length === 0"
      @retry="store.retryNews()"
    >
      <div class="page__content">
        <NewsList :items="items" />
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
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 72px;
  display: grid;
  gap: 18px;
}

.page__header {
  display: grid;
  gap: 8px;
}

.page__title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.15rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
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
}

@media (max-width: 640px) {
  .page {
    width: min(100% - 20px, 920px);
    padding-top: 18px;
  }
}
</style>
