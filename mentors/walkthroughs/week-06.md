# Đáp án tuần 6 – Networking và Persistent Storage

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng trang này để chấm và đối chiếu kết quả. Học viên mở sau khi đã nộp bài, để so sánh với bài của mình.
:::

> **Tóm tắt:** Đáp án Buổi 11 và Buổi 12 theo từng Phần của bài lab (L1), từng thử thách và tình huống phá lỗi (L2), gợi ý giải 5 nhiệm vụ của bài tập tuần 6 và đáp án 5 câu hỏi kiểm tra.

## Cách dùng tài liệu này

Hãy đối chiếu chứ không chấm theo kiểu chép lại: bài nộp phải có lệnh và output thật trên máy học viên, không phải output trong tài liệu này. Địa chỉ IP, thời gian và tên volume sẽ khác trên mỗi máy. Tiêu chí chấm nằm ở [Hướng dẫn chấm tuần 6](../grading/week-06.md).

Các kết quả dưới đây đã được chạy thử trên Docker Desktop (Engine 29, Compose v2) với tên tài nguyên riêng. Hai điểm dễ gây nhầm lẫn khi làm lại:

- `wget` của Alpine (BusyBox) thử `localhost` bằng IPv6 trước, trong khi API chỉ nghe IPv4 (`0.0.0.0`). Vì vậy `docker exec ... wget http://localhost:3000/...` báo `Connection refused` dù API khỏe. Luôn dùng `127.0.0.1` khi gọi từ bên trong container Alpine.
- Khi API không phân giải được tên Postgres, việc tra DNS thất bại mất khoảng 5 đến 8 giây trước khi API trả `503` hoặc `500`. Gọi bằng `wget -T 3` sẽ hết giờ trước, nên dùng `-T 20` ở chỗ này.

## Buổi 11: Container Networking

### Đáp án L1 theo từng Phần

**Phần 1. Hai container gọi nhau bằng tên.**

1. `docker network create lab-net` rồi `docker network ls --filter name=lab-net` cho một dòng `lab-net` driver `bridge`.
2. Chạy `lab-web` (`nginx:1.27-alpine`) và `lab-client` (`alpine:3.20 sleep 3600`) cùng `--network lab-net`. Phải có `sleep` để Alpine không thoát ngay.
3. `docker exec lab-client wget -qO- http://lab-web | head -n 4` in phần đầu HTML của Nginx. `docker exec lab-client nslookup lab-web` in `Server: 127.0.0.11` và IP của `lab-web` trong subnet của `lab-net`.
4. Đối chứng: `docker run --rm alpine:3.20 wget -qO- -T 3 http://lab-web` báo `wget: bad address 'lab-web'` (container chạy trên default bridge, khác network). Gọi bằng IP của `lab-web` từ default bridge cũng hết giờ (`download timed out`), chứ không chỉ thất bại về tên.
5. `docker network inspect lab-net --format ...` liệt kê hai container (`lab-web`, `lab-client`) kèm IP và mask.

**Phần 2. Port mapping.** `docker run -d --name lab-web-pub --network lab-net -p 127.0.0.1:18082:80 nginx:1.27-alpine`, rồi `curl -sI http://localhost:18082 | head -n 1` in `HTTP/1.1 200 OK`. `docker port lab-web` in rỗng, còn `docker port lab-web-pub` in `80/tcp -> 127.0.0.1:18082`. Sau bước này `docker network inspect lab-net` có ba container (`lab-web`, `lab-client`, `lab-web-pub`); hai container là con số đúng ở cuối Phần 1.

Vì sao nên dùng tên và `-p`, không dùng IP: IP cấp phát động và đổi khi container được tạo lại; tên được DNS nhúng trả về IP hiện tại; `-p` là giao diện ổn định để truy cập từ host (trên Docker Desktop IP container thường còn không route được từ WSL).

**Phần 3. API và Postgres trên `club-net`.**

