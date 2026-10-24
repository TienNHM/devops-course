# Kịch bản mentor – Buổi 19: CD & Deployment Strategies

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md). Slide: [Slide buổi 19](../../slides/04-cicd/session-19.md). Đáp án và barem: [Walkthrough tuần 10](../walkthroughs/week-10.md), [Chấm điểm tuần 10](../grading/week-10.md).
:::

## Khung thời gian buổi (120 phút)

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian gợi ý cho phần thực hành của buổi 19: chuẩn bị 10', Phần 1-3 khoảng 30', Phần 4 khoảng 20' (L2 có thể làm tiếp ở nhà).

## Chuẩn bị trước buổi

- Học viên phải có image `sha-...` trên GHCR từ buổi 18; nếu chưa có thì dùng tag của mentor.
- Chuẩn bị sẵn hai tag trên GHCR cho demo: `TAG_GOOD` (bản khỏe) và `TAG_BAD` (bản cố ý hỏng nhưng vẫn build được).
- Không hứa với học viên rằng approval (required reviewers) luôn dùng được: repo private có thể cần gói trả phí.

## Demo của mentor

Mục tiêu demo: một lần deploy thành công, một lần deploy hỏng tự rollback. Mentor chuẩn bị sẵn hai tag trên GHCR: `TAG_GOOD` (bản khỏe) và `TAG_BAD` (bản cố ý hỏng nhưng vẫn build được, ví dụ đổi dòng cuối Dockerfile thành `CMD ["node", "-e", "process.exit(1)"]` để container thoát ngay nên `/ready` không bao giờ trả lời).

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

Câu hỏi mentor nên hỏi lớp:

- Nếu mentor dùng tag `latest`, bước rollback sẽ đưa chúng ta về đâu?
- Vì sao script ghi tag mới vào file trạng thái chỉ sau khi health check đạt?
- Rollback code có đưa dữ liệu trong database về như cũ không?
- Máy này không có IP public. Làm sao GitHub vẫn "ra lệnh" được cho deploy?

## Ghi chú giảng viên theo slide

Các ghi chú dưới đây lấy nguyên từ slide buổi 19 (đã bỏ khỏi slide).

| Slide | Ghi chú |
| --- | --- |
| Mục tiêu buổi học | 2 phút. Nhắc học viên phải có image `sha-...` trên GHCR từ buổi 18, nếu chưa có thì dùng tag của mentor. |
| Vấn đề "chạy được trên máy tôi" | Kể lại câu chuyện 2 phút. Hỏi lớp: nếu API chết lúc demo, bạn quay về bản trước bằng cách nào? |
| Delivery và Deployment | Hỏi: chữ "D" trong CD là gì, hai nghĩa khác nhau ở đâu? 2 phút. |
| Artifact bất biến và tag | Câu hỏi: nếu dùng `latest`, bước rollback đưa chúng ta về đâu? 2 phút. |
| Environment, secrets, approval | Không hứa với học viên rằng approval luôn dùng được. 3 phút. |
| Bốn chiến lược deploy | Chỉ cần hiểu khái niệm với Blue/Green và Canary. Hỏi: Compose trên một máy tương ứng chiến lược nào? 3 phút. |
| Rollback tốt là hành động nhàm chán | Tình huống cho lớp: bản mới xóa một cột rồi hỏng, rollback code đủ chưa? Đáp án: không. 3 phút. |
| Kiến trúc deploy local | Nhấn mạnh chiều "kéo" (pull): máy local chủ động lấy image, không cần mở cổng. 3 phút. |
| Self-hosted runner kết nối ra | Câu hỏi: máy này không có IP public, làm sao GitHub vẫn "ra lệnh" được? 2 phút. |
| Compose override chạy image từ registry | Lưu tên file là `compose.deploy.yaml`. Compose gộp hai file, `--no-build` khi chạy để dùng image. 3 phút. |
| Demo deploy-local.sh (phần đầu) | Đọc từng khối ngắn. Rollback chỉ là gán `TAG=$previous` rồi chạy tiếp luồng deploy. 4 phút. |
| Demo deploy-local.sh (pull, up, health) | Hỏi: vì sao ghi `current-tag` chỉ sau khi health OK? Vì file phải chỉ chứa bản đã xác nhận chạy được. 4 phút. |
| Demo deploy tốt rồi deploy hỏng | Mentor chuẩn bị sẵn hai tag trước buổi học. Trong lúc chờ health, hỏi: rollback code có đưa dữ liệu database về như cũ không? 5 phút. |
| Lab L1 - chuẩn bị | Mật khẩu trong `.env` chỉ là giá trị local. Nhắc: không viết token vào file. 10 phút chuẩn bị. |
| Lab L1 - deploy, lần hai, rollback | Phần 1-3 khoảng 30 phút. Giải thích hành vi hoán đổi tag sau rollback và yêu cầu học viên ghi vào report. Dùng `/ready` vì nó chạy `SELECT 1`, còn `/health` thì không chạm database. |
| Lab L2 - workflow_dispatch | Giải thích: checkout dọn sạch workspace nên `.env` và `.deploy/` mất, vì vậy dùng secret `DB_PASSWORD` và đặt state ngoài workspace. Input `tag` đi qua `env`, không nhúng vào `run`. 4 phút. |
| Quy tắc an toàn cho self-hosted runner | Tình huống: một bạn mở pull request từ fork vào repo public có runner của bạn. Rủi ro: code lạ chạy trên máy bạn. 3 phút. |
| Lab L2 - chặn tag không tồn tại | Đây là phần học viên L2 tự viết; chiếu khối này chỉ sau khi họ thử. `docker manifest inspect` trả mã khác 0 nếu tag không tồn tại hoặc không có quyền. |
| Lỗi - deploy xong nhưng stack không lên | Cùng họ lỗi với scenario-03 và scenario-04. Để học viên đọc triệu chứng và tự tìm nguyên nhân trước. 5 phút. |
| Lỗi thường gặp và thử thách | Nộp bài vào `lab-19/`: `compose.deploy.yaml`, `deploy-local.sh`, `.gitignore`, workflow nếu L2, log evidence. Kiểm tra bằng `git grep -i password` không lộ secret. 3 phút. |
| Recap | Exit ticket: mỗi bạn nói một lý do script ghi trạng thái sau health check. Dành 15 phút review xem log deploy và rollback. |

## Lưu ý riêng cho người dạy

- Buổi này nhấn mạnh local-only: không bao giờ chỉ học viên mở cổng router hay expose máy ra Internet; nếu có bạn hỏi "làm sao GitHub đẩy vào máy mình", quay lại sơ đồ pull và runner kết nối ra.
- Self-hosted runner chỉ làm trong lúc demo hoặc ở repo private của học viên. Nhắc đây là phần L2, không bắt buộc.
- Đáp án đầy đủ của phần Phá lỗi (đổi `DB_PASSWORD`) và lời giải L2 nằm ở [Walkthrough tuần 10](../walkthroughs/week-10.md); bài học viên giữ mục Phá lỗi nâng cao (triệu chứng, hướng điều tra, nguyên nhân) trong trang session-19-challenge, gập sẵn.
- Lời giải L2 (vòng `docker manifest inspect`) đã được chuyển khỏi bài học viên; học viên tự thử trước.
