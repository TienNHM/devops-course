# Walkthrough tuần 3 – Networking và Git Collaboration

::: warning Dành cho mentor và học viên đã nộp bài
Trang này là đáp án đối chiếu: mentor dùng để chấm, học viên chỉ mở sau khi đã nộp bài của mình.
:::

> **Tóm tắt:** Hướng dẫn giải Buổi 05 (chẩn đoán mạng theo tầng) và Buổi 06 (Git, Pull Request, conflict, branch protection), kèm đáp án bài tập tuần 3 và hướng dẫn chấm cho mentor.

## Cách dùng tài liệu này

Chỉ đọc sau khi bạn đã tự làm xong bài lab và bài tập của tuần. Mục đích là đối chiếu cách nghĩ, không phải chép lệnh: output của bạn (IP, PID, thời gian, hash commit) sẽ khác output trong tài liệu này, và mentor chấm dựa trên output thật của máy bạn.

Mỗi buổi có bốn phần: đáp án L1, lời giải L2, lời giải phần Phá lỗi và những hiểu lầm hay gặp. Cuối tài liệu là gợi ý cho bài tập tuần và hướng dẫn chấm. Đề gốc nằm ở [Buổi 05](../../labs/week-03/session-05.md), [Buổi 06](../../labs/week-03/session-06.md) và [bài tập tuần 3](../../assignments/weekly/week-03.md).

Các lệnh Docker, Git, curl và script trong tài liệu đã được chạy kiểm tra thử trên một môi trường Linux và Git; riêng những bước cần GitHub thật (Pull Request, review, branch protection) chỉ được kiểm tra ở mức logic và thông báo lỗi mẫu trong đề.

### Buổi 05 – Networking Fundamentals

#### Đáp án các nhiệm vụ L1

1. **Ghi IP, prefix, gateway của `eth0`.** Chạy `ip -br addr` và `ip route`. Dòng `eth0 UP 172.24.100.5/20` cho IP là `172.24.100.5` và prefix `/20`. Dòng `default via 172.24.96.1 dev eth0` cho gateway. Ghi cả ba giá trị vào `report.md`. Nếu mentor hỏi vì sao gateway `172.24.96.1` khác dải của IP: không khác, với `/20` thì dải mạng là `172.24.96.0` đến `172.24.111.255`, cả hai địa chỉ cùng subnet.

2. **Ping loopback và Internet.**

   ```bash
   ping -c 4 127.0.0.1 | tee -a evidence/command-output.txt
   ping -c 4 1.1.1.1 | tee -a evidence/command-output.txt
   ```

   Cả hai phải có `4 packets transmitted, 4 received, 0% packet loss`. Giải thích vì sao ping IP không cần DNS: địa chỉ đã là IP nên không có bước đổi tên thành IP. Ping thành công chỉ chứng minh tầng IP và ICMP đi được, chưa nói gì về DNS, TCP hay HTTP.

3. **`nslookup github.com`.** Dòng `Server:` là DNS resolver đang dùng, phải khớp với dòng `nameserver` trong `/etc/resolv.conf`. Đó là bằng chứng bạn đang hỏi đúng resolver của hệ thống. Dòng `Address` ở phần `Non-authoritative answer` là IP của GitHub, có thể có nhiều dòng và khác giữa các máy.

4. **`curl -v` có dòng `>` và `<`.**

   ```bash
   curl -v https://example.com/ -o /dev/null 2>&1 | grep -E '^\*|^>|^<' | head -n 25 | tee -a evidence/command-output.txt
   ```

   Cần thấy `> GET / HTTP/2` (hoặc `HTTP/1.1`) và `< HTTP/2 200`. Lệnh cần `2>&1` vì `curl -v` ghi chẩn đoán ra stderr, không phải stdout.

