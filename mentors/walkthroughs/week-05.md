# Đáp án tuần 5 – Dockerfile và Image Optimization

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng trang này để chấm và đối chiếu số liệu. Học viên mở sau khi đã nộp bài, để so sánh với bài của mình.
:::

> **Tóm tắt:** Đáp án Buổi 09 và Buổi 10 theo từng Phần của bài lab (L1) và từng thử thách (L2), gợi ý giải 5 nhiệm vụ của bài tập tuần 5 và đáp án 5 câu hỏi kiểm tra.

## Cách dùng tài liệu này

Hãy đối chiếu: chỗ nào bài của học viên khác đáp án thì hỏi vì sao, đừng chấm theo kiểu chép lại. Bài nộp phải có log và số đo trên chính máy học viên; số trong tài liệu này chỉ là ví dụ để biết bậc độ lớn. Tiêu chí chấm nằm ở [Hướng dẫn chấm tuần 5](../grading/week-05.md).

Các kết quả dưới đây đã được chạy thử với Docker Engine 29 trên Docker Desktop. Một vài điểm có thể khác với ví dụ trong bài lab:

- Từ Docker 29, `docker image ls` có hai cột `DISK USAGE` và `CONTENT SIZE`. Khi so sánh size, dùng cột `DISK USAGE` (con số kiểu "1.6GB" trong bài lab). Cột `CONTENT SIZE` là dung lượng nén nên nhỏ hơn nhiều.
- Dòng `transferring context` của BuildKit chỉ gửi phần thay đổi so với lần build trước, nên sau khi thêm `.dockerignore` con số có thể chỉ là vài trăm byte. Điểm cần thấy là không còn khoảng 31 MB (hoặc khoảng 100 MB ở Thử thách 7 của Buổi 10).
- Với `--progress=plain`, chữ `CACHED` thường nằm ở một dòng riêng cùng số bước, ví dụ một dòng `#8 [4/5] RUN npm ci --omit=dev` rồi một dòng `#8 CACHED`. Khi lọc bằng `grep -E "npm ci|CACHED"` phải đọc hai dòng đi cùng số bước, không chỉ tìm chữ `CACHED` bất kỳ (các bước như `FROM` cũng có thể `CACHED`).

## Buổi 09: Dockerfile

### Đáp án L1 theo từng Phần

**Chuẩn bị.** Chép `starter-project/backend` vào `lab-09/source/`, xóa `node_modules` và `Dockerfile` mẫu. `ls -a source` thấy `app.js`, `db.js`, `server.js`, `package.json`, `package-lock.json` và `.dockerignore` mẫu (giữ nguyên, Buổi 10 mới giải thích).

**Phần 1. Dockerfile đầu tiên.**

- Dockerfile gồm `FROM node:22-alpine`, `WORKDIR /app`, `COPY package.json package-lock.json ./`, `RUN npm ci --omit=dev`, `COPY . .`, `EXPOSE 3000`, `CMD ["node", "server.js"]`. Build từ `source` bằng `docker build -t club-api:lab9 .`; dòng cuối của log có `naming to docker.io/library/club-api:lab9`.
- `docker run -d --name club-api-lab9 -p 3001:3000 club-api:lab9`. `curl -s localhost:3001/health` trả `{"status":"healthy","service":"club-api"}`. `curl -s -i localhost:3001/ready | head -n 1` trả `HTTP/1.1 503 Service Unavailable` vì chưa có Postgres: kết quả đúng của tuần này, không phải lỗi. `docker logs` có `API listening on port 3000`.

**Phần 2. ENV và ghi đè lúc chạy.**

- Sau khi thêm `ENV NODE_ENV=production PORT=3000` (đặt ngay sau `WORKDIR`), `docker exec club-api-lab9 env | grep -E "NODE_ENV|PORT"` in cả hai biến.
- `docker run --rm -e PORT=4000 -d --name club-api-port club-api:lab9`, rồi `docker logs club-api-port` in `API listening on port 4000`: `-e` ghi đè `ENV`, container `club-api-lab9` vẫn trả `healthy` ở cổng 3001. Nếu log trống, thêm `sleep 1` trước `docker logs`.

