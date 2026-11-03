# Slide buổi 25 – Configuration Management

> **Tóm tắt:** Tách cấu hình khỏi image bằng ConfigMap và Secret, nạp qua biến môi trường hoặc file mount, và hiểu khi nào Pod thấy giá trị mới. Bài lab đầy đủ: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: tách cấu hình, nạp vào Pod, hiểu giới hạn](/slides/img/s25-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: chọn ConfigMap hay Secret; nạp bằng `env`, `envFrom`, volume mount để `club-api` kết nối PostgreSQL; chứng minh base64 chỉ là encoding; dự đoán hành vi cập nhật; chẩn đoán lỗi cấu hình từ `describe`, `logs` và readiness.
:::

---

## Slide 2: Mật khẩu nằm trong image?

![So sánh viết cứng vào image với một image dùng nhiều cấu hình](/slides/img/s25-in-image.svg)

::: details Ghi chú cho mentor
- CLB có nhiều môi trường: máy thành viên, máy demo của mentor, cụm dùng chung sau này. Mỗi nơi cần `DB_HOST` và mật khẩu database khác nhau.
- Viết cứng vào image: phải build lại cho mỗi môi trường, và ai pull được image đều đọc được mật khẩu trong layer.
- Nguyên tắc Twelve-Factor: cùng một image, nhiều cấu hình.
:::

---

## Slide 3: ConfigMap và Secret

![So sánh ConfigMap và Secret theo mục đích, describe, etcd, mount](/slides/img/s25-cm-vs-secret.svg)

::: details Ghi chú cho mentor
- ConfigMap lưu chuỗi trong `data`. Secret lưu base64 trong `data`; `stringData` cho chuỗi thường.
- Giới hạn kích thước của cả hai là 1 MiB.
- Hỏi: Secret có an toàn hơn ConfigMap bao nhiêu? (xem slide tiếp theo)
:::

---

## Slide 4: Base64 không phải bảo mật

![describe ẩn giá trị Secret nhưng get cộng base64 -d lộ mật khẩu](/slides/img/s25-base64.svg)

::: details Ghi chú cho mentor
- Ai có quyền `get secret` đều giải mã được bằng một lệnh `base64 -d`.
- Không bao giờ commit manifest Secret chứa giá trị thật; chỉ commit `secret.example.yaml` với giá trị giả.
- Tạo Secret bằng `echo` mà thiếu `-n` sẽ dính dấu xuống dòng thừa vào mật khẩu.
- Dán YAML Secret lên kênh chat là lộ mật khẩu cho mọi người trong kênh.
:::

---

## Slide 5: Ba cách đưa cấu hình vào container

![env, envFrom, volume và hành vi khi ConfigMap đổi](/slides/img/s25-inject-ways.svg)

::: details Ghi chú cho mentor
- `env` với `configMapKeyRef` hoặc `secretKeyRef`: chọn từng key, đổi tên biến.
- `envFrom` với `configMapRef`: cả bộ key như `DB_*`.
- Volume mount: file cấu hình, kubelet đồng bộ có độ trễ. Ngoại lệ: `subPath` không bao giờ tự cập nhật.
- ConfigMap hoặc Secret `immutable: true` không thể sửa.
:::

---

## Slide 6: Cấu hình của club-api

![ConfigMap club-config và Secret club-secrets đi vào Pod club-api và postgres](/slides/img/s25-config-flow.svg)

::: details Ghi chú cho mentor
- Bốn biến từ ConfigMap `club-config`: `DB_HOST=postgres`, `DB_PORT=5432`, `DB_NAME=clubdb`, `DB_USER=club`. `DB_PASSWORD` từ Secret `club-secrets`, key `db-password` (bạn tự tạo).
- Giá trị ConfigMap luôn là chuỗi: viết `DB_PORT: "5432"` có nháy. Thiếu nháy, `kubectl apply` báo lỗi unmarshal number.
- Cùng một Secret phục vụ cả API và Postgres.
:::

---

## Slide 7: Khi nào Pod thấy giá trị mới

![Biến env không đổi, file mount đổi có trễ, subPath không đổi cho tới khi restart](/slides/img/s25-update-timeline.svg)

::: details Ghi chú cho mentor
- Biến môi trường chốt lúc container start; file mount được kubelet đồng bộ định kỳ.
- Thiếu ConfigMap hoặc Secret: Pod dừng ở `CreateContainerConfigError`.
- Ứng dụng Node.js đọc `process.env` một lần khi tạo `pg.Pool`, nên vẫn phải khởi động lại tiến trình.
- Hàng subPath là nội dung thử thách nâng cao, không nằm trong lab chính.
:::

---

## Slide 8: Demo: tạo, đọc, giải mã

```bash
kubectl apply -f source/k8s/configmap.yaml
kubectl get configmap club-config -n club -o yaml
kubectl describe secret club-secrets -n club
kubectl get secret club-secrets -n club -o jsonpath='{.data.db-password}' | base64 -d; echo
```

Dự đoán trước khi chạy: dòng cuối in ra gì?

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: dán YAML này lên chat thì ai thấy mật khẩu? Đổi ConfigMap xong thì biến và file có đổi không?
- Lệnh tạo Secret trong lab: `kubectl create secret generic club-secrets -n club --from-literal=db-password="$DB_PASS"`.
- Người hướng dẫn chạy trực tiếp trên cluster; học viên quan sát và ghi lại dự đoán.
:::

---

## Slide 9: Lab: năm phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 và 2 | ConfigMap bằng manifest, Secret bằng lệnh | Tự giải mã được |
| 3 | Chạy Postgres và `club-api` | `/ready` trả `ready` |
| 4 | File mount ở namespace `lab25` | File đổi, biến không đổi |
| 5 | Làm sai `DB_HOST` | Chẩn đoán đúng |

Lệnh và kết quả: [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md#hands-on-lab).

---

## Slide 10: Phá lỗi: DB_HOST sai

![ConfigMap sai DB_HOST làm Pod mới 0/1 còn Pod cũ vẫn phục vụ](/slides/img/s25-readiness-fail.svg)

::: details Ghi chú cho mentor
- Triệu chứng: Pod mới `Running` nhưng `0/1`, hai Pod cũ vẫn `1/1`. Container sống, readiness probe đang fail: không phải lỗi image.
- Cách phá trong lab: `kubectl patch configmap club-config ... DB_HOST=postgres-db` rồi `rollout restart`.
- Hai Pod cũ vẫn phục vụ nhờ rolling update chặn Pod chưa Ready.
:::

---

## Slide 11: Điều tra từ ngoài vào trong

![Năm bước: get pods, describe, logs hoặc exec, printenv, đọc ConfigMap](/slides/img/s25-investigate.svg)

::: details Ghi chú cho mentor
- Events: `Readiness probe failed: HTTP probe failed with statuscode: 503`.
- `logs` có `getaddrinfo ENOTFOUND postgres-db` chỉ sau khi gọi `/api/members`; trước đó log chỉ có `API listening on port 3000` vì handler `/ready` nuốt lỗi.
- Log "sạch" không có nghĩa app khỏe: lỗi chỉ hiện khi có request chạm database.
- Khôi phục: patch `DB_HOST` về `postgres`, `rollout restart`, `rollout status`, rồi `curl /ready`.
:::

---

## Slide 12: Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Xử lý |
| --- | --- | --- |
| `CreateContainerConfigError` | Secret hoặc key không có | Tạo lại đúng namespace, đúng key |
| App dùng giá trị cũ | Env chốt lúc start | `rollout restart deployment/ten` |
| File mount không đổi | Có `subPath` hoặc `immutable` | Mount cả thư mục |
| Đăng nhập lỗi, mật khẩu đúng | Secret có xuống dòng thừa | `echo -n` hoặc `--from-literal` |

::: details Ghi chú cho mentor
- `secret "club-secrets" not found`: tạo lại Secret đúng namespace. `couldn't find key db-password`: tạo lại với `--from-literal=db-password=...`.
- Mật khẩu lỡ commit lên Git: đổi mật khẩu ngay, rồi mới dọn lịch sử.
:::

---

## Slide 13: Thử thách nâng cao

- A: mount một file bằng `subPath`, giải thích vì sao không tự cập nhật.
- B: mount Secret thành volume quyền `0400`, nêu hai cách bảo vệ tốt hơn base64.

Chi tiết: [Buổi 25 – Thử thách nâng cao](../../labs/week-13/session-25-challenge.md).

::: details Ghi chú cho mentor
- Gợi ý cho B: RBAC chặt, encryption at rest, Sealed Secrets, External Secrets.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: cấu hình tách rời, base64 không bảo mật, đổi env cần restart](/slides/img/s25-recap.svg)

::: details Ghi chú cho mentor
- Volume mount được đồng bộ (có độ trễ), `subPath` thì không, và ứng dụng phải tự đọc lại file.
- Thiếu ConfigMap hoặc Secret gây `CreateContainerConfigError`; giá trị sai lộ ra qua readiness và Events.
:::

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/): cách tách cấu hình khỏi image.
- **Tài liệu chính thức:** [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/): lưu dữ liệu nhạy cảm như mật khẩu.
- **Best practice:** [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/): giữ Secret an toàn hơn.
- **Best practice:** [Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/): viết file YAML cấu hình gọn và đúng.
- **Best practice:** [The Twelve-Factor App: Config](https://12factor.net/config): vì sao cấu hình nên nằm trong môi trường.
