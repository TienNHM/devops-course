# Kịch bản mentor – Buổi 12 Persistent Storage

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 12 – Persistent Storage](../../labs/week-06/session-12.md). Barem và lỗi hay bị trừ điểm: [Chấm điểm tuần 6](../grading/week-06.md). Đáp án: [Walkthrough tuần 6](../walkthroughs/week-06.md).
:::

Tuần 6/16 · Giai đoạn 2 – Containerization · Buổi 12/32 · Slide: [Slide buổi 12](../../slides/02-docker/session-12.md)

## Khung thời gian buổi (120 phút)

| Phút | Hoạt động |
| --- | --- |
| 15 | Ôn tập Buổi 11 (network, DNS, `-p`) và khởi động |
| 30 | Kiến thức và demo (phần dưới, demo khoảng 12 phút) |
| 60 | Học viên thực hành lab (Phần 1 đến 4 là bắt buộc, Phần 5 là backup) |
| 15 | Review: thử thách cuối buổi, nhắc nộp bài |

Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Gợi ý chia thời gian cho slide: mục tiêu 2', vấn đề 2', writable layer 2', ba loại mount 3', cú pháp `--mount` 2', Postgres lưu ở đâu 3', kiến trúc 2', vòng đời từng bước 2', demo 1 (3'), demo 2 (3'), demo 3 (2'), lab Phần 1 8', Phần 2 và 3 10', inspect 4', backup 12', Compose 10', lỗi thường gặp 2', debug tình huống 04 (6' + 5'), thử thách cuối buổi 4', recap 2'.

## Demo của mentor

Thời lượng gợi ý: 12 phút. Mentor chiếu màn hình, lớp gõ theo ở phần lab.

**Bước 1. Mất dữ liệu khi không có volume (container đơn giản).**

```bash
docker run -d --name demo-tmp alpine:3.20 sleep 600
docker exec demo-tmp sh -c 'echo "du lieu quan trong" > /note.txt && cat /note.txt'
docker rm -f demo-tmp
docker run -d --name demo-tmp alpine:3.20 sleep 600
docker exec demo-tmp cat /note.txt
```

Kết quả mong đợi: lần đọc cuối báo `cat: can't open '/note.txt': No such file or directory`.

Câu hỏi cho lớp: file đó đã nằm ở đâu và tại sao biến mất? (Trả lời: writable layer của container cũ.)

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

Câu hỏi cho lớp: container đã bị xóa, vậy ai đang giữ file? (Trả lời: volume `demo-vol`.)

**Bước 3. Xem volume và dọn dẹp.**

```bash
docker volume ls
docker volume inspect demo-vol --format '{{.Name}} {{.Driver}} {{.Mountpoint}}'
docker volume rm demo-vol
```

Kết quả mong đợi: `demo-vol local /var/lib/docker/volumes/demo-vol/_data`. Đường dẫn này nằm trong máy ảo của Docker Desktop.

**Bước 4. tmpfs.**

```bash
docker run --rm --mount type=tmpfs,target=/scratch alpine:3.20 sh -c 'df -h /scratch | tail -1; echo hi > /scratch/a; cat /scratch/a'
```

Kết quả mong đợi: dòng `df` có filesystem `tmpfs` gắn tại `/scratch`, sau đó in `hi`. Dừng container thì dữ liệu mất.

Câu hỏi cuối demo: nếu `docker compose down -v` chạy nhầm trên môi trường thật, cách nào cứu được dữ liệu? (Dẫn vào backup.)

## Câu hỏi mentor nên hỏi lớp

- "Dữ liệu 30 người đó đã đi đâu?" Dẫn vào writable layer (slide 2).
- Hỏi lớp chọn loại mount cho: database, thư mục code khi dev, token tạm. Đáp: named volume, bind mount, tmpfs.
- "Đổi `POSTGRES_PASSWORD` trên volume đã có dữ liệu thì sao?" Đáp: không có tác dụng.
- "File đó đã nằm ở đâu và tại sao biến mất?" Đáp: writable layer của container cũ.
- "Container đã bị xóa, ai đang giữ file?" Đáp: volume `demo-vol`.
- "Nếu chạy nhầm `docker compose down -v` trên môi trường thật, cứu dữ liệu bằng cách nào?" Dẫn vào `pg_dump`.
- Thử thách cuối buổi (slide 20), đáp án: `down` giữ volume, `down -v` xóa; so đích mount với `SHOW data_directory;`; dump nhất quán và restore được sang phiên bản khác; bind mount dưới `/mnt/c` chậm và dễ lỗi quyền, dùng named volume.

## Ghi chú giảng viên theo từng slide

Nguyên văn từ slide buổi 12 (đã chuyển ra khỏi slide).

1. Mục tiêu buổi học (2 phút): phần 1 đến 4 là L1, phần 5 và 6 là L2.
2. Vấn đề thực tế (2 phút): câu hỏi: "Dữ liệu 30 người đó đã đi đâu?" Dẫn vào writable layer.
3. Writable layer (2 phút): liên hệ buổi 10: layer bất biến, writable layer là lớp mỏng trên cùng.
4. Ba loại mount (3 phút): hỏi lớp chọn loại mount cho: database, thư mục code khi dev, token tạm.
5. Cú pháp --mount (2 phút): nhấn mạnh rủi ro gõ nhầm đường dẫn với `-v`.
6. Postgres lưu dữ liệu ở đâu (3 phút): đây là kiến thức nền cho tình huống 04. Hỏi: "Đổi POSTGRES_PASSWORD trên volume đã có dữ liệu thì sao?" Đáp: không có tác dụng.
7. Kiến trúc (2 phút): chỉ vào writable layer bị xóa, còn volume vẫn đó và được gắn lại vào container mới.
8. Vòng đời dữ liệu từng bước (2 phút): đừng tìm file volume trong `/var/lib/docker` của Ubuntu; dùng `docker volume inspect` và `docker run` để xem.
9. Demo 1 (3 phút): đáp: writable layer của container cũ.
10. Demo 2 (3 phút): dọn: `docker volume rm demo-vol`. Có thể cho xem `docker volume inspect demo-vol`; Mountpoint nằm trong máy ảo Docker Desktop.
11. Demo 3, tmpfs (2 phút): dẫn vào backup bằng pg_dump.
12. Hands-on L1, Postgres với named volume (8 phút): mật khẩu lab là giá trị giả, không dùng mật khẩu thật. Vài giây đầu có thể thấy `no response`, bình thường.
13. Hands-on L1, tạo dữ liệu, xóa và tạo lại (10 phút): bản lab đầy đủ tạo bảng giống `init.sql` (có email, created_at); slide rút gọn để dễ chiếu. Khoảnh khắc "wow": container đã bị xóa mà dữ liệu còn.
14. Hands-on L1, kiểm chứng bằng inspect (4 phút): nhấn mạnh: học viên sẽ dùng lại đúng phép kiểm tra này để debug tình huống 04.
15. Hands-on L2, backup và restore bằng pg_dump (12 phút): nhắc: trước bước xóa phải có container `pg-lab` đang chạy với dữ liệu (theo lab, tạo container ở bước 5.1). Thiếu `-i` thì restore trống mà không báo lỗi.
16. Hands-on L2, Compose, down và down -v (10 phút): mật khẩu đặt trong `.env`, không commit. `down` xóa container và network, giữ volume; `down -v` xóa thêm named volume khai báo trong file.
17. Lỗi thường gặp (2 phút): nhắc thêm: `init.sql` chỉ chạy khi data directory trống nên sửa file không chạy lại.
18. Debug, có volume nhưng vẫn mất dữ liệu (6 phút): mentor chạy `bash setup.sh` trong thư mục tình huống. Cho học viên 5 phút tự điều tra trước khi sang slide sau. Dọn: `bash cleanup.sh`.
19. Điều tra và nguyên nhân gốc (5 phút): nếu chưa chạy `down`, `pg_dump` ngay từ container đang chạy để cứu dữ liệu; sau `down` dữ liệu đã mất cùng container. Cùng họ lỗi: gõ sai đích mount như `/var/lib/postgres/data`.
20. Thử thách cuối buổi (4 phút): đáp án: down giữ volume, down -v xóa; so đích mount với `SHOW data_directory;`; dump nhất quán, restore được sang phiên bản khác; chậm và dễ lỗi quyền, dùng named volume.
21. Recap (2 phút): nhắc dọn lab và nộp `lab-12/`, không commit `.env` hay mật khẩu.

## Lưu ý riêng cho người dạy

- Tình huống 04: mã nguồn dựng sẵn ở `examples/troubleshooting/scenario-04/`; mentor chạy `bash setup.sh` ở thư mục đó. Học viên chỉ nhận triệu chứng: sau `docker compose down` rồi `docker compose up -d --wait`, `SELECT` báo `ERROR: relation "members" does not exist` trong khi `docker volume ls` vẫn có volume `ts04_ts04-pgdata`. Cấu hình lệch nằm trong file compose của tình huống:

```yaml
    environment:
      PGDATA: /var/lib/postgresql/pgdata
    volumes:
      - ts04-pgdata:/var/lib/postgresql/data
```

  Nhìn qua mọi thứ đều "đúng": đích mount là đường dẫn chuẩn và volume có thật. Lời giải đầy đủ (cây điều tra, nguyên nhân gốc, cách sửa) nằm trong [Walkthrough tuần 6](../walkthroughs/week-06.md). Dọn dẹp bằng `bash cleanup.sh` trong thư mục tình huống.
- Bước `docker diff <container> | grep pgdata | head` cần có `grep`: không có `grep`, mấy dòng đầu chỉ là socket trong `/run`, dễ kết luận sai.
- Từ Postgres 18, image chính thức đổi cách bố trí (`PGDATA` có thư mục theo phiên bản, điểm mount khuyến nghị là `/var/lib/postgresql`). Bài này ghim `postgres:17-alpine`; nếu học viên tự nâng phiên bản, nhắc đọc lại hướng dẫn trên Docker Hub.
- Trên Docker Desktop, volume nằm bên trong máy ảo của Docker Desktop, không phải trong thư mục WSL của học viên.
- Phần 5 (backup) cần container `pg-lab` đang chạy với dữ liệu trước khi xóa volume. Nhắc học viên không quên `-i` ở `docker exec -i` khi restore.
