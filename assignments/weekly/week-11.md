# Bài tập tuần 11 – Kubernetes Setup & Workloads

> **Tóm tắt:** Nộp lại bằng chứng của lab buổi 21 và 22: cluster kind club, Club API chạy trên Kubernetes, rolling update và rollback, và một lỗi ImagePullBackOff do bạn tự chẩn đoán.

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Ba chỗ cần làm thêm một chút ngoài lab, đều nhỏ và đã ghi rõ ở bảng dưới: viết bảng thành phần cluster vào `report.md`, sửa một dòng mã nguồn backend để thấy được bản 1.0.1, và chọn một tag lỗi riêng của bạn ở nhiệm vụ 5.

Phạm vi: [Buổi 21 – Kubernetes Introduction](../../labs/week-11/session-21.md) và [Buổi 22 – Pods & Deployments](../../labs/week-11/session-22.md). Nộp trong `lab-21/` và `lab-22/` của repo `devops-labs`. Làm trên cluster `club` (context `kind-club`), trong filesystem của WSL. Hạn nộp: trước buổi đầu tiên của tuần 12.

## Nhiệm vụ L1 (bắt buộc)

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Cluster `club` chạy tốt | Buổi 21, Chuẩn bị và Phần 1 | 0,5 | `kubectl version --client`, `kind version`, `kubectl config current-context`, `kubectl get nodes -o wide`, `docker ps --filter name=club` |
| 2. Bản đồ cluster (việc thêm: bảng và sơ đồ trong `report.md`) | Buổi 21, Phần 2 | 0,5 | Output `kubectl get pods -n kube-system -o wide`; bảng thành phần (nơi chạy, vai trò một câu) và sơ đồ mermaid đường đi từ `kubectl apply` tới container |
| 3. Deploy Club API | Buổi 22, Phần 1 đến 3 | 1 | `rollout status`, `get deployment,replicaset,pod`, output ba lệnh `curl` trong `evidence/test-results.txt`; 3 câu trả lời về manifest; `git ls-files \| grep -i secret` chỉ thấy file example |
| 4. Rolling update và rollback (việc thêm: sửa một dòng mã nguồn) | Buổi 22, Phần 4 | 0,75 | `rollout history` (ít nhất 2 revision), `get replicaset` sau cập nhật, image trước và sau, `curl` trước, sau, sau rollback, diff mã nguồn |
| 5. Chẩn đoán ImagePullBackOff (việc thêm: tag lỗi riêng, không dùng `1.0.9`) | Buổi 22, Phần 5 | 0,5 | `get pods` có `ErrImagePull` hoặc `ImagePullBackOff`, Events của `describe pod`, số Pod Ready lúc lỗi, lệnh khôi phục và `get pods` về 2/2 |

Điều kiện đạt của từng nhiệm vụ:

- Nhiệm vụ 1: context `kind-club`, node `club-control-plane` `Ready`, `docker ps` thấy container node `Up`, kind từ 0.23 trở lên.
- Nhiệm vụ 2: bảng khớp output thật (đúng tên Pod và node); sơ đồ có đủ bước API Server ghi vào etcd, controller tạo ReplicaSet và Pod, scheduler chọn node, kubelet chạy container.
- Nhiệm vụ 3: Deployment READY 2/2; `/health` trả `{"status":"healthy","service":"club-api"}`, `/ready` trả `{"status":"ready"}`, `/api/members` trả danh sách; mật khẩu DB không nằm trong file nào bạn commit; report trả lời label nối Deployment với Pod, probe chặn traffic, và `DB_HOST` lấy từ đâu.
- Nhiệm vụ 4: image đổi `club-api:1.0.1` rồi về `club-api:1.0.0` sau `undo`; report giải thích vì sao có hai ReplicaSet và ReplicaSet nào có DESIRED bằng 0 sau rollback.
- Nhiệm vụ 5: dùng Events chứng minh nguyên nhân (không chỉ ghi "sai tag"); chứng minh dịch vụ vẫn trả lời khi có Pod lỗi; giải thích vì sao với kind không cần registry mà vẫn phải `kind load docker-image`.

## Nhiệm vụ L2 (nâng cao, điểm thưởng)

L2 chỉ chấm khi L1 đạt từ 70 điểm. Đề bài và gợi ý nằm ở [Buổi 21 – Thử thách thêm](../../labs/week-11/session-21-challenge.md) và [Buổi 22 – Thử thách thêm](../../labs/week-11/session-22-challenge.md).

