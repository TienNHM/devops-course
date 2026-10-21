# Ví dụ: Cloudflare Workers với static assets (cloudflare-workers-static)

Đây là cách Cloudflare khuyên dùng cho dự án mới (kiểm tra 10/2026): một **Worker** phục vụ cả file tĩnh trong `public/` lẫn vài endpoint JSON trong `src/index.js`. Ví dụ có `/api/hello` trả JSON và `/api/env-check` chỉ cho biết `MY_SECRET` đã được cấu hình hay chưa. Nếu bạn muốn đường cũ, xem [cloudflare-pages-function](../cloudflare-pages-function/README.md).

Cấu trúc:

```text
cloudflare-workers-static/
  wrangler.jsonc
  src/index.js
  public/index.html
  public/404.html
  test.mjs
```

Trong `wrangler.jsonc`, `assets.directory` trỏ tới `./public`; `run_worker_first` chỉ cho request `/api/*` chạy code Worker, còn lại là file tĩnh; `not_found_handling` đặt `404-page` nên đường dẫn không có file sẽ trả `404.html`. Với SPA (React, Vue...) hãy đổi thành `single-page-application` để mọi đường dẫn lạ trả `index.html`. Biến môi trường đọc qua `env.TEN_BIEN`, không phải `process.env`.

## Kiểm tra logic cục bộ

```bash
node test.mjs
```

Bạn sẽ thấy `OK: cloudflare-workers-static`.

## Chạy thử như trên Cloudflare

Tạo file `.dev.vars` (đã nằm trong `.gitignore`) với dòng `MY_SECRET="gia-tri-thu-nghiem"`, rồi:

```bash
npx wrangler dev
```

Mở địa chỉ `http://localhost:8787` mà Wrangler in ra (cổng có thể khác) và bấm hai nút.

## Deploy

Cách 1 (khuyên dùng, tự deploy mỗi lần push): đưa repo lên GitHub, vào Workers & Pages, **Create application**, chọn **GitHub**, chọn repo (Workers Builds). Tên Worker trong dashboard phải trùng `name` trong `wrangler.jsonc`, nếu không build sẽ lỗi. Nếu ví dụ nằm trong thư mục con của repo lớn, đặt root directory cho đúng thư mục này. Bản build ở nhánh chính thành production, nhánh khác thành Preview.

Cách 2, dùng CLI:

```bash
npx wrangler login
npx wrangler deploy
```

Đặt secret thật bằng `npx wrangler secret put MY_SECRET` (CLI hỏi giá trị) hoặc trong dashboard, mục Settings, Variables and Secrets. Không đưa secret vào `vars` của file cấu hình.

Domain riêng: Settings, Domains & Routes, Add, Custom Domain (domain phải nằm trong tài khoản Cloudflare của bạn).

Tài liệu: https://developers.cloudflare.com/workers/static-assets/
