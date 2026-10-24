# Kịch bản buổi 15: CI/CD Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md). Slide: [Slide buổi 15](../../slides/04-cicd/session-15.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 8](../grading/week-08.md). Đáp án: [Đáp án tuần 8](../walkthroughs/week-08.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 15 trong 120 phút: khung thời gian, demo xem pipeline thật, câu hỏi cho lớp và ghi chú theo 14 slide.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập Buổi 14 | Healthcheck, restart, backup |
| 30 | Kiến thức và demo: Slide 1 đến 10 | Buổi đầu của tuần dành nhiều thời gian cho khái niệm và demo |
| 60 | Thực hành: lab L1, Slide 11 đến 13 | Chuẩn bị 5', Phần 1 15', Phần 2 15', Phần 3 12', Phần 4 12'; nếu hết giờ, ưu tiên L1 |
| 15 | Review: Slide 14 | Mời 2 học viên trình bày pipeline của mình |

Buổi này không cần Kubernetes: chỉ cần Node 22 và Docker Desktop đang chạy. Khi nói về stage Deploy, chỉ nói "cập nhật môi trường chạy", không đào sâu.

## Kịch bản demo (Slide 9 và 10)

Mục tiêu: cho lớp thấy một pipeline thực tế đang chạy trước khi tự thiết kế. Thời lượng khoảng 10 phút.

1. Mở repo giáo trình trên GitHub, vào tab Actions, chọn một lần chạy của workflow `CI` (file `.github/workflows/ci.yml`).
2. Chỉ vào phần trigger của file đó và hỏi lớp: "Những sự kiện nào làm workflow này chạy?" Đáp: push lên `main` hoặc `master`, và mọi pull request.
3. Mở sơ đồ job của run: chỉ ra hai job `test` và `validate-compose` chạy song song. Hỏi: "Vì sao hai job này không cần chờ nhau?" Đáp: chúng độc lập, không dùng output của nhau.
4. Mở log của step `Run tests`, chỉ cho lớp thấy output của `npm test` giống hệt lệnh họ chạy trên máy, chỉ khác là chạy trên runner sạch.
5. Mở workflow `Publish images` (file `.github/workflows/publish.yml`). Hỏi: "Artifact của workflow này là gì và nằm ở đâu?" Đáp: hai image `club-api` và `club-web` trên GHCR, gắn tag theo SHA hoặc tag Git.
6. Làm một thí nghiệm nhỏ trên máy để thấy "máy tôi chạy được" chưa đủ (Slide 10):

```bash
cp -r ~/devops-course/starter-project ~/demo-15 && cd ~/demo-15/backend
npm ci
npm test
```

Kết quả mong đợi (rút gọn, số test có thể khác):

```text
added NN packages
...
# tests 1
# pass 1
# fail 0
```

Câu hỏi cho lớp: "Test pass trên máy mentor. Có đủ để kết luận bản này an toàn để deploy không? Thiếu gì?" Gợi ý đáp án: chưa chắc cùng phiên bản Node, chưa build image, chưa ai review, chưa có bản ghi lại ai chạy cái gì lúc nào. Để lớp tự liệt kê trước khi đưa gợi ý.

## Câu hỏi cho lớp

- Ai từng "push xong mới nhớ chưa chạy test"? (Slide 1)
- Có bao nhiêu điểm "phụ thuộc vào con người" trong câu chuyện bạn A và bạn B? Đáp: chạy test, build, đặt tag, gửi image, deploy. (Slide 2)
- Nhóm 4 người như CLB nên chọn Delivery hay Deployment? Đáp: Delivery, vì test còn mỏng. (Slide 4)
- Nếu build lại image cho từng môi trường thì điều gì mất? Đáp: thứ chạy production không còn là thứ đã test. (Slide 6)
- Job build cần mã đã biên dịch từ job test, làm sao truyền? Đáp: artifact hoặc registry. (Slide 8)
- Nếu không có gate "dừng khi fail" thì stage build đóng gói cái gì? Đáp: mã đang hỏng. (Lab Phần 4)
- Gate bị vô hiệu hóa nguy hiểm hơn không có gate vì sao? Đáp: tạo cảm giác an toàn giả. (Slide 12)
- Pipeline xanh nhưng `/api/members` trả 500 sau deploy: kiểm tra theo thứ tự nào? Đáp: test có phủ endpoint không, tag image có đúng commit không, biến môi trường và kết nối DB, log container.

## Ghi chú theo slide

