# Slide buổi 09 – Dockerfile

> **Tóm tắt:** Viết, build và chạy Dockerfile cho Node.js API của CLB; hiểu build context, ENV, CMD và ENTRYPOINT, và chẩn đoán lỗi build do sai thư mục. Bài lab đầy đủ: [Buổi 09](../../labs/week-05/session-09.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: viết Dockerfile, build image, chạy và gọi API](/slides/img/s09-goals.svg)

::: details Ghi chú cho mentor
- Chỉ thị cần biết: `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, `CMD`, `ENTRYPOINT`.
- Build `club-api:lab9` từ `starter-project/backend`, gọi được `/health`.
- Cache, `.dockerignore`, `USER node`, tag: để dành cho [Buổi 10](session-10.md).
:::

---

## Slide 2: Mỗi người build ra một kiểu

![Máy Hùng Node 22, máy Lan Node 18, máy chung mỗi lần một kiểu; Dockerfile là công thức chung](/slides/img/s09-different-builds.svg)

::: details Ghi chú cho mentor
- Máy Hùng dùng Node 22; máy Lan dùng Node 18 và `npm install` ra bộ thư viện khác.
- Container chỉ chạy được khi có image; Dockerfile là công thức tái lập, nằm cùng mã nguồn trong Git.
:::

---

## Slide 3: Dockerfile là công thức, image là sản phẩm

![Mỗi dòng Dockerfile ứng với một layer hoặc một mục metadata](/slides/img/s09-dockerfile-layers.svg)

::: details Ghi chú cho mentor
- Mỗi `COPY`, `RUN` tạo một **layer** chỉ đọc.
- `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata, không tạo dữ liệu mới.
- Đọc từng dòng từ trên xuống, hỏi: dòng này tạo layer hay metadata?
:::

---

## Slide 4: Image chỉ đọc, container thêm lớp ghi

![Image là chồng layer chỉ đọc cộng metadata; container thêm một lớp ghi mỏng](/slides/img/s09-image-vs-container.svg)

::: details Ghi chú cho mentor
- Image = chồng layer + metadata (lệnh mặc định, ENV, port khai báo).
- Container = image + một lớp ghi mỏng.
:::

---

## Slide 5: Các chỉ thị chính

| Chỉ thị | Làm gì | Lưu ý |
| --- | --- | --- |
| `FROM` | Chọn base image | `node:22-alpine` |
| `COPY` | Chép từ context vào image | Tính theo context |
| `RUN` | Chạy lệnh lúc build | `npm ci` |
| `ENV`, `EXPOSE` | Mặc định và khai báo cổng | `EXPOSE` chỉ là tài liệu |

::: details Ghi chú cho mentor
- `WORKDIR`: thư mục làm việc, thay cho `RUN cd`.
- `ENV`: biến môi trường mặc định, không đặt secret; `-e` ghi đè.
- `EXPOSE` không mở cổng ra host; muốn truy cập từ host cần `-p`.
:::

---

## Slide 6: Build context

![Build ở lab-09 không thấy Dockerfile; cd source rồi build thì COPY thấy mọi file](/slides/img/s09-build-context.svg)

::: details Ghi chú cho mentor
- Dấu `.` cuối lệnh `docker build` là **build context**, thư mục gửi cho builder.
- `COPY` chỉ thấy file trong context, không tính theo vị trí Dockerfile.
- Hai cách đúng: `cd` vào thư mục có Dockerfile, hoặc ghi rõ `-f` và context.
:::

---

## Slide 7: Từ source đến container

![source gửi context cho docker build, BuildKit đọc Dockerfile, ra image rồi docker run](/slides/img/s09-build-flow.svg)

::: details Ghi chú cho mentor
- Vì sao thứ tự `COPY package.json` trước `COPY . .` quan trọng: học ở Buổi 10 (build cache).
- Bây giờ chỉ cần viết đúng thứ tự này.
:::

---

## Slide 8: CMD và ENTRYPOINT

