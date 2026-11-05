# Lộ trình Nâng cao

> **Tóm tắt:** 24 buổi (22 buổi chính và 2 buổi tùy chọn), mỗi buổi khoảng 2 giờ: đào sâu những phần đã tách khỏi Cơ bản (Linux, mạng, tối ưu image, kiểm thử, bảo mật pipeline), sau đó học Kubernetes trên máy cá nhân (kind) và làm dự án cuối khóa theo nhóm. Lộ trình này được học sau [Lộ trình Cơ bản](basic.md).

## Bạn đã sẵn sàng chưa

Nâng cao sử dụng lại dự án Club app, image, Compose và pipeline của Cơ bản. Pipeline là chuỗi bước tự động chạy sau mỗi thay đổi mã nguồn, thường gồm kiểm thử, build và publish. Người học tự kiểm tra trước khi bắt đầu:

- [ ] Chạy được web, API và Postgres bằng một lệnh `docker compose up`, và giải thích được vì sao dữ liệu còn sau khi tạo lại container.
- [ ] Có image của ứng dụng trên GHCR, hoặc tự build được image từ Dockerfile.
- [ ] Đọc được log container và tìm ra nguyên nhân khi container thoát ngay.
- [ ] Dùng được Git với nhánh và Pull Request, và có workflow CI chạy được.
- [ ] Máy chạy được Docker Desktop và còn dư RAM cho một cluster kind. Máy 8 GB đọc [Máy 8 GB và giới hạn RAM](../resources/setup-guide.md#may-8-gb-va-gioi-han-ram) trước.

Nếu thiếu mục nào, quay lại ngày tương ứng ở [Lộ trình Cơ bản](basic.md). Học Kubernetes khi chưa vững Docker sẽ gặp nhiều khó khăn.

## Các phần

Thứ tự gợi ý: học từ Phần 1 đến Phần 5. Phần 6 là module tùy chọn, học sau khi đã quen với CI/CD. Phần 1 đến 3 là nội dung tách từ Cơ bản, mỗi buổi đứng riêng nên người học có thể chọn buổi cần trước.

| Phần | Nội dung | Buổi |
| --- | --- | --- |
| 1 · Nền tảng nâng cao | Tổng quan DevOps, quản trị Linux (user, quyền, process), mạng | [01](../slides/01-foundation/session-01.md), [04](../slides/01-foundation/session-04.md), [05](../slides/01-foundation/session-05.md) |
| 2 · Container nâng cao | Tối ưu image, mạng giữa các container, Compose cho vận hành | [10](../slides/02-docker/session-10.md), [11](../slides/02-docker/session-11.md), [14](../slides/03-compose/session-14.md) |
| 3 · CI/CD nâng cao | Nền tảng CI/CD, kiểm thử tự động, chiến lược triển khai, bảo mật pipeline | [15](../slides/04-cicd/session-15.md), [17](../slides/04-cicd/session-17.md), [19](../slides/04-cicd/session-19.md), [20](../slides/04-cicd/session-20.md) |
| 4 · Kubernetes | Cluster kind, Deployment, Service, cấu hình, probe, PVC, Ingress, vận hành và sửa lỗi | [21](../slides/05-kubernetes/session-21.md) đến [28](../slides/07-operations/session-28.md) |
| 5 · Capstone | Dự án nhóm: hoàn thiện, kiểm thử, cố ý gây lỗi để luyện sửa, demo và bảo vệ | [29](../slides/08-capstone/session-29.md) đến [32](../slides/08-capstone/session-32.md) |
| 6 · Cloud và IaC (tùy chọn) | AWS cục bộ với floci, Terraform và kiểm thử tích hợp. Chỉ học bằng slide, không cần tài khoản AWS | [33](../slides/09-cloud/session-33.md), [34](../slides/09-cloud/session-34.md) |

Mỗi buổi đi theo thứ tự: slide, lab, rồi nộp bài. Dự án cuối khóa: [Capstone](../assignments/capstone/README.md), cách chấm ở [Rubric Capstone](capstone-rubric.md).

## Cuối Nâng cao bạn làm được

- [ ] Quản trị Linux cơ bản, kiểm tra mạng, tối ưu image và chạy Compose theo cách phù hợp với vận hành.
- [ ] Viết kiểm thử tự động, chặn merge khi CI đỏ, triển khai và quay về bản cũ, giữ pipeline an toàn.
- [ ] Dựng cluster Kubernetes local bằng kind, triển khai ứng dụng với Deployment, Service, ConfigMap, Secret, PVC và Ingress.
- [ ] Tự điều tra và sửa các lỗi thường gặp như ImagePullBackOff, CrashLoopBackOff, OOMKilled.
- [ ] Làm việc nhóm để kết hợp Docker, Compose, CI/CD và Kubernetes thành một sản phẩm, sau đó demo và bảo vệ kỹ thuật.

## Tiêu chí hoàn thành

Cách tính điểm, hoàn thành khóa và nộp trễ nằm ở [Đánh giá](assessment.md); bài kiểm tra ở [Technical Assessment](technical-assessment.md). Mọi nội dung chạy trên máy cá nhân, không cần cloud. Toàn cảnh khóa học xem tại [Lộ trình đầy đủ](syllabus.md).
