# Slide buổi 10 – Image Optimization

> **Tóm tắt:** Làm image nhỏ hơn, build nhanh hơn, an toàn hơn bằng layer cache, .dockerignore, multi-stage, non-root user và tagging, rồi chứng minh bằng số liệu. Bài lab đầy đủ: [Buổi 10](../../labs/week-05/session-10.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: hiểu layer, image gọn, chạy an toàn](/slides/img/s10-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Mục tiêu chi tiết: đọc `docker history` và `docker image ls`; viết `.dockerignore`; multi-stage, non-root, chứng minh bằng `id`; phân biệt tag với digest.
- Hỏi: ai từng build image trên 1 GB?
:::

---

## Slide 2: Một Dockerfile ẩu gây ba vấn đề

![Dockerfile ba dòng gây ra image nặng, build chậm, lộ .env](/slides/img/s10-problem.svg)

::: details Ghi chú cho mentor
- Dockerfile đầu tiên: `FROM node:22`, `COPY . .`, `RUN npm install`. Image nặng hơn 1 GB.
- Sửa một dòng code, CI cài lại dependency mất vài phút; `COPY . .` chép cả `.env` chứa mật khẩu.
- Ba vấn đề chung một gốc: không hiểu image được tạo thế nào.
:::

---

## Slide 3: Layer bất biến: xóa sau không làm nhỏ lại

![Chồng layer chỉ đọc; rm ở lớp trên không xóa 200 MB của lớp dưới](/slides/img/s10-layers.svg)

::: details Ghi chú cho mentor
- `RUN`, `COPY`, `ADD` tạo layer mới; container thêm một writable layer mỏng, mất khi xóa container.
- `RUN npm install` tạo 200 MB, `RUN rm -rf cache` ở lớp sau vẫn không làm image nhỏ lại.
- Muốn bỏ thứ gì khỏi image: đừng đưa nó vào (`.dockerignore`, multi-stage).
:::

---

## Slide 4: Build cache: thứ tự lệnh quyết định tốc độ

![So sánh COPY . . trước npm install với copy manifest trước](/slides/img/s10-cache-order.svg)

::: details Ghi chú cho mentor
- Mỗi lệnh được so khớp cache; `COPY` so sánh checksum nội dung file.
- Một layer mất cache thì mọi layer phía sau build lại. Ví von: xếp bánh nhiều tầng.
- Nguyên tắc: ít đổi (base, dependency) đặt trước, hay đổi (source code) đặt sau.
:::

---

## Slide 5: .dockerignore lọc build context

![Thư mục dự án đi qua .dockerignore, chỉ file cần thiết vào context](/slides/img/s10-context.svg)

::: details Ghi chú cho mentor
- `docker build .` gửi cả thư mục `.` (build context) cho builder trước khi đọc Dockerfile.
- Nên ignore: `node_modules`, `.git`, `.env`, `*.pem`, `tests`, `*.md`, `Dockerfile*`.
- Không ignore file mà Dockerfile cần `COPY` (ví dụ `package-lock.json`).
:::

---

## Slide 6: Multi-stage: chỉ mang kết quả sang stage cuối

![Stage deps cài dependency, stage runtime chỉ lấy node_modules](/slides/img/s10-multistage.svg)

::: details Ghi chú cho mentor
- Stage `deps` chép riêng manifest, chạy `npm ci --omit=dev`; chỉ build lại khi lockfile đổi.
- Stage `runtime` bắt đầu từ base sạch, lấy `node_modules` bằng `COPY --from=deps`; code chép sau cùng, `USER node` đặt cuối.
- Sửa `server.js`: chỉ `COPY server.js` và layer sau bị tạo lại.
- Ví von: nhà bếp nấu xong chỉ bê món ra bàn, không bê cả bếp.
:::

---

## Slide 7: Base nhỏ và chạy bằng user node

![Biểu đồ size base image và so sánh root với user node](/slides/img/s10-base-user.svg)

::: details Ghi chú cho mentor
- `node:22` trên 1 GB; `node:22-slim` khoảng 200-250 MB; `node:22-alpine` khoảng 150-200 MB (số đo thật có thể khác).
- Mặc định tiến trình chạy bằng root (uid 0); image `node` có sẵn user `node` (uid 1000). Dùng `USER node` và `COPY --chown=node:node`.
- Ví von: nhân viên có thẻ ra vào phòng mình, không có chìa khóa cả tòa nhà.
:::

---

## Slide 8: Tag là nhãn, digest là định danh

![Ba tag trỏ cùng một IMAGE ID; deploy dùng tag version, không dùng latest](/slides/img/s10-tags.svg)

::: details Ghi chú cho mentor
- Tag có thể bị gán lại; `latest` chỉ là một tag bình thường, không có nghĩa "mới nhất".
- Digest `sha256:...` định danh theo nội dung; chỉ ổn định sau khi push lên registry (cột DIGEST có thể là `none` khi chưa push).
- Deploy luôn dùng tag version cụ thể: `club-api:1.0.0`.
:::

---

## Slide 9: Demo: trước và sau

![Bảng so sánh naive và optimized: size, rebuild, .env, user](/slides/img/s10-compare.svg)

::: details Ghi chú cho mentor
- Baseline: build `Dockerfile.naive` của `hello-node`, thêm `big.bin` và `.env` giả; `transferring context` khoảng 31 MB.
- Sửa code, build lại naive: không có `CACHED`. Thêm `.dockerignore` rồi build `Dockerfile.optimized`: khoảng 200-250 MB.
- Số liệu minh họa; hãy cho lớp tự đọc số của họ.
:::

---

## Slide 10: Demo: chứng minh ba vấn đề

```text
$ docker run --rm hello-node:1.0.0-naive cat /app/.env
DB_PASSWORD=changeme-demo
$ docker run --rm hello-node:1.0.0-naive id
uid=0(root) gid=0(root) groups=0(root)
$ docker run --rm --entrypoint id hello-node:1.0.0
uid=1000(node) gid=1000(node) groups=1000(node)
```

Naive lộ `.env` và chạy root; optimized chạy `uid=1000`.

::: details Ghi chú cho mentor
- Phần 2 của lab: sau khi thêm `.dockerignore`, size gần như không đổi vì vấn đề chính là base image.
- Image cũ `1.0.0-naive` vẫn chứa `.env`: build lại không sửa image đã build trước đó.
:::

---

## Slide 11: Lab L1: 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Build naive, đo size, đọc `docker history` | Thấy `.env` và `uid=0` |
| 2 | Thêm `.dockerignore` | Không còn `.env` trong image |
| 3 | Cache, multi-stage, non-root | `CACHED`, `uid=1000` |
| 4-5 | Tag, digest, build `club-api` | `club-api:1.0.0` |

Lệnh đầy đủ: [Buổi 10 – Image Optimization](../../labs/week-05/session-10.md).

::: details Ghi chú cho mentor
- Phần 3: health đợi khoảng 35 giây vì `--interval=30s`; trước đó trạng thái `(health: starting)`.
- Phần 4 và 5: build `club-api:1.0.0` từ starter-project, gắn thêm tag `1.0`.
:::

---

## Slide 12: Lab L2: thử thách tự làm

- Viết `Dockerfile.mine` multi-stage, `node:22-alpine`; sửa `server.js` mà `npm ci` vẫn `CACHED`.
- Non-root, không có `.env`; giải thích từng layer của `docker history`.
- Đặt chiến lược tag cho `club-api`: 1.0.0, 1.0.1, 1.1.0.

::: details Ghi chú cho mentor
- Yêu cầu size không quá 10% so với bản optimized. Nâng cao: thêm stage `test`.
- Giải thích `docker history`: layer nào của base, của bạn, 0B vì sao.
:::

---

## Slide 13: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `"/xxx": not found` | File bị `.dockerignore` loại | Kiểm tra `.dockerignore` |
| Sửa code là cài lại | `COPY . .` trước `npm ci` | Chép manifest trước |
| `EACCES` với `USER node` | File thuộc root | `COPY --chown=node:node` |
| Image lớn dù `RUN rm` | Layer trước còn nguyên | Multi-stage |

---

## Slide 14: Debug: "not found" dù file có thật

```text
ERROR: failed to solve: ... "/package-lock.json": not found
$ ls package-lock.json      → có file trên đĩa
$ cat .dockerignore         → có dòng package-lock.json
```

Builder không thấy file vì `.dockerignore` loại nó khỏi context.

::: details Ghi chú cho mentor
- Đọc lỗi: file không có trong context, không phải lỗi npm.
- Sửa: xóa dòng đó, hoặc thêm `!package-lock.json`. Kiểm tra cả tham số cuối của `docker build`.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: layer và cache, image gọn sạch, tag cụ thể](/slides/img/s10-recap.svg)

::: details Ghi chú cho mentor
- Câu hỏi cuối buổi: tag `latest` có đảm bảo mới nhất không? CI mất 6 phút dù chỉ sửa README: kiểm tra gì?
- Làm sao chứng minh container chạy non-root? Vì sao `.dockerignore` không thu nhỏ base image?
:::

Buổi sau: container networking với `club-api` và Postgres, xem [Buổi 11](session-11.md).

---

## Slide 16: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/): tách bước build và bước chạy để image nhỏ.
- **Tài liệu chính thức:** [Build cache](https://docs.docker.com/build/cache/): hiểu vì sao thứ tự lệnh làm build nhanh hay chậm.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): checklist tối ưu Dockerfile từ Docker.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): giảm rủi ro bảo mật khi build image.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): mẹo image Node.js nhỏ và an toàn.
