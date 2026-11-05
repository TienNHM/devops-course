# Slide Ngày 06 – Dockerfile cho Club API

> **Tóm tắt:** Tự viết Dockerfile cho backend API của Club, build image, chạy container và gọi `/health` thành công. Bạn cũng sửa một lỗi build quen thuộc do sai thư mục.

## Slide 1: Hôm nay bạn làm ra gì

- Sản phẩm: file `club/backend/Dockerfile` do bạn viết, image `club-api:day6`, và `curl localhost:3001/health` trả `healthy`.
- Cần có: xong [Ngày 5](session-08.md), Docker Desktop đang chạy, thư mục `~/devops-labs/club/` (từ Ngày 3).
- Thời gian: 15 phút xem, 85 phút làm, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Chốt sản phẩm: Dockerfile 8 dòng tự viết, build, chạy, `curl /health` ra `healthy`.
- Cache sâu, `.dockerignore`, multi-stage, `USER node` thuộc Lộ trình Nâng cao.
:::

---

## Slide 2: Bài toán thật: mỗi người build ra một kiểu

![Máy Hùng Node 22, máy Lan Node 18, máy chung mỗi lần một kiểu; Dockerfile là công thức chung](/slides/img/s09-different-builds.svg)

::: details Ghi chú cho mentor
- Máy Hùng dùng Node 22; máy Lan dùng Node 18 và `npm install` ra bộ thư viện khác, API lỗi ngay khi khởi động.
- Dockerfile là công thức tái lập, nằm cùng mã nguồn trong Git; GitHub Actions ở Ngày 9-10 dùng lại đúng file này.
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

## Slide 4: Bước 1 (5 phút): Chuẩn bị thư mục

Dự án mẫu đã có sẵn `Dockerfile`. Bạn cất nó ra ngoài để tự viết bản của mình, rồi so sánh ở cuối.

```bash
cd ~/devops-labs/club/backend
ls -a
mv Dockerfile ~/Dockerfile.sample
```

**Kiểm tra: bạn đúng khi** thấy `app.js`, `db.js`, `server.js`, `package.json`, `package-lock.json`, `.dockerignore`; sau `mv` thì không còn `Dockerfile`.

::: details Ghi chú cho mentor
- Giữ nguyên `.dockerignore`: nó giữ `node_modules` và `.env` ra khỏi image.
:::

---

## Slide 5: Bước 2 (15 phút): Viết Dockerfile

Tạo file `club/backend/Dockerfile` (ví dụ `code Dockerfile`), chữ D viết hoa, không có đuôi:

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

**Kiểm tra: bạn đúng khi** `cat Dockerfile` in đủ 8 dòng.

---

## Slide 6: Bước 2: Đọc từng dòng

- `FROM` chọn nền Node 22 trên Alpine; luôn ghi rõ phiên bản, không dùng `latest`.
- `COPY` + `RUN npm ci` chép file vào image và cài đúng phiên bản trong `package-lock.json`.
- `ENV PORT=3000` đặt cổng mặc định, khớp với `server.js`.
- `CMD` là lệnh chạy khi container khởi động.

::: details Ghi chú cho mentor
- `EXPOSE` chỉ là ghi chú về cổng; muốn truy cập từ máy bạn vẫn cần `-p` khi `docker run`.
- `CMD` viết dạng mảng như trên.
:::

---

## Slide 7: Bước 3 (15 phút): Build context

![Đứng ở club/ thì không thấy Dockerfile; đứng ở club/backend thì COPY thấy mọi file](/slides/img/s09-context.svg)

::: details Ghi chú cho mentor
- Dấu `.` cuối lệnh `docker build` là build context: thư mục gửi cho Docker; `COPY` chỉ thấy file trong context.
- Hai cách đúng: `cd` vào thư mục có Dockerfile, hoặc `-f` kèm context.
:::

---

## Slide 8: Bước 3: Build image

```bash
cd ~/devops-labs/club/backend
docker build -t club-api:day6 .
docker image ls club-api
```

Mong đợi: các bước `FROM`, `WORKDIR`, `COPY`, `RUN npm ci` chạy lần lượt, cuối có `naming to docker.io/library/club-api:day6`; `docker image ls` hiện `club-api   day6`.

**Kiểm tra: bạn đúng khi** không có chữ `ERROR` và thấy tag `day6`.

::: details Ghi chú cho mentor
- Lần đầu mất khoảng 30-60 giây vì phải tải Node và cài thư viện.
:::

---

## Slide 9: Bước 4 (15 phút): Chạy container và gọi API

```bash
docker run -d --name club-api -p 3001:3000 club-api:day6
curl -s localhost:3001/health
curl -s -i localhost:3001/ready | head -n 1
docker logs club-api
```

Mong đợi: `{"status":"healthy","service":"club-api"}`; `/ready` trả `HTTP/1.1 503 Service Unavailable`; log có `API listening on port 3000`.

**Kiểm tra: bạn đúng khi** `/health` trả `healthy` và `docker ps` thấy `club-api` đang `Up`.

::: details Ghi chú cho mentor
- `/ready` là 503 vì API cần PostgreSQL mà container chưa nối tới DB. Bình thường hôm nay; Ngày 7-8 nối API với DB.
- Dùng cổng 3001 để tránh đụng cổng 3000 của Compose ở Ngày 8.
:::

---

## Slide 10: Bước 5 (10 phút): Đổi cấu hình lúc chạy bằng -e

