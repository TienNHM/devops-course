# Slide Ngày 02 – Dùng Linux CLI để đọc project Club

> **Tóm tắt:** Ngày 2 sử dụng các lệnh `pwd`, `ls`, `cd`, `find`, `grep`, `less` và pipe để đọc hiểu project Club Management cùng một file access log. Kết quả là trả lời được 5 câu hỏi về project chỉ bằng dòng lệnh.

## Hôm nay làm ra gì

**Cuối ngày:** người học tự trả lời được 5 câu hỏi về project Club chỉ bằng terminal.

**Cần có:** đã hoàn thành Ngày 1 và clone `~/devops-labs`, `~/devops-course`. Người chưa quen terminal đọc [Terminal cơ bản](../../resources/terminal-101.md).

::: details Ghi chú cho mentor
- Các câu hỏi cụ thể gồm: có bao nhiêu route, cổng nào, mật khẩu database nằm ở đâu.
- Cần có thêm: mở được terminal Ubuntu.
- Thời gian: 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết và hỏi đáp.
- Câu hỏi mở đầu: ai từng mở file log bằng Notepad?
- Thực hành trong Ubuntu (WSL). Thói quen quan trọng nhất cả ngày: trước mọi lệnh xóa file, chạy `pwd` và `ls`.
:::

---

## Bài toán thật: project lạ, server không có giao diện

![Log hàng chục nghìn dòng: Notepad không khả thi, pipeline trả lời trong vài chục giây](/slides/img/s03-problem.svg)

- Mentor giao app Club cho người học, nhưng chưa ai biết app có bao nhiêu API.
- Server chỉ có terminal, không có giao diện đồ họa.
- Khi app hỏng, cần đọc log dài hàng chục nghìn dòng.

::: details Ghi chú cho mentor
- Notepad và việc đọc bằng mắt đều không khả thi với log lớn. Người biết dùng CLI trả lời trong vài chục giây.
- Hôm nay luyện đúng hai việc: đọc project và đọc log.
:::

---

## Khái niệm: Thư mục và đường dẫn

- **Đường dẫn** (path) là chuỗi chỉ vị trí của một file hoặc thư mục trong cây thư mục.
- Ví dụ trong dự án: `~/devops-course/starter-project` là đường dẫn tuyệt đối đến project Club.

::: details Ghi chú cho mentor
- Đường dẫn tuyệt đối bắt đầu từ gốc `/` hoặc `~`, đường dẫn tương đối tính từ thư mục hiện tại.
- Linux tổ chức mọi file thành một cây duy nhất bắt đầu từ thư mục gốc `/`, và phân biệt chữ hoa với chữ thường.
- Đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; đường dẫn tương đối tính từ chỗ đang đứng.
- Ổ Windows nằm dưới `/mnt/c`, tránh sử dụng trong khóa này.
:::

---

## Cây thư mục Linux

![Một cây từ gốc /, home là ~, etc, var/log, tmp, ổ Windows dưới /mnt/c](/slides/img/s03-tree.svg)

- `/` là thư mục gốc, `~` là thư mục home của người dùng hiện tại.
- `.` là thư mục hiện tại, `..` là thư mục cha.

::: details Ghi chú cho mentor
- Nhắc lại: đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; đường dẫn tương đối tính từ chỗ đang đứng.
- Ổ Windows nằm dưới `/mnt/c`, tránh sử dụng trong khóa này.
:::

---

## Khái niệm: Lệnh, tùy chọn và tham số

- Một **lệnh** có dạng `tên-lệnh [tùy chọn] [tham số]`; **tùy chọn** bắt đầu bằng `-`, **tham số** là đối tượng lệnh xử lý.
- Ví dụ trong dự án: `ls -la` gồm lệnh `ls` và hai tùy chọn gộp `-l`, `-a`.

::: details Ghi chú cho mentor
- Tùy chọn (option, flag) thay đổi cách lệnh chạy; tham số (argument) là đối tượng mà lệnh xử lý, ví dụ tên file.
- Nhờ tùy chọn, một lệnh làm được nhiều việc mà không cần thêm lệnh mới.
- Trong `ls -la`: `-l` liệt kê chi tiết, `-a` hiện cả file ẩn.
- Tra cứu tùy chọn bằng `man ls` hoặc `ls --help`.
:::

---

## Bước 1 (10 phút): Đi vào project và nhìn quanh

