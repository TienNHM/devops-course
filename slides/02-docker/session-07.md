# Slide Ngày 04 – Chạy trang Club bằng container

> **Tóm tắt:** Ngày 4 cài Docker Desktop, chạy container Nginx và phục vụ trang web của dự án Club từ container tại `localhost:8080`; cơ chế cổng được làm rõ bằng cách tạo lỗi `port is already allocated`.

## Mục tiêu và sản phẩm cuối ngày

**Mốc cuối ngày:** trang Club Members (`club/frontend`) chạy trong container Nginx, truy cập được tại `http://localhost:8080`; khi sửa `index.html` thì trang thay đổi theo.

Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Điều kiện: đã hoàn thành Ngày 3, tức là có `~/devops-labs/club/` trên `main`.
- Docker Desktop đã được cài (chọn WSL 2) và đang chạy.
- Thực hành trong WSL, tại `~/` (không dùng `/mnt/c`).
- Kiểm tra nhanh môi trường: `bash ~/devops-course/resources/check-env.sh 7`.
- Phân bổ 85 phút: Bước 1 (10), Bước 2 (15), Bước 3 (15), Bước 4 (20), Bước 5 (15), Bước 6 (10).
- Câu hỏi mở đầu: ai đã từng nghe câu "máy tôi chạy được mà"?
:::

---

## Vấn đề: "Máy tôi chạy được mà"