- Thử thách A (buổi 21): tự viết file cấu hình cluster 3 node `club-3`; 3 node `Ready`, giải thích taint của control plane. Xóa cluster ngay sau khi xong.
- Thử thách B (buổi 22): Deployment tự viết `club-api-extra` (`app: club-api`, `track: extra`, image `club-api:1.0.1`); `get endpointslices` liệt kê 3 địa chỉ; giải thích vì sao Service `backend` tự nhận Pod mới và điều gì xảy ra nếu đổi label `app` của Pod.
- Thử thách C (buổi 22): `replicas: 4` với `maxSurge: 1`, `maxUnavailable: 0` trong manifest; file `get pods -w` chứng minh không quá 5 Pod và luôn có ít nhất 4 Pod Ready; giải thích bằng phép tính.
- Thử thách D: rollout bị kẹt do readinessProbe trỏ tới đường dẫn không tồn tại (ví dụ `/ready-x`); dùng `kubectl rollout status --timeout=60s` chứng minh rollout không hoàn tất, dịch vụ vẫn gọi được, rồi khôi phục bằng `kubectl rollout undo`.

## Bảng điểm

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: cluster `club` | 15 |
| Nhiệm vụ 2: bản đồ cluster | 15 |
| Nhiệm vụ 3: deploy Club API | 20 |
| Nhiệm vụ 4: rolling update và rollback | 20 |
| Nhiệm vụ 5: ImagePullBackOff | 15 |
| Report và câu hỏi kiểm tra kiến thức | 10 |
| Quy trình nộp (PR, review, đúng hạn) | 5 |
| Tổng L1 | 100 |
| Thưởng L2 (thử thách A đến D) | tối đa 10 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `report.md`, đặt tiêu đề "Câu hỏi kiểm tra".

1. Vì sao `kubectl get nodes` của kind liệt kê node mà `docker ps` cũng thấy? Điều gì xảy ra với `kubectl` nếu container control-plane bị dừng?
2. Nếu kube-scheduler ngừng hoạt động, Pod đang chạy và Pod mới bị ảnh hưởng thế nào?
3. Phân biệt Pod, ReplicaSet và Deployment. Vì sao không nên chạy Pod trần cho ứng dụng thật?
4. Trong rolling update, điều gì quyết định Pod mới được nhận traffic? Nếu readinessProbe luôn thất bại thì rollout ra sao?
5. Khi gặp ImagePullBackOff với image chạy trên kind, bạn kiểm tra những gì theo thứ tự nào?

## Cấu trúc nộp

Theo [mẫu nộp bài lab](../../templates/lab-template.md), gồm hai thư mục:

```text
lab-21/
├── README.md              # 7 câu hỏi của template
├── source/                # file cấu hình nếu làm L2
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              # bảng thành phần, sơ đồ mermaid, phần tự phá rồi tự sửa, câu hỏi kiểm tra
lab-22/
├── README.md              # 7 câu hỏi của template
├── source/                # manifest đã chỉnh, patch mã nguồn backend, file L2
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   └── test-results.txt   # output curl trước và sau cập nhật
└── report.md
```

Mọi output phải là kết quả thật từ máy của bạn (tên node, hash và thời gian khác nhau giữa các bạn); screenshot chỉ bổ sung, không thay thế `command-output.txt`. Không commit `.env`, mật khẩu, token, file Secret chứa giá trị thật hay kubeconfig.

## Quy trình nộp

1. Tạo branch trong repo `devops-labs`, ví dụ `week-11`.
2. Commit `lab-21/` và `lab-22/` đúng cấu trúc; kiểm tra không có secret (`git ls-files | grep -i secret`).
3. Mở Pull Request vào nhánh chính của repo cá nhân, mô tả ngắn các nhiệm vụ và level đã làm (L1, L2).
4. Nhờ một bạn trong lớp review; người review kiểm tra evidence có thật và để lại ít nhất hai nhận xét cụ thể.
5. Sửa theo nhận xét, rồi gửi link PR cho mentor để chấm.

## Checklist trước khi nộp

- [ ] `lab-21/` và `lab-22/` đúng cấu trúc theo mẫu lab
- [ ] Cluster `club` có node `Ready`, bảng thành phần khớp output `kubectl get pods -n kube-system -o wide`
- [ ] `club-api` 2/2 Ready, ba endpoint đã gọi và lưu output vào `test-results.txt`
- [ ] Có `rollout history` với ít nhất 2 revision và xác nhận rollback
- [ ] Phần ImagePullBackOff có triệu chứng, nguyên nhân gốc, cách sửa, dựa trên Events
- [ ] `report.md` có 5 câu trả lời kiểm tra kiến thức; `README.md` trả lời 7 câu cho cả hai lab
- [ ] Không commit `.env`, mật khẩu, token hay file Secret chứa giá trị thật
- [ ] PR đã được ít nhất một bạn review và nộp trước hạn

Giảng viên chấm theo bảng điểm chi tiết riêng; học viên không cần đọc.
