# 10 tình huống cố tình tạo lỗi

Phương pháp: mentor tạo lỗi, học viên chỉ được biết **triệu chứng**, không được biết nguyên nhân.
Học viên phải trình bày: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, biện pháp phòng tránh.

Mỗi tình huống có một thư mục riêng trong `examples/troubleshooting/` gồm đề bài (README), các file bị lỗi thật và script dựng lỗi. Xem [hướng dẫn dùng kit](troubleshooting/README.md).

| # | Lỗi | Kiến thức | Triệu chứng | Hướng xử lý (mentor) |
| --- | --- | --- | --- | --- |
| [01](troubleshooting/scenario-01/README.md) | Port đã được sử dụng | Port mapping, process | `docker run -p 28081:80` báo port is already allocated | Dùng `ss -ltnp` / `docker ps` tìm process; đổi port hoặc dừng process |
| [02](troubleshooting/scenario-02/README.md) | Container exit ngay khi start | Entrypoint, CMD, logs | `docker ps -a` thấy Exited (1) | `docker logs`; sửa CMD/ENTRYPOINT |
| [03](troubleshooting/scenario-03/README.md) | API không kết nối được DB | DNS, network, connection string | `/ready` trả 503 | Kiểm tra network chung, DNS bằng `getent hosts` hoặc `nslookup`, `DB_HOST` |
| [04](troubleshooting/scenario-04/README.md) | Database mất dữ liệu sau recreate | Volume persistence | Bảng members biến mất sau `down` rồi `up` | Đối chiếu đường dẫn dữ liệu thực của Postgres với điểm mount của volume |
| [05](troubleshooting/scenario-05/README.md) | Image build thất bại | Build context, Dockerfile | `"/package.json": not found` ở bước COPY | Kiểm tra build context, đường dẫn `COPY` và `.dockerignore` |
| [06](troubleshooting/scenario-06/README.md) | GitHub Actions fail | Workflow, permissions, logs | Job đỏ trong tab Actions | Đọc log step lỗi, kiểm tra `working-directory`, `permissions` |
| [07](troubleshooting/scenario-07/README.md) | ImagePullBackOff | Registry, image tag, credentials | Pod status ImagePullBackOff | `kubectl describe pod`; sửa tag, `kind load`, hoặc imagePullSecret |
| [08](troubleshooting/scenario-08/README.md) | CrashLoopBackOff | Logs, configuration, application | Pod restart liên tục | `kubectl logs --previous`; sửa cấu hình/ứng dụng |
| [09](troubleshooting/scenario-09/README.md) | Pod Pending | Resources, scheduling | Pod Pending không có node | `describe` xem Events; giảm requests hoặc thêm node |
| [10](troubleshooting/scenario-10/README.md) | Readiness probe fail | Health endpoint, dependencies | Pod 0/1 Ready, Service không có endpoint | Kiểm tra port và path của probe so với port ứng dụng thực sự lắng nghe |

Lệnh thường dùng khi điều tra Kubernetes:

```bash
kubectl get pods -n club
kubectl describe pod <pod-name> -n club
kubectl logs <pod-name> -n club
kubectl get events -n club --sort-by=.metadata.creationTimestamp
```
