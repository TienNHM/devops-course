# Slide Ngày 07 – Postgres giữ dữ liệu bằng volume

> **Tóm tắt:** Chạy Postgres của Club với named volume, nạp `database/init.sql`, chứng minh dữ liệu còn sau `docker rm` và tạo một bản backup bằng `pg_dump`.

## Hôm nay làm ra gì

- Một Postgres có bảng `members` của Club, với dữ liệu **còn lại** khi container bị xóa.
- Một file backup `~/club-backup.sql` đã được thử restore.
- Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Điều kiện: Ngày 6 hoàn thành, Docker Desktop đang chạy, có terminal WSL và thư mục `~/devops-labs/club`.
- Trình bày nhanh, không đọc từng dòng. Nội dung chính: volume giữ dữ liệu, sau đó backup và restore.
- Câu hỏi mở đầu: người học nào từng mất dữ liệu do xóa nhầm?
- Bài này không mở cổng ra máy (truy cập Postgres bằng `docker exec`), nên không liên quan đến cổng 5432.
:::

---

## Khái niệm: Dữ liệu bền vững và writable layer

- **Dữ liệu bền vững** là dữ liệu vẫn tồn tại sau khi container tạo ra nó đã kết thúc.
- Ví dụ trong dự án: các dòng bảng `members` mất sau `docker rm` nếu không có cơ chế lưu riêng.

::: details Ghi chú cho mentor
- Mọi file mà tiến trình trong container ghi ra được lưu ở **writable layer** (lớp ghi) của container, và lớp này bị xóa cùng container.
- Image là các lớp chỉ đọc; mỗi container có thêm một writable layer ở trên cùng, gắn với vòng đời của container.
- Container dùng một lần là ưu điểm của Docker; với database, đặc tính này cần được bù bằng volume.
:::

---

## Cập nhật image xong, bảng trống

![Xóa container cũ chạy container mới, bảng members trống không báo lỗi](/slides/img/s12-problem.svg)

::: details Ghi chú cho mentor
- Tình huống: một thành viên nhập 30 người đăng ký; hôm sau cập nhật image bằng cách xóa container cũ và chạy container mới.
- Không có lỗi nào được báo, mọi lệnh đều thành công. Dữ liệu mất vì nằm trong writable layer của container đã bị xóa.
- Mọi file tiến trình ghi ra nằm ở writable layer, gắn với vòng đời container; `docker rm` xóa toàn bộ.
:::

---

## Khái niệm: Volume

- **Volume** là vùng lưu trữ do Docker quản lý, tồn tại độc lập với vòng đời của container.
- Ví dụ trong dự án: volume `club-pgdata` gắn vào `/var/lib/postgresql/data`, nơi Postgres ghi dữ liệu.

::: details Ghi chú cho mentor
- Khi một volume được gắn (mount) vào một thư mục trong container, dữ liệu ghi vào thư mục đó nằm trong volume thay vì writable layer.
- **Named volume** là volume có tên do người dùng đặt, nên container mới có thể gắn lại đúng volume đó.
- Trên Docker Desktop, volume nằm trong máy ảo của Docker, không phải thư mục WSL.
- Không gắn gì: Docker tạo anonymous volume có tên hex, và container mới tạo volume khác nên trông như mất dữ liệu.
:::

---

## Giải pháp: gắn volume vào nơi Postgres ghi

![Named volume, bind mount, tmpfs: nơi lưu và có sống sau khi xóa container không](/slides/img/s12-mounts.svg)

Bài này dùng hai loại: **named volume** cho dữ liệu và **bind mount** để đưa `init.sql` vào container.

::: details Ghi chú cho mentor
- tmpfs chỉ nhắc tên. Giáo trình dùng `--mount` vì cú pháp tường minh; `-v host:container` âm thầm tạo thư mục rỗng nếu đường dẫn bị gõ sai.
- Trên Docker Desktop, volume nằm trong máy ảo của Docker, không phải thư mục WSL.
:::

---

## Khái niệm: Bind mount

- **Bind mount** gắn một file hoặc thư mục có sẵn trên máy chủ vào một đường dẫn trong container.
- Ví dụ trong dự án: `database/init.sql` gắn `readonly` vào `/docker-entrypoint-initdb.d/init.sql`.

::: details Ghi chú cho mentor
- Khác với volume, bind mount phụ thuộc vào cấu trúc thư mục của máy chủ và không do Docker quản lý.
- Postgres tự chạy các file trong `/docker-entrypoint-initdb.d/` khi thư mục dữ liệu còn trống.
- Nhấn mạnh sự khác biệt: volume do Docker quản lý, bind mount trỏ thẳng vào đường dẫn trên máy.
:::

---

## Khái niệm: Biến môi trường

