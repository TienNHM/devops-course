# Kịch bản mentor – Buổi 02: Development Environment

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 02 – Development Environment](../../labs/week-01/session-02.md). Slide: [Slide Buổi 02 – Development Environment](../../slides/01-foundation/session-02.md). Đáp án và barem: [Đáp án Tuần 1](../walkthroughs/week-01.md), [Hướng dẫn chấm Tuần 1](../grading/week-01.md).
:::

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ 60 phút lab tại lớp (theo bản thu gọn): cài WSL2 và Ubuntu khoảng 30 phút lần đầu (gồm khởi động lại), VS Code Remote WSL 10 phút, `git config` 5 phút, chạy `check-env.sh` 10 phút, chuẩn bị 5 phút. SSH key, nối remote và gom evidence là phần làm ở nhà. Bản lab cũ chia 15 phút WSL, 10 phút VS Code, 20 phút Git và SSH, 15 phút script; thực tế cài WSL kèm khởi động lại thường lâu hơn nên đã đổi.

## Lưu ý riêng cho người dạy

- Các bước cài đặt đã chuyển sang [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md), là nguồn duy nhất. Khi hướng dẫn đổi, chỉ sửa ở đó.
- L1 chạy `resources/check-env.sh` có sẵn trong repo giáo trình (clone ở `~/devops-course`). Tự viết script là thử thách L2, nằm ở [Buổi 02 – Thử thách thêm](../../labs/week-01/session-02-challenge.md).
- Máy học viên chưa bật ảo hóa trong BIOS sẽ gặp lỗi ở bước cài WSL. Nên nhờ học viên kiểm tra mục Virtualization trong Task Manager trước buổi học, và khuyến khích cài WSL trước giờ lên lớp để tiết kiệm thời gian.
- Bước phá lỗi quyền SSH key trong bài học viên giờ dùng khóa thử `~/.ssh/test_key` với `ssh -o IdentitiesOnly=yes`, không dùng `ssh-add -D` và không đổi quyền khóa thật. Kịch bản gốc dưới đây (slide cũ 19) ghi ở dạng nguyên văn; khi chạy thực tế hãy dùng cách mới để không làm hỏng khóa của học viên.
- Evidence của L1 có ngoại lệ: dòng `wsl --list --verbose` dán tay từ PowerShell. Mã thoát 1 của `check-env.sh` ở tuần này là trạng thái đúng vì chưa cài Docker và các công cụ khác.

## Demo của mentor

Mentor dùng một máy sạch (hoặc máy ảo Windows 11) và trình chiếu terminal. Thời gian: khoảng 12 phút trong phần 30 phút kiến thức.

### Bước 1. Cho thấy hai thế giới filesystem

```bash
pwd
ls /mnt/c | head -5
cd ~ && mkdir -p demo && cd demo && pwd
```

Kết quả mong đợi (tên người dùng sẽ khác, danh sách thư mục trong `/mnt/c` tùy máy):

```text
/home/mentor
'$Recycle.Bin'
'Documents and Settings'
...
/home/mentor/demo
```

Câu hỏi cho lớp: "Hai đường dẫn này đang nằm trên ổ đĩa nào? Tại sao ta không để code trong `/mnt/c`?"

### Bước 2. Đo sự chênh lệch tốc độ

::: danger Lệnh xóa thư mục: chỉ nhắm đúng thư mục demo
Khối lệnh dưới kết thúc bằng `rm -rf` trên hai thư mục `io-test` vừa tạo. Đọc kỹ đường dẫn trước khi chạy, không đổi sang thư mục có dữ liệu thật.
:::

```bash
mkdir -p ~/demo/io-test /mnt/c/Users/Public/io-test
cd ~/demo/io-test
time (for i in $(seq 1 2000); do echo x > f$i.txt; done)
cd /mnt/c/Users/Public/io-test
time (for i in $(seq 1 2000); do echo x > f$i.txt; done)
cd ~ && rm -rf ~/demo/io-test /mnt/c/Users/Public/io-test
```

Kết quả mong đợi: lần chạy trong `~/demo` nhanh hơn rõ rệt (thường vài lần trở lên) so với `/mnt/c`. Con số chính xác phụ thuộc máy; điều quan trọng là xu hướng. Demo dùng thư mục riêng `io-test` và xóa ngay sau khi đo, không dùng `rm f*.txt` trong thư mục có sẵn dữ liệu.

Câu hỏi: "Nếu `npm install` tạo hàng chục nghìn file nhỏ thì chuyện gì xảy ra?"

### Bước 3. Cho thấy apt và shell

```bash
sudo apt update
sudo apt install -y tree
tree -L 1 ~
echo "$SHELL"; echo "$HOME"
```

Kết quả mong đợi: `apt` liệt kê các kho đã truy cập (Hit, Get), `tree` in cấu trúc thư mục, `$SHELL` là `/bin/bash`, `$HOME` là `/home/mentor`.

Câu hỏi: "Tại sao phải chạy `apt update` trước `apt install`?"

### Bước 4. Mở VS Code từ WSL và thử SSH tới GitHub

```bash
code .
ssh -T git@github.com
```

Kết quả mong đợi: cửa sổ VS Code mở với góc dưới trái ghi "WSL: Ubuntu". Lệnh `ssh -T` in dòng "Hi TEN_GITHUB! You've successfully authenticated, but GitHub does not provide shell access." (nếu mentor đã cấu hình key).

Câu hỏi: "Terminal bên trong VS Code đang chạy trên Windows hay Linux? Làm sao biết?"

## Ghi chú giảng viên theo slide

