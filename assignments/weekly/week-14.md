# Bài tập tuần 14 – Storage, Ingress & Operations

> **Tóm tắt:** Cho PostgreSQL của Club Management giữ dữ liệu bằng PVC trên kind, mở ứng dụng qua Ingress `club.localhost`, rồi tự phá và tự khôi phục ba lỗi Kubernetes phổ biến (ImagePullBackOff, CrashLoopBackOff, Pending) với bằng chứng từ events, logs và exit code.

**Hạn nộp:** trước buổi đầu tiên của tuần 15.
**Hình thức:** Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-27/` và `lab-28/`.
**Bài lab liên quan:** [Buổi 27 – Storage & Ingress](../../labs/week-14/session-27.md), [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md).
**Mẫu nộp bài:** [templates/lab-template.md](../../templates/lab-template.md).

## Bối cảnh

CLB chuẩn bị demo Club Management chạy trên Kubernetes. Hiện có hai điểm yếu. Thứ nhất, danh sách thành viên nằm trong filesystem tạm của Pod Postgres, nên một lần `kubectl delete pod` là mất sạch. Thứ hai, mỗi lần xem ứng dụng phải `port-forward` từng Service, và khi cập nhật image thì không ai biết chắc bản mới có lên hay không vì rolling update che lỗi bằng các Pod cũ.

Nhiệm vụ của bạn trong tuần: chứng minh dữ liệu sống sót qua việc xóa Pod, chứng minh request đi đúng đường qua Ingress, và chứng minh bạn vận hành được một Deployment (rollout, rollback, scale) cũng như chẩn đoán lỗi bằng bằng chứng thay vì đoán mò.

Tuần này dùng cluster kind tên `club` tạo từ `starter-project/k8s/kind-config.yaml` (có `extraPortMappings` cho cổng 80, 443 và nhãn `ingress-ready=true`), image `club-api:1.0.0` và `club-web:1.0.0` nạp bằng `kind load docker-image`. Mọi lệnh chạy trong filesystem WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`. Bài tập chỉ dùng kiến thức của Buổi 27 và 28; nếu kẹt, đọc lại phần "Phá lỗi và debug" và "Lỗi thường gặp" của hai bài lab.

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

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 60 điểm trở lên. Không có gợi ý đi kèm; hãy tự dự đoán trước khi chạy lệnh.

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

Bằng chứng theo từng nhiệm vụ:

| Nhiệm vụ | Bằng chứng bắt buộc |
| --- | --- |
| 1 | `lab-27/evidence/command-output.txt` có `get nodes`, `get pvc,pv`, hai lần đếm `members` trước/sau xóa Pod, dòng PVC `Pending` hoặc Events "waiting for first consumer"; `lab-27/source/postgres.yaml` |
| 2 | Cùng file evidence có `get pods`, `get ingress`, ba lệnh `curl` (có Host đúng, có tới `/`, không có Host), `describe ingress`, log controller; ảnh `club-localhost.png` chỉ bổ sung |
| 3 | `lab-28/source/web.yaml`; evidence có `rollout history` (nhiều lần), `get rs`, `scale`, `rollout status` hết thời gian, `rollout undo`, `jsonpath` image |
| 4 | `lab-28/source/crash.yaml` bản đã sửa; evidence có `describe pod` (Events), `logs --previous`, `Last State`, `FailedScheduling`, và lệnh dọn dẹp |
| 5 | `lab-28/report.md` với ít nhất hai sự cố theo mẫu 5 mục |
| L2-A | Bảng dự đoán/kết quả trong `lab-27/report.md`; `get pv` trước và sau |
| L2-B | `lab-27/source/ingress-api.yaml`; hai lệnh `curl`; `describe ingress` |
| L2-C | Evidence `lab-28` cho `set image` lỗi và `rollout undo`; log điều tra scenario đã chọn |

Quy tắc chung: evidence là output thật của lệnh (có dòng lệnh đi kèm), không chỉnh sửa số liệu; Secret không được đưa vào repo dưới dạng file chứa giá trị thật. Có thể dùng `tee -a evidence/command-output.txt` hoặc `script` để ghi lại phiên làm việc.

## Barem chấm

