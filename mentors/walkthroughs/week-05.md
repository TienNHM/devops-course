# Walkthrough tuần 5 – Dockerfile và Image Optimization

::: warning Dành cho mentor và học viên đã nộp bài
Trang này là đáp án đối chiếu: mentor dùng để chấm, học viên chỉ mở sau khi đã nộp bài của mình.
:::

> **Tóm tắt:** Hướng dẫn giải Buổi 09 và Buổi 10 (Dockerfile, build cache, dockerignore, multi-stage, tag), kèm gợi ý giải bài tập tuần 5 và bảng chấm cho mentor.

## Ghi chú đối chiếu sau cải tổ bài học

Bài lab đã được cải tổ theo ranh giới mới: Buổi 09 chỉ dạy Dockerfile chạy được, `ENV`, `CMD`, `ENTRYPOINT` và build context; layer cache, `.dockerignore`, `USER node`, multi-stage và tag thuộc Buổi 10. Đáp án bên dưới vẫn đúng về kỹ thuật, chỉ khác chỗ làm:

| Phần cũ trong walkthrough | Nay nằm ở |
| --- | --- |
| Buổi 09 Phần 2 (cache trên club-api) | [Thử thách 5 của Buổi 10](../../labs/week-05/session-10-challenge.md); bằng chứng cache của bài tập lấy ở Buổi 10 Phần 3 (hello-node) |
| Buổi 09 Phần 3 (`USER node`) | [Thử thách 6 của Buổi 10](../../labs/week-05/session-10-challenge.md); `ENV` và `-e` vẫn ở Buổi 09 Phần 2 |
| Buổi 09 Phần 5 (rò rỉ `rac.bin`, `.dockerignore`) | [Thử thách 7 của Buổi 10](../../labs/week-05/session-10-challenge.md); bằng chứng của bài tập lấy ở Buổi 10 Phần 1 và 2 (`big.bin` 30 MB) |
| L2 Buổi 09 Thử thách 1 (`HEALTHCHECK`) và 4 (so sánh multi-stage) | Thử thách 8 và 9 của [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md) |
| Phá lỗi sai build context | [Buổi 09 – thử thách thêm](../../labs/week-05/session-09-challenge.md#pha-loi-nang-cao); Phần 4 của Buổi 09 làm bản rút gọn |
| Nhiệm vụ 1 và `USER node`; Nhiệm vụ 2 `Dockerfile.badorder`; Nhiệm vụ 3 `rac.bin` | Xem bảng "Điều chỉnh sau cải tổ" ở [Barem và hướng dẫn chấm tuần 5](../grading/week-05.md): `USER node` chuyển sang Nhiệm vụ 4 và 5; bằng chứng cache và rò rỉ làm trên hello-node ở `lab-10` |

Mọi lệnh và lời giải L2 trong tài liệu này không đổi; nhiều bước cũ của Buổi 09 giờ chỉ là phần thử thách thêm.

## Cách dùng tài liệu này

Chỉ đọc sau khi bạn đã tự làm bài lab và bài tập. Hãy đối chiếu: chỗ nào bạn làm khác đáp án thì tự hỏi vì sao, đừng chép lại. Bài nộp phải có log và số liệu đo trên chính máy bạn; số trong tài liệu này chỉ là ví dụ để biết bậc độ lớn.

Các kết quả dưới đây đã được chạy thử với Docker Engine 29 trên Docker Desktop. Một vài điểm khác với ví dụ trong bài lab, nên biết trước để không hoang mang:

- Từ Docker 29, `docker image ls` có hai cột `DISK USAGE` và `CONTENT SIZE`. Khi so sánh size, dùng cột `DISK USAGE` (đó là con số kiểu "1.6GB" trong bài lab). Cột `CONTENT SIZE` là dung lượng nén nên nhỏ hơn nhiều.
- Dòng `transferring context` của BuildKit chỉ gửi phần thay đổi so với lần build trước, nên sau khi thêm `.dockerignore` con số có thể chỉ là vài trăm byte chứ không phải vài chục KB. Điểm cần thấy là không còn khoảng 100 MB (Buổi 09) hoặc 31 MB (Buổi 10).
- Với `--progress=plain`, chữ `CACHED` thường nằm ở một dòng riêng cùng số bước, ví dụ một dòng `#8 [4/5] RUN npm ci --omit=dev` rồi một dòng `#8 CACHED`. Khi lọc bằng `grep -E "npm ci|CACHED"` bạn phải đọc hai dòng đi cùng số bước, không chỉ tìm chữ `CACHED` bất kỳ (vì các bước như `FROM` cũng có thể `CACHED`).

### Buổi 09 – Dockerfile

#### Đáp án các nhiệm vụ L1

1. Chuẩn bị: chép `starter-project/backend` vào `source/`, xóa `node_modules`, `Dockerfile`, `.dockerignore`. Kiểm tra `ls -a source` thấy `app.js`, `db.js`, `server.js`, `package.json`, `package-lock.json`, `tests`.
2. Dockerfile đầu tiên (Phần 1) có `COPY . .` trước `RUN npm ci --omit=dev`. Build từ `source` bằng `docker build -t club-api:lab9 .`. Dòng cuối của log có `naming to docker.io/library/club-api:lab9`.
3. Chạy `docker run -d --name club-api-lab9 -p 3001:3000 club-api:lab9`. Kết quả quan trọng:
   - `curl -s localhost:3001/health` trả `{"status":"healthy","service":"club-api"}`.
   - `curl -s -i localhost:3001/ready | head -n 1` trả `HTTP/1.1 503 Service Unavailable` vì chưa có Postgres. Đây là kết quả đúng của tuần này, không phải lỗi.
   - `docker logs` có `API listening on port 3000`.
4. Phần 2, đo cache: thêm một dòng comment vào `server.js` rồi build bản cũ, `RUN npm ci` chạy lại. Sau đó đổi Dockerfile thành bản chép manifest riêng:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

   Build một lần, sửa `server.js` thêm một dòng comment nữa, build lần hai: bước `npm ci` có dòng `CACHED`, chỉ `COPY . .` chạy lại.
5. Phần 3, user an toàn: trước khi sửa, `docker exec club-api-lab9 id` cho `uid=0(root)`. Sau khi thêm `ENV NODE_ENV=production PORT=3000`, `COPY --chown=node:node . .` và `USER node` (đặt sau `npm ci`), `id` cho `uid=1000(node) gid=1000(node)`, `env` có `NODE_ENV=production` và `PORT=3000`. `docker run --rm -e PORT=4000 -d ...` rồi `docker logs` cho `API listening on port 4000`: `-e` ghi đè `ENV`.
6. Phần 4, CMD và ENTRYPOINT: `docker run --rm club-api:lab9 node --version` in `v22.x.x`; `docker run --rm club-api:lab9 id` in `uid=1000(node)`. Với `Dockerfile.ep` (`ENTRYPOINT ["node"]` cộng `CMD ["server.js"]`): `docker run --rm club-api:lab9-ep --version` in `v22.x.x`; `docker run --rm --entrypoint id club-api:lab9-ep` in `uid=1000(node)`.
7. `time docker stop club-api-lab9` mất khoảng 10-11 giây. Chạy lại container với `--init` thì dừng dưới 1 giây. Nguyên nhân: `server.js` của backend không bắt `SIGTERM`, node chạy làm PID 1 nên kernel không áp dụng hành vi mặc định, Docker chờ hết 10 giây rồi gửi `SIGKILL`.
8. Phần 5, rò rỉ và `.dockerignore`:
   - "Trước": tạo `.env` giả và `rac.bin` 100 MB, build thấy `transferring context` lên tới khoảng 104 MB, `docker run --rm club-api:lab9-leak ls -a /app` liệt kê `.env` và `rac.bin`.
   - Tạo `.dockerignore` gồm `node_modules`, `npm-debug.log`, `.git`, `.env`, `*.bin`, `coverage`, `tests`, `Dockerfile*`.
   - "Sau": context chỉ còn rất nhỏ, `ls -a /app` không còn `.env`, `rac.bin` (vẫn thấy `.dockerignore` và `node_modules`, đó là bình thường). Sau đó xóa `.env` và `rac.bin` khỏi `source/`.

#### Lời giải L2

**Thử thách 1: viết lại không xem mẫu, có HEALTHCHECK.** Cách tiếp cận: liệt kê từng yêu cầu rồi ánh xạ sang chỉ thị: Alpine thì `FROM node:22-alpine`; non-root thì `USER node` cộng `COPY --chown`; cache thì manifest trước; không có `.env` thì `.dockerignore`; health thì `HEALTHCHECK`.

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

Vì sao chọn vậy: Alpine không có `curl` nhưng có `wget` của BusyBox; dùng `127.0.0.1` vì `localhost` có thể phân giải ra IPv6 trong khi API chỉ nghe IPv4. Kiểm tra: chạy container rồi `docker inspect --format '{{.State.Health.Status}}' club-api-lab9` về `healthy` sau một chu kỳ kiểm tra (đã thử, `healthy` trong vòng chưa tới 1 phút). Cách khác: dùng `node -e` gọi `fetch` để không phụ thuộc `wget`; đổi lại lệnh dài và khởi động một tiến trình node mỗi lần kiểm tra.

**Thử thách 2: CMD và ENTRYPOINT.** Bài đạt cần có ba ý: `CMD` cho ứng dụng thông thường vì dễ ghi đè để debug (`docker run image sh`); `ENTRYPOINT` cho image đóng vai công cụ, tham số nối vào sau; exec form để process là PID 1 nhận tín hiệu trực tiếp từ `docker stop`. Bằng chứng nên dán: `node --version` ở cả hai Dockerfile, và `docker run ... sh` với `ENTRYPOINT ["node"]` báo `Cannot find module '/app/sh'` (node đang cố chạy file tên `sh`).

**Thử thách 3: sai build context (Tình huống 05).** Xem phần Phá lỗi bên dưới.

**Thử thách 4: so sánh với Dockerfile của dự án.** Đáp án mẫu có ít nhất 3 điểm: hai stage (`dependencies` và `runtime`); `COPY --from=dependencies` đưa `node_modules` sang stage cuối; `npm ci --omit=dev` ở stage riêng nên cache dependency tách khỏi mã nguồn; `USER node`, `NODE_ENV=production`, `--chown` giống bản của học viên; thiếu `HEALTHCHECK`. Lợi ích: image gọn, bề mặt tấn công nhỏ, cache tốt hơn. Lưu ý: so sánh thật ra cho thấy `COPY . .` ở stage cuối cũng chép cả `package.json` nhưng `node_modules` không bị chép đè vì `.dockerignore` loại `node_modules`.

#### Lời giải phần Phá lỗi: sai build context

Cây điều tra:

1. Đọc dòng lỗi đầu tiên. Nếu là `failed to read dockerfile: open Dockerfile: no such file or directory` thì Docker không thấy Dockerfile ở thư mục hiện tại: nghi sai thư mục. Nếu là `"/package.json": not found` ở bước `COPY` thì Dockerfile đã được tìm thấy nhưng file không nằm trong context.
2. `pwd` và `ls`: Dockerfile và `package.json` nằm ở `source/`, còn bạn đang ở thư mục cha.
3. Nhớ lại: đối số cuối của `docker build` là context; `COPY` tìm theo context chứ không theo vị trí Dockerfile.

Nguyên nhân gốc: context không chứa file mà Dockerfile tham chiếu; lỗi nằm ở lệnh build, không ở nội dung Dockerfile. Hai cách sửa:

```bash
cd ~/devops-labs/lab-09/source && docker build -t club-api:lab9 .
docker build -f source/Dockerfile -t club-api:lab9 source
```

Phòng tránh: luôn build từ thư mục chứa Dockerfile hoặc ghi rõ cả `-f` lẫn context; đặt lệnh chuẩn trong README, script hoặc CI. Tình huống bổ sung (`COPY . .` đặt sớm) đã được chứng minh ở Phần 2. Với `examples/troubleshooting/scenario-05`, cách sửa tương tự: đổi context thành `services/api` kèm `-f`, hoặc `cd services/api`. Cách thứ ba (đổi đường dẫn trong `COPY` thành `services/api/package.json`) cũng chạy nhưng làm Dockerfile phụ thuộc vị trí context.

#### Những hiểu lầm hay gặp

- Nghĩ `EXPOSE 3000` mở cổng ra host. Thực tế chỉ là tài liệu; cần `-p`.
- Tin rằng `/ready` trả `503` nghĩa là Dockerfile hỏng. Ở tuần này đó là kết quả mong đợi.
- Nghĩ `.dockerignore` làm `docker build -f Dockerfile.ep` không đọc được Dockerfile vì có dòng `Dockerfile*`. Thực tế builder vẫn đọc Dockerfile dù bị ignore (chỉ `COPY . .` không chép nó vào image).
- Đặt `USER node` trước `RUN npm ci` rồi gặp lỗi quyền ghi. `USER` phải đặt sau bước cần quyền ghi.
- Cho rằng `ENV PORT=3000` là "cố định". `-e PORT=4000` ghi đè được khi chạy.
- Nghĩ `docker stop` luôn gọn. Nếu app không xử lý `SIGTERM` làm PID 1, mất 10 giây.

### Buổi 10 – Image Optimization

#### Đáp án các nhiệm vụ L1

Làm trong `source/hello-node` đã xóa `.dockerignore` và `README.md`.

1. Phần 1, baseline: tạo `big.bin` 30 MB và `.env` giả; `time docker build --progress=plain -f Dockerfile.naive -t hello-node:1.0.0-naive .` có `transferring context` khoảng 31 MB. `docker image ls hello-node` cho `DISK USAGE` khoảng 1.6 GB. `docker run --rm hello-node:1.0.0-naive cat /app/.env` in nội dung `.env`; `id` in `uid=0(root)`.
2. Phần 2, `docker history hello-node:1.0.0-naive`: layer do học viên tạo là `COPY . .` (khoảng 31.5 MB, chủ yếu `big.bin`) và `RUN npm install` (vài MB). Các layer còn lại thuộc base `node:22`.
3. Phần 3, `.dockerignore` gồm `node_modules`, `npm-debug.log`, `.git`, `.env`, `*.bin`, `Dockerfile*`, `.dockerignore`. Build lại với tag `1.0.0-naive-ignore`: context chỉ còn rất nhỏ; `ls -a /app` không có `.env`, `big.bin`. Size gần như không đổi (khoảng 1.64 GB so với 1.67 GB) vì kích thước do base image.
4. Phần 4, cache: build `Dockerfile.optimized` tag `1.0.0`, sửa `server.js`, build lại hai bản.
   - Naive: bước `COPY . .` và `RUN npm install` chạy lại, không `CACHED`.
   - Optimized: các bước `deps` có `CACHED` (kể cả `RUN npm ci --omit=dev`), chỉ bước `COPY --chown=node:node package.json server.js ./` chạy lại.
   - `docker image ls hello-node`: `1.0.0` khoảng 243 MB, `1.0.0-naive-ignore` khoảng 1.64 GB. `docker run --rm --entrypoint id hello-node:1.0.0` in `uid=1000(node)`.
   - Health: ngay sau khi chạy là `(health: starting)`, sau khoảng 35 giây là `(healthy)`, vì `--interval=30s`.
5. Phần 5, tag: `docker tag hello-node:1.0.0 hello-node:1.0` và `:latest` cho ba tag cùng IMAGE ID, không tốn thêm dung lượng.
6. Phần 6, `club-api:1.0.0` từ `starter-project/backend`: `docker build -t club-api:1.0.0 .` thành công, `id` in `uid=1000(node)`, size khoảng 244 MB; `docker tag club-api:1.0.0 club-api:1.0` cho cùng IMAGE ID. Bảng đối chiếu mẫu:

| Câu hỏi | Trả lời từ file thật |
| --- | --- |
| Stage nào cài dependency | Stage `dependencies`: `COPY package*.json ./` rồi `RUN npm ci --omit=dev` |
| Vì sao `COPY --from=dependencies` trước `COPY . .` | `node_modules` đổi hiếm hơn mã nguồn; đặt trước để layer này còn cache khi chỉ sửa code |
| `USER node` đặt ở đâu | Stage `runtime`, sau khi đã chép toàn bộ file, trước `EXPOSE` và `CMD` |
| `.dockerignore` | `node_modules`: cài trong image; `.env`: không lọt bí mật; `.git`: nặng, không cần; `coverage`, `npm-debug.log`: rác; `tests`: không cần lúc chạy |

Số liệu thời gian rebuild: trên app nhỏ như `hello-node`, hai bản có thể chênh nhau rất ít (đã đo cùng cỡ 8 giây vì chỉ một thư viện và npm có cache mạng). Bằng chứng đáng tin là `CACHED` trong log, không phải con số giây. Mentor không trừ điểm nếu thời gian chênh nhỏ miễn là số liệu khớp log và học viên nhận xét trung thực.

#### Lời giải L2

**Thử thách 1: `Dockerfile.mine`.** Đáp án mẫu của bài lab (hai stage, `deps` rồi runtime, `USER node`) là một đáp án hợp lệ; học viên có thể thêm `HEALTHCHECK` như bài tập yêu cầu:

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
HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]
```

Dùng `--interval=10s` cho gọn: `healthy` hiện ra trong vòng dưới 1 phút (với 30 giây như bản mẫu thì phải chờ). Tiêu chí size: không quá 10% so với `Dockerfile.optimized`, đặt hai dòng `docker image ls` cạnh nhau trong report.

**Thử thách 2: giải thích `docker history`.** Layer của base: các dòng `CMD ["node"]`, `ENTRYPOINT`, `COPY docker-entrypoint.sh` và các `RUN` của Alpine (hệ điều hành, Node). Layer của học viên: `COPY --from=deps` (khoảng 4.7 MB) và `COPY package.json server.js` (khoảng 16 KB). Layer 0B: `WORKDIR` (chỉ vài KB), `ENV`, `USER`, `EXPOSE`, `HEALTHCHECK`, `CMD` chỉ ghi metadata.

**Thử thách 3: chiến lược tag.** Đáp án mẫu:

| Bản phát hành | Tag gắn | Tag bị dời |
| --- | --- | --- |
| 1.0.0 | `1.0.0`, `1.0` | không |
| 1.0.1 | `1.0.1` | `1.0` dời từ 1.0.0 sang 1.0.1 |
| 1.1.0 | `1.1.0`, `1.1` | `latest` (nếu dùng) dời sang 1.1.0 |

Deploy luôn dùng tag đầy đủ như `club-api:1.0.1` để rollback chính xác; `1.0` và `latest` chỉ là bí danh tiện lợi. Cách khác mạnh hơn: deploy theo digest.

**Thử thách 4 (nâng cao): stage `test`.** Cách tiếp cận: tạo `Dockerfile.test` là bản sao của Dockerfile dự án, chèn stage `test` có `npm ci` đầy đủ, `COPY . .`, `RUN npm test`.

```dockerfile
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

