# File index.html hoàn chỉnh cho bài Supabase

Đây là file `index.html` dùng ở Bước 4 của [bài Supabase](04-supabase.md). Bạn chỉ sửa hai dòng có chữ `THAY`: Project URL và publishable key.

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Đăng ký CLB</title>
</head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 2rem auto; padding: 0 1rem">
  <h1>Đăng ký tham gia CLB</h1>
  <form id="form">
    <p><label>Họ tên<br><input name="full_name" required maxlength="100" style="width:100%"></label></p>
    <p><label>Email<br><input name="email" type="email" required maxlength="200" style="width:100%"></label></p>
    <p><label>Lời nhắn<br><textarea name="message" maxlength="1000" style="width:100%"></textarea></label></p>
    <button type="submit">Gửi đăng ký</button>
  </form>
  <p id="status" role="status"></p>
  <hr>
  <button id="probe" type="button">Thử đọc danh sách như người lạ</button>
  <p id="probeResult" role="status"></p>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

    const SUPABASE_URL = 'https://YOUR_REF.supabase.co'      // THAY bằng Project URL của bạn
    const SUPABASE_KEY = 'sb_publishable_YOUR_KEY_HERE'      // THAY bằng publishable key (KHÔNG phải secret key)

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const status = document.getElementById('status')

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.target))
      // Không gọi .select() sau insert: khách chưa đăng nhập không có quyền đọc lại dòng vừa tạo
      const { error } = await supabase.from('signups').insert(data)
      status.textContent = error ? 'Lỗi: ' + error.message : 'Đã gửi. Cảm ơn bạn!'
      if (!error) e.target.reset()
    })

    document.getElementById('probe').addEventListener('click', async () => {
      const { data, error } = await supabase.from('signups').select('*')
      document.getElementById('probeResult').textContent = error
        ? 'Bị chặn (' + error.message + '). Đạt: người lạ không đọc được.'
        : data.length === 0
          ? 'Nhận về danh sách rỗng. Đạt.'
          : 'CẢNH BÁO: người lạ đọc được ' + data.length + ' dòng. RLS đang sai!'
    })
  </script>
</body>
</html>
```

Quay lại [bài Supabase](04-supabase.md) để tiếp tục Bước 5.
