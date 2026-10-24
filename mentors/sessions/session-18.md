# Kịch bản buổi 18 – Docker CI Pipeline

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 18 – Docker CI Pipeline](../../labs/week-09/session-18.md) và [Thử thách thêm](../../labs/week-09/session-18-challenge.md). Slide: [Slide buổi 18](../../slides/04-cicd/session-18.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 9](../grading/week-09.md). Đáp án: [Đáp án tuần 9](../walkthroughs/week-09.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 18: khung 120 phút, demo push và pull image, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Hỏi lớp ai đã từng `docker push` từ laptop; nhắc kết quả cuối: một lần push tạo ra image truy vết được về commit |
| 15-45 | Kiến thức và demo | Tag và digest, GHCR, `GITHUB_TOKEN`, Buildx và cache, demo push và pull (khoảng 15 phút) |
| 45-105 | Thực hành | Lab bắt buộc (Phần 1-4) khoảng 40-60 phút; phần còn lại cho thử thách |
| 105-120 | Review | Xem evidence, giải đáp, mỗi học viên nhắc lại một ý bằng lời của mình |

## Kịch bản demo

Mục tiêu: cho lớp thấy một lần push tạo ra image truy vết được. Khoảng 15 phút trong phần kiến thức.

1. Mở `.github/workflows/publish.yml`, đọc to các khối `permissions`, `login-action`, `metadata-action`. Hỏi lớp: nếu xóa dòng `packages: write` thì bước nào sẽ fail?
2. Tạo một commit nhỏ (sửa chữ trong `starter-project/frontend/index.html`) và push. Nhánh chính tên `master` thì đổi `main` trong workflow:

   ```bash
   git commit -am "demo: doi tieu de trang chu"
   git push origin main
   ```

3. Mở tab Actions, chỉ vào hai job matrix `club-api` và `club-web` chạy song song. Mở log bước `Build and push`, chỉ ra dòng nói về cache (lần đầu là cache miss).
4. Mở trang Packages, chỉ ra tag `sha-xxxxxxx` khớp với 7 ký tự đầu của commit.
5. Pull và chạy image:

   ```bash
   docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
   docker run --rm -d --name demo-api -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
   sleep 2
   curl -s http://localhost:3100/health
   docker rm -f demo-api
   ```

   Thay `OWNER` bằng tên tài khoản viết thường và tag bằng tag thật. Kết quả mong đợi của `curl`:

   ```json
   {"status":"healthy","service":"club-api"}
   ```

6. Push lần hai (đổi một dòng trong `app.js`), cho lớp so sánh thời gian build: lần hai nhanh hơn vì layer `npm ci` được lấy từ cache.

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Hai lần push cho hai tag khác nhau, tag nào là "mới nhất"? Dựa vào đâu? | Dựa vào commit và thời gian push của tag `sha-`; tag không tự nói gì về độ mới. |
| Nếu ai đó force-push làm đổi nội dung tag `v1.0.0`, máy đã pull trước đó thế nào? | Vẫn giữ image cũ (theo digest); tag là mutable, digest thì không. |
| Vì sao runner không cần mật khẩu của bạn mà vẫn push được? | `GITHUB_TOKEN` là token tạm cấp cho mỗi lần chạy, quyền đến từ khối `permissions`. |
| Xóa dòng `packages: write` thì bước nào fail? | Bước `Build and push`; bước login vẫn xanh vì chỉ xác thực danh tính. |
| Build tay để lại dấu vết gì? `latest` hôm nay và tuần sau có chắc là một image không? | Không có dấu vết; không chắc. Tag mutable, digest immutable. |
| Layer nào tốn thời gian nhất trong Dockerfile của club-api? | `npm ci`. |

## Ghi chú theo slide

Slide buổi 18 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): nhấn mạnh kết quả cuối: một lần push tạo ra image truy vết được về commit. Hỏi lớp: ai đã từng `docker push` từ laptop?
- Slide 2 – Vấn đề "mình đã đẩy bản mới" (3 phút): kể chuyện ban chủ nhiệm hỏi "bản nào đang chạy" mà không ai trả lời được. Câu hỏi: build tay để lại dấu vết gì?
- Slide 3 – Image, tag, digest, registry (3 phút): hỏi `latest` hôm nay và tuần sau có chắc là một image không. Chốt: tag mutable, digest immutable.
- Slide 4 – Chiến lược tag (2 phút): cho lớp đoán vì sao cần cả hai loại tag. Đáp: SHA cho mọi build, phiên bản chỉ khi chủ động phát hành.
- Slide 5 – GHCR và `GITHUB_TOKEN` (3 phút): hỏi vì sao runner không cần mật khẩu của bạn mà vẫn push được. Nhấn mạnh package mới tạo thường mặc định private.
- Slide 6 – Buildx và cache (3 phút): liên hệ Dockerfile multi-stage đã học ở tuần 3-4. Hỏi layer nào tốn thời gian nhất (`npm ci`).
- Slide 7 – Ba action Docker chính thức (2 phút): chỉ giới thiệu vai trò, không đọc từng dòng YAML; phần YAML nằm ở bài lab.
- Slide 8 – Kiến trúc pipeline (3 phút): đi theo mũi tên từ trái sang phải, dừng ở bước login để nhắc `permissions`.
- Slide 9 – Cách hoạt động từng bước (2 phút): chỉ vào `.github/workflows/publish.yml` của repo giáo trình (matrix 2 image) để đối chiếu.
- Slide 10 – Demo, từ push đến image chạy được (15 phút theo kịch bản demo ở trên): `/health` không chạm database nên chạy được mà không có Postgres. Lỗi `denied` khi pull dẫn sang phần Gặp lỗi? của bài lab.
- Slide 11 – Lab: bốn phần (khoảng 5 phút giới thiệu):
  - Chuẩn bị: lệnh giả định repo giáo trình ở `~/devops-course`; đi quanh lớp xem ai build lỗi.
  - Phần 1-3: viết workflow, chạy, đọc log, so tag `sha-` với commit; package private thì đổi Public trong Package settings.
  - Phần 4: nhắc lấy digest bằng `docker inspect --format '{{index .RepoDigests 0}}' ten-image`.
