# Slide buổi 28 – Kubernetes Operations

> **Tóm tắt:** Buổi học trình bày cách vận hành workload trên Kubernetes: rollout, rollback, scale, đọc events, và chẩn đoán ImagePullBackOff, CrashLoopBackOff, Pending theo quy trình từ triệu chứng đến nguyên nhân gốc. Bài lab đầy đủ: [Buổi 28](../../labs/week-14/session-28.md).

## Mục tiêu của buổi 28

![Ba mục tiêu: rollout và rollback, đọc bằng chứng, tự phá tự sửa](/slides/img/s28-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ. Cuối buổi, mỗi học viên viết Troubleshooting report gồm 5 mục.
- Mục tiêu chi tiết: giải thích `maxSurge` và `maxUnavailable`; dùng `rollout status`, `history`, `undo`, `scale`; đọc `describe` và `events`.
:::

---

## Bài toán thực tế: thiếu quy trình thì chẩn đoán theo phỏng đoán

![Đẩy bản mới, Pod đỏ, xóa Pod đổi bừa, lần sau lỗi quay lại](/slides/img/s28-outage.svg)

::: details Ghi chú cho mentor
- Trước buổi demo của CLB, một thành viên triển khai bản `club-api` mới; web vẫn chạy nhưng bản mới không khởi động được.
- Khi không có quy trình, thành viên xóa Pod, apply lại và đổi cấu hình tùy ý cho đến khi hệ thống "có vẻ ổn", nên lỗi quay lại.
:::

---

## Khái niệm: ReplicaSet và rollout

![Deployment tạo ReplicaSet mới, Pod cũ giảm dần, Pod mới tăng dần](/slides/img/s28-k-replicaset.svg)

- **ReplicaSet** duy trì số Pod cố định theo Pod template; **rollout** là quá trình Deployment thay dần Pod cũ bằng Pod mới.
- Ví dụ trong dự án: đổi image của `club-api` tạo ra một ReplicaSet mới.

::: details Ghi chú cho mentor
- Mỗi lần `spec.template` thay đổi, Deployment tạo ReplicaSet mới và giảm dần ReplicaSet cũ, nên bản cũ vẫn phục vụ trong lúc bản mới khởi động.
:::

---

## Khái niệm: maxSurge và maxUnavailable

![Tối đa 4 Pod trong rollout, luôn đủ 3 Pod sẵn sàng](/slides/img/s28-k-maxsurge.svg)

- **`maxSurge`** là số Pod được vượt quá `replicas`; **`maxUnavailable`** là số Pod được phép không sẵn sàng trong lúc rollout.
- Ví dụ trong dự án: Deployment 3 replicas có `maxSurge` là 1 và `maxUnavailable` là 0.

::: details Ghi chú cho mentor
- Hai tham số này quyết định tốc độ thay thế và mức độ dịch vụ còn khả dụng; mỗi tham số mặc định là 25%.
:::

---

## Rollout là thay ReplicaSet

![Ba giai đoạn rollout: ReplicaSet cũ giảm dần, ReplicaSet mới tăng dần](/slides/img/s28-rollout.svg)

::: details Ghi chú cho mentor
- Khi `spec.template` (image, env, probe) thay đổi, Deployment tạo ReplicaSet mới. Chỉ thay đổi `replicas` thì không tạo revision mới.
- `maxSurge` mặc định 25% (làm tròn lên), `maxUnavailable` mặc định 25% (làm tròn xuống); với 3 replicas: surge 1, unavailable 0.
- `revisionHistoryLimit` mặc định 10; `progressDeadlineSeconds` mặc định 600 (hết hạn thì rollout được coi là thất bại).
- Khi bản mới hỏng, Pod cũ vẫn phục vụ: cách này an toàn, nhưng lỗi dễ bị bỏ sót.
:::

---

## Khái niệm: Events

![Pod club-api ghi lại Events, xem bằng kubectl describe](/slides/img/s28-k-events.svg)

- **Events** là bản ghi mô tả điều đã xảy ra với một đối tượng, như xếp lịch Pod, kéo image hoặc probe thất bại.
- Ví dụ trong dự án: Events báo `Failed to pull image` khi tag không tồn tại.

::: details Ghi chú cho mentor
- Events do Kubernetes tạo ra; chúng cho biết nguyên nhân gần nhất của lỗi và thường được xem bằng `kubectl describe` hoặc `kubectl get events`.
- Trong ví dụ trên, đối tượng là Pod của `club-api`.
:::

---

## Khái niệm: ImagePullBackOff, CrashLoopBackOff và Pending

![Ba trạng thái lỗi tương ứng ba bước: gán Node, kéo image, chạy container](/slides/img/s28-k-pod-states.svg)

- **ImagePullBackOff**: kéo image thất bại; **CrashLoopBackOff**: container khởi động rồi thoát lặp lại; **Pending**: Pod chưa được gán Node.
- Ví dụ trong dự án: tag `nginx:1.27.999` gây `ImagePullBackOff`, thiếu biến `DB_HOST` gây `CrashLoopBackOff`.

::: details Ghi chú cho mentor
- `BackOff` là thời gian chờ tăng dần giữa các lần thử lại, không phải một lỗi riêng; nguyên nhân thật nằm ở lần thất bại trước đó.
:::

---

## Ba trạng thái lỗi thường gặp

![ImagePullBackOff, CrashLoopBackOff, Pending và bằng chứng đầu tiên của mỗi loại](/slides/img/s28-states.svg)

::: details Ghi chú cho mentor
- `BackOff` là thời gian chờ tăng dần (10s, 20s, 40s, tối đa 5 phút), không phải một lỗi riêng. Nguyên nhân thật nằm ở lần thất bại trước đó.
- Pending: Scheduler chưa gán Node; Pod chưa có container nên không có log.
:::

---

## Bốn lệnh chẩn đoán

| Lệnh | Dùng khi |
| --- | --- |
| `kubectl get pods -o wide` | Trạng thái, restart |
| `kubectl describe pod TEN_POD` | Events, exit code |
| `kubectl get events --sort-by=.lastTimestamp` | Dòng thời gian |
| `kubectl logs TEN_POD --previous` | Log lần trước |

::: details Ghi chú cho mentor
- Cột "Dùng khi" đầy đủ: `get pods -o wide` xem trạng thái, số lần restart, Node; `describe pod` xem Events, Last State, exit code; `get events` xem dòng thời gian trong namespace; `logs --previous` xem log của lần chạy trước khi crash.
- Events chỉ được giữ khoảng 1 giờ, vì vậy cần lưu output vào `evidence/` ngay.
- Lệnh thứ năm: `kubectl rollout undo deployment/TEN` để quay về revision trước.
- Câu hỏi thảo luận: tại sao `logs` của Pod `CrashLoopBackOff` có thể trống? Vì lệnh đang đọc log của container mới.
:::

---

## Vị trí lỗi trong chuỗi rollout

![Sáu bước của một rollout và trạng thái lỗi tương ứng ở bước 3, 4, 5](/slides/img/s28-chain.svg)

::: details Ghi chú cho mentor
- Lỗi ở bước 3: Pending. Lỗi ở bước 4: ImagePullBackOff hoặc CrashLoopBackOff. Lỗi ở bước 5: Running nhưng 0/1.
- Câu hỏi thảo luận: Pod ở trạng thái `Running 0/1` thì bước nào gặp lỗi?
:::

---

## Quy trình chẩn đoán chuẩn

![Sáu bước: get pods, describe, logs previous, nguyên nhân gốc, sửa, kiểm chứng](/slides/img/s28-flow.svg)

::: details Ghi chú cho mentor
- Thứ tự luôn là trạng thái, rồi events, rồi logs.
- Ví dụ so sánh: bác sĩ xem triệu chứng, xét nghiệm, rồi mới kê đơn.
:::

---

## Demo 1: triển khai và nâng cấp

```text
$ kubectl set image deployment/web nginx=nginx:1.27
$ kubectl rollout status deployment/web
$ kubectl get rs
NAME             DESIRED   CURRENT   READY
web-<hash mới>   3         3         3
web-<hash cũ>    0         0         0
```

ReplicaSet cũ được giữ lại với 0 Pod để làm điểm quay về.

::: details Ghi chú cho mentor
- Tạo Deployment `web` 3 replicas với `nginx:1.26` trong namespace `ops-lab`, chờ `rollout status`; ghi `change-cause` bằng `kubectl annotate`.
- Câu hỏi thảo luận: phía sau lệnh create có những đối tượng nào? Vì sao ReplicaSet cũ vẫn còn?
- Lỗi thường gặp: gõ sai tên container trong `set image` (ở đây là `nginx`).
- Scale lên 5 rồi về 3: history vẫn chỉ có hai revision.
:::

---

## Demo 2: tag sai gây lỗi không có thông báo

![Ba Pod cũ vẫn Running, một Pod mới ImagePullBackOff, rollout status báo hết thời gian](/slides/img/s28-silent.svg)

::: details Ghi chú cho mentor
- Đặt tag không tồn tại: `nginx:1.27.999`, sau đó chạy `rollout status --timeout=45s`.
- Nếu không chạy `rollout status`, không ai biết bản mới chưa khởi động được.
:::

---

## Demo 3: đọc Events trước khi rollback

```text
$ kubectl describe pod TEN_POD_LOI
Events:
  Failed to pull image "nginx:1.27.999": ... not found
  Error: ErrImagePull
  Error: ImagePullBackOff
```

Dòng chứa `not found` cho biết tag không tồn tại trong registry.

::: details Ghi chú cho mentor
- Output đã rút gọn; câu chữ có thể khác theo container runtime. Tìm các từ khóa `not found`, `manifest unknown`, `unauthorized`.
- Đọc events loại Warning trước khi `undo` để xác định nguyên nhân.
:::

---

## Khái niệm: Rollback

![rollout undo quay về bản trước nhưng nguyên nhân gốc vẫn còn](/slides/img/s28-k-rollback.svg)

- **Rollback** là thao tác đưa Deployment về một revision trước đó, thực hiện bằng `kubectl rollout undo`.
- Lưu ý: rollback không loại bỏ nguyên nhân gốc, nên lỗi có thể lặp lại.

::: details Ghi chú cho mentor
- `undo` đưa `spec.template` về revision liền trước, nên chỉ khắc phục được lỗi nằm trong template; lỗi ở Secret, ConfigMap hoặc dữ liệu thì không.
- Rollback khôi phục dịch vụ nhưng không loại bỏ nguyên nhân gốc, nên lỗi có thể lặp lại ở lần triển khai sau.
:::

---

## Rollback không thay việc tìm nguyên nhân gốc

![web có bản tốt nên undo cứu được; crashy revision 1 cũng hỏng nên undo không giúp](/slides/img/s28-rollback.svg)

::: details Ghi chú cho mentor
- `undo` đưa `spec.template` về revision liền trước; revision được đánh số lại.
- `rollout undo` không có tác dụng khi không có revision tốt trước đó, hoặc khi lỗi nằm ngoài template (Secret, ConfigMap, dữ liệu).
- Sau khi rollback vẫn cần xác định vì sao tag sai được triển khai và có biện pháp phòng tránh.
:::

---

## Lab: CrashLoopBackOff cần logs --previous

```text
$ kubectl logs deploy/crashy --previous
booting
FATAL: thieu bien DB_HOST
$ kubectl describe pod -l app=crashy | grep -A6 "Last State"
Last State: Terminated   Reason: Error   Exit Code: 1
```

Ý nghĩa exit code: 1 là lỗi ứng dụng, 137 là bị kill, 127 là lệnh không tồn tại.

::: details Ghi chú cho mentor
- Sửa nguyên nhân gốc: thêm `env` `DB_HOST` và giữ tiến trình chạy. Không dùng `undo` vì revision 1 cũng bị lỗi.
- Exit code 137: xem `Reason`, thường là OOMKilled khi vượt `limits.memory`.
:::

---

## Lab: ba lần tự gây lỗi và tự sửa

| Lỗi | Cách gây | Bằng chứng |
| --- | --- | --- |
| ImagePullBackOff | Tag không tồn tại | Events `describe pod` |
| CrashLoopBackOff | Thiếu biến | `logs --previous` |
| Pending | `requests.cpu` quá lớn | Events `FailedScheduling` |

Lệnh từng bước: [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md).

::: details Ghi chú cho mentor
- Cách gây CrashLoopBackOff: `exit 1` vì thiếu biến; bằng chứng gồm `logs --previous` và `Exit Code`.
- Cách sửa: `rollout undo` rồi sửa tag; thêm biến môi trường; giảm `requests`.
- Dùng `rollout status --timeout` và lưu output vào `evidence/`.
:::

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `ImagePullBackOff`, image tự build | Chưa `kind load docker-image` | Nạp vào kind |
| `ImagePullBackOff` `unauthorized` | Image private | imagePullSecret |
| `CrashLoopBackOff`, `logs` trống | Log container mới | `logs --previous` |
| `rollout status` treo | `progressDeadlineSeconds` | `--timeout=60s` |

::: details Ghi chú cho mentor
- Giải thích đầy đủ: image private thiếu Secret thì cần tạo imagePullSecret; `logs` trống vì đang xem log của container mới; `rollout status` treo vì đang chờ `progressDeadlineSeconds`.
- `Pending` kèm `Insufficient cpu`: `requests` lớn hơn tài nguyên còn trống, cần giảm `requests`.
- Không commit token khi tạo Secret docker-registry.
- Nếu lỗi quay lại ở lần triển khai sau khi `undo`: mới chỉ rollback, chưa sửa nguyên nhân gốc.
:::

---

## Thử thách L2 và report 5 mục

```text
## Sự cố 1
- Triệu chứng
- Bằng chứng (kèm lệnh)
- Nguyên nhân gốc
- Cách khắc phục (kèm cách kiểm chứng)
- Phòng tránh
```

Chi tiết: [Buổi 28 – Thử thách nâng cao](../../labs/week-14/session-28-challenge.md).

::: details Ghi chú cho mentor
- Ba tình huống `scenario-07`, `08`, `09`: học viên chỉ nhận triệu chứng và tự tìm nguyên nhân gốc.
- Trên ứng dụng thật: đổi image `club-api` sang `9.9.9`, giải thích vì sao web vẫn chạy, rồi khôi phục.
- Tình huống tổng hợp: Pod `Running` nhưng `0/1` trong khi web vẫn truy cập được.
:::

---

## Tổng kết

![Ba điều cần nhớ: ReplicaSet mới, bằng chứng trước, nguyên nhân gốc](/slides/img/s28-recap.svg)

Buổi tiếp theo: [Buổi 29 – Architecture & Planning](../08-capstone/session-29.md).

::: details Ghi chú cho mentor
- Report 5 mục: triệu chứng, bằng chứng, nguyên nhân, cách sửa, phòng tránh.
- Rollback khôi phục dịch vụ nhưng không thay việc tìm nguyên nhân gốc.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/): các bước tìm lỗi Pod theo thứ tự.
- **Tài liệu chính thức:** [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/): rolling update và rollback chi tiết.
- **Tài liệu chính thức:** [kubectl Quick Reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/): tra nhanh lệnh kubectl hay dùng.
- **Best practice:** [Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/): viết báo cáo sự cố không đổ lỗi.
- **Best practice:** [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/): mức bảo mật chuẩn cho Pod.
