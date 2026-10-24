# Kịch bản buổi 24 – Kubernetes Services

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md). Slide: [Slide buổi 24](../../slides/06-kubectl/session-24.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 12](../grading/week-12.md). Đáp án: [Đáp án tuần 12](../walkthroughs/week-12.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 24: khung 120 phút, demo Service và Endpoints, câu hỏi cho lớp, ghi chú theo 13 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc kubectl ở buổi 23; hỏi lớp Pod có IP thay đổi thì frontend gọi backend bằng gì |
| 15-45 | Kiến thức và demo | Service, selector, loại Service, bốn loại cổng, DNS, Endpoints, demo Service và Endpoints |
| 45-105 | Thực hành | Chuẩn bị 5', Phần 1 (đọc Service backend) 10', Phần 2 (gọi Service bằng DNS) 10', Phần 3 (nối frontend và backend) 10', Phần 4 (NodePort và LoadBalancer) 10'; phần còn lại cho phá lỗi Endpoints rỗng và thử thách |
| 105-120 | Review | Học viên nói lại đường đi của một request; nhắc nộp `report.md` về Endpoints rỗng |

Nếu thiếu thời gian, ưu tiên Phần 1-3 và phá lỗi Endpoints rỗng; Phần 4 có thể demo chung.

## Kịch bản demo

Mục tiêu: cho lớp thấy Service là ranh giới ổn định phía trước các Pod thay đổi liên tục. Các manifest của dự án có sẵn trong `starter-project/k8s/`; ví dụ rút gọn nằm ở `examples/kubernetes/03-service.yaml`.

1. Xem Service hiện có:

   ```bash
   kubectl get svc -n club
   ```

   Kết quả mong đợi (rút gọn):

   ```text
   NAME       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
   backend    ClusterIP   10.96.x.x      <none>        3000/TCP   20m
   club-web   ClusterIP   10.96.x.x      <none>        80/TCP     20m
   postgres   ClusterIP   10.96.x.x      <none>        5432/TCP   25m
   ```

   Hỏi lớp: vì sao database cũng cần Service dù chỉ có một Pod `postgres-0`? (Để API gọi tên `postgres` thay vì IP Pod; `DB_HOST=postgres` trong ConfigMap.) Câu hỏi mở rộng, chỉ gợi mở: StatefulSet khai báo `serviceName: postgres`, vì sao thường dùng headless Service (`clusterIP: None`) cho loại workload này?

2. Xem Endpoints khớp với Pod:

   ```bash
   kubectl get endpoints backend -n club
   kubectl get pods -n club -l app=club-api -o wide
   ```

   Kết quả mong đợi: cột `ENDPOINTS` của `backend` có hai địa chỉ dạng `10.244.x.x:3000`, trùng IP của hai Pod `club-api`.

3. Xóa một Pod rồi quan sát:

   ```bash
   kubectl delete pod -n club -l app=club-api --wait=false
   kubectl get endpoints backend -n club -w
   ```

   Kết quả mong đợi: danh sách địa chỉ thay đổi khi Pod mới Ready; ClusterIP của Service không đổi. Nhấn Ctrl+C để thoát. Hỏi lớp: nếu frontend gọi thẳng IP Pod thì chuyện gì xảy ra? Pod mới có Ready ngay không, và vì sao readiness probe quan trọng với Endpoints?

4. Cho lớp thấy DNS từ một Pod tạm:

   ```bash
   kubectl run dns-demo -n club --rm -it --restart=Never --image=busybox:1.36 -- nslookup backend
   ```

   Kết quả mong đợi: `Name: backend.club.svc.cluster.local` và một `Address` là ClusterIP của Service.

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Nếu bạn là Nginx, bạn lưu địa chỉ của backend ở đâu? | Không lưu IP Pod; dùng tên Service, một địa chỉ ổn định và tự cân bằng tải. |
| Đổi tên Deployment thì Service có hỏng không? | Không. Selector là liên kết duy nhất giữa Service và Pod, không tham chiếu tên Deployment. |
| Database nên dùng loại Service nào? | ClusterIP (headless với StatefulSet); không cần mở ra ngoài cluster. |
| Client gọi 8080 mà Pod nghe 3000, cấu hình thế nào? | `port: 8080`, `targetPort: 3000`. |
| Pod ở namespace `lab24` gọi `backend` ở `club` có chạy không? | Không, search domain chỉ chứa namespace của Pod; dùng `backend.club`. |
| Pod vẫn Running mà Service không có Endpoints, do những lý do nào? | Selector không khớp label, khác namespace, hoặc Pod chưa Ready. |
| Frontend trả 502 mà mọi Pod đều Running, kiểm tra gì đầu tiên? | `kubectl get endpoints backend`. |
| Nếu frontend gọi thẳng IP Pod thì chuyện gì xảy ra? | Hỏng khi Pod bị thay thế vì IP mới. |

## Ghi chú theo slide

Slide buổi 24 có 13 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): nhắc điều kiện: cluster kind `club` chạy, image `club-api:1.0.0` và `club-web:1.0.0` đã nạp, namespace `club` có Postgres từ các buổi trước.
- Slide 2 – Vấn đề, IP của Pod thay đổi (2 phút): hỏi lớp "nếu bạn là Nginx, bạn lưu địa chỉ của backend ở đâu?" Dẫn tới ý cần một địa chỉ ổn định và tự cân bằng tải.
- Slide 3 – Service là gì (3 phút): nhấn selector là liên kết duy nhất giữa Service và Pod. Hỏi: đổi tên Deployment thì Service có hỏng không?
- Slide 4 – Ba loại Service (3 phút): giải thích vì sao kind không có cloud load balancer; cloud-provider-kind và MetalLB nằm ngoài phạm vi buổi này. Hỏi: database nên dùng loại nào?
- Slide 5 – Bốn loại cổng dễ nhầm (3 phút): vẽ đường đi: client gọi `port`, Service chuyển tới `targetPort`. Hỏi: client gọi 8080 mà Pod nghe 3000, cấu hình thế nào? (Chuẩn bị cho thử thách 1.)
- Slide 6 – Service discovery và DNS (3 phút): cho lớp đoán: Pod ở namespace `lab24` gọi `backend` có chạy không? Kiểm chứng ở thử thách 2.
- Slide 7 – Endpoints, danh sách Pod Ready (2 phút): lệnh đầu tiên khi nghi ngờ Service là `get endpoints`. Đừng sa đà vào EndpointSlice, chỉ nhắc để học viên không hoang mang khi thấy cảnh báo deprecated (Kubernetes 1.33 trở lên; không phải lỗi).
- Slide 8 – Kiến trúc, đường đi của một request (3 phút): đi theo từng mũi tên: Nginx hỏi CoreDNS tên `backend`, nhận ClusterIP, `kube-proxy` chọn một trong hai Pod. Chỉ ra ba Service trong sơ đồ.
- Slide 9 – Selector khớp label (3 phút): sơ đồ này là nền cho phần phá lỗi. Hỏi lớp Pod vẫn Running mà Service không có Endpoints thì có thể do những lý do nào.
- Slide 10 – Demo, Service và Endpoints (khoảng 8 phút theo kịch bản demo ở trên).
- Slide 11 – Phá lỗi, Endpoints rỗng (khoảng 10 phút): để lớp tự điều tra từ ngoài vào trong 5 phút trước khi tiết lộ. Tình huống phụ: `targetPort` sai (3001) cho Endpoints có địa chỉ nhưng `Connection refused`; khác selector sai ở chỗ Endpoints không rỗng. Phá lỗi dùng `kubectl patch` đổi Service thật: nhắc học viên khôi phục ngay và sửa manifest `k8s/backend.yaml` nếu có sửa file.
- Slide 12 – Lỗi thường gặp (2 phút): hỏi lớp "Frontend trả 502 mà mọi Pod đều Running, kiểm tra gì đầu tiên?" (`kubectl get endpoints backend`).
- Slide 13 – Recap (review 15 phút cuối): cho học viên tự nói lại đường đi của một request từ trình duyệt tới database. Nhắc nộp `report.md` về tình huống Endpoints rỗng.