**Phần 3. CMD, ENTRYPOINT và dừng container.**

- `docker run --rm club-api:lab9 node --version` in `v22.x.x`; `docker run --rm club-api:lab9 id` in `uid=0(root)` (image Buổi 09 chạy bằng root, sửa ở Buổi 10).
- Với `Dockerfile.ep` (`ENTRYPOINT ["node"]` cộng `CMD ["server.js"]`): `docker run --rm club-api:lab9-ep --version` in `v22.x.x`; `docker run --rm --entrypoint id club-api:lab9-ep` in thông tin user root.
- `time docker stop club-api-lab9` mất khoảng 10 đến 11 giây. Chạy lại container với `--init` thì dừng dưới 1 giây. Nguyên nhân: `server.js` của backend không bắt `SIGTERM`, node chạy làm PID 1 nên kernel không áp dụng hành vi mặc định, Docker chờ hết 10 giây rồi gửi `SIGKILL`.

**Phần 4. Build sai thư mục.** Đứng ở `lab-09` (thư mục cha của `source`) rồi `docker build -t club-api:lab9 .` báo `failed to read dockerfile: open Dockerfile: no such file or directory`. Hai lệnh sửa chạy lại thành công:

```bash
cd ~/devops-labs/lab-09/source && docker build -t club-api:lab9 .
cd ~/devops-labs/lab-09 && docker build -f source/Dockerfile -t club-api:lab9 source
```

Học viên phải ghi cả dòng lỗi lẫn lệnh sửa vào `evidence/command-output.txt`.

### Lời giải L2

Đề nằm ở [Buổi 09 – thử thách thêm](../../labs/week-05/session-09-challenge.md).

**Thử thách 1: giải thích CMD và ENTRYPOINT.** Bài đạt cần có ba ý: `CMD` cho ứng dụng thông thường vì dễ ghi đè để debug (`docker run image sh`); `ENTRYPOINT` cho image đóng vai công cụ, tham số nối vào sau; exec form để process là PID 1 nhận tín hiệu trực tiếp từ `docker stop`. Bằng chứng nên dán: `node --version` ở cả hai Dockerfile, và `docker run ... sh` với `ENTRYPOINT ["node"]` báo `Cannot find module '/app/sh'` (node đang cố chạy file tên `sh`).

**Thử thách 2: điều tra lỗi sai build context (tình huống 05).** Xem phần "Lời giải Phá lỗi: sai build context" bên dưới.

**Thử thách 3: Dockerfile tối ưu hơn.** Đây là nội dung Buổi 10; lời giải ở phần Thử thách 5 đến 9 của Buổi 10.

### Lời giải Phá lỗi: sai build context

Cây điều tra:

1. Đọc dòng lỗi đầu tiên. Nếu là `failed to read dockerfile: open Dockerfile: no such file or directory` thì Docker không thấy Dockerfile ở thư mục hiện tại: nghi sai thư mục. Nếu là `"/package.json": not found` ở bước `COPY` thì Dockerfile đã được tìm thấy nhưng file không nằm trong context (trường hợp `-f source/Dockerfile` kèm context `.`).
2. `pwd` và `ls`: Dockerfile và `package.json` nằm ở `source/`, còn bạn đang ở thư mục cha.
3. Nhớ lại: đối số cuối của `docker build` là context; `COPY` tìm theo context chứ không theo vị trí Dockerfile.

Nguyên nhân gốc: context không chứa file mà Dockerfile tham chiếu; lỗi nằm ở lệnh build, không ở nội dung Dockerfile. Hai cách sửa là hai lệnh ở Phần 4. Phòng tránh: luôn build từ thư mục chứa Dockerfile hoặc ghi rõ cả `-f` lẫn context; đặt lệnh chuẩn trong README, script hoặc CI.

