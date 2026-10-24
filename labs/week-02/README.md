# Tuần 02 – Linux Essentials

Tuần 2/16 · Giai đoạn 1 – Engineering Foundation · Buổi 03 và 04 trên 32

> **Tóm tắt:** Tuần này bạn học dùng terminal Linux: điều hướng, tìm file, đọc log bằng pipeline, rồi quản lý user, quyền, process và biến môi trường.

## Cuối tuần bạn làm được gì

- Điều hướng cây thư mục, tìm file bằng `find`, tìm dòng bằng `grep`, và ghép pipeline để đếm IP và mã lỗi trong access log.
- Tạo user, group và một thư mục dùng chung cho nhóm: người trong nhóm ghi được, người ngoài bị chặn, không dùng `chmod 777`.
- Dừng process đúng cách (SIGTERM trước, SIGKILL sau) và hiểu vì sao biến môi trường cần `export`.

## Thời gian thật

| Việc | Thời gian |
| --- | --- |
| Đọc hai bài | khoảng 30 phút (15 phút mỗi bài) |
| Lab bắt buộc (L1) | 60 phút mỗi buổi, tổng 2 giờ |
| Bài tập tuần | khoảng 4 đến 5 giờ, chia nhiều ngày |
| Thử thách L2 (tùy chọn) | khoảng 1 đến 2 giờ ở nhà |

## Lộ trình tuần

| | Việc cần làm | Link |
| --- | --- | --- |
| Trước buổi | Xong Buổi 02; mở được terminal Ubuntu; clone repo giáo trình vào `~/devops-course`; đọc [Terminal cơ bản](../../resources/terminal-101.md) nếu chưa quen | [Buổi 02 – Development Environment](../week-01/session-02.md) |
| Trong buổi | Buổi 03: cây thư mục, find, grep, pipeline đọc log | [Buổi 03 – Linux CLI](session-03.md) |
| Trong buổi | Buổi 04: user, group, setgid, process, biến môi trường | [Buổi 04 – Linux Administration](session-04.md) |
| Sau buổi | Làm bài tập tuần, mở PR vào repo `devops-labs` | [Bài tập tuần 2](../../assignments/weekly/week-02.md) |

## Checklist chuẩn bị

- [ ] Terminal Ubuntu (WSL) mở được, `pwd` ra `/home/...` chứ không phải `/mnt/c`.
- [ ] Tài khoản có quyền `sudo` (thử `sudo -v`).
- [ ] Có repo `devops-labs` để public, xem [Tài khoản GitHub và repo](../../resources/setup-github.md); cài đặt theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Repo giáo trình đã clone vào `~/devops-course` (cần `examples/linux/access.log`).

## Tài liệu của tuần

- Slide: [Slide buổi 03](../../slides/01-foundation/session-03.md), [Slide buổi 04](../../slides/01-foundation/session-04.md)
- Bài tập: [Bài tập tuần 2](../../assignments/weekly/week-02.md)
- Thử thách thêm (tùy chọn): [Buổi 03 – Thử thách thêm](session-03-challenge.md), [Buổi 04 – Thử thách thêm](session-04-challenge.md)
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-02.md)

Tuần trước: [Tuần 01](../week-01/README.md) · Tuần sau: [Tuần 03](../week-03/README.md)
