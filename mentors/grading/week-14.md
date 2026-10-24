# Chấm điểm tuần 14 – Storage, Ingress và Operations

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 14](../../assignments/weekly/week-14.md). Đáp án và bằng chứng cần thấy: [Walkthrough tuần 14](../walkthroughs/week-14.md). Kịch bản dạy: [Buổi 27](../sessions/session-27.md), [Buổi 28](../sessions/session-28.md).
:::

> **Tóm tắt:** Barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho bài tập tuần 14 (PVC, Ingress, rollout và chẩn đoán ba trạng thái lỗi).

## Barem chấm

Nguyên văn từ đề bài. Tổng 100 điểm, cộng tối đa 10 điểm L2 (tổng không vượt quá 110).

| Tiêu chí | Mô tả mức đạt / không đạt | Điểm |
| --- | --- | --- |
| Nhiệm vụ 1: PVC và dữ liệu bền | Đạt: PVC `Bound`, dòng riêng còn sau khi xóa Pod, có bằng chứng Pending hợp lệ và giải thích. Không đạt: thiếu số đếm trước/sau, hoặc dữ liệu mất mà không giải thích. Trừ nửa điểm nếu thiếu giải thích Pending | 18 |
| Nhiệm vụ 2: Ingress | Đạt: đủ ba lệnh curl với kết quả đúng (JSON, 200, 404), `describe ingress` đúng hai path, giải thích path thắng. Không đạt: chỉ có ảnh trình duyệt, hoặc thiếu trường hợp 404 | 14 |
| Nhiệm vụ 3: Rollout và rollback | Đạt: history có change-cause, scale không đổi revision, rollback về image hợp lệ có `jsonpath` xác nhận. Không đạt: thiếu `rollout status` hết thời gian hoặc không chứng minh Pod cũ còn phục vụ | 18 |
| Nhiệm vụ 4: Chẩn đoán ba lỗi | Đạt: mỗi lỗi có đúng loại bằng chứng (Events, `logs --previous` và Exit Code, `FailedScheduling`) và bảng giải thích lệnh đầu tiên. Không đạt: kết luận không kèm output. Mỗi lỗi 6 điểm, dọn dẹp 2 điểm | 20 |
| Nhiệm vụ 5: Troubleshooting report | Đạt: đủ 5 mục cho hai sự cố, trích dẫn khớp evidence, phòng tránh cụ thể, phân biệt rollback với sửa gốc | 10 |
| Câu hỏi kiểm tra kiến thức | Mỗi câu 2 điểm: đúng ý chính và dùng đúng thuật ngữ; sai hoặc mơ hồ: 0-1 điểm | 10 |
| Cấu trúc nộp bài và an toàn | Đạt: đúng cấu trúc thư mục, README đủ 7 mục, manifest chạy lại được, không có secret, PR có review | 10 |
| **Tổng bắt buộc** | | **100** |
| Thử thách A (L2) | Bảng dự đoán/kết quả có dự đoán viết trước, có PV `Released`, giải thích đúng | +4 |
| Thử thách B (L2) | Hai host cùng chạy, tự gây và chẩn đoán một lỗi Ingress bằng bằng chứng | +3 |
| Thử thách C (L2) | Rollout kẹt được chẩn đoán và undo trên `club-api`, xử lý được tối thiểu một scenario | +3 |
| **Điểm thưởng tối đa** | L2 không làm tổng vượt quá 110 | **10** |

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 60 điểm trở lên.

## Lỗi hay bị trừ điểm

- Nộp chỉ ảnh chụp màn hình, không có output lệnh dạng text trong `evidence/command-output.txt`.
- Số đếm `members` trước và sau xóa Pod không có, hoặc không chứng minh được dòng dữ liệu riêng của bạn còn lại.
- Kết luận nguyên nhân lỗi mà không trích dòng events, logs hay exit code tương ứng; đoán mò rồi "sửa cho chạy" mà không giải thích.
- Dùng `kubectl logs` thường thay vì `--previous` cho Pod crash và kết luận "không có log".
- Chỉ rollback rồi coi như xong, không nêu nguyên nhân gốc và cách phòng tránh.
- Gọi `curl` tới Ingress mà không kiểm tra header Host, rồi kết luận Ingress hỏng.
- Quên `kind load docker-image` hoặc tạo cluster kind không có `--config`, dẫn tới `ImagePullBackOff` hay `Connection refused` không liên quan tới bài.
- Commit mật khẩu thật, file Secret chứa giá trị thật hoặc `.env` vào repo.
- Làm trong `/mnt/c` thay vì filesystem WSL; manifest trong `source/` không khớp với thứ đã chạy.
- Không dọn tài nguyên thử nghiệm (`crashy`, `hungry`, PVC thừa), làm lần chạy sau nhiễu.
- PR không có người review, hoặc nộp sau hạn mà không báo trước.

## Lệnh kiểm tra nhanh

Chạy trên máy học viên hoặc trên cluster đang giữ kết quả nộp (đổi đường dẫn theo repo của học viên):

```bash
kubectl get nodes
kubectl get pvc,pv -n club
kubectl get pods -n club
kubectl get ingress -n club
kubectl exec -n club postgres-0 -- psql -U club -d clubdb -c "SELECT count(*) FROM members;"
curl -s -H "Host: club.localhost" http://127.0.0.1/api/members
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/api/members
kubectl get deployment -n ops-lab
kubectl rollout history deployment/web -n ops-lab
kubectl apply -f lab-27/source/postgres.yaml --dry-run=server
```

