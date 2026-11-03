# Ngày 5 – Vận hành và sửa lỗi container

Lộ trình Cơ bản · Ngày 5/10 · khoảng 2 giờ

[Slide Ngày 5](../../slides/02-docker/session-08.md) · [Thử thách thêm](session-08-challenge.md)

> **Tóm tắt:** Dùng `ps`, `logs`, `exec`, `inspect`, `stop`, `rm` để vận hành container của dự án Club, rồi tự sửa hai container hỏng: một container thoát ngay và một container sai cổng.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** bạn điều khiển được container web của Club bằng 6 lệnh cốt lõi, và sửa được hai container hỏng bằng cách đọc log và cấu hình thay vì đoán. File `notes/day-05.md` ghi lại hai lỗi đó.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 4](session-07.md): Docker Desktop chạy, trang Club chạy được từ container Nginx.
- [ ] Terminal WSL Ubuntu, đứng trong `~/devops-labs` (không dùng `/mnt/c`).
:::

## Bài toán thật

Một thành viên CLB gửi bạn lệnh "chạy thử cho nhanh" rồi báo: "máy mình chạy được, máy bạn thì không". Bạn chạy lệnh, không thấy lỗi nhưng `docker ps` trống. Lần khác container báo `Up` mà trang web vẫn không mở được. Hôm nay bạn học cách hỏi container ba câu: nó có đang chạy không, nó đang in ra gì, cấu hình thật của nó là gì.

## Làm

Mọi container hôm nay có tên bắt đầu bằng `club-`. Dọn container cũ của Ngày 4 trước để khỏi trùng tên và trùng cổng:

```bash
cd ~/devops-labs
docker rm -f club-web 2>/dev/null
docker ps -a
```

Kết quả mong đợi: danh sách không còn `club-web` (có thể rỗng).

### Bước 1. Chạy web Club và nhìn vào bên trong

Bạn chạy lại container web của Ngày 4, lần này dùng thêm các lệnh để quan sát nó.

```bash
docker run -d --name club-web -p 8080:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080
```

Kết quả mong đợi: `docker ps` có dòng `club-web ... Up ... 0.0.0.0:8080->80/tcp` và `curl` in `200`. Số `8080:80` đọc là `cổng-máy-bạn:cổng-trong-container`.

Xem log. Mở terminal WSL thứ hai và chạy `curl -s http://localhost:8080 > /dev/null` vài lần, rồi quay lại terminal đầu:

```bash
docker logs --tail 5 club-web
```

Kết quả mong đợi: các dòng `GET / HTTP/1.1" 200`. Muốn xem log chạy trực tiếp, thêm `-f` và nhấn Ctrl+C để thoát (container vẫn chạy).

Vào trong container bằng `exec`:

```bash
docker exec -it club-web sh
```

Trong shell của container chạy:

```sh
ls /usr/share/nginx/html
ps
exit
```

Kết quả mong đợi: thấy `index.html` của Club và dòng `nginx: master process` ở PID 1. Thoát shell không làm container dừng.

Soi cấu hình thật bằng `inspect` (dùng `--format` để chỉ lấy dòng cần):

```bash
docker inspect --format 'status={{.State.Status}} started={{.State.StartedAt}}' club-web
```

::: tip Kiểm tra: bạn đúng khi
`curl` trả `200`, `docker logs` có dòng `GET` của chính bạn, `ps` trong container cho thấy Nginx là PID 1 và `inspect` in `status=running`.
:::

### Bước 2. Dừng, chạy lại, xóa

`stop` chỉ tắt container, `rm` mới xóa hẳn. Hãy xem sự khác nhau:

```bash
docker stop club-web
docker ps
docker ps -a --filter name=club-web --format '{{.Names}}  {{.Status}}'
docker inspect --format 'exit={{.State.ExitCode}}' club-web
```

Kết quả mong đợi: `docker ps` không còn `club-web`; `docker ps -a` hiện `Exited (0) ... ago`; `exit=0`. ExitCode `0` nghĩa là thoát êm; khác `0` là có lỗi.

