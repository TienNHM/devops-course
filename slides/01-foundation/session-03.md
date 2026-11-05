# Slide Ngày 02 – Dùng Linux CLI để đọc project Club

> **Tóm tắt:** Dùng `pwd`, `ls`, `cd`, `find`, `grep`, `less` và pipe để đọc hiểu project Club Management và một file access log, rồi tự trả lời 5 câu hỏi về project bằng lệnh.

## Slide 1: Hôm nay bạn làm ra gì

**Cuối ngày:** bạn tự trả lời được 5 câu hỏi cụ thể về project Club (bao nhiêu route, cổng nào, mật khẩu database ở đâu...) chỉ bằng terminal.

**Cần có:** xong Ngày 1, mở được terminal Ubuntu, `~/devops-labs` và `~/devops-course` đã clone. Chưa quen terminal thì đọc nhanh [Terminal cơ bản](../../resources/terminal-101.md).

**Thời gian:** 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết và hỏi đáp.

::: details Ghi chú cho mentor
- Hỏi: ai từng mở file log bằng Notepad?
- Làm trong Ubuntu (WSL). Thói quen quan trọng nhất cả ngày: trước mọi lệnh xóa file, chạy `pwd` và `ls`.
:::

---

## Slide 2: Bài toán thật: project lạ, server không có giao diện

![Log hàng chục nghìn dòng: Notepad không khả thi, pipeline trả lời trong vài chục giây](/slides/img/s03-problem.svg)

- Mentor giao cho bạn app Club, chưa ai nói nó có bao nhiêu API.
- Server chỉ có terminal, không có giao diện đồ họa.
- Khi app hỏng, bạn phải đọc log dài hàng chục nghìn dòng.

::: details Ghi chú cho mentor
- Notepad hay đọc bằng mắt đều không khả thi với log lớn. Người biết CLI trả lời trong vài chục giây.
- Hôm nay luyện đúng hai việc: đọc project và đọc log.
:::

---

## Slide 3: Cây thư mục Linux

![Một cây từ gốc /, home là ~, etc, var/log, tmp, ổ Windows dưới /mnt/c](/slides/img/s03-tree.svg)

- `/` là gốc, `~` là thư mục home của bạn.
- `.` là thư mục hiện tại, `..` là thư mục cha.

::: details Ghi chú cho mentor
- Đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; tương đối tính từ chỗ đang đứng. Linux phân biệt chữ hoa chữ thường.
- Ổ Windows nằm dưới `/mnt/c`, tránh trong khóa này.
:::

---

## Slide 4: Bước 1 (10 phút): Đi vào project và nhìn quanh

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

## Slide 5: Bước 1: Kết quả đúng

- `pwd` đầu tiên in `/home/TEN_BAN/devops-course/starter-project`.
- `ls -la` có `backend`, `frontend`, `database`, `k8s`, `compose.yaml`, `README.md` và file ẩn `.env.example`.

**Kiểm tra: bạn đúng khi** sau `cd ..` rồi `pwd` bạn đang ở `starter-project`, và `ls` thấy `compose.yaml`.

::: details Ghi chú cho mentor
- Sai đường dẫn (`No such file or directory`): chạy `pwd` và `ls`. Chưa có `~/devops-course` thì quay lại Ngày 1, Bước 5.
:::

---

## Slide 6: Bước 2 (10 phút): find tìm file, grep tìm dòng

![find tìm file theo tên, loại, kích thước; grep tìm dòng theo nội dung](/slides/img/s03-find-grep.svg)

Bước 2 dùng `find`. Bước 4 dùng `grep`.

::: details Ghi chú cho mentor
- `grep` thêm: `-i` không phân biệt hoa thường, `-v` đảo, `-c` đếm, `-n` số dòng, `-r` đệ quy.
:::

---

## Slide 7: Bước 2: Tìm file bằng find

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

## Slide 8: Bước 2: Kết quả đúng

```text
./backend/Dockerfile
./frontend/Dockerfile
```

**Kiểm tra: bạn đúng khi** thấy đúng hai `Dockerfile` (backend, frontend) và biết `compose.yaml` nằm ở thư mục gốc của project.

::: details Ghi chú cho mentor
- Cho học viên đoán output trước khi nhấn Enter.
:::

---

## Slide 9: Bước 3 (10 phút): Đọc file từng phần

```bash
cat -n backend/app.js | head -n 25
cat database/init.sql
wc -l compose.yaml
less compose.yaml
```

Trong `less`: gõ `/postgres` rồi Enter để tìm, `n` sang kết quả kế tiếp, `q` để thoát.

::: details Ghi chú cho mentor
- Đọc từng phần nhỏ thay vì mở cả file. `head` xem đầu, `cat -n` in kèm số dòng, `less` cuộn từng trang.
- Học viên hay kẹt trong `less`: nhắc `q`.
:::

---

## Slide 10: Bước 3: Kết quả đúng

