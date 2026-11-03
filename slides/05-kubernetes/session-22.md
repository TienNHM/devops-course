# Slide buổi 22 – Pods & Deployments

> **Tóm tắt:** Vòng đời Pod, ReplicaSet, Deployment; deploy Club API lên kind, rolling update, rollback và chẩn đoán ImagePullBackOff. Lệnh lab nằm ở bài học, slide chỉ giữ khung.

Bài học: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md)

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: deploy bằng Deployment, rolling update và rollback, chẩn đoán ImagePullBackOff](/slides/img/s22-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích quan hệ Deployment, ReplicaSet, Pod; viết manifest với labels, selector, resources, probes; build image, `kind load docker-image`, apply, kiểm tra qua `kubectl port-forward`.
:::

---

## Slide 2: Compose trên laptop một bạn

![Container chết không ai biết, muốn 2 bản phải tự sửa, cập nhật làm API sập](/slides/img/s22-problem.svg)

::: details Ghi chú cho mentor
- Mỗi việc đó đều do con người làm bằng tay.
- Kubernetes cho bạn khai báo: "luôn có 2 bản `club-api:1.0.0`, mỗi bản phải qua readiness probe mới nhận traffic".
:::

---

## Slide 3: Pod: nhỏ nhất nhưng tạm thời

![Pod gồm container chung IP gọi nhau qua localhost; Pod bị xóa thì Pod mới có IP khác](/slides/img/s22-pod.svg)

::: details Ghi chú cho mentor
- Pod là đơn vị nhỏ nhất bạn triển khai: một hoặc nhiều container chung IP. Thường mỗi Pod một container chính.
- Ví von: một nhân viên ca làm việc, nghỉ là hết ca.
:::

---

## Slide 4: Phase của Pod

![Pending, Running, rồi Succeeded hoặc Failed; Unknown khi mất liên lạc node](/slides/img/s22-lifecycle.svg)

::: details Ghi chú cho mentor
- Pending: đã nhận, chưa có container chạy (chờ node hoặc pull image). Running: đã gán node, ít nhất một container đang chạy.
- Succeeded: mọi container exit code 0 (thường là Job). Failed: mọi container kết thúc, có container thất bại. Unknown: mất liên lạc với node.
- `ImagePullBackOff`, `CrashLoopBackOff` là trạng thái container, không phải phase.
:::

---

## Slide 5: Deployment nuôi ReplicaSet, ReplicaSet nuôi Pod

![Deployment quản lý ReplicaSet, ReplicaSet giữ 2 Pod, Service chọn Pod theo label](/slides/img/s22-ownership.svg)

Đổi image: Deployment tạo ReplicaSet mới, ReplicaSet cũ giữ lại với 0 Pod để rollback.

::: details Ghi chú cho mentor
- ReplicaSet giữ đúng N Pod khớp một selector; thiếu thì tạo, thừa thì xóa. Deployment thêm rolling update và rollback.
- Pod trần: không tự tạo lại, không rolling update, không rollback. ReplicaSet: tự tạo lại nhưng không rolling update. Deployment: có cả ba.
- Ví von: ReplicaSet là tổ trưởng giữ đủ người; Deployment là quản lý ca.
:::

---

## Slide 6: Label và selector nối các object

![Selector khớp label của Pod thì chạy, lệch thì API Server từ chối](/slides/img/s22-labels.svg)

::: details Ghi chú cho mentor
- Label là cặp key=value gắn lên object; selector chọn object theo label. Đây là cách duy nhất Kubernetes nối các object với nhau.
- `spec.selector.matchLabels` phải khớp `spec.template.metadata.labels`; selector của Deployment không sửa được sau khi tạo.
:::

---

## Slide 7: Rolling update: thay Pod từng bước

![Bốn bước thay 2 Pod 1.0.0 bằng 2 Pod 1.0.1, luôn có 2 Pod Ready](/slides/img/s22-rolling.svg)

::: details Ghi chú cho mentor
- Mặc định `maxSurge: 25%`, `maxUnavailable: 25%`. Với 2 replicas: surge làm tròn lên thành 1, unavailable làm tròn xuống thành 0.
- Tối đa 3 Pod tồn tại, tối thiểu 2 Pod Ready.
- Không có readiness probe thì Pod bị coi là Ready ngay khi container khởi động.
:::

---

## Slide 8: Ba lệnh cập nhật và quay lui

```text
$ kubectl set image deployment/club-api api=club-api:1.0.1 -n club
$ kubectl rollout status deployment/club-api -n club
deployment "club-api" successfully rolled out
$ kubectl rollout undo deployment/club-api -n club
```

`undo` dùng lại ReplicaSet cũ, không tạo cái mới.

::: details Ghi chú cho mentor
- Xem hai ReplicaSet bằng `kubectl get replicaset -n club -l app=club-api`: bản 1.0.1 có 2 Pod, bản 1.0.0 có 0 Pod.
- `kubectl rollout history` có REVISION 1 và 2.
:::

---

## Slide 9: kind không thấy image của Docker Desktop

![kind load docker-image nạp club-api:1.0.0 vào node club-control-plane](/slides/img/s22-kind-image.svg)

::: details Ghi chú cho mentor
- Node kind là container có runtime riêng, không thấy image của Docker Desktop. Phải nạp bằng `kind load docker-image ... --name club`.
- Tag cố định `1.0.0` kèm `imagePullPolicy: IfNotPresent` thì dùng image đã nạp. Tránh `latest`: chính sách mặc định là `Always`.
- Thiếu bước nạp là nguyên nhân hàng đầu của ImagePullBackOff. Quên `--name club` thì image vào nhầm cluster.
:::

---

## Slide 10: Demo: Pod trần và Deployment

```text
$ kubectl delete pod <pod-tran>
pod "<pod-tran>" deleted            # không quay lại
$ kubectl delete pod <pod-club-api> -n club
$ kubectl get pods -n club -l app=club-api -w
# ReplicaSet tạo Pod thay thế
```

Pod trần không có controller sở hữu, nên không ai tạo lại nó.

::: details Ghi chú cho mentor
- Tạo Pod trần, xóa nó: không quay lại. Tạo Deployment 3 replicas, xóa một Pod: ReplicaSet tạo Pod thay thế.
- Cho thấy chuỗi sở hữu Deployment, ReplicaSet, Pod.
- Câu hỏi: đổi label một Pod đang chạy thì ReplicaSet làm gì? (Pod rời ReplicaSet và Service, ReplicaSet tạo Pod mới.)
:::

---

## Slide 11: Lab: bốn phần chính

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 và 2 | Build, nạp image; dựng namespace, Postgres | `postgres-0` `1/1 Running` |
| 3 | Deploy Club API, `port-forward` | Deployment READY 2/2 |
| 4 | Rolling update lên 1.0.1, rồi rollback | Hai ReplicaSet; image về 1.0.0 |

Lệnh chi tiết và bảng lỗi: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md).

