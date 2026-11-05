# Ngày 8 – Docker Compose chạy cả Club

::: warning Bản lưu trữ
Nội dung bài này đã chuyển vào [slide Ngày 8](../../slides/03-compose/session-13.md). Lộ trình Cơ bản chỉ học bằng slide, trang này giữ lại để tham khảo và không còn là đường học chính.
:::

Lộ trình Cơ bản · Ngày 8/10 · khoảng 2 giờ

[Slide Ngày 8](../../slides/03-compose/session-13.md) · [Thử thách thêm](session-13-challenge.md)

> **Tóm tắt:** Một lệnh `docker compose up -d --build` chạy cả Club (frontend, backend, Postgres) với healthcheck, `depends_on: service_healthy`, dữ liệu bền và mật khẩu nằm trong `.env`.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** cả ứng dụng Club chạy từ `~/devops-labs/club` bằng một lệnh, mở được tại `http://localhost:8080`, dữ liệu còn sau `down`, và `.env` không bị commit.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 7 – Postgres giữ dữ liệu bằng volume](../week-06/session-12.md)
- [ ] Docker Desktop đang chạy, terminal WSL mở trong `~` (không làm việc dưới `/mnt/c`). Xem [Setup Guide](../../resources/setup-guide.md)
- [ ] Thư mục `~/devops-labs/club` có `compose.yaml` (đã copy từ starter-project ở Ngày 3)
:::

## Bài toán thật

Ở các ngày trước bạn chạy Club bằng nhiều lệnh `docker run`: một lệnh cho Postgres, một cho backend, một cho frontend. Bạn mới phải chép cả chục dòng, quên một cờ `-e` là hệ thống không lên, và lệnh chỉ nằm trong lịch sử terminal của bạn. Hôm nay bạn gom tất cả vào `compose.yaml`, file này nằm trong Git cùng mã nguồn. Người mới chỉ cần clone, tạo `.env`, chạy một lệnh.

Ba ý bạn sẽ thấy tận mắt. Một: các service gọi nhau bằng tên (`postgres`, `backend`), vì `localhost` trong container là chính container đó. Hai: `depends_on` mặc định chỉ lo thứ tự start, muốn backend chờ Postgres sẵn sàng thật thì cần `healthcheck` và `condition: service_healthy`. Ba: mật khẩu nằm trong `.env`, không nằm trong Git.

## Làm

Tất cả chạy trong `~/devops-labs/club`. Dùng `docker compose` (có dấu cách), không dùng `docker-compose` bản cũ.

### Bước 1: Dọn các container của ngày trước

Cổng 8080 (nginx Ngày 4) và 3000 (API Ngày 6) có thể còn bị chiếm. Xem và dọn.

```bash
cd ~/devops-labs/club
docker --version
docker compose version
docker ps -a
```

Nếu còn container cũ của Club, xóa chúng (thay tên đúng của bạn):

```bash
docker rm -f <tên-container-cũ>
```

Kết quả mong đợi: `Docker version 27.x` (hoặc mới hơn), `Docker Compose version v2.x`, và không còn container nào giữ cổng 8080 hoặc 3000.

::: tip Kiểm tra: bạn đúng khi
`docker ps` không còn container nào publish `8080` hoặc `3000`.
:::

### Bước 2: Đọc compose.yaml

Mở file và tìm bốn thứ. Bạn không cần viết lại, chỉ cần hiểu.

```bash
cat compose.yaml
```

Tìm các điểm sau trong file:

- `frontend` publish `${WEB_PORT:-8080}:80`: dùng `WEB_PORT` nếu có, trống thì 8080.
- `backend` có `DB_HOST: postgres` (gọi Postgres bằng tên service) và `DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}` (bắt buộc có mật khẩu, thiếu thì Compose dừng).
- `postgres` có `healthcheck` dùng `pg_isready`, và volume `postgres-data` gắn vào `/var/lib/postgresql/data`.
- `backend` có `depends_on` với `condition: service_healthy` trỏ tới `postgres`; `frontend` đợi `backend` healthy.

