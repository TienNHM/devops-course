# Ngày 6 – Dockerfile cho Club API

::: warning Bản lưu trữ
Nội dung bài này đã chuyển vào [slide Ngày 6](../../slides/02-docker/session-09.md). Lộ trình Cơ bản chỉ học bằng slide, trang này giữ lại để tham khảo và không còn là đường học chính.
:::

Lộ trình Cơ bản · Ngày 6/10 · khoảng 2 giờ

[Slide Ngày 6](../../slides/02-docker/session-09.md) · [Thử thách thêm](session-09-challenge.md)

> **Tóm tắt:** Viết Dockerfile cho backend API của Club, build thành image, chạy container và gọi `curl /health` thành công. Bạn cũng sửa một lỗi build quen thuộc do sai thư mục.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** file `club/backend/Dockerfile` do chính bạn viết, image `club-api:day6`, và `curl localhost:3001/health` trả `healthy`. Dockerfile được merge vào `main` của `devops-labs`.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 5](../week-04/session-08.md): Docker Desktop đang chạy, bạn dùng được `docker run`, `logs`, `rm`.
- [ ] Thư mục `~/devops-labs/club/` đã có trong `main` (từ Ngày 3).
:::

## Bài toán thật

Backend API của Club chạy tốt trên máy bạn Hùng với Node.js 22. Bạn Lan clone về, dùng Node 18 và `npm install` ra bộ thư viện khác, API lỗi ngay khi khởi động. Muốn đưa API lên máy chung của CLB, mỗi lần lại phải cài đúng Node, đúng thư viện. Dockerfile là một file văn bản nằm cùng mã nguồn, ghi lại công thức đóng gói API thành image. Có file này trong Git, ai build cũng ra image giống nhau, và ở Ngày 9-10 GitHub Actions sẽ dùng lại đúng công thức đó.

## Làm

Image tên `club-api:day6`, container tên `club-api`, cổng máy bạn là 3001 (tránh 3000 để không đụng Compose ở Ngày 8).

### Bước 1. Chuẩn bị nhánh làm việc

Bạn làm trên một nhánh riêng và đưa vào `main` bằng Pull Request, như Ngày 3.

```bash
cd ~/devops-labs
git switch main && git pull
git switch -c day-06-dockerfile
cd club/backend
ls -a
```

Kết quả mong đợi: thấy `app.js`, `db.js`, `server.js`, `package.json`, `package-lock.json`, `.dockerignore`. Dự án mẫu đã có sẵn một `Dockerfile` hoàn chỉnh; bạn cất nó ra ngoài repo để tự viết bản của mình, rồi so sánh ở cuối bài:

```bash
mv Dockerfile ~/Dockerfile.sample
```

File `.dockerignore` cứ để nguyên: nó giữ `node_modules` và `.env` ra khỏi image.

### Bước 2. Viết Dockerfile đầu tiên

Mỗi dòng Dockerfile là một chỉ thị. Tạo `club/backend/Dockerfile` (ví dụ `code Dockerfile`) với nội dung:

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

Đọc từng dòng:

- `FROM` chọn nền là Node 22 trên Alpine (nhỏ). Luôn ghi rõ phiên bản, không dùng `latest`.
- `WORKDIR` đặt thư mục làm việc trong image.
- `COPY` chép file từ máy bạn vào image; `RUN npm ci` cài đúng phiên bản trong `package-lock.json`.
- `ENV PORT=3000` đặt cổng mặc định, khớp với `server.js` (`process.env.PORT`).
- `EXPOSE` chỉ là ghi chú về cổng; muốn truy cập từ máy bạn vẫn cần `-p` khi `docker run`.
- `CMD` là lệnh chạy khi container khởi động; viết dạng mảng như trên.

::: tip Kiểm tra: bạn đúng khi
`ls club/backend` có `Dockerfile` (viết hoa chữ D, không có đuôi) và `cat Dockerfile` in đủ 8 dòng.
:::

