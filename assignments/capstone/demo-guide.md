# Capstone – Hướng dẫn demo và bảo vệ kỹ thuật

> **Tóm tắt:** Mỗi nhóm có 10 phút demo và 5 phút hỏi đáp. Trang này có kịch bản từng phút, checklist chuẩn bị, bộ câu hỏi mentor hay dùng và tiêu chí đánh giá.

Quay lại [đề bài Capstone](README.md) · [Milestones](milestones.md) · [Rubric](../../curriculum/capstone-rubric.md).

## 1. Nguyên tắc

- Demo là **chứng minh hệ thống chạy và bạn hiểu vì sao nó chạy**, không phải đọc lại README.
- Cả nhóm cùng tham gia: mỗi thành viên nói ít nhất một đoạn và có thể bị hỏi bất cứ phần nào.
- Chạy thật trên máy của nhóm. Video chỉ là phương án dự phòng, dùng khi có sự cố mạng và phải nói rõ với mentor.
- Chuẩn bị trước một trạng thái sạch: cluster kind đã tạo, image đã sẵn, nhưng ứng dụng chưa triển khai (để triển khai ngay trên màn hình), hoặc đã triển khai và bạn chỉ trình bày kiểm tra. Hãy chọn một và thống nhất trước.

## 2. Kịch bản 10 phút

| Phút | Nội dung | Người nói gợi ý | Nên cho xem |
| --- | --- | --- | --- |
| 0:00–1:00 | Bài toán và kiến trúc | Người phụ trách tài liệu | Architecture diagram trong README |
| 1:00–2:30 | Quy trình Git và đóng góp | Trưởng nhóm | Project board, một PR có review, lịch sử `main` |
| 2:30–4:00 | Chạy bằng Docker Compose | Phụ trách Compose | `docker compose up -d --build`, `docker compose ps`, thao tác CRUD trên giao diện, `down` rồi `up` để thấy dữ liệu còn |
| 4:00–5:30 | CI/CD | Phụ trách CI/CD | Một run Actions xanh, một run đỏ đã được sửa, image trên GHCR với tag SHA hoặc phiên bản |
| 5:30–7:30 | Kubernetes | Phụ trách Kubernetes | `kubectl get pods -n club`, truy cập qua browser, scale backend lên 3 và về 2, xóa một Pod để thấy tự phục hồi |
| 7:30–9:00 | Sự cố có chủ đích | Người được mentor chọn tại chỗ hoặc cả nhóm | Tạo một lỗi (ví dụ sai tag image), đọc `kubectl describe pod` và events, tìm nguyên nhân, sửa |
| 9:00–10:00 | Bài học và hạn chế | Cả nhóm | Điều làm tốt, điều còn thiếu, việc sẽ làm nếu có thêm thời gian |

Mẹo: ghi sẵn các lệnh dài vào một file `demo.sh` hoặc `docs/demo-commands.md` để gõ nhanh, nhưng vẫn phải giải thích từng lệnh làm gì.

## 3. Kịch bản lệnh tham khảo

Điều chỉnh tên cho khớp với repo nhóm.

```bash
# Compose
docker compose up -d --build
docker compose ps
curl -s http://localhost:3000/health
docker compose down
docker compose up -d
curl -s http://localhost:3000/api/members

# Kubernetes
kubectl get pods -n club
kubectl scale deployment club-api -n club --replicas=3
kubectl rollout status deployment/club-api -n club
kubectl scale deployment club-api -n club --replicas=2
kubectl delete pod -n club -l app=club-api --wait=false
kubectl get pods -n club -w
```

Ghi chú: nhãn `app=club-api` phải khớp với nhãn trong manifest của nhóm. Kiểm tra bằng `kubectl get pods -n club --show-labels`. Dừng `kubectl get pods -w` bằng Ctrl+C.

Một sự cố demo an toàn: đổi tag image của Deployment sang tag không tồn tại, quan sát Pod mới rơi vào `ErrImagePull` hoặc `ImagePullBackOff` trong khi Pod cũ vẫn phục vụ (rolling update giữ bản cũ), sau đó dùng `kubectl rollout undo` để quay lại.

```bash
kubectl set image deployment/club-api api=club-api:does-not-exist -n club
kubectl get pods -n club
kubectl describe pod -n club -l app=club-api
kubectl rollout undo deployment/club-api -n club
```

Tên container (`api` trong lệnh trên) phải lấy từ manifest của nhóm. Xem bằng `kubectl get deployment club-api -n club -o jsonpath='{.spec.template.spec.containers[*].name}'`.

## 4. Chuẩn bị trước demo

- [ ] Docker Desktop đang chạy, WSL2 đã bật, đã đăng nhập đúng tài khoản GitHub
- [ ] Cluster kind sẵn sàng (`kubectl get nodes` báo Ready), image đã nạp nếu dùng `kind load`
- [ ] Các cổng cần dùng (ví dụ 8080) đang rảnh
- [ ] Terminal cỡ chữ lớn, đóng ứng dụng thông báo, tắt thông tin nhạy cảm trên màn hình
- [ ] Đã chạy thử toàn bộ kịch bản từ đầu ít nhất một lần, có bấm giờ
- [ ] Có video dự phòng và ảnh chụp các kết quả quan trọng
- [ ] Đã quyết định ai trả lời câu hỏi nào, nhưng ai cũng sẵn sàng trả lời

## 5. Xử lý khi demo gặp lỗi

