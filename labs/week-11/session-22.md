# Buổi 22 – Pods & Deployments

Tuần 11 · Phase 4 – Kubernetes & kubectl · Slide deck: `slides/05-kubernetes/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Pods & Deployments** vào dự án Club Management.

## Nội dung

Pod lifecycle, YAML manifest, ReplicaSet, Deployment, labels, selectors

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Deploy API lên Kubernetes.

Công cụ: kubectl, kind

### L1 – Foundation (hoàn thành theo hướng dẫn)

Build image, `kind load docker-image`, deploy `k8s/backend.yaml` (cần có Secret và Postgres trước).

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Tự viết manifest Deployment; thực hiện rolling update và giải thích ReplicaSet mới/cũ.

## Lỗi thường gặp

- Quên `kind load docker-image` nên ImagePullBackOff
- Selector không khớp labels

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-22/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
