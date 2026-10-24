# Kịch bản mentor – Buổi 15: CI/CD Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md). Slide: [Slide buổi 15](../../slides/04-cicd/session-15.md). Barem: [Chấm bài tuần 8](../grading/week-08.md). Đáp án: [Walkthrough tuần 8](../walkthroughs/week-08.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 15: khung thời gian, demo xem pipeline thật, câu hỏi cho lớp và ghi chú giảng viên theo từng slide.

## Khung thời gian buổi 120 phút

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

Gợi ý chia thời gian cho phần thực hành: chuẩn bị 5 phút, phần 1 và 2 mỗi phần 15 phút, phần 3 và 4 mỗi phần 12 phút. Nếu hết giờ, ưu tiên L1.

## Demo của mentor

Mục tiêu: cho lớp thấy một pipeline thực tế đang chạy trước khi tự thiết kế. Thời lượng khoảng 10 phút.

1. Mở repo giáo trình trên GitHub, vào tab Actions, chọn một lần chạy của workflow `CI` (file `.github/workflows/ci.yml`).
2. Chỉ vào phần trigger của file đó và hỏi lớp: "Những sự kiện nào làm workflow này chạy?" (Đáp án: push lên `main` hoặc `master`, và mọi pull request.)
3. Mở sơ đồ job của run: chỉ ra hai job `test` và `validate-compose` chạy song song. Hỏi: "Vì sao hai job này không cần chờ nhau?" (Chúng độc lập, không dùng output của nhau.)
4. Mở log của step `Run tests`, chỉ cho lớp thấy output của `npm test` giống hệt lệnh họ chạy trên máy, chỉ khác là chạy trên runner sạch.
5. Mở workflow `Publish images` (file `.github/workflows/publish.yml`). Hỏi: "Artifact của workflow này là gì và nằm ở đâu?" (Hai image `club-api` và `club-web` trên GHCR, gắn tag theo SHA hoặc tag Git.)
6. Làm một thí nghiệm nhỏ trên máy để thấy "máy tôi chạy được" chưa đủ:

```bash
cd ~/devops-labs/lab-15/source/starter-project/backend
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

Câu hỏi cho lớp: "Test pass trên máy mentor. Có đủ để kết luận bản này an toàn để deploy không? Thiếu gì?" Gợi ý đáp án: chưa chắc cùng phiên bản Node, chưa build image, chưa ai review, chưa có bản ghi lại ai chạy cái gì lúc nào.

## Câu hỏi mentor nên hỏi lớp

- Ai từng "push xong mới nhớ chưa chạy test"?
- Có bao nhiêu điểm "phụ thuộc vào con người" trong câu chuyện bạn A và bạn B? (Chạy test, build, đặt tag, gửi image, deploy.)
- Nhóm 4 người như CLB nên chọn Delivery hay Deployment? (Delivery, vì test còn mỏng.)
- Nếu build lại image cho từng môi trường thì điều gì mất? (Thứ chạy production không còn là thứ đã test.)
- Job build cần mã đã biên dịch từ job test, làm sao truyền? (Artifact hoặc registry.)
- Nếu không có gate "dừng khi fail" thì stage build đóng gói cái gì? (Mã đang hỏng.)
- Gate bị vô hiệu hóa nguy hiểm hơn không có gate vì sao? (Tạo cảm giác an toàn giả.)
- Pipeline xanh nhưng `/api/members` trả 500 sau deploy: kiểm tra theo thứ tự nào? (Test có phủ endpoint không, tag image có đúng commit không, biến môi trường và kết nối DB, log Pod hoặc container.)

## Ghi chú giảng viên theo slide

Slide 1 – Mục tiêu buổi học. Mở buổi (2 phút). Nhấn mạnh hôm nay chưa viết workflow thật, chỉ thiết kế và giả lập. Buổi 16 mới chuyển thành YAML. Hỏi lớp: ai từng "push xong mới nhớ chưa chạy test"?

Slide 2 – Vấn đề "máy tôi chạy được". Kể như một câu chuyện thật của CLB (3 phút). Câu hỏi cho lớp: có bao nhiêu điểm "phụ thuộc vào con người" trong câu chuyện? Gợi ý: chạy test, build, đặt tag, gửi image, deploy.

Slide 3 – Nguyên nhân chung. Chuyển ý (1 phút). Từ khóa: tự động, lặp lại được, có bằng chứng.

Slide 4 – Ba thuật ngữ dễ nhầm. 3 phút. Hỏi: nhóm 4 người như CLB nên chọn loại nào? Đáp án gợi ý: Continuous Delivery, vì test còn mỏng.

Slide 5 – Các thành phần của pipeline. 3 phút. Chỉ vào từng dòng và hỏi lớp tìm ví dụ ngoài bảng. Lưu ý artifact khác cache: cache chỉ để tăng tốc, mất thì pipeline vẫn đúng.

Slide 6 – Năm nguyên tắc thiết kế. 3 phút. Hỏi: nếu build lại image cho từng môi trường thì điều gì mất? Đáp: thứ chạy production không còn là thứ đã test.

Slide 7 – Kiến trúc pipeline mục tiêu. 3 phút. Đi theo mũi tên, hỏi tại mỗi stage: input là gì, output là gì, khi nào dừng?

Slide 8 – Job chạy trên runner riêng. 2 phút. Câu hỏi: job build cần mã đã biên dịch từ job test, làm sao truyền? Đáp: artifact hoặc registry.

Slide 9 – Demo 1: xem pipeline thật. 5 phút. Mở log step `Run tests` để lớp thấy output giống lệnh họ chạy trên máy, chỉ khác là trên runner sạch.

Slide 10 – Demo 2: test pass trên máy đã đủ chưa. 5 phút. Để lớp tự liệt kê trước khi đưa gợi ý. Nếu `npm ci` lỗi vì thiếu thư mục, nhắc chép `starter-project/` vào `source/` ở bước chuẩn bị.

Slide 11 – Lab: chuẩn bị và vẽ pipeline. Lab bắt đầu (5 phút chuẩn bị, 15 phút vẽ). Đi quanh lớp kiểm tra: mũi tên nào chưa ghi artifact chảy qua nó?

Slide 12 – Lab: đặc tả stage. 15 phút. Nhắc: không bao giờ ghi giá trị token thật vào file, chỉ ghi tên secret.

Slide 13 – Lab: chạy pipeline giả lập. Slide là bản rút gọn để vừa màn hình; học viên chép bản đầy đủ từ bài lab. Giải thích `set -euo pipefail`: lệnh nào trả mã khác 0 là dừng, giống runner CI.

Slide 14 – Chạy và lưu bằng chứng. 12 phút. Nếu máy chậm, cho học viên chạy song song với phần vẽ sơ đồ. Cảnh báo không làm việc trong `/mnt/c` vì rất chậm.

Slide 15 – Lab: kiểm chứng gate dừng khi fail. 12 phút. Nhấn mạnh việc sao lưu file trước khi phá. Hỏi: nếu không có gate này thì stage build đóng gói cái gì?

Slide 16 – Hai cấp độ lab. Nếu hết giờ, ưu tiên L1. Gợi ý cho L2: rollback đơn giản nhất là deploy lại tag cũ, chỉ làm được khi mọi image có tag bất biến.

Slide 17 – Debug: pipeline xanh nhưng bản deploy lỗi. 5 phút, nên cho học viên tự phá rồi tự điều tra. Câu hỏi: gate bị vô hiệu hóa nguy hiểm hơn không có gate vì sao? Đáp: tạo cảm giác an toàn giả.

Slide 18 – Lỗi thường gặp. 2 phút. Hỏi lớp: lỗi nào trong bảng đã gặp trong lab hôm nay?

Slide 19 – Thử thách. Giao về nhà hoặc thảo luận 5 phút cuối. Đáp án thứ tự kiểm tra: test có phủ endpoint không, tag image có đúng commit không, biến môi trường và kết nối DB, log Pod hoặc container.

Slide 20 – Recap. Review 15 phút cuối: mời 2 học viên trình bày pipeline của mình. Nhắc nộp `lab-15/` theo `templates/lab-template.md`, không commit secret hoặc `.env`.

## Lưu ý riêng cho người dạy

- Buổi này bỏ tiền đề Kubernetes: không cần cluster, chỉ cần Node 22 và Docker Desktop đang chạy. Khi nói về stage Deploy, chỉ nói "cập nhật môi trường chạy", không đào sâu.
- Script `run-pipeline.sh` đã được chạy thử: bản xanh in `PIPELINE OK`, bản test đỏ dừng trước stage build với `exit code: 1`, bản `|| true` vẫn in `PIPELINE OK`. Chi tiết xem [Walkthrough tuần 8](../walkthroughs/week-08.md).
- Hai lỗi học viên hay mắc ở phần 4: chỉ đổi tên test (test vẫn xanh) và lấy exit code bằng `$?` sau `tee` (luôn 0, phải dùng `PIPESTATUS[0]`).
- Lời giải tham khảo L2 (bảng môi trường, build một lần, hai gate) nằm trong walkthrough, mục "Lời giải L2" của Buổi 15; học viên đã được gợi ý bậc thang ngay trong bài, không dán đáp án vào trang học viên.