## Hỗ trợ khi học viên thực hành

- Phần 1: nếu thiếu Pod, nhắc apply lại theo thứ tự: namespace, configmap, Secret, postgres, backend, frontend trong `starter-project/k8s/`. Cho học viên khoảng 5 phút.
- Phần 2: lệnh chạy bên trong shell của Pod debug. Nếu `wget` báo lỗi kết nối nhưng `nslookup` ra IP, Service tồn tại và lỗi nằm sau Service.
- Phần 3: `port-forward` giữ terminal; chạy `curl` ở terminal thứ hai. Nếu cổng bận: đổi sang `8082:80`.
- Phần 4: không sửa Service gốc `club-web`; nhắc dọn hai Service thử nghiệm. Nhóm bắt buộc hoàn thành checklist sau phần này.
- Thử thách (nằm trong bài lab, gập sẵn): thử thách 1, chỉ cần đúng ba thứ là `metadata.name`, `selector` và cặp `port`/`targetPort`; thử thách 2, nhắc xóa namespace `lab24` khi xong. Lời giải ở [Đáp án tuần 12](../walkthroughs/week-12.md).

## Lưu ý riêng cho người dạy

- Bài lab dùng `kubectl config set-context --current --namespace=club` để bỏ `-n club`; nhắc học viên đặt lại namespace `default` nếu sau đó làm việc với namespace khác.
- Cảnh báo Kubernetes 1.33 trở lên: `kubectl get endpoints` in `v1 Endpoints is deprecated`, không phải lỗi; tương đương là `kubectl get endpointslices`.
- Phá lỗi dùng `kubectl patch` đổi Service thật: học viên khôi phục ngay.
