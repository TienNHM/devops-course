# Hướng dẫn chấm – Tuần 1

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Bài tập của học viên: [Bài tập Tuần 1](../../assignments/weekly/week-01.md). Đáp án: [Đáp án Tuần 1](../walkthroughs/week-01.md). Kịch bản buổi: [Kịch bản Buổi 01](../sessions/session-01.md), [Kịch bản Buổi 02](../sessions/session-02.md).
:::

> **Tóm tắt:** Thang điểm chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh, bằng chứng cần thấy và câu hỏi vấn đáp cho bài tập Tuần 1. Tổng 100 điểm L1, thưởng tối đa 10 điểm L2.

## Thang điểm

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2 (chỉ chấm khi L1 đạt từ 60 điểm).

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: `steps.md` | Đủ 9 bước trở lên, đủ 6 cột, có đủ 8 bước bắt buộc, rủi ro cụ thể | Thiếu bước hoặc cột, ô trống, rủi ro chung chung | 15 |
| Nhiệm vụ 2: sơ đồ thủ công và điểm nghẽn | Mermaid hiển thị được, có vòng lặp lỗi, nút ghi rõ ai làm; đúng 3 điểm nghẽn có lý do và truy ngược được về `steps.md` | Sơ đồ lỗi cú pháp, không có vòng lặp, điểm nghẽn không có lý do hoặc không khớp bảng | 15 |
| Nhiệm vụ 3: sơ đồ tự động hóa | Đủ các bước bắt buộc, có bước tự bổ sung có giải thích, bảng ánh xạ điểm nghẽn sang nút đầy đủ | Thiếu bước CI hoặc health check, không ánh xạ được | 15 |
| Nhiệm vụ 4: môi trường | Evidence chứng minh WSL2 VERSION 2, làm việc trong `~`, Git và SSH hợp lệ, remote dạng SSH | Thiếu một mục trong evidence hoặc làm việc trong `/mnt/c` | 20 |
| Nhiệm vụ 5: log `check-env.sh` | Log do máy sinh ra từ `bash resources/check-env.sh 2`, có `exit code: 0`, report giải thích vì sao chạy với số `2` và khi nào chạy lại với số lớn hơn | Log tự gõ tay, mã thoát không khớp nội dung log, không giải thích | 15 |
| `README.md` và `report.md` | Đủ 7 câu mỗi lab, giải thích đúng, ghi rõ mức đã làm | Thiếu câu, sao chép đề bài, không ghi mức | 10 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc thư mục, evidence là text thật, không có secret, commit message rõ ràng | Sai cấu trúc, evidence chỉ là ảnh, có secret | 5 |
| Quy trình nộp | Có PR, được một bạn review có nhận xét thật | Push thẳng vào `main` hoặc review chỉ ghi "OK" | 5 |
| **Tổng L1** | | | **100** |
| L2: Thử thách A (`proposal.md`) | Đủ 5 tiêu chí, số liệu có cách ước lượng | Thiếu tiêu chí hoặc số liệu bịa không giải thích | +5 |
| L2: Thử thách B (script đầy đủ) | Hai lần chạy trong cùng log (một đúng, một cố tình sai trên khóa thử `~/.ssh/test_key`), có mã thoát và cách khôi phục | Thiếu một lần chạy, đổi quyền khóa thật, thiếu mã thoát | +3 |
| L2: Thử thách C (dotfiles) | `install.sh` chạy hai lần liên tiếp không lỗi, không nhân đôi nội dung, có `ls -l` của symlink | Chạy lần hai lỗi, nhân đôi nội dung, ghi đè file cũ khi chưa sao lưu | +2 |
| **Tối đa thưởng** | | | **+10** |

Điểm một tiêu chí được chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0.

Nhiệm vụ 5 ở L1 là chạy script có sẵn `resources/check-env.sh` và nộp log; tự viết script là thử thách L2 (Thử thách B và bản rút gọn ở [Buổi 02 – Thử thách thêm](../../labs/week-01/session-02-challenge.md)). Hai hạng mục "script có CRLF" và "thiếu quyền thực thi" trong mục lỗi chỉ áp dụng cho học viên làm L2.

