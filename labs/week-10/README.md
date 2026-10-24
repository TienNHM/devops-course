# Tuần 10 – CD & Pipeline Security

Tuần 10/16 · Giai đoạn 3 – CI/CD & Automation · Buổi 19-20/32

## Cuối tuần này bạn làm được gì

- Deploy một tag image từ GHCR lên máy bạn bằng một script, có kiểm tra sức khỏe và quay về bản trước bằng một lệnh.
- Thu hẹp quyền của workflow GitHub Actions về mức vừa đủ và biết đọc kết quả quét lỗ hổng của một image.
- Hiểu vì sao mọi thứ ở tuần này chạy trên máy bạn và không cần expose máy ra Internet.

## Thời gian thật

| Phần | Thời gian |
| --- | --- |
| Đọc (2 buổi) | khoảng 30 phút |
| Lab bắt buộc (2 buổi) | khoảng 120 phút |
| Bài tập tuần = nộp lại bằng chứng của lab | khoảng 1 giờ ghi log và viết report |
| Tùy chọn ở nhà (L2, phần nâng cao) | 2 đến 3 giờ |

## Lộ trình tuần

| Khi nào | Việc cần làm | Link |
| --- | --- | --- |
| Trước buổi | Có image `club-api` và `club-web` với tag `sha-...` trên GHCR từ tuần trước | [Buổi 18 – Docker CI Pipeline](../week-09/session-18.md) |
| Trước buổi | Kiểm tra môi trường và tài khoản GitHub | [Hướng dẫn cài đặt](../../resources/setup-guide.md), [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md) |
| Trong buổi 19 | Đọc khái niệm, làm lab deploy và rollback | [Buổi 19 – CD & Deployment Strategies](session-19.md) |
| Trong buổi 20 | Đọc khái niệm, làm lab permissions và quét image | [Buổi 20 – Pipeline Security](session-20.md) |
| Sau buổi | Nộp bài vào `lab-19/` và `lab-20/` | [Bài tập tuần 10](../../assignments/weekly/week-10.md) |
| Sau buổi (tùy chọn) | Thử thách L2 và phần nâng cao | [Buổi 19 – Thử thách L2](session-19-challenge.md), [Buổi 20 – Phần nâng cao](session-20-challenge.md) |

## Checklist chuẩn bị (gộp cả tuần)

- [ ] Docker Desktop đang chạy, `docker compose version` báo v2.x
- [ ] Làm việc trong filesystem của WSL (`~/devops-labs`), không dùng `/mnt/c`
- [ ] Repo `devops-labs` để public, đã có thư mục `starter-project/` (copy từ `~/devops-course` nếu chưa có)
- [ ] Có ít nhất một tag `sha-...` của `club-api` và `club-web` trong tab Packages của GitHub
- [ ] Có image `club-api:1.0.0` trên máy (buổi 20 dùng để quét)

## Tài liệu liên quan

- Slide: [Slide buổi 19](../../slides/04-cicd/session-19.md), [Slide buổi 20](../../slides/04-cicd/session-20.md)
- Bài tập và bảng điểm: [Bài tập tuần 10](../../assignments/weekly/week-10.md)
- Gặp lỗi môi trường: [Xử lý sự cố cài đặt](../../resources/troubleshooting-setup.md), [Thuật ngữ](../../resources/glossary.md)
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 10](../../mentors/walkthroughs/week-10.md)

## Tuần trước và tuần sau

Tuần trước: [Tuần 9 – Automated Testing và Docker CI](../week-09/README.md). Tuần sau: [Tuần 11 – Kubernetes Setup & Workloads](../week-11/README.md).
