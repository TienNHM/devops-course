# Buổi 14 – Thử thách L2: giới hạn, secrets, backup

> **Tóm tắt:** Trang phụ của Buổi 14: giới hạn tài nguyên và log rotation, secret cho Postgres, backup và restore bằng pg_dump, cùng bốn thử thách L2 và bảng lỗi riêng.

Quay lại bài chính: [Buổi 14 – Production-minded Compose](session-14.md). Trang này không bắt buộc; chỉ làm khi đã xong checklist L1. Lời giải mẫu nằm ở [trang tuần 7](README.md) (mở sau khi nộp bài). Làm trong `~/devops-labs/lab-14/source`, trên nền `compose.yaml` đã có healthcheck của Buổi 14.

## Kiến thức nền

**Giới hạn tài nguyên.** Không đặt giới hạn thì một container rò bộ nhớ có thể kéo sập cả WSL2. Trong Compose v2, `deploy.resources.limits` được áp dụng cho `docker compose up` thông thường. Vượt giới hạn CPU thì tiến trình bị làm chậm (throttle); vượt giới hạn memory thì kernel kết thúc tiến trình (OOM kill, exit code 137).

**Log rotation.** Mặc định driver `json-file` ghi log không giới hạn. Với `max-size: "10m"` và `max-file: "3"`, mỗi container tối đa khoảng 30 MB log. Log ứng dụng nên ghi ra stdout/stderr để `docker compose logs` đọc được.

**Secrets và cấu hình nhạy cảm.**

| Cách | Ưu điểm | Nhược điểm |
| --- | --- | --- |
| `environment` ghi cứng trong YAML | Đơn giản | Mật khẩu nằm trong Git; không chấp nhận được |
| Biến lấy từ `.env` | Đủ cho lab, không commit `.env` | Hiện trong `docker inspect` và `docker compose config` |
| Compose `secrets` (file) | Mật khẩu mount thành file `/run/secrets/ten_secret`, không nằm trong biến môi trường | Ứng dụng phải biết đọc file |

Image `postgres` hỗ trợ biến `POSTGRES_PASSWORD_FILE`. Backend của `starter-project` hiện đọc `DB_PASSWORD` từ biến môi trường, nên Phần L2-2 áp dụng secrets cho Postgres, còn secret cho backend là thử thách 4.

**Backup và restore.** Volume không phải là backup: xóa nhầm volume hoặc hỏng đĩa thì mất hết. Với PostgreSQL, `pg_dump` tạo bản dump logic (file SQL) nhất quán trong khi database đang chạy; `psql` nạp lại bản dump đó.

## Phần L2-1 – Resource limits và logging

Thêm vào service `backend` (và tương tự cho `frontend`, `postgres` với giá trị bạn tự chọn):

