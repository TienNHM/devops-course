# Buổi 22 – Thử thách thêm (L2)

Tuần 11/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 22/32

[Quay lại Buổi 22 – Pods & Deployments](session-22.md) · [Bài tập Tuần 11](../../assignments/weekly/week-11.md)

> **Tóm tắt:** Hai thử thách tùy chọn sau buổi 22: tự viết Deployment canary dùng chung Service backend, và kiểm soát rolling update bằng maxSurge và maxUnavailable với 4 replicas.

::: warning Trước khi làm
Cần xong phần lab bắt buộc ở [Buổi 22 – Pods & Deployments](session-22.md): cluster `club` đang chạy, `club-api` READY 2/2, image `club-api:1.0.1` đã nạp. Tự thử khoảng 15 phút trước khi mở gợi ý. Lời giải đầy đủ nằm ở [Walkthrough tuần 11](../../mentors/walkthroughs/week-11.md), mở sau khi nộp bài.
:::

## Thử thách 1. Tự viết Deployment canary

Không copy `k8s/backend.yaml`. Viết `lab-22/source/club-api-canary.yaml` tạo Deployment `club-api-canary` trong namespace `club`:

- 1 replica, image `club-api:1.0.1` (đã nạp ở Phần 4)
- label của Pod: `app: club-api` và `track: canary`; selector của Deployment chọn cả hai label
- lấy `DB_PASSWORD` từ Secret `club-secrets` và các biến còn lại từ ConfigMap `club-config`
- có readinessProbe `/ready`, resources requests và limits

Tiêu chí hoàn thành: Pod canary `1/1 Running`; `kubectl get endpointslices -n club -l kubernetes.io/service-name=backend -o wide` liệt kê 3 địa chỉ (2 Pod chính và 1 canary); bạn giải thích được vì sao Service `backend` tự nhận Pod canary mà không phải sửa Service.

::: details Gợi ý bậc 1: khung file
Pod template cần đủ cả hai label, selector `matchLabels` phải là tập con của label trong template. Khung gồm `apiVersion: apps/v1`, `kind: Deployment`, `metadata` (name, namespace), `spec.replicas`, `spec.selector`, `spec.template`.
:::

::: details Gợi ý bậc 2: phần container
Service `backend` chỉ chọn `app: club-api`, nên mọi Pod có label đó đều vào endpoint khi Ready. Phần `env`, `envFrom`, `readinessProbe` giống Deployment `club-api` gốc; copy từ `k8s/backend.yaml` là chấp nhận được sau khi bạn đã tự viết khung. Dùng `secretKeyRef` cho `DB_PASSWORD` (name `club-secrets`, key `db-password`) và `configMapRef` cho `club-config`.
:::

Kiểm tra và dọn dẹp:

```bash
kubectl apply -f lab-22/source/club-api-canary.yaml
kubectl rollout status deployment/club-api-canary -n club
kubectl get endpointslices -n club -l kubernetes.io/service-name=backend -o wide
kubectl delete deployment club-api-canary -n club
```

Lưu ý: Deployment chính `club-api` cũng có selector `app: club-api`, trùng một phần với label của Pod canary. Điều này an toàn vì Pod canary đã có owner là ReplicaSet của canary, nhưng là thực hành không tốt; trong dự án thật hãy thêm label phân biệt vào cả selector của Deployment chính.

## Thử thách 2. Kiểm soát rolling update

Thêm vào Deployment `club-api` khối `strategy` với `maxSurge: 1` và `maxUnavailable: 0`, cùng `revisionHistoryLimit: 3`. Đặt `replicas: 4`, rồi rolling update lên một tag mới và ghi lại số Pod tại mỗi thời điểm bằng `kubectl get pods -w`.

Tiêu chí hoàn thành: bạn giải thích bằng lời của mình vì sao tại mọi thời điểm có tối đa 5 Pod và tối thiểu 4 Pod Ready; sửa trực tiếp manifest rồi `kubectl apply`, không dùng `kubectl edit`.

::: details Gợi ý bậc 1: chỗ đặt khối strategy
`strategy` nằm cùng cấp với `replicas` và `selector` trong `spec` của Deployment:

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
:::

::: details Gợi ý bậc 2: cách làm an toàn
Chép `k8s/backend.yaml` thành `source/backend-l2.yaml`, sửa bản chép rồi `kubectl apply -f source/backend-l2.yaml` (selector không đổi nên apply an toàn). Để đổi image, sửa dòng `image:` trong file rồi apply lại; nếu dùng `kubectl set image` thì lần apply sau sẽ ghi đè về image trong file. Chạy `kubectl get pods -n club -l app=club-api -w | tee evidence/watch.txt` ở terminal khác trong lúc apply. Đếm: tối đa là `replicas + maxSurge`, tối thiểu sẵn sàng là `replicas - maxUnavailable`.
:::
