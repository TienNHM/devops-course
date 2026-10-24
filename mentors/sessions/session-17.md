# Kịch bản mentor – Buổi 17: Automated Testing

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 17 – Automated Testing](../../labs/week-09/session-17.md). Slide: [Slide buổi 17](../../slides/04-cicd/session-17.md). Chấm bài: [Chấm bài tuần 9](../grading/week-09.md). Đáp án: [Walkthrough tuần 9](../walkthroughs/week-09.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 17: khung 120 phút, demo của mentor, câu hỏi cho lớp, ghi chú giảng viên theo từng slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc buổi 16 đã có workflow chạy `npm test`; hôm nay làm cho test có giá trị thật và chặn được merge |
| 15-45 | Kiến thức và demo | Unit và integration test, `node:test`, report, branch protection, demo "đỏ rồi xanh" |
| 45-105 | Thực hành | L1 (Phần 1-4) khoảng 30-40 phút; ai xong sớm làm L2 (Phần 5-6) |
| 105-120 | Review | Cho vài học viên chiếu ảnh nút Merge bị khóa, chốt recap, nhắc nộp bài |

## Demo của mentor

Mục tiêu demo (khoảng 10 phút): cho lớp thấy vòng lặp "đỏ -> sửa -> xanh" và nút Merge bị khóa.

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

   Hỏi lớp: test này có cần PostgreSQL đang chạy không? Vì sao? (Vì `/health` không chạm DB và `Pool` chỉ kết nối khi có query.)
3. Cố ý sửa `assert.equal(res.status, 200)` thành `201`, chạy lại, đọc thông báo `AssertionError` (actual và expected). Hỏi: dòng nào cho biết test hỏng ở đâu? Sửa lại cho xanh.
4. Mở trang Settings > Branches của repository demo, cho xem rule đã bật. Mở một pull request có check đỏ và chỉ nút Merge bị khóa với thông báo "Required statuses must pass".
5. Câu hỏi thảo luận: "Nếu mock luôn trả về dữ liệu đúng thì unit test có phát hiện được SQL sai không?" (Không. Đó là lý do cần integration test.)

## Câu hỏi mentor nên hỏi lớp

- Test `/health` có cần PostgreSQL không? Vì sao? (Không: `/health` không chạm DB, `Pool` chỉ kết nối khi có query.)
- Dòng nào trong thông báo `AssertionError` cho biết test hỏng ở đâu?
- Nếu mock luôn trả dữ liệu đúng thì unit test có phát hiện được SQL sai không? (Không, cần integration test.)
- Vì sao dùng `if: always()` cho step upload report? (Step mặc định bị bỏ qua sau step đỏ, mà report cần nhất khi test đỏ.)
- Vì sao `DB_HOST` là `localhost` mà không phải `postgres`? (Job chạy trực tiếp trên runner; tên `postgres` chỉ phân giải được khi job chạy trong `container:`.)
- Bạn đã bật CI nhưng PR có test đỏ vẫn merge được: liệt kê các nguyên nhân có thể.

## Ghi chú giảng viên theo slide

Các ghi chú dưới đây chuyển nguyên văn từ slide gốc (trước khi [Slide buổi 17](../../slides/04-cicd/session-17.md) được rút gọn). Số thứ tự là của slide gốc; tên slide nêu kèm để bạn tìm ở bản rút gọn. Nội dung lab và L2 nay nằm ở bài học viên và trang thử thách.

- Slide 1 – Mục tiêu buổi học (2 phút): nhắc buổi 16 đã có workflow chạy `npm test`. Hôm nay làm cho test có giá trị thật và chặn được merge. Repo nên để public nếu muốn dùng branch protection.
- Slide 2 – Vấn đề: merge xong mới biết lỗi (2 phút): test không chứng minh code đúng tuyệt đối, nhưng cho cả nhóm một tín hiệu đáng tin.
- Slide 3 – Unit test và integration test (3 phút): hỏi nếu mock luôn trả dữ liệu đúng thì có phát hiện được SQL sai không. Đáp: không, đó là lý do cần integration test.
- Slide 4 – `node:test` (2 phút): nhấn mạnh `t.mock.method` tự khôi phục khi test kết thúc nên không làm bẩn test khác.
- Slide 5 – Test report và branch protection (2 phút): check bắt buộc được chọn theo tên job (trường `name`).
- Slide 6 – Kiến trúc hai job và cổng merge (3 phút): hai job chạy trên hai runner độc lập, song song. Chỉ ra Postgres là container phụ chạy cạnh job integration.
- Slide 7 – Service container (3 phút): câu hỏi: vì sao `DB_HOST` là `localhost` mà không phải `postgres`? Đây cũng là lỗi của Tình huống B ở cuối buổi.
- Slide 8 – Demo 1, đỏ rồi xanh (5 phút): hỏi trước: test này có cần PostgreSQL không? Đáp: không, vì `/health` không chạm DB và `Pool` chỉ kết nối khi có query.
- Slide 9 – Demo 2, nút Merge bị khóa (5 phút): chuẩn bị sẵn hai PR (một đỏ, một xanh) trước buổi. Lưu ý giao diện GitHub thay đổi tên nút, có thể dùng Rulesets thay classic rule.
- Slide 10 – Lab bước 1, chuẩn bị (5 phút): đường dẫn `~/devops-course` là ví dụ. Chạy `npm test` một lần để có mốc xanh (`pass 1`, `fail 0`) trước khi thêm test.
- Slide 11 – Lab bước 2, unit test với mock pool (10 phút): đoạn trên slide chỉ là một trong bốn test; bản đầy đủ có trong bài lab. Giải thích vì sao mock `console.error` ở test 500: để log không nhiễu báo cáo.
- Slide 12 – Chạy unit test (3 phút): cho học viên lưu output vào `evidence/command-output.txt` bằng `tee`.
- Slide 13 – Lab bước 3, workflow và report (12 phút): slide là bản rút gọn (bỏ cache và permissions); workflow đầy đủ trong bài lab, lưu ở `.github/workflows/lab17-ci.yml` ở gốc repo. Hỏi: vì sao `if: always()`? Đáp: step sau step fail mặc định bị bỏ qua, mà report quan trọng nhất khi test đỏ.
- Slide 14 – Lab bước 4, chặn merge khi CI đỏ (10 phút): repo private gói Free không hỗ trợ branch protection. Nếu check bắt buộc đứng ở "Expected - Waiting for status" mãi, kiểm tra path filter của workflow. Nhánh mặc định tên `master` thì sửa pattern và `branches` trong workflow.
- Slide 15 – L2, integration test với PostgreSQL thật (10 phút): chờ `docker exec lab17-pg pg_isready -U club -d clubdb` báo accepting connections trước khi chạy test. Lỗi hay gặp: `ECONNREFUSED 127.0.0.1:5432` do quên `DB_PORT=5433`; `password authentication failed` do lệch mật khẩu.
- Slide 16 – L2, job integration trong Actions (10 phút): slide là bản rút gọn; bản đầy đủ còn có `working-directory`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, các step checkout, setup-node, `npm ci`, chạy test và upload `test-results-integration`. Sau khi job xanh, thêm `integration-tests` vào required checks.
- Slide 17 – Debug A, test pass riêng, fail chung (5 phút): phòng tránh: mỗi test tự dựng dữ liệu, không giả định test khác đã chạy, nhiều file cùng dùng DB thì chạy với `--test-concurrency=1`.
- Slide 18 – Debug B, không kết nối được service container (5 phút): hướng điều tra: mở bước khởi tạo container xem Postgres có healthy không; hỏi job chạy trên runner hay trong `container:`. Liên hệ Tình huống 06 về cách đọc log từ step lỗi đầu tiên.
- Slide 19 – Thử thách: giao về nhà hoặc cho nhóm làm nhanh. Gợi ý test cho capstone: thêm thành viên trùng email phải trả lỗi và không tạo bản ghi mới.
- Slide 20 – Recap (review 15 phút cuối): mời học viên cho cả lớp xem ảnh nút Merge bị khóa. Nhắc nộp `lab-17/`, chỉ dùng mật khẩu giả `ci-only-password`, không commit `.env` thật.

## Lưu ý riêng cho người dạy

- Branch protection cần repo public (gói Free). Trước buổi, nhắc học viên đặt repo `devops-labs` ở chế độ public; học viên quên bước này sẽ mất 10 phút ở Phần 4.
- Check chỉ hiện trong ô tìm kiếm của branch protection khi workflow đã chạy trong 7 ngày gần đây; cho học viên merge workflow lần đầu rồi mới tạo PR thử.
- Chuẩn bị sẵn hai PR demo (đỏ và xanh) trong repo của mentor, vì dựng lại giữa buổi tốn thời gian.
- Phần 5-6 (L2, service container Postgres) không bắt buộc; chỉ gợi ý cho học viên xong L1 sớm. Đừng để cả lớp dừng ở đây.
- Đi quanh lớp hỏi "dòng này làm gì" ở workflow trước khi học viên push, để bắt lỗi đặt file sai chỗ (`lab-17/` thay vì `.github/workflows/`).
- Học viên làm trong WSL, không dùng `/mnt/c`; lỗi CRLF khi clone bằng Git trên Windows là nguồn lỗi lạ phổ biến.
