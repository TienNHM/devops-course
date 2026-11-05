# Ngày 2 – Dùng Linux CLI để đọc project Club

::: warning Bản lưu trữ
Nội dung bài này đã chuyển vào [slide Ngày 2](../../slides/01-foundation/session-03.md). Lộ trình Cơ bản chỉ học bằng slide, trang này giữ lại để tham khảo và không còn là đường học chính.
:::

Lộ trình Cơ bản · Ngày 2/10 · khoảng 2 giờ

[Slide Ngày 2](../../slides/01-foundation/session-03.md) · [Thử thách thêm](session-03-challenge.md)

> **Tóm tắt:** Dùng `pwd`, `ls`, `cd`, `find`, `grep`, `less` và pipe để đọc hiểu project Club Management và một file access log, rồi ghi câu trả lời cho 5 câu hỏi về project vào `notes/day-02.md`.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** file `notes/day-02.md` trong `devops-labs` trả lời 5 câu hỏi cụ thể về project Club, mỗi câu kèm lệnh bạn đã dùng để tìm ra đáp án.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 1](../week-01/session-02.md): mở được terminal Ubuntu, `~/devops-labs` và `~/devops-course` đã clone
- [ ] Chưa quen terminal thì đọc nhanh [Terminal cơ bản](../../resources/terminal-101.md)
:::

## Bài toán thật

Mentor giao cho bạn một project lạ: app Club Management của CLB. Chưa ai nói nó có bao nhiêu API, chạy ở cổng nào, mật khẩu database nằm ở đâu. Không có giao diện đồ họa trên server, nên bạn phải tự khám phá bằng terminal. Một lát nữa, khi app hỏng, bạn cũng sẽ phải đọc log bằng chính các lệnh này. Hôm nay bạn luyện đúng hai việc đó: đọc project và đọc log.

## Làm

Làm trong Ubuntu (WSL), ở `~`. Trước mọi lệnh xóa file, luôn chạy `pwd` và `ls` để chắc bạn đang đứng đúng chỗ.

### Bước 1: Đi vào project và nhìn quanh

Cập nhật repo giáo trình rồi vào thư mục `starter-project`. Đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; đường dẫn tương đối tính từ chỗ bạn đang đứng. `.` là thư mục hiện tại, `..` là thư mục cha.

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

Kết quả mong đợi: `pwd` đầu tiên in `/home/TEN_BAN/devops-course/starter-project`; `ls -la` có `backend`, `frontend`, `database`, `k8s`, `compose.yaml`, `README.md` và các file ẩn như `.env.example`. `cd -` đưa bạn quay lại thư mục trước đó.

::: tip Kiểm tra: bạn đúng khi
Sau `cd ..` rồi `pwd` bạn đang ở `starter-project`, và `ls` thấy `compose.yaml`.
:::

### Bước 2: Tìm file bằng find

`find` tìm **file** theo tên, loại, kích thước. Bạn cần biết project có những loại file nào và nằm ở đâu.

```bash
cd ~/devops-course/starter-project
find . -type d -not -path "*/node_modules/*"
find . -name "Dockerfile"
find . -name "*.yaml" | sort
find . -type f -not -path "*/node_modules/*" | wc -l
```

Kết quả mong đợi: lệnh đầu in `.`, `./backend`, `./backend/tests`, `./database`, `./frontend`, `./k8s`; lệnh hai in `./backend/Dockerfile` và `./frontend/Dockerfile`; lệnh ba in `./compose.yaml` cùng các file trong `./k8s/`; lệnh cuối in một con số (khoảng 24 nếu bạn chưa chạy `npm install` ở đây).

::: tip Kiểm tra: bạn đúng khi
Bạn thấy đúng hai `Dockerfile` (backend, frontend) và biết file `compose.yaml` nằm ở thư mục gốc của project.
:::

### Bước 3: Đọc file bằng cat, head, less

Đọc từng phần nhỏ thay vì mở cả file. `head` xem đầu, `cat -n` in kèm số dòng, `less` cuộn từng trang (gõ `/chuoi` để tìm, `n` sang kết quả kế tiếp, `q` để thoát).

```bash
cat -n backend/app.js | head -n 25
cat database/init.sql
wc -l compose.yaml
less compose.yaml
```

Trong `less`, gõ `/postgres` rồi Enter để nhảy tới chỗ khai báo Postgres, rồi `q` để thoát. Kết quả mong đợi: `app.js` có các dòng `app.get("/health"`, `app.get("/ready"`; `init.sql` tạo bảng `members` và thêm hai thành viên mẫu.

::: tip Kiểm tra: bạn đúng khi
Bạn mở và thoát được `less` bằng `q`, và đọc được tên bảng `members` trong `init.sql`.
:::