Với `examples/troubleshooting/scenario-05`, cách sửa tương tự: đổi context thành `services/api` kèm `-f`, hoặc `cd services/api`. Cách thứ ba (đổi đường dẫn trong `COPY` thành `services/api/package.json`) cũng chạy nhưng làm Dockerfile phụ thuộc vị trí context.

### Hiểu lầm hay gặp ở Buổi 09

- Nghĩ `EXPOSE 3000` mở cổng ra host. Thực tế chỉ là tài liệu; cần `-p`.
- Tin rằng `/ready` trả `503` nghĩa là Dockerfile hỏng. Ở tuần này đó là kết quả mong đợi.
- Cho rằng `ENV PORT=3000` là "cố định". `-e PORT=4000` ghi đè được khi chạy.
- Nghĩ `docker stop` luôn gọn. Nếu app không xử lý `SIGTERM` làm PID 1, mất 10 giây.
- Chạy `time docker stop` khi container đã dừng, nên không đo được gì.

## Buổi 10: Image Optimization

### Đáp án L1 theo từng Phần

Làm trong `lab-10/source/hello-node`, đã xóa `.dockerignore` và `README.md` mẫu.

**Phần 1. Baseline naive.**

- Tạo `big.bin` 30 MB và `.env` giả. `time docker build --progress=plain -f Dockerfile.naive -t hello-node:1.0.0-naive .` có `transferring context` khoảng 31 MB. `docker image ls hello-node` cho `DISK USAGE` khoảng 1.6 GB.
- `docker run --rm hello-node:1.0.0-naive cat /app/.env` in nội dung `.env`; `id` in `uid=0(root)`.
- `docker history hello-node:1.0.0-naive`: layer do học viên tạo là `COPY . .` (khoảng 31.5 MB, chủ yếu `big.bin`) và `RUN npm install` (vài MB). Các layer còn lại thuộc base `node:22`.

**Phần 2. Thêm `.dockerignore`.**

- `.dockerignore` gồm `node_modules`, `npm-debug.log`, `.git`, `.env`, `*.bin`, `Dockerfile*`, `.dockerignore`. Build lại với tag `1.0.0-naive-ignore`: context chỉ còn rất nhỏ; `ls -a /app` không có `.env`, `big.bin`.
- Size gần như không đổi (khoảng 1.64 GB so với 1.67 GB) vì kích thước do base image. Image cũ `1.0.0-naive` vẫn chứa `.env`.

**Phần 3. Cache, multi-stage và non-root.**

- Build `Dockerfile.optimized` tag `1.0.0`, sửa `server.js`, build lại hai bản.
  - Naive: bước `COPY . .` và `RUN npm install` chạy lại, không `CACHED`.
  - Optimized: các bước `deps` có `CACHED` (kể cả `RUN npm ci --omit=dev`), chỉ bước `COPY --chown=node:node package.json server.js ./` chạy lại.
- `docker image ls hello-node`: `1.0.0` khoảng 243 MB, `1.0.0-naive-ignore` khoảng 1.64 GB. `docker run --rm --entrypoint id hello-node:1.0.0` in `uid=1000(node)`.
- Health: ngay sau khi chạy là `(health: starting)`, sau khoảng 35 giây là `(healthy)`, vì `--interval=30s`.
- Số liệu thời gian rebuild: trên app nhỏ như `hello-node`, hai bản có thể chênh nhau rất ít (đã đo cùng cỡ 8 giây vì chỉ một thư viện và npm có cache mạng). Bằng chứng đáng tin là `CACHED` trong log, không phải số giây. Không trừ điểm nếu thời gian chênh nhỏ miễn là số liệu khớp log và học viên nhận xét trung thực.

