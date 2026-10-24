# Kịch bản buổi 11: Container Networking

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md). Slide: [Slide buổi 11](../../slides/02-docker/session-11.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 6](../grading/week-06.md). Đáp án: [Đáp án tuần 6](../walkthroughs/week-06.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 11 trong 120 phút: khung thời gian, demo 6 bước về DNS và port mapping, câu hỏi cho lớp, ghi chú theo 14 slide và lưu ý khi chạy tình huống 03.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động |
| --- | --- |
| 15 | Ôn tập Buổi 10 (layer, cache, tag) và khởi động |
| 30 | Kiến thức và demo: Slide 1 đến 9 |
| 60 | Học viên làm lab (Chuẩn bị và Phần 1 đến 5), Slide 10 và 11 |
| 15 | Review: Slide 12 đến 14, thử thách cuối buổi, nhắc nộp bài |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; Buổi 12 dồn vào thực hành.

Phân bổ thời gian lab gợi ý: Chuẩn bị 5 phút, Phần 1 10 phút, Phần 2 5 phút, Phần 3 20 phút, Phần 4 10 phút, Phần 5 10 phút. Thử thách L2 (script isolation, Compose hai network) làm ở nhà.

## Kịch bản demo (Slide 7 đến 9)

Mục tiêu demo: cho cả lớp thấy cùng một thao tác, chỉ khác network, cho kết quả khác nhau. Tên tài nguyên demo dùng tiền tố `demo-`, lab dùng `lab-`, để không đụng nhau. Tổng thời gian khoảng 11 phút.

**Bước 1 (Slide 7). Default bridge không có DNS.** Chạy một web server trên default bridge, rồi gọi nó bằng tên từ container khác:

```bash
docker run -d --name demo-web-default nginx:1.27-alpine
docker run --rm alpine:3.20 wget -qO- -T 3 http://demo-web-default
```

Kết quả mong đợi:

```text
wget: bad address 'demo-web-default'
```

Câu hỏi cho lớp: "Container `demo-web-default` đang chạy tốt. Vì sao gọi bằng tên lại thất bại?" Để lớp tự trả lời trước. Đáp: default bridge không có DNS theo tên.

**Bước 2 (Slide 8). Cùng thao tác trên user-defined network.**

```bash
docker network create demo-net
docker run -d --name demo-web --network demo-net nginx:1.27-alpine
docker run --rm --network demo-net alpine:3.20 wget -qO- http://demo-web
```

Kết quả mong đợi: trang chào của Nginx.

```text
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

**Bước 3 (Slide 8). Cho lớp xem DNS nhúng.**

```bash
docker run --rm --network demo-net alpine:3.20 nslookup demo-web
```

Kết quả mong đợi (địa chỉ IP của bạn sẽ khác):

```text
Server:		127.0.0.11
Address:	127.0.0.11:53

Non-authoritative answer:
Name:	demo-web
Address: 172.19.0.2
```

Câu hỏi: "`127.0.0.11` là gì? Nó nằm ở đâu?" Đáp: DNS server nhúng của Docker, nằm trong mỗi container.

**Bước 4 (Slide 9). Port mapping.** Gọi từ host, rồi hỏi vì sao container thứ hai không cần `-p`:

```bash
docker run -d --name demo-web-pub --network demo-net -p 127.0.0.1:18081:80 nginx:1.27-alpine
curl -sI http://localhost:18081 | head -n 1
docker port demo-web-pub
```

Kết quả mong đợi:

```text
HTTP/1.1 200 OK
80/tcp -> 127.0.0.1:18081
```

Nếu báo `port is already allocated`, đổi cổng host.

**Bước 5 (Slide 9). Xem IP và subnet thật.**

```bash
docker network inspect demo-net --format '{{ (index .IPAM.Config 0).Subnet }}'
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' demo-web
```

**Bước 6. Dọn dẹp demo.** Xóa container trước, rồi mới xóa network:

```bash
docker rm -f demo-web-default demo-web demo-web-pub
docker network rm demo-net
```

## Câu hỏi cho lớp

- "Ai từng gặp `ECONNREFUSED 127.0.0.1:5432`?" (mở đầu, Slide 2)
- "Vì sao IP không đáng tin?" Đáp: container tạo lại sẽ nhận IP khác. (Slide 3)
- "`-p 13000:3000` khác `-p 127.0.0.1:13000:3000` thế nào?" Đáp: bản đầu mở trên mọi interface, máy trong LAN truy cập được. (Slide 4)
- "Container `demo-web-default` đang chạy tốt. Vì sao gọi bằng tên lại thất bại?" Đáp: default bridge không có DNS theo tên. (Slide 7)
- "`127.0.0.11` là gì, nằm ở đâu?" Đáp: DNS nhúng của Docker, nằm trong mỗi container. (Slide 8)
- Debug (Slide 11): cho học viên tự điều tra theo thứ tự log, địa chỉ, env, `nslookup`. Nguyên nhân gốc: loopback là của chính container API.
- Tình huống 03 (`examples/troubleshooting/scenario-03/`): "Vì sao `/health` vẫn 200 và `docker compose ps` không cảnh báo?"
- Thử thách cuối buổi (Slide 13), đáp án: `docker network connect`; không cần `-p 5432:5432` vì cùng network; `ENOTFOUND postgres` do khác network hoặc sai tên; `127.0.0.11` là DNS nhúng của Docker.

## Ghi chú theo slide

Slide buổi 11 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Nhắc: tên tài nguyên lab dùng tiền tố `lab-`, demo dùng `demo-`.
2. **Vấn đề thực tế (3 phút).** Hỏi lớp "Ai từng gặp `ECONNREFUSED 127.0.0.1:5432`?" Chốt: `localhost` trong container là chính container.
3. **Default bridge và user-defined bridge (4 phút).** Không đi sâu `host` và `overlay`; Kubernetes sẽ lo phần nhiều host. Hỏi "Vì sao IP không đáng tin?"
4. **Container DNS và port mapping (4 phút).** Hỏi về `-p 13000:3000` so với `-p 127.0.0.1:13000:3000`. `EXPOSE` chỉ là tài liệu.
5. **Kiến trúc (2 phút).** Chỉ ra chỉ API có port mapping; Postgres không có đường từ ngoài vào.
6. **Cách hoạt động từng bước (2 phút).** Không cần giải thích `veth`. Chỉ cần học viên nhớ: cùng network thì có tên và có đường.
7. **Demo 1: default bridge không có DNS (4 phút).** Bước 1 của demo.
8. **Demo 2: user-defined network có DNS (4 phút).** Bước 2 và 3. Có thể cho chạy thêm `wget -qO- http://demo-web` để thấy trang chào của Nginx. Hỏi: "`127.0.0.11` nằm ở đâu?"
9. **Demo 3: port mapping (3 phút).** Bước 4 đến 6. Nhắc xóa container trước rồi mới xóa network.
10. **Lab L1 (60 phút).** Điểm cần nhấn ở từng phần:
    - Phần 1: mong đợi HTML Nginx và IP phân giải qua `127.0.0.11`. Đối chứng default bridge cho `bad address`.
    - Phần 2: `docker port lab-web` không in gì vì không publish.
    - Phần 3: biến `SP` trỏ tới `starter-project`, đặt ở bước chuẩn bị. Cảnh báo: mở terminal mới thì `DB_PASSWORD` bị sinh lại, dẫn tới `password authentication failed`. `DB_HOST` bằng tên container Postgres vì DNS nhúng phân giải trong `club-net`. Chụp evidence `docker network inspect club-net` (đúng hai container) trước Phần 5.
    - Phần 4: một container có thể thuộc nhiều network, đó là cầu nối có kiểm soát.
    - Phần 5: tự phá lỗi `DB_HOST=localhost`.
11. **Debug: API chạy nhưng `/ready` trả 503 (6 phút, trong Phần 5).** Cho học viên tự điều tra theo thứ tự: log, địa chỉ, env, `nslookup`. Lưu ý `/ready` không ghi log lỗi, hãy gọi `/api/members` trước khi xem log. Nguyên nhân gốc: loopback là của chính container API. Sửa bằng cách tạo lại container với `DB_HOST` là tên Postgres; biến thể sai network sửa bằng `docker network connect`. Phòng tránh: đặt `DB_HOST` bằng tên service, đừng viết cứng trong code, giữ `/ready` kiểm tra DB.
12. **Lỗi thường gặp (2 phút).** Nhắc thêm: app phải lắng nghe `0.0.0.0` trong container (API starter đã làm).
13. **Thử thách cuối buổi (4 phút).** Đáp án ở mục Câu hỏi cho lớp.
14. **Recap (2 phút).** Nhắc dọn lab và nộp `lab-11/`. Buổi sau: persistent storage cho Postgres.

Gợi ý nếu học viên làm L2: Thử thách A (script isolation) viết kiểm tra mong đợi thất bại dạng `if ! docker exec ...; then echo PASS; fi`; Thử thách B (Compose hai network) kiểm tra bằng `docker compose exec web nslookup postgres`.

## Lưu ý riêng cho người dạy

- Tình huống 03: mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-03/`, học viên chỉ nhận triệu chứng (API publish ở `http://localhost:23003`, `/ready` trả `503`) và tự tìm nguyên nhân gốc. Dọn dẹp bằng `bash cleanup.sh`. Lời giải nằm trong [Đáp án tuần 6](../walkthroughs/week-06.md).
- Khi gọi `wget` từ bên trong container Alpine, luôn dùng `127.0.0.1` thay vì `localhost` (BusyBox thử IPv6 trước, API chỉ nghe IPv4). Đã kiểm chứng.
- Khi API không phân giải được tên Postgres, việc tra DNS thất bại mất khoảng 5 đến 8 giây trước khi API trả lỗi; dùng `wget -T 20` ở chỗ này, `-T 3` sẽ hết giờ trước.
- Chụp evidence `docker network inspect club-net` (đúng hai container) trước khi cho học viên chạy các container phá lỗi trên cùng network.
- Bài học viên dùng cổng host từ 13000 và 18000 trở lên để không đụng cổng 5432, 3000, 8080 của máy học viên.