---

## Slide 12: Break: ImagePullBackOff

![Pod mới ImagePullBackOff, hai Pod cũ vẫn Running; điều tra bằng describe và crictl rồi rollout undo](/slides/img/s22-imagepull.svg)

::: details Ghi chú cho mentor
- Triệu chứng: `rollout status` timeout, một Pod mới `ImagePullBackOff`, hai Pod cũ vẫn `Running`.
- Điều tra: `get pods`, `describe pod` (Events), kiểm tra image trong node bằng `docker exec club-control-plane crictl images`.
- Nguyên nhân gốc: tag chưa được build và nạp vào node. Sửa: `rollout undo`, hoặc nạp image rồi `rollout restart`.
:::

---

## Slide 13: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `selector does not match template labels` | Sửa cho khớp; Deployment đã tồn tại thì xóa và tạo lại |
| Pod `0/1 Running` không Ready | `kubectl logs`, kiểm tra Postgres và Secret `club-secrets` |
| `/api/members` trả 500 | Chạy `init.sql` bằng `kubectl exec` vào `postgres-0` |
| `connection refused` tới kubectl | Sai context hoặc container node đã dừng |

::: details Ghi chú cho mentor
- Còn `CreateContainerConfigError`: tạo Secret hoặc apply ConfigMap còn thiếu.
:::

---

## Slide 14: Recap và nộp bài

![Ba điều cần nhớ: Deployment và labels, rolling update, nạp image vào kind](/slides/img/s22-recap.svg)

Nộp `lab-22/`: `README.md`, manifest trong `source/`, evidence, ảnh hai ReplicaSet, `report.md`; không commit mật khẩu.

::: details Ghi chú cho mentor
- Bộ công cụ vận hành: `rollout status`, `history`, `undo`; timeout là lời cảnh báo.
- Với kind: `docker build`, `kind load docker-image`, tag cố định.
:::
