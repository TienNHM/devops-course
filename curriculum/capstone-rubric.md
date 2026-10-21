# Rubric chấm Capstone (100 điểm)

> **Tóm tắt:** Mười tiêu chí lấy từ [assessment.md](assessment.md), mỗi tiêu chí có bốn mức Excellent, Good, Pass, Needs improvement kèm điểm, bằng chứng cần kiểm tra và lệnh kiểm tra nhanh. Cuối trang là cách chuyển điểm nhóm thành điểm cá nhân.

Đề bài và yêu cầu: [Capstone](../assignments/capstone/README.md). Kịch bản demo: [demo-guide.md](../assignments/capstone/demo-guide.md).

## 1. Nguyên tắc chấm

- Chấm bằng **bằng chứng**: source, lịch sử Git, log, kết quả chạy. Không chấm theo lời kể hay ảnh chụp màn hình đơn lẻ.
- Điểm mỗi tiêu chí là một khoảng; mentor chọn điểm trong khoảng theo mức độ gần với mô tả.
- Điều kiện hoàn thành khóa: Final Project tối thiểu 60/100.
- Tiêu chí thiếu bằng chứng tối thiểu (ví dụ không có Dockerfile) không vượt quá mức Needs improvement.
- Hai mentor nên chấm độc lập các tiêu chí 4, 5, 10 rồi thống nhất.

## 2. Bảng tổng hợp

| # | Tiêu chí | Điểm tối đa |
| --- | --- | --- |
| 1 | Git workflow và source structure | 5 |
| 2 | Dockerfile và image optimization | 10 |
| 3 | Docker Compose và networking | 10 |
| 4 | CI/CD pipeline | 15 |
| 5 | Kubernetes workloads | 15 |
| 6 | Configuration, storage, health checks | 10 |
| 7 | Troubleshooting | 10 |
| 8 | Security practices | 10 |
| 9 | Documentation | 5 |
| 10 | Demo và technical defense | 10 |
| | Tổng | 100 |

Các lệnh kiểm tra nhanh bên dưới giả định mentor đã clone repo nhóm và đang ở thư mục gốc repo. Điều chỉnh tên file, namespace, tên Deployment cho khớp bài của nhóm.

## 3. Mô tả chi tiết từng tiêu chí

### 1. Git workflow và source structure (5 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 5 | Mọi thay đổi qua PR có review thật, commit rõ nghĩa, Issue liên kết PR, `main` được bảo vệ, cấu trúc repo gọn và nhất quán |
| Good | 4 | Hầu hết qua PR, có review, vài commit chưa rõ nghĩa, cấu trúc hợp lý |
| Pass | 3 | Có dùng nhánh và PR nhưng review hình thức, một số thay đổi push thẳng `main` |
| Needs improvement | 0–2 | Gần như push thẳng `main`, một người làm hầu hết, cấu trúc lộn xộn |

**Bằng chứng:** danh sách PR đã merge, review comment, tab Issues/Projects, `.gitignore`.

```bash
git log --oneline --merges | head -20
git shortlog -sn --no-merges
git log --format='%an %s' | head -30
git ls-files | grep -E '(^|/)\.env$' || echo "khong co .env duoc commit"
```

Đầu ra mong đợi: nhiều tác giả, thông điệp commit mô tả được thay đổi, dòng cuối in thông báo không có `.env`. Lưu ý: nếu nhóm dùng Squash and merge thì không có merge commit; hãy đếm PR trên GitHub (`gh pr list --state merged` nếu mentor đã cài GitHub CLI).

### 2. Dockerfile và image optimization (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Multi-stage, base image pin phiên bản, user không phải root, `.dockerignore`, tối ưu cache lớp, image nhỏ, có `HEALTHCHECK` hoặc probe tương đương, giải thích được từng quyết định |
| Good | 7–8 | Multi-stage, pin phiên bản, `.dockerignore`, chạy non-root; thiếu một điểm tối ưu |
| Pass | 5–6 | Build được và chạy được, nhưng dùng `latest`, chạy bằng root hoặc không tối ưu cache |
| Needs improvement | 0–4 | Build lỗi, image cồng kềnh chứa cả công cụ build, hoặc chứa secret |

**Bằng chứng:** Dockerfile backend và frontend, `.dockerignore`, kích thước image, kết quả build.

```bash
docker build -t capstone-api:check ./backend
docker image ls capstone-api:check
docker run --rm --entrypoint id capstone-api:check
docker history capstone-api:check | head
grep -n -E '^FROM' backend/Dockerfile
```

