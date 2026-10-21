# Slide buổi 04 – Linux Administration

> **Tóm tắt:** Tạo user và group, phân quyền thư mục dùng chung bằng chmod, chown, setgid, quản lý process và biến môi trường, chạy một systemd service trên WSL2 Ubuntu.

## Slide 1: Mục tiêu buổi học

- Giải thích mô hình quyền owner, group, other và ba bit r, w, x
- Tạo user, group, thư mục chung bằng `useradd`, `groupadd`, `chown`, `chmod 2770`
- Tìm và dừng process: `ps`, `pgrep`, `kill`, hiểu SIGTERM và SIGKILL
- Phân biệt biến shell và biến môi trường (`export`)
- Chạy service bằng `systemctl`, đọc log bằng `journalctl`
- Chẩn đoán `Permission denied` mà không dùng `chmod 777`

::: details Ghi chú giảng viên
Mở đầu 2 phút. Nhấn mạnh: container thực chất là process Linux, nên mọi thứ hôm nay quay lại ở Docker và Kubernetes. Hỏi lớp: ai từng gặp Permission denied và đã xử lý bằng cách nào.
:::

---

## Slide 2: Vấn đề thực tế

- Cả nhóm dùng chung một tài khoản và `chmod 777` cho nhanh
- Một bạn xóa nhầm `.env` của bạn khác, không ai biết ai làm
- Mọi thao tác mang cùng một tên người dùng, không truy vết được
- Service chạy bằng root: nếu bị khai thác thì mất cả máy
- Mục tiêu: mỗi người một user, nhóm một group, quyền vừa đủ

::: details Ghi chú giảng viên
Kể câu chuyện này như tình huống của CLB. Hỏi: nếu bạn là trưởng nhóm, bạn muốn hệ thống ghi lại điều gì khi có sự cố? Thời lượng 2 phút.
:::

---

## Slide 3: User, group và UID/GID

- Linux nhận diện bằng số UID, GID; tên chỉ là nhãn
- Mỗi user có một group chính và nhiều group phụ
- File chính: `/etc/passwd`, `/etc/group`, `/etc/shadow` (chỉ root đọc)
- Xem nhanh: `id`, `getent group clbdev`
- UID 0 là root; user thường từ 1000 trở lên

```bash
id
getent group sudo
```

::: details Ghi chú giảng viên
Chạy `id` trên màn hình chiếu và chỉ từng trường uid, gid, groups. Nhắc không bao giờ chép `/etc/shadow` ra ngoài. 3 phút.
:::

---

## Slide 4: Quyền file r, w, x

- `ls -l` cho chuỗi 10 ký tự, ví dụ `drwxrws---`
- Ký tự đầu: loại (d thư mục, - file); sau đó owner, group, other
- r = 4, w = 2, x = 1: `chmod 750` nghĩa là rwx, r-x, ---
- Thư mục: r là liệt kê, w là tạo hoặc xóa file, x là đi vào
- Xóa file cần quyền w trên thư mục chứa, không phải trên file

::: details Ghi chú giảng viên
Vẽ bảng r/w/x lên bảng. Câu hỏi cho lớp: để vào sâu /a/b/c cần quyền gì ở mỗi thư mục dọc đường? (x trên mọi thư mục.) 3 phút.
:::

---

## Slide 5: Kernel chọn đúng một nhóm quyền

```mermaid
flowchart TD
    A["Process mo file"] --> B{"UID khop owner?"}
    B -->|"co"| O["Ap dung quyen owner"]
    B -->|"khong"| C{"GID khop group?"}
    C -->|"co"| G["Ap dung quyen group"]
    C -->|"khong"| T["Ap dung quyen other"]
```

- Chỉ áp dụng một nhóm, không cộng dồn quyền owner và group
- Group phụ cũng được tính
- Kernel còn kiểm tra bit x của mọi thư mục dọc đường dẫn

::: details Ghi chú giảng viên
Đây là sơ đồ trọng tâm của buổi. Hỏi: nếu owner chỉ có r nhưng group có rw, owner ghi được không? (Không, vì khớp owner thì chỉ dùng quyền owner.) 3 phút.
:::

