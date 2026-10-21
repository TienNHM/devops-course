# Bài tập tuần 4 – Docker Basics

> **Tóm tắt:** Chạy, kiểm tra, debug và dọn dẹp container bằng Docker CLI, đẩy một image lên registry cục bộ, rồi viết báo cáo điều tra hai lỗi kinh điển (cổng bận, container thoát ngay). Mọi kết quả phải kiểm chứng được qua lệnh, log và `docker inspect`, không chỉ ảnh chụp màn hình.

**Phạm vi:** [Buổi 07 – Container Fundamentals](../../labs/week-04/session-07.md) và [Buổi 08 – Docker CLI](../../labs/week-04/session-08.md). Bài nộp nằm ở hai thư mục `lab-07/` và `lab-08/` trong repository cá nhân.

## Bối cảnh

Từ Buổi 09 bạn sẽ đóng gói chính ứng dụng Club Management (backend, frontend, database) thành image. Trước đó, mentor cần chắc rằng bạn đã dùng Docker CLI đủ vững để tự trả lời các câu hỏi vận hành cơ bản: container nào đang chạy, chạy từ image nào, đang in log gì, nghe cổng nào, thoát với mã lỗi bao nhiêu và vì sao.

Bài tập tuần này mô phỏng một ngày làm việc của người vận hành: dựng một web server tĩnh, chạy một database mẫu, đẩy image lên registry nội bộ của CLB, rồi xử lý hai sự cố do "đồng nghiệp" để lại. Bạn chỉ cần dùng kiến thức của Buổi 07 và 08.

Quy ước làm việc:

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Luôn ghim tag image, ví dụ `nginx:1.27-alpine`, `postgres:17-alpine`, `alpine:3.20`, `registry:2.8.3`. Không dùng `latest`.
- Mọi container do bạn tạo trong bài tập có tên bắt đầu bằng `lab07-` hoặc `lab08-` để mentor lọc được bằng `docker ps -a --filter name=lab0`.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Kiểm tra môi trường Docker

Chứng minh Docker Desktop (WSL2 backend) hoạt động và hiểu client khác daemon.

Yêu cầu:

- Chạy `docker version`, `docker info` và `docker run --rm hello-world` trong WSL.
- Chạy `uname -r` trên host và trong một container `alpine:3.20`.

Tiêu chí hoàn thành:

- [ ] `lab-07/evidence/command-output.txt` có đủ khối `Client:` và `Server:`, dòng `Hello from Docker!`.
- [ ] Hai dòng `uname -r` (host và container) có trong evidence và giống nhau.
- [ ] `lab-07/README.md` giải thích bằng 2 đến 3 câu vì sao hai kết quả giống nhau.

### Nhiệm vụ 2. Nginx với port mapping và bind mount

Chạy một web server phục vụ trang HTML riêng của bạn.

Yêu cầu:

- Tạo `lab-07/source/index.html` có nội dung chứa họ tên hoặc MSSV của bạn.
- Chạy container tên `lab07-web` từ `nginx:1.27-alpine`, ở chế độ nền, publish cổng host 8081 vào cổng 80, mount file `index.html` ở chế độ chỉ đọc.
- Ghi lệnh `docker run` chính xác bạn đã dùng vào `lab-07/source/commands.sh`.

Tiêu chí hoàn thành:

- [ ] `curl -s http://localhost:8081` trong evidence trả đúng nội dung trang của bạn.
- [ ] Evidence có output `docker logs lab07-web` chứa ít nhất một dòng access log của request `curl` ở trên.
- [ ] Evidence có output `docker exec lab07-web ls /usr/share/nginx/html` và `docker inspect` của container cho thấy mount ở chế độ chỉ đọc (lọc phần `Mounts`, ví dụ bằng `--format`).
- [ ] Đã chứng minh dữ liệu ghi trong container là tạm thời: tạo một file trong container, xóa container, tạo lại và file không còn (ghi lệnh và output).

### Nhiệm vụ 3. Vòng đời container và `docker inspect`

Điều khiển container qua đủ các trạng thái và đọc trạng thái từ nguồn sự thật.

Yêu cầu:

