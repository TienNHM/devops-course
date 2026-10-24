# Deploy web tĩnh: các nền tảng khác (nâng cao)

> **Tóm tắt:** Trang bổ sung của [bài 02 Hosting tĩnh](02-static-hosting.md): Cloudflare (Workers và Pages), Netlify, Vercel, bảng so sánh. Không bắt buộc; chỉ đọc khi đã có link GitHub Pages.

Chỉ mở trang này khi bạn đã có link GitHub Pages và muốn so sánh, cần preview theo Pull Request, hoặc cần backend nhỏ. Cả ba nơi đều miễn phí cho web tĩnh. Các lệnh `npx`, `npm` dưới đây cần cài Node.js; người chưa biết code có thể nhờ AI agent làm từng bước.

## Phần B. Cloudflare (Workers với static assets, và Pages)

URL mặc định: `TEN-DU-AN.TEN-TAI-KHOAN.workers.dev` cho Workers, `TEN-DU-AN.pages.dev` cho Pages.

Cloudflare có hai sản phẩm host web tĩnh. Kiểm tra 10/2026: trang tài liệu Cloudflare Pages ghi Workers là nền tảng ứng dụng chính và khuyên **bắt đầu dự án mới bằng Workers** (kèm static assets), có hướng dẫn chuyển dự án Pages sang Workers; tài liệu không nói Pages bị ngừng. Vì vậy bài này dạy **Workers static assets làm đường chính**, còn Pages ở mục B2 là đường cũ vẫn dùng được (dự án Pages có sẵn, hoặc khi bạn đang theo một hướng dẫn cũ). Tài liệu Cloudflare thay đổi thường xuyên, hãy xem lại các link cuối bài.

### B1. Workers static assets (đường chính cho dự án mới)

Ý tưởng: bạn có một Worker (chương trình nhỏ chạy trên mạng lưới Cloudflare) và khai báo "thư mục này là file tĩnh". Khi deploy, Cloudflare tải file tĩnh lên và phục vụ chúng cùng Worker. Web thuần HTML không cần viết code Worker.

Bước 1. Đặt web trong thư mục `public` ở gốc repo (có `public/index.html`). Tạo file `wrangler.jsonc` ở gốc repo:

```jsonc
{
  "name": "ten-du-an",
  "compatibility_date": "2026-10-21",
  "assets": {
    "directory": "./public"
  }
}
```

`name` là tên Worker (viết thường, không dấu, dùng gạch ngang), cũng thành một phần của URL. `compatibility_date` là ngày "chốt phiên bản hành vi" của môi trường chạy; dùng ngày bạn tạo dự án. Không có dòng `main` nghĩa là chỉ phục vụ file tĩnh. Nếu bạn thích file TOML thì dùng `wrangler.toml` với `name`, `compatibility_date` và mục `[assets]` có `directory = "./public"`; hai kiểu tương đương. Ví dụ đầy đủ (có thêm Worker nhỏ trả JSON) nằm ở [cloudflare-workers-static](../examples/vibe/cloudflare-workers-static/README.md).

Bước 2. Chạy thử trên máy:

```bash
npx wrangler dev
```

Bạn sẽ thấy một địa chỉ `http://localhost:8787` (cổng có thể khác); mở lên thấy trang của bạn.

Bước 3a (nên dùng, tự deploy mỗi lần push): đưa repo lên GitHub, vào dashboard Cloudflare, **Workers & Pages**, **Create application**, chọn **GitHub** (tính năng này tên là Workers Builds), chọn repo, kiểm tra cấu hình rồi bấm **Save and Deploy**. Điều kiện quan trọng: tên Worker trong dashboard phải trùng `name` trong `wrangler.jsonc`, nếu không build sẽ lỗi. Bạn sẽ thấy: build chạy, rồi có link `workers.dev` để mở. Nhánh chính tạo bản production; nhánh khác tạo bản **Preview** (xem trong mục Previews của Worker). Nếu repo chưa có file cấu hình, Cloudflare có thể tự đề xuất một Pull Request thêm cấu hình, bạn đọc kỹ rồi mới merge.

Bước 3b (CLI, deploy thủ công):

```bash
npx wrangler login
npx wrangler deploy
```

Lệnh đầu mở trình duyệt để bạn tự đăng nhập. Lệnh thứ hai tải file trong `public` lên và in ra link `workers.dev`. Đây là deploy lên production, hãy thử bằng `npx wrangler dev` trước.

**SPA (React, Vue, Vite...):** thêm `not_found_handling` vào mục `assets` để đường dẫn không khớp file nào trả `index.html` với status 200, nhờ đó refresh `/about` không bị 404. Với Vite, `directory` thường là `./dist`:

