# Setup Guide: Windows 11 + WSL2

Hướng dẫn dựng môi trường thực hành cho toàn khóa. Làm theo thứ tự. Mỗi bước có lệnh kiểm tra và kết quả mong đợi. Khi gặp lỗi, xem [Xử lý sự cố cài đặt](troubleshooting-setup.md).

> **Tóm tắt:** Cài WSL2 + Ubuntu 24.04, VS Code, Git, Docker Desktop (WSL2 backend), kubectl, kind, Node.js. Làm việc trong filesystem của WSL (`~/`). Chạy `resources/check-env.sh` để xác nhận mọi thứ.

## 1. Yêu cầu phần cứng

| | 8 GB RAM (tối thiểu) | 16 GB RAM (khuyến nghị) | 32 GB RAM |
| --- | --- | --- | --- |
| Linux, Git, Docker cơ bản | Chạy tốt | Chạy tốt | Chạy tốt |
| Docker Compose (3 service) | Chạy được, đóng ứng dụng nặng | Thoải mái | Thoải mái |
| kind 1 node | Chạy được nếu dừng Compose | Chạy cùng Compose được | Thoải mái |
| kind nhiều node | Không nên | Hạn chế | Phù hợp |
| RAM cấp cho WSL2 (`.wslconfig`) | 3 GB | 6 GB | 10 GB |
| CPU | 4 nhân logic trở lên | 4 đến 8 nhân | 8 nhân trở lên |
| Ổ đĩa trống | 30 GB | 40 GB | 60 GB |

Yêu cầu chung: Windows 11 (khuyến nghị bản 22H2 trở lên), CPU hỗ trợ ảo hóa (Intel VT-x hoặc AMD-V), ổ SSD.

### Chiến lược cho máy 8 GB

- Chỉ chạy một "tầng" tại một thời điểm: Compose **hoặc** kind. Trước khi tạo cluster kind, dừng stack Compose bằng `docker compose down` (không thêm `-v` nếu muốn giữ dữ liệu).
- Dùng kind một node duy nhất (cấu hình `starter-project/k8s/kind-config.yaml` đã phù hợp). Không tạo cluster nhiều node.
- Cấp cho WSL2 khoảng 3 GB trong `.wslconfig` và bật swap (xem mục 3).
- Đóng trình duyệt nhiều tab, Teams, và các ứng dụng Electron nặng khi làm lab Kubernetes.
- Không chạy Lens hoặc các công cụ GUI nặng trên máy 8 GB. Dùng `kubectl` là đủ.
- Dùng `docker system df` để xem dung lượng và `docker builder prune` khi cần dọn cache build.
- Khi xong buổi: `docker compose down`, `kind delete cluster --name club`, đóng Docker Desktop nếu cần giải phóng RAM.

## 2. Bật ảo hóa

WSL2 và Docker Desktop cần ảo hóa phần cứng.

1. Mở Task Manager (`Ctrl+Shift+Esc`), tab **Performance**, chọn **CPU**.
2. Xem dòng **Virtualization**. Nếu là **Enabled**, bỏ qua bước BIOS.
3. Nếu là **Disabled**: khởi động lại, vào BIOS/UEFI (thường nhấn `F2`, `F10`, `Del` hoặc `Esc` lúc máy bật; tùy hãng), tìm và bật:
   - Intel: **Intel Virtualization Technology** (VT-x)
   - AMD: **SVM Mode** (AMD-V)
4. Lưu và khởi động lại, kiểm tra lại Task Manager.

> Lưu ý: khi WSL2 hoặc Hyper-V đang chạy, một số công cụ có thể báo ảo hóa "tắt" dù thực tế đã bật. Tiêu chí đáng tin cậy là Task Manager hiển thị Enabled hoặc `wsl --install` chạy thành công.

Nếu dùng Windows Home: WSL2 và Docker Desktop vẫn chạy được (qua WSL2 backend), không cần Hyper-V đầy đủ.

## 3. WSL2 và Ubuntu 24.04

Mở **PowerShell với quyền Administrator** (chuột phải Start, chọn Terminal (Admin)):

```powershell
wsl --install -d Ubuntu-24.04
```

