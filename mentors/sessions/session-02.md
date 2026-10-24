# Kịch bản Buổi 02 – Development Environment

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 02 – Development Environment](../../labs/week-01/session-02.md). Slide: [Slide Buổi 02 – Development Environment](../../slides/01-foundation/session-02.md). Hướng dẫn chấm: [Hướng dẫn chấm Tuần 1](../grading/week-01.md). Đáp án: [Đáp án Tuần 1](../walkthroughs/week-01.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 02: khung thời gian, lưu ý về cài WSL và khóa SSH thử, demo hai filesystem và đo tốc độ, câu hỏi cho lớp và ghi chú theo từng slide (14 slide).

## Khung thời gian

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ 60 phút lab tại lớp: Chuẩn bị 5', Phần 1 cài WSL2 và Ubuntu khoảng 30' lần đầu (gồm khởi động lại), Phần 2 VS Code Remote WSL 10', Phần 3 `git config` 5', Phần 4 chạy `check-env.sh` 10'. Phần 5 (SSH key, nối remote) và Phần 6 (gom evidence) làm ở nhà, tổng khoảng 30'. Cài WSL kèm khởi động lại thường lâu hơn dự kiến, nên khuyến khích học viên cài trước giờ lên lớp.

## Lưu ý cho người dạy

- Các bước cài đặt nằm ở [Hướng dẫn cài đặt môi trường](../../resources/setup-guide.md), là nguồn duy nhất. Khi hướng dẫn đổi, chỉ sửa ở đó.
- L1 chạy `bash resources/check-env.sh 2` có sẵn trong repo giáo trình (clone ở `~/devops-course`). Số `2` là mốc Buổi 02: chỉ đòi WSL, git, curl; docker, kubectl, kind hiện `[ DE SAU ]`. Kết quả đúng là `exit code: 0`. Tự viết script kiểm tra là thử thách L2, nằm ở [Buổi 02 – Thử thách thêm](../../labs/week-01/session-02-challenge.md).
- Máy học viên chưa bật ảo hóa trong BIOS sẽ gặp lỗi `0x80370102` ở bước cài WSL. Nhờ học viên kiểm tra mục Virtualization trong Task Manager (tab Performance, CPU) trước buổi học.
- Mật khẩu Linux gõ không hiện ký tự, đó là bình thường. Nhắc trước kẻo học viên tưởng máy treo.
- Bước phá lỗi quyền SSH key chỉ dùng khóa thử `~/.ssh/test_key` với `ssh -o IdentitiesOnly=yes`. Không chạy `ssh-add -D` và không đổi quyền khóa thật `~/.ssh/id_ed25519`, để không làm hỏng khóa mà học viên dùng push về sau.
- Evidence của L1 có một ngoại lệ: dòng `wsl --list --verbose` dán tay từ PowerShell vì lệnh này chạy ngoài Ubuntu.

## Kịch bản demo

Mentor dùng một máy sạch (hoặc máy ảo Windows 11) và trình chiếu terminal. Thời gian: khoảng 12 phút trong phần 30 phút kiến thức, ứng với slide 9.

### Bước 1. Hai thế giới filesystem

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

### Bước 3. apt và shell

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

## Câu hỏi cho lớp

- Hai đường dẫn `pwd` và `/mnt/c` nằm trên ổ nào? Vì sao không để code trong `/mnt/c`?
- Nếu `npm install` tạo hàng chục nghìn file nhỏ thì chuyện gì xảy ra?
- Tại sao phải `apt update` trước `apt install`?
- Terminal bên trong VS Code đang chạy trên Windows hay Linux? Làm sao biết?
- Hỏi nhanh cuối buổi: vì sao dùng `~`? Public key khác private key thế nào?

## Ghi chú theo slide

Số slide theo [Slide Buổi 02 – Development Environment](../../slides/01-foundation/session-02.md) (14 slide).

**Slide 1 – Mục tiêu buổi học.** 2 phút. Nói rõ: từ Buổi 03 trở đi mọi lab giả định bạn đang ở terminal Ubuntu của WSL2, nên buổi này là nền móng. Yêu cầu học viên mở sẵn trang GitHub.

**Slide 2 – Vấn đề 20 máy, 20 môi trường.** Hỏi lớp: ai đã gặp lỗi `\r`? Dẫn dắt: server thật gần như luôn là Linux, nên luyện tập trên Linux giúp lệnh chạy y hệt từ laptop lên CI.

**Slide 3 – WSL2 là gì.**

- Không cần giải thích Hyper-V chi tiết. Câu hỏi: khác gì cài VirtualBox? Trả lời: không phải cấu hình RAM, đĩa, mạng thủ công.
- Chỉ nhấn hai hàng của bảng: nhân thật và `/mnt/c` chậm. Hàng sau là lý do của quy tắc "code nằm trong `~`".

**Slide 4 – Terminal, shell, bash.** Hỏi: Windows Terminal đang mở tab Ubuntu thì đâu là terminal, đâu là shell? Câu trả lời đúng: Windows Terminal là terminal, bash là shell.

**Slide 5 – Hai thế giới filesystem.** Đây là quy tắc quan trọng nhất của buổi. Từ Windows, xem file Linux qua `\\wsl$\Ubuntu\home\TEN_BAN`. Demo đo tốc độ ở slide 9.

**Slide 6 – Package manager apt.** Câu hỏi: tại sao phải update trước install? Trả lời: không có danh sách mới, apt có thể không tìm thấy gói hoặc cài bản cũ.

**Slide 7 – SSH key: public và private.**

- Ví dụ so sánh: public key như ổ khóa, private key như chìa khóa. Câu hỏi: file nào được dán lên GitHub, file nào không? Nhấn mạnh đuôi `.pub`.
- Private key không bao giờ rời máy, chỉ có chữ ký đi qua mạng. ssh-agent giữ key đã mở khóa để không gõ passphrase liên tục.

**Slide 8 – Kiến trúc môi trường.** Giải thích: giao diện VS Code ở Windows nhưng terminal, extension, debugger chạy trong Linux. Docker Desktop cài ở Buổi 07, giờ chỉ chuẩn bị nền.

**Slide 9 – Demo: hai filesystem và đo tốc độ.**

- Hai filesystem: hỏi hai đường dẫn nằm trên ổ nào, vì sao không để code trong `/mnt/c`. Chưa trả lời ngay, để phần đo tốc độ minh họa bằng số đo.
- Đo tốc độ: chiếu hai kết quả `real` cạnh nhau. Câu hỏi: `npm install` tạo hàng chục nghìn file nhỏ thì chuyện gì xảy ra? Nhắc không dùng `rm f*.txt` trong thư mục có dữ liệu.

**Slide 10 – Lab: bản đồ 60 phút ở lớp và việc ở nhà.**

- Phần 1 cài WSL2: khoảng 30 phút lần đầu vì phải tải và khởi động lại. Trong lúc chờ, giảng lại slide 5 và 7. Học viên chưa bật ảo hóa sẽ gặp lỗi ở bước này, xem slide 12. Dặn trước: không làm trong `/mnt/c`.
- Phần 2 VS Code Remote WSL: hỏi terminal trong VS Code đang chạy trên Windows hay Linux, làm sao biết. Đáp án: nhìn nhãn góc dưới trái và kết quả `uname -a`. `code: command not found` thì chạy `wsl --shutdown` (sau khi lưu việc) rồi mở lại Ubuntu.
- Phần 3 Git: giải thích `core.autocrlf input` tránh lỗi `\r` cho script.
- Phần 4 `check-env.sh`: giải thích số `2` là mốc buổi; lưu mã thoát ngay sau khi chạy bằng `code=$?`, đừng đi qua `tee`.
- Phần 5 SSH key (ở nhà): nên đặt passphrase. Lần đầu SSH hỏi fingerprint, đối chiếu với tài liệu GitHub rồi gõ yes. Mã thoát 1 của `ssh -T` là bình thường. Chỉ chia sẻ file `.pub`, không bao giờ chụp màn hình private key.

**Slide 11 – Checklist L1 và L2.** Ai xong L1 sớm chuyển sang L2. Nhắc nộp: không có private key hay token trong repo, chỉ public key được phép.

**Slide 12 – Lỗi thường gặp.**

- Quyền file SSH key: cho học viên tự phá và tự sửa trên khóa thử (xem lưu ý ở đầu trang). Lệnh phá: `ssh-keygen -t ed25519 -f ~/.ssh/test_key -N "" -C "test-only"`, `chmod 644 ~/.ssh/test_key`, `ssh -o IdentitiesOnly=yes -i ~/.ssh/test_key -T git@github.com`. Cách điều tra: đọc dòng "too open", chạy `ls -l ~/.ssh`, `ssh -vT git@github.com`. Phòng tránh: không sao chép key từ ổ Windows.
- Môi trường: kiểm tra mục Virtualization trong Task Manager, tab Performance, CPU. Nên nhờ học viên kiểm tra trước buổi học để tránh mất thời gian giữa giờ.

**Slide 13 – Challenge.** Cho lớp thảo luận 3 phút theo cặp. Khuyến khích đọc output của `ssh -vT` thay vì đoán.

**Slide 14 – Recap.** Hỏi nhanh: tại sao dùng `~`? Public key khác private key thế nào? Nhắc hạn nộp `lab-02/`, việc `git push` qua SSH và chạy lại `check-env.sh` với số buổi lớn hơn khi cài thêm công cụ.
