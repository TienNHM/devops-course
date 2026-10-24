# Kịch bản mentor – Buổi 22: Pods & Deployments

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md). Slide: [Slide buổi 22](../../slides/05-kubernetes/session-22.md). Đáp án và barem: [Walkthrough tuần 11](../walkthroughs/week-11.md), [Chấm điểm tuần 11](../grading/week-11.md).
:::

## Khung thời gian buổi (120 phút)

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian gợi ý cho phần thực hành của buổi 22: chuẩn bị 5', Phần 1 (build, nạp image) 8', Phần 2 (nền) 8', Phần 3 (deploy Club API) 10', Phần 4 (rolling update, rollback) 15', Phần 5 (ImagePullBackOff) 10'. Thử thách L2 nằm ở trang riêng, làm ở nhà hoặc trong 15' review nếu còn thời gian.

## Chuẩn bị trước buổi

- Môi trường chốt: cluster `club`, context `kind-club` (tạo ở buổi 21). Học viên làm trong `~/devops-course/starter-project` của WSL. Ai chưa có cluster thì tạo bằng `kind create cluster --name club --config k8s/kind-config.yaml`.
- Máy 8 GB: nhắc tắt Compose (`docker compose down`) trước khi dựng kind; xóa các cluster dư của buổi 21 (`club-3`, `club-lab`, `club-lab-3`).
- Mạng lớp yếu: chạy trước `docker pull nginx:1.27-alpine` rồi `kind load docker-image nginx:1.27-alpine --name club` cho phần demo.
- Cổng 80 và 443 của máy phải rảnh khi tạo cluster `club`.

## Demo của mentor

Mục đích: cho cả lớp thấy Pod trần khác Deployment ở điểm nào. Dùng cluster kind `club` của mentor, namespace `club`, chạy trong thư mục `starter-project/`. Cần Internet để kéo `nginx:1.27-alpine` (nếu mạng lớp yếu, chạy trước `docker pull nginx:1.27-alpine` rồi `kind load docker-image nginx:1.27-alpine --name club`). Thời gian khoảng 15 phút.

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

Câu hỏi cho lớp: (a) Nếu node chứa Pod chết hẳn thì Pod trần sống lại không? (b) Điều gì quyết định Pod nào thuộc ReplicaSet nào? (c) Nếu tôi sửa label của một Pod đang chạy thành `app=other`, ReplicaSet làm gì? (Đáp: Pod đó bị "thả" khỏi ReplicaSet, ReplicaSet thấy thiếu nên tạo Pod mới.)

## Ghi chú giảng viên theo slide

Số slide theo [slide buổi 22](../../slides/05-kubernetes/session-22.md).

