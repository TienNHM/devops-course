# Slide buổi 21 – Kubernetes Introduction

> **Tóm tắt:** Buổi học giải thích vì sao cần orchestration, các thành phần của Kubernetes, và hướng dẫn dựng cluster kind `club` bằng kubectl. Lệnh lab nằm ở bài học, slide chỉ giữ khung.

Bài học: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md)

## Slide 1: Mục tiêu của buổi 21

![Ba mục tiêu: gọi tên thành phần, dựng cluster, chẩn đoán kubectl](/slides/img/s21-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích vì sao Compose không đủ; phân biệt control plane và worker node; mô tả đường đi của một yêu cầu từ `kubectl` tới container; dựng cluster kind `club`; chẩn đoán lỗi kubectl không kết nối được.
:::

---

## Slide 2: Bài toán thực tế: Compose chạy tốt trên một máy, nhưng chưa đủ

![Một máy chạy Compose, nhưng cần nhiều bản sao, tự phục hồi, nhiều máy](/slides/img/s21-compose-limit.svg)

::: details Ghi chú cho mentor
- Club Management chạy bằng `compose.yaml` trên một máy. Nhu cầu phát sinh: 3 bản sao backend, tự khởi động lại bản bị chết, cập nhật không gián đoạn.
- Compose mô tả một stack trên một host và không tự phân bổ container sang máy khác.
:::

---

## Slide 3: Khái niệm: Orchestration

- **Orchestration** là việc tự động hóa vòng đời của container ở quy mô nhiều bản sao và nhiều máy: lên lịch chạy, tự phục hồi, mở rộng, cập nhật, cấu hình và mạng.
- **Kubernetes** (K8s) là hệ thống orchestration mã nguồn mở được dùng phổ biến cho nhu cầu này.
- Ví dụ trong dự án: backend của Club cần 2 bản sao luôn chạy, và Kubernetes tạo lại bản nào bị mất.

---

## Slide 4: Compose và Kubernetes

| Nhu cầu | Compose (1 host) | Kubernetes |
| --- | --- | --- |
| Nhiều bản sao | Thủ công | Khai báo `replicas` |
| Container chết | Restart trên cùng máy | Tạo lại, có thể sang node khác |
| Cập nhật | Tự thực hiện | Rolling update, rollback |
| Nhiều máy | Không hỗ trợ | Mục đích thiết kế |

::: details Ghi chú cho mentor
- Orchestration: tự động hóa vòng đời container ở quy mô nhiều bản sao, nhiều máy (lên lịch, tự phục hồi, scale, cập nhật, cấu hình, mạng).
- Stack nhỏ chạy trên một máy vẫn nên dùng Compose.
- Ví dụ so sánh: Compose phù hợp một quán nhỏ do một người quản lý, còn Kubernetes phù hợp bộ máy điều hành cả chuỗi quán.
:::

---

## Slide 5: Khái niệm: Declarative và reconciliation loop

- **Declarative** (khai báo) là cách mô tả trạng thái mong muốn (ví dụ "luôn có 2 bản `club-api`") bằng YAML, thay vì mô tả từng bước thực hiện.
- **Reconciliation loop** là vòng lặp trong đó controller so sánh trạng thái mong muốn với trạng thái thực tế rồi sửa chênh lệch.
- Ví dụ trong dự án: nếu chỉ còn 1 Pod `club-api` trong khi mong muốn là 2, controller tạo thêm 1 Pod.

---

## Slide 6: Reconciliation loop: so sánh rồi sửa

![Controller so sánh mong muốn với thực tế rồi tạo thêm Pod, lặp mãi](/slides/img/s21-reconcile.svg)

::: details Ghi chú cho mentor
- Declarative: người dùng mô tả "cái gì" bằng YAML, không mô tả "làm thế nào".
- Controller đọc trạng thái mong muốn, đọc trạng thái thực tế, sửa chênh lệch rồi lặp lại. Đây là ý tưởng xuyên suốt phần Kubernetes của khóa học.
:::

---

## Slide 7: Khái niệm: Cluster, control plane và node

- **Cluster** là tập hợp các máy chạy Kubernetes. **Control plane** là nhóm thành phần ra quyết định cho cluster, còn **worker node** là máy chạy các Pod.
- Control plane gồm kube-apiserver, etcd, kube-scheduler và kube-controller-manager; mỗi node chạy kubelet, kube-proxy và container runtime.
- Ví dụ trong dự án: cluster `club` có node `club-control-plane`.

---

## Slide 8: Control plane quyết định, node chạy Pod

![Control plane gồm apiserver, etcd, scheduler, controller-manager; node gồm kubelet, kube-proxy, containerd](/slides/img/s21-components.svg)

::: details Ghi chú cho mentor
- kube-apiserver: cổng duy nhất vào cluster. etcd: kho key-value lưu trạng thái. kube-scheduler: chọn node cho Pod chưa có node. kube-controller-manager: chạy các controller đưa trạng thái thực tế về mong muốn.
- kubelet: agent trên node, chạy các Pod được giao. kube-proxy: cài luật mạng cho Service. containerd: thực sự chạy container (kind dùng containerd).
- Phân biệt: kubelet quản lý Pod, kube-proxy quản lý đường mạng.
:::

---

## Slide 9: Khái niệm: API Server

- **API Server** (`kube-apiserver`) là thành phần của control plane cung cấp API của Kubernetes; mọi thành phần khác giao tiếp với cluster thông qua nó.
- Thành phần này tập trung việc xác thực, phân quyền và kiểm tra tính hợp lệ, và chỉ nó đọc ghi dữ liệu trong etcd.
- Ví dụ trong dự án: lệnh `kubectl get pods` gửi yêu cầu tới API Server, không đọc trực tiếp từ etcd.

---

## Slide 10: Mọi thứ đi qua API Server

![API Server ở giữa; kubectl, scheduler, controller-manager, kubelet đều nói chuyện qua nó; chỉ nó nói với etcd](/slides/img/s21-hub.svg)

::: details Ghi chú cho mentor
- Các thành phần không gọi trực tiếp nhau; API Server là nơi tập trung xác thực, phân quyền và kiểm tra hợp lệ.
- Câu hỏi thảo luận: vì sao `kubectl` không giao tiếp trực tiếp với etcd.
:::

---

## Slide 11: Một yêu cầu đi từ kubectl tới container

![Năm bước từ kubectl apply tới kubelet báo Running](/slides/img/s21-flow.svg)

::: details Ghi chú cho mentor
- Đây là luồng khi tạo một Deployment (thực hành ở buổi 22): manifest được ghi vào etcd, controller tạo ReplicaSet rồi Pod, scheduler chọn node, kubelet chạy container và báo `Running`, `Ready`.
- `kubectl get pods` đọc lại trạng thái từ API Server.
:::

---

## Slide 12: Khái niệm: kubeconfig và context

- **kubeconfig** là tệp cấu hình cho `kubectl` biết cluster nào cần kết nối và dùng thông tin xác thực nào; mặc định nằm ở `~/.kube/config`.
- **Context** là một bộ gồm cluster, user và namespace; `kubectl` chỉ gửi lệnh tới context đang được chọn.
- Ví dụ trong dự án: context `kind-club` trỏ tới cluster `club`; kiểm tra bằng `kubectl config current-context`.

---

## Slide 13: kubectl chỉ giao tiếp với context hiện tại

![kubectl đọc kubeconfig, context kind-club trỏ tới cluster club](/slides/img/s21-context.svg)

::: details Ghi chú cho mentor
- `kubectl` chỉ là client gọi API Server. Thông tin cluster nằm ở kubeconfig, mặc định `~/.kube/config`.
- Context = cluster + user + namespace. Thói quen tốt: chạy `kubectl config current-context` trước khi apply.
- Không commit kubeconfig.
:::

---

## Slide 14: Khái niệm: kind

- **kind** (Kubernetes IN Docker) là công cụ tạo cluster Kubernetes cục bộ, trong đó mỗi node là một container Docker.
- Cluster chạy hoàn toàn trên máy người học và phù hợp cho học tập và CI; công cụ này không dành cho production.
- Ví dụ trong dự án: `kind create cluster --name club` tạo container `club-control-plane` và context `kind-club`.

---

## Slide 15: kind: mỗi node là một container Docker

![Container club-control-plane chứa Kubernetes; docker ps và kubectl get nodes thấy cùng một thứ](/slides/img/s21-kind.svg)

::: details Ghi chú cho mentor
- kind = Kubernetes IN Docker. Tên node: `<tên-cluster>-control-plane`, `<tên-cluster>-worker`; context là `kind-<tên-cluster>`.
- Cluster chạy hoàn toàn trên máy người học, không mở ra Internet; phù hợp học tập và CI, không phù hợp production.
- Môi trường dùng xuyên suốt: cluster `club`, context `kind-club`. Với máy 8 GB, tắt Compose trước khi dựng kind.
:::

---

## Slide 16: Minh họa: dựng và quan sát cluster

```text
$ kind create cluster --name club --config starter-project/k8s/kind-config.yaml
$ kubectl get nodes
NAME                 STATUS   ROLES           AGE   VERSION
club-control-plane   Ready    control-plane   1m    v1.30.x
$ kubectl get --raw /readyz
ok
```

Node trong `kubectl get nodes` cũng là container trong `docker ps`.

::: details Ghi chú cho mentor
- Hiển thị các Pod trong `kube-system`: etcd, apiserver, scheduler, controller-manager, kube-proxy (`kubectl get pods -n kube-system`).
- Không có Pod `kubelet`: kubelet chạy như một tiến trình trên node.
:::

---

## Slide 17: Lab: ba phần

| Phần | Việc làm | Mốc hoàn thành |
| --- | --- | --- |
| 1 | Tạo cluster `club` từ `kind-config.yaml` | Node `Ready`, context `kind-club` |
| 2 | Quan sát bên trong cluster, lập bảng thành phần | Chỉ ra Pod `etcd-` và `kube-apiserver-` |
| 3 | Dừng control plane rồi khôi phục | Node `Ready` trở lại |

Lệnh, kết quả mong đợi và bảng lỗi: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md).

