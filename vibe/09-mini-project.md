# Mini project: Landing page CLB có đăng ký thành viên

> **Tóm tắt:** Dự án tổng hợp cuối track: ghép những gì đã học ở bài 01, 02, 04 và 07 thành một landing page CLB có form đăng ký lưu vào Supabase, trang admin có đăng nhập, link công khai, HTTPS và RLS.

::: tip Bạn làm gì
- **Kết quả:** một landing page CLB có link công khai, form đăng ký lưu vào Supabase và trang admin có đăng nhập.
- **Thời gian:** 3 đến 4 giờ nếu bạn đã làm các bài 01, 02, 04 (các mốc trùng chỉ là làm lại nhanh theo bài cũ).
- **Cần gì trước:** đã làm xong [01 Git và GitHub](01-git-github.md), [02 Hosting tĩnh](02-static-hosting.md) và [04 Supabase](04-supabase.md). Bài này **không dạy lại** các bước đó, chỉ chỉ chỗ để bạn làm lại. Nếu bạn học Firebase thì xem thử thách trong trang chấm điểm.
- **Đây là Chặng 3, tùy chọn:** chỉ làm khi bạn muốn một dự án thật có database và đăng nhập. Chỉ cần link công khai thì dừng ở Chặng 1.
:::

## Bạn sẽ làm được gì

- Có một link công khai dạng `https://ten-cua-ban.xxx` mà bất kỳ ai cũng mở được trên điện thoại.
- Có form đăng ký thành viên: người lạ điền vào thì dữ liệu nằm trong database Supabase của bạn.
- Có trang admin: chỉ bạn đăng nhập mới xem được danh sách, người lạ gọi thẳng API chỉ nhận về danh sách rỗng.
- Không lộ secret: repo công khai không chứa khóa bí mật, `.env` không bị commit.
- Giải thích được bằng lời của mình vì sao hệ thống chạy, và sửa được một lỗi cố tình bị cài.

Đây là bài ghép lại: mốc nào đã học ở bài trước thì có dòng "đã học ở bài X, làm lại theo". Kẹt ở đâu, mở [Xử lý sự cố](08-troubleshooting.md).

## Khái niệm trong 5 phút

Hãy nghĩ tới một quầy đăng ký ở cổng trường.

| Ngoài đời | Trong dự án |
| --- | --- |
| Tờ rơi và bàn đăng ký | Trang web tĩnh (HTML, CSS, JS) đặt trên hosting |
| Hộp phiếu có khe nhét giấy | Bảng `members` chỉ cho phép "nhét vào" (insert) |
| Chìa khóa hộp phiếu, chỉ BTC giữ | Tài khoản admin + bảng `admins` + policy đọc |
| Quy định "ai được làm gì với hộp phiếu" | Row Level Security (RLS; [thuật ngữ](../resources/glossary.md)) |
| Chìa khóa vạn năng của chủ nhà | `service_role` hoặc secret key, không bao giờ đưa ra ngoài |
| Biển hiệu và địa chỉ quầy | Domain và HTTPS |

```mermaid
flowchart LR
  AG["AI agent viết code"] --> LC["Chạy local"]
  LC --> GH["GitHub repo"]
  GH --> HO["Hosting tĩnh"]
  HO --> U["Khách mở link"]
  U -->|"gửi form"| SB[("Supabase")]
  AD["Admin"] -->|"đăng nhập"| SB
  SB -->|"RLS lọc dữ liệu"| AD
```

Điều quan trọng nhất: trang web nằm hoàn toàn trong trình duyệt của khách, ai cũng "xem mã nguồn" được. Vì vậy mọi thứ đặt trong trang đều coi như công khai. Khóa công khai (publishable) chỉ an toàn vì RLS đứng sau canh cửa. Đọc lại phần khóa và RLS ở [bài 04 Supabase](04-supabase.md) trước khi làm mốc 5.

## Yêu cầu của sản phẩm

Chức năng bắt buộc:

1. Landing page có: giới thiệu CLB, hoạt động, form đăng ký, footer. Đọc tốt trên điện thoại.
2. Form có họ tên, email, lựa chọn quan tâm, ô đồng ý lưu dữ liệu. Có thông báo thành công và thông báo lỗi dễ hiểu.
3. Dữ liệu lưu vào bảng `members` của Supabase, chặn email trùng.
4. Trang `admin.html` có đăng nhập, xem danh sách mới nhất trước, đăng xuất.
5. Có link công khai, chạy HTTPS.
6. Có `README.md` giải thích cách chạy, cách cấu hình và cách deploy.

