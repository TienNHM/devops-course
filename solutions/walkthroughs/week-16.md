# Walkthrough tuần 16 – Capstone: kiểm thử, gỡ lỗi và bảo vệ

> **Tóm tắt:** Hướng dẫn giải buổi 31 (clean clone, ba sự cố trên kind, bảo mật, runbook) và buổi 32 (demo, bảo vệ kỹ thuật), kèm checklist Definition of Done, lỗi tích hợp thường gặp và bảng chấm cho mentor.

## Cách dùng tài liệu này

Tài liệu này được công bố sau khi tuần 16 kết thúc. Hãy đọc nó sau khi nhóm đã tự làm và đã demo, rồi đối chiếu chứ không chép. Tuần 16 là phần chứng minh khả năng vận hành: giá trị nằm ở dự đoán, quan sát và chẩn đoán của chính bạn, không nằm ở việc có cùng câu chữ với tài liệu này.

- Lệnh và kết quả mong đợi bám theo hai bài lab: [buổi 31](../../labs/week-16/session-31.md) và [buổi 32](../../labs/week-16/session-32.md); bài tập tuần ở [assignments/weekly/week-16.md](../../assignments/weekly/week-16.md). Tiêu chí tổng thể: [đề bài Capstone](../../assignments/capstone/README.md), [hướng dẫn demo](../../assignments/capstone/demo-guide.md) và [rubric](../../curriculum/capstone-rubric.md).
- Tài liệu này không đưa mã nguồn hoàn chỉnh của hệ thống. Capstone dùng mã của chính nhóm; ở đây chỉ có cách tiếp cận, checklist và cách chẩn đoán.
- Trong bài làm, hãy viết dự đoán trước khi chạy lệnh. Dự đoán sai không bị trừ điểm; dự đoán viết sau khi đã thấy kết quả mới bị trừ.

Về mức độ kiểm chứng: phần Compose và hành vi của API đã được chạy lại với PostgreSQL 17 trong container tạm. Các hiện tượng trên Kubernetes (rolling update, readiness, Secret, events) được suy ra từ manifest của starter-project và các bài lab; cụm kind chưa được dựng lại khi viết tài liệu này, nên chuỗi sự kiện chi tiết có thể khác đôi chút giữa các phiên bản.

---

### Buổi 31 – Testing & Troubleshooting

#### Đáp án các nhiệm vụ L1

**Phần 1 – Clean clone với Compose.** Mục tiêu là tìm ra điều "chỉ chạy trên máy tôi". Chuỗi kiểm tra và cách đọc kết quả:

| Bước | Lệnh | Kết quả đạt | Nếu không đạt |
| --- | --- | --- | --- |
| Clone mới | `git clone ... clean-check` | Thư mục chưa từng tồn tại | Dùng thư mục cũ thì bài không hợp lệ |
| Không có `.env` trong Git | `git ls-files \| grep -E '(^\|/)\.env$'` | Không in gì | Có kết quả thì dừng, xử lý như sự cố lộ secret |
| Có `.env.example` | `ls -a` | Có file, giá trị giả | Ghi thành lỗi README, bổ sung vào repo |
| Compose hợp lệ | `docker compose config -q` | Không lỗi | Thiếu `DB_PASSWORD` nghĩa là chưa tạo `.env` |
| Stack lên | `docker compose up -d --build`, `docker compose ps` | Ba service `running`, `postgres` là `healthy` | `docker compose logs` của service lỗi |
| Smoke test | `curl -w "%{http_code}"` tới `/health`, `/ready`, `/api/members` | 200, 200, JSON | Xem log backend |
| Dữ liệu bền | `POST`, `down`, `up`, `GET` | Bản ghi còn | Có dùng nhầm `-v` hay đọc trước khi `/ready` |

Điểm hay bị bỏ sót: bước "làm đúng README, không dùng kiến thức ngoài". Cách ghi nhận tốt là liệt kê từng dòng README bạn làm theo và chỗ bạn phải đoán. Ví dụ phát hiện hợp lệ: README không nhắc đặt `DB_PASSWORD` hoặc `WEB_PORT`; README không nói phải dừng stack cũ vì cổng 3000 và 8080.

**Phần 2 – Triển khai lên kind.** Trình tự đúng: build image có tag phiên bản (`club-api:1.0.0`, `club-web:1.0.0`), `kind load docker-image` (thêm `--name` nếu cluster không có tên mặc định), tạo namespace, tạo Secret bằng lệnh với `--dry-run=client -o yaml | kubectl apply -f -` (không có file chứa mật khẩu trong Git), apply ConfigMap, PostgreSQL, backend, frontend, Ingress, rồi chờ `kubectl rollout status deployment/club-api -n club`.

