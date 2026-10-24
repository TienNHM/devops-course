# Kịch bản buổi 26 – Resource & Health

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md). Slide: [Slide buổi 26](../../slides/07-operations/session-26.md). Đáp án và chấm điểm: [Đáp án tuần 13](../walkthroughs/week-13.md), [Hướng dẫn chấm tuần 13](../grading/week-13.md).
:::

> **Tóm tắt:** Kịch bản buổi 26: khung thời gian, demo tắt và bật database để so sánh readiness với liveness, câu hỏi cho lớp, ghi chú theo từng slide, cách dựng tình huống 10 trên lớp và lưu ý riêng.

## Khung thời gian

Buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành và review bài làm.

| Phần của lab | Thời lượng |
| --- | --- |
| Chuẩn bị | 5' |
| Phần 1 – Đọc requests, limits và QoS | 7' |
| Phần 2 – Thêm ba probe | 15' |
| Phần 3 – Mô phỏng OOMKilled | 13' |
| Phần 4 – Readiness fail, Pod `Running` nhưng `0/1` | 15' |
| Checklist L1 và dọn dẹp | 5' |

Thử thách L2 (Guaranteed QoS, liveness phụ thuộc DB, startupProbe sai cổng) là bài làm ở nhà.

## Kịch bản buổi

### Demo của mentor (khoảng 12 phút)

Mục tiêu: cho cả lớp thấy cùng một lỗi DB tạo ra hai kết quả khác nhau tùy probe được cấu hình.

**Bước 1. Xem cấu hình hiện tại và QoS.**

```bash
kubectl -n club get deploy club-api -o jsonpath='{.spec.template.spec.containers[0].resources}{"\n"}'
kubectl -n club get pods -l app=club-api -o jsonpath='{range .items[*]}{.metadata.name}{"  "}{.status.qosClass}{"\n"}{end}'
```

Kết quả mong đợi:

```text
{"limits":{"cpu":"500m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}
club-api-7d9c6b8f5-abcde  Burstable
club-api-7d9c6b8f5-fghij  Burstable
```

Câu hỏi cho lớp: "Muốn Pod này thành Guaranteed thì phải đổi gì?" (Đặt requests bằng limits cho cả cpu và memory.)

**Bước 2. Tắt DB, quan sát readiness.** Mở hai terminal. Terminal A:

```bash
kubectl -n club get pods -l app=club-api -w
```

Terminal B:

```bash
kubectl -n club scale statefulset postgres --replicas=0
```

Kết quả mong đợi ở terminal A sau khoảng 30 giây: cột READY của hai Pod `club-api` chuyển từ `1/1` sang `0/1`, cột RESTARTS giữ nguyên.

```bash
kubectl -n club get endpoints backend
```

```text
NAME      ENDPOINTS   AGE
backend   <none>      3h
```

Từ Kubernetes 1.33, `kubectl` có thể in cảnh báo `v1 Endpoints is deprecated`; vẫn dùng được để quan sát. Cách mới: `kubectl -n club get endpointslices -l kubernetes.io/service-name=backend`.

Câu hỏi cho lớp: "Pod vẫn Running, tại sao Service không có endpoint? Nếu bây giờ người dùng gọi API thì chuyện gì xảy ra?"

**Bước 3. Bật DB lại.**

```bash
kubectl -n club scale statefulset postgres --replicas=1
kubectl -n club rollout status statefulset/postgres
kubectl -n club get endpoints backend
```

Sau khoảng 30 giây hai IP trở lại trong Endpoints, không Pod nào bị restart. Hỏi lớp: "Nếu liveness trỏ vào `/ready` thì bước 2 sẽ khác gì?" (Sau vài chu kỳ liveness fail, cả hai Pod bị restart liên tục mà DB vẫn chưa lên: restart dây chuyền và thêm tải khi DB trở lại.)

### Câu hỏi cho lớp

- "CPU và memory khác nhau thế nào khi vượt limit?" (CPU nén được nên bị throttle; memory không nén được nên OOMKilled.)
- "Probe nào làm Pod restart, probe nào chỉ gỡ Pod khỏi Endpoints?"
- "RESTARTS bằng 0 loại trừ những khả năng nào?" (Liveness fail và OOMKilled.)
- "Vì sao log không có thông báo lỗi khi bị OOMKilled?" (Process bị kernel giết từ bên ngoài bằng SIGKILL, không kịp ghi.)

### Dựng tình huống 10 trên lớp (tùy chọn)

Mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-10/` (dùng namespace `ts-10`; thay `-n club` bằng `-n ts-10` ở các lệnh điều tra). Học viên chỉ nhận triệu chứng, không đọc manifest trước. Nếu không dùng kịch bản, tái hiện bằng Phần 4 của lab trong namespace `club`. Dọn bằng `cleanup.sh` cùng thư mục.

## Ghi chú theo slide

Slide buổi 26 có 14 slide.

### Slide 1: Mục tiêu buổi học

Đọc nhanh 5 mục tiêu, 2 phút. Nhấn mạnh: cuối buổi học viên phải tự phá và tự sửa được hai loại lỗi, không chỉ nghe. Hỏi lớp: ai từng thấy container chết mà log không có lỗi?

### Slide 2: Vấn đề thực tế

Kể tình huống như một buổi sinh hoạt CLB bị gián đoạn (3 phút). Câu hỏi: "Kubernetes cần biết gì về app của bạn để quản lý tốt?" Dẫn tới hai ý: cần bao nhiêu tài nguyên, và khi nào app khỏe.

### Slide 3: Requests, limits và đơn vị

Vẽ lên bảng hai cột "xếp chỗ" và "cưỡng chế" (4 phút). Hỏi nhanh: `250m` là bao nhiêu core? `128M` và `128Mi` khác nhau thế nào? Nhắc luôn dùng `Mi`, `Gi`.

### Slide 4: QoS class

2 phút. Câu hỏi: "Muốn club-api thành Guaranteed thì đổi gì?" (Đặt requests bằng limits.) Để học viên L2 làm ở thử thách A.

### Slide 5: Ba loại probe

Slide quan trọng nhất của phần lý thuyết, dừng 4 phút. Yêu cầu học viên nhắc lại: probe nào làm Pod restart, probe nào chỉ gỡ khỏi Endpoints. Nhắc công thức startup tối đa: `failureThreshold x periodSeconds`.

### Slide 6: Endpoint của club-api

Mở `starter-project/backend/app.js` cho lớp xem hai route (2 phút). Hỏi: "Nếu liveness trỏ vào `/ready` và DB sập thì sao?" Giữ đáp án cho demo.

### Slide 7: Kiến trúc probe

Chỉ theo từng mũi tên, 2 phút. Nhấn: kubelet là bên gọi probe, còn Service chỉ nhìn kết quả qua Endpoints.

### Slide 8: Khi DB sập, chuyện gì xảy ra

3 phút. Câu hỏi: "Trong khoảng DB sập, người dùng thấy gì?" (Không backend nào nhận traffic, nhưng không Pod nào bị restart.) Điểm chốt: readiness xử lý phụ thuộc ngoài, liveness chỉ xử lý "treo".

### Slide 9: Demo

Chạy ba bước demo ở trên trên cluster kind thật (khoảng 12 phút, chia màn hình hai terminal). Tên Pod trên máy bạn sẽ khác. Nếu output rỗng, kiểm tra `kubectl -n club get pods` và label `app=club-api`. Hỏi ở bước cuối: "Restart có làm DB lên nhanh hơn không?"

### Slide 10: Lab – thêm probe và đọc QoS

Phát YAML trong Phần 2 của lab, giải thích 5 phút: `startupProbe` cho tối đa 2 x 15 = 30 giây nên không cần `initialDelaySeconds`. `kubectl top` báo `Metrics API not available` là bình thường vì kind không cài metrics-server. Nhắc lưu output vào `evidence/command-output.txt`.

### Slide 11: Lab – OOMKilled

Nhắc `restartPolicy: Never` để giữ nguyên trạng thái lỗi. Số dòng `allocated` có thể khác tùy máy. Hỏi lớp: "Vì sao log không có thông báo lỗi?" Nhắc xóa `oom-demo` sau khi quan sát.

### Slide 12: Lab – readiness fail (tình huống 10)

Học viên chỉ nhận triệu chứng, tự điều tra theo thứ tự: `get pods`, `get endpoints`, `describe`, `exec wget` (8 phút). Hỏi về ba mã 404, 503, `connection refused`. Nhắc chọn đường dẫn sai riêng thay cho `/readyy`. Khôi phục bằng `apply` lại manifest, không dùng `patch`.

### Slide 13: Lỗi thường gặp và thử thách L2

2 phút cho bảng lỗi. Thử thách B cần khoảng 30 giây liveness fail liên tiếp (period 10 giây, ngưỡng 3) mới thấy restart. Cho học viên L2 làm độc lập, chỉ gợi ý khi họ thật sự kẹt.

### Slide 14: Recap

2 phút. Hỏi lại hai câu: "Vì sao liveness không nên gọi DB?" và "Pod chết, log trống, bạn kiểm tra gì?" Nhắc nộp `lab-26/` theo mẫu và nộp cùng `lab-25/` làm bài tập tuần.

## Lưu ý riêng cho người dạy

- Mọi thí nghiệm sửa Deployment `club-api` (Phần 4 và thử thách B, C) phải kết thúc bằng `kubectl apply -f source/backend-deploy.yaml` và đưa Postgres về `--replicas=1`, nếu không buổi 27 trở đi bắt đầu từ trạng thái hỏng. Kiểm tra `kubectl -n club get pods` trước khi kết thúc buổi.
- `oom-demo` chạy trong namespace `club` với `restartPolicy: Never`; luôn xóa sau khi quan sát.
- Máy yếu có thể gặp Pod `Pending` hoặc node thiếu bộ nhớ: `club-api` hai replica cộng Postgres cộng `oom-demo` cần vài trăm MiB trống trong Docker Desktop.
- Môi trường thống nhất: cluster kind `club`, context `kind-club`.
