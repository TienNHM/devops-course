# Slide buổi 04 – Linux Administration

> **Tóm tắt:** Tạo user và group, phân quyền thư mục dùng chung bằng chmod, chown, setgid, quản lý process và biến môi trường, chạy một systemd service trên WSL2 Ubuntu. Bài học: [Buổi 04 – Linux Administration](../../labs/week-02/session-04.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: phân quyền, quản lý process, biến môi trường](/slides/img/s04-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Mục tiêu đầy đủ: giải thích owner, group, other với r, w, x; tạo user, group, thư mục chung; tìm và dừng process; phân biệt biến shell và biến `export`.
- Cuối buổi còn chạy service bằng `systemctl` và chẩn đoán `Permission denied` mà không dùng `chmod 777`.
- Hỏi: ai từng chữa lỗi quyền bằng `chmod 777`?
:::

---

## Slide 2: Một tài khoản chung và chmod 777

![Cả nhóm dùng chung tài khoản, chmod 777, mất .env không truy vết được](/slides/img/s04-problem.svg)

::: details Ghi chú cho mentor
- Kể chuyện: một bạn xóa nhầm `.env` của bạn khác, mọi thao tác mang cùng một tên người dùng.
- Service chạy bằng root: nếu bị khai thác thì mất cả máy.
- Docker và Kubernetes chạy trên nền các khái niệm này: container là process Linux, nhiều lỗi `permission denied` đến từ UID/GID.
:::

---

## Slide 3: Linux nhận diện bằng số UID và GID

```text
$ id
uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)
```

Tên chỉ là nhãn, Linux so sánh số UID, GID.

UID 0 là root, user thường từ 1000.

::: details Ghi chú cho mentor
- Mỗi user có một group chính và nhiều group phụ. Ví von: UID là số căn cước, group là tổ công tác.
- File chính: `/etc/passwd`, `/etc/group`, `/etc/shadow` (chỉ root đọc). Xem bằng `getent group tên`.
:::

---

## Slide 4: Đọc chuỗi quyền drwxrws---

![Chuỗi quyền gồm loại, owner, group, other và giá trị r 4, w 2, x 1](/slides/img/s04-perm-string.svg)

::: details Ghi chú cho mentor
- `chmod 750` nghĩa là rwx, r-x, ---.
- Thư mục: r là liệt kê, w là tạo hoặc xóa file, x là đi vào.
- Hay nhầm: xóa file cần quyền w trên thư mục chứa nó, không phải trên file.
:::

---

## Slide 5: Kernel chỉ chọn một nhóm quyền

![Kernel kiểm tra UID owner, rồi GID group, còn lại là other](/slides/img/s04-kernel-pick.svg)

::: details Ghi chú cho mentor
- Không cộng dồn quyền owner và group. Group phụ cũng được tính.
- Kernel còn kiểm tra bit x của mọi thư mục dọc đường dẫn (`namei -l` cho thấy).
- Hỏi: file `640`, owner alice, group dev. Bob thuộc dev ghi được không? (Không, chỉ đọc.)
:::

---

## Slide 6: setgid: file mới mang group của thư mục

![Thư mục có setgid cho file mới group clbdev, không có thì group cá nhân](/slides/img/s04-setgid.svg)

umask 007 cho file mới là `rw-rw----`.

::: details Ghi chú cho mentor
- Công thức thư mục chung: group sở hữu + `2770` + umask 007 hoặc 002.
- umask là quyền bị trừ khi tạo file: 022 cho file 644, 007 cho file 660.
- Sticky bit (`+t`): chỉ owner file được xóa trong thư mục, như `/tmp`.
:::

---

## Slide 7: Demo 1: đọc quyền thực tế

```bash
id
ls -ld /tmp /etc/shadow ~
cat /etc/shadow
```

```text
-rw-r----- 1 root    shadow   1234 Oct 21 09:00 /etc/shadow
drwxr-x--- 8 student student  4096 Oct 21 09:00 /home/student
drwxrwxrwt 12 root   root     4096 Oct 21 09:00 /tmp
cat: /etc/shadow: Permission denied
```

::: details Ghi chú cho mentor
- Hỏi: vì sao `/tmp` có chữ `t` ở cuối? Vì sao `cat /etc/shadow` bị chặn?
:::

---

## Slide 8: Thư mục chung: dev1 ghi, dev2 đọc, guest bị chặn

```bash
sudo chmod 2770 /srv/club-shared
ls -ld /srv/club-shared
```

```text
drwxrws--- 2 root clbdev 4096 ... /srv/club-shared
ls: cannot open directory '/srv/club-shared': Permission denied
```

Dòng cuối là kết quả khi `clb-guest` thử `ls`.

::: details Ghi chú cho mentor
- Chữ `s` ở nhóm group là setgid; nhóm other là `---` nên người ngoài không vào được.
- Dùng `sudo -u clb-dev1 bash -c '...'` để thử từng user, đứng ở `/tmp` vì home quyền 750.
:::

---

## Slide 9: Hai cách dừng một process

![kill gửi SIGTERM để process tự dọn; kill -9 gửi SIGKILL giết ngay](/slides/img/s04-signals.svg)

::: details Ghi chú cho mentor
- Mỗi process có PID, UID, PPID. Tìm bằng `ps aux`, `pgrep -a tên`; `jobs` cho job của shell.
- Lab: `sleep 600 &`, `kill %1`; process `trap "" TERM` bỏ qua SIGTERM nên cần `pkill -9`.
- Không dùng `pkill sleep` vì dừng mọi process tên `sleep` của bạn.
:::

---

## Slide 10: Chỉ biến đã export mới sang process con

![Biến shell không sang process con, biến export thì có](/slides/img/s04-env.svg)

::: details Ghi chú cho mentor
- Ứng dụng starter-project đọc `DB_PASSWORD`, `WEB_PORT` từ môi trường; `docker run -e` và `env:` trong Actions bắt chước cơ chế này.
- systemd (tùy chọn, L2): unit file trong `/etc/systemd/system/`; `systemctl start|stop|status`, log bằng `journalctl -u tên`, `Restart=on-failure` tự khởi động lại. WSL2 cần `systemd=true` trong `/etc/wsl.conf`.
:::

---

## Slide 11: Demo 2: biến export

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

Quên `export` thì ứng dụng đọc `DB_PASSWORD` thấy gì?

---

## Slide 12: Debug: thêm vào group vẫn Permission denied

![Phiên cũ giữ danh sách group cũ nên vẫn bị từ chối, đăng nhập lại thì được](/slides/img/s04-stale-group.svg)

::: details Ghi chú cho mentor
- Thử thách: bạn mới báo Permission denied 10 phút sau `usermod -aG`. Việc đầu tiên: `id` trong terminal của bạn ấy, rồi `ls -ld` và `namei -l`. Không dùng `chmod 777`.
- Bonus: Dockerfile backend chạy user không phải root theo nguyên tắc quyền tối thiểu.

| Triệu chứng | Cách xử lý |
| --- | --- |
| File chung có group là tên cá nhân | `sudo chmod g+s thư-mục`, file cũ sửa bằng `chgrp` |
| Dev khác chỉ đọc được file | Dùng umask 002 hoặc 007 |
| `usermod -G` làm mất group khác | Luôn dùng `usermod -aG` |
| `status=203/EXEC` | Kiểm tra đường dẫn tuyệt đối và `chmod 755` |
:::

---

## Slide 13: Lab: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Group `clbdev` và ba user, `usermod -aG` | `id clb-guest` không có `clbdev` |
| 2 | Thư mục `chmod 2770`, so với không setgid | guest bị `Permission denied` |
| 3 | `sleep` nền, `kill`, `kill -9` | lệnh cuối in `sach` |
| 4 | Biến shell và biến `export` | `[trong]` rồi `[doi-mat-khau-that]` |

Lệnh đầy đủ: [Buổi 04 – Linux Administration](../../labs/week-02/session-04.md).

::: details Ghi chú cho mentor
- Nhắc `-a` trong `usermod -aG`. Dọn user, group, thư mục thử nghiệm rồi nộp `lab-04/`.
- Cẩn thận `sudo rm -rf`: chỉ chạy trên đúng hai thư mục của lab.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: một nhóm quyền, SIGTERM trước, phải export](/slides/img/s04-recap.svg)

Buổi tiếp theo: [Buổi 05 – Networking Fundamentals](session-05.md).
