# Slide Ngày 02 – Dùng Linux CLI để đọc project Club

> **Tóm tắt:** Dùng `pwd`, `ls`, `cd`, `find`, `grep`, `less` và pipe để đọc hiểu project Club Management và một file access log, rồi trả lời 5 câu hỏi về project trong `notes/day-02.md`. Bài học: [Ngày 2 – Dùng Linux CLI để đọc project Club](../../labs/week-02/session-03.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: điều hướng, tìm kiếm, ghép pipe](/slides/img/s03-goals.svg)

::: details Ghi chú cho mentor
- Cuối ngày mỗi bạn có `notes/day-02.md` trả lời 5 câu hỏi cụ thể về project Club, kèm lệnh đã dùng.
- Hỏi: ai từng mở file log bằng Notepad?
:::

---

## Slide 2: Project lạ, server không có giao diện

![Log hàng chục nghìn dòng: Notepad không khả thi, pipeline trả lời trong vài chục giây](/slides/img/s03-problem.svg)

::: details Ghi chú cho mentor
- Mentor giao một project lạ: chưa ai nói nó có bao nhiêu API, chạy ở cổng nào, mật khẩu database nằm ở đâu. Server chỉ có terminal.
- Khi app hỏng, log dài hàng chục nghìn dòng: Notepad hay đọc bằng mắt đều không khả thi. Người biết CLI trả lời trong vài chục giây.
:::

---

## Slide 3: Cây thư mục Linux

![Một cây từ gốc /, home là ~, etc, var/log, tmp, ổ Windows dưới /mnt/c](/slides/img/s03-tree.svg)

::: details Ghi chú cho mentor
- `/` là gốc; `~` là home, nơi làm việc chính; `.` và `..` là thư mục hiện tại và thư mục cha.
- Đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; tương đối tính từ chỗ đang đứng. Linux phân biệt chữ hoa chữ thường.
- Ổ Windows nằm dưới `/mnt/c`, tránh trong khóa này.
:::

---

## Slide 4: Lệnh điều hướng và đọc file

| Lệnh | Công dụng |
| --- | --- |
| `pwd`, `ls -la` | Đang ở đâu, trong đó có gì |
| `cd`, `cd ..`, `cd -` | Đổi thư mục, lên cha, quay lại |
| `cat -n`, `less`, `head`, `tail` | In kèm số dòng, cuộn (thoát bằng `q`), đầu, cuối |
| `wc -l` | Đếm dòng |

::: details Ghi chú cho mentor
- Thói quen quan trọng nhất: trước mọi lệnh xóa, chạy `pwd` và `ls`.
- Trong `less`: gõ `/chuoi` để tìm, `n` sang kết quả kế tiếp, `q` để thoát.
- Cho học viên thử ngay trên `~/devops-course/starter-project`.
:::

---

## Slide 5: find tìm file, grep tìm dòng

![find tìm file theo tên, loại, kích thước; grep tìm dòng theo nội dung](/slides/img/s03-find-grep.svg)

::: details Ghi chú cho mentor
- `grep` thêm: `-i` không phân biệt hoa thường, `-v` đảo, `-c` đếm, `-n` số dòng, `-r` đệ quy.
- Ví von: `find` là tra mục lục thư viện, `grep` là lật từng trang tìm câu chữ.
:::

---

## Slide 6: Demo: hỏi project Club bằng grep

```bash
cd ~/devops-course/starter-project
grep -n "app.get" backend/app.js
grep -n "@example.com" database/init.sql
grep -rln "DB_PASSWORD" . --exclude-dir=node_modules
```

Ba lệnh, ba câu trả lời: có 3 route, có 2 thành viên mẫu, mật khẩu database nằm ở 4 file.

::: details Ghi chú cho mentor
- Tự gõ trực tiếp, cho học viên đoán output trước khi nhấn Enter.
- `-r` tìm trong cả thư mục; `--exclude-dir=node_modules` tránh quét thư viện đã cài.
- Ba câu này nằm trong 5 câu hỏi của `notes/day-02.md`.
:::

---

## Slide 7: Pipeline phân tích log

![access.log đi qua awk, sort, uniq -c, sort -nr](/slides/img/s03-pipeline.svg)

