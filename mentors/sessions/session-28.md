# Kịch bản buổi 28 – Kubernetes Operations

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md). Thử thách thêm: [Buổi 28 – Thử thách nâng cao](../../labs/week-14/session-28-challenge.md). Slide: [Slide buổi 28](../../slides/07-operations/session-28.md). Đáp án và chấm điểm: [Đáp án tuần 14](../walkthroughs/week-14.md), [Hướng dẫn chấm tuần 14](../grading/week-14.md).
:::

> **Tóm tắt:** Kịch bản buổi 28: demo rollout và rollback, câu hỏi cho lớp, ghi chú theo từng slide, cách dựng tình huống tổng hợp, đáp án các tình huống 07, 08, 09 và lưu ý riêng.

## Khung thời gian

Buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành và review bài làm.

Phần 30 phút kiến thức và demo: mở đầu 2', vấn đề thực tế 2', rollout 2', `maxSurge` và `maxUnavailable` 3', ba trạng thái lỗi 3', bộ công cụ 2', kiến trúc rollout 3', quy trình chẩn đoán 2'; demo khoảng 11'.

| Phần của lab | Thời lượng |
| --- | --- |
| Chuẩn bị | 5' |
| Phần 1 – Triển khai và đọc history | 8' |
| Phần 2 – Rollout bản mới và scale | 7' |
| Phần 3 – Break 1: ImagePullBackOff | 12' |
| Phần 4 – Break 2: CrashLoopBackOff | 15' |
| Phần 5 – Break 3: Pending | 10' |
| Checklist L1 và dọn dẹp | 3' |

Thử thách L2 (ba tình huống `scenario-07`, `08`, `09`, sự cố trên `club-api` thật, viết report) là bài làm ở nhà.

## Kịch bản buổi

### Demo của mentor (khoảng 11 phút)

Mentor làm trong namespace riêng `ops-demo` để không đụng workload của học viên. Mỗi bước dừng lại hỏi lớp.

1. Tạo Deployment 3 replicas và quan sát rollout:

```bash
kubectl create namespace ops-demo
kubectl create deployment web --image=nginx:1.26 --replicas=3 -n ops-demo
kubectl rollout status deployment/web -n ops-demo
```

```text
deployment "web" successfully rolled out
```

Hỏi lớp: "Phía sau lệnh này có những object nào được tạo?" (Deployment, ReplicaSet, 3 Pod.) Lỗi hay gặp: gõ sai tên container trong `set image` (ở đây là `nginx`).

2. Cập nhật image và xem hai ReplicaSet:

```bash
kubectl set image deployment/web nginx=nginx:1.27 -n ops-demo
kubectl rollout status deployment/web -n ops-demo
kubectl get rs -n ops-demo
```

```text
NAME             DESIRED   CURRENT   READY   AGE
web-5d9f8c7b6    3         3         3       10s
web-7c6b4f9d8    0         0         0       2m
```

Tên ReplicaSet trên máy bạn sẽ khác. Hỏi lớp: "Vì sao ReplicaSet cũ vẫn còn?" (Làm điểm rollback.)

3. Cố tình đặt tag không tồn tại:

```bash
kubectl set image deployment/web nginx=nginx:1.27-khong-ton-tai -n ops-demo
kubectl rollout status deployment/web -n ops-demo --timeout=45s
kubectl get pods -n ops-demo
```

```text
Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...
error: timed out waiting for the condition
NAME                   READY   STATUS             RESTARTS   AGE
web-5d9f8c7b6-aaaaa    1/1     Running            0          2m
web-5d9f8c7b6-bbbbb    1/1     Running            0          2m
web-5d9f8c7b6-ccccc    1/1     Running            0          2m
web-6f7d9b5c4-ddddd    0/1     ImagePullBackOff   0          45s
```

Hỏi lớp: "Người dùng có thấy lỗi không?" (Không: 3 Pod cũ vẫn phục vụ. Lỗi im lặng nếu không theo dõi rollout.)

4. Đọc nguyên nhân rồi rollback:

```bash
kubectl get events -n ops-demo --field-selector type=Warning --sort-by=.lastTimestamp
kubectl rollout undo deployment/web -n ops-demo
kubectl rollout status deployment/web -n ops-demo
```

Hỏi lớp: "Rollback xong là hết việc chưa?" (Chưa: cần tìm vì sao tag sai lọt vào, ví dụ typo, và phòng tránh.)

5. Dọn dẹp: `kubectl delete namespace ops-demo`.

### Câu hỏi cho lớp

