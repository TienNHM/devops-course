# Slide buổi 24 – Kubernetes Services

> **Tóm tắt:** Dùng Service (ClusterIP, NodePort, LoadBalancer) và DNS nội bộ của Kubernetes để nối Frontend với Backend, rồi chẩn đoán Service có Endpoints rỗng. Lệnh lab: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: địa chỉ ổn định, chọn đúng loại, chẩn đoán Endpoints rỗng](/slides/img/s24-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: đọc đúng `get svc`, `get endpoints`, `describe svc`; kiểm thử DNS bằng tên ngắn và FQDN; phân biệt `port`, `targetPort`, `containerPort`, `nodePort`.
- Hỏi: Pod bị xóa thì IP có giữ nguyên không?
:::

---

## Slide 2: IP của Pod thay đổi

![Frontend gọi IP Pod cũ sau rolling update thì nhận 502](/slides/img/s24-pod-ip.svg)

::: details Ghi chú cho mentor
- API chạy 2 replica; Pod mới sau mỗi lần xóa hoặc rolling update có IP khác.
- Có hai replica, frontend gửi request cho Pod nào? Cần một địa chỉ đứng trước.
- Nginx của frontend chỉ cần `proxy_pass http://backend:3000;`.
:::

---

## Slide 3: Service là địa chỉ cố định cho một nhóm Pod

![Service backend chọn Pod có label app=club-api, bỏ qua Pod club-web](/slides/img/s24-service-concept.svg)

::: details Ghi chú cho mentor
- `selector`: tập label dùng để chọn Pod. `ports`: `port` Service lắng nghe, `targetPort` trên Pod.
- Service không chạy process; `kube-proxy` trên mỗi node chuyển traffic tới Pod đang Ready.
- Chỉ Pod cùng namespace, khớp label và Ready mới nhận traffic.
:::

---

## Slide 4: Manifest Service của backend

```yaml
spec:
  selector:
    app: club-api
  ports:
    - port: 3000
      targetPort: 3000
```

Gõ nhầm `club-apii` thì không Pod nào khớp.

::: details Ghi chú cho mentor
- Chỉ ra `selector` phải trùng `labels` trong Pod template của Deployment.
- Bỏ `targetPort` thì dùng giá trị bằng `port`.
:::

---

## Slide 5: Ba loại Service

![ClusterIP, NodePort, LoadBalancer và hành vi của từng loại trong kind](/slides/img/s24-types.svg)

::: details Ghi chú cho mentor
- ClusterIP (mặc định): chỉ trong cluster; từ máy truy cập bằng `port-forward`.
- NodePort: qua IP node, cổng 30000-32767; chưa mở ra host nếu thiếu `extraPortMappings`.
- LoadBalancer: cần load balancer của cloud, trong kind `EXTERNAL-IP` luôn `pending`.
:::

---

## Slide 6: Bốn loại cổng dễ nhầm

![Client gọi port của Service, chuyển tới targetPort trên Pod; nodePort mở trên node](/slides/img/s24-ports.svg)

::: details Ghi chú cho mentor
- `containerPort`: khai báo cổng container nghe (tài liệu hóa). `targetPort`: cổng trên Pod nhận traffic. `port`: cổng client gọi, ví dụ `backend:3000`. `nodePort`: cổng mở trên mọi node.
- `targetPort` sai: Endpoints vẫn có, nhưng kết nối bị từ chối.
:::

---

## Slide 7: DNS: ba cách gọi cùng một Service

![resolv.conf có search domain, CoreDNS trả ClusterIP; ba kiểu tên backend](/slides/img/s24-dns.svg)

::: details Ghi chú cho mentor
- CoreDNS tạo bản ghi `ten-service.namespace.svc.cluster.local`.
- Tên ngắn hoạt động nhờ `search` domain trong `/etc/resolv.conf` của Pod.
- Vì vậy `proxy_pass http://backend:3000` chạy được khi cùng namespace `club`.
:::

---

## Slide 8: Đường đi của một request

![Trình duyệt qua Service club-web, Nginx, Service backend, hai Pod API, Service postgres](/slides/img/s24-request-path.svg)

::: details Ghi chú cho mentor
- Trình duyệt vào frontend qua `port-forward`; API gọi database qua `DB_HOST=postgres`.
- Database cũng cần Service để API gọi tên `postgres` thay vì IP.
:::

---

## Slide 9: Endpoints chỉ chứa Pod Ready

![Pod fail readiness bị loại khỏi Endpoints nhưng không bị restart](/slides/img/s24-endpoints.svg)

::: details Ghi chú cho mentor
- Endpoints là danh sách `IP:port` của các Pod khớp selector và đang Ready.
- Endpoints rỗng nghĩa là Service không có nơi nào để gửi traffic.
- Từ Kubernetes 1.33, `kubectl get endpoints` in cảnh báo deprecated (không phải lỗi); tương đương là `kubectl get endpointslices`.
:::

---

## Slide 10: Demo: Service và Endpoints

```bash
kubectl get svc backend -o yaml
kubectl get pods --show-labels
kubectl describe svc backend
kubectl run debug --rm -it --restart=Never --image=busybox:1.36 -- sh
nslookup backend
```

::: details Ghi chú cho mentor
- Endpoints của `backend` có hai địa chỉ `10.244.x.x:3000`, trùng IP hai Pod API.
- Xóa Pod API (tùy chọn) và quan sát danh sách địa chỉ đổi, ClusterIP không đổi.
- Chạy `nslookup backend` từ Pod tạm để thấy tên đổi thành ClusterIP; thử cả `backend.club` và FQDN.
:::

---

## Slide 11: Phá lỗi: Endpoints rỗng

![Selector app=club-apii khác label app=club-api nên Endpoints là none](/slides/img/s24-empty-endpoints.svg)

::: details Ghi chú cho mentor
- Gõ nhầm selector: Endpoints là `<none>`, Nginx trả 502. Pod vẫn `Running`, Deployment vẫn khỏe.
- Điều tra từ ngoài vào trong: `get endpoints`, `describe svc` đọc Selector, so với `--show-labels`.
- Sửa selector về đúng rồi kiểm tra lại Endpoints.
- `targetPort` sai là lỗi khác: Endpoints có địa chỉ nhưng `Connection refused`.
:::

---

## Slide 12: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| Endpoints `<none>` | Selector sai hoặc Pod chưa Ready | So `describe svc` với `--show-labels` |
| `Connection refused` | `targetPort` sai | Sửa về cổng ứng dụng |
| `bad address 'backend'` | Pod khác namespace | Dùng `backend.club` |
| Nginx trả 502 | Backend không có Endpoints | `get endpoints backend`, xem log API |

---

## Slide 13: Lab: nối frontend với backend

```bash
kubectl apply -f k8s/frontend.yaml
kubectl rollout status deployment/club-web --timeout=120s
kubectl port-forward svc/club-web 8081:80
```

Lệnh và kết quả mong đợi: [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md).

::: details Ghi chú cho mentor
- Lab: đọc Service backend, deploy frontend, kiểm thử DNS từ Pod `debug`, xem NodePort và LoadBalancer (`pending` trong kind), rồi phá selector.
- Buổi 27 sẽ dùng Ingress thay cho `port-forward`.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: địa chỉ cố định, selector và Ready, xem Endpoints trước](/slides/img/s24-recap.svg)

Buổi sau: [Slide buổi 25 – Configuration Management](session-25.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Service](https://kubernetes.io/docs/concepts/services-networking/service/): địa chỉ cố định cho một nhóm Pod.
- **Tài liệu chính thức:** [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/): gọi Service bằng tên thay vì IP.
- **Tài liệu chính thức:** [Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/): Service không tới được Pod thì kiểm tra gì.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): cách đặt label và viết Service đúng chuẩn.
- **Best practice:** [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/): giới hạn Pod nào được nói chuyện với Pod nào.
