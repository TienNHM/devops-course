# Tuần 13 – Configuration, Resources & Health

Tuần 13/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 25-26/32

> **Tóm tắt:** Tuần này bạn đưa cấu hình và mật khẩu ra khỏi image bằng ConfigMap và Secret, rồi khai báo tài nguyên và health check để cluster tự xử lý đúng khi Pod hỏng. Cuối tuần bạn tự chẩn đoán lỗi cấu hình sai, OOMKilled và readiness probe fail.

## Cuối tuần bạn làm được gì

- Cho `club-api` đọc cấu hình từ ConfigMap và mật khẩu từ Secret, và giải thích vì sao base64 không phải bảo mật.
- Dự đoán đúng khi nào Pod thấy giá trị mới: biến môi trường chỉ đổi sau khi tạo lại Pod, file mount được đồng bộ sau một lúc.
- Đặt requests, limits và ba loại probe cho `club-api`, và biết probe nào làm Pod restart, probe nào chỉ gỡ Pod khỏi Endpoints.
- Chẩn đoán ba lỗi hay gặp: `DB_HOST` sai, container bị OOMKilled, Pod `Running` nhưng `0/1`.

## Thời gian thật

Khoảng 2 giờ đọc và 2 giờ lab bắt buộc ở trên lớp hoặc tự học, cộng khoảng 3 giờ làm bài tập tuần (chủ yếu là gom bằng chứng của lab). Thử thách L2 và Phá lỗi nâng cao làm thêm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Bật Docker Desktop, kiểm tra cluster `club` chạy (`kubectl config current-context` in `kind-club`) và `club-api`, `postgres` Ready | [Buổi 24 – Kubernetes Services](../week-12/session-24.md) |
| Trong buổi 25 | Đọc 15 phút, lab 60 phút: ConfigMap, Secret, file mount, `DB_HOST` sai | [Buổi 25 – Configuration Management](session-25.md) |
| Trong buổi 26 | Đọc 15 phút, lab 60 phút: requests, limits, ba probe, OOMKilled, readiness fail | [Buổi 26 – Resource & Health](session-26.md) |
| Sau buổi | Thử thách L2 và Phá lỗi nâng cao | [Buổi 25 – Thử thách nâng cao](session-25-challenge.md), [Buổi 26 – Thử thách nâng cao](session-26-challenge.md) |
| Sau buổi | Làm và nộp bài tập tuần | [Bài tập tuần 13](../../assignments/weekly/week-13.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop đang chạy và `kubectl get nodes` thấy node `Ready` (context `kind-club`).
- [ ] Namespace `club` có Postgres và hai Pod `club-api` đều `Running` (từ [Buổi 22 – Pods & Deployments](../week-11/session-22.md) và [Buổi 24 – Kubernetes Services](../week-12/session-24.md)).
- [ ] Image `club-api:1.0.0`, `club-web:1.0.0` đã nạp vào kind.
- [ ] Repo giáo trình ở `~/devops-course`; repo `devops-labs` (public) sẵn sàng theo [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md); cài đặt theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Làm việc trong filesystem của WSL (không dùng `/mnt/c`); cổng 13000 trên máy còn trống cho `port-forward`.

## Tài liệu của tuần

- [Slide buổi 25 – Configuration Management](../../slides/06-kubectl/session-25.md) và [slide buổi 26 – Resource & Health](../../slides/07-operations/session-26.md).
- [Bài tập tuần 13](../../assignments/weekly/week-13.md): nộp hai thư mục `lab-25/` và `lab-26/`.
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-13.md).
- Tra cứu khi kẹt: [Cheatsheets](../../resources/cheatsheets.md), [Thuật ngữ](../../resources/glossary.md), [Troubleshooting cài đặt](../../resources/troubleshooting-setup.md).

Tuần trước: [Tuần 12 – kubectl và Services](../week-12/README.md) · Tuần sau: [Tuần 14 – Storage, Ingress & Operations](../week-14/README.md)
