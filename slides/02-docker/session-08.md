# Slide Ngày 05 – Vận hành và sửa lỗi container

> **Tóm tắt:** Dùng `ps`, `logs`, `exec`, `inspect`, `stop`, `rm` để vận hành container của dự án Club, rồi tự sửa hai container hỏng: một container thoát ngay và một container sai cổng.

## Slide 1: Hôm nay bạn làm ra gì

![Ba mục tiêu: vòng đời, quan sát, chẩn đoán](/slides/img/s08-goals.svg)

- Sản phẩm: điều khiển web Club bằng 6 lệnh và sửa 2 container hỏng bằng cách đọc log.
- Cần có: xong [Ngày 4](session-07.md), Docker Desktop đang chạy, terminal WSL trong `~/devops-labs`.
- Thời gian: 15 phút xem, 85 phút làm, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Chốt sản phẩm: 6 lệnh cốt lõi và hai container hỏng được sửa bằng cách đọc log, không đoán.
- Hỏi: ai từng gõ `docker run` rồi không biết nó đang ở đâu?
:::

---

## Slide 2: Bài toán thật: chạy rồi mà không thấy gì

![docker ps trống sau docker run -d, ba câu hỏi chưa có đáp án](/slides/img/s08-no-visibility.svg)

::: details Ghi chú cho mentor
- Tình huống thật: bạn của CLB gửi lệnh "chạy thử cho nhanh", `docker ps` trống; hoặc container `Up` mà trang web không mở được.
- Hôm nay học hỏi container ba câu: có đang chạy không, đang in ra gì, cấu hình thật là gì.
:::

---

## Slide 3: Vòng đời container

![Created, Running, Exited, Removed và các lệnh chuyển trạng thái](/slides/img/s08-lifecycle.svg)

::: details Ghi chú cho mentor
- Container sống chừng nào tiến trình chính còn sống; tiến trình thoát thì container `Exited` và ExitCode được lưu lại.
- Hỏi: container `Exited` còn trên đĩa không?
:::

---

## Slide 4: Bước 0 (3 phút): Dọn container cũ

Mọi container hôm nay có tên bắt đầu bằng `club-`. Dọn container của Ngày 4 để khỏi trùng tên và trùng cổng.

```bash
cd ~/devops-labs
docker rm -f club-web 2>/dev/null
docker ps -a
```

**Kiểm tra: bạn đúng khi** danh sách không còn `club-web` (có thể rỗng).

---

## Slide 5: Bước 1 (20 phút): Chạy web Club

![Các cờ -d, --name, -p, -e, --rm và ý nghĩa](/slides/img/s08-run-flags.svg)

`-p 8080:80` đọc là `cổng-máy-bạn:cổng-trong-container`.

::: details Ghi chú cho mentor
- `--name` phải duy nhất; `-p 8080:80` là cổng máy bạn 8080 vào cổng 80 trong container.
- `-e` truyền biến môi trường; cần ở bước Postgres.
:::

---

## Slide 6: Bước 1: Chạy và gọi thử

```bash
docker run -d --name club-web -p 8080:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080
```

Mong đợi: `docker ps` có `club-web ... Up ... 0.0.0.0:8080->80/tcp`, `curl` in `200`.

**Kiểm tra: bạn đúng khi** thấy `200`.

---

## Slide 7: Bước 1: Xem log

Mở terminal WSL thứ hai, chạy `curl -s http://localhost:8080 > /dev/null` vài lần. Rồi quay lại terminal đầu:

```bash
docker logs --tail 5 club-web
```

Mong đợi: các dòng `GET / HTTP/1.1" 200`. Thêm `-f` để xem trực tiếp, Ctrl+C để thoát (container vẫn chạy).

**Kiểm tra: bạn đúng khi** log có dòng `GET` của chính bạn.

---

## Slide 8: Bước 1: Vào trong container bằng exec

```bash
docker exec -it club-web sh
```

Trong shell của container:

```sh
ls /usr/share/nginx/html
ps
exit
```

Mong đợi: thấy `index.html` của Club và `nginx: master process` ở PID 1. Thoát shell không làm container dừng.

