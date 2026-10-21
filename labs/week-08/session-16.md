# Buổi 16 – GitHub Actions Basics

Tuần 8 · Phase 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **GitHub Actions Basics** vào dự án Club Management.

## Nội dung

Workflow, YAML, Events, Jobs, Steps, Runner, Marketplace Actions

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Viết workflow tự động chạy khi push code.

Công cụ: GitHub Actions

### L1 – Foundation (hoàn thành theo hướng dẫn)

Viết `ci.yml` chạy `npm ci` và `npm test` khi push/PR.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tách job, dùng cache, dùng `matrix`; xử lý Tình huống 06 (workflow fail).

## Lỗi thường gặp

- Sai `working-directory`
- Thiếu `package-lock.json` khiến `npm ci` lỗi

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-16/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