**Phần 4. Tag và digest.** `docker tag hello-node:1.0.0 hello-node:1.0` và `:latest` cho ba tag cùng IMAGE ID, không tốn thêm dung lượng. Cột DIGEST là `none` vì image chưa push.

**Phần 5. Áp dụng vào `starter-project`.** `docker build -t club-api:1.0.0 .` thành công, `id` in `uid=1000(node)`, size khoảng 244 MB; `docker tag club-api:1.0.0 club-api:1.0` cho cùng IMAGE ID. Bảng đối chiếu mẫu:

| Câu hỏi | Trả lời từ file thật |
| --- | --- |
| Stage nào cài dependency | Stage `dependencies`: `COPY package*.json ./` rồi `RUN npm ci --omit=dev` |
| Vì sao `COPY --from=dependencies` trước `COPY . .` | `node_modules` đổi hiếm hơn mã nguồn; đặt trước để layer này còn cache khi chỉ sửa code |
| `USER node` đặt ở đâu | Stage `runtime`, sau khi đã chép toàn bộ file, trước `EXPOSE` và `CMD` |
| `.dockerignore` | `node_modules`: cài trong image; `.env`: không lọt bí mật; `.git`: nặng, không cần; `coverage`, `npm-debug.log`: rác; `tests`: không cần lúc chạy |

### Lời giải L2

Đề nằm ở [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md). Thử thách 1 đến 4 làm trên `hello-node` và backend; Thử thách 5 đến 9 áp dụng lên `club-api` của Buổi 09.

**Thử thách 1: `Dockerfile.mine`.** Đáp án mẫu của bài lab (hai stage, `deps` rồi runtime, `USER node`) là một đáp án hợp lệ; bài tập yêu cầu thêm `HEALTHCHECK` (Thử thách A):

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

Dùng `--interval=10s` cho gọn: `healthy` hiện ra trong vòng dưới 1 phút (với 30 giây như bản mẫu thì phải chờ). Tiêu chí size: không quá 10% so với `Dockerfile.optimized`, hai dòng `docker image ls` đặt cạnh nhau trong report.

**Thử thách 2: giải thích `docker history`.** Layer của base: các dòng `CMD ["node"]`, `ENTRYPOINT`, `COPY docker-entrypoint.sh` và các `RUN` của Alpine (hệ điều hành, Node). Layer của học viên: `COPY --from=deps` (khoảng 4.7 MB) và `COPY package.json server.js` (khoảng 16 KB). Layer 0B hoặc vài KB: `WORKDIR`, `ENV`, `USER`, `EXPOSE`, `HEALTHCHECK`, `CMD` chỉ ghi metadata.

**Thử thách 3: chiến lược tag.**

| Bản phát hành | Tag gắn | Tag bị dời |
| --- | --- | --- |
| 1.0.0 | `1.0.0`, `1.0` | không |
| 1.0.1 | `1.0.1` | `1.0` dời từ 1.0.0 sang 1.0.1 |
| 1.1.0 | `1.1.0`, `1.1` | `latest` (nếu dùng) dời sang 1.1.0 |

Deploy luôn dùng tag đầy đủ như `club-api:1.0.1` để rollback chính xác; `1.0` và `latest` chỉ là bí danh tiện lợi. Cách mạnh hơn: deploy theo digest.

**Thử thách 4 (nâng cao): stage `test`.** Tạo `Dockerfile.test` là bản sao của Dockerfile dự án, chèn stage `test` có `npm ci` đầy đủ, `COPY . .`, `RUN npm test`:

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

Ba điểm đã kiểm chứng:

- Nếu `.dockerignore` vẫn loại `tests`, `npm test` chạy với kết quả `# tests 0`, `# pass 0` và thoát mã 0: stage "xanh" giả. Kiểm tra log có thật sự có dòng `ok 1 - GET /health returns healthy`, không chỉ thấy build thành công.
- Cách gọn nhất không đụng `.dockerignore` gốc: tạo `Dockerfile.test.dockerignore` (cùng thư mục, nội dung giống `.dockerignore` nhưng bỏ dòng `tests`); BuildKit tự dùng file này khi build bằng `-f Dockerfile.test`. Cách thô hơn là xóa dòng `tests` khỏi `.dockerignore` rồi khôi phục. Đánh đổi: bỏ `tests` khỏi ignore làm context lớn hơn, và nếu quên khôi phục thì thư mục tests lọt vào image runtime.
- Backend hiện không có devDependencies (chỉ `express` và `pg`, test dùng `node --test` có sẵn), nên "image cuối không chứa devDependencies" đúng một cách hiển nhiên. Học viên giỏi sẽ nói rõ điều này và vẫn chỉ ra cách chứng minh (`docker run --rm --entrypoint ls club-api:1.0.0 node_modules` không có gói test nào, hoặc `npm ls --omit=dev`).

Chạy: `docker build --target test -f Dockerfile.test -t club-api:test . 2>&1 | tee evidence/test-results.txt`.

**Thử thách 5: cache trên `club-api`.** Làm trong `lab-09/source`. Tạo `Dockerfile.badorder` (bỏ dòng `COPY package.json package-lock.json ./`, `COPY . .` đứng trước `RUN npm ci`). Sửa `server.js` rồi build bản này: `RUN npm ci --omit=dev` chạy lại, không `CACHED`. Build bản đúng thứ tự hai lần, giữa hai lần sửa `server.js` thêm một dòng comment: lần hai có `CACHED` ở bước `npm ci`, chỉ `COPY . .` chạy lại. Giải thích mẫu: layer `npm ci` của bản đúng chỉ phụ thuộc hai file manifest; ở bản sai, `COPY . .` đứng trước nên nội dung đổi làm layer đó mất cache, và mọi layer sau nó (gồm `npm ci`) phải build lại.

**Thử thách 6: `USER node`.** Trước khi sửa, `docker exec club-api-lab9 id` cho `uid=0(root)`. Dockerfile sau khi thêm `ENV NODE_ENV=production PORT=3000`, `COPY --chown=node:node . .` và `USER node` (đặt sau `npm ci`) cho `id` là `uid=1000(node) gid=1000(node)`, `env` có `NODE_ENV=production` và `PORT=3000`, `/health` vẫn `healthy`. Nếu đặt `USER node` trước `RUN npm ci` thì gặp lỗi quyền ghi.

**Thử thách 7: `.dockerignore` và rò rỉ trên `club-api`.** "Trước": đổi tên `.dockerignore` mẫu, tạo `.env` giả và `rac.bin` 100 MB; `transferring context` khoảng 104 MB, `docker run --rm club-api:lab9-leak ls -a /app` liệt kê `.env` và `rac.bin`. Tạo `.dockerignore` gồm `node_modules`, `npm-debug.log`, `.git`, `.env`, `*.bin`, `coverage`, `tests`, `Dockerfile*`. "Sau": context rất nhỏ, `ls -a /app` không còn hai file (vẫn thấy `node_modules`, đó là bình thường). Sau đó xóa `.env` và `rac.bin` khỏi `source/` và khôi phục `.dockerignore` mẫu nếu cần.

**Thử thách 8: viết lại có HEALTHCHECK.** Cách tiếp cận: liệt kê từng yêu cầu rồi ánh xạ sang chỉ thị: Alpine thì `FROM node:22-alpine`; non-root thì `USER node` cộng `COPY --chown`; cache thì manifest trước; không có `.env` thì `.dockerignore`; health thì `HEALTHCHECK`.

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

Vì sao chọn vậy: Alpine không có `curl` nhưng có `wget` của BusyBox; dùng `127.0.0.1` vì `localhost` có thể phân giải ra IPv6 trong khi API chỉ nghe IPv4. Kiểm tra: `docker inspect --format '{{.State.Health.Status}}' club-api-lab9` về `healthy` sau một chu kỳ (đã thử, `healthy` trong vòng chưa tới 1 phút). Cách khác: dùng `node -e` gọi `fetch` để không phụ thuộc `wget`; đổi lại lệnh dài và khởi động một tiến trình node mỗi lần kiểm tra.

