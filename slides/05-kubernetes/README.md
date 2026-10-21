# Slide deck 05 – Kubernetes Foundation

Kubernetes Foundation: kiến trúc cluster, kind, Pod, ReplicaSet, Deployment. Tổng cộng 40 slide (2 buổi, mỗi buổi 20 slide).

## Các buổi trong deck

| Buổi | Chủ đề | Slide | Bài lab |
| --- | --- | --- | --- |
| 21 | Kubernetes Introduction | [Slide buổi 21](session-21.md) | [Lab buổi 21](../../labs/week-11/session-21.md) |
| 22 | Pods & Deployments | [Slide buổi 22](session-22.md) | [Lab buổi 22](../../labs/week-11/session-22.md) |

## Mục tiêu deck

- Hiểu vì sao cần orchestration và Kubernetes giải quyết điều gì mà Compose không làm được.
- Nắm các thành phần control plane, worker node và đường đi của một yêu cầu `kubectl`.
- Tự dựng cluster local bằng kind, làm quen kubectl và context.
- Vận hành Club API bằng Deployment: rolling update, rollback, chẩn đoán ImagePullBackOff.

## Cấu trúc mỗi buổi

1. Learning objectives
2. Problem statement
3. Concept
4. Architecture
5. How it works
6. Demo
7. Hands-on lab (L1 và L2)
8. Common mistakes
9. Challenge
10. Recap

Nguyên tắc: một slide chỉ một ý chính; mỗi câu lệnh có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi. Phần "Ghi chú giảng viên" ở cuối mỗi slide có lời dẫn, thời lượng và câu hỏi cho lớp.

## Mẹo trình bày

- Mở trang slide bằng trình duyệt, phóng to bằng Ctrl và dấu cộng để chữ đọc được từ cuối lớp (nên dùng cỡ chữ tương đương 125% đến 150%).
- Các khối "Ghi chú giảng viên" đã được thu gọn, chỉ mở khi cần xem lời dẫn; đừng mở khi chiếu cho lớp.
- Chia sẻ màn hình terminal WSL với cỡ chữ lớn, nền tối, chỉ để một cửa sổ để lớp theo dõi; chạy `clear` trước mỗi bước demo.
- Chuẩn bị sẵn cluster và image trước giờ học (đặc biệt `docker pull` và `kind load` khi mạng lớp yếu) vì tạo cluster lần đầu mất vài phút.
- Với lệnh dài, dán sẵn vào file ghi chú và chạy từng đoạn để tránh gõ sai trước lớp.
- Không hiển thị mật khẩu, token hay nội dung kubeconfig khi chia sẻ màn hình.
