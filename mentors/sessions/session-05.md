# Kịch bản mentor – Buổi 05: Networking Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 05 – Networking Fundamentals](../../labs/week-03/session-05.md). Slide: [Slide buổi 05](../../slides/01-foundation/session-05.md). Đáp án: [Walkthrough tuần 3](../walkthroughs/week-03.md). Chấm bài: [Chấm bài tuần 3](../grading/week-03.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 05: khung thời gian, demo từng bước, câu hỏi cho lớp và ghi chú giảng viên theo từng slide.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ gợi ý cho buổi này (theo ghi chú trong slide): mở đầu 2 phút, vấn đề thực tế 2 phút, IP 3 phút, DNS 3 phút, TCP/port/HTTP 3 phút, bind address 3 phút, sơ đồ request 3 phút, sơ đồ chẩn đoán 3 phút, demo khoảng 12 đến 15 phút. Lab 60 phút: Phần 1 đến 3 khoảng 25 phút, port conflict khoảng 10 phút.

## Demo của mentor

Mục tiêu: cho lớp thấy một request đi qua từng tầng bằng công cụ thật. Thời lượng khoảng 12 đến 15 phút, chiếu terminal lên màn hình.

**Bước 1 – Xem địa chỉ IP của máy.**

```bash
ip -br addr
```

Kết quả mong đợi (rút gọn, địa chỉ của bạn sẽ khác):

```text
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             172.24.100.5/20
```

Giải thích: `lo` là loopback, `eth0` là card mạng ảo của WSL2 với địa chỉ private. Câu hỏi cho lớp: "Hai địa chỉ này khác nhau chỗ nào về phạm vi truy cập?"

**Bước 2 – Phân giải tên miền.**

```bash
nslookup example.com
```

Kết quả mong đợi (rút gọn, IP thực tế có thể khác):

```text
Server:         10.255.255.254
Address:        10.255.255.254#53

Non-authoritative answer:
Name:   example.com
Address: 93.184.215.14
```

Giải thích: dòng `Server` là DNS resolver đang dùng; `#53` là port DNS. Câu hỏi: "Vì sao có chữ Non-authoritative?" (Câu trả lời đến từ cache của resolver, không phải từ máy chủ gốc quản lý tên miền.)

**Bước 3 – Gọi HTTP và xem toàn bộ quá trình.**

```bash
curl -v http://example.com/ -o /dev/null
```

Kết quả mong đợi (rút gọn):

```text
* Host example.com:80 was resolved.
*   Trying 93.184.215.14:80...
* Connected to example.com (93.184.215.14) port 80
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/8.5.0
>
< HTTP/1.1 200 OK
< Content-Type: text/html
```

Giải thích: dòng bắt đầu bằng `*` là thông tin kết nối (DNS, TCP), `>` là request gửi đi, `<` là response nhận về. Câu hỏi: "Dòng nào chứng minh DNS đã thành công? Dòng nào chứng minh TCP đã thành công?"

**Bước 4 – Tạo một server cục bộ và xem port.**

Mở terminal thứ hai, chạy:

```bash
mkdir -p ~/devops-labs/lab-05/source/site && cd ~/devops-labs/lab-05/source/site
echo "Club Management network demo" > index.html
python3 -m http.server 9000 --bind 127.0.0.1
```

Ở terminal thứ nhất:

```bash
ss -ltnp | grep 9000
curl -i http://127.0.0.1:9000/
```

Kết quả mong đợi:

```text
LISTEN 0      5      127.0.0.1:9000      0.0.0.0:*    users:(("python3",pid=2310,fd=3))
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.12.3
Content-type: text/html
...
Club Management network demo
```

Giải thích: `ss` cho thấy process `python3` đang giữ port 9000 trên `127.0.0.1`. Câu hỏi: "Nếu mình bind `0.0.0.0` thay vì `127.0.0.1`, cột Local Address sẽ đổi thế nào, và ai khác có thể vào?"

**Bước 5 – Phá có chủ đích để lớp thấy ba loại lỗi.**

