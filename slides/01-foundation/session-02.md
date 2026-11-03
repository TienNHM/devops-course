# Slide Ngày 01 – Môi trường Linux và repo devops-labs

> **Tóm tắt:** Dựng môi trường Linux thật trên Windows 11 bằng WSL2 Ubuntu, VS Code, Git và SSH key GitHub, clone repo `devops-labs` và push `notes/day-01.md`. Bài lab tương ứng: [Ngày 1 – Môi trường Linux và repo devops-labs](../../labs/week-01/session-02.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: dựng Linux, nối GitHub, tự kiểm tra](/slides/img/s02-goals.svg)

::: details Ghi chú cho mentor
- Cuối ngày mỗi bạn có: WSL2 Ubuntu, VS Code mở trong Ubuntu, SSH key đăng nhập GitHub, `~/devops-labs` đã clone và `notes/day-01.md` đã push.
- Hỏi: máy ai đang là Windows 10, Windows 11, macOS?
:::

---

## Slide 2: 20 máy, 20 môi trường

![Cùng lệnh docker compose up, ba máy cho ba kết quả khác nhau](/slides/img/s02-problem.svg)

::: details Ghi chú cho mentor
- CLB có 20 thành viên: Windows 10, Windows 11, vài máy macOS. Cùng lệnh `docker compose up`, người chạy được, người báo not found.
- Script có ký tự xuống dòng Windows gây lỗi `\r: command not found`. Server thật gần như luôn chạy Linux, nên cả lớp dùng chung môi trường Linux (WSL2).
:::

---

## Slide 3: "Chạy được trên máy tôi"

