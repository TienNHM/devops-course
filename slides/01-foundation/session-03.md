# Slide buổi 03 – Linux CLI

> **Tóm tắt:** Dùng thành thạo pwd, ls, cd, find, grep, cat, less, head, tail và pipe để điều hướng filesystem, tìm file và phân tích access log. Bài học: [Buổi 03 – Linux CLI](../../labs/week-02/session-03.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: điều hướng, tìm kiếm, ghép pipe](/slides/img/s03-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: hiểu cây thư mục, đường dẫn tuyệt đối và tương đối; dùng `pwd`, `ls`, `cd`, `cat`, `less`, `head`, `tail`; tìm file bằng `find`, tìm dòng bằng `grep`; ghép `awk | sort | uniq -c | sort -nr` để thống kê access log; chẩn đoán lỗi quote đường dẫn, sai đường dẫn, `rm` nhầm chỗ.
- Hỏi: ai từng mở file log bằng Notepad?
:::

---

## Slide 2: Web chậm trước giờ demo

![Log hàng chục nghìn dòng: Notepad không khả thi, pipeline trả lời trong vài chục giây](/slides/img/s03-problem.svg)

::: details Ghi chú cho mentor
- Server chỉ có terminal, log Nginx dài hàng chục nghìn dòng. Cần biết: IP nào gọi nhiều nhất, bao nhiêu lỗi 5xx, endpoint nào bị gọi nhiều.
- Mở bằng Notepad hay đọc bằng mắt đều không khả thi. Người biết CLI trả lời trong vài chục giây bằng một dòng pipeline.
:::

---

## Slide 3: Cây thư mục Linux

![Một cây từ gốc /, home là ~, etc, var/log, tmp, ổ Windows dưới /mnt/c](/slides/img/s03-tree.svg)

::: details Ghi chú cho mentor
- `/` là gốc; `~` là home, nơi làm việc chính; `/etc` là cấu hình hệ thống; `/var/log` là log; `/tmp` là file tạm; `.` và `..` là thư mục hiện tại và thư mục cha.
- Không có ổ `C:`, ổ Windows nằm dưới `/mnt/c` (tránh trong khóa này). Linux phân biệt chữ hoa chữ thường.
- Đường dẫn tuyệt đối bắt đầu bằng `/` hoặc `~`; tương đối tính từ chỗ đang đứng.
:::

---

## Slide 4: Lệnh điều hướng và đọc file

| Lệnh | Công dụng |
| --- | --- |
| `pwd`, `ls -la` | Đang ở đâu, trong đó có gì |
| `cd`, `cd ..`, `cd -` | Đổi thư mục, lên cha, quay lại |
| `cat`, `less`, `head`, `tail` | In cả file, cuộn (thoát bằng `q`), đầu, cuối |
| `mkdir -p`, `wc -l` | Tạo thư mục kể cả cha, đếm dòng |

::: details Ghi chú cho mentor
- Thói quen quan trọng nhất: trước mọi lệnh xóa, chạy `pwd` và `ls`.
- Trong `less`: gõ `/chuoi` để tìm, `n` sang kết quả kế tiếp, `q` để thoát.
- `head -n` và `tail -n` xem đầu, cuối file; `ls -la` hiện cả file ẩn.
:::

---

## Slide 5: find tìm file, grep tìm dòng

![find tìm file theo tên, loại, kích thước; grep tìm dòng theo nội dung](/slides/img/s03-find-grep.svg)

::: details Ghi chú cho mentor
- Thêm ví dụ `find`: `find . -type d` (chỉ thư mục, `-type f` là file), `find . -size +1M` (lớn hơn 1 MiB).
- `grep` thêm: `-i` không phân biệt hoa thường, `-v` đảo, `-c` đếm, `-n` số dòng, `-r` đệ quy.
- Ví von: `find` là tra mục lục thư viện, `grep` là lật từng trang tìm câu chữ.
:::

---

## Slide 6: Pipe và redirect

![Pipe nối stdout với stdin; > ghi đè, >> ghi nối, 2> ghi riêng lỗi](/slides/img/s03-pipe-redirect.svg)

```bash
printf '%s\n' 'line one' 'line two ERROR' 'line three' > sample.txt
grep ERROR sample.txt
cat sample.txt | wc -l
```

Kết quả: `line two ERROR` rồi `3`.

::: details Ghi chú cho mentor
- Mỗi lệnh làm một việc nhỏ: đọc stdin, ghi stdout. Ví von: dây chuyền nhà máy, mỗi công nhân một công đoạn.
- Công cụ hay dùng: `awk '{print $1}'`, `sort`, `uniq -c`, `head -n 5`.
:::

---

## Slide 7: Một dòng access log

![Các cột: $1 là IP, $7 là đường dẫn, $9 là mã HTTP, $10 là số byte](/slides/img/s03-log-anatomy.svg)

::: details Ghi chú cho mentor
- Dòng đầy đủ: `10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15`.
- `awk` tách theo khoảng trắng nên `$4` là thời gian (có dấu `[`), `$6` là phương thức (có dấu `"`), `$9` là mã trạng thái.
- Trong ảnh, dấu `…` ở cột 4 chỉ là rút gọn cho vừa khung.
:::

---

## Slide 8: Pipeline phân tích log

![access.log đi qua awk, sort, uniq -c, sort -nr](/slides/img/s03-pipeline.svg)

::: details Ghi chú cho mentor
- `awk` cắt mỗi dòng thành cột và in cột cần phân tích; `sort` đưa giá trị giống nhau nằm cạnh nhau; `uniq -c` gộp các dòng liền kề và đếm; `sort -nr` xếp giảm dần; `head -n 5` giữ top 5.
- Cách xây: thêm từng lệnh một, xem output rồi mới thêm tiếp.
- Dữ liệu trong ảnh lấy từ `mini-access.log` 10 dòng của lab.
:::

---

## Slide 9: Demo: đếm request theo IP

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
- Dữ liệu nhỏ 10 dòng, đếm tay được để tự kiểm chứng.
- Với số lần bằng nhau, thứ tự có thể khác.
- Thay `$1` bằng `$9` để thống kê theo mã HTTP; lọc 5xx bằng `awk '$9 ~ /^5/ {print $1, $7, $9}' mini-access.log`.
:::

---

## Slide 10: Quên sort thì uniq đếm sai

![Không sort: mã 200 hiện nhiều dòng; có sort: gộp thành 6 request 200](/slides/img/s03-no-sort.svg)

::: details Ghi chú cho mentor
- Triệu chứng: mã 200 xuất hiện nhiều dòng với số đếm nhỏ. Nguyên nhân: `uniq` chỉ gộp dòng liền nhau.
- Cách sửa: thêm `sort` trước `uniq -c`. Cách kiểm: cộng các số đếm, so với `wc -l`.
- Lệnh trong ảnh viết gọn bằng `...`: đầy đủ là `awk '{print $9}' mini-access.log | uniq -c`.
:::

---

## Slide 11: Lab: ba phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Dựng cây `club-site` | Cây có đủ 11 dòng như bài lab |
| 2 | `find`, `grep -r`, `>` và `>>` | `grep -rn "port"` ra dòng 2 |
| 3 | `mini-access.log`, đếm theo IP và mã HTTP | `wc -l` ra 10 |

Toàn bộ lệnh và kết quả mong đợi: [Buổi 03 – Linux CLI](../../labs/week-02/session-03.md).

::: details Ghi chú cho mentor
- Thư mục có khoảng trắng (`meeting notes`) phải đặt trong nháy kép.
- Phần 3 làm thêm trên file thật `examples/linux/access.log` (260 dòng) bằng `less`.
- Lọc 5xx bằng `awk` kiểm tra đúng cột 9, không dùng `grep " 5"` vì dễ khớp nhầm số byte.
:::

---

## Slide 12: Khoảng trắng chưa quote

![Không quote thì shell tách thành hai đối số; có quote thì một đối số](/slides/img/s03-quote-space.svg)

| Triệu chứng | Cách xử lý |
| --- | --- |
| `cd: too many arguments` | Quote: `cd "my folder"` |
| `No such file or directory` | `pwd`, `ls`, dùng đường dẫn tuyệt đối |
| File mất nội dung | Dùng `>>` thay cho `>` |

::: details Ghi chú cho mentor
- Shell tách đối số theo khoảng trắng; thói quen: chạy `ls` hoặc `echo` với cùng đối số trước khi xóa, `pwd` trước `rm`.
- Bảng đầy đủ nằm trong mục "Gặp lỗi?" của bài lab.
:::

---

## Slide 13: Thử thách

Viết pipeline in 3 URL được gọi nhiều nhất từ access log.

Gõ `rm -rf logs /` thay vì `rm -rf logs/` thì chuyện gì có thể xảy ra?

`grep ERROR app.log` không ra gì nhưng chắc có lỗi: bạn kiểm tra gì?

::: details Ghi chú cho mentor
- Top 3 URL: `awk '{print $7}' access.log | sort | uniq -c | sort -nr | head -n 3`.
- Với `grep`: thử `-i`, kiểm tra đúng file bằng `pwd` và `ls`, `wc -l`, và `grep -r` trong thư mục log.
- `rm -rf logs /` có dấu cách thừa nên `/` thành một đối số riêng: rất nguy hiểm, đừng thử trên máy thật.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: cây từ /, find và grep, pipe](/slides/img/s03-recap.svg)

Buổi tiếp theo: Linux Administration ([Slide buổi 04](session-04.md)).
