# Kịch bản buổi 25 – Configuration Management

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md). Slide: [Slide buổi 25](../../slides/06-kubectl/session-25.md). Đáp án và chấm điểm: [Đáp án tuần 13](../walkthroughs/week-13.md), [Hướng dẫn chấm tuần 13](../grading/week-13.md).
:::

> **Tóm tắt:** Kịch bản buổi 25: khung thời gian, demo ConfigMap và Secret, câu hỏi cho lớp, ghi chú theo từng slide và lưu ý riêng cho người dạy.

## Khung thời gian

Buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian cho khái niệm và demo.

| Phần của lab | Thời lượng |
| --- | --- |
| Chuẩn bị | 5' |
| Phần 1 – ConfigMap bằng manifest | 5' |
| Phần 2 – Secret bằng lệnh và giải mã | 7' |
| Phần 3 – Postgres và API với cấu hình đã tách | 12' |
| Phần 4 – File mount ở namespace `lab25` | 15' |
| Phần 5 – Làm sai `DB_HOST` và chẩn đoán | 12' |
| Dọn dẹp và checklist L1 | 4' |

Thử thách L2 là bài làm ở nhà, không tính vào 60 phút.

## Kịch bản buổi

### Demo của mentor (khoảng 12 phút)

Mục đích: cho cả lớp thấy base64 không che giấu gì. Dùng namespace `club` và ConfigMap, Secret tạm, không phụ thuộc starter-project.

1. Tạo ConfigMap bằng lệnh.

```bash
kubectl create namespace club
kubectl create configmap app-settings -n club \
  --from-literal=club-name="HCMUTE DSC" \
  --from-literal=log-level=info
kubectl get configmap app-settings -n club -o yaml
```

Kết quả mong đợi (rút gọn):

```text
apiVersion: v1
data:
  club-name: HCMUTE DSC
  log-level: info
kind: ConfigMap
metadata:
  name: app-settings
  namespace: club
```

2. Tạo Secret rồi giải mã.

```bash
kubectl create secret generic demo-secret -n club --from-literal=token='demo-only-value'
kubectl get secret demo-secret -n club -o jsonpath='{.data.token}'
echo
kubectl get secret demo-secret -n club -o jsonpath='{.data.token}' | base64 -d
echo
```

Kết quả mong đợi:

```text
ZGVtby1vbmx5LXZhbHVl
demo-only-value
```

3. Chạy `kubectl describe secret demo-secret -n club` và chỉ cho lớp thấy `describe` ẩn giá trị, nhưng `get -o yaml` cộng `base64 -d` thì lộ hết.

4. Dọn demo trước khi vào lab, để không lẫn với phần lab của học viên:

```bash
kubectl delete secret demo-secret -n club
kubectl delete configmap app-settings -n club
```

### Câu hỏi cho lớp

- "Nếu tôi dán đoạn YAML này lên một kênh chat, ai nhìn thấy mật khẩu?" (Tất cả, vì giải mã chỉ cần một lệnh.)
- "Tôi đổi ConfigMap xong, Pod đang chạy có biết không? Biến môi trường thì sao, file mount thì sao?" Cho lớp dự đoán và ghi lên bảng, rồi kiểm chứng ở Phần 4 của lab.
- "Vì sao `echo 'abc' | base64` và `echo -n 'abc' | base64` cho kết quả khác nhau?" (Dấu xuống dòng thừa bị mã hóa theo, gây lỗi mật khẩu khó thấy.)

## Ghi chú theo slide

Slide buổi 25 có 14 slide.

### Slide 1: Mục tiêu buổi học

Đọc nhanh (2 phút). Nhắc điều kiện: cluster kind `club`, image `club-api:1.0.0` và `club-web:1.0.0` đã nạp, đã học Deployment và Service ở buổi 22-24.

### Slide 2: Vấn đề – mật khẩu nằm trong image

Hỏi lớp: "Nếu image đẩy lên GHCR công khai mà có mật khẩu bên trong thì sao?" Dẫn tới việc cần tách cấu hình ra ngoài (2 phút).

### Slide 3: ConfigMap và Secret

Chỉ bảng so sánh, rồi nhấn điểm quan trọng nhất ở slide sau: base64 không phải bảo mật. Secret chỉ hơn ConfigMap ở chỗ phân quyền RBAC riêng, không in ra `describe`, mount vào tmpfs và có thể bật mã hóa khi lưu.

### Slide 4: Base64 không phải bảo mật

Chạy trực tiếp: `kubectl describe secret` ẩn giá trị, `get -o yaml` cộng `base64 -d` lộ hết. Hỏi: "Dán YAML này vào kênh chat thì ai đọc được mật khẩu?" Chỉ đưa `secret.example.yaml` với giá trị giả lên Git.

### Slide 5: Ba cách đưa cấu hình vào container

