# Bài tập tuần 3 – Networking & Git Collaboration

> **Tóm tắt:** Chẩn đoán một request theo từng tầng (IP, DNS, port, HTTP) bằng `ping`, `nslookup`, `ss`, `curl`, rồi dùng Git theo quy trình branch, Pull Request, resolve conflict và hoàn tác an toàn. Nộp bằng chứng là log lệnh thật và lịch sử Git có thể kiểm tra.

## Bối cảnh

Hai buổi học tuần này là hai kỹ năng bạn sẽ dùng ở mọi tuần sau. Khi một service "không chạy được", việc đầu tiên là xác định lỗi nằm ở tầng nào: tên không phân giải, không ai lắng nghe port, hay server trả lỗi HTTP. Khi làm việc nhóm, mọi thay đổi phải đi qua branch và Pull Request để người khác đọc, và lịch sử Git phải sạch, không chứa secret.

Bài tập này dùng lại các kỹ thuật ở [Buổi 05 – Networking Fundamentals](../../labs/week-03/session-05.md) và [Buổi 06 – Git & GitHub Workflow](../../labs/week-03/session-06.md). Bạn làm một mình trong repo cá nhân (ví dụ `devops-labs`), nhưng có hai chỗ cần một bạn khác review. Toàn bộ lệnh chạy trong WSL2 Ubuntu, thư mục làm việc nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.

Đánh giá dựa trên những gì kiểm chứng được: nội dung `evidence/command-output.txt`, lịch sử commit, trạng thái PR, và kết quả chạy lại script của bạn. Ảnh chụp màn hình chỉ là phần bổ trợ.

## Nhiệm vụ L1

Bốn nhiệm vụ sau là bắt buộc. Nhiệm vụ 1 và 2 nộp trong `lab-05/`, nhiệm vụ 3 và 4 nộp trong `lab-06/`.

### Nhiệm vụ 1 – Bản đồ mạng của máy bạn (thư mục `lab-05/`)

Thu thập thông tin tầng IP và DNS của môi trường WSL2 và ghi lại bằng lệnh thật.

Yêu cầu:

- Ghi địa chỉ IP, độ dài prefix và default gateway của giao diện `eth0`, mỗi thứ lấy từ đúng một lệnh (gợi ý nhóm lệnh: `ip -br addr`, `ip route`).
- `ping` thành công tới `127.0.0.1` và tới `1.1.1.1` với đúng 4 gói mỗi lệnh.
- `nslookup github.com` có kết quả; chỉ ra trong `report.md` dòng nào là DNS resolver đang dùng và đối chiếu với dòng `nameserver` trong `/etc/resolv.conf`.
- Chạy `getent hosts github.com` và giải thích ngắn khác biệt giữa `getent hosts` và `nslookup` (một lệnh đi qua cơ chế phân giải của hệ điều hành, lệnh kia chỉ hỏi DNS).

Tiêu chí hoàn thành (đo được):

- `evidence/command-output.txt` chứa các lệnh trên cùng output thật, mỗi khối có một dòng `$ lệnh` đứng trước.
- Hai lệnh `ping` đều báo `0% packet loss` và `4 received`.
- `report.md` có đoạn giải thích vì sao ping `1.1.1.1` không cần DNS.

### Nhiệm vụ 2 – Chẩn đoán kết nối theo tầng (thư mục `lab-05/`)

Tạo một server tĩnh và chứng minh bạn phân biệt được các lỗi kết nối.

Yêu cầu:

- Chạy `python3 -m http.server` ở port 9000 bind vào `127.0.0.1`, thư mục phục vụ là `source/site/` có `index.html` chứa dòng chữ gồm họ tên của bạn.
- Dùng `ss -ltnp` chứng minh process đang lắng nghe đúng `127.0.0.1:9000`, và `curl` lấy được trang với status 200.
- Đổi sang bind `0.0.0.0` và ghi lại sự khác nhau ở cột Local Address của `ss`.
- Gây lỗi `Address already in use` bằng cách chạy server thứ hai cùng port, rồi dùng `ss -ltnp 'sport = :9000'` tìm PID của process đang chiếm port.
- Tái hiện ba lỗi `curl`: connection refused (port không ai lắng nghe), timeout (dùng địa chỉ `192.0.2.1` và `--max-time 3`), và không phân giải được tên (dùng tên miền có đuôi `.invalid`).
- Viết script `source/diagnose.sh` nhận hai tham số `HOST` và `PORT`, in ra từng tầng kiểm tra (phân giải tên, kết nối TCP, request HTTP) và kết luận lỗi nằm ở tầng nào. Script phải chạy được với cả ba lỗi ở trên.