```bash
docker start club-web
docker rm club-web
docker rm -f club-web
docker ps -a --filter name=club-web
```

Kết quả mong đợi: lệnh `docker rm` đầu báo lỗi `cannot remove container ... container is running` (cố ý: Docker không cho xóa container đang chạy). `docker rm -f` dừng và xóa, danh sách cuối chỉ còn dòng tiêu đề.

::: tip Kiểm tra: bạn đúng khi
Bạn thấy `Exited (0)` sau `stop`, thấy lỗi của `docker rm` trên container đang chạy, và `club-web` biến mất sau `docker rm -f`.
:::

### Bước 3. Container hỏng số 1: chạy xong là chết

Database của Club là PostgreSQL. Bạn chạy nó mà chưa cấu hình gì:

```bash
docker run -d --name club-db-bad postgres:17-alpine
docker ps
```

Kết quả mong đợi: `docker ps` không thấy `club-db-bad`. Container đã thoát, và `docker ps` chỉ liệt kê container đang chạy. Điều tra theo đúng thứ tự: `ps -a`, `logs`, `inspect`.

```bash
docker ps -a --filter name=club-db-bad
docker logs club-db-bad 2>&1 | head -4
docker inspect --format 'exit={{.State.ExitCode}}' club-db-bad
```

Kết quả mong đợi: trạng thái `Exited (1)`, `exit=1`, và log có dòng `Error: Database is uninitialized and superuser password is not specified.` Nguyên nhân đọc thẳng từ log: image từ chối khởi động khi thiếu biến `POSTGRES_PASSWORD`.

Sửa: xóa container hỏng, chạy lại với biến môi trường (`-e`):

```bash
docker rm club-db-bad
docker run -d --name club-db -e POSTGRES_PASSWORD=lab_only_password -e POSTGRES_DB=clubdb postgres:17-alpine
until [ "$(docker logs club-db 2>&1 | grep -c 'ready to accept connections')" -ge 2 ]; do sleep 1; done
docker exec club-db pg_isready -U postgres
```

Kết quả mong đợi: `/var/run/postgresql:5432 - accepting connections`. Vòng `until` đợi dòng `ready to accept connections` hai lần vì Postgres khởi động một server tạm trước rồi mới chạy server thật. Mật khẩu này chỉ để học, không phải mật khẩu thật.

::: danger Không dán nguyên output docker inspect
`docker inspect` hiển thị cả biến chứa mật khẩu. Luôn lọc bằng `--format` hoặc `grep` trước khi dán vào note hay gửi cho người khác.
:::

Dọn dẹp: `docker rm -f club-db`.

::: tip Kiểm tra: bạn đúng khi
Bạn đã thấy `Exited (1)` kèm dòng lỗi của log, và sau khi sửa thì `pg_isready` báo `accepting connections`.
:::

### Bước 4. Container hỏng số 2: `Up` nhưng không truy cập được

Lần này bạn nối nhầm cổng: Nginx nghe cổng 80 trong container, nhưng bạn viết `8081:8080`.

```bash
docker run -d --name club-web-bad -p 8081:8080 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps --filter name=club-web-bad --format '{{.Names}}  {{.Status}}  {{.Ports}}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

Kết quả mong đợi: container `Up` với `0.0.0.0:8081->8080/tcp`, nhưng `curl` báo `Empty reply from server` hoặc `Connection reset by peer` (hoặc in `000`). Container sống mà dịch vụ không trả lời. Tìm cổng Nginx thật sự nghe:

```bash
docker logs club-web-bad 2>&1 | tail -3
docker exec club-web-bad netstat -ltn
```

Kết quả mong đợi: `netstat` cho thấy `0.0.0.0:80` đang `LISTEN`, không có cổng `8080`. Vậy phải nối cổng máy bạn vào cổng 80. Sửa:

```bash
docker rm -f club-web-bad
docker run -d --name club-web-bad -p 8081:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

Kết quả mong đợi: `200`. Dọn dẹp: `docker rm -f club-web-bad`.

