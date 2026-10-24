# Kịch bản buổi 16: GitHub Actions Basics

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 16 – GitHub Actions Basics](../../labs/week-08/session-16.md). Slide: [Slide buổi 16](../../slides/04-cicd/session-16.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 8](../grading/week-08.md). Đáp án: [Đáp án tuần 8](../walkthroughs/week-08.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 16 trong 120 phút: khung thời gian, demo từ repo trống tới check xanh rồi cố ý làm đỏ, câu hỏi cho lớp và ghi chú theo 14 slide.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động | Ghi chú |
| --- | --- | --- |
| 15 | Ôn tập Buổi 15 | Pipeline đã thiết kế, gate, build once |
| 30 | Kiến thức và demo: Slide 1 đến 10 | Buổi thứ hai của tuần dồn vào thực hành, nên giữ phần này gọn |
| 60 | Thực hành: lab L1, Slide 11 đến 13 | Chuẩn bị 5', Phần 1 10', Phần 2 15', Phần 3 12', Phần 4 18'; nếu hết giờ, ưu tiên hoàn thành L1 |
| 15 | Review: Slide 14 | Cho 2 học viên chia sẻ màn hình run xanh và run đỏ |

Trước buổi: kiểm tra từng học viên đã có tài khoản GitHub, đã tạo repo `devops-labs` ở chế độ public và `git push` được. Chuẩn bị sẵn một repo demo có workflow chạy sẵn để khỏi chờ runner.

## Kịch bản demo (Slide 9 và 10)

Mục tiêu demo (khoảng 10 phút): đi từ repo trống tới check xanh, rồi cố ý làm đỏ.

1. Mở repo demo trên GitHub, vào tab Actions: chỉ ra rằng chưa có workflow nào. Hỏi lớp: "Theo bạn GitHub biết chạy gì bằng cách nào?" Đáp: tìm file YAML trong `.github/workflows/`.
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

3. Mở run vừa chạy, bung step `Run echo`. Kết quả mong đợi: log in ra tên repo và `Linux`. Hỏi lớp: "Source code của chúng ta có trên runner không?" Đáp: chưa, vì chưa có checkout. Thêm `ls` sau echo để chứng minh thư mục trống.
4. Thêm `actions/checkout@v4`, chạy lại, thấy `ls` có file. Giải thích `uses` khác `run`.
5. Thay bằng CI thật (xem Phần 2 của lab), đẩy lên, chỉ ra thời gian chạy và dòng "Cache restored" ở lần chạy thứ hai.
6. Cố ý sửa `working-directory` sai, push, cho lớp đọc log. Hỏi: "Dòng nào trong log cho biết nguyên nhân?" Sau đó sửa lại.

## Câu hỏi cho lớp

- Vì sao cần checkout? Vì sao job fail khi `npm test` trả exit code 1? Cache khác artifact ở điểm nào?
- Job chạy song song hay tuần tự theo mặc định? Đáp: song song; step trong job thì tuần tự. (Slide 3)
- Vì sao đặt quyền tối thiểu? Đáp: nếu một action bên thứ ba bị lợi dụng thì token không ghi được vào repo. (Slide 6)
- Khác biệt `npm install` và `npm ci`? Đáp: `ci` xóa `node_modules`, không sửa lock file, tái lập được. (Slide 8)
- Dòng nào trong log cho biết nguyên nhân khi `working-directory` sai? (Slide 10 và 13)

## Ghi chú theo slide

Slide buổi 16 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Nhắc Buổi 15 đã thiết kế pipeline, hôm nay biến nó thành YAML chạy thật. Kiểm tra ai đã có repo `devops-labs` và `git push` được.
2. **Vấn đề: quên chạy test (2 phút).** Nhấn mạnh máy sạch còn lộ ra lỗi "chạy được trên máy tôi": thiếu file chưa commit, khác phiên bản Node.
3. **Năm khái niệm nền tảng (3 phút).** Hỏi: job chạy song song hay tuần tự theo mặc định?
4. **YAML cần nhớ (2 phút).** Khuyến nghị dùng editor có kiểm tra YAML, thụt lề 2 dấu cách, không dùng tab.
5. **Events thường dùng (2 phút).** Lưu ý nút Run workflow chỉ xuất hiện khi file đã nằm trên nhánh mặc định.
6. **Runner, action và quyền tối thiểu (3 phút).** Hỏi: vì sao đặt quyền tối thiểu?
7. **Kiến trúc: từ push đến check xanh (2 phút).** Đi qua từng khối. Hỏi: nếu không có checkout thì runner có mã nguồn không? (Không.)
8. **Cách hoạt động (3 phút).** Câu hỏi: khác biệt `npm install` và `npm ci`?
9. **Demo 1: workflow tối thiểu (5 phút).** Bước 1 đến 4 của demo. Hỏi trước khi chạy: source code của chúng ta có trên runner chưa? Để lớp dự đoán rồi mới thêm `ls`.
10. **Demo 2: cache và lỗi đường dẫn (5 phút).** Bước 5 và 6 của demo. Chuẩn bị trước repo demo có workflow chạy sẵn để không mất thời gian chờ runner. Dạy thói quen đọc dòng lỗi đầu tiên, không đọc từ cuối.
11. **Lab: bốn phần trong 60 phút (5 phút giới thiệu).** Điểm cần nhấn ở từng phần:
    - Chuẩn bị: đường dẫn `~/devops-course` là nơi clone giáo trình theo quy ước, học viên thay nếu đã clone chỗ khác. Làm trong WSL, không dùng `/mnt/c`. Chạy test ở local trước; nếu `npm ci` lỗi, kiểm tra học viên đã copy cả `package-lock.json` chưa.
    - Phần 1: `hello.yml` với `workflow_dispatch` để thấy runner là máy trống.
    - Phần 2 (L1): đoạn trên slide là bản rút gọn của `ci.yml` trong bài lab (đã bỏ `name` của từng step). Hỏi: vì sao cần `working-directory`? Đáp: `package.json` nằm ở `lab-16/source`, không phải gốc repo. Cho lớp 5 phút chờ run và đọc log.
    - Phần 3: bật cache; bấm Re-run all jobs để thấy log khôi phục cache. Với dự án nhỏ, chênh lệch thời gian chỉ vài giây, điều quan trọng là thấy cache hoạt động.
    - Phần 4: tách job `validate` chạy song song.
    - L2 (ở nhà): đi quanh lớp, hỏi học viên mở log nào để chứng minh nguyên nhân.
12. **Cache và matrix (8 phút).** Cache key tính từ hash của lock file. Matrix tạo `test (22)` và `test (24)`; Node 22 là mục tiêu của backend, 24 chỉ để học matrix.
13. **Debug tình huống 06 và lỗi thường gặp (8 phút).** Học viên chỉ nhận triệu chứng trước, tự tìm. Kết luận: luôn commit `package-lock.json`, dùng `defaults.run.working-directory` để khỏi lặp đường dẫn, kiểm tra bằng clone sạch trước khi đổ lỗi cho CI. Hỏi lớp: lỗi nào trong bảng đã gặp trong buổi hôm nay?
14. **Recap (khoảng 15 phút review).** Cho 2 học viên chia sẻ màn hình run xanh và run đỏ. Nhắc nộp `lab-16/` kèm link run, không commit secret. Câu thảo luận cho nhóm xong sớm: so với pipeline đã thiết kế ở Buổi 15, còn thiếu stage nào?

## Lưu ý riêng cho người dạy

- Phần GitHub Actions chạy trên hạ tầng của GitHub nên đáp án dựa trên cú pháp và hành vi đã được tài liệu hóa; thông báo log chính xác có thể khác theo phiên bản action.
- Repo `devops-labs` của học viên phải để public (miễn phí cho Actions và GHCR về sau). Học viên lỡ tạo private vẫn chạy được workflow nhưng dễ hết hạn mức phút miễn phí.
- Bài dùng Node 22 và 24 cho matrix (cả hai đang được hỗ trợ; Node 20 đã hết vòng đời hỗ trợ từ 2026-04). Backend của `starter-project` nhắm Node 22.
- Ví dụ tham khảo trong repo: `examples/github-actions/ci-basic.yml` và `examples/github-actions/ci-matrix.yml` (khác cấu trúc thư mục và danh sách phiên bản Node với bài này).
- Tình huống 06 có tài nguyên ở `examples/troubleshooting/scenario-06/`, workflow trong đó có nhiều lỗi nối tiếp; nhắc học viên đọc lại log sau mỗi lần sửa.
- Lời giải L2 (workflow đầy đủ có matrix, `needs`, `build-image`) nằm trong [Đáp án tuần 8](../walkthroughs/week-08.md).
