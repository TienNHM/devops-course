# nginx-demo: chạy container đầu tiên

Buổi liên quan: Tuần 3 (Docker căn bản: image, container, port mapping, bind mount).

## Chạy

```bash
cd examples/docker/nginx-demo
docker run -d --name nginx-demo -p 38080:80 \
  -v "$PWD/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
```

Giải thích: `-d` chạy nền, `--name` đặt tên, `-p 38080:80` map cổng 38080 của máy host vào cổng 80 trong container, `-v ...:ro` bind mount file chỉ đọc. Nếu cổng 38080 đã bận, đổi sang cổng khác (đây chính là tình huống lỗi "port đã được sử dụng").

## Kiểm tra

```bash
docker ps --filter name=nginx-demo
curl -s http://localhost:38080
```

Kết quả mong đợi (rút gọn):

```text
CONTAINER ID   IMAGE               COMMAND                  STATUS         PORTS                  NAMES
3f2a1b9c0d11   nginx:1.27-alpine   "/docker-entrypoint.…"   Up 5 seconds   0.0.0.0:38080->80/tcp   nginx-demo

<!doctype html>
<html lang="vi">
...
  <h1>Xin chào từ container Nginx</h1>
```

## Thử nghiệm

- Sửa `index.html` trên host rồi chạy lại `curl`: nội dung đổi ngay, không cần build lại (vì dùng bind mount).
- `docker logs nginx-demo` để xem access log.
- `docker exec -it nginx-demo sh` rồi `ls /usr/share/nginx/html` để thấy file bên trong container.

## Dọn dẹp

```bash
docker rm -f nginx-demo
```
