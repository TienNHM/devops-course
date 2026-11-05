# Terminal 101

Trang này trình bày các kiến thức cần thiết để dùng terminal trong khóa học: mở terminal, nhập lệnh, đọc kết quả và tránh làm hỏng máy. Thời gian đọc toàn bộ khoảng 20 phút; sau đó trang này dùng làm tài liệu tra cứu. Trước buổi 01 chỉ cần đọc các mục đến hết "Phím tắt cứu bạn" (khoảng 10 phút); các mục còn lại đọc khi cần.

> **Tóm tắt:** Terminal là cửa sổ để nhập lệnh cho máy tính. Mười lệnh cơ bản, phím Tab, mũi tên lên và Ctrl+C là đủ cho tuần 1. Cần thận trọng với `rm -rf` và `sudo`.

::: tip Kiến thức cần có trước
Không yêu cầu kiến thức nào. Trang này dành cho người chưa từng dùng terminal. Khi gặp thuật ngữ mới, tra [Thuật ngữ](glossary.md).
:::

## Terminal để làm gì

Thông thường, người dùng thao tác bằng chuột. Terminal cho phép thực hiện cùng các thao tác đó bằng cách nhập lệnh dạng văn bản. Ví dụ so sánh: dùng chuột giống chỉ vào một mục trong menu, còn nhập lệnh giống nêu trực tiếp yêu cầu. Lệnh có thể được chạy lại y hệt ở lần sau, gửi cho người khác chạy hoặc ghi vào file để máy tự chạy. Vì vậy DevOps sử dụng terminal thường xuyên.

## Mở terminal

Khóa học sử dụng ba loại terminal:

| Terminal | Mở bằng | Dùng khi nào |
| --- | --- | --- |
| Git Bash | Mở Start, nhập `Git Bash`, nhấn Enter. Trong VS Code: menu Terminal > New Terminal, rồi chọn Git Bash ở mũi tên cạnh dấu `+` | Buổi 01 (có sẵn khi cài Git for Windows, chưa cần WSL) |
| Ubuntu (WSL) | Mở Start, nhập `Ubuntu`, nhấn Enter. Hoặc trong Windows Terminal, chọn mũi tên cạnh dấu `+` rồi chọn Ubuntu-24.04 | Từ buổi 02 trở đi, gần như mọi lab |
| PowerShell trong Windows Terminal | Mở Start, nhập `Terminal`, nhấn Enter | Chỉ cho các lệnh `wsl ...` và kiểm tra Windows ở buổi 02 |

Ubuntu chỉ có sau khi cài WSL ở buổi 02, xem [Hướng dẫn cài đặt môi trường](setup-guide.md). Git Bash và Ubuntu đều dùng lệnh kiểu Linux (`ls`, `cat`, `mkdir`), còn PowerShell dùng bộ lệnh khác, nên các lệnh trong bài buổi 01 sẽ báo lỗi khi chạy trong PowerShell. Có thể xác định terminal đang dùng qua dòng đầu của cửa sổ.

## Prompt là gì

Khi mở Ubuntu, terminal hiển thị một dòng như sau (Git Bash hiển thị dạng `tien@LAPTOP MINGW64 ~` nhưng ý nghĩa tương tự):

```text
tien@laptop:~$
```

Dòng này gọi là **prompt**, cho biết terminal đang chờ nhận lệnh. Ý nghĩa từng phần:

| Phần | Ý nghĩa |
| --- | --- |
| `tien` | Tên người dùng Linux |
| `laptop` | Tên máy |
| `~` | Thư mục hiện tại. `~` là thư mục cá nhân (home) của người dùng |
| `$` | Dấu hiệu "sẵn sàng nhận lệnh" (người dùng thường) |

Trong tài liệu này, các dòng lệnh được viết không kèm prompt. Nhập lệnh rồi nhấn Enter. Không nhập ký tự `$` ở đầu dòng nếu gặp ký tự này trong tài liệu khác.

## 10 lệnh đầu tiên

Chạy lần lượt trong Git Bash (buổi 01) hoặc Ubuntu (từ buổi 02). Mỗi lệnh kèm kết quả mong đợi (tên có thể khác).

`pwd` cho biết thư mục hiện tại:

```bash
pwd
```

```text
/home/tien
```

`ls` liệt kê file và thư mục trong thư mục hiện tại. Thêm `-la` để xem chi tiết và cả file ẩn:

```bash
ls
ls -la
```

`mkdir` tạo thư mục và `cd` chuyển vào thư mục. `cd ..` lùi ra một cấp; `cd` không kèm đối số quay về home:

```bash
mkdir -p devops-labs/lab-01
cd devops-labs/lab-01
pwd
```