Đầu ra mong đợi: `uid` khác 0 trong lệnh `id`; các dòng `FROM` có tag cụ thể và có hơn một stage; `docker history` không chứa mật khẩu hay token. Nếu image frontend không có lệnh `id` thì kiểm tra bằng `docker inspect` mục `Config.User`.

### 3. Docker Compose và networking (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Một lệnh chạy cả stack, healthcheck và `depends_on` theo điều kiện, volume cho PostgreSQL, network riêng, biến qua `.env` kèm `.env.example`, chỉ publish cổng cần thiết, giải thích được DNS nội bộ |
| Good | 7–8 | Stack chạy ổn, có volume và `.env`, thiếu healthcheck hoặc publish dư cổng |
| Pass | 5–6 | Chạy được nhưng thứ tự khởi động không ổn định, cấu hình cứng trong file |
| Needs improvement | 0–4 | Không chạy được từ đầu, mất dữ liệu khi recreate, hoặc cần cài DB thủ công |

**Bằng chứng:** `compose.yaml`, `.env.example`, kết quả `docker compose ps`.

```bash
cp .env.example .env
docker compose config --quiet && echo "compose hop le"
docker compose up -d --build
docker compose ps
docker compose down
docker compose up -d
curl -s http://localhost:3000/api/members
```

Đầu ra mong đợi: các service ở trạng thái running hoặc healthy; danh sách thành viên sau `down` rồi `up` vẫn còn dữ liệu đã thêm trước đó. Cổng publish có thể khác tùy nhóm (xem `compose.yaml`). Dọn dẹp bằng `docker compose down` (không `-v` nếu cần giữ dữ liệu).

### 4. CI/CD pipeline (15 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 14–15 | CI trên PR (test, build thử image, validate), publish GHCR khi merge hoặc tag, tag truy vết được, cache, `permissions` tối thiểu, có bước quét hoặc kiểm tra bảo mật, CI chặn merge khi đỏ, nhóm giải thích được từng job |
| Good | 11–13 | CI và publish hoạt động, tag hợp lý, permissions đúng; thiếu một thành phần nâng cao |
| Pass | 8–10 | Có CI chạy test và có publish nhưng thủ công một phần, hoặc tag chỉ là `latest` |
| Needs improvement | 0–7 | Không có workflow chạy thành công, hoặc workflow chứa secret cứng |

**Bằng chứng:** `.github/workflows/`, tab Actions (cả run xanh và đỏ), trang Packages.

```bash
ls .github/workflows
grep -n -E 'permissions|uses:|on:' .github/workflows/*.yml
grep -rn -E 'ghp_|password: [^$]' .github/workflows || echo "khong thay secret cung"
```

Đầu ra mong đợi: có `permissions` ở cấp workflow hoặc job; các action có phiên bản (ví dụ `actions/checkout@v4`); không tìm thấy token hay mật khẩu viết cứng. Mentor mở tab Actions để xác nhận lần chạy gần nhất và kiểm tra trang Packages có image với tag SHA hoặc phiên bản.

### 5. Kubernetes workloads (15 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 14–15 | Deployment (backend nhiều replica, frontend), Service đúng selector, StatefulSet hoặc PVC cho DB, Ingress hoạt động, requests/limits, rolling update và rollback chứng minh được, scale thành công |
| Good | 11–13 | Toàn bộ chạy ổn, truy cập được từ browser, thiếu resources hoặc Ingress |
| Pass | 8–10 | Các workload chạy nhưng cấu hình sơ sài, truy cập qua port-forward, scale chưa thử |
| Needs improvement | 0–7 | Pod không ổn định, không truy cập được, hoặc manifest không apply sạch |

**Bằng chứng:** thư mục `k8s/`, kết quả lệnh trên cluster của nhóm khi demo.

```bash
kubectl get pods,svc,ingress,pvc -n club
kubectl get deployment -n club -o wide
kubectl scale deployment club-api -n club --replicas=3
kubectl rollout status deployment/club-api -n club
kubectl rollout history deployment/club-api -n club
kubectl get endpoints backend -n club
```

Đầu ra mong đợi: Pod `Running` và `READY` đầy đủ; PVC ở trạng thái `Bound`; Endpoints của Service liệt kê các địa chỉ Pod; scale lên 3 thành công. Tên Service và Deployment lấy theo manifest của nhóm. Nếu nhóm đổi tên so với starter project thì mentor dùng `kubectl get all -n club`.

### 6. Configuration, storage, health checks (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Cấu hình tách khỏi image (ConfigMap, Secret, biến môi trường), dữ liệu bền qua việc xóa Pod, `/health` và `/ready` phân biệt đúng, liveness/readiness probe cấu hình hợp lý, chứng minh được hành vi khi DB mất |
| Good | 7–8 | Cấu hình và dữ liệu đúng, probe có nhưng ngưỡng chưa cân nhắc |
| Pass | 5–6 | Có ConfigMap/Secret và PVC, probe thiếu hoặc dùng sai endpoint |
| Needs improvement | 0–4 | Cấu hình cứng trong image, dữ liệu mất khi Pod restart, không có health check |

