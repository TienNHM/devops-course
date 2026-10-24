# Hướng dẫn chấm tuần 11 – Kubernetes Setup & Workloads

::: warning Dành cho mentor
Trang này dành cho người chấm. Đề bài và bảng điểm ngắn: [Bài tập tuần 11](../../assignments/weekly/week-11.md). Đáp án và bằng chứng cần thấy: [Đáp án tuần 11](../walkthroughs/week-11.md). Bài học: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md) và [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md).
:::

> **Tóm tắt:** Barem chi tiết (đạt và không đạt), lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp để chấm bài tuần 11. Môi trường chuẩn: cluster kind `club`, context `kind-club`.

## Barem chi tiết

Tổng 100 điểm L1, cộng tối đa 10 điểm thưởng L2. L2 chỉ chấm khi L1 từ 70 điểm. Mọi nhiệm vụ làm trên cluster `club` (1 node `club-control-plane`), tạo từ `starter-project/k8s/kind-config.yaml`.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: cluster `club` chạy tốt | Context `kind-club`, `get nodes -o wide` có `club-control-plane` `Ready`, `docker ps` thấy container node, có phiên bản kubectl và kind (kind từ 0.23) | Thiếu node hoặc sai context; thiếu phiên bản công cụ | 15 |
| Nhiệm vụ 2: bản đồ cluster | Bảng khớp output `get pods -n kube-system -o wide` (đúng tên Pod và node), sơ đồ đủ bước chính | Bảng không khớp output hoặc sơ đồ thiếu bước chính | 15 |
| Nhiệm vụ 3: deploy Club API | 2/2 Ready, ba endpoint trả đúng, không lộ secret, trả lời đúng ba câu về manifest | API không gọi được, hoặc có secret trong repo | 20 |
| Nhiệm vụ 4: rolling update và rollback | Có 2 revision, image đổi đúng, rollback xác nhận bằng output, giải thích ReplicaSet | Thiếu một trong các bước hoặc không có bằng chứng rollback | 20 |
| Nhiệm vụ 5: ImagePullBackOff | Tag lỗi riêng; đủ triệu chứng, nguyên nhân gốc, sửa; chứng minh dịch vụ còn chạy | Chỉ nêu "sai tag" không có Events, hoặc không khôi phục | 15 |
| Report và câu hỏi kiểm tra | 5 câu trả lời đúng, ngắn, có lý do | Trả lời chung chung hoặc sai khái niệm | 10 |
| Quy trình nộp | PR đúng cấu trúc, đã có review, nộp đúng hạn | Thiếu review, sai cấu trúc hoặc trễ hạn | 5 |
| Tổng L1 | | | 100 |
| L2-A: cluster 3 node `club-3` | 3 node `Ready`, file cấu hình tự viết, giải thích taint đúng, đã xóa cluster sau khi xong | Thiếu node, sao chép file ví dụ, hoặc không giải thích taint | tối đa 3 |
| L2-B: Deployment tự viết | `get endpointslices` có 3 địa chỉ, giải thích đúng cơ chế selector | Thiếu endpoint hoặc giải thích sai | tối đa 2 |
| L2-C: rolling update có kiểm soát | Có file `get pods -w` chứng minh giới hạn 4 đến 5 Pod, phép tính đúng | Không có bằng chứng theo thời gian | tối đa 2 |
| L2-D: rollout bị kẹt | Chứng minh rollout kẹt, dịch vụ vẫn chạy, khôi phục xong | Thiếu một trong ba | tối đa 3 |
| Tổng thưởng L2 | | | tối đa 10 |

Bài không có output thật của máy học viên cho một nhiệm vụ thì nhiệm vụ đó tối đa một nửa điểm.

## Lỗi hay bị trừ điểm

