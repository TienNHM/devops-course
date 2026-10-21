# Đáp án 03: API không kết nối được DB

Đề bài dành cho học viên: [Kịch bản 03](../../../examples/troubleshooting/scenario-03/README.md).

## Nguyên nhân gốc

Trong `compose.yaml`, service `api` chỉ nằm trên network `app-net` còn `postgres` chỉ nằm trên `data-net`. Hai container ở hai network khác nhau nên DNS nội bộ của Docker không phân giải được tên `postgres` từ container `api`. Biến `DB_HOST=postgres` hoàn toàn đúng; lỗi nằm ở topology mạng.

## Lệnh điều tra theo thứ tự

1. Quan sát bên ngoài:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:23003/health
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:23003/ready
```

Mong đợi (đã kiểm chứng): `200` rồi `503`. `/health` không chạm DB nên vẫn xanh; `/ready` chạy `SELECT 1` nên đỏ.

2. Đọc log ứng dụng:

```bash
docker compose logs api
```

Mong đợi (đã kiểm chứng, rút gọn): có `code: 'ENOTFOUND'`, `syscall: 'getaddrinfo'`, `hostname: 'postgres'`. Đây là lỗi phân giải DNS, không phải sai mật khẩu hay Postgres từ chối kết nối.

3. Kiểm tra từ bên trong container `api`:

```bash
docker compose exec api sh -c 'getent hosts postgres; echo rc=$?'
```

Mong đợi (đã kiểm chứng): không có dòng địa chỉ nào và `rc=2`. Với `nslookup postgres` thì máy chủ DNS là `127.0.0.11` (DNS nhúng của Docker) nhưng không trả về địa chỉ.

4. Xem container nằm ở đâu:

```bash
docker network inspect ts03_app-net ts03_data-net --format '{{.Name}}: {{range .Containers}}{{.Name}} {{end}}'
```

Mong đợi: `ts03_app-net: ts03-api-1` và `ts03_data-net: ts03-postgres-1`. Hai container không chung network.

## Cách sửa

Cho hai service chung một network. Cách tối thiểu (đã kiểm chứng):

```diff
   postgres:
     ...
     networks:
-      - data-net
+      - app-net
 
 networks:
   app-net:
-  data-net:
```

Một cách khác hợp lệ: giữ `data-net` và thêm `data-net` vào danh sách `networks` của `api`. Lưu ý chỉ áp dụng lại bằng `docker compose up -d` (Compose tự tạo lại container bị đổi cấu hình mạng).

## Cách xác minh đã sửa

```bash
docker compose up -d
curl -s http://localhost:23003/ready
curl -s http://localhost:23003/api/members
```

Output mong đợi (đã kiểm chứng): `{"status":"ready"}` và danh sách Alice, Bob (Postgres được khởi tạo bằng `init.sql` của starter-project). Có thể thêm `docker compose exec api getent hosts postgres` để thấy một địa chỉ IP.

Cần chờ vài giây sau khi tạo lại: pool kết nối thử lại ở request kế tiếp nên không cần restart API.

## Phòng tránh

- Với stack nhỏ, dùng một network mặc định (không khai báo `networks`) hoặc một network chung như `club-network` của starter-project. Chỉ tách network khi có lý do bảo mật rõ ràng và có tài liệu kèm.
- Thêm `healthcheck` cho `api` (gọi `/ready`) để `docker compose ps` phản ánh đúng sức khỏe thực; kết hợp `depends_on` với `condition: service_healthy`.
- Kiểm tra kết nối từ trong container ngay sau khi dựng (`getent hosts`, hoặc script smoke test).
- Khi đọc lỗi, phân biệt `ENOTFOUND` (DNS), `ECONNREFUSED` (có địa chỉ nhưng không ai lắng nghe) và lỗi xác thực của Postgres.

## Câu hỏi mentor

1. Vì sao `/health` vẫn trả `200` nhưng `/ready` trả `503`? Hai endpoint này nên kiểm tra những gì?
2. Vì sao `docker compose ps` hiển thị `Up` cho `api`? (Không có healthcheck cho `api`; `Up` chỉ nghĩa là tiến trình còn chạy.)
3. Docker DNS nhúng (`127.0.0.11`) hoạt động trong phạm vi nào? Vì sao network mặc định `bridge` khác network do người dùng tạo?
4. Nếu đổi `DB_HOST` thành địa chỉ IP của Postgres, có sửa được không? Vì sao đó là ý tưởng tồi?
5. `ENOTFOUND` khác `ECONNREFUSED` thế nào, và mỗi lỗi chỉ ra nên kiểm tra gì?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Phân biệt được ba endpoint (`/health`, `/ready`, `/api/members`) |
| Nguyên nhân gốc | 30 | Phải nêu hai network khác nhau; "sai DB_HOST" chỉ được 5 vì `DB_HOST` đúng |
| Cách xác minh | 25 | Có kiểm tra từ trong container `api` hoặc `network inspect` |
| Giải pháp | 20 | Diff đúng và đã chạy lại |
| Phòng tránh | 15 | Healthcheck, network chung, smoke test |
| Thưởng L2 | 10 | Giải thích DNS nhúng và vì sao `/health` xanh |
