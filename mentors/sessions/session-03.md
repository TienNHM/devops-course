# Kịch bản mentor – Buổi 03: Linux CLI

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 03 – Linux CLI](../../labs/week-02/session-03.md). Slide: [Slide buổi 03](../../slides/01-foundation/session-03.md). Đáp án: [Walkthrough tuần 2](../walkthroughs/week-02.md). Barem: [Chấm điểm tuần 2](../grading/week-02.md).
:::

Tuần 2 · Giai đoạn 1 – Engineering Foundation · Buổi 03/32

## Khung thời gian buổi 120 phút

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Chia thời gian cho phần thực hành 60 phút của buổi 03: Phần 1 (10'), Phần 2 (10'), Phần 3 (25'), L2 (15'). Thử thách 1 đến 3 của L2 khoảng 8 phút, thử thách 4 (script `log-report.sh`) khoảng 7 phút; nếu hết giờ, học viên hoàn thành script ở nhà.

## Demo của mentor

Mentor thực hiện trên màn hình chiếu, học viên gõ theo. Thời lượng khoảng 10 phút trong phần 30 phút kiến thức.

**Bước 1. Định vị.**

```bash
cd ~
pwd
ls -la
```

Kết quả mong đợi: đường dẫn `/home/ten-ban` và danh sách file ẩn như `.bashrc`.

Câu hỏi cho lớp: "Nếu tôi gõ `cd /` rồi `ls`, bạn nghĩ sẽ thấy gì? Ổ `C:` nằm ở đâu?"

**Bước 2. Tạo file log nhỏ và quan sát.**

```bash
mkdir -p ~/demo && cd ~/demo
printf '%s\n' 'line one' 'line two ERROR' 'line three' > sample.txt
cat sample.txt
grep ERROR sample.txt
```

Kết quả mong đợi:

```text
line one
line two ERROR
line three
line two ERROR
```

**Bước 3. Pipe là gì.** So sánh hai cách đếm số dòng:

```bash
wc -l sample.txt
cat sample.txt | wc -l
```

Kết quả mong đợi: `3 sample.txt` và `3`. Giải thích: khi đọc từ stdin, `wc` không biết tên file nên không in tên.

Câu hỏi cho lớp: "Vì sao `uniq -c` cho kết quả sai nếu bỏ qua `sort` trước nó?" (Gợi ý mentor: thử với dữ liệu `a b a`.)

**Bước 4. Phá thử cố ý.**

```bash
cd ~/demo
mkdir "my folder"
cd my folder
```

Kết quả mong đợi: lỗi `bash: cd: too many arguments`. Giải thích bằng quote: `cd "my folder"`. Chuyển sang phần "Gặp lỗi?" trong bài lab để học viên tự điều tra.

**Dọn dẹp demo:**

```bash
cd ~ && rm -r ~/demo
```

## Câu hỏi mentor nên hỏi lớp

- "Nếu tôi gõ `cd /` rồi `ls`, bạn nghĩ sẽ thấy gì? Ổ `C:` nằm ở đâu?" (Bước 1)
- "Vì sao `uniq -c` cho kết quả sai nếu bỏ qua `sort` trước nó?" (Bước 3; gợi ý dữ liệu `a b a`)
- Nếu là bạn, bạn bắt đầu từ đâu để tìm IP gọi nhiều nhất trong log vài chục nghìn dòng?
- Tìm file nào thì dùng gì, tìm chữ trong file thì dùng gì?
- Vì sao không dùng `grep " 5"` để đếm lỗi 5xx? (Gợi ý: dòng nào có `512` ở cuối? Log có byte là 512 sẽ bị khớp.)
- Lỗi nào trong bảng "Gặp lỗi?" bạn đã gặp rồi?
- Hỏi nhanh cuối buổi: vì sao phải `sort` trước `uniq -c`? `>` và `>>` khác nhau thế nào?

## Ghi chú giảng viên từ slide

Nguyên văn các ghi chú giảng viên của bộ slide cũ, xếp theo chủ đề của slide mới.

**Slide Mục tiêu buổi học.** 2 phút. Kiểm tra nhanh `cd ~ && pwd` ra đường dẫn dạng `/home/...`, nếu ra `/mnt/c` thì nhắc học viên `cd ~`.

**Slide Vấn đề – web chậm trước giờ demo.** Hỏi lớp: nếu là bạn, bạn bắt đầu từ đâu? Sau này `docker logs` và `kubectl logs` đều dùng đúng kỹ năng này.

