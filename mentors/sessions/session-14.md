# Kịch bản mentor – Buổi 14: Production-minded Compose

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md). Slide: [Slide buổi 14](../../slides/03-compose/session-14.md). Hub tuần: [Tuần 07 – Docker Compose](../../labs/week-07/README.md).
:::

Tuần 7 · Giai đoạn 2 – Containerization · Buổi 14/32

## Khung thời gian buổi (120 phút)

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập buổi 13 | Compose cơ bản, `.env`, `down` so với `down -v` |
| 30 | Kiến thức và demo | Buổi thứ hai của tuần dồn vào thực hành, nên giữ phần này gọn |
| 60 | Thực hành | Phần 1 đến 3 khoảng 30 phút cho L1; Phần 4 đến 6 cùng thử thách L2 khoảng 30 phút |
| 15 | Review | Xem lại bằng chứng, chốt Break -> Debug |

## Demo của mentor

Mục tiêu: cho lớp thấy sự khác nhau giữa "started" và "ready". Dùng `starter-project` nguyên bản (chưa sửa).

1. Mở hai terminal WSL. Ở terminal B, theo dõi trạng thái; ở terminal A, dọn môi trường và chạy lại từ đầu:

   ```bash
   # Terminal B
   cd ~/devops-labs/lab-14/source
   watch -n 1 docker compose ps
   ```

   ```bash
   # Terminal A
   cd ~/devops-labs/lab-14/source
   docker compose down -v
   docker compose up -d --build
   ```

   Kết quả mong đợi (rút gọn): ở terminal B, `postgres` hiện `Up ... (health: starting)` trong vài giây đầu, `backend` và `frontend` chưa xuất hiện (hoặc `Created`) vì backend chờ postgres healthy. Lệnh `up -d` ở terminal A cũng chỉ trả về sau khi postgres healthy và backend đã được start. Nếu chạy `docker compose ps` ngay sau `up -d` trong cùng một terminal, bạn sẽ thấy mọi thứ đã `Up`, nên cần terminal thứ hai để quan sát khoảng chờ.

   Câu hỏi cho lớp: "Vì sao backend chưa chạy dù ta không viết sleep ở đâu cả?"

2. Khi `up -d` đã xong, xem lại ở terminal A (dừng `watch` bằng `Ctrl+C`):

   ```bash
   docker compose ps
   ```

   Kết quả mong đợi: `postgres` `(healthy)`, `backend` và `frontend` `Up`.

3. Xem cấu hình healthcheck thật sự Docker đang dùng:

   ```bash
   docker inspect --format '{{json .State.Health}}' $(docker compose ps -q postgres)
   ```

   Kết quả mong đợi: JSON có `"Status":"healthy"` và danh sách `Log` các lần chạy `pg_isready`.

4. Tạo tình huống DB mất giữa chừng, rồi hỏi lớp dự đoán trước khi chạy:

   ```bash
   docker compose stop postgres
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/health
   curl -s -w "\n%{http_code}\n" http://localhost:3000/ready
   docker compose start postgres
   ```

   Kết quả mong đợi: `/health` trả `200` (tiến trình sống), `/ready` trả `503` với `{"status":"not-ready"}`. Sau khi `start postgres` và chờ healthy, `/ready` trả `200`.

   Điểm chốt: "sống" (liveness) khác "sẵn sàng phục vụ" (readiness). Đây chính là hai loại probe của Kubernetes.

   Lưu ý cho mentor: `db.js` chưa lắng nghe sự kiện `error` của `pg.Pool`. Nếu lúc postgres dừng, pool đang giữ một kết nối nhàn rỗi, tiến trình Node có thể crash và được `restart: unless-stopped` dựng lại (trong thời gian đó `/health` có thể tạm lỗi). Đây là cơ hội để nói về vai trò của restart policy, và là gợi ý cải tiến cho capstone (`pool.on("error", ...)`).

