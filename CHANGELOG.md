# Changelog

## Unreleased
- Thêm hình minh họa (SVG) cho 122 slide khái niệm còn thiếu hình (`public/slides/img/sNN-k-*.svg`): mọi slide khái niệm giờ đều có hình. Sửa 9 hình có nhãn chữ đè lên cạnh khung hoặc đường nối.
- Cắt chữ trên slide: slide khái niệm chỉ giữ định nghĩa và ví dụ, phần giải thích thêm chuyển vào ghi chú mentor; trung vị còn 38 chữ mỗi slide (trước đó 47), slide khái niệm 45 chữ (trước đó 73). Trình chiếu thêm nút "Ghi chú" (phím N) để mentor xem ghi chú ngay khi chiếu.
- Giao diện di động: trình chiếu dùng chiều cao động của màn hình (không bị thanh trình duyệt che), nút bấm 46 px trên màn hình cảm ứng; đã kiểm tra 19 trang ở 360 và 390 px, không tràn ngang.
- Chế độ trình chiếu: tự thu nhỏ để slide vừa khít chiều cao (không còn tràn hay phải cuộn), hình bị giới hạn khi slide có cả chữ, slide khái niệm có thẻ định nghĩa nổi bật; chân trang chỉ hiện số trang.
- Tiêu đề slide bỏ tiền tố "Slide N:" (741 tiêu đề ở 34 bộ slide).
- Văn phong học thuật cho người mới: viết lại 32 bộ slide, các trang `curriculum`, `resources`, `vibe`, trang chủ; thêm slide "Khái niệm" trước mỗi thuật ngữ mới (định nghĩa một câu, ví dụ trong dự án). Quy tắc văn phong nằm trong ghi chú soạn bài của người biên soạn.
- Thêm module tùy chọn "Phần 6 · Cloud và IaC" cho Lộ trình Nâng cao: buổi 33 (AWS cục bộ với floci) và buổi 34 (Terraform và kiểm thử tích hợp trên floci), chỉ học bằng slide.
- Lộ trình Cơ bản học bằng slide: bỏ lab, bài tập và nộp bài khỏi đường học Ngày 1–10; 10 bộ slide viết lại thành bài học đầy đủ (bước làm, kiểm tra, lỗi thường gặp, tự kiểm tra). Các trang lab cũ của Cơ bản giữ làm bản lưu trữ, ẩn khỏi menu. Tiến độ ("Đánh dấu đã xong") chuyển sang trang slide.
- Lộ trình Cơ bản rút gọn thành 14 ngày (2 giờ mỗi ngày): 10 ngày học theo một dự án xuyên suốt (Club app) và 4 ngày sửa lỗi, hoàn thiện, demo. Viết lại 10 bài lab và 10 bộ slide theo hướng project-based, bỏ lý thuyết dài; thêm trang `curriculum/basic-wrapup`.
- Các buổi bị cắt khỏi Cơ bản (01, 04, 05, 10, 11, 14, 15, 17, 19, 20) chuyển sang Lộ trình Nâng cao; đường dẫn bài giữ nguyên. Sidebar, trang chủ, tiến độ và điều hướng theo hai lộ trình mới.
- Sidebar học theo thứ tự slide trước, lab sau: bấm tên tuần đi thẳng vào slide của buổi đầu; mỗi tuần liệt kê Slide và Lab của từng buổi, rồi Bài tập tuần. Trang slide dùng chung sidebar này.
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
