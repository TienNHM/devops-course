# Slide Ngày 08 – Docker Compose chạy cả Club

> **Tóm tắt:** Một lệnh `docker compose up -d --build` chạy cả Club (frontend, backend, Postgres) với healthcheck, `depends_on: service_healthy`, dữ liệu bền vững và mật khẩu nằm trong `.env`.

## Hôm nay làm ra gì

- Cả Club chạy từ `~/devops-labs/club` bằng **một lệnh**, truy cập được tại `http://localhost:8080`.
- Dữ liệu còn lại sau `down`, và file `.env` không bị commit.
- Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Điều kiện: Ngày 7 hoàn thành, Docker Desktop đang chạy, thư mục `~/devops-labs/club` có `compose.yaml`.
- Trình bày nhanh, không đọc từng dòng.
- Câu hỏi mở đầu: người học nào từng quên một cờ `-e` khi chạy `docker run`?
- Dùng `docker compose` (có dấu cách), không dùng `docker-compose` bản v1.
:::

---

## Chuỗi lệnh docker run dễ sai sót

![Trước: nhiều lệnh docker run; sau: một file compose.yaml và một lệnh](/slides/img/s13-pain.svg)

::: details Ghi chú cho mentor
- Cả hệ thống gồm: tạo network, tạo volume, chạy postgres, chạy backend, chạy frontend.
- Các lệnh nằm trong history của một người nên không thể review; người mới phải chép lại hàng chục dòng.
- Các lệnh trong hình là rút gọn để minh họa.
:::

---

## Khái niệm: Docker Compose và compose.yaml

- **Docker Compose** là công cụ định nghĩa và chạy ứng dụng gồm nhiều container, dựa trên một file cấu hình YAML.
- Ví dụ trong dự án: `compose.yaml` của Club khai báo frontend, backend, Postgres, volume và network.

::: details Ghi chú cho mentor
- File `compose.yaml` mô tả các thành phần của hệ thống; một lệnh `docker compose up` tạo mọi thành phần đó theo mô tả.
- Compose mô tả trạng thái mong muốn, rồi tạo hoặc cập nhật container, network, volume cho khớp.
- Tên project mặc định lấy theo thư mục chứa `compose.yaml` (ở đây là `club`).
:::

---

## Compose khai báo một lần, cả hệ thống được dựng

![compose.yaml được docker compose biến thành network, volume và 3 container](/slides/img/s13-compose-flow.svg)

::: details Ghi chú cho mentor
- Compose mô tả trạng thái mong muốn, rồi tạo hoặc cập nhật container, network, volume cho khớp.
- Tên project mặc định lấy theo thư mục chứa `compose.yaml` (ở đây là `club`).
:::

---

## Khái niệm: Service

- **Service** là một thành phần của ứng dụng trong `compose.yaml`, được định nghĩa bởi image hoặc cách build, cùng cấu hình chạy.
- Ví dụ trong dự án: Club có ba service là `frontend`, `backend` và `postgres`.

::: details Ghi chú cho mentor
- Mỗi service tạo ra một hoặc nhiều container, và có tên riêng để các service khác tham chiếu.
- Lệnh `docker compose logs backend` dùng tên service.
- Phân biệt: service là khai báo trong YAML, container là thể hiện đang chạy của service.
- Tên container có dạng `club-backend-1`: tiền tố là tên project, tiếp theo là tên service và số thứ tự.
:::

---

## Bước 1 (10 phút): Dọn container của ngày trước

Cổng 8080 và 3000 có thể còn bị container cũ chiếm.

```bash
cd ~/devops-labs/club
docker compose version
docker ps -a
docker rm -f <tên-container-cũ>
```

**Kiểm tra:** kết quả đúng khi `docker ps` không còn container nào publish `8080` hoặc `3000`.

