# Đánh giá

> **Tóm tắt:** Điểm khóa gồm 6 thành phần với trọng số cố định. Bạn hoàn thành khóa khi Final Project từ 60/100, làm ít nhất 80% lab bắt buộc và Technical Assessment từ 50/100.

Bạn cần biết ba điều: mỗi thành phần chiếm bao nhiêu phần trăm, điều kiện để hoàn thành khóa, và nộp trễ hay khiếu nại điểm thì làm thế nào. Cách mentor tính điểm chi tiết nằm ở cuối trang, bạn đọc để biết điểm của mình đến từ đâu.



## Trọng số toàn khóa

| Thành phần | Trọng số |
| --- | --- |
| Attendance & Participation | 10% |
| Weekly Labs | 25% |
| Weekly Assignments | 15% |
| Technical Assessment | 15% |
| Final Project | 30% |
| Knowledge Sharing | 5% |

## Rubric Final Project (100 điểm)

| Tiêu chí | Điểm |
| --- | --- |
| Git workflow và source structure | 5 |
| Dockerfile và image optimization | 10 |
| Docker Compose và networking | 10 |
| CI/CD pipeline | 15 |
| Kubernetes workloads | 15 |
| Configuration, storage, health checks | 10 |
| Troubleshooting | 10 |
| Security practices | 10 |
| Documentation | 5 |
| Demo và technical defense | 10 |

## Xếp loại

| Điểm | Xếp loại | Đánh giá |
| --- | --- | --- |
| 90–100 | Excellent | Có thể tự xây dựng và vận hành pipeline |
| 80–89 | Good | Làm chủ phần lớn quy trình |
| 65–79 | Pass | Nắm được nền tảng, còn cần hỗ trợ |
| 50–64 | Needs Improvement | Cần bổ sung lab |
| Dưới 50 | Not Passed | Chưa đạt chuẩn đầu ra |

## Điều kiện hoàn thành

1. Điểm Final Project tối thiểu 60/100.
2. Hoàn thành ít nhất 80% bài lab bắt buộc.

Điểm chuyên cần không được bù cho năng lực thực hành chưa đạt.

## Technical Assessment: cấu trúc điểm

Technical Assessment (15% điểm khóa) gồm hai bài, mỗi bài chấm trên thang 100. Chi tiết thể thức xem [Technical Assessment](technical-assessment.md).

- Điểm Technical Assessment (thang 100) = 0,4 x điểm giữa khóa + 0,6 x điểm cuối khóa.
- Điểm giữa khóa = trắc nghiệm (tối đa 30) + thực hành containerize và Compose (tối đa 70).
- Điểm cuối khóa = lý thuyết (tối đa 40) + thực hành troubleshooting Kubernetes (tối đa 60).

## Điều kiện đạt (bổ sung cho Technical Assessment)

Hai điều kiện hoàn thành ở phần trên vẫn giữ nguyên. Bổ sung:

1. Điểm Technical Assessment (thang 100) tối thiểu 50. Dưới 50 thì được thi lại một lần phần thực hành của bài cuối khóa bằng đề tham số khác; điểm thi lại được tính tối đa 70/100 cho phần đó.
2. Mỗi bài kiểm tra phải có mặt hoặc có thi bù. Bỏ thi không lý do chính đáng tính 0 điểm cho bài đó.
3. Vi phạm quy chế thi (gian lận, dùng AI khi không được phép) bị 0 điểm phần liên quan và có thể ảnh hưởng điều kiện hoàn thành khóa.

## Nộp trễ

Áp dụng cho lab, assignment và Final Project. Mốc tính từ hạn nộp ghi trong đề.

| Thời gian trễ | Xử lý |
| --- | --- |
| Đến 24 giờ | Trừ 10% điểm bài |
| Trên 24 giờ đến 72 giờ | Trừ 25% điểm bài |
| Trên 72 giờ | Chỉ nhận để đánh giá, tối đa 50% điểm bài |

- Có lý do chính đáng (ốm, việc gia đình, sự cố mạng kéo dài có bằng chứng) và báo mentor trước hạn: được gia hạn, không bị trừ điểm.
- Bài kiểm tra (giữa và cuối khóa) không nhận nộp trễ. Nếu vắng có lý do chính đáng, học viên được thi bù trong vòng 7 ngày bằng đề tham số khác.
- Mentor có thể nới các mức trên trong tuần có sự cố hạ tầng chung và phải ghi lại quyết định.

## Khiếu nại điểm

1. Thời hạn: trong 5 ngày làm việc kể từ khi công bố điểm.
2. Cách gửi: tạo issue hoặc gửi form do mentor cung cấp, nêu rõ tiêu chí cho rằng chấm sai và kèm bằng chứng (lệnh, log, commit).
3. Xem xét: một mentor khác (không phải người chấm lần đầu) chấm lại phần bị khiếu nại, trả lời trong 5 ngày làm việc.
4. Kết quả: điểm có thể tăng, giữ nguyên hoặc giảm nếu phát hiện lỗi chấm khác. Quyết định của lần xem xét này là cuối cùng.
5. Không khiếu nại về những phần không nêu rõ tiêu chí; hãy hỏi mentor về cách chấm trước khi nộp bài.

## Dành cho mentor: cách chấm và ví dụ tính điểm

::: warning Dành cho mentor
Phần dưới đây dành cho người chấm. Học viên không cần đọc, nhưng đọc cũng không sao: đây là cách điểm của bạn được tính.
:::

### Chấm lab

Không chỉ chấm screenshot. Học viên phải nộp source, câu lệnh, log hoặc kết quả kiểm thử để mentor xác minh.

### Cách tính điểm tổng hợp

Mỗi thành phần được chấm trên thang 100, nhân với trọng số rồi cộng lại. Điểm tổng làm tròn đến một chữ số thập phân.

Ví dụ 1 (học viên đạt loại Good):

| Thành phần | Điểm (thang 100) | Trọng số | Đóng góp |
| --- | --- | --- | --- |
| Attendance & Participation | 90 | 10% | 9,00 |
| Weekly Labs | 80 | 25% | 20,00 |
| Weekly Assignments | 85 | 15% | 12,75 |
| Technical Assessment (giữa khóa 70, cuối khóa 78) | 74,8 | 15% | 11,22 |
| Final Project | 82 | 30% | 24,60 |
| Knowledge Sharing | 100 | 5% | 5,00 |
| Tổng | | 100% | 82,57 |

Technical Assessment: 0,4 x 70 + 0,6 x 78 = 28 + 46,8 = 74,8. Tổng 82,57 làm tròn 82,6, xếp loại Good.

Ví dụ 2 (điểm tổng cao nhưng chưa hoàn thành khóa):

| Thành phần | Điểm (thang 100) | Trọng số | Đóng góp |
| --- | --- | --- | --- |
| Attendance & Participation | 100 | 10% | 10,00 |
| Weekly Labs | 95 | 25% | 23,75 |
| Weekly Assignments | 90 | 15% | 13,50 |
| Technical Assessment (giữa khóa 60, cuối khóa 55) | 57,0 | 15% | 8,55 |
| Final Project | 55 | 30% | 16,50 |
| Knowledge Sharing | 100 | 5% | 5,00 |
| Tổng | | 100% | 77,30 |

Điểm tổng 77,3 nằm trong khoảng Pass, nhưng điểm Final Project 55 thấp hơn 60 nên chưa đạt điều kiện hoàn thành. Điểm chuyên cần không bù được cho năng lực thực hành chưa đạt.