### Bước 4: Tìm dòng bằng grep

`grep` tìm **dòng** theo nội dung. Đây là công cụ chính để trả lời "cái này nằm ở đâu trong project". Cờ hay dùng: `-n` hiện số dòng, `-r` tìm trong cả thư mục, `-c` đếm, `-i` không phân biệt hoa thường.

```bash
grep -n "app.get" backend/app.js
grep -c "app.get" backend/app.js
grep -n "3000" backend/server.js compose.yaml
grep -n "@example.com" database/init.sql
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules
```

Kết quả mong đợi:

- Lệnh 1 in 3 dòng (số dòng 8, 12, 21), lệnh 2 in `3`.
- Lệnh 3 thấy `3000` trong `backend/server.js` và nhiều lần trong `compose.yaml`.
- Lệnh 4 in 2 dòng, của Alice và Bob.
- Lệnh 5 in các dòng có `DB_PASSWORD` trong `.env.example`, `backend/db.js`, `compose.yaml` và `k8s/backend.yaml`.

::: tip Kiểm tra: bạn đúng khi
`grep -c "app.get" backend/app.js` in `3` và lệnh `grep -rn "DB_PASSWORD"` cho thấy tên biến xuất hiện ở ít nhất 4 file.
:::

### Bước 5: Ghép lệnh bằng pipe

Ký tự `|` nối output của lệnh trước vào lệnh sau; `>` ghi output ra file (ghi đè), `>>` ghi nối thêm. Mỗi lệnh làm một việc nhỏ, bạn ghép chúng lại.

```bash
grep -rn "DB_PASSWORD" . --exclude-dir=node_modules | wc -l
grep -rln "DB_PASSWORD" . --exclude-dir=node_modules | sort
```

Kết quả mong đợi: lệnh đầu in `5`; lệnh sau in 4 tên file, mỗi file một dòng. `-l` chỉ in tên file chứa mẫu.

::: tip Kiểm tra: bạn đúng khi
Số dòng (5) lớn hơn số file (4), vì `compose.yaml` dùng `DB_PASSWORD` hai lần.
:::

### Bước 6: Đọc một file access log

Khi app chạy, web server ghi mỗi request vào access log. Hôm nay chưa có container, nên bạn tạo một log mẫu 10 dòng mô phỏng request tới API Club, đủ nhỏ để đếm tay. Mỗi dòng: cột 1 là IP, cột 7 là đường dẫn, cột 9 là mã HTTP.

```bash
cd ~
cat > mini-access.log <<'EOF'
10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.5 - - [21/Oct/2026:09:00:02 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.7 - - [21/Oct/2026:09:00:03 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.9 - - [21/Oct/2026:09:00:04 +0700] "GET /api/members/99 HTTP/1.1" 404 40
10.0.0.5 - - [21/Oct/2026:09:00:05 +0700] "GET /ready HTTP/1.1" 200 15
10.0.0.7 - - [21/Oct/2026:09:00:06 +0700] "POST /api/members HTTP/1.1" 405 30
10.0.0.9 - - [21/Oct/2026:09:00:07 +0700] "GET /api/members HTTP/1.1" 500 60
10.0.0.5 - - [21/Oct/2026:09:00:08 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.7 - - [21/Oct/2026:09:00:09 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.9 - - [21/Oct/2026:09:00:10 +0700] "GET /favicon.ico HTTP/1.1" 404 40
EOF
wc -l mini-access.log
grep -c " 404 " mini-access.log
```

Kết quả mong đợi: `10 mini-access.log` rồi `2`. Bây giờ ghép pipeline để thống kê. `sort` đứng trước `uniq -c` vì `uniq` chỉ gộp các dòng liền kề.

```bash
awk '{print $1}' mini-access.log | sort | uniq -c | sort -nr
awk '{print $9}' mini-access.log | sort | uniq -c | sort -nr
awk '$9 ~ /^5/ {print $1, $7, $9}' mini-access.log
```

Kết quả mong đợi:

```text
      4 10.0.0.5
      3 10.0.0.9
      3 10.0.0.7
      6 200
      2 404
      1 500
      1 405
10.0.0.9 /api/members 500
```

Với các IP bằng số lần nhau, thứ tự có thể khác. Lệnh thứ ba dùng `awk` kiểm tra đúng cột 9, không dùng `grep " 5"` vì dễ khớp nhầm vào số byte.

::: tip Kiểm tra: bạn đúng khi
Hai bảng đều cộng lại bằng 10 (khớp `wc -l`) và lệnh lọc 5xx cho đúng một dòng.
:::

