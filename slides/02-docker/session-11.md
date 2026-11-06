# Slide buổi 11 – Container Networking

> **Tóm tắt:** Buổi học cho API và database ở hai container giao tiếp với nhau bằng tên qua một network riêng, chỉ mở đúng cổng ra máy chủ, và chẩn đoán lỗi "API chạy nhưng không kết nối được database".

Bài học: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md) · Bài tập: [Bài tập tuần 6](../../assignments/weekly/week-06.md)

## Mục tiêu của buổi học

![Ba mục tiêu: gọi bằng tên, mở đúng cổng, tìm lỗi DB](/slides/img/s11-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu chi tiết: phân biệt default bridge và user-defined bridge; phân biệt `-p` với kết nối giữa các container; chứng minh isolation và dùng `docker network connect`; dựng `club-api` kết nối Postgres.
- Câu hỏi mở đầu: ai từng gặp tình huống "chạy được trên máy, vào Docker thì hỏng".
:::

---

## Chạy tốt trên máy chủ nhưng lỗi trong container

![API gọi localhost chạy được trên máy, trong container localhost là chính nó](/slides/img/s11-problem.svg)

::: details Ghi chú cho mentor
- Trên máy chủ: API gọi `localhost:5432` chạy tốt. Trong container: API báo không kết nối được database dù Postgres vẫn ở trạng thái `Up`.
- `localhost` trong container API chính là container API.
- Ba câu hỏi cần trả lời: gọi bằng địa chỉ nào, cổng nào cần mở ra ngoài, làm sao để database không bị truy cập từ mọi nơi.
:::

---

## Khái niệm: Bridge network

![Hai container cùng bridge club-net gửi gói tin cho nhau](/slides/img/s11-k-bridge-network.svg)

- **Bridge network** là mạng ảo do Docker tạo trên máy chủ; các container cùng bridge gửi được gói tin cho nhau.
- Ví dụ trong dự án: network `club-net` chứa container API và container Postgres.

::: details Ghi chú cho mentor
- Docker cung cấp sẵn default bridge, và người dùng có thể tạo thêm user-defined bridge bằng `docker network create`.
- Tạo `club-net`: Docker cấp subnet riêng và một bridge ảo; mỗi container gắn vào nhận một IP trong subnet.
- Khóa học chỉ dùng driver `bridge`.
:::

---

## Gọi bằng tên chỉ hoạt động trên network tự tạo

![Default bridge báo bad address, network tự tạo gọi bằng tên thành công](/slides/img/s11-bridges.svg)

- Trên default bridge, container chỉ gọi nhau bằng địa chỉ IP, và IP có thể đổi mỗi lần container được tạo lại.
- Trên user-defined bridge, Docker phân giải tên container thành IP. Kết luận: mỗi dự án nên tự tạo network riêng.

::: details Ghi chú cho mentor
- Default bridge: chỉ gọi nhau bằng IP. User-defined bridge (`docker network create`) có DNS nhúng.
- Compose hoạt động tương tự: tên service là tên DNS.
:::

---

## Khái niệm: DNS nhúng của Docker

![Bốn bước: hỏi DNS 127.0.0.11, nhận IP, gửi gói tin qua bridge](/slides/img/s11-dns.svg)

- **DNS nhúng** là máy chủ phân giải tên có sẵn trong Docker, lắng nghe tại `127.0.0.11` trong container thuộc user-defined network.
- Ví dụ trong dự án: `DB_HOST=postgres` hoạt động dù IP của container Postgres thay đổi.

::: details Ghi chú cho mentor
- Khi container gọi một tên, truy vấn đến DNS này và nhận về IP hiện tại của container tương ứng; vì vậy tên vẫn đúng khi IP thay đổi.
- API gọi `postgres:5432`: truy vấn DNS tới `127.0.0.11`, Docker trả IP hiện tại; gói tin đi qua bridge. IP trong hình chỉ là ví dụ và sẽ khác trên máy của người học.
:::

---

## Khái niệm: Publish cổng (-p)

![curl vào API qua cổng publish; API gọi Postgres thẳng trong network](/slides/img/s11-portmap.svg)

- **Publish cổng** (`-p MÁY:CONTAINER`) ánh xạ một cổng của máy chủ tới một cổng của container, để truy cập từ ngoài network.
- Ví dụ trong dự án: chỉ API được `-p`; Postgres không publish cổng.

::: details Ghi chú cho mentor
- Container cùng network gọi thẳng cổng của container và không cần `-p`.
- `-p 13000:3000` mở trên mọi interface.
- `-p 127.0.0.1:...` chỉ mở trên localhost; `EXPOSE` chỉ có tác dụng làm tài liệu.
- `-p MÁY:CONTAINER` chỉ cần cho truy cập từ ngoài network.
:::

---

## Bức tranh đầy đủ

![club-net chứa API và Postgres, container ở other-net không thấy Postgres](/slides/img/s11-topology.svg)

::: details Ghi chú cho mentor
- Chỉ API có `-p`, nên chỉ API truy cập được từ máy chủ. Postgres nằm trong network nội bộ và không publish cổng.
- Container ở network khác không có đường tới `club-net`, kể cả khi gọi bằng IP.
:::

---

## Demo: default bridge và network tự tạo

```text
$ docker run --rm alpine:3.20 wget -qO- -T 3 http://lab-web
wget: bad address 'lab-web'
$ docker exec lab-client nslookup lab-web
Server:   127.0.0.11
Name:     lab-web
```

Cùng một lệnh gọi: khác network thì lỗi, cùng `lab-net` thì nhận được HTML.

::: details Ghi chú cho mentor
- Demo 1: web server trên default bridge, gọi bằng tên từ container khác cho kết quả `bad address`. Câu hỏi cho lớp: nguyên nhân là gì.
- Demo 2: trên `lab-net`, gọi bằng tên thành công; IP sẽ khác trên từng máy, còn `127.0.0.11` là DNS nhúng của Docker.
- Demo 3: `-p 127.0.0.1:18082:80`, `curl -sI` trả về `200 OK`; `docker port lab-web` rỗng vì không publish. Dọn dẹp: xóa container trước, rồi mới xóa network.
:::

---

## Khái niệm: Network isolation

![Trước connect tên và IP đều thất bại, sau connect gọi được](/slides/img/s11-isolation.svg)

- **Network isolation** nghĩa là container ở network này không có đường đi tới container ở network khác.
- Ví dụ trong dự án: `iso-b` gọi `iso-a` thất bại; sau `docker network connect net-a iso-b` thì gọi được.

::: details Ghi chú cho mentor
- Lệnh `docker network connect` gắn thêm một container đang chạy vào network khác, nên một container có thể thuộc nhiều network.
- `iso-b` ở `net-b`, `iso-a` ở `net-a`.
- Trước khi connect: tên báo `bad address`, IP báo `download timed out`. Sau khi connect: nhận HTML.
- Một container thuộc nhiều network là cách tạo cầu nối có kiểm soát.
:::

---

## Lab L1: 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Gọi bằng tên, `-p` | `200 OK` |
| 3 | `club-api` và Postgres | `"ready"` |
| 4 | `network connect` | Gọi được |
| 5 | Đặt sai `DB_HOST` | `/ready` 503 |

::: details Ghi chú cho mentor
- Lệnh đầy đủ: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md).
- Mốc xong chi tiết: phần 1-2 `bad address` rồi `200 OK`; phần 3 `{"status":"ready"}` với `club-api` và Postgres trên `club-net`; phần 4 thất bại rồi thành công; phần 5 đặt `DB_HOST=localhost` cố ý.
- Phần 3: Postgres không publish cổng nên `docker port lab-postgres` phải rỗng; `club-net` có đúng hai container.
- Phần 5: hoàn tất bằng chứng ở Phần 3 trước khi tạo lỗi.
:::

