# Buổi 11 – Container Networking

Tuần 6 · Giai đoạn 2 – Docker & Containerization · Slide deck: `slides/02-docker/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Container Networking** vào dự án Club Management.

## Nội dung

Bridge network, port mapping, container DNS, network isolation

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Cho hai container giao tiếp qua Docker Network.

Công cụ: Docker network

### L1 – Foundation (hoàn thành theo hướng dẫn)

Tạo user-defined network, chạy hai container và `curl` bằng tên container.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Chứng minh network isolation (hai network khác nhau không thấy nhau); xử lý Tình huống 03 (API không kết nối được DB).

## Lỗi thường gặp

- Dùng `localhost` để gọi container khác
- Dùng default bridge nên không có DNS theo tên

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-11/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
