# Tuyển và đào tạo mentor mới

> **Tóm tắt:** Nguồn và tiêu chí tuyển mentor, lộ trình đào tạo 4 bước, checklist năng lực, bàn giao giữa các thế hệ, cách hỗ trợ máy 8 GB RAM và bảng xử lý nhanh sự cố ngày học.

::: warning Dành cho mentor
Trang này dành cho Program Lead và mentor mới; học viên không cần đọc.
:::

Mentor mới nên đọc [Sổ tay mentor](handbook.md) và [Quy trình một buổi học](session-runbook.md) trước, rồi quay lại trang này để theo lộ trình đào tạo. Hai phần cuối (máy 8 GB và sự cố ngày học) là kiến thức mọi mentor cần nắm trước khi trực lab.

## Nguồn và tiêu chí

Nguồn: học viên đã hoàn thành khóa với xếp loại Good trở lên (từ 80 điểm), thành viên CLB có kinh nghiệm Linux, Git hoặc Docker, cựu học viên đã tham gia làm Lab Assistant.

| Tiêu chí | Lab Assistant | Technical Mentor |
| --- | --- | --- |
| Kỹ thuật | Hoàn thành khóa, tự chạy lại lab được | Làm chủ Docker, Compose, CI/CD, Kubernetes cơ bản, tự chẩn đoán lỗi |
| Giao tiếp | Kiên nhẫn, chịu khó hỏi lại | Giải thích rõ, đặt câu hỏi dẫn dắt |
| Cam kết | Tham gia trực lab theo lịch học kỳ | Tham gia chuẩn bị, chấm bài, office hour |

## Lộ trình đào tạo 4 bước

| Bước | Nội dung | Kết quả cần đạt |
| --- | --- | --- |
| 1. Học | Đọc [Sổ tay mentor](handbook.md) và [Quy trình một buổi học](session-runbook.md), xem lại slide của phase mình phụ trách | Hiểu quy trình và triết lý khóa |
| 2. Chạy lại | Tự chạy toàn bộ lab của một phase trên máy sạch, ghi lỗi gặp | Báo cáo chạy lab, danh sách lỗi và đề xuất sửa |
| 3. Shadow | Dự 2 buổi như người quan sát, ghi lại cách mentor xử lý học viên tụt lại | Bản ghi chú quan sát |
| 4. Đồng dẫn | Trực lab độc lập một nhóm, sau đó dẫn một đoạn (demo hoặc review) có mentor dự | Phản hồi từ mentor và học viên, được lead duyệt |

## Checklist năng lực cho mentor mới

- [ ] Giải thích được luồng từ `git push` đến image trên GHCR và triển khai lên cluster kind.
- [ ] Tự tạo và sửa được ít nhất 5 trong 10 tình huống lỗi chuẩn (xem [10 tình huống lỗi](../examples/troubleshooting-scenarios.md)).
- [ ] Biết đặt câu hỏi dẫn dắt thay vì đưa đáp án.
- [ ] Thực hiện được review PR theo barem và viết phản hồi theo mẫu trong [Hướng dẫn chấm bài](grading-guide.md).
- [ ] Biết các quy tắc an toàn trong [Sổ tay mentor](handbook.md) và nhắc học viên.
- [ ] Biết xử lý máy 8 GB và sự cố mạng ngày học (hai phần bên dưới).
- [ ] Biết cập nhật Issue và Project cho học viên mình phụ trách.

## Bàn giao giữa các thế hệ

Cuối mỗi khóa, lead cũ và lead mới cùng thực hiện:

- [ ] Bàn giao quyền truy cập: organization, repo giáo trình, repo đáp án private, Project, Discussions.
- [ ] Bàn giao báo cáo cuối khóa: tỷ lệ hoàn thành, lỗi phổ biến, đề xuất thay đổi.
- [ ] Rà [Điều kiện mở khóa](launch-checklist.md) cho phiên bản mới.
- [ ] Cập nhật phiên bản công cụ theo [quy trình ở đây](repo-governance.md).
- [ ] Ghi bài học vào `CHANGELOG.md` và mở Issue cho các thay đổi lớn.
- [ ] Giữ lại ít nhất một mentor có kinh nghiệm cho khóa kế tiếp để làm cầu nối.

## Máy 8GB RAM

Setup Guide ghi 8 GB là mức tối thiểu cho Linux, Git và Docker cơ bản. Hướng dẫn mentor hỗ trợ:

1. Giới hạn bộ nhớ WSL2 bằng file `.wslconfig` trong thư mục người dùng Windows (ví dụ `C:\Users\TenBan\.wslconfig`), rồi chạy `wsl --shutdown` để áp dụng:

```text
[wsl2]
memory=4GB
processors=2
swap=4GB
```

2. Chỉ chạy những gì buổi học cần. Dừng Compose stack trước khi tạo cluster kind (đúng khuyến nghị của Setup Guide): `docker compose down` trong thư mục `starter-project`.
3. Đóng trình duyệt nhiều tab và các extension VS Code không cần thiết khi chạy kind.
4. Dùng cluster kind một node. Không làm bài L2 nhiều node trên máy 8 GB.
5. Dọn tài nguyên Docker không dùng: `docker image prune` và `docker builder prune`. Hỏi học viên trước khi chạy `docker system prune`, vì lệnh này xóa nhiều thứ hơn họ nghĩ.
6. Giảm replica trong lab Kubernetes (ví dụ từ 2 xuống 1) khi cần, và nói rõ đây là ngoại lệ của máy yếu.
7. Phương án cuối: ghép đôi, hai người dùng chung một máy 16 GB, hoặc cung cấp một máy chung của CLB để chạy phần nặng.

Hãy kiểm tra tham số `.wslconfig` trong tài liệu chính thức: https://learn.microsoft.com/en-us/windows/wsl/wsl-config

## Xử lý sự cố thường gặp ngày học

Bảng nhanh. Phiên bản đầy đủ (môi trường, mạng, lab của khóa, con người và lớp học) nằm trong phần chi tiết của [Quy trình một buổi học](session-runbook.md).

| Triệu chứng | Nguyên nhân hay gặp | Hướng xử lý |
| --- | --- | --- |
| `docker: command not found` trong WSL | Chưa bật WSL integration | Docker Desktop, Settings, Resources, WSL integration, bật cho Ubuntu |
| Docker Desktop không khởi động | Virtualization tắt, WSL cũ | Bật virtualization trong BIOS, chạy `wsl --update` rồi khởi động lại |
| Pull image rất chậm hoặc timeout | Nhiều người cùng pull qua một mạng | Dùng image đã pre-pull, nạp từ file `.tar` bằng `docker load` |
| `port is already allocated` | Dịch vụ khác chiếm cổng | Đổi `WEB_PORT` trong `.env`, hoặc tìm process bằng `ss -ltnp` |
| Lệnh chậm bất thường, quạt kêu | Hết RAM | Xem phần Máy 8GB RAM ở trên, rồi `wsl --shutdown` |
| Lỗi quyền hoặc file chậm khi làm trong `/mnt/c` | Làm việc trên filesystem Windows | Chuyển repo vào thư mục home của WSL, không dùng `/mnt/c` |
| kind cluster không tạo được | Thiếu RAM, Docker chưa chạy | Kiểm tra `docker ps`, `kind delete cluster` rồi tạo lại |
| GitHub Actions không chạy | Workflow đặt sai thư mục, hoặc Actions bị tắt ở repo | Kiểm tra `.github/workflows/` ở gốc repo và tab Actions |
