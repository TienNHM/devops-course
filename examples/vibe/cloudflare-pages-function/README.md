# Ví dụ: Cloudflare Pages Functions (cloudflare-pages-function)

Đây là **đường cũ**. Kiểm tra 10/2026: tài liệu Cloudflare khuyên dự án mới bắt đầu bằng Workers với static assets, xem ví dụ [cloudflare-workers-static](../cloudflare-workers-static/README.md) (cùng hai endpoint). Pages Functions vẫn dùng được, phù hợp nếu bạn đã có dự án Pages.

Trang tĩnh trong `public/` và hai endpoint trong `functions/api/`: `/api/hello` trả JSON và `/api/env-check` chỉ cho biết `MY_SECRET` đã được cấu hình hay chưa. Đường dẫn của function lấy theo cấu trúc thư mục `functions/`. Thư mục này nằm ngoài `public/`.

Cấu trúc:

```text
cloudflare-pages-function/
  functions/api/hello.js
  functions/api/env-check.js
  public/index.html
  test.mjs
```

Khác biệt cần nhớ: biến môi trường đọc qua `context.env.TEN_BIEN`, không phải `process.env`.

## Kiểm tra logic cục bộ

```bash
node test.mjs
```

Bạn sẽ thấy `OK: cloudflare-pages-function`.

## Chạy thử như trên Cloudflare

Tạo file `.dev.vars` (đã nằm trong `.gitignore`) với dòng `MY_SECRET="gia-tri-thu-nghiem"`, rồi:

```bash
npx wrangler pages dev public
```

## Deploy

Cách 1 (khuyên dùng): kết nối repo GitHub trong Workers & Pages (Create application, Pages, Connect to Git), đặt build output directory là `public` và nhập `exit 0` vào Build command (theo tài liệu Cloudflare khi không dùng framework preset). Thư mục `functions/` để ở gốc repo. Cách 2, dùng CLI:

```bash
npx wrangler pages project create my-serverless-demo
npx wrangler pages deploy public --project-name my-serverless-demo
```

Đặt secret trong dashboard: Workers & Pages, chọn project, Settings, Variables and Secrets, chọn Encrypt cho giá trị nhạy cảm. Không đưa secret vào `vars` của file cấu hình Wrangler.

Lưu ý: Direct Upload từ giao diện web không hỗ trợ Functions, hãy dùng Git hoặc `wrangler`.

Tài liệu: https://developers.cloudflare.com/pages/functions/get-started/
