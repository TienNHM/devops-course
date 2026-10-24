# Bảng lệnh CLI cho vibe deploy

> **Tóm tắt:** Bảng tra nhanh lệnh chính thức của gh, git, vercel, netlify, wrangler, supabase, firebase: đăng nhập, liên kết, deploy, xem trước, log, biến môi trường, quay lui.

::: tip Bạn làm gì
- **Kết quả:** tìm nhanh đúng lệnh cho gh, git, Vercel, Netlify, Cloudflare, Supabase, Firebase mà không phải đọc cả tài liệu.
- **Thời gian:** tra cứu 1 đến 2 phút mỗi lệnh.
- **Cần gì trước:** đã cài CLI của nền tảng bạn dùng (xem [Deploy cùng AI agent: nâng cao](06-ai-agent-deploy-advanced.md#cai-cac-cli-cua-nen-tang)) và đã tự đăng nhập.
- **Module trước:** đây là trang tra cứu, không nằm trong lộ trình tuyến tính.
:::

## Cách đọc bảng này

Các lệnh dưới đây đã được đối chiếu với tài liệu chính thức vào tháng 10/2026. CLI cập nhật thường xuyên, nên nếu lệnh báo lỗi hãy chạy `ten-cli --help` hoặc mở link tài liệu ở cuối trang. Chỗ viết hoa kiểu `TEN-DU-AN` là placeholder, bạn thay bằng giá trị của mình.

Ba lưu ý chung (cảnh báo lệnh xoá nằm ngay bên dưới):

- Mọi lệnh đăng nhập đều mở trình duyệt để bạn tự đăng nhập. Đừng nhờ agent đăng nhập hộ và đừng dán mật khẩu hay token vào chat.
- Khi tự động hoá trong CI, dùng token đặt trong biến môi trường hoặc secret của nền tảng, không viết vào lệnh hay file trong repo.

::: danger Lệnh xoá và lệnh tốn tiền
Lệnh có chữ `rm`, `delete`, `remove`, `--force`, `destroy`, `buy` là lệnh xoá hoặc tốn tiền, không hoàn tác được. Chỉ tự chạy sau khi đã đọc kỹ, thử trên project thử nghiệm, và không giao cho agent.
:::

Cài đặt các CLI (chỉ cài cái bạn dùng):

```bash
npm i -g vercel
npm install -g netlify-cli
npm i -g wrangler
npm install -g firebase-tools
npm install supabase --save-dev
```

CLI Supabase theo tài liệu hiện hành cài theo từng dự án (dùng `npx supabase ...`); trên macOS có thể dùng `brew install supabase/tap/supabase`, trên Windows dùng `scoop` theo trang hướng dẫn của Supabase. GitHub CLI (`gh`) cài theo hướng dẫn trên https://cli.github.com.

## Git cơ bản

| Việc | Lệnh |
| --- | --- |
| Tạo repo cục bộ | `git init` |
| Xem trạng thái | `git status` |
| Xem thay đổi chi tiết | `git diff` |
| Chuẩn bị commit | `git add .` (kiểm tra `git status` trước để chắc không có `.env`) |
| Commit | `git commit -m "mô tả ngắn"` |
| Tạo nhánh và chuyển sang | `git switch -c ten-nhanh` |
| Đẩy lên GitHub | `git push -u origin ten-nhanh` |
| Xem lịch sử ngắn | `git log --oneline -10` |
| Tìm chuỗi nghi là khóa | `git grep -i "secret"` |
| Hoàn tác file chưa commit | `git restore ten-file` |

## gh (GitHub CLI)

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `gh auth login` |
| Kiểm tra đăng nhập | `gh auth status` |
| Tạo repo private từ thư mục hiện tại và đẩy code | `gh repo create TEN-REPO --private --source=. --remote=origin --push` |
| Xem repo | `gh repo view` |
| Đặt secret cho Actions (CLI sẽ hỏi giá trị, bạn tự nhập) | `gh secret set TEN_SECRET` |
| Đặt biến thường (không bí mật) | `gh variable set TEN_BIEN` |
| Liệt kê các lần chạy Actions | `gh run list` |
| Xem log của lần chạy | `gh run view MA-RUN --log` |
| Chỉ xem log phần bị lỗi | `gh run view MA-RUN --log-failed` |
| Chạy workflow thủ công | `gh workflow run TEN-FILE.yml` |
| Tạo pull request | `gh pr create` |
| Liệt kê pull request | `gh pr list` |

Lưu ý: `gh repo create` khi chạy không tương tác cần một trong `--public`, `--private`, `--internal`. Hãy chọn `--private` nếu chưa chắc. Chi tiết cờ của `gh secret set`, `gh workflow run` và `gh pr create`: xem `gh TEN-LENH --help` hoặc trang https://cli.github.com/manual/.

## Vercel

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `vercel login` |
| Xem đang đăng nhập là ai | `vercel whoami` |
| Liên kết thư mục với project Vercel | `vercel link` |
| Deploy bản xem thử (preview) | `vercel` hoặc `vercel deploy` |
| Deploy lên production | `vercel deploy --prod` |
| Chạy thử cục bộ giống môi trường Vercel | `vercel dev` |
| Liệt kê biến môi trường | `vercel env ls` |
| Thêm biến môi trường (CLI hỏi giá trị) | `vercel env add TEN_BIEN production` |
| Sửa hoặc xoá biến | `vercel env update TEN_BIEN production`, `vercel env rm TEN_BIEN production` |
| Kéo biến về file cục bộ (file này không được commit) | `vercel env pull .env.local` |
| Kéo cấu hình project về máy | `vercel pull` |
| Liệt kê các deployment | `vercel list` |
| Xem thông tin một deployment | `vercel inspect URL-HOAC-ID` |
| Xem build log của deployment | `vercel inspect URL-HOAC-ID --logs` |
| Xem log runtime (30 phút gần nhất theo mặc định) | `vercel logs` |
| Lọc log lỗi production trong 1 giờ | `vercel logs runtime --environment production --query 'level:error' --since 1h` |
| Gọi thử URL deployment (tự vượt bảo vệ deployment) | `vercel curl /api/hello` |
| Thêm domain vào project | `vercel domains add TEN-MIEN TEN-PROJECT` |
| Quay lui production về bản trước | `vercel rollback` hoặc `vercel rollback URL-HOAC-ID` |
| Hoàn tác rollback hoặc đưa bản bất kỳ lên production | `vercel promote URL-HOAC-ID` |
| Thêm mục gợi ý deploy vào `AGENTS.md` (chạy từ Claude Code thì ghi vào `CLAUDE.md`; hỏi xác nhận trước khi ghi, không thay cả file) | `vercel agent init` |

Lưu ý:

- Gói Hobby (miễn phí) theo tài liệu chỉ cho quay lui về bản production liền trước. Quay lui xa hơn cần gói trả phí; hãy tự quyết định, đừng nâng cấp chỉ vì lệnh báo lỗi.
- `vercel logs --follow` đã bị đánh dấu ngừng dùng ở bản mới; lệnh trả kết quả truy vấn thay vì stream. Dùng `--since` để chọn khoảng thời gian.
- Có các lệnh liên quan mua hàng (`vercel buy ...`, `vercel domains buy`). Đừng nhờ agent chạy các lệnh này; nếu cần mua, bạn tự quyết định.
- Trong CI, đặt token ở biến môi trường `VERCEL_TOKEN`, không dùng `--token` ghi thẳng giá trị vào lệnh.

## Netlify

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `netlify login` |
| Tạo site và nối repo GitHub để deploy liên tục | `netlify init` |
| Liên kết thư mục với site đã có | `netlify link` |
| Chạy thử cục bộ | `netlify dev` |
| Build thử cục bộ | `netlify build` |
| Deploy bản nháp (link xem thử riêng) | `netlify deploy` |
| Deploy thư mục cụ thể | `netlify deploy --dir=public` |
| Deploy lên production | `netlify deploy --prod` |
| Liệt kê biến môi trường | `netlify env:list` |
| Đặt biến môi trường | `netlify env:set TEN_BIEN GIA_TRI --secret` |
| Xem một biến | `netlify env:get TEN_BIEN` |
| Nhập biến từ file `.env` cục bộ | `netlify env:import .env` |
| Xoá biến | `netlify env:unset TEN_BIEN` |
| Xem log hàm (function) | `netlify logs --source functions --since 1h` |
| Xem log deploy của một lần deploy | `netlify logs --source deploy --deploy-id MA-DEPLOY --since 7d` |
| Xem log theo thời gian thực | `netlify logs --follow --source functions` |

Lưu ý:

- Nếu đặt `GIA_TRI` trực tiếp trong lệnh, giá trị lọt vào lịch sử terminal. Với secret thật, ưu tiên nhập qua trang cài đặt của Netlify hoặc dùng `env:import` từ file `.env` không commit.
- Theo tài liệu, `netlify deploy --allow-anonymous` cho phép deploy không đăng nhập và tạo site cần nhận quyền sở hữu (claim) sau đó (thời hạn claim: xem tài liệu Netlify); chỉ dùng cho thử nghiệm, đừng đưa dữ liệu thật.
- Netlify CLI không có lệnh quay lui đã kiểm chứng trong tài liệu tôi đối chiếu: để quay lui, vào tab Deploys của site trên dashboard, mở một deploy cũ và dùng nút publish deploy đó (giao diện có thể khác chút). Xem tài liệu Netlify để xác nhận.

## Cloudflare (wrangler)

Cloudflare ([thuật ngữ](../resources/glossary.md)) có hai nhóm lệnh. Kiểm tra 10/2026: tài liệu Cloudflare khuyên dự án mới bắt đầu bằng Workers (kèm static assets), nên các lệnh `wrangler deploy`, `wrangler dev`, `wrangler tail`... là đường chính; nhóm `wrangler pages ...` dành cho dự án Pages có sẵn (đường cũ). Cấu hình nằm trong file `wrangler.jsonc` ở gốc repo, xem [bài 02](02-static-hosting.md).

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `npx wrangler login` |
| Xem đang đăng nhập là ai | `npx wrangler whoami` |
| Chạy thử Worker (và static assets) cục bộ | `npx wrangler dev` |
| Thử deploy mà không gửi lên | `npx wrangler deploy --dry-run` |
| Deploy Worker (production) | `npx wrangler deploy` |
| Xem log Worker thời gian thực | `npx wrangler tail TEN-WORKER` |
| Đặt secret cho Worker (CLI hỏi giá trị) | `npx wrangler secret put TEN_BIEN` |
| Liệt kê các phiên bản Worker | `npx wrangler versions list` |
| Quay lui Worker về phiên bản trước | `npx wrangler rollback` hoặc `npx wrangler rollback MA-PHIEN-BAN` |
| Tạo project Pages (đường cũ) | `npx wrangler pages project create TEN-DU-AN --production-branch=main` |
| Deploy thư mục lên Pages | `npx wrangler pages deploy public --project-name=TEN-DU-AN` |
| Deploy một nhánh Pages (preview) | `npx wrangler pages deploy public --project-name=TEN-DU-AN --branch=ten-nhanh` |
| Liệt kê deployment Pages | `npx wrangler pages deployment list --project-name=TEN-DU-AN` |
| Xem log thời gian thực của Pages | `npx wrangler pages deployment tail --project-name=TEN-DU-AN` |
| Đặt secret cho Pages (CLI hỏi giá trị) | `npx wrangler pages secret put TEN_BIEN --project-name=TEN-DU-AN` |
| Liệt kê secret Pages (chỉ tên) | `npx wrangler pages secret list --project-name=TEN-DU-AN` |
| Chạy thử Pages cục bộ | `npx wrangler pages dev public` |

Lưu ý:

- `wrangler secret put` nhận giá trị bằng nhắc nhập hoặc từ stdin; mỗi lần đặt secret cho Worker sẽ tạo phiên bản mới và deploy ngay, theo tài liệu.
- `wrangler login` (có `--browser=false` nếu máy không mở được trình duyệt) và `wrangler whoami` đã đối chiếu với trang lệnh chung của Wrangler. Các lệnh Pages đã đối chiếu với trang `wrangler pages`; lệnh `wrangler dev` và `wrangler deploy` đã đối chiếu với hướng dẫn static assets, còn `tail`, `secret`, `versions`, `rollback` chưa đối chiếu từng cờ, hãy chạy `npx wrangler --help` nếu báo lỗi.
- Quay lui cho Pages: dùng tab Deployments trên dashboard để đưa bản cũ lên (giao diện có thể khác chút).
- Cờ `[COMMAND]` của `wrangler pages dev` đã bị đánh dấu ngừng dùng trong tài liệu.
- Với CI, dùng API token và account id đặt trong secret của hệ thống CI (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), token chỉ cấp đúng quyền cần.

## Supabase

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `npx supabase login` |
| Khởi tạo thư mục `supabase/` trong dự án | `npx supabase init` |
| Chạy Supabase cục bộ (cần Docker hoặc runtime container) | `npx supabase start` |
| Xem trạng thái bản cục bộ | `npx supabase status` |
| Dừng bản cục bộ | `npx supabase stop` |
| Liệt kê project | `npx supabase projects list` |
| Liên kết với project trên cloud | `npx supabase link --project-ref MA-PROJECT` |
| Tạo file migration mới | `npx supabase migration new TEN-MIGRATION` |
| Áp migration lên bản cục bộ | `npx supabase migration up --local` |
| Xem trước migration sẽ đẩy lên cloud | `npx supabase db push --dry-run` |
| Đẩy migration lên project đã liên kết | `npx supabase db push` |
| Kéo schema từ cloud về thành migration | `npx supabase db pull` |
| So sánh thay đổi schema | `npx supabase db diff` |
| Sinh kiểu TypeScript từ schema | `npx supabase gen types --lang typescript --linked` |
| Chạy thử Edge Function cục bộ | `npx supabase functions serve` |
| Deploy Edge Function | `npx supabase functions deploy TEN-HAM` |
| Đặt secret cho Edge Function | `npx supabase secrets set TEN_BIEN=GIA_TRI` |

Lưu ý:

- `MA-PROJECT` là mã trong URL dashboard của project. Đây không phải secret.
- Luôn chạy `db push --dry-run` trước `db push`. Migration thay đổi database thật; cẩn thận với lệnh xoá bảng hay cột. Theo tài liệu, `supabase stop --no-backup` xoá dữ liệu cục bộ.
- Thứ tự bật bảo mật: tạo bảng, bật RLS, viết policy, rồi mới dùng ở frontend. Xem [Supabase](04-supabase.md).
- Khóa `service_role` tuyệt đối không dán vào lệnh, vào chat hay vào code frontend.
- Xem log: dùng mục Logs trên dashboard Supabase (tôi không tìm thấy lệnh xem log hosted đã kiểm chứng).
- Quay lui: Supabase không có lệnh rollback database; cách an toàn là viết một migration mới sửa lại và dùng bản sao lưu theo tài liệu (kiểm tra gói của bạn có sao lưu hay không).
- Secret không đặt bằng `NAME=VALUE` trên dòng lệnh nếu máy dùng chung; ưu tiên `--env-file` (cờ có trong tài liệu) với file không commit.

## Firebase

| Việc | Lệnh |
| --- | --- |
| Đăng nhập | `firebase login` |
| Token cho môi trường không tương tác (đã bị đánh dấu ngừng dùng, ưu tiên service account) | `firebase login:ci` |
| Liệt kê project | `firebase projects:list` |
| Khởi tạo cấu hình trong thư mục (tạo `firebase.json`) | `firebase init` |
| Chọn project đang dùng hoặc đặt bí danh | `firebase use` |
| Chạy emulator cục bộ | `firebase emulators:start` |
| Deploy Hosting lên live | `firebase deploy --only hosting` |
| Deploy kèm ghi chú | `firebase deploy --only hosting -m "mô tả"` |
| Deploy Hosting vào kênh xem thử | `firebase hosting:channel:deploy TEN-KENH` |
| Đưa bản đã thử trên kênh lên live | `firebase hosting:clone MA-SITE:TEN-KENH MA-SITE:live` |
| Deploy Security Rules của Firestore | `firebase deploy --only firestore:rules` |
| Xem log Cloud Functions | `firebase functions:log` |
| Liệt kê function đã deploy | `firebase functions:list` |
| Đặt secret cho Cloud Functions | `firebase functions:secrets:set TEN_BIEN` |
| Tắt Hosting của project (ngừng phục vụ) | `firebase hosting:disable` |

Lưu ý:

- Cài đặt: `npm install -g firebase-tools` hoặc bản binary độc lập theo README của firebase-tools.
- Trong CI, tài liệu Firebase khuyên dùng service account (biến `GOOGLE_APPLICATION_CREDENTIALS` trỏ tới file khóa, file này tuyệt đối không commit) thay cho token `login:ci` vì token dài hạn rất nhạy cảm. Cấu hình service account hơi phức tạp, đây là việc bạn tự làm theo tài liệu.
- Tài liệu Hosting nêu `hosting:channel:deploy` cho link xem thử công khai ai có link đều mở được; link có thời hạn theo cấu hình kênh. Đừng đưa dữ liệu nhạy cảm vào bản xem thử.
- Quay lui Hosting: dùng trang Hosting trên Firebase console để đưa một bản phát hành cũ trở lại, hoặc xem mục "Manage live and preview channels, releases, and versions" trong tài liệu Hosting. Tôi chưa kiểm chứng được lệnh CLI rollback chính thức.
- `--only firestore:rules` theo cú pháp mục tiêu deploy chuẩn của Firebase; xem trang Deploy Targets trong tài liệu CLI nếu thấy khác.
- Thư mục `public` của Hosting được phục vụ công khai hoàn toàn, nên không để file nhạy cảm vào đó.
- `firebase hosting:disable` và các lệnh `firestore:delete` ảnh hưởng thật tới sản phẩm; không để agent tự chạy.

## Lệnh nào nên cho agent chạy, lệnh nào không

| Mức | Ví dụ | Quy tắc |
| --- | --- | --- |
| An toàn, chỉ đọc | `git status`, `git diff`, `vercel list`, `vercel logs`, `gh run view`, `wrangler pages deployment list`, `firebase projects:list` | Cho phép |
| Thay đổi trên máy bạn | `git commit`, `npm install`, `supabase start` | Cho phép, đọc `git diff` sau đó |
| Tác động lên mạng, có thể hoàn tác | `vercel deploy` (preview), `netlify deploy` (nháp), `firebase hosting:channel:deploy` | Cho phép khi bạn đã xem kế hoạch |
| Tác động production | `vercel deploy --prod`, `netlify deploy --prod`, `firebase deploy`, `supabase db push`, `wrangler deploy` | Bạn xác nhận từng lần |
| Không thể hoàn tác hoặc tốn tiền | các lệnh `rm`, `delete`, `remove`, `destroy`, `buy`, `firestore:delete`, `git push --force` | Bạn tự chạy, không giao cho agent |
| Đăng nhập, secret | `login`, `secret put`, `env add` với giá trị thật | Bạn tự làm, không qua chat |

## Tiếp theo + Tài liệu chính thức

**Tiếp theo:** đây là trang tra cứu. Dùng [Thư viện prompt](prompt-library.md) để nhờ agent chạy các lệnh trên đúng cách, và xem [Deploy cùng AI agent](06-ai-agent-deploy.md) để biết giới hạn quyền. Gặp lỗi thì mở [Xử lý sự cố](08-troubleshooting.md). Quay lại [trang chủ track](index.md).

Tài liệu chính thức:

- GitHub CLI: https://cli.github.com/manual/
- Vercel CLI: https://vercel.com/docs/cli
- Netlify CLI: https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/ và https://cli.netlify.com
- Wrangler: https://developers.cloudflare.com/workers/wrangler/commands/
- Supabase CLI: https://supabase.com/docs/reference/cli/introduction
- Firebase CLI: https://firebase.google.com/docs/cli
- Firebase Hosting, kênh xem thử: https://firebase.google.com/docs/hosting/test-preview-deploy
