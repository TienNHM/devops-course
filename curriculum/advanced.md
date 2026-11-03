# Lộ trình Nâng cao · Tuần 11–16

> **Tóm tắt:** 6 tuần, 12 buổi: Kubernetes trên máy bạn (kind) rồi dự án cuối khóa theo nhóm. Học sau [Lộ trình Cơ bản](basic.md): bạn cần dùng được Docker, Compose và GitHub Actions trước khi vào đây.

## Bạn đã sẵn sàng chưa

Nâng cao dùng lại image, Compose và pipeline của Cơ bản. Tự kiểm tra trước khi vào Buổi 21:

- [ ] Bạn chạy được web, API và Postgres bằng một lệnh `docker compose up`, và giải thích được vì sao dữ liệu còn sau khi tạo lại container.
- [ ] Bạn có image của ứng dụng trên GHCR, hoặc tự build được image từ Dockerfile.
- [ ] Bạn đọc được log container và tìm ra nguyên nhân khi container thoát ngay.
- [ ] Bạn dùng được Git với nhánh và Pull Request.
- [ ] Máy bạn chạy được Docker Desktop và còn dư RAM cho một cluster kind. Máy 8 GB đọc [Máy 8 GB và giới hạn RAM](../resources/setup-guide.md#may-8-gb-va-gioi-han-ram) trước.

Thiếu mục nào thì quay lại tuần tương ứng ở [Lộ trình Cơ bản](basic.md). Học thẳng Kubernetes khi chưa vững Docker sẽ rất khó.

## Cuối Nâng cao bạn làm được

- [ ] Dựng cluster Kubernetes local bằng kind và deploy ứng dụng bằng Deployment, Service, ConfigMap, Secret.
- [ ] Đặt giới hạn tài nguyên và health probe, lưu dữ liệu Postgres bằng PVC, mở ứng dụng ra bằng Ingress.
- [ ] Tự điều tra và sửa các lỗi hay gặp như ImagePullBackOff, CrashLoopBackOff, OOMKilled.
- [ ] Làm việc nhóm để ghép Docker, Compose, CI/CD và Kubernetes thành một sản phẩm, rồi demo và bảo vệ kỹ thuật.

## Hai giai đoạn

| Giai đoạn | Tuần | Bạn làm được | Bắt đầu |
| --- | --- | --- | --- |
| 4 · Kubernetes | 11–14 | Cluster kind, Deployment, Service, cấu hình, probe, PVC, Ingress, vận hành và sửa lỗi | [Tuần 11](../labs/week-11/README.md) |
| 5 · Capstone | 15–16 | Dự án nhóm: hoàn thiện, kiểm thử, cố ý gây lỗi để luyện sửa, demo và bảo vệ | [Tuần 15](../labs/week-15/README.md) |

Các tuần của giai đoạn 4: [Tuần 11](../labs/week-11/README.md), [12](../labs/week-12/README.md), [13](../labs/week-13/README.md), [14](../labs/week-14/README.md). Dự án cuối khóa: [Capstone](../assignments/capstone/README.md), cách chấm ở [Rubric Capstone](capstone-rubric.md).

## Bắt đầu thế nào

Vào [Buổi 21: xem slide](../slides/05-kubernetes/session-21.md), rồi làm [lab Buổi 21](../labs/week-11/session-21.md). Mọi thứ chạy trên máy bạn, không cần cloud và không mở máy ra Internet.

## Tiêu chí hoàn thành khóa

Cách tính điểm, hoàn thành khóa và nộp trễ nằm ở [Đánh giá](assessment.md); bài kiểm tra ở [Technical Assessment](technical-assessment.md). Muốn xem toàn cảnh 16 tuần: [Lộ trình đầy đủ](syllabus.md).
