# Tuần 3 – Networking & Git Collaboration

Tuần 3/16 · Giai đoạn 1 – Engineering Foundation · Buổi 05 và 06

> **Tóm tắt:** Tuần này bạn học tìm lỗi kết nối theo từng tầng bằng curl, ss, nslookup và làm việc nhóm bằng Git: branch, Pull Request, review, gỡ conflict.

## Cuối tuần bạn làm được gì

- Khi một web hay API "không vào được", bạn chỉ ra được lỗi nằm ở tầng nào (tên miền, port hay ứng dụng) trong vài phút.
- Bạn đưa một thay đổi vào `main` đúng cách: branch riêng, Pull Request, bạn khác review, và không đưa `.env` lên GitHub.
- Bạn tự tạo và gỡ được một merge conflict mà không làm mất code của ai.

## Thời gian thật

| Phần | Thời gian |
| --- | --- |
| Đọc 2 bài | khoảng 30 phút (15 phút mỗi bài) |
| Lab bắt buộc (L1) | 60 phút mỗi buổi, tổng 2 giờ |
| Bài tập tuần (viết script, báo cáo, PR) | khoảng 3 đến 4 giờ |
| Thử thách L2 | tùy chọn, làm ở nhà |

## Lộ trình tuần

| Khi nào | Việc cần làm | Bài |
| --- | --- | --- |
| Trước buổi | Đảm bảo terminal WSL chạy được; có tài khoản GitHub và repo `devops-labs` (public) | [Hướng dẫn cài đặt](../../resources/setup-guide.md), [Tài khoản và repo GitHub](../../resources/setup-github.md) |
| Trong buổi 05 | Đọc, rồi làm lab bằng chứng mạng | [Buổi 05 – Networking Fundamentals](session-05.md) |
| Trong buổi 06 | Đọc, rồi làm lab nhóm với Git và GitHub | [Buổi 06 – Git & GitHub Workflow](session-06.md) |
| Sau buổi | Làm bài tập tuần, mở PR, nhờ bạn review, nộp trước buổi đầu tuần 4 | [Bài tập tuần 3](../../assignments/weekly/week-03.md) |

Nâng cao (tùy chọn): [Buổi 05 – Thử thách nâng cao](session-05-challenge.md) và [Buổi 06 – Thử thách nâng cao](session-06-challenge.md) (kể cả branch protection).

## Checklist chuẩn bị cho cả tuần

- [ ] Terminal Ubuntu trong WSL2 mở được, làm việc trong `~/devops-labs`, không dùng `/mnt/c`.
- [ ] `curl`, `ping`, `ss`, `nslookup`, `python3`, `git` chạy được (lệnh kiểm tra nằm ở phần Chuẩn bị của từng lab).
- [ ] Tài khoản GitHub, `ssh -T git@github.com` báo xác thực thành công (hoặc dùng HTTPS).
- [ ] Một hoặc hai bạn cùng nhóm cho buổi 06 và một bạn sẽ review PR cho bài tập.

## Tài liệu của tuần

- Slide: [Slide buổi 05](../../slides/01-foundation/session-05.md) và [Slide buổi 06](../../slides/01-foundation/session-06.md).
- Bài tập: [Bài tập tuần 3](../../assignments/weekly/week-03.md).
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-03.md).

[Tuần 2 – Linux Essentials](../week-02/README.md) · [Tuần 4 – Docker Basics](../week-04/README.md)
