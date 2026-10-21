import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Cấu trúc khóa học đọc thẳng từ labs/: giai đoạn → tuần → buổi.
// Tiêu đề lấy từ dòng "# ..." đầu tiên của mỗi file.

export const labsDir = resolve(__dirname, '../labs')

export interface Page {
  title: string
  link: string
}

export interface Week extends Page {
  no: string
  name: string
  sessions: Page[]
}

export interface Phase {
  no: number
  name: string
  focus: string
  weeks: Week[]
  capstone: boolean
}

const phaseDefs = [
  { name: 'Engineering Foundation', focus: 'Linux, Terminal, Networking, Git và GitHub', weeks: [1, 3] },
  { name: 'Containerization', focus: 'Docker, Dockerfile, Image, Volume, Network, Compose', weeks: [4, 7] },
  { name: 'CI/CD & Automation', focus: 'GitHub Actions, GHCR, automated testing, pipeline security', weeks: [8, 10] },
  { name: 'Kubernetes Engineering', focus: 'kind, kubectl, Workloads, Networking, Storage, Troubleshooting', weeks: [11, 14] },
  { name: 'Capstone Project', focus: 'Hoàn thiện sản phẩm, kiểm thử, trình bày và bảo vệ kỹ thuật', weeks: [15, 16] },
]

const heading = (file: string, fallback: string) =>
  readFileSync(file, 'utf8').match(/^# (.+)$/m)?.[1] ?? fallback

function week(n: number): Week {
  const id = `week-${String(n).padStart(2, '0')}`
  const dir = join(labsDir, id)
  const title = heading(join(dir, 'README.md'), id)
  return {
    no: String(n).padStart(2, '0'),
    // "Tuần 07 – Docker Compose" → "Docker Compose"
    name: title.replace(/^Tuần \d+\s+[–-]\s+/, ''),
    title,
    link: `/labs/${id}/`,
    sessions: readdirSync(dir)
      .filter((f) => /^session-\d+\.md$/.test(f))
      .sort()
      .map((f) => ({ title: heading(join(dir, f), f), link: `/labs/${id}/${f.replace(/\.md$/, '')}` })),
  }
}

export function courseTree(): Phase[] {
  return phaseDefs.map((p, i) => ({
    no: i + 1,
    name: p.name,
    focus: p.focus,
    capstone: i === phaseDefs.length - 1,
    weeks: Array.from({ length: p.weeks[1] - p.weeks[0] + 1 }, (_, k) => week(p.weeks[0] + k)),
  }))
}
