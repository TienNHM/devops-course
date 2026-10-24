# Kịch bản buổi 27 – Storage & Ingress

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md). Thử thách thêm: [Buổi 27 – Thử thách nâng cao](../../labs/week-14/session-27-challenge.md). Slide: [Slide buổi 27](../../slides/07-operations/session-27.md). Đáp án và chấm điểm: [Đáp án tuần 14](../walkthroughs/week-14.md), [Hướng dẫn chấm tuần 14](../grading/week-14.md).
:::

> **Tóm tắt:** Kịch bản buổi 27: khung thời gian, demo PVC và Ingress từng bước, câu hỏi cho lớp, ghi chú theo từng slide và lưu ý riêng cho người dạy.

## Khung thời gian

Buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian cho khái niệm và demo.

Phần 30 phút kiến thức và demo: mở đầu 2', dữ liệu biến mất 2', chỉ có port-forward 2', ba đối tượng storage 3', reclaim policy và binding mode 3', StatefulSet 2', Ingress và controller 3', kiến trúc truy cập 3', vòng đời PVC 2', recap 2'; demo khoảng 15'.

| Phần của lab | Thời lượng |
| --- | --- |
| Chuẩn bị | 5' |
| Phần 1 – Làm sạch namespace, nạp image, thấy PVC `Pending` | 8' |
| Phần 2 – Postgres với PVC và `init.sql` | 12' |
| Phần 3 – Xóa Pod, dữ liệu còn | 8' |
| Phần 4 – Backend và frontend | 10' |
| Phần 5 – ingress-nginx và truy cập qua `club.localhost` | 15' |

Cluster `club` tạo ở buổi 21 bằng `kind-config.yaml` nên đã có port mapping; học viên không xóa cluster mà chỉ xóa namespace `club` để làm lại sạch và thấy PVC `Pending`. Các tình huống phá lỗi nằm ở mục Phá lỗi nâng cao của trang thử thách.

## Kịch bản buổi

### Demo của mentor (khoảng 15 phút)

Mục đích: cho lớp thấy dữ liệu sống sót qua việc xóa Pod, và Ingress là "bảng chỉ đường". Dùng cluster đã tạo sẵn.

1. Quan sát StorageClass:

```bash
kubectl get storageclass
```

Kết quả mong đợi (rút gọn):

```text
NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE
standard (default)   rancher.io/local-path   Delete          WaitForFirstConsumer
```

Hỏi lớp: "Vì sao binding mode là WaitForFirstConsumer? Nếu cluster có 3 node thì điều gì có thể sai nếu PV tạo trước khi biết Pod chạy ở node nào?"

2. Tạo riêng PVC và quan sát trạng thái Pending:

```bash
kubectl apply -f starter-project/k8s/namespace.yaml
kubectl apply -n club -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 100Mi
EOF
kubectl get pvc -n club demo-pvc
```

Kết quả mong đợi: `STATUS` là `Pending`. Chạy `kubectl describe pvc demo-pvc -n club`, mục Events nói "waiting for first consumer". Hỏi lớp: "Pending ở đây là lỗi không?" (Không.)

3. Tạo Pod dùng PVC, ghi file, xóa Pod, tạo lại:

```bash
kubectl apply -n club -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: demo-writer
spec:
  containers:
    - name: busybox
      image: busybox:1.36
      command: ["sh", "-c", "date >> /data/log.txt; sleep 3600"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: demo-pvc
EOF
kubectl wait -n club --for=condition=Ready pod/demo-writer --timeout=60s
kubectl get pvc,pv -n club
kubectl delete pod demo-writer -n club
```

Kết quả mong đợi: PVC chuyển `Bound`, có một PV tên dạng `pvc-xxxxxxxx`. Apply lại Pod rồi `kubectl exec -n club demo-writer -- cat /data/log.txt` thấy hai dòng ngày giờ: dữ liệu còn nguyên. Lệnh `exec` chỉ chạy được sau khi apply lại Pod. Hỏi lớp: "Nếu giờ xóa PVC thì file còn không?"

