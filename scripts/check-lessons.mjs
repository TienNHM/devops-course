// Kiểm tra nội dung Markdown của website (đọc-only, không sửa file).
//   node scripts/check-lessons.mjs [đường-dẫn ...]    mặc định: toàn repo
// Bắt các lỗi làm hỏng build VitePress hoặc gây link chết:
//   1. Thẻ kiểu HTML/Vue ngoài code ("<ten>") và "{{ ... }}" ngoài code
//   2. Link tương đối tới file .md không tồn tại
//   3. Thiếu tiêu đề "# " ở đầu file, hoặc bài lab thiếu dòng "> **Tóm tắt:**"
//   4. Code fence không đóng
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const skip = new Set(['node_modules', '.git', '.vitepress', 'public', 'README.md'])
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['.']
const problems = []

function walk(p, out = []) {
  const abs = resolve(root, p)
  if (statSync(abs).isDirectory()) {
    for (const name of readdirSync(abs)) {
      if (skip.has(name) && name !== 'README.md') continue
      if (name === 'node_modules' || name === '.git' || name === '.vitepress' || name === 'public') continue
      walk(join(p, name), out)
    }
  } else if (abs.endsWith('.md')) out.push(abs)
  return out
}

// Gỡ code fence và inline code để chỉ soi phần văn bản thường
function prose(text) {
  const lines = text.split('\n')
  let fence = null
  return lines.map((l) => {
    const m = l.match(/^\s*(`{3,}|~{3,})/)
    if (m) {
      if (!fence) fence = m[1][0]
      else if (m[1][0] === fence) fence = null
      return ''
    }
    return fence ? '' : l.replace(/`[^`]*`/g, '``')
  })
}

for (const file of targets.flatMap((t) => walk(t))) {
  const rel = relative(root, file).replaceAll('\\', '/')
  if (rel === 'README.md' || rel === 'CODE_OF_CONDUCT.md') continue
  const text = readFileSync(file, 'utf8')
  const add = (line, msg) => problems.push(`${rel}:${line}: ${msg}`)

  if ((text.match(/^\s*(`{3,}|~{3,})/gm) ?? []).length % 2) add(1, 'code fence không đóng')
  if (!/^# .+/m.test(text) && !text.startsWith('---')) add(1, 'thiếu tiêu đề "# "')
  if (/^labs\/week-\d+\/session-\d+\.md$/.test(rel) && !/^> \*\*Tóm tắt:\*\* .+/m.test(text)) add(1, 'thiếu dòng "> **Tóm tắt:** ..."')

  prose(text).forEach((l, i) => {
    if (rel !== 'index.md' && /<\/?[A-Za-z][^>]*>?/.test(l.replace(/<(details|summary|br|kbd|sub|sup|input|\/details|\/summary|\/kbd|\/sub|\/sup)\b[^>]*>/g, '')))
      add(i + 1, `thẻ giống HTML/Vue ngoài code (hãy đặt trong \`...\` hoặc dùng &lt; &gt;): ${l.trim().slice(0, 80)}`)
    if (/\{\{|\}\}/.test(l)) add(i + 1, `"{{ }}" ngoài code sẽ bị Vue hiểu là biểu thức: ${l.trim().slice(0, 80)}`)
    for (const m of l.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1].split('#')[0]
      if (!href || /^(https?:|mailto:|\/)/.test(href)) continue
      if (!href.endsWith('.md') && !href.endsWith('/')) continue
      const target = resolve(dirname(file), href)
      const ok = existsSync(target)
      if (!ok) add(i + 1, `link không tồn tại: ${m[1]}`)
    }
  })
}

if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`\n${problems.length} vấn đề`)
  process.exit(1)
}
console.log('OK: không có vấn đề')
