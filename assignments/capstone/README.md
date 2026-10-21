# Capstone – Build and Deploy a Club Management System

Nhóm 3–4 người, 2 tuần (buổi 29–32).

## Chức năng
Xem/thêm/sửa/xóa thành viên · thông tin cơ bản · API health check · PostgreSQL · giao diện web đơn giản.

## Kiến trúc mục tiêu
GitHub (source, PR, issues) → GitHub Actions (test → build → scan → publish) → GHCR →
kind (frontend, backend, PostgreSQL + PVC, ingress).

## Yêu cầu kỹ thuật
Git workflow branch+PR · REST API · PostgreSQL · Dockerfile · Compose chạy toàn stack ·
CI chạy test · publish image GHCR + deploy local · k8s Deployment/Service/ConfigMap/Secret · PVC ·
logs/events/health checks · README + architecture diagram.

## Phân công mẫu
| Thành viên | Trách nhiệm |
| --- | --- |
| A | Backend + Dockerfile |
| B | Frontend + Dockerfile |
| C | Docker Compose + Database |
| D | GitHub Actions + Kubernetes |

Review chéo bắt buộc để không bị giới hạn một chuyên môn.

## Definition of Done
Xem checklist trong [templates/project-template.md](../../templates/project-template.md).
Rubric: [curriculum/assessment.md](../../curriculum/assessment.md). Điều kiện đạt: Final Project ≥ 60/100.

Điểm xuất phát: `starter-project/` (backend mới có `GET /api/members`; CRUD là phần việc của nhóm).
