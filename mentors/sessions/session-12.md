# Kịch bản buổi 12: Persistent Storage

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md). Slide: [Slide buổi 12](../../slides/02-docker/session-12.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 6](../grading/week-06.md). Đáp án: [Đáp án tuần 6](../walkthroughs/week-06.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 12 trong 120 phút: khung thời gian, demo 4 bước (không volume, có volume, xem volume, tmpfs), câu hỏi cho lớp, ghi chú theo 14 slide và cách chạy tình huống 04.

## Khung thời gian buổi 120 phút

| Phút | Hoạt động |
| --- | --- |
| 15 | Ôn tập Buổi 11 (network, DNS, `-p`) và khởi động |
| 30 | Kiến thức và demo: Slide 1 đến 8 (demo khoảng 12 phút) |
| 60 | Học viên làm lab L1 (Chuẩn bị và Phần 1 đến 6), Slide 9 |
| 15 | Review: Slide 11 đến 14, thử thách cuối buổi, nhắc nộp bài |

Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm. Phân bổ thời gian lab gợi ý: Chuẩn bị 5 phút, Phần 1 10 phút, Phần 2 5 phút, Phần 3 10 phút, Phần 4 5 phút, Phần 5 15 phút, Phần 6 10 phút.

Phần 1 đến 5 là L1 bắt buộc; Compose với `down` và `down -v` (Slide 10), backup mức volume và tình huống 04 thuộc [Buổi 12 – thử thách thêm](../../labs/week-06/session-12-challenge.md).

## Kịch bản demo (Slide 8)

Thời lượng gợi ý: 12 phút. Mentor chiếu màn hình, lớp gõ theo ở phần lab.

**Bước 1. Mất dữ liệu khi không có volume.**

```bash
docker run -d --name demo-tmp alpine:3.20 sleep 600
docker exec demo-tmp sh -c 'echo "du lieu quan trong" > /note.txt && cat /note.txt'
docker rm -f demo-tmp
docker run -d --name demo-tmp alpine:3.20 sleep 600
docker exec demo-tmp cat /note.txt
```

Kết quả mong đợi: lần đọc cuối báo `cat: can't open '/note.txt': No such file or directory`.

Câu hỏi cho lớp: file đó đã nằm ở đâu và tại sao biến mất? Đáp: writable layer của container cũ.

**Bước 2. Cùng thao tác nhưng có volume.**

```bash
docker rm -f demo-tmp
docker volume create demo-vol
docker run -d --name demo-tmp --mount type=volume,source=demo-vol,target=/data alpine:3.20 sleep 600
docker exec demo-tmp sh -c 'echo "du lieu quan trong" > /data/note.txt'
docker rm -f demo-tmp
docker run --rm --mount type=volume,source=demo-vol,target=/data alpine:3.20 cat /data/note.txt
```

Kết quả mong đợi: in ra `du lieu quan trong`.

Câu hỏi cho lớp: container đã bị xóa, vậy ai đang giữ file? Đáp: volume `demo-vol`.

**Bước 3. Xem volume và dọn dẹp.**

```bash
docker volume ls
docker volume inspect demo-vol --format '{{.Name}} {{.Driver}} {{.Mountpoint}}'
docker volume rm demo-vol
```

Kết quả mong đợi: `demo-vol local /var/lib/docker/volumes/demo-vol/_data`. Đường dẫn này nằm trong máy ảo của Docker Desktop, không phải trong thư mục WSL của học viên.

**Bước 4. tmpfs.**

```bash
docker run --rm --mount type=tmpfs,target=/scratch alpine:3.20 sh -c 'df -h /scratch | tail -1; echo hi > /scratch/a; cat /scratch/a'
```

Kết quả mong đợi: dòng `df` có filesystem `tmpfs` gắn tại `/scratch`, sau đó in `hi`. Dừng container thì dữ liệu mất.

Câu hỏi cuối demo: nếu `docker compose down -v` chạy nhầm trên môi trường thật, cách nào cứu được dữ liệu? Dẫn vào backup bằng `pg_dump`.

## Câu hỏi cho lớp

- "Dữ liệu 30 người đó đã đi đâu?" Dẫn vào writable layer (Slide 2).
- Chọn loại mount cho: database, thư mục code khi dev, token tạm. Đáp: named volume, bind mount, tmpfs (Slide 4).
- "Đổi `POSTGRES_PASSWORD` trên volume đã có dữ liệu thì sao?" Đáp: không có tác dụng (Slide 5).
- "File đó đã nằm ở đâu và tại sao biến mất?" Đáp: writable layer của container cũ (Slide 8).
- "Container đã bị xóa, ai đang giữ file?" Đáp: volume `demo-vol` (Slide 8).
- "Nếu chạy nhầm `docker compose down -v` trên môi trường thật, cứu dữ liệu bằng cách nào?" Dẫn vào `pg_dump`.
- Thử thách cuối buổi (Slide 13), đáp án: `down` giữ volume, `down -v` xóa; so đích mount với `SHOW data_directory;`; dump nhất quán và restore được sang phiên bản khác; bind mount dưới `/mnt/c` chậm và dễ lỗi quyền, dùng named volume.

## Ghi chú theo slide

Slide buổi 12 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

1. **Mục tiêu buổi học (2 phút).** Lab L1 gồm Phần 1 đến 5 (Phần 6 gom bằng chứng); Compose và tình huống 04 là thử thách thêm.
2. **Vấn đề thực tế (2 phút).** Hỏi: "Dữ liệu 30 người đó đã đi đâu?" Dẫn vào writable layer.
3. **Writable layer (2 phút).** Liên hệ Buổi 10: layer bất biến, writable layer là lớp mỏng trên cùng.
4. **Ba loại mount (3 phút).** Hỏi lớp chọn loại mount cho database, code khi dev, token tạm. Nhấn mạnh rủi ro gõ nhầm đường dẫn với `-v`; giáo trình dùng `--mount`.
5. **Postgres lưu dữ liệu ở đâu (4 phút).** Đây là kiến thức nền cho tình huống 04. Hỏi: "Đổi `POSTGRES_PASSWORD` trên volume đã có dữ liệu thì sao?" Đáp: không có tác dụng. Nhắc: bài này ghim `postgres:17-alpine`; từ Postgres 18 cách bố trí đổi.
6. **Kiến trúc (2 phút).** Chỉ vào writable layer bị xóa, còn volume vẫn đó và được gắn lại vào container mới.
7. **Vòng đời dữ liệu từng bước (2 phút).** Đừng tìm file volume trong `/var/lib/docker` của Ubuntu; dùng `docker volume inspect` và `docker run` để xem.
8. **Demo: không volume, có volume, tmpfs (12 phút).** Chạy demo 4 bước ở trên; kết thúc bằng câu hỏi dẫn vào backup.
9. **Lab L1 (60 phút).** Điểm cần nhấn ở từng phần:
    - Phần 1 và 2: mật khẩu lab là giá trị giả. Vài giây đầu có thể thấy `no response`, bình thường. Bản lab tạo bảng giống `init.sql` (có email, `created_at`); slide rút gọn để dễ chiếu. Bài nộp dùng dữ liệu giả của riêng học viên.
    - Phần 3: khoảnh khắc "wow": container đã bị xóa mà dữ liệu còn; log có `Skipping initialization`.
    - Phần 4: nhấn mạnh học viên sẽ dùng lại đúng phép kiểm tra `docker inspect` so với `SHOW data_directory;` để debug tình huống 04.
    - Phần 5: trước bước xóa phải có container `pg-lab` đang chạy với dữ liệu (tạo ở bước 1 của Phần 5). Thiếu `-i` thì restore trống mà không báo lỗi. Chỉ xóa đúng volume `pg-data`.
    - Phần 6: gom evidence và dọn dẹp.
10. **Compose: `down` và `down -v` (thuộc thử thách thêm).** `down` xóa container và network, giữ volume; `down -v` xóa thêm named volume khai báo trong file. Mật khẩu đặt trong `.env`, không commit.
11. **Lỗi thường gặp (2 phút).** Nhắc thêm: `init.sql` chỉ chạy khi data directory trống nên sửa file không chạy lại.
12. **Debug: có volume nhưng vẫn mất dữ liệu (11 phút).** Mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-04/`. Cho học viên 5 phút tự điều tra trước khi lộ nguyên nhân. Nếu chưa chạy `down`, `pg_dump` ngay từ container đang chạy để cứu dữ liệu; sau `down` dữ liệu đã mất cùng container. Cùng họ lỗi: gõ sai đích mount như `/var/lib/postgres/data`. Dọn: `bash cleanup.sh`.
13. **Thử thách cuối buổi (4 phút).** Đáp án ở mục Câu hỏi cho lớp.
14. **Recap (2 phút).** Nhắc dọn lab và nộp `lab-12/`, không commit `.env` hay mật khẩu. Buổi sau: Docker Compose.

## Lưu ý riêng cho người dạy

- Tình huống 04: mã nguồn dựng sẵn ở `examples/troubleshooting/scenario-04/`; mentor chạy `bash setup.sh` ở thư mục đó. Học viên chỉ nhận triệu chứng: sau `docker compose down` rồi `docker compose up -d --wait`, `SELECT` báo `ERROR: relation "members" does not exist` trong khi `docker volume ls` vẫn có volume `ts04_ts04-pgdata`. Cấu hình lệch nằm trong file compose của tình huống:

```yaml
    environment:
      PGDATA: /var/lib/postgresql/pgdata
    volumes:
      - ts04-pgdata:/var/lib/postgresql/data
```

  Nhìn qua mọi thứ đều "đúng": đích mount là đường dẫn chuẩn và volume có thật. Lời giải đầy đủ (cây điều tra, nguyên nhân gốc, cách sửa) nằm trong [Đáp án tuần 6](../walkthroughs/week-06.md). Dọn dẹp bằng `bash cleanup.sh` trong thư mục tình huống.
- Bước `docker diff <container> | grep pgdata | head` cần có `grep`: không có `grep`, mấy dòng đầu chỉ là socket trong `/run`, dễ kết luận sai.
- Từ Postgres 18, image chính thức đổi cách bố trí (`PGDATA` có thư mục theo phiên bản, điểm mount khuyến nghị là `/var/lib/postgresql`). Bài này ghim `postgres:17-alpine`; nếu học viên tự nâng phiên bản, nhắc đọc lại hướng dẫn trên Docker Hub.
- Trên Docker Desktop, volume nằm bên trong máy ảo của Docker Desktop, không phải trong thư mục WSL của học viên.
- Phần 5 (backup) cần container `pg-lab` đang chạy với dữ liệu trước khi xóa volume. Nhắc học viên không quên `-i` ở `docker exec -i` khi restore.
