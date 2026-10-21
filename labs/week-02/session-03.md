# Buổi 03 – Linux CLI

Tuần 2 · Giai đoạn 1 – Engineering Foundation · Slide deck: `slides/01-foundation/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Linux CLI** vào dự án Club Management.

## Nội dung

`pwd`, `ls`, `cd`, `find`, `grep`, `cat`, `less`, `head`, `tail`, piping

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Tạo cấu trúc thư mục, tìm kiếm file, phân tích log.

Công cụ: Bash, access.log mẫu

### L1 – Foundation (hoàn thành theo hướng dẫn)

Tạo cây thư mục theo đề, dùng `find`/`grep` tìm file và dòng log cho trước.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Dùng pipe (`grep | sort | uniq -c | sort -nr`) để thống kê top 5 IP và mã HTTP trong file access log mẫu.

## Lỗi thường gặp

- `rm -rf` với đường dẫn sai
- Quên quote đường dẫn có khoảng trắng

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-03/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
