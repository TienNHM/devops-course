# Lộ trình Cơ bản · 14 ngày

> **Tóm tắt:** 14 ngày, mỗi ngày khoảng 2 giờ: 10 ngày học và 4 ngày sửa lỗi, hoàn thiện, demo. Bạn làm một dự án xuyên suốt (Club app), từ máy trống tới image Docker được publish tự động. Ít lý thuyết, nhiều việc làm thật.

**Đây là lộ trình để bắt đầu.** Bạn không cần biết DevOps trước, chỉ cần dùng máy tính thoải mái và sẵn sàng gõ lệnh. Phần đào sâu (Linux quản trị, mạng, tối ưu image, kiểm thử, bảo mật pipeline) nằm ở [Lộ trình Nâng cao](advanced.md).

## Cuối 14 ngày bạn có gì

Một ứng dụng thật của riêng bạn, trên GitHub:

- Chạy cả web, API và database bằng **một lệnh** `docker compose up`.
- Mỗi Pull Request **tự chạy test**. Mỗi lần merge **tự publish image** lên GHCR.
- Bạn kể lại và chạy lại được từng bước, vì chính bạn đã làm từng bước.

## Kế hoạch 14 ngày

Mỗi ngày đi theo thứ tự: **xem slide, làm lab, nộp bài** (note ngắn và commit lên GitHub).

| Ngày | Việc làm | Cuối ngày bạn có | Bài học |
| --- | --- | --- | --- |
| 1 | Dựng máy làm việc | WSL2, VS Code, SSH key, repo `devops-labs` trên máy | [Slide](../slides/01-foundation/session-02.md) · [Lab](../labs/week-01/session-02.md) |
| 2 | Dùng Linux để đọc hiểu dự án | Tìm và đọc code, log của Club app bằng dòng lệnh | [Slide](../slides/01-foundation/session-03.md) · [Lab](../labs/week-02/session-03.md) |
| 3 | Đưa dự án lên Git và GitHub | Club app nằm trong repo qua một Pull Request | [Slide](../slides/01-foundation/session-06.md) · [Lab](../labs/week-03/session-06.md) |
| 4 | Chạy container đầu tiên | Trang web của Club chạy trong container | [Slide](../slides/02-docker/session-07.md) · [Lab](../labs/week-04/session-07.md) |
| 5 | Vận hành và sửa container | Tự gỡ lỗi hai container hỏng | [Slide](../slides/02-docker/session-08.md) · [Lab](../labs/week-04/session-08.md) |
| 6 | Viết Dockerfile cho API | Image `club-api` build và chạy được | [Slide](../slides/02-docker/session-09.md) · [Lab](../labs/week-05/session-09.md) |
| 7 | Database giữ được dữ liệu | Postgres với volume, dữ liệu còn sau khi xóa container | [Slide](../slides/02-docker/session-12.md) · [Lab](../labs/week-06/session-12.md) |
| 8 | Ghép cả hệ thống bằng Compose | `docker compose up` chạy web, API và database | [Slide](../slides/03-compose/session-13.md) · [Lab](../labs/week-07/session-13.md) |
| 9 | CI: tự chạy test | Workflow GitHub Actions xanh trên mỗi PR | [Slide](../slides/04-cicd/session-16.md) · [Lab](../labs/week-08/session-16.md) |
| 10 | Tự publish image | Image trên GHCR sau mỗi lần merge | [Slide](../slides/04-cicd/session-18.md) · [Lab](../labs/week-09/session-18.md) |
| 11–14 | Sửa lỗi, hoàn thiện, demo | Dự án sạch, chạy được từ máy trống, demo 10 phút | [Kế hoạch Ngày 11–14](basic-wrapup.md) |

## Mỗi ngày 2 giờ thế nào

| Thời gian | Việc |
| --- | --- |
| 15 phút | Xem slide: biết hôm nay làm gì và vì sao |
| 85 phút | Làm lab từng bước, mỗi bước có phần tự kiểm tra |
| 20 phút | Ghi `notes/day-NN.md` và commit lên GitHub |

Kẹt quá 15 phút thì xem bảng "Gặp lỗi?" ở cuối lab, rồi hỏi mentor. Ngày nào chưa xong thì bù vào Ngày 11–12.

## Dự án và repo

Mọi ngày làm việc trong repo cá nhân `devops-labs` (Public), ví dụ thư mục `~/devops-labs` trong WSL:

```text
devops-labs/
  club/            dự án Club app (từ Ngày 3)
  notes/           mỗi ngày một file ngắn: day-01.md, day-02.md, ...
  .github/workflows/   workflow CI và publish (Ngày 9 và 10)
```

## Cuối Cơ bản bạn làm được

Tự kiểm tra khi xong. Làm được cả sáu việc là bạn đã đủ nền để sang Nâng cao, hoặc dừng ở đây vẫn dùng được ngay.

- [ ] Dùng terminal Linux (WSL2) để tìm, đọc và kiểm tra file của một dự án.
- [ ] Làm việc với Git và GitHub: nhánh, commit, Pull Request, giải quyết conflict.
- [ ] Chạy, xem log và gỡ lỗi container Docker.
- [ ] Viết Dockerfile cho một API Node.js và build thành image.
- [ ] Chạy web, API và Postgres bằng Docker Compose, dữ liệu không mất khi tạo lại container.
- [ ] Để GitHub Actions tự chạy test và publish image lên GHCR.

## Phần đã chuyển sang Nâng cao

Để 14 ngày vừa sức người mới, các chủ đề sau được tách ra và học sau, khi bạn đã quen tay:

- Tổng quan DevOps, quản trị Linux (user, quyền, process), mạng cơ bản.
- Tối ưu image (multi-stage, cache), mạng giữa các container.
- Compose cho vận hành (healthcheck nâng cao, restart, giới hạn tài nguyên, log).
- Kiểm thử tự động sâu, chiến lược triển khai, bảo mật pipeline.

Xem danh sách đầy đủ ở [Lộ trình Nâng cao](advanced.md).

## Bắt đầu thế nào

1. Làm [4 việc chuẩn bị](getting-started.md#truoc-ngay-1-4-viec-khoang-20-phut) (khoảng 20 phút, chỉ một lần).
2. Vào [Ngày 1: xem slide](../slides/01-foundation/session-02.md), rồi làm [lab Ngày 1](../labs/week-01/session-02.md).

Muốn biết cách học một ngày và các mức L1, L2? Xem [Cách học khóa này](how-to-learn.md). Muốn lên mạng nhanh mà không cần Docker? Có [Vibe Deploy](../vibe/index.md), một lộ trình riêng.
