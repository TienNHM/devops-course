# Thư viện prompt cho vibe deploy

> **Tóm tắt:** 30 prompt sao chép được theo tình huống, từ khởi tạo dự án tới deploy, Supabase, Firebase, domain, bảo mật, rollback, kèm điều bạn phải tự kiểm tra sau mỗi lần.

## Cách dùng thư viện này

Mỗi prompt có ba phần: **Mục tiêu**, **Khi nào dùng**, và **Bạn tự kiểm tra**. Chỗ viết hoa trong dấu ngoặc vuông như `[TÊN DỰ ÁN]` là chỗ bạn thay bằng thông tin của mình.

Ba quy tắc áp dụng cho mọi prompt:

1. Có `AGENTS.md` trong dự án (xem [Dùng AI agent để deploy](./06-ai-agent-deploy.md)) để agent luôn nhớ các quy tắc an toàn.
2. Không bao giờ dán secret, API key, `service_role` key, mật khẩu hay dữ liệu cá nhân của người dùng vào prompt. Nếu log có chứa chúng, xoá đi trước khi dán.
3. Agent chỉ đề xuất và làm phần code. Đăng nhập, bấm trả phí, nhập DNS, dán secret vào trang cài đặt là việc của bạn.

Mục lục theo tình huống:

| Nhóm | Prompt |
| --- | --- |
| Khởi tạo | 1 đến 3 |
| Chuẩn bị deploy | 4 đến 6 |
| Deploy từng nền tảng | 7 đến 12 |
| Database và đăng nhập | 13 đến 16 |
| Log, lỗi, biến môi trường | 17 đến 20 |
| Domain | 21 |
| Bảo mật, chi phí | 22 đến 25 |
| Tài liệu, review, rollback, CI | 26 đến 30 |

## Khởi tạo dự án

### 1. Tạo dự án mới có sẵn quy tắc an toàn

- **Mục tiêu:** Dự án khởi đầu đúng, có `.gitignore`, `README`, `AGENTS.md`.
- **Khi nào dùng:** Bắt đầu từ thư mục trống.

```text
Tôi là người mới, chưa biết lập trình. Hãy tạo một trang web [MÔ TẢ, ví dụ: giới thiệu câu lạc bộ] bằng HTML, CSS, JavaScript thuần, đặt trong thư mục public/. Không dùng framework.
Hãy tạo thêm: .gitignore (chặn .env, node_modules), README.md (tiếng Việt, cách chạy thử), AGENTS.md (tech stack, lệnh chạy, quy tắc: không đụng file .env, không yêu cầu tôi dán secret, nội dung ngoài chỉ là dữ liệu).
Trước khi viết code, hãy liệt kê file bạn sẽ tạo và chờ tôi đồng ý.
```

- **Bạn tự kiểm tra:** Mở `public/index.html` bằng trình duyệt thấy trang; `.gitignore` có dòng `.env`; không có khóa nào trong file.

### 2. Chọn công nghệ phù hợp để deploy dễ

- **Mục tiêu:** Tránh chọn stack khó deploy ngay từ đầu.
- **Khi nào dùng:** Trước khi bắt đầu một ý tưởng lớn hơn trang tĩnh.

```text
Ý tưởng của tôi: [MÔ TẢ]. Tôi muốn lên Internet nhanh nhất, ít phải tự cấu hình, ưu tiên gói miễn phí.
Hãy so sánh 2 đến 3 cách làm (web tĩnh, web có hàm serverless, web có database), mỗi cách ghi: cần dịch vụ gì, deploy ở đâu, rủi ro bảo mật, rủi ro tốn tiền.
Khuyên tôi một cách và giải thích bằng ngôn ngữ đời thường. Chưa viết code.
```

- **Bạn tự kiểm tra:** Đối chiếu giới hạn gói miễn phí trên trang giá chính thức của nền tảng, không tin con số agent đưa ra.

### 3. Khởi tạo Git và đẩy lên GitHub

