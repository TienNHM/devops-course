# Kịch bản 05: Không build được image

> **Mức độ:** L1 (Foundation). **Thời lượng gợi ý:** 20 phút. **Kiến thức:** Docker build, build context, Dockerfile.

## Bối cảnh

Nhóm sự kiện của CLB có một monorepo nhỏ. Dịch vụ `club-events` nằm trong `services/api/` cùng Dockerfile riêng. Một thành viên đứng ở thư mục gốc của kịch bản này (thư mục chứa file README này) và build image như mọi khi.

## Triệu chứng

Chạy trong thư mục chứa README này:

```bash
docker build -t ts05-api:1.0.0 -f services/api/Dockerfile .
```

Build dừng ở bước `COPY` và báo lỗi tương tự:

```text
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...: "/package.json": not found
```

Cậu ấy khẳng định file `package.json` có tồn tại ("tôi nhìn thấy nó ngay trong `services/api/`") và Dockerfile "không có lỗi chính tả".

## Yêu cầu

Build thành công và chạy container ở `http://localhost:28085` (ví dụ `docker run -d --name ts05-api -p 28085:3000 ts05-api:1.0.0`). Không di chuyển file nguồn. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (làm sao chứng minh Docker "nhìn thấy" những file nào khi build).
4. Giải pháp (có ít nhất hai cách khác nhau; nêu cách bạn chọn và lý do).
5. Phòng tránh.

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Câu `COPY package.json ./` được hiểu so với một thư mục cụ thể, không phải so với vị trí của Dockerfile. Dấu `.` ở cuối lệnh `docker build` có vai trò gì?

</details>