1. Build `docker build -t club-api:1.0.0 "$SP/backend"`.
2. `docker network create club-net` và `export DB_PASSWORD="$(openssl rand -hex 12)"`.
3. Chạy `lab-postgres` trong `club-net`, không `-p`, mount `init.sql` vào `/docker-entrypoint-initdb.d/init.sql:ro`, chờ bằng `pg_isready -h 127.0.0.1`. Vòng lặp in vài dòng `no response` rồi `accepting connections`: hành vi bình thường (server tạm chỉ nghe socket unix).
4. Chạy `lab-api` với `DB_HOST=lab-postgres`, `-p 127.0.0.1:13000:3000`. Kết quả: `/health` là `{"status":"healthy","service":"club-api"}`, `/ready` là `{"status":"ready"}`, `/api/members` là mảng Alice và Bob (đúng `init.sql`, hai dòng).
5. `docker port lab-postgres` in rỗng.
6. `docker network inspect club-net` có đúng hai container (`lab-postgres`, `lab-api`). Chụp evidence trước Phần 5, vì `lab-api-bad` hay `lab-api-iso` chạy trên cùng network sẽ làm số container nhiều hơn.

Vì sao Postgres không cần `-p 5432:5432`: API và Postgres cùng một network nên gọi trực tiếp `lab-postgres:5432` qua bridge nội bộ; `-p` chỉ cần cho truy cập từ ngoài network. Không publish còn có lợi về an toàn: máy khác không chạm được database.

**Phần 4. Isolation.**

1. Tạo `net-a`, `net-b`; `iso-a` (Nginx) ở `net-a`, `iso-b` (Alpine, `sleep 3600`) ở `net-b`.
2. Gọi bằng tên từ `iso-b`: `bad address 'iso-a'`.
3. Lấy IP của `iso-a` bằng `docker inspect -f '{{(index .NetworkSettings.Networks "net-a").IPAddress}}' iso-a`, gọi từ `iso-b` bằng `wget -T 3`: `download timed out`. Gọi bằng IP cũng thất bại vì hai network là hai bridge riêng, Docker chặn route giữa chúng; DNS chỉ là lớp thứ hai.
4. `docker network connect net-a iso-b`: gọi bằng tên thành công. `docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' iso-b` in `net-a net-b`, và lúc này gọi bằng IP cũng được.

**Phần 5. Tự phá lỗi `DB_HOST=localhost`.**

Cây điều tra:

1. Triệu chứng: container `Up`, `/health` 200, `/ready` 503, `/api/members` 500. `/ready` không ghi log lỗi nên gọi `/api/members` rồi đọc `docker logs lab-api-bad --tail 20`: có `Error: connect ECONNREFUSED 127.0.0.1:5432` (Node 22 có thể in thành `AggregateError` liệt kê cả `::1` và `127.0.0.1`).
2. Địa chỉ `127.0.0.1` là loopback. Hỏi: loopback của ai? Của chính container API, nơi không có gì nghe ở cổng 5432.
3. `docker exec lab-api-bad env | grep DB_` thấy `DB_HOST=localhost`.
4. `docker exec lab-api-bad nslookup lab-postgres` phân giải được: network ổn, lỗi nằm ở cấu hình.
5. Sửa: biến môi trường không đổi được trên container đang chạy nên phải tạo lại:

```bash
docker rm -f lab-api-bad
docker run -d --name lab-api-bad --network club-net -p 127.0.0.1:13002:3000 \
  -e DB_HOST=lab-postgres -e DB_PORT=5432 -e DB_NAME=clubdb \
  -e DB_USER=club -e DB_PASSWORD="$DB_PASSWORD" \
  club-api:1.0.0
sleep 2; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:13002/ready
```

Kết quả mong đợi: `200`. Nguyên nhân gốc: `localhost` trong container là chính container đó. Phòng tránh: `DB_HOST` bằng tên service trong cùng network, không viết cứng trong code, giữ endpoint `/ready` kiểm tra DB.

### Lời giải L2

Đề nằm ở [Buổi 11 – thử thách thêm](../../labs/week-06/session-11-challenge.md).

**Thử thách A: script isolation.** Cách tiếp cận: `trap cleanup EXIT` ở đầu để luôn dọn, một hàm `check` nhận kết quả mong đợi (`ok` hoặc `fail`), đếm số lần sai, và thoát mã khác 0 nếu có `FAIL` (bài tập tuần yêu cầu mã thoát khác 0). Cách đơn giản hơn là `if ! docker exec ...; then echo PASS; fi` cho từng kiểm tra, nhưng không cho mã thoát.

