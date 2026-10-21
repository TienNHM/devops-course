# Technical Assessment

> **Tóm tắt:** Technical Assessment chiếm 15% điểm khóa, gồm bài kiểm tra giữa khóa (sau tuần 8) và bài kiểm tra cuối khóa (sau tuần 14). Trang này mô tả thể thức, chủ đề ôn tập, quy định và 10 câu mẫu có đáp án.

Technical Assessment đo khả năng hiểu và tự xử lý, không đo khả năng học thuộc. Phần lớn điểm nằm ở bài thực hành trên máy: bạn phải containerize, dựng Compose, đọc log và sửa lỗi Kubernetes trong thời gian giới hạn. Phần lý thuyết chỉ kiểm tra những khái niệm bạn cần để thao tác đúng.

Cách tính điểm tổng hợp nằm ở [Đánh giá](assessment.md). Lịch tuần nằm ở [Lịch học](schedule.md).

## Tổng quan hai bài kiểm tra

| | Giữa khóa | Cuối khóa |
| --- | --- | --- |
| Thời điểm | Sau tuần 8 | Sau tuần 14 |
| Phạm vi | Tuần 1–8: Linux, Git, networking, Docker, Dockerfile, Compose, CI/CD cơ bản | Toàn khóa, trọng tâm tuần 9–14: CI/CD, Kubernetes, troubleshooting |
| Lý thuyết | 15 câu trắc nghiệm, 15 phút, 30 điểm | 20 câu, 30 phút, 40 điểm |
| Thực hành | Containerize + Compose, 60 phút, 70 điểm | Troubleshooting Kubernetes, 90 phút, 60 điểm |
| Tổng thời gian | 75 phút | 120 phút |
| Đóng góp vào Technical Assessment | 40% | 60% |

Điểm Technical Assessment = 0,4 x điểm giữa khóa + 0,6 x điểm cuối khóa (mỗi bài chấm trên thang 100).

## Chủ đề ôn tập

Ngân hàng câu hỏi chia theo tám chủ đề. Mỗi đề lý thuyết được sinh từ ngân hàng này, nên hãy ôn đều thay vì đoán tủ.

| Chủ đề | Bạn cần làm được |
| --- | --- |
| Linux | Điều hướng, phân quyền (`chmod`, `chown`), pipe và redirect, xem process và port, chạy script |
| Git | `add`, `commit`, branch, PR, giải quyết conflict, hoàn tác an toàn (`revert` so với `reset`), xử lý secret lỡ commit |
| Networking | IP, port, DNS, localhost và `0.0.0.0`, HTTP status, dùng `curl`, hiểu vì sao container không gọi nhau bằng `localhost` |
| Docker | Image so với container, layer cache, port mapping, volume, multi-stage, non-root, `.dockerignore` |
| Compose | `up`, `down`, `logs`, network nội bộ, healthcheck, `depends_on`, volume, biến môi trường |
| CI/CD | Workflow, trigger, job, step, `needs`, secrets, `permissions`, publish image lên GHCR |
| Kubernetes | Pod, Deployment, Service, ConfigMap, Secret, probe, resource, PVC, Ingress, `kind load docker-image` |
| Troubleshooting | Quy trình đọc triệu chứng, xem log và event, tìm nguyên nhân gốc, kiểm chứng sau khi sửa |

Gợi ý ôn: làm lại mười [tình huống lỗi](../examples/troubleshooting/README.md) mà không nhìn đáp án, và tự giải thích bằng lời tại sao lỗi xảy ra.

## Bài thực hành giữa khóa (60 phút)

Bạn nhận một thư mục mã nguồn backend và frontend (không có Dockerfile và compose.yaml). Nhiệm vụ gồm bốn phần:

1. Viết Dockerfile cho backend: multi-stage, base image pin phiên bản, chạy bằng user không phải root, có `.dockerignore`.
2. Viết `compose.yaml` chạy ba service (frontend, backend, postgres) trên một network riêng, postgres có volume và healthcheck, backend chờ postgres khỏe.
3. Kiểm chứng: gọi `/health` và `/api/members` qua frontend, tắt rồi bật lại stack và chứng minh dữ liệu còn nguyên.
4. Trả lời nhanh ba câu hỏi giải thích thiết kế của bạn.

Tham số đề (cổng, tên biến, tên database, tên user) khác nhau giữa các học viên, vì vậy hãy đọc kỹ đề bài của bạn.

