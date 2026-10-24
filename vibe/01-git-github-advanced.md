# Git và GitHub: dòng lệnh và agent (nâng cao)

> **Tóm tắt:** Trang bổ sung của [bài 01 Git và GitHub](01-git-github.md): làm đủ các bước bằng `git` và `gh`, branch, README, và prompt giao việc Git cho AI agent. Không bắt buộc với người dùng GitHub Desktop.

Các bước dưới đây thay cho các bước bấm chuột ở bài chính. Bước tạo `.gitignore` và `.env.example` vẫn làm như bài chính.

Chọn cách này nếu bạn quen terminal hoặc muốn AI agent chạy lệnh giúp. Các bước dưới đây thay cho Bước 1, 3, 4, 5 ở trên (Bước 2 `.gitignore` vẫn làm như cũ).

## Bước 1. Chuẩn bị tài khoản và công cụ

1. Có tài khoản GitHub (miễn phí) và bật xác thực hai lớp (2FA) trong phần Settings, mục Password and authentication (giao diện có thể khác chút).
2. Cài **một** trong hai đường đi, chọn cái bạn thấy dễ hơn:
   - **GitHub Desktop**: ứng dụng bấm chuột, hợp nhất với người chưa từng dùng terminal.
   - **Git + GitHub CLI (`gh`)**: dùng terminal, hợp với việc để AI agent làm giúp.
3. Nếu chọn terminal, kiểm tra đã cài:

```bash
git --version
gh --version
```

Bạn sẽ thấy: hai dòng hiện số phiên bản. Nếu báo "command not found", cài Git và GitHub CLI từ trang chính thức (link ở cuối bài) rồi mở lại terminal.

4. Khai báo tên và email để dấu vết commit có chủ (chỉ làm một lần):

```bash
git config --global user.name "Ten Cua Ban"
git config --global user.email "email-cua-ban@example.com"
```

Gợi ý: GitHub có tùy chọn email riêng tư dạng `noreply` nếu bạn không muốn lộ email thật.

## Bước 2. Đăng nhập GitHub một lần, theo cách ít đau đầu nhất

Bạn không cần tự tạo token hay khóa SSH nếu dùng một trong hai cách sau.

| Cách | Làm gì | Khi nào chọn |
| --- | --- | --- |
| GitHub Desktop | Mở app, bấm đăng nhập, trình duyệt mở ra để bạn đồng ý | Chưa từng dùng terminal |
| GitHub CLI | Chạy `gh auth login`, chọn GitHub.com, chọn HTTPS, đồng ý để Git dùng thông tin đăng nhập của GitHub, làm theo trình duyệt | Dùng terminal hoặc AI agent |

```bash
gh auth login
gh auth status
```

Bạn sẽ thấy: `gh auth status` báo "Logged in to github.com". Việc nhập mật khẩu hay mã xác nhận là việc của bạn trên trình duyệt, đừng dán vào khung chat với AI.

Personal Access Token (PAT) và SSH key chỉ cần khi cách trên không chạy được (ví dụ máy chủ không có trình duyệt). Hiểu ngắn gọn: PAT là "mật khẩu tạm có giới hạn quyền" thay cho mật khẩu thật; SSH key là "chìa khóa cặp" đặt sẵn trên máy. Nếu phải dùng PAT, tạo token với quyền nhỏ nhất, đặt hạn dùng ngắn, và đối xử với nó như một secret (không dán vào repo, không dán vào prompt). Xem hướng dẫn chính thức ở cuối bài.

## Bước 3. Tạo thư mục dự án và khởi tạo Git

Giả sử AI đã viết code vào thư mục `my-site`:

```bash
cd my-site
git init
git branch -M main
```

Bạn sẽ thấy: thông báo "Initialized empty Git repository". Nhánh chính tên là `main`.

Với GitHub Desktop: menu File, chọn Add local repository (hoặc Create new repository), trỏ tới thư mục `my-site`.

## Bước 4. Kiểm tra bằng `git status` rằng secret không bị gom vào