- Slide 12 – Lỗi 1, thiếu `packages: write` (4 phút): liên hệ scenario-06 (GitHub Actions fail) trong `examples/troubleshooting`. Để học viên tự đoán nguyên nhân trước khi mở log.
- Slide 13 – Lỗi 2, pull bị từ chối do package private (3 phút): nhấn mạnh không dán PAT vào lệnh hay commit. Liên hệ scenario-07 (ImagePullBackOff) vì cùng họ lỗi pull.
- Slide 14 – Recap (review 15 phút cuối): mỗi học viên nhắc lại một ý bằng lời của mình (exit ticket); dùng phần còn lại để xem evidence và giải đáp.

## Hỗ trợ phần thử thách

Thử thách nằm ở [Thử thách thêm](../../labs/week-09/session-18-challenge.md). Cho học viên tự làm, không đưa lời giải ngay; đi qua từng bàn hỏi "dòng này làm gì".

- Tiêu chí kiểm tra nhanh: GHCR có đủ 2 image, log lần hai có `CACHED`, PR không tạo package.
- Gợi ý cho câu hỏi force-push tag: máy đã pull vẫn giữ image cũ (theo digest), máy pull sau nhận image mới. Đó là lý do deploy nên dùng tag bất biến.

## Lưu ý riêng cho người dạy

- Báo trước từ đầu buổi: workflow cần `packages: write` ở cấp job, và repo `devops-labs` phải để PUBLIC (GHCR miễn phí cho package public, và học viên pull không cần đăng nhập).
- Package mới tạo từ workflow thường mặc định private; học viên phải vào Package settings đổi sang Public (Phần 3). Đây là điểm kẹt số một ở Phần 4.
- Tên image phải chữ thường; tên tài khoản có chữ hoa gây `invalid reference format` nếu tự ghép tag.
- Chuẩn bị sẵn repo demo đã chạy workflow ít nhất một lần để cache `type=gha` có số liệu so sánh lần 1 và lần 2.
- Lỗi pull `unauthorized` giống hệt lỗi gõ sai tên; luôn kiểm tra tên và visibility trước khi nghi quyền.
- Cổng 3100 cho lab, không dùng 3000, 5432, 8080 của stack khác.
