# Chấm điểm tuần 15 – Capstone: lập kế hoạch và triển khai

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 15](../../assignments/weekly/week-15.md). Đáp án và bằng chứng cần thấy: [Walkthrough tuần 15](../walkthroughs/week-15.md). Kịch bản dạy: [Buổi 29](../sessions/session-29.md), [Buổi 30](../sessions/session-30.md).
:::

> **Tóm tắt:** Barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho bài tập tuần 15 (requirement, kiến trúc, ADR, CRUD có test, CI và GHCR).

## Barem chấm

Nguyên văn từ đề bài. Tổng 100 điểm, cộng tối đa 10 điểm L2.

| Tiêu chí | Mô tả mức đạt / không đạt | Điểm |
| --- | --- | --- |
| Nhiệm vụ 1: Requirement và repo sạch | Đạt: F1 đến F8 và 3 dòng phi chức năng, mỗi dòng có cách kiểm chứng đo được; `check-ignore` và `ls-files` có output đúng. Không đạt: requirement mơ hồ, hoặc `.env` nằm trong repo. Trừ nửa điểm nếu thiếu owner hoặc thiếu dòng phi chức năng | 15 |
| Nhiệm vụ 2: Kiến trúc, phân vai, backlog | Đạt: sơ đồ khớp hệ thống thật (có bảng đối chiếu), vòng review khép kín, từ 12 Issue có tiêu chí hoàn thành, owner, size, milestone. Không đạt: sơ đồ không phản ánh `compose.yaml` hoặc `k8s/`, Issue không có checklist, một người giữ gần hết việc | 15 |
| Nhiệm vụ 3: Ba ADR | Đạt: ba ADR đủ bốn phần, so sánh thật, Hệ quả có cả mặt khó, mỗi ADR có review kèm comment. Không đạt: ADR chỉ có một lựa chọn, hoặc viết cho đủ số lượng | 12 |
| Nhiệm vụ 4: CRUD, test và stack | Đạt: từ 5 test pass không cần DB, đủ bảy kết quả `curl`, dữ liệu còn sau `down` và `up`, 409 cho email trùng. Không đạt: thiếu `test-results.txt`, test cần DB thật, hoặc email trùng trả 500. Phần test 8 điểm, `curl` và dữ liệu bền vững 10 điểm, giao diện và 409 4 điểm | 22 |
| Nhiệm vụ 5: CI, GHCR và quy trình PR | Đạt: CI chạy ba lớp trên PR, publish thành công, image có tag SHA trên GHCR, mỗi người có PR đã merge và review chéo, một lỗi tích hợp được chẩn đoán bằng bằng chứng. Không đạt: workflow chưa từng chạy, secret nằm trong file, hoặc không có dấu vết review | 16 |
| Câu hỏi kiểm tra kiến thức | Mỗi câu 2 điểm: đúng ý chính và dùng đúng thuật ngữ; sai hoặc mơ hồ: 0 đến 1 điểm | 10 |
| Cấu trúc nộp bài và an toàn | Đạt: đúng cấu trúc thư mục, README đủ 7 mục và đánh dấu L1/L2, source chạy lại được, không có secret, PR có review | 10 |
| **Tổng bắt buộc** | | **100** |
| Thử thách A (L2) | CI đỏ chặn merge có bằng chứng, phân tích đúng điểm mù của ba check | +4 |
| Thử thách B (L2) | Tag semver hoạt động, so sánh digest, mô tả rollback chính xác | +3 |
| Thử thách C (L2) | Bản mới chạy trên kind, `POST` thành công, so sánh Compose và Kubernetes có bằng chứng | +3 |
| **Điểm thưởng tối đa** | L2 không làm tổng vượt quá 110 | **10** |

## Lỗi hay bị trừ điểm

- Nộp chỉ ảnh chụp màn hình, không có output lệnh dạng text trong `evidence/`.
- Requirement mơ hồ, không có mã trạng thái, lệnh hoặc số liệu để kiểm chứng.
- Chia Issue theo công cụ ("làm Docker", "làm Kubernetes") thay vì theo kết quả có thể demo, hoặc Issue không có checklist tiêu chí hoàn thành.
- Sơ đồ kiến trúc dán nguyên mẫu, không đối chiếu với `compose.yaml` và `k8s/`, hoặc mũi tên không có nhãn dữ liệu.
- ADR chỉ nêu một lựa chọn, bỏ trống mục Hệ quả, hoặc ADR được merge mà không có reviewer comment.
- `.env`, mật khẩu hay token nằm trong repo hoặc trong file nộp; hoặc chỉ xóa file ở commit sau mà không nói gì về rotate secret.
- Push thẳng lên `main`, PR không có reviewer khác tác giả, hoặc một người nhận hầu hết PR và Issue của nhóm.
- `npm test` chỉ pass khi PostgreSQL đang chạy, hoặc test không phủ 400, 404, 409.
- Email trùng trả 500, DELETE trả 200 có body thay vì 204, hoặc id không hợp lệ làm API sập.
- Kiểm tra bằng `docker compose down -v` rồi kết luận "dữ liệu còn" (thực ra đã xóa volume), hoặc đọc dữ liệu ngay khi backend chưa `ready`.
- Workflow để sai `context` (còn tiền tố `starter-project/`), thiếu `permissions` cho publish, hoặc chưa từng chạy mà vẫn báo "CI xong".
- Dùng mỗi tag `latest` cho image và không giải thích truy vết hay rollback.
- Làm trong `/mnt/c` thay vì filesystem WSL; file trong `source/` không khớp với thứ đã chạy.
- PR không có người review, hoặc nộp sau hạn mà không báo trước.