`ENV` là giá trị mặc định; `-e` ghi đè khi chạy, không cần build lại. Sau này bạn truyền `DB_HOST`, `DB_PASSWORD` theo cách này.

```bash
docker run -d --name club-api-4000 -e PORT=4000 -p 3002:4000 club-api:day6
sleep 1
docker logs club-api-4000
curl -s localhost:3002/health
docker rm -f club-api-4000
```

**Kiểm tra: bạn đúng khi** log in `API listening on port 4000` và `/health` trả `healthy`.

---

## Slide 11: Bước 6 (5 phút): Build lần hai nhanh hơn nhờ cache

```bash
echo "thu" > tmp-cache-test.txt
docker build -t club-api:day6 .
rm tmp-cache-test.txt
```

Mong đợi: bước `npm ci` hiện `CACHED`, chỉ `COPY . .` chạy lại, build xong trong vài giây.

**Kiểm tra: bạn đúng khi** thấy chữ `CACHED` ở bước `npm ci`.

::: details Ghi chú cho mentor
- Lý do: `package.json` được chép và `npm ci` chạy trước `COPY . .`, nên sửa mã nguồn không làm cài lại thư viện.
- Cứ giữ đúng thứ tự này; tối ưu sâu hơn học ở Lộ trình Nâng cao.
:::

---

## Slide 12: Bước 7 (10 phút): Cố ý build sai thư mục

Đứng ở `club/` (thư mục cha của `backend`) rồi build:

```bash
cd ~/devops-labs/club
docker build -t club-api:day6 .
```

```text
ERROR: failed to solve: failed to read dockerfile:
open Dockerfile: no such file or directory
```

**Kiểm tra: bạn đúng khi** giải thích được: Dockerfile nằm trong `backend/` nhưng context là `club/`.

---

## Slide 13: Bước 7: Hai cách sửa

```bash
cd ~/devops-labs/club/backend && docker build -t club-api:day6 .
cd ~/devops-labs/club && docker build -f backend/Dockerfile -t club-api:day6 backend
```

Cách thứ hai ghi rõ Dockerfile (`-f`) và context (`backend`). Ngày 9 workflow CI cần đúng thông tin này.

**Kiểm tra: bạn đúng khi** cả hai lệnh build thành công.

::: details Ghi chú cho mentor
- Nếu chỉ thêm `-f backend/Dockerfile` mà context vẫn là `club/`: lỗi `"/package.json": not found`.
:::

---

## Slide 14: Bước 8 (5 phút): So sánh với bản mẫu và dọn

```bash
diff ~/devops-labs/club/backend/Dockerfile ~/Dockerfile.sample
docker rm -f club-api
```

Bản mẫu dùng thêm multi-stage và `USER node`: đó là phần tối ưu của Lộ trình Nâng cao.

**Kiểm tra: bạn đúng khi** `docker ps -a` không còn container `club-api`.

---

## Slide 15: Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy | Mở Docker Desktop, bật WSL integration |
| `failed to read dockerfile: open Dockerfile: no such file or directory` | Build sai thư mục, hoặc tên file không đúng `Dockerfile` | `cd club/backend` hoặc `-f backend/Dockerfile` kèm context `backend` |
| `COPY` báo `"/package.json": not found` | `package.json` không nằm trong context | `pwd`, `ls`; context là đối số cuối của `docker build` |

---

## Slide 16: Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng 3001 đã có người giữ | `docker ps`, `docker rm -f` container cũ hoặc đổi cổng (ví dụ `-p 3003:3000`) |
| Container thoát ngay (`Exited`) | `CMD` sai tên file hoặc app lỗi khi khởi động | `docker ps -a`, `docker logs club-api`, kiểm tra dòng `CMD` |
| `/ready` trả `503` | Chưa có PostgreSQL | Bình thường hôm nay, nối DB ở Ngày 7-8 |

---

## Slide 17: Tự kiểm tra

1. `EXPOSE 3000` có làm `curl localhost:3000` chạy được từ máy bạn không? Nếu không thì cần gì?
2. `ENV PORT=3000` trong Dockerfile khác `docker run -e PORT=4000` thế nào?
3. Đồng đội báo "máy mình build được, CI báo `COPY` không thấy `package.json`". Bạn kiểm tra gì trước?

::: details Ghi chú cho mentor
- Đáp án 1: không. `EXPOSE` chỉ là ghi chú; cần `-p cổng-máy:3000` khi `docker run`.
- Đáp án 2: `ENV` là mặc định ghi trong image; `-e` ghi đè cho một container lúc chạy, không cần build lại.
- Đáp án 3: build context của lệnh build trên CI (đối số cuối, thư mục làm việc) có trỏ vào `club/backend` không; `package.json` có được commit không; `.dockerignore` có loại nó không.
:::

---

## Slide 18: Tiếp theo

Ngày 7: chạy Postgres với volume để dữ liệu không mất: [Ngày 7 – Postgres và volume](session-12.md).

---

## Slide 19: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Dockerfile reference](https://docs.docker.com/reference/dockerfile/): tra cứu từng lệnh trong Dockerfile.
- **Tài liệu chính thức:** [Build context](https://docs.docker.com/build/concepts/context/): hiểu docker build gửi những file nào.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): cách viết Dockerfile gọn, nhanh, an toàn.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): hướng dẫn chuẩn khi đóng gói app Node.js.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật container từ OWASP.
