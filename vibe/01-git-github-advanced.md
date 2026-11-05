# Git và GitHub: dòng lệnh và agent (nâng cao)

> **Tóm tắt:** Trang bổ sung của [bài 01 Git và GitHub](01-git-github.md): thực hiện đầy đủ các bước bằng `git` và `gh`, branch, README, và prompt giao việc Git cho AI agent. Trang này không bắt buộc với người dùng GitHub Desktop.

Các bước dưới đây thay cho các bước thao tác bằng chuột ở bài chính. Bước tạo `.gitignore` và `.env.example` vẫn thực hiện như bài chính.

Cách này phù hợp với người quen terminal hoặc muốn AI agent chạy lệnh thay. Các bước dưới đây thay cho Bước 1, 3, 4, 5 ở bài chính (Bước 2 `.gitignore` vẫn thực hiện như cũ).

## Bước 1. Chuẩn bị tài khoản và công cụ

1. Tạo tài khoản GitHub (miễn phí) và bật xác thực hai lớp (2FA, bước xác nhận thứ hai ngoài mật khẩu) trong phần Settings, mục Password and authentication (giao diện có thể khác đôi chút).
2. Cài **một** trong hai đường đi sau, chọn cách phù hợp hơn:
   - **GitHub Desktop**: ứng dụng thao tác bằng chuột, phù hợp với người chưa từng dùng terminal.
   - **Git + GitHub CLI (`gh`)**: dùng terminal, phù hợp khi để AI agent làm thay.
3. Nếu chọn terminal, kiểm tra đã cài:

```bash
git --version
gh --version
```

Kết quả: hai dòng hiển thị số phiên bản. Nếu báo "command not found", cài Git và GitHub CLI từ trang chính thức (link ở cuối bài) rồi mở lại terminal.

4. Khai báo tên và email để các commit ghi nhận đúng tác giả (chỉ thực hiện một lần):

```bash
git config --global user.name "Ten Cua Ban"
git config --global user.email "email-cua-ban@example.com"
```

Lưu ý: GitHub có tùy chọn email riêng tư dạng `noreply` cho người học không muốn công khai email thật.

## Bước 2. Đăng nhập GitHub một lần, theo cách ít đau đầu nhất

Không cần tự tạo token hay khóa SSH nếu dùng một trong hai cách sau.

| Cách | Làm gì | Khi nào chọn |
| --- | --- | --- |
| GitHub Desktop | Mở ứng dụng, chọn đăng nhập, trình duyệt mở ra để xác nhận quyền truy cập | Chưa từng dùng terminal |
| GitHub CLI | Chạy `gh auth login`, chọn GitHub.com, chọn HTTPS, đồng ý để Git dùng thông tin đăng nhập của GitHub, rồi làm theo hướng dẫn trên trình duyệt | Dùng terminal hoặc AI agent |

```bash
gh auth login
gh auth status
```

Kết quả: `gh auth status` báo "Logged in to github.com". Việc nhập mật khẩu hoặc mã xác nhận thực hiện trên trình duyệt, không dán vào khung chat với AI.

Personal Access Token (PAT) và SSH key chỉ cần khi cách trên không chạy được (ví dụ máy chủ không có trình duyệt). PAT là mật khẩu tạm thời có giới hạn quyền, dùng thay cho mật khẩu thật; SSH key là cặp khóa được cài sẵn trên máy để xác thực. Khi phải dùng PAT, tạo token với quyền nhỏ nhất, đặt hạn dùng ngắn và xử lý như một secret (không dán vào repo, không dán vào prompt). Xem hướng dẫn chính thức ở cuối bài.

## Bước 3. Tạo thư mục dự án và khởi tạo Git

Giả sử AI đã viết code vào thư mục `my-site`:

```bash
cd my-site
git init
git branch -M main
```

Kết quả: thông báo "Initialized empty Git repository" và nhánh chính tên là `main`.

Với GitHub Desktop: vào menu File, chọn Add local repository (hoặc Create new repository) và trỏ tới thư mục `my-site`.

## Bước 4. Kiểm tra bằng `git status` rằng secret không bị gom vào

Giả sử dự án có file `.env` thật. Chạy lệnh:

```bash
git status
```

Kết quả: danh sách "Untracked files" có `.gitignore`, `.env.example`, `index.html`... nhưng KHÔNG có `.env`. Nếu `.env` xuất hiện trong danh sách, dừng lại: `.gitignore` sai tên, sai vị trí, hoặc file đã bị `git add` trước đó.

Kiểm tra thêm bằng một lệnh:

```bash
git check-ignore -v .env
```

Kết quả: một dòng chỉ ra quy tắc nào trong `.gitignore` đang chặn `.env`. Không có đầu ra nghĩa là `.env` chưa được chặn.

## Bước 5. Commit đầu tiên

```bash
git add .
git status
git commit -m "Initial commit: first version of my site"
```

Lệnh `git add .` đưa mọi thay đổi (trừ file bị ignore) vào vùng chuẩn bị commit (staging area). Chạy `git status` lần nữa để thấy "Changes to be committed" và xác nhận không có `.env`. Sau đó `git commit` ghi các thay đổi đó thành một commit.

