# Đáp án tuần 11 – Kubernetes Setup và Workloads

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng trang này để chấm bài. Hash ReplicaSet, tên Pod, IP và phiên bản Kubernetes trên máy học viên luôn khác tài liệu; chấm theo output thật của học viên.
:::

> **Tóm tắt:** Đáp án buổi 21 (dựng cluster kind `club`) và buổi 22 (Pods, Deployments, rolling update, ImagePullBackOff), kèm gợi ý cho bài tập tuần, bảng bằng chứng cần thấy và lời giải đầy đủ Deployment canary.

## Cách dùng tài liệu này

- Dùng để đối chiếu cách nghĩ và cách điều tra. Phần lời giải thường có nhiều cách đúng; cách khác nhưng có bằng chứng và giải thích được vẫn đạt.
- Môi trường cả tuần: cluster kind `club`, context `kind-club`, node `club-control-plane`, tạo từ `starter-project/k8s/kind-config.yaml` ở buổi 21 và dùng tiếp ở buổi 22. Cluster 3 node `club-3` chỉ xuất hiện ở thử thách L2 và phải xóa ngay sau khi xong.
- Bài gốc: [Buổi 21](../../labs/week-11/session-21.md), [Buổi 22](../../labs/week-11/session-22.md). Bài tập: [bài tập tuần 11](../../assignments/weekly/week-11.md). Barem: [Hướng dẫn chấm tuần 11](../grading/week-11.md).

### Buổi 21 – Kubernetes Introduction

#### Đáp án lab bắt buộc

1. **Chuẩn bị.** Hai lệnh cần thấy trong evidence:

   ```bash
   kubectl version --client
   kind version
   ```

   Điểm cần kiểm: `kind v0.23.0` trở lên (bài pin đúng bản này), `Client Version: v1.3x.x`. Nếu `command not found`, kiểm tra `ls /usr/local/bin` và bước `sudo mv` hoặc `sudo install`.

2. **Phần 1: tạo cluster `club`.**

   ```bash
   kind create cluster --name club --config ~/devops-course/starter-project/k8s/kind-config.yaml
   kubectl config current-context
   kubectl get nodes -o wide
   ```

   Kết quả đúng: context `kind-club`, một node `club-control-plane` có `STATUS Ready`, `ROLES control-plane`. `Ready` nghĩa là kubelet của node báo khỏe với API Server. Cổng 80 và 443 của máy phải rảnh vì file cấu hình map hai cổng này; nếu không, `kind create cluster` báo `address already in use`.

3. **Phần 2: xem bên trong cluster.**

   ```bash
   docker ps --filter name=club --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
   kubectl get pods -n kube-system -o wide
   kubectl get namespaces
   kubectl get --raw /readyz; echo
   ```

   Phải thấy đúng một container `club-control-plane` (image `kindest/node`) trạng thái `Up`: `docker ps` và `kubectl get nodes` nhìn cùng một hệ thống từ hai phía. Pod cần thấy `Running` trên `club-control-plane`: `etcd-`, `kube-apiserver-`, `kube-scheduler-`, `kube-controller-manager-`, `coredns-` (thường 2 Pod), `kube-proxy-`, `kindnet-`. Namespace: `default`, `kube-system`, `kube-public`, `kube-node-lease`, `local-path-storage`. Không có Pod `kubelet` vì kubelet là tiến trình trên node. `/readyz` trả `ok`.

   Vai trò tối thiểu học viên phải nói được: `kube-apiserver` là cổng duy nhất của cluster (xác thực, phân quyền, kiểm tra hợp lệ); `etcd` lưu toàn bộ trạng thái và chỉ API Server nói chuyện trực tiếp với nó. Bảng thành phần trong `report.md` phải khớp tên Pod thật trong output.

