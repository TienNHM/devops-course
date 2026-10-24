# Mini project: chấm điểm, nộp bài, thử thách

> **Tóm tắt:** Phần cuối của mini project: rubric 100 điểm, mẫu bài nộp với 5 câu hỏi giải thích, và các thử thách nâng cao có điểm thưởng.

::: tip Bạn làm gì
- **Kết quả:** bài nộp hoàn chỉnh cho mini project, tự chấm được trước khi nộp.
- **Thời gian:** 20 đến 30 phút điền bài nộp; thử thách làm ở nhà.
- **Cần gì trước:** đã xong 8 mốc của [Mini project: Landing page CLB](09-mini-project.md).
- **Module trước:** [Mini project: Landing page CLB](09-mini-project.md).
:::

## Rubric 100 điểm

| Nhóm | Điểm | Cách chấm |
| --- | --- | --- |
| 1. Chạy được qua link công khai | 25 | Link mở được trên điện thoại (10); form gửi được và dòng xuất hiện trong Supabase (10); HTTPS, không lỗi Console (5) |
| 2. An toàn secret và RLS | 30 | RLS bật cả hai bảng (10); khách ẩn danh đọc `members` ra rỗng (10); repo và lịch sử Git sạch khóa bí mật, không có `service_role` hay secret key trong repo (10) |
| 3. Trang admin | 10 | Đăng nhập, xem danh sách, đăng xuất; người chưa đăng nhập không thấy dữ liệu |
| 4. README | 10 | Có mô tả dự án, cách chạy local, cách cấu hình (không chứa khóa thật), cách deploy, link demo |
| 5. Hiểu và giải thích | 15 | Trả lời 5 câu hỏi trong bài nộp, mỗi câu 3 điểm, đúng ý và bằng lời của mình |
| 6. Xử lý một lỗi cố tình | 10 | Người chấm cài sẵn một lỗi (ví dụ đổi tên bảng, xóa policy insert, hoặc làm sai URL); bạn chẩn đoán đúng nguyên nhân qua Console/log (5) và sửa đúng cách, không tắt RLS (5) |

Quy tắc trừ điểm nặng: có secret key hoặc `service_role` trong repo công khai là về 0 điểm nhóm 2 và phải xoay khóa trước khi chấm tiếp. Dùng gói trả phí hay nhập thẻ không phải yêu cầu của bài, và không được cộng điểm.

Thang xếp loại gợi ý: từ 90 là xuất sắc, 75 đến 89 là đạt tốt, 60 đến 74 là đạt, dưới 60 làm lại phần còn thiếu.

## Mẫu bài nộp

Sao chép khung dưới đây vào một Issue, một trang Notion hoặc file `SUBMISSION.md` trong repo, rồi điền.

```text
BÀI NỘP MINI PROJECT: LANDING PAGE CLB

Họ tên:
Link công khai:
Link repo GitHub:
Dịch vụ hosting đã dùng:
Công cụ AI agent đã dùng:

Bằng chứng (ảnh chụp, không lộ khóa):
1. Table Editor có nhãn RLS đã bật
2. Kết quả curl ẩn danh đọc members
3. Trang admin sau khi đăng nhập
4. Console không lỗi trên trang công khai

Năm câu hỏi giải thích (trả lời 2 đến 4 câu mỗi ý, bằng lời của bạn):
1. Từ lúc mình sửa một chữ trong code đến lúc người khác thấy chữ đó trên link công khai, chuyện gì xảy ra?
2. Khóa công khai (publishable) khác khóa bí mật (secret, service_role) thế nào, và vì sao khóa công khai nằm trong trang web vẫn an toàn?
3. RLS làm gì? Nếu quên bật RLS cho bảng members thì điều gì xảy ra?
4. Vì sao commit config.js chỉ chứa khóa public là an toàn, và vì sao repo tuyệt đối không có service_role?
5. Kể một lỗi bạn gặp (hoặc lỗi bị cài sẵn): triệu chứng, nguyên nhân, cách bạn tìm ra và cách sửa.

Phần AI: liệt kê 2 việc bạn giao cho agent và 2 việc bạn tự làm vì không muốn giao.
```

<details><summary>Gợi ý đáp án cho câu 1 đến 3</summary>

