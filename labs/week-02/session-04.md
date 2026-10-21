# Buổi 04 – Linux Administration

Tuần 2 · Giai đoạn 1 – Engineering Foundation · Slide deck: `slides/01-foundation/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Linux Administration** vào dự án Club Management.

## Nội dung

User, Group, chmod, chown, process, systemctl, environment variables

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Tạo user, phân quyền thư mục, quản lý process.

Công cụ: Bash, systemd (WSL)

### L1 – Foundation (hoàn thành theo hướng dẫn)

Tạo user và group, phân quyền thư mục dùng chung bằng `chmod`/`chown`; dùng `ps`, `kill`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Viết shell script kiểm tra tài nguyên (CPU/RAM/disk) và in cảnh báo vượt ngưỡng; tạo một systemd unit đơn giản (nếu WSL bật systemd).

## Lỗi thường gặp

- `chmod 777` cho mọi thứ
- Nhầm biến môi trường của shell hiện tại và của process con

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-04/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
