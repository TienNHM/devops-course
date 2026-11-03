# Lộ trình Cơ bản · Tuần 1–10

> **Tóm tắt:** 10 tuần, 20 buổi: Linux, Git, Docker, Compose và GitHub Actions. Cuối lộ trình, ứng dụng của bạn chạy bằng một lệnh và tự được kiểm thử, đóng gói, đưa lên kho image. Chưa có Kubernetes: phần đó nằm ở [Lộ trình Nâng cao](advanced.md).

**Đây là lộ trình để bắt đầu.** Bạn không cần biết DevOps trước, chỉ cần dùng máy tính thoải mái và sẵn sàng gõ lệnh.

## Cuối Cơ bản bạn làm được

Tự kiểm tra khi học xong. Làm được cả năm việc là bạn đã đủ nền để sang Nâng cao, hoặc dừng ở đây vẫn dùng được ngay.

- [ ] Dùng terminal Linux (WSL2) để quản lý file, process, quyền truy cập và kiểm tra kết nối mạng.
- [ ] Làm việc nhóm bằng Git: nhánh, Pull Request, giải quyết conflict.
- [ ] Đóng gói một API thành image Docker gọn nhẹ và cho các container nói chuyện với nhau.
- [ ] Chạy web, API và Postgres bằng một lệnh Docker Compose, có kiểm tra sức khỏe và giữ được dữ liệu.
- [ ] Để GitHub Actions tự chạy test, chặn merge khi test đỏ và publish image lên GHCR.

## Ba giai đoạn

| Giai đoạn | Tuần | Bạn làm được | Bắt đầu |
| --- | --- | --- | --- |
| 1 · Nền tảng | 01–03 | Môi trường WSL2 chạy được, dùng Linux, hiểu mạng, làm việc với Git và Pull Request | [Tuần 01](../labs/week-01/README.md) |
| 2 · Container | 04–07 | Chạy và gỡ lỗi container, viết Dockerfile, nối mạng và lưu dữ liệu, chạy cả hệ thống bằng Compose | [Tuần 04](../labs/week-04/README.md) |
| 3 · CI/CD | 08–10 | Workflow tự kiểm thử, publish image lên GHCR, triển khai local bằng script, kiểm tra quyền pipeline | [Tuần 08](../labs/week-08/README.md) |

Mỗi tuần có 2 buổi 120 phút. Xem kế hoạch từng tuần ở trang tuần: [Tuần 01](../labs/week-01/README.md), [02](../labs/week-02/README.md), [03](../labs/week-03/README.md), [04](../labs/week-04/README.md), [05](../labs/week-05/README.md), [06](../labs/week-06/README.md), [07](../labs/week-07/README.md), [08](../labs/week-08/README.md), [09](../labs/week-09/README.md), [10](../labs/week-10/README.md).

## Bắt đầu thế nào

1. Làm [5 việc trước Buổi 01](getting-started.md#truoc-buoi-01-5-viec-khoang-30-phut) (khoảng 30 phút, chỉ một lần).
2. Vào [Buổi 01 – DevOps Introduction](../labs/week-01/session-01.md).
3. Mỗi buổi: đọc, làm lab theo từng phần có bước tự kiểm tra, gặp lỗi thì xem bảng "Gặp lỗi?", rồi nộp bài.

Cần biết cách học một buổi và hai mức L1, L2? Xem [Cách học khóa này](how-to-learn.md).

## Xong Cơ bản rồi thì sao

- **Muốn học tiếp:** sang [Lộ trình Nâng cao](advanced.md) (Kubernetes và dự án cuối khóa).
- **Muốn đưa web lên mạng nhanh:** [Vibe Deploy](../vibe/index.md), một lộ trình riêng, không cần Kubernetes.
- **Muốn xem toàn cảnh 16 tuần:** [Lộ trình đầy đủ](syllabus.md).
