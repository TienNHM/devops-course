# Slide Ngày 06 – Dockerfile cho Club API

> **Tóm tắt:** Viết Dockerfile cho backend API của Club, build image, chạy container và gọi `/health` thành công. Ngày học cũng xử lý một lỗi build thường gặp do chạy lệnh sai thư mục.

## Slide 1: Mục tiêu của Ngày 6

- Sản phẩm: file `club/backend/Dockerfile` do người học tự viết, image `club-api:day6`, và `curl localhost:3001/health` trả về `healthy`.
- Điều kiện: đã hoàn thành [Ngày 5](session-08.md), Docker Desktop đang chạy, thư mục `~/devops-labs/club/` đã có (từ Ngày 3).
- Thời gian: 15 phút trình bày, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Chốt sản phẩm: Dockerfile 8 dòng tự viết, build, chạy, `curl /health` trả về `healthy`.
- Cache chuyên sâu, `.dockerignore` nâng cao, multi-stage và `USER node` thuộc Lộ trình Nâng cao.
:::

---

## Slide 2: Bài toán thực tế: mỗi máy build ra một kết quả khác nhau

![Máy Hùng Node 22, máy Lan Node 18, máy chung mỗi lần một kiểu; Dockerfile là công thức chung](/slides/img/s09-different-builds.svg)

::: details Ghi chú cho mentor
- Máy của Hùng dùng Node 22; máy của Lan dùng Node 18 và `npm install` tạo ra bộ thư viện khác, nên API lỗi ngay khi khởi động.
- Dockerfile là công thức có thể tái lập, được lưu cùng mã nguồn trong Git; GitHub Actions ở Ngày 9-10 dùng lại đúng file này.
:::

---

## Slide 3: Khái niệm: Dockerfile

- **Dockerfile** là một tệp văn bản chứa danh sách các chỉ thị (instruction) mà Docker thực hiện tuần tự để tạo ra image.
- Vì cùng một Dockerfile luôn mô tả cùng các bước, mọi máy build ra image giống nhau và tệp này được quản lý trong Git cùng mã nguồn.
- Ví dụ trong dự án: `club/backend/Dockerfile` mô tả cách đóng gói API của Club thành image.

---

## Slide 4: Khái niệm: Image và layer

![Mỗi dòng Dockerfile ứng với một layer hoặc một mục metadata](/slides/img/s09-dockerfile-layers.svg)

- **Image** là gói chỉ đọc chứa mã nguồn, thư viện và cấu hình cần để chạy ứng dụng. **Layer** là một lớp thay đổi hệ tệp trong image.
- Mỗi chỉ thị `COPY`, `RUN` tạo một layer; `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata (thông tin mô tả).
- Ví dụ trong dự án: Dockerfile là công thức, image `club-api:day6` là sản phẩm được build từ công thức đó.

::: details Ghi chú cho mentor
- Mỗi `COPY`, `RUN` tạo một layer chỉ đọc; `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata.
- `EXPOSE` không mở cổng ra máy chủ; muốn truy cập cần cờ `-p`.
- Đọc từng dòng Dockerfile từ trên xuống và hỏi: dòng này tạo layer hay metadata.
:::

---

## Slide 5: Khái niệm: Base image

- **Base image** (image nền) là image mà Dockerfile bắt đầu từ đó, được khai báo bằng chỉ thị `FROM`.
- Image nền cung cấp sẵn hệ điều hành và runtime, nên Dockerfile chỉ cần mô tả phần bổ sung của ứng dụng.
- Ví dụ trong dự án: `FROM node:22-alpine` dùng Node 22 chạy trên Alpine Linux (bản phân phối nhỏ gọn).

---

## Slide 6: Khái niệm: Lệnh mặc định CMD

- **`CMD`** là chỉ thị khai báo lệnh mà container thực thi khi khởi động.
- Lệnh này trở thành tiến trình chính của container; khi tiến trình thoát, container chuyển sang `Exited`.
- Ví dụ trong dự án: `CMD ["node", "server.js"]` khởi động API của Club khi container chạy.

