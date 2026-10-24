# Walkthrough tuần 12 – kubectl và Services

> **Tóm tắt:** Hướng dẫn giải buổi 23 (kubectl: context, namespace, apply, logs, exec, jsonpath) và buổi 24 (Service, DNS, Endpoints rỗng), kèm bài tập tuần và bảng chấm cho mentor.

## Cách dùng tài liệu này

- Đọc sau khi bạn đã tự làm lab và bài tập; hãy đối chiếu cách điều tra của bạn với cây điều tra bên dưới thay vì chép lệnh.
- Tên Pod, hash, IP, ClusterIP trên máy bạn luôn khác. Evidence phải là output thật của bạn.
- Nhiều lỗi trong tuần này đến từ một nguyên nhân chung: đứng sai namespace hoặc sai context. Khi lệnh cho kết quả lạ, kiểm tra hai thứ đó trước.
- Bài lab: [buổi 23](../../labs/week-12/session-23.md), [buổi 24](../../labs/week-12/session-24.md). Bài tập: [bài tập tuần 12](../../assignments/weekly/week-12.md).

### Buổi 23 – kubectl Fundamentals

#### Đáp án các nhiệm vụ L1

Chuẩn bị: cluster kind đang chạy, `kubectl config current-context` trả về `kind-` cộng tên cluster, `source/namespace.yaml` và `source/demo-web.yaml` như trong lab.

1. Context và namespace mặc định:

   ```bash
   kubectl config get-contexts
   kubectl config current-context
   kubectl config view --minify | grep namespace
   ```

   Dấu `*` trong `get-contexts` là context đang dùng. Cột NAMESPACE trống nghĩa là namespace mặc định là `default`. Sau `kubectl config set-context --current --namespace=club` thì lệnh cuối in `namespace: club`.

2. Tạo namespace và workload:

   ```bash
   kubectl create namespace club-dev
   kubectl apply -f source/namespace.yaml
   kubectl diff -f source/demo-web.yaml
   kubectl apply -f source/demo-web.yaml
   kubectl rollout status deployment/demo-web -n club
   ```

   `apply` có tính idempotent: namespace `club` đã có thì ra `unchanged` hoặc `configured`, đều đúng. Thói quen cần có: `diff` trước, `apply` sau, `rollout status` cuối.

3. Hai Pod `Running` và node chạy chúng: `kubectl get pods -n club -o wide`. Cột NODE và IP đến từ `-o wide`; với kind một node thì cả hai Pod nằm cùng node.

4. Events trong `describe pod`: ba sự kiện đầu của một Pod khỏe thường là `Scheduled` (scheduler gán node), `Pulled` hoặc `Pulling` (kéo hoặc dùng lại image), `Created` rồi `Started`. Học viên phải chỉ ra đúng ba dòng thật trong output của mình; ví dụ này chỉ là kiểu thường thấy, thứ tự và số dòng có thể lệch một chút (ví dụ có thêm `Pulling`).

5. `port-forward` và log (đã chọn cổng 8081 vì 8080 hay bị chiếm):

   ```bash
   kubectl port-forward deployment/demo-web 8081:80 -n club
   curl -sI http://localhost:8081 | head -3
   kubectl logs -n club -l app=demo-web --tail=5 --prefix | grep -v kube-probe
   ```

   Phải thấy `HTTP/1.1 200 OK` và một dòng log `HEAD / HTTP/1.1" 200` từ `curl`. Lọc `kube-probe` vì readiness probe gọi `GET /` mỗi 5 giây. Dùng `-l app=demo-web --prefix` vì `port-forward` tới Deployment chỉ chọn một Pod; không biết Pod nào nhận request thì xem log của cả hai.

6. `exec` và vì sao thay đổi mất:

   ```bash
   POD=$(kubectl get pods -n club -l app=demo-web -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n club "$POD" -- nginx -v
   ```

   Giải thích: thay đổi viết vào lớp ghi của container; khi Pod bị xóa hoặc tạo lại (ReplicaSet luôn giữ đủ 2 Pod), container mới sinh ra từ image gốc nên thay đổi biến mất. Dấu `--` tách cờ của kubectl khỏi lệnh trong container.