5. **`ss -ltnp` thấy Python ở port 9000.** Mở terminal thứ hai chạy `python3 -m http.server 9000 --bind 127.0.0.1` trong `source/site`. Ở terminal thứ nhất:

   ```bash
   ss -ltnp | grep ':9000' | tee -a evidence/command-output.txt
   ```

   Dòng đúng có `127.0.0.1:9000` và `users:(("python3",pid=...,fd=3))`. Cột process chỉ hiện nếu bạn dùng `-p` và process thuộc user của bạn.

6. **`Address already in use` và cách tìm PID.** Chạy server thứ hai cùng port gây `OSError: [Errno 98] Address already in use`. Sau đó `ss -ltnp 'sport = :9000'` cho PID. Quy trình đúng: tìm PID, xem nó là gì (`ps -p PID -o pid,ppid,etime,cmd`), rồi mới dừng bằng `kill PID` hoặc `Ctrl+C` ở terminal đang chạy nó.

7. **Bảng bốn tầng trong `report.md`.** Mẫu điền:

   | Tầng | Lệnh | Kết quả | Kết luận |
   | --- | --- | --- | --- |
   | IP | `ip -br addr` | `eth0 UP 172.24.100.5/20` | Có IP private, gateway `172.24.96.1` |
   | DNS | `nslookup github.com` | `Server` trùng `nameserver`, ra địa chỉ IP | DNS hoạt động |
   | TCP/port | `ss -ltnp` | `127.0.0.1:9000` do `python3` giữ | Port đang được lắng nghe |
   | HTTP | `curl -v` | `HTTP/2 200` | Ứng dụng trả lời đúng |

   Chú ý: kết luận phải viết từ kết quả thật của bạn, không điền theo mẫu này.

#### Lời giải L2

**Thử thách A – Đường đi của request.** Đoạn văn cần đủ năm bước, mỗi bước kèm lệnh làm chứng. Một cách viết gọn:

1. Trình duyệt tra cache và `/etc/hosts`, rồi hỏi DNS resolver. Chứng minh: `nslookup example.com` và dòng `* Host example.com:443 was resolved.` của curl.
2. Mở kết nối TCP tới port 443 bằng bắt tay ba bước. Chứng minh: dòng `* Connected to example.com`.
3. TLS handshake, thống nhất khóa và kiểm tra chứng chỉ. Chứng minh: dòng `* SSL connection using TLSv1.3`.
4. Gửi `GET /` và nhận status. Chứng minh: `> GET / HTTP/2` và `< HTTP/2 200`.
5. Trình duyệt hiển thị body. Chứng minh: bỏ `-o /dev/null` để thấy HTML.

Tiêu chí "ít nhất ba lệnh làm chứng" thường đạt bằng `curl -v`, `nslookup` và `curl -w` hiển thị `time_namelookup`, `time_connect`.

**Thử thách B – Chứng minh ping không đủ.** Lời giải trong đề đã đủ. Điểm cần kiểm tra là học viên có kết luận đúng: `ping 127.0.0.1` thành công, `curl` tới 9001 bị `Connection refused`, nghĩa là máy sống nhưng không ai lắng nghe port 9001. Cách tiếp cận khác: dùng `ss -ltn` rồi so sánh với `curl` ở nhiều port.

Bộ lệnh tham khảo (server Python bind `127.0.0.1:9000` đang chạy ở terminal khác):

```bash
ping -c 2 127.0.0.1
ss -ltn | grep -E ':9000|:9001'
curl -sS -o /dev/null -w "9000 status=%{http_code}
" http://127.0.0.1:9000/
curl -sS http://127.0.0.1:9001/
```

Ping thành công, `ss` chỉ có 9000, curl 9000 ra 200, curl 9001 ra `Connection refused`. Kết luận: máy sống không có nghĩa service sống; phải kiểm tra đúng port bằng `ss` và `curl`.

**Thử thách C – `curl --resolve`.** Lệnh `curl -v --resolve demo.club.test:9000:127.0.0.1 http://demo.club.test:9000/` tạo một ánh xạ tên sang IP chỉ tồn tại trong lần chạy đó, nên không cần sửa `/etc/hosts`. Output có `> Host: demo.club.test:9000`. Lệnh đầy đủ (server `python3 -m http.server 9000 --bind 127.0.0.1` phải đang chạy ở terminal khác):