1. Đầu buổi: "Sự cố xảy ra, bạn sẽ làm gì đầu tiên?" Ghi đáp án lên bảng, cuối buổi so với quy trình chuẩn ở slide 7.
2. "Phía sau lệnh `create deployment` có những object nào?" (Deployment, ReplicaSet, 3 Pod.)
3. "Vì sao ReplicaSet cũ không bị xóa?" (Để rollback.)
4. "Với 2 replicas, `maxUnavailable` là bao nhiêu?" (25% của 2 làm tròn xuống thành 0.)
5. "BackOff là lỗi gì?" (Không phải lỗi, chỉ là chờ.)
6. "Lỗi ở nút nào của sơ đồ rollout thì ra trạng thái nào?" (Nút C: Pending. Nút D: ImagePullBackOff hoặc CrashLoopBackOff. Nút E: Running nhưng 0/1.)
7. "Người dùng có thấy lỗi khi rollout kẹt không?" (Không.)
8. "Sau hai lần scale, history có mấy revision?" (Vẫn 2, vì chỉ đổi `spec.template` mới tạo revision.)
9. "Scheduler dựa trên request hay mức dùng thực tế?" (Request.)
10. Cuối buổi: "Khi nào `rollout undo` không giúp được?" (Không có revision tốt trước đó, hoặc lỗi nằm ngoài template như Secret, ConfigMap.)

## Ghi chú theo slide

Slide buổi 28 có 14 slide.

### Slide 1: Mục tiêu buổi học

2 phút. Nhấn: buổi này là buổi "đọc bằng chứng", không phải buổi thuộc lệnh. Học viên sẽ tự phá ba lỗi rồi tự sửa.

### Slide 2: Vấn đề thực tế

2 phút. Hỏi lớp: "Bạn sẽ làm gì đầu tiên?" Ghi các đáp án lên bảng, cuối buổi so với quy trình chuẩn.

### Slide 3: Rollout là thay ReplicaSet

5 phút cho cả bảng tham số. Câu hỏi: "Vì sao ReplicaSet cũ không bị xóa?" và "Với 2 replicas, maxUnavailable là bao nhiêu?" (25% của 2 làm tròn xuống thành 0.)

### Slide 4: Ba trạng thái lỗi kinh điển

3 phút. Nhấn: dòng STATUS chỉ là triệu chứng, lý do nằm ở `describe` và events. Câu hỏi: "BackOff là lỗi gì?" (Không phải lỗi, chỉ là chờ.)

### Slide 5: Bộ công cụ chẩn đoán

2 phút. Thay `TEN_POD` bằng tên thật khi gõ lệnh. Nhắc học viên dùng `tee -a evidence/command-output.txt`; Events chỉ giữ khoảng 1 giờ.

### Slide 6: Kiến trúc rollout

3 phút. Chỉ vào từng nút và hỏi: lỗi ở nút nào thì ra trạng thái nào? (Nút C: Pending. Nút D: ImagePullBackOff hoặc CrashLoopBackOff. Nút E: Running nhưng 0/1.)

### Slide 7: Quy trình chẩn đoán chuẩn

2 phút. So với danh sách đáp án lớp đưa ra ở slide 2. Đây là khung dùng cho cả buổi.

### Slide 8: Demo 1 – deploy và nâng cấp

Bước 1 và 2 của demo (4 phút). Chạy `rollout status` sau lần tạo đầu để chờ Pod sẵn sàng. Hỏi: "Phía sau lệnh create có những object nào?"

### Slide 9: Demo 2 – tag sai, lỗi im lặng

Bước 3 của demo (4 phút). Hỏi lớp: "Người dùng có thấy lỗi không?" Nhấn lý do phải luôn chạy `rollout status` sau deploy. Output ở trên đã rút gọn, danh sách Pod thực tế dài hơn.

### Slide 10: Demo 3 – đọc nguyên nhân rồi rollback

Bước 4 và 5 của demo (3 phút). Hỏi: "Rollback xong là hết việc chưa?"

### Slide 11: Lab – ba lần tự phá, tự sửa

