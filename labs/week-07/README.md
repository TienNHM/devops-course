# Tuần 7 – Docker Compose

Tuần 7/16 · Giai đoạn 2 – Containerization · Buổi 13-14/32

[Slide tuần 7](../../slides/03-compose/session-13.md) · [Bài tập tuần 7](../../assignments/weekly/week-07.md) · [Lộ trình 16 tuần](../../curriculum/syllabus.md)

## Tuần này bạn làm được gì

- Chạy cả ứng dụng CLB (frontend, API, PostgreSQL) bằng một file `compose.yaml` và một lệnh `docker compose up -d --build`.
- Giải thích vì sao dữ liệu còn sau `docker compose down` nhưng mất sau `down -v`.
- Làm cho hệ thống tự cho biết khi nào sẵn sàng (healthcheck), tự dựng lại khi sập (restart) và biết điều tra khi healthcheck bị đặt sai.

**Thời gian thật:** khoảng 3 giờ trên lớp hoặc tự học (2 buổi x 15 phút đọc và 60 phút lab), cộng 1-2 giờ làm bài nộp. Thử thách L2 (giới hạn tài nguyên, secrets, backup, restore) làm ở nhà, tùy chọn.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Ôn Dockerfile, network, volume; chạy `docker compose version` để chắc Compose là v2 | [Buổi 12 – Persistent Storage](../week-06/session-12.md) |
| Buổi 13 | Chạy starter-project bằng Compose, kiểm thử qua mạng, thí nghiệm `down` so với `down -v` | [Buổi 13 – Docker Compose](session-13.md) |
| Buổi 14 | Thêm healthcheck, restart, so sánh `/health` và `/ready`, tự gây lỗi healthcheck rồi điều tra | [Buổi 14 – Production-minded Compose](session-14.md) |
| Sau buổi | Nộp `lab-13/` và `lab-14/` bằng Pull Request vào repo `devops-labs` | [Bài tập tuần 7](../../assignments/weekly/week-07.md) |
| Tùy chọn | Thử thách L2 | [Buổi 13 – thử thách L2](session-13-challenge.md), [Buổi 14 – thử thách L2](session-14-challenge.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop chạy, terminal WSL mở trong filesystem của WSL (không dùng `/mnt/c`); xem [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Repo cá nhân `devops-labs` (public) đã tạo và giáo trình đã clone vào `~/devops-course`; xem [Tài khoản GitHub và repo](../../resources/setup-github.md).
- [ ] Cổng 8080 và 3000 còn trống (nếu 8080 bận, đặt `WEB_PORT` trong `.env`).
- [ ] Biết cách mở terminal và các lệnh cơ bản; xem [Terminal 101](../../resources/terminal-101.md).
- [ ] Gặp lỗi môi trường: xem [Xử lý sự cố cài đặt](../../resources/troubleshooting-setup.md) và [Cheatsheet](../../resources/cheatsheets.md).

## Sản phẩm nộp và đối chiếu

- Sản phẩm: `lab-13/` và `lab-14/` trong repo `devops-labs`, mỗi thư mục có `README.md`, `evidence/`, `report.md`, `source/`. Chi tiết và thang điểm ở [Bài tập tuần 7](../../assignments/weekly/week-07.md).
- [Slide buổi 13](../../slides/03-compose/session-13.md) và [Slide buổi 14](../../slides/03-compose/session-14.md).
- Đối chiếu đáp án (mở sau khi nộp bài): [Đối chiếu đáp án tuần 7](../../mentors/walkthroughs/week-07.md).

## Điều hướng

Tuần trước: [Tuần 6 – Networking và Storage](../week-06/README.md) · Tuần sau: [Tuần 8 – CI/CD Fundamentals và GitHub Actions](../week-08/README.md)
