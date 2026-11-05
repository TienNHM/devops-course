# Slide Ngày 08 – Docker Compose chạy cả Club

> **Tóm tắt:** Một lệnh `docker compose up -d --build` chạy cả Club (frontend, backend, Postgres) với healthcheck, `depends_on: service_healthy`, dữ liệu bền và mật khẩu nằm trong `.env`.

## Slide 1: Hôm nay bạn làm ra gì

- Cả Club chạy từ `~/devops-labs/club` bằng **một lệnh**, mở được tại `http://localhost:8080`.
- Dữ liệu còn sau `down`, và `.env` không bị commit.
- Cần có: Ngày 7 xong, Docker Desktop đang chạy, `~/devops-labs/club` có `compose.yaml`.
- Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Đọc nhanh, không đọc từng dòng.
- Hỏi: ai từng quên một cờ `-e` khi chạy `docker run`?
- Dùng `docker compose` (có dấu cách), không dùng `docker-compose` bản v1.
:::

---

## Slide 2: Chuỗi lệnh docker run quá dễ sai

![Trước: nhiều lệnh docker run; sau: một file compose.yaml và một lệnh](/slides/img/s13-pain.svg)

::: details Ghi chú cho mentor
- Cả hệ thống = tạo network, tạo volume, chạy postgres, chạy backend, chạy frontend.
- Lệnh nằm trong history của một người, không ai review được; người mới phải chép lại cả chục dòng.
- Các lệnh trong hình là rút gọn để minh họa.
:::

---

## Slide 3: Compose: khai báo một lần, cả hệ thống tự dựng

![compose.yaml được docker compose biến thành network, volume và 3 container](/slides/img/s13-compose-flow.svg)

::: details Ghi chú cho mentor
- Compose mô tả trạng thái mong muốn, rồi tạo hoặc cập nhật container, network, volume cho khớp.
- Tên project mặc định lấy theo thư mục chứa `compose.yaml` (ở đây là `club`).
:::

---

## Slide 4: Bước 1 (10 phút): Dọn container của ngày trước

Cổng 8080 và 3000 có thể còn bị container cũ chiếm.

```bash
cd ~/devops-labs/club
docker compose version
docker ps -a
docker rm -f <tên-container-cũ>
```

**Kiểm tra:** bạn đúng khi `docker ps` không còn container nào publish `8080` hoặc `3000`.

::: details Ghi chú cho mentor
- Chỉ chạy `docker rm -f` nếu còn container cũ; thay `<tên-container-cũ>` bằng tên thật.
- Mong đợi: `Docker Compose version v2.x`. Lỗi hay gặp nhất cả ngày: cổng 8080 còn bị container Ngày 4 giữ.
:::

---

## Slide 5: Bước 2 (10 phút): Trong container, localhost là chính nó

![DB_HOST localhost trỏ về chính backend, DB_HOST postgres được DNS đổi thành IP](/slides/img/s13-dns.svg)

Trong `compose.yaml`, backend có `DB_HOST: postgres`: gọi Postgres bằng tên service.

::: details Ghi chú cho mentor
- Trong network của project, gọi nhau bằng tên service: backend gọi `postgres:5432`, nginx gọi `backend:3000`.
- Vì vậy `DB_HOST: postgres`, không phải `localhost`.
:::

---

## Slide 6: Bước 2: Đọc compose.yaml, chờ Postgres thật sự sẵn sàng

```bash
cat compose.yaml
```

Tìm đoạn này trong `backend` và `postgres`:

```yaml
    depends_on:
      postgres:
        condition: service_healthy
# ... và trong postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U club -d clubdb"]
```

**Kiểm tra:** bạn đúng khi chỉ ra được dòng `service_healthy` và dòng `DB_HOST: postgres`.

::: details Ghi chú cho mentor
- Học viên chỉ cần hiểu, không viết lại. Cũng tìm: `frontend` publish `${WEB_PORT:-8080}:80` (trống thì 8080), volume `postgres-data` gắn vào `/var/lib/postgresql/data`, `frontend` đợi `backend` healthy.
- Postgres không publish cổng ra máy: giảm bề mặt tấn công.
:::

---

## Slide 7: depends_on chưa có nghĩa là sẵn sàng

![Postgres còn chạy init.sql, backend mặc định start ngay và lỗi; với service_healthy thì chờ](/slides/img/s13-depends.svg)

::: details Ghi chú cho mentor
- `depends_on` mặc định chỉ đảm bảo thứ tự start. `condition: service_healthy` chờ healthcheck báo healthy.
- Postgres "đang chạy" chưa nhận kết nối vì còn khởi tạo và chạy `init.sql`.
- Ví von: nhà hàng đã mở cửa nhưng bếp chưa nhóm lửa.
:::

