import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

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