4. Dọn demo: `kubectl delete pod demo-writer -n club --ignore-not-found` rồi `kubectl delete pvc demo-pvc -n club`. Cho lớp thấy `kubectl get pv` không còn PV tương ứng (reclaimPolicy `Delete`).

5. Ingress: giải thích `starter-project/k8s/ingress.yaml` từng dòng (`ingressClassName`, `host`, hai `path`). Hỏi lớp: "Nếu đổi thứ tự hai path, `/api/members` đi đâu?" (Vẫn tới backend vì path dài hơn thắng.)

### Câu hỏi cho lớp

1. "Ở Compose, ta giải quyết việc dữ liệu mất khi container chết bằng gì?" (Named volume.)
2. "Nếu có 10 dịch vụ, bạn mở 10 cổng port-forward?" Dẫn sang Ingress.
3. "Developer thường tạo đối tượng nào trong ba đối tượng PV, PVC, StorageClass?" (PVC.)
4. "Vì sao binding mode là WaitForFirstConsumer?" (PV local có thể nằm ở node khác với node Pod được xếp lịch.)
5. "Ingress khác Service LoadBalancer thế nào?" (Ingress ở tầng HTTP, host và path; LoadBalancer ở tầng TCP/UDP.)
6. "PVC Pending ở bước hai có phải lỗi không?" (Không, chỉ đang chờ Pod.)
7. "Giờ xóa PVC thì file còn không?" (Với policy `Delete`: mất.)
8. "Nếu đổi thứ tự hai path thì `/api/members` đi đâu?" (Vẫn tới backend, vì path dài hơn thắng.)
9. Cuối buổi: "Hôm nay xóa PVC rồi apply lại `postgres.yaml`, database rỗng. Vì sao?"

## Ghi chú theo slide

Slide buổi 27 có 14 slide.

### Slide 1: Mục tiêu buổi học

2 phút. Nhấn: buổi này làm cho Club Management thành một ứng dụng thật, có dữ liệu bền và một cổng vào duy nhất.

### Slide 2: Hai vấn đề của Club Management

4 phút. Liên hệ phần volume ở Docker và Compose, và tình huống 04 database mất dữ liệu. Hỏi: "Ở Compose, ta giải quyết việc này bằng gì?" (Named volume.) Rồi: "Nếu có 10 dịch vụ, bạn mở 10 cổng port-forward?" Dẫn sang Ingress.

### Slide 3: Ba đối tượng storage

3 phút. Ví von: PVC là phiếu đặt chỗ, PV là chỗ ngồi thật, StorageClass là nhà hàng tự xếp chỗ. Hỏi: "Developer thường tạo đối tượng nào?" (PVC.)

### Slide 4: Reclaim policy và binding mode

3 phút. Câu hỏi: "Cluster 3 node mà PV được tạo trước khi biết Pod chạy ở node nào thì sai ở đâu?" (PV local có thể nằm ở node khác Pod.) Nhấn PVC `Pending` lúc mới tạo là bình thường.

### Slide 5: Vì sao database dùng StatefulSet

2 phút. Nhiều replica thì dùng `volumeClaimTemplates` để mỗi Pod có PVC riêng; lab dùng 1 replica nên PVC tường minh để nhìn rõ từng đối tượng.

### Slide 6: Ingress và Ingress controller

3 phút. Câu hỏi: "Ingress khác Service LoadBalancer thế nào?" Nhấn: chỉ tạo Ingress mà không cài controller thì không có gì xảy ra.

### Slide 7: Kiến trúc truy cập

Đi theo một request `GET http://club.localhost/api/members` (3 phút). Nhấn: `.localhost` luôn trỏ về 127.0.0.1; Docker map port 80 của máy vào node kind nhờ `extraPortMappings`.

### Slide 8: Vòng đời PVC khi tạo Pod

2 phút. Câu hỏi: "PVC Pending ở bước hai có phải lỗi không?" (Không, chỉ đang chờ Pod.)

### Slide 9: Demo 1 – StorageClass và PVC Pending

