<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, withBase } from 'vitepress'
import {
  assignmentLink,
  basicDay,
  doneSessions,
  loadProgress,
  parseLesson,
  parseSlide,
  parseWeekHub,
  pad,
  sessionLink,
  slideLink,
  weekOfSession,
} from './progress'
import { data as tracks } from './course.data'

// Hiển thị đường học của một buổi: 1 Slide -> 2 Lab -> 3 Bài tập tuần.
// - Trang slide và trang lab của buổi: thanh 3 bước, bước hiện tại sáng lên.
// - Trang hub tuần: thẻ "Học theo thứ tự" cho 2 buổi của tuần.
// - Cuối trang slide: nút lớn "Làm lab".
const props = defineProps<{ mode: 'steps' | 'week' | 'next' }>()

const route = useRoute()
const slide = computed(() => parseSlide(route.path))
const lab = computed(() => parseLesson(route.path)?.session ?? null)
const session = computed(() => slide.value ?? lab.value)
const kind = computed(() => (slide.value ? 'slide' : lab.value ? 'lab' : null))
const hubWeek = computed(() => parseWeekHub(route.path))
const lessons = tracks.flatMap((t) => t.stages.flatMap((st) => st.lessons))
// Trang hub tuần (bản cũ): 2 buổi của tuần, tên lấy theo ngày học (Cơ bản) hoặc số buổi (Nâng cao)
const hub = computed(() => {
  const w = hubWeek.value
  if (!w) return null
  const sessions = [2 * w - 1, 2 * w]
  return {
    n: w,
    no: pad(w),
    sessions,
    names: sessions.map((s) => lessons.find((l) => l.n === s)?.label ?? `Buổi ${pad(s)}`),
  }
})
const done = (n: number) => doneSessions.value.includes(n)
// Cơ bản: nộp bài ngay cuối trang lab. Nâng cao: nộp theo bài tập tuần.
const isBasic = computed(() => (session.value ? basicDay(session.value) !== null : false))
const unitName = (n: number) => (basicDay(n) ? `Ngày ${basicDay(n)}` : `Buổi ${pad(n)}`)

onMounted(loadProgress)
</script>

<template>
  <!-- Thanh 3 bước trên trang slide và trang lab -->
  <nav v-if="props.mode === 'steps' && session && kind" class="steps" aria-label="Đường học của buổi này">
    <a class="step" :class="{ on: kind === 'slide' }" :href="withBase(slideLink(session))">
      <b>1</b><span>Xem slide</span>
    </a>
    <span class="arrow" aria-hidden="true">&rarr;</span>
    <a class="step" :class="{ on: kind === 'lab' }" :href="withBase(sessionLink(session))">
      <b>2</b><span>Làm lab</span>
    </a>
    <span class="arrow" aria-hidden="true">&rarr;</span>
    <a v-if="isBasic" class="step" :href="withBase(sessionLink(session) + '#nop-bai')">
      <b>3</b><span>Nộp bài</span>
    </a>
    <a v-else class="step" :href="withBase(assignmentLink(weekOfSession(session)))">
      <b>3</b><span>Nộp bài tập tuần</span>
    </a>
  </nav>

  <!-- Thẻ "Học theo thứ tự" ở đầu trang hub tuần -->
  <section v-else-if="props.mode === 'week' && hub" class="week">
    <h2>Học theo thứ tự</h2>
    <p class="hint">Mỗi buổi: xem slide để hiểu khái niệm, rồi làm lab để tự tay thực hành.</p>
    <div v-for="(s, i) in hub.sessions" :key="s" class="row">
      <div class="title">
        <span class="name">{{ hub.names[i] }}</span>
        <span v-if="done(s)" class="tick" title="Đã xong buổi này">&#10003; đã xong</span>
      </div>
      <div class="btns">
        <a class="btn primary" :href="withBase(slideLink(s))">1. Xem slide</a>
        <a class="btn" :href="withBase(sessionLink(s))">2. Làm lab</a>
      </div>
    </div>
    <p class="after">
      Cuối tuần: <a :href="withBase(assignmentLink(hub.n))">nộp bài tập tuần {{ hub.no }}</a>.
    </p>
  </section>

  <!-- Cuối trang slide: sang lab -->
  <section v-else-if="props.mode === 'next' && slide" class="next">
    <strong>Xong slide {{ unitName(slide) }}?</strong>
    <a class="btn primary" :href="withBase(sessionLink(slide))">Làm lab {{ unitName(slide) }} &rarr;</a>
  </section>
</template>

<style scoped>
.steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
}
.step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.step b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  background: var(--vp-c-default-soft);
}
.step:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.step.on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.step.on b { background: var(--vp-c-brand-1); color: var(--vp-button-brand-text); }
.arrow { color: var(--vp-c-text-3); }

.week {
  margin: 0 0 28px;
  padding: 18px 20px;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 14px;
  background: var(--vp-c-brand-soft);
}
.week h2 { margin: 0 0 4px; padding: 0; border: 0; font-size: 20px; line-height: 1.4; letter-spacing: 0; }
.hint { margin: 0 0 12px; font-size: 14px; color: var(--vp-c-text-2); }
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding: 12px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.title { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.no { font-size: 13px; font-weight: 700; color: var(--vp-c-brand-1); }
.name { font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); }
.tick { font-size: 13px; font-weight: 600; color: var(--vp-c-green-1); }
.btns { display: flex; flex-wrap: wrap; gap: 8px; }
.after { margin: 8px 0 0; font-size: 14px; color: var(--vp-c-text-2); }

.btn {
  display: inline-block;
  padding: 8px 18px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  text-decoration: none;
}
.btn:hover { background: var(--vp-c-brand-soft); }
.btn.primary { background: var(--vp-button-brand-bg); color: var(--vp-button-brand-text); }
.btn.primary:hover { background: var(--vp-button-brand-hover-bg); }

.next {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin: 32px 0 8px;
  padding: 18px 20px;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 14px;
  background: var(--vp-c-brand-soft);
}
</style>
