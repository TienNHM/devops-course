# Slide buổi 10 – Image Optimization

> **Tóm tắt:** Buổi học giảm kích thước image, rút ngắn thời gian build và tăng độ an toàn bằng layer cache, `.dockerignore`, multi-stage build, non-root user và tagging; kết quả được kiểm chứng bằng số liệu đo. Bài lab đầy đủ: [Buổi 10](../../labs/week-05/session-10.md).

## Slide 1: Mục tiêu của buổi học

![Ba mục tiêu: hiểu layer, image gọn, chạy an toàn](/slides/img/s10-goals.svg)

::: details Ghi chú cho mentor
- Giới thiệu nhanh ba thẻ mục tiêu. Mục tiêu chi tiết: đọc `docker history` và `docker image ls`; viết `.dockerignore`; dùng multi-stage và non-root, chứng minh bằng `id`; phân biệt tag với digest.
- Câu hỏi mở đầu: ai từng build image có kích thước trên 1 GB.
:::

---

## Slide 2: Một Dockerfile viết sơ sài gây ba vấn đề

![Dockerfile ba dòng gây ra image nặng, build chậm, lộ .env](/slides/img/s10-problem.svg)

::: details Ghi chú cho mentor
- Dockerfile ban đầu: `FROM node:22`, `COPY . .`, `RUN npm install`. Image nặng hơn 1 GB.
- Mỗi lần sửa một dòng mã, CI cài lại toàn bộ dependency và mất vài phút; `COPY . .` còn chép cả `.env` chứa mật khẩu.
- Ba vấn đề có chung một gốc: chưa hiểu cách image được tạo ra.
:::

---

## Slide 3: Khái niệm: Layer bất biến

![Chồng layer chỉ đọc; rm ở lớp trên không xóa 200 MB của lớp dưới](/slides/img/s10-layers.svg)

- Nhắc lại: **layer** là một lớp thay đổi hệ tệp của image. Layer đã tạo thì chỉ đọc, không thể sửa.
- Do đó, lệnh `RUN rm` ở layer sau chỉ ẩn tệp khỏi hệ tệp nhìn thấy; dung lượng của layer trước vẫn nằm trong image.
- Ví dụ trong dự án: `RUN npm install` tạo 200 MB; `RUN rm -rf cache` ở layer sau không làm image nhỏ đi.

::: details Ghi chú cho mentor
- `RUN`, `COPY`, `ADD` tạo layer mới; container thêm một writable layer mỏng, mất khi xóa container.
- Muốn loại một thành phần khỏi image: không đưa nó vào ngay từ đầu (`.dockerignore`, multi-stage).
:::

---

## Slide 4: Build cache: thứ tự chỉ thị quyết định tốc độ

![So sánh COPY . . trước npm install với copy manifest trước](/slides/img/s10-cache-order.svg)

- Nhắc lại: build cache cho phép Docker dùng lại layer khi chỉ thị và dữ liệu đầu vào không đổi.
- Khi một layer mất cache, mọi layer phía sau phải build lại; vì vậy phần ít thay đổi (base image, dependency) đặt trước, phần hay thay đổi (mã nguồn) đặt sau.

::: details Ghi chú cho mentor
- Mỗi chỉ thị được so khớp với cache; `COPY` so sánh checksum nội dung tệp.
- Nguyên tắc: ít đổi đặt trước, hay đổi đặt sau.
:::

---

## Slide 5: Khái niệm: .dockerignore và build context

![Thư mục dự án đi qua .dockerignore, chỉ file cần thiết vào context](/slides/img/s10-context.svg)

- Nhắc lại: **build context** là thư mục `docker build` gửi cho builder; **`.dockerignore`** liệt kê các tệp bị loại khỏi context đó.
- Builder nhận context trước khi đọc Dockerfile, nên tệp bị loại sẽ không thể được `COPY` và không vào image.
- Ví dụ trong dự án: nên loại `node_modules`, `.git`, `.env`, `*.pem`, `tests`, `*.md`, `Dockerfile*`.

::: details Ghi chú cho mentor
- `docker build .` gửi cả thư mục `.` cho builder trước khi đọc Dockerfile.
- Không ignore tệp mà Dockerfile cần `COPY` (ví dụ `package-lock.json`).
:::

---

## Slide 6: Khái niệm: Multi-stage build

![Stage deps cài dependency, stage runtime chỉ lấy node_modules](/slides/img/s10-multistage.svg)

- **Multi-stage build** là kỹ thuật dùng nhiều chỉ thị `FROM` trong một Dockerfile; mỗi `FROM` mở ra một stage (giai đoạn) riêng.
- Chỉ thị `COPY --from=<stage>` lấy kết quả cần thiết từ stage trước; các thành phần còn lại không vào image cuối.
- Ví dụ trong dự án: stage `deps` chạy `npm ci --omit=dev`; stage `runtime` chỉ nhận `node_modules` từ `deps`.

::: details Ghi chú cho mentor
- Stage `deps` chép riêng manifest và chạy `npm ci --omit=dev`; stage này chỉ build lại khi lockfile đổi.
- Stage `runtime` bắt đầu từ base sạch, lấy `node_modules` bằng `COPY --from=deps`; mã nguồn chép sau cùng, `USER node` đặt cuối.
- Khi sửa `server.js`, chỉ layer `COPY server.js` và các layer sau bị tạo lại.
:::

---

## Slide 7: Khái niệm: Non-root user

![Biểu đồ size base image và so sánh root với user node](/slides/img/s10-base-user.svg)

