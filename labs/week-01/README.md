# Tuần 01 – DevOps Workflow & Dev Environment

Tuần 1/16 · Giai đoạn 1 – Engineering Foundation · Buổi 01 và 02 trên 32

## Cuối tuần này bạn làm được gì

- Giải thích DevOps là gì và vẽ được đường đi của code từ laptop đến server, chỉ ra chỗ nào đang nghẽn.
- Có một terminal Ubuntu chạy trên Windows (WSL2), VS Code mở thẳng vào đó, Git và SSH key đăng nhập được GitHub.
- Chứng minh môi trường chạy được bằng log thật của `check-env.sh`.

## Thời gian thật

| Phần | Thời gian |
| --- | --- |
| Đọc hai bài | khoảng 30 phút |
| Lab Buổi 01 (bắt buộc) | 60 phút, viết README và report thêm khoảng 15 phút |
| Lab Buổi 02 ở lớp (bắt buộc) | 60 phút, cài WSL lần đầu kèm khởi động lại khoảng 30 phút |
| Buổi 02 làm ở nhà (SSH key, evidence) | khoảng 30 phút |
| Thử thách L2 (tùy chọn) | khoảng 90 phút cho cả hai buổi |

## Lộ trình tuần

| Khi nào | Việc cần làm | Link |
| --- | --- | --- |
| Trước buổi | Làm 5 việc chuẩn bị khoảng 30 phút: tài khoản GitHub, repo `devops-labs` (PUBLIC), Git, VS Code, đọc Terminal 101 (bắt buộc); mở được Git Bash; kiểm tra ảo hóa trong Task Manager | [Bắt đầu từ đây](../../curriculum/getting-started.md), [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md), [Terminal 101](../../resources/terminal-101.md), [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md) |
| Trong buổi 01 | Đọc khái niệm, làm lab vẽ sơ đồ thủ công, điểm nghẽn, sơ đồ tự động | [Buổi 01 – DevOps Introduction](session-01.md) |
| Trong buổi 02 | Cài WSL2, VS Code Remote WSL, `git config`, chạy `check-env.sh` | [Buổi 02 – Development Environment](session-02.md) |
| Sau buổi | SSH key, nối remote, gom evidence, viết README và report, nộp bài | [Bài tập Tuần 1](../../assignments/weekly/week-01.md) |
| Sau buổi (tùy chọn) | Thử thách L2 và phá lỗi nâng cao | [Buổi 01 – Thử thách thêm](session-01-challenge.md), [Buổi 02 – Thử thách thêm](session-02-challenge.md) |

## Checklist chuẩn bị gộp

- [ ] Windows 11, quyền Administrator, còn trống ít nhất 20 GB ổ đĩa
- [ ] Tài khoản GitHub, repo `devops-labs` để PUBLIC, đã cài Git và VS Code
- [ ] Đã kiểm tra ảo hóa (Task Manager, tab Performance, CPU, dòng Virtualization là Enabled)
- [ ] Đã đọc [Terminal 101](../../resources/terminal-101.md); mở được Git Bash (Start, gõ `Git Bash`); biết chỗ xem trang "Gặp lỗi?" của mỗi bài
- [ ] Buổi 02: nên cài WSL trước giờ học để tiết kiệm khoảng 30 phút

## Tài liệu của tuần

- Slide: [Slide Buổi 01 – DevOps Introduction](../../slides/01-foundation/session-01.md), [Slide Buổi 02 – Development Environment](../../slides/01-foundation/session-02.md)
- Bài tập: [Bài tập Tuần 1](../../assignments/weekly/week-01.md)
- Cách học, quy trình nộp PR, mẫu hỏi đáp, quy tắc dùng AI: [Cách học khóa này](../../curriculum/how-to-learn.md)
- Đối chiếu đáp án (mở sau khi nộp bài): [Đáp án Tuần 1](../../mentors/walkthroughs/week-01.md)

Sản phẩm phải nộp: thư mục `lab-01/` và `lab-02/` trong repo `devops-labs`, chi tiết ở bài tập tuần.

Tuần trước: đây là tuần đầu tiên. Tuần sau: [Tuần 02 – Linux Essentials](../week-02/README.md).
