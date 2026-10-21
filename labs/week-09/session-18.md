# Buổi 18 – Docker CI Pipeline

Tuần 9 · Giai đoạn 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Docker CI Pipeline** vào dự án Club Management.

## Nội dung

Docker Build, Buildx, cache, tagging, GHCR, authentication

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Tự động build và publish image lên GHCR.

Công cụ: GitHub Actions, GHCR

### L1 – Foundation (hoàn thành theo hướng dẫn)

Chạy `publish.yml` để publish `club-api` lên GHCR, tag theo SHA.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Thêm tag theo git tag `v*`, bật cache, publish cả `club-web`; xử lý lỗi quyền `packages: write`.

## Lỗi thường gặp

- Thiếu `permissions: packages: write`
- Package GHCR để private nên pull lỗi

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-18/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
