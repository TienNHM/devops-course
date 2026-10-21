# Buổi 10 – Image Optimization

Tuần 5 · Giai đoạn 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Image Optimization** vào dự án Club Management.

## Nội dung

Image layers, caching, `.dockerignore`, multi-stage build, image tagging

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Tối ưu Docker Image và so sánh kích thước.

Công cụ: Docker, dive (tùy chọn)

### L1 – Foundation (hoàn thành theo hướng dẫn)

Thêm `.dockerignore`, so sánh kích thước trước/sau bằng `docker images`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Chuyển sang multi-stage + non-root user; dùng `docker history` giải thích từng layer; tag theo version.

## Lỗi thường gặp

- Quên `.dockerignore` khiến `.git` và `node_modules` vào context
- Tag không có version

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-10/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
