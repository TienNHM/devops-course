# Buổi 24 – Kubernetes Services

Tuần 12 · Phase 4 – Kubernetes & kubectl · Slide deck: `slides/06-kubectl/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Kubernetes Services** vào dự án Club Management.

## Nội dung

ClusterIP, NodePort, LoadBalancer, Service Discovery, DNS

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Kết nối Frontend với Backend thông qua Service.

Công cụ: kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Tạo Service cho backend và frontend, gọi bằng DNS name từ một pod debug.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Kiểm thử service discovery; chẩn đoán Service không có endpoint do selector sai.

## Lỗi thường gặp

- Service selector sai nên `Endpoints` rỗng
- Nhầm `port` và `targetPort`

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-24/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
