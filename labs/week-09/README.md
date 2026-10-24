# Tuần 9 – Automated Testing và Docker CI

Tuần 9/16 · Giai đoạn 3 – CI/CD & Automation · Buổi 17 và 18

> **Tóm tắt:** Tuần này bạn cho GitHub tự kiểm tra và tự đóng gói code: test chạy trên mỗi pull request, nút Merge khóa khi đỏ, và image club-api tự lên GHCR.

## Cuối tuần bạn làm được gì

- Viết 4 unit test cho API Club Management và chạy chúng tự động trên mỗi pull request.
- Cấu hình để nút Merge bị khóa khi test đỏ.
- Có workflow tự build image `club-api`, gắn tag `sha-xxxxxxx` truy vết về commit và đẩy lên GHCR.
- Pull image đó về máy, chạy thử và đọc được digest của nó.

**Thời gian thật:** khoảng 4 giờ cho phần bắt buộc (mỗi buổi đọc 15 phút cộng lab 60 phút, trên lớp thêm demo và review), thử thách tùy chọn làm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Bài |
| --- | --- | --- |
| Trước buổi | Xong tuần trước, repo `devops-labs` để public, Docker Desktop chạy | [Buổi 16 – GitHub Actions Basics](../week-08/session-16.md) |
| Buổi 17 | Đọc, rồi làm lab: unit test, workflow, chặn merge | [Buổi 17 – Automated Testing](session-17.md) |
| Buổi 18 | Đọc, rồi làm lab: workflow publish lên GHCR, pull và chạy image | [Buổi 18 – Docker CI Pipeline](session-18.md) |
| Sau buổi | Nộp `lab-17/` và `lab-18/` qua pull request trước buổi đầu tuần 10 | [Bài tập tuần 9](../../assignments/weekly/week-09.md) |
| Tùy chọn | Integration test với Postgres, matrix hai image, cache | [Buổi 17 – Thử thách thêm](session-17-challenge.md), [Buổi 18 – Thử thách thêm](session-18-challenge.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Có repo cá nhân `devops-labs` ở chế độ **PUBLIC** (branch protection và GHCR miễn phí đều cần). Xem [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md).
- [ ] WSL2 Ubuntu với Node.js 22, Git và Docker Desktop đang chạy; làm việc trong `~/devops-labs`, không dùng `/mnt/c`. Xem [Hướng dẫn cài môi trường](../../resources/setup-guide.md).
- [ ] Repo giáo trình đã clone ở `~/devops-course`.
- [ ] Đã quen cách mở pull request (xem mục [Git trong 10 phút](../../curriculum/how-to-learn.md#git-10-phut)).

::: warning Hai điều hay làm kẹt trong tuần này
Workflow đẩy image cần quyền `packages: write` ở cấp job, và package mới tạo trên GHCR mặc định private nên bạn phải đổi sang Public trước khi pull. Chi tiết ở Buổi 18.
:::

## Tài liệu của tuần

- Slide: [Slide buổi 17](../../slides/04-cicd/session-17.md) và [Slide buổi 18](../../slides/04-cicd/session-18.md).
- Bài tập: [Bài tập tuần 9](../../assignments/weekly/week-09.md).
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 9](../../mentors/walkthroughs/week-09.md).

## Điều hướng

Tuần trước: [Tuần 8 – CI/CD Fundamentals và GitHub Actions](../week-08/README.md) · Tuần sau: [Tuần 10 – CD & Pipeline Security](../week-10/README.md)
