<script setup lang="ts">
import { onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as tracks } from './course.data'
import { doneSessions, isDone, loadProgress } from './progress'

const meta = {
  basic: {
    title: 'Lộ trình Cơ bản',
    meta: '14 ngày · 2 giờ mỗi ngày',
    lead: 'Dành cho người mới bắt đầu. Mỗi ngày người học thực hiện một công việc trên cùng một dự án, từ máy trống đến image Docker được publish tự động. Lộ trình gồm 10 ngày học và 4 ngày sửa lỗi, hoàn thiện và demo.',
    link: '/curriculum/basic',
    cta: 'Xem kế hoạch 14 ngày',
  },
  advanced: {
    title: 'Lộ trình Nâng cao',
    meta: 'Sau khi xong Cơ bản',
    lead: 'Lộ trình đi sâu vào các nội dung tách khỏi Cơ bản (Linux, mạng, tối ưu image, kiểm thử và bảo mật pipeline), sau đó triển khai ứng dụng trên Kubernetes và thực hiện dự án cuối khóa theo nhóm.',
    link: '/curriculum/advanced',
    cta: 'Xem Lộ trình Nâng cao',
  },
} as const

onMounted(loadProgress)
</script>

<template>
  <div class="home-content">
    <section v-for="t in tracks" :key="t.id" class="section">
      <div class="group-head">
        <h2>{{ meta[t.id].title }}</h2>
        <span class="meta">{{ meta[t.id].meta }}</span>
      </div>
      <p class="lead">
        {{ meta[t.id].lead }} <a :href="withBase(meta[t.id].link)">{{ meta[t.id].cta }}</a>
      </p>
      <div class="stages" :class="t.id">
        <div v-for="st in t.stages" :key="st.no" class="stage">
          <div class="stage-head">
            <span class="badge">{{ st.title.split(' · ')[0] }}</span>
            <h3>{{ st.name }}</h3>
            <p class="focus">{{ st.focus }}</p>
          </div>
          <ul>
            <li v-for="l in st.lessons" :key="l.n">
              <a :href="withBase(l.slide)">
                <span class="no">{{ l.day ? 'N' + l.day : l.n }}</span>
                <span class="name">{{ l.title }}</span>
                <span v-if="doneSessions.length >= 0 && isDone(l.n)" class="tick" title="Đã xong">&#10003;</span>
              </a>
            </li>
          </ul>
        </div>
        <div v-if="t.id === 'basic'" class="stage wrap">
          <div class="stage-head">
            <span class="badge">Ngày 11–14</span>
            <h3>Hoàn thiện và demo</h3>
            <p class="focus">Sửa lỗi, dọn dự án, kiểm tra từ máy sạch và demo</p>
          </div>
          <ul>
            <li>
              <a :href="withBase('/curriculum/basic-wrapup')">
                <span class="no">N11–14</span>
                <span class="name">Kế hoạch 4 ngày cuối</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <p class="vibe-note">
      Lộ trình riêng dành cho nhu cầu đưa website lên Internet nhanh, không yêu cầu kiến thức Docker hay Kubernetes:
      <a :href="withBase('/vibe/')">Vibe Deploy</a>.
    </p>
  </div>
</template>

<style scoped>
.home-content { max-width: 1152px; margin: 0 auto; padding: 0 24px 48px; }
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
.lead { color: var(--vp-c-text-2); max-width: 760px; margin: 0 0 24px; line-height: 1.7; }
a { color: var(--vp-c-brand-1); font-weight: 500; text-decoration: none; }
a:hover { text-decoration: underline; }
.home-content li { margin: 0; }
.group-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 4px; }
.group-head h2 { margin: 0; }
.meta { font-size: 14px; font-weight: 600; color: var(--vp-c-text-2); }

.stages { display: grid; gap: 16px; }
.stages.basic { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stages.advanced { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.stage {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px 16px 12px;
  background: var(--vp-c-bg-soft);
}
.stage.wrap { border-style: dashed; background: transparent; }
.stage-head { padding: 0 4px 12px; border-bottom: 1px solid var(--vp-c-divider); margin-bottom: 8px; }
.badge { display: inline-block; font-size: 12px; font-weight: 600; color: var(--vp-c-brand-1); margin-bottom: 6px; }
.focus { margin: 4px 0 0; font-size: 13px; line-height: 1.5; color: var(--vp-c-text-2); }
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
.no { flex: none; min-width: 24px; font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-text-2); }
.name { flex: 1; }
.tick { flex: none; color: var(--vp-c-green-1); font-weight: 700; }
.vibe-note { margin: 40px 0 0; font-size: 15px; color: var(--vp-c-text-2); }

@media (max-width: 1100px) {
  .stages.basic { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stages.advanced { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .home-content { padding: 0 16px 64px; }
  .section { margin-top: 40px; }
  .home-content h2 { font-size: 22px; }
  .stages.basic, .stages.advanced { grid-template-columns: 1fr; }
}
</style>
