# Bài tập tuần 4 – Docker Basics

> **Tóm tắt:** Nộp lại bằng chứng của hai bài lab tuần 4: chạy, kiểm tra, debug, dọn container bằng Docker CLI và đẩy một image lên registry cục bộ. Mọi kết quả phải kiểm chứng được qua lệnh, log và `docker inspect`, không chỉ ảnh chụp màn hình.

**Phạm vi:** [Buổi 07 – Container Fundamentals](../../labs/week-04/session-07.md) và [Buổi 08 – Docker CLI](../../labs/week-04/session-08.md). Hub tuần: [Tuần 04 – Docker Basics](../../labs/week-04/README.md). Bài nộp nằm ở hai thư mục `lab-07/` và `lab-08/` trong repo cá nhân `devops-labs`.

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Chỉ có một việc thêm ngoài lab: trả lời 5 câu hỏi kiểm tra ở cuối trang (khoảng 20 phút) vào `lab-08/report.md`.

## Nhiệm vụ L1 (bắt buộc)

| Nhiệm vụ | Làm ở phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Kiểm tra môi trường Docker | Buổi 07, Phần 1 | 0,25 giờ | Khối `Client:` và `Server:`, dòng `Hello from Docker!`, hai dòng `uname -r` (host và Alpine) giống nhau; 2 đến 3 câu giải thích trong `lab-07/README.md` |
| 2. Nginx với port mapping và bind mount | Buổi 07, Phần 2 và 3 | 0,5 giờ | `curl` trả đúng trang có họ tên hoặc MSSV; `docker logs` có dòng access của request đó; `ls` thấy `index.html`; `Mounts` có `"RW":false`; thử nghiệm file tạm biến mất sau khi xóa container; `source/commands.sh` có lệnh `docker run` |
| 3. Vòng đời container và `inspect` | Buổi 08, Phần 1 và 2 | 0,5 giờ | `inspect` có `running` rồi `exited` kèm `exit=0`; `curl` `200` trước khi dừng và sau khi chạy lại; thông báo lỗi của `docker rm` trên container đang chạy rồi `rm -f`; container `--rm` không còn trong `docker ps -a`; `lab-08/README.md` giải thích `stop`, `rm`, `image rm` |
| 4. Biến môi trường và container thoát ngay | Buổi 08, Phần 3 | 0,5 giờ | `docker ps -a` hiện `Exited` mã khác 0 kèm log giải thích; `pg_isready` báo `accepting connections` và kết quả `SELECT`; `inspect` đã lọc, không lộ mật khẩu; `lab-08/README.md` nêu nguyên nhân gốc và cách xác minh |
| 5. Đẩy image lên registry cục bộ | Buổi 08, Phần 4 | 0,25 giờ | `push` kết thúc bằng `digest: sha256:...`; `curl` catalog có `club/nginx`; `curl` tags/list có `1.27-alpine`; cuối cùng `docker ps -a --filter name=lab0` chỉ còn dòng tiêu đề (ghi vào evidence) |

Quy ước làm việc:

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Luôn ghim tag image, ví dụ `nginx:1.27-alpine`, `postgres:17-alpine`, `alpine:3.20`, `registry:2.8.3`. Không dùng `latest`.
- Container của bạn có tên bắt đầu bằng `lab07-` hoặc `lab08-` để lọc được bằng `docker ps -a --filter name=lab0`.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.
- Output `docker inspect` phải lọc bằng `--format`; mật khẩu dùng trong lab là giá trị tạm, không phải mật khẩu thật của bạn.

## Nhiệm vụ L2 (tùy chọn, điểm thưởng tối đa 10)

Chỉ làm khi đã xong L1. Mentor chỉ nhận triệu chứng, bạn tự tìm nguyên nhân gốc. Đề và gợi ý ở [Buổi 07 – Thử thách thêm](../../labs/week-04/session-07-challenge.md) và [Buổi 08 – Thử thách thêm](../../labs/week-04/session-08-challenge.md).

| Thử thách | Bằng chứng nộp | Điểm thưởng |
| --- | --- | --- |
| Xung đột cổng, tình huống 01 | Lệnh chỉ ra container và image giữ cổng 28081; chạy trang của bạn trên cổng khác mà không xóa container của người khác khi chưa kiểm tra; báo cáo 5 mục (triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh) trong `lab-08/report.md` | 3 |
| Container thoát ngay, tình huống 02 | ExitCode và log; nguyên nhân chứng minh bằng cách soi bên trong image; `lab-08/source/Dockerfile` đã sửa, `curl http://localhost:28082` trả JSON; báo cáo ghi dòng nào của file nào đã đổi và cách phát hiện sớm | 4 |
| Giới hạn tài nguyên và chi phí khởi động (Buổi 07) | `docker stats --no-stream`, giá trị giới hạn từ `inspect` (byte, quy đổi sang MiB), kết quả `time docker run --rm alpine:3.20 true`; 3 gạch đầu dòng so sánh container với VM trong `lab-07/report.md`, dựa trên số liệu bạn đo | 3 |