## Lệnh kiểm tra nhanh

Chạy trên repo nhóm và trên thư mục `devops-labs` của học viên (từ walkthrough tuần 15):

```bash
git shortlog -sn --no-merges
gh pr list --state merged
grep -n "context:" .github/workflows/publish.yml
```

- `git shortlog -sn --no-merges` cho thấy phân bố đóng góp giữa các thành viên.
- `gh pr list --state merged` để đếm PR đã merge.
- `grep -n "context:" .github/workflows/publish.yml` cho thấy workflow đã sửa đường dẫn chưa (phải là `context: backend` và `context: frontend`).

Điểm cá nhân chỉ nên cao khi người đó giải thích được ít nhất một phần mình không trực tiếp viết.

## Câu hỏi kiểm tra kiến thức

Nguyên văn từ đề bài; học viên trả lời trong mục "Câu hỏi kiểm tra" của `lab-30/report.md`. Đáp án gợi ý ở [Walkthrough tuần 15](../walkthroughs/week-15.md).

1. Vì sao "API chạy tốt" không phải một requirement tốt? Viết lại nó thành một requirement kiểm chứng được cho `DELETE /api/members/:id`.
2. Vì sao truyền `repo` vào `createApp` giúp `npm test` chạy được mà không cần PostgreSQL, và test kiểu này không bắt được loại lỗi nào của SQL thật?
3. Email trùng nên trả 409 chứ không phải 500. Lỗi nào của PostgreSQL gây ra tình huống này và bước nào trong API biến nó thành 409?
4. `docker compose down` và `docker compose down -v` khác nhau thế nào về dữ liệu, và tại sao thêm cột mới vào `database/init.sql` không làm database cũ có cột đó?
5. Một PR có CI xanh nhưng sau khi merge, workflow publish đỏ. Hãy nêu ba điều bạn kiểm tra đầu tiên và vì sao trigger của hai workflow có thể cho kết quả khác nhau.

## Câu hỏi vấn đáp

Chấm bằng bằng chứng trong `evidence/`, đối chiếu với lịch sử PR của repo nhóm. Bảng dưới đây dùng cho cả hai buổi (nguyên văn từ walkthrough tuần 15).

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Requirement và repo sạch | `git check-ignore -v .env` có output; `git ls-files` lọc `.env` rỗng; requirement có mã trạng thái hoặc lệnh | Requirement còn "chạy tốt", bảng chép nguyên mẫu lab, lịch sử không có commit baseline | "Vì sao `.env.example` được commit còn `.env` thì không?" Nếu lỡ commit `.env` thì làm gì đầu tiên? |
| Kiến trúc và backlog | README có sơ đồ đã bổ sung thành phần, bảng đối chiếu với `compose.yaml` hoặc `k8s/`; danh sách Issue có owner, size, milestone, checklist | Sơ đồ dán nguyên mẫu, Issue chia theo công cụ, một người nhận gần hết Issue | "Chỉ cho tôi dòng nào trong `nginx.conf` ứng với mũi tên này." "Vì sao Issue này size L, bạn tách thế nào?" |
| ADR | Ba file đánh số, có hai phương án thật, Hệ quả có mặt khó; PR có comment reviewer và câu trả lời | Chỉ một lựa chọn, Hệ quả toàn điều tốt, ADR merge không có comment | "Điều gì trở nên khó hơn sau quyết định này?" "Nếu đổi quyết định, bạn làm gì với ADR cũ?" |
| CRUD, test và stack | `test-results.txt` có từ 5 test pass; bảy lệnh `curl` kèm mã; chuỗi thêm, `down`, chờ `/ready`, `up`, đọc lại; một ca 409 | Test chỉ pass khi có DB, `curl` không có mã, dùng `down -v` rồi kết luận dữ liệu còn, source không khớp thứ đã chạy | "Vì sao `npm test` không cần PostgreSQL?" "Email trùng sinh lỗi gì ở DB, API xử lý chỗ nào?" "Vì sao phải chờ `/ready`?" |
| CI, GHCR và quy trình PR | `gh run list` hoặc bảng Actions; link run xanh; image có tag `sha-`; mỗi người có PR đã merge và một PR review kèm nhận xét cụ thể | Nhận xét review chỉ "OK", workflow còn `starter-project/`, push thẳng `main`, một người nhận hầu hết PR | "Vì sao `push: false` ở job build, không cần đăng nhập?" "Vì sao dùng `GITHUB_TOKEN`?" "CI xanh mà publish đỏ, bạn xem gì đầu tiên?" |
| Lỗi tích hợp | Có đủ triệu chứng, lệnh và output, nguyên nhân gốc, cách sửa, cách phòng tránh | Nguyên nhân chỉ là nhắc lại triệu chứng, không có output lệnh | "Lệnh nào cho bạn biết điều đó?" "Phòng tránh được bằng test hay bằng quy trình?" |
