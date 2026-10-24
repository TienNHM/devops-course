<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { doneSessions, loadProgress, weekDone, isDone } from './progress'

// Không hiển thị gì; gắn class "is-done" vào link bài/tuần đã xong trong sidebar.
let observer: MutationObserver | null = null
let scheduled = false

function mark() {
  scheduled = false
  if (typeof document === 'undefined') return
  document.querySelectorAll<HTMLAnchorElement>('.VPSidebar a.VPLink').forEach((a) => {
    let path = ''
    try {
      path = new URL(a.href, window.location.origin).pathname
    } catch {
      return
    }
    const m = path.match(/\/labs\/week-(\d{2})(?:\/(?:session-(\d{2})(?:\.html)?)?|\/README(?:\.html)?)?$/)
    let done = false
    if (m) {
      done = m[2] ? isDone(Number(m[2])) : weekDone(Number(m[1]))
    }
    a.classList.toggle('is-done', done)
  })
}

function schedule() {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(mark)
}

onMounted(() => {
  loadProgress()
  schedule()
  observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
})
onBeforeUnmount(() => observer?.disconnect())
watch(doneSessions, schedule, { deep: true })
</script>

<template>
  <span hidden />
</template>