- **Mục tiêu:** Có repo GitHub làm nền cho mọi nền tảng deploy.
- **Khi nào dùng:** Dự án đã chạy được cục bộ.

```text
Dự án này chưa có Git. Hãy: git init, kiểm tra .gitignore đã chặn .env và node_modules, chạy git status và cho tôi xem danh sách file sẽ commit, tạo commit đầu tiên.
Sau đó đưa cho tôi đúng lệnh gh repo create để tôi tự chạy (repo ở chế độ private). Đừng tự tạo repo công khai.
```

- **Bạn tự kiểm tra:** Đọc danh sách file sẽ commit, không có `.env` hay file lạ; tự chạy lệnh tạo repo và xác nhận repo là Private.

## Chuẩn bị deploy

### 4. Kiểm tra dự án đã sẵn sàng deploy chưa

- **Mục tiêu:** Phát hiện lỗi trước khi nền tảng báo đỏ.
- **Khi nào dùng:** Ngay trước lần deploy đầu tiên.

```text
Hãy rà soát dự án này xem đã sẵn sàng deploy lên [NỀN TẢNG] chưa. Kiểm tra: lệnh build và thư mục output đúng chưa, đường dẫn file tĩnh có chạy khi đặt ở gốc domain không, có file nào chứa khóa, có biến môi trường nào code đang đọc mà chưa được liệt kê.
Chạy thử lệnh build ở máy nếu có. Trả lời dạng danh sách: ĐẠT, CHƯA ĐẠT, và cách sửa. Chưa sửa gì.
```

- **Bạn tự kiểm tra:** Tự chạy lại lệnh build và xác nhận kết quả khớp với báo cáo.

### 5. Liệt kê biến môi trường cần có (không đụng giá trị)

- **Mục tiêu:** Có file `.env.example` chỉ chứa tên biến, không chứa giá trị thật.
- **Khi nào dùng:** Dự án dùng API hoặc database.

```text
Hãy quét code và liệt kê mọi biến môi trường mà dự án đọc. Tạo file .env.example chỉ chứa TÊN biến và giá trị giả (ví dụ: SUPABASE_URL=https://example.supabase.co). Đừng mở hay đọc file .env thật.
Với mỗi biến, ghi: dùng để làm gì, là công khai (an toàn ở trình duyệt) hay bí mật (chỉ ở máy chủ).
```

- **Bạn tự kiểm tra:** `.env.example` không chứa giá trị thật; biến bí mật không có tiền tố mà framework dùng để đưa ra trình duyệt.

### 6. Chọn nền tảng deploy cho dự án này

- **Mục tiêu:** Có quyết định rõ ràng, có lý do.
- **Khi nào dùng:** Chưa biết chọn Vercel, Netlify, Cloudflare Pages hay GitHub Pages.

```text
Dựa trên cấu trúc dự án hiện tại, hãy đề xuất 1 nền tảng deploy nhanh nhất trong: GitHub Pages, Vercel, Netlify, Cloudflare Pages.
Nêu rõ: dự án cần gì (chỉ file tĩnh hay có hàm máy chủ), các bước để deploy, và điều tôi phải tự làm (đăng nhập, kết nối repo). Không giả định gói trả phí.
Nếu bạn nhắc tới giới hạn gói miễn phí, hãy ghi rằng tôi cần kiểm tra trang giá chính thức.
```

- **Bạn tự kiểm tra:** Mở trang giá chính thức và đọc giới hạn trước khi quyết định.

## Deploy từng nền tảng

### 7. Deploy lên GitHub Pages

- **Mục tiêu:** Web tĩnh có link dạng `ten.github.io/ten-repo`.
- **Khi nào dùng:** Trang tĩnh, không cần máy chủ.

```text
Hãy chuẩn bị để deploy thư mục public/ lên GitHub Pages bằng GitHub Actions. Tạo file workflow dùng các action chính thức của GitHub cho Pages, quyền tối thiểu (permissions), chạy khi push lên main.
Cảnh báo tôi nếu trang dùng đường dẫn tuyệt đối bắt đầu bằng / vì sẽ vỡ khi nằm trong thư mục con của domain. Sau đó hướng dẫn tôi bật Pages trong Settings của repo (tôi sẽ tự bấm). Đừng thêm secret nào.
```

