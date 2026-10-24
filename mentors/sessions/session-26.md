# Kịch bản mentor – Buổi 26: Resource & Health

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md). Slide: [Slide buổi 26](../../slides/07-operations/session-26.md). Đáp án và barem: [Walkthrough tuần 13](../walkthroughs/week-13.md), [Chấm điểm tuần 13](../grading/week-13.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 26: khung thời gian, demo tắt và bật database, ghi chú giảng viên theo từng slide và lưu ý riêng. Nội dung chuyển nguyên văn từ bài lab và slide cũ.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian thực hành dự kiến (bản gốc): 60 phút gồm Phần 1 (10'), Phần 2 (10'), Phần 3 (15'), Phần 4 (10'), L1/L2 (15'). Bản học viên hiện tại: Chuẩn bị 5', Phần 1–4 khoảng 50', thử thách L2 chuyển sang trang thử thách để làm ở nhà.

## Demo của mentor

Mục tiêu: cho cả lớp thấy cùng một lỗi DB tạo ra hai kết quả khác nhau tùy probe được cấu hình. Thời lượng khoảng 12 phút, nằm trong 30' kiến thức + demo.

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

Câu hỏi cho lớp: "Muốn Pod này thành Guaranteed thì phải đổi gì?" (Đáp: đặt requests bằng limits cho cả cpu và memory.)

**Bước 2. Tắt DB, quan sát readiness.** Mở hai terminal. Terminal A:

```bash
kubectl -n club get pods -l app=club-api -w
```

Terminal B:

```bash
kubectl -n club scale statefulset postgres --replicas=0
```

Kết quả mong đợi trong terminal A sau khoảng 30 giây: cột READY của hai Pod `club-api` chuyển từ `1/1` sang `0/1`, cột RESTARTS giữ nguyên.

```bash
kubectl -n club get endpoints backend
```

```text
NAME      ENDPOINTS   AGE
backend   <none>      3h
```

Ghi chú: từ Kubernetes 1.33 `kubectl` có thể in cảnh báo `v1 Endpoints is deprecated`; vẫn dùng được cho mục đích quan sát. Cách mới: `kubectl -n club get endpointslices -l kubernetes.io/service-name=backend`.

Câu hỏi cho lớp: "Pod vẫn Running, tại sao Service không có endpoint? Nếu bây giờ người dùng gọi API thì chuyện gì xảy ra?"

**Bước 3. Bật DB lại.**

```bash
kubectl -n club scale statefulset postgres --replicas=1
kubectl -n club rollout status statefulset/postgres
kubectl -n club get endpoints backend
```

Sau khoảng 30 giây hai IP trở lại trong Endpoints. Không có Pod nào bị restart. Hỏi lớp: "Nếu liveness trỏ vào `/ready` thì bước 2 sẽ khác gì?" (Đáp: sau vài chu kỳ liveness fail, cả hai Pod bị restart liên tục mà DB vẫn chưa lên, gây restart dây chuyền và thêm tải khi DB trở lại.)

## Ghi chú giảng viên theo slide (bản slide cũ)

Các ghi chú dưới đây lấy nguyên văn từ bản slide cũ (18 slide). Bản slide mới đã gọn lại còn 14 slide; thứ tự nội dung giữ nguyên.

### Slide 1: Mục tiêu buổi học

Đọc nhanh 5 mục tiêu, 2 phút. Nhấn mạnh: cuối buổi học viên phải tự phá và tự sửa được hai loại lỗi, không chỉ nghe. Hỏi lớp: ai từng thấy container chết mà log không có lỗi?

### Slide 2: Vấn đề thực tế

Kể tình huống như một buổi sinh hoạt CLB bị gián đoạn. 3 phút. Câu hỏi: "Kubernetes cần biết gì về app của bạn để quản lý tốt?" Dẫn tới hai ý: cần bao nhiêu tài nguyên, và khi nào app khỏe.

### Slide 3: Requests và limits

Vẽ lên bảng hai cột "xếp chỗ" và "cưỡng chế". 3 phút. Câu hỏi: "CPU và memory khác nhau ở điểm nào khi vượt limit?" (CPU nén được, memory thì không.)

### Slide 4: Đơn vị CPU và memory

Đây là cấu hình hiện tại của club-api. 2 phút. Hỏi nhanh: `250m` là bao nhiêu core?

### Slide 5: QoS class

2 phút. Câu hỏi cho lớp: "Muốn club-api thành Guaranteed thì đổi gì?" (Đặt requests bằng limits.) Để học viên L2 làm ở Thử thách A.

### Slide 6: Ba loại probe

Đây là slide quan trọng nhất của phần lý thuyết, dừng 4 phút. Yêu cầu học viên nhắc lại: probe nào làm Pod restart, probe nào chỉ gỡ khỏi Endpoints.

### Slide 7: Endpoint của club-api

Mở `starter-project/backend/app.js` cho lớp xem hai route. 2 phút. Hỏi: "Nếu liveness trỏ vào /ready và DB sập thì sao?" Giữ đáp án cho demo.

### Slide 8: Kiến trúc probe

Chỉ theo từng mũi tên, 2 phút. Nhấn: kubelet là bên gọi probe, còn Service chỉ nhìn kết quả qua Endpoints.

### Slide 9: Khi DB sập, chuyện gì xảy ra

3 phút. Câu hỏi: "Trong khoảng DB sập, người dùng thấy gì?" (Không có backend nào nhận traffic, nhưng không có Pod nào bị restart.)

### Slide 10: Demo 1 – xem requests/limits và QoS

Chạy thật trên cluster kind. 3 phút. Tên Pod trên máy bạn sẽ khác. Nếu output rỗng, kiểm tra `kubectl -n club get pods` và label `app=club-api`.

### Slide 11: Demo 2 – tắt DB, quan sát readiness

Chia màn hình hai terminal. 5 phút. Kubernetes 1.33 trở lên có thể in cảnh báo Endpoints deprecated, vẫn dùng được; cách mới là `get endpointslices -l kubernetes.io/service-name=backend`. Hỏi: "Pod vẫn Running, vì sao Service không có endpoint?"

### Slide 12: Demo 3 – bật DB lại

3 phút. Đây là điểm chốt của demo: readiness xử lý phụ thuộc ngoài, liveness chỉ xử lý "treo". Câu hỏi: "Restart có làm DB lên nhanh hơn không?"

### Slide 13: Lab L1 – thêm probe và quan sát

Phát YAML trong bài lab (Phần 2). 5 phút giải thích: `startupProbe` cho tối đa 2 x 15 = 30 giây, nên không cần `initialDelaySeconds`. Nhắc học viên lưu output vào `evidence/command-output.txt`.

### Slide 14: Lab L1 – OOMKilled

Nhắc `restartPolicy: Never` để giữ nguyên trạng thái lỗi. Số dòng `allocated` có thể khác tùy máy. Hỏi lớp: "Vì sao log không có thông báo lỗi?" (Process bị giết từ bên ngoài, không kịp ghi.)

### Slide 15: Lab L1 và L2 – readiness fail (Tình huống 10)

Học viên chỉ nhận triệu chứng, tự điều tra theo thứ tự: `get pods`, `get endpoints`, `describe`, `exec wget`. 8 phút. Hỏi: "RESTARTS bằng 0 loại trừ những khả năng nào?" (Liveness và OOM.)

### Slide 16: Lỗi thường gặp

2 phút. Với `kubectl top`: kind không cài metrics-server mặc định, đây là hành vi bình thường, không phải lỗi của học viên.

### Slide 17: Thử thách L2

Cho học viên L2 làm độc lập, gợi ý chỉ đưa khi họ thật sự kẹt. Thử thách B: cần khoảng 30 giây liveness fail liên tiếp (period 10 giây, ngưỡng 3) mới thấy restart. Nhắc khôi phục Postgres và liveness sau khi xong.

### Slide 18: Recap

2 phút. Hỏi lại 2 câu kiểm tra: "Vì sao liveness không nên gọi DB?" và "Pod chết, log trống, bạn kiểm tra gì?" Nhắc nộp `lab-26/` theo template.


## Hướng dẫn tạo tình huống lỗi 10 trên lớp

Nguyên văn từ phần Phá lỗi của bài cũ: mentor chạy `bash setup.sh` trong `examples/troubleshooting/scenario-10/` (dùng namespace `ts-10`, thay `-n club` bằng `-n ts-10` ở các lệnh điều tra nếu làm theo kịch bản đó). Học viên chỉ nhận triệu chứng, không đọc manifest trước. Nếu không dùng kịch bản, tự tái hiện bằng Phần 4 của lab trong namespace `club`. Dọn bằng `cleanup.sh` cùng thư mục.

## Lưu ý riêng cho người dạy

- Bài học viên dùng cluster `club` (context `kind-club`). Lệnh mẫu trong demo và slide cũ không gắn tên cluster nên không cần sửa.
- Các thí nghiệm sửa Deployment `club-api` (Phần 4 và thử thách B, C) đều phải kết thúc bằng `kubectl apply -f source/backend-deploy.yaml` và đưa Postgres về `--replicas=1`, nếu không buổi 27 trở đi sẽ bắt đầu từ trạng thái hỏng. Hãy kiểm tra `kubectl -n club get pods` trước khi kết thúc buổi.
- `oom-demo` chạy trong namespace `club` với `restartPolicy: Never`; luôn xóa sau khi quan sát.
- Học viên có thể gặp Pod `Pending` hoặc node thiếu bộ nhớ nếu máy yếu: `club-api` hai replica cộng Postgres cộng `oom-demo` cần khoảng vài trăm MiB trống trong Docker Desktop.
