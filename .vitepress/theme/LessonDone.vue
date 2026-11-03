<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, withBase } from 'vitepress'
import {
  ADVANCED_SESSIONS,
  BASIC_SESSIONS,
  doneSessions,
  loadProgress,
  parseLesson,
  setDone,
  slideLink,
  trackOfSession,
} from './progress'

const route = useRoute()
const lesson = computed(() => parseLesson(route.path))
const done = computed(() => !!lesson.value && doneSessions.value.includes(lesson.value.session))
// Buổi tiếp theo trong cùng lộ trình. Hết Ngày 10 của Cơ bản thì dẫn sang kế hoạch Ngày 11–14.
const order = computed(() => (lesson.value && trackOfSession(lesson.value.session) === 'basic' ? BASIC_SESSIONS : ADVANCED_SESSIONS))
const endOfBasic = computed(() => lesson.value?.session === BASIC_SESSIONS[BASIC_SESSIONS.length - 1])
const nextLink = computed(() => {
  if (!lesson.value) return null
  if (endOfBasic.value) return withBase('/curriculum/basic-wrapup')
  const i = order.value.indexOf(lesson.value.session)
  const next = i >= 0 ? order.value[i + 1] : undefined
  return next ? withBase(slideLink(next)) : null
})

onMounted(loadProgress)

function toggle() {
  if (lesson.value) setDone(lesson.value.session, !done.value)
}
</script>

<template>
  <div v-if="lesson" class="lesson-done">
    <button type="button" class="done-btn" :class="{ on: done }" :aria-pressed="done" @click="toggle">
      <span v-if="done" aria-hidden="true">&#10003; </span>{{ done ? 'Đã xong buổi này (bấm để bỏ)' : 'Đánh dấu đã xong' }}
    </button>
    <p v-if="done && endOfBasic" class="finish">Bạn đã xong 10 ngày học của Lộ trình Cơ bản.</p>
    <a v-if="done && nextLink" class="next-link" :href="nextLink">
      {{ endOfBasic ? 'Sang Ngày 11–14: hoàn thiện và demo' : 'Sang bài tiếp theo' }} &rarr;
    </a>
    <p class="note">Tiến độ chỉ lưu trên trình duyệt này.</p>
  </div>
</template>

<style scoped>
.lesson-done {
  margin: 40px 0 8px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}
.done-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}
.done-btn:hover { background: var(--vp-button-brand-hover-bg); }
.done-btn.on { background: transparent; color: var(--vp-c-brand-1); }
.next-link { font-weight: 500; font-size: 14px; }
.finish { flex-basis: 100%; margin: 0; font-weight: 600; color: var(--vp-c-green-1); }
.note { flex-basis: 100%; margin: 0; font-size: 12.5px; color: var(--vp-c-text-2); }
</style>