::: tip Kiểm tra: bạn đúng khi
Bạn giải thích được vì sao `8081:8080` hỏng còn `8081:80` chạy, và `docker ps -a` không còn container `club-*` nào.
:::

### Bước 5. Ghi note và commit

Tạo `notes/day-05.md` trong `~/devops-labs`, viết bằng editor bạn thích (ví dụ `code notes/day-05.md`). Nội dung gồm: output `docker ps -a` có `Exited (1)` của container số 1, dòng log báo lỗi, và 2-3 câu trả lời: nguyên nhân của mỗi lỗi, bạn sửa bằng lệnh nào.

Đẩy lên GitHub như Ngày 3 (nhánh, commit, PR, merge):

```bash
cd ~/devops-labs
git switch main && git pull
git switch -c day-05-notes
git add notes/day-05.md
git commit -m "Add day 5 notes"
git push -u origin day-05-notes
```

Mở Pull Request trên GitHub rồi merge.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy hoặc chưa bật WSL integration | Mở Docker Desktop, bật WSL integration cho Ubuntu (Settings, Resources, WSL integration) |
| `port is already allocated` | Cổng máy bạn đã có container hoặc tiến trình khác giữ | `docker ps --filter publish=8080`; dừng container cũ hoặc đổi cổng máy (ví dụ `-p 8082:80`) |
| `container name is already in use` | Tên trùng với container cũ, kể cả container đã dừng | `docker rm -f tên-container` rồi chạy lại |
| `docker ps` trống dù vừa `run -d` | Container đã thoát | `docker ps -a`, `docker logs`, `docker inspect --format 'exit={{.State.ExitCode}}'` |
| Terminal bị chiếm sau `docker run` | Quên `-d` nên container chạy ở foreground | Ctrl+C rồi chạy lại với `-d` |
| `psql` hoặc `pg_isready` lỗi ngay sau khi Postgres chạy | Postgres mới có một dòng `ready to accept connections` | Đợi dòng đó xuất hiện hai lần (vòng `until` ở Bước 3) |

## Nộp bài

- [ ] `notes/day-05.md` có output `docker ps -a` với `Exited (1)` và dòng log lỗi của Postgres.
- [ ] `notes/day-05.md` giải thích nguyên nhân và cách sửa của cả hai container hỏng (thiếu `POSTGRES_PASSWORD`, nối nhầm cổng).
- [ ] File note đã được merge vào `main` của `devops-labs` bằng Pull Request.
- [ ] Không còn container `club-*` nào (`docker ps -a --filter name=club-`); note không chứa secret.

## Tự kiểm tra

1. Khác nhau giữa `docker stop` và `docker rm -f` là gì?

::: details Đáp án gợi ý
`docker stop` dừng container nhưng container còn trên đĩa (xem bằng `docker ps -a`, log vẫn còn). `docker rm -f` buộc dừng rồi xóa hẳn container, log mất theo.
:::

2. `docker run -d -p 9000:80 nginx:1.27-alpine` mở cổng nào trên máy bạn, Nginx nghe cổng nào trong container?

::: details Đáp án gợi ý
Cổng 9000 trên máy bạn; Nginx nghe cổng 80 trong container. Định dạng luôn là `máy:container`.
:::

3. Bạn chạy `docker run -d --name api club-api:1.0.0` nhưng `docker ps` trống. Ba lệnh tiếp theo là gì?

::: details Đáp án gợi ý
`docker ps -a` để xem trạng thái và ExitCode; `docker logs api` để đọc lỗi; `docker inspect api` nếu log chưa rõ (xem `State`, `Config.Cmd`, `Config.Env`).
:::

## Tiếp theo

[Ngày 6 – Dockerfile cho Club API](../week-05/session-09.md)

::: details Tài liệu tham khảo
- [docker run – Docker CLI reference](https://docs.docker.com/reference/cli/docker/container/run/)
- [docker inspect](https://docs.docker.com/reference/cli/docker/inspect/)
- [View container logs](https://docs.docker.com/engine/logging/)
- Thêm bài luyện ở [trang thử thách](session-08-challenge.md).
:::
