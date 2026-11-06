# Slide Ngày 06 – Dockerfile cho Club API

> **Tóm tắt:** Viết Dockerfile cho backend API của Club, build image, chạy container và gọi `/health` thành công. Ngày học cũng xử lý một lỗi build thường gặp do chạy lệnh sai thư mục.

## Mục tiêu của Ngày 6

- Sản phẩm: file `club/backend/Dockerfile` do người học tự viết, image `club-api:day6`, và `curl localhost:3001/health` trả về `healthy`.
- Thời gian: 15 phút trình bày, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Điều kiện: đã hoàn thành [Ngày 5](session-08.md), Docker Desktop đang chạy, thư mục `~/devops-labs/club/` đã có (từ Ngày 3).
- Chốt sản phẩm: Dockerfile 8 dòng tự viết, build, chạy, `curl /health` trả về `healthy`.
- Cache chuyên sâu, `.dockerignore` nâng cao, multi-stage và `USER node` thuộc Lộ trình Nâng cao.
:::

---

## Bài toán thực tế: mỗi máy build ra một kết quả khác nhau

![Máy Hùng Node 22, máy Lan Node 18, máy chung mỗi lần một kiểu; Dockerfile là công thức chung](/slides/img/s09-different-builds.svg)

::: details Ghi chú cho mentor
- Máy của Hùng dùng Node 22; máy của Lan dùng Node 18 và `npm install` tạo ra bộ thư viện khác, nên API lỗi ngay khi khởi động.
- Dockerfile là công thức có thể tái lập, được lưu cùng mã nguồn trong Git; GitHub Actions ở Ngày 9-10 dùng lại đúng file này.
:::

---

## Khái niệm: Dockerfile

![Dockerfile được docker build biến thành image](/slides/img/s09-k-dockerfile.svg)

- **Dockerfile** là tệp văn bản chứa các chỉ thị (instruction) mà Docker thực hiện tuần tự để tạo ra image.
- Ví dụ trong dự án: `club/backend/Dockerfile` mô tả cách đóng gói API của Club thành image.

::: details Ghi chú cho mentor
- Vì cùng một Dockerfile luôn mô tả cùng các bước, mọi máy build ra image giống nhau và tệp này được quản lý trong Git cùng mã nguồn.
:::

---

## Khái niệm: Image và layer

![Mỗi dòng Dockerfile ứng với một layer hoặc một mục metadata](/slides/img/s09-dockerfile-layers.svg)

- **Image** là gói chỉ đọc chứa mã nguồn, thư viện và cấu hình để chạy ứng dụng; **layer** là một lớp thay đổi hệ tệp trong image.
- Ví dụ trong dự án: image `club-api:day6` được build từ Dockerfile của API.