5. Xem restart policy bằng một lần thoát bất thường thật (không dùng `docker compose kill`, vì Docker Engine bản mới coi lệnh kill do người dùng gõ là dừng thủ công và không restart; đã kiểm chứng với 29.x):

   ```bash
   curl -s http://localhost:3000/api/members > /dev/null
   docker compose stop postgres
   sleep 5
   docker compose ps -a backend
   docker compose start postgres
   ```

   Kết quả mong đợi: backend `Up` với thời gian chạy vài giây (Node thoát vì pool nhận lỗi kết nối bị ngắt, rồi `unless-stopped` dựng lại). Lưu ý: `docker compose stop backend` là dừng chủ động nên không tự dậy lại.

## Câu hỏi mentor nên hỏi lớp

"Healthcheck của backend nên gọi `/health` hay `/ready`? Nếu gọi `/ready` thì khi DB chết, backend thành `unhealthy`, frontend có bị ảnh hưởng không?"

Câu hỏi thảo luận theo cặp (3-4 phút, trước khi mở gợi ý):

- Postgres bị restart khi hệ thống đang chạy tốt: frontend và backend có bị Compose khởi động lại không?
- API trả 503 ở `/ready` trong 20 giây đầu rồi tự ổn: có cần sửa không?
- Vì sao container `unhealthy` không tự được Docker restart, và bạn xử lý thế nào?

## Ghi chú giảng viên theo từng slide

Nguyên văn từ bản slide trước khi rút gọn (số slide theo bản cũ, nay nội dung nằm trong [Slide buổi 14](../../slides/03-compose/session-14.md)), trừ chỗ có ghi chú sửa.

