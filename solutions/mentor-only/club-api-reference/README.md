# Club API - Bản tham chiếu capstone (dành cho mentor)

Đây là một lời giải đầy đủ cho capstone: bắt đầu từ `starter-project/` rồi bổ sung CRUD, validation, test không cần database, giao diện thêm/sửa/xóa, Compose có healthcheck, manifests Kubernetes hoàn chỉnh và bộ workflows tham chiếu. Học viên tự làm capstone, vì vậy không phát thư mục này cho học viên và không đưa vào repo công khai.

Mục đích sử dụng: mentor dùng để chấm, để demo "đích đến", và để đối chiếu khi nhóm bị kẹt. Không đưa nguyên văn cho nhóm; chỉ gợi ý hướng đi.

## Khác gì so với starter-project

| Hạng mục | Starter | Bản tham chiếu |
|---|---|---|
| Backend | `GET /api/members` | Thêm `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`, error handler, tắt êm khi nhận SIGTERM |
| Validation | Không có | `name` (bắt buộc, tối đa 100 ký tự), `email` (bắt buộc, đúng định dạng, tối đa 150, chuẩn hóa chữ thường), `id` là số nguyên dương |
| Mã trạng thái | 200, 500 | 200, 201, 204, 400, 404, 409 (email trùng), 413, 500, 503 (`/ready`) |
| Truy vấn | Tham số hóa | Giữ nguyên, mọi câu lệnh dùng `$1`, `$2` |
| Test | `/health` | Thêm `tests/members.test.js` (mock pool) và `tests/members.integration.test.js` (database thật, tùy chọn) |
| Frontend | Chỉ liệt kê | Form thêm, sửa, xóa; dữ liệu hiển thị bằng `textContent` |
| Compose | Cơ bản | Healthcheck frontend và backend, `read_only`, `tmpfs`, `cap_drop`, giới hạn tài nguyên, cổng cấu hình qua `WEB_PORT` và `API_PORT` |
| Kubernetes | Thiếu cách nạp `init.sql` | ConfigMap `postgres-init` mount vào `/docker-entrypoint-initdb.d`, securityContext, startupProbe, rolling update không gián đoạn |
| CI/CD | Workflow mẫu của giáo trình | `.github/workflows-reference/` gồm `ci.yml`, `publish.yml`, `security.yml` |

## Cấu trúc

```text
club-api-reference/
  backend/            Express 5 + pg, tests/ (unit + integration)
  frontend/           Nginx tĩnh, index.html có form CRUD
  database/init.sql   Schema và dữ liệu mẫu
  compose.yaml        frontend, backend, postgres
  k8s/                Manifests cho kind
  .github/workflows-reference/   ci.yml, publish.yml, security.yml
  .env.example
```

Thư mục `.github/workflows-reference/` được đặt tên khác `workflows` để workflows không chạy trong repo giáo trình. Khi dùng cho repo nhóm, sao chép thành `.github/workflows/` (đường dẫn trong workflow giả định gốc repo là nội dung của thư mục này, tức có sẵn `backend/` và `frontend/`).

## Chạy bằng Docker Compose

Làm việc trong filesystem của WSL (ví dụ `~/club-api-reference`), không dùng `/mnt/c`.

```bash
cp .env.example .env     # đặt DB_PASSWORD local; đổi WEB_PORT, API_PORT nếu bị bận
docker compose up -d --build
docker compose ps
```

Kết quả mong đợi: ba service đều ở trạng thái `healthy` sau khoảng 15 giây.

```bash
curl -s localhost:3000/ready
curl -s -X POST localhost:3000/api/members \
  -H 'content-type: application/json' \
  -d '{"name":"Carol","email":"carol@example.com"}'
curl -s localhost:3000/api/members/3
curl -s -X PUT localhost:3000/api/members/3 \
  -H 'content-type: application/json' \
  -d '{"name":"Carol B","email":"carol@example.com"}'
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE localhost:3000/api/members/3
```

Kết quả mong đợi theo thứ tự: `{"status":"ready"}`, `201` kèm JSON của Carol, JSON của Carol, JSON với tên mới, rồi `204`.

Các tình huống lỗi nên thử khi demo:

| Yêu cầu | Mã |
|---|---|
| `POST` với `{"name":"","email":"x"}` | 400 |
| `POST` email đã tồn tại | 409 |
| `GET /api/members/abc` | 400 |
| `GET /api/members/999` | 404 |
| `DELETE` hai lần cùng một id | 204 rồi 404 |

Kiểm tra dữ liệu bền vững:

```bash
docker compose down        # không có -v
docker compose up -d
curl -s localhost:3000/api/members
```

Dữ liệu vẫn còn. `docker compose down -v` mới xóa volume `postgres-data`.

## Test backend

```bash
cd backend
npm ci
npm test
```

`tests/members.test.js` dùng mock pool được truyền vào `createApp(pool)`, nên không cần database và chạy dưới một giây. Bộ test bao phủ validation, id không hợp lệ, JSON hỏng, 404, 409 và lỗi database (500, 503).

Test tích hợp chỉ chạy khi đặt `RUN_INTEGRATION=1` (CI bật biến này với service container Postgres). Chạy thử local với một Postgres tạm:

```bash
docker run -d --name it-pg -e POSTGRES_USER=club -e POSTGRES_DB=clubdb \
  -e POSTGRES_PASSWORD=local-only -p 127.0.0.1:15432:5432 postgres:17-alpine
RUN_INTEGRATION=1 DB_HOST=127.0.0.1 DB_PORT=15432 DB_PASSWORD=local-only npm test
docker rm -f it-pg
```

## Kubernetes (kind)

```bash
kind create cluster --name club --config k8s/kind-config.yaml
docker build -t club-api:1.0.0 ./backend && kind load docker-image club-api:1.0.0 --name club
docker build -t club-web:1.0.0 ./frontend && kind load docker-image club-web:1.0.0 --name club

kubectl apply -f k8s/namespace.yaml
kubectl create secret generic club-secrets -n club --from-literal=db-password='<mật-khẩu-local>'
kubectl create configmap postgres-init -n club --from-file=init.sql=database/init.sql
kubectl apply -f k8s/configmap.yaml -f k8s/postgres.yaml
kubectl rollout status statefulset/postgres -n club
kubectl apply -f k8s/backend.yaml -f k8s/frontend.yaml
kubectl get pods -n club
kubectl port-forward -n club svc/club-web 8080:80
```

Điểm cần giải thích với học viên:

- Secret được tạo bằng lệnh, không có giá trị thật trong repo. `k8s/secret.example.yaml` chỉ là mẫu với placeholder.
- ConfigMap `postgres-init` được tạo từ chính `database/init.sql`, nên Compose và Kubernetes dùng chung một nguồn schema. Image Postgres chỉ chạy script trong `/docker-entrypoint-initdb.d` khi thư mục dữ liệu còn trống. Nếu PVC đã có dữ liệu, sửa ConfigMap không tạo lại bảng.
- Backend chạy 2 replica với `maxUnavailable: 0`, readinessProbe `/ready` (chạm database) và livenessProbe `/health` (không chạm database), để database chậm không khiến Pod bị restart liên tục.
- Mở rộng backend: `kubectl scale deployment/club-api -n club --replicas=3`.
- Ingress (`k8s/ingress.yaml`) cần cài ingress-nginx cho kind; xem hướng dẫn chính thức của kind để chọn đúng manifest theo phiên bản.
- kind dùng CNI mặc định không thực thi NetworkPolicy, nên bản tham chiếu không có NetworkPolicy.

## Workflows tham chiếu

| File | Nội dung |
|---|---|
| `ci.yml` | Unit test, integration test với service container `postgres:17-alpine`, build image (không push, cache `gha`), `docker compose config` |
| `publish.yml` | Build và đẩy `club-api`, `club-web` lên GHCR với tag `sha-xxxxxxx` và tag git; cache `gha`; quyền `packages: write` chỉ cấp ở cấp job |
| `security.yml` | Trivy quét repo (vuln, secret, misconfig) và quét hai image, fail với mức HIGH và CRITICAL (chỉ lỗi đã có bản vá) |

