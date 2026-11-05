# Tài khoản GitHub và repo devops-labs

Trang này hướng dẫn các thao tác liên quan đến GitHub: tạo tài khoản, tạo repository nộp bài `devops-labs`, đăng nhập từ terminal, tải repository giáo trình về máy và bật các tính năng cần cho các buổi CI/CD. Thực hiện theo đúng thứ tự; mỗi bước đều nêu kết quả mong đợi.

> **Tóm tắt:** Tạo tài khoản GitHub và bật 2FA, tạo repository devops-labs ở chế độ Public, cấu hình git, đăng nhập bằng SSH key hoặc gh, sau đó clone repository giáo trình vào ~/devops-course.

::: tip Cần gì và khi nào
- **Trước Buổi 01** (cả phần chuẩn bị khoảng 30 phút, mục 1 và 2 chiếm khoảng 8 phút): mục 1 (tài khoản) và mục 2 (repository `devops-labs`). Việc nộp bài thực hiện bằng cách upload trên web, chưa cần terminal.
- **Buổi 02**: làm mục 3 (cấu hình git), mục 4 (đăng nhập) và mục 5 (clone repository giáo trình) trong Ubuntu.
- **Buổi 06 trở đi**: sử dụng thành thạo push và Pull Request.
- **Buổi 18**: mục 6 (Actions, Packages, GHCR).

