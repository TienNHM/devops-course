# Walkthrough tuần 13 – Configuration, Resources & Health

> **Tóm tắt:** Hướng dẫn giải buổi 25 và 26: tách cấu hình bằng ConfigMap và Secret, hiểu khi nào Pod thấy giá trị mới, đặt requests, limits, ba loại probe, chẩn đoán OOMKilled và readiness fail, kèm hướng dẫn chấm.

## Cách dùng tài liệu này

Chỉ đọc sau khi bạn đã tự làm lab và bài tập tuần. Hãy đối chiếu: so kết quả và lập luận của bạn với phần dưới đây, chỗ nào khác thì tự tìm hiểu vì sao khác, đừng chép lại câu chữ hay manifest vào bài nộp. Tên Pod, hash, thời gian và dung lượng trong output sẽ khác máy bạn; điều cần khớp là cơ chế và kết luận.

Bài lab liên quan: [Buổi 25](../../labs/week-13/session-25.md), [Buổi 26](../../labs/week-13/session-26.md), [Bài tập tuần 13](../../assignments/weekly/week-13.md).

Ghi chú về kiểm chứng: thí nghiệm OOMKilled đã được chạy lại bằng Docker với giới hạn bộ nhớ 64 MiB và cho kết quả `OOMKilled=true`, exit code 137, log dừng sau khoảng 50 MiB. Các lệnh `kubectl` trong tài liệu này được lấy từ lab và đối chiếu với hành vi chuẩn của Kubernetes, chưa chạy lại trên cụm kind trong lần biên soạn.

### Buổi 25 – Configuration Management

#### Đáp án các nhiệm vụ L1

1. Namespace và ConfigMap `club-config`.
   - `kubectl apply -f source/k8s/namespace.yaml` rồi `kubectl apply -f source/k8s/configmap.yaml`.
   - Kiểm tra: `kubectl get cm -n club` thấy `club-config`; `kubectl get configmap club-config -n club -o yaml` có bốn key `DB_HOST`, `DB_NAME`, `DB_PORT`, `DB_USER`, và `DB_PORT` nằm trong dấu nháy (`"5432"`).
   - Không có `DB_PASSWORD` ở đây: mật khẩu thuộc Secret.
2. Secret tạo bằng lệnh.
   - `kubectl create secret generic club-secrets -n club --from-literal=db-password="$DB_PASS"` với `DB_PASS` đọc bằng `read -r -s`.
   - Thư mục nộp không được có file chứa mật khẩu thật. Kiểm tra: `git grep -n -i -E "stringData|kind: Secret"` chỉ được phép thấy `secret.example.yaml` với giá trị giả.
3. Hai Pod `club-api` `1/1 Running` và `/ready` trả `ready`.
   - `kubectl apply -f source/k8s/postgres.yaml`, chờ `rollout status statefulset/postgres`, rồi `kubectl apply -f source/k8s/backend.yaml`.
   - `kubectl port-forward -n club svc/backend 13000:3000` ở terminal thứ hai, rồi `curl -s localhost:13000/ready` ra `{"status":"ready"}`.
   - Vì sao `/ready` đủ làm bằng chứng: nó chạy `SELECT 1`, nên bốn biến trong ConfigMap lẫn mật khẩu trong Secret đều đúng.
4. Giải mã `db-password` và nêu mức nguy hiểm.
   - Lệnh: `kubectl get secret club-secrets -n club -o jsonpath='{.data.db-password}' | base64 -d; echo`.
   - Câu giải thích mẫu: base64 chỉ là encoding, ai có quyền `get secret` (hoặc đọc được YAML bị dán lên chat, hoặc commit lên Git) giải mã được bằng một lệnh, nên Secret phải được bảo vệ bằng RBAC chứ không bằng base64.
5. File mount đổi, biến môi trường không đổi.
   - Tạo `app-settings`, Pod `config-demo` (env `LOG_LEVEL` + mount `/etc/club`).
   - `kubectl patch configmap app-settings -n club --type merge -p '{"data":{"log-level":"debug"}}'`.
   - Ngay sau đó `printenv LOG_LEVEL` vẫn `info`; vòng lặp `cat /etc/club/log-level` chuyển sang `debug` sau khoảng 10 giây đến vài phút.
   - Tạo lại Pod thì `printenv LOG_LEVEL` mới ra `debug`.