Hai điểm quan trọng đã kiểm chứng:

- Nếu `.dockerignore` vẫn loại `tests`, `npm test` chạy với kết quả `# tests 0`, `# pass 0` và thoát mã 0: stage "xanh" giả. Mentor hãy kiểm tra log có thật sự có dòng `ok 1 - GET /health returns healthy` hay không, không chỉ thấy build thành công.
- Cách xử lý gọn nhất không đụng `.dockerignore` gốc: tạo file `Dockerfile.test.dockerignore` (cùng thư mục, nội dung giống `.dockerignore` nhưng bỏ dòng `tests`), BuildKit tự dùng file này khi build bằng `-f Dockerfile.test`. Cách thô hơn là xóa dòng `tests` khỏi `.dockerignore` rồi khôi phục. Đánh đổi: bỏ `tests` khỏi ignore làm context lớn hơn và nếu quên khôi phục thì thư mục tests lọt vào image runtime.
- Backend hiện không có devDependencies (chỉ `express` và `pg`, test dùng `node --test` có sẵn). Vì vậy "image cuối không chứa devDependencies" đúng một cách hiển nhiên; học viên giỏi sẽ nói rõ điều này, và vẫn chỉ ra cách chứng minh (`docker run --rm --entrypoint ls club-api:1.0.0 node_modules` không có gói test nào, hoặc `npm ls --omit=dev`).