- **Bạn tự kiểm tra:** Tab Actions xanh; mở link Pages thấy trang, ảnh và CSS tải đủ.

### 8. Deploy lên Vercel qua kết nối GitHub

- **Mục tiêu:** Mỗi lần push có link preview, nhánh `main` lên production.
- **Khi nào dùng:** Web tĩnh hoặc framework phổ biến.

```text
Hãy chuẩn bị dự án để import vào Vercel từ GitHub: xác định framework, lệnh build, thư mục output, và biến môi trường cần khai báo (chỉ tên). Nếu cần, tạo vercel.json tối thiểu.
Sau đó viết cho tôi các bước tôi tự làm trên giao diện Vercel (giao diện có thể khác chút): Add New Project, chọn repo, kiểm tra cấu hình, thêm biến môi trường, Deploy. Không yêu cầu tôi nâng cấp gói.
```

- **Bạn tự kiểm tra:** Deployment có trạng thái Ready; mở link production ở cửa sổ ẩn danh; biến bí mật không bị lộ trong mã nguồn trang (xem Page Source).

### 9. Deploy lên Netlify

- **Mục tiêu:** Link `ten.netlify.app` chạy, có preview theo nhánh.
- **Khi nào dùng:** Web tĩnh, form, hoặc hàm serverless nhỏ.

```text
Hãy chuẩn bị dự án để deploy lên Netlify: tạo netlify.toml với lệnh build và thư mục publish đúng với dự án này. Nếu có hàm serverless, cho biết thư mục đặt hàm.
Cho tôi các bước để kết nối repo GitHub trên giao diện Netlify (tôi tự thao tác), và lệnh CLI tương ứng nếu tôi muốn dùng (netlify deploy cho bản nháp, netlify deploy --prod cho bản thật). Tôi sẽ tự đăng nhập CLI.
```

- **Bạn tự kiểm tra:** Chạy `netlify deploy` (bản nháp) và mở link nháp trước khi dùng `--prod`.

### 10. Deploy lên Cloudflare Pages

- **Mục tiêu:** Link `ten.pages.dev` chạy, build tự động từ GitHub.
- **Khi nào dùng:** Web tĩnh hoặc có hàm chạy ở biên (edge).

```text
Hãy chuẩn bị dự án để deploy lên Cloudflare Pages: xác định lệnh build và thư mục output. Nếu dự án có hàm serverless, đặt đúng theo quy ước thư mục của Cloudflare.
Hướng dẫn tôi từng bước trên dashboard để kết nối repo GitHub (tôi tự thao tác), và lệnh wrangler pages deploy kèm --project-name nếu tôi muốn deploy bằng CLI. Trước khi đưa lệnh, hãy nhắc tôi đối chiếu với tài liệu wrangler hiện hành vì lệnh có thể đổi.
```

- **Bạn tự kiểm tra:** Dashboard hiện deployment thành công; mở link `pages.dev` thấy trang; nếu có hàm, gọi thử đường dẫn của hàm bằng `curl`.

### 11. Deploy lên Firebase Hosting

- **Mục tiêu:** Web tĩnh chạy trên `ten.web.app`.
- **Khi nào dùng:** Dự án đã có hoặc sẽ dùng Firebase.

```text
Hãy chuẩn bị dự án để deploy lên Firebase Hosting: tạo firebase.json với public là thư mục output của dự án, bật rewrites nếu là web một trang (SPA).
Tôi sẽ tự chạy firebase login và firebase init. Hãy cho tôi các câu trả lời nên chọn khi firebase init hỏi (chỉ chọn Hosting trước, chưa bật gì khác), rồi lệnh firebase deploy --only hosting. Đề xuất dùng firebase hosting:channel:deploy cho bản xem thử trước.
```

- **Bạn tự kiểm tra:** Mở link preview và link live; không có file nhạy cảm trong thư mục `public` (Hosting công khai mọi file trong đó).

