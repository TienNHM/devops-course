# Đáp án tuần 13 – Configuration, Resources & Health

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng để chấm và hướng dẫn. Học viên so kết quả và lập luận của mình với trang này, chỗ nào khác thì tự tìm hiểu vì sao khác, không chép câu chữ hay manifest vào bài nộp. Tên Pod, hash, thời gian và dung lượng trong output sẽ khác trên máy bạn; điều cần khớp là cơ chế và kết luận.
:::

> **Tóm tắt:** Đáp án các phần lab bắt buộc của buổi 25 và 26, lời giải thử thách L2 kèm manifest, hướng điều tra hai tình huống lỗi, hiểu lầm hay gặp và đáp án năm câu hỏi kiểm tra của bài tập tuần.

Bài liên quan: [Buổi 25](../../labs/week-13/session-25.md), [Buổi 26](../../labs/week-13/session-26.md), [Bài tập tuần 13](../../assignments/weekly/week-13.md). Cách chấm: [Hướng dẫn chấm tuần 13](../grading/week-13.md).

Mức kiểm chứng: thí nghiệm OOMKilled đã chạy lại bằng Docker với giới hạn bộ nhớ 64 MiB cho kết quả `OOMKilled=true`, exit code 137, log dừng sau khoảng 50 MiB. Các lệnh `kubectl` khác theo lab và hành vi chuẩn của Kubernetes.

## Buổi 25 – Configuration Management

### Đáp án các phần lab

1. Phần 1 – Namespace và ConfigMap `club-config`.
   - `kubectl apply -f source/k8s/namespace.yaml` rồi `kubectl apply -f source/k8s/configmap.yaml`.
   - Kiểm tra: `kubectl get configmap club-config -n club -o yaml` có bốn key `DB_HOST`, `DB_NAME`, `DB_PORT`, `DB_USER`, và `DB_PORT` nằm trong dấu nháy (`"5432"`).
   - Không có `DB_PASSWORD` ở đây: mật khẩu thuộc Secret.
2. Phần 2 – Secret tạo bằng lệnh.
   - `kubectl create secret generic club-secrets -n club --from-literal=db-password="$DB_PASS"` với `DB_PASS` đọc bằng `read -r -s`; nếu Secret đã có từ buổi 22 thì giữ nguyên.
   - Thư mục nộp không có file chứa mật khẩu thật. `git grep -n -i -E "stringData|kind: Secret"` chỉ được thấy `secret.example.yaml` với giá trị giả.
   - Giải mã: `kubectl get secret club-secrets -n club -o jsonpath='{.data.db-password}' | base64 -d; echo`. Câu giải thích mẫu: base64 chỉ là encoding, ai có quyền `get secret` (hoặc đọc được YAML bị dán lên chat, hoặc commit lên Git) giải mã được bằng một lệnh, nên Secret phải được bảo vệ bằng RBAC chứ không bằng base64.
3. Phần 3 – Hai Pod `club-api` `1/1 Running` và `/ready` trả `ready`.
   - `kubectl apply -f source/k8s/postgres.yaml`, chờ `rollout status statefulset/postgres`, rồi `kubectl apply -f source/k8s/backend.yaml`.
   - `kubectl port-forward -n club svc/backend 13000:3000` ở terminal thứ hai, rồi `curl -s localhost:13000/ready` ra `{"status":"ready"}`.
   - Vì sao `/ready` đủ làm bằng chứng: nó chạy `SELECT 1`, nên bốn biến trong ConfigMap lẫn mật khẩu trong Secret đều đúng.
4. Phần 4 – File mount đổi, biến môi trường không đổi (namespace `lab25`).
   - Tạo `app-settings` và Pod `config-demo` (env `LOG_LEVEL` cộng mount `/etc/club`).
   - `kubectl patch configmap app-settings -n lab25 --type merge -p '{"data":{"log-level":"debug"}}'`.
   - Ngay sau đó `printenv LOG_LEVEL` vẫn `info`; vòng lặp `cat /etc/club/log-level` chuyển sang `debug` sau khoảng 10 giây đến vài phút.
   - Xóa và tạo lại Pod thì `printenv LOG_LEVEL` mới ra `debug`.