Tiêu chí chấm gồm: Dockerfile (25 điểm), Compose (30 điểm), kiểm chứng (10 điểm), giải thích (5 điểm). Chi tiết thang điểm được công bố trên đề thi.

## Bài thực hành cuối khóa (90 phút)

Mentor dựng sẵn một namespace trên cụm kind. Ứng dụng trong namespace đó bị hỏng ở năm điểm khác nhau. Bạn chỉ nhận triệu chứng. Với mỗi lỗi bạn phải:

1. Tìm nguyên nhân gốc bằng `kubectl get`, `describe`, `logs`, `events`.
2. Sửa manifest hoặc tài nguyên.
3. Chứng minh đã sửa đúng bằng lệnh kiểm chứng.
4. Ghi lại ngắn gọn: triệu chứng, nguyên nhân gốc, cách sửa, cách phòng ngừa.

Mỗi lỗi 10 điểm (nguyên nhân 4, cách sửa 4, kiểm chứng 2), cộng 10 điểm cho bản ghi chép tổng hợp. Sửa mò mà không giải thích được nguyên nhân sẽ không được điểm tối đa.

## Quy định chung

- Làm trên máy của bạn trong WSL2, trong filesystem của WSL (không dùng `/mnt/c`).
- Được dùng: tài liệu chính thức (docs.docker.com, kubernetes.io, docs.github.com), `--help`, `man`, ghi chú cá nhân bạn viết trước đó.
- Không được dùng: chatbot AI, nhờ người khác, copy bài lab của bạn khác, tìm lời giải trên diễn đàn.
- Không ghi secret thật vào bài nộp. Mật khẩu trong đề thi là giá trị giả.
- Bài thực hành nộp bằng cách push lên nhánh `assessment` trong repo cá nhân kèm file `NOTES.md`, hoặc theo hướng dẫn của mentor tại phòng thi.
- Mentor có thể hỏi vấn đáp ngắn trên bài của bạn. Nếu không giải thích được phần mình nộp, điểm phần đó có thể bị điều chỉnh.
- Vắng mặt có lý do chính đáng được thi bù bằng đề tham số khác. Chi tiết nộp trễ và khiếu nại nằm ở [Đánh giá](assessment.md).

## Mẫu 10 câu có đáp án

Các câu dưới đây cùng dạng với đề thật nhưng không nằm trong ngân hàng. Hãy tự trả lời trước khi mở đáp án.

### Câu 1 (Linux, trắc nghiệm)

Lệnh nào theo dõi nội dung mới được ghi vào file log theo thời gian thực?

- A. `cat app.log`
- B. `tail -f app.log`
- C. `head -n 1 app.log`
- D. `wc -l app.log`

<details><summary>Đáp án</summary>

Đáp án B. `tail -f` giữ file mở và in các dòng mới khi chúng xuất hiện. Dùng Ctrl+C để thoát.

</details>

### Câu 2 (Git, trắc nghiệm)

Bạn lỡ chạy `git add notes.txt` và muốn bỏ file khỏi staging area nhưng giữ nguyên nội dung file. Lệnh nào phù hợp?

- A. `git restore --staged notes.txt`
- B. `git reset --hard`
- C. `git clean -fd`
- D. `git rm -rf notes.txt`

<details><summary>Đáp án</summary>

Đáp án A. `git restore --staged` chỉ bỏ file khỏi staging area. B và C có thể xóa thay đổi chưa commit, D xóa file.

</details>

### Câu 3 (Networking, trắc nghiệm)

Trình duyệt nhận mã trạng thái 404 từ một web server. Điều gì đúng nhất?

- A. Server không chạy.
- B. Server đang quá tải.
- C. Server nhận được request nhưng không tìm thấy tài nguyên ở đường dẫn đó.
- D. Bạn chưa đăng nhập.

<details><summary>Đáp án</summary>

Đáp án C. Có phản hồi 404 nghĩa là server đang chạy và xử lý request. A sẽ cho lỗi kết nối, B thường cho 503, D thường cho 401 hoặc 403.

</details>

### Câu 4 (Docker, trắc nghiệm)

Khi chạy `docker run image-cua-ban arg1`, `arg1` có tác dụng gì với Dockerfile có `ENTRYPOINT ["node"]` và `CMD ["server.js"]`?

- A. Thêm vào cuối lệnh, chạy `node server.js arg1`.
- B. Thay thế `CMD`, chạy `node arg1`.
- C. Thay thế `ENTRYPOINT`, chạy `arg1`.
- D. Bị bỏ qua.

<details><summary>Đáp án</summary>

