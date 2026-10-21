# Buổi 17 – Automated Testing

Tuần 9 · Giai đoạn 3 – CI/CD & Automation · Slide deck: `slides/04-cicd/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Automated Testing** vào dự án Club Management.

## Nội dung

Unit Test, Integration Test, Test Report, Build Validation

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Thiết lập test trước khi merge.

Công cụ: node:test, GitHub Actions

### L1 – Foundation (hoàn thành theo hướng dẫn)

Thêm test cho `/ready` (mock pool) và bật yêu cầu CI pass trước merge.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Viết integration test với PostgreSQL service container trong Actions; upload test report làm artifact.

## Lỗi thường gặp

- Test phụ thuộc thứ tự chạy
- Không chặn merge khi CI đỏ

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-17/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
