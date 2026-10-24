# Kịch bản mentor – Buổi 04: Linux Administration

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 04 – Linux Administration](../../labs/week-02/session-04.md). Slide: [Slide buổi 04](../../slides/01-foundation/session-04.md). Đáp án: [Walkthrough tuần 2](../walkthroughs/week-02.md). Barem: [Chấm điểm tuần 2](../grading/week-02.md).
:::

Tuần 2 · Giai đoạn 1 – Engineering Foundation · Buổi 04/32

## Khung thời gian buổi 120 phút

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Phần thực hành 60 phút: Phần 1 đến 4 là L1 (khoảng 40 phút); L2 làm tiếp trong 20 phút còn lại: bài 1 và bài 3 làm trên lớp, bài 2 (systemd) có thể hoàn thành ở nhà. Nhịp trên slide: Phần tạo group và user 5', thư mục chung với setgid 8', so sánh có và không setgid 5', phá lỗi 5'.

## Demo của mentor

Mục tiêu (khoảng 10 phút): cho lớp thấy quyền quyết định việc đọc/ghi và tín hiệu quyết định việc dừng process.

1. Xem quyền thực tế và nhận biết owner/group/other.

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

## Câu hỏi mentor nên hỏi lớp

- Vì sao `/tmp` có chữ `t` ở cuối? Vì sao bạn không `cat /etc/shadow` được?
- Nếu quên `export` thì điều gì xảy ra với ứng dụng đọc `DB_PASSWORD`?
- Lệnh `kill` mặc định gửi tín hiệu nào? Khi nào cần `kill -9`?
- Ai từng gặp `Permission denied` và đã xử lý bằng cách nào?
- Nếu bạn là trưởng nhóm, bạn muốn hệ thống ghi lại điều gì khi có sự cố?
- Để vào sâu `/a/b/c` cần quyền gì ở mỗi thư mục dọc đường? (`x` trên mọi thư mục.)
- Nếu owner chỉ có `r` nhưng group có `rw`, owner ghi được không? (Không, vì khớp owner thì chỉ dùng quyền owner.)
- Nếu thiếu setgid và umask 022 thì dev2 làm được gì với file của dev1?
- Tình huống tại lớp: bạn mới báo `Permission denied` 10 phút sau khi bạn đã chạy `usermod -aG`. Việc làm đầu tiên là gì? Không được dùng `chmod 777`.
- Bonus: vì sao Dockerfile của backend starter-project chạy bằng user không phải root?

## Ghi chú giảng viên từ slide

Nguyên văn các ghi chú giảng viên của bộ slide cũ, xếp theo chủ đề của slide mới.

**Slide Mục tiêu buổi học.** Mở đầu 2 phút. Nhấn mạnh: container thực chất là process Linux, nên mọi thứ hôm nay quay lại ở Docker và Kubernetes. Hỏi lớp: ai từng gặp Permission denied và đã xử lý bằng cách nào.

**Slide Vấn đề thực tế.** Kể câu chuyện này như tình huống của CLB. Hỏi: nếu bạn là trưởng nhóm, bạn muốn hệ thống ghi lại điều gì khi có sự cố? Thời lượng 2 phút.

**Slide User, group và UID/GID.** Chạy `id` trên màn hình chiếu và chỉ từng trường uid, gid, groups. Nhắc không bao giờ chép `/etc/shadow` ra ngoài. 3 phút.

**Slide Quyền file r, w, x.** Vẽ bảng r/w/x lên bảng. Câu hỏi cho lớp: để vào sâu `/a/b/c` cần quyền gì ở mỗi thư mục dọc đường? (x trên mọi thư mục.) 3 phút.

**Slide Kernel chọn đúng một nhóm quyền.** Đây là sơ đồ trọng tâm của buổi. Hỏi: nếu owner chỉ có r nhưng group có rw, owner ghi được không? (Không, vì khớp owner thì chỉ dùng quyền owner.) 3 phút.

**Slide setgid, sticky bit, umask.** Hỏi lại câu của demo: vì sao /tmp có chữ t ở cuối? Giải thích setgid bằng ví dụ: không có nó, file của dev1 mang group riêng của dev1 và dev2 không sửa được. 3 phút.

