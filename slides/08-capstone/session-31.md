# Slide buổi 31 – Testing & Troubleshooting

> **Tóm tắt:** Kiểm thử hệ thống capstone từ máy sạch, cố ý phá bằng failure injection, đọc trạng thái, events và log để tìm nguyên nhân gốc, rồi ghi lại thành troubleshooting log và runbook. Lệnh lab: [Buổi 31](../../labs/week-16/session-31.md).

## Slide 1: Hôm nay bạn phá hệ thống có kiểm soát

![Ba mục tiêu: test máy sạch, failure injection, tìm nguyên nhân](/slides/img/s31-goals.svg)

::: details Ghi chú cho mentor
- Còn lại: áp dụng checklist bảo mật cơ bản; viết troubleshooting log 5 mục và runbook ngắn.
- Chẩn đoán bằng `get`, `describe`, `logs`, `events` thay vì đoán mò.
:::

---

## Slide 2: Chạy trên máy tôi, hỏng trên máy bạn

![Máy người viết có sẵn image, .env, volume; máy bạn thiếu DB_PASSWORD và bị ImagePullBackOff](/slides/img/s31-my-machine.svg)

::: details Ghi chú cho mentor
- Máy người viết code có sẵn image cũ, file `.env`, volume cũ.
- Bạn cùng nhóm clone repo: `docker compose up` báo thiếu `DB_PASSWORD`; trên kind: `ImagePullBackOff` vì chưa ai `kind load`.
:::

---

## Slide 3: Kiểm thử không chỉ là npm test

![Năm tầng kiểm thử từ unit tới clean-machine](/slides/img/s31-test-layers.svg)

::: details Ghi chú cho mentor
- Unit: `npm test`. Build: `docker compose build`. Smoke: `curl /health /ready`.
- Failure injection: `kubectl delete pod`. Clean-machine: clone mới cộng README.
:::

---

## Slide 4: Failure injection: một lỗi, có đường lui

![Vòng dự đoán, phá, quan sát, hoàn tác](/slides/img/s31-injection-loop.svg)

::: details Ghi chú cho mentor
- Mục đích: xác nhận hệ thống tự hồi phục và người vận hành nhận ra tín hiệu.
- Chỉ làm trên local hoặc cluster của chính nhóm; mỗi lần một lỗi, ghi thời điểm và lệnh.
- Dự đoán triệu chứng trước khi chạy lệnh.
:::

---

## Slide 5: Chẩn đoán từ ngoài vào trong

![Năm bước: trạng thái, sự kiện, log, cấu hình, kết nối](/slides/img/s31-diagnose.svg)

::: details Ghi chú cho mentor
- Thêm `--previous` cho `kubectl logs` nếu Pod đã restart.
- Bước kết nối: `kubectl exec` hoặc `kubectl port-forward` rồi `curl`.
:::

---

## Slide 6: Hệ thống đang kiểm thử

![Tester qua Ingress, club-web, hai Pod api, postgres và các điểm có thể phá](/slides/img/s31-arch.svg)

::: details Ghi chú cho mentor
- Ingress `club.localhost` gửi tới `club-web`; `/api/` đi qua Service backend tới hai Pod `club-api`.
- Cả hai Pod nối tới postgres có PVC. Ba lỗi bắt buộc đều nhắm vào Pod `club-api`.
:::

---

## Slide 7: Readiness nhận traffic, liveness restart

![Readiness /ready chạy SELECT 1; liveness /health chỉ báo tiến trình sống](/slides/img/s31-probes.svg)

::: details Ghi chú cho mentor
- Service chỉ gửi traffic tới Pod đã qua readiness (`GET /ready`).
- Mất DB làm Pod `0/1` nhưng không bị restart vì liveness không kiểm tra DB.
- Rolling update giữ Pod cũ nếu Pod mới không Ready.
:::

---

## Slide 8: Demo: dự đoán, phá, quan sát

```text
$ kubectl delete pod POD_BACKEND -n club
$ kubectl get pods -n club -w
club-api-xxx   1/1   Terminating
club-api-yyy   0/1   ContainerCreating
club-api-yyy   1/1   Running
```

Mã `200` vẫn liên tục vì còn Pod thứ hai.

::: details Ghi chú cho mentor
- Trạng thái khỏe: hai Pod `club-api` `1/1`, API trả JSON có Alice và Bob.
- Dự đoán trước, rồi mới chạy lệnh. Tên Pod thật lấy từ `kubectl get pods`; dùng đúng lệnh trong lab Phần 3.
:::

---

## Slide 9: Sai tag image: Pod mới lỗi, Pod cũ vẫn chạy

