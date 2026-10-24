# Bài tập tuần 12 – kubectl và Services

> **Tóm tắt:** Bạn tự dựng một workload nhỏ trong namespace riêng, thao tác bằng kubectl theo hướng khai báo, đọc trạng thái bằng nhiều định dạng đầu ra, rồi mở workload ra bằng Service và kiểm tra DNS. Hai tình huống lỗi (image sai, selector sai) phải được điều tra bằng lệnh và ghi lại có bằng chứng.

**Bài tập = nộp lại bằng chứng của lab, áp dụng cho workload `notice-board`.** Không có kiến thức mới. Việc mới duy nhất: bạn tự viết manifest cho `notice-board` (không chép `demo-web`), tự chọn tag sai và selector sai riêng của bạn, rồi nộp bằng chứng.

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Dựng workload bằng manifest | [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md), Chuẩn bị và Phần 2 | 1 giờ | `get deployment`, `get pods -l`, `apply` lần hai `unchanged` |
| 2. Quan sát bằng đầu ra có cấu trúc | [Buổi 23 – kubectl Fundamentals](../../labs/week-12/session-23.md), Phần 3-5 | 1 giờ | `inspect.txt`, `port-forward` cổng 8082, `curl`, `logs` |
| 3. Điều tra Deployment kẹt | [Buổi 23 – Thử thách nâng cao](../../labs/week-12/session-23-challenge.md), mục Phá lỗi | 1 giờ | trạng thái Pod lỗi, Events, `rollout`/`diff` sau khôi phục; mục trong `report.md` |
| 4. Mở workload bằng Service và DNS | [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md), Phần 1-3 | 1 giờ | `get endpoints`, `describe svc`, `nslookup` ba tên, `wget`, `curl` |
| 5. Điều tra Service không có Endpoints | [Buổi 24 – Kubernetes Services](../../labs/week-12/session-24.md), mục Phá lỗi nâng cao | 1 giờ | `get endpoints` ba thời điểm, so sánh selector và nhãn; mục trong `report.md` |

Hạn nộp và cách nộp ở cuối trang. Mentor chấm theo barem; bảng điểm ngắn nằm bên dưới.

## Bối cảnh

Tuần này bạn học `kubectl` (buổi 23) và Service (buổi 24). Ban tổ chức CLB muốn có thêm một trang nhỏ "bảng thông báo" chạy cạnh ứng dụng điểm danh. Bạn được giao dựng trang này trong namespace riêng `club-dev` để không đụng vào workload của starter-project ở namespace `club`.

Thông số chung cho cả bài (dùng đúng tên, vì bước chấm sẽ tìm theo tên):

| Mục | Giá trị |
| --- | --- |
| Namespace | `club-dev` |
| Deployment | `notice-board`, 3 replicas |
| Image | `nginx:1.27-alpine` |
| Label của Pod | `app: notice-board` và `tier: web` |
| Service | `notice-board`, loại ClusterIP, `port: 8080`, `targetPort: 80` |
| Cổng port-forward trên máy | `8082` (tránh 8080 và 8081) |

Môi trường: Windows 11 + WSL2 Ubuntu, cluster kind `club` (context `kind-club`) từ buổi 21, làm việc trong thư mục dưới `~` (không dùng `/mnt/c`). Cluster chỉ lắng nghe trên máy bạn.

Nộp bài vào hai thư mục `lab-23/` và `lab-24/` trong repository cá nhân. Nhiệm vụ 1 đến 3 thuộc `lab-23/`, nhiệm vụ 4 và 5 thuộc `lab-24/`.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1 – Dựng workload bằng manifest

Tự viết `lab-23/source/namespace.yaml` và `lab-23/source/notice-board.yaml` để tạo namespace `club-dev` và Deployment theo bảng thông số. Deployment phải có:

- `readinessProbe` kiểu `httpGet` vào đường dẫn `/` cổng 80;
- `resources.requests` và `resources.limits.memory` cho container;
- nhãn Pod đúng như bảng (hai nhãn), và `selector.matchLabels` khớp nhãn đó.

Chạy `kubectl diff` trước, rồi `kubectl apply`, rồi chờ rollout hoàn tất.

Tiêu chí hoàn thành:

- [ ] `kubectl get deployment notice-board -n club-dev` cho `READY 3/3`.
- [ ] `kubectl get pods -n club-dev -l app=notice-board,tier=web` liệt kê đúng 3 Pod `Running`.
- [ ] Chạy lại `kubectl apply -f` lần hai cho kết quả `unchanged` (chứng minh tính idempotent).
- [ ] Manifest chạy được từ một thư mục sạch bằng đúng một lệnh `kubectl apply -f lab-23/source/`.

