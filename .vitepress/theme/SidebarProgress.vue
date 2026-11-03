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
    // Mục buổi (slide hoặc lab) đánh dấu theo buổi; tiêu đề tuần (nhóm gập có link) chỉ đánh dấu khi xong cả tuần
    const lab = path.match(/\/labs\/week-(\d{2})(?:\/(?:session-(\d{2})(?:\.html)?)?|\/README(?:\.html)?)?$/)
    const slide = path.match(/\/slides\/\d{2}-[a-z]+\/session-(\d{2})(?:\.html)?$/)
    const session = slide ? Number(slide[1]) : lab?.[2] ? Number(lab[2]) : null
    const isHeader = !!a.closest('.item')?.parentElement?.classList.contains('collapsible')
    let done = false
    if (session !== null) done = isHeader ? weekDone(Math.ceil(session / 2)) : isDone(session)
    else if (lab) done = weekDone(Number(lab[1]))
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