### Bước 7: Trả lời 5 câu hỏi vào notes

Tạo file note với 5 câu hỏi, rồi mở bằng VS Code để điền câu trả lời. Với mỗi câu, ghi đáp án và lệnh bạn đã dùng.

```bash
mkdir -p ~/devops-labs/notes
cat > ~/devops-labs/notes/day-02.md <<'EOF'
# Ngày 2 - Đọc project Club bằng Linux CLI

1. Backend có mấy route? Là những route nào?
   Đáp án:
   Lệnh:

2. Backend chạy ở cổng nào, và compose.yaml đặt cổng đó ở đâu?
   Đáp án:
   Lệnh:

3. Database được nạp sẵn mấy thành viên? Tên là gì?
   Đáp án:
   Lệnh:

4. Biến mật khẩu database tên gì, và nó xuất hiện trong những file nào?
   Đáp án:
   Lệnh:

5. Trong mini-access.log, request nào trả về 5xx, từ IP nào?
   Đáp án:
   Lệnh:
EOF
code ~/devops-labs/notes/day-02.md
```

Điền xong, đẩy lên GitHub:

```bash
cd ~/devops-labs
git add notes/day-02.md
git status -s
git commit -m "Add day-02 notes"
git push
```

Đáp án để bạn đối chiếu sau khi tự làm: 3 route (`/health`, `/ready`, `/api/members`); cổng 3000 (`server.js` đọc `PORT`, `compose.yaml` đặt `PORT: 3000`); 2 thành viên (Alice, Bob); biến `DB_PASSWORD` nằm trong 4 file như Bước 4; request `GET /api/members` từ `10.0.0.9` trả 500.

::: tip Kiểm tra: bạn đúng khi
`notes/day-02.md` có đủ 5 câu, mỗi câu có đáp án và lệnh, và đã hiện trên GitHub.
:::

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `No such file or directory` | Sai đường dẫn hoặc đứng sai thư mục | Chạy `pwd` và `ls`; dùng đường dẫn tuyệt đối với `~`. Chưa có `~/devops-course`: quay lại Ngày 1, Bước 5 |
| `cd: too many arguments` | Đường dẫn có khoảng trắng mà chưa đặt trong nháy kép | `cd "my folder"` |
| `uniq -c` in nhiều dòng `200` với số đếm nhỏ | Quên `sort` trước `uniq` | Thêm `sort` trước `uniq -c`; cộng các số đếm và so với `wc -l` |
| `grep` không in gì | Sai chữ hoa chữ thường hoặc sai mẫu | Thử `grep -i`; kiểm tra bằng `cat file \| head` |
| `grep -rn` in cả thư mục `node_modules` | Quét cả thư viện đã cài | Thêm `--exclude-dir=node_modules` |
| File mất nội dung sau khi ghi | Dùng `>` thay cho `>>` | Dùng `>>` để ghi nối; chạy `cat` trước khi ghi đè |

## Nộp bài

- [ ] `notes/day-02.md` đã push lên `devops-labs`, trả lời đủ 5 câu và ghi lệnh đã dùng cho mỗi câu.
- [ ] Bạn chạy được pipeline `awk | sort | uniq -c | sort -nr` trên `mini-access.log` và hai bảng cộng lại bằng 10.
- [ ] Không có mật khẩu hay token thật trong note.

## Tự kiểm tra

1. `find` và `grep` khác nhau thế nào? Khi nào dùng cái nào?
2. Vì sao phải `sort` trước `uniq -c`?
3. Làm sao biết một biến môi trường như `DB_PASSWORD` được dùng ở những file nào trong project?

::: details Đáp án gợi ý
1. `find` tìm file theo thuộc tính (tên, loại, kích thước); `grep` tìm dòng theo nội dung. Tìm file thì dùng `find`, tìm chuỗi trong file thì dùng `grep`.
2. `uniq` chỉ gộp các dòng liền kề; `sort` đưa các giá trị giống nhau nằm cạnh nhau.
3. `grep -rln "DB_PASSWORD" . --exclude-dir=node_modules` in tên các file chứa biến đó.
:::

## Tiếp theo

[Ngày 3 – Đưa project Club vào Git](../week-03/session-06.md)

::: details Tài liệu tham khảo
- [GNU Bash Reference Manual – Pipelines](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html)
- [GNU Bash Reference Manual – Quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)
- [GNU findutils – find manual](https://www.gnu.org/software/findutils/manual/html_mono/find.html)
- [GNU grep manual](https://www.gnu.org/software/grep/manual/grep.html)
- [GNU Coreutils – uniq invocation](https://www.gnu.org/software/coreutils/manual/html_node/uniq-invocation.html)
:::
