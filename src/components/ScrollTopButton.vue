<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const visible = ref(false)
const SHOW_AFTER_PX = 320

function updateVisibility() {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateVisibility)
})
</script>

<template>
  <button
    v-show="visible"
    type="button"
    class="scroll-top"
    aria-label="Наверх"
    title="Наверх"
    @click="scrollTop"
  >
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4.5 4.5 12l1.4 1.4L11 8.3V19.5h2V8.3l5.1 5.1L19.5 12 12 4.5z"
      />
    </svg>
  </button>
</template>

<style scoped>
.scroll-top {
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 40;
  width: var(--touch-min);
  height: var(--touch-min);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--accent);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.scroll-top:hover {
  background: var(--accent-soft);
}

.scroll-top:active {
  transform: scale(0.96);
}

.scroll-top:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