4. **Phần 3: tự phá rồi tự sửa.** Học viên chạy `docker stop club-control-plane` rồi `kubectl get nodes`.

   Triệu chứng: `connection refused` hoặc timeout, thông báo có `127.0.0.1:<port>`, tức kubectl đang nói chuyện với API Server của kind qua cổng Docker publish ra host. Cây điều tra:

   1. `kubectl config current-context` vẫn là `kind-club`: loại trừ sai cluster.
   2. `docker ps -a --filter name=club`: container `club-control-plane` ở trạng thái `Exited`.
   3. Kết luận: API Server nằm trong container control plane nên không còn ai trả lời.

   Nguyên nhân gốc: node của kind là container, dừng container (hoặc Docker Desktop khởi động lại) tương đương tắt máy chủ control plane.

   Khôi phục:

   ```bash
   docker start club-control-plane
   sleep 45
   kubectl get nodes
   ```

   Node quay lại `Ready` sau 30-60 giây. Nếu cổng publish đã đổi, chạy `kind export kubeconfig --name club`. Thứ tự điều tra đúng là Docker trước, context sau, không "cài lại kubectl". `report.md` phải có ba ý: triệu chứng, nguyên nhân gốc, cách khôi phục.

#### Lời giải thử thách

**Thử thách 1: cluster 3 node `club-3`.** Học viên tự viết file, ví dụ `source/kind-3-nodes.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

```bash
kind create cluster --name club-3 --config source/kind-3-nodes.yaml
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl describe node club-3-control-plane | grep -i taints
kubectl describe node club-3-worker | grep -i taints
```

Cách đọc kết quả:

- Ba node `Ready`: `club-3-control-plane`, `club-3-worker`, `club-3-worker2`.
- Cột NODE của `get pods -A -o wide`: `etcd`, `kube-apiserver`, `kube-scheduler`, `kube-controller-manager` chỉ nằm trên control plane; `kube-proxy` và `kindnet` mỗi node một Pod (DaemonSet). `coredns` có thể nằm ở node nào cũng được vì có toleration cho taint của control plane.
- Control plane có taint `node-role.kubernetes.io/control-plane:NoSchedule`, worker là `<none>`. Pod ứng dụng không khai báo toleration nên scheduler không đặt chúng lên control plane; Pod hệ thống chạy được ở đó vì là static Pod hoặc có toleration.
- Với cluster 1 node `club`, kind gỡ taint này, nếu không thì không có chỗ nào chạy được Pod ứng dụng. Vì vậy ý "kube-proxy mỗi node một Pod" và câu hỏi về taint chỉ kiểm tra được khi học viên làm thử thách này.

File tối thiểu chỉ khai báo vai trò node, không `image`, nên kind dùng node image mặc định. Có thể thêm `image: kindest/node:v1.30.x` để pin phiên bản Kubernetes. Dọn dẹp: `kind delete cluster --name club-3` rồi `kubectl config use-context kind-club`.

**Thử thách 2: chỉ dùng kubectl.**

```bash
kubectl version
kubectl get --raw '/readyz?verbose' | head -20
```

`kubectl version` in cả `Client Version` và `Server Version`; phần server do API Server trả lời. `/readyz?verbose` liệt kê từng kiểm tra sức khỏe của API Server, có dòng `etcd ok`, kết thúc bằng `readyz check passed`. Cả hai lệnh đều là yêu cầu HTTPS tới API Server, không đụng tới Docker.

**Thử thách 3: so sánh với file của starter-project.** Đoạn 3-5 câu đạt yêu cầu cần có các ý:

- `starter-project/k8s/kind-config.yaml` chỉ có 1 node control-plane (không có worker), file của học viên có 3 node.
- Nhãn `ingress-ready=true` (đặt qua `kubeadmConfigPatches` cho kubelet) để Ingress controller của kind chọn đúng node đang có cổng được map ra host.
- `extraPortMappings` map cổng 80 và 443 của container node ra cổng 80 và 443 của máy host, để sau này truy cập `club.localhost` mà không cần `port-forward`.
- Rủi ro: máy đã có tiến trình dùng cổng 80 hoặc 443 (hoặc cluster khác map cùng cổng) thì tạo cluster báo `address already in use`.

Học viên chỉ nói "file kia có thêm cấu hình" mà không giải thích mục đích hai khối đó là chưa đạt.

#### Những hiểu lầm hay gặp

- Nghĩ kind là "máy ảo": thực ra chỉ là container, nên khởi động lại Docker Desktop là khởi động lại cả cluster.
- Nghĩ kubectl nói chuyện trực tiếp với node hoặc etcd. Tất cả đi qua API Server.
- Nhầm cluster đã xóa với cluster đang chạy: sau `kind delete cluster`, context tương ứng thường được dọn, nhưng hãy kiểm tra bằng `kubectl config get-contexts`.
- Cho rằng xóa Pod `kube-scheduler` bằng kubectl sẽ tắt scheduler. Đây là bản phản chiếu (mirror Pod) của static Pod do kubelet quản lý nên nó tự quay lại.
- Làm lab trong `/mnt/c` hoặc để Docker thiếu RAM rồi kết luận "kind lỗi".

### Buổi 22 – Pods và Deployments

#### Đáp án lab bắt buộc

Chuẩn bị đúng: context `kind-club`, cluster tạo từ `k8s/kind-config.yaml` (cổng 80 và 443 rảnh).

1. Build và nạp image, kiểm tra trong node:

   ```bash
   docker build -t club-api:1.0.0 ./backend
   kind load docker-image club-api:1.0.0 --name club
   docker exec club-control-plane crictl images | grep club-api
   ```

   Phải thấy `docker.io/library/club-api   1.0.0`. Tag cố định giúp manifest tái lập; node kind không thấy image trong Docker Desktop nên phải nạp.

2. Dựng nền theo thứ tự: namespace, ConfigMap, Secret, Postgres, bảng `members`:

   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   read -rsp "DB password (local): " DB_PASS; echo
   kubectl create secret generic club-secrets -n club --from-literal=db-password="$DB_PASS"
   unset DB_PASS
   kubectl apply -f k8s/postgres.yaml
   kubectl rollout status statefulset/postgres -n club --timeout=120s
   kubectl exec -i -n club postgres-0 -- psql -U club -d clubdb < database/init.sql
   ```

   Mật khẩu không nằm trong file nào. `init.sql` phải chạy thì `/api/members` mới không trả 500; kết quả đúng là `CREATE TABLE` và `INSERT 0 2` (chạy lần hai là `NOTICE ... already exists` và `INSERT 0 0` vì có `IF NOT EXISTS` và `ON CONFLICT DO NOTHING`).

