# Bài tập tuần 11 – Kubernetes Setup & Workloads

> **Tóm tắt:** Dựng cluster kind 3 node bằng file cấu hình của riêng bạn, deploy Club API lên Kubernetes, thực hiện rolling update và rollback, rồi tự chẩn đoán một lỗi ImagePullBackOff. Mọi kết luận phải có lệnh và output thật làm bằng chứng.

**Phạm vi:** buổi 21 (Kubernetes Introduction) và buổi 22 (Pods & Deployments). Nộp trong `lab-21/` và `lab-22/` của repository cá nhân (ví dụ `devops-labs`).

## Bối cảnh

CLB muốn chuyển Club Management từ `compose.yaml` sang Kubernetes để chạy nhiều bản sao backend, tự phục hồi khi Pod chết và cập nhật phiên bản không làm gián đoạn dịch vụ. Mentor giao cho bạn một đợt "thử nghiệm nội bộ": tự dựng cluster local, đưa `club-api` lên cluster, chứng minh cập nhật và quay lui hoạt động, và ghi lại cách bạn xử lý khi image không kéo được.

Toàn bộ làm trên Windows 11 + WSL2 Ubuntu, thư mục làm việc nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`. Cluster chỉ chạy local, không expose ra Internet. Nguồn manifest là thư mục `starter-project/k8s/` (bản sao của bạn trong `lab-22/source/starter-project`).

Để bài của bạn không trùng bài lab trên lớp, hãy dùng tên riêng theo quy ước sau:

- Cluster kind cho phần setup: `club-hw11` (3 node).
- Tag image cho phần rolling update: `1.0.0` (bản gốc) và `1.0.1` (bản mới, build từ source đã sửa một dòng nhìn thấy được, ví dụ thêm trường `version` vào response của `/health`).

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Dựng cluster 3 node từ file cấu hình tự viết (buổi 21)

Tự viết `lab-21/source/kind-hw11.yaml` (1 control-plane, 2 worker) và tạo cluster tên `club-hw11`. Không copy nguyên văn file ví dụ của repo giáo trình; bạn phải hiểu từng dòng.

Tiêu chí hoàn thành (đo được):

- `kubectl get nodes -o wide` hiển thị đúng 3 node `Ready`, tên bắt đầu bằng `club-hw11-`.
- `kubectl config current-context` trả về `kind-club-hw11`.
- `docker ps --filter name=club-hw11` hiển thị 3 container node đang `Up`.
- `kubectl describe node` cho thấy taint của control-plane và worker không có taint; report giải thích taint đó ảnh hưởng gì tới việc đặt Pod.
- `kubectl version --client` và `kind version` được ghi lại, kind từ 0.23 trở lên.

### Nhiệm vụ 2. Bản đồ cluster (buổi 21)

Trên cluster `club-hw11`, lập bảng trong `report.md` ánh xạ từng thành phần (kube-apiserver, etcd, kube-scheduler, kube-controller-manager, kubelet, kube-proxy) với: nó chạy ở đâu (Pod nào, trên node nào) và vai trò của nó trong một câu. Sau đó vẽ sơ đồ mermaid (flowchart hoặc sequenceDiagram) mô tả đường đi từ `kubectl apply` tới khi container chạy trên node.

Tiêu chí hoàn thành:

- `evidence/command-output.txt` có output của `kubectl get pods -n kube-system -o wide`; bảng trong report khớp với output đó (đúng tên Pod và node).
- Chỉ ra được thành phần nào có đúng một Pod ở mỗi node (kube-proxy) và thành phần nào chỉ ở control-plane.
- Sơ đồ có đủ các bước: API Server ghi vào etcd, controller tạo ReplicaSet và Pod, scheduler chọn node, kubelet chạy container.

### Nhiệm vụ 3. Deploy Club API lên cluster (buổi 22)

Trên cluster `club-hw11`, deploy nền và backend từ `starter-project/k8s/`: namespace `club`, ConfigMap `club-config`, Secret `club-secrets`, Postgres, rồi Deployment `club-api` (2 replicas) và Service `backend`. Image `club-api:1.0.0` build từ `starter-project/backend` và nạp vào đúng cluster bằng `kind load docker-image ... --name club-hw11`.

Tiêu chí hoàn thành:

- `kubectl rollout status deployment/club-api -n club` báo `successfully rolled out`; `kubectl get deployment,replicaset,pod -n club -l app=club-api` cho thấy Deployment READY 2/2.
- Sau `kubectl port-forward -n club svc/backend 3000:3000`: `/health` trả `{"status":"healthy","service":"club-api"}`, `/ready` trả `{"status":"ready"}`, `/api/members` trả danh sách thành viên từ database. Lưu output các lệnh `curl` vào `evidence/test-results.txt`.
- Mật khẩu database không xuất hiện trong bất kỳ file nào bạn commit. Secret được tạo từ `secret.example.yaml` với giá trị bạn tự đặt, file chứa giá trị thật được liệt kê trong `.gitignore`. Kiểm tra bằng `git ls-files | grep -i secret` (chỉ được thấy file example).
- Report trả lời được: label nào nối Deployment với Pod, probe nào chặn Pod chưa sẵn sàng nhận traffic, biến `DB_HOST` lấy từ đâu.

### Nhiệm vụ 4. Rolling update và rollback (buổi 22)

Sửa source backend để thay đổi nhìn thấy được, build `club-api:1.0.1`, nạp vào cluster, cập nhật Deployment và theo dõi. Sau đó quay lại bản cũ.

Tiêu chí hoàn thành:

- `kubectl rollout status` của lần cập nhật báo thành công; `kubectl get deployment club-api -n club -o jsonpath='{.spec.template.spec.containers[0].image}'` in `club-api:1.0.1`; `curl` vào API cho thấy thay đổi của bạn.
- `kubectl rollout history deployment/club-api -n club` có ít nhất 2 revision.
- Sau `kubectl rollout undo`, image trở về `club-api:1.0.0` và `curl` không còn thấy thay đổi.
- Report giải thích: vì sao sau cập nhật có hai ReplicaSet (kèm output `kubectl get replicaset -n club -l app=club-api`), và ReplicaSet nào có DESIRED bằng 0 sau rollback.

### Nhiệm vụ 5. Chẩn đoán ImagePullBackOff (buổi 22)

Tự gây lỗi bằng cách đặt image của Deployment `club-api` sang một tag không tồn tại do bạn chọn (không dùng đúng tag mà bài lab đã dùng), rồi tìm nguyên nhân gốc chỉ bằng các lệnh của Kubernetes, sau đó khôi phục về trạng thái tốt.

Tiêu chí hoàn thành:

- `evidence/command-output.txt` có `kubectl get pods -n club` thể hiện trạng thái `ErrImagePull` hoặc `ImagePullBackOff`, cùng đoạn Events của `kubectl describe pod` nêu rõ lý do kéo image thất bại.
- Chứng minh dịch vụ vẫn trả lời trong lúc có Pod lỗi (các Pod cũ vẫn Ready vì rolling update chưa thay hết); nêu số Pod Ready tại thời điểm đó.
- Report có đủ ba mục: triệu chứng, nguyên nhân gốc, cách sửa; kèm lệnh khôi phục và output cho thấy `club-api` về 2/2 Ready.
- Giải thích vì sao với kind không cần registry mà vẫn phải chạy `kind load docker-image`.

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 70 điểm trở lên.

### Thử thách 1. Deployment tự viết cho bản thử nghiệm

Tự viết `lab-22/source/club-api-extra.yaml` (không copy `k8s/backend.yaml`) tạo Deployment `club-api-extra` trong namespace `club`: 1 replica, image `club-api:1.0.1`, label Pod gồm `app: club-api` và `track: extra`, selector chọn cả hai label, `DB_PASSWORD` lấy từ Secret `club-secrets`, các biến còn lại từ ConfigMap `club-config`, có readinessProbe và resources requests/limits.

Tiêu chí: Pod `1/1 Running`; `kubectl get endpointslices -n club -l kubernetes.io/service-name=backend -o wide` liệt kê 3 địa chỉ; report giải thích vì sao Service `backend` tự nhận Pod mới mà không phải sửa Service, và điều gì xảy ra nếu bạn đổi label `app` của Pod này.

### Thử thách 2. Rolling update có kiểm soát

Đặt `replicas: 4` và `strategy.rollingUpdate` với `maxSurge: 1`, `maxUnavailable: 0` ngay trong manifest (sửa file rồi `kubectl apply`, không dùng `kubectl edit`). Cập nhật image và ghi lại diễn biến bằng `kubectl get pods -w`.

Tiêu chí: file output của lệnh watch cho thấy tại mọi thời điểm không quá 5 Pod và luôn có ít nhất 4 Pod Ready; report giải thích hai tham số trên bằng phép tính cụ thể với 4 replicas.

### Thử thách 3. Rollout bị kẹt

Cập nhật Deployment sang một Pod template có readinessProbe trỏ tới đường dẫn không tồn tại (ví dụ `/ready-x`). Dùng `kubectl rollout status --timeout=60s` để chứng minh rollout không hoàn tất, và chứng minh người dùng vẫn gọi được API.

Tiêu chí: output cho thấy Pod mới `0/1 Running` còn Pod cũ vẫn `1/1`; report giải thích vì sao đây là hành vi an toàn của Deployment, đưa ra cách phát hiện sớm trong pipeline (gợi ý: thất bại của `rollout status`), và cách khôi phục bằng `kubectl rollout undo`.

## Bằng chứng cần nộp

Cấu trúc theo [mẫu nộp bài lab](../../templates/lab-template.md), gồm hai thư mục:

```text
lab-21/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 1-2
├── source/
│   └── kind-hw11.yaml
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              # bảng thành phần, sơ đồ mermaid, trả lời câu hỏi kiểm tra
lab-22/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 3-5
├── source/                # manifest bạn đã chỉnh, patch thay đổi source backend, file L2
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   └── test-results.txt   # output curl /health, /ready, /api/members trước và sau cập nhật
└── report.md
```

Evidence cụ thể cho từng nhiệm vụ:

| Nhiệm vụ | Evidence bắt buộc |
| --- | --- |
| 1 | `kind-hw11.yaml`; output `kubectl get nodes -o wide`, `docker ps --filter name=club-hw11`, `kubectl describe node` phần Taints, phiên bản kubectl và kind |
| 2 | Output `kubectl get pods -n kube-system -o wide`; bảng và sơ đồ trong `report.md` |
| 3 | Output `rollout status`, `get deployment,replicaset,pod`, ba lệnh `curl`; kết quả `git ls-files` chứng minh không commit secret |
| 4 | `kubectl rollout history`, `get replicaset` sau cập nhật, image trước/sau, `curl` trước/sau/sau rollback; diff của thay đổi source |
| 5 | `get pods`, Events của `describe pod`, lệnh khôi phục và `get pods` sau khôi phục |
| L2 | Manifest trong `source/`; output `get endpointslices`; file ghi `get pods -w`; output `rollout status` thất bại và sau `undo` |

Mọi output phải là kết quả thật từ máy của bạn (có tên node, hash và thời gian khác nhau giữa các bạn). Screenshot chỉ bổ sung, không thay thế `command-output.txt`.

## Barem chấm

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

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `report.md`, đặt tiêu đề "Câu hỏi kiểm tra".

1. Vì sao `kubectl get nodes` của kind liệt kê node mà `docker ps` cũng thấy? Điều gì xảy ra với `kubectl` nếu container control-plane bị dừng?
2. Nếu kube-scheduler ngừng hoạt động, Pod đang chạy và Pod mới bị ảnh hưởng thế nào?
3. Phân biệt Pod, ReplicaSet và Deployment. Vì sao không nên chạy Pod trần cho ứng dụng thật?
4. Trong rolling update, điều gì quyết định Pod mới được nhận traffic? Nếu readinessProbe luôn thất bại thì rollout ra sao?
5. Khi gặp ImagePullBackOff với image chạy trên kind, bạn kiểm tra những gì theo thứ tự nào?

## Lỗi hay bị trừ điểm

- Output trong evidence do tự gõ hoặc sửa tay, không phải kết quả lệnh thật.
- Quên `--name club-hw11` khi `kind load docker-image` nên image vào nhầm cluster, Pod vẫn ImagePullBackOff.
- Commit file Secret có mật khẩu thật, hoặc để `.env` trong repo.
- Dùng tag `latest` hoặc không đổi tag giữa hai phiên bản nên rolling update không xảy ra.
- Sửa Deployment bằng `kubectl edit` trong L2, khiến file trong `source/` không khớp trạng thái cluster.
- Làm việc trong `/mnt/c`, dẫn tới lỗi quyền và build chậm.
- Chỉ nêu "sai tag" mà không chỉ ra dòng Events chứng minh.
- Không dọn cluster bằng `kind delete cluster --name club-hw11` sau khi nộp nên cạn RAM ở buổi sau (không trừ điểm nhưng mentor sẽ nhắc).
- Nộp sát hạn mà PR chưa có người review.

## Quy trình nộp

1. Tạo branch trong repository cá nhân, ví dụ `week-11`.
2. Commit `lab-21/` và `lab-22/` đúng cấu trúc ở trên; kiểm tra không có secret.
3. Mở Pull Request vào nhánh chính của repository cá nhân, mô tả ngắn các nhiệm vụ đã làm và level (L1, L2).
4. Nhờ một bạn trong lớp review; người review kiểm tra evidence có thật và để lại ít nhất hai nhận xét cụ thể.
5. Sửa theo nhận xét, rồi gửi link PR cho mentor để chấm.

Hạn nộp: trước buổi đầu tiên của tuần 12.

## Checklist trước khi nộp

- [ ] `lab-21/` và `lab-22/` đúng cấu trúc theo mẫu lab
- [ ] `kind-hw11.yaml` do tự viết, cluster `club-hw11` có 3 node Ready
- [ ] Bảng thành phần khớp với output `kubectl get pods -n kube-system -o wide`
- [ ] `club-api` 2/2 Ready, ba endpoint đã gọi và lưu output vào `test-results.txt`
- [ ] Có `rollout history` với ít nhất 2 revision và xác nhận rollback
- [ ] Phần ImagePullBackOff có đủ triệu chứng, nguyên nhân gốc, cách sửa, dựa trên Events
- [ ] `report.md` có 5 câu trả lời kiểm tra kiến thức
- [ ] `README.md` trả lời 7 câu hỏi trong template cho cả hai lab
- [ ] Không commit `.env`, mật khẩu, token hay file Secret chứa giá trị thật
- [ ] PR đã được ít nhất một bạn review và nộp trước hạn
