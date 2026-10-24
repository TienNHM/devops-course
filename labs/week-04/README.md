# Tuần 04 – Docker Basics

Tuần 4/16 · Giai đoạn 2 – Containerization · Buổi 07 và 08 trên 32

> **Tóm tắt:** Tuần này bạn hiểu container là gì và dùng Docker CLI để chạy, soi, sửa lỗi container. Cuối tuần, bạn tự dựng được Nginx, PostgreSQL và một registry cục bộ trên máy mình.

## Cuối tuần bạn làm được

- Giải thích container khác máy ảo ở đâu, bằng lời của bạn.
- Chạy một web server trong container và mở nó từ trình duyệt.
- Nhìn vào container đang chạy hoặc đã chết (log, trạng thái, mã thoát) để biết vì sao.
- Dừng, xóa, dọn container mà không để rác.
- Đẩy một image lên registry (kho image) chạy ngay trên máy bạn.

## Thời gian thật

| Việc | Thời lượng |
| --- | --- |
| Đọc hai bài (mỗi bài khoảng 15 phút) | 30 phút |
| Lab bắt buộc (mỗi bài 60 phút) | 120 phút |
| Viết README, report và nộp bài | 45 đến 60 phút |
| Thử thách thêm, tùy chọn | 60 phút trở lên |

## Lộ trình tuần

| Thời điểm | Việc cần làm | Link |
| --- | --- | --- |
| Trước buổi | Cài Docker Desktop, bật WSL integration, xem lại terminal Linux | [Hướng dẫn cài đặt](../../resources/setup-guide.md), [Buổi 06 – Git & GitHub Workflow](../week-03/session-06.md) |
| Trong buổi | Học khái niệm container, làm lab Nginx | [Buổi 07 – Container Fundamentals](session-07.md) |
| Trong buổi | Học 10 lệnh Docker, chẩn đoán lỗi, đẩy image lên registry cục bộ | [Buổi 08 – Docker CLI](session-08.md) |
| Sau buổi | Nộp `lab-07/` và `lab-08/` bằng pull request | [Bài tập tuần 4](../../assignments/weekly/week-04.md) |
| Sau buổi (tùy chọn) | Thử thách thêm, phá lỗi nâng cao | [Buổi 07 – Thử thách thêm](session-07-challenge.md), [Buổi 08 – Thử thách thêm](session-08-challenge.md) |

## Checklist chuẩn bị (làm một lần cho cả tuần)

- [ ] `wsl -l -v` trong PowerShell cho thấy Ubuntu ở `VERSION 2`.
- [ ] Docker Desktop đang chạy và đã bật WSL integration cho Ubuntu.
- [ ] Trong terminal WSL, `docker run --rm hello-world` in `Hello from Docker!`.
- [ ] Repo cá nhân `devops-labs` để public trên GitHub, đã clone về `~/devops-labs`; xem [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md).
- [ ] Còn khoảng 10 GB ổ đĩa trống cho image và container.

## Tài liệu của tuần

- Slide: [Slide buổi 07](../../slides/02-docker/session-07.md), [Slide buổi 08](../../slides/02-docker/session-08.md).
- Bài tập: [Bài tập tuần 4](../../assignments/weekly/week-04.md).
- Tra cứu khi kẹt: [Thuật ngữ](../../resources/glossary.md), [Xử lý sự cố cài đặt](../../resources/troubleshooting-setup.md).
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 4](../../mentors/walkthroughs/week-04.md).

Tuần trước: [Tuần 03 – Networking & Git Collaboration](../week-03/README.md) · Tuần sau: [Tuần 05 – Dockerfile & Image Optimization](../week-05/README.md)
