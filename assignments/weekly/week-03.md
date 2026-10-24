# Bài tập tuần 3 – Networking & Git Collaboration

> **Tóm tắt:** Nộp bằng chứng chẩn đoán một request theo tầng (IP, DNS, port, HTTP) và lịch sử Git có branch, Pull Request, conflict, revert. Dùng log lệnh thật và PR có thể kiểm tra.

Bài tập = nộp lại bằng chứng của lab, không có việc mới, ngoại trừ ba việc ghi rõ trong bảng: script `diagnose.sh`, năm câu hỏi kiểm tra, và làm lại quy trình branch, PR, conflict trong repo `devops-labs` của chính bạn (một mình, bằng hai branch). Bài làm trong [Buổi 05 – Networking Fundamentals](../../labs/week-03/session-05.md) và [Buổi 06 – Git & GitHub Workflow](../../labs/week-03/session-06.md); hub tuần: [Hub Tuần 3](../../labs/week-03/README.md).

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Bản đồ mạng của máy bạn | Buổi 05, Phần 1 và Phần 2 (thêm `getent hosts github.com`) | 0,5 giờ | `lab-05/evidence/command-output.txt`, đoạn giải thích trong `lab-05/report.md` |
| 2. Chẩn đoán kết nối theo tầng | Buổi 05, Phần 3 đến Phần 5; việc mới: viết `diagnose.sh` | 1,5 giờ (script khoảng 45 phút) | output `ss`, `curl`, `Address already in use`; `lab-05/source/diagnose.sh`, `lab-05/evidence/diagnose-output.txt` |
| 3. Repo sạch, branch, Pull Request | Buổi 06, Phần 1 và Phần 2, làm lại trong `devops-labs` | 1 giờ | `.gitignore`, `git check-ignore -v .env`, `git log --oneline --graph --all`, link các PR đã merge |
| 4. Conflict một mình và revert | Buổi 06, Phần 3 và Phần 4 (tự đóng hai vai) | 1 giờ | `lab-06/evidence/conflict-output.txt`, `team.md` đã resolve, output `git revert` |
| Câu hỏi kiểm tra | Việc mới, viết trong `lab-06/report.md` | 0,5 giờ | 5 câu trả lời ngắn |

Toàn bộ lệnh chạy trong WSL2 Ubuntu, thư mục làm việc trong `~/devops-labs` (không dùng `/mnt/c`). Đánh giá dựa trên những gì kiểm chứng được: nội dung `evidence/`, lịch sử commit, trạng thái PR và kết quả chạy lại script. Ảnh chụp chỉ là phần bổ trợ.

## Bảng điểm

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: thông tin IP, ping, DNS | 15 |
| Nhiệm vụ 2: chẩn đoán kết nối và `ss` | 15 |
| Nhiệm vụ 2: script `diagnose.sh` | 10 |
| Nhiệm vụ 3: repo sạch, `.gitignore`, secret | 10 |
| Nhiệm vụ 3: branch, commit, PR | 15 |
| Nhiệm vụ 3: review của bạn khác | 5 |
| Nhiệm vụ 4: merge conflict | 10 |
| Nhiệm vụ 4: hoàn tác an toàn bằng `revert` | 5 |
| Câu hỏi kiểm tra kiến thức (mỗi câu 2 điểm) | 10 |
| Chất lượng báo cáo và khả năng chạy lại | 5 |
| **Tổng L1** | **100** |
| Thưởng L2 (mỗi thử thách hoàn chỉnh 5 điểm, tối đa 10) | +10 |

Điểm của một tiêu chí bị trừ hết nếu bằng chứng không kiểm chứng được (không có log hoặc log không khớp lệnh). Tránh commit `.env`, commit thẳng vào `main`, dùng `reset --hard` hoặc `--force` trên nhánh chung, và nộp output giả; bảng điểm chi tiết chỉ mentor xem.

## Nhiệm vụ L1

Bốn nhiệm vụ bắt buộc. Nhiệm vụ 1 và 2 nộp trong `lab-05/`, nhiệm vụ 3 và 4 nộp trong `lab-06/`.

### Nhiệm vụ 1 – Bản đồ mạng của máy bạn (thư mục `lab-05/`)

