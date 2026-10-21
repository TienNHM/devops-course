# Kế hoạch pilot

> **Tóm tắt:** Chạy thử khóa với 3 đến 5 thành viên trước khi khai giảng chính thức: mục tiêu, đối tượng, lịch, cách thu thập feedback, mẫu feedback form và tiêu chí go/no-go để quyết định mở khóa.

Pilot là mục 7 trong [ROADMAP](../ROADMAP.md) và là điều kiện để hoàn thiện Curriculum v1.0. Kết quả pilot là đầu vào cho [Điều kiện mở khóa](launch-checklist.md).

## 1. Mục tiêu

1. Kiểm chứng mọi lab chạy được trên máy thật của học viên (không chỉ máy mentor).
2. Đo thời gian thực tế của từng khối trong buổi 120 phút so với kế hoạch.
3. Tìm lỗi và chỗ mơ hồ trong tài liệu, slide, lab, starter project.
4. Kiểm tra độ khó của L1 và L2, độ phù hợp của phần Break.
5. Kiểm tra quy trình vận hành: nộp bài bằng PR, chấm bài, GitHub Projects, office hour.
6. Thu số liệu để quyết định go/no-go (mục 7).

Pilot không nhằm đánh giá học viên. Học viên pilot là người đồng góp ý, cần được nói rõ điều này ngay từ đầu.

## 2. Đối tượng và nhân sự

Chọn 3 đến 5 thành viên, cố ý đa dạng:

| Nhóm | Số lượng gợi ý | Mục đích |
| --- | --- | --- |
| Người mới hoàn toàn (chưa dùng Linux hoặc Docker) | 1 đến 2 | Kiểm tra L1 và tài liệu cho người mới |
| Người có nền tảng lập trình, chưa có DevOps | 1 đến 2 | Đại diện nhóm học viên phổ biến |
| Người có kinh nghiệm hơn | 1 | Kiểm tra L2 và độ sâu của capstone |

Điều kiện máy: có ít nhất một học viên dùng máy 8 GB RAM và một học viên dùng máy 16 GB, để kiểm chứng phần [máy yếu](handbook.md).

Nhân sự: Program Lead (1), Technical Mentor (tối thiểu 1), Lab Assistant (tối thiểu 1). Với nhóm 3 đến 5 người, một mentor là đủ cho giờ lab.

## 3. Phạm vi và lịch pilot

Chạy pilot đầy đủ 16 tuần là tốt nhất nhưng tốn thời gian. Đề xuất hai mức:

| Mức | Phạm vi | Thời lượng | Khi nào dùng |
| --- | --- | --- | --- |
| Pilot đầy đủ | 32 buổi, theo [lịch 16 tuần](../curriculum/schedule.md) | 16 tuần | Đủ nhân lực, muốn xác nhận cả capstone |
| Pilot rút gọn | Lấy mẫu một buổi đại diện mỗi tuần quan trọng, ưu tiên tuần 1, 4, 5, 7, 8, 9, 11, 13, 14 và một buổi capstone | 4 đến 6 tuần chạy dồn | Thời gian hạn chế |

Mẫu lịch pilot rút gọn:

| Tuần pilot | Nội dung | Mục tiêu kiểm chứng |
| --- | --- | --- |
| 1 | Tuần 1 và 4 của giáo trình (môi trường, Docker Basics) | Cài đặt WSL2 và Docker trên máy thật, lỗi môi trường |
| 2 | Tuần 5 và 7 (Dockerfile, Compose) | Lab chính của starter project |
| 3 | Tuần 8 và 9 (GitHub Actions, GHCR) | Quy trình CI, phân quyền, nộp bài bằng PR |
| 4 | Tuần 11 và 13 (kind, ConfigMap, Secret, probe) | Tài nguyên máy yếu, tài liệu Kubernetes |
| 5 | Tuần 14 (Storage, Ingress, troubleshooting) | Phần Break, 10 tình huống lỗi |
| 6 | Capstone rút gọn và buổi phản hồi | Mức khó của capstone, tổng kết |

Mỗi buổi pilot vẫn chạy đúng khung 120 phút, có mentor quan sát và ghi lại thời gian thực tế.

## 4. Quy trình vận hành pilot