![Đổi sang tag không tồn tại: Pod mới ImagePullBackOff, Pod cũ vẫn phục vụ, rollout undo](/slides/img/s31-badtag.svg)

::: details Ghi chú cho mentor
- Một Pod `ImagePullBackOff`, Pod cũ vẫn `Running`; events có `Failed to pull image`.
- Hoàn tác bằng `rollout undo`; ba lệnh `get`, `describe`, `events` đã đủ để chẩn đoán.
:::

---

## Slide 10: Sai mật khẩu DB: Pod mới 0/1

![Secret sai, Pod mới khởi động, SELECT 1 lỗi xác thực nên 0/1](/slides/img/s31-bad-password.svg)

::: details Ghi chú cho mentor
- Pod mới `0/1`, `wget` vào Pod mới báo `500`, log có lỗi xác thực.
- Biến môi trường từ Secret và ConfigMap chỉ có hiệu lực sau khi Pod khởi động lại.
:::

---

## Slide 11: Lab Phần 1 và 2: clean clone, kind

| Phần | Việc làm | Mong đợi |
| --- | --- | --- |
| 1 | Clone mới, làm theo README | 3 service `running` |
| 1 | `down` rồi `up` | Dữ liệu còn |
| 2 | `kind load`, `apply`, nạp schema | Mọi Pod Ready |

Thiếu `.env.example` thì ghi vào danh sách lỗi README.

::: details Ghi chú cho mentor
- Phần 1: smoke test `/health`, `/ready`, `/api/members`.
- Phần 2: build image có tag phiên bản, `kind load`, tạo Secret bằng lệnh, `apply`, nạp schema vào `postgres-0`, đo 5 lần `curl -w`.
:::

---

## Slide 12: Lab Phần 3: ba sự cố bắt buộc

| Sự cố | Triệu chứng |
| --- | --- |
| A Xóa Pod backend | `200` liên tục, Pod mới thay thế |
| B Sai tag image | `ImagePullBackOff`, `Failed to pull image` |
| C Sai mật khẩu DB | Pod mới `0/1`, lỗi xác thực |

Chụp trạng thái trước, trong, sau; hoàn tác từng sự cố trước khi sang sự cố sau.

---

## Slide 13: Lab Phần 4 và 5: bảo mật và ghi nhận

| Việc | Mốc xong |
| --- | --- |
| Bảo mật cơ bản | Không `.env` trong Git, `id` không in `uid=0` |
| Troubleshooting log | 5 mục cho mỗi sự cố |
| Runbook | log, events, restart, rollback, scale |

::: details Ghi chú cho mentor
- Workflow có khối `permissions`; quét image nếu có Trivy.
- Hiệu năng: 50 request tuần tự cho kết quả gần nhau khi thêm replica, vì nút thắt là client, Ingress và một PostgreSQL.
- Log gồm: sự cố, triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, phòng tránh.
:::

---

## Slide 14: Phá lỗi: rollout treo mãi

Triệu chứng: `kubectl rollout status` treo, một Pod backend mới `0/1`, web vẫn dùng được.

```text
$ kubectl get pods -n club
club-api-new   0/1   Running
$ kubectl describe pod club-api-new -n club   # Readiness probe failed
$ kubectl logs club-api-new -n club
```

Hướng điều tra đầy đủ: [Buổi 31 – Thử thách nâng cao](../../labs/week-16/session-31-challenge.md).

::: details Ghi chú cho mentor
- Đi theo thứ tự trạng thái, sự kiện, log, cấu hình. Chỉ route `/api/members` mới ghi log lỗi, `/ready` thì không.
- Thử thách L2: nhóm thiết kế một failure injection cho nhóm bên cạnh; chỉ một lỗi, hoàn tác bằng 1-2 lệnh; nhóm nhận nộp báo cáo 5 mục trong 15 phút; nhóm ra đề nhận xét bằng chứng đủ chưa.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: test nhiều tầng, chẩn đoán ngoài vào trong, ghi lại sự cố](/slides/img/s31-recap.svg)

Mỗi sự cố ghi: triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, cách phòng tránh.

---

## Slide 16: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/): tìm nguyên nhân Pod lỗi từng bước.
- **Tài liệu chính thức:** [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/): dùng exec và logs để xem Pod đang chạy.
- **Best practice:** [Liveness, Readiness và Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): dùng probe để phát hiện lỗi sớm.
- **Best practice:** [Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/): cách ghi và đọc log trong cluster.
- **Best practice:** [OWASP Top Ten](https://owasp.org/www-project-top-ten/): các rủi ro bảo mật web phổ biến nhất.