```jsonc
{
  "name": "ten-du-an",
  "compatibility_date": "2026-10-21",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

Nếu web nhiều trang và bạn muốn trang 404 riêng, đặt giá trị `"404-page"` và có file `404.html`. Không khai báo thì đường dẫn không khớp trả 404. Với Vite, đặt build command là `npm run build` trong cài đặt Builds để thư mục `dist` được tạo trước khi deploy.

**Preview:** mỗi nhánh không phải production có một URL Preview riêng khi bật Workers Builds.

**Rollback:** trong trang của Worker, mở tab **Deployments** và chọn phiên bản cũ chạy tốt; hoặc dùng `npx wrangler rollback` (xem [Bảng lệnh CLI](cli-cheatsheet.md)). Giao diện hay đổi, nếu không thấy nút thì đối chiếu tài liệu Workers.

**Domain riêng:** vào Worker, **Settings**, **Domains & Routes**, **Add**, **Custom Domain**, nhập tên miền hoặc subdomain. Điều kiện: domain đã nằm trong tài khoản Cloudflare (zone đang hoạt động) và hostname chưa có bản ghi CNAME. Cloudflare tự tạo bản ghi DNS và cấp chứng chỉ HTTPS. Có thể khai báo trong file cấu hình bằng mục `routes` có `pattern` và `custom_domain` đặt `true`, rồi chạy `npx wrangler deploy`.

**Giới hạn đáng biết:** request tới file tĩnh không tính vào hạn mức request của Worker (theo tài liệu Cloudflare); request chạy code Worker mới tính, gói Free khoảng 100.000 request mỗi ngày (kiểm tra 10/2026). Giới hạn số file, kích thước file và số lần build của gói Free thay đổi theo thời gian, hãy xem trang giá và giới hạn Workers. Backend nhỏ chạy trên cùng Worker sẽ gặp ở [bài 03 Fullstack serverless](03-fullstack-serverless.md).

### B2. Cloudflare Pages (đường cũ, vẫn dùng được)

Pages hợp nếu bạn đã có dự án Pages hoặc theo hướng dẫn cũ; dự án mới nên dùng B1. Giao diện tạo dự án có thể đã đổi: nếu không thấy lựa chọn Pages trong **Create application**, hãy đọc trang Pages và hướng dẫn chuyển sang Workers (link cuối bài).

**Đường giao diện (kết nối Git):**

1. Vào dashboard Cloudflare, mục **Workers & Pages**, bấm **Create application**, chọn **Pages**, rồi **Connect to Git**.
2. Chọn GitHub, cho phép truy cập repo (**Install & Authorize**), chọn repo, bấm **Begin setup**.
3. Đặt tên dự án (tên này thành `TEN-DU-AN.pages.dev`) và production branch là `main`.
4. Cấu hình build. Với web HTML thuần không dùng framework preset: tài liệu Cloudflare hướng dẫn nhập `exit 0` vào **Build command** (nghĩa là "không làm gì"), và **Build output directory** là thư mục chứa `index.html` (cách ít rắc rối nhất là để web trong một thư mục con như `public` rồi nhập đúng tên thư mục đó; nếu `index.html` nằm ở thư mục gốc repo, hãy thử `/` và đối chiếu tài liệu nếu form báo lỗi). Với Vite: build command `npm run build`, output `dist`.
5. Bấm **Save and Deploy**.

Bạn sẽ thấy: log build chạy vài chục giây, sau đó có link `.pages.dev` bấm vào xem được.

**Đường CLI (Direct Upload, không cần Git):**

```bash
npx wrangler login
npx wrangler pages project create ten-du-an --production-branch=main
npx wrangler pages deploy . --project-name=ten-du-an
```

Lệnh đầu mở trình duyệt để bạn tự đăng nhập; lệnh thứ hai tạo dự án (thay `ten-du-an` bằng tên của bạn, viết thường, không dấu); lệnh thứ ba tải thư mục hiện tại lên. Để tạo bản preview theo nhánh: `npx wrangler pages deploy . --project-name=ten-du-an --branch=ten-nhanh`. Lưu ý: tài liệu Cloudflare ghi rõ dự án đã kết nối Git thì không đổi sang Direct Upload được về sau. Direct Upload từ giao diện web cũng không hỗ trợ Functions: muốn có Functions, dùng Git hoặc Wrangler (xem [bài 03 Fullstack serverless](03-fullstack-serverless.md)).

**Preview:** mỗi nhánh/Pull Request có một URL preview riêng, hiển thị trong danh sách **Deployments**.

**Rollback:** mở dự án, vào **Deployments**, ở bản deploy production cũ chạy tốt bấm menu ba chấm, chọn **Rollback to this deployment**. Chỉ quay về được bản production build thành công, không quay về bản preview.

**Domain riêng:** trong dự án, tab **Custom domains**, thêm domain và làm theo hướng dẫn DNS. Nếu domain đã quản lý ở Cloudflare thì gần như tự động. HTTPS tự cấp.

**SPA:** nếu dự án **không có** file `404.html` ở thư mục gốc, Pages coi đó là Single Page App và trả trang gốc cho mọi đường dẫn không khớp file nào.

**Giới hạn đáng biết** (gói Free theo tài liệu, kiểm tra 10/2026): 500 lần build mỗi tháng, mỗi lần build tối đa 20 phút, tối đa 20.000 file mỗi site, mỗi file tối đa 25 MiB, 100 domain riêng mỗi dự án. Request tới file tĩnh không giới hạn và không tính phí; chỉ request chạy Functions mới tính vào hạn mức hằng ngày. Pages Functions (backend nhỏ) sẽ gặp lại ở [bài 03 Fullstack serverless](03-fullstack-serverless.md).

## Phần C. Netlify

URL mặc định: `TEN-SITE.netlify.app`.

**Cách nhanh nhất, không cần Git (kéo thả):**

1. Mở [app.netlify.com/drop](https://app.netlify.com/drop). Nên đăng nhập trước để dễ quản lý site.
2. Kéo **thư mục** (không phải file zip) chứa `index.html` vào khung Deploy.
3. Chờ vài giây.

Bạn sẽ thấy: một URL để xem site. Đây là cách ngon nhất khi cần "có link ngay" cho demo. Cập nhật bằng cách kéo thư mục mới vào mục **Deploys** của site.

**Kết nối Git (nên dùng cho dự án thật):**

1. Đăng nhập Netlify, mở [app.netlify.com/start](https://app.netlify.com/start) (hoặc nút thêm dự án mới trong trang **Projects**; tên nút có thể khác), chọn GitHub và repo.
2. Điền **Build command** (để trống nếu HTML thuần) và **Publish directory** (`.` hoặc `dist`).
3. Bấm **Deploy**.

Giao diện có thể khác chút, nên hãy ưu tiên cấu hình bằng file `netlify.toml` đặt ở thư mục gốc repo, để nền tảng đọc luôn và AI agent cũng sửa được:

```toml
[build]
  command = ""
  publish = "."

