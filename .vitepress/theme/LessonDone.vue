<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { doneSessions, loadProgress, parseLesson, setDone, sessionLink, TOTAL_SESSIONS } from './progress'

const route = useRoute()
const lesson = computed(() => parseLesson(route.path))
const done = computed(() => !!lesson.value && doneSessions.value.includes(lesson.value.session))
const nextLink = computed(() =>
  lesson.value && lesson.value.session < TOTAL_SESSIONS ? withBase(sessionLink(lesson.value.session + 1)) : null,
)

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
    <a v-if="done && nextLink" class="next-link" :href="nextLink">Sang buổi tiếp theo &rarr;</a>
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
.note { flex-basis: 100%; margin: 0; font-size: 12.5px; color: var(--vp-c-text-2); }
</style>