Chạy: `docker build --target test -f Dockerfile.test -t club-api:test . 2>&1 | tee evidence/test-results.txt`.

**Thử thách C (bài tập): lỗi `.dockerignore` loại `package-lock.json`.** Thêm dòng `package-lock.json` vào `.dockerignore` rồi build `Dockerfile.optimized`: lỗi `"/package-lock.json": not found` ở stage `deps`.

#### Lời giải phần Phá lỗi: `.dockerignore` loại lockfile

Cây điều tra:

1. Dòng lỗi nói `/package-lock.json` "not found" trong context, không phải lỗi `npm`.
2. `ls package-lock.json` thấy file có thật. Vậy file có trên đĩa nhưng builder không thấy.
3. Thứ lọc context là `.dockerignore`: `cat .dockerignore` thấy dòng `package-lock.json`.
4. Xóa dòng đó, build lại, thành công.

Nguyên nhân gốc: `.dockerignore` loại file khỏi context nên `COPY` không tìm thấy. Cách sửa khác: giữ ignore tổng quát nhưng thêm mẫu phủ định `!package-lock.json` sau nó. Phòng tránh: không ignore file mà Dockerfile `COPY`; khi gặp "not found" với file có thật, kiểm tra `.dockerignore` và context trước.

#### Những hiểu lầm hay gặp

