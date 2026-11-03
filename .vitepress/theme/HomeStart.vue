<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as tracks } from './course.data'
import {
  TRACKS,
  TOTAL_SESSIONS,
  doneSessions,
  loadProgress,
  nextSession,
  pad,
  resetProgress,
  slideLink,
  trackDone,
  trackTotal,
} from './progress'

const count = computed(() => doneSessions.value.length)
const basic = computed(() => ({ done: trackDone('basic'), total: trackTotal('basic') }))
const advanced = computed(() => ({ done: trackDone('advanced'), total: trackTotal('advanced') }))
const pct = (d: number, t: number) => Math.round((d / t) * 100)
const lessons = tracks.flatMap((t) => t.stages.flatMap((st) => st.lessons))
const next = computed(() => {
  const n = doneSessions.value.length >= 0 ? nextSession() : null
  if (!n) return null
  const l = lessons.find((x) => x.n === n)
  return { n, label: l ? l.label : `Buổi ${pad(n)}`, link: slideLink(n) }
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
      <h2>Chọn lộ trình của bạn</h2>
      <div class="tracks">
        <a class="track basic" :href="withBase(TRACKS.basic.link)">
          <span class="tag start">Bắt đầu ở đây</span>
          <strong>Cơ bản</strong>
          <span class="range">14 ngày · 2 giờ mỗi ngày</span>
          <span class="desc">Một dự án làm xuyên suốt: Linux, Git, Docker, Compose và GitHub Actions. Ngày 10, ứng dụng của bạn tự được kiểm thử, đóng gói và đưa lên kho image.</span>
          <span class="who">Dành cho: người mới, chưa cần biết DevOps.</span>
        </a>
        <a class="track" :href="withBase(TRACKS.advanced.link)">
          <span class="tag">Sau khi xong Cơ bản</span>
          <strong>Nâng cao</strong>
          <span class="range">22 buổi · tự học theo phần</span>
          <span class="desc">Đào sâu Linux, mạng, tối ưu image, kiểm thử và bảo mật pipeline, rồi Kubernetes trên máy bạn (kind) và dự án cuối khóa theo nhóm.</span>
          <span class="who">Dành cho: người đã dùng được Docker, Compose và CI.</span>
        </a>
        <a class="track vibe" :href="withBase('/vibe/')">
          <span class="tag">Lộ trình riêng</span>
          <strong>Vibe Deploy</strong>
          <span class="range">Khoảng 3–4 giờ</span>
          <span class="desc">Đưa website lên mạng nhanh bằng hosting miễn phí và công cụ AI, không cần Docker hay Kubernetes.</span>
          <span class="who">Dành cho: ai chỉ muốn có link web mở được từ điện thoại.</span>
        </a>
      </div>
      <p class="who-note">
        Đã biết lập trình? Cứ học theo lộ trình và làm thêm mức L2 ở mỗi bài. Là mentor?
        <a :href="withBase('/mentors/')">Vào khu Mentor</a>.
      </p>
    </section>

    <section class="block">
      <h2>Bắt đầu Cơ bản trong 3 bước</h2>
      <ol class="steps">
        <li>
          <span class="n">1</span>
          <div>
            <strong>Cài môi trường</strong>
            <p>Làm <a :href="withBase('/curriculum/getting-started')">4 việc trước Ngày 1</a>, một lần, khoảng 20 phút.</p>
          </div>
        </li>
        <li>
          <span class="n">2</span>
          <div>
            <strong>Xem slide, rồi làm lab</strong>
            <p>Slide giúp hiểu khái niệm. Lab là phần tự tay làm, mỗi phần có bước tự kiểm tra.</p>
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
      <a class="button" :href="withBase(slideLink(2))">Bắt đầu Ngày 1: xem slide</a>
    </section>

    <section class="block progress">
      <div class="progress-text">
        <strong>Tiến độ của bạn: đã xong {{ count }} bài</strong>
        <div class="row">
          <span>Cơ bản {{ basic.done }}/{{ basic.total }} ngày</span>
          <div class="bar" role="progressbar" aria-valuemin="0" :aria-valuemax="basic.total" :aria-valuenow="basic.done">
            <span class="fill" :style="{ width: pct(basic.done, basic.total) + '%' }" />
          </div>
        </div>
        <div class="row">
          <span>Nâng cao {{ advanced.done }}/{{ advanced.total }} buổi</span>
          <div class="bar" role="progressbar" aria-valuemin="0" :aria-valuemax="advanced.total" :aria-valuenow="advanced.done">
            <span class="fill" :style="{ width: pct(advanced.done, advanced.total) + '%' }" />
          </div>
        </div>
      </div>
      <div class="progress-actions">
        <a v-if="next && count > 0" class="button small" :href="withBase(next.link)">Học tiếp: {{ next.label }}</a>
        <span v-else-if="!next" class="done-all">Bạn đã hoàn thành cả hai lộ trình.</span>
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

.tracks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.track {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 400;
  transition: border-color 0.2s, transform 0.2s;
}
.track:hover { border-color: var(--vp-c-brand-1); text-decoration: none; transform: translateY(-2px); }
.track.basic { border: 2px solid var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.track strong { font-size: 22px; line-height: 1.3; color: var(--vp-c-brand-1); }
.range { font-size: 13px; font-weight: 600; color: var(--vp-c-text-2); }
.desc { font-size: 15px; line-height: 1.6; color: var(--vp-c-text-1); }
.who { margin-top: auto; padding-top: 6px; font-size: 13.5px; line-height: 1.5; color: var(--vp-c-text-2); }
.tag {
  padding: 0 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
.tag.start { color: var(--vp-button-brand-text); background: var(--vp-c-brand-1); }

.who-note { margin: 16px 0 0; font-size: 14px; color: var(--vp-c-text-2); }
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
.progress-text { flex: 1 1 280px; }
.row { display: grid; grid-template-columns: 110px 1fr; align-items: center; gap: 12px; margin-top: 8px; font-size: 13.5px; color: var(--vp-c-text-2); }
.bar { height: 6px; border-radius: 3px; background: var(--vp-c-default-soft); overflow: hidden; }
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
  .tracks, .steps { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .home-start { padding: 0 16px; }
  .block { margin-top: 32px; }
  .home-start h2 { font-size: 22px; }
}
</style>
