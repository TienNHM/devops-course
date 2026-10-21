# Buổi 09 – Dockerfile

Tuần 5 · Phase 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Dockerfile** vào dự án Club Management.

## Nội dung

FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD, ENTRYPOINT, build context

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Viết Dockerfile cho Node.js API.

Công cụ: Docker, Node.js

### L1 – Foundation (hoàn thành theo hướng dẫn)

Viết Dockerfile cho backend (`starter-project/backend`), build và chạy `/health`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tự viết Dockerfile không xem mẫu; giải thích CMD vs ENTRYPOINT; xử lý lỗi build do sai build context (Tình huống 05).

## Lỗi thường gặp

- `COPY . .` trước `npm ci` làm mất layer cache
- Chạy bằng root không cần thiết

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-09/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
