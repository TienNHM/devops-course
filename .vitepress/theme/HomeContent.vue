<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as phases } from './course.data'

const sessionCount = phases.reduce((n, p) => n + p.weeks.reduce((k, w) => k + w.sessions.length, 0), 0)
const weekCount = phases.reduce((n, p) => n + p.weeks.length, 0)

const flow = [
  { step: 'Learn', text: 'Nắm khái niệm và kiến trúc qua demo ngắn của mentor, không học thuộc lệnh.' },
  { step: 'Build', text: 'Tự dựng Dockerfile, Compose, pipeline và manifest cho ứng dụng Club Management.' },
  { step: 'Break', text: 'Mentor cố tình tạo lỗi: port bận, mất dữ liệu, CrashLoopBackOff, ImagePullBackOff.' },
  { step: 'Debug', text: 'Chỉ có triệu chứng. Đọc log, describe, events để tìm nguyên nhân gốc.' },
  { step: 'Deploy', text: 'Đưa code từ máy lập trình tới môi trường giống production bằng pipeline tự động.' },
  { step: 'Explain', text: 'Giải thích vì sao chạy, vì sao lỗi và cách phòng tránh. Đây mới là đầu ra của khóa.' },
]
</script>

<template>
  <div class="home-content">
    <section class="section">
      <h2>Lộ trình 5 giai đoạn</h2>
      <p class="lead">
        {{ weekCount }} tuần, {{ sessionCount }} buổi, mỗi buổi 120 phút, mở đầu bằng Linux và Git, kết thúc bằng dự án nhóm
        chạy trên Kubernetes. Mỗi lab có hai mức: L1 hoàn thành theo hướng dẫn, L2 tự triển khai và xử lý lỗi. Xem
        <a :href="withBase('/curriculum/syllabus')">syllabus chi tiết</a> hoặc
        <a :href="withBase('/curriculum/schedule')">lịch học</a>.
      </p>
      <div class="stages">
        <div v-for="p in phases" :key="p.no" class="stage" :class="{ capstone: p.capstone }">
          <div class="stage-head">
            <span class="badge">Giai đoạn {{ p.no }}</span>
            <span v-if="p.capstone" class="tag">Dự án nhóm</span>
            <h3>{{ p.name }}</h3>
            <p class="focus">{{ p.focus }}</p>
          </div>
          <ul>
            <li v-for="w in p.weeks" :key="w.link">
              <a :href="withBase(w.link)">
                <span class="no">{{ w.no }}</span>
                <span class="name">{{ w.name }}</span>
                <span class="count">{{ w.sessions.length }} buổi</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Learn → Build → Break → Debug → Deploy → Explain</h2>
      <p class="lead">
        Không chỉ làm cho ứng dụng chạy được. Học viên phải biết tại sao nó chạy, tại sao nó lỗi và cách khắc phục.
      </p>
      <ol class="flow">
        <li v-for="(f, i) in flow" :key="f.step">
          <span class="step">{{ String(i + 1).padStart(2, '0') }}</span>
          <strong>{{ f.step }}</strong>
          <p>{{ f.text }}</p>
        </li>
      </ol>
    </section>

    <section class="section cta">
      <h2>Bắt đầu từ buổi đầu tiên</h2>
      <p class="lead">
        Chưa từng dùng Linux hay Git? Buổi 01 và 02 hướng dẫn từ DevOps là gì tới cài WSL2. Đã biết lập trình? Làm thêm mức L2 ở
        mỗi lab và chạy thử
        <a :href="withBase('/starter-project/')">starter project</a> ngay từ tuần đầu.
      </p>
      <a class="button" :href="withBase('/labs/week-01/session-01')">Vào buổi 01</a>
    </section>
  </div>
</template>

<style scoped>
.home-content {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 48px;
}
.section { margin-top: 80px; }
.home-content h2 {
  border-top: none;
  padding-top: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0 0 12px;
}
h3 { font-size: 17px; font-weight: 600; margin: 0; line-height: 1.4; color: var(--vp-c-text-1); }
.lead { color: var(--vp-c-text-2); max-width: 720px; margin: 0 0 28px; line-height: 1.7; }
a { color: var(--vp-c-brand-1); font-weight: 500; text-decoration: none; }
a:hover { text-decoration: underline; }
.home-content li { margin: 0; }

.stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.stage {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px 16px 12px;
  background: var(--vp-c-bg-soft);
}
.stage-head {
  padding: 0 4px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 8px;
}
.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 6px;
}
.tag {
  display: inline-block;
  margin-left: 8px;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
.focus { margin: 4px 0 0; font-size: 13px; line-height: 1.5; color: var(--vp-c-text-2); }
.stage.capstone { border-style: dashed; background: transparent; }
.stage ul { list-style: none; padding: 0; margin: 0; }
.stage li a {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 6px 4px;
  border-radius: 6px;
  color: var(--vp-c-text-1);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
}
.stage li a:hover { background: var(--vp-c-default-soft); text-decoration: none; color: var(--vp-c-brand-1); }
.no, .count {
  flex: none;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.name { flex: 1; }

.flow {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.flow li {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
}
.step { display: block; font-family: var(--vp-font-family-mono); font-size: 12px; font-weight: 600; color: var(--vp-c-text-3); margin-bottom: 6px; }
.flow strong { font-size: 16px; color: var(--vp-c-brand-1); }
.flow p { margin: 6px 0 0; font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); }

.cta {
  border-radius: 16px;
  padding: 48px 40px;
  background: var(--vp-c-brand-soft);
  text-align: center;
}
.cta .lead { margin: 0 auto 24px; }
.button {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 20px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: 600;
}
.button:hover { background: var(--vp-button-brand-hover-bg); text-decoration: none; }

@media (max-width: 960px) {
  .stages, .flow { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .home-content { padding: 0 16px 64px; }
  .section { margin-top: 56px; }
  .home-content h2 { font-size: 24px; }
  .stages, .flow { grid-template-columns: 1fr; }
  .cta { padding: 32px 20px; }
}
</style>
