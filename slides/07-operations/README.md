# Slide deck 07 – Kubernetes Operations

Resource, Health, Storage, Ingress, Rollout, Troubleshooting · 57 slide · 3 buổi (26–28)

## Các buổi trong deck

| Buổi | Chủ đề | Số slide | Slide | Lab |
| --- | --- | --- | --- | --- |
| 26 | Resource & Health: requests, limits, QoS, startup/readiness/liveness probe, OOMKilled | 18 | [Slide buổi 26](session-26.md) | [Lab buổi 26](../../labs/week-13/session-26.md) |
| 27 | Storage & Ingress: PV, PVC, StorageClass, ingress-nginx, routing theo host | 19 | [Slide buổi 27](session-27.md) | [Lab buổi 27](../../labs/week-14/session-27.md) |
| 28 | Kubernetes Operations: rollout, rollback, scale, events, ImagePullBackOff, CrashLoopBackOff, Pending | 20 | [Slide buổi 28](session-28.md) | [Lab buổi 28](../../labs/week-14/session-28.md) |

## Mục tiêu của deck

- Đặt tài nguyên và health check đúng để Kubernetes quản lý club-api an toàn.
- Giữ dữ liệu Postgres bằng PVC và mở ứng dụng qua một cổng vào duy nhất (`club.localhost`).
- Vận hành workload: cập nhật, quay lui, mở rộng và đọc bằng chứng khi có lỗi.
- Chẩn đoán từ triệu chứng tới nguyên nhân gốc thay vì đoán mò, và ghi lại bằng Troubleshooting report.

## Template mỗi buổi

1. Learning objectives
2. Problem statement – vấn đề thực tế
3. Concept – khái niệm cần hiểu
4. Architecture – sơ đồ giải thích
5. How it works – quy trình hoạt động
6. Demo – giảng viên thực hiện
7. Hands-on lab – học viên tự thực hành (L1 và L2)
8. Common mistakes – lỗi thường gặp
9. Challenge – bài tập nâng cao
10. Recap – kiến thức cần nhớ

Nguyên tắc: một slide chỉ một ý chính; mỗi câu lệnh có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi. Mỗi slide có khối "Ghi chú giảng viên" (bấm để mở) chứa lời dẫn, thời lượng và câu hỏi cho lớp.

## Mẹo trình bày

- Chiếu trực tiếp trang slide của site trong trình duyệt, bật toàn màn hình (F11) và phóng to bằng Ctrl và dấu cộng cho tới khi code block đọc được từ cuối phòng.
- Cỡ chữ terminal tối thiểu 18-20 pt; dùng giao diện sáng hoặc tương phản cao, tránh dòng lệnh dài quá chiều ngang màn hình.
- Chia sẻ màn hình terminal WSL riêng, không chia sẻ cửa sổ có chứa token hay biến môi trường nhạy cảm; giấu prompt dài bằng cách đặt `PS1='$ '`.
- Với demo cần theo dõi liên tục, mở hai terminal: một chạy `kubectl get pods -w`, một chạy lệnh thay đổi.
- Chuẩn bị cluster kind sẵn trước giờ học và chạy thử mọi lệnh demo một lần; tên Pod, ReplicaSet và tên PV trong slide chỉ là ví dụ.
- Khối ghi chú giảng viên đóng sẵn; mở khi cần xem lời dẫn, đừng mở khi chiếu cho lớp.
