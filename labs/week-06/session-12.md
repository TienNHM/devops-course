# Ngày 7 – Postgres giữ dữ liệu bằng volume

Lộ trình Cơ bản · Ngày 7/10 · khoảng 2 giờ

[Slide Ngày 7](../../slides/02-docker/session-12.md) · [Thử thách thêm](session-12-challenge.md)

> **Tóm tắt:** Chạy Postgres của Club với named volume, nạp `database/init.sql`, chứng minh dữ liệu còn sau `docker rm` và làm một bản backup bằng `pg_dump`.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** một container Postgres có bảng `members` của Club, dữ liệu sống sót khi bạn xóa container, và file `notes/day-07-backup.sql` đã được thử restore.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 6 – Dockerfile cho Club API](../week-05/session-09.md)
- [ ] Docker Desktop đang chạy, terminal WSL mở trong `~` (`pwd` bắt đầu bằng `/home/`, không phải `/mnt/c`). Xem [Setup Guide](../../resources/setup-guide.md)
- [ ] Repo `devops-labs` đã clone ở `~/devops-labs`, có thư mục `club/` ([hướng dẫn repo](../../resources/setup-github.md))
:::

## Bài toán thật

Một bạn trong CLB dựng Postgres để lưu danh sách thành viên, nhập 30 người đăng ký đầu học kỳ. Hôm sau bạn ấy cập nhật image: xóa container cũ, chạy container mới. Bảng `members` trống trơn, không có lỗi nào được báo. Container dùng một lần là điểm mạnh, nhưng dữ liệu database thì không được mất. Hôm nay bạn tách dữ liệu ra khỏi container, kiểm chứng điều đó bằng lệnh, và có sẵn backup phòng khi lỡ tay xóa cả volume.

Ý chính, gắn với lệnh bạn sắp gõ: dữ liệu ghi bên trong container bị xóa cùng container. Dữ liệu trong **named volume** do Docker giữ riêng, container mới gắn lại là thấy. Postgres ghi dữ liệu ở `/var/lib/postgresql/data`, nên volume phải gắn đúng đường dẫn này.

## Làm

Mọi lệnh chạy trong WSL. Bài này không mở cổng ra máy (bạn vào Postgres bằng `docker exec`), nên không đụng cổng 5432.

### Bước 1: Chuẩn bị

Vào thư mục Club, đặt mật khẩu giả cho lab và dọn container cũ nếu có.

```bash
cd ~/devops-labs/club
ls database
export PGPASS=lab-only-password
docker rm -f club-db 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
docker version --format '{{.Server.Version}}'
```

Kết quả mong đợi: `init.sql` trong danh sách, và số phiên bản Docker Engine (27 trở lên). `PGPASS` chỉ là mật khẩu giả cho lab, đừng dùng mật khẩu thật. Mỗi lần mở terminal mới, chạy lại dòng `export`.

::: tip Kiểm tra: bạn đúng khi
`ls database` thấy `init.sql`. Không thấy? Bạn chưa ở trong `~/devops-labs/club`, hoặc chưa xong Ngày 3.
:::

### Bước 2: Chạy Postgres với volume và init.sql

Tạo volume có tên, rồi chạy Postgres gắn volume vào `/var/lib/postgresql/data`. File `init.sql` của Club được gắn (chỉ đọc) vào `/docker-entrypoint-initdb.d/`: Postgres tự chạy nó khi database còn trống.

```bash
docker volume create club-pgdata
docker run -d --name club-db \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  --mount type=bind,source="$PWD/database/init.sql",target=/docker-entrypoint-initdb.d/init.sql,readonly \
  postgres:17-alpine
until docker exec club-db pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id;"
```

Kết quả mong đợi: vài dòng `no response` (bình thường, Postgres đang khởi tạo), rồi `accepting connections`, rồi bảng có 2 dòng Alice và Bob. Có `-h 127.0.0.1` vì lúc khởi tạo đầu có một server tạm chỉ nghe qua unix socket; kiểm tra qua TCP chỉ thành công khi server thật đã chạy.

