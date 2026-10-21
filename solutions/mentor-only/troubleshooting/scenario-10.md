# Đáp án 10: Readiness probe fail

Đề bài dành cho học viên: [Kịch bản 10](../../../examples/troubleshooting/scenario-10/README.md).

> Trạng thái kiểm chứng: manifest đã được kiểm tra cú pháp YAML nhưng chưa chạy trên cluster kind thật. Việc backend lắng nghe port 3000 và trả `200` ở `/health` đã được xác nhận bằng Docker (cùng image và mã nguồn). Output Kubernetes dưới đây là dự kiến.

## Nguyên nhân gốc

Ứng dụng lắng nghe port 3000, còn `readinessProbe` gọi `GET /health` ở port 8080. Kubelet nhận `connection refused` ở mỗi lần thử nên Pod không bao giờ `Ready`. Vì chưa `Ready`, Pod bị loại khỏi Endpoints của Service `backend`, nên Service không có đích. Liveness probe không được cấu hình nên container không bị restart (`RESTARTS` luôn 0), và log ứng dụng sạch lỗi.

## Lệnh điều tra theo thứ tự

```bash
kubectl get pods -n ts-10
kubectl get endpoints backend -n ts-10
kubectl logs deploy/club-api -n ts-10
kubectl describe pod -n ts-10 -l app=club-api
```

Dự kiến:

```text
NAME                       READY   STATUS    RESTARTS   AGE
club-api-7f9c6d5b8-4hq7z   0/1     Running   0          2m
club-api-7f9c6d5b8-bk2wd   0/1     Running   0          2m
```

```text
NAME      ENDPOINTS   AGE
backend   <none>      2m
```

Log chỉ có `API listening on port 3000`. Trong Events của `describe`:

```text
Warning  Unhealthy  ...  Readiness probe failed: Get "http://10.244.0.5:8080/health": dial tcp 10.244.0.5:8080: connect: connection refused
```

So sánh bằng cách gọi trực tiếp từ bên trong container (image dựa trên alpine có `wget` của BusyBox):

```bash
kubectl exec -n ts-10 deploy/club-api -- wget -qO- http://localhost:3000/health
kubectl exec -n ts-10 deploy/club-api -- wget -qO- http://localhost:8080/health
```

Dự kiến lệnh đầu trả `{"status":"healthy","service":"club-api"}`, lệnh sau thất bại với lỗi kết nối. Điều này chứng minh ứng dụng khỏe, chỉ có probe sai.

## Cách sửa

```diff
           readinessProbe:
             httpGet:
               path: /health
-              port: 8080
+              port: 3000
```

Sau đó `kubectl apply -f deployment.yaml`.

Chú ý bẫy khi chọn đường dẫn: không đổi sang `/ready` trong kịch bản này. Endpoint `/ready` của backend chạy `SELECT 1` tới Postgres; namespace `ts-10` không có Postgres nên `/ready` trả `503` và Pod vẫn không Ready, một nguyên nhân khác. Chọn endpoint nào cho probe nào là chủ đề trong câu hỏi mentor.

## Cách xác minh đã sửa

```bash
kubectl rollout status deployment/club-api -n ts-10
kubectl get pods -n ts-10
kubectl get endpoints backend -n ts-10
```

Dự kiến `1/1` cho cả hai Pod và Endpoints có hai địa chỉ IP kèm port 3000.

## Phòng tránh

- Đặt tên port trong container (`name: http`) và để probe tham chiếu tên (`port: http`), cổng chỉ khai báo một nơi.
- Thử probe thủ công bằng `kubectl exec` hoặc `kubectl port-forward` trước khi gắn vào Deployment.
- Dùng `startupProbe` cho ứng dụng khởi động chậm thay vì kéo dài `initialDelaySeconds`.
- Theo dõi `kubectl get endpoints` như một phần của quy trình kiểm tra sau triển khai.

## Câu hỏi mentor

1. Khác biệt giữa readiness, liveness và startup probe? Mỗi loại sai thì triệu chứng thế nào? (Liveness sai khiến container bị restart, `RESTARTS` tăng.)
2. Vì sao Pod `Running` nhưng `0/1`? Trạng thái `Running` và điều kiện `Ready` khác nhau thế nào?
3. Endpoints và Service liên hệ với readiness thế nào?
4. Nên dùng `/health` hay `/ready` cho readiness? Khi nào endpoint phụ thuộc DB gây hại (ví dụ DB sập thì toàn bộ Pod bị loại khỏi Service)?
5. Rolling update dùng readiness để làm gì? Điều gì xảy ra nếu bản mới có probe sai? (Bản mới không Ready nên rollout bị chặn, bản cũ vẫn phục vụ.)

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Nêu `0/1 Running`, endpoints rỗng, `RESTARTS` bằng 0 |
| Nguyên nhân gốc | 30 | Phải nêu port probe khác port ứng dụng lắng nghe |
| Cách xác minh | 25 | Events `Unhealthy` và gọi trực tiếp từ trong container |
| Giải pháp | 20 | Sửa đúng port; đổi sang `/ready` mà không hiểu lý do bị trừ điểm |
| Phòng tránh | 15 | Named port, thử probe trước, kiểm tra endpoints |
| Thưởng L2 | 10 | Phân biệt readiness, liveness và startup |
