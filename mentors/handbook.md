# Sổ tay mentor

> **Tóm tắt:** Tài liệu bàn giao đầy đủ cho đội mentor: vai trò, cách phân bổ thời gian, điều hành buổi học, tạo lỗi cho phần Break, chấm bài, office hour, quản lý tiến độ bằng GitHub Projects, xử lý máy yếu, an toàn và quy trình đào tạo mentor mới.

Cách dùng: đọc toàn bộ một lần khi nhận vai trò, sau đó tra cứu theo mục. Phần chuẩn bị và điều hành từng buổi nằm ở [Runbook một buổi học](session-runbook.md).

## 1. Mục tiêu và triết lý dạy

Khóa học không nhằm làm học viên thuộc lệnh. Mục tiêu là sau 16 tuần học viên tự đóng gói, kiểm thử, triển khai và chẩn đoán lỗi một ứng dụng nhiều thành phần (frontend, backend, database) trên máy của mình, và giải thích được vì sao mình làm vậy.

Vòng lặp của mỗi buổi: Learn (hiểu khái niệm), Build (làm theo lab), Break (cố tình làm hỏng), Debug (tìm nguyên nhân gốc), Deploy (đưa lên chạy), Explain (giải thích lại bằng lời của mình).

Ba nguyên tắc cho mentor:

1. Học viên phải gõ lệnh. Mentor không cầm bàn phím của học viên.
2. Lỗi là nguyên liệu học, không phải sự cố cần giấu. Phần Break là bắt buộc.
3. Đánh giá bằng bằng chứng: source, lệnh, log, kết quả test. Không chấm bằng screenshot đơn lẻ.

## 2. Vai trò và nhân sự

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

## 3. Phân bổ hoạt động trong một buổi

Mục tiêu tỷ lệ cho toàn khóa:

| Hoạt động | Tỷ lệ mục tiêu | Thời lượng tham chiếu |
| --- | --- | --- |
| Lecture | 20% | khoảng 20 đến 24 phút |
| Demo | 10% | khoảng 10 đến 12 phút |
| Lab | 50% | 60 phút |
| Group challenge | 10% | khoảng 12 phút |
| Review | 10% | khoảng 12 phút |

Khung 120 phút thực tế chia theo bốn khối: 15 phút ôn tập, 30 phút kiến thức và demo, 60 phút thực hành, 15 phút review. Các tỷ lệ trên được làm tròn trong khung này: group challenge nằm trong khối ôn tập, review nằm trong khối cuối, vài phút chuyển tiếp là phần dư. Đừng chạy theo con số chính xác, hãy giữ nguyên tắc: lab chiếm một nửa thời gian, giảng không quá 30 phút liên tục.

## 4. Điều hành một buổi 120 phút

Bảng dưới là khung chuẩn. Phiên bản có checklist chi tiết từng phút nằm ở [Runbook](session-runbook.md).

| Phút | Khối | Việc của mentor |
| --- | --- | --- |
| 0 đến 5 | Mở đầu | Điểm danh, nhắc mục tiêu buổi, kiểm tra nhanh máy học viên (Docker chạy chưa, WSL mở được chưa) |
| 5 đến 15 | Ôn tập và group challenge | Nhóm 2 đến 3 người giải một câu hỏi hoặc lỗi nhỏ của buổi trước, không tra bài giải |
| 15 đến 35 | Lecture | Giải thích khái niệm bằng sơ đồ và ví dụ, tối đa 20 phút, chèn 2 câu hỏi nhanh |
| 35 đến 45 | Demo | Chạy lệnh thật trên màn hình chiếu, cố tình để một lỗi nhỏ xảy ra và sửa trước lớp |
| 45 đến 105 | Lab | Học viên làm L1 hoặc L2, mentor đi quanh lớp, xử lý theo quy tắc ở mục 5 |
| 105 đến 117 | Review | Hai đến ba học viên trình bày kết quả và giải thích, mentor chốt các điểm sai thường gặp |
| 117 đến 120 | Kết thúc | Nhắc deadline nộp bài, giao việc tự học, ghi nhận phản hồi nhanh |

