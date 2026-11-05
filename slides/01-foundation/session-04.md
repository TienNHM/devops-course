# Slide buổi 04 – Linux Administration

> **Tóm tắt:** Buổi học trình bày cách tạo user và group, phân quyền thư mục dùng chung bằng chmod, chown và setgid, quản lý process và biến môi trường, và chạy một systemd service trên WSL2 Ubuntu. Bài học: [Buổi 04 – Linux Administration](../../labs/week-02/session-04.md).

## Slide 1: Mục tiêu của buổi học

![Ba mục tiêu: phân quyền, quản lý process, biến môi trường](/slides/img/s04-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Mục tiêu đầy đủ: giải thích owner, group, other với r, w, x; tạo user, group, thư mục chung; tìm và dừng process; phân biệt biến shell và biến `export`.
- Cuối buổi còn chạy service bằng `systemctl` và chẩn đoán `Permission denied` mà không dùng `chmod 777`.
- Câu hỏi mở đầu: ai từng xử lý lỗi quyền bằng `chmod 777`?
:::

---

## Slide 2: Bài toán thực tế: một tài khoản chung và `chmod 777`

![Cả nhóm dùng chung tài khoản, chmod 777, mất .env không truy vết được](/slides/img/s04-problem.svg)

::: details Ghi chú cho mentor
- Tình huống: một thành viên xóa nhầm `.env` của người khác, và mọi thao tác đều mang cùng một tên người dùng nên không truy vết được.
- Service chạy bằng root: nếu bị khai thác thì toàn bộ máy bị ảnh hưởng.
- Docker và Kubernetes dựa trên các khái niệm này: container là process Linux, và nhiều lỗi `permission denied` bắt nguồn từ UID/GID.
:::

---

## Slide 3: Khái niệm: User, group, UID và GID

```text
$ id
uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)
```

- **UID** và **GID** là số định danh của user và của group; Linux so sánh các số này, còn tên chỉ là nhãn.
- UID 0 là root, user thông thường bắt đầu từ 1000. Mỗi user có một group chính và có thể có nhiều group phụ.

::: details Ghi chú cho mentor
- Ví dụ so sánh: UID giống số căn cước, group giống tổ công tác.
- Tệp chính: `/etc/passwd`, `/etc/group`, `/etc/shadow` (chỉ root đọc). Xem group bằng `getent group tên`.
:::

---

## Slide 4: Khái niệm: Chuỗi quyền `drwxrws---`

![Chuỗi quyền gồm loại, owner, group, other và giá trị r 4, w 2, x 1](/slides/img/s04-perm-string.svg)

- **Chuỗi quyền** là 10 ký tự do `ls -l` hiển thị: loại tệp, rồi ba nhóm quyền r, w, x cho owner, group và other.
- Với thư mục, r cho phép liệt kê, w cho phép tạo hoặc xóa tệp, x cho phép đi vào. Ví dụ `chmod 750` nghĩa là `rwx`, `r-x`, `---`.

::: details Ghi chú cho mentor
- Hay nhầm: xóa tệp cần quyền w trên thư mục chứa nó, không phải quyền w trên tệp.
:::

---

## Slide 5: Kernel chỉ chọn một nhóm quyền

![Kernel kiểm tra UID owner, rồi GID group, còn lại là other](/slides/img/s04-kernel-pick.svg)

::: details Ghi chú cho mentor
- Quyền của owner và group không cộng dồn. Group phụ cũng được tính.
- Kernel còn kiểm tra bit x của mọi thư mục dọc đường dẫn (`namei -l` hiển thị điều này).
- Câu hỏi: tệp có quyền `640`, owner là alice, group là dev. Bob thuộc dev có ghi được không? (Không, chỉ đọc.)
:::

---

## Slide 6: Khái niệm: setgid và umask

![Thư mục có setgid cho file mới group clbdev, không có thì group cá nhân](/slides/img/s04-setgid.svg)

- **setgid** trên thư mục khiến tệp mới tạo bên trong thuộc group của thư mục, thay vì group chính của người tạo.
- **umask** là mặt nạ quyền bị loại khi tạo tệp mới; ví dụ umask 007 cho tệp mới có quyền `rw-rw----`.

::: details Ghi chú cho mentor
- Công thức thư mục chung: group sở hữu + `2770` + umask 007 hoặc 002.
- umask là quyền bị trừ khi tạo tệp: 022 cho tệp 644, 007 cho tệp 660.
- Sticky bit (`+t`): chỉ owner của tệp được xóa tệp trong thư mục, như `/tmp`.
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
- Câu hỏi: vì sao `/tmp` có chữ `t` ở cuối? Vì sao `cat /etc/shadow` bị chặn?
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

Dòng cuối là kết quả khi `clb-guest` chạy `ls`.

::: details Ghi chú cho mentor
- Chữ `s` ở nhóm group là setgid; nhóm other là `---` nên người ngoài không vào được.
- Dùng `sudo -u clb-dev1 bash -c '...'` để thử từng user, và đứng ở `/tmp` vì home có quyền 750.
:::

---

## Slide 9: Khái niệm: Process, PID và tín hiệu

![kill gửi SIGTERM để process tự dọn; kill -9 gửi SIGKILL giết ngay](/slides/img/s04-signals.svg)

- **Process** là một chương trình đang chạy, được nhận diện bằng PID; mỗi process có UID và PPID (PID của process cha).
- **Tín hiệu** (signal) là thông điệp gửi tới process. `kill` gửi SIGTERM để process tự dọn dẹp; `kill -9` gửi SIGKILL để dừng ngay.

::: details Ghi chú cho mentor
- Tìm process bằng `ps aux`, `pgrep -a tên`; `jobs` liệt kê job của shell.
- Lab: `sleep 600 &`, `kill %1`; process chạy `trap "" TERM` bỏ qua SIGTERM nên cần `pkill -9`.
- Không dùng `pkill sleep` vì lệnh này dừng mọi process tên `sleep` của người dùng.
:::

---

## Slide 10: Khái niệm: Biến môi trường và `export`

![Biến shell không sang process con, biến export thì có](/slides/img/s04-env.svg)

- **Biến môi trường** là cặp `TÊN=giá trị` mà process nhận từ môi trường của nó.
- Biến shell thông thường không được truyền cho process con; lệnh `export` đánh dấu biến để process con thừa hưởng.

::: details Ghi chú cho mentor
- Ứng dụng starter-project đọc `DB_PASSWORD`, `WEB_PORT` từ môi trường; `docker run -e` và `env:` trong Actions dùng cùng cơ chế này.
- systemd (tùy chọn, L2): unit file trong `/etc/systemd/system/`; `systemctl start|stop|status`, xem log bằng `journalctl -u tên`, `Restart=on-failure` tự khởi động lại. WSL2 cần `systemd=true` trong `/etc/wsl.conf`.
:::

---

## Slide 11: Demo 2: biến `export`

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

Câu hỏi: nếu quên `export`, ứng dụng đọc `DB_PASSWORD` sẽ nhận được giá trị nào?

---

## Slide 12: Debug: đã thêm vào group nhưng vẫn `Permission denied`

![Phiên cũ giữ danh sách group cũ nên vẫn bị từ chối, đăng nhập lại thì được](/slides/img/s04-stale-group.svg)

::: details Ghi chú cho mentor
- Thử thách: thành viên mới báo `Permission denied` 10 phút sau `usermod -aG`. Việc đầu tiên: chạy `id` trong terminal của thành viên đó, rồi `ls -ld` và `namei -l`. Không dùng `chmod 777`.
- Mở rộng: Dockerfile backend chạy bằng user không phải root theo nguyên tắc quyền tối thiểu.

| Triệu chứng | Cách xử lý |
| --- | --- |
| Tệp chung có group là tên cá nhân | `sudo chmod g+s thư-mục`, tệp cũ sửa bằng `chgrp` |
| Dev khác chỉ đọc được tệp | Dùng umask 002 hoặc 007 |
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
- Nhắc tùy chọn `-a` trong `usermod -aG`. Dọn user, group, thư mục thử nghiệm rồi nộp `lab-04/`.
- Thận trọng với `sudo rm -rf`: chỉ chạy trên đúng hai thư mục của lab.
:::

---

## Slide 14: Tổng kết

![Ba điều cần nhớ: một nhóm quyền, SIGTERM trước, phải export](/slides/img/s04-recap.svg)

Buổi tiếp theo: [Buổi 05 – Networking Fundamentals](session-05.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [credentials(7): user, group, process](https://man7.org/linux/man-pages/man7/credentials.7.html): hiểu UID, GID và quyền của tiến trình.
- **Tài liệu chính thức:** [The Linux Command Line](https://linuxcommand.org/tlcl.php): các chương về quyền, tiến trình, gói phần mềm.
- **Best practice:** [CIS Benchmarks](https://www.cisecurity.org/benchmarks): chuẩn hardening Linux được dùng rộng rãi.
- **Best practice:** [OWASP Top 10](https://owasp.org/www-project-top-ten/): 10 rủi ro bảo mật phổ biến cần biết.
