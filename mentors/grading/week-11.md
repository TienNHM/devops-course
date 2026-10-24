# Chấm điểm tuần 11 – Kubernetes Setup & Workloads

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài và bảng điểm ngắn: [Bài tập tuần 11](../../assignments/weekly/week-11.md). Đáp án mẫu: [Walkthrough tuần 11](../walkthroughs/week-11.md). Kịch bản dạy: [buổi 21](../sessions/session-21.md), [buổi 22](../sessions/session-22.md).
:::

## Điều chỉnh sau khi chuẩn hóa môi trường

Môi trường cả khóa nay thống nhất cluster kind tên `club`, context `kind-club` (tạo từ `starter-project/k8s/kind-config.yaml`). Vì vậy so với bản barem gốc ở dưới:

- Nhiệm vụ 1: cluster chính là `club` (1 node), không còn `club-hw11` 3 node. Việc tự viết file cấu hình 3 node, đặt tên cluster `club-3`, và giải thích taint chuyển thành thử thách L2 số 1 (tối đa 3 điểm). Khi chấm NV1 (15 điểm) chỉ cần: `kubectl get nodes -o wide` có node `club-control-plane` `Ready`, context `kind-club`, `docker ps` thấy container node, phiên bản kubectl và kind (kind từ 0.23).
- Nhiệm vụ 2: bảng thành phần khớp với `kubectl get pods -n kube-system -o wide` của cluster `club`. Với 1 node, mọi Pod nằm trên `club-control-plane`; ý "kube-proxy mỗi node một Pod" chỉ kiểm tra được nếu học viên làm L2 3 node.
- Nhiệm vụ 3 đến 5: thay `--name club-hw11` bằng `--name club`; lỗi "quên `--name`" nay là quên `--name club`.
- Tên L2 trong đề là `club-api-extra` (Deployment tự viết); lab dùng `club-api-canary`. Đáp án giống nhau, chỉ đổi tên và `track`.
- Bài tập tuần nay là nộp lại bằng chứng của lab. Dấu hiệu bài không tự làm: output trùng hệt tài liệu, file `kind-club-3.yaml` giống file ví dụ, dùng đúng tag `1.0.9` của lab ở NV5.

## Barem chi tiết (bản gốc, giữ nguyên)

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: cluster 3 node | Đủ 3 node Ready, file cấu hình tự viết, giải thích taint đúng | Thiếu node, sai context hoặc không giải thích taint | 15 |
| Nhiệm vụ 2: bản đồ cluster | Bảng khớp output thật, sơ đồ đủ bước | Bảng không khớp output hoặc sơ đồ thiếu bước chính | 15 |
| Nhiệm vụ 3: deploy Club API | 2/2 Ready, ba endpoint trả đúng, không lộ secret, trả lời đúng ba câu về manifest | API không gọi được, hoặc có secret trong repo | 20 |
| Nhiệm vụ 4: rolling update và rollback | Có 2 revision, image đổi đúng, rollback xác nhận bằng output, giải thích ReplicaSet | Thiếu một trong các bước hoặc không có bằng chứng rollback | 20 |
| Nhiệm vụ 5: ImagePullBackOff | Đủ triệu chứng, nguyên nhân gốc, sửa; chứng minh dịch vụ còn chạy | Chỉ nêu "sai tag" không có Events, hoặc không khôi phục | 15 |
| Chất lượng report và câu hỏi kiểm tra | 5 câu trả lời đúng, ngắn, có lý do | Trả lời chung chung hoặc sai khái niệm | 10 |
| Quy trình nộp | PR đúng cấu trúc, đã có review, nộp đúng hạn | Thiếu review, sai cấu trúc hoặc trễ hạn | 5 |
| Tổng L1 |  |  | 100 |
| L2: thử thách 1 | Endpoint đúng, giải thích đúng cơ chế selector | Thiếu endpoint hoặc giải thích sai | tối đa 3 |
| L2: thử thách 2 | Có file watch chứng minh giới hạn 4 đến 5 Pod, phép tính đúng | Không có bằng chứng theo thời gian | tối đa 3 |
| L2: thử thách 3 | Chứng minh rollout kẹt, dịch vụ vẫn chạy, khôi phục xong | Thiếu một trong ba | tối đa 4 |
| Tổng thưởng L2 |  |  | tối đa 10 |

Cách quy đổi L2 trong đề mới (tổng vẫn tối đa 10 điểm): thử thách cluster 3 node 3 điểm (3 node `Ready`, file cấu hình tự viết, giải thích taint); Deployment tự viết 2 điểm (tiêu chí của thử thách 1 gốc); rolling update có kiểm soát 2 điểm (tiêu chí của thử thách 2 gốc); rollout bị kẹt 3 điểm (tiêu chí của thử thách 3 gốc). L2 chỉ chấm khi L1 từ 70 điểm.

## Lỗi hay bị trừ điểm

