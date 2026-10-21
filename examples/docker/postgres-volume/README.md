# postgres-volume: dữ liệu bền vững, backup và restore

Buổi liên quan: Tuần 5 (volume và persistence, backup/restore database). Đây cũng là nền tảng cho tình huống lỗi "database mất dữ liệu sau recreate".

Script `postgres-volume.sh` chạy PostgreSQL 17 với một named volume `pglab-data`, rồi chứng minh hai điều:

1. Xóa container không làm mất dữ liệu nếu dữ liệu nằm trong volume.
2. Xóa cả volume thì mất dữ liệu, và phải restore từ file backup tạo bằng `pg_dump`.

Script publish cổng database chỉ trên `127.0.0.1:35432` (đổi bằng `PGLAB_PORT`). Mật khẩu đọc từ biến môi trường `PGLAB_PASSWORD`, không ghi cứng trong file.

## Chạy từng bước

```bash
cd examples/docker/postgres-volume
export PGLAB_PASSWORD='mat-khau-thu-nghiem'   # giá trị thử nghiệm, không dùng mật khẩu thật

./postgres-volume.sh up         # tạo container + volume
./postgres-volume.sh seed       # tạo bảng members và 3 dòng dữ liệu
./postgres-volume.sh recreate   # xóa container, tạo lại cùng volume
./postgres-volume.sh show       # dữ liệu vẫn còn
```

Kết quả mong đợi của `show` sau `recreate`:

```text
 id | name
----+------
  1 | An
  2 | Binh
  3 | Chi
(3 rows)
```

## Backup và restore

```bash
./postgres-volume.sh backup     # ghi pglab-backup.sql bằng pg_dump

# Mô phỏng sự cố: mất cả container lẫn volume
docker rm -f pglab
docker volume rm pglab-data

./postgres-volume.sh up         # database trống
./postgres-volume.sh show       # lỗi: relation "members" does not exist
./postgres-volume.sh restore    # nạp lại từ file backup
./postgres-volume.sh show       # dữ liệu quay lại
```

Lệnh `pg_dump` được chạy bên trong container qua `docker exec`, kết quả được chuyển hướng ra file ở host. Restore làm ngược lại bằng cách đưa file vào `psql` qua stdin.

## Thử nghiệm: không dùng volume

Chạy một container Postgres mà không có `-v`:

```bash
docker run -d --name pg-novol -e POSTGRES_PASSWORD="$PGLAB_PASSWORD" postgres:17-alpine
```

Image Postgres khai báo `VOLUME` nên Docker vẫn tạo một anonymous volume ngẫu nhiên. Dùng `docker volume ls` để thấy nó, và `docker rm -fv pg-novol` (cờ `-v` xóa luôn anonymous volume) để dọn. Bài học: luôn dùng named volume để biết dữ liệu nằm đâu và không bị mất khi dọn dẹp.

## Câu hỏi để giải thích

- Volume khác gì với bind mount về vị trí lưu và quyền?
- `docker compose down` và `docker compose down -v` khác nhau như thế nào?
- Vì sao backup phải nằm ngoài volume và ngoài container?
- Backup logic (`pg_dump`) khác backup file thô của thư mục data ở điểm nào?

## Dọn dẹp

```bash
./postgres-volume.sh down
rm -f pglab-backup.sql
```
