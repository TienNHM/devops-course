# Trước khi chia sẻ link: chống spam, SEO, analytics và go-live

> **Tóm tắt:** Làm những việc cuối trước khi gửi link cho người lạ: chống spam form, hiển thị đẹp khi chia sẻ, đo lượt truy cập riêng tư, sao lưu dữ liệu, đo tốc độ và tick checklist 20 mục.

Thời lượng ước tính: 90-120 phút (làm từng phần, không cần xong một lần).

## Bạn sẽ làm được gì

- Chặn phần lớn bot spam form bằng honeypot, Cloudflare Turnstile, giới hạn độ dài và kiểm tra ở phía server.
- Làm cho link hiện tiêu đề, mô tả, ảnh đẹp khi gửi qua Zalo, Facebook, Messenger; có favicon, `sitemap.xml`, `robots.txt`.
- Gắn analytics tôn trọng riêng tư và biết khi nào cần banner cookie.
- Biết vì sao thanh toán nằm ngoài phạm vi, và cách nhận tiền an toàn mà không tự xử lý thẻ.
- Sao lưu dữ liệu Supabase hoặc Firebase ở mức thực hành, đặt lịch nhắc.
- Chạy Lighthouse, đọc cảnh báo và nhờ agent sửa đúng chỗ.
- Tick hết checklist go-live 20 mục.

## Khái niệm trong 5 phút

Hãy nghĩ bạn sắp khai trương quán. Bài [Domain, bảo mật và vận hành](07-domain-security-production.md) là khóa cửa, lắp điện nước. Bài này là phần "trước giờ mở cửa": treo biển cho đẹp, đặt chuông chống người phá rối, đặt máy đếm khách và chuẩn bị sổ sách dự phòng.

| Khái niệm | Ví dụ đời thường | Trong thực tế |
| --- | --- | --- |
| Honeypot | Cái hộp "trống" mà chỉ kẻ gian mới thò tay vào | Ô nhập ẩn; người thật không thấy nên không điền, bot điền |
| Captcha / Turnstile | Bảo vệ hỏi nhanh "bạn là người à?" | Widget của Cloudflare, người thật thường không phải giải đố |
| Rate limit | Mỗi người chỉ được lấy số thứ tự vài lần mỗi phút | Giới hạn số request trên mỗi IP hoặc mỗi tài khoản |
| Open Graph (OG) | Tấm danh thiếp in sẵn | Thẻ meta cho Zalo, Facebook biết hiện tiêu đề, ảnh gì |
| Analytics | Máy đếm khách ở cửa | Số lượt xem trang, nguồn truy cập |
| Backup | Photo sổ sách cất ở nhà khác | File xuất dữ liệu bạn cất ngoài dịch vụ |
| Lighthouse | Phiếu khám sức khỏe tổng quát | Công cụ trong Chrome chấm tốc độ, truy cập, SEO |

```mermaid
flowchart LR
  A["Khách gửi form"] --> B["Honeypot + Turnstile"]
  B --> C["Server kiểm tra token, độ dài, tần suất"]
  C --> D["Database có RLS và ràng buộc"]
  D --> E["Backup định kỳ"]
```

Nguyên tắc xuyên suốt: mọi lớp chống spam ở trình duyệt chỉ là "biển báo". Lớp thật phải nằm ở server hoặc database, vì bot gọi thẳng API mà không qua giao diện của bạn.

## Thực hành từng bước

Làm theo thứ tự các phần A đến G. Ví dụ dùng form đăng ký của CLB (xem [club-landing](../examples/vibe/club-landing/README.md)), nhưng cách làm áp dụng cho form liên hệ bất kỳ.

### Phần A. Chống spam và bot cho form

**Bước 1. Thêm honeypot.** Thêm một ô ẩn vào form. Người thật không thấy nên để trống; bot tự động thường điền mọi ô.

```html
<form id="dang-ky" method="post">
  <label>Họ tên <input name="name" required maxlength="80" /></label>
  <label>Email <input name="email" type="email" required maxlength="120" /></label>

  <!-- Honeypot: ẩn bằng CSS, người thật không điền -->
  <div style="position:absolute; left:-9999px" aria-hidden="true">
    <label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
  </div>

  <button type="submit">Gửi</button>
</form>
```

Ở phía server, nếu `website` có nội dung thì bỏ qua yêu cầu nhưng vẫn trả về "thành công" để bot không biết mình bị phát hiện:

```js
if (body.website) {
  return Response.json({ ok: true }); // giả vờ thành công, không lưu gì
}
```

Bạn sẽ thấy: gửi form bình thường vẫn lưu được; nếu tự điền ô `website` bằng DevTools rồi gửi, dữ liệu không xuất hiện trong database.

**Bước 2. Thêm Cloudflare Turnstile.** Turnstile là captcha thân thiện của Cloudflare, có thể dùng cả khi web của bạn không nằm trên Cloudflare. Theo tài liệu Cloudflare (kiểm tra 10/2026): mỗi widget có `sitekey` (công khai, để trong HTML) và `secret key` (bí mật, chỉ ở server); token sống 300 giây và chỉ kiểm tra được một lần.

1. Vào dashboard Cloudflare, mục Turnstile, tạo một widget và nhập domain của bạn (bạn tự thao tác, giá và gói xem trang chính thức).
2. Dán script và widget vào form (thay `SITEKEY_CUA_BAN` bằng sitekey công khai của bạn):

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<form id="dang-ky" method="post">
  <!-- các ô nhập như trên -->
  <div class="cf-turnstile" data-sitekey="SITEKEY_CUA_BAN"></div>
  <button type="submit">Gửi</button>
</form>
```

Khi widget nằm trong `form`, nó tự thêm một ô ẩn tên `cf-turnstile-response` chứa token. Gửi cả ô này lên server.

3. Ở server, kiểm tra token trước khi lưu dữ liệu. Secret key đặt trong biến môi trường `TURNSTILE_SECRET_KEY` (xem [Phần B của bài 07](07-domain-security-production.md)), không viết thẳng vào code:

```js
async function verifyTurnstile(token, ip) {
  const form = new FormData();
  form.append("secret", process.env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const data = await res.json();
  return data.success === true;
}
```

Tài liệu Cloudflare có sẵn khóa thử nghiệm: sitekey `1x00000000000000000000AA` luôn qua, `2x00000000000000000000AB` luôn thất bại; secret `1x0000000000000000000000000000000AA` luôn qua. Dùng chúng để thử luồng trên máy mình. Trước khi public, thay bằng khóa thật của widget (khóa thử nghiệm không bảo vệ gì cả).

Bạn sẽ thấy: widget hiện ô "Verify you are human" (hoặc tự xác minh); gửi form với token trống hoặc sai bị server từ chối.

Nếu form của bạn gửi thẳng vào Supabase Auth (đăng ký, đăng nhập), Supabase có sẵn tùy chọn bật captcha trong phần Auth, xem [tài liệu Supabase Auth Captcha](https://supabase.com/docs/guides/auth/auth-captcha). Với form ghi thẳng vào bảng, hãy cho form đi qua một function (Vercel, Netlify, Cloudflare hoặc Supabase Edge Function) để có chỗ kiểm tra token.

**Bước 3. Rate limit ở mức nền tảng.** Bạn không cần tự viết thuật toán. Hãy tìm công cụ có sẵn:

| Nơi | Việc có thể làm | Ghi chú |
| --- | --- | --- |
| Supabase Auth | Có giới hạn số email, đăng nhập, OTP mỗi giờ trong cài đặt Auth | Xem mục Rate limits trong dashboard và tài liệu; giá trị mặc định có thể đổi |
| Cloudflare | Luật rate limiting trong phần Security | Số luật và giới hạn của gói Free đọc trên trang chính thức |
| Vercel | Firewall có luật giới hạn tốc độ | Tính năng và gói áp dụng kiểm tra trong tài liệu Vercel Firewall |
| Tự làm tối thiểu | Mỗi email hoặc IP chỉ gửi form một lần trong vài phút | Dùng ràng buộc `unique` hoặc kiểm tra thời gian gửi gần nhất trong function |

Nếu chỉ làm được một việc: ràng buộc `unique` trên cột email trong database, để một email không thể đăng ký 1000 lần.

**Bước 4. Giới hạn độ dài và kiểm tra ở server hoặc database.** Đừng chỉ tin `maxlength` của HTML. Ví dụ ràng buộc cho Supabase (chạy trong SQL Editor):

```sql
alter table public.members
  add constraint name_length check (char_length(name) between 1 and 80),
  add constraint email_length check (char_length(email) between 5 and 120);
```

Và trong function: kiểm tra kiểu dữ liệu, cắt khoảng trắng, từ chối khi quá dài, giới hạn kích thước body (ví dụ không nhận quá vài KB cho form chữ).

Bạn sẽ thấy: gửi một tên dài 500 ký tự bằng công cụ như `curl` bị database hoặc function từ chối.

### Phần B. SEO và chia sẻ link tối thiểu

**Bước 5. Thẻ meta cho tiêu đề, mô tả, Open Graph và Twitter card.** Đặt trong phần `head` của trang chủ (thay nội dung và domain thật của bạn):

```html
<title>CLB Lập trình Ví dụ | Đăng ký thành viên</title>
<meta name="description" content="CLB sinh hoạt thứ Bảy hằng tuần. Đăng ký online, miễn phí." />
<link rel="canonical" href="https://ten-mien-cua-ban.vn/" />

<meta property="og:type" content="website" />
<meta property="og:title" content="CLB Lập trình Ví dụ" />
<meta property="og:description" content="Sinh hoạt thứ Bảy hằng tuần. Đăng ký online, miễn phí." />
<meta property="og:url" content="https://ten-mien-cua-ban.vn/" />
<meta property="og:image" content="https://ten-mien-cua-ban.vn/og-image.png" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="CLB Lập trình Ví dụ" />
<meta name="twitter:description" content="Sinh hoạt thứ Bảy hằng tuần." />
<meta name="twitter:image" content="https://ten-mien-cua-ban.vn/og-image.png" />
```

Mẹo: ảnh `og-image.png` cỡ khoảng 1200 x 630 pixel, dùng địa chỉ đầy đủ bắt đầu bằng `https://`, dung lượng nhẹ (dưới vài trăm KB). Title nên dưới khoảng 60 ký tự, description khoảng 120-160 ký tự.

**Bước 6. Favicon, sitemap và robots.**

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

Tạo file `robots.txt` ở thư mục gốc (đặt trong thư mục `public` hoặc thư mục gốc của web tĩnh):

```text
User-agent: *
Allow: /

Sitemap: https://ten-mien-cua-ban.vn/sitemap.xml
```

Và `sitemap.xml` cho web nhỏ vài trang:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ten-mien-cua-ban.vn/</loc></url>
  <url><loc>https://ten-mien-cua-ban.vn/gioi-thieu.html</loc></url>
</urlset>
```

Nếu muốn một trang (ví dụ trang admin) không bị Google lập chỉ mục, đừng chỉ dựa vào `robots.txt` (ai cũng đọc được file này). Hãy bảo vệ trang bằng đăng nhập và thêm `meta name="robots" content="noindex"`.

Bạn sẽ thấy: mở `https://ten-mien-cua-ban.vn/robots.txt` và `/sitemap.xml` trên trình duyệt hiện đúng nội dung vừa tạo.

**Bước 7. Kiểm tra preview khi gửi link.**

1. Mở [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), dán link, bấm Debug. Nếu vừa sửa thẻ, bấm "Scrape Again" để xóa bản nhớ cũ.
2. Với Zalo: gửi link vào chat "Cloud của tôi" (nhắn cho chính mình) và xem thẻ hiển thị. Zalo cũng đọc thẻ Open Graph nhưng giữ bản nhớ đệm (cache); nếu còn thấy hình cũ, đổi tên file ảnh (ví dụ `og-image-v2.png`) rồi gửi lại.
3. Thử cả Messenger và một ứng dụng khác để chắc chắn.

Bạn sẽ thấy: thẻ có đúng ảnh, tiêu đề và mô tả. Nếu chỉ hiện đường link trần, thường do thiếu `og:image` hoặc ảnh dùng địa chỉ tương đối.

### Phần C. Analytics thân thiện riêng tư và cookie

Bảng dưới là các lựa chọn phổ biến. Gói và giá thay đổi, hãy mở trang chính thức trước khi quyết định (kiểm tra 10/2026):

| Công cụ | Điểm chính | Lưu ý gói miễn phí |
| --- | --- | --- |
| Cloudflare Web Analytics | Tài liệu mô tả là phân tích ưu tiên riêng tư, không cần đổi DNS hay dùng proxy của Cloudflare, có trên mọi gói | Đọc trang chính thức để biết giới hạn hiện hành |
| Vercel Web Analytics | Bật trong tab Analytics của dự án trên Vercel | Gói Hobby kèm 50.000 sự kiện mỗi tháng; vượt thì ngừng thu thập, không bị tính phí thêm (theo trang giá, 10/2026) |
| Plausible | Gọn, ưu tiên riêng tư, có thể tự host | Bản dịch vụ đám mây thường tính phí, có thể có dùng thử; xem trang giá |
| Umami | Mã nguồn mở, tự host hoặc dùng bản cloud | Có thể có gói free cho cloud; kiểm tra trang giá |

Chọn một cái là đủ. Với người mới trên Vercel, bật Vercel Web Analytics nhanh nhất; với web ở nơi khác, thử Cloudflare Web Analytics.

Về cookie và đồng ý (consent), mức cơ bản:

- Công cụ không dùng cookie theo dõi thì thường không cần banner phức tạp, nhưng bạn vẫn nên có một trang "Quyền riêng tư" ngắn nói rõ bạn thu thập gì, dùng để làm gì, liên hệ ai để xóa dữ liệu.
- Nếu bạn dùng Google Analytics, pixel quảng cáo hoặc công cụ đặt cookie theo dõi, nhiều nơi (như châu Âu) yêu cầu hỏi đồng ý trước. Quy định mỗi quốc gia mỗi khác; nếu nhắm tới người dùng ngoài Việt Nam hoặc thu dữ liệu nhạy cảm, hãy hỏi người am hiểu pháp lý.
- Form thu email, số điện thoại là dữ liệu cá nhân: chỉ hỏi điều thật sự cần, ghi rõ mục đích bên cạnh nút gửi.

Bạn sẽ thấy: sau khi bật, mở web ở cửa sổ ẩn danh vài lần, vài phút sau bảng analytics có số lượt xem tăng lên.

### Phần D. Thanh toán nằm ngoài phạm vi

Track này không dạy bạn nhận tiền bằng code tự viết. Lý do: lỗi trong xử lý thẻ có thể gây mất tiền thật và vi phạm quy định bảo mật thẻ, rủi ro quá lớn cho sản phẩm do AI viết.

Nếu cần nhận tiền:

- Dùng trang thanh toán dựng sẵn của nhà cung cấp, ví dụ [Stripe Payment Links](https://docs.stripe.com/payment-links) hoặc Stripe Checkout: bạn tạo link trong dashboard của họ, web của bạn chỉ có một nút dẫn tới link đó.
- Ở Việt Nam, có thể dùng cổng thanh toán nội địa có sẵn trang thanh toán hoặc link thanh toán; tự đọc điều khoản, phí và quy trình đăng ký của từng bên.
- Không tự thu số thẻ trong form của bạn. Không lưu số thẻ vào database.
- Không dán khóa thanh toán (secret key, webhook secret) vào prompt hay vào repo. Nếu sau này cần webhook, hãy học kỹ từ tài liệu của nhà cung cấp và nhờ người có kinh nghiệm xem lại.
- Việc tạo tài khoản, xác minh danh tính, nhập thông tin ngân hàng là việc bạn tự làm; không nhờ agent làm hộ.

### Phần E. Sao lưu dữ liệu ở mức thực hành

Bài [07](07-domain-security-production.md) đã nói tổng quan; ở đây bạn làm thật một lần.

**Supabase, cách 1: xuất CSV.** Vào Table Editor, chọn bảng, dùng nút xuất ra CSV. Dễ nhất, đủ dùng cho bảng vài trăm dòng.

**Supabase, cách 2: dump bằng CLI.** Theo tài liệu Supabase, dự án gói Free nên tự xuất dữ liệu định kỳ (gói trả phí mới có backup hằng ngày). Với CLI đã `supabase login` và `supabase link` ở máy bạn:

```bash
supabase db dump --linked -f backup-schema.sql
supabase db dump --linked --data-only -f backup-data.sql
```

Lưu ý quan trọng: backup của Supabase không gồm file đã tải lên Storage (chỉ có thông tin mô tả), nên ảnh và tệp cần tải về riêng. File backup có thể chứa dữ liệu cá nhân: đừng đẩy lên GitHub công khai, thêm `backup-*.sql` vào `.gitignore`.

**Firebase.** Với Firestore, xem tính năng export/import trong tài liệu Firebase và Google Cloud (có thể cần gói Blaze và tốn phí lưu trữ, bạn tự cân nhắc). Dự án nhỏ có thể tự viết một script đọc collection ra file JSON bằng tài khoản của bạn.

**Đặt lịch nhắc.** Backup không đặt lịch thì sẽ không bao giờ làm. Tạo sự kiện lặp trong Google Calendar hoặc điện thoại: "Chủ nhật 20:00: backup dữ liệu web CLB". Tần suất tùy mức quan trọng: tuần một lần cho dữ liệu thay đổi nhiều, tháng một lần cho dữ liệu ít đổi. Cất bản sao ở một nơi khác với nơi chạy dự án (ổ đĩa của bạn, Google Drive riêng tư).

Bạn sẽ thấy: file `backup-data.sql` hoặc CSV có dung lượng lớn hơn 0 và mở bằng trình soạn thảo thấy dữ liệu của bạn. Thử nạp vào một dự án trống ít nhất một lần để biết nó dùng được.

### Phần F. Đo hiệu năng bằng Lighthouse

1. Mở web đã deploy bằng Chrome, ở cửa sổ ẩn danh (để tiện ích mở rộng không làm sai điểm).
2. Nhấn F12, chọn tab Lighthouse, chọn Mobile, tích Performance, Accessibility, Best practices, SEO, bấm Analyze page load.
3. Chờ vài chục giây. Báo cáo cho 4 điểm từ 0 đến 100 và danh sách "Opportunities", "Diagnostics".
4. Ghi lại điểm ban đầu, sửa từng nhóm lỗi, đo lại. Xem [giới thiệu Lighthouse của Chrome](https://developer.chrome.com/docs/lighthouse/overview) nếu muốn biết chi tiết từng chỉ số.

Các cảnh báo hay gặp với web AI viết và cách xử lý:

| Cảnh báo | Nghĩa là gì | Hướng sửa |
| --- | --- | --- |
| Properly size images / Serve images in next-gen formats | Ảnh quá to hoặc định dạng nặng | Thu nhỏ đúng kích thước hiển thị, đổi sang WebP hoặc AVIF |
| Largest Contentful Paint chậm | Nội dung chính hiện muộn | Nén ảnh đầu trang, bỏ script chặn hiển thị |
| Image elements do not have alt attributes | Thiếu văn bản thay thế ảnh | Thêm `alt` mô tả ngắn |
| Document does not have a meta description | Thiếu mô tả cho SEO | Thêm thẻ `description` như Phần B |
| Links do not have a discernible name / Buttons without accessible name | Nút hoặc link chỉ có biểu tượng | Thêm chữ hoặc `aria-label` |
| Background and foreground colors do not have a sufficient contrast ratio | Chữ khó đọc | Đổi màu chữ hoặc nền cho đủ tương phản |
| Does not use HTTPS / mixed content | Còn tải tài nguyên bằng `http://` | Đổi hết sang `https://` |

Điểm 100 không phải mục tiêu bắt buộc. Với web CLB hay portfolio, mục tiêu hợp lý là Performance và Accessibility trên khoảng 80-90 trên di động, SEO và Best practices cao.

### Phần G. Checklist go-live 20 mục

Đây là danh sách để bạn tự tick trước khi gửi link rộng rãi (phiên bản có thể sao chép nằm ở phần Checklist hoàn thành cuối bài). Mỗi nhóm có phần việc đã nói ở trên hoặc ở bài [07](07-domain-security-production.md).

| Nhóm | Mục |
| --- | --- |
| Bảo mật (1-5) | Không secret trong repo; khóa đúng loại ở frontend; RLS hoặc Rules đã kiểm tra bằng cửa sổ ẩn danh; 2FA cho các tài khoản; CORS không để dấu sao |
| Form (6-9) | Honeypot; Turnstile kiểm tra ở server; giới hạn độ dài và ràng buộc database; có rate limit hoặc ràng buộc unique |
| Chia sẻ (10-13) | Title và description; Open Graph kèm ảnh 1200 x 630; favicon; sitemap và robots |
| Đo lường (14-15) | Analytics đã bật và thấy số liệu; trang quyền riêng tư ngắn |
| Vận hành (16-18) | Uptime check; cảnh báo chi phí hoặc kiểm tra Usage hằng tuần; đã thử rollback |
| Dữ liệu và chất lượng (19-20) | Đã backup một lần và có lịch nhắc; Lighthouse đã chạy, điểm ghi lại |

## Nhờ AI agent làm giúp

Dưới đây là prompt cụ thể cho từng phần. Dán vào agent trong thư mục dự án của bạn. Agent đọc và sửa code; bạn giữ phần tài khoản, khóa và tiền.

**Prompt 1: honeypot và kiểm tra phía server.**

```text
Dự án này có form đăng ký ở file (ghi tên file). Hãy:
1. Thêm ô honeypot ẩn tên website, và ở phía server bỏ qua yêu cầu nếu ô này có giá trị (vẫn trả về thành công).
2. Thêm kiểm tra phía server: kiểu dữ liệu, cắt khoảng trắng, độ dài tên tối đa 80 và email tối đa 120, từ chối body quá lớn.
3. Đề xuất câu lệnh SQL thêm ràng buộc check độ dài và unique cho email, KHÔNG tự chạy lên database thật.
Giải thích ngắn gọn bằng tiếng Việt mỗi thay đổi. Không tạo hay in ra secret nào.
```

**Prompt 2: Turnstile.**

```text
Hãy tích hợp Cloudflare Turnstile vào form (ghi tên file) theo tài liệu chính thức của Cloudflare.
- Sitekey đọc từ biến công khai, secret key đọc từ biến môi trường TURNSTILE_SECRET_KEY ở server.
- Kiểm tra token bằng endpoint siteverify TRƯỚC khi lưu dữ liệu, từ chối nếu thất bại.
- Dùng khóa thử nghiệm của Cloudflare khi chạy trên máy, thêm file .env.example chỉ có TÊN biến, không có giá trị.
Tôi sẽ tự tạo widget và tự nhập khóa thật vào dashboard. Đừng yêu cầu tôi dán khóa vào chat.
```

**Prompt 3: SEO và chia sẻ link.**

```text
Hãy thêm vào trang chủ: title, meta description, canonical, Open Graph, Twitter card, favicon; tạo robots.txt và sitemap.xml cho các trang hiện có. Domain chính là (điền domain của bạn). Nội dung mô tả viết bằng tiếng Việt, tiêu đề dưới 60 ký tự, mô tả 120-160 ký tự. Ảnh chia sẻ dùng đường dẫn tuyệt đối https. Liệt kê những file đã sửa. Nhắc tôi cần tạo ảnh og-image 1200x630 vì bạn không tự bịa ảnh.
```

**Prompt 4: analytics.**

```text
Hãy hướng dẫn và thêm đoạn mã bật (chọn một: Vercel Web Analytics / Cloudflare Web Analytics) vào dự án theo tài liệu chính thức. Không thêm Google Analytics hay pixel quảng cáo. Sau đó soạn trang quyền riêng tư ngắn bằng tiếng Việt nói rõ: web thu thập dữ liệu gì, dùng để làm gì, liên hệ ở đâu để xóa dữ liệu. Ghi chú rõ phần nào tôi cần tự kiểm tra với quy định pháp lý.
```

**Prompt 5: thanh toán (chỉ để tránh sai lầm).**

```text
Tôi muốn nhận tiền cho sản phẩm này. KHÔNG viết code xử lý thẻ và không yêu cầu bất kỳ khóa thanh toán nào. Chỉ giúp tôi: thêm một nút "Thanh toán" dẫn tới link thanh toán có sẵn mà tôi sẽ tự tạo ở nhà cung cấp, và viết trang cảm ơn. Liệt kê những việc tôi phải tự làm ở dashboard của nhà cung cấp.
```

**Prompt 6: backup.**

```text
Hãy viết file BACKUP.md hướng dẫn tôi sao lưu dữ liệu dự án này: xuất CSV ở Table Editor và lệnh supabase db dump --linked (kèm --data-only). Thêm backup-*.sql và thư mục backups/ vào .gitignore. Soạn danh sách tên bảng cần sao lưu từ code. KHÔNG tự chạy lệnh dump và không yêu cầu chuỗi kết nối cơ sở dữ liệu của tôi.
```

**Prompt 7: Lighthouse.**

```text
Đây là danh sách cảnh báo Lighthouse của web tôi (dán phần chữ của báo cáo, KHÔNG dán đường link có token). Hãy sắp xếp theo mức tác động, rồi sửa các lỗi dễ và an toàn: thêm alt cho ảnh, aria-label cho nút biểu tượng, thêm kích thước width và height cho ảnh, nén hoặc đổi định dạng ảnh nếu có công cụ phù hợp, thêm thẻ meta thiếu. Với mỗi thay đổi, nêu lý do. Không xóa tính năng để tăng điểm.
```

**Prompt 8: rà soát go-live.**

```text
Rà soát dự án theo checklist go-live 20 mục (tôi dán bên dưới). Với mỗi mục hãy trả lời Đạt, Chưa đạt hoặc Không xác định được từ code, kèm file bằng chứng. Chỉ báo cáo, không sửa file.
```

Việc bạn phải tự kiểm tra:

- Tự gửi form bằng cửa sổ ẩn danh, thử nhập liệu xấu (rất dài, trống, ký tự lạ).
- Tự gửi link vào Zalo, Messenger và xem thẻ hiển thị.
- Tự nhìn bảng analytics, tự mở file backup, tự chạy Lighthouse để xem điểm thật.
- Tự đọc điều khoản của nhà cung cấp analytics và thanh toán.

Việc **không giao cho agent**:

- Dán `secret key` của Turnstile, `service_role`, token, khóa thanh toán hay chuỗi kết nối database vào prompt.
- Tạo tài khoản, đăng ký nhà cung cấp thanh toán, nhập thẻ, nâng cấp gói trả phí.
- Tự code phần nhận số thẻ hoặc xử lý webhook tiền mà không có người có kinh nghiệm xem lại.
- Dán dữ liệu thành viên thật hoặc file backup thật vào chat.
- Tắt kiểm tra Turnstile hay RLS "cho tiện thử" rồi quên bật lại.

## Nếu bị lỗi

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Widget Turnstile không hiện | Domain chưa nằm trong danh sách của widget, thiếu script, hoặc bị chặn bởi tiện ích | Kiểm tra domain của widget, mở tab Console xem lỗi, thử cửa sổ ẩn danh |
| Server luôn báo token không hợp lệ | Dùng sitekey thật nhưng secret thử nghiệm (hoặc ngược lại), token hết hạn sau 300 giây, hoặc dùng token hai lần | Dùng cặp khóa cùng loại, lấy token mới cho mỗi lần gửi |
| Form bình thường cũng bị chặn | Honeypot bị trình duyệt tự điền, hoặc ô ẩn dùng tên như `email` | Đặt tên ô lạ như `website`, thêm `autocomplete="off"`, không dùng tên trùng ô thật |
| Zalo hoặc Facebook vẫn hiện hình cũ | Bản nhớ đệm của nền tảng chia sẻ | Bấm Scrape Again trên Facebook Debugger, đổi tên file ảnh rồi gửi lại |
| Ảnh chia sẻ không hiện | `og:image` dùng đường dẫn tương đối, ảnh quá nặng hoặc cần đăng nhập mới xem được | Dùng địa chỉ đầy đủ `https://`, nén ảnh, kiểm tra ảnh mở được ở cửa sổ ẩn danh |
| Số liệu analytics luôn bằng 0 | Chưa deploy lại sau khi thêm mã, bị trình chặn quảng cáo, hoặc đã hết hạn mức gói | Deploy lại, thử cửa sổ ẩn danh không có tiện ích, xem trang Usage |
| `supabase db dump` báo lỗi kết nối hoặc cần Docker | Chưa `supabase link`, mật khẩu database sai, hoặc phiên bản CLI cũ | Chạy `supabase link`, cập nhật CLI, đọc thông báo lỗi và [tài liệu lệnh](https://supabase.com/docs/reference/cli/supabase-db-dump) |
| Điểm Lighthouse mỗi lần đo một khác | Máy bận, mạng dao động, tiện ích mở rộng | Đo 3 lần ở cửa sổ ẩn danh, lấy giá trị giữa |
| Sau khi sửa SEO, Google chưa cập nhật | Công cụ tìm kiếm cần thời gian thu thập lại | Chờ vài ngày đến vài tuần; không cần làm gì thêm cho web nhỏ |

Xem thêm [Troubleshooting tổng hợp](08-troubleshooting.md) cho cách đọc log và Network tab.

## Tự kiểm tra

1. Vì sao ràng buộc độ dài chỉ ở `maxlength` của HTML là chưa đủ?
2. Honeypot hoạt động dựa trên ý tưởng gì, và vì sao server nên vẫn trả về "thành công" khi bắt được bot?
3. Trong Turnstile, khóa nào được đặt trong HTML, khóa nào chỉ ở server?
4. Bạn nhận được yêu cầu "thêm thanh toán thẻ ngay vào form". Bạn nên làm gì và không nên làm gì?
5. Backup của Supabase gói Free có tự động không, và backup có gồm file trong Storage không?
6. Link đã sửa ảnh chia sẻ nhưng Zalo vẫn hiện ảnh cũ. Bạn thử gì?
7. Điểm Lighthouse 100 có phải điều bắt buộc không?

<details><summary>Đáp án</summary>

1. Bot và người dùng kỹ thuật có thể gọi thẳng API, bỏ qua trang web của bạn nên `maxlength` không có tác dụng. Phải kiểm tra ở function và ràng buộc `check` trong database.
2. Người thật không thấy ô ẩn nên không điền, còn bot điền mọi ô. Trả về "thành công" để bot không biết bị phát hiện và không đổi cách tấn công, trong khi bạn không lưu gì.
3. `sitekey` công khai, đặt trong HTML. `secret key` bí mật, chỉ ở server (biến môi trường), dùng để gọi siteverify.
4. Dùng link thanh toán dựng sẵn của nhà cung cấp (như Stripe Payment Links) hoặc cổng nội địa có trang thanh toán; tự tạo tài khoản và link. Không tự code xử lý thẻ, không lưu số thẻ, không dán khóa thanh toán vào prompt.
5. Theo tài liệu Supabase, backup hằng ngày dành cho gói trả phí; gói Free nên tự xuất dữ liệu định kỳ. Backup không gồm file lưu qua Storage, chỉ có thông tin mô tả, nên cần tải file riêng.
6. Bản nhớ đệm. Đổi tên file ảnh (ví dụ thêm hậu tố phiên bản) và sửa `og:image` cho khớp, rồi gửi lại; kiểm tra bằng Facebook Debugger bấm Scrape Again.
7. Không. Mục tiêu hợp lý là điểm đủ tốt cho người dùng thật; không xóa tính năng chỉ để tăng điểm.

</details>

## Checklist hoàn thành

Go-live 20 mục:

- [ ] 1. Không có secret trong repo hoặc lịch sử git (đã quét)
- [ ] 2. Frontend chỉ dùng khóa publishable hoặc anon, không dùng secret hay service_role
- [ ] 3. RLS hoặc Security Rules đã thử bằng cửa sổ ẩn danh
- [ ] 4. Đã bật 2FA cho GitHub, nền tảng deploy, database và nhà đăng ký domain
- [ ] 5. CORS chỉ cho phép domain của bạn
- [ ] 6. Form có honeypot
- [ ] 7. Form có Turnstile và server kiểm tra token bằng khóa thật
- [ ] 8. Có giới hạn độ dài, kiểm tra ở server và ràng buộc database
- [ ] 9. Có rate limit của nền tảng hoặc ràng buộc `unique` chống gửi lặp
- [ ] 10. Trang có title và description riêng
- [ ] 11. Có Open Graph, Twitter card, ảnh 1200 x 630, đã thử trên Zalo và Facebook
- [ ] 12. Có favicon
- [ ] 13. Có `sitemap.xml` và `robots.txt` mở được
- [ ] 14. Analytics đã bật và thấy số liệu
- [ ] 15. Có trang quyền riêng tư ngắn, form nói rõ mục đích thu dữ liệu
- [ ] 16. Có uptime check gửi email cho bạn
- [ ] 17. Đã đặt cảnh báo chi phí hoặc lịch kiểm tra Usage hằng tuần
- [ ] 18. Đã thử rollback hoặc biết chính xác cách rollback
- [ ] 19. Đã backup dữ liệu một lần, thử mở file, đã đặt lịch nhắc
- [ ] 20. Đã chạy Lighthouse trên di động và ghi lại điểm

## Tiếp theo và tài liệu chính thức

- Quay lại [Domain, bảo mật và vận hành](07-domain-security-production.md) nếu chưa làm xong DNS, secret, rollback.
- Gặp lỗi lạ: [Troubleshooting tổng hợp](08-troubleshooting.md).
- Áp dụng toàn bộ vào dự án thật: [Mini project](09-mini-project.md).
- Cần prompt mẫu thêm: [Prompt library](prompt-library.md).

Tài liệu chính thức (kiểm chứng 10/2026, giao diện và gói có thể đổi):

- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
- [Plausible](https://plausible.io/docs) và [Umami](https://umami.is/docs)
- [Supabase backups](https://supabase.com/docs/guides/platform/backups)
- [Stripe Payment Links](https://docs.stripe.com/payment-links)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
- [Open Graph protocol](https://ogp.me/)