1. Chuẩn bị: chạy [checklist D-7 đến D-1](session-runbook.md) cho từng buổi, như một buổi chính thức.
2. Khởi động (kickoff 30 phút): giải thích mục tiêu pilot, quy tắc ghi log, cách báo lỗi (Issue có nhãn `pilot`), cam kết không chấm điểm.
3. Trong buổi: một người quan sát chuyên ghi (không hỗ trợ học viên), ghi lại thời điểm học viên kẹt, câu hỏi họ đặt, lệnh họ gõ sai.
4. Sau buổi: học viên điền feedback form (mục 6) trong vòng 24 giờ.
5. Họp retro với mentor trong 48 giờ, quyết định sửa gì.
6. Sửa tài liệu và đóng Issue trước buổi kế tiếp.

Các việc pilot phải kiểm thử rõ ràng:

- [ ] Học viên tự cài môi trường theo [Setup Guide](../resources/setup-guide.md) mà không cần mentor làm hộ.
- [ ] Học viên chạy `starter-project` bằng `docker compose` từ repo của mình.
- [ ] Học viên nộp ít nhất 5 bài lab bằng PR theo [mẫu báo cáo](../templates/lab-template.md).
- [ ] Mentor chấm theo rubric và trả phản hồi đúng hạn 72 giờ.
- [ ] Học viên tạo cluster kind và triển khai `k8s/` trên máy của mình.
- [ ] Có ít nhất 3 trong 10 tình huống lỗi được giải bởi học viên chỉ với triệu chứng.

## 5. Thu thập feedback

Bốn nguồn dữ liệu:

| Nguồn | Cách thu | Dùng để |
| --- | --- | --- |
| Feedback form sau buổi | Form ngắn (mục 6) | Cảm nhận tức thời về độ khó, tốc độ |
| Ghi chép quan sát | Người quan sát ghi theo mẫu | Thời gian thực, điểm kẹt |
| Issue với nhãn `pilot` | Học viên và mentor mở | Danh sách lỗi cần sửa |
| Phỏng vấn cuối pilot | 20 đến 30 phút mỗi người | Chiều sâu, đề xuất cải tiến |

Mẫu ghi chép quan sát:

```text
Buổi: XX   Quan sát viên: ...
Mốc thời gian | Khối | Điều xảy ra | Học viên kẹt ở đâu | Thời gian kẹt (phút)
Tổng thời gian lab thực tế (L1): ... phút (kế hoạch: 60)
Số lần phải gọi mentor: ...
Số lỗi tài liệu: ...
```

Nguyên tắc: hỏi cụ thể ("bước nào làm bạn mất nhiều thời gian nhất"), không hỏi chung chung ("bạn thấy khóa học thế nào"). Ghi nguyên văn lời học viên.

## 6. Mẫu feedback form

Có thể dùng Google Forms hoặc GitHub Discussions. Không thu thông tin cá nhân không cần thiết.

### Form sau mỗi buổi (3 phút)

```text
1. Buổi số: ____    Mức bạn làm: L1 / L2 / cả hai
2. Bạn hoàn thành lab trong buổi học không?  Có / Gần xong / Không
3. Độ khó của phần kiến thức (1 quá dễ ... 5 quá khó): ____
4. Độ khó của lab (1 quá dễ ... 5 quá khó): ____
5. Tốc độ của buổi học: Quá chậm / Vừa / Quá nhanh
6. Bước nào trong lab làm bạn mất nhiều thời gian nhất? Vì sao?
7. Có chỗ nào trong tài liệu khó hiểu, thiếu hoặc sai? (dán link nếu có)
8. Bạn có lệnh nào chạy khác với "kết quả mong đợi"? Dán output.
9. Một điều bạn học được hôm nay mà trước đó bạn chưa biết:
10. Một điều bạn muốn thay đổi:
```

### Form cuối pilot (10 phút)

