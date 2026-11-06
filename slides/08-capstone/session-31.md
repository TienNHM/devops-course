# Slide buổi 31 – Testing & Troubleshooting

> **Tóm tắt:** Nhóm kiểm thử hệ thống capstone từ máy sạch, cố ý gây lỗi có kiểm soát bằng failure injection, đọc trạng thái, events và log để xác định nguyên nhân gốc, rồi ghi lại thành troubleshooting log và runbook. Lệnh lab: [Buổi 31](../../labs/week-16/session-31.md).

## Mục tiêu: gây lỗi có kiểm soát

![Ba mục tiêu: test máy sạch, failure injection, tìm nguyên nhân](/slides/img/s31-goals.svg)

::: details Ghi chú cho mentor
- Còn lại: áp dụng checklist bảo mật cơ bản; viết troubleshooting log 5 mục và runbook ngắn.
- Chẩn đoán bằng `get`, `describe`, `logs`, `events` thay vì suy đoán.
:::

---

## Chạy được trên máy người viết, lỗi trên máy khác

![Máy người viết có sẵn image, .env, volume; máy khác thiếu DB_PASSWORD và bị ImagePullBackOff](/slides/img/s31-my-machine.svg)

::: details Ghi chú cho mentor
- Máy của người viết mã có sẵn image cũ, tệp `.env` và volume cũ.
- Thành viên khác clone repository: `docker compose up` báo thiếu `DB_PASSWORD`; trên kind: `ImagePullBackOff` vì chưa ai chạy `kind load`.
:::

---

## Khái niệm: Smoke test

![Smoke test: ba lệnh curl kiểm tra /health, /ready, /api/members](/slides/img/s31-k-smoke-test.svg)

- **Smoke test** là bước kiểm tra nhanh xác nhận các chức năng thiết yếu hoạt động sau khi triển khai.
- Ví dụ trong dự án: `curl /health`, `curl /ready` và `curl /api/members` sau khi `docker compose up`.

::: details Ghi chú cho mentor
- Bước này phát hiện sớm các lỗi lớn, nên được chạy trước khi thực hiện những kiểm thử tốn thời gian hơn.
- Smoke test xác nhận hệ thống đang hoạt động ở mức cơ bản trước khi triển khai.
:::

---

## Kiểm thử không chỉ là npm test

![Năm tầng kiểm thử từ unit tới clean-machine](/slides/img/s31-test-layers.svg)

::: details Ghi chú cho mentor
- Unit: `npm test`. Build: `docker compose build`. Smoke: `curl /health /ready`.
- Failure injection: `kubectl delete pod`. Clean-machine: clone mới cộng README.
:::

---

## Khái niệm: Failure injection

![Xóa Pod club-api, quan sát, Pod mới thay thế](/slides/img/s31-k-failure-injection.svg)

- **Failure injection** (gây lỗi có chủ đích) là kỹ thuật cố ý tạo sự cố để quan sát phản ứng của hệ thống.
- Ví dụ trong dự án: `kubectl delete pod` xóa Pod `club-api`, Pod mới thay thế.

::: details Ghi chú cho mentor
- Kỹ thuật này tạo ra một sự cố có kiểm soát để quan sát phản ứng của hệ thống.
- Kỹ thuật này kiểm chứng rằng hệ thống tự phục hồi và người vận hành nhận ra được tín hiệu lỗi, trước khi sự cố thật xảy ra.
:::

---

## Failure injection: một lỗi, có đường lui

![Vòng dự đoán, phá, quan sát, hoàn tác](/slides/img/s31-injection-loop.svg)

::: details Ghi chú cho mentor
- Mục đích: xác nhận hệ thống tự hồi phục và người vận hành nhận ra tín hiệu.
- Chỉ thực hiện trên môi trường local hoặc cluster của chính nhóm; mỗi lần một lỗi, ghi lại thời điểm và lệnh.
- Dự đoán triệu chứng trước khi chạy lệnh.
:::

---

## Chẩn đoán từ ngoài vào trong

![Năm bước: trạng thái, sự kiện, log, cấu hình, kết nối](/slides/img/s31-diagnose.svg)

