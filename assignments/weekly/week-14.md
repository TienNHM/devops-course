# Bài tập tuần 14 – Storage, Ingress & Operations

> **Tóm tắt:** Cho PostgreSQL của Club Management giữ dữ liệu bằng PVC trên kind, mở ứng dụng qua Ingress `club.localhost`, rồi tự phá và tự khôi phục ba lỗi Kubernetes phổ biến (ImagePullBackOff, CrashLoopBackOff, Pending) với bằng chứng từ events, logs và exit code.

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Việc duy nhất ngoài lab: thêm email riêng của bạn vào bảng `members` (đã nằm trong lab) và viết `report.md` (giải thích, bảng lệnh đầu tiên cho ba lỗi, báo cáo 5 mục, 5 câu hỏi kiểm tra).

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Postgres giữ dữ liệu qua PVC | [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md), Phần 1-3 | 1,5 giờ | `get nodes`, `get pvc,pv`, `Pending`, hai lần đếm `members`; `source/postgres.yaml` |
| 2. Truy cập qua Ingress | [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md), Phần 4-5 | 1,5 giờ | `get pods`, `get ingress`, ba lệnh `curl`, `describe ingress`, log controller |
| 3. Rollout, history, scale, rollback | [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md), Phần 1-3 | 1 giờ | `rollout history`, `get rs`, `rollout status` hết thời gian, `rollout undo`, `jsonpath` |
| 4. Chẩn đoán ba lỗi | [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md), Phần 3-5 | 1,5 giờ | Events, `logs --previous`, `Last State`, `FailedScheduling`, lệnh dọn dẹp |
| 5. Troubleshooting report | [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md), mục Nộp bài | 0,5 giờ | `lab-28/report.md` với ít nhất hai sự cố theo mẫu 5 mục |

Hạn nộp và cách nộp ở cuối trang. Mentor chấm theo barem; bảng điểm ngắn nằm bên dưới.

**Hạn nộp:** trước buổi đầu tiên của tuần 15.
**Hình thức:** Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-27/` và `lab-28/`.
**Mẫu nộp bài:** [Mẫu nộp bài lab](../../templates/lab-template.md).

## Bối cảnh

CLB chuẩn bị demo Club Management chạy trên Kubernetes. Hiện có hai điểm yếu. Thứ nhất, danh sách thành viên nằm trong filesystem tạm của Pod Postgres, nên một lần `kubectl delete pod` là mất sạch. Thứ hai, mỗi lần xem ứng dụng phải `port-forward` từng Service, và khi cập nhật image thì không ai biết chắc bản mới có lên hay không vì rolling update che lỗi bằng các Pod cũ.

Nhiệm vụ của bạn: chứng minh dữ liệu sống sót qua việc xóa Pod, chứng minh request đi đúng đường qua Ingress, và chứng minh bạn vận hành được một Deployment (rollout, rollback, scale) cũng như chẩn đoán lỗi bằng bằng chứng thay vì đoán mò.

Tuần này dùng cluster kind `club` (context `kind-club`) tạo từ `starter-project/k8s/kind-config.yaml` (có `extraPortMappings` cho cổng 80, 443 và nhãn `ingress-ready=true`), image `club-api:1.0.0` và `club-web:1.0.0` nạp bằng `kind load docker-image`. Mọi lệnh chạy trong filesystem WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`. Nếu kẹt, đọc mục Gặp lỗi? của hai bài lab.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Postgres giữ dữ liệu qua PVC

Triển khai Postgres của `starter-project` trên cluster kind `club` và chứng minh dữ liệu còn sau khi xóa Pod.

Tiêu chí hoàn thành:

- `kubectl get nodes` báo `Ready`, và `kubectl get pvc,pv -n club` cho thấy PVC `postgres-pvc` ở trạng thái `Bound` cùng một PV liên kết với `CLAIM` là `club/postgres-pvc`.
- Bảng `members` được khởi tạo từ `database/init.sql`, sau đó bạn thêm một dòng có `email` riêng của bạn (ví dụ chứa MSSV hoặc username GitHub), không trùng với dữ liệu mẫu.
- Evidence có hai lần chạy `SELECT count(*) FROM members;`, trước và sau `kubectl delete pod postgres-0 -n club`, với số đếm bằng nhau; lần sau còn thấy đúng dòng có email của bạn.
- Evidence ghi lại ít nhất một lần `kubectl get pvc -n club` ở trạng thái `Pending` trước khi có Pod (hoặc dòng Events "waiting for first consumer" từ `kubectl describe pvc`), kèm một câu giải thích trong `report.md` vì sao đó không phải lỗi.
- Mật khẩu Postgres chỉ được tạo bằng lệnh `kubectl create secret ...`; không có file nào trong repo chứa giá trị mật khẩu thật.