- Tin rằng `RUN rm -rf` ở layer sau làm image nhỏ lại. Layer trước vẫn nằm trong image.
- Nghĩ `.dockerignore` thu nhỏ base image. Nó chỉ giảm context và ngăn rò rỉ; size naive gần như không đổi.
- Hiểu `latest` là "mới nhất". Đó chỉ là một tag bình thường.
- Lấy số từ bài giảng (1.6 GB, 200-250 MB) điền vào bảng thay vì đo trên máy.
- So sánh thời gian rebuild giữa hai lần build không công bằng (lần đầu kéo image, lần sau có cache).
- Đọc cột `CONTENT SIZE` thay vì `DISK USAGE` trên Docker mới rồi kết luận size naive chỉ 410 MB.

### Bài tập tuần

#### Gợi ý lời giải L1

1. **Nhiệm vụ 1.** Dockerfile cuối của Phần 3 (ghim `node:22-alpine`, `ENV NODE_ENV=production`, manifest trước, `USER node`, `CMD` exec form) đạt toàn bộ tiêu chí. Bằng chứng cần: log build kết thúc `naming to docker.io/library/club-api:lab9`, `curl /health`, `docker exec ... id`, `node --version` bắt đầu bằng `v22`.
2. **Nhiệm vụ 2.** Đoạn A là Dockerfile đúng thứ tự sau khi sửa `server.js`: `RUN npm ci --omit=dev` có `CACHED`. Đoạn B dùng `Dockerfile.badorder` (bản có `COPY . .` đặt trước `npm ci`), build bằng `-f Dockerfile.badorder`, sửa `server.js` rồi build lại: `npm ci` chạy lại. Giải thích mẫu: layer `npm ci` của A chỉ phụ thuộc hai file manifest; sửa mã nguồn không đổi manifest nên layer còn nguyên. Ở B, `COPY . .` đứng trước nên nội dung đổi làm layer đó mất cache, và mọi layer sau nó (gồm `npm ci`) phải build lại.
3. **Nhiệm vụ 3.** Như Phần 5 của Buổi 09: log "trước" và "sau" cho `transferring context` và `ls -a /app`; xóa `.env`, `rac.bin` trước khi commit; `git ls-files` không in gì.
4. **Nhiệm vụ 4.** Bảng bốn cột mẫu (số của một lần chạy, học viên phải có số của mình):

