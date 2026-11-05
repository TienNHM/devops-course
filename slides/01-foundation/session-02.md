# Slide Ngày 01 – Môi trường Linux và repo devops-labs

> **Tóm tắt:** Dựng môi trường Linux thật trên Windows 11 bằng WSL2 Ubuntu, VS Code, Git và SSH key GitHub, clone repo `devops-labs` và push file đầu tiên để chứng minh SSH key chạy.

## Slide 1: Hôm nay bạn làm ra gì

**Cuối ngày:** Ubuntu chạy trên WSL2, VS Code mở thẳng vào Ubuntu, SSH key đăng nhập được GitHub, và `~/devops-labs` đã có một commit của bạn trên GitHub.

**Cần có:** Windows 11, quyền Administrator, trống 20 GB ổ đĩa, VS Code, tài khoản GitHub và repo `devops-labs` ở chế độ Public ([hướng dẫn](../../resources/setup-github.md)).

**Thời gian:** 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết và hỏi đáp.

::: details Ghi chú cho mentor
- Cài WSL2 lần đầu kèm khởi động lại mất khoảng 30 phút, nên nhắc cài trước giờ học nếu có thể.
- Hỏi nhanh: máy ai đang là Windows 10, Windows 11, macOS? Máy macOS làm theo hướng dẫn riêng trong setup-guide.
- Cài đặt chi tiết từng màn hình nằm ở [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md).
:::

---

## Slide 2: Bài toán thật: 20 máy, 20 môi trường

![Cùng lệnh docker compose up, ba máy cho ba kết quả khác nhau](/slides/img/s02-problem.svg)

- CLB có 20 thành viên: Windows 10, Windows 11, vài máy macOS.
- Server thật gần như luôn chạy Linux.
- Hôm nay cả lớp dựng chung một môi trường Linux ngay trên laptop.

::: details Ghi chú cho mentor
- Cùng lệnh `docker compose up`, người chạy được, người báo `command not found`, người bị `\r: command not found` vì script có xuống dòng kiểu Windows.
- Không kể lịch sử WSL, vào thẳng việc.
:::

---

## Slide 3: Đường đi của code trong 10 ngày

![Quy trình tự động: push, build và test, đóng gói image, registry, deploy, kiểm tra](/slides/img/s01-auto-flow.svg)

- Mỗi ô trong hình sẽ được bạn làm thật ở một ngày sau.
- Hôm nay chỉ dựng nền: Linux, Git, SSH.

::: details Ghi chú cho mentor
- Giữ phần giới thiệu này khoảng 10 phút, chỉ hỏi "bước nào bạn từng làm bằng tay?".
- Chưa cần giải thích từng ô. Đừng sa vào lý thuyết DevOps.
:::

---

## Slide 4: Mỗi ngày làm ra một mảnh

- **Ngày 1 đến 3:** Linux, Git, đưa project Club vào repo của bạn.
- **Ngày 4 đến 8:** chạy app bằng container Docker và Compose.
- **Ngày 9 và 10:** CI tự test mỗi lần push, rồi tự publish image.
- DevOps là làm cho cả đường này tự động và lặp lại được.

::: details Ghi chú cho mentor
- Một slide, tối đa 1 phút.
- Nhấn mạnh: một project duy nhất (Club) đi suốt 10 ngày.
:::

---

## Slide 5: Bước 1 (30 phút): Cài WSL2 và Ubuntu

