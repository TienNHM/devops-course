# Changelog

## Unreleased
- Slide: thêm chế độ trình chiếu (nút "Trình chiếu" trên mỗi trang slide; mũi tên chuyển slide, F toàn màn hình, Esc thoát).
- Thêm `.gitattributes` để file `.sh`, YAML, Dockerfile luôn dùng LF trên Windows.
- Sửa tên cluster mặc định `club` trong scenario 07 và 10.
- Compose: thêm healthcheck cho backend, frontend chờ backend khỏe, port 3000 chỉ mở trên 127.0.0.1.
- CI: thêm `npm run docs:check` (kiểm tra bài học) vào `ci.yml` và `pages.yml`; `pages.yml` chỉ cấp quyền `pages`/`id-token` cho job deploy.
- Khởi tạo repository: curriculum, 32 buổi lab, templates, starter project (Compose, k8s, GitHub Actions).
