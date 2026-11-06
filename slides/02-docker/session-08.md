# Slide Ngày 05 – Vận hành và sửa lỗi container

> **Tóm tắt:** Sử dụng các lệnh `ps`, `logs`, `exec`, `inspect`, `stop`, `rm` để vận hành container của dự án Club, sau đó chẩn đoán và sửa hai container lỗi: một container thoát ngay sau khi khởi động và một container cấu hình sai cổng.

## Mục tiêu của Ngày 5

![Ba mục tiêu: vòng đời, quan sát, chẩn đoán](/slides/img/s08-goals.svg)

- Sản phẩm: điều khiển web Club bằng 6 lệnh và sửa 2 container lỗi bằng cách đọc log.
- Thời gian: 15 phút trình bày, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Điều kiện: đã hoàn thành [Ngày 4](session-07.md), Docker Desktop đang chạy, terminal WSL đang ở thư mục `~/devops-labs`.
- Chốt sản phẩm: 6 lệnh cốt lõi và hai container lỗi được sửa dựa trên log, không dựa trên phỏng đoán.
- Câu hỏi mở đầu: người học nào từng chạy `docker run` rồi không xác định được container đang ở trạng thái nào.
:::

---

## Bài toán thực tế: container đã chạy nhưng không quan sát được

![docker ps trống sau docker run -d, ba câu hỏi chưa có đáp án](/slides/img/s08-no-visibility.svg)

::: details Ghi chú cho mentor
- Tình huống thực tế: một thành viên câu lạc bộ gửi lệnh chạy thử, nhưng `docker ps` trả về danh sách rỗng; hoặc container ở trạng thái `Up` mà trang web không truy cập được.
- Ngày hôm nay hướng dẫn đặt ba câu hỏi cho container: container có đang chạy hay không, container đang ghi ra nội dung gì, cấu hình thực tế của container là gì.
:::

---

## Khái niệm: Vòng đời container

![Created, Running, Exited, Removed và các lệnh chuyển trạng thái](/slides/img/s08-lifecycle.svg)

- **Vòng đời container** là chuỗi trạng thái mà container đi qua: `Created`, `Running`, `Exited` và `Removed`.
- Ví dụ trong dự án: `docker stop` chuyển container từ `Running` sang `Exited`; `docker rm` chuyển sang `Removed`.

::: details Ghi chú cho mentor
- Container tồn tại chừng nào tiến trình chính còn chạy. Khi tiến trình này kết thúc, container chuyển sang `Exited` nhưng vẫn còn trên đĩa cho đến khi bị xóa.
- Container sống chừng nào tiến trình chính còn sống. Khi tiến trình thoát, container chuyển sang `Exited` và exit code được lưu lại.
- Câu hỏi: container ở trạng thái `Exited` có còn trên đĩa không.
:::

---

## Bước 0 (3 phút): Dọn container cũ

Mọi container trong ngày hôm nay có tên bắt đầu bằng `club-`. Cần xóa container của Ngày 4 để tránh trùng tên và trùng cổng.

```bash
cd ~/devops-labs
docker rm -f club-web 2>/dev/null
docker ps -a
```

**Kiểm tra: kết quả đúng khi** danh sách không còn `club-web` (danh sách có thể rỗng).

---

## Khái niệm: Cổng và ánh xạ cổng

![Cổng 8080 của máy chủ nối vào cổng 80 của container](/slides/img/s08-k-port-mapping.svg)

- **Ánh xạ cổng** (port mapping) là quy tắc chuyển kết nối đến một cổng của máy chủ vào một cổng trong container.
- Ví dụ trong dự án: `-p 8080:80` chuyển cổng 8080 của máy chủ vào cổng 80 của Nginx.

::: details Ghi chú cho mentor
- Container có mạng riêng, nên dịch vụ bên trong không tự xuất hiện trên máy chủ. Cờ `-p` tạo ra quy tắc chuyển tiếp này.
:::

---

## Khái niệm: Biến môi trường

![Biến môi trường truyền vào container khi khởi động](/slides/img/s08-k-env-var.svg)

- **Biến môi trường** (environment variable) là một cặp `TÊN=giá trị` được truyền cho tiến trình khi nó khởi động.
- Ví dụ trong dự án: cờ `-e POSTGRES_PASSWORD=...` truyền mật khẩu cho Postgres ở Bước 3.

::: details Ghi chú cho mentor
- Ứng dụng đọc cấu hình, như mật khẩu hoặc tên cơ sở dữ liệu, từ biến môi trường nên không cần sửa mã nguồn hay build lại image.
:::

---

