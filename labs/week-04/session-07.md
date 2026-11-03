# Ngày 4 – Chạy trang Club bằng container

Lộ trình Cơ bản · Ngày 4/10 · khoảng 2 giờ

[Slide Ngày 4](../../slides/02-docker/session-07.md) · [Thử thách thêm](session-07-challenge.md)

> **Tóm tắt:** Cài Docker Desktop, chạy container Nginx, rồi phục vụ trang web của dự án Club từ container ở `http://localhost:8080`, đồng thời hiểu cổng (port) bằng cách tự gây lỗi và sửa.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** trang Club Members (thư mục `club/frontend`) chạy trong container Nginx, mở được ở `http://localhost:8080`; bạn sửa `index.html` thì trang đổi theo.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 3 – Đưa dự án Club vào Git bằng Pull Request](../week-03/session-06.md): có `~/devops-labs/club/` trên `main`.
- [ ] Docker Desktop đã cài theo [Hướng dẫn cài đặt](../../resources/setup-guide.md) (chọn WSL 2), đang mở. Kiểm tra nhanh: `bash ~/devops-course/resources/check-env.sh 7`.
- [ ] Terminal WSL Ubuntu (chưa quen thì xem [Terminal 101](../../resources/terminal-101.md)).
:::

## Bài toán thật

Trang web của CLB chạy tốt trên máy một bạn, nhưng bạn khác clone về thì lỗi vì khác phiên bản Node, thiếu thư viện hoặc cổng bị chiếm. Container đóng gói ứng dụng cùng môi trường chạy của nó, nên chạy giống nhau ở mọi máy có Docker. Hôm nay bạn bắt đầu với phần dễ nhất của dự án Club: trang web tĩnh trong `club/frontend`. Bạn không viết Dockerfile; bạn dùng image `nginx` có sẵn và gắn thư mục của bạn vào. Từ Ngày 6 bạn sẽ đóng gói cả API.

## Làm

Làm trong WSL, trong `~/` (không dùng `/mnt/c`).

### Bước 1. Kiểm tra Docker

Docker gồm lệnh `docker` bạn gõ (client) và chương trình nền (daemon) làm việc thật. Cần cả hai chạy.

```bash
docker version
docker run --rm hello-world
```

Kết quả mong đợi: `docker version` có cả khối `Client:` và `Server:`; `hello-world` in `Hello from Docker!`. Lần đầu có dòng `Unable to find image ... locally` vì Docker phải tải image về (image là gói chỉ đọc chứa ứng dụng và môi trường chạy). `--rm` tự xóa container sau khi thoát.