5. Phần 5 – Chẩn đoán `DB_HOST` sai: xem mục dưới.

### Chẩn đoán `DB_HOST` sai

Cây điều tra:

1. `kubectl get pods -n club -l app=club-api`: có Pod mới `Running` nhưng `0/1`, hai Pod cũ vẫn `1/1`, RESTARTS bằng 0. Container sống, readiness đang fail, không phải lỗi image và không phải crash.
2. `kubectl describe pod TEN_POD_MOI -n club`: Events có `Readiness probe failed: HTTP probe failed with statuscode: 503`.
3. `kubectl logs`: chỉ có `API listening on port 3000`, vì handler `/ready` bắt lỗi và trả 503 mà không ghi log. Để thấy lỗi thật, gọi `kubectl exec -n club TEN_POD_MOI -- wget -qO- http://127.0.0.1:3000/api/members` (trả 500) rồi xem lại logs: `getaddrinfo ENOTFOUND` kèm tên host sai.
4. `kubectl exec -n club TEN_POD_MOI -- printenv DB_HOST` ra giá trị sai; `kubectl get configmap club-config -n club -o yaml` cho thấy chính lỗi gõ ở nguồn.

Nguyên nhân gốc: ConfigMap chứa tên Service không tồn tại nên Pod mới không phân giải được DNS, `SELECT 1` thất bại, `/ready` trả 503. Người dùng chưa thấy sự cố vì rolling update với 2 replicas không tắt Pod cũ khi Pod mới chưa Ready.

Sửa: patch `DB_HOST` về `postgres`, `kubectl rollout restart deployment/club-api -n club`, chờ `rollout status` báo `successfully rolled out`, rồi gọi lại `/ready`.

Chứng minh dịch vụ còn chạy trong lúc lỗi: `kubectl get pods` cho thấy hai Pod cũ `1/1`; `port-forward` tới Service và gọi `/api/members` vẫn trả dữ liệu, vì Endpoints chỉ chứa Pod cũ.

Mỗi học viên nên dùng giá trị sai khác nhau (ví dụ `postgres-db`, `pg`). Mọi giá trị không phải tên Service thật đều cho cùng triệu chứng `ENOTFOUND`, nên mentor kiểm tra tên trong evidence khớp với tên trong lệnh patch.

### Lời giải L2

Thử thách A – mount một file bằng `subPath`.

```bash
printf 'club.name=HCMUTE DSC\nfeature.members=true\n' > source/app.properties
kubectl create configmap app-config -n lab25 --from-file=app.properties=source/app.properties
```

Manifest Pod `config-demo2` ở mục "Manifest lời giải L2" bên dưới. Kiểm tra:

```bash
kubectl exec -n lab25 config-demo2 -- cat /etc/club/app.properties
kubectl patch configmap app-config -n lab25 --type merge -p '{"data":{"app.properties":"club.name=DSC\nfeature.members=false\n"}}'
kubectl exec -n lab25 config-demo2 -- cat /etc/club/app.properties
```

Lần đọc thứ hai vẫn ra nội dung cũ dù đã chờ vài phút.

Vì sao chọn `subPath`: mount thông thường thay cả thư mục đích bằng volume, nên các file khác trong `/etc/club` biến mất; `subPath` chỉ chèn đúng một file. Đổi lại, kubelet cập nhật volume bằng cách đổi symlink `..data` trong thư mục, còn mount `subPath` trỏ thẳng vào file thật nên bỏ qua cơ chế đó.

