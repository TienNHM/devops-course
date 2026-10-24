# Chấm điểm tuần 13 – Configuration, Resources & Health

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài và bảng điểm ngắn: [Bài tập tuần 13](../../assignments/weekly/week-13.md). Đáp án mẫu: [Walkthrough tuần 13](../walkthroughs/week-13.md). Kịch bản dạy: [buổi 25](../sessions/session-25.md), [buổi 26](../sessions/session-26.md).
:::

## Điều chỉnh sau khi chuẩn hóa bài tập

Bài tập tuần nay là nộp lại bằng chứng của lab, không có việc mới. So với bản barem gốc ở dưới:

- Tên riêng `hw13-settings`, `hw13-credentials`, `hw13-config-check`, `oom-hw13` không còn bắt buộc; học viên có thể dùng tên trong lab (`app-settings`, `config-demo`, `oom-demo`). Dấu hiệu bài không tự làm là output trùng hệt tài liệu, giá trị cấu hình giống hệt lab, hoặc dùng đúng giá trị sai `DB_HOST` và đường dẫn probe sai mà lab gợi ý. Lab dùng `postgres-db` làm ví dụ cho `DB_HOST` sai và `/readyy` cho đường dẫn probe sai; học viên nên chọn giá trị khác.
- Nhiệm vụ 1: Secret nhận qua `env` được chứng minh bằng `DB_PASSWORD` của `club-api` (Buổi 25, Phần 3) thay cho `api-token` của Pod riêng. Ba cách nạp cấu hình (`env`, `envFrom`, mount) đều xuất hiện trong lab.
- Cluster là `club` (context `kind-club`). Pod thử nghiệm của buổi 25 nằm ở namespace `lab25`, còn `club-api` và `postgres` nằm ở `club`; kiểm tra học viên đã đưa `club` về trạng thái khỏe cuối mỗi buổi.
- Thử thách L2 nằm ở trang riêng: [Buổi 25 – Thử thách nâng cao](../../labs/week-13/session-25-challenge.md) và [Buổi 26 – Thử thách nâng cao](../../labs/week-13/session-26-challenge.md). Lời giải nằm ở [Walkthrough tuần 13](../walkthroughs/week-13.md).

## Lệnh kiểm tra nhanh

Chạy trong thư mục bài nộp của học viên (đã clone repo `devops-labs`):

```bash
git ls-files | grep -i secret
git grep -n -i -E "stringData|kind: Secret"
grep -n -E "OOMKilled|137|Readiness probe failed|successfully rolled out" lab-26/evidence/command-output.txt
grep -n -E "Liveness|Readiness|Startup|QoS Class" lab-26/evidence/command-output.txt
grep -n -E "ENOTFOUND|printenv|rollout status" lab-25/evidence/command-output.txt
```

Trên cluster của học viên (nếu chấm trực tiếp): `kubectl -n club get pods`, `kubectl -n club get endpoints backend`, `kubectl -n club get deploy club-api -o jsonpath='{.spec.template.spec.containers[0].livenessProbe.httpGet.path}'` (phải là `/health`).

## Barem chi tiết (bản gốc, giữ nguyên)

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

## Lỗi hay bị trừ điểm (bản gốc, giữ nguyên)

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

