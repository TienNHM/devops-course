# Slide Ngày 07 – Postgres giữ dữ liệu bằng volume

> **Tóm tắt:** Chạy Postgres của Club với named volume, nạp `database/init.sql`, chứng minh dữ liệu còn sau `docker rm` và làm một bản backup bằng `pg_dump`.

## Slide 1: Hôm nay bạn làm ra gì

- Một Postgres có bảng `members` của Club, dữ liệu **sống sót** khi container bị xóa.
- Một file backup `~/club-backup.sql` đã được thử restore.
- Cần có: Ngày 6 xong, Docker Desktop đang chạy, terminal WSL, thư mục `~/devops-labs/club`.
- Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Đọc nhanh, không đọc từng dòng. Việc chính hôm nay: volume giữ dữ liệu, rồi backup và restore.
- Hỏi: ai từng mất dữ liệu vì xóa nhầm?
- Bài này không mở cổng ra máy (vào Postgres bằng `docker exec`), nên không đụng cổng 5432.
:::

---

## Slide 2: Cập nhật image xong, bảng trống

![Xóa container cũ chạy container mới, bảng members trống không báo lỗi](/slides/img/s12-problem.svg)

::: details Ghi chú cho mentor
- Một bạn nhập 30 người đăng ký; hôm sau cập nhật image: xóa container cũ, chạy container mới.
- Không có lỗi nào được báo, mọi lệnh thành công. Container dùng một lần là điểm mạnh; dữ liệu database thì không.
- Mọi file tiến trình ghi ra nằm ở writable layer, gắn với vòng đời container; `docker rm` là mất toàn bộ.
:::

---

## Slide 3: Giải pháp: gắn volume vào nơi Postgres ghi

![Named volume, bind mount, tmpfs: nơi lưu và có sống sau khi xóa container không](/slides/img/s12-mounts.svg)

Hôm nay dùng hai loại: **named volume** cho dữ liệu, **bind mount** để đưa `init.sql` vào.

::: details Ghi chú cho mentor
- tmpfs chỉ nhắc tên. Giáo trình dùng `--mount` vì tường minh; `-v host:container` âm thầm tạo thư mục rỗng nếu gõ nhầm đường dẫn.
- Trên Docker Desktop, volume nằm trong máy ảo của Docker, không phải thư mục WSL.
:::

---

## Slide 4: Bước 1 (5 phút): Chuẩn bị

Vào thư mục Club, đặt mật khẩu giả và dọn container cũ nếu có.

```bash
cd ~/devops-labs/club
ls database
export PGPASS=demo-only-password
docker rm -f club-db 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
```

**Kiểm tra:** bạn đúng khi `ls database` thấy `init.sql`.

::: details Ghi chú cho mentor
- `PGPASS` là mật khẩu giả, đừng dùng mật khẩu thật. Mỗi lần mở terminal mới phải chạy lại dòng `export`.
- Không thấy `init.sql`: học viên chưa ở trong `~/devops-labs/club` hoặc chưa xong Ngày 3.
- Có thể kiểm tra phiên bản Docker bằng `docker version --format '{{.Server.Version}}'` (27 trở lên).
:::

---

## Slide 5: Bước 2 (20 phút): Điểm mount phải trùng nơi Postgres ghi

![Mount đúng ghi vào volume; mount sai khiến Postgres ghi vào writable layer](/slides/img/s12-pgpath.svg)

Postgres ghi dữ liệu ở `/var/lib/postgresql/data`. Volume phải gắn đúng đường dẫn này.

::: details Ghi chú cho mentor
- Không gắn gì: Docker tạo anonymous volume tên hex, container mới tạo cái mới nên trông như mất dữ liệu.
- `init.sql` và `POSTGRES_*` chỉ có tác dụng khi thư mục dữ liệu trống. Bài này ghim `postgres:17-alpine`; từ Postgres 18 cách bố trí đổi.
:::

---

## Slide 6: Bước 2: Chạy Postgres với volume và init.sql

```bash
docker volume create club-pgdata
docker run -d --name club-db \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  --mount type=bind,source="$PWD/database/init.sql",target=/docker-entrypoint-initdb.d/init.sql,readonly \
  postgres:17-alpine
```

`init.sql` được gắn chỉ đọc vào `/docker-entrypoint-initdb.d/`: Postgres tự chạy nó khi database còn trống.

::: details Ghi chú cho mentor
- Dòng `--mount type=bind` dài; nhắc học viên copy cả khối, đừng gõ tay.
- Lỗi `bind source path does not exist` nghĩa là học viên không đứng trong `~/devops-labs/club`.
:::

---

## Slide 7: Bước 2: Chờ Postgres sẵn sàng rồi hỏi dữ liệu

```bash
until docker exec club-db pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id;"
```

```text
127.0.0.1:5432 - accepting connections
 id | name
----+-------
  1 | Alice
  2 | Bob
```

