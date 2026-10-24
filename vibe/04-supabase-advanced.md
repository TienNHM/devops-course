# Supabase nâng cao: Storage, Edge Functions, CLI và MCP

> **Tóm tắt:** Phần đọc thêm của bài Supabase: lưu ảnh và tệp bằng Storage, Edge Functions, Supabase CLI đưa schema vào Git, và Supabase MCP cho agent với đủ rào an toàn.

::: tip Bạn làm gì
- **Kết quả:** biết bốn công cụ nâng cao của Supabase và khi nào cần dùng.
- **Thời gian:** 20 đến 30 phút, đọc khi cần, không bắt buộc.
- **Cần gì trước:** đã xong [Supabase](04-supabase.md) (có project dev, bảng và RLS đã bật).
- **Module trước:** [Supabase](04-supabase.md).
:::

## Bước 7. Storage (ảnh, tệp) trong một phút

Vào Storage, tạo bucket (một thư mục lớn). Mặc định bucket là riêng tư. Chỉ bật Public khi tệp thật sự công khai (ví dụ ảnh bìa sự kiện). Với tệp riêng tư, bạn cần viết policy cho bảng `storage.objects`, giống tinh thần RLS ở trên. Đừng cho bucket cho phép upload không giới hạn từ `anon`: người lạ có thể nhồi đầy dung lượng của bạn.

## Bước 8. Edge Functions (nhắc ngắn)

Khi bạn cần giữ bí mật (ví dụ gọi API trả phí bằng khóa của bạn) hoặc xử lý thứ không thể tin trình duyệt, đặt code trong Edge Function. Secret key và khóa bên thứ ba được lưu bằng secrets của Supabase, không nằm trong code web. Chi tiết nằm ngoài phạm vi bài nhập môn này; xem [tài liệu Edge Functions](https://supabase.com/docs/guides/functions).

## Bước 9. Supabase CLI ở mức nhập môn

CLI hữu ích khi bạn muốn lược đồ database (schema) nằm trong Git thay vì chỉ trong dashboard, để agent và bạn cùng xem lịch sử thay đổi. Cài đặt theo tài liệu chính thức, cần Node.js 20 trở lên nếu dùng npm:

```bash
npm install supabase --save-dev
npx supabase init
```

`supabase init` chỉ tạo thư mục `supabase/` với `config.toml`, chưa đăng nhập hay nối project nào. Để nối với project trên mạng:

```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase migration new create_signups
```

Lệnh cuối tạo một file rỗng trong `supabase/migrations/`. Dán nội dung `schema.sql` và `policies.sql` vào đó rồi đẩy lên:

```bash
npx supabase db push
```

Windows có thể cài CLI bằng Scoop thay cho npm; xem [hướng dẫn CLI](https://supabase.com/docs/guides/local-development/cli/getting-started). Trang hướng dẫn nhập môn không mô tả chi tiết `login`, `link`, `db push`, nên nếu lệnh báo khác, hãy chạy `npx supabase --help` hoặc đọc [CLI reference](https://supabase.com/docs/reference/cli/introduction) nếu lệnh báo khác.

::: danger Cẩn thận với db push
Chạy `db push` chỉ với project dev; với dữ liệu thật hãy đọc kỹ bản xem trước thay đổi trước khi đồng ý. Chạy local bằng `supabase start` cần container runtime như Docker, bạn sẽ gặp ở khóa DevOps chính.
:::

## Bước 10. Supabase MCP: cho agent nhìn vào database, nhưng có rào

MCP (Model Context Protocol) là cách để AI agent dùng công cụ ngoài, ví dụ đọc bảng hay chạy SQL trong project Supabase của bạn. Đây là con dao hai lưỡi vì agent có thể ghi và xóa dữ liệu.

Quy tắc an toàn:

- Chỉ nối với project dev, không bao giờ với production hay project chứa dữ liệu người dùng thật.
- Giới hạn bằng tham số `project_ref` (agent chỉ thấy đúng một project, các công cụ quản lý tài khoản bị tắt) và bật `read_only=true` (chạy truy vấn bằng user Postgres chỉ đọc) khi chỉ cần đọc.
- Giữ chế độ duyệt tay từng lệnh trong công cụ của bạn; đọc SQL agent định chạy trước khi bấm cho phép.
- Cẩn thận prompt injection (kẻ xấu cài chỉ thị vào dữ liệu, ví dụ trong ô lời nhắn của form, để agent đọc phải làm theo). Chính tài liệu Supabase thừa nhận các biện pháp chống chịu chỉ giảm rủi ro chứ không loại bỏ.

Ví dụ cấu hình cho Claude Code (cú pháp nhìn chung ổn định nhưng hãy đối chiếu [trang MCP chính thức](https://supabase.com/docs/guides/getting-started/mcp)):

```bash
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=YOUR_REF&read_only=true"
```

Sau đó mở Claude Code, gõ `/mcp`, chọn supabase rồi chọn Authenticate để đăng nhập qua trình duyệt (bạn tự làm bước này; không dán token vào chat). Mở rộng quyền ghi chỉ khi bạn đang làm trên project dev và đã commit mọi thứ lên Git.

## Tạo admin đầu tiên cho một trang quản trị

Nếu web của bạn có trang admin (như [club-landing](../examples/vibe/club-landing/README.md)), làm theo thứ tự này, ít phụ thuộc vào email nhất:

1. Authentication, mục Providers (hoặc Sign In / Providers), bấm Email, xem công tắc **Confirm email**. Bật nghĩa là user phải bấm link trong email mới đăng nhập được.
2. Authentication, mục Users, Add user, Create new user: nhập email, mật khẩu mạnh, tích **Auto Confirm User**. Cách này không gửi email nào nên không đụng giới hạn ở trên.
3. Tắt "Allow new users to sign up" nếu web không cần người lạ tự tạo tài khoản. Theo tài liệu, khi tắt thì chỉ user đã có mới đăng nhập được.
4. Đánh dấu user là admin bằng một dòng trong bảng `admins` (chạy trong SQL Editor, đổi email):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@example.com';
```

Policy chỉ cần hỏi "`auth.uid()` có trong bảng `admins` không", như ở bước 2. Muốn thêm hay bớt admin chỉ cần thêm hay xóa một dòng.

Vì sao **không** dùng `user_metadata` (cột `raw_user_meta_data`) để phân quyền: chính người dùng sửa được nó bằng `supabase.auth.updateUser()`, nên policy kiểu "metadata nói role là admin thì cho xem" để ai đăng nhập cũng tự phong mình làm admin chỉ bằng một dòng JavaScript. Nếu muốn đưa quyền vào token JWT, dùng `app_metadata` (người dùng không sửa được), nhưng thay đổi chỉ có hiệu lực sau khi token làm mới. Người mới nên chọn bảng `admins`: dễ đọc, dễ kiểm tra, có hiệu lực ngay.

Site URL và Redirect URLs khi chạy local và khi lên domain thật: xem bảng trong [README của club-landing](../examples/vibe/club-landing/README.md). Đăng nhập bằng mật khẩu không chuyển hướng nên hay chạy được dù quên cấu hình, nhưng mọi email Supabase gửi đi (xác nhận, đặt lại mật khẩu) vẫn dùng Site URL, nên đổi nó ngay khi có domain.

## Tiếp theo

Quay lại [Supabase](04-supabase.md), hoặc sang [Dự án nhỏ](09-mini-project.md) để ráp mọi thứ lại.
