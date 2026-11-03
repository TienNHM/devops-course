# Slide Ngày 05 – Vận hành và sửa lỗi container

> **Tóm tắt:** Dùng `ps`, `logs`, `exec`, `inspect`, `stop`, `rm` để vận hành container của dự án Club, rồi sửa hai container hỏng: thoát ngay và sai cổng. Bài lab đầy đủ: [Ngày 5](../../labs/week-04/session-08.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: vòng đời, quan sát, chẩn đoán](/slides/img/s08-goals.svg)

::: details Ghi chú cho mentor
- Chốt sản phẩm: 6 lệnh cốt lõi và hai container hỏng được sửa bằng cách đọc log, không đoán.
- Hỏi: ai từng gõ `docker run` rồi không biết nó đang ở đâu?
:::

---

## Slide 2: Chạy rồi mà không thấy gì

![docker ps trống sau docker run -d, ba câu hỏi chưa có đáp án](/slides/img/s08-no-visibility.svg)

::: details Ghi chú cho mentor
- Tình huống thật: `docker ps` trống dù vừa `docker run -d`; hoặc container `Up` mà trang web không mở được.
- CLI trả lời: container nào chạy, in gì, nghe cổng nào, thoát với mã nào.
:::

---

## Slide 3: Vòng đời container

![Created, Running, Exited, Removed và các lệnh chuyển trạng thái](/slides/img/s08-lifecycle.svg)

::: details Ghi chú cho mentor
- Container sống chừng nào tiến trình chính còn sống; tiến trình thoát thì container `Exited` và ExitCode được lưu lại.
- Hỏi: container `Exited` còn trên đĩa không?
:::

---

## Slide 4: Cú pháp docker run

![Các cờ -d, --name, -p, -e, --rm và ý nghĩa](/slides/img/s08-run-flags.svg)

::: details Ghi chú cho mentor
- `--name` phải duy nhất; `-p 8080:80` là cổng máy bạn 8080 vào cổng 80 trong container.
- `-e` truyền biến môi trường; cần ở slide Postgres.
:::

---

## Slide 5: Bốn cách nhìn vào container

![ps -a, logs, inspect, exec nhìn vào cùng một container](/slides/img/s08-observe-commands.svg)

```bash
docker logs -f --tail 20 club-web
docker exec -it club-web sh
```

::: details Ghi chú cho mentor
- Bộ ba chẩn đoán đầu tiên: `ps -a`, `logs`, `inspect`.
- `logs` đọc stdout và stderr của tiến trình chính; `exec` thêm một tiến trình, không khởi động lại.
:::

---

## Slide 6: Demo: chạy, soi và dừng web Club

```bash
docker run -d --name club-web -p 8080:80 \
  -v ~/devops-labs/club/frontend:/usr/share/nginx/html:ro \
  nginx:1.27-alpine
docker ps
curl -I http://localhost:8080
docker inspect --format '{{.State.Status}} exit={{.State.ExitCode}}' club-web
docker stop club-web
```

Mong đợi: `0.0.0.0:8080->80/tcp`, `HTTP/1.1 200 OK`, `running exit=0`; sau `stop` thì `docker ps` không còn container.

::: details Ghi chú cho mentor
- Chạy `docker ps -a` sau `stop`: container `Exited (0)` vẫn còn. `docker rm` mới xóa hẳn.
- `inspect` là nguồn sự thật; dùng `--format`, đừng dán toàn bộ output.
:::

---

## Slide 7: Hỏng số 1: thoát ngay

![postgres thiếu POSTGRES_PASSWORD nên Exited (1); log nói rõ lý do](/slides/img/s08-exit-fast.svg)

```bash
docker run -d --name club-db-bad postgres:17-alpine
docker ps -a --filter name=club-db-bad
docker logs club-db-bad
```

::: details Ghi chú cho mentor
- `docker ps` không thấy; `docker ps -a` hiện `Exited (1)`.
- Sửa: `docker rm club-db-bad`, rồi chạy lại với `-e POSTGRES_PASSWORD=...`.
:::

---

## Slide 8: Hỏng số 2: nhầm cổng container

![-p 8088:8088 bị reset vì nginx nghe cổng 80; -p 8088:80 thành công](/slides/img/s08-port-wrong.svg)

::: details Ghi chú cho mentor
- Trong lab dùng `-p 8081:8080` (sai) và `-p 8081:80` (đúng); ảnh minh họa dùng số cổng khác nhưng cùng lỗi.
- Container `Up` mà `curl` bị reset: dùng `docker exec ... netstat -ltn` để xem cổng Nginx thật nghe.
:::

---

## Slide 9: Lab: năm bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Chạy web Club, `logs`, `exec`, `inspect` | `curl` trả `200` |
| 2 | `stop`, `start`, `rm` | `Exited (0)` |
| 3 | Sửa Postgres thoát ngay | `accepting connections` |
| 4 | Sửa container sai cổng | `curl` trả `200` |
| 5 | `notes/day-05.md` + Pull Request | Note vào `main` |

Lệnh đầy đủ: [Ngày 5](../../labs/week-04/session-08.md).

---

## Slide 10: Recap

![Ba điều cần nhớ: PID 1, bộ ba chẩn đoán, -p trái phải](/slides/img/s08-recap.svg)

Ngày tiếp theo: [Ngày 6 – Dockerfile cho Club API](session-09.md).

---

## Slide 11: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker CLI reference](https://docs.docker.com/reference/cli/docker/): tra cứu mọi lệnh và cờ của docker.
- **Tài liệu chính thức:** [docker container run](https://docs.docker.com/reference/cli/docker/container/run/): các cờ quan trọng của lệnh docker run.
- **Tài liệu chính thức:** [View container logs](https://docs.docker.com/engine/logging/): xem log để tìm lỗi container.
- **Best practice:** [Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/): giới hạn CPU và RAM cho container.
- **Best practice:** [Run the daemon rootless](https://docs.docker.com/engine/security/rootless/): chạy Docker không cần quyền root.
