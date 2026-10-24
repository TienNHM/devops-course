# Kịch bản buổi 22 – Pods & Deployments

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md) và [Thử thách thêm](../../labs/week-11/session-22-challenge.md). Slide: [Slide buổi 22](../../slides/05-kubernetes/session-22.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 11](../grading/week-11.md). Đáp án: [Đáp án tuần 11](../walkthroughs/week-11.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 22: khung 120 phút, chuẩn bị trước buổi, demo Pod trần và Deployment, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Control plane gồm những gì, luồng `kubectl apply`; hôm nay là buổi đầu chạy ứng dụng thật trên cluster |
| 15-45 | Kiến thức và demo | Pod, ReplicaSet, Deployment, labels và selectors, rolling update, image trong kind, demo Pod trần và Deployment |
| 45-105 | Thực hành | Chuẩn bị 5', Phần 1 (build, nạp image) 8', Phần 2 (nền) 8', Phần 3 (deploy Club API) 10', Phần 4 (rolling update, rollback) 15', Phần 5 (ImagePullBackOff) 10' |
| 105-120 | Review | Hỏi nhanh ba lệnh đầu tiên khi rollout treo; thử thách canary nếu còn thời gian |

## Chuẩn bị trước buổi

- Môi trường: cluster `club`, context `kind-club` (tạo ở buổi 21). Học viên làm trong `~/devops-course/starter-project` của WSL. Ai chưa có cluster thì tạo bằng `kind create cluster --name club --config k8s/kind-config.yaml`.
- Máy 8 GB: tắt Compose (`docker compose down`) và xóa các cluster dư của buổi 21 (`club-3`, `club-lab`, `club-lab-3`).
- Mạng lớp yếu: chạy trước `docker pull nginx:1.27-alpine` rồi `kind load docker-image nginx:1.27-alpine --name club` cho phần demo.
- Cổng 80 và 443 của máy phải rảnh khi tạo cluster `club`.

## Kịch bản demo

Mục tiêu (khoảng 15 phút): cho cả lớp thấy Pod trần khác Deployment ở điểm nào. Dùng cluster kind `club` của mentor, namespace `club`, chạy trong thư mục `starter-project/`. Cần Internet để kéo `nginx:1.27-alpine`.

1. Tạo namespace và một Pod trần (file mẫu tương đương: `examples/kubernetes/01-pod.yaml`):

   ```bash
   kubectl apply -f k8s/namespace.yaml
   cat <<'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
     name: demo-nginx
     namespace: club
     labels:
       app: demo-nginx
   spec:
     containers:
       - name: nginx
         image: nginx:1.27-alpine
         ports:
           - containerPort: 80
   EOF
   kubectl get pod demo-nginx -n club -w
   ```

   Kết quả mong đợi (nhấn Ctrl+C sau khi Running):

   ```text
   NAME         READY   STATUS              RESTARTS   AGE
   demo-nginx   0/1     ContainerCreating   0          2s
   demo-nginx   1/1     Running             0          9s
   ```

   Hỏi lớp: "Pod đã Running, bây giờ tôi xóa nó. Ai nghĩ nó sẽ tự quay lại?"

2. Xóa Pod và cho lớp thấy nó không quay lại:

   ```bash
   kubectl delete pod demo-nginx -n club
   kubectl get pods -n club
   ```

   Kết quả mong đợi: `No resources found in club namespace.` Giải thích: không có controller nào sở hữu Pod này.

3. Tạo Deployment cùng image với 3 replicas, rồi xóa một Pod:

   ```bash
   kubectl create deployment demo-nginx --image=nginx:1.27-alpine --replicas=3 -n club
   kubectl get pods -n club -l app=demo-nginx
   POD=$(kubectl get pods -n club -l app=demo-nginx -o name | head -1)
   kubectl delete "$POD" -n club
   kubectl get pods -n club -l app=demo-nginx
   ```

   Kết quả mong đợi: sau khi xóa, danh sách vẫn có đủ 3 Pod, trong đó một Pod có AGE vài giây (Pod thay thế do ReplicaSet tạo).

4. Cho lớp xem chuỗi sở hữu:

   ```bash
   kubectl get deployment,replicaset,pod -n club -l app=demo-nginx
   kubectl get pod -n club -l app=demo-nginx -o jsonpath='{.items[0].metadata.ownerReferences[0].kind}'
   ```

   Kết quả mong đợi: một Deployment, một ReplicaSet có hậu tố hash, ba Pod; lệnh thứ hai in `ReplicaSet`.

5. Dọn dẹp:

   ```bash
   kubectl delete deployment demo-nginx -n club
   ```

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Nếu node chứa Pod chết hẳn thì Pod trần sống lại không? | Không, không có controller sở hữu nó. |
| Điều gì quyết định Pod nào thuộc ReplicaSet nào? | Selector khớp label của Pod. |
| Nếu sửa label của một Pod đang chạy thành `app=other`, ReplicaSet làm gì? | Pod đó bị "thả" khỏi ReplicaSet (và Service); ReplicaSet thấy thiếu nên tạo Pod mới. |
| Nếu bỏ readiness probe thì rủi ro gì khi rolling update? | Pod mới bị coi là Ready ngay khi container khởi động và nhận traffic quá sớm. |
| Sau `rollout undo`, ReplicaSet mới hay cũ được dùng lại? | Cũ. |
| Sau `kubectl set image` lên tag mới mà rollout treo, ba lệnh đầu tiên là gì? | `kubectl get pods`, `kubectl describe pod` (Events), `kubectl logs`. |

## Ghi chú theo slide

Slide buổi 22 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): nhắc lại buổi 21 trong phần ôn tập: control plane gồm những gì, luồng `kubectl apply`.
- Slide 2 – Vấn đề thực tế (3 phút): hỏi lớp việc nào trong số này nên để máy làm. Dẫn vào ý tưởng khai báo: "luôn có 2 bản `club-api:1.0.0` chạy, qua readiness probe mới nhận traffic".
- Slide 3 – Pod (2 phút): nhấn mạnh "tạm thời". Đừng hard-code IP của Pod.
- Slide 4 – Vòng đời Pod (3 phút): phân biệt phase (5 giá trị) với cột STATUS của `kubectl get pods` (nhiều giá trị chi tiết hơn). Sẽ gặp lại ở scenario 08 và 09.
- Slide 5 – ReplicaSet và Deployment (3 phút): ứng dụng stateless như Club API luôn dùng Deployment; Pod trần chỉ để thử nghiệm.
- Slide 6 – Labels và selectors (3 phút): hỏi nếu đổi label một Pod đang chạy thành `app=other` thì sao.
- Slide 7 – Kiến trúc Deployment (3 phút): đi từ trên xuống, liên hệ luồng 5 bước của buổi 21. Chỉ rõ Pod chỉ vào endpoint của Service sau khi readiness probe `/ready` trả 200.
- Slide 8 – Rolling update (4 phút): viết số lên bảng: 2 replicas, tối đa 3 Pod, tối thiểu 2 Ready. Hỏi nếu bỏ readiness probe thì rủi ro là gì.
- Slide 9 – Image trong kind (2 phút): ngoài đời thật image nằm ở registry (GHCR); `kind load` chỉ là cách học local.
- Slide 10 – Demo, Pod trần và Deployment (khoảng 10 phút theo kịch bản demo ở trên): trước khi xóa Pod, hỏi lớp ai nghĩ Pod sẽ tự quay lại. Cho lớp thấy chuỗi sở hữu Deployment, ReplicaSet, Pod. Nhớ dọn dẹp cuối demo.
- Slide 11 – Lab (khoảng 5 phút giới thiệu, thời gian từng phần xem bảng khung thời gian):
  - Phần 1: kiểm tra mọi người có `kubectl config current-context` là `kind-club`; ai còn cluster buổi 21 ngoài `club` thì xóa để giải phóng RAM.
  - Phần 2: giải thích ngắn: Secret và `init.sql` dạng ConfigMap volume học kỹ ở buổi 25; phần này chỉ dựng tối thiểu.
  - Phần 3: trước khi apply, cho học viên đọc `k8s/backend.yaml` và trả lời: label nào nối Deployment với Pod, probe nào chặn traffic, `DB_HOST` đến từ đâu. `port-forward` chỉ mở 127.0.0.1; nếu cổng 3000 bận thì đổi `3001:3000`.
  - Phần 4: chưa muốn sửa code thì dùng `docker tag club-api:1.0.0 club-api:1.0.1`. Sau `undo`, ReplicaSet cũ được dùng lại.