::: details Ghi chú cho mentor
- `exec` thêm một tiến trình vào container đang chạy, không khởi động lại.
- Cho học viên thấy Nginx là PID 1: đó là tiến trình chính, nó thoát thì container thoát.
:::

---

## Slide 9: Bước 1: Soi cấu hình bằng inspect

![ps -a, logs, inspect, exec nhìn vào cùng một container](/slides/img/s08-observe-commands.svg)

```bash
docker inspect --format 'status={{.State.Status}} started={{.State.StartedAt}}' club-web
```

**Kiểm tra: bạn đúng khi** `inspect` in `status=running`.

::: details Ghi chú cho mentor
- Bộ ba chẩn đoán đầu tiên: `ps -a`, `logs`, `inspect`.
- `inspect` là nguồn sự thật; luôn dùng `--format`, đừng dán toàn bộ output vì có thể chứa mật khẩu.
:::

---

## Slide 10: Bước 2 (10 phút): Dừng container

`stop` chỉ tắt container, nó vẫn còn trên đĩa.

```bash
docker stop club-web
docker ps
docker ps -a --filter name=club-web --format '{{.Names}}  {{.Status}}'
docker inspect --format 'exit={{.State.ExitCode}}' club-web
```

Mong đợi: `docker ps` không còn `club-web`; `docker ps -a` hiện `Exited (0) ... ago`; `exit=0`.

**Kiểm tra: bạn đúng khi** thấy `Exited (0)`. ExitCode `0` là thoát êm, khác `0` là có lỗi.

---

## Slide 11: Bước 2: Chạy lại và xóa

```bash
docker start club-web
docker rm club-web
docker rm -f club-web
docker ps -a --filter name=club-web
```

Mong đợi: `docker rm` đầu báo `cannot remove container ... container is running` (cố ý). `docker rm -f` dừng và xóa; danh sách cuối chỉ còn dòng tiêu đề.

**Kiểm tra: bạn đúng khi** `club-web` biến mất sau `docker rm -f`.

---

## Slide 12: Bước 3 (20 phút): Postgres chạy xong là chết

![postgres thiếu POSTGRES_PASSWORD nên Exited (1); log nói rõ lý do](/slides/img/s08-exit-fast.svg)

```bash
docker run -d --name club-db-bad postgres:17-alpine
docker ps
```

Mong đợi: `docker ps` không thấy `club-db-bad`.

::: details Ghi chú cho mentor
- `docker ps` chỉ liệt kê container đang chạy; `docker ps -a` mới hiện `Exited (1)`.
:::

---

## Slide 13: Bước 3: Điều tra theo thứ tự ps, logs, inspect

```bash
docker ps -a --filter name=club-db-bad
docker logs club-db-bad 2>&1 | head -4
docker inspect --format 'exit={{.State.ExitCode}}' club-db-bad
```

Mong đợi: `Exited (1)`, `exit=1`, và log có `Error: Database is uninitialized and superuser password is not specified.`

**Kiểm tra: bạn đúng khi** đọc ra nguyên nhân: thiếu biến `POSTGRES_PASSWORD`.

---

## Slide 14: Bước 3: Sửa bằng biến môi trường

```bash
docker rm club-db-bad
docker run -d --name club-db -e POSTGRES_PASSWORD=lab_only_password -e POSTGRES_DB=clubdb postgres:17-alpine
until [ "$(docker logs club-db 2>&1 | grep -c 'ready to accept connections')" -ge 2 ]; do sleep 1; done
docker exec club-db pg_isready -U postgres
```

Mong đợi: `/var/run/postgresql:5432 - accepting connections`. Mật khẩu này chỉ để học.

**Kiểm tra: bạn đúng khi** `pg_isready` báo `accepting connections`. Dọn: `docker rm -f club-db`.

::: details Ghi chú cho mentor
- Vòng `until` đợi dòng `ready to accept connections` hai lần vì Postgres khởi động một server tạm trước rồi mới chạy server thật.
- Nhắc: `docker inspect` hiển thị cả biến chứa mật khẩu; luôn lọc bằng `--format` hoặc `grep` trước khi dán cho người khác.
:::

---

