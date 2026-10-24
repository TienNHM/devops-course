# Kịch bản buổi 17 – Automated Testing

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 17 – Automated Testing](../../labs/week-09/session-17.md) và [Thử thách thêm](../../labs/week-09/session-17-challenge.md). Slide: [Slide buổi 17](../../slides/04-cicd/session-17.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 9](../grading/week-09.md). Đáp án: [Đáp án tuần 9](../walkthroughs/week-09.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 17: khung 120 phút, demo "đỏ rồi xanh", câu hỏi cho lớp, ghi chú theo 13 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc buổi 16 đã có workflow chạy `npm test`; hôm nay làm cho test có giá trị thật và chặn được merge |
| 15-45 | Kiến thức và demo | Unit và integration test, `node:test`, report, branch protection, demo "đỏ rồi xanh" |
| 45-105 | Thực hành | Lab bắt buộc (Phần 1-4) khoảng 40-60 phút; ai xong sớm làm thử thách (Phần 5-6) |
| 105-120 | Review | Vài học viên chiếu ảnh nút Merge bị khóa, chốt recap, nhắc nộp bài |

## Kịch bản demo

Mục tiêu (khoảng 10 phút): cho lớp thấy vòng lặp "đỏ, sửa, xanh" và nút Merge bị khóa.

1. Mở `starter-project/backend/tests/health.test.js`, đọc to cấu trúc: `before` mở server cổng ngẫu nhiên, `after` đóng server và `pool.end()`, một test gọi `/health`.
2. Chạy test hiện có:

   ```bash
   cd ~/devops-labs/lab-17/source/backend
   npm test
   ```

   Kết quả mong đợi (rút gọn):

   ```text
   ✔ GET /health returns healthy (15.2ms)
   ℹ tests 1
   ℹ pass 1
   ℹ fail 0
   ```

   Hỏi lớp: test này có cần PostgreSQL đang chạy không? Vì sao?
3. Cố ý sửa `assert.equal(res.status, 200)` thành `201`, chạy lại, đọc thông báo `AssertionError` (actual và expected). Hỏi: dòng nào cho biết test hỏng ở đâu? Sửa lại cho xanh.
4. Mở Settings > Branches của repository demo, cho xem rule đã bật. Mở một pull request có check đỏ và chỉ nút Merge bị khóa với thông báo "Required statuses must pass".
5. Câu hỏi chốt: nếu mock luôn trả dữ liệu đúng thì unit test có phát hiện được SQL sai không?

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Test `/health` có cần PostgreSQL không? Vì sao? | Không. `/health` không chạm DB và `Pool` chỉ kết nối khi có query. |
| Dòng nào trong `AssertionError` cho biết test hỏng ở đâu? | Dòng có `actual` và `expected`, kèm số dòng trong file test. |
| Mock luôn trả dữ liệu đúng thì có phát hiện được SQL sai không? | Không. Đó là lý do cần integration test. |
| Vì sao dùng `if: always()` cho step upload report? | Step mặc định bị bỏ qua sau step đỏ, mà report cần nhất khi test đỏ. |
| Vì sao `DB_HOST` là `localhost` mà không phải `postgres`? | Job chạy trực tiếp trên runner; tên `postgres` chỉ phân giải được khi job chạy trong `container:`. |
| CI đã bật nhưng PR có test đỏ vẫn merge được: nguyên nhân có thể? | Chưa bật Require status checks, chọn nhầm tên check, rule áp sai nhánh, hoặc admin được bỏ qua rule. |

## Ghi chú theo slide

Slide buổi 17 có 13 slide. Thời gian là gợi ý cho phần 30 phút kiến thức và demo.

- Slide 1 – Mục tiêu buổi học (2 phút): nhắc buổi 16 đã có workflow chạy `npm test`. Hôm nay làm cho test có giá trị thật và chặn được merge. Repo nên để public nếu muốn dùng branch protection.
- Slide 2 – Vấn đề: merge xong mới biết lỗi (2 phút): test không chứng minh code đúng tuyệt đối, nhưng cho cả nhóm một tín hiệu đáng tin.
- Slide 3 – Unit test và integration test (3 phút): hỏi nếu mock luôn trả dữ liệu đúng thì có phát hiện được SQL sai không. Đáp: không, đó là lý do cần integration test.
- Slide 4 – `node:test` (2 phút): nhấn mạnh `t.mock.method` tự khôi phục khi test kết thúc nên không làm bẩn test khác.
- Slide 5 – Test report và branch protection (2 phút): check bắt buộc được chọn theo tên job (trường `name`).
- Slide 6 – Kiến trúc hai job và cổng merge (3 phút): hai job chạy trên hai runner độc lập, song song. Chỉ ra Postgres là container phụ chạy cạnh job integration.
- Slide 7 – Service container (3 phút): hỏi vì sao `DB_HOST` là `localhost` mà không phải `postgres`. Đây cũng là lỗi của Debug B.
- Slide 8 – Demo 1, đỏ rồi xanh (5 phút): hỏi trước: test này có cần PostgreSQL không? Đáp: không, vì `/health` không chạm DB và `Pool` chỉ kết nối khi có query.
- Slide 9 – Demo 2, nút Merge bị khóa (5 phút): chuẩn bị sẵn hai PR (một đỏ, một xanh) trước buổi. Giao diện GitHub hay đổi tên nút; có thể dùng Rulesets thay classic rule.
- Slide 10 – Lab: bốn phần trong 60 phút (khoảng 5 phút giới thiệu):
  - Phần 1: chạy `npm test` một lần để có mốc xanh (`pass 1`, `fail 0`) trước khi thêm test. Đường dẫn `~/devops-course` là ví dụ.
  - Phần 2: slide chỉ nói "4 unit test"; bản đầy đủ nằm ở bài lab. Giải thích vì sao mock `console.error` ở test 500: để log không nhiễu báo cáo. Cho học viên lưu output vào `evidence/command-output.txt` bằng `tee`.
  - Phần 3: workflow lưu ở `.github/workflows/lab17-ci.yml` ở gốc repo. Hỏi: vì sao `if: always()`? Đáp: step sau step fail mặc định bị bỏ qua, mà report quan trọng nhất khi test đỏ.
  - Phần 4: repo private gói Free không hỗ trợ branch protection. Nếu check bắt buộc đứng ở "Expected - Waiting for status" mãi, kiểm tra path filter của workflow. Nhánh mặc định tên `master` thì sửa pattern và `branches` trong workflow.
- Slide 11 – Debug A, test pass riêng, fail chung (5 phút): phòng tránh: mỗi test tự dựng dữ liệu, không giả định test khác đã chạy, nhiều file cùng dùng DB thì chạy với `--test-concurrency=1`.
- Slide 12 – Debug B, không kết nối được service container (5 phút): hướng điều tra: mở bước khởi tạo container xem Postgres có healthy không; hỏi job chạy trên runner hay trong `container:`. Nhắc cách đọc log từ step lỗi đầu tiên (scenario-06 trong `examples/troubleshooting`).
- Slide 13 – Recap (review 15 phút cuối): mời học viên cho cả lớp xem ảnh nút Merge bị khóa. Nhắc nộp `lab-17/`, chỉ dùng mật khẩu giả `ci-only-password`, không commit `.env` thật.

## Hỗ trợ phần thử thách

Phần 5-6 (integration test, service container) là tùy chọn, nằm ở [Thử thách thêm](../../labs/week-09/session-17-challenge.md). Đừng để cả lớp dừng ở đây.

- Chờ `docker exec lab17-pg pg_isready -U club -d clubdb` báo accepting connections trước khi chạy test.
- Lỗi hay gặp: `ECONNREFUSED 127.0.0.1:5432` do quên `DB_PORT=5433`; `password authentication failed` do lệch mật khẩu.
- Job integration đầy đủ có `working-directory`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, các step checkout, setup-node, `npm ci`, chạy test và upload `test-results-integration`. Sau khi job xanh, thêm `integration-tests` vào required checks.
- Thử thách 1 (coverage nhánh lỗi): gợi ý test cho capstone là thêm thành viên trùng email phải trả lỗi và không tạo bản ghi mới.

## Lưu ý riêng cho người dạy

- Branch protection cần repo public (gói Free). Trước buổi, nhắc học viên đặt repo `devops-labs` ở chế độ public; quên bước này sẽ mất 10 phút ở Phần 4.
- Check chỉ hiện trong ô tìm kiếm của branch protection khi workflow đã chạy trong 7 ngày gần đây; cho học viên merge workflow lần đầu rồi mới tạo PR thử.
- Chuẩn bị sẵn hai PR demo (đỏ và xanh) trong repo của mentor, vì dựng lại giữa buổi tốn thời gian.
- Đi quanh lớp hỏi "dòng này làm gì" ở workflow trước khi học viên push, để bắt lỗi đặt file sai chỗ (`lab-17/` thay vì `.github/workflows/`).
- Học viên làm trong WSL, không dùng `/mnt/c`; lỗi CRLF khi clone bằng Git trên Windows là nguồn lỗi lạ phổ biến.
