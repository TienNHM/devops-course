# Tuần 05 – Dockerfile và Image Optimization

Tuần 5/16 · Giai đoạn 2 – Containerization · Buổi 09 và 10 trên 32

## Mục tiêu tuần này

Sau tuần này, bạn tự viết được Dockerfile cho API của CLB, build ra image chạy được, rồi làm image đó nhỏ hơn, build nhanh hơn và an toàn hơn. Bạn cũng biết chứng minh điều đó bằng số liệu thật chứ không bằng cảm giác.

- Buổi 09: Dockerfile chạy được, biến môi trường, `CMD` và `ENTRYPOINT`, lỗi build sai thư mục.
- Buổi 10: layer cache, `.dockerignore`, multi-stage, chạy bằng user thường, đặt tag.

## Thời gian thật

| Việc | Buổi 09 | Buổi 10 |
| --- | --- | --- |
| Đọc phần khái niệm | 15 phút | 15 phút |
| Lab bắt buộc (L1) | 60 phút | 60 phút |
| Thử thách thêm (tùy chọn, ở nhà) | 20 phút | 40 phút |
| Làm bài tập tuần (nộp lại bằng chứng của lab) | khoảng 30 phút | khoảng 45 phút |

## Lộ trình tuần

| Khi nào | Việc cần làm | Bài |
| --- | --- | --- |
| Trước buổi | Xong Buổi 08, Docker Desktop chạy, repo giáo trình ở `~/devops-course` | [Buổi 08 – Docker CLI](../week-04/session-08.md) |
| Trong buổi 09 | Đọc và làm lab: Dockerfile cho `club-api` | [Buổi 09 – Dockerfile](session-09.md) |
| Trong buổi 10 | Đọc và làm lab: đo, tối ưu, so sánh `hello-node`, build `club-api:1.0.0` | [Buổi 10 – Image Optimization](session-10.md) |
| Sau buổi | Hoàn thành bài tập và nộp Pull Request | [Bài tập tuần 5](../../assignments/weekly/week-05.md) |
| Sau buổi (tùy chọn) | Thử thách L2 | [Buổi 09 – thử thách thêm](session-09-challenge.md), [Buổi 10 – thử thách thêm](session-10-challenge.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop đang chạy với WSL2; `docker run --rm hello-world` in được "Hello from Docker!" (xem [Hướng dẫn cài đặt](../../resources/setup-guide.md))
- [ ] Repo giáo trình đã clone vào `~/devops-course` trong WSL, có `starter-project/backend` và `examples/docker/hello-node`
- [ ] Repo cá nhân `devops-labs` để PUBLIC và đã clone về `~/devops-labs` (xem [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md))
- [ ] Làm việc trong filesystem của WSL (thư mục dạng `~/...`), không dùng `/mnt/c`

## Liên kết nhanh

- Slide: [Slide buổi 09](../../slides/02-docker/session-09.md), [Slide buổi 10](../../slides/02-docker/session-10.md)
- Bài tập: [Bài tập tuần 5](../../assignments/weekly/week-05.md)
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 5](../../mentors/walkthroughs/week-05.md)
- Gặp lỗi cài đặt: [Xử lý lỗi cài đặt](../../resources/troubleshooting-setup.md)

Sản phẩm phải nộp: thư mục `lab-09/` và `lab-10/` trong repo cá nhân, có `README.md`, `evidence/` và `report.md`.

Tuần trước: [Tuần 04 – Docker Basics](../week-04/README.md) · Tuần sau: [Tuần 6 – Networking và Storage](../week-06/README.md)