Mẹo giữ giờ:

- Đặt đồng hồ đếm ngược trên màn chiếu cho phần lab.
- Nếu demo bị trễ quá 5 phút do lỗi môi trường, dừng lại, chuyển sang phương án dự phòng (video ghi sẵn hoặc output có sẵn trong slide) và xử lý lỗi sau buổi.
- Không cắt phần review. Phần này là lúc học viên giải thích lại, đúng bước Explain của triết lý khóa học.

## 5. Xử lý học viên tụt lại

Luôn có một nhóm học viên làm chậm hơn nhịp lớp. Quy trình leo thang:

1. Tự gỡ (5 phút): học viên đọc thông báo lỗi, chạy lệnh chẩn đoán trong lab, thử một giả thuyết.
2. Hỏi bạn cùng bàn (5 phút): pair với bạn đã xong, nhưng bạn đó chỉ được chỉ vào màn hình và đặt câu hỏi, không gõ hộ.
3. Gọi lab assistant: assistant hỏi "bạn đã thử gì, kết quả ra sao" trước khi gợi ý. Chỉ gợi ý một bước tiếp theo.
4. Gọi technical mentor: dành cho lỗi môi trường (WSL, Docker Desktop, mạng) hoặc lỗi tài liệu.
5. Ghi vào Issue và hẹn office hour nếu lỗi quá 15 phút không tiến triển. Cho học viên dùng môi trường dự phòng (máy của bạn cùng nhóm, hoặc đoạn output mẫu) để không bị mất phần còn lại của buổi.

Học viên đã tụt hơn một buổi cần một cuộc trao đổi riêng với mentor để xác định lý do (môi trường, thời gian, nền tảng kiến thức) và lập kế hoạch bù. Không để học viên tự im lặng bỏ cuộc.

Dấu hiệu cần chủ động hỏi thăm: vắng hai buổi liên tiếp, không có PR trong một tuần, hỏi cùng một loại lỗi nhiều lần, ngồi im không gõ lệnh quá 10 phút.

## 6. Ghép L1 và L2, pair programming

Mỗi lab có L1 (Foundation) và L2 (Engineering). Cách tổ chức:

- Mọi học viên bắt đầu bằng L1. Học viên xong L1 sớm chuyển sang L2 và có thể đóng vai người hỗ trợ ngang hàng.
- Học viên mới hoặc yếu hơn: ưu tiên hoàn thành L1 cho chắc, L2 là bài tự học thêm. Điều kiện hoàn thành khóa tính trên bài lab bắt buộc, không ép L2.
- L2 không có hướng dẫn từng bước. Mentor chỉ xác nhận yêu cầu, không chỉ cách làm. Học viên phải giải thích lựa chọn của mình trong báo cáo.

Pair programming theo vai trò Driver và Navigator:

| Vai trò | Việc làm |
| --- | --- |
| Driver | Gõ lệnh, đọc to điều mình đang làm |
| Navigator | Đọc hướng dẫn, đặt câu hỏi "vì sao", kiểm tra output |

Đổi vai sau mỗi 15 phút. Ghép một học viên đã vững với một học viên chưa vững cho các lab về Linux, Git và Docker cơ bản. Với lab Kubernetes (máy nặng), ghép đôi cũng giúp giảm tải máy: một máy chạy cluster, hai người cùng làm.

## 7. Mẹo dạy

- Chiếu terminal với font lớn (tối thiểu 18 đến 20 pt), chia sẻ cửa sổ WSL, không chuyển qua lại nhiều ứng dụng.
- Gõ lệnh từ từ và đọc to. Không dán sẵn cả đoạn trừ khi lệnh quá dài.
- Hỏi trước khi chạy: "bạn đoán kết quả sẽ ra gì?". Khi kết quả khác dự đoán, đó là lúc học được nhiều nhất.
- Dùng sơ đồ cho mọi khái niệm trừu tượng (network, volume, Service). Một sơ đồ vẽ tay còn tốt hơn năm slide chữ.
- Khi học viên hỏi, hỏi ngược lại: "bạn đã đọc log chưa, log nói gì?". Mục tiêu là hình thành thói quen đọc log trước khi hỏi.
- Khen cách tiếp cận đúng, không chỉ kết quả đúng. Ví dụ: "bạn kiểm tra `docker logs` trước là rất tốt".
- Không chê trước lớp. Nhận xét lỗi bằng câu hỏi hoặc để học viên tự phát hiện.
- Cuối buổi, nói rõ một câu: "hôm nay bạn đã làm được gì mà hôm qua chưa làm được".

