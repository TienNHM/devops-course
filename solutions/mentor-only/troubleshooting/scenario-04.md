# Đáp án 04: Database mất dữ liệu sau recreate

Đề bài dành cho học viên: [Kịch bản 04](../../../examples/troubleshooting/scenario-04/README.md).

## Nguyên nhân gốc

`compose.yaml` có khai báo và gắn named volume `ts04-pgdata` vào `/var/lib/postgresql/data`, nhưng đồng thời đặt `PGDATA=/var/lib/postgresql/pgdata`. Postgres khởi tạo và ghi dữ liệu ở `/var/lib/postgresql/pgdata`, tức nằm ngoài volume, trong lớp ghi (writable layer) của container. Volume tồn tại nhưng luôn rỗng. Khi `docker compose down` xóa container, lớp ghi biến mất cùng toàn bộ dữ liệu.

Điểm cần nhấn mạnh: "có volume" không đồng nghĩa với "dữ liệu nằm trong volume".

## Lệnh điều tra theo thứ tự

1. Xác nhận triệu chứng:

```bash
docker compose exec postgres psql -U club -d clubdb -c "SELECT name FROM members;"
```

Mong đợi (đã kiểm chứng): `ERROR:  relation "members" does not exist`.

2. Xem Postgres thực sự ghi ở đâu:

```bash
docker compose exec postgres psql -U club -d clubdb -Atc "SHOW data_directory;"
```

Mong đợi (đã kiểm chứng): `/var/lib/postgresql/pgdata`.

3. Xem volume được gắn ở đâu:

```bash
docker inspect ts04-postgres-1 --format '{{json .Mounts}}'
```

Mong đợi: một mount kiểu `volume` có `Destination` là `/var/lib/postgresql/data`. Hai đường dẫn khác nhau, đó chính là lỗi.

4. Kiểm tra biến môi trường:

```bash
docker inspect ts04-postgres-1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep PGDATA
```

## Cách sửa

Đưa `PGDATA` về bên trong điểm mount (hoặc xóa hẳn biến này để dùng giá trị mặc định của image):

```diff
     environment:
       POSTGRES_DB: clubdb
       POSTGRES_USER: club
       POSTGRES_PASSWORD: ${DB_PASSWORD:-demo-only-password}
-      PGDATA: /var/lib/postgresql/pgdata
+      PGDATA: /var/lib/postgresql/data/pgdata
```

Cách này đã kiểm chứng: sau khi sửa, tạo bảng, `docker compose down`, `docker compose up -d --wait`, dữ liệu vẫn còn. Lưu ý: volume `ts04-pgdata` ở thời điểm sửa vẫn rỗng nên Postgres sẽ khởi tạo cụm dữ liệu mới. Dữ liệu cũ không tự quay lại.

## Về dữ liệu đã mất

- Nếu container chưa bị xóa (mới dừng hoặc còn chạy): cứu được. Xuất bằng `docker compose exec -T postgres pg_dump -U club clubdb > backup.sql`, hoặc `docker cp ts04-postgres-1:/var/lib/postgresql/pgdata ./pgdata-backup` khi đã dừng container.
- Sau khi `docker compose down`: lớp ghi bị xóa cùng container, dữ liệu mất, không có cách khôi phục từ Docker. Chỉ khôi phục được từ bản sao lưu bên ngoài.
- Học viên phải nhập lại dữ liệu (ví dụ bằng `init.sql` hoặc seed script) sau khi sửa.

## Cách xác minh đã sửa

```bash
docker compose up -d --wait
docker compose exec -T postgres psql -U club -d clubdb -c "CREATE TABLE members (id int, name text); INSERT INTO members VALUES (1, 'Carol');"
docker compose down
docker compose up -d --wait
docker compose exec postgres psql -U club -d clubdb -c "SELECT name FROM members;"
```

Mong đợi (đã kiểm chứng): vẫn trả về `Carol`. Chú ý quy trình xác minh phải đi qua `down` và `up`, vì `restart` không phân biệt được cấu hình đúng hay sai (container cũ vẫn còn lớp ghi).

## Phòng tránh

- Không đặt `PGDATA` trừ khi hiểu rõ; nếu phải đặt thì phải nằm trong điểm mount của volume.
- Quy trình kiểm tra bắt buộc sau khi sửa cấu hình lưu trữ: ghi dữ liệu, `docker compose down`, `docker compose up`, đọc lại.
- Sao lưu định kỳ bằng `pg_dump`, và thử khôi phục thật.
- Dùng `docker compose down` (giữ volume) thay vì `down -v` (xóa volume) trong quy trình thường ngày.
- Lưu ý khi nâng cấp image: từ Postgres 18 trở đi, image đổi vị trí `PGDATA` mặc định theo phiên bản chính nên điểm mount khuyến nghị cũng khác. Kiểm tra tài liệu trên Docker Hub của phiên bản đang dùng. Bài này ghim `postgres:17-alpine`.

## Câu hỏi mentor

1. Khác biệt giữa named volume, bind mount và lớp ghi (writable layer) của container?
2. Vì sao `docker volume ls` vẫn liệt kê volume mà dữ liệu thì không có trong đó?
3. `docker compose down` và `docker compose down -v` khác nhau thế nào? Khi nào được phép dùng `-v`?
4. Làm sao chứng minh một thư mục trong container nằm trên volume hay trên lớp ghi? (`docker inspect` phần Mounts, hoặc `docker diff`.)
5. Vì sao `docker compose restart` không đủ để phát hiện lỗi này?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Có output trước và sau `down`/`up` |
| Nguyên nhân gốc | 30 | Phải chỉ ra hai đường dẫn khác nhau (`data_directory` và điểm mount) |
| Cách xác minh | 25 | `SHOW data_directory` hoặc `docker inspect` có output |
| Giải pháp | 20 | Sửa đúng và chứng minh qua chu trình `down` rồi `up` |
| Phòng tránh | 15 | Quy trình kiểm tra, sao lưu |
| Thưởng L2 | 10 | Nêu đúng giới hạn cứu dữ liệu trước và sau `down` |
