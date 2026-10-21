# Buổi 07 – Container Fundamentals

Tuần 4 · Giai đoạn 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Container Fundamentals** vào dự án Club Management.

## Nội dung

VM vs Container, Docker Architecture, Docker Engine, Image, Container, Registry

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Cài Docker Desktop, chạy container Nginx.

Công cụ: Docker Desktop

### L1 – Foundation (hoàn thành theo hướng dẫn)

Cài Docker Desktop (WSL2 backend), chạy `docker run -d -p 8081:80 nginx:1.27-alpine` và truy cập trình duyệt.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Giải thích client/daemon/registry bằng `docker version` và `docker info`; so sánh tài nguyên container vs VM.

## Lỗi thường gặp

- Chưa bật WSL integration trong Docker Desktop
- Nhầm image và container

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-07/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
