# Slide buổi 22 – Pods & Deployments

> **Tóm tắt:** Buổi học trình bày vòng đời Pod, ReplicaSet và Deployment, sau đó triển khai Club API lên kind, thực hiện rolling update, rollback và chẩn đoán `ImagePullBackOff`. Lệnh lab nằm ở bài học, slide chỉ giữ khung.

Bài học: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md)

## Mục tiêu của buổi 22

![Ba mục tiêu: deploy bằng Deployment, rolling update và rollback, chẩn đoán ImagePullBackOff](/slides/img/s22-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích quan hệ Deployment, ReplicaSet, Pod; viết manifest với labels, selector, resources, probes; build image, `kind load docker-image`, apply, kiểm tra qua `kubectl port-forward`.
:::

---

## Bài toán thực tế: Compose trên một laptop

![Container chết không ai biết, muốn 2 bản phải tự sửa, cập nhật làm API sập](/slides/img/s22-problem.svg)

::: details Ghi chú cho mentor
- Mỗi việc trên đều do con người thực hiện thủ công.
- Kubernetes cho phép khai báo: "luôn có 2 bản `club-api:1.0.0`, mỗi bản phải qua readiness probe mới nhận traffic".
:::

---

## Khái niệm: Pod

![Pod gồm container chung IP gọi nhau qua localhost; Pod bị xóa thì Pod mới có IP khác](/slides/img/s22-pod.svg)

- **Pod** là đơn vị nhỏ nhất có thể triển khai trong Kubernetes, gồm một hoặc nhiều container dùng chung địa chỉ IP.
- Ví dụ trong dự án: mỗi Pod `club-api` thường chứa một container chính chạy image `club-api:1.0.0`.

::: details Ghi chú cho mentor
- Pod là đơn vị nhỏ nhất được triển khai: một hoặc nhiều container chung IP. Thông thường mỗi Pod có một container chính.
- Pod có tính tạm thời: khi bị xóa, Pod thay thế là một đối tượng mới với IP khác.
- Ví dụ so sánh: Pod giống một ca làm việc, khi ca kết thúc thì không tiếp tục.
:::

---

## Phase của Pod

![Pending, Running, rồi Succeeded hoặc Failed; Unknown khi mất liên lạc node](/slides/img/s22-lifecycle.svg)

::: details Ghi chú cho mentor
- Pending: đã được chấp nhận, chưa có container chạy (chờ node hoặc tải image). Running: đã gán node, ít nhất một container đang chạy.
- Succeeded: mọi container thoát với exit code 0 (thường gặp ở Job). Failed: mọi container đã kết thúc và có container thất bại. Unknown: mất liên lạc với node.
- `ImagePullBackOff` và `CrashLoopBackOff` là trạng thái của container, không phải phase của Pod.
:::

---

## Khái niệm: ReplicaSet và Deployment

![Deployment quản lý ReplicaSet, ReplicaSet giữ 2 Pod, Service chọn Pod theo label](/slides/img/s22-ownership.svg)

- **ReplicaSet** giữ đúng số Pod khớp một selector; **Deployment** quản lý ReplicaSet, bổ sung rolling update và rollback.
- Ví dụ trong dự án: Deployment `club-api` giữ 2 Pod qua một ReplicaSet.

::: details Ghi chú cho mentor
- ReplicaSet giữ đúng N Pod khớp một selector; thiếu thì tạo, thừa thì xóa. Deployment bổ sung rolling update và rollback.
- Khi đổi image, Deployment tạo ReplicaSet mới và giữ ReplicaSet cũ với 0 Pod để có thể rollback.
- Pod trần: không tự tạo lại, không rolling update, không rollback. ReplicaSet: tự tạo lại nhưng không rolling update. Deployment: có cả ba khả năng.
- Ví dụ so sánh: ReplicaSet giống tổ trưởng giữ đủ nhân sự, Deployment giống quản lý ca.
:::

---

## Khái niệm: Label và selector

![Selector khớp label của Pod thì chạy, lệch thì API Server từ chối](/slides/img/s22-labels.svg)

- **Label** là cặp `key=value` gắn lên một đối tượng, còn **selector** chọn các đối tượng theo label.
- Ví dụ trong dự án: `spec.selector.matchLabels` phải khớp `spec.template.metadata.labels`, nếu không manifest bị từ chối.

::: details Ghi chú cho mentor
- Label là cặp key=value gắn lên đối tượng; selector chọn đối tượng theo label. Đây là cách Kubernetes nối các đối tượng với nhau, ví dụ Deployment với Pod và Service với Pod.
- Nếu hai trường trên không khớp, API Server từ chối manifest.
- `spec.selector.matchLabels` phải khớp `spec.template.metadata.labels`; selector của Deployment không sửa được sau khi tạo.
:::

---

## Khái niệm: Rolling update và readiness probe

![Bốn bước thay 2 Pod 1.0.0 bằng 2 Pod 1.0.1, luôn có 2 Pod Ready](/slides/img/s22-rolling.svg)

- **Rolling update** thay Pod cũ bằng Pod mới theo từng bước; **readiness probe** cho biết Pod sẵn sàng nhận traffic.
- Ví dụ trong dự án: với 2 replicas, thay 1.0.0 bằng 1.0.1 luôn giữ 2 Pod Ready.

::: details Ghi chú cho mentor
- Rolling update thay Pod cũ theo từng bước nên ứng dụng không ngừng phục vụ; readiness probe là kiểm tra định kỳ để Kubernetes biết Pod sẵn sàng nhận traffic.
- Mặc định `maxSurge: 25%`, `maxUnavailable: 25%`. Với 2 replicas: surge làm tròn lên thành 1, unavailable làm tròn xuống thành 0.
- Tối đa 3 Pod tồn tại, tối thiểu 2 Pod Ready.
- Nếu không có readiness probe thì Pod được coi là Ready ngay khi container khởi động.
:::

---

## Ba lệnh cập nhật và quay lui

```text
$ kubectl set image deployment/club-api api=club-api:1.0.1 -n club
$ kubectl rollout status deployment/club-api -n club
deployment "club-api" successfully rolled out
$ kubectl rollout undo deployment/club-api -n club
```

Lệnh `undo` dùng lại ReplicaSet cũ, không tạo ReplicaSet mới.

::: details Ghi chú cho mentor
- Quan sát hai ReplicaSet bằng `kubectl get replicaset -n club -l app=club-api`: bản 1.0.1 có 2 Pod, bản 1.0.0 có 0 Pod.
- `kubectl rollout history` hiển thị REVISION 1 và 2.
:::

---

## kind không thấy image của Docker Desktop

![kind load docker-image nạp club-api:1.0.0 vào node club-control-plane](/slides/img/s22-kind-image.svg)

::: details Ghi chú cho mentor
- Node kind là container có runtime riêng, không thấy image của Docker Desktop. Image phải được nạp bằng `kind load docker-image ... --name club`.
- Tag cố định `1.0.0` kèm `imagePullPolicy: IfNotPresent` thì dùng image đã nạp. Tránh dùng `latest` vì chính sách mặc định khi đó là `Always`.
- Thiếu bước nạp là nguyên nhân hàng đầu của `ImagePullBackOff`. Nếu quên `--name club` thì image được nạp nhầm cluster.
:::

---

## Minh họa: Pod trần và Deployment

```text
$ kubectl delete pod <pod-tran>
pod "<pod-tran>" deleted            # không quay lại
$ kubectl delete pod <pod-club-api> -n club
$ kubectl get pods -n club -l app=club-api -w
# ReplicaSet tạo Pod thay thế
```

Pod trần không có controller sở hữu, do đó không có thành phần nào tạo lại nó.

::: details Ghi chú cho mentor
- Tạo Pod trần rồi xóa: Pod không quay lại. Tạo Deployment 3 replicas rồi xóa một Pod: ReplicaSet tạo Pod thay thế.
- Quan sát chuỗi sở hữu Deployment, ReplicaSet, Pod.
- Câu hỏi thảo luận: nếu đổi label của một Pod đang chạy thì ReplicaSet xử lý thế nào. Đáp án: Pod rời khỏi ReplicaSet và Service, ReplicaSet tạo Pod mới.
:::

---

## Lab: bốn phần chính

| Phần | Việc | Mốc |
| --- | --- | --- |
| 1, 2 | Build, nạp | `postgres-0` Running |
| 3 | Deploy | READY 2/2 |
| 4 | Update, rollback | Image 1.0.0 |

Lệnh chi tiết và bảng lỗi: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md).

