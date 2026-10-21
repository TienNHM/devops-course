# Dành cho mentor

> **Tóm tắt:** Khu vực này dành cho Program Lead, Technical Mentor và Lab Assistant của khóa DevOps. Nội dung giúp một đội mentor mới nhận bàn giao có thể chuẩn bị, dạy, chấm bài và duy trì khóa học mà không cần người cũ ngồi cạnh.

Khóa học kéo dài 16 tuần, 32 buổi, mỗi buổi 120 phút. Học viên có trình độ không đều, vì vậy chất lượng buổi học phụ thuộc nhiều vào việc mentor chuẩn bị kỹ và điều hành đúng nhịp. Các trang dưới đây tách riêng từng mảng việc để tra cứu nhanh.

## Các trang trong mục này

| Trang | Dùng khi nào |
| --- | --- |
| [Sổ tay mentor](handbook.md) | Đọc đầu tiên: vai trò, cách phân bổ hoạt động, chấm bài, office hour, an toàn, tuyển và đào tạo mentor |
| [Runbook một buổi học](session-runbook.md) | Mở ra trước và trong mỗi buổi: checklist chuẩn bị, đồng hồ 120 phút, xử lý sự cố ngày học |
| [Kế hoạch pilot](pilot-plan.md) | Chạy thử khóa với 3 đến 5 thành viên trước khi mở rộng, kèm feedback form và tiêu chí go/no-go |
| [Điều kiện mở khóa](launch-checklist.md) | Kiểm tra khóa đã sẵn sàng khai giảng chưa |
| [Quản lý repo giáo trình](repo-governance.md) | Đóng góp nội dung, versioning, changelog, repo đáp án private, cập nhật công cụ mỗi kỳ |

## Lộ trình đọc cho mentor mới

1. Đọc [Sổ tay mentor](handbook.md) từ đầu đến cuối (khoảng 40 phút).
2. Đọc [lịch học 16 tuần](../curriculum/schedule.md) và [cách đánh giá](../curriculum/assessment.md).
3. Cài môi trường theo [Setup Guide](../resources/setup-guide.md) trên một máy sạch hoặc máy ảo và tự chạy lab của tuần đầu.
4. Dự (shadow) ít nhất một buổi do mentor có kinh nghiệm dẫn, sau đó đồng dẫn một buổi.
5. Mở [Runbook](session-runbook.md) và chuẩn bị buổi học đầu tiên của bạn theo đúng checklist.

## Nguyên tắc chung của khóa

- Triết lý: Learn, Build, Break, Debug, Deploy, Explain. Học viên phải tự làm hỏng và tự sửa, không chỉ xem demo.
- Hai mức độ cho mỗi lab: L1 (Foundation, làm theo hướng dẫn) và L2 (Engineering, tự triển khai, giải thích, xử lý lỗi).
- Chỉ chạy local: Windows 11, WSL2 Ubuntu, Docker Desktop, kind, GitHub Actions và GHCR. Không expose máy học viên ra Internet.
- Mentor không làm thay. Mentor đặt câu hỏi để học viên tự tìm ra nguyên nhân.

## Liên quan

- [Lộ trình phát triển khóa (ROADMAP)](../ROADMAP.md)
- [Hướng dẫn đóng góp](../CONTRIBUTING.md)
- [10 tình huống lỗi](../examples/troubleshooting-scenarios.md)