Cách tốt hơn nếu cần tự cập nhật: mount cả thư mục vào một đường dẫn riêng như `/etc/club/conf.d` rồi cho ứng dụng đọc từ đó, hoặc để ứng dụng đọc đường dẫn cấu hình qua biến môi trường. Ứng dụng vẫn phải tự đọc lại file.

Thử thách B – Secret dạng volume. Manifest dùng `volumes.secret` với `secretName: club-secrets` và `defaultMode: 0400`, mount tại `/etc/secrets`. Kiểm tra bằng `ls -lL /etc/secrets` (cờ `-L` theo symlink) thấy `-r--------`, và `cat /etc/secrets/db-password` đọc được.

Vì sao ưu tiên file hơn biến môi trường: `env` dễ lọt vào log hoặc crash dump khi ứng dụng in toàn bộ môi trường, được mọi tiến trình con kế thừa và đọc được qua `/proc/PID/environ`; file chỉ lộ cho tiến trình có quyền đọc. Hai biện pháp tốt hơn base64 (nêu ít nhất hai): RBAC chặt cho `get secrets`, encryption at rest cho etcd, Sealed Secrets hoặc External Secrets để không lưu giá trị thật trong Git. Nếu container chạy bằng user không phải root, file `0400` thuộc root không đọc được; khi đó dùng `securityContext.fsGroup` hoặc đặt `defaultMode` phù hợp.

Bài thêm `rollout restart`: sau khi `patch` `club-config` thêm `LOG_LEVEL=debug`, `printenv LOG_LEVEL` trong Pod cũ không in gì (exit code 1); sau `rollout restart` và `rollout status`, Pod mới in `debug`. Dọn bằng `kubectl patch configmap club-config -n club --type merge -p '{"data":{"LOG_LEVEL":null}}'` rồi `rollout restart` lần nữa.

Phá lỗi nâng cao – Pod tham chiếu Secret không tồn tại: tạo Pod busybox có `env` với `secretKeyRef` tên `khong-ton-tai`; `kubectl describe pod` cho trạng thái `CreateContainerConfigError` và Events `secret "khong-ton-tai" not found`. Tạo Secret đúng tên thì Pod tự khởi động.

### Hiểu lầm hay gặp

- "Secret là mã hóa nên an toàn": base64 chỉ là encoding; bảo vệ nằm ở RBAC, encryption at rest và việc không commit giá trị thật.
- "Sửa ConfigMap thì Pod tự dùng giá trị mới": đúng một phần. Biến môi trường chỉ chốt lúc container khởi động; file mount được đồng bộ nhưng `subPath` và `immutable` thì không, và ứng dụng còn phải tự đọc lại file.
- "Log sạch nghĩa là app khỏe": `/ready` của starter-project không ghi log khi lỗi, bằng chứng nằm ở Events và ở lời gọi `exec`.
- Tạo Secret bằng `echo` thay vì `echo -n` hoặc `--from-literal`, làm dính ký tự xuống dòng.
- Quên dấu nháy quanh `"5432"` trong ConfigMap nên `apply` báo lỗi kiểu `cannot unmarshal number`.
- PVC cũ của PostgreSQL còn mật khẩu cũ nên API báo `password authentication failed` dù Secret mới đúng.

## Buổi 26 – Resource & Health

### Đáp án các phần lab

1. Phần 1 – Đọc cấu hình: `describe` cho `Limits` cpu `500m`, memory `256Mi`; `Requests` cpu `100m`, memory `128Mi`; `QoS Class: Burstable`. `kubectl top` báo `Metrics API not available` trên kind là bình thường.
2. Phần 2 – `source/backend-deploy.yaml` có requests, limits, ba probe và `rollout status` thành công.
   - Khung chính (như lab): `requests` cpu 100m và memory 128Mi, `limits` cpu 500m và memory 256Mi; `startupProbe` và `livenessProbe` trỏ `/health` cổng 3000, `readinessProbe` trỏ `/ready` cổng 3000; `DB_PASSWORD` từ `secretKeyRef`, còn lại từ `envFrom` `club-config`.
   - `kubectl apply -f source/backend-deploy.yaml`, rồi `kubectl -n club rollout status deploy/club-api` báo `successfully rolled out`.
   - `kubectl -n club describe pod -l app=club-api | grep -E "Liveness|Readiness|Startup|QoS"` phải ra ba dòng probe và `QoS Class: Burstable`.
   - Học viên tự chọn con số: requests sát mức dùng thường, limits khoảng 1,5 đến 2 lần. Công thức startup tối đa là `failureThreshold x periodSeconds` (15 x 2 giây là 30 giây).