## Bước 1 (20 phút): Chạy web Club

![Các cờ -d, --name, -p, -e, --rm và ý nghĩa](/slides/img/s08-run-flags.svg)

Cú pháp `-p 8080:80` được đọc là `cổng-máy-chủ:cổng-trong-container`.

::: details Ghi chú cho mentor
- `--name` phải duy nhất; `-p 8080:80` chuyển cổng 8080 của máy chủ vào cổng 80 trong container.
- `-e` truyền biến môi trường và sẽ được dùng ở bước Postgres.
:::

---

## Bước 1: Chạy container và gọi thử

```bash
docker run -d --name club-web -p 8080:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080
```

Kết quả mong đợi: `docker ps` có dòng `club-web ... Up ... 0.0.0.0:8080->80/tcp`, lệnh `curl` in ra `200`.

**Kiểm tra: kết quả đúng khi** `curl` in ra `200`.

---

## Khái niệm: Log của container

![Log là đầu ra stdout và stderr của tiến trình chính](/slides/img/s08-k-logs.svg)

- **Log** (nhật ký) của container là nội dung mà tiến trình chính ghi ra stdout và stderr.
- Ví dụ trong dự án: Nginx ghi mỗi yêu cầu HTTP thành một dòng log; `docker logs` hiển thị các dòng đó.

::: details Ghi chú cho mentor
- Stdout là đầu ra chuẩn, stderr là đầu ra lỗi.
- Docker lưu nội dung này, nên có thể đọc lại ngay cả khi container đã dừng. Vì vậy log là nguồn thông tin đầu tiên khi chẩn đoán lỗi.
:::

---

## Bước 1: Đọc log

Mở terminal WSL thứ hai và chạy `curl -s http://localhost:8080 > /dev/null` vài lần. Sau đó quay lại terminal đầu:

```bash
docker logs --tail 5 club-web
```

Kết quả mong đợi: các dòng chứa `GET / HTTP/1.1" 200`.

**Kiểm tra: kết quả đúng khi** log có các dòng `GET` do chính các lệnh `curl` vừa tạo ra.

::: details Ghi chú cho mentor
- Thêm `-f` để theo dõi log trực tiếp; nhấn Ctrl+C để thoát (container vẫn tiếp tục chạy).
:::

---

## Khái niệm: Lệnh exec

![docker exec chạy thêm shell trong container đang chạy](/slides/img/s08-k-exec.svg)

- **`docker exec`** là lệnh chạy thêm một tiến trình mới bên trong container đang chạy.
- Ví dụ trong dự án: `docker exec -it club-web sh` mở một shell trong container `club-web`.

::: details Ghi chú cho mentor
- Lệnh không khởi động lại container, nên cho phép quan sát hệ thống tệp và tiến trình từ bên trong.
- Cờ `-it` gắn terminal tương tác vào tiến trình đó.
:::

---

## Bước 1: Vào container bằng exec

```bash
docker exec -it club-web sh
```

Trong shell của container, chạy:

```sh
ls /usr/share/nginx/html
ps
exit
```

Kết quả mong đợi: thấy `index.html` của Club và `nginx: master process` có PID 1. Thoát shell không làm container dừng.

::: details Ghi chú cho mentor
- `exec` thêm một tiến trình vào container đang chạy, không khởi động lại container.
- Cho người học quan sát Nginx có PID 1: đây là tiến trình chính; khi tiến trình này thoát thì container cũng thoát.
:::

---

## Khái niệm: Lệnh inspect

![docker inspect hiển thị JSON về container](/slides/img/s08-k-inspect.svg)

- **`docker inspect`** là lệnh hiển thị thông tin cấu hình và trạng thái của một container dưới dạng JSON.
- Ví dụ trong dự án: `--format` lấy riêng trạng thái của `club-web`.

::: details Ghi chú cho mentor
- Thông tin này phản ánh trạng thái thực tế, nên được dùng làm căn cứ khi log chưa đủ rõ. Cờ `--format` cho phép chỉ lấy một trường cần thiết.
- Kết quả đầy đủ của `inspect` có thể chứa biến môi trường, kể cả mật khẩu; chỉ sao chép phần đã lọc bằng `--format`.
:::

---

## Bước 1: Kiểm tra cấu hình bằng inspect

![ps -a, logs, inspect, exec nhìn vào cùng một container](/slides/img/s08-observe-commands.svg)

```bash
docker inspect --format 'status={{.State.Status}} started={{.State.StartedAt}}' club-web
```

**Kiểm tra: kết quả đúng khi** `inspect` in ra `status=running`.