Một bước mà bài lab ban đầu thiếu và đã được bổ sung: nạp schema. Trên Kubernetes, `init.sql` không tự chạy vì không có volume nào gắn nó vào PostgreSQL. Với PVC mới, nếu bỏ qua bước này thì mọi Pod đều Ready (`/ready` chỉ chạy `SELECT 1`) nhưng `/api/members` trả 500. Lệnh nạp: `kubectl exec -i -n club postgres-0 -- psql -U club -d clubdb < database/init.sql`. Tình huống này là một ví dụ tốt cho troubleshooting log: triệu chứng "Pod Ready nhưng API 500", bằng chứng `kubectl logs` của Pod có lỗi quan hệ `members` không tồn tại, nguyên nhân gốc là DB chưa có bảng.

Đo độ trễ: năm lần `curl -w "%{http_code} %{time_total}s\n"` đều phải trả 200, thường vài mili giây đến vài chục mili giây. Với 50 request tuần tự, tổng thời gian của 2 replica và 3 replica gần nhau, vì mỗi lúc chỉ có một request được xử lý, nút thắt là `curl`, Ingress và một PostgreSQL duy nhất. Nếu số của bạn khác, hãy nêu bằng chứng cho nút thắt bạn nghĩ tới (ví dụ so thời gian khi gọi thẳng `port-forward` với khi gọi qua Ingress). Cuối bước đo phải `kubectl scale ... --replicas=2`.

**Phần 3 – Ba sự cố.** Với mỗi sự cố, dưới đây là đáp án mẫu dạng troubleshooting log 5 trường (ASCII để dán vào file nộp). Phần "Dự đoán trước" của bạn phải là của chính bạn.

Sự cố A, xóa một Pod backend:

```text
Su co: A - xoa mot Pod club-api
Du doan truoc khi chay: Deployment tao Pod moi, nguoi dung van thay 200 nho Pod con lai
Trieu chung: chuoi ma HTTP lien tuc 200; Pod moi o ContainerCreating roi Running
Nguyen nhan goc: khong co loi; day la hanh vi thiet ke cua Deployment (ReplicaSet duy tri so replica)
Cach xac minh: kubectl get pods -l app=club-api (theo doi), vong lap curl in ma HTTP
Cach sua: khong can sua
Phong tranh: giu it nhat 2 replica va readiness probe dung de Service chi gui traffic toi Pod san sang
```

Điều cần giải thích trong `report.md`: người dùng không thấy lỗi vì Service chỉ chọn Pod đã Ready và còn một Pod phục vụ. Lưu ý trung thực: vì cập nhật danh sách endpoint không tức thời, có thể thấy một vài mã 502 hoặc 503 thoáng qua; nếu thấy thì ghi lại đúng như quan sát thay vì sửa cho khớp lý thuyết.

Sự cố B, sai tag image:

```text
Su co: B - sai tag image
Du doan truoc khi chay: Pod moi khong keo duoc image, Pod cu van phuc vu
Trieu chung: Pod moi ErrImagePull roi ImagePullBackOff; hai Pod cu van Running
Nguyen nhan goc: tag club-api:9.9.9 khong ton tai trong node kind va khong co tren registry
Cach xac minh: kubectl describe pod (Events: Failed to pull image), kubectl get events --sort-by=.lastTimestamp
Cach sua: kubectl rollout undo deployment/club-api -n club
Phong tranh: dung tag SHA hoac semver tu CI, kiem tra tag truoc khi set image, kind load image truoc khi deploy
```

Nguyên nhân gốc là tag không tồn tại, không phải "Pod ImagePullBackOff" (đó là triệu chứng). Người dùng không bị gián đoạn vì rolling update mặc định cho phép tối đa 25% Pod tăng thêm và 25% Pod không sẵn sàng; với 2 replica điều đó có nghĩa là tạo thêm một Pod mới nhưng chưa tắt Pod cũ nào.

Sự cố C, sai mật khẩu database:

```text
Su co: C - sai mat khau database
Du doan truoc khi chay: Pod moi khoi dong nhung khong ket noi duoc DB, readiness fail
Trieu chung: Pod moi Running nhung 0/1 READY, khong restart; hai Pod cu van 1/1
Nguyen nhan goc: bien moi truong DB_PASSWORD lay tu Secret khong khop mat khau PostgreSQL da khoi tao tren PVC
Cach xac minh: kubectl exec vao Pod moi goi /api/members (500); kubectl logs cua dung Pod moi co loi xac thuc
Cach sua: tao lai Secret voi mat khau goc, kubectl rollout restart deployment/club-api
Phong tranh: khong sua Secret bang tay tren cluster dang chay; thu thay doi tren moi truong test, co smoke test sau deploy
```

