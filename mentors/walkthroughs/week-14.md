# Đáp án tuần 14 – Storage, Ingress & Operations

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng để chấm và hướng dẫn. Học viên so kết quả và lập luận của mình với trang này, không chép lệnh hay câu chữ vào bài nộp. Tên Pod, hash ReplicaSet, tên PV và thời gian trong output sẽ khác trên máy bạn; điều cần khớp là cơ chế và kết luận.
:::

> **Tóm tắt:** Đáp án các phần lab bắt buộc của buổi 27 và 28, lời giải thử thách L2 kèm lệnh và manifest, hướng điều tra các tình huống lỗi, hiểu lầm hay gặp và đáp án năm câu hỏi kiểm tra của bài tập tuần.

Bài liên quan: [Buổi 27](../../labs/week-14/session-27.md), [Buổi 28](../../labs/week-14/session-28.md), [Bài tập tuần 14](../../assignments/weekly/week-14.md). Cách chấm: [Hướng dẫn chấm tuần 14](../grading/week-14.md). Đáp án các tình huống 07, 08, 09 nằm ở [Kịch bản buổi 28](../sessions/session-28.md).

Các chi tiết phụ thuộc phiên bản (câu chữ lỗi kéo image, đánh số lại revision sau `undo`, tên container node khi chạy `crictl`) nên được kiểm tra lại trên cụm của bạn.

## Buổi 27 – Storage & Ingress

### Đáp án các phần lab

1. Chuẩn bị – cluster `club` có port mapping.
   - `kubectl get nodes` báo `club-control-plane Ready`; `docker ps --filter name=club-control-plane --format '{{.Ports}}'` có `0.0.0.0:80->80/tcp`.
   - Chỉ khi thiếu dòng đó mới `kind delete cluster --name club` rồi `kind create cluster --name club --config k8s/kind-config.yaml`. Nạp image: `kind load docker-image club-api:1.0.0 --name club` và tương tự cho `club-web`.
2. Phần 1 – làm sạch namespace và PVC `Pending`.
   - `kubectl delete namespace club --ignore-not-found`, chờ xóa xong, `kubectl apply -f k8s/namespace.yaml`, nạp hai image vào kind.
   - Tạo `demo-pvc` 100Mi: `kubectl get pvc -n club demo-pvc` ra `Pending`; `kubectl describe pvc demo-pvc -n club` có Events `waiting for first consumer`.
   - Lý do Pending hợp lệ: StorageClass `standard` có `WaitForFirstConsumer`, nên PV chỉ được tạo khi có Pod được xếp lịch dùng PVC.
3. Phần 2 – Postgres với PVC.
   - `kubectl apply -f k8s/configmap.yaml`, tạo Secret bằng `kubectl create secret generic club-secrets -n club --from-literal=db-password=...`, rồi `kubectl apply -f k8s/postgres.yaml`.
   - `kubectl get pvc -n club` chuyển `Bound`. `kubectl get pv` có PV với `CLAIM` là `club/postgres-pvc`, `RECLAIM POLICY` là `Delete`, StorageClass `standard`.
   - Khởi tạo dữ liệu: `kubectl exec -i -n club postgres-0 -- psql -U club -d clubdb < database/init.sql`, rồi `INSERT INTO members (name, email) VALUES (...)` với email chứa MSSV hoặc username GitHub. `SELECT id, name, email FROM members;` ra ba dòng.
4. Phần 3 – dữ liệu còn sau khi xóa Pod.
   - `SELECT count(*) FROM members;` ra 3, `kubectl delete pod postgres-0 -n club`, chờ Pod tạo lại cùng tên, chạy lại truy vấn: vẫn 3 và còn dòng email riêng.
   - Lý do: Pod mới mount lại cùng PVC. `PGDATA` trỏ thư mục con `pgdata` để tránh lỗi khi thư mục mount không rỗng.