::: tip Kiểm tra: bạn đúng khi
Thấy `Hello from Docker!`. Chỉ có `Client` kèm lỗi kết nối thì xem [Gặp lỗi?](#gap-loi).
:::

### Bước 2. Chạy Nginx lần đầu

Tải image trước, rồi chạy. Phiên bản được ghim (`1.27-alpine`) để kết quả giống nhau trên mọi máy.

```bash
docker pull nginx:1.27-alpine
docker run -d --name club-web -p 8080:80 nginx:1.27-alpine
curl -s http://localhost:8080 | head -5
```

Kết quả mong đợi: `curl` in HTML có `Welcome to nginx!`. `-d` chạy nền; `--name` đặt tên để lệnh sau gọi được.

`-p 8080:80` nghĩa là `CỔNG-MÁY-BẠN:CỔNG-TRONG-CONTAINER`. Nginx lắng nghe cổng 80 bên trong container; bạn truy cập qua cổng 8080 của máy. Mở trình duyệt Windows tại `http://localhost:8080` để thấy cùng trang.

::: tip Kiểm tra: bạn đúng khi
`curl` và trình duyệt cùng hiện trang "Welcome to nginx!", và `docker ps` có cột PORTS `0.0.0.0:8080->80/tcp`.
:::

### Bước 3. Hiểu cổng bằng cách gây lỗi

Một cổng của máy chỉ một process dùng được. Hãy tự thử chạy container thứ hai trên cùng cổng 8080:

```bash
docker run -d --name club-web2 -p 8080:80 nginx:1.27-alpine
```

Kết quả mong đợi: lỗi `Bind for 0.0.0.0:8080 failed: port is already allocated`. Container `club-web2` vẫn bị tạo ra ở trạng thái `Created`, nên xóa nó rồi chạy lại ở cổng khác:

```bash
docker rm club-web2
docker run -d --name club-web2 -p 8081:80 nginx:1.27-alpine
curl -s -o /dev/null -w "8080 -> %{http_code}\n" http://localhost:8080
curl -s -o /dev/null -w "8081 -> %{http_code}\n" http://localhost:8081
```

Kết quả mong đợi: hai dòng `8080 -> 200` và `8081 -> 200`. Cùng một cổng 80 bên trong, hai cổng khác nhau bên ngoài. Dọn container thứ hai: `docker rm -f club-web2`.

::: tip Kiểm tra: bạn đúng khi
Bạn đã thấy lỗi `port is already allocated`, và hai container chạy song song ở 8080 và 8081.
:::

### Bước 4. Phục vụ trang Club từ container

Thay trang mặc định bằng thư mục `club/frontend` của bạn bằng bind mount (`-v`): gắn một thư mục của máy vào container. Dùng đường dẫn tuyệt đối. `:ro` để container chỉ đọc, không sửa file của bạn. Container cũ đang giữ cổng 8080 nên xóa trước.

```bash
docker rm -f club-web
cd ~/devops-labs
docker run -d --name club-web -p 8080:80 \
  -v "$PWD/club/frontend:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8080 | grep "<title>"
```

Kết quả mong đợi: `<title>Club Management</title>`. Mở `http://localhost:8080` trên trình duyệt: bạn thấy tiêu đề "Club Members" và dòng `Cannot load members: HTTP 404`. Đó là đúng: trang cần API (`/api/members`) mà chưa có backend. Bạn sẽ nối nó ở Ngày 8.

::: tip Kiểm tra: bạn đúng khi
`curl` in `<title>Club Management</title>` (không phải trang "Welcome to nginx!") và trình duyệt hiện "Club Members".
:::

### Bước 5. Sửa file, trang đổi theo

Vì thư mục được gắn vào container, sửa file trên máy là container thấy ngay. Đổi tiêu đề thành tên bạn:

```bash
cd ~/devops-labs
sed -i 's|<h1>Club Members</h1>|<h1>Club Members - TEN BAN</h1>|' club/frontend/index.html
curl -s http://localhost:8080 | grep "<h1>"
```

Kết quả mong đợi: `<h1>Club Members - TEN BAN</h1>`. Tải lại trình duyệt để thấy cùng nội dung. Đổi `TEN BAN` thành tên của bạn nếu muốn.

Xem container đang làm gì:

```bash
docker ps
docker logs club-web
```

Kết quả mong đợi: `STATUS` dạng `Up ... minutes`; log có các dòng `"GET / HTTP/1.1" 200` (chính là các lệnh `curl` của bạn).

::: tip Kiểm tra: bạn đúng khi
Tiêu đề trên trang có tên bạn mà không cần chạy lại `docker run`, và `docker logs` có request `GET /`.
:::

### Bước 6. Dừng, xóa, dọn

`stop` dừng nhưng giữ container; `rm` xóa container (image vẫn còn). Dọn container thực hành:

```bash
docker stop club-web
docker ps
docker ps -a
docker rm club-web
```

Kết quả mong đợi: sau `stop`, `docker ps` không còn `club-web` nhưng `docker ps -a` vẫn liệt kê với trạng thái `Exited`; sau `rm` thì biến mất. Image `nginx:1.27-alpine` vẫn ở trên máy, lần chạy sau không cần tải lại.

### Bước 7. Ghi note và commit

Lưu lệnh chạy và note, đưa vào `main` bằng PR như Ngày 3:

```bash
cd ~/devops-labs
git switch -c feature/day-04
cat > notes/day-04.md <<'EOF'
# Ngày 4 - Container đầu tiên

Lệnh tôi dùng để chạy trang Club:

    docker run -d --name club-web -p 8080:80 \
      -v "$PWD/club/frontend:/usr/share/nginx/html:ro" nginx:1.27-alpine

- Kết quả `curl http://localhost:8080 | grep "<title>"`: <dán kết quả>
- Lỗi tôi đã gặp ở Bước 3 và cách sửa: <1-2 câu>
- `-p 8080:80` nghĩa là: <1 câu>
EOF
git add notes/day-04.md club/frontend/index.html
git commit -m "Add day 4 note and personalize Club title"
git push -u origin feature/day-04
```

Mở PR trên GitHub, merge, rồi `git switch main && git pull`.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `docker: command not found` trong WSL | Chưa bật WSL integration | Docker Desktop, Settings, Resources, WSL integration, bật Ubuntu, Apply; mở lại terminal |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy hoặc đang khởi động | Mở Docker Desktop, đợi báo Running, thử lại `docker version` |
| `port is already allocated` | Cổng đã có container hoặc process khác giữ | `docker ps` xem ai giữ cổng, `docker rm -f` container cũ hoặc đổi cổng trái của `-p` (ví dụ `-p 8083:80`) |
| `name is already in use` | Container cũ cùng tên còn tồn tại, kể cả đã dừng | `docker rm -f club-web` rồi chạy lại |
| Trang hiện 403 hoặc 404 (khi chưa có backend thì `Cannot load members` là bình thường) | Bind mount sai đường dẫn nên thư mục rỗng | Chạy `docker run` từ `~/devops-labs`, kiểm tra `ls club/frontend`, dùng đường dẫn tuyệt đối `"$PWD/club/frontend"` |
| Docker Desktop báo lỗi WSL hoặc ảo hóa | Chưa bật Virtualization hoặc WSL cũ | Bật Virtualization trong BIOS/UEFI, chạy `wsl --update` trong PowerShell |

## Nộp bài

- [ ] `notes/day-04.md` trong `devops-labs` có lệnh `docker run` bạn đã dùng và kết quả `curl`.
- [ ] Note nêu một lỗi cổng bạn đã gặp ở Bước 3 và cách sửa.
- [ ] Đã merge PR chứa `notes/day-04.md` vào `main`.
- [ ] Không còn container `club-web` hay `club-web2` (`docker ps -a` sạch).

## Tự kiểm tra

1. Vì sao `-p 8080:80` có hai số? Số nào là của máy bạn?

::: details Đáp án gợi ý
Định dạng `CỔNG-MÁY:CỔNG-CONTAINER`. 8080 là cổng trên máy bạn (nơi bạn truy cập), 80 là cổng Nginx lắng nghe trong container.
:::

2. Bạn chạy một container nữa với `-p 8080:80` và gặp `port is already allocated`. Điều tra thế nào?

::: details Đáp án gợi ý
`docker ps` xem container nào đang publish 8080; dừng hoặc xóa nó, hoặc đổi cổng trái (ví dụ `-p 8081:80`). Nếu không có container nào, một process khác của máy đang giữ cổng.
:::

3. Vì sao sửa `index.html` mà không cần chạy lại `docker run`?

::: details Đáp án gợi ý
Bind mount gắn thư mục của máy vào container, nên container đọc đúng file bạn sửa. Với `:ro`, container chỉ đọc, không ghi ngược lại.
:::

## Tiếp theo

[Ngày 5 – Vận hành và gỡ lỗi container](session-08.md).

::: details Tài liệu tham khảo
- [Docker Desktop cho Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Docker overview (kiến trúc Docker)](https://docs.docker.com/get-started/docker-overview/)
- [docker container run (CLI reference)](https://docs.docker.com/reference/cli/docker/container/run/)
:::
