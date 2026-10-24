# Kịch bản mentor – Buổi 11 Container Networking

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 11 – Container Networking](../../labs/week-06/session-11.md). Barem và lỗi hay bị trừ điểm: [Chấm điểm tuần 6](../grading/week-06.md). Đáp án: [Walkthrough tuần 6](../walkthroughs/week-06.md).
:::

Tuần 6/16 · Giai đoạn 2 – Containerization · Buổi 11/32 · Slide: [Slide buổi 11](../../slides/02-docker/session-11.md)

## Khung thời gian buổi (120 phút)

| Phút | Hoạt động |
| --- | --- |
| 15 | Ôn tập buổi trước (Buổi 10: layer, cache, tag) và khởi động |
| 30 | Kiến thức và demo (phần dưới) |
| 60 | Học viên thực hành lab (Phần 1 đến 5 của bài học viên) |
| 15 | Review: thử thách cuối buổi, nhắc nộp bài |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

Gợi ý chia thời gian cho slide (tổng khoảng 60 phút): mục tiêu 2', vấn đề 2', driver 1', default và user-defined 3', DNS và port mapping 3', kiến trúc 2', từng bước 2', demo 1 đến 3 (2' + 3' + 3'), lab Phần 1 15', API và Postgres 10' + 10', isolation 8', thử thách L2 (phần còn lại của giờ lab), lỗi thường gặp 2', debug 6', sửa lỗi 3', thử thách cuối buổi 4', recap 2'.

## Demo của mentor

Mục tiêu demo: cho cả lớp thấy cùng một thao tác, chỉ khác network, cho kết quả khác nhau.

Chuẩn bị tên riêng để không đụng container khác (tất cả dùng tiền tố `demo-`).

1. Chạy một web server trên default bridge, rồi gọi nó bằng tên từ container khác:

```bash
docker run -d --name demo-web-default nginx:1.27-alpine
docker run --rm alpine:3.20 wget -qO- -T 3 http://demo-web-default
```

Kết quả mong đợi:

```text
wget: bad address 'demo-web-default'
```

Câu hỏi cho lớp: "Container `demo-web-default` đang chạy tốt. Vì sao gọi bằng tên lại thất bại?" (Default bridge không có DNS theo tên.)

2. Cùng thao tác, nhưng trên user-defined network:

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

3. Cho lớp xem DNS nhúng:

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

Câu hỏi: "`127.0.0.11` là gì? Nó nằm ở đâu?" (DNS server nhúng của Docker, nằm trong mỗi container.)

4. Port mapping: gọi từ host, rồi hỏi vì sao container thứ hai không cần `-p`:

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

5. Cho xem IP và subnet thật:

```bash
docker network inspect demo-net --format '{{ (index .IPAM.Config 0).Subnet }}'
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' demo-web
```

6. Dọn dẹp demo:

```bash
docker rm -f demo-web-default demo-web demo-web-pub
docker network rm demo-net
```

## Câu hỏi mentor nên hỏi lớp

Các câu hỏi dưới đây gom từ demo và từ ghi chú của slide.

- "Ai từng gặp `ECONNREFUSED 127.0.0.1:5432`?" (mở đầu, slide 2)
- "Container `demo-web-default` đang chạy tốt. Vì sao gọi bằng tên lại thất bại?" Để lớp tự trả lời trước. Đáp: default bridge không có DNS theo tên.
- "Vì sao IP không đáng tin?" Đáp: container tạo lại sẽ nhận IP khác.
- "`127.0.0.11` là gì, nằm ở đâu?" Đáp: DNS nhúng của Docker, nằm trong mỗi container.
- "`-p 13000:3000` khác `-p 127.0.0.1:13000:3000` thế nào?" Đáp: bản đầu mở trên mọi interface, máy trong LAN truy cập được.
- Debug: cho học viên tự điều tra theo thứ tự log, địa chỉ, env, `nslookup`. Nguyên nhân gốc: loopback là của chính container API.
- Tình huống 03 (`examples/troubleshooting/scenario-03/`): "Vì sao `/health` vẫn 200 và `docker compose ps` không cảnh báo?"
- Thử thách cuối buổi (slide 19), đáp án: `docker network connect`; không cần `-p 5432:5432` vì cùng network; `ENOTFOUND postgres` do khác network hoặc sai tên; `127.0.0.11` là DNS nhúng của Docker.

## Ghi chú giảng viên theo từng slide

Nguyên văn từ slide buổi 11 (đã chuyển ra khỏi slide).