```yaml
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 256M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

```bash
docker compose up -d
docker stats --no-stream
docker inspect --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}} {{.HostConfig.LogConfig.Config}}' $(docker compose ps -q backend)
```

Kết quả mong đợi: cột `MEM USAGE / LIMIT` của backend hiện giới hạn `256MiB`; dòng inspect có dạng `268435456 500000000 map[max-file:3 max-size:10m]`. Gợi ý giá trị: `256M` cho backend và frontend, `512M` cho postgres. Vì sao: giới hạn có hiệu lực thật chứ không chỉ nằm trong file YAML.

## Phần L2-2 – Secrets cho Postgres

Tạo file secret (không commit) và sửa service `postgres`:

```bash
mkdir -p secrets
printf '%s' "$(grep '^DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r')" > secrets/db_password.txt
echo "secrets/" >> .gitignore
```

Trong service `postgres`, thay dòng `POSTGRES_PASSWORD: ...` bằng `POSTGRES_PASSWORD_FILE` (xóa hẳn `POSTGRES_PASSWORD`, vì image postgres từ chối khởi động khi đặt cả hai):

```yaml
  postgres:
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
```

Ở cuối file `compose.yaml` thêm khối cấp cao nhất:

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Chú ý: mật khẩu chỉ được áp dụng khi volume còn trống. Nếu volume đã có dữ liệu, Postgres giữ mật khẩu cũ. Vì mật khẩu trong file giống hệt `DB_PASSWORD`, backend vẫn kết nối được; hãy kiểm chứng:

```bash
docker compose up -d
docker compose exec postgres sh -c 'ls -l /run/secrets && echo "POSTGRES_PASSWORD=[${POSTGRES_PASSWORD}]"'
curl -s http://localhost:3000/api/members | head -c 120
```

Kết quả mong đợi: file `db_password` tồn tại, `POSTGRES_PASSWORD=[]` (biến rỗng, mật khẩu không nằm trong env), API vẫn trả dữ liệu.

## Phần L2-3 – Backup và restore

::: danger Bước 2 xóa volume
Bước 2 dùng `docker compose down -v`, xóa toàn bộ dữ liệu postgres của project này. Chỉ chạy trong `lab-14/source`, sau khi đã có file backup lớn hơn 0 byte ở bước 1.
:::

1. Thêm một thành viên để có dữ liệu phân biệt, rồi backup:

   ```bash
   docker compose exec -T postgres psql -U club -d clubdb -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
   mkdir -p ../backups
   docker compose exec -T postgres pg_dump -U club -d clubdb > ../backups/clubdb-$(date +%Y%m%d).sql
   ls -l ../backups
   head -n 5 ../backups/clubdb-*.sql
   ```

   Kết quả mong đợi: file `.sql` lớn hơn 0 byte, dòng đầu có `-- PostgreSQL database dump`. Dùng `-T` để Compose không cấp TTY, tránh làm hỏng đầu ra khi chuyển hướng.

2. Giả lập mất dữ liệu:

   ```bash
   docker compose down -v
   docker compose up -d
   sleep 10
   curl -s http://localhost:3000/api/members
   ```

   Kết quả mong đợi: chỉ còn Alice và Bob (Carol đã mất vì volume bị xóa, `init.sql` nạp lại dữ liệu mẫu).

3. Restore thử vào một database mới để kiểm chứng bản backup dùng được (cách an toàn, không đụng database đang chạy):

   ```bash
   BACKUP=$(ls -1t ../backups/clubdb-*.sql | head -n 1)
   docker compose exec -T postgres psql -U club -d postgres -c "CREATE DATABASE clubdb_restore;"
   docker compose exec -T postgres psql -U club -d clubdb_restore < "$BACKUP"
   docker compose exec -T postgres psql -U club -d clubdb_restore -c "SELECT id, name FROM members ORDER BY id;"
   ```

   Kết quả mong đợi: bảng trong `clubdb_restore` có 3 dòng gồm Carol. Dùng biến `BACKUP` vì chuyển hướng `<` với ký tự đại diện cho nhiều file sẽ báo `ambiguous redirect`.

4. Khôi phục dữ liệu cho database đang phục vụ API:

   ```bash
   docker compose exec -T postgres psql -U club -d clubdb -c "DROP TABLE members;"
   docker compose exec -T postgres psql -U club -d clubdb < "$BACKUP"
   curl -s http://localhost:3000/api/members
   docker compose exec -T postgres psql -U club -d postgres -c "DROP DATABASE clubdb_restore;"
   ```

   Kết quả mong đợi: danh sách có Carol trở lại. Vì sao `DROP TABLE` trước: bản dump chứa `CREATE TABLE`, nếu bảng đã tồn tại thì restore báo lỗi `already exists`. Trong thực tế bạn sẽ restore vào database trống thay vì xóa bảng.

## Bốn thử thách L2

Hoàn thành tối thiểu 3 trong 4 thử thách. Hãy tự thử 15 phút trước khi mở gợi ý.

1. **Healthcheck có chủ đích.** Đổi healthcheck của backend sang `/ready` và so sánh hành vi khi DB dừng. Tiêu chí: giải thích bằng 3 đến 5 câu trong `report.md` nên chọn `/health` hay `/ready` cho healthcheck của Compose và vì sao.
2. **OOM có kiểm soát.** Đặt `memory: 16M` cho backend, quan sát điều gì xảy ra, rồi trả về giá trị hợp lý. Tiêu chí: có ảnh chụp/log `docker inspect` cho `OOMKilled` hoặc exit code 137, và giá trị cuối cùng có lý giải dựa trên `docker stats`.
3. **Backup tự động.** Viết script `backup.sh` tạo file `clubdb-YYYYmmdd-HHMMSS.sql`, giữ lại 5 bản gần nhất. Tiêu chí: chạy 7 lần còn đúng 5 file; script không chứa mật khẩu.
4. **Secret cho backend.** Làm cho backend đọc mật khẩu từ file (ví dụ nếu có `DB_PASSWORD_FILE` thì đọc file) và bỏ `DB_PASSWORD` khỏi môi trường của backend. Tiêu chí: `docker compose exec backend env` không còn mật khẩu và `/ready` trả 200.

::: details Gợi ý
- Thử thách 1: với `/ready`, khi DB dừng backend chuyển `unhealthy` sau `retries` lần. Vì `frontend` chỉ chờ lúc khởi động nên nó không bị dừng, nhưng nếu chạy lại `up` thì thứ tự sẽ bị chặn.
- Thử thách 2: `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' ID`. Node idle dùng khoảng 14 MiB nên 16M có thể vẫn chạy được (đã kiểm chứng); nếu không thấy `OOMKilled`, hạ xuống 8M, lúc đó backend bị OOM kill (exit 137) và `RestartCount` tăng liên tục.
- Thử thách 3: trong thư mục chứa backup, `ls -1t clubdb-*.sql | tail -n +6 | xargs -r rm --` xóa các bản cũ hơn 5 bản gần nhất.
- Thử thách 4: trong `db.js`, đọc bằng `fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim()` khi biến này có mặt; thêm `secrets:` cho service backend.
:::

