# Slide buổi 11 – Container Networking

> **Tóm tắt:** Cho API và database ở hai container nói chuyện bằng tên qua network riêng, chỉ mở đúng cổng ra máy bạn, và tự tìm ra lỗi "API chạy nhưng không nối được DB".

Bài học: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md) · Bài tập: [Bài tập tuần 6](../../assignments/weekly/week-06.md)

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: gọi bằng tên, mở đúng cổng, tìm lỗi DB](/slides/img/s11-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu chi tiết: phân biệt default bridge và user-defined bridge; phân biệt `-p` với kết nối giữa container; chứng minh isolation và dùng `docker network connect`; dựng `club-api` nối Postgres.
- Hỏi: ai từng gặp "chạy trên máy được, vào Docker thì hỏng"?
:::

---

## Slide 2: Trên máy chạy tốt, vào container thì hỏng

![API gọi localhost chạy được trên máy, trong container localhost là chính nó](/slides/img/s11-problem.svg)

::: details Ghi chú cho mentor
- Trên máy: API gọi `localhost:5432` chạy tốt. Vào container: API báo không nối được DB dù Postgres vẫn `Up`.
- `localhost` trong container API là chính container API.
- Ba câu hỏi hằng ngày: gọi bằng địa chỉ nào, cổng nào cần mở ra ngoài, làm sao DB không bị truy cập từ mọi nơi.
:::

---

## Slide 3: Gọi bằng tên chỉ chạy trên network tự tạo

![Default bridge báo bad address, network tự tạo gọi bằng tên thành công](/slides/img/s11-bridges.svg)

::: details Ghi chú cho mentor
- Default bridge: container chỉ gọi nhau bằng IP, IP đổi mỗi lần tạo lại. User-defined bridge (`docker network create`) có DNS nhúng.
- Compose cũng làm vậy: tên service là tên DNS. Khóa học chỉ dùng driver `bridge`.
- Ví von: default bridge là tòa nhà chỉ có số máy lẻ; network tự tạo có danh bạ. Kết luận: mọi dự án tự tạo network.
:::

---

## Slide 4: DNS nhúng trả IP theo tên

![Bốn bước: hỏi DNS 127.0.0.11, nhận IP, gửi gói tin qua bridge](/slides/img/s11-dns.svg)

::: details Ghi chú cho mentor
- Tạo `club-net`: Docker cấp subnet riêng và một bridge ảo; mỗi container gắn vào nhận một IP trong subnet.
- API gọi `postgres:5432`: truy vấn DNS tới `127.0.0.11`, Docker trả IP hiện tại; gói tin đi qua bridge. IP ví dụ trong hình sẽ khác trên máy bạn.
- `DB_HOST=postgres` hoạt động dù IP đổi.
:::

---

## Slide 5: -p chỉ để vào từ máy bạn

![curl vào API qua cổng publish; API gọi Postgres thẳng trong network](/slides/img/s11-portmap.svg)

::: details Ghi chú cho mentor
- `-p MÁY:CONTAINER` chỉ cần cho truy cập từ ngoài network. Container cùng network gọi thẳng cổng của container.
- `-p 127.0.0.1:...` chỉ mở trên localhost; `-p 13000:3000` mở trên mọi interface. `EXPOSE` chỉ là tài liệu.
:::

---

## Slide 6: Bức tranh đầy đủ

![club-net chứa API và Postgres, container ở other-net không thấy Postgres](/slides/img/s11-topology.svg)

::: details Ghi chú cho mentor
- Chỉ API có `-p`, nên chỉ API truy cập được từ máy bạn. Postgres ở network nội bộ, không publish cổng.
- Container ở network khác không có đường tới `club-net`, kể cả gọi bằng IP.
:::

---

## Slide 7: Demo: default bridge và network tự tạo

```text
$ docker run --rm alpine:3.20 wget -qO- -T 3 http://lab-web
wget: bad address 'lab-web'
$ docker exec lab-client nslookup lab-web
Server:   127.0.0.11
Name:     lab-web
```

Cùng một lệnh: khác network thì lỗi, cùng `lab-net` thì có HTML.

::: details Ghi chú cho mentor
- Demo 1: web server trên default bridge, gọi bằng tên từ container khác: `bad address`. Hỏi lớp: vì sao?
- Demo 2: trên `lab-net` gọi bằng tên thành công; IP của bạn sẽ khác, `127.0.0.11` là DNS nhúng của Docker.
- Demo 3: `-p 127.0.0.1:18082:80`, `curl -sI` ra `200 OK`; `docker port lab-web` rỗng vì không publish. Dọn dẹp: xóa container trước, rồi mới xóa network.
:::

---

## Slide 8: Isolation: network khác không thấy nhau

![Trước connect tên và IP đều thất bại, sau connect gọi được](/slides/img/s11-isolation.svg)

::: details Ghi chú cho mentor
- `iso-b` ở `net-b` gọi `iso-a` ở `net-a`: tên báo `bad address`, IP báo `download timed out`.
- `docker network connect net-a iso-b` rồi gọi lại: nhận HTML. Một container thuộc nhiều network là cách làm cầu nối có kiểm soát.
:::

---

## Slide 9: Lab L1: 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Gọi bằng tên, `-p` | `bad address` rồi `200 OK` |
| 3 | `club-api` và Postgres trên `club-net` | `{"status":"ready"}` |
| 4 | Isolation, `network connect` | Thất bại rồi thành công |
| 5 | Tự phá `DB_HOST=localhost` | `/ready` 503 |

Lệnh đầy đủ: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md).

