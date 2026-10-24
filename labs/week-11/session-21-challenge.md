# Buổi 21 – Thử thách thêm (L2)

Tuần 11/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 21/32

[Quay lại Buổi 21 – Kubernetes Introduction](session-21.md) · [Bài tập Tuần 11](../../assignments/weekly/week-11.md)

> **Tóm tắt:** Ba thử thách tùy chọn sau buổi 21: cluster 3 node club-3 bằng file tự viết, kiểm tra sức khỏe cluster chỉ bằng kubectl, đối chiếu cấu hình kind của starter project.

::: warning Trước khi làm
Cần xong phần lab bắt buộc ở [Buổi 21 – Kubernetes Introduction](session-21.md). Máy 8 GB không nên chạy cluster 3 node cùng lúc với cluster `club`: làm xong là xóa ngay bằng `kind delete cluster --name club-3`, rồi `kubectl config use-context kind-club`. Tự thử khoảng 15 phút trước khi mở gợi ý.
:::

**Thử thách 1. Cluster 3 node `club-3` bằng file cấu hình tự viết.** Tạo `source/kind-3-nodes.yaml` (1 control-plane, 2 worker) và cluster `club-3`. Tiêu chí: 3 node `Ready`; chỉ ra Pod nào chạy trên node nào; giải thích vì sao control plane không nhận Pod ứng dụng (taint). Cuối cùng chạy `kind delete cluster --name club-3` và `kubectl config use-context kind-club`.

::: details Gợi ý thử thách 1
Dùng `kubectl get pods -A -o wide` để xem cột NODE. Taint `NoSchedule` trên control plane ngăn Pod thường được lên lịch ở đó. Khung file:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

Vì sao: `role: worker` lặp 2 lần cho 2 worker; không khai báo `image` nên kind dùng node image mặc định. Bản `examples/kubernetes/kind-3-nodes.yaml` có thêm `extraPortMappings` cổng 80 và 443; bài này bỏ để khỏi trùng cổng với cluster `club`.

```bash
kind create cluster --name club-3 --config source/kind-3-nodes.yaml
kubectl get nodes -o wide
docker ps --filter name=club-3 --format 'table {{.Names}}\t{{.Status}}'
kubectl get pods -n kube-system -o wide
kubectl describe node club-3-control-plane | grep -i taints
kubectl describe node club-3-worker | grep -i taints
```

Kết quả mong đợi: 3 node `Ready` (`club-3-control-plane`, `club-3-worker`, `club-3-worker2`); `etcd-`, `kube-apiserver-`, `kube-scheduler-`, `kube-controller-manager-` chỉ ở control plane; `kube-proxy-` và `kindnet-` có một Pod mỗi node (DaemonSet); control plane có taint `node-role.kubernetes.io/control-plane:NoSchedule`, worker là `<none>`.
:::

**Thử thách 2. Chứng minh cluster khỏe chỉ bằng kubectl.** Không dùng `docker`, cho thấy phiên bản Kubernetes và API Server khỏe. Tiêu chí: output hai lệnh và giải thích mỗi lệnh đọc từ thành phần nào.

::: details Gợi ý thử thách 2
Chỉ cần hai lệnh: `kubectl version` (phần Server Version) và `kubectl get --raw '/readyz?verbose'`. Trong output thứ hai hãy tìm dòng nói về etcd. Cả hai đều là yêu cầu HTTPS tới API Server. Đối chiếu cách đọc kết quả với [trang tuần 11](README.md) sau khi nộp bài.
:::

**Thử thách 3. Đối chiếu cấu hình.** So `starter-project/k8s/kind-config.yaml` với file 3 node của bạn, giải thích `extraPortMappings` và nhãn `ingress-ready=true` trong 3-5 câu ở `report.md`.

::: details Gợi ý thử thách 3
So sánh ba điểm: số node, nhãn `ingress-ready=true`, khối `extraPortMappings` (cổng 80 và 443). Với mỗi khối hãy hỏi: nó phục vụ việc gì ở tuần 12 (truy cập `club.localhost`), và điều gì xảy ra nếu máy đã có tiến trình dùng cổng 80?
:::