Khởi động lại máy nếu được yêu cầu. Sau khi khởi động, cửa sổ Ubuntu sẽ tự mở để tạo tài khoản Linux: nhập username (chữ thường, không dấu) và mật khẩu. Mật khẩu này chỉ dùng cho `sudo` trong WSL, nhớ nó (khi gõ sẽ không hiện ký tự).

Kiểm tra trong PowerShell:

```powershell
wsl -l -v
```

Kết quả mong đợi (rút gọn):

```text
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

Cột VERSION phải là `2`. Nếu là `1`: `wsl --set-version Ubuntu-24.04 2`. Nếu tên distro hiển thị khác, dùng đúng tên trong danh sách. Cập nhật WSL lên bản mới nhất:

```powershell
wsl --update
```

Cập nhật gói trong Ubuntu:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git jq unzip ca-certificates
```

### Giới hạn tài nguyên bằng .wslconfig

Mặc định WSL2 có thể chiếm tới một nửa RAM máy. Tạo file `C:\Users\<tên-bạn>\.wslconfig` (trong Notepad, lưu dạng UTF-8, tên file chính xác là `.wslconfig`). Docker Desktop dùng WSL2 backend nên cũng chịu giới hạn này.

Máy 8 GB:

```text
[wsl2]
memory=3GB
processors=4
swap=4GB
```

Máy 16 GB:

```text
[wsl2]
memory=6GB
processors=6
swap=4GB
```

Máy 32 GB:

```text
[wsl2]
memory=10GB
processors=8
swap=4GB
```

Áp dụng cấu hình (đóng mọi cửa sổ WSL và thoát Docker Desktop trước):

```powershell
wsl --shutdown
```

Mở lại Ubuntu và kiểm tra:

```bash
free -m
```

Kết quả mong đợi: dòng `Mem:` có tổng xấp xỉ giá trị `memory` đã đặt (ví dụ khoảng 2900 MB cho `3GB`).

Tùy chọn (WSL bản mới, cần kiểm tra tài liệu chính thức nếu không chạy): thêm khối sau để WSL trả lại RAM cho Windows khi rảnh. Xem [WSL advanced settings](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).

```text
[experimental]
autoMemoryReclaim=gradual
```

### Làm việc trong filesystem của WSL

Luôn đặt mã nguồn trong `~/` của Ubuntu, ví dụ `~/devops-labs`. Không làm việc trong `/mnt/c/...`: I/O qua lớp chia sẻ Windows rất chậm, ảnh hưởng `npm install`, `docker build` và đôi khi quyền file. Từ Windows, truy cập file WSL qua `\\wsl$\Ubuntu-24.04\home\<user>` hoặc gõ `explorer.exe .` trong thư mục WSL.

## 4. VS Code và WSL extension

1. Cài VS Code từ https://code.visualstudio.com/ (chọn "Add to PATH" khi cài).
2. Cài extension **WSL** (mã `ms-vscode-remote.remote-wsl`) và, tùy ý, **Docker**, **YAML**, **Kubernetes**, **GitHub Actions**.
3. Từ terminal Ubuntu, mở thư mục dự án:

```bash
mkdir -p ~/devops-labs && cd ~/devops-labs
code .
```

Lần đầu VS Code sẽ tự cài VS Code Server vào WSL. Góc dưới trái cửa sổ phải hiện `WSL: Ubuntu-24.04`. Các extension như Docker cần cài **trong WSL** (nút "Install in WSL").

## 5. Git, SSH key và GitHub

Trong Ubuntu:

```bash
git config --global user.name "Họ Tên"
git config --global user.email "email-dang-ky-github@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
```

Dùng đúng email đã đăng ký GitHub (hoặc email `noreply` của GitHub). Kiểm tra:

```bash
git config --global --list
```

### SSH key (khuyến nghị)

```bash
ssh-keygen -t ed25519 -C "email-dang-ky-github@example.com"
```

Nhấn Enter để chấp nhận đường dẫn mặc định và nên đặt passphrase. Sau đó:

```bash
cat ~/.ssh/id_ed25519.pub
```

