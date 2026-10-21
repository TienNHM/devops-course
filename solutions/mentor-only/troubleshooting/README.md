# Đáp án mentor: 10 tình huống lỗi

Thư mục này chỉ dành cho mentor. Không gửi cho học viên trước khi họ nộp báo cáo.

| # | Tình huống | Kiểm chứng đã làm |
| --- | --- | --- |
| 01 | [Port đã được sử dụng](scenario-01.md) | Chạy thật bằng Docker |
| 02 | [Container exit ngay](scenario-02.md) | Chạy thật bằng Docker |
| 03 | [API không kết nối được DB](scenario-03.md) | Chạy thật bằng Docker Compose |
| 04 | [Database mất dữ liệu](scenario-04.md) | Chạy thật bằng Docker Compose |
| 05 | [Image build thất bại](scenario-05.md) | Chạy thật bằng Docker |
| 06 | [GitHub Actions fail](scenario-06.md) | Một phần: lỗi `working-directory` mô phỏng bằng Docker; phần quyền GHCR chưa chạy trên GitHub |
| 07 | [ImagePullBackOff](scenario-07.md) | Chỉ kiểm tra cú pháp YAML; chưa chạy trên cluster |
| 08 | [CrashLoopBackOff](scenario-08.md) | Logic ứng dụng chạy thật bằng Docker; phần Kubernetes chưa chạy trên cluster |
| 09 | [Pod Pending](scenario-09.md) | Chỉ kiểm tra cú pháp YAML; chưa chạy trên cluster |
| 10 | [Readiness probe fail](scenario-10.md) | Chỉ kiểm tra cú pháp YAML; chưa chạy trên cluster |

## Thang chấm chung (100 điểm)

| Mục báo cáo | Điểm | Tiêu chí đạt điểm tối đa |
| --- | --- | --- |
| Triệu chứng | 10 | Mô tả chính xác, kèm output thật, không suy diễn nguyên nhân |
| Nguyên nhân gốc | 30 | Nêu đúng nguyên nhân gốc, không dừng ở hiện tượng bề mặt |
| Cách xác minh | 25 | Có lệnh và output chứng minh trực tiếp, đi từ rộng đến hẹp |
| Giải pháp | 20 | Sửa đúng chỗ, tối thiểu, đã chạy lại và chứng minh đã hết lỗi |
| Phòng tránh | 15 | Biện pháp cụ thể, kiểm tra được (healthcheck, CI, lint, quy ước) |

Mỗi tình huống có thêm điểm thưởng L2 (tối đa 10 điểm) cho phần giải thích sâu. Quy đổi: từ 85 điểm là Xuất sắc, 70 đến 84 là Đạt tốt, 50 đến 69 là Đạt, dưới 50 cần làm lại. Học viên đoán nguyên nhân rồi sửa ngẫu nhiên mà không có bước xác minh: trừ tối đa 15 điểm ở mục Cách xác minh dù cuối cùng sửa được.

## Lưu ý khi chạy trên Windows

- Chạy các script `setup.sh` và `cleanup.sh` trong WSL2 hoặc Git Bash. Nếu dùng Git Bash, lệnh `docker run -v` với đường dẫn Linux có thể bị đổi thành đường dẫn Windows: đặt `MSYS_NO_PATHCONV=1` trước lệnh.
- Output trong các file đáp án đã rút gọn. Mã băm, thời gian và tên Pod sẽ khác.
- Kịch bản 07 và 10 cần image `club-api:1.0.0` (script `setup.sh` tự build từ `starter-project/backend` và nạp vào kind). Tên cluster mặc định là `kind`; nếu khác, đặt biến `KIND_CLUSTER`.