```bash
curl -v --resolve demo.club.test:9000:127.0.0.1 http://demo.club.test:9000/ -o /dev/null 2>&1 | grep -E 'Host|HTTP/'
```

Header `Host` quan trọng vì một reverse proxy (Nginx, Ingress) dùng nó để chọn service phía sau khi nhiều tên miền dùng chung một IP và một port.

**Thử thách D – Cổng của starter-project.** Kiểm tra theo đề: `/health` chỉ có trực tiếp ở cổng 3000. Cấu hình Nginx trong `starter-project/frontend/nginx.conf` chỉ chuyển tiếp đường dẫn `/api/` sang `http://backend:3000`; mọi đường dẫn khác rơi vào `location /` và trả `index.html`, nên `http://localhost:8080/health` trả trang frontend. Frontend gọi được `/api/members` mà không cần IP backend vì tên `backend` được DNS nội bộ của Docker network phân giải. Nhớ chạy `docker compose down` và không commit `.env`.

Lệnh kiểm tra tham khảo sau `cp .env.example .env`, đặt `DB_PASSWORD` giả như `change-me-local` và `docker compose up -d --build`:

```bash
ss -ltn | grep -E ':8080|:3000'
curl -s http://localhost:8080/health ; echo
curl -s http://localhost:3000/health ; echo
curl -s http://localhost:8080/api/members
```

Tên mạng Docker của starter-project là `club-network`; phần này học kỹ ở Buổi 11.

#### Lời giải phần Phá lỗi ("Port đã được sử dụng")

Cây điều tra:

1. Lệnh thứ hai thoát ngay với `Errno 98`. Đây là lỗi bind, không phải lỗi mạng bên ngoài.
2. `ss -ltn 'sport = :9000'` có dòng `LISTEN`: port đã bị chiếm.
3. `ss -ltnp 'sport = :9000'` cho `users:(("python3",pid=...))`.
4. `ps -p PID -o pid,ppid,etime,cmd` cho biết đó là server cũ do chính bạn quên tắt (thời gian chạy `etime` dài, cùng terminal cũ) hay service khác.
5. Quyết định: `kill PID` (không dùng `kill -9` ngay) hoặc đổi sang port khác, rồi chạy lại và xác nhận bằng `ss`.

Nguyên nhân gốc: mỗi cặp địa chỉ và port chỉ có một socket lắng nghe. Process cũ chưa thoát hoặc hai service cấu hình cùng port. Cách sửa dứt điểm là đặt port qua biến môi trường như `WEB_PORT`, tắt service cũ trước khi chạy lại, và giữ một bảng port của dự án. Trường hợp đặc biệt: trên Windows với Docker Desktop, port có thể do chương trình phía Windows giữ mà `ss` trong WSL không thấy.

#### Những hiểu lầm hay gặp

- Coi `Connection timed out` và `Connection refused` là một: refused là máy đích trả RST vì không ai lắng nghe, timed out là không có phản hồi (firewall hoặc không có đường).
- Tin rằng ping thành công nghĩa là service sống, hoặc ping thất bại nghĩa là mất mạng. ICMP có thể bị chặn mà web vẫn vào được.
- Nhầm `0.0.0.0` là một địa chỉ để kết nối. Đó là địa chỉ để bind, nghĩa là mọi giao diện.
- `localhost` có thể phân giải thành `::1` (IPv6) trước `127.0.0.1`. Server bind riêng `127.0.0.1` sẽ từ chối kết nối tới `::1`. Khi script chẩn đoán của bạn dùng IP lấy từ `getent hosts localhost`, hãy lấy địa chỉ IPv4 (xem `getent ahostsv4` ở phần bài tập).
- Dùng `sudo kill -9` ngay khi gặp port bận mà chưa biết process là gì.
- Quên `tee -a` mà dùng `tee`, ghi đè mất evidence cũ.

