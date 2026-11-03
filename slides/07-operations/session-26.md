# Slide buổi 26 – Resource & Health

> **Tóm tắt:** Đặt requests/limits và ba loại probe cho backend club-api, mô phỏng OOMKilled và readiness probe fail, rồi chẩn đoán bằng describe, events và logs. Bài lab đầy đủ: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: requests và limits, ba loại probe, đọc lỗi Pod](/slides/img/s26-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: phân biệt `requests` và `limits`; đoán QoS class từ manifest; cấu hình đủ ba probe cho club-api; tái hiện OOMKilled (exit 137); chẩn đoán Pod `Running` nhưng `0/1` (Tình huống 10).
:::

---

## Slide 2: Chạy ở máy dev, lên cluster thì hỏng

![Ba triệu chứng: Pod chết lặp lại, Running nhưng 0/1, Pending](/slides/img/s26-problems.svg)

::: details Ghi chú cho mentor
- API chạy ổn trên máy dev, lên cluster thì người dùng nhận 502.
- Pod "đang chạy" nhưng chưa nối được DB mà vẫn nhận traffic.
- Pod chết lặp lại, log không có lỗi nào: bị kernel giết vì vượt memory.
- Tất cả là lỗi cấu hình tài nguyên và health check, không phải lỗi code.
:::

---

## Slide 3: requests xếp chỗ, limits đặt trần

![Memory và CPU: dưới requests được đảm bảo, vượt limit memory thì OOMKilled, vượt limit CPU thì throttle](/slides/img/s26-req-limits.svg)

::: details Ghi chú cho mentor
- `requests`: scheduler dùng để xếp Pod vào Node. `limits`: kubelet và kernel cưỡng chế lúc chạy.
- Vượt CPU limit: bị throttle (chậm). Vượt memory limit: OOMKilled.
- CPU: `1` là 1 core, `500m` là 0,5 core. Memory: `128Mi`, `1Gi` (khác `128M`); luôn dùng `Mi`, `Gi`.
:::

---

## Slide 4: QoS class quyết định ai bị đuổi trước

![BestEffort bị đuổi trước, rồi Burstable, cuối cùng Guaranteed](/slides/img/s26-qos.svg)

::: details Ghi chú cho mentor
- Guaranteed: mọi container có requests và limits, requests bằng limits (cpu và memory).
- Burstable: có khai báo nhưng không đủ điều kiện Guaranteed. BestEffort: không khai báo gì.
- club-api hiện tại (100m/128Mi và 500m/256Mi) là Burstable.
:::

---

## Slide 5: Ba probe, ba câu hỏi

![startup, readiness, liveness: câu hỏi và hậu quả khi fail](/slides/img/s26-probes.svg)

::: details Ghi chú cho mentor
- Tham số chính: `periodSeconds`, `timeoutSeconds`, `failureThreshold`. Cơ chế: `httpGet`, `tcpSocket`, `exec`.
- Startup tối đa: `failureThreshold x periodSeconds`.
- Ví von readiness: biển "đang dọn bàn, chưa nhận khách" ở cửa.
:::

---

## Slide 6: club-api có hai endpoint cho hai việc

![kubelet gọi /health cho liveness và startup, /ready cho readiness và chạm DB](/slides/img/s26-endpoints.svg)

::: details Ghi chú cho mentor
- `/health` luôn trả 200, không chạm DB. `/ready` chạy `SELECT 1`, lỗi thì trả 503.
- Thiết kế cố ý: liveness hỏi "còn sống", readiness hỏi "phục vụ được không".
- Liveness không nên phụ thuộc DB: restart không sửa được DB.
:::

---

## Slide 7: Khi DB sập, chuyện gì xảy ra

![Bảng diễn biến: readiness 503, liveness 200, Endpoints rỗng, Pod 0/1 không restart](/slides/img/s26-db-down.svg)

::: details Ghi chú cho mentor
- Startup chạy trước, xong mới bật liveness và readiness.
- DB sập: readiness fail nên Pod ra khỏi Endpoints; liveness vẫn 200 nên không restart.
- DB quay lại: Pod tự Ready lại, không cần can thiệp.
:::

---

## Slide 8: Demo: tắt database rồi bật lại

```bash
kubectl -n club scale statefulset postgres --replicas=0
kubectl -n club get pods -l app=club-api    # 0/1, RESTARTS giữ nguyên
kubectl -n club get endpoints backend       # rỗng
kubectl -n club scale statefulset postgres --replicas=1
```

Câu hỏi: nếu liveness trỏ `/ready` thì sẽ khác gì?

::: details Ghi chú cho mentor
- Xem requests, limits và QoS hiện tại của `club-api` trước khi tắt DB.
- Bật DB lại: hai IP trở về Endpoints, không Pod nào bị restart.
- Lệnh `scale statefulset` lấy từ mô tả demo cũ của slide; tên StatefulSet là `postgres` theo bài lab.
- Người hướng dẫn chạy trực tiếp trên cluster; học viên quan sát và ghi lại dự đoán.
:::

---

## Slide 9: Lab: thêm probe vào manifest

```yaml
startupProbe:
  httpGet: {path: /health, port: 3000}
  periodSeconds: 2
  failureThreshold: 15
readinessProbe:
  httpGet: {path: /ready, port: 3000}
livenessProbe:
  httpGet: {path: /health, port: 3000}
```

Startup tối đa 2 x 15 = 30 giây. Đầy đủ: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md#hands-on-lab).

::: details Ghi chú cho mentor
- Phần 1: đọc requests, limits, QoS; `kubectl top` có thể báo Metrics API not available (bình thường trên kind).
- Phần 2: viết `source/backend-deploy.yaml` có requests, limits và đủ ba probe; apply, chờ rollout, xem probe đã ghi nhận.
- `startupProbe` đủ 30 giây nên không cần `initialDelaySeconds`.
:::

---

## Slide 10: Lab: OOMKilled

![Log dừng đột ngột, describe báo OOMKilled exit code 137 vì SIGKILL](/slides/img/s26-oom.svg)

::: details Ghi chú cho mentor
- Pod thử nghiệm `oom-demo` dùng image `club-api:1.0.0`, limit memory `64Mi`, cố ý cấp phát bộ nhớ liên tục, `restartPolicy: Never`.
- Log dừng đột ngột, không có stack trace: SIGKILL = 128 + 9 = 137, app không kịp ghi log.
- Số dòng `allocated` có thể khác nhau (Node.js khi khởi động đã chiếm khoảng 40 MiB).
- Dọn dẹp Pod thử nghiệm ngay: `kubectl -n club delete pod oom-demo`.
:::

---

## Slide 11: Lab: readiness fail (Tình huống 10)

![Pod mới 0/1, Pod cũ vẫn 1/1, rollout treo vì path readiness sai](/slides/img/s26-readiness.svg)

::: details Ghi chú cho mentor
- Phá bằng cách đặt sai đường dẫn readiness probe (`/readyy`). Pod mới `Running` nhưng `0/1`, RESTARTS 0; hai Pod cũ vẫn phục vụ.
- Events: `Readiness probe failed` kèm mã HTTP.
- Khôi phục bằng `apply` lại manifest; `patch` chỉ để thí nghiệm.
- Cách phòng: thử endpoint của probe bằng `exec` hoặc `port-forward` trước khi viết vào manifest.
:::

---

## Slide 12: Đọc mã trong Events

| Mã | Ý nghĩa | Hướng xử lý |
| --- | --- | --- |
| 404 | Sai path | Sửa path trong probe |
| 503 | App báo chưa sẵn sàng (thường do DB) | Kiểm tra DB và cấu hình |
| `connection refused` | Sai cổng hoặc app chưa lắng nghe | Kiểm tra port và startup |

---

## Slide 13: Lỗi thường gặp và thử thách L2

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `Running` nhưng `0/1` | Readiness fail | `describe`, đọc Events |
| RESTARTS tăng, log sạch | OOMKilled | `describe`, xem Last State |
| Mọi Pod restart khi DB sập | Liveness gọi DB | Liveness chỉ dùng `/health` |
| `Pending`, `Insufficient memory` | `requests` quá lớn | Giảm requests |

Thử thách L2: [Buổi 26 – Thử thách nâng cao](../../labs/week-13/session-26-challenge.md).

::: details Ghi chú cho mentor
- Thử thách L2: A. Guaranteed QoS; B. liveness phụ thuộc DB gây restart dây chuyền; C. startupProbe sai cổng.
- Với `Pending`, xem Allocatable của Node trong `describe node`.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: requests xếp và limits cưỡng chế, probe đúng việc, 0/1 thì describe](/slides/img/s26-recap.svg)

::: details Ghi chú cho mentor
- QoS class quyết định thứ tự bị đuổi khi Node thiếu tài nguyên.
- Liveness chỉ hỏi "còn sống", phụ thuộc ngoài như DB thuộc về readiness.
- `patch` chỉ để thí nghiệm; manifest trong Git là nguồn sự thật.
:::

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/): giải thích requests và limits.
- **Tài liệu chính thức:** [Liveness, Readiness và Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): hướng dẫn cấu hình probe.
- **Best practice:** [Configure Quality of Service for Pods](https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/): chọn requests và limits để Pod ít bị kill.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): các thói quen tốt khi viết manifest.
- **Best practice:** [Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/): học từ sự cố mà không đổ lỗi.