3. Phần 3 – `oom-demo`: Pod chạy `node -e` cấp phát 10 MiB mỗi 300 ms với limit 64Mi, `restartPolicy: Never`. Kết quả: `OOMKilled 137` từ `jsonpath` trên `terminated.reason` và `terminated.exitCode`; log chỉ có các dòng `allocated N MiB` rồi dừng, không có lỗi.
4. Phần 4 – Làm hỏng readiness: patch `path` thành đường dẫn sai, `get pods -w` thấy Pod mới `0/1 Running`; `describe pod` có `Readiness probe failed: HTTP probe failed with statuscode: 404`; khôi phục bằng `kubectl apply -f source/backend-deploy.yaml`. Nếu học viên làm cách khác như sai cổng thì mã là `connection refused`.
5. Câu hỏi probe: liveness fail làm kubelet restart container; readiness fail chỉ gỡ Pod khỏi Endpoints, không restart; startup fail cũng restart container sau khi vượt ngưỡng.

### Điều tra Pod `Running` nhưng `0/1` (tình huống 10)

1. `get pods`: `Running`, `0/1`, RESTARTS 0. Không restart nghĩa là không phải liveness hay crash.
2. `get endpoints backend` (hoặc `endpointslices`): không có IP của Pod mới. Nếu selector sai thì Pod có thể `1/1` mà Endpoints vẫn rỗng, nên bước này cũng giúp loại trừ selector.
3. `describe pod`: tìm `Readiness probe failed` và mã lỗi.
4. `exec wget -qO- http://127.0.0.1:3000/ready`: xem endpoint thật trả gì, so với `path` và `port` trong manifest.
5. Nếu 503: kiểm tra Postgres, Secret `club-secrets`, `DB_HOST`.

Bảng mã: 404 là sai path; 503 là app báo chưa sẵn sàng (thường do DB); `connection refused` là sai port hoặc app chưa lắng nghe. Nguyên nhân gốc của bài lab: path probe không khớp route của ứng dụng.

### Container chết không có log lỗi

`describe` mục `Last State` có `Reason: OOMKilled`, `Exit Code: 137` (128 cộng 9, tín hiệu SIGKILL). Process bị kernel giết từ bên ngoài nên không kịp ghi log. Xử lý: đo mức dùng thực, đặt limit có đệm, đặt requests sát mức dùng thường, theo dõi xu hướng để phát hiện leak thay vì chỉ tăng limit.

### Lời giải L2

Thử thách A – Guaranteed. Đặt requests bằng limits cho cả cpu và memory, ví dụ cả hai là `250m` và `256Mi`, rồi kiểm tra bằng `jsonpath` `{.status.qosClass}` ra `Guaranteed`. Pod đổi QoS cần tạo lại (rollout), nên kiểm tra trên Pod mới sau `rollout status`. Tốt cho Postgres vì ít bị đuổi nhất khi Node thiếu bộ nhớ. Tốn kém với dịch vụ nhỏ vì scheduler phải giữ chỗ đúng bằng limit, Node dùng kém hiệu quả. Nếu chỉ đặt limits mà bỏ requests, Kubernetes tự lấy requests bằng limits, cũng cho ra Guaranteed.