1. Bạn commit và đẩy lên GitHub; hosting được nối với repo nhận thay đổi, chạy build (hoặc chỉ sao chép file), rồi phát hành bản mới lên mạng lưới của họ. Trình duyệt người khác tải bản mới.
2. Khóa công khai chỉ có quyền thấp, mọi thao tác vẫn bị RLS lọc. Khóa bí mật bỏ qua RLS nên ai cầm được là đọc, sửa, xóa toàn bộ dữ liệu. Vì vậy khóa bí mật chỉ nằm ở backend.
3. RLS là bộ quy tắc "ai được làm gì với từng dòng". Bảng không bật RLS thì bất kỳ ai có khóa công khai (mà khóa này nằm trong trang, ai cũng lấy được) đều có thể đọc, sửa, xóa dữ liệu qua API.

</details>

## Phiên bản thử thách nâng cao

Chọn một hoặc nhiều thử thách, mỗi thử thách cộng tối đa 5 điểm thưởng (tổng thưởng không quá 15).

| Thử thách | Làm gì | Gợi ý |
| --- | --- | --- |
| Function chống spam | Thêm một function trên Vercel hoặc Cloudflare nhận form, kiểm tra dữ liệu và giới hạn tần suất, rồi mới ghi vào Supabase | Xem [bài Fullstack serverless](03-fullstack-serverless.md). Khóa bí mật (nếu dùng) chỉ nằm trong biến môi trường của function, không trong frontend |
| Firebase thay thế | Làm lại phần lưu dữ liệu bằng Firestore và Security Rules thay cho Supabase | Xem [bài Firebase](05-firebase.md). Viết rules chỉ cho phép tạo, không cho đọc |
| Preview deploy | Mở một Pull Request đổi giao diện, lấy link preview của hosting, gửi cho bạn bè góp ý trước khi merge | Vercel, Netlify và Cloudflare đều tạo preview cho mỗi nhánh hoặc PR; kiểm tra tài liệu dịch vụ bạn chọn |
| CI đơn giản | Thêm GitHub Actions chạy `node --check` cho các file JS và tìm chuỗi `sb_secret_` trong repo, fail nếu có | Là cầu nối sang khóa DevOps chính, xem mục Tiếp theo bên dưới |
| Agent qua MCP | Dùng MCP server của Supabase để agent đọc cấu trúc bảng ở chế độ chỉ đọc, kiểm tra thiếu RLS | Xem [bài AI agent và deploy](06-ai-agent-deploy.md). Dùng project thử, không dùng dữ liệu thật |

## Tự kiểm tra

1. Vì sao trang admin chỉ cần "ẩn" đường dẫn là chưa đủ an toàn?
2. Khi form gửi lên Supabase, vì sao không nên gọi `select` ngay sau `insert` trong dự án này?
3. Bạn phát hiện mình lỡ commit secret key lên repo công khai. Làm gì đầu tiên?
4. Vì sao hiển thị dữ liệu người dùng nhập bằng `textContent` an toàn hơn `innerHTML`?
5. Người chấm cài lỗi "xóa policy insert". Bạn thấy triệu chứng gì, và cách sửa nào là sai?

<details><summary>Đáp án</summary>

1. Ai biết hoặc đoán được đường dẫn đều mở được trang. Bảo vệ thật nằm ở backend: đăng nhập cộng RLS, khiến người không phải admin chỉ nhận về danh sách rỗng.
2. Khách chỉ có quyền ghi, không có quyền đọc bảng. `select` sau `insert` sẽ bị RLS từ chối và làm cả thao tác báo lỗi, dù dữ liệu có thể đã vào.
3. Xoay (rotate) khóa ngay trong dashboard để khóa cũ vô hiệu, rồi mới dọn lịch sử Git. Xóa file không đủ vì khóa vẫn nằm trong lịch sử commit.
4. `textContent` luôn coi dữ liệu là chữ thường, còn `innerHTML` có thể chạy thẻ hoặc script mà người lạ gài vào trường họ tên (XSS).
5. Triệu chứng: form báo lỗi, Console có `row-level security policy` khi insert. Cách sửa sai là tắt RLS hoặc dùng `service_role`. Cách đúng là tạo lại policy insert có điều kiện kiểm tra dữ liệu.

</details>

## Tiếp theo

Bước kế tiếp trong lộ trình: [Tên miền, bảo mật, production](07-domain-security-production.md), rồi [Hoàn thiện và ra mắt](11-launch-polish.md).
