# Kịch bản 09: Pod đứng yên, không chạy

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 25 phút. **Kiến thức:** Kubernetes scheduling, resource requests và limits.

## Bối cảnh

Một thành viên triển khai trang web `club-web` (Nginx) lên namespace `ts-09` của cluster kind trên laptop. Anh ấy sao chép cấu hình tài nguyên từ một hướng dẫn dành cho máy chủ production. Mentor đã chạy `bash setup.sh`.

## Triệu chứng

```bash
kubectl get pods -n ts-09 -o wide
```

```text
NAME                        READY   STATUS    RESTARTS   AGE   IP       NODE
club-web-6b8d5f9c7d-k7p2w   0/1     Pending   0          3m    <none>   <none>
```

Pod ở trạng thái `Pending` mãi mãi, cột `NODE` trống, và không có container nào được tạo.

## Yêu cầu

Đưa Pod về `1/1 Running` bằng cách sửa manifest cho phù hợp với máy của bạn. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (đối chiếu thông số yêu cầu với thông số thật của node).
4. Giải pháp (giá trị bạn chọn và cách bạn quyết định giá trị đó).
5. Phòng tránh.

Ghi chú L2: phân biệt `requests` và `limits`. Scheduler dùng cái nào để quyết định đặt Pod lên node nào?

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

`kubectl describe pod` có phần Events do scheduler ghi lại, nêu rõ vì sao không node nào phù hợp. Sau đó xem `kubectl describe node` ở phần Capacity và Allocatable.

</details>
