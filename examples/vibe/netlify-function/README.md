# Ví dụ: Netlify Function (netlify-function)

Hai function trong `netlify/functions/`: `/api/hello` trả JSON và `/api/env-check` chỉ cho biết `MY_SECRET` đã được cấu hình hay chưa. Đường dẫn `/api/...` được khai báo bằng `export const config = { path: ... }`.

Cấu trúc:

```text
netlify-function/
  netlify.toml                      publish = "public", thư mục functions
  netlify/functions/hello.mjs
  netlify/functions/env-check.mjs
  public/index.html
  test.mjs
```

## Kiểm tra logic cục bộ

```bash
node test.mjs
```

Bạn sẽ thấy `OK: netlify-function`.

## Chạy thử như trên Netlify

```bash
npm i -g netlify-cli
netlify login
netlify dev
```

Mở địa chỉ mà lệnh in ra (thường là `http://localhost:8888`).

## Deploy

Đẩy lên GitHub, rồi Add new project trên Netlify và import repo. Thêm biến `MY_SECRET` ở Project configuration, mục Environment variables (hoặc bằng CLI: `netlify env:set MY_SECRET gia-tri-thu-nghiem --secret --scope functions`; chỉ dùng giá trị thử nghiệm, không gõ khóa thật vào lịch sử lệnh). Biến được chốt tại thời điểm deploy, nên đổi biến xong phải deploy lại. Biến khai báo trong `netlify.toml` không dành cho function, đừng đặt secret ở đó.

Tài liệu: https://docs.netlify.com/build/functions/get-started/
