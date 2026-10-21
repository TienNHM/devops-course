# Ví dụ Supabase: đăng ký CLB với RLS

Ví dụ đi kèm bài [Supabase cho người mới](../../../vibe/04-supabase.md).

Gồm:

- `schema.sql`: tạo 3 bảng `signups`, `members`, `admins` và bật RLS.
- `policies.sql`: thu hồi quyền mặc định, cấp lại tối thiểu và tạo policy.
- `web/index.html`: form đăng ký dùng `supabase-js`, chạy được không cần build.
- `web/config.example.js`: mẫu cấu hình. Sao chép thành `config.js` và điền URL cùng publishable key của project DEV.

## Chạy thử

1. Tạo một project Supabase riêng để học (không dùng project thật).
2. Mở SQL Editor, dán `schema.sql`, bấm Run. Dán tiếp `policies.sql`, bấm Run.
3. Lấy Project URL và publishable key ở nút Connect hoặc Settings, mục API Keys. Điền vào `web/config.js`.
4. Chạy web tĩnh cục bộ:

```bash
npx serve web
```

5. Mở địa chỉ hiện ra, gửi một đăng ký. Vào Table Editor, bảng `signups`, bạn sẽ thấy dòng mới.

## Kiểm tra RLS bằng cách gọi API không đăng nhập

Thay `YOUR_PROJECT_REF` và `YOUR_PUBLISHABLE_KEY` bằng giá trị của bạn (chỉ dùng khóa công khai):

```bash
# Đọc signups khi chưa đăng nhập: mong đợi mảng rỗng hoặc lỗi quyền, KHÔNG được thấy email của ai
curl "https://YOUR_PROJECT_REF.supabase.co/rest/v1/signups?select=*" \
  -H "apikey: YOUR_PUBLISHABLE_KEY"

# Gửi đăng ký khi chưa đăng nhập: mong đợi thành công (HTTP 201, body rỗng)
curl -i -X POST "https://YOUR_PROJECT_REF.supabase.co/rest/v1/signups" \
  -H "apikey: YOUR_PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@example.com"}'

# Đọc members khi chưa đăng nhập: mong đợi lỗi quyền (42501) hoặc mảng rỗng
curl "https://YOUR_PROJECT_REF.supabase.co/rest/v1/members?select=*" \
  -H "apikey: YOUR_PUBLISHABLE_KEY"
```

Nếu lệnh đầu tiên trả về dữ liệu thật, RLS hoặc policy của bạn đang sai: dừng lại và sửa trước khi chia sẻ link.

## Tạo admin cho bảng members

Policy đọc dữ liệu dựa vào bảng `admins`. Tạo user trong dashboard (Authentication, Users, Add user, tích Auto Confirm User), rồi chạy trong SQL Editor (đổi email):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@example.com';
```

Đừng dùng `user_metadata` để đánh dấu admin vì người dùng tự sửa được; xem giải thích trong [bài học](../../../vibe/04-supabase.md). Ví dụ đầy đủ về admin, Site URL và cách đưa khóa công khai vào bản deploy nằm ở [club-landing](../club-landing/README.md).

## Lưu ý

- Dùng CLI thì đưa hai file SQL vào `supabase/migrations/` theo thứ tự (xem bài học).
- Ví dụ này chưa được chạy thử trên project thật lúc viết tài liệu; hãy chạy trên project DEV và đọc lỗi nếu có.
