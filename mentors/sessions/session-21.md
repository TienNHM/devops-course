# Kịch bản mentor – Buổi 21: Kubernetes Introduction

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md). Slide: [Slide buổi 21](../../slides/05-kubernetes/session-21.md). Đáp án và barem: [Walkthrough tuần 11](../walkthroughs/week-11.md), [Chấm điểm tuần 11](../grading/week-11.md).
:::

## Khung thời gian buổi (120 phút)

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian gợi ý cho phần thực hành của buổi 21: chuẩn bị 5', Phần 1 (cluster `club`) 15', Phần 2 (khám phá cluster) 15', Phần 3 (phá lỗi) 10', Phần 4 (ghi bằng chứng) 5'. Cluster 3 node và các thử thách khác là L2, làm ở nhà.

## Chuẩn bị trước buổi

- Chốt môi trường cho cả tuần 11-14: cluster kind tên `club`, context `kind-club`, tạo bằng `kind create cluster --name club --config starter-project/k8s/kind-config.yaml`. Học viên giữ cluster này sang buổi 22.
- Nhắc máy 8 GB: tắt stack Compose (`docker compose down`) trước khi dựng kind; không tạo cluster nhiều node trên máy 8 GB.
- Cổng 80 và 443 của máy phải rảnh vì `kind-config.yaml` ánh xạ hai cổng này (liên hệ scenario-01).
- Kiểm tra trước giờ học: học viên đã clone repo giáo trình vào `~/devops-course` trong WSL và đã có kubectl, kind theo [Hướng dẫn cài đặt](../../resources/setup-guide.md).

## Demo của mentor

Mentor demo trên máy chiếu, lớp quan sát. Giả sử đã cài sẵn kubectl và kind.

1. Tạo cluster mặc định:

   ```bash
   kind create cluster --name club-demo
   ```

   Kết quả mong đợi (rút gọn):

   ```text
   Creating cluster "club-demo" ...
    ✓ Ensuring node image (kindest/node:v1.30.x)
    ✓ Preparing nodes
    ✓ Writing configuration
    ✓ Starting control-plane
    ✓ Installing CNI
    ✓ Installing StorageClass
   Set kubectl context to "kind-club-demo"
   ```

2. Cho lớp thấy node là container:

   ```bash
   docker ps --format 'table {{.Names}}\t{{.Image}}'
   kubectl get nodes -o wide
   ```

   Kết quả mong đợi: `docker ps` có container `club-demo-control-plane` (image `kindest/node`); `kubectl get nodes` có một node `Ready` với vai trò `control-plane`.

3. Chỉ các thành phần control plane:

   ```bash
   kubectl get pods -n kube-system
   ```

   Kết quả mong đợi (rút gọn): các Pod `etcd-club-demo-control-plane`, `kube-apiserver-club-demo-control-plane`, `kube-controller-manager-club-demo-control-plane`, `kube-scheduler-club-demo-control-plane`, cùng `coredns-...`, `kube-proxy-...`, `kindnet-...` đều `Running`.

4. Cho lớp thấy kubectl chỉ là client gọi API:

   ```bash
   kubectl get --raw /readyz
   kubectl cluster-info
   ```

   Kết quả mong đợi: `/readyz` trả `ok`; `cluster-info` in địa chỉ control plane dạng `https://127.0.0.1:<port>`.

5. Dọn dẹp: `kind delete cluster --name club-demo`.

Lưu ý khi demo: nếu mentor chạy demo trên máy cùng cluster `club` của lớp thì đổi `club-demo` thành `club` ở mọi lệnh và đừng xóa cluster cuối buổi.

Câu hỏi mentor nên hỏi lớp:

- Tại sao ta thấy etcd và scheduler dưới dạng Pod trong `kube-system`? (kubeadm chạy chúng như static Pod do kubelet quản lý.)
- Nếu scheduler ngừng hoạt động, điều gì xảy ra với Pod đang chạy? Với Pod mới? (Pod đang chạy vẫn chạy; Pod mới ở Pending tới khi scheduler quay lại. Lưu ý: xóa Pod `kube-scheduler` bằng kubectl không làm nó dừng, vì đó chỉ là bản phản chiếu của static Pod do kubelet quản lý.)
- Vì sao chỉ API Server được nói chuyện với etcd?

## Ghi chú giảng viên theo slide

Số slide theo [slide buổi 21](../../slides/05-kubernetes/session-21.md).

