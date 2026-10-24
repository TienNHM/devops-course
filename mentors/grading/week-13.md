# Hướng dẫn chấm tuần 13 – Configuration, Resources & Health

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài và bảng điểm ngắn: [Bài tập tuần 13](../../assignments/weekly/week-13.md). Đáp án: [Đáp án tuần 13](../walkthroughs/week-13.md). Kịch bản dạy: [buổi 25](../sessions/session-25.md), [buổi 26](../sessions/session-26.md).
:::

> **Tóm tắt:** Barem 100 điểm cho năm nhiệm vụ của tuần 13, lệnh kiểm tra nhanh, bảng bằng chứng và câu hỏi vấn đáp, lỗi hay bị trừ điểm và tiêu chí thưởng L2.

## Cách chấm

Bài tập tuần là nộp lại bằng chứng của hai lab, không có việc mới. Học viên được dùng tên trong lab (`app-settings`, `config-demo`, `oom-demo`, namespace `lab25`). Điều cần kiểm tra là output do lệnh thật tạo ra và lập luận bằng lời của học viên.

- Dấu hiệu bài không tự làm: output trùng hệt tài liệu, giá trị cấu hình giống hệt lab, tên Pod và timestamp trùng giữa hai bài, hoặc dùng đúng giá trị sai mà lab gợi ý (`postgres-db` cho `DB_HOST`, `/readyy` cho đường dẫn probe). Lab yêu cầu học viên chọn giá trị khác.
- Cluster là `club` (context `kind-club`). Pod thử nghiệm của buổi 25 nằm ở namespace `lab25`, còn `club-api` và `postgres` nằm ở `club`. Kiểm tra học viên đã đưa `club` về trạng thái khỏe cuối mỗi buổi.
- Thử thách L2 nằm ở trang riêng: [Buổi 25 – Thử thách nâng cao](../../labs/week-13/session-25-challenge.md) và [Buổi 26 – Thử thách nâng cao](../../labs/week-13/session-26-challenge.md).

## Lệnh kiểm tra nhanh

Chạy trong thư mục bài nộp của học viên (đã clone repo `devops-labs`):

```bash
git ls-files | grep -i secret
git grep -n -i -E "stringData|kind: Secret"
grep -n -E "OOMKilled|137|Readiness probe failed|successfully rolled out" lab-26/evidence/command-output.txt
grep -n -E "Liveness|Readiness|Startup|QoS Class" lab-26/evidence/command-output.txt
grep -n -E "ENOTFOUND|printenv|rollout status" lab-25/evidence/command-output.txt
```

Trên cluster của học viên (nếu chấm trực tiếp):

```bash
kubectl -n club get pods
kubectl -n club get endpoints backend
kubectl -n club get deploy club-api -o jsonpath='{.spec.template.spec.containers[0].livenessProbe.httpGet.path}{"\n"}'
```

Lệnh cuối phải in `/health`.

## Barem

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: ConfigMap, Secret, Pod nhận cấu hình | `source/config-demo.yaml` tự viết, đủ `env` và file mount, Secret tạo bằng lệnh và giải mã được | Thiếu cách nạp, Secret nằm trong file commit, hoặc output không khớp | 16 |
| Nhiệm vụ 2: hành vi cập nhật cấu hình | Có dự đoán viết trước, đo được thời gian file đổi, env đổi chỉ sau khi tạo lại Pod | Không có dự đoán, thiếu vòng lặp quan sát hoặc kết luận sai cơ chế | 14 |
| Nhiệm vụ 3: chẩn đoán `DB_HOST` sai | Đủ các bước điều tra, chứng minh dịch vụ còn chạy, khôi phục có xác nhận | Chỉ nêu "sai tên host" không có Events hoặc không khôi phục | 16 |
| Nhiệm vụ 4: requests, limits, ba probe | Manifest tự viết, đủ ba probe đúng endpoint, rollout thành công, giải thích con số | Thiếu probe, sai endpoint hoặc không giải thích được lựa chọn | 18 |
| Nhiệm vụ 5: OOMKilled và readiness fail | Có OOMKilled kèm 137, chẩn đoán readiness bằng Events và Endpoints, khôi phục | Thiếu một trong hai phần hoặc không có bằng chứng từ lệnh | 16 |
| Chất lượng report và 5 câu hỏi kiểm tra | 5 câu trả lời đúng, ngắn, có lý do | Trả lời chung chung hoặc sai khái niệm | 10 |
| An toàn dữ liệu (Secret, `.env`, token) | Repository sạch, `git ls-files` và `git grep` không thấy giá trị thật | Có mật khẩu hoặc Secret thật trong commit | 5 |
| Quy trình nộp | PR đúng cấu trúc, đã có review, nộp đúng hạn | Thiếu review, sai cấu trúc hoặc trễ hạn | 5 |
| Tổng L1 | | | 100 |
| Thưởng L2 | Xem mục "Thưởng L2" bên dưới | | tối đa 10 |