![Nam gửi zip cho Lan, Lan chạy lỗi vì Node khác phiên bản, thiếu DB_PASSWORD, không có test](/slides/img/s01-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Kể ngắn 1 phút: Nam gửi zip qua Zalo, Lan cài Node khác phiên bản và quên biến mật khẩu database, hai bạn mất cả buổi tối.
- Đây là vấn đề DevOps giải quyết: lỗi nằm ở quy trình, không phải ở code. Không kể lịch sử DevOps.
:::

---

## Slide 4: Đường đi của code trong 10 ngày

![Quy trình tự động: push, build và test, đóng gói image, registry, deploy, kiểm tra](/slides/img/s01-auto-flow.svg)

- Dev viết code, **Git** lưu và chia sẻ (Ngày 3).
- **Build** và **test** tự động mỗi lần push (Ngày 9).
- Đóng gói thành **image**, đưa lên registry (Ngày 6 và Ngày 10).
- **Chạy** bằng container, giống nhau ở mọi máy (Ngày 4 đến 8).
- DevOps là làm cho cả đường này tự động và lặp lại được.

::: details Ghi chú cho mentor
- Giữ đúng 10 phút cho phần giới thiệu, chỉ hỏi "bước nào bạn từng làm tay?".
- Chưa cần giải thích từng ô: mỗi ô sẽ được làm thật ở một ngày sau.
:::

---

## Slide 5: Mã nguồn nằm trong ~, không nằm trong /mnt/c

![Linux ext4 trong ~ nhanh; ổ Windows dưới /mnt/c chậm và hay lỗi](/slides/img/s02-filesystems.svg)

::: details Ghi chú cho mentor
- Linux (ext4): `/home/TEN_BAN` hay `~`, dùng cho mã nguồn, Docker build, mọi lab. Ổ Windows: `/mnt/c/Users/...`, chỉ để trao đổi file.
- `/mnt/c` đi qua lớp mạng 9P nên chậm với nhiều file nhỏ (`npm install`, `git status`), còn gây lỗi quyền file và xuống dòng.
- Lệnh `apt`: luôn `sudo apt update` (làm mới danh sách gói) rồi mới `sudo apt install`.
:::

---

## Slide 6: SSH key: chìa khóa và ổ khóa

![Private key ở lại máy, public key dán lên GitHub](/slides/img/s02-ssh-keys.svg)

```bash
ssh-keygen -t ed25519 -C "email"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

::: details Ghi chú cho mentor
- Private key `~/.ssh/id_ed25519`: ở lại máy bạn, không chia sẻ, không commit. Public key `.pub`: dán lên GitHub.
- ssh-agent giữ sẵn khóa đã mở; agent chỉ sống trong phiên terminal hiện tại.
- `ssh -T git@github.com` báo "successfully authenticated" là đúng; mã thoát 1 của lệnh này là bình thường.
:::

---

## Slide 7: Lab: bảy bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | WSL2 + Ubuntu, VS Code trong Ubuntu | VERSION 2, nhãn "WSL: Ubuntu" |
| 3-4 | `git config`, SSH key, thêm lên GitHub | `ssh -T` thành công |
| 5-6 | Clone `devops-labs`, chạy `check-env.sh` | `exit code: 0` |
| 7 | Ghi `notes/day-01.md`, commit, push | File hiện trên GitHub |

Lệnh đầy đủ: [Ngày 1 – Môi trường Linux và repo devops-labs](../../labs/week-01/session-02.md). Cài đặt chi tiết: [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md).

::: details Ghi chú cho mentor
- Cài WSL2 lần đầu kèm khởi động lại mất khoảng 30 phút, nên cài trước giờ học nếu có thể.
- `bash resources/check-env.sh 2`: số `2` là tham số của script, cứ gõ đúng.
- Cuối ngày mỗi bạn mở trang GitHub của `devops-labs` và cho mentor xem `notes/day-01.md`.
:::

---

## Slide 8: Kết quả đúng trông như thế nào

```text
PS> wsl --list --verbose
* Ubuntu-24.04    Running         2
$ uname -a        # chứa microsoft-standard-WSL2
$ ssh -T git@github.com
Hi TEN_GITHUB! You've successfully authenticated, ...
```

VS Code: góc dưới trái ghi "WSL: Ubuntu-24.04".

::: details Ghi chú cho mentor
- Log `check-env.sh`: git, curl là `[ OK ]`, docker, kubectl chỉ hiện `[ DE SAU ]`, cuối cùng `exit code: 0`.
- `notes/day-01.md` phải có output thật do máy sinh ra, cộng 2 đến 3 câu của bạn.
:::

---

## Slide 9: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `0x80370102` khi `wsl --install` | Bật VT-x hoặc SVM trong BIOS, khởi động lại |
| `git status`, `npm install` chậm | Repo đang ở `/mnt/c`, chuyển vào `~` |
| `\r: command not found` | `sed -i 's/\r$//' file.sh`, đặt `core.autocrlf input` |
| `Permission denied (publickey)` | `ssh-add -l`, kiểm tra public key trên GitHub |

::: details Ghi chú cho mentor
- `UNPROTECTED PRIVATE KEY FILE`: quyền file key quá rộng, chạy `chmod 600` lên key và `chmod 700 ~/.ssh`.
- Port 22 timeout: mạng chặn, thử SSH qua cổng 443 theo GitHub Docs.
- Bảng đầy đủ nằm trong mục "Gặp lỗi?" của bài lab.
:::

---

## Slide 10: Recap

![Ba điều cần nhớ: WSL2 + Ubuntu, shell và apt, SSH key](/slides/img/s02-recap.svg)

Ngày tiếp theo: [Slide Ngày 02](session-03.md).

---

## Slide 11: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [WSL documentation](https://learn.microsoft.com/en-us/windows/wsl/): cài và dùng Linux trên Windows.
- **Tài liệu chính thức:** [VS Code Remote với WSL](https://code.visualstudio.com/docs/remote/wsl): viết code trong WSL bằng VS Code.
- **Tài liệu chính thức:** [First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup): cấu hình Git lần đầu đúng cách.
- **Best practice:** [Set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment): gợi ý cấu hình môi trường dev gọn gàng.
- **Best practice:** [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh): dùng SSH key an toàn thay cho mật khẩu.
