# Hướng dẫn cài đặt môi trường

Trang này là nguồn duy nhất cho các bước cài đặt của cả khóa học. Các bài lab chỉ dẫn về đây và không chép lại. Thực hiện theo thứ tự; mỗi phần có mục "Kiểm tra" để xác nhận kết quả cài đặt. Khi gặp lỗi, xem [Xử lý sự cố cài đặt](troubleshooting-setup.md).

> **Tóm tắt:** Tuần 1 chỉ cần Git, VS Code và GitHub. WSL2 + Ubuntu cài ở buổi 02, Docker Desktop ở buổi 07 (Container Fundamentals; buổi 08 là Docker CLI), kubectl + kind ở buổi 21. Mỗi công cụ chỉ cài khi đến buổi cần dùng, không cài trước. Phần chuẩn bị cho buổi 01 mất khoảng 30 phút.

## Cài gì, khi nào

| Công cụ | Cài ở buổi | Thời gian cài | Phần trong trang này |
| --- | --- | --- | --- |
| Git, VS Code, tài khoản GitHub | Buổi 01 (tuần 1) | khoảng 30 phút | [Cần ngay tuần 1](#can-ngay-tuan-1) |
| Bật ảo hóa, WSL2 + Ubuntu 24.04 | Buổi 02 | khoảng 30 phút, có thể phải khởi động lại máy | [Bật ảo hóa](#bat-ao-hoa), [WSL2 và Ubuntu](#wsl2-va-ubuntu-24-04) |
| Docker Desktop | Buổi 07 | khoảng 20 phút | [Docker Desktop](#docker-desktop) |
| Node.js (chỉ khi chạy test ngoài container) | Buổi 09, nếu cần | khoảng 10 phút | [Node.js](#node-js) |
| kubectl + kind | Buổi 21 | khoảng 20 phút | [kubectl](#kubectl), [kind](#kind) |

Với máy 8 GB RAM, cần đọc thêm mục [Máy 8 GB và giới hạn RAM](#may-8-gb-va-gioi-han-ram) ở cuối trang trước khi cài Docker.

::: tip Chưa cần bây giờ
Khi chuẩn bị cho buổi 01, chỉ thực hiện phần [Cần ngay tuần 1](#can-ngay-tuan-1). Các phần còn lại đọc khi đến buổi tương ứng. Cài sớm không có lợi vì phiên bản công cụ thay đổi theo thời gian, và máy cấu hình thấp sẽ chậm hơn khi cài thừa công cụ.
:::

## Cần ngay tuần 1

Tuần 1 cần ba thành phần: Git, VS Code và tài khoản GitHub, tổng cộng khoảng 30 phút (kể cả việc đọc [Terminal 101](terminal-101.md)). Cả ba cài trên Windows và chưa cần WSL. Mọi lệnh kiểm tra ở tuần 1 chạy trong **Git Bash** (đi kèm Git for Windows): mở Start, nhập `Git Bash`; không dùng PowerShell.

### Git cho Windows

1. Tải Git for Windows từ https://git-scm.com/download/win và cài đặt, giữ các lựa chọn mặc định.
2. Mở Git Bash (Start, nhập `Git Bash`) và kiểm tra.

**Kiểm tra:**

```bash
git --version
```

Kết quả mong đợi (số phiên bản có thể khác):

```text
git version 2.4x.x.windows.1
```

### VS Code

1. Cài VS Code từ https://code.visualstudio.com/ (chọn "Add to PATH" khi cài).
2. Ở buổi 02, cài thêm extension WSL (xem [VS Code và WSL extension](#vs-code-va-wsl-extension)).

**Kiểm tra:**

```bash
code --version
```

Kết quả mong đợi: ba dòng, trong đó dòng đầu là số phiên bản như `1.9x.x`. Nếu lệnh báo `code: command not found`, mở lại Git Bash sau khi cài, hoặc cài lại VS Code và chọn "Add to PATH".

### Tài khoản GitHub

Các bước tạo tài khoản, bật 2FA, tạo repository `devops-labs` (Public), cấu hình `git config` và đăng nhập được hướng dẫn tại [Tài khoản GitHub và repo devops-labs](setup-github.md). Người học chưa quen terminal nên đọc [Terminal 101](terminal-101.md) trước (khoảng 10 phút cho phần cần ở buổi 01).

## Bật ảo hóa

Buổi 02. WSL2 và Docker Desktop yêu cầu ảo hóa phần cứng. Cách kiểm tra như sau:

1. Mở Task Manager (`Ctrl+Shift+Esc`), tab **Hiệu suất** (Performance), chọn **CPU**.
2. Xem dòng **Ảo hóa** (Virtualization). Nếu giá trị là **Đã bật** (Enabled), bỏ qua bước BIOS.
3. Nếu giá trị là **Đã tắt** (Disabled): khởi động lại, vào BIOS/UEFI (thường nhấn `F2`, `F10`, `Del` hoặc `Esc` lúc máy khởi động; phím cụ thể tùy hãng), tìm và bật:
   - Intel: **Intel Virtualization Technology** (VT-x)
   - AMD: **SVM Mode** (AMD-V)
4. Lưu, khởi động lại, kiểm tra lại Task Manager.

::: tip Lưu ý
Khi WSL2 hoặc Hyper-V đang chạy, một số công cụ khác có thể báo ảo hóa "tắt" dù thực tế đã bật. Tiêu chí đáng tin cậy là Task Manager hiển thị Enabled hoặc lệnh `wsl --install` chạy thành công.
:::

Windows Home vẫn dùng được WSL2 và Docker Desktop (qua WSL2 backend) và không cần Hyper-V đầy đủ. Khi không vào được BIOS hoặc BIOS bị khóa, xem [Xử lý sự cố cài đặt](troubleshooting-setup.md).

## WSL2 và Ubuntu 24.04

Buổi 02. WSL2 cung cấp một hệ thống Linux thực chạy trực tiếp trong Windows. Mở **PowerShell với quyền Administrator** (nhấp chuột phải vào Start, chọn Terminal (Admin)):

```powershell
wsl --install -d Ubuntu-24.04
```

Khởi động lại máy nếu được yêu cầu. Sau khi khởi động, cửa sổ Ubuntu tự mở để tạo tài khoản Linux: nhập username (chữ thường, không dấu) và mật khẩu. Mật khẩu này chỉ dùng cho `sudo` trong WSL và cần được ghi nhớ. Khi nhập mật khẩu, màn hình không hiển thị ký tự nào; đây là hành vi bình thường.

**Kiểm tra** (PowerShell):

```powershell
wsl -l -v
```

Kết quả mong đợi (rút gọn):

```text
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

Cột VERSION phải là `2`. Nếu là `1`, chạy `wsl --set-version Ubuntu-24.04 2`. Nếu tên distro hiển thị khác, dùng đúng tên trong danh sách. Cập nhật WSL lên bản mới nhất:

```powershell
wsl --update
```

Cập nhật gói trong Ubuntu (các lệnh `sudo` sẽ hỏi mật khẩu Linux vừa tạo):

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git jq unzip ca-certificates
```

**Kiểm tra** (trong Ubuntu):

```bash
cat /etc/os-release | head -n 2
git --version
```

Kết quả mong đợi: dòng đầu chứa `Ubuntu 24.04` và dòng git hiển thị `git version 2.43.x` (hoặc mới hơn).

::: tip Máy 8 GB
WSL2 mặc định có thể chiếm tới một nửa RAM của máy. Với máy 8 GB, nên đặt giới hạn ngay sau khi cài xong: xem [mẫu .wslconfig](#may-8-gb-va-gioi-han-ram) ở cuối trang.
:::

### Làm việc trong filesystem của WSL

Mã nguồn luôn được đặt trong `~/` của Ubuntu, ví dụ `~/devops-labs`, và không làm việc trong `/mnt/c/...`. Lý do là thao tác I/O qua lớp chia sẻ của Windows rất chậm, ảnh hưởng đến `npm install`, `docker build` và đôi khi cả quyền file. Từ Windows, truy cập file WSL qua `\\wsl$\Ubuntu-24.04\home\<user>` hoặc chạy `explorer.exe .` trong thư mục WSL.

Clone repository giáo trình về `~/devops-course` bằng lệnh trong [Tài khoản GitHub và repo devops-labs](setup-github.md#clone-repo-giao-trinh).

## VS Code và WSL extension

Buổi 02.

1. Cài extension **WSL** (mã `ms-vscode-remote.remote-wsl`) và tùy chọn thêm **Docker**, **YAML**, **Kubernetes**, **GitHub Actions**.
2. Từ terminal Ubuntu, mở thư mục dự án:

```bash
mkdir -p ~/devops-labs && cd ~/devops-labs
code .
```

Ở lần đầu tiên, VS Code tự cài VS Code Server vào WSL. **Kiểm tra:** góc dưới trái cửa sổ VS Code phải hiện `WSL: Ubuntu-24.04`. Các extension như Docker cần được cài **trong WSL** (nút "Install in WSL").

## Docker Desktop

Buổi 07 (Container Fundamentals). Buổi 08 (Docker CLI) dùng lại bản cài này.

1. Tải từ https://docs.docker.com/desktop/setup/install/windows-install/ và cài đặt, chọn **Use WSL 2 instead of Hyper-V** nếu được hỏi.
2. Khởi động Docker Desktop và chấp nhận điều khoản theo quy định của cá nhân hoặc tổ chức (Docker Desktop có điều kiện cấp phép riêng cho doanh nghiệp lớn; sinh viên và người dùng cá nhân thường được miễn phí, cần đọc điều khoản hiện hành).
3. Mở **Settings > General** và bảo đảm **Use the WSL 2 based engine** được bật.
4. Mở **Settings > Resources > WSL integration**, bật **Enable integration with my default WSL distro** và bật công tắc cho `Ubuntu-24.04`. Nhấn **Apply & restart**.
5. Giới hạn tài nguyên: với WSL2 backend, RAM và CPU do `.wslconfig` quyết định (xem [cuối trang](#may-8-gb-va-gioi-han-ram)) và không chỉnh trong Docker Desktop. Với máy cấu hình thấp, có thể tắt **Start Docker Desktop when you sign in**.

**Kiểm tra** (trong Ubuntu, mở cửa sổ mới sau khi bật integration):

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

Docker Desktop không hỗ trợ cài song song Docker Engine bản `apt` trong cùng distro khi dùng chung socket. Vì vậy không chạy `sudo apt install docker.io` trong Ubuntu của khóa học.

## Node.js

Buổi 09, và chỉ khi cần chạy test ngoài container. Backend của starter project dùng Node.js 22. Có hai cách cài; chọn một trong hai.

**Cách A: nvm (khuyến nghị khi cần chạy test ngoài container).**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Đóng và mở lại terminal, sau đó chạy:

```bash
nvm install 22
nvm use 22
```

**Kiểm tra:**

```bash
node --version
npm --version
```

Kết quả mong đợi: `v22.x.x` và `10.x.x`. Khi cần bản nvm mới hơn, xem https://github.com/nvm-sh/nvm.

**Cách B: không cài Node, chạy trong container.** Cách này phù hợp với máy cấu hình thấp hoặc khi cần môi trường sạch:

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine npm test
```

Cách B yêu cầu Docker Desktop đang chạy và thư mục nằm trong filesystem của WSL.

## kubectl

Buổi 21. Docker Desktop có thể đã cung cấp `kubectl` trong WSL qua integration. Kiểm tra trước bằng lệnh:

```bash
kubectl version --client
```

Nếu chưa có lệnh này, cài từ nguồn chính thức (xem https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/):

```bash
cd /tmp
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

**Kiểm tra:** kết quả đúng khi bước kiểm tra checksum in `kubectl: OK` và lệnh cuối in `Client Version: v1.3x.x`.

Phiên bản kubectl nên nằm trong khoảng một phiên bản minor so với cluster. kind dùng image node Kubernetes tương ứng với từng bản kind; khi phiên bản lệch nhiều, cần kiểm tra tài liệu để tránh lỗi tương thích.

## kind

Buổi 21. Cài trong WSL theo cách trang chính thức mô tả (https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries). Tải binary theo một phiên bản cố định:

```bash
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

**Kiểm tra:**

```bash
kind version
```

Kết quả mong đợi:

```text
kind v0.23.0 go1.21.x linux/amd64
```

Có thể thay `v0.23.0` bằng bản mới hơn trong trang releases của kind (https://github.com/kubernetes-sigs/kind/releases); mentor sẽ thông báo nếu cả lớp cần dùng một bản cụ thể. Để kiểm tra nhanh, tạo cluster thử tên `smoke-test` (cần Docker Desktop đang chạy) và xóa ngay sau khi thử:

```bash
kind create cluster --name smoke-test
kubectl get nodes
kind delete cluster --name smoke-test
```

Kết quả mong đợi: node `smoke-test-control-plane` ở trạng thái `Ready`. Ở lần đầu, kind tải image node (vài trăm MB).

Cluster chính của khóa học có tên `club` (context `kind-club`) và được tạo ở buổi 21 bằng `kind create cluster --name club --config starter-project/k8s/kind-config.yaml`, chạy trong thư mục `~/devops-course`.

## Công cụ tùy chọn

| Công cụ | Dùng để | Ghi chú |
| --- | --- | --- |
| Postman hoặc Bruno | Gọi thử API `/health`, `/api/members` | Bruno lưu collection dạng file, dễ commit. `curl` là đủ nếu máy yếu |
| Lens hoặc Headlamp | Xem cluster Kubernetes bằng GUI | Tốn RAM, tránh trên máy 8 GB |
| DBeaver hoặc `psql` | Xem dữ liệu PostgreSQL | `sudo apt install -y postgresql-client` |
| Windows Terminal | Terminal nhiều tab | Có sẵn trên Windows 11 |
| GitHub CLI (`gh`) | Tạo Pull Request, xem log Actions trong terminal | Cài theo [setup-github](setup-github.md#dang-nhap) |

## Kiểm tra toàn bộ môi trường

Hai script chỉ đọc thông tin, không cài đặt, không sửa đổi gì và không cần quyền Administrator. Thêm số buổi để script chỉ yêu cầu các công cụ cần thiết đến buổi đó.

Phía Windows (PowerShell), trong thư mục repository giáo trình:

```powershell
powershell -ExecutionPolicy Bypass -File resources\check-env.ps1 -Buoi 2
```

Phía WSL (Ubuntu), trong `~/devops-course`:

```bash
bash resources/check-env.sh 2
```

Đổi số `2` thành `7` (có Docker) hoặc `21` (có kubectl, kind); bỏ số đi để kiểm tra đầy đủ. Ý nghĩa các nhãn: `[ OK ]` đạt, `[ THIEU ]` còn thiếu và có gợi ý cài, `[ DE SAU ]` chưa cần ở mốc này, `[ CANH BAO ]` nên xem nhưng không chặn. Kết quả mong đợi khi đã xong (rút gọn):

```text
[ OK    ] WSL                đang chạy trong WSL (distro: Ubuntu-24.04)
[ OK    ] docker daemon      đang chạy (Server 27.x.x, Docker Desktop)
[ OK    ] kind               kind v0.23.0 go1.21.x linux/amd64
KET QUA: đủ công cụ bắt buộc tới buổi 21. Cảnh báo: 0
```

Chụp kết quả `check-env.sh` và đưa vào bài lab buổi 02 làm bằng chứng. Nếu còn `[ THIEU ]` ở công cụ bắt buộc, đọc [Xử lý sự cố cài đặt](troubleshooting-setup.md) trước khi hỏi mentor, và hỏi theo mẫu ở [Cách học khóa này](../curriculum/how-to-learn.md#cach-xin-giup).

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

::: tip Máy 8 GB: chiến lược tiết kiệm RAM
- Chỉ chạy một "tầng" tại một thời điểm: Compose **hoặc** kind. Trước khi tạo cluster kind, dừng stack Compose bằng `docker compose down` (không thêm `-v` để giữ dữ liệu).
- Dùng kind một node duy nhất (cấu hình `starter-project/k8s/kind-config.yaml` đã phù hợp). Không tạo cluster nhiều node.
- Cấp cho WSL2 khoảng 3 GB trong `.wslconfig` và bật swap (mẫu bên dưới).
- Đóng trình duyệt nhiều tab, Teams và các ứng dụng Electron nặng khi làm lab Kubernetes.
- Không chạy Lens hoặc các công cụ GUI nặng; `kubectl` là đủ.
- Dùng `docker system df` để xem dung lượng và `docker builder prune` khi cần dọn cache build.
- Khi kết thúc buổi: chạy `docker compose down`, `kind delete cluster --name club` và đóng Docker Desktop nếu cần giải phóng RAM.
:::

### Giới hạn tài nguyên bằng .wslconfig

Mặc định WSL2 có thể chiếm tới một nửa RAM của máy. Tạo file `C:\Users\<tên-người-dùng>\.wslconfig` (trong Notepad, lưu dạng UTF-8; tên file chính xác là `.wslconfig`, không có đuôi `.txt`). Docker Desktop dùng WSL2 backend nên cũng chịu giới hạn này. Chọn đúng một mẫu theo dung lượng RAM của máy.

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

Áp dụng cấu hình bằng cách tắt WSL rồi mở lại.

::: danger Lệnh này tắt toàn bộ WSL
`wsl --shutdown` dừng mọi cửa sổ Ubuntu và mọi container Docker đang chạy. Cần lưu công việc, đóng các cửa sổ WSL và thoát Docker Desktop trước khi chạy. Dữ liệu trong volume Docker vẫn còn; chỉ các tiến trình đang chạy bị dừng.

```powershell
wsl --shutdown
```
:::

Mở lại Ubuntu và kiểm tra bằng lệnh:

```bash
free -m
```

Kết quả mong đợi: dòng `Mem:` có tổng xấp xỉ giá trị `memory` đã đặt (ví dụ khoảng 2900 MB cho `3GB`).

Tùy chọn (WSL bản mới, cần kiểm tra tài liệu chính thức nếu không chạy): thêm khối sau vào `.wslconfig` để WSL trả lại RAM cho Windows khi không sử dụng. Xem [WSL advanced settings](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).

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
