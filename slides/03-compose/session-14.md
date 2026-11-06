# Slide buổi 14 – Production-minded Compose

> **Tóm tắt:** Buổi học nâng `compose.yaml` từ mức chạy được lên mức đáng tin cậy bằng healthcheck, thứ tự khởi động, restart policy, giới hạn tài nguyên, secrets, logging, backup và restore.

Bài học đầy đủ: [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md).

## Mục tiêu của buổi học

![Ba mục tiêu: healthcheck, tự hồi phục, Break và Debug](/slides/img/s14-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích vì sao `depends_on` thường chưa đủ; viết healthcheck với `interval`, `timeout`, `retries`, `start_period`; chọn restart policy; phân biệt `/health` với `/ready`; điều tra healthcheck bị đặt sai.
:::

---

## Một buổi demo thất bại

![Ba sự cố: lỗi 500 lúc khởi động, API chết không tự dậy, log chiếm hàng GB](/slides/img/s14-bad-demo.svg)

::: details Ghi chú cho mentor
- Tình huống: chạy `up -d` rồi mở trình duyệt ngay thì gặp lỗi 500, chạy lại lần hai thì được.
- Khi máy khởi động lại, container API dừng; vài tuần sau, log chiếm hàng GB.
- Không lỗi nào nằm ở mã nguồn: nguyên nhân nằm ở cách vận hành.
:::

---

## Khái niệm: Healthcheck

![Container Up chỉ cho biết PID 1 chạy; healthcheck cho ra starting, healthy hoặc unhealthy](/slides/img/s14-started-ready.svg)

- **Healthcheck** là lệnh Docker chạy định kỳ bên trong container để xác định ứng dụng có hoạt động đúng hay không.
- Ví dụ trong dự án: backend được kiểm tra bằng cách gọi `/health`; exit code 0 là `healthy`.

::: details Ghi chú cho mentor
- Nếu không có healthcheck, Docker chỉ biết tiến trình chính (PID 1) còn chạy hay không. Với healthcheck, container có ba trạng thái: `starting`, `healthy`, `unhealthy`.
- Exit code 1 là `unhealthy`.
- Đây là nền tảng của liveness và readiness probe ở Kubernetes.
:::

---

## Các tham số của healthcheck

![Dòng thời gian: start_period, interval, retries và timeout](/slides/img/s14-hc-params.svg)

::: details Ghi chú cho mentor
- `test`: lệnh kiểm tra, dạng `CMD` hoặc `CMD-SHELL`. `interval` gợi ý 5s đến 10s. `timeout` gợi ý 3s. `retries` gợi ý 3 đến 5. `start_period` gợi ý 10s đến 30s.
- Lỗi xảy ra trong `start_period` chưa được tính vào `retries`.
:::

---

## Khái niệm: depends_on và condition

- **`depends_on`** khai báo thứ tự khởi động giữa các service; `condition` quy định Compose chờ đến trạng thái nào của service được phụ thuộc.
- Ví dụ trong dự án: backend dùng `condition: service_healthy` để chờ Postgres `healthy`.

::: details Ghi chú cho mentor
- Mặc định, Compose chỉ chờ container được tạo, chưa chờ ứng dụng sẵn sàng; do đó `depends_on` thường chưa đủ.
:::

---

## Các giá trị của depends_on

| Cú pháp | Compose chờ điều gì |
| --- | --- |
| `depends_on: [postgres]` | Container được tạo, không chờ ready |
| `condition: service_healthy` | Healthcheck đã `healthy` |
| `condition: service_completed_successfully` | Job một lần thoát với exit 0 |

::: details Ghi chú cho mentor
- `depends_on` chỉ tác động lúc `docker compose up`.
- Khi Postgres restart giữa chừng, Compose không restart API; ứng dụng vẫn phải chịu được việc mất kết nối tạm thời.
:::

---

## Chuỗi khởi động: mỗi bước chờ bước trước

![Postgres healthy rồi tới backend, backend healthy rồi tới frontend](/slides/img/s14-startup-chain.svg)

::: details Ghi chú cho mentor
- Compose khởi động postgres và chạy `pg_isready` mỗi 5s; khi postgres `healthy` mới khởi động backend; backend gọi `/health` mỗi 10s; khi backend `healthy` mới khởi động frontend.
- `pg_isready` có thể báo sẵn sàng sớm ở bước khởi tạo, nên sau `down -v` cần chờ vài giây trước khi truy vấn.
:::

---

## Khái niệm: Restart policy

![Thoát bất thường thì được dựng lại, stop thì nằm yên, unhealthy thì không restart](/slides/img/s14-restart.svg)

- **Restart policy** là cấu hình quy định Docker có khởi động lại container hay không khi tiến trình chính thoát.
- Ví dụ trong dự án: container thoát bất thường được dựng lại; container `unhealthy` không bị restart.

::: details Ghi chú cho mentor
- Policy chỉ phản ứng với việc tiến trình thoát; container ở trạng thái `unhealthy` không bị restart.
- Các giá trị: `no` (mặc định), `on-failure` (exit code khác 0), `always` (kể cả sau khi daemon khởi động lại), `unless-stopped` (như `always`, trừ khi người dùng chủ động dừng).
- Docker 29.x coi `kill` do người dùng gõ là dừng thủ công; cần dùng một lần thoát bất thường thật (dừng postgres khi pool có kết nối nhàn rỗi) để kiểm chứng.
:::

---

## Khái niệm: Liveness và readiness

- **Liveness** cho biết ứng dụng còn sống; **readiness** cho biết ứng dụng sẵn sàng phục vụ, gồm cả các phụ thuộc như database.
- Ví dụ trong dự án: `/health` trả `200` khi API sống; `/ready` trả `503` khi PostgreSQL dừng.

::: details Ghi chú cho mentor
- Liveness là tiến trình đang chạy.
- Hai trạng thái này có thể khác nhau: ứng dụng còn sống nhưng chưa sẵn sàng khi mất kết nối database.
:::

---

## Demo: sống khác sẵn sàng

```text
$ docker compose stop postgres
$ curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/health
200
$ curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/ready
503
$ docker compose start postgres      # chờ healthy: /ready lại 200
```

`/health` cho biết ứng dụng còn sống; `/ready` cho biết ứng dụng sẵn sàng phục vụ.

::: details Ghi chú cho mentor
- `/ready` trả `503` với `{"status":"not-ready"}` khi database dừng.
- Nếu pool đang giữ kết nối nhàn rỗi, backend có thể bị crash và được dựng lại ngay; gọi lại sau vài giây.
- Mở rộng: dùng terminal thứ hai chạy `watch docker compose ps` để quan sát khoảng chờ khi `up -d`.
:::

---

## Viết healthcheck cho backend

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
- `localhost` có thể được phân giải sang IPv6 trong khi ứng dụng chỉ lắng nghe IPv4.
- Frontend dùng `depends_on` với `condition: service_healthy` tới backend. Cấu hình cụ thể nằm ở Phần 2 của bài lab.
:::

---

## Khái niệm: Giới hạn tài nguyên và log rotation (L2)

![Vượt memory bị OOM kill exit 137; log xoay vòng 3 file 10 MB](/slides/img/s14-limits-logs.svg)

- **Giới hạn tài nguyên** (CPU, memory) ngăn một container chiếm hết tài nguyên máy; **log rotation** giới hạn số lượng và cỡ tệp log.
- Ví dụ trong dự án: log xoay vòng thành 3 tệp, mỗi tệp 10 MB.

::: details Ghi chú cho mentor
- Vượt giới hạn CPU thì container bị làm chậm; vượt giới hạn memory thì bị OOM kill với exit code 137.
- Khi không đặt giới hạn, một container rò rỉ bộ nhớ có thể làm sập cả WSL2.
- Kiểm tra bằng `docker inspect`, không dựa vào nội dung tệp YAML.
:::

---

## Khái niệm: Secrets và backup (L2)

![pg_dump ra backup.sql rồi restore vào database mới; volume không phải backup](/slides/img/s14-backup.svg)

- **Secret** là dữ liệu nhạy cảm như mật khẩu, không ghi cứng trong YAML; **backup** là bản sao dữ liệu để khôi phục.
- Ví dụ trong dự án: `pg_dump` xuất database ra tệp SQL để restore sang database mới.

::: details Ghi chú cho mentor
- Volume không phải là backup.
- `.env` đủ dùng cho lab; secret dạng tệp an toàn hơn, nhưng ứng dụng phải biết đọc tệp đó.
- Image postgres hỗ trợ `POSTGRES_PASSWORD_FILE`.
- Mật khẩu ghi cứng trong YAML là không chấp nhận được.
- `pg_dump` xuất ra tệp SQL, dùng `exec -T` khi chuyển hướng đầu ra; restore thử vào một database mới để xác nhận backup dùng được.
:::

---

## Break và Debug: healthcheck quá ngặt

![Healthcheck sai đường dẫn và retries 1 làm backend unhealthy, frontend không được tạo](/slides/img/s14-break-hc.svg)

::: details Ghi chú cho mentor
- Cấu hình sai: đường dẫn kiểm tra sai (`/healthz`), `retries: 1`, không có `start_period`.
- Triệu chứng: backend `(unhealthy)`, frontend không được tạo, `up` báo `dependency failed to start`.
- Điều tra: đọc `.State.Health.Log` bằng `docker inspect`, chạy thủ công lệnh kiểm tra trong container.
- Phòng tránh: chạy thủ công lệnh kiểm tra trước khi đưa vào YAML; đặt `timeout` lớn hơn thời gian phản hồi vài lần.
:::

---

## Lab và thử thách

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 và 2 | Healthcheck cả ba service | Cả ba `(healthy)` |
| 3 | Restart, `/health`, `/ready` | 200 rồi 503 |
| 4 | Break, rồi Debug | Mã 404 trong Health Log |

[Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md).

::: details Ghi chú cho mentor
- Trang bài lab có lệnh và kết quả mong đợi.
- Phần 1 và 2 gồm healthcheck cho postgres, backend, frontend; phần 3 có mốc `RestartCount` tăng; phần 4 tìm ra mã 404 trong Health Log.
- Thử thách L2 làm ở nhà: giới hạn tài nguyên, secrets, backup và restore, gồm bốn thử thách ([thử thách buổi 14](../../labs/week-07/session-14-challenge.md)).
- Câu hỏi thảo luận: khi Postgres restart giữa chừng, frontend và backend có bị khởi động lại không; vì sao `unhealthy` không tự động được restart.
:::

---

## Tổng kết

![Ba điều cần nhớ: chạy khác sẵn sàng, tự dựng lại khi thoát, vận hành an toàn](/slides/img/s14-recap.svg)

Buổi tiếp theo: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Control startup order](https://docs.docker.com/compose/how-tos/startup-order/): started khác ready và cách chờ dịch vụ.
- **Tài liệu chính thức:** [Compose services](https://docs.docker.com/reference/compose-file/services/): cấu hình healthcheck, depends_on, restart.
- **Best practice:** [Use Compose in production](https://docs.docker.com/compose/how-tos/production/): khác biệt khi chạy Compose thật.
- **Best practice:** [The Twelve-Factor App: Disposability](https://12factor.net/disposability): khởi động nhanh, tắt êm, dễ thay thế.