```bash
git -C ~/devops-course pull
cd ~/devops-course/starter-project
pwd
ls -la
cd backend
pwd
cd ..
cd -
```

::: details Ghi chú cho mentor
- `git -C thư-mục pull` chạy `git pull` trong thư mục đó mà không cần `cd`.
- `cd -` quay lại thư mục trước đó.
:::

---

## Bước 1: Kết quả đúng

- `pwd` đầu tiên in `/home/TEN_BAN/devops-course/starter-project`.
- `ls -la` có `backend`, `frontend`, `database`, `k8s`, `compose.yaml`, `README.md` và file ẩn `.env.example`.

**Kiểm tra: kết quả đúng khi** sau `cd ..` rồi `pwd` vẫn ở `starter-project`, và `ls` thấy `compose.yaml`.

::: details Ghi chú cho mentor
- Sai đường dẫn (`No such file or directory`): chạy `pwd` và `ls`. Nếu chưa có `~/devops-course` thì quay lại Ngày 1, Bước 5.
:::

---

## Khái niệm: Mẫu tìm kiếm và ký tự đại diện

- **Mẫu** (pattern) là chuỗi mô tả nội dung cần khớp; ký tự đại diện `*` khớp một chuỗi bất kỳ.
- Ví dụ trong dự án: `grep -n "app.get" backend/app.js` tìm các dòng khai báo route.

::: details Ghi chú cho mentor
- Ví dụ ký tự đại diện: `*.yaml` khớp mọi tên file kết thúc bằng `.yaml`.
- `find` tìm **file** theo thuộc tính như tên, loại, kích thước. `grep` tìm **dòng** theo nội dung bên trong file.
- Ví dụ khác: `find . -name "Dockerfile"` tìm file Dockerfile.
- Cần đặt mẫu trong dấu nháy kép để shell không tự mở rộng `*` trước khi lệnh nhận được.
:::

---

## Bước 2 (10 phút): find tìm file, grep tìm dòng

![find tìm file theo tên, loại, kích thước; grep tìm dòng theo nội dung](/slides/img/s03-find-grep.svg)

Bước 2 dùng `find`. Bước 4 dùng `grep`.

::: details Ghi chú cho mentor
- `grep` thêm: `-i` không phân biệt hoa thường, `-v` đảo kết quả, `-c` đếm, `-n` hiện số dòng, `-r` tìm đệ quy.
:::

---

## Bước 2: Tìm file bằng find

```bash
cd ~/devops-course/starter-project
find . -type d -not -path "*/node_modules/*"
find . -name "Dockerfile"
find . -name "*.yaml" | sort
find . -type f -not -path "*/node_modules/*" | wc -l
```

::: details Ghi chú cho mentor
- Lệnh 1 in `.`, `./backend`, `./backend/tests`, `./database`, `./frontend`, `./k8s`.
- Lệnh 3 in `./compose.yaml` cùng các file trong `./k8s/`. Lệnh 4 in một con số, khoảng 24 nếu chưa chạy `npm install`.
:::

---

## Bước 2: Kết quả đúng

```text
./backend/Dockerfile
./frontend/Dockerfile
```

**Kiểm tra: kết quả đúng khi** có đúng hai `Dockerfile` (backend, frontend) và xác định được `compose.yaml` nằm ở thư mục gốc của project.

::: details Ghi chú cho mentor
- Cho người học dự đoán output trước khi nhấn Enter.
:::

---

## Bước 3 (10 phút): Đọc file từng phần

```bash
cat -n backend/app.js | head -n 25
cat database/init.sql
wc -l compose.yaml
less compose.yaml
```

Trong `less`: nhập `/postgres` rồi Enter để tìm, `n` chuyển sang kết quả kế tiếp, `q` để thoát.

::: details Ghi chú cho mentor
- Đọc từng phần nhỏ thay vì mở cả file. `head` xem phần đầu, `cat -n` in kèm số dòng, `less` cuộn từng trang.
- Người học hay bị kẹt trong `less`: nhắc phím `q`.
:::

---

## Bước 3: Kết quả đúng

- `app.js` có các dòng `app.get("/health"` và `app.get("/ready"`.
- `init.sql` tạo bảng `members` và thêm hai thành viên mẫu.

**Kiểm tra: kết quả đúng khi** mở và thoát được `less` bằng `q`, và đọc được tên bảng `members`.

