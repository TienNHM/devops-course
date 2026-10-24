# Buổi 25 – Thử thách nâng cao

Tuần 13/16 · Giai đoạn 4 – Kubernetes Engineering · Buổi 25/32

[Bài học chính](session-25.md) · [Slide](../../slides/06-kubectl/session-25.md) · [Bài tập tuần](../../assignments/weekly/week-13.md) · [Hub tuần](README.md)

> **Tóm tắt:** Trang phụ của buổi 25: kiến thức tìm hiểu thêm về ConfigMap và Secret, bài thêm rollout restart, hai thử thách L2 và phá lỗi nâng cao. Tất cả đều tùy chọn, làm sau khi xong lab bắt buộc.

::: tip Trang này dành cho ai
Bạn đã xong checklist L1 của [Buổi 25 – Configuration Management](session-25.md) và còn thời gian. Các thử thách làm ở nhà. Mỗi thử thách có gợi ý theo bậc: hãy tự thử ít nhất 15 phút trước khi mở bậc 1, và thêm 15 phút nữa trước khi mở bậc 2. Lời giải đối chiếu (có đủ manifest) nằm trong [Walkthrough tuần 13](../../mentors/walkthroughs/week-13.md), chỉ mở sau khi nộp bài.
:::

## Tìm hiểu thêm {#tim-hieu-them}

So sánh ConfigMap và Secret:

| Tiêu chí | ConfigMap | Secret |
| --- | --- | --- |
| Dữ liệu lưu | Chuỗi UTF-8 trong `data` (nhị phân trong `binaryData`) | base64 trong `data`; `stringData` cho phép viết chuỗi thường |
| Kích thước tối đa | 1 MiB | 1 MiB |
| `kubectl describe` | Hiện giá trị | Chỉ hiện tên key và số byte |
| Mã hóa trong etcd | Không | Mặc định không (cần bật encryption at rest) |
| Mount thành volume | Lưu trên đĩa của node | Lưu trên tmpfs (RAM) của node |

Ba cách nạp cấu hình và hành vi khi nguồn đổi:

| Cách | Cú pháp rút gọn | Khi nào dùng | Cập nhật khi ConfigMap đổi |
| --- | --- | --- | --- |
| Một biến | `env` + `configMapKeyRef` hoặc `secretKeyRef` | Chọn từng key, đổi tên biến | Không, cần restart Pod |
| Cả bộ key | `envFrom` + `configMapRef` | Nhiều biến cùng nhóm (như `DB_*`) | Không, cần restart Pod |
| File mount | `volumes.configMap` + `volumeMounts` | File cấu hình (nginx.conf, app.properties) | Có, kubelet đồng bộ sau tối đa khoảng 1–2 phút |

Cấu hình của `club-api` đọc từ `process.env` trong `starter-project/backend/db.js`:

| Biến | Nguồn trong Kubernetes | Giá trị |
| --- | --- | --- |
| `DB_HOST` | ConfigMap `club-config` | `postgres` (tên Service) |
| `DB_PORT` | ConfigMap `club-config` | `5432` |
| `DB_NAME` | ConfigMap `club-config` | `clubdb` |
| `DB_USER` | ConfigMap `club-config` | `club` |
| `DB_PASSWORD` | Secret `club-secrets`, key `db-password` | Bạn tự tạo, không commit |
| `PORT` | Viết thẳng trong Deployment | `3000` |

Khi bạn `kubectl apply` Deployment `club-api`:

1. API Server lưu ConfigMap, Secret và Deployment vào etcd. Secret nằm trong etcd dưới dạng base64 (hoặc đã mã hóa nếu admin bật).
2. Scheduler gán Pod vào node. Kubelet trên node đọc spec của Pod.
3. Với `envFrom` và `secretKeyRef`, kubelet lấy giá trị từ API Server rồi truyền vào container thành biến môi trường lúc tạo container. Nếu ConfigMap hoặc Secret không tồn tại, Pod dừng ở trạng thái `CreateContainerConfigError`.
4. Với volume mount, kubelet ghi các key thành file trong thư mục tạm của Pod rồi mount vào container. Định kỳ kubelet kiểm tra và cập nhật file khi nguồn thay đổi (cơ chế symlink `..data` đổi nguyên tử).
5. Ứng dụng Node.js đọc `process.env` đúng một lần khi tạo `pg.Pool`, vì vậy sau khi biến đổi bạn vẫn phải khởi động lại tiến trình.

Hai ngoại lệ cần nhớ: volume mount dùng `subPath` không bao giờ được cập nhật tự động, và ConfigMap hoặc Secret đánh dấu `immutable: true` không thể sửa (phải tạo bản mới và đổi tên tham chiếu). Lưu ý: giá trị trong ConfigMap luôn là chuỗi, nên `DB_PORT: "5432"` phải có dấu nháy, nếu không YAML hiểu là số và `kubectl apply` báo lỗi.

## Bài thêm: rollout restart cho Deployment {#rollout-restart}

Bài này cho thấy biến môi trường của một Deployment chỉ đổi sau khi rollout. Làm trên namespace `club`, mất khoảng 5 phút. Dùng biến `LOG_LEVEL` chỉ để quan sát cơ chế nạp (`club-api` không đọc biến này).

```bash
kubectl patch configmap club-config -n club --type merge -p '{"data":{"LOG_LEVEL":"debug"}}'
kubectl exec -n club deploy/club-api -- printenv LOG_LEVEL
kubectl rollout restart deployment/club-api -n club
kubectl rollout status deployment/club-api -n club --timeout=120s
kubectl exec -n club deploy/club-api -- printenv LOG_LEVEL
```

Kết quả mong đợi:

```text
command terminated with exit code 1
deployment.apps/club-api restarted
deployment "club-api" successfully rolled out
debug
```

Lệnh `printenv` đầu không in gì (và `kubectl` báo exit code 1) vì Pod cũ chưa khởi động lại. `rollout restart` tạo ReplicaSet mới; Pod mới chạy từng cái một nên API không bị gián đoạn, vì readiness chặn Pod chưa sẵn sàng nhận traffic. Dọn dẹp để `club-config` về như cũ:

```bash
kubectl patch configmap club-config -n club --type merge -p '{"data":{"LOG_LEVEL":null}}'
kubectl rollout restart deployment/club-api -n club
kubectl rollout status deployment/club-api -n club --timeout=120s
```

## Thử thách L2 {#thu-thach-l2}

Nếu bạn đã xóa namespace `lab25` ở cuối bài chính, tạo lại bằng `kubectl create namespace lab25`.

### Thử thách A – Mount một file mà không che thư mục (khoảng 10 phút)

Tạo file `source/app.properties` với nội dung `club.name=HCMUTE DSC` và `feature.members=true`. Tạo ConfigMap `app-config` trong `lab25` từ file đó bằng `--from-file`, rồi mount vào Pod `config-demo2` (busybox:1.36) tại `/etc/club/app.properties` mà không che mất các file khác trong `/etc/club`. Sau đó sửa ConfigMap và đo bao lâu thì file trong Pod đổi.

Tiêu chí hoàn thành: `cat /etc/club/app.properties` trong Pod hiển thị nội dung từ ConfigMap; bạn giải thích được vì sao cần `subPath` để mount một file vào thư mục đã có file khác, và vì sao dùng `subPath` thì file không tự cập nhật.

::: details Gợi ý bậc 1 (chỉ mở sau 15 phút tự thử)
Tạo ConfigMap bằng `kubectl create configmap app-config -n lab25 --from-file=app.properties=source/app.properties`. Mount thông thường thay cả thư mục đích bằng volume, nên cần một cách để chỉ chèn đúng một file. So sánh kết quả với Pod ở Phần 4 (không dùng `subPath`).
:::

