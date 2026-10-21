# Buổi 05 – Networking Fundamentals

Tuần 3 · Giai đoạn 1 – Engineering Foundation · Slide deck: `slides/01-foundation/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Networking Fundamentals** vào dự án Club Management.

## Nội dung

IP, subnet, DNS, TCP/UDP, port, HTTP/HTTPS, localhost, loopback

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Dùng `ping`, `curl`, `nslookup`, `ss` kiểm tra kết nối.

Công cụ: ping, curl, nslookup, ss

### L1 – Foundation (hoàn thành theo hướng dẫn)

Hoàn thành báo cáo networking: kiểm tra IP, DNS, port đang lắng nghe, gọi HTTP bằng `curl -v`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Giải thích đường đi của một request từ trình duyệt đến server (DNS → TCP → HTTP); chẩn đoán tình huống 'Port đã được sử dụng' (`ss -ltnp`).

## Lỗi thường gặp

- Nhầm `localhost` trong container với localhost của máy host
- Chỉ ping được mà vẫn kết luận service hoạt động

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-05/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