Điều cần thấy: node `Ready`; PVC `postgres-pvc` `Bound` với PV có `CLAIM` là `club/postgres-pvc`; bốn Pod `1/1 Running`; Ingress host `club.localhost` class `nginx`; `count(*)` lớn hơn hoặc bằng 3 và còn dòng email riêng; curl có Host đúng trả JSON, không Host đúng trả `404`; namespace `ops-lab` không còn `crashy` và `hungry`; `rollout history` có change-cause; `--dry-run=server` không báo lỗi (manifest trong `source/` chạy được từ thư mục sạch).

## Dấu hiệu bài chép hoặc không hiểu, và câu hỏi vấn đáp

Nguyên văn từ hướng dẫn chấm trong [Walkthrough tuần 14](../walkthroughs/week-14.md) (mục "Hướng dẫn chấm cho mentor"), để chấm tại một chỗ.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: PVC và dữ liệu bền (18 điểm) | `get nodes` Ready; `get pvc,pv` với `club/postgres-pvc`; dòng PVC `Pending` hoặc Events `waiting for first consumer`; hai lần `count(*)` bằng nhau; dòng email riêng còn lại | Email riêng trùng dữ liệu mẫu hoặc không có; số đếm trước và sau không có; Secret nằm trong file | Vì sao Pending không phải lỗi? Nếu cụm có nhiều node thì vì sao PV không nên tạo trước? Xóa StatefulSet thì dữ liệu còn không? |
| Nhiệm vụ 2: Ingress (14 điểm) | `get pods` đủ 4 Pod Ready; `get ingress` host `club.localhost`; ba lệnh curl (JSON, 200, 404); `describe ingress` hai path; 5 dòng log controller | Chỉ có ảnh trình duyệt; thiếu ca 404; log controller không khớp các request vừa gửi | Vì sao `/api/members` đi tới backend? Vì sao thiếu Host lại 404? Kind cần gì để traffic từ máy vào được controller? |
| Nhiệm vụ 3: Rollout và rollback (18 điểm) | `rollout history` nhiều lần có change-cause; `get rs` hai ReplicaSet; `scale` rồi history không đổi; `rollout status` hết thời gian; `jsonpath` image sau undo | Change-cause toàn `none`; thiếu Pod cũ vẫn Running khi rollout kẹt; tag lỗi giống hệt lab | Vì sao Pod cũ vẫn phục vụ? Scale có tạo revision không? Vì sao số revision đổi sau undo? |
| Nhiệm vụ 4: ba lỗi (20 điểm) | Events kéo image; `logs --previous` và `Last State` có Exit Code; `FailedScheduling`; lệnh dọn dẹp; bảng lệnh đầu tiên trong report | Dùng `logs` thường nên log trống rồi kết luận sai; kết luận không kèm output; còn `crashy`, `hungry` | Vì sao Pending không có log? Exit code 1, 127 và 137 gợi ý gì? Vì sao không dùng `rollout undo` cho `crashy`? |
| Nhiệm vụ 5: Troubleshooting report (10 điểm) | Đủ 5 mục cho 2 sự cố; trích dẫn khớp `command-output.txt`; phòng tránh cụ thể | Trích dẫn không có trong evidence; phòng tránh kiểu "cẩn thận hơn"; không phân biệt rollback và sửa gốc | Rollback đã đủ chưa? Nêu một tình huống `undo` không giúp. |
| Câu hỏi kiểm tra (10 điểm) | 5 câu ngắn, đúng thuật ngữ | Nhầm reclaim policy với access mode; nhầm Ingress với Service | Giải thích bằng ví dụ vì sao xóa PVC làm mất dữ liệu còn xóa Pod thì không. |
| Cấu trúc nộp bài và an toàn (10 điểm) | README đủ 7 mục; manifest trong `source/` khớp thứ đã chạy; không có secret; PR có review | `source/` khác với lệnh trong evidence; mật khẩu trong repo | Em đã chạy lại manifest trong `source/` từ đầu chưa? |
| L2 (tối đa 10 điểm) | A: bảng dự đoán viết trước và PV `Released`. B: hai lệnh curl hai Host, `describe ingress` hai rule, một lỗi Ingress đã gây và chẩn đoán. C: rollout kẹt với `9.9.9`, hai ReplicaSet, undo, ít nhất một scenario | Dự đoán giống hệt kết quả không có ngộ nhận; L2-C không có bằng chứng ứng dụng vẫn trả lời khi kẹt | Vì sao PV `Released` chưa bind lại được và admin cần làm gì? Làm sao kiểm tra image đã có trong node trước `set image`? |

Lưu ý khi chấm: yêu cầu học viên mở lại `evidence/command-output.txt` và chạy lại một lệnh bất kỳ khi vấn đáp; bài chép thường không tái hiện được kết quả. Tên PV, hash ReplicaSet và timestamp giống hệt giữa hai bài là dấu hiệu sao chép.

## Lưu ý khi chấm thử thách C

Đáp án các tình huống `scenario-07`, `scenario-08`, `scenario-09` nằm ở [Kịch bản mentor buổi 28](../sessions/session-28.md). Học viên chỉ được nhận triệu chứng, nên kiểm tra kỹ bài nộp có lệnh và output chứng minh nguyên nhân (không chỉ ghi kết luận trùng với đáp án). Kịch bản 07 dùng biến `KIND_CLUSTER`, nên bài nộp từ máy học viên cần có dòng `KIND_CLUSTER=club`.