### Buổi 06 – Git và GitHub Workflow

#### Đáp án các nhiệm vụ L1

1. **Repo nhóm có `.gitignore` chứa `.env`, `.env` không lên GitHub.** Thứ tự đúng là tạo `.gitignore` trước khi `git add`:

   ```bash
   printf '.env\nnode_modules/\n*.log\n.DS_Store\n' > .gitignore
   git check-ignore -v .env
   git add .gitignore README.md docs/team.md
   git commit -m "Add project skeleton and gitignore"
   git push origin main
   ```

   `git check-ignore -v .env` in `.gitignore:1:.env	.env`. Bằng chứng trên GitHub: tab Code không có file `.env`. Bằng chứng ở local: `git ls-files` không liệt kê `.env`.

2. **Ít nhất 2 commit trên feature branch, thông điệp rõ.** Làm theo Phần 2: một commit tạo `docs/members/ten-ban.md`, một commit thêm dòng vai trò. Thông điệp dạng mệnh lệnh như `Add Ten Ban profile`, `Add role to Ten Ban profile`. Thông điệp kiểu `update` không đạt.

3. **Mở Pull Request đầy đủ.** Tiêu đề ngắn và mô tả có ba ý: đã thay đổi gì, vì sao, cách kiểm tra. Base là `main`, compare là branch của bạn.

4. **Review có comment trên dòng cụ thể và Approve.** Reviewer mở Files changed, bấm vào số dòng để comment, rồi Review changes, Approve. Tác giả không tự Approve được PR của mình.

5. **Merge, xóa branch, cập nhật `main` local.**

   ```bash
   git switch main
   git pull
   git branch -d feature/add-ten-ban
   ```

   Nếu dùng Squash merge, `git branch -d` báo branch chưa merge và cần `-D`; đó là hành vi bình thường chứ không phải lỗi.

6. **`git log --oneline --graph` có commit của cả nhóm.** Chạy `git log --oneline --graph --all -10`. Cần thấy các nhánh feature của từng người nhập vào `main` qua merge commit.

#### Lời giải L2

**Thử thách 1 – Conflict ở `docs/team.md`.** Hai người sửa cùng dòng `- Ten thanh vien 1` thành hai nội dung khác nhau trên hai branch. Người merge sau chạy `git fetch origin` và `git merge origin/main`, Git báo `CONFLICT (content): Merge conflict in docs/team.md`. Trong file, phần giữa `<<<<<<< HEAD` và `=======` là của branch mình, phần sau là của `main`. Kết quả hợp lý giữ cả hai nếu cả hai hợp lệ:

```text
- Ten thanh vien 1 (ban P)
- Ten thanh vien 1 (ban Q)
```

Sau đó kiểm tra không còn marker, rồi hoàn tất:

```bash
grep -rn '^<<<<<<<\|^=======\|^>>>>>>>' docs/ README.md || echo "Khong con conflict marker"
git add docs/team.md
git commit -m "Merge main into feature branch and resolve team.md conflict"
git push
```

Phần giải thích trong `report.md` cần nói được: Git báo conflict vì hai bên cùng sửa một vùng và Git không biết ý định của người; kết quả chọn là gì và vì sao không xóa phần của người kia.

**Thử thách 2 – Branch protection.** Cấu hình tối thiểu: Require a pull request before merging, Require approvals với 1 approval, và cấm bypass nếu có. Chứng minh bằng:

```bash
echo test >> README.md
git commit -am "Direct push test"
git push origin main
```

Lỗi chứa `GH006` và `protected branch hook declined`, hoặc với ruleset là `GH013` và `Repository rule violations`. Sau đó dọn bằng `git reset --hard origin/main` (chỉ trên local, vì đây là commit thử chưa ai dùng). Hạn chế đáng ghi: nếu bạn là chủ repo và không bật cấm bypass thì admin vẫn push được; repo private trên gói miễn phí có thể không hỗ trợ.

**Thử thách 3 – `.env` lỡ commit.**

