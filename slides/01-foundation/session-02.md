# Slide buổi 02 – Development Environment

> **Tóm tắt:** Dựng môi trường Linux thật trên Windows 11 bằng WSL2 Ubuntu, VS Code Remote WSL, Git và SSH key GitHub, rồi kiểm tra bằng script check-env. Bài lab tương ứng: [Buổi 02 – Development Environment](../../labs/week-01/session-02.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: dựng Linux, nối GitHub, tự kiểm tra](/slides/img/s02-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích WSL2 khác WSL1 và máy ảo ở đâu; cài WSL2 + Ubuntu và xác minh VERSION 2; phân biệt `~` với `/mnt/c`; cấu hình Git, tạo SSH key ed25519, xác thực với GitHub; mở dự án bằng VS Code Remote WSL và chạy script kiểm tra môi trường.
- Hỏi: máy ai đang là Windows 10, Windows 11, macOS?
:::

---

## Slide 2: 20 máy, 20 môi trường

![Cùng lệnh docker compose up, ba máy cho ba kết quả khác nhau](/slides/img/s02-problem.svg)

::: details Ghi chú cho mentor
- CLB có 20 thành viên: Windows 10, Windows 11, vài máy macOS.
- Cùng lệnh `docker compose up`, người chạy được, người báo not found. Script có ký tự xuống dòng Windows gây lỗi `\r: command not found`.
- Server thật gần như luôn chạy Linux, nên luyện tập trên môi trường giống Linux từ máy cá nhân.
:::

---

## Slide 3: WSL2 chạy nhân Linux thật

![WSL1 dịch syscall sang nhân Windows, WSL2 chạy nhân Linux thật trong VM nhẹ](/slides/img/s02-wsl-compare.svg)

::: details Ghi chú cho mentor
- Chạy Linux ngay trên Windows, không cần dual-boot. Windows tự khởi động và tắt máy ảo khi cần. Docker Desktop ở các buổi sau tích hợp với WSL2.
- So sánh nhanh: nhân Linux (WSL1 là lớp dịch syscall; WSL2 và máy ảo là nhân thật); filesystem Linux (WSL1 trung bình; WSL2 và máy ảo nhanh); truy cập `/mnt/c` (WSL1 nhanh hơn, WSL2 chậm); Docker (WSL1 hạn chế, WSL2 tốt).
- Trong khóa chỉ dùng WSL2.
:::

---

## Slide 4: Terminal, shell, lệnh

![Terminal là cửa sổ, shell bash là chương trình đọc lệnh, lệnh là chương trình được gọi](/slides/img/s02-shell-layers.svg)

::: details Ghi chú cho mentor
- Terminal là cửa sổ (Windows Terminal); shell là chương trình đọc và chạy lệnh (`bash`, `zsh`, PowerShell); lệnh là chương trình được gọi (`ls`, `git`, `cd`).
- Ví von: terminal là bàn điều khiển, shell là người phiên dịch.
- Bash đọc `~/.bashrc` mỗi lần mở shell tương tác.
:::

---

## Slide 5: Hai thế giới filesystem

![Linux ext4 trong ~ nhanh; ổ Windows dưới /mnt/c chậm và hay lỗi](/slides/img/s02-filesystems.svg)

::: details Ghi chú cho mentor
- Linux (ext4): `/home/TEN_BAN` hay `~`, dùng cho mã nguồn, Docker build, mọi lab. Ổ Windows: `/mnt/c/Users/...`, chỉ để trao đổi file.
- `/mnt/c` đi qua lớp mạng 9P nên chậm với nhiều file nhỏ (`npm install`, `git status`), còn gây lỗi quyền file và xuống dòng.
- Ví von: nấu ăn trong bếp nhà mình, đừng chạy sang bếp hàng xóm lấy từng hạt gia vị.
:::

---

## Slide 6: Demo: đo tốc độ hai filesystem

```bash
mkdir ~/io-test && cd ~/io-test
time (for i in $(seq 1 2000); do echo x > f$i; done)
cd /mnt/c/Users/TEN_WINDOWS && mkdir io-test && cd io-test
time (for i in $(seq 1 2000); do echo x > f$i; done)
```

So sánh dòng `real`: trong `~` nhanh hơn rõ rệt.

::: details Ghi chú cho mentor
- Xem `pwd` trong `~` và danh sách `/mnt/c`: hai đường dẫn, hai ổ đĩa khác nhau.
- Kỳ vọng: lần trong `~` nhanh hơn rõ rệt, thường vài lần trở lên. Số chính xác tùy máy, xu hướng mới quan trọng.
- Chỉ xóa đúng thư mục `io-test` vừa tạo.
:::

---

## Slide 7: apt: update rồi mới install

![apt update làm mới danh sách gói, apt install cài phần mềm](/slides/img/s02-apt.svg)

```bash
sudo apt update
sudo apt install -y git
```

::: details Ghi chú cho mentor
- Ubuntu cài phần mềm qua `apt` từ kho đã ký số. `update` làm mới danh sách gói, không nâng cấp phần mềm.
- `sudo` chạy lệnh với quyền root.
- Ví von: xem thực đơn mới nhất trước khi gọi món.
:::

---

## Slide 8: Kiến trúc môi trường

![Windows chứa VS Code, Terminal, Docker; WSL2 chứa Ubuntu, Home, VS Code Server](/slides/img/s02-architecture.svg)

::: details Ghi chú cho mentor
- VS Code trên Windows chỉ là giao diện; VS Code Server chạy bên trong WSL2 và làm việc với Home của Ubuntu.
- Docker Desktop tích hợp với WSL2 từ Buổi 07.
- Ubuntu nói chuyện với GitHub qua SSH.
:::

---

## Slide 9: SSH key: chìa khóa và ổ khóa

![Private key ở lại máy, public key dán lên GitHub](/slides/img/s02-ssh-keys.svg)

::: details Ghi chú cho mentor
- Private key `~/.ssh/id_ed25519`: ở lại máy bạn, không chia sẻ, không commit. Public key `~/.ssh/id_ed25519.pub`: dán lên GitHub.
- Ví von: public key là ổ khóa đưa cho GitHub, private key là chìa khóa bạn giữ.
- Tạo khóa: `ssh-keygen -t ed25519 -C "email"`, nên đặt passphrase.
:::

---

## Slide 10: Đăng nhập GitHub bằng SSH

![Trình tự git push qua SSH: thử thách, ký bằng private key, xác thực](/slides/img/s02-ssh-handshake.svg)

::: details Ghi chú cho mentor
- GitHub dùng public key để thử thách máy bạn; chỉ người giữ private key mới trả lời đúng.
- ssh-agent giữ sẵn khóa đã mở để bạn không gõ lại passphrase; agent chỉ sống trong phiên terminal hiện tại.
- `ssh -T git@github.com` báo "successfully authenticated" là đúng; mã thoát 1 của lệnh này là bình thường.
:::

---

## Slide 11: Lab: 60 phút ở lớp, phần còn lại ở nhà

| Khi nào | Việc làm | Mốc xong |
| --- | --- | --- |
| Ở lớp | WSL2 + Ubuntu, VS Code Remote WSL, `git config`, `check-env.sh` | VERSION 2, `exit code: 0` |
| Ở nhà | SSH key, thêm lên GitHub, nối remote bằng SSH | `ssh -T` thành công |
| Nộp | `lab-02/` có `evidence/command-output.txt` | log thật |

Làm theo bài [Buổi 02 – Development Environment](../../labs/week-01/session-02.md). Cài đặt chi tiết: [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md).

::: details Ghi chú cho mentor
- Cài WSL2 lần đầu kèm khởi động lại mất khoảng 30 phút, nên cài trước giờ học nếu có thể.
- Lệnh kiểm tra ở lớp: `bash resources/check-env.sh 2`. Số `2` nghĩa là kiểm tra tới Buổi 02.
- L2 tùy chọn: tự viết script kiểm tra mở rộng (node, npm, make, quyền key 600, mã thoát khác 0) và thư mục dotfiles có `install.sh` chạy hai lần không lỗi.
:::

---

## Slide 12: Kết quả đúng trông như thế nào

```text
PS> wsl --list --verbose
* Ubuntu-24.04    Running         2
$ uname -a        # chứa microsoft-standard-WSL2
$ ssh -T git@github.com
Hi TEN_GITHUB! You've successfully authenticated, ...
```

VS Code: góc dưới trái ghi "WSL: Ubuntu-24.04".

::: details Ghi chú cho mentor
- Checklist L1: `wsl --list --verbose` thấy VERSION 2; `lab-02` nằm trong `~`, `code .` hiện "WSL: Ubuntu"; `ssh -T git@github.com` xác thực thành công; `evidence/command-output.txt` chứa output các lệnh và log `check-env.sh`.
- Log `check-env.sh`: git, curl là `[ OK ]`, docker, kubectl chỉ hiện `[ DE SAU ]`, cuối cùng `exit code: 0`.
:::

---

## Slide 13: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `0x80370102` khi `wsl --install` | Bật VT-x hoặc SVM trong BIOS, khởi động lại |
| `git status`, `npm install` chậm | Repo đang ở `/mnt/c`, chuyển vào `~` |
| `\r: command not found` | `sed -i 's/\r$//' file.sh`, đặt `core.autocrlf input` |
| `Permission denied (publickey)` | `ssh-add -l`, kiểm tra public key trên GitHub |

::: details Ghi chú cho mentor
- `UNPROTECTED PRIVATE KEY FILE`: quyền file key quá rộng, chạy `chmod 600` lên key và `chmod 700 ~/.ssh`.
- Port 22 timeout: mạng chặn, thử SSH qua cổng 443 theo GitHub Docs.
- SSH từ chối key mà người khác đọc được; tự phá trên một khóa thử `~/.ssh/test_key`, đừng đụng khóa thật.
- Bảng đầy đủ nằm trong mục "Gặp lỗi?" của bài lab.
:::

---

## Slide 14: Thử thách

Clone repo vào `/mnt/c/Users/An/code`: `npm install` mất 10 phút, `./run.sh` báo `\r: command not found`. Bạn xử lý thế nào?

`ssh -T git@github.com` báo `Permission denied (publickey)`: liệt kê ba điểm kiểm tra đầu tiên.

::: details Ghi chú cho mentor
- Đáp án 1: clone lại vào `~`, chuyển script sang LF và đặt `core.autocrlf input`.
- Đáp án 2: public key đã dán lên GitHub chưa; `ssh-add -l`; `ssh -vT git@github.com` và quyền file 600.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: WSL2 + Ubuntu, shell và apt, SSH key](/slides/img/s02-recap.svg)

Buổi tiếp theo: Linux CLI ([Slide buổi 03](session-03.md)).