Phát `source/web.yaml` (Deployment `web`, 3 replicas, nginx:1.26) và `source/crash.yaml` (busybox:1.36 in log lỗi rồi `exit 1`) từ bài lab. Chuẩn bị: lỗi hay gặp là quên `kubectl config set-context` nên lệnh chạy sai namespace `ops-lab`. Phần 2: nếu thấy `none` ở change-cause revision 2, học viên chưa chạy lệnh annotate. Break 1: câu chữ thông báo thay đổi tùy runtime, dạy học viên tìm từ khóa chứ không đối chiếu từng chữ; sau `undo`, `get deployment web -o jsonpath` phải ra `nginx:1.27`, revision được đánh số lại. Break 2: lỗi hay gặp là `logs` trống vì xem log container mới khởi động lại, dùng `--previous`. Break 3: rolling update che lỗi lần nữa vì Pod cũ vẫn Running; hỏi "Scheduler dựa trên request hay mức dùng thực tế?" Dọn dẹp: `kubectl delete deployment hungry crashy`.

### Slide 12: Lỗi thường gặp

2 phút. Nhắc: `undo` xong mà lỗi quay lại lần deploy sau là do chỉ rollback, chưa sửa nguyên nhân gốc.

### Slide 13: Thử thách L2 và tình huống tổng hợp

Gợi ý cho học viên kẹt: `maxUnavailable` của 2 replicas làm tròn xuống 0 nên Pod cũ chỉ bị xóa khi Pod mới Ready. Nguyên nhân của tag `9.9.9`: chưa từng được build hay nạp vào kind. Tình huống tổng hợp "Pod 0/1 sau deploy": mentor đặt trước path thành `/readyz` rồi apply (5 phút); backend starter không ghi log từng request nên `kubectl logs` không chỉ ra đường dẫn sai. Liên hệ buổi 26 (tình huống 10).

### Slide 14: Recap

2 phút. Hỏi lại: "Khi nào `rollout undo` không giúp được?" Nhắc nộp `lab-28/`.

## Tình huống tổng hợp: bản mới của API chết sau khi deploy

Học viên chỉ nhận triệu chứng (xem trang thử thách); phần dưới đây là phía mentor.

Người giao đề (mentor hoặc bạn cùng nhóm) chỉ nói: "Sau khi cập nhật, `get pods` có Pod không Ready, nhưng web vẫn mở được".

Cách phá (mentor chuẩn bị): đặt `readinessProbe.httpGet.path` của một Deployment thành đường dẫn không tồn tại, ví dụ `/readyz`, rồi apply.

Triệu chứng: Pod `Running` nhưng `READY 0/1`, rollout không hoàn tất, không có `Restarts`.

Hướng điều tra:

1. `kubectl get pods`: STATUS Running nhưng READY 0/1 nghĩa là container sống, chỉ readiness chưa đạt.
2. `kubectl describe pod TEN_POD`: tìm event `Readiness probe failed: HTTP probe failed with statuscode: 404`.
3. `kubectl port-forward` rồi `curl` từng đường dẫn: `/ready` trả 200, `/readyz` trả 404. Backend `starter-project` không ghi log từng request nên `kubectl logs` không cho thấy đường dẫn sai.
4. So `readinessProbe.path` trong YAML với route thật trong `starter-project/backend/app.js` (`/health` và `/ready`).
5. Sửa path đúng, apply, `rollout status` để xác nhận.

Nguyên nhân gốc: cấu hình probe không khớp route của ứng dụng; không phải lỗi image hay tài nguyên. Phòng tránh: kiểm tra probe bằng `port-forward` và `curl` trước khi apply, dùng `kubectl diff -f` để xem thay đổi, luôn theo dõi `rollout status`.

## Đáp án tình huống 07, 08, 09

Chỉ dành cho mentor. Thư mục `examples/troubleshooting/scenario-07`, `scenario-08`, `scenario-09`; học viên chỉ nhận triệu chứng. Trước buổi, mentor chạy `bash setup.sh` trong từng thư mục. `setup.sh` của kịch bản 07 dùng biến `KIND_CLUSTER` với mặc định là `kind`, nên với cluster của khóa học chạy `KIND_CLUSTER=club bash setup.sh`. Dọn dẹp bằng `bash cleanup.sh` (xóa namespace `ts-07`, `ts-08`, `ts-09`).

