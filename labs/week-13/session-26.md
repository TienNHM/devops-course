# Buổi 26 – Resource & Health

Tuần 13 · Phase 4 – Kubernetes & kubectl · Slide deck: `slides/07-operations/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Resource & Health** vào dự án Club Management.

## Nội dung

Requests, Limits, Liveness, Readiness, Startup Probe, QoS

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Mô phỏng OOMKilled và lỗi healthcheck.

Công cụ: kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Đặt requests/limits và probes cho backend; quan sát trạng thái.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Mô phỏng OOMKilled bằng limit rất thấp; làm readiness probe fail (Tình huống 10) và giải thích hành vi.

## Lỗi thường gặp

- Liveness probe phụ thuộc DB gây restart dây chuyền
- Limit quá thấp

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-26/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