| Image | Size (DISK USAGE) | Rebuild sau khi sửa server.js | User | Rò .env |
| --- | --- | --- | --- | --- |
| naive (chưa ignore) | khoảng 1.67 GB | khoảng 8-11 giây | root (uid 0) | Có |
| naive đã thêm dockerignore | khoảng 1.64 GB | khoảng 8 giây | root | Không |
| optimized | khoảng 243 MB | khoảng 8 giây, các bước deps CACHED | node (uid 1000) | Không |

   Câu nhận xét mẫu: `.dockerignore` chỉ loại file khỏi context nên không động tới base image Debian `node:22`, vốn chiếm phần lớn dung lượng.
5. **Nhiệm vụ 5.** Như Phần 6 của Buổi 10 và bảng đối chiếu phía trên.

#### Gợi ý lời giải L2

Xem phần Lời giải L2 của Buổi 10 (Thử thách 1, 4 cho A và B; bảng tag cho C). Với Thử thách C có hai cách sửa lỗi khác nhau: đổi thư mục hoặc dùng `-f` kèm context (Buổi 09); xóa dòng ignore hoặc dùng mẫu phủ định `!package-lock.json` (Buổi 10).

#### Đáp án 5 câu hỏi kiểm tra

1. Không. `EXPOSE` chỉ là tài liệu. Cần `docker run -p 3001:3000 ...` (cổng host trước, cổng container sau).
2. Để layer `npm ci` chỉ phụ thuộc manifest. Khi một layer mất cache, mọi layer phía sau nó cũng bị build lại. Nếu `COPY . .` đứng trước, mỗi lần sửa code là cài lại dependency.
3. Thứ tự gợi ý: (a) context và `working-directory` trong lệnh build của workflow CI; (b) `.dockerignore` có loại `package.json` không; (c) file có thật sự được commit không (có thể bị `.gitignore`), cùng tên file đúng hoa thường (Linux phân biệt).
4. Layer bất biến: layer trước vẫn nằm trong image, `rm` chỉ che file ở layer sau. Multi-stage chỉ lấy kết quả cần thiết sang stage cuối, công cụ và cache bị bỏ lại.
5. Không. `latest` chỉ là tag bình thường, có thể trỏ tới image cũ. Với `club-api` deploy bằng tag version cụ thể như `club-api:1.0.0` (hoặc digest) để tái lập và rollback chính xác.