::: details Gợi ý bậc 2 (chỉ mở sau 15 phút nữa)
Trong `volumeMounts`, ngoài `name`, đặt `mountPath: /etc/club/app.properties` và `subPath: app.properties`. Để có sẵn file khác trong `/etc/club`, tạo nó bằng `command` của container (ví dụ `sh -c "echo x > /etc/club/other.txt; sleep 3600"`) rồi kiểm tra bằng `kubectl exec` rằng cả hai file cùng tồn tại.
:::

### Thử thách B – Secret dạng volume và quyền truy cập (khoảng 10 phút)

Mount `club-secrets` vào Pod busybox `secret-demo` (namespace `club`) tại `/etc/secrets` với quyền `0400`. Chứng minh Pod đọc được file `db-password`, và giải thích vì sao cách mount này thường được ưu tiên hơn biến môi trường (biến môi trường dễ lọt vào log hoặc crash dump khi ứng dụng in toàn bộ `env`, được mọi tiến trình con kế thừa, và đọc được qua `/proc/PID/environ`; file mount chỉ lộ cho tiến trình có quyền đọc file).

Tiêu chí hoàn thành: `ls -lL /etc/secrets` cho thấy quyền chỉ đọc cho chủ sở hữu (`-r--------`; `-L` để theo symlink tới file thật), và bạn nêu được ít nhất hai cách thực tế để bảo vệ Secret tốt hơn base64 (RBAC chặt, encryption at rest, Sealed Secrets hoặc External Secrets).

::: details Gợi ý bậc 1 (chỉ mở sau 15 phút tự thử)
Dùng `volumes` loại `secret` thay vì `configMap`, với `secretName: club-secrets`. Có một trường ở cấp volume để đặt quyền mặc định cho các file.
:::

::: details Gợi ý bậc 2 (chỉ mở sau 15 phút nữa)
Trường đó là `defaultMode`. Trong YAML, `0400` là số bát phân nên viết `defaultMode: 0400` (không đặt trong dấu nháy). Dùng `ls -lL /etc/secrets` để theo symlink và xem quyền của file thật.
:::

Dọn dẹp sau khi xong (giữ lại `club-api` và `postgres` cho buổi 26):

```bash
kubectl delete pod secret-demo -n club --ignore-not-found
kubectl delete namespace lab25 --ignore-not-found
```

## Phá lỗi nâng cao {#pha-loi-nang-cao}

Tình huống: Pod tham chiếu một Secret không tồn tại. Làm trong namespace `lab25` (không đụng tới `club`).

1. Tạo Pod busybox `broken-secret` có `env` lấy giá trị từ `secretKeyRef` tên `khong-ton-tai`, key `token`.
2. Chạy `kubectl get pods -n lab25` và `kubectl describe pod broken-secret -n lab25`: Pod dừng ở `CreateContainerConfigError`, Events ghi `secret "khong-ton-tai" not found`.
3. Tạo Secret đúng tên (`kubectl create secret generic khong-ton-tai -n lab25 --from-literal=token=abc`) và quan sát Pod tự khởi động.

Các tình huống liên quan nằm ở `examples/troubleshooting/`: scenario-03 (API không kết nối được DB) và scenario-10 (readiness probe, dùng ở [Buổi 26 – Resource & Health](session-26.md)).

## Câu hỏi tình huống

1. Ứng dụng của bạn đọc file cấu hình một lần lúc khởi động và bạn mount ConfigMap thành volume. Khi sửa ConfigMap, bạn cần làm gì để ứng dụng thấy giá trị mới?
2. Vì sao một ConfigMap `immutable: true` lại có ích trên cụm lớn, dù mỗi lần đổi phải tạo ConfigMap mới?

## Tài liệu tham khảo

- [ConfigMaps – Kubernetes](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Secrets – Kubernetes](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)
- [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
- [The Twelve-Factor App – Config](https://12factor.net/config)