- `app.js` có các dòng `app.get("/health"` và `app.get("/ready"`.
- `init.sql` tạo bảng `members` và thêm hai thành viên mẫu.

**Kiểm tra: bạn đúng khi** mở và thoát được `less` bằng `q`, và đọc được tên bảng `members`.

::: details Ghi chú cho mentor
- Nếu `find` hay `less` đã làm một học viên lạc đường, cho họ `cd ~/devops-course/starter-project` lại.
:::

---

## Slide 11: Bước 4 (15 phút): Tìm dòng bằng grep

`grep` trả lời câu hỏi "cái này nằm ở đâu trong project".

```bash
grep -n "app.get" backend/app.js
grep -c "app.get" backend/app.js
grep -n "3000" backend/server.js compose.yaml
grep -n "@example.com" database/init.sql
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules
```

::: details Ghi chú cho mentor
- Cờ hay dùng: `-n` hiện số dòng, `-r` tìm trong cả thư mục, `-c` đếm, `-i` không phân biệt hoa thường.
- `--exclude-dir=node_modules` tránh quét thư viện đã cài.
:::

---

## Slide 12: Bước 4: Kết quả đúng

- Lệnh 1 in 3 dòng (số dòng 8, 12, 21), lệnh 2 in `3`.
- Lệnh 3 thấy `3000` trong `backend/server.js` và `compose.yaml`.
- Lệnh 4 in 2 dòng (Alice và Bob).
- Lệnh 5 thấy `DB_PASSWORD` trong ít nhất 4 file.

**Kiểm tra: bạn đúng khi** `grep -c "app.get" backend/app.js` in `3`.

::: details Ghi chú cho mentor
- Lệnh 5 in `.env.example`, `backend/db.js`, `compose.yaml`, `k8s/backend.yaml`.
- `grep` không in gì: thử `grep -i`, hoặc kiểm tra bằng `cat file | head`.
:::

---

## Slide 13: Bước 5 (10 phút): Ghép lệnh bằng pipe

- `|` nối output của lệnh trước vào lệnh sau.
- Mỗi lệnh làm một việc nhỏ, bạn ghép chúng lại.

```bash
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules | wc -l
grep -rln "DB_PASSWORD" . --exclude-dir=node_modules | sort
```

::: details Ghi chú cho mentor
- `-l` chỉ in tên file chứa mẫu.
- `>` ghi output ra file (ghi đè), `>>` ghi nối thêm. File mất nội dung sau khi ghi thường do dùng `>` thay cho `>>`.
:::

---

## Slide 14: Bước 5: Kết quả đúng

Lệnh đầu in `5`. Lệnh sau in 4 tên file, mỗi file một dòng.

**Kiểm tra: bạn đúng khi** số dòng (5) lớn hơn số file (4), vì `compose.yaml` dùng `DB_PASSWORD` hai lần.

::: details Ghi chú cho mentor
- Hỏi lớp: vì sao 5 mà không phải 4? Cho họ tự tìm bằng `grep -rn`.
:::

---

## Slide 15: Bước 6 (20 phút): Đọc một file access log

Khi app chạy, web server ghi mỗi request vào access log. Hôm nay chưa có container, nên bạn tạo log mẫu 10 dòng.

- Cột 1 là IP, cột 7 là đường dẫn, cột 9 là mã HTTP.
- Đủ nhỏ để bạn đếm tay và tự kiểm chứng.

::: details Ghi chú cho mentor
- Dòng mẫu: `10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15`.
:::

---

## Slide 16: Bước 6: Tạo mini-access.log (phần 1/2)

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
- Đây là heredoc: bạn chưa gõ `EOF` thì lệnh chưa kết thúc. Gõ tiếp 5 dòng ở slide sau, rồi `EOF`.
- Cách an toàn: copy cả hai slide dán một lần.
:::

---

## Slide 17: Bước 6: Tạo mini-access.log (phần 2/2)

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

**Kiểm tra: bạn đúng khi** `wc -l` in `10 mini-access.log` và `grep -c` in `2`.

::: details Ghi chú cho mentor
- Học viên dán phần 2 ngay sau phần 1 trong cùng terminal, không gõ lại `cat > ...`.
:::

---

## Slide 18: Bước 6: Pipeline phân tích log

![access.log đi qua awk, sort, uniq -c, sort -nr](/slides/img/s03-pipeline.svg)

`sort` đứng trước `uniq -c` vì `uniq` chỉ gộp các dòng liền kề.

::: details Ghi chú cho mentor
- `awk` cắt cột; `sort` đưa giá trị giống nhau nằm cạnh nhau; `uniq -c` gộp dòng liền kề và đếm; `sort -nr` xếp giảm dần.
- Cách xây: thêm từng lệnh một, xem output rồi mới thêm tiếp.
:::

---

## Slide 19: Bước 6: Đếm request theo IP

```bash
awk '{print $1}' mini-access.log | sort | uniq -c | sort -nr
```

```text
      4 10.0.0.5
      3 10.0.0.9
      3 10.0.0.7
```