### Bước 3. Build image

Dấu `.` ở cuối lệnh là **build context**: thư mục được gửi cho Docker. `COPY` chỉ thấy file nằm trong thư mục đó.

```bash
cd ~/devops-labs/club/backend
docker build -t club-api:day6 .
```

Kết quả mong đợi (rút gọn): các bước `FROM`, `WORKDIR`, `COPY`, `RUN npm ci` chạy lần lượt, cuối cùng có dòng `naming to docker.io/library/club-api:day6`. Lần đầu mất khoảng 30-60 giây vì phải tải Node và cài thư viện.

```bash
docker image ls club-api
```

Kết quả mong đợi: một dòng `club-api   day6 ...`.

::: tip Kiểm tra: bạn đúng khi
Lệnh build kết thúc không có chữ `ERROR` và `docker image ls club-api` hiện tag `day6`.
:::

### Bước 4. Chạy container và gọi API

```bash
docker run -d --name club-api -p 3001:3000 club-api:day6
curl -s localhost:3001/health
curl -s -i localhost:3001/ready | head -n 1
docker logs club-api
```

Kết quả mong đợi: `/health` trả `{"status":"healthy","service":"club-api"}`; `/ready` trả `HTTP/1.1 503 Service Unavailable`; log có dòng `API listening on port 3000`.

Vì sao `/ready` là 503: API cần PostgreSQL mà container này chưa nối tới database. Bình thường ở Ngày 6; Ngày 7-8 sẽ nối API với DB.

::: tip Kiểm tra: bạn đúng khi
`curl localhost:3001/health` trả `healthy` và `docker ps` thấy `club-api` đang `Up`.
:::

### Bước 5. Đổi cấu hình lúc chạy bằng `-e`

`ENV` trong Dockerfile là giá trị mặc định. Bạn ghi đè được nó khi chạy, không cần build lại. Đây là cách bạn truyền `DB_HOST`, `DB_PASSWORD` ở các ngày sau mà không chép mật khẩu vào image.

```bash
docker run -d --name club-api-4000 -e PORT=4000 -p 3002:4000 club-api:day6
sleep 1
docker logs club-api-4000
curl -s localhost:3002/health
docker rm -f club-api-4000
```

Kết quả mong đợi: log in `API listening on port 4000` và `/health` trả `healthy`.

### Bước 6. Mẹo cache: build lần hai nhanh hơn

Docker lưu kết quả từng dòng (layer). Dòng nào không đổi thì dùng lại. Thêm một file thử vào mã nguồn rồi build lại:

```bash
echo "thu" > tmp-cache-test.txt
docker build -t club-api:day6 .
rm tmp-cache-test.txt
```

Kết quả mong đợi: bước `npm ci` hiện `CACHED`, chỉ bước `COPY . .` chạy lại, build xong trong vài giây. Lý do: bạn chép `package.json` và chạy `npm ci` trước, rồi mới `COPY . .`. Sửa mã nguồn không làm cài lại thư viện. Cứ giữ đúng thứ tự này; tối ưu sâu hơn học ở Lộ trình Nâng cao.

### Bước 7. Cố ý build sai thư mục

Đây là lỗi kinh điển. Đứng ở `club/` (thư mục cha của `backend`) rồi build:

```bash
cd ~/devops-labs/club
docker build -t club-api:day6 .
```

Kết quả mong đợi: build dừng ngay với lỗi dạng `failed to read dockerfile: open Dockerfile: no such file or directory`. Nguyên nhân: Dockerfile nằm trong `backend/`, nhưng context là `club/`. Sửa bằng một trong hai cách:

```bash
cd ~/devops-labs/club/backend && docker build -t club-api:day6 .
cd ~/devops-labs/club && docker build -f backend/Dockerfile -t club-api:day6 backend
```

