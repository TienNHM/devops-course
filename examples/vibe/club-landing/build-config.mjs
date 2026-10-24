// Tạo config.js từ biến môi trường và gom các file công khai vào thư mục dist/.
// Tùy chọn (nâng cao). Mặc định bạn chỉ cần đổi tên config.example.js thành config.js và commit.
// Dùng trên Vercel, Netlify, Cloudflare Pages, GitHub Actions. Không cần cài thêm gói nào.
//
//   node build-config.mjs            -> tạo dist/ (index.html, admin.html, app.js, admin.js, style.css, config.js)
//   node build-config.mjs --local    -> chỉ tạo config.js ở thư mục hiện tại (để chạy thử trên máy)
//
// Cần: SUPABASE_URL, SUPABASE_KEY (khóa CÔNG KHAI). Tùy chọn: CLUB_NAME.
import { writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs'

const local = process.argv.includes('--local')
const url = (process.env.SUPABASE_URL ?? '').trim()
const key = (process.env.SUPABASE_KEY ?? '').trim()
const club = (process.env.CLUB_NAME ?? '').trim() || 'CLB Công nghệ DSC'

function fail(msg) {
  console.error('LỖI: ' + msg)
  process.exit(1)
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) fail('SUPABASE_URL thiếu hoặc sai dạng https://xxxx.supabase.co')
if (!key || key.includes('YOUR_')) fail('SUPABASE_KEY chưa được đặt')

// Chặn nhầm khóa bí mật: secret key mới, hoặc JWT có role service_role.
if (key.startsWith('sb_secret_')) fail('Đây là secret key. Chỉ dùng khóa công khai (sb_publishable_...) ở frontend.')
if (key.split('.').length === 3) {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'))
    if (payload.role === 'service_role') fail('Đây là khóa service_role. Tuyệt đối không đưa lên frontend. Hãy xoay (rotate) khóa này ngay.')
  } catch {
    fail('SUPABASE_KEY không đọc được')
  }
}

const config = 'window.APP_CONFIG = ' + JSON.stringify({ SUPABASE_URL: url.replace(/\/$/, ''), SUPABASE_KEY: key, CLUB_NAME: club }, null, 2) + ';\n'

if (local) {
  writeFileSync(new URL('./config.js', import.meta.url), config)
  console.log('Đã tạo config.js (chỉ chứa URL và khóa công khai).')
} else {
  // Chỉ chép đúng các file cần công khai. schema.sql, README, build-config.mjs ở lại trong repo.
  const publicFiles = ['index.html', 'admin.html', 'app.js', 'admin.js', 'style.css']
  const dist = new URL('./dist/', import.meta.url)
  if (existsSync(dist)) rmSync(dist, { recursive: true })
  mkdirSync(dist, { recursive: true })
  for (const f of publicFiles) copyFileSync(new URL('./' + f, import.meta.url), new URL(f, dist))
  writeFileSync(new URL('config.js', dist), config)
  console.log('Đã tạo dist/ gồm ' + publicFiles.length + ' file và config.js (chỉ chứa URL và khóa công khai).')
}