**Kiểm tra: bạn đúng khi** 4 + 3 + 3 = 10 dòng, khớp `wc -l`.

::: details Ghi chú cho mentor
- Với số lần bằng nhau, thứ tự có thể khác.
:::

---

## Slide 20: Bước 6: Đếm theo mã HTTP và lọc lỗi 5xx

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

**Kiểm tra: bạn đúng khi** bảng mã HTTP cộng lại bằng 10 và lệnh lọc 5xx cho đúng một dòng.

::: details Ghi chú cho mentor
- Lọc 5xx bằng `awk` kiểm tra đúng cột 9. Không dùng `grep " 5"` vì dễ khớp nhầm số byte.
:::

---

## Slide 21: Bước 7 (10 phút): Trả lời 5 câu hỏi về project Club

Chỉ dùng lệnh của hôm nay. Ghi lại lệnh bạn dùng cho mỗi câu.

1. Backend có mấy route? Là những route nào?
2. Backend chạy ở cổng nào, `compose.yaml` đặt cổng đó ở đâu?
3. Database được nạp sẵn mấy thành viên? Tên là gì?
4. Biến mật khẩu database tên gì, nằm trong những file nào?
5. Trong `mini-access.log`, request nào trả 5xx, từ IP nào?

::: details Ghi chú cho mentor
- Đáp án: 1) 3 route: `/health`, `/ready`, `/api/members`. 2) Cổng 3000: `server.js` đọc `PORT`, `compose.yaml` đặt `PORT: 3000`.
- 3) 2 thành viên: Alice, Bob. 4) `DB_PASSWORD`, nằm trong 4 file như Bước 4.
- 5) `GET /api/members` từ `10.0.0.9` trả 500.
- Cho học viên tự làm 5 phút, rồi gọi vài bạn đọc lệnh đã dùng.
:::

---

## Slide 22: Lỗi thường gặp: quên sort thì uniq đếm sai

![Không sort: mã 200 hiện nhiều dòng; có sort: gộp thành 6 request 200](/slides/img/s03-no-sort.svg)

Cách sửa: thêm `sort` trước `uniq -c`, rồi cộng các số đếm và so với `wc -l`.

::: details Ghi chú cho mentor
- Triệu chứng: mã 200 xuất hiện nhiều dòng với số đếm nhỏ. Nguyên nhân: `uniq` chỉ gộp dòng liền nhau.
- Lệnh trong ảnh viết gọn bằng `...`: đầy đủ là `awk '{print $9}' mini-access.log | uniq -c`.
:::

---

## Slide 23: Lỗi thường gặp: đường dẫn và grep

| Triệu chứng | Cách xử lý |
| --- | --- |
| `No such file or directory` | `pwd` và `ls`; dùng đường dẫn tuyệt đối với `~` |
| `cd: too many arguments` | Đặt đường dẫn có khoảng trắng trong nháy kép: `cd "my folder"` |
| `grep` không in gì | Thử `grep -i`; kiểm tra bằng `cat file \| head` |
| `grep -rn` in cả `node_modules` | Thêm `--exclude-dir=node_modules` |

::: details Ghi chú cho mentor
- Thư mục có khoảng trắng phải đặt trong nháy kép: `rm -r "docs/meeting notes"` khác hẳn `rm -r docs/meeting notes`.
- Chạy `pwd` và `ls` trước mọi lệnh xóa.
:::

---

## Slide 24: Tự kiểm tra

1. `find` và `grep` khác nhau thế nào? Khi nào dùng cái nào?
2. Vì sao phải `sort` trước `uniq -c`?
3. Làm sao biết `DB_PASSWORD` được dùng ở những file nào?

::: details Ghi chú cho mentor
- 1: `find` tìm file theo thuộc tính (tên, loại, kích thước); `grep` tìm dòng theo nội dung.
- 2: `uniq` chỉ gộp các dòng liền kề; `sort` đưa các giá trị giống nhau nằm cạnh nhau.
- 3: `grep -rln "DB_PASSWORD" . --exclude-dir=node_modules` in tên các file chứa biến đó.
:::

---

## Slide 25: Tiếp theo

Ngày 3: đưa project Club vào repo `devops-labs` bằng Git: [Slide Ngày 03](session-06.md).

---

## Slide 26: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [The Linux Command Line](https://linuxcommand.org/tlcl.php): sách miễn phí dạy dòng lệnh từ cơ bản.
- **Tài liệu chính thức:** [hier(7): cấu trúc thư mục Linux](https://man7.org/linux/man-pages/man7/hier.7.html): hiểu mỗi thư mục như /etc, /var để làm gì.
- **Tài liệu chính thức:** [chmod (POSIX)](https://man7.org/linux/man-pages/man1/chmod.1p.html): tra cứu cách đổi quyền file.
- **Best practice:** [CIS Benchmarks](https://www.cisecurity.org/benchmarks): danh sách chuẩn để cấu hình Linux an toàn.