![CMD bị thay thế khi truyền lệnh; ENTRYPOINT được nối thêm đối số](/slides/img/s09-cmd-entrypoint.svg)

::: details Ghi chú cho mentor
- Ghi đè: `CMD` bằng cách truyền lệnh sau tên image; `ENTRYPOINT` phải dùng `--entrypoint`.
- Exec form `["node", "server.js"]` chạy trực tiếp, process là PID 1, nhận tín hiệu từ `docker stop`.
- Shell form `node server.js` chạy qua `/bin/sh -c`.
:::

---

## Slide 9: PID 1 và docker stop

![Không xử lý SIGTERM thì docker stop chờ 10 giây rồi SIGKILL; --init giúp thoát nhanh](/slides/img/s09-pid1-sigterm.svg)

::: details Ghi chú cho mentor
- Node là PID 1 trong container; `server.js` không xử lý `SIGTERM`.
- Kernel không áp dụng hành vi mặc định cho PID 1, nên `docker stop` chờ khoảng 10 giây rồi `SIGKILL`.
- Cách khắc phục: bắt `SIGTERM` trong mã, hoặc `docker run --init`.
:::

---

## Slide 10: Demo

```bash
docker build -f Dockerfile.naive -t hello-node:naive .
docker run -d --name hello -p 38081:3000 hello-node:naive
curl -s localhost:38081/health
docker image ls
docker exec hello id
```

Image rất nặng, container chạy bằng root. [Buổi 10](session-10.md) trả lời vì sao.

::: details Ghi chú cho mentor
- Build `Dockerfile.naive` của `hello-node` (kiểm tra tên file và cổng ở thư mục demo trước khi chạy).
- Sửa một dòng mã rồi build lại: bước cài dependency chạy lại từ đầu.
- Ba hiện tượng (image nặng, build chậm, chạy bằng root) chưa cần giải thích ở buổi này.
:::

---

## Slide 11: Lab: bốn phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Dockerfile cho `club-api` | `/health` ok, `/ready` trả `503` |
| 2 | `ENV` và `docker run -e` | Giá trị bị ghi đè |
| 3 | `CMD`, `ENTRYPOINT`, `--init` | `docker stop` nhanh |
| 4 | Build sai thư mục | Đọc lỗi và sửa |

Lệnh chi tiết: [Buổi 09](../../labs/week-05/session-09.md).

::: details Ghi chú cho mentor
- `/ready` trả `503` vì chưa có database; bình thường ở buổi này, Buổi 11 và 12 sẽ nối API với DB.
:::

---

## Slide 12: Break: build sai context

```text
ERROR: failed to solve: failed to read dockerfile:
open Dockerfile: no such file or directory
```

Nguyên nhân gốc: context không chứa file mà Dockerfile tham chiếu. Sửa: `cd source` rồi build.

::: details Ghi chú cho mentor
- Tình huống 05. Thêm `-f source/Dockerfile` nhưng context vẫn là thư mục cha: lỗi `"/package.json": not found`.
- Hai cách sửa: `cd source` rồi build, hoặc `-f source/Dockerfile` kèm context `source`.
:::

---

## Slide 13: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `failed to read dockerfile` | Build đúng thư mục hoặc `-f` kèm context |
| `COPY` báo `not found` | Kiểm tra context (đối số cuối) |
| Container thoát ngay | `docker logs`, kiểm tra đường dẫn trong `CMD` |
| `docker stop` mất 10 giây | Bắt `SIGTERM` hoặc dùng `--init` |

::: details Ghi chú cho mentor
- Thêm: `npm ci` lệch `package-lock.json` thì cập nhật lock file, commit cả hai.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: build context, ENV và EXPOSE, CMD và ENTRYPOINT](/slides/img/s09-recap.svg)

::: details Ghi chú cho mentor
- Thử thách ở nhà: giải thích `CMD` và `ENTRYPOINT` bằng bằng chứng của bạn; điều tra lỗi build context.
- Buổi sau: tối ưu image với layer cache, `.dockerignore`, multi-stage, `USER node`.
:::
