# Đáp án 09: Pod Pending

Đề bài dành cho học viên: [Kịch bản 09](../../../examples/troubleshooting/scenario-09/README.md).

> Trạng thái kiểm chứng: manifest đã được kiểm tra cú pháp YAML nhưng chưa chạy trên cluster kind thật. Output Kubernetes dưới đây là dự kiến; số lượng CPU và bộ nhớ của node phụ thuộc máy học viên và cấu hình WSL2 và Docker Desktop.

## Nguyên nhân gốc

Container yêu cầu `requests` là `cpu: "64"` và `memory: 128Gi`, lớn hơn nhiều lượng `allocatable` của node kind trên laptop (thường vài CPU và vài GiB, tùy cấu hình WSL2). Scheduler cộng `requests` của mọi Pod đã đặt để quyết định node nào còn chỗ; không node nào đủ nên Pod ở lại `Pending` và không bao giờ được gán node. Không có container nên không có log.

`limits` không quyết định việc xếp lịch, nhưng ở manifest này `limits` cũng bằng `requests`, và một `limits` quá lớn cũng không có ý nghĩa trên node nhỏ.

## Lệnh điều tra theo thứ tự

```bash
kubectl get pods -n ts-09 -o wide
kubectl describe pod -n ts-09 -l app=club-web
```

Dự kiến trong Events (rút gọn):

```text
Warning  FailedScheduling  ...  0/1 nodes are available: 1 Insufficient cpu, 1 Insufficient memory. preemption: 0/1 nodes are available: 1 No preemption victims found for incoming pod.
```

Nếu node có taint chưa được dung nạp, thông báo sẽ có thêm `node(s) had untolerated taint`. Cluster kind một node dùng cấu hình của starter-project thường không có taint chặn lịch, nhưng nếu thấy thì giải thích cho học viên.

So sánh với thông số thật của node:

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,CPU:.status.allocatable.cpu,MEMORY:.status.allocatable.memory
kubectl describe node | grep -A 8 "Allocated resources"
```

Dự kiến `CPU` vài đơn vị, `MEMORY` vài GiB, nhỏ hơn nhiều so với 64 và 128Gi yêu cầu.

## Cách sửa

Đặt `requests` đủ nhỏ để vừa node, `limits` hợp lý:

```diff
           resources:
             requests:
-              cpu: "64"
-              memory: 128Gi
+              cpu: 100m
+              memory: 64Mi
             limits:
-              cpu: "64"
-              memory: 128Gi
+              cpu: 250m
+              memory: 128Mi
```

Sau đó `kubectl apply -f deployment.yaml`. Deployment tạo Pod mới với cấu hình mới; Pod Pending cũ bị thay thế. Quy tắc: `requests` không được lớn hơn `limits`. Giá trị phải dựa trên đo đạc (ví dụ `kubectl top`, cần metrics-server, hoặc quan sát thực tế) chứ không sao chép từ nơi khác.

## Cách xác minh đã sửa

```bash
kubectl rollout status deployment/club-web -n ts-09
kubectl get pods -n ts-09 -o wide
```

Dự kiến `1/1 Running` và cột `NODE` có tên node.

## Phòng tránh

- Đặt `requests` và `limits` theo đo đạc, và theo môi trường: bản cho kind dùng giá trị nhỏ, bản cho production khác (dùng overlay hoặc values riêng).
- Kiểm tra dung lượng node trước khi triển khai (`kubectl describe node`).
- Dùng `LimitRange` và `ResourceQuota` trong namespace để chặn giá trị phi lý sớm.
- Khi Pod `Pending`, phản xạ đầu tiên là `describe` đọc Events thay vì xóa Pod.

## Câu hỏi mentor

1. Khác biệt giữa `requests` và `limits`? Scheduler dùng giá trị nào?
2. Nếu Pod vượt `limits` về CPU thì chuyện gì xảy ra, còn vượt `limits` về bộ nhớ thì sao? (CPU bị throttle; bộ nhớ có thể bị OOMKilled.)
3. `Pending` có những nguyên nhân phổ biến nào khác? (PVC chưa bind, taint và toleration, nodeSelector và affinity.)
4. Vì sao Pod Pending không có log?
5. Làm cách nào để cluster kind có nhiều tài nguyên hơn? (Tăng tài nguyên của WSL2 và Docker Desktop, thêm worker node trong cấu hình kind.)

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | `Pending`, cột `NODE` trống, không có container |
| Nguyên nhân gốc | 30 | Phải nêu requests vượt allocatable; "thiếu tài nguyên" chung chung được 15 |
| Cách xác minh | 25 | Events của scheduler và đối chiếu với Allocatable |
| Giải pháp | 20 | Giá trị có lý do; `requests` không lớn hơn `limits` |
| Phòng tránh | 15 | Đo đạc, tách cấu hình theo môi trường, `LimitRange` |
| Thưởng L2 | 10 | Phân biệt `requests` và `limits` đúng |