Tiêu chí hoàn thành (đo được):

- `evidence/command-output.txt` có dòng `LISTEN` của port 9000 ở cả hai chế độ bind, có dòng `Address already in use` và PID đã tìm ra.
- Có đủ ba mã lỗi `curl: (7)`, `curl: (28)` (hoặc lỗi mạng tương đương, ghi chú rõ) và `curl: (6)`.
- Chạy `bash source/diagnose.sh khong-ton-tai.invalid 80`, `bash source/diagnose.sh 127.0.0.1 9001` và `bash source/diagnose.sh 127.0.0.1 9000` (khi server chạy) cho ba kết luận khác nhau; output của ba lần chạy nằm trong `evidence/diagnose-output.txt`.
- Script có `set -u`, kiểm tra đủ hai tham số và in hướng dẫn dùng nếu thiếu.

### Nhiệm vụ 3 – Repo sạch và quy trình branch, Pull Request (thư mục `lab-06/`)

Thực hành quy trình làm việc chuẩn trong repo cá nhân.

Yêu cầu:

- Repo có `.gitignore` chặn ít nhất `.env`, `node_modules/` và `*.log`, và có `README.md` mô tả ngắn thư mục `lab-05/`, `lab-06/`.
- Mỗi nhiệm vụ làm trên một branch riêng, tên theo quy ước `feature/...` hoặc `docs/...` (ví dụ `docs/lab-05-network-report`). Không commit trực tiếp vào `main` sau commit khởi tạo.
- Mỗi branch có tối thiểu hai commit với thông điệp rõ nghĩa (ví dụ bắt đầu bằng động từ như `Add`, `Fix`, `Document`), không dùng thông điệp kiểu `update` hay `abc`.
- Mở Pull Request cho mỗi branch với mô tả gồm: thay đổi gì, vì sao, cách kiểm tra lại. PR cho `lab-05` phải được một bạn review và có ít nhất một comment cụ thể trên một dòng code hoặc dòng văn bản.
- Chủ động tạo một file `.env` giả chứa `DB_PASSWORD=dummy-value` trong thư mục làm việc và chứng minh Git bỏ qua nó bằng `git check-ignore -v .env` và `git status --short`.

Tiêu chí hoàn thành (đo được):

- `git log --oneline --graph --all` (lưu vào `lab-06/evidence/command-output.txt`) cho thấy ít nhất hai branch tính năng được merge bằng PR.
- `git ls-files` không chứa `.env`.
- Có ít nhất hai PR đã merge, trong đó một PR có review của bạn khác.

### Nhiệm vụ 4 – Tạo và giải quyết merge conflict, rồi hoàn tác an toàn (thư mục `lab-06/`)

Một mình bạn vẫn tạo được conflict thật bằng hai branch cùng sửa một dòng.

Yêu cầu:

- Tạo file `lab-06/source/team.md` có dòng `Ten thanh vien: (chua dien)`. Từ `main` tạo hai branch `feature/conflict-a` và `feature/conflict-b`, mỗi branch sửa dòng đó thành giá trị khác nhau và commit.
- Merge branch thứ nhất vào `main` qua PR. Sau đó cập nhật branch thứ hai bằng `git merge origin/main`, để Git báo conflict, mở file có dấu `<<<<<<<`, `=======`, `>>>>>>>` và giải quyết sao cho kết quả giữ nội dung hợp lý của cả hai bên (không chỉ xóa một bên).
- Commit kết quả merge, push, và merge PR còn lại.
- Trên một branch riêng `practice/revert-demo`, thêm một commit sai có chủ đích rồi hoàn tác bằng `git revert`, không dùng `git reset --hard` hay `git push --force`.

Tiêu chí hoàn thành (đo được):

- `lab-06/evidence/conflict-output.txt` chứa dòng `CONFLICT (content)` từ output thật của `git merge`.
- File `team.md` cuối cùng trên `main` không còn chuỗi `<<<<<<<`, `=======` hay `>>>>>>>` (kiểm tra bằng `grep -c`).
- `git log --oneline` của branch thực hành có commit dạng `Revert "..."`, và file đã trở lại trạng thái trước commit sai.
- `report.md` mô tả bằng lời của bạn vì sao dùng `revert` thay vì `reset` cho nhánh đã được push.