**Bằng chứng:** ConfigMap, Secret (chỉ dạng mẫu trong Git), PVC, probe trong manifest, thử nghiệm xóa Pod.

```bash
kubectl get configmap,secret -n club
kubectl get deployment club-api -n club -o jsonpath='{.spec.template.spec.containers[0].readinessProbe}'
kubectl delete pod postgres-0 -n club
kubectl wait --for=condition=Ready pod/postgres-0 -n club --timeout=120s
curl -s http://localhost:8080/api/members
```

Đầu ra mong đợi: Pod `postgres-0` được tạo lại, `Ready`, và dữ liệu thành viên còn nguyên. Cổng 8080 giả định đã port-forward hoặc truy cập qua Ingress; điều chỉnh theo thiết lập của nhóm. Tên Pod `postgres-0` đúng với StatefulSet tên `postgres`.

### 7. Troubleshooting (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Từ 3 sự cố trở lên, mỗi mục đủ triệu chứng, nguyên nhân gốc, cách xác minh bằng lệnh, cách sửa, cách phòng tránh; xử lý tốt sự cố do mentor tạo tại chỗ |
| Good | 7–8 | Từ 3 sự cố, thiếu một phần (thường là cách phòng tránh hoặc xác minh); xử lý được sự cố mentor tạo với gợi ý ít |
| Pass | 5–6 | Có 2–3 sự cố, nêu giải pháp nhưng không chứng minh nguyên nhân gốc |
| Needs improvement | 0–4 | Không có log hoặc chỉ ghi "đã sửa lỗi" mà không có phân tích |

**Bằng chứng:** `docs/troubleshooting-log.md` (hoặc mục trong README), lịch sử commit sửa lỗi, phần thực hành tại buổi demo.

```bash
grep -c -i 'nguyên nhân' docs/troubleshooting-log.md
git log --oneline --grep='fix' -i | head
```

Đầu ra mong đợi: số mục lớn hơn hoặc bằng 3. Quan trọng hơn: mentor tạo một sự cố ngắn (ví dụ đổi sai tên Secret) và quan sát nhóm tìm nguyên nhân bằng log, `describe`, events thay vì đoán.

### 8. Security practices (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Không có secret trong Git (kể cả lịch sử), container non-root, quét image và xử lý kết quả, workflow quyền tối thiểu, image pin phiên bản, Secret tách khỏi ConfigMap; có thêm một biện pháp nâng cao (securityContext, NetworkPolicy) |
| Good | 7–8 | Đạt các mục cơ bản, quét image có chạy nhưng chưa xử lý đầy đủ |
| Pass | 5–6 | Không có secret rõ ràng trong code nhưng thiếu quét hoặc chạy bằng root |
| Needs improvement | 0–4 | Có secret thật trong repo, hoặc mật khẩu cứng trong manifest/workflow |

**Bằng chứng:** `.gitignore`, `.env.example`, `k8s/secret.example.yaml`, workflow quét, kết quả quét.

```bash
git ls-files | grep -E '(^|/)(\.env|.*kubeconfig.*)$' || echo "khong co file nhay cam"
git log --all -p -S'password' --oneline -- . ':!*.md' | head -20
grep -rn -i -E 'password|token' k8s compose.yaml | grep -v -i -E 'secretKeyRef|\$\{|example|<'
```

Đầu ra mong đợi: không có file nhạy cảm bị theo dõi; các lần xuất hiện của từ `password` chỉ là tên biến, không phải giá trị thật. Lệnh thứ hai và thứ ba có thể cho nhiều kết quả giả, mentor đọc từng dòng để phân biệt. Nếu nghi ngờ có secret trong lịch sử, yêu cầu nhóm giải thích cách xoay secret.

### 9. Documentation (5 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 5 | Người lạ chạy được theo README trong 15 phút; có architecture diagram đúng với hệ thống, ADR, runbook, troubleshooting log |
| Good | 4 | README đầy đủ và chạy được, thiếu một thành phần phụ (ADR hoặc runbook) |
| Pass | 3 | Có hướng dẫn chạy nhưng thiếu bước, sơ đồ chung chung |
| Needs improvement | 0–2 | README sơ sài, sai lệch so với thực tế |

**Bằng chứng:** `README.md`, `docs/adr/`, `docs/runbook.md`.

