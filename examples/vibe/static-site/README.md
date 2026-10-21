# Static site mẫu: landing page CLB

> **Tóm tắt:** Một landing page tĩnh bằng HTML, CSS và JS thuần, không cần cài đặt hay build. Dùng để tập deploy lên GitHub Pages, Netlify, Vercel hoặc Cloudflare Pages.

## Có gì trong thư mục

| File | Vai trò |
| --- | --- |
| `index.html` | Nội dung trang (menu, hero, giới thiệu, hoạt động, lịch, nút tham gia) |
| `style.css` | Giao diện, tự đổi sáng/tối theo máy, responsive cho điện thoại |
| `script.js` | Menu điện thoại, đếm số, hiện dần khi cuộn |

Trang này không gọi API nào, không có form, không có key. Đây là loại dự án dễ deploy nhất.

## Chạy thử trên máy

Cách 1: bấm đúp `index.html` để mở trong trình duyệt.

Cách 2: chạy một server nhỏ (cần Node.js hoặc Python):

```bash
npx serve .
# hoặc
python -m http.server 8000
```

Bạn sẽ thấy trang mở tại `http://localhost:3000` (serve) hoặc `http://localhost:8000` (python).

## Deploy (không cần build)

Với mọi dịch vụ, cấu hình giống nhau: build command để trống, thư mục xuất bản là thư mục chứa `index.html`.

| Dịch vụ | Cách nhanh nhất |
| --- | --- |
| GitHub Pages | Đẩy lên repo, vào Settings, mục Pages, chọn nhánh `main` và thư mục gốc |
| Netlify | Kéo thả thư mục vào Netlify Drop, hoặc nối repo GitHub |
| Vercel | Nối repo GitHub, để trống Build Command |
| Cloudflare | Nối repo GitHub, nhập `exit 0` vào Build command, thư mục output là thư mục chứa trang |

Hướng dẫn từng bước nằm ở [bài Static hosting](../../../vibe/02-static-hosting.md). Giao diện các dịch vụ thay đổi thường xuyên, hãy đối chiếu với tài liệu chính thức.

## Thử thách

1. Đổi tên CLB, màu `--primary` trong `style.css`, email liên hệ.
2. Nhờ AI agent thêm một mục "Thành viên tiêu biểu". Đọc lại diff trước khi chấp nhận.
3. Deploy, rồi sửa một chữ, đẩy lên và quan sát trang tự cập nhật.

Muốn có form đăng ký lưu vào database? Xem dự án [club-landing](../club-landing/README.md).
