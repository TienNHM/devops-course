# Terminal 101

Trang này dạy bạn những gì cần biết để dùng terminal trong khóa học: mở terminal, gõ lệnh, đọc kết quả và không làm hỏng máy. Đọc một lần khoảng 20 phút, sau đó giữ làm trang tra cứu.

> **Tóm tắt:** Terminal là cửa sổ để gõ lệnh cho máy tính. Biết 10 lệnh, phím Tab, mũi tên lên và Ctrl+C là đủ cho tuần 1. Cẩn thận với `rm -rf` và `sudo`.

::: tip Bạn cần biết gì trước
Không cần biết gì. Trang này dành cho người chưa từng dùng terminal. Từ lạ: tra [Thuật ngữ](glossary.md).
:::

## Terminal để làm gì

Bình thường bạn bấm chuột để làm việc. Terminal cho phép làm cùng việc đó bằng cách gõ chữ. Ví von: bấm chuột giống chỉ tay vào menu, gõ lệnh giống nói thẳng yêu cầu với người phục vụ. Gõ lệnh có thể làm lại y hệt vào lần sau, gửi cho người khác chạy, hoặc ghi vào file để máy tự chạy. Đó là lý do DevOps dùng terminal gần như mọi lúc.

## Mở terminal

Có hai terminal bạn sẽ dùng:

| Terminal | Mở bằng | Dùng khi nào |
| --- | --- | --- |
| PowerShell trong Windows Terminal | Bấm Start, gõ `Terminal`, Enter | Buổi 01, và các lệnh `wsl ...` ở buổi 02 |
| Ubuntu (WSL) | Bấm Start, gõ `Ubuntu`, Enter. Hoặc trong Windows Terminal bấm mũi tên cạnh dấu `+` chọn Ubuntu-24.04 | Từ buổi 02 trở đi, gần như mọi lab |

Ubuntu chỉ có sau khi bạn cài WSL ở buổi 02, xem [Hướng dẫn cài đặt môi trường](setup-guide.md). Hai cửa sổ này dùng hai bộ lệnh khác nhau: lệnh Linux như `ls` và `cat` chỉ chạy trong Ubuntu. Nhìn dòng đầu cửa sổ để biết bạn đang ở đâu.

## Prompt là gì

Khi mở Ubuntu, bạn thấy một dòng như sau:

```text
tien@laptop:~$
```

Dòng này gọi là **prompt**, nghĩa là terminal đang chờ bạn gõ. Đọc từng phần:

| Phần | Ý nghĩa |
| --- | --- |
| `tien` | Tên người dùng Linux của bạn |
| `laptop` | Tên máy |
| `~` | Thư mục bạn đang đứng. `~` là thư mục cá nhân (home) của bạn |
| `$` | Dấu hiệu "sẵn sàng nhận lệnh" (người dùng thường) |

Trong tài liệu này, dòng lệnh bạn cần gõ được viết không có prompt. Bạn gõ lệnh rồi nhấn Enter. Đừng gõ ký tự `$` ở đầu nếu có thấy nó trong tài liệu khác.

## 10 lệnh đầu tiên

Chạy lần lượt trong Ubuntu. Mỗi lệnh kèm kết quả bạn sẽ thấy (tên có thể khác).

`pwd` cho biết bạn đang đứng ở đâu:

```bash
pwd
```

```text
/home/tien
```

`ls` liệt kê file và thư mục ở đây. Thêm `-la` để xem chi tiết và cả file ẩn:

```bash
ls
ls -la
```

`mkdir` tạo thư mục, `cd` đi vào thư mục. `cd ..` lùi ra một cấp, `cd` đứng một mình quay về home:

```bash
mkdir -p devops-labs/lab-01
cd devops-labs/lab-01
pwd
```

```text
/home/tien/devops-labs/lab-01
```

`echo` in ra một dòng chữ. Dấu `>` chuyển chữ đó vào file thay vì in ra màn hình, `cat` in nội dung file:

```bash
echo "xin chao devops" > hello.txt
cat hello.txt
```

```text
xin chao devops
```

`cp` chép file, `mv` đổi tên hoặc di chuyển file:

```bash
cp hello.txt hello-backup.txt
mv hello-backup.txt ghi-chu.txt
ls
```

```text
ghi-chu.txt  hello.txt
```

Tóm tắt:

