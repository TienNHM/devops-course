# Đáp án 05: Image build thất bại

Đề bài dành cho học viên: [Kịch bản 05](../../../examples/troubleshooting/scenario-05/README.md).

## Nguyên nhân gốc

Lệnh `docker build -f services/api/Dockerfile .` dùng thư mục hiện tại (`.`) làm build context, trong khi Dockerfile viết `COPY package.json ./` và `COPY server.js ./` như thể context là `services/api/`. Đường dẫn nguồn của `COPY` được hiểu so với build context, không phải so với vị trí của Dockerfile. Tại gốc kịch bản không có `package.json`, nên bước `COPY` thất bại. Cờ `-f` chỉ chọn file Dockerfile, không đổi context.

## Lệnh điều tra theo thứ tự

1. Đọc lỗi: `"/package.json": not found` ở bước `COPY`. Đường dẫn bắt đầu bằng `/` là gốc của context.
2. Xem Docker "nhìn thấy" file nào trong context (đã kiểm chứng):

```bash
docker build --no-cache --progress=plain -t ts05-ctx -f - . <<'EOF'
FROM busybox:1.37
COPY . /ctx
RUN find /ctx -type f
EOF
```

Output mong đợi (rút gọn):

```text
/ctx/cleanup.sh
/ctx/README.md
/ctx/services/api/Dockerfile
/ctx/services/api/package.json
/ctx/services/api/server.js
```

Không có `/ctx/package.json`. Có `services/api/package.json`: đó là lỗi lệch đường dẫn. Dọn bằng `docker rmi ts05-ctx` nếu image được tạo ra.

3. Kiểm tra `.dockerignore` nếu có (không phải nguyên nhân ở bài này, nhưng cần loại trừ): `cat .dockerignore`.

## Cách sửa

Cách A, đổi context cho khớp với Dockerfile (khuyến nghị; đã kiểm chứng):

```bash
docker build -t ts05-api:1.0.0 services/api
```

Cách B, giữ context ở gốc và sửa đường dẫn trong Dockerfile (đã kiểm chứng):

```diff
-COPY package.json ./
-COPY server.js ./
+COPY services/api/package.json ./
+COPY services/api/server.js ./
```

Chọn cách A khi mỗi dịch vụ độc lập; chọn cách B khi cần chia sẻ file ở gốc monorepo (khi đó context to hơn, cần `.dockerignore` tốt).

## Cách xác minh đã sửa

```bash
docker run -d --name ts05-api -p 28085:3000 ts05-api:1.0.0
curl -s http://localhost:28085
```

Output mong đợi (đã kiểm chứng): `{"status":"healthy","service":"club-events"}`.

## Phòng tránh

- Ghi lệnh build chuẩn vào README hoặc Makefile; để Compose giữ `build.context` và `dockerfile` cạnh nhau.
- Đặt `.dockerignore` cạnh Dockerfile (ở gốc context) để context nhỏ và dự đoán được.
- Chạy build trong CI, ở cùng thư mục như lệnh trong tài liệu.
- Dùng đường dẫn tương đối ngắn trong Dockerfile và chỉ làm việc trong context.

## Câu hỏi mentor

1. Build context là gì và vì sao Docker gửi nó cho daemon? Điều gì xảy ra nếu context là cả ổ đĩa?
2. `-f` làm gì và không làm gì?
3. Vì sao `COPY ../shared/config.json .` không hoạt động?
4. Vai trò của `.dockerignore`, và nó ảnh hưởng gì tới việc `COPY . .`?
5. Trong `compose.yaml`, `build.context` và `build.dockerfile` được hiểu so với đường dẫn nào?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Trích đúng thông báo lỗi và lệnh đã chạy |
| Nguyên nhân gốc | 30 | Phải nêu "COPY tính theo build context"; "thiếu file" chỉ được 5 |
| Cách xác minh | 25 | Có cách chứng minh nội dung context |
| Giải pháp | 20 | Nêu được hai cách và so sánh |
| Phòng tránh | 15 | Chuẩn hóa lệnh build, `.dockerignore`, CI |
| Thưởng L2 | 10 | Giải thích context gửi cho daemon, `..` không ra khỏi context |