#### Lời giải L2

Thử thách A – mount một file bằng `subPath`.

Cách tiếp cận: tạo ConfigMap từ file, rồi mount một key vào một đường dẫn file cụ thể.

```bash
printf 'club.name=HCMUTE DSC\nfeature.members=true\n' > source/app.properties
kubectl create configmap app-config -n club --from-file=app.properties=source/app.properties
```

Manifest `config-demo2` dùng `volumeMounts` với `mountPath: /etc/club/app.properties` và `subPath: app.properties` (đúng như lời giải trong lab). Kiểm tra:

```bash
kubectl exec -n club config-demo2 -- cat /etc/club/app.properties
kubectl patch configmap app-config -n club --type merge -p '{"data":{"app.properties":"club.name=DSC\nfeature.members=false\n"}}'
kubectl exec -n club config-demo2 -- cat /etc/club/app.properties
```

Lần đọc thứ hai vẫn ra nội dung cũ dù đã chờ vài phút.

Vì sao chọn `subPath`: mount thông thường thay cả thư mục đích bằng volume, nên các file khác trong `/etc/club` biến mất. `subPath` chỉ chèn đúng một file. Đổi lại, kubelet cập nhật volume bằng cách đổi symlink `..data` trong thư mục; mount `subPath` trỏ thẳng vào file thật nên bỏ qua cơ chế đó.

Cách khác (tốt hơn nếu cần tự cập nhật): mount cả thư mục vào một đường dẫn riêng như `/etc/club/conf.d` rồi cho ứng dụng đọc từ đó, hoặc để ứng dụng đọc đường dẫn cấu hình qua biến môi trường. Lưu ý ứng dụng vẫn phải tự đọc lại file.

Thử thách B – Secret dạng volume.

Manifest dùng `volumes.secret` với `secretName: club-secrets` và `defaultMode: 0400`, mount tại `/etc/secrets`. Kiểm tra bằng `ls -lL /etc/secrets` (cờ `-L` theo symlink) thấy `-r--------`, và `cat /etc/secrets/db-password` đọc được.

Vì sao ưu tiên file hơn biến môi trường: `env` dễ lọt vào log hoặc crash dump khi ứng dụng in toàn bộ môi trường, được mọi tiến trình con kế thừa và đọc được qua `/proc/PID/environ`. File chỉ lộ cho tiến trình có quyền đọc. Hai biện pháp tốt hơn base64 (nêu ít nhất hai): RBAC chặt cho `get secrets`, encryption at rest cho etcd, Sealed Secrets hoặc External Secrets để không lưu giá trị thật trong Git.

Cách khác cần biết: nếu container chạy bằng user không phải root, file `0400` thuộc root không đọc được, khi đó dùng `securityContext.fsGroup` hoặc đặt `defaultMode` phù hợp.

#### Lời giải phần Phá lỗi và debug: DB_HOST sai

Cây điều tra:

1. `kubectl get pods -n club -l app=club-api`: có Pod mới `Running` nhưng `0/1`, hai Pod cũ vẫn `1/1`, RESTARTS bằng 0. Container sống, readiness đang fail, không phải lỗi image và không phải crash.
2. `kubectl describe pod TEN_POD_MOI -n club`: Events có `Readiness probe failed: HTTP probe failed with statuscode: 503`.
3. `kubectl logs`: chỉ có `API listening on port 3000`, vì handler `/ready` bắt lỗi và trả 503 mà không ghi log. Để thấy lỗi thật, gọi `kubectl exec -n club TEN_POD_MOI -- wget -qO- http://127.0.0.1:3000/api/members` (trả 500) rồi xem lại logs: `getaddrinfo ENOTFOUND` kèm tên host sai.
4. `kubectl exec -n club TEN_POD_MOI -- printenv DB_HOST` ra giá trị sai; `kubectl get configmap club-config -n club -o yaml` cho thấy chính lỗi gõ ở nguồn.

