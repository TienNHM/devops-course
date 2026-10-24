# Buổi 11 – Thử thách thêm

[Buổi 11 – Container Networking](session-11.md) · [Bài tập tuần 6](../../assignments/weekly/week-06.md) · [Hub tuần 6](README.md)

> **Tóm tắt:** Thử thách L2 tùy chọn của buổi 11 (script isolation, Compose hai network), hai tình huống phá lỗi nâng cao và phần đọc thêm về network. Làm ở nhà sau khi xong lab bắt buộc.

::: tip Trang này dành cho ai
Chỉ làm khi bạn đã xong phần L1 của [Buổi 11 – Container Networking](session-11.md). Thời gian: khoảng 45 đến 60 phút cho mỗi thử thách. Thử thách L2 là điểm thưởng, không bắt buộc.
:::

## Thử thách L2

::: warning Tự thử 15 phút trước khi mở gợi ý
Gợi ý chia thành hai bậc: bậc 1 chỉ hướng, bậc 2 gần như cho cách làm. Đáp án đối chiếu (mở sau khi nộp bài): [trang tuần 6](README.md).
:::

### Thử thách A – Chứng minh isolation bằng một script

Viết `source/isolation-test.sh` thực hiện: tạo hai network, chạy hai container, chứng minh gọi bằng tên và bằng IP đều thất bại, nối network, chứng minh thành công, rồi dọn sạch. Tiêu chí hoàn thành:

- Script chạy từ đầu tới cuối không cần can thiệp và in `PASS` hoặc `FAIL` cho từng kiểm tra.
- Script dọn sạch container và network của nó, kể cả khi một bước thất bại (gợi ý: `trap`).
- Báo cáo giải thích vì sao gọi bằng IP cũng thất bại.

::: details Gợi ý bậc 1
Phần "dọn sạch kể cả khi lỗi" là việc của `trap`. Phần "kiểm tra mong đợi thất bại" là một câu `if` đảo ngược kết quả lệnh. Bạn đã có đủ lệnh trong Phần 4 của lab.
:::

::: details Gợi ý bậc 2
Dùng `trap cleanup EXIT` ở đầu script để luôn dọn. Một kiểm tra "mong đợi thất bại" viết như `if ! docker exec ... ; then echo PASS; fi`. Dùng `wget -T 3` để không chờ quá lâu.
:::

### Thử thách B – Chuyển cấu hình sang Compose có hai network

Viết `source/compose.yaml` gồm `postgres` (chỉ trong network `backend-net`), `api` (trong `backend-net` và `frontend-net`, publish `127.0.0.1:13001:3000`) và một `web` Nginx chỉ trong `frontend-net`. Tiêu chí hoàn thành:

- `web` không phân giải được `postgres` (chứng minh bằng `docker compose exec`), còn `api` thì được.
- Không service nào ngoài `api` publish cổng.
- Mật khẩu lấy từ `.env` (không commit), file mẫu `.env.example` có giá trị giả.

::: details Gợi ý bậc 1
Khai báo `networks:` ở mức cao nhất với hai network, rồi liệt kê network cho từng service. `api` là service duy nhất nằm ở cả hai network.
:::

::: details Gợi ý bậc 2
Với `web`, dùng image `nginx:1.27-alpine`; để kiểm tra DNS, dùng `docker compose exec web nslookup postgres` (Alpine có sẵn `nslookup` của BusyBox). Khi gọi API từ bên trong container, dùng `127.0.0.1` thay vì `localhost` vì `wget` của BusyBox thử IPv6 trước. Mật khẩu: `${DB_PASSWORD:?Set DB_PASSWORD in .env}`.
:::

## Phá lỗi nâng cao {#pha-loi-nang-cao}

**Phá lỗi 2 – sai network.** Chạy API trên network khác với Postgres:

```bash
docker network create lab-net-x
docker run -d --name lab-api-iso --network lab-net-x \
  -e DB_HOST=lab-postgres -e DB_PORT=5432 -e DB_NAME=clubdb \
  -e DB_USER=club -e DB_PASSWORD="$DB_PASSWORD" \
  club-api:1.0.0
sleep 3
docker exec lab-api-iso wget -qO- -T 20 http://127.0.0.1:3000/ready
docker exec lab-api-iso wget -qO- -T 20 http://127.0.0.1:3000/api/members
docker logs lab-api-iso --tail 5
```

