# Buổi 28 – Kubernetes Operations

Tuần 14/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 28/32

[Slide](../../slides/07-operations/session-28.md) · [Bài tập tuần](../../assignments/weekly/week-14.md) · [Hub tuần](README.md)

> **Tóm tắt:** Vận hành workload trên Kubernetes: rollout, rollback, scale, đọc events, và chẩn đoán ImagePullBackOff, CrashLoopBackOff, Pending theo quy trình từ triệu chứng đến nguyên nhân gốc.

::: tip Buổi này bạn làm gì
- **Bạn sẽ tạo ra:** một Deployment `web` bạn tự nâng cấp, scale, rollback, cùng bằng chứng chẩn đoán ba lỗi (ImagePullBackOff, CrashLoopBackOff, Pending) do chính bạn gây ra và tự sửa.
- **Thời gian thật:** đọc 15 phút, lab bắt buộc 60 phút, thử thách làm ở nhà.
- **Cần chuẩn bị:**
  - [ ] Cluster kind `club` đang chạy, `kubectl config current-context` in `kind-club`; có Internet để kéo image `nginx` và `busybox`.
  - [ ] Đã làm [Buổi 27 – Storage & Ingress](session-27.md) (namespace `club` còn `club-api`, `postgres-0`).
  - [ ] Làm trong filesystem WSL (không dùng `/mnt/c`); xem [Hướng dẫn cài đặt](../../resources/setup-guide.md) và [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md).