```bash
#!/usr/bin/env bash
set -u
FAILS=0
cleanup() {
  docker rm -f t-a t-b >/dev/null 2>&1
  docker network rm t-net-a t-net-b >/dev/null 2>&1
}
trap cleanup EXIT

check() { # check "mô tả" ok|fail lệnh...
  local desc=$1 expect=$2; shift 2
  if "$@" >/dev/null 2>&1; then got=ok; else got=fail; fi
  if [ "$got" = "$expect" ]; then echo "PASS $desc"; else echo "FAIL $desc"; FAILS=$((FAILS+1)); fi
}

docker network create t-net-a >/dev/null
docker network create t-net-b >/dev/null
docker run -d --name t-a --network t-net-a nginx:1.27-alpine >/dev/null
docker run -d --name t-b --network t-net-b alpine:3.20 sleep 600 >/dev/null
sleep 2
IP_A=$(docker inspect -f '{{(index .NetworkSettings.Networks "t-net-a").IPAddress}}' t-a)

check "gọi bằng tên thất bại" fail docker exec t-b wget -qO- -T 3 http://t-a
check "gọi bằng IP thất bại" fail docker exec t-b wget -qO- -T 3 "http://$IP_A"
docker network connect t-net-a t-b
check "sau connect gọi bằng tên thành công" ok docker exec t-b wget -qO- -T 3 http://t-a

[ "$FAILS" -eq 0 ] || exit 1
```

Đã chạy hai lần liên tiếp, cả hai in ba dòng `PASS` và thoát mã 0, không để lại container hay network. Sau lần chạy, `docker ps -a` và `docker network ls` là bằng chứng dọn sạch.

**Thử thách B: Compose hai network.**

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    networks:
      - backend-net

  api:
    image: club-api:1.0.0
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: clubdb
      DB_USER: club
      DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    ports:
      - "127.0.0.1:13001:3000"
    networks:
      - backend-net
      - frontend-net

  web:
    image: nginx:1.27-alpine
    networks:
      - frontend-net

networks:
  backend-net:
  frontend-net:
```

Lệnh kiểm tra:

```bash
docker compose exec web nslookup postgres
docker compose exec api nslookup postgres
docker compose exec api wget -qO- http://127.0.0.1:3000/health
```

Kết quả đã kiểm chứng: `web` in `server can't find postgres: NXDOMAIN`; `api` phân giải được tên `postgres`; `/health` hoặc `/ready` từ `api` trả JSON. Nếu viết `localhost` thì `wget` báo `Connection refused` (lỗi IPv6 nêu ở đầu tài liệu). Lý do thiết kế: `postgres` chỉ ở `backend-net`, `web` chỉ ở `frontend-net`, nên DNS của `web` không biết `postgres`; `api` nằm ở cả hai nên là cầu nối có kiểm soát. Cần `.env` có `DB_PASSWORD` và `.env.example` với giá trị giả, `.env` nằm trong `.gitignore`.

### Lời giải Phá lỗi nâng cao

**Phá lỗi 2: sai network.** API ở `lab-net-x`, Postgres ở `club-net`. Kiểm tra từ trong container bằng `127.0.0.1` và `-T 20`:

- `/ready` trả `HTTP/1.1 503 Service Unavailable` sau khoảng 7 giây.
- `/api/members` trả `500`, log có `code: 'ENOTFOUND'` kèm `hostname: 'lab-postgres'` (đôi khi `EAI_AGAIN`).
- Sửa: `docker network connect club-net lab-api-iso`, gọi lại `/ready` được `{"status":"ready"}` ngay mà không cần tạo lại container, vì DNS cập nhật theo network.

**Phá lỗi 3: tình huống 03** (`examples/troubleshooting/scenario-03`). Compose đặt `api` ở `app-net` và `postgres` ở `data-net`, hai network khác nhau. Điều tra: `docker compose logs api` thấy `ENOTFOUND postgres`; `docker network inspect` cho thấy mỗi container ở một network; từ trong `api`, `nslookup postgres` thất bại. Sửa: cho cả hai service dùng chung một network (thêm `data-net` vào `api`, hoặc gộp một network). Câu hỏi L2: `/health` vẫn 200 vì endpoint không đụng DB, và `docker compose ps` chỉ nhìn trạng thái tiến trình cộng healthcheck của Postgres (Postgres vẫn khỏe); `api` không có healthcheck gọi `/ready` nên không ai báo động. Cách phòng: thêm `healthcheck` cho `api` gọi `/ready` và để Compose theo dõi.

### Hiểu lầm hay gặp ở Buổi 11