::: details Ghi chú cho mentor
- Nếu `find` hoặc `less` làm người học mất phương hướng, cho `cd ~/devops-course/starter-project` để quay lại.
:::

---

## Bước 4 (15 phút): Tìm dòng bằng grep

`grep` trả lời câu hỏi: nội dung này nằm ở đâu trong project.

```bash
grep -n "app.get" backend/app.js
grep -c "app.get" backend/app.js
grep -n "3000" backend/server.js compose.yaml
grep -n "@example.com" database/init.sql
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules
```

::: details Ghi chú cho mentor
- Cờ hay dùng: `-n` hiện số dòng, `-r` tìm trong cả thư mục, `-c` đếm, `-i` không phân biệt hoa thường.
- `--exclude-dir=node_modules` tránh quét các thư viện đã cài.
:::

---

## Bước 4: Kết quả đúng

- Lệnh 1 in 3 dòng (số dòng 8, 12, 21), lệnh 2 in `3`.
- Lệnh 3 thấy `3000` trong `backend/server.js` và `compose.yaml`.
- Lệnh 4 in 2 dòng (Alice và Bob).
- Lệnh 5 thấy `DB_PASSWORD` trong ít nhất 4 file.

**Kiểm tra: kết quả đúng khi** `grep -c "app.get" backend/app.js` in `3`.

::: details Ghi chú cho mentor
- Lệnh 5 in `.env.example`, `backend/db.js`, `compose.yaml`, `k8s/backend.yaml`.
- `grep` không in gì: thử `grep -i`, hoặc kiểm tra bằng `cat file | head`.
:::

---

## Khái niệm: Luồng dữ liệu và pipe

- **Pipe** `|` nối đầu ra chuẩn (stdout) của lệnh trước vào đầu vào chuẩn (stdin) của lệnh sau.
- Ví dụ trong dự án: `grep ... | wc -l` lọc các dòng chứa `DB_PASSWORD`, rồi đếm.

::: details Ghi chú cho mentor
- Mỗi lệnh nhận dữ liệu qua stdin và ghi kết quả ra stdout, thường hiển thị trên terminal.
- Nhờ pipe, các lệnh nhỏ, mỗi lệnh làm một việc, được ghép thành chuỗi xử lý phức tạp hơn.
- Ở các bước trước đã dùng pipe: `find ... | sort`, `cat ... | head`. Slide này gọi tên khái niệm đó.
:::

---

## Bước 5 (10 phút): Ghép lệnh bằng pipe

- `|` chuyển output của lệnh trước thành input của lệnh sau.
- Mỗi lệnh đảm nhận một việc nhỏ, và các lệnh được ghép lại thành chuỗi.

```bash
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules | wc -l
grep -rln "DB_PASSWORD" . --exclude-dir=node_modules | sort
```

::: details Ghi chú cho mentor
- `-l` chỉ in tên file chứa mẫu.
- `>` ghi output ra file (ghi đè), `>>` ghi nối thêm. File mất nội dung sau khi ghi thường do dùng `>` thay cho `>>`.
:::

---

## Bước 5: Kết quả đúng

Lệnh đầu in `5`. Lệnh sau in 4 tên file, mỗi file một dòng.

**Kiểm tra: kết quả đúng khi** số dòng (5) lớn hơn số file (4), vì `compose.yaml` dùng `DB_PASSWORD` hai lần.

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: vì sao kết quả là 5 mà không phải 4? Để người học tự tìm bằng `grep -rn`.
:::

---

## Khái niệm: Chuyển hướng và heredoc

- **Chuyển hướng** đổi nơi stdout được ghi: `>` ghi đè vào file, `>>` ghi nối thêm vào cuối file.
- Ví dụ trong dự án: `cat > mini-access.log <<'EOF'` tạo file log mẫu từ 10 dòng được dán vào.

::: details Ghi chú cho mentor
- **Heredoc** (`<<'EOF'`) truyền một khối văn bản nhiều dòng vào lệnh cho đến dòng `EOF`.
- Nhờ chuyển hướng, kết quả của lệnh được lưu thành file để dùng lại thay vì chỉ hiện trên màn hình.
- Nhắc lại lỗi hay gặp: dùng `>` thay cho `>>` làm mất nội dung cũ của file.
:::

---

## Khái niệm: Access log và mã trạng thái HTTP

