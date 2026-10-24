# Kịch bản buổi 19 – CD & Deployment Strategies

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md) và [Thử thách L2](../../labs/week-10/session-19-challenge.md). Slide: [Slide buổi 19](../../slides/04-cicd/session-19.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 10](../grading/week-10.md). Đáp án: [Đáp án tuần 10](../walkthroughs/week-10.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 19: khung 120 phút, chuẩn bị trước buổi, demo deploy tốt rồi deploy hỏng, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc image `sha-...` đã publish ở buổi 18; hôm nay deploy đúng image đó lên máy local |
| 15-45 | Kiến thức và demo | Delivery và Deployment, tag bất biến, bốn chiến lược deploy, rollback, demo deploy tốt rồi hỏng |
| 45-105 | Thực hành | Chuẩn bị khoảng 10', Phần 1-3 khoảng 30-40'; ai xong sớm làm thử thách L2 |
| 105-120 | Review | Xem log deploy và rollback, exit ticket |

## Chuẩn bị trước buổi

- Học viên phải có image `sha-...` trên GHCR từ buổi 18; nếu chưa có thì dùng tag của mentor.
- Chuẩn bị sẵn hai tag trên GHCR cho demo: `TAG_GOOD` (bản khỏe) và `TAG_BAD` (bản cố ý hỏng nhưng vẫn build được).
- Đừng hứa approval (required reviewers) luôn dùng được: repo private có thể cần gói trả phí.

## Kịch bản demo

Mục tiêu: một lần deploy thành công, một lần deploy hỏng tự rollback. Bản hỏng tạo bằng cách đổi dòng cuối Dockerfile thành `CMD ["node", "-e", "process.exit(1)"]` để container thoát ngay nên `/ready` không bao giờ trả lời.

1. Hiển thị trạng thái ban đầu:

   ```bash
   cd ~/devops-labs/lab-19/source
   docker compose ps 2>/dev/null || echo "chua co stack"
   ```

   Kết quả mong đợi: chưa có stack hoặc danh sách rỗng.

2. Deploy bản tốt:

   ```bash
   OWNER=your-github-user TAG=TAG_GOOD ./deploy-local.sh
   ```

   Kết quả mong đợi (rút gọn):

   ```text
   [deploy] pull image tag TAG_GOOD
   [deploy] compose up
   [deploy] health OK
   [deploy] ghi trang thai: current=TAG_GOOD previous=none
   ```

3. Deploy bản hỏng, quan sát tự rollback:

   ```bash
   OWNER=your-github-user TAG=TAG_BAD ./deploy-local.sh
   cat .deploy/current-tag
   ```

   Kết quả mong đợi (sau tối đa khoảng 60 giây chờ): log có dòng `health FAIL, in log backend`, rồi `rollback ve TAG_GOOD`; `current-tag` vẫn là `TAG_GOOD`. Chạy `curl -s http://localhost:3000/ready` để xác nhận bản tốt đã quay lại (có thể cần vài giây).

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Nếu dùng tag `latest`, bước rollback đưa chúng ta về đâu? | Không xác định: `latest` trôi nổi nên không rollback chính xác được. |
| Vì sao script chỉ ghi tag mới vào file trạng thái sau khi health check đạt? | Để `current-tag` luôn chứa bản đã xác nhận chạy được. |
| Rollback code có đưa dữ liệu trong database về như cũ không? | Không. Migration nên làm kiểu thêm trước, xóa sau. |
| Máy này không có IP public, làm sao GitHub vẫn "ra lệnh" được? | Runner chủ động kết nối ra GitHub qua HTTPS, không có kết nối đi vào. |
| Chữ "D" trong CD có hai nghĩa nào? | Delivery (con người bấm nút) và Deployment (pipeline tự lên môi trường). |
| Compose trên một máy tương ứng chiến lược nào? | Recreate. Kubernetes Deployment mặc định là Rolling. |

## Ghi chú theo slide

Slide buổi 19 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): nhắc học viên phải có image `sha-...` từ buổi 18, nếu chưa có thì dùng tag của mentor.
- Slide 2 – Vấn đề "chạy được trên máy tôi" (2 phút): kể câu chuyện. Hỏi lớp: nếu API chết lúc demo, bạn quay về bản trước bằng cách nào?
- Slide 3 – Delivery và Deployment (2 phút): hỏi chữ "D" trong CD là gì, hai nghĩa khác nhau ở đâu. Khóa này dừng ở Continuous Delivery.
- Slide 4 – Artifact bất biến và tag (2 phút): hỏi nếu dùng `latest` thì rollback đưa chúng ta về đâu.
- Slide 5 – Environment, secrets, approval (3 phút): không hứa approval luôn dùng được; không có approval thì `workflow_dispatch` đã là thao tác chủ động.
- Slide 6 – Bốn chiến lược deploy (3 phút): chỉ cần hiểu khái niệm Blue/Green và Canary. Hỏi: Compose trên một máy tương ứng chiến lược nào?
- Slide 7 – Rollback tốt là hành động nhàm chán (3 phút): tình huống cho lớp: bản mới xóa một cột rồi hỏng, rollback code đủ chưa? Đáp: không.
- Slide 8 – Kiến trúc deploy local (3 phút): nhấn mạnh chiều "kéo" (pull): máy local chủ động lấy image, không cần mở cổng.
- Slide 9 – Self-hosted runner kết nối ra (3 phút): hỏi máy không có IP public thì GitHub ra lệnh bằng cách nào. Tình huống: một bạn mở pull request từ fork vào repo public có runner của bạn; rủi ro là code lạ chạy trên máy bạn.
- Slide 10 – Health check và file trạng thái (4 phút): đọc từng khối ngắn của script. Rollback chỉ là gán `TAG=$previous` rồi chạy tiếp luồng deploy. Hỏi vì sao ghi `current-tag` chỉ sau khi health OK.
- Slide 11 – Demo, deploy tốt rồi deploy hỏng (khoảng 10 phút theo kịch bản demo ở trên): trong lúc chờ health, hỏi rollback code có đưa dữ liệu database về như cũ không.
- Slide 12 – Lab, ba chặng (khoảng 5 phút giới thiệu): dùng `/ready` vì nó chạy `SELECT 1`, còn `/health` không chạm database. Giải thích hành vi hoán đổi tag sau rollback và yêu cầu học viên ghi vào report. File override tên `compose.deploy.yaml`, chạy với `--no-build`. Phần chặn tag không tồn tại và `workflow_dispatch` là L2 (xem mục hỗ trợ thử thách).
- Slide 13 – Lỗi thường gặp (5 phút): nhóm lỗi "deploy xong nhưng stack không lên" cùng họ với scenario-03 và scenario-04; để học viên đọc triệu chứng và tự tìm nguyên nhân trước.
- Slide 14 – Recap (review 15 phút cuối): exit ticket: mỗi bạn nói một lý do script ghi trạng thái sau health check. Dùng thời gian còn lại xem log deploy và rollback.

