# Tuần 15 – Capstone Planning & Implementation

Tuần 15/16 · Giai đoạn 5 – Capstone Project · Buổi 29-30/32

> **Tóm tắt:** Tuần này nhóm Capstone lập kế hoạch (requirement, kiến trúc, backlog, ADR) rồi cài đặt CRUD API có test, chạy cả stack bằng Compose và dựng CI cùng publish image lên GHCR.

## Cuối tuần bạn làm được gì

- Cùng nhóm biến đề bài Capstone thành requirement kiểm chứng được, sơ đồ kiến trúc, backlog 12 Issue trở lên và ba ADR.
- Tạo repo nhóm sạch, không để `.env` lọt vào Git, và làm việc bằng PR nhỏ với review chéo.
- Hoàn thiện CRUD API có test, giao diện thêm và xóa, Compose giữ được dữ liệu.
- Có CI chạy trên mỗi PR và image `club-api`, `club-web` trên GHCR (mốc M1 và M2 của [Đề bài Capstone](../../assignments/capstone/README.md)).

## Thời gian thật

Khoảng 2 giờ đọc và 2 giờ lab bắt buộc trên lớp hoặc cùng nhóm, cộng khoảng 6 giờ làm bài tập tuần (chủ yếu là gom bằng chứng cá nhân). Thử thách L2 và Phá lỗi nâng cao làm thêm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Chốt nhóm 3-4 người, đọc đề bài và mốc M1, M2 | [Đề bài Capstone](../../assignments/capstone/README.md), [Milestones](../../assignments/capstone/milestones.md) |
| Trong buổi 29 | Đọc 15 phút, lab 60 phút: requirement, repo, kiến trúc, GitHub Projects, ADR | [Buổi 29 – Architecture & Planning](session-29.md) |
| Trong buổi 30 | Đọc 15 phút, lab 60 phút: CRUD có test, giao diện, Compose, CI, publish GHCR, review chéo | [Buổi 30 – Implementation](session-30.md) |
| Sau buổi | Thử thách L2 và Phá lỗi nâng cao | [Buổi 29 – Thử thách thêm](session-29-challenge.md), [Buổi 30 – Mã gợi ý và thử thách](session-30-challenge.md) |
| Sau buổi | Làm và nộp bài tập tuần | [Bài tập tuần 15](../../assignments/weekly/week-15.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Nhóm đã chốt, mỗi người có tài khoản GitHub; repo `devops-labs` (public) theo [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md).
- [ ] Git, Docker, Node.js 22 chạy được trong WSL theo [Hướng dẫn cài đặt](../../resources/setup-guide.md); repo giáo trình ở `~/devops-course`.
- [ ] Làm trong `~/club-management` của WSL, không dùng `/mnt/c`.
- [ ] Cổng 3000 và 8080 trên máy còn trống (đổi `WEB_PORT` nếu bận).
- [ ] Đã học [Buổi 28](../week-14/session-28.md); đã đọc mục M1 và M2 của [Milestones](../../assignments/capstone/milestones.md).

## Tài liệu của tuần

- [Slide buổi 29 – Architecture & Planning](../../slides/08-capstone/session-29.md) và [slide buổi 30 – Implementation](../../slides/08-capstone/session-30.md).
- [Bài tập tuần 15](../../assignments/weekly/week-15.md): nộp hai thư mục `lab-29/` và `lab-30/`.
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-15.md).
- Tra cứu khi kẹt: [Cheatsheets](../../resources/cheatsheets.md), [Thuật ngữ](../../resources/glossary.md), [Xử lý sự cố khi cài đặt](../../resources/troubleshooting-setup.md).

Tuần trước: [Tuần 14 – Storage, Ingress & Operations](../week-14/README.md) · Tuần sau: [Tuần 16 – Capstone Testing & Defense](../week-16/README.md)
