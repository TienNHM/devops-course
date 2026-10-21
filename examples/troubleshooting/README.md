# Kit 10 tình huống lỗi (dành cho mentor)

Thư mục này chứa các kịch bản lỗi chạy được thật. Mỗi `scenario-NN/` gồm một `README.md` đưa cho học viên (chỉ có bối cảnh và triệu chứng), các file bị lỗi, và script dựng lỗi. Đáp án nằm ở nơi riêng của mentor, không đặt trong thư mục học viên.

## Cách dùng

1. Chọn kịch bản, chạy `bash setup.sh` (nếu có) trong thư mục kịch bản để dựng lỗi.
2. Đưa cho học viên file `README.md` của kịch bản đó. Không đưa cho họ file khác ngoài phần cần chạy.
3. Học viên điều tra và nộp báo cáo 5 mục: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.
4. Sau buổi, chạy `bash cleanup.sh` để dọn container, network, volume của kịch bản.

## Quy ước

- Mọi tài nguyên Docker của kịch bản mang tiền tố `ts` + số kịch bản (ví dụ `ts01-`), để dọn sạch không đụng tới thứ khác.
- Port dùng cho kịch bản nằm trong dải 28080-28099 và 23000-23099, không trùng với starter-project (8080, 3000, 5432).
- Kịch bản 07-10 chạy trên cluster kind (xem bài Kubernetes), mỗi kịch bản dùng namespace riêng `ts-07` đến `ts-10`.
- Kịch bản 07 và 10 cần image `club-api:1.0.0` đã build từ `starter-project/backend` và nạp vào kind.
- Kịch bản 06 dùng file `workflow.yml.example` để không chạy trong repo này. Học viên đổi tên thành `.github/workflows/ts06.yml` trong repo cá nhân của họ.

Danh sách kịch bản: xem [10 tình huống cố tình tạo lỗi](../troubleshooting-scenarios.md).