## 8. Chuẩn bị trước mỗi buổi

Chi tiết nằm trong [Runbook](session-runbook.md). Tóm lược ba việc không được bỏ:

1. Chạy lại toàn bộ lab trên một máy sạch (máy ảo hoặc máy chưa cài gì ngoài theo Setup Guide), L1 lẫn L2, ít nhất 3 ngày trước buổi học.
2. Kiểm tra bandwidth và pre-pull các image của buổi qua mạng CLB trước giờ học. Pull 30 người cùng lúc qua mạng chung là nguyên nhân phổ biến nhất khiến buổi học đổ vỡ.
3. Chuẩn bị phương án dự phòng cho mạng và môi trường (mục 6 của Runbook).

## 9. Tạo lỗi cho phần Break

Phần Break là điểm khác biệt của khóa học. Mười tình huống chuẩn nằm ở [10 tình huống lỗi](../examples/troubleshooting-scenarios.md). Nguyên tắc khi tạo lỗi:

1. Chỉ đưa triệu chứng. Học viên nhận mô tả những gì quan sát được (ví dụ: "trang web mở được nhưng danh sách thành viên trống"), không nhận tên nguyên nhân.
2. Mỗi lỗi chỉ có một nguyên nhân gốc rõ ràng. Không chồng nhiều lỗi vào một tình huống ở các tuần đầu.
3. Lỗi phải tái lập được. Mentor tự tạo lỗi trên máy sạch và xác nhận triệu chứng giống mô tả trước khi đưa cho học viên.
4. Lỗi chỉ gây hại trong phạm vi lab. Không xóa dữ liệu của học viên, không sửa cấu hình hệ thống Windows, không đụng tới cài đặt Docker Desktop.
5. Có đường thoát: mỗi tình huống có lệnh dọn dẹp và trạng thái "tốt" để quay lại.
6. Gợi ý theo bậc. Chuẩn bị ba mức gợi ý (hướng điều tra, lệnh nên dùng, vị trí nguyên nhân) và chỉ đưa lần lượt khi học viên bí.
7. Sau khi giải xong, học viên trình bày năm mục: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, biện pháp phòng tránh.

Cách đưa lỗi vào lab: mentor chuẩn bị một thư mục hoặc nhánh Git "broken" (ví dụ một commit có cấu hình sai) để học viên checkout hoặc áp dụng. Với lỗi gắn với runtime (port bị chiếm, thiếu volume), mentor dùng một script nhỏ hoặc tài liệu hướng dẫn tạo điều kiện lỗi. Mọi file chứa lời giải và nguyên nhân chỉ để trong repo mentor private, xem [Quản lý repo giáo trình](repo-governance.md).

Ví dụ khung mô tả một tình huống đưa cho học viên:

```text
Tình huống: Trang web mở được nhưng danh sách thành viên luôn trống.
Bạn biết: hôm qua hệ thống vẫn hiển thị đủ dữ liệu.
Nhiệm vụ: tìm nguyên nhân gốc, sửa, và chứng minh đã sửa.
Cần nộp: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, cách phòng tránh.
Giới hạn thời gian: 20 phút. Hỏi mentor khi đã thử tối thiểu ba giả thuyết.
```

## 10. Quy trình chấm bài

### 10.1 Nộp bài

Mỗi học viên có một repo cá nhân (ví dụ `devops-labs`). Mỗi lab nằm trong thư mục `lab-XX/` theo [mẫu báo cáo lab](../templates/lab-template.md). Học viên nộp bằng Pull Request vào nhánh `main` của repo cá nhân (mentor là reviewer), không push thẳng vào `main`.

Cấu trúc thư mục nộp bài:

```text
lab-XX/
  README.md
  source/
  screenshots/
  evidence/
    command-output.txt
    test-results.txt
  report.md
```

### 10.2 Quy trình PR review

1. Học viên mở PR có tiêu đề `Lab XX: tên lab` và tick mức đã làm (L1 hoặc L2) trong mô tả.
2. Mentor được gán theo nhóm; phản hồi trong vòng 72 giờ làm việc.
3. Mentor đọc `report.md`, kiểm tra `evidence/`, chạy lại lệnh chính nếu nghi ngờ.
4. Mentor để comment theo dòng, dùng nhãn: `Blocking` (phải sửa), `Suggestion` (nên sửa), `Question` (cần giải thích), `Praise` (điểm tốt).
5. Kết quả: Approve nếu đạt, Request changes nếu có điểm Blocking. Học viên sửa tối đa hai vòng, sau đó hẹn office hour.
6. Merge PR sau khi Approve và ghi điểm vào Issue tương ứng.

### 10.3 Rubric chấm lab (100 điểm)

| Tiêu chí | Điểm | Mô tả đạt |
| --- | --- | --- |
| Kết quả chạy được | 30 | Làm lại theo `README.md` và `source/` cho kết quả như báo cáo |
| Bằng chứng | 20 | Có log, output lệnh, kết quả test thật, không chỉ screenshot |
| Hiểu và giải thích | 20 | Phần "những lỗi đã gặp" và "cách khắc phục" cho thấy hiểu nguyên nhân |
| Chất lượng kỹ thuật | 15 | Pin phiên bản, không có secret, cấu trúc gọn, tên rõ ràng |
| Trình bày | 10 | Báo cáo đủ 7 mục theo mẫu, đọc hiểu được |
| Cải thiện thêm | 5 | Nêu cải tiến hợp lý (điểm L2 hoặc ý tưởng riêng) |

Quy đổi: 80 điểm trở lên là Đạt, 60 đến 79 là Cần sửa (được nộp lại một lần), dưới 60 là Chưa đạt. Trọng số lab trong khóa là 25% theo [cách đánh giá](../curriculum/assessment.md). Bài có secret thật bị commit: xử lý theo mục 14.3 trước khi chấm tiếp.

### 10.4 Viết phản hồi

Phản hồi tốt có ba phần: một điểm làm tốt cụ thể, một đến ba điểm cần sửa kèm lý do, và một câu hỏi mở rộng. Ví dụ:

```text
Tốt: bạn tách build stage và runtime stage, image nhỏ hơn rõ rệt.
Cần sửa: container đang chạy bằng root (Blocking). Hãy xem lại phần USER trong Dockerfile
và giải thích vì sao đây là rủi ro.
Câu hỏi thêm: nếu thay đổi package.json, layer nào sẽ bị build lại?
```

Không viết đáp án thẳng vào comment cho lỗi tư duy; chỉ đường để học viên tự sửa. Với lỗi chính tả hoặc cú pháp nhỏ thì có thể chỉ thẳng.

### 10.5 Bảo đảm tính trung thực

Học viên có thể tham khảo tài liệu, bạn bè và công cụ AI, nhưng phải giải thích được từng dòng mình nộp. Trong review hoặc office hour, hỏi một câu "vì sao dòng này ở đây" cho mỗi bài. Bài sao chép nguyên văn mà không giải thích được thì yêu cầu làm lại phần đó trực tiếp trước mentor.

## 11. Office hour

- Mỗi tuần có một buổi office hour ngắn (thường 60 phút, một đến hai mentor trực).
- Dành cho lỗi học viên không tự xử lý được sau khi đã thử theo quy trình ở mục 5. Không dành cho giảng lại bài.
- Học viên đặt chỗ bằng cách mở Issue hoặc Discussion trước đó kèm: đã làm gì, lỗi gì, đã thử gì, output lệnh.
- Mentor áp dụng quy tắc "hỏi trước, chỉ sau": hỏi học viên chẩn đoán đến đâu, rồi chỉ gợi ý bước tiếp theo.
- Ghi lại lỗi lặp lại. Nếu từ ba học viên trở lên hỏi cùng một lỗi, cập nhật tài liệu lab hoặc mục xử lý sự cố của Runbook.
- Với học viên cần hỗ trợ lâu hơn (WSL hỏng, Docker không khởi động), dùng phiên 1-1 riêng, không chiếm thời gian chung.

