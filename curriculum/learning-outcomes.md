# Chuẩn đầu ra

> **Tóm tắt:** Danh sách những việc bạn làm được sau khóa, cách tự kiểm chứng từng việc, và hai mức L1, L2 của mỗi lab.

| Năng lực | Chuẩn đầu ra | Bạn kiểm chứng bằng cách |
| --- | --- | --- |
| Linux | Sử dụng CLI, quản lý process, permission, service | tự tìm lỗi trong một file log chỉ bằng `grep`, `tail` và pipe |
| Git/GitHub | Branch, PR, review, conflict resolution | mở một Pull Request, nhận review và gỡ được một conflict |
| Networking | Hiểu IP, DNS, port, TCP, HTTP, reverse proxy | dùng `curl` và `ss` chỉ ra vì sao một cổng không truy cập được |
| Docker | Viết Dockerfile, build, run, debug container | build image từ Dockerfile của chính bạn và `docker logs` ra lỗi khi nó hỏng |
| Docker Compose | Vận hành hệ thống nhiều container | `docker compose up` dựng cả web, API, Postgres và dữ liệu còn nguyên sau khi tạo lại |
| CI/CD | Tự động test, build và publish image | đẩy mã lên và thấy workflow tự chạy kiểm thử, build rồi publish image |
| Kubernetes | Hiểu kiến trúc cluster và các workload | vẽ lại được các thành phần cluster và nói Pod, Deployment, Service khác nhau thế nào |
| kubectl | Deploy, inspect, debug, scale, rollback | triển khai, scale, rồi `kubectl rollout undo` một bản cập nhật lỗi |
| DevOps | Xây dựng quy trình tự động hóa có thể tái sử dụng | một người khác chạy lại quy trình của bạn từ README mà không cần hỏi |
| Troubleshooting | Phân tích log, xác định nguyên nhân và khắc phục lỗi | viết được triệu chứng, nguyên nhân gốc, lệnh kiểm chứng và cách sửa của một sự cố |

## Hai mức yêu cầu cho mỗi lab

| Level | Đối tượng | Yêu cầu |
| --- | --- | --- |
| L1 – Foundation | Chưa có kinh nghiệm | Hoàn thành theo hướng dẫn |
| L2 – Engineering | Đã biết lập trình/Git | Tự triển khai, giải thích và xử lý lỗi |

Ví dụ Docker Compose: L1 chạy được Backend và Database; L2 tự viết Compose, thiết lập healthcheck, volume, network và restart policy.
