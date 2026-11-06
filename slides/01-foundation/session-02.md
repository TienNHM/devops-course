# Slide Ngày 01 – Môi trường Linux và repo devops-labs

> **Tóm tắt:** Ngày 1 thiết lập môi trường Linux thật trên Windows 11 bằng WSL2 Ubuntu, VS Code, Git và SSH key GitHub. Sau đó clone repository `devops-labs` và push file đầu tiên để xác nhận SSH key hoạt động.

## Hôm nay làm ra gì

**Cuối ngày:** Ubuntu chạy trên WSL2, SSH key xác thực được với GitHub, và `~/devops-labs` có một commit của người học.

**Cần có:** Windows 11, quyền Administrator, 20 GB ổ đĩa trống, tài khoản GitHub ([hướng dẫn](../../resources/setup-github.md)).

::: details Ghi chú cho mentor
- Cuối ngày, VS Code cũng mở trực tiếp trong Ubuntu.
- Cần có thêm: VS Code, và repository `devops-labs` ở chế độ Public.
- Thời gian: 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết và hỏi đáp.
- Cài WSL2 lần đầu kèm khởi động lại mất khoảng 30 phút, nên yêu cầu người học cài trước giờ học nếu có thể.
- Khảo sát nhanh hệ điều hành đang dùng: Windows 10, Windows 11 hay macOS. Máy macOS làm theo hướng dẫn riêng trong setup-guide.
- Cài đặt chi tiết từng màn hình nằm ở [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md).
:::

---

## Bài toán thật: 20 máy, 20 môi trường

![Cùng lệnh docker compose up, ba máy cho ba kết quả khác nhau](/slides/img/s02-problem.svg)

- CLB có 20 thành viên, dùng Windows 10, Windows 11 và một số máy macOS.
- Server thật gần như luôn chạy Linux.
- Vì vậy, cả lớp dựng chung một môi trường Linux ngay trên laptop.

::: details Ghi chú cho mentor
- Cùng lệnh `docker compose up`, có máy chạy được, có máy báo `command not found`, có máy báo `\r: command not found` vì script có xuống dòng kiểu Windows.
- Không trình bày lịch sử WSL, chuyển thẳng vào thực hành.
:::

---

## Đường đi của code trong 10 ngày

![Quy trình tự động: push, build và test, đóng gói image, registry, deploy, kiểm tra](/slides/img/s01-auto-flow.svg)

- Mỗi ô trong hình được thực hành ở một ngày tiếp theo.
- Ngày 1 chỉ thiết lập nền tảng: Linux, Git và SSH.

::: details Ghi chú cho mentor
- Giữ phần giới thiệu này khoảng 10 phút. Có thể hỏi: bước nào trong hình từng được làm thủ công?
- Chưa cần giải thích từng ô. Không đi sâu vào lý thuyết DevOps.
:::

---

## Mỗi ngày làm ra một phần của hệ thống

- **Ngày 1 đến 3:** Linux, Git, project Club vào repository.
- **Ngày 4 đến 8:** container Docker và Compose.
- **Ngày 9 và 10:** CI tự động kiểm thử mỗi lần push, rồi publish image.

::: details Ghi chú cho mentor
- Ngày 1 đến 3: đưa project Club vào repository của người học.
- Ngày 4 đến 8: chạy ứng dụng bằng container Docker và Compose.
- Ngày 9 và 10: sau khi kiểm thử, CI tự động publish image.
- DevOps là việc tự động hóa toàn bộ quy trình này để kết quả lặp lại được.
- Một slide, tối đa 1 phút.
- Nhấn mạnh: một project duy nhất (Club) được dùng xuyên suốt 10 ngày.
:::

---

## Khái niệm: WSL

- **WSL** (Windows Subsystem for Linux) là tính năng của Windows cho phép chạy môi trường Linux trực tiếp trên Windows.
- Ví dụ trong dự án: Docker, Git và script của project Club chạy trong WSL2.

::: details Ghi chú cho mentor
- WSL không cần máy tính riêng.
- WSL2 chạy một nhân Linux thật trong máy ảo nhẹ, nên các công cụ Linux hoạt động đúng như trên server.
- Không cần giải thích kiến trúc ảo hóa. Chỉ cần người học hiểu rằng đây là Linux thật, không phải trình giả lập.
:::

