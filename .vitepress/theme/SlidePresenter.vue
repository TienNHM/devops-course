<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { parseSlide, sessionLink } from './progress'

const route = useRoute()
const isSlidePage = computed(() => /\/slides\/[^/]+\/session-\d+(\.html)?$/.test(route.path))

// Slide cuối: gợi ý sang lab của buổi này
const labHref = computed(() => {
  const n = parseSlide(route.path)
  return n ? withBase(sessionLink(n)) : null
})

const open = ref(false)
const slides = ref<string[]>([])
const index = ref(0)
const stage = ref<HTMLElement | null>(null)
const current = computed(() => slides.value[index.value] ?? '')
const progress = computed(() => (slides.value.length > 1 ? (index.value / (slides.value.length - 1)) * 100 : 100))

// Chia nội dung trang tại các đường kẻ `---` (được render thành <hr>).
function collectSlides(): string[] {
  const root = document.querySelector('.vp-doc > div')
  if (!root) return []
  const groups: Element[][] = [[]]
  for (const el of Array.from(root.children)) {
    if (el.tagName === 'HR') groups.push([])
    else groups[groups.length - 1].push(el)
  }
  return groups
    .filter((g) => g.length)
    .map((g) => {
      const box = document.createElement('div')
      for (const el of g) box.appendChild(el.cloneNode(true))
      // Ghi chú cho mentor (::: details) chỉ hiện ở chế độ đọc, không hiện khi chiếu.
      box.querySelectorAll('.header-anchor, button.copy, .lang, details').forEach((n) => n.remove())
      // Giữ id của SVG: style của mermaid được gắn theo id đó.
      box.querySelectorAll('h1[id], h2[id], h3[id], h4[id]').forEach((n) => n.removeAttribute('id'))
      return box.innerHTML
    })
}

function start(at = 0) {
  slides.value = collectSlides()
  if (!slides.value.length) return
  index.value = Math.min(at, slides.value.length - 1)
  open.value = true
}

function go(delta: number) {
  index.value = Math.max(0, Math.min(slides.value.length - 1, index.value + delta))
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    /* trình duyệt không cho phép toàn màn hình: bỏ qua */
  }
}

function close() {
  open.value = false
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
}

function onKey(e: KeyboardEvent) {
  if (!open.value || e.ctrlKey || e.metaKey || e.altKey) return
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
    case 'Enter':
      go(1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
    case 'Backspace':
      go(-1)
      break
    case 'Home':
      index.value = 0
      break
    case 'End':
      index.value = slides.value.length - 1
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      return
    case 'Escape':
      close()
      return
    default:
      return
  }
  e.preventDefault()
}

let touchX = 0
function onTouchStart(e: TouchEvent) {
  touchX = e.changedTouches[0].clientX
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
}

watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) {
    window.addEventListener('keydown', onKey)
    nextTick(() => stage.value?.focus())
  } else {
    window.removeEventListener('keydown', onKey)
  }
})
watch(index, () => nextTick(() => stage.value?.scrollTo({ top: 0 })))
watch(() => route.path, () => (open.value = false))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div v-if="isSlidePage" class="present-bar">
    <button type="button" class="present-btn" @click="start(0)">&#9654; Trình chiếu</button>
    <span class="present-hint">Phím mũi tên để chuyển slide, F toàn màn hình, Esc để thoát.</span>
  </div>

  <Teleport to="body">
    <div
      v-if="open"
      class="present"
      role="dialog"
      aria-modal="true"
      aria-label="Chế độ trình chiếu"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="present-progress" aria-hidden="true"><span :style="{ width: progress + '%' }" /></div>
      <div ref="stage" class="present-stage" tabindex="-1">
        <div class="present-slide vp-doc" :class="{ first: index === 0 }" v-html="current" />
      </div>
      <div class="present-controls">
        <button type="button" :disabled="index === 0" aria-label="Slide trước" @click="go(-1)">&larr;</button>
        <span class="present-count">{{ index + 1 }} / {{ slides.length }}</span>
        <button type="button" :disabled="index === slides.length - 1" aria-label="Slide sau" @click="go(1)">&rarr;</button>
        <a v-if="labHref && index === slides.length - 1" class="to-lab" :href="labHref">Làm lab &rarr;</a>
        <button type="button" class="spacer" aria-label="Bật hoặc tắt toàn màn hình" @click="toggleFullscreen">&#x26F6;</button>
        <button type="button" aria-label="Thoát trình chiếu" @click="close">&#10005;</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.present-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin: 0 0 16px;
}
.present-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}
.present-btn:hover { background: var(--vp-button-brand-hover-bg); }
.present-hint { font-size: 12.5px; color: var(--vp-c-text-2); }

.present {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.present-progress { height: 4px; background: var(--vp-c-divider); }
.present-progress span {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.25s ease;
}
.present-stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  outline: none;
}
.present-slide {
  margin: auto;
  width: min(1200px, 100%);
  padding: clamp(20px, 4vw, 64px);
  font-size: clamp(18px, 2.3vw, 34px);
  line-height: 1.5;
}
.present-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.present-controls button {
  min-width: 40px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 16px;
  cursor: pointer;
}
.present-controls button:hover:not(:disabled) { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.present-controls button:disabled { opacity: 0.35; cursor: default; }
.present-controls .spacer { margin-left: auto; }
.present-controls .to-lab {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 18px;
  border-radius: 18px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  margin-left: 8px;
}
.present-controls .to-lab + .spacer { margin-left: 8px; }
.present-count { font-size: 14px; color: var(--vp-c-text-2); min-width: 64px; text-align: center; }

/* Nội dung slide: chữ lớn, thoáng, dễ đọc khi chiếu. */
.present-slide :deep(h1) {
  font-size: 1.9em;
  line-height: 1.25;
  border: 0;
  margin: 0 0 0.5em;
  letter-spacing: 0;
}
.present-slide.first :deep(h1) { font-size: 2.3em; margin-top: 0.4em; }
.present-slide :deep(h2) {
  font-size: 1.5em;
  line-height: 1.25;
  border: 0;
  margin: 0 0 0.7em;
  padding: 0;
  color: var(--vp-c-brand-1);
}
.present-slide :deep(p),
.present-slide :deep(li) { line-height: 1.5; }
.present-slide :deep(ul),
.present-slide :deep(ol) { margin: 0.5em 0; }
.present-slide :deep(li + li) { margin-top: 0.45em; }
.present-slide :deep(blockquote) { font-size: 0.85em; }
.present-slide :deep(code) { font-size: 0.85em; }
.present-slide :deep(div[class*='language-']) { font-size: 0.8em; margin: 0.8em 0; }
.present-slide :deep(table) { display: table; width: 100%; font-size: 0.8em; }
.present-slide :deep(th),
.present-slide :deep(td) { padding: 0.45em 0.8em; }
.present-slide :deep(.mermaid svg) { width: 100%; max-width: none !important; height: auto; max-height: 62vh; }
.present-slide :deep(svg) { max-height: 62vh; }
.present-slide :deep(.mermaid) { display: flex; justify-content: center; }
.present-slide :deep(img) { display: block; margin: 0.4em auto; max-width: 100%; max-height: 66vh; border-radius: 14px; }
</style>