```bash
git switch -c fix/stop-tracking-env
git add -f .env
git commit -m "Add dummy env by mistake"
git rm --cached .env
git commit -m "Stop tracking .env"
git ls-files | grep -c '^\.env$' || true
ls -a | grep '^\.env$'
```

`grep -c` in `0`, `ls` vẫn thấy file. Lệnh `git rm --cached` chỉ bỏ file khỏi theo dõi từ commit mới trở đi; commit cũ vẫn chứa nội dung, nên với secret thật phải đổi (rotate) secret ngay, xóa file không xóa được lịch sử đã push.

#### Lời giải phần Phá lỗi ("push bị từ chối, pull thì báo conflict")

Cây điều tra:

1. Đọc thông báo: `! [rejected] main -> main (fetch first)` và dòng hint `the remote contains work that you do not have locally`. Đây không phải lỗi quyền hay lỗi xác thực, mà là remote có commit mới hơn.
2. `git fetch origin` rồi `git log --oneline --graph --all` cho thấy hai nhánh lịch sử phân kỳ từ cùng một commit.
3. `git diff main origin/main` cho thấy chính xác chỗ khác nhau: cả hai cùng sửa dòng trong `docs/team.md`.
4. `git pull` (với `pull.rebase false` là fetch rồi merge) báo `CONFLICT (content)`; giải quyết như Phần 4, commit, rồi `git push` thường.

Nguyên nhân gốc: hai người cùng commit lên `main` mà không dùng branch và PR. Đã chạy thử đúng chuỗi này: push thứ hai bị `fetch first`, `git pull` báo conflict ở `docs/team.md`. Phòng tránh: không commit trực tiếp lên `main`, bật branch protection, `git pull` trước khi bắt đầu làm, commit và PR nhỏ. Tuyệt đối không dùng `git push --force` để vượt qua lỗi này vì nó ghi đè commit của người kia.

#### Những hiểu lầm hay gặp

- Nghĩ rằng thêm `.env` vào `.gitignore` là đủ sau khi đã commit. Cần `git rm --cached`, và nếu đã push secret thật thì phải đổi secret.
- Xóa hết phần của người kia khi resolve conflict. Người merge sau xử lý, nhưng phải đọc và hỏi tác giả.
- Quên xóa marker `<<<<<<<`, `=======`, `>>>>>>>` rồi commit. Luôn chạy `grep` trước khi `git add`.
- Gộp mọi việc vào một branch và một commit lớn, khiến review không thực chất.
- Nhầm `git revert` với `git reset --hard`. `revert` tạo commit mới đảo ngược, an toàn cho nhánh đã push; `reset --hard` kèm `--force` làm mất lịch sử của người khác.
- Quên `git pull` ở `main` sau khi merge trên web, rồi tạo branch mới từ `main` cũ và gặp conflict không đáng có.
- Dùng `git add .` khi `.gitignore` chưa đầy đủ.

### Bài tập tuần

Đề: [Bài tập tuần 3](../../assignments/weekly/week-03.md). Dưới đây là gợi ý lời giải và đáp án câu hỏi kiểm tra.

#### Nhiệm vụ 1 – Bản đồ mạng

Gợi ý các lệnh và cách ghi evidence, mỗi khối có dòng `$ lệnh` đứng trước:

```bash
cd ~/devops-labs/lab-05
echo '$ ip -br addr' >> evidence/command-output.txt
ip -br addr | tee -a evidence/command-output.txt
echo '$ ip route' >> evidence/command-output.txt
ip route | tee -a evidence/command-output.txt
echo '$ ping -c 4 127.0.0.1' >> evidence/command-output.txt
ping -c 4 127.0.0.1 | tee -a evidence/command-output.txt
echo '$ ping -c 4 1.1.1.1' >> evidence/command-output.txt
ping -c 4 1.1.1.1 | tee -a evidence/command-output.txt
echo '$ nslookup github.com' >> evidence/command-output.txt
nslookup github.com | tee -a evidence/command-output.txt
echo '$ cat /etc/resolv.conf' >> evidence/command-output.txt
cat /etc/resolv.conf | tee -a evidence/command-output.txt
echo '$ getent hosts github.com' >> evidence/command-output.txt
getent hosts github.com | tee -a evidence/command-output.txt
```

