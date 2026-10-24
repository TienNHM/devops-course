# Chấm điểm tuần 2 – Linux Essentials

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 2](../../assignments/weekly/week-02.md). Đáp án: [Walkthrough tuần 2](../walkthroughs/week-02.md). Kịch bản buổi: [Buổi 03](../sessions/session-03.md), [Buổi 04](../sessions/session-04.md).
:::

> **Tóm tắt:** Barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho bài tập tuần 2 (nguyên văn từ bài tập và walkthrough).

## Barem chấm chi tiết

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: workspace | Cả 5 phép kiểm tra trong tiêu chí cho đúng kết quả; có `commands-task1.sh` dựng lại được; quote đường dẫn có khoảng trắng | Sai số lượng thư mục hoặc file, `backend.conf` bị ghi đè, thiếu script lệnh | 15 |
| Nhiệm vụ 2: phân tích log | `my-access.log` thỏa mọi điều kiện, tổng đếm bằng 15, 5xx lọc đúng bằng cột 9, `log-answers.md` mỗi dòng có lệnh tái hiện được, có giải thích thiếu `sort`, có `stderr.txt` | Log không đủ điều kiện, tổng không khớp, số liệu không kèm lệnh, lọc 5xx bằng chuỗi lỏng | 20 |
| Nhiệm vụ 3: thư mục chung | Đúng group, user, quyền `2770` và `770`; 5 hành động cho kết quả đúng; ma trận dự đoán có commit trước; không `chmod 777`; đã dọn và chứng minh | Thiếu setgid, thiếu đối chứng, ma trận làm sau khi chạy, có `777`, không dọn | 20 |
| Nhiệm vụ 4: process | Có PID, PPID khớp `$$`, đủ trước và sau mỗi tín hiệu, kết thúc sạch với `exit code: 1`, ghi chú đúng tín hiệu | Dùng `pkill sleep` hoặc `killall`, thiếu chứng minh process còn hoặc đã dừng | 10 |
| Nhiệm vụ 5: `show-config.sh` | Bốn lần chạy đúng kết quả và mã thoát, không lộ mật khẩu, mặc định `8080`, `.gitignore` có `.env`, LF và quyền thực thi | In mật khẩu, mã thoát sai, thiếu `.env.example`, có `.env` thật trong repo | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng, bằng lời của bạn, có ví dụ hoặc lệnh khi được hỏi | Sao chép đề hoặc tài liệu, trả lời sai khái niệm | 10 |
| `README.md` và `report.md` | Đủ 7 câu mỗi lab, ghi lỗi thật và cách điều tra, ghi rõ mức đã làm | Thiếu câu, không ghi lỗi, không ghi mức | 5 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc, evidence là text thật có chú thích nhiệm vụ, không có secret, commit message rõ ràng | Sai cấu trúc, evidence chỉ là ảnh hoặc gõ tay, có secret | 5 |
| Quy trình nộp | Có PR, được một bạn review có nhận xét thật | Push thẳng vào `main` hoặc review chỉ ghi "OK" | 5 |
| **Tổng L1** | | | **100** |
| L2: Thử thách A (`log-report.sh`) | Đủ tiêu chí, ba trường hợp lỗi tham số đều có evidence và mã thoát | Thiếu kiểm tra tham số hoặc không có evidence | +4 |
| L2: Thử thách B (`resource-check.sh`) | Đủ tiêu chí, ba lần chạy có mã thoát khác nhau đúng thiết kế, giải thích `awk` bằng lời | Mã thoát sai, chép mẫu không giải thích | +3 |
| L2: Thử thách C (`onboard.sh`) | Chạy lặp an toàn, không mất group phụ, có dọn | Chạy lần hai lỗi hoặc nhân đôi, dùng `usermod -G` | +3 |
| **Tối đa thưởng** | | | **+10** |

Điểm một tiêu chí được chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0.

## Lỗi hay bị trừ điểm

- Làm việc trong `/mnt/c` hoặc evidence không chứng minh được vị trí làm việc (thiếu `pwd`).
- Ghi đè file bằng `>` thay vì `>>`, làm `backend.conf` chỉ còn 1 dòng.
- Đếm với `uniq -c` mà không `sort`, hoặc không kiểm tra tổng bằng `wc -l`.
- Lọc 5xx bằng `grep " 5"` thay vì kiểm tra đúng cột mã HTTP; số liệu trong `log-answers.md` không kèm lệnh.
- Chép nguyên tên user, group và lệnh từ bài lab (`clbdev`, `clb-dev1`) thay vì dùng đúng tên của bài tập này.
- Điền ma trận dự đoán sau khi đã chạy lệnh, hoặc không commit riêng phần dự đoán.
- Dùng `chmod 777` hoặc `chmod -R 777` ở bất kỳ bước nào.
- Quên `-a` trong `usermod -aG`, làm user mất các group khác.
- Dùng `pkill sleep`, `killall` hoặc `kill -9` ngay từ đầu, làm ảnh hưởng process khác hoặc bỏ qua bước chứng minh SIGTERM.
- Lấy mã thoát sai (đọc `$?` sau `| tee`), nên log ghi `exit code: 0` trong khi script thật sự thất bại.
- In giá trị `DB_PASSWORD` ra màn hình hoặc vào evidence; commit `.env` thật hoặc mật khẩu thật.
- Script có CRLF (`bash\r: No such file or directory`) hoặc thiếu quyền thực thi.
- Không dọn user, group, thư mục `/srv/...` thử nghiệm và không ghi lý do.
- Evidence là ảnh chụp thay cho text, hoặc output gõ tay thay vì chạy lệnh thật.
- Push thẳng vào `main`, không có PR hoặc review chỉ ghi "OK".

