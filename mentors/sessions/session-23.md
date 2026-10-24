# Kịch bản buổi 23 – kubectl Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md) và [Thử thách nâng cao](../../labs/week-12/session-23-challenge.md). Slide: [Slide buổi 23](../../slides/06-kubectl/session-23.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 12](../grading/week-12.md). Đáp án: [Đáp án tuần 12](../walkthroughs/week-12.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 23: khung 120 phút, demo context, namespace và kubectl gọi REST, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc cluster `club` ở tuần 11; hỏi lớp ai đã gõ `kubectl get pods` và thấy "No resources found" |
| 15-45 | Kiến thức và demo | kubeconfig, context, namespace, kubectl chỉ là client, declarative và imperative, demo ba cú nhìn đầu tiên |
| 45-105 | Thực hành | Chuẩn bị 5', Phần 1 (context, namespace) 8', Phần 2 (apply, get, delete) 10', Phần 3 (describe, events, explain) 8', Phần 4 (logs, exec, port-forward) 12', Phần 5 (định dạng đầu ra) 8', Phần 6 (dọn dẹp bằng manifest) 4' |
| 105-120 | Review | Gọi vài bạn nêu 3 sự kiện đầu của Events; chốt recap |

Phần bắt buộc dừng ở Phần 6 và checklist. Thử thách nâng cao và phá lỗi dành cho học viên xong sớm hoặc làm ở nhà; mentor chọn một thử thách để làm chung nếu còn thời gian.

## Kịch bản demo

Mục tiêu (khoảng 10 phút): cho lớp thấy một vòng đời đầy đủ và cái bẫy namespace. Chạy trên cluster `kind-club` giống học viên; chạy `kubectl config current-context` trước để khỏi demo nhầm cluster.

1. Trình chiếu context và namespace:

   ```bash
   kubectl config get-contexts
   kubectl get pods
   kubectl get pods -n club
   ```

   Kết quả mong đợi: lệnh thứ hai báo `No resources found in default namespace.`, lệnh thứ ba liệt kê Pod của `club` (nếu đã có từ buổi 22). Hỏi lớp: "Workload có mất không? Làm sao biết đang đứng ở namespace nào?"

2. Sinh manifest mẫu không cần nhớ cú pháp:

   ```bash
   kubectl create deployment demo --image=nginx:1.27-alpine --replicas=2 --dry-run=client -o yaml
   ```

   Kết quả mong đợi: YAML của một Deployment được in ra, không có gì được tạo trong cluster. Hỏi: "`--dry-run=client` khác `--dry-run=server` thế nào?" (client chỉ dựng object ở máy bạn; server gửi lên API Server để kiểm tra nhưng không lưu).

3. Cho thấy kubectl thực sự gọi REST:

   ```bash
   kubectl get pods -n club -v=6 2>&1 | head -5
   ```

   Kết quả mong đợi: các dòng dạng `GET https://127.0.0.1:xxxxx/api/v1/namespaces/club/pods?limit=500 200 OK`. Hỏi: "Địa chỉ này là gì? Vì sao chạy được trên máy local?"

4. Xóa một Pod đang được Deployment quản lý và quan sát Pod mới xuất hiện (`kubectl delete pod ...` rồi `kubectl get pods -w`). Hỏi: "Ai tạo lại Pod? Nếu xóa Deployment thì sao?"

5. Mở nhanh `kubectl explain deployment.spec.strategy` để cho thấy tài liệu có sẵn trong terminal.

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Có cách nào biết ngay mình đang đứng ở đâu? | `kubectl config current-context` và namespace của context; luôn kiểm tra trước khi apply hoặc delete. |
| Workload có mất khi `get pods` báo "No resources found" không? | Không, bạn đang nhìn namespace `default`; ứng dụng nằm ở `club`. Dùng cờ `-n`. |
| Nếu API Server chết thì Pod đang chạy có chết không? | Không, kubelet vẫn giữ container, nhưng không thể thay đổi gì. |
| Đồng đội `kubectl scale` lên 5, sáng hôm sau số Pod về 2: ai chịu trách nhiệm? | Manifest trong Git là nguồn sự thật; pipeline apply lại nên ghi đè lệnh tay (drift). |
| Ai tạo lại Pod khi xóa Pod do Deployment quản lý? Nếu xóa Deployment thì sao? | ReplicaSet tạo lại; xóa Deployment thì ReplicaSet và Pod bị xóa theo. |
| Vì sao dịch vụ chưa sập khi image sai tag? | Rolling update giữ Pod cũ tới khi Pod mới Ready. |
| Pod không chạy thì xem gì đầu tiên? | `describe` và đọc Events. |

## Ghi chú theo slide

