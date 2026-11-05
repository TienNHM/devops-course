# Lộ trình Cơ bản · 14 ngày

> **Tóm tắt:** 14 ngày, mỗi ngày khoảng 2 giờ: 10 ngày học và 4 ngày sửa lỗi, hoàn thiện, demo. Mỗi ngày là một bộ slide: người học xem và gõ lệnh làm theo trên chính dự án của mình (Club app), từ máy trống tới image Docker được publish tự động. Lộ trình không có bài tập hay nộp bài.

**Đây là lộ trình mở đầu.** Người học không cần biết DevOps trước, chỉ cần sử dụng máy tính thành thạo ở mức cơ bản và sẵn sàng gõ lệnh. DevOps là cách phối hợp giữa phát triển và vận hành phần mềm, trong đó việc build, kiểm thử và triển khai được tự động hóa. Phần đào sâu (Linux quản trị, mạng, tối ưu image, kiểm thử, bảo mật pipeline) nằm ở [Lộ trình Nâng cao](advanced.md).

## Cuối 14 ngày bạn có gì

Một ứng dụng thật của riêng người học, trên GitHub:

- Chạy cả web, API và database bằng **một lệnh** `docker compose up`.
- Mỗi Pull Request **tự chạy test**. Mỗi lần merge **tự publish image** lên GHCR.
- Người học kể lại và chạy lại được từng bước, vì chính mình đã thực hiện từng bước.

## Kế hoạch 14 ngày

Mỗi ngày học bằng **một bộ slide**: xem, gõ lệnh làm theo, kiểm tra kết quả. Nút **Trình chiếu** trên trang slide cho phép học từng slide một.

| Ngày | Việc làm | Cuối ngày bạn có | Slide |
| --- | --- | --- | --- |
| 1 | Dựng máy làm việc | WSL2, VS Code, SSH key, repo `devops-labs` trên máy | [Ngày 1](../slides/01-foundation/session-02.md) |
| 2 | Dùng Linux để đọc hiểu dự án | Tìm và đọc code, log của Club app bằng dòng lệnh | [Ngày 2](../slides/01-foundation/session-03.md) |
| 3 | Đưa dự án lên Git và GitHub | Club app nằm trong repo qua một Pull Request | [Ngày 3](../slides/01-foundation/session-06.md) |
| 4 | Chạy container đầu tiên | Trang web của Club chạy trong container | [Ngày 4](../slides/02-docker/session-07.md) |
| 5 | Vận hành và sửa container | Tự gỡ lỗi hai container hỏng | [Ngày 5](../slides/02-docker/session-08.md) |
| 6 | Viết Dockerfile cho API | Image `club-api` build và chạy được | [Ngày 6](../slides/02-docker/session-09.md) |
| 7 | Database giữ được dữ liệu | Postgres với volume, dữ liệu còn sau khi xóa container | [Ngày 7](../slides/02-docker/session-12.md) |
| 8 | Ghép cả hệ thống bằng Compose | `docker compose up` chạy web, API và database | [Ngày 8](../slides/03-compose/session-13.md) |
| 9 | CI: tự chạy test | Workflow GitHub Actions xanh trên mỗi PR | [Ngày 9](../slides/04-cicd/session-16.md) |
| 10 | Tự publish image | Image trên GHCR sau mỗi lần merge | [Ngày 10](../slides/04-cicd/session-18.md) |
| 11–14 | Sửa lỗi, hoàn thiện, demo | Dự án sạch, chạy được từ máy trống, demo 10 phút | [Kế hoạch Ngày 11–14](basic-wrapup.md) |

## Mỗi ngày 2 giờ thế nào

| Thời gian | Việc |
| --- | --- |
| 15 phút | Mở đầu: hôm nay làm ra gì, bài toán thật của dự án |
| 85 phút | Thực hành theo slide, từng bước có phần "Kiểm tra: bạn đúng khi" |
| 20 phút | Lỗi thường gặp, tự kiểm tra, hỏi mentor |

Khi một bước kéo dài quá 15 phút, xem slide "Lỗi thường gặp" của ngày đó, sau đó hỏi mentor. Ngày nào chưa hoàn thành thì được bù vào Ngày 11–12.

## Dự án và repo

Mọi ngày làm việc trong repository (kho mã nguồn) cá nhân `devops-labs` (Public), ví dụ thư mục `~/devops-labs` trong WSL:

```text
devops-labs/
  club/                dự án Club app (từ Ngày 3)
  .github/workflows/   workflow CI và publish (Ngày 9 và 10)
```

## Cuối Cơ bản bạn làm được

Người học tự kiểm tra khi kết thúc. Hoàn thành cả sáu việc nghĩa là đã đủ nền tảng để sang Nâng cao, hoặc dừng tại đây vẫn có thể áp dụng ngay.

- [ ] Dùng terminal Linux (WSL2) để tìm, đọc và kiểm tra file của một dự án.
- [ ] Làm việc với Git và GitHub: nhánh, commit, Pull Request, giải quyết conflict.
- [ ] Chạy, xem log và gỡ lỗi container Docker. Container là một tiến trình được đóng gói cùng môi trường chạy riêng, tách biệt với phần còn lại của máy.
- [ ] Viết Dockerfile cho một API Node.js và build thành image.
- [ ] Chạy web, API và Postgres bằng Docker Compose, dữ liệu không mất khi tạo lại container.
- [ ] Để GitHub Actions tự chạy test và publish image lên GHCR.

## Phần đã chuyển sang Nâng cao

Để 14 ngày phù hợp với người mới, các chủ đề sau được tách ra và học sau, khi người học đã quen với công cụ:

- Tổng quan DevOps, quản trị Linux (user, quyền, process), mạng cơ bản.
- Tối ưu image (multi-stage, cache), mạng giữa các container.
- Compose cho vận hành (healthcheck nâng cao, restart, giới hạn tài nguyên, log).
- Kiểm thử tự động sâu, chiến lược triển khai, bảo mật pipeline.

Danh sách đầy đủ nằm ở [Lộ trình Nâng cao](advanced.md).

## Bắt đầu thế nào

1. Làm [4 việc chuẩn bị](getting-started.md#truoc-ngay-1-4-viec-khoang-20-phut) (khoảng 20 phút, chỉ một lần).
2. Vào [Ngày 1](../slides/01-foundation/session-02.md) và chọn **Trình chiếu**.

Cách học và các tình huống lỗi thường gặp được trình bày ở [Cách học khóa này](how-to-learn.md). Người học cần đưa web lên mạng nhanh mà không dùng Docker có thể theo [Vibe Deploy](../vibe/index.md), một lộ trình riêng.
