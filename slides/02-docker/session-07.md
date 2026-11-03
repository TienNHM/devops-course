# Slide buổi 07 – Container Fundamentals

> **Tóm tắt:** Phân biệt VM và container, đọc kiến trúc Docker (client, daemon, registry), cài Docker Desktop và chạy, kiểm tra, dọn một container Nginx. Bài lab đầy đủ: [Buổi 07](../../labs/week-04/session-07.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: so sánh VM và container, đọc luồng docker run, chạy Nginx](/slides/img/s07-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích khác biệt VM và container; vẽ lại luồng `docker run`; chạy Nginx với port mapping và bind mount; chẩn đoán lỗi `port is already allocated`.
- Hỏi: ai từng nghe câu "máy tôi chạy được mà"?
:::

---

## Slide 2: "Máy tôi chạy được mà"

![Cùng mã nguồn: máy A chạy tốt, máy B và máy chung bị lỗi](/slides/img/s07-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- API Node.js 22 chạy ở máy A, lỗi ở máy B: sai phiên bản Node, thiếu thư viện, cổng bị chiếm.
- Mentor deploy lên máy chung lại lỗi theo kiểu khác.
- Cần một đơn vị đóng gói chạy giống nhau ở mọi nơi.
:::

---

## Slide 3: Container giải quyết thế nào

Đóng gói app cùng runtime, thư viện, cấu hình tối thiểu thành một **image**.

Ví von: hộp cơm đóng sẵn, mang đi đâu mở ra cũng ăn được như nhau.

::: details Ghi chú cho mentor
- Máy ảo cũng làm được nhưng nặng: mỗi VM mang cả một hệ điều hành.
- Ứng dụng xuyên suốt khóa: Club Management (backend, frontend, database).
:::

---

## Slide 4: VM nặng, container nhẹ

![VM mỗi cái một kernel; container dùng chung kernel của host](/slides/img/s07-vm-vs-container.svg)

::: details Ghi chú cho mentor
- Cô lập: VM mạnh hơn; container yếu hơn nhưng đủ cho đa số ứng dụng.
- Trên Windows, "kernel của host" là kernel Linux của WSL2.
:::

---

## Slide 5: Container thực chất là gì

![Namespaces, cgroups và union filesystem tạo nên container](/slides/img/s07-container-anatomy.svg)

::: details Ghi chú cho mentor
- Nhấn mạnh: container là một process Linux bình thường, không phải máy ảo nhỏ.
- Namespaces: PID, network, mount, hostname riêng. cgroups: giới hạn và đo CPU, RAM. Union filesystem: layer chỉ đọc cộng một lớp ghi mỏng.
:::

---

## Slide 6: Image, container, registry

![Registry lưu image, image chạy thành nhiều container](/slides/img/s07-image-container-registry.svg)

::: details Ghi chú cho mentor
- Image: gói chỉ đọc (filesystem và metadata). Container: một lần chạy của image, có lớp ghi. Registry: Docker Hub, GHCR.
- Tag là nhãn phiên bản, ví dụ `1.27-alpine`; luôn ghim tag cụ thể, không dùng `latest` trong ví dụ cần tái lập.
:::

---

## Slide 7: Kiến trúc Docker

![docker CLI gửi API tới dockerd; dockerd điều khiển containerd, image store, registry](/slides/img/s07-docker-architecture.svg)

::: details Ghi chú cho mentor
- CLI chỉ gửi yêu cầu, daemon mới làm việc.
- Docker Desktop gói sẵn daemon trong một VM WSL2.
:::

---

## Slide 8: Luồng khi gõ docker run

![Năm bước từ docker run đến container, qua CLI, dockerd và registry](/slides/img/s07-docker-run-flow.svg)

::: details Ghi chú cho mentor
- Yêu cầu học viên tự kể lại 5 bước không nhìn hình.
- Lần chạy thứ hai image đã có trong local store nên không có bước pull.
:::

---

## Slide 9: Demo 1: kernel dùng chung

![Hai dòng uname -r giống nhau trên host và trong container Alpine](/slides/img/s07-shared-kernel.svg)

```bash
docker version
docker run --rm hello-world
uname -r
docker run --rm alpine:3.20 uname -r
```

::: details Ghi chú cho mentor
- `docker version` có hai khối Client và Server; lần chạy đầu có dòng `Unable to find image ... locally`, lần hai không pull lại.
- Hai dòng `uname -r` giống nhau: image chỉ chứa user space, không chứa kernel.
:::

---

## Slide 10: Demo 2: Nginx, port mapping, bind mount

![curl vào cổng 8081 của host, đi tới nginx cổng 80; file index.html được mount chỉ đọc](/slides/img/s07-nginx-port-mount.svg)

```bash
docker run -d --name nginx-demo -p 8081:80 \
  -v "$PWD/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8081
```

::: details Ghi chú cho mentor
- `-p 8081:80` là `HOST:CONTAINER`; `:ro` là mount chỉ đọc.
- `docker exec nginx-demo ps`: `nginx: master process` là PID 1.
:::

---

## Slide 11: Hands-on lab

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Kiểm tra cài đặt | `uname -r` hai dòng trùng |
| 2 | Chạy Nginx với trang của bạn | `curl` ra HTML của bạn |
| 3 | Quan sát: `logs`, `exec`, `inspect` | Thấy `Mounts` |
| 4 | Dừng, xóa, dọn | `docker ps -a` sạch |

Lệnh và kết quả mong đợi: [Buổi 07 – Hands-on lab](../../labs/week-04/session-07.md#hands-on-lab).

::: details Ghi chú cho mentor
- Lab 60 phút, mức L1: kiểm tra cài đặt, chạy Nginx, quan sát, chứng minh dữ liệu tạm, dừng và dọn.
- Nộp: `evidence/command-output.txt`, `source/index.html`, `report.md`.
:::

---

## Slide 12: Lỗi hay gặp: port is already allocated

```text
docker: Error response from daemon: ... Bind for 0.0.0.0:8081
failed: port is already allocated.
```

Một cổng của host chỉ một process lắng nghe. Tìm thủ phạm bằng `docker ps`.

::: details Ghi chú cho mentor
- Container ở trạng thái `Created` vẫn bị tạo ra khi lỗi này xảy ra.
- Không phải container thì kiểm tra process của host.
- Các lỗi khác (`command not found`, không kết nối daemon, trùng tên): xem bảng Gặp lỗi? trong bài lab.
:::

---

## Slide 13: Thử thách

Chứng minh kernel dùng chung với `alpine:3.20` và `ubuntu:24.04`.

Chỉ ra client, daemon, registry bằng ít nhất 3 dòng output.

::: details Ghi chú cho mentor
- Thử thách thêm: giới hạn RAM và CPU rồi đo; so sánh với VM bằng số liệu thật.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: process cô lập, CLI gửi lệnh daemon làm việc, image khác container](/slides/img/s07-recap.svg)

::: details Ghi chú cho mentor
- Cờ cần nhớ: `-p HOST:CONTAINER`, `-v`, `-d`, `--rm`.
- Dữ liệu trong container là tạm thời, cần volume (buổi 12).
:::

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker overview](https://docs.docker.com/get-started/docker-overview/): Docker là gì và dùng để làm gì.
- **Tài liệu chính thức:** [Containers (Kubernetes docs)](https://kubernetes.io/docs/concepts/containers/): container và image nhìn từ góc độ chuẩn chung.
- **Tài liệu chính thức:** [About the Open Container Initiative](https://opencontainers.org/about/overview/): chuẩn mở cho image và container.
- **Best practice:** [Docker Engine security](https://docs.docker.com/engine/security/): hiểu mức cô lập và rủi ro của container.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): danh sách việc cần làm để Docker an toàn.