::: details Ghi chú cho mentor
- Phần 1 và 2: build, nạp image; dựng namespace và Postgres; mốc là `postgres-0` ở trạng thái `1/1 Running`. Phần 3: Deploy Club API và dùng `port-forward`.
- Phần 4: rolling update lên 1.0.1, rồi rollback; mốc hoàn thành là hai ReplicaSet và image trở về 1.0.0.
:::

---

## Tình huống lỗi: ImagePullBackOff

![Pod mới ImagePullBackOff, hai Pod cũ vẫn Running; điều tra bằng describe và crictl rồi rollout undo](/slides/img/s22-imagepull.svg)

::: details Ghi chú cho mentor
- Triệu chứng: `rollout status` quá thời gian chờ, một Pod mới ở trạng thái `ImagePullBackOff`, hai Pod cũ vẫn `Running`.
- Điều tra: `get pods`, `describe pod` (mục Events), kiểm tra image trong node bằng `docker exec club-control-plane crictl images`.
- Nguyên nhân gốc: tag chưa được build và nạp vào node. Cách sửa: `rollout undo`, hoặc nạp image rồi chạy `rollout restart`.
:::

---

## Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `selector does not match template labels` | Sửa cho khớp |
| Pod `0/1 Running` | `kubectl logs`, kiểm tra Postgres |
| `/api/members` trả 500 | Chạy `init.sql` |
| `connection refused` | Sai context hoặc node đã dừng |

::: details Ghi chú cho mentor
- Nếu Deployment đã tồn tại thì xóa và tạo lại sau khi sửa selector.
- Pod không Ready: kiểm tra thêm Secret `club-secrets`.
- Lỗi 500: chạy `init.sql` bằng `kubectl exec` vào `postgres-0`.
- `connection refused` tới kubectl: sai context hoặc container node đã dừng.
- Lỗi `CreateContainerConfigError`: tạo Secret hoặc apply ConfigMap còn thiếu.
:::

---

## Tổng kết và nộp bài

![Ba điều cần nhớ: Deployment và labels, rolling update, nạp image vào kind](/slides/img/s22-recap.svg)

Nộp `lab-22/`: `README.md`, manifest trong `source/`, evidence, ảnh hai ReplicaSet, `report.md`; không commit mật khẩu.

::: details Ghi chú cho mentor
- Bộ công cụ vận hành: `rollout status`, `history`, `undo`; timeout là tín hiệu cảnh báo.
- Với kind: `docker build`, `kind load docker-image`, tag cố định.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Pods](https://kubernetes.io/docs/concepts/workloads/pods/): Pod là đơn vị nhỏ nhất và tạm thời.
- **Tài liệu chính thức:** [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/): scale, rolling update và rollback.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): cách viết manifest gọn, đúng chuẩn.
- **Best practice:** [Liveness, readiness and startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): để Kubernetes biết app có khỏe không.
- **Best practice:** [Resource management for containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/): đặt requests và limits cho CPU, RAM.
