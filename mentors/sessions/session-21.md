# Kịch bản buổi 21 – Kubernetes Introduction

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md) và [Thử thách thêm](../../labs/week-11/session-21-challenge.md). Slide: [Slide buổi 21](../../slides/05-kubernetes/session-21.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 11](../grading/week-11.md). Đáp án: [Đáp án tuần 11](../walkthroughs/week-11.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 21: khung 120 phút, chuẩn bị môi trường kind, demo dựng cluster, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc Compose chạy một stack trên một máy; hỏi điều gì xảy ra khi máy đó hỏng |
| 15-45 | Kiến thức và demo | Orchestration, declarative, control plane và node, luồng một yêu cầu, demo dựng cluster kind |
| 45-105 | Thực hành | Chuẩn bị 5', Phần 1 (cluster `club`) 15', Phần 2 (xem bên trong cluster) 15', Phần 3 (tự phá rồi sửa) 10', ghi bằng chứng và checklist 5' |
| 105-120 | Review | Hỏi nhanh vài câu tự kiểm tra, nhắc giữ cluster `club` cho buổi 22 |

Cluster 3 node `club-3` và các thử thách khác là L2, làm ở nhà.

## Chuẩn bị trước buổi

- Chốt môi trường cho cả tuần 11-14: cluster kind tên `club`, context `kind-club`, tạo bằng `kind create cluster --name club --config starter-project/k8s/kind-config.yaml`. Học viên giữ cluster này sang buổi 22.
- Máy 8 GB: tắt stack Compose (`docker compose down`) trước khi dựng kind; không tạo cluster nhiều node.
- Cổng 80 và 443 của máy phải rảnh vì `kind-config.yaml` ánh xạ hai cổng này (liên hệ scenario-01).
- Học viên đã clone repo giáo trình vào `~/devops-course` trong WSL và đã có kubectl, kind theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).
- Nếu học viên còn cluster dư (ví dụ `club-lab`, `club-lab-3`, `club-hw11`): `kind get clusters` rồi `kind delete cluster --name <tên>`.

## Kịch bản demo

Mentor demo trên máy chiếu, lớp quan sát. Dùng đúng tên cluster của lớp (`club`) để lệnh khớp với bài lab. Đã cài sẵn kubectl và kind.

1. Tạo cluster:

   ```bash
   kind create cluster --name club --config ~/devops-course/starter-project/k8s/kind-config.yaml
   ```

   Kết quả mong đợi (rút gọn):

   ```text
   Creating cluster "club" ...
    ✓ Ensuring node image (kindest/node:v1.30.x)
    ✓ Preparing nodes
    ✓ Writing configuration
    ✓ Starting control-plane
    ✓ Installing CNI
    ✓ Installing StorageClass
   Set kubectl context to "kind-club"
   ```

2. Cho lớp thấy node là container:

   ```bash
   docker ps --format 'table {{.Names}}\t{{.Image}}'
   kubectl get nodes -o wide
   ```

   Kết quả mong đợi: `docker ps` có container `club-control-plane` (image `kindest/node`); `kubectl get nodes` có một node `Ready` với vai trò `control-plane`.

3. Chỉ các thành phần control plane:

   ```bash
   kubectl get pods -n kube-system
   ```

   Kết quả mong đợi (rút gọn): các Pod `etcd-club-control-plane`, `kube-apiserver-club-control-plane`, `kube-controller-manager-club-control-plane`, `kube-scheduler-club-control-plane`, cùng `coredns-...`, `kube-proxy-...`, `kindnet-...` đều `Running`.

4. Cho lớp thấy kubectl chỉ là client gọi API:

   ```bash
   kubectl get --raw /readyz
   kubectl cluster-info
   ```

   Kết quả mong đợi: `/readyz` trả `ok`; `cluster-info` in địa chỉ control plane dạng `https://127.0.0.1:<port>`.

Đừng xóa cluster cuối buổi nếu demo trên cluster `club` dùng chung.

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Vì sao etcd và scheduler hiện dưới dạng Pod trong `kube-system`? | kubeadm chạy chúng như static Pod do kubelet quản lý. |
| Nếu scheduler ngừng, Pod đang chạy và Pod mới bị ảnh hưởng thế nào? | Pod đang chạy vẫn chạy; Pod mới ở `Pending` tới khi scheduler quay lại. Xóa Pod `kube-scheduler` bằng kubectl không làm nó dừng, vì đó chỉ là bản phản chiếu của static Pod. |
| Vì sao chỉ API Server được nói chuyện với etcd? | Xác thực, phân quyền, kiểm tra hợp lệ tập trung một chỗ. |
| kubelet và kube-proxy khác nhau thế nào? | kubelet chạy và báo trạng thái Pod; kube-proxy cài luật mạng cho Service. |
| kubectl có nói chuyện trực tiếp với kubelet được không? | Không, kubectl chỉ gọi API Server. |
| Vì sao control plane của kind thường không nhận Pod ứng dụng? | Có taint `NoSchedule`. Với cluster 1 node `club`, kind gỡ taint này để Pod chạy được. |
| Reconciliation loop là gì? | Controller đọc mong muốn, đọc thực tế, sửa chênh lệch rồi lặp lại. |

## Ghi chú theo slide