**Thử thách 9: so sánh với Dockerfile của dự án.** Đáp án mẫu có ít nhất 3 điểm: hai stage (`dependencies` và `runtime`); `COPY --from=dependencies` đưa `node_modules` sang stage cuối; `npm ci --omit=dev` ở stage riêng nên cache dependency tách khỏi mã nguồn; `USER node`, `NODE_ENV=production`, `--chown` giống bản của học viên; thiếu `HEALTHCHECK`. Lợi ích: image gọn, bề mặt tấn công nhỏ, cache tốt hơn. Lưu ý: `COPY . .` ở stage cuối cũng chép cả `package.json` nhưng `node_modules` không bị chép đè vì `.dockerignore` loại `node_modules`.

**Thử thách C (bài tập): lỗi `.dockerignore` loại `package-lock.json`.** Xem phần Phá lỗi bên dưới. Với Thử thách C có hai cách sửa lỗi khác nhau: đổi thư mục hoặc dùng `-f` kèm context (lỗi build context của Buổi 09); xóa dòng ignore hoặc dùng mẫu phủ định `!package-lock.json` (lỗi của Buổi 10).

### Lời giải Phá lỗi: `.dockerignore` loại lockfile

Thêm dòng `package-lock.json` vào `.dockerignore` rồi build `Dockerfile.optimized`: lỗi `"/package-lock.json": not found` ở stage `deps`.

Cây điều tra:

1. Dòng lỗi nói `/package-lock.json` "not found" trong context, không phải lỗi `npm`.
2. `ls package-lock.json` thấy file có thật. Vậy file có trên đĩa nhưng builder không thấy.
3. Thứ lọc context là `.dockerignore`: `cat .dockerignore` thấy dòng `package-lock.json`.
4. Xóa dòng đó, build lại, thành công.

Nguyên nhân gốc: `.dockerignore` loại file khỏi context nên `COPY` không tìm thấy. Cách sửa khác: giữ ignore tổng quát nhưng thêm mẫu phủ định `!package-lock.json` sau nó. Phòng tránh: không ignore file mà Dockerfile `COPY`; khi gặp "not found" với file có thật, kiểm tra `.dockerignore` và context trước.

### Hiểu lầm hay gặp ở Buổi 10

- Tin rằng `RUN rm -rf` ở layer sau làm image nhỏ lại. Layer trước vẫn nằm trong image.
- Nghĩ `.dockerignore` thu nhỏ base image. Nó chỉ giảm context và ngăn rò rỉ; size naive gần như không đổi.
- Hiểu `latest` là "mới nhất". Đó chỉ là một tag bình thường.
- Lấy số từ bài giảng (1.6 GB, 200-250 MB) điền vào bảng thay vì đo trên máy.
- So sánh thời gian rebuild giữa hai lần build không công bằng (lần đầu kéo image, lần sau có cache).
- Đọc cột `CONTENT SIZE` thay vì `DISK USAGE` trên Docker mới rồi kết luận size naive chỉ 410 MB.
- Lo `.dockerignore` có dòng `Dockerfile*` thì `docker build -f Dockerfile.optimized` không đọc được Dockerfile. Thực tế builder vẫn đọc Dockerfile dù bị ignore (chỉ `COPY . .` không chép nó vào image).
- Đặt `USER node` trước `RUN npm ci` rồi gặp lỗi quyền ghi. `USER` phải đặt sau bước cần quyền ghi.

## Bài tập tuần 5

### Gợi ý lời giải L1

Mỗi nhiệm vụ ánh xạ sang các Phần của bài lab như trong [Bài tập tuần 5](../../assignments/weekly/week-05.md).

