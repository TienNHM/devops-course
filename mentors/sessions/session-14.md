# Kịch bản buổi 14: Production-minded Compose

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md). Slide: [Slide buổi 14](../../slides/03-compose/session-14.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 7](../grading/week-07.md). Đáp án: [Đáp án tuần 7](../walkthroughs/week-07.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 14 trong 120 phút: khung thời gian, demo 5 bước về "started" và "ready", câu hỏi cho lớp, ghi chú theo 14 slide và lưu ý về restart policy trên Docker 29.x.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập Buổi 13 | Compose cơ bản, `.env`, `down` so với `down -v` |
| 30 | Kiến thức và demo: Slide 1 đến 8 | Buổi thứ hai của tuần dồn vào thực hành, nên giữ phần này gọn |
| 60 | Thực hành: lab L1 | Chuẩn bị 5', Phần 1 10', Phần 2 15', Phần 3 15', Phần 4 15'; L2 (limits, secrets, backup) làm ở nhà |
| 15 | Review: Slide 12 đến 14 | Xem lại bằng chứng, chốt Break -> Debug |

## Kịch bản demo (Slide 8)

Mục tiêu: cho lớp thấy sự khác nhau giữa "started" và "ready". Dùng `starter-project` nguyên bản (chưa sửa), chép ra thư mục riêng:

```bash
cp -r ~/devops-course/starter-project ~/demo-14 && cd ~/demo-14 && cp .env.example .env
```

Bản `starter-project` đã có healthcheck cho postgres và `depends_on` điều kiện cho backend.

1. Mở hai terminal WSL. Ở terminal B, theo dõi trạng thái; ở terminal A, dọn môi trường và chạy lại từ đầu:

   ```bash
   # Terminal B
   cd ~/demo-14
   watch -n 1 docker compose ps
   ```

   ```bash
   # Terminal A
   cd ~/demo-14
   docker compose down -v
   docker compose up -d --build
   ```

   Kết quả mong đợi (rút gọn): ở terminal B, `postgres` hiện `Up ... (health: starting)` trong vài giây đầu, `backend` và `frontend` chưa xuất hiện (hoặc `Created`) vì backend chờ postgres healthy. Lệnh `up -d` ở terminal A cũng chỉ trả về sau khi postgres healthy và backend đã được start. Nếu chạy `docker compose ps` ngay sau `up -d` trong cùng một terminal, bạn sẽ thấy mọi thứ đã `Up`, nên cần terminal thứ hai để quan sát khoảng chờ.

   Câu hỏi cho lớp: "Vì sao backend chưa chạy dù ta không viết sleep ở đâu cả?" Đáp: `condition: service_healthy`.

2. Khi `up -d` đã xong, xem lại ở terminal A (dừng `watch` bằng `Ctrl+C`):

   ```bash
   docker compose ps
   ```

   Kết quả mong đợi: `postgres` `(healthy)`, `backend` và `frontend` `Up`.

3. Xem lịch sử healthcheck thật sự Docker đang chạy:

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

5. Xem restart policy bằng một lần thoát bất thường thật. Không dùng `docker compose kill`: Docker Engine bản mới coi lệnh kill do người dùng gõ là dừng thủ công và không restart (đã kiểm chứng với 29.x).

   ```bash
   curl -s http://localhost:3000/api/members > /dev/null
   docker compose stop postgres
   sleep 5
   docker compose ps -a backend
   docker compose start postgres
   ```

   Kết quả mong đợi: backend `Up` với thời gian chạy vài giây (Node thoát vì pool nhận lỗi kết nối bị ngắt, rồi `unless-stopped` dựng lại). Lưu ý: `docker compose stop backend` là dừng chủ động nên không tự dậy lại.

Dọn dẹp demo: `docker compose down -v`.

## Câu hỏi cho lớp

- "Vì sao backend chưa chạy dù ta không viết sleep ở đâu cả?" (Slide 8)
- "Healthcheck của backend nên gọi `/health` hay `/ready`? Nếu gọi `/ready` thì khi DB chết, backend thành `unhealthy`, frontend có bị ảnh hưởng không?"
- "`docker compose kill` và `docker compose stop` khác nhau thế nào với restart policy?" (Slide 7)

Câu hỏi thảo luận theo cặp (3 đến 4 phút, ở Slide 13, trước khi mở gợi ý):

- Postgres bị restart khi hệ thống đang chạy tốt: frontend và backend có bị Compose khởi động lại không?
- API trả 503 ở `/ready` trong 20 giây đầu rồi tự ổn: có cần sửa không?
- Vì sao container `unhealthy` không tự được Docker restart, và bạn xử lý thế nào?

## Ghi chú theo slide

Slide buổi 14 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Yêu cầu học viên đã chạy được `starter-project` từ Buổi 13. Nhắc chạy `docker compose down` trong `lab-13/source` trước, vì hai lab cùng tên project `source`.
2. **Một buổi demo hỏng (2 phút).** Kể như một câu chuyện thật. Hỏi lớp: bạn đã gặp lỗi kiểu lúc được lúc không chưa? Production-minded không có nghĩa là đưa Compose lên production lớn, mà là tập thói quen vận hành.
3. **Started khác ready (2 phút).** Câu hỏi: Postgres chạy rồi, vì sao backend vẫn không kết nối được? Vì còn khởi tạo cluster và chạy `init.sql`.
4. **Các tham số của healthcheck (2 phút).** Nhấn mạnh `start_period` bao trùm thời gian khởi động thật. Phần Break -> Debug sẽ cho thấy điều gì xảy ra khi đặt các giá trị quá ngặt.
5. **`depends_on` với condition (2 phút).** Ý dễ hiểu sai nhất: `depends_on` không phải cơ chế giám sát liên tục, chỉ tác động lúc `up`. Nối sang `/ready` ở phần demo.
6. **Kiến trúc chuỗi khởi động (1 phút).** Đọc sơ đồ theo thứ tự. Lưu ý `pg_isready` có thể báo sẵn sàng sớm trong bước khởi tạo, nên sau `down -v` chờ vài giây trước khi truy vấn.
7. **Restart policy (3 phút).** Câu hỏi: `docker compose kill` và `docker compose stop` khác nhau thế nào? Với Docker Engine 29.x, `kill` do người dùng gõ cũng được coi là dừng thủ công và container nằm ở `Exited (137)`. Dùng thoát bất thường thật (dừng postgres khi pool có kết nối nhàn rỗi) để so sánh với `stop`.
8. **Demo: sống khác sẵn sàng (10 phút).** Chạy demo 5 bước ở trên; cho lớp dự đoán trước khi chạy bước 4.
9. **Viết healthcheck cho backend và frontend (5 phút, mở đầu lab).** Luôn chạy `config --quiet` trước `up` để bắt lỗi thụt lề. Thêm vào đúng service, chú ý thụt lề 4 dấu cách trong khối `services`. Healthcheck dùng `127.0.0.1`, không dùng `localhost`.
10. **Resource limits và log rotation (L2).** Giải thích: không đặt giới hạn thì một container rò bộ nhớ có thể kéo sập cả WSL2. Gợi ý giá trị: 256M cho backend và frontend, 512M cho postgres. Nhấn mạnh tinh thần Break -> Debug: tin vào `inspect`, không tin vào file YAML.
11. **Secrets và backup (L2).** Nói rõ giới hạn của secret: mật khẩu chỉ áp dụng khi volume trống; ứng dụng phải biết đọc file; file trên host vẫn phải được bảo vệ. Backup chưa từng restore thử thì chưa phải backup. Hỏi: vì sao xóa nhầm volume là mất hết dù đã có volume? Vì volume là bản duy nhất. Nhắc không commit file backup chứa dữ liệu nhạy cảm.
12. **Break và Debug: healthcheck quá ngặt (Phần 4, khoảng 10 phút).** Cho học viên tự điều tra trước khi mở đáp án. Phòng tránh: chạy tay lệnh check trước khi đưa vào YAML; `start_period` bao trùm thời gian khởi động; `timeout` lớn hơn thời gian phản hồi bình thường vài lần. Bài nộp `report.md` mô tả tình huống này. Gợi ý thêm: scenario-03 và scenario-04 trong `examples/troubleshooting/`.
13. **Lab và thử thách (60 phút lab).** Điểm cần nhấn ở từng phần: Phần 1 quan sát `(health: starting)` bằng `watch`; Phần 2 kiểm tra cả ba service `(healthy)`; Phần 3 dùng thoát bất thường thật, không dùng `kill`; Phần 4 trả cấu hình về đúng. Nếu học viên làm L2: lỗi `relation already exists` khi restore là do nạp dump vào database đã có bảng; trong `backup.sh` dùng `ls -1t clubdb-*.sql | tail -n +6 | xargs -r rm --` để giữ 5 bản; kiểm tra OOM bằng `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' ID`. Dành 3 đến 4 phút thảo luận theo cặp trước khi mở gợi ý; liên hệ: ở Kubernetes liveness probe sẽ restart container unhealthy. Nhấn mạnh: không bao giờ publish `5432:5432` nếu không cần.
14. **Recap (2 phút).** Nhắc nộp bài vào `lab-14/`: `compose.yaml` đã sửa, evidence gồm `ps`, Health Log, kết quả restart và `/health`, `/ready`, và `report.md`. Không commit `.env`, `secrets/`, file backup.

## Lưu ý riêng cho người dạy

- Trong bài học viên, phần demo chỉ còn một dòng: "Trên lớp, mentor demo trước; tự học thì làm thẳng phần Làm lab." Hãy demo theo kịch bản trên rồi mới cho học viên làm lab.
- Hai lab cùng tên thư mục `source` nên cùng tên project Compose; kiểm tra học viên đã `docker compose down` ở `lab-13/source` để tránh xung đột container và volume.
- Docker 29.x: `docker compose kill` không kích hoạt restart (đã kiểm chứng). Phần 3 của lab và các thử thách dùng cách dừng postgres khi pool có kết nối nhàn rỗi.
- Lời giải đầy đủ L2 (Phần L2-1 đến L2-3, bốn thử thách, OOM, `backup.sh`, secret cho backend) nằm ở [Đáp án tuần 7](../walkthroughs/week-07.md). Thang điểm và vấn đáp: [Hướng dẫn chấm tuần 7](../grading/week-07.md).
