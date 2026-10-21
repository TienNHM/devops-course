# Bài tập tuần 13 – Configuration, Resources & Health

> **Tóm tắt:** Tách cấu hình khỏi image bằng ConfigMap và Secret, chứng minh Pod thấy giá trị mới khi nào, tự làm hỏng và chẩn đoán cấu hình sai của `club-api`, rồi khai báo requests/limits cùng ba loại probe và mô phỏng OOMKilled, readiness probe fail. Mọi kết luận phải dựa trên lệnh và output thật.

**Phạm vi:** buổi 25 (Configuration Management) và buổi 26 (Resource & Health). Nộp trong `lab-25/` và `lab-26/` của repository cá nhân (ví dụ `devops-labs`).

## Bối cảnh

CLB sắp chạy `club-api` trên một cụm dùng chung. Mentor yêu cầu trước khi chuyển sang cụm thật, mỗi thành viên phải chứng minh ba điều trên cluster kind của mình: cấu hình và mật khẩu nằm ngoài image và được quản lý đúng cách; mọi thay đổi cấu hình có thể dự đoán được hậu quả; Pod khai báo đủ tài nguyên và health check để cluster tự xử lý đúng khi có sự cố.

Bài làm trên Windows 11 + WSL2 Ubuntu, thư mục làm việc nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`. Cluster chỉ chạy local. Dùng lại cluster kind và namespace `club` đã dựng ở các buổi trước, với `club-api` và `postgres` từ `starter-project/k8s/` đang chạy.

Để bài của bạn không trùng bài lab trên lớp, hãy dùng tên riêng theo quy ước sau:

- ConfigMap `hw13-settings`, Secret `hw13-credentials` (key `api-token`), Pod `hw13-config-check`, Pod `oom-hw13`.
- Giá trị cấu hình do bạn tự chọn (ví dụ `CLUB_NAME` là tên nhóm của bạn), không dùng nguyên giá trị trong bài lab.
- Giá trị trong Secret là chuỗi tạm do bạn sinh ra chỉ dùng cho bài này, không dùng mật khẩu thật của bất kỳ dịch vụ nào.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Cấu hình tách khỏi image (buổi 25)

Viết `lab-25/source/hw13-settings.yaml` (ConfigMap `hw13-settings` trong namespace `club`) với ít nhất ba key: `CLUB_NAME`, `LOG_LEVEL` và `FEATURE_MEMBERS` (giá trị là chuỗi). Tạo Secret `hw13-credentials` bằng lệnh `kubectl create secret generic` (không viết vào file YAML). Viết `lab-25/source/hw13-config-check.yaml` là Pod busybox:1.36 nhận cấu hình theo cả ba cách: `LOG_LEVEL` qua `env` + `configMapKeyRef`, `api-token` qua `env` + `secretKeyRef`, và toàn bộ ConfigMap mount thành file tại `/etc/hw13`.

Tiêu chí hoàn thành (đo được):

- `kubectl get configmap hw13-settings -n club -o yaml` có đủ 3 key, giá trị số hoặc boolean nằm trong dấu nháy.
- Pod `hw13-config-check` ở trạng thái `1/1 Running`; `kubectl exec` chạy `ls /etc/hw13` liệt kê đúng các key và `printenv LOG_LEVEL` khớp ConfigMap.
- `kubectl describe secret hw13-credentials -n club` chỉ hiện số byte; `kubectl get secret ... -o jsonpath` kết hợp `base64 -d` giải mã ra đúng chuỗi bạn đã tạo. Trong evidence, giá trị giải mã đã được che hoặc là chuỗi tạm.
- `git ls-files | grep -i secret` trong repository nộp bài không trả về file chứa giá trị Secret thật.

### Nhiệm vụ 2. Cấu hình đổi thì Pod thấy khi nào (buổi 25)

Dự đoán trước (ghi vào `report.md` trước khi chạy lệnh): sau khi sửa `LOG_LEVEL` trong ConfigMap, biến môi trường và file mount trong Pod `hw13-config-check` sẽ thế nào? Sau đó kiểm chứng bằng lệnh.

Tiêu chí hoàn thành:

- Dùng `kubectl patch` (hoặc `apply` file đã sửa) đổi `LOG_LEVEL` sang giá trị mới; `evidence/command-output.txt` có `printenv LOG_LEVEL` vẫn là giá trị cũ ngay sau khi đổi.
- Có vòng lặp quan sát (tối thiểu 12 lần, mỗi lần cách 10 giây) in nội dung file `/etc/hw13/LOG_LEVEL`, cho thấy thời điểm file đổi; report ghi số giây xấp xỉ mà bạn đo được.
- Sau khi xóa và tạo lại Pod, `printenv LOG_LEVEL` in giá trị mới.
- Report nêu đúng cơ chế: biến môi trường chốt lúc container khởi động, file mount do kubelet đồng bộ định kỳ; và so sánh dự đoán của bạn với kết quả thật.

### Nhiệm vụ 3. Cấu hình sai trên club-api: phát hiện và chẩn đoán (buổi 25)

Cố ý làm hỏng `DB_HOST` trong ConfigMap `club-config` bằng một giá trị sai do bạn chọn (không dùng đúng giá trị mà bài lab đã dùng), rollout lại Deployment `club-api`, rồi chẩn đoán như người chỉ nhận được triệu chứng. Sau đó khôi phục.

Tiêu chí hoàn thành:

- `evidence/command-output.txt` có `kubectl get pods -n club -l app=club-api` cho thấy ít nhất một Pod mới `Running` nhưng `0/1` và các Pod cũ vẫn `1/1`.
- Có output của bốn bước điều tra, đúng thứ tự: `get pods`; `describe pod` của Pod mới (Events có `Readiness probe failed`); `logs` hoặc `exec` thể hiện lỗi phân giải tên (ví dụ `ENOTFOUND` kèm tên host sai); `exec ... printenv DB_HOST` và `get configmap -o yaml` chỉ ra giá trị sai ở nguồn.
- Chứng minh dịch vụ vẫn trả lời trong lúc Pod mới lỗi: nêu số Pod Ready tại thời điểm đó và kết quả gọi API qua `port-forward`.
- Sau khi khôi phục, `kubectl rollout status deployment/club-api -n club` báo `successfully rolled out` và `curl` vào `/ready` trả `ready`.
- Report có ba mục: triệu chứng, nguyên nhân gốc, cách phòng tránh; giải thích vì sao logs "sạch" không có nghĩa là ứng dụng khỏe.

### Nhiệm vụ 4. Requests, limits và ba loại probe cho club-api (buổi 26)

Tự viết `lab-26/source/backend-deploy.yaml` (chỉ Deployment `club-api`, Service `backend` giữ nguyên) với: requests và limits do bạn tự chọn nhưng phải hợp lý (requests nhỏ hơn limits, memory dùng hậu tố `Mi`), `startupProbe` và `livenessProbe` trỏ `/health`, `readinessProbe` trỏ `/ready`, `DB_PASSWORD` từ Secret `club-secrets`, các biến còn lại từ ConfigMap `club-config`. Không copy nguyên giá trị của bài lab; bạn phải giải thích được vì sao chọn các con số đó.

Tiêu chí hoàn thành:

- `kubectl apply -f` thành công và `kubectl rollout status deploy/club-api -n club` báo `successfully rolled out` với 2/2 Ready.
- `kubectl describe pod -l app=club-api -n club` (lọc bằng `grep`) hiển thị đủ ba dòng `Liveness`, `Readiness`, `Startup` và dòng `QoS Class`.
- `kubectl get pods ... -o jsonpath` in ra `qosClass` của từng Pod; report nêu QoS là gì và vì sao.
- Report giải thích bằng công thức: thời gian tối đa startupProbe cho phép (`failureThreshold` nhân `periodSeconds`) và vì sao liveness chỉ trỏ `/health` còn readiness trỏ `/ready`.

### Nhiệm vụ 5. Mô phỏng OOMKilled và readiness probe fail (buổi 26)

Phần A. Tự viết `lab-26/source/oom-hw13.yaml`: một Pod `restartPolicy: Never` chạy lại image `club-api:1.0.0` với lệnh tự viết cố ý cấp phát bộ nhớ liên tục, đặt memory limit do bạn chọn. Phần B. Làm hỏng readiness probe của Deployment `club-api` bằng một đường dẫn sai do bạn chọn (không dùng đúng đường dẫn mà bài lab đã dùng), chẩn đoán, rồi khôi phục bằng `kubectl apply -f source/backend-deploy.yaml`.

Tiêu chí hoàn thành:

- Phần A: output có `Reason: OOMKilled` và `Exit Code: 137` (qua `describe` hoặc `jsonpath`), kèm `kubectl logs` cho thấy log dừng đột ngột không có thông báo lỗi; report giải thích vì sao exit code là 137 (128 cộng 9).
- Phần B: output có Pod mới `0/1 Running` với RESTARTS bằng 0, dòng Events `Readiness probe failed` kèm mã HTTP, `kubectl get endpoints backend -n club` (hoặc `endpointslices`) cho thấy IP của Pod mới không có trong danh sách.
- Phần B: report phân biệt được ba mã lỗi probe: 404 (sai path), 503 (app báo chưa sẵn sàng), `connection refused` (sai port hoặc chưa lắng nghe) và chỉ ra mã của trường hợp bạn gây ra.
- Sau khôi phục, `rollout status` thành công và `get endpoints backend` có đủ IP của hai Pod Ready; `oom-hw13` đã được xóa.

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 70 điểm trở lên.

### Thử thách 1. Mount một file mà không che thư mục (buổi 25)

Tạo file `lab-25/source/app.properties` (tự đặt nội dung), tạo ConfigMap `hw13-app` từ file bằng `--from-file`, rồi viết hai Pod busybox: Pod X mount ConfigMap thành cả thư mục `/etc/hw13-conf`, Pod Y mount riêng file đó vào `/etc/hw13-conf/app.properties` bằng `subPath` trong một thư mục đã có sẵn file khác (tạo file có sẵn bằng `command`). Sửa ConfigMap và đo thời gian file đổi trong mỗi Pod.

Tiêu chí: output cho thấy Pod X đổi file sau một khoảng thời gian đo được còn Pod Y không đổi sau ít nhất 3 phút; report giải thích cơ chế (symlink `..data` so với mount trực tiếp một file) và đề xuất cách thiết kế để vừa có file cấu hình vừa tự cập nhật.

### Thử thách 2. Liveness phụ thuộc database gây restart dây chuyền (buổi 26)

Tạo bản `lab-26/source/backend-liveness-bad.yaml` trong đó livenessProbe trỏ `/ready`, apply, rồi `kubectl scale statefulset postgres --replicas=0` và quan sát cột RESTARTS. Dừng thí nghiệm sau khi đủ bằng chứng và khôi phục cả Deployment lẫn Postgres.

Tiêu chí: output cho thấy RESTARTS tăng trên cả hai Pod `club-api`; events có `Liveness probe failed` và `will be restarted`; report so sánh với hành vi của cấu hình đúng (readiness fail, không restart) và giải thích vì sao thiết kế này làm sự cố nặng hơn. Sau khôi phục, cả hai Pod `1/1`.

### Thử thách 3. Guaranteed QoS và hệ quả (buổi 26)

Tạo `lab-26/source/backend-guaranteed.yaml` sao cho Pod `club-api` có QoS `Guaranteed`, xác nhận bằng `jsonpath` trên `.status.qosClass`, rồi khôi phục về cấu hình Nhiệm vụ 4.

Tiêu chí: output in `Guaranteed` cho mọi Pod `club-api`; report giải thích điều kiện của Guaranteed, thứ tự bị đuổi (evict) giữa ba QoS class khi Node thiếu bộ nhớ, và một ưu nhược điểm thực tế của việc đặt requests bằng limits.

## Bằng chứng cần nộp

Cấu trúc theo [mẫu nộp bài lab](../../templates/lab-template.md), gồm hai thư mục:

```text
lab-25/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 1-3
├── source/
│   ├── hw13-settings.yaml
│   ├── hw13-config-check.yaml
│   └── app.properties     # nếu làm L2
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              # dự đoán, phân tích, câu hỏi kiểm tra
lab-26/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 4-5
├── source/
│   ├── backend-deploy.yaml
│   ├── oom-hw13.yaml
│   └── (manifest L2 nếu làm)
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md
```

Evidence cụ thể cho từng nhiệm vụ:

| Nhiệm vụ | Evidence bắt buộc |
| --- | --- |
| 1 | `hw13-settings.yaml`, `hw13-config-check.yaml`; output `get configmap -o yaml`, `describe secret`, giải mã `base64 -d` (đã che), `ls /etc/hw13`, `printenv`; kết quả `git ls-files` |
| 2 | Output `printenv` ngay sau khi đổi, vòng lặp quan sát file, `printenv` sau khi tạo lại Pod; đoạn dự đoán và so sánh trong `report.md` |
| 3 | `get pods`, Events của `describe pod`, `logs` hoặc `exec`, `printenv DB_HOST`, `get configmap -o yaml`, `rollout status` sau khôi phục, `curl /ready` |
| 4 | `backend-deploy.yaml`; output `describe pod` (3 probe và QoS Class), `rollout status`, `jsonpath` qosClass |
| 5 | `oom-hw13.yaml`; output OOMKilled và 137, logs; `get pods`, Events `Readiness probe failed`, `get endpoints`, trước và sau khôi phục |
| L2 | Manifest trong `source/`; output đo thời gian cập nhật; output RESTARTS và events; output `qosClass` |

Mọi output phải là kết quả thật từ máy của bạn (tên Pod, hash, thời gian khác nhau giữa các bạn). Screenshot chỉ bổ sung, không thay thế `command-output.txt`.

## Barem chấm

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: ConfigMap, Secret, Pod nhận cấu hình | Manifest tự viết, đủ ba cách nạp, Secret tạo bằng lệnh và giải mã được | Thiếu cách nạp, Secret nằm trong file commit, hoặc output không khớp | 16 |
| Nhiệm vụ 2: hành vi cập nhật cấu hình | Có dự đoán trước, đo được thời gian file đổi, env đổi chỉ sau khi tạo lại Pod | Không có dự đoán, thiếu vòng lặp quan sát hoặc kết luận sai cơ chế | 14 |
| Nhiệm vụ 3: chẩn đoán DB_HOST sai | Đủ bốn bước điều tra, chứng minh dịch vụ còn chạy, khôi phục có xác nhận | Chỉ nêu "sai tên host" không có Events hoặc không khôi phục | 16 |
| Nhiệm vụ 4: requests, limits, ba probe | Manifest tự viết, đủ ba probe đúng endpoint, rollout thành công, giải thích con số | Thiếu probe, sai endpoint hoặc không giải thích được lựa chọn | 18 |
| Nhiệm vụ 5: OOMKilled và readiness fail | Có OOMKilled kèm 137, chẩn đoán readiness bằng Events và Endpoints, khôi phục | Thiếu một trong hai phần hoặc không có bằng chứng từ lệnh | 16 |
| Chất lượng report và câu hỏi kiểm tra | 5 câu trả lời đúng, ngắn, có lý do | Trả lời chung chung hoặc sai khái niệm | 10 |
| An toàn dữ liệu (Secret, `.env`, token) | Repository sạch, `git ls-files` và `git grep` không thấy giá trị thật | Có mật khẩu hoặc Secret thật trong commit | 5 |
| Quy trình nộp | PR đúng cấu trúc, đã có review, nộp đúng hạn | Thiếu review, sai cấu trúc hoặc trễ hạn | 5 |
| Tổng L1 |  |  | 100 |
| L2: thử thách 1 | Có số liệu đo của cả hai Pod, giải thích đúng cơ chế | Thiếu số liệu hoặc giải thích sai | tối đa 3 |
| L2: thử thách 2 | RESTARTS tăng trên cả hai Pod, events đủ, đã khôi phục | Thiếu bằng chứng hoặc không khôi phục | tối đa 4 |
| L2: thử thách 3 | Output `Guaranteed`, giải thích đúng thứ tự evict | Output sai hoặc giải thích sai | tối đa 3 |
| Tổng thưởng L2 |  |  | tối đa 10 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `report.md` của `lab-26/`, đặt tiêu đề "Câu hỏi kiểm tra".

1. Base64 trong Secret có phải mã hóa bảo mật không? Nêu một lệnh chứng minh và hai biện pháp bảo vệ Secret tốt hơn.
2. Bạn sửa ConfigMap mà ứng dụng vẫn dùng giá trị cũ. Nêu hai nguyên nhân có thể và cách xử lý từng trường hợp.
3. Phân biệt `requests` và `limits`: ai sử dụng, và hậu quả khác nhau thế nào khi vượt limit của CPU so với memory?
4. Readiness fail và liveness fail khác nhau ở hành động của kubelet như thế nào? Vì sao liveness không nên kiểm tra database?
5. Pod restart liên tục, `kubectl logs` không có lỗi nào. Bạn kiểm tra gì để kết luận nguyên nhân, và dấu hiệu nào xác nhận?

## Lỗi hay bị trừ điểm

- Output trong evidence do tự gõ hoặc sửa tay, không phải kết quả lệnh thật.
- Commit manifest Secret chứa giá trị thật, hoặc giải mã Secret rồi để mật khẩu quan trọng trong `command-output.txt`.
- Quên dấu nháy quanh giá trị số trong ConfigMap (`"5432"`), nên `apply` báo lỗi mà không xử lý.
- Tạo Secret bằng `echo` thay vì `echo -n` hoặc `--from-literal`, làm giá trị dính ký tự xuống dòng.
- Chỉ nêu "sai cấu hình" mà không chỉ ra dòng Events hoặc output chứng minh.
- Khẳng định "biến môi trường tự cập nhật" mà không có output kiểm chứng.
- Dùng đơn vị `M` thay vì `Mi`, hoặc đặt requests lớn hơn limits nên manifest bị từ chối.
- Trỏ liveness probe vào endpoint kiểm tra database mà không có lý do.
- Không khôi phục `club-config`, `club-api` hoặc `postgres` sau thí nghiệm, nên lab sau bị ảnh hưởng.
- Sửa Deployment bằng `kubectl edit` khiến file trong `source/` không khớp trạng thái cluster.
- Làm việc trong `/mnt/c`, dẫn tới lỗi quyền và chạy chậm.
- Nộp sát hạn mà PR chưa có người review.

## Quy trình nộp

1. Tạo branch trong repository cá nhân, ví dụ `week-13`.
2. Commit `lab-25/` và `lab-26/` đúng cấu trúc ở trên; chạy `git grep -n -i -E "stringData|kind: Secret"` và đọc `git diff --cached` để chắc chắn không có giá trị thật.
3. Mở Pull Request vào nhánh chính của repository cá nhân, mô tả ngắn các nhiệm vụ đã làm và level (L1, L2).
4. Nhờ một bạn trong lớp review; người review kiểm tra evidence có thật, chạy thử một manifest và để lại ít nhất hai nhận xét cụ thể.
5. Sửa theo nhận xét, rồi gửi link PR cho mentor để chấm.

Hạn nộp: trước buổi đầu tiên của tuần 14.

## Checklist trước khi nộp

- [ ] `lab-25/` và `lab-26/` đúng cấu trúc theo mẫu lab
- [ ] ConfigMap `hw13-settings` và Pod `hw13-config-check` có manifest tự viết trong `source/`
- [ ] Secret `hw13-credentials` tạo bằng lệnh, không có file Secret chứa giá trị thật trong repository
- [ ] Có dự đoán trước và output chứng minh hành vi cập nhật của env và file mount
- [ ] Có đủ bốn bước điều tra cho lỗi `DB_HOST` sai và xác nhận đã khôi phục
- [ ] `backend-deploy.yaml` có requests, limits và đủ ba probe; có output `describe` với `QoS Class`
- [ ] Có output `OOMKilled` kèm exit code 137 và Events `Readiness probe failed`
- [ ] `club-api` ở 2/2 Ready, `postgres` chạy lại, Pod `oom-hw13` và các Pod thử nghiệm đã được xóa
- [ ] `report.md` có 5 câu trả lời kiểm tra kiến thức
- [ ] `README.md` trả lời 7 câu hỏi trong template cho cả hai lab
- [ ] Không commit `.env`, mật khẩu, token hay file Secret chứa giá trị thật
- [ ] PR đã được ít nhất một bạn review và nộp trước hạn
