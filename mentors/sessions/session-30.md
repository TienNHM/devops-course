# Kịch bản mentor – Buổi 30: Implementation

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 30 – Implementation](../../labs/week-15/session-30.md). Slide: [Slide buổi 30](../../slides/08-capstone/session-30.md). Chấm bài: [Chấm bài tuần 15](../grading/week-15.md). Đáp án: [Walkthrough tuần 15](../walkthroughs/week-15.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 30: khung 120 phút, demo một route một PR, câu hỏi cho lớp, ghi chú giảng viên theo từng slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Kế hoạch buổi 29: ai giữ vai trò nào, Issue nào ở cột Ready; `git switch -c`, `git push -u`, mở PR; `git status -sb` sạch và `.env` bị chặn |
| 15-45 | Kiến thức và demo | Lát cắt dọc và PR nhỏ, tách tầng dữ liệu, mã trạng thái, ba lớp kiểm tra; demo 8-10 phút |
| 45-105 | Thực hành | Bốn vai trò A, B, C, D làm song song, review chéo, merge theo thứ tự A, B, C, D |
| 105-120 | Review | Kiểm tra checklist L1 trên màn hình từng nhóm, nhắc mỗi người có một PR đã merge và một PR đã review |

## Demo của mentor

Mentor demo trên starter-project chưa sửa, theo kịch bản 8-10 phút.

1. Chạy stack và cho thấy hiện trạng chỉ có `GET`:

   ```bash
   cd ~/club-management
   cp .env.example .env
   docker compose up -d --build
   curl -i -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test.user@example.com"}'
   ```

   Kết quả mong đợi (rút gọn): Express trả `404 Not Found` vì chưa có route `POST`.

2. Tạo nhánh và thêm duy nhất route `GET /api/members/:id` kèm một test. Chạy `npm test` trước và sau khi sửa để lớp thấy vòng đỏ-xanh.
3. Mở PR, cho lớp xem tab Checks chạy CI, rồi nhờ một học viên review và approve.
4. Cố tình push một commit làm test đỏ, cho lớp thấy nút merge bị chặn.

## Câu hỏi mentor nên hỏi lớp

- Vì sao chỉ thêm một route mỗi PR thay vì làm cả CRUD rồi mới PR?
- Test này có cần PostgreSQL không? Nếu cần thì CI sẽ phải làm gì thêm?
- Nếu hai người cùng sửa `app.js`, conflict xảy ra ở đâu và giảm thiểu bằng cách nào?

## Ghi chú giảng viên theo slide

Các ghi chú dưới đây chuyển nguyên văn từ slide gốc (trước khi [Slide buổi 30](../../slides/08-capstone/session-30.md) được rút gọn). Số thứ tự là của slide gốc; tên slide nêu kèm để bạn tìm ở bản rút gọn.

- Slide 1 – Mục tiêu buổi học: mở buổi 3 phút. Đích: sau 60 phút lab, `main` chạy được từ đầu đến cuối, kể cả khi vài tính năng nâng cao còn dang dở.
- Slide 2 – Ôn tập nhanh (15 phút đầu): hỏi nhanh từng nhóm: Issue đầu tiên bạn sẽ nhận là gì? Ai review PR của bạn? Phát hiện sớm nhóm nào chưa có repo.
- Slide 3 – Vấn đề thực tế: hỏi lớp: "Ai từng ghép code ngày cuối và hỏng?" Nguyên tắc hôm nay: tích hợp liên tục theo lát cắt nhỏ, mỗi PR 20-30 phút.
- Slide 4 – Lát cắt dọc và PR nhỏ: nhóm 3 người gộp vai trò nhưng giữ vòng review chéo. Merge theo thứ tự A, B, C, D để mọi người rebase lên `main` mới.
- Slide 5 – Tách tầng dữ liệu để test không cần DB: hỏi: "Nếu không tách, CI cần thêm gì?" (service container PostgreSQL). Test nhanh và chạy offline là lợi ích chính.
- Slide 6 – Mã trạng thái HTTP của CRUD: mã trạng thái là một phần của hợp đồng API. Hỏi: "PUT id không tồn tại trả mã nào?" Đáp: 404.
- Slide 7 – Ba lớp kiểm tra trước khi merge: nhắc: CI trên PR không cần đăng nhập registry vì `push: false`. Publish chỉ chạy sau khi merge vào `main`.
- Slide 8 – Kiến trúc luồng làm việc và luồng request: dùng hai sơ đồ cùng lúc: trái là quy trình nhóm, phải là đường đi của một request. Dữ liệu sai bị chặn ở validation, không chạm tới DB.
- Slide 9 – Truy vấn tham số hóa và middleware lỗi: hỏi: "Vì sao dùng `$1` thay vì nối chuỗi?" Gợi ý cho lớp nghĩ tới đầu vào độc hại như một câu SQL được nhét vào trường name.
- Slide 10 – Demo, hiện trạng chỉ có GET: demo 8-10 phút gồm slide 10-11. Chạy trên curl trong WSL, không dùng PowerShell vì quote JSON dễ sai.
- Slide 11 – Demo, một route một PR và CI chặn merge: ý chính: PR nhỏ dễ review, conflict ít. Hỏi thêm: nếu hai người cùng sửa `app.js` thì conflict xảy ra ở đâu và giảm bằng cách nào (PR nhỏ, rebase thường xuyên).
- Slide 12 – Lab vai trò A, repo, validation, CRUD: mã đầy đủ nằm trong bài lab; học viên chép từ đó. Giải thích vì sao `parseId` giới hạn tới 2147483647: kiểu INTEGER của cột SERIAL.
- Slide 13 – Lab vai trò A, test với repo giả: cho lớp thấy một test cố tình sai để nhận ra output đỏ. Nhắc 8 test gồm cả 400, 404, 409 chứ không chỉ đường thành công.
- Slide 14 – Lab vai trò B và C, giao diện và dữ liệu bền vững: hỏi: "`down` khác `down -v` thế nào?" Nhắc `init.sql` chỉ chạy khi volume còn trống, nên đổi schema phải xử lý riêng.
- Slide 15 – Lab vai trò D, CI trên PR và publish GHCR: check name chỉ hiện sau lần chạy đầu tiên, nên bật branch protection sau khi PR CI đầu tiên chạy xong. Sau merge: `gh run list --workflow publish.yml --limit 3`.
- Slide 16 – Review chéo và kiểm tra bản clone sạch: chọn người chưa đụng vào code để chạy theo README. Nếu không chạy được thì dự án chưa xong. Thay ORG bằng tên thật.
- Slide 17 – Lab L2, thử thách: với kind: `init.sql` không tự chạy trên Kubernetes, cần nạp bằng `kubectl exec -i -n club postgres-0 -- psql -U club -d clubdb`. Tên cluster xem bằng `kind get clusters`.
- Slide 18 – Phá lỗi, đổi tên trường API làm trống giao diện: học viên phá, chẩn đoán, rồi khôi phục bằng `git restore`. Hỏi: "Test nào sẽ bắt được lỗi này?" (một test khẳng định các khóa của JSON).
- Slide 19 – Lỗi thường gặp: nhắc tên image GHCR phải viết thường. Với conflict lớn: nhánh sống quá lâu, rebase lên `main` mỗi lần có PR merge.
- Slide 20 – Recap và nộp bài: kiểm tra checklist L1 trên màn hình từng nhóm trong 15 phút cuối. Nhắc mỗi người có ít nhất một PR đã merge và đã review một PR khác.

## Lưu ý riêng cho người dạy

- Mã gợi ý cho API, test và giao diện nằm ở [Buổi 30 – Mã gợi ý và thử thách](../../labs/week-15/session-30-challenge.md). Capstone không phát bản tham chiếu: để nhóm tự thử 15 phút trước khi mở mã gợi ý, và chỉ mở khi nhóm kẹt.
- Mã API trong lab đã được chạy lại trên Node.js 22 với PostgreSQL 17: 8 test pass; phần Kubernetes, GitHub Actions và GHCR chưa được chạy lại (xem [Walkthrough tuần 15](../walkthroughs/week-15.md)).
- Dùng `curl` trong WSL, không dùng PowerShell vì quote JSON dễ sai (lỗi `400 Invalid JSON body`).
- Cổng 3000 và 8080 hay bị chiếm bởi stack cũ; nhắc `docker compose down` trước khi thử bản clone sạch.
- Chọn người chưa từng đụng vào code làm bước clone sạch; nếu README không đủ để họ chạy được thì dự án chưa xong.
- Merge theo thứ tự A, B, C, D; bật branch protection sau khi PR CI đầu tiên chạy xong để các check `test`, `validate-compose`, `build-images` hiện ra trong danh sách chọn.