Nguyên nhân gốc: ConfigMap chứa tên Service không tồn tại nên Pod mới không phân giải được DNS, `SELECT 1` thất bại, `/ready` trả 503. Người dùng chưa thấy sự cố vì rolling update với 2 replicas không tắt Pod cũ khi Pod mới chưa Ready.

Sửa: patch `DB_HOST` về `postgres`, `kubectl rollout restart deployment/club-api -n club`, chờ `rollout status` báo `successfully rolled out`, rồi gọi lại `/ready`.

Chứng minh dịch vụ còn chạy trong lúc lỗi: `kubectl get pods` cho thấy 2 Pod cũ `1/1`; `port-forward` tới Service và gọi `/api/members` vẫn trả dữ liệu, vì Endpoints chỉ chứa Pod cũ.

Với bài tập, mỗi bạn dùng giá trị sai khác nhau (ví dụ `postgres-db`, `pg`). Mọi giá trị không phải tên Service thật đều cho cùng triệu chứng `ENOTFOUND`, nên mentor kiểm tra tên trong evidence khớp với tên trong lệnh patch.

#### Những hiểu lầm hay gặp

- "Secret là mã hóa nên an toàn": base64 chỉ là encoding; bảo vệ nằm ở RBAC, encryption at rest và việc không commit giá trị thật.
- "Sửa ConfigMap thì Pod tự dùng giá trị mới": đúng một phần. Biến môi trường chỉ chốt lúc container khởi động; file mount được đồng bộ nhưng `subPath` và `immutable` thì không, và ứng dụng còn phải tự đọc lại file.
- "Log sạch nghĩa là app khỏe": `/ready` của starter-project không ghi log khi lỗi, bằng chứng nằm ở Events và ở lời gọi `exec`.
- Tạo Secret bằng `echo` thay vì `echo -n` hoặc `--from-literal`, làm dính ký tự xuống dòng.
- Quên dấu nháy quanh `"5432"` trong ConfigMap nên `apply` báo lỗi kiểu `cannot unmarshal number`.
- PVC cũ của PostgreSQL còn mật khẩu cũ nên API báo `password authentication failed` dù Secret mới đúng.

### Buổi 26 – Resource & Health

#### Đáp án các nhiệm vụ L1

1. `source/backend-deploy.yaml` có requests, limits, ba probe và `rollout status` thành công.
   - Khung chính (giữ nguyên cấu trúc của lab): `requests` cpu 100m và memory 128Mi, `limits` cpu 500m và memory 256Mi; `startupProbe` và `livenessProbe` trỏ `/health` cổng 3000, `readinessProbe` trỏ `/ready` cổng 3000; `DB_PASSWORD` từ `secretKeyRef`, còn lại từ `envFrom` `club-config`.
   - `kubectl apply -f source/backend-deploy.yaml`, rồi `kubectl -n club rollout status deploy/club-api` báo `successfully rolled out`.
2. Chụp `describe`: `kubectl -n club describe pod -l app=club-api | grep -E "Liveness|Readiness|Startup|QoS"` phải ra ba dòng probe và `QoS Class: Burstable`.
3. `oom-demo`: apply Pod chạy `node -e` cấp phát 10 MiB mỗi 300 ms với limit 64Mi, `restartPolicy: Never`. Kết quả: `OOMKilled 137` từ `jsonpath` trên `terminated.reason` và `terminated.exitCode`; log chỉ có các dòng `allocated N MiB` rồi dừng, không có lỗi.
4. Làm hỏng readiness: patch `path` thành đường dẫn sai, `get pods -w` thấy Pod mới `0/1 Running`; `describe pod` có `Readiness probe failed: HTTP probe failed with statuscode: 404`; khôi phục bằng `kubectl apply -f source/backend-deploy.yaml`.
5. Câu trả lời mẫu: liveness fail làm kubelet restart container; readiness fail chỉ gỡ Pod khỏi Endpoints, không restart; startup fail cũng restart container sau khi vượt ngưỡng.

#### Lời giải L2

