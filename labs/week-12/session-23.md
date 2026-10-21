# Buổi 23 – kubectl Fundamentals

Tuần 12 · Phase 4 – Kubernetes & kubectl · Slide deck: `slides/06-kubectl/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **kubectl Fundamentals** vào dự án Club Management.

## Nội dung

Context, namespace, get, describe, apply, delete, logs, exec, port-forward

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Quản lý workload bằng kubectl.

Công cụ: kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Thực hành get/describe/logs/exec/port-forward trên workload của bạn.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Dùng `-o yaml`, `jsonpath`, `--sort-by`; đọc events để tìm lỗi.

## Lỗi thường gặp

- Quên `-n club` rồi tưởng workload biến mất
- Sửa live bằng `edit` thay vì sửa manifest

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-23/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