### Nhiệm vụ 2 – Quan sát bằng đầu ra có cấu trúc

Dùng kubectl để tạo file `lab-23/evidence/inspect.txt` gồm bốn phần, mỗi phần bắt đầu bằng một dòng `$ lệnh` đã chạy:

1. Bảng Pod gồm tên, node, IP Pod và số lần restart, dùng `-o custom-columns`.
2. Image của container đầu tiên trong Deployment, lấy bằng `-o jsonpath`.
3. Danh sách Pod trong `club-dev` sắp xếp theo thời gian tạo, dùng `--sort-by`.
4. Ba dòng đầu của phần `Events` trong `kubectl describe pod` của một Pod `notice-board`.

Sau đó dùng `port-forward` tới Deployment ở cổng local `8082`, gọi `curl` một lần và lấy từ `kubectl logs` đúng dòng log ghi lại request đó.

Tiêu chí hoàn thành:

- [ ] `inspect.txt` có đủ bốn phần và lệnh đứng trước kết quả; kết quả khớp với trạng thái cluster tại thời điểm chạy (mentor có thể chạy lại lệnh và đối chiếu IP, tên Pod).
- [ ] Phần jsonpath chỉ in ra chuỗi image (không in cả object).
- [ ] `lab-23/evidence/command-output.txt` có dòng log request từ nginx với mã `200` và có lệnh `port-forward` dùng cổng `8082`.
- [ ] `report.md` có một đoạn ngắn giải thích vì sao `port-forward` không cần Service.

### Nhiệm vụ 3 – Điều tra Deployment cập nhật bị kẹt

Cố ý làm hỏng: tạo `lab-23/source/broken/notice-board-broken.yaml` là bản sao của manifest nhưng đổi tag image thành một tag không tồn tại do bạn chọn, rồi apply. Sau đó, chỉ dùng lệnh kubectl để điều tra và khôi phục về trạng thái khỏe, rồi sửa để Git và cluster khớp nhau.

Tiêu chí hoàn thành:

- [ ] `command-output.txt` có trạng thái Pod lỗi (`ErrImagePull` hoặc `ImagePullBackOff`) và dòng Event nêu rõ image không kéo được.
- [ ] `command-output.txt` cho thấy trong lúc lỗi, các Pod cũ vẫn `Running` (nêu bằng một câu vì sao ứng dụng chưa sập).
- [ ] `report.md` có mục "Điều tra Deployment kẹt" gồm: triệu chứng, các bước (kèm lệnh), nguyên nhân gốc, cách khôi phục, cách phòng tránh.
- [ ] Sau khôi phục, `kubectl diff -f lab-23/source/notice-board.yaml` không còn khác biệt và `kubectl get deployment notice-board -n club-dev` quay lại `3/3`.
- [ ] File lỗi nằm trong thư mục con `broken/` để lệnh `kubectl apply -f lab-23/source/` (không có `-R`) không vô tình áp dụng nó; giải thích lựa chọn này trong `README.md`.

### Nhiệm vụ 4 – Mở workload bằng Service và kiểm tra DNS

Tự viết `lab-24/source/notice-board-svc.yaml` tạo Service `notice-board` theo bảng thông số. Sau đó:

1. Xác nhận Service chọn đúng 3 Pod bằng `kubectl get endpoints` và `kubectl describe svc`.
2. Chạy Pod debug `busybox:1.36` trong `club-dev`, phân giải ba dạng tên (`notice-board`, `notice-board.club-dev`, `notice-board.club-dev.svc.cluster.local`) và gọi `wget -qO- http://notice-board:8080`.
3. Từ máy bạn, `port-forward` tới `svc/notice-board` (cổng local `8082`, cổng Service `8080`) rồi `curl` trang chủ nginx.

Tiêu chí hoàn thành:

- [ ] Output `get endpoints` có đúng 3 địa chỉ, cổng `80` (không phải 8080).
- [ ] Ba tên DNS cùng trả về một ClusterIP trùng với cột `CLUSTER-IP` của `kubectl get svc notice-board -n club-dev`.
- [ ] `wget` trong Pod debug trả về nội dung trang nginx; `curl` qua port-forward trả HTTP `200`.
- [ ] `report.md` giải thích bằng lời của bạn sự khác nhau giữa `port`, `targetPort` và `containerPort` trong chính manifest của bạn.

### Nhiệm vụ 5 – Điều tra Service không có Endpoints