## Lỗi hay bị trừ điểm

- Sơ đồ Mermaid có nhãn chứa ngoặc hoặc dấu hai chấm mà không đặt trong dấu nháy kép, khiến sơ đồ không hiển thị.
- `steps.md` chỉ có tên bước, thiếu Ai làm, Đầu vào, Đầu ra; hoặc điểm nghẽn không truy ngược được về bảng.
- Chọn công cụ trước khi nêu điểm nghẽn (ví dụ "dùng Kubernetes" mà không nói vấn đề cần giải).
- Làm và clone repo trong `/mnt/c`, hoặc evidence không chứng minh được vị trí làm việc.
- Dán output từ máy khác hoặc tự gõ tay output thay vì chạy lệnh thật; `command-output.txt` rỗng vì quên chuyển hướng.
- Lấy mã thoát sai (dùng `| tee` rồi đọc `$?`), nên log ghi `exit code: 0` trong khi script thật sự báo `[ THIEU ]` ở git hoặc curl.
- Chạy `check-env.sh` không có số buổi rồi nộp `exit code: 1` mà không giải thích; đề yêu cầu chạy `bash resources/check-env.sh 2`.
- Script tự viết có CRLF (`bash\r: No such file or directory`) hoặc thiếu quyền thực thi (chỉ áp dụng nếu học viên làm L2).
- Chạy `ssh-add -D` hoặc đổi quyền khóa thật `~/.ssh/id_ed25519` khi làm phần phá lỗi, thay vì dùng khóa thử.
- Commit private key, `.env`, token hoặc ảnh chụp lộ thông tin cá nhân.
- Nộp ảnh chụp thay cho file nguồn và log text.
- Push thẳng vào `main`, không có PR hoặc không có người review.

## Lệnh kiểm tra nhanh

Quét secret trong repo của học viên (kết quả mong đợi: không in dòng nào):

```bash
cd ~/devops-labs
git ls-files | grep -E '(^|/)(id_ed25519|id_rsa|\.env)$'
grep -rIl "BEGIN OPENSSH PRIVATE KEY" . --exclude-dir=.git
```

Đếm dòng bảng `steps.md` (từ 11 trở lên, gồm dòng tiêu đề và dòng phân cách) và kiểm tra evidence:

```bash
grep -c '^|' lab-01/source/steps.md
grep -n "exit code" lab-02/evidence/command-output.txt
grep -n "microsoft\|VERSION\|authenticated" lab-02/evidence/command-output.txt
git remote -v
```

Nếu học viên làm L2 với script tự viết, kiểm tra thêm quyền và xuống dòng:

```bash
ls -l lab-02/source/check-env.sh
file lab-02/source/check-env.sh
```

`file` không được báo "CRLF line terminators" và `ls -l` phải có `x`.

## Bằng chứng và câu hỏi vấn đáp theo tiêu chí

Bảng gợi ý cách kiểm chứng nhanh bằng evidence và vấn đáp. Mỗi hàng ứng với một tiêu chí của thang điểm.

