// Đóng gói starter-project thành public/downloads/starter-project.zip để học viên không dùng git vẫn tải được.
// Chạy tự động trước docs:dev và docs:build. Bỏ qua node_modules, .env và file sinh ra.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { zipSync } from 'fflate'

const root = resolve(import.meta.dirname, '..')
const src = join(root, 'starter-project')
const skip = new Set(['node_modules', '.git', 'coverage'])
const files = {}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name) || name === '.env') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else files[`starter-project/${relative(src, p).split(sep).join('/')}`] = readFileSync(p)
  }
}
walk(src)

const out = join(root, 'public', 'downloads')
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'starter-project.zip'), zipSync(files, { level: 9 }))
console.log(`starter-project.zip: ${Object.keys(files).length} file`)
