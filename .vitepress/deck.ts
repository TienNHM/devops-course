// Buổi nào nằm ở bộ slide nào. Module thuần (không dùng node:fs) để cả cấu hình site lẫn theme dùng chung.
const deckRanges: [string, number, number][] = [
  ['01-foundation', 1, 6],
  ['02-docker', 7, 12],
  ['03-compose', 13, 14],
  ['04-cicd', 15, 20],
  ['05-kubernetes', 21, 22],
  ['06-kubectl', 23, 25],
  ['07-operations', 26, 28],
  ['08-capstone', 29, 32],
]

export function slideLink(n: number): string {
  const dir = deckRanges.find(([, a, b]) => n >= a && n <= b)?.[0] ?? deckRanges[0][0]
  return `/slides/${dir}/session-${String(n).padStart(2, '0')}`
}
