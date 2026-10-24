# Bài tập tuần 13 – Configuration, Resources & Health

> **Tóm tắt:** Nộp lại bằng chứng của hai lab tuần 13: ConfigMap và Secret, hành vi cập nhật cấu hình, chẩn đoán `DB_HOST` sai, requests, limits và ba probe, OOMKilled và readiness probe fail. Mọi kết luận phải dựa trên lệnh và output thật.

**Phạm vi:** [Buổi 25 – Configuration Management](../../labs/week-13/session-25.md) và [Buổi 26 – Resource & Health](../../labs/week-13/session-26.md). Nộp trong `lab-25/` và `lab-26/` của repo `devops-labs` (public). Hub tuần: [Tuần 13 – Configuration, Resources & Health](../../labs/week-13/README.md).

## Bài tập = nộp lại bằng chứng của lab, không có việc mới

Bạn không phải làm thêm gì ngoài bài lab: mỗi nhiệm vụ dưới đây là bằng chứng của một phần lab bắt buộc (L1). Hãy chọn giá trị riêng của bạn khi lab cho phép (ví dụ giá trị `DB_HOST` sai, đường dẫn probe sai, nội dung ConfigMap thí nghiệm) để bài không trùng hệt tài liệu. Thử thách L2 là điểm thưởng, làm ở nhà.

| Nhiệm vụ | Làm ở phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Cấu hình tách khỏi image | Buổi 25, Phần 1, 2, 3 và 4 | 1,0 | `get configmap -o yaml` có đủ key (số trong dấu nháy); `describe secret` chỉ hiện byte; `base64 -d` đã che; `printenv` trong Pod; `source/config-demo.yaml`; `git grep` sạch |
| 2. Cấu hình đổi thì Pod thấy khi nào | Buổi 25, Phần 4 | 0,5 | Dự đoán viết trước trong `report.md`; `printenv` còn giá trị cũ ngay sau `patch`; vòng lặp 12 lần cho thấy lúc file đổi; `printenv` mới sau khi tạo lại Pod |
| 3. Chẩn đoán `DB_HOST` sai | Buổi 25, Phần 5 | 0,5 | Pod mới `0/1` cùng Pod cũ `1/1`; Events `Readiness probe failed`; `ENOTFOUND` kèm tên sai; `printenv DB_HOST` và ConfigMap; `rollout status` và `/ready` sau khôi phục |
| 4. Requests, limits và ba probe | Buổi 26, Phần 1 và 2 | 0,5 | `source/backend-deploy.yaml`; `describe` có ba dòng probe và `QoS Class`; `rollout status` 2/2; `report.md` giải thích con số và công thức startup |
| 5. OOMKilled và readiness fail | Buổi 26, Phần 3 và 4 | 1,0 | `source/oom-demo.yaml`; `OOMKilled` và `137`, logs dừng đột ngột; Pod mới `0/1`, Events kèm mã HTTP, `get endpoints backend` trước và sau khôi phục; `oom-demo` đã xóa |
| Report và 5 câu hỏi | Cuối cả hai lab | 0,5 | `report.md` có 5 câu trả lời ngắn (phần "Câu hỏi kiểm tra" bên dưới) |

Tổng khoảng 4 giờ, phần lớn là gom và đọc lại output đã có. Thử thách L2 (tùy chọn): [Buổi 25 – Thử thách nâng cao](../../labs/week-13/session-25-challenge.md) và [Buổi 26 – Thử thách nâng cao](../../labs/week-13/session-26-challenge.md).

## Bảng điểm

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: ConfigMap, Secret, Pod nhận cấu hình | 16 |
| Nhiệm vụ 2: hành vi cập nhật cấu hình | 14 |
| Nhiệm vụ 3: chẩn đoán `DB_HOST` sai | 16 |
| Nhiệm vụ 4: requests, limits, ba probe | 18 |
| Nhiệm vụ 5: OOMKilled và readiness fail | 16 |
| Chất lượng report và câu hỏi kiểm tra | 10 |
| An toàn dữ liệu (Secret, `.env`, token) | 5 |
| Quy trình nộp (PR đúng cấu trúc, đã có review, đúng hạn) | 5 |
| Tổng L1 | 100 |
| Thưởng L2 (ba thử thách, chỉ chấm khi L1 từ 70 điểm) | tối đa 10 |