Ba điểm dễ sai của sự cố này: (1) phải xem log của Pod mới, không phải `kubectl logs deployment/club-api` vì lệnh đó có thể chọn Pod cũ; (2) `/ready` không in log lỗi, chỉ route `/api/members` mới ghi lỗi, và request qua Ingress không tới Pod chưa Ready, nên phải gọi trực tiếp vào Pod bằng `kubectl exec`; (3) sau khi khôi phục Secret phải `rollout restart` vì biến môi trường chỉ đọc khi container khởi động. Mật khẩu gốc lưu trong biến shell `ORIG_PW` và không được in ra evidence; nếu lệnh của bạn hiển thị, che bằng `***`.

Chín đoạn output có nhãn (trước, trong, sau cho từng sự cố) là yêu cầu bắt buộc. Cách làm gọn: viết một hàm shell in dòng nhãn, ví dụ `=== Su co B - trong luc loi ===`, rồi chạy lệnh với `tee -a evidence/command-output.txt`. Kết thúc bằng `kubectl get pods -n club` khỏe mạnh và một `curl` trả 200.

**Phần 4 – Log, bảo mật, hiệu năng.** Cách đọc kết quả của bốn lệnh bảo mật:

| Lệnh | Kết quả đạt | Cách đánh giá khi có output |
| --- | --- | --- |
| `git ls-files` lọc `.env` | Không in gì | Có output thì Không đạt, phải rotate secret |
| `git log -p --all \| grep -i -E "password\|secret\|token" \| grep -v ...` | Rỗng, hoặc chỉ dòng mô tả | Với mỗi dòng: văn bản mô tả (chấp nhận được) hay giá trị thật (Không đạt)? Ghi lý do từng dòng |
| `docker run --rm club-api:1.0.0 id` | `uid=1000(node)` | `uid=0` là Không đạt |
| `grep -n -A3 "^permissions" .github/workflows/*.yml` | Có khối `permissions`, chỉ cấp quyền cần thiết | Thiếu khối nghĩa là workflow dùng quyền mặc định rộng hơn cần |

Bảng 5 hạng mục trong `report.md` nên có trạng thái trung thực. Hạng mục quét image: nếu chưa chạy Trivy thì ghi "Chưa làm" kèm lý do và kế hoạch, thay vì ghi "Đạt". Hạng mục pin phiên bản: kiểm tra `image:` trong `compose.yaml` và `k8s/` không dùng `latest` làm tag duy nhất (starter-project dùng `postgres:17-alpine`, `club-api:1.0.0`).

**Phần 5 – Runbook.** Mỗi mục một lệnh đã chạy thật, kèm "khi nào dùng" và kết quả mong đợi, và chỉ cách lấy tên Pod thay vì cố định tên:

| Mục | Lệnh | Khi nào dùng | Kết quả mong đợi |
| --- | --- | --- | --- |
| Xem log | `kubectl logs -l app=club-api -n club --tail=20 --prefix` | Có lỗi 5xx hoặc Pod khởi động lại | Log kèm tên Pod nguồn |
| Xem events | `kubectl get events -n club --sort-by=.lastTimestamp` | Pod không Ready hoặc pull lỗi | Sự kiện mới nhất ở cuối |
| Rollout restart | `kubectl rollout restart deployment/club-api -n club` | Sau khi đổi Secret hoặc ConfigMap | `rollout status` báo thành công |
| Rollback | `kubectl rollout undo deployment/club-api -n club` | Bản mới lỗi (tag, cấu hình) | Pod quay về bản trước |
| Scale | `kubectl scale deployment club-api -n club --replicas=3` | Tăng hoặc giảm tải | Số Pod Ready bằng số replica |

Runbook không được chứa mật khẩu, token hay tên Pod cố định như `club-api-7d9f8b6c5-abcde`.

#### Lời giải phần L2

Thử thách là thiết kế một failure injection mới cho nhóm bạn. Các ý dưới đây không nằm trong gợi ý của bài lab và đều có một lệnh gây lỗi, một lệnh hoàn tác (chưa chạy lại trên kind khi viết tài liệu, hãy tự chạy thử trước khi giao):

| Kịch bản | Cách gây | Triệu chứng người nhận thấy | Nguyên nhân gốc | Hoàn tác |
| --- | --- | --- | --- | --- |
| Service trỏ nhầm Pod | Sửa `selector` của Service `backend` thành nhãn không tồn tại | Mọi Pod `Running` và `1/1`, nhưng `/api/` qua Ingress lỗi 503 | Service không có endpoint nào | `kubectl apply -f k8s/backend.yaml` |
| Sai tên key trong Secret | Đổi `key` trong `secretKeyRef` sang tên không có | Pod mới ở `CreateContainerConfigError`, Pod cũ vẫn phục vụ | Key không tồn tại trong Secret | `kubectl rollout undo deployment/club-api -n club` |
| Sai cổng của readiness | Đổi `port` của readinessProbe sang cổng khác | Pod mới `0/1`, event báo probe bị từ chối kết nối | Probe gọi cổng ứng dụng không lắng nghe | `kubectl rollout undo deployment/club-api -n club` |