### Nhiệm vụ 2. Truy cập ứng dụng qua Ingress

Cài ingress-nginx cho kind, áp dụng `k8s/ingress.yaml` và kiểm chứng định tuyến theo host và path.

Tiêu chí hoàn thành:

- `kubectl get pods -n club` cho thấy `club-api` (2 Pod), `club-web` (1 Pod) và `postgres-0` đều `1/1 Running`; `kubectl get ingress -n club` cho thấy host `club.localhost` và class `nginx`.
- Evidence có `curl` với header `Host: club.localhost` tới `/api/members` trả JSON chứa dòng email của bạn, và tới `/` trả mã `200`.
- Evidence có `curl` tới `http://127.0.0.1/api/members` không kèm header Host đúng, trả `404`, cùng một đoạn trong `report.md` giải thích vì sao.
- Evidence có output `kubectl describe ingress club -n club` hiển thị hai path (`/api` tới `backend:3000`, `/` tới `club-web:80`), và bạn chỉ ra trong `report.md` path nào thắng khi request là `/api/members` và vì sao.
- Evidence có 5 dòng cuối log của ingress-nginx controller cho thấy các request vừa gửi.

### Nhiệm vụ 3. Rollout, history, scale và rollback có kiểm soát

Làm Phần 1 đến Phần 3 của Buổi 28 trên namespace `ops-lab`.

Tiêu chí hoàn thành:

- `lab-28/source/web.yaml` tạo Deployment `web` với 3 replicas, image `nginx:1.26`, có `resources.requests` và `limits.memory`.
- `kubectl rollout history deployment/web` có ít nhất 2 revision và cột `CHANGE-CAUSE` có nội dung do bạn đặt (không phải `none`) cho mọi revision đang hiển thị.
- Evidence có `kubectl get rs` cho thấy hai ReplicaSet (một cái `DESIRED` bằng 0), và `rollout history` được chạy lại sau `kubectl scale` lên 5 rồi về 3 để chứng minh số revision không đổi.
- Sau khi đặt tag không tồn tại, evidence có `rollout status --timeout=45s` báo hết thời gian, danh sách Pod cho thấy 3 Pod cũ vẫn `Running` cùng Pod mới lỗi, và sau `kubectl rollout undo` thì `kubectl get deployment web -o jsonpath` in ra image hợp lệ (`nginx:1.27` hoặc bản bạn đã dùng trước đó).

### Nhiệm vụ 4. Chẩn đoán ba trạng thái lỗi bằng bằng chứng

Tự gây và tự khôi phục ImagePullBackOff, CrashLoopBackOff và Pending theo Phần 3, 4, 5 của Buổi 28. Với mỗi lỗi, bạn phải chỉ ra nơi tìm bằng chứng đúng.

Tiêu chí hoàn thành:

- ImagePullBackOff: evidence có output Events của `kubectl describe pod` trên Pod lỗi, trong đó khoanh được dòng chứa lý do kéo image thất bại.
- CrashLoopBackOff: evidence có `kubectl logs --previous` hiện thông báo lỗi của ứng dụng và phần `Last State` từ `describe` có `Exit Code`. Bản sửa của `lab-28/source/crash.yaml` làm Pod `Running` ổn định, kèm `kubectl logs` xác nhận biến môi trường đã nhận.
- Pending: evidence có event `FailedScheduling` từ `kubectl get events --field-selector reason=FailedScheduling` (hoặc `describe pod`), và `kubectl rollout status` báo thành công sau khi sửa `requests`.
- Với mỗi lỗi, `report.md` có một dòng bảng: lệnh bạn chạy đầu tiên, vì sao lệnh đó (không phải lệnh khác) cho bằng chứng, và nguyên nhân gốc trong một câu.
- Cuối buổi đã dọn: `kubectl get deployment` trong `ops-lab` không còn `crashy` và `hungry`.

### Nhiệm vụ 5. Troubleshooting report

