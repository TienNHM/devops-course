<script setup lang="ts">
import { computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, withBase, onContentUpdated } from 'vitepress'
import {
  TOTAL_SESSIONS,
  doneSessions,
  loadProgress,
  parseLesson,
  phaseNames,
  phaseOfWeek,
  pad,
  checkKey,
  storageGet,
  storageSet,
} from './progress'

const route = useRoute()
const lesson = computed(() => parseLesson(route.path))
const done = computed(() => !!lesson.value && doneSessions.value.includes(lesson.value.session))
const count = computed(() => doneSessions.value.length)
const percent = computed(() => Math.round((count.value / TOTAL_SESSIONS) * 100))
const phase = computed(() => (lesson.value ? phaseOfWeek(lesson.value.week) : 1))

// Gắn nhãn cho các khối đặc biệt và lưu trạng thái checkbox theo trang
function enhanceDoc() {
  if (typeof document === 'undefined') return
  const root = document.querySelector('.vp-doc')
  if (!root) return

  root.querySelectorAll('.custom-block').forEach((el) => {
    const title = el.querySelector('.custom-block-title')?.textContent?.trim() ?? ''
    if (/^Buổi này bạn làm gì/i.test(title)) el.classList.add('lesson-intro')
    if (/^Dành cho mentor/i.test(title)) el.classList.add('mentor-banner')
  })

  if (route.path.includes('/slides/')) {
    root.querySelectorAll('details').forEach((el) => {
      const t = el.querySelector('summary')?.textContent?.trim() ?? ''
      if (/^Ghi chú giảng viên/i.test(t)) el.classList.add('instructor-note')
    })
  }

  if (!lesson.value) return
  const path = route.path
  const boxes = root.querySelectorAll<HTMLInputElement>('li input[type="checkbox"]')
  boxes.forEach((box, i) => {
    if (box.dataset.progressBound === path) return
    box.dataset.progressBound = path
    box.disabled = false
    const key = checkKey(path, i)
    if (storageGet(key) === '1') box.checked = true
    box.addEventListener('change', () => storageSet(key, box.checked ? '1' : '0'))
  })
}

onMounted(() => {
  loadProgress()
  nextTick(enhanceDoc)
})
watch(
  () => route.path,
  () => nextTick(enhanceDoc),
)
onContentUpdated(() => nextTick(enhanceDoc))
</script>

<template>
  <div v-if="lesson" class="lesson-progress">
    <nav class="crumbs" aria-label="Vị trí bài học">
      <a :href="withBase('/curriculum/syllabus')">Học 16 tuần</a>
      <span class="sep">&rsaquo;</span>
      <span>Giai đoạn {{ phase }} · {{ phaseNames[phase - 1] }}</span>
      <span class="sep">&rsaquo;</span>
      <a :href="withBase(`/labs/week-${pad(lesson.week)}/`)">Tuần {{ lesson.week }}</a>
    </nav>
    <div class="badge-row">
      <span class="lp-badge" :class="{ done }">
        <span v-if="done" class="tick" aria-hidden="true">&#10003;</span>
        Tuần {{ lesson.week }}/16 · Buổi {{ pad(lesson.session) }}/32
        <span v-if="done" class="sr-only">(đã xong)</span>
      </span>
      <span class="lp-count">Đã xong {{ count }}/{{ TOTAL_SESSIONS }} buổi</span>
    </div>
    <div class="bar" role="progressbar" aria-valuemin="0" :aria-valuemax="TOTAL_SESSIONS" :aria-valuenow="count">
      <span class="fill" :style="{ width: percent + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.lesson-progress { margin: 0 0 20px; }
.crumbs { font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 8px; }
.crumbs a { color: var(--vp-c-text-2); text-decoration: none; }
.crumbs a:hover { color: var(--vp-c-brand-1); text-decoration: underline; }
.sep { margin: 0 6px; color: var(--vp-c-text-3); }
.badge-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 8px; }
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.lp-badge.done { color: var(--vp-c-green-1); background: var(--vp-c-green-soft); }
.lp-count { font-size: 12.5px; color: var(--vp-c-text-2); }
.bar { height: 4px; border-radius: 2px; background: var(--vp-c-default-soft); overflow: hidden; }
.fill { display: block; height: 100%; background: var(--vp-c-brand-1); transition: width 0.3s; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