Cách chấm báo cáo 5 mục của nhóm nhận: có đi từ trạng thái, sự kiện, log tới cấu hình không (và có bỏ bước nào không); nguyên nhân gốc có phân biệt với triệu chứng không; có lệnh và output làm bằng chứng không; cách sửa có đúng cách hoàn tác không. Một chẩn đoán tốt bắt đầu bằng `kubectl get endpoints` khi Pod đều Ready mà vẫn lỗi.

#### Lời giải phần Phá lỗi và debug: `DB_HOST` sai chính tả

Triệu chứng nhận được: rollout treo, Pod mới `0/1`, web vẫn dùng được. Cây điều tra:

1. `kubectl get pods -n club`: Pod mới `Running`, `0/1`, không restart; hai Pod cũ `1/1`. Kết luận: tiến trình sống, readiness thất bại, nghi phụ thuộc DB.
2. `kubectl describe pod -n club -l app=club-api`: Events có `Readiness probe failed ... statuscode: 503`. Xác nhận `/ready` thất bại.
3. Gọi trực tiếp vào Pod mới bằng `kubectl exec TEN_POD_MOI -n club -- wget -qO- http://localhost:3000/api/members` (500), rồi `kubectl logs TEN_POD_MOI -n club --tail=20`: có dòng kiểu `getaddrinfo ENOTFOUND postgress` (hoặc `EAI_AGAIN`).
4. `kubectl get configmap club-config -n club -o yaml` rồi so với `kubectl get svc -n club`: `DB_HOST: postgress` không khớp Service `postgres`.

Nguyên nhân gốc: tên host trong ConfigMap sai nên DNS trong cluster không phân giải được, không phải lỗi code. Sửa: `kubectl apply -f k8s/configmap.yaml`, `kubectl rollout restart deployment/club-api -n club`, `kubectl rollout status ...`. Phòng tránh: giữ cấu hình trong Git và apply từ file thay vì `patch` tay, ghi log lý do khi `/ready` thất bại, thêm smoke test sau deploy.

#### Những hiểu lầm hay gặp ở buổi 31

| Hiểu lầm | Thực tế |
| --- | --- |
| "Chạy lại trên máy đang làm việc là đủ" | Máy đó có image cache, `.env`, volume cũ; chỉ clone mới lộ phụ thuộc chưa ghi lại |
| "Pod `0/1` không restart nghĩa là treo" | Readiness fail chỉ loại Pod khỏi Service; liveness `/health` vẫn 200 nên không restart. Đó là thiết kế có chủ đích |
| "Liveness nên gọi `/ready` cho chặt" | Liveness phụ thuộc DB thì DB gián đoạn sẽ làm restart toàn bộ backend, làm tình hình tệ hơn |
| "Đổi Secret là app tự dùng giá trị mới" | Biến môi trường chỉ đọc khi container khởi động; cần `rollout restart` |
| "Thêm replica luôn nhanh hơn" | Chỉ giúp khi CPU của backend là nút thắt và có nhiều request đồng thời |
| "Ghi `ImagePullBackOff` là nguyên nhân gốc" | Đó là triệu chứng; nguyên nhân gốc là tag không tồn tại hoặc chưa `kind load` |
| "Quét `grep password` ra dòng nào cũng là lộ secret" | Phải đọc từng dòng; văn bản mô tả khác giá trị thật |

---

### Buổi 32 – Final Demo & Review

#### Đáp án các nhiệm vụ L1

**Checklist Definition of Done để kiểm tra trước demo.** Đối chiếu từng mục với bằng chứng chạy được bằng một lệnh hoặc một thao tác, theo mục 5 của [đề bài Capstone](../../assignments/capstone/README.md):