## Hướng dẫn chấm, lệnh kiểm tra nhanh và câu hỏi vấn đáp

Dùng barem trong [bài tập tuần 2](../../assignments/weekly/week-02.md). Quy ước chung cho cả bài: mọi con số trong bài nộp phải tái hiện được khi mentor chạy lại lệnh học viên ghi.

| Tiêu chí | Bằng chứng cần thấy trong evidence | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Workspace (15 điểm) | Đủ năm phép kiểm tra: 11 thư mục, 7 file, 2 file conf, hai dòng của grep, backend.conf có 2 dòng; `commands-task1.sh` chạy lại dựng được cây | Số đếm đúng nhưng không có script lệnh; script không quote `meeting notes`; `backend.conf` 1 dòng | "Giải thích dòng mkdir có dấu ngoặc nhọn." "Nếu thiếu dấu nháy ở thư mục meeting notes thì điều gì xảy ra?" |
| Phân tích log (20 điểm) | `my-access.log` 15 dòng, 4 IP, IP nhiều nhất không hòa; tổng theo IP và theo mã đều 15; 5xx lọc theo cột 9; `stderr.txt`; `log-answers.md` mỗi dòng có lệnh | Log mô tả không khớp điều kiện; con số trong `log-answers.md` không tái hiện được; lọc 5xx bằng grep lỏng; giải thích thiếu `sort` giống nguyên văn lab | "Vì sao `uniq` cần `sort` trước?" "Sửa `$9` thành `$8` thì kết quả đổi thế nào và vì sao?" "Số 6 lỗi 5xx của bạn lấy bằng lệnh nào?" |
| Thư mục chung (20 điểm) | `id` của 3 user; `ls -ld` thấy `drwxrws---` và `drwxrwx---`; 5 hành động đúng kết quả; commit dự đoán có trước (so sánh thời gian commit với thời gian trong evidence); đã dọn kèm mã thoát khác 0 | Tên `clbdev`, `clb-dev1` chép từ lab; ma trận có "Khớp" toàn bộ mà không giải thích; không có `git log` cho thấy commit trước | "Vì sao hành động 5 thất bại dù ops2 thuộc cùng group?" "Bỏ umask 007 ở hành động 1 thì hành động 2 ra sao?" "Vì sao không dùng 777?" |
| Process (10 điểm) | PPID của hai process khớp số `echo $$`; `pgrep -af` trước và sau mỗi tín hiệu; `exit code: 1` cuối; không dùng `pkill sleep` | PPID không khớp `$$`; thiếu bước chứng minh còn sống sau SIGTERM; process-notes thiếu số hiệu tín hiệu | "Vì sao bước 5 thất bại?" "SIGKILL khác SIGTERM ở điểm nào về phía process?" |
| show-config.sh (10 điểm) | Bốn lần chạy với mã 1, 0, 0 và cặp trước và sau export; `grep -c` bằng 0; `file` không báo CRLF; `.gitignore` có `.env` | In ra giá trị mật khẩu; mã thoát đọc sau `tee`; không có `.env.example` | "Vì sao lần 4 đầu tiên thất bại?" "Khác nhau giữa `A=1 lenh` và `export A=1` là gì?" |
| 5 câu hỏi (10 điểm) | Câu trả lời bằng lời, có lệnh khi được hỏi | Trả lời giống nguyên văn đề hoặc đáp án lab | Chọn một câu và đổi số liệu hoặc tên (ví dụ quyền `750`) để hỏi lại |
| README và report (5 điểm) | 7 câu; một lỗi thật và cách điều tra; hash commit dự đoán; mức L1 hoặc L2 | Lỗi bịa, không có cách điều tra | "Kể lại lỗi này bạn thấy lần đầu ở lệnh nào?" |
| Kỷ luật repo (5 điểm) | Evidence text có dòng chú thích nhiệm vụ; lệnh quét secret không in dòng nào | Evidence chỉ là ảnh; có `.env` thật | "Làm sao bạn chắc không có secret trong repo?" |
| Quy trình nộp (5 điểm) | PR với hai nhận xét cụ thể; reviewer có chạy lại một phép kiểm tra | Review chỉ ghi "OK" | "Reviewer đã chạy lại phép kiểm tra nào?" |

Lưu ý chấm:

- Cách nhanh để kiểm chứng: clone repo nộp, chạy `bash commands-task1.sh` trong thư mục trống rồi chạy năm phép kiểm tra; chạy lại các lệnh pipeline trên `my-access.log`.
- Nhiệm vụ 3 có thứ tự thời gian: so `git log` của `permissions-matrix.md` với thời điểm chạy lệnh trong evidence. Ma trận điền sau khi chạy nhận điểm 0 cho phần dự đoán.
- Mã thoát: bài đọc `$?` sau `| tee` sẽ ghi `exit code: 0` cho lệnh thật sự thất bại. Đối chiếu với nội dung output ngay phía trên.
- Lệnh dọn dẹp: kiểm tra `getent` có mã thoát khác 0 (không tìm thấy user, group) thì mới coi là đã dọn.
- Bài có `chmod 777` ở bất kỳ bước nào hoặc `pkill sleep` nhận điểm không cho phần vi phạm, theo barem.
- Điểm L2 chỉ cộng khi L1 đạt từ 60. Với Thử thách C, kiểm tra evidence chứng minh user không mất group phụ.