Cách thứ hai ghi rõ file Dockerfile (`-f`) và context (`backend`). Đọc kỹ, vì ở Ngày 9 workflow CI cần đúng thông tin này.

Cuối cùng, so sánh bản của bạn với bản mẫu và dọn container:

```bash
diff ~/devops-labs/club/backend/Dockerfile ~/Dockerfile.sample
docker rm -f club-api
```

Bản mẫu dùng thêm multi-stage và `USER node`; đó là phần tối ưu của Lộ trình Nâng cao.

### Bước 8. Ghi note, commit, Pull Request

Tạo `notes/day-06.md` trong `~/devops-labs` gồm: output `curl /health`, dòng lỗi của Bước 7, và 2-3 câu giải thích build context là gì.

```bash
cd ~/devops-labs
git add club/backend/Dockerfile notes/day-06.md
git commit -m "Add Dockerfile for Club API"
git push -u origin day-06-dockerfile
```

Mở Pull Request trên GitHub rồi merge vào `main`.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker Desktop chưa chạy hoặc chưa bật WSL integration | Mở Docker Desktop, bật WSL integration cho Ubuntu |
| `failed to read dockerfile: open Dockerfile: no such file or directory` | Build sai thư mục, hoặc file không tên đúng `Dockerfile` | `cd` vào `club/backend` hoặc dùng `-f backend/Dockerfile` kèm context `backend` |
| `COPY` báo `"/package.json": not found` | `package.json` không nằm trong build context | Kiểm tra bằng `pwd` và `ls`; context là đối số cuối của `docker build` |
| `port is already allocated` | Cổng 3001 đã có container hoặc tiến trình khác | `docker ps` để tìm, `docker rm -f` container cũ hoặc đổi cổng máy (ví dụ `-p 3003:3000`) |
| Container thoát ngay (`Exited`) | `CMD` sai tên file hoặc app lỗi khi khởi động | `docker ps -a`, `docker logs club-api`, kiểm tra dòng `CMD` |
| `/ready` trả `503` | Chưa có PostgreSQL | Bình thường hôm nay; sẽ nối DB ở Ngày 7-8 |

## Nộp bài

- [ ] `club/backend/Dockerfile` do bạn viết đã được merge vào `main` của `devops-labs` bằng Pull Request.
- [ ] `notes/day-06.md` có output `curl /health` trả `healthy`.
- [ ] `notes/day-06.md` có dòng lỗi build sai thư mục và 2-3 câu giải thích build context.
- [ ] Không commit `node_modules` hay `.env`.

## Tự kiểm tra

1. `EXPOSE 3000` có làm `curl localhost:3000` chạy được từ máy bạn không? Nếu không thì cần gì?

::: details Đáp án gợi ý
Không. `EXPOSE` chỉ là ghi chú. Cần thêm `-p cổng-máy:3000` khi `docker run`.
:::

2. Khác nhau giữa `ENV PORT=3000` trong Dockerfile và `docker run -e PORT=4000` là gì?

::: details Đáp án gợi ý
`ENV` là giá trị mặc định ghi trong image; `-e` ghi đè giá trị đó cho một container lúc chạy, không cần build lại.
:::

3. Đồng đội báo "build ở máy mình được, trên CI báo `COPY` không tìm thấy `package.json`". Bạn kiểm tra gì trước?

::: details Đáp án gợi ý
Build context của lệnh build trên CI (đối số cuối và thư mục làm việc) có trỏ vào `club/backend` không; file `package.json` có được commit không; `.dockerignore` có loại nó không.
:::

## Tiếp theo

[Ngày 7 – Postgres và volume](../week-06/session-12.md)

::: details Tài liệu tham khảo
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Build context](https://docs.docker.com/build/concepts/context/)
- [Building best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker and Node.js best practices (Node.js docs)](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- Thêm bài luyện ở [trang thử thách](session-09-challenge.md).
:::