## Bằng chứng và câu hỏi vấn đáp

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1 (16 điểm) | `get configmap -o yaml` có đủ key, `DB_PORT` trong nháy; `describe secret` chỉ hiện byte; `printenv` trong Pod; `ls /etc/club`; `git grep` sạch | Secret nằm trong file YAML; giá trị giống hệt lab; `base64 -d` để lộ mật khẩu quan trọng | Vì sao `describe secret` không hiện giá trị mà `get -o yaml` vẫn lộ? Nếu cần commit manifest Secret lên Git, em làm cách nào? |
| Nhiệm vụ 2 (14 điểm) | `printenv` còn giá trị cũ ngay sau `patch`; vòng lặp 12 lần có thời điểm file đổi; `printenv` mới sau khi tạo lại Pod; dự đoán viết trước | Dự đoán viết sau (khớp hoàn toàn kết quả, không có nhầm lẫn nào); thời gian đúng bằng số trong lab; thiếu vòng lặp | Vì sao file đổi mà biến không đổi? Nếu Pod dùng `subPath` thì kết quả khác ra sao? |
| Nhiệm vụ 3 (16 điểm) | `get pods` có Pod `0/1` cùng Pod cũ `1/1`; Events `Readiness probe failed`; `ENOTFOUND` kèm tên sai; `printenv DB_HOST` và ConfigMap; `rollout status` và `/ready` sau khôi phục | Dùng đúng `postgres-db` của lab; thiếu bước `logs` hoặc `exec`; kết luận "sai host" không kèm Events | Vì sao log sạch mà Pod vẫn hỏng? Vì sao người dùng chưa thấy lỗi? Nếu không có readiness probe thì chuyện gì xảy ra? |
| Nhiệm vụ 4 (18 điểm) | `backend-deploy.yaml` đủ ba probe đúng endpoint; `describe` có ba dòng probe và `QoS Class`; `rollout status` 2/2 | Con số trùng hệt lab mà không giải thích được; liveness trỏ `/ready`; dùng `M` thay `Mi` | Vì sao em chọn các con số này? Startup tối đa bao nhiêu giây, tính thế nào? Muốn Guaranteed phải đổi gì? |
| Nhiệm vụ 5 (16 điểm) | `OOMKilled` và 137; logs dừng đột ngột; Pod mới `0/1` RESTARTS 0; Events kèm mã HTTP; `get endpoints` không có IP Pod mới; sau khôi phục đủ hai IP; `oom-demo` đã xóa | Dùng nguyên `/readyy` và lệnh cấp phát của lab; mã HTTP không khớp lỗi đã gây; thiếu bước khôi phục | Vì sao exit code là 137? 404, 503 và connection refused khác nhau ở điểm nào? Vì sao Endpoints vẫn có IP Pod cũ? |
| Report và 5 câu hỏi (10 điểm) | `report.md` có đủ 5 câu ngắn, có lý do | Câu trả lời chung chung, sao chép câu chữ của lab, nhầm requests với limits | Phân biệt readiness và liveness bằng ví dụ DB sập. |
| An toàn dữ liệu (5 điểm) | `git grep -n -i -E "stringData|kind: Secret"` không thấy giá trị thật | Mật khẩu thật trong `command-output.txt` sau bước `base64 -d` chưa che | Nếu lỡ commit Secret lên GitHub công khai thì làm gì ngay? |
| Quy trình nộp (5 điểm) | PR đúng cấu trúc, có review với ít nhất hai nhận xét cụ thể | PR không có review hoặc review chung chung | Reviewer đã chạy thử manifest nào? |

