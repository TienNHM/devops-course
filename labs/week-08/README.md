# Tuần 8 – CI/CD Fundamentals và GitHub Actions

Tuần 8/16 · Giai đoạn 3 – CI/CD & Automation · Buổi 15 và 16

## Cuối tuần này bạn làm được gì

- Giải thích CI, Continuous Delivery và Continuous Deployment bằng ví dụ Club API.
- Vẽ và đặc tả pipeline Test, Build, Publish, Deploy; chạy bản giả lập bằng script và chứng minh pipeline dừng khi test đỏ.
- Viết workflow GitHub Actions chạy `npm ci` và `npm test` mỗi lần push hoặc mở pull request, có cache và hai job chạy song song.
- Đọc log khi workflow đỏ và tìm ra step gây lỗi.

## Thời gian thật

Khoảng 6 đến 7 giờ cho cả tuần: mỗi buổi đọc 15 phút và lab bắt buộc 60 phút trên lớp (hoặc tự học), cộng khoảng 1 đến 2 giờ viết `report.md` và hoàn thiện bằng chứng. Thử thách L2 và phần tìm hiểu thêm làm ở nhà, tùy chọn.

## Lộ trình tuần

| | Trước buổi | Trong buổi | Sau buổi |
| --- | --- | --- | --- |
| Buổi 15 | Xong [Buổi 14 – Production-minded Compose](../week-07/session-14.md); Docker Desktop chạy được | [Buổi 15 – CI/CD Fundamentals](session-15.md): vẽ và đặc tả pipeline, chạy `run-pipeline.sh`, làm test đỏ để thấy gate dừng | Nộp `lab-15/`; tùy chọn [thử thách L2 buổi 15](session-15-challenge.md) |
| Buổi 16 | Xong Buổi 15; repo `devops-labs` để public và `git push` được | [Buổi 16 – GitHub Actions Basics](session-16.md): `hello.yml`, `ci.yml`, cache, job `validate` | Nộp `lab-16/` kèm link run xanh; tùy chọn [thử thách L2 buổi 16](session-16-challenge.md) |

## Chuẩn bị chung cho cả tuần

- [ ] Docker Desktop đang chạy, Node.js 22 trong WSL (xem [Hướng dẫn cài đặt](../../resources/setup-guide.md)).
- [ ] Tài khoản GitHub, repo `devops-labs` **public** đã clone vào `~/devops-labs` (xem [Tài khoản GitHub và repo](../../resources/setup-github.md)).
- [ ] Repo giáo trình clone vào `~/devops-course`; làm việc trong filesystem WSL, không dùng `/mnt/c`.

## Tài liệu của tuần

- Slide: [Slide buổi 15](../../slides/04-cicd/session-15.md) · [Slide buổi 16](../../slides/04-cicd/session-16.md)
- Bài tập: [Bài tập tuần 8](../../assignments/weekly/week-08.md)
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 8](../../mentors/walkthroughs/week-08.md)

## Mẹo cho cả tuần

- Chạy được ở local rồi mới đưa lên CI: khi CI đỏ, bạn biết lỗi ở cấu hình workflow chứ không phải ở code.
- Khi workflow đỏ: tìm step đỏ đầu tiên và đọc từ dòng lỗi đầu tiên.
- Kẹt thì mở mục Gặp lỗi? ở cuối phần lab của từng buổi trước khi hỏi mentor.

## Điều hướng

Tuần trước: [Tuần 7 – Docker Compose](../week-07/README.md) · Tuần sau: [Tuần 9 – Automated Testing và Docker CI](../week-09/README.md)
