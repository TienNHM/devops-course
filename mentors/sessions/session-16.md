# Kịch bản mentor – Buổi 16: GitHub Actions Basics

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 16 – GitHub Actions Basics](../../labs/week-08/session-16.md). Slide: [Slide buổi 16](../../slides/04-cicd/session-16.md). Barem: [Chấm bài tuần 8](../grading/week-08.md). Đáp án: [Walkthrough tuần 8](../walkthroughs/week-08.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 16: khung thời gian, demo từ repo trống tới check xanh, câu hỏi cho lớp và ghi chú giảng viên theo từng slide.

## Khung thời gian buổi 120 phút

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Thời lượng thực hành 60 phút: chuẩn bị 5', Phần 1 và 2 khoảng 25', Phần 3 và 4 khoảng 20', L2 phần còn lại. Nếu hết giờ, ưu tiên hoàn thành L1.

Trước buổi: kiểm tra từng học viên đã có tài khoản GitHub, đã tạo repo `devops-labs` ở chế độ public và `git push` được. Chuẩn bị sẵn một repo demo có workflow chạy sẵn để khỏi chờ runner.

## Demo của mentor

Mục tiêu demo (khoảng 10 phút): đi từ repo trống tới check xanh, rồi cố ý làm đỏ.

1. Mở repo demo trên GitHub, vào tab Actions: chỉ ra rằng chưa có workflow nào. Hỏi lớp: "Theo bạn GitHub biết chạy gì bằng cách nào?" (đáp: tìm file YAML trong `.github/workflows/`).
2. Tạo file tối thiểu và push:

```yaml
name: CI
on: push
jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello from $GITHUB_REPOSITORY on $RUNNER_OS"
```

3. Mở run vừa chạy, bung step `Run echo`. Kết quả mong đợi: log in ra tên repo và `Linux`. Hỏi lớp: "Source code của chúng ta có trên runner không?" (đáp: chưa, vì chưa có checkout). Thêm `ls` sau echo để chứng minh thư mục trống.
4. Thêm `actions/checkout@v4`, chạy lại, thấy `ls` có file. Giải thích `uses` khác `run`.
5. Thay bằng CI thật (xem Phần 2 của lab), đẩy lên, chỉ ra thời gian chạy và dòng "Cache restored" ở lần chạy thứ hai.
6. Cố ý sửa `working-directory` sai, push, cho lớp đọc log. Hỏi: "Dòng nào trong log cho biết nguyên nhân?" Sau đó sửa lại.

## Câu hỏi mentor nên hỏi lớp

Vì sao cần checkout; vì sao job fail khi `npm test` trả exit code 1; cache khác artifact ở điểm nào.

Câu hỏi bổ sung theo slide: job chạy song song hay tuần tự theo mặc định (song song; step trong job thì tuần tự); vì sao đặt quyền tối thiểu (nếu một action bên thứ ba bị lợi dụng thì token không ghi được vào repo); khác biệt `npm install` và `npm ci` (ci xóa `node_modules`, không sửa lock file, tái lập được); dòng nào trong log cho biết nguyên nhân khi `working-directory` sai.

## Ghi chú giảng viên theo slide

Slide 1 – Mục tiêu buổi học. 2 phút. Nhắc buổi 15 đã thiết kế pipeline, hôm nay biến nó thành YAML chạy thật. Kiểm tra ai đã có repo `devops-labs` và `git push` được.

Slide 2 – Vấn đề: quên chạy test. 2 phút. Nhấn mạnh máy sạch còn lộ ra lỗi "chạy được trên máy tôi": thiếu file chưa commit, khác phiên bản Node.

Slide 3 – Năm khái niệm nền tảng. 3 phút. Hỏi: job chạy song song hay tuần tự theo mặc định? (Song song; step trong job thì tuần tự.)

Slide 4 – YAML cần nhớ. 2 phút. Khuyến nghị dùng editor có kiểm tra YAML, thụt lề 2 dấu cách.

Slide 5 – Events thường dùng. 2 phút. Lưu ý nút Run workflow chỉ xuất hiện khi file đã nằm trên nhánh mặc định.

Slide 6 – Runner, action và quyền tối thiểu. 3 phút. Hỏi: vì sao đặt quyền tối thiểu? Đáp: nếu một action bên thứ ba bị lợi dụng thì token không ghi được vào repo.

Slide 7 – Kiến trúc: từ push đến check xanh. 2 phút. Đi qua từng khối. Hỏi: nếu không có checkout thì runner có mã nguồn không? (Không.)

Slide 8 – Cách hoạt động. 3 phút. Câu hỏi: khác biệt `npm install` và `npm ci`? Đáp: ci xóa `node_modules`, không sửa lock file, tái lập được.

Slide 9 – Demo 1: workflow tối thiểu. 5 phút. Hỏi trước khi chạy: source code của chúng ta có trên runner chưa? Để lớp dự đoán rồi mới thêm `ls`.

Slide 10 – Demo 2: cache và lỗi đường dẫn. 5 phút. Chuẩn bị trước repo demo có workflow chạy sẵn để không mất thời gian chờ runner. Dạy thói quen đọc dòng lỗi đầu tiên, không đọc từ cuối.

Slide 11 – Lab: chuẩn bị source. 5 phút. Đường dẫn `~/devops-course` là nơi clone giáo trình theo quy ước, học viên thay nếu đã clone chỗ khác. Nhắc làm trong WSL, không dùng `/mnt/c`.

Slide 12 – Lab: chạy test ở local trước. 3 phút. Nếu `npm ci` lỗi, kiểm tra học viên đã copy cả `package-lock.json` chưa.

Slide 13 – Lab: workflow hello và CI (L1). Đoạn trên slide là bản rút gọn của `ci.yml` trong bài lab (đã bỏ `name` của từng step). Bước trước đó học viên tạo `hello.yml` với `workflow_dispatch` để thấy runner là máy trống. Dành 25 phút cho phần này.

Slide 14 – Đẩy lên và quan sát. Cho lớp 5 phút chờ run và đọc log. Hỏi: vì sao cần `working-directory`? Đáp: `package.json` nằm ở `lab-16/source`, không phải gốc repo.

Slide 15 – Cache và matrix. 8 phút. Bấm Re-run all jobs để thấy log khôi phục cache. Với dự án nhỏ, chênh lệch thời gian chỉ vài giây, điều quan trọng là thấy cache hoạt động. Node 22 là mục tiêu của backend, 24 chỉ để học matrix.

Slide 16 – Hai cấp độ lab. Nếu hết giờ, ưu tiên hoàn thành L1. Đi quanh lớp, hỏi học viên L2 mở log nào để chứng minh nguyên nhân.

Slide 17 – Debug Tình huống 06. 8 phút. Học viên chỉ nhận triệu chứng trước, tự tìm. Kết luận: luôn commit `package-lock.json`, dùng `defaults.run.working-directory` để khỏi lặp đường dẫn, kiểm tra bằng clone sạch trước khi đổ lỗi cho CI.

Slide 18 – Lỗi thường gặp. 2 phút. Hỏi lớp: lỗi nào đã gặp trong buổi hôm nay?

Slide 19 – Thử thách. Bài thêm cho nhóm xong sớm. Thảo luận: so sánh với pipeline đã thiết kế ở buổi 15, còn thiếu stage nào?

Slide 20 – Recap. Review 15 phút cuối: cho 2 học viên chia sẻ màn hình run xanh và run đỏ. Nhắc nộp `lab-16/` kèm link run, không commit secret.

## Lưu ý riêng cho người dạy

- Phần GitHub Actions chạy trên hạ tầng của GitHub nên walkthrough dựa trên cú pháp và hành vi đã được tài liệu hóa; thông báo log chính xác có thể khác theo phiên bản action.
- Repo `devops-labs` của học viên phải để public (miễn phí cho Actions và GHCR về sau). Học viên lỡ tạo private vẫn chạy được workflow nhưng dễ hết hạn mức phút miễn phí.
- Bài dùng Node 22 và 24 cho matrix (cả hai đang được hỗ trợ; Node 20 đã hết vòng đời hỗ trợ từ 2026-04). Backend của starter-project nhắm Node 22.
- Ví dụ tham khảo trong repo: `examples/github-actions/ci-basic.yml` và `examples/github-actions/ci-matrix.yml` (khác cấu trúc thư mục và danh sách phiên bản Node với bài này).
- Tình huống 06 có tài nguyên ở `examples/troubleshooting/scenario-06/`, workflow trong đó có nhiều lỗi nối tiếp; nhắc học viên đọc lại log sau mỗi lần sửa.
- Lời giải L2 (workflow đầy đủ có matrix, `needs`, `build-image`) nằm trong [Walkthrough tuần 8](../walkthroughs/week-08.md).