::: details Ghi chú cho mentor
- Bộ ba lệnh chẩn đoán đầu tiên: `ps -a`, `logs`, `inspect`.
- `inspect` là nguồn thông tin đáng tin cậy nhất; luôn dùng `--format`, không dán toàn bộ kết quả vì có thể chứa mật khẩu.
:::

---

## Khái niệm: Exit code

![Exited (0) là bình thường, Exited (1) là lỗi](/slides/img/s08-k-exit-code.svg)

- **Exit code** (mã thoát) là số nguyên mà tiến trình trả về khi kết thúc; `0` là bình thường, khác `0` là lỗi.
- Ví dụ trong dự án: `docker ps -a` hiển thị `Exited (0)` hoặc `Exited (1)`.

::: details Ghi chú cho mentor
- Docker lưu giá trị này trong trạng thái của container.
- `Exited (0)` là dừng bình thường; `Exited (1)` là tiến trình thoát do lỗi.
:::

---

## Bước 2 (10 phút): Dừng container

Lệnh `stop` chỉ dừng container; container vẫn còn trên đĩa.

```bash
docker stop club-web
docker ps
docker ps -a --filter name=club-web --format '{{.Names}}  {{.Status}}'
docker inspect --format 'exit={{.State.ExitCode}}' club-web
```

Kết quả mong đợi: `docker ps` không còn `club-web`; `docker ps -a` hiển thị `Exited (0) ... ago`; kết quả cuối là `exit=0`.

**Kiểm tra: kết quả đúng khi** thấy `Exited (0)`.

::: details Ghi chú cho mentor
- Exit code `0` nghĩa là thoát bình thường, khác `0` nghĩa là có lỗi.
:::

---

## Bước 2: Chạy lại và xóa container

```bash
docker start club-web
docker rm club-web
docker rm -f club-web
docker ps -a --filter name=club-web
```

Kết quả mong đợi: lệnh `docker rm` đầu tiên báo `cannot remove container ... container is running` (lỗi có chủ đích). Lệnh `docker rm -f` dừng và xóa container; danh sách cuối chỉ còn dòng tiêu đề.

**Kiểm tra: kết quả đúng khi** `club-web` không còn xuất hiện sau `docker rm -f`.

---

## Bước 3 (20 phút): Postgres khởi động rồi thoát ngay

![postgres thiếu POSTGRES_PASSWORD nên Exited (1); log nói rõ lý do](/slides/img/s08-exit-fast.svg)

```bash
docker run -d --name club-db-bad postgres:17-alpine
docker ps
```

Kết quả mong đợi: `docker ps` không hiển thị `club-db-bad`.

::: details Ghi chú cho mentor
- `docker ps` chỉ liệt kê container đang chạy; cần `docker ps -a` mới thấy trạng thái `Exited (1)`.
:::

---

## Bước 3: Điều tra theo thứ tự ps, logs, inspect

```bash
docker ps -a --filter name=club-db-bad
docker logs club-db-bad 2>&1 | head -4
docker inspect --format 'exit={{.State.ExitCode}}' club-db-bad
```

Kết quả mong đợi: `Exited (1)`, `exit=1`, và log chứa `Error: Database is uninitialized and superuser password is not specified.`

**Kiểm tra: kết quả đúng khi** xác định được nguyên nhân: thiếu biến `POSTGRES_PASSWORD`.

---

## Bước 3: Sửa bằng biến môi trường

```bash
docker rm club-db-bad
docker run -d --name club-db -e POSTGRES_PASSWORD=lab_only_password -e POSTGRES_DB=clubdb postgres:17-alpine
until [ "$(docker logs club-db 2>&1 | grep -c 'ready to accept connections')" -ge 2 ]; do sleep 1; done
docker exec club-db pg_isready -U postgres
```

Kết quả mong đợi: `/var/run/postgresql:5432 - accepting connections`. Mật khẩu này chỉ dùng cho mục đích học tập.

**Kiểm tra: kết quả đúng khi** `pg_isready` báo `accepting connections`. Dọn dẹp: `docker rm -f club-db`.

::: details Ghi chú cho mentor
- Vòng lặp `until` chờ dòng `ready to accept connections` xuất hiện hai lần, vì Postgres khởi động một server tạm trước rồi mới chạy server chính thức.
- Nhắc lại: `docker inspect` hiển thị cả biến môi trường chứa mật khẩu; cần lọc bằng `--format` hoặc `grep` trước khi chia sẻ cho người khác.
:::

---

## Bước 4 (20 phút): Container ở trạng thái Up nhưng không truy cập được