::: details Ghi chú cho mentor
- Chỉ chạy `docker rm -f` nếu còn container cũ; thay `<tên-container-cũ>` bằng tên thật.
- Kết quả mong đợi: `Docker Compose version v2.x`. Lỗi phổ biến nhất trong ngày: cổng 8080 còn bị container Ngày 4 giữ.
:::

---

## Khái niệm: Network và phân giải tên service

- **Docker network** là mạng ảo cho phép các container liên lạc với nhau; Compose tạo một network mặc định cho mỗi project.
- Ví dụ trong dự án: backend gọi Postgres bằng tên service `postgres`, không dùng `localhost`.
::: details Ghi chú cho mentor
- Trong network này, DNS nội bộ của Docker phân giải tên service thành địa chỉ IP của container tương ứng.
- Bên trong một container, `localhost` luôn trỏ về chính container đó, không trỏ về container khác.
- Trong network của project, các service gọi nhau bằng tên: backend gọi `postgres:5432`, nginx gọi `backend:3000`.
- Vì vậy `DB_HOST` có giá trị `postgres`, không phải `localhost`.
:::

---

## Bước 2 (10 phút): Trong container, localhost là chính nó

![DB_HOST localhost trỏ về chính backend, DB_HOST postgres được DNS đổi thành IP](/slides/img/s13-dns.svg)

Trong `compose.yaml`, backend có `DB_HOST: postgres`, nghĩa là gọi Postgres bằng tên service.

::: details Ghi chú cho mentor
- Trong network của project, các service gọi nhau bằng tên: backend gọi `postgres:5432`, nginx gọi `backend:3000`.
- Vì vậy `DB_HOST: postgres`, không phải `localhost`.
:::

---

## Khái niệm: Healthcheck

- **Healthcheck** là lệnh mà Docker chạy định kỳ bên trong container để xác định ứng dụng có hoạt động đúng hay không.
- Ví dụ trong dự án: Postgres dùng `pg_isready -U club -d clubdb` để báo đã nhận kết nối.

::: details Ghi chú cho mentor
- Kết quả được thể hiện bằng trạng thái `starting`, `healthy` hoặc `unhealthy`; container đang chạy chưa chắc đã `healthy`.
- Trạng thái `Up` chỉ cho biết tiến trình đang chạy; `(healthy)` cho biết healthcheck đã thành công.
- Postgres cần thời gian khởi tạo và chạy `init.sql` trước khi nhận kết nối.
:::

---

## Khái niệm: depends_on

- **`depends_on`** là khóa trong `compose.yaml` khai báo rằng một service phụ thuộc vào service khác khi khởi động.
- Ví dụ trong dự án: `backend` chỉ khởi động sau khi `postgres` đạt trạng thái `healthy`.

::: details Ghi chú cho mentor
- Mặc định, nó chỉ bảo đảm thứ tự khởi động; với `condition: service_healthy`, service phụ thuộc chờ đến khi healthcheck báo `healthy`.
- `depends_on` mặc định chỉ đảm bảo thứ tự start. `condition: service_healthy` chờ healthcheck báo healthy.
- Điều kiện này cần service được phụ thuộc có khai báo `healthcheck`.
:::

---

## Bước 2: Đọc compose.yaml, chờ Postgres thật sự sẵn sàng

```bash
cat compose.yaml
```

Tìm đoạn sau trong `backend` và `postgres`:

```yaml
    depends_on:
      postgres:
        condition: service_healthy
# ... và trong postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U club -d clubdb"]
```

**Kiểm tra:** kết quả đúng khi chỉ ra được dòng `service_healthy` và dòng `DB_HOST: postgres`.

::: details Ghi chú cho mentor
- Người học chỉ cần hiểu, không cần viết lại. Cũng tìm: `frontend` publish `${WEB_PORT:-8080}:80` (để trống thì dùng 8080), volume `postgres-data` gắn vào `/var/lib/postgresql/data`, `frontend` chờ `backend` healthy.
- Postgres không publish cổng ra máy: cách này làm giảm bề mặt tấn công.
:::