Ý cần có trong `report.md`: IP, prefix và gateway lấy từ hai lệnh nào; `Server` của `nslookup` trùng `nameserver` trong `resolv.conf`; `getent hosts` đi qua cơ chế phân giải của hệ điều hành (hosts file rồi DNS) còn `nslookup` chỉ hỏi DNS; ping IP không cần DNS.

#### Nhiệm vụ 2 – Chẩn đoán theo tầng và `diagnose.sh`

Trình tự: tạo `source/site/index.html` có họ tên, chạy server bind `127.0.0.1`, ghi `ss -ltnp` và `curl`, đổi sang `0.0.0.0` rồi ghi lại `ss` (cột Local Address đổi từ `127.0.0.1:9000` thành `0.0.0.0:9000`), gây `Address already in use`, tìm PID, rồi ghi ba lỗi curl:

```bash
{ curl -sS http://127.0.0.1:9001/ ; curl -sS --max-time 3 http://192.0.2.1/ ; curl -sS http://khong-ton-tai.invalid/ ; } 2>&1 | tee -a evidence/command-output.txt
```

Ba mã cần thấy: `curl: (7)`, `curl: (28)` (hoặc lỗi tương đương như `Network is unreachable`, phải ghi chú) và `curl: (6)`.

Một lời giải cho `source/diagnose.sh` (đã chạy thử đủ ba kịch bản, cho ba kết luận khác nhau):

```bash
#!/usr/bin/env bash
# Dùng: bash diagnose.sh HOST PORT
set -u

if [ "$#" -ne 2 ]; then
  echo "Cách dùng: bash $0 HOST PORT" >&2
  echo "Ví dụ:     bash $0 127.0.0.1 9000" >&2
  exit 2
fi

HOST="$1"
PORT="$2"

echo "== Tầng DNS: phân giải '$HOST' =="
IP="$(getent ahostsv4 "$HOST" | awk '{print $1; exit}')"
if [ -z "$IP" ]; then
  echo "KẾT LUẬN: lỗi ở tầng DNS. Không phân giải được tên '$HOST'."
  echo "Kiểm tra tiếp: nslookup $HOST ; cat /etc/resolv.conf ; cat /etc/hosts"
  exit 1
fi
echo "OK: $HOST -> $IP"

echo "== Tầng TCP: kết nối $IP:$PORT (tối đa 3 giây) =="
timeout 3 bash -c 'exec 3<>"/dev/tcp/$0/$1"' "$IP" "$PORT" 2>/dev/null
rc=$?
if [ "$rc" -eq 124 ] || [ "$rc" -eq 143 ]; then
  echo "KẾT LUẬN: lỗi ở tầng TCP, kết nối bị timeout (không có phản hồi)."
  echo "Kiểm tra tiếp: firewall, ip route, địa chỉ IP có đúng không"
  exit 1
elif [ "$rc" -ne 0 ]; then
  echo "KẾT LUẬN: lỗi ở tầng TCP, kết nối bị từ chối (connection refused)."
  echo "Kiểm tra tiếp: ss -ltnp 'sport = :$PORT' trên máy đích, service đã chạy chưa, đúng port chưa"
  exit 1
fi
echo "OK: cổng $PORT đang mở"

echo "== Tầng HTTP: GET http://$HOST:$PORT/ =="
code="$(curl -s -o /dev/null --max-time 5 -w '%{http_code}' "http://$HOST:$PORT/")"
case "$code" in
  2??|3??)
    echo "KẾT LUẬN: các tầng đều ổn, HTTP trả về $code."
    ;;
  4??|5??)
    echo "KẾT LUẬN: lỗi ở tầng ứng dụng, HTTP trả về $code. Đọc log của service."
    exit 1
    ;;
  *)
    echo "KẾT LUẬN: cổng mở nhưng không phải HTTP hợp lệ (mã $code)."
    exit 1
    ;;
esac
```

