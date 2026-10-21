# Buổi 12 – Persistent Storage

Tuần 6 · Phase 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Persistent Storage** vào dự án Club Management.

## Nội dung

Volume, bind mount, tmpfs, database persistence, backup

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Chạy PostgreSQL và đảm bảo dữ liệu không mất khi recreate container.

Công cụ: Docker, PostgreSQL

### L1 – Foundation (hoàn thành theo hướng dẫn)

Chạy PostgreSQL với named volume, tạo dữ liệu, xóa và tạo lại container, dữ liệu vẫn còn.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tái hiện Tình huống 04 (mất dữ liệu khi không có volume); backup/restore bằng `pg_dump`.

## Lỗi thường gặp

- Quên mount vào `/var/lib/postgresql/data`
- `docker compose down -v` xóa mất volume

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-12/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