---

## Slide 7: Khái niệm: .dockerignore

- **`.dockerignore`** là tệp liệt kê các tệp và thư mục mà Docker loại khỏi dữ liệu gửi đi khi build.
- Cơ chế này ngăn các tệp không cần thiết hoặc nhạy cảm đi vào image, đồng thời làm build nhanh hơn.
- Ví dụ trong dự án: `.dockerignore` của backend loại `node_modules` và `.env` khỏi image.

---

## Slide 8: Bước 1 (5 phút): Chuẩn bị thư mục

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

## Slide 9: Bước 2 (15 phút): Viết Dockerfile

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

## Slide 10: Bước 2: Giải thích từng dòng

- `FROM` chọn image nền Node 22 trên Alpine; luôn ghi rõ phiên bản, không dùng `latest`.
- `COPY` và `RUN npm ci` chép tệp vào image và cài đúng phiên bản ghi trong `package-lock.json`.
- `ENV PORT=3000` đặt cổng mặc định, khớp với `server.js`.
- `CMD` là lệnh chạy khi container khởi động.

::: details Ghi chú cho mentor
- `EXPOSE` chỉ là ghi chú về cổng; muốn truy cập từ máy chủ vẫn cần `-p` khi chạy `docker run`.
- `CMD` được viết ở dạng mảng như trên.
:::

---

## Slide 11: Khái niệm: Build context

![Đứng ở club/ thì không thấy Dockerfile; đứng ở club/backend thì COPY thấy mọi file](/slides/img/s09-context.svg)

- **Build context** là thư mục mà `docker build` gửi cho Docker, chính là đối số cuối của lệnh (thường là dấu `.`).
- Chỉ thị `COPY` chỉ nhìn thấy các tệp nằm trong context, nên context sai sẽ gây lỗi không tìm thấy tệp.
- Ví dụ trong dự án: chạy build trong `club/backend` thì `COPY` thấy `package.json`; chạy trong `club/` thì không.

::: details Ghi chú cho mentor
- Dấu `.` cuối lệnh `docker build` là build context: thư mục được gửi cho Docker; `COPY` chỉ thấy tệp trong context.
- Hai cách đúng: `cd` vào thư mục có Dockerfile, hoặc dùng `-f` kèm context.
:::

---

## Slide 12: Khái niệm: Tag

- **Tag** là nhãn gắn vào image theo dạng `tên:nhãn`, thường dùng để ghi phiên bản.
- Một tên image có thể có nhiều tag, nên tag cho phép phân biệt các lần build và chọn đúng bản cần chạy.
- Ví dụ trong dự án: `-t club-api:day6` đặt tên image là `club-api` với tag `day6`.

---

## Slide 13: Bước 3 (15 phút): Build image

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

## Slide 14: Bước 4 (15 phút): Chạy container và gọi API

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

## Slide 15: Bước 5 (10 phút): Đổi cấu hình lúc chạy bằng -e

Nhắc lại: biến môi trường là cặp `TÊN=giá trị` truyền cho tiến trình. `ENV` trong Dockerfile là giá trị mặc định; `-e` ghi đè giá trị đó khi chạy mà không cần build lại. Các ngày sau dùng cách này để truyền `DB_HOST`, `DB_PASSWORD`.

```bash
docker run -d --name club-api-4000 -e PORT=4000 -p 3002:4000 club-api:day6
sleep 1
docker logs club-api-4000
curl -s localhost:3002/health
docker rm -f club-api-4000
```

**Kiểm tra: kết quả đúng khi** log in `API listening on port 4000` và `/health` trả về `healthy`.

---

## Slide 16: Khái niệm: Build cache