| Mục | Cách kiểm chứng nhanh | Lỗi tích hợp thường gặp |
| --- | --- | --- |
| Clone sạch chạy được bằng Compose | Clone thư mục mới, làm theo README | Thiếu `.env.example`; thiếu bước trong README |
| CRUD qua API và giao diện | `curl` bảy mã trạng thái; thêm và xóa trên web | Frontend đọc sai tên trường; cache trình duyệt giữ bản HTML cũ |
| Dữ liệu persistent | `down` rồi `up`, `GET` | Dùng nhầm `down -v`; đọc trước khi `/ready` |
| CI chặn merge khi test fail | PR đỏ không merge được | Chưa chọn check bắt buộc, hoặc tên check lệch với tên job |
| Image publish lên GHCR | Trang Packages có tag `sha-` | `context` còn `starter-project/`; thiếu `packages: write` |
| Triển khai trên kind, truy cập từ browser | `kubectl get pods,svc,ingress -n club`, mở `club.localhost` | Chưa `kind load`; thiếu `extraPortMappings`; cổng 80 bận; chưa nạp schema |
| Scale 2 lên 3 và quay lại | `kubectl scale`, `rollout status`, trả về 2 | Quên trả về 2 sau khi đo |
| Có troubleshooting log | Ít nhất 3 sự cố đủ 5 trường | Nguyên nhân chỉ là nhắc lại triệu chứng |
| Không secret trong lịch sử Git | `git log -p --all` quét, `git ls-files` | Chỉ xóa file ở commit sau mà không rotate |
| Mỗi người có PR và review | `git shortlog -sn --no-merges`, danh sách PR | Review chỉ ghi "OK" |

**Cách chia việc cho buổi demo.** Mỗi thành viên ít nhất một đoạn theo bảng phút của [demo-guide](../../assignments/capstone/demo-guide.md). Phân công hợp lý theo kinh nghiệm: người làm Compose nói phần Compose, nhưng khi bảo vệ mentor có thể chỉ định ai cũng được, nên cả nhóm luyện đổi vai ở buổi 31.

**Trạng thái xuất phát.** Chọn một trong hai và thống nhất: (a) cluster có sẵn, image đã nạp, chưa apply manifest để triển khai trên màn hình; (b) đã triển khai, chỉ trình bày kiểm tra. Nếu chọn (a), nhớ có bước nạp schema vào `postgres-0` trong kịch bản, nếu không API sẽ trả 500 ngay giữa buổi demo.

**Preflight.** `docker ps --format '{{.Names}}\t{{.Ports}}'` không có container lạ chiếm cổng 8080; `docker compose config --quiet`; `kind get clusters`, `kubectl get ns club`, `kubectl config current-context` bắt đầu bằng `kind-`; `docker image ls club-api` có tag phiên bản; working tree sạch trên `main`. Video dự phòng 2 đến 3 phút và ảnh chụp run Actions xanh được lưu trước.

**Sự cố do mentor chọn.** Bảng chẩn đoán nhanh để luyện (mỗi sự cố mục tiêu dưới 2 phút):

| Sự cố | Bước đầu | Bằng chứng cần nêu | Sửa |
| --- | --- | --- | --- |
| Sai tag image | `kubectl get pods -n club`, `kubectl describe pod` | Events: không kéo được image; Pod cũ vẫn Running | `kubectl rollout undo deployment/club-api -n club` |
| Sai mật khẩu DB | Pod mới `0/1`; `kubectl logs` của Pod mới | Log có lỗi xác thực; Pod cũ vẫn phục vụ | Khôi phục Secret, `rollout restart` |
| Readiness fail | `kubectl describe pod`; `kubectl get endpoints backend -n club` | Probe trả 404 hoặc bị từ chối; endpoints thiếu Pod mới | `rollout undo` hoặc sửa đường dẫn probe |

Cấu trúc câu trả lời nên theo ba bước kết luận, lý do, bằng chứng (lệnh hoặc file). Nếu quá hai phút chưa xong, nói rõ và chuyển sang video dự phòng; không xóa sạch làm lại mà không giải thích.

**Peer review và lessons learned.** Nhận xét tốt nêu sự việc cụ thể (PR, Issue, commit) và hành vi quan sát được; nhận xét kém chung chung hoặc đánh giá con người. Lessons learned tốt gắn với một sự việc, ví dụ "PR đổi tên trường làm cột Name trống vì không có smoke test với DB thật" thay vì "làm việc nhóm tốt hơn".

#### Lời giải phần L2

**Failure injection tự chọn: xóa Pod PostgreSQL.** Dự đoán đúng gồm ba điều: Pod `postgres-0` được tạo lại bởi StatefulSet; dữ liệu còn vì PVC `postgres-pvc` không bị xóa và Pod mới gắn lại đúng PVC đó; người dùng thấy lỗi vài giây khi Pod chưa Ready (API trả 500 hoặc 502), sau đó hồi phục. Quan sát thêm đã gặp khi kiểm chứng với starter-project: khi PostgreSQL ngắt kết nối đột ngột, tiến trình backend có thể thoát vì pool chưa xử lý sự kiện `error`, nên có thể thấy `RESTARTS` của Pod `club-api` tăng thêm 1. Bằng chứng cần nộp: `kubectl get pvc -n club` trước và sau (cùng một PVC, trạng thái `Bound`), dữ liệu truy vấn được trước và sau. Không xóa PVC trong thử thách này; xóa PVC là hành động mất dữ liệu có chủ ý.

