# Slide buổi 27 – Storage & Ingress

> **Tóm tắt:** Dùng PV, PVC, StorageClass để PostgreSQL giữ dữ liệu khi Pod bị xóa, và dùng ingress-nginx trên kind để truy cập ứng dụng qua host club.localhost. Bài lab đầy đủ: [Buổi 27](../../labs/week-14/session-27.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: giữ dữ liệu, một cổng vào, tự chẩn đoán](/slides/img/s27-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu chi tiết: giải thích vòng đời PV, PVC, StorageClass; dự đoán điều gì xảy ra khi xóa PVC (`Delete` và `Retain`); cài ingress-nginx cho kind; chẩn đoán PVC Pending và Ingress 404 hoặc 503.
:::

---

## Slide 2: Xóa Pod là mất danh sách thành viên

![Pod postgres bị xóa, Pod mới khởi động với bảng members rỗng](/slides/img/s27-data-loss.svg)

::: details Ghi chú cho mentor
- Postgres chạy như một Pod, dữ liệu nằm trong filesystem tạm của container; `kubectl delete pod` là mất danh sách thành viên.
- Hỏi lớp: node khởi động lại thì chuyện gì xảy ra? Cùng kết quả.
:::

---

## Slide 3: PV, PVC, StorageClass

![Pod gọi PVC, PVC gắn với PV, StorageClass tự tạo PV](/slides/img/s27-pv-pvc-sc.svg)

::: details Ghi chú cho mentor
- PV (dung lượng thật): admin hoặc provisioner tạo. PVC (yêu cầu dung lượng và access mode): developer tạo. StorageClass (loại storage, cách tạo PV tự động): admin tạo.
- Ví von: PVC là phiếu đặt chỗ, PV là chỗ ngồi thật, StorageClass là nhà hàng tự xếp chỗ.
- Access mode `ReadWriteOnce`: một node đọc/ghi, hợp với database.
:::

---

## Slide 4: Xóa PVC thì dữ liệu đi đâu

![So sánh reclaimPolicy Delete (mất dữ liệu) và Retain (PV Released, còn dữ liệu)](/slides/img/s27-reclaim.svg)

::: details Ghi chú cho mentor
- Kind: StorageClass `standard`, policy `Delete`, `WaitForFirstConsumer`.
- Ví von: `Delete` như thuê tủ gửi đồ rồi trả tủ thì tủ bị dọn sạch; `Retain` như giữ lại tủ và đồ bên trong.
- Hỏi: database quan trọng nên dùng policy nào?
:::

---

## Slide 5: Database dùng StatefulSet

![Pod postgres-0 bị xóa, StatefulSet tạo lại cùng tên và mount lại đúng PVC](/slides/img/s27-statefulset.svg)

::: details Ghi chú cho mentor
- Deployment cho workload không trạng thái; database cần danh tính và storage riêng.
- Xóa Pod hoặc StatefulSet không xóa PVC; chỉ xóa PVC mới có thể mất dữ liệu.
- Nhiều replica thì dùng `volumeClaimTemplates`; lab dùng 1 replica và PVC tường minh.
- `PGDATA` trỏ thư mục con để tránh lỗi thư mục mount không rỗng.
:::

---

## Slide 6: Vòng đời PVC khi tạo Pod

![Bốn bước: PVC Pending, tạo Pod, PV tự tạo và Bound, xóa Pod mà dữ liệu còn](/slides/img/s27-pvc-lifecycle.svg)

::: details Ghi chú cho mentor
- Pod mới mount lại cùng PVC nên thấy cùng dữ liệu.
- Câu hỏi: Pending ở bước 1 có phải lỗi không? Không, vì `WaitForFirstConsumer`.
:::

---

## Slide 7: Demo 1: PVC Pending không phải lỗi

```text
$ kubectl get pvc -n club demo-pvc
NAME       STATUS    STORAGECLASS
demo-pvc   Pending   standard

$ kubectl describe pvc demo-pvc -n club | tail -4
waiting for first consumer to be created
```

Chưa có Pod dùng PVC nên kind chưa tạo PV.

::: details Ghi chú cho mentor
- Xem StorageClass mặc định `standard` của kind trước, rồi tạo `demo-pvc` 100Mi.
- Câu chữ và cột có thể khác tùy phiên bản; điều cần thấy là `Pending` và "waiting for first consumer".
:::

---

## Slide 8: Demo 2: dữ liệu sống sót qua xóa Pod

```text
$ kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"   # 3
$ kubectl delete pod postgres-0 -n club
$ kubectl wait -n club --for=condition=Ready pod/postgres-0 --timeout=120s
$ kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"   # vẫn 3
```

Xóa PVC (policy `Delete`) thì PV biến mất, database rỗng.

::: details Ghi chú cho mentor
- Output rút gọn; lệnh đầy đủ ở lab Phần 3. Nhớ `sleep 5` trước `kubectl wait`, nếu không báo NotFound.
- Demo phụ: Pod `demo-writer` ghi `date` vào `/data/log.txt`; xóa Pod, tạo lại thì file có hai dòng.
:::

---

## Slide 9: Từ nhiều cổng port-forward tới một tên miền

![Trước: mỗi Service một cổng port-forward. Sau: một tên miền club.localhost](/slides/img/s27-portforward-vs-ingress.svg)

::: details Ghi chú cho mentor
- Service `ClusterIP` chỉ truy cập được từ trong cluster; mỗi Service một cổng khác nhau.
- Người dùng thật chỉ gõ một tên miền; cần một cổng vào duy nhất quyết định request đi tới frontend hay API.
- Ingress ở tầng HTTP (host, path); LoadBalancer ở tầng TCP/UDP.
:::

---

## Slide 10: Request đi qua Ingress

![Trình duyệt vào ingress-nginx, /api tới backend, / tới club-web](/slides/img/s27-ingress-flow.svg)

::: details Ghi chú cho mentor
- Ingress chỉ là luật (host, path, Service); ingress controller là Pod proxy thật đọc luật và thực thi. `ingressClassName: nginx` chọn controller.
- Chỉ tạo Ingress mà không cài controller thì không có gì xảy ra.
- `.localhost` luôn trỏ về 127.0.0.1; Docker map port 80 của máy vào node kind nhờ `extraPortMappings`, node có nhãn `ingress-ready=true`.
- Phía sau: backend nói chuyện với Service `postgres:5432`, rồi Pod `postgres-0`, rồi PVC.
:::

---

## Slide 11: Gọi qua Ingress: 200 và 404

```text
$ curl -s -o /dev/null -w "%{http_code}\n" -H "Host: club.localhost" http://127.0.0.1/
200
$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/api/members
404
```

Ingress chọn luật theo header Host. Thiếu Host đúng thì 404.

::: details Ghi chú cho mentor
- Gọi bằng header Host để không phụ thuộc DNS của WSL; trên Windows mở `http://club.localhost` trong trình duyệt.
- Request `/api/members` khớp cả `/api` lẫn `/`; path dài hơn thắng nên đi tới backend.
:::

---

## Slide 12: Lab L1: năm phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Làm sạch namespace, nạp image | PVC `Pending` |
| 2-3 | Postgres + PVC, xóa `postgres-0` | `count` trước và sau bằng nhau |
| 4-5 | Backend, frontend, ingress-nginx | `club.localhost` trả `200` |

Lệnh từng bước: [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md).

::: details Ghi chú cho mentor
- Lỗi hay gặp: port 80 bị chiếm, quên nạp image bằng `kind load docker-image`, gọi curl thiếu header Host.
- Phần 2: Kubernetes không tự chạy `init.sql`, phải nạp tay.
:::

---

## Slide 13: Debug theo lớp

![Năm lớp: PVC, Pod, Service, Ingress, Controller kèm lệnh kiểm tra](/slides/img/s27-debug-layers.svg)

::: details Ghi chú cho mentor
- Debug theo lớp từ trong ra ngoài: PVC, Pod, Service và endpoints, Ingress, cuối cùng log controller.
- Hỏi: `curl` trả 404 mà port-forward vào Service chạy. Bạn kiểm tra gì đầu tiên?
:::

---

## Slide 14: Bốn triệu chứng thường gặp

| Triệu chứng | Nguyên nhân | Kiểm tra |
| --- | --- | --- |
| PVC `Pending` mãi | `storageClassName` sai | `describe pvc` |
| `404` | Thiếu Host đúng hoặc `ingressClassName` | `get ingressclass` |
| `503` | Service sai hoặc không có Pod Ready | `get svc,endpoints` |
| `Connection refused` | Thiếu `extraPortMappings` | `docker ps` |

::: details Ghi chú cho mentor
- `storageClassName` sai (ví dụ `fast-ssd`) thì không có provisioner; xóa PVC tạo lại, không sửa tại chỗ được.
- `404`: `curl -H "Host: club.localhost"`, `kubectl get ingressclass`. `503`: `describe ingress`. `Connection refused`: xem cột PORTS có `80->80`.
:::

---

## Slide 15: Thử thách L2

- Dự đoán rồi kiểm chứng vòng đời PV/PVC.
- Chuyển PV sang `Retain`, quan sát `Released`, phục hồi bằng `claimRef`.
- Thêm host `api.club.localhost` tới Service `backend`.

Chi tiết: [Buổi 27 – Thử thách nâng cao](../../labs/week-14/session-27-challenge.md).

::: details Ghi chú cho mentor
- Vì sao xóa PVC khi Pod còn dùng thì PVC ở `Terminating`: finalizer bảo vệ.
- Lập bảng dự đoán và kết quả cho thử thách 1.
:::

---

## Slide 16: Recap

![Ba điều cần nhớ: PVC giữ dữ liệu, Ingress là luật, debug theo lớp](/slides/img/s27-recap.svg)

Buổi tiếp theo: [Buổi 28 – Kubernetes Operations](session-28.md).

::: details Ghi chú cho mentor
- Database dùng StatefulSet, RWO, `PGDATA` trỏ thư mục con; chạy `init.sql` là việc của bạn.
- Trên kind: `standard`, policy `Delete`, `WaitForFirstConsumer`.
:::

---

## Slide 17: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/): hiểu PV, PVC và vòng đời lưu trữ.
- **Tài liệu chính thức:** [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/): định tuyến HTTP vào Service trong cluster.
- **Tài liệu chính thức:** [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/): chạy ứng dụng có trạng thái như database.
- **Best practice:** [Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/): danh sách kiểm tra bảo mật cho cluster.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): quy tắc viết cấu hình Service và Ingress.