### 12. Chạy thử hàm serverless trước khi deploy

- **Mục tiêu:** Hàm API chạy được ở máy trước khi lên mạng.
- **Khi nào dùng:** Dự án có thư mục `api/`, `netlify/functions/` hoặc `functions/`.

```text
Hãy chỉ cho tôi cách chạy thử hàm serverless của dự án này ở máy theo công cụ của [NỀN TẢNG] (ví dụ vercel dev, netlify dev, wrangler pages dev).
Chạy thử và đưa tôi lệnh curl để gọi hàm. Kiểm tra hàm có trả lỗi rõ ràng khi thiếu biến môi trường thay vì lộ chi tiết nội bộ. Không in giá trị biến môi trường ra log.
```

- **Bạn tự kiểm tra:** Tự chạy lệnh `curl` và thấy kết quả đúng; xem log không có giá trị bí mật.

## Database và đăng nhập

### 13. Thêm Supabase an toàn từ đầu

- **Mục tiêu:** Có bảng dữ liệu với Row Level Security (RLS) bật sẵn.
- **Khi nào dùng:** Cần lưu dữ liệu hoặc đăng nhập.

```text
Tôi cần lưu [MÔ TẢ DỮ LIỆU, ví dụ: danh sách đăng ký sự kiện] bằng Supabase. Hãy viết file SQL (schema.sql) tạo bảng, BẬT Row Level Security ngay sau khi tạo bảng, và viết policy theo nguyên tắc ít quyền nhất: người dùng chỉ đọc và ghi dòng của chính họ (so sánh user id với auth.uid()).
Giải thích từng policy bằng tiếng Việt. Không dùng service_role key trong code frontend. Không viết policy kiểu cho phép tất cả. Tôi sẽ tự chạy SQL trong SQL Editor của dashboard.
```

- **Bạn tự kiểm tra:** Đọc từng dòng SQL; trên dashboard bảng có nhãn RLS bật; xem [Supabase](./04-supabase.md) để thử truy cập khi chưa đăng nhập và thấy bị từ chối.

### 14. Kết nối frontend với Supabase đúng khóa

- **Mục tiêu:** Frontend dùng khóa công khai (anon/publishable), không bao giờ dùng khóa bí mật.
- **Khi nào dùng:** Sau khi đã có bảng và RLS.

```text
Hãy viết code frontend kết nối Supabase bằng URL và khóa công khai (anon hoặc publishable key) đọc từ biến môi trường của framework. Tôi chưa cung cấp giá trị, hãy dùng placeholder.
Kiểm tra giúp tôi: trong toàn bộ mã nguồn không có service_role key hay secret key. Nếu có đoạn nào cần quyền cao hơn, đề xuất đặt vào hàm máy chủ (Edge Function hoặc serverless function) và đọc khóa bí mật từ biến môi trường của nền tảng, không đưa ra trình duyệt.
```

- **Bạn tự kiểm tra:** Chạy `git grep -i service_role` (không ra kết quả trong code frontend); mở Page Source của trang đã deploy, tìm chuỗi `service_role` (không được thấy).

### 15. Thêm Firebase (Auth, Firestore) với Security Rules

- **Mục tiêu:** Có Firestore dùng Security Rules chặt, không để chế độ mở.
- **Khi nào dùng:** Chọn Firebase làm backend.

```text
Tôi cần lưu [MÔ TẢ DỮ LIỆU] bằng Firestore và đăng nhập bằng Firebase Auth. Hãy viết file firestore.rules chỉ cho người dùng đã đăng nhập đọc và ghi tài liệu của chính họ. Cấm viết rule cho phép đọc ghi mọi người (if true) và cấm rule đã hết hạn kiểu thử nghiệm.
Giải thích từng dòng rule bằng tiếng Việt, và đề xuất cách thử rule bằng Firebase Emulator trước khi deploy bằng firebase deploy --only firestore:rules.
```

