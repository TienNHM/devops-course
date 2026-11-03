# Slide buổi 12 – Persistent Storage

> **Tóm tắt:** Chạy PostgreSQL với named volume để dữ liệu sống sót khi xóa container, rồi backup và restore bằng pg_dump. Biết phân biệt volume, bind mount và tmpfs.

Bài học: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md) · Bài tập: [Bài tập tuần 6](../../assignments/weekly/week-06.md)

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: dữ liệu bền, chọn đúng mount, backup và restore](/slides/img/s12-goals.svg)

::: details Ghi chú cho mentor
- Giải thích vì sao dữ liệu trong writable layer mất khi xóa container; chọn đúng named volume, bind mount, tmpfs.
- Chứng minh dữ liệu còn sau recreate; backup và restore bằng `pg_dump`; chẩn đoán "có volume nhưng vẫn mất dữ liệu".
:::

---

## Slide 2: Cập nhật image xong, bảng trống

![Xóa container cũ chạy container mới, bảng members trống không báo lỗi](/slides/img/s12-problem.svg)

::: details Ghi chú cho mentor
- Một thành viên nhập 30 người đăng ký; hôm sau cập nhật image: xóa container cũ, chạy container mới.
- Không có lỗi nào được báo, mọi lệnh thành công. Container dùng một lần là điểm mạnh; dữ liệu database thì không.
:::

---

## Slide 3: Writable layer sống cùng container

![Container có layer chỉ đọc và writable layer; docker rm xóa cả writable layer](/slides/img/s12-writable.svg)

::: details Ghi chú cho mentor
- Mọi file tiến trình ghi ra nằm ở writable layer, gắn với vòng đời container; `docker rm` là mất toàn bộ.
- Ví von: bảng trắng trong phòng họp, dọn phòng là sạch.
:::

---

## Slide 4: Ba cách gắn dữ liệu ra ngoài

![Named volume, bind mount, tmpfs: nơi lưu và có sống sau khi xóa container không](/slides/img/s12-mounts.svg)

::: details Ghi chú cho mentor
- Named volume: vùng Docker quản lý, dùng cho database. Bind mount: thư mục trên máy, cho mã nguồn và config khi dev. tmpfs: RAM, dữ liệu tạm.
- Giáo trình dùng `--mount` vì tường minh; `-v host:container` âm thầm tạo thư mục rỗng nếu gõ nhầm đường dẫn.
:::

---

## Slide 5: Điểm mount phải trùng nơi Postgres ghi

![Mount đúng ghi vào volume; mount sai khiến Postgres ghi vào writable layer](/slides/img/s12-pgpath.svg)

::: details Ghi chú cho mentor
- Dữ liệu nằm ở `/var/lib/postgresql/data` (biến `PGDATA`), image khai báo đó là `VOLUME`.
- Không gắn gì: Docker tạo anonymous volume tên hex, container mới tạo cái mới nên trông như mất dữ liệu.
- `init.sql` và `POSTGRES_*` chỉ có tác dụng khi thư mục dữ liệu trống. Bài này ghim `postgres:17-alpine`; từ Postgres 18 cách bố trí đổi, đọc lại Docker Hub trước khi dùng lại volume cũ.
:::

---

## Slide 6: Xóa container, volume giữ dữ liệu

![pg-lab bị xóa, pg-lab2 gắn lại volume pg-data và thấy đủ dữ liệu](/slides/img/s12-lifecycle.svg)

::: details Ghi chú cho mentor
- Trình tự: run `pg-lab` với volume, INSERT, `rm -f pg-lab`, run `pg-lab2` cùng volume, SELECT thấy dữ liệu cũ.
- Trên Docker Desktop, volume nằm trong máy ảo của Docker, không phải thư mục WSL.
:::

---

## Slide 7: Demo: không volume, có volume, tmpfs

```text
# Không volume: xóa container, file mất
# Có volume gắn vào /data: file vẫn còn
# tmpfs gắn tại /scratch:
$ df /scratch
tmpfs   ...   /scratch
```

Ai đang giữ file? Có volume thì là volume; không thì writable layer.

::: details Ghi chú cho mentor
- Không volume: ghi `/note.txt`, xóa container, chạy lại cùng tên: file không còn (nằm ở writable layer của container cũ).
- Có volume: ghi file vào `/data`, xóa container, chạy container mới cùng volume: file còn. tmpfs: dừng container thì mất.
- Câu hỏi: nếu chạy nhầm `docker compose down -v` trên môi trường thật, cứu bằng cách nào? Dẫn vào backup.
:::