5. Phần 4 – backend và frontend: `kubectl apply -f k8s/backend.yaml`, `k8s/frontend.yaml`, `rollout status` cho cả hai. Bốn Pod `1/1 Running`. Kiểm tra backend riêng bằng port-forward cổng 3001: `/ready` ra `{"status":"ready"}` và `/api/members` ra ba thành viên.
6. Phần 5 – Ingress.
   - Cài ingress-nginx bằng URL ghim tag `controller-v1.12.1` rồi `kubectl wait` controller Ready; `kubectl apply -f k8s/ingress.yaml`.
   - `curl -s -H "Host: club.localhost" http://127.0.0.1/api/members` trả JSON (có dòng email riêng); `curl` tới `/` với Host đúng trả `200`; `curl http://127.0.0.1/api/members` không có Host đúng trả `404`.
   - `kubectl describe ingress club -n club` có hai path: `/api` tới `backend:3000` và `/` tới `club-web:80`.
   - Path thắng: request `/api/members` khớp cả `/api` (Prefix) và `/`; rule có path dài hơn được ưu tiên nên đi tới `backend`. Đổi thứ tự khai báo không đổi kết quả.
   - 404 khi thiếu Host vì ingress-nginx chọn luật theo header Host; không có luật cho host `127.0.0.1` nên rơi vào backend mặc định của controller.

### Lời giải L2

Thử thách 1 – vòng đời PV và PVC. Bảng ba dòng:

| Hành động | Dự đoán đúng | Kết quả thực tế |
| --- | --- | --- |
| Xóa StatefulSet `postgres`, giữ PVC | PVC và PV vẫn `Bound`, dữ liệu còn | Apply lại `postgres.yaml`, `count` vẫn như cũ |
| Xóa PVC (policy `Delete`) | PV bị xóa theo, dữ liệu mất | `kubectl get pv` không còn PV; apply lại thì database rỗng, không có bảng `members`, phải chạy lại `init.sql` |
| Xóa PVC sau khi đặt PV về `Retain` | PV còn, trạng thái `Released`, dữ liệu giữ lại | `kubectl get pv` ra `Released` |

Lệnh cho hành động 1 và 2:

```bash
kubectl get pv
kubectl delete statefulset postgres -n club
kubectl get pvc -n club                 # vẫn Bound
kubectl apply -f k8s/postgres.yaml
kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"   # còn dữ liệu

kubectl delete statefulset postgres -n club
kubectl delete pvc postgres-pvc -n club
kubectl get pv                          # PV biến mất vì reclaimPolicy Delete
kubectl apply -f k8s/postgres.yaml      # tạo lại PVC mới, database rỗng
kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "\dt"   # không có bảng members
```

Kết luận: xóa PVC với reclaimPolicy `Delete` làm mất dữ liệu vĩnh viễn; phải chạy lại `init.sql`.

Lệnh cho hành động 3 (lấy tên PV từ PVC trước khi xóa):

```bash
PV=$(kubectl get pvc postgres-pvc -n club -o jsonpath='{.spec.volumeName}')
kubectl patch pv "$PV" -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
kubectl delete statefulset postgres -n club
kubectl delete pvc postgres-pvc -n club
kubectl get pv     # STATUS: Released
```

Vì sao xóa PVC khi Pod còn dùng thì PVC treo ở `Terminating`: finalizer `kubernetes.io/pvc-protection` chặn xóa PVC đang được Pod sử dụng. Phải xóa Pod hoặc StatefulSet trước.

Vì sao PV `Released` chưa bind cho PVC mới: PV còn `spec.claimRef` trỏ tới PVC cũ (đã bị xóa), và dữ liệu cũ chưa được dọn. Kubernetes không tự gán lại vì sợ lộ dữ liệu của người dùng trước. Admin phục hồi bằng cách xóa `claimRef` để PV về `Available`:

```bash
kubectl patch pv "$PV" --type=json -p='[{"op":"remove","path":"/spec/claimRef"}]'
```

