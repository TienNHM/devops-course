# Slide buổi 27 – Storage & Ingress

> **Tóm tắt:** Buổi học sử dụng PV, PVC và StorageClass để PostgreSQL giữ được dữ liệu khi Pod bị xóa, đồng thời dùng ingress-nginx trên kind để truy cập ứng dụng qua host club.localhost. Bài lab đầy đủ: [Buổi 27](../../labs/week-14/session-27.md).

## Mục tiêu của buổi 27

![Ba mục tiêu: giữ dữ liệu, một cổng vào, tự chẩn đoán](/slides/img/s27-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ, không đọc từng dòng.
- Mục tiêu chi tiết: giải thích vòng đời PV, PVC, StorageClass; dự đoán kết quả khi xóa PVC (`Delete` và `Retain`); cài ingress-nginx cho kind; chẩn đoán PVC `Pending` và Ingress trả về 404 hoặc 503.
:::

---

## Bài toán thực tế: xóa Pod làm mất danh sách thành viên

![Pod postgres bị xóa, Pod mới khởi động với bảng members rỗng](/slides/img/s27-data-loss.svg)

::: details Ghi chú cho mentor
- Postgres chạy như một Pod, dữ liệu nằm trong hệ tệp tạm của container; lệnh `kubectl delete pod` làm mất danh sách thành viên.
- Câu hỏi thảo luận: khi Node khởi động lại, kết quả là gì? Kết quả tương tự.
:::

---

## Khái niệm: PV và PVC

![Pod dùng PVC, PVC gắn với PV là kho lưu trữ thật](/slides/img/s27-k-pv-pvc.svg)

- **PV** là phần lưu trữ thật trong cluster; **PVC** là yêu cầu cấp dung lượng do người dùng tạo.
- Ví dụ trong dự án: Pod `postgres-0` dùng một PVC, gắn với một PV chứa dữ liệu database.

::: details Ghi chú cho mentor
- PersistentVolume (PV) là phần dung lượng lưu trữ thật trong cluster; PersistentVolumeClaim (PVC) là yêu cầu cấp dung lượng và access mode do người dùng tạo.
- Vòng đời của PV độc lập với Pod, nên dữ liệu trong PV còn lại khi Pod bị xóa; Pod chỉ cần tham chiếu tới PVC.
:::

---

## Khái niệm: StorageClass

![PVC gọi StorageClass standard, PV được tạo tự động](/slides/img/s27-k-storageclass.svg)

- **StorageClass** là đối tượng mô tả một loại lưu trữ và cách Kubernetes tạo PV tự động (dynamic provisioning).
- Ví dụ trong dự án: kind có StorageClass mặc định `standard`, với policy `Delete` và chế độ `WaitForFirstConsumer`.

::: details Ghi chú cho mentor
- Nhờ StorageClass, người dùng chỉ cần tạo PVC và PV được tạo theo yêu cầu, không cần quản trị viên tạo thủ công.
:::

---

## Quan hệ giữa Pod, PVC, PV và StorageClass

![Pod gọi PVC, PVC gắn với PV, StorageClass tự tạo PV](/slides/img/s27-pv-pvc-sc.svg)

::: details Ghi chú cho mentor
- PV (dung lượng thật): quản trị viên hoặc provisioner tạo. PVC (yêu cầu dung lượng và access mode): developer tạo. StorageClass (loại storage và cách tạo PV tự động): quản trị viên tạo.
- Ví dụ so sánh: PVC là phiếu đặt chỗ, PV là chỗ ngồi thật.
- Access mode `ReadWriteOnce`: một Node được đọc và ghi, phù hợp với database.
:::

---

## Khái niệm: reclaimPolicy

![Xóa PVC: Delete xóa PV và dữ liệu, Retain giữ lại](/slides/img/s27-k-reclaim-policy.svg)

- **`reclaimPolicy`** quy định cách xử lý PV và dữ liệu bên trong sau khi PVC liên kết bị xóa: `Delete` hoặc `Retain`.
- Ví dụ trong dự án: StorageClass `standard` của kind dùng `Delete`, nên xóa PVC làm database rỗng.

::: details Ghi chú cho mentor
- Với `Delete`, PV và dữ liệu bị xóa theo PVC. Với `Retain`, PV chuyển sang trạng thái `Released` và dữ liệu được giữ lại.
:::

---

## Xóa PVC thì dữ liệu đi đâu

![So sánh reclaimPolicy Delete (mất dữ liệu) và Retain (PV Released, còn dữ liệu)](/slides/img/s27-reclaim.svg)

::: details Ghi chú cho mentor
- Kind: StorageClass `standard`, policy `Delete`, `WaitForFirstConsumer`.
- Ví dụ so sánh: `Delete` giống trả tủ gửi đồ và tủ bị dọn sạch; `Retain` giữ lại tủ cùng đồ bên trong.
- Câu hỏi thảo luận: với database quan trọng, nên chọn policy nào?
:::

---

## Khái niệm: StatefulSet

![Pod postgres-0 được tạo lại cùng tên và gắn lại PVC cũ](/slides/img/s27-k-statefulset.svg)

- **StatefulSet** là workload dành cho ứng dụng có trạng thái: mỗi Pod có tên ổn định và có thể gắn với storage riêng.
- Ví dụ trong dự án: `postgres-0` là Pod do StatefulSet `postgres` quản lý.

::: details Ghi chú cho mentor
- Khi Pod bị xóa, StatefulSet tạo lại Pod cùng tên và gắn lại đúng storage cũ, nên dữ liệu được giữ nguyên.
:::

---

## Database dùng StatefulSet

![Pod postgres-0 bị xóa, StatefulSet tạo lại cùng tên và mount lại đúng PVC](/slides/img/s27-statefulset.svg)

::: details Ghi chú cho mentor
- Deployment phù hợp với workload không trạng thái; database cần danh tính và storage riêng.
- Xóa Pod hoặc StatefulSet không xóa PVC; chỉ khi xóa PVC thì dữ liệu mới có thể bị mất.
- Với nhiều replica, dùng `volumeClaimTemplates`; lab dùng 1 replica và PVC khai báo tường minh.
- `PGDATA` trỏ tới một thư mục con để tránh lỗi khi thư mục mount không rỗng.
:::

---

## Vòng đời PVC khi tạo Pod

![Bốn bước: PVC Pending, tạo Pod, PV tự tạo và Bound, xóa Pod mà dữ liệu còn](/slides/img/s27-pvc-lifecycle.svg)

::: details Ghi chú cho mentor
- Pod mới mount lại cùng PVC nên nhìn thấy cùng dữ liệu.
- Câu hỏi thảo luận: trạng thái `Pending` ở bước 1 có phải lỗi không? Không, vì chế độ `WaitForFirstConsumer`.
:::

---

## Demo 1: PVC ở trạng thái Pending không phải lỗi

```text
$ kubectl get pvc -n club demo-pvc
NAME       STATUS    STORAGECLASS
demo-pvc   Pending   standard

$ kubectl describe pvc demo-pvc -n club | tail -4
waiting for first consumer to be created
```

Chưa có Pod sử dụng PVC nên kind chưa tạo PV.

::: details Ghi chú cho mentor
- Xem StorageClass mặc định `standard` của kind trước, sau đó tạo `demo-pvc` 100Mi.
- Câu chữ và cột có thể khác tùy phiên bản; cần quan sát được `Pending` và "waiting for first consumer".
:::

---

## Demo 2: dữ liệu còn lại sau khi xóa Pod

```text
$ kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"   # 3
$ kubectl delete pod postgres-0 -n club
$ kubectl wait -n club --for=condition=Ready pod/postgres-0 --timeout=120s
$ kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"   # vẫn 3
```

Khi xóa PVC (policy `Delete`), PV biến mất và database rỗng.

::: details Ghi chú cho mentor
- Output đã rút gọn; lệnh đầy đủ nằm ở lab Phần 3. Chạy `sleep 5` trước `kubectl wait`, nếu không lệnh báo NotFound.
- Demo phụ: Pod `demo-writer` ghi `date` vào `/data/log.txt`; xóa Pod rồi tạo lại thì tệp có hai dòng.
:::

---

## Bài toán thực tế: nhiều cổng port-forward, một tên miền

![Trước: mỗi Service một cổng port-forward. Sau: một tên miền club.localhost](/slides/img/s27-portforward-vs-ingress.svg)

::: details Ghi chú cho mentor
- Service `ClusterIP` chỉ truy cập được từ bên trong cluster; mỗi Service cần một cổng khác nhau.
- Người dùng thật chỉ nhập một tên miền; cần một cổng vào duy nhất để quyết định request đi tới frontend hay API.
- Ingress hoạt động ở tầng HTTP (host, path); LoadBalancer hoạt động ở tầng TCP/UDP.
:::

---

## Khái niệm: Ingress và ingress controller

![Ingress là luật, ingress-nginx đọc luật và chuyển request](/slides/img/s27-k-ingress.svg)

- **Ingress** là luật định tuyến HTTP (host, path) tới các Service; **ingress controller** là thành phần đọc và thực thi các luật đó.
- Ví dụ trong dự án: ingress-nginx chuyển `/api` tới Service `backend` và `/` tới `club-web`.

::: details Ghi chú cho mentor
- Ingress chỉ là luật, nên nếu cluster chưa cài controller thì Ingress không có tác dụng.
:::

---

## Request đi qua Ingress

![Trình duyệt vào ingress-nginx, /api tới backend, / tới club-web](/slides/img/s27-ingress-flow.svg)

::: details Ghi chú cho mentor
- Ingress chỉ là luật (host, path, Service); ingress controller là Pod proxy thật đọc luật và thực thi. `ingressClassName: nginx` chọn controller.
- Chỉ tạo Ingress mà không cài controller thì không có gì xảy ra.
- `.localhost` luôn trỏ về 127.0.0.1; Docker ánh xạ port 80 của máy vào Node kind nhờ `extraPortMappings`, và Node có nhãn `ingress-ready=true`.
- Phía sau: backend giao tiếp với Service `postgres:5432`, sau đó tới Pod `postgres-0`, rồi PVC.
:::

---

## Gọi qua Ingress: 200 và 404

```text
$ curl -s -o /dev/null -w "%{http_code}\n" -H "Host: club.localhost" http://127.0.0.1/
200
$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/api/members
404
```

Ingress chọn luật theo header Host. Khi thiếu Host đúng, kết quả là 404.

::: details Ghi chú cho mentor
- Gọi bằng header Host để không phụ thuộc DNS của WSL; trên Windows, mở `http://club.localhost` trong trình duyệt.
- Request `/api/members` khớp cả `/api` lẫn `/`; path dài hơn được ưu tiên nên request đi tới backend.
:::

---

## Lab L1: năm phần

| Phần | Việc làm | Mốc hoàn thành |
| --- | --- | --- |
| 1 | Làm sạch | PVC `Pending` |
| 2-3 | Xóa `postgres-0` | `count` không đổi |
| 4-5 | Ingress | `club.localhost` `200` |

Lệnh từng bước: [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md).

::: details Ghi chú cho mentor
- Phần 1: làm sạch namespace và nạp image; Phần 2-3: Postgres cùng PVC, xóa `postgres-0`, `count` trước và sau phải bằng nhau; Phần 4-5: backend, frontend và ingress-nginx.
- Lỗi thường gặp: port 80 bị chiếm, quên nạp image bằng `kind load docker-image`, gọi curl thiếu header Host.
- Phần 2: Kubernetes không tự chạy `init.sql`, cần nạp thủ công.
:::

---

## Debug theo lớp

![Năm lớp: PVC, Pod, Service, Ingress, Controller kèm lệnh kiểm tra](/slides/img/s27-debug-layers.svg)

::: details Ghi chú cho mentor
- Debug theo lớp từ trong ra ngoài: PVC, Pod, Service và endpoints, Ingress, cuối cùng là log của controller.
- Câu hỏi thảo luận: `curl` trả về 404 nhưng port-forward vào Service hoạt động. Cần kiểm tra điều gì đầu tiên?
:::

---

## Bốn triệu chứng thường gặp

| Triệu chứng | Nguyên nhân | Kiểm tra |
| --- | --- | --- |
| PVC `Pending` | `storageClassName` | `describe pvc` |
| `404` | Thiếu Host | `get ingressclass` |
| `503` | Không có Pod Ready | `get svc,endpoints` |
| `Connection refused` | `extraPortMappings` | `docker ps` |

::: details Ghi chú cho mentor
- PVC `Pending` mãi do `storageClassName` sai; `Connection refused` do thiếu `extraPortMappings`.
- Mã 404 do thiếu Host đúng hoặc `ingressClassName`; mã 503 do Service sai hoặc không có Pod Ready.
- Khi `storageClassName` sai (ví dụ `fast-ssd`), không có provisioner phù hợp; cần xóa PVC và tạo lại, không sửa tại chỗ được.
- `404`: dùng `curl -H "Host: club.localhost"` và `kubectl get ingressclass`. `503`: `describe ingress`. `Connection refused`: kiểm tra cột PORTS có `80->80`.
:::

---

## Thử thách L2

- Dự đoán rồi kiểm chứng vòng đời PV/PVC.
- Chuyển PV sang `Retain`, quan sát trạng thái `Released`, phục hồi bằng `claimRef`.
- Thêm host `api.club.localhost` tới Service `backend`.

Chi tiết: [Buổi 27 – Thử thách nâng cao](../../labs/week-14/session-27-challenge.md).

::: details Ghi chú cho mentor
- Khi xóa PVC mà Pod vẫn đang dùng, PVC chuyển sang `Terminating` vì finalizer bảo vệ PVC.
- Lập bảng dự đoán và kết quả cho thử thách 1.
:::

---

## Tổng kết

![Ba điều cần nhớ: PVC giữ dữ liệu, Ingress là luật, debug theo lớp](/slides/img/s27-recap.svg)

Buổi tiếp theo: [Buổi 28 – Kubernetes Operations](session-28.md).

::: details Ghi chú cho mentor
- Database dùng StatefulSet, access mode RWO, `PGDATA` trỏ tới thư mục con; việc chạy `init.sql` thuộc về người triển khai.
- Trên kind: StorageClass `standard`, policy `Delete`, `WaitForFirstConsumer`.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/): hiểu PV, PVC và vòng đời lưu trữ.
- **Tài liệu chính thức:** [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/): định tuyến HTTP vào Service trong cluster.
- **Tài liệu chính thức:** [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/): chạy ứng dụng có trạng thái như database.
- **Best practice:** [Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/): danh sách kiểm tra bảo mật cho cluster.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): quy tắc viết cấu hình Service và Ingress.