Vì sao thiết kế như vậy: kiểm tra từ dưới lên (DNS, TCP, HTTP) và dừng ở tầng đầu tiên lỗi; mã thoát của `timeout` là 124 với GNU coreutils (Ubuntu) và 143 với BusyBox nên script chấp nhận cả hai; `getent ahostsv4` trả IPv4 nên `localhost` không bị đổi thành `::1`. Mọi biến đều được đặt trong dấu nháy kép.

Ba lần chạy để ghi vào `evidence/diagnose-output.txt`:

```bash
{ echo '$ bash source/diagnose.sh khong-ton-tai.invalid 80'; bash source/diagnose.sh khong-ton-tai.invalid 80;
  echo '$ bash source/diagnose.sh 127.0.0.1 9001'; bash source/diagnose.sh 127.0.0.1 9001;
  echo '$ bash source/diagnose.sh 127.0.0.1 9000'; bash source/diagnose.sh 127.0.0.1 9000; } 2>&1 | tee evidence/diagnose-output.txt
```

Kết luận mong đợi lần lượt: lỗi tầng DNS; lỗi tầng TCP connection refused; các tầng đều ổn với HTTP 200 (khi server đang chạy). Gợi ý thêm cho bạn muốn tách rõ timeout: thử `bash source/diagnose.sh 192.0.2.1 80`.

Lưu ý khi dọn: dừng mọi server Python và kiểm tra `ss -ltnp` không còn port 9000.

#### Nhiệm vụ 3 – Repo sạch, branch, Pull Request

Gợi ý cấu trúc: `main` chỉ có commit khởi tạo (README và `.gitignore`). Mỗi nhiệm vụ một branch, ví dụ `docs/lab-05-network-report` và `feature/lab-06-git-flow`, mỗi branch có ít nhất hai commit nhỏ, thông điệp bắt đầu bằng động từ. Chứng minh `.env` bị bỏ qua:

```bash
printf 'DB_PASSWORD=dummy-value\n' > .env
git check-ignore -v .env
git status --short
git ls-files | grep -c '^\.env$' || true
git log --oneline --graph --all | tee -a lab-06/evidence/command-output.txt
```

PR cần có mô tả ba ý và một review thật của bạn khác, có comment trên dòng cụ thể. Ghi đường dẫn các PR vào `lab-06/README.md`.

#### Nhiệm vụ 4 – Conflict một mình và revert

```bash
git switch main && git pull
git switch -c feature/conflict-a
printf 'Ten thanh vien: An\n' > lab-06/source/team.md   # sửa dòng gốc thành giá trị A
git commit -am "Set member name to An"
git push -u origin feature/conflict-a
git switch main
git switch -c feature/conflict-b
printf 'Ten thanh vien: Binh\n' > lab-06/source/team.md
git commit -am "Set member name to Binh"
git push -u origin feature/conflict-b
```

Lưu ý cần tạo `team.md` có dòng `Ten thanh vien: (chua dien)` và commit lên `main` (qua PR) trước khi tách hai branch, nếu không hai branch sẽ cùng tạo file mới và conflict thuộc loại khác (add/add). Sau khi PR của A merge, ở branch B:

```bash
git fetch origin
git merge origin/main 2>&1 | tee lab-06/evidence/conflict-output.txt
```

Output phải có `CONFLICT (content): Merge conflict in lab-06/source/team.md`. Kết quả hợp lý giữ cả hai ý, ví dụ:

```text
Ten thanh vien: An
Ten thanh vien: Binh
```

Sau đó kiểm tra `grep -c '^<<<<<<<\|^=======\|^>>>>>>>' lab-06/source/team.md` in `0`, rồi `git add`, `git commit`, `git push` và merge PR. Phần hoàn tác:

```bash
git switch -c practice/revert-demo
echo "dong sai" >> lab-06/source/team.md
git commit -am "Add wrong line"
git revert --no-edit HEAD
git log --oneline -3
cat lab-06/source/team.md
```

`git log` có commit `Revert "Add wrong line"` và file trở lại trạng thái trước commit sai. Giải thích trong `report.md`: nhánh đã push là nhánh chung, `reset --hard` rồi `push --force` sẽ ghi đè lịch sử người khác đã lấy về; `revert` thêm một commit đảo ngược nên lịch sử vẫn nguyên và người khác chỉ cần `git pull`.

#### Nhiệm vụ L2

- **Thử thách A.** Xem lời giải Thử thách 2 của Buổi 06. Hạn chế cần ghi: quyền bypass của admin, hoặc rule không áp dụng khi repo private trên gói miễn phí.
- **Thử thách B.** Xem lời giải Thử thách A và C của Buổi 05. Sơ đồ `sequenceDiagram` phải có các participant Browser, DNS, Server và các mũi tên DNS, SYN, SYN-ACK, ACK, TLS, HTTP GET, 200.
- **Thử thách C – hook `pre-commit`.** Một cách tiếp cận (chỉ dùng giá trị giả):

  ```bash
  #!/usr/bin/env bash
  set -u
  status=0
  for f in $(git diff --cached --name-only); do
    case "$(basename "$f")" in
      .env) echo "Chặn: không được commit file .env ($f)" >&2; status=1 ;;
    esac
    if git show ":$f" 2>/dev/null | grep -E 'PASSWORD=.+' | grep -vq 'PASSWORD=change-me'; then
      echo "Chặn: $f chứa PASSWORD= có giá trị" >&2
      status=1
    fi
  done
  exit "$status"
  ```

  Cài vào `.git/hooks/pre-commit` và `chmod +x`. Hook bị qua mặt bằng `git commit --no-verify`, hoặc khi người khác chưa cài hook (hook không nằm trong repo được clone), vì vậy cần thêm kiểm tra phía server như CI quét secret và branch protection. Cách làm trên chỉ là một gợi ý, không phải đáp án duy nhất; chưa kiểm chứng với tên file có dấu cách.

#### Đáp án 5 câu hỏi kiểm tra

1. `127.0.0.1` chỉ nhận kết nối từ chính máy (hoặc network namespace); `0.0.0.0` nhận trên mọi giao diện. Dùng `127.0.0.1` cho công cụ phát triển chỉ mình bạn dùng; dùng `0.0.0.0` khi service phải được máy khác hoặc container khác gọi tới, như API trong container. Ví dụ từ `ss`: cột Local Address đổi từ `127.0.0.1:9000` sang `0.0.0.0:9000`.
2. `Could not resolve host`: lỗi DNS, kiểm tra `nslookup` và `resolv.conf`. `Connection refused`: máy đích sống nhưng không ai lắng nghe, kiểm tra `ss -ltnp` ở đích và đúng port chưa. `Connection timed out`: gói tin bị chặn hoặc không có đường, kiểm tra IP, `ip route`, firewall.
3. Mỗi container có network namespace riêng nên `localhost` trong container là chính container đó. Gọi backend từ container khác phải dùng tên service (ví dụ `backend`) để DNS của Docker network phân giải; gọi `localhost:3000` từ container khác sẽ bị refused vì không ai lắng nghe ở đó.
4. `git fetch` chỉ tải commit mới về, không đổi working directory. `git merge origin/main` gộp nhánh `origin/main` vào nhánh hiện tại nên đổi working directory. `git pull` là `fetch` cộng `merge`, nên cũng đổi working directory.
5. Không đủ. `.gitignore` không ảnh hưởng file đã commit và lịch sử cũ vẫn chứa mật khẩu. Cần đổi (rotate) mật khẩu ngay, `git rm --cached` để ngừng theo dõi, và nếu cần mới xử lý lịch sử; đổi secret là bắt buộc.

### Hướng dẫn chấm cho mentor

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
