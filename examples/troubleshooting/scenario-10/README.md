# Kịch bản 10: Pod chạy nhưng không nhận được traffic

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 30 phút. **Kiến thức:** Kubernetes probes, Service, Endpoints.

## Bối cảnh

Nhóm dự án triển khai `club-api` (2 replicas) cùng một Service tên `backend` lên namespace `ts-10`. Image `club-api:1.0.0` đã được nạp vào kind. Mentor đã chạy `bash setup.sh`. Mọi người nói: "Ứng dụng khởi động bình thường, log không có lỗi".

## Triệu chứng

```bash
kubectl get pods -n ts-10
kubectl get endpoints backend -n ts-10
kubectl logs deploy/club-api -n ts-10
```

```text
NAME                       READY   STATUS    RESTARTS   AGE
club-api-7f9c6d5b8-4hq7z   0/1     Running   0          2m
club-api-7f9c6d5b8-bk2wd   0/1     Running   0          2m

NAME      ENDPOINTS   AGE
backend   <none>      2m

API listening on port 3000
```

Pod ở trạng thái `Running` nhưng `READY` luôn là `0/1`. Service không có endpoint nào. Số `RESTARTS` vẫn bằng 0.

## Yêu cầu

Đưa cả hai Pod về `1/1` và Service có endpoint. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (kể cả việc tự gọi endpoint của ứng dụng từ bên trong cluster để so sánh).
4. Giải pháp (diff của `deployment.yaml`).
5. Phòng tránh.

Ghi chú L2: khác biệt giữa readiness probe và liveness probe. Nếu cấu hình sai liveness probe thay vì readiness probe thì triệu chứng khác thế nào?

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

`kubectl describe pod` có các sự kiện `Unhealthy` ghi lại chính xác thông báo của kubelet khi gọi probe. Đối chiếu địa chỉ mà probe gọi với port mà ứng dụng thực sự lắng nghe (log cho biết).

</details>
