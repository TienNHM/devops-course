# Slide buổi 08 – Docker CLI

> **Tóm tắt:** Dùng thành thạo Docker CLI để chạy, kiểm tra, debug, dừng, xóa container và đẩy image lên registry cục bộ, rồi chẩn đoán lỗi port bận và container thoát ngay. Bài lab đầy đủ: [Buổi 08](../../labs/week-04/session-08.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: vòng đời, quan sát, chẩn đoán](/slides/img/s08-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: chạy container với `-d`, `--name`, `-p`, `-e`, `--rm`; dừng, dọn dẹp an toàn; tag và push image lên registry cục bộ.
- Hỏi: ai từng gõ `docker run` rồi không biết nó đang ở đâu?
:::

---

## Slide 2: Chạy rồi mà không thấy gì

![docker ps trống sau docker run -d, ba câu hỏi chưa có đáp án](/slides/img/s08-no-visibility.svg)

::: details Ghi chú cho mentor
- Tình huống thật: `docker ps` trống dù vừa `docker run -d`; hoặc mở cổng quen thuộc và thấy một trang cũ không rõ từ đâu.
- Không có CLI thì chỉ còn cách đoán và khởi động lại máy.
- CLI trả lời: container nào chạy, image nào, in gì, nghe cổng nào, thoát với mã nào.
:::

---

## Slide 3: Image và container

| | Image | Container |
| --- | --- | --- |
| Bản chất | Gói chỉ đọc | Tiến trình từ image |
| Tạo bằng | `docker pull`, `build` | `docker run`, `create` |
| Xem bằng | `docker images` | `docker ps -a` |

Không xóa được image nếu còn container (kể cả đã dừng) dùng nó.

::: details Ghi chú cho mentor
- Xóa bằng: image dùng `docker image rm`, container dùng `docker rm`.
- Container có thêm một lớp ghi trên các layer chỉ đọc của image.
:::

---

## Slide 4: Vòng đời container

![Created, Running, Exited, Removed và các lệnh chuyển trạng thái](/slides/img/s08-lifecycle.svg)

::: details Ghi chú cho mentor
- Container sống chừng nào PID 1 còn sống.
- Tiến trình thoát thì container `Exited`, ExitCode được lưu lại.
- Hỏi: container `Exited` còn trên đĩa không?
:::

---

## Slide 5: Cú pháp docker run

![Các cờ -d, --name, -p, -e, --rm và ý nghĩa](/slides/img/s08-run-flags.svg)

::: details Ghi chú cho mentor
- `docker run` = pull (nếu thiếu) + create + start.
- `--name` phải duy nhất; `-p 8088:80` là host 8088 vào container 80.
:::

---

## Slide 6: Bốn cách nhìn vào container

![ps -a, logs, inspect, exec nhìn vào cùng một container](/slides/img/s08-observe-commands.svg)

```bash
docker logs -f --tail 20 web
docker exec -it web sh
```

::: details Ghi chú cho mentor
- Bộ ba chẩn đoán đầu tiên: `ps -a`, `logs`, `inspect`.
- `logs` đọc stdout và stderr của PID 1; `exec` thêm một tiến trình, không khởi động lại.
- Dừng và xóa: `docker stop web`, `docker rm web`.
:::

---

## Slide 7: Tên image đầy đủ

![localhost:5001/club/nginx:1.27-alpine tách thành registry, repository, tag](/slides/img/s08-image-name.svg)

::: details Ghi chú cho mentor
- Bỏ phần registry thì Docker hiểu là Docker Hub.
- `docker tag` chỉ thêm một cái tên, không sao chép dữ liệu.
- Tên sai (thiếu địa chỉ registry) là nguyên nhân push hỏng phổ biến nhất.
:::

---

## Slide 8: Demo 1: chạy, kiểm tra, vào trong

```bash
docker run -d --name demo-web -p 8088:80 nginx:1.27-alpine
docker ps
curl -I http://localhost:8088
docker exec demo-web wget -qO- http://localhost
```

Mong đợi: `0.0.0.0:8088->80/tcp` và `HTTP/1.1 200 OK`.

::: details Ghi chú cho mentor
- Hỏi lớp: nếu đổi thành `-p 8088:8088` thì chuyện gì xảy ra? (xem slide 13)
:::

---

## Slide 9: Demo 2: inspect với format

```bash
docker inspect --format '{{.State.Status}} exit={{.State.ExitCode}}' demo-web
docker logs --tail 5 demo-web
```

Mong đợi: `running exit=0` và vài dòng log nginx kèm một dòng `GET`.

::: details Ghi chú cho mentor
- `inspect` là nguồn sự thật về cấu hình thật; dùng `--format` để lọc, đừng dán toàn bộ output vào báo cáo.
:::

---

## Slide 10: Demo 3: container thoát ngay

![postgres thiếu POSTGRES_PASSWORD nên Exited (1); log nói rõ lý do](/slides/img/s08-exit-fast.svg)

```bash
docker run -d --name demo-pg postgres:17-alpine
docker ps -a --filter name=demo-pg
docker logs demo-pg
```

::: details Ghi chú cho mentor
- `docker ps` không thấy; `docker ps -a` hiện `Exited (1)`.
- Sửa: `docker rm demo-pg`, rồi chạy lại với `-e POSTGRES_PASSWORD=...`.
:::

---

## Slide 11: Demo 4: dừng và dọn

![stop gửi SIGTERM rồi SIGKILL, container còn trên đĩa; rm mới xóa hẳn](/slides/img/s08-stop-vs-rm.svg)

```bash
docker stop demo-web demo-pg
docker rm demo-web demo-pg
```

::: details Ghi chú cho mentor
- `stop` gửi SIGTERM, chờ 10 giây rồi SIGKILL; container còn trên đĩa.
- `rm -f` buộc dừng rồi xóa hẳn (log và lớp ghi mất theo).
:::

---

## Slide 12: Hands-on lab và thử thách

| Phần | Việc làm |
| --- | --- |
| Lab L1 | Chạy và soi Nginx, vòng đời |
| Lab L1 | Postgres thất bại rồi thành công |
| Lab L1 | Tag và push lên registry cục bộ |
| Thử thách L2 | Tình huống 01, 02; checklist chẩn đoán |

Lệnh và kết quả mong đợi: [Buổi 08 – Hands-on lab](../../labs/week-04/session-08.md#hands-on-lab).

::: details Ghi chú cho mentor
- Lab 60 phút, mức L1. Thử thách L2: xung đột cổng và container thoát ngay, đưa smoke test vào `commands.sh`.
- Nộp: `evidence/command-output.txt`, `source/commands.sh`, `report.md`.
:::

---

## Slide 13: Break: nhầm cổng container

![-p 8088:8088 bị reset vì nginx nghe cổng 80; -p 8088:80 thành công](/slides/img/s08-port-wrong.svg)

::: details Ghi chú cho mentor
- Container `Up` nhưng `curl` bị reset: dùng `docker port` và `docker exec ... netstat -ltn` để xem cổng thật.
- Sửa thành `-p 8088:80`.
:::

---

## Slide 14: Lỗi hay gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `port is already allocated` | `docker ps --filter publish=PORT`, đổi cổng host |
| `docker ps` trống sau `run -d` | `docker ps -a`, `docker logs`, xem ExitCode |
| `denied` khi push | Tag lại với tên có địa chỉ registry |

::: details Ghi chú cho mentor
- Cho học viên đoán nguyên nhân trước khi mở bảng.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: PID 1, bộ ba chẩn đoán, -p trái phải](/slides/img/s08-recap.svg)

::: details Ghi chú cho mentor
- `stop` giữ lại container, `rm` xóa; `--rm` cho lệnh một lần.
- Tên image đầy đủ gồm registry, repository, tag; pin tag.
:::