Tạo `demo-pvc` 100Mi theo bước 1 và 2 của demo (4 phút). Hỏi lớp: "Pending ở đây là lỗi không?" Lỗi hay gặp: `get pvc` báo not found vì chưa tạo `demo-pvc`.

### Slide 10: Demo 2 – dữ liệu sống sót qua xóa Pod

Bước 3 và 4 của demo (5 phút). Pod `demo-writer` dùng `busybox:1.36`, ghi `date` vào `/data/log.txt`. Hỏi: "Giờ xóa PVC thì file còn không?"

### Slide 11: Lab L1 – các bước

Phát khung thời gian ở bảng trên. Phần 1: nếu `docker ps` không có `0.0.0.0:80->80/tcp` thì mới phải tạo lại cluster (`kind delete cluster --name club` rồi tạo lại, lệnh này xóa mọi workload trong cluster). Phần 2: nếu `postgres-0` vào CrashLoopBackOff và log báo thư mục data không rỗng thì thiếu `PGDATA` trỏ thư mục con; starter đã đặt sẵn, học viên tự chỉnh YAML mới gặp. Phần 3: chờ Pod `Running` rồi mới truy vấn; số đếm là 3 nếu học viên đã insert thêm một dòng. Phần 5: lần đầu kéo image ingress-nginx mất 1-2 phút, tranh thủ giải thích `k8s/ingress.yaml` từng dòng. Lỗi hay gặp: port 80 bị chiếm, quên nạp image vào kind, curl thiếu header Host.

### Slide 12: Debug – PVC Pending, Ingress 404, 503

4 phút. Mentor tạo `broken-pvc` với `storageClassName: fast-ssd` (YAML ở mục Phá lỗi nâng cao của trang thử thách); học viên chỉ nhận triệu chứng. Cho lớp thử `curl http://127.0.0.1/api/members` không có header Host để thấy 404. Thứ tự debug theo lớp: PVC, Pod, Service và endpoints, Ingress, cuối cùng log controller. Liên hệ tình huống 09 Pod Pending.

### Slide 13: Thử thách L2

Cho học viên L2 làm độc lập. Cảnh báo: xóa PVC với policy `Delete` làm mất dữ liệu vĩnh viễn, phải chạy lại `init.sql`. Với local-path và `Retain`, dữ liệu nằm trên node nên phải dọn thủ công.

### Slide 14: Recap

2 phút. Hỏi lại: "Hôm nay xóa PVC rồi apply lại `postgres.yaml`, database rỗng. Vì sao?" Nhắc nộp `lab-27/` gồm `report.md` và evidence.

## Lưu ý riêng cho người dạy

- Trước buổi, chạy `docker ps --filter name=club-control-plane --format '{{.Ports}}'` trên máy demo để chắc có `0.0.0.0:80->80/tcp`. Máy nào thiếu thì tạo lại theo `starter-project/k8s/kind-config.yaml`.
- Học viên xóa namespace `club` làm lại sạch ở đầu lab (vì tuần 13 đã dựng sẵn Postgres và API). Nhắc: chỉ xóa `club`, không xóa `kube-system` hay `ingress-nginx`.
- Dự án ingress-nginx đã thông báo ngừng bảo trì từ tháng 3/2026; bản ghim `controller-v1.12.1` vẫn chạy tốt cho lab local. Nếu lớp quan tâm, bàn về Gateway API như hướng đi mới.
- Bằng chứng PVC `Pending` là bắt buộc trong bài tập: học viên làm đúng Phần 1 sẽ có dòng `Pending` của `demo-pvc`; chấp nhận thêm dòng Events "waiting for first consumer".
- Thử thách host thứ hai không cần cài thêm gì: `api.club.localhost` cũng trỏ về 127.0.0.1 trên trình duyệt; với `curl` luôn dùng header Host.
- Buổi 28 bắt đầu bằng việc `club-api` (2 replicas) đang chạy trong `club`: cuối buổi kiểm tra `kubectl -n club get pods`.
