<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as phases } from './course.data'
import {
  TOTAL_SESSIONS,
  doneSessions,
  loadProgress,
  nextSession,
  pad,
  resetProgress,
  sessionLink,
} from './progress'

const count = computed(() => doneSessions.value.length)
const percent = computed(() => Math.round((count.value / TOTAL_SESSIONS) * 100))
const next = computed(() => {
  const n = doneSessions.value.length >= 0 ? nextSession() : null
  if (!n) return null
  const week = Math.ceil(n / 2)
  const w = phases.flatMap((p) => p.weeks).find((x) => x.n === week)
  return { n, label: `Buổi ${pad(n)}${w ? ' – ' + w.name : ''}`, link: sessionLink(n) }
})

onMounted(loadProgress)

function reset() {
  if (typeof window !== 'undefined' && window.confirm('Xóa toàn bộ tiến độ đã lưu trên trình duyệt này?')) {
    resetProgress()
  }
}
</script>

<template>
  <div class="home-start">
    <section class="block">
      <h2>Bạn là ai?</h2>
      <div class="who">
        <a class="who-card" :href="withBase('/curriculum/getting-started')">
          <strong>Mình mới học DevOps</strong>
          <span>Bắt đầu từ trang hướng dẫn: cần gì, học thế nào, làm gì đầu tiên.</span>
        </a>
        <a class="who-card" :href="withBase('/vibe/')">
          <strong>Mình đã biết lập trình / chỉ muốn đưa sản phẩm lên mạng nhanh</strong>
          <span>Đi đường tắt: đưa ứng dụng lên mạng trước, học sâu sau.</span>
        </a>
        <a class="who-card" :href="withBase('/mentors/')">
          <strong>Mình là mentor</strong>
          <span>Kịch bản buổi dạy, barem chấm và đáp án tham khảo.</span>
        </a>
      </div>
    </section>

    <section class="block">
      <h2>Học theo 3 bước</h2>
      <ol class="steps">
        <li>
          <span class="n">1</span>
          <div>
            <strong>Cài môi trường</strong>
            <p><a :href="withBase('/resources/setup-guide')">Hướng dẫn cài đặt</a>, làm một lần, khoảng 45 phút.</p>
          </div>
        </li>
        <li>
          <span class="n">2</span>
          <div>
            <strong>Làm Buổi 01</strong>
            <p>Đọc 15 phút, làm lab 60 phút theo từng phần có kiểm tra.</p>
          </div>
        </li>
        <li>
          <span class="n">3</span>
          <div>
            <strong>Nộp bài lên GitHub</strong>
            <p>Nộp lại bằng chứng của lab, không có việc mới.</p>
          </div>
        </li>
      </ol>
      <a class="button" :href="withBase('/labs/week-01/session-01')">Vào Buổi 01</a>
    </section>

    <section class="block progress">
      <div class="progress-text">
        <strong>Bạn đã hoàn thành {{ count }}/{{ TOTAL_SESSIONS }} buổi</strong>
        <div class="bar" role="progressbar" aria-valuemin="0" :aria-valuemax="TOTAL_SESSIONS" :aria-valuenow="count">
          <span class="fill" :style="{ width: percent + '%' }" />
        </div>
      </div>
      <div class="progress-actions">
        <a v-if="next && count > 0" class="button small" :href="withBase(next.link)">Học tiếp: {{ next.label }}</a>
        <span v-else-if="!next" class="done-all">Bạn đã hoàn thành cả khóa.</span>
        <button v-if="count > 0" type="button" class="reset" @click="reset">Xóa tiến độ</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-start { max-width: 1152px; margin: 0 auto; padding: 8px 24px 0; }
.block { margin-top: 40px; }
.home-start h2 {
  border-top: none;
  padding-top: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0 0 16px;
}
a { color: var(--vp-c-brand-1); font-weight: 500; text-decoration: none; }
a:hover { text-decoration: underline; }

.who { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.who-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 400;
  transition: border-color 0.2s;
}
.who-card:hover { border-color: var(--vp-c-brand-1); text-decoration: none; }
.who-card strong { font-size: 17px; line-height: 1.4; color: var(--vp-c-brand-1); }
.who-card span { font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); }

.steps { list-style: none; margin: 0 0 20px; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.steps li { display: flex; gap: 12px; margin: 0; align-items: flex-start; }
.n {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.steps p { margin: 2px 0 0; font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); }

.button {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 20px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: 600;
}
.button:hover { background: var(--vp-button-brand-hover-bg); text-decoration: none; }
.button.small { padding: 6px 16px; font-size: 14px; }

.progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}
.progress-text { flex: 1 1 260px; }
.bar { margin-top: 8px; height: 6px; border-radius: 3px; background: var(--vp-c-default-soft); overflow: hidden; }
.fill { display: block; height: 100%; background: var(--vp-c-brand-1); transition: width 0.3s; }
.progress-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.reset {
  background: none;
  border: none;
  padding: 4px 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}
.reset:hover { color: var(--vp-c-danger-1); }
.done-all { font-size: 14px; color: var(--vp-c-text-2); }

@media (max-width: 860px) {
  .who, .steps { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .home-start { padding: 0 16px; }
  .block { margin-top: 32px; }
  .home-start h2 { font-size: 22px; }
}
</style>