---

## Slide 8: Lab L1: 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Postgres với volume `pg-data`, bảng `members` | `SELECT` ra 3 dòng |
| 3 | `rm -f` rồi tạo container mới | `Skipping initialization` |
| 4 | `docker inspect` và `SHOW data_directory;` | Hai đường dẫn trùng |
| 5 | `pg_dump`, xóa volume, restore | `SELECT` thấy lại dữ liệu |

Lệnh đầy đủ: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md).

::: details Ghi chú cho mentor
- Chỉ xóa đúng volume `pg-data`, không dùng `docker volume prune` trên máy có dự án khác.
- Mật khẩu `PGPASS` là giá trị giả chỉ cho lab. Thử thách L2: [Thử thách thêm buổi 12](../../labs/week-06/session-12-challenge.md).
:::

---

## Slide 9: Backup và restore bằng pg_dump

![pg_dump ra backup.sql, volume bị xóa, psql nạp lại vào DB mới](/slides/img/s12-backup.svg)

::: details Ghi chú cho mentor
- `pg_dump` nhất quán khi database đang chạy, đọc được bằng mắt, restore được sang phiên bản khác; ưu tiên hơn sao chép thô thư mục dữ liệu.
- Restore: `docker exec -i pg-lab psql ... < source/backup.sql`; thiếu `-i` thì restore trống mà không báo lỗi.
- Backup chưa thử restore thì chưa phải backup.
:::

---

## Slide 10: down giữ volume, down -v xóa volume

![So sánh docker compose down và down -v về container, network, volume](/slides/img/s12-down.svg)

::: details Ghi chú cho mentor
- `down` xóa container và network, giữ named volume; `up -d --wait` thì dữ liệu còn. `down -v` xóa thêm named volume khai báo trong file.
- Mật khẩu đặt trong `.env`, không commit.
:::

---

## Slide 11: Debug: có volume nhưng vẫn mất dữ liệu

![docker inspect cho thấy mount một nơi, data_directory ở nơi khác](/slides/img/s12-debug.svg)

::: details Ghi chú cho mentor
- Triệu chứng: sau `down` rồi `up`, `SELECT` báo `relation "members" does not exist`; `docker volume ls` vẫn thấy volume. Đường dẫn trong hình là ví dụ minh họa.
- Điều tra: `data_directory` so với đích mount trong `docker inspect`; `docker diff` cho thấy dữ liệu nằm trong writable layer.
- Nguyên nhân gốc: `PGDATA` và điểm mount không trùng. Phòng tránh: kiểm tra recreate ngay ngày đầu, có backup và thử restore.
:::

---

## Slide 12: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| Mất dữ liệu dù có volume | Mount lệch nơi Postgres ghi | `inspect` và `data_directory` |
| Mất hết sau `down -v` | `-v` xóa named volume | Dùng `down`, backup trước |
| Restore xong bảng trống | Thiếu `-i` | Thêm `-i`, `SELECT` kiểm tra |
| Đổi `POSTGRES_PASSWORD` không ăn | Chỉ áp dụng lần đầu | `ALTER USER` |

::: details Ghi chú cho mentor
- Lỗi quyền với bind mount dưới `/mnt/c`: filesystem Windows; dùng named volume và làm trong WSL.
- Đổi `POSTGRES_PASSWORD` không có tác dụng: hoặc tạo volume mới sau khi backup.
:::

---

## Slide 13: Thử thách cuối buổi

- `down` và `down -v` khác nhau thế nào?
- `docker volume ls` có volume nhưng dữ liệu mất: kiểm tra gì đầu tiên?
- Đồng đội muốn bind mount dữ liệu Postgres dưới `/mnt/c`: bạn nhận xét gì?

::: details Ghi chú cho mentor
- Gợi ý: so sánh đích mount với `SHOW data_directory;`; bind mount dưới `/mnt/c` hay lỗi quyền.
- Hỏi thêm: vì sao ưu tiên `pg_dump` hơn sao chép thô thư mục dữ liệu?
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: dữ liệu bền ở volume, mount phải khớp, backup phải thử restore](/slides/img/s12-recap.svg)

Buổi sau: [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md) gom mọi thứ vào một file.