- **Biến môi trường** là cặp tên và giá trị mà hệ điều hành cung cấp cho tiến trình khi nó chạy.
- Ví dụ trong dự án: `-e POSTGRES_USER=club` truyền biến vào container.

::: details Ghi chú cho mentor
- Cơ chế này cho phép cấu hình ứng dụng, như tên database hoặc mật khẩu, mà không sửa mã nguồn hay image.
- `export PGPASS=...` đặt biến trong shell.
- Image `postgres` đọc các biến `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` để khởi tạo database lần đầu.
- Biến đặt bằng `export` chỉ có hiệu lực trong terminal hiện tại.
:::

---

## Bước 1 (5 phút): Chuẩn bị

Vào thư mục Club, đặt mật khẩu giả và dọn container cũ nếu có.

```bash
cd ~/devops-labs/club
ls database
export PGPASS=demo-only-password
docker rm -f club-db 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
```

**Kiểm tra:** kết quả đúng khi `ls database` hiển thị `init.sql`.

::: details Ghi chú cho mentor
- `PGPASS` là mật khẩu giả, không dùng mật khẩu thật. Mỗi lần mở terminal mới phải chạy lại dòng `export`.
- Không thấy `init.sql`: người học chưa ở trong `~/devops-labs/club` hoặc chưa hoàn thành Ngày 3.
- Có thể kiểm tra phiên bản Docker bằng `docker version --format '{{.Server.Version}}'` (27 trở lên).
:::

---

## Bước 2 (20 phút): Điểm mount phải trùng nơi Postgres ghi

![Mount đúng ghi vào volume; mount sai khiến Postgres ghi vào writable layer](/slides/img/s12-pgpath.svg)

Postgres ghi dữ liệu ở `/var/lib/postgresql/data`. Vì vậy volume phải được gắn đúng đường dẫn này.

::: details Ghi chú cho mentor
- Không gắn gì: Docker tạo anonymous volume tên hex, container mới tạo volume mới nên trông như mất dữ liệu.
- `init.sql` và `POSTGRES_*` chỉ có tác dụng khi thư mục dữ liệu trống. Bài này cố định `postgres:17-alpine`; từ Postgres 18 cách bố trí thư mục đã thay đổi.
:::

---

## Bước 2: Chạy Postgres với volume và init.sql

```bash
docker volume create club-pgdata
docker run -d --name club-db \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  --mount type=bind,source="$PWD/database/init.sql",target=/docker-entrypoint-initdb.d/init.sql,readonly \
  postgres:17-alpine
```

File `init.sql` được gắn chỉ đọc vào `/docker-entrypoint-initdb.d/`. Postgres tự chạy file này khi database còn trống.

::: details Ghi chú cho mentor
- Dòng `--mount type=bind` dài; nhắc người học sao chép cả khối, không gõ tay.
- Lỗi `bind source path does not exist` nghĩa là người học không đứng trong `~/devops-labs/club`.
:::

---

## Bước 2: Chờ Postgres sẵn sàng rồi truy vấn dữ liệu

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

**Kiểm tra:** kết quả đúng khi `SELECT` trả về hai dòng Alice và Bob.

::: details Ghi chú cho mentor
- Vài dòng `no response` đầu là bình thường, vì Postgres đang khởi tạo.
- Có `-h 127.0.0.1` vì lúc khởi tạo đầu có một server tạm chỉ nghe qua unix socket; kiểm tra qua TCP chỉ thành công khi server thật đã chạy.
- Output trên đã rút gọn.
:::

---

## Bước 3 (20 phút): Xóa container, volume vẫn giữ dữ liệu

![club-db bị xóa, container mới gắn lại volume và thấy đủ dữ liệu](/slides/img/s12-lifecycle.svg)

Tên container trong hình chỉ là ví dụ. Thực hành dùng lần lượt `club-db` và `club-db2`.

::: details Ghi chú cho mentor
- Trình tự: INSERT Carol vào `club-db`, `rm -f`, chạy `club-db2` cùng volume, SELECT vẫn thấy Carol.
:::

---

## Bước 3: Thêm Carol, rồi xóa container

```bash
docker exec club-db psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker rm -f club-db
docker ps -a --filter name=club-db
docker volume ls --filter name=club-pgdata
```

**Kiểm tra:** kết quả đúng khi không còn container `club-db`, nhưng volume `club-pgdata` vẫn tồn tại.

::: details Ghi chú cho mentor
- `docker ps -a` chỉ in dòng tiêu đề (rỗng); `docker volume ls` in `local   club-pgdata`.
:::

---

## Bước 3: Tạo container mới gắn lại volume cũ