::: details Ghi chú cho mentor
- Thêm `--previous` cho `kubectl logs` nếu Pod đã restart.
- Bước kết nối: dùng `kubectl exec` hoặc `kubectl port-forward` rồi `curl`.
:::

---

## Hệ thống đang kiểm thử

![Tester qua Ingress, club-web, hai Pod api, postgres và các điểm có thể phá](/slides/img/s31-arch.svg)

::: details Ghi chú cho mentor
- Ingress `club.localhost` chuyển tới `club-web`; `/api/` đi qua Service backend tới hai Pod `club-api`.
- Cả hai Pod kết nối tới postgres có PVC. Ba lỗi bắt buộc đều nhắm vào Pod `club-api`.
:::

---

## Khái niệm: Readiness probe và liveness probe

![Readiness quyết định nhận traffic, liveness quyết định restart](/slides/img/s31-k-probes.svg)

- **Readiness probe** kiểm tra Pod sẵn sàng nhận traffic; **liveness probe** kiểm tra tiến trình còn sống để quyết định restart.
- Ví dụ trong dự án: `/ready` chạy `SELECT 1` tới PostgreSQL; `/health` chỉ báo tiến trình còn sống.

::: details Ghi chú cho mentor
- Liveness probe giúp Kubernetes quyết định có restart container hay không.
- Hai probe trả lời hai câu hỏi khác nhau, nên một Pod có thể không Ready mà vẫn không bị restart.
:::

---

## Readiness nhận traffic, liveness restart

![Readiness /ready chạy SELECT 1; liveness /health chỉ báo tiến trình sống](/slides/img/s31-probes.svg)

::: details Ghi chú cho mentor
- Service chỉ gửi traffic tới Pod đã qua readiness (`GET /ready`).
- Khi mất kết nối DB, Pod chuyển sang `0/1` nhưng không bị restart vì liveness không kiểm tra DB.
- Rolling update giữ Pod cũ nếu Pod mới không Ready.
:::

---

## Demo: dự đoán, gây lỗi, quan sát

```text
$ kubectl delete pod POD_BACKEND -n club
$ kubectl get pods -n club -w
club-api-xxx   1/1   Terminating
club-api-yyy   0/1   ContainerCreating
club-api-yyy   1/1   Running
```

Mã `200` vẫn liên tục vì còn Pod thứ hai.

::: details Ghi chú cho mentor
- Trạng thái khỏe: hai Pod `club-api` ở `1/1`, API trả JSON có Alice và Bob.
- Dự đoán trước, rồi mới chạy lệnh. Tên Pod thật lấy từ `kubectl get pods`; dùng đúng lệnh trong lab Phần 3.
:::

---

## Sai tag image: Pod mới lỗi, Pod cũ vẫn chạy

![Đổi sang tag không tồn tại: Pod mới ImagePullBackOff, Pod cũ vẫn phục vụ, rollout undo](/slides/img/s31-badtag.svg)

::: details Ghi chú cho mentor
- Một Pod ở trạng thái `ImagePullBackOff`, Pod cũ vẫn `Running`; events có dòng `Failed to pull image`.
- Hoàn tác bằng `rollout undo`; ba lệnh `get`, `describe`, `events` đủ để chẩn đoán.
:::

---

## Sai mật khẩu DB: Pod mới 0/1

![Secret sai, Pod mới khởi động, SELECT 1 lỗi xác thực nên 0/1](/slides/img/s31-bad-password.svg)

::: details Ghi chú cho mentor
- Pod mới ở `0/1`, `wget` vào Pod mới báo `500`, log có lỗi xác thực.
- Biến môi trường lấy từ Secret và ConfigMap chỉ có hiệu lực sau khi Pod khởi động lại.
:::

---

## Lab Phần 1 và 2: clean clone, kind

| Phần | Việc làm | Mong đợi |
| --- | --- | --- |
| 1 | Clone mới, làm theo README | 3 service `running` |
| 1 | `down` rồi `up` | Dữ liệu còn |
| 2 | `kind load`, `apply`, nạp schema | Mọi Pod Ready |

