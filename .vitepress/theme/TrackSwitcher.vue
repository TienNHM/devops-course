<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { TRACKS, loadProgress, trackDone, trackOfPath, trackTotal, type PathTrack } from './progress'

const route = useRoute()
const current = computed<PathTrack | null>(() => trackOfPath(route.path))

const items = computed(() => [
  { id: 'basic' as const, name: 'Cơ bản', sub: TRACKS.basic.sub, link: TRACKS.basic.link, done: trackDone('basic'), total: trackTotal('basic'), unit: TRACKS.basic.unit },
  { id: 'advanced' as const, name: 'Nâng cao', sub: TRACKS.advanced.sub, link: TRACKS.advanced.link, done: trackDone('advanced'), total: trackTotal('advanced'), unit: TRACKS.advanced.unit },
  { id: 'vibe' as const, name: 'Vibe Deploy', sub: 'Lên mạng nhanh', link: '/vibe/', done: 0, total: 0, unit: '' },
])

onMounted(loadProgress)
</script>

<template>
  <nav v-if="current" class="tracks" aria-label="Chọn lộ trình">
    <p class="label">Lộ trình</p>
    <a
      v-for="t in items"
      :key="t.id"
      class="track"
      :class="{ on: t.id === current }"
      :href="withBase(t.link)"
      :aria-current="t.id === current ? 'page' : undefined"
    >
      <span class="name">{{ t.name }}</span>
      <span class="sub">{{ t.sub }}</span>
      <span v-if="t.total" class="sub">Đã xong {{ t.done }}/{{ t.total }} {{ t.unit }}</span>
    </a>
  </nav>
</template>

<style scoped>
.tracks {
  display: grid;
  gap: 6px;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.label {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.track {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.track:hover { border-color: var(--vp-c-brand-1); }
.track.on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.name { font-size: 14px; font-weight: 600; line-height: 1.5; }
.track.on .name { color: var(--vp-c-brand-1); }
.sub { font-size: 12.5px; color: var(--vp-c-text-2); line-height: 1.4; }
</style>
