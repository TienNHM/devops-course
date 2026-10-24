# Buổi 10 – Thử thách thêm

[Buổi 10 – Image Optimization](session-10.md) · [Bài tập tuần 5](../../assignments/weekly/week-05.md) · [Hub tuần 5](README.md)

> **Tóm tắt:** Thử thách L2, áp dụng cache, USER node, .dockerignore, HEALTHCHECK lên Dockerfile club-api của Buổi 09, phá lỗi nâng cao và câu hỏi luyện thêm. Tùy chọn, làm ở nhà sau lab bắt buộc.

::: warning Tự thử 15 phút trước khi mở
Gợi ý và lời giải được gập sẵn. Hãy tự thử ít nhất 15 phút trước khi mở; mở sớm làm mất phần học.
:::

## Thử thách L2 của Buổi 10

**Thử thách 1.** Tự viết `Dockerfile.mine` (không chép từ `Dockerfile.optimized`) cho hello-node, đạt đủ tiêu chí:

- Multi-stage, base `node:22-alpine`, có pin major version.
- Sửa `server.js` không làm `npm ci` chạy lại (chứng minh bằng log `CACHED`).
- Tiến trình chạy bằng non-root, không có `.env` trong image.
- Size không lớn hơn bản `Dockerfile.optimized` quá 10%.

**Thử thách 2.** Giải thích bằng `docker history` từng layer của image của bạn: layer nào của base, layer nào của bạn, layer nào 0B và vì sao.

**Thử thách 3.** Đưa ra chiến lược tag cho `club-api` khi có 3 bản phát hành 1.0.0, 1.0.1, 1.1.0: tag nào gắn cho image nào, và deploy dùng tag nào.

**Thử thách 4 (nâng cao).** Thêm stage `test` chạy `npm test` cho backend của starter-project mà không đưa dependency dev vào image cuối. Dùng `docker build --target test` để chạy riêng stage này.

::: details Gợi ý
- Bắt đầu từ hai stage: `deps` chỉ có `COPY package.json package-lock.json ./` và `RUN npm ci --omit=dev`.
- Stage cuối nhớ `COPY --chown=node:node` và `USER node`, đặt sau khi chép file.
- Nếu `npm ci` báo lỗi thiếu lockfile, kiểm tra `.dockerignore` có đang loại `package-lock.json` không.
- Để chạy test bạn cần devDependencies: stage `test` phải cài `npm ci` đầy đủ, khác stage `deps`.
:::

::: details Gợi ý lời giải
Thử thách 1 (một đáp án khả dĩ):

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json server.js ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

Thử thách 2: layer của base (`node:22-alpine`) đến từ nhà phát hành image, gồm hệ điều hành và Node.js; layer của bạn là `COPY --from=deps` (node_modules) và `COPY server.js`. Các lệnh `WORKDIR`, `ENV`, `USER`, `EXPOSE`, `CMD` chỉ thay đổi metadata nên 0B.

Thử thách 3: build 1.0.0 gắn `1.0.0` (và `1.0`); build 1.0.1 gắn `1.0.1` và chuyển `1.0` sang nó; build 1.1.0 gắn `1.1.0`, `1.1`. Deploy dùng tag đầy đủ như `club-api:1.0.1` để rollback chính xác; tag `1.0` hoặc `latest` chỉ là bí danh tiện lợi.

Thử thách 4: thêm stage ở giữa:

```dockerfile
FROM node:22-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

Lưu ý `.dockerignore` của starter-project đang loại thư mục `tests`, nên stage này không thấy test. Bạn cần bỏ dòng `tests` khỏi `.dockerignore` khi làm thử thách này (hoặc dùng file ignore riêng theo tên Dockerfile, ví dụ `Dockerfile.test.dockerignore` đi kèm `-f Dockerfile.test`, xem tài liệu build context của Docker) và giải thích đánh đổi; nhớ khôi phục dòng đó sau khi thử. Chạy bằng `docker build --target test -t club-api:test .`.
:::

## Áp dụng lên Dockerfile club-api của Buổi 09

Các bước này trước đây nằm trong Buổi 09; giờ chúng thuộc Buổi 10 vì cần khái niệm cache, non-root và `.dockerignore`. Làm trong `~/devops-labs/lab-09/source` (Dockerfile cuối của Buổi 09, image `club-api:lab9`, cổng host 3001).

### Thử thách 5. Chứng minh cache trên club-api

Dockerfile của Buổi 09 đã chép manifest trước. Tạo `Dockerfile.badorder` là bản sao nhưng dùng `COPY . .` rồi mới `RUN npm ci --omit=dev` (bỏ dòng `COPY package.json package-lock.json ./`). Đo hành vi của bản sai thứ tự rồi bản đúng:

```bash
cd ~/devops-labs/lab-09/source
echo "// lab9 thay doi 1" >> server.js
docker build --progress=plain -f Dockerfile.badorder -t club-api:lab9-bad . 2>&1 | grep -E "npm ci|CACHED"
```

Kết quả mong đợi: dòng `RUN npm ci --omit=dev` chạy lại (không có `CACHED` cạnh nó), tốn vài giây đến vài chục giây. Bây giờ build bản đúng thứ tự hai lần, giữa hai lần sửa mã nguồn:

```bash
docker build --progress=plain -t club-api:lab9 . 2>&1 | grep -E "npm ci|CACHED"
echo "// lab9 thay doi 2" >> server.js
docker build --progress=plain -t club-api:lab9 . 2>&1 | tee -a ../evidence/command-output.txt | grep -E "npm ci|CACHED"
```

Kết quả mong đợi: ở lần build thứ hai, `RUN npm ci --omit=dev` hiện `CACHED`; chỉ layer `COPY . .` build lại. Vì sao: layer `npm ci` chỉ phụ thuộc vào hai file manifest. Mã nguồn đổi không làm manifest đổi, nên cache còn hiệu lực. Đây là thói quen quan trọng nhất của Dockerfile cho Node.js.

**Tình huống bổ sung: mất cache vì `COPY . .` đặt sớm.** Đưa `COPY . .` lên trước `RUN npm ci`, sửa một dòng mã nguồn rồi build lại: `npm ci` chạy lại mỗi lần. Triệu chứng là build chậm không rõ lý do. Nguyên nhân gốc: layer `COPY . .` đổi nội dung nên mọi layer sau bị vô hiệu. Phòng tránh: chép manifest trước, mã nguồn sau.

### Thử thách 6. Chạy bằng user node

```bash
docker rm -f club-api-lab9
docker run -d --name club-api-lab9 -p 3001:3000 club-api:lab9
docker exec club-api-lab9 id
```

Kết quả mong đợi: `uid=0(root) gid=0(root)`. Chạy root không cần thiết là rủi ro: nếu ứng dụng bị khai thác, kẻ tấn công có quyền cao nhất trong container. Cập nhật Dockerfile thành bản có `--chown` và `USER`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

Giải thích: `COPY --chown=node:node` để file thuộc user `node`. `USER node` đặt sau `RUN npm ci` để bước cài đặt vẫn có quyền ghi. Build lại, chạy và kiểm tra:

```bash
docker build -t club-api:lab9 .
docker rm -f club-api-lab9
docker run -d --name club-api-lab9 -p 3001:3000 club-api:lab9
docker exec club-api-lab9 id | tee -a ../evidence/command-output.txt
docker exec club-api-lab9 env | grep -E "NODE_ENV|PORT"
curl -s localhost:3001/health
```

Kết quả mong đợi: `uid=1000(node) gid=1000(node)`; `NODE_ENV=production` và `PORT=3000`; `/health` vẫn trả `healthy`. Thử thêm `docker run --rm club-api:lab9 id`: in `uid=1000(node)...`.

### Thử thách 7. `.dockerignore` và rò rỉ bí mật trên club-api

Bỏ `.dockerignore` mẫu để thấy vấn đề, giả lập file bí mật và file lớn nằm nhầm trong thư mục dự án:

```bash
cd ~/devops-labs/lab-09/source
mv .dockerignore .dockerignore.mau
echo "DB_PASSWORD=gia-lap-khong-phai-that" > .env
dd if=/dev/zero of=rac.bin bs=1M count=100 status=none
docker build --progress=plain -t club-api:lab9-leak . 2>&1 | grep -i "transferring context"
docker run --rm club-api:lab9-leak ls -a /app
```

Kết quả mong đợi: dòng `transferring context` cho thấy khoảng 100 MB (ví dụ `104.86MB`; con số chính xác tùy phiên bản Docker); `ls -a /app` liệt kê cả `.env` và `rac.bin`: file bí mật đã nằm trong image. Ai pull image đều đọc được. Tạo `source/.dockerignore`:

```text
node_modules
npm-debug.log
.git
.env
*.bin
coverage
tests
Dockerfile*
```

Build lại và kiểm tra:

```bash
docker build --progress=plain -t club-api:lab9-clean . 2>&1 | grep -i "transferring context"
docker run --rm club-api:lab9-clean ls -a /app | tee -a ../evidence/command-output.txt
rm -f .env rac.bin
```

Kết quả mong đợi: context chỉ còn rất nhỏ (từ vài trăm byte đến vài chục KB, BuildKit chỉ gửi phần thay đổi so với lần trước; điều quan trọng là không còn khoảng 100 MB); `ls -a /app` không còn `.env` hay `rac.bin`. Lưu ý: bỏ `tests` khỏi image runtime là chủ ý, vì test chạy ở CI (Buổi 13). Dọn: `docker rmi club-api:lab9-leak club-api:lab9-bad`.

### Thử thách 8. Viết lại không xem mẫu, có HEALTHCHECK

Xóa Dockerfile, viết lại từ đầu cho đạt đồng thời: image dựa trên Node 22 Alpine, chạy bằng user `node`, cache dependency đúng, không chứa `.env`, có `HEALTHCHECK` gọi `/health`. Tiêu chí: `docker inspect --format '{{.State.Health.Status}}' club-api-lab9` về `healthy` sau tối đa 1 phút.

::: details Gợi ý
`HEALTHCHECK` chạy lệnh bên trong container. Image Alpine có `wget` (BusyBox) nhưng không có `curl`. Dùng `--start-period` để cho app thời gian khởi động. Mẫu tham khảo nằm ở `examples/docker/hello-node/Dockerfile.optimized`.
:::

::: details Lời giải
```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]
```

Kiểm tra: `docker run -d --name club-api-lab9 -p 3001:3000 club-api:lab9` rồi `docker ps` (cột STATUS có `healthy`). Dùng `127.0.0.1` thay vì `localhost` để tránh phân giải ra IPv6 trong một số image.
:::

### Thử thách 9. So sánh với Dockerfile của dự án

Đọc `starter-project/backend/Dockerfile` (multi-stage). Liệt kê ít nhất 3 điểm khác với Dockerfile của bạn và đoán lợi ích của từng điểm.

::: details Gợi ý
Đếm số `FROM`. Xem `COPY --from`. Xem bước `npm ci` nằm ở stage nào và image cuối có chứa công cụ build hay không.
:::

::: details Lời giải
Điểm khác chính: (1) hai stage (`dependencies` và `runtime`), stage cuối chỉ nhận `node_modules` đã cài qua `COPY --from=dependencies`, nên image cuối gọn và không giữ cache npm; (2) dùng `npm ci --omit=dev` ở stage riêng; (3) user `node`, `NODE_ENV=production`, `--chown` giống bản của bạn. Lợi ích: image nhỏ hơn, bề mặt tấn công nhỏ hơn, cache tốt hơn.
:::

## Phá lỗi nâng cao {#pha-loi-nang-cao}

**Tình huống: build thất bại sau khi thêm `.dockerignore`** (liên quan tình huống 05). Bạn có thể xem thêm bộ file tại `examples/troubleshooting/scenario-05/`.

**Cách phá.** Trong `source/hello-node` (đã có `.dockerignore` từ Phần 2), thêm dòng sau:

```bash
echo "package-lock.json" >> .dockerignore
docker build -f Dockerfile.optimized -t hello-node:broken .
```

**Triệu chứng.** Build dừng ở stage `deps` với thông báo tương tự:

```text
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...: "/package-lock.json": not found
```

**Hướng điều tra.**

1. Đọc dòng lỗi: file `/package-lock.json` "not found" trong context, không phải lỗi npm.
2. Kiểm tra file có tồn tại trên đĩa không: `ls package-lock.json` (có).
3. Vậy file có trên đĩa nhưng builder không thấy. Nghĩ tới thứ lọc context: `cat .dockerignore`.
4. Thấy `package-lock.json` bị liệt kê. Xóa dòng đó, build lại để xác nhận.

**Nguyên nhân gốc.** `.dockerignore` loại file khỏi context nên `COPY` không tìm thấy nó, dù file vẫn nằm trên máy.

**Phòng tránh.** Chỉ ignore thứ chắc chắn không cần; không ignore file mà Dockerfile `COPY`. Khi gặp "not found" với file đang có thật, kiểm tra `.dockerignore` và build context (tham số cuối của `docker build`) trước tiên. Nếu cần chắc chắn, dùng mẫu phủ định `!package-lock.json` để cho phép lại.

Tình huống mở rộng: chạy thử lỗi trong `examples/troubleshooting/scenario-05/` theo hướng dẫn của thư mục đó. Chỉ ghi lại triệu chứng, tự tìm nguyên nhân gốc rồi điền vào `report.md`. Lỗi sai thư mục build của Buổi 09 nằm ở [Buổi 09 – thử thách thêm](session-09-challenge.md#pha-loi-nang-cao).

## Câu hỏi luyện thêm {#cau-hoi-luyen-them}

1. Multi-stage build giảm kích thước bằng cách nào?
2. Tình huống: đồng nghiệp báo "build trên CI mất 6 phút dù chỉ sửa README". Bạn kiểm tra những gì và sửa thế nào?
3. Tình huống: build báo `"/package-lock.json": not found` dù file có trong thư mục. Bạn làm gì đầu tiên?
4. Vì sao `COPY package.json package-lock.json ./` phải đứng trước `COPY . .`?
5. Tình huống: sau khi thêm `USER node`, container thoát với `EACCES` khi ghi file log vào `/app/logs`. Nguyên nhân và cách sửa?
6. Vì sao nên ghim `node:22-alpine` thay vì `node:latest`?

::: details Đáp án
1. Chỉ stage cuối thành image; công cụ build và cache ở các stage trước bị bỏ.
2. Xem layer nào mất cache (log build); kiểm tra `COPY . .` đặt trước cài dependency và `.dockerignore` thiếu `.git`, `node_modules`, `*.md`. Sửa thứ tự lệnh, thêm `.dockerignore`. Sửa README chỉ nên làm đổi layer cuối hoặc không làm đổi layer nào nếu README được ignore.
3. Kiểm tra `.dockerignore` có loại file đó không và build context có đúng thư mục không.
4. Để layer `npm ci` chỉ phụ thuộc manifest. Nếu `COPY . .` đứng trước, mỗi lần sửa mã nguồn sẽ làm hỏng cache và cài lại toàn bộ dependency.
5. User `node` không có quyền tạo thư mục trong `/app` do root sở hữu. Sửa: tạo thư mục và gán quyền khi build (`RUN mkdir logs && chown node:node logs` trước `USER node`), hoặc tốt hơn là ghi log ra stdout/stderr.
6. Để build tái lập: `latest` đổi theo thời gian, cùng Dockerfile hôm nay và tháng sau có thể ra image khác, gây lỗi khó truy vết.
:::

## Bảng tham khảo {#bang-tham-khao}

Chuyển từ phần Tìm hiểu thêm của bài chính.

**Chọn base image.**

| Base | Kích thước tham khảo | Ghi chú |
| --- | --- | --- |
| `node:22` | trên 1 GB | Debian đầy đủ, nhiều công cụ build; thường không cần cho runtime |
| `node:22-slim` | khoảng 200-250 MB | Debian rút gọn, tương thích glibc tốt |
| `node:22-alpine` | khoảng 150-200 MB | Dùng musl và busybox, rất nhỏ; vài thư viện native có thể gặp vấn đề |

Con số thay đổi theo bản phát hành; hãy tin số bạn đo bằng `docker image ls`.

**Vì sao ignore.**

| Nên ignore | Lý do |
| --- | --- |
| `node_modules` | Cài lại trong image; bản trên máy bạn có thể sai hệ điều hành |
| `.git` | Lịch sử repo nặng, không cần khi chạy |
| `.env`, `*.pem` | Chứa bí mật, không được vào image |
| `tests`, `coverage`, `*.md` | Không cần ở runtime |
| `Dockerfile*`, `.dockerignore` | Không cần bên trong image |