Thử thách B – liveness phụ thuộc DB. Khi DB mất, `/ready` trả 503, liveness fail, kubelet restart container; container mới vẫn không thấy DB nên tiếp tục fail. Với `periodSeconds: 10` và `failureThreshold: 3`, sau khoảng 30 giây kubelet restart container; RESTARTS tăng đều trên cả hai Pod, Events có `Liveness probe failed` và `will be restarted`, về sau có thể `CrashLoopBackOff`. Restart không sửa được DB, chỉ làm sự cố nặng hơn (mất trạng thái, log, thêm tải khi DB trở lại).

Thử thách C – startupProbe sai cổng. Patch cổng startup thành 3001 và `failureThreshold: 3` với `periodSeconds: 2`: sau khoảng 6 giây kubelet giết container (`failed startup probe, will be restarted`), Pod mới không bao giờ Ready, rollout treo, Pod cũ vẫn phục vụ.

Câu hỏi tình huống app khởi động 90 giây: dùng `startupProbe` với `failureThreshold x periodSeconds` lớn hơn 90 giây (ví dụ 30 x 5), còn liveness giữ chu kỳ ngắn vì nó chỉ bắt đầu sau khi startup thành công.

### Hiểu lầm hay gặp

- Nhầm `128M` với `128Mi`; đặt requests lớn hơn limits nên manifest bị từ chối.
- Cho rằng `limits` dùng để xếp Pod: scheduler chỉ nhìn `requests`.
- Cho rằng CPU vượt limit thì Pod bị giết: CPU chỉ bị throttle; memory vượt mới bị OOMKilled.
- Trỏ liveness vào `/ready` "cho chắc": gây restart dây chuyền khi DB sập.
- `kubectl top` báo `Metrics API not available` trên kind là bình thường, không phải lỗi bài làm.
- Tưởng `patch` thay thế được manifest: manifest trong Git mới là nguồn sự thật, `patch` chỉ để thử nghiệm.

## Manifest lời giải L2

Manifest Pod `config-demo2` (buổi 25, thử thách A, namespace `lab25`; tạo lại bằng `kubectl create namespace lab25` nếu đã xóa):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-demo2
  namespace: lab25
spec:
  containers:
    - name: demo
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: props
          mountPath: /etc/club/app.properties
          subPath: app.properties
          readOnly: true
  volumes:
    - name: props
      configMap:
        name: app-config
```

Pod `secret-demo` mount Secret với quyền `0400` (buổi 25, thử thách B, namespace `club`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-demo
  namespace: club
spec:
  containers:
    - name: demo
      image: busybox:1.36
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: creds
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: creds
      secret:
        secretName: club-secrets
        defaultMode: 0400
```

Secret mount được lưu trên tmpfs của node nên không ghi xuống đĩa. Dọn dẹp: `kubectl delete pod secret-demo -n club --ignore-not-found`.

Phần `resources` của Deployment để Pod thành Guaranteed (buổi 26, thử thách A, lưu thành `source/backend-guaranteed.yaml`):

```yaml
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 250m
              memory: 256Mi
```

```bash
kubectl apply -f source/backend-guaranteed.yaml
kubectl -n club get pods -l app=club-api -o jsonpath='{range .items[*]}{.status.qosClass}{"\n"}{end}'
kubectl apply -f source/backend-deploy.yaml
```

Lệnh thử thách B (liveness phụ thuộc DB):

```bash
kubectl -n club patch deploy club-api --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/livenessProbe/httpGet/path","value":"/ready"}]'
kubectl -n club rollout status deploy/club-api
kubectl -n club scale statefulset postgres --replicas=0
kubectl -n club get pods -l app=club-api -w
```

Khôi phục:

```bash
kubectl -n club scale statefulset postgres --replicas=1
kubectl apply -f source/backend-deploy.yaml
```

Lệnh thử thách C (startupProbe sai cổng):

