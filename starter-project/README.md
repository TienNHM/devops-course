# Club Management – Starter Project

Ứng dụng mẫu xuyên suốt khóa học: Node.js (Express 5) + PostgreSQL + Nginx frontend.
Đây là **skeleton để học**, chưa phải cấu hình production.

## Chạy bằng Docker Compose

```bash
cp .env.example .env        # đặt mật khẩu local, đổi WEB_PORT nếu 8080 bận
docker compose up -d --build
docker compose ps
curl http://localhost:3000/health
curl http://localhost:3000/api/members
# Giao diện: http://localhost:8080
```

Dừng và giữ dữ liệu: `docker compose down`. Xóa cả dữ liệu: `docker compose down -v`.

## Test backend

```bash
cd backend && npm ci && npm test
```

## Kubernetes (kind)

```bash
kind create cluster --name club --config k8s/kind-config.yaml
docker build -t club-api:1.0.0 ./backend && kind load docker-image club-api:1.0.0 --name club
docker build -t club-web:1.0.0 ./frontend && kind load docker-image club-web:1.0.0 --name club
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic club-secrets -n club --from-literal=db-password=<local-password>
kubectl apply -f k8s/configmap.yaml -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml -f k8s/frontend.yaml
kubectl get pods -n club
kubectl port-forward -n club svc/club-web 8080:80
```

- Ingress (`k8s/ingress.yaml`) cần cài ingress-nginx cho kind (Lab buổi 27).
- `database/init.sql` chỉ chạy tự động trong Compose; trên Kubernetes học viên tự nạp dữ liệu mẫu (Lab buổi 27).
- Không có secret thật trong repo: `k8s/secret.example.yaml` chỉ là ví dụ.

## Việc còn lại cho học viên

CRUD (`POST/PUT/DELETE /api/members`), migration, backup, hardening.

## Trạng thái kiểm chứng

- `npm test`: pass.
- Compose (postgres, backend, frontend): chạy được; `/health`, `/api/members` và proxy `/api/` qua frontend trả đúng.
- Manifests trong `k8s/` và workflows trong `.github/workflows/`: **chưa chạy thử** trên kind / GitHub.
