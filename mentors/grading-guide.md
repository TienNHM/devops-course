# Hướng dẫn chấm bài

> **Tóm tắt:** Quy trình chấm bài cho mentor: học viên nộp thế nào, review PR, barem tổng quan 100 điểm, viết phản hồi, bảo đảm trung thực, xử lý nộp trễ, office hour, quản lý tiến độ bằng GitHub Projects và theo dõi chất lượng khóa.

::: warning Dành cho mentor
Trang này dành cho người chấm bài; học viên không cần đọc.
:::

Trang này là quy trình chung. Tiêu chí riêng của từng tuần (lỗi hay bị trừ điểm, lệnh kiểm tra nhanh, câu hỏi vấn đáp) nằm ở trang Hướng dẫn chấm của đúng tuần, xem cột "Hướng dẫn chấm" trong [bảng 16 tuần](index.md). Lời giải để đối chiếu nằm ở cột "Đáp án" cùng bảng. Evidence trong trang này nghĩa là bằng chứng nộp (log, output lệnh, kết quả test thật).

## Học viên nộp bài thế nào

Mỗi học viên có một repo cá nhân `devops-labs` (public). Mỗi lab nằm trong thư mục `lab-XX/` theo [mẫu báo cáo lab](../templates/lab-template.md). Học viên nộp bằng Pull Request vào nhánh `main` của repo cá nhân (mentor là reviewer), không push thẳng vào `main`.

Cấu trúc thư mục nộp bài:

```text
lab-XX/
  README.md
  source/
  screenshots/
  evidence/
    command-output.txt
    test-results.txt
  report.md
```

## Quy trình review PR

1. Học viên mở PR có tiêu đề `Lab XX: tên lab` và tick mức đã làm (L1 hoặc L2) trong mô tả.
2. Mentor được gán theo nhóm; phản hồi trong vòng 72 giờ làm việc.
3. Mentor đọc `report.md`, kiểm tra `evidence/`, chạy lại lệnh chính nếu nghi ngờ.
4. Mentor để comment theo dòng, dùng nhãn: `Blocking` (phải sửa), `Suggestion` (nên sửa), `Question` (cần giải thích), `Praise` (điểm tốt).
5. Kết quả: Approve nếu đạt, Request changes nếu có điểm Blocking. Học viên sửa tối đa hai vòng, sau đó hẹn office hour.
6. Merge PR sau khi Approve và ghi điểm vào Issue tương ứng.

## Barem tổng quan (100 điểm)

Barem này là mặc định. Nếu trang Hướng dẫn chấm của tuần có thang điểm riêng thì dùng thang của tuần đó.

| Tiêu chí | Điểm | Mô tả đạt |
| --- | --- | --- |
| Kết quả chạy được | 30 | Làm lại theo `README.md` và `source/` cho kết quả như báo cáo |
| Bằng chứng | 20 | Có log, output lệnh, kết quả test thật, không chỉ screenshot |
| Hiểu và giải thích | 20 | Phần "những lỗi đã gặp" và "cách khắc phục" cho thấy hiểu nguyên nhân |
| Chất lượng kỹ thuật | 15 | Pin phiên bản, không có secret, cấu trúc gọn, tên rõ ràng |
| Trình bày | 10 | Báo cáo đủ 7 mục theo mẫu, đọc hiểu được |
| Cải thiện thêm | 5 | Nêu cải tiến hợp lý (điểm L2 hoặc ý tưởng riêng) |

Quy đổi: 80 điểm trở lên là Đạt, 60 đến 79 là Cần sửa (được nộp lại một lần), dưới 60 là Chưa đạt. Trọng số lab trong khóa là 25% theo [cách đánh giá](../curriculum/assessment.md). Bài có secret thật bị commit: xử lý theo mục "Không commit secret" ở phần An toàn của [Sổ tay mentor](handbook.md) trước khi chấm tiếp.

## Xử lý nộp trễ

Mốc tính từ hạn nộp ghi trong đề. Quy định đầy đủ nằm ở [cách đánh giá](../curriculum/assessment.md); mentor áp dụng như sau:

| Thời gian trễ | Xử lý |
| --- | --- |
| Đến 24 giờ | Trừ 10% điểm bài |
| Trên 24 giờ đến 72 giờ | Trừ 25% điểm bài |
| Trên 72 giờ | Chỉ nhận để đánh giá, tối đa 50% điểm bài |

- Có lý do chính đáng (ốm, việc gia đình, sự cố mạng kéo dài có bằng chứng) và học viên báo trước hạn: gia hạn, không trừ điểm. Ghi lý do vào Issue.
- Mentor có thể nới các mức trên trong tuần có sự cố hạ tầng chung và phải ghi lại quyết định.
- Học viên có Issue quá hạn hoặc không hoạt động 7 ngày được gắn nhãn `at-risk` (xem phần Quản lý tiến độ bên dưới); mentor phụ trách chủ động hỏi thăm.
- Bài nộp lại ở mức Cần sửa là một lần nộp lại, không tính là nộp trễ.