Với GitHub Desktop: chọn các file ở cột bên trái, ghi tóm tắt vào ô Summary và chọn Commit to main. Quan sát danh sách file: nếu có `.env` thì không commit.

## Bước 6. Tạo repo trên GitHub và push

Cách A, dùng GitHub CLI (một lệnh):

```bash
gh repo create my-site --private --source=. --remote=origin --push
```

Đổi `--private` thành `--public` nếu cần repo công khai (ví dụ để dùng GitHub Pages trên gói Free). Kết quả: GitHub in ra link repo, ví dụ `https://github.com/ten-ban/my-site`.

Cách B, dùng GitHub Desktop: chọn Publish repository, bỏ hoặc giữ dấu tick "Keep this code private" tùy nhu cầu, rồi chọn Publish.

Cách C, tạo repo trên web rồi nối về máy:

```bash
git remote add origin https://github.com/ten-ban/my-site.git
git push -u origin main
```

Kết quả: khi mở link repo trên trình duyệt, danh sách file hiển thị đầy đủ và không có `.env`. Tự kiểm tra danh sách file trên GitHub một lần.

## Bước 7. Vòng lặp hằng ngày: sửa, xem diff, commit, push

```bash
git status
git diff
git add .
git commit -m "Describe what changed in a few words"
git push
```

`git diff` hiển thị từng dòng đã thay đổi. Không cần hiểu từng ký tự; chỉ cần kiểm tra ba điểm: có file lạ không (ví dụ `.env`, `*.pem`, `id_rsa`), có chuỗi dài giống khóa không (bắt đầu bằng `sk_`, `sb_secret_`, `eyJ`, `AKIA`...), và AI có xóa nhiều file ngoài ý muốn không. GitHub Desktop có khung diff sẵn, chọn từng file để xem.

## Bước 8. Branch: thử ý tưởng mà không làm hỏng bản đang chạy

Branch (nhánh) hữu ích khi nhờ AI thử đổi giao diện: nếu kết quả không đạt thì bỏ nhánh, bản chính vẫn nguyên vẹn.

```bash
git switch -c try-new-design
# ... nhờ AI sửa, xem thử ...
git add .
git commit -m "Try new design"
git push -u origin try-new-design
```

Khi kết quả đạt yêu cầu, mở Pull Request (PR, đề nghị gộp nhánh) trên GitHub rồi chọn Merge để gộp vào `main`. Khi không đạt:

```bash
git switch main
git branch -D try-new-design
```

Lưu ý: Vercel, Netlify, Cloudflare Pages thường tạo link xem thử (preview) riêng cho mỗi nhánh hoặc PR, nên có thể thử nghiệm mà không ảnh hưởng trang chính. Chi tiết xem [bài 02 Hosting tĩnh](02-static-hosting.md).

## README, license và vài việc nhỏ cho repo

Một `README.md` tối thiểu giúp người học (và AI ở các phiên sau) nắm được dự án là gì:

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

License (giấy phép) quy định quyền sử dụng lại mã nguồn. Với repo public mà người khác được phép dùng lại, thêm file `LICENSE` (ví dụ MIT, rất phổ biến). Khi tạo repo trên web, GitHub có sẵn ô chọn license. Khi không có license, mặc định người khác không có quyền dùng lại code. Với sản phẩm kinh doanh hoặc có dữ liệu riêng, để repo private và không cần license.

Nên bật thêm secret scanning trong Settings của repo, mục Security (giao diện có thể khác đôi chút). Theo tài liệu GitHub, secret scanning chạy miễn phí trên repo public (repo private tùy gói, xem trang giá GitHub); công cụ này không phải lớp bảo vệ duy nhất.

## Nhờ AI agent làm giúp Git

Agent (Claude Code, Cursor, Copilot agent, Codex, Gemini CLI...) thực hiện tốt các việc Git lặp lại. Người học là người duyệt cuối cùng.

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

Prompt 3, tạo repo và push (chỉ khi đã đọc diff):

```text
Tôi đã đăng nhập gh CLI. Hãy tạo repo private tên my-site trên tài khoản của tôi từ thư mục hiện tại và push nhánh main. Sau khi xong, in ra link repo và liệt kê các file đã lên GitHub để tôi kiểm tra không có file .env.
```

Việc người học phải tự thực hiện, không giao cho agent:

- Đăng nhập GitHub, nhập mật khẩu và mã 2FA. Tự chạy `gh auth login` và xác nhận trên trình duyệt.
- Dán secret, token, khóa API vào chat hoặc prompt. Khi agent hỏi giá trị khóa, tự điền vào file `.env` trên máy cá nhân.
- Quyết định repo public hay private, và mọi thao tác có trả tiền.
- Chạy `git push --force`, `git reset --hard`, hoặc xóa repo khi chưa hiểu hậu quả. Nếu agent đề nghị, hỏi lại "lệnh này làm mất gì?" trước khi đồng ý.

Kiểm tra sau khi agent hoàn thành: mở repo trên github.com, xem danh sách file và lịch sử commit; tìm tên file `.env`; mở thử một vài file code để xác nhận không có khóa viết cứng trong code.

## Quay lại bài chính

Về [bài 01 Git và GitHub](01-git-github.md).