---

## Debug: API chạy nhưng /ready trả 503

```text
$ docker ps --filter name=lab-      → lab-api-bad  Up
$ curl -s localhost:13002/health    → {"status":"healthy"...}
$ curl ... /ready                   → 503
$ curl ... /api/members             → 500
```

Container đang chạy và `/health` trả về kết quả tốt, nhưng API không kết nối được database.

::: details Ghi chú cho mentor
- Cách tạo lỗi: chạy API thứ hai với `DB_HOST=localhost`.
- Câu hỏi cho lớp: API vẫn sống, vậy thành phần nào không kết nối được thành phần nào. Gọi `/api/members` trước khi xem log vì `/ready` không ghi log lỗi.
:::

---

## Điều tra theo thứ tự

![Log, env, nslookup dẫn tới kết luận lỗi cấu hình DB_HOST](/slides/img/s11-debug-flow.svg)

::: details Ghi chú cho mentor
- Log có `ECONNREFUSED 127.0.0.1:5432` (hoặc `::1:5432`); `env` cho thấy `DB_HOST=localhost`; `nslookup` thành công nghĩa là network không có vấn đề.
- Cách sửa: tạo lại container với `DB_HOST` là tên Postgres. Biến thể sai network: dùng `docker network connect`.
- Ghi triệu chứng, bước điều tra, nguyên nhân gốc và cách phòng tránh vào `report.md`.
:::

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `ECONNREFUSED` | `localhost` | Dùng tên Postgres |
| `ENOTFOUND` | Default bridge | Network tự tạo |
| `allocated` | Cổng đã dùng | Đổi cổng |
| `active endpoints` | Còn container | `docker rm -f` |

::: details Ghi chú cho mentor
- `ECONNREFUSED 127.0.0.1:5432`: `DB_HOST=localhost`; đặt `DB_HOST` là tên Postgres.
- `bad address`, `ENOTFOUND`: default bridge hoặc khác network; dùng chung network tự tạo.
- `port is already allocated`: cổng máy chủ đã được dùng; đổi cổng máy chủ.
- `network rm` báo `active endpoints`: còn container gắn vào network; `docker rm -f` các container trước.
:::

---

## Câu hỏi cuối buổi

- Container ở network khác cần giao tiếp mà không phải tạo lại: dùng lệnh nào?
- API có cần `-p 5432:5432` để kết nối database không? Giải thích.
- Gặp `ENOTFOUND postgres` dù `DB_HOST=postgres` đúng: nêu hai nguyên nhân khả dĩ.

::: details Ghi chú cho mentor
- Đáp án: `docker network connect TEN_NETWORK TEN_CONTAINER`; không cần `-p` vì hai container cùng network.
- `ENOTFOUND`: container ở default bridge hoặc ở network khác. Câu hỏi thêm: `127.0.0.11` là địa chỉ của thành phần nào.
:::

---

## Tổng kết

![Ba điều cần nhớ: có tên là có DNS, -p chỉ để vào từ ngoài, localhost là chính nó](/slides/img/s11-recap.svg)

Buổi sau: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Networking overview](https://docs.docker.com/engine/network/): tổng quan cách container nói chuyện với nhau.
- **Tài liệu chính thức:** [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/): vì sao gọi bằng tên chỉ chạy trên network tự tạo.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): cô lập network và hạn chế cổng mở.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): nguyên tắc bảo mật chính thức của Docker.
