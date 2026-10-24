# Kịch bản mentor – Buổi 13: Docker Compose

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md). Slide: [Slide buổi 13](../../slides/03-compose/session-13.md). Hub tuần: [Tuần 07 – Docker Compose](../../labs/week-07/README.md).
:::

Tuần 7 · Giai đoạn 2 – Containerization · Buổi 13/32

## Khung thời gian buổi (120 phút)

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập buổi 9-12 | Dockerfile, network, volume |
| 30 | Kiến thức và demo | Demo khoảng 10 phút trong 30 phút này; buổi đầu của tuần dành nhiều thời gian cho khái niệm và demo |
| 60 | Thực hành | Chuẩn bị 10', Phần 1-4 khoảng 35', L2 khoảng 15'; học viên L1 có thể dừng sau Phần 4 |
| 15 | Review | Xem lại bằng chứng, trả lời thắc mắc |

## Demo của mentor

Mentor trình diễn trên máy chiếu, học viên theo dõi (khoảng 10 phút trong 30 phút kiến thức).

1. Đọc cùng lớp `starter-project/compose.yaml`, chỉ ra ba service, một network, một volume.
2. Chạy khi chưa có `.env`:

```bash
cd ~/devops-labs/starter-project
docker compose up -d --build
```

Kết quả mong đợi: Compose dừng, báo thiếu biến, tương tự:

```text
error while interpolating services.backend.environment.DB_PASSWORD: required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env
```

3. Tạo `.env` rồi chạy lại:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Kết quả mong đợi (rút gọn):

```text
NAME                       SERVICE    STATUS                    PORTS
starter-project-backend-1  backend    Up 10 seconds             0.0.0.0:3000->3000/tcp
starter-project-frontend-1 frontend   Up 9 seconds              0.0.0.0:8080->80/tcp
starter-project-postgres-1 postgres   Up 20 seconds (healthy)   5432/tcp
```

4. Gọi thử API qua frontend và trực tiếp:

```bash
curl -s http://localhost:8080/api/members
curl -s http://localhost:3000/ready
```

```text
[{"id":1,"name":"Alice","email":"alice@example.com"},{"id":2,"name":"Bob","email":"bob@example.com"}]
{"status":"ready"}
```

5. Chạy `docker compose config` để cho lớp thấy cấu hình sau khi thay biến.

## Câu hỏi mentor nên hỏi lớp

- Nếu bỏ `condition: service_healthy`, backend có luôn lỗi không? (Không chắc: phụ thuộc vào việc postgres lên nhanh hay chậm, đây là lỗi "lúc được lúc không".)
- Vì sao cổng 5432 của postgres không mở ra máy chủ mà backend vẫn kết nối được?
- Chạy `docker compose down` rồi `up` lại, Alice và Bob còn không? Còn nếu dùng `down -v`?

## Ghi chú giảng viên theo từng slide

Nguyên văn từ bản slide trước khi rút gọn (số slide theo bản cũ, nay nội dung nằm trong [Slide buổi 13](../../slides/03-compose/session-13.md)).