**Kiểm tra:** bạn đúng khi `SELECT` ra đúng 2 dòng Alice và Bob.

::: details Ghi chú cho mentor
- Vài dòng `no response` đầu là bình thường, Postgres đang khởi tạo.
- Có `-h 127.0.0.1` vì lúc khởi tạo đầu có server tạm chỉ nghe qua unix socket; kiểm tra qua TCP chỉ thành công khi server thật đã chạy.
- Output trên đã rút gọn.
:::

---

## Slide 8: Bước 3 (20 phút): Xóa container, volume vẫn giữ dữ liệu

![club-db bị xóa, container mới gắn lại volume và thấy đủ dữ liệu](/slides/img/s12-lifecycle.svg)

Tên container trong hình là ví dụ. Bạn sẽ dùng `club-db` rồi `club-db2`.

::: details Ghi chú cho mentor
- Trình tự: INSERT Carol vào `club-db`, `rm -f`, chạy `club-db2` cùng volume, SELECT vẫn thấy Carol.
:::

---

## Slide 9: Bước 3: Thêm Carol, rồi xóa container

```bash
docker exec club-db psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker rm -f club-db
docker ps -a --filter name=club-db
docker volume ls --filter name=club-pgdata
```

**Kiểm tra:** bạn đúng khi không còn container `club-db`, nhưng volume `club-pgdata` vẫn có.

::: details Ghi chú cho mentor
- `docker ps -a` chỉ in dòng tiêu đề (rỗng); `docker volume ls` in `local   club-pgdata`.
:::

---

## Slide 10: Bước 3: Tạo container mới gắn lại volume cũ

```bash
docker run -d --name club-db2 \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  postgres:17-alpine
until docker exec club-db2 pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db2 psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id;"
docker logs club-db2 | grep -i "skipping"
```

**Kiểm tra:** bạn đúng khi thấy Alice, Bob, Carol và log có `Skipping initialization`.

::: details Ghi chú cho mentor
- Lần này không gắn `init.sql`: bạn không tạo lại bảng, vậy mà Carol vẫn còn.
- Container chỉ là lớp vỏ thay thế được; dữ liệu nằm trong volume.
:::

---

## Slide 11: Bước 4 (10 phút): Kiểm chứng volume thật sự được dùng

Có volume trong `docker volume ls` chưa chắc Postgres ghi vào nó. So hai đường dẫn.

```bash
docker inspect club-db2 --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{"\n"}}{{end}}'
docker exec club-db2 psql -U club -d clubdb -tA -c "SHOW data_directory;"
```

```text
volume club-pgdata -> /var/lib/postgresql/data
/var/lib/postgresql/data
```

**Kiểm tra:** bạn đúng khi hai đường dẫn giống hệt nhau.

::: details Ghi chú cho mentor
- Đây là phép thử nhanh nhất khi nghi ngờ "có volume mà vẫn mất dữ liệu".
:::

---

## Slide 12: Bước 5 (10 phút): Backup bằng pg_dump

`pg_dump` xuất database ra file SQL đọc được, an toàn khi database đang chạy.

```bash
docker exec club-db2 pg_dump -U club -d clubdb > ~/club-backup.sql
head -n 3 ~/club-backup.sql
grep -c "Carol" ~/club-backup.sql
```

**Kiểm tra:** bạn đúng khi file bắt đầu bằng `-- PostgreSQL database dump` và `grep -c` in `1`.

::: details Ghi chú cho mentor
- `pg_dump` nhất quán khi database đang chạy, đọc được bằng mắt, restore được sang phiên bản khác.
- File backup nằm ở thư mục home (`~`), không nằm trong repo: dữ liệu thật không nên commit.
:::

---

## Slide 13: Bước 6 (20 phút): Thử restore, phần 1/2

![pg_dump ra file SQL, volume bị xóa, psql nạp lại vào DB mới](/slides/img/s12-backup.svg)

Backup chưa thử restore thì chưa phải backup. Giả lập thảm họa: xóa container và volume.

::: details Ghi chú cho mentor
- Tên trong hình (tên container và file) là ví dụ; hôm nay là `club-db2` và `~/club-backup.sql`.
- Chỉ xóa đúng volume `club-pgdata`, không bao giờ dùng `docker volume prune` trên máy có dự án khác.
:::

---

## Slide 14: Bước 6: Xóa volume và dựng database rỗng

**Chỉ xóa đúng volume `club-pgdata`.** `docker volume rm` xóa dữ liệu vĩnh viễn.

```bash
docker rm -f club-db2
docker volume rm club-pgdata
docker run -d --name club-db3 \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  postgres:17-alpine
until docker exec club-db3 pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db3 psql -U club -d clubdb -c "\dt"
```

**Kiểm tra:** bạn đúng khi `\dt` báo `Did not find any relations.`