## Hỗ trợ phần thử thách

Thử thách nằm ở [Thử thách L2](../../labs/week-10/session-19-challenge.md); học viên tự thử trước khi xem lời giải ở [Đáp án tuần 10](../walkthroughs/week-10.md).

- Workflow `workflow_dispatch`: checkout dọn sạch workspace nên `.env` và `.deploy/` mất; vì vậy dùng secret `DB_PASSWORD` và đặt state ngoài workspace. Input `tag` đi qua `env`, không nhúng trực tiếp vào `run`.
- Chặn tag không tồn tại: `docker manifest inspect` trả mã khác 0 nếu tag không tồn tại hoặc không có quyền. Chiếu lời giải chỉ sau khi học viên đã thử.
- Phá lỗi nâng cao (đổi `DB_PASSWORD` sau khi volume đã tạo): đáp án đầy đủ ở walkthrough; `ROLLBACK=1` không giúp vì lỗi nằm ở cấu hình, không ở image.

## Lưu ý riêng cho người dạy

- Buổi này nhấn mạnh local-only: không bao giờ chỉ học viên mở cổng router hay expose máy ra Internet; nếu có bạn hỏi "làm sao GitHub đẩy vào máy mình", quay lại sơ đồ pull và runner kết nối ra.
- Self-hosted runner chỉ làm trong lúc demo hoặc ở repo private của học viên. Nhắc đây là phần L2, không bắt buộc.
- Nộp bài vào `lab-19/`: `compose.deploy.yaml`, `deploy-local.sh`, `.gitignore`, workflow nếu làm L2, log evidence. Kiểm tra bằng `git grep -i password` để chắc không lộ secret.