Ở bước này, cổng được nối sai có chủ đích: Nginx lắng nghe cổng 80 trong container, nhưng lệnh dưới đây dùng `8081:8080`.

```bash
docker run -d --name club-web-bad -p 8081:8080 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps --filter name=club-web-bad --format '{{.Names}}  {{.Status}}  {{.Ports}}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

---

## Bước 4: Container chạy nhưng dịch vụ không phản hồi

Kết quả mong đợi: container ở trạng thái `Up` với `0.0.0.0:8081->8080/tcp`, nhưng `curl` báo `Empty reply from server` hoặc `Connection reset by peer` (hoặc in ra `000`).

Xác định cổng mà Nginx thực sự lắng nghe:

```bash
docker logs club-web-bad 2>&1 | tail -3
docker exec club-web-bad netstat -ltn
```

**Kiểm tra: kết quả đúng khi** `netstat` cho thấy `0.0.0.0:80` ở trạng thái `LISTEN` và không có cổng `8080`.

---

## Bước 4: Sửa cổng

Nối cổng của máy chủ vào cổng 80 của container.

```bash
docker rm -f club-web-bad
docker run -d --name club-web-bad -p 8081:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8081
```

**Kiểm tra: kết quả đúng khi** `curl` in ra `200`. Dọn dẹp: `docker rm -f club-web-bad`.

::: details Ghi chú cho mentor
- Câu hỏi: vì sao `8081:8080` không hoạt động còn `8081:80` hoạt động. Định dạng luôn là `máy-chủ:container`.
- Cuối bước: `docker ps -a --filter name=club-` không còn container nào.
:::

---

## Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker chưa chạy | Mở Docker Desktop |
| `port is already allocated` | Cổng bị giữ | `docker ps --filter publish=8080`; dừng container cũ |
| `container name is already in use` | Tên trùng | `docker rm -f tên-container` |

::: details Ghi chú cho mentor
- Với lỗi daemon: mở Docker Desktop, bật WSL integration cho Ubuntu.
- Cổng trên máy chủ đang bị tiến trình khác sử dụng; có thể dừng container cũ hoặc đổi cổng.
- Tên trùng với container cũ, kể cả container đã dừng.
:::

---

## Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `docker ps` trống sau `run -d` | Container đã thoát | `docker ps -a`, `logs`, `inspect` |
| Terminal bị chiếm | Thiếu cờ `-d` | Ctrl+C, chạy lại với `-d` |
| `pg_isready` báo lỗi | Mới một dòng `ready` | Chờ dòng đó hai lần |

::: details Ghi chú cho mentor
- `pg_isready` báo lỗi ngay sau khi chạy Postgres vì mới có một dòng `ready to accept connections`; chờ dòng đó xuất hiện hai lần.
- Terminal bị chiếm sau `docker run`: nhấn Ctrl+C rồi chạy lại với `-d`.
:::

---

## Tự kiểm tra

1. `docker stop` và `docker rm -f` khác nhau như thế nào?
2. Lệnh `docker run -d -p 9000:80 nginx:1.27-alpine` mở cổng nào trên máy chủ, và Nginx lắng nghe cổng nào?
3. Sau `docker run -d --name api club-api:1.0.0`, `docker ps` trả về danh sách rỗng. Ba lệnh tiếp theo cần chạy là gì?

::: details Ghi chú cho mentor
- Đáp án 1: `stop` dừng container nhưng container vẫn còn trên đĩa (xem bằng `docker ps -a`, log vẫn còn). `rm -f` buộc dừng rồi xóa hẳn, log mất theo.
- Đáp án 2: cổng 9000 trên máy chủ; Nginx lắng nghe cổng 80 trong container. Định dạng là `máy-chủ:container`.
- Đáp án 3: `docker ps -a` (trạng thái, exit code), `docker logs api` (đọc lỗi), `docker inspect api` nếu log chưa đủ rõ.
:::

---

## Tiếp theo

Ngày 6: viết Dockerfile cho Club API và build image đầu tiên: [Ngày 6 – Dockerfile cho Club API](session-09.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker CLI reference](https://docs.docker.com/reference/cli/docker/): tra cứu mọi lệnh và cờ của docker.
- **Tài liệu chính thức:** [docker container run](https://docs.docker.com/reference/cli/docker/container/run/): các cờ quan trọng của lệnh docker run.
- **Tài liệu chính thức:** [View container logs](https://docs.docker.com/engine/logging/): xem log để tìm lỗi container.
- **Best practice:** [Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/): giới hạn CPU và RAM cho container.
- **Best practice:** [Run the daemon rootless](https://docs.docker.com/engine/security/rootless/): chạy Docker không cần quyền root.
