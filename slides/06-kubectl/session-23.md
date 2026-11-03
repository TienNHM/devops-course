# Slide buổi 23 – kubectl Fundamentals

> **Tóm tắt:** Dùng kubectl để chọn đúng cluster và namespace, apply manifest, đọc trạng thái, log, exec, port-forward và trích dữ liệu bằng -o yaml, jsonpath. Lệnh lab: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: chọn đúng nơi, chạy vòng đời, đọc và chẩn đoán](/slides/img/s23-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: hiểu kubectl nói chuyện với cluster qua kubeconfig, context và API Server; luôn biết lệnh tác động vào cluster nào, namespace nào.
- Vòng đời: apply, get, describe, logs, exec, port-forward, delete. Trích dữ liệu bằng `-o wide`, `-o yaml`, `-o jsonpath`, `-o custom-columns`.
- Hỏi: ai từng gõ lệnh nhầm môi trường?
:::

---

## Slide 2: Pod biến mất? Đừng hoảng

![Get pods ở namespace default trống, ứng dụng nằm ở namespace club](/slides/img/s23-lost-pod.svg)

::: details Ghi chú cho mentor
- Kể chuyện: tối trước buổi sinh hoạt CLB có tin nhắn "web điểm danh bị lỗi". Gõ `kubectl get pods` và nhận `No resources found`.
- Workload không mất: bạn đang nhìn namespace `default`, ứng dụng nằm ở `club`.
- Tệ hơn: `kubectl delete` nhầm vì context cũ vẫn đang được chọn.
:::

---

## Slide 3: kubectl đọc kubeconfig để biết đi đâu

![kubeconfig gồm clusters, users, contexts; context ghép cluster, user, namespace](/slides/img/s23-kubeconfig.svg)

::: details Ghi chú cho mentor
- kubectl không "biết" cluster nào, nó đọc file kubeconfig (mặc định `~/.kube/config`).
- cluster: địa chỉ API Server và CA. user: chứng chỉ hoặc token. context: bộ ba cluster + user + namespace mặc định.
- Cluster của khóa học: context `kind-club`.
:::

---

## Slide 4: Namespace chia cluster thành các ngăn

![Cluster có namespace default, club, kube-system; Node và PV nằm ngoài namespace](/slides/img/s23-namespaces.svg)

::: details Ghi chú cho mentor
- Tên chỉ cần duy nhất trong một namespace. Không chỉ định thì dùng namespace của context (mặc định `default`).
- Demo: cùng lệnh `get pods` với và không có `-n club` cho hai kết quả khác nhau.
:::

---

## Slide 5: kubectl chỉ là client HTTP

![kubectl gửi HTTPS tới API Server, các thành phần khác đọc etcd và phản ứng](/slides/img/s23-architecture.svg)

::: details Ghi chú cho mentor
- kubectl không tạo Pod, nó gửi yêu cầu tới API Server.
- Các thành phần khác phản ứng với dữ liệu trong etcd; kubelet trên Node chạy container qua container runtime.
:::

---

## Slide 6: Chuyện gì xảy ra khi apply

![Năm bước từ kubectl apply đến Pod Running](/slides/img/s23-apply-flow.svg)

::: details Ghi chú cho mentor
- Desired state được lưu trước, thực tế đuổi theo sau vài giây.
- `logs`, `exec`, `port-forward` đều đi qua API Server.
- Hỏi: nếu API Server tắt thì Pod đang chạy có sập không?
:::

---

## Slide 7: Declarative hay imperative

| Cách | Nguồn sự thật | Dùng khi |
| --- | --- | --- |
| `apply -f` | File manifest trong Git | Mặc định của khóa học |
| `create`, `scale`, `edit` | Trạng thái live | Thử nhanh, khắc phục khẩn |

Sửa khẩn xong: đưa thay đổi về manifest.

::: details Ghi chú cho mentor
- Declarative tái lập và review được; imperative không để lại dấu vết.
- Quy tắc khóa học: khai báo bằng file; dùng imperative để thử hoặc khắc phục khẩn.
:::

---

## Slide 8: Demo: ba cú nhìn đầu tiên

```bash
kubectl config current-context
kubectl get pods                 # default: trống
kubectl get pods -n club         # có Pod
kubectl apply -f demo-web.yaml --dry-run=client -o yaml
kubectl get pods -n club -v=6    # thấy lời gọi REST
```

::: details Ghi chú cho mentor
- Cú nhìn 1: context và namespace hiện tại, rồi so `get pods` với `-n club`.
- Cú nhìn 2: sinh YAML mẫu bằng `--dry-run=client -o yaml`, không tạo gì trong cluster.
- Cú nhìn 3: cờ `-v=6` cho thấy kubectl thực sự gọi REST tới API Server của kind.
- Xóa một Pod do Deployment quản lý và xem Pod mới xuất hiện: ReplicaSet giữ đủ `replicas`.
- `kubectl explain` để tra cấu trúc ngay trong terminal.
:::

---

## Slide 9: describe: đọc từ trên xuống

![Mô phỏng describe pod: thông tin, trạng thái, Events ở cuối](/slides/img/s23-describe-map.svg)

::: details Ghi chú cho mentor
- `get` cho bảng ngắn; `-o wide` thêm node và IP.
- `describe` đọc từ trên xuống: Node, IP, Image, State, Conditions, rồi Events.
- Events cho biết Scheduled, Pulled, Created, Started; chỉ lưu khoảng một giờ.
- Pod không chạy thì `describe` trước, nguyên nhân thường nằm ở Events.
:::

---

## Slide 10: logs, exec, port-forward

![Ba công cụ gỡ lỗi cùng đi qua kubectl, API Server, kubelet tới container](/slides/img/s23-debug-tools.svg)

::: details Ghi chú cho mentor
- `logs`: `--previous` cho lần chạy trước khi restart; `-l` kèm `--prefix` cho nhiều Pod.
- `exec`: dấu `--` tách cờ kubectl khỏi lệnh; image alpine chỉ có `sh`.
- `port-forward`: đường hầm tạm tới một Pod, chỉ bind `127.0.0.1`, không thay Service.
- Thay đổi trong container mất khi Pod bị tạo lại.
:::

---

## Slide 11: Một object, nhiều cách nhìn

![spec là bạn khai báo, status là Kubernetes ghi; ba kiểu định dạng đầu ra](/slides/img/s23-output-formats.svg)

::: details Ghi chú cho mentor
- `-o yaml`: toàn bộ object, so `spec` (bạn khai báo) với `status` (Kubernetes ghi).
- `-o jsonpath`: đặt trong nháy đơn; `.items` chỉ có khi lấy nhiều object.
- `-o custom-columns` và `--sort-by`: bảng tự dựng và sắp xếp.
- Jsonpath rỗng: chạy `-o yaml` để xem cấu trúc rồi viết lại đường dẫn.
:::

---

## Slide 12: Drift: lệnh tay bị manifest ghi đè

![scale tay làm cluster lệch file, kubectl diff báo khác, apply đưa về như file](/slides/img/s23-drift.svg)

::: details Ghi chú cho mentor
- `scale` đổi trạng thái live nhưng manifest vẫn ghi giá trị cũ, nên `apply` đưa cluster về như file.
- `kubectl diff` trả exit code 1 khi có khác biệt, dùng được trong CI.
- Thói quen: diff, apply, rollout status.
:::

---

## Slide 13: Phá lỗi: ImagePullBackOff

![Tag image sai: Pod mới lỗi, Pod cũ vẫn Running và vẫn nhận traffic](/slides/img/s23-imagepull.svg)

::: details Ghi chú cho mentor
- Tag không tồn tại: Pod mới `ErrImagePull` rồi `ImagePullBackOff`, Pod cũ vẫn `Running`.
- Rolling update giữ Pod cũ tới khi Pod mới Ready, nên dịch vụ chưa sập (may mắn của mặc định).
- Điều tra: `get`, `describe` đọc Events, kiểm tra tag, rồi `rollout undo` và sửa manifest để Git khớp cluster.
- Lỗi thường gặp khác: quên `-n`, cổng port-forward bị chiếm (xem bảng Gặp lỗi? trong bài lab).
:::

---

## Slide 14: Lab: thực hành trên cluster kind-club

```bash
kubectl config current-context   # kind-club
kubectl get nodes                # Ready
```

Lệnh và kết quả mong đợi: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md).

::: details Ghi chú cho mentor
- Lab đi theo thứ tự: context và namespace, apply `demo-web`, describe và events, logs/exec/port-forward, định dạng đầu ra, drift, phá lỗi ImagePullBackOff.
- Chưa có cluster: xem lệnh `kind create cluster` ở đầu bài lab.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: client của API Server, manifest là gốc, describe trước](/slides/img/s23-recap.svg)

Buổi sau: [Slide buổi 24 – Kubernetes Services](session-24.md).