**Slide Cây thư mục Linux.** Câu hỏi: gõ `cd /` rồi `ls` thấy gì? Ổ C nằm ở đâu? Phân biệt tuyệt đối (bắt đầu bằng `/` hoặc `~`) và tương đối (tính từ chỗ đang đứng).

**Slide Lệnh điều hướng và đọc file.** Dạy theo thói quen: trước mọi lệnh nguy hiểm, chạy `pwd` và `ls`. `less`: gõ `/chuoi` để tìm, `q` để thoát.

**Slide find tìm file, grep tìm dòng.** Câu hỏi nhanh: tìm file nào dùng gì, tìm chữ trong file dùng gì? Luôn đặt mẫu có ký tự đặc biệt như `*` trong nháy kép.

**Slide Pipe và redirect.** Giải thích vì sao `wc -l sample.txt` in tên file còn khi đọc từ stdin thì không: `wc` không biết tên file. Nhắc `>` dễ mất dữ liệu.

**Slide Định dạng access log.** Cho học viên tự đếm cột trên dòng mẫu trong 1 phút. Cột 4 là thời gian có dấu `[`, cột 6 là phương thức có dấu `"`.

**Slide Kiến trúc pipeline phân tích log.** Mỗi lệnh là một process riêng, dữ liệu chảy theo khối nên xử lý được file rất lớn. `grep` là bước tùy chọn. Câu hỏi: vì sao `uniq` cần `sort` trước? Để dành câu trả lời cho phần demo quên `sort`, cho lớp đoán trước.

**Slide Demo – đếm request theo IP.** Chạy từng đoạn: chỉ `awk`, rồi thêm `sort`, rồi `uniq -c`. Kiểm tra tổng 4+3+3 bằng `wc -l` ra 10.

**Slide Demo – quên sort thì sao.** Cho lớp đoán kết quả trước khi chạy. Mở rộng: thử với dữ liệu `a b a`.

**Slide Lab (dựng cây thư mục; find và grep -r; tạo mini-access.log; lọc 5xx; checklist).**

- Dựng cây thư mục: khoảng 10 phút. `{a,b}` do bash mở rộng thành nhiều đối số, nên dùng `echo` thử trước nếu học viên thắc mắc.
- `find` và `grep -r`: khoảng 10 phút. Nhấn: `>` ghi đè, `>>` ghi nối. Cho học viên tự phá để nhớ lâu.
- Tạo `mini-access.log`: nếu slide quá dài khi chiếu, cho học viên copy từ bài lab. Đủ 10 dòng thì các con số ở phần demo mới khớp.
- Lọc 5xx: câu hỏi: vì sao không dùng `grep " 5"`? Gợi ý: dòng nào có " 512" ở cuối? Ví dụ trong log có byte là 512 sẽ bị khớp.
- Checklist: file thật `examples/linux/access.log` có 260 dòng, copy vào thư mục lab. Tiêu chí L2: pipeline khớp đếm tay trên file mini, không hard-code đường dẫn tuyệt đối.

**Slide Gặp lỗi (khoảng trắng chưa quote; tổng hợp).**

- Lệnh `rm -r club-site/docs/meeting notes` an toàn vì đối số sai nên `rm` không xóa gì. Thói quen: chạy `ls` hoặc `echo` với cùng đối số trước khi xóa, `pwd` trước `rm`.
- Bảng lỗi tổng hợp làm tài liệu tra cứu, không đọc từng dòng. Cho học viên chụp lại hoặc mở lại bài lab.

**Slide Challenge.** Không chạy lệnh `rm -rf logs /` trên máy thật, chỉ thảo luận. Nhấn thói quen `ls` trước khi xóa.

**Slide Recap.** Hỏi nhanh: vì sao phải `sort` trước `uniq -c`? `>` và `>>` khác nhau thế nào? Nhắc hạn nộp `lab-03/`.

## Lưu ý riêng cho người dạy

- Số liệu để đối chiếu trên `access.log` thật (260 dòng) nằm trong [Walkthrough tuần 2](../walkthroughs/week-02.md).
- Học viên mới có thể chưa có repo `devops-labs` vì buổi 01 chỉ cần tài khoản GitHub. Cho phép nộp bằng upload trên web hoặc theo mục "Git trong 10 phút" của [Bắt đầu từ đây](../../curriculum/getting-started.md).
- Tình huống thảo luận cuối bài: `rm -rf logs /` do gõ thừa dấu cách. Chỉ thảo luận, không chạy.