Slide buổi 15 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Nhấn mạnh hôm nay chưa viết workflow thật, chỉ thiết kế và giả lập; Buổi 16 mới chuyển thành YAML. Hỏi lớp: ai từng "push xong mới nhớ chưa chạy test"?
2. **Vấn đề "máy tôi chạy được" (3 phút).** Kể như một câu chuyện thật của CLB. Hỏi lớp đếm các điểm "phụ thuộc vào con người".
3. **Nguyên nhân chung (1 phút).** Chuyển ý. Từ khóa: tự động, lặp lại được, có bằng chứng.
4. **Ba thuật ngữ dễ nhầm (3 phút).** Hỏi: nhóm 4 người như CLB nên chọn loại nào? Đáp gợi ý: Continuous Delivery, vì test còn mỏng.
5. **Các thành phần của pipeline (3 phút).** Chỉ vào từng dòng và hỏi lớp tìm ví dụ ngoài bảng. Lưu ý artifact khác cache: cache chỉ để tăng tốc, mất thì pipeline vẫn đúng.
6. **Năm nguyên tắc thiết kế (3 phút).** Hỏi: nếu build lại image cho từng môi trường thì điều gì mất?
7. **Kiến trúc pipeline mục tiêu (3 phút).** Đi theo mũi tên, hỏi tại mỗi stage: input là gì, output là gì, khi nào dừng?
8. **Job chạy trên runner riêng (2 phút).** Hỏi: job build cần mã đã biên dịch từ job test, làm sao truyền?
9. **Demo 1: xem pipeline thật (5 phút).** Bước 1 đến 5 của demo. Mở log step `Run tests` để lớp thấy output giống lệnh họ chạy trên máy.
10. **Demo 2: test pass trên máy đã đủ chưa (5 phút).** Bước 6 của demo. Để lớp tự liệt kê trước khi đưa gợi ý.
11. **Lab: bốn phần trong 60 phút (5 phút giới thiệu).** Điểm cần nhấn ở từng phần:
    - Chuẩn bị: nếu `npm ci` lỗi vì thiếu thư mục, nhắc chép `starter-project/` vào `source/`. Không làm việc trong `/mnt/c` vì rất chậm.
    - Phần 1 (vẽ pipeline): đi quanh lớp kiểm tra mũi tên nào chưa ghi artifact chảy qua nó.
    - Phần 2 (đặc tả stage): nhắc không bao giờ ghi giá trị token thật vào file, chỉ ghi tên secret.
    - Phần 3 (chạy `run-pipeline.sh`): giải thích `set -euo pipefail`: lệnh nào trả mã khác 0 là dừng, giống runner CI. Nếu máy chậm, cho học viên chạy song song với phần vẽ sơ đồ.
    - Phần 4 (gate dừng khi fail): nhấn mạnh việc sao lưu file trước khi phá. Hỏi: nếu không có gate này thì stage build đóng gói cái gì?
    - L2 (làm ở nhà): rollback đơn giản nhất là deploy lại tag cũ, chỉ làm được khi mọi image có tag bất biến.
12. **Debug: pipeline xanh nhưng bản deploy lỗi (5 phút).** Nên cho học viên tự phá rồi tự điều tra. Câu hỏi: gate bị vô hiệu hóa nguy hiểm hơn không có gate vì sao? Đáp: tạo cảm giác an toàn giả.
13. **Lỗi thường gặp và thử thách (2 phút).** Hỏi lớp: lỗi nào trong bảng đã gặp trong lab hôm nay? Thử thách L2 giao về nhà hoặc thảo luận 5 phút cuối.
14. **Recap (khoảng 15 phút review).** Mời 2 học viên trình bày pipeline của mình. Nhắc nộp `lab-15/` theo mẫu lab, không commit secret hoặc `.env`.

## Lưu ý riêng cho người dạy

- Script `run-pipeline.sh` đã được chạy thử: bản xanh in `PIPELINE OK`, bản test đỏ dừng trước stage build với `exit code: 1`, bản `|| true` vẫn in `PIPELINE OK`. Chi tiết ở [Đáp án tuần 8](../walkthroughs/week-08.md).
- Hai lỗi học viên hay mắc ở Phần 4: chỉ đổi tên test (test vẫn xanh) và lấy exit code bằng `$?` sau `tee` (luôn 0, phải dùng `PIPESTATUS[0]`).
- Lời giải tham khảo L2 (bảng môi trường, build một lần, hai gate) nằm trong đáp án, mục "Lời giải L2" của Buổi 15; học viên đã được gợi ý bậc thang ngay trong bài, không dán đáp án vào trang học viên.
