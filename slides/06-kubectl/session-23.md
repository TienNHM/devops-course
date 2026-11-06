# Slide buổi 23 – kubectl Fundamentals

> **Tóm tắt:** Buổi học trình bày cách dùng kubectl để chọn đúng cluster và namespace, áp dụng manifest, đọc trạng thái, nhật ký (log), thực thi lệnh trong container (exec), chuyển tiếp cổng (port-forward) và trích dữ liệu bằng `-o yaml`, `-o jsonpath`. Lệnh lab: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md).

## Mục tiêu của buổi 23

![Ba mục tiêu: chọn đúng nơi, chạy vòng đời, đọc và chẩn đoán](/slides/img/s23-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: hiểu kubectl giao tiếp với cluster qua kubeconfig, context và API Server; luôn xác định được lệnh tác động vào cluster nào, namespace nào.
- Vòng đời: apply, get, describe, logs, exec, port-forward, delete. Trích dữ liệu bằng `-o wide`, `-o yaml`, `-o jsonpath`, `-o custom-columns`.
- Câu hỏi thảo luận: người học nào từng chạy lệnh nhầm môi trường?
:::

---

## Tình huống: Pod không hiển thị

![Get pods ở namespace default trống, ứng dụng nằm ở namespace club](/slides/img/s23-lost-pod.svg)

::: details Ghi chú cho mentor
- Tình huống: tối trước buổi sinh hoạt câu lạc bộ có tin báo "web điểm danh bị lỗi". Chạy `kubectl get pods` và nhận `No resources found`.
- Workload không bị mất: lệnh đang xem namespace `default`, trong khi ứng dụng nằm ở namespace `club`.
- Rủi ro nghiêm trọng hơn: `kubectl delete` nhầm đối tượng vì context cũ vẫn đang được chọn.
:::

---

## Khái niệm: kubeconfig và context

![kubeconfig gồm clusters, users, contexts; context ghép cluster, user, namespace](/slides/img/s23-kubeconfig.svg)

- **kubeconfig** là tệp cấu hình cho kubectl biết kết nối tới cluster nào và xác thực bằng danh tính nào; **context** ghép cluster, user, namespace.
- Ví dụ trong dự án: cluster của khóa học dùng context `kind-club`.

::: details Ghi chú cho mentor
- kubectl không tự biết cluster nào; công cụ đọc tệp kubeconfig (mặc định `~/.kube/config`).
- cluster: địa chỉ API Server và CA. user: chứng chỉ hoặc token. context: bộ ba cluster, user và namespace mặc định.
- Cluster của khóa học: context `kind-club`.
- Một context ghép ba thông tin: cluster, user và namespace mặc định; kubectl luôn thực thi lệnh theo context hiện hành.
:::

---

## Khái niệm: Namespace

![Cluster có namespace default, club, kube-system; Node và PV nằm ngoài namespace](/slides/img/s23-namespaces.svg)

- **Namespace** là cơ chế chia một cluster thành các không gian tên riêng biệt để nhóm và tách các tài nguyên.
- Ví dụ trong dự án: ứng dụng nằm ở namespace `club`, nên cần `kubectl get pods -n club`.

::: details Ghi chú cho mentor
- Tên tài nguyên chỉ cần duy nhất trong một namespace. Khi không chỉ định, lệnh dùng namespace của context (mặc định `default`).
- Minh họa: cùng lệnh `get pods` khi có và không có `-n club` cho hai kết quả khác nhau.
:::

---

## Khái niệm: API Server

![kubectl gửi HTTPS tới API Server, các thành phần khác đọc etcd và phản ứng](/slides/img/s23-architecture.svg)

- **API Server** là thành phần control plane cung cấp Kubernetes API qua HTTPS; mọi thao tác quản lý cluster đều đi qua đó.
- Ví dụ trong dự án: `kubectl apply` gửi manifest tới API Server, không tự tạo Pod.

::: details Ghi chú cho mentor
- Control plane là mặt phẳng điều khiển của cluster.
- kubectl chỉ là client: công cụ gửi yêu cầu tới API Server và không tự tạo Pod.
- Sau `kubectl apply`, các thành phần khác phản ứng với dữ liệu trong etcd.
- kubelet trên Node chạy container thông qua container runtime.
:::

---

## Diễn biến khi chạy kubectl apply

![Năm bước từ kubectl apply đến Pod Running](/slides/img/s23-apply-flow.svg)

::: details Ghi chú cho mentor
- Trạng thái mong muốn (desired state) được lưu trước, trạng thái thực tế đạt tới sau vài giây.
- `logs`, `exec`, `port-forward` đều đi qua API Server.
- Câu hỏi thảo luận: nếu API Server ngừng hoạt động thì các Pod đang chạy có bị sập không?
:::

---

## Khái niệm: Declarative và imperative

- **Declarative** khai báo trạng thái mong muốn trong tệp để Kubernetes tự đưa cluster về đó; **imperative** ra lệnh từng thao tác.
- Ví dụ trong dự án: `apply -f` là mặc định; `scale`, `edit` chỉ để thử nhanh.

::: details Ghi chú cho mentor
- Cách declarative lưu mọi thay đổi trong Git, nên có thể xem lại và lặp lại.
- `apply -f` (declarative) có nguồn sự thật là file manifest trong Git; là mặc định của khóa học.
- `create`, `scale`, `edit` (imperative) có nguồn sự thật là trạng thái live; dùng khi thử nhanh hoặc khắc phục khẩn.
- Sau khi sửa khẩn, cần đưa thay đổi về manifest.
- Cách declarative có thể tái lập và review được; cách imperative không để lại dấu vết.
- Quy tắc của khóa học: khai báo bằng tệp; dùng imperative để thử nghiệm hoặc khắc phục khẩn cấp.
:::

---

## Minh họa: ba lần quan sát đầu tiên

```bash
kubectl config current-context
kubectl get pods                 # default: trống
kubectl get pods -n club         # có Pod
kubectl apply -f demo-web.yaml --dry-run=client -o yaml
kubectl get pods -n club -v=6    # thấy lời gọi REST
```

::: details Ghi chú cho mentor
- Lần 1: xác định context và namespace hiện tại, rồi so sánh `get pods` với `-n club`.
- Lần 2: sinh YAML mẫu bằng `--dry-run=client -o yaml`, không tạo gì trong cluster.
- Lần 3: cờ `-v=6` cho thấy kubectl thực sự gọi REST tới API Server của kind.
- Xóa một Pod do Deployment quản lý và quan sát Pod mới xuất hiện: ReplicaSet duy trì đủ số `replicas`.
- `kubectl explain` cho phép tra cấu trúc ngay trong terminal.
:::

---

## describe: đọc từ trên xuống

![Mô phỏng describe pod: thông tin, trạng thái, Events ở cuối](/slides/img/s23-describe-map.svg)

::: details Ghi chú cho mentor
- `get` cho bảng ngắn; `-o wide` bổ sung node và IP.
- `describe` được đọc từ trên xuống: Node, IP, Image, State, Conditions, rồi Events.
- Events ghi lại Scheduled, Pulled, Created, Started và chỉ được lưu khoảng một giờ.
- Khi Pod không chạy, thực hiện `describe` trước vì nguyên nhân thường nằm ở Events.
:::

---

## logs, exec, port-forward

![Ba công cụ gỡ lỗi cùng đi qua kubectl, API Server, kubelet tới container](/slides/img/s23-debug-tools.svg)

::: details Ghi chú cho mentor
- `logs`: `--previous` đọc lần chạy trước khi restart; `-l` kèm `--prefix` dùng cho nhiều Pod.
- `exec`: dấu `--` tách cờ của kubectl khỏi lệnh cần chạy; image alpine chỉ có `sh`.
- `port-forward`: đường hầm tạm tới một Pod, chỉ bind `127.0.0.1` và không thay thế Service.
- Thay đổi bên trong container sẽ mất khi Pod bị tạo lại.
:::

---

## Một object, nhiều cách hiển thị

![spec là phần người dùng khai báo, status là phần Kubernetes ghi; ba kiểu định dạng đầu ra](/slides/img/s23-output-formats.svg)

::: details Ghi chú cho mentor
- `-o yaml`: toàn bộ object; so sánh `spec` (phần người dùng khai báo) với `status` (phần Kubernetes ghi).
- `-o jsonpath`: biểu thức đặt trong nháy đơn; `.items` chỉ xuất hiện khi lấy nhiều object.
- `-o custom-columns` và `--sort-by`: bảng tự dựng và sắp xếp.
- Khi jsonpath trả về rỗng: chạy `-o yaml` để xem cấu trúc, rồi viết lại đường dẫn.
:::

---

## Khái niệm: Drift

![scale tay làm cluster lệch file, kubectl diff báo khác, apply đưa về như file](/slides/img/s23-drift.svg)

- **Drift** là tình trạng trạng thái thực tế của cluster khác với nội dung manifest được lưu trong Git.
- Ví dụ trong dự án: sau khi `scale` thủ công, chạy `diff`, `apply`, rồi `rollout status`.

::: details Ghi chú cho mentor
- Lệnh thủ công như `scale` đổi trạng thái live nhưng manifest vẫn ghi giá trị cũ; do đó `kubectl diff` báo khác biệt và `apply` đưa cluster về như tệp.
- `kubectl diff` trả về exit code 1 khi có khác biệt, vì vậy có thể dùng trong CI.
- Thói quen: diff, apply, rollout status.
:::

---

## Phá lỗi: ImagePullBackOff

![Tag image sai: Pod mới lỗi, Pod cũ vẫn Running và vẫn nhận traffic](/slides/img/s23-imagepull.svg)

::: details Ghi chú cho mentor
- Khi tag không tồn tại: Pod mới chuyển `ErrImagePull` rồi `ImagePullBackOff`, Pod cũ vẫn `Running`.
- Rolling update giữ Pod cũ tới khi Pod mới Ready, nên dịch vụ chưa ngừng hoạt động (đây là hệ quả của cấu hình mặc định).
- Quy trình điều tra: `get`, `describe` để đọc Events, kiểm tra tag, rồi `rollout undo` và sửa manifest để Git khớp với cluster.
- Các lỗi thường gặp khác: quên `-n`, cổng port-forward bị chiếm (xem bảng Gặp lỗi? trong bài lab).
:::

---

## Lab: thực hành trên cluster kind-club

```bash
kubectl config current-context   # kind-club
kubectl get nodes                # Ready
```

Lệnh và kết quả mong đợi: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md).

::: details Ghi chú cho mentor
- Lab theo thứ tự: context và namespace, apply `demo-web`, describe và events, logs/exec/port-forward, định dạng đầu ra, drift, phá lỗi ImagePullBackOff.
- Khi chưa có cluster: xem lệnh `kind create cluster` ở đầu bài lab.
:::

---

## Tổng kết

![Ba điều cần nhớ: client của API Server, manifest là gốc, describe trước](/slides/img/s23-recap.svg)

Buổi sau: [Slide buổi 24 – Kubernetes Services](session-24.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [kubectl quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/): bảng lệnh kubectl hay dùng.
- **Tài liệu chính thức:** [Organizing cluster access using kubeconfig files](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/): kubectl biết cluster nào nhờ kubeconfig.
- **Tài liệu chính thức:** [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/): các bước tìm lỗi khi Pod không chạy.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): manifest là gốc, giữ trong Git.
- **Best practice:** [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/): cho mỗi người đúng quyền cần thiết.