Giả sử bạn có file `.env` thật. Chạy:

```bash
git status
```

Bạn sẽ thấy: danh sách "Untracked files" có `.gitignore`, `.env.example`, `index.html`... nhưng KHÔNG có `.env`. Nếu `.env` hiện trong danh sách, dừng lại: `.gitignore` sai tên, sai vị trí, hoặc bạn đã lỡ `git add` file đó trước đó.

Kiểm tra chắc chắn thêm một lệnh:

```bash
git check-ignore -v .env
```

Bạn sẽ thấy: một dòng chỉ ra quy tắc nào trong `.gitignore` đang chặn `.env`. Không có đầu ra nghĩa là `.env` chưa được chặn.

## Bước 5. Commit đầu tiên

```bash
git add .
git status
git commit -m "Initial commit: first version of my site"
```

Lệnh `git add .` gom mọi thay đổi (trừ file bị ignore) vào "giỏ". Chạy `git status` lần nữa để thấy "Changes to be committed" và xác nhận không có `.env`. Sau đó `git commit` đóng giỏ thành một trang nhật ký.

Với GitHub Desktop: tick các file ở cột bên trái, ghi tóm tắt vào ô Summary, bấm Commit to main. Hãy nhìn danh sách file: nếu thấy `.env` thì đừng commit.

## Bước 6. Tạo repo trên GitHub và push

Cách A, dùng GitHub CLI (một lệnh):

```bash
gh repo create my-site --private --source=. --remote=origin --push
```

Đổi `--private` thành `--public` nếu bạn muốn repo công khai (ví dụ để dùng GitHub Pages trên gói Free). Bạn sẽ thấy: GitHub in ra link repo, ví dụ `https://github.com/ten-ban/my-site`.

Cách B, dùng GitHub Desktop: bấm Publish repository, bỏ hoặc giữ dấu tick "Keep this code private" tùy ý, bấm Publish.

Cách C, làm trên web rồi nối về máy:

```bash
git remote add origin https://github.com/ten-ban/my-site.git
git push -u origin main
```

Bạn sẽ thấy: mở link repo trên trình duyệt, thấy các file của bạn, và không thấy `.env`. Hãy tự bấm kiểm tra danh sách file trên GitHub một lần.

## Bước 7. Vòng lặp hằng ngày: sửa, xem diff, commit, push

```bash
git status
git diff
git add .
git commit -m "Describe what changed in a few words"
git push
```

`git diff` hiện từng dòng đã đổi. Với người mới, bạn không cần hiểu từng ký tự; hãy tìm ba điều: có file lạ không (ví dụ `.env`, `*.pem`, `id_rsa`), có chuỗi dài giống khóa không (bắt đầu bằng `sk_`, `sb_secret_`, `eyJ`, `AKIA`...), AI có xóa nhiều file ngoài ý muốn không. GitHub Desktop có khung diff sẵn, bấm vào từng file để xem.

## Bước 8. Branch: thử ý tưởng mà không làm hỏng bản đang chạy

Rất hữu ích khi bạn nhờ AI "thử đổi giao diện": nếu hỏng thì bỏ nhánh, bản chính vẫn nguyên.

```bash
git switch -c try-new-design
# ... nhờ AI sửa, xem thử ...
git add .
git commit -m "Try new design"
git push -u origin try-new-design
```

Nếu ưng ý, mở Pull Request (PR) trên GitHub rồi bấm Merge để gộp vào `main`. Nếu không ưng:

```bash
git switch main
git branch -D try-new-design
```

Mẹo: Vercel, Netlify, Cloudflare Pages thường tạo link xem thử (preview) riêng cho mỗi nhánh hoặc PR, nên bạn thử thoải mái mà không đụng trang chính. Chi tiết xem [bài 02 Hosting tĩnh](02-static-hosting.md).

## README, license và vài việc nhỏ cho repo

Một `README.md` tối thiểu giúp bạn (và AI ở các phiên sau) nhớ dự án là gì:

```text
# Ten Du An

Mot cau mo ta du an lam gi, cho ai.

## Chay thu tren may

1. Cai Node.js (neu du an can)
2. Sao chep .env.example thanh .env va dien gia tri cua ban
3. Chay: npm install roi npm run dev

## Deploy

Link trang dang chay: (dien sau khi deploy)
```

Về license (giấy phép): nếu repo public và bạn muốn người khác được dùng lại, thêm file `LICENSE` (ví dụ MIT, rất phổ biến). Khi tạo repo trên web, GitHub có sẵn ô chọn license. Nếu không thêm license, mặc định người khác không có quyền dùng lại code của bạn. Với sản phẩm kinh doanh hoặc có dữ liệu riêng, hãy để private và không cần license.

Bật thêm cho an toàn: trong Settings của repo, mục Security (giao diện có thể khác chút), xem secret scanning. Theo tài liệu GitHub, secret scanning chạy miễn phí trên repo public (repo private tùy gói, xem trang giá GitHub); đừng coi nó là lưới an toàn duy nhất.

## Nhờ AI agent làm giúp Git

Agent (Claude Code, Cursor, Copilot agent, Codex, Gemini CLI...) làm tốt các việc lặp lại với Git. Bạn là người duyệt cuối.

Prompt 1, khởi tạo repo an toàn:

```text
Hãy giúp tôi đưa dự án trong thư mục hiện tại lên GitHub, theo thứ tự:
1. Kiểm tra xem đã có git repo chưa; nếu chưa thì git init và đặt nhánh là main.
2. Tạo .gitignore phù hợp loại dự án này (phải chặn .env, .env.*, node_modules, dist, build) và tạo .env.example chỉ chứa TÊN biến với giá trị giả.
3. Quét toàn bộ thư mục tìm chuỗi giống secret (API key, token, mật khẩu, service_role) đang nằm trong code. Nếu có, DỪNG và báo tôi, đừng commit.
4. Chạy git status và cho tôi xem danh sách file sẽ được commit. CHỜ tôi xác nhận.
5. Sau khi tôi xác nhận: git add, git commit với thông điệp rõ ràng. Chưa push.
Không tạo repo, không push, không đụng tới file .env.
```

Prompt 2, trước mỗi lần commit:

```text
Trước khi commit, hãy chạy git status và git diff, rồi tóm tắt bằng tiếng Việt đơn giản:
- Những file nào bị thay đổi, thêm, xóa.
- Có file nào tên .env, *.pem, id_rsa, *.key, hoặc nội dung giống khóa bí mật không.
- Có thay đổi nào ngoài phạm vi tôi yêu cầu không.
Đừng commit cho đến khi tôi nói "ok commit".
```

Prompt 3, tạo repo và push (chỉ khi bạn đã đọc diff):

```text
Tôi đã đăng nhập gh CLI. Hãy tạo repo private tên my-site trên tài khoản của tôi từ thư mục hiện tại và push nhánh main. Sau khi xong, in ra link repo và liệt kê các file đã lên GitHub để tôi kiểm tra không có file .env.
```

Việc bạn phải tự làm, đừng giao cho agent:

- Đăng nhập GitHub, nhập mật khẩu, mã 2FA. Tự chạy `gh auth login` và bấm xác nhận trên trình duyệt.
- Dán secret, token, khóa API vào chat hay prompt. Nếu agent hỏi giá trị khóa, hãy tự điền vào file `.env` trên máy bạn.
- Quyết định repo public hay private, và mọi thao tác có trả tiền.
- Chạy `git push --force`, `git reset --hard`, hoặc xóa repo mà bạn chưa hiểu hậu quả. Nếu agent đề nghị, hỏi lại "lệnh này làm mất gì?" trước khi đồng ý.

Bạn kiểm tra gì sau khi agent làm xong: mở repo trên github.com, xem danh sách file và lịch sử commit; tìm tên file `.env`; mở thử một vài file code xem có khóa dán cứng không.

## Quay lại bài chính

Về [bài 01 Git và GitHub](01-git-github.md).
