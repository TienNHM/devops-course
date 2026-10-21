# Slide deck 02 – Docker Fundamentals

Deck gồm 6 buổi (07 đến 12), tổng cộng khoảng 100 đến 120 slide trình chiếu (buổi 07 đến 09 đã có 60 slide). Mỗi buổi 14 đến 22 slide, theo đúng thứ tự template 10 phần.

## Các buổi trong deck

| Buổi | Chủ đề | Số slide | Slide | Bài lab |
| --- | --- | --- | --- | --- |
| 07 | Container Fundamentals | 19 | [session-07.md](session-07.md) | [Buổi 07](../../labs/week-04/session-07.md) |
| 08 | Docker CLI | 20 | [session-08.md](session-08.md) | [Buổi 08](../../labs/week-04/session-08.md) |
| 09 | Dockerfile | 21 | [session-09.md](session-09.md) | [Buổi 09](../../labs/week-05/session-09.md) |
| 10 | Image Optimization | theo file | [session-10.md](session-10.md) | [Buổi 10](../../labs/week-05/session-10.md) |
| 11 | Container Networking | theo file | [session-11.md](session-11.md) | [Buổi 11](../../labs/week-06/session-11.md) |
| 12 | Persistent Storage | theo file | [session-12.md](session-12.md) | [Buổi 12](../../labs/week-06/session-12.md) |

Buổi 07 đến 09: 60 slide đã soạn (19 + 20 + 21). Buổi 10 đến 12 do nhóm soạn khác phụ trách và nằm cùng thư mục.

## Mục tiêu deck

- Hiểu container khác máy ảo ở đâu và kiến trúc Docker (client, daemon, registry).
- Dùng thành thạo Docker CLI để chạy, quan sát, debug và dọn container.
- Viết Dockerfile cho `club-api`, hiểu build context và layer cache.
- Tối ưu image (multi-stage, tag, `.dockerignore`), nối container qua network và giữ dữ liệu bằng volume.
- Chẩn đoán các lỗi kinh điển: port bận, container thoát ngay, build sai context.

## Cấu trúc mỗi buổi

1. Learning objectives
2. Problem statement
3. Concept
4. Architecture (mermaid)
5. How it works
6. Demo của giảng viên
7. Hands-on lab (L1 Foundation, L2 Engineering)
8. Common mistakes
9. Challenge
10. Recap

Nguyên tắc: một slide một ý chính; lệnh nào cũng có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi. Ghi chú giảng viên nằm trong khối "Ghi chú giảng viên" cuối mỗi slide.

## Mẹo trình bày

- Chiếu bằng trình duyệt: mở trang slide trên site giáo trình, hoặc mở file `.md` cạnh bài lab; cuộn từng slide, mỗi slide cách nhau một đường kẻ ngang.
- Bật trang toàn màn hình (F11) và phóng to bằng Ctrl và dấu cộng khoảng 125 đến 150 phần trăm; với phòng lớn nên chọn 150 phần trăm trở lên.
- Chia sẻ màn hình terminal: dùng font monospace từ 18 đến 20 pt, nền tối, xóa màn hình (`clear`) trước mỗi bước, tránh dòng lệnh quá dài.
- Chạy lệnh thật trong WSL Ubuntu, trong filesystem của WSL, không dùng `/mnt/c`.
- Cho lớp dự đoán kết quả trước khi nhấn Enter; dừng ở các câu hỏi trong ghi chú giảng viên.
- Mở sẵn Docker Desktop và chạy thử `docker version` trước giờ học 10 phút.
- Chia thời gian mỗi buổi 120 phút: 15 phút ôn tập, 30 phút kiến thức và demo, 60 phút lab, 15 phút review.
