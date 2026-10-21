# Kịch bản 02: Container tắt ngay sau khi chạy

> **Mức độ:** L1 (Foundation). **Thời lượng gợi ý:** 20 phút. **Kiến thức:** Docker image, container lifecycle, logs.

## Bối cảnh

Một thành viên đóng gói dịch vụ ghi chú `club-notes` (Node.js) thành image và nhờ bạn chạy thử. Mentor đã build image `ts02-notes:broken` bằng `bash setup.sh`. Mã nguồn và Dockerfile nằm trong thư mục này.

## Triệu chứng

```bash
docker run -d --name ts02-notes -p 28082:3000 ts02-notes:broken
docker ps
```

`docker ps` không liệt kê container nào. `curl http://localhost:28082` báo `Connection refused`. Chạy `docker ps -a` thì thấy container ở trạng thái `Exited (1)` chỉ vài giây sau khi tạo.

## Yêu cầu

Tìm ra vì sao container thoát và sửa để `curl http://localhost:28082` trả về JSON. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (lệnh và output).
4. Giải pháp (file nào, dòng nào thay đổi).
5. Phòng tránh (làm gì để phát hiện sớm lỗi này trước khi giao image cho người khác).

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Container đã dừng vẫn giữ lại log. Bạn cũng có thể kiểm tra nội dung bên trong image mà không cần chạy ứng dụng, ví dụ chạy `ls` thay cho lệnh mặc định.

</details>
