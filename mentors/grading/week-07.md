# Chấm bài tuần 7 – Docker Compose

::: warning Dành cho mentor
Trang này dành cho người chấm; học viên không cần đọc. Đề bài: [Bài tập tuần 7 – Docker Compose](../../assignments/weekly/week-07.md). Đáp án: [Walkthrough tuần 7](../walkthroughs/week-07.md). Hub tuần: [Tuần 07 – Docker Compose](../../labs/week-07/README.md).
:::

## Barem chi tiết

| Tiêu chí | Mô tả đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: hệ thống ba service chạy bằng Compose | `compose.yaml` đủ service, network, volume; mật khẩu nằm ở `.env`; `/api/members` trả dữ liệu; có log gọi theo tên service | Thiếu service, mật khẩu hard-code, hoặc không có log chạy thật | 20 |
| Nhiệm vụ 2: vòng đời dữ liệu | Ba lần gọi theo đúng thứ tự, kết quả (2) còn Carol, (3) mất Carol; giải thích đúng | Thiếu lần gọi, sai thứ tự, hoặc giải thích không nhắc tới volume | 15 |
| Nhiệm vụ 3: healthcheck và `depends_on` điều kiện | Cả ba service healthy, `condition: service_healthy` đúng, có Health Log | Thiếu healthcheck của một service hoặc `depends_on` chưa có điều kiện | 20 |
| Nhiệm vụ 4: restart policy và `/health`, `/ready` | Log thoát bất thường và `stop` đối chiếu đúng; mã 200 và 503 đúng; giải thích đúng | Chỉ nêu lý thuyết, không có log thực nghiệm | 15 |
| Nhiệm vụ 5: Break -> Debug | Có diff, triệu chứng, quy trình điều tra, nguyên nhân gốc và cách phòng tránh | Chỉ mô tả cách sửa, không có quy trình điều tra | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng và ngắn gọn trong `report.md` (2 điểm mỗi câu) | Sai ý chính hoặc sao chép nguyên văn từ bài lab | 10 |
| Chất lượng nộp bài và an toàn | Cấu trúc thư mục đúng, README trả lời 7 câu của template, không lộ secret, PR được review | Thiếu README, commit `.env` hoặc secret | 10 |
| Tổng | | | 100 |
| Điểm thưởng L2 | Mỗi thử thách đạt đủ tiêu chí cộng tối đa 5 điểm; tổng thưởng tối đa 10 | Thiếu tiêu chí đo được thì không cộng | +10 |

Ghi chú chấm: mentor có thể chạy lại `docker compose up -d` từ `source/` của bạn trên máy khác. Bài nộp không chạy lại được chỉ nhận tối đa một nửa điểm của các nhiệm vụ liên quan.

## Lỗi hay bị trừ điểm

- Commit file `.env`, password hoặc token vào repo (trừ nặng ở tiêu chí an toàn).
- `compose.yaml` ghi sẵn mật khẩu thật thay vì dùng biến từ `.env`.
- Log không có dòng lệnh đi kèm, hoặc output được gõ tay thay vì lấy từ lần chạy thật.
- Chỉ nộp ảnh chụp màn hình, không có `source/` và `evidence/`.
- `depends_on` thiếu `condition`, nên chỉ đảm bảo thứ tự khởi động chứ không đảm bảo sẵn sàng.
- Dùng `localhost` để healthcheck hoặc kết nối DB giữa các container thay vì `127.0.0.1` (trong healthcheck) hoặc tên service.
- Publish cổng postgres ra máy chủ, gây xung đột với PostgreSQL cài sẵn.
- Làm việc trong `/mnt/c` hoặc dùng `docker-compose` (v1) thay vì `docker compose`.
- Gây lỗi ở Nhiệm vụ 5 nhưng không trả cấu hình về trạng thái đúng trước khi nộp.
- Nộp file backup hoặc thư mục secret vào repo.
- Trả lời câu hỏi kiểm tra bằng cách chép lại đoạn văn của bài lab.

## Lệnh kiểm tra nhanh

Chạy trong thư mục `source/` của học viên (sau khi clone PR của họ và tạo `.env` từ `.env.example`):

```bash
docker compose config --quiet; echo "exit code: $?"
docker compose up -d --build && sleep 20 && docker compose ps
curl -s http://localhost:8080/api/members
git ls-files | grep -E '(^|/)\.env$|secrets/|backups/' || echo "OK: không có file nhạy cảm bị theo dõi"
docker compose ps postgres --format "{{.Ports}}"
grep -n "service_healthy" compose.yaml
```

Kết quả đúng: `exit code: 0`; ba service chạy (lab 14: cả ba `(healthy)`); JSON có Alice và Bob; dòng `OK`; cột cổng của postgres chỉ có `5432/tcp` (không có mũi tên `->`); ít nhất hai dòng `service_healthy` (backend chờ postgres, frontend chờ backend) ở bài lab 14. Dọn dẹp sau khi chấm: `docker compose down -v`.