```text
1. Bạn tự đánh giá mức tự tin trước và sau khóa với mỗi chủ đề (1 đến 5):
   Linux, Git, Docker, Compose, CI/CD, Kubernetes, Troubleshooting
2. Phần nào của khóa hữu ích nhất? Phần nào ít hữu ích nhất?
3. Khối lượng công việc mỗi tuần (buổi học, lab, assignment) so với thời gian bạn có:
   Quá nhẹ / Vừa / Quá nặng
4. Phần Break (tự gỡ lỗi) giúp bạn học thế nào?
5. Phản hồi của mentor cho bài nộp có giúp bạn cải thiện không? Vì sao?
6. Môi trường (máy, mạng, WSL, Docker) có gây trở ngại lớn không? Cấu hình máy của bạn:
7. Bạn có sẵn sàng giới thiệu khóa này cho bạn bè? (0 đến 10) Vì sao?
8. Bạn có muốn làm Lab Assistant ở khóa sau không?
9. Ba việc đầu tiên bạn muốn mentor sửa trước khi khai giảng:
```

## 7. Tiêu chí go/no-go

Sau pilot, Program Lead họp cùng mentor, xem số liệu và quyết định. Mỗi tiêu chí có ngưỡng bắt buộc (B) hoặc khuyến nghị (K).

| # | Tiêu chí | Ngưỡng | Loại |
| --- | --- | --- | --- |
| 1 | Tỷ lệ học viên pilot hoàn thành tối thiểu 80% lab bắt buộc trong phạm vi pilot | Từ 80% học viên | B |
| 2 | Tất cả lab trong phạm vi pilot chạy được trên máy sạch theo hướng dẫn, không cần can thiệp ngoài tài liệu | 100% | B |
| 3 | Không còn lỗi chặn (blocker): lỗi tài liệu hoặc starter project khiến học viên không thể tiếp tục | 0 lỗi mở | B |
| 4 | L1 hoàn thành trong 60 phút lab bởi ít nhất 70% học viên | Từ 70% | B |
| 5 | Máy 8 GB chạy được các lab quan trọng theo hướng dẫn máy yếu (có thể giảm replica) | Có | B |
| 6 | Quy trình chấm bài và PR review chạy ổn, phản hồi đúng hạn 72 giờ | Từ 90% bài | K |
| 7 | Điểm hài lòng trung bình (câu 7 form cuối) | Từ 8 trên 10 | K |
| 8 | Có ít nhất 3 trong 10 tình huống lỗi học viên giải được từ triệu chứng | Có | K |
| 9 | Có ít nhất 1 học viên pilot đồng ý làm Lab Assistant | Có | K |
| 10 | Starter project: CI của repo giáo trình xanh trên nhánh chính | Xanh | B |

Quyết định:

- Go: toàn bộ tiêu chí B đạt và ít nhất 3 trên 4 tiêu chí K đạt.
- Go có điều kiện: thiếu một hoặc hai tiêu chí B nhưng có kế hoạch sửa rõ ràng, ngày hoàn thành trước khai giảng, và người phụ trách. Chạy lại phần liên quan của pilot để xác nhận.
- No-go: từ ba tiêu chí B không đạt, hoặc có lỗi blocker không sửa được kịp. Lập kế hoạch sửa, chạy pilot lần hai cho phần đó.

Ghi quyết định, số liệu và danh sách việc phải sửa trong một Issue "Pilot report" và đưa vào `CHANGELOG.md` khi phát hành phiên bản (xem [Quản lý repo giáo trình](repo-governance.md)).

## 8. Mẫu báo cáo pilot

```text
Pilot report - Curriculum v1.0
Thời gian: ... đến ...        Số học viên: ...
Phạm vi: đầy đủ / rút gọn (liệt kê buổi)
Tóm tắt kết quả: (3 đến 5 dòng)
Số liệu: tỷ lệ hoàn thành lab, thời gian L1 trung bình, điểm hài lòng
Top 10 vấn đề và trạng thái: (link Issue)
Rủi ro còn lại:
Quyết định: Go / Go có điều kiện / No-go
Người quyết định và ngày:
```

## 9. Sau pilot

- [ ] Đóng hoặc lên lịch mọi Issue gắn nhãn `pilot`.
- [ ] Cập nhật tài liệu, slide, starter project.
- [ ] Chạy lại phần bị lỗi trên máy sạch để xác nhận đã sửa.
- [ ] Cập nhật [ROADMAP](../ROADMAP.md): mục 7 và mục 8 chuyển trạng thái.
- [ ] Mời học viên pilot làm Lab Assistant, ghi nhận đóng góp của họ.
- [ ] Rà [Điều kiện mở khóa](launch-checklist.md) và tick các mục tương ứng.
