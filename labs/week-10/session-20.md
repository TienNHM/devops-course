# Buổi 20 – Pipeline Security

Tuần 10 · Giai đoạn 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Pipeline Security** vào dự án Club Management.

## Nội dung

Least Privilege, permissions, secret management, dependency scanning, SBOM, image scanning

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Kiểm tra workflow permissions và quét image.

Công cụ: Trivy / Docker Scout

### L1 – Foundation (hoàn thành theo hướng dẫn)

Rà soát `permissions:` của mọi workflow, đưa về mức tối thiểu; chạy `docker scout` hoặc Trivy trên image.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Thêm bước dependency review và image scanning vào pipeline; sinh SBOM.

## Lỗi thường gặp

- Để `permissions` mặc định quá rộng
- In secret ra log

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-20/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