::: tip Kiểm tra: bạn đúng khi
`SELECT` ra đúng 2 dòng Alice và Bob. Treo hoặc lỗi? Xem [Gặp lỗi?](#gap-loi).
:::

### Bước 3: Thêm dữ liệu, xóa container, tạo lại

Thêm một thành viên mới, rồi xóa hẳn container. Volume vẫn còn.

```bash
docker exec club-db psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker rm -f club-db
docker ps -a --filter name=club-db
docker volume ls --filter name=club-pgdata
```

Kết quả mong đợi: danh sách container rỗng, nhưng volume `club-pgdata` vẫn có. Giờ tạo container mới gắn lại volume cũ (lần này không cần gắn `init.sql`):

```bash
docker run -d --name club-db2 \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  postgres:17-alpine
until docker exec club-db2 pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db2 psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id;"
docker logs club-db2 | grep -i "skipping"
```

Kết quả mong đợi: 3 dòng Alice, Bob, Carol mà bạn không tạo lại bảng, và log có `Skipping initialization`. Container chỉ là lớp vỏ thay thế được; dữ liệu nằm trong volume.

::: tip Kiểm tra: bạn đúng khi
Carol vẫn còn sau khi container cũ đã bị xóa. Mất dữ liệu? Xem [Gặp lỗi?](#gap-loi).
:::

### Bước 4: Kiểm chứng volume thật sự được dùng

Có volume trong `docker volume ls` chưa chắc Postgres đang ghi vào nó. So hai đường dẫn: nơi Docker gắn volume và nơi Postgres ghi dữ liệu.

```bash
docker inspect club-db2 --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{"\n"}}{{end}}'
docker exec club-db2 psql -U club -d clubdb -tA -c "SHOW data_directory;"
```

Kết quả mong đợi: `volume club-pgdata -> /var/lib/postgresql/data` và `/var/lib/postgresql/data`. Hai đường dẫn phải trùng nhau. Đây là phép thử nhanh nhất khi nghi ngờ "có volume mà vẫn mất dữ liệu".

::: tip Kiểm tra: bạn đúng khi
Đích mount và `data_directory` giống hệt nhau.
:::

### Bước 5: Backup bằng pg_dump

`pg_dump` xuất database ra file SQL đọc được, an toàn khi database đang chạy. Lưu file vào thư mục `notes/` của repo.

```bash
docker exec club-db2 pg_dump -U club -d clubdb > ~/devops-labs/notes/day-07-backup.sql
head -n 3 ~/devops-labs/notes/day-07-backup.sql
grep -c "Carol" ~/devops-labs/notes/day-07-backup.sql
```

Kết quả mong đợi: file bắt đầu bằng comment `-- PostgreSQL database dump`, và `grep -c` in `1`.

### Bước 6: Thử restore (backup chưa restore thì chưa phải backup)

Giả lập thảm họa: xóa cả container và volume, dựng database rỗng, rồi nạp lại từ file backup.

::: danger Chỉ xóa đúng volume của bài này
`docker volume rm` xóa dữ liệu vĩnh viễn. Chỉ xóa `club-pgdata`, không bao giờ dùng `docker volume prune` trên máy có dự án khác. Chạy `docker volume ls` để chắc tên đúng trước khi xóa.
:::

```bash
docker rm -f club-db2
docker volume rm club-pgdata
docker run -d --name club-db3 \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  postgres:17-alpine
until docker exec club-db3 pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db3 psql -U club -d clubdb -c "\dt"
docker exec -i club-db3 psql -U club -d clubdb -v ON_ERROR_STOP=1 < ~/devops-labs/notes/day-07-backup.sql
docker exec club-db3 psql -U club -d clubdb -c "SELECT id, name, email FROM members ORDER BY id;"
```

Kết quả mong đợi: `\dt` báo `Did not find any relations.` (database mới rỗng), restore in `CREATE TABLE` và `COPY 3`, rồi `SELECT` cho thấy lại Alice, Bob, Carol. Nhớ `docker exec -i` (có `-i`) khi đưa file vào qua `<`; thiếu `-i`, restore trống mà không báo lỗi.

::: tip Kiểm tra: bạn đúng khi
`SELECT` sau restore ra đủ 3 người, kể cả Carol. Bảng vẫn trống? Xem [Gặp lỗi?](#gap-loi).
:::

Dọn dẹp khi xong:

```bash
docker rm -f club-db club-db2 club-db3 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
```

## Gặp lỗi? {#gap-loi}

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Có volume trong `docker volume ls` nhưng sau khi tạo lại, `SELECT` báo `relation "members" does not exist` | Điểm mount không khớp nơi Postgres ghi (gõ sai đường dẫn) | So `docker inspect` với `SHOW data_directory;`, sửa cho hai đường dẫn trùng nhau |
| Đổi `POSTGRES_PASSWORD` nhưng mật khẩu cũ vẫn dùng | Biến `POSTGRES_*` chỉ áp dụng khi khởi tạo lần đầu | Dùng `ALTER USER`, hoặc xóa volume (sau khi backup) |
| Sửa `init.sql` nhưng bảng không đổi | Script trong `docker-entrypoint-initdb.d` chỉ chạy khi thư mục dữ liệu trống | Dùng `psql` để áp dụng thay đổi, hoặc tạo volume mới |
| Restore xong bảng vẫn trống, không có lỗi | Thiếu `-i` nên file không vào container | Thêm `-i`, kiểm tra bằng `SELECT` |
| `docker volume rm` báo `volume is in use` | Còn container (kể cả đã dừng) đang dùng volume | `docker rm -f` container đó trước |
| `invalid mount config ... bind source path does not exist` | Không đứng trong `~/devops-labs/club` nên `$PWD/database/init.sql` sai | `cd ~/devops-labs/club` rồi chạy lại |

## Nộp bài

- [ ] File `notes/day-07-backup.sql` (dữ liệu giả, không có mật khẩu) đã commit vào `devops-labs`.
- [ ] `notes/day-07.md` có output `SELECT` sau khi tạo lại container (thấy Carol) và hai dòng so sánh `docker inspect` với `SHOW data_directory;`.
- [ ] `notes/day-07.md` có 2-3 câu: vì sao dữ liệu còn sau `docker rm`, và điều gì làm backup đáng tin.
- [ ] Không commit file `.env` hay mật khẩu thật.

## Tự kiểm tra

1. Vì sao dữ liệu Postgres ghi mà không có volume sẽ mất sau `docker rm`?
2. `docker volume ls` có volume nhưng dữ liệu vẫn mất. Bạn kiểm tra gì đầu tiên?
3. Vì sao phải thử restore chứ không chỉ tạo file backup?

::: details Đáp án gợi ý
1. Dữ liệu nằm trong lớp ghi tạm của container, lớp này bị xóa cùng container.
2. So đích mount trong `docker inspect` với `SHOW data_directory;`. Nếu khác nhau, volume chưa được dùng.
3. File backup hỏng hoặc thiếu dữ liệu chỉ lộ ra khi restore. Chỉ sau khi `SELECT` thấy lại dữ liệu, bạn mới biết backup dùng được.
:::

## Tiếp theo

[Ngày 8 – Docker Compose chạy cả Club](../week-07/session-13.md)

::: details Tài liệu tham khảo
- [Docker: Volumes](https://docs.docker.com/engine/storage/volumes/)
- [Docker: Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Hub: postgres (Official Image)](https://hub.docker.com/_/postgres)
- [PostgreSQL: Backup and Restore (pg_dump)](https://www.postgresql.org/docs/17/backup-dump.html)
:::