```bash
curl http://127.0.0.1:9001/
curl --max-time 3 http://192.0.2.1/
curl http://khong-ton-tai.invalid/
```

Kết quả mong đợi (nội dung chi tiết khác nhẹ tùy phiên bản curl và mạng; `192.0.2.1` thuộc dải TEST-NET-1 dành riêng cho tài liệu nên không ai trả lời, một số mạng có thể báo `Network is unreachable` thay vì timeout):

```text
curl: (7) Failed to connect to 127.0.0.1 port 9001 after 0 ms: Couldn't connect to server
curl: (28) Connection timed out after 3002 milliseconds
curl: (6) Could not resolve host: khong-ton-tai.invalid
```

Câu hỏi chốt: "Ba lỗi này nằm ở tầng nào? Với mỗi lỗi, lệnh nào bạn chạy tiếp theo?"

## Câu hỏi mentor nên hỏi lớp

Các câu hỏi lấy từ demo và ghi chú slide, kèm đáp án để mentor dẫn dắt:

1. Nếu bạn nhận được tin nhắn "Web của em không vào được, API chết rồi anh ơi", câu hỏi đầu tiên bạn hỏi lại là gì? Dẫn tới việc cần mô hình theo tầng.
2. Hai địa chỉ `lo` và `eth0` khác nhau gì về phạm vi truy cập?
3. `192.168.1.10/24` và `192.168.2.10/24` có cùng subnet không? (Không.)
4. Vì sao `nslookup` trả `Non-authoritative answer`? (Câu trả lời từ cache của resolver.)
5. Dòng nào của `curl -v` chứng minh DNS thành công? Dòng nào chứng minh TCP thành công?
6. Nếu bind `0.0.0.0` thì cột Local Address đổi thế nào và ai khác vào được?
7. Nếu máy đích không có process nào lắng nghe port, bước nào thất bại và thấy lỗi gì? (Bước TCP, `Connection refused`.)
8. Ba lỗi `curl` nằm ở tầng nào? Với mỗi lỗi, lệnh tiếp theo bạn chạy là gì?
9. API trong container gọi `localhost:5432` thì chuyện gì xảy ra? (`localhost` là chính container API, không có PostgreSQL ở đó.)
10. Vì sao `ping 1.1.1.1` thành công không chứng minh `curl https://github.com` sẽ thành công? (Còn DNS, TCP 443, TLS, HTTP.)

## Thử thách tại lớp

Cho 3 phút thảo luận theo cặp, liên hệ Buổi 11 về Docker network.

- API trong container báo không kết nối được PostgreSQL, biến `DB_HOST=localhost`.
- Mở `http://localhost:8080/health` nhưng nhận trang frontend thay vì JSON.
- Hai tình huống này gợi ý lỗi ở tầng nào và sửa thế nào?

Gợi ý: `localhost` trong container là chính container. Nginx chỉ chuyển tiếp đường dẫn bắt đầu bằng `/api/`.

Đáp án: đặt `DB_HOST` bằng tên service `postgres`. `/health` không khớp `/api/` nên rơi vào `location /` trả `index.html`; gọi API trực tiếp ở cổng 3000 hoặc dùng `/api/members`.

## Ghi chú giảng viên theo slide