Yêu cầu:

- Ghi địa chỉ IP, độ dài prefix và default gateway của `eth0`, mỗi thứ lấy từ đúng một lệnh (`ip -br addr`, `ip route`).
- `ping` thành công tới `127.0.0.1` và `1.1.1.1` với đúng 4 gói mỗi lệnh.
- `nslookup github.com` có kết quả; chỉ ra trong `report.md` dòng nào là DNS resolver đang dùng và đối chiếu với dòng `nameserver` trong `/etc/resolv.conf`.
- Chạy `getent hosts github.com` và giải thích ngắn khác biệt giữa `getent hosts` và `nslookup` (một lệnh đi qua cơ chế phân giải của hệ điều hành, lệnh kia chỉ hỏi DNS).

Tiêu chí hoàn thành:

- `evidence/command-output.txt` chứa các lệnh trên cùng output thật, mỗi khối có một dòng `$ lệnh` đứng trước.
- Hai lệnh `ping` đều báo `0% packet loss` và `4 received`.
- `report.md` có đoạn giải thích vì sao ping `1.1.1.1` không cần DNS.

### Nhiệm vụ 2 – Chẩn đoán kết nối theo tầng (thư mục `lab-05/`)

Yêu cầu:

- Chạy `python3 -m http.server` ở port 9000 bind vào `127.0.0.1`, thư mục phục vụ là `source/site/` có `index.html` chứa họ tên của bạn.
- Dùng `ss -ltnp` chứng minh process lắng nghe đúng `127.0.0.1:9000`, và `curl` lấy được trang với status 200.
- Đổi sang bind `0.0.0.0` và ghi lại khác biệt ở cột Local Address của `ss`.
- Gây `Address already in use` bằng server thứ hai cùng port, rồi dùng `ss -ltnp 'sport = :9000'` tìm PID.
- Tái hiện ba lỗi `curl`: connection refused (port không ai lắng nghe), timeout (`192.0.2.1` với `--max-time 3`), không phân giải được tên (tên miền đuôi `.invalid`).
- Việc mới: viết `source/diagnose.sh` nhận hai tham số `HOST` và `PORT`, in ra từng tầng kiểm tra (phân giải tên, kết nối TCP, request HTTP) và kết luận lỗi nằm ở tầng nào. Script phải chạy được với cả ba lỗi ở trên. Gợi ý: kiểm tra từ dưới lên và dừng ở tầng đầu tiên lỗi.

Tiêu chí hoàn thành:

- `evidence/command-output.txt` có dòng `LISTEN` của port 9000 ở cả hai chế độ bind, có `Address already in use` và PID đã tìm ra.
- Có đủ ba mã lỗi `curl: (7)`, `curl: (28)` (hoặc lỗi mạng tương đương, ghi chú rõ) và `curl: (6)`.
- Chạy `bash source/diagnose.sh khong-ton-tai.invalid 80`, `bash source/diagnose.sh 127.0.0.1 9001` và `bash source/diagnose.sh 127.0.0.1 9000` (khi server chạy) cho ba kết luận khác nhau; output nằm trong `evidence/diagnose-output.txt`.
- Script có `set -u`, kiểm tra đủ hai tham số và in hướng dẫn dùng nếu thiếu.

### Nhiệm vụ 3 – Repo sạch và quy trình branch, Pull Request (thư mục `lab-06/`)

Làm trong repo `devops-labs` của bạn (public).

Yêu cầu:

- Repo có `.gitignore` chặn ít nhất `.env`, `node_modules/` và `*.log`, và có `README.md` mô tả ngắn `lab-05/`, `lab-06/`.
- Mỗi nhiệm vụ làm trên một branch riêng, tên theo quy ước `feature/...` hoặc `docs/...` (ví dụ `docs/lab-05-network-report`). Không commit trực tiếp vào `main` sau commit khởi tạo.
- Mỗi branch có tối thiểu hai commit với thông điệp rõ nghĩa (bắt đầu bằng động từ như `Add`, `Fix`, `Document`), không dùng `update` hay `abc`.
- Mở Pull Request cho mỗi branch với mô tả gồm: thay đổi gì, vì sao, cách kiểm tra lại. PR cho `lab-05` phải được một bạn review và có ít nhất một comment cụ thể trên một dòng.
- Tạo file `.env` giả chứa `DB_PASSWORD=dummy-value` và chứng minh Git bỏ qua nó bằng `git check-ignore -v .env` và `git status --short`.

