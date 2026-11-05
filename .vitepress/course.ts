import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ADVANCED_STAGES, BASIC_STAGES, basicDay, slideOnly, type TrackId } from './tracks'
import { slideLink } from './deck'

// Cấu trúc khóa học: giai đoạn → tuần. Sidebar chỉ liệt kê tới cấp tuần (hub tuần),
// tầng Buổi nằm trong hub tuần. Tên tuần đọc từ dòng "# ..." của labs/week-XX/README.md.

export const rootDir = resolve(__dirname, '..')
export const labsDir = join(rootDir, 'labs')

export interface Week {
  n: number
  no: string // "07"
  name: string // "Docker Compose"
  title: string // "Tuần 07 · Docker Compose"
  link: string // "/labs/week-07/"
  sessions: number[] // [13, 14]
  sessionNames: string[] // ["Docker Compose", "Production-minded Compose"]
}

export interface Phase {
  no: number
  name: string // "Nền tảng"
  title: string // "Giai đoạn 1 · Nền tảng"
  focus: string
  weeks: Week[]
}

const phaseDefs = [
  { name: 'Nền tảng', focus: 'Linux, Terminal, Networking, Git và GitHub', weeks: [1, 3] },
  { name: 'Container', focus: 'Docker, Dockerfile, Image, Volume, Network, Compose', weeks: [4, 7] },
  { name: 'CI/CD', focus: 'GitHub Actions, GHCR, kiểm thử tự động, bảo mật pipeline', weeks: [8, 10] },
  { name: 'Kubernetes', focus: 'kind, kubectl, Workloads, Networking, Storage, xử lý sự cố', weeks: [11, 14] },
  { name: 'Capstone', focus: 'Hoàn thiện sản phẩm, kiểm thử, trình bày và bảo vệ kỹ thuật', weeks: [15, 16] },
]

const pad = (n: number) => String(n).padStart(2, '0')

// Tên buổi đọc từ dòng "# Buổi 13 – Docker Compose" của labs/week-XX/session-NN.md
function sessionName(s: number): string {
  const lab = join(labsDir, `week-${pad(Math.ceil(s / 2))}`, `session-${pad(s)}.md`)
  // Buổi không có trang lab (module tùy chọn): lấy tên từ tiêu đề của bộ slide
  const file = existsSync(lab) ? lab : join(rootDir, `${slideLink(s)}.md`)
  if (!existsSync(file)) return `Buổi ${pad(s)}`
  const h1 = readFileSync(file, 'utf8').match(/^# (.+)$/m)?.[1]
  return h1 ? h1.replace(/^(?:Slide )?(?:buổi|Buổi|Ngày) \d+\s*[–·:-]\s*/, '').trim() : `Buổi ${pad(s)}`
}

function week(n: number): Week {
  const id = `week-${pad(n)}`
  const file = join(labsDir, id, 'README.md')
  let name = id
  if (existsSync(file)) {
    const h1 = readFileSync(file, 'utf8').match(/^# (.+)$/m)?.[1]
    // "Tuần 07 – Docker Compose" hoặc "Tuần 07 · Docker Compose" → "Docker Compose"
    if (h1) name = h1.replace(/^Tuần \d+\s*[–·:-]\s*/, '').trim()
  }
  return {
    n,
    no: pad(n),
    name,
    title: `Tuần ${pad(n)} · ${name}`,
    link: `/labs/${id}/`,
    sessions: [2 * n - 1, 2 * n],
    sessionNames: [2 * n - 1, 2 * n].map(sessionName),
  }
}

export function courseTree(): Phase[] {
  return phaseDefs.map((p, i) => ({
    no: i + 1,
    name: p.name,
    title: `Giai đoạn ${i + 1} · ${p.name}`,
    focus: p.focus,
    weeks: Array.from({ length: p.weeks[1] - p.weeks[0] + 1 }, (_, k) => week(p.weeks[0] + k)),
  }))
}

// ---- Cây học theo hai lộ trình (Cơ bản 10 ngày, Nâng cao) ----
export type { TrackId }

export interface Lesson {
  n: number // số buổi 1–32 (giữ nguyên đường dẫn bài)
  day: number | null // ngày học 1–10 của lộ trình Cơ bản; null với Nâng cao
  slideOnly: boolean // true: chỉ có slide, không có trang lab
  title: string // "Dockerfile cho Club API"
  label: string // "Ngày 6 · Dockerfile cho Club API" hoặc "Buổi 17 · Automated Testing"
  slide: string // "/slides/02-docker/session-09"
  lab: string // "/labs/week-05/session-09"
}

export interface Stage {
  no: number
  title: string // "Giai đoạn 2 · Container" hoặc "Phần 3 · CI/CD nâng cao"
  name: string
  focus: string
  lessons: Lesson[]
}

export interface Track {
  id: TrackId
  name: string
  stages: Stage[]
}

function lesson(n: number): Lesson {
  const title = sessionName(n)
  const day = basicDay(n)
  return {
    n,
    day,
    slideOnly: slideOnly(n),
    title,
    label: day ? `Ngày ${day} · ${title}` : `Buổi ${pad(n)} · ${title}`,
    slide: slideLink(n),
    lab: `/labs/week-${pad(Math.ceil(n / 2))}/session-${pad(n)}`,
  }
}

export function courseTracks(): Track[] {
  const build = (id: TrackId, name: string, defs: { name: string; focus: string; sessions: number[] }[], prefix: string): Track => ({
    id,
    name,
    stages: defs.map((d, i) => ({
      no: i + 1,
      title: `${prefix} ${i + 1} · ${d.name}`,
      name: d.name,
      focus: d.focus,
      lessons: d.sessions.map(lesson),
    })),
  })
  return [build('basic', 'Cơ bản', BASIC_STAGES, 'Giai đoạn'), build('advanced', 'Nâng cao', ADVANCED_STAGES, 'Phần')]
}