Người học chưa quen với dòng lệnh nên đọc [Terminal 101](terminal-101.md) trước (khoảng 10 phút cho phần cần ở buổi 01). Cách cài Git: xem [Hướng dẫn cài đặt môi trường](setup-guide.md#can-ngay-tuan-1).
:::

## 1. Tạo tài khoản GitHub

1. Truy cập https://github.com/signup và nhập email, mật khẩu, tên người dùng (username). Username xuất hiện trong địa chỉ repository, vì vậy nên chọn tên nghiêm túc và không có dấu.
2. Xác minh email theo thư do GitHub gửi.
3. Bật xác thực hai lớp (2FA): **Settings > Password and authentication > Two-factor authentication**. Làm theo hướng dẫn và lưu mã khôi phục ở nơi an toàn.

**Kiểm tra:** kết quả đúng khi trang https://github.com/ hiển thị tên tài khoản ở góc phải và trang **Settings > Password and authentication** báo 2FA đã bật.

## 2. Tạo repo devops-labs (Public)

Repository `devops-labs` là nơi nộp bài trong suốt khóa học: mỗi buổi có một thư mục `lab-XX` chứa README, evidence và report.

1. Trên GitHub, chọn **New repository**.
2. **Repository name**: `devops-labs` (đúng chính tả, chữ thường).
3. Chọn **Public**.
4. Chọn **Add a README file**, rồi chọn **Create repository**.

::: tip Vì sao Public
Khóa học dùng GitHub Pages và GitHub Container Registry (GHCR) miễn phí, và hai dịch vụ này chỉ miễn phí đầy đủ với repository Public. Vì vậy không được commit bí mật vào repository, gồm mật khẩu, token và khóa riêng SSH. Nếu đã commit bí mật, bí mật đó được coi là đã lộ và phải tạo lại.
:::

**Kiểm tra:** kết quả đúng khi địa chỉ `https://github.com/TEN-GITHUB/devops-labs` mở được cả khi đã đăng xuất (hoặc mở bằng cửa sổ ẩn danh) và có nhãn **Public** cạnh tên repository.

Ở buổi 01, việc nộp bài dùng nút **Add file > Upload files** trên trang repository: kéo thả thư mục `lab-01` rồi chọn **Commit changes**. Cách nộp bằng dòng lệnh: xem mục [Git trong 10 phút](../curriculum/how-to-learn.md#git-10-phut).

## 3. Cấu hình git trên máy

Thực hiện trong Git Bash (khi cần cấu hình sớm, trước khi cài WSL) hoặc trong Ubuntu (từ Buổi 02). Git trong Ubuntu có cấu hình riêng, vì vậy cần chạy lại các lệnh này ở đó. Thay tên và email bằng thông tin của người học, dùng đúng email đã đăng ký GitHub (hoặc email `noreply` trong **Settings > Emails**):

```bash
git config --global user.name "Họ Tên"
git config --global user.email "email-dang-ky-github@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
```

**Kiểm tra:** kết quả đúng khi lệnh sau in ra đúng tên và email đã cấu hình:

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

Để `git push` được lên repository cá nhân, git cần xác định danh tính người dùng. Có hai cách đăng nhập, cả hai đều thực hiện trong Ubuntu; chỉ cần hoàn tất một trong hai.

### Cách A: SSH key (khuyến nghị)

SSH key gồm hai file: khóa riêng (phải giữ bí mật) và khóa công khai (đăng ký với GitHub). Ví dụ so sánh: khóa công khai giống ổ khóa gắn trên GitHub, và chỉ khóa riêng mới mở được ổ khóa đó.

Tạo khóa:

```bash
ssh-keygen -t ed25519 -C "email-dang-ky-github@example.com"
```

Nhấn Enter để chấp nhận đường dẫn mặc định và nên đặt passphrase (mật khẩu bảo vệ khóa). Sau đó in khóa công khai:

```bash
cat ~/.ssh/id_ed25519.pub
```

Sao chép toàn bộ dòng (bắt đầu bằng `ssh-ed25519`) vào GitHub tại **Settings > SSH and GPG keys > New SSH key**, đặt tên gợi nhớ (ví dụ `WSL laptop`), dán vào ô Key rồi chọn **Add SSH key**. Kiểm tra kết nối:

```bash
ssh -T git@github.com
```

Kết quả mong đợi (lần đầu hỏi xác nhận fingerprint, gõ `yes`):

```text
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

::: warning Chỉ chia sẻ file .pub
Chỉ đăng ký file `.pub` với GitHub. Không gửi, chụp màn hình hoặc commit file `id_ed25519` (khóa riêng). Nếu khóa riêng bị lộ, cần xóa khóa đó trên GitHub và tạo cặp khóa mới.
:::

Khi gặp `Permission denied (publickey)`, xem [Xử lý sự cố cài đặt](troubleshooting-setup.md#ssh-github).

### Cách B: GitHub CLI hoặc Git Credential Manager

**GitHub CLI (`gh`)** cho phép đăng nhập qua trình duyệt mà không cần tự tạo khóa. Cài đặt theo hướng dẫn chính thức cho Debian/Ubuntu: https://github.com/cli/cli/blob/trunk/docs/install_linux.md. Sau đó:

```bash
gh auth login
gh auth status
```

Chọn GitHub.com, giao thức HTTPS (đơn giản nhất) hoặc SSH, rồi đăng nhập qua trình duyệt. Kết quả mong đợi của lệnh `gh auth status`:

```text
github.com
  ✓ Logged in to github.com account TEN-GITHUB
```

Để git dùng thông tin đăng nhập của `gh` khi push qua HTTPS, chạy lệnh:

```bash
gh auth setup-git
```

`gh` cũng cho phép tạo Pull Request và xem log Actions ngay trong terminal.

**Git Credential Manager (GCM)** đi kèm Git for Windows, tự mở trình duyệt để đăng nhập ở lần push đầu tiên và ghi nhớ thông tin đăng nhập. Khi dùng git từ PowerShell, chỉ cần chạy `git push` và làm theo cửa sổ hiện ra. Từ trong WSL, git có thể dùng GCM của Windows (đường dẫn phụ thuộc vào máy; xem tài liệu của GCM nếu khác):

```bash
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
```

::: warning Không dán token vào lệnh
Khi được hỏi "Password", GitHub không chấp nhận mật khẩu tài khoản mà yêu cầu token. Không dán token vào dòng lệnh hoặc vào file trong repository, vì token sẽ nằm trong lịch sử lệnh và có thể bị commit. Dùng `gh auth login` hoặc SSH key để tránh phải xử lý token thủ công.
:::

## 5. Clone repo giáo trình {#clone-repo-giao-trinh}

Repository giáo trình chứa starter project, template và script kiểm tra môi trường. Người học chỉ đọc và chạy, không push lên repository này. Clone vào thư mục `~/devops-course` trong Ubuntu:

```bash
cd ~
git clone https://github.com/TienNHM/devops-course.git ~/devops-course
```

**Kiểm tra:** kết quả đúng khi lệnh sau

```bash
ls ~/devops-course
```

hiển thị các thư mục như `labs`, `starter-project`, `resources`, `templates`. Chạy thử script kiểm tra môi trường:

```bash
cd ~/devops-course
bash resources/check-env.sh 2
```

Khi giáo trình có cập nhật, lấy bản mới bằng lệnh:

```bash
cd ~/devops-course
git pull
```

Repository cá nhân `devops-labs` được clone riêng vào `~/devops-labs`, không đặt chung với `devops-course`:

```bash
git clone git@github.com:TEN-GITHUB/devops-labs.git ~/devops-labs
```

Thay `TEN-GITHUB` bằng username GitHub của người học. Khi dùng cách đăng nhập HTTPS (cách B), thay địa chỉ bằng `https://github.com/TEN-GITHUB/devops-labs.git`.

## 6. Bật Actions, Packages và GHCR (khi tới buổi 18)

Phần này chưa cần thực hiện ở tuần 1. Khi bắt đầu phần CI/CD:

1. **Actions**: trong repository `devops-labs`, mở tab **Actions**. Nếu GitHub yêu cầu, chọn cho phép chạy workflow. Kiểm tra tại **Settings > Actions > General** rằng Actions đang được bật cho repository.
2. **Packages và GHCR**: GitHub Container Registry (GHCR) nằm trong GitHub Packages và có sẵn cho mọi tài khoản, không cần bật riêng. Workflow trong khóa học đăng nhập GHCR bằng `GITHUB_TOKEN` được cấp tự động, do đó không cần tạo token cá nhân.
3. **Quyền ghi package**: bảo đảm repository cho phép workflow ghi packages tại **Settings > Actions > General > Workflow permissions**, hoặc khai báo `permissions: packages: write` trong workflow.
4. Khi cần đăng nhập GHCR thủ công, tạo Personal Access Token (classic) với quyền `write:packages` và lưu trong biến môi trường hoặc password manager, không commit token.

**Kiểm tra:** kết quả đúng khi tab **Actions** của repository hiển thị bình thường (không báo bị vô hiệu hóa) và sau lần chạy workflow đầu tiên có image xuất hiện ở mục **Packages** bên phải trang repository.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Permission denied (publickey)` khi `ssh -T` hoặc `git push` | Chưa thêm khóa công khai vào GitHub, hoặc dùng sai khóa | In lại khóa bằng `cat ~/.ssh/id_ed25519.pub` và thêm vào GitHub. Chẩn đoán bằng `ssh -vT git@github.com` |
| `fatal: Authentication failed` khi push bằng HTTPS | Nhập mật khẩu tài khoản thay vì dùng cách đăng nhập hợp lệ | Dùng `gh auth login` hoặc chuyển sang SSH key (cách A) |
| `git commit` báo `Please tell me who you are` | Chưa cấu hình `user.name` và `user.email` | Làm lại mục 3 |
| `git clone` báo `Repository not found` | Sai username hoặc tên repository, hoặc repository đang ở chế độ Private và chưa đăng nhập | Kiểm tra chính tả địa chỉ và đặt `devops-labs` thành Public tại **Settings** của repository |
| `fatal: destination path ... already exists` | Thư mục đích đã có | Đổi tên thư mục đích, hoặc vào thư mục đó và dùng `git pull` thay vì clone lại |

## Đi tiếp

- Quay lại [Hướng dẫn cài đặt môi trường](setup-guide.md).
- Mẫu câu hỏi khi gặp khó khăn và mục "Git trong 10 phút": [Cách học khóa này](../curriculum/how-to-learn.md).
- Lỗi khác về Git và SSH: [Xử lý sự cố cài đặt](troubleshooting-setup.md#git).
