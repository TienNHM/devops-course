import { ref } from 'vue'

// Tiến độ học: lưu trong localStorage, mọi truy cập đều bọc try/catch.
// Khi thiếu storage (chế độ riêng tư, bị chặn), trang vẫn render bình thường.

export const TOTAL_SESSIONS = 32
export const TOTAL_WEEKS = 16
const DONE_KEY = 'devops-course:done'
const CHECK_PREFIX = 'devops-course:chk:'

export const phaseNames = ['Nền tảng', 'Container', 'CI/CD', 'Kubernetes', 'Capstone']
const phaseRanges: [number, number][] = [
  [1, 3],
  [4, 7],
  [8, 10],
  [11, 14],
  [15, 16],
]

export function phaseOfWeek(week: number): number {
  const i = phaseRanges.findIndex(([a, b]) => week >= a && week <= b)
  return i < 0 ? 1 : i + 1
}

export const pad = (n: number) => String(n).padStart(2, '0')

export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* bỏ qua */
  }
}

export function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* bỏ qua */
  }
}

// Danh sách số buổi đã xong, dùng chung cho mọi component
export const doneSessions = ref<number[]>([])

export function loadProgress(): void {
  try {
    const raw = storageGet(DONE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    doneSessions.value = Array.isArray(arr)
      ? arr.filter((n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= TOTAL_SESSIONS)
      : []
  } catch {
    doneSessions.value = []
  }
}

function save(): void {
  storageSet(DONE_KEY, JSON.stringify(doneSessions.value))
}

export function isDone(n: number): boolean {
  return doneSessions.value.includes(n)
}

export function setDone(n: number, value: boolean): void {
  const set = new Set(doneSessions.value)
  if (value) set.add(n)
  else set.delete(n)
  doneSessions.value = [...set].sort((a, b) => a - b)
  save()
}

export function resetProgress(): void {
  doneSessions.value = []
  storageRemove(DONE_KEY)
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(CHECK_PREFIX)) keys.push(k)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* bỏ qua */
  }
}

export function weekDone(week: number): boolean {
  return isDone(2 * week - 1) && isDone(2 * week)
}

export function nextSession(track?: TrackId): number | null {
  const order = track ? TRACKS[track].sessions : [...BASIC_SESSIONS, ...ADVANCED_SESSIONS]
  return order.find((n) => !isDone(n)) ?? null
}

export function sessionLink(n: number): string {
  const week = Math.ceil(n / 2)
  return `/labs/week-${pad(week)}/session-${pad(n)}`
}

// Phân tích đường dẫn bài học: /labs/week-07/session-13
export function parseLesson(path: string): { week: number; session: number } | null {
  // Trang lab (/labs/week-07/session-13) hoặc trang slide (/slides/03-compose/session-13) của cùng một buổi
  const m = path.match(/\/(?:labs\/week-(\d{2})|slides\/\d{2}-[a-z]+)\/session-(\d{2})(?:\.html)?\/?$/)
  if (!m) return null
  const session = Number(m[2])
  const week = m[1] ? Number(m[1]) : Math.ceil(session / 2)
  if (!week || !session) return null
  return { week, session }
}

export function checkKey(path: string, index: number): string {
  return `${CHECK_PREFIX}${path.replace(/\.html$/, '').replace(/\/$/, '')}#${index}`
}

// Hai lộ trình: Cơ bản (10 ngày) và Nâng cao (22 buổi). Danh sách buổi nằm ở ../tracks.ts
import { ADVANCED_SESSIONS, BASIC_SESSIONS, basicDay, trackOfSession, type TrackId } from '../tracks'
export { ADVANCED_SESSIONS, BASIC_SESSIONS, basicDay, trackOfSession }
export type { TrackId }

export const TRACKS: Record<TrackId, { id: TrackId; name: string; sub: string; link: string; sessions: number[]; unit: string }> = {
  basic: { id: 'basic', name: 'Cơ bản', sub: '14 ngày, 2 giờ mỗi ngày', link: '/curriculum/basic', sessions: BASIC_SESSIONS, unit: 'ngày' },
  advanced: { id: 'advanced', name: 'Nâng cao', sub: 'Đào sâu, Kubernetes, Capstone', link: '/curriculum/advanced', sessions: ADVANCED_SESSIONS, unit: 'buổi' },
}

export const trackTotal = (id: TrackId) => TRACKS[id].sessions.length

export function trackDone(id: TrackId): number {
  return doneSessions.value.filter((n) => TRACKS[id].sessions.includes(n)).length
}

// Trang nào thuộc lộ trình nào (để hiện bộ chuyển lộ trình ở sidebar); null nếu không thuộc lộ trình nào.
// Vibe Deploy là lộ trình riêng, không tính vào 32 buổi.
export type PathTrack = TrackId | 'vibe'

export function trackOfPath(path: string): PathTrack | null {
  const m = path.match(/\/(?:labs\/week-\d{2}|slides\/\d{2}-[a-z]+)\/session-(\d{2})/)
  if (m) return trackOfSession(Number(m[1]))
  if (/\/curriculum\/basic(?:-wrapup)?(?:\.html|\/|$)/.test(path)) return 'basic'
  if (/\/curriculum\/advanced(?:\.html|\/|$)/.test(path)) return 'advanced'
  if (/\/assignments\/capstone\//.test(path)) return 'advanced'
  if (/\/vibe(?:\/|$)/.test(path)) return 'vibe'
  return null
}

// Học theo thứ tự: Slide (khái niệm) -> Lab (thực hành) -> Bài tập tuần
export { slideLink } from '../deck'

export const weekOfSession = (n: number) => Math.ceil(n / 2)
export const assignmentLink = (week: number) => `/assignments/weekly/week-${pad(week)}`

export function parseSlide(path: string): number | null {
  const m = path.match(/\/slides\/\d{2}-[a-z]+\/session-(\d{2})(?:\.html)?\/?$/)
  return m ? Number(m[1]) : null
}

// Trang hub tuần: /labs/week-07/
export function parseWeekHub(path: string): number | null {
  const m = path.match(/\/labs\/week-(\d{2})(?:\/|\/index(?:\.html)?)?$/)
  return m ? Number(m[1]) : null
}