## Lỗi hay bị trừ điểm

- Output trong evidence do tự gõ hoặc sửa tay, không phải kết quả lệnh thật.
- Commit manifest Secret chứa giá trị thật, hoặc giải mã Secret rồi để mật khẩu quan trọng trong `command-output.txt`.
- Quên dấu nháy quanh giá trị số trong ConfigMap (`"5432"`), nên `apply` báo lỗi mà không xử lý.
- Tạo Secret bằng `echo` thay vì `echo -n` hoặc `--from-literal`, làm giá trị dính ký tự xuống dòng.
- Chỉ nêu "sai cấu hình" mà không chỉ ra dòng Events hoặc output chứng minh.
- Khẳng định "biến môi trường tự cập nhật" mà không có output kiểm chứng.
- Dùng đơn vị `M` thay vì `Mi`, hoặc đặt requests lớn hơn limits nên manifest bị từ chối.
- Trỏ liveness probe vào endpoint kiểm tra database mà không có lý do.
- Không khôi phục `club-config`, `club-api` hoặc `postgres` sau thí nghiệm, nên lab sau bị ảnh hưởng.
- Sửa Deployment bằng `kubectl edit` khiến file trong `source/` không khớp trạng thái cluster.
- Làm việc trong `/mnt/c`, dẫn tới lỗi quyền và chạy chậm.
- Nộp sát hạn mà PR chưa có người review.

## Thưởng L2

L2 là điểm thưởng, tối đa 10 điểm, chỉ chấm khi L1 đạt từ 70 điểm. Mỗi thử thách cần manifest hoặc lệnh tương ứng trong `source/` và output thật.

| Thử thách | Đạt khi | Điểm tối đa |
| --- | --- | --- |
| Buổi 25 A: mount một file bằng `subPath` | Output cho thấy Pod mount cả thư mục đổi file sau một khoảng đo được, còn Pod dùng `subPath` không đổi sau ít nhất 3 phút; giải thích cơ chế symlink `..data` và đề xuất thiết kế vừa có file cấu hình vừa tự cập nhật | 3 |
| Buổi 25 B: Secret mount quyền `0400` | `ls -lL` thấy `-r--------`, đọc được `db-password`; giải thích vì sao file ưu tiên hơn biến môi trường và nêu hai biện pháp tốt hơn base64 | 2 |
| Buổi 26 A: Guaranteed QoS | Output `Guaranteed` cho mọi Pod `club-api`; giải thích điều kiện của Guaranteed, thứ tự bị đuổi giữa ba QoS class, một ưu nhược điểm khi requests bằng limits | 3 |
| Buổi 26 B: liveness phụ thuộc DB | RESTARTS tăng trên cả hai Pod; Events `Liveness probe failed` và `will be restarted`; so sánh với cấu hình đúng; đã khôi phục cả Deployment và Postgres | 4 |
| Buổi 26 C: startupProbe sai cổng | Events `failed startup probe, will be restarted`; rollout treo, Pod cũ vẫn phục vụ; đã khôi phục | 2 |

Tổng các mục có thể vượt 10; điểm thưởng tính tối đa 10. Câu vấn đáp gợi ý cho L2: thứ tự bị đuổi giữa BestEffort, Burstable, Guaranteed là gì, và vì sao liveness phụ thuộc DB làm sự cố nặng hơn.