Sao chép toàn bộ dòng (bắt đầu bằng `ssh-ed25519`) vào GitHub: **Settings > SSH and GPG keys > New SSH key**. Kiểm tra:

```bash
ssh -T git@github.com
```

Kết quả mong đợi (lần đầu hỏi xác nhận fingerprint, gõ `yes`):

```text
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

Chỉ chia sẻ file `.pub`. Không bao giờ gửi hoặc commit file `id_ed25519` (khóa riêng).

### GitHub CLI (tùy chọn)

Cài theo hướng dẫn chính thức cho Debian/Ubuntu: https://github.com/cli/cli/blob/trunk/docs/install_linux.md. Sau đó:

```bash
gh auth login
gh auth status
```

Chọn GitHub.com, giao thức SSH hoặc HTTPS, đăng nhập qua trình duyệt. `gh` hữu ích để tạo Pull Request, xem log Actions ngay trong terminal.

### GitHub account, Packages và GHCR

1. Tạo tài khoản GitHub (nếu chưa có) và bật xác thực hai lớp (2FA) tại **Settings > Password and authentication**.
2. Tạo repo cá nhân `devops-labs` (private hoặc public tùy quy định CLB). Xem [Hướng dẫn học khóa này](../curriculum/getting-started.md).
3. GitHub Container Registry (GHCR) nằm trong GitHub Packages và có sẵn cho mọi tài khoản, không cần bật riêng. Workflow trong khóa học đăng nhập GHCR bằng `GITHUB_TOKEN` cấp tự động, nên không cần tạo token cá nhân. Hãy bảo đảm repo cho phép Actions ghi packages: **Settings > Actions > General > Workflow permissions**, hoặc khai báo `permissions: packages: write` trong workflow (xem buổi CI/CD).
4. Nếu sau này cần đăng nhập GHCR thủ công, tạo Personal Access Token (classic) với quyền `write:packages`, lưu trong biến môi trường hoặc password manager, tuyệt đối không commit.

## 6. Docker Desktop

1. Tải từ https://docs.docker.com/desktop/setup/install/windows-install/ và cài, chọn **Use WSL 2 instead of Hyper-V** nếu được hỏi.
2. Khởi động Docker Desktop, chấp nhận điều khoản theo quy định của cá nhân/tổ chức bạn (Docker Desktop có điều kiện cấp phép riêng cho doanh nghiệp lớn; sinh viên và dùng cá nhân thường được miễn phí, hãy đọc điều khoản hiện hành).
3. Mở **Settings > General**: bảo đảm **Use the WSL 2 based engine** được bật.
4. Mở **Settings > Resources > WSL integration**: bật **Enable integration with my default WSL distro** và bật công tắc cho `Ubuntu-24.04`. Nhấn **Apply & restart**.
5. Giới hạn tài nguyên: với WSL2 backend, RAM và CPU do `.wslconfig` quyết định (mục 3), không chỉnh trong Docker Desktop. Có thể tắt **Start Docker Desktop when you sign in** nếu máy yếu.

Kiểm tra trong Ubuntu (mở cửa sổ mới sau khi bật integration):

```bash
docker version
docker compose version
docker run --rm hello-world
```

Kết quả mong đợi (rút gọn):

```text
Client: ...
Server: Docker Desktop ...
Docker Compose version v2.x.x
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

Ghi chú: Docker Desktop không cho phép cài song song Docker Engine bản `apt` trong cùng distro mà dùng chung socket. Không chạy `sudo apt install docker.io` trong Ubuntu của khóa học.

## 7. kubectl

Docker Desktop có thể đã cung cấp `kubectl` trong WSL qua integration. Kiểm tra trước:

```bash
kubectl version --client
```

Nếu không có lệnh, cài từ nguồn chính thức (xem https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/):

