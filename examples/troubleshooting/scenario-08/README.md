# Kịch bản 08: Pod khởi động lại liên tục

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 30 phút. **Kiến thức:** Kubernetes Pod, logs, ConfigMap, biến môi trường.

## Bối cảnh

Một thành viên triển khai dịch vụ ghi chú `club-notes` lên namespace `ts-08` bằng file `deployment.yaml` (mã nguồn ứng dụng được đặt trong ConfigMap để dễ đọc). Image `node:22-alpine` kéo về bình thường. Mentor đã chạy `bash setup.sh`.

## Triệu chứng

```bash
kubectl get pods -n ts-08
```

```text
NAME                         READY   STATUS             RESTARTS      AGE
club-notes-7d9f6c8b5-m4q2z   0/1     CrashLoopBackOff   4 (30s ago)   2m
```

Số `RESTARTS` tăng dần, khoảng cách giữa các lần khởi động lại dài ra. `kubectl describe pod` không có dòng nào về lỗi kéo image hay lỗi scheduling.

## Yêu cầu

Đưa Pod về `1/1 Running`. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (nhớ rằng container hiện tại có thể vừa mới khởi động lại).
4. Giải pháp (diff của `deployment.yaml`; bạn tự quyết định giá trị hợp lý cho môi trường học tập và không đưa secret thật vào file).
5. Phòng tránh.

Ghi chú L2: giải thích `Exit Code` trong `describe` nói lên điều gì, và vì sao `kubectl logs` thường cần cờ `--previous` với trạng thái này.

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Với `CrashLoopBackOff`, ứng dụng đã chạy được rồi mới chết, nên log của nó chứa lý do. Phần `Last State` trong `kubectl describe pod` cho biết container thoát với mã nào và vào lúc nào.

</details>
