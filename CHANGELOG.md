# Changelog

## Unreleased
- Tài liệu tham khảo: mỗi bộ slide có slide cuối "Đọc thêm" (4–6 link tài liệu chính thức và best practices, đã kiểm tra trả mã 200); thêm mục "Best practices và hướng dẫn chuẩn" vào `resources/documentation.md`.
- Học theo thứ tự slide trước, lab sau: trang tuần có thẻ "Học theo thứ tự", trang slide và lab có thanh 3 bước (Slide, Lab, Bài tập), cuối slide có nút "Làm lab", "Bắt đầu" và "Học tiếp" dẫn vào slide của buổi.
- Website: tách thành ba lộ trình: Cơ bản (tuần 1–10), Nâng cao (tuần 11–16) và Vibe Deploy (riêng). Thêm trang `curriculum/basic` và `curriculum/advanced`, bộ chuyển lộ trình ở sidebar, sidebar riêng cho từng lộ trình, tiến độ theo lộ trình, trang chủ chọn lộ trình.
- Slide: viết lại toàn bộ 32 bộ slide thành slide trực quan (467 slide, 314 hình SVG trong `public/slides/img/`), mỗi slide một ý; phần giải thích chuyển vào "Ghi chú cho mentor" (ẩn khi trình chiếu).
- Slide: thêm chế độ trình chiếu (nút "Trình chiếu" trên mỗi trang slide; mũi tên chuyển slide, F toàn màn hình, Esc thoát).
- Thêm `.gitattributes` để file `.sh`, YAML, Dockerfile luôn dùng LF trên Windows.
- Sửa tên cluster mặc định `club` trong scenario 07 và 10.
- Compose: thêm healthcheck cho backend, frontend chờ backend khỏe, port 3000 chỉ mở trên 127.0.0.1.
- CI: thêm `npm run docs:check` (kiểm tra bài học) vào `ci.yml` và `pages.yml`; `pages.yml` chỉ cấp quyền `pages`/`id-token` cho job deploy.
- Khởi tạo repository: curriculum, 32 buổi lab, templates, starter project (Compose, k8s, GitHub Actions).