| Tiêu chí | Bằng chứng cần thấy trong evidence | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| steps.md (15 điểm) | Số dòng bảng đếm bằng grep từ 11 trở lên; đủ 6 cột; tám bước bắt buộc; rủi ro cụ thể | Rủi ro giống hệt bài lab hoặc bạn khác; ô ghi "tùy"; số cột không đủ | "Chọn một dòng và cho biết rủi ro đó từng xảy ra với bạn chưa?" "Vì sao bước này do Ops làm mà không phải Dev?" |
| Sơ đồ thủ công và điểm nghẽn (15 điểm) | File `.mmd` có vòng lặp lỗi, nhãn trong nháy kép; `bottlenecks.md` ghi số bước | Điểm nghẽn không khớp số bước; nhiều hơn hoặc ít hơn 3; sơ đồ khác bảng | "Điểm nghẽn bạn chọn thuộc dấu hiệu nào trong bốn dấu hiệu?" "Nếu bỏ vòng lặp lỗi, sơ đồ che mất điều gì?" |
| Sơ đồ tự động hóa (15 điểm) | Có CI build và test, cổng kiểm thử, registry có phiên bản, deploy từ cấu hình, health check, bước tự bổ sung; bảng ánh xạ trong `report.md` | Chỉ liệt kê công cụ; thiếu nhánh "không đạt"; bước bổ sung không có lý do | "Nếu health check lỗi thì điều gì xảy ra trong sơ đồ của bạn?" "Điểm nghẽn số 2 được giải quyết ở nút nào?" |
| Môi trường (20 điểm) | `wsl --list --verbose` VERSION 2; `pwd` hoặc `realpath` bắt đầu bằng `/home`; `core.autocrlf=input`; remote dạng `git@github.com:`; dòng "successfully authenticated" | Output có username GitHub không khớp tài khoản; không có `pwd`; remote HTTPS; nội dung dán từ máy khác | "Mở terminal và cho tôi xem bạn đang ở filesystem nào." "Vì sao `ssh -T` thoát mã 1 mà vẫn là thành công?" |
| check-env.sh (15 điểm) | Lệnh `bash resources/check-env.sh 2`, các dòng WSL, git, curl là `[ OK ]`, docker và kubectl là `[ DE SAU ]`, `exit code: 0`; log do máy sinh ra (nếu làm L2: `file` không báo CRLF, `ls -l` có `x`) | Log ghi `exit code: 0` trong khi có dòng `[ THIEU ]`; log do gõ tay; không giải thích số `2` | "Vì sao chạy với số 2 mà không chạy không đối số?" "Vì sao đọc `$?` sau `tee` là sai?" "Vì sao `ssh` cần cờ `-V` mà không phải `--version`?" |
| README, report (10 điểm) | Đủ 7 câu; câu 1 đến 5 trả lời bằng lời riêng; ghi mức L1 hoặc L2 | Câu trả lời giống nguyên văn đề bài hoặc tài liệu | Chọn một câu kiểm tra và yêu cầu giải thích lại bằng ví dụ khác |
| Kỷ luật repo (5 điểm) | Lệnh quét secret không in dòng nào; không có file `.env`; commit message rõ nghĩa | Có private key, token, ảnh lộ thông tin cá nhân | "Làm sao bạn chắc không có secret trong repo?" |
| Quy trình nộp (5 điểm) | PR có hai nhận xét cụ thể của người review | Review chỉ ghi "OK"; push thẳng vào `main` | "Reviewer đã bắt được lỗi gì và bạn sửa thế nào?" |

## Lưu ý khi chấm

- Evidence do máy sinh ra có đặc điểm nhất quán: cùng tên máy, cùng phiên bản, thời gian hợp lý. Hai bài có output trùng từng ký tự (kể cả tên người dùng) gần như chắc chắn là chép.
- Nếu log còn dòng `[ THIEU ]` ở git hoặc curl thì `exit code` phải là 1; trừ điểm khi log ghi 0 mà vẫn có `[ THIEU ]`, và hỏi vấn đáp để biết học viên đã cài đủ git, curl chưa.
- Điểm L2 chỉ cộng khi L1 đạt từ 60. Với Thử thách B, kiểm tra evidence có hai lần chạy và dùng khóa thử `~/.ssh/test_key` (không đổi quyền khóa thật, đã dọn khóa thử sau khi xong).
- Ảnh chụp chỉ bổ trợ; bài chỉ có ảnh mà thiếu log text nhận 0 cho tiêu chí đó.
- Dòng `wsl --list --verbose` dán tay từ PowerShell là ngoại lệ duy nhất cho nguyên tắc "log không gõ tay"; hỏi vấn đáp để kiểm tra.