- Slide 1 (Mục tiêu): Nêu mục tiêu trong 2 phút. Nhấn mạnh hôm nay chưa deploy ứng dụng, chỉ dựng nền để dùng cho cả tuần 11-14. Hỏi lớp: ai đã từng nghe tới Kubernetes, nghe ở đâu.
- Slide 2 (Vấn đề thực tế): Gợi chuyện: laptop của một bạn đang chạy API, bạn đó tắt máy thì CLB mất dịch vụ. Hỏi lớp: nếu có 3 máy, ai quyết định container nào chạy ở máy nào. Khoảng 3 phút.
- Slide 3 (Orchestration): Chiếu bảng so sánh ở slide sau. Tránh sa đà vào lịch sử Kubernetes. 2 phút.
- Slide 4 (Compose và Kubernetes): Hỏi lớp: dòng nào là lý do quan trọng nhất với CLB của mình. Nhắc lại Kubernetes có đường cong học tập cao hơn, đó là lý do ta học từng bước. 2 phút.
- Slide 5 (Declarative và reconciliation loop): Ví dụ đời thường: điều hòa giữ 25 độ, đo nhiệt độ liên tục và bật tắt máy nén. Hỏi lớp: nếu một bản chết thì controller làm gì. 3 phút.
- Slide 6 (Control plane): Dùng ví dụ công ty: API Server là lễ tân, etcd là sổ sách, scheduler là người xếp chỗ ngồi, controller là quản lý theo dõi chỉ tiêu. Chỉ API Server được nói chuyện với etcd. 4 phút.
- Slide 7 (Thành phần trên mỗi node): Hỏi lớp: kubelet và kube-proxy khác nhau thế nào (đây cũng là câu tự kiểm tra số 7 trong bản cũ của bài). 2 phút.
- Slide 8 (Kiến trúc cluster): Chỉ theo mũi tên, để lớp nhìn mô hình hình sao quanh API Server. Hỏi: vì sao thiết kế như vậy (xác thực, phân quyền, kiểm tra hợp lệ tập trung một chỗ). 3 phút.
- Slide 9 (Luồng một yêu cầu): Đây là slide quan trọng nhất của buổi. Yêu cầu học viên nhắc lại luồng bằng lời của mình. Buổi 22 sẽ quay lại luồng này với Deployment thật. 4 phút.
- Slide 10 (kubectl, kubeconfig, context): Cảnh báo: làm việc trên nhầm cluster là lỗi tốn kém nhất ngoài đời thật. Tập thói quen kiểm tra context trước khi apply. 2 phút.
- Slide 11 (kind): Nhắc nhu cầu RAM: 4 GB cho 1 node, nên 6 GB trở lên cho 3 node. Ai máy yếu thì chỉ làm L1. 2 phút.
- Slide 12 (Demo tạo cluster): Chạy trực tiếp trên máy chiếu. Điểm cần chỉ: node trong `kubectl get nodes` và container trong `docker ps` là cùng một thứ. Khoảng 5 phút kể cả thời gian chờ tạo cluster.
- Slide 13 (Demo control plane là các Pod): Câu hỏi cho lớp: nếu scheduler ngừng, Pod đang chạy và Pod mới bị ảnh hưởng thế nào (Pod cũ vẫn chạy, Pod mới Pending). Vì sao chỉ API Server nói chuyện với etcd. 4 phút.
- Slide 14 (Lab: cài công cụ): Làm trong terminal WSL, không dùng `/mnt/c`. Nhắc pin kind v0.23.0 để cả lớp cùng phiên bản. Đi vòng kiểm tra output. 10 phút.
- Slide 15 (Lab L1: cluster): Lần đầu tải image node mất 1-3 phút, tranh thủ giải thích lại luồng ở slide 9. Nhắc ghi output vào `evidence/command-output.txt` bằng `tee -a`. 15 phút.
- Slide 16 (Lab L2: cluster 3 node): Yêu cầu học viên tự viết file YAML, không chép. Câu hỏi: vì sao control plane không nhận Pod ứng dụng. L2 làm thêm thử thách `kubectl version` và `get --raw '/readyz?verbose'` để chứng minh cluster khỏe. 20 phút. Trong bản mới, cluster 3 node tên `club-3` là thử thách L2 làm ở nhà và phải xóa ngay sau khi xong.
- Slide 17 (Phá lỗi: dừng control plane): Mentor chạy trước, lớp đoán nguyên nhân, rồi lớp tự làm lại. Kết luận: node kind là container, dừng container tương đương tắt máy chủ control plane. Kiểm tra Docker trước khi nghi ngờ Kubernetes. 8 phút.
- Slide 18 (Lỗi thường gặp): Lỗi `address already in use` sẽ gặp thật vì `starter-project/k8s/kind-config.yaml` map cổng 80 và 443. Liên hệ với scenario-01 (port đã được sử dụng). 2 phút.
- Slide 19 (Thử thách): Gợi ý đáp án: file của starter có 1 control-plane, gắn nhãn để Ingress controller chọn đúng node, map cổng 80 và 443 ra host để truy cập `club.localhost`. Giao làm ở nhà nếu hết giờ.
- Slide 20 (Recap và nộp bài): Hỏi nhanh 2-3 câu tự kiểm tra: kubectl nói chuyện trực tiếp với kubelet được không, reconciliation loop là gì. Báo trước buổi sau: Pods và Deployments trên chính cluster `club` vừa tạo, nên không xóa cluster này.

## Lưu ý riêng cho người dạy

- Bản cũ của bài cho học viên tạo `club-lab` rồi `club-lab-3` và xóa trước buổi 22. Bản mới giữ một cluster `club` xuyên suốt để học viên không phải dựng lại; nếu học viên còn cluster cũ (`club-lab`, `club-lab-3`, `club-hw11`), nhắc `kind get clusters` rồi xóa bằng `kind delete cluster --name <tên>`.
- Cluster 3 node chỉ là L2: máy 8 GB không nên chạy cùng lúc cluster `club` và cluster 3 node. Học viên phải `kind delete cluster --name club-3` ngay sau khi xong thử thách.
- Phá lỗi dừng control plane chạy trên chính cluster `club`: sau `docker start club-control-plane` đợi 30-60 giây rồi `kubectl get nodes`; nếu cổng API đổi thì `kind export kubeconfig --name club`.
- Câu tự kiểm tra bản cũ về taint và kubelet so với kube-proxy vẫn nên được hỏi miệng: control plane của kind có taint `NoSchedule` nên Pod ứng dụng không lên đó mặc định (với cluster 1 node của `club`, kind gỡ taint này để Pod chạy được); kubelet chạy và báo trạng thái Pod, kube-proxy cài luật mạng cho Service.
