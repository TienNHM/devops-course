# Ví dụ: Vercel Function (vercel-api)

Một trang tĩnh trong `public/` và hai endpoint trong `api/`: `/api/hello` trả JSON, `/api/env-check` chỉ cho biết biến `MY_SECRET` đã được cấu hình hay chưa (không bao giờ trả giá trị).

Cấu trúc:

```text
vercel-api/
  api/hello.js        endpoint trả JSON
  api/env-check.js    kiểm tra biến môi trường an toàn
  public/index.html   trang thử gọi hai endpoint
  test.mjs            kiểm tra logic bằng Node thuần
```

## Kiểm tra logic cục bộ (không cần tài khoản)

```bash
node test.mjs
```

Bạn sẽ thấy `OK: vercel-api`.

## Chạy thử như trên Vercel

```bash
npm i -g vercel
vercel login
vercel dev
```

Lần đầu `vercel dev` hỏi liên kết thư mục với một dự án Vercel (tài liệu yêu cầu dự án đã được liên kết); cứ trả lời theo hướng dẫn. Không muốn tạo tài khoản thì chỉ cần chạy `node test.mjs` ở bước trên. Mở `http://localhost:3000`. Để thử biến môi trường cục bộ, tạo file `.env.local` (đã nằm trong `.gitignore`) với dòng `MY_SECRET=gia-tri-thu-nghiem`.

## Deploy

Cách ổn định nhất: đẩy thư mục này lên GitHub rồi Add New Project trên Vercel và chọn repo. Hoặc dùng CLI:

```bash
vercel link
vercel env add MY_SECRET
vercel --prod
```

Lưu ý: với Framework Preset là Other, Vercel phục vụ thư mục `public` nếu có. Nếu trang chủ báo 404 thì kiểm tra Output Directory của project (giao diện có thể khác chút). Lệnh `vercel` đầu tiên của một dự án mới luôn tạo bản production. Hai endpoint `/api/...` hoạt động độc lập với trang chủ.

Tài liệu: https://vercel.com/docs/functions/quickstart
