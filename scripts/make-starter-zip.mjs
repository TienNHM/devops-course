// Đóng gói các gói tải về vào public/downloads/ để học viên không dùng git vẫn lấy được file:
//   starter-project.zip      (từ starter-project)
//   vibe-static-site.zip     (từ examples/vibe/static-site, dùng ở bài vibe 02 và 09)
//   vibe-club-landing.zip    (từ examples/vibe/club-landing, dùng ở bài vibe 09)
// Chạy tự động trước docs:dev và docs:build. Bỏ qua node_modules, .env, config.js thật và file sinh ra.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { zipSync } from 'fflate'

const root = resolve(import.meta.dirname, '..')
const skip = new Set(['node_modules', '.git', 'coverage', 'dist'])
// File chứa khóa thật hoặc file sinh ra: không bao giờ đưa vào gói tải về.
const skipFiles = new Set(['.env', 'config.js'])

function collect(srcDir, prefix) {
  const files = {}
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (skip.has(name) || skipFiles.has(name) || (name.startsWith('.env.') && name !== '.env.example')) continue
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else files[`${prefix}/${relative(srcDir, p).split(sep).join('/')}`] = readFileSync(p)
    }
  }
  walk(srcDir)
  return files
}

const out = join(root, 'public', 'downloads')
mkdirSync(out, { recursive: true })

const packages = [
  ['starter-project.zip', 'starter-project', 'starter-project'],
  ['vibe-static-site.zip', 'examples/vibe/static-site', 'my-static-site'],
  ['vibe-club-landing.zip', 'examples/vibe/club-landing', 'club-landing'],
]

for (const [zipName, srcRel, prefix] of packages) {
  const files = collect(join(root, srcRel), prefix)
  writeFileSync(join(out, zipName), zipSync(files, { level: 9 }))
  console.log(`${zipName}: ${Object.keys(files).length} file`)
}