3. Đọc manifest và trả lời ba câu của lab:

   - Label nối Deployment với Pod: `app: club-api` (`spec.selector.matchLabels` khớp `spec.template.metadata.labels`).
   - Probe chặn Pod nhận traffic: `readinessProbe` vào `/ready` cổng 3000. Readiness quyết định Pod có nằm trong Endpoints của Service hay không; `livenessProbe` `/health` quyết định có restart container hay không.
   - `DB_HOST` đến từ ConfigMap `club-config` qua `envFrom.configMapRef` (giá trị `postgres`, tên Service của Postgres).

4. Deploy và kiểm chứng:

   ```bash
   kubectl apply -f k8s/backend.yaml
   kubectl rollout status deployment/club-api -n club --timeout=120s
   kubectl get deployment,replicaset,pod -n club -l app=club-api
   ```

   Kết quả đúng: Deployment READY 2/2, một ReplicaSet DESIRED 2 và READY 2, hai Pod `1/1 Running`. Sau đó `port-forward` và `curl`:

   ```bash
   kubectl port-forward -n club svc/backend 3000:3000
   curl -s localhost:3000/health; echo
   curl -s localhost:3000/ready; echo
   curl -s localhost:3000/api/members; echo
   ```

   Ba output đúng: `{"status":"healthy","service":"club-api"}`, `{"status":"ready"}`, mảng JSON gồm Alice và Bob.