Cột của access log: `$1` là IP, `$7` là đường dẫn, `$9` là mã HTTP. Dấu `|` nối lệnh với lệnh; `>` ghi output ra file, `>>` ghi nối thêm.

::: details Ghi chú cho mentor
- Dòng mẫu: `10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15`.
- `awk` cắt cột; `sort` đưa giá trị giống nhau nằm cạnh nhau; `uniq -c` gộp dòng liền kề và đếm; `sort -nr` xếp giảm dần.
- Cách xây: thêm từng lệnh một, xem output rồi mới thêm tiếp.
- Dữ liệu trong ảnh lấy từ `mini-access.log` 10 dòng của lab.
:::

---

## Slide 8: Demo: đếm request theo IP

```bash
awk '{print $1}' mini-access.log | sort | uniq -c | sort -nr
```

```text
      4 10.0.0.5
      3 10.0.0.9
      3 10.0.0.7
```

Cộng các số đếm: 4 + 3 + 3 = 10 dòng, khớp `wc -l`.

::: details Ghi chú cho mentor
- Dữ liệu nhỏ 10 dòng, đếm tay được để tự kiểm chứng. Với số lần bằng nhau, thứ tự có thể khác.
- Thay `$1` bằng `$9` để thống kê theo mã HTTP; lọc 5xx bằng `awk '$9 ~ /^5/ {print $1, $7, $9}' mini-access.log`: ra `10.0.0.9 /api/members 500`.
:::

---

## Slide 9: Quên sort thì uniq đếm sai

![Không sort: mã 200 hiện nhiều dòng; có sort: gộp thành 6 request 200](/slides/img/s03-no-sort.svg)

::: details Ghi chú cho mentor
- Triệu chứng: mã 200 xuất hiện nhiều dòng với số đếm nhỏ. Nguyên nhân: `uniq` chỉ gộp dòng liền nhau.
- Cách sửa: thêm `sort` trước `uniq -c`. Cách kiểm: cộng các số đếm, so với `wc -l`.
- Lệnh trong ảnh viết gọn bằng `...`: đầy đủ là `awk '{print $9}' mini-access.log | uniq -c`.
:::

---

## Slide 10: Lab: 5 câu hỏi về project Club

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-3 | `cd`, `ls`, `find`, `cat`, `less` trong `starter-project` | Thấy 2 Dockerfile, mở và thoát `less` |
| 4-5 | `grep`, `grep -rn`, pipe với `wc -l` | `grep -c "app.get"` ra `3` |
| 6 | Tạo `mini-access.log`, đếm theo IP và mã HTTP | `wc -l` ra 10 |
| 7 | Điền `notes/day-02.md`, commit, push | 5 câu có đáp án và lệnh |

Toàn bộ lệnh và kết quả mong đợi: [Ngày 2 – Dùng Linux CLI để đọc project Club](../../labs/week-02/session-03.md).

::: details Ghi chú cho mentor
- 5 câu: số route, cổng của backend, số thành viên mẫu, biến mật khẩu database nằm ở file nào, request 5xx trong log.
- Thư mục có khoảng trắng phải đặt trong nháy kép; thói quen: `pwd` và `ls` trước mọi lệnh xóa.
- Lọc 5xx bằng `awk` kiểm tra đúng cột 9, không dùng `grep " 5"` vì dễ khớp nhầm số byte.
:::

---

## Slide 11: Recap

![Ba điều cần nhớ: cây từ /, find và grep, pipe](/slides/img/s03-recap.svg)

Ngày tiếp theo: [Ngày 3 – Đưa project Club vào Git](../../labs/week-03/session-06.md).

---

## Slide 12: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [The Linux Command Line](https://linuxcommand.org/tlcl.php): sách miễn phí dạy dòng lệnh từ cơ bản.
- **Tài liệu chính thức:** [hier(7): cấu trúc thư mục Linux](https://man7.org/linux/man-pages/man7/hier.7.html): hiểu mỗi thư mục như /etc, /var để làm gì.
- **Tài liệu chính thức:** [chmod (POSIX)](https://man7.org/linux/man-pages/man1/chmod.1p.html): tra cứu cách đổi quyền file.
- **Best practice:** [CIS Benchmarks](https://www.cisecurity.org/benchmarks): danh sách chuẩn để cấu hình Linux an toàn.
