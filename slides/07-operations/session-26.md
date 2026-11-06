# Slide buổi 26 – Resource & Health

> **Tóm tắt:** Buổi học khai báo requests, limits và ba loại probe cho backend club-api, mô phỏng lỗi OOMKilled và readiness probe thất bại, sau đó chẩn đoán bằng `describe`, events và logs. Bài lab đầy đủ: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md).

## Mục tiêu của buổi 26

![Ba mục tiêu: requests và limits, ba loại probe, đọc lỗi Pod](/slides/img/s26-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: phân biệt `requests` và `limits`; xác định QoS class từ manifest; cấu hình đủ ba probe cho club-api; tái hiện OOMKilled (exit code 137); chẩn đoán Pod ở trạng thái `Running` nhưng `0/1` (Tình huống 10).
:::

---

## Bài toán thực tế: chạy ổn ở máy dev, lỗi trên cluster

![Ba triệu chứng: Pod chết lặp lại, Running nhưng 0/1, Pending](/slides/img/s26-problems.svg)

::: details Ghi chú cho mentor
- API chạy ổn trên máy dev, nhưng khi triển khai lên cluster thì người dùng nhận lỗi 502.
- Pod ở trạng thái `Running` nhưng chưa kết nối được cơ sở dữ liệu, vẫn nhận traffic.
- Pod khởi động lại liên tục mà log không có lỗi: kernel kết thúc tiến trình vì vượt giới hạn memory.
- Cả ba triệu chứng xuất phát từ cấu hình tài nguyên và health check, không phải từ lỗi mã nguồn.
:::

---

## Khái niệm: requests và limits

- **`requests`** là lượng CPU và memory tối thiểu container yêu cầu; **`limits`** là mức tối đa được phép dùng.
- Ví dụ trong dự án: club-api khai báo `requests` 100m CPU và 128Mi memory, `limits` 500m CPU và 256Mi memory.

::: details Ghi chú cho mentor
- Scheduler dựa vào `requests` để chọn Node cho Pod; kubelet và kernel cưỡng chế `limits` khi Pod đang chạy.
:::

---

## Hành vi khi vượt giới hạn

![Memory và CPU: dưới requests được đảm bảo, vượt limit memory thì OOMKilled, vượt limit CPU thì throttle](/slides/img/s26-req-limits.svg)

::: details Ghi chú cho mentor
- `requests` dùng cho scheduler khi xếp Pod vào Node; `limits` do kubelet và kernel cưỡng chế lúc chạy.
- Vượt CPU limit: container bị throttle (giới hạn tốc độ xử lý). Vượt memory limit: container bị OOMKilled.
- Đơn vị CPU: `1` là một core, `500m` là 0,5 core. Đơn vị memory: `128Mi`, `1Gi` (khác `128M`); nên dùng `Mi`, `Gi`.
:::

---

## Khái niệm: QoS class

- **QoS class** là nhóm ưu tiên Kubernetes gán cho Pod dựa trên `requests` và `limits`: Guaranteed, Burstable hoặc BestEffort.
- Ví dụ trong dự án: club-api (100m/128Mi và 500m/256Mi) thuộc nhóm Burstable.

::: details Ghi chú cho mentor
- QoS là viết tắt của Quality of Service. Khi Node thiếu tài nguyên, Pod thuộc nhóm ưu tiên thấp hơn bị loại bỏ (evict) trước.
:::

---

## Thứ tự bị loại bỏ theo QoS class

![BestEffort bị đuổi trước, rồi Burstable, cuối cùng Guaranteed](/slides/img/s26-qos.svg)

::: details Ghi chú cho mentor
- Guaranteed: mọi container có `requests` và `limits`, và `requests` bằng `limits` (cả CPU lẫn memory).
- Burstable: có khai báo nhưng không đủ điều kiện của Guaranteed. BestEffort: không khai báo gì.
- club-api hiện tại (100m/128Mi và 500m/256Mi) là Burstable.
:::

---

## Khái niệm: Probe

- **Probe** là phép kiểm tra định kỳ do kubelet thực hiện trên container, bằng `httpGet`, `tcpSocket` hoặc `exec`.
- Ví dụ trong dự án: club-api có hai endpoint, `/health` và `/ready`, phục vụ ba probe này.

::: details Ghi chú cho mentor
- Kubernetes có ba loại probe: startup (ứng dụng đã khởi động xong chưa), readiness (có nhận traffic được không), liveness (có cần khởi động lại không).
:::

---

## Ba probe, ba câu hỏi

![startup, readiness, liveness: câu hỏi và hậu quả khi fail](/slides/img/s26-probes.svg)

::: details Ghi chú cho mentor
- Tham số chính: `periodSeconds`, `timeoutSeconds`, `failureThreshold`. Cơ chế kiểm tra: `httpGet`, `tcpSocket`, `exec`.
- Thời gian khởi động tối đa của startup probe bằng `failureThreshold` nhân `periodSeconds`.
- Ví dụ so sánh: readiness giống biển "chưa nhận khách" ở cửa hàng: cửa hàng vẫn mở nhưng chưa phục vụ.
:::

---

## Hai endpoint của club-api

![kubelet gọi /health cho liveness và startup, /ready cho readiness và chạm DB](/slides/img/s26-endpoints.svg)

::: details Ghi chú cho mentor
- `/health` luôn trả về 200 và không truy vấn cơ sở dữ liệu. `/ready` chạy `SELECT 1` và trả về 503 khi lỗi.
- Thiết kế có chủ đích: liveness kiểm tra tiến trình còn sống, readiness kiểm tra khả năng phục vụ.
- Liveness không nên phụ thuộc cơ sở dữ liệu, vì khởi động lại Pod không sửa được cơ sở dữ liệu.
:::

---

## Diễn biến khi cơ sở dữ liệu ngừng hoạt động

![Bảng diễn biến: readiness 503, liveness 200, Endpoints rỗng, Pod 0/1 không restart](/slides/img/s26-db-down.svg)

::: details Ghi chú cho mentor
- Startup probe chạy trước; khi startup thành công, liveness và readiness mới được kích hoạt.
- Cơ sở dữ liệu ngừng: readiness thất bại nên Pod bị loại khỏi Endpoints; liveness vẫn trả về 200 nên Pod không bị khởi động lại.
- Cơ sở dữ liệu hoạt động trở lại: Pod tự chuyển về trạng thái Ready, không cần can thiệp.
:::

---

## Demo: tắt rồi bật lại database

```bash
kubectl -n club scale statefulset postgres --replicas=0
kubectl -n club get pods -l app=club-api    # 0/1, RESTARTS giữ nguyên
kubectl -n club get endpoints backend       # rỗng
kubectl -n club scale statefulset postgres --replicas=1
```

Câu hỏi thảo luận: nếu liveness probe trỏ tới `/ready`, kết quả thay đổi như thế nào?

::: details Ghi chú cho mentor
- Trước khi tắt cơ sở dữ liệu, xem `requests`, `limits` và QoS hiện tại của `club-api`.
- Sau khi bật lại, hai IP trở về Endpoints và không Pod nào bị khởi động lại.
- Lệnh `scale statefulset` lấy từ mô tả demo cũ của slide; tên StatefulSet là `postgres` theo bài lab.
- Người hướng dẫn chạy trực tiếp trên cluster; học viên quan sát và ghi lại dự đoán.
:::

---

## Lab: thêm probe vào manifest

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

Startup probe cho phép tối đa 2 x 15 = 30 giây. Hướng dẫn đầy đủ: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md#hands-on-lab).

::: details Ghi chú cho mentor
- Phần 1: đọc `requests`, `limits`, QoS; `kubectl top` có thể báo Metrics API not available (bình thường trên kind).
- Phần 2: viết `source/backend-deploy.yaml` có `requests`, `limits` và đủ ba probe; apply, chờ rollout, kiểm tra probe đã được ghi nhận.
- `startupProbe` cho phép 30 giây nên không cần `initialDelaySeconds`.
:::

---

## Khái niệm: OOMKilled

- **OOMKilled** là trạng thái của container bị kernel kết thúc vì vượt memory limit (OOM: out of memory).
- Ví dụ trong lab: Pod `oom-demo` có limit memory `64Mi` và cấp phát bộ nhớ liên tục đến khi bị kết thúc.

::: details Ghi chú cho mentor
- Tiến trình nhận tín hiệu SIGKILL nên không kịp ghi log, và `describe` hiển thị exit code 137.
:::

---

## Lab: OOMKilled

![Log dừng đột ngột, describe báo OOMKilled exit code 137 vì SIGKILL](/slides/img/s26-oom.svg)

::: details Ghi chú cho mentor
- Pod thử nghiệm `oom-demo` dùng image `club-api:1.0.0`, limit memory `64Mi`, cố ý cấp phát bộ nhớ liên tục, `restartPolicy: Never`.
- Log dừng đột ngột, không có stack trace: SIGKILL = 128 + 9 = 137, ứng dụng không kịp ghi log.
- Số dòng `allocated` có thể khác nhau (Node.js khi khởi động đã chiếm khoảng 40 MiB).
- Xóa Pod thử nghiệm ngay sau bài tập: `kubectl -n club delete pod oom-demo`.
:::

---

## Lab: readiness thất bại (Tình huống 10)

![Pod mới 0/1, Pod cũ vẫn 1/1, rollout treo vì path readiness sai](/slides/img/s26-readiness.svg)

::: details Ghi chú cho mentor
- Gây lỗi bằng cách đặt sai đường dẫn readiness probe (`/readyy`). Pod mới ở trạng thái `Running` nhưng `0/1`, RESTARTS bằng 0; hai Pod cũ vẫn phục vụ.
- Events chứa `Readiness probe failed` kèm mã HTTP.
- Khôi phục bằng cách `apply` lại manifest; `patch` chỉ dùng để thí nghiệm.
- Phòng tránh: thử endpoint của probe bằng `exec` hoặc `port-forward` trước khi ghi vào manifest.
:::

---

## Đọc mã trong Events

| Mã | Ý nghĩa | Hướng xử lý |
| --- | --- | --- |
| 404 | Sai path | Sửa path |
| 503 | Chưa sẵn sàng | Kiểm tra DB |
| `connection refused` | Sai cổng | Kiểm tra port |

::: details Ghi chú cho mentor
- Mã 503: ứng dụng báo chưa sẵn sàng, thường do cơ sở dữ liệu; kiểm tra cơ sở dữ liệu và cấu hình.
- `connection refused`: sai cổng hoặc ứng dụng chưa lắng nghe; kiểm tra port và quá trình khởi động.
:::

---

## Lỗi thường gặp và thử thách L2

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `0/1` | Readiness | `describe` |
| RESTARTS tăng | OOMKilled | Last State |
| Restart khi DB ngừng | Liveness gọi DB | `/health` |
| `Pending` | `requests` lớn | Giảm `requests` |

::: details Ghi chú cho mentor
- Chi tiết các dòng: `Running` nhưng `0/1` do readiness thất bại, xử lý bằng `describe` và đọc Events; RESTARTS tăng mà log không có lỗi là OOMKilled, xem Last State trong `describe`; mọi Pod restart khi DB ngừng do liveness gọi DB, nên liveness chỉ dùng `/health`; `Pending` kèm `Insufficient memory` do `requests` quá lớn.
- Thử thách L2 (slide kế tiếp): A. Guaranteed QoS; B. liveness phụ thuộc DB gây restart dây chuyền; C. startupProbe sai cổng.
- Với trạng thái `Pending`, xem Allocatable của Node trong `describe node`.
:::

---

## Thử thách L2

Chi tiết: [Buổi 26 – Thử thách nâng cao](../../labs/week-13/session-26-challenge.md).

---

## Tổng kết

![Ba điều cần nhớ: requests xếp và limits cưỡng chế, probe đúng việc, 0/1 thì describe](/slides/img/s26-recap.svg)

::: details Ghi chú cho mentor
- QoS class quyết định thứ tự bị loại bỏ khi Node thiếu tài nguyên.
- Liveness chỉ kiểm tra tiến trình còn sống; phụ thuộc bên ngoài như cơ sở dữ liệu thuộc về readiness.
- `patch` chỉ dùng để thí nghiệm; manifest trong Git là nguồn sự thật.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/): giải thích requests và limits.
- **Tài liệu chính thức:** [Liveness, Readiness và Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/): hướng dẫn cấu hình probe.
- **Best practice:** [Configure Quality of Service for Pods](https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/): chọn requests và limits để Pod ít bị kill.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): các thói quen tốt khi viết manifest.
- **Best practice:** [Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/): học từ sự cố mà không đổ lỗi.