## Câu hỏi vấn đáp và dấu hiệu bài chép

Nguyên văn từ phần Hướng dẫn chấm của [Walkthrough tuần 7](../walkthroughs/week-07.md).

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1 – ba service | `command-output.txt` có `config --quiet` kèm exit code, `ps`, `curl`, lệnh `exec` theo tên; `compose.yaml`, `.env.example` | Tên container y hệt ví dụ của đề (`starter-project-...`) dù thư mục khác tên; giải thích từng khóa chép lại câu của lab | Vì sao backend gọi `postgres` mà không gọi `localhost`? Nếu bỏ `networks`, hệ thống có còn chạy không và vì sao? Lệnh nào cho em thấy mật khẩu đã được thay vào YAML? |
| Nhiệm vụ 2 – vòng đời dữ liệu | Ba lần gọi theo đúng thứ tự, mỗi lần có dòng lệnh ngay trên; kết quả (2) còn Carol, (3) mất Carol | Kết quả được gõ tay (không có mốc thời gian, thiếu lệnh `down -v`); giải thích không nhắc `init.sql` | Sau `down -v` vì sao Alice và Bob vẫn xuất hiện? Nếu sửa `init.sql` thêm một người và chỉ chạy `up -d`, dữ liệu có đổi không? |
| Nhiệm vụ 3 – healthcheck, `depends_on` | `ps` có ba `(healthy)`; `inspect` Health Log với dòng `accepting connections`; `condition: service_healthy` đúng chỗ | Có `healthcheck` nhưng `depends_on` vẫn dạng ngắn; không giải thích được vì sao frontend chờ backend | `start_period` để làm gì? Khi nào `depends_on` điều kiện không còn tác dụng? Vì sao frontend không cần chờ backend khỏe mà vẫn cần backend được tạo trước? |
| Nhiệm vụ 4 – restart, `/health`, `/ready` | Log thoát bất thường với `RestartCount` tăng, `stop backend` đứng yên, mã `200` và `503`, rồi `200` | Chỉ có `kill` mà `RestartCount` vẫn 0 nhưng báo đã restart; mã HTTP không có lệnh `curl` đi kèm; kết luận ngược (chọn `/ready` mà không nêu hệ quả) | Vì sao `kill` bằng tay không làm container chạy lại, còn crash thật thì có? Khi DB dừng, endpoint nào đổi trạng thái và vì sao? Container `unhealthy` có tự restart không? |
| Nhiệm vụ 5 – Break -> Debug | `git diff` thay đổi gây lỗi, log trước và sau, Health Log, mục Break -> Debug đủ bốn phần | Chỉ có cách sửa, không có quy trình điều tra; nguyên nhân gốc mô tả mơ hồ ("cấu hình sai"); không trả cấu hình về đúng | Em đọc lỗi ở đâu đầu tiên? Cách chạy tay lệnh check trong container là gì? Nếu chỉ tăng `retries` mà không sửa đường dẫn thì chuyện gì xảy ra? |
| Câu hỏi kiểm tra kiến thức | 5 câu ngắn gọn bằng lời học viên | Văn phong và thứ tự ý trùng đoạn văn của lab | Hỏi lại câu 4 hoặc 5 bằng một tình huống mới (ví dụ máy khởi động lại, backend sập mỗi 10 giây) |
| Chất lượng nộp và an toàn | Không có `.env`, `secrets/`, backup trong commit; README đủ 7 câu; có reviewer | `git log -p` hoặc `git ls-files` thấy `.env`, mật khẩu trong evidence | Nếu lỡ commit `.env` thì em làm gì (gỡ khỏi git, đổi mật khẩu, kiểm tra lịch sử)? |
| L2-A backup và restore | Log bảy lần chạy và `ls backups` ra 5 file; restore thấy Carol; `set -euo pipefail`, không có mật khẩu | Script không từ chối file rỗng; restore vào chính database đang chạy mà không giải thích; thiếu `-T` | Vì sao dùng `-T`? Vì sao nên restore vào database trống? Làm sao biết bản backup dùng được mà không chờ lúc sự cố? |
| L2-B secret cho Postgres | `compose.yaml` có `secrets` và `POSTGRES_PASSWORD_FILE`; `inspect` không lộ mật khẩu; `/ready` 200 | Giữ nguyên volume cũ nên không chứng minh được mật khẩu mới; nêu giới hạn chung chung | Vì sao phải khởi động từ volume mới? Backend đang đọc mật khẩu từ đâu? |
| L2-C OOM | Log `OOMKilled` hoặc exit 137 (hoặc ghi rõ kết quả khác và giải thích), số liệu `docker stats` | Giá trị cuối cùng không dựa trên đo đạc | Đặt giới hạn thấp hơn mức đo thì chuyện gì xảy ra với restart policy? |

Đáp án 5 câu hỏi kiểm tra kiến thức và lời giải từng nhiệm vụ nằm trong [Walkthrough tuần 7](../walkthroughs/week-07.md), mục "Bài tập và chấm bài".
