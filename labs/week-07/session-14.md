# Buổi 14 – Production-minded Compose

Tuần 7 · Giai đoạn 2 – Docker & Containerization · Slide deck: `slides/03-compose/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Production-minded Compose** vào dự án Club Management.

## Nội dung

Healthcheck, restart, resource limits, secrets, logging, troubleshooting

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Hoàn thiện hệ thống Compose, xử lý lỗi database chưa sẵn sàng.

Công cụ: Docker Compose

### L1 – Foundation (hoàn thành theo hướng dẫn)

Quan sát healthcheck của postgres và `depends_on: service_healthy`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Thêm healthcheck cho backend, resource limits, restart policy; backup và restore database.

## Lỗi thường gặp

- Healthcheck quá ngặt khiến container bị coi unhealthy
- Để lộ cổng database ra host không cần thiết

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-14/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
