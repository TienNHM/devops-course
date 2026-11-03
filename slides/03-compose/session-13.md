# Slide Ngày 08 – Docker Compose chạy cả Club

> **Tóm tắt:** Một lệnh `docker compose up -d --build` chạy cả Club (frontend, backend, Postgres) với healthcheck, `depends_on: service_healthy`, dữ liệu bền và mật khẩu nằm trong `.env`.

Bài học đầy đủ: [Ngày 8 – Docker Compose chạy cả Club](../../labs/week-07/session-13.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: một lệnh, gọi theo tên, giữ dữ liệu](/slides/img/s13-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Việc chính: cả Club chạy bằng một lệnh, có healthcheck, dữ liệu bền, mật khẩu trong `.env`.
- Hỏi: ai từng quên một cờ `-e` khi chạy `docker run`?
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

Dùng `docker compose` (có dấu cách), không dùng `docker-compose` bản v1.

::: details Ghi chú cho mentor
- Compose mô tả trạng thái mong muốn, rồi tạo hoặc cập nhật container, network, volume cho khớp.
- Tên project mặc định lấy theo thư mục chứa `compose.yaml` (ở đây là `club`).
:::

---

## Slide 4: Đọc compose.yaml: ba khóa quan trọng

```yaml
services:
  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
    depends_on:
      postgres:
        condition: service_healthy
```

`services` liệt kê thành phần; `build`, `environment`, `depends_on` mô tả từng thành phần (rút gọn).

::: details Ghi chú cho mentor
- Cho học viên mở `club/compose.yaml` thật để đối chiếu: có thêm `ports`, `networks`, `volumes`, `healthcheck`, `restart`.
- `ports` viết `HOST:CONTAINER`. Postgres không publish cổng ra máy: giảm bề mặt tấn công.
:::

---

## Slide 5: Trong container, localhost là chính nó

![DB_HOST localhost trỏ về chính backend, DB_HOST postgres được DNS đổi thành IP](/slides/img/s13-dns.svg)

::: details Ghi chú cho mentor
- Trong network của project, gọi nhau bằng tên service: backend gọi `postgres:5432`, nginx gọi `backend:3000`.
- Vì vậy `DB_HOST: postgres`, không phải `localhost`.
:::

---

## Slide 6: depends_on chưa có nghĩa là sẵn sàng

![Postgres còn chạy init.sql, backend mặc định start ngay và lỗi; với service_healthy thì chờ](/slides/img/s13-depends.svg)

::: details Ghi chú cho mentor
- `depends_on` mặc định chỉ đảm bảo thứ tự start. `condition: service_healthy` chờ healthcheck báo healthy.
- Postgres "đang chạy" chưa nhận kết nối vì còn khởi tạo và chạy `init.sql`.
- Ví von: nhà hàng đã mở cửa nhưng bếp chưa nhóm lửa.
:::

---

## Slide 7: Bí mật nằm ở .env, không nằm trong Git

![Chỉ commit .env.example; thiếu .env thì Compose dừng và in thông báo](/slides/img/s13-env.svg)

::: details Ghi chú cho mentor
- Compose tự đọc `.env` cạnh `compose.yaml` để thay các biến `${...}`.
- `${WEB_PORT:-8080}`: trống thì dùng 8080. `${DB_PASSWORD:?Set DB_PASSWORD in .env}`: bắt buộc có, thiếu thì dừng và in thông báo sau dấu `?`.
- `.env` phải nằm trong `.gitignore`; chỉ commit `.env.example`.
:::

---

## Slide 8: Demo: từ thiếu .env tới hệ thống chạy

```text
$ docker compose up -d
required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env
$ cp .env.example .env
$ docker compose up -d --build
$ docker compose ps
postgres   Up (healthy)    5432/tcp
backend    Up (healthy)    127.0.0.1:3000->3000/tcp
frontend   Up              0.0.0.0:8080->80/tcp
```

Đúng khi: postgres `(healthy)`, backend và frontend `Up`; output rút gọn.

::: details Ghi chú cho mentor
- Thông báo lỗi do chính file YAML định nghĩa sau dấu `?`.
- Postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ.
- Gọi API qua nginx (cổng 8080) và gọi thẳng backend (cổng 3000).
- Khi lỗi: `ps`, rồi `logs`, rồi `config` và `exec`.
:::

---

## Slide 9: down giữ dữ liệu, down -v xóa dữ liệu

![Sau down còn Carol; sau down -v mất Carol vì volume bị xóa](/slides/img/s13-volume.svg)

::: details Ghi chú cho mentor
- `postgres-data` là named volume gắn vào `/var/lib/postgresql/data`. Ví von: ổ cứng ngoài, `down` rút ổ ra, `down -v` vứt luôn ổ.
- `./database/init.sql` được mount vào `/docker-entrypoint-initdb.d/` và chỉ chạy khi data directory còn trống.
- `down -v` chỉ chạy trong thư mục lab, vì nó xóa dữ liệu thật.
:::

---

## Slide 10: Lab: các bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Dọn container cũ, đọc `compose.yaml` | Cổng 8080 và 3000 rảnh |
| 3-4 | `.env`, `config`, `up -d --build` | postgres `healthy` |
| 5 | Kiểm thử qua mạng, gọi theo tên | `/api/members` trả JSON |
| 6 | `down` so với `down -v` | Carol còn, rồi mất |

Lệnh và kết quả mong đợi: [Ngày 8 – Docker Compose chạy cả Club](../../labs/week-07/session-13.md).

::: details Ghi chú cho mentor
- Gặp lỗi: bảng "Gặp lỗi?" trong bài lab. Lỗi hay gặp nhất: cổng 8080 còn bị container Ngày 4 giữ.
- Thử thách thêm ở nhà: [Thử thách thêm](../../labs/week-07/session-13-challenge.md).
:::

---

## Slide 11: Recap

![Ba điều cần nhớ: một file, gọi bằng tên, volume giữ dữ liệu](/slides/img/s13-recap.svg)

Ngày tiếp theo: [Ngày 9 – GitHub Actions CI](../04-cicd/session-16.md).

---

## Slide 12: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Compose file reference](https://docs.docker.com/reference/compose-file/): tra cứu mọi khóa trong compose.yaml.
- **Tài liệu chính thức:** [Compose services](https://docs.docker.com/reference/compose-file/services/): cách khai báo service, port, volume.
- **Best practice:** [Environment variables best practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/): quản lý biến môi trường và file .env an toàn.
- **Best practice:** [The Twelve-Factor App: Config](https://12factor.net/config): để cấu hình trong môi trường, không trong code.
- **Best practice:** [Use secrets in Compose](https://docs.docker.com/compose/how-tos/use-secrets/): không để mật khẩu nằm trong file.