## 12. Quản lý tiến độ bằng GitHub Projects

Dùng GitHub Projects (bảng) cho tổ chức hoặc repo của khóa, ánh xạ như sau:

| Khái niệm GitHub | Dùng làm gì |
| --- | --- |
| Issue | Một assignment hoặc một lab của một học viên (hoặc một nhóm) |
| Milestone | Một phase (Phase 1 đến Phase 5, xem [lịch học](../curriculum/schedule.md)) |
| Pull Request | Bài thực hành nộp, liên kết với Issue bằng từ khóa `Closes #n` |
| Discussions | Hỏi đáp, chia sẻ kiến thức, thông báo, retrospective |
| Project board | Theo dõi trạng thái: Todo, In progress, In review, Done |

Quy trình:

1. Đầu mỗi tuần, lead tạo Issue cho lab và assignment của tuần, gán Milestone phase tương ứng, thêm vào Project.
2. Học viên nhận Issue, mở PR liên kết, chuyển cột khi bắt đầu và khi nộp.
3. Mentor review PR, ghi điểm trong Issue, đóng Issue khi PR được merge.
4. Cuối tuần, lab assistant rà bảng: học viên nào có Issue quá hạn hoặc không có hoạt động 7 ngày thì gắn nhãn `at-risk` và báo mentor phụ trách.
5. Dùng Discussions cho: Q and A (hỏi đáp chung), Show and tell (học viên khoe kết quả), Announcements (thông báo lịch, đổi phòng), Retro (phản hồi cuối phase).

Nhãn gợi ý: `lab`, `assignment`, `capstone`, `at-risk`, `needs-mentor`, `env-issue` (lỗi môi trường, không phải lỗi học viên), `doc-bug` (lỗi tài liệu).

Nhóm capstone dùng repo nhóm bắt đầu từ `starter-project`, có Project riêng, mỗi thành viên có Issue và PR riêng để chấm đóng góp từng người.

## 13. Máy 8GB RAM

Setup Guide ghi 8 GB là mức tối thiểu cho Linux, Git và Docker cơ bản. Hướng dẫn mentor hỗ trợ:

1. Giới hạn bộ nhớ WSL2 bằng file `.wslconfig` trong thư mục người dùng Windows (ví dụ `C:\Users\TenBan\.wslconfig`), rồi chạy `wsl --shutdown` để áp dụng:

```text
[wsl2]
memory=4GB
processors=2
swap=4GB
```

2. Chỉ chạy những gì buổi học cần. Dừng Compose stack trước khi tạo cluster kind (đúng khuyến nghị của Setup Guide): `docker compose down` trong thư mục `starter-project`.
3. Đóng trình duyệt nhiều tab và các extension VS Code không cần thiết khi chạy kind.
4. Dùng cluster kind một node. Không làm bài L2 nhiều node trên máy 8 GB.
5. Dọn tài nguyên Docker không dùng: `docker image prune` và `docker builder prune`. Hỏi học viên trước khi chạy `docker system prune`, vì lệnh này xóa nhiều thứ hơn họ nghĩ.
6. Giảm replica trong lab Kubernetes (ví dụ từ 2 xuống 1) khi cần, và nói rõ đây là ngoại lệ của máy yếu.
7. Phương án cuối: ghép đôi, hai người dùng chung một máy 16 GB, hoặc cung cấp một máy chung của CLB để chạy phần nặng.

Hãy kiểm tra tham số `.wslconfig` trong tài liệu chính thức: https://learn.microsoft.com/en-us/windows/wsl/wsl-config

## 14. An toàn

### 14.1 Không expose máy học viên ra Internet

