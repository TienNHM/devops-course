# Slide deck 01 – DevOps Foundation

SDLC, DevOps, Linux, networking, Git · 6 buổi · khoảng 100 slide (mỗi buổi 14 đến 22 slide; buổi 01 có 20, buổi 02 có 22, buổi 03 có 20)

## Mục tiêu của deck

Deck này đi cùng 6 buổi đầu của giai đoạn Engineering Foundation. Slide là bản rút gọn của bài lab: mỗi slide một ý chính, có lệnh mẫu, kết quả mong đợi và tình huống lỗi, để mentor dẫn dắt 30 phút kiến thức và demo rồi chuyển sang 60 phút thực hành. Sau deck này, học viên có môi trường WSL2 chạy được, dùng thạo Linux CLI, hiểu mạng cơ bản và làm việc với Git qua GitHub.

## Các buổi trong deck

| Buổi | Chủ đề | Slide | Bài lab |
| --- | --- | --- | --- |
| 01 | DevOps Introduction – SDLC, văn hóa DevOps, CI/CD, IaC | [session-01.md](session-01.md) | [Lab 01](../../labs/week-01/session-01.md) |
| 02 | Development Environment – WSL2, shell, filesystem, Git, SSH | [session-02.md](session-02.md) | [Lab 02](../../labs/week-01/session-02.md) |
| 03 | Linux CLI – `find`, `grep`, pipe, phân tích log | [session-03.md](session-03.md) | [Lab 03](../../labs/week-02/session-03.md) |
| 04 | Linux Administration – user, quyền, process, `systemctl`, biến môi trường | [session-04.md](session-04.md) | [Lab 04](../../labs/week-02/session-04.md) |
| 05 | Networking Fundamentals – IP, DNS, TCP, port, HTTP | [session-05.md](session-05.md) | [Lab 05](../../labs/week-03/session-05.md) |
| 06 | Git và GitHub Workflow – branch, PR, conflict, code review | [session-06.md](session-06.md) | [Lab 06](../../labs/week-03/session-06.md) |

## Cấu trúc mỗi buổi

Mỗi file slide theo template 10 phần của khóa học:

1. Learning objectives
2. Problem statement – vấn đề thực tế
3. Concept – khái niệm cần hiểu
4. Architecture – sơ đồ giải thích
5. How it works – quy trình hoạt động
6. Demo – giảng viên thực hiện
7. Hands-on lab – L1 Foundation và L2 Engineering
8. Common mistakes – lỗi thường gặp
9. Challenge – bài tập nâng cao
10. Recap – kiến thức cần nhớ

Nguyên tắc: một slide chỉ một ý chính; mỗi câu lệnh có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi. Phần "Ghi chú giảng viên" ở cuối mỗi slide gồm lời dẫn gợi ý, thời lượng và câu hỏi cho lớp; bấm vào để mở ra.

## Mẹo trình bày

- Chiếu trực tiếp trang này bằng trình duyệt ở chế độ toàn màn hình (phím F11). Cuộn từng slide, mỗi slide kết thúc bằng một đường kẻ ngang.
- Phóng to chữ bằng Ctrl và dấu cộng (khoảng 125 đến 150 phần trăm) để người ngồi cuối lớp đọc được; terminal nên đặt cỡ chữ từ 18 trở lên.
- Chia sẻ màn hình terminal thay vì chụp ảnh: mở Windows Terminal ở một nửa màn hình, slide ở nửa còn lại, để học viên gõ theo.
- Chạy demo trước ít nhất một lần trên máy chiếu. Dùng thư mục tạm như `~/demo` và dọn sạch sau khi demo, không xóa trong thư mục có dữ liệu thật.
- Cho học viên tự phá lỗi ở slide "Lỗi thường gặp" trước khi mentor giải thích; việc tự điều tra nhớ lâu hơn nghe giảng.
- Phân bổ 120 phút: 15 phút ôn tập, 30 phút slide và demo, 60 phút thực hành, 15 phút review.
