# Tài khoản GitHub và repo devops-labs

Trang này hướng dẫn mọi việc liên quan GitHub: tạo tài khoản, tạo repo nộp bài `devops-labs`, đăng nhập từ terminal, tải repo giáo trình về máy, và bật những gì cần cho các buổi CI/CD. Làm theo thứ tự, mỗi bước có kết quả mong đợi.

> **Tóm tắt:** Tạo tài khoản GitHub và bật 2FA, tạo repo devops-labs ở chế độ Public, cấu hình git, đăng nhập bằng SSH key hoặc gh, rồi clone repo giáo trình vào ~/devops-course.

::: tip Cần gì và khi nào
- **Buổi 01**: chỉ cần mục 1 (tài khoản) và mục 2 (repo `devops-labs`). Nộp bài bằng cách upload trên web, chưa cần terminal.
- **Buổi 02**: làm mục 3 (cấu hình git), mục 4 (đăng nhập) và mục 5 (clone repo giáo trình) trong Ubuntu.
- **Buổi 06 trở đi**: push và Pull Request thành thạo.
- **Buổi 18**: mục 6 (Actions, Packages, GHCR).

Chưa quen gõ lệnh? Đọc [Terminal 101](terminal-101.md) trước. Cần cài Git: xem [Hướng dẫn cài đặt môi trường](setup-guide.md#can-ngay-tuan-1).
:::

## 1. Tạo tài khoản GitHub

1. Vào https://github.com/signup, nhập email, mật khẩu, tên người dùng (username). Username sẽ xuất hiện trong địa chỉ repo của bạn, nên chọn tên nghiêm túc, không dấu.
2. Xác minh email theo thư GitHub gửi.
3. Bật xác thực hai lớp (2FA): **Settings > Password and authentication > Two-factor authentication**. Làm theo hướng dẫn, lưu mã khôi phục ở nơi an toàn.

**Kiểm tra bạn đúng khi:** mở https://github.com/ thấy tên bạn ở góc phải, và trang **Settings > Password and authentication** báo 2FA đã bật.

## 2. Tạo repo devops-labs (Public)

Repo `devops-labs` là nơi bạn nộp bài suốt khóa: mỗi buổi một thư mục `lab-XX` chứa README, evidence và report.

1. Trên GitHub bấm **New repository**.
2. **Repository name**: `devops-labs` (đúng chính tả, chữ thường).
3. Chọn **Public**.
4. Tick **Add a README file**, bấm **Create repository**.

::: tip Vì sao Public
Khóa học dùng GitHub Pages và GitHub Container Registry (GHCR) miễn phí, mà hai thứ này chỉ miễn phí đầy đủ với repo Public. Đừng bỏ bí mật vào repo: không commit mật khẩu, token, khóa riêng SSH. Nếu bạn lỡ commit bí mật, coi như nó đã lộ và phải tạo lại.
:::

**Kiểm tra bạn đúng khi:** địa chỉ `https://github.com/TEN-GITHUB/devops-labs` mở được cả khi bạn đăng xuất (hoặc mở bằng cửa sổ ẩn danh), và có nhãn **Public** cạnh tên repo.

Buổi 01, nộp bài bằng nút **Add file > Upload files** trên trang repo: kéo thả thư mục `lab-01` rồi bấm **Commit changes**. Muốn nộp bằng dòng lệnh: xem mục "Git trong 10 phút" của [Bắt đầu từ đây](../curriculum/getting-started.md).

## 3. Cấu hình git trên máy

Làm trong Ubuntu (hoặc PowerShell nếu bạn muốn dùng git bên Windows). Thay tên và email bằng của bạn, dùng đúng email đã đăng ký GitHub (hoặc email `noreply` trong **Settings > Emails**):

```bash
git config --global user.name "Họ Tên"
git config --global user.email "email-dang-ky-github@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
```

**Kiểm tra bạn đúng khi** lệnh sau in ra đúng tên và email của bạn:

```bash
git config --global --list
```

```text
user.name=Họ Tên
user.email=email-dang-ky-github@example.com
init.defaultbranch=main
...
```

## 4. Đăng nhập GitHub từ terminal {#dang-nhap}

Để `git push` được lên repo của bạn, git cần biết bạn là ai. Chọn một trong hai cách. Người mới nên chọn cách A hoặc B (đều làm trong Ubuntu); chọn cách nào cũng được, chỉ cần làm đủ một cách.

### Cách A: SSH key (khuyến nghị)

SSH key gồm hai file: khóa riêng (giữ bí mật) và khóa công khai (đưa cho GitHub). Giống ổ khóa và chìa khóa: bạn gắn ổ khóa (khóa công khai) lên GitHub, chỉ chìa khóa riêng của bạn mở được.

Tạo khóa:

```bash
ssh-keygen -t ed25519 -C "email-dang-ky-github@example.com"
```

Nhấn Enter để chấp nhận đường dẫn mặc định, và nên đặt passphrase (một mật khẩu bảo vệ khóa). Rồi in khóa công khai:

```bash
cat ~/.ssh/id_ed25519.pub
```

Sao chép toàn bộ dòng (bắt đầu bằng `ssh-ed25519`) vào GitHub: **Settings > SSH and GPG keys > New SSH key**, đặt tên gợi nhớ (ví dụ `WSL laptop`), dán vào ô Key, bấm **Add SSH key**. Kiểm tra:

```bash
ssh -T git@github.com
```

Kết quả mong đợi (lần đầu hỏi xác nhận fingerprint, gõ `yes`):

```text
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

::: warning Chỉ chia sẻ file .pub
Chỉ đưa file `.pub` cho GitHub. Không bao giờ gửi, chụp màn hình, hay commit file `id_ed25519` (khóa riêng). Nếu bị lộ khóa riêng, vào GitHub xóa khóa đó và tạo cặp mới.
:::

Nếu gặp `Permission denied (publickey)`: xem [Xử lý sự cố cài đặt](troubleshooting-setup.md#ssh-github).

### Cách B: GitHub CLI hoặc Git Credential Manager

**GitHub CLI (`gh`)** cho phép đăng nhập qua trình duyệt, không cần tự tạo khóa. Cài theo hướng dẫn chính thức cho Debian/Ubuntu: https://github.com/cli/cli/blob/trunk/docs/install_linux.md. Sau đó:

```bash
gh auth login
gh auth status
```

Chọn GitHub.com, giao thức HTTPS (đơn giản nhất) hoặc SSH, rồi đăng nhập qua trình duyệt. Kết quả mong đợi của `gh auth status`:

```text
github.com
  ✓ Logged in to github.com account TEN-GITHUB
```

Để git dùng luôn thông tin đăng nhập của `gh` khi push qua HTTPS:

```bash
gh auth setup-git
```

`gh` còn hữu ích để tạo Pull Request và xem log Actions ngay trong terminal.

**Git Credential Manager (GCM)** đi kèm Git for Windows, tự mở trình duyệt để đăng nhập khi bạn push lần đầu và nhớ giúp. Nếu bạn dùng git từ PowerShell, chỉ cần `git push` và làm theo cửa sổ hiện ra. Từ trong WSL, có thể cho git dùng GCM của Windows (đường dẫn tùy máy, kiểm tra tài liệu của GCM nếu khác):

```bash
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
```

::: warning Không dán token vào lệnh
Nếu được hỏi "Password", GitHub không nhận mật khẩu tài khoản mà cần token. Đừng tự dán token vào dòng lệnh hay vào file trong repo (nó sẽ nằm trong lịch sử lệnh và có thể bị commit). Dùng `gh auth login` hoặc SSH key để tránh phải xử lý token bằng tay.
:::

## 5. Clone repo giáo trình {#clone-repo-giao-trinh}

Repo giáo trình chứa starter project, template, script kiểm tra môi trường. Bạn chỉ đọc và chạy, không cần push lên nó. Clone vào thư mục `~/devops-course` trong Ubuntu:

```bash
cd ~
git clone https://github.com/TienNHM/devops-course.git ~/devops-course
```

**Kiểm tra bạn đúng khi:**

```bash
ls ~/devops-course
```

thấy các thư mục như `labs`, `starter-project`, `resources`, `templates`. Thử script kiểm tra môi trường:

```bash
cd ~/devops-course
bash resources/check-env.sh 2
```

Về sau, khi giáo trình có cập nhật, kéo về bằng:

```bash
cd ~/devops-course
git pull
```

Repo cá nhân `devops-labs` clone riêng vào `~/devops-labs`, không để chung với `devops-course`:

```bash
git clone git@github.com:TEN-GITHUB/devops-labs.git ~/devops-labs
```

Thay `TEN-GITHUB` bằng username của bạn. Nếu bạn dùng cách đăng nhập HTTPS (cách B), thay địa chỉ bằng `https://github.com/TEN-GITHUB/devops-labs.git`.

## 6. Bật Actions, Packages và GHCR (khi tới buổi 18)

Chưa cần làm ở tuần 1. Khi tới phần CI/CD:

1. **Actions**: trong repo `devops-labs`, mở tab **Actions**. Nếu GitHub hỏi, bấm cho phép chạy workflow. Kiểm tra ở **Settings > Actions > General** rằng Actions đang được bật cho repo.
2. **Packages và GHCR**: GitHub Container Registry (GHCR) nằm trong GitHub Packages và có sẵn cho mọi tài khoản, không cần bật riêng. Workflow trong khóa học đăng nhập GHCR bằng `GITHUB_TOKEN` được cấp tự động, nên không cần tạo token cá nhân.
3. **Quyền ghi package**: bảo đảm repo cho phép workflow ghi packages ở **Settings > Actions > General > Workflow permissions**, hoặc khai báo `permissions: packages: write` trong workflow.
4. Nếu sau này cần đăng nhập GHCR thủ công, tạo Personal Access Token (classic) với quyền `write:packages`, lưu trong biến môi trường hoặc password manager, tuyệt đối không commit.

**Kiểm tra bạn đúng khi:** tab **Actions** của repo hiển thị bình thường (không báo bị vô hiệu hóa), và sau lần chạy workflow đầu tiên có image xuất hiện ở mục **Packages** bên phải trang repo.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Permission denied (publickey)` khi `ssh -T` hoặc `git push` | Chưa thêm khóa công khai vào GitHub, hoặc dùng sai khóa | In lại `cat ~/.ssh/id_ed25519.pub`, thêm vào GitHub. Debug bằng `ssh -vT git@github.com` |
| `fatal: Authentication failed` khi push bằng HTTPS | Nhập mật khẩu tài khoản thay vì đăng nhập đúng cách | Dùng `gh auth login` hoặc chuyển sang SSH key (cách A) |
| `git commit` báo `Please tell me who you are` | Chưa cấu hình `user.name` và `user.email` | Làm lại mục 3 |
| `git clone` báo `Repository not found` | Sai username hoặc tên repo, hoặc repo của bạn đang Private và chưa đăng nhập | Kiểm tra chính tả địa chỉ, và đặt `devops-labs` thành Public ở **Settings** của repo |
| `fatal: destination path ... already exists` | Thư mục đích đã có | Đổi tên thư mục đích, hoặc vào thư mục đó và dùng `git pull` thay vì clone lại |

## Đi tiếp

- Quay lại [Hướng dẫn cài đặt môi trường](setup-guide.md).
- Mẫu hỏi mentor khi kẹt và mục "Git trong 10 phút": [Bắt đầu từ đây](../curriculum/getting-started.md).
- Lỗi khác về Git và SSH: [Xử lý sự cố cài đặt](troubleshooting-setup.md#git).