### Hướng dẫn chấm cho mentor

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Dockerfile club-api (20) | Log build kết thúc đúng tên image, `curl /health`, `id` có `uid=1000(node)`, `node --version` v22; lệnh có kèm output | Dockerfile giống hệt đáp án mẫu nhưng log thiếu lệnh; `id` lấy từ image khác tên; dùng `node:latest` | Nếu đặt `USER node` trước `RUN npm ci` thì điều gì có thể hỏng? Vì sao bạn chọn Alpine? |
| Chứng minh cache (15) | Hai đoạn log, A có `CACHED` ngay cạnh bước `npm ci`, B không; `Dockerfile.badorder` có `COPY . .` trước `npm ci` | Chỉ thấy `CACHED` ở bước khác (ví dụ `FROM`); không sửa `server.js` giữa hai lần build; giải thích không nhắc manifest và layer | Sửa `package.json` thêm một thư viện thì layer nào mất cache? Sửa README thì sao? |
| `.dockerignore` và rò rỉ (15) | `transferring context` khoảng 100 MB lúc đầu rồi rất nhỏ; `ls -a /app` có `.env` rồi không còn; `git ls-files` sạch | Chỉ có log "sau"; `.env` còn trong repo; ignore luôn `package-lock.json` | Image đã build với `.env` rồi, thêm `.dockerignore` xong thì image cũ có sạch không? Nếu đã push thì làm gì? |
| Đo naive và optimized (20) | `docker image ls`, `docker history` của hai image, `cat /app/.env`, `id`, dòng `real` của `time`; mỗi số trong bảng truy được về log | Số trong bảng trùng số bài giảng (1.6 GB, 200-250 MB) nhưng log ghi khác; thiếu cột nào đó; nhầm cột `CONTENT SIZE` | Layer nào trong `docker history` của bạn lớn nhất, của ai tạo? Vì sao `.dockerignore` không thu nhỏ image naive? |
| `club-api:1.0.0` và tag (10) | Log build, `docker image ls club-api` có `1.0.0` và `1.0` cùng IMAGE ID, `id` đúng; bảng đối chiếu bám file dự án | Bảng đối chiếu chung chung, không nhắc tên stage `dependencies` và `runtime` | `COPY --from=dependencies` làm gì? Tag `1.0` và `1.0.0` có tốn thêm dung lượng không? |
| `report.md`, `README.md` (10) | Đủ 7 câu, ghi mức L1 hoặc L2, 5 câu kiểm tra trả lời bằng lời riêng | Câu trả lời giống nhau từng chữ giữa các bạn hoặc chép đề bài | Giải thích bằng lời của bạn vì sao `EXPOSE` không đủ để truy cập từ host |
| Bằng chứng, kỷ luật repo (5) | Đúng cấu trúc thư mục, evidence là text thật có lệnh, lệnh quét secret không in gì | Evidence chỉ có ảnh; còn `.env`, `rac.bin`, `big.bin`, `node_modules` trong repo | Bạn kiểm tra không có secret trong repo bằng lệnh nào? |
| Quy trình nộp (5) | PR có nhận xét cụ thể của người review | Review chỉ ghi "OK"; push thẳng vào `main` | Reviewer đã chạy lại lệnh nào, kết quả ra sao? |
| L2 (thưởng) | `Dockerfile.mine` có `healthy` và `CACHED`; `evidence/test-results.txt` có dòng test thật, không phải `# tests 0` | Stage test xanh nhưng `# tests 0` (tests bị ignore); chép nguyên `Dockerfile.optimized` | Vì sao stage `test` ở bài này không cần devDependencies riêng? |

Gợi ý chung khi vấn đáp: yêu cầu học viên chạy lại một lệnh trong evidence (ví dụ `docker history`) và giải thích từng dòng. Bài hiểu thật sẽ trả lời được vì sao layer `0B` tồn tại; bài chép thường chỉ đọc lại số.