Tiêu chí hoàn thành:

- `git log --oneline --graph --all` (lưu vào `lab-06/evidence/command-output.txt`) cho thấy ít nhất hai branch tính năng được merge bằng PR.
- `git ls-files` không chứa `.env`.
- Ít nhất hai PR đã merge, trong đó một PR có review của bạn khác.

### Nhiệm vụ 4 – Tạo và giải quyết merge conflict, rồi hoàn tác an toàn (thư mục `lab-06/`)

Yêu cầu:

- Tạo `lab-06/source/team.md` có dòng `Ten thanh vien: (chua dien)` và đưa lên `main` qua PR. Từ `main` tạo hai branch `feature/conflict-a` và `feature/conflict-b`, mỗi branch sửa dòng đó thành giá trị khác nhau và commit.
- Merge branch thứ nhất vào `main` qua PR. Cập nhật branch thứ hai bằng `git merge origin/main`, để Git báo conflict, mở file có dấu `<<<<<<<`, `=======`, `>>>>>>>` và giải quyết sao cho giữ nội dung hợp lý của cả hai bên (không chỉ xóa một bên).
- Commit kết quả merge, push, merge PR còn lại.
- Trên branch `practice/revert-demo`, thêm một commit sai có chủ đích rồi hoàn tác bằng `git revert`, không dùng `git reset --hard` hay `git push --force`.

Tiêu chí hoàn thành:

- `lab-06/evidence/conflict-output.txt` chứa dòng `CONFLICT (content)` từ output thật của `git merge`.
- `team.md` cuối cùng trên `main` không còn `<<<<<<<`, `=======` hay `>>>>>>>` (kiểm tra bằng `grep -c`).
- `git log --oneline` của branch thực hành có commit dạng `Revert "..."`, và file trở lại trạng thái trước commit sai.
- `report.md` mô tả bằng lời của bạn vì sao dùng `revert` thay vì `reset` cho nhánh đã push.

## Nhiệm vụ L2 (tùy chọn)

Chọn tối đa hai trong ba thử thách; mỗi thử thách hoàn chỉnh được cộng điểm thưởng. Tự làm trước khi xem gợi ý trong [Buổi 05 – Thử thách nâng cao](../../labs/week-03/session-05-challenge.md) và [Buổi 06 – Thử thách nâng cao](../../labs/week-03/session-06-challenge.md).

- **A – Bảo vệ nhánh main.** Bật branch protection (hoặc Ruleset) cho `main` (bắt buộc PR, ít nhất một approval nếu gói repo cho phép), rồi thử push thẳng và ghi lỗi bị từ chối. Hoàn thành khi `lab-06/evidence/protection-output.txt` có output thật (cụm `protected branch` hoặc `Repository rule violations`) và `report.md` liệt kê từng tùy chọn đã bật cùng một hạn chế bạn nhận ra (ví dụ quyền bypass của admin). Nếu repo không bật được, ghi lý do và làm thử thách C thay thế.
- **B – Đường đi của một request HTTPS.** Dựa trên `curl -v https://example.com/`, viết trong `report.md` đoạn 8 đến 12 dòng; mỗi bước trích một dòng bằng chứng và nêu một lệnh khác kiểm tra tầng đó, kèm sơ đồ `mermaid` dạng `sequenceDiagram`. Hoàn thành khi có ít nhất 5 bước kèm dòng trích thật trong `evidence/command-output.txt`, sơ đồ hiển thị đúng trên GitHub, và giải thích vì sao `curl --resolve demo.club.test:9000:127.0.0.1 http://demo.club.test:9000/` gọi được server cục bộ mà không sửa `/etc/hosts` (liên hệ header `Host`).
- **C – Hook chặn commit secret.** Viết `source/pre-commit` (script shell) làm Git hook: từ chối commit nếu file staged có tên `.env` hoặc nội dung chứa `PASSWORD=` với giá trị không rỗng và không phải `change-me`; hướng dẫn cài vào `.git/hooks/` trong `README.md` của `lab-06/`. Hoàn thành khi `lab-06/evidence/hook-output.txt` có hai lần chạy thật (một commit bị chặn với exit code khác 0, một commit hợp lệ), hook không chứa secret thật, và `report.md` nêu một cách hook bị qua mặt (ví dụ `git commit --no-verify`) cùng lý do cần thêm biện pháp phía server như CI hoặc branch protection.

