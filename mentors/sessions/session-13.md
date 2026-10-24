# Kịch bản buổi 13: Docker Compose

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md). Slide: [Slide buổi 13](../../slides/03-compose/session-13.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 7](../grading/week-07.md). Đáp án: [Đáp án tuần 7](../walkthroughs/week-07.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 13 trong 120 phút: khung thời gian, demo 5 bước với `starter-project`, câu hỏi cho lớp, ghi chú theo 14 slide và lưu ý về tên project Compose.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập Buổi 09 đến 12 | Dockerfile, network, volume |
| 30 | Kiến thức và demo: Slide 1 đến 11 | Demo khoảng 10 phút; buổi đầu của tuần dành nhiều thời gian cho khái niệm và demo |
| 60 | Thực hành: lab L1 | Chuẩn bị 5', Phần 1 8', Phần 2 12', Phần 3 15', Phần 4 20'; L2 làm ở nhà |
| 15 | Review: Slide 13 và 14 | Xem lại bằng chứng, trả lời thắc mắc, nhắc nộp bài |

## Kịch bản demo (Slide 11)

Mentor trình diễn trên máy chiếu, học viên theo dõi (khoảng 10 phút). Chép `starter-project` ra thư mục riêng để không làm bẩn repo giáo trình:

```bash
cp -r ~/devops-course/starter-project ~/demo-13 && cd ~/demo-13
```

Tên project Compose lấy theo tên thư mục chứa `compose.yaml`, nên tên container trong demo có tiền tố `demo-13-`; trong lab học viên chạy ở `lab-13/source` nên tiền tố là `source-`.

1. Đọc cùng lớp `compose.yaml`, chỉ ra ba service, một network, một volume.
2. Chạy khi chưa có `.env`:

```bash
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
NAME                  SERVICE    STATUS                    PORTS
demo-13-backend-1     backend    Up 10 seconds             0.0.0.0:3000->3000/tcp
demo-13-frontend-1    frontend   Up 9 seconds              0.0.0.0:8080->80/tcp
demo-13-postgres-1    postgres   Up 20 seconds (healthy)   5432/tcp
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

5. Chạy `docker compose config` để cho lớp thấy cấu hình sau khi thay biến. Dọn dẹp: `docker compose down -v`.

## Câu hỏi cho lớp

- Nếu bỏ `condition: service_healthy`, backend có luôn lỗi không? Đáp: không chắc, phụ thuộc postgres lên nhanh hay chậm; đây là lỗi "lúc được lúc không" (Slide 7).
- Vì sao cổng 5432 của postgres không mở ra máy chủ mà backend vẫn kết nối được? (Slide 5 và 6)
- Nếu đặt `DB_HOST: localhost` thì backend báo lỗi gì? Đáp: `ECONNREFUSED` (Slide 6).
- Sửa `init.sql` rồi `up -d` lại, dữ liệu có đổi không? Để lớp tự dự đoán, trả lời ở Slide 9 và phần Dữ liệu và vòng đời của lab.
- Chạy `docker compose down` rồi `up` lại, Alice và Bob còn không? Còn nếu dùng `down -v`?

## Ghi chú theo slide

Slide buổi 13 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Nhắc lại Buổi 09 đến 12: Dockerfile, network, volume. Hỏi lớp: bạn nào còn nhớ đủ các cờ `docker run` của cả ba container?
2. **Vấn đề với chuỗi lệnh `docker run` (2 phút).** Kể lại cảnh thành viên mới vào dự án. Câu hỏi: lệnh `docker run` của bạn nằm ở đâu, có trong Git không? Dẫn vào ý: cần một file mô tả hệ thống, commit cùng mã nguồn.
3. **Compose là gì (2 phút).** Nhấn mạnh Compose v2 và không có khóa `version` trong file. Chạy `docker compose version` để lớp kiểm tra máy mình.
4. **Các khóa chính (2 phút).** Không đọc hết bảng. Chỉ chọn ba khóa: `services`, `ports`, `volumes`; các khóa còn lại sẽ gặp khi đọc file thật ở demo.
5. **Kiến trúc (2 phút).** Cho lớp tự chỉ ra: cổng nào mở ra máy chủ? (8080 cho frontend, 3000 cho backend.) Vì sao 5432 không mở mà backend vẫn nối được?
6. **Network và DNS theo tên service (2 phút).** Đây là lỗi số 1 của người mới. Hỏi: nếu đặt `DB_HOST: localhost` thì backend báo lỗi gì?
7. **`depends_on` không bằng sẵn sàng (3 phút).** Ý dễ hiểu sai nhất. Nếu bỏ `condition`, backend lỗi lúc được lúc không, tùy postgres lên nhanh hay chậm: kiểu lỗi khó debug nhất.
8. **Biến môi trường và `.env` (2 phút).** Phân biệt: thay thế biến lúc Compose đọc file khác với truyền biến vào container. Nhắc học viên đổi `DB_PASSWORD` thành chuỗi riêng, không dùng mật khẩu thật của dịch vụ khác.
9. **Volume và `init.sql` (2 phút).** Chuẩn bị câu hỏi cho phần Dữ liệu và vòng đời: sửa `init.sql` rồi `up -d` lại, dữ liệu có đổi không? Để lớp tự dự đoán.
10. **Vòng đời với Compose (1 phút).** Nhấn mạnh `config` là bước đầu khi nghi ngờ Compose không nhận biến hoặc YAML sai thụt lề. Dùng tên service trong lệnh, không dùng tên container.
11. **Demo (10 phút).** Chạy demo 5 bước ở trên. Trước demo đọc cùng lớp `compose.yaml`; chạy khi chưa có `.env` để lớp thấy lỗi có chủ đích. Chỉ vào `(healthy)` của postgres và cột PORTS: postgres chỉ có `5432/tcp`, không có mũi tên ra máy chủ. Vẽ lại luồng trên bảng cho hai lệnh `curl`.
12. **Lab và thử thách (60 phút lab).** Cảnh báo: backend publish cổng 3000, chỉ dùng trên máy cá nhân. Đi vòng quanh lớp xem ai chưa healthy; nếu postgres chưa healthy, bảo học viên đợi 10 đến 15 giây rồi chạy lại `ps`. Ở Phần 4 cho học viên dự đoán trước khi chạy `down` và `down -v`; sau `down -v` cần chờ khoảng 15 giây vì postgres khởi tạo lại. L1 hoàn thành khi chứng minh được khác biệt này bằng dữ liệu Carol. Gợi ý cho L2 nếu học viên kẹt: bắt đầu từ postgres vì các service khác phụ thuộc vào nó; chạy `config` sau mỗi service thêm vào để bắt lỗi thụt lề sớm. Chọn 2 đến 3 dòng của bảng "Gặp lỗi?" liên quan nhất đến lớp; nhắc riêng: vô tình commit `.env` thì phải đổi mật khẩu đã lộ.
13. **Break và Debug: đổi mật khẩu trong `.env` (khoảng 8 phút).** Đây là phần Break thật sự: cho học viên tự điều tra theo thứ tự `ps`, `logs backend`, `logs postgres`, so sánh hai phía. Cách sửa: trả lại mật khẩu cũ, hoặc `ALTER USER club PASSWORD '...'`. Nhắc khôi phục `.env` sau bài. Gợi ý thêm: scenario-03 và scenario-01 trong `examples/troubleshooting/`. Đặt câu hỏi thảo luận theo cặp 3 đến 4 phút trước khi mở đáp án.
14. **Recap (2 phút).** Nhắc nộp bài: README theo mẫu, `source/`, `evidence/command-output.txt`, `report.md` về tình huống đổi mật khẩu. Buổi sau: healthcheck, restart, limits, backup.

## Lưu ý riêng cho người dạy

- Trong bài học viên, phần demo chỉ còn một dòng: "Trên lớp, mentor demo trước; tự học thì làm thẳng phần Làm lab." Hãy demo theo kịch bản trên rồi mới cho học viên làm lab.
- Thử thách C (restart policy): trên Docker Engine 29.x, `docker compose kill` do người dùng gõ được coi là dừng thủ công nên không kích hoạt restart (đã kiểm chứng). Dùng cách gọi `/api/members` rồi `docker compose stop postgres`; chi tiết ở [Đáp án tuần 7](../walkthroughs/week-07.md).
- Cuối buổi nhắc học viên chạy `docker compose down` trong `lab-13/source` trước khi sang Buổi 14, vì hai lab cùng tên project `source`.
