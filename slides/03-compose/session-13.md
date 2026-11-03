# Slide buổi 13 – Docker Compose

> **Tóm tắt:** Dùng Docker Compose để mô tả và chạy cả Frontend, API và PostgreSQL của starter-project bằng một file `compose.yaml` và một lệnh duy nhất.

Bài học đầy đủ: [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: một lệnh, gọi theo tên, giữ dữ liệu](/slides/img/s13-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Mục tiêu đầy đủ: đọc được các khóa chính của `compose.yaml`, phân biệt `depends_on` mặc định với `service_healthy`, đặt secret trong `.env` không commit.
- Hỏi: ai từng quên một cờ `-e` khi chạy `docker run`?
:::

---

## Slide 2: Chuỗi lệnh docker run quá dễ sai

![Trước: nhiều lệnh docker run; sau: một file compose.yaml và một lệnh](/slides/img/s13-pain.svg)

::: details Ghi chú cho mentor
- Cả hệ thống = tạo network, tạo volume, chạy postgres, chạy backend, chạy frontend.
- Lệnh nằm trong history của một người, không ai review được; thành viên mới phải chép lại cả chục dòng.
- Các lệnh trong hình là rút gọn để minh họa.
:::

---

## Slide 3: Compose: khai báo một lần, cả hệ thống tự dựng

![compose.yaml được docker compose biến thành network, volume và 3 container](/slides/img/s13-compose-flow.svg)

Dùng `docker compose` (có dấu cách), không dùng `docker-compose` bản v1.

::: details Ghi chú cho mentor
- Compose là công cụ khai báo (declarative): mô tả trạng thái mong muốn, Compose tạo hoặc cập nhật container, network, volume cho khớp.
- Tên project mặc định lấy theo thư mục chứa `compose.yaml`.
- Ví von: công thức nấu ăn, ai làm theo cũng ra đúng món.
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
- Các khóa chính: `services`, `build` / `image`, `ports` (`HOST:CONTAINER`), `environment`, `depends_on`, `networks`, `volumes`, `healthcheck`, `restart`.
- File thật của starter-project dài hơn; cho học viên mở `starter-project/compose.yaml` để đối chiếu.
:::

---

## Slide 5: Kiến trúc starter-project trong Compose

![Trình duyệt vào frontend nginx, tới backend Node, tới postgres; postgres có volume và không publish cổng](/slides/img/s13-architecture.svg)

::: details Ghi chú cho mentor
- Ba service, một network `club-network`, một volume `postgres-data`.
- Postgres không publish cổng ra máy: giảm bề mặt tấn công, backend vẫn nối được qua network nội bộ.
- Backend publish `127.0.0.1:3000` chỉ để kiểm thử trên máy cá nhân.
:::

---

## Slide 6: Trong container, localhost là chính nó

![DB_HOST localhost trỏ về chính backend, DB_HOST postgres được DNS đổi thành IP](/slides/img/s13-dns.svg)

::: details Ghi chú cho mentor
- Trong network của project, gọi nhau bằng tên service: backend gọi `postgres:5432`, nginx gọi `backend:3000`.
- Vì vậy `DB_HOST: postgres`, không phải `localhost`.
- Ví von: danh bạ nội bộ, gọi theo tên chứ không cần nhớ số.
:::

---

## Slide 7: depends_on chưa có nghĩa là sẵn sàng

![Postgres còn chạy init.sql, backend mặc định start ngay và lỗi; với service_healthy thì chờ](/slides/img/s13-depends.svg)

::: details Ghi chú cho mentor
- `depends_on: [backend]` và `condition: service_started` chỉ đảm bảo container được start trước. `condition: service_healthy` chờ healthcheck báo healthy.
- Postgres "đang chạy" chưa nhận kết nối vì còn khởi tạo cluster và chạy `init.sql`.
- Ví von: nhà hàng đã mở cửa nhưng bếp chưa nhóm lửa.
:::

---

## Slide 8: Bí mật nằm ở .env, không nằm trong Git

![Chỉ commit .env.example; thiếu .env thì Compose dừng và in thông báo](/slides/img/s13-env.svg)

::: details Ghi chú cho mentor
- Compose tự đọc `.env` cạnh `compose.yaml` để thay các biến `${...}`.
- `${WEB_PORT:-8080}`: dùng `WEB_PORT`, trống thì dùng 8080. `${DB_PASSWORD:?Set DB_PASSWORD in .env}`: bắt buộc có, thiếu thì dừng và in thông báo sau dấu `?`.
- `.env` chứa mật khẩu, phải nằm trong `.gitignore`; chỉ commit `.env.example`.
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

## Slide 10: Bốn lệnh vòng đời hay dùng

| Lệnh (đi sau `docker compose`) | Tác dụng |
| --- | --- |
| `up -d --build` | Build, tạo, chạy ở nền |
| `ps` và `logs -f backend` | Xem trạng thái, theo dõi log |
| `exec backend sh` | Vào container |
| `down` và `down -v` | Xóa container, network; `-v` xóa luôn volume |

::: details Ghi chú cho mentor
- Thêm `docker compose config`: in cấu hình sau khi thay biến, là bước đầu tiên khi nghi ngờ Compose "không nhận biến".
- Khi lỗi: `ps`, rồi `logs`, rồi `config` và `exec`.
:::

---

## Slide 11: Demo: từ thiếu .env tới hệ thống chạy

```text
$ docker compose up -d
required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env
$ cp .env.example .env
$ docker compose up -d --build
$ docker compose ps
postgres   Up (healthy)    5432/tcp
backend    Up              127.0.0.1:3000->3000/tcp
frontend   Up              0.0.0.0:8080->80/tcp
```

Đúng khi: postgres `(healthy)`, backend và frontend `Up`; output rút gọn.

::: details Ghi chú cho mentor
- Thông báo lỗi do chính file YAML định nghĩa sau dấu `?`.
- Postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ.
- Gọi API qua nginx (cổng 8080) và gọi thẳng backend (cổng 3000).
:::

---

## Slide 12: Lab và thử thách

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 và 2 | `.env`, `config`, `up -d --build` | postgres `healthy` |
| 3 | Kiểm thử qua mạng, gọi theo tên | `/api/members` trả JSON |
| 4 | `down` so với `down -v` | Carol còn, rồi mất |

Lệnh và kết quả mong đợi: [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md).

::: details Ghi chú cho mentor
- Gặp lỗi: bảng "Gặp lỗi?" trong bài lab.
- Thử thách L2 ở nhà: viết `compose.mine.yaml` từ đầu; đổi `WEB_PORT` không sửa `compose.yaml`; quan sát restart policy ([thử thách buổi 13](../../labs/week-07/session-13-challenge.md)).
:::

---

## Slide 13: Break và Debug: đổi mật khẩu trong .env

![Backend gửi mật khẩu mới, postgres giữ mật khẩu cũ trong volume, API trả 500](/slides/img/s13-break-password.svg)

::: details Ghi chú cho mentor
- Triệu chứng: mọi container `Up`, postgres `healthy`, nhưng API trả `500`.
- Điều tra theo thứ tự: `ps`, log backend, log postgres, so sánh hai phía.
- Nguyên nhân gốc: `POSTGRES_PASSWORD` chỉ dùng khi khởi tạo data directory; volume giữ mật khẩu cũ.
- Cách sửa: trả lại mật khẩu cũ, hoặc `ALTER USER` trong database.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: một file, gọi bằng tên, volume giữ dữ liệu](/slides/img/s13-recap.svg)

Buổi tiếp theo: [Buổi 14 – Production-minded Compose](session-14.md).