## Nhiệm vụ L2

Chọn tối đa hai trong ba thử thách sau. Mỗi thử thách hoàn chỉnh được cộng điểm thưởng (xem phần Barem). Tự làm trước khi xem gợi ý trong bài lab.

### Thử thách A – Bảo vệ nhánh main

Bật branch protection (hoặc Ruleset) cho `main` trong repo của bạn: bắt buộc Pull Request trước khi merge và bắt buộc ít nhất một approval nếu gói repo cho phép. Sau đó thử push trực tiếp vào `main` và ghi lại lỗi bị từ chối.

Tiêu chí hoàn thành:

- `lab-06/evidence/protection-output.txt` chứa output thật của lần push bị từ chối (có cụm `protected branch` hoặc `Repository rule violations`).
- `report.md` ghi lại cấu hình bạn đã bật (liệt kê từng tùy chọn) và một hạn chế bạn nhận ra của cấu hình đó (ví dụ quyền bypass của admin).
- Nếu repo của bạn không bật được tính năng này (repo private trên gói miễn phí), ghi rõ lý do trong `report.md` và làm thử thách C thay thế.

### Thử thách B – Mô tả đường đi của một request HTTPS

Dựa trên `curl -v https://example.com/`, viết trong `report.md` đoạn 8 đến 12 dòng mô tả các bước từ lúc gõ URL đến lúc nhận trang: phân giải tên, TCP handshake, TLS, HTTP request và response. Với mỗi bước, trích đúng một dòng bằng chứng từ output của `curl -v` và nêu một lệnh khác để kiểm tra riêng tầng đó. Thêm một sơ đồ `mermaid` dạng `sequenceDiagram` của chính request đó.

Tiêu chí hoàn thành:

- Có ít nhất 5 bước, mỗi bước kèm dòng trích từ output thật nằm trong `evidence/command-output.txt`.
- Sơ đồ mermaid hiển thị đúng khi xem trên GitHub.
- Có giải thích vì sao `curl --resolve demo.club.test:9000:127.0.0.1 http://demo.club.test:9000/` gọi được server cục bộ mà không sửa `/etc/hosts`, và liên hệ với header `Host`.

### Thử thách C – Hook chặn commit secret

Viết `source/pre-commit` (script shell) dùng làm Git hook: từ chối commit nếu file được staged có tên `.env` hoặc nội dung chứa mẫu `PASSWORD=` với giá trị không rỗng và không phải `change-me`. Hướng dẫn cài vào `.git/hooks/` trong `README.md` của `lab-06/`.

Tiêu chí hoàn thành:

- `lab-06/evidence/hook-output.txt` có hai lần chạy thật: một commit bị chặn (exit code khác 0 kèm thông báo) và một commit hợp lệ đi qua.
- Hook không tự chứa secret thật nào, chỉ dùng giá trị giả.
- `report.md` nêu rõ một cách hook này có thể bị qua mặt (ví dụ `git commit --no-verify`) và vì sao cần thêm biện pháp ở phía server như CI hoặc branch protection.

## Bằng chứng cần nộp

Nộp vào repo cá nhân theo [templates/lab-template.md](../../templates/lab-template.md). Mỗi lab có `README.md` trả lời 7 câu hỏi của template, `source/`, `screenshots/`, `evidence/` và `report.md`.

```text
lab-05/
├── README.md
├── source/
│   ├── site/index.html
│   └── diagnose.sh
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   └── diagnose-output.txt
└── report.md

lab-06/
├── README.md
├── source/
│   ├── team.md
│   └── pre-commit          (chỉ khi làm thử thách C)
├── screenshots/
├── evidence/
│   ├── command-output.txt
│   ├── conflict-output.txt
│   ├── protection-output.txt   (thử thách A)
│   └── hook-output.txt         (thử thách C)
└── report.md
```

Bằng chứng theo từng nhiệm vụ:

| Nhiệm vụ | Bằng chứng bắt buộc |
| --- | --- |
| 1 | Output `ip`, `ping`, `nslookup`, `getent hosts` trong `lab-05/evidence/command-output.txt`; đoạn giải thích trong `lab-05/report.md` |
| 2 | Output `ss`, `curl`, lỗi `Address already in use`; `lab-05/source/diagnose.sh` và `lab-05/evidence/diagnose-output.txt` |
| 3 | `.gitignore`, output `git check-ignore -v .env`, `git log --oneline --graph --all`, đường dẫn tới các PR đã merge (ghi trong `lab-06/README.md`) |
| 4 | `lab-06/evidence/conflict-output.txt`, `team.md` đã resolve, output `git revert` và `git log` |
| L2 | File evidence tương ứng nêu ở từng thử thách |

Quy ước evidence: mỗi khối có dòng lệnh bắt đầu bằng `$ ` rồi đến output thật. Không chỉnh sửa output cho đẹp. Nếu output dài, cắt bằng `head` và ghi rõ.

## Barem chấm

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

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `lab-06/report.md`, mục `Câu hỏi kiểm tra`. Dùng ví dụ từ output của chính bạn khi có thể.

1. Khác biệt giữa `127.0.0.1` và `0.0.0.0` khi một server bind địa chỉ là gì? Khi nào bạn chọn loại nào?
2. Ba lỗi `Connection refused`, `Connection timed out` và `Could not resolve host` cho biết điều gì về tầng gặp sự cố và bước kiểm tra đầu tiên cho mỗi lỗi?
3. Vì sao trong một container, `localhost` không trỏ tới máy host, và điều đó liên quan thế nào tới việc chạy `curl` vào backend từ bên trong container khác?
4. Phân biệt `git fetch`, `git pull` và `git merge origin/main`. Lệnh nào thay đổi working directory của bạn?
5. Nếu bạn lỡ commit và push một file `.env` chứa mật khẩu thật, thêm nó vào `.gitignore` có đủ không? Cần làm gì thêm?

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

## Quy trình nộp

```mermaid
flowchart LR
    A[Tao branch] --> B[Commit va push]
    B --> C[Mo Pull Request]
    C --> D[Ban review]
    D --> E[Sua theo gop y]
    E --> F[Mentor cham]
```

1. Tạo branch riêng cho từng nhiệm vụ trong repo cá nhân, đặt tên theo quy ước ở Nhiệm vụ 3.
2. Commit theo từng bước nhỏ, push branch lên GitHub.
3. Mở Pull Request vào `main` của repo cá nhân, điền mô tả: thay đổi gì, vì sao, cách kiểm tra lại, và đánh dấu level đã làm (L1, L2).
4. Nhờ một bạn trong CLB review. Reviewer để lại ít nhất một comment cụ thể; bạn trả lời hoặc sửa theo góp ý.
5. Sau khi có review, ghi đường dẫn các PR vào `lab-06/README.md` và báo mentor.
6. Mentor chấm dựa trên PR, evidence và việc chạy lại script; kết quả và nhận xét gửi lại trong PR.

Hạn nộp: trước buổi đầu tiên của tuần 4. Nộp trễ có thể bị trừ điểm theo quy định trong [curriculum/assessment.md](../../curriculum/assessment.md).

## Checklist trước khi nộp

- [ ] `lab-05/` và `lab-06/` đúng cấu trúc thư mục theo template, mỗi lab có `README.md` trả lời 7 câu hỏi.
- [ ] `evidence/command-output.txt` của mỗi lab chứa lệnh và output thật, có dòng `$ lệnh` trước mỗi khối.
- [ ] `diagnose.sh` chạy được với ba kịch bản và output nằm trong `evidence/diagnose-output.txt`.
- [ ] Không còn server Python hoặc process nào của bài này đang chiếm port (kiểm tra bằng `ss -ltnp`).
- [ ] `.gitignore` chặn `.env`, `git ls-files` không chứa `.env`, không có secret thật trong lịch sử.
- [ ] Mỗi nhiệm vụ làm trên branch riêng, commit có thông điệp rõ nghĩa, không commit trực tiếp vào `main`.
- [ ] Các PR đã mở với mô tả đầy đủ, ít nhất một PR được bạn khác review.
- [ ] File `team.md` trên `main` không còn marker conflict, có commit `Revert` trên branch thực hành.
- [ ] `report.md` có bảng bốn tầng, trả lời 5 câu hỏi kiểm tra, ghi lỗi đã gặp và cách khắc phục.
- [ ] Đã ghi level đã làm (L1, L2) ở cuối `README.md` của mỗi lab.