![Cùng mã nguồn: máy A chạy tốt, máy B và máy chung bị lỗi](/slides/img/s07-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Trang web CLB chạy ở máy A nhưng lỗi ở máy B: sai phiên bản, thiếu thư viện, cổng bị chiếm.
- Container đóng gói ứng dụng cùng môi trường chạy, nên kết quả giống nhau trên mọi máy có Docker.
- Hôm nay chỉ dùng image `nginx` có sẵn và gắn thư mục `club/frontend` vào, chưa viết Dockerfile. Từ Ngày 6 mới đóng gói cả API.
:::

---

## Khái niệm: Container

![Container club-web cô lập với tiến trình khác của máy](/slides/img/s07-k-container.svg)

- **Container** là một tiến trình chạy cô lập với phần còn lại của máy, cùng các tệp và thư viện mà ứng dụng cần.
- Ví dụ trong dự án: Nginx phục vụ trang Club bên trong một container tên `club-web`.

::: details Ghi chú cho mentor
- Container có thể là một nhóm tiến trình.
- Cơ chế cô lập này cho phép cùng một ứng dụng chạy giống nhau trên các máy khác nhau, miễn là máy có Docker.
:::

---

## Khái niệm: Image

![Một image tạo ra nhiều container](/slides/img/s07-k-image.svg)

- **Image** là gói chỉ đọc chứa các tệp, thư viện và chỉ dẫn cần thiết để tạo ra container.
- Ví dụ trong dự án: image `nginx:1.27-alpine` chứa máy chủ web Nginx, là nguồn tạo container `club-web`.

::: details Ghi chú cho mentor
- Một image có thể tạo ra nhiều container; mỗi container là một lần chạy riêng của image đó.
:::

---

## Khái niệm: Registry và tag

![Docker Hub lưu image, tag chọn phiên bản](/slides/img/s07-k-registry-tag.svg)

- **Registry** là dịch vụ lưu trữ và phân phối image.
- **Tag** là nhãn gắn vào image để phân biệt phiên bản.
- Ví dụ trong dự án: `nginx:1.27-alpine` lấy từ Docker Hub.

::: details Ghi chú cho mentor
- Docker Hub và GHCR là hai registry phổ biến; ví dụ tag: `1.27-alpine`.
- Nên ghim một tag cụ thể thay vì `latest`, vì `latest` có thể trỏ tới phiên bản khác theo thời gian.
:::

---

## Quan hệ giữa image, container và registry

![Registry lưu image, image chạy thành nhiều container](/slides/img/s07-image-container-registry.svg)

::: details Ghi chú cho mentor
- Image: gói chỉ đọc. Container: một lần chạy của image. Registry: Docker Hub, GHCR.
- Tag là nhãn phiên bản, ví dụ `1.27-alpine`; luôn ghim tag cụ thể, không dùng `latest`.
:::

---

## Khái niệm: Docker, client và daemon

![Client docker gửi yêu cầu tới daemon dockerd](/slides/img/s07-k-docker-client-daemon.svg)

- **Docker** là nền tảng để xây dựng, phân phối và chạy container.
- Ví dụ trong dự án: lệnh `docker run` ở Bước 2 được client gửi tới daemon để tạo và khởi động container.

::: details Ghi chú cho mentor
- Lệnh `docker` là client: nó chỉ gửi yêu cầu qua API tới daemon `dockerd`, và daemon mới là thành phần quản lý image và container.
:::

---

## Bước 1 (10 phút): Client gửi lệnh, daemon thực thi

![docker CLI gửi API tới dockerd; dockerd điều khiển containerd, image store, registry](/slides/img/s07-docker-architecture.svg)

::: details Ghi chú cho mentor
- CLI chỉ gửi yêu cầu, daemon mới thực thi. Khi tắt Docker Desktop, lệnh báo không kết nối được daemon.
- Docker Desktop đóng gói sẵn daemon trong một máy ảo WSL2.
:::

---

## Bước 1: Kiểm tra Docker

```bash
docker version
docker run --rm hello-world
```

Kết quả: `docker version` có cả khối `Client:` và `Server:`; `hello-world` in `Hello from Docker!`.

**Kiểm tra: kết quả đúng khi** màn hình hiển thị `Hello from Docker!`.

::: details Ghi chú cho mentor
- Lần đầu có dòng `Unable to find image ... locally`: Docker tải image về.
- `--rm` tự xóa container sau khi thoát.
- Chỉ có `Client` kèm lỗi kết nối: Docker Desktop chưa khởi động xong (xem slide lỗi thường gặp).
:::

---

## Khái niệm: Port mapping (ánh xạ cổng)

![Cổng 8080 của máy nối tới cổng 80 trong container](/slides/img/s07-k-port-mapping.svg)

- **Port mapping** chuyển các kết nối đến một cổng của máy tới một cổng bên trong container, bằng tùy chọn `-p HOST:CONTAINER`.
- Ví dụ trong dự án: `-p 8080:80` chuyển cổng cổng 8080 của máy tới cổng 80 của Nginx.

::: details Ghi chú cho mentor
- **Cổng** (port) là số định danh giúp một máy phân biệt các dịch vụ mạng; một cổng của máy chỉ do một tiến trình sử dụng.
- Trong container, Nginx lắng nghe ở cổng 80.
:::

---

## Bước 2 (15 phút): Chạy Nginx lần đầu

Tải image, chạy nền và đặt tên cho container. Tag `1.27-alpine` được ghim để mọi máy dùng cùng một phiên bản.

```bash
docker pull nginx:1.27-alpine
docker run -d --name club-web -p 8080:80 nginx:1.27-alpine
curl -s http://localhost:8080 | head -5
```

Kết quả: HTML có `Welcome to nginx!`.

::: details Ghi chú cho mentor
- `-d` chạy nền; `--name` đặt tên để các lệnh sau tham chiếu được.
- Mở trình duyệt Windows tại `http://localhost:8080` để thấy cùng trang.
:::

---

## Bước 2: Cổng -p HOST:CONTAINER

![curl vào cổng 8080 của máy, đi tới nginx cổng 80 trong container](/slides/img/s07-port-8080.svg)

::: details Ghi chú cho mentor
- `-p 8080:80` có dạng `CỔNG-MÁY:CỔNG-TRONG-CONTAINER`. Nginx lắng nghe cổng 80 bên trong container; truy cập từ máy qua cổng 8080.
- Câu hỏi nhanh: số nào là cổng của máy?
:::

---

## Bước 2: Xem container đang chạy

```bash
docker ps
```

```text
CONTAINER ID   IMAGE               ...   PORTS                  NAMES
a1b2c3d4e5f6   nginx:1.27-alpine   ...   0.0.0.0:8080->80/tcp   club-web
```

**Kiểm tra: kết quả đúng khi** `curl` và trình duyệt cùng hiển thị "Welcome to nginx!", và cột PORTS có `0.0.0.0:8080->80/tcp`.

---

## Bước 3 (15 phút): Tạo lỗi cổng

Một cổng của máy chỉ một tiến trình sử dụng được. Chạy container thứ hai trên cùng cổng 8080:

```bash
docker run -d --name club-web2 -p 8080:80 nginx:1.27-alpine
```

```text
docker: Error response from daemon: ... Bind for 0.0.0.0:8080
failed: port is already allocated.
```

::: details Ghi chú cho mentor
- Để học viên tự chạy, quan sát lỗi thật trước khi sửa.
- Container `club-web2` vẫn được tạo ở trạng thái `Created` khi lỗi xảy ra.
:::

---

## Bước 3: Đổi sang cổng 8081

Xóa container lỗi, rồi chạy lại ở cổng khác. Cổng trong container vẫn là 80.

```bash
docker rm club-web2
docker run -d --name club-web2 -p 8081:80 nginx:1.27-alpine
curl -s -o /dev/null -w "8080 -> %{http_code}\n" http://localhost:8080
curl -s -o /dev/null -w "8081 -> %{http_code}\n" http://localhost:8081
docker rm -f club-web2
```

Kết quả: `8080 -> 200` và `8081 -> 200`.

**Kiểm tra: kết quả đúng khi** đã quan sát lỗi `port is already allocated`, và hai container chạy song song ở cổng 8080 và 8081.

---

## Khái niệm: Bind mount

![Thư mục club/frontend của máy gắn vào container](/slides/img/s07-k-bind-mount.svg)

- **Bind mount** gắn một thư mục của máy vào một đường dẫn bên trong container, bằng tùy chọn `-v`.
- Ví dụ trong dự án: `club/frontend` được gắn vào `/usr/share/nginx/html`, nơi Nginx đọc trang web.

::: details Ghi chú cho mentor
- Container đọc trực tiếp các tệp trên máy, nên thay đổi ở máy có hiệu lực ngay trong container.
- Hậu tố `:ro` làm cho container chỉ có quyền đọc.
:::

---

## Bước 4 (20 phút): Bind mount thư mục Club

![Thư mục club/frontend của máy được gắn chỉ đọc vào /usr/share/nginx/html của container](/slides/img/s07-bind-mount.svg)

::: details Ghi chú cho mentor
- `-v` là bind mount: gắn thư mục của máy vào container; `:ro` là chỉ đọc nên container không sửa được tệp trên máy.
- Dùng đường dẫn tuyệt đối (`$PWD`).
:::

---

## Bước 4: Phục vụ trang Club

Container cũ đang giữ cổng 8080 nên cần xóa trước. Chạy các lệnh từ `~/devops-labs`.

```bash
docker rm -f club-web
cd ~/devops-labs
docker run -d --name club-web -p 8080:80 \
  -v "$PWD/club/frontend:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8080 | grep "<title>"
```

Kết quả: `<title>Club Management</title>`.

**Kiểm tra: kết quả đúng khi** `curl` in `<title>Club Management</title>`, không phải trang "Welcome to nginx!".

---

## Bước 4: Mở trang Club trên trình duyệt

Mở `http://localhost:8080`. Trang hiển thị tiêu đề "Club Members" và dòng `Cannot load members: HTTP 404`.

Dòng này là kết quả đúng: trang cần API `/api/members` nhưng backend chưa tồn tại. Phần kết nối được thực hiện ở Ngày 8.

::: details Ghi chú cho mentor
- Trang hiện 403 hoặc 404 toàn trang (không phải dòng `Cannot load members`) thường do bind mount sai đường dẫn. Chạy `ls club/frontend` để kiểm tra thư mục không rỗng.
:::

---

## Bước 5 (15 phút): Sửa tệp, trang thay đổi theo

Thư mục được gắn vào container, do đó sửa tệp trên máy thì container thấy ngay. Đổi tiêu đề thành tên của người học:

```bash
cd ~/devops-labs
sed -i 's|<h1>Club Members</h1>|<h1>Club Members - TEN BAN</h1>|' club/frontend/index.html
curl -s http://localhost:8080 | grep "<h1>"
```

Kết quả: `<h1>Club Members - TEN BAN</h1>`. Tải lại trình duyệt để thấy cùng nội dung.

::: details Ghi chú cho mentor
- Yêu cầu học viên thay `TEN BAN` bằng tên của mình.
- Không cần chạy lại `docker run` vì container đọc đúng tệp trên máy.
:::

---

## Bước 5: Xem container đang làm gì

```bash
docker ps
docker logs club-web
```

Kết quả: `STATUS` có dạng `Up ... minutes`; log có các dòng `"GET / HTTP/1.1" 200` (tương ứng các lệnh `curl` đã chạy).

**Kiểm tra: kết quả đúng khi** tiêu đề trên trang có tên người học mà không cần chạy lại `docker run`.

---

## Bước 6 (10 phút): Dừng, xóa, dọn

Lệnh `stop` dừng container nhưng giữ lại container; lệnh `rm` xóa container (image vẫn còn).

```bash
docker stop club-web
docker ps
docker ps -a
docker rm club-web
```

Kết quả: sau `stop`, `docker ps` không còn `club-web` nhưng `docker ps -a` vẫn liệt kê với trạng thái `Exited`; sau `rm` thì container biến mất.

**Kiểm tra: kết quả đúng khi** `docker ps -a` không còn `club-web` hay `club-web2`.

::: details Ghi chú cho mentor
- Image `nginx:1.27-alpine` vẫn nằm trên máy, nên lần chạy sau không cần tải lại.
- Ngày 5 sẽ chạy lại container này, vì vậy việc xóa hôm nay không làm mất kết quả.
:::

---

## Lỗi thường gặp: Docker không chạy

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `command not found` | Thiếu tích hợp WSL | Bật Ubuntu |
| `Cannot connect to the Docker daemon` | Chưa chạy | Mở Docker |
| Lỗi WSL | Thiếu Virtualization | Bật trong BIOS |

::: details Ghi chú cho mentor
- Lỗi `docker: command not found` xảy ra trong WSL. Mở lại terminal sau khi bật.
- Lỗi WSL: Docker Desktop báo lỗi WSL hoặc ảo hóa; sau khi bật Virtualization chạy `wsl --update`.
- Đường dẫn bật WSL integration: Docker Desktop, Settings, Resources, WSL integration, bật Ubuntu, Apply; sau đó mở lại terminal.
- Với lỗi daemon: mở Docker Desktop, đợi báo Running, thử lại `docker version`.
- Lỗi WSL hoặc ảo hóa còn có thể do WSL cũ: chạy `wsl --update` trong PowerShell; Virtualization bật trong BIOS/UEFI.
:::

---

## Lỗi thường gặp: cổng và tên trùng

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng đã bị giữ | `docker ps`; xóa hoặc đổi cổng |
| `name is already in use` | Container cũ cùng tên | `docker rm -f club-web` |

::: details Ghi chú cho mentor
- Cổng có thể do container hoặc process khác giữ; ví dụ đổi cổng trái: `-p 8083:80`.
- Container cũ cùng tên vẫn tồn tại kể cả khi đã dừng.
- Khi không có container nào giữ cổng, một tiến trình khác của máy đang giữ cổng đó.
:::

---

## Lỗi thường gặp: trang 403 hoặc 404

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Trang hiện 403 hoặc 404 | Bind mount sai đường dẫn | Chạy từ `~/devops-labs`; `ls club/frontend` |

::: details Ghi chú cho mentor
- Thư mục gắn vào bị rỗng; dùng `"$PWD/club/frontend"` trong `docker run`.
- Dòng `Cannot load members: HTTP 404` trên trang Club là bình thường khi chưa có backend.
:::

---

## Tự kiểm tra

1. Vì sao `-p 8080:80` có hai số? Số nào là cổng của máy?
2. Khi gặp `port is already allocated`, cần điều tra như thế nào?
3. Vì sao sửa `index.html` mà không cần chạy lại `docker run`?

::: details Ghi chú cho mentor
- 1: Định dạng `CỔNG-MÁY:CỔNG-CONTAINER`. 8080 là cổng trên máy, 80 là cổng Nginx lắng nghe trong container.
- 2: `docker ps` cho biết container nào đang publish 8080; dừng hoặc xóa container đó, hoặc đổi cổng trái. Khi không có container nào, một tiến trình khác của máy đang giữ cổng.
- 3: Bind mount gắn thư mục của máy vào container nên container đọc đúng tệp vừa sửa. Với `:ro`, container chỉ có quyền đọc.
:::

---

## Tiếp theo

Ngày 5 vận hành và gỡ lỗi container: [Ngày 5 – Vận hành và gỡ lỗi container](session-08.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker overview](https://docs.docker.com/get-started/docker-overview/): Docker là gì và dùng để làm gì.
- **Tài liệu chính thức:** [Containers (Kubernetes docs)](https://kubernetes.io/docs/concepts/containers/): container và image nhìn từ góc độ chuẩn chung.
- **Tài liệu chính thức:** [About the Open Container Initiative](https://opencontainers.org/about/overview/): chuẩn mở cho image và container.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): hiểu mức cô lập và rủi ro của container.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): danh sách việc cần làm để Docker an toàn.
