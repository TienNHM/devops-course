# Setup Guide (Windows 11 + WSL2)

## Phần cứng
| RAM | Mục tiêu |
| --- | --- |
| 8 GB (tối thiểu) | Linux, Git, Docker cơ bản. Tạm dừng Compose stack trước khi chạy kind |
| 16 GB (khuyến nghị) | Compose, kind một node |
| 32 GB | kind nhiều node |

## Công cụ
| Công cụ | Khi nào | Ghi chú |
| --- | --- | --- |
| Git, VS Code, GitHub account | Tuần 1 | |
| WSL2 + Ubuntu | Tuần 1 | `wsl --install -d Ubuntu` (PowerShell admin) |
| Docker Desktop (WSL2 backend) | Tuần 4 | Bật WSL integration cho Ubuntu |
| kubectl, kind | Tuần 11 | |
| Postman/Bruno, Lens/Headlamp | Tùy chọn | |

## Kiểm tra môi trường
```bash
git --version
docker version
docker compose version
kubectl version --client
kind version
node --version
```

## Cài đặt tham khảo (tài liệu chính thức)
- Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/
- WSL: https://learn.microsoft.com/en-us/windows/wsl/install
- kind: https://kind.sigs.k8s.io/docs/user/quick-start/
- kubectl: https://kubernetes.io/docs/tasks/tools/

Làm việc trong filesystem của WSL (`~/`), không dùng `/mnt/c` để tránh chậm I/O.
