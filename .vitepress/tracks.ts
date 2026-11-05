// Hai lộ trình theo buổi học. Module thuần (không dùng node:fs) để cấu hình site lẫn theme dùng chung.
// Số buổi (1–34) và đường dẫn bài giữ nguyên; chỉ đổi cách gom nhóm.
export type TrackId = 'basic' | 'advanced'

// Cơ bản: 10 ngày học, mỗi ngày một buổi 2 giờ, theo đúng thứ tự học. Ngày 11–14 dành cho sửa lỗi, hoàn thiện và demo.
export const BASIC_STAGES = [
  { name: 'Nền tảng', focus: 'Môi trường, Linux và Git trên chính dự án', sessions: [2, 3, 6] },
  { name: 'Container', focus: 'Docker, Dockerfile, volume và Compose cho Club app', sessions: [7, 8, 9, 12, 13] },
  { name: 'CI/CD', focus: 'GitHub Actions kiểm thử và đưa image lên GHCR', sessions: [16, 18] },
]
export const BASIC_SESSIONS = BASIC_STAGES.flatMap((s) => s.sessions)

// Nâng cao: phần được chuyển từ Cơ bản (đào sâu), rồi Kubernetes và Capstone.
export const ADVANCED_STAGES = [
  { name: 'Nền tảng nâng cao', focus: 'Tổng quan DevOps, quản trị Linux, mạng', sessions: [1, 4, 5] },
  { name: 'Container nâng cao', focus: 'Tối ưu image, mạng container, Compose cho vận hành', sessions: [10, 11, 14] },
  { name: 'CI/CD nâng cao', focus: 'Kiểm thử tự động, triển khai, bảo mật pipeline', sessions: [15, 17, 19, 20] },
  { name: 'Kubernetes', focus: 'kind, kubectl, Workloads, Networking, Storage, xử lý sự cố', sessions: [21, 22, 23, 24, 25, 26, 27, 28] },
  { name: 'Capstone', focus: 'Dự án nhóm: hoàn thiện, kiểm thử, demo và bảo vệ kỹ thuật', sessions: [29, 30, 31, 32] },
  { name: 'Cloud và IaC (tùy chọn)', focus: 'AWS cục bộ với floci, Terraform và kiểm thử tích hợp', sessions: [33, 34] },
]
export const ADVANCED_SESSIONS = ADVANCED_STAGES.flatMap((s) => s.sessions)

// Buổi chỉ học bằng slide, không có trang lab: các ngày của Cơ bản và module tùy chọn Cloud và IaC (buổi 33–34)
export const SLIDE_ONLY_SESSIONS = [...BASIC_SESSIONS, 33, 34]
export const slideOnly = (n: number): boolean => SLIDE_ONLY_SESSIONS.includes(n)
export const TOTAL_SESSIONS = BASIC_SESSIONS.length + ADVANCED_SESSIONS.length

export const trackOfSession = (n: number): TrackId => (BASIC_SESSIONS.includes(n) ? 'basic' : 'advanced')
// Ngày học của buổi (1–10) trong lộ trình Cơ bản; null nếu buổi thuộc Nâng cao
export const basicDay = (n: number): number | null => {
  const i = BASIC_SESSIONS.indexOf(n)
  return i < 0 ? null : i + 1
}
