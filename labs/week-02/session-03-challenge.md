# Buổi 03 – Thử thách thêm (L2)

[Quay lại Buổi 03 – Linux CLI](session-03.md) · [Hub tuần](README.md)

> **Tóm tắt:** Thử thách tùy chọn của Buổi 03: top IP, phân bố mã HTTP, top endpoint lỗi và script log-report.sh, kèm gợi ý và phá lỗi nâng cao.

::: tip Dùng khi nào
Chỉ làm sau khi đã xong checklist L1 của [Buổi 03 – Linux CLI](session-03.md). Làm ở nhà, không bắt buộc.
:::

## Bài luyện đường dẫn

Làm sau Phần 1 của bài lab, không bắt buộc.

**Bài luyện đường dẫn (từ Phần 1).** Di chuyển bằng đường tương đối và tuyệt đối:

```bash
cd club-site/src
pwd
cd ../config
pwd
cd ~/devops-labs/lab-03/source/club-site
pwd
cd -
```

Kết quả mong đợi: lần lượt `.../club-site/src`, `.../club-site/config`, `.../club-site`, và `cd -` in ra thư mục trước đó (`.../club-site/config`). `..` là thư mục cha, `cd -` quay lại thư mục trước.

## Thử thách thêm (L2)
Làm trên `source/access.log` (file thật). Mỗi thử thách cần một lệnh một dòng (pipeline) và một câu giải thích vì sao pipeline đúng. Thời gian gợi ý: thử thách 1 đến 3 khoảng 8 phút, thử thách 4 khoảng 7 phút.

1. **Top 5 IP.** In ra 5 IP gửi nhiều request nhất kèm số lần.
2. **Phân bố mã HTTP.** Thống kê số lượng mỗi mã trạng thái, giảm dần.
3. **Top 3 endpoint bị lỗi.** Chỉ xét dòng có mã 4xx hoặc 5xx, in 3 đường dẫn xuất hiện nhiều nhất.
4. **Tự viết script.** Tạo `source/log-report.sh` nhận đường dẫn file log làm tham số, in ba báo cáo trên, và thoát với thông báo rõ ràng nếu thiếu tham số hoặc file không tồn tại.

Tiêu chí hoàn thành: pipeline 1 đến 3 chạy trên `mini-access.log` cho kết quả khớp đếm tay (ví dụ `/api/members` lỗi 2 lần); script chạy được với cả hai file; không hard-code đường dẫn tuyệt đối; có kiểm tra tham số đầu vào.

::: warning Tự thử 15 phút trước khi mở gợi ý
Mở gợi ý quá sớm làm bạn mất cơ hội luyện cách nghĩ. Đáp án đầy đủ dành cho mentor, xem phần đối chiếu sau khi nộp bài trong [Hub tuần](README.md).
:::

<details>
<summary>Gợi ý bậc 1: hướng đi</summary>

- Top 5: thêm `head -n 5` vào cuối pipeline ở Bước 3.3.
- Endpoint lỗi: dùng `awk '$9 >= 400 {print $7}'`; awk so sánh số khi cột trông giống số.

</details>

<details>
<summary>Gợi ý bậc 2: script</summary>

- `$1` là tham số đầu tiên, `[ -z "$1" ]` kiểm tra rỗng, `[ -f "$1" ]` kiểm tra file tồn tại, luôn bao quanh biến bằng dấu nháy kép.
- Nhớ cấp quyền chạy bằng `chmod +x log-report.sh` hoặc chạy bằng `bash log-report.sh`.

</details>

## Phá lỗi nâng cao


::: details Phá lỗi nâng cao
Tình huống: pipeline cho kết quả sai nhưng không báo lỗi. Chạy `awk '{print $9}' mini-access.log | uniq -c` (thiếu `sort`), rồi `awk '{print $9}' mini-access.log` để xem dữ liệu thô: các giá trị giống nhau không nằm liền kề. Phòng tránh: luôn `sort` trước `uniq -c` và so tổng với `wc -l`.

Tình huống khác: bạn gõ thừa dấu cách thành `rm -rf logs /` thay vì `rm -rf logs/`. Chỉ thảo luận, không chạy: hệ thống hiện đại có `--preserve-root` nhưng không nên dựa vào nó. Thói quen: chạy `ls` với cùng đối số trước, dùng `rm -r` không `-f` khi cần xác nhận, `pwd` trước khi xóa. Thêm một tình huống: đồng đội nói `grep ERROR app.log` không ra gì nhưng chắc có lỗi. Kiểm tra: thử `grep -i`, đúng file và thư mục (`pwd`, `ls`), file có rỗng không (`wc -l`), log có nằm ở stderr hoặc file khác không, và thử `grep -r ERROR .` trong thư mục log.
