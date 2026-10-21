# Buổi 25 – Configuration Management

Tuần 13 · Giai đoạn 4 – Kubernetes & kubectl · Slide deck: `slides/06-kubectl/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Configuration Management** vào dự án Club Management.

## Nội dung

ConfigMap, Secret, environment variables, mounted configuration

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Tách cấu hình khỏi Docker Image.

Công cụ: kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Tạo ConfigMap `club-config` và Secret `club-secrets` (tạo Secret bằng lệnh, không commit giá trị thật).

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Mount ConfigMap thành file; cập nhật cấu hình và quan sát hành vi rollout; giải thích Secret chỉ là base64, không phải mã hóa.

## Lỗi thường gặp

- Commit Secret thật vào Git
- Nghĩ rằng base64 là bảo mật

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-25/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