- Slide 12 – Phá lỗi, ImagePullBackOff (khoảng 10 phút): học viên chỉ nhận triệu chứng (scenario-07), chưa cho biết nguyên nhân; cho 3 phút để đoán. Coi `timed out` là tín hiệu phải điều tra, không phải đợi thêm. Quy trình debug cố định: get pods, describe (Events), logs. Phòng tránh: luôn `kind load` ngay sau `docker build`, dùng tag cố định, luôn `rollout status`.
- Slide 13 – Lỗi thường gặp (3 phút): chọn 2 dòng gắn với lỗi học viên đang gặp để giải thích sâu. Liên hệ scenario-10 (readiness probe fail) cho dòng `0/1 Running`.
- Slide 14 – Recap và nộp bài (review 15 phút cuối): hỏi nhanh ba lệnh đầu tiên khi rollout treo. Báo trước buổi sau: Service, mạng và Ingress trên cluster `club` đang chạy.

## Hỗ trợ phần thử thách

Thử thách nằm ở [Thử thách thêm](../../labs/week-11/session-22-challenge.md); đáp án đầy đủ ở [Đáp án tuần 11](../walkthroughs/week-11.md).

- Thử thách 1 (Deployment canary): selector là tập con của label trong template; Service chỉ chọn `app: club-api`, nên Pod canary vào endpoint khi Ready. Học viên L1 chỉ cần xem mẫu. Dọn dẹp bằng `kubectl delete deployment club-api-canary -n club`.
- Thử thách 2 (kiểm soát rolling update): với `replicas: 4`, `maxSurge: 1`, `maxUnavailable: 0` thì tối đa 5 Pod (replicas cộng surge) và tối thiểu 4 Pod Ready (replicas trừ unavailable).

## Lưu ý riêng cho người dạy

- Tình huống ImagePullBackOff tương ứng `examples/troubleshooting/scenario-07/`. Trong bài học viên, tình huống được tái hiện bằng `kubectl set image` sang tag `1.0.9` chưa từng nạp.
- `port-forward` gắn chặt vào một Pod cụ thể: sau rolling update hoặc rollback, nhắc học viên chạy lại `port-forward` trước khi `curl`, nếu không sẽ thấy "không có thay đổi" dù rollout thành công.
- Nếu học viên tạo cluster đúng tên `club` nhưng bằng cấu hình khác (không có `extraPortMappings`), lab buổi 22 vẫn chạy; chỉ buổi Ingress (tuần 12) mới cần cổng 80 và 443.