## Bằng chứng cần nộp

Nộp vào repo `devops-labs` theo [mẫu lab](../../templates/lab-template.md). Mỗi lab có `README.md` trả lời 7 câu của mẫu, `source/`, `screenshots/`, `evidence/` và `report.md`.

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

Quy ước evidence: mỗi khối có dòng lệnh bắt đầu bằng `$ ` rồi đến output thật. Không chỉnh output cho đẹp; output dài thì cắt bằng `head` và ghi rõ.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong `lab-06/report.md`, mục `Câu hỏi kiểm tra`, dùng ví dụ từ output của chính bạn khi có thể.

1. Khác biệt giữa `127.0.0.1` và `0.0.0.0` khi một server bind địa chỉ là gì? Khi nào bạn chọn loại nào?
2. Ba lỗi `Connection refused`, `Connection timed out` và `Could not resolve host` cho biết điều gì về tầng gặp sự cố và bước kiểm tra đầu tiên cho mỗi lỗi?
3. Vì sao trong một container, `localhost` không trỏ tới máy host, và điều đó liên quan thế nào tới việc chạy `curl` vào backend từ bên trong container khác?
4. Phân biệt `git fetch`, `git pull` và `git merge origin/main`. Lệnh nào thay đổi working directory của bạn?
5. Nếu bạn lỡ commit và push một file `.env` chứa mật khẩu thật, thêm nó vào `.gitignore` có đủ không? Cần làm gì thêm?

## Quy trình nộp

1. Tạo branch riêng cho từng nhiệm vụ trong `devops-labs`, đặt tên theo quy ước ở Nhiệm vụ 3.
2. Commit theo từng bước nhỏ, push branch lên GitHub.
3. Mở Pull Request vào `main`, điền mô tả (thay đổi gì, vì sao, cách kiểm tra lại) và đánh dấu level đã làm (L1, L2).
4. Nhờ một bạn trong CLB review; reviewer để ít nhất một comment cụ thể, bạn trả lời hoặc sửa theo góp ý.
5. Ghi đường dẫn các PR vào `lab-06/README.md` và báo mentor. Mentor chấm dựa trên PR, evidence và việc chạy lại script, rồi gửi nhận xét trong PR.

Hạn nộp: trước buổi đầu tiên của tuần 4. Nộp trễ có thể bị trừ điểm theo [Đánh giá](../../curriculum/assessment.md).

## Checklist trước khi nộp

- [ ] `lab-05/` và `lab-06/` đúng cấu trúc theo mẫu, mỗi lab có `README.md` trả lời 7 câu và ghi level đã làm (L1, L2).
- [ ] `evidence/command-output.txt` của mỗi lab có lệnh và output thật, có dòng `$ lệnh` trước mỗi khối.
- [ ] `diagnose.sh` chạy được với ba kịch bản và output nằm trong `evidence/diagnose-output.txt`.
- [ ] Không còn server Python hay process nào của bài chiếm port (kiểm tra bằng `ss -ltnp`).
- [ ] `.gitignore` chặn `.env`, `git ls-files` không chứa `.env`, không có secret thật trong lịch sử.
- [ ] Mỗi nhiệm vụ một branch, commit rõ nghĩa, không commit trực tiếp vào `main`; các PR đã mở với mô tả đầy đủ và ít nhất một PR được bạn khác review.
- [ ] `team.md` trên `main` không còn marker conflict, có commit `Revert` trên branch thực hành.
- [ ] `report.md` có bảng bốn tầng, trả lời 5 câu hỏi kiểm tra, ghi lỗi đã gặp và cách khắc phục.