::: tip Kiểm tra: bạn đúng khi
Bạn chỉ ra được dòng `service_healthy` và dòng `DB_HOST: postgres` trong file.
:::

### Bước 3: Tạo .env và chạy thử khi thiếu nó

Chạy trước khi có `.env` để thấy Compose chặn bạn.

```bash
docker compose up -d
```

Kết quả mong đợi: `required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env`. Giờ tạo `.env` từ mẫu (file ẩn, dùng `ls -a` để thấy) và đặt mật khẩu của riêng bạn:

```bash
cp .env.example .env
nano .env
```

Đổi `DB_PASSWORD` thành một chuỗi giả của bạn (không dùng mật khẩu thật của dịch vụ nào). Nếu cổng 8080 bận, đặt `WEB_PORT=8081`. Rồi kiểm tra Git bỏ qua `.env`:

```bash
git check-ignore -v .env
docker compose config | head -30
```

Kết quả mong đợi: `git check-ignore` in một dòng chỉ tới quy tắc trong `.gitignore`; `config` in YAML với `DB_PASSWORD` đã được thay giá trị. Nếu `check-ignore` không in gì, thêm dòng `.env` vào `.gitignore` trước khi làm tiếp.

::: tip Kiểm tra: bạn đúng khi
`git check-ignore -v .env` in ra một dòng, và `docker compose config` không báo lỗi.
:::

### Bước 4: Chạy cả Club bằng một lệnh

```bash
docker compose up -d --build
docker compose ps
```

Kết quả mong đợi (rút gọn; tiền tố `club-` theo tên thư mục):

```text
club-postgres-1   Up (healthy)   5432/tcp
club-backend-1    Up (healthy)   127.0.0.1:3000->3000/tcp
club-frontend-1   Up             0.0.0.0:8080->80/tcp
```

Lần đầu mất 1-3 phút để build và tải image. Postgres chưa `healthy`? Đợi 10-15 giây rồi chạy lại `ps`. Dùng tên service (`backend`) trong lệnh, không dùng tên container. Xem log để biết hệ thống đang làm gì:

```bash
docker compose logs --tail=20 postgres
docker compose logs --tail=20 backend
```

Log postgres có dòng `running /docker-entrypoint-initdb.d/init.sql`; log backend có dòng `API listening on port 3000`.

::: tip Kiểm tra: bạn đúng khi
Cả ba service chạy, postgres ghi `(healthy)`, log backend có `API listening on port 3000`.
:::

### Bước 5: Kiểm thử qua mạng

```bash
curl -s http://localhost:8080/api/members
curl -s http://localhost:3000/health
docker compose exec frontend wget -qO- http://backend:3000/health
docker compose exec postgres psql -U club -d clubdb -c "SELECT id, name FROM members;"
```

Kết quả mong đợi: JSON có Alice và Bob; `{"status":"healthy","service":"club-api"}` hai lần; bảng 2 dòng. Lệnh `wget` thứ ba chạy trong container frontend và gọi `backend` bằng tên service: nó chứng minh các container tìm nhau qua tên. Mở `http://localhost:8080` (hoặc `WEB_PORT` của bạn) trên trình duyệt Windows để xem giao diện.

::: tip Kiểm tra: bạn đúng khi
`/api/members` trả JSON có Alice và Bob, và lệnh `exec frontend ... http://backend:3000/health` thành công.
:::

### Bước 6: Dữ liệu bền qua down, mất qua down -v

Thêm Carol bằng SQL (API chưa có POST), rồi `down` và `up` lại.

```bash
docker compose exec postgres psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker compose down
docker compose up -d
sleep 10
curl -s http://localhost:8080/api/members
```

Kết quả mong đợi: vẫn có Carol (3 phần tử). `down` xóa container và network nhưng giữ named volume. Giờ xóa cả volume:

