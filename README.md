# HCMUTE DSC – DevOps Learning Program

**From Code to Deployment** – DevOps Foundation & Practical Engineering.
16 tuần · 32 buổi · 64 giờ · local-first · hands-on.

Triết lý: **Learn → Build → Break → Debug → Deploy → Explain.**

Chương trình dành cho thành viên CLB có trình độ mixed. Không tách hai khóa: mỗi lab có hai mức
**L1 – Foundation** và **L2 – Engineering**. Cuối khóa, mỗi nhóm có một sản phẩm trong GitHub Portfolio:
Containerized Application + CI/CD + Kubernetes (kind) chạy local.

## Bắt đầu

| Bạn là | Đọc |
| --- | --- |
| Học viên | [curriculum/syllabus.md](curriculum/syllabus.md), [curriculum/schedule.md](curriculum/schedule.md), [resources/setup-guide.md](resources/setup-guide.md) |
| Mentor | [CONTRIBUTING.md](CONTRIBUTING.md), [curriculum/assessment.md](curriculum/assessment.md), [examples/troubleshooting-scenarios.md](examples/troubleshooting-scenarios.md) |
| Người muốn chạy thử app mẫu | [starter-project/README.md](starter-project/README.md) |

## Cấu trúc repository

| Thư mục | Nội dung |
| --- | --- |
| `curriculum/` | Syllabus, chuẩn đầu ra, lịch, đánh giá |
| `slides/` | 8 bộ slide (hiện là outline) |
| `labs/week-XX/` | Hướng dẫn tuần + 32 file lab theo buổi |
| `assignments/` | Bài tập hàng tuần và capstone |
| `examples/` | Ví dụ Linux, Docker, Compose, Actions, Kubernetes; 10 tình huống lỗi |
| `starter-project/` | Club Management API mẫu (Node.js + PostgreSQL) |
| `solutions/` | Đáp án (nên chuyển sang repo private cho mentor) |
| `resources/` | Sách, tài liệu, cheatsheet, hướng dẫn cài đặt |
| `templates/` | Template lab, assignment, project |

## Quyết định kỹ thuật

Windows 11 + WSL2 Ubuntu · Docker Desktop · kind · GitHub Actions + GHCR · Node.js + PostgreSQL.

## Nguyên tắc

1. Không cài PostgreSQL trực tiếp lên máy cho lab Docker.
2. Không commit `.env`, password, token, private key.
3. Không dùng `latest` khi cần tái lập kết quả; pin phiên bản image.
4. Không mount Docker socket hoặc cấp quyền privileged tùy tiện.
5. Không chạy cluster nhiều node trên laptop RAM thấp nếu không cần.
6. Không đưa credentials cá nhân vào GitHub Actions.
7. Không dùng production data trong bài thực hành.