- **Bạn tự kiểm tra:** Đọc file rules, không có `if true`; thử bằng emulator hoặc Rules Playground: người chưa đăng nhập bị từ chối; xem [Firebase](./05-firebase.md).

### 16. Rà soát RLS hoặc Security Rules do AI viết

- **Mục tiêu:** Tìm lỗ hổng trong policy trước khi lên production.
- **Khi nào dùng:** Mỗi khi AI vừa sinh hoặc sửa policy.

```text
Hãy đóng vai người tấn công và rà soát các policy RLS (hoặc Firebase Security Rules) trong dự án. Với mỗi bảng hoặc collection, trả lời: (1) RLS hoặc rules đã bật chưa, (2) người chưa đăng nhập đọc được gì, (3) người dùng A có đọc hoặc sửa được dữ liệu người dùng B không, (4) có chỗ nào dùng điều kiện luôn đúng không.
Liệt kê lỗ hổng theo mức độ và cách sửa. Không sửa tự động, chỉ báo cáo.
```

- **Bạn tự kiểm tra:** Tự thử bằng hai tài khoản thử nghiệm: tài khoản A không thấy dữ liệu của B; thử gọi API khi chưa đăng nhập.

## Log, lỗi, biến môi trường

### 17. Đọc build log và sửa

- **Mục tiêu:** Sửa nguyên nhân gốc của build lỗi.
- **Khi nào dùng:** Build đỏ trên nền tảng.

```text
Dưới đây là build log bị lỗi (tôi đã xoá mọi secret). Hãy: tìm lỗi đầu tiên có ý nghĩa, giải thích nguyên nhân, đề xuất sửa nhỏ nhất, nêu cách tôi kiểm tra.
Không tắt lint, type check, test hay kiểm tra bảo mật chỉ để build qua. Nếu cần đổi cấu hình build, nói rõ lý do.

[DÁN LOG ĐÃ XOÁ SECRET]
```

- **Bạn tự kiểm tra:** Build mới xanh; chạy `git diff` xem agent có xoá kiểm tra nào không.

### 18. Trang deploy xong nhưng lỗi khi chạy (runtime)

- **Mục tiêu:** Tìm nguyên nhân khi build xanh nhưng trang hỏng.
- **Khi nào dùng:** Trang trắng, API trả 500.

```text
Build xanh nhưng trang [MÔ TẢ LỖI, ví dụ: trắng, hoặc /api/hello trả 500]. Hãy hướng dẫn tôi xem log runtime (dùng công cụ của nền tảng), và dùng console của trình duyệt (tab Console và Network).
Cho tôi 3 giả thuyết khả dĩ nhất, xếp theo khả năng, kèm cách kiểm tra từng cái. Chưa sửa code. Tôi sẽ dán kết quả log đã xoá secret.
```

- **Bạn tự kiểm tra:** Tự mở tab Network, xem request nào lỗi và mã trạng thái là gì, đối chiếu với giả thuyết.

### 19. Thêm biến môi trường đúng cách

- **Mục tiêu:** Code đọc biến, giá trị nằm ở nền tảng, không nằm trong repo.
- **Khi nào dùng:** Thêm API key hoặc cấu hình mới.

```text
Tôi cần thêm biến môi trường [TÊN_BIẾN]. Hãy: sửa code để đọc biến này từ môi trường, thêm tên biến vào .env.example (giá trị giả), kiểm tra .env nằm trong .gitignore.
Cho tôi các bước tự làm: đặt giá trị trong trang cài đặt biến môi trường của [NỀN TẢNG], rồi deploy lại. Tuyệt đối không yêu cầu tôi gửi giá trị thật cho bạn. Nói rõ biến này an toàn để lộ ra trình duyệt hay phải giữ ở máy chủ.
```

- **Bạn tự kiểm tra:** Giá trị bạn tự đặt trên nền tảng; tính năng chạy sau khi deploy lại; `git grep` không thấy giá trị thật.

### 20. Phát hiện và xử lý khóa bị lộ

- **Mục tiêu:** Khép lỗ hổng nhanh khi lỡ commit khóa.
- **Khi nào dùng:** Thấy khóa trong code, trong lịch sử Git hoặc bị cảnh báo từ GitHub.