---

## Slide 6: setgid, sticky bit, umask

- setgid trên thư mục (`chmod 2770`): file mới thừa hưởng group của thư mục
- sticky bit (`+t`): chỉ owner file được xóa trong thư mục, như `/tmp`
- umask là quyền bị trừ khi tạo file: 022 cho file 644, 007 cho file 660
- Thư mục chung của nhóm: group sở hữu + `2770` + umask 007 hoặc 002

::: details Ghi chú giảng viên
Hỏi lại câu của demo: vì sao /tmp có chữ t ở cuối? Giải thích setgid bằng ví dụ: không có nó, file của dev1 mang group riêng của dev1 và dev2 không sửa được. 3 phút.
:::

---

## Slide 7: Process và tín hiệu

- Mỗi chương trình đang chạy là một process: PID, UID, PPID
- `ps aux`, `pgrep -a tên` để tìm; `jobs` cho job của shell
- `kill PID` gửi SIGTERM (15): xin process tự dọn dẹp rồi thoát
- `kill -9 PID` gửi SIGKILL (9): kernel giết ngay, không dọn dẹp được
- Quy tắc: thử SIGTERM trước, SIGKILL là phương án cuối

::: details Ghi chú giảng viên
Hỏi: lệnh kill mặc định gửi tín hiệu nào? Liên hệ: docker stop gửi SIGTERM trước rồi mới SIGKILL, sẽ gặp lại ở buổi Docker. 2 phút.
:::

---

## Slide 8: Biến môi trường và systemd

- Biến shell chỉ sống trong shell hiện tại
- Biến `export` được sao chép sang mọi process con
- Ứng dụng starter-project đọc `DB_PASSWORD`, `WEB_PORT` từ môi trường
- systemd quản lý service bằng unit file trong `/etc/systemd/system/`
- `systemctl start|stop|status`, log xem bằng `journalctl -u tên`

```mermaid
flowchart LR
    U["Unit file"] --> S["systemd"]
    S -->|"start"| P["Process dich vu"]
    P -->|"stdout va stderr"| J["journal"]
    S -->|"Restart on-failure"| P
```

::: details Ghi chú giảng viên
Nối với Docker: `docker run -e` và `env:` trong GitHub Actions bắt chước cơ chế export. Nếu WSL của lớp chưa bật systemd, chỉ giới thiệu khái niệm, phần làm ở L2. 3 phút.
:::

---

## Slide 9: Demo 1 – Đọc quyền thực tế

```bash
id
ls -ld /tmp /etc/shadow ~
cat /etc/shadow
```

Kết quả mong đợi (rút gọn):

```text
uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)
-rw-r----- 1 root    shadow   1234 Oct 21 09:00 /etc/shadow
drwxr-x--- 8 student student  4096 Oct 21 09:00 /home/student
drwxrwxrwt 12 root   root     4096 Oct 21 09:00 /tmp
cat: /etc/shadow: Permission denied
```

::: details Ghi chú giảng viên
Chiếu terminal. `ls` sắp xếp đối số theo tên nên shadow hiện trước. Hỏi lớp: vì sao bạn không cat được shadow? Vì sao /tmp có chữ t? 3 phút.
:::

---

## Slide 10: Demo 2 – Biến export và tín hiệu

```bash
CLUB=dsc
bash -c 'echo "con thay: [$CLUB]"'
export CLUB
bash -c 'echo "con thay: [$CLUB]"'
```

```text
con thay: []
con thay: [dsc]
```

```bash
sleep 300 &
pgrep -a sleep
kill $(pgrep -n sleep)
sleep 1; pgrep -a sleep || echo "da dung"
```

- Kết quả cuối: in `da dung`
- Hỏi lớp: quên `export` thì ứng dụng đọc `DB_PASSWORD` thấy gì?

::: details Ghi chú giảng viên
Cho học viên đoán output trước khi chạy dòng thứ hai. Tổng demo khoảng 5 phút.
:::

---

## Slide 11: Lab – Chuẩn bị và cấu trúc nộp bài

