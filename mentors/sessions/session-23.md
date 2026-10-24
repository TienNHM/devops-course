# Kịch bản mentor – Buổi 23: kubectl Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md). Slide: [Slide buổi 23](../../slides/06-kubectl/session-23.md). Đáp án và barem: [Walkthrough tuần 12](../walkthroughs/week-12.md), [Chấm điểm tuần 12](../grading/week-12.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 23: khung thời gian, demo của mentor, ghi chú giảng viên theo từng slide và lưu ý riêng. Nội dung chuyển nguyên văn từ bài lab và slide cũ.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian thực hành: 60 phút cho Phần 1-6 và checklist L1 (nhóm L1 dừng ở đây); L2 và Phá lỗi dành cho học viên xong sớm hoặc làm tiếp ở nhà, mentor chọn một thử thách để làm chung nếu còn thời gian.

## Demo của mentor

Mục tiêu demo (khoảng 10 phút trong phần 30' kiến thức): cho lớp thấy một vòng đời đầy đủ và cái bẫy namespace.

1. Trình chiếu context và namespace:

```bash
kubectl config get-contexts
kubectl get pods
kubectl get pods -n club
```

Kết quả mong đợi: lệnh thứ hai báo `No resources found in default namespace.`, lệnh thứ ba liệt kê Pod của `club` (nếu đã có từ buổi 22). Hỏi lớp: "Workload có mất không? Làm sao biết đang đứng ở namespace nào?"

2. Tạo manifest nhanh không cần nhớ cú pháp, rồi apply:

```bash
kubectl create deployment demo --image=nginx:1.27-alpine --replicas=2 --dry-run=client -o yaml
```

Kết quả mong đợi: YAML của một Deployment được in ra, không có gì được tạo trong cluster. Hỏi: "`--dry-run=client` khác `--dry-run=server` thế nào?" (client chỉ dựng object ở máy bạn; server gửi lên API Server để kiểm tra nhưng không lưu).

3. Cho thấy kubectl thực sự gọi REST:

```bash
kubectl get pods -n club -v=6 2>&1 | head -5
```

Kết quả mong đợi: các dòng dạng `GET https://127.0.0.1:xxxxx/api/v1/namespaces/club/pods?limit=500 200 OK`. Hỏi: "Địa chỉ này là gì? Vì sao chạy được trên máy local?"

4. Xoá một Pod đang được Deployment quản lý và quan sát Pod mới xuất hiện (`kubectl delete pod ...` rồi `kubectl get pods -w`). Hỏi: "Ai tạo lại Pod? Nếu xoá Deployment thì sao?"

5. Mở nhanh `kubectl explain deployment.spec.strategy` để cho thấy tài liệu có sẵn trong terminal.

Lưu ý khi chuẩn bị: bài học viên dùng cluster `kind-club`; nếu máy demo còn context cũ, chạy `kubectl config current-context` trước để khỏi demo nhầm cluster.

## Câu hỏi mentor nên hỏi lớp

Buổi này bài lab cũ không có mục riêng cho câu hỏi này; các câu hỏi nằm trong demo ở trên và trong ghi chú giảng viên theo slide dưới đây. Gợi ý thêm cho phần review 15 phút: gọi vài bạn nêu 3 sự kiện đầu của `Events`, hỏi "đồng đội `kubectl scale` lên 5 rồi sáng hôm sau về 2, ai chịu trách nhiệm?", và hỏi "vì sao dịch vụ chưa sập khi image sai tag?".

## Ghi chú giảng viên theo slide

Nguyên văn từ slide cũ (20 slide). Slide mới đã gộp lại; mỗi mục ghi tên slide gốc.

**Slide gốc 1 – Mục tiêu buổi học.** Đọc nhanh 5 mục tiêu, không giải thích sâu (2 phút). Hỏi lớp: ai đã từng gõ `kubectl get pods` và thấy "No resources found"? Cuối buổi quay lại danh sách này để tự đánh giá.

**Slide gốc 2 – Vấn đề thực tế "Pod biến mất".** Kể như một câu chuyện (2 phút). Nhấn mạnh: kubectl là công cụ duy nhất dùng hằng ngày, dùng sai ngữ cảnh gây sự cố thật. Câu hỏi: "Có cách nào biết ngay mình đang đứng ở đâu?"

**Slide gốc 3 – kubeconfig, cluster, user, context.** Vẽ ba hộp rồi một mũi tên "context" nối chúng. Với kind, tên context có dạng `kind-` cộng tên cluster (khóa học dùng cluster `club` nên context là `kind-club`). Lưu ý không bao giờ commit `~/.kube/config` vào Git.

**Slide gốc 4 – Namespace, ranh giới logic.** Chạy hai lệnh trực tiếp. Kết quả thứ hai chỉ có nếu đã có workload ở `club`. Hỏi lớp: "Workload có mất không?" rồi chỉ ra cờ `-n`.

**Slide gốc 5 – Kiến trúc, kubectl chỉ là client HTTP.** Đây là sơ đồ quan trọng nhất buổi (3 phút). Câu hỏi: "Nếu API Server chết thì Pod đang chạy có chết không?" (Không, kubelet vẫn giữ container, nhưng không thể thay đổi gì.)

**Slide gốc 6 – Chuyện gì xảy ra khi `kubectl apply`.** Giải thích vì sao `get` ngay sau `apply` có thể thấy Pod `ContainerCreating`. Nhắc: `logs` và `exec` đi qua API Server tới kubelet; `port-forward` cũng qua API Server nên không cần Service.

**Slide gốc 7 – Declarative và imperative.** Cho một ví dụ: đồng đội `kubectl scale` lên 5 để chịu tải, sáng hôm sau số Pod về 2 vì pipeline apply lại manifest. Hỏi lớp ai chịu trách nhiệm.

**Slide gốc 8 – Demo 1: context, namespace, dry-run.** Demo khoảng 3 phút. Dùng cách này để sinh YAML mẫu mà không cần nhớ cú pháp. Nếu cluster chưa chạy, lệnh đầu báo lỗi kết nối: dùng `kind get clusters` và kiểm tra Docker Desktop.

**Slide gốc 9 – Demo 2: nhìn kubectl gọi REST.** Hỏi lớp: "Ai tạo lại Pod? Nếu xoá Deployment thì sao?" Dùng `kubectl explain deployment.spec.strategy` để cho thấy tài liệu có sẵn trong terminal (1 phút).

**Slide gốc 10 – Lab bước 0: chuẩn bị và ngữ cảnh.** Phát file `namespace.yaml` và `demo-web.yaml` ở bài lab. Nếu `club` đã tồn tại, `apply` báo `unchanged` hoặc `configured`, đều bình thường.

**Slide gốc 11 – Lab: diff, apply, rollout.** `kubectl diff` lần đầu in toàn bộ object và có thể kèm cảnh báo không đáng lo. Nhắc `get all` không thật sự lấy tất cả (không có ConfigMap, Secret, Ingress).

**Slide gốc 12 – Lab: describe và events.** Dạy thói quen: Pod không chạy thì `describe` trước, nguyên nhân thường nằm ở Events. Cho học viên 3 phút tự đọc rồi gọi vài bạn nêu 3 sự kiện đầu.

**Slide gốc 13 – Lab: logs, exec, port-forward.** Dùng cổng 8081 vì 8080 thường bị Compose chiếm. Nhấn: thay đổi trong container sẽ mất khi Pod bị tạo lại; `port-forward` chỉ là công cụ gỡ lỗi, không thay Service.

**Slide gốc 14 – Lab: định dạng đầu ra.** So sánh `spec` (bạn khai báo) với `status` (Kubernetes ghi lại). Nhắc `-o name` để truyền cho lệnh khác và `--sort-by` để sắp xếp.

**Slide gốc 15 – Lab: scale, drift và dọn dẹp.** Đây là phần dạy về drift. Nhắc `kubectl diff` trả exit code 1 khi có khác biệt nên dùng được trong CI. Nhóm L1 dừng ở đây.

**Slide gốc 16 – Phân tầng L1 và L2.** Giới thiệu 30 giây trước khi học viên bắt đầu. Học viên xong sớm chuyển sang L2 và phần Phá lỗi. Nhắc không commit nội dung `~/.kube/config`.

**Slide gốc 17 – Phá lỗi: ImagePullBackOff.** Để lớp tự đi bước `get`, `describe`, đọc Events (5 phút). Lỗi thường gặp khác: quên `-n club` rồi tưởng workload mất. Sau `rollout undo` nhớ sửa manifest để Git khớp cluster.

**Slide gốc 18 – Lỗi thường gặp.** Đi qua từng dòng trong 2 phút, hỏi lớp đã gặp lỗi nào trong lab hôm nay. Mỗi lỗi đều có một lệnh kiểm tra đầu tiên.

**Slide gốc 19 – Thử thách nâng cao.** Với thử thách 3, gợi ý nhìn `Last State` và Exit Code trong `describe`. Đáp án: `sh` thoát ngay vì không có stdin, dẫn tới CrashLoopBackOff; sửa bằng thêm `-- sleep 3600`.

**Slide gốc 20 – Recap.** Cho học viên tự trả lời: vấn đề này giải quyết gì, hoạt động thế nào, khi lỗi kiểm tra gì đầu tiên. Nhắc dọn `club-dev` và `demo-web` trước khi nộp bài.

## Lưu ý riêng cho người dạy

- Bài học viên đã rút gọn: phần Khái niệm chi tiết, bảng cờ `-o`, sơ đồ sequence, Phá lỗi và thử thách L2 chuyển sang [Buổi 23 – Thử thách nâng cao](../../labs/week-12/session-23-challenge.md). Lời giải L2 (kể cả script `inspect.sh`) nằm trong [Walkthrough tuần 12](../walkthroughs/week-12.md).
- Thử thách 4 (cluster kind 3 node) là tùy chọn và tạo cluster riêng `club-3n`; nhắc học viên không xóa nhầm cluster `club`.
- Cảnh báo đã thêm vào bài: chỉ xóa namespace `club-dev`, không xóa `club`.
- Demo trên lớp nên chạy trên cluster `kind-club` giống học viên để tránh khác biệt tên node (`club-control-plane`).
