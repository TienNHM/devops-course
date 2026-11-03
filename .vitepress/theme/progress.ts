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

export function nextSession(): number | null {
  for (let n = 1; n <= TOTAL_SESSIONS; n++) if (!isDone(n)) return n
  return null
}

export function sessionLink(n: number): string {
  const week = Math.ceil(n / 2)
  return `/labs/week-${pad(week)}/session-${pad(n)}`
}

// Phân tích đường dẫn bài học: /labs/week-07/session-13
export function parseLesson(path: string): { week: number; session: number } | null {
  const m = path.match(/\/labs\/week-(\d{2})\/session-(\d{2})(?:\.html)?\/?$/)
  if (!m) return null
  const week = Number(m[1])
  const session = Number(m[2])
  if (!week || !session) return null
  return { week, session }
}

export function checkKey(path: string, index: number): string {
  return `${CHECK_PREFIX}${path.replace(/\.html$/, '').replace(/\/$/, '')}#${index}`
}

// Hai lộ trình: Cơ bản (giai đoạn 1–3, tuần 1–10) và Nâng cao (giai đoạn 4–5, tuần 11–16)
export type TrackId = 'basic' | 'advanced'

export const TRACKS: Record<
  TrackId,
  { id: TrackId; name: string; weekRange: string; link: string; firstSession: number; lastSession: number }
> = {
  basic: { id: 'basic', name: 'Cơ bản', weekRange: 'Tuần 1–10', link: '/curriculum/basic', firstSession: 1, lastSession: 20 },
  advanced: { id: 'advanced', name: 'Nâng cao', weekRange: 'Tuần 11–16', link: '/curriculum/advanced', firstSession: 21, lastSession: 32 },
}

export const trackTotal = (id: TrackId) => TRACKS[id].lastSession - TRACKS[id].firstSession + 1

export function trackOfWeek(week: number): TrackId {
  return week <= 10 ? 'basic' : 'advanced'
}

export function trackDone(id: TrackId): number {
  const t = TRACKS[id]
  return doneSessions.value.filter((n) => n >= t.firstSession && n <= t.lastSession).length
}

// Trang nào thuộc lộ trình nào (để hiện bộ chuyển lộ trình ở sidebar); null nếu không thuộc lộ trình nào.
// Vibe Deploy là lộ trình riêng, không tính vào 32 buổi.
export type PathTrack = TrackId | 'vibe'

export function trackOfPath(path: string): PathTrack | null {
  let m = path.match(/\/(?:labs|assignments\/weekly)\/week-(\d{2})(?:\/|\.html|$)/)
  if (m) return trackOfWeek(Number(m[1]))
  m = path.match(/\/slides\/(\d{2})-/)
  if (m) return Number(m[1]) <= 4 ? 'basic' : 'advanced'
  if (/\/curriculum\/basic(?:\.html|\/|$)/.test(path)) return 'basic'
  if (/\/curriculum\/advanced(?:\.html|\/|$)/.test(path)) return 'advanced'
  if (/\/assignments\/capstone\//.test(path)) return 'advanced'
  if (/\/vibe(?:\/|$)/.test(path)) return 'vibe'
  return null
}