1. **Nhiệm vụ 1 (Buổi 09, Phần 1 đến 4).** Dockerfile cuối của Phần 2 (ghim `node:22-alpine`, `ENV NODE_ENV=production`, manifest trước, `CMD` exec form) đạt toàn bộ tiêu chí. Bằng chứng cần: log build kết thúc `naming to docker.io/library/club-api:lab9`, `curl /health`, log `API listening on port 4000`, `node --version` bắt đầu bằng `v22`, dòng lỗi build sai thư mục và lệnh sửa.
2. **Nhiệm vụ 2 (Buổi 10, Phần 3).** Đoạn A là `Dockerfile.optimized` sau khi sửa `server.js`: `RUN npm ci --omit=dev` có `CACHED`. Đoạn B là `Dockerfile.naive` sau khi sửa `server.js`: `COPY . .` và `npm install` chạy lại. Giải thích mẫu: layer `npm ci` của A chỉ phụ thuộc hai file manifest; sửa mã nguồn không đổi manifest nên layer còn nguyên. Ở B, `COPY . .` đứng trước nên nội dung đổi làm layer đó mất cache, và mọi layer sau nó phải build lại.
3. **Nhiệm vụ 3 (Buổi 10, Phần 1 và 2).** Log "trước" và "sau" cho `transferring context` và `ls -a /app`; `.dockerignore` hợp lý; xóa `.env`, `big.bin` trước khi commit; `git ls-files` không in gì.
4. **Nhiệm vụ 4 (Buổi 10, Phần 1 và 3).** Bảng bốn cột mẫu (số của một lần chạy, học viên phải có số của mình):

| Image | Size (DISK USAGE) | Rebuild sau khi sửa server.js | User | Rò .env |
| --- | --- | --- | --- | --- |
| naive (chưa ignore) | khoảng 1.67 GB | khoảng 8-11 giây | root (uid 0) | Có |
| naive đã thêm dockerignore | khoảng 1.64 GB | khoảng 8 giây | root | Không |
| optimized | khoảng 243 MB | khoảng 8 giây, các bước deps CACHED | node (uid 1000) | Không |

   Câu nhận xét mẫu: `.dockerignore` chỉ loại file khỏi context nên không động tới base image Debian `node:22`, vốn chiếm phần lớn dung lượng.
5. **Nhiệm vụ 5 (Buổi 10, Phần 5).** Như Phần 5 và bảng đối chiếu ở trên.

### Gợi ý lời giải L2

- Thử thách A: Thử thách 1 của Buổi 10 cộng `HEALTHCHECK`.
- Thử thách B: Thử thách 4 của Buổi 10 (stage `test`).
- Thử thách C: Phá lỗi (build context của Buổi 09 hoặc lockfile của Buổi 10) cộng bảng tag của Thử thách 3.

### Đáp án 5 câu hỏi kiểm tra

1. Không. `EXPOSE` chỉ là tài liệu. Cần `docker run -p 3001:3000 ...` (cổng host trước, cổng container sau).
2. Để layer `npm ci` chỉ phụ thuộc manifest. Khi một layer mất cache, mọi layer phía sau nó cũng bị build lại. Nếu `COPY . .` đứng trước, mỗi lần sửa code là cài lại dependency.
3. Thứ tự gợi ý: (a) context và `working-directory` trong lệnh build của workflow CI; (b) `.dockerignore` có loại `package.json` không; (c) file có thật sự được commit không (có thể bị `.gitignore`), cùng tên file đúng hoa thường (Linux phân biệt).
4. Layer bất biến: layer trước vẫn nằm trong image, `rm` chỉ che file ở layer sau. Multi-stage chỉ lấy kết quả cần thiết sang stage cuối, công cụ và cache bị bỏ lại.
5. Không. `latest` chỉ là tag bình thường, có thể trỏ tới image cũ. Với `club-api` deploy bằng tag version cụ thể như `club-api:1.0.0` (hoặc digest) để tái lập và rollback chính xác.
