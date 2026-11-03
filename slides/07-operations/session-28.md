# Slide buổi 28 – Kubernetes Operations

> **Tóm tắt:** Vận hành workload trên Kubernetes: rollout, rollback, scale, đọc events, và chẩn đoán ImagePullBackOff, CrashLoopBackOff, Pending theo quy trình từ triệu chứng đến nguyên nhân gốc. Bài lab đầy đủ: [Buổi 28](../../labs/week-14/session-28.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: rollout và rollback, đọc bằng chứng, tự phá tự sửa](/slides/img/s28-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Cuối buổi mỗi bạn viết Troubleshooting report 5 mục.
- Mục tiêu chi tiết: giải thích `maxSurge` và `maxUnavailable`; dùng `rollout status`, `history`, `undo`, `scale`; đọc `describe` và `events`.
:::

---

## Slide 2: Không có quy trình thì đoán mò

![Đẩy bản mới, Pod đỏ, xóa Pod đổi bừa, lần sau lỗi quay lại](/slides/img/s28-outage.svg)

::: details Ghi chú cho mentor
- Trước buổi demo CLB, một bạn đẩy bản `club-api` mới; web vẫn chạy nhưng bản mới không lên.
- Không có quy trình: xóa Pod, apply lại, đổi lung tung cho tới khi "có vẻ ổn", nên lỗi quay lại.
:::

---

## Slide 3: Rollout là thay ReplicaSet

![Ba giai đoạn rollout: ReplicaSet cũ giảm dần, ReplicaSet mới tăng dần](/slides/img/s28-rollout.svg)

::: details Ghi chú cho mentor
- Đổi `spec.template` (image, env, probe) thì Deployment tạo ReplicaSet mới. Chỉ đổi `replicas` thì không có revision mới.
- `maxSurge` mặc định 25% (làm tròn lên), `maxUnavailable` 25% (làm tròn xuống); 3 replicas: surge 1, unavailable 0.
- `revisionHistoryLimit` mặc định 10; `progressDeadlineSeconds` mặc định 600 (hết hạn thì rollout coi là thất bại).
- Bản mới hỏng thì Pod cũ vẫn phục vụ: an toàn, nhưng lỗi dễ bị bỏ sót.
:::

---

## Slide 4: Ba trạng thái lỗi kinh điển

![ImagePullBackOff, CrashLoopBackOff, Pending và bằng chứng đầu tiên của mỗi loại](/slides/img/s28-states.svg)

::: details Ghi chú cho mentor
- `BackOff` là thời gian chờ tăng dần (10s, 20s, 40s, tối đa 5 phút), không phải lỗi riêng. Nguyên nhân thật nằm ở lần thất bại trước đó.
- Pending: Scheduler chưa gán Node; Pod chưa có container nên không có log.
:::

---

## Slide 5: Bốn lệnh chẩn đoán

| Lệnh | Dùng khi |
| --- | --- |
| `kubectl get pods -o wide` | Xem trạng thái, restart, node |
| `kubectl describe pod TEN_POD` | Events, Last State, exit code |
| `kubectl get events --sort-by=.lastTimestamp` | Dòng thời gian trong namespace |
| `kubectl logs TEN_POD --previous` | Log lần chạy trước khi crash |

Events chỉ giữ khoảng 1 giờ: lưu output vào `evidence/` ngay.

::: details Ghi chú cho mentor
- Lệnh thứ năm: `kubectl rollout undo deployment/TEN` để quay về revision trước.
- Hỏi: vì sao `logs` của Pod `CrashLoopBackOff` có thể trống? Vì đang xem container mới.
:::

---

## Slide 6: Lỗi ở bước nào thì ra trạng thái đó

![Sáu bước của một rollout và trạng thái lỗi tương ứng ở bước 3, 4, 5](/slides/img/s28-chain.svg)

::: details Ghi chú cho mentor
- Bước 3 lỗi: Pending. Bước 4: ImagePullBackOff hoặc CrashLoopBackOff. Bước 5: Running nhưng 0/1.
- Hỏi lớp: Pod đang `Running 0/1`, bước nào hỏng?
:::

---

## Slide 7: Quy trình chẩn đoán chuẩn

![Sáu bước: get pods, describe, logs previous, nguyên nhân gốc, sửa, kiểm chứng](/slides/img/s28-flow.svg)

::: details Ghi chú cho mentor
- Trạng thái, rồi events, rồi logs: luôn theo thứ tự này.
- Ví von: bác sĩ xem triệu chứng, xét nghiệm, rồi mới kê đơn.
:::

---

## Slide 8: Demo 1: deploy và nâng cấp

```text
$ kubectl set image deployment/web nginx=nginx:1.27
$ kubectl rollout status deployment/web
$ kubectl get rs
NAME             DESIRED   CURRENT   READY
web-<hash mới>   3         3         3
web-<hash cũ>    0         0         0
```

ReplicaSet cũ còn lại với 0 Pod để làm điểm quay về.

::: details Ghi chú cho mentor
- Tạo Deployment `web` 3 replicas với `nginx:1.26` trong namespace `ops-lab`, chờ `rollout status`; ghi `change-cause` bằng `kubectl annotate`.
- Hỏi lớp: phía sau lệnh create có những object nào? Vì sao ReplicaSet cũ vẫn còn?
- Lỗi hay gặp: gõ sai tên container trong `set image` (ở đây là `nginx`).
- Scale lên 5 rồi về 3: history vẫn đúng hai revision.
:::

---

## Slide 9: Demo 2: tag sai, lỗi im lặng

![Ba Pod cũ vẫn Running, một Pod mới ImagePullBackOff, rollout status báo hết thời gian](/slides/img/s28-silent.svg)

::: details Ghi chú cho mentor
- Đặt tag không tồn tại: `nginx:1.27.999`, rồi `rollout status --timeout=45s`.
- Không chạy `rollout status` thì không ai biết bản mới chưa lên.
:::

---

## Slide 10: Demo 3: đọc Events trước khi rollback

```text
$ kubectl describe pod TEN_POD_LOI
Events:
  Failed to pull image "nginx:1.27.999": ... not found
  Error: ErrImagePull
  Error: ImagePullBackOff
```

Khoanh dòng có `not found`: tag không tồn tại trong registry.

::: details Ghi chú cho mentor
- Output rút gọn; câu chữ có thể khác theo container runtime. Tìm từ khóa `not found`, `manifest unknown`, `unauthorized`.
- Đọc events loại Warning trước khi `undo` để biết vì sao.
:::

---

## Slide 11: Rollback không thay việc tìm nguyên nhân gốc

![web có bản tốt nên undo cứu được; crashy revision 1 cũng hỏng nên undo không giúp](/slides/img/s28-rollback.svg)

::: details Ghi chú cho mentor
- `undo` đưa `spec.template` về revision liền trước; revision được đánh số lại.
- `rollout undo` không giúp khi không có revision tốt trước đó, hoặc lỗi nằm ngoài template (Secret, ConfigMap, dữ liệu).
- Rollback xong chưa hết việc: phải tìm vì sao tag sai lọt vào và phòng tránh.
:::

---

## Slide 12: Lab: CrashLoopBackOff cần logs --previous

```text
$ kubectl logs deploy/crashy --previous
booting
FATAL: thieu bien DB_HOST
$ kubectl describe pod -l app=crashy | grep -A6 "Last State"
Last State: Terminated   Reason: Error   Exit Code: 1
```

Exit code: 1 lỗi ứng dụng, 137 bị kill, 127 lệnh không tồn tại.

::: details Ghi chú cho mentor
- Sửa nguyên nhân gốc: thêm `env` `DB_HOST` và giữ tiến trình chạy. Không dùng `undo` vì revision 1 cũng hỏng.
- Exit code 137: xem `Reason`, thường là OOMKilled khi vượt `limits.memory`.
:::

---

## Slide 13: Lab: ba lần tự phá, tự sửa

| Lỗi | Cách gây | Bằng chứng ở đâu |
| --- | --- | --- |
| ImagePullBackOff | Tag không tồn tại | Events của `describe pod` |
| CrashLoopBackOff | `exit 1` vì thiếu biến | `logs --previous`, `Exit Code` |
| Pending | `requests.cpu` quá lớn | Events `FailedScheduling` |

Lệnh từng bước: [Buổi 28 – Kubernetes Operations](../../labs/week-14/session-28.md).

::: details Ghi chú cho mentor
- Cách sửa: `rollout undo` rồi sửa tag; thêm biến môi trường; giảm `requests`.
- Nhớ `rollout status --timeout` và lưu output vào `evidence/`.
:::

---

## Slide 14: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `ImagePullBackOff` với image tự build | Chưa `kind load docker-image` | Nạp image vào kind |
| `ImagePullBackOff` `unauthorized` | Image private, thiếu Secret | Tạo imagePullSecret |
| `CrashLoopBackOff`, `logs` trống | Đang xem log container mới | `logs --previous` |
| `rollout status` treo lâu | Chờ `progressDeadlineSeconds` | Thêm `--timeout=60s` |

::: details Ghi chú cho mentor
- `Pending` với `Insufficient cpu`: `requests` lớn hơn chỗ trống, giảm `requests`.
- Không commit token khi tạo Secret docker-registry.
- Undo xong mà lỗi quay lại lần deploy sau: chỉ rollback, chưa sửa nguyên nhân gốc.
:::

---

## Slide 15: Thử thách L2 và report 5 mục

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
- Ba tình huống `scenario-07`, `08`, `09`: chỉ nhận triệu chứng, tự tìm nguyên nhân gốc.
- Trên ứng dụng thật: đổi image `club-api` sang `9.9.9`, giải thích vì sao web vẫn chạy, rồi khôi phục.
- Tình huống tổng hợp: Pod `Running` nhưng `0/1` mà web vẫn mở được.
:::

---

## Slide 16: Recap

![Ba điều cần nhớ: ReplicaSet mới, bằng chứng trước, nguyên nhân gốc](/slides/img/s28-recap.svg)

Buổi tiếp theo: [Buổi 29 – Architecture & Planning](../08-capstone/session-29.md).

::: details Ghi chú cho mentor
- Report 5 mục: triệu chứng, bằng chứng, nguyên nhân, cách sửa, phòng tránh.
- Rollback cứu dịch vụ, không thay việc tìm nguyên nhân gốc.
:::
