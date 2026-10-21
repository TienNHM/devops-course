# healthcheck-restart: Compose gần với production hơn

Buổi liên quan: Tuần 6 (healthcheck, thứ tự khởi động, restart policy, giới hạn tài nguyên, logging). Liên quan tình huống lỗi "container exit ngay" và "API không kết nối được DB".

File `compose.yaml` minh họa năm điều:

| Tính năng | Cấu hình | Ý nghĩa |
| --- | --- | --- |
| Healthcheck | `healthcheck:` ở `db` và `app` | Docker biết dịch vụ đã thật sự sẵn sàng, không chỉ "process đang chạy" |
| Thứ tự khởi động | `depends_on` với `condition: service_healthy` | `app` chỉ khởi động sau khi `db` healthy |
| Restart | `restart: unless-stopped` | Tự khởi động lại khi process thoát hoặc crash |
| Giới hạn tài nguyên | `deploy.resources.limits` | Tối đa 0.50 CPU/256M cho db, 0.25 CPU/64M cho app |
| Logging | `json-file` với `max-size`, `max-file` | Log không phình vô hạn |

## Chạy

```bash
cd examples/compose/healthcheck-restart
cp .env.example .env     # sửa DB_PASSWORD
docker compose up -d
docker compose ps
```

Kết quả mong đợi sau khoảng 20 giây (rút gọn):

```text
SERVICE   STATUS
app       Up 16 seconds (healthy)
db        Up 22 seconds (healthy)
```

Khi chạy `up`, bạn thấy `db` chuyển sang `Healthy` trước rồi `app` mới `Starting`. Đó là tác dụng của `service_healthy`.

## Thí nghiệm

### 1. Xem giới hạn tài nguyên có hiệu lực

```bash
docker stats --no-stream --format '{{.Name}} {{.MemUsage}}'
```

```text
healthcheck-restart-app-1 10.97MiB / 64MiB
healthcheck-restart-db-1 29.66MiB / 256MiB
```

Phần sau dấu `/` là giới hạn bộ nhớ đã áp dụng.

### 2. Restart policy

Cho tiến trình chính của `app` thoát từ bên trong:

```bash
docker compose exec app sh -c 'kill 1'
sleep 5
docker compose ps
docker inspect healthcheck-restart-app-1 --format '{{.RestartCount}}'
```

```text
1
```

Container được Docker khởi động lại (`RestartCount` tăng). Lưu ý: nếu bạn dừng container thủ công bằng `docker kill` hoặc `docker compose kill`, Docker coi đó là hành động của người dùng và không tự restart, đây là hành vi bình thường chứ không phải lỗi.

### 3. Làm healthcheck fail

Sửa `test` của `app` thành một URL không tồn tại (ví dụ `http://127.0.0.1/khong-co`), chạy `docker compose up -d`, đợi và xem:

```bash
docker inspect healthcheck-restart-app-1 --format '{{.State.Health.Status}}'
docker inspect healthcheck-restart-app-1 --format '{{range .State.Health.Log}}{{.Output}}{{end}}'
```

Trạng thái chuyển sang `unhealthy` sau vài lần thử thất bại. Lưu ý: Docker Engine chỉ đánh dấu `unhealthy`, không tự restart container; muốn tự phục hồi cần orchestrator (Kubernetes dùng liveness probe cho mục đích này).

### 4. Giới hạn log

```bash
docker inspect healthcheck-restart-app-1 --format '{{.HostConfig.LogConfig}}'
```

Kết quả hiển thị driver `json-file` cùng `max-size` và `max-file`.

## Câu hỏi để giải thích

- Khác nhau giữa `depends_on` thường và `condition: service_healthy`?
- `start_period` trong healthcheck để làm gì?
- Vì sao nên publish cổng chỉ trên `127.0.0.1`?
- Healthcheck Docker khác readiness/liveness probe của Kubernetes ở điểm nào?

## Dọn dẹp

```bash
docker compose down -v
rm .env
```