**Đề xuất cải tiến có ưu tiên.** Ví dụ danh sách đạt yêu cầu (mỗi mục phải kèm bằng chứng và ước lượng của riêng bạn):

| Thứ tự | Đề xuất | Vấn đề quan sát được | Công sức ước lượng | Ưu tiên |
| --- | --- | --- | --- | --- |
| 1 | Thêm bộ lắng nghe `error` cho connection pool và thử lại kết nối | Backend thoát khi PostgreSQL bị ngắt đột ngột | 1 đến 2 giờ | Cao |
| 2 | Thêm quét image vào CI, fail khi có lỗ hổng Critical | Hạng mục quét image còn "Chưa làm" | 2 đến 3 giờ | Cao |
| 3 | Smoke test sau deploy kiểm tra tên trường JSON | Sự cố đổi tên trường qua mặt test | 1 đến 2 giờ | Trung bình |
| 4 (khóa học) | Nêu rõ bước nạp schema trên Kubernetes ngay trong buổi 30 | Pod Ready nhưng API 500 | 1 giờ | Cao |
| 5 (khóa học) | Thêm ví dụ đọc `describe` và events có output mẫu | Học viên phải đoán khi đọc events | 2 giờ | Trung bình |

Đoạn lập luận ưu tiên nên giải thích vì sao mục đứng đầu quan trọng hơn mục đứng cuối, dựa trên tác động tới người dùng và độ dễ sửa.

**Hai câu mở rộng.**

1. Nút thắt đầu tiên: một instance PostgreSQL duy nhất cùng kích thước connection pool mặc định của thư viện (mỗi backend giữ tối đa một số kết nối cố định), và `GET /api/members` trả toàn bộ danh sách không phân trang. Kiểm chứng bằng cách đo: số kết nối đang dùng trong PostgreSQL (`pg_stat_activity`), thời gian truy vấn khi bảng lớn, và chạy tải song song (nhiều request đồng thời, không phải vòng lặp tuần tự) để so thời gian theo số replica.
2. Chuyển từ kind sang cluster thật: image registry (kéo từ GHCR thay vì `kind load`, cần `imagePullSecrets` nếu image riêng tư); Secret (quản lý bằng công cụ chuyên dụng hoặc secret manager, không tạo tay bằng `kubectl create`; nhớ Secret chỉ mã hóa base64, không phải mã hóa); Ingress (domain thật, TLS, nhiều replica của ingress controller); lưu trữ (StorageClass động, sao lưu định kỳ, có thể dùng cơ sở dữ liệu quản lý thay vì một StatefulSet một instance).

#### Lời giải phần Phá lỗi và debug: mất dữ liệu sau `down -v`

Cây điều tra: (1) `docker volume ls`: `postgres-data` có thời điểm tạo mới; (2) xem lịch sử lệnh của terminal để tìm cờ `-v`; (3) `docker compose logs postgres`: thấy khởi tạo database mới và chạy `init.sql`. Nguyên nhân gốc: `-v` xóa named volume, dữ liệu nằm trong volume chứ không nằm trong container. Phòng tránh: chỉ dùng `down` bình thường, có script seed để dựng lại dữ liệu demo, sao lưu bằng `pg_dump` trước thao tác nguy hiểm, không dọn dẹp ngay trước demo.

Tình huống 2, lệnh bất ngờ lỗi trước mặt mentor: nói to điều thấy, đọc log và events, nêu giả thuyết, kiểm chứng. Quá hai phút thì chuyển sang video dự phòng và nói rõ lý do.

#### Gợi ý câu trả lời bảo vệ kỹ thuật

Dùng cấu trúc kết luận, lý do, bằng chứng. Phần bằng chứng là lệnh hoặc file trong repo của nhóm mình, nên bảng sau chỉ gợi ý hướng; không nên đọc thuộc.