- Nghĩ `localhost` trong container trỏ về host hoặc container khác.
- Nghĩ `-p` cần thiết để container gọi nhau. Chỉ cần cho truy cập từ host.
- Tưởng default bridge phân giải được tên vì đã thấy Compose làm được; Compose tự tạo user-defined network.
- Chứng minh isolation chỉ bằng tên, bỏ qua kiểm tra bằng IP.
- Quên `-T` nên lệnh chờ lâu; hoặc dùng `-T 3` ở chỗ DNS cần vài giây.
- Dùng `localhost` với `wget` trong Alpine rồi kết luận API hỏng (lỗi IPv6).
- Mở terminal mới làm `DB_PASSWORD` sinh lại giá trị khác, gây `password authentication failed`.

## Buổi 12: Persistent Storage

### Đáp án L1 theo từng Phần

**Phần 1. Chạy PostgreSQL với named volume.** `docker volume create pg-data`, rồi chạy `postgres:17-alpine` với `--mount type=volume,source=pg-data,target=/var/lib/postgresql/data`, chờ bằng `pg_isready -h 127.0.0.1`.

**Phần 2. Tạo dữ liệu.** Tạo bảng `members` và `INSERT 0 3` (Alice, Bob, Carol). `SELECT id, name` trả 3 dòng. Bài nộp phải thay bằng tên và email giả của riêng học viên.

**Phần 3. Xóa hẳn container và tạo lại.** `docker rm -f pg-lab`; `docker ps -a --filter name=pg-lab` rỗng; `docker volume ls --filter name=pg-data` vẫn còn. Chạy `pg-lab2` với cùng volume: `SELECT` vẫn 3 dòng, `docker logs pg-lab2` có `PostgreSQL Database directory appears to contain a database; Skipping initialization`.

**Phần 4. Kiểm chứng bằng inspect.** `docker inspect pg-lab2 --format ...` in `volume pg-data -> /var/lib/postgresql/data`; `SHOW data_directory;` in `/var/lib/postgresql/data`. Hai đường dẫn khớp nhau: volume đang thật sự được dùng.

**Phần 5. Backup và restore bằng `pg_dump`.**

1. `docker exec pg-lab pg_dump -U club -d clubdb > source/backup.sql`. File mở đầu bằng `-- PostgreSQL database dump`; dữ liệu nằm trong khối `COPY public.members (...) FROM stdin;`, nên `grep -c Alice` in `1` (một dòng dữ liệu).
2. `docker rm -f pg-lab` rồi `docker volume rm pg-data`.
3. Dựng lại database rỗng; `\dt` báo `Did not find any relations.` Restore: `docker exec -i pg-lab psql -U club -d clubdb -v ON_ERROR_STOP=1 < source/backup.sql` in `CREATE TABLE` và `COPY 3`. `SELECT id, name, email` cho thấy lại đúng dữ liệu.

Về `-i`: đã kiểm chứng rằng nếu bỏ `-i`, lệnh thoát mã 0 và không in lỗi nào, nhưng `SELECT count(*) FROM members;` báo `relation "members" does not exist`. Lý do: không có `-i`, stdin của `docker exec` không được nối vào tiến trình trong container, `psql` đọc được stdin rỗng, coi như không có gì để chạy và kết thúc thành công. Đó là vì sao "thất bại mà không có lỗi rõ ràng". Bài tập yêu cầu xem lại nội dung (`SELECT` dữ liệu), không chỉ đếm số dòng.

**Phần 6. Gom bằng chứng và dọn dẹp.** Evidence cần có: `SELECT` trước và sau recreate, `docker ps -a --filter name=pg-lab`, `docker volume ls`, `docker inspect` (Mounts), `SHOW data_directory;`, dòng `Skipping initialization`, output `\dt` lúc database rỗng và `SELECT` sau restore. Dọn bằng `docker rm -f pg-lab pg-lab2` và `docker volume rm pg-data`.

### Lời giải L2

Đề nằm ở [Buổi 12 – thử thách thêm](../../labs/week-06/session-12-challenge.md).

**Thử thách A: Compose, `down` và `down -v`.** Dùng `name: lab12` ở đầu file để tên project và tên volume dễ đoán (`lab12_pgdata`); mật khẩu theo mẫu `${DB_PASSWORD:?Set DB_PASSWORD in .env}` và đặt trong `.env` (không commit).