5. Rolling update lên 1.0.1 (build sau khi sửa nhẹ `app.js` hoặc `docker tag club-api:1.0.0 club-api:1.0.1`):

   ```bash
   docker build -t club-api:1.0.1 ./backend
   kind load docker-image club-api:1.0.1 --name club
   kubectl set image deployment/club-api api=club-api:1.0.1 -n club
   kubectl annotate deployment/club-api -n club kubernetes.io/change-cause="update api to 1.0.1" --overwrite
   kubectl rollout status deployment/club-api -n club
   kubectl get replicaset -n club -l app=club-api
   kubectl rollout history deployment/club-api -n club
   ```

   Tên container là `api` (đúng với `containers[0].name` trong manifest), đó là vế trái của `api=club-api:1.0.1`. Kết quả đúng: hai ReplicaSet, bản mới 2 Pod, bản cũ 0 Pod; history có REVISION 1 và 2.

6. Rollback:

   ```bash
   kubectl rollout undo deployment/club-api -n club
   kubectl rollout status deployment/club-api -n club
   kubectl get deployment club-api -n club -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
   ```

   Dòng cuối phải là `club-api:1.0.0`. `undo` tái sử dụng ReplicaSet của revision trước. Hệ quả mentor có thể hỏi: sau undo history chỉ còn revision 2 và 3, vì ReplicaSet cũ được đánh số lại thành revision mới nhất.

7. **Phần 5: ImagePullBackOff.** Xem mục "Lời giải phần Phá lỗi" bên dưới.

#### Lời giải thử thách

**Thử thách 1: Deployment canary.** Lời giải đầy đủ nằm ở phụ lục cuối trang; những điểm cần hiểu sâu:

- Khung tự viết gồm `apiVersion: apps/v1`, `kind: Deployment`, `metadata`, `spec.replicas: 1`, `selector.matchLabels` (`app: club-api`, `track: canary`) và template có đúng hai label đó. Selector phải là tập con của label trong template.
- Service `backend` chỉ chọn `app: club-api`, nên Pod canary được thêm vào EndpointSlice ngay khi `readinessProbe` `/ready` qua. Không phải sửa Service, vì Service không biết gì về Deployment.
- Kiểm tra:

  ```bash
  kubectl apply -f source/club-api-canary.yaml
  kubectl rollout status deployment/club-api-canary -n club
  kubectl get endpointslices -n club -l kubernetes.io/service-name=backend -o wide
  ```

  Kỳ vọng ba địa chỉ trong cùng EndpointSlice (hai Pod chính, một canary), khớp IP trong `kubectl get pods -n club -l app=club-api -o wide`.
- Rủi ro cần nêu: Deployment chính cũng có selector `app: club-api`. Vì mỗi ReplicaSet còn thêm nhãn `pod-template-hash` và Pod đã có owner nên không bị "cướp", nhưng thực hành tốt là thêm nhãn phân biệt (ví dụ `track: stable`) vào cả selector của Deployment chính. Selector không sửa được sau khi tạo nên phải xóa và tạo lại Deployment đó.
- Dọn: `kubectl delete deployment club-api-canary -n club`.

**Thử thách 2: rolling update có kiểm soát.** Cách làm: chép `k8s/backend.yaml` thành `source/backend-l2.yaml`, thêm khối sau vào `spec` ngang hàng `replicas`:

```yaml
spec:
  replicas: 4
  revisionHistoryLimit: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Sửa dòng `image:` sang `club-api:1.0.1` rồi `kubectl apply -f source/backend-l2.yaml` (không dùng `kubectl set image` hay `edit`, để file và cluster khớp nhau), trong lúc đó chạy `kubectl get pods -n club -l app=club-api -w | tee evidence/watch.txt` ở terminal khác.

Phép tính: tối đa Pod = replicas + maxSurge = 4 + 1 = 5; tối thiểu Pod sẵn sàng = replicas - maxUnavailable = 4 - 0 = 4. Vòng lặp: tạo 1 Pod mới (tổng 5), chờ Ready, xóa 1 Pod cũ (tổng 4), lặp lại. Cách khác: dùng phần trăm (`25%`) cho kết quả khác vì làm tròn (maxSurge lên, maxUnavailable xuống).

Lưu ý tài nguyên: 4 replica mỗi Pod request 100m CPU và 128Mi, cộng một Pod surge, vẫn vừa node kind thông thường. Nếu Pod `Pending` với `Insufficient cpu`, giảm requests hoặc replicas.

#### Lời giải phần Phá lỗi: ImagePullBackOff

Phá: `kubectl set image deployment/club-api api=club-api:1.0.9 -n club`.

Cây điều tra:

1. Triệu chứng: `kubectl rollout status ... --timeout=30s` báo `timed out waiting for the condition`; `kubectl get pods -n club -l app=club-api` có một Pod `ErrImagePull` rồi `ImagePullBackOff`, hai Pod cũ vẫn `1/1 Running`.
2. Chưa sửa vội, xem Events:

   ```bash
   kubectl describe pod -n club -l app=club-api | sed -n '/Events:/,$p'
   kubectl get events -n club --sort-by=.lastTimestamp | tail -8
   ```

   Dòng cần chỉ ra (nội dung chính xác phụ thuộc phiên bản): `Failed to pull image "club-api:1.0.9"` kèm lý do kiểu `pull access denied, repository does not exist` và `Back-off pulling image`.
3. Giả thuyết "node không có image": `docker exec club-control-plane crictl images | grep club-api` chỉ có `1.0.0` và `1.0.1`, không có `1.0.9`. Đây là bằng chứng loại trừ lỗi mạng hoặc credential: kubelet đi pull từ Docker Hub vì tag không có sẵn trong node.
4. Nguyên nhân gốc: tag `1.0.9` chưa được build và nạp vào node (và cũng không tồn tại trên registry công khai).
5. Vì sao dịch vụ không sập: Deployment dùng RollingUpdate với `maxUnavailable` làm tròn xuống 0 (2 replicas); Pod mới không bao giờ Ready nên Pod cũ không bị xóa. Cần nêu số Pod Ready tại thời điểm đó (2).
6. Sửa tùy nguyên nhân thật:

   ```bash
   kubectl rollout undo deployment/club-api -n club
   kubectl rollout status deployment/club-api -n club
   ```

   hoặc, nếu tag đúng nhưng quên nạp: `kind load docker-image club-api:1.0.9 --name club`, thêm `kubectl rollout restart deployment/club-api -n club` để khỏi chờ back-off.
7. Phòng tránh: nạp ngay sau khi build, dùng tag cố định (không `latest`), luôn chạy `rollout status` và coi timeout là tín hiệu phải điều tra, dùng registry (GHCR) và `imagePullSecrets` ở môi trường thật.

Giải thích bắt buộc trong bài tập: kind không cần registry vì có thể nạp image trực tiếp vào runtime của node, nhưng node có runtime riêng nên image trong Docker Desktop không tự xuất hiện; không nạp thì kubelet quay sang pull từ registry.

#### Những hiểu lầm hay gặp

- "Pod ở trạng thái Running tức là ứng dụng khỏe": chỉ khi `READY 1/1` và probe đúng. Pod `0/1 Running` là chưa nhận traffic.
- Tưởng `kubectl delete pod` của Pod thuộc Deployment là "xóa ứng dụng": ReplicaSet tạo lại ngay.
- Dùng `latest` hoặc không đổi tag giữa hai phiên bản nên Deployment không thấy Pod template đổi và không có rolling update.
- Quên `--name club` khi `kind load docker-image`: image vào cluster mặc định `kind`, Pod vẫn ImagePullBackOff. Kiểm tra bằng `kind get clusters` và `docker exec club-control-plane crictl images`.
- `port-forward` gắn chặt vào một Pod cụ thể. Sau rolling update hoặc rollback, phiên cũ có thể đứt (`lost connection to pod`) hoặc vẫn trỏ Pod cũ; chạy lại `port-forward` rồi mới `curl` để thấy phiên bản mới. Đây là lý do một số bài "không thấy thay đổi" dù rollout thành công.
- Trộn `kubectl set image` với `kubectl apply -f`: lần apply sau sẽ ghi đè về image trong file.
- Cho rằng `kubectl rollout undo` tạo ReplicaSet mới: nó dùng lại ReplicaSet cũ; `revisionHistoryLimit: 0` làm mất khả năng rollback.
- Đặt mật khẩu thật vào `secret.example.yaml` rồi commit.

### Bài tập tuần

Bài tập là nộp lại bằng chứng của hai lab, làm trên cluster `club` (context `kind-club`). Đề: [bài tập tuần 11](../../assignments/weekly/week-11.md).

#### Gợi ý cho các nhiệm vụ L1

**Nhiệm vụ 1: cluster `club` chạy tốt.** Evidence: `kubectl version --client`, `kind version` (từ 0.23), `kubectl config current-context` (`kind-club`), `kubectl get nodes -o wide` có `club-control-plane` `Ready`, `docker ps --filter name=club` có container node `Up`.

**Nhiệm vụ 2: bản đồ cluster.** Bảng phải khớp output `kubectl get pods -n kube-system -o wide` của chính học viên, ví dụ:

| Thành phần | Chạy ở đâu | Vai trò |
| --- | --- | --- |
| kube-apiserver | Pod `kube-apiserver-club-control-plane` | Cổng duy nhất của cluster, xác thực và ghi trạng thái vào etcd |
| etcd | Pod `etcd-club-control-plane` | Kho key-value lưu trạng thái cluster |
| kube-scheduler | Pod `kube-scheduler-club-control-plane` | Chọn node cho Pod chưa có node |
| kube-controller-manager | Pod `kube-controller-manager-club-control-plane` | Chạy các controller đưa trạng thái thật về mong muốn |
| kubelet | Tiến trình trên node, không phải Pod trong `kube-system` | Chạy Pod được giao, báo trạng thái về API Server |
| kube-proxy | Pod `kube-proxy-...` (DaemonSet, mỗi node một Pod) | Cài luật mạng đưa traffic của Service tới đúng Pod |

Với cluster 1 node, mọi Pod nằm trên `club-control-plane`. Điểm dễ sai: kubelet không xuất hiện trong `kubectl get pods` vì nó là tiến trình của node. Sơ đồ mermaid mẫu đạt yêu cầu:

```mermaid
sequenceDiagram
    participant U as kubectl
    participant A as API Server
    participant E as etcd
    participant C as Controller Manager
    participant S as Scheduler
    participant K as kubelet
    U->>A: apply Deployment
    A->>E: ghi trang thai mong muon
    C->>A: thay Deployment moi, tao ReplicaSet va Pod
    S->>A: chon node cho Pod chua co node
    K->>A: thay Pod duoc giao cho minh
    K->>K: containerd keo image va chay container
    K->>A: bao trang thai Running va Ready