```bash
kubectl -n club patch deploy club-api --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/startupProbe/httpGet/port","value":3001},{"op":"replace","path":"/spec/template/spec/containers/0/startupProbe/failureThreshold","value":3}]'
kubectl -n club describe pod -l app=club-api | grep -i "startup probe failed"
```

Sau 3 lần fail cách nhau 2 giây, kubelet giết container và restart (Events `Container api failed startup probe, will be restarted`). Khôi phục bằng `kubectl apply -f source/backend-deploy.yaml`.

## Bài tập tuần

Gợi ý lời giải theo từng nhiệm vụ (học viên dùng tên trong lab, giá trị sai tự chọn).

- Nhiệm vụ 1. ConfigMap `club-config` có bốn key, giá trị số trong nháy. Secret `club-secrets` tạo bằng `kubectl create secret generic`. Pod `config-demo` có `env` với `configMapKeyRef` và volume mount `/etc/club`. Kiểm tra: `ls /etc/club` ra các key, `printenv LOG_LEVEL` khớp ConfigMap, `describe secret` chỉ hiện số byte.
- Nhiệm vụ 2. Dự đoán đúng: biến môi trường giữ giá trị cũ, file mount đổi sau một khoảng thời gian (thường dưới vài phút, đo bằng vòng lặp 12 lần mỗi lần 10 giây). Tạo lại Pod thì biến mới đổi. Report nêu cơ chế: env chốt lúc khởi động; file do kubelet đồng bộ định kỳ qua symlink `..data`. Thời gian đo khác ví dụ trong lab không sai, miễn có số liệu thật.
- Nhiệm vụ 3. Như mục chẩn đoán `DB_HOST` sai, với giá trị sai khác. Cần đủ các bước theo thứ tự, chứng minh dịch vụ còn chạy khi Pod mới lỗi, và khôi phục có `rollout status` cùng `curl /ready`.
- Nhiệm vụ 4. QoS là `Burstable` khi requests nhỏ hơn limits. Liveness chỉ trỏ `/health` vì phụ thuộc ngoài không được khắc phục bằng restart; readiness trỏ `/ready` vì quyết định có nhận traffic hay không.
- Nhiệm vụ 5. Phần OOM: Pod `oom-demo` kết quả `OOMKilled` và 137, log dừng đột ngột (học viên có thể đổi lượng cấp phát mỗi lần). Phần readiness: đường dẫn sai tự chọn (ví dụ `/healthz-x`) cho mã 404. Sau khôi phục, Endpoints có đủ IP của hai Pod Ready và `oom-demo` đã xóa.

### Đáp án năm câu hỏi kiểm tra

1. Không. Base64 chỉ là encoding, ví dụ `kubectl get secret ... -o jsonpath='{.data.KEY}' | base64 -d`. Hai biện pháp tốt hơn: RBAC chặt cho `get secrets` và encryption at rest cho etcd; hoặc Sealed Secrets, External Secrets.
2. Hai nguyên nhân: ứng dụng nạp cấu hình qua `env` hoặc `envFrom` (cần `kubectl rollout restart`); ứng dụng dùng file mount nhưng mount có `subPath` hoặc ConfigMap `immutable`, hoặc ứng dụng chỉ đọc file một lần lúc khởi động (cần mount cả thư mục, hoặc restart, hoặc cho app đọc lại file).
3. `requests` dùng cho scheduler, `limits` do kubelet và kernel cưỡng chế. Vượt CPU limit thì bị throttle (chậm); vượt memory limit thì OOMKilled (exit 137).
4. Readiness fail: gỡ Pod khỏi Endpoints, không restart. Liveness fail: kubelet restart container. Liveness không kiểm tra DB vì restart không sửa được DB, chỉ gây restart dây chuyền.
5. `kubectl describe pod` xem `Last State`: `Reason: OOMKilled`, `Exit Code: 137`; log dừng đột ngột vì SIGKILL. Có thể thêm `get pod -o jsonpath` để lấy reason và exit code.