```yaml
name: lab12

services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U club -d clubdb"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

```bash
cd ~/devops-labs/lab-12/source
echo "DB_PASSWORD=lab-only-password" > .env
docker compose up -d --wait
docker compose exec postgres psql -U club -d clubdb -c "CREATE TABLE t(x int); INSERT INTO t VALUES (1);"
docker compose down && docker compose up -d --wait
docker compose exec postgres psql -U club -d clubdb -tA -c "SELECT count(*) FROM t;"   # 1
docker compose down -v && docker compose up -d --wait
docker compose exec postgres psql -U club -d clubdb -tA -c "SELECT count(*) FROM t;"   # báo lỗi: relation "t" does not exist
```

Giải thích mẫu: `down` xóa container và network nhưng giữ named volume; `down -v` xóa thêm named volume khai báo trong file, nên database mới sinh ra từ volume rỗng và không có bảng `t`.

**Thử thách B: backup mức volume.** Dừng database (`docker compose stop postgres`), nén volume `lab12_pgdata` bằng container Alpine tạm gắn volume chỉ đọc và bind mount `$PWD`:

```bash
docker compose stop postgres
docker run --rm \
  --mount type=volume,source=lab12_pgdata,target=/data,readonly \
  --mount type=bind,source="$PWD",target=/backup \
  alpine:3.20 tar czf /backup/pgdata.tgz -C /data .