| Tiêu chí | Mô tả mức đạt / không đạt | Điểm |
| --- | --- | --- |
| Nhiệm vụ 1: PVC và dữ liệu bền | Đạt: PVC `Bound`, dòng riêng còn sau khi xóa Pod, có bằng chứng Pending hợp lệ và giải thích. Không đạt: thiếu số đếm trước/sau, hoặc dữ liệu mất mà không giải thích. Trừ nửa điểm nếu thiếu giải thích Pending | 18 |
| Nhiệm vụ 2: Ingress | Đạt: đủ ba lệnh curl với kết quả đúng (JSON, 200, 404), `describe ingress` đúng hai path, giải thích path thắng. Không đạt: chỉ có ảnh trình duyệt, hoặc thiếu trường hợp 404 | 14 |
| Nhiệm vụ 3: Rollout và rollback | Đạt: history có change-cause, scale không đổi revision, rollback về image hợp lệ có `jsonpath` xác nhận. Không đạt: thiếu `rollout status` hết thời gian hoặc không chứng minh Pod cũ còn phục vụ | 18 |
| Nhiệm vụ 4: Chẩn đoán ba lỗi | Đạt: mỗi lỗi có đúng loại bằng chứng (Events, `logs --previous` và Exit Code, `FailedScheduling`) và bảng giải thích lệnh đầu tiên. Không đạt: kết luận không kèm output. Mỗi lỗi 6 điểm, dọn dẹp 2 điểm | 20 |
| Nhiệm vụ 5: Troubleshooting report | Đạt: đủ 5 mục cho hai sự cố, trích dẫn khớp evidence, phòng tránh cụ thể, phân biệt rollback với sửa gốc | 10 |
| Câu hỏi kiểm tra kiến thức | Mỗi câu 2 điểm: đúng ý chính và dùng đúng thuật ngữ; sai hoặc mơ hồ: 0-1 điểm | 10 |
| Cấu trúc nộp bài và an toàn | Đạt: đúng cấu trúc thư mục, README đủ 7 mục, manifest chạy lại được, không có secret, PR có review | 10 |
| **Tổng bắt buộc** | | **100** |
| Thử thách A (L2) | Bảng dự đoán/kết quả có dự đoán viết trước, có PV `Released`, giải thích đúng | +4 |
| Thử thách B (L2) | Hai host cùng chạy, tự gây và chẩn đoán một lỗi Ingress bằng bằng chứng | +3 |
| Thử thách C (L2) | Rollout kẹt được chẩn đoán và undo trên `club-api`, xử lý được tối thiểu một scenario | +3 |
| **Điểm thưởng tối đa** | L2 không làm tổng vượt quá 110 | **10** |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2-4 câu mỗi câu) trong mục "Câu hỏi kiểm tra" của `lab-28/report.md`.

1. PV, PVC và StorageClass khác nhau thế nào, và vì sao PVC trên kind ở trạng thái `Pending` trước khi có Pod thì không phải lỗi?
2. Bạn xóa `postgres-0` thì dữ liệu còn, nhưng xóa PVC rồi apply lại `postgres.yaml` thì database rỗng. Giải thích cả hai kết quả bằng reclaim policy.
3. Vì sao chỉ tạo Ingress mà không cài Ingress controller thì không có gì xảy ra, và kind cần thêm những gì để request từ máy host tới được controller?
4. Vì sao khi rollout bản mới bị kẹt, người dùng thường vẫn không thấy lỗi? Tham số nào của Deployment quyết định điều đó?
5. Pod `CrashLoopBackOff` mà `kubectl logs` trống, bạn làm gì tiếp theo? Và Pod `Pending` có đọc được log không, bằng chứng nằm ở đâu?

## Lỗi hay bị trừ điểm

- Nộp chỉ ảnh chụp màn hình, không có output lệnh dạng text trong `evidence/command-output.txt`.
- Số đếm `members` trước và sau xóa Pod không có, hoặc không chứng minh được dòng dữ liệu riêng của bạn còn lại.
- Kết luận nguyên nhân lỗi mà không trích dòng events, logs hay exit code tương ứng; đoán mò rồi "sửa cho chạy" mà không giải thích.
- Dùng `kubectl logs` thường thay vì `--previous` cho Pod crash và kết luận "không có log".
- Chỉ rollback rồi coi như xong, không nêu nguyên nhân gốc và cách phòng tránh.
- Gọi `curl` tới Ingress mà không kiểm tra header Host, rồi kết luận Ingress hỏng.
- Quên `kind load docker-image` hoặc tạo cluster kind không có `--config`, dẫn tới `ImagePullBackOff` hay `Connection refused` không liên quan tới bài.
- Commit mật khẩu thật, file Secret chứa giá trị thật hoặc `.env` vào repo.
- Làm trong `/mnt/c` thay vì filesystem WSL; manifest trong `source/` không khớp với thứ đã chạy.
- Không dọn tài nguyên thử nghiệm (`crashy`, `hungry`, PVC thừa), làm lần chạy sau nhiễu.
- PR không có người review, hoặc nộp sau hạn mà không báo trước.

## Quy trình nộp

1. Tạo branch từ `main` trong repo cá nhân, ví dụ `week-14`.
2. Hoàn thành `lab-27/` và `lab-28/` theo cấu trúc ở trên, commit nhiều lần với thông điệp rõ ràng.
3. Mở Pull Request vào `main` của repo cá nhân; mô tả PR ghi rõ đã làm L1 hay cả L2.
4. Nhờ một bạn review theo [mẫu peer review](../../templates/peer-review-template.md); sửa theo góp ý hợp lý.
5. Sau khi PR có review, mentor chấm theo barem trên.
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
