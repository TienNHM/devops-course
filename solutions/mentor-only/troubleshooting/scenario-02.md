# Đáp án 02: Container exit ngay khi start

Đề bài dành cho học viên: [Kịch bản 02](../../../examples/troubleshooting/scenario-02/README.md).

## Nguyên nhân gốc

Dockerfile khai báo `CMD ["node", "src/server.js"]`, nhưng bước `COPY package.json server.js ./` đặt file ở `/app/server.js`. Không có thư mục `src`. Node không tìm thấy module và thoát với mã 1. Container chỉ sống bao lâu tiến trình PID 1 còn chạy; tiến trình đó chết thì container dừng.

## Lệnh điều tra theo thứ tự

```bash
docker ps -a --filter name=ts02-notes --format '{{.Names}} {{.Status}}'
docker logs ts02-notes
docker inspect ts02-notes --format '{{json .Config.Cmd}}'
docker run --rm ts02-notes:broken ls
```

Output mong đợi (đã kiểm chứng, rút gọn):

```text
ts02-notes Exited (1) 3 seconds ago
```

```text
Error: Cannot find module '/app/src/server.js'
```

```text
["node","src/server.js"]
```

```text
package.json
server.js
```

Lệnh cuối ghi đè `CMD` bằng `ls` để xem thư mục làm việc `/app` của image. Kết hợp với `docker inspect`, học viên thấy lệnh mặc định trỏ tới `src/server.js` trong khi file thật ở `server.js`.

## Cách sửa

```diff
-CMD ["node", "src/server.js"]
+CMD ["node", "server.js"]
```

Sau đó build lại (`docker build -t ts02-notes:fixed .`), xóa container cũ (`docker rm ts02-notes`), chạy lại với image mới.

## Cách xác minh đã sửa

```bash
docker run -d --name ts02-notes -p 28082:3000 ts02-notes:fixed
curl -s http://localhost:28082
```

Output mong đợi (đã kiểm chứng): `{"status":"healthy","service":"club-notes"}`, và `docker ps` thấy container `Up`.

## Phòng tránh

- Sau khi build, chạy thử image ngay (smoke test) trước khi đẩy lên registry; có thể đưa vào CI: chạy container nền rồi `curl`.
- Giữ cấu trúc thư mục khớp giữa `COPY` và `CMD`; kiểm tra bằng `docker run --rm IMAGE ls -R /app`.
- Dùng script `start` trong `package.json` và `CMD ["npm", "start"]` để lệnh khởi động nằm một chỗ.
- Luôn đọc `docker logs` trước khi đoán.

## Câu hỏi mentor

1. Vì sao container thoát khi tiến trình chính thoát? PID 1 trong container đóng vai trò gì?
2. Khác biệt giữa `CMD` và `ENTRYPOINT`? Khi nào dùng dạng exec (mảng JSON) thay vì dạng shell?
3. Exit code 0, 1, 137 và 139 thường nghĩa là gì?
4. Làm sao xem file bên trong image khi container không chạy được? (Ghi đè lệnh, hoặc `docker create` rồi `docker cp`.)
5. Tại sao `docker logs` vẫn đọc được log của container đã dừng?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Có `Exited (1)` và việc container không có trong `docker ps` |
| Nguyên nhân gốc | 30 | Phải nêu đường dẫn trong `CMD` và vị trí file thật |
| Cách xác minh | 25 | Có `docker logs` và đối chiếu với nội dung image |
| Giải pháp | 20 | Sửa Dockerfile và build lại; sửa trong container đang chạy không được điểm |
| Phòng tránh | 15 | Smoke test hoặc nguyên tắc tương đương |
| Thưởng L2 | 10 | Giải thích `CMD` và `ENTRYPOINT` |