::: details Ghi chú cho mentor
- Phần 3: Postgres không publish cổng, `docker port lab-postgres` phải rỗng; `club-net` có đúng hai container.
- Phần 5: làm xong bằng chứng ở Phần 3 trước khi phá lỗi.
:::

---

## Slide 10: Debug: API chạy nhưng /ready trả 503

```text
$ docker ps --filter name=lab-      → lab-api-bad  Up
$ curl -s localhost:13002/health    → {"status":"healthy"...}
$ curl ... /ready                   → 503
$ curl ... /api/members             → 500
```

Container sống, `/health` tốt, nhưng DB không nối được.

::: details Ghi chú cho mentor
- Cách phá: chạy API thứ hai với `DB_HOST=localhost`.
- Câu hỏi cho lớp: API sống, vậy ai không nối được ai? Gọi `/api/members` trước khi xem log vì `/ready` không ghi log lỗi.
:::

---

## Slide 11: Điều tra theo thứ tự

![Log, env, nslookup dẫn tới kết luận lỗi cấu hình DB_HOST](/slides/img/s11-debug-flow.svg)

::: details Ghi chú cho mentor
- Log có `ECONNREFUSED 127.0.0.1:5432` (hoặc `::1:5432`); `env` cho thấy `DB_HOST=localhost`; `nslookup` thành công nghĩa là network ổn.
- Sửa: tạo lại container với `DB_HOST` là tên Postgres. Biến thể sai network: `docker network connect`.
- Ghi triệu chứng, bước điều tra, nguyên nhân gốc, cách phòng tránh vào `report.md`.
:::

---

## Slide 12: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:5432` | `DB_HOST=localhost` | `DB_HOST` là tên Postgres |
| `bad address`, `ENOTFOUND` | Default bridge, khác network | Chung network tự tạo |
| `port is already allocated` | Cổng host đã bị dùng | Đổi cổng host |
| `network rm` báo `active endpoints` | Còn container gắn vào | `docker rm -f` trước |

---

## Slide 13: Thử thách cuối buổi

- Container ở network khác muốn nói chuyện mà không tạo lại: dùng lệnh gì?
- Có cần `-p 5432:5432` để API nối DB không? Vì sao?
- Thấy `ENOTFOUND postgres` dù `DB_HOST=postgres` đúng: hai nguyên nhân khả dĩ?

::: details Ghi chú cho mentor
- Đáp án: `docker network connect TEN_NETWORK TEN_CONTAINER`; không cần `-p` vì cùng network.
- `ENOTFOUND`: container ở default bridge hoặc khác network. Hỏi thêm: `127.0.0.11` là gì?
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: có tên là có DNS, -p chỉ để vào từ ngoài, localhost là chính nó](/slides/img/s11-recap.svg)

Buổi sau: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Networking overview](https://docs.docker.com/engine/network/): tổng quan cách container nói chuyện với nhau.
- **Tài liệu chính thức:** [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/): vì sao gọi bằng tên chỉ chạy trên network tự tạo.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): cô lập network và hạn chế cổng mở.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): nguyên tắc bảo mật chính thức của Docker.
