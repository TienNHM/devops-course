# Kịch bản Buổi 04 – Linux Administration

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 04 – Linux Administration](../../labs/week-02/session-04.md). Slide: [Slide buổi 04 – Linux Administration](../../slides/01-foundation/session-04.md). Hướng dẫn chấm: [Hướng dẫn chấm Tuần 2](../grading/week-02.md). Đáp án: [Đáp án Tuần 2](../walkthroughs/week-02.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 04: khung thời gian, các lệnh nguy hiểm cần nhắc, demo quyền, biến môi trường và tín hiệu, câu hỏi cho lớp và ghi chú theo từng slide (14 slide).

Tuần 2/16 · Giai đoạn 1 – Engineering Foundation · Buổi 04/32

## Khung thời gian

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ 60 phút lab: Chuẩn bị 5', Phần 1 (group và user) 8', Phần 2 (thư mục chung với setgid) 15', Phần 3 (process) 12', Phần 4 (biến môi trường) 8', dọn dẹp 5', ghi evidence 7'. Thử thách L2 (`resource-check.sh`, service systemd, `permissions-notes.md`) làm ở nhà trên [Buổi 04 – Thử thách thêm](../../labs/week-02/session-04-challenge.md); Bài 2 (systemd) mất thêm thời gian cấu hình WSL nên không làm tại lớp.

## Lưu ý cho người dạy

- Lệnh nguy hiểm trong buổi: `sudo rm -rf` ở phần dọn dẹp và `wsl --shutdown` ở L2. Nhắc học viên đọc kỹ đường dẫn trước khi nhấn Enter và chỉ xóa đúng `/srv/club-shared`, `/srv/club-nosgid`.
- `sudo -u clb-dev3 ls ...` luôn mở một tiến trình mới nên thấy group mới ngay, không chứng minh được phiên đăng nhập thật đã có group. Để chứng minh, chạy `id` trong chính terminal của học viên đó.
- Lệnh dừng process của bài lab là `kill %2` và `pkill -9 -f "sleep 700"`. Không dùng `pkill sleep` vì nó dừng mọi process `sleep` của học viên; bài tập tuần cấm lệnh này.
- Nếu WSL của lớp chưa bật systemd, chỉ giới thiệu khái niệm (slide 8); Bài 2 của L2 làm ở nhà. Nếu `systemctl` báo offline, bật `systemd=true` trong `/etc/wsl.conf` rồi `wsl --shutdown`; nhắc thêm mục `[boot]` thay vì ghi đè file có sẵn. Chi tiết lời giải systemd và `resource-check.sh` nằm trong [Đáp án Tuần 2](../walkthroughs/week-02.md).
- Số UID và GID ở máy học viên có thể khác ví dụ. Cảnh báo kỹ lỗi thiếu `-a` trong `usermod -aG` làm user mất group `sudo`.

## Kịch bản demo

Mục tiêu (khoảng 10 phút, ứng với slide 9 và 10): cho lớp thấy quyền quyết định việc đọc, ghi và tín hiệu quyết định việc dừng process.

1. Xem quyền thực tế và nhận biết owner, group, other.

```bash
id
ls -ld /tmp /etc/shadow ~
```

Kết quả mong đợi (rút gọn):

```text
uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)
-rw-r----- 1 root    shadow   1234 Oct 21 09:00 /etc/shadow
drwxr-x--- 8 student student  4096 Oct 21 09:00 /home/student
drwxrwxrwt 12 root    root    4096 Oct 21 09:00 /tmp
```

`ls` sắp xếp các đối số theo tên nên `/etc/shadow` hiện trước, `~` (đã mở rộng thành `/home/student`) ở giữa, `/tmp` sau cùng.

Hỏi lớp: vì sao `/tmp` có chữ `t` ở cuối? Vì sao bạn không `cat /etc/shadow` được?

2. Thử đọc file không có quyền.

```bash
cat /etc/shadow
sudo cat /etc/shadow | head -n 1 | cut -d: -f1
```

Kết quả mong đợi: dòng đầu `cat: /etc/shadow: Permission denied`; dòng sau chỉ in `root` (chỉ lấy tên user, không in hash).

3. Biến shell và biến môi trường.

```bash
CLUB=dsc
bash -c 'echo "con thay: [$CLUB]"'
export CLUB
bash -c 'echo "con thay: [$CLUB]"'
```

Kết quả mong đợi:

```text
con thay: []
con thay: [dsc]
```

Hỏi lớp: nếu quên `export` thì điều gì xảy ra với ứng dụng đọc `DB_PASSWORD`?

4. Process và tín hiệu.

```bash
sleep 300 &
pgrep -a sleep
kill $(pgrep -n sleep)
sleep 1; pgrep -a sleep || echo "da dung"
```

Kết quả mong đợi: dòng đầu in PID job (ví dụ `[1] 4242`), `pgrep` in `4242 sleep 300`, sau `kill` in `da dung`.

Hỏi lớp: lệnh `kill` mặc định gửi tín hiệu nào? Khi nào cần `kill -9`?

## Câu hỏi cho lớp

- Vì sao `/tmp` có chữ `t` ở cuối? Vì sao bạn không `cat /etc/shadow` được?
- Nếu quên `export` thì điều gì xảy ra với ứng dụng đọc `DB_PASSWORD`?
- Lệnh `kill` mặc định gửi tín hiệu nào? Khi nào cần `kill -9`?
- Ai từng gặp `Permission denied` và đã xử lý bằng cách nào?
- Nếu bạn là trưởng nhóm, bạn muốn hệ thống ghi lại điều gì khi có sự cố?
- Để vào sâu `/a/b/c` cần quyền gì ở mỗi thư mục dọc đường? (`x` trên mọi thư mục.)
- Nếu owner chỉ có `r` nhưng group có `rw`, owner ghi được không? (Không, vì khớp owner thì chỉ dùng quyền owner.)
- Nếu thiếu setgid và umask là 022 thì dev2 làm được gì với file của dev1? (Chỉ đọc.)
- Tình huống tại lớp: bạn mới báo `Permission denied` 10 phút sau khi bạn đã chạy `usermod -aG`. Việc làm đầu tiên là gì? Không được dùng `chmod 777`.
- Bonus: vì sao Dockerfile của backend starter-project chạy bằng user không phải root?

## Ghi chú theo slide

Số slide theo [Slide buổi 04 – Linux Administration](../../slides/01-foundation/session-04.md) (14 slide).

**Slide 1 – Mục tiêu buổi học.** Mở đầu 2 phút. Nhấn mạnh: container thực chất là process Linux, nên mọi thứ hôm nay quay lại ở Docker và Kubernetes. Hỏi lớp: ai từng gặp Permission denied và đã xử lý bằng cách nào.

**Slide 2 – Vấn đề thực tế.** Kể câu chuyện này như tình huống của CLB. Hỏi: nếu bạn là trưởng nhóm, bạn muốn hệ thống ghi lại điều gì khi có sự cố? Thời lượng 2 phút.

**Slide 3 – User, group và UID/GID.** Chạy `id` trên màn hình chiếu và chỉ từng trường uid, gid, groups. Nhắc không bao giờ chép `/etc/shadow` ra ngoài. 3 phút.

**Slide 4 – Quyền file r, w, x.** Vẽ bảng r/w/x lên bảng. Câu hỏi cho lớp: để vào sâu `/a/b/c` cần quyền gì ở mỗi thư mục dọc đường? (`x` trên mọi thư mục.) 3 phút.

**Slide 5 – Kernel chọn đúng một nhóm quyền.** Đây là sơ đồ trọng tâm của buổi. Hỏi: nếu owner chỉ có `r` nhưng group có `rw`, owner ghi được không? (Không, vì khớp owner thì chỉ dùng quyền owner.) 3 phút.

**Slide 6 – setgid, sticky bit, umask.** Hỏi lại câu của demo: vì sao `/tmp` có chữ `t` ở cuối? Giải thích setgid bằng ví dụ: không có nó, file của dev1 mang group riêng của dev1 và dev2 không sửa được. 3 phút.

**Slide 7 – Process và tín hiệu.** Hỏi: lệnh `kill` mặc định gửi tín hiệu nào? Liên hệ: `docker stop` gửi SIGTERM trước rồi mới SIGKILL, sẽ gặp lại ở Buổi 08. 2 phút.

**Slide 8 – Biến môi trường và systemd.** Nối với Docker: `docker run -e` và `env:` trong GitHub Actions bắt chước cơ chế `export`. Nếu WSL của lớp chưa bật systemd, chỉ giới thiệu khái niệm, phần làm ở L2. 3 phút.

**Slide 9 – Demo 1: đọc quyền thực tế.** Chiếu terminal. `ls` sắp xếp đối số theo tên nên `shadow` hiện trước. Hỏi lớp: vì sao bạn không `cat` được `shadow`? Vì sao `/tmp` có chữ `t`? 3 phút.

**Slide 10 – Demo 2: biến export và tín hiệu.** Cho học viên đoán output trước khi chạy dòng thứ hai. Phần `sleep 300 &`, `pgrep -a`, `kill` làm ngay sau đó. Tổng demo khoảng 5 phút.

**Slide 11 – Lab: bạn sẽ làm gì.**

- Chuẩn bị: nhắc `tee -a` (append); quên `-a` sẽ ghi đè bằng chứng cũ.
- Phần 1 (8 phút): group và user. Cảnh báo lỗi thiếu `-a` làm user mất group `sudo`.
- Phần 2 (15 phút): thư mục chung. Đứng ở `/tmp` để tránh cảnh báo thư mục hiện tại vì home 750 không cho user khác vào; sau bước này nhắc quay lại `cd ~/devops-labs/lab-04`. So sánh có và không setgid: hỏi lớp nếu thiếu setgid và umask 022 thì dev2 làm được gì với file của dev1.
- Phần 3 (12 phút): `kill %1`, process bỏ qua SIGTERM bằng `trap "" TERM`, dọn bằng `pkill -9 -f "sleep 700"` và `kill %2`.
- Phần 4 (8 phút): `export` bằng `bash -c`.
- Dọn dẹp (5 phút): đọc kỹ đường dẫn trước `sudo rm -rf`; nếu định làm L2 thì có thể dọn sau.
- L2 ở nhà: `resource-check.sh`, service systemd, `permissions-notes.md`. Gợi ý bậc thang có trên trang thử thách.

**Slide 12 – Lỗi thường gặp.**

- Bảng lỗi: chọn 2 dòng hay gặp nhất để kể. Hỏi lớp: lỗi nào trong bảng bạn đã gặp rồi?
- Phá lỗi "đã thêm group nhưng vẫn bị từ chối" (phá lỗi nâng cao ở trang thử thách): để học viên tự đề xuất bước điều tra trước khi chiếu từng bước. Nguyên nhân gốc: phiên đang chạy giữ danh sách group cũ. Dọn: `sudo userdel -r clb-dev3`. 5 phút.

**Slide 13 – Thử thách tại lớp.** Cho nhóm 2 phút thảo luận rồi gọi ngẫu nhiên một nhóm trả lời. Gợi ý: chạy `id` trong terminal của bạn ấy, rồi `ls -ld` và `namei -l`. Đáp án: phiên cũ chưa nạp group mới; yêu cầu đăng nhập lại rồi kiểm tra `id`. Service chạy user riêng theo nguyên tắc quyền tối thiểu.

**Slide 14 – Recap.** Cho 3 học viên mỗi người nhắc lại một ý bằng lời của mình. Nhắc dọn user, group, thư mục thử nghiệm và nộp `lab-04/`. Buổi sau: Networking Fundamentals.
