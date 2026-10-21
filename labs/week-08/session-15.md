# Buổi 15 – CI/CD Fundamentals

Tuần 8 · Phase 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **CI/CD Fundamentals** vào dự án Club Management.

## Nội dung

Continuous Integration, Delivery, Deployment, Pipeline, Artifact, Runner, Trigger

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Vẽ CI/CD pipeline cho ứng dụng.

Công cụ: Draw.io, GitHub

### L1 – Foundation (hoàn thành theo hướng dẫn)

Vẽ pipeline Test → Build → Publish → Deploy cho Club API.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Phân biệt Delivery và Deployment; đề xuất gate (approval, test) cho từng môi trường.

## Lỗi thường gặp

- Gộp mọi thứ vào một job khổng lồ
- Không rõ artifact là gì

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-15/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