## Hướng dẫn chấm và câu hỏi vấn đáp

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: ConfigMap, Secret, Pod (16 điểm) | `get configmap -o yaml` có 3 key với giá trị chuỗi; `describe secret` chỉ hiện byte; `ls /etc/hw13`; `printenv`; `git ls-files` sạch | Dùng nguyên tên `club-config` hay `app-settings` của lab thay vì tên `hw13-*`; Secret nằm trong file YAML; giá trị giống hệt lab | Tại sao `describe secret` không hiện giá trị mà `get -o yaml` vẫn lộ? Nếu cần commit manifest Secret lên Git, em làm cách nào? |
| Nhiệm vụ 2: hành vi cập nhật (14 điểm) | `printenv` giá trị cũ ngay sau patch; vòng lặp 12 lần có thời điểm file đổi; `printenv` mới sau khi tạo lại Pod; dự đoán viết trước | Dự đoán viết sau (giống hệt kết quả, không có nhầm lẫn nào); thời gian đo đúng bằng số trong lab; thiếu vòng lặp | Vì sao file đổi mà biến không đổi? Nếu Pod dùng `subPath` thì kết quả khác ra sao? |
| Nhiệm vụ 3: chẩn đoán DB_HOST (16 điểm) | `get pods` có Pod `0/1` cùng Pod cũ `1/1`; Events `Readiness probe failed`; `ENOTFOUND` kèm tên sai; `printenv DB_HOST`; `rollout status` và `/ready` sau khôi phục | Dùng đúng giá trị `postgress` của lab; thiếu bước `logs`/`exec`; kết luận "sai host" không kèm Events | Vì sao log sạch mà Pod vẫn hỏng? Vì sao người dùng chưa thấy lỗi? Nếu không có readiness probe thì chuyện gì xảy ra? |
| Nhiệm vụ 4: requests, limits, probe (18 điểm) | `backend-deploy.yaml` tự viết, đủ ba probe đúng endpoint; `describe` có ba dòng probe và `QoS Class`; `jsonpath` qosClass; `rollout status` 2/2 | Con số trùng hệt lab mà không giải thích được; liveness trỏ `/ready`; dùng `M` thay `Mi` | Vì sao em chọn các con số này? Startup tối đa bao nhiêu giây, tính thế nào? Muốn Guaranteed phải đổi gì? |
| Nhiệm vụ 5: OOMKilled và readiness fail (16 điểm) | `OOMKilled` và 137; logs dừng đột ngột; Pod mới `0/1` RESTARTS 0; Events kèm mã HTTP; `get endpoints` không có IP Pod mới; sau khôi phục đủ hai IP; `oom-hw13` đã xóa | Dùng nguyên đường dẫn `/readyy` và lệnh cấp phát của lab; mã HTTP không khớp lỗi đã gây; thiếu bước khôi phục | Vì sao exit code là 137? 404, 503 và connection refused khác nhau ở điểm nào? Vì sao Endpoints vẫn có IP Pod cũ? |
| Report và 5 câu hỏi (10 điểm) | `report.md` có đủ 5 câu ngắn, có lý do | Câu trả lời chung chung, sao chép câu chữ của lab, nhầm requests với limits | Phân biệt readiness và liveness bằng ví dụ DB sập. |
| An toàn dữ liệu (5 điểm) | `git grep -n -i -E "stringData|kind: Secret"` không thấy giá trị thật | Mật khẩu thật trong `command-output.txt` sau bước `base64 -d` chưa che | Nếu lỡ commit Secret lên GitHub công khai thì làm gì ngay? |
| Quy trình nộp (5 điểm) | PR đúng cấu trúc, có review với ít nhất hai nhận xét cụ thể | PR không có review hoặc review chung chung | Reviewer đã chạy thử manifest nào? |
| L2 (tối đa 10 điểm) | Thử thách 1: số liệu thời gian của cả hai Pod, Pod dùng `subPath` không đổi sau 3 phút. Thử thách 2: RESTARTS tăng trên cả hai Pod, events `will be restarted`. Thử thách 3: output `Guaranteed` | Output L2 không có manifest tương ứng trong `source/`; giải thích thứ tự evict sai | Thứ tự bị đuổi giữa BestEffort, Burstable, Guaranteed? Vì sao thiết kế liveness phụ thuộc DB làm sự cố nặng hơn? |

Lưu ý khi chấm: kiểm tra output do lệnh thật tạo ra (tên Pod, hash, thời gian khác nhau giữa các bạn). Hai bài có tên Pod và timestamp trùng nhau là dấu hiệu chép.

## Đề bài gốc: tiêu chí hoàn thành chi tiết

Nguyên văn các nhiệm vụ trong bản bài tập cũ (dùng tên riêng `hw13-*`), để mentor đối chiếu khi cần chấm kỹ.

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
