# Slide buổi 25 – Configuration Management

> **Tóm tắt:** Buổi học trình bày cách tách cấu hình khỏi image bằng ConfigMap và Secret, nạp cấu hình qua biến môi trường hoặc tệp mount, và xác định thời điểm Pod nhận giá trị mới. Bài lab đầy đủ: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md).

## Mục tiêu của buổi 25

![Ba mục tiêu: tách cấu hình, nạp vào Pod, hiểu giới hạn](/slides/img/s25-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh ba thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: chọn ConfigMap hay Secret; nạp bằng `env`, `envFrom`, volume mount để `club-api` kết nối PostgreSQL; chứng minh base64 chỉ là encoding; dự đoán hành vi cập nhật; chẩn đoán lỗi cấu hình từ `describe`, `logs` và readiness.
:::

---

## Vấn đề: mật khẩu nằm trong image

![So sánh viết cứng vào image với một image dùng nhiều cấu hình](/slides/img/s25-in-image.svg)

::: details Ghi chú cho mentor
- CLB có nhiều môi trường: máy thành viên, máy demo của mentor, cụm dùng chung sau này. Mỗi nơi cần `DB_HOST` và mật khẩu database khác nhau.
- Nếu viết cứng vào image: phải build lại cho mỗi môi trường, và bất kỳ ai pull được image đều đọc được mật khẩu trong layer.
- Nguyên tắc Twelve-Factor: một image, nhiều cấu hình.
:::

---

## Khái niệm: ConfigMap

![ConfigMap club-config nạp biến môi trường vào Pod club-api](/slides/img/s25-k-configmap.svg)

- **ConfigMap** là object lưu dữ liệu cấu hình không bí mật dưới dạng cặp khóa-giá trị, tách rời khỏi image của ứng dụng.
- Ví dụ trong dự án: ConfigMap `club-config` chứa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`.

::: details Ghi chú cho mentor
- Nhờ ConfigMap, cùng một image chạy được ở nhiều môi trường với cấu hình khác nhau mà không cần build lại.
:::

---

## Khái niệm: Secret

![So sánh ConfigMap và Secret theo mục đích, describe, etcd, mount](/slides/img/s25-cm-vs-secret.svg)

- **Secret** là object lưu lượng nhỏ dữ liệu nhạy cảm như mật khẩu hoặc token; `data` mã hóa base64, `stringData` nhận chuỗi thường.
- Ví dụ trong dự án: Secret `club-secrets` giữ mật khẩu database ở key `db-password`.

::: details Ghi chú cho mentor
- ConfigMap lưu chuỗi trong `data`. Secret lưu base64 trong `data`; `stringData` dùng cho chuỗi thường.
- Giới hạn kích thước của cả hai là 1 MiB.
- Câu hỏi thảo luận: Secret an toàn hơn ConfigMap ở mức nào? (xem slide tiếp theo)
:::

---

## Base64 không phải là bảo mật

![describe ẩn giá trị Secret nhưng get cộng base64 -d lộ mật khẩu](/slides/img/s25-base64.svg)

::: details Ghi chú cho mentor
- Người có quyền `get secret` đều giải mã được bằng một lệnh `base64 -d`.
- Không commit manifest Secret chứa giá trị thật; chỉ commit `secret.example.yaml` với giá trị giả.
- Tạo Secret bằng `echo` mà thiếu `-n` làm dấu xuống dòng thừa dính vào mật khẩu.
- Dán YAML Secret lên kênh chat sẽ làm lộ mật khẩu cho mọi người trong kênh.
:::

---

## Ba cách đưa cấu hình vào container

![env, envFrom, volume và hành vi khi ConfigMap đổi](/slides/img/s25-inject-ways.svg)

::: details Ghi chú cho mentor
- `env` với `configMapKeyRef` hoặc `secretKeyRef`: chọn từng key và có thể đổi tên biến.
- `envFrom` với `configMapRef`: nạp cả bộ key như `DB_*`.
- Volume mount: tệp cấu hình, kubelet đồng bộ có độ trễ. Ngoại lệ: `subPath` không bao giờ tự cập nhật.
- ConfigMap hoặc Secret đặt `immutable: true` thì không thể sửa.
:::

---

## Cấu hình của club-api

![ConfigMap club-config và Secret club-secrets đi vào Pod club-api và postgres](/slides/img/s25-config-flow.svg)

::: details Ghi chú cho mentor
- Bốn biến lấy từ ConfigMap `club-config`: `DB_HOST=postgres`, `DB_PORT=5432`, `DB_NAME=clubdb`, `DB_USER=club`. `DB_PASSWORD` lấy từ Secret `club-secrets`, key `db-password` (người học tự tạo).
- Giá trị trong ConfigMap luôn là chuỗi: viết `DB_PORT: "5432"` có dấu nháy. Nếu thiếu dấu nháy, `kubectl apply` báo lỗi unmarshal number.
- Cùng một Secret phục vụ cả API và Postgres.
:::

---

## Khi nào Pod nhận giá trị mới

![Biến env không đổi, file mount đổi có trễ, subPath không đổi cho tới khi restart](/slides/img/s25-update-timeline.svg)

::: details Ghi chú cho mentor
- Biến môi trường được chốt lúc container khởi động; tệp mount được kubelet đồng bộ định kỳ.
- Khi thiếu ConfigMap hoặc Secret, Pod dừng ở trạng thái `CreateContainerConfigError`.
- Ứng dụng Node.js đọc `process.env` một lần khi tạo `pg.Pool`, nên vẫn phải khởi động lại tiến trình.
- Dòng subPath thuộc nội dung thử thách nâng cao, không nằm trong lab chính.
:::

---

## Minh họa: tạo, đọc, giải mã

```bash
kubectl apply -f source/k8s/configmap.yaml
kubectl get configmap club-config -n club -o yaml
kubectl describe secret club-secrets -n club
kubectl get secret club-secrets -n club -o jsonpath='{.data.db-password}' | base64 -d; echo
```

Dự đoán trước khi chạy: dòng cuối in ra nội dung gì.

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: nếu dán YAML này lên chat thì ai thấy mật khẩu? Sau khi đổi ConfigMap, biến môi trường và tệp có thay đổi không?
- Lệnh tạo Secret trong lab: `kubectl create secret generic club-secrets -n club --from-literal=db-password="$DB_PASS"`.
- Người hướng dẫn chạy trực tiếp trên cluster; người học quan sát và ghi lại dự đoán.
:::

---

## Lab: năm phần trong 60 phút

| Phần | Việc làm | Mốc hoàn thành |
| --- | --- | --- |
| 1-2 | ConfigMap, Secret | Giải mã được |
| 3 | Chạy `club-api` | `/ready` ổn |
| 4-5 | Mount; sai `DB_HOST` | Chẩn đoán |

Lệnh: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md#hands-on-lab).

::: details Ghi chú cho mentor
- Phần 1 và 2: tạo ConfigMap bằng manifest, tạo Secret bằng lệnh; mốc hoàn thành là người học tự giải mã được Secret.
- Phần 4: mount file ở namespace `lab25`; mốc hoàn thành là file đổi còn biến môi trường không đổi.
- Phần 5: cố ý làm sai `DB_HOST`; mốc hoàn thành là chẩn đoán đúng nguyên nhân.
:::

---

## Khái niệm: Readiness probe

![Pod trả 503 ở /ready bị loại khỏi traffic của Service](/slides/img/s25-k-readiness-probe.svg)

- **Readiness probe** là kiểm tra định kỳ do kubelet thực hiện để xác định container đã sẵn sàng nhận traffic hay chưa.
- Ví dụ trong dự án: endpoint `/ready` của `club-api` trả `503` khi API không kết nối được PostgreSQL.

::: details Ghi chú cho mentor
- Pod không đạt readiness vẫn chạy nhưng bị loại khỏi Endpoints của Service, và rolling update không coi Pod đó là sẵn sàng.
:::

---

## Phá lỗi: DB_HOST sai

![ConfigMap sai DB_HOST làm Pod mới 0/1 còn Pod cũ vẫn phục vụ](/slides/img/s25-readiness-fail.svg)

::: details Ghi chú cho mentor
- Triệu chứng: Pod mới `Running` nhưng `0/1`, hai Pod cũ vẫn `1/1`. Container còn sống, readiness probe đang thất bại: nguyên nhân không nằm ở image.
- Cách tạo lỗi trong lab: `kubectl patch configmap club-config ... DB_HOST=postgres-db` rồi `rollout restart`.
- Hai Pod cũ vẫn phục vụ vì rolling update không chuyển sang Pod chưa Ready.
:::

---

## Điều tra từ ngoài vào trong

![Năm bước: get pods, describe, logs hoặc exec, printenv, đọc ConfigMap](/slides/img/s25-investigate.svg)

::: details Ghi chú cho mentor
- Events: `Readiness probe failed: HTTP probe failed with statuscode: 503`.
- `logs` chỉ có `getaddrinfo ENOTFOUND postgres-db` sau khi gọi `/api/members`; trước đó log chỉ có `API listening on port 3000` vì handler `/ready` bắt và bỏ qua lỗi.
- Log "sạch" không có nghĩa ứng dụng hoạt động tốt: lỗi chỉ hiện khi có request chạm tới database.
- Khôi phục: patch `DB_HOST` về `postgres`, `rollout restart`, `rollout status`, rồi `curl /ready`.
:::

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `CreateContainerConfigError` | Thiếu Secret | Tạo lại |
| Env cũ | Chốt | `rollout restart` |
| File cũ | `subPath` | Bỏ `subPath` |
| Sai mật khẩu | Xuống dòng | `echo -n` |

::: details Ghi chú cho mentor
- Cách sửa file mount không đổi: mount cả thư mục thay vì `subPath`.
- Nguyên nhân: Secret hoặc key không tồn tại; env được chốt lúc start; file mount có `subPath` hoặc `immutable`; Secret có xuống dòng thừa.
- Xử lý đầy đủ: tạo lại Secret đúng namespace và đúng key; dùng `rollout restart deployment/ten` khi ứng dụng giữ giá trị env cũ.
- Ứng dụng đăng nhập lỗi dù mật khẩu đúng: Secret có ký tự xuống dòng thừa; tạo lại bằng `echo -n` hoặc `--from-literal`.
- `secret "club-secrets" not found`: tạo lại Secret đúng namespace. `couldn't find key db-password`: tạo lại với `--from-literal=db-password=...`.
- Khi mật khẩu đã bị commit lên Git: đổi mật khẩu ngay, sau đó mới dọn lịch sử.
:::

---

## Thử thách nâng cao

- A: mount một tệp bằng `subPath`, giải thích vì sao tệp không tự cập nhật.
- B: mount Secret thành volume với quyền `0400`, nêu hai cách bảo vệ tốt hơn base64.

Chi tiết: [Buổi 25 – Thử thách nâng cao](../../labs/week-13/session-25-challenge.md).

::: details Ghi chú cho mentor
- Gợi ý cho B: RBAC chặt, encryption at rest, Sealed Secrets, External Secrets.
:::

---

## Tổng kết

![Ba điều cần nhớ: cấu hình tách rời, base64 không bảo mật, đổi env cần restart](/slides/img/s25-recap.svg)

::: details Ghi chú cho mentor
- Volume mount được đồng bộ (có độ trễ), `subPath` thì không, và ứng dụng phải tự đọc lại tệp.
- Thiếu ConfigMap hoặc Secret gây `CreateContainerConfigError`; giá trị sai được phát hiện qua readiness và Events.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/): cách tách cấu hình khỏi image.
- **Tài liệu chính thức:** [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/): lưu dữ liệu nhạy cảm như mật khẩu.
- **Best practice:** [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/): giữ Secret an toàn hơn.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): viết file YAML cấu hình gọn và đúng.
- **Best practice:** [The Twelve-Factor App: Config](https://12factor.net/config): vì sao cấu hình nên nằm trong môi trường.
