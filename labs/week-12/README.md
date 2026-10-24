# Tuần 12 – kubectl và Services

Tuần 12/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 23-24/32

> **Tóm tắt:** Tuần này bạn học điều khiển cluster bằng kubectl, rồi mở workload ra bằng Service và DNS. Cuối tuần bạn tự điều tra hai lỗi hay gặp: image sai và Service không có Endpoints.

## Cuối tuần bạn làm được gì

- Biết mình đang đứng ở cluster nào, namespace nào trước khi gõ lệnh.
- Apply manifest, đọc trạng thái, log, exec, port-forward và trích dữ liệu bằng `-o yaml`, `jsonpath`.
- Cho Frontend gọi Backend bằng tên `backend` thay vì IP Pod, và giải thích vì sao chạy được.
- Chẩn đoán Pod `ImagePullBackOff` và Service có Endpoints rỗng bằng `describe`, `get endpoints`, `--show-labels`.

## Thời gian thật

Khoảng 2 giờ đọc và 2 giờ lab bắt buộc ở trên lớp hoặc tự học, cộng khoảng 5 giờ bài tập tuần. Thử thách L2 và Phá lỗi nâng cao làm thêm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Bật Docker Desktop, kiểm tra cluster `club` chạy (`kubectl config current-context` in `kind-club`) | [Buổi 22 – Pods & Deployments](../week-11/session-22.md) |
| Trong buổi 23 | Đọc 15 phút, lab 60 phút: context, namespace, apply, logs, exec, port-forward, jsonpath | [Buổi 23 – kubectl Fundamentals](session-23.md) |
| Trong buổi 24 | Đọc 15 phút, lab 60 phút: Service, DNS, Endpoints, port-forward tới frontend | [Buổi 24 – Kubernetes Services](session-24.md) |
| Sau buổi | Thử thách L2 và Phá lỗi nâng cao | [Buổi 23 – Thử thách nâng cao](session-23-challenge.md), phần Thử thách và Phá lỗi cuối [Buổi 24 – Kubernetes Services](session-24.md) |
| Sau buổi | Làm và nộp bài tập tuần | [Bài tập tuần 12](../../assignments/weekly/week-12.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop đang chạy và `kubectl get nodes` thấy node `Ready` (context `kind-club`).
- [ ] Namespace `club` có Postgres, hai Pod `club-api`, một Pod `club-web` đều `Running` (từ [Buổi 22 – Pods & Deployments](../week-11/session-22.md)).
- [ ] Image `club-api:1.0.0`, `club-web:1.0.0` đã nạp vào kind.
- [ ] Repo `devops-labs` (public) sẵn sàng theo [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md); cài đặt theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Cổng 8081 và 8082 trên máy còn trống (8080 thường bị Compose chiếm).

## Tài liệu của tuần

- [Slide buổi 23 – kubectl Fundamentals](../../slides/06-kubectl/session-23.md) và [slide buổi 24 – Kubernetes Services](../../slides/06-kubectl/session-24.md).
- [Bài tập tuần 12](../../assignments/weekly/week-12.md): nộp hai thư mục `lab-23/` và `lab-24/`.
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-12.md).
- Tra cứu khi kẹt: [Cheatsheets](../../resources/cheatsheets.md), [Thuật ngữ](../../resources/glossary.md).

Tuần trước: [Tuần 11 – Kubernetes Setup & Workloads](../week-11/README.md) · Tuần sau: [Tuần 13 – Configuration, Resources & Health](../week-13/README.md)
