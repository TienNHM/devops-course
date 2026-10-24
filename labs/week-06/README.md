# Tuần 6 – Networking và Storage

Tuần 6/16 · Giai đoạn 2 – Containerization · Buổi 11 và 12 trong 32 buổi

## Mục tiêu tuần này

Sau tuần này bạn có thể:

- Cho hai container nói chuyện với nhau bằng tên, và biết cổng nào cần mở ra máy bạn, cổng nào thì không.
- Dựng `club-api` kết nối Postgres qua network riêng, và tự tìm ra lỗi "API chạy nhưng không nối được DB".
- Chạy Postgres với volume để dữ liệu còn nguyên sau khi xóa container, và backup rồi restore bằng `pg_dump`.

## Thời gian thật

| Việc | Buổi 11 | Buổi 12 |
| --- | --- | --- |
| Đọc | 15 phút | 15 phút |
| Lab bắt buộc | 60 phút | 60 phút |
| Thử thách tùy chọn (ở nhà) | 45-60 phút | 25-40 phút |

Gom bằng chứng, viết `report.md` và mở PR cho cả tuần: khoảng 60-90 phút.

## Lộ trình trong tuần

| Khi nào | Buổi 11 – Container Networking | Buổi 12 – Persistent Storage |
| --- | --- | --- |
| Trước buổi | Xem lại [Buổi 10 – Image Optimization](../week-05/session-10.md); chạy thử `docker version` | Hoàn thành [Buổi 11 – Container Networking](session-11.md); Docker Desktop đang chạy |
| Trong buổi | Đọc và làm lab: [Buổi 11 – Container Networking](session-11.md) | Đọc và làm lab: [Buổi 12 – Persistent Storage](session-12.md) |
| Sau buổi | Gom bằng chứng vào `lab-11/`; thử [Thử thách thêm buổi 11](session-11-challenge.md) nếu còn sức | Gom bằng chứng vào `lab-12/`; thử [Thử thách thêm buổi 12](session-12-challenge.md) nếu còn sức |

## Chuẩn bị chung (làm một lần trước buổi 11)

- [ ] Docker Desktop đang chạy; bạn làm việc trong WSL, thư mục `~/devops-labs` (không dùng `/mnt/c`).
- [ ] Repo giáo trình đã clone vào `~/devops-course` (cần `starter-project/`).
- [ ] Repo cá nhân `devops-labs` đã có, để PUBLIC.
- [ ] Chưa rõ cách cài? Xem [Setup Guide: Windows 11 + WSL2](../../resources/setup-guide.md) và [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md).
- [ ] Gặp lỗi môi trường: [Troubleshooting setup](../../resources/troubleshooting-setup.md).

Kiểm tra nhanh:

```bash
docker version --format '{{.Server.Version}}'
docker compose version
```

## Tài liệu của tuần

- Slide: [Slide buổi 11](../../slides/02-docker/session-11.md) và [Slide buổi 12](../../slides/02-docker/session-12.md)
- Bài tập: [Bài tập tuần 6](../../assignments/weekly/week-06.md). Bài tập là nộp lại bằng chứng của lab, hạn nộp trước buổi đầu của tuần 7.
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 6](../../mentors/walkthroughs/week-06.md)

## Sản phẩm phải nộp

Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-11/` và `lab-12/`, mỗi thư mục có `README.md`, `evidence/command-output.txt` và `report.md`. Chi tiết và bảng điểm: [Bài tập tuần 6](../../assignments/weekly/week-06.md).

## Điều hướng

Tuần trước: [Tuần 5 – Dockerfile và Image Optimization](../week-05/README.md) · Tuần sau: [Tuần 7 – Docker Compose](../week-07/README.md)