- Slide 1 (Mục tiêu): Mở đầu 2 phút. Yêu cầu học viên đã chạy được starter-project từ buổi 13. Nhắc chạy `docker compose down` trong `lab-13/source` trước, vì hai lab cùng tên project `source`.
- Slide 2 (Một buổi demo hỏng): Kể như một câu chuyện thật. Hỏi lớp: bạn đã gặp lỗi kiểu lúc được lúc không chưa? Production-minded không có nghĩa là đưa Compose lên production lớn, mà là tập thói quen vận hành.
- Slide 3 (Started khác ready): Câu hỏi: Postgres chạy rồi, vì sao backend vẫn không kết nối được? Vì còn khởi tạo cluster và chạy `init.sql`.
- Slide 4 (Tham số healthcheck): Nhấn mạnh `start_period` bao trùm thời gian khởi động thật. Phần Break -> Debug sẽ cho thấy điều gì xảy ra khi đặt các giá trị quá ngặt.
- Slide 5 (depends_on với condition): Đây là ý dễ hiểu sai nhất: `depends_on` không phải cơ chế giám sát liên tục. Nối sang `/ready` ở phần demo.
- Slide 6 (Kiến trúc chuỗi khởi động): Đọc sơ đồ theo thứ tự. Lưu ý `pg_isready` có thể báo sẵn sàng sớm trong bước khởi tạo, nên sau `down -v` chờ vài giây trước khi truy vấn.
- Slide 7 (Restart policy): Câu hỏi: `docker compose kill` và `docker compose stop` khác nhau thế nào với restart policy? Ghi chú sửa: bản slide cũ nói `kill` được restart, nhưng với Docker Engine 29.x `kill` do người dùng gõ cũng được coi là dừng thủ công và container nằm ở `Exited (137)`. Hãy dùng thoát bất thường thật (dừng postgres khi pool có kết nối nhàn rỗi) để so sánh với `stop`.
- Slide 8 (Demo sống khác sẵn sàng): Cho lớp dự đoán trước khi chạy. Lưu ý: `db.js` chưa lắng nghe sự kiện `error` của `pg.Pool`; nếu pool đang giữ kết nối nhàn rỗi khi postgres dừng, Node có thể crash rồi được `unless-stopped` dựng lại, và `/health` có thể tạm lỗi. Đây là gợi ý cải tiến cho capstone (`pool.on("error", ...)`).
- Slide 9 (Demo khoảng chờ): Đặt câu hỏi: vì sao backend chưa chạy dù ta không viết sleep? Đáp: `condition: service_healthy`. Xem lịch sử check bằng `docker inspect --format '{{json .State.Health}}' $(docker compose ps -q postgres)`.
- Slide 10 (Healthcheck backend): Câu hỏi mở: healthcheck nên gọi `/health` hay `/ready`? Nếu gọi `/ready` thì khi DB chết backend thành `unhealthy`. Để dành cho thử thách L2 số 1.
- Slide 11 (Healthcheck frontend): Luôn chạy `config --quiet` trước `up` để bắt lỗi thụt lề. Thêm vào đúng service, chú ý thụt lề 4 dấu cách trong khối `services`.
- Slide 12 (Kiểm chứng restart policy): Cho học viên tự so sánh thoát bất thường với `stop`. Nhắc: restart policy không sửa lỗi cấu hình, container lỗi liên tục sẽ lặp vòng khởi động lại. Ghi chú sửa: không dùng `kill` (xem slide 7).
- Slide 13 (Resource limits và log rotation): Giải thích: không đặt giới hạn thì một container rò bộ nhớ có thể kéo sập cả WSL2. Gợi ý giá trị: 256M cho backend và frontend, 512M cho postgres.
- Slide 14 (Kiểm tra limit): Nhấn mạnh tinh thần Break -> Debug: tin vào `inspect`, không tin vào file YAML. Số hiển thị có thể khác nhẹ tùy phiên bản.
- Slide 15 (Secrets cho Postgres): Nói rõ giới hạn: mật khẩu chỉ áp dụng khi volume trống; ứng dụng phải biết đọc file; file trên host vẫn phải được bảo vệ. Kiểm chứng: `POSTGRES_PASSWORD=[]` trong env của postgres, API vẫn trả dữ liệu.
- Slide 16 (Backup bằng pg_dump): Hỏi: vì sao xóa nhầm volume là mất hết dù đã có volume? Vì volume là bản duy nhất. Nhắc không commit file backup chứa dữ liệu nhạy cảm.
- Slide 17 (Restore và kiểm chứng): Backup chưa từng restore thử thì chưa phải backup. Phần restore vào `clubdb` đang phục vụ API (có `DROP TABLE members` trước) để học viên tự làm trong lab. Lỗi `relation already exists` là do nạp dump vào database đã có bảng.
- Slide 18 (Lab L1 và L2): Lab 60 phút: L1 khoảng 30 phút, L2 khoảng 30 phút. Gợi ý: `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' ID`; trong `backup.sh` dùng `ls -1t clubdb-*.sql | tail -n +6 | xargs -r rm --` để giữ 5 bản.
- Slide 19 (Lỗi thường gặp): Chọn các dòng phù hợp lớp. Nhấn mạnh: không bao giờ publish `5432:5432` nếu không cần.
- Slide 20 (Break và Debug): Cho học viên tự điều tra trước khi mở đáp án. Phòng tránh: chạy tay lệnh check trước khi đưa vào YAML; `start_period` bao trùm thời gian khởi động; `timeout` lớn hơn thời gian phản hồi bình thường vài lần. Bài nộp `report.md` mô tả tình huống này. Gợi ý thêm: scenario-03 và scenario-04 trong `examples/troubleshooting/`.
- Slide 21 (Thử thách): Cho thảo luận theo cặp 3-4 phút. Liên hệ: ở Kubernetes liveness probe sẽ restart container unhealthy.
- Slide 22 (Recap): Nhắc nộp bài vào `lab-14/`: `compose.yaml` đã sửa, evidence gồm `ps`, Health Log, `stats`, backup và restore, và `report.md`. Không commit `.env`, `secrets/`, file backup.

## Lưu ý riêng cho người dạy

- Trong bài học viên, phần "Demo của mentor" chỉ còn một dòng: "Trên lớp, mentor demo trước; tự học thì làm thẳng phần Làm lab." Hãy demo theo kịch bản trên rồi mới cho học viên làm lab.
- Hai lab cùng tên thư mục `source` nên cùng tên project Compose; kiểm tra học viên đã `docker compose down` ở `lab-13/source` để tránh xung đột container và volume.
- Docker 29.x: `docker compose kill` không kích hoạt restart (đã kiểm chứng). Thử thách và Phần 3 của lab dùng cách dừng postgres khi pool có kết nối nhàn rỗi.
- Lời giải đầy đủ L2 (thử thách 1-4, OOM, `backup.sh`, secret cho backend) nằm ở [Walkthrough tuần 7](../walkthroughs/week-07.md). Barem và vấn đáp: [Chấm bài tuần 7](../grading/week-07.md).
