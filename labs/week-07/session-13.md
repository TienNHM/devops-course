# Buổi 13 – Docker Compose

Tuần 7 · Phase 2 – Docker & Containerization · Slide deck: `slides/03-compose/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Docker Compose** vào dự án Club Management.

## Nội dung

Compose YAML, services, depends_on, environment, networks, volumes

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Khởi chạy Frontend + API + PostgreSQL.

Công cụ: Docker Compose

### L1 – Foundation (hoàn thành theo hướng dẫn)

Chạy `starter-project` bằng Compose: tạo `.env` từ `.env.example`, `docker compose up -d --build`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tự viết `compose.yaml` cho 3 service từ đầu; giải thích từng khóa.

## Lỗi thường gặp

- Commit `.env`
- Thụt lề YAML sai
- `depends_on` không đảm bảo database sẵn sàng

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-13/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
