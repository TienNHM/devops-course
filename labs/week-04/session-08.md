# Buổi 08 – Docker CLI

Tuần 4 · Phase 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Docker CLI** vào dự án Club Management.

## Nội dung

`docker run`, `ps`, `exec`, `inspect`, `logs`, `stop`, `rm`, `pull`, `push`

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Chạy, kiểm tra và debug một container.

Công cụ: Docker CLI

### L1 – Foundation (hoàn thành theo hướng dẫn)

Chạy, xem log, `exec` vào container, dừng và xóa; ghi lại lệnh vào evidence.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Debug container exit ngay khi start (Tình huống 02); giải quyết xung đột port (Tình huống 01).

## Lỗi thường gặp

- Quên `-d` rồi tưởng container 'treo'
- Dùng tag `latest` làm kết quả không tái lập

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-08/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
