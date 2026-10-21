# Examples

Các ví dụ nhỏ, chạy được, bổ trợ cho bài lab. Mỗi thư mục có README giải thích cách chạy, kết quả mong đợi và buổi học liên quan. Ví dụ hoàn chỉnh nằm ở `starter-project/`.

| Thư mục | Nội dung | Tuần |
| --- | --- | --- |
| [linux](linux/README.md) | `access.log` để thực hành xử lý log, `permissions-lab.sh` (sandbox user/group/quyền), `resource-check.sh` | 1-2 |
| [docker](docker/README.md) | `nginx-demo`, `hello-node` (naive và optimized), `network-lab`, `postgres-volume` | 3-5 |
| [compose](compose/README.md) | `web-db-basic`, `healthcheck-restart` | 5-6 |
| [github-actions](github-actions/README.md) | Sáu workflow mẫu: CI, matrix, integration, publish GHCR, security scan, deploy dispatch | 9-12 |
| [kubernetes](kubernetes/README.md) | Manifest 01-08, `kind-3-nodes.yaml`, `deploy-local.sh` | 13-16 |
| [vibe](vibe/static-site/README.md) | Track Vibe Deploy: [static-site](vibe/static-site/README.md), [vercel-api](vibe/vercel-api/README.md), [netlify-function](vibe/netlify-function/README.md), [cloudflare-pages-function](vibe/cloudflare-pages-function/README.md), [supabase](vibe/supabase/README.md), [firebase](vibe/firebase/README.md), [club-landing](vibe/club-landing/README.md). Đi kèm [track Vibe Deploy](../vibe/index.md) | độc lập |
| [troubleshooting-scenarios.md](troubleshooting-scenarios.md) | Mười tình huống lỗi để luyện chẩn đoán | xuyên suốt |

## Quy ước chung

- Làm việc trong filesystem của WSL2 (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Image luôn pin phiên bản; không có secret thật. Mật khẩu minh họa phải được thay bằng giá trị riêng của bạn qua `.env` (không commit).
- Các ví dụ Docker dùng cổng 38080-38099 và 35432 trên máy host để tránh xung đột với starter project (8080, 3000, 5432).
- Mọi ví dụ đều có bước dọn dẹp. Hãy chạy nó khi xong để giải phóng tài nguyên.