```bash
docker run -d --name club-db2 \
  -e POSTGRES_DB=clubdb -e POSTGRES_USER=club -e POSTGRES_PASSWORD="$PGPASS" \
  --mount type=volume,source=club-pgdata,target=/var/lib/postgresql/data \
  postgres:17-alpine
until docker exec club-db2 pg_isready -h 127.0.0.1 -U club -d clubdb; do sleep 1; done
docker exec club-db2 psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id;"
docker logs club-db2 | grep -i "skipping"
```

**Kiểm tra:** kết quả đúng khi thấy Alice, Bob, Carol và nhật ký (log) có dòng `Skipping initialization`.

::: details Ghi chú cho mentor
- Lần này không gắn `init.sql`: bảng không được tạo lại, nhưng Carol vẫn còn.
- Container chỉ là lớp vỏ có thể thay thế; dữ liệu nằm trong volume.
:::

---

## Bước 4 (10 phút): Kiểm chứng volume thật sự được dùng

Việc volume xuất hiện trong `docker volume ls` chưa chứng minh Postgres ghi vào volume đó. Cần so sánh hai đường dẫn.

```bash
docker inspect club-db2 --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{"\n"}}{{end}}'
docker exec club-db2 psql -U club -d clubdb -tA -c "SHOW data_directory;"
```

```text
volume club-pgdata -> /var/lib/postgresql/data
/var/lib/postgresql/data
```

**Kiểm tra:** kết quả đúng khi hai đường dẫn giống hệt nhau.

::: details Ghi chú cho mentor
- Đây là phép thử nhanh nhất khi nghi ngờ tình huống "có volume mà vẫn mất dữ liệu".
:::

---

## Khái niệm: Backup và restore

- **Backup** là bản sao dữ liệu lưu riêng; **restore** là nạp bản backup để tái tạo dữ liệu.
- Ví dụ trong dự án: `pg_dump` xuất `clubdb` ra `~/club-backup.sql`, và `psql` nạp lại file đó.

::: details Ghi chú cho mentor
- Backup dùng để khôi phục khi dữ liệu gốc bị mất hoặc hỏng; một backup chỉ đáng tin khi đã restore thành công.
- Volume bảo vệ dữ liệu khỏi việc xóa container, nhưng không bảo vệ khỏi việc xóa nhầm volume hay hỏng đĩa.
- Backup và volume giải quyết hai rủi ro khác nhau.
:::

---

## Bước 5 (10 phút): Backup bằng pg_dump

Lệnh `pg_dump` xuất database ra file SQL đọc được, và an toàn khi database đang chạy.

```bash
docker exec club-db2 pg_dump -U club -d clubdb > ~/club-backup.sql
head -n 3 ~/club-backup.sql
grep -c "Carol" ~/club-backup.sql
```

**Kiểm tra:** kết quả đúng khi file bắt đầu bằng `-- PostgreSQL database dump` và `grep -c` in `1`.

::: details Ghi chú cho mentor
- `pg_dump` cho bản sao nhất quán khi database đang chạy, đọc được bằng mắt, và restore được sang phiên bản khác.
- File backup nằm ở thư mục home (`~`), không nằm trong repository: dữ liệu thật không nên được commit.
:::

---

## Bước 6 (20 phút): Thử restore, phần 1/2

![pg_dump ra file SQL, volume bị xóa, psql nạp lại vào DB mới](/slides/img/s12-backup.svg)

Backup chưa được thử restore thì chưa đáng tin. Để kiểm chứng, giả lập sự cố bằng cách xóa container và volume.

::: details Ghi chú cho mentor
- Tên trong hình (tên container và file) là ví dụ; trong bài này là `club-db2` và `~/club-backup.sql`.
- Chỉ xóa đúng volume `club-pgdata`; không dùng `docker volume prune` trên máy có dự án khác.
:::

---

## Bước 6: Xóa volume và dựng database rỗng

**Chỉ xóa đúng volume `club-pgdata`.** Lệnh `docker volume rm` xóa dữ liệu vĩnh viễn.

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

**Kiểm tra:** kết quả đúng khi `\dt` báo `Did not find any relations.`

::: details Ghi chú cho mentor
- Chạy `docker volume ls` trước khi xóa để xác nhận tên đúng.
:::

---

## Bước 6: Nạp lại từ file backup, phần 2/2

```bash
docker exec -i club-db3 psql -U club -d clubdb -v ON_ERROR_STOP=1 < ~/club-backup.sql
docker exec club-db3 psql -U club -d clubdb -c "SELECT id, name, email FROM members ORDER BY id;"
```

Quá trình restore in `CREATE TABLE` và `COPY 3`; sau đó `SELECT` hiển thị lại Alice, Bob và Carol.

