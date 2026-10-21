# Deck 03 – Docker Compose

Bộ slide cho Tuần 7 (Giai đoạn 2 – Containerization): chạy cả starter-project bằng một file `compose.yaml` rồi nâng cấp lên mức vận hành đáng tin cậy. Tổng cộng 43 slide, mỗi slide một ý chính, có ghi chú giảng viên.

## Các buổi trong deck

| Buổi | Chủ đề | Số slide | Slide | Bài lab |
| --- | --- | --- | --- | --- |
| 13 | Docker Compose | 21 | [session-13.md](session-13.md) | [Lab buổi 13](../../labs/week-07/session-13.md) |
| 14 | Production-minded Compose | 22 | [session-14.md](session-14.md) | [Lab buổi 14](../../labs/week-07/session-14.md) |

## Mục tiêu của deck

- Mô tả và chạy cả Frontend, API, PostgreSQL bằng `docker compose up -d --build`.
- Hiểu `depends_on`, `healthcheck`, `restart`, `volumes`, `.env` và mối quan hệ giữa chúng.
- Biết phân biệt "container đang chạy" với "service sẵn sàng".
- Có thói quen vận hành: giới hạn tài nguyên, log rotation, secret dạng file, backup và restore thật.
- Chuẩn bị nền tảng cho probe, resource limits, Secret và PVC ở Kubernetes.

## Mẹo trình bày

- Mở file slide bằng trình duyệt qua site giáo trình, chia sẻ cửa sổ trình duyệt; phóng to bằng `Ctrl` và `+` cho tới khi người ngồi cuối lớp đọc được code block.
- Mỗi slide chỉ giữ một ý; phần "Ghi chú giảng viên" bấm mở khi cần lời dẫn, thời lượng và câu hỏi cho lớp.
- Chia sẻ terminal WSL với cỡ chữ lớn (tối thiểu 16-18 pt), nền tối, chỉ một lệnh mỗi lần; xóa màn hình bằng `clear` trước mỗi demo.
- Buổi 14 cần hai terminal cạnh nhau (một chạy `watch -n 1 docker compose ps`, một chạy lệnh) để thấy khoảng chờ giữa started và ready.
- Chạy thử toàn bộ demo trước giờ học; dọn môi trường bằng `docker compose down -v` trong cả `lab-13/source` và `lab-14/source` để hai lab không dẫm lên nhau.
- Cho học viên dự đoán kết quả trước khi chạy lệnh quan trọng (`down` so với `down -v`, `kill` so với `stop`, `/health` so với `/ready`).
