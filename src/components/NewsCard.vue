<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { NButton, NSpin } from 'naive-ui'
import type { NewsItem } from '@/types/news'
import { formatNewsDate, pickCoverImage, stripHtml, truncateText } from '@/utils/format'

const props = defineProps<{
  item: NewsItem
}>()

const expanded = ref(false)
const copied = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const plainDescription = computed(() => stripHtml(props.item.description || ''))
const preview = computed(() => truncateText(plainDescription.value, 500))
const cover = computed(() => pickCoverImage(props.item.media_files))
const dateLabel = computed(() => formatNewsDate(props.item.datetime_start))

const shownText = computed(() =>
  expanded.value || !preview.value.truncated ? plainDescription.value : preview.value.text,
)

watch(cover, () => {
  imageLoaded.value = false
  imageError.value = false
})

function onImageLoad(event: Event) {
  imageLoaded.value = true
  void event
}

function onImageError() {
  imageError.value = true
}

function onImageRef(el: unknown) {
  const img = el as HTMLImageElement | null
  if (img?.complete && img.naturalWidth > 0) {
    imageLoaded.value = true
  }
}

async function copyDescription() {
  const text = plainDescription.value
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

onUnmounted(() => {
  clearTimeout(copiedTimer)
})
</script>

<template>
  <article class="card">
    <header class="card__meta">
      <time class="card__date" :datetime="item.datetime_start">{{ dateLabel }}</time>
      <span class="card__district">{{ item.district }}</span>
    </header>

    <h2 class="card__title">{{ item.name }}</h2>

    <div v-if="cover && !imageError" class="card__media">
      <div v-if="!imageLoaded" class="card__media-placeholder" aria-hidden="true">
        <NSpin size="small" />
      </div>
      <img
        class="card__image"
        :class="{ 'card__image--ready': imageLoaded }"
        :src="cover"
        :alt="item.name"
        loading="lazy"
        :ref="onImageRef"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <p class="card__desc">{{ shownText }}</p>

    <div class="card__actions">
      <NButton
        v-if="preview.truncated"
        text
        type="primary"
        class="card__action"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Свернуть' : 'Ещё' }}
      </NButton>
      <NButton text type="primary" class="card__action" @click="copyDescription">
        {{ copied ? 'Скопировано' : 'Копировать' }}
      </NButton>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: grid;
  gap: 10px;
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.card__date {
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.card__district {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.card__title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.35;
  font-weight: 700;
}

.card__media {
  position: relative;
  width: min(420px, 100%);
  height: 240px;
  border-radius: 10px;
  background: var(--bg-accent);
  overflow: hidden;
}

.card__media-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card__image--ready {
  opacity: 1;
}

.card__desc {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
  color: #243247;
}

.card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
}

.card__action {
  font-weight: 600;
  min-height: var(--touch-min);
  min-width: var(--touch-min);
  padding: 10px 12px !important;
}

@media (max-width: 640px) {
  .card {
    padding: 14px;
  }

  .card__title {
    font-size: 1.05rem;
  }

  .card__media {
    width: min(330px, 100%);
    height: 210px;
  }
}
</style>