**Slide Process và tín hiệu.** Hỏi: lệnh kill mặc định gửi tín hiệu nào? Liên hệ: docker stop gửi SIGTERM trước rồi mới SIGKILL, sẽ gặp lại ở buổi Docker. 2 phút.

**Slide Biến môi trường và systemd.** Nối với Docker: `docker run -e` và `env:` trong GitHub Actions bắt chước cơ chế export. Nếu WSL của lớp chưa bật systemd, chỉ giới thiệu khái niệm, phần làm ở L2. 3 phút.

**Slide Demo – đọc quyền thực tế.** Chiếu terminal. `ls` sắp xếp đối số theo tên nên shadow hiện trước. Hỏi lớp: vì sao bạn không cat được shadow? Vì sao /tmp có chữ t? 3 phút.

**Slide Demo – biến export và tín hiệu.** Cho học viên đoán output trước khi chạy dòng thứ hai. Tổng demo khoảng 5 phút.

**Slide Lab (chuẩn bị, group và user, thư mục chung, so sánh setgid).**

- Chuẩn bị: lab 60 phút: L1 khoảng 40 phút, L2 khoảng 20 phút. Nhắc `tee -a` (append), quên `-a` sẽ ghi đè bằng chứng cũ.
- Group và user: số UID và GID ở máy học viên có thể khác. Cảnh báo kỹ lỗi thiếu `-a` làm user mất group sudo. 5 phút.
- Thư mục chung: đứng ở /tmp để tránh cảnh báo thư mục hiện tại vì home 750 không cho user khác vào. Sau bước này nhắc quay lại `cd ~/devops-labs/lab-04`. 8 phút.
- So sánh có và không setgid: hỏi lớp: nếu thiếu setgid và umask 022 thì dev2 làm được gì với file của dev1? Nhắc học viên làm Phần 3 (kill, pkill -9 với process bỏ qua SIGTERM) và Phần 4 (export). 5 phút.

**Slide Lab L2.** Nếu systemctl báo offline thì bật `systemd=true` trong `/etc/wsl.conf` rồi `wsl --shutdown`; nhắc ghi thêm mục [boot] thay vì ghi đè file có sẵn. Bài 2 có thể hoàn thành ở nhà.

**Slide Gặp lỗi (bảng lỗi và phá lỗi).**

- Bảng lỗi: chọn 2 dòng hay gặp nhất để kể. Hỏi lớp: lỗi nào trong bảng bạn đã gặp rồi?
- Phá lỗi "đã thêm group nhưng vẫn bị từ chối": để học viên tự đề xuất bước điều tra trước khi chiếu từng bước. Nguyên nhân gốc: phiên đang chạy giữ danh sách group cũ. Dọn: `sudo userdel -r clb-dev3`. 5 phút.

**Slide Thử thách tại lớp.** Cho nhóm 2 phút thảo luận rồi gọi ngẫu nhiên một nhóm trả lời. Gợi ý: chạy `id` trong terminal của bạn ấy, rồi `ls -ld` và `namei -l`. Đáp án: phiên cũ chưa nạp group mới; yêu cầu đăng nhập lại rồi kiểm tra `id`. Service chạy user riêng theo nguyên tắc quyền tối thiểu.

**Slide Recap.** Cho 3 học viên mỗi người nhắc lại một ý bằng lời của mình. Buổi sau: Networking Fundamentals.

## Lưu ý riêng cho người dạy

- Lệnh nguy hiểm trong buổi: `sudo rm -rf` ở phần dọn dẹp, `wsl --shutdown` ở L2. Nhắc học viên đọc kỹ đường dẫn trước khi nhấn Enter và chỉ xóa đúng `/srv/club-shared`, `/srv/club-nosgid`.
- `sudo -u clb-dev3 ls ...` luôn mở một tiến trình mới nên thấy group mới ngay, không chứng minh được phiên đăng nhập thật đã có group; để chứng minh, chạy `id` trong chính terminal của học viên đó.
- Bản gốc của bài lab dùng `pkill sleep`; bản hiện tại dùng `kill %2` để không dừng mọi process `sleep`. Bài tập tuần cấm `pkill sleep`.
- Nếu WSL của lớp chưa bật systemd, chỉ giới thiệu khái niệm; bài 2 của L2 làm ở nhà. Chi tiết lời giải systemd và `resource-check.sh` có trong [Walkthrough tuần 2](../walkthroughs/week-02.md).