# Chỉ dùng khi là Single Page App: mọi đường dẫn trả về index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Cấu hình trong `netlify.toml` được ưu tiên hơn cấu hình trên giao diện. File thật có sẵn vẫn được phục vụ trước, nên `/assets/app.js` không bị redirect nuốt mất. Với Vite hoặc React, đổi thành `command = "npm run build"` và `publish = "dist"`.

**Đường CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=.
netlify deploy --dir=. --prod
```

`netlify login` mở trình duyệt để bạn tự cấp quyền. `netlify deploy` (không có `--prod`) tạo **bản nháp** với URL riêng để xem thử; thêm `--prod` mới đưa lên địa chỉ chính. Lần đầu CLI sẽ hỏi chọn hoặc tạo site. Cần Node.js 18.14 trở lên.

**Preview:** Deploy Preview cho mỗi Pull Request, và Branch deploy cho nhánh phụ nếu bạn bật.

**Rollback:** vào tab **Deploys** của site, chọn một bản deploy cũ tốt và bấm nút publish bản đó (tên nút có thể khác chút; xem mục "Manage deploys" trong tài liệu Netlify).

**Domain riêng:** mục **Domain management** của site, thêm domain; làm theo hướng dẫn DNS (hoặc dùng Netlify DNS). Chứng chỉ HTTPS tự cấp sau khi DNS đúng.

**Giới hạn đáng biết** (theo tài liệu Netlify, kiểm tra 10/2026): gói Free tính theo **credits**, có 300 credits mỗi tháng, đầu mỗi chu kỳ thanh toán được đặt lại và không cộng dồn. Gói Free là **hạn mức cứng**: hết credits thì mọi dự án bị tạm dừng và khách vào thấy trang "Site not available", và gói Free không mua thêm được credits. Mức tiêu hao tham khảo: mỗi lần deploy production thành công 15 credits (deploy lỗi, rollback, Deploy Preview và branch deploy là 0), băng thông 20 credits mỗi GB, chạy function 10 credits mỗi GB-giờ. Nghĩa là 300 credits chỉ đủ khoảng 20 lần deploy production, nên đừng bấm deploy production liên tục khi thử nghiệm; hãy dùng `netlify deploy` (bản nháp) hoặc nhánh phụ. Số liệu đổi theo thời gian, luôn đối chiếu trang giá.

## Phần D. Vercel

URL mặc định: `TEN-DU-AN.vercel.app`.

**Đường giao diện (kết nối Git):**

1. Đăng nhập Vercel bằng GitHub, bấm **Add New**, **Project**, và **Import** repo.
2. **Framework Preset:** Vercel tự nhận ra Vite, Next.js, v.v. Với HTML thuần, chọn **Other** và bỏ trống Build Command (bật Override rồi để trống nếu giao diện yêu cầu). Preset Other phục vụ thư mục `public` nếu có, nếu không thì phục vụ chính thư mục gốc. Nếu web nằm trong thư mục con, chỉnh **Root Directory** hoặc **Output Directory** cho đúng.
3. Bấm **Deploy**.

Bạn sẽ thấy: màn hình log build, rồi chúc mừng kèm ảnh chụp site và link `.vercel.app`.

**Đường CLI:**

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

`vercel login` để bạn tự đăng nhập qua trình duyệt. Lệnh `vercel` đầu tiên hỏi vài câu thiết lập (liên kết dự án) rồi tạo deploy; theo tài liệu, **lần deploy đầu của dự án mới luôn là production**, các lần sau `vercel` tạo preview và `vercel --prod` mới lên bản chính. Thêm `--logs` để in build log khi cần chẩn đoán. Với trang tĩnh nhỏ (chỉ HTML hoặc Markdown, tối đa 10 file, 5 MB), Vercel có thể bỏ qua bước build cho nhanh.

**Preview:** mỗi nhánh và mỗi Pull Request có URL preview riêng, bot Vercel thường bình luận link ngay trong Pull Request.

**Rollback:** vào dự án, ở khung Production Deployment bấm **Instant Rollback** rồi chọn bản cũ và **Confirm Rollback**; đổi domain trỏ lại gần như tức thì. Gói Hobby chỉ quay về được bản production liền trước. Sau rollback, Vercel tắt tự động gán production cho các lần push mới; muốn trở lại bình thường, bấm **Undo Rollback** hoặc chạy `vercel promote` cho một deploy.

**Domain riêng:** vào **Settings**, **Domains**, thêm domain và làm theo hướng dẫn DNS. HTTPS tự cấp.

**SPA:** nếu là Vite hoặc React dạng SPA, thêm `vercel.json` ở thư mục gốc để đường dẫn con không bị 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Giới hạn đáng biết:** gói Hobby chỉ dành cho **mục đích cá nhân, phi thương mại**. Site có bán hàng, quảng cáo, nhận tiền để làm site cho khách... đều thuộc dùng thương mại và cần gói trả phí (nhận quyên góp thì không tính là thương mại). Theo tài liệu fair use (kiểm tra 10/2026), mức tham khảo của Hobby gồm 100 GB Fast Data Transfer và 1.000.000 lần gọi function mỗi tháng. Tài liệu định nghĩa dùng thương mại là bất kỳ deployment nào phục vụ lợi ích tài chính của bất kỳ ai tham gia làm dự án, kể cả người được trả công viết code. Bạn tự quyết định có nâng cấp hay không; khóa này ưu tiên gói miễn phí.

## Bước cuối. So sánh sau khi thử cả 4

Điền bảng này theo trải nghiệm của chính bạn (bao nhiêu phút, gặp lỗi gì), rồi đối chiếu với bảng tham khảo:

| Tiêu chí | GitHub Pages | Cloudflare (Workers) | Netlify | Vercel |
| --- | --- | --- | --- | --- |
| URL mặc định | `USERNAME.github.io/REPO` | `TEN.TAI-KHOAN.workers.dev` | `TEN.netlify.app` | `TEN.vercel.app` |
| Cách nhanh nhất | Settings > Pages | Create application, GitHub hoặc `wrangler deploy` | Kéo thả | `vercel` |
| Preview theo Pull Request | Không có sẵn | Có | Có (Deploy Preview) | Có |
| Rollback | Revert commit hoặc chạy lại workflow cũ | Tab Deployments hoặc `wrangler rollback` | Publish bản deploy cũ | Instant Rollback (Hobby: bản liền trước) |
| SPA không 404 khi refresh | Cần mẹo `404.html` | `not_found_handling` đặt `single-page-application` | Redirect trong `netlify.toml` | `rewrites` trong `vercel.json` |
| Backend nhỏ | Không | Worker (cùng dự án) | Netlify Functions | Vercel Functions |
| Điểm cần lưu ý | Base path của project site; không dành cho dịch vụ thương mại | Tên Worker phải trùng `name` trong file cấu hình; Pages là đường cũ | Free là hạn mức cứng 300 credits mỗi tháng, hết thì site bị tạm dừng | Hobby chỉ phi thương mại |

Gợi ý chọn nhanh: demo tức thì thì Netlify Drop; sản phẩm tĩnh đơn giản, muốn ổn định lâu dài thì GitHub Pages hoặc Cloudflare (Workers static assets); dùng Next.js hoặc app có backend nhỏ thì Vercel. Chi tiết hơn ở [So sánh nền tảng](platforms.md).


## Quay lại bài chính

Về [bài 02 Hosting tĩnh](02-static-hosting.md) hoặc xem [So sánh nền tảng](platforms.md).