- Làm trong WSL Ubuntu, thư mục `~`, không dùng `/mnt/c`
- Tên dùng trong lab: user `clb-dev1`, `clb-dev2`, `clb-guest`, group `clbdev`
- Thư mục chung: `/srv/club-shared`
- Ghi bằng chứng bằng `lệnh 2>&1 | tee -a evidence/command-output.txt`

```bash
mkdir -p ~/devops-labs/lab-04/{source,screenshots,evidence}
cd ~/devops-labs/lab-04
date | tee evidence/command-output.txt
```

::: details Ghi chú giảng viên
Lab 60 phút: L1 khoảng 40 phút, L2 khoảng 20 phút. Nhắc `tee -a` (append), quên `-a` sẽ ghi đè bằng chứng cũ.
:::

---

## Slide 12: Lab L1 – Tạo group và user

```bash
sudo groupadd clbdev
sudo useradd -m -s /bin/bash clb-dev1
sudo useradd -m -s /bin/bash clb-dev2
sudo useradd -m -s /bin/bash clb-guest
sudo usermod -aG clbdev clb-dev1
sudo usermod -aG clbdev clb-dev2
id clb-dev1
id clb-guest
```

```text
uid=1001(clb-dev1) gid=1002(clb-dev1) groups=1002(clb-dev1),1001(clbdev)
uid=1003(clb-guest) gid=1004(clb-guest) groups=1004(clb-guest)
```

- `-m` tạo thư mục home; `-aG` là thêm group phụ, thiếu `-a` sẽ thay toàn bộ group phụ

::: details Ghi chú giảng viên
Số UID và GID ở máy học viên có thể khác. Cảnh báo kỹ lỗi thiếu `-a` làm user mất group sudo. 5 phút.
:::

---

## Slide 13: Lab L1 – Thư mục chung với setgid

```bash
sudo mkdir -p /srv/club-shared
sudo chown root:clbdev /srv/club-shared
sudo chmod 2770 /srv/club-shared
ls -ld /srv/club-shared
cd /tmp
sudo -u clb-dev1 bash -c 'umask 007; touch /srv/club-shared/config-dev1.env && echo "dev1 ghi OK"'
sudo -u clb-dev2 bash -c 'ls -l /srv/club-shared'
sudo -u clb-guest ls /srv/club-shared
```

```text
drwxrws--- 2 root clbdev 4096 ... /srv/club-shared
dev1 ghi OK
-rw-rw---- 1 clb-dev1 clbdev 0 Oct 21 09:20 config-dev1.env
ls: cannot open directory '/srv/club-shared': Permission denied
```

::: details Ghi chú giảng viên
Đứng ở /tmp để tránh cảnh báo thư mục hiện tại vì home 750 không cho user khác vào. Sau bước này nhắc quay lại `cd ~/devops-labs/lab-04`. 8 phút.
:::

---

## Slide 14: Lab L1 – So sánh có và không setgid

```bash
sudo mkdir /srv/club-nosgid
sudo chown root:clbdev /srv/club-nosgid
sudo chmod 770 /srv/club-nosgid
sudo -u clb-dev1 touch /srv/club-nosgid/a.txt
ls -l /srv/club-nosgid
```

```text
-rw-r--r-- 1 clb-dev1 clb-dev1 0 ... a.txt
```

- Group của file là `clb-dev1`, không phải `clbdev`
- dev2 không sửa được file này: đó là lý do thư mục chung cần setgid
- Phần process và biến môi trường: làm tiếp trong bài lab (Phần 3 và 4)

::: details Ghi chú giảng viên
Hỏi lớp: nếu thiếu setgid và umask 022 thì dev2 làm được gì với file của dev1? Nhắc học viên làm Phần 3 (kill, pkill -9 với process bỏ qua SIGTERM) và Phần 4 (export). 5 phút.
:::

---

## Slide 15: Lab L2 – Thử thách tự làm