::: details Tình huống 07: ErrImagePull rồi ImagePullBackOff
- Nguyên nhân gốc: Deployment tham chiếu `club-api:1.0.1` nhưng `setup.sh` chỉ build và nạp `club-api:1.0.0` vào kind. Image `1.0.1` không có trong node; `imagePullPolicy: IfNotPresent` nên kubelet thử kéo từ registry công khai (Docker Hub), nơi không có image tên này.
- Cách xác minh: `kubectl describe pod -n ts-07 -l app=club-api` (Events báo kéo `club-api:1.0.1` thất bại); `docker exec club-control-plane crictl images | grep club-api` chỉ thấy tag `1.0.0`.
- Giải pháp 1: dùng đúng bản đã có, `kubectl set image -n ts-07 deployment/club-api api=club-api:1.0.0`. Giải pháp 2: build `club-api:1.0.1` từ `starter-project/backend` rồi `kind load docker-image club-api:1.0.1 --name club`, sau đó `kubectl rollout restart -n ts-07 deployment/club-api`. Chọn cách 1 khi `1.0.1` chưa phải bản phát hành thật; chọn cách 2 khi cần bản mới.
- Phòng tránh: tag bất biến, kiểm tra image đã có trong node trước `set image`, luôn chạy `rollout status`.
- Ghi chú L2: Kubernetes không biết bạn build ở máy; image không có tên registry thì mặc định tìm ở Docker Hub, và `IfNotPresent` chỉ bỏ qua việc kéo khi image đã nằm trong node.
:::

::: details Tình huống 08: CrashLoopBackOff
- Nguyên nhân gốc: ứng dụng `club-notes` thoát với mã 1 vì thiếu biến môi trường bắt buộc `NOTES_DB_URL` (Deployment không khai báo `env`).
- Cách xác minh: `kubectl logs -n ts-08 deploy/club-notes --previous` in `FATAL: missing required environment variable NOTES_DB_URL`; `kubectl describe pod -n ts-08` có `Last State: Terminated`, `Exit Code: 1`, không có lỗi kéo image hay scheduling.
- Giải pháp: thêm `env` cho container, ví dụ `NOTES_DB_URL` với một giá trị giả hợp lệ cho môi trường học (chuỗi kết nối tới Service `postgres` của namespace `club`), đặt trong ConfigMap hoặc Secret tạo bằng lệnh, không đưa mật khẩu thật vào file. Apply rồi `kubectl rollout status -n ts-08 deployment/club-notes`.
- Phòng tránh: ứng dụng in lỗi rõ khi thiếu cấu hình (đã làm), CI kiểm tra manifest có đủ biến bắt buộc, tài liệu hóa danh sách biến môi trường.
- Ghi chú L2: `Exit Code` 1 là lỗi ứng dụng chung (137 là bị kill, 127 là lệnh không tồn tại). `logs` thường cần `--previous` vì container hiện tại có thể vừa khởi động lại và chưa in gì.
:::

::: details Tình huống 09: Pending
- Nguyên nhân gốc: `requests` và `limits` của `club-web` là `cpu: "64"` và `memory: 128Gi` (sao chép từ cấu hình production), lớn hơn nhiều so với tài nguyên của node kind trên laptop nên scheduler không tìm được node nào.
- Cách xác minh: `kubectl describe pod -n ts-09` có event `FailedScheduling` với `Insufficient cpu` và `Insufficient memory`; `kubectl describe node` mục Capacity và Allocatable cho thấy node chỉ có vài core và vài GB.
- Giải pháp: sửa manifest về giá trị hợp lý, ví dụ `requests` cpu `50m`, memory `64Mi` và `limits.memory` `128Mi`; chọn số dựa trên mức dùng đo được (`kubectl top` nếu có metrics-server) và dung lượng node. Apply lại, `rollout status`.
- Phòng tránh: không chép số production sang máy học tập; đối chiếu `requests` với Allocatable của node trước khi apply.
- Ghi chú L2: scheduler dùng `requests` để quyết định đặt Pod; `limits` chỉ áp dụng khi container đã chạy (vượt `limits.memory` thì OOMKilled).
:::

Lời giải thử thách sự cố `club-api:9.9.9` nằm ở [Đáp án tuần 14](../walkthroughs/week-14.md).

## Lưu ý riêng cho người dạy

- Namespace `club` phải còn `club-api` (2 replicas) từ buổi 27 để học viên làm thử thách trên ứng dụng thật; nhắc học viên không xóa namespace này giữa hai buổi.
- Lệnh `kubectl config set-context --current --namespace=ops-lab` đổi namespace mặc định của context `kind-club`; cuối buổi nhắc đặt lại về `default` hoặc `club` để các buổi sau không chạy nhầm namespace.
- Tình huống 07 có thể trùng với lỗi học viên tự gây ở thử thách `club-api:9.9.9` (cùng nguyên nhân image không có trong node); dùng để so sánh hai cách xác minh.
- Câu chữ thông báo kéo image khác nhau theo runtime (`not found`, `manifest unknown`, `pull access denied`); chấm theo từ khóa, không theo từng chữ.
