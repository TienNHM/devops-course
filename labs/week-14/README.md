# Tuần 14 – Storage, Ingress & Operations

Tuần 14/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 27-28/32

> **Tóm tắt:** Tuần này bạn cho Postgres giữ dữ liệu bằng PVC, mở ứng dụng qua Ingress `club.localhost`, rồi tự phá và tự sửa ba lỗi Kubernetes phổ biến bằng bằng chứng từ events, logs và exit code.

## Cuối tuần bạn làm được gì

- Chứng minh dữ liệu Postgres còn nguyên sau khi xóa Pod, và giải thích vì sao xóa PVC thì mất.
- Truy cập Club Management bằng `http://club.localhost` thay vì `port-forward` từng Service.
- Nâng cấp, scale và rollback một Deployment, và nhận ra lỗi bị che bởi Pod cũ.
- Chẩn đoán `ImagePullBackOff`, `CrashLoopBackOff`, `Pending` bằng `describe`, `logs --previous` và events, rồi viết report 5 mục.

## Thời gian thật

Khoảng 30 phút đọc và 2 giờ lab bắt buộc trên lớp hoặc tự học, cộng khoảng 6 giờ bài tập tuần. Thử thách L2 và Phá lỗi nâng cao làm thêm ở nhà.

## Lộ trình tuần

| Khi nào | Việc cần làm | Tài liệu |
| --- | --- | --- |
| Trước buổi | Bật Docker Desktop, kiểm tra cluster `club` chạy (`kubectl config current-context` in `kind-club`) | [Buổi 26 – Resource & Health](../week-13/session-26.md) |
| Trong buổi 27 | Đọc 15 phút, lab 60 phút: PVC cho Postgres, nạp `init.sql`, xóa Pod, ingress-nginx, `club.localhost` | [Buổi 27 – Storage & Ingress](session-27.md) |
| Trong buổi 28 | Đọc 15 phút, lab 60 phút: rollout, scale, rollback, ba lỗi ImagePullBackOff, CrashLoopBackOff, Pending | [Buổi 28 – Kubernetes Operations](session-28.md) |
| Sau buổi | Thử thách L2 và Phá lỗi nâng cao | [Buổi 27 – Thử thách nâng cao](session-27-challenge.md), [Buổi 28 – Thử thách nâng cao](session-28-challenge.md) |
| Sau buổi | Làm và nộp bài tập tuần | [Bài tập tuần 14](../../assignments/weekly/week-14.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Docker Desktop đang chạy và `kubectl get nodes` thấy node `club-control-plane` `Ready` (context `kind-club`).
- [ ] Cluster `club` được tạo bằng `~/devops-course/starter-project/k8s/kind-config.yaml` (có map port 80, 443); `docker ps` thấy `0.0.0.0:80->80/tcp`.
- [ ] Image `club-api:1.0.0`, `club-web:1.0.0` có trong Docker và đã nạp vào kind.
- [ ] Port 80 trên máy còn trống (kind sẽ dùng); repo `devops-labs` (public) sẵn sàng theo [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md); cài đặt theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- [ ] Làm trong filesystem WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.

## Tài liệu của tuần

- [Slide buổi 27 – Storage & Ingress](../../slides/07-operations/session-27.md) và [slide buổi 28 – Kubernetes Operations](../../slides/07-operations/session-28.md).
- [Bài tập tuần 14](../../assignments/weekly/week-14.md): nộp hai thư mục `lab-27/` và `lab-28/`.
- [Đối chiếu đáp án (mở sau khi nộp bài)](../../mentors/walkthroughs/week-14.md).
- Tra cứu khi kẹt: [Cheatsheets](../../resources/cheatsheets.md), [Thuật ngữ](../../resources/glossary.md), [Xử lý sự cố cài đặt](../../resources/troubleshooting-setup.md).

Tuần trước: [Tuần 13 – Configuration, Resources & Health](../week-13/README.md) · Tuần sau: [Tuần 15 – Capstone Planning & Implementation](../week-15/README.md)