::: warning down -v xóa dữ liệu
`docker compose down -v` xóa volume `postgres-data`, tức mọi dữ liệu Postgres của Club trong lab. Chỉ chạy trong `~/devops-labs/club`.
:::

```bash
docker compose down -v
docker compose up -d
sleep 15
curl -s http://localhost:8080/api/members
```

Kết quả mong đợi: chỉ còn Alice và Bob; Carol mất vì volume bị xóa và `init.sql` chạy lại từ đầu. Kết quả rỗng hoặc lỗi? Chờ thêm vài giây rồi gọi lại.

::: tip Kiểm tra: bạn đúng khi
Sau `down` còn Carol, sau `down -v` không còn Carol.
:::

## Gặp lỗi? {#gap-loi}

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `required variable DB_PASSWORD is missing a value` | Chưa có `.env` hoặc biến trống | `cp .env.example .env`, điền `DB_PASSWORD`, chạy `docker compose config` |
| `port is already allocated` (hoặc `ports are not available ... bind`) | Cổng 8080 bị container hoặc chương trình khác chiếm | `docker ps` rồi `docker rm -f` container cũ, hoặc đặt `WEB_PORT=8081` trong `.env` |
| `yaml: ... mapping values are not allowed` | Thụt lề sai, dùng Tab thay vì dấu cách | Dùng 2 dấu cách; chạy `docker compose config` để thấy dòng lỗi |
| Backend lỗi `ECONNREFUSED` hoặc `ENOTFOUND` tới DB | `DB_HOST` sai (ví dụ `localhost`) | Đặt `DB_HOST: postgres` |
| `/api/members` trả 500, bảng `members` không tồn tại | Volume cũ đã có dữ liệu nên `init.sql` không chạy lại | Trong lab: `docker compose down -v` rồi `up -d` |
| Đổi `DB_PASSWORD` trong `.env`, mọi container `Up` nhưng API trả 500 | Volume giữ mật khẩu cũ; `POSTGRES_PASSWORD` chỉ dùng khi khởi tạo lần đầu | Trả lại mật khẩu cũ, hoặc `ALTER USER`; xem [Thử thách thêm](session-13-challenge.md) |

## Nộp bài

- [ ] `notes/day-08.md` (trong `~/devops-labs`) có output `docker compose ps` với ba service chạy và postgres `healthy`.
- [ ] `notes/day-08.md` có ba lần gọi `/api/members` theo thứ tự: ban đầu, sau `down` (có Carol), sau `down -v` (mất Carol).
- [ ] `notes/day-08.md` có 2-3 câu giải thích vì sao Carol còn sau `down` nhưng mất sau `down -v` (nhắc `postgres-data` và `init.sql`).
- [ ] `git status` không thấy `.env`; chỉ `.env.example` nằm trong Git. Commit note lên `devops-labs`.

## Tự kiểm tra

1. Vì sao backend dùng `DB_HOST: postgres` mà không phải `localhost`?
2. `depends_on` với `condition: service_healthy` khác gì `depends_on` mặc định?
3. `docker compose down` và `down -v` khác nhau thế nào?

::: details Đáp án gợi ý
1. `localhost` trong container backend là chính backend. Tên service `postgres` được DNS của network Compose đổi thành IP container Postgres.
2. Mặc định chỉ đảm bảo Postgres được start trước. `service_healthy` chờ healthcheck báo healthy, tức Postgres thật sự nhận kết nối.
3. `down` xóa container và network, giữ volume nên dữ liệu còn. `down -v` xóa cả volume nên mất dữ liệu.
:::

## Tiếp theo

[Ngày 9 – GitHub Actions CI](../week-08/session-16.md)

::: details Tài liệu tham khảo
- [Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Compose services](https://docs.docker.com/reference/compose-file/services/)
- [Environment variables best practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/)
- [Use secrets in Compose](https://docs.docker.com/compose/how-tos/use-secrets/)
- [The Twelve-Factor App: Config](https://12factor.net/config)
:::