Dùng `127.0.0.1` (không dùng `localhost`, vì `wget` của Alpine thử IPv6 trước) và `-T 20` vì việc phân giải tên thất bại mất khoảng 5-8 giây, `-T 3` sẽ hết giờ trước khi API kịp trả lỗi. Kết quả mong đợi: `/ready` trả 503 (`server returned error: HTTP/1.1 503 Service Unavailable`), `/api/members` trả 500 và log có dòng dạng `getaddrinfo ENOTFOUND lab-postgres` (hoặc `EAI_AGAIN`). Cách sửa: `docker network connect club-net lab-api-iso` (container vẫn đang chạy, DNS cập nhật ngay), rồi gọi lại `/ready`.

**Sửa Phá lỗi 1 chi tiết.** Biến môi trường không đổi được trên container đang chạy, nên phải tạo lại:

```bash
docker rm -f lab-api-bad
docker run -d --name lab-api-bad --network club-net -p 127.0.0.1:13002:3000 \
  -e DB_HOST=lab-postgres -e DB_PORT=5432 -e DB_NAME=clubdb \
  -e DB_USER=club -e DB_PASSWORD="$DB_PASSWORD" \
  club-api:1.0.0
sleep 2; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:13002/ready
```

Kết quả mong đợi: `200`. Phòng tránh: đặt `DB_HOST` bằng tên service trong cùng network, không viết cứng trong code, giữ endpoint `/ready` kiểm tra DB (starter-project đã có).

**Phá lỗi 3 – tình huống chuẩn bị sẵn (Tình huống 03).** Mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-03/`; bạn chỉ nhận triệu chứng (API publish ở `http://localhost:23003`, `/ready` trả `503`) và tự tìm nguyên nhân gốc. Dọn bằng `bash cleanup.sh`. Câu hỏi L2: vì sao `/health` vẫn `200` và `docker compose ps` không cảnh báo?

## Tìm hiểu thêm (đọc sau) {#tim-hieu-them}

**Các network driver.**

| Driver | Phạm vi | Dùng khi |
| --- | --- | --- |
| `bridge` | Một host Docker | Mặc định, dùng nhiều nhất. Khóa này chỉ dùng loại này. |
| `host` | Một host Docker | Dùng thẳng network của host, không cô lập. Hạn chế dùng. |
| `none` | Một host Docker | Không có mạng. |
| `overlay` | Nhiều host | Docker Swarm, ngoài phạm vi khóa này (Kubernetes lo phần này). |

**Default bridge so với user-defined bridge.**

| Tiêu chí | Default bridge | User-defined bridge |
| --- | --- | --- |
| Phân giải tên container | Không | Có |
| Cô lập giữa các ứng dụng | Kém (mọi container chung một network) | Tốt (mỗi nhóm một network) |
| Gắn/gỡ container khi đang chạy | Không linh hoạt | `docker network connect` / `disconnect` |
| Khuyến nghị | Chỉ để thử nhanh | Dùng cho mọi dự án |

Compose cũng làm đúng như vậy: mỗi project có một network riêng và tên service trở thành tên DNS.

**Cách viết `-p`.** `-p 18081:80` mở cổng 18081 trên mọi interface của host. `-p 127.0.0.1:18081:80` chỉ mở trên localhost của host (an toàn hơn, nên dùng khi học). `EXPOSE 80` trong Dockerfile chỉ là tài liệu, không publish gì cả.

**Đường đi của một yêu cầu, từng bước.**

1. Bạn tạo `club-net`: Docker cấp một subnet riêng (ví dụ 172.20.0.0/16) và một bridge ảo trên host.
2. Mỗi container gắn vào network nhận một IP trong subnet và một `veth` nối với bridge.
3. Khi `lab-api` gọi `lab-postgres:5432`, truy vấn DNS đi tới `127.0.0.11`, Docker trả IP hiện tại của `lab-postgres`.
4. Gói tin đi qua bridge tới container Postgres. Không cần publish cổng 5432.
5. Chỉ API có `-p 127.0.0.1:13000:3000`, nên chỉ API truy cập được từ máy bạn.
6. Container ở network khác không có đường tới `club-net`, vì không chung network.

Quay lại [Buổi 11 – Container Networking](session-11.md) · Buổi tiếp theo: [Buổi 12 – Persistent Storage](session-12.md).
