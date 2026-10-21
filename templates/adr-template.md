# ADR-NNNN – Tiêu đề quyết định

> **Tóm tắt:** Architecture Decision Record ghi lại một quyết định kiến trúc quan trọng: bối cảnh, lựa chọn, lý do và hệ quả. Đặt file tại `docs/adr/NNNN-ten-quyet-dinh.md` trong repo nhóm; mỗi quyết định một file ngắn, tối đa một trang.

- Trạng thái: Đề xuất / Đã chấp nhận / Thay thế bởi ADR-NNNN
- Ngày: YYYY-MM-DD
- Người quyết định: tên các thành viên

## Bối cảnh

Vấn đề cần giải quyết là gì? Ràng buộc nào có hiệu lực (local-only, thời gian, kỹ năng nhóm)?

## Các lựa chọn đã cân nhắc

| Lựa chọn | Ưu điểm | Nhược điểm |
| --- | --- | --- |
| Lựa chọn A | | |
| Lựa chọn B | | |

## Quyết định

Chọn lựa chọn nào, và vì sao (nối với ràng buộc ở trên).

## Hệ quả

- Điều trở nên dễ hơn:
- Điều trở nên khó hơn hoặc rủi ro mới:
- Việc cần làm tiếp:

## Ví dụ chủ đề ADR cho Capstone

- Chiến lược tag image: SHA, semver hay cả hai
- PostgreSQL trên Kubernetes: StatefulSet có PVC hay cách khác
- Truy cập từ ngoài cluster: Ingress hay port-forward
- Chiến lược test backend: mock database hay database thật trong CI
- Công cụ quét image và ngưỡng chặn pipeline