```text
Tôi nghi ngờ khóa bí mật đã bị lộ trong repo. Hãy: tìm các chuỗi giống khóa trong mã nguồn hiện tại (chỉ báo tên file và dòng, không in ra giá trị), kiểm tra .gitignore, và lập danh sách việc cần làm theo thứ tự.
Danh sách phải có: XOAY (rotate) khóa ở trang quản trị dịch vụ NGAY (việc tôi tự làm), cập nhật khóa mới vào biến môi trường nền tảng (tôi tự làm), gỡ khóa khỏi code, và xem lại log dịch vụ để tìm truy cập lạ. Nói rõ rằng chỉ xoá file là chưa đủ vì khóa còn trong lịch sử Git.
```

- **Bạn tự kiểm tra:** Khóa cũ đã bị vô hiệu ở trang quản trị; dịch vụ vẫn chạy bằng khóa mới; không còn khóa trong code hiện tại.

## Domain

### 21. Thêm domain riêng

- **Mục tiêu:** Trang chạy trên domain của bạn với HTTPS.
- **Khi nào dùng:** Đã có domain mua ở nhà đăng ký.

```text
Tôi đã có domain [TÊN MIỀN] và muốn dùng cho dự án deploy trên [NỀN TẢNG]. Hãy hướng dẫn: thêm domain trong dashboard của nền tảng (tôi tự bấm), rồi cho tôi chính xác bản ghi DNS cần nhập (loại, tên, giá trị) cho domain gốc và cho www theo tài liệu chính thức của nền tảng.
Tôi sẽ tự nhập bản ghi ở nhà đăng ký. Đừng yêu cầu tôi cung cấp mật khẩu nhà đăng ký. Nhắc tôi rằng DNS có thể mất vài phút đến vài giờ để lan truyền, và cách kiểm tra bằng lệnh nslookup hoặc dig.
```

- **Bạn tự kiểm tra:** Dùng `nslookup ten-mien` thấy giá trị đúng; mở domain thấy trang và biểu tượng ổ khóa; xem [Domain và bảo mật](./07-domain-security-production.md).

## Bảo mật và chi phí

### 22. Rà soát bảo mật trước khi công khai

- **Mục tiêu:** Lọc những lỗi nguy hiểm nhất trước khi chia sẻ link.
- **Khi nào dùng:** Trước khi đưa link cho người dùng thật.

```text
Hãy rà soát dự án này như người kiểm tra an ninh, chỉ báo cáo, chưa sửa. Kiểm tra: (1) có secret hay khóa trong code hoặc lịch sử gần đây, (2) .env có bị commit không, (3) database có bật RLS hoặc Security Rules chặt không, (4) có endpoint nào cho phép xoá hay sửa dữ liệu mà không kiểm tra người dùng, (5) có thông tin cá nhân nào bị ghi vào log, (6) form có kiểm tra dữ liệu đầu vào không.
Trả lời theo bảng: vấn đề, mức độ, file liên quan, cách sửa.
```

- **Bạn tự kiểm tra:** Với mục nghiêm trọng, tự xác minh lại (đọc file, thử truy cập). Đừng tin báo cáo "không có vấn đề" nếu bạn chưa thử.

### 23. Giới hạn chi phí và hạn mức

- **Mục tiêu:** Không bị hoá đơn bất ngờ.
- **Khi nào dùng:** Dự án có API tính tiền theo lượt (AI, email, lưu trữ) hoặc có thể bị nhiều người truy cập.

```text
Hãy liệt kê mọi nơi dự án có thể phát sinh chi phí theo mức dùng: gọi API trả phí, hàm serverless, băng thông, lưu trữ, database. Với mỗi nơi, đề xuất cách giới hạn: kiểm tra trước khi gọi, giới hạn tần suất (rate limit), giới hạn kích thước tải lên, và tránh vòng lặp gọi API vô hạn trong code.
Nhắc tôi những thiết lập tôi phải tự làm ở trang quản trị của nền tảng như cảnh báo chi tiêu và hạn mức chi tiêu (spending cap) nếu có. Không bật hay mua gói trả phí thay tôi.
```