- **Phải nộp:** `README.md` (7 câu của mẫu); `source/web.yaml`, `source/crash.yaml` (bản đã sửa); `evidence/command-output.txt` (history, describe, events, `logs --previous`); `report.md` (ít nhất hai sự cố theo mẫu 5 mục).
- **Đi nhanh:** Đọc > [Làm lab](#hands-on-lab) > [Gặp lỗi?](#gap-loi) > [Tự kiểm tra](#tu-kiem-tra) > [Nộp bài](#nop-bai). Kẹt? Nhảy tới [Gặp lỗi?](#gap-loi).

**Từ mới trong buổi** (xem [Thuật ngữ](../../resources/glossary.md)):
- [Deployment](../../resources/glossary.md): đối tượng quản lý các Pod giống nhau và cách cập nhật chúng.
- [ReplicaSet](../../resources/glossary.md): nhóm Pod cùng một phiên bản mà Deployment tạo ra.
- [rollout](../../resources/glossary.md): quá trình đổi dần Pod cũ sang Pod mới.
- [ImagePullBackOff](../../resources/glossary.md): kubelet không kéo được image.
- [CrashLoopBackOff](../../resources/glossary.md): container khởi động rồi thoát liên tục.
- [Events](../../resources/glossary.md): nhật ký sự kiện Kubernetes ghi lại, nơi chứa lý do thật của lỗi.
:::

## Vấn đề thực tế

Trước buổi demo CLB, một bạn đẩy bản `club-api` mới lên cluster. Năm phút sau trang web vẫn chạy nhưng bản mới không lên: `kubectl get pods` đầy chữ đỏ và cả nhóm chat "sập rồi". Người chưa có quy trình sẽ xóa Pod, apply lại, đổi lung tung cho tới khi "có vẻ ổn" mà không biết vì sao, nên lần sau lỗi quay lại. Vận hành là kỹ năng đọc bằng chứng theo thứ tự cố định: trạng thái, events, logs. Kubernetes luôn ghi lại lý do, nhưng nó nằm ở `describe` và events chứ không nằm ở dòng `STATUS`. Buổi này bạn tự phá ba loại lỗi phổ biến nhất, tự khôi phục và ghi lại bằng một báo cáo mà đồng đội đọc là hiểu.

## Khái niệm cốt lõi {#khai-niem}

**Rollout.** Khi bạn đổi `spec.template` của Deployment (image, env, probe), Deployment tạo một ReplicaSet mới và chuyển Pod dần từ ReplicaSet cũ sang mới. ReplicaSet cũ được giữ lại với 0 replica để làm điểm quay về (`rollout undo`). Chỉ đổi `replicas` (scale) thì không tạo revision mới. Ví von: thay từng nhân viên ca cũ bằng ca mới, người cũ chỉ ra về khi người mới đã đứng vững.

**An toàn nhưng dễ che lỗi.** Mặc định `maxSurge` là 25% (làm tròn lên) và `maxUnavailable` là 25% (làm tròn xuống). Với 3 replicas: tạo 1 Pod mới, chờ nó `Ready` rồi mới xóa 1 Pod cũ. Bản mới hỏng thì Pod cũ vẫn phục vụ, nên người dùng không thấy lỗi, và bạn cũng không thấy nếu quên chạy `rollout status`.

**Ba trạng thái lỗi kinh điển.**

| Trạng thái | Nghĩa là | Bằng chứng đầu tiên |
| --- | --- | --- |
| `ImagePullBackOff` | Kubelet không kéo được image (sai tên hoặc tag, image chưa nạp vào kind, cần đăng nhập) | `describe pod`, mục Events |
| `CrashLoopBackOff` | Container khởi động rồi thoát liên tục | `logs --previous` và `Last State` |
| `Pending` | Chưa có node nào được gán cho Pod (thiếu tài nguyên, PVC chưa bind) | Events `FailedScheduling` |

`BackOff` chỉ là thời gian chờ tăng dần giữa các lần thử (10s, 20s, 40s, tối đa 5 phút), không phải lỗi riêng; nguyên nhân thật nằm ở lần thất bại trước đó.

**Quy trình chẩn đoán.** Luôn theo thứ tự trạng thái, events, logs; không đoán mò, không xóa Pod rồi hy vọng. Ví von: bác sĩ xem triệu chứng, xét nghiệm, rồi mới kê đơn.

```mermaid
flowchart LR
    S["get pods: xem STATUS"] --> D["describe: đọc Events"]
    D --> L["logs --previous: lỗi ứng dụng"]
    L --> R["Xác định nguyên nhân gốc"]
    R --> F["Sửa hoặc rollback"]
    F --> V["Kiểm chứng và ghi report"]
```

::: details Tìm hiểu thêm (đọc sau)
Hai tham số khác của Deployment: `revisionHistoryLimit` (mặc định 10, số ReplicaSet cũ giữ để rollback) và `progressDeadlineSeconds` (mặc định 600; quá hạn thì rollout bị coi là thất bại, nên `rollout status` có thể treo lâu, hãy thêm `--timeout=60s`). Events chỉ được giữ khoảng 1 giờ, nên lưu output vào `evidence/` ngay khi chẩn đoán. Sơ đồ các bước của một rollout (lỗi ở bước nào thì ra trạng thái nào) và bộ công cụ chẩn đoán nằm ở [Buổi 28 – Thử thách nâng cao](session-28-challenge.md).
:::

## Hands-on lab (60 phút, bắt buộc) {#hands-on-lab}

Trên lớp, mentor demo trước; tự học thì làm thẳng phần này.

### Chuẩn bị (5 phút)

```bash
mkdir -p ~/devops-labs/lab-28/{source,screenshots,evidence}
cd ~/devops-labs/lab-28
export EV=$PWD/evidence/command-output.txt
kubectl config current-context
kubectl get nodes
kubectl create namespace ops-lab
kubectl config set-context --current --namespace=ops-lab
```

Kết quả mong đợi: `kind-club`, node `club-control-plane` `Ready`, rồi `namespace/ops-lab created`. Nếu `NotReady` hoặc lỗi kết nối, dừng lại và nhờ mentor. Từ giờ mọi lệnh chạy trong namespace `ops-lab`; lệnh quan trọng thì thêm `| tee -a "$EV"`.

Tạo `source/web.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: ops-lab
spec:
  replicas: 3
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
        - name: nginx
          image: nginx:1.26
          ports:
            - containerPort: 80
          resources:
            requests: {cpu: 50m, memory: 32Mi}
            limits: {memory: 64Mi}
```

### Phần 1. Triển khai và đọc history (8 phút)

```bash
kubectl apply -f source/web.yaml
kubectl rollout status deployment/web
kubectl annotate deployment/web kubernetes.io/change-cause="deploy nginx 1.26" --overwrite
kubectl rollout history deployment/web | tee -a "$EV"
```

Kết quả mong đợi: `deployment "web" successfully rolled out`, ba Pod `1/1 Running`, và history có một dòng `1  deploy nginx 1.26`.

Vì sao: `change-cause` là ghi chú cho con người; thiếu nó cột này là `none` và bạn không biết revision nào là gì khi cần rollback gấp.

::: tip Kiểm tra: bạn đúng khi
`kubectl get pods` có ba Pod `web-...` `Running` và `rollout history` có change-cause.
:::

### Phần 2. Rollout bản mới và scale (7 phút)

```bash
kubectl set image deployment/web nginx=nginx:1.27
kubectl annotate deployment/web kubernetes.io/change-cause="upgrade nginx 1.27" --overwrite
kubectl rollout status deployment/web
kubectl get rs | tee -a "$EV"
kubectl scale deployment/web --replicas=5
kubectl scale deployment/web --replicas=3
kubectl rollout history deployment/web | tee -a "$EV"
```

Kết quả mong đợi: `get rs` có hai ReplicaSet (một cái `DESIRED` bằng 0); history có đúng hai revision (`deploy nginx 1.26`, `upgrade nginx 1.27`) dù bạn đã scale hai lần.

Vì sao: scale chỉ đổi `replicas`, không đổi `spec.template`, nên không có revision mới. Cột `NAME` của ReplicaSet có hash khác máy bạn; điều cần khớp là cơ chế.

::: tip Kiểm tra: bạn đúng khi
Có hai ReplicaSet và đúng hai revision sau khi scale lên 5 rồi về 3.
:::

### Phần 3. Break 1: ImagePullBackOff, chẩn đoán và rollback (12 phút)

1. Phá: đặt tag sai (giả lập typo) và ghi lại ngay lý do thay đổi:

```bash
kubectl set image deployment/web nginx=nginx:1.27.999
kubectl annotate deployment/web kubernetes.io/change-cause="tag sai 1.27.999 (co y)" --overwrite
kubectl rollout status deployment/web --timeout=45s
kubectl get pods | tee -a "$EV"
```

Kết quả mong đợi: `error: timed out waiting for the condition`; ba Pod cũ `Running` cùng một Pod mới `0/1 ImagePullBackOff` (hoặc `ErrImagePull`).

2. Chẩn đoán: đọc Events của Pod lỗi (thay `TEN_POD_LOI` bằng tên thật):

```bash
kubectl describe pod TEN_POD_LOI | sed -n '/Events:/,$p' | tee -a "$EV"
```

Kết quả mong đợi (rút gọn): các dòng `Failed to pull image "nginx:1.27.999": ... not found`, `Error: ErrImagePull`, rồi `Error: ImagePullBackOff`. Hãy khoanh dòng chứa lý do. Nguyên nhân gốc: tag `1.27.999` không tồn tại trong registry. Câu chữ có thể khác theo container runtime; hãy tìm từ khóa `not found`, `manifest unknown`, `unauthorized`.

3. Khôi phục bằng rollback và xác nhận image:

```bash
kubectl rollout undo deployment/web
kubectl rollout status deployment/web
kubectl get deployment web -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}' | tee -a "$EV"
```

Kết quả mong đợi: `deployment.apps/web rolled back`, rồi `nginx:1.27`. Revision được đánh số lại: bản vừa quay về xuất hiện với số mới.

::: tip Kiểm tra: bạn đúng khi
Bạn chỉ ra được dòng event chứa lý do kéo image lỗi, và `jsonpath` in ra `nginx:1.27`. Kẹt thì xem [Gặp lỗi?](#gap-loi).
:::

### Phần 4. Break 2: CrashLoopBackOff (15 phút)

1. Tạo `source/crash.yaml`: container in log lỗi rồi thoát với mã 1.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crashy
  namespace: ops-lab
spec:
  replicas: 1
  selector:
    matchLabels: {app: crashy}
  template:
    metadata:
      labels: {app: crashy}
    spec:
      containers:
        - name: app
          image: busybox:1.36
          command: ["sh", "-c", "echo booting; echo 'FATAL: thieu bien DB_HOST' >&2; exit 1"]
```

2. Apply, theo dõi Pod (Ctrl+C sau khoảng 1 phút), rồi chẩn đoán theo thứ tự logs trước, exit code sau:

```bash
kubectl apply -f source/crash.yaml
kubectl get pods -l app=crashy -w
kubectl logs deploy/crashy --previous | tee -a "$EV"
kubectl describe pod -l app=crashy | grep -A6 "Last State" | tee -a "$EV"
```

Kết quả mong đợi: trạng thái đi từ `Error` sang `CrashLoopBackOff`; log có `booting` và `FATAL: thieu bien DB_HOST`; `Last State` là `Terminated`, `Reason: Error`, `Exit Code: 1`.

Nguyên nhân gốc: ứng dụng tự thoát mã 1 vì thiếu cấu hình; Kubernetes chỉ khởi động lại theo `restartPolicy: Always`. Gợi ý đọc exit code: 1 là lỗi ứng dụng chung, 137 là bị kill (xem `Reason`, thường là OOMKilled), 127 là lệnh không tồn tại.

3. Sửa nguyên nhân gốc: trong `source/crash.yaml`, thay dòng `command` cũ bằng đoạn dưới (cấp biến môi trường và giữ tiến trình chạy, thụt lề ngang với `image`), rồi apply:

```yaml
          env:
            - name: DB_HOST
              value: postgres
          command: ["sh", "-c", "echo \"DB_HOST=$DB_HOST\"; sleep 3600"]
```

```bash
kubectl apply -f source/crash.yaml
kubectl rollout status deployment/crashy
kubectl logs deploy/crashy | tee -a "$EV"
```

Kết quả mong đợi: `deployment "crashy" successfully rolled out` và log `DB_HOST=postgres`. Không dùng `rollout undo` ở đây vì revision 1 cũng hỏng: rollback chỉ cứu được khi có một bản tốt trước đó.

::: tip Kiểm tra: bạn đúng khi
Bạn có `logs --previous` hiện lỗi, thấy `Exit Code`, và `crashy` đã `Running` ổn định sau khi sửa.
:::

### Phần 5. Break 3: Pending (10 phút)

1. Phá: yêu cầu CPU vượt xa khả năng của node.

```bash
kubectl create deployment hungry --image=nginx:1.27 --replicas=1
kubectl rollout status deployment/hungry --timeout=60s
kubectl set resources deployment/hungry --requests=cpu=100
kubectl get pods -l app=hungry
```

Kết quả mong đợi: Pod cũ (chưa có request) vẫn `Running`, Pod mới từ template có request quá lớn bị `Pending`. Đây lại là rolling update che lỗi, giống Phần 3.

2. Chẩn đoán: Pod `Pending` chưa có container nên không có log; bằng chứng nằm ở events.

```bash
kubectl get events --field-selector reason=FailedScheduling | tee -a "$EV"
kubectl describe node | grep -A8 "Allocatable"
```

Kết quả mong đợi: `Warning FailedScheduling ... 0/1 nodes are available: 1 Insufficient cpu`. Nguyên nhân gốc: `requests.cpu` bằng 100 core trong khi node chỉ có vài core; scheduler dựa trên `requests`, không phải mức dùng thực tế.

3. Khôi phục và dọn dẹp:

```bash
kubectl set resources deployment/hungry --requests=cpu=100m
kubectl rollout status deployment/hungry
kubectl delete deployment hungry crashy
kubectl get deployment
```

Kết quả mong đợi: `deployment "hungry" successfully rolled out`, cuối cùng chỉ còn `web`.

::: tip Kiểm tra: bạn đúng khi
Bạn có dòng `FailedScheduling` trong evidence, `rollout status` của `hungry` báo thành công, và `crashy` với `hungry` đã được xóa.
:::

### Checklist L1

- [ ] Namespace `ops-lab`, Deployment `web` 3 replicas; `rollout history` có ít nhất 2 revision kèm change-cause.
- [ ] ImagePullBackOff: chỉ ra dòng event chứa lý do, rồi `rollout undo` thành công, image là `nginx:1.27`.
- [ ] CrashLoopBackOff: có thông báo lỗi từ `logs --previous` và exit code từ `describe`; bản sửa chạy ổn.
- [ ] Pending: có event `FailedScheduling` và đã sửa.
- [ ] Output các lệnh chẩn đoán đã lưu vào `evidence/command-output.txt`.

Tự kiểm tra một dòng (kỳ vọng chỉ còn `web`, image `nginx:1.27`):

```bash
kubectl get deployment -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.template.spec.containers[0].image}{"\n"}{end}'
```

Khi xong cả buổi, đặt lại namespace mặc định bằng `kubectl config set-context --current --namespace=default` để các buổi sau không chạy nhầm namespace.

## Gặp lỗi? {#gap-loi}

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `ImagePullBackOff` với image tự build trong kind | Image chỉ có trong Docker, chưa nạp vào node kind | `kind load docker-image TEN:TAG --name club`, và dùng `imagePullPolicy: IfNotPresent` |
| `ImagePullBackOff` với `unauthorized` | Image private chưa có imagePullSecret | Tạo Secret kiểu docker-registry và khai báo `imagePullSecrets` (không commit token) |
| `CrashLoopBackOff`, `logs` trống | Đang xem log của container mới khởi động lại | `kubectl logs TEN_POD --previous` |
| `CrashLoopBackOff` với exit code 137 | Vượt `limits.memory` (OOMKilled) hoặc bị hệ thống kill | Xem `Reason` trong Last State; tăng limit hoặc sửa rò rỉ bộ nhớ |
| `Pending` và `Insufficient cpu` hoặc `Insufficient memory` | `requests` lớn hơn phần còn trống của node | Giảm `requests`, hoặc thêm node |
| `Pending` với `unbound immediate PersistentVolumeClaims` | PVC chưa bind (sai StorageClass, hết dung lượng) | `kubectl get pvc`, `describe pvc`, sửa StorageClass |
| `Running` nhưng `READY 0/1`, không có restart | Readiness probe chưa đạt (ví dụ path sai) | `describe pod` đọc event `Readiness probe failed`, so path với route thật của ứng dụng |
| `rollout status` treo rất lâu | Mặc định chờ tới `progressDeadlineSeconds` | Thêm `--timeout=60s` khi thực hành |
| `rollout undo` xong nhưng lỗi quay lại ở lần deploy sau | Chỉ rollback, không sửa nguyên nhân gốc | Sửa nguồn gốc (tag, config) và ghi vào report |
| Lệnh chạy sai namespace, `No resources found` | Quên `set-context --current --namespace=ops-lab` | Chạy lại lệnh đó, hoặc thêm `-n ops-lab` |

## Tự kiểm tra {#tu-kiem-tra}

1. Vì sao khi rollout kẹt với 3 replicas, người dùng thường không thấy lỗi?
2. `kubectl logs` trống với Pod `CrashLoopBackOff`. Bạn làm gì tiếp, và `BackOff` là lỗi gì? Pod `Pending` có đọc được log không?
3. `kubectl scale` có tạo revision mới trong `rollout history` không?
4. Bạn deploy `club-api:1.0.1`, Pod mới `ImagePullBackOff`. Mô tả hai bước đầu tiên của bạn, và nêu một trường hợp `rollout undo` không giúp được.

::: details Đáp án gợi ý
1. `maxUnavailable` làm tròn xuống thành 0, nên Pod cũ chỉ bị xóa khi Pod mới `Ready`; các Pod cũ vẫn nhận traffic.
2. Chạy `kubectl logs TEN_POD --previous` để xem log lần chạy trước, và `describe` để xem exit code. `BackOff` không phải lỗi riêng, chỉ là thời gian chờ tăng dần giữa các lần khởi động lại; nguyên nhân là việc container thoát liên tục. Pod `Pending` không đọc được log vì container chưa được tạo; bằng chứng nằm ở events `FailedScheduling` trong `kubectl describe pod`.
3. Không. Chỉ thay đổi `spec.template` mới tạo revision.
4. Chạy `kubectl describe pod` đọc Events để lấy thông báo kéo image lỗi (tag không tồn tại, chưa nạp vào kind, unauthorized); kiểm tra tag đã build và `kind load` chưa; sau đó mới quyết định rollback hay sửa. `rollout undo` không giúp khi không có revision tốt trước đó (lần deploy đầu đã hỏng) hoặc lỗi nằm ngoài template (Secret, ConfigMap, dữ liệu).
:::

## Nộp bài {#nop-bai}

Nộp vào thư mục `lab-28/` trong repo `devops-labs` theo `templates/lab-template.md`. Bài tập tuần: [Bài tập tuần 14](../../assignments/weekly/week-14.md).

- [ ] `README.md` trả lời đủ 7 câu của mẫu và đánh dấu level đã làm (L1 hoặc L2).
- [ ] `source/` chứa `web.yaml`, `crash.yaml` (bản đã sửa) và mọi YAML bạn dùng.
- [ ] `evidence/command-output.txt` chứa output của `rollout history`, `describe`, `get events`, `logs --previous` cho từng sự cố.
- [ ] `report.md` có ít nhất hai sự cố theo mẫu 5 mục: Triệu chứng, Bằng chứng (kèm lệnh), Nguyên nhân gốc, Cách khắc phục (kèm cách kiểm chứng), Phòng tránh. Mẫu đầy đủ ở [Buổi 28 – Thử thách nâng cao](session-28-challenge.md#mau-report).
- [ ] `screenshots/` có ảnh trạng thái trước và sau khi khôi phục (không thay thế evidence dạng text).
- [ ] Không có secret, token, password thật trong bất kỳ file nào.

## Recap

- Rollout tạo ReplicaSet mới, ReplicaSet cũ giữ lại để `undo`; luôn chạy `rollout status` sau deploy vì Pod cũ che lỗi.
- Chẩn đoán theo thứ tự `get pods`, `describe` (Events), `logs --previous`, rồi mới sửa.
- Rollback cứu dịch vụ nhưng không thay việc tìm nguyên nhân gốc; ghi lại bằng report 5 mục.

Buổi tiếp theo: [Buổi 29 – Architecture & Planning](../week-15/session-29.md).

::: details Thử thách thêm (L2, tùy chọn, làm ở nhà)
Ba thử thách (ba tình huống `scenario-07`, `08`, `09` chỉ nhận triệu chứng; sự cố trên ứng dụng thật `club-api`; viết report) kèm tiêu chí hoàn thành và gợi ý nằm ở [Buổi 28 – Thử thách nâng cao](session-28-challenge.md). Hãy tự thử 15 phút trước khi mở gợi ý; đáp án chỉ ở phía mentor, đối chiếu bằng [Walkthrough tuần 14](../../mentors/walkthroughs/week-14.md) sau khi nộp bài.
:::

::: details Phá lỗi nâng cao
Tình huống tổng hợp "bản mới của API chết sau khi deploy": bạn cùng nhóm hoặc mentor phá giúp bạn, bạn chỉ nhận triệu chứng và tự điều tra. Xem [Buổi 28 – Thử thách nâng cao](session-28-challenge.md).
:::

::: details Tài liệu tham khảo
- [Deployments (rolling update, rollback)](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/) · [Pod lifecycle: container states và restart policy](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Images: pull policy và imagePullSecrets](https://kubernetes.io/docs/concepts/containers/images/) · [kubectl rollout](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/) · [kind: Loading an image into your cluster](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster)
:::