Ràng buộc bảo mật (không thương lượng):

- RLS bật cho mọi bảng. Khách chỉ được insert, không đọc, không sửa, không xóa.
- Chỉ dùng khóa công khai trong code frontend. `config.js` thật hoặc `.env` không nằm trong lịch sử Git.
- Không dán dữ liệu thành viên thật vào AI để "nhờ xử lý".

**Mẫu tham chiếu đã chạy được:** tải gói [vibe-club-landing.zip](https://devops-course.tiennhm.io.vn/downloads/vibe-club-landing.zip) (có `index.html`, `admin.html`, `app.js`, `admin.js`, `schema.sql`, `config.example.js`), giải nén để so sánh sau mỗi mốc. Mã nguồn cũng có ở [examples/vibe/club-landing](../examples/vibe/club-landing/README.md). Hãy tự làm trước, mở mẫu để đối chiếu sau. Ai không muốn tự làm giao diện có thể bắt đầu thẳng từ gói mẫu này và bỏ qua mốc 1.

## Thực hành từng bước

Mỗi mốc có việc cần làm, kết quả mong đợi và tiêu chí đo được. Dừng lại tích checklist rồi mới sang mốc tiếp.

### Mốc 1: Nhờ agent tạo bản đầu (20 phút, nội dung riêng của dự án)

Mở agent (Claude Code, Cursor, Copilot agent, Codex hoặc Gemini CLI) trong một thư mục trống tên `club-landing`. Dán prompt:

```text
Tạo landing page cho câu lạc bộ công nghệ sinh viên bằng HTML, CSS và JavaScript thuần,
KHÔNG dùng framework và KHÔNG cần bước build. Gồm các file: index.html, style.css, app.js.
Nội dung: hero, giới thiệu, 3 hoạt động, form đăng ký (họ tên, email, MSSV không bắt buộc,
lựa chọn quan tâm, ô đồng ý lưu dữ liệu), footer.
Yêu cầu: tiếng Việt, responsive cho điện thoại, tự đổi sáng/tối theo hệ thống.
Chưa kết nối database; khi submit chỉ hiện thông báo thử.
Trước khi viết, hãy liệt kê kế hoạch file ngắn gọn. Không cài thêm thư viện nào.
```

Bạn sẽ thấy: 3 file mới, mở `index.html` lên là có trang đẹp. Tiêu chí: mở được trong trình duyệt, nhìn ổn khi thu nhỏ cửa sổ về cỡ điện thoại.

### Mốc 2: Chạy local và đọc lại (15 phút)

Bấm đúp `index.html` để mở bằng trình duyệt (không cần cài Node hay chạy server). Thử bấm mọi nút, gõ email sai, để trống ô bắt buộc. Rồi nhờ agent giải thích file `app.js` từng dòng và tự hỏi: "dòng nào gọi ra ngoài Internet?". Ở mốc này câu trả lời phải là: không dòng nào.

Tiêu chí: không có lỗi đỏ trong Console (nhấn F12), bạn chỉ ra được file nào lo giao diện, file nào lo hành vi.

### Mốc 3: Đưa lên GitHub (15 phút)

**Đã học ở [bài 01 Git và GitHub](01-git-github.md), làm lại theo bài đó** (GitHub Desktop, tạo `.gitignore` trước khi commit). Điểm riêng của dự án: `.gitignore` phải có thêm dòng `config.js` (chỗ sẽ chứa khóa Supabase của bạn). Tên repo gợi ý: `club-landing`.

Tiêu chí: tìm trong repo chữ `secret` và `service_role` không ra kết quả nào.

### Mốc 4: Deploy bản tĩnh (20 phút)

**Đã học ở [bài 02 Hosting tĩnh](02-static-hosting.md), làm lại theo bài đó** (GitHub Pages là đủ). Mốc này chỉ cần bản tĩnh chưa có Supabase, nên chưa có `config.js` và chưa cần build. Ở mốc 5 bạn sẽ đổi sang cách build có cấu hình để bản online có khóa công khai.

Tiêu chí: link mở được trên thiết bị khác (thử bằng điện thoại dùng 4G), và có ít nhất 2 lần deploy trong lịch sử.

### Mốc 5: Thêm Supabase và RLS (45 phút)

Đây là mốc khó nhất và là phần riêng của dự án. Làm lần lượt:

1. **Đã học ở [bài 04 Supabase](04-supabase.md), Bước 1 và Bước 3:** tạo project Supabase, lấy Project URL và publishable key.
2. Mở SQL Editor, chép khối SQL trong mục gập bên dưới (bảng `members` và `admins`, bật RLS, policy) vào và bấm Run. Đây cũng là nội dung file `schema.sql` trong gói mẫu.
3. Kiểm tra RLS đã bật cho cả hai bảng `members`, `admins` (Table Editor, nhãn RLS enabled).
4. Tạo `config.js` từ `config.example.js` (có trong gói mẫu), chỉ điền URL và khóa công khai.
5. Nhờ agent nối form với `supabase-js` (prompt ở mục sau). Chạy local, gửi một đăng ký thử, kiểm tra dòng đó xuất hiện trong Table Editor.
6. Tạo user admin và thêm vào bảng `admins`, làm trang `admin.html` đăng nhập và xem danh sách. Cách tạo admin an toàn: mục "Tạo admin đầu tiên" ở [Supabase nâng cao](04-supabase-advanced.md).
7. Thử "tấn công" chính mình theo [bài 04, Bước 5](04-supabase.md): đọc `members` bằng khóa công khai, không đăng nhập. Phải ra rỗng.

::: details SQL cho bảng members và admins (chép toàn bộ vào SQL Editor)

```sql
-- Chạy toàn bộ file này trong Supabase: SQL Editor > New query > dán > Run.
-- Có thể chạy lại nhiều lần (idempotent).

-- 1. Bảng thành viên đăng ký
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  student_id  text,
  interest    text not null default 'general',
  created_at  timestamptz not null default now(),
  constraint members_full_name_len check (char_length(full_name) between 2 and 100),
  constraint members_email_format  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  constraint members_student_len   check (student_id is null or char_length(student_id) <= 30),
  constraint members_interest_ok   check (interest in ('general', 'web', 'ai', 'devops', 'design'))
);

-- Không cho đăng ký trùng email (so sánh không phân biệt hoa thường)
create unique index if not exists members_email_unique on public.members (lower(email));

-- 2. Bảng admin: ai có tên ở đây mới được xem danh sách
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 3. BẬT Row Level Security. Không bật = ai có khóa công khai cũng đọc được hết.
alter table public.members enable row level security;
alter table public.admins  enable row level security;

-- 4. Quyền cấp ở mức bảng (RLS lọc thêm ở mức dòng)
revoke all on public.members from anon, authenticated;
revoke all on public.admins  from anon, authenticated;
grant insert on public.members to anon, authenticated;   -- ai cũng đăng ký được
grant select on public.members to authenticated;         -- chỉ người đăng nhập mới có thể đọc (và còn bị policy lọc)
grant select on public.admins  to authenticated;         -- để admin tự kiểm tra mình có trong danh sách

-- 5. Policy
drop policy if exists "Ai cung dang ky duoc" on public.members;
create policy "Ai cung dang ky duoc"
  on public.members for insert
  to anon, authenticated
  with check (
    char_length(full_name) between 2 and 100
    and char_length(email) <= 200
  );

drop policy if exists "Chi admin duoc xem" on public.members;
create policy "Chi admin duoc xem"
  on public.members for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "Admin xem dong cua minh" on public.admins;
create policy "Admin xem dong cua minh"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Không có policy UPDATE/DELETE: không ai sửa hoặc xóa được qua khóa công khai.

-- 6. Thêm admin (CHẠY RIÊNG sau khi tạo user trong Authentication > Users):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'admin@example.com';
```
:::

Phân quyền admin bằng bảng `admins`, không bằng `user_metadata` (người dùng tự sửa được).

Đưa bản có Supabase lên mạng: `config.js` bị `.gitignore` chặn nên không có trên GitHub; nếu để nguyên, trang online sẽ hiện "Chưa cấu hình Supabase". Cách khuyến nghị:

8. Trong cài đặt của nền tảng, đặt biến môi trường `SUPABASE_URL` (Project URL) và `SUPABASE_KEY` (publishable key). Đây là khóa công khai, không phải bí mật; `service_role` hay `sb_secret_` thì tuyệt đối không.
9. Đặt Build command là `node build-config.mjs` và thư mục xuất bản là `dist`:

| Nền tảng | Build command | Thư mục xuất bản | Chỗ đặt biến |
| --- | --- | --- | --- |
| Vercel | `node build-config.mjs` | `dist` | Settings, Environment Variables |
| Netlify | `node build-config.mjs` | `dist` | Site configuration, Environment variables |
| Cloudflare Workers (static assets) | `node build-config.mjs`, và trong `wrangler.jsonc` đặt `assets.directory` là `./dist` | `dist` | Settings, Build, Variables and secrets (biến lúc build) |
| Cloudflare Pages (đường cũ) | `node build-config.mjs` | `dist` | Settings, Variables and Secrets (loại Text) |
| GitHub Pages | Bước build trong GitHub Actions | `path: dist` | Settings, Secrets and variables, Actions, tab Variables |

10. GitHub Pages cần thêm file workflow; bản mẫu đầy đủ nằm trong mục Deploy của README mẫu. Redeploy sau khi đặt biến, vì biến chỉ được đọc lúc build.
11. Mở link online: dòng "Chưa cấu hình Supabase" phải biến mất, `/config.js` chỉ chứa khóa `sb_publishable_`. Gửi một đăng ký thử rồi đăng nhập `/admin.html`.
12. Quay lại Supabase, Authentication, URL Configuration: đặt Site URL thành địa chỉ trang thật và thêm địa chỉ đó (có `/**`) vào Redirect URLs, giữ localhost nếu còn làm trên máy.

Cách thay thế đơn giản hơn nhưng kém gọn: `git add -f config.js` khi chắc chắn file chỉ có khóa công khai, rồi để Build command trống và thư mục xuất bản là gốc.

Tiêu chí: một đăng ký thử từ link công khai (bản đã build, không phải localhost) xuất hiện trong Supabase; `curl` ẩn danh đọc `members` trả về rỗng; admin đăng nhập thì thấy danh sách.

### Mốc 6: Domain và HTTPS (20 phút)

Dùng domain phụ miễn phí của hosting (ví dụ `ten-ban.vercel.app`, `ten-ban.pages.dev`, `ten-ban.netlify.app`, `ten-ban.github.io`) là đủ điểm. Nếu bạn tự quyết định mua domain riêng, làm theo [bài Domain, bảo mật và production](07-domain-security-production.md): đây là việc bạn tự thao tác, không giao cho agent.

Tiêu chí: thanh địa chỉ có ổ khóa (HTTPS), không có cảnh báo "mixed content" trong Console.

### Mốc 7: Rà soát bảo mật (20 phút)

Làm hết danh sách trong mục "Tự rà soát" bên dưới, rồi chụp ảnh làm bằng chứng cho bài nộp.

### Mốc 8: Demo (10 phút)

Đứng trước một người bạn, cầm điện thoại: mở link, đăng ký bằng email của bạn đó, mở admin trên laptop và cho thấy dòng mới xuất hiện. Sau đó trả lời năm câu hỏi giải thích ở mục "Mẫu bài nộp" trong [trang chấm điểm](09-mini-project-advanced.md).

## Nhờ AI agent làm giúp

Mỗi mốc có prompt gợi ý. Sao chép, sửa phần trong ngoặc vuông cho đúng dự án của bạn.

Mốc 2, hiểu code:

```text
Đọc app.js và giải thích cho người mới: từng đoạn làm gì, đoạn nào chạy khi người dùng bấm nút,
đoạn nào có gọi ra ngoài Internet. Chưa sửa gì. Chỉ ra 3 chỗ có thể gây lỗi.
```

Mốc 3, chuẩn bị GitHub:

```text
Tạo .gitignore cho dự án web tĩnh này: chặn config.js, .env, .env.*, node_modules.
Sau đó chạy git status và liệt kê file sẽ được commit. KHÔNG chạy git push, tôi sẽ tự đẩy.
```

Mốc 5, nối Supabase (dán URL và khóa công khai vào config.js bằng tay, đừng dán vào chat):

```text
Nối form đăng ký với Supabase bằng supabase-js lấy từ CDN jsdelivr (không build).
Đọc URL và khóa từ window.APP_CONFIG trong config.js (tôi sẽ tự tạo file này, đừng tạo giúp).
Chỉ insert vào bảng members (full_name, email, student_id, interest), KHÔNG gọi select sau insert.
Nếu lỗi mã 23505 thì báo "email đã đăng ký". Nếu chưa có cấu hình thì hiện thông báo thân thiện.
Dùng đúng bảng members và admins đã tạo bằng SQL ở mốc 5, không đổi schema. Không dùng service_role ở bất kỳ đâu.
```

Mốc 5, trang admin:

```text
Tạo admin.html và admin.js: đăng nhập bằng Supabase Auth (email và mật khẩu), hiển thị danh sách
members mới nhất trước, nút đăng xuất. Hiển thị dữ liệu bằng textContent, không dùng innerHTML.
Giải thích: vì sao nếu ai đó biết địa chỉ trang admin.html mà không đăng nhập thì vẫn không thấy dữ liệu?
```

Mốc 7, rà soát:

```text
Đóng vai người kiểm tra bảo mật. Quét toàn bộ repo tìm: khóa bí mật, service_role, sb_secret_,
innerHTML với dữ liệu người dùng, bảng thiếu RLS, policy kiểu "using (true)" cho select.
Liệt kê phát hiện kèm mức độ. KHÔNG tự sửa schema trên Supabase thật, chỉ đề xuất câu lệnh SQL để tôi đọc rồi tự chạy.
```

Bạn phải tự kiểm tra: đọc từng policy trong khối SQL ở mốc 5; chạy `curl` ẩn danh; nhìn lại danh sách file trước khi commit; mở trang trên điện thoại.

::: danger Những việc KHÔNG giao cho agent
- Dán `service_role`, secret key, mật khẩu admin hay token vào khung chat hoặc file trong repo.
- Bấm nâng cấp gói trả phí, nhập thông tin thẻ, mua domain.
- Tự chạy SQL phá hủy (`drop table`, `delete`) trên project Supabase có dữ liệu thật.
- Dán danh sách thành viên thật (họ tên, email) vào AI để "xử lý giúp".
- Tắt RLS hay đổi policy thành `using (true)` chỉ vì "cho chạy được".
:::

## Tự rà soát bảo mật (mốc 7)

| Việc cần kiểm tra | Cách kiểm tra | Đạt khi |
| --- | --- | --- |
| RLS bật | Table Editor, nhãn RLS của từng bảng | Cả `members` và `admins` đã bật |
| Khách không đọc được | `curl` ẩn danh tới `/rest/v1/members` | Trả về `[]` hoặc bị từ chối |
| Khách không sửa/xóa được | Thử `PATCH` hoặc `DELETE` bằng khóa công khai | Không có dòng nào bị đổi |
| Không có khóa bí mật trong repo | Tìm `sb_secret_`, `service_role`, `.env` trong repo và `git log -p` | Không có kết quả |
| XSS | Đăng ký thử với họ tên là một đoạn thẻ HTML in đậm, xem ở admin | Hiện nguyên chữ, không in đậm |
| Email trùng | Đăng ký hai lần cùng email | Lần hai báo đã đăng ký, không tạo dòng mới |
| Admin an toàn | Mật khẩu mạnh, tắt đăng ký công khai nếu không cần | Người lạ không tự tạo được user |
| Chi phí | Xem trang giá chính thức, chỉ dùng gói free, bật cảnh báo nếu dịch vụ có | Bạn nói được giới hạn gói free đang dùng |

## Nếu bị lỗi

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Form báo lỗi, Console có `new row violates row-level security policy` | Chưa chạy khối SQL ở mốc 5, hoặc policy insert sai vai trò (`to anon`) | Chạy lại khối SQL; kiểm tra Authentication, Policies của bảng `members` |
| Bấm gửi, thông báo thành công nhưng Table Editor trống | Đang trỏ nhầm project, hoặc ô bẫy bot bị trình duyệt tự điền | Kiểm tra `SUPABASE_URL` trong `config.js`; xóa autofill ô ẩn `website` |
| Admin đăng nhập được nhưng danh sách trống | User chưa nằm trong bảng `admins`, hoặc policy select sai | Chạy lệnh `insert into public.admins ...` đúng email; đọc lại policy "Chi admin duoc xem" |
| Local chạy, online trang không gửi được | `config.js` bị `.gitignore` chặn nên không được deploy | Dùng biến môi trường + `node build-config.mjs` (có trong gói mẫu), hoặc `git add -f config.js` nếu là khóa công khai |
| Console: `supabase is not defined` | Thẻ script CDN nằm sau `app.js`, hoặc mất mạng, hoặc bị chặn | Đặt script CDN trước `app.js`; thử mạng khác |
| Console: `Invalid API key` | Dán nhầm khóa, thừa khoảng trắng, hoặc khóa đã bị xoay | Copy lại khóa công khai từ Project Settings, API Keys |
| `build-config.mjs` báo "secret key" hoặc "service_role" | Bạn đặt nhầm khóa bí mật vào biến môi trường | Dừng lại, đặt khóa công khai; nếu khóa bí mật từng bị dán vào chat hoặc repo thì xoay ngay |
| Vài tuần sau, form báo lỗi hoặc admin không tải được | Project Supabase gói free bị tạm dừng vì ít hoạt động | Vào dashboard Supabase, bấm khôi phục (restore) project; đọc trang Project Pausing để biết điều kiện hiện hành |
| Trang hosting hiện 404 | Thư mục xuất bản sai, hoặc file không tên `index.html` | Kiểm tra Publish/Output directory trỏ đúng thư mục chứa `index.html` |

Một lỗi cố tình dùng cho phần chấm điểm nằm ở mục rubric trong [trang chấm điểm](09-mini-project-advanced.md).

## Chấm điểm và nộp bài

Bài được chấm trên 100 điểm theo sáu nhóm: chạy được qua link công khai (25), an toàn secret và RLS (30), trang admin (10), README (10), hiểu và giải thích (15), xử lý một lỗi cố tình (10). Có secret key hoặc `service_role` trong repo công khai là về 0 điểm nhóm 2. Bảng điểm chi tiết, mẫu bài nộp và các thử thách nâng cao nằm ở trang [Mini project: chấm điểm, nộp bài, thử thách](09-mini-project-advanced.md).

## Tự kiểm tra

Năm câu hỏi tự kiểm tra (kèm đáp án) nằm ở [trang chấm điểm](09-mini-project-advanced.md); làm trước khi demo.

## Checklist hoàn thành

- [ ] Có link công khai mở được trên điện thoại, HTTPS có ổ khóa.
- [ ] Form đăng ký lưu được vào bảng `members`, email trùng được xử lý.
- [ ] RLS bật cho `members` và `admins`; `curl` ẩn danh đọc `members` ra rỗng.
- [ ] Trang admin đăng nhập xem được danh sách; chưa đăng nhập thì không thấy dữ liệu.
- [ ] Repo và lịch sử Git không chứa secret key, `service_role`, `.env`.
- [ ] `.gitignore` chặn `config.js` và `.env`.
- [ ] README có cách chạy, cấu hình, deploy và link demo.
- [ ] Đã điền bài nộp và trả lời đủ 5 câu hỏi giải thích.
- [ ] Biết cách xử lý ít nhất một lỗi thật đã gặp.

## Tiếp theo

Bước kế: [07 Tên miền, bảo mật, production](07-domain-security-production.md) (domain riêng, rà soát bảo mật), rồi [11 Hoàn thiện và ra mắt](11-launch-polish.md) khi bạn muốn gửi link cho người lạ.

::: details Tra cứu thêm
- Làm sản phẩm bằng Lovable, Bolt, v0 hay Replit: [10 App-builder](10-app-builders.md).
- Chấm điểm và nộp bài: [trang chấm điểm](09-mini-project-advanced.md).
- Gặp lỗi: [Xử lý sự cố](08-troubleshooting.md); prompt mẫu: [Thư viện prompt](prompt-library.md); lệnh: [CLI cheatsheet](cli-cheatsheet.md); nền tảng: [Nền tảng hosting](platforms.md); lộ trình: [trang chủ track](index.md).
- Khi sản phẩm lớn lên, bảng dưới cho biết lúc nào cần học thêm DevOps.

| Dấu hiệu | Nên học |
| --- | --- |
| Chạy trên máy bạn thì được, máy bạn khác thì lỗi | Docker trong khóa [DevOps chính](../index.md) |
| Mỗi lần sửa phải kiểm tra tay, sợ làm hỏng | CI/CD với GitHub Actions |
| Nhiều người cùng sửa, cần môi trường thử riêng | Môi trường staging, preview, quản lý cấu hình |
| Lượng người dùng lớn, cần nhiều bản chạy song song | Kubernetes, giám sát, logging |
:::

Tài liệu chính thức (giao diện và gói free thay đổi, luôn đối chiếu trang chính thức):

- Supabase, Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase, API keys (publishable và secret): https://supabase.com/docs/guides/api/api-keys
- Supabase, đăng nhập bằng mật khẩu: https://supabase.com/docs/guides/auth/passwords
- Supabase JavaScript client: https://supabase.com/docs/reference/javascript/installing
- Hosting: xem danh sách link ở [bài 02 Hosting tĩnh](02-static-hosting.md).