Thử thách A – Guaranteed. Đặt requests bằng limits cho cả cpu và memory, ví dụ cả hai là `250m` và `256Mi`, rồi kiểm tra bằng `jsonpath` `{.status.qosClass}` ra `Guaranteed`. Lưu ý: Pod đổi QoS cần tạo lại Pod (rollout), nên kiểm tra trên Pod mới sau `rollout status`. Vì sao tốt cho Postgres: ít bị đuổi nhất khi Node thiếu bộ nhớ. Vì sao tốn kém với dịch vụ nhỏ: scheduler phải giữ chỗ đúng bằng limit, Node dùng kém hiệu quả.

Thử thách B – liveness phụ thuộc DB. Patch `livenessProbe.httpGet.path` thành `/ready`, rồi `scale statefulset postgres --replicas=0`. Với `periodSeconds: 10` và `failureThreshold: 3`, sau khoảng 30 giây kubelet restart container; RESTARTS tăng trên cả hai Pod, events có `Liveness probe failed` và `will be restarted`, về sau có thể `CrashLoopBackOff`. Restart không sửa được DB, chỉ làm sự cố nặng hơn (mất trạng thái, thêm tải khi DB trở lại). Khôi phục: scale Postgres về 1 và `apply` lại `backend-deploy.yaml`.

Thử thách C – startupProbe sai cổng. Patch cổng startup thành 3001 và `failureThreshold: 3` với `periodSeconds: 2`: sau khoảng 6 giây kubelet giết container (`failed startup probe, will be restarted`), Pod mới không bao giờ Ready, rollout treo, Pod cũ vẫn phục vụ. Công thức thời gian startup tối đa: `failureThreshold x periodSeconds`.

#### Lời giải phần Phá lỗi và debug

Tình huống Pod `Running` nhưng `0/1`:

1. `get pods`: `Running`, `0/1`, RESTARTS 0. Không restart nghĩa là không phải liveness hay crash.
2. `get endpoints backend` (hoặc `endpointslices`): không có IP của Pod mới. Nếu selector sai thì Pod có thể `1/1` mà Endpoints vẫn rỗng, nên bước này cũng giúp loại trừ selector.
3. `describe pod`: tìm `Readiness probe failed` và mã lỗi.
4. `exec wget -qO- http://127.0.0.1:3000/ready`: xem endpoint thật trả gì, so với `path` và `port` trong manifest.
5. Nếu 503: kiểm tra Postgres, Secret `club-secrets`, `DB_HOST`.

Bảng mã: 404 là sai path; 503 là app báo chưa sẵn sàng (thường do DB); `connection refused` là sai port hoặc app chưa lắng nghe. Nguyên nhân gốc của bài lab: path probe không khớp route của ứng dụng.

Tình huống container chết không có log lỗi: `describe` mục `Last State` có `Reason: OOMKilled`, `Exit Code: 137` (128 cộng 9, tín hiệu SIGKILL). Process bị kernel giết từ bên ngoài nên không kịp ghi log. Xử lý: đo mức dùng thực, đặt limit có đệm, đặt requests sát mức dùng thường, theo dõi xu hướng để phát hiện leak thay vì chỉ tăng limit.

#### Những hiểu lầm hay gặp

- Nhầm `128M` với `128Mi`; đặt requests lớn hơn limits nên manifest bị từ chối.
- Cho rằng `limits` dùng để xếp Pod: scheduler chỉ nhìn `requests`.
- Cho rằng CPU vượt limit thì Pod bị giết: CPU chỉ bị throttle; memory vượt mới bị OOMKilled.
- Trỏ liveness vào `/ready` "cho chắc": gây restart dây chuyền khi DB sập.
- `kubectl top` báo `Metrics API not available` trên kind là bình thường, không phải lỗi bài làm.
- Tưởng rằng `patch` thay thế được manifest: manifest trong Git mới là nguồn sự thật, `patch` chỉ để thử nghiệm.

### Bài tập tuần

Gợi ý lời giải theo nhiệm vụ (dùng tên riêng theo quy ước của bài, giá trị tự chọn).