- Output trong evidence do tự gõ hoặc sửa tay, không phải kết quả lệnh thật.
- Quên `--name club-hw11` khi `kind load docker-image` nên image vào nhầm cluster, Pod vẫn ImagePullBackOff (trong môi trường mới: quên `--name club`).
- Commit file Secret có mật khẩu thật, hoặc để `.env` trong repo.
- Dùng tag `latest` hoặc không đổi tag giữa hai phiên bản nên rolling update không xảy ra.
- Sửa Deployment bằng `kubectl edit` trong L2, khiến file trong `source/` không khớp trạng thái cluster.
- Làm việc trong `/mnt/c`, dẫn tới lỗi quyền và build chậm.
- Chỉ nêu "sai tag" mà không chỉ ra dòng Events chứng minh.
- Không dọn cluster bằng `kind delete cluster --name club-hw11` sau khi nộp nên cạn RAM ở buổi sau (không trừ điểm nhưng mentor sẽ nhắc). Trong môi trường mới: giữ cluster `club` cho tuần 12 và chỉ xóa cluster L2 như `club-3`.
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

Điều cần thấy: context `kind-club`; deployment `club-api` READY 2/2; history có ít nhất 2 revision; `crictl images` có tag học viên đã build; `git ls-files` chỉ có file example, không có file Secret chứa giá trị thật.

## Câu hỏi vấn đáp

Lấy nguyên văn từ bảng chấm trong [Walkthrough tuần 11](../walkthroughs/week-11.md), mục "Hướng dẫn chấm cho mentor".

| Tiêu chí | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- |
| NV1: cluster 3 node (15) | File giống hệt `examples/kubernetes/kind-3-nodes.yaml` (kể cả `extraPortMappings` thừa) hoặc giống bạn khác từng dòng; tên cluster vẫn là `club-lab-3`; taint nói chung chung | Nếu bỏ một dòng role: worker thì chuyện gì xảy ra? Vì sao Pod Club API không lên control plane? Muốn Pod lên control plane thì cần gì? |
| NV2: bản đồ cluster (15) | Bảng có kubelet ở dạng Pod; tên Pod trong bảng không có trong output; thiếu bước ghi etcd | Vì sao không thấy Pod kubelet? Scheduler chết thì Pod đang chạy ra sao? Vì sao chỉ API Server nói chuyện với etcd? |
| NV3: deploy Club API (20) | `/api/members` thành công nhưng không có bước `init.sql`; mật khẩu trong file commit; context sai | Label nào nối Deployment với Pod? Probe nào quyết định nhận traffic? Nếu sai mật khẩu DB, Pod ở trạng thái nào và vì sao? |
| NV4: rolling update và rollback (20) | `curl` sau rollback vẫn thấy thay đổi nhưng không giải thích (port-forward cũ); image giữ nguyên tag nhưng tuyên bố đã update | Vì sao còn ReplicaSet cũ? Rollback tạo ReplicaSet mới hay dùng lại? Với 2 replicas, vì sao luôn có 2 Pod Ready? |
| NV5: ImagePullBackOff (15) | Dùng đúng tag `1.0.9` của lab; chỉ ghi "sai tag" không có Events; không có bước khôi phục | Nếu tag đúng nhưng bạn quên bước nạp image thì sửa thế nào? Vì sao kubelet đi pull từ Docker Hub? Làm sao chứng minh image không có trong node? |
| Report và 5 câu hỏi (10) | Trả lời sao nguyên văn lab; sai khái niệm (ví dụ cho rằng scheduler chết thì Pod đang chạy bị xóa) | Chọn một câu của học viên và yêu cầu giải thích lại bằng ví dụ khác |
| Quy trình nộp (5) | Review chung chung ("ok"), PR không có commit nhỏ | Nhận xét review nào đã được sửa và sửa ở file nào? |

## Đáp án 5 câu hỏi kiểm tra kiến thức

1. Node của kind là container Docker nên `docker ps` thấy chúng và `kubectl get nodes` thấy cùng các node đó dưới góc nhìn Kubernetes. Dừng container control plane là tắt API Server: kubectl báo `connection refused` hoặc timeout dù worker vẫn chạy.
2. Pod đang chạy vẫn chạy (kubelet tự quản lý). Pod mới tạo ra ở `Pending` vì không ai gán node, cho tới khi scheduler hoạt động lại.
3. Pod là đơn vị chạy container, tạm thời, không tự quay lại; ReplicaSet giữ đúng N Pod theo selector; Deployment quản lý ReplicaSet và thêm rolling update, rollback. Pod trần chết là mất, không scale, không cập nhật có kiểm soát.
4. Readiness probe quyết định Pod được thêm vào Endpoints của Service. Nếu probe luôn thất bại, rollout bị kẹt (timeout), Pod cũ vẫn phục vụ khi `maxUnavailable` là 0.
5. `kubectl get pods`, `kubectl describe pod` đọc Events; kiểm tra tên và tag; với kind xem image có trong node không (`docker exec club-control-plane crictl images`) và đã `kind load docker-image ... --name club` chưa; cuối cùng mới tới registry và `imagePullSecrets`.