::: details Ghi chú cho mentor
- Chạy `docker volume ls` trước khi xóa để chắc tên đúng.
:::

---

## Slide 15: Bước 6: Nạp lại từ file backup, phần 2/2

```bash
docker exec -i club-db3 psql -U club -d clubdb -v ON_ERROR_STOP=1 < ~/club-backup.sql
docker exec club-db3 psql -U club -d clubdb -c "SELECT id, name, email FROM members ORDER BY id;"
```

Restore in `CREATE TABLE` và `COPY 3`, rồi `SELECT` thấy lại Alice, Bob, Carol.

**Kiểm tra:** bạn đúng khi `SELECT` ra đủ 3 người, kể cả Carol.

::: details Ghi chú cho mentor
- Nhớ `docker exec -i` (có `-i`) khi đưa file vào qua `<`; thiếu `-i`, restore trống mà không báo lỗi.
- Dọn dẹp ở slide sau.
:::

---

## Slide 16: Dọn dẹp khi xong

```bash
docker rm -f club-db club-db2 club-db3 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
```

**Kiểm tra:** bạn đúng khi `docker ps -a` không còn container `club-db*`.

::: details Ghi chú cho mentor
- Giữ lại `~/club-backup.sql` nếu học viên muốn thử restore ở nhà.
:::

---

## Slide 17: Lỗi 1: có volume nhưng vẫn mất dữ liệu

![docker inspect cho thấy mount một nơi, data_directory ở nơi khác](/slides/img/s12-debug.svg)

`relation "members" does not exist` -> mount sai đường dẫn -> so `docker inspect` với `SHOW data_directory;`.

::: details Ghi chú cho mentor
- Đường dẫn trong hình là ví dụ minh họa. Điều tra: `data_directory` so với đích mount trong `docker inspect`.
- Phòng tránh: kiểm tra recreate ngay ngày đầu, có backup và thử restore.
:::

---

## Slide 18: Lỗi 2: Postgres không nghe lời bạn đổi

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Đổi `POSTGRES_PASSWORD`, mật khẩu cũ vẫn dùng | `POSTGRES_*` chỉ áp dụng lần khởi tạo đầu | `ALTER USER`, hoặc xóa volume sau khi backup |
| Sửa `init.sql`, bảng không đổi | Script chỉ chạy khi thư mục dữ liệu trống | Dùng `psql` áp dụng, hoặc tạo volume mới |

::: details Ghi chú cho mentor
- Cùng một nguyên nhân: Postgres đã có dữ liệu trong volume thì bỏ qua bước khởi tạo.
:::

---

## Slide 19: Lỗi 3: restore trống, không xóa được volume, bind lỗi

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Restore xong bảng trống, không lỗi | Thiếu `-i` nên file không vào container | Thêm `-i`, kiểm tra bằng `SELECT` |
| `volume is in use` | Còn container (kể cả đã dừng) dùng volume | `docker rm -f` container đó trước |
| `bind source path does not exist` | Không đứng trong `~/devops-labs/club` | `cd ~/devops-labs/club` rồi chạy lại |

::: details Ghi chú cho mentor
- Lỗi hay gặp nhất trong lớp: thiếu `-i` và đứng sai thư mục.
:::

---

## Slide 20: Tự kiểm tra

1. Vì sao dữ liệu Postgres ghi mà không có volume sẽ mất sau `docker rm`?
2. `docker volume ls` có volume nhưng dữ liệu vẫn mất. Bạn kiểm tra gì đầu tiên?
3. Vì sao phải thử restore chứ không chỉ tạo file backup?

::: details Ghi chú cho mentor
1. Dữ liệu nằm trong writable layer của container, lớp này bị xóa cùng container.
2. So đích mount trong `docker inspect` với `SHOW data_directory;`. Nếu khác nhau, volume chưa được dùng.
3. File backup hỏng hoặc thiếu dữ liệu chỉ lộ ra khi restore. Chỉ sau khi `SELECT` thấy lại dữ liệu, bạn mới biết backup dùng được.
:::

---

## Slide 21: Tiếp theo

![Ba điều cần nhớ: dữ liệu bền ở volume, mount phải khớp, backup phải thử restore](/slides/img/s12-recap.svg)

Ngày 8: [Docker Compose chạy cả Club](../03-compose/session-13.md) gom mọi thứ vào một file.

---

## Slide 22: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Volumes](https://docs.docker.com/engine/storage/volumes/): giữ dữ liệu khi container bị xóa.
- **Tài liệu chính thức:** [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/): gắn thư mục máy thật vào container.
- **Tài liệu chính thức:** [PostgreSQL: Backup and Restore](https://www.postgresql.org/docs/17/backup-dump.html): sao lưu database bằng pg_dump.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): dùng mount an toàn, tránh lộ dữ liệu.
- **Best practice:** [The Twelve-Factor App: Backing services](https://12factor.net/backing-services): coi database là tài nguyên gắn ngoài.