- **Non-root user** là tài khoản không có quyền quản trị (không phải `root`, uid 0) dùng để chạy tiến trình trong container.
- Mặc định tiến trình chạy bằng root; nếu ứng dụng bị khai thác, kẻ tấn công nhận quyền cao hơn mức cần thiết. Chạy bằng user thường giảm rủi ro này.
- Ví dụ trong dự án: image `node` có sẵn user `node` (uid 1000); Dockerfile dùng `USER node` và `COPY --chown=node:node`.

::: details Ghi chú cho mentor
- `node:22` trên 1 GB; `node:22-slim` khoảng 200-250 MB; `node:22-alpine` khoảng 150-200 MB (số đo thực tế có thể khác).
- Base image nhỏ hơn đồng nghĩa với ít thành phần hơn để tải và để rà quét lỗ hổng.
:::

---

## Slide 8: Khái niệm: Tag và digest

![Ba tag trỏ cùng một IMAGE ID; deploy dùng tag version, không dùng latest](/slides/img/s10-tags.svg)

- Nhắc lại: **tag** là nhãn gắn vào image và có thể bị gán lại sang image khác. **Digest** (`sha256:...`) là định danh được tính từ nội dung image.
- `latest` chỉ là một tag thông thường, không bảo đảm là bản mới nhất. Việc deploy cần dùng tag phiên bản cụ thể, ví dụ `club-api:1.0.0`.
- Lưu ý: digest chỉ ổn định sau khi image được push lên registry; cột DIGEST có thể là `none` khi chưa push.

::: details Ghi chú cho mentor
- Tag có thể bị gán lại; digest định danh theo nội dung.
- Deploy luôn dùng tag phiên bản cụ thể: `club-api:1.0.0`.
:::

---

## Slide 9: Demo: so sánh trước và sau tối ưu

![Bảng so sánh naive và optimized: size, rebuild, .env, user](/slides/img/s10-compare.svg)

::: details Ghi chú cho mentor
- Baseline: build `Dockerfile.naive` của `hello-node`, thêm `big.bin` và `.env` giả; `transferring context` khoảng 31 MB.
- Sửa mã rồi build lại bản naive: không có `CACHED`. Thêm `.dockerignore` rồi build `Dockerfile.optimized`: khoảng 200-250 MB.
- Đây là số liệu minh họa; lớp học nên tự đọc số liệu của mình.
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

Bản naive làm lộ `.env` và chạy bằng root; bản optimized chạy với `uid=1000`.

::: details Ghi chú cho mentor
- Phần 2 của lab: sau khi thêm `.dockerignore`, kích thước gần như không đổi vì nguyên nhân chính nằm ở base image.
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
- Phần 3: trạng thái health cần khoảng 35 giây vì `--interval=30s`; trước đó trạng thái là `(health: starting)`.
- Phần 4 và 5: build `club-api:1.0.0` từ starter-project, gắn thêm tag `1.0`.
:::

---

## Slide 12: Lab L2: thử thách tự làm

- Viết `Dockerfile.mine` dạng multi-stage với `node:22-alpine`; sửa `server.js` mà bước `npm ci` vẫn `CACHED`.
- Chạy non-root, không chứa `.env`; giải thích từng layer trong `docker history`.
- Xây dựng chiến lược tag cho `club-api` với các phiên bản 1.0.0, 1.0.1, 1.1.0.

::: details Ghi chú cho mentor
- Yêu cầu kích thước không vượt quá bản optimized quá 10%. Mở rộng: thêm stage `test`.
- Khi giải thích `docker history`, người học nêu layer nào thuộc base image, layer nào do mình tạo, và vì sao có layer 0B.
:::

---

## Slide 13: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `"/xxx": not found` | Tệp bị `.dockerignore` loại | Kiểm tra `.dockerignore` |
| Sửa mã là cài lại dependency | `COPY . .` đứng trước `npm ci` | Chép manifest trước |
| `EACCES` với `USER node` | Tệp thuộc sở hữu của root | `COPY --chown=node:node` |
| Image lớn dù đã `RUN rm` | Layer trước vẫn còn nguyên | Dùng multi-stage |

---

## Slide 14: Debug: "not found" dù tệp có thật

```text
ERROR: failed to solve: ... "/package-lock.json": not found
$ ls package-lock.json      → có file trên đĩa
$ cat .dockerignore         → có dòng package-lock.json
```

Builder không thấy tệp vì `.dockerignore` đã loại nó khỏi context.

::: details Ghi chú cho mentor
- Cách đọc lỗi: tệp không có trong context; đây không phải lỗi của npm.
- Cách sửa: xóa dòng đó, hoặc thêm `!package-lock.json`. Kiểm tra thêm đối số cuối của `docker build`.
:::

---

## Slide 15: Tổng kết

![Ba điều cần nhớ: layer và cache, image gọn sạch, tag cụ thể](/slides/img/s10-recap.svg)

::: details Ghi chú cho mentor
- Câu hỏi cuối buổi: tag `latest` có bảo đảm là bản mới nhất không; CI mất 6 phút dù chỉ sửa README thì kiểm tra điều gì.
- Câu hỏi bổ sung: chứng minh container chạy non-root bằng cách nào; vì sao `.dockerignore` không làm nhỏ base image.
:::

Buổi sau: container networking với `club-api` và Postgres, xem [Buổi 11](session-11.md).

---

## Slide 16: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/): tách bước build và bước chạy để image nhỏ.
- **Tài liệu chính thức:** [Build cache](https://docs.docker.com/build/cache/): hiểu vì sao thứ tự lệnh làm build nhanh hay chậm.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): checklist tối ưu Dockerfile từ Docker.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): giảm rủi ro bảo mật khi build image.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): mẹo image Node.js nhỏ và an toàn.