1. Bình tĩnh, nói to điều bạn thấy: "Pod đang ở trạng thái Pending".
2. Áp dụng quy trình gỡ lỗi của khóa: xem triệu chứng, đọc log và events, nêu giả thuyết, kiểm chứng.
3. Nếu quá 2 phút chưa xử lý được, nói rõ với mentor và chuyển sang video dự phòng. Cách xử lý lỗi rõ ràng được đánh giá cao hơn việc im lặng.
4. Không sửa bằng cách xóa sạch rồi làm lại mà không giải thích nguyên nhân.

## 6. Hỏi đáp kỹ thuật (5 phút)

Mentor chọn câu hỏi theo bài làm của nhóm và có thể chỉ định bất kỳ thành viên nào. Nhóm nên tự luyện các câu dưới đây.

### Git và quy trình

- Vì sao bạn dùng PR thay vì push thẳng vào `main`? Điều gì xảy ra khi CI fail?
- Cho xem một PR mà reviewer đã yêu cầu thay đổi. Bạn xử lý thế nào?
- Nếu lỡ commit file `.env` thì làm gì (thứ tự các bước)?

### Docker

- Vì sao dùng multi-stage build? Image cuối cùng chứa những gì và không chứa gì?
- Thứ tự các lệnh `COPY` trong Dockerfile ảnh hưởng đến cache build như thế nào?
- Container chạy bằng user nào? Vì sao không nên chạy bằng root?
- Khác nhau giữa `CMD` và `ENTRYPOINT`, giữa `COPY` và `ADD`?

### Compose và dữ liệu

- Backend gọi PostgreSQL bằng tên gì, vì sao tên đó phân giải được?
- `docker compose down` và `docker compose down -v` khác nhau thế nào? Dữ liệu nằm ở đâu?
- `depends_on` với `condition: service_healthy` giải quyết vấn đề gì? Nó có đảm bảo database sẵn sàng mãi mãi không?

### CI/CD

- Workflow chạy khi nào? Job nào chặn merge?
- Vì sao dùng `GITHUB_TOKEN` thay vì Personal Access Token để push lên GHCR? Quyền `packages: write` đặt ở đâu và vì sao ở đó?
- Tag image của nhóm được tạo thế nào? Làm sao truy ngược từ Pod đang chạy về commit?
- Nếu muốn thêm bước quét lỗ hổng thì đặt ở đâu trong pipeline và fail theo tiêu chí nào?

### Kubernetes

- Khác nhau giữa Deployment và StatefulSet? Vì sao PostgreSQL dùng StatefulSet (hoặc vì sao nhóm chọn cách khác)?
- Liveness và readiness probe khác nhau thế nào? Điều gì xảy ra nếu readiness fail? Nếu liveness fail?
- Service tìm Pod bằng cơ chế nào? Chuyện gì xảy ra nếu selector sai nhãn?
- Dữ liệu PostgreSQL có mất khi Pod bị xóa không? Còn khi xóa PVC?
- Secret có thực sự "bí mật" không? Nó được mã hóa hay chỉ mã hóa base64? Bạn có thể bảo vệ nó thêm bằng cách nào?
- Rolling update hoạt động thế nào? `maxUnavailable` và `maxSurge` nghĩa là gì? Rollback bằng lệnh nào?

### Troubleshooting và vận hành

- Pod ở trạng thái `CrashLoopBackOff`: bạn kiểm tra theo thứ tự nào? (gợi ý: `describe`, `logs --previous`, events)
- API trả 500, làm sao biết lỗi do ứng dụng, do database hay do mạng?
- Sự cố nào trong troubleshooting log mất nhiều thời gian nhất? Bạn đã học được gì?

### Bảo mật

- Secret nào có trong hệ thống? Chúng được tạo ở đâu và không nằm ở đâu?
- Kết quả quét image của nhóm có lỗ hổng mức cao không? Bạn xử lý hay chấp nhận rủi ro và vì sao?
- Nếu token GHCR bị lộ thì làm gì?

### Câu hỏi mở rộng (cho mức Excellent)

- Nếu có 10.000 thành viên và nhiều người dùng đồng thời, nút thắt đầu tiên là gì?
- Bạn sẽ thêm giám sát (metrics, alert) như thế nào?
- Sao lưu PostgreSQL định kỳ thế nào? Đã thử khôi phục chưa?
- Chuyển từ kind sang cluster thật cần thay đổi những gì?

## 7. Tiêu chí đánh giá buổi demo (10 điểm trong rubric)

| Tiêu chí | Điểm tối đa | Nhìn vào |
| --- | --- | --- |
| Demo chạy được, đúng kịch bản | 4 | Hệ thống hoạt động thật, không phải ảnh chụp |
| Giải thích kỹ thuật chính xác | 3 | Trả lời đúng lý do, không chỉ nêu lệnh |
| Làm việc nhóm và truyền đạt | 2 | Mọi người cùng nói, quản lý thời gian |
| Xử lý sự cố và nhận định hạn chế | 1 | Biết điều gì chưa tốt và nói trung thực |

Mức điểm chi tiết theo bốn bậc nằm ở [Rubric Capstone](../../curriculum/capstone-rubric.md), tiêu chí số 10.

## 8. Nhận xét sau demo

Mentor ghi nhận xét theo ba mục: điều làm tốt, rủi ro kỹ thuật chính, một việc nhóm nên làm tiếp. Học viên đưa nhận xét này vào mục "Có thể cải thiện gì" trong báo cáo cuối.