| Câu hỏi | Kết luận và lý do ngắn | Bằng chứng ở đâu |
| --- | --- | --- |
| Liveness khác readiness? | Readiness quyết định Pod có nhận traffic không; liveness quyết định Pod có bị restart không. Liveness không nên phụ thuộc DB | Phần `readinessProbe` và `livenessProbe` trong `k8s/backend.yaml` |
| `down` khác `down -v`? | `down` giữ volume, `down -v` xóa volume nên mất dữ liệu | `compose.yaml` (volume `postgres-data`), thử lại bằng `docker volume ls` |
| Backend gọi PostgreSQL bằng tên gì? | `postgres`, phân giải bằng DNS nội bộ của network `club-network` (hoặc Service `postgres` trên k8s) | `DB_HOST` trong `compose.yaml` và `k8s/configmap.yaml` |
| Secret có thực sự bí mật? | Không; Secret chỉ mã hóa base64, bảo vệ bằng phân quyền, mã hóa at-rest và quản lý bằng công cụ chuyên dụng | `kubectl get secret club-secrets -n club -o yaml` (chỉ làm trên môi trường test) |
| Truy ngược từ Pod về commit? | Tag image là SHA hoặc phiên bản gắn với commit | `kubectl describe pod` cho thấy image; đối chiếu tag trên GHCR và `git log` |
| Dữ liệu còn khi xóa Pod PostgreSQL? Khi xóa PVC? | Xóa Pod: còn, vì StatefulSet gắn lại PVC. Xóa PVC: mất | `kubectl get pvc -n club` |
| Vì sao dùng `GITHUB_TOKEN`? | Token sinh tự động, hết hạn khi job kết thúc, chỉ có quyền đã khai báo | Khối `permissions` trong `publish.yml` |
| Rolling update giữ Pod cũ thế nào? | Chỉ tắt Pod cũ khi Pod mới Ready; `maxSurge` là số Pod thêm, `maxUnavailable` là số Pod được phép không sẵn sàng | Quan sát khi sự cố B; `kubectl rollout undo` để rollback |

#### Những hiểu lầm hay gặp ở buổi 32

| Hiểu lầm | Thực tế |
| --- | --- |
| "Demo bằng ảnh chụp cũng được" | Rubric chấm hệ thống chạy thật; video chỉ là dự phòng |
| "Một người nói thay cả nhóm cho nhanh" | Mentor có thể chỉ định bất kỳ ai trả lời bất kỳ phần nào |
| "Lỗi giữa demo thì xóa làm lại" | Cách xử lý lỗi rõ ràng được đánh giá cao hơn; không xóa làm lại mà không giải thích |
| "Đưa peer review vào repo cho minh bạch" | Chỉ mentor đọc; không đưa vào repo công khai |
| "Dọn dẹp bằng `down -v` trước demo cho sạch" | Mất dữ liệu demo; chỉ dọn khi có script seed |

---

### Bài tập tuần

Phần này gợi ý cách làm cho [bài tập tuần 16](../../assignments/weekly/week-16.md). Evidence luôn là output lệnh thật có dòng nhãn, ảnh chỉ bổ sung.

#### Nhiệm vụ L1

1. **Clean clone.** Dùng bảng của Phần 1 buổi 31 làm khung. Danh sách "điểm README cần sửa" phải cụ thể (tên bước, tên biến), hoặc ghi "không phát hiện" kèm lý do bạn tin như vậy.
2. **kind và độ trễ.** Evidence đủ: `kind get clusters`, `kubectl config current-context`, `kubectl get nodes`, `docker image ls club-api`, `kubectl rollout status`, `kubectl get pods,svc,ingress -n club`, năm dòng `curl -w`, hai kết quả `time`. Lưu ý bước nạp schema và việc trả replica về 2.
3. **Ba sự cố.** Dùng ba log mẫu của Phần 3 buổi 31 để so cấu trúc. Kiểm tra: dự đoán viết trước, nguyên nhân gốc không phải là triệu chứng, đủ chín đoạn output có nhãn, kết thúc ở trạng thái khỏe mạnh.
4. **Bảo mật và runbook.** Dùng bảng 4 lệnh và bảng runbook ở trên. Nếu chưa quét image, ghi "Chưa làm" trung thực.
5. **Demo và tự đánh giá.** `demo-commands.md` mỗi lệnh một dòng chú thích; log chạy thử có `date -Is` đầu và cuối; `links.md` có link PR đã review, run Actions xanh, package GHCR; lessons learned gắn với sự việc; peer review nộp riêng cho mentor.

#### Nhiệm vụ L2

- **A.** Xem bảng kịch bản ở lời giải L2 buổi 31 và tiêu chí chấm báo cáo của nhóm nhận. Cần có output bạn tự chạy thử và hoàn tác trước khi giao.
- **B.** Xem lời giải L2 buổi 32. Bắt buộc có dự đoán ghi trước, `kubectl get pvc` trước và sau, tên Pod lấy từ `kubectl get pods`.
- **C.** Dùng bảng cải tiến mẫu làm khung; số giờ phải là ước lượng của bạn và nêu cách ước lượng.

#### Đáp án năm câu hỏi kiểm tra