---

## depends_on mặc định chưa bảo đảm sẵn sàng

![Postgres còn chạy init.sql, backend mặc định start ngay và lỗi; với service_healthy thì chờ](/slides/img/s13-depends.svg)

::: details Ghi chú cho mentor
- `depends_on` mặc định chỉ đảm bảo thứ tự start. `condition: service_healthy` chờ healthcheck báo healthy.
- Postgres ở trạng thái đang chạy vẫn chưa nhận kết nối vì còn khởi tạo và chạy `init.sql`.
- Ví dụ so sánh: một cửa hàng đã mở cửa nhưng bếp chưa sẵn sàng phục vụ.
:::

---

## Khái niệm: Biến môi trường và file .env

- **Biến môi trường** (environment variable) là cặp tên và giá trị dùng để cấu hình ứng dụng mà không sửa mã nguồn.
- Ví dụ trong dự án: `DB_PASSWORD` nằm trong `.env`; Git chỉ lưu mẫu `.env.example`.

::: details Ghi chú cho mentor
- File `.env` đặt cạnh `compose.yaml`; Compose đọc file này để thay thế các biến dạng `${...}` trong `compose.yaml`.
- Nhờ vậy mật khẩu không bị commit.
- `.env` phải nằm trong `.gitignore`; chỉ commit `.env.example`.
- Biến môi trường cũng đã được dùng ở Ngày 7 qua cờ `-e POSTGRES_PASSWORD=...`.
:::

---

## Bước 3 (15 phút): Mật khẩu nằm ở .env, không nằm trong Git

![Chỉ commit .env.example; thiếu .env thì Compose dừng và in thông báo](/slides/img/s13-env.svg)

::: details Ghi chú cho mentor
- Compose tự đọc `.env` cạnh `compose.yaml` để thay các biến `${...}`.
- `${DB_PASSWORD:?Set DB_PASSWORD in .env}`: biến bắt buộc phải có; nếu thiếu, Compose dừng và in thông báo sau dấu `?`.
- `.env` phải nằm trong `.gitignore`; chỉ commit `.env.example`.
:::

---

## Bước 3: Chạy khi thiếu .env để thấy Compose từ chối

```bash
docker compose up -d
```

```text
required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env
```

**Kiểm tra:** kết quả đúng khi xuất hiện thông báo lỗi trên và chưa có container nào chạy.

::: details Ghi chú cho mentor
- Thông báo lỗi do chính file YAML định nghĩa sau dấu `?`.
:::

---

## Bước 3: Tạo .env từ mẫu

```bash
cp .env.example .env
nano .env
git check-ignore -v .env
docker compose config | head -30
```

Đổi `DB_PASSWORD` thành một chuỗi giả. Nếu cổng 8080 đang bận, đặt `WEB_PORT=8081`.

**Kiểm tra:** kết quả đúng khi `git check-ignore -v .env` in một dòng và `config` không báo lỗi.

::: details Ghi chú cho mentor
- `.env` là file ẩn, dùng `ls -a` để hiển thị. Không dùng mật khẩu thật của bất kỳ dịch vụ nào.
- Nếu `check-ignore` không in gì, thêm dòng `.env` vào `.gitignore` trước khi làm tiếp.
- `config` in YAML với `DB_PASSWORD` đã được thay giá trị.
:::

---

## Bước 4 (20 phút): Chạy cả Club bằng một lệnh

```bash
docker compose up -d --build
docker compose ps
```

```text
club-postgres-1   Up (healthy)   5432/tcp
club-backend-1    Up (healthy)   127.0.0.1:3000->3000/tcp
club-frontend-1   Up             0.0.0.0:8080->80/tcp
```

**Kiểm tra:** kết quả đúng khi postgres ghi `(healthy)`, backend và frontend ở trạng thái `Up` (output rút gọn).

