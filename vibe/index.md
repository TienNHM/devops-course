# Vibe Deploy: từ AI viết code tới link công khai

> **Tóm tắt:** Track bổ trợ dành cho người mới hoặc chưa biết lập trình: đưa sản phẩm do AI viết lên Internet bằng GitHub Pages, Vercel, Netlify, Cloudflare, Supabase, Firebase một cách an toàn và nhanh chóng.

Giả định người học đã nhờ AI (Claude Code, Cursor, Lovable, Bolt...) viết xong một trang web hoặc một ứng dụng nhỏ, và sản phẩm đó chạy được trên máy cá nhân. Mục tiêu tiếp theo là để người khác mở được sản phẩm bằng một đường link. Track này hướng dẫn đúng chặng đó, với lượng kiến thức vừa đủ để tránh ba sự cố phổ biến: lộ khóa bí mật, mở database cho mọi người đọc, và phát sinh hóa đơn ngoài dự kiến.

Đây là **lộ trình riêng**, độc lập với [Lộ trình Cơ bản](../curriculum/basic.md) và [Lộ trình Nâng cao](../curriculum/advanced.md). Người học không cần biết Docker hay Kubernetes trước và không cần hoàn thành các tuần của khóa chính.

::: tip Bắt đầu ở đây
**Đường tắt 1 buổi chiều (khoảng 3 đến 4 giờ): chỉ làm Chặng 1.** Kết quả là một link công khai mở được từ điện thoại. Bắt đầu bằng [00 Tư duy](00-mindset.md) (10 phút), sau đó là bài 01 và bài 02. Chặng 2 và 3 là tùy chọn, thực hiện ở buổi khác khi sản phẩm thật sự cần. Thuật ngữ chưa quen có thể tra tại [Thuật ngữ](../resources/glossary.md).
:::

## Chưa có AI nào? Làm thế này

Không cần cài đặt phần mềm và không cần trả phí. Chọn một trong hai cách sau để có file web đầu tiên:

1. Mở một chatbot AI miễn phí (ví dụ Claude hoặc ChatGPT) và nhập yêu cầu: "Viết cho tôi một file index.html giới thiệu CLB của tôi, gồm tiêu đề, vài dòng mô tả và một nút liên hệ". Chép kết quả vào một file tên `index.html`.
2. Hoặc tải trang mẫu có sẵn: [vibe-static-site.zip](https://devops-course.tiennhm.io.vn/downloads/vibe-static-site.zip). Sau khi giải nén sẽ có file sẵn sàng đưa lên Internet.

## Chặng 1. Có link công khai (bắt buộc, khoảng 3 đến 4 giờ)

Kết quả: trang web có đường link mở được từ điện thoại của người khác. Giai đoạn này chưa có database và chưa có đăng nhập. Không cần biết lập trình và không cần cài Node.

- [ ] [00 Tư duy](00-mindset.md): hiểu deploy (đưa sản phẩm từ máy cá nhân lên Internet) và nắm 7 quy tắc sống còn (10 phút đọc).
- [ ] [01 Git và GitHub](01-git-github.md): đưa code lên GitHub bằng GitHub Desktop, không lộ secret.
- [ ] [02 Hosting tĩnh](02-static-hosting.md): deploy lên GitHub Pages (chỉ cần một nền tảng), có link công khai.

Hoàn thành ba bài này là đạt mục tiêu của buổi chiều. Các phần còn lại dùng khi sản phẩm có nhu cầu tương ứng.

## Chặng 2 (tùy chọn). Thêm database và đăng nhập (khoảng 2 giờ)

Thực hiện khi sản phẩm cần lưu dữ liệu (form đăng ký, danh sách) hoặc có đăng nhập. Chọn **một** trong hai nền tảng.

- [ ] [04 Supabase](04-supabase.md): database SQL, đăng nhập, RLS (khuyến nghị cho người mới).
- [ ] hoặc [05 Firebase](05-firebase.md): Firestore, Auth, Rules.

Khi sản phẩm cần gọi API có khóa bí mật (AI, email) từ phía server, đọc thêm [03 Fullstack serverless](03-fullstack-serverless.md). Bài 03 không phải điều kiện của bài 04.

## Chặng 3 (tùy chọn). Tên miền, bảo mật, ra mắt (khoảng 3 giờ)

Thực hiện khi cần domain riêng và sẵn sàng gửi link cho người lạ. Bài 07 và 11 có thể làm ngay sau Chặng 1, không cần Chặng 2.

- [ ] [07 Domain, bảo mật, production](07-domain-security-production.md): domain, HTTPS, secret, chi phí.
- [ ] [11 Hoàn thiện và ra mắt](11-launch-polish.md): chống spam form, preview khi chia sẻ link, checklist go-live.
- [ ] Dự án tổng hợp (tùy chọn): [09 Dự án mini](09-mini-project.md) gộp bài 01, 02, 04 và 07 thành một landing page CLB. Cần đã làm bài 04 (hoặc 05).

## Tra cứu (đọc khi cần)

- [06 AI agent và deploy](06-ai-agent-deploy.md): giao việc cho Claude Code, Cursor, MCP, CLI một cách có kiểm soát.
- [08 Xử lý sự cố](08-troubleshooting.md): lỗi thường gặp khi deploy.
- [10 App-builder](10-app-builders.md): đã làm bằng Lovable, Bolt, v0, Replit và muốn mang code về repo của mình.
- [So sánh nền tảng](platforms.md), [Thư viện prompt](prompt-library.md), [Bảng lệnh CLI](cli-cheatsheet.md).

## Ai nên học, và bạn sẽ làm được gì

Track phù hợp với sinh viên chưa từng lập trình, người đã dùng Lovable, Bolt, v0, Replit và muốn mang sản phẩm ra khỏi nền tảng đó, thành viên CLB cần đưa landing page hoặc form đăng ký lên Internet, và người học DevOps cần một link demo nhanh.

Sau track này, người học đưa được trang web lên Internet trong 30 phút, gắn tên miền riêng có HTTPS, thêm đăng nhập và database với lớp bảo vệ đúng (RLS hoặc Security Rules), giao việc cho AI agent có kiểm soát và đặt được giới hạn chi phí. Điều kiện cần: một laptop, một trình duyệt và một tài khoản GitHub miễn phí. Không cần thẻ ngân hàng.

::: details Bảng module 00 đến 11 (thời lượng và kết quả)

| Module | Nội dung | Thời lượng |
| --- | --- | --- |
| [00 Tư duy](00-mindset.md) | Deploy, frontend, backend, database, env var, vòng lặp AI | 10 phút đọc |
| [01 Git và GitHub](01-git-github.md) | Repo, commit, push, .gitignore | 60 phút |
| [02 Hosting tĩnh](02-static-hosting.md) | GitHub Pages, Cloudflare, Netlify, Vercel | 60 phút |
| [03 Fullstack serverless](03-fullstack-serverless.md) | Vercel, Netlify, Cloudflare Functions | 90 phút |
| [04 Supabase](04-supabase.md) | Database, đăng nhập, RLS | 90 phút |
| [05 Firebase](05-firebase.md) | Hosting, Firestore, Auth, Rules | 90 phút |
| [06 AI agent và deploy](06-ai-agent-deploy.md) | Claude Code, Cursor, MCP, CLI | 75 phút |
| [07 Domain, bảo mật, production](07-domain-security-production.md) | Domain, HTTPS, secret, chi phí | 60 phút |
| [08 Xử lý sự cố](08-troubleshooting.md) | Lỗi thường gặp khi deploy | Tra cứu |
| [09 Dự án mini](09-mini-project.md) | Landing page CLB (tùy chọn) | 3 đến 4 giờ |
| [10 App-builder](10-app-builders.md) | Xuất code, repo riêng, rà bảo mật | 75 phút |
| [11 Hoàn thiện và ra mắt](11-launch-polish.md) | Chống spam, SEO, analytics, backup, go-live | 90 đến 120 phút |

:::

::: details Ví dụ chạy được (thư mục examples/vibe) và tài liệu chính thức

| Ví dụ | Dùng với |
| --- | --- |
| [static-site](../examples/vibe/static-site/README.md) | Hosting tĩnh, module 02 (tải sẵn: `vibe-static-site.zip`) |
| [vercel-api](../examples/vibe/vercel-api/README.md) | Vercel Function, module 03 |
| [netlify-function](../examples/vibe/netlify-function/README.md) | Netlify Function, module 03 |
| [cloudflare-workers-static](../examples/vibe/cloudflare-workers-static/README.md) | Cloudflare Workers với static assets, module 02 và 03 |
| [cloudflare-pages-function](../examples/vibe/cloudflare-pages-function/README.md) | Cloudflare Pages Functions (đường cũ), module 03 |
| [supabase](../examples/vibe/supabase/README.md) | Database và RLS, module 04 |
| [firebase](../examples/vibe/firebase/README.md) | Firebase, module 05 |
| [club-landing](../examples/vibe/club-landing/README.md) | Dự án mini, module 09 và 11 (tải sẵn: `vibe-club-landing.zip`) |

Tài liệu chính thức: [GitHub Pages](https://docs.github.com/en/pages), [Vercel](https://vercel.com/docs), [Netlify](https://docs.netlify.com), [Cloudflare Pages](https://developers.cloudflare.com/pages/), [Supabase](https://supabase.com/docs), [Firebase](https://firebase.google.com/docs).

:::

## Dùng cùng AI agent và khi nào nên học DevOps

Mỗi module có mục "Nhờ AI agent làm giúp" với prompt có thể sao chép. Người học quyết định mục tiêu, agent viết lệnh và code. Người học **đọc** những gì agent định thực hiện (nhất là lệnh xóa, lệnh liên quan đến khóa, lệnh phát sinh chi phí) và tự mở link thật để kiểm tra. Không giao cho agent: dán secret vào chat, nhập thẻ, nâng cấp gói trả phí, xóa dữ liệu thật. Khi chưa có agent, làm theo "Thực hành từng bước" là đủ.

Nên quay lại khóa chính khi gặp một trong các dấu hiệu sau:

| Dấu hiệu | Nên học |
| --- | --- |
| "Chạy được trên máy cá nhân nhưng khác trên server" | Docker: [Buổi 07 – Container Fundamentals](../labs/week-04/session-07.md) |
| Nhiều người sửa chung và thường ghi đè mã của nhau | Git workflow và Pull Request, xem [Buổi 01 – DevOps Introduction](../labs/week-01/session-01.md) |
| Cần tự động chạy test mỗi lần đẩy code | CI/CD với GitHub Actions |
| Nhiều dịch vụ phải chạy cùng nhau và cần mở rộng quy mô | Compose, rồi Kubernetes |
| Cần theo dõi lỗi, log và cảnh báo ở mức nghiêm túc | Monitoring và observability |

Xem toàn cảnh ở [Bắt đầu từ đây](../curriculum/getting-started.md) và [hướng dẫn cài môi trường](../resources/setup-guide.md).
