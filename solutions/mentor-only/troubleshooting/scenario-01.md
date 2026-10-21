# Đáp án 01: Port đã được sử dụng

Đề bài dành cho học viên: [Kịch bản 01](../../../examples/troubleshooting/scenario-01/README.md).

## Nguyên nhân gốc

Container `ts01-legacy-site` (Nginx do `setup.sh` tạo) đã publish port host 28081. Hai tiến trình không thể cùng lắng nghe một cặp địa chỉ và port trên host, nên lệnh `docker run -p 28081:80` thứ hai thất bại. Nguyên nhân gốc là xung đột port trên host, không phải lỗi của image hay Nginx. Trang học viên thấy ở `http://localhost:28081` là trang của container cũ.

## Lệnh điều tra theo thứ tự

1. Đọc thông báo lỗi: có `Bind for 0.0.0.0:28081 failed: port is already allocated`. Docker cho biết ngay lỗi nằm ở bước bind port.
2. Hỏi Docker xem container nào đang giữ port:

```bash
docker ps --filter publish=28081 --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

Output mong đợi:

```text
NAMES              IMAGE               PORTS
ts01-legacy-site   nginx:1.27-alpine   0.0.0.0:28081->80/tcp, [::]:28081->80/tcp
```

3. Nếu `docker ps` không có gì, port bị chiếm bởi tiến trình ngoài Docker. Trên Windows: `netstat -ano | findstr 28081` (PowerShell hoặc cmd), lấy PID rồi tra bằng `tasklist /FI "PID eq 1234"` (thay 1234 bằng PID thật). Trong WSL2, `ss -ltnp | grep 28081` chỉ thấy tiến trình chạy trong WSL; tiến trình của Docker Desktop nằm phía Windows nên có thể không hiện.
4. Kiểm tra container bị tạo dở:

```bash
docker ps -a --filter name=ts01 --format '{{.Names}} {{.Status}}'
```

Output mong đợi (đã kiểm chứng): `ts01-web` ở trạng thái `Created` (container được tạo nhưng không start được), còn `ts01-legacy-site` ở trạng thái `Up`.

## Cách sửa

Hai hướng, cả hai đều hợp lệ:

- Đổi port host của container mới: `docker rm ts01-web && docker run -d --name ts01-web -p 28091:80 nginx:1.27-alpine`.
- Nếu container cũ không còn cần: `docker rm -f ts01-legacy-site`, xóa `ts01-web` đã tạo dở, rồi chạy lại lệnh gốc.

Lưu ý: lệnh `docker run` thất bại vẫn để lại container `ts01-web` ở trạng thái `Created`. Chạy lại cùng `--name` sẽ báo trùng tên, nên học viên phải `docker rm ts01-web` trước.

## Cách xác minh đã sửa

```bash
docker ps --filter name=ts01-web --format '{{.Names}} {{.Ports}}'
curl -sI http://localhost:28091 | head -1
```

Mong đợi `HTTP/1.1 200 OK` và đúng port mới.

## Phòng tránh

- Quy ước dải port theo dự án; ghi vào README hoặc `.env` (biến `WEB_PORT`), như `compose.yaml` của starter-project.
- Đặt tên container có ý nghĩa và dọn dẹp: dùng `docker compose down` thay vì để container mồ côi.
- Trước khi chạy: `docker ps` và kiểm tra port.
- Khi chỉ cần thử nhanh, để Docker chọn port ngẫu nhiên (`-P` hoặc `-p 80`), rồi xem bằng `docker port`.

## Câu hỏi mentor

1. Vì sao `-p 28081:80` lỗi còn `-p 28082:80` thì không? Hai container cùng lắng nghe port 80 bên trong có sao không?
2. Mẫu `HOST:CONTAINER` nghĩa là gì, bên nào phải duy nhất?
3. Nếu `docker ps` không thấy container nào nhưng port vẫn bận, bạn tìm ở đâu?
4. Chỉ publish ra `127.0.0.1` thay vì `0.0.0.0` (`-p 127.0.0.1:28081:80`) thay đổi gì về an toàn và về xung đột?
5. Trang ở `http://localhost:28081` trước khi sửa là trang của ai? Học viên phân biệt bằng cách nào?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Có cả chi tiết trang cũ vẫn truy cập được |
| Nguyên nhân gốc | 30 | Phải nêu đúng ai giữ port; chỉ nói "port bận" được 15 |
| Cách xác minh | 25 | `docker ps` hoặc `netstat` có output chứng minh |
| Giải pháp | 20 | Không `docker rm -f` bừa nếu chưa xác định container đó của ai |
| Phòng tránh | 15 | Quy ước port, `.env`, dọn container |
| Thưởng L2 | 10 | Giải thích bind `0.0.0.0` và `127.0.0.1` |
