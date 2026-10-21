# Kịch bản 04: Dữ liệu biến mất sau khi cập nhật

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 30 phút. **Kiến thức:** Docker volume, vòng đời container, dữ liệu bền vững.

## Bối cảnh

Một thành viên dựng Postgres để lưu danh sách CLB và đã nhập 3 thành viên. Cậu ấy nghĩ mình đã cấu hình lưu dữ liệu đúng (file `compose.yaml` có khai báo volume). Mentor đã chạy `bash setup.sh`.

## Triệu chứng

Xác nhận dữ liệu đang có:

```bash
docker compose exec postgres psql -U club -d clubdb -c "SELECT name FROM members ORDER BY id;"
```

Trả về 3 dòng: Alice, Bob, Carol. Sau đó cập nhật dịch vụ theo cách quen thuộc (xóa container rồi tạo lại):

```bash
docker compose down
docker compose up -d --wait
docker compose exec postgres psql -U club -d clubdb -c "SELECT name FROM members ORDER BY id;"
```

Lần này lệnh cuối báo `ERROR: relation "members" does not exist`. Toàn bộ dữ liệu đã biến mất, dù `docker volume ls` vẫn liệt kê volume `ts04_ts04-pgdata`.

## Yêu cầu

Tìm nguyên nhân, đảm bảo dữ liệu sống sót qua `down` và `up`, và nêu cách xử lý dữ liệu đã mất. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (chứng minh dữ liệu thực sự được ghi ở đâu).
4. Giải pháp (diff của `compose.yaml` và cách kiểm tra lại bằng cùng quy trình `down` rồi `up`).
5. Phòng tránh.

Ghi chú L2: nếu bạn được gọi tới trước khi chạy `docker compose down`, bạn có thể làm gì để cứu dữ liệu của Alice, Bob, Carol? Sau khi đã `down` thì sao?

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Một volume tồn tại không đồng nghĩa với việc Postgres đang ghi dữ liệu vào đó. Hãy so sánh đường dẫn mà Postgres thực sự ghi dữ liệu (lệnh `SHOW data_directory;` trong psql, hoặc `docker inspect` phần Env) với đường dẫn mà volume được gắn vào (`docker inspect` phần Mounts).

</details>