```bash
ls docs/adr
grep -c -E '^```mermaid' README.md
```

Đầu ra mong đợi: ít nhất 3 file ADR; ít nhất một khối mermaid. Kiểm tra thực chất: một mentor hoặc học viên nhóm khác làm theo README trên máy sạch và ghi lại bước nào sai.

### 10. Demo và technical defense (10 điểm)

| Mức | Điểm | Mô tả |
| --- | --- | --- |
| Excellent | 9–10 | Demo đúng giờ, mọi chức năng chạy thật, cả nhóm tham gia, trả lời đúng và sâu các câu hỏi kỹ thuật, nhận định hạn chế trung thực, xử lý lỗi tại chỗ bình tĩnh |
| Good | 7–8 | Demo ổn, trả lời được phần lớn câu hỏi, một số thành viên nói ít |
| Pass | 5–6 | Demo chạy với hỗ trợ, trả lời được câu cơ bản, khó giải thích các lựa chọn |
| Needs improvement | 0–4 | Demo không chạy, không giải thích được hệ thống của mình |

**Bằng chứng:** buổi demo trực tiếp, video dự phòng, phiếu nhận xét của mentor. Tiêu chí phụ chi tiết xem [demo-guide.md](../assignments/capstone/demo-guide.md).

## 4. Điểm cá nhân và điểm nhóm

Điểm rubric ở trên là **điểm nhóm** (tối đa 100). Điểm cá nhân của Final Project:

```text
Điểm cá nhân = Điểm nhóm × Hệ số đóng góp
```

Hệ số đóng góp nằm trong khoảng 0,6 đến 1,0 và thường là 1,0. Chỉ giảm khi có bằng chứng thiếu đóng góp. Không tăng quá điểm nhóm.

### Nguồn bằng chứng đóng góp

| Nguồn | Cách xem | Ý nghĩa |
| --- | --- | --- |
| Số PR đã merge và độ lớn | Danh sách PR của repo, lọc theo tác giả | Có đưa thay đổi thật vào `main` không |
| Commit theo tác giả | `git shortlog -sn --no-merges` | Chỉ là tham khảo, không đo bằng số dòng |
| Review đã làm | Tab Pull requests, mục review của từng người | Có đọc code của bạn không, comment có nội dung không |
| Issue và board | GitHub Projects | Có nhận và hoàn thành việc đã giao |
| Peer review | [Template peer review](../templates/peer-review-template.md) | Góc nhìn của đồng đội |
| Buổi hỏi đáp | Quan sát của mentor | Có hiểu phần của mình và phần của nhóm không |

### Cách xác định hệ số

| Mức đóng góp | Hệ số | Dấu hiệu |
| --- | --- | --- |
| Đầy đủ | 1,0 | Có PR đã merge ở nhiều buổi, đã review PR của người khác, trả lời tốt khi bảo vệ |
| Một phần | 0,8–0,9 | Đóng góp ít hoặc dồn vào phút cuối, review hình thức, trả lời được phần mình |
| Thấp | 0,6–0,7 | Rất ít PR, gần như không review, không giải thích được hệ thống |

Quy tắc bổ sung:

- Mentor tham khảo tối thiểu ba nguồn bằng chứng trước khi giảm hệ số, và trao đổi với học viên trước khi chốt.
- Đóng góp không đo bằng số dòng code. Một PR sửa gọn Dockerfile và giải thích rõ có thể quan trọng hơn trăm dòng tự sinh.
- Peer review bất lợi riêng lẻ không đủ để giảm hệ số; cần phù hợp với lịch sử Git và quan sát của mentor.
- Nếu một thành viên làm hộ phần việc của người khác, mentor ghi nhận cả hai: người làm hộ có đóng góp, người được làm hộ bị xem xét giảm hệ số.
- Học viên được xem bằng chứng và phản hồi trước khi điểm cuối được công bố.

### Điều chỉnh khi nhóm có 3 người

Rubric không đổi. Mentor không trừ điểm vì nhóm ít người mà chỉ đánh giá theo yêu cầu bắt buộc; yêu cầu nâng cao là điểm cộng khi chấm mức Excellent.

## 5. Phiếu chấm nhanh

| # | Tiêu chí | Tối đa | Điểm | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Git workflow | 5 | | |
| 2 | Dockerfile | 10 | | |
| 3 | Compose | 10 | | |
| 4 | CI/CD | 15 | | |
| 5 | Kubernetes | 15 | | |
| 6 | Config, storage, health | 10 | | |
| 7 | Troubleshooting | 10 | | |
| 8 | Security | 10 | | |
| 9 | Documentation | 5 | | |
| 10 | Demo và defense | 10 | | |
| | Tổng nhóm | 100 | | |

Xếp loại theo bảng trong [assessment.md](assessment.md).