tar tzf pgdata.tgz | head -n 5
docker compose start postgres
```

`tar tzf` liệt kê `./PG_VERSION`, `./global/` và các thư mục khác. Phải dừng database vì file đang được ghi dở có thể không nhất quán; bản sao thô còn phụ thuộc cùng phiên bản Postgres, còn `pg_dump` thì không. Tên volume `lab12_pgdata` phụ thuộc `name: lab12` trong file; học viên nên kiểm tra bằng `docker volume ls`.

**Thử thách C: tình huống 04.** Cây điều tra (đã tái hiện với Compose có `PGDATA=/var/lib/postgresql/pgdata` và volume gắn vào `/var/lib/postgresql/data`):

1. Xác nhận dữ liệu mất: sau `down` rồi `up`, `SELECT` báo `relation "members" does not exist`.
2. `SHOW data_directory;` in `/var/lib/postgresql/pgdata`; `docker inspect` cho `volume ... -> /var/lib/postgresql/data`. Hai đường dẫn khác nhau.
3. Volume có tên chứa gì: chạy container Alpine tạm gắn volume rồi `ls -la`: rỗng (chỉ `.` và `..`).
4. Dữ liệu nằm ở đâu: `docker diff <container> | grep pgdata | head` thấy `A /var/lib/postgresql/pgdata`, `A /var/lib/postgresql/pgdata/PG_VERSION`: dữ liệu ở writable layer. Không có `grep`, mấy dòng đầu chỉ là socket trong `/run`, dễ kết luận sai.
5. Kết luận: `down` xóa container nên xóa luôn dữ liệu; container mới thấy `PGDATA` trống và khởi tạo lại.

Nguyên nhân gốc: `PGDATA` và điểm mount không trùng nhau; volume tồn tại không đồng nghĩa với Postgres ghi vào nó. Cách sửa (đã kiểm chứng): bỏ biến `PGDATA` (hoặc đặt cả hai cùng một đường dẫn), `down -v` để bỏ volume trống, `up`, tạo dữ liệu, `down`, `up`: dữ liệu còn. Cứu dữ liệu: nếu chưa `down`, `docker compose exec postgres pg_dump -U club clubdb` ngay (đã thử, ra dump hợp lệ) rồi restore sau khi sửa cấu hình; nếu đã `down`, dữ liệu trong writable layer đã mất, chỉ còn khôi phục từ backup hoặc nhập lại. Phòng tránh: đối chiếu `docker inspect` với `SHOW data_directory;`, làm bài kiểm tra recreate ngay ngày đầu, có backup định kỳ và thử restore thật.

### Hiểu lầm hay gặp ở Buổi 12

- "Có volume trong `docker volume ls` nghĩa là dữ liệu an toàn." Phải đối chiếu đích mount với `data_directory`.
- Chứng minh persistence bằng `docker stop` hoặc `restart` thay vì `docker rm -f`.
- Tin rằng đổi `POSTGRES_PASSWORD` rồi `up` sẽ đổi mật khẩu. Biến chỉ áp dụng khi khởi tạo lần đầu; đổi mật khẩu mà giữ dữ liệu cần `ALTER USER club WITH PASSWORD ...` (hoặc xóa volume sau khi backup).
- Cho rằng `init.sql` chạy lại mỗi lần `up`. Chỉ chạy khi data directory còn trống.
- Quên `-i` khi restore, hoặc chỉ kiểm tra số dòng.
- Bind mount dữ liệu Postgres dưới `/mnt/c`.
- Chạy `docker compose down -v` hoặc `docker volume prune` mà không kiểm tra, xóa luôn dữ liệu.

## Bài tập tuần 6

### Gợi ý lời giải L1

1. **Nhiệm vụ 1 (Buổi 11, Phần 1 và 2).** Bằng chứng cần: `docker network ls --filter name=lab-net`, `wget` và `nslookup` (có `127.0.0.11`), `bad address` từ default bridge, `curl -sI` 200 với cổng `127.0.0.1:18082`, `docker port` rỗng của container không publish.
2. **Nhiệm vụ 2 (Buổi 11, Phần 3).** Đúng hai container trong `club-net` tại thời điểm chụp evidence. Che mật khẩu: không in `env` của container.
3. **Nhiệm vụ 3 (Buổi 11, Phần 4).** Giải thích gọi bằng IP thất bại: mỗi user-defined network là một bridge riêng, Docker không route giữa các bridge, nên gói tin tới IP của network kia bị bỏ.
4. **Nhiệm vụ 4 (Buổi 12, Phần 1 đến 4).** Làm bằng dữ liệu riêng của học viên (tên, email của chính họ). Mentor kiểm tra `SELECT` hiển thị dữ liệu riêng chứ không phải Alice, Bob, Carol.
5. **Nhiệm vụ 5 (Buổi 12, Phần 5).** `backup.sql` chứa dữ liệu của học viên; có output lúc volume đã bị xóa (database mới rỗng) và sau restore.

### Gợi ý lời giải L2

- Thử thách A (script isolation): Thử thách A của Buổi 11.
- Thử thách B (Compose): Thử thách B của Buổi 11 (hai network) và Thử thách A của Buổi 12 (`down` với `down -v`).
- Thử thách C (điều tra lỗi) chọn một trong hai lỗi: `DB_HOST=localhost` (Phần 5 của Buổi 11: log `ECONNREFUSED 127.0.0.1:5432`, sửa thì `/ready` 200) hoặc `PGDATA` lệch điểm mount (Thử thách C của Buổi 12: cặp output `docker inspect` và `SHOW data_directory;` khác nhau; sửa thì dữ liệu sống sót sau recreate).

### Đáp án 5 câu hỏi kiểm tra

1. `localhost` trong container là chính container API, không phải Postgres; Postgres đang chạy ở container khác. Kiểm tra đầu tiên: `docker exec <api> env | grep DB_HOST` (thấy `localhost`); sửa thành tên container hoặc service Postgres trong cùng network, tạo lại container.
2. Có `127.0.0.1:` thì cổng chỉ mở trên localhost của host; không có thì mở ở mọi interface, máy trong LAN truy cập được. Không cần `-p` khi chỉ có container khác trong cùng network gọi tới (ví dụ Postgres).
3. `docker network connect TEN_NETWORK TEN_CONTAINER`, ví dụ `docker network connect club-net lab-api-iso`; không cần tạo lại container.
4. Hai nguyên nhân khả dĩ: (a) điểm mount sai hoặc không khớp `PGDATA` nên Postgres ghi vào writable layer; (b) volume bị xóa hoặc đổi tên (ví dụ `down -v`, hoặc đổi tên project nên tên volume khác), hoặc dữ liệu đang ghi vào anonymous volume mới mỗi lần. Hai lệnh phân biệt: `docker inspect <container> --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{"\n"}}{{end}}'` kèm `docker exec ... psql -tA -c "SHOW data_directory;"` để đối chiếu đích mount với nơi ghi; và `docker volume ls` (hoặc `docker volume inspect`) để xem volume có đúng tên và còn tồn tại không.
5. Biến `POSTGRES_PASSWORD` chỉ có tác dụng ở lần khởi tạo đầu, khi data directory còn trống; volume đã có dữ liệu thì mật khẩu cũ nằm trong database. Đổi mà không mất dữ liệu: `docker exec ... psql -U club -d clubdb -c "ALTER USER club WITH PASSWORD '...';"`, rồi cập nhật cấu hình của ứng dụng.