::: details Ghi chú cho mentor
- Nếu thiếu `.env.example` thì ghi vào danh sách lỗi README.
- Phần 1: smoke test `/health`, `/ready`, `/api/members`.
- Phần 2: build image có tag phiên bản, `kind load`, tạo Secret bằng lệnh, `apply`, nạp schema vào `postgres-0`, đo 5 lần bằng `curl -w`.
:::

---

## Lab Phần 3: ba sự cố bắt buộc

| Sự cố | Triệu chứng |
| --- | --- |
| A Xóa Pod | `200` liên tục |
| B Sai tag image | `ImagePullBackOff` |
| C Sai mật khẩu DB | Pod mới `0/1` |

::: details Ghi chú cho mentor
- Sự cố A: Pod backend bị xóa, `200` liên tục và Pod mới thay thế.
- Sự cố B: events có dòng `Failed to pull image`.
- Sự cố C: Pod mới `0/1` kèm lỗi xác thực.
- Chụp trạng thái trước, trong và sau sự cố; hoàn tác từng sự cố trước khi chuyển sang sự cố tiếp theo.
:::

---

## Khái niệm: Runbook

![Sự cố dẫn tới các bước trong runbook](/slides/img/s31-k-runbook.svg)

- **Runbook** là tài liệu ngắn mô tả các bước vận hành cụ thể để xử lý một tình huống đã biết.
- Ví dụ trong dự án: runbook liệt kê `kubectl logs`, `kubectl rollout undo` và `kubectl scale`.

::: details Ghi chú cho mentor
- Các bước thường gặp gồm đọc log, xem events, restart, rollback hoặc scale.
- Tài liệu này cho phép người khác xử lý sự cố đúng thứ tự mà không phụ thuộc vào trí nhớ của người đã gặp sự cố trước đó.
:::

---

## Lab Phần 4 và 5: bảo mật và ghi nhận

| Việc | Mốc xong |
| --- | --- |
| Bảo mật cơ bản | Không có `.env` trong Git, `id` không in `uid=0` |
| Troubleshooting log | 5 mục cho mỗi sự cố |
| Runbook | log, events, restart, rollback, scale |

::: details Ghi chú cho mentor
- Workflow có khối `permissions`; quét image nếu có Trivy.
- Hiệu năng: 50 request tuần tự cho kết quả gần nhau khi thêm replica, vì nút thắt là client, Ingress và một PostgreSQL.
- Log gồm: sự cố, triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, cách phòng tránh.
:::

---

## Phá lỗi: rollout treo mãi

Triệu chứng: `kubectl rollout status` không kết thúc, một Pod backend mới ở `0/1`, web vẫn dùng được.

```text
$ kubectl get pods -n club
club-api-new   0/1   Running
$ kubectl describe pod club-api-new -n club   # Readiness probe failed
$ kubectl logs club-api-new -n club
```

Hướng điều tra đầy đủ: [Buổi 31 – Thử thách nâng cao](../../labs/week-16/session-31-challenge.md).

::: details Ghi chú cho mentor
- Điều tra theo thứ tự trạng thái, sự kiện, log, cấu hình. Chỉ route `/api/members` mới ghi log lỗi, `/ready` thì không.
- Thử thách L2: nhóm thiết kế một failure injection cho nhóm bên cạnh; chỉ một lỗi, hoàn tác bằng 1-2 lệnh; nhóm nhận đề nộp báo cáo 5 mục trong 15 phút; nhóm ra đề nhận xét bằng chứng đã đủ chưa.
:::

---

## Tổng kết

![Ba điều cần nhớ: test nhiều tầng, chẩn đoán ngoài vào trong, ghi lại sự cố](/slides/img/s31-recap.svg)

Mỗi sự cố cần ghi: triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, cách phòng tránh.

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/): tìm nguyên nhân Pod lỗi từng bước.
- **Tài liệu chính thức:** [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/): dùng exec và logs để xem Pod đang chạy.
- **Best practice:** [Liveness, Readiness và Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): dùng probe để phát hiện lỗi sớm.
- **Best practice:** [Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/): cách ghi và đọc log trong cluster.
- **Best practice:** [OWASP Top Ten](https://owasp.org/www-project-top-ten/): các rủi ro bảo mật web phổ biến nhất.
