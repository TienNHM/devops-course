# Đáp án 08: CrashLoopBackOff

Đề bài dành cho học viên: [Kịch bản 08](../../../examples/troubleshooting/scenario-08/README.md).

> Trạng thái kiểm chứng: logic ứng dụng (thoát mã 1 khi thiếu biến, chạy bình thường khi có biến) đã chạy thật bằng Docker với `node:22-alpine`, và YAML đã được kiểm tra cú pháp. Phần Kubernetes (trạng thái Pod, Events, `describe`) chưa chạy trên cluster thật. Output Kubernetes dưới đây là dự kiến.

## Nguyên nhân gốc

Ứng dụng trong ConfigMap bắt buộc có biến môi trường `NOTES_DB_URL`; nếu thiếu thì in `FATAL: missing required environment variable NOTES_DB_URL` và `process.exit(1)`. Deployment không khai báo biến này nên mỗi lần container khởi động đều thoát ngay với mã 1. Kubelet khởi động lại với khoảng chờ tăng dần (10s, 20s, 40s, ... tối đa 5 phút), tạo ra `CrashLoopBackOff`.

## Lệnh điều tra theo thứ tự

```bash
kubectl get pods -n ts-08
kubectl describe pod -n ts-08 -l app=club-notes
kubectl logs -n ts-08 -l app=club-notes --previous
```

Dự kiến trong `describe`, mục Containers (rút gọn):

```text
State:          Waiting
  Reason:       CrashLoopBackOff
Last State:     Terminated
  Reason:       Error
  Exit Code:    1
```

Image đã kéo thành công (Events có `Pulled` và `Started`), không có `FailedScheduling`, nên không phải lỗi image hay lịch.

Log (đã kiểm chứng phần ứng dụng bằng Docker):

```text
FATAL: missing required environment variable NOTES_DB_URL
```

Dùng `--previous` vì container hiện tại có thể vừa khởi động lại và chưa có log. Kiểm tra cấu hình thực tế của Pod:

```bash
kubectl get deploy club-notes -n ts-08 -o jsonpath='{.spec.template.spec.containers[0].env}'
```

Dự kiến rỗng. Đây là bằng chứng biến không được truyền vào.

## Cách sửa

Tạo Secret chứa chuỗi kết nối (giá trị minh họa cho môi trường học, không dùng secret thật) rồi tham chiếu từ Deployment:

```bash
kubectl create secret generic notes-db -n ts-08 --from-literal=url='postgres://club:CHANGE_ME@postgres:5432/notes'
```

```diff
         - name: notes
           image: node:22-alpine
           command: ["node", "/app/server.js"]
+          env:
+            - name: NOTES_DB_URL
+              valueFrom:
+                secretKeyRef:
+                  name: notes-db
+                  key: url
           ports:
```

Cách tạm thời cho học tập, đơn giản hơn: `kubectl set env deployment/club-notes -n ts-08 NOTES_DB_URL=postgres://club:CHANGE_ME@postgres:5432/notes`. Lưu ý giải thích cho học viên vì sao không đưa chuỗi có mật khẩu vào file YAML commit lên git.

Biến thể thường gặp: nếu tham chiếu tới Secret chưa tồn tại thì Pod báo `CreateContainerConfigError` thay vì `CrashLoopBackOff`, vì container thậm chí chưa được tạo.

## Cách xác minh đã sửa

```bash
kubectl rollout status deployment/club-notes -n ts-08
kubectl get pods -n ts-08
kubectl logs -n ts-08 -l app=club-notes
```

Dự kiến `1/1 Running`, `RESTARTS` ngừng tăng, log `club-notes listening on 3000`.

## Phòng tránh

- Ứng dụng nên kiểm tra cấu hình khi khởi động và in thông báo lỗi rõ ràng (như bài này làm), thay vì chết bằng stack trace khó đọc.
- Dùng ConfigMap cho giá trị không nhạy cảm, Secret cho giá trị nhạy cảm; lưu manifest mẫu `secret.example.yaml` thay vì giá trị thật.
- Thêm `kubectl diff` hoặc dry-run vào CI; kiểm tra cấu hình bắt buộc bằng script smoke test.
- Có readiness probe để Pod lỗi không nhận traffic (xem kịch bản 10).

## Câu hỏi mentor

1. `CrashLoopBackOff` là trạng thái hay là lỗi? Backoff tăng theo quy luật nào?
2. Vì sao cần `--previous`? Khi nào `kubectl logs` không có gì để đọc?
3. Exit code 1, 137, 143 lần lượt nói lên điều gì? (137 thường là bị kill do hết bộ nhớ hoặc SIGKILL.)
4. Khác biệt giữa `CrashLoopBackOff` và `CreateContainerConfigError`?
5. Vì sao Secret không phải là mã hóa? (Chỉ mã hóa base64; cần RBAC và mã hóa at-rest.)

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Nêu cả `RESTARTS` tăng và khoảng cách backoff |
| Nguyên nhân gốc | 30 | Đúng tên biến thiếu; "app lỗi" chung chung chỉ được 10 |
| Cách xác minh | 25 | Có `logs --previous` và `describe` (Exit Code) |
| Giải pháp | 20 | Không commit secret thật; có giải thích |
| Phòng tránh | 15 | Kiểm tra cấu hình khi khởi động, ConfigMap/Secret |
| Thưởng L2 | 10 | Giải thích exit code và cơ chế backoff |