Số slide theo [Slide Buổi 02 – Development Environment](../../slides/01-foundation/session-02.md) (bản thu gọn, 14 slide).

**Slide 1 – Mục tiêu buổi học.** 2 phút. Nói rõ: từ Buổi 03 trở đi mọi lab giả định bạn đang ở terminal Ubuntu của WSL2, nên buổi này là nền móng. Yêu cầu học viên mở sẵn trang GitHub.

**Slide 2 – Vấn đề 20 máy, 20 môi trường.** Hỏi lớp: ai đã gặp lỗi `\r`? Dẫn dắt: server thật gần như luôn là Linux, nên luyện tập trên Linux giúp lệnh chạy y hệt từ laptop lên CI.

**Slide 3 – WSL2 là gì, WSL1 và máy ảo.**

- Không cần giải thích Hyper-V chi tiết. Câu hỏi: khác gì cài VirtualBox? Trả lời: không phải cấu hình RAM, đĩa, mạng thủ công.
- Chỉ nhấn hai hàng của bảng: nhân thật và `/mnt/c` chậm. Hàng sau là lý do của quy tắc "code nằm trong `~`".

**Slide 4 – Terminal, shell, bash.** Hỏi: Windows Terminal đang mở tab Ubuntu thì đâu là terminal, đâu là shell? Câu trả lời đúng: Windows Terminal là terminal, bash là shell.

**Slide 5 – Hai thế giới filesystem.** Đây là quy tắc quan trọng nhất của buổi. Từ Windows, xem file Linux qua `\\wsl$\Ubuntu\home\TEN_BAN`. Sẽ có demo đo tốc độ ở slide 9.

**Slide 6 – Package manager apt.** Câu hỏi: tại sao phải update trước install? Trả lời: không có danh sách mới, apt có thể không tìm thấy gói hoặc cài bản cũ.

**Slide 7 – SSH key: public và private, SSH tới GitHub hoạt động thế nào.**

- Ví dụ so sánh: public key như ổ khóa, private key như chìa khóa. Câu hỏi: file nào được dán lên GitHub, file nào không? Nhấn mạnh đuôi `.pub`.
- Private key không bao giờ rời máy, chỉ có chữ ký đi qua mạng. ssh-agent giữ key đã mở khóa để không gõ passphrase liên tục.

**Slide 8 – Kiến trúc môi trường.** Giải thích: giao diện VS Code ở Windows nhưng terminal, extension, debugger chạy trong Linux. Docker Desktop cài ở buổi sau, giờ chỉ chuẩn bị nền.

**Slide 9 – Demo: hai filesystem và đo tốc độ ext4 với /mnt/c.**

- Hai filesystem: câu hỏi: hai đường dẫn này nằm trên ổ nào? Vì sao không để code trong `/mnt/c`? Chưa trả lời ngay, để phần đo tốc độ minh họa bằng số đo.
- Đo tốc độ: chiếu hai kết quả `real` cạnh nhau. Câu hỏi: `npm install` tạo hàng chục nghìn file nhỏ thì chuyện gì xảy ra? Nhắc không dùng `rm f*.txt` trong thư mục có dữ liệu.

**Slide 10 – Bản đồ lab.**

- Bản đồ của lab: học viên chưa bật ảo hóa trong BIOS sẽ gặp lỗi ở bước cài WSL, xem slide 12. Dặn trước: không làm trong `/mnt/c`.
- Phần cài WSL2: khoảng 15 phút trong bản lab cũ, nhiều người chờ tải. Trong lúc chờ, giảng slide 5 và 7. Mật khẩu Linux gõ không hiện ký tự, đó là bình thường, nhắc trước kẻo học viên tưởng máy treo.
- Phần VS Code Remote WSL: câu hỏi: terminal trong VS Code đang chạy trên Windows hay Linux, làm sao biết? Đáp án: nhìn nhãn góc dưới trái và kết quả `uname -a`. `code: command not found` thì chạy `wsl --shutdown` rồi mở lại Ubuntu.
- Phần Git và SSH key: nên đặt passphrase. Lần đầu SSH hỏi fingerprint, đối chiếu với tài liệu GitHub rồi gõ yes. Mã thoát 1 của `ssh -T` là bình thường. Chỉ chia sẻ file `.pub`, không bao giờ chụp màn hình private key.
- Phần script check-env: bản cũ yêu cầu tự viết script (bản rút gọn, nay là thử thách L2). Giải thích `set -u` và `chmod +x`. Lưu mã thoát ngay sau khi chạy: `code=$?`, đừng đi qua `tee`.

**Slide 11 – Checklist L1 và L2.** Ai xong L1 sớm chuyển sang L2. Nhắc nộp: không có private key hay token trong repo, chỉ public key được phép.

**Slide 12 – Lỗi thường gặp.**

- Quyền file SSH key: cho học viên tự phá và tự sửa (xem lưu ý ở đầu trang: dùng khóa thử). Cách điều tra: đọc dòng "too open", chạy `ls -l ~/.ssh`, `ssh -vT git@github.com`. Phòng tránh: không sao chép key từ ổ Windows.
- Môi trường: kiểm tra mục Virtualization trong Task Manager, tab Performance, CPU. Nên nhờ học viên kiểm tra trước buổi học để tránh mất thời gian giữa giờ.

**Slide 13 – Challenge.** Cho lớp thảo luận 3 phút theo cặp. Khuyến khích đọc output của `ssh -vT` thay vì đoán.

**Slide 14 – Recap.** Hỏi nhanh: tại sao dùng `~`? Public key khác private key thế nào? Nhắc hạn nộp `lab-02/` và việc `git push` qua SSH.
