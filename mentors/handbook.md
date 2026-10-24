# Sổ tay mentor

> **Tóm tắt:** Trang cốt lõi cho mentor: vai trò, một buổi diễn ra thế nào, nguyên tắc dạy, quy tắc an toàn và các liên kết đến phần chi tiết. Đọc trong khoảng 10 phút.

::: warning Dành cho mentor
Trang này dành cho người dạy và chấm bài; học viên không cần đọc.
:::

Đọc trang này một lần khi nhận vai trò, rồi mở [Quy trình một buổi học](session-runbook.md). Việc chấm bài nằm ở [Hướng dẫn chấm bài](grading-guide.md), việc tuyển và đào tạo mentor mới nằm ở [Tuyển và đào tạo mentor](mentor-onboarding.md).

## Thuật ngữ dùng trong khu vực mentor

| Thuật ngữ | Nghĩa |
| --- | --- |
| L1 (Foundation) | Mức cơ bản của một lab: làm theo hướng dẫn từng bước. Mọi học viên bắt đầu ở đây |
| L2 (Engineering) | Mức nâng cao: tự triển khai, tự giải thích lựa chọn, tự xử lý lỗi, không có hướng dẫn từng bước |
| Break | Phần cố tình làm hỏng một thành phần để học viên tự tìm nguyên nhân và sửa |
| Evidence | Bằng chứng nộp: log, output lệnh, kết quả test thật trong thư mục `evidence/` của bài nộp |
| Kịch bản buổi | Trang `mentors/sessions/session-NN`: demo, câu hỏi cho lớp, khung thời gian của đúng buổi đó |
| Hướng dẫn chấm | Trang `mentors/grading/week-XX`: barem, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh của đúng tuần đó |
| Đáp án | Trang `mentors/walkthroughs/week-XX`: lời giải để đối chiếu, chỉ phát sau khi học viên nộp bài |
| go/no-go | Quyết định mở khóa hay chưa, dựa trên kết quả [pilot](pilot-plan.md) |

Các thuật ngữ khác (Compose, kind, Pod, ...) có trong [Thuật ngữ](../resources/glossary.md).

## Mục tiêu và triết lý dạy

Khóa học không nhằm làm học viên thuộc lệnh. Mục tiêu là sau 16 tuần học viên tự đóng gói, kiểm thử, triển khai và chẩn đoán lỗi một ứng dụng nhiều thành phần (frontend, backend, database) trên máy của mình, và giải thích được vì sao mình làm vậy.

Vòng lặp của mỗi buổi: Learn (hiểu khái niệm), Build (làm theo lab), Break (cố tình làm hỏng), Debug (tìm nguyên nhân gốc), Deploy (đưa lên chạy), Explain (giải thích lại bằng lời của mình).

Ba nguyên tắc cho mentor:

1. Học viên phải gõ lệnh. Mentor không cầm bàn phím của học viên.
2. Lỗi là nguyên liệu học, không phải sự cố cần giấu. Phần Break là bắt buộc.
3. Đánh giá bằng bằng chứng: source, lệnh, log, kết quả test. Không chấm bằng screenshot đơn lẻ.

## Vai trò và nhân sự

| Vai trò | Số lượng | Trách nhiệm chính |
| --- | --- | --- |
| Program Lead | 1 | Chịu trách nhiệm lịch học, chất lượng, liên lạc với CLB và nhà trường, quyết định go/no-go, duyệt thay đổi nội dung, giữ repo đáp án private |
| Technical Mentor | 2 | Dạy phần kiến thức và demo, thiết kế và tạo lỗi cho phần Break, chấm bài và review PR, trực office hour |
| Lab Assistant | 2 | Đi hỗ trợ trong giờ lab, chạy lại lab trên máy sạch trước buổi học, chuẩn bị mạng và image, ghi nhận lỗi học viên gặp |

Tỷ lệ khi lab: 1 mentor (Technical Mentor hoặc Lab Assistant đã qua đào tạo) cho 6 đến 8 học viên. Với 20 học viên cần ít nhất 3 người đi hỗ trợ trong giờ lab. Nếu thiếu người, giảm số học viên hoặc chia hai ca, không dồn lớp.

