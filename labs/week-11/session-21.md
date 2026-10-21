# Buổi 21 – Kubernetes Introduction

Tuần 11 · Phase 4 – Kubernetes & kubectl · Slide deck: `slides/05-kubernetes/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Kubernetes Introduction** vào dự án Club Management.

## Nội dung

Container orchestration, architecture, Control Plane, Worker Node, API Server, Scheduler, etcd, kubelet

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Cài kind và tạo cluster local.

Công cụ: kind, kubectl

### L1 – Foundation (hoàn thành theo hướng dẫn)

Cài kubectl + kind, tạo cluster, `kubectl get nodes`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tạo cluster 3 node bằng file cấu hình; chỉ ra các thành phần control plane trong `kube-system`.

## Lỗi thường gặp

- Docker Desktop thiếu RAM
- Quên rằng kind chạy node là container

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-21/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