Đáp án B. Tham số sau tên image thay thế `CMD`, còn `ENTRYPOINT` giữ nguyên (trừ khi dùng `--entrypoint`).

</details>

### Câu 5 (Compose, đúng/sai kèm giải thích)

Phát biểu: "Sau khi sửa `compose.yaml`, chỉ cần chạy `docker compose restart` là cấu hình mới được áp dụng." Đúng hay sai? Giải thích.

<details><summary>Đáp án</summary>

Sai. `docker compose restart` chỉ khởi động lại container hiện có, không tạo lại container theo cấu hình mới. Cần chạy `docker compose up -d` để Compose phát hiện thay đổi và recreate service liên quan.

</details>

### Câu 6 (CI/CD, đúng/sai kèm giải thích)

Phát biểu: "Workflow có `on: push` với `branches: [main]` sẽ chạy khi bạn push lên nhánh `feature/login`." Đúng hay sai? Giải thích.

<details><summary>Đáp án</summary>

Sai. Bộ lọc `branches` giới hạn workflow chỉ chạy khi push lên nhánh khớp danh sách. Push lên `feature/login` không kích hoạt workflow này (trừ khi có trigger khác như `pull_request`).

</details>

### Câu 7 (Kubernetes, trắc nghiệm)

Pod `club-api-7d9f` ở trạng thái `CrashLoopBackOff`. Container đã khởi động lại nhiều lần. Lệnh nào xem log của lần chạy trước bị crash?

- A. `kubectl logs club-api-7d9f --previous`
- B. `kubectl get pod club-api-7d9f -o yaml`
- C. `kubectl top pod club-api-7d9f`
- D. `kubectl exec club-api-7d9f -- ls`

<details><summary>Đáp án</summary>

Đáp án A. Cờ `--previous` đọc log của instance container trước đó, thường chứa lỗi gây crash. Ở C, `kubectl top` cần metrics-server nên không hiển thị nguyên nhân crash. Ở D, container đang crash nên khó `exec`.

</details>

### Câu 8 (Kubernetes, tình huống)

Bạn cập nhật Deployment lên image mới, sau đó Pod mới liên tục lỗi và ứng dụng chập chờn. Bạn muốn quay về phiên bản trước nhanh nhất. Lệnh nào?

<details><summary>Đáp án</summary>

`kubectl rollout undo deployment/club-api -n club`. Sau đó kiểm tra bằng `kubectl rollout status deployment/club-api -n club`. Việc tiếp theo là tìm nguyên nhân Pod mới lỗi (logs, describe), không chỉ rollback rồi bỏ qua.

</details>

### Câu 9 (Troubleshooting, tình huống)

`kubectl describe pod` cho thấy event: "Failed to pull image club-api:1.0.1 ... not found". Deployment YAML ghi `image: club-api:1.0.1`. Nhóm bạn chỉ build tag `1.0.0`. Nguyên nhân gốc và cách sửa?

<details><summary>Đáp án</summary>

Nguyên nhân gốc: manifest tham chiếu một tag không tồn tại (sai tag so với image đã build). Cách sửa: đổi `image` về `club-api:1.0.0` (hoặc build và nạp tag `1.0.1` vào kind bằng `kind load docker-image`), rồi `kubectl apply`. Kiểm chứng bằng `kubectl get pods` thấy Pod `Running` và `READY 1/1`.

</details>

### Câu 10 (Troubleshooting, tình huống)

Container backend chạy được, `curl localhost:3000/health` trả về 200, nhưng frontend báo "502 Bad Gateway" khi gọi `/api/members`. Hãy nêu ba bước kiểm tra theo thứ tự hợp lý.

<details><summary>Đáp án</summary>

1. `docker compose ps` và `docker compose logs frontend` để xem Nginx báo gì (ví dụ không resolve được host `backend` hoặc connection refused).
2. Kiểm tra frontend và backend có cùng network không, và Nginx proxy tới đúng tên service và cổng nội bộ (`backend:3000`).
3. Từ container frontend gọi thử backend bằng tên service (ví dụ `docker compose exec frontend wget -qO- http://backend:3000/health`) để tách lỗi mạng khỏi lỗi cấu hình.

Điểm mấu chốt: 200 trên host chưa chứng minh container khác gọi được backend.

</details>

## Sau bài kiểm tra

Mentor công bố điểm và nhận xét theo từng tiêu chí. Hãy dùng nhận xét để bổ sung lab còn yếu trước Final Project. Quy trình khiếu nại và thi bù xem tại [Đánh giá](assessment.md).