---

## Khái niệm: Distribution và Ubuntu

- **Distribution** là một bản Linux hoàn chỉnh gồm nhân Linux, công cụ hệ thống và trình quản lý gói.
- Ví dụ trong dự án: **Ubuntu 24.04 LTS**, tên trong WSL là `Ubuntu-24.04`.

::: details Ghi chú cho mentor
- Distribution còn được gọi là bản phân phối.
- Có nhiều distribution khác nhau, và WSL cho phép cài một hoặc nhiều bản song song.
- LTS là phiên bản hỗ trợ dài hạn. Chỉ cần nêu một câu, không so sánh các distribution.
:::

---

## Bước 1 (30 phút): Cài WSL2 và Ubuntu

- Làm theo mục 2 (Bật ảo hóa) và mục 3 (WSL2 và Ubuntu 24.04) của [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- Sau khi cài xong, khởi động lại Windows. Cửa sổ Ubuntu tự mở để tạo tài khoản Linux.

Username viết thường, không dấu.

::: details Ghi chú cho mentor
- WSL2 cung cấp một môi trường Linux thật chạy ngay trong Windows.
- Khi nhập mật khẩu, terminal không hiện ký tự nào: đây là hành vi bình thường.
- Lỗi thường gặp nhất ở bước này là ảo hóa chưa bật trong BIOS, xem slide lỗi thường gặp.
- Người học cài xong sớm hỗ trợ người bên cạnh.
:::

---

## Khái niệm: Terminal và shell

- **Terminal** là cửa sổ nhập lệnh dạng văn bản; **shell** là chương trình bên trong terminal, đọc và thực thi lệnh.
- Ví dụ trong dự án: Ubuntu trên WSL2 dùng shell `bash`.

::: details Ghi chú cho mentor
- Trên server, thao tác chủ yếu thực hiện bằng shell vì thường không có giao diện đồ họa.
- Các lệnh `wsl`, `lsb_release`, `git` đều được gõ vào shell.
- PowerShell và bash là hai shell khác nhau: lệnh `wsl` gõ trong PowerShell, các lệnh còn lại gõ trong Ubuntu.
:::

---

## Bước 1: Kiểm tra WSL2 và Ubuntu

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

**Kiểm tra: kết quả đúng khi** VERSION là 2 và `lsb_release -a` hiện `Ubuntu 24.04.x LTS`.

::: details Ghi chú cho mentor
- Nếu VERSION là 1: `wsl --set-version Ubuntu-24.04 2`.
:::

---

## Bước 2 (10 phút): Mã nguồn nằm trong ~

![Linux ext4 trong ~ nhanh; ổ Windows dưới /mnt/c chậm và hay lỗi](/slides/img/s02-filesystems.svg)

Quy tắc áp dụng cả khóa: code luôn nằm trong `~` (ổ Linux), không nằm trong `/mnt/c` (ổ Windows).

::: details Ghi chú cho mentor
- `/mnt/c` đi qua lớp mạng 9P nên chậm với nhiều file nhỏ (`npm install`, `git status`), đồng thời dễ sai quyền file và xuống dòng.
- Ổ Windows chỉ dùng để trao đổi file.
:::

---

## Bước 2: Mở VS Code trong Ubuntu

Cài extension "WSL" của Microsoft trong VS Code, sau đó chạy trong Ubuntu:

```bash
cd ~
pwd
code .
uname -a
```

`pwd` in `/home/TEN_BAN`. `uname -a` chứa `microsoft-standard-WSL2`.

**Kiểm tra: kết quả đúng khi** `pwd` bắt đầu bằng `/home/` và góc dưới trái VS Code ghi "WSL: Ubuntu-24.04".

::: details Ghi chú cho mentor
- `code: command not found`: xem slide lỗi thường gặp.
- Chỉ cho cả lớp nhãn xanh ở góc dưới trái.
:::

---

## Khái niệm: Git, commit và repository

- **Git** là hệ thống quản lý phiên bản, lưu lịch sử thay đổi của mã nguồn dưới dạng các **commit** trong một **repository**.
- Ví dụ trong dự án: repository `devops-labs` chứa project Club của người học.

::: details Ghi chú cho mentor
- Repository (kho mã nguồn) là nơi chứa mã nguồn cùng lịch sử đó; `devops-labs` chứa toàn bộ project Club mà người học làm trong 10 ngày.
- Mỗi commit ghi lại tên và email của tác giả, nên thông tin này phải được khai báo trước.
- Ngày 3 mới học Git bài bản. Hôm nay chỉ cần nắm ba thuật ngữ: Git, commit, repository.
:::

---

## Bước 3 (10 phút): Cấu hình Git

- Cấu hình tên và email trước, vì Git gắn hai thông tin này vào mỗi commit.
- Dùng đúng email đã đăng ký GitHub.
- Tùy chọn `core.autocrlf input` ngăn lỗi ký tự `\r` trong script shell.

::: details Ghi chú cho mentor
- `apt update` làm mới danh sách gói, `apt install` mới cài gói. Luôn chạy theo thứ tự đó.
- CRLF là xuống dòng kiểu Windows, LF là kiểu Linux. Chỉ cần nhớ: đặt `input` là đủ.
:::

---

## Bước 3: Lệnh cấu hình Git

```bash
sudo apt update
sudo apt install -y git
git config --global user.name "Ho Ten Cua Ban"
git config --global user.email "email-github@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global --list
```

**Kiểm tra: kết quả đúng khi** `--list` có `user.name`, `user.email` thật của người học và `core.autocrlf=input`.

::: details Ghi chú cho mentor
- Nhắc thay tên và email bằng thông tin của mình, giữ nguyên dấu nháy kép.
:::

---

## Khái niệm: SSH key

- **SSH key** là cặp khóa gồm **private key** và **public key**, dùng để xác thực với máy từ xa mà không cần mật khẩu.
- Ví dụ trong dự án: `git push` đến GitHub không hỏi mật khẩu.

::: details Ghi chú cho mentor
- Private key không bao giờ được chia sẻ.
- Private key là khóa riêng, public key là khóa công khai.
- Public key được đăng ký trên GitHub. Private key luôn ở lại máy.
- Nhấn mạnh sự khác biệt: file `.pub` chia sẻ được, file không có đuôi `.pub` thì không.
:::

---

## Bước 4 (15 phút): Cơ chế của SSH key

![Private key ở lại máy, public key dán lên GitHub](/slides/img/s02-ssh-keys.svg)

GitHub dùng public key để kiểm tra rằng người gửi nắm giữ private key tương ứng.

::: details Ghi chú cho mentor
- Private key `~/.ssh/id_ed25519` ở lại máy, không chia sẻ, không commit. Public key `.pub` được dán lên GitHub.
- Nên đặt passphrase khi được hỏi.
:::

---

## Bước 4: Tạo SSH key

```bash
ssh-keygen -t ed25519 -C "email-github@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Nhấn Enter để nhận đường dẫn mặc định. Kết quả: `Identity added: ...` rồi một dòng bắt đầu bằng `ssh-ed25519 AAAA...`.

**Kiểm tra: kết quả đúng khi** hiện dòng `ssh-ed25519 AAAA...`. Chỉ sao chép file `.pub`.

::: details Ghi chú cho mentor
- ssh-agent giữ sẵn khóa đã mở và chỉ tồn tại trong phiên terminal hiện tại. Khi mở terminal mới, chạy lại `eval` và `ssh-add`.
:::

---

## Bước 4: Dán public key lên GitHub

1. GitHub, **Settings**, **SSH and GPG keys**, **New SSH key**.
2. Title: `WSL2 laptop`. Loại: **Authentication Key**.
3. Dán dòng `ssh-ed25519 AAAA...` vừa sao chép, sau đó chọn **Add SSH key**.

::: details Ghi chú cho mentor
- Lưu ý: dán đúng file `.pub`, tuyệt đối không dán file `id_ed25519`.
- Đi quanh lớp để kiểm tra mỗi người đã thấy key trong danh sách.
:::

---

## Bước 4: Thử kết nối GitHub

```bash
ssh -T git@github.com
```

Lần đầu, SSH hỏi xác nhận fingerprint: nhập `yes`.

```text
Hi TEN_GITHUB! You've successfully authenticated,
but GitHub does not provide shell access.
```

**Kiểm tra: kết quả đúng khi** có dòng "successfully authenticated".

::: details Ghi chú cho mentor
- Mã thoát 1 của lệnh này là bình thường, không phải lỗi.
- `Permission denied (publickey)`: xem slide lỗi thường gặp.
:::

---

## Khái niệm: Remote và clone

- **Remote** là bản sao repository trên máy chủ (ở đây là GitHub); **clone** là tạo bản sao đầy đủ của remote trên máy cục bộ.
- Ví dụ trong dự án: clone `devops-labs` và `devops-course`.

::: details Ghi chú cho mentor
- `devops-labs` là repository cá nhân, `devops-course` chứa `starter-project/`.
- Nhờ clone, mã nguồn và lịch sử có sẵn trên máy để làm việc, và có thể đồng bộ lại với remote bằng `git push` và `git pull`.
- Remote mặc định tên `origin`. Slide kiểm tra sau đó sẽ cho thấy tên này.
:::

---

## Bước 5 (5 phút): Clone devops-labs

`devops-labs` là repository cá nhân của người học. Repository giáo trình chứa `starter-project/` (app Club) và script kiểm tra máy.

```bash
cd ~
git clone git@github.com:TEN_GITHUB/devops-labs.git ~/devops-labs
git clone https://github.com/TienNHM/devops-course.git ~/devops-course
ls ~/devops-labs ~/devops-course
```

Thay `TEN_GITHUB` bằng username GitHub của người học.

::: details Ghi chú cho mentor
- Nếu thư mục đã tồn tại, chạy `git pull` trong đó, không clone lại.
- `devops-labs` là repository Public để CI và registry hoạt động được ở những ngày sau.
:::

---

## Bước 5: Kiểm tra bản clone

```bash
cd ~/devops-labs
git remote -v
```

```text
origin  git@github.com:TEN_GITHUB/devops-labs.git (fetch)
origin  git@github.com:TEN_GITHUB/devops-labs.git (push)
```

**Kiểm tra: kết quả đúng khi** hai dòng `origin` bắt đầu bằng `git@github.com:` và `~/devops-course` có `starter-project`.

::: details Ghi chú cho mentor
- Nếu remote có dạng `https://...` thì repository đã được clone bằng HTTPS: clone lại bằng địa chỉ SSH.
:::

---

## Bước 6 (5 phút): Chạy script check-env

Script chỉ đọc thông tin máy, không cài đặt hay sửa đổi gì. Số `2` là tham số của script và được giữ nguyên.

```bash
cd ~/devops-course
bash resources/check-env.sh 2 > ~/check-env.txt 2>&1
echo "exit code: $?" >> ~/check-env.txt
cat ~/check-env.txt
```

**Kiểm tra: kết quả đúng khi** WSL, git, curl hiện `[ OK ]` và dòng cuối là `exit code: 0`.

::: details Ghi chú cho mentor
- Docker và kubectl chỉ hiện `[ DE SAU ]` vì được cài ở ngày sau, đây không phải lỗi.
- Nếu git hoặc curl hiện `[ THIEU ]`, cài theo gợi ý trên dòng đó, ví dụ `sudo apt install -y curl`, rồi chạy lại.
:::

---

## Bước 7 (10 phút): Push commit đầu tiên

Thêm một dòng vào `README.md` của repository `devops-labs`, sau đó đẩy lên GitHub. Nếu lệnh push thành công, SSH key đang hoạt động đúng.

```bash
cd ~/devops-labs
echo "Ngày 1: WSL2, Git và SSH đã sẵn sàng." >> README.md
git add README.md
git commit -m "Update README after day 1"
git push -u origin HEAD
```

::: details Ghi chú cho mentor
- `>>` ghi nối thêm vào cuối file, `>` ghi đè. Ngày 2 sẽ học kỹ.
- Chưa cần hiểu `git add` và `git commit`: Ngày 3 sẽ học Git bài bản.
:::

---

## Bước 7: Kiểm tra trên GitHub

```text
main -> main
```

Mở `https://github.com/TEN_GITHUB/devops-labs` trên trình duyệt.

**Kiểm tra: kết quả đúng khi** `git push` báo `main -> main` và README trên GitHub có dòng "Ngày 1".

::: details Ghi chú cho mentor
- Cuối ngày, mỗi người học mở trang GitHub và cho mentor xem commit.
- Nhắc lại: repository không được chứa private key, mật khẩu hay token.
:::

---

## Lỗi thường gặp: cài WSL

| Triệu chứng | Cách xử lý |
| --- | --- |
| `0x80370102` | Bật VT-x hoặc SVM trong BIOS |
| VERSION là 1 | `wsl --set-version Ubuntu-24.04 2` |
| `code: command not found` | Cài VS Code (Add to PATH), `wsl --shutdown` |

::: details Ghi chú cho mentor
- `0x80370102` xuất hiện khi `wsl --install`: bật Intel VT-x hoặc AMD SVM trong BIOS rồi khởi động lại. VERSION là 1 trong `wsl --list --verbose` thì chạy lệnh nêu trên. Với `code: command not found`: cài VS Code (chọn Add to PATH), chạy `wsl --shutdown`, mở lại Ubuntu.
- Kiểm tra ảo hóa: Task Manager, tab Performance, CPU, dòng Virtualization. Nếu là Disabled thì vào BIOS/UEFI để bật.
- `wsl --shutdown` tắt mọi distribution và làm mất thay đổi chưa lưu: cần lưu file và đóng VS Code trước khi chạy.
:::

---

## Lỗi thường gặp: Permission denied (publickey)

`ssh -T git@github.com` báo `Permission denied (publickey)`.

- **Nguyên nhân:** public key chưa được dán lên GitHub, hoặc key chưa được nạp vào agent.
- **Cách sửa:** dán đúng file `.pub`, chạy `ssh-add -l`, xem key nào được thử bằng `ssh -vT git@github.com`.
- Khi mở terminal mới: chạy lại `eval "$(ssh-agent -s)"` và `ssh-add`.

::: details Ghi chú cho mentor
- `UNPROTECTED PRIVATE KEY FILE`: quyền file quá rộng, chạy `chmod 700 ~/.ssh` và `chmod 600 ~/.ssh/id_ed25519`, rồi `ssh-add ~/.ssh/id_ed25519`.
- Port 22 bị timeout: mạng chặn cổng này, thử SSH qua cổng 443 theo GitHub Docs.
:::

---

## Lỗi thường gặp: ký tự \r trong script

`bash\r: No such file or directory` hoặc `\r: command not found`.

- **Nguyên nhân:** script được lưu với xuống dòng kiểu Windows (CRLF).
- **Cách sửa:** `sed -i 's/\r$//' file.sh` và đặt `git config --global core.autocrlf input`.

::: details Ghi chú cho mentor
- `git status` hoặc `npm install` chạy chậm: repository đang nằm ở `/mnt/c`, cần chuyển vào `~`.
:::

---

## Tự kiểm tra

1. Vì sao code nên nằm trong `~` thay vì `/mnt/c/Users/...`?
2. Public key và private key khác nhau thế nào, khóa nào được chia sẻ?
3. Khi gặp `Permission denied (publickey)` dù đã tạo key, ba điểm cần kiểm tra đầu tiên là gì?

::: details Ghi chú cho mentor
- 1: Filesystem Linux nhanh hơn nhiều với số lượng lớn file nhỏ, phân quyền đúng, ít lỗi xuống dòng. `/mnt/c` đi qua lớp trung gian nên chậm.
- 2: Public key (`.pub`) được đặt lên GitHub và chia sẻ được. Private key ở lại máy, không bao giờ chia sẻ hay commit.
- 3: Đã dán đúng public key lên GitHub chưa; key đã nạp vào agent chưa (`ssh-add -l`); `ssh -vT git@github.com` cho biết key nào được thử, và quyền file có đúng 600 không.
:::

---

## Tiếp theo

Ngày 2: dùng Linux CLI để đọc project Club và một file log: [Slide Ngày 02](session-03.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [WSL documentation](https://learn.microsoft.com/en-us/windows/wsl/): cài và dùng Linux trên Windows.
- **Tài liệu chính thức:** [VS Code Remote với WSL](https://code.visualstudio.com/docs/remote/wsl): viết code trong WSL bằng VS Code.
- **Tài liệu chính thức:** [First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup): cấu hình Git lần đầu đúng cách.
- **Best practice:** [Set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment): gợi ý cấu hình môi trường dev gọn gàng.
- **Best practice:** [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh): dùng SSH key an toàn thay cho mật khẩu.
