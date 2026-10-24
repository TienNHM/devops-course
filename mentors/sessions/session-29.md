# Kịch bản mentor – Buổi 29: Architecture & Planning

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md). Slide: [Slide buổi 29](../../slides/08-capstone/session-29.md). Chấm bài: [Chấm bài tuần 15](../grading/week-15.md). Đáp án: [Walkthrough tuần 15](../walkthroughs/week-15.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 29: khung 120 phút, demo dựng repo nhóm mẫu, câu hỏi cho lớp, ghi chú giảng viên theo từng slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Compose `down` và `down -v`, CI trên PR, Deployment và StatefulSet trên kind; mỗi người chọn mảng sẽ nhận |
| 15-45 | Kiến thức và demo | Requirement kiểm chứng được, kiến trúc, vertical slice, DoD và ADR; demo dựng repo nhóm mẫu (khoảng 10 phút) |
| 45-105 | Thực hành | Lab 5 phần: requirement 10', repo 12', kiến trúc 12', GitHub Projects 14', ADR 12' |
| 105-120 | Review | Mỗi nhóm trình bày 2 phút kiến trúc và một ADR, nhóm khác đặt một câu hỏi |

## Demo của mentor

Mentor chiếu màn hình và dựng "repo nhóm mẫu" trước lớp trong khoảng 10 phút. Học viên chỉ quan sát và ghi lại điều không hiểu.

1. **Tạo repo từ starter-project** (giả sử bản sao giáo trình ở `~/devops-course`):

   ```bash
   mkdir -p ~/demo-club && cp -a ~/devops-course/starter-project/. ~/demo-club/
   cd ~/demo-club
   git init -b main
   git status --short
   ```

   Kết quả mong đợi: `Initialized empty Git repository`, sau đó danh sách `??` gồm `.env.example`, `.gitignore`, `README.md`, `backend/`, `compose.yaml`, `database/`, `frontend/`, `k8s/`.

   Câu hỏi cho lớp: "Nếu em tạo file `.env` ngay bây giờ, `git status` có hiện nó không? Làm sao biết chắc?"

2. **Kiểm tra `.gitignore` bằng chứng cứ, không bằng niềm tin:**

   ```bash
   cp .env.example .env
   git check-ignore -v .env
   git status --short | grep -c "\.env$"
   ```

   Kết quả mong đợi: dòng đầu in `.gitignore:1:.env	.env` (file `.gitignore`, dòng 1, mẫu `.env`); lệnh `grep -c` in `0`. Đó là bằng chứng `.env` bị chặn.

3. **Vẽ kiến trúc trong 3 phút:** mentor mở README, dán sơ đồ mermaid ở mục trên và thêm một thành phần nhóm tự bổ sung (ví dụ bước quét image bằng Trivy trong CI), rồi hỏi: "Thành phần mới này nằm ở đâu trong luồng? Vì sao?"

4. **Một ADR mẫu:** mentor điền nhanh một ADR về chiến lược tag image (bản mẫu ở [Buổi 29 – Thử thách thêm](../../labs/week-15/session-29-challenge.md#adr-mau)), đọc to phần "Hệ quả" và hỏi: "Điều gì trở nên khó hơn sau quyết định này?"

5. **Bảng GitHub Projects:** mentor tạo Issue "Add DELETE /api/members/:id" với checklist, gán owner, size M, milestone M2, rồi kéo thẻ qua các cột. Nhấn mạnh quy tắc WIP: mỗi người tối đa 2 thẻ `In progress`.

## Câu hỏi mentor nên hỏi lớp

- Nếu em tạo `.env` bây giờ, `git status` có hiện không? Làm sao biết chắc? (Bằng chứng là `git check-ignore -v .env`, không phải niềm tin.)
- Thành phần mới (ví dụ quét image) nằm ở đâu trong luồng? Vì sao? (Sau build, trước push.)
- Điều gì trở nên khó hơn sau quyết định tag image này? (Manifest k8s phải cập nhật tag mỗi lần triển khai.)
- Nếu A làm Docker và B làm Kubernetes riêng, ai phát hiện image không khớp manifest, và khi nào?
- Xóa Pod postgres thì dữ liệu mất không? Vì sao? (Không, do PVC của StatefulSet.)
- Xóa file `.env` ở commit sau có đủ không? (Không, lịch sử Git vẫn giữ bản cũ; rotate là bước bắt buộc.)

## Ghi chú giảng viên theo slide

Các ghi chú dưới đây chuyển nguyên văn từ slide gốc (trước khi [Slide buổi 29](../../slides/08-capstone/session-29.md) được rút gọn). Số thứ tự là của slide gốc; tên slide nêu kèm để bạn tìm ở bản rút gọn.

- Slide 1 – Mục tiêu buổi học: mở buổi (3 phút). Nhấn mạnh: hôm nay không viết code ứng dụng, sản phẩm là kế hoạch dùng được cho ba buổi còn lại. Hỏi lớp: "Nhóm nào đã từng làm đồ án mà đến cuối mới biết ai làm gì?"
- Slide 2 – Ôn tập nhanh (15 phút đầu): 15 phút ôn tập theo khung giờ buổi học. Gọi ngẫu nhiên: "Xóa Pod postgres thì dữ liệu mất không? Vì sao?" (không, do PVC của StatefulSet). Dùng để lớp nhớ lại toàn bộ stack trước khi vẽ kiến trúc.
- Slide 3 – Vấn đề thực tế: kể như câu chuyện (2 phút). Chốt: lỗi không do thiếu kỹ năng mà do thiếu kế hoạch. Ba thứ nhóm sẽ làm hôm nay: repo sạch, bảng công việc, ADR.
- Slide 4 – Requirement phải kiểm chứng được: cho lớp viết lại một requirement xấu thành tốt (2 phút). Từ "tốt" không kiểm chứng được, mã trạng thái thì có. Mã F1-F8 lấy từ đề bài Capstone.
- Slide 5 – Kiến trúc trả lời bốn câu hỏi: không vẽ đẹp, vẽ đúng. Mentor sẽ đối chiếu sơ đồ với `compose.yaml` và `k8s/`. Hỏi: "Mũi tên này mang dữ liệu gì?"
- Slide 6 – Thành phần của starter-project: chiếu song song file thật. Nhắc: không commit giá trị secret thật, chỉ `.env.example`.
- Slide 7 – Chia việc theo lát cắt dọc: hỏi: "Nếu A làm Docker và B làm Kubernetes riêng, ai phát hiện image không khớp manifest, và khi nào?"
- Slide 8 – Definition of Done và ADR: ADR sẽ là tư liệu cho buổi bảo vệ kỹ thuật (buổi 32). Câu hỏi: "Vì sao chọn StatefulSet cho PostgreSQL?" dễ trả lời hơn nếu đã viết lý do từ tuần đầu.
- Slide 9 – Kiến trúc mục tiêu: đi theo hai luồng: luồng code (trái) và luồng request (phải). Dữ liệu nằm trên PVC nên xóa Pod không mất dữ liệu.
- Slide 10 – Quy trình lập kế hoạch: nhắc lớp thứ tự: không viết ADR trước khi có kiến trúc, không tạo Issue trước khi có requirement.
- Slide 11 – Demo 1, repo từ starter-project và .gitignore: demo 10 phút gồm slide 11-13. Hỏi lớp: "Em tạo `.env` bây giờ, `git status` có hiện không? Làm sao biết chắc?" Đáp: bằng chứng là `git check-ignore -v`, không phải niềm tin.
- Slide 12 – Demo 2, sơ đồ và ADR mẫu: đọc ADR trong 3 phút. Hệ quả cần có cả mặt dễ hơn và mặt khó hơn (manifest k8s phải cập nhật tag mỗi lần triển khai).
- Slide 13 – Demo 3, GitHub Projects: giao diện GitHub Projects thay đổi theo thời gian; nếu không thấy nút, dẫn học viên tới tài liệu chính thức. Nhấn mạnh checklist chính là DoD của Issue.
- Slide 14 – Lab, năm phần trong 60 phút: trưởng nhóm thao tác tạo repo, người còn lại clone về máy mình để kiểm tra. Đặt đồng hồ hiển thị cho lớp.
- Slide 15 – Lab L1, repo sạch và first commit: lần commit đầu là lúc dễ lỡ tay nhất. Đi quanh lớp kiểm tra nhóm nào bỏ qua bước `check-ignore`.
- Slide 16 – Lab L1, PR đầu tiên và bảo vệ nhánh: check `test` chỉ xuất hiện sau khi CI chạy lần đầu ở buổi 30. Vòng review phải khép kín, không ai review PR của chính mình.
- Slide 17 – Lab L2, thử thách: cho nhóm khá. Gợi ý phương án dự phòng Ingress: `kubectl port-forward`. Đường gợi ý: API, Test, CI, Publish.
- Slide 18 – Phá lỗi, secret bị commit: chỉ làm trên repo thử nghiệm. Hỏi: "Xóa file ở commit sau có đủ không?" Không, lịch sử Git vẫn giữ bản cũ. Rotate là bước bắt buộc.
- Slide 19 – Lỗi thường gặp: chọn 2-3 dòng liên quan nhất tới nhóm đang làm. Một người nhận gần hết Issue cũng là dấu hiệu xấu: chia lại theo vòng review chéo.
- Slide 20 – Recap và nộp bài: dành 15 phút cuối để mỗi nhóm trình bày 2 phút kiến trúc và một ADR, các nhóm khác đặt một câu hỏi. Nhắc không đưa `.env` hay token vào bài nộp.

## Lưu ý riêng cho người dạy

- Hôm nay không có code ứng dụng; nếu nhóm đòi viết code sớm, nhắc rằng sản phẩm của buổi là kế hoạch và repo sạch.
- Branch protection ở repo cá nhân gói miễn phí có thể không đầy đủ; repo `devops-labs` và repo nhóm nên để public. Khi không bật được, nhóm ghi cam kết quy ước vào README và bạn kiểm tra qua lịch sử PR.
- Check `test` chưa tồn tại ở buổi này (CI chạy lần đầu ở [Buổi 30 – Implementation](../../labs/week-15/session-30.md)); hẹn nhóm quay lại bật sau buổi 30.
- Phần Phá lỗi "secret bị commit" chỉ làm trên repo thử nghiệm `~/break-secret`; kiểm tra học viên đã dọn bằng `rm -rf ~/break-secret` và không làm trên repo nhóm.
- Capstone không có code tham chiếu để chép: đừng đưa bản API mẫu cho nhóm ở buổi này; hướng dẫn nhóm đọc `starter-project/` và tự quyết thiết kế.
- Đi kiểm tra từng nhóm: mỗi mũi tên trên sơ đồ trả lời được "dữ liệu gì đi qua", vòng review chéo khép kín, không ai giữ quá 2 thẻ `In progress`.