```bash
cd /tmp
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

Kết quả mong đợi: dòng `kubectl: OK` ở bước kiểm tra checksum, sau đó `Client Version: v1.3x.x`.

Nên dùng kubectl trong khoảng một phiên bản minor so với cluster. kind dùng image node Kubernetes theo từng bản kind; khi lệch nhiều, kiểm tra tài liệu để tránh lỗi tương thích.

## 8. kind

Cài trong WSL theo cách trang chính thức mô tả (https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries). Tải binary theo phiên bản cố định:

```bash
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
kind version
```

Kết quả mong đợi:

```text
kind v0.23.0 go1.21.x linux/amd64
```

Có thể thay `v0.23.0` bằng bản mới hơn trong trang releases của kind (https://github.com/kubernetes-sigs/kind/releases); mentor sẽ thông báo nếu cả lớp cần dùng một bản cụ thể. Kiểm tra nhanh (cần Docker Desktop đang chạy; sau đó xóa cluster thử):

```bash
kind create cluster --name smoke-test
kubectl get nodes
kind delete cluster --name smoke-test
```

Kết quả mong đợi: node `smoke-test-control-plane` ở trạng thái `Ready`. Lần đầu sẽ tải image node (vài trăm MB).

## 9. Node.js

Backend của starter project dùng Node.js 22. Có hai cách; chọn một.

**Cách A: nvm (khuyến nghị nếu muốn chạy test ngoài container).**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Đóng và mở lại terminal, rồi:

```bash
nvm install 22
nvm use 22
node --version
npm --version
```

Kết quả mong đợi: `v22.x.x` và `10.x.x`. Nếu cần bản nvm mới hơn, xem https://github.com/nvm-sh/nvm.

**Cách B: không cài Node, chạy trong container.** Phù hợp máy yếu hoặc muốn môi trường sạch:

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine npm test
```

Cách này cần Docker Desktop đang chạy và thư mục nằm trong filesystem của WSL.

## 10. Công cụ tùy chọn

| Công cụ | Dùng để | Ghi chú |
| --- | --- | --- |
| Postman hoặc Bruno | Gọi thử API `/health`, `/api/members` | Bruno lưu collection dạng file, dễ commit. `curl` là đủ nếu máy yếu |
| Lens hoặc Headlamp | Xem cluster Kubernetes bằng GUI | Tốn RAM, tránh trên máy 8 GB |
| DBeaver hoặc `psql` | Xem dữ liệu PostgreSQL | `sudo apt install -y postgresql-client` |
| Windows Terminal | Terminal nhiều tab | Có sẵn trên Windows 11 |

## 11. Kiểm tra toàn bộ môi trường

Phía Windows (PowerShell, không cần Admin), trong thư mục repo giáo trình:

```powershell
powershell -ExecutionPolicy Bypass -File resources\check-env.ps1
```

Phía WSL (Ubuntu):

```bash
bash resources/check-env.sh
```

Hai script chỉ đọc thông tin, không thay đổi máy. Dòng `[ OK ]` là đạt, `[ THIEU ]` là còn thiếu và có gợi ý cài. Kết quả mong đợi khi đã xong (rút gọn):

```text
[ OK    ] WSL                đang chạy trong WSL (distro: Ubuntu-24.04)
[ OK    ] docker daemon      đang chạy (Server 27.x.x, Docker Desktop)
[ OK    ] kind               kind v0.23.0 go1.21.x linux/amd64
KET QUA: đủ công cụ bắt buộc. Cảnh báo: 0
```

Chụp kết quả `check-env.sh` đưa vào bài lab buổi 02 như bằng chứng. Nếu còn `[ THIEU ]` ở công cụ bắt buộc, đọc [Xử lý sự cố cài đặt](troubleshooting-setup.md) trước khi hỏi mentor (và hỏi theo mẫu ở [Hướng dẫn học khóa này](../curriculum/getting-started.md)).

Theo lịch, Docker Desktop cần sẵn sàng từ tuần 4, kubectl và kind từ tuần 11, nhưng nên cài và kiểm tra hết ngay từ tuần 1 để phát hiện lỗi sớm.

## Tài liệu chính thức

- WSL: https://learn.microsoft.com/en-us/windows/wsl/install
- Cấu hình WSL (`.wslconfig`): https://learn.microsoft.com/en-us/windows/wsl/wsl-config
- Docker Desktop trên Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Docker Desktop với WSL 2: https://docs.docker.com/desktop/features/wsl/
- kind: https://kind.sigs.k8s.io/docs/user/quick-start/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- GitHub CLI: https://cli.github.com/