::: details Ghi chú cho mentor
- Dockerfile là công thức, image là sản phẩm được build từ công thức đó.
- Metadata là thông tin mô tả.
- Mỗi `COPY`, `RUN` tạo một layer chỉ đọc; `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata.
- `EXPOSE` không mở cổng ra máy chủ; muốn truy cập cần cờ `-p`.
- Đọc từng dòng Dockerfile từ trên xuống và hỏi: dòng này tạo layer hay metadata.
:::

---

## Khái niệm: Base image

![Image nền nằm dưới các layer của bạn](/slides/img/s09-k-base-image.svg)

- **Base image** (image nền) là image mà Dockerfile bắt đầu từ đó, được khai báo bằng chỉ thị `FROM`.
- Ví dụ trong dự án: `FROM node:22-alpine` dùng Node 22 trên Alpine Linux.

::: details Ghi chú cho mentor
- Image nền cung cấp sẵn hệ điều hành và runtime, nên Dockerfile chỉ cần mô tả phần bổ sung của ứng dụng.
- Alpine Linux là bản phân phối nhỏ gọn.
:::

---

## Khái niệm: Lệnh mặc định CMD

![CMD chạy khi docker run khởi động container](/slides/img/s09-k-cmd.svg)

- **`CMD`** là chỉ thị khai báo lệnh mà container thực thi khi khởi động.
- Ví dụ trong dự án: `CMD ["node", "server.js"]` khởi động API của Club.

::: details Ghi chú cho mentor
- Lệnh này trở thành tiến trình chính của container; khi tiến trình thoát, container chuyển sang `Exited`.
:::

---

## Khái niệm: .dockerignore

![Tệp bị loại không vào image](/slides/img/s09-k-dockerignore.svg)

- **`.dockerignore`** là tệp liệt kê các tệp và thư mục mà Docker loại khỏi dữ liệu gửi đi khi build.
- Ví dụ trong dự án: `.dockerignore` của backend loại `node_modules` và `.env` khỏi image.

::: details Ghi chú cho mentor
- Cơ chế này ngăn các tệp không cần thiết hoặc nhạy cảm đi vào image, đồng thời làm build nhanh hơn.
:::

---

## Bước 1 (5 phút): Chuẩn bị thư mục

Dự án mẫu đã có sẵn `Dockerfile`. Di chuyển tệp này ra ngoài để tự viết bản riêng, sau đó so sánh ở cuối ngày.

```bash
cd ~/devops-labs/club/backend
ls -a
mv Dockerfile ~/Dockerfile.sample
```

**Kiểm tra: kết quả đúng khi** thấy `app.js`, `db.js`, `server.js`, `package.json`, `package-lock.json`, `.dockerignore`; sau `mv` thì không còn `Dockerfile`.

::: details Ghi chú cho mentor
- Giữ nguyên `.dockerignore`: tệp này giữ `node_modules` và `.env` ngoài image.
:::

---

## Bước 2 (15 phút): Viết Dockerfile

Tạo file `club/backend/Dockerfile` (ví dụ `code Dockerfile`), chữ D viết hoa, không có phần mở rộng:

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

**Kiểm tra: kết quả đúng khi** `cat Dockerfile` in đủ 8 dòng.

---

## Bước 2: Giải thích từng dòng

- `FROM` chọn image nền Node 22 trên Alpine; luôn ghi rõ phiên bản, không dùng `latest`.
- `COPY` và `RUN npm ci` chép tệp vào image và cài đúng phiên bản ghi trong `package-lock.json`.
- `ENV PORT=3000` đặt cổng mặc định, khớp với `server.js`.
- `CMD` là lệnh chạy khi container khởi động.

::: details Ghi chú cho mentor
- `EXPOSE` chỉ là ghi chú về cổng; muốn truy cập từ máy chủ vẫn cần `-p` khi chạy `docker run`.
- `CMD` được viết ở dạng mảng như trên.
:::

---

## Khái niệm: Build context

![Đứng ở club/ thì không thấy Dockerfile; đứng ở club/backend thì COPY thấy mọi file](/slides/img/s09-context.svg)

- **Build context** là thư mục mà `docker build` gửi cho Docker, chính là đối số cuối của lệnh (thường là `.`).
- Ví dụ trong dự án: build trong `club/backend` thì `COPY` thấy `package.json`; trong `club/` thì không.

::: details Ghi chú cho mentor
- Chỉ thị `COPY` chỉ nhìn thấy các tệp nằm trong context, nên context sai sẽ gây lỗi không tìm thấy tệp.
- Dấu `.` cuối lệnh `docker build` là build context: thư mục được gửi cho Docker; `COPY` chỉ thấy tệp trong context.
- Hai cách đúng: `cd` vào thư mục có Dockerfile, hoặc dùng `-f` kèm context.
:::

---

## Khái niệm: Tag

![Tag gồm tên image và nhãn phiên bản](/slides/img/s09-k-tag.svg)

- **Tag** là nhãn gắn vào image theo dạng `tên:nhãn`, thường dùng để ghi phiên bản.
- Ví dụ trong dự án: `-t club-api:day6` đặt tên image là `club-api` với tag `day6`.

::: details Ghi chú cho mentor
- Một tên image có thể có nhiều tag, nên tag cho phép phân biệt các lần build và chọn đúng bản cần chạy.
:::

---

## Bước 3 (15 phút): Build image

```bash
cd ~/devops-labs/club/backend
docker build -t club-api:day6 .
docker image ls club-api
```

Kết quả mong đợi: các bước `FROM`, `WORKDIR`, `COPY`, `RUN npm ci` chạy lần lượt, cuối cùng có `naming to docker.io/library/club-api:day6`; `docker image ls` hiển thị `club-api   day6`.

**Kiểm tra: kết quả đúng khi** không có chữ `ERROR` và thấy tag `day6`.

::: details Ghi chú cho mentor
- Lần build đầu tiên mất khoảng 30-60 giây vì phải tải Node và cài thư viện.
:::

---

## Bước 4 (15 phút): Chạy container và gọi API

```bash
docker run -d --name club-api -p 3001:3000 club-api:day6
curl -s localhost:3001/health
curl -s -i localhost:3001/ready | head -n 1
docker logs club-api
```

Kết quả mong đợi: `{"status":"healthy","service":"club-api"}`; `/ready` trả về `HTTP/1.1 503 Service Unavailable`; log có `API listening on port 3000`.

**Kiểm tra: kết quả đúng khi** `/health` trả về `healthy` và `docker ps` hiển thị `club-api` ở trạng thái `Up`.

::: details Ghi chú cho mentor
- `/ready` trả về 503 vì API cần PostgreSQL mà container chưa kết nối tới cơ sở dữ liệu. Đây là kết quả bình thường trong ngày hôm nay; Ngày 7-8 sẽ nối API với cơ sở dữ liệu.
- Dùng cổng 3001 để tránh trùng cổng 3000 của Compose ở Ngày 8.
:::

---

## Bước 5 (10 phút): Đổi cấu hình lúc chạy bằng -e

`ENV` trong Dockerfile là giá trị mặc định; `-e` ghi đè giá trị đó khi chạy mà không cần build lại.

```bash
docker run -d --name club-api-4000 -e PORT=4000 -p 3002:4000 club-api:day6
sleep 1
docker logs club-api-4000
curl -s localhost:3002/health
docker rm -f club-api-4000
```

**Kiểm tra: kết quả đúng khi** log in `API listening on port 4000` và `/health` trả về `healthy`.

::: details Ghi chú cho mentor
- Nhắc lại: biến môi trường là cặp `TÊN=giá trị` truyền cho tiến trình.
- Các ngày sau dùng cách này để truyền `DB_HOST`, `DB_PASSWORD`.
:::

---

## Khái niệm: Build cache

![Layer không đổi được dùng lại từ cache](/slides/img/s09-k-build-cache.svg)

- **Build cache** là bộ nhớ đệm các layer đã build, được dùng lại nếu đầu vào của layer không đổi.
- Ví dụ trong dự án: `npm ci` đứng trước `COPY . .`, nên sửa mã nguồn không phải cài lại.

::: details Ghi chú cho mentor
- Khi một layer thay đổi, mọi layer phía sau phải build lại, nên thứ tự chỉ thị quyết định tốc độ build.
:::

---

## Bước 6 (5 phút): Build lần hai nhanh hơn nhờ cache

```bash
echo "thu" > tmp-cache-test.txt
docker build -t club-api:day6 .
rm tmp-cache-test.txt
```

Kết quả mong đợi: bước `npm ci` hiển thị `CACHED`, chỉ `COPY . .` chạy lại, build xong trong vài giây.

**Kiểm tra: kết quả đúng khi** thấy chữ `CACHED` ở bước `npm ci`.

::: details Ghi chú cho mentor
- Lý do: `package.json` được chép và `npm ci` chạy trước `COPY . .`, nên việc sửa mã nguồn không làm cài lại thư viện.
- Giữ nguyên thứ tự này; phần tối ưu sâu hơn được học ở Lộ trình Nâng cao.
:::

---

## Bước 7 (10 phút): Cố ý build sai thư mục

Chuyển về `club/` (thư mục cha của `backend`) rồi build:

```bash
cd ~/devops-labs/club
docker build -t club-api:day6 .
```

```text
ERROR: failed to solve: failed to read dockerfile:
open Dockerfile: no such file or directory
```

**Kiểm tra: kết quả đúng khi** giải thích được nguyên nhân: Dockerfile nằm trong `backend/` nhưng context là `club/`.

---

## Bước 7: Hai cách sửa

```bash
cd ~/devops-labs/club/backend && docker build -t club-api:day6 .
cd ~/devops-labs/club && docker build -f backend/Dockerfile -t club-api:day6 backend
```

Cách thứ hai khai báo rõ Dockerfile (`-f`) và context (`backend`). Workflow CI ở Ngày 9 cần đúng hai thông tin này.

**Kiểm tra: kết quả đúng khi** cả hai lệnh build thành công.

::: details Ghi chú cho mentor
- Nếu chỉ thêm `-f backend/Dockerfile` mà context vẫn là `club/` thì lỗi là `"/package.json": not found`.
:::

---

## Bước 8 (5 phút): So sánh với bản mẫu và dọn dẹp

```bash
diff ~/devops-labs/club/backend/Dockerfile ~/Dockerfile.sample
docker rm -f club-api
```

Bản mẫu dùng thêm multi-stage và `USER node`: đây là phần tối ưu của Lộ trình Nâng cao.

**Kiểm tra: kết quả đúng khi** `docker ps -a` không còn container `club-api`.

---

## Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker chưa chạy | Mở Docker Desktop |
| `failed to read dockerfile` | Build sai thư mục | `cd club/backend` |
| `"/package.json": not found` | Ngoài context | `pwd`, `ls` |

::: details Ghi chú cho mentor
- Với lỗi daemon: mở Docker Desktop, bật WSL integration.
- Lỗi đầy đủ `failed to read dockerfile: open Dockerfile: no such file or directory`: build sai thư mục, hoặc tên tệp không đúng `Dockerfile`; sửa bằng `cd club/backend` hoặc `-f backend/Dockerfile` kèm context `backend`.
- Lỗi `COPY` báo `"/package.json": not found`: `package.json` không nằm trong context; context là đối số cuối của `docker build`.
:::

---

## Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng 3001 bị giữ | `docker ps`; xóa container cũ |
| Container thoát ngay | `CMD` sai | `docker logs club-api` |
| `/ready` trả về `503` | Chưa có PostgreSQL | Bình thường hôm nay |

::: details Ghi chú cho mentor
- Cổng 3001 đang bị tiến trình khác sử dụng; dùng `docker rm -f` container cũ hoặc đổi cổng (ví dụ `-p 3003:3000`).
- Container thoát ngay (`Exited`): `CMD` sai tên tệp hoặc ứng dụng lỗi khi khởi động; chạy `docker ps -a`, `docker logs club-api`, kiểm tra dòng `CMD`.
- `/ready` trả về `503` là kết quả bình thường hôm nay; nối cơ sở dữ liệu ở Ngày 7-8.
:::

---

## Tự kiểm tra

1. `EXPOSE 3000` có làm `curl localhost:3000` chạy được từ máy chủ không? Nếu không thì cần thêm gì?
2. `ENV PORT=3000` trong Dockerfile khác `docker run -e PORT=4000` ở điểm nào?
3. Máy mình build được, nhưng CI báo `COPY` không thấy `package.json`. Cần kiểm tra điều gì trước tiên?

::: details Ghi chú cho mentor
- Đáp án 1: không. `EXPOSE` chỉ là ghi chú; cần `-p cổng-máy-chủ:3000` khi chạy `docker run`.
- Đáp án 2: `ENV` là giá trị mặc định ghi trong image; `-e` ghi đè cho một container tại thời điểm chạy, không cần build lại.
- Đáp án 3: kiểm tra build context của lệnh build trên CI (đối số cuối, thư mục làm việc) có trỏ vào `club/backend` không; `package.json` đã được commit chưa; `.dockerignore` có loại tệp này không.
:::

---

## Tiếp theo

Ngày 7: chạy Postgres với volume để dữ liệu không bị mất: [Ngày 7 – Postgres và volume](session-12.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Dockerfile reference](https://docs.docker.com/reference/dockerfile/): tra cứu từng lệnh trong Dockerfile.
- **Tài liệu chính thức:** [Build context](https://docs.docker.com/build/concepts/context/): hiểu docker build gửi những file nào.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): cách viết Dockerfile gọn, nhanh, an toàn.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): hướng dẫn chuẩn khi đóng gói app Node.js.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật container từ OWASP.
