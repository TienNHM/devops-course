# Ví dụ Docker Compose

| Thư mục | Nội dung | Buổi liên quan |
| --- | --- | --- |
| `web-db-basic/` | Web và database tối giản, biến `.env`, volume | Tuần 5-6 |
| `healthcheck-restart/` | Healthcheck, `service_healthy`, restart, limits, logging | Tuần 6 |

Quy ước: dùng cú pháp `docker compose` (Compose v2), file `compose.yaml` không có khóa `version`, image pin phiên bản, mật khẩu đọc từ `.env` (không commit; mỗi thư mục có `.env.example` và `.gitignore`). Ví dụ hoàn chỉnh hơn nằm ở `starter-project/compose.yaml`.