Nhiệm vụ 1. ConfigMap `hw13-settings` có ba key `CLUB_NAME`, `LOG_LEVEL`, `FEATURE_MEMBERS`; giá trị `"true"` phải có nháy để luôn là chuỗi. Secret tạo bằng `kubectl create secret generic hw13-credentials -n club --from-literal=api-token=...` với chuỗi tạm. Pod `hw13-config-check` (busybox:1.36) có `env` với `configMapKeyRef` cho `LOG_LEVEL`, `env` với `secretKeyRef` cho `api-token`, và `volumes.configMap` mount tại `/etc/hw13`. Kiểm tra: `ls /etc/hw13` ra ba key, `printenv LOG_LEVEL` khớp ConfigMap, `describe secret` chỉ hiện số byte.

Nhiệm vụ 2. Dự đoán đúng: biến môi trường giữ giá trị cũ, file mount đổi sau một khoảng thời gian (thường dưới vài phút, đo bằng vòng lặp 12 lần mỗi lần 10 giây). Tạo lại Pod thì biến mới đổi. Report cần nêu cơ chế: env chốt lúc khởi động; file do kubelet đồng bộ định kỳ qua symlink `..data`. Nếu bài của học viên đo ra thời gian khác ví dụ trong lab thì không sai, miễn có số liệu thật.

Nhiệm vụ 3. Như phần Phá lỗi buổi 25, với giá trị sai khác. Điểm cần kiểm tra là đủ bốn bước theo đúng thứ tự, chứng minh dịch vụ còn chạy khi Pod mới lỗi, và khôi phục có `rollout status` cùng `curl /ready`.

Nhiệm vụ 4. Chọn con số hợp lý, ví dụ requests nhỏ sát mức dùng thường và limits khoảng 1,5 đến 2 lần. QoS là `Burstable` khi requests nhỏ hơn limits. Công thức startup tối đa: `failureThreshold x periodSeconds` (ví dụ 15 x 2 giây là 30 giây). Liveness chỉ trỏ `/health` vì phụ thuộc ngoài không được khắc phục bằng restart; readiness trỏ `/ready` vì quyết định có nhận traffic hay không.

Nhiệm vụ 5. Phần A: Pod `oom-hw13` với lệnh tự viết (có thể khác lab, ví dụ cấp phát 5 MiB mỗi lần) và limit tự chọn; kết quả `OOMKilled` và 137; log dừng đột ngột. Phần B: dùng path sai tự chọn (ví dụ `/healthz-x`) cho mã 404; nếu học viên làm cách khác như sai cổng thì mã là `connection refused`. Sau khôi phục, Endpoints có đủ IP của hai Pod Ready và `oom-hw13` đã xóa.

Đáp án 5 câu hỏi kiểm tra:

1. Không. Base64 chỉ là encoding, ví dụ `kubectl get secret ... -o jsonpath='{.data.KEY}' | base64 -d`. Hai biện pháp tốt hơn: RBAC chặt cho `get secrets` và encryption at rest cho etcd; hoặc Sealed Secrets, External Secrets.
2. Hai nguyên nhân: ứng dụng nạp cấu hình qua `env`/`envFrom` (cần `kubectl rollout restart`); ứng dụng dùng file mount nhưng mount có `subPath` hoặc ConfigMap `immutable`, hoặc ứng dụng chỉ đọc file một lần lúc khởi động (cần mount cả thư mục, hoặc restart, hoặc cho app đọc lại file).
3. `requests` dùng cho scheduler, `limits` do kubelet và kernel cưỡng chế. Vượt CPU limit thì bị throttle (chậm); vượt memory limit thì OOMKilled (exit 137).
4. Readiness fail: gỡ Pod khỏi Endpoints, không restart. Liveness fail: kubelet restart container. Liveness không kiểm tra DB vì restart không sửa được DB, chỉ gây restart dây chuyền.
5. `kubectl describe pod` xem `Last State`: `Reason: OOMKilled`, `Exit Code: 137`; log dừng đột ngột vì SIGKILL. Có thể thêm `get pod -o jsonpath` để lấy reason và exit code.