- Slide 1 (Mục tiêu): Nhắc lại buổi 21 trong 15 phút ôn tập: control plane gồm những gì, luồng `kubectl apply`. Hôm nay là buổi đầu tiên chạy ứng dụng thật trên cluster.
- Slide 2 (Vấn đề thực tế): Hỏi lớp: việc nào trong số này nên để máy làm. Dẫn vào ý tưởng khai báo: "luôn có 2 bản `club-api:1.0.0` chạy, qua readiness probe mới nhận traffic". 3 phút.
- Slide 3 (Pod): Nhấn mạnh "tạm thời". Đừng hard-code IP của Pod. 2 phút.
- Slide 4 (Vòng đời Pod): Phân biệt phase (5 giá trị) với cột STATUS của `kubectl get pods` (nhiều giá trị chi tiết hơn). Sẽ gặp lại ở các scenario 08, 09. 3 phút.
- Slide 5 (ReplicaSet và Deployment): Quy tắc: ứng dụng stateless như Club API luôn dùng Deployment; Pod trần chỉ để thử nghiệm. 3 phút.
- Slide 6 (Labels và selectors): Câu hỏi: nếu tôi đổi label một Pod đang chạy thành `app=other` thì sao (Pod rời ReplicaSet và Service, ReplicaSet tạo Pod mới). 3 phút.
- Slide 7 (Kiến trúc Deployment): Đi từ trên xuống, liên hệ luồng 5 bước của buổi 21. Chỉ rõ Pod chỉ vào endpoint của Service sau khi readiness probe `/ready` trả 200. 3 phút.
- Slide 8 (Rolling update): Viết số lên bảng: 2 replicas, tối đa 3 Pod, tối thiểu 2 Ready. Hỏi: nếu bỏ readiness probe thì rủi ro là gì. 4 phút.
- Slide 9 (Image trong kind): Ngoài đời thật image nằm ở registry (GHCR); `kind load` chỉ là cách học local. 2 phút.
- Slide 10 (Demo Pod trần): Trước khi xóa, hỏi lớp: ai nghĩ Pod sẽ tự quay lại. Cluster `club` của mentor tạo từ `starter-project/k8s/kind-config.yaml`. 4 phút.
- Slide 11 (Demo Deployment tự chữa lành): Cho lớp thấy chuỗi sở hữu: Deployment, ReplicaSet, Pod (có thể in `ownerReferences[0].kind` ra `ReplicaSet`). Nhớ dọn dẹp cuối demo. 5 phút.
- Slide 12 (Lab: build và nạp image): Kiểm tra mọi người có `kubectl config current-context` là `kind-club`. Ai còn cluster buổi 21 (ngoài `club`) thì xóa trước để giải phóng RAM. 8 phút.
- Slide 13 (Lab: nền): Giải thích ngắn: Secret học kỹ ở buổi 25, init.sql dạng ConfigMap volume cũng để buổi 25. Phần này chỉ dựng tối thiểu. 8 phút.
- Slide 14 (Lab: deploy Club API): Trước khi apply, cho học viên đọc `k8s/backend.yaml` và trả lời: label nào nối Deployment với Pod, probe nào chặn traffic, `DB_HOST` đến từ đâu. Lưu ý port-forward chỉ mở 127.0.0.1. Nếu cổng 3000 bận thì đổi `3001:3000`. 10 phút.
- Slide 15 (Lab: rolling update và rollback): Chưa muốn sửa code thì dùng `docker tag club-api:1.0.0 club-api:1.0.1`. Câu hỏi: sau `undo`, ReplicaSet mới hay cũ được dùng lại (cũ). 12 phút.
- Slide 16 (Phá lỗi ImagePullBackOff): Học viên chỉ nhận triệu chứng (scenario-07), chưa cho biết nguyên nhân. Cho 3 phút để đoán. Nhấn: coi `timed out` là tín hiệu phải điều tra, không phải đợi thêm. 5 phút.
- Slide 17 (Điều tra và sửa): Quy trình debug cố định: get pods, describe (Events), logs. Phòng tránh: luôn `kind load` ngay sau `docker build`, dùng tag cố định, luôn `rollout status`. 5 phút.
- Slide 18 (Lỗi thường gặp): Chọn 2 dòng gắn với lỗi học viên đang gặp trong lớp để giải thích sâu. Liên hệ scenario-10 (readiness probe fail) cho dòng thứ hai. 3 phút.
- Slide 19 (Thử thách L2): Gợi ý: selector là tập con của label trong template; Service chỉ chọn `app: club-api`. Đáp án thử thách 2: replicas cộng surge bằng 5, replicas trừ unavailable bằng 4. Học viên L1 chỉ cần xem mẫu. Dọn dẹp bằng `kubectl delete deployment club-api-canary -n club`.
- Slide 20 (Recap và nộp bài): Hỏi nhanh: sau `kubectl set image` lên tag mới mà rollout treo, ba lệnh đầu tiên là gì. Báo trước buổi sau: Service, mạng và Ingress với cluster `club` đang chạy.

## Lưu ý riêng cho người dạy

- Tình huống ImagePullBackOff tương ứng `examples/troubleshooting/scenario-07/` (mentor phát cho học viên; học viên chỉ nhận triệu chứng). Trong bài học viên, tình huống được tái hiện bằng `kubectl set image` sang tag `1.0.9` chưa từng nạp.
- Đáp án chi tiết của thử thách canary và rolling update có kiểm soát nằm trong [Walkthrough tuần 11](../walkthroughs/week-11.md); trang học viên chỉ có phần thử thách trong [Buổi 22 – Thử thách thêm](../../labs/week-11/session-22-challenge.md).
- `port-forward` gắn chặt vào một Pod cụ thể: sau rolling update hoặc rollback, nhắc học viên chạy lại `port-forward` trước khi `curl`, nếu không sẽ thấy "không có thay đổi" dù rollout thành công.
- Nếu học viên tạo cluster đúng tên `club` nhưng bằng cấu hình khác (không có `extraPortMappings`), lab buổi 22 vẫn chạy; chỉ buổi Ingress (tuần 12) mới cần cổng 80 và 443.