```text
/home/tien/devops-labs/lab-01
```

`echo` in ra một dòng chữ. Dấu `>` chuyển chữ đó vào file thay vì in ra màn hình; `cat` in nội dung file:

```bash
echo "xin chao devops" > hello.txt
cat hello.txt
```

```text
xin chao devops
```

`cp` sao chép file; `mv` đổi tên hoặc di chuyển file:

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

Một thói quen quan trọng là đọc hướng dẫn của lệnh bằng `man ls` hoặc `ls --help`. Thoát `man` bằng phím `q`.

## Copy và paste

Trong cửa sổ terminal, copy là `Ctrl+Shift+C` và paste là `Ctrl+Shift+V`. Trên Windows Terminal, nhấp chuột phải cũng paste được, và `Ctrl+V` thường cũng paste được.

Khi sao chép lệnh từ tài liệu, cần chép cả khối mã (nút copy ở góc phải khối). Sau khi paste, đọc lại lệnh trước khi nhấn Enter, nhất là khi lệnh có `sudo` hoặc `rm`, vì terminal không yêu cầu xác nhận lại.

## Phím tắt cứu bạn

| Phím | Tác dụng |
| --- | --- |
| `Tab` | Tự hoàn thành tên file hoặc lệnh. Nhập `cd dev` rồi nhấn Tab, terminal điền tiếp `devops-labs/`. Nhấn Tab hai lần để xem các gợi ý |
| Mũi tên lên | Gọi lại lệnh đã nhập trước đó; nhấn nhiều lần để lùi xa hơn |
| `Ctrl+C` | Dừng lệnh đang chạy (ví dụ lệnh bị treo hoặc server đang mở); không dùng để copy |
| `Ctrl+L` | Xóa màn hình để dễ quan sát |
| `Ctrl+D` | Thoát phiên terminal (tương đương lệnh `exit`) |

Với tên file dài, nên dùng Tab thay vì nhập đầy đủ. Tab cũng giúp tránh sai chính tả, vì nếu file không tồn tại thì Tab không điền gì.

## Đọc output và mã lỗi

Sau khi chạy lệnh, terminal in kết quả rồi hiển thị lại prompt. Có ba tình huống:

1. **Không in gì rồi hiển thị lại prompt**: thường là thành công, vì Linux không in thông báo khi lệnh chạy bình thường (ví dụ `mkdir`, `cp`).
2. **In ra thông báo lỗi**: đọc dòng cuối trước, vì dòng này thường nêu nguyên nhân. `No such file or directory` nghĩa là sai tên hoặc sai thư mục; kiểm tra bằng `pwd` và `ls`. `Permission denied` nghĩa là thiếu quyền. `command not found` nghĩa là chưa cài công cụ hoặc nhập sai tên lệnh.
3. **Chạy mãi không dừng**: lệnh đang chờ hoặc đang chạy như một server. Nhấn `Ctrl+C` để dừng.

Mỗi lệnh khi kết thúc đều trả về một **mã thoát** (exit code): `0` là thành công, khác `0` là có lỗi. Xem mã của lệnh vừa chạy bằng `echo $?`:

```bash
ls /thu-muc-khong-ton-tai
echo $?
```

```text
ls: cannot access '/thu-muc-khong-ton-tai': No such file or directory
2
```

Số `2` (khác 0) cho biết lệnh trước đó thất bại. Các script tự động của CI cũng dựa vào mã thoát để xác định bước nào bị lỗi.

Khi hỏi mentor, cần dán nguyên văn thông báo lỗi và lệnh đã chạy, không chụp một phần hoặc mô tả bằng lời.

## Heredoc: ghi nhiều dòng vào file

`echo "..." > file` chỉ phù hợp để ghi một dòng. Khi cần ghi một file nhiều dòng (Dockerfile, file cấu hình), dùng **heredoc**: cú pháp này yêu cầu terminal đưa mọi dòng nhập sau đó vào file cho đến khi gặp từ khóa kết thúc.

```bash
cat > ghi-chu.txt <<EOF
Ten: Nguyen Van A
Buoi: 01
Cam nghi: DevOps la lam viec cung nhau
EOF
```

Giải thích từng phần:

- `cat > ghi-chu.txt` ghi vào file `ghi-chu.txt`, tạo mới nếu chưa có và ghi đè nếu đã có.
- `<<EOF` cho biết nội dung nằm ở các dòng ngay sau, cho đến dòng chỉ chứa `EOF`.
- Dòng chỉ có chữ `EOF` ở đầu dòng (không thụt lề) là điểm kết thúc. `EOF` chỉ là một tên quy ước và có thể đổi thành tên khác, miễn là hai đầu giống nhau.

Kiểm tra:

```bash
cat ghi-chu.txt
```

```text
Ten: Nguyen Van A
Buoi: 01
Cam nghi: DevOps la lam viec cung nhau
```

Cần lưu ý hai điểm: dòng `EOF` kết thúc phải nằm sát lề trái, và `>` ghi đè file cũ; muốn nối thêm vào cuối file thì dùng `>>`.

Có thể thay heredoc bằng cách tạo file trong VS Code (File > New File, đặt tên, lưu vào đúng thư mục), dán nội dung nằm giữa dòng `cat > ...` và dòng `EOF`, rồi lưu. Kết quả giống hệt.

## Soạn file: nano hoặc VS Code

Có hai cách mở file để chỉnh sửa nội dung.

**nano** chạy trực tiếp trong terminal Ubuntu và không cần cài thêm (ở buổi 01 với Git Bash, dùng VS Code cho đơn giản):

```bash
nano ghi-chu.txt
```

Nhập nội dung, nhấn `Ctrl+O` rồi Enter để lưu, `Ctrl+X` để thoát. Các phím tắt luôn hiển thị ở hai dòng cuối màn hình (`^` nghĩa là phím Ctrl).

**VS Code** dễ dùng hơn cho file dài. Có thể chạy từ Git Bash nếu VS Code đã được "Add to PATH"; trong Ubuntu cần cài WSL extension (buổi 02). Lệnh:

```bash
code ghi-chu.txt
code .
```

`code ghi-chu.txt` mở một file; `code .` mở cả thư mục hiện tại (dấu chấm là thư mục hiện tại). Cách cài: xem [Hướng dẫn cài đặt môi trường](setup-guide.md#vs-code-va-wsl-extension).

## Hai thứ cần cẩn thận

::: danger rm -rf: xóa là mất, không có thùng rác
`rm -rf` xóa thư mục và toàn bộ nội dung bên trong mà không hỏi lại, và không có thùng rác để khôi phục. Một dấu cách hoặc dấu `/` sai vị trí có thể xóa nhầm dữ liệu quan trọng. Quy tắc:

- Chỉ chạy `rm -rf` trên thư mục thử do chính mình vừa tạo, ví dụ `~/devops-labs/thu-nghiem`.
- Trước khi chạy, dùng `pwd` và `ls` để xác nhận đang ở đúng thư mục.
- Không chạy các lệnh như `rm -rf /`, `rm -rf ~` hoặc `rm -rf *` khi chưa hiểu rõ lệnh tác động vào đâu.

Thử an toàn trên một thư mục tạm:

```bash
mkdir -p ~/thu-nghiem/a/b
ls ~/thu-nghiem
rm -rf ~/thu-nghiem
ls ~/thu-nghiem
```

Dòng `ls` cuối báo `No such file or directory`, nghĩa là thư mục thử đã bị xóa.
:::

::: danger sudo: chạy với quyền quản trị cao nhất
`sudo` chạy một lệnh với quyền quản trị (root), cho phép sửa mọi thứ trong hệ thống. Chỉ dùng `sudo` khi tài liệu của khóa học yêu cầu, ví dụ `sudo apt install ...`. Không thêm `sudo` khi gặp lỗi `Permission denied`, vì có thể che mất nguyên nhân thật, và file được tạo ra có thể thuộc về root khiến người dùng không sửa được sau này. Khi nhập mật khẩu cho `sudo`, màn hình không hiển thị ký tự; đây là hành vi bình thường. Không chạy lệnh `sudo` sao chép từ nguồn không rõ mà chưa đọc hiểu.
:::

## Tự thử: 5 phút

Thực hiện lần lượt trong Git Bash (hoặc Ubuntu nếu đã cài) và kiểm tra kết quả sau mỗi bước:

```bash
mkdir -p ~/devops-labs/lab-00
cd ~/devops-labs/lab-00
echo "toi da biet dung terminal" > ket-qua.txt
cat ket-qua.txt
cp ket-qua.txt ket-qua-2.txt
ls
```

Kiểm tra: kết quả đúng khi `pwd` cho đường dẫn kết thúc bằng `lab-00`, `cat` in ra câu đã ghi, và `ls` hiển thị hai file `ket-qua.txt` và `ket-qua-2.txt`.

## Đi tiếp

- Cài đặt môi trường đúng thời điểm: [Hướng dẫn cài đặt môi trường](setup-guide.md).
- Tài khoản GitHub, SSH key, clone repo: [Tài khoản GitHub và repo devops-labs](setup-github.md).
- Bảng lệnh Linux đầy đủ hơn: [Cheatsheets](cheatsheets.md#linux).
- Gặp lỗi khi cài: [Xử lý sự cố cài đặt](troubleshooting-setup.md).