### Hướng dẫn chấm cho mentor

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: ConfigMap, Secret, Pod (16 điểm) | `get configmap -o yaml` có 3 key với giá trị chuỗi; `describe secret` chỉ hiện byte; `ls /etc/hw13`; `printenv`; `git ls-files` sạch | Dùng nguyên tên `club-config` hay `app-settings` của lab thay vì tên `hw13-*`; Secret nằm trong file YAML; giá trị giống hệt lab | Tại sao `describe secret` không hiện giá trị mà `get -o yaml` vẫn lộ? Nếu cần commit manifest Secret lên Git, em làm cách nào? |
| Nhiệm vụ 2: hành vi cập nhật (14 điểm) | `printenv` giá trị cũ ngay sau patch; vòng lặp 12 lần có thời điểm file đổi; `printenv` mới sau khi tạo lại Pod; dự đoán viết trước | Dự đoán viết sau (giống hệt kết quả, không có nhầm lẫn nào); thời gian đo đúng bằng số trong lab; thiếu vòng lặp | Vì sao file đổi mà biến không đổi? Nếu Pod dùng `subPath` thì kết quả khác ra sao? |
| Nhiệm vụ 3: chẩn đoán DB_HOST (16 điểm) | `get pods` có Pod `0/1` cùng Pod cũ `1/1`; Events `Readiness probe failed`; `ENOTFOUND` kèm tên sai; `printenv DB_HOST`; `rollout status` và `/ready` sau khôi phục | Dùng đúng giá trị `postgress` của lab; thiếu bước `logs`/`exec`; kết luận "sai host" không kèm Events | Vì sao log sạch mà Pod vẫn hỏng? Vì sao người dùng chưa thấy lỗi? Nếu không có readiness probe thì chuyện gì xảy ra? |
| Nhiệm vụ 4: requests, limits, probe (18 điểm) | `backend-deploy.yaml` tự viết, đủ ba probe đúng endpoint; `describe` có ba dòng probe và `QoS Class`; `jsonpath` qosClass; `rollout status` 2/2 | Con số trùng hệt lab mà không giải thích được; liveness trỏ `/ready`; dùng `M` thay `Mi` | Vì sao em chọn các con số này? Startup tối đa bao nhiêu giây, tính thế nào? Muốn Guaranteed phải đổi gì? |
| Nhiệm vụ 5: OOMKilled và readiness fail (16 điểm) | `OOMKilled` và 137; logs dừng đột ngột; Pod mới `0/1` RESTARTS 0; Events kèm mã HTTP; `get endpoints` không có IP Pod mới; sau khôi phục đủ hai IP; `oom-hw13` đã xóa | Dùng nguyên đường dẫn `/readyy` và lệnh cấp phát của lab; mã HTTP không khớp lỗi đã gây; thiếu bước khôi phục | Vì sao exit code là 137? 404, 503 và connection refused khác nhau ở điểm nào? Vì sao Endpoints vẫn có IP Pod cũ? |
| Report và 5 câu hỏi (10 điểm) | `report.md` có đủ 5 câu ngắn, có lý do | Câu trả lời chung chung, sao chép câu chữ của lab, nhầm requests với limits | Phân biệt readiness và liveness bằng ví dụ DB sập. |
| An toàn dữ liệu (5 điểm) | `git grep -n -i -E "stringData|kind: Secret"` không thấy giá trị thật | Mật khẩu thật trong `command-output.txt` sau bước `base64 -d` chưa che | Nếu lỡ commit Secret lên GitHub công khai thì làm gì ngay? |
| Quy trình nộp (5 điểm) | PR đúng cấu trúc, có review với ít nhất hai nhận xét cụ thể | PR không có review hoặc review chung chung | Reviewer đã chạy thử manifest nào? |
| L2 (tối đa 10 điểm) | Thử thách 1: số liệu thời gian của cả hai Pod, Pod dùng `subPath` không đổi sau 3 phút. Thử thách 2: RESTARTS tăng trên cả hai Pod, events `will be restarted`. Thử thách 3: output `Guaranteed` | Output L2 không có manifest tương ứng trong `source/`; giải thích thứ tự evict sai | Thứ tự bị đuổi giữa BestEffort, Burstable, Guaranteed? Vì sao thiết kế liveness phụ thuộc DB làm sự cố nặng hơn? |

Lưu ý khi chấm: kiểm tra output do lệnh thật tạo ra (tên Pod, hash, thời gian khác nhau giữa các bạn). Hai bài có tên Pod và timestamp trùng nhau là dấu hiệu chép.
