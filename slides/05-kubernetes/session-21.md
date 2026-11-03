# Slide buổi 21 – Kubernetes Introduction

> **Tóm tắt:** Vì sao cần orchestration, các thành phần của Kubernetes, và dựng cluster kind club bằng kubectl. Lệnh lab nằm ở bài học, slide chỉ giữ khung.

Bài học: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md)

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: gọi tên thành phần, dựng cluster, chẩn đoán kubectl](/slides/img/s21-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: giải thích vì sao Compose không đủ; phân biệt control plane và worker node; mô tả đường đi của một yêu cầu từ `kubectl` tới container; dựng cluster kind `club`; chẩn đoán lỗi kubectl không kết nối được.
:::

---

## Slide 2: Compose chạy tốt trên một máy, rồi sao nữa?

![Một máy chạy Compose, nhưng bạn muốn nhiều bản sao, tự phục hồi, nhiều máy](/slides/img/s21-compose-limit.svg)

::: details Ghi chú cho mentor
- Club Management chạy bằng `compose.yaml` trên một máy. Muốn 3 bản sao backend, tự khởi động lại bản chết, cập nhật không gián đoạn.
- Compose mô tả một stack trên một host, không tự dàn container sang máy khác.
:::

---

## Slide 3: Compose và Kubernetes

| Nhu cầu | Compose (1 host) | Kubernetes |
| --- | --- | --- |
| Nhiều bản sao | Thủ công | Khai báo `replicas` |
| Container chết | Restart trên cùng máy | Tạo lại, có thể sang node khác |
| Cập nhật | Tự làm | Rolling update, rollback |
| Nhiều máy | Không | Mục đích thiết kế |

::: details Ghi chú cho mentor
- Orchestration: tự động hóa vòng đời container ở quy mô nhiều bản sao, nhiều máy (lên lịch, tự phục hồi, scale, cập nhật, cấu hình, mạng).
- Kubernetes (K8s) là hệ thống orchestration phổ biến nhất; stack nhỏ trên một máy vẫn nên dùng Compose.
- Ví von: Compose là người quản lý quán nhỏ tự làm hết; Kubernetes là bộ máy điều hành cả chuỗi quán.
:::

---

## Slide 4: Reconciliation loop: so sánh rồi sửa

![Controller so sánh mong muốn với thực tế rồi tạo thêm Pod, lặp mãi](/slides/img/s21-reconcile.svg)

::: details Ghi chú cho mentor
- Declarative: bạn mô tả "cái gì" (YAML), không mô tả "làm thế nào". Ví dụ: "luôn có 2 bản `club-api`".
- Controller đọc mong muốn, đọc thực tế, sửa chênh lệch, rồi lặp lại. Đây là ý tưởng xuyên suốt khóa Kubernetes.
:::

---

## Slide 5: Control plane quyết định, node chạy Pod

![Control plane gồm apiserver, etcd, scheduler, controller-manager; node gồm kubelet, kube-proxy, containerd](/slides/img/s21-components.svg)

::: details Ghi chú cho mentor
- kube-apiserver: cổng duy nhất. etcd: kho key-value lưu trạng thái. kube-scheduler: chọn node cho Pod chưa có node. kube-controller-manager: chạy các controller đưa thực tế về mong muốn.
- kubelet: agent trên node, chạy Pod được giao. kube-proxy: cài luật mạng cho Service. containerd: thực sự chạy container (kind dùng containerd).
- Phân biệt: kubelet lo Pod, kube-proxy lo đường mạng.
:::

---

## Slide 6: Mọi thứ đi qua API Server

![API Server ở giữa; kubectl, scheduler, controller-manager, kubelet đều nói chuyện qua nó; chỉ nó nói với etcd](/slides/img/s21-hub.svg)

::: details Ghi chú cho mentor
- Các thành phần không gọi trực tiếp nhau; API Server là nơi tập trung xác thực, phân quyền và kiểm tra hợp lệ.
- Hỏi: vì sao `kubectl` không nói chuyện thẳng với etcd?
:::

---

## Slide 7: Một yêu cầu đi từ kubectl tới container

![Năm bước từ kubectl apply tới kubelet báo Running](/slides/img/s21-flow.svg)

::: details Ghi chú cho mentor
- Đây là luồng khi tạo một Deployment (làm ở buổi 22): manifest được ghi vào etcd, controller tạo ReplicaSet rồi Pod, scheduler chọn node, kubelet chạy container và báo `Running`, `Ready`.
- `kubectl get pods` đọc lại trạng thái từ API Server.
:::

---

## Slide 8: kubectl chỉ nói chuyện với context hiện tại

![kubectl đọc kubeconfig, context kind-club trỏ tới cluster club](/slides/img/s21-context.svg)

::: details Ghi chú cho mentor
- `kubectl` chỉ là client gọi API Server. Thông tin cluster nằm ở kubeconfig, mặc định `~/.kube/config`.
- Context = cluster + user + namespace. Thói quen: `kubectl config current-context` trước khi apply.
- Không commit kubeconfig.
:::

---

## Slide 9: kind: mỗi node là một container Docker

![Container club-control-plane chứa Kubernetes; docker ps và kubectl get nodes thấy cùng một thứ](/slides/img/s21-kind.svg)

::: details Ghi chú cho mentor
- kind = Kubernetes IN Docker. Tên node: `<tên-cluster>-control-plane`, `<tên-cluster>-worker`; context là `kind-<tên-cluster>`.
- Chạy hoàn toàn trên máy bạn, không expose ra Internet; phù hợp học tập và CI, không phải production.
- Môi trường cả khóa: cluster `club`, context `kind-club`. Máy 8 GB tắt Compose trước khi dựng kind.
:::

---

## Slide 10: Demo: dựng và nhìn vào cluster

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
- Cho thấy Pod trong `kube-system`: etcd, apiserver, scheduler, controller-manager, kube-proxy (`kubectl get pods -n kube-system`).
- Không có Pod `kubelet`: kubelet chạy như tiến trình trên node.
:::

---

## Slide 11: Lab: ba phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Tạo cluster `club` từ `kind-config.yaml` | Node `Ready`, context `kind-club` |
| 2 | Xem bên trong, lập bảng thành phần | Chỉ ra Pod `etcd-` và `kube-apiserver-` |
| 3 | Tự dừng control plane rồi khôi phục | Node `Ready` trở lại |

Lệnh, kết quả mong đợi và bảng lỗi: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md).