1. Mục tiêu buổi học (2 phút): tên tài nguyên lab dùng tiền tố `lab-`, demo dùng `demo-` để không đụng nhau.
2. Vấn đề thực tế (2 phút): hỏi lớp "Ai từng gặp ECONNREFUSED 127.0.0.1:5432?"
3. Network driver (1 phút): không đi sâu `host` và `overlay`. Kubernetes sẽ lo phần nhiều host.
4. Default bridge và user-defined bridge (3 phút): hỏi "Vì sao IP không đáng tin?" Đáp: container tạo lại sẽ nhận IP khác.
5. Container DNS và port mapping (3 phút): câu hỏi "`-p 13000:3000` khác `-p 127.0.0.1:13000:3000` thế nào?" Đáp: bản đầu mở trên mọi interface, máy trong LAN truy cập được.
6. Kiến trúc (2 phút): chỉ ra chỉ API có port mapping; Postgres không có đường từ ngoài vào.
7. Cách hoạt động từng bước (2 phút): không cần giải thích veth. Chỉ cần học viên nhớ: cùng network thì có tên và có đường.
8. Demo 1 (2 phút): đáp: default bridge không có DNS theo tên. Để lớp tự trả lời trước.
9. Demo 2 (3 phút): cũng cho chạy `wget -qO- http://demo-web` để thấy trang chào của Nginx. Câu hỏi: "127.0.0.11 nằm ở đâu?" Đáp: trong mỗi container.
10. Demo 3 (3 phút): nếu báo `port is already allocated`, đổi cổng host. Nhắc xóa container trước rồi mới xóa network.
11. Hands-on L1, hai container giao tiếp bằng tên (15 phút): mong đợi HTML Nginx và IP phân giải qua 127.0.0.11. `docker port lab-web` không in gì vì không publish.
12. Hands-on L1, API và Postgres trên club-net (10 phút): biến `SP` trỏ tới starter-project, đặt ở bước chuẩn bị. Cảnh báo: mở terminal mới thì `DB_PASSWORD` bị sinh lại, dẫn tới `password authentication failed`.
13. Hands-on L1, chạy API và kiểm tra (10 phút): `DB_HOST` bằng tên container Postgres vì DNS nhúng phân giải trong club-net.
14. Hands-on L1, isolation (8 phút): một container có thể thuộc nhiều network: đó là cầu nối có kiểm soát.
15. Hands-on L2, thử thách (phần còn lại của giờ lab): gợi ý A: kiểm tra mong đợi thất bại viết `if ! docker exec ...; then echo PASS; fi`. Gợi ý B: `docker compose exec web nslookup postgres`.
16. Lỗi thường gặp (2 phút): nhắc thêm app phải lắng nghe `0.0.0.0` trong container (API starter đã làm).
17. Debug, API chạy nhưng `/ready` trả 503 (6 phút): cho học viên tự điều tra theo thứ tự: log, địa chỉ, env, nslookup. Lưu ý `/ready` không ghi log lỗi, hãy gọi `/api/members` trước khi xem log. Nguyên nhân gốc: loopback là của chính container API.
18. Sửa lỗi và biến thể sai network (3 phút): phòng tránh: đặt DB_HOST bằng tên service, đừng viết cứng trong code, giữ `/ready` kiểm tra DB.
19. Thử thách cuối buổi (4 phút): đáp án: `docker network connect`; không, vì cùng network; khác network hoặc sai tên; DNS nhúng của Docker.
20. Recap (2 phút): nhắc dọn dẹp lab và nộp `lab-11/`. Buổi sau: persistent storage cho Postgres.

## Lưu ý riêng cho người dạy

- Tình huống 03: mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-03/`, học viên chỉ nhận triệu chứng (API publish ở `http://localhost:23003`, `/ready` trả `503`) và tự tìm nguyên nhân gốc. Dọn dẹp bằng `bash cleanup.sh`. Câu hỏi L2: vì sao `/health` vẫn `200` và `docker compose ps` không cảnh báo? Lời giải nằm trong [Walkthrough tuần 6](../walkthroughs/week-06.md).
- Khi gọi `wget` từ bên trong container Alpine, luôn dùng `127.0.0.1` thay vì `localhost` (BusyBox thử IPv6 trước, API chỉ nghe IPv4). Đã kiểm chứng.
- Khi API không phân giải được tên Postgres, việc tra DNS thất bại mất khoảng 5 đến 8 giây trước khi API trả lỗi; dùng `wget -T 20` ở chỗ này, `-T 3` sẽ hết giờ trước.
- Chụp evidence `docker network inspect club-net` (đúng hai container) trước khi cho học viên chạy các container phá lỗi trên cùng network.
- Bài học viên dùng cổng host từ 13000 và 18000 trở lên để không đụng cổng 5432, 3000, 8080 của máy học viên.
