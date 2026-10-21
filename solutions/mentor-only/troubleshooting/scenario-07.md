# Đáp án 07: ImagePullBackOff

Đề bài dành cho học viên: [Kịch bản 07](../../../examples/troubleshooting/scenario-07/README.md).

> Trạng thái kiểm chứng: manifest đã được kiểm tra cú pháp YAML nhưng chưa chạy trên cluster kind thật (kind chưa cài trên máy biên soạn). Các output bên dưới là dự kiến theo hành vi chuẩn của Kubernetes và containerd; câu chữ chính xác có thể khác. Hãy chạy thử trước buổi học.

## Nguyên nhân gốc

`deployment.yaml` tham chiếu image `club-api:1.0.1`, nhưng chỉ có `club-api:1.0.0` được build và nạp vào kind. Node của kind không có tag `1.0.1` ở local, nên kubelet thử kéo `docker.io/library/club-api:1.0.1` từ Docker Hub. Image đó không tồn tại, kéo thất bại, Pod chuyển `ErrImagePull` rồi `ImagePullBackOff` (thử lại với khoảng chờ tăng dần).

`imagePullPolicy: IfNotPresent` chỉ bỏ qua việc kéo khi image đã có trên node. Ở đây image (đúng tag) chưa có.

## Lệnh điều tra theo thứ tự

```bash
kubectl get pods -n ts-07
kubectl describe pod -n ts-07 -l app=club-api
kubectl get events -n ts-07 --sort-by=.metadata.creationTimestamp
```

Dự kiến trong phần Events (rút gọn):

```text
Warning  Failed  ...  Failed to pull image "club-api:1.0.1": ... pull access denied, repository does not exist or may require authorization
Warning  Failed  ...  Error: ErrImagePull
Normal   BackOff ...  Back-off pulling image "club-api:1.0.1"
Warning  Failed  ...  Error: ImagePullBackOff
```

Kiểm tra image nào có trên node (tên container node mặc định của cluster `kind` là `kind-control-plane`; xem tên thật bằng `docker ps`):

```bash
docker exec kind-control-plane crictl images | grep club-api
docker images club-api
```

Dự kiến chỉ thấy `club-api` với tag `1.0.0`. Cuối cùng so tag trong manifest:

```bash
kubectl get deploy club-api -n ts-07 -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## Cách sửa

Hai hướng:

Hướng A, sửa manifest về tag đang có:

```diff
-          image: club-api:1.0.1
+          image: club-api:1.0.0
```

Hoặc nhanh: `kubectl set image deployment/club-api api=club-api:1.0.0 -n ts-07`. Cách này chỉ đúng nếu thật sự muốn dùng phiên bản 1.0.0.

Hướng B, giữ manifest và tạo đúng image (khi `1.0.1` là phiên bản mới có chủ đích):

```bash
docker build -t club-api:1.0.1 ../../../starter-project/backend
kind load docker-image club-api:1.0.1
kubectl rollout restart deployment/club-api -n ts-07
```

Nếu cluster kind không tên `kind`, thêm `--name TEN_CLUSTER` cho `kind load`. Dù chọn hướng nào, GitOps và CI nên đảm bảo tag trong manifest khớp với tag đã build.

## Cách xác minh đã sửa

```bash
kubectl rollout status deployment/club-api -n ts-07
kubectl get pods -n ts-07
```

Dự kiến `1/1 Running`, `RESTARTS` bằng 0.

## Phòng tránh

- Tên và tag image phải đến từ một nguồn duy nhất (biến trong script, hoặc kết quả của CI), không gõ tay hai nơi.
- Với kind: luôn `kind load docker-image` sau mỗi lần build; tránh tag `latest` vì `imagePullPolicy` mặc định là `Always` và kubelet sẽ cố kéo từ registry.
- Với registry thật (GHCR): kiểm tra tag tồn tại, và tạo `imagePullSecret` khi image riêng tư.
- Ghim phiên bản cụ thể thay cho `latest` để tái lập được.

## Câu hỏi mentor

1. Giải thích các trạng thái `ErrImagePull` và `ImagePullBackOff`: cái nào là lỗi, cái nào là trạng thái chờ?
2. Vì sao Kubernetes tìm `club-api:1.0.1` ở Docker Hub? (Tên không có registry thì mặc định là `docker.io/library/`.)
3. Docker trên máy và containerd trong node kind có dùng chung kho image không? Vì sao phải `kind load`?
4. `imagePullPolicy` có ba giá trị nào, giá trị mặc định phụ thuộc vào điều gì?
5. Khi image riêng tư trên GHCR, `imagePullSecret` được tạo và gắn thế nào? Vì sao không để token trong git?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Nêu cả `ErrImagePull` và `ImagePullBackOff` |
| Nguyên nhân gốc | 30 | Tag không có trên node và không có trên registry; "lỗi mạng" bị trừ |
| Cách xác minh | 25 | Trích Events từ `describe`, đối chiếu với image trên node |
| Giải pháp | 20 | Nêu hai hướng và biết khi nào chọn hướng nào |
| Phòng tránh | 15 | Nguồn tag duy nhất, quy trình `kind load` |
| Thưởng L2 | 10 | Giải thích kho image của node khác Docker host |