---

## Slide 8: Bước 3 (15 phút): Mật khẩu nằm ở .env, không nằm trong Git

![Chỉ commit .env.example; thiếu .env thì Compose dừng và in thông báo](/slides/img/s13-env.svg)

::: details Ghi chú cho mentor
- Compose tự đọc `.env` cạnh `compose.yaml` để thay các biến `${...}`.
- `${DB_PASSWORD:?Set DB_PASSWORD in .env}`: bắt buộc có, thiếu thì dừng và in thông báo sau dấu `?`.
- `.env` phải nằm trong `.gitignore`; chỉ commit `.env.example`.
:::

---

## Slide 9: Bước 3: Chạy khi thiếu .env để thấy Compose chặn bạn

```bash
docker compose up -d
```

```text
required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env
```

**Kiểm tra:** bạn đúng khi thấy thông báo lỗi trên và chưa có container nào chạy.

::: details Ghi chú cho mentor
- Thông báo lỗi do chính file YAML định nghĩa sau dấu `?`.
:::

---

## Slide 10: Bước 3: Tạo .env từ mẫu

```bash
cp .env.example .env
nano .env
git check-ignore -v .env
docker compose config | head -30
```

Đổi `DB_PASSWORD` thành chuỗi giả của bạn. Cổng 8080 bận thì đặt `WEB_PORT=8081`.

**Kiểm tra:** bạn đúng khi `git check-ignore -v .env` in một dòng và `config` không báo lỗi.

::: details Ghi chú cho mentor
- `.env` là file ẩn, dùng `ls -a` để thấy. Không dùng mật khẩu thật của dịch vụ nào.
- Nếu `check-ignore` không in gì, thêm dòng `.env` vào `.gitignore` trước khi làm tiếp.
- `config` in YAML với `DB_PASSWORD` đã được thay giá trị.
:::

---

## Slide 11: Bước 4 (20 phút): Chạy cả Club bằng một lệnh

```bash
docker compose up -d --build
docker compose ps
```

```text
club-postgres-1   Up (healthy)   5432/tcp
club-backend-1    Up (healthy)   127.0.0.1:3000->3000/tcp
club-frontend-1   Up             0.0.0.0:8080->80/tcp
```

**Kiểm tra:** bạn đúng khi postgres ghi `(healthy)`, backend và frontend `Up` (output rút gọn).

::: details Ghi chú cho mentor
- Lần đầu mất 1-3 phút để build và tải image. Postgres chưa `healthy`: đợi 10-15 giây rồi chạy lại `ps`.
- Dùng tên service (`backend`) trong lệnh, không dùng tên container. Postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ.
- Khi lỗi: `ps`, rồi `logs`, rồi `config` và `exec`.
:::

---

## Slide 12: Bước 4: Đọc log để biết hệ thống đang làm gì

```bash
docker compose logs --tail=20 postgres
docker compose logs --tail=20 backend
```

Log postgres có `running /docker-entrypoint-initdb.d/init.sql`; log backend có `API listening on port 3000`.

**Kiểm tra:** bạn đúng khi thấy cả hai dòng trên.

::: details Ghi chú cho mentor
- Tiền tố tên container `club-` lấy theo tên thư mục.
:::

---

## Slide 13: Bước 5 (15 phút): Kiểm thử qua mạng

```bash
curl -s http://localhost:8080/api/members
curl -s http://localhost:3000/health
docker compose exec frontend wget -qO- http://backend:3000/health
docker compose exec postgres psql -U club -d clubdb -c "SELECT id, name FROM members;"
```

Mong đợi: JSON có Alice và Bob, `{"status":"healthy","service":"club-api"}` hai lần, bảng 2 dòng.

**Kiểm tra:** bạn đúng khi lệnh `exec frontend ... http://backend:3000/health` thành công. Mở `http://localhost:8080` trên trình duyệt Windows.

::: details Ghi chú cho mentor
- Lệnh `wget` thứ ba chạy trong container frontend và gọi `backend` bằng tên service: nó chứng minh các container tìm nhau qua tên.
- Gọi API qua nginx (cổng 8080) và gọi thẳng backend (cổng 3000). Dùng `WEB_PORT` của học viên nếu đã đổi.
:::

---

## Slide 14: Bước 6 (15 phút): down giữ dữ liệu, down -v xóa dữ liệu

![Sau down còn Carol; sau down -v mất Carol vì volume bị xóa](/slides/img/s13-volume.svg)

::: details Ghi chú cho mentor
- `postgres-data` là named volume gắn vào `/var/lib/postgresql/data`. Ví von: ổ cứng ngoài, `down` rút ổ ra, `down -v` vứt luôn ổ.
- `./database/init.sql` được mount vào `/docker-entrypoint-initdb.d/` và chỉ chạy khi data directory còn trống.
:::

