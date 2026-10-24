# Kịch bản mentor – Buổi 24: Kubernetes Services

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md). Slide: [Slide buổi 24](../../slides/06-kubectl/session-24.md). Đáp án và barem: [Walkthrough tuần 12](../walkthroughs/week-12.md), [Chấm điểm tuần 12](../grading/week-12.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 24: khung thời gian, demo của mentor, ghi chú giảng viên theo từng slide và lưu ý riêng. Nội dung chuyển nguyên văn từ bài lab và slide cũ.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian thực hành dự kiến: 60 phút (Chuẩn bị 5', Phần 1-4 khoảng 40', L1/L2 và dọn dẹp 15').

## Demo của mentor

Mục tiêu: cho lớp thấy Service là ranh giới ổn định phía trước các Pod thay đổi liên tục. Các manifest của dự án có sẵn trong `starter-project/k8s/`; ví dụ rút gọn nằm ở `examples/kubernetes/03-service.yaml`.

1. Xem Service hiện có.

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

   Hỏi lớp: vì sao database cũng cần Service dù chỉ có một Pod `postgres-0`? (Để API gọi tên `postgres` thay vì IP Pod; `DB_HOST=postgres` trong ConfigMap.) Câu hỏi mở rộng: StatefulSet khai báo `serviceName: postgres`, vì sao thường dùng headless Service (`clusterIP: None`) cho loại workload này?

2. Xem Endpoints khớp với Pod.

   ```bash
   kubectl get endpoints backend -n club
   kubectl get pods -n club -l app=club-api -o wide
   ```

   Kết quả mong đợi: cột `ENDPOINTS` của `backend` có hai địa chỉ dạng `10.244.x.x:3000`, trùng IP của hai Pod `club-api`.

3. Xóa một Pod rồi quan sát.

   ```bash
   kubectl delete pod -n club -l app=club-api --wait=false
   kubectl get endpoints backend -n club -w
   ```

   Kết quả mong đợi: danh sách địa chỉ thay đổi khi Pod mới Ready; ClusterIP của Service không đổi. Nhấn Ctrl+C để thoát.

   Hỏi lớp: nếu frontend gọi thẳng IP Pod thì chuyện gì xảy ra? Pod mới có Ready ngay không, và vì sao readiness probe quan trọng với Endpoints?

4. Cho lớp thấy DNS từ một Pod tạm.

   ```bash
   kubectl run dns-demo -n club --rm -it --restart=Never --image=busybox:1.36 -- nslookup backend
   ```

   Kết quả mong đợi: `Name: backend.club.svc.cluster.local` và một `Address` là ClusterIP của Service.

## Câu hỏi mentor nên hỏi lớp

Các câu hỏi gom từ demo và ghi chú slide (nguyên văn):

- Vì sao database cũng cần Service dù chỉ có một Pod `postgres-0`?
- Vì sao StatefulSet thường dùng headless Service (`clusterIP: None`)?
- Nếu frontend gọi thẳng IP Pod thì chuyện gì xảy ra? Pod mới có Ready ngay không, và vì sao readiness probe quan trọng với Endpoints?
- Nếu bạn là Nginx, bạn lưu địa chỉ của backend ở đâu?
- Đổi tên Deployment thì Service có hỏng không?
- Database nên dùng loại Service nào?
- Client gọi 8080 mà Pod nghe 3000, cấu hình thế nào? (chuẩn bị cho thử thách 1)
- Pod ở namespace `lab24` gọi `backend` có chạy không? (Không, search domain chỉ chứa namespace của Pod.)
- Pod vẫn Running mà Service không có Endpoints, có thể do những lý do nào?
- Frontend trả 502 mà mọi Pod đều Running, kiểm tra gì đầu tiên? (`kubectl get endpoints backend`.)

## Ghi chú giảng viên theo slide

Nguyên văn từ slide cũ (19 slide). Slide mới đã gộp lại; mỗi mục ghi tên slide gốc.

**Slide gốc 1 – Mục tiêu buổi học.** Đọc nhanh (2 phút). Nhắc điều kiện: cluster kind chạy, image `club-api:1.0.0` và `club-web:1.0.0` đã nạp, namespace `club` có Postgres từ các buổi trước.

**Slide gốc 2 – Vấn đề: IP của Pod thay đổi.** Hỏi lớp: "Nếu bạn là Nginx, bạn lưu địa chỉ của backend ở đâu?" Dẫn tới ý: cần một địa chỉ ổn định và tự cân bằng tải (2 phút).

**Slide gốc 3 – Service là gì.** Nhấn: selector là liên kết duy nhất giữa Service và Pod, không có tham chiếu tới tên Deployment. Hỏi: "Đổi tên Deployment thì Service có hỏng không?"

**Slide gốc 4 – Ba loại Service.** Giải thích vì sao kind không có cloud load balancer. Cloud-provider-kind và MetalLB nằm ngoài phạm vi buổi này. Hỏi: "Database nên dùng loại nào?"

**Slide gốc 5 – Bốn loại cổng dễ nhầm.** Vẽ đường đi: client gọi `port`, Service chuyển tới `targetPort`. Hỏi: "Client gọi 8080 mà Pod nghe 3000, cấu hình thế nào?" (Chuẩn bị cho thử thách 1.)

**Slide gốc 6 – Service discovery và DNS.** Cho lớp đoán: Pod ở namespace `lab24` gọi `backend` có chạy không? (Không, search domain chỉ chứa namespace của Pod.) Kiểm chứng ở thử thách 2.

**Slide gốc 7 – Endpoints, danh sách Pod Ready.** Nhấn: lệnh đầu tiên khi nghi ngờ Service là `get endpoints`. Đừng sa đà vào EndpointSlice, chỉ nhắc để học viên không hoang mang khi thấy cảnh báo.

**Slide gốc 8 – Kiến trúc, đường đi của một request.** Đi theo từng mũi tên (3 phút): Nginx hỏi CoreDNS tên `backend`, nhận ClusterIP, `kube-proxy` chọn một trong hai Pod. Chỉ ra ba Service trong sơ đồ.

**Slide gốc 9 – Selector khớp label.** Sơ đồ này là nền cho phần Phá lỗi. Hỏi lớp: "Pod vẫn Running mà Service không có Endpoints, có thể do những lý do nào?"

**Slide gốc 10 – Demo: Service và Endpoints.** Câu hỏi mở rộng: vì sao StatefulSet thường dùng headless Service (`clusterIP: None`)? Chỉ gợi mở, đừng giải thích sâu. Thời lượng 3 phút.

**Slide gốc 11 – Demo: xoá Pod và DNS từ Pod tạm.** Hỏi lớp: nếu frontend gọi thẳng IP Pod thì chuyện gì xảy ra? Pod mới có Ready ngay không, và vì sao readiness probe quan trọng với Endpoints?

**Slide gốc 12 – Lab phần 1: đọc Service backend.** Cho học viên 5 phút. Nếu thiếu Pod, nhắc apply lại theo thứ tự: namespace, configmap, Secret, postgres, backend, frontend trong `starter-project/k8s/`.

**Slide gốc 13 – Lab phần 2: gọi Service bằng DNS.** Lệnh nhóm hai chạy bên trong shell của Pod debug. Nếu `wget` báo lỗi kết nối nhưng `nslookup` ra IP, Service tồn tại và lỗi nằm sau Service.

**Slide gốc 14 – Lab phần 3: nối frontend và backend.** Lệnh `port-forward` giữ terminal; chạy `curl` ở terminal thứ hai. Nếu cổng bận: đổi sang `8082:80`.

**Slide gốc 15 – Lab phần 4: NodePort và LoadBalancer.** Nhấn: không sửa Service gốc `club-web`. Nhóm L1 hoàn thành checklist 6 mục sau phần này. Nhắc dọn hai Service thử nghiệm.

**Slide gốc 16 – Phá lỗi: Endpoints rỗng.** Để lớp tự điều tra từ ngoài vào trong trong 5 phút trước khi tiết lộ. Tình huống phụ: `targetPort` sai (3001) cho Endpoints có địa chỉ nhưng `Connection refused`; khác biệt với selector sai là Endpoints không rỗng.

**Slide gốc 17 – Lỗi thường gặp.** Hỏi lớp: "Frontend trả 502 mà mọi Pod đều Running, kiểm tra gì đầu tiên?" Đáp án: `kubectl get endpoints backend`.

**Slide gốc 18 – Thử thách nâng cao.** Gợi ý cho thử thách 1: chỉ cần đúng ba thứ là `metadata.name`, `selector` và cặp `port`/`targetPort`. Với thử thách 2, nhắc xoá namespace `lab24` khi xong.

**Slide gốc 19 – Recap.** Cho học viên tự nói lại đường đi của một request từ trình duyệt tới database. Nhắc nộp `report.md` về tình huống Endpoints rỗng.

## Lưu ý riêng cho người dạy

- Bài học viên đã rút gọn: bảng loại Service, bảng bốn loại cổng, sơ đồ đường đi request nằm trong mục "Tìm hiểu thêm" (gập sẵn). Lời giải L2 (YAML `backend-lab`, gọi chéo namespace) nằm trong [Walkthrough tuần 12](../walkthroughs/week-12.md).
- Lab dùng `kubectl config set-context --current --namespace=club` để bỏ `-n club`; nhắc học viên đặt lại namespace `default` nếu sau đó làm việc với namespace khác.
- Cảnh báo Kubernetes 1.33 trở lên: `kubectl get endpoints` in `v1 Endpoints is deprecated`, không phải lỗi.
- Phá lỗi dùng `kubectl patch` đổi Service thật: nhắc học viên khôi phục ngay và nhớ sửa manifest `k8s/backend.yaml` nếu có sửa file.
- Nếu thiếu thời gian, ưu tiên Phần 1-3 và phá lỗi Endpoints rỗng; Phần 4 (NodePort, LoadBalancer) có thể demo chung.
