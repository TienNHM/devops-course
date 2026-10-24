# Hoàn thiện và ra mắt: nâng cao

> **Tóm tắt:** Phần đọc thêm của bài ra mắt: favicon, sitemap và robots, analytics và cookie, thanh toán, backup thực hành và đo hiệu năng bằng Lighthouse.

::: tip Bạn làm gì
- **Kết quả:** có analytics, một bản backup đã thử mở, điểm Lighthouse ghi lại, và sitemap cùng robots.
- **Thời gian:** 45 đến 60 phút, làm từng phần.
- **Cần gì trước:** đã xong [Hoàn thiện và ra mắt](11-launch-polish.md) (phần chống spam và thẻ chia sẻ).
- **Module trước:** [Hoàn thiện và ra mắt](11-launch-polish.md).
:::

## Favicon, sitemap, robots {#favicon-sitemap-robots}

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

## Analytics thân thiện riêng tư và cookie

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

## Thanh toán nằm ngoài phạm vi

Track này không dạy bạn nhận tiền bằng code tự viết. Lý do: lỗi trong xử lý thẻ có thể gây mất tiền thật và vi phạm quy định bảo mật thẻ, rủi ro quá lớn cho sản phẩm do AI viết.

Nếu cần nhận tiền:

- Dùng trang thanh toán dựng sẵn của nhà cung cấp, ví dụ [Stripe Payment Links](https://docs.stripe.com/payment-links) hoặc Stripe Checkout: bạn tạo link trong dashboard của họ, web của bạn chỉ có một nút dẫn tới link đó.
- Ở Việt Nam, có thể dùng cổng thanh toán nội địa có sẵn trang thanh toán hoặc link thanh toán; tự đọc điều khoản, phí và quy trình đăng ký của từng bên.
- Không tự thu số thẻ trong form của bạn. Không lưu số thẻ vào database.
- Không dán khóa thanh toán (secret key, webhook secret) vào prompt hay vào repo. Nếu sau này cần webhook, hãy học kỹ từ tài liệu của nhà cung cấp và nhờ người có kinh nghiệm xem lại.
- Việc tạo tài khoản, xác minh danh tính, nhập thông tin ngân hàng là việc bạn tự làm; không nhờ agent làm hộ.

## Sao lưu dữ liệu ở mức thực hành

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

## Đo hiệu năng bằng Lighthouse

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
| Document does not have a meta description | Thiếu mô tả cho SEO | Thêm thẻ `description` như Phần B của [bài chính](11-launch-polish.md) |
| Links do not have a discernible name / Buttons without accessible name | Nút hoặc link chỉ có biểu tượng | Thêm chữ hoặc `aria-label` |
| Background and foreground colors do not have a sufficient contrast ratio | Chữ khó đọc | Đổi màu chữ hoặc nền cho đủ tương phản |
| Does not use HTTPS / mixed content | Còn tải tài nguyên bằng `http://` | Đổi hết sang `https://` |

Điểm 100 không phải mục tiêu bắt buộc. Với web CLB hay portfolio, mục tiêu hợp lý là Performance và Accessibility trên khoảng 80-90 trên di động, SEO và Best practices cao.

## Prompt cho agent

**Prompt A: analytics.**

```text
Hãy hướng dẫn và thêm đoạn mã bật (chọn một: Vercel Web Analytics / Cloudflare Web Analytics) vào dự án theo tài liệu chính thức. Không thêm Google Analytics hay pixel quảng cáo. Sau đó soạn trang quyền riêng tư ngắn bằng tiếng Việt nói rõ: web thu thập dữ liệu gì, dùng để làm gì, liên hệ ở đâu để xóa dữ liệu. Ghi chú rõ phần nào tôi cần tự kiểm tra với quy định pháp lý.
```

**Prompt B: thanh toán (chỉ để tránh sai lầm).**

```text
Tôi muốn nhận tiền cho sản phẩm này. KHÔNG viết code xử lý thẻ và không yêu cầu bất kỳ khóa thanh toán nào. Chỉ giúp tôi: thêm một nút "Thanh toán" dẫn tới link thanh toán có sẵn mà tôi sẽ tự tạo ở nhà cung cấp, và viết trang cảm ơn. Liệt kê những việc tôi phải tự làm ở dashboard của nhà cung cấp.
```

**Prompt C: backup.**

```text
Hãy viết file BACKUP.md hướng dẫn tôi sao lưu dữ liệu dự án này: xuất CSV ở Table Editor và lệnh supabase db dump --linked (kèm --data-only). Thêm backup-*.sql và thư mục backups/ vào .gitignore. Soạn danh sách tên bảng cần sao lưu từ code. KHÔNG tự chạy lệnh dump và không yêu cầu chuỗi kết nối cơ sở dữ liệu của tôi.
```

**Prompt D: Lighthouse.**

```text
Đây là danh sách cảnh báo Lighthouse của web tôi (dán phần chữ của báo cáo, KHÔNG dán đường link có token). Hãy sắp xếp theo mức tác động, rồi sửa các lỗi dễ và an toàn: thêm alt cho ảnh, aria-label cho nút biểu tượng, thêm kích thước width và height cho ảnh, nén hoặc đổi định dạng ảnh nếu có công cụ phù hợp, thêm thẻ meta thiếu. Với mỗi thay đổi, nêu lý do. Không xóa tính năng để tăng điểm.
```

## Nếu bị lỗi

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Số liệu analytics luôn bằng 0 | Chưa deploy lại sau khi thêm mã, bị trình chặn quảng cáo, hoặc đã hết hạn mức gói | Deploy lại, thử cửa sổ ẩn danh không có tiện ích, xem trang Usage |
| `supabase db dump` báo lỗi kết nối hoặc cần Docker | Chưa `supabase link`, mật khẩu database sai, hoặc phiên bản CLI cũ | Chạy `supabase link`, cập nhật CLI, đọc thông báo lỗi và [tài liệu lệnh](https://supabase.com/docs/reference/cli/supabase-db-dump) |
| Điểm Lighthouse mỗi lần đo một khác | Máy bận, mạng dao động, tiện ích mở rộng | Đo 3 lần ở cửa sổ ẩn danh, lấy giá trị giữa |
| Sau khi sửa SEO, Google chưa cập nhật | Công cụ tìm kiếm cần thời gian thu thập lại | Chờ vài ngày đến vài tuần; không cần làm gì thêm cho web nhỏ |

## Tiếp theo

Quay lại [Hoàn thiện và ra mắt](11-launch-polish.md) để tick checklist go-live 20 mục.