Cố ý làm hỏng Service `notice-board` bằng cách đổi selector thành một giá trị sai do bạn chọn (không dùng lại ví dụ trong đề lab). Ghi lại trạng thái trước và sau khi hỏng, điều tra từ ngoài vào trong rồi sửa.

Tiêu chí hoàn thành:

- [ ] `command-output.txt` có `get endpoints` ở cả ba thời điểm: bình thường, đang lỗi (`<none>`), sau khi sửa.
- [ ] `command-output.txt` chứng minh Pod vẫn `Running` và `READY 1/1` trong lúc lỗi.
- [ ] `command-output.txt` có so sánh selector của Service với nhãn thật của Pod (`describe svc` và `get pods --show-labels` hoặc `get pods -l`).
- [ ] `report.md` có mục "Điều tra Endpoints rỗng": triệu chứng, bước điều tra theo thứ tự, nguyên nhân gốc, cách sửa, và một biện pháp phòng tránh cụ thể.
- [ ] Manifest `notice-board-svc.yaml` trong `source/` là bản đã sửa đúng; cluster và file khớp nhau (`kubectl diff` không còn khác biệt).

## Nhiệm vụ L2 (nâng cao, điểm thưởng)

Chỉ làm khi L1 đã xong. Điểm thưởng tối đa 10.

### Thử thách A – Script kiểm tra Service

Viết `lab-24/source/check-service.sh` nhận hai tham số: namespace và tên Service. Script phải:

- in selector của Service, số Endpoints đang sẵn sàng và `targetPort`;
- thoát với mã khác 0 và in thông báo rõ ràng khi Service không tồn tại hoặc không có Endpoints nào;
- thoát với mã 0 khi mọi thứ ổn;
- báo lỗi dùng sai khi thiếu tham số.

Tiêu chí hoàn thành: trong `lab-24/evidence/test-results.txt` có ba lần chạy (Service khỏe, Service selector sai, tên Service không tồn tại), mỗi lần kèm mã thoát (`echo $?`). Script không được hard-code tên namespace hay Service.

### Thử thách B – Gọi chéo namespace

Tạo namespace `lab24-x`, chạy Pod debug ở đó và gọi `notice-board` ở `club-dev` thành công. Ghi lại tên nào chạy được, tên nào không, và đọc `/etc/resolv.conf` của Pod để giải thích bằng chính dòng `search` trong đó. Dọn namespace khi xong.

Tiêu chí hoàn thành: `evidence/command-output.txt` có cả lần gọi thất bại lẫn lần gọi thành công, kèm nội dung `resolv.conf`; `report.md` giải thích 3-5 câu.

### Thử thách C – Hai kiểu lỗi, hai dấu hiệu

Tạo một Service thứ hai có `targetPort` sai (cổng không có process lắng nghe). Lập bảng trong `report.md` so sánh với lỗi selector sai ở nhiệm vụ 5 theo các cột: kết quả `get endpoints`, kết quả `wget` từ Pod debug, và lệnh dùng để phân biệt.

Tiêu chí hoàn thành: bảng có bằng chứng lệnh thật trong `command-output.txt`, và kết luận nêu được vì sao ở lỗi này Endpoints không rỗng.

## Bằng chứng cần nộp

Theo `templates/lab-template.md`, nộp hai thư mục độc lập:

```text
lab-23/
├── README.md
├── source/
│   ├── namespace.yaml
│   ├── notice-board.yaml
│   └── broken/
│       └── notice-board-broken.yaml
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   └── inspect.txt
└── report.md

lab-24/
├── README.md
├── source/
│   ├── notice-board-svc.yaml
│   └── check-service.sh          (L2, nếu làm)
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   └── test-results.txt          (L2, nếu làm)
└── report.md
```

Bằng chứng theo từng nhiệm vụ:

| Nhiệm vụ | Source | Evidence | Report |
| --- | --- | --- | --- |
| 1 | `namespace.yaml`, `notice-board.yaml` | `get deployment`, `get pods -l`, `apply` lần hai (`unchanged`) | không |
| 2 | không | `inspect.txt`, `port-forward`, `curl`, `logs` | đoạn giải thích port-forward |
| 3 | `broken/notice-board-broken.yaml` | trạng thái Pod lỗi, Events, `rollout`/`diff` sau khôi phục | mục "Điều tra Deployment kẹt" |
| 4 | `notice-board-svc.yaml` | `get endpoints`, `describe svc`, `nslookup` ba tên, `wget`, `curl` | giải thích ba loại cổng |
| 5 | `notice-board-svc.yaml` (bản đúng) | `get endpoints` ba thời điểm, so sánh selector và nhãn | mục "Điều tra Endpoints rỗng" |
| L2 | `check-service.sh` | `test-results.txt`, output chéo namespace | bảng so sánh, giải thích DNS |

