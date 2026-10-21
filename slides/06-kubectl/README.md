# Slide deck 06 – kubectl & Workloads

> **Tóm tắt:** Deck gồm 58 slide cho ba buổi 23-25: dùng kubectl thành thạo, nối ứng dụng bằng Service và DNS, tách cấu hình bằng ConfigMap và Secret.

## Các buổi trong deck

| Buổi | Chủ đề | Số slide | Slide | Bài lab |
| --- | --- | --- | --- | --- |
| 23 | kubectl Fundamentals – context, namespace, get, describe, apply, delete, logs, exec, port-forward | 20 | [session-23.md](session-23.md) | [Lab buổi 23](../../labs/week-12/session-23.md) |
| 24 | Kubernetes Services – ClusterIP, NodePort, LoadBalancer, service discovery, DNS | 19 | [session-24.md](session-24.md) | [Lab buổi 24](../../labs/week-12/session-24.md) |
| 25 | Configuration Management – ConfigMap, Secret, biến môi trường, mounted configuration | 19 | [session-25.md](session-25.md) | [Lab buổi 25](../../labs/week-13/session-25.md) |

Tổng cộng: 58 slide.

## Mục tiêu của deck

- Giúp học viên luôn biết kubectl đang tác động vào cluster và namespace nào.
- Dùng `get`, `describe`, events, `logs`, `exec` để chẩn đoán thay vì đoán mò.
- Hiểu Service, Endpoints và DNS đủ để nối Frontend với Backend và sửa lỗi Endpoints rỗng.
- Tách cấu hình khỏi image, hiểu khi nào Pod thấy giá trị mới, và biết base64 không phải bảo mật.
- Hỗ trợ mentor dẫn lab: mỗi buổi có lệnh, kết quả mong đợi, tình huống lỗi và ghi chú giảng viên.

## Cấu trúc mỗi buổi

Mỗi buổi theo 10 phần: Learning objectives, Problem statement, Concept, Architecture, How it works, Demo, Hands-on lab (L1/L2), Common mistakes, Challenge, Recap. Mỗi slide chỉ có một ý chính; phần ghi chú giảng viên nằm trong khối "Ghi chú giảng viên" dưới mỗi slide.

## Mẹo trình bày

- Chiếu bằng trình duyệt: mở trang slide của buổi trên site, bật toàn màn hình (F11) và cuộn từng slide.
- Cỡ chữ: phóng to trình duyệt (Ctrl và dấu cộng) tới khi người ngồi cuối lớp đọc được code block.
- Chia sẻ terminal: dùng chữ cỡ lớn, nền tối, một cửa sổ cho lệnh chính và một cửa sổ riêng cho `port-forward` hoặc `-w`.
- Làm demo trong WSL2 Ubuntu, trong thư mục dưới `~`, không dùng `/mnt/c`.
- Luôn chạy `kubectl config current-context` trước khi gõ lệnh phá hoại để lớp thấy thói quen kiểm tra ngữ cảnh.
- Cổng local dùng 8081 hoặc 13000 để không đụng 8080 của Compose.
- Chuẩn bị sẵn cluster kind và các image `club-api:1.0.0`, `club-web:1.0.0` trước giờ học.