## Viết phản hồi

Phản hồi tốt có ba phần: một điểm làm tốt cụ thể, một đến ba điểm cần sửa kèm lý do, và một câu hỏi mở rộng. Ví dụ:

```text
Tốt: bạn tách build stage và runtime stage, image nhỏ hơn rõ rệt.
Cần sửa: container đang chạy bằng root (Blocking). Hãy xem lại phần USER trong Dockerfile
và giải thích vì sao đây là rủi ro.
Câu hỏi thêm: nếu thay đổi package.json, layer nào sẽ bị build lại?
```

Không viết đáp án thẳng vào comment cho lỗi tư duy; chỉ đường để học viên tự sửa. Với lỗi chính tả hoặc cú pháp nhỏ thì có thể chỉ thẳng.

## Bảo đảm tính trung thực

Học viên có thể tham khảo tài liệu, bạn bè và công cụ AI, nhưng phải giải thích được từng dòng mình nộp. Trong review hoặc office hour, hỏi một câu "vì sao dòng này ở đây" cho mỗi bài. Bài sao chép nguyên văn mà không giải thích được thì yêu cầu làm lại phần đó trực tiếp trước mentor.

## Office hour

- Mỗi tuần có một buổi office hour ngắn (thường 60 phút, một đến hai mentor trực).
- Dành cho lỗi học viên không tự xử lý được sau khi đã thử theo quy trình học viên tụt lại (xem [Quy trình một buổi học](session-runbook.md)). Không dành cho giảng lại bài.
- Học viên đặt chỗ bằng cách mở Issue hoặc Discussion trước đó kèm: đã làm gì, lỗi gì, đã thử gì, output lệnh.
- Mentor áp dụng quy tắc "hỏi trước, chỉ sau": hỏi học viên chẩn đoán đến đâu, rồi chỉ gợi ý bước tiếp theo.
- Ghi lại lỗi lặp lại. Nếu từ ba học viên trở lên hỏi cùng một lỗi, cập nhật tài liệu lab hoặc phần xử lý sự cố của [Quy trình một buổi học](session-runbook.md).
- Với học viên cần hỗ trợ lâu hơn (WSL hỏng, Docker không khởi động), dùng phiên 1-1 riêng, không chiếm thời gian chung.

## Quản lý tiến độ bằng GitHub Projects

Dùng GitHub Projects (bảng) cho tổ chức hoặc repo của khóa, ánh xạ như sau:

| Khái niệm GitHub | Dùng làm gì |
| --- | --- |
| Issue | Một assignment hoặc một lab của một học viên (hoặc một nhóm) |
| Milestone | Một phase (Phase 1 đến Phase 5, xem [lịch học](../curriculum/schedule.md)) |
| Pull Request | Bài thực hành nộp, liên kết với Issue bằng từ khóa `Closes #n` |
| Discussions | Hỏi đáp, chia sẻ kiến thức, thông báo, retrospective |
| Project board | Theo dõi trạng thái: Todo, In progress, In review, Done |

Quy trình:

1. Đầu mỗi tuần, lead tạo Issue cho lab và assignment của tuần, gán Milestone phase tương ứng, thêm vào Project.
2. Học viên nhận Issue, mở PR liên kết, chuyển cột khi bắt đầu và khi nộp.
3. Mentor review PR, ghi điểm trong Issue, đóng Issue khi PR được merge.
4. Cuối tuần, lab assistant rà bảng: học viên nào có Issue quá hạn hoặc không có hoạt động 7 ngày thì gắn nhãn `at-risk` và báo mentor phụ trách.
5. Dùng Discussions cho: Q and A (hỏi đáp chung), Show and tell (học viên khoe kết quả), Announcements (thông báo lịch, đổi phòng), Retro (phản hồi cuối phase).

Nhãn gợi ý: `lab`, `assignment`, `capstone`, `at-risk`, `needs-mentor`, `env-issue` (lỗi môi trường, không phải lỗi học viên), `doc-bug` (lỗi tài liệu).

Nhóm capstone dùng repo nhóm bắt đầu từ `starter-project`, có Project riêng, mỗi thành viên có Issue và PR riêng để chấm đóng góp từng người.

## Đánh giá và theo dõi chất lượng khóa

- Điểm danh và tham gia: ghi nhận mỗi buổi.
- Theo dõi tỷ lệ hoàn thành lab bắt buộc (cần tối thiểu 80% để hoàn thành khóa, theo [cách đánh giá](../curriculum/assessment.md)).
- Cuối mỗi phase, thu feedback ngắn (3 câu hỏi) qua Discussions hoặc form.
- Cuối khóa, lead tổng hợp báo cáo: số học viên hoàn thành, các lab có tỷ lệ lỗi cao, đề xuất sửa nội dung. Đưa vào Issue của repo giáo trình theo quy trình ở [Quản lý repo giáo trình](repo-governance.md).
