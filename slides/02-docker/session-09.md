# Slide Ngày 06 – Dockerfile cho Club API

> **Tóm tắt:** Viết, build và chạy Dockerfile cho backend API của Club, gọi `/health` thành công và sửa lỗi build do sai thư mục. Bài lab đầy đủ: [Ngày 6](../../labs/week-05/session-09.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: viết Dockerfile, build image, chạy và gọi API](/slides/img/s09-goals.svg)

::: details Ghi chú cho mentor
- Chốt sản phẩm: `club/backend/Dockerfile`, image `club-api:day6`, `curl /health` trả `healthy`, merge qua Pull Request.
- Cache sâu, `.dockerignore`, multi-stage, `USER node` thuộc Lộ trình Nâng cao.
:::

---

## Slide 2: Mỗi người build ra một kiểu

![Máy Hùng Node 22, máy Lan Node 18, máy chung mỗi lần một kiểu; Dockerfile là công thức chung](/slides/img/s09-different-builds.svg)

::: details Ghi chú cho mentor
- Máy Hùng dùng Node 22; máy Lan dùng Node 18 và `npm install` ra bộ thư viện khác.
- Dockerfile là công thức tái lập, nằm cùng mã nguồn trong Git; CI ở Ngày 9-10 dùng lại đúng file này.
:::

---

## Slide 3: Dockerfile là công thức, image là sản phẩm

![Mỗi dòng Dockerfile ứng với một layer hoặc một mục metadata](/slides/img/s09-dockerfile-layers.svg)

::: details Ghi chú cho mentor
- Mỗi `COPY`, `RUN` tạo một layer chỉ đọc; `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata.
- `EXPOSE` không mở cổng ra máy; muốn truy cập cần `-p`.
- Đọc từng dòng từ trên xuống, hỏi: dòng này tạo layer hay metadata?
:::

---

## Slide 4: Build context

![Build ở lab-09 không thấy Dockerfile; cd source rồi build thì COPY thấy mọi file](/slides/img/s09-build-context.svg)

::: details Ghi chú cho mentor
- Ảnh dùng tên thư mục của bản cũ; trong lab thư mục là `club/` (sai) và `club/backend` (đúng).
- Dấu `.` cuối lệnh `docker build` là build context; `COPY` chỉ thấy file trong context.
- Hai cách đúng: `cd` vào thư mục có Dockerfile, hoặc `-f` kèm context.
:::

---

## Slide 5: Từ source đến container

![source gửi context cho docker build, BuildKit đọc Dockerfile, ra image rồi docker run](/slides/img/s09-build-flow.svg)

::: details Ghi chú cho mentor
- Thứ tự `COPY package.json` trước `COPY . .` giúp cache `npm ci`; ở bước 6 của lab học viên tự thấy `CACHED`.
:::

---

## Slide 6: Demo: Dockerfile của Club API

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
cd ~/devops-labs/club/backend
docker build -t club-api:day6 .
docker run -d --name club-api -p 3001:3000 club-api:day6
curl -s localhost:3001/health
```

Mong đợi: `{"status":"healthy","service":"club-api"}`. `/ready` trả `503` vì chưa có database, bình thường hôm nay.

::: details Ghi chú cho mentor
- `-e PORT=4000` ghi đè `ENV` lúc chạy, không cần build lại; sau này dùng cho `DB_HOST`, `DB_PASSWORD`.
- Build lần hai: thêm một file rồi build, `npm ci` hiện `CACHED`.
:::

---

## Slide 7: Break: build sai context

```text
ERROR: failed to solve: failed to read dockerfile:
open Dockerfile: no such file or directory
```

Nguyên nhân gốc: đứng ở `club/` nhưng Dockerfile nằm trong `club/backend`. Sửa: `cd club/backend` rồi build.

::: details Ghi chú cho mentor
- Thêm `-f backend/Dockerfile` nhưng context vẫn là `club/`: lỗi `"/package.json": not found`.
- Hai cách sửa: `cd club/backend` rồi build, hoặc `-f backend/Dockerfile` kèm context `backend`.
- Nhắc: CI ở Ngày 9 cũng cần đúng context này.
:::

---

## Slide 8: Lab: tám bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-2 | Nhánh mới, viết Dockerfile | `Dockerfile` đủ 8 dòng |
| 3-4 | Build, chạy, `curl /health` | `healthy` |
| 5-6 | `-e PORT`, thấy `CACHED` | Log `port 4000` |
| 7 | Build sai thư mục rồi sửa | Đọc đúng lỗi |
| 8 | `notes/day-06.md` + Pull Request | Dockerfile vào `main` |

Lệnh chi tiết: [Ngày 6](../../labs/week-05/session-09.md).

---

## Slide 9: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `failed to read dockerfile` | Build đúng thư mục hoặc `-f` kèm context |
| `COPY` báo `not found` | Kiểm tra context (đối số cuối) |
| `port is already allocated` | `docker ps`, `docker rm -f` container cũ hoặc đổi cổng |
| Container thoát ngay | `docker logs`, kiểm tra dòng `CMD` |

::: details Ghi chú cho mentor
- Cho học viên đoán nguyên nhân trước khi mở bảng.
:::

---

## Slide 10: Recap

- Dockerfile là công thức nằm trong Git; image là sản phẩm; container là bản chạy.
- Build context là thư mục gửi cho Docker; `COPY` chỉ thấy file trong đó.
- `ENV` là mặc định, `-e` ghi đè; `EXPOSE` chỉ ghi chú, cần `-p` để truy cập.

Ngày tiếp theo: [Ngày 7 – Postgres và volume](../../labs/week-06/session-12.md).

---

## Slide 11: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Dockerfile reference](https://docs.docker.com/reference/dockerfile/): tra cứu từng lệnh trong Dockerfile.
- **Tài liệu chính thức:** [Build context](https://docs.docker.com/build/concepts/context/): hiểu docker build gửi những file nào.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): cách viết Dockerfile gọn, nhanh, an toàn.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): hướng dẫn chuẩn khi đóng gói app Node.js.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật container từ OWASP.