7. `-o yaml` và jsonpath lấy tên image:

   ```bash
   kubectl get deployment demo-web -n club -o yaml | head -40
   kubectl get deployment demo-web -n club -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
   ```

   Kết quả: `nginx:1.27-alpine`. Jsonpath đặt trong nháy đơn để shell không xử lý dấu ngoặc và `*`.

8. Dọn: `kubectl delete -f source/demo-web.yaml` rồi `kubectl get pods -n club -l app=demo-web` ra `No resources found in club namespace.`. Không xóa namespace `club`; chỉ xóa `club-dev` ở cuối lab: `kubectl delete namespace club-dev`.

#### Lời giải L2

**Thử thách 1 – `inspect.sh`.** Lời giải trong lab đạt yêu cầu. Những điểm mentor cần kiểm:

- Tham số bắt buộc: `NS="${1:?Usage: inspect.sh NAMESPACE}"` làm script dừng và in thông báo nếu thiếu; cách khác là `if [ -z "$1" ]` rồi `exit 1`.
- Mọi lệnh `kubectl` đều có `-n "$NS"`, không dựa vào namespace của context.
- Phần (a) dùng `-o custom-columns`, phần (b) dùng jsonpath với `range` rồi `sort` và `uniq -c`, phần (c) dùng `--field-selector=status.phase!=Running`.
- Chạy thử `bash source/inspect.sh club` sau khi apply lại `demo-web`. Kết quả (b) phải đếm đúng số Pod dùng mỗi image; nếu trong lúc rolling update có hai image thì mỗi image một dòng.

**Thử thách 2 – phát hiện drift.** Trình tự đúng:

```bash
kubectl apply -f source/demo-web.yaml
kubectl scale deployment demo-web -n club --replicas=4
kubectl set image deployment/demo-web web=nginx:1.26-alpine -n club
kubectl diff -f source/demo-web.yaml | head -30
kubectl apply -f source/demo-web.yaml
kubectl diff -f source/demo-web.yaml && echo "no drift"
kubectl get deployment demo-web -n club -o yaml > source/exported.yaml
```

Điểm cần có: diff trước (thấy `replicas` và `image` lệch), diff sau (exit code 0, in `no drift`). Tên container là `web` nên vế trái của `set image` là `web=`. Ba gạch đầu dòng về trường nên bỏ trong `exported.yaml`:

- `status`: trạng thái thực tế do controller ghi, không phải mong muốn của bạn.
- `metadata.managedFields`, `uid`, `resourceVersion`, `creationTimestamp`: dữ liệu quản lý của API Server, đặc thù từng object; để lại sẽ gây xung đột hoặc làm manifest không tái dùng được ở cluster khác.
- Annotation sinh tự động (`deployment.kubernetes.io/revision`, `kubectl.kubernetes.io/last-applied-configuration`): không thuộc manifest gốc.

Lưu ý: `kubectl diff` trả exit code 1 khi có khác biệt, nên dùng được trong CI.

**Thử thách 3 – Deployment bí ẩn.** Lệnh `kubectl create deployment mystery --image=busybox:1.36 -n club-dev`:

- Triệu chứng: `get pods -n club-dev -w` thấy Pod đổi `Completed`, `CrashLoopBackOff`, `Running` rồi lặp, `RESTARTS` tăng.
- `describe pod`: mục `Last State: Terminated`, `Reason: Completed`, `Exit Code: 0`. `kubectl logs --previous` trống: container không in gì, không có lỗi.
- Nguyên nhân gốc: lệnh mặc định của busybox là `sh`; không có terminal nên shell thoát ngay với mã 0. Deployment muốn Pod chạy mãi, nên kubelet khởi động lại, rồi back-off tăng dần thành `CrashLoopBackOff`. Không phải lỗi image hay lỗi cluster; tiến trình chính kết thúc.
- Sửa: xóa Deployment và tạo lại với tiến trình sống lâu:

  ```bash
  kubectl delete deployment mystery -n club-dev
  kubectl create deployment mystery --image=busybox:1.36 -n club-dev -- sleep 3600
  kubectl get pods -n club-dev
  ```

  Pod `Running` và `RESTARTS` không tăng. Sửa đúng cách là đưa lệnh vào manifest (`command`), không tạo bằng lệnh.

#### Lời giải phần Phá lỗi / Debug – ImagePullBackOff

Phá: tạo `source/broken.yaml` bằng `sed` đổi tag thành `nginx:1.99-nope` rồi `kubectl apply -f source/broken.yaml`.

