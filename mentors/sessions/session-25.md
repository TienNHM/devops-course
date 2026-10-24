# Kịch bản mentor – Buổi 25: Configuration Management

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md). Slide: [Slide buổi 25](../../slides/06-kubectl/session-25.md). Đáp án và barem: [Walkthrough tuần 13](../walkthroughs/week-13.md), [Chấm điểm tuần 13](../grading/week-13.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 25: khung thời gian, demo của mentor, câu hỏi cho lớp, ghi chú giảng viên theo từng slide và lưu ý riêng. Nội dung chuyển nguyên văn từ bài lab và slide cũ.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

Thời gian thực hành dự kiến (bản gốc): 60 phút gồm Chuẩn bị 5', Phần 1–5 khoảng 35' (L1), L2 khoảng 20'. Bản học viên hiện tại: Chuẩn bị 5', Phần 1–5 khoảng 50', phần L2 chuyển sang trang thử thách để làm ở nhà.

## Demo của mentor

Mục đích: cho cả lớp thấy cùng một image chạy với cấu hình khác nhau và base64 không che giấu gì. Dùng namespace `club` và Pod busybox nhỏ để không phụ thuộc starter-project.

1. Tạo namespace và ConfigMap bằng lệnh.

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

Câu hỏi cho lớp:

- "Nếu tôi dán đoạn YAML này lên một kênh chat, ai nhìn thấy mật khẩu?" (Tất cả, vì giải mã chỉ cần một lệnh.)
- "Tôi đổi ConfigMap xong, Pod đang chạy có biết không? Biến môi trường thì sao, file mount thì sao?" Cho lớp dự đoán, rồi kiểm chứng ở Phần 4 của lab.
- "Vì sao `echo 'abc' | base64` và `echo -n 'abc' | base64` cho kết quả khác nhau?" (Dấu xuống dòng thừa bị mã hóa theo, gây lỗi mật khẩu khó thấy.)

Dọn demo trước khi vào lab: `kubectl delete secret demo-secret -n club`.

## Ghi chú giảng viên theo slide (bản slide cũ)

Các ghi chú dưới đây lấy nguyên văn từ bản slide cũ (19 slide). Bản slide mới đã gọn lại còn 14 slide; thứ tự nội dung giữ nguyên.

### Slide 1: Mục tiêu buổi học

Đọc nhanh (2 phút). Nhắc điều kiện: cluster kind, image `club-api:1.0.0` và `club-web:1.0.0` đã nạp, đã học Deployment và Service ở buổi 22-24.

### Slide 2: Vấn đề – mật khẩu nằm trong image

Hỏi lớp: "Nếu image đẩy lên GHCR công khai mà có mật khẩu bên trong thì sao?" Dẫn tới việc cần tách cấu hình ra ngoài (2 phút).

### Slide 3: ConfigMap và Secret

Nhấn điểm quan trọng nhất ở slide sau: base64 không phải bảo mật. Secret chỉ hơn ConfigMap ở chỗ phân quyền RBAC riêng, không in ra `describe`, và có thể bật mã hoá khi lưu.

### Slide 4: Base64 không phải bảo mật

Chạy trực tiếp và cho lớp thấy `kubectl describe secret demo-secret -n club` ẩn giá trị trong khi `get -o yaml` cộng `base64 -d` lộ hết. Hỏi: "Dán YAML này vào kênh chat thì ai đọc được mật khẩu?" Dọn bằng `kubectl delete secret demo-secret -n club`.

### Slide 5: Ba cách đưa cấu hình vào container

Cho lớp dự đoán trước: đổi ConfigMap xong, biến môi trường đổi không? File mount đổi không? Ghi dự đoán lên bảng rồi kiểm chứng ở lab phần 4.

### Slide 6: Cấu hình của club-api

Mở `starter-project/backend/db.js` cho lớp thấy `process.env`. Nhấn: `PORT=3000` viết thẳng trong Deployment, không cần ConfigMap.

### Slide 7: Kiến trúc – cấu hình chảy vào Pod

Đi theo từng mũi tên (3 phút). Hỏi: "Nếu Secret và Postgres khác mật khẩu thì lỗi xuất hiện ở đâu?" (API báo password authentication failed.)

### Slide 8: Kubelet nạp cấu hình thế nào

Giải thích cơ chế symlink `..data` đổi nguyên tử, và vì sao `subPath` bỏ qua cơ chế này. Không cần đào sâu, chỉ cần học viên nhớ kết luận.

### Slide 9: Demo – ConfigMap bằng lệnh

Demo 3 phút. Cho lớp so sánh hai cách tạo: lệnh nhanh cho thử nghiệm, manifest trong Git cho cấu hình không nhạy cảm cần review.

### Slide 10: Lab phần 1 – namespace và ConfigMap bằng manifest

Nếu `club` còn tài nguyên từ buổi trước, hướng dẫn xoá sạch bằng `kubectl delete namespace club --ignore-not-found` (chỉ trên cluster của chính học viên) để bắt đầu từ trạng thái rõ ràng.

### Slide 11: Lab phần 2 – Secret bằng lệnh

`read -s` không in mật khẩu lên màn hình. Cho học viên tự giải mã `db-password` bằng `base64 -d` để làm checklist L1.

### Slide 12: Lab phần 3 – chạy Postgres và API

Lỗi `password authentication failed` thường do PVC cũ: xoá namespace (kèm PVC) rồi làm lại. Nếu `rollout status` quá thời gian, chuyển ngay sang phần Phá lỗi.

### Slide 13: Lab phần 3 – chứng minh API nối được DB

Chạy `port-forward` ở terminal thứ hai. Hỏi lớp: "Vì sao `/health` có thể healthy trong khi `/ready` lỗi?" (`/health` không chạm database.)

### Slide 14: Lab phần 4 – file mount và hành vi cập nhật

Pod `config-demo` được tạo từ manifest ở bài lab, đọc cấu hình theo cả hai đường. Dòng `debug` có thể chưa xuất hiện ngay: dùng vòng lặp `sleep 10` để quan sát. Nhóm L1 hoàn thành checklist sau phần này.

### Slide 15: Lab phần 5 – rollout để nhận biến mới

`club-api` không dùng biến `LOG_LEVEL`; bài chỉ dùng để quan sát cơ chế nạp. Nhấn: readiness chặn Pod chưa sẵn sàng nhận traffic trong lúc rollout.

### Slide 16: Phá lỗi – DB_HOST sai

Cho lớp 5 phút tự điều tra theo năm bước (`get pods`, `describe`, `logs`, `printenv`, đọc ConfigMap). Sửa bằng patch `DB_HOST` về `postgres` rồi `rollout restart`. Liên quan scenario-03 và scenario-10 trong `examples/troubleshooting`.

### Slide 17: Lỗi thường gặp

Nhấn dòng cuối: xoá file ở commit sau không đủ vì lịch sử Git vẫn còn bản cũ; coi mật khẩu đã lộ. Kiểm tra trước khi push bằng `git grep -n -i -E "stringData|kind: Secret"`.

### Slide 18: Thử thách nâng cao

Gợi ý: biến môi trường dễ lọt vào log hoặc crash dump, còn file mount chỉ lộ cho tiến trình có quyền đọc. Dọn bằng `kubectl delete pod config-demo config-demo2 secret-demo -n club --ignore-not-found`; giữ `club-api` và `postgres` cho buổi 26.

### Slide 19: Recap

Cho học viên tự trả lời 3 câu: vì sao tách cấu hình, vì sao base64 không an toàn, khi Pod mới `0/1` thì kiểm tra gì đầu tiên. Nhắc nộp `report.md` phân tích lỗi `DB_HOST` và không đưa mật khẩu thật vào repo.


## Lưu ý riêng cho người dạy

- Bài học viên đã đổi để không làm mất trạng thái các buổi sau: Phần 1–3 và 5 làm trên namespace `club` (giữ nguyên `club-api` và `postgres`), còn Pod và ConfigMap thử nghiệm của Phần 4 nằm ở namespace riêng `lab25`. Bài cũ có bước `kubectl delete namespace club`; bước đó đã bỏ. Nếu học viên vẫn xóa nhầm `club`, cách khôi phục là dựng lại theo `starter-project/k8s/` (namespace, configmap, secret, postgres, backend, frontend).
- Demo ở trên tạo `app-settings` trong namespace `club` để không phụ thuộc starter-project. Sau demo dọn thêm `kubectl delete configmap app-settings -n club` (lệnh dọn gốc chỉ xóa `demo-secret`), để không lẫn với phần lab của học viên ở namespace `lab25`.
- Secret `club-secrets` có thể đã được tạo từ buổi 22. Mật khẩu PostgreSQL chỉ được đọc lần đầu khi khởi tạo thư mục dữ liệu, nên học viên không được đổi mật khẩu trong Secret nếu PVC cũ còn dữ liệu: bài lab hướng dẫn kiểm tra Secret có sẵn trước khi tạo.
- Môi trường thống nhất: cluster kind `club`, context `kind-club`. Các bản demo và bài lab cũ ghi `kind-kind` hoặc `--name kind`; hãy sửa miệng nếu học viên còn cluster cũ.
- Khi phá `DB_HOST` (Phần 5), log của Pod mới "sạch" vì handler `/ready` của starter-project nuốt lỗi; cho lớp tự phát hiện rồi mới gợi ý gọi `/api/members` để thấy `ENOTFOUND`.