Lưu ý khi dùng thật: ghim action theo commit SHA đã kiểm tra, và xác nhận phiên bản `aquasecurity/trivy-action` trên trang releases của action đó. Sau lần publish đầu tiên, package trên GHCR mặc định ở chế độ private; học viên cần đổi visibility hoặc cấu hình `imagePullSecrets` nếu muốn kéo image từ cluster.

## Definition of Done cho capstone

Dùng danh sách này khi chấm. Mỗi mục cần có bằng chứng (lệnh và kết quả, hoặc link tới run).

- [ ] Cloneable: người ngoài clone repo, `cp .env.example .env`, `docker compose up -d --build` là chạy được, README nhóm mô tả đủ bước.
- [ ] Không có secret thật trong repo hoặc lịch sử git; `.env` nằm trong `.gitignore`.
- [ ] CRUD hoạt động đủ 4 thao tác, mã lỗi đúng (400, 404, 409, 201, 204), có validation `name` và `email`.
- [ ] Persistent: `docker compose down` rồi `up` lại, dữ liệu còn nguyên.
- [ ] Healthcheck: `docker compose ps` hiển thị `healthy` cho cả ba service.
- [ ] Test: `npm test` pass, test không phụ thuộc database thật; có ít nhất một test cho nhánh lỗi.
- [ ] CI: workflow chạy tự động trên pull request, có bước test và build image; có ảnh chụp hoặc link run xanh.
- [ ] Image: publish lên GHCR với tag theo SHA hoặc phiên bản (không chỉ `latest`); mô tả cách kéo image.
- [ ] Bảo mật cơ bản: container backend không chạy bằng root, có giới hạn tài nguyên, Trivy không còn lỗi HIGH hoặc CRITICAL chưa xử lý (hoặc có ghi chú lý do chấp nhận).
- [ ] Kubernetes: toàn bộ Pod `Running` và `Ready` trong namespace `club`, truy cập được giao diện qua port-forward hoặc Ingress.
- [ ] Dữ liệu mẫu có trong cluster (nạp `init.sql` qua ConfigMap hoặc Job) và còn sau khi xóa Pod postgres.
- [ ] Scale backend: tăng lên 3 replica và thấy 3 Pod `Ready`; trình diễn rolling update mà `/api/members` vẫn trả lời.
- [ ] Giải thích được: vì sao readiness khác liveness, vì sao dùng Secret, điều gì xảy ra khi xóa PVC.
- [ ] Runbook ngắn: ít nhất ba lỗi đã gặp trong lúc làm, triệu chứng, nguyên nhân gốc và cách sửa.

## Đã kiểm chứng và chưa kiểm chứng

Đã chạy thật (Docker Desktop, Node 22):

- `npm ci && npm test` trong `backend/`: 12 test pass, 1 test tích hợp được bỏ qua khi không có database.
- Test tích hợp với Postgres 17 tạm (cổng 15432): 17/17 pass.
- `docker compose build` hai image; `docker compose up` với project `ref-s1`, `WEB_PORT=18080`, `API_PORT=13000`: ba service `healthy`.
- Gọi bằng `curl`: danh sách, tạo (201), email trùng (409), dữ liệu sai (400), id sai (400), không tồn tại (404), sửa (200), xóa (204 rồi 404), và gọi qua proxy Nginx của frontend.
- `docker compose down` (không `-v`) rồi `up`: dữ liệu còn nguyên. Sau đó dọn bằng `down -v`.
- Frontend chạy với `read_only: true` và tmpfs mà không có lỗi trong log.
- Cú pháp YAML của `k8s/` và workflows được parse thành công; lệnh `kubectl create configmap ... --dry-run=client -o yaml` sinh đúng ConfigMap.

Chưa kiểm chứng:

- Manifests trong `k8s/` chưa được áp dụng lên cluster: máy kiểm chứng không có kind, và `kubectl apply --dry-run=client` cần kết nối tới API server. Mentor nên chạy thử trên kind trước buổi dạy, đặc biệt securityContext của frontend (`readOnlyRootFilesystem` với Nginx) và cách nạp `init.sql`.
- Ba workflows chưa chạy trên GitHub Actions; phiên bản `aquasecurity/trivy-action@0.28.0` chưa được xác nhận với trang releases.
- Giao diện chưa được thử trong trình duyệt; chỉ kiểm tra HTML được phục vụ và API phía sau.