rồi tạo PVC khớp StorageClass và dung lượng, hoặc đặt `volumeName` trong PVC. Với local-path, dữ liệu nằm trên node nên phải dọn thủ công khi không cần nữa. Cách khác: dùng `volumeBindingMode: Immediate` và PV tạo tay, hoặc sao lưu bằng `pg_dump` trước khi xóa; bản dump là cách phục hồi tốt hơn dựa vào `Retain`.

Thử thách 3 – host thứ hai. File `~/devops-labs/lab-27/source/ingress-api.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: club-api-host
  namespace: club
spec:
  ingressClassName: nginx
  rules:
    - host: api.club.localhost
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 3000
```

```bash
kubectl apply -f ~/devops-labs/lab-27/source/ingress-api.yaml
curl -s -H "Host: api.club.localhost" http://127.0.0.1/api/members
curl -s -H "Host: club.localhost" http://127.0.0.1/api/members
kubectl describe ingress -n club
```

Ingress cũ `club` vẫn giữ nguyên nên `club.localhost` vẫn hoạt động. Hai Ingress cùng class `nginx` dùng chung một controller.

### Điều tra các lỗi của buổi 27

Tình huống A – PVC Pending mãi (`storageClassName: fast-ssd`):

1. `kubectl describe pvc broken-pvc -n club`: Events có `storageclass.storage.k8s.io "fast-ssd" not found`.
2. `kubectl get storageclass`: chỉ có `standard`.
3. Phân biệt với Pending bình thường: ở đó Events nói `waiting for first consumer` và PVC dùng đúng StorageClass.

Nguyên nhân gốc: tên StorageClass sai nên không có provisioner nào xử lý PVC. Sửa: xóa PVC và tạo lại với `standard` hoặc bỏ `storageClassName`; không sửa tại chỗ được vì trường này không đổi sau khi tạo.

Tình huống B – Ingress 404 hoặc 503:

- Thiếu header Host: `404` từ nginx vì không có luật cho host `127.0.0.1`. Kiểm tra: gọi lại với `-H "Host: club.localhost"`.
- Sửa tên Service trong Ingress thành `backendd`: `503`. Điều tra: `kubectl describe ingress club -n club` thấy phần Backends có `backendd:3000` kèm lỗi không có endpoints; `kubectl get svc,endpoints -n club` không có Service tên đó; log controller xác nhận. Khôi phục: `kubectl apply -f k8s/ingress.yaml`.
- Nguyên nhân gốc: Ingress tham chiếu Service không tồn tại hoặc Service không có Pod Ready.

Tình huống C – thiếu port mapping: `curl 127.0.0.1` báo `Connection refused` dù controller chạy. `docker ps` cột PORTS của container `club-control-plane` không có `0.0.0.0:80->80/tcp`. Port mapping chỉ đặt được lúc tạo cluster nên phải xóa và tạo lại với `--config k8s/kind-config.yaml`. Chẩn đoán theo lớp (từ ngoài vào trong): cổng host, controller, Ingress, Service và Endpoints, Pod, PVC.

### Hiểu lầm hay gặp

- "PVC Pending là lỗi": với `WaitForFirstConsumer` đó là trạng thái bình thường cho tới khi có Pod dùng PVC.
- "Xóa Pod hoặc StatefulSet thì mất dữ liệu": không; chỉ xóa PVC (với policy `Delete`) mới mất.
- "Cài Ingress là xong": Ingress chỉ là khai báo; thiếu controller thì không có gì xảy ra.
- Gọi `curl` tới `127.0.0.1` không kèm Host rồi kết luận Ingress hỏng.
- Quên chạy `init.sql` sau khi tạo lại database nên `/api/members` trả 500.
- Quên `kind load docker-image` vào đúng cluster `club` nên Pod `ImagePullBackOff` hoặc `ErrImageNeverPull`.
- Port 80 của máy đang bị chương trình khác chiếm nên kind không map được.