Slide buổi 21 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): nhấn mạnh hôm nay chưa deploy ứng dụng, chỉ dựng nền để dùng cho cả tuần 11-14. Hỏi lớp: ai đã từng nghe tới Kubernetes, nghe ở đâu.
- Slide 2 – Vấn đề thực tế (3 phút): gợi chuyện laptop của một bạn đang chạy API, bạn đó tắt máy thì CLB mất dịch vụ. Hỏi: nếu có 3 máy, ai quyết định container nào chạy ở máy nào.
- Slide 3 – Orchestration và Compose (4 phút): chiếu bảng so sánh, tránh sa đà vào lịch sử Kubernetes. Hỏi lớp dòng nào là lý do quan trọng nhất với CLB. Nhắc Kubernetes có đường cong học tập cao hơn, đó là lý do ta học từng bước.
- Slide 4 – Declarative và reconciliation loop (3 phút): ví dụ điều hòa giữ 25 độ, đo nhiệt độ liên tục và bật tắt máy nén. Hỏi: nếu một bản chết thì controller làm gì.
- Slide 5 – Thành phần control plane (4 phút): ví dụ công ty: API Server là lễ tân, etcd là sổ sách, scheduler là người xếp chỗ ngồi, controller là quản lý theo dõi chỉ tiêu. Chỉ API Server được nói chuyện với etcd.
- Slide 6 – Thành phần trên mỗi node (2 phút): hỏi lớp kubelet và kube-proxy khác nhau thế nào.
- Slide 7 – Kiến trúc cluster (3 phút): chỉ theo mũi tên, để lớp thấy mô hình hình sao quanh API Server. Hỏi vì sao thiết kế như vậy.
- Slide 8 – Luồng một yêu cầu (4 phút): slide quan trọng nhất của buổi. Yêu cầu học viên nhắc lại luồng bằng lời của mình. Buổi 22 sẽ quay lại luồng này với Deployment thật.
- Slide 9 – kubectl, kubeconfig và context (2 phút): cảnh báo làm việc trên nhầm cluster là lỗi tốn kém nhất ngoài đời thật. Tập thói quen kiểm tra context trước khi apply.
- Slide 10 – kind là gì (2 phút): nhắc nhu cầu RAM: 4 GB cho 1 node, nên 6 GB trở lên cho 3 node. Máy yếu chỉ làm phần bắt buộc.
- Slide 11 – Demo (khoảng 5 phút kể cả thời gian chờ tạo cluster, theo kịch bản demo ở trên): điểm cần chỉ là node trong `kubectl get nodes` và container trong `docker ps` là cùng một thứ. Hỏi câu về scheduler và về etcd.
- Slide 12 – Lab (khoảng 5 phút giới thiệu):
  - Chuẩn bị: làm trong terminal WSL, không dùng `/mnt/c`; nhắc pin kind v0.23.0 để cả lớp cùng phiên bản; đi vòng kiểm tra output.
  - Phần 1: lần đầu tải image node mất 1-3 phút, tranh thủ giải thích lại luồng ở slide 8; nhắc ghi output vào `evidence/command-output.txt` bằng `tee -a`.
  - Phần 2: lập bảng thành phần. Phần 3: tự dừng control plane rồi khôi phục (xem slide 13).
- Slide 13 – Phá lỗi, dừng control plane (8 phút): mentor chạy trước, lớp đoán nguyên nhân, rồi lớp tự làm lại. Kết luận: node kind là container, dừng container tương đương tắt máy chủ control plane. Kiểm tra Docker trước khi nghi ngờ Kubernetes.
- Slide 14 – Recap và nộp bài (review 15 phút cuối): hỏi nhanh 2-3 câu tự kiểm tra (kubectl có nói chuyện trực tiếp với kubelet được không, reconciliation loop là gì). Báo trước buổi sau: Pods và Deployments trên chính cluster `club` vừa tạo, nên không xóa cluster này.

## Hỗ trợ khi học viên thực hành

- Lỗi `address already in use` sẽ gặp thật vì `kind-config.yaml` map cổng 80 và 443 (scenario-01, port đã được sử dụng).
- Phá lỗi dừng control plane chạy trên chính cluster `club`: sau `docker start club-control-plane` đợi 30-60 giây rồi `kubectl get nodes`; nếu cổng API đổi thì `kind export kubeconfig --name club`.
- Thử thách (xem [Thử thách thêm](../../labs/week-11/session-21-challenge.md)): cluster 3 node `club-3` học viên tự viết file YAML, không chép. Gợi ý cho thử thách đối chiếu cấu hình kind: file của starter có 1 control-plane, gắn nhãn để Ingress controller chọn đúng node, map cổng 80 và 443 ra host để truy cập `club.localhost`. Thử thách `kubectl version` và `get --raw '/readyz?verbose'` dùng để chứng minh cluster khỏe.

## Lưu ý riêng cho người dạy

- Cả khóa dùng một cluster `club` xuyên suốt tuần 11-14; học viên không phải dựng lại giữa các buổi.
- Cluster 3 node chỉ là L2: máy 8 GB không nên chạy cùng lúc cluster `club` và `club-3`. Học viên phải `kind delete cluster --name club-3` ngay sau khi xong rồi `kubectl config use-context kind-club`.
- Control plane của kind có taint `NoSchedule` nên Pod ứng dụng không lên đó mặc định (cluster 1 node `club` đã gỡ taint này). Đây là câu nên hỏi miệng cuối buổi cùng câu kubelet so với kube-proxy.
