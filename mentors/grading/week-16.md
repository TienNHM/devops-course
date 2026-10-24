# Hướng dẫn chấm tuần 16 – Capstone Testing & Defense

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 16](../../assignments/weekly/week-16.md). Đáp án: [Đáp án tuần 16](../walkthroughs/week-16.md). Kịch bản dạy: [buổi 31](../sessions/session-31.md), [buổi 32](../sessions/session-32.md).
:::

> **Tóm tắt:** Barem 100 điểm cho bài tập tuần 16 (clean clone, ba sự cố trên kind, bảo mật, runbook, demo), lệnh kiểm tra nhanh, bằng chứng và câu hỏi vấn đáp, lỗi hay bị trừ điểm và phạm vi chấm.

## Barem

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: clean clone và Compose | Clone thư mục mới, không có `.env` trong Git, ba service lên, smoke test đủ, dữ liệu còn sau `down` và `up`, có nhận xét README | Dùng thư mục cũ, thiếu smoke test, không chứng minh dữ liệu bền | 15 |
| Nhiệm vụ 2: kind và độ trễ | Context kind đúng, image có tag phiên bản, mọi Pod Ready, đủ 5 lần đo và hai số `time`, nhận xét có lập luận | Pod không Ready, dùng `latest`, thiếu số đo hoặc kết luận không dựa trên số đo | 15 |
| Nhiệm vụ 3: ba sự cố | Đủ 9 đoạn output có nhãn, mỗi sự cố có dự đoán, log 5 trường, nguyên nhân gốc đúng, hoàn tác về trạng thái khỏe mạnh | Thiếu sự cố hoặc thiếu trạng thái trước, trong, sau; nguyên nhân sai hoặc chỉ nêu lại triệu chứng; không hoàn tác | 25 |
| Nhiệm vụ 4: bảo mật và runbook | 4 lệnh kiểm tra có output thật, bảng 5 hạng mục trung thực, runbook đủ 5 mục với lệnh đã chạy | Bảng ghi Đạt không có bằng chứng, runbook thiếu mục hoặc có lệnh chưa chạy, có secret | 15 |
| Nhiệm vụ 5: demo, bảo vệ, tự đánh giá | Có lệnh demo, lượt chạy thử bấm giờ bằng log thật, lessons learned cụ thể, đã nộp peer review | Lessons learned chung chung, thiếu log chạy thử, đưa peer review vào repo | 10 |
| `report.md` và `README.md` | Đủ 7 câu mỗi lab, giải thích đúng, 5 câu hỏi kiểm tra được trả lời bằng lời của bạn, ghi rõ mức đã làm | Thiếu câu, sao chép đề bài hoặc lời giải trong bài lab, không ghi mức | 10 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc thư mục, evidence là text thật có nhãn, không có secret, commit message rõ ràng | Sai cấu trúc, evidence chỉ là ảnh, có secret | 5 |
| Quy trình nộp | Có PR, được một bạn review có nhận xét thật | Push thẳng vào `main` hoặc review chỉ ghi "OK" | 5 |
| **Tổng L1** | | | **100** |
| L2: Thử thách A (thiết kế sự cố) | Kịch bản an toàn, hoàn tác được, đã tự chạy thử, có nhận xét báo cáo của nhóm nhận | Thiếu cách hoàn tác, chưa chạy thử, lộ nguyên nhân trong triệu chứng | +4 |
| L2: Thử thách B (xóa Pod PostgreSQL) | Dự đoán ghi trước, PVC cùng một cái, dữ liệu còn, so sánh dự đoán trung thực | Dự đoán viết sau khi chạy, không có output PVC, xóa PVC | +3 |
| L2: Thử thách C (cải tiến và câu hỏi mở rộng) | Đủ số đề xuất có ưu tiên và ước lượng, hai câu mở rộng có lập luận cụ thể | Đề xuất chung chung, không bằng chứng, câu trả lời không nêu cách đo | +3 |
| **Tối đa thưởng** | | | **+10** |

Điểm một tiêu chí được chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0. L2 chỉ chấm khi L1 đã đạt từ 60 điểm. Nộp muộn bị trừ theo quy định trong `curriculum/assessment.md`; mentor không chấm nội dung đẩy sau hạn.

## Lệnh kiểm tra nhanh

Chạy trong bản clone repo `devops-labs` của học viên (đổi đường dẫn theo repo đã nộp):

```bash
cd ~/devops-labs
ls lab-31 lab-31/source lab-31/evidence lab-32 lab-32/source lab-32/evidence
grep -c '^===' lab-31/evidence/command-output.txt
grep -n -E 'uid=|permissions|9\.9\.9|rollout undo' lab-31/evidence/command-output.txt
grep -n -E 'date -Is|^20[0-9]{2}-' lab-32/evidence/command-output.txt | head
grep -rn -E 'club-api-[0-9a-f]{8,10}-[a-z0-9]{5}' lab-31/source/runbook.md
git ls-files | grep -E '(^|/)(id_ed25519|id_rsa|\.env)$'
git ls-files | grep -i peer
git log --oneline -n 20
```

Điều cần thấy: thư mục đúng cấu trúc; số dòng nhãn `===` ít nhất 9 (ba sự cố nhân trước, trong, sau); có `uid=1000(node)`, khối `permissions`, bằng chứng tag `9.9.9` và `rollout undo`; log chạy thử của buổi 32 có mốc thời gian đầu và cuối; runbook không có tên Pod cố định; ba lệnh `git ls-files` cuối không in gì (không có `.env`, khóa, peer review); lịch sử commit có commit theo từng nhiệm vụ.

Gợi ý chấm nhanh:

- Yêu cầu học viên chạy lại một sự cố bất kỳ ngay tại chỗ và đọc to điều quan sát; người thực sự đã làm sẽ đi đúng thứ tự trạng thái, sự kiện, log, cấu hình.
- Đối chiếu thời gian trong `date -Is` với lịch sử commit để thấy log có phải làm thật hay không.
- Điểm cá nhân nên phản ánh khả năng giải thích một phần mình không trực tiếp viết.
- Capstone chấm theo [Rubric Capstone](../../curriculum/capstone-rubric.md) tiêu chí 7 (Troubleshooting) và 10 (Demo và technical defense).

## Bằng chứng và câu hỏi vấn đáp

Chấm bằng bằng chứng text trong `evidence/`, đối chiếu với repo nhóm.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Clean clone và Compose | `pwd` và `git log` ở thư mục mới; `docker compose ps` có `healthy`; ba mã smoke test; chuỗi `down`, `up`, đọc lại; danh sách điểm README cần sửa cụ thể | Dùng thư mục cũ, không có nhận xét README, kết luận dữ liệu còn nhưng dùng `-v` | "Làm sao tôi biết bạn không dùng kiến thức ngoài README?" "Vì sao cần chờ `/ready`?" |
| kind và độ trễ | Context bắt đầu bằng `kind-`; image có tag phiên bản; mọi Pod Ready; 5 dòng `curl -w`; hai số `time`; replica trả về 2 | Dùng `latest`, số liệu không có lệnh `time`, kết luận "thêm replica nhanh hơn" không có số đo | "Vì sao hai số gần nhau?" "Muốn thấy lợi ích của replica thì đo thế nào?" |
| Ba sự cố | Chín đoạn output có nhãn; troubleshooting log 5 trường kèm dự đoán; Secret gốc được khôi phục; kết thúc khỏe mạnh | Dự đoán giống hệt đáp án, nguyên nhân gốc là triệu chứng, xem log của Pod cũ rồi kết luận không lỗi | "Vì sao Pod mới `0/1` mà không restart?" "Sao bạn gọi trực tiếp vào Pod mới?" "Sau khi sửa Secret làm gì tiếp?" |
| Bảo mật và runbook | Output bốn lệnh kiểm tra; bảng 5 hạng mục trung thực; runbook đủ 5 mục dùng lệnh đã chạy | Ghi "Đạt" không có output, quét image khai nhưng không có kết quả, runbook dùng tên Pod cố định | "Dòng này trong kết quả `grep` là gì, vì sao chấp nhận?" "Vì sao liveness không gọi `/ready`?" |
| Demo, bảo vệ, tự đánh giá | Log chạy thử có bấm giờ; `demo-commands.md` khớp tên service và nhãn; lessons learned gắn sự việc; có xác nhận đã nộp peer review | Lessons learned chung chung, lệnh không khớp manifest, peer review nằm trong repo | "Truy ngược từ Pod đang chạy về commit thế nào?" "Chuyện gì xảy ra khi xóa `postgres-0`? Khi xóa PVC?" |

## Lỗi hay bị trừ điểm

- Dùng thư mục làm việc cũ thay vì clone mới, nên không phát hiện thiếu `.env.example` hoặc thiếu bước trong README.
- `command-output.txt` chỉ có output cuối, thiếu trạng thái trước và trong lúc lỗi; hoặc output không có nhãn nên reviewer không biết thuộc sự cố nào.
- Viết dự đoán sau khi đã thấy kết quả, hoặc ghi nguyên nhân gốc là triệu chứng (ví dụ "Pod ImagePullBackOff" thay vì "tag không tồn tại trong node kind").
- Xem log của Pod cũ rồi kết luận "không có lỗi" trong sự cố C, vì không lấy đúng Pod mới; hoặc quên gọi trực tiếp vào Pod mới khi Service không gửi traffic tới Pod chưa Ready.
- Không hoàn tác: để Deployment ở tag `9.9.9`, để Secret sai mật khẩu, hoặc để replica ở 3.
- In mật khẩu thật hay mật khẩu thử nghiệm vào evidence, log, runbook hoặc ảnh chụp màn hình; commit `.env`, file Secret chứa giá trị thật, token hoặc private key.
- Ghi "Đạt" trong bảng bảo mật nhưng không có output lệnh tương ứng; khai quét image nhưng không có kết quả quét.
- Kết luận về hiệu năng mà không có số đo, hoặc nói thêm replica luôn làm nhanh hơn mà không giải thích nút thắt.
- Runbook chứa lệnh chưa từng chạy, hoặc dùng tên Pod cố định thay vì chỉ cách lấy tên Pod thật.
- Đưa file peer review vào repo công khai, hoặc lessons learned chung chung ("làm việc nhóm tốt hơn") không gắn với sự việc cụ thể.
- Nhóm chạy thử demo bằng ảnh chụp thay vì lệnh thật, hoặc lệnh trong `demo-commands.md` không khớp tên service và nhãn trong manifest.
- Nộp ảnh chụp thay cho file nguồn và log text; push thẳng vào `main`, không có PR hoặc không có người review.

## Phạm vi chấm

Đáp án năm câu hỏi kiểm tra kiến thức nằm ở mục "Đáp án năm câu hỏi kiểm tra" của [Đáp án tuần 16](../walkthroughs/week-16.md). Hai bài lab của tuần dùng starter-project (hoặc repo capstone của nhóm) nên chấm bài tập tuần trên bằng chứng của từng học viên, không chấm lại bài lab nhóm. Nếu hai học viên cùng nhóm nộp evidence giống hệt từng dòng, kể cả dấu thời gian, hãy hỏi vấn đáp để xác nhận từng người đã tự chạy và tự ghi lại.