## Buổi 28 – Kubernetes Operations

### Đáp án các phần lab

1. Phần 1 – Triển khai và history.
   - `kubectl create namespace ops-lab`, đặt namespace mặc định cho context, `kubectl apply -f source/web.yaml`, `rollout status deployment/web`.
   - `kubectl annotate deployment/web kubernetes.io/change-cause="deploy nginx 1.26" --overwrite`, rồi `kubectl rollout history deployment/web` ra revision 1 có nội dung.
2. Phần 2 – Nâng cấp và scale.
   - `kubectl set image deployment/web nginx=nginx:1.27` rồi annotate `upgrade nginx 1.27`; history có 2 revision.
   - `kubectl scale deployment/web --replicas=5` rồi về 3, `rollout history` không thêm revision vì chỉ `spec.template` thay đổi mới tạo revision. `kubectl get rs` có hai ReplicaSet, một cái `DESIRED` bằng 0.
3. Phần 3 – ImagePullBackOff.
   - `kubectl set image deployment/web nginx=nginx:1.27.999`, `rollout status --timeout=45s` báo `timed out waiting for the condition`.
   - `kubectl get pods`: 3 Pod cũ `Running` và 1 Pod mới `ImagePullBackOff`. Bằng chứng: `kubectl describe pod TEN_POD_LOI | sed -n '/Events:/,$p'` có `Failed to pull image "nginx:1.27.999"` kèm `not found`.
   - Khôi phục: `kubectl rollout undo deployment/web`, `rollout status`, rồi `kubectl get deployment web -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'` ra `nginx:1.27`.
   - History sau `undo`: revision đích được đánh số lại thành số mới (ví dụ 1, 3, 4). Annotate ngay sau mỗi thay đổi (kể cả bản lỗi cố ý) để mọi dòng `CHANGE-CAUSE` đúng.
4. Phần 4 – CrashLoopBackOff.
   - Apply `crash.yaml`, `get pods -w` thấy `Error` rồi `CrashLoopBackOff`.
   - Thứ tự chẩn đoán: `kubectl logs deploy/crashy --previous` ra `FATAL: thieu bien DB_HOST`; `describe` mục `Last State` có `Terminated`, `Reason: Error`, `Exit Code: 1`.
   - Sửa nguyên nhân gốc: thêm `env` `DB_HOST` và dùng `sleep 3600` để giữ tiến trình; `apply`, `rollout status`, `kubectl logs deploy/crashy` ra `DB_HOST=postgres`.
5. Phần 5 – Pending.
   - `kubectl create deployment hungry --image=nginx:1.27 --replicas=1` rồi `kubectl set resources deployment/hungry --requests=cpu=100` (100 core). Pod mới `Pending`.
   - Bằng chứng: `kubectl get events --field-selector reason=FailedScheduling` có `Insufficient cpu`; `kubectl describe node | grep -A8 Allocatable` cho thấy node chỉ có vài core.
   - Sửa: `kubectl set resources deployment/hungry --requests=cpu=100m`, `rollout status` thành công. Dọn: `kubectl delete deployment hungry crashy`.

Ba sự cố có cùng cấu trúc phân biệt: bằng chứng ImagePullBackOff nằm ở Events khi kéo image; CrashLoopBackOff nằm ở `logs --previous` và exit code; Pending nằm ở Events `FailedScheduling` vì container chưa tồn tại nên không có log.

### Lời giải L2

Thử thách 1 – ba scenario trong `examples/troubleshooting/` (07, 08, 09). Học viên chỉ nhận triệu chứng; mỗi scenario đi theo cùng quy trình `get pods`, `describe`, `logs --previous`, sau đó sửa và kiểm chứng. Nguyên nhân thật và cách sửa nằm ở [Kịch bản buổi 28](../sessions/session-28.md). Kết luận của học viên phải có lệnh, output chỉ ra nguyên nhân, cách sửa và cách kiểm chứng đã khôi phục.