- Bài 1: viết `source/resource-check.sh` in tải CPU, % RAM, % disk, in WARN khi vượt ngưỡng
- Ngưỡng đọc từ `MEM_LIMIT`, `DISK_LIMIT` (mặc định 85)
- Kiểm tra: `MEM_LIMIT=1 bash source/resource-check.sh` phải in dòng WARN
- Bài 2: chạy script như service `club-resource-check` bằng user `clb-dev1`
- Bài 3: viết `permissions-notes.md` 5 dòng giải thích vì sao không `chmod 777`

```bash
systemctl is-system-running
sudo journalctl -u club-resource-check -n 5 --no-pager
```

::: details Ghi chú giảng viên
Nếu systemctl báo offline thì bật `systemd=true` trong `/etc/wsl.conf` rồi `wsl --shutdown`; nhắc ghi thêm mục [boot] thay vì ghi đè file có sẵn. Bài 2 có thể hoàn thành ở nhà.
:::

---

## Slide 16: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| Permission denied dù đã thêm vào group | Đăng nhập lại hoặc `newgrp clbdev`, kiểm tra bằng `id` |
| File chung có group là tên cá nhân | `sudo chmod g+s thư-mục`, file cũ sửa bằng `chgrp` |
| Dev khác chỉ đọc được file | Dùng umask 002 hoặc 007 |
| `usermod -G` làm mất group khác | Luôn dùng `usermod -aG` |
| `status=203/EXEC` | Kiểm tra đường dẫn tuyệt đối và `chmod 755` |

::: details Ghi chú giảng viên
Chọn 2 dòng hay gặp nhất để kể. Hỏi lớp: lỗi nào trong bảng bạn đã gặp rồi?
:::

---

## Slide 17: Phá lỗi – Đã thêm group nhưng vẫn bị từ chối

```bash
sudo useradd -m -s /bin/bash clb-dev3
sudo -u clb-dev3 ls /srv/club-shared
```

```text
ls: cannot open directory '/srv/club-shared': Permission denied
```

1. `id clb-dev3`: user có thuộc `clbdev` chưa?
2. `ls -ld /srv/club-shared`: group và quyền đúng chưa?
3. `namei -l /srv/club-shared`: thư mục cha có thiếu x không?
4. Sửa: `sudo usermod -aG clbdev clb-dev3`, kiểm tra bằng phiên mới

::: details Ghi chú giảng viên
Để học viên tự đề xuất bước điều tra trước khi chiếu từng bước. Nguyên nhân gốc: phiên đang chạy giữ danh sách group cũ. Dọn: `sudo userdel -r clb-dev3`. 5 phút.
:::

---

## Slide 18: Thử thách tại lớp

- Tình huống: bạn mới báo Permission denied 10 phút sau khi bạn đã chạy `usermod -aG`
- Việc làm đầu tiên là gì? Không được dùng `chmod 777`
- Bonus: giải thích vì sao Dockerfile của backend starter-project chạy bằng user không phải root

<details><summary>Gợi ý</summary>

Chạy `id` trong terminal của bạn ấy, rồi `ls -ld` và `namei -l`.

</details>

<details><summary>Đáp án</summary>

Phiên cũ chưa nạp group mới; yêu cầu đăng nhập lại rồi kiểm tra `id`. Service chạy user riêng theo nguyên tắc quyền tối thiểu.

</details>

::: details Ghi chú giảng viên
Cho nhóm 2 phút thảo luận rồi gọi ngẫu nhiên một nhóm trả lời.
:::

---

## Slide 19: Recap

- Quyền xét theo đúng một nhóm: owner, group hoặc other; thư mục cần x để vào, w để thêm hoặc xóa
- Thư mục chung: group sở hữu + `chmod 2770` + umask phù hợp, không `777`
- Sửa group chỉ có hiệu lực với phiên đăng nhập mới
- Dừng process bằng SIGTERM trước, SIGKILL là phương án cuối
- Chỉ biến đã `export` mới truyền sang process con
- Nhớ dọn user, group, thư mục thử nghiệm rồi nộp `lab-04/`

::: details Ghi chú giảng viên
Cho 3 học viên mỗi người nhắc lại một ý bằng lời của mình. Buổi sau: Networking Fundamentals.
:::
