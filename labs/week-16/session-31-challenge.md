# Buổi 31 – Thử thách nâng cao

Tuần 16/16 · Giai đoạn 5 – Capstone Project · Buổi 31/32

[Bài lab chính](session-31.md) · [Slide](../../slides/08-capstone/session-31.md) · [Bài tập tuần](../../assignments/weekly/week-16.md) · [Hub tuần](README.md)

> **Tóm tắt:** Phần đọc thêm và làm thêm của buổi 31: tham khảo mở rộng về kiểm thử, thử thách L2 ra đề failure injection cho nhóm khác, và tình huống DB_HOST sai chính tả để luyện chẩn đoán.

::: tip Trang này dành cho bạn khi
Bạn đã xong phần bắt buộc (L1) của [Buổi 31 – Testing & Troubleshooting](session-31.md) và muốn đọc sâu hơn hoặc làm thêm ở nhà. Không có gì ở đây là bắt buộc để nộp bài L1.
:::

## Tham khảo mở rộng

### Các tầng kiểm thử

| Tầng | Câu hỏi | Công cụ trong dự án | Chạy khi nào |
| --- | --- | --- | --- |
| Unit test | Hàm/route có đúng logic? | `npm test` (node:test) | Mỗi commit, trong CI |
| Build test | Image có build được từ đầu? | `docker build`, `docker compose build` | Mỗi PR |
| Deployment test | Stack có lên và trả lời đúng? | `docker compose up`, `kubectl apply`, `curl` | Trước mỗi mốc |
| Smoke test | Các đường quan trọng còn sống? | `curl /health /ready /api/members` | Sau mỗi deploy |
| Failure injection | Khi hỏng thì hệ thống phản ứng thế nào? | `kubectl delete pod`, sai tag, sai secret | Có kế hoạch, trong môi trường test |
| Clean-machine test | Người khác làm lại được không? | Clone mới, làm theo README | Trước demo |

Happy path chỉ là một dòng trong bảng này. Phần lớn lỗi thật nằm ở các dòng còn lại.

### Checklist bảo mật tối thiểu

| Hạng mục | Cách kiểm tra |
| --- | --- |
| Không secret trong Git | `git ls-files` không chứa `.env`; `git log -p` không chứa mật khẩu thật |
| Container không chạy root | `docker run --rm club-api:1.0.0 id` không in `uid=0` |
| Image được quét | Trivy hoặc công cụ nhóm chọn, ghi lại số lỗ hổng HIGH/CRITICAL |
| Workflow quyền tối thiểu | Khối `permissions:` ở đầu workflow, chỉ cấp `contents: read` (và `packages: write` cho job publish) |
| Image pin phiên bản | Không dùng `latest` làm tag duy nhất |

### Performance basics

Ở mức capstone, bạn chỉ cần đo ba thứ: thời gian phản hồi một request (`curl -w`), hành vi khi nhiều request liên tiếp, và tác động của số replica. Hai điều cần nhớ: đo trước khi kết luận, và thêm replica chỉ giúp khi nút thắt nằm ở CPU của backend. Nếu nút thắt là PostgreSQL một instance, thêm backend không làm nhanh hơn.

### Sơ đồ kiến trúc, đọc từng bước

1. Tester gửi request qua Ingress (hoặc `port-forward` nếu chưa có Ingress). Ingress chuyển `/api` tới Service `backend` và `/` tới `club-web`.
2. Service `backend` chỉ gửi traffic tới Pod đã qua readiness probe (`GET /ready`). Pod không sẵn sàng bị loại khỏi danh sách endpoint, nên người dùng không nhận lỗi từ Pod đó.
3. Liveness probe (`GET /health`) chỉ trả lời "tiến trình còn sống". Nó không kiểm tra database. Vì vậy mất kết nối DB làm Pod `0/1 Ready` nhưng không restart; đây là thiết kế có chủ đích.
4. Khi bạn tiêm lỗi, Kubernetes phản ứng theo cơ chế của controller: Deployment tạo lại Pod bị xóa, rolling update giữ Pod cũ nếu Pod mới không Ready.
5. Việc của người vận hành là đọc tín hiệu theo thứ tự trạng thái, sự kiện, log, cấu hình, rồi ghi lại.

## Thử thách L2: ra đề failure injection cho nhóm bên cạnh

Thiết kế một failure injection mới cho nhóm bên cạnh, để họ chẩn đoán mà không biết trước nguyên nhân. Tiêu chí hoàn thành:

- [ ] Kịch bản chỉ gây một lỗi, có cách hoàn tác bằng một đến hai lệnh, chỉ chạy trên cluster của nhóm nhận.
- [ ] Triệu chứng quan sát được (không đưa nguyên nhân cho nhóm nhận).
- [ ] Nhóm nhận nộp báo cáo 5 mục (triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, phòng tránh) trong vòng 15 phút.
- [ ] Nhóm ra đề viết nhận xét: báo cáo có đủ bằng chứng không, quy trình chẩn đoán có đi từ ngoài vào trong không.