- WSL2 cho bạn một Linux thật chạy ngay trong Windows.
- Làm theo mục 2 (Bật ảo hóa) và mục 3 (WSL2 và Ubuntu 24.04) của [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- Cài xong, khởi động lại Windows. Cửa sổ Ubuntu tự mở để bạn tạo tài khoản Linux.

Username viết thường, không dấu. Gõ mật khẩu không hiện ký tự là bình thường.

::: details Ghi chú cho mentor
- Lỗi hay gặp nhất ở bước này là ảo hóa chưa bật trong BIOS, xem slide lỗi thường gặp.
- Ai cài xong sớm thì giúp bạn bên cạnh.
:::

---

## Slide 6: Bước 1: Kiểm tra WSL2 và Ubuntu

Trong PowerShell:

```powershell
wsl --list --verbose
```

```text
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

Trong Ubuntu:

```bash
lsb_release -a
```

**Kiểm tra: bạn đúng khi** VERSION là 2 và `lsb_release -a` hiện `Ubuntu 24.04.x LTS`.

::: details Ghi chú cho mentor
- Nếu VERSION là 1: `wsl --set-version Ubuntu-24.04 2`.
:::

---

## Slide 7: Bước 2 (10 phút): Mã nguồn nằm trong ~

![Linux ext4 trong ~ nhanh; ổ Windows dưới /mnt/c chậm và hay lỗi](/slides/img/s02-filesystems.svg)

Quy tắc cả khóa: code luôn ở `~` (ổ Linux), không ở `/mnt/c` (ổ Windows).

::: details Ghi chú cho mentor
- `/mnt/c` đi qua lớp mạng 9P nên chậm với nhiều file nhỏ (`npm install`, `git status`), còn hay sai quyền file và xuống dòng.
- Ổ Windows chỉ dùng để trao đổi file.
:::

---

## Slide 8: Bước 2: Mở VS Code trong Ubuntu

Cài extension "WSL" của Microsoft trong VS Code, rồi gõ trong Ubuntu:

```bash
cd ~
pwd
code .
uname -a
```

`pwd` in `/home/TEN_BAN`. `uname -a` chứa `microsoft-standard-WSL2`.

**Kiểm tra: bạn đúng khi** `pwd` bắt đầu bằng `/home/` và góc dưới trái VS Code ghi "WSL: Ubuntu-24.04".

::: details Ghi chú cho mentor
- `code: command not found`: xem slide lỗi thường gặp.
- Chỉ cho cả lớp thấy nhãn xanh ở góc dưới trái.
:::

---

## Slide 9: Bước 3 (10 phút): Cấu hình Git

- Git gắn tên và email vào mỗi commit, nên phải khai báo trước.
- Dùng đúng email đã đăng ký GitHub.
- `core.autocrlf input` tránh lỗi `\r` trong script shell.

::: details Ghi chú cho mentor
- `apt update` làm mới danh sách gói, `apt install` mới cài. Luôn chạy theo thứ tự đó.
- CRLF là xuống dòng kiểu Windows, LF là kiểu Linux. Chỉ cần nhớ: đặt `input` là đủ.
:::

---

## Slide 10: Bước 3: Lệnh cấu hình Git

```bash
sudo apt update
sudo apt install -y git
git config --global user.name "Ho Ten Cua Ban"
git config --global user.email "email-github@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global --list
```

**Kiểm tra: bạn đúng khi** `--list` có `user.name`, `user.email` thật của bạn và `core.autocrlf=input`.

::: details Ghi chú cho mentor
- Nhắc thay tên và email bằng của mình, giữ nguyên nháy kép.
:::

---

## Slide 11: Bước 4 (15 phút): SSH key là chìa khóa và ổ khóa

![Private key ở lại máy, public key dán lên GitHub](/slides/img/s02-ssh-keys.svg)

Nhờ SSH key, `git push` không cần nhập mật khẩu.

::: details Ghi chú cho mentor
- Private key `~/.ssh/id_ed25519` ở lại máy, không chia sẻ, không commit. Public key `.pub` dán lên GitHub.
- Nên đặt passphrase khi được hỏi.
:::

---

## Slide 12: Bước 4: Tạo SSH key

```bash
ssh-keygen -t ed25519 -C "email-github@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Nhấn Enter để nhận đường dẫn mặc định. Kết quả: `Identity added: ...` rồi một dòng bắt đầu bằng `ssh-ed25519 AAAA...`.

**Kiểm tra: bạn đúng khi** thấy dòng `ssh-ed25519 AAAA...`. Chỉ copy file `.pub`.

::: details Ghi chú cho mentor
- ssh-agent giữ sẵn khóa đã mở và chỉ sống trong phiên terminal hiện tại. Mở terminal mới thì chạy lại `eval` và `ssh-add`.
:::

---

## Slide 13: Bước 4: Dán public key lên GitHub

1. GitHub, **Settings**, **SSH and GPG keys**, **New SSH key**.
2. Title: `WSL2 laptop`. Loại: **Authentication Key**.
3. Dán dòng `ssh-ed25519 AAAA...` vừa copy, rồi **Add SSH key**.

::: details Ghi chú cho mentor
- Cẩn thận: dán đúng file `.pub`, không bao giờ dán file `id_ed25519`.
- Đi vòng quanh lớp xem mỗi người đã thấy key trong danh sách.
:::

---

## Slide 14: Bước 4: Thử kết nối GitHub

```bash
ssh -T git@github.com
```

Lần đầu SSH hỏi fingerprint: gõ `yes`.

```text
Hi TEN_GITHUB! You've successfully authenticated,
but GitHub does not provide shell access.
```

**Kiểm tra: bạn đúng khi** thấy dòng "successfully authenticated".

::: details Ghi chú cho mentor
- Mã thoát 1 của lệnh này là bình thường, không phải lỗi.
- `Permission denied (publickey)`: xem slide lỗi thường gặp.
:::

---

## Slide 15: Bước 5 (5 phút): Clone devops-labs

`devops-labs` là repo cá nhân của bạn. Repo giáo trình chứa `starter-project/` (app Club) và script kiểm tra máy.

```bash
cd ~
git clone git@github.com:TEN_GITHUB/devops-labs.git ~/devops-labs
git clone https://github.com/TienNHM/devops-course.git ~/devops-course
ls ~/devops-labs ~/devops-course
```

Thay `TEN_GITHUB` bằng username GitHub của bạn.

::: details Ghi chú cho mentor
- Thư mục đã có thì chạy `git pull` trong đó, đừng clone lại.
- `devops-labs` là repo Public để sau này CI và registry chạy được.
:::

---

## Slide 16: Bước 5: Kiểm tra bản clone

```bash
cd ~/devops-labs
git remote -v
```

```text
origin  git@github.com:TEN_GITHUB/devops-labs.git (fetch)
origin  git@github.com:TEN_GITHUB/devops-labs.git (push)
```

**Kiểm tra: bạn đúng khi** hai dòng `origin` bắt đầu bằng `git@github.com:` và `~/devops-course` có `starter-project`.

::: details Ghi chú cho mentor
- Nếu remote dạng `https://...` thì bạn đã clone bằng HTTPS: clone lại bằng địa chỉ SSH.
:::

---

## Slide 17: Bước 6 (5 phút): Chạy script check-env

Script chỉ đọc thông tin máy, không cài hay sửa gì. Số `2` là tham số của script, cứ gõ đúng.

```bash
cd ~/devops-course
bash resources/check-env.sh 2 > ~/check-env.txt 2>&1
echo "exit code: $?" >> ~/check-env.txt
cat ~/check-env.txt
```

**Kiểm tra: bạn đúng khi** WSL, git, curl là `[ OK ]` và dòng cuối là `exit code: 0`.

::: details Ghi chú cho mentor
- Docker và kubectl chỉ hiện `[ DE SAU ]` vì sẽ cài ở ngày sau, không phải lỗi.
- Thấy `[ THIEU ]` ở git hoặc curl thì cài theo gợi ý trên dòng đó, ví dụ `sudo apt install -y curl`, rồi chạy lại.
:::

---

## Slide 18: Bước 7 (10 phút): Push commit đầu tiên

Thêm một dòng vào `README.md` của repo `devops-labs`, rồi đẩy lên GitHub. Nếu push chạy, SSH key của bạn hoạt động.

```bash
cd ~/devops-labs
echo "Ngày 1: WSL2, Git và SSH đã sẵn sàng." >> README.md
git add README.md
git commit -m "Update README after day 1"
git push -u origin HEAD
```

::: details Ghi chú cho mentor
- `>>` ghi nối thêm vào cuối file, `>` sẽ ghi đè. Ngày 2 sẽ học kỹ.
- Chưa cần hiểu `git add` và `git commit`: Ngày 3 sẽ học Git bài bản.
:::

---

## Slide 19: Bước 7: Kiểm tra trên GitHub

```text
main -> main
```

Mở `https://github.com/TEN_GITHUB/devops-labs` trên trình duyệt.

**Kiểm tra: bạn đúng khi** `git push` báo `main -> main` và README trên GitHub có dòng "Ngày 1".

::: details Ghi chú cho mentor
- Cuối ngày để mỗi bạn mở trang GitHub và cho mentor xem commit.
- Nhắc lại: không có private key, mật khẩu hay token nào trong repo.
:::

---

## Slide 20: Lỗi thường gặp: cài WSL

| Triệu chứng | Cách xử lý |
| --- | --- |
| `0x80370102` khi `wsl --install` | Bật Intel VT-x hoặc AMD SVM trong BIOS, khởi động lại |
| VERSION là 1 trong `wsl --list --verbose` | `wsl --set-version Ubuntu-24.04 2` |
| `code: command not found` | Cài VS Code (chọn Add to PATH), `wsl --shutdown`, mở lại Ubuntu |

::: details Ghi chú cho mentor
- Kiểm tra ảo hóa: Task Manager, tab Performance, CPU, dòng Virtualization. Nếu Disabled thì vào BIOS/UEFI.
- `wsl --shutdown` tắt mọi distro và mất việc chưa lưu: lưu file và đóng VS Code trước khi chạy.
:::

---

## Slide 21: Lỗi thường gặp: Permission denied (publickey)

`ssh -T git@github.com` báo `Permission denied (publickey)`.

- **Nguyên nhân:** chưa dán public key lên GitHub, hoặc key chưa nạp vào agent.
- **Sửa:** dán đúng file `.pub`, chạy `ssh-add -l`, xem key nào được thử bằng `ssh -vT git@github.com`.
- Mở terminal mới: chạy lại `eval "$(ssh-agent -s)"` và `ssh-add`.

::: details Ghi chú cho mentor
- `UNPROTECTED PRIVATE KEY FILE`: quyền file quá rộng, chạy `chmod 700 ~/.ssh` và `chmod 600 ~/.ssh/id_ed25519`, rồi `ssh-add ~/.ssh/id_ed25519`.
- Port 22 timeout: mạng chặn, thử SSH qua cổng 443 theo GitHub Docs.
:::

---

## Slide 22: Lỗi thường gặp: ký tự \r trong script

`bash\r: No such file or directory` hoặc `\r: command not found`.

- **Nguyên nhân:** script lưu với xuống dòng kiểu Windows (CRLF).
- **Sửa:** `sed -i 's/\r$//' file.sh` và đặt `git config --global core.autocrlf input`.

::: details Ghi chú cho mentor
- `git status` hoặc `npm install` chậm: repo đang nằm ở `/mnt/c`, chuyển vào `~`.
:::

---

## Slide 23: Tự kiểm tra

1. Vì sao code nên nằm trong `~` thay vì `/mnt/c/Users/...`?
2. Public key và private key khác nhau thế nào, cái nào được chia sẻ?
3. `Permission denied (publickey)` dù đã tạo key: kể ba điểm kiểm tra đầu tiên.

::: details Ghi chú cho mentor
- 1: Filesystem Linux nhanh hơn nhiều với nhiều file nhỏ, chmod đúng, ít lỗi xuống dòng. `/mnt/c` đi qua lớp trung gian nên chậm.
- 2: Public key (`.pub`) đặt lên GitHub, chia sẻ được. Private key ở lại máy, không bao giờ chia sẻ hay commit.
- 3: Đã dán đúng public key lên GitHub chưa; key đã nạp vào agent chưa (`ssh-add -l`); `ssh -vT git@github.com` xem key nào được thử và quyền file có đúng 600 không.
:::

---

## Slide 24: Tiếp theo

Ngày 2: dùng Linux CLI để đọc project Club và một file log: [Slide Ngày 02](session-03.md).

---

## Slide 25: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [WSL documentation](https://learn.microsoft.com/en-us/windows/wsl/): cài và dùng Linux trên Windows.
- **Tài liệu chính thức:** [VS Code Remote với WSL](https://code.visualstudio.com/docs/remote/wsl): viết code trong WSL bằng VS Code.
- **Tài liệu chính thức:** [First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup): cấu hình Git lần đầu đúng cách.
- **Best practice:** [Set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment): gợi ý cấu hình môi trường dev gọn gàng.
- **Best practice:** [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh): dùng SSH key an toàn thay cho mật khẩu.
