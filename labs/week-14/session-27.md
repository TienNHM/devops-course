# Buổi 27 – Storage & Ingress

Tuần 14 · Giai đoạn 4 – Kubernetes & kubectl · Slide deck: `slides/07-operations/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Storage & Ingress** vào dự án Club Management.

## Nội dung

PV, PVC, StorageClass, Ingress Controller, HTTP routing

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Deploy PostgreSQL với PVC và cấu hình ingress.

Công cụ: kind, ingress-nginx

### L1 – Foundation (hoàn thành theo hướng dẫn)

Deploy `postgres.yaml` với PVC, kiểm tra dữ liệu còn sau khi xóa pod.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Cài ingress-nginx cho kind, định tuyến `club.localhost`; giải thích vòng đời PV/PVC.

## Lỗi thường gặp

- Cluster kind chưa có `extraPortMappings` nên ingress không truy cập được
- Xóa PVC làm mất dữ liệu

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-27/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