- Mọi dịch vụ chỉ lắng nghe trên localhost của máy học viên. Không dùng ngrok, Cloudflare Tunnel, port forwarding trên router hay mở port trên firewall Windows cho khóa học.
- Khi chạy Compose, giữ port publish đơn giản; không bind ra mọi interface trừ khi lab yêu cầu và mentor đã giải thích rủi ro.
- Không chạy dịch vụ dùng mật khẩu mặc định yếu trên mạng chung của CLB.

### 14.2 Không dùng production data

- Dữ liệu trong lab chỉ là dữ liệu giả (bảng `members` với tên giả). Không import danh sách thành viên thật, email thật hay số điện thoại thật của CLB.
- Không dùng tài khoản cloud hoặc registry của tổ chức cho thực hành. Dùng tài khoản GitHub cá nhân và GHCR của học viên.

### 14.3 Không commit secret

- Mật khẩu và token chỉ nằm trong `.env` (đã nằm trong `.gitignore`) hoặc GitHub Actions Secrets. Repo chỉ chứa `.env.example` với placeholder.
- Dạy thói quen: kiểm tra `git status` trước khi `git add`, dùng `git diff --staged` trước khi commit.
- Nếu học viên lỡ commit secret: (1) coi secret đó đã lộ, thu hồi hoặc đổi ngay; (2) nhờ mentor xử lý lịch sử Git (với repo lab, cách đơn giản nhất là tạo lại repo); (3) ghi nhận như một bài học, không phạt công khai. Với token GitHub, vào phần Settings của tài khoản để revoke.
- Khi dạy GHCR và GitHub Actions, dùng `GITHUB_TOKEN` được cấp tự động cho workflow và đặt `permissions` tối thiểu; dạy học viên cách thu hồi Personal Access Token nếu từng tạo.

### 14.4 An toàn khi dùng máy của học viên

- Không yêu cầu học viên cho mentor remote vào máy. Hỗ trợ bằng cách xem màn hình của họ trong lớp, hoặc yêu cầu dán output lệnh vào Discussion (đã che thông tin nhạy cảm).
- Không chạy lệnh học viên gửi qua chat trên máy mentor nếu chưa hiểu lệnh đó làm gì.
- Không tải và chạy script từ nguồn không rõ. Lab chỉ dùng công cụ có trong tài liệu chính thức.

## 15. Xử lý sự cố thường gặp ngày học

Bảng nhanh. Phiên bản đầy đủ nằm ở [Runbook, mục 7](session-runbook.md).

| Triệu chứng | Nguyên nhân hay gặp | Hướng xử lý |
| --- | --- | --- |
| `docker: command not found` trong WSL | Chưa bật WSL integration | Docker Desktop, Settings, Resources, WSL integration, bật cho Ubuntu |
| Docker Desktop không khởi động | Virtualization tắt, WSL cũ | Bật virtualization trong BIOS, chạy `wsl --update` rồi khởi động lại |
| Pull image rất chậm hoặc timeout | Nhiều người cùng pull qua một mạng | Dùng image đã pre-pull, nạp từ file `.tar` bằng `docker load` |
| `port is already allocated` | Dịch vụ khác chiếm cổng | Đổi `WEB_PORT` trong `.env`, hoặc tìm process bằng `ss -ltnp` |
| Lệnh chậm bất thường, quạt kêu | Hết RAM | Xem mục 13, `wsl --shutdown` |
| Lỗi quyền hoặc file chậm khi làm trong `/mnt/c` | Làm việc trên filesystem Windows | Chuyển repo vào thư mục home của WSL, không dùng `/mnt/c` |
| kind cluster không tạo được | Thiếu RAM, Docker chưa chạy | Kiểm tra `docker ps`, `kind delete cluster` rồi tạo lại |
| GitHub Actions không chạy | Workflow đặt sai thư mục, hoặc Actions bị tắt ở repo | Kiểm tra `.github/workflows/` ở gốc repo và tab Actions |

## 16. Đánh giá và theo dõi chất lượng khóa