Cây điều tra:

1. `kubectl get pods -n club`: một Pod mới `ErrImagePull` rồi `ImagePullBackOff`, hai Pod cũ `Running`; `rollout status` treo ở "Waiting for deployment ... rollout to finish".
2. `kubectl describe pod` của Pod lỗi, đọc Events cuối: `Failed to pull image "nginx:1.99-nope"` kèm `not found` hoặc `manifest unknown`.
3. Xác nhận image trong spec: `kubectl get deployment demo-web -n club -o jsonpath='{.spec.template.spec.containers[0].image}'`.
4. `kubectl rollout history deployment/demo-web -n club`: có revision mới, xác nhận thay đổi đến từ lần apply vừa rồi.
5. Phân loại: tag không tồn tại (lỗi `not found`), registry không truy cập được (lỗi mạng hoặc timeout), image private thiếu credential (`unauthorized`). Ở đây là loại đầu.

Nguyên nhân gốc: tag `1.99-nope` không tồn tại trên registry nên kubelet không kéo được image, Pod mới không bao giờ Ready.

Khôi phục:

```bash
kubectl rollout undo deployment/demo-web -n club
kubectl apply -f source/demo-web.yaml
kubectl rollout status deployment/demo-web -n club
```

Vì sao cả hai lệnh: `undo` đưa cluster về revision trước ngay lập tức; `apply` đảm bảo cluster khớp lại với manifest trong Git (và nếu bạn đã sửa file lỗi vào `source/demo-web.yaml` thì phải sửa lại file cho đúng). Giải thích dịch vụ chưa sập: RollingUpdate mặc định giữ Pod cũ cho tới khi Pod mới Ready (với 2 replicas, `maxUnavailable` làm tròn xuống 0). Đó là may mắn do cấu hình mặc định, không phải lý do để bỏ qua `rollout status`.

Tình huống phụ: `kubectl get pods` khi context đặt namespace `default` báo `No resources found in default namespace.` vì kubectl chỉ nhìn namespace của context; workload nằm ở `club`. Kiểm tra bằng `kubectl config view --minify | grep namespace` và dùng `-n club`.

#### Những hiểu lầm hay gặp

- "Workload biến mất": thực ra sai namespace. Hoặc sai context nếu có nhiều cluster.
- Nhầm `apply` với `create`: `create` lỗi khi object đã tồn tại, `apply` tạo hoặc cập nhật theo manifest.
- `kubectl scale`, `set image`, `edit` sửa trạng thái live nhưng không sửa file; lần `apply` sau đưa cluster về như file (đáp án câu 7 mục dưới).
- Nghĩ `port-forward` thay được Service. Nó là đường hầm tạm tới một Pod, chỉ bind `127.0.0.1` (và `::1`), dùng để gỡ lỗi.
- Quên `-n` khi xem log hoặc `exec`, rồi báo `NotFound` cho Pod đang tồn tại.
- Dùng `bash` hoặc `curl` trong container alpine: image chỉ có `sh` và `wget` của busybox.
- Tin `kubectl get all` liệt kê tất cả: nó không gồm ConfigMap, Secret, Ingress.
- jsonpath trả rỗng vì dùng `.items` cho một object có tên, hoặc không đặt trong nháy đơn.
- `kubectl logs` báo `container ... is waiting to start`: container chưa chạy; xem Events, và `--previous` nếu đã crash.

#### Đáp án câu tự kiểm tra của buổi 23

Lab đã có đáp án 8 câu trong `details`. Mentor cần nghe được các ý chính: kubeconfig gồm cluster, user, context và current-context; kubectl chỉ xem namespace của context; `apply` khai báo còn `create` báo lỗi nếu trùng; `port-forward` không thay Service; `--previous` cho log lần chạy trước và `-l app=demo-web --prefix` cho nhiều Pod; ImagePullBackOff thì `get`, `describe` Events, kiểm tra tag, rồi credential; `scale` live bị manifest ghi đè; lệnh jsonpath với `range`, `metadata.name` và `status.podIP`.

### Buổi 24 – Kubernetes Services

#### Đáp án các nhiệm vụ L1

Chuẩn bị: `kubectl config set-context --current --namespace=club`, các Pod `postgres-0`, `club-api-*` (2), `club-web-*` (1) đều `1/1 Running`.