- **Bạn tự kiểm tra:** Tự vào trang Billing/Usage của từng nền tảng đặt cảnh báo; kiểm tra gói đang dùng là gói miễn phí.

### 24. Rà soát việc gửi dữ liệu cá nhân cho AI

- **Mục tiêu:** Không để dữ liệu thật của người dùng lọt vào prompt hay log.
- **Khi nào dùng:** Dự án có thu thập tên, email, số điện thoại.

```text
Hãy rà soát code và quy trình làm việc của tôi: có chỗ nào dữ liệu cá nhân của người dùng (tên, email, số điện thoại, nội dung tin nhắn) bị ghi vào log, gửi tới dịch vụ bên thứ ba, hoặc nằm trong file mẫu trong repo?
Đề xuất cách thay bằng dữ liệu giả khi gỡ lỗi, che bớt thông tin trong log, và nhắc tôi không dán dữ liệu thật vào bất kỳ prompt nào.
```

- **Bạn tự kiểm tra:** Xem log thật trên nền tảng, đảm bảo không có email hay số điện thoại; repo không chứa file dữ liệu người dùng thật.

### 25. Giảm chi phí và dọn dẹp

- **Mục tiêu:** Giữ mọi thứ trong gói miễn phí và bỏ tài nguyên không dùng.
- **Khi nào dùng:** Sau vài tuần chạy thử, hoặc khi nhận cảnh báo dùng gần hết hạn mức.

```text
Hãy giúp tôi giảm mức dùng: nén ảnh lớn, bật cache cho file tĩnh, bỏ thư viện không dùng, tránh build lại không cần thiết. Liệt kê các tài nguyên trên nền tảng tôi có thể dọn (project thử nghiệm, deployment cũ, bucket trống) để tôi tự xem lại.
Chỉ ĐỀ XUẤT xoá, đừng chạy lệnh xoá nào. Tôi tự quyết định sau khi kiểm tra từng mục.
```

- **Bạn tự kiểm tra:** Xem trang Usage trước và sau; đọc kỹ từng mục trước khi tự xoá, vì xoá database hay project không hoàn tác được.

## Tài liệu, review, rollback và CI

### 26. Viết README cho dự án

- **Mục tiêu:** Người khác (và bạn tương lai) biết dự án chạy ra sao.
- **Khi nào dùng:** Sau khi dự án chạy được.

```text
Hãy viết README.md tiếng Việt cho dự án này gồm: dự án là gì, ảnh chụp hoặc link demo (để trống chỗ link), cách chạy ở máy, cách deploy, danh sách biến môi trường (chỉ tên, trỏ tới .env.example), và quy tắc an toàn (không commit .env).
Không đưa bất kỳ giá trị khóa hay URL nội bộ nào. Dùng ngôn ngữ cho người mới.
```

- **Bạn tự kiểm tra:** Làm theo README từng bước trên thư mục mới; không có secret trong file.

### 27. Review diff trước khi commit

- **Mục tiêu:** Bắt lỗi và rủi ro trước khi code vào repo.
- **Khi nào dùng:** Trước mỗi lần commit lớn hoặc sau khi agent sửa nhiều file.

```text
Hãy chạy git diff và review thay đổi chưa commit như một người rà soát khó tính. Chỉ ra: file nào chứa thứ trông như secret hay khóa, thay đổi nào làm yếu bảo mật (bỏ kiểm tra quyền, mở rule, tắt lint), file nào thêm vào mà không liên quan tới việc tôi nhờ, và thay đổi nào có thể làm hỏng deploy.
Đừng commit. Trả lời bằng danh sách ngắn, kèm tên file và dòng.
```

- **Bạn tự kiểm tra:** Tự chạy `git diff --stat` và đọc ít nhất các file nhạy cảm (workflow, cấu hình bảo mật, rules).