- Điểm danh và tham gia: ghi nhận mỗi buổi.
- Theo dõi tỷ lệ hoàn thành lab bắt buộc (cần tối thiểu 80% để hoàn thành khóa, theo [cách đánh giá](../curriculum/assessment.md)).
- Cuối mỗi phase, thu feedback ngắn (3 câu hỏi) qua Discussions hoặc form.
- Cuối khóa, lead tổng hợp báo cáo: số học viên hoàn thành, các lab có tỷ lệ lỗi cao, đề xuất sửa nội dung. Đưa vào Issue của repo giáo trình theo quy trình ở [Quản lý repo giáo trình](repo-governance.md).

## 17. Tuyển và đào tạo mentor mới

### 17.1 Nguồn và tiêu chí

Nguồn: học viên đã hoàn thành khóa với xếp loại Good trở lên (từ 80 điểm), thành viên CLB có kinh nghiệm Linux, Git hoặc Docker, cựu học viên đã tham gia làm Lab Assistant.

| Tiêu chí | Lab Assistant | Technical Mentor |
| --- | --- | --- |
| Kỹ thuật | Hoàn thành khóa, tự chạy lại lab được | Làm chủ Docker, Compose, CI/CD, Kubernetes cơ bản, tự chẩn đoán lỗi |
| Giao tiếp | Kiên nhẫn, chịu khó hỏi lại | Giải thích rõ, đặt câu hỏi dẫn dắt |
| Cam kết | Tham gia trực lab theo lịch học kỳ | Tham gia chuẩn bị, chấm bài, office hour |

### 17.2 Lộ trình đào tạo 4 bước

| Bước | Nội dung | Kết quả cần đạt |
| --- | --- | --- |
| 1. Học | Đọc sổ tay này và [Runbook](session-runbook.md), xem lại slide của phase mình phụ trách | Hiểu quy trình và triết lý khóa |
| 2. Chạy lại | Tự chạy toàn bộ lab của một phase trên máy sạch, ghi lỗi gặp | Báo cáo chạy lab, danh sách lỗi và đề xuất sửa |
| 3. Shadow | Dự 2 buổi như người quan sát, ghi lại cách mentor xử lý học viên tụt lại | Bản ghi chú quan sát |
| 4. Đồng dẫn | Trực lab độc lập một nhóm, sau đó dẫn một đoạn (demo hoặc review) có mentor dự | Phản hồi từ mentor và học viên, được lead duyệt |

### 17.3 Checklist năng lực cho mentor mới

- [ ] Giải thích được luồng từ `git push` đến image trên GHCR và triển khai lên cluster kind.
- [ ] Tự tạo và sửa được ít nhất 5 trong 10 tình huống lỗi chuẩn.
- [ ] Biết đặt câu hỏi dẫn dắt thay vì đưa đáp án.
- [ ] Thực hiện được review PR theo rubric và viết phản hồi theo mẫu.
- [ ] Biết các quy tắc an toàn ở mục 14 và nhắc học viên.
- [ ] Biết xử lý máy 8 GB và sự cố mạng ngày học.
- [ ] Biết cập nhật Issue và Project cho học viên mình phụ trách.

### 17.4 Bàn giao giữa các thế hệ

Cuối mỗi khóa, lead cũ và lead mới cùng thực hiện:

- [ ] Bàn giao quyền truy cập: organization, repo giáo trình, repo đáp án private, Project, Discussions.
- [ ] Bàn giao báo cáo cuối khóa: tỷ lệ hoàn thành, lỗi phổ biến, đề xuất thay đổi.
- [ ] Rà [Điều kiện mở khóa](launch-checklist.md) cho phiên bản mới.
- [ ] Cập nhật phiên bản công cụ theo [quy trình ở đây](repo-governance.md).
- [ ] Ghi bài học vào `CHANGELOG.md` và mở Issue cho các thay đổi lớn.
- [ ] Giữ lại ít nhất một mentor có kinh nghiệm cho khóa kế tiếp để làm cầu nối.

## 18. Liên kết hữu ích

- [Lịch học 16 tuần](../curriculum/schedule.md)
- [Cách đánh giá](../curriculum/assessment.md)
- [Setup Guide](../resources/setup-guide.md)
- [Mẫu báo cáo lab](../templates/lab-template.md)
- [10 tình huống lỗi](../examples/troubleshooting-scenarios.md)
- [Capstone](../assignments/capstone/README.md)