Người dẫn chính của buổi và người trực lab phải khác nhau. Người dẫn chính không nên vừa giảng vừa gỡ lỗi cho từng bạn.

### Lịch phân công mẫu cho một buổi

| Thời điểm | Technical Mentor A | Technical Mentor B | Lab Assistant 1 | Lab Assistant 2 |
| --- | --- | --- | --- | --- |
| Trước buổi (D-3) | Cập nhật slide, chọn lỗi Break | Chạy lại lab L2 | Chạy lại lab L1 trên máy sạch | Pre-pull image, kiểm tra mạng |
| Trong buổi | Dẫn chính | Trực lab nhóm 1 | Trực lab nhóm 2 | Trực lab nhóm 3, ghi chép sự cố |
| Sau buổi (D+2) | Chấm bài nhóm 1 | Chấm bài nhóm 2 | Cập nhật tiến độ trên Projects | Tổng hợp lỗi để sửa tài liệu |

## Một buổi 120 phút diễn ra thế nào

Mỗi buổi có bốn khối: 15 phút ôn tập, 30 phút kiến thức và demo, 60 phút thực hành, 15 phút review. Lab chiếm một nửa thời gian, giảng không quá 30 phút liên tục.

| Phút | Khối | Việc của mentor |
| --- | --- | --- |
| 0 đến 5 | Mở đầu | Điểm danh, nhắc mục tiêu buổi, kiểm tra nhanh máy học viên (Docker chạy chưa, terminal mở được chưa) |
| 5 đến 15 | Ôn tập và group challenge | Nhóm 2 đến 3 người giải một câu hỏi hoặc lỗi nhỏ của buổi trước, không tra bài giải |
| 15 đến 35 | Lecture | Giải thích khái niệm bằng sơ đồ và ví dụ, tối đa 20 phút, chèn 2 câu hỏi nhanh |
| 35 đến 45 | Demo | Chạy lệnh thật trên màn hình chiếu, cố tình để một lỗi nhỏ xảy ra và sửa trước lớp |
| 45 đến 105 | Lab | Học viên làm L1 hoặc L2, mentor đi quanh lớp, xử lý theo quy trình học viên tụt lại |
| 105 đến 117 | Review | Hai đến ba học viên trình bày kết quả và giải thích, mentor chốt các điểm sai thường gặp |
| 117 đến 120 | Kết thúc | Nhắc deadline nộp bài, giao việc tự học, ghi nhận phản hồi nhanh |

Mẹo giữ giờ:

- Đặt đồng hồ đếm ngược trên màn chiếu cho phần lab.
- Nếu demo bị trễ quá 5 phút do lỗi môi trường, dừng lại, chuyển sang phương án dự phòng (video ghi sẵn hoặc output có sẵn trong slide) và xử lý lỗi sau buổi.
- Không cắt phần review. Phần này là lúc học viên giải thích lại, đúng bước Explain của triết lý khóa học.

Đồng hồ từng phút, checklist chuẩn bị và xử lý sự cố nằm ở [Quy trình một buổi học](session-runbook.md). Nội dung riêng của từng buổi nằm ở kịch bản buổi trong [bảng 16 tuần](index.md).

## Mẹo dạy

- Chiếu terminal với font lớn (tối thiểu 18 đến 20 pt), không chuyển qua lại nhiều ứng dụng.
- Gõ lệnh từ từ và đọc to. Không dán sẵn cả đoạn trừ khi lệnh quá dài.
- Hỏi trước khi chạy: "bạn đoán kết quả sẽ ra gì?". Khi kết quả khác dự đoán, đó là lúc học được nhiều nhất.
- Dùng sơ đồ cho mọi khái niệm trừu tượng (network, volume, Service). Một sơ đồ vẽ tay còn tốt hơn năm slide chữ.
- Khi học viên hỏi, hỏi ngược lại: "bạn đã đọc log chưa, log nói gì?". Mục tiêu là hình thành thói quen đọc log trước khi hỏi.
- Khen cách tiếp cận đúng, không chỉ kết quả đúng. Ví dụ: "bạn kiểm tra `docker logs` trước là rất tốt".
- Không chê trước lớp. Nhận xét lỗi bằng câu hỏi hoặc để học viên tự phát hiện.
- Cuối buổi, nói rõ một câu: "hôm nay bạn đã làm được gì mà hôm qua chưa làm được".

