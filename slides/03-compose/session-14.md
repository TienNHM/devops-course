# Slide buổi 14 – Production-minded Compose

> **Tóm tắt:** Nâng `compose.yaml` từ mức chạy được lên mức đáng tin cậy: healthcheck, thứ tự khởi động, restart, giới hạn tài nguyên, secrets, logging, backup và restore.

Bài học đầy đủ: [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: healthcheck, tự hồi phục, Break và Debug](/slides/img/s14-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích vì sao `depends_on` thường chưa đủ; viết healthcheck với `interval`, `timeout`, `retries`, `start_period`; chọn restart policy; phân biệt `/health` với `/ready`; điều tra healthcheck bị đặt sai.
:::

---

## Slide 2: Một buổi demo hỏng

![Ba sự cố: lỗi 500 lúc khởi động, API chết không tự dậy, log chiếm hàng GB](/slides/img/s14-bad-demo.svg)

::: details Ghi chú cho mentor
- Kể: chạy `up -d`, mở trình duyệt ngay thì lỗi 500, chạy lại lần hai thì được.
- Máy khởi động lại, container API chết; vài tuần sau, log chiếm hàng GB.
- Không lỗi nào nằm ở code: chúng nằm ở cách vận hành.
:::

---

## Slide 3: Started khác ready

![Container Up chỉ cho biết PID 1 chạy; healthcheck cho ra starting, healthy hoặc unhealthy](/slides/img/s14-started-ready.svg)

::: details Ghi chú cho mentor
- Docker chỉ biết tiến trình chính (PID 1) có đang chạy không.
- Healthcheck: lệnh chạy định kỳ trong container, exit 0 là healthy, 1 là unhealthy. Ba trạng thái: `starting`, `healthy`, `unhealthy`.
- Đây là nền tảng của liveness và readiness probe ở Kubernetes.
:::

---

## Slide 4: Các tham số của healthcheck

![Dòng thời gian: start_period, interval, retries và timeout](/slides/img/s14-hc-params.svg)

::: details Ghi chú cho mentor
- `test`: lệnh kiểm tra, dạng `CMD` hoặc `CMD-SHELL`. `interval` gợi ý 5s đến 10s. `timeout` gợi ý 3s. `retries` gợi ý 3 đến 5. `start_period` gợi ý 10s đến 30s.
- Lỗi trong `start_period` chưa tính vào `retries`.
:::

---

## Slide 5: depends_on với condition

| Cú pháp | Compose chờ điều gì |
| --- | --- |
| `depends_on: [postgres]` | Container được tạo, không chờ ready |
| `condition: service_healthy` | Healthcheck đã `healthy` |
| `condition: service_completed_successfully` | Job một lần thoát với exit 0 |

::: details Ghi chú cho mentor
- `depends_on` chỉ tác động lúc `docker compose up`.
- Postgres restart giữa chừng thì Compose không restart API; ứng dụng vẫn phải chịu được mất kết nối tạm thời.
:::

---

## Slide 6: Chuỗi khởi động: mỗi bước chờ bước trước

![Postgres healthy rồi tới backend, backend healthy rồi tới frontend](/slides/img/s14-startup-chain.svg)

::: details Ghi chú cho mentor
- Compose start postgres, chạy `pg_isready` mỗi 5s; khi healthy mới start backend; backend gọi `/health` mỗi 10s; khi healthy mới start frontend.
- `pg_isready` có thể báo sẵn sàng sớm ở bước khởi tạo, nên sau `down -v` hãy chờ vài giây trước khi truy vấn.
:::

---

## Slide 7: Restart policy chỉ phản ứng khi tiến trình thoát

![Thoát bất thường thì được dựng lại, stop thì nằm yên, unhealthy thì không restart](/slides/img/s14-restart.svg)

::: details Ghi chú cho mentor
- Policy: `no` (mặc định), `on-failure` (exit code khác 0), `always` (kể cả sau khi daemon khởi động lại), `unless-stopped` (như `always`, trừ khi bạn chủ động dừng).
- Docker 29.x coi `kill` do người dùng gõ là dừng thủ công; dùng thoát bất thường thật (dừng postgres khi pool có kết nối nhàn rỗi) để kiểm chứng.
:::

---

## Slide 8: Demo: sống khác sẵn sàng

```text
$ docker compose stop postgres
$ curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/health
200
$ curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/ready
503
$ docker compose start postgres      # chờ healthy: /ready lại 200
```

`/health` là còn sống; `/ready` là sẵn sàng phục vụ.

::: details Ghi chú cho mentor
- `/ready` trả `503` với `{"status":"not-ready"}` khi DB dừng.
- Nếu pool đang giữ kết nối nhàn rỗi, backend có thể crash và được dựng lại ngay; gọi lại sau vài giây.
- Thêm: terminal thứ hai chạy `watch docker compose ps` để quan sát khoảng chờ khi `up -d`.
:::

---

## Slide 9: Viết healthcheck cho backend

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1"]
  interval: 10s
  timeout: 3s
  retries: 3
  start_period: 10s
```

Dùng `127.0.0.1`, không dùng `localhost`; chạy `docker compose config --quiet` trước `up`.

::: details Ghi chú cho mentor
- Image `node:22-alpine` và `nginx:alpine` đều có `wget` của BusyBox.
- `localhost` có thể phân giải sang IPv6 trong khi ứng dụng chỉ nghe IPv4.
- Frontend dùng `depends_on` với `condition: service_healthy` tới backend. Cấu hình cụ thể: Phần 2 của bài lab.
:::

---

## Slide 10: Giới hạn tài nguyên và log rotation (L2)

![Vượt memory bị OOM kill exit 137; log xoay vòng 3 file 10 MB](/slides/img/s14-limits-logs.svg)

::: details Ghi chú cho mentor
- Không đặt giới hạn thì một container rò bộ nhớ có thể kéo sập cả WSL2.
- Vượt CPU: bị làm chậm. Vượt memory: bị OOM kill, exit code 137.
- Tin vào `docker inspect`, không tin vào file YAML.
:::

---

## Slide 11: Secrets và backup (L2)

![pg_dump ra backup.sql rồi restore vào database mới; volume không phải backup](/slides/img/s14-backup.svg)

::: details Ghi chú cho mentor
- Mật khẩu ghi cứng trong YAML là không chấp nhận được; `.env` đủ cho lab; secret dạng file an toàn hơn.
- Image postgres hỗ trợ `POSTGRES_PASSWORD_FILE`; ứng dụng phải biết đọc file.
- `pg_dump` ra file SQL, dùng `exec -T` khi chuyển hướng; restore thử vào database mới.
:::

---

## Slide 12: Break và Debug: healthcheck quá ngặt

![Healthcheck sai đường dẫn và retries 1 làm backend unhealthy, frontend không được tạo](/slides/img/s14-break-hc.svg)

::: details Ghi chú cho mentor
- Cấu hình sai: đường dẫn kiểm tra sai (`/healthz`), `retries: 1`, không có `start_period`.
- Triệu chứng: backend `(unhealthy)`, frontend không được tạo, `up` báo `dependency failed to start`.
- Điều tra: đọc `.State.Health.Log` bằng `docker inspect`, chạy tay lệnh check trong container.
- Phòng tránh: chạy tay lệnh check trước khi đưa vào YAML; `timeout` lớn hơn thời gian phản hồi vài lần.
:::

---

## Slide 13: Lab và thử thách

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 và 2 | Healthcheck postgres, backend, frontend | Cả ba `(healthy)` |
| 3 | Restart, `/health`, `/ready` | `RestartCount` tăng; 200 rồi 503 |
| 4 | Break, rồi Debug | Tìm ra mã 404 trong Health Log |

Lệnh và kết quả mong đợi: [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md).

::: details Ghi chú cho mentor
- Thử thách L2 ở nhà: giới hạn tài nguyên, secrets, backup và restore, bốn thử thách ([thử thách buổi 14](../../labs/week-07/session-14-challenge.md)).
- Câu hỏi thảo luận: Postgres restart giữa chừng thì frontend và backend có bị khởi động lại không? Vì sao `unhealthy` không tự được restart?
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: chạy khác sẵn sàng, tự dựng lại khi thoát, vận hành an toàn](/slides/img/s14-recap.svg)

Buổi tiếp theo: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Control startup order](https://docs.docker.com/compose/how-tos/startup-order/): started khác ready và cách chờ dịch vụ.
- **Tài liệu chính thức:** [Compose services](https://docs.docker.com/reference/compose-file/services/): cấu hình healthcheck, depends_on, restart.
- **Best practice:** [Use Compose in production](https://docs.docker.com/compose/how-tos/production/): khác biệt khi chạy Compose thật.
- **Best practice:** [The Twelve-Factor App: Disposability](https://12factor.net/disposability): khởi động nhanh, tắt êm, dễ thay thế.