::: warning Tự thử 15 phút trước khi mở gợi ý
Nghĩ ra kịch bản của riêng bạn và thử chạy trên cluster của nhóm mình trước. Gợi ý chỉ để so sánh.
:::

::: details Gợi ý bậc 1: ý tưởng an toàn
Một số ý tưởng đơn giản và an toàn: đổi `DB_HOST` trong ConfigMap thành `postgress`; đổi `path` của readiness probe thành `/readyy`; đặt memory limit rất thấp để Pod bị `OOMKilled`; đặt `nodeSelector` không tồn tại để Pod `Pending`.
:::

::: details Gợi ý bậc 2: cách hoàn tác
Mỗi ý có cách hoàn tác bằng `kubectl rollout undo` hoặc `kubectl apply -f` lại manifest gốc. Với trường mà manifest gốc không có, như `nodeSelector`, ưu tiên `rollout undo`.
:::

Lời giải mẫu (ví dụ đổi readiness path và các kịch bản khác) nằm ở [Walkthrough tuần 16](../../mentors/walkthroughs/week-16.md); chỉ mở sau khi bạn đã nộp bài.

## Phá lỗi nâng cao: rollout treo mãi

Tình huống: `DB_HOST` trong ConfigMap bị đổi thành `postgress` (thừa một chữ `s`) rồi backend được restart. Nhờ một bạn trong nhóm gây lỗi mà không cho bạn biết, hoặc tự gây lỗi rồi bỏ ghi chú nguyên nhân đi. Cách gây lỗi:

```bash
kubectl patch configmap club-config -n club --type=merge -p '{"data":{"DB_HOST":"postgress"}}'
kubectl rollout restart deployment/club-api -n club
```

Triệu chứng: "Sau khi áp dụng cấu hình mới, `kubectl rollout status` treo mãi, `kubectl get pods` cho thấy một Pod backend mới `0/1` Ready; web vẫn dùng được nhưng nhóm không biết vì sao rollout không xong."

::: warning Tự thử 15 phút trước khi mở hướng điều tra
Dùng quy trình trạng thái, sự kiện, log, cấu hình. Hướng điều tra bên dưới chỉ để đối chiếu.
:::

::: details Hướng điều tra, từng bước
1. `kubectl get pods -n club`: Pod backend mới `Running` nhưng `0/1`, không có restart, hai Pod cũ vẫn `1/1` nên người dùng chưa thấy lỗi. Kết luận: tiến trình sống, readiness fail, nghi vấn đề phụ thuộc (DB).
2. `kubectl describe pod -n club -l app=club-api`: events báo `Readiness probe failed ... statuscode: 503`. Xác nhận `/ready` đang thất bại.
3. Lấy tên Pod mới (`kubectl get pods -n club --sort-by=.metadata.creationTimestamp`), gọi route trực tiếp trong Pod đó bằng `kubectl exec TEN_POD_MOI -n club -- wget -qO- http://localhost:3000/api/members` (báo lỗi 500), rồi `kubectl logs TEN_POD_MOI -n club --tail=20`: có dòng kiểu `getaddrinfo ENOTFOUND postgress` (có thể là `EAI_AGAIN` tùy DNS). Lưu ý `/ready` không in log lỗi, chỉ route `/api/members` mới `console.error`, và request qua Ingress không bao giờ tới Pod chưa Ready, nên phải gọi trực tiếp vào Pod.
4. `kubectl get configmap club-config -n club -o yaml`: thấy `DB_HOST: postgress`, so với tên Service thật bằng `kubectl get svc -n club` (là `postgres`).

Nguyên nhân gốc: tên host trong ConfigMap sai nên DNS trong cluster không phân giải được; không phải lỗi code.

Cách sửa:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl rollout restart deployment/club-api -n club
kubectl rollout status deployment/club-api -n club
```

Cách phòng tránh: giữ cấu hình trong Git và `kubectl apply` từ file thay vì `patch` tay; làm cho `/ready` ghi log lý do thất bại; thêm smoke test sau deploy. Xem thêm các kịch bản tương tự trong `examples/troubleshooting/` (scenario-03: API không kết nối được DB, scenario-10: readiness probe fail).
:::

## Tài liệu tham khảo

- [Kubernetes: Debug Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/)
- [Kubernetes: Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes: Deployments (rollout, rollback)](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [kind: Loading an image into your cluster](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster)
- [Docker Compose: docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/)
- [Trivy documentation](https://trivy.dev/latest/docs/)

Quay lại [Buổi 31 – Testing & Troubleshooting](session-31.md) hoặc sang [Buổi 32 – Final Demo & Review](session-32.md).
