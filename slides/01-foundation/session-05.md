# Slide buổi 05 – Networking Fundamentals

> **Tóm tắt:** Hiểu IP, DNS, TCP, port, HTTP và localhost, rồi dùng ping, curl, nslookup, ss để chẩn đoán một request theo từng tầng.

Lệnh chi tiết của lab nằm trong bài học: [Buổi 05 – Networking Fundamentals](../../labs/week-03/session-05.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: đọc từng tầng, phân loại lỗi, hiểu bind và container](/slides/img/s05-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Ngoài ra: xử lý `Address already in use` bằng cách tìm process giữ port.
- Hỏi: ai từng nhắn "web không vào được" mà không biết lỗi ở đâu?
:::

---

## Slide 2: "Không vào được" là một trong 5 lỗi

![Năm nguyên nhân khác nhau cho cùng một câu không vào được](/slides/img/s05-five-causes.svg)

::: details Ghi chú cho mentor
- Starter-project có ba thành phần nói chuyện qua mạng: Nginx 8080, API 3000, PostgreSQL 5432.
- Mọi lỗi kết nối trong Docker, Compose, Kubernetes là lỗi mạng ở một tầng cụ thể.
:::

---

## Slide 3: IP chọn máy, port chọn chương trình

![Gói tin tới địa chỉ IP rồi tới đúng port của chương trình](/slides/img/s05-ip-port.svg)

::: details Ghi chú cho mentor
- Cùng subnet nói chuyện trực tiếp, khác subnet đi qua gateway.
- `127.0.0.0/8` là loopback. Dải private: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`; WSL2, Docker, kind đều dùng.
- Port quen thuộc: 22 SSH, 53 DNS, 80 và 443 HTTP(S). TCP bắt tay ba bước; UDP không kết nối.
:::

---

## Slide 4: DNS đổi tên thành IP

![Tra /etc/hosts trước, rồi hỏi resolver để ra địa chỉ IP](/slides/img/s05-dns.svg)

::: details Ghi chú cho mentor
- Resolver trong WSL2 ghi ở `/etc/resolv.conf`. `localhost` trỏ về `127.0.0.1`.
- Kết quả được cache theo TTL.
- Hỏi: dòng nào của `nslookup` cho biết resolver đang dùng? (dòng `Server`)
:::

---

## Slide 5: Một request đi qua bốn bước

![DNS, TCP, TLS, HTTP và công cụ kiểm tra từng bước](/slides/img/s05-request-steps.svg)

::: details Ghi chú cho mentor
- Lỗi DNS ở bước 1, lỗi TCP ở bước 2, lỗi ứng dụng ở bước 4.
- Với HTTPS, TLS handshake diễn ra sau khi TCP bắt tay xong.
:::

---

## Slide 6: Đọc curl -v: dòng *, > và <

```text
$ curl -v https://example.com/ -o /dev/null
* Host example.com:443 was resolved.   # DNS xong
* Connected to example.com             # TCP xong
* SSL connection using TLSv1.3         # TLS xong
> GET / HTTP/2                         # request
< HTTP/2 200                           # response
```

Dòng nào chứng minh DNS thành công? Dòng nào chứng minh TCP?

::: details Ghi chú cho mentor
- Trong lab dùng `2>&1` vì `curl -v` ghi chẩn đoán ra stderr.
- Tầng IP: `ip -br addr` cho `lo` và `eth0`. Tầng port: `ss -ltnp`.
:::

---

## Slide 7: Chẩn đoán từ dưới lên

![Cây quyết định: DNS, TCP, HTTP và lỗi tương ứng](/slides/img/s05-diagnose.svg)

::: details Ghi chú cho mentor
- Đi theo thứ tự: DNS có ra IP không, rồi TCP nối được không, rồi HTTP trả gì.
- 2xx mà người dùng vẫn lỗi thì kiểm tra phía client.
:::

---

## Slide 8: Ba loại lỗi kết nối của curl

![curl 7 refused, 28 timeout, 6 không phân giải được tên](/slides/img/s05-three-errors.svg)

::: details Ghi chú cho mentor
- Hỏi: với mỗi lỗi, lệnh tiếp theo bạn chạy là gì?
- `192.0.2.1` thuộc dải TEST-NET-1 dành cho tài liệu nên không ai trả lời, dùng để tái hiện timeout.
:::

---

## Slide 9: Bind address: ai được gọi vào server

![bind 127.0.0.1 chỉ nhận từ chính máy, bind 0.0.0.0 nhận từ mọi card mạng](/slides/img/s05-bind.svg)

::: details Ghi chú cho mentor
- Demo: `python3 -m http.server 9000 --bind 127.0.0.1` rồi `ss -ltnp`, sau đó `--bind 0.0.0.0` và so sánh cột Local Address.
- Với service thật, bind `0.0.0.0` là quyết định có chủ đích.
:::

---

## Slide 10: localhost trong container là chính container

![API trong container gọi postgres theo tên service, không dùng localhost](/slides/img/s05-container.svg)

::: details Ghi chú cho mentor
- Mỗi container có network namespace riêng.
- Nginx là reverse proxy: `/` là file tĩnh, `/api/` chuyển sang `http://backend:3000`. Gọi `/health` qua 8080 sẽ nhận frontend vì không khớp `/api/`.
:::

---

## Slide 11: Port đã được sử dụng

```text
$ python3 -m http.server 9000 --bind 0.0.0.0
OSError: [Errno 98] Address already in use
$ ss -ltnp 'sport = :9000'
LISTEN 0 5 0.0.0.0:9000 0.0.0.0:* users:(("python3",pid=2410,fd=3))
```

Có PID thì `ps -p PID`, rồi `kill PID` nhẹ nhàng hoặc đổi port.

::: details Ghi chú cho mentor
- Docker báo `port is already allocated`. Không `kill -9` ngay, không kill process không biết là gì.
- Phòng tránh: đặt port bằng biến môi trường như `WEB_PORT`.
:::

---

## Slide 12: Lab: năm phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | `ip`, `ping`, `nslookup` | `nameserver` trùng dòng `Server` |
| 3 | `curl -v` | có dòng `>`, `<` và `200` |
| 4 | Server Python và `ss -ltnp` | hai dòng `LISTEN` của port 9000 |
| 5 | Port conflict, ba mã lỗi | có `(7)`, `(28)`, `(6)` |

Lệnh đầy đủ: [Buổi 05 – Networking Fundamentals](../../labs/week-03/session-05.md).

::: details Ghi chú cho mentor
- Luôn dùng `tee -a` để không ghi đè bằng chứng.
- Nộp `lab-05/` với bằng chứng dạng text, không dùng ảnh thay log.
:::

---

## Slide 13: Ping được chưa chắc web sống

```text
$ ping -c 1 1.1.1.1
1 packets transmitted, 1 received, 0% packet loss
$ curl -sS http://127.0.0.1:9000/
curl: (7) Failed to connect ... Connection refused
```

`ping` chỉ hỏi ICMP. Muốn biết service sống, dùng `curl` và `ss`.

::: details Ghi chú cho mentor
- Ngược lại, ping lỗi chưa chắc mất mạng vì nhiều mạng chặn ICMP.
- `curl (6)`: `nslookup tên`, xem `/etc/resolv.conf`. `curl (28)`: kiểm tra IP, `ip route`, firewall.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: đi từng tầng, đọc mã lỗi, bind và localhost](/slides/img/s05-recap.svg)

Buổi tiếp theo: [Buổi 06 – Git & GitHub Workflow](session-06.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Overview of HTTP (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview): HTTP hoạt động thế nào, giải thích rõ ràng.
- **Tài liệu chính thức:** [HTTP response status codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status): tra mã 200, 404, 500 nghĩa là gì.
- **Tài liệu chính thức:** [DNS (MDN Glossary)](https://developer.mozilla.org/en-US/docs/Glossary/DNS): DNS đổi tên miền thành địa chỉ IP.
- **Best practice:** [Transport Layer Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html): cấu hình HTTPS/TLS an toàn.
- **Best practice:** [OWASP Top 10](https://owasp.org/www-project-top-ten/): các lỗi bảo mật web thường gặp.