::: details Ghi chú cho mentor
- Lần đầu mất 1-3 phút để build và tải image. Nếu Postgres chưa `healthy`: đợi 10-15 giây rồi chạy lại `ps`.
- Dùng tên service (`backend`) trong lệnh, không dùng tên container. Postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ.
- Khi gặp lỗi: dùng lần lượt `ps`, `logs`, `config` và `exec`.
:::

---

## Bước 4: Đọc log để biết hệ thống đang làm gì

```bash
docker compose logs --tail=20 postgres
docker compose logs --tail=20 backend
```

Log của postgres có `running /docker-entrypoint-initdb.d/init.sql`; log của backend có `API listening on port 3000`.

**Kiểm tra:** kết quả đúng khi thấy cả hai dòng trên.

::: details Ghi chú cho mentor
- Tiền tố tên container `club-` lấy theo tên thư mục.
:::

---

## Bước 5 (15 phút): Kiểm thử qua mạng

```bash
curl -s http://localhost:8080/api/members
curl -s http://localhost:3000/health
docker compose exec frontend wget -qO- http://backend:3000/health
docker compose exec postgres psql -U club -d clubdb -c "SELECT id, name FROM members;"
```

Kết quả mong đợi: JSON có Alice và Bob, `{"status":"healthy","service":"club-api"}` hai lần, bảng 2 dòng.

**Kiểm tra:** kết quả đúng khi lệnh `exec frontend ... http://backend:3000/health` thành công. Mở `http://localhost:8080` trên trình duyệt Windows.

::: details Ghi chú cho mentor
- Lệnh `wget` thứ ba chạy trong container frontend và gọi `backend` bằng tên service: lệnh này chứng minh các container tìm thấy nhau qua tên.
- Gọi API qua nginx (cổng 8080) và gọi trực tiếp backend (cổng 3000). Dùng `WEB_PORT` của người học nếu đã đổi.
:::

---

## Bước 6 (15 phút): down giữ dữ liệu, down -v xóa dữ liệu

![Sau down còn Carol; sau down -v mất Carol vì volume bị xóa](/slides/img/s13-volume.svg)

Nhắc lại: named volume `postgres-data` lưu dữ liệu Postgres độc lập với container.

::: details Ghi chú cho mentor
- `postgres-data` là named volume gắn vào `/var/lib/postgresql/data`. Ví dụ so sánh: `down` giống rút ổ cứng ngoài ra, còn `down -v` giống bỏ hẳn ổ đó.
- `./database/init.sql` được mount vào `/docker-entrypoint-initdb.d/` và chỉ chạy khi data directory còn trống.
:::

---

## Bước 6: Thêm Carol, `down`, rồi `up` lại

```bash
docker compose exec postgres psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
docker compose down
docker compose up -d
sleep 10
curl -s http://localhost:8080/api/members
```

**Kiểm tra:** kết quả đúng khi `/api/members` vẫn có Carol (3 phần tử).

::: details Ghi chú cho mentor
- API chưa có POST nên Carol được thêm bằng SQL.
- `down` xóa container và network nhưng giữ named volume.
:::

---

## Bước 6: `down -v` xóa cả dữ liệu

**Cảnh báo:** `docker compose down -v` xóa volume `postgres-data`. Chỉ chạy trong `~/devops-labs/club`.

```bash
docker compose down -v
docker compose up -d
sleep 15
curl -s http://localhost:8080/api/members
```

**Kiểm tra:** kết quả đúng khi chỉ còn Alice và Bob, còn Carol đã mất.

::: details Ghi chú cho mentor
- Carol mất vì volume bị xóa và `init.sql` chạy lại từ đầu. Nếu kết quả rỗng hoặc lỗi: chờ thêm vài giây rồi gọi lại.
:::

---

