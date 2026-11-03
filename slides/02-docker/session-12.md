# Slide Ngày 07 – Postgres giữ dữ liệu bằng volume

> **Tóm tắt:** Chạy Postgres của Club với named volume, nạp `database/init.sql`, chứng minh dữ liệu còn sau `docker rm` và làm một bản backup bằng `pg_dump`.

Bài học: [Ngày 7 – Postgres giữ dữ liệu bằng volume](../../labs/week-06/session-12.md)

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: dữ liệu bền, chọn đúng mount, backup và restore](/slides/img/s12-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Việc chính hôm nay: Postgres của Club có volume, dữ liệu còn sau `docker rm`, có backup đã thử restore.
- Hỏi: ai từng mất dữ liệu vì xóa nhầm?
:::

---

## Slide 2: Cập nhật image xong, bảng trống

![Xóa container cũ chạy container mới, bảng members trống không báo lỗi](/slides/img/s12-problem.svg)

::: details Ghi chú cho mentor
- Một bạn nhập 30 người đăng ký; hôm sau cập nhật image: xóa container cũ, chạy container mới.
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
- Hôm nay dùng hai loại: named volume cho dữ liệu Postgres, bind mount để đưa `init.sql` vào. tmpfs chỉ nhắc tên.
- Giáo trình dùng `--mount` vì tường minh; `-v host:container` âm thầm tạo thư mục rỗng nếu gõ nhầm đường dẫn.
:::

---

## Slide 5: Điểm mount phải trùng nơi Postgres ghi

![Mount đúng ghi vào volume; mount sai khiến Postgres ghi vào writable layer](/slides/img/s12-pgpath.svg)

::: details Ghi chú cho mentor
- Dữ liệu nằm ở `/var/lib/postgresql/data`. Không gắn gì: Docker tạo anonymous volume tên hex, container mới tạo cái mới nên trông như mất dữ liệu.
- `init.sql` và `POSTGRES_*` chỉ có tác dụng khi thư mục dữ liệu trống. Bài này ghim `postgres:17-alpine`; từ Postgres 18 cách bố trí đổi.
:::

---

## Slide 6: Xóa container, volume giữ dữ liệu

![club-db bị xóa, container mới gắn lại volume và thấy đủ dữ liệu](/slides/img/s12-lifecycle.svg)

::: details Ghi chú cho mentor
- Trình tự: run `club-db` với volume và `init.sql`, INSERT Carol, `rm -f`, run `club-db2` cùng volume, SELECT vẫn thấy Carol. Tên container trong hình là ví dụ minh họa.
- Trên Docker Desktop, volume nằm trong máy ảo của Docker, không phải thư mục WSL.
:::

---

## Slide 7: Lab: các bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Postgres với volume `club-pgdata` và `init.sql` | `SELECT` ra Alice, Bob |
| 3 | Thêm Carol, `rm -f`, tạo container mới | Carol còn, log `Skipping initialization` |
| 4 | `docker inspect` và `SHOW data_directory;` | Hai đường dẫn trùng |
| 5-6 | `pg_dump`, xóa volume, restore | `SELECT` thấy lại Carol |

Lệnh đầy đủ: [Ngày 7 – Postgres giữ dữ liệu bằng volume](../../labs/week-06/session-12.md).

::: details Ghi chú cho mentor
- Chỉ xóa đúng volume `club-pgdata`, không dùng `docker volume prune` trên máy có dự án khác.
- Mật khẩu `PGPASS` là giá trị giả chỉ cho lab. Thử thách thêm: [Thử thách thêm](../../labs/week-06/session-12-challenge.md).
:::

---

## Slide 8: Backup và restore bằng pg_dump

![pg_dump ra backup.sql, volume bị xóa, psql nạp lại vào DB mới](/slides/img/s12-backup.svg)

::: details Ghi chú cho mentor
- `pg_dump` nhất quán khi database đang chạy, đọc được bằng mắt, restore được sang phiên bản khác.
- Restore: `docker exec -i club-db3 psql ... < notes/day-07-backup.sql`; thiếu `-i` thì restore trống mà không báo lỗi.
- Backup chưa thử restore thì chưa phải backup.
:::

---

## Slide 9: Debug: có volume nhưng vẫn mất dữ liệu

![docker inspect cho thấy mount một nơi, data_directory ở nơi khác](/slides/img/s12-debug.svg)

::: details Ghi chú cho mentor
- Triệu chứng: tạo lại container, `SELECT` báo `relation "members" does not exist`; `docker volume ls` vẫn thấy volume. Đường dẫn trong hình là ví dụ minh họa.
- Điều tra: `data_directory` so với đích mount trong `docker inspect`.
- Nguyên nhân gốc: điểm mount và nơi Postgres ghi không trùng. Phòng tránh: kiểm tra recreate ngay ngày đầu, có backup và thử restore.
:::

---

## Slide 10: Recap

![Ba điều cần nhớ: dữ liệu bền ở volume, mount phải khớp, backup phải thử restore](/slides/img/s12-recap.svg)

Ngày tiếp theo: [Ngày 8 – Docker Compose chạy cả Club](../../labs/week-07/session-13.md) gom mọi thứ vào một file.

---

## Slide 11: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Volumes](https://docs.docker.com/engine/storage/volumes/): giữ dữ liệu khi container bị xóa.
- **Tài liệu chính thức:** [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/): gắn thư mục máy thật vào container.
- **Tài liệu chính thức:** [PostgreSQL: Backup and Restore](https://www.postgresql.org/docs/17/backup-dump.html): sao lưu database bằng pg_dump.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): dùng mount an toàn, tránh lộ dữ liệu.
- **Best practice:** [The Twelve-Factor App: Backing services](https://12factor.net/backing-services): coi database là tài nguyên gắn ngoài.
