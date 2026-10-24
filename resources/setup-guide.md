# Hướng dẫn cài đặt môi trường

Trang này là nguồn duy nhất cho các bước cài đặt của cả khóa. Các bài lab chỉ trỏ về đây, không chép lại. Làm theo thứ tự, mỗi phần có mục "Kiểm tra bạn đã cài đúng". Khi gặp lỗi, xem [Xử lý sự cố cài đặt](troubleshooting-setup.md).

> **Tóm tắt:** Tuần 1 chỉ cần Git, VS Code và GitHub. WSL2 + Ubuntu cài ở buổi 02, Docker Desktop ở buổi 07 (Container Fundamentals; buổi 08 là Docker CLI), kubectl + kind ở buổi 21. Cài đúng lúc, không cài trước. Phần chuẩn bị cho buổi 01 mất khoảng 30 phút.

## Cài gì, khi nào

| Công cụ | Cài ở buổi | Thời gian cài | Phần trong trang này |
| --- | --- | --- | --- |
| Git, VS Code, tài khoản GitHub | Buổi 01 (tuần 1) | khoảng 30 phút | [Cần ngay tuần 1](#can-ngay-tuan-1) |
| Bật ảo hóa, WSL2 + Ubuntu 24.04 | Buổi 02 | khoảng 30 phút, có thể phải khởi động lại máy | [Bật ảo hóa](#bat-ao-hoa), [WSL2 và Ubuntu](#wsl2-va-ubuntu-24-04) |
| Docker Desktop | Buổi 07 | khoảng 20 phút | [Docker Desktop](#docker-desktop) |
| Node.js (chỉ khi chạy test ngoài container) | Buổi 09, nếu cần | khoảng 10 phút | [Node.js](#node-js) |
| kubectl + kind | Buổi 21 | khoảng 20 phút | [kubectl](#kubectl), [kind](#kind) |

Máy 8 GB RAM đọc thêm [Máy 8 GB và giới hạn RAM](#may-8-gb-va-gioi-han-ram) ở cuối trang trước khi cài Docker.

::: tip Chưa cần bây giờ
Nếu bạn đang chuẩn bị cho buổi 01, chỉ làm phần [Cần ngay tuần 1](#can-ngay-tuan-1). Mọi phần còn lại đọc sau, khi tới buổi tương ứng. Cài sớm không có lợi vì phiên bản thay đổi, còn máy yếu thì bị chậm thêm.
:::

## Cần ngay tuần 1

Ba thứ: Git, VS Code, tài khoản GitHub, tổng cộng khoảng 30 phút (cùng với việc đọc [Terminal 101](terminal-101.md)). Tất cả cài trên Windows, chưa cần WSL. Mọi lệnh kiểm tra ở tuần 1 chạy trong **Git Bash** (đi kèm Git for Windows): bấm Start, gõ `Git Bash`; không dùng PowerShell.

### Git cho Windows

1. Tải Git for Windows từ https://git-scm.com/download/win và cài, giữ các lựa chọn mặc định.
2. Mở Git Bash (Start, gõ `Git Bash`) và kiểm tra.

**Kiểm tra bạn đã cài đúng:**

```bash
git --version
```

Kết quả mong đợi (số phiên bản có thể khác):

```text
git version 2.4x.x.windows.1
```

### VS Code

1. Cài VS Code từ https://code.visualstudio.com/ (chọn "Add to PATH" khi cài).
2. Ở buổi 02 bạn sẽ cài thêm extension WSL (xem [VS Code và WSL extension](#vs-code-va-wsl-extension)).

**Kiểm tra bạn đã cài đúng:**

```bash
code --version
```

Kết quả mong đợi: ba dòng, dòng đầu là số phiên bản như `1.9x.x`. Báo `code: command not found`? Mở lại Git Bash sau khi cài, hoặc cài lại VS Code và chọn "Add to PATH".

### Tài khoản GitHub

Tạo tài khoản, bật 2FA, tạo repo `devops-labs` (Public), cấu hình `git config` và đăng nhập: làm theo [Tài khoản GitHub và repo devops-labs](setup-github.md). Chưa biết terminal? Đọc [Terminal 101](terminal-101.md) trước (khoảng 10 phút cho phần cần ở buổi 01).

## Bật ảo hóa

Buổi 02. WSL2 và Docker Desktop cần ảo hóa phần cứng. Có một cách kiểm tra duy nhất:

1. Mở Task Manager (`Ctrl+Shift+Esc`), tab **Hiệu suất** (Performance), chọn **CPU**.
2. Xem dòng **Ảo hóa** (Virtualization). Nếu là **Đã bật** (Enabled), bỏ qua bước BIOS.
3. Nếu là **Đã tắt** (Disabled): khởi động lại, vào BIOS/UEFI (thường nhấn `F2`, `F10`, `Del` hoặc `Esc` lúc máy bật; tùy hãng), tìm và bật:
   - Intel: **Intel Virtualization Technology** (VT-x)
   - AMD: **SVM Mode** (AMD-V)
4. Lưu, khởi động lại, kiểm tra lại Task Manager.

::: tip Lưu ý
Khi WSL2 hoặc Hyper-V đang chạy, một số công cụ khác có thể báo ảo hóa "tắt" dù thực tế đã bật. Tiêu chí đáng tin cậy là Task Manager hiển thị Enabled hoặc `wsl --install` chạy thành công.
:::

Windows Home vẫn dùng được WSL2 và Docker Desktop (qua WSL2 backend), không cần Hyper-V đầy đủ. Không vào được BIOS hoặc BIOS bị khóa: xem [Xử lý sự cố cài đặt](troubleshooting-setup.md).

## WSL2 và Ubuntu 24.04

Buổi 02. WSL2 cho bạn một Linux thật chạy ngay trong Windows. Mở **PowerShell với quyền Administrator** (chuột phải Start, chọn Terminal (Admin)):

```powershell
wsl --install -d Ubuntu-24.04
```

Khởi động lại máy nếu được yêu cầu. Sau khi khởi động, cửa sổ Ubuntu tự mở để tạo tài khoản Linux: nhập username (chữ thường, không dấu) và mật khẩu. Mật khẩu này chỉ dùng cho `sudo` trong WSL, hãy nhớ nó. Khi gõ mật khẩu, màn hình không hiện ký tự nào, đó là bình thường.

**Kiểm tra bạn đã cài đúng** (PowerShell):

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

Cập nhật gói trong Ubuntu (đây là các lệnh `sudo`, hỏi mật khẩu Linux bạn vừa tạo):

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git jq unzip ca-certificates
```

**Kiểm tra bạn đã cài đúng** (trong Ubuntu):

```bash
cat /etc/os-release | head -n 2
git --version
```

Kết quả mong đợi: dòng đầu có `Ubuntu 24.04`, và `git version 2.43.x` (hoặc mới hơn).

::: tip Máy 8 GB
WSL2 mặc định có thể chiếm tới một nửa RAM máy. Máy 8 GB nên đặt giới hạn ngay sau khi cài xong: xem [mẫu .wslconfig](#may-8-gb-va-gioi-han-ram) ở cuối trang.
:::

### Làm việc trong filesystem của WSL

Luôn đặt mã nguồn trong `~/` của Ubuntu, ví dụ `~/devops-labs`. Không làm việc trong `/mnt/c/...`: I/O qua lớp chia sẻ Windows rất chậm, ảnh hưởng `npm install`, `docker build` và đôi khi quyền file. Từ Windows, truy cập file WSL qua `\\wsl$\Ubuntu-24.04\home\<user>` hoặc gõ `explorer.exe .` trong thư mục WSL.

Clone repo giáo trình về `~/devops-course` bằng lệnh ở [Tài khoản GitHub và repo devops-labs](setup-github.md#clone-repo-giao-trinh).

## VS Code và WSL extension

Buổi 02.

1. Cài extension **WSL** (mã `ms-vscode-remote.remote-wsl`) và, tùy ý, **Docker**, **YAML**, **Kubernetes**, **GitHub Actions**.
2. Từ terminal Ubuntu, mở thư mục dự án:

```bash
mkdir -p ~/devops-labs && cd ~/devops-labs
code .
```

Lần đầu VS Code tự cài VS Code Server vào WSL. **Kiểm tra bạn đã cài đúng:** góc dưới trái cửa sổ VS Code phải hiện `WSL: Ubuntu-24.04`. Các extension như Docker cần cài **trong WSL** (nút "Install in WSL").

## Docker Desktop

Buổi 07 (Container Fundamentals). Buổi 08 là Docker CLI, dùng lại bản cài này.

1. Tải từ https://docs.docker.com/desktop/setup/install/windows-install/ và cài, chọn **Use WSL 2 instead of Hyper-V** nếu được hỏi.
2. Khởi động Docker Desktop, chấp nhận điều khoản theo quy định của cá nhân/tổ chức bạn (Docker Desktop có điều kiện cấp phép riêng cho doanh nghiệp lớn; sinh viên và dùng cá nhân thường được miễn phí, hãy đọc điều khoản hiện hành).
3. Mở **Settings > General**: bảo đảm **Use the WSL 2 based engine** được bật.
4. Mở **Settings > Resources > WSL integration**: bật **Enable integration with my default WSL distro** và bật công tắc cho `Ubuntu-24.04`. Nhấn **Apply & restart**.
5. Giới hạn tài nguyên: với WSL2 backend, RAM và CPU do `.wslconfig` quyết định (xem [cuối trang](#may-8-gb-va-gioi-han-ram)), không chỉnh trong Docker Desktop. Có thể tắt **Start Docker Desktop when you sign in** nếu máy yếu.

**Kiểm tra bạn đã cài đúng** (trong Ubuntu, mở cửa sổ mới sau khi bật integration):

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

Docker Desktop không cho phép cài song song Docker Engine bản `apt` trong cùng distro mà dùng chung socket. Không chạy `sudo apt install docker.io` trong Ubuntu của khóa học.

## Node.js

Buổi 09, và chỉ khi bạn muốn chạy test ngoài container. Backend của starter project dùng Node.js 22. Có hai cách; chọn một.

**Cách A: nvm (khuyến nghị nếu muốn chạy test ngoài container).**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Đóng và mở lại terminal, rồi:

```bash
nvm install 22
nvm use 22
```

**Kiểm tra bạn đã cài đúng:**

```bash
node --version
npm --version
```

Kết quả mong đợi: `v22.x.x` và `10.x.x`. Nếu cần bản nvm mới hơn, xem https://github.com/nvm-sh/nvm.

**Cách B: không cài Node, chạy trong container.** Phù hợp máy yếu hoặc muốn môi trường sạch:

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine npm test
```

Cách này cần Docker Desktop đang chạy và thư mục nằm trong filesystem của WSL.

## kubectl

Buổi 21. Docker Desktop có thể đã cung cấp `kubectl` trong WSL qua integration. Kiểm tra trước:

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

**Kiểm tra bạn đã cài đúng:** dòng `kubectl: OK` ở bước kiểm tra checksum, sau đó `Client Version: v1.3x.x`.

Nên dùng kubectl trong khoảng một phiên bản minor so với cluster. kind dùng image node Kubernetes theo từng bản kind; khi lệch nhiều, kiểm tra tài liệu để tránh lỗi tương thích.

## kind

Buổi 21. Cài trong WSL theo cách trang chính thức mô tả (https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries). Tải binary theo phiên bản cố định:

```bash
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

**Kiểm tra bạn đã cài đúng:**

```bash
kind version
```

Kết quả mong đợi:

```text
kind v0.23.0 go1.21.x linux/amd64
```

Có thể thay `v0.23.0` bằng bản mới hơn trong trang releases của kind (https://github.com/kubernetes-sigs/kind/releases); mentor sẽ thông báo nếu cả lớp cần dùng một bản cụ thể. Kiểm tra nhanh bằng cluster thử tên `smoke-test` (cần Docker Desktop đang chạy; xóa ngay sau khi thử):

```bash
kind create cluster --name smoke-test
kubectl get nodes
kind delete cluster --name smoke-test
```

Kết quả mong đợi: node `smoke-test-control-plane` ở trạng thái `Ready`. Lần đầu sẽ tải image node (vài trăm MB).

Cluster thật của khóa tên `club` (context `kind-club`) được tạo ở buổi 21 bằng `kind create cluster --name club --config starter-project/k8s/kind-config.yaml`, chạy trong thư mục `~/devops-course`.

## Công cụ tùy chọn

| Công cụ | Dùng để | Ghi chú |
| --- | --- | --- |
| Postman hoặc Bruno | Gọi thử API `/health`, `/api/members` | Bruno lưu collection dạng file, dễ commit. `curl` là đủ nếu máy yếu |
| Lens hoặc Headlamp | Xem cluster Kubernetes bằng GUI | Tốn RAM, tránh trên máy 8 GB |
| DBeaver hoặc `psql` | Xem dữ liệu PostgreSQL | `sudo apt install -y postgresql-client` |
| Windows Terminal | Terminal nhiều tab | Có sẵn trên Windows 11 |
| GitHub CLI (`gh`) | Tạo Pull Request, xem log Actions trong terminal | Cài theo [setup-github](setup-github.md#dang-nhap) |

## Kiểm tra toàn bộ môi trường

Hai script chỉ đọc thông tin, không cài gì, không sửa gì, không cần quyền Administrator. Thêm số buổi để script chỉ đòi những gì bạn thực sự cần tới lúc đó.

Phía Windows (PowerShell), trong thư mục repo giáo trình:

```powershell
powershell -ExecutionPolicy Bypass -File resources\check-env.ps1 -Buoi 2
```

Phía WSL (Ubuntu), trong `~/devops-course`:

```bash
bash resources/check-env.sh 2
```

Đổi số `2` thành `7` (có Docker) hoặc `21` (có kubectl, kind); bỏ số đi để kiểm tra đủ bộ. Ý nghĩa các nhãn: `[ OK ]` đạt, `[ THIEU ]` còn thiếu và có gợi ý cài, `[ DE SAU ]` chưa cần ở mốc này, `[ CANH BAO ]` nên xem nhưng không chặn. Kết quả mong đợi khi đã xong (rút gọn):

```text
[ OK    ] WSL                đang chạy trong WSL (distro: Ubuntu-24.04)
[ OK    ] docker daemon      đang chạy (Server 27.x.x, Docker Desktop)
[ OK    ] kind               kind v0.23.0 go1.21.x linux/amd64
KET QUA: đủ công cụ bắt buộc tới buổi 21. Cảnh báo: 0
```

Chụp kết quả `check-env.sh` đưa vào bài lab buổi 02 như bằng chứng. Nếu còn `[ THIEU ]` ở công cụ bắt buộc, đọc [Xử lý sự cố cài đặt](troubleshooting-setup.md) trước khi hỏi mentor (và hỏi theo mẫu ở [Cách học khóa này](../curriculum/how-to-learn.md#cach-xin-giup)).

## Máy 8 GB và giới hạn RAM

Yêu cầu chung: Windows 11 (khuyến nghị bản 22H2 trở lên), CPU hỗ trợ ảo hóa (Intel VT-x hoặc AMD-V), ổ SSD.

| | 8 GB RAM (tối thiểu) | 16 GB RAM (khuyến nghị) | 32 GB RAM |
| --- | --- | --- | --- |
| Linux, Git, Docker cơ bản | Chạy tốt | Chạy tốt | Chạy tốt |
| Docker Compose (3 service) | Chạy được, đóng ứng dụng nặng | Thoải mái | Thoải mái |
| kind 1 node | Chạy được nếu dừng Compose | Chạy cùng Compose được | Thoải mái |
| kind nhiều node | Không nên | Hạn chế | Phù hợp |
| RAM cấp cho WSL2 (`.wslconfig`) | 3 GB | 6 GB | 10 GB |
| CPU | 4 nhân logic trở lên | 4 đến 8 nhân | 8 nhân trở lên |
| Ổ đĩa trống | 30 GB | 40 GB | 60 GB |

::: tip Máy 8 GB: chiến lược sống sót
- Chỉ chạy một "tầng" tại một thời điểm: Compose **hoặc** kind. Trước khi tạo cluster kind, dừng stack Compose bằng `docker compose down` (không thêm `-v` nếu muốn giữ dữ liệu).
- Dùng kind một node duy nhất (cấu hình `starter-project/k8s/kind-config.yaml` đã phù hợp). Không tạo cluster nhiều node.
- Cấp cho WSL2 khoảng 3 GB trong `.wslconfig` và bật swap (mẫu bên dưới).
- Đóng trình duyệt nhiều tab, Teams và các ứng dụng Electron nặng khi làm lab Kubernetes.
- Không chạy Lens hoặc các công cụ GUI nặng. Dùng `kubectl` là đủ.
- Dùng `docker system df` để xem dung lượng và `docker builder prune` khi cần dọn cache build.
- Khi xong buổi: `docker compose down`, `kind delete cluster --name club`, đóng Docker Desktop nếu cần giải phóng RAM.
:::

### Giới hạn tài nguyên bằng .wslconfig

Mặc định WSL2 có thể chiếm tới một nửa RAM máy. Tạo file `C:\Users\<tên-bạn>\.wslconfig` (trong Notepad, lưu dạng UTF-8, tên file chính xác là `.wslconfig`, không có đuôi `.txt`). Docker Desktop dùng WSL2 backend nên cũng chịu giới hạn này. Chọn đúng một mẫu theo RAM máy.

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

Áp dụng cấu hình bằng cách tắt WSL, rồi mở lại.

::: danger Lệnh này tắt toàn bộ WSL
`wsl --shutdown` dừng mọi cửa sổ Ubuntu và mọi container Docker đang chạy. Lưu công việc, đóng các cửa sổ WSL và thoát Docker Desktop trước khi chạy. Dữ liệu trong volume Docker vẫn còn; chỉ tiến trình đang chạy bị dừng.

```powershell
wsl --shutdown
```
:::

Mở lại Ubuntu và kiểm tra:

```bash
free -m
```

Kết quả mong đợi: dòng `Mem:` có tổng xấp xỉ giá trị `memory` đã đặt (ví dụ khoảng 2900 MB cho `3GB`).

Tùy chọn (WSL bản mới, cần kiểm tra tài liệu chính thức nếu không chạy): thêm khối sau vào `.wslconfig` để WSL trả lại RAM cho Windows khi rảnh. Xem [WSL advanced settings](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).

```text
[experimental]
autoMemoryReclaim=gradual
```

## Tài liệu chính thức

- WSL: https://learn.microsoft.com/en-us/windows/wsl/install
- Cấu hình WSL (`.wslconfig`): https://learn.microsoft.com/en-us/windows/wsl/wsl-config
- Docker Desktop trên Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Docker Desktop với WSL 2: https://docs.docker.com/desktop/features/wsl/
- kind: https://kind.sigs.k8s.io/docs/user/quick-start/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- GitHub CLI: https://cli.github.com/
