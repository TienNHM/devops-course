# Kịch bản 03: API chạy nhưng không dùng được

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 30 phút. **Kiến thức:** Docker network, DNS nội bộ, Compose.

## Bối cảnh

Nhóm dự án dựng API quản lý thành viên (backend của starter-project) cùng Postgres bằng một file `compose.yaml` riêng. Mentor đã chạy `bash setup.sh`. Cả hai container đều đang chạy. API được publish ra `http://localhost:23003`.

## Triệu chứng

```bash
docker compose ps
curl -i http://localhost:23003/health
curl -i http://localhost:23003/ready
curl -i http://localhost:23003/api/members
```

- `docker compose ps` cho thấy `api` và `postgres` đều `Up`, `postgres` là `healthy`.
- `/health` trả `200`.
- `/ready` trả `503` với `{"status":"not-ready"}`.
- `/api/members` trả `500` với `{"message":"Internal server error"}`.

Nhóm khẳng định "Postgres chạy bình thường, chúng tôi không đổi gì trong code".

## Yêu cầu

Tìm nguyên nhân và đưa `/ready` về `200`. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (ít nhất một lệnh chứng minh trực tiếp, không chỉ suy đoán từ cấu hình).
4. Giải pháp (diff của `compose.yaml`).
5. Phòng tránh.

Ghi chú L2: giải thích vì sao `/health` vẫn `200` trong khi `/ready` thì không, và vì sao `docker compose ps` không cảnh báo gì.

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Log của container `api` cho biết lỗi cụ thể mà ứng dụng gặp. Sau đó hãy tự kiểm tra từ bên trong container `api`: nó có phân giải và kết nối tới Postgres được không? Xem `docker network ls` và `docker network inspect` để biết mỗi container đang đứng ở đâu.

</details>
