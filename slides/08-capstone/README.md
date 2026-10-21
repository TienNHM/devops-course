# Slide deck 08 – Capstone

Architecture, implementation, testing, demo · 4 buổi (29-32) · khoảng 80 slide

## Danh sách buổi

| Buổi | Chủ đề | Slide |
| --- | --- | --- |
| 29 | [Architecture & Planning](session-29.md) – Requirement, kiến trúc, repo nhóm, backlog, ADR | 20 |
| 30 | [Implementation](session-30.md) – CRUD API, test, giao diện, Compose, CI, GHCR | 20 |
| 31 | [Testing & Troubleshooting](session-31.md) – Deployment test, failure injection, logs, bảo mật | khoảng 20 |
| 32 | [Final Demo & Review](session-32.md) – Demo sản phẩm, pipeline, kiến trúc, bài học | khoảng 20 |

Tổng cộng khoảng 80 slide (buổi 29 và 30 đã soạn 20 slide mỗi buổi; buổi 31, 32 do agent khác soạn).

## Mục tiêu deck

- Hỗ trợ mentor dẫn dắt nhóm Capstone từ kế hoạch tới sản phẩm chạy được và bảo vệ kỹ thuật
- Mỗi slide một ý chính, ưu tiên lệnh có kết quả mong đợi và tình huống lỗi
- Bám sát bài lab tương ứng trong thư mục `labs/week-15` và `labs/week-16`
- Giữ nguyên triết lý Learn, Build, Break, Debug, Deploy, Explain

## Template mỗi buổi

1. Learning objectives
2. Problem statement – vấn đề thực tế
3. Concept – khái niệm cần hiểu
4. Architecture – sơ đồ giải thích
5. How it works – quy trình hoạt động
6. Demo – giảng viên thực hiện
7. Hands-on lab – học viên tự thực hành (L1 và L2)
8. Common mistakes – lỗi thường gặp
9. Challenge – bài tập nâng cao
10. Recap – kiến thức cần nhớ

## Mẹo trình bày

- Chiếu trực tiếp trang slide trên trình duyệt, phóng to bằng Ctrl và dấu cộng tới khi dòng cuối phòng đọc được
- Khối "Ghi chú giảng viên" thu gọn mặc định; mở trước buổi học, không mở khi chiếu cho lớp
- Terminal: cỡ chữ tối thiểu 18-20 pt, nền tối chữ sáng, một cửa sổ WSL chiếu duy nhất
- Chia sẻ màn hình terminal: ẩn thông báo, đóng tab có token hay `.env`, không chiếu nội dung `.env`
- Chạy lệnh thật cho mọi demo, để lớp thấy cả lỗi và cách sửa
- Giữ lab làm trung tâm: slide chỉ dẫn hướng, học viên làm theo bài lab đầy đủ