**Kiểm tra:** kết quả đúng khi `SELECT` trả về đủ 3 người, kể cả Carol.

::: details Ghi chú cho mentor
- Cần dùng `docker exec -i` (có `-i`) khi đưa file vào qua `<`; thiếu `-i`, restore trống mà không báo lỗi.
- Việc dọn dẹp được thực hiện ở slide sau.
:::

---

## Dọn dẹp khi xong

```bash
docker rm -f club-db club-db2 club-db3 2>/dev/null; docker volume rm club-pgdata 2>/dev/null; true
```

**Kiểm tra:** kết quả đúng khi `docker ps -a` không còn container `club-db*`.

::: details Ghi chú cho mentor
- Giữ lại `~/club-backup.sql` nếu người học muốn thử restore ở nhà.
:::

---

## Lỗi 1: có volume nhưng vẫn mất dữ liệu

![docker inspect cho thấy mount một nơi, data_directory ở nơi khác](/slides/img/s12-debug.svg)

`relation "members" does not exist` -> mount sai đường dẫn -> so sánh `docker inspect` với `SHOW data_directory;`.

::: details Ghi chú cho mentor
- Đường dẫn trong hình là ví dụ minh họa. Cách điều tra: so `data_directory` với đích mount trong `docker inspect`.
- Phòng tránh: kiểm tra việc tạo lại container ngay từ ngày đầu, có backup và thử restore.
:::

---

## Lỗi 2: Postgres không áp dụng giá trị mới

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Đổi `POSTGRES_PASSWORD`, mật khẩu cũ vẫn dùng | Chỉ áp dụng lần đầu | `ALTER USER` |
| Sửa `init.sql`, bảng không đổi | Chỉ chạy khi dữ liệu trống | Dùng `psql` |

::: details Ghi chú cho mentor
- `POSTGRES_*` chỉ áp dụng lần khởi tạo đầu; cách sửa khác: xóa volume sau khi backup.
- Script `init.sql` chỉ chạy khi thư mục dữ liệu trống; cách sửa khác: tạo volume mới.
- Cả hai lỗi cùng một nguyên nhân: khi volume đã có dữ liệu, Postgres bỏ qua bước khởi tạo.
:::

---

## Lỗi 3: restore trống, không xóa được volume, bind lỗi

| Lỗi | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Restore trống | Thiếu `-i` | Thêm `-i` |
| `volume is in use` | Còn container | `docker rm -f` |
| `bind source path` | Sai thư mục | `cd ~/devops-labs/club` |

::: details Ghi chú cho mentor
- Restore xong bảng trống, không lỗi: thiếu `-i` nên file không vào container; thêm `-i`, kiểm tra bằng `SELECT`.
- `volume is in use`: còn container (kể cả đã dừng) dùng volume; `docker rm -f` container đó trước.
- `bind source path does not exist`: không đứng trong `~/devops-labs/club`; `cd` vào đó rồi chạy lại.
- Hai lỗi phổ biến nhất trong lớp: thiếu `-i` và đứng sai thư mục.
:::

---

## Tự kiểm tra

1. Vì sao dữ liệu Postgres ghi ra mà không có volume sẽ mất sau `docker rm`?
2. `docker volume ls` có volume nhưng dữ liệu vẫn mất. Cần kiểm tra điều gì đầu tiên?
3. Vì sao cần thử restore thay vì chỉ tạo file backup?

::: details Ghi chú cho mentor
1. Dữ liệu nằm trong writable layer của container, và lớp này bị xóa cùng container.
2. So sánh đích mount trong `docker inspect` với `SHOW data_directory;`. Nếu khác nhau, volume chưa được sử dụng.
3. File backup hỏng hoặc thiếu dữ liệu chỉ lộ ra khi restore. Chỉ khi `SELECT` hiển thị lại dữ liệu, backup mới được xác nhận là dùng được.
:::

---

## Tiếp theo

![Ba điều cần nhớ: dữ liệu bền ở volume, mount phải khớp, backup phải thử restore](/slides/img/s12-recap.svg)

Ngày 8: [Docker Compose chạy cả Club](../03-compose/session-13.md) gom mọi thành phần vào một file.

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Volumes](https://docs.docker.com/engine/storage/volumes/): giữ dữ liệu khi container bị xóa.
- **Tài liệu chính thức:** [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/): gắn thư mục máy thật vào container.
- **Tài liệu chính thức:** [PostgreSQL: Backup and Restore](https://www.postgresql.org/docs/17/backup-dump.html): sao lưu database bằng pg_dump.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): dùng mount an toàn, tránh lộ dữ liệu.
- **Best practice:** [The Twelve-Factor App: Backing services](https://12factor.net/backing-services): coi database là tài nguyên gắn ngoài.
