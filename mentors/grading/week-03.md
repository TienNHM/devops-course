# Chấm bài tuần 3 – Networking & Git Collaboration

::: warning Dành cho mentor
Trang này dành cho người chấm bài; học viên không cần đọc. Đề bài: [Bài tập tuần 3](../../assignments/weekly/week-03.md). Đáp án gợi ý: [Walkthrough tuần 3](../walkthroughs/week-03.md).
:::

> **Tóm tắt:** Barem chi tiết, lỗi hay bị trừ điểm, bằng chứng cần kiểm tra và câu hỏi vấn đáp cho bài tập tuần 3 (Buổi 05 mạng, Buổi 06 Git).

## Barem chi tiết

Tổng 100 điểm cho phần L1, cộng tối đa 10 điểm thưởng cho L2 (tổng không vượt quá 110).

| Tiêu chí | Mức đạt | Mức không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: thông tin IP, ping, DNS | Đủ lệnh, output thật, ping 4 gói thành công, chỉ đúng DNS resolver và đối chiếu `resolv.conf` | Thiếu lệnh, output giả hoặc không khớp máy, không giải thích được ping IP không cần DNS | 15 |
| Nhiệm vụ 2: chẩn đoán kết nối và `ss` | Có hai chế độ bind, port conflict kèm PID, ba loại lỗi `curl` với giải thích đúng | Thiếu một loại lỗi, nhầm nguyên nhân (ví dụ coi timeout là refused) | 15 |
| Nhiệm vụ 2: script `diagnose.sh` | Chạy đúng ba kịch bản cho ba kết luận khác nhau, kiểm tra tham số | Script lỗi cú pháp, luôn cho cùng một kết luận | 10 |
| Nhiệm vụ 3: repo sạch, `.gitignore`, secret | `.env` không nằm trong `git ls-files`, `check-ignore` chứng minh đúng | `.env` hoặc secret có trong lịch sử | 10 |
| Nhiệm vụ 3: branch, commit, PR | Mỗi nhiệm vụ một branch, thông điệp commit rõ, PR có mô tả đủ ba ý | Commit thẳng vào `main`, thông điệp mơ hồ, PR trống | 15 |
| Nhiệm vụ 3: review | Có review thật của bạn khác, ít nhất một comment cụ thể | Không có review hoặc review chỉ là "LGTM" tự phê | 5 |
| Nhiệm vụ 4: merge conflict | Có `CONFLICT (content)` thật, file cuối giữ hợp lý cả hai bên, không còn marker | Còn marker, mất nội dung một bên, giả lập conflict bằng cách sửa tay lịch sử | 10 |
| Nhiệm vụ 4: hoàn tác an toàn | Dùng `git revert`, giải thích đúng vì sao không `reset` + `force push` cho nhánh chung | Dùng `reset --hard` hoặc `--force` trên nhánh đã push | 5 |
| Câu hỏi kiểm tra kiến thức | Trả lời đúng ý và dùng bằng chứng của chính bài làm; mỗi câu 2 điểm | Trả lời chép tài liệu hoặc sai khái niệm | 10 |
| Chất lượng báo cáo và khả năng chạy lại | README trả lời đủ 7 câu hỏi, người khác chạy lại được script và các lệnh theo hướng dẫn | Thiếu README, lệnh không chạy lại được | 5 |
| **Tổng L1** | | | **100** |
| Thưởng L2 (tối đa 10) | Mỗi thử thách hoàn chỉnh theo tiêu chí được 5 điểm; thử thách làm dở được 0 đến 2 điểm | Không có bằng chứng kiểm chứng được | +10 |

Điểm tối đa của từng tiêu chí bị trừ hết nếu bằng chứng không kiểm chứng được (không có log hoặc log không khớp với lệnh).

## Lỗi hay bị trừ điểm

- Dán output giả hoặc output của người khác: các giá trị như IP, PID, thời gian không khớp giữa các file bị coi là không kiểm chứng được.
- Chỉ nộp ảnh chụp màn hình, không có `evidence/command-output.txt`.
- Chạy lab trong `/mnt/c` hoặc thư mục Windows, gây sai quyền file và sai kết quả `ss`.
- Commit trực tiếp vào `main`, hoặc dùng một branch cho cả hai nhiệm vụ.
- Thông điệp commit mơ hồ (`update`, `fix`, `abc`) hoặc một commit khổng lồ chứa mọi thứ.
- Còn marker conflict trong file, hoặc "giải quyết" conflict bằng cách xóa hết phần của một bên.
- Dùng `git reset --hard` hoặc `git push --force` trên nhánh chung.
- Commit `.env`, token, private key hoặc mật khẩu thật. Lỗi này bị trừ nặng và phải xử lý theo hướng dẫn xoay (rotate) secret.
- Script `diagnose.sh` không quote biến, không kiểm tra tham số, hoặc chỉ chạy được trên máy của bạn vì dùng đường dẫn tuyệt đối.
- Để server Python chạy nền sau khi làm xong và để lại tiến trình chiếm port.
- PR không có mô tả hoặc tự approve mà không có người review.

## Lệnh kiểm tra nhanh

Chạy trong bản clone repo của học viên (`devops-labs`) trước khi vấn đáp:

```bash
git ls-files | grep -i env || echo "Khong co file env trong repo"
git log --all --oneline -- .env
grep -rn '^<<<<<<<\|^=======\|^>>>>>>>' lab-06/ || echo "Khong con conflict marker"
git log --oneline --graph --all | head -n 30
ls lab-05/evidence lab-06/evidence
```

Ý nghĩa: không file `.env` nào trong `git ls-files` và `git log --all -- .env` không in commit nào; không còn marker; lịch sử có nhiều branch tính năng nhập vào `main` qua merge; thư mục evidence có đủ file theo đề.

## Hướng dẫn chấm cho mentor (bằng chứng, dấu hiệu bài chép, câu hỏi vấn đáp)

Điểm tối đa của một tiêu chí bị trừ hết nếu bằng chứng không kiểm chứng được. Hãy mở file thật trong `evidence/`, đừng chỉ đọc README.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: IP, ping, DNS (15) | `command-output.txt` có khối `$ ip -br addr`, `$ ip route`, hai lần `ping` với `4 received`, `nslookup` và `/etc/resolv.conf` có địa chỉ resolver trùng nhau | IP hoặc resolver trong file không khớp với máy (ví dụ máy bạn là `172.2x` nhưng log là `192.168`); giải thích ping IP chỉ bằng "vì nhanh hơn" | Vì sao `ping 1.1.1.1` chạy được khi DNS hỏng? Chỉ cho mình dòng nào trong output chứng minh bạn dùng đúng resolver. |
| Nhiệm vụ 2: `ss` và ba loại lỗi (15) | Dòng `LISTEN` ở cả `127.0.0.1:9000` và `0.0.0.0:9000`, dòng `Address already in use`, PID khớp với dòng `ss`, đủ `curl: (7)`, `(28)`, `(6)` | PID trong lỗi và PID trong `ss` khác nhau mà không giải thích; coi timeout là refused | Khi nào bạn thấy refused, khi nào timeout? Nếu server bind `127.0.0.1`, máy khác trong mạng gọi vào sẽ thấy gì? |
| Nhiệm vụ 2: `diagnose.sh` (10) | `diagnose-output.txt` có ba kết luận khác nhau; script có `set -u`, kiểm tra tham số, quote biến | Output ba lần chạy giống nhau; script chỉ in kết luận cố định; không chạy lại được | Chạy lại script với `192.0.2.1 80` và giải thích kết quả. Vì sao script dừng ở tầng đầu tiên lỗi? |
| Nhiệm vụ 3: repo sạch (10) | `git ls-files` không có `.env`; `git check-ignore -v .env` in ra mẫu chặn; lịch sử không có `.env` | `.env` xuất hiện ở bất kỳ commit nào (kiểm tra `git log --all -- .env`); ảnh chụp thay cho text | Nếu `.env` đã nằm trong lịch sử thì bạn làm gì tiếp? Vì sao `git rm --cached` chưa đủ? |
| Nhiệm vụ 3: branch, commit, PR (15) | `git log --oneline --graph --all` có ít nhất hai branch tính năng merge qua PR, mỗi branch từ hai commit, thông điệp bắt đầu bằng động từ | Chỉ một commit lớn; thông điệp `update`, `abc`; commit thẳng vào `main`; hash và thời gian commit dồn trong vài phút bất thường | Vì sao mỗi nhiệm vụ một branch riêng? Mở PR của bạn và chỉ ra phần mô tả trả lời "cách kiểm tra". |
| Nhiệm vụ 3: review (5) | PR có review của tài khoản khác, ít nhất một comment gắn vào một dòng cụ thể | Chỉ có "LGTM"; reviewer là tài khoản phụ của chính tác giả | Reviewer đã góp ý gì, bạn sửa thế nào? |
| Nhiệm vụ 4: conflict (10) | `conflict-output.txt` có `CONFLICT (content)` thật, `team.md` cuối giữ ý của cả hai bên, `grep -c` marker bằng 0 | Không có output conflict; file chỉ giữ một bên; lịch sử không có merge commit mà là commit sửa tay | Vẽ lại lịch sử hai branch trước và sau merge. Vì sao Git không tự giải quyết được? |
| Nhiệm vụ 4: revert (5) | `git log` có commit `Revert "..."`, file trở lại trạng thái trước commit sai | Dùng `reset --hard` hoặc `--force` (thấy trong `reflog` hoặc lịch sử lệnh); lịch sử bị viết lại | Khi nào `reset --hard` là chấp nhận được? Vì sao không dùng nó trên nhánh chung? |
| Câu hỏi kiểm tra (10) | Câu trả lời có ví dụ từ output của chính bài làm | Trả lời giống nhau từng chữ với bài khác hoặc với tài liệu; sai khái niệm | Chọn một câu và yêu cầu học viên minh họa bằng lệnh ngay trên máy. |
| README và khả năng chạy lại (5) | README trả lời đủ 7 câu; người khác chạy lại được script theo hướng dẫn | Script dùng đường dẫn tuyệt đối của máy cá nhân; README sao chép đề | Chạy `diagnose.sh` từ thư mục khác và xem còn chạy được không. |

Kiểm tra chéo giữa các file: PID, IP và thời gian trong `command-output.txt`, `diagnose-output.txt` và `report.md` phải khớp nhau. Phần thưởng L2: Thử thách A cần output `GH006` hoặc `GH013`; Thử thách B cần mỗi bước có dòng trích thật; Thử thách C cần hai lần chạy hook, một bị chặn và một qua.