1. Service `backend` chọn Pod nào:

   ```bash
   kubectl get svc backend -o yaml
   kubectl get pods --show-labels
   kubectl describe svc backend
   ```

   Selector `app: club-api` khớp label `app=club-api` của hai Pod API; `port: 3000`, `targetPort: 3000`; `describe` liệt kê hai địa chỉ `10.244.x.x:3000` trong `Endpoints`. Selector là liên kết duy nhất giữa Service và Pod, không có tên Deployment.

2. Phân giải DNS từ Pod debug:

   ```bash
   kubectl run debug --rm -it --restart=Never --image=busybox:1.36 -- sh
   nslookup backend
   nslookup backend.club
   nslookup backend.club.svc.cluster.local
   cat /etc/resolv.conf
   wget -qO- http://backend:3000/health
   wget -qO- http://backend:3000/api/members
   ```

   Cả ba tên trả cùng một ClusterIP. `resolv.conf` có dòng `search club.svc.cluster.local svc.cluster.local cluster.local` và `nameserver` là IP của CoreDNS. Tên ngắn `backend` được mở rộng nhờ search domain của namespace `club`. `/health` trả `{"status":"healthy","service":"club-api"}`; `/api/members` trả mảng JSON thành viên.

3. Frontend qua Service và `port-forward`:

   ```bash
   kubectl exec deploy/club-web -- wget -qO- http://backend:3000/health
   kubectl port-forward svc/club-web 8081:80
   curl -s http://localhost:8081/api/members
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/
   ```

   Lệnh `exec` chứng minh đúng đường mà `proxy_pass http://backend:3000` đi. Mã `200` và JSON thành viên đi qua Nginx rồi tới API chứng minh chuỗi frontend, Service, backend, Postgres hoạt động.

4. NodePort và LoadBalancer thử nghiệm:

   ```bash
   kubectl expose deployment club-web --name=club-web-np --type=NodePort --port=80 --target-port=80
   kubectl expose deployment club-web --name=club-web-lb --type=LoadBalancer --port=80 --target-port=80
   kubectl get svc club-web-np club-web-lb
   kubectl delete svc club-web-np club-web-lb
   ```

   NodePort hiện `80:3xxxx/TCP`; LoadBalancer có `EXTERNAL-IP` là `<pending>` mãi mãi vì kind không có cloud provider cấp load balancer. Cổng NodePort nằm trên container node của kind, không tự mở ra máy host (cần `extraPortMappings` khi tạo cluster).

#### Lời giải L2

**Thử thách 1 – Service viết tay.** Manifest cần đúng ba thứ: tên `backend-lab`, selector `app: club-api`, cặp `port: 8080` và `targetPort: 3000` (lời giải trong lab đạt yêu cầu). Kiểm tra:

```bash
kubectl apply --dry-run=client -f source/backend-svc-lab.yaml
kubectl apply -f source/backend-svc-lab.yaml
kubectl get endpoints backend-lab
kubectl run debug --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- http://backend-lab:8080/health
```

Endpoints phải có hai địa chỉ cổng 3000 (không phải 8080). Giải thích: client gọi cổng của Service (8080), kube-proxy chuyển tới `targetPort` 3000, là cổng process Node.js thật sự nghe; `port` là giao diện công khai, `targetPort` là chi tiết bên trong Pod, nên có thể đổi một bên mà không sửa bên kia. Nếu `targetPort` sai, Endpoints vẫn có địa chỉ nhưng kết nối bị từ chối.

**Thử thách 2 – chéo namespace.** Trong Pod debug ở namespace `lab24`: `wget -qO- http://backend:3000/health` lỗi `bad address 'backend'`, còn `http://backend.club:3000/health` chạy được. Lý do: search domain của Pod chỉ gồm namespace của chính nó (`lab24.svc.cluster.local`, ...), nên tên ngắn tìm trong `lab24` và không thấy; thêm namespace làm tên thành `backend.club.svc.cluster.local` sau khi mở rộng. Dọn: `kubectl delete namespace lab24`.

**Thử thách 3 – Endpoints rỗng:** xem phần Phá lỗi ngay dưới.

#### Lời giải phần Phá lỗi / Debug – Service không có Endpoints

Phá: `kubectl patch svc backend -p '{"spec":{"selector":{"app":"club-apii"}}}'`.