| Lệnh | Việc làm | Ví dụ |
| --- | --- | --- |
| `pwd` | Cho biết thư mục hiện tại | `pwd` |
| `ls` | Liệt kê file | `ls -la` |
| `cd` | Đi vào thư mục | `cd devops-labs` |
| `mkdir` | Tạo thư mục | `mkdir -p a/b` |
| `cat` | In nội dung file | `cat hello.txt` |
| `echo` | In chữ, hoặc ghi vào file với `>` | `echo "hi" > f.txt` |
| `cp` | Chép file | `cp a.txt b.txt` |
| `mv` | Di chuyển hoặc đổi tên | `mv a.txt b.txt` |

Thêm một thói quen quan trọng: gõ `man ls` hoặc `ls --help` để đọc hướng dẫn của một lệnh. Thoát `man` bằng phím `q`.

## Copy và paste

Quy tắc dễ nhớ nhất: trong cửa sổ terminal, copy là `Ctrl+Shift+C`, paste là `Ctrl+Shift+V`. Trên Windows Terminal, click chuột phải cũng paste được. Ngoài ra `Ctrl+V` thường cũng paste được trong Windows Terminal.

Khi copy lệnh từ tài liệu, hãy chép cả khối mã (nút copy ở góc phải khối). Sau khi paste, đọc lại trước khi nhấn Enter, nhất là khi lệnh có `sudo` hoặc `rm`. Terminal không hỏi lại "bạn chắc chứ?".

## Phím tắt cứu bạn

| Phím | Tác dụng |
| --- | --- |
| `Tab` | Tự hoàn thành tên file hoặc lệnh. Gõ `cd dev` rồi nhấn Tab, nó điền tiếp `devops-labs/`. Nhấn Tab hai lần để xem các gợi ý |
| Mũi tên lên | Gọi lại lệnh đã gõ trước đó, nhấn nhiều lần để lùi xa hơn |
| `Ctrl+C` | Dừng lệnh đang chạy (ví dụ lệnh treo hoặc server đang mở). Không phải để copy |
| `Ctrl+L` | Xóa sạch màn hình cho dễ nhìn |
| `Ctrl+D` | Thoát phiên terminal (giống gõ `exit`) |

Thói quen tốt: gặp tên file dài, luôn nhấn Tab thay vì gõ hết. Tab còn giúp bạn tránh gõ sai chính tả, vì nếu file không tồn tại thì Tab sẽ không điền gì.

## Đọc output và mã lỗi

Sau khi chạy lệnh, terminal in kết quả rồi trả lại prompt. Có ba tình huống:

1. **Không in gì rồi trả lại prompt**: thường là thành công. Linux im lặng khi mọi thứ ổn (ví dụ `mkdir`, `cp`).
2. **In ra thông báo lỗi**: đọc dòng cuối trước, thường là nguyên nhân. Ví dụ `No such file or directory` nghĩa là sai tên hoặc sai thư mục, kiểm tra bằng `pwd` và `ls`. `Permission denied` là thiếu quyền. `command not found` là chưa cài công cụ hoặc gõ sai tên lệnh.
3. **Cứ chạy mãi không dừng**: lệnh đang chờ hoặc đang là server. Nhấn `Ctrl+C`.

Mỗi lệnh kết thúc đều để lại một **mã thoát** (exit code): `0` là thành công, khác `0` là có lỗi. Xem mã của lệnh vừa chạy bằng `echo $?`:

```bash
ls /thu-muc-khong-ton-tai
echo $?
```

```text
ls: cannot access '/thu-muc-khong-ton-tai': No such file or directory
2
```

Số `2` (khác 0) cho biết lệnh trước đó thất bại. Về sau, các script tự động của CI cũng dựa vào mã thoát để biết bước nào lỗi.

Khi hỏi mentor, hãy dán nguyên văn thông báo lỗi và lệnh bạn đã gõ, đừng chụp một phần hoặc mô tả bằng lời.

## Heredoc: ghi nhiều dòng vào file

`echo "..." > file` chỉ hợp để ghi một dòng. Khi cần ghi cả một file nhiều dòng (một Dockerfile, một file cấu hình), bạn dùng **heredoc**: nói với terminal "từ giờ mọi dòng tôi gõ đều đưa vào file, cho tới khi tôi gõ từ khóa kết thúc".

```bash
cat > ghi-chu.txt <<EOF
Ten: Nguyen Van A
Buoi: 01
Cam nghi: DevOps la lam viec cung nhau
EOF
```

Giải thích từng phần:

- `cat > ghi-chu.txt` nghĩa là "ghi vào file `ghi-chu.txt`, tạo mới nếu chưa có, ghi đè nếu đã có".
- `<<EOF` nghĩa là "nội dung nằm ở các dòng ngay sau, cho đến dòng chỉ chứa `EOF`".
- Dòng chỉ có chữ `EOF` ở đầu dòng (không thụt lề) là điểm kết thúc. `EOF` chỉ là một cái tên, đổi thành tên khác cũng được miễn hai đầu giống nhau.

Kiểm tra:

```bash
cat ghi-chu.txt
```

```text
Ten: Nguyen Van A
Buoi: 01
Cam nghi: DevOps la lam viec cung nhau
```

Hai lưu ý: dòng `EOF` kết thúc phải đứng sát lề trái; và `>` ghi đè file cũ, muốn nối thêm vào cuối file dùng `>>`.

## Soạn file: nano hoặc VS Code

Có hai cách mở file để sửa nội dung.

**nano** chạy ngay trong terminal, không cần cài:

```bash
nano ghi-chu.txt
```

Gõ nội dung, nhấn `Ctrl+O` rồi Enter để lưu, `Ctrl+X` để thoát. Các phím tắt luôn hiện ở hai dòng cuối màn hình (`^` nghĩa là phím Ctrl).

**VS Code** dễ dùng hơn cho file dài. Sau khi đã cài WSL extension (buổi 02), từ Ubuntu gõ:

```bash
code ghi-chu.txt
code .
```

`code ghi-chu.txt` mở một file, `code .` mở cả thư mục hiện tại (dấu chấm nghĩa là "thư mục này"). Cách cài: xem [Hướng dẫn cài đặt môi trường](setup-guide.md#vs-code-va-wsl-extension).

## Hai thứ cần cẩn thận

::: danger rm -rf: xóa là mất, không có thùng rác
`rm -rf` xóa thư mục và toàn bộ bên trong mà không hỏi, không có thùng rác để khôi phục. Một dấu cách hoặc dấu `/` sai chỗ có thể xóa nhầm cả dữ liệu quan trọng. Quy tắc:

- Chỉ chạy `rm -rf` trên thư mục thử do chính bạn vừa tạo, ví dụ `~/devops-labs/thu-nghiem`.
- Trước khi chạy, gõ `pwd` và `ls` để chắc chắn bạn đang đứng đúng chỗ.
- Không bao giờ chạy lệnh có `rm -rf /`, `rm -rf ~`, hoặc `rm -rf *` khi chưa hiểu rõ nó trỏ vào đâu.

Thử an toàn trên thư mục tạm:

```bash
mkdir -p ~/thu-nghiem/a/b
ls ~/thu-nghiem
rm -rf ~/thu-nghiem
ls ~/thu-nghiem
```

Dòng `ls` cuối báo `No such file or directory`, nghĩa là thư mục thử đã bị xóa sạch.
:::

::: danger sudo: chạy với quyền quản trị cao nhất
`sudo` chạy một lệnh với quyền quản trị (root), được phép sửa mọi thứ trong hệ thống. Chỉ dùng `sudo` khi tài liệu của khóa học bảo bạn dùng, ví dụ `sudo apt install ...`. Không thêm `sudo` để "cho chắc" khi gặp lỗi `Permission denied`: nó có thể che mất nguyên nhân thật, và file bạn tạo ra có thể thuộc về root khiến bạn không sửa được sau này. Khi gõ mật khẩu cho `sudo`, màn hình không hiện ký tự, đó là bình thường. Không chạy lệnh `sudo` copy từ nguồn lạ mà chưa đọc hiểu.
:::

## Tự thử: 5 phút

Làm lần lượt trong Ubuntu, kiểm tra xong mỗi bước:

```bash
mkdir -p ~/devops-labs/lab-00
cd ~/devops-labs/lab-00
echo "toi da biet dung terminal" > ket-qua.txt
cat ket-qua.txt
cp ket-qua.txt ket-qua-2.txt
ls
```

Bạn đúng khi: `pwd` cho đường dẫn kết thúc bằng `lab-00`, `cat` in ra câu bạn viết, và `ls` hiện hai file `ket-qua.txt` và `ket-qua-2.txt`.

## Đi tiếp

- Cài môi trường đúng lúc: [Hướng dẫn cài đặt môi trường](setup-guide.md).
- Tài khoản GitHub, SSH key, clone repo: [Tài khoản GitHub và repo devops-labs](setup-github.md).
- Bảng lệnh Linux đầy đủ hơn: [Cheatsheets](cheatsheets.md#linux).
- Gặp lỗi khi cài: [Xử lý sự cố cài đặt](troubleshooting-setup.md).