- **Access log** là file mà web server ghi mỗi request thành một dòng, kèm mã trạng thái HTTP của kết quả.
- Ví dụ trong dự án: dòng `"GET /health HTTP/1.1" 200 15` ghi một request tới `/health`, mã `200`.

::: details Ghi chú cho mentor
- **Mã trạng thái HTTP** là số ba chữ số cho biết kết quả của request: `2xx` thành công, `4xx` lỗi từ phía client, `5xx` lỗi từ phía server.
- Phân tích access log cho biết ai gọi API nào và request nào thất bại.
- Dòng mẫu: `10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15`.
:::

---

## Bước 6 (20 phút): Đọc một file access log

Khi app chạy, web server ghi mỗi request vào access log. Hôm nay chưa có container, nên cần tạo log mẫu 10 dòng.

- Cột 1 là IP, cột 7 là đường dẫn, cột 9 là mã HTTP.
- File đủ nhỏ để đếm thủ công và tự kiểm chứng kết quả.

::: details Ghi chú cho mentor
- Dòng mẫu: `10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15`.
:::

---

## Bước 6: Tạo mini-access.log (phần 1/2)

```bash
cd ~
cat > mini-access.log <<'EOF'
10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.5 - - [21/Oct/2026:09:00:02 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.7 - - [21/Oct/2026:09:00:03 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.9 - - [21/Oct/2026:09:00:04 +0700] "GET /api/members/99 HTTP/1.1" 404 40
10.0.0.5 - - [21/Oct/2026:09:00:05 +0700] "GET /ready HTTP/1.1" 200 15
```

::: details Ghi chú cho mentor
- Đây là heredoc: chưa nhập `EOF` thì lệnh chưa kết thúc. Nhập tiếp 5 dòng ở slide sau, rồi `EOF`.
- Cách an toàn: sao chép cả hai slide và dán một lần.
:::

---

## Bước 6: Tạo mini-access.log (phần 2/2)

```bash
10.0.0.7 - - [21/Oct/2026:09:00:06 +0700] "POST /api/members HTTP/1.1" 405 30
10.0.0.9 - - [21/Oct/2026:09:00:07 +0700] "GET /api/members HTTP/1.1" 500 60
10.0.0.5 - - [21/Oct/2026:09:00:08 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.7 - - [21/Oct/2026:09:00:09 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.9 - - [21/Oct/2026:09:00:10 +0700] "GET /favicon.ico HTTP/1.1" 404 40
EOF
wc -l mini-access.log
grep -c " 404 " mini-access.log
```

**Kiểm tra: kết quả đúng khi** `wc -l` in `10 mini-access.log` và `grep -c` in `2`.

::: details Ghi chú cho mentor
- Người học dán phần 2 ngay sau phần 1 trong cùng terminal, không gõ lại `cat > ...`.
:::

---

## Bước 6: Pipeline phân tích log

![access.log đi qua awk, sort, uniq -c, sort -nr](/slides/img/s03-pipeline.svg)

`sort` đứng trước `uniq -c` vì `uniq` chỉ gộp các dòng liền kề.

::: details Ghi chú cho mentor
- `awk` tách cột; `sort` đưa các giá trị giống nhau nằm cạnh nhau; `uniq -c` gộp dòng liền kề và đếm; `sort -nr` xếp giảm dần.
- Cách xây dựng: thêm từng lệnh một, quan sát output rồi mới thêm lệnh tiếp theo.
:::

---

## Bước 6: Đếm request theo IP

```bash
awk '{print $1}' mini-access.log | sort | uniq -c | sort -nr
```

```text
      4 10.0.0.5
      3 10.0.0.9
      3 10.0.0.7
```

**Kiểm tra: kết quả đúng khi** 4 + 3 + 3 = 10 dòng, khớp với `wc -l`.

::: details Ghi chú cho mentor
- Với các số lần bằng nhau, thứ tự có thể khác.
:::

---

## Bước 6: Đếm theo mã HTTP và lọc lỗi 5xx

```bash
awk '{print $9}' mini-access.log | sort | uniq -c | sort -nr
awk '$9 ~ /^5/ {print $1, $7, $9}' mini-access.log
```

```text
      6 200
      2 404
      1 500
      1 405
10.0.0.9 /api/members 500
```

**Kiểm tra: kết quả đúng khi** bảng mã HTTP cộng lại bằng 10 và lệnh lọc 5xx cho đúng một dòng.