Triệu chứng: `kubectl get endpoints backend` cho `<none>`; qua `port-forward` tới `club-web` thì `/api/members` trả 502; mọi Pod vẫn `Running` và Deployment khỏe, nên `kubectl get pods` không có gì bất thường. Lý do 502: DNS vẫn phân giải `backend` ra ClusterIP nhưng không có Pod nào đứng sau, kết nối tới ClusterIP bị từ chối, Nginx nhận lỗi upstream và trả 502.

Cây điều tra, từ ngoài vào trong:

1. Gọi từ trong cluster (Pod debug): `nslookup backend` vẫn ra IP, còn `wget http://backend:3000/health` lỗi kết nối. Kết luận: Service tồn tại, vấn đề nằm phía sau Service (không phải DNS, không phải frontend).
2. `kubectl get endpoints backend`: `<none>`; Service không có nơi nào để gửi traffic.
3. `kubectl describe svc backend`: dòng `Selector: app=club-apii`.
4. `kubectl get pods --show-labels`: label thật là `app=club-api`. Hai bên lệch nhau.
5. Xác nhận: `kubectl get pods -l app=club-apii` trả `No resources found`.
6. Loại trừ nguyên nhân khác: nếu selector đúng mà Endpoints vẫn rỗng thì kiểm tra Pod có `READY 1/1` không (readiness probe fail cũng loại Pod khỏi Endpoints); nếu Endpoints có địa chỉ mà vẫn lỗi thì xem `targetPort` và log API.

Nguyên nhân gốc: selector của Service không khớp label của Pod.

Sửa: `kubectl patch svc backend -p '{"spec":{"selector":{"app":"club-api"}}}'`, rồi `kubectl get endpoints backend` (hai địa chỉ cổng 3000) và `curl` trả `200`. Vì `patch` chỉ đổi live, hãy bảo đảm manifest `k8s/backend.yaml` đúng và `kubectl diff -f` sạch.

Phòng tránh: chạy `kubectl get endpoints` ngay sau khi apply Service; giữ label và selector trong cùng manifest; dùng tên label thống nhất.

Tình huống phụ `targetPort` sai (3001): Endpoints vẫn có địa chỉ `10.244.x.x:3001` nhưng `wget` báo `Connection refused`. Cách phân biệt với selector sai: Endpoints không rỗng nhưng cổng sai. Khôi phục `kubectl patch svc backend -p '{"spec":{"ports":[{"port":3000,"targetPort":3000}]}}'`.

#### Những hiểu lầm hay gặp

- "Pod `Running` thì Service chạy": Service chỉ nhận Pod khớp selector và `Ready`.
- Nhầm `port`, `targetPort`, `containerPort` và `nodePort`. `containerPort` chủ yếu để tài liệu hóa, không ép buộc gì.
- Cho rằng Service chạy một process hoặc "cân bằng tải" bằng pod nào đó: thực chất là luật mạng do kube-proxy cài trên mỗi node.
- Gọi `backend` từ namespace khác rồi kết luận Service hỏng.
- Mong đợi `localhost:NodePort` mở được trong kind, hoặc đợi `EXTERNAL-IP` của LoadBalancer.
- Bỏ qua Pod chưa Ready khi Endpoints thiếu địa chỉ: Pod bị loại, không bị restart (restart là việc của liveness probe).
- Dùng `kubectl get endpoints` ở Kubernetes 1.33 trở lên và hoảng vì cảnh báo `v1 Endpoints is deprecated`: đó là cảnh báo, dùng `kubectl get endpointslices -l kubernetes.io/service-name=backend` nếu muốn.
- `port-forward` báo `address already in use` vì cổng 8080 hoặc 8081 đang bận: đổi cổng local.

### Bài tập tuần

Các tên cố định trong [đề](../../assignments/weekly/week-12.md): namespace `club-dev`, Deployment và Service `notice-board`, cổng local `8082`.

#### Gợi ý lời giải các nhiệm vụ L1