## An toàn

### Không expose máy học viên ra Internet

- Mọi dịch vụ chỉ lắng nghe trên localhost của máy học viên. Không dùng ngrok, Cloudflare Tunnel, port forwarding trên router hay mở port trên firewall Windows cho khóa học.
- Khi chạy Compose, giữ port publish đơn giản; không bind ra mọi interface trừ khi lab yêu cầu và mentor đã giải thích rủi ro.
- Không chạy dịch vụ dùng mật khẩu mặc định yếu trên mạng chung của CLB.

### Không dùng production data

- Dữ liệu trong lab chỉ là dữ liệu giả (bảng `members` với tên giả). Không import danh sách thành viên thật, email thật hay số điện thoại thật của CLB.
- Không dùng tài khoản cloud hoặc registry của tổ chức cho thực hành. Dùng tài khoản GitHub cá nhân và GHCR của học viên.

### Không commit secret

- Mật khẩu và token chỉ nằm trong `.env` (đã nằm trong `.gitignore`) hoặc GitHub Actions Secrets. Repo chỉ chứa `.env.example` với placeholder.
- Dạy thói quen: kiểm tra `git status` trước khi `git add`, dùng `git diff --staged` trước khi commit.
- Nếu học viên lỡ commit secret: (1) coi secret đó đã lộ, thu hồi hoặc đổi ngay; (2) nhờ mentor xử lý lịch sử Git (với repo lab, cách đơn giản nhất là tạo lại repo); (3) ghi nhận như một bài học, không phạt công khai. Với token GitHub, vào phần Settings của tài khoản để revoke.
- Khi dạy GHCR và GitHub Actions, dùng `GITHUB_TOKEN` được cấp tự động cho workflow và đặt `permissions` tối thiểu; dạy học viên cách thu hồi Personal Access Token nếu từng tạo.

### An toàn khi dùng máy của học viên

- Không yêu cầu học viên cho mentor remote vào máy. Hỗ trợ bằng cách xem màn hình của họ trong lớp, hoặc yêu cầu dán output lệnh vào Discussion (đã che thông tin nhạy cảm).
- Không chạy lệnh học viên gửi qua chat trên máy mentor nếu chưa hiểu lệnh đó làm gì.
- Không tải và chạy script từ nguồn không rõ. Lab chỉ dùng công cụ có trong tài liệu chính thức.

## Liên kết hữu ích

| Việc cần làm | Trang |
| --- | --- |
| Chuẩn bị, điều hành, xử lý sự cố một buổi | [Quy trình một buổi học](session-runbook.md) |
| Chấm bài, review PR, viết phản hồi, theo dõi tiến độ | [Hướng dẫn chấm bài](grading-guide.md) |
| Tuyển mentor, máy 8 GB, sự cố ngày học | [Tuyển và đào tạo mentor](mentor-onboarding.md) |
| Quản lý repo giáo trình và repo đáp án | [Quản lý repo giáo trình](repo-governance.md) |
| Lịch học 16 tuần | [Lịch học](../curriculum/schedule.md) |
| Cách đánh giá toàn khóa | [Cách đánh giá](../curriculum/assessment.md) |
| Các bước cài môi trường | [Setup Guide](../resources/setup-guide.md) |
| Mẫu báo cáo lab | [Mẫu báo cáo lab](../templates/lab-template.md) |
| 10 tình huống lỗi cho phần Break | [10 tình huống lỗi](../examples/troubleshooting-scenarios.md) |
| Capstone | [Capstone](../assignments/capstone/README.md) |