Thử thách 2 – `set image` tag không tồn tại trên ứng dụng thật.

```bash
kubectl -n club set image deployment/club-api api=club-api:9.9.9
kubectl -n club rollout status deployment/club-api --timeout=60s
kubectl -n club get rs
kubectl -n club describe pod -l app=club-api | sed -n '/Events:/,$p'
kubectl -n club rollout undo deployment/club-api
kubectl -n club rollout status deployment/club-api
kubectl -n club get pods
```

Lập luận cần có:

- Ứng dụng vẫn phục vụ vì với 2 replicas `maxUnavailable` mặc định (25% làm tròn xuống) bằng 0 và `maxSurge` bằng 1: Pod mới chưa Ready thì chưa tắt Pod cũ. Bằng chứng ứng dụng còn chạy: `port-forward` hoặc `curl` tới `/api/members` vẫn trả dữ liệu.
- Nguyên nhân gốc: tag `9.9.9` chưa từng được build hay nạp vào kind; `imagePullPolicy: IfNotPresent` nên kubelet thử kéo từ registry và không tìm thấy.
- Sau `undo`, `kubectl -n club get deployment club-api -o jsonpath='{.spec.template.spec.containers[0].image}'` ra `club-api:1.0.0` và `get pods` có hai Pod `1/1`.
- Phát hành đúng: `docker build -t club-api:1.0.1 ./backend`, `kind load docker-image club-api:1.0.1 --name club`, kiểm tra image có trong node (ví dụ `docker exec club-control-plane crictl images`), rồi mới `set image`. Phòng tránh: tag bất biến, kiểm tra image tồn tại trước khi deploy, luôn chạy `rollout status` sau deploy.

Thử thách 3 – Troubleshooting report. Mẫu một sự cố tốt (ImagePullBackOff):

- Triệu chứng: sau `set image`, `rollout status` hết thời gian; một Pod `ImagePullBackOff`, web vẫn mở được.
- Bằng chứng: trích dòng `Failed to pull image ... not found` từ `describe pod` và lệnh đã chạy.
- Nguyên nhân gốc: tag không tồn tại (typo hoặc chưa nạp vào kind), không phải lỗi cụm.
- Cách khắc phục: `rollout undo` để cứu dịch vụ, rồi sửa tag đúng và `set image` lại; kiểm chứng bằng `rollout status` và `jsonpath`.
- Phòng tránh: một thay đổi cụ thể, ví dụ tag bất biến theo version, bước CI kiểm tra image tồn tại, luôn chạy `rollout status --timeout` sau deploy.

### Điều tra Pod `0/1` do readiness path sai (tình huống tổng hợp)

1. `get pods`: `Running`, `0/1`, RESTARTS 0 nghĩa là container sống, chỉ readiness chưa đạt.
2. `describe pod`: Events có `Readiness probe failed: HTTP probe failed with statuscode: 404`.
3. `port-forward` rồi `curl` từng đường dẫn: `/ready` trả 200, đường dẫn sai trả 404. Backend của starter-project không ghi log từng request nên `logs` không cho thấy gì.
4. So `readinessProbe.path` trong YAML với route trong `starter-project/backend/app.js` (`/health`, `/ready`, `/api/members`).
5. Sửa path, `apply`, `rollout status`.

Nguyên nhân gốc: cấu hình probe không khớp route ứng dụng, không phải image hay tài nguyên. Phòng tránh: thử đường dẫn bằng `port-forward` và `curl` trước, dùng `kubectl diff -f`, luôn theo dõi `rollout status`.

### Hiểu lầm hay gặp