- **Slide 1 – Mục tiêu buổi học.** Mở đầu 2 phút. Nói rõ: cuối buổi mỗi bạn có một quy trình chẩn đoán "không vào được" theo tầng, thay vì restart lung tung.
- **Slide 2 – Vấn đề thực tế.** Hỏi lớp: nếu bạn nhận được tin nhắn này, câu hỏi đầu tiên bạn hỏi lại là gì? Dẫn tới việc cần mô hình theo tầng. 2 phút.
- **Slide 3 – IP, subnet.** Ví dụ nhanh: 192.168.1.10/24 và 192.168.2.10/24 có cùng subnet không? (Không.) 3 phút.
- **Slide 4 – DNS.** Hỏi: vì sao nslookup trả Non-authoritative answer? (Câu trả lời từ cache của resolver.) 3 phút.
- **Slide 5 – TCP, port và HTTP.** Nhấn mạnh: process thứ hai bind cùng port sẽ gặp Address already in use, sẽ làm ở lab. 3 phút.
- **Slide 6 – Bind address và reverse proxy.** Đây là kiến thức nối sang Docker và Compose. Hỏi: API trong container gọi localhost:5432 thì chuyện gì xảy ra? 3 phút.
- **Slide 7 – Một request đi qua những bước nào.** Đi từng bước 3 phút. Hỏi: nếu máy đích không có process nào lắng nghe port, bước nào thất bại và thấy lỗi gì?
- **Slide 8 – Quy trình chẩn đoán từ dưới lên.** Sơ đồ trọng tâm, chụp ảnh lại để làm cheat sheet. Cuối buổi quay lại sơ đồ này để lớp tự điền lệnh cho từng nhánh. 3 phút.
- **Slide 9 – Demo IP và DNS.** IP thực tế của example.com có thể khác. Hỏi: hai địa chỉ lo và eth0 khác nhau gì về phạm vi truy cập? 3 phút.
- **Slide 10 – Demo curl -v.** Phiên bản curl khác nhau in hơi khác, không sao. Với HTTPS có thêm dòng SSL connection using. 4 phút.
- **Slide 11 – Demo server cục bộ và ss.** Hỏi: nếu bind 0.0.0.0 thì cột Local Address đổi thế nào và ai khác vào được? 4 phút.
- **Slide 12 – Demo ba loại lỗi kết nối.** 192.0.2.1 thuộc dải TEST-NET-1 dành cho tài liệu nên không ai trả lời; một số mạng báo Network is unreachable. Hỏi: với mỗi lỗi, lệnh tiếp theo bạn chạy là gì? 3 phút.
- **Lab – Chuẩn bị và tầng IP.** Lab 60 phút: Phần 1 đến 3 khoảng 25 phút. Nhắc dùng `tee -a`. Nếu thiếu lệnh, cài `sudo apt install -y dnsutils iputils-ping`.
- **Lab – Tầng DNS và HTTP.** Số liệu thời gian khác nhau theo mạng. Gợi ý thêm: `getent hosts localhost` đi qua cơ chế phân giải của hệ điều hành, khác nslookup. 8 phút.
- **Lab – Tầng port và xung đột port.** Cho học viên tự gây lỗi trước, rồi mới hướng dẫn tìm PID. Với Docker, lỗi tương ứng là port is already allocated. 10 phút.
- **Lab L1 và L2.** Server Python phải đang chạy ở terminal khác khi làm thử thách C. Thử thách D cần Docker Desktop và `.env` giả, nhớ `docker compose down` sau khi xong và không commit `.env`.
- **Lỗi thường gặp.** Hỏi: vì sao ping 1.1.1.1 thành công không chứng minh curl https://github.com sẽ thành công? (Còn DNS, TCP 443, TLS, HTTP.)
- **Phá lỗi – Port đã được sử dụng.** Trong lệnh, PID là chỗ học viên thay bằng số thật. Trên Windows, chương trình phía Windows cũng có thể giữ port mà ss trong WSL không thấy. 4 phút.
- **Thử thách tại lớp.** Cho 3 phút thảo luận theo cặp. Liên hệ Buổi 11 về Docker network.
- **Recap.** Cho lớp tự vẽ lại sơ đồ chẩn đoán từ trí nhớ trong 1 phút. Buổi sau: Git và GitHub Workflow.

## Lưu ý riêng cho người dạy

- Lab dùng `~/devops-labs` trong WSL; nhắc học viên không làm trong `/mnt/c`.
- Khi học viên bind `0.0.0.0` và mở `http://localhost:9000/` từ trình duyệt Windows được hay không là do tính năng chuyển tiếp localhost của WSL2; không được thì ghi nhận chứ không coi là lỗi.
- Nhắc dọn server Python sau lab (`ss -ltnp` không còn port 9000), vì đây là lỗi hay bị trừ điểm.