- Output trong evidence do tự gõ hoặc sửa tay, không phải kết quả lệnh thật.
- Quên `--name club` khi `kind load docker-image` nên image vào nhầm cluster, Pod vẫn ImagePullBackOff.
- Commit file Secret có mật khẩu thật, hoặc để `.env` hay kubeconfig trong repo.
- Dùng tag `latest` hoặc không đổi tag giữa hai phiên bản nên rolling update không xảy ra.
- Dùng đúng tag lỗi `1.0.9` của lab ở nhiệm vụ 5 thay vì tag riêng.
- Sửa Deployment bằng `kubectl edit` trong L2, khiến file trong `source/` không khớp trạng thái cluster.
- Làm việc trong `/mnt/c`, dẫn tới lỗi quyền và build chậm.
- Chỉ nêu "sai tag" mà không chỉ ra dòng Events chứng minh.
- Để cluster `club-3` của thử thách L2 chạy tiếp (không trừ điểm, nhưng mentor nhắc xóa ngay để khỏi cạn RAM). Cluster `club` giữ lại cho tuần 12.
- Nộp sát hạn mà PR chưa có người review.

## Lệnh kiểm tra nhanh

Chạy trên máy của học viên hoặc đối chiếu với `evidence/command-output.txt`:

```bash
kubectl config current-context
kubectl get nodes -o wide
kubectl get pods -n kube-system -o wide
kubectl get deployment,replicaset,pod -n club -l app=club-api
kubectl rollout history deployment/club-api -n club
kubectl get deployment club-api -n club -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
docker exec club-control-plane crictl images | grep club-api
git ls-files | grep -i secret
```

Điều cần thấy: context `kind-club`; Deployment `club-api` READY 2/2; history có ít nhất 2 revision; `crictl images` có tag học viên đã build; `git ls-files` chỉ có file example, không có file Secret chứa giá trị thật.

## Câu hỏi vấn đáp

Dùng khi nghi ngờ bài chép hoặc muốn kiểm tra mức hiểu. Bằng chứng cần thấy và dấu hiệu bài chép nằm ở mục "Hướng dẫn chấm cho mentor" của [Đáp án tuần 11](../walkthroughs/week-11.md).

| Nhiệm vụ | Câu hỏi |
| --- | --- |
| 1 | Vì sao `docker ps` thấy node của cluster? Dừng container control plane thì kubectl báo gì? |
| 2 | Vì sao không thấy Pod kubelet? Scheduler chết thì Pod đang chạy ra sao? Vì sao chỉ API Server nói chuyện với etcd? |
| 3 | Label nào nối Deployment với Pod? Probe nào quyết định nhận traffic? Nếu sai mật khẩu DB, Pod ở trạng thái nào và vì sao? |
| 4 | Vì sao còn ReplicaSet cũ? Rollback tạo ReplicaSet mới hay dùng lại? Với 2 replicas, vì sao luôn có 2 Pod Ready? |
| 5 | Nếu tag đúng nhưng quên nạp image thì sửa thế nào? Vì sao kubelet đi pull từ Docker Hub? Làm sao chứng minh image không có trong node? |
| Report | Chọn một câu của học viên và yêu cầu giải thích lại bằng ví dụ khác. |
| Quy trình | Nhận xét review nào đã được sửa và sửa ở file nào? |
| L2-A | Nếu bỏ một dòng `role: worker` thì chuyện gì xảy ra? Vì sao Pod Club API không lên control plane? Muốn Pod lên control plane thì cần gì? |

## Đáp án 5 câu hỏi kiểm tra kiến thức

1. Node của kind là container Docker nên `docker ps` thấy chúng và `kubectl get nodes` thấy cùng các node đó dưới góc nhìn Kubernetes. Dừng container control plane là tắt API Server: kubectl báo `connection refused` hoặc timeout.
2. Pod đang chạy vẫn chạy (kubelet tự quản lý). Pod mới tạo ra ở `Pending` vì không ai gán node, cho tới khi scheduler hoạt động lại.
3. Pod là đơn vị chạy container, tạm thời, không tự quay lại; ReplicaSet giữ đúng N Pod theo selector; Deployment quản lý ReplicaSet và thêm rolling update, rollback. Pod trần chết là mất, không scale, không cập nhật có kiểm soát.
4. Readiness probe quyết định Pod được thêm vào Endpoints của Service. Nếu probe luôn thất bại, rollout bị kẹt (timeout), Pod cũ vẫn phục vụ khi `maxUnavailable` là 0.
5. `kubectl get pods`, `kubectl describe pod` đọc Events; kiểm tra tên và tag; với kind xem image có trong node không (`docker exec club-control-plane crictl images`) và đã `kind load docker-image ... --name club` chưa; cuối cùng mới tới registry và `imagePullSecrets`.
