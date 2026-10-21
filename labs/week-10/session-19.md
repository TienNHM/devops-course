# Buổi 19 – CD & Deployment Strategies

Tuần 10 · Phase 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **CD & Deployment Strategies** vào dự án Club Management.

## Nội dung

Continuous Deployment, environment, secrets, approval, rollback, deployment strategy

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Viết workflow/script deploy image lên môi trường local.

Công cụ: Bash, Docker Compose

### L1 – Foundation (hoàn thành theo hướng dẫn)

Viết script `deploy-local.sh` pull image từ GHCR và chạy lại Compose. KHÔNG expose máy ra Internet.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Dùng self-hosted runner trên máy local (cô lập, chỉ dành cho repo riêng) hoặc dùng `workflow_dispatch` + script có hướng dẫn; mô tả quy trình rollback.

## Lỗi thường gặp

- Mở cổng máy cá nhân ra Internet
- Self-hosted runner cho repo public

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-19/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