::: details Ghi chú cho mentor
- Lọc 5xx bằng `awk` kiểm tra đúng cột 9. Không dùng `grep " 5"` vì dễ khớp nhầm với số byte.
:::

---

## Bước 7 (10 phút): Trả lời 5 câu hỏi về project Club

Chỉ dùng lệnh của Ngày 2.

1. Backend có mấy route, là route nào?
2. Backend chạy ở cổng nào, `compose.yaml` đặt ở đâu?
3. Database nạp sẵn mấy thành viên, tên gì?
4. Biến mật khẩu database tên gì, nằm trong file nào?
5. Request nào trong `mini-access.log` trả mã 5xx, từ IP nào?

::: details Ghi chú cho mentor
- Người học ghi lại lệnh đã dùng cho mỗi câu.
- Đáp án: 1) 3 route: `/health`, `/ready`, `/api/members`. 2) Cổng 3000: `server.js` đọc `PORT`, `compose.yaml` đặt `PORT: 3000`.
- 3) 2 thành viên: Alice, Bob. 4) `DB_PASSWORD`, nằm trong 4 file như Bước 4.
- 5) `GET /api/members` từ `10.0.0.9` trả mã 500.
- Cho người học tự làm 5 phút, sau đó mời một số người trình bày lệnh đã dùng.
:::

---

## Lỗi thường gặp: thiếu sort khiến uniq đếm sai

![Không sort: mã 200 hiện nhiều dòng; có sort: gộp thành 6 request 200](/slides/img/s03-no-sort.svg)

Cách sửa: thêm `sort` trước `uniq -c`, sau đó cộng các số đếm và so với `wc -l`.

::: details Ghi chú cho mentor
- Triệu chứng: mã 200 xuất hiện ở nhiều dòng với số đếm nhỏ. Nguyên nhân: `uniq` chỉ gộp các dòng liền nhau.
- Lệnh trong ảnh được viết gọn bằng `...`: đầy đủ là `awk '{print $9}' mini-access.log | uniq -c`.
:::

---

## Lỗi thường gặp: đường dẫn và grep

| Triệu chứng | Cách xử lý |
| --- | --- |
| `No such file or directory` | `pwd` và `ls`; dùng đường dẫn với `~` |
| `cd: too many arguments` | Nháy kép: `cd "my folder"` |
| `grep` không in gì | Thử `grep -i` |
| `grep -rn` in `node_modules` | `--exclude-dir=node_modules` |

::: details Ghi chú cho mentor
- Với `No such file or directory`, dùng đường dẫn tuyệt đối với `~`. Với `grep` không in gì, thử `grep -i` và kiểm tra bằng `cat file | head`.
- Thư mục có khoảng trắng phải đặt trong nháy kép: `rm -r "docs/meeting notes"` khác hoàn toàn `rm -r docs/meeting notes`.
- Chạy `pwd` và `ls` trước mọi lệnh xóa.
:::

---

## Tự kiểm tra

1. `find` và `grep` khác nhau thế nào? Khi nào dùng lệnh nào?
2. Vì sao phải `sort` trước `uniq -c`?
3. Làm thế nào để biết `DB_PASSWORD` được dùng ở những file nào?

::: details Ghi chú cho mentor
- 1: `find` tìm file theo thuộc tính (tên, loại, kích thước); `grep` tìm dòng theo nội dung.
- 2: `uniq` chỉ gộp các dòng liền kề; `sort` đưa các giá trị giống nhau nằm cạnh nhau.
- 3: `grep -rln "DB_PASSWORD" . --exclude-dir=node_modules` in tên các file chứa biến đó.
:::

---

## Tiếp theo

Ngày 3: đưa project Club vào repository `devops-labs` bằng Git: [Slide Ngày 03](session-06.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [The Linux Command Line](https://linuxcommand.org/tlcl.php): sách miễn phí dạy dòng lệnh từ cơ bản.
- **Tài liệu chính thức:** [hier(7): cấu trúc thư mục Linux](https://man7.org/linux/man-pages/man7/hier.7.html): hiểu mỗi thư mục như /etc, /var để làm gì.
- **Tài liệu chính thức:** [chmod (POSIX)](https://man7.org/linux/man-pages/man1/chmod.1p.html): tra cứu cách đổi quyền file.
- **Best practice:** [CIS Benchmarks](https://www.cisecurity.org/benchmarks): danh sách chuẩn để cấu hình Linux an toàn.
