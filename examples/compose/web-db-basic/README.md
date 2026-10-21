# web-db-basic: Compose tối giản

Buổi liên quan: Tuần 5-6 (Docker Compose: services, network mặc định, volume, biến môi trường).

## Chạy

```bash
cd examples/compose/web-db-basic
cp .env.example .env
# mở .env và đổi DB_PASSWORD thành giá trị của bạn
docker compose up -d
docker compose ps
```

Kết quả mong đợi (rút gọn):

```text
NAME                      IMAGE                COMMAND                  SERVICE   STATUS         PORTS
web-db-basic-db-1         postgres:17-alpine   "docker-entrypoint.s…"   db        Up 5 seconds   5432/tcp
web-db-basic-web-1        nginx:1.27-alpine    "/docker-entrypoint.…"   web       Up 4 seconds   0.0.0.0:38090->80/tcp
```

```bash
curl -s http://localhost:38090 | head -n 3
```

```text
<!doctype html>
<html lang="vi">
<head><meta charset="utf-8"><title>web-db-basic</title></head>
```

Database không publish cổng ra host: chỉ container trong cùng network (ví dụ `web`) truy cập được bằng tên `db`. Kiểm tra bằng:

```bash
docker compose exec db pg_isready -U postgres -d clubdb
docker compose exec web nslookup db
```

## Những điều cần quan sát

- `docker compose config` in ra cấu hình sau khi thay biến, dùng để debug file Compose.
- Nếu thiếu `DB_PASSWORD`, Compose báo lỗi ngay nhờ cú pháp `${DB_PASSWORD:?...}`.
- `depends_on` chỉ đảm bảo thứ tự khởi động, không đảm bảo database đã sẵn sàng. Ví dụ `healthcheck-restart` giải quyết vấn đề này.

## Dọn dẹp

```bash
docker compose down        # giữ volume db-data
docker compose down -v     # xóa luôn volume (mất dữ liệu)
```
