# Tuần 16 – Capstone Testing & Defense

Tuần 16/16 · Giai đoạn 5 – Capstone Project · Buổi 31-32/32

> **Tóm tắt:** Tuần cuối của khóa: bạn tự phá hệ thống capstone của nhóm để học cách chẩn đoán, rồi demo trực tiếp và bảo vệ kỹ thuật trước mentor.

## Cuối tuần bạn làm được gì

- Dựng lại hệ thống từ một bản clone sạch chỉ bằng README và chỉ ra chỗ README còn thiếu.
- Gây ba sự cố có kiểm soát trên kind (xóa Pod, sai tag image, sai mật khẩu database), đọc `get`, `describe`, `logs`, events để tìm nguyên nhân gốc, rồi hoàn tác.
- Viết troubleshooting log và runbook để người khác xử lý lại sự cố.
- Demo hệ thống trong 10 phút (Compose, CI/CD, Kubernetes), xử lý một sự cố ngay trên màn hình và giải thích các quyết định kỹ thuật.
- Nhận xét đồng đội bằng sự việc cụ thể và rút ra bài học cho hệ thống và cho khóa học.

## Thời gian thật

Khoảng 2 giờ đọc và 2 giờ lab bắt buộc ở trên lớp (buổi 32 là lượt demo của các nhóm), cộng khoảng 6 giờ bài tập tuần, trong đó có một lượt chạy thử demo có bấm giờ. Thử thách L2 và Phá lỗi nâng cao làm thêm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Chạy thử `docker compose up` và `kubectl get nodes` trên cluster `club`; nhóm thống nhất repo cần kiểm thử | [Buổi 30 – Implementation](../week-15/session-30.md) |
| Trong buổi 31 | Đọc 15 phút, lab 60 phút: clean clone, kind, ba sự cố, bảo mật, runbook | [Buổi 31 – Testing & Troubleshooting](session-31.md) |
| Trong buổi 32 | Preflight, demo 10 phút mỗi nhóm, hỏi đáp 5 phút, peer review và lessons learned | [Buổi 32 – Final Demo & Review](session-32.md) |
| Sau buổi | Thử thách L2 và Phá lỗi nâng cao | [Buổi 31 – Thử thách nâng cao](session-31-challenge.md), phần Thử thách thêm của [Buổi 32 – Final Demo & Review](session-32.md) |
| Sau buổi | Làm và nộp bài tập tuần | [Bài tập tuần 16](../../assignments/weekly/week-16.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop đang chạy; `kubectl config current-context` in `kind-club` và `kubectl get nodes` thấy node `Ready`.
- [ ] Repo capstone của nhóm chạy được bằng Compose và có thư mục `k8s/`; image `club-api:1.0.0`, `club-web:1.0.0` build được.
- [ ] Pipeline GitHub Actions xanh và image đã lên GHCR (từ [Buổi 30 – Implementation](../week-15/session-30.md)).
- [ ] Repo `devops-labs` (public) sẵn sàng theo [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md); cài đặt theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Cổng 8080 và 3000 trên máy còn trống (hoặc biết cách đổi `WEB_PORT`).
- [ ] Đã đọc [hướng dẫn demo](../../assignments/capstone/demo-guide.md) và [Rubric Capstone](../../curriculum/capstone-rubric.md).

## Tài liệu của tuần

- [Slide buổi 31](../../slides/08-capstone/session-31.md) và [slide buổi 32](../../slides/08-capstone/session-32.md).
- [Bài tập tuần 16](../../assignments/weekly/week-16.md): nộp hai thư mục `lab-31/` và `lab-32/`.
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-16.md).
- Tra cứu khi kẹt: [Cheatsheets](../../resources/cheatsheets.md), [Thuật ngữ](../../resources/glossary.md), [Xử lý sự cố cài đặt](../../resources/troubleshooting-setup.md).

Tuần trước: [Tuần 15 – Capstone Planning & Implementation](../week-15/README.md) · Tuần sau: không có, đây là tuần cuối; xem lại [Lộ trình](../../curriculum/syllabus.md).