Viết `lab-28/report.md` cho ít nhất hai sự cố trong Nhiệm vụ 3 và 4 theo mẫu 5 mục của Buổi 28.

Tiêu chí hoàn thành:

- Mỗi sự cố có đủ 5 mục: Triệu chứng, Bằng chứng, Nguyên nhân gốc, Cách khắc phục, Phòng tránh.
- Mục Bằng chứng trích đúng dòng events/logs/exit code kèm lệnh đã chạy, và các trích dẫn đó khớp với nội dung trong `evidence/command-output.txt`.
- Mục Phòng tránh nêu một thay đổi cụ thể về quy trình hoặc cấu hình (không viết chung chung kiểu "cẩn thận hơn").
- Mục Nguyên nhân gốc phân biệt rõ "cứu dịch vụ" (rollback) với "sửa nguyên nhân gốc", và nêu ít nhất một tình huống `rollout undo` không giúp được.

## Nhiệm vụ L2 (nâng cao)

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 60 điểm trở lên. Gợi ý nằm trong [Buổi 27 – Thử thách nâng cao](../../labs/week-14/session-27-challenge.md) và [Buổi 28 – Thử thách nâng cao](../../labs/week-14/session-28-challenge.md); hãy tự dự đoán trước khi chạy lệnh.

### Thử thách A. Vòng đời PV và reclaim policy

Tiêu chí hoàn thành:

- `report.md` có bảng 3 dòng gồm: hành động, dự đoán của bạn (viết trước khi chạy), kết quả thực tế, cho ba hành động: xóa StatefulSet `postgres` (giữ PVC), xóa cả PVC với reclaim policy `Delete`, và xóa PVC sau khi đã đặt PV về `Retain`.
- Evidence có `kubectl get pv` trước và sau cho từng hành động, trong đó có PV ở trạng thái `Released`.
- Giải thích trong 3-5 câu vì sao PV `Released` chưa thể gắn cho PVC mới, và nêu bước admin cần làm để dùng lại nó.

### Thử thách B. Ingress theo host thứ hai

Tiêu chí hoàn thành:

- `lab-27/source/ingress-api.yaml` định tuyến `api.club.localhost` tới Service `backend`, trong khi `club.localhost` vẫn hoạt động.
- Evidence có hai lệnh `curl` với hai header Host khác nhau cùng trả đúng nội dung, và `kubectl describe ingress` liệt kê cả hai rule.
- Trong `report.md`, bạn tự gây một lỗi Ingress (ví dụ sai tên Service) rồi chỉ ra bằng `describe ingress` và `get svc,endpoints` dòng nào cho thấy lỗi, kèm mã HTTP quan sát được.

### Thử thách C. Sự cố trên ứng dụng thật và tình huống không có đáp án trước

Tiêu chí hoàn thành:

- Triển khai `club-api` bằng `starter-project/k8s/backend.yaml`, rồi chạy `kubectl -n club set image deployment/club-api api=club-api:9.9.9`. Evidence cho thấy rollout kẹt, hai ReplicaSet, lý do trong Events, và ứng dụng vẫn trả `/api/members` trong lúc kẹt. Sau `rollout undo`, `kubectl -n club get pods` cho thấy 2 replicas Ready.
- Xử lý ít nhất một trong ba tình huống `examples/troubleshooting/scenario-07`, `scenario-08`, `scenario-09`: chỉ nhận triệu chứng, nộp lệnh và output chỉ ra nguyên nhân gốc, cách sửa, cách kiểm chứng đã khôi phục.
- Mục Phòng tránh nêu cách phát hành bản mới đúng quy trình cho cluster kind (tag bất biến, image phải có trong node trước khi deploy) và cách bạn kiểm tra điều đó trước `set image`.

## Bằng chứng cần nộp

Cấu trúc thư mục theo mẫu lab:

```text
lab-27/
├── README.md
├── report.md
├── source/
│   ├── postgres.yaml
│   ├── ingress.yaml
│   └── ingress-api.yaml        (L2, Thử thách B)
├── screenshots/
│   └── club-localhost.png
└── evidence/
    └── command-output.txt
lab-28/
├── README.md
├── report.md
├── source/
│   ├── web.yaml
│   └── crash.yaml
├── screenshots/
│   └── before-after-recovery.png
└── evidence/
    └── command-output.txt
```