1. Clone mới chỉ có những gì nằm trong Git và README, trong khi máy làm việc có trạng thái ẩn. Hai ví dụ: thiếu `.env.example` khiến `docker compose up` báo thiếu `DB_PASSWORD`; image chưa `kind load` nên Pod `ImagePullBackOff`.
2. Readiness probe (`/ready`) chạy `SELECT 1` nên fail khi sai mật khẩu, khiến Service loại Pod khỏi danh sách endpoint; liveness probe (`/health`) chỉ báo tiến trình còn sống nên vẫn 200 và Pod không bị restart. Pod cũ vẫn Ready nên người dùng chưa thấy lỗi.
3. Chạy `kubectl rollout restart deployment/club-api -n club`, vì biến môi trường từ Secret chỉ được đọc khi container khởi động. Xác nhận mà không in mật khẩu: so sánh băm hoặc độ dài (ví dụ in `sha256sum` của giá trị trong Pod và của giá trị trong Secret, hoặc đơn giản là gọi `/api/members` trả 200 và Pod `1/1`).
4. `down` giữ named volume nên dữ liệu còn; `down -v` xóa volume nên mất. Xóa Pod `postgres-0` thì dữ liệu còn, vì StatefulSet tạo lại Pod và gắn lại PVC `postgres-pvc`; PVC là thành phần quyết định.
5. Ví dụ với Dockerfile multi-stage: kết luận (image cuối chỉ chứa runtime và `node_modules` production), lý do (giảm kích thước và bề mặt tấn công), bằng chứng (`grep -n -E '^FROM' backend/Dockerfile`, `docker history`). Với CI: kết luận (PR chạy ba lớp kiểm tra), lý do, bằng chứng (`ci.yml` và tab Actions).

---

### Hướng dẫn chấm cho mentor

Chấm bằng bằng chứng text trong `evidence/`, đối chiếu với repo nhóm. Điểm cá nhân nên phản ánh khả năng giải thích một phần mình không trực tiếp viết.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Clean clone và Compose | `pwd` và `git log` ở thư mục mới; `docker compose ps` có `healthy`; ba mã smoke test; chuỗi `down`, `up`, đọc lại; danh sách điểm README cần sửa cụ thể | Dùng thư mục cũ, không có nhận xét README, kết luận dữ liệu còn nhưng dùng `-v` | "Làm sao tôi biết bạn không dùng kiến thức ngoài README?" "Vì sao cần chờ `/ready`?" |
| kind và độ trễ | Context bắt đầu bằng `kind-`; image có tag phiên bản; mọi Pod Ready; 5 dòng `curl -w`; hai số `time`; replica trả về 2 | Dùng `latest`, số liệu không có lệnh `time`, kết luận "thêm replica nhanh hơn" không có số đo | "Vì sao hai số gần nhau?" "Muốn thấy lợi ích của replica thì đo thế nào?" |
| Ba sự cố | Chín đoạn output có nhãn; troubleshooting log 5 trường kèm dự đoán; Secret gốc được khôi phục; kết thúc khỏe mạnh | Dự đoán giống hệt đáp án, nguyên nhân gốc là triệu chứng, xem log của Pod cũ rồi kết luận không lỗi | "Vì sao Pod mới `0/1` mà không restart?" "Sao bạn gọi trực tiếp vào Pod mới?" "Sau khi sửa Secret làm gì tiếp?" |
| Bảo mật và runbook | Output bốn lệnh kiểm tra; bảng 5 hạng mục trung thực; runbook đủ 5 mục dùng lệnh đã chạy | Ghi "Đạt" không có output, quét image khai nhưng không có kết quả, runbook dùng tên Pod cố định | "Dòng này trong kết quả `grep` là gì, vì sao chấp nhận?" "Vì sao liveness không gọi `/ready`?" |
| Demo, bảo vệ, tự đánh giá | Log chạy thử có bấm giờ; `demo-commands.md` khớp tên service và nhãn; lessons learned gắn sự việc; có xác nhận đã nộp peer review | Lessons learned chung chung, lệnh không khớp manifest, peer review nằm trong repo | "Truy ngược từ Pod đang chạy về commit thế nào?" "Chuyện gì xảy ra khi xóa `postgres-0`? Khi xóa PVC?" |

Mẹo kiểm tra nhanh: yêu cầu học viên chạy lại một sự cố bất kỳ ngay tại chỗ và đọc to điều quan sát; người thực sự đã làm sẽ đi đúng thứ tự trạng thái, sự kiện, log, cấu hình. Đối chiếu thời gian trong `date -Is` với lịch sử commit để thấy log có phải làm thật hay không. Nhớ rằng Capstone chấm theo [rubric](../../curriculum/capstone-rubric.md) tiêu chí 7 (Troubleshooting) và 10 (Demo và technical defense).
