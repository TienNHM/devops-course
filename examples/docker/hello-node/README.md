# hello-node: so sánh Dockerfile naive và optimized

Buổi liên quan: Tuần 3-4 (viết Dockerfile, layer cache, multi-stage build, non-root, `.dockerignore`).

App là một server Express 5 rất nhỏ với hai endpoint: `/` và `/health`. Cùng một mã nguồn, hai Dockerfile cho kết quả rất khác nhau.

| Điểm so sánh | `Dockerfile.naive` | `Dockerfile.optimized` |
| --- | --- | --- |
| Base image | `node:22` (Debian đầy đủ) | `node:22-alpine` |
| Multi-stage | Không | Có (`deps` và `runtime`) |
| Cache | `COPY . .` trước `npm install`: sửa 1 dòng code là cài lại toàn bộ dependency | Chép `package*.json` trước, `npm ci` được cache |
| Dependency | `npm install` (kể cả devDependencies) | `npm ci --omit=dev` theo đúng `package-lock.json` |
| User | root | `node` (non-root) |
| Healthcheck | Không | Có |

## Build và so sánh kích thước

```bash
cd examples/docker/hello-node
docker build -f Dockerfile.naive -t hello-node:naive .
docker build -f Dockerfile.optimized -t hello-node:optimized .
docker images hello-node
```

Kết quả mong đợi (số liệu thay đổi theo phiên bản base image và cách Docker hiển thị kích thước, nhưng chênh lệch lớn như sau):

```text
REPOSITORY   TAG         IMAGE ID       CREATED          SIZE
hello-node   optimized   6a203249baf9   10 seconds ago   243MB
hello-node   naive       e1c3b531f426   40 seconds ago   1.64GB
```

Nếu muốn con số "nén" (kích thước thật khi truyền qua registry), dùng:

```bash
docker image inspect hello-node:naive hello-node:optimized --format '{{.RepoTags}} {{.Size}}'
```

## Chạy và kiểm tra user

```bash
docker run -d --name hello-optimized -p 38081:3000 hello-node:optimized
curl -s http://localhost:38081
curl -s http://localhost:38081/health
```

```text
Hello from hello-node (uid=1000)
{"status":"healthy"}
```

Với bản naive, kết quả của `docker run --rm hello-node:naive id -u` là `0` (root). Với bản optimized là `1000` (user `node`).

Sau khoảng 10 giây, xem trạng thái healthcheck:

```bash
docker inspect hello-optimized --format '{{.State.Health.Status}}'
```

```text
healthy
```

## Thử nghiệm layer cache

1. Build lại `hello-node:optimized` lần hai: mọi bước hiển thị `CACHED`.
2. Sửa chuỗi trong `server.js`, build lại: bước `npm ci` vẫn `CACHED`, chỉ layer `COPY` cuối chạy lại.
3. Làm tương tự với `Dockerfile.naive`: bước `npm install` chạy lại hoàn toàn.

## Câu hỏi để giải thích

- Vì sao `COPY package.json package-lock.json ./` phải đứng trước `COPY` mã nguồn?
- Multi-stage giúp loại bỏ những gì khỏi image cuối?
- Vì sao chạy bằng root trong container vẫn là rủi ro?
- `.dockerignore` giúp gì cho tốc độ build và bảo mật?

## Dọn dẹp

```bash
docker rm -f hello-optimized
docker rmi hello-node:naive hello-node:optimized
```