## Bảng điểm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần 110).

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: môi trường Docker | 10 |
| Nhiệm vụ 2: Nginx, port, bind mount | 15 |
| Nhiệm vụ 3: vòng đời và inspect | 20 |
| Nhiệm vụ 4: biến môi trường, thoát ngay | 15 |
| Nhiệm vụ 5: registry cục bộ | 10 |
| Chất lượng `README.md` và `report.md` (7 câu theo mẫu, có nguyên nhân gốc) | 10 |
| 5 câu hỏi kiểm tra kiến thức (3 điểm mỗi câu) | 15 |
| Vệ sinh và quy trình (dọn sạch, không secret, PR có reviewer) | 5 |
| L2 (thưởng): thử thách 1 / 2 / 3 | 3 / 4 / 3 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh nếu cần) trong `lab-08/report.md`.

1. Container khác máy ảo ở điểm nào về kernel và cô lập? Vì sao `uname -r` trong container Alpine và trên host WSL cho cùng kết quả?
2. Lệnh `docker run -d -p 9000:80 nginx:1.27-alpine` mở cổng nào trên máy bạn và Nginx nghe cổng nào trong container? Nếu viết nhầm thành `-p 9000:9000` thì triệu chứng là gì và bạn kiểm tra bằng lệnh nào?
3. Bạn chạy `docker run -d --name api club-api:1.0.0` nhưng `docker ps` không thấy gì. Nêu ba lệnh bạn chạy tiếp theo theo thứ tự và mỗi lệnh cho bạn biết điều gì.
4. Dữ liệu ghi bên trong một container mất khi nào, và mất theo cách nào? Hướng khắc phục cho database là gì (chỉ cần nêu tên cơ chế, bạn sẽ học ở Buổi 12)?
5. Vì sao `docker push ten-ban/club-api:1.0.0` không đẩy tới registry cục bộ cổng 5001? Cần đổi gì? Vì sao không dùng tag `latest` trong bài cần tái lập?

## Cấu trúc thư mục nộp

Theo [mẫu lab](../../templates/lab-template.md), tách làm hai thư mục:

```text
lab-07/
├── README.md              (7 câu theo mẫu, ghi rõ đã làm L1 hay L2)
├── source/
│   ├── index.html
│   └── commands.sh        (lệnh docker run đã dùng)
├── screenshots/
│   └── nginx-8081.png     (chỉ minh họa)
├── evidence/
│   └── command-output.txt
└── report.md              (giải thích kernel, lỗi đã gặp; phần L2 nếu có)
lab-08/
├── README.md
├── source/
│   ├── commands.sh
│   └── Dockerfile         (chỉ khi làm L2 thử thách 2)
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              (5 câu trả lời tuần 4 và báo cáo L2 nếu có)
```

## Quy trình nộp

1. Trong repo `devops-labs`, tạo nhánh mới, ví dụ `week-04`.
2. Thêm hai thư mục `lab-07/` và `lab-08/` theo cấu trúc trên, commit với thông điệp rõ ràng.
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm theo bảng điểm trên PR và để lại nhận xét.
6. **Hạn nộp:** trước buổi đầu tiên của tuần 5.

## Checklist trước khi nộp

- [ ] `lab-07/` và `lab-08/` đúng cấu trúc theo `templates/lab-template.md`
- [ ] `README.md` mỗi thư mục trả lời đủ 7 câu và ghi rõ đã làm L1 hay L2
- [ ] `evidence/command-output.txt` được sinh bằng `tee`, chứa lệnh và output thật của cả 5 nhiệm vụ
- [ ] `source/commands.sh` chạy lại được trên máy sạch (có Docker) và dọn sạch sau khi chạy
- [ ] `lab-08/report.md` có câu trả lời cho 5 câu hỏi kiểm tra
- [ ] Tất cả image dùng tag cố định, không có `latest`
- [ ] `docker ps -a --filter name=lab0` chỉ còn dòng tiêu đề
- [ ] Không commit `.env`, mật khẩu, token, private key, hay output `docker inspect` chưa lọc
- [ ] PR đã được ít nhất một bạn review và bạn đã phản hồi

Những lỗi hay bị trừ điểm và cách mentor chấm nằm ở trang dành cho mentor; bạn không cần đọc trước, chỉ cần làm đúng checklist trên.