## Lỗi 1: thiếu biến hoặc cổng bận

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `required variable DB_PASSWORD is missing a value` | Chưa có `.env` | `cp .env.example .env`, điền `DB_PASSWORD` |
| `port is already allocated` | Cổng 8080 bị chiếm | `docker rm -f`, hoặc `WEB_PORT=8081` |

::: details Ghi chú cho mentor
- Nguyên nhân thứ nhất có thể là `.env` thiếu hoặc biến trống.
- Cách sửa thứ hai: `docker rm -f` container cũ, hoặc đặt `WEB_PORT=8081` trong `.env`.
- Cách chẩn đoán: `docker compose config` để xem biến đã được thay, `docker ps` để xem container nào giữ cổng.
:::

---

## Lỗi 2: YAML sai và backend không kết nối được DB

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `yaml: ... mapping values are not allowed` | Thụt lề sai, dùng Tab | Dùng 2 dấu cách |
| Backend `ECONNREFUSED` hoặc `ENOTFOUND` | `DB_HOST` sai | Đặt `DB_HOST: postgres` |

::: details Ghi chú cho mentor
- `docker compose config` chỉ ra dòng YAML lỗi.
- `DB_HOST` sai thường là giá trị `localhost`; lỗi kết nối xuất hiện ở backend khi tới DB.
- Nhắc lại slide về `localhost` trong container.
:::

---

## Lỗi 3: API 500 dù mọi container `Up`

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| API 500, thiếu bảng `members` | `init.sql` không chạy lại | `down -v` rồi `up -d` |
| Đổi `DB_PASSWORD`, API 500 | Volume giữ mật khẩu cũ | Trả mật khẩu cũ, hoặc `ALTER USER` |

::: details Ghi chú cho mentor
- Volume cũ đã có dữ liệu nên `init.sql` không chạy lại.
- Triệu chứng đầy đủ: `/api/members` trả 500; sau khi đổi `DB_PASSWORD` thì API trả 500.
- Lệnh đầy đủ: `docker compose down -v` rồi `up -d`.
- `POSTGRES_PASSWORD` chỉ dùng lúc khởi tạo, nên volume giữ mật khẩu cũ.
- Cả hai lỗi đều do dữ liệu cũ trong volume. Lệnh `down -v` chỉ dùng khi chấp nhận mất dữ liệu.
:::

---

## Tự kiểm tra

1. Vì sao backend dùng `DB_HOST: postgres` mà không phải `localhost`?
2. `depends_on` với `condition: service_healthy` khác gì `depends_on` mặc định?
3. `docker compose down` và `down -v` khác nhau thế nào?

::: details Ghi chú cho mentor
1. `localhost` trong container backend là chính backend. DNS của network Compose phân giải tên service `postgres` thành IP của container Postgres.
2. Mặc định chỉ đảm bảo Postgres được start trước. `service_healthy` chờ healthcheck báo healthy, tức Postgres thật sự nhận kết nối.
3. `down` xóa container và network, giữ volume nên dữ liệu còn. `down -v` xóa cả volume nên dữ liệu mất.
:::

---

## Tiếp theo

![Ba điều cần nhớ: một file, gọi bằng tên, volume giữ dữ liệu](/slides/img/s13-recap.svg)

Ngày 9: [GitHub Actions CI](../04-cicd/session-16.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Compose file reference](https://docs.docker.com/reference/compose-file/): tra cứu mọi khóa trong compose.yaml.
- **Tài liệu chính thức:** [Compose services](https://docs.docker.com/reference/compose-file/services/): cách khai báo service, port, volume.
- **Best practice:** [Environment variables best practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/): quản lý biến môi trường và file .env an toàn.
- **Best practice:** [The Twelve-Factor App: Config](https://12factor.net/config): để cấu hình trong môi trường, không trong code.
- **Best practice:** [Use secrets in Compose](https://docs.docker.com/compose/how-tos/use-secrets/): không để mật khẩu nằm trong file.
