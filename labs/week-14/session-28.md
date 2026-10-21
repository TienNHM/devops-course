# Buổi 28 – Kubernetes Operations

Tuần 14 · Giai đoạn 4 – Kubernetes & kubectl · Slide deck: `slides/07-operations/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Kubernetes Operations** vào dự án Club Management.

## Nội dung

Rollout, rollback, scale, events, troubleshooting, CrashLoopBackOff, ImagePullBackOff

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Phá lỗi một cluster mẫu và khôi phục hệ thống.

Công cụ: kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Khắc phục các lỗi được giao (ImagePullBackOff, CrashLoopBackOff) theo quy trình triệu chứng → nguyên nhân gốc.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Xử lý Pod Pending (Tình huống 09); viết Troubleshooting report đầy đủ 5 mục.

## Lỗi thường gặp

- Đoán mò thay vì đọc `describe` và events
- Rollback mà không tìm nguyên nhân gốc

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-28/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