Tiêu chí đạt chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp nằm ở trang chấm điểm của mentor, không cần đọc để làm bài.

## Bằng chứng cần nộp

Cấu trúc theo [mẫu nộp bài lab](../../templates/lab-template.md), gồm hai thư mục:

```text
lab-25/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 1-3
├── source/
│   ├── config-demo.yaml
│   └── app.properties     # nếu làm L2
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              # dự đoán, phân tích, câu hỏi kiểm tra
lab-26/
├── README.md              # trả lời 7 câu hỏi của template cho nhiệm vụ 4-5
├── source/
│   ├── backend-deploy.yaml
│   ├── oom-demo.yaml
│   └── (manifest L2 nếu làm)
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md
```

Mọi output phải là kết quả thật từ máy của bạn (tên Pod, hash, thời gian khác nhau giữa các bạn). Screenshot chỉ bổ sung, không thay thế `command-output.txt`. Không đưa mật khẩu, token hay file Secret thật vào repo; kiểm tra bằng `git grep -n -i -E "stringData|kind: Secret"` trước khi push.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `report.md` của `lab-26/`, đặt tiêu đề "Câu hỏi kiểm tra".

1. Base64 trong Secret có phải mã hóa bảo mật không? Nêu một lệnh chứng minh và hai biện pháp bảo vệ Secret tốt hơn.
2. Bạn sửa ConfigMap mà ứng dụng vẫn dùng giá trị cũ. Nêu hai nguyên nhân có thể và cách xử lý từng trường hợp.
3. Phân biệt `requests` và `limits`: ai sử dụng, và hậu quả khác nhau thế nào khi vượt limit của CPU so với memory?
4. Readiness fail và liveness fail khác nhau ở hành động của kubelet như thế nào? Vì sao liveness không nên kiểm tra database?
5. Pod restart liên tục, `kubectl logs` không có lỗi nào. Bạn kiểm tra gì để kết luận nguyên nhân, và dấu hiệu nào xác nhận?

## Quy trình nộp

1. Tạo branch trong repo `devops-labs`, ví dụ `week-13`.
2. Commit `lab-25/` và `lab-26/` đúng cấu trúc ở trên; chạy `git grep -n -i -E "stringData|kind: Secret"` và đọc `git diff --cached` để chắc chắn không có giá trị thật.
3. Mở Pull Request vào nhánh chính, mô tả ngắn các nhiệm vụ đã làm và level (L1, L2).
4. Nhờ một bạn trong lớp review; người review kiểm tra evidence có thật, chạy thử một manifest và để lại ít nhất hai nhận xét cụ thể.
5. Sửa theo nhận xét, rồi gửi link PR cho mentor để chấm.

Hạn nộp: trước buổi đầu tiên của tuần 14.

## Checklist trước khi nộp

- [ ] `lab-25/` và `lab-26/` đúng cấu trúc theo mẫu lab
- [ ] Có dự đoán trước và output chứng minh hành vi cập nhật của env và file mount
- [ ] Secret tạo bằng lệnh, không có file Secret chứa giá trị thật trong repo
- [ ] Có đủ năm bước điều tra cho lỗi `DB_HOST` sai và xác nhận đã khôi phục
- [ ] `backend-deploy.yaml` có requests, limits và đủ ba probe; có output `describe` với `QoS Class`
- [ ] Có output `OOMKilled` kèm exit code 137 và Events `Readiness probe failed`
- [ ] `club-api` ở 2/2 Ready, `postgres` đang chạy, Pod `oom-demo` và namespace `lab25` đã được dọn
- [ ] `report.md` có 5 câu trả lời kiểm tra kiến thức; `README.md` trả lời 7 câu cho cả hai lab
- [ ] Không commit `.env`, mật khẩu, token hay file Secret chứa giá trị thật
- [ ] PR đã được ít nhất một bạn review và nộp trước hạn
