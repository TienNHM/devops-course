# Slide Ngày 04 – Chạy trang Club bằng container

> **Tóm tắt:** Cài Docker Desktop, chạy container Nginx và phục vụ trang web của dự án Club từ container ở `localhost:8080`; hiểu cổng bằng cách tự gây lỗi `port is already allocated`. Bài lab đầy đủ: [Ngày 4](../../labs/week-04/session-07.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: cài Docker, chạy Nginx, phục vụ trang Club](/slides/img/s07-goals.svg)

::: details Ghi chú cho mentor
- Sản phẩm cuối ngày: trang `club/frontend` chạy trong container, mở ở `http://localhost:8080`.
- Hình có thể còn chữ về VM; bỏ qua, hôm nay không dạy so sánh VM và container.
- Hỏi: ai từng nghe câu "máy tôi chạy được mà"?
:::

---

## Slide 2: "Máy tôi chạy được mà"

![Cùng mã nguồn: máy A chạy tốt, máy B và máy chung bị lỗi](/slides/img/s07-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Trang web CLB chạy ở máy A, lỗi ở máy B: sai phiên bản, thiếu thư viện, cổng bị chiếm.
- Cần một đơn vị đóng gói chạy giống nhau ở mọi nơi: container.
:::

---

## Slide 3: Image, container, registry

![Registry lưu image, image chạy thành nhiều container](/slides/img/s07-image-container-registry.svg)

::: details Ghi chú cho mentor
- Image: gói chỉ đọc. Container: một lần chạy của image. Registry: Docker Hub, GHCR.
- Tag là nhãn phiên bản, ví dụ `1.27-alpine`; luôn ghim tag cụ thể, không dùng `latest`.
:::

---

## Slide 4: Client gõ lệnh, daemon làm việc

![docker CLI gửi API tới dockerd; dockerd điều khiển containerd, image store, registry](/slides/img/s07-docker-architecture.svg)

::: details Ghi chú cho mentor
- CLI chỉ gửi yêu cầu, daemon mới làm việc. Tắt Docker Desktop thì lệnh báo không kết nối được daemon.
- Docker Desktop gói sẵn daemon trong một VM WSL2.
:::

---

## Slide 5: Demo 1: kiểm tra và chạy Nginx

```bash
docker version
docker run --rm hello-world
docker pull nginx:1.27-alpine
docker run -d --name club-web -p 8080:80 nginx:1.27-alpine
curl -s http://localhost:8080 | head -5
```

::: details Ghi chú cho mentor
- `docker version` phải có cả Client và Server. Lần đầu có dòng `Unable to find image ... locally`.
- `-d` chạy nền, `--name` đặt tên, `--rm` tự xóa khi thoát.
:::

---

## Slide 6: Cổng: `-p HOST:CONTAINER`

![curl vào cổng 8081 của host, đi tới nginx cổng 80; file index.html được mount chỉ đọc](/slides/img/s07-nginx-port-mount.svg)

::: details Ghi chú cho mentor
- Hình dùng cổng 8081; bài lab dùng 8080 cho trang Club. Số trái là của máy bạn, số phải là của container.
- Chỉ một process giữ một cổng của máy. Cho học viên chạy container thứ hai trên cùng cổng để thấy lỗi.
:::

---

## Slide 7: Demo 2: phục vụ trang Club

```bash
docker rm -f club-web
cd ~/devops-labs
docker run -d --name club-web -p 8080:80 \
  -v "$PWD/club/frontend:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8080 | grep "<title>"
```

Trang hiện "Club Members"; dòng `Cannot load members: HTTP 404` là đúng vì chưa có backend (Ngày 8).

::: details Ghi chú cho mentor
- `-v` là bind mount: gắn thư mục của máy vào container; `:ro` là chỉ đọc. Dùng đường dẫn tuyệt đối.
- Sửa `club/frontend/index.html` rồi tải lại trình duyệt: trang đổi ngay, không cần `docker run` lại.
:::

---

## Slide 8: Lab Ngày 4

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Kiểm tra Docker | `Hello from Docker!` |
| 2 | Nginx ở cổng 8080 | `curl` ra "Welcome to nginx!" |
| 3 | Gây lỗi cổng, đổi sang 8081 | `8080 -> 200`, `8081 -> 200` |
| 4-5 | Mount `club/frontend`, sửa tiêu đề | `<title>Club Management</title>` |
| 6-7 | Dọn, ghi `notes/day-04.md` | `docker ps -a` sạch |

Lệnh và kết quả mong đợi: [Ngày 4 – Chạy trang Club bằng container](../../labs/week-04/session-07.md).

---

## Slide 9: Lỗi hay gặp: port is already allocated

```text
docker: Error response from daemon: ... Bind for 0.0.0.0:8080
failed: port is already allocated.
```

Một cổng của máy chỉ một process lắng nghe. Tìm thủ phạm bằng `docker ps`.

::: details Ghi chú cho mentor
- Container ở trạng thái `Created` vẫn bị tạo ra khi lỗi này xảy ra; xóa bằng `docker rm`.
- Không phải container thì kiểm tra process của máy.
- Các lỗi khác (`command not found`, không kết nối daemon, trùng tên): xem bảng Gặp lỗi? trong bài lab.
:::

---

## Slide 10: Recap

![Ba điều cần nhớ: process cô lập, CLI gửi lệnh daemon làm việc, image khác container](/slides/img/s07-recap.svg)

Ngày tiếp theo: [Ngày 5 – Vận hành và gỡ lỗi container](session-08.md).

::: details Ghi chú cho mentor
- Cờ cần nhớ: `-p HOST:CONTAINER`, `-v`, `-d`, `--rm`, `--name`.
:::

---

## Slide 11: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker overview](https://docs.docker.com/get-started/docker-overview/): Docker là gì và dùng để làm gì.
- **Tài liệu chính thức:** [Containers (Kubernetes docs)](https://kubernetes.io/docs/concepts/containers/): container và image nhìn từ góc độ chuẩn chung.
- **Tài liệu chính thức:** [About the Open Container Initiative](https://opencontainers.org/about/overview/): chuẩn mở cho image và container.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): hiểu mức cô lập và rủi ro của container.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): danh sách việc cần làm để Docker an toàn.