- Slide 1 (Mục tiêu): Mở đầu 2 phút. Nhắc lại buổi 9-12: Dockerfile, network, volume. Hỏi lớp: bạn nào còn nhớ đủ các cờ `docker run` của cả ba container? Thời lượng phần kiến thức khoảng 30 phút gồm demo.
- Slide 2 (Vấn đề với docker run): Kể lại cảnh thành viên mới vào dự án. Câu hỏi: lệnh `docker run` của bạn nằm ở đâu, có trong Git không? Dẫn vào ý: cần một file mô tả hệ thống, commit cùng mã nguồn.
- Slide 3 (Compose là gì): Nhấn mạnh Compose v2 và không có khóa `version` trong file. Chạy `docker compose version` để lớp kiểm tra máy mình.
- Slide 4 (Các khóa chính): Không đọc hết bảng. Chỉ chọn ba khóa: `services`, `ports`, `volumes`, các khóa còn lại sẽ gặp khi đọc file thật ở demo. 3 phút.
- Slide 5 (Kiến trúc): Cho lớp tự chỉ ra: cổng nào mở ra máy chủ? (8080 cho frontend, 3000 cho backend.) Vì sao 5432 không mở mà backend vẫn nối được?
- Slide 6 (Network và DNS): Đây là lỗi số 1 của người mới. Hỏi: nếu đặt `DB_HOST: localhost` thì backend sẽ báo lỗi gì? (`ECONNREFUSED`.)
- Slide 7 (depends_on): Câu hỏi cho lớp: nếu bỏ `condition`, backend có luôn lỗi không? Đáp án: không chắc, lỗi lúc được lúc không, tùy postgres lên nhanh hay chậm. Đây là kiểu lỗi khó debug nhất.
- Slide 8 (.env): Phân biệt: thay thế biến lúc Compose đọc file khác với truyền biến vào container. Nhắc học viên đổi `DB_PASSWORD` thành chuỗi riêng, không dùng mật khẩu thật của dịch vụ khác.
- Slide 9 (Volume và init.sql): Chuẩn bị câu hỏi để đến slide 14: sửa `init.sql` rồi `up -d` lại, dữ liệu có đổi không? Để lớp tự dự đoán.
- Slide 10 (Vòng đời): Nhấn mạnh `config` là bước đầu khi nghi ngờ Compose không nhận biến hoặc YAML sai thụt lề. Dùng tên service trong lệnh, không dùng tên container.
- Slide 11 (Demo 1): Trước demo đọc cùng lớp `compose.yaml`: chỉ ra ba service, một network, một volume. Chạy khi chưa có `.env` để lớp thấy lỗi có chủ đích. 3 phút.
- Slide 12 (Demo 2): Chỉ vào `(healthy)` của postgres và cột PORTS: postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ. 3 phút.
- Slide 13 (Demo 3): Vẽ lại luồng trên bảng cho hai lệnh curl. Dùng `docker compose config` để cho lớp thấy cấu hình sau khi thay biến.
- Slide 14 (Lab - chuẩn bị): Lab 60 phút: chuẩn bị 10', phần 1-4 khoảng 35', L2 khoảng 15'. Học viên L1 có thể dừng sau phần 4. Cảnh báo: backend publish cổng 3000, chỉ dùng trên máy cá nhân.
- Slide 15 (Lab - chạy và kiểm thử): Đi vòng quanh lớp xem ai chưa healthy. Nếu postgres chưa healthy, bảo học viên đợi 10-15 giây rồi chạy lại `ps`.
- Slide 16 (Lab - down và down -v): Cho học viên dự đoán trước khi chạy. Lưu ý sau `down -v` cần chờ khoảng 15 giây vì postgres khởi tạo lại. L1 hoàn thành khi chứng minh được khác biệt này bằng dữ liệu Carol.
- Slide 17 (Lab L2): Gợi ý nếu học viên kẹt: bắt đầu từ postgres vì các service khác phụ thuộc vào nó; chạy `config` sau mỗi service thêm vào để bắt lỗi thụt lề sớm.
- Slide 18 (Lỗi thường gặp): Chọn 2-3 dòng liên quan nhất đến lớp. Nhắc riêng: vô tình commit `.env` thì phải đổi mật khẩu đã lộ.
- Slide 19 (Break và Debug): Đây là phần Break thật sự: cho học viên tự điều tra theo thứ tự `ps`, `logs backend`, `logs postgres`, so sánh hai phía. Cách sửa: trả lại mật khẩu cũ, hoặc `ALTER USER club PASSWORD '...'`. Nhắc khôi phục `.env` sau bài. Gợi ý thêm: scenario-03 và scenario-01 trong `examples/troubleshooting/`.
- Slide 20 (Thử thách): Dành 3-4 phút cho lớp thảo luận theo cặp trước khi mở gợi ý.
- Slide 21 (Recap): Nhắc nộp bài: README theo template, `source/`, `evidence/command-output.txt`, `report.md` về tình huống đổi mật khẩu. Buổi sau: healthcheck, restart, limits, backup.

## Lưu ý riêng cho người dạy

- Trong bài học viên, phần "Demo của mentor" chỉ còn một dòng: "Trên lớp, mentor demo trước; tự học thì làm thẳng phần Làm lab." Hãy demo theo kịch bản trên rồi mới cho học viên làm lab.
- Tên project Compose lấy theo tên thư mục chứa `compose.yaml`; trong lab học viên chạy trong `lab-13/source` nên tiền tố là `source-`, khác với `starter-project-` ở demo.
- Thử thách C (restart policy): trên Docker Engine 29.x, `docker compose kill` do người dùng gõ được coi là dừng thủ công nên không kích hoạt restart (đã kiểm chứng). Dùng cách gọi `/api/members` rồi `docker compose stop postgres`; chi tiết ở [Walkthrough tuần 7](../walkthroughs/week-07.md).
- Cuối buổi nhắc học viên chạy `docker compose down` trong `lab-13/source` trước khi sang buổi 14 vì hai lab cùng tên project `source`.
- Barem và câu hỏi vấn đáp: [Chấm bài tuần 7](../grading/week-07.md).