## Slide 15: Bước 4 (20 phút): Container Up nhưng không truy cập được

Lần này bạn cố ý nối nhầm cổng: Nginx nghe cổng 80 trong container, nhưng bạn viết `8081:8080`.

```bash
docker run -d --name club-web-bad -p 8081:8080 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps --filter name=club-web-bad --format '{{.Names}}  {{.Status}}  {{.Ports}}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

---

## Slide 16: Bước 4: Container sống mà dịch vụ không trả lời

Mong đợi: container `Up` với `0.0.0.0:8081->8080/tcp`, nhưng `curl` báo `Empty reply from server` hoặc `Connection reset by peer` (hoặc in `000`).

Tìm cổng Nginx thật sự nghe:

```bash
docker logs club-web-bad 2>&1 | tail -3
docker exec club-web-bad netstat -ltn
```

**Kiểm tra: bạn đúng khi** `netstat` cho thấy `0.0.0.0:80` đang `LISTEN`, không có cổng `8080`.

---

## Slide 17: Bước 4: Sửa cổng

Nối cổng máy bạn vào cổng 80 của container.

```bash
docker rm -f club-web-bad
docker run -d --name club-web-bad -p 8081:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

**Kiểm tra: bạn đúng khi** `curl` in `200`. Dọn: `docker rm -f club-web-bad`.

::: details Ghi chú cho mentor
- Hỏi: vì sao `8081:8080` hỏng còn `8081:80` chạy? Định dạng luôn là `máy:container`.
- Cuối bước: `docker ps -a --filter name=club-` không còn container nào.
:::

---

## Slide 18: Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy | Mở Docker Desktop, bật WSL integration cho Ubuntu |
| `port is already allocated` | Cổng máy đã có người giữ | `docker ps --filter publish=8080`, dừng container cũ hoặc đổi cổng |
| `container name is already in use` | Tên trùng container cũ (kể cả đã dừng) | `docker rm -f tên-container` |

---

## Slide 19: Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `docker ps` trống dù vừa `run -d` | Container đã thoát | `docker ps -a`, `docker logs`, `docker inspect` |
| Terminal bị chiếm sau `docker run` | Quên `-d` | Ctrl+C rồi chạy lại với `-d` |
| `pg_isready` lỗi ngay sau khi chạy Postgres | Mới có một dòng `ready to accept connections` | Đợi dòng đó xuất hiện hai lần |

---

## Slide 20: Tự kiểm tra

1. Khác nhau giữa `docker stop` và `docker rm -f` là gì?
2. `docker run -d -p 9000:80 nginx:1.27-alpine` mở cổng nào trên máy bạn, Nginx nghe cổng nào?
3. `docker run -d --name api club-api:1.0.0` mà `docker ps` trống: ba lệnh tiếp theo là gì?

::: details Ghi chú cho mentor
- Đáp án 1: `stop` dừng nhưng container còn trên đĩa (xem bằng `docker ps -a`, log còn). `rm -f` buộc dừng rồi xóa hẳn, log mất theo.
- Đáp án 2: cổng 9000 trên máy bạn, Nginx nghe cổng 80 trong container. Định dạng `máy:container`.
- Đáp án 3: `docker ps -a` (trạng thái, ExitCode), `docker logs api` (đọc lỗi), `docker inspect api` nếu log chưa rõ.
:::

---

## Slide 21: Tiếp theo

Ngày 6: viết Dockerfile cho Club API và build image đầu tiên: [Ngày 6 – Dockerfile cho Club API](session-09.md).

---

## Slide 22: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker CLI reference](https://docs.docker.com/reference/cli/docker/): tra cứu mọi lệnh và cờ của docker.
- **Tài liệu chính thức:** [docker container run](https://docs.docker.com/reference/cli/docker/container/run/): các cờ quan trọng của lệnh docker run.
- **Tài liệu chính thức:** [View container logs](https://docs.docker.com/engine/logging/): xem log để tìm lỗi container.
- **Best practice:** [Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/): giới hạn CPU và RAM cho container.
- **Best practice:** [Run the daemon rootless](https://docs.docker.com/engine/security/rootless/): chạy Docker không cần quyền root.