Slide buổi 23 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): đọc nhanh 5 mục tiêu, không giải thích sâu. Hỏi lớp ai đã từng gõ `kubectl get pods` và thấy "No resources found". Cuối buổi quay lại danh sách này để tự đánh giá.
- Slide 2 – Vấn đề thực tế "Pod biến mất" (2 phút): kể như một câu chuyện. Nhấn mạnh kubectl là công cụ dùng hằng ngày, dùng sai ngữ cảnh gây sự cố thật. Hỏi: có cách nào biết ngay mình đang đứng ở đâu?
- Slide 3 – kubeconfig, cluster, user, context (3 phút): vẽ ba hộp rồi một mũi tên "context" nối chúng. Với kind, tên context có dạng `kind-` cộng tên cluster (cluster `club` nên context là `kind-club`). Không bao giờ commit `~/.kube/config` vào Git.
- Slide 4 – Namespace, ranh giới logic (2 phút): chạy hai lệnh trực tiếp; kết quả thứ hai chỉ có nếu đã có workload ở `club`. Hỏi lớp workload có mất không, rồi chỉ ra cờ `-n`.
- Slide 5 – Kiến trúc, kubectl chỉ là client HTTP (3 phút): sơ đồ quan trọng nhất của buổi. Hỏi: nếu API Server chết thì Pod đang chạy có chết không?
- Slide 6 – Chuyện gì xảy ra khi apply (3 phút): giải thích vì sao `get` ngay sau `apply` có thể thấy Pod `ContainerCreating`. `logs` và `exec` đi qua API Server tới kubelet; `port-forward` cũng qua API Server nên không cần Service.
- Slide 7 – Declarative và imperative (2 phút): ví dụ đồng đội `kubectl scale` lên 5 để chịu tải, sáng hôm sau số Pod về 2 vì pipeline apply lại manifest. Hỏi ai chịu trách nhiệm.
- Slide 8 – Demo, ba cú nhìn đầu tiên (khoảng 10 phút theo kịch bản demo ở trên): nếu cluster chưa chạy, lệnh đầu báo lỗi kết nối; dùng `kind get clusters` và kiểm tra Docker Desktop.
- Slide 9 – Đọc trạng thái, get, describe, events (lab Phần 1-3): phát file `namespace.yaml` và `demo-web.yaml` ở bài lab; nếu `club` đã tồn tại, `apply` báo `unchanged` hoặc `configured`, đều bình thường. `kubectl diff` lần đầu in toàn bộ object và có thể kèm cảnh báo không đáng lo. Nhắc `get all` không thật sự lấy tất cả (không có ConfigMap, Secret, Ingress). Dạy thói quen: Pod không chạy thì `describe` trước; cho học viên 3 phút tự đọc Events rồi gọi vài bạn nêu 3 sự kiện đầu.
- Slide 10 – Gỡ lỗi, logs, exec, port-forward (lab Phần 4): dùng cổng 8081 vì 8080 thường bị Compose chiếm. Thay đổi trong container sẽ mất khi Pod bị tạo lại; `port-forward` chỉ là công cụ gỡ lỗi, không thay Service.
- Slide 11 – Định dạng đầu ra (lab Phần 5): so sánh `spec` (bạn khai báo) với `status` (Kubernetes ghi lại). Nhắc `-o name` để truyền cho lệnh khác và `--sort-by` để sắp xếp.
- Slide 12 – Drift, lệnh tay bị manifest ghi đè (lab Phần 6): đây là phần dạy về drift. `kubectl diff` trả exit code 1 khi có khác biệt nên dùng được trong CI. Nhóm bắt buộc dừng ở đây.
- Slide 13 – Phá lỗi, ImagePullBackOff (khoảng 5 phút): để lớp tự đi bước `get`, `describe`, đọc Events. Lỗi thường gặp khác: quên `-n club` rồi tưởng workload mất. Sau `rollout undo` nhớ sửa manifest để Git khớp cluster. Mỗi lỗi trong bảng Gặp lỗi? của bài lab có một lệnh kiểm tra đầu tiên; hỏi lớp đã gặp lỗi nào hôm nay.
- Slide 14 – Recap (review 15 phút cuối): cho học viên tự trả lời: vấn đề này giải quyết gì, hoạt động thế nào, khi lỗi kiểm tra gì đầu tiên. Nhắc dọn `club-dev` và `demo-web` trước khi nộp bài, không commit nội dung `~/.kube/config`.

## Hỗ trợ phần thử thách

Thử thách nằm ở [Thử thách nâng cao](../../labs/week-12/session-23-challenge.md); lời giải (kể cả script `inspect.sh`) ở [Đáp án tuần 12](../walkthroughs/week-12.md).

- Thử thách 3 (Deployment bí ẩn): gợi ý nhìn `Last State` và Exit Code trong `describe`. Đáp án: `sh` thoát ngay vì không có stdin, dẫn tới CrashLoopBackOff; sửa bằng thêm `-- sleep 3600`.
- Thử thách 4 (cluster 3 node) là tùy chọn và tạo cluster riêng `club-3n`; nhắc học viên không xóa nhầm cluster `club`. Kiểm tra bằng `kind get clusters` trước khi xóa.

## Lưu ý riêng cho người dạy

- Cảnh báo trong bài: chỉ xóa namespace `club-dev`, không xóa `club`.
- Demo nên chạy trên cluster `kind-club` giống học viên để tránh khác biệt tên node (`club-control-plane`).
- Giới thiệu thử thách nâng cao 30 giây trước khi học viên bắt đầu; học viên xong sớm chuyển sang thử thách và phần phá lỗi.
