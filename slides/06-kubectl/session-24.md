# Slide buổi 24 – Kubernetes Services

> **Tóm tắt:** Buổi học trình bày cách dùng Service (ClusterIP, NodePort, LoadBalancer) và DNS nội bộ của Kubernetes để nối Frontend với Backend, sau đó chẩn đoán Service có Endpoints rỗng. Lệnh lab: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md).

## Mục tiêu của buổi 24

![Ba mục tiêu: địa chỉ ổn định, chọn đúng loại, chẩn đoán Endpoints rỗng](/slides/img/s24-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: đọc đúng `get svc`, `get endpoints`, `describe svc`; kiểm thử DNS bằng tên ngắn và FQDN; phân biệt `port`, `targetPort`, `containerPort`, `nodePort`.
- Câu hỏi thảo luận: khi Pod bị xóa, IP của Pod có được giữ nguyên không?
:::

---

## Vấn đề: IP của Pod thay đổi

![Frontend gọi IP Pod cũ sau rolling update thì nhận 502](/slides/img/s24-pod-ip.svg)

::: details Ghi chú cho mentor
- API chạy 2 replica; Pod mới sau mỗi lần xóa hoặc rolling update có IP khác.
- Với hai replica, frontend không thể xác định gửi request cho Pod nào; cần một địa chỉ đứng trước các Pod.
- Nginx của frontend chỉ cần cấu hình `proxy_pass http://backend:3000;`.
:::

---

## Khái niệm: Label và selector

- **Label** là cặp khóa-giá trị gắn vào object, ví dụ `app: club-api`; **selector** chọn các object theo label.
- Ví dụ trong dự án: Pod API mang label `app=club-api`, còn Pod `club-web` mang label khác.

::: details Ghi chú cho mentor
- Selector là điều kiện dùng để chọn các object theo label.
- Cơ chế này cho phép một object (như Service) chọn nhóm Pod mà không cần biết tên hay IP của từng Pod.
:::

---

## Khái niệm: Service

![Service backend chọn Pod có label app=club-api, bỏ qua Pod club-web](/slides/img/s24-service-concept.svg)

- **Service** là object cung cấp địa chỉ mạng ổn định cho một nhóm Pod, được chọn bằng selector.
- Ví dụ trong dự án: Service `backend` chọn các Pod có label `app=club-api`.

::: details Ghi chú cho mentor
- `selector`: tập label dùng để chọn Pod. `ports`: `port` là cổng Service lắng nghe, `targetPort` là cổng trên Pod.
- Service không chạy process; `kube-proxy` trên mỗi node chuyển traffic tới Pod đang Ready.
- Chỉ Pod cùng namespace, khớp label và Ready mới nhận traffic.
:::

---

## Manifest Service của backend

```yaml
spec:
  selector:
    app: club-api
  ports:
    - port: 3000
      targetPort: 3000
```

Nếu selector gõ nhầm thành `club-apii` thì không Pod nào khớp.

::: details Ghi chú cho mentor
- Chỉ ra rằng `selector` phải trùng `labels` trong Pod template của Deployment.
- Khi bỏ `targetPort`, giá trị mặc định bằng `port`.
:::

---

## Ba loại Service

![ClusterIP, NodePort, LoadBalancer và hành vi của từng loại trong kind](/slides/img/s24-types.svg)

::: details Ghi chú cho mentor
- ClusterIP (mặc định): chỉ truy cập được trong cluster; từ máy người học truy cập bằng `port-forward`.
- NodePort: truy cập qua IP node, cổng 30000-32767; chưa mở ra host nếu thiếu `extraPortMappings`.
- LoadBalancer: cần load balancer của cloud; trong kind, `EXTERNAL-IP` luôn ở trạng thái `pending`.
:::

---

## Bốn loại cổng dễ nhầm

![Client gọi port của Service, chuyển tới targetPort trên Pod; nodePort mở trên node](/slides/img/s24-ports.svg)

::: details Ghi chú cho mentor
- `containerPort`: khai báo cổng container lắng nghe (mang tính tài liệu hóa). `targetPort`: cổng trên Pod nhận traffic. `port`: cổng client gọi, ví dụ `backend:3000`. `nodePort`: cổng mở trên mọi node.
- Khi `targetPort` sai: Endpoints vẫn có địa chỉ, nhưng kết nối bị từ chối.
:::

---

## Khái niệm: DNS nội bộ và CoreDNS

![resolv.conf có search domain, CoreDNS trả ClusterIP; ba kiểu tên backend](/slides/img/s24-dns.svg)

- **CoreDNS** là máy chủ DNS của cluster, tạo bản ghi `ten-service.namespace.svc.cluster.local` cho mỗi Service.
- Ví dụ trong dự án: Nginx dùng `proxy_pass http://backend:3000` khi cùng namespace `club`.

::: details Ghi chú cho mentor
- CoreDNS tạo bản ghi `ten-service.namespace.svc.cluster.local`.
- Tên ngắn như `backend` hoạt động nhờ `search` domain trong `/etc/resolv.conf` của Pod, nên Pod cùng namespace gọi Service bằng tên.
- Vì vậy `proxy_pass http://backend:3000` chạy được khi cùng namespace `club`.
:::

---

## Đường đi của một request

![Trình duyệt qua Service club-web, Nginx, Service backend, hai Pod API, Service postgres](/slides/img/s24-request-path.svg)

::: details Ghi chú cho mentor
- Trình duyệt truy cập frontend qua `port-forward`; API gọi database qua `DB_HOST=postgres`.
- Database cũng cần Service để API gọi bằng tên `postgres` thay vì IP.
:::

---

## Khái niệm: Endpoints

![Pod fail readiness bị loại khỏi Endpoints nhưng không bị restart](/slides/img/s24-endpoints.svg)

- **Endpoints** là danh sách địa chỉ `IP:port` của các Pod khớp selector của Service và đang ở trạng thái Ready.
- Ví dụ trong dự án: Service `backend` có hai địa chỉ `10.244.x.x:3000`, trùng IP hai Pod API.

::: details Ghi chú cho mentor
- Endpoints là danh sách `IP:port` của các Pod khớp selector và đang Ready.
- Endpoints rỗng nghĩa là Service không có nơi nào để gửi traffic.
- Pod không đạt readiness bị loại khỏi danh sách nhưng không bị restart.
- Từ Kubernetes 1.33, `kubectl get endpoints` in cảnh báo deprecated (không phải lỗi); lệnh tương đương là `kubectl get endpointslices`.
:::

---

## Minh họa: Service và Endpoints

```bash
kubectl get svc backend -o yaml
kubectl get pods --show-labels
kubectl describe svc backend
kubectl run debug --rm -it --restart=Never --image=busybox:1.36 -- sh
nslookup backend
```

::: details Ghi chú cho mentor
- Endpoints của `backend` có hai địa chỉ `10.244.x.x:3000`, trùng IP hai Pod API.
- Tùy chọn: xóa một Pod API và quan sát danh sách địa chỉ thay đổi, trong khi ClusterIP không đổi.
- Chạy `nslookup backend` từ Pod tạm để thấy tên được phân giải thành ClusterIP; thử cả `backend.club` và FQDN.
:::

---

## Phá lỗi: Endpoints rỗng

![Selector app=club-apii khác label app=club-api nên Endpoints là none](/slides/img/s24-empty-endpoints.svg)

::: details Ghi chú cho mentor
- Khi selector gõ nhầm: Endpoints là `<none>`, Nginx trả 502. Pod vẫn `Running`, Deployment vẫn khỏe.
- Điều tra từ ngoài vào trong: `get endpoints`, `describe svc` để đọc Selector, rồi so với `--show-labels`.
- Sửa selector về đúng rồi kiểm tra lại Endpoints.
- `targetPort` sai là lỗi khác: Endpoints có địa chỉ nhưng kết nối báo `Connection refused`.
:::

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| Endpoints `<none>` | Selector sai | `--show-labels` |
| `Connection refused` | `targetPort` sai | Sửa cổng |
| `bad address` | Khác namespace | `backend.club` |
| Nginx 502 | Không Endpoints | `get endpoints` |

::: details Ghi chú cho mentor
- Endpoints `<none>`: selector sai hoặc Pod chưa Ready; so sánh `describe svc` với `--show-labels`.
- `Connection refused`: sửa `targetPort` về cổng ứng dụng.
- `bad address 'backend'`: Pod khác namespace.
- Nginx trả 502: Backend không có Endpoints; chạy `get endpoints backend` và đọc log API.
:::

---

## Lab: nối frontend với backend

```bash
kubectl apply -f k8s/frontend.yaml
kubectl rollout status deployment/club-web --timeout=120s
kubectl port-forward svc/club-web 8081:80
```

Lệnh và kết quả mong đợi: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md).

::: details Ghi chú cho mentor
- Lab: đọc Service backend, deploy frontend, kiểm thử DNS từ Pod `debug`, xem NodePort và LoadBalancer (`pending` trong kind), rồi cố ý làm sai selector.
- Buổi 27 dùng Ingress thay cho `port-forward`.
:::

---

## Tổng kết

![Ba điều cần nhớ: địa chỉ cố định, selector và Ready, xem Endpoints trước](/slides/img/s24-recap.svg)

Buổi sau: [Slide buổi 25 – Configuration Management](session-25.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Service](https://kubernetes.io/docs/concepts/services-networking/service/): địa chỉ cố định cho một nhóm Pod.
- **Tài liệu chính thức:** [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/): gọi Service bằng tên thay vì IP.
- **Tài liệu chính thức:** [Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/): Service không tới được Pod thì kiểm tra gì.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): cách đặt label và viết Service đúng chuẩn.
- **Best practice:** [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/): giới hạn Pod nào được nói chuyện với Pod nào.
