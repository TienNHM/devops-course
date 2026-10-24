# Tuần 11 – Kubernetes Setup & Workloads

Tuần 11/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 21 và 22 trên 32

> **Tóm tắt:** Dựng cluster Kubernetes local bằng kind, rồi deploy Club API lên đó, cập nhật phiên bản, quay lui và tự sửa lỗi ImagePullBackOff.

## Cuối tuần này bạn làm được

- Dựng một cluster Kubernetes thật trên laptop (kind, tên `club`) và đọc được bên trong nó: Pod hệ thống nào làm việc gì.
- Deploy Club API thành 2 bản bằng Deployment, gọi được qua `kubectl port-forward`.
- Cập nhật lên phiên bản mới mà không gián đoạn, quay lại bản cũ, và tìm ra nguyên nhân khi Pod báo ImagePullBackOff.

## Thời gian thật

Mỗi buổi khoảng 15 phút đọc và 60 phút lab bắt buộc; tổng khoảng 2,5 đến 3 giờ cho cả tuần. Thử thách tùy chọn ở nhà thêm khoảng 1,5 giờ. Bài tập tuần không có việc mới, chỉ nộp lại bằng chứng của lab (xem [Bài tập Tuần 11](../../assignments/weekly/week-11.md)).

## Lộ trình tuần

| Khi nào | Việc cần làm | Bài |
| --- | --- | --- |
| Trước buổi | Docker Desktop chạy, cài `kubectl` và `kind`, clone repo giáo trình vào `~/devops-course`; máy 8 GB tắt Compose | [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md) |
| Trong buổi 21 | Hiểu control plane và node; tạo cluster `club`; tự phá và sửa lỗi kubectl mất kết nối | [Buổi 21 – Kubernetes Introduction](session-21.md) |
| Trong buổi 22 | Build và nạp image, deploy Club API, rolling update, rollback, ImagePullBackOff | [Buổi 22 – Pods & Deployments](session-22.md) |
| Sau buổi | Nộp `lab-21/` và `lab-22/`; thử thách tùy chọn | [Buổi 21 – Thử thách thêm](session-21-challenge.md), [Buổi 22 – Thử thách thêm](session-22-challenge.md) |

## Checklist chuẩn bị cho cả tuần

- [ ] Windows 11 + WSL2 Ubuntu, Docker Desktop đang chạy và bật tích hợp WSL
- [ ] `kubectl version --client` và `kind version` (kind từ 0.23) chạy được trong WSL
- [ ] Repo giáo trình ở `~/devops-course`, repo cá nhân `devops-labs` để PUBLIC ([Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md))
- [ ] Máy 8 GB: `docker compose down` trước khi dựng kind; cổng 80 và 443 của máy đang rảnh
- [ ] Làm việc trong filesystem của WSL (`~/`), không dùng `/mnt/c`

## Môi trường thống nhất

Cluster kind tên `club`, context `kind-club`, tạo ở buổi 21 bằng `kind create cluster --name club --config ~/devops-course/starter-project/k8s/kind-config.yaml` và giữ nguyên tới tuần 14. Bạn không cần xóa cluster giữa các buổi. Máy 8 GB chỉ chạy một "tầng" tại một thời điểm: Compose hoặc kind.

## Tài liệu của tuần

- Slide: [Slide Buổi 21 – Kubernetes Introduction](../../slides/05-kubernetes/session-21.md), [Slide Buổi 22 – Pods & Deployments](../../slides/05-kubernetes/session-22.md)
- Bài tập: [Bài tập Tuần 11](../../assignments/weekly/week-11.md)
- Đối chiếu đáp án (mở sau khi nộp bài): [Walkthrough tuần 11](../../mentors/walkthroughs/week-11.md)

## Tuần trước và tuần sau

- Tuần trước: [Tuần 10 – CD & Pipeline Security](../week-10/README.md)
- Tuần sau: [Tuần 12 – kubectl & Services](../week-12/README.md)