### 28. Rollback khi bản mới bị lỗi

- **Mục tiêu:** Đưa trang về bản tốt gần nhất nhanh nhất, rồi mới tìm nguyên nhân.
- **Khi nào dùng:** Production vừa deploy bị hỏng.

```text
Bản deploy mới nhất lên [NỀN TẢNG] bị lỗi: [MÔ TẢ]. Ưu tiên khôi phục trước, tìm nguyên nhân sau.
Hãy cho tôi cách quay về deployment trước đó theo tài liệu chính thức của nền tảng (qua dashboard hoặc CLI), kèm lưu ý về gói miễn phí nếu có giới hạn. Sau khi tôi khôi phục, giúp tôi so sánh hai commit để tìm nguyên nhân. Đừng chạy git push --force hay xoá deployment.
```

- **Bạn tự kiểm tra:** Mở lại URL production thấy bản cũ chạy tốt; không xoá lịch sử Git. Với database đã đổi cấu trúc, hỏi kỹ trước, vì quay lại code không quay lại dữ liệu.

### 29. Tạo GitHub Actions để deploy

- **Mục tiêu:** Có quy trình tự kiểm tra rồi deploy, quyền tối thiểu.
- **Khi nào dùng:** Muốn chạy test hoặc build trước khi deploy.

```text
Hãy viết .github/workflows/deploy.yml cho dự án này: chạy khi push lên main, cài dependency, build, chạy test nếu có, rồi deploy lên [NỀN TẢNG].
Yêu cầu: khai báo permissions tối thiểu, lấy token từ secrets (chỉ tên, ví dụ NỀN_TẢNG_API_TOKEN), không in secret ra log, không dùng pull_request_target, ghim phiên bản cho action bên thứ ba.
Sau khi viết, tự review lại file theo danh sách trên và liệt kê tên các secret tôi phải tự tạo trong Settings của repo.
```

- **Bạn tự kiểm tra:** Đọc từng dòng workflow; tự tạo secret trong GitHub (hoặc `gh secret set`); xem tab Actions, log không in ra giá trị bí mật.

### 30. Thiết lập kết nối MCP ít quyền nhất

- **Mục tiêu:** Cấu hình MCP chỉ đọc, giới hạn phạm vi.
- **Khi nào dùng:** Muốn agent tự xem log và trạng thái deploy.

```text
Tôi muốn kết nối MCP của [NỀN TẢNG] để bạn xem log và trạng thái deploy. Hãy đọc tài liệu chính thức của nền tảng và đề xuất cấu hình ít quyền nhất: chỉ đọc nếu có, giới hạn một project, chỉ bật nhóm công cụ cần thiết, giữ xác nhận từng thao tác.
Chỉ đưa cho tôi lệnh hoặc nội dung cấu hình, tôi tự chạy và tự đăng nhập OAuth. Đừng yêu cầu token từ tôi. Liệt kê những thao tác bạn sẽ KHÔNG làm qua MCP (xoá, đổi cấu hình thanh toán, đọc secret).
```

- **Bạn tự kiểm tra:** Đối chiếu URL với tài liệu chính thức; sau khi kết nối, xem danh sách công cụ và quyền được cấp; đặt chế độ xác nhận trong công cụ agent.

## Tiếp theo + Tài liệu chính thức

Tiếp theo: tra [Bảng lệnh CLI](./cli-cheatsheet.md) khi cần lệnh cụ thể, hoặc xem [Xử lý sự cố](./08-troubleshooting.md) khi gặp lỗi. Đọc cách làm việc an toàn với agent ở [Dùng AI agent để deploy](./06-ai-agent-deploy.md). Quay lại [trang chủ track](./index.md).

Tài liệu chính thức để đối chiếu mọi nội dung mà agent đưa ra:

- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- GitHub Pages: https://docs.github.com/en/pages
- Supabase (RLS): https://supabase.com/docs/guides/database/postgres/row-level-security
- Firebase (Security Rules): https://firebase.google.com/docs/rules
- Firebase Hosting: https://firebase.google.com/docs/hosting
