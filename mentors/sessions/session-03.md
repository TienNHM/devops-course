# Kịch bản Buổi 03 – Linux CLI

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 03 – Linux CLI](../../labs/week-02/session-03.md). Slide: [Slide buổi 03 – Linux CLI](../../slides/01-foundation/session-03.md). Hướng dẫn chấm: [Hướng dẫn chấm Tuần 2](../grading/week-02.md). Đáp án: [Đáp án Tuần 2](../walkthroughs/week-02.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 03: khung thời gian, demo điều hướng, pipe và phá lỗi quote, câu hỏi cho lớp và ghi chú theo từng slide (14 slide).

Tuần 2/16 · Giai đoạn 1 – Engineering Foundation · Buổi 03/32

## Khung thời gian

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

Phân bổ 60 phút lab: Chuẩn bị 5', Phần 1 (cây thư mục) 10', Phần 2 (`find`, `grep`) 10', Phần 3 (phân tích access log) 25', ghi evidence và checklist 10'. Thử thách L2 (top 5 IP, phân bố mã HTTP, top 3 endpoint lỗi, script `log-report.sh`) là bài làm ở nhà trên [Buổi 03 – Thử thách thêm](../../labs/week-02/session-03-challenge.md); gợi ý thời gian là 8 phút cho thử thách 1 đến 3 và 7 phút cho thử thách 4.

## Lưu ý cho người dạy

- Số liệu đối chiếu trên `access.log` thật (260 dòng) nằm trong [Đáp án Tuần 2](../walkthroughs/week-02.md).
- Học viên mới có thể chưa có repo `devops-labs` vì Buổi 01 chỉ cần tài khoản GitHub. Cho phép nộp bằng upload trên web hoặc theo mục [Git trong 10 phút](../../curriculum/how-to-learn.md#git-10-phut); push và Pull Request thành thạo từ Buổi 06.
- File thật `examples/linux/access.log` nằm trong repo giáo trình clone ở `~/devops-course`. Nếu `cp` báo không tìm thấy file, hướng dẫn học viên dùng lệnh `find` trong bảng "Gặp lỗi?" của bài lab.
- Tình huống thảo luận cuối bài: `rm -rf logs /` do gõ thừa dấu cách. Chỉ thảo luận, không chạy trên máy thật.

## Kịch bản demo

Mentor thực hiện trên màn hình chiếu, học viên gõ theo. Thời lượng khoảng 10 phút trong phần 30 phút kiến thức, ứng với slide 9 và 10.

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

Câu hỏi cho lớp: "Vì sao `uniq -c` cho kết quả sai nếu bỏ qua `sort` trước nó?" (Gợi ý: thử với dữ liệu `a b a`.)

**Bước 4. Phá thử cố ý.**

```bash
cd ~/demo
mkdir "my folder"
cd my folder
```

Kết quả mong đợi: lỗi `bash: cd: too many arguments`. Giải thích bằng quote: `cd "my folder"`. Chuyển sang bảng "Gặp lỗi?" trong bài lab để học viên tự điều tra.

**Dọn dẹp demo:**

```bash
cd ~ && rm -r ~/demo
```

## Câu hỏi cho lớp

- Nếu tôi gõ `cd /` rồi `ls`, bạn nghĩ sẽ thấy gì? Ổ `C:` nằm ở đâu? (Bước 1)
- Vì sao `uniq -c` cho kết quả sai nếu bỏ qua `sort` trước nó? (Bước 3; dữ liệu `a b a`)
- Nếu là bạn, bạn bắt đầu từ đâu để tìm IP gọi nhiều nhất trong log vài chục nghìn dòng?
- Tìm file thì dùng gì, tìm chữ trong file thì dùng gì?
- Vì sao không dùng `grep " 5"` để đếm lỗi 5xx? (Gợi ý: dòng nào có `512` ở cuối? Log có số byte là 512 sẽ bị khớp nhầm.)
- Lỗi nào trong bảng "Gặp lỗi?" bạn đã gặp rồi?
- Hỏi nhanh cuối buổi: vì sao phải `sort` trước `uniq -c`? `>` và `>>` khác nhau thế nào?

## Ghi chú theo slide

Số slide theo [Slide buổi 03 – Linux CLI](../../slides/01-foundation/session-03.md) (14 slide).

**Slide 1 – Mục tiêu buổi học.** 2 phút. Kiểm tra nhanh `cd ~ && pwd` ra đường dẫn dạng `/home/...`; nếu ra `/mnt/c` thì nhắc học viên `cd ~`.

**Slide 2 – Vấn đề: web chậm trước giờ demo.** Hỏi lớp: nếu là bạn, bạn bắt đầu từ đâu? Sau này `docker logs` và `kubectl logs` đều dùng đúng kỹ năng này.

**Slide 3 – Cây thư mục Linux.** Câu hỏi: gõ `cd /` rồi `ls` thấy gì? Ổ C nằm ở đâu? Phân biệt đường dẫn tuyệt đối (bắt đầu bằng `/` hoặc `~`) và tương đối (tính từ chỗ đang đứng). Học viên muốn luyện thêm thì dùng bài luyện đường dẫn ở trang thử thách (`cd club-site/src`, `cd ../config`, `cd -`).

**Slide 4 – Lệnh điều hướng và đọc file.** Dạy theo thói quen: trước mọi lệnh nguy hiểm, chạy `pwd` và `ls`. `less`: gõ `/chuoi` để tìm, `q` để thoát.

**Slide 5 – `find` tìm file, `grep` tìm dòng.** Câu hỏi nhanh: tìm file thì dùng gì, tìm chữ trong file dùng gì? Luôn đặt mẫu có ký tự đặc biệt như `*` trong nháy kép.

**Slide 6 – Pipe và redirect.** Giải thích vì sao `wc -l sample.txt` in tên file còn khi đọc từ stdin thì không: `wc` không biết tên file. Nhắc `>` dễ mất dữ liệu.

**Slide 7 – Định dạng access log.** Cho học viên tự đếm cột trên dòng mẫu trong 1 phút. Cột 4 là thời gian có dấu `[`, cột 6 là phương thức có dấu `"`. File thật có thêm referer và user-agent nhưng cột 1, 7, 9 giữ nguyên ý nghĩa.

**Slide 8 – Kiến trúc pipeline phân tích log.** Mỗi lệnh là một process riêng, dữ liệu chảy theo khối nên xử lý được file rất lớn. `grep` là bước tùy chọn. Câu hỏi: vì sao `uniq` cần `sort` trước? Để dành câu trả lời cho slide 10, cho lớp đoán trước.

**Slide 9 – Demo: đếm request theo IP.** Chạy từng đoạn: chỉ `awk`, rồi thêm `sort`, rồi `uniq -c`. Kiểm tra tổng 4+3+3 bằng `wc -l` ra 10.

**Slide 10 – Demo: quên `sort` thì sao.** Cho lớp đoán kết quả trước khi chạy. Mở rộng: thử với dữ liệu `a b a`.

**Slide 11 – Lab: bạn sẽ làm gì.**

- Phần 1 (khoảng 10 phút): dựng cây `club-site`. `{a,b}` do bash mở rộng thành nhiều đối số, dùng `echo` thử trước nếu học viên thắc mắc.
- Phần 2 (khoảng 10 phút): `find` và `grep -r`. Nhấn: `>` ghi đè, `>>` ghi nối. Cho học viên tự phá để nhớ lâu.
- Phần 3 (khoảng 25 phút): tạo `mini-access.log` (nếu slide quá dài khi chiếu, cho học viên copy từ bài lab). Đủ 10 dòng thì các con số ở slide 9 mới khớp. Lọc 5xx: hỏi vì sao không dùng `grep " 5"`. Cuối phần chạy trên file thật `access.log` 260 dòng bằng `less`.
- L2 ở nhà: tiêu chí là pipeline khớp đếm tay trên file mini và không hard-code đường dẫn tuyệt đối.

**Slide 12 – Lỗi thường gặp: khoảng trắng chưa quote.**

- Lệnh `rm -r club-site/docs/meeting notes` an toàn vì đối số sai nên `rm` không xóa gì. Thói quen: chạy `ls` hoặc `echo` với cùng đối số trước khi xóa, `pwd` trước `rm`.
- Bảng lỗi làm tài liệu tra cứu, không đọc từng dòng. Cho học viên chụp lại hoặc mở lại bài lab.

**Slide 13 – Challenge.** Không chạy lệnh `rm -rf logs /` trên máy thật, chỉ thảo luận. Nhấn thói quen `ls` trước khi xóa.

**Slide 14 – Recap.** Hỏi nhanh: vì sao phải `sort` trước `uniq -c`? `>` và `>>` khác nhau thế nào? Nhắc hạn nộp `lab-03/`.
