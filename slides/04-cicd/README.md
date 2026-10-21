# Slide deck 04 – CI/CD

GitHub Actions, Workflow, Build, Test, GHCR · 6 buổi (15–20) · khoảng 120 slide

## Danh sách buổi

| Buổi | Chủ đề | Nội dung chính | Slide |
| --- | --- | --- | --- |
| 15 | CI/CD Fundamentals | CI, Delivery, Deployment, pipeline, artifact, runner, trigger | [Slide buổi 15](./session-15.md) |
| 16 | GitHub Actions Basics | Workflow, YAML, events, jobs, steps, cache, matrix | [Slide buổi 16](./session-16.md) |
| 17 | Automated Testing | Unit test, integration test, test report, branch protection | [Slide buổi 17](./session-17.md) |
| 18 | Docker CI Pipeline | Docker build, Buildx, cache, tagging, GHCR, authentication | [Slide buổi 18](./session-18.md) |
| 19 | CD & Deployment Strategies | Environment, secrets, approval, rollback, deployment strategy | [Slide buổi 19](./session-19.md) |
| 20 | Pipeline Security | Least privilege, permissions, secret, dependency scan, SBOM, image scan | [Slide buổi 20](./session-20.md) |

Tổng số slide: buổi 15 có 20 slide, buổi 16 có 20 slide, buổi 17 có 20 slide; mỗi buổi 18, 19, 20 theo khung 14 đến 22 slide. Tổng cả deck khoảng 100 đến 120 slide.

## Mục tiêu của deck

- Hiểu CI, Continuous Delivery, Continuous Deployment và các thành phần của pipeline.
- Viết, chạy và debug workflow GitHub Actions cho backend Club API.
- Tự động hóa test (unit và integration) và dùng branch protection để chặn merge khi CI đỏ.
- Build và đẩy image lên GHCR có tag truy vết được về commit.
- Deploy có kiểm soát (environment, approval, rollback) và bảo mật pipeline (quyền tối thiểu, secret, quét lỗ hổng).

## Cấu trúc mỗi buổi

1. Learning objectives
2. Problem statement
3. Concept
4. Architecture
5. How it works
6. Demo
7. Hands-on lab (L1 và L2)
8. Common mistakes
9. Challenge
10. Recap

Mỗi slide chỉ có một ý chính và có khối "Ghi chú giảng viên" gồm lời dẫn, thời lượng, câu hỏi cho lớp. Slide hỗ trợ làm lab, không thay thế bài lab: lệnh đầy đủ nằm ở bài lab tương ứng trong thư mục `labs/`.

## Mẹo trình bày

- Chiếu bằng trình duyệt: mở trang slide trên site giáo trình, cuộn từng slide (mỗi slide là một mục có tiêu đề `Slide K`), dùng Ctrl và dấu cộng để phóng to.
- Cỡ chữ: phóng trình duyệt 150 đến 175 phần trăm khi chiếu lên màn hình lớp; code block cần đọc được từ cuối phòng.
- Chia sẻ màn hình terminal: tăng cỡ chữ terminal (WSL Ubuntu) lên 16 đến 18, dùng nền tối, chỉ mở một cửa sổ terminal và một cửa sổ trình duyệt để lớp không bị rối.
- Chuẩn bị trước buổi: repo demo đã có workflow chạy sẵn, hai PR mẫu (một xanh, một đỏ), Docker Desktop đang chạy.
- Mở khối "Ghi chú giảng viên" trên máy của bạn, không chiếu lên màn hình lớp.
- Không để lộ token, secret hoặc file `.env` khi chia sẻ màn hình.