Quy tắc chung: evidence là output thật của lệnh (có dòng lệnh đi kèm), không chỉnh sửa số liệu; Secret không được đưa vào repo dưới dạng file chứa giá trị thật. Có thể dùng `tee -a evidence/command-output.txt` hoặc `script` để ghi lại phiên làm việc. Ảnh chụp màn hình chỉ bổ sung, không thay evidence dạng text.

## Bảng điểm

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: PVC và dữ liệu bền | 18 |
| Nhiệm vụ 2: Ingress | 14 |
| Nhiệm vụ 3: Rollout và rollback | 18 |
| Nhiệm vụ 4: Chẩn đoán ba lỗi (mỗi lỗi 6, dọn dẹp 2) | 20 |
| Nhiệm vụ 5: Troubleshooting report | 10 |
| Câu hỏi kiểm tra kiến thức (mỗi câu 2) | 10 |
| Cấu trúc nộp bài và an toàn | 10 |
| **Tổng bắt buộc** | **100** |
| Thử thách A / B / C (L2) | +4 / +3 / +3 |
| **Điểm thưởng tối đa** | **10** |

Mức đạt và không đạt chi tiết, cùng các lỗi hay bị trừ điểm, nằm ở trang chấm của mentor. Tổng điểm không vượt quá 110.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2-4 câu mỗi câu) trong mục "Câu hỏi kiểm tra" của `lab-28/report.md`.

1. PV, PVC và StorageClass khác nhau thế nào, và vì sao PVC trên kind ở trạng thái `Pending` trước khi có Pod thì không phải lỗi?
2. Bạn xóa `postgres-0` thì dữ liệu còn, nhưng xóa PVC rồi apply lại `postgres.yaml` thì database rỗng. Giải thích cả hai kết quả bằng reclaim policy.
3. Vì sao chỉ tạo Ingress mà không cài Ingress controller thì không có gì xảy ra, và kind cần thêm những gì để request từ máy host tới được controller?
4. Vì sao khi rollout bản mới bị kẹt, người dùng thường vẫn không thấy lỗi? Tham số nào của Deployment quyết định điều đó?
5. Pod `CrashLoopBackOff` mà `kubectl logs` trống, bạn làm gì tiếp theo? Và Pod `Pending` có đọc được log không, bằng chứng nằm ở đâu?

## Quy trình nộp

1. Tạo branch từ `main` trong repo cá nhân, ví dụ `week-14`.
2. Hoàn thành `lab-27/` và `lab-28/` theo cấu trúc ở trên, commit nhiều lần với thông điệp rõ ràng.
3. Mở Pull Request vào `main` của repo cá nhân; mô tả PR ghi rõ đã làm L1 hay cả L2.
4. Nhờ một bạn review theo [mẫu peer review](../../templates/peer-review-template.md); sửa theo góp ý hợp lý.
5. Sau khi PR có review, mentor chấm theo barem.
6. Hạn nộp: trước buổi đầu tiên của tuần 15. Nộp muộn cần báo mentor trước hạn.

## Checklist trước khi nộp

- [ ] Cluster kind `club` tạo bằng `starter-project/k8s/kind-config.yaml`, `kubectl get nodes` báo `Ready`
- [ ] `postgres-pvc` `Bound`, dữ liệu còn nguyên sau khi xóa `postgres-0` (có số đếm trước/sau)
- [ ] Ba lệnh `curl` tới Ingress (Host đúng tới `/api/members`, tới `/`, không có Host) đều có output trong evidence
- [ ] `rollout history` có change-cause cho mọi revision, scale không đổi số revision
- [ ] Đã chẩn đoán ImagePullBackOff, CrashLoopBackOff, Pending với bằng chứng đúng loại
- [ ] `report.md` có ít nhất hai sự cố theo mẫu 5 mục và trả lời đủ 5 câu hỏi kiểm tra
- [ ] `evidence/command-output.txt` chứa lệnh kèm output thật cho cả `lab-27` và `lab-28`
- [ ] `README.md` của mỗi lab trả lời 7 mục theo template và đánh dấu L1/L2
- [ ] Đã dọn `crashy`, `hungry` và PVC thử nghiệm
- [ ] Không commit `.env`, password, token, private key hay Secret chứa giá trị thật
- [ ] PR đã được ít nhất một bạn review và nộp trước hạn