::: details Gợi ý bậc cao cho thử thách 3: khung script
Chỉ mở sau khi đã tự thử 15 phút. Điền các chỗ `...` rồi đặt `backup.sh` cạnh `compose.yaml` (trong `source/`) để `docker compose` tìm đúng project.

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p backups
out="backups/clubdb-$(date +%Y%m%d-%H%M%S).sql"
# 1. pg_dump qua docker compose exec -T, ghi vào "$out"
# 2. nếu file rỗng (test -s) thì xóa và thoát mã 1
# 3. giữ lại 5 bản mới nhất bằng ls -1t ... | tail -n +6 | ...
```

Lệnh xác nhận: chạy `bash backup.sh` bảy lần (cách nhau hơn 1 giây) rồi `ls backups | wc -l` phải ra `5`.
:::

## Gặp lỗi? (phần L2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `POSTGRES_PASSWORD_FILE` đổi mà vẫn đăng nhập bằng mật khẩu cũ | Volume đã được khởi tạo, Postgres chỉ đặt mật khẩu lần đầu | Đổi mật khẩu bằng `ALTER USER`, hoặc `down -v` nếu chấp nhận mất dữ liệu |
| Postgres không khởi động khi đã đặt cả `POSTGRES_PASSWORD` và `POSTGRES_PASSWORD_FILE` | Image postgres từ chối khi đặt cả hai | Xóa hẳn dòng `POSTGRES_PASSWORD` |
| File backup rỗng hoặc có ký tự lạ | Thiếu `-T` khi dùng `docker compose exec` với chuyển hướng | Dùng `exec -T`; kiểm tra `test -s` |
| Restore báo `relation already exists` | Nạp dump vào database đã có bảng | Restore vào database trống hoặc `DROP TABLE` trước |
| `ambiguous redirect` khi restore | Ký tự đại diện cho nhiều file sau dấu `<` | Gán `BACKUP=$(ls -1t ... \| head -n 1)` rồi dùng `< "$BACKUP"` |
| Container thoát với exit code 137 | Vượt giới hạn memory (OOM kill) hoặc bị kill | `docker inspect` xem `OOMKilled`; tăng limit hoặc sửa rò rỉ bộ nhớ |
| Thay đổi `deploy.resources` không thấy hiệu lực | Chưa recreate container | Chạy lại `docker compose up -d` rồi kiểm tra bằng `docker inspect` |

## Câu hỏi thêm

1. Vì sao lưu mật khẩu vào file secret an toàn hơn biến môi trường, và giới hạn của cách này là gì?
2. Tại sao phải dùng `docker compose exec -T` khi chạy `pg_dump > file`?

::: details Đáp án gợi ý
1. Secret không hiện trong `docker inspect` hay danh sách biến môi trường của tiến trình con, và không bị in nhầm vào log. Giới hạn: ứng dụng phải biết đọc file, và file trên host vẫn phải được bảo vệ, không commit.
2. Không có `-T`, Compose cấp TTY, có thể chèn ký tự điều khiển/CRLF vào luồng và làm hỏng file dump hoặc làm lệnh báo lỗi stdin không phải TTY.
:::

## Tra cứu thêm

**Các dạng `depends_on`**

| Cú pháp | Compose chờ điều gì |
| --- | --- |
| `depends_on: [postgres]` | Container `postgres` đã được tạo/khởi động; không chờ ready |
| `condition: service_started` | Giống dạng ngắn |
| `condition: service_healthy` | Healthcheck của dependency đã `healthy` |
| `condition: service_completed_successfully` | Dependency (job một lần) đã thoát với exit code 0 |

**Restart policy**

| Policy | Hành vi |
| --- | --- |
| `no` | Không tự khởi động lại (mặc định) |
| `on-failure` | Chỉ khởi động lại khi exit code khác 0 (có thể giới hạn số lần: `on-failure:3`) |
| `always` | Luôn khởi động lại, kể cả sau khi daemon khởi động lại; vẫn chạy lại nếu bạn đã `docker stop` rồi daemon restart |
| `unless-stopped` | Như `always`, nhưng nếu bạn chủ động dừng thì không tự dậy lại |

## Tài liệu tham khảo

- [Compose file: services (healthcheck, depends_on, restart, deploy)](https://docs.docker.com/reference/compose-file/services/)
- [Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/)
- [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Resource constraints for containers](https://docs.docker.com/engine/containers/resource_constraints/)
- [JSON File logging driver](https://docs.docker.com/engine/logging/drivers/json-file/)
- [PostgreSQL: pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html)
