<script setup lang="ts">
import { onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as phases } from './course.data'
import { loadProgress, weekDone } from './progress'

const basicPhases = phases.filter((p) => p.track === 'basic')
const advancedPhases = phases.filter((p) => p.track === 'advanced')
const groups = [
  {
    id: 'basic',
    title: 'Lộ trình Cơ bản',
    meta: 'Tuần 1–10 · 20 buổi',
    lead: 'Dành cho người mới. Học Linux, Git, Docker, Compose và GitHub Actions, rồi tự động hóa việc kiểm thử và đóng gói ứng dụng.',
    link: '/curriculum/basic',
    cta: 'Xem Lộ trình Cơ bản',
    phases: basicPhases,
  },
  {
    id: 'advanced',
    title: 'Lộ trình Nâng cao',
    meta: 'Tuần 11–16 · 12 buổi',
    lead: 'Học sau Cơ bản. Chạy ứng dụng trên Kubernetes, rồi làm dự án cuối khóa theo nhóm.',
    link: '/curriculum/advanced',
    cta: 'Xem Lộ trình Nâng cao',
    phases: advancedPhases,
  },
]

onMounted(loadProgress)
</script>

<template>
  <div class="home-content">
    <section v-for="g in groups" :key="g.id" class="section">
      <div class="group-head">
        <h2>{{ g.title }}</h2>
        <span class="meta">{{ g.meta }}</span>
      </div>
      <p class="lead">
        {{ g.lead }} <a :href="withBase(g.link)">{{ g.cta }}</a>
      </p>
      <div class="stages" :class="'n' + g.phases.length">
        <div v-for="p in g.phases" :key="p.no" class="stage" :class="{ capstone: p.capstone }">
          <div class="stage-head">
            <span class="badge">Giai đoạn {{ p.no }}</span>
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
    <p class="vibe-note">
      Chỉ muốn đưa web lên mạng nhanh? Có lộ trình riêng, không cần học Docker hay Kubernetes:
      <a :href="withBase('/vibe/')">Vibe Deploy</a>.
    </p>
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
.stages.n2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.group-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 4px; }
.group-head h2 { margin: 0; }
.meta { font-size: 14px; font-weight: 600; color: var(--vp-c-text-2); }
.vibe-note { margin: 40px 0 0; font-size: 15px; color: var(--vp-c-text-2); }
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
.tag.start { color: var(--vp-button-brand-text); background: var(--vp-c-brand-1); }
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
  color: var(--vp-c-text-2);
}
.name { flex: 1; }
.tick { flex: none; color: var(--vp-c-green-1); font-weight: 700; }

@media (max-width: 960px) {
  .stages, .stages.n2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .home-content { padding: 0 16px 64px; }
  .section { margin-top: 40px; }
  .home-content h2 { font-size: 22px; }
  .stages, .stages.n2 { grid-template-columns: 1fr; }
}
</style>