```

**Nhiệm vụ 3: deploy Club API.** Làm đúng chuỗi lệnh Phần 1 đến 3 của buổi 22. Ba lệnh `curl` lưu vào `evidence/test-results.txt`. Về Secret có hai cách đều đạt: `kubectl create secret generic ... --from-literal`, hoặc sao chép `secret.example.yaml` thành `secret.yaml` với giá trị tự đặt rồi liệt kê `secret.yaml` trong `.gitignore`. Bằng chứng: `git ls-files | grep -i secret` chỉ ra file example. Ba câu hỏi về manifest trả lời như mục Buổi 22 ở trên.

**Nhiệm vụ 4: rolling update và rollback.** Sửa `backend/app.js` để `/health` trả thêm trường `version` (hoặc đổi chuỗi `service`), build `club-api:1.0.1`, nạp vào `club`, `set image`, `rollout status`. Evidence: image `club-api:1.0.1` từ jsonpath, `curl` thấy thay đổi, `rollout history` có 2 revision, sau `undo` image về `club-api:1.0.0` và `curl` không còn thay đổi (nhớ chạy lại `port-forward`). Giải thích hai ReplicaSet: mỗi lần Pod template đổi, Deployment tạo ReplicaSet mới và giữ ReplicaSet cũ để rollback; sau rollback ReplicaSet của 1.0.1 có DESIRED 0.

**Nhiệm vụ 5: ImagePullBackOff.** Học viên chọn tag lỗi riêng (ví dụ `club-api:9.9.9`, không dùng `1.0.9`). Cần đủ: `get pods` có `ErrImagePull` hoặc `ImagePullBackOff`; Events nêu lý do pull thất bại; số Pod Ready lúc lỗi (2); báo cáo ba mục (triệu chứng, nguyên nhân gốc, cách sửa); lệnh khôi phục và `get pods` cho thấy `2/2`; giải thích `kind load`.

#### Gợi ý cho thử thách L2

- Thử thách A (cluster `club-3`): như lời giải thử thách 1 của buổi 21.
- Thử thách B (Deployment `club-api-extra`): giống lời giải canary, đổi tên và `track: extra`, 3 địa chỉ trong EndpointSlice. Nếu đổi label `app` của Pod này, Pod rời khỏi Service và ReplicaSet của nó tạo Pod mới (vì Pod không còn khớp selector `app: club-api, track: extra`).
- Thử thách C (rolling update có kiểm soát): như lời giải thử thách 2 của buổi 22, với phép tính 4+1 và 4-0 cụ thể, có file `get pods -w`. Khi học viên chép `k8s/backend.yaml` thành `source/backend-l2.yaml`, selector không đổi nên `kubectl apply` an toàn. Để đổi image, sửa dòng `image:` rồi apply lại; nếu dùng `kubectl set image` thì lần apply sau ghi đè về image trong file.
- Thử thách D (readinessProbe sai đường dẫn, ví dụ `/ready-x`): Pod mới `0/1 Running` (container chạy nhưng probe nhận 404), Pod cũ vẫn `1/1`; `kubectl rollout status --timeout=60s` thất bại với mã thoát khác 0, đó là tín hiệu phát hiện sớm trong pipeline; khôi phục bằng `kubectl rollout undo`. An toàn vì `maxUnavailable` là 0 nên Pod cũ không bị xóa trước khi Pod mới Ready.

#### Đáp án 5 câu hỏi kiểm tra

1. Node của kind là container Docker nên `docker ps` thấy chúng và `kubectl get nodes` thấy cùng các node đó dưới góc nhìn Kubernetes. Dừng container control plane là tắt API Server: kubectl báo `connection refused` hoặc timeout dù worker vẫn chạy.
2. Pod đang chạy vẫn chạy (kubelet tự quản lý). Pod mới tạo ra (Deployment mới, scale, thay Pod chết) ở `Pending` vì không ai gán node, cho tới khi scheduler hoạt động lại.
3. Pod là đơn vị chạy container, tạm thời và không tự quay lại; ReplicaSet giữ đúng N Pod theo selector; Deployment quản lý ReplicaSet và thêm rolling update, rollback. Pod trần không có controller nên chết là mất, không scale, không cập nhật có kiểm soát.
4. Readiness probe quyết định Pod được thêm vào Endpoints của Service. Nếu probe luôn thất bại, Pod mới không bao giờ Ready, rollout bị kẹt (timeout) còn Pod cũ vẫn phục vụ (khi `maxUnavailable` là 0).
5. `kubectl get pods` xem trạng thái, `kubectl describe pod` đọc Events để thấy lý do pull; kiểm tra tên và tag trong spec; với kind xem image có trong node không (`docker exec club-control-plane crictl images`) và đã `kind load docker-image ... --name club` đúng cluster chưa; cuối cùng mới tới registry và `imagePullSecrets` (không áp dụng với image local).

### Hướng dẫn chấm cho mentor

Bảng bằng chứng cần thấy cho từng nhiệm vụ bắt buộc. Tổng L1 là 100 điểm theo [Hướng dẫn chấm tuần 11](../grading/week-11.md); L2 chỉ chấm khi L1 từ 70 điểm.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu |
| --- | --- | --- |
| NV1: cluster `club` (15) | Phiên bản kubectl và kind (kind từ 0.23); context `kind-club`; `get nodes -o wide` có `club-control-plane` `Ready`; `docker ps` có container node | Output giống hệt tài liệu từng chữ; context khác `kind-club` mà không giải thích |
| NV2: bản đồ cluster (15) | `get pods -n kube-system -o wide` khớp bảng (đúng tên Pod, đúng node); sơ đồ đủ 4 bước chính | Bảng có kubelet ở dạng Pod; tên Pod trong bảng không có trong output; thiếu bước ghi etcd |
| NV3: deploy Club API (20) | `rollout status` thành công; Deployment READY 2/2; ba `curl` đúng; `git ls-files` chỉ có file example | `/api/members` thành công nhưng không có bước `init.sql`; mật khẩu trong file commit; context sai |
| NV4: rolling update và rollback (20) | `rollout history` có 2 revision; image 1.0.1 rồi 1.0.0; `get replicaset` hai dòng; diff mã nguồn; `curl` trước, sau, sau rollback | `curl` sau rollback vẫn thấy thay đổi nhưng không giải thích (port-forward cũ); image giữ nguyên tag nhưng tuyên bố đã update |
| NV5: ImagePullBackOff (15) | `get pods` có `ErrImagePull` hoặc `ImagePullBackOff`; Events có dòng `Failed to pull image` với tag của học viên; số Pod Ready lúc lỗi; khôi phục `2/2` | Dùng đúng tag `1.0.9` của lab; chỉ ghi "sai tag" không có Events; không có bước khôi phục |
| Report và 5 câu hỏi (10) | `report.md` có đủ mục, trả lời đúng, có lý do | Trả lời giống nguyên văn lab; sai khái niệm (ví dụ cho rằng scheduler chết thì Pod đang chạy bị xóa) |
| Quy trình nộp (5) | PR đúng cấu trúc, có review với ít nhất hai nhận xét cụ thể, đúng hạn | Review chung chung ("ok"), PR không có commit nhỏ |

Gợi ý chấm nhanh:

- Mở `evidence/command-output.txt`, tìm dòng `$ lệnh`. Output tự gõ thường có hash ReplicaSet và AGE không nhất quán (ví dụ AGE đẹp tròn). Hash và tên Pod trùng tài liệu mẫu là dấu hiệu dán từ lab.
- Bài thật phải khớp giữa các lệnh: cùng hash ReplicaSet giữa `get pods` và `get replicaset`.
- Nếu có secret hoặc kubeconfig trong repo, áp dụng quy định trừ điểm của barem.
- Câu hỏi vấn đáp theo từng nhiệm vụ nằm ở [Hướng dẫn chấm tuần 11](../grading/week-11.md).

### Phụ lục – Lời giải đầy đủ Deployment canary

Thử thách 1 của buổi 22. Bài tập tuần dùng tên `club-api-extra` với `track: extra`; đáp án chỉ khác tên và nhãn. Tên Deployment trong lab là `club-api-canary`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: club-api-canary
  namespace: club
spec:
  replicas: 1
  selector:
    matchLabels:
      app: club-api
      track: canary
  template:
    metadata:
      labels:
        app: club-api
        track: canary
    spec:
      containers:
        - name: api
          image: club-api:1.0.1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          env:
            - name: PORT
              value: "3000"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: club-secrets
                  key: db-password
          envFrom:
            - configMapRef:
                name: club-config
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              memory: 256Mi
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

Áp dụng bằng `kubectl apply -f club-api-canary.yaml`. Khung tự viết là `apiVersion`, `kind`, `metadata`, selector, template; phần `env`, `envFrom`, `readinessProbe` có thể chép từ `k8s/backend.yaml` sau khi học viên đã tự viết khung. Deployment chính `club-api` có selector `app: club-api` trùng một phần với label của Pod canary: an toàn vì Pod canary đã có owner là ReplicaSet của canary, nhưng thực hành tốt là thêm nhãn phân biệt vào cả selector của Deployment chính (selector không sửa được nên phải xóa và tạo lại Deployment đó). Dọn dẹp: `kubectl delete deployment club-api-canary -n club`.
