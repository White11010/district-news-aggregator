<script setup lang="ts">
import { computed } from 'vue'
import { NTag, NButton, NSelect, NSpace } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'

const store = useNewsStore()
const {
  period,
  selectedDistrict,
  districts,
  districtsLoading,
  districtsError,
  isAllDistricts,
} = storeToRefs(store)

const periodOptions = [
  { label: '1 день', value: 1 },
  { label: '2 дня', value: 2 },
  { label: '3 дня', value: 3 },
]

const showReset = computed(() => !isAllDistricts.value)

function onPeriodUpdate(value: number) {
  store.setPeriod(value)
}
</script>

<template>
  <section class="filters" aria-label="Фильтры">
    <div class="filters__row">
      <label class="filters__label" for="period-select">Период</label>
      <NSelect
        id="period-select"
        class="filters__period"
        size="large"
        :value="period"
        :options="periodOptions"
        :consistent-menu-width="false"
        @update:value="onPeriodUpdate"
      />
    </div>

    <div class="filters__districts">
      <div class="filters__districts-head">
        <div class="filters__label">Районы</div>
        <NButton
          v-if="showReset"
          class="filters__reset"
          quaternary
          type="primary"
          size="large"
          @click="store.resetDistrictFilter()"
        >
          Сбросить фильтр
        </NButton>
      </div>

      <div v-if="districtsLoading" class="filters__hint">Загрузка районов…</div>

      <div v-else-if="districtsError" class="filters__error">
        <span>{{ districtsError }}</span>
        <NButton class="touch-target" type="primary" secondary @click="store.retryDistricts()">
          Повторить
        </NButton>
      </div>

      <NSpace v-else :size="10" :wrap="true">
        <NTag
          :type="isAllDistricts ? 'primary' : 'default'"
          :bordered="!isAllDistricts"
          round
          size="large"
          class="filters__chip"
          role="button"
          tabindex="0"
          @click="store.selectAllDistricts()"
          @keydown.enter.prevent="store.selectAllDistricts()"
        >
          Все
        </NTag>
        <NTag
          v-for="name in districts"
          :key="name"
          :type="selectedDistrict === name ? 'primary' : 'default'"
          :bordered="selectedDistrict !== name"
          round
          size="large"
          class="filters__chip"
          role="button"
          tabindex="0"
          @click="store.selectDistrict(name)"
          @keydown.enter.prevent="store.selectDistrict(name)"
        >
          {{ name }}
        </NTag>
      </NSpace>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 16px;
  padding: 16px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.filters__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.filters__period {
  width: 160px;
  min-height: var(--touch-min);
}

.filters__period :deep(.n-base-selection) {
  min-height: var(--touch-min);
}

.filters__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.filters__districts {
  display: grid;
  gap: 12px;
}

.filters__districts-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-height: var(--touch-min);
}

.filters__reset {
  min-height: var(--touch-min);
  padding-inline: 14px;
}

.filters__hint,
.filters__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.filters__chip {
  cursor: pointer;
  user-select: none;
  min-height: var(--touch-min);
  padding: 10px 16px !important;
  font-size: 0.95rem !important;
  display: inline-flex !important;
  align-items: center;
}

@media (max-width: 640px) {
  .filters {
    padding: 14px;
    border-radius: 12px;
  }

  .filters__period {
    width: 100%;
    max-width: 220px;
  }
}
</style>
