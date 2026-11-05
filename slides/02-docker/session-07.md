# Slide Ngày 04 – Chạy trang Club bằng container

> **Tóm tắt:** Cài Docker Desktop, chạy container Nginx và phục vụ trang web của dự án Club từ container ở `localhost:8080`; hiểu cổng bằng cách tự gây lỗi `port is already allocated`.

## Slide 1: Hôm nay bạn làm ra gì

**Mốc cuối ngày:** trang Club Members (`club/frontend`) chạy trong container Nginx, mở được ở `http://localhost:8080`; bạn sửa `index.html` thì trang đổi theo.

- Đã xong Ngày 3: có `~/devops-labs/club/` trên `main`.
- Docker Desktop đã cài (chọn WSL 2) và đang mở.

Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Làm trong WSL, trong `~/` (không dùng `/mnt/c`).
- Kiểm tra nhanh môi trường: `bash ~/devops-course/resources/check-env.sh 7`.
- Phân bổ 85 phút: Bước 1 (10), Bước 2 (15), Bước 3 (15), Bước 4 (20), Bước 5 (15), Bước 6 (10).
- Hỏi: ai từng nghe câu "máy tôi chạy được mà"?
:::

---

## Slide 2: "Máy tôi chạy được mà"

![Cùng mã nguồn: máy A chạy tốt, máy B và máy chung bị lỗi](/slides/img/s07-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Trang web CLB chạy ở máy A, lỗi ở máy B: sai phiên bản, thiếu thư viện, cổng bị chiếm.
- Container đóng gói app cùng môi trường chạy nên chạy giống nhau ở mọi máy có Docker.
- Hôm nay chỉ dùng image `nginx` có sẵn và gắn thư mục `club/frontend` vào, chưa viết Dockerfile. Từ Ngày 6 mới đóng gói cả API.
:::

---

## Slide 3: Image, container, registry

![Registry lưu image, image chạy thành nhiều container](/slides/img/s07-image-container-registry.svg)

::: details Ghi chú cho mentor
- Image: gói chỉ đọc. Container: một lần chạy của image. Registry: Docker Hub, GHCR.
- Tag là nhãn phiên bản, ví dụ `1.27-alpine`; luôn ghim tag cụ thể, không dùng `latest`.
:::

---

## Slide 4: Bước 1 (10 phút): Client gõ lệnh, daemon làm việc

![docker CLI gửi API tới dockerd; dockerd điều khiển containerd, image store, registry](/slides/img/s07-docker-architecture.svg)

::: details Ghi chú cho mentor
- CLI chỉ gửi yêu cầu, daemon mới làm việc. Tắt Docker Desktop thì lệnh báo không kết nối được daemon.
- Docker Desktop gói sẵn daemon trong một VM WSL2.
:::

---

## Slide 5: Bước 1: Kiểm tra Docker

```bash
docker version
docker run --rm hello-world
```

Kết quả: `docker version` có cả khối `Client:` và `Server:`; `hello-world` in `Hello from Docker!`.

**Kiểm tra: bạn đúng khi** thấy `Hello from Docker!`.

::: details Ghi chú cho mentor
- Lần đầu có dòng `Unable to find image ... locally`: Docker tải image về.
- `--rm` tự xóa container sau khi thoát.
- Chỉ có `Client` kèm lỗi kết nối: Docker Desktop chưa chạy xong (xem slide lỗi thường gặp).
:::

---

## Slide 6: Bước 2 (15 phút): Chạy Nginx lần đầu

Tải image, chạy nền và đặt tên cho container. Tag `1.27-alpine` được ghim để mọi máy giống nhau.

```bash
docker pull nginx:1.27-alpine
docker run -d --name club-web -p 8080:80 nginx:1.27-alpine
curl -s http://localhost:8080 | head -5
```

Kết quả: HTML có `Welcome to nginx!`.

::: details Ghi chú cho mentor
- `-d` chạy nền; `--name` đặt tên để lệnh sau gọi được.
- Mở trình duyệt Windows tại `http://localhost:8080` để thấy cùng trang.
:::

---

## Slide 7: Bước 2: Cổng -p HOST:CONTAINER

![curl vào cổng 8080 của máy, đi tới nginx cổng 80 trong container](/slides/img/s07-port-8080.svg)

::: details Ghi chú cho mentor
- `-p 8080:80` nghĩa là `CỔNG-MÁY-BẠN:CỔNG-TRONG-CONTAINER`. Nginx nghe cổng 80 bên trong; bạn vào bằng cổng 8080.
- Câu hỏi nhanh: số nào là của máy bạn?
:::

---

## Slide 8: Bước 2: Xem container đang chạy

```bash
docker ps
```

```text
CONTAINER ID   IMAGE               ...   PORTS                  NAMES
a1b2c3d4e5f6   nginx:1.27-alpine   ...   0.0.0.0:8080->80/tcp   club-web
```

**Kiểm tra: bạn đúng khi** `curl` và trình duyệt cùng hiện "Welcome to nginx!", và cột PORTS có `0.0.0.0:8080->80/tcp`.

---

## Slide 9: Bước 3 (15 phút): Gây lỗi cổng

Một cổng của máy chỉ một process dùng được. Chạy container thứ hai trên cùng cổng 8080:

```bash
docker run -d --name club-web2 -p 8080:80 nginx:1.27-alpine
```

```text
docker: Error response from daemon: ... Bind for 0.0.0.0:8080
failed: port is already allocated.
```

::: details Ghi chú cho mentor
- Cho học viên tự chạy để thấy lỗi thật trước khi sửa.
- Container `club-web2` vẫn bị tạo ra ở trạng thái `Created` khi lỗi xảy ra.
:::

---

## Slide 10: Bước 3: Đổi sang cổng 8081

Xóa container lỗi, chạy lại ở cổng khác. Cổng trong container vẫn là 80.

```bash
docker rm club-web2
docker run -d --name club-web2 -p 8081:80 nginx:1.27-alpine
curl -s -o /dev/null -w "8080 -> %{http_code}\n" http://localhost:8080
curl -s -o /dev/null -w "8081 -> %{http_code}\n" http://localhost:8081
docker rm -f club-web2
```

Kết quả: `8080 -> 200` và `8081 -> 200`.

**Kiểm tra: bạn đúng khi** đã thấy lỗi `port is already allocated`, và hai container chạy song song ở 8080 và 8081.

---

## Slide 11: Bước 4 (20 phút): Bind mount thư mục Club

![Thư mục club/frontend của máy được gắn chỉ đọc vào /usr/share/nginx/html của container](/slides/img/s07-bind-mount.svg)

::: details Ghi chú cho mentor
- `-v` là bind mount: gắn thư mục của máy vào container; `:ro` là chỉ đọc nên container không sửa file của bạn.
- Dùng đường dẫn tuyệt đối (`$PWD`).
:::

---

## Slide 12: Bước 4: Phục vụ trang Club

Container cũ đang giữ cổng 8080 nên xóa trước. Chạy từ `~/devops-labs`.

```bash
docker rm -f club-web
cd ~/devops-labs
docker run -d --name club-web -p 8080:80 \
  -v "$PWD/club/frontend:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8080 | grep "<title>"
```

Kết quả: `<title>Club Management</title>`.

**Kiểm tra: bạn đúng khi** `curl` in `<title>Club Management</title>`, không phải trang "Welcome to nginx!".

---

## Slide 13: Bước 4: Mở trang Club trên trình duyệt

Mở `http://localhost:8080`: bạn thấy tiêu đề "Club Members" và dòng `Cannot load members: HTTP 404`.

Dòng đó là đúng: trang cần API `/api/members` mà chưa có backend. Bạn nối nó ở Ngày 8.

::: details Ghi chú cho mentor
- Trang hiện 403 hoặc 404 toàn trang (không phải dòng `Cannot load members`) thường do bind mount sai đường dẫn. Chạy `ls club/frontend` để kiểm tra thư mục không rỗng.
:::

---

## Slide 14: Bước 5 (15 phút): Sửa file, trang đổi theo

Thư mục được gắn vào container nên sửa file trên máy là container thấy ngay. Đổi tiêu đề thành tên bạn:

```bash
cd ~/devops-labs
sed -i 's|<h1>Club Members</h1>|<h1>Club Members - TEN BAN</h1>|' club/frontend/index.html
curl -s http://localhost:8080 | grep "<h1>"
```

Kết quả: `<h1>Club Members - TEN BAN</h1>`. Tải lại trình duyệt để thấy cùng nội dung.

::: details Ghi chú cho mentor
- Cho học viên đổi `TEN BAN` thành tên mình.
- Không cần chạy lại `docker run` vì container đọc đúng file trên máy.
:::

---

## Slide 15: Bước 5: Xem container đang làm gì

```bash
docker ps
docker logs club-web
```

Kết quả: `STATUS` dạng `Up ... minutes`; log có các dòng `"GET / HTTP/1.1" 200` (chính là các lệnh `curl` của bạn).

**Kiểm tra: bạn đúng khi** tiêu đề trên trang có tên bạn mà không cần chạy lại `docker run`.

---

## Slide 16: Bước 6 (10 phút): Dừng, xóa, dọn

`stop` dừng nhưng giữ container; `rm` xóa container (image vẫn còn).

```bash
docker stop club-web
docker ps
docker ps -a
docker rm club-web
```

Kết quả: sau `stop`, `docker ps` không còn `club-web` nhưng `docker ps -a` vẫn liệt kê với trạng thái `Exited`; sau `rm` thì biến mất.

**Kiểm tra: bạn đúng khi** `docker ps -a` không còn `club-web` hay `club-web2`.

::: details Ghi chú cho mentor
- Image `nginx:1.27-alpine` vẫn ở trên máy, lần chạy sau không cần tải lại.
- Ngày 5 sẽ chạy lại container này, nên không cần lo mất bài.
:::

---

## Slide 17: Lỗi thường gặp: Docker không chạy

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `docker: command not found` trong WSL | Chưa bật WSL integration | Docker Desktop, Settings, Resources, WSL integration, bật Ubuntu, Apply; mở lại terminal |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy hoặc đang khởi động | Mở Docker Desktop, đợi báo Running, thử lại `docker version` |
| Docker Desktop báo lỗi WSL hoặc ảo hóa | Chưa bật Virtualization hoặc WSL cũ | Bật Virtualization trong BIOS/UEFI, chạy `wsl --update` trong PowerShell |

---

## Slide 18: Lỗi thường gặp: cổng và tên trùng

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng đã có container hoặc process khác giữ | `docker ps` xem ai giữ cổng; `docker rm -f` container cũ hoặc đổi cổng trái (ví dụ `-p 8083:80`) |
| `name is already in use` | Container cũ cùng tên còn tồn tại, kể cả đã dừng | `docker rm -f club-web` rồi chạy lại |

::: details Ghi chú cho mentor
- Không có container nào giữ cổng thì một process khác của máy đang giữ nó.
:::

---

## Slide 19: Lỗi thường gặp: trang 403 hoặc 404

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Trang hiện 403 hoặc 404 | Bind mount sai đường dẫn nên thư mục rỗng | Chạy `docker run` từ `~/devops-labs`, kiểm tra `ls club/frontend`, dùng `"$PWD/club/frontend"` |

`Cannot load members: HTTP 404` trên trang Club là bình thường khi chưa có backend.

---

## Slide 20: Tự kiểm tra

1. Vì sao `-p 8080:80` có hai số? Số nào là của máy bạn?
2. Bạn gặp `port is already allocated`. Điều tra thế nào?
3. Vì sao sửa `index.html` mà không cần chạy lại `docker run`?

::: details Ghi chú cho mentor
- 1: Định dạng `CỔNG-MÁY:CỔNG-CONTAINER`. 8080 là cổng trên máy bạn, 80 là cổng Nginx nghe trong container.
- 2: `docker ps` xem container nào đang publish 8080; dừng hoặc xóa nó, hoặc đổi cổng trái. Không có container nào thì một process khác của máy đang giữ cổng.
- 3: Bind mount gắn thư mục của máy vào container nên container đọc đúng file bạn sửa. Với `:ro`, container chỉ đọc.
:::

---

## Slide 21: Tiếp theo

Ngày 5 vận hành và gỡ lỗi container: [Ngày 5 – Vận hành và gỡ lỗi container](session-08.md).

---

## Slide 22: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker overview](https://docs.docker.com/get-started/docker-overview/): Docker là gì và dùng để làm gì.
- **Tài liệu chính thức:** [Containers (Kubernetes docs)](https://kubernetes.io/docs/concepts/containers/): container và image nhìn từ góc độ chuẩn chung.
- **Tài liệu chính thức:** [About the Open Container Initiative](https://opencontainers.org/about/overview/): chuẩn mở cho image và container.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): hiểu mức cô lập và rủi ro của container.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): danh sách việc cần làm để Docker an toàn.