Cho lớp dự đoán trước: đổi ConfigMap xong, biến môi trường đổi không? File mount đổi không? Ghi dự đoán lên bảng rồi kiểm chứng ở Phần 4 của lab. Nhắc ngoại lệ `subPath` và `immutable`.

### Slide 6: Cấu hình của club-api

Mở `starter-project/backend/db.js` cho lớp thấy `process.env`. Nhấn: `PORT=3000` viết thẳng trong Deployment, không cần ConfigMap; giá trị ConfigMap luôn là chuỗi nên `DB_PORT: "5432"` phải có nháy.

### Slide 7: Kiến trúc – cấu hình chảy vào Pod

Đi theo từng mũi tên (3 phút). Hỏi: "Nếu Secret và Postgres khác mật khẩu thì lỗi xuất hiện ở đâu?" (API báo `password authentication failed`.)

### Slide 8: Kubelet nạp cấu hình thế nào

Giải thích ngắn: biến môi trường chốt lúc container start; volume được kubelet đồng bộ qua symlink `..data` đổi nguyên tử, còn `subPath` bỏ qua cơ chế này. Không cần đào sâu, học viên chỉ cần nhớ kết luận.

### Slide 9: Demo

Demo 3 phút theo kịch bản ở trên. Cho lớp so sánh hai cách tạo: lệnh nhanh cho thử nghiệm, manifest trong Git cho cấu hình không nhạy cảm cần review.

### Slide 10: Lab – năm phần trong 60 phút

Phát khung thời gian ở bảng phía trên. Nếu `club` còn tài nguyên từ buổi trước thì giữ nguyên `club-api` và `postgres`: lab không còn bước xóa namespace `club`. Phần 2: `read -s` không in mật khẩu lên màn hình; cho học viên tự giải mã `db-password` bằng `base64 -d` làm checklist L1. Phần 3: lỗi `password authentication failed` thường do PVC cũ còn mật khẩu cũ.

### Slide 11: Phá lỗi – DB_HOST sai

Cho lớp 5 phút tự điều tra theo năm bước (`get pods`, `describe`, `logs` hoặc `exec`, `printenv`, đọc ConfigMap). Sửa bằng patch `DB_HOST` về `postgres` rồi `rollout restart`. Log của Pod mới "sạch" vì handler `/ready` nuốt lỗi: để lớp tự phát hiện rồi mới gợi ý gọi `/api/members` để thấy `ENOTFOUND`. Liên quan scenario-03 và scenario-10 trong `examples/troubleshooting`.

### Slide 12: Lỗi thường gặp

Nhấn dòng cuối: xóa file ở commit sau không đủ vì lịch sử Git vẫn còn bản cũ, coi mật khẩu đã lộ. Kiểm tra trước khi push bằng `git grep -n -i -E "stringData|kind: Secret"`.

### Slide 13: Thử thách nâng cao

Gợi ý: biến môi trường dễ lọt vào log hoặc crash dump, còn file mount chỉ lộ cho tiến trình có quyền đọc. Dọn bằng `kubectl delete pod secret-demo -n club --ignore-not-found` và `kubectl delete namespace lab25 --ignore-not-found`; giữ `club-api` và `postgres` cho buổi 26. Nếu học viên làm bài thêm `rollout restart`, nhắc xóa biến `LOG_LEVEL` khỏi `club-config`.

### Slide 14: Recap

Cho học viên tự trả lời 3 câu: vì sao tách cấu hình, vì sao base64 không an toàn, khi Pod mới `0/1` thì kiểm tra gì đầu tiên. Nhắc nộp `report.md` phân tích lỗi `DB_HOST` và không đưa mật khẩu thật vào repo.

## Lưu ý riêng cho người dạy

- Phần 1–3 và 5 làm trên namespace `club` (giữ nguyên `club-api` và `postgres`), còn Pod và ConfigMap thử nghiệm của Phần 4 nằm ở namespace riêng `lab25`. Nếu học viên lỡ xóa `club`, khôi phục bằng cách dựng lại theo `starter-project/k8s/` (namespace, configmap, secret, postgres, backend, frontend).
- Secret `club-secrets` có thể đã được tạo từ buổi 22. Mật khẩu PostgreSQL chỉ được đọc lần đầu khi khởi tạo thư mục dữ liệu, nên học viên không được đổi mật khẩu trong Secret nếu PVC cũ còn dữ liệu; lab hướng dẫn kiểm tra Secret có sẵn trước khi tạo.
- Môi trường thống nhất: cluster kind `club`, context `kind-club`. Học viên nào còn cluster tên khác thì hướng dẫn tạo lại theo buổi 21.
- Cuối buổi chạy `kubectl -n club get deploy,pods` để chắc chắn `club-api` `2/2` và `postgres` `Running`, vì buổi 26 bắt đầu từ trạng thái này.