---

## Slide 18: Tình huống lỗi: dừng control plane

![docker stop club-control-plane làm kubectl bị từ chối kết nối; điều tra theo 3 bước rồi docker start](/slides/img/s21-break.svg)

::: details Ghi chú cho mentor
- Triệu chứng: `connection refused` hoặc timeout khi chạy `kubectl get nodes`.
- Điều tra theo thứ tự: Docker, rồi container node, rồi context.
- Khôi phục: `docker start` container node, đợi 30-60 giây; nếu cổng thay đổi thì chạy `kind export kubeconfig --name club`.
:::

---

## Slide 19: Tổng kết và nộp bài

![Ba điều cần nhớ: khai báo, qua API Server, kind và context](/slides/img/s21-recap.svg)

Nộp `lab-21/`: `README.md`, `evidence/command-output.txt`, `report.md`. Giữ cluster `club` cho [Buổi 22 – Pods & Deployments](session-22.md).

::: details Ghi chú cho mentor
- Không commit kubeconfig.
- Mọi yêu cầu đi qua API Server; chỉ API Server giao tiếp với etcd.
:::

---

## Slide 20: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/): Kubernetes là gì và giải quyết vấn đề nào.
- **Tài liệu chính thức:** [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/): API Server, etcd, kubelet làm gì.
- **Tài liệu chính thức:** [kind Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/): tạo cluster Kubernetes ngay trên laptop.
- **Best practice:** [Cloud native security overview](https://kubernetes.io/docs/concepts/security/overview/): các lớp bảo mật khi chạy Kubernetes.
- **Best practice:** [The Twelve-Factor App](https://12factor.net/): nguyên tắc thiết kế app dễ chạy trên cloud.
