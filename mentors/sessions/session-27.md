# Kịch bản mentor – Buổi 27: Storage & Ingress

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md). Thử thách thêm: [Buổi 27 – Thử thách nâng cao](../../labs/week-14/session-27-challenge.md). Slide: [Slide buổi 27](../../slides/07-operations/session-27.md). Đáp án: [Walkthrough tuần 14](../walkthroughs/week-14.md). Chấm bài: [Chấm bài tuần 14](../grading/week-14.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 27: khung thời gian, demo PVC và Ingress từng bước, câu hỏi cho lớp và ghi chú giảng viên theo từng slide.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ gợi ý cho phần 30 phút kiến thức và demo (theo ghi chú trong slide cũ): mở đầu 2 phút, vấn đề dữ liệu biến mất 2 phút, vấn đề chỉ có port-forward 2 phút, ba đối tượng storage 3 phút, reclaim policy và binding mode 3 phút, StatefulSet 2 phút, Ingress và controller 3 phút, kiến trúc truy cập 3 phút, vòng đời PVC 2 phút, recap 2 phút. Demo khoảng 15 phút. Lab 60 phút: chuẩn bị và Phần 1 khoảng 10 phút, Postgres và xóa Pod khoảng 20 phút, backend và frontend khoảng 10 phút, ingress-nginx khoảng 15 phút.

Ghi chú về bài học viên đã cải tổ: cluster `club` tạo ở buổi 21 bằng `kind-config.yaml` nên đã có port mapping; học viên không xóa cluster mà chỉ xóa namespace `club` làm lại sạch (để thấy PVC `Pending`). Các tình huống A, B, C nằm ở mục "Phá lỗi nâng cao" của trang thử thách.

## Demo của mentor

Mục đích: cho cả lớp thấy dữ liệu sống sót qua việc xóa Pod, và Ingress là "bảng chỉ đường". Dùng cluster đã tạo sẵn (hoặc tạo ở phần Chuẩn bị của lab). Thời lượng khoảng 15 phút trong 30 phút lý thuyết.

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

Kết quả mong đợi: PVC chuyển `Bound`, có một PV tên dạng `pvc-xxxxxxxx`. Sau đó apply lại Pod rồi `kubectl exec -n club demo-writer -- cat /data/log.txt` thấy hai dòng ngày giờ: dữ liệu còn nguyên. Hỏi lớp: "Nếu giờ xóa PVC thì file còn không?"

4. Dọn dẹp demo: `kubectl delete pod demo-writer -n club --ignore-not-found` rồi `kubectl delete pvc demo-pvc -n club`. Cho lớp thấy `kubectl get pv` không còn PV tương ứng (reclaimPolicy Delete).

5. Ingress: giải thích file `starter-project/k8s/ingress.yaml` từng dòng (`ingressClassName`, `host`, hai `path`). Hỏi lớp: "Nếu đổi thứ tự hai path, `/api/members` đi đâu?" (Vẫn tới backend vì path dài hơn thắng.)

## Câu hỏi mentor nên hỏi lớp

Gom từ demo và ghi chú slide, theo thứ tự xuất hiện:

1. "Ở Compose, ta giải quyết việc dữ liệu mất khi container chết bằng gì?" (Named volume.)
2. "Nếu có 10 dịch vụ, bạn mở 10 cổng port-forward?" Dẫn sang Ingress.
3. "Developer thường tạo đối tượng nào trong ba đối tượng PV, PVC, StorageClass?" (PVC.)
4. "Vì sao binding mode là WaitForFirstConsumer? Cluster 3 node mà PV được tạo trước khi biết Pod chạy ở node nào thì sai ở đâu?" (PV local có thể nằm ở node khác Pod.)
5. "Ingress khác Service LoadBalancer thế nào?" (Ingress ở tầng HTTP, host và path; LoadBalancer ở tầng TCP/UDP.)
6. "PVC Pending ở bước hai có phải lỗi không?" (Không, chỉ đang chờ Pod.)
7. "Giờ xóa PVC thì file còn không?" (Với policy Delete: mất.)
8. "Nếu đổi thứ tự hai path thì `/api/members` đi đâu?" (Vẫn tới backend, vì path dài hơn thắng.)
9. Cuối buổi: "Hôm nay xóa PVC rồi apply lại `postgres.yaml`, database rỗng. Vì sao?"

## Ghi chú giảng viên theo slide

Nguyên văn từ ghi chú trong slide cũ, theo thứ tự slide cũ.

**Mục tiêu buổi học.** 2 phút. Nhấn: buổi này làm cho Club Management thành một ứng dụng thật, có dữ liệu bền và một cổng vào duy nhất.

**Vấn đề 1 – dữ liệu biến mất.** 2 phút. Liên hệ phần volume ở Docker/Compose và Tình huống 04 database mất dữ liệu. Hỏi: "Ở Compose, ta giải quyết việc này bằng gì?" (Named volume.)

**Vấn đề 2 – chỉ có port-forward.** 2 phút. Câu hỏi: "Nếu có 10 dịch vụ, bạn mở 10 cổng port-forward?" Dẫn sang Ingress.

**Ba đối tượng storage.** 3 phút. Ví von: PVC là phiếu đặt chỗ, PV là chỗ ngồi thật, StorageClass là nhà hàng tự xếp chỗ. Hỏi: "Developer thường tạo đối tượng nào?" (PVC.)

**Reclaim policy và binding mode.** 3 phút. Câu hỏi: "Cluster 3 node mà PV được tạo trước khi biết Pod chạy ở node nào thì sai ở đâu?" (PV local có thể nằm ở node khác Pod.)

**Vì sao database dùng StatefulSet.** 2 phút. Nhiều replica thì dùng `volumeClaimTemplates` để mỗi Pod có PVC riêng; lab dùng 1 replica nên PVC tường minh để nhìn rõ từng đối tượng.

**Ingress và Ingress controller.** 3 phút. Câu hỏi: "Ingress khác Service LoadBalancer thế nào?" (Ingress ở tầng HTTP, host và path; LoadBalancer ở tầng TCP/UDP.)

**Kiến trúc truy cập.** Đi theo một request `GET http://club.localhost/api/members`, 3 phút. Nhấn: `.localhost` luôn trỏ về 127.0.0.1; Docker map port 80 của máy vào node kind nhờ `extraPortMappings`.

**Vòng đời PVC khi tạo Pod.** 2 phút. Câu hỏi: "PVC Pending ở bước hai có phải lỗi không?" (Không, chỉ đang chờ Pod.)

**Demo 1 – StorageClass và PVC Pending.** Tạo `demo-pvc` 100Mi bằng `kubectl apply -n club -f -` với heredoc như trong demo ở trên. 4 phút. Hỏi lớp: "Pending ở đây là lỗi không?" Sau đó chuyển slide tiếp. Lỗi hay gặp: `get pvc` báo not found vì chưa tạo `demo-pvc`.

**Demo 2 – dữ liệu sống sót qua xóa Pod.** Pod `demo-writer` dùng `busybox:1.36`, ghi `date` vào `/data/log.txt`. 5 phút. Lưu ý lệnh `exec` chỉ chạy được sau khi apply lại Pod. Hỏi: "Giờ xóa PVC thì file còn không?"

**Lab L1 – tạo cluster có port mapping.** Học viên làm trong WSL. 5 phút. Nếu có cluster `club` cũ mà thiếu port mapping, `kind delete cluster --name club` rồi tạo lại (lệnh này xóa mọi workload trong cluster đó). Lỗi hay gặp: port 80 bị chiếm, hoặc quên nạp image vào kind.

**Lab L1 – Postgres với PVC.** 5 phút. Nếu `postgres-0` vào CrashLoopBackOff và log báo thư mục data không rỗng: thiếu `PGDATA` trỏ thư mục con. Starter đã đặt sẵn; học viên tự chỉnh YAML mới gặp lỗi này.

**Lab L1 – xóa Pod, dữ liệu còn.** Chờ Pod `Running` rồi mới truy vấn (`kubectl get pods -n club -w`). 4 phút. Số 3 đúng nếu học viên đã insert thêm một dòng ở bước trước; hỏi lớp nếu kết quả khác. Lỗi hay gặp: gọi `exec` quá sớm khi Pod chưa Ready.

**Lab L1 – cài ingress-nginx và gọi qua host.** Lần đầu kéo image có thể mất 1-2 phút, tranh thủ giải thích file `k8s/ingress.yaml` từng dòng. 6 phút. Hỏi: "Nếu đổi thứ tự hai path thì /api/members đi đâu?" (Vẫn tới backend, vì path dài hơn thắng.)

**Debug – PVC Pending mãi.** Mentor tạo `broken-pvc` với `storageClassName: fast-ssd` (YAML trong mục Phá lỗi nâng cao của trang thử thách). Học viên chỉ nhận triệu chứng. 4 phút. Liên hệ Tình huống 09 Pod Pending.

**Debug – Ingress 404, 503 và Connection refused.** Cho lớp thử `curl http://127.0.0.1/api/members` không có header Host để thấy 404. 4 phút. Thứ tự debug theo lớp: PVC, Pod, Service và endpoints, Ingress, cuối cùng log controller.

**Thử thách L2.** Cho học viên L2 làm độc lập. Cảnh báo: xóa PVC với policy `Delete` làm mất dữ liệu vĩnh viễn, phải chạy lại `init.sql`. Với local-path và Retain, dữ liệu nằm trên node nên phải dọn thủ công.

**Recap.** 2 phút. Hỏi lại: "Hôm nay xóa PVC rồi apply lại postgres.yaml, database rỗng. Vì sao?" Nhắc nộp `lab-27/` gồm `report.md` và evidence.

## Lưu ý riêng cho người dạy

- Cluster `club` đã có từ buổi 21 và có port mapping; trước buổi chạy `docker ps --filter name=club-control-plane --format '{{.Ports}}'` trên máy demo để chắc có `0.0.0.0:80->80/tcp`. Máy nào thiếu thì tạo lại theo `starter-project/k8s/kind-config.yaml`.
- Học viên cần xóa namespace `club` làm lại sạch ở đầu lab (vì tuần 13 đã dựng sẵn Postgres và API). Nhắc: chỉ xóa `club`, không xóa namespace `kube-system` hay `ingress-nginx`.
- Dự án ingress-nginx đã thông báo ngừng bảo trì từ tháng 3/2026; bản ghim `controller-v1.12.1` vẫn chạy tốt cho lab local. Hỏi lớp nếu muốn bàn về Gateway API như hướng đi mới.
- Bằng chứng PVC `Pending` bắt buộc trong bài tập: nếu học viên bỏ bước xóa namespace thì không có dòng `Pending` của `postgres-pvc`; cho phép dùng `demo-pvc` ở thử thách hoặc dòng Events "waiting for first consumer".
- Thử thách 3 (host thứ hai) không cần cài thêm gì: `api.club.localhost` cũng trỏ về 127.0.0.1 trên trình duyệt; với `curl` luôn dùng header Host.