**Nhiệm vụ 1 – manifest.** `lab-23/source/namespace.yaml` tạo `club-dev`. `lab-23/source/notice-board.yaml` có các điểm bắt buộc sau (khung tối thiểu, học viên phải tự viết, không chép của `demo-web`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notice-board
  namespace: club-dev
spec:
  replicas: 3
  selector:
    matchLabels:
      app: notice-board
      tier: web
  template:
    metadata:
      labels:
        app: notice-board
        tier: web
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 25m
              memory: 32Mi
            limits:
              memory: 64Mi
          readinessProbe:
            httpGet:
              path: /
              port: 80
```

Thứ tự: `kubectl diff -f lab-23/source/`, rồi `kubectl apply -f lab-23/source/`, rồi `kubectl rollout status deployment/notice-board -n club-dev`. Một lệnh `apply -f` cả thư mục chạy được vì `namespace.yaml` đứng trước `notice-board.yaml` theo thứ tự chữ cái; nếu tên file làm namespace đứng sau, lần apply đầu sẽ lỗi `namespaces "club-dev" not found` và phải apply lại lần hai. Apply lần hai phải in `unchanged` cho cả hai object. Các điểm kiểm: `READY 3/3`, `kubectl get pods -n club-dev -l app=notice-board,tier=web` đúng 3 Pod `Running`, `selector.matchLabels` là tập con của label trong template.

**Nhiệm vụ 2 – quan sát.** `inspect.txt` gồm bốn khối, mỗi khối có dòng `$ lệnh` đứng trước:

```bash
kubectl get pods -n club-dev -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount
kubectl get deployment notice-board -n club-dev -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
kubectl get pods -n club-dev --sort-by=.metadata.creationTimestamp
kubectl describe pod -n club-dev -l app=notice-board | sed -n '/Events:/,$p' | head -6
```

Lệnh cuối chỉ minh họa, miễn là có đúng ba dòng sự kiện đầu của một Pod. Với `describe pod -l`, output gộp nhiều Pod; chấp nhận nếu học viên chọn một Pod cụ thể bằng tên. Sau đó `kubectl port-forward deployment/notice-board 8082:80 -n club-dev`, `curl -sI http://localhost:8082`, rồi lấy log bằng `kubectl logs -n club-dev -l app=notice-board --prefix --tail=20 | grep -v kube-probe`. Vì `port-forward` chỉ tới một Pod, học viên phải xem log của cả ba Pod để tìm dòng `HEAD / ... 200`. Đoạn giải thích: `port-forward` mở đường hầm qua API Server tới một Pod cụ thể, nên không cần Service; nó chỉ bind `127.0.0.1` và dùng để gỡ lỗi.

**Nhiệm vụ 3 – Deployment kẹt.** Bản sao đặt trong `lab-23/source/broken/` để `kubectl apply -f lab-23/source/` (không có `-R`) không vô tình áp dụng nó. Học viên chọn tag riêng (ví dụ `nginx:1.27-doesnotexist`). Với 3 replicas, `maxSurge` 25% làm tròn lên 1 và `maxUnavailable` làm tròn xuống 0: một Pod mới bị kẹt `ErrImagePull` hoặc `ImagePullBackOff`, ba Pod cũ vẫn `Running`, nên dịch vụ chưa sập. Điều tra và khôi phục như phần Phá lỗi của buổi 23: `get pods`, `describe pod` Events, jsonpath xem image, `rollout history`, rồi `rollout undo` và `apply -f lab-23/source/notice-board.yaml`. Kết thúc: `kubectl diff -f lab-23/source/notice-board.yaml` không còn khác biệt và Deployment `3/3`.

**Nhiệm vụ 4 – Service và DNS.** Manifest:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notice-board
  namespace: club-dev
spec:
  type: ClusterIP
  selector:
    app: notice-board
    tier: web
  ports:
    - port: 8080
      targetPort: 80
```

Kiểm tra: `kubectl get endpoints notice-board -n club-dev` có đúng 3 địa chỉ cổng `80` (không phải 8080); Pod debug `busybox:1.36` trong `club-dev` phân giải ba tên về cùng một ClusterIP trùng cột `CLUSTER-IP` của `kubectl get svc notice-board -n club-dev`; `wget -qO- http://notice-board:8080` trả trang nginx; `port-forward svc/notice-board 8082:8080` rồi `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8082` ra `200`. Giải thích ba cổng bằng chính file: `containerPort: 80` khai báo nginx nghe cổng 80; `targetPort: 80` là cổng trên Pod nhận traffic từ Service; `port: 8080` là cổng client gọi vào Service.

**Nhiệm vụ 5 – Endpoints rỗng.** Học viên chọn selector sai riêng (ví dụ `app: notice-boardd`). Cần ba lần `get endpoints` (bình thường có 3 địa chỉ, lúc lỗi `<none>`, sau sửa lại 3 địa chỉ), `get pods` cho thấy 3 Pod vẫn `1/1 Running`, so sánh `describe svc` với `get pods --show-labels` hoặc `get pods -l`. Nguyên nhân gốc: selector không khớp nhãn Pod. Sửa bằng cách sửa file `notice-board-svc.yaml` rồi `kubectl apply -f`; nếu dùng `patch` để khôi phục nhanh thì vẫn phải sửa file và chạy `kubectl diff -f` sạch. Biện pháp phòng tránh cụ thể: chạy `kubectl get endpoints` ngay sau mỗi lần apply Service, hoặc thêm bước kiểm tra Endpoints không rỗng vào script triển khai.

#### Gợi ý lời giải L2

- Thử thách A (`check-service.sh`): nhận hai tham số (namespace, Service), kiểm tra thiếu tham số thì `exit 2` với thông báo cách dùng; Service không tồn tại thì `exit 1`; lấy selector, `targetPort` (jsonpath) và số địa chỉ Ready (từ jsonpath của Endpoints, hoặc đếm trong `endpointslices`); Endpoints bằng 0 thì `exit 1`; ngược lại `exit 0`. Bằng chứng có ba lần chạy kèm `echo $?`: khỏe (0), selector sai (khác 0), Service không tồn tại (khác 0). Script không hard-code tên.
- Thử thách B: giống thử thách 2 của buổi 24 với namespace `lab24-x`; `notice-board` lỗi, `notice-board.club-dev` chạy được; chèn `cat /etc/resolv.conf` có dòng `search lab24-x.svc.cluster.local ...`; dọn `kubectl delete namespace lab24-x`.
- Thử thách C: Service thứ hai có `targetPort` sai (ví dụ 8081) cho `get endpoints` có địa chỉ cổng sai và `wget` từ Pod debug báo `Connection refused`; lỗi selector cho `<none>` và `wget` cũng lỗi nhưng khác nhau ở bước `get endpoints`. Lệnh phân biệt: `get endpoints` (rỗng hay không) rồi so cổng trong Endpoints với cổng container thật. Vì sao Endpoints không rỗng: selector vẫn khớp Pod Ready, Kubernetes không kiểm tra cổng `targetPort` có process nghe hay không.

#### Đáp án 5 câu hỏi kiểm tra

1. Hai nguyên nhân khả dĩ: sai namespace (kubectl chỉ nhìn namespace của context, mặc định `default`) và sai context (đang ở cluster khác). Kiểm tra bằng `kubectl config current-context`, `kubectl config view --minify | grep namespace`, rồi `kubectl get pods -A` hoặc `-n club-dev`.
2. `kubectl scale` chỉ sửa trạng thái live, manifest vẫn ghi giá trị cũ; lần `kubectl apply -f` tiếp theo đưa cluster về đúng file. Quy tắc: manifest trong Git là nguồn sự thật; dùng lệnh imperative để thử hoặc khắc phục khẩn, sau đó phải sửa file và `apply`.
3. Rolling update tạo Pod mới trước và chỉ xóa Pod cũ khi Pod mới Ready. Pod mới sai tag không bao giờ Ready nên Pod cũ vẫn phục vụ (với `maxUnavailable` bằng 0 sau làm tròn).
4. Service liên kết với Pod bằng label selector; Pod mất `Ready` (readiness probe fail) bị loại khỏi Endpoints, Service ngừng gửi traffic tới nó nhưng Pod không bị restart (đó là việc của liveness probe).
5. Dùng `notice-board.club-dev` hoặc FQDN `notice-board.club-dev.svc.cluster.local`. Tên ngắn không đủ vì search domain của Pod chỉ chứa namespace của chính Pod đó (`lab24-x.svc.cluster.local`), nên `notice-board` được tìm trong sai namespace.

### Hướng dẫn chấm cho mentor

Tổng 100 điểm theo barem trong đề, cộng tối đa 10 điểm L2.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| NV1: manifest và rollout (15) | `get deployment` 3/3; `get pods -l app=notice-board,tier=web` 3 Pod; `apply` lần hai `unchanged`; manifest có probe, resources, đúng nhãn | Manifest giống `demo-web.yaml` chỉ đổi tên, vẫn `namespace: club`; thiếu `tier: web`; không có bằng chứng `unchanged` | Idempotent là gì? Vì sao `selector` phải khớp nhãn template? Nếu bỏ readinessProbe thì rollout khác gì? |
| NV2: quan sát và truy cập (15) | `inspect.txt` 4 phần, lệnh đứng trước kết quả; jsonpath chỉ in chuỗi image; `port-forward` cổng 8082; dòng log request `200` | Tên Pod hoặc IP trong `inspect.txt` không khớp với `get pods`; log không có `HEAD` hoặc `GET` do curl; dùng cổng 8080 | Vì sao log chỉ ở một trong ba Pod? Vì sao phải lọc `kube-probe`? Khi nào dùng `-o jsonpath` thay cho `-o yaml`? |
| NV3: điều tra image sai (15) | `ErrImagePull` hoặc `ImagePullBackOff`; Events `Failed to pull image` với tag của học viên; Pod cũ `Running`; `diff` sạch sau khôi phục; file lỗi trong `broken/` | Dùng đúng `nginx:1.99-nope` của lab; chỉ ghi "sai tag"; bỏ bước sửa Git; `undo` nhưng manifest vẫn còn tag lỗi | Vì sao dịch vụ chưa sập? Nếu `maxUnavailable` là 100% thì sao? Vì sao đặt file lỗi ở `broken/`? |
| NV4: Service và DNS (20) | `get endpoints` 3 địa chỉ cổng 80; `nslookup` ba tên cùng ClusterIP khớp `get svc`; `wget` nội dung nginx; `curl` 200 qua `svc/notice-board 8082:8080` | `targetPort: 8080`; ClusterIP trong nslookup khác `get svc` (bài ghép từ nhiều lần chạy); giải thích ba cổng chung chung | Gọi `notice-board:80` có được không và vì sao? ClusterIP có tồn tại trên node nào không? Điều gì đổi khi Pod bị tạo lại? |
| NV5: Endpoints rỗng (20) | Ba lần `get endpoints` (3, `<none>`, 3); Pod `1/1` lúc lỗi; so sánh selector với nhãn; file `notice-board-svc.yaml` đã sửa; `diff` sạch | Dùng lại selector `club-apii` của lab; sửa bằng `patch` mà file còn sai; thiếu bước từ ngoài vào trong | Vì sao Nginx hoặc client nhận lỗi dù Pod `Running`? Selector đúng nhưng Endpoints vẫn rỗng thì kiểm tra gì? Phân biệt với `targetPort` sai thế nào? |
| Chất lượng nộp bài (10) | README đủ 7 câu, đúng cấu trúc, chạy lại được, không secret, PR có review | Thiếu mục, `~/.kube/config` trong repo (trừ toàn bộ phần này) | Chạy lại từ đầu cần những lệnh nào theo thứ tự? |
| Câu hỏi kiến thức (5) | 5 câu trả lời ngắn có lý do ở cuối `lab-24/report.md` | Chép nguyên đề hoặc đáp án lab; sai khái niệm (ví dụ cho rằng Pod fail readiness bị restart) | Bảo học viên giải thích lại câu 4 bằng ví dụ khác |

Gợi ý chấm nhanh:

- Đối chiếu ClusterIP, tên Pod và IP giữa các file evidence: những giá trị này phải nhất quán trong cùng một lần làm; không nhất quán là dấu hiệu bài ghép hoặc tự gõ.
- Kiểm tra `kubectl diff` sạch: học viên có thể chạy lại trên máy của mình với repo đã nộp (mentor chạy `kubectl diff -f lab-23/source/notice-board.yaml` nếu có cluster).
- Điểm L2 chỉ tính khi L1 từ 70: thử thách A cần ba lần chạy kèm mã thoát; thử thách B cần cả lần thất bại và thành công kèm `resolv.conf`; thử thách C cần bảng so sánh có lệnh thật.
- Lưu ý khi chấm bài làm trong `source/`: nếu `exported.yaml` hay file lỗi nằm cạnh `notice-board.yaml`, thì `kubectl apply -f lab-23/source/` sẽ áp dụng cả chúng; đây là một lý do đề yêu cầu `broken/`.
