# Kịch bản 07: Pod không khởi động được

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 30 phút. **Kiến thức:** Kubernetes Pod, image, kind.

## Bối cảnh

Một thành viên triển khai `club-api` lên cluster kind trên máy của mình. Image `club-api:1.0.0` đã được build và nạp vào kind từ buổi trước. Mentor đã chạy `bash setup.sh`. Tài nguyên nằm trong namespace `ts-07`.

## Triệu chứng

```bash
kubectl get pods -n ts-07
```

Sau vài chục giây, Pod không bao giờ lên `Running`:

```text
NAME                        READY   STATUS             RESTARTS   AGE
club-api-5c6d8b7f4d-x2k9q   0/1     ErrImagePull       0          20s
```

Một phút sau, trạng thái chuyển sang `ImagePullBackOff`. Thành viên đó nói: "Tôi đã build image rồi mà".

## Yêu cầu

Đưa Pod về `1/1 Running`. Nộp báo cáo gồm 5 mục:

1. Triệu chứng.
2. Nguyên nhân gốc.
3. Cách xác minh (lệnh Kubernetes và Docker nào chứng minh nguyên nhân?).
4. Giải pháp (nêu ít nhất hai cách và chọn một cách, kèm lý do).
5. Phòng tránh.

Ghi chú L2: vì sao Kubernetes đi tìm image ở một registry công khai trong khi bạn chỉ build ở máy? Điều này liên quan gì tới `imagePullPolicy`?

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

`kubectl describe pod` cho phần Events với thông báo chi tiết về lần kéo image. Hãy so sánh tên image đầy đủ (kể cả tag) trong Events với danh sách image đang có trên node của kind (`docker exec` vào container node rồi dùng `crictl images`).

</details>
