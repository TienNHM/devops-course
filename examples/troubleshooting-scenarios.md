# 10 tình huống cố tình tạo lỗi

Phương pháp: mentor tạo lỗi, học viên chỉ được biết **triệu chứng**, không được biết nguyên nhân.
Học viên phải trình bày: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, biện pháp phòng tránh.

| # | Lỗi | Kiến thức | Triệu chứng | Hướng xử lý (mentor) |
| --- | --- | --- | --- | --- |
| 01 | Port đã được sử dụng | Port mapping, process | `docker run -p 8080:80` báo port is already allocated | Dùng `ss -ltnp` / `docker ps` tìm process; đổi port hoặc dừng process |
| 02 | Container exit ngay khi start | Entrypoint, CMD, logs | `docker ps -a` thấy Exited (0/1) | `docker logs`; sửa CMD/ENTRYPOINT |
| 03 | API không kết nối được DB | DNS, network, connection string | `/ready` trả 503 | Kiểm tra `DB_HOST`, network chung, DNS bằng `nslookup` |
| 04 | Database mất dữ liệu sau recreate | Volume persistence | Bảng members trống sau khi recreate | Mount named volume đúng đường dẫn dữ liệu |
| 05 | Image build thất bại | Build context, Dockerfile | `COPY failed: file not found` | Kiểm tra build context và `.dockerignore` |
| 06 | GitHub Actions fail | Workflow, permissions, logs | Job đỏ trong tab Actions | Đọc log step lỗi, kiểm tra `working-directory`, `permissions` |
| 07 | ImagePullBackOff | Registry, image tag, credentials | Pod status ImagePullBackOff | `kubectl describe pod`; sửa tag, `kind load`, hoặc imagePullSecret |
| 08 | CrashLoopBackOff | Logs, configuration, application | Pod restart liên tục | `kubectl logs --previous`; sửa cấu hình/ứng dụng |
| 09 | Pod Pending | Resources, scheduling | Pod Pending không có node | `describe` xem Events; giảm requests hoặc thêm node |
| 10 | Readiness probe fail | Health endpoint, dependencies | Pod 0/1 Ready, Service không có endpoint | Kiểm tra `/ready`, kết nối DB, port và path của probe |

Lệnh thường dùng khi điều tra Kubernetes:

```bash
kubectl get pods -n club
kubectl describe pod <pod-name> -n club
kubectl logs <pod-name> -n club
kubectl get events -n club --sort-by=.metadata.creationTimestamp
```