- **Build cache** là bộ nhớ đệm các layer đã build; Docker dùng lại layer nếu chỉ thị và dữ liệu đầu vào của nó không đổi.
- Khi một layer thay đổi, mọi layer phía sau phải build lại, nên thứ tự chỉ thị quyết định tốc độ build.
- Ví dụ trong dự án: `npm ci` đứng trước `COPY . .`, nên sửa mã nguồn không làm cài lại thư viện.

---

## Slide 17: Bước 6 (5 phút): Build lần hai nhanh hơn nhờ cache

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

## Slide 18: Bước 7 (10 phút): Cố ý build sai thư mục

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

## Slide 19: Bước 7: Hai cách sửa

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

## Slide 20: Bước 8 (5 phút): So sánh với bản mẫu và dọn dẹp

```bash
diff ~/devops-labs/club/backend/Dockerfile ~/Dockerfile.sample
docker rm -f club-api
```

Bản mẫu dùng thêm multi-stage và `USER node`: đây là phần tối ưu của Lộ trình Nâng cao.

**Kiểm tra: kết quả đúng khi** `docker ps -a` không còn container `club-api`.

---

## Slide 21: Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy | Mở Docker Desktop, bật WSL integration |
| `failed to read dockerfile: open Dockerfile: no such file or directory` | Build sai thư mục, hoặc tên tệp không đúng `Dockerfile` | `cd club/backend` hoặc `-f backend/Dockerfile` kèm context `backend` |
| `COPY` báo `"/package.json": not found` | `package.json` không nằm trong context | `pwd`, `ls`; context là đối số cuối của `docker build` |

---

## Slide 22: Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng 3001 đang bị tiến trình khác sử dụng | `docker ps`, `docker rm -f` container cũ hoặc đổi cổng (ví dụ `-p 3003:3000`) |
| Container thoát ngay (`Exited`) | `CMD` sai tên tệp hoặc ứng dụng lỗi khi khởi động | `docker ps -a`, `docker logs club-api`, kiểm tra dòng `CMD` |
| `/ready` trả về `503` | Chưa có PostgreSQL | Kết quả bình thường hôm nay, nối cơ sở dữ liệu ở Ngày 7-8 |

---

## Slide 23: Tự kiểm tra

1. `EXPOSE 3000` có làm `curl localhost:3000` chạy được từ máy chủ không? Nếu không thì cần thêm gì?
2. `ENV PORT=3000` trong Dockerfile khác `docker run -e PORT=4000` ở điểm nào?
3. Một đồng đội báo "build được trên máy mình, nhưng CI báo `COPY` không thấy `package.json`". Cần kiểm tra điều gì trước tiên?

::: details Ghi chú cho mentor
- Đáp án 1: không. `EXPOSE` chỉ là ghi chú; cần `-p cổng-máy-chủ:3000` khi chạy `docker run`.
- Đáp án 2: `ENV` là giá trị mặc định ghi trong image; `-e` ghi đè cho một container tại thời điểm chạy, không cần build lại.
- Đáp án 3: kiểm tra build context của lệnh build trên CI (đối số cuối, thư mục làm việc) có trỏ vào `club/backend` không; `package.json` đã được commit chưa; `.dockerignore` có loại tệp này không.
:::

---

## Slide 24: Tiếp theo

Ngày 7: chạy Postgres với volume để dữ liệu không bị mất: [Ngày 7 – Postgres và volume](session-12.md).

---

## Slide 25: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Dockerfile reference](https://docs.docker.com/reference/dockerfile/): tra cứu từng lệnh trong Dockerfile.
- **Tài liệu chính thức:** [Build context](https://docs.docker.com/build/concepts/context/): hiểu docker build gửi những file nào.
- **Best practice:** [Building best practices](https://docs.docker.com/build/building/best-practices/): cách viết Dockerfile gọn, nhanh, an toàn.
- **Best practice:** [Docker and Node.js best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md): hướng dẫn chuẩn khi đóng gói app Node.js.
- **Best practice:** [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật container từ OWASP.
