<script setup lang="ts">
import { onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as phases } from './course.data'
import { loadProgress, weekDone } from './progress'

const sessionCount = phases.reduce((n, p) => n + p.weeks.reduce((k, w) => k + w.sessions.length, 0), 0)
const weekCount = phases.reduce((n, p) => n + p.weeks.length, 0)

onMounted(loadProgress)
</script>

<template>
  <div class="home-content">
    <section class="section">
      <h2>16 tuần, 5 giai đoạn</h2>
      <p class="lead">
        {{ weekCount }} tuần, {{ sessionCount }} buổi. Mỗi buổi: học khái niệm, tự dựng, cố tình làm hỏng rồi tự sửa. Bấm vào
        một tuần để xem các buổi của tuần đó, hoặc xem
        <a :href="withBase('/curriculum/syllabus')">lộ trình chi tiết</a>. Bắt đầu từ Giai đoạn 1.
      </p>
      <div class="stages">
        <div
          v-for="p in phases"
          :key="p.no"
          class="stage"
          :class="{ capstone: p.capstone, first: p.no === 1 }"
        >
          <div class="stage-head">
            <span class="badge">Giai đoạn {{ p.no }}</span>
            <span v-if="p.no === 1" class="tag start">Bắt đầu ở đây</span>
            <span v-if="p.capstone" class="tag">Dự án nhóm</span>
            <h3>{{ p.name }}</h3>
            <p class="focus">{{ p.focus }}</p>
          </div>
          <ul>
            <li v-for="w in p.weeks" :key="w.link">
              <a :href="withBase(w.link)">
                <span class="no">{{ w.no }}</span>
                <span class="name">{{ w.name }}</span>
                <span v-if="weekDone(w.n)" class="tick" title="Đã xong tuần này">&#10003;</span>
                <span class="count">{{ w.sessions.length }} buổi</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-content {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 48px;
}
.section { margin-top: 56px; }
.home-content h2 {
  border-top: none;
  padding-top: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0 0 12px;
}
h3 { font-size: 17px; font-weight: 600; margin: 0; line-height: 1.4; color: var(--vp-c-text-1); }
.lead { color: var(--vp-c-text-2); max-width: 720px; margin: 0 0 24px; line-height: 1.7; }
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
.stage.first {
  grid-column: 1 / -1;
  border: 2px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
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
.tag.start { color: var(--vp-button-brand-text); background: var(--vp-c-brand-1); }
.focus { margin: 4px 0 0; font-size: 13px; line-height: 1.5; color: var(--vp-c-text-2); }
.stage.capstone { border-style: dashed; background: transparent; }
.stage ul { list-style: none; padding: 0; margin: 0; }
.stage.first ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 12px; }
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
  color: var(--vp-c-text-2);
}
.name { flex: 1; }
.tick { flex: none; color: var(--vp-c-green-1); font-weight: 700; }

@media (max-width: 960px) {
  .stages { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .home-content { padding: 0 16px 64px; }
  .section { margin-top: 40px; }
  .home-content h2 { font-size: 22px; }
  .stages { grid-template-columns: 1fr; }
  .stage.first ul { grid-template-columns: 1fr; }
}
</style>
