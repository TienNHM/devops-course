# Kịch bản mentor – Buổi 31: Testing & Troubleshooting

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 31 – Testing & Troubleshooting](../../labs/week-16/session-31.md) và [Buổi 31 – Thử thách nâng cao](../../labs/week-16/session-31-challenge.md). Slide: [Slide buổi 31](../../slides/08-capstone/session-31.md). Đáp án: [Walkthrough tuần 16](../walkthroughs/week-16.md). Chấm bài: [Chấm bài tuần 16](../grading/week-16.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 31: khung thời gian, demo của mentor, câu hỏi cho lớp, ghi chú giảng viên theo từng slide và kịch bản gây lỗi cho tình huống phá lỗi. Nội dung chuyển nguyên văn từ bài lab và slide cũ.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ gợi ý theo ghi chú slide: mở buổi 2 phút, vấn đề thực tế 2 phút, các tầng kiểm thử 2 phút, failure injection 2 phút, quy trình chẩn đoán 2 phút, kiến trúc 2 phút, readiness và liveness 3 phút, ba phần demo 3 phút mỗi phần.

Lab 60 phút (phân bổ gốc của bài lab): Phần 1 khoảng 12 phút, Phần 2 khoảng 8 phút, Phần 3 khoảng 20 phút, Phần 4 khoảng 12 phút, Phần 5 khoảng 8 phút. Phần 1 và 2 cho mọi nhóm, Phần 3 đến 5 là phần chính của mốc M3. Nếu kind đã dựng sẵn từ buổi 30, Phần 2 chỉ là kiểm tra lại. Bản học viên chia lại thành Chuẩn bị 5 phút, Phần 1 10 phút, Phần 2 7 phút, Phần 3 20 phút, Phần 4 10 phút, Phần 5 8 phút.

Buổi này làm theo nhóm 3-4 người; mỗi người nộp bài lab riêng trong repo cá nhân. Mỗi nhóm chọn một "người điều khiển" cho mỗi phần và đổi vai sau mỗi phần; cả nhóm nhìn chung một màn hình hoặc mỗi người tự chạy trên máy mình.

## Demo của mentor

Mentor dùng cụm kind đã dựng sẵn với manifest của `starter-project/k8s/` (namespace `club`). Mục tiêu demo: cho lớp thấy một chu trình đầy đủ "dự đoán, phá, quan sát, sửa".

1. Cho lớp xem trạng thái khỏe mạnh.

   ```bash
   kubectl get pods -n club
   curl -s http://club.localhost/api/members
   ```

   Kết quả mong đợi (rút gọn): hai Pod `club-api` `1/1 Running`, một `club-web`, một `postgres-0`; API trả mảng JSON có Alice và Bob.

   Hỏi lớp: "Nếu tôi xóa một Pod club-api, người dùng có thấy lỗi không? Dự đoán trước khi tôi chạy."

2. Xóa một Pod backend và quan sát.

   ```bash
   kubectl delete pod -n club -l app=club-api --field-selector=status.phase=Running --wait=false
   kubectl get pods -n club -w
   ```

   Kết quả mong đợi: các Pod `club-api` chuyển `Terminating`, Pod mới xuất hiện `ContainerCreating` rồi `Running`. Nhấn Ctrl+C để thoát chế độ theo dõi. Lưu ý lệnh này xóa cả hai Pod nên có khoảng ngắn không có backend; hãy nói rõ điều đó với lớp (người dùng có thể thấy lỗi 502/503 trong khoảnh khắc đó). Ở Sự cố A trong lab, nhóm chỉ xóa một Pod để thấy sự khác biệt.

   Hỏi lớp: "Vì sao tôi nên xóa từng Pod một thay vì cả hai? Replica thứ hai giúp gì?"

3. Đổi sang tag không tồn tại.

   ```bash
   kubectl set image deployment/club-api api=club-api:9.9.9 -n club
   kubectl get pods -n club
   kubectl describe pod -n club -l app=club-api | grep -A3 -i "failed\|back-off"
   ```

   Kết quả mong đợi (rút gọn): một Pod mới ở `ErrImagePull` rồi `ImagePullBackOff`, hai Pod cũ vẫn `Running` vì rolling update không tắt Pod cũ khi Pod mới chưa Ready.

   Hỏi lớp: "Người dùng có bị gián đoạn không? Vì sao?"

4. Hoàn tác và chứng minh.

   ```bash
   kubectl rollout undo deployment/club-api -n club
   kubectl rollout status deployment/club-api -n club
   ```

   Kết quả mong đợi: `deployment "club-api" successfully rolled out`.

Chốt demo: ba lệnh `get`, `describe`, `events` đã đủ cho hai lỗi trên; chưa cần mở code.

## Câu hỏi mentor nên hỏi lớp

Các câu hỏi dưới đây gom từ demo và ghi chú slide, theo thứ tự trong buổi:

- Nhóm nào đã thử clone repo của mình sang một thư mục khác chưa?
- Trong repo của nhóm, thứ gì đang "ẩn" trên máy bạn mà chưa nằm trong Git? Gợi ý: `.env`, image đã build, volume, biến môi trường.
- Chỉ theo đường đi của một request: nếu Pod 1 hỏng, request đi đâu?
- Nếu liveness gọi `/ready`, DB gián đoạn 10 giây sẽ gây hậu quả gì? (Đáp: restart cả backend, tệ hơn.)
- Nếu tôi xóa một Pod club-api, người dùng có thấy lỗi không? (cho 30 giây dự đoán)
- Vì sao xóa từng Pod một thay vì cả hai? Replica thứ hai giúp gì?
- Người dùng có bị gián đoạn không khi dùng tag sai, vì sao? (Rolling update không tắt Pod cũ khi Pod mới chưa Ready.)
- Vì sao `0/1` mà không restart? (`/ready` trả 503, `/health` vẫn 200.)

## Ghi chú giảng viên theo từng slide

Nguyên văn từ phần "Ghi chú giảng viên" của [Slide buổi 31](../../slides/08-capstone/session-31.md).

**Slide 1: Mục tiêu buổi học.** Mở buổi trong 2 phút. Nhấn mạnh: hôm nay là buổi "tự phá hệ thống của mình". Nhắc đây là mốc M3 của capstone. Hỏi lớp: nhóm nào đã thử clone repo của mình sang một thư mục khác chưa?

**Slide 2: Vấn đề thực tế - "chạy trên máy tôi".** Kể câu chuyện trong 2 phút. Câu hỏi cho lớp: trong repo của nhóm, thứ gì đang "ẩn" trên máy bạn mà chưa nằm trong Git? Gợi ý: `.env`, image đã build, volume, biến môi trường.

**Slide 3: Kiểm thử không chỉ là npm test.** Happy path chỉ là một dòng trong bảng. Phần lớn lỗi thật nằm ở các dòng còn lại. 2 phút.

**Slide 4: Failure injection và quy tắc an toàn.** Yêu cầu học viên viết dự đoán ra giấy trước mỗi sự cố. So sánh dự đoán với thực tế mới là phần học được. 2 phút.

**Slide 5: Quy trình chẩn đoán từ ngoài vào trong.** `TEN_POD` là tên Pod thật, ví dụ `club-api-7d9f8b6c5-abcde`. Đề nghị cả lớp thuộc thứ tự này: get, describe, logs, config. 2 phút.

**Slide 6: Kiến trúc hệ thống đang kiểm thử.** Chỉ theo đường đi của một request. Hỏi: nếu Pod 1 hỏng, request đi đâu? 2 phút.

**Slide 7: Readiness và liveness trong dự án.** Đây là kiến thức nền cho sự cố B và C. Câu hỏi: nếu liveness gọi `/ready`, DB gián đoạn 10 giây sẽ gây hậu quả gì? (Đáp: restart cả backend, tệ hơn.) 3 phút.

**Slide 8: Demo 1 - trạng thái khỏe mạnh.** Hỏi lớp trước khi chạy bước sau: "Nếu tôi xóa một Pod club-api, người dùng có thấy lỗi không?" Cho 30 giây dự đoán.

**Slide 9: Demo 2 - xóa Pod backend.** Nói rõ với lớp vì sao demo này khác sự cố A. Hỏi: replica thứ hai giúp gì? Ctrl+C để thoát chế độ theo dõi. 3 phút.

**Slide 10: Demo 3 - tag image không tồn tại, rồi hoàn tác.** Hỏi: người dùng có bị gián đoạn không, vì sao? (Rolling update không tắt Pod cũ khi Pod mới chưa Ready.) 3 phút.

**Slide 11: Lab Phần 1 - clean-clone test (Compose).** Phần này khoảng 12 phút. Nếu `.env` bị liệt kê trong Git thì dừng lại, đó là lỗi bảo mật phải xử lý trước. Thay `ORG/club-management` bằng repo nhóm khi đặt `REPO_URL`.

**Slide 12: Lab Phần 1 - smoke test và dữ liệu bền.** Nếu API nhóm chưa có POST, kiểm tra dữ liệu mẫu Alice và Bob còn nguyên. Trước khi sang kind, nhắc chạy `docker compose down` để tránh tranh chấp cổng.

**Slide 13: Lab Phần 2 - triển khai lên kind.** Mật khẩu phải khớp mật khẩu PostgreSQL đã khởi tạo trên PVC. Nếu dùng lại PVC cũ với mật khẩu khác, backend sẽ không vào được DB. Đo độ trễ bằng vòng lặp 5 request curl với `-w "%{http_code} %{time_total}s\n"`.

**Slide 14: Lab Phần 3 - sự cố A và B.** Chạy A và B tuần tự, không song song. Giữa hai sự cố, xác nhận cluster đã khỏe lại bằng `kubectl get pods`. Khoảng 10 phút cho hai sự cố.

**Slide 15: Lab Phần 3 - sự cố C, sai mật khẩu DB.** Điểm hay: vì sao `0/1` mà không restart? `/ready` trả 503, `/health` vẫn 200. Nhắc `unset ORIG_PW` sau khi hoàn tác. Biến môi trường từ Secret chỉ đọc khi container khởi động nên phải `rollout restart`.

**Slide 16: Lab Phần 4 và 5 - log, bảo mật, ghi nhận.** Nếu có Trivy, quét image và ghi số lỗ hổng HIGH và CRITICAL. Với phần scale: 50 request tuần tự cho kết quả gần nhau trước và sau khi thêm replica, vì nút thắt là client, Ingress và một PostgreSQL.

**Slide 17: Phá lỗi và debug - rollout treo mãi.** Mentor gây lỗi bằng `kubectl patch configmap club-config` đổi `DB_HOST` thành `postgress` rồi `rollout restart` (học viên không biết). Nguyên nhân gốc: tên host sai nên DNS không phân giải. Sửa bằng `kubectl apply -f k8s/configmap.yaml` và `rollout restart`. Tham khảo scenario-03 và scenario-10.

**Slide 18: Lỗi thường gặp.** Cho lớp 2 phút đọc bảng, hỏi dòng nào đã gặp. Cảnh báo: xóa PVC để đổi mật khẩu sẽ mất dữ liệu, chỉ làm khi test.

**Slide 19: Challenge (L2) - ra đề cho nhóm bên cạnh.** Gợi ý nhắc: với trường manifest gốc không có (như `nodeSelector`), ưu tiên `kubectl rollout undo` để hoàn tác. Duyệt kịch bản của từng nhóm trước khi chạy.

**Slide 20: Recap.** Chốt buổi, 2 phút. Nhắc nộp `lab-31/` trong repo cá nhân và chuẩn bị cho buổi 32: chạy thử kịch bản demo có bấm giờ.

## Tình huống phá lỗi do mentor chạy: DB_HOST sai chính tả

Tình huống: mentor đổi `DB_HOST` trong ConfigMap thành `postgress` (thừa một chữ `s`) rồi restart backend.

Cách phá (mentor chạy, học viên không biết):

```bash
kubectl patch configmap club-config -n club --type=merge -p '{"data":{"DB_HOST":"postgress"}}'
kubectl rollout restart deployment/club-api -n club
```

Triệu chứng học viên nhận được: "Sau khi áp dụng cấu hình mới, `kubectl rollout status` treo mãi, `kubectl get pods` cho thấy một Pod backend mới `0/1` Ready; web vẫn dùng được nhưng nhóm không biết vì sao rollout không xong."

Hướng điều tra, từng bước:

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

Cách phòng tránh: giữ cấu hình trong Git và `kubectl apply` từ file thay vì `patch` tay; làm cho `/ready` ghi log lý do thất bại; thêm smoke test sau deploy. Xem thêm các kịch bản tương tự trong `examples/troubleshooting/` (ví dụ scenario-03: API không kết nối được DB, scenario-10: readiness probe fail).

## Lưu ý riêng cho người dạy

- Đây là mốc M3 của capstone: tiêu chí liên quan là Troubleshooting và Security trong [Rubric Capstone](../../curriculum/capstone-rubric.md); xem thêm [Milestones](../../assignments/capstone/milestones.md).
- Duyệt kịch bản failure injection L2 của từng nhóm trước khi chạy; chỉ chạy trên cluster của nhóm nhận.
- Đáp án mẫu và kịch bản L2 (kể cả lời giải đổi readiness path) nằm ở [Walkthrough tuần 16](../walkthroughs/week-16.md); không đưa cho học viên trước khi nộp bài.
- Khi chấm: log của Pod mới (không phải Pod cũ) và đủ chín đoạn output có nhãn là các điểm hay thiếu; xem [Chấm bài tuần 16](../grading/week-16.md).