- Chạy `lab08-web` từ `nginx:1.27-alpine` trên cổng host 8088 (nền, có `--name`).
- Dùng `docker inspect --format` để in ra trạng thái, thời điểm bắt đầu và địa chỉ IP nội bộ của container.
- Dừng container, in ExitCode và trạng thái trong `docker ps -a`, chạy lại, xác nhận bằng `curl`.
- Thử `docker rm` khi container đang chạy, ghi lại thông báo lỗi, sau đó xóa đúng cách.
- Chạy một container dùng một lần bằng `--rm` và chứng minh nó tự biến mất.

Tiêu chí hoàn thành:

- [ ] Evidence có output `inspect` với `running`, sau đó `exited` cùng `exit=0` (hoặc giá trị bạn quan sát được, kèm giải thích nếu khác 0).
- [ ] Evidence có thông báo lỗi của `docker rm` trên container đang chạy và lệnh xóa thành công ngay sau đó.
- [ ] Evidence có `curl` trả mã `200` trước khi dừng và sau khi chạy lại.
- [ ] Evidence chứng minh container `--rm` không còn trong `docker ps -a`.
- [ ] `lab-08/README.md` giải thích khác biệt giữa `docker stop`, `docker rm` và `docker image rm` bằng lời của bạn.

### Nhiệm vụ 4. Biến môi trường và container thoát ngay

Chạy PostgreSQL mẫu để thấy container sống hay chết theo tiến trình chính.

Yêu cầu:

- Chạy `postgres:17-alpine` tên `lab08-pg` mà chưa cấu hình gì, quan sát nó, rồi thu thập bằng chứng về trạng thái và lý do (không đoán).
- Dọn container thất bại, chạy lại với cấu hình đúng, đợi database sẵn sàng và chạy `pg_isready` cùng một câu `SELECT` qua `docker exec`.
- Lọc `docker inspect` để chỉ hiển thị biến `POSTGRES_DB`.

Tiêu chí hoàn thành:

- [ ] Evidence có `docker ps -a` cho thấy trạng thái `Exited` với mã khác 0 và log giải thích nguyên nhân.
- [ ] Evidence có `pg_isready` báo `accepting connections` và kết quả truy vấn.
- [ ] Mật khẩu dùng là giá trị tạm của riêng bài tập, không phải mật khẩu thật của bạn; output `inspect` trong evidence đã được lọc, không lộ biến chứa mật khẩu.
- [ ] `lab-08/README.md` nêu nguyên nhân gốc và cách bạn xác minh nguyên nhân đó.

### Nhiệm vụ 5. Đẩy image lên registry cục bộ

Làm quen cơ chế `tag` và `push` mà các buổi CI/CD sau sẽ dùng với GHCR.

Yêu cầu:

- Chạy `registry:2.8.3` tên `lab08-registry` publish cổng host 5001 vào cổng 5000.
- Pull `nginx:1.27-alpine`, tag thành `localhost:5001/club/nginx:1.27-alpine`, push.
- Dùng `curl` để liệt kê catalog và danh sách tag trong registry.
- Xóa bản cục bộ của image đã tag và pull lại từ registry của bạn.

Tiêu chí hoàn thành:

- [ ] Evidence có output `push` kết thúc bằng dòng `digest: sha256:...`.
- [ ] Evidence có kết quả `curl` của `/v2/_catalog` chứa `club/nginx` và của `/v2/club/nginx/tags/list` chứa `1.27-alpine`.
- [ ] Evidence có lần pull lại thành công từ `localhost:5001`.
- [ ] Sau khi xong, tất cả container `lab07-*` và `lab08-*` đã được xóa: `docker ps -a --filter name=lab0` chỉ còn dòng tiêu đề (ghi vào evidence).

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 tính điểm thưởng tối đa 10. Chỉ làm khi đã hoàn thành L1. Mentor chỉ nhận triệu chứng, bạn phải tự tìm nguyên nhân gốc.

### Thử thách 1. Điều tra xung đột cổng (tình huống 01)

Clone repo giáo trình vào filesystem WSL, chạy `setup.sh` của `examples/troubleshooting/scenario-01` theo hướng dẫn trong README của tình huống đó, rồi điều tra.

Tiêu chí hoàn thành:

- [ ] Chỉ ra bằng lệnh container nào, từ image nào, đang giữ cổng 28081 (output nằm trong evidence).
- [ ] Chạy được trang của bạn trên cổng khác mà không xóa container của "người khác" khi chưa kiểm tra.
- [ ] `lab-08/report.md` có mục báo cáo 5 phần: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.

### Thử thách 2. Sửa container thoát ngay (tình huống 02)

Chạy `setup.sh` của `examples/troubleshooting/scenario-02` rồi điều tra theo triệu chứng.

Tiêu chí hoàn thành:

- [ ] Lấy được ExitCode và log của container đã thoát (evidence).
- [ ] Chứng minh nguyên nhân gốc bằng cách soi bên trong image, không phải bằng cách đoán.
- [ ] `lab-08/source/Dockerfile` là bản đã sửa; build và chạy lại được, `curl http://localhost:28082` trả JSON (evidence).
- [ ] `lab-08/report.md` ghi rõ dòng nào của file nào đã đổi, và cách phát hiện lỗi này sớm hơn (smoke test sau khi build).

### Thử thách 3. Giới hạn tài nguyên và chi phí khởi động

Chạy Nginx với giới hạn bộ nhớ 64 MB và 0.5 CPU, tên `lab07-limit`, cổng host 8082.

Tiêu chí hoàn thành:

- [ ] Evidence có `docker stats --no-stream` và giá trị giới hạn bộ nhớ lấy từ `docker inspect` (đơn vị byte), kèm phép quy đổi sang MiB trong report.
- [ ] Evidence có kết quả đo `time docker run --rm alpine:3.20 true` khi image đã có sẵn.
- [ ] `lab-07/report.md` có 3 gạch đầu dòng so sánh container với VM về RAM cấp trước, thời gian khởi động và mức cô lập, dựa trên số liệu bạn vừa đo.

## Bằng chứng cần nộp

Cấu trúc theo [templates/lab-template.md](../../templates/lab-template.md), tách làm hai thư mục:

```text
lab-07/
├── README.md              (7 câu theo template, ghi rõ đã làm L1 hay L2)
├── source/
│   ├── index.html
│   └── commands.sh        (lệnh docker run đã dùng)
├── screenshots/
│   └── nginx-8081.png     (chỉ minh họa)
├── evidence/
│   └── command-output.txt
└── report.md              (câu hỏi kiểm tra; phần L2 nếu có)
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

Evidence cụ thể theo nhiệm vụ:

| Nhiệm vụ | Evidence bắt buộc trong `command-output.txt` |
| --- | --- |
| 1 | `docker version`, `docker info` (rút gọn được), `hello-world`, hai dòng `uname -r` |
| 2 | `docker run`, `curl`, `docker logs`, `docker exec ls`, `inspect` phần Mounts, thử nghiệm file tạm |
| 3 | `inspect --format`, `stop`, `docker ps -a`, lỗi `docker rm`, `rm -f`, container `--rm` |
| 4 | `docker ps -a` và `docker logs` của lần thất bại, `pg_isready`, truy vấn `SELECT`, `inspect` đã lọc |
| 5 | `push`, hai lệnh `curl` vào registry, pull lại, kiểm tra dọn dẹp |
| L2 | Output mà từng tiêu chí L2 yêu cầu |

Mentor kiểm chứng bằng cách đọc evidence, chạy lại `commands.sh` trên máy mentor và đối chiếu với trạng thái thật trên máy bạn (ví dụ `docker image ls`, `docker ps -a`). Output giống hệt bài của bạn khác, hoặc có dấu hiệu bị chỉnh tay, sẽ bị hỏi lại trực tiếp.

## Barem chấm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110).

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: môi trường Docker | Đủ output, giải thích đúng kernel dùng chung | Thiếu Server hoặc giải thích sai | 10 |
| Nhiệm vụ 2: Nginx, port, bind mount | `curl` đúng trang, có log, có Mounts chỉ đọc, chứng minh dữ liệu tạm | Thiếu một trong các bằng chứng | 15 |
| Nhiệm vụ 3: vòng đời và inspect | Đủ chuỗi run, stop, start, rm lỗi, rm -f, `--rm` với output thật | Thiếu bước hoặc không có thông báo lỗi `rm` | 20 |
| Nhiệm vụ 4: biến môi trường, thoát ngay | Có cả lần thất bại (kèm nguyên nhân từ log) và lần thành công; inspect đã lọc | Không có bằng chứng thất bại, hoặc lộ mật khẩu | 15 |
| Nhiệm vụ 5: registry cục bộ | Push, catalog, tags, pull lại đều có | Tên image thiếu địa chỉ registry hoặc thiếu bằng chứng | 10 |
| Chất lượng `README.md` và `report.md` | 7 câu theo template, ngắn gọn, đúng, có nguyên nhân gốc | Sao chép đề bài, trả lời chung chung | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng ý và có ví dụ lệnh khi cần (3 điểm mỗi câu) | Sai hoặc bỏ trống | 15 |
| Vệ sinh và quy trình | Dọn sạch tài nguyên, không có secret, PR đúng quy trình, có reviewer | Còn container `lab0*`, commit `.env` hoặc secret, thiếu review | 5 |
| L2 thử thách 1 (thưởng) | Xác định đúng thủ phạm, không xóa bừa, đủ báo cáo 5 phần | Thiếu bằng chứng hoặc xóa trước khi kiểm tra | 3 |
| L2 thử thách 2 (thưởng) | Có Dockerfile đã sửa, chạy được, nguyên nhân chứng minh từ bên trong image | Chỉ nêu kết luận, không có bằng chứng | 4 |
| L2 thử thách 3 (thưởng) | Số liệu đo thật, quy đổi đúng, so sánh dựa trên số liệu | Số liệu lấy từ bài giảng hoặc không đo | 3 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh nếu cần) trong `lab-08/report.md`.

1. Container khác máy ảo ở điểm nào về kernel và cô lập? Vì sao `uname -r` trong container Alpine và trên host WSL cho cùng kết quả?
2. Lệnh `docker run -d -p 9000:80 nginx:1.27-alpine` mở cổng nào trên máy bạn và Nginx nghe cổng nào trong container? Nếu viết nhầm thành `-p 9000:9000` thì triệu chứng là gì và bạn kiểm tra bằng lệnh nào?
3. Bạn chạy `docker run -d --name api club-api:1.0.0` nhưng `docker ps` không thấy gì. Nêu ba lệnh bạn chạy tiếp theo theo thứ tự và mỗi lệnh cho bạn biết điều gì.
4. Dữ liệu ghi bên trong một container mất khi nào, và mất theo cách nào? Hướng khắc phục cho database là gì (chỉ cần nêu tên cơ chế, bạn sẽ học ở Buổi 12)?
5. Vì sao `docker push ten-ban/club-api:1.0.0` không đẩy tới registry cục bộ cổng 5001? Cần đổi gì? Vì sao không dùng tag `latest` trong bài cần tái lập?

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình thay cho output lệnh, hoặc evidence không có lệnh đi kèm.
- Làm trong `/mnt/c` hoặc chạy lệnh trên PowerShell nhưng ghi là WSL.
- Dùng `latest` hoặc không ghi tag image.
- Quên `-d` nên terminal bị chiếm, hoặc quên `--name` nên tên container ngẫu nhiên khó tra cứu.
- Dán nguyên output `docker inspect` chứa biến môi trường nhạy cảm, hoặc commit `.env`, mật khẩu, token.
- Để sót container, image tạm hoặc registry `lab0*` sau khi nộp.
- Chỉ mô tả "đã sửa được" mà không nêu nguyên nhân gốc và cách xác minh.
- Xóa hoặc dừng container không phải của mình khi chưa kiểm tra chủ sở hữu (L2 thử thách 1).
- Gán cổng host đã bận rồi bỏ qua lỗi thay vì điều tra (xem [tình huống 01](../../examples/troubleshooting/scenario-01/README.md)).
- Sửa tay file evidence cho "đẹp" hơn thực tế.

## Quy trình nộp

1. Trong repository cá nhân (ví dụ `devops-labs`), tạo nhánh mới, ví dụ `week-04`.
2. Thêm hai thư mục `lab-07/` và `lab-08/` theo cấu trúc ở trên, commit với thông điệp rõ ràng.
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm theo barem trên PR và để lại nhận xét.
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
- [ ] Nếu làm L2: báo cáo 5 phần của thử thách 1 và 2, số liệu đo của thử thách 3
- [ ] PR đã được ít nhất một bạn review và bạn đã phản hồi