---

## Slide 15: Bước 6: Thêm Carol, `down`, rồi `up` lại

```bash
docker compose exec postgres psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker compose down
docker compose up -d
sleep 10
curl -s http://localhost:8080/api/members
```

**Kiểm tra:** bạn đúng khi `/api/members` vẫn có Carol (3 phần tử).

::: details Ghi chú cho mentor
- API chưa có POST nên thêm Carol bằng SQL.
- `down` xóa container và network nhưng giữ named volume.
:::

---

## Slide 16: Bước 6: `down -v` xóa cả dữ liệu

**Cẩn thận:** `docker compose down -v` xóa volume `postgres-data`. Chỉ chạy trong `~/devops-labs/club`.

```bash
docker compose down -v
docker compose up -d
sleep 15
curl -s http://localhost:8080/api/members
```

**Kiểm tra:** bạn đúng khi chỉ còn Alice và Bob, Carol đã mất.

::: details Ghi chú cho mentor
- Carol mất vì volume bị xóa và `init.sql` chạy lại từ đầu. Kết quả rỗng hoặc lỗi: chờ thêm vài giây rồi gọi lại.
:::

---

## Slide 17: Lỗi 1: thiếu biến hoặc cổng bận

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `required variable DB_PASSWORD is missing a value` | Chưa có `.env` hoặc biến trống | `cp .env.example .env`, điền `DB_PASSWORD` |
| `port is already allocated` | Cổng 8080 bị chiếm | `docker rm -f` container cũ, hoặc `WEB_PORT=8081` trong `.env` |

::: details Ghi chú cho mentor
- Cách chẩn đoán: `docker compose config` để thấy biến đã thay, `docker ps` để thấy ai giữ cổng.
:::

---

## Slide 18: Lỗi 2: YAML sai và backend không nối được DB

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `yaml: ... mapping values are not allowed` | Thụt lề sai, dùng Tab | Dùng 2 dấu cách; `docker compose config` chỉ ra dòng lỗi |
| Backend `ECONNREFUSED` hoặc `ENOTFOUND` tới DB | `DB_HOST` sai (ví dụ `localhost`) | Đặt `DB_HOST: postgres` |

::: details Ghi chú cho mentor
- Nhắc lại slide "localhost là chính nó".
:::

---

## Slide 19: Lỗi 3: API 500 dù mọi container `Up`

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `/api/members` 500, bảng `members` không tồn tại | Volume cũ đã có dữ liệu nên `init.sql` không chạy lại | `docker compose down -v` rồi `up -d` |
| Đổi `DB_PASSWORD`, API trả 500 | Volume giữ mật khẩu cũ; `POSTGRES_PASSWORD` chỉ dùng lúc khởi tạo | Trả lại mật khẩu cũ, hoặc `ALTER USER` |

::: details Ghi chú cho mentor
- Cả hai lỗi đều do dữ liệu cũ trong volume. `down -v` chỉ dùng được khi chấp nhận mất dữ liệu.
:::

---

## Slide 20: Tự kiểm tra

1. Vì sao backend dùng `DB_HOST: postgres` mà không phải `localhost`?
2. `depends_on` với `condition: service_healthy` khác gì `depends_on` mặc định?
3. `docker compose down` và `down -v` khác nhau thế nào?

::: details Ghi chú cho mentor
1. `localhost` trong container backend là chính backend. Tên service `postgres` được DNS của network Compose đổi thành IP container Postgres.
2. Mặc định chỉ đảm bảo Postgres được start trước. `service_healthy` chờ healthcheck báo healthy, tức Postgres thật sự nhận kết nối.
3. `down` xóa container và network, giữ volume nên dữ liệu còn. `down -v` xóa cả volume nên mất dữ liệu.
:::

---

## Slide 21: Tiếp theo

![Ba điều cần nhớ: một file, gọi bằng tên, volume giữ dữ liệu](/slides/img/s13-recap.svg)

Ngày 9: [GitHub Actions CI](../04-cicd/session-16.md).

---

## Slide 22: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Compose file reference](https://docs.docker.com/reference/compose-file/): tra cứu mọi khóa trong compose.yaml.
- **Tài liệu chính thức:** [Compose services](https://docs.docker.com/reference/compose-file/services/): cách khai báo service, port, volume.
- **Best practice:** [Environment variables best practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/): quản lý biến môi trường và file .env an toàn.
- **Best practice:** [The Twelve-Factor App: Config](https://12factor.net/config): để cấu hình trong môi trường, không trong code.
- **Best practice:** [Use secrets in Compose](https://docs.docker.com/compose/how-tos/use-secrets/): không để mật khẩu nằm trong file.