---

## Slide 12: Break: dừng control plane

![docker stop club-control-plane làm kubectl bị từ chối kết nối; điều tra theo 3 bước rồi docker start](/slides/img/s21-break.svg)

::: details Ghi chú cho mentor
- Triệu chứng: `connection refused` hoặc timeout khi chạy `kubectl get nodes`.
- Điều tra theo thứ tự: Docker, rồi container node, rồi context.
- Khôi phục: `docker start` container node, đợi 30-60 giây; nếu cổng đổi thì `kind export kubeconfig --name club`.
:::

---

## Slide 13: Recap và nộp bài

![Ba điều cần nhớ: khai báo, qua API Server, kind và context](/slides/img/s21-recap.svg)

Nộp `lab-21/`: `README.md`, `evidence/command-output.txt`, `report.md`. Giữ cluster `club` cho [Buổi 22 – Pods & Deployments](session-22.md).

::: details Ghi chú cho mentor
- Không commit kubeconfig.
- Mọi thứ đi qua API Server; chỉ API Server nói chuyện với etcd.
:::

---

## Slide 14: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/): Kubernetes là gì và giải quyết vấn đề nào.
- **Tài liệu chính thức:** [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/): API Server, etcd, kubelet làm gì.
- **Tài liệu chính thức:** [kind Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/): tạo cluster Kubernetes ngay trên laptop.
- **Best practice:** [Cloud native security overview](https://kubernetes.io/docs/concepts/security/overview/): các lớp bảo mật khi chạy Kubernetes.
- **Best practice:** [The Twelve-Factor App](https://12factor.net/): nguyên tắc thiết kế app dễ chạy trên cloud.