- "Rollout kẹt thì web sập": không, Pod cũ vẫn phục vụ; vấn đề là lỗi im lặng nếu không chạy `rollout status`.
- Dùng `kubectl logs` thường cho Pod crash rồi kết luận không có log; cần `--previous`.
- Tìm log của Pod `Pending`: container chưa chạy; bằng chứng ở Events `FailedScheduling`.
- Coi `BackOff` là lỗi riêng: đó chỉ là thời gian chờ tăng dần giữa các lần restart, nguyên nhân thật nằm ở lần thất bại trước.
- Dùng `rollout undo` khi bản trước cũng hỏng (như `crashy`), hoặc khi lỗi nằm ngoài template (Secret, ConfigMap, dữ liệu).
- Rollback xong coi như hết việc mà không tìm nguyên nhân gốc.
- Quên rằng `scale` không tạo revision mới.

## Bài tập tuần

Đáp án năm câu hỏi kiểm tra (trả lời trong `lab-28/report.md`):

1. PV là dung lượng lưu trữ thật; PVC là yêu cầu của workload; StorageClass mô tả loại storage và cách tạo PV tự động. Developer thường tạo PVC. Trên kind PVC `Pending` trước khi có Pod vì `WaitForFirstConsumer` chờ Pod được xếp lịch để chọn node; đó không phải lỗi.
2. Xóa `postgres-0` hoặc StatefulSet: PVC và PV còn, Pod mới mount lại nên còn dữ liệu. Xóa PVC với reclaim policy `Delete`: PV và dữ liệu bị xóa, apply lại tạo PVC và PV mới trống. Với `Retain` thì PV còn ở trạng thái `Released`.
3. Ingress chỉ là khai báo, cần controller (ví dụ ingress-nginx) đọc và thực thi. Kind chạy trong container Docker nên cần `extraPortMappings` (80, 443) để đưa traffic từ host vào node, và nhãn `ingress-ready=true` để controller được xếp lịch vào đúng node đó.
4. Với 3 replicas, `maxUnavailable` mặc định làm tròn xuống thành 0 và `maxSurge` là 1: Pod cũ chỉ bị xóa khi Pod mới Ready, nên Pod cũ vẫn phục vụ. Tham số quyết định là `maxUnavailable` (cùng `maxSurge`).
5. Dùng `kubectl logs TEN_POD --previous` và xem `Last State`, exit code trong `describe`. Pod `Pending` không đọc được log vì container chưa tạo; bằng chứng nằm ở Events `FailedScheduling` trong `describe pod` hoặc `get events`.

Gợi ý theo nhiệm vụ:

- Nhiệm vụ 1 và 2: theo đáp án buổi 27 ở trên. Điểm hay bị thiếu: bằng chứng Pending (dòng `Pending` hoặc Events `waiting for first consumer`) và đoạn giải thích 404.
- Nhiệm vụ 3: theo đáp án buổi 28, Phần 1 đến 3. Cần `CHANGE-CAUSE` có nội dung cho mọi revision đang hiển thị; nếu học viên thấy `none` hoặc nội dung sai ở revision lỗi, cần annotate lại đúng sau mỗi thay đổi.
- Nhiệm vụ 4: bảng ba dòng ví dụ:

| Lỗi | Lệnh đầu tiên | Vì sao lệnh này | Nguyên nhân gốc |
| --- | --- | --- | --- |
| ImagePullBackOff | `kubectl describe pod` | Lý do kéo image nằm trong Events, STATUS chỉ báo triệu chứng | Tag không tồn tại trong registry |
| CrashLoopBackOff | `kubectl logs --previous` | Container hiện tại vừa khởi động lại, log lần chạy trước mới có lỗi | Ứng dụng thoát mã 1 vì thiếu biến `DB_HOST` |
| Pending | `kubectl get events --field-selector reason=FailedScheduling` | Chưa có container nên không có log, bằng chứng ở scheduler | `requests.cpu` lớn hơn tài nguyên node |

- Nhiệm vụ 5: báo cáo đủ 5 mục cho hai sự cố; mục Nguyên nhân gốc nêu `rollout undo` chỉ cứu dịch vụ, và không giúp khi không có revision tốt trước đó (như `crashy`), hoặc lỗi nằm ngoài template.