Quy ước chung:

- `command-output.txt` ghi dòng `$ lệnh` rồi output thật, không chỉnh sửa tay output. Dùng `| tee -a evidence/command-output.txt`.
- Screenshot chỉ bổ trợ: ít nhất một ảnh cho mỗi lab (ví dụ `kubectl get svc,endpoints`), nhưng mọi điểm đều phải kiểm chứng được bằng source và evidence dạng text.
- `README.md` trả lời đủ 7 câu của template và ghi rõ đã làm L1 hay L2. Giải thích cách chạy lại từ đầu (các lệnh `apply` theo thứ tự).
- Không đưa `~/.kube/config`, token, hay bất kỳ secret nào vào repo.

## Bảng điểm

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: Manifest và rollout | 15 |
| Nhiệm vụ 2: Quan sát và truy cập | 15 |
| Nhiệm vụ 3: Điều tra image sai | 15 |
| Nhiệm vụ 4: Service và DNS | 20 |
| Nhiệm vụ 5: Điều tra Endpoints rỗng | 20 |
| Chất lượng nộp bài | 10 |
| Câu hỏi kiểm tra kiến thức | 5 |
| Tổng | 100 |
| Điểm thưởng L2 | tối đa +10 |

Có secret hoặc kubeconfig trong repo thì bị trừ toàn bộ phần "Chất lượng nộp bài". Tiêu chí đạt và không đạt chi tiết do mentor giữ; hãy tự đối chiếu bằng checklist ở cuối trang.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2-4 câu mỗi câu) trong mục cuối của `lab-24/report.md`.

1. Lệnh `kubectl get pods` trả về `No resources found` nhưng workload vẫn chạy. Hai nguyên nhân khả dĩ là gì và bạn kiểm tra thế nào?
2. Vì sao sau khi `kubectl scale` rồi `kubectl apply -f` lại, số replicas quay về giá trị cũ? Quy tắc làm việc nên là gì?
3. Trong Rolling Update với image sai tag, vì sao người dùng thường chưa thấy dịch vụ gián đoạn?
4. Service liên kết với Pod bằng cơ chế nào, và điều gì xảy ra với Endpoints khi một Pod mất trạng thái Ready?
5. Pod ở namespace `lab24-x` muốn gọi Service `notice-board` ở `club-dev`: dùng tên nào, và vì sao tên ngắn không đủ?

## Quy trình nộp

1. Tạo branch trong repository cá nhân, ví dụ `week-12`.
2. Commit hai thư mục `lab-23/` và `lab-24/` theo cấu trúc ở trên (commit nhỏ, thông điệp rõ ràng).
3. Mở Pull Request vào nhánh chính của repository cá nhân, mô tả ngắn các nhiệm vụ đã làm và level (L1 hay L2).
4. Nhờ ít nhất một bạn review và xử lý nhận xét của bạn đó; review cần có ít nhất một góp ý cụ thể về evidence hoặc manifest.
5. Mentor chấm theo barem sau khi PR đã được review.

Hạn nộp: trước buổi đầu tiên của tuần 13. Nộp muộn bị trừ điểm theo quy định chung ở [Đánh giá và chấm điểm](../../curriculum/assessment.md).

## Checklist trước khi nộp

- [ ] Hai thư mục `lab-23/` và `lab-24/` đúng cấu trúc, mỗi lab có `README.md` đủ 7 câu và ghi rõ L1 hoặc L2
- [ ] Manifest tự viết, chạy lại được bằng `kubectl apply -f` từ môi trường sạch
- [ ] `notice-board` đạt `3/3` Ready và Service có đúng 3 Endpoints cổng 80
- [ ] `evidence/command-output.txt` có lệnh và output thật cho cả năm nhiệm vụ
- [ ] `lab-23/evidence/inspect.txt` đủ bốn phần
- [ ] `report.md` có hai mục điều tra (image sai, Endpoints rỗng) và 5 câu trả lời kiến thức
- [ ] `kubectl diff` không còn khác biệt giữa manifest và cluster
- [ ] Đã dọn: Pod debug, namespace `lab24-x` (nếu làm L2); `club-dev` được xóa hoặc ghi chú giữ lại có chủ đích
- [ ] Không commit `.env`, password, token, private key hay `~/.kube/config`
- [ ] PR đã được ít nhất một bạn review
