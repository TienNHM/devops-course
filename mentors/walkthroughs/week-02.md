# Walkthrough tuần 2 – Linux Essentials

::: warning Dành cho mentor và học viên đã nộp bài
Trang này là đáp án đối chiếu: mentor dùng để chấm, học viên chỉ mở sau khi đã nộp bài của mình.
:::

> **Tóm tắt:** Hướng dẫn giải Buổi 03 (Linux CLI, phân tích access log) và Buổi 04 (user, group, setgid, process, biến môi trường, systemd), kèm đáp án bài tập tuần 2 và hướng dẫn chấm cho mentor.

## Cách dùng tài liệu này

Tài liệu được công bố sau khi tuần 2 kết thúc. Hãy tự làm bài lab và bài tập trước, rồi mới đối chiếu. Mục đích là so sánh cách nghĩ của bạn với cách nghĩ trong lời giải, không phải để chép.

- Phần "Đáp án L1" cho kết quả cần đạt và lệnh quan trọng. Thời gian, PID, UID, GID trong output của bạn sẽ khác.
- Phần "Lời giải L2" giải thích vì sao chọn cách đó; có thể có cách khác cũng đúng.
- Các lệnh trong tài liệu đã được chạy thử trong một container Debian (có `runuser` thay cho `sudo -u`). Riêng systemd, WSL và `sudo` thật chưa được chạy lại ở đó, xem ghi chú ở từng chỗ.
- Bài tập tuần dùng tên user, group, thư mục khác với bài lab. Khi tự làm, hãy dùng đúng tên của bài tập, không chép tên trong ví dụ lab.

Bài lab liên quan: [Buổi 03](../../labs/week-02/session-03.md), [Buổi 04](../../labs/week-02/session-04.md). Bài tập tuần: [Bài tập tuần 2](../../assignments/weekly/week-02.md).

### Buổi 03 – Linux CLI

#### Đáp án L1

Làm trong `~/devops-labs/lab-03`. Trước hết `pwd` phải in `/home/TEN_BAN/devops-labs/lab-03`, không phải `/mnt/c/...`.

**Phần 1 – cây `club-site`.** Hai lệnh tạo cây:

```bash
cd ~/devops-labs/lab-03/source
mkdir -p club-site/{src,docs,logs,config}
mkdir -p "club-site/docs/meeting notes"
touch club-site/src/app.js club-site/src/index.html
touch club-site/config/app.conf club-site/config/db.conf
touch "club-site/docs/meeting notes/week 1.txt"
find club-site | sort
```

`find club-site | sort` phải in đúng 11 dòng như Bước 1.2 của bài lab. Điểm cần hiểu: `{a,b}` do bash mở rộng thành nhiều đối số trước khi `mkdir` chạy; đường dẫn có khoảng trắng bắt buộc đặt trong nháy kép. Với đường dẫn tương đối và `cd -`: `cd club-site/src` rồi `cd ../config`, rồi nhảy tuyệt đối về `club-site`, `cd -` quay về thư mục đứng trước đó (`config`).

**Phần 2 – find và grep.**

```bash
find club-site -name "*.conf"
find club-site -type d
find club-site -type f -name "*.txt"
echo "host=localhost" > club-site/config/db.conf
echo "port=5432" >> club-site/config/db.conf
grep -rn "port" club-site/config
```

`-type d` in 6 thư mục (kể cả `club-site`). Dòng `club-site/docs/meeting notes/week 1.txt` vẫn in nguyên vẹn vì `find` tự nhận tên file, không đi qua việc tách từ của shell. `grep -rn` in `club-site/config/db.conf:2:port=5432`. Nếu dùng nhầm `>` ở dòng thứ hai, dòng `host` mất, đó là lỗi hay gặp nhất của phần này.

**Phần 3 – access log nhỏ.** Sau khi tạo `mini-access.log` (10 dòng), các kết quả cần khớp đếm tay:

```bash
wc -l mini-access.log
awk '{print $1}' mini-access.log | sort | uniq -c | sort -nr
awk '{print $9}' mini-access.log | sort | uniq -c | sort -nr
awk '$9 ~ /^5/ {print $1, $7, $9}' mini-access.log
```

```text
10 mini-access.log
      4 10.0.0.5
      3 10.0.0.9
      3 10.0.0.7
      6 200
      2 404
      1 500
      1 405
10.0.0.9 /api/members 500
```

(Hai IP cùng 3 request nên thứ tự của chúng có thể đảo.) Kiểm tra bằng tay: 4 + 3 + 3 = 10 và 6 + 2 + 1 + 1 = 10, cả hai bằng `wc -l`. `grep -c " 404 "` in `2`.

**Bước 3.6 – file thật.** `examples/linux/access.log` có 260 dòng; các cột 1, 7, 9 vẫn là IP, đường dẫn, mã HTTP dù file có thêm referer và user-agent. `less access.log`, gõ `/404` để tìm, `n` để sang kết quả kế tiếp, `q` để thoát.

#### Lời giải L2

Nguyên tắc chung: dựng pipeline từng đoạn, nhìn output rồi mới thêm lệnh tiếp theo. Mỗi lệnh làm một việc: `awk` chọn cột, `sort` đưa giá trị giống nhau nằm cạnh nhau, `uniq -c` gộp và đếm, `sort -nr` xếp giảm dần, `head` cắt top N.

```bash
# 1. Top 5 IP
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -n 5

# 2. Phân bố mã HTTP
awk '{print $9}' access.log | sort | uniq -c | sort -nr

# 3. Top 3 endpoint lỗi (4xx hoặc 5xx)
awk '$9 >= 400 {print $7}' access.log | sort | uniq -c | sort -nr | head -n 3
```

Kết quả trên file thật (260 dòng), để mentor đối chiếu:

```text
     43 192.168.1.10
     42 172.16.4.2
     41 203.0.113.25
     38 10.0.0.8
     33 192.168.1.11
```

Top 5 IP có thể có hai IP cùng 33 request ở hạng 5 và 6 (`192.168.1.11` và `10.0.0.5`); khi đó chỉ một trong hai hiện ra, thứ tự do `sort` quyết định. Phân bố mã: 188 mã 200, 40 mã 404, 15 mã 304, 6 mã 500, 5 mã 403, 4 mã 400, 2 mã 201. Top 3 endpoint lỗi: `/api/members` (10), `/favicon.ico` (8), `/old-page.html` (5).

Vì sao `$9 >= 400` đúng: awk so sánh theo số khi trường trông giống số, nên `404` và `500` thỏa còn `200` và `304` thì không. Kiểm chứng bằng `mini-access.log`: `/api/members` xuất hiện 2 lần (một POST trả 405, một GET trả 500), `/api/members/99` và `/favicon.ico` mỗi cái 1 lần.

Script `log-report.sh` (có kiểm tra tham số), lời giải tham khảo cho thử thách 4 của L2:

```bash
#!/usr/bin/env bash
# log-report.sh - thống kê access log
set -u

if [ -z "${1:-}" ]; then
  echo "Cách dùng: $0 duong-dan-access.log" >&2
  exit 1
fi
if [ ! -f "$1" ]; then
  echo "Không tìm thấy file: $1" >&2
  exit 1
fi

echo "== Top 5 IP =="
awk '{print $1}' "$1" | sort | uniq -c | sort -nr | head -n 5
echo "== Mã HTTP =="
awk '{print $9}' "$1" | sort | uniq -c | sort -nr
echo "== Top 3 endpoint lỗi =="
awk '$9 >= 400 {print $7}' "$1" | sort | uniq -c | sort -nr | head -n 3
```

Chạy thử: `bash log-report.sh mini-access.log`. Với `mini-access.log`, `/api/members` xuất hiện 2 lần (một POST trả 405, một GET trả 500), còn `/api/members/99` và `/favicon.ico` mỗi cái 1 lần. Điểm mấu chốt: `[ -z "${1:-}" ]` để `set -u` không báo lỗi khi thiếu tham số, `[ ! -f "$1" ]` để bắt file không tồn tại, thoát mã 1 và ghi thông báo vào stderr bằng `>&2`, mọi biến trong nháy kép. Chạy thử với cả `mini-access.log` và `access.log`, không hard-code đường dẫn.

#### Lời giải phần Phá lỗi và debug

**Tình huống 1 – thư mục có khoảng trắng.** Lệnh `rm -r club-site/docs/meeting notes` báo hai lỗi `No such file or directory` cho `club-site/docs/meeting` và `notes`.

Cây điều tra:

1. Đọc thông báo: hai tên riêng biệt, không phải tên thư mục thật.
2. Xem bash chia thành mấy đối số: `printf '[%s]\n' club-site/docs/meeting notes` in hai dòng.
3. Nguyên nhân gốc: shell tách dòng lệnh theo khoảng trắng trước khi gọi chương trình, nên `rm` nhận hai đối số. Thư mục thật vẫn còn nguyên (đây là phần may mắn).

Sửa: `rm -r "club-site/docs/meeting notes"`. Phòng tránh: luôn quote đường dẫn và biến; trước lệnh xóa, chạy `ls` hoặc `echo` với cùng đối số; kiểm tra `pwd`; không dùng `rm -rf` khi chưa xem bash sẽ truyền gì.

**Tình huống 2 – quên `sort` trước `uniq -c`.** `awk '{print $9}' mini-access.log | uniq -c` cho nhiều dòng mã 200 với số đếm nhỏ. Điều tra: chạy `awk '{print $9}' mini-access.log` xem dữ liệu thô, thấy các mã giống nhau không nằm liền kề. Nguyên nhân gốc: `uniq` chỉ gộp dòng liền nhau. Cách kiểm tra phòng tránh: cộng các số đếm và so với `wc -l`; với bản thiếu `sort`, tổng vẫn đúng nhưng số dòng kết quả nhiều hơn số mã khác nhau, đó là dấu hiệu.

#### Những hiểu lầm hay gặp

- Nghĩ `uniq` đếm mọi dòng trùng trong file. Nó chỉ gộp các dòng liền kề, nên luôn cần `sort` trước.
- Dùng `grep " 5"` để đếm lỗi 5xx. Chuỗi này khớp cả số byte hoặc ngày giờ; `awk '$9 ~ /^5/'` kiểm tra đúng cột mã.
- Nhầm `>` (ghi đè) với `>>` (ghi nối).
- Tưởng `find` tìm nội dung và `grep` tìm tên file. `find` tìm file theo thuộc tính, `grep` tìm dòng theo nội dung.
- Quên quote đường dẫn có khoảng trắng; hoặc nghĩ `find` cũng cần quote để in tên file có khoảng trắng (nó không cần, nhưng lệnh dùng kết quả đó sau này thì cần).
- Làm việc trong `/mnt/c`: chậm và lỗi quyền file. Luôn kiểm tra bằng `pwd`.

### Buổi 04 – Linux Administration

#### Đáp án L1

Tên dùng trong lab: user `clb-dev1`, `clb-dev2`, `clb-guest`, group `clbdev`, thư mục `/srv/club-shared`.

**Phần 1 – group và user.**

```bash
sudo groupadd clbdev
sudo useradd -m -s /bin/bash clb-dev1
sudo useradd -m -s /bin/bash clb-dev2
sudo useradd -m -s /bin/bash clb-guest
sudo usermod -aG clbdev clb-dev1
sudo usermod -aG clbdev clb-dev2
id clb-dev1
id clb-guest
```

`id clb-dev1` phải có `clbdev` trong danh sách group, `id clb-guest` thì không. Cờ `-m` tạo thư mục home. Cờ `-a` của `usermod -aG` là bắt buộc: thiếu nó, `-G` thay toàn bộ group phụ hiện có (người dùng thật sẽ mất group `sudo`).

**Phần 2 – thư mục chung với setgid.**

```bash
sudo mkdir -p /srv/club-shared
sudo chown root:clbdev /srv/club-shared
sudo chmod 2770 /srv/club-shared
ls -ld /srv/club-shared
```

Kết quả cần thấy: `drwxrws--- 2 root clbdev ... /srv/club-shared`. Chữ `s` trong nhóm group là setgid; nhóm other là `---`. Ba lần kiểm tra:

```bash
cd /tmp
sudo -u clb-dev1 bash -c 'umask 007; touch /srv/club-shared/config-dev1.env && echo "dev1 ghi OK"'
sudo -u clb-dev2 bash -c 'echo "dev2 doc:"; ls -l /srv/club-shared'
sudo -u clb-guest ls /srv/club-shared
```

dev1 ghi được, dev2 liệt kê được và thấy file có group `clbdev` (nhờ setgid) với quyền `-rw-rw----` (nhờ `umask 007`), guest bị `Permission denied`. Đứng ở `/tmp` vì `sudo -u` giữ nguyên thư mục hiện tại và home của bạn có quyền `750`.

Đối chứng không có setgid:

```bash
sudo mkdir /srv/club-nosgid
sudo chown root:clbdev /srv/club-nosgid
sudo chmod 770 /srv/club-nosgid
sudo -u clb-dev1 touch /srv/club-nosgid/a.txt
ls -l /srv/club-nosgid
```

File mới có group `clb-dev1` (group chính của người tạo) và quyền `-rw-r--r--`, nên dev2 không sửa được. Đó là lý do thư mục chia sẻ cần setgid. Cần cả hai thứ: setgid để group đúng, umask 002 hoặc 007 để group được ghi.

**Phần 3 – process.** Chạy `sleep 600 &` và `sleep 601 &`, `jobs` hiện hai job, `ps -o pid,ppid,user,stat,cmd -C sleep` cho thấy PPID là PID của shell (`echo $$`). `kill %1` gửi SIGTERM và job 1 hiện `Terminated`. Process cứng đầu:

```bash
bash -c 'trap "" TERM; sleep 700' &
sleep 1
kill $(pgrep -n -f "sleep 700")
pgrep -a -f "sleep 700"
```

`sleep 700` vẫn còn vì `trap "" TERM` đặt SIGTERM ở chế độ bỏ qua và chế độ này được giữ khi bash chuyển thẳng sang chạy `sleep`. Dọn dẹp: `pkill -9 -f "sleep 700"` (SIGKILL không thể bỏ qua), `kill %2` cho `sleep 601`, rồi `pgrep -af "sleep 60[01]|sleep 700" || echo "sach"`.

Lưu ý: bản gốc của bài lab dùng `pkill sleep`, lệnh này dừng mọi process tên `sleep` của bạn. Bản hiện tại đã đổi thành `kill %2`, khớp với bài tập tuần (bài tập cấm `pkill sleep`).

**Phần 4 – biến môi trường.**

```bash
DB_PASSWORD=doi-mat-khau-that
bash -c 'echo "khong export: [${DB_PASSWORD:-trong}]"'
export DB_PASSWORD
bash -c 'echo "da export: [${DB_PASSWORD:-trong}]"'
env | grep -c '^DB_PASSWORD='
unset DB_PASSWORD
WEB_PORT=8081 bash -c 'echo "WEB_PORT=$WEB_PORT"'
echo "sau lenh: [${WEB_PORT:-chua dat}]"
```

Kết quả: `khong export: [trong]`, `da export: [doi-mat-khau-that]`, `1`, `WEB_PORT=8081`, `sau lenh: [chua dat]`. Biến shell không sang process con; `export` sao chép nó sang mọi process con; `BIEN=giatri lenh` chỉ áp dụng cho lệnh đó.

**Dọn dẹp.** Sau khi chụp bằng chứng:

```bash
sudo rm -rf /srv/club-shared /srv/club-nosgid
sudo userdel -r clb-dev1; sudo userdel -r clb-dev2; sudo userdel -r clb-guest
sudo groupdel clbdev
```

Đọc kỹ đường dẫn trước khi nhấn Enter khi dùng `rm -rf` với `sudo`.

#### Lời giải L2

**Bài 1 – `resource-check.sh`.** Cách tiếp cận: mỗi số liệu một lệnh, ngưỡng đọc từ biến môi trường với giá trị mặc định `${MEM_LIMIT:-85}`.

- `free | awk '/Mem:/ {printf "%d", $3/$2*100}'`: chọn dòng `Mem:`, lấy cột used chia cột total nhân 100, in số nguyên.
- `df / | awk 'NR==2 {gsub("%","",$5); print $5}'`: dòng thứ hai là dữ liệu, cột 5 là `Use%`, `gsub` bỏ dấu `%` để so sánh được bằng số.
- `cut -d' ' -f1-3 /proc/loadavg`: ba giá trị tải trung bình 1, 5, 15 phút.

Với `set -e`, câu `[ ... ] && echo ...` trả mã khác 0 khi điều kiện sai và làm script thoát sớm, nên dùng `if ... then ... fi`. Phiên bản đáp ứng cả Thử thách B của bài tập (thoát mã 2 khi vượt ngưỡng, mã 1 khi ngưỡng không phải số):

```bash
#!/usr/bin/env bash
set -euo pipefail
MEM_LIMIT=${MEM_LIMIT:-85}
DISK_LIMIT=${DISK_LIMIT:-85}
is_int() { case "$1" in ''|*[!0-9]*) return 1 ;; esac; }
for v in "$MEM_LIMIT" "$DISK_LIMIT"; do
  is_int "$v" || { echo "Nguong khong hop le: $v" >&2; exit 1; }
done
mem=$(free | awk '/Mem:/ {printf "%d", $3/$2*100}')
disk=$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')
echo "load: $(cut -d' ' -f1-3 /proc/loadavg)"
echo "mem:  ${mem}%"
echo "disk: ${disk}%"
warn=0
if [ "$mem" -ge "$MEM_LIMIT" ]; then echo "WARN: memory above ${MEM_LIMIT}%"; warn=1; fi
if [ "$disk" -ge "$DISK_LIMIT" ]; then echo "WARN: disk above ${DISK_LIMIT}%"; warn=1; fi
[ "$warn" -eq 0 ] || exit 2
```

Đã chạy thử: mặc định cho mã 0, `MEM_LIMIT=1` in `WARN: memory above 1%` và mã 2, `MEM_LIMIT=abc` in lỗi ra stderr và mã 1.

**Bài 2 – systemd (chưa chạy lại trong container vì không có systemd).** Cách tiếp cận: bật systemd cho WSL nếu cần (`[boot]` và `systemd=true` trong `/etc/wsl.conf`, rồi `wsl --shutdown` từ PowerShell), copy script vào `/opt/club/` với quyền 755 để user của service đọc và chạy được cả đường dẫn, bọc script trong vòng lặp vì `Type=simple` cần tiến trình chạy mãi, `User=clb-dev1` để không chạy bằng root, `Restart=on-failure`. Unit tham khảo:

```bash
sudo mkdir -p /opt/club
sudo cp source/resource-check.sh /opt/club/resource-check.sh
sudo chmod 755 /opt/club/resource-check.sh
sudo tee /etc/systemd/system/club-resource-check.service > /dev/null <<'EOF'
[Unit]
Description=Club resource check loop

[Service]
User=clb-dev1
ExecStart=/bin/bash -c 'while true; do /opt/club/resource-check.sh; sleep 30; done'
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl start club-resource-check
systemctl status club-resource-check --no-pager
sudo journalctl -u club-resource-check -n 5 --no-pager
```

Dọn: `sudo systemctl stop club-resource-check`, xóa file unit rồi `daemon-reload`. Hướng chẩn đoán nếu lỗi: `systemctl status` rồi `journalctl -u club-resource-check -n 20 --no-pager`; `status=203/EXEC` nghĩa là đường dẫn trong `ExecStart` sai hoặc thiếu quyền thực thi; nhớ `daemon-reload` sau mỗi lần sửa unit. Kiểm tra tự khởi động lại: `sudo kill -9` PID chính (lấy bằng `systemctl show -p MainPID --value club-resource-check`); SIGKILL được tính là thất bại nên `on-failure` khởi động lại sau `RestartSec`.

**Bài 3 – `permissions-notes.md`.** Ý chính của 5 dòng: `chmod 777` cho cả người ngoài nhóm đọc, ghi, xóa nên mất ranh giới; thay bằng group sở hữu `clbdev`, `chmod 2770` để người ngoài bị chặn, setgid để file mới luôn thuộc nhóm, umask 007 hoặc 002 để các thành viên sửa được file của nhau; mỗi người một user giúp biết ai đã làm gì.

#### Lời giải phần Phá lỗi và debug

**Tình huống – user mới thêm vào group vẫn `Permission denied`.**

Cây điều tra:

1. `id clb-dev3`: nếu không thấy `clbdev` thì user chưa được thêm vào group.
2. `ls -ld /srv/club-shared`: group phải là `clbdev` và nhóm group có `rwx`.
3. `namei -l /srv/club-shared`: mọi thư mục dọc đường phải có `x` cho user đó; một thư mục cha thiếu `x` cũng gây lỗi.
4. Sửa đúng gốc: `sudo usermod -aG clbdev clb-dev3`.
5. Kiểm tra bằng phiên mới. Phiên đã đăng nhập sẵn vẫn mang danh sách group cũ; cần đăng xuất rồi đăng nhập lại, hoặc `newgrp clbdev`.

Nguyên nhân gốc: kernel dùng danh sách group nạp lúc phiên bắt đầu; sửa `/etc/group` không đổi các phiên đang chạy. Lưu ý khi tự kiểm chứng: `sudo -u clb-dev3 ls ...` luôn mở một tiến trình mới nên thấy group mới ngay lập tức. Điều này không chứng minh phiên đăng nhập thật của bạn ấy đã có group. Phải chạy `id` trong chính terminal của bạn ấy. Không bao giờ chữa cháy bằng `chmod 777`. Dọn: `sudo userdel -r clb-dev3`.

#### Những hiểu lầm hay gặp

- Nghĩ quyền "cộng dồn": thực tế kernel chọn đúng một nhóm (owner nếu UID khớp, nếu không thì group nếu GID khớp, nếu không thì other).
- Nghĩ xóa file cần quyền `w` trên file: cần `w` và `x` trên thư mục chứa nó.
- Nghĩ `usermod -G` thêm group: nó thay toàn bộ group phụ nếu thiếu `-a`.
- Bỏ qua umask: file `rw-r--r--` làm thành viên khác chỉ đọc được dù setgid đã đúng.
- Dùng `kill -9` ngay từ đầu: process không kịp đóng file, xóa file tạm. Luôn thử SIGTERM trước.
- Tưởng gán `A=1` rồi chạy chương trình là chương trình thấy `A`: phải `export`, hoặc đặt trước lệnh `A=1 lenh`.
- Quên `daemon-reload` sau khi sửa unit systemd, hoặc để script service ở thư mục home mà user service không đọc được.
- Nhớ: container thực chất là process Linux, nhiều lỗi quyền trong container (volume, UID/GID) là cùng một cơ chế này.

### Bài tập tuần

#### Gợi ý lời giải nhiệm vụ L1

**Nhiệm vụ 1 – workspace (lab-03).** Gom lệnh vào `source/commands-task1.sh` để dựng lại được trên thư mục trống. Đã chạy thử, chạy hai lần liên tiếp vẫn cho cùng kết quả:

```bash
mkdir -p club-workspace/{backend/{src,config},frontend/{public,config},database,logs}
mkdir -p "club-workspace/docs/meeting notes"
touch club-workspace/backend/src/server.js club-workspace/frontend/public/index.html club-workspace/database/init.sql
printf '%s\n' 'port=3000' 'db_host=postgres' > club-workspace/backend/config/backend.conf
echo 'upstream=backend:3000' > club-workspace/frontend/config/frontend.conf
echo 'Hop sprint 1: chot pham vi MVP' > "club-workspace/docs/meeting notes/sprint 1.txt"
cp "club-workspace/docs/meeting notes/sprint 1.txt" "club-workspace/docs/meeting notes/sprint 2.txt"
```

Kiểm tra: `find club-workspace -type d | wc -l` in `11`, `find club-workspace -type f | wc -l` in `7`, `find club-workspace -name "*.conf"` in 2 dòng, `grep -rn "3000" club-workspace` in 2 dòng (`backend.conf:1:port=3000` và `frontend.conf:1:upstream=backend:3000`), `wc -l club-workspace/backend/config/backend.conf` in `2`. Chú ý: nếu bạn ghi chữ `3000` vào `sprint 1.txt` thì `grep` sẽ in 3 dòng; hãy chọn nội dung khác. Cách khác đúng: ghi `backend.conf` bằng hai lệnh `echo`, miễn là lệnh thứ hai dùng `>>`.

**Nhiệm vụ 2 – phân tích log.** Một `my-access.log` mẫu thỏa mọi điều kiện (15 dòng, 4 IP, `10.0.0.5` nhiều nhất không hòa, 5 dòng 404, 2 dòng 5xx, có `POST`):

```text
10.0.0.5 - - [21/Oct/2026:09:00:01 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.5 - - [21/Oct/2026:09:00:02 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.7 - - [21/Oct/2026:09:00:03 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.9 - - [21/Oct/2026:09:00:04 +0700] "GET /api/members/99 HTTP/1.1" 404 40
10.0.0.5 - - [21/Oct/2026:09:00:05 +0700] "GET /ready HTTP/1.1" 200 15
10.0.0.7 - - [21/Oct/2026:09:00:06 +0700] "POST /api/events HTTP/1.1" 500 60
10.0.0.9 - - [21/Oct/2026:09:00:07 +0700] "GET /api/members HTTP/1.1" 500 60
10.0.0.5 - - [21/Oct/2026:09:00:08 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.7 - - [21/Oct/2026:09:00:09 +0700] "GET /health HTTP/1.1" 200 15
10.0.0.9 - - [21/Oct/2026:09:00:10 +0700] "GET /favicon.ico HTTP/1.1" 404 40
10.0.0.11 - - [21/Oct/2026:09:00:11 +0700] "GET /old-page HTTP/1.1" 404 40
10.0.0.5 - - [21/Oct/2026:09:00:12 +0700] "GET /api/events HTTP/1.1" 404 40
10.0.0.11 - - [21/Oct/2026:09:00:13 +0700] "GET /api/members HTTP/1.1" 404 40
10.0.0.7 - - [21/Oct/2026:09:00:14 +0700] "GET /api/members HTTP/1.1" 200 512
10.0.0.5 - - [21/Oct/2026:09:00:15 +0700] "GET /health HTTP/1.1" 304 0
```

Kết quả đúng với log mẫu: theo IP 6, 4, 3, 2 (tổng 15); theo mã 7 mã 200, 5 mã 404, 2 mã 500, 1 mã 304 (tổng 15); lọc 5xx cho `10.0.0.7 /api/events 500` và `10.0.0.9 /api/members 500`. Phép kiểm tra tổng:

```bash
wc -l my-access.log
awk '{print $1}' my-access.log | sort | uniq -c | awk '{s+=$1} END {print s}'
awk '{print $9}' my-access.log | sort | uniq -c | awk '{s+=$1} END {print s}'
```

Pipeline cố tình thiếu `sort`: `awk '{print $9}' my-access.log | uniq -c` cho 10 dòng (nhiều lần mã 200 và 404 xuất hiện rời rạc) thay vì 4 dòng. Hai câu giải thích mẫu: "`uniq -c` chỉ gộp các dòng liền kề nên cùng một mã nằm ở nhiều chỗ bị đếm thành nhiều nhóm nhỏ. Thêm `sort` đứng trước đưa các mã giống nhau nằm cạnh nhau nên được gộp thành một dòng tổng."

Lệnh đọc file không tồn tại với stderr ra file riêng: `cat khong-ton-tai.log 2> evidence/stderr.txt`, rồi `echo "exit code: $?"` ngay dòng kế tiếp (mã 1). `stderr.txt` chứa `cat: khong-ton-tai.log: No such file or directory`.

Phần C trên `examples/linux/access.log` (260 dòng):

| Câu hỏi | Kết quả | Lệnh |
| --- | --- | --- |
| 3 IP nhiều nhất | 192.168.1.10 (43), 172.16.4.2 (42), 203.0.113.25 (41) | awk in cột 1, sort, uniq -c, sort -nr, head -n 3 |
| Tổng request 5xx | 6 | awk với điều kiện cột 9 khớp mẫu bắt đầu bằng 5, rồi wc -l |
| Mã HTTP nhiều nhất | 200, 188 lần | awk in cột 9, sort, uniq -c, sort -nr, head -n 1 |
| Đường dẫn nhiều nhất | `/api/members`, 56 lần | awk in cột 7, sort, uniq -c, sort -nr, head -n 1 |

Học viên phải ghi lệnh đầy đủ (đây chỉ là mô tả vì pipeline có ký tự pipe không đặt được trong ô bảng); mentor chạy lại lệnh đó và so con số. Số 6 cũng có thể thu được bằng `grep -c '" 5[0-9][0-9] '` nhưng cách đó khớp lỏng theo chuỗi, bài tập yêu cầu kiểm tra đúng cột 9.

**Nhiệm vụ 3 – thư mục chung (lab-04).** Dựng môi trường:

```bash
sudo groupadd clbops
for u in clb-ops1 clb-ops2 clb-visitor; do sudo useradd -m -s /bin/bash "$u"; done
sudo usermod -aG clbops clb-ops1
sudo usermod -aG clbops clb-ops2
sudo mkdir -p /srv/club-reports /srv/club-reports-nosgid
sudo chown root:clbops /srv/club-reports /srv/club-reports-nosgid
sudo chmod 2770 /srv/club-reports
sudo chmod 770 /srv/club-reports-nosgid
```

Ma trận dự đoán (viết và commit trước khi chạy hành động):

| Hành động | Dự đoán | Lý do |
| --- | --- | --- |
| 1. ops1 tạo file trong thư mục có setgid, umask 007 | Thành công | ops1 thuộc group `clbops`, thư mục `rwxrws---` cho group ghi |
| 2. ops2 ghi nối vào file đó | Thành công | File mang group `clbops` nhờ setgid, quyền `rw-rw----` nhờ umask 007 |
| 3. visitor liệt kê thư mục | Permission denied | Visitor thuộc nhóm other, nhóm này là `---` |
| 4. ops1 tạo file trong thư mục không setgid | Thành công | ops1 thuộc `clbops` nên ghi được vào thư mục `770` |
| 5. ops2 ghi nối file ở bước 4 | Permission denied | File mang group cá nhân `clb-ops1` và quyền `rw-r--r--`; ops2 ở nhóm other, chỉ có `r` |

Commit riêng phần dự đoán, rồi lấy hash để dán vào `report.md`:

```bash
git add lab-04/source/permissions-matrix.md
git commit -m "Add permissions prediction matrix before running"
git rev-parse --short HEAD
```

Các hành động (mỗi cái chạy bằng đúng user, đứng ở `/tmp`; đọc mã thoát ngay sau lệnh):

```bash
cd /tmp
sudo -u clb-ops1 bash -c 'umask 007; echo "ops1: so lieu" > /srv/club-reports/report-ops1.txt'
echo "exit code: $?"
sudo -u clb-ops2 bash -c 'echo "ops2: bo sung" >> /srv/club-reports/report-ops1.txt'
echo "exit code: $?"
sudo -u clb-visitor ls /srv/club-reports
echo "exit code: $?"
sudo -u clb-ops1 bash -c 'echo "ops1" > /srv/club-reports-nosgid/report-nosgid.txt'
echo "exit code: $?"
sudo -u clb-ops2 bash -c 'echo "ops2" >> /srv/club-reports-nosgid/report-nosgid.txt'
echo "exit code: $?"
ls -l /srv/club-reports /srv/club-reports-nosgid
```

Kết quả đã chạy thử: hành động 1 và 2 thành công (mã 0), hành động 3 `ls: cannot open directory ... Permission denied` (mã 2), hành động 4 thành công, hành động 5 `Permission denied` (mã 1, vì lỗi nằm ở phép chuyển hướng của bash). `ls -ld` in `drwxrws--- 2 root clbops` và `drwxrwx--- 2 root clbops`. Trong `ls -l`: `report-ops1.txt` mang group `clbops` với quyền `-rw-rw----`, còn `report-nosgid.txt` mang group `clb-ops1` với quyền `-rw-r--r--`.

Nếu học viên bỏ `umask 007` ở hành động 1, file là `rw-r--r--` và hành động 2 sẽ thất bại dù setgid đúng; ma trận của họ phải giải thích dòng lệch này bằng umask.

Dọn dẹp và chứng minh đã dọn:

```bash
sudo rm -rf /srv/club-reports /srv/club-reports-nosgid
sudo userdel -r clb-ops1; sudo userdel -r clb-ops2; sudo userdel -r clb-visitor
sudo groupdel clbops
getent passwd clb-ops1 clb-ops2 clb-visitor
echo "exit code: $?"
getent group clbops
echo "exit code: $?"
ls -d /srv/club-reports*
echo "exit code: $?"
```

Cả ba lệnh kiểm tra không in gì và có mã thoát khác 0 (`getent` cho mã 2, `ls` cho mã 2). Cảnh báo `mail spool` của `userdel` có thể bỏ qua.

**Nhiệm vụ 4 – process.** Cách làm đã chạy thử, dùng PID cụ thể và mẫu `pgrep -af "sleep 91"`:

```bash
sleep 910 &
P1=$!
bash -c 'trap "" TERM; sleep 911' &
P2=$!
echo "shell: $$"
ps -o pid,ppid,stat,cmd -p "$P1,$P2"
pgrep -af "sleep 91"
kill "$P1"; sleep 1; pgrep -af "sleep 91"
kill "$P2"; sleep 1; pgrep -af "sleep 91"
kill -9 "$P2"; sleep 1; pgrep -af "sleep 91"
echo "exit code: $?"
```

Quan sát cần có: PPID của cả hai bằng số in ra từ `echo $$`; sau `kill "$P1"` chỉ còn `sleep 911`; sau `kill "$P2"` (SIGTERM) `sleep 911` vẫn còn; sau `kill -9` không còn gì và `exit code: 1`. Ghi chú: bash chạy lệnh cuối của `bash -c` bằng cách thay thế chính nó (exec), nên `ps` thường hiện một process `sleep 911` thay vì thêm một tiến trình `bash -c`, và trạng thái bỏ qua SIGTERM được giữ nguyên qua bước exec. Vì vậy PID `$!` vẫn là PID đúng. Nếu máy học viên hiện cả hai tiến trình, `pgrep -af` vẫn chọn đúng.

`process-notes.md` mẫu (6 dòng): PPID bằng `$$` vì process được shell hiện tại tạo ra (fork) nên shell là cha. Bước 5 thất bại vì `trap "" TERM` khiến process bỏ qua SIGTERM (tín hiệu 15) và dấu hiệu bỏ qua được giữ khi chạy `sleep`. SIGKILL (tín hiệu 9) kernel thực thi trực tiếp, không thể bắt hoặc bỏ qua. Không mở đầu bằng `kill -9` vì process không kịp đóng file hoặc xóa file tạm; luôn thử SIGTERM trước.

**Nhiệm vụ 5 – `show-config.sh`.** Đã chạy thử cả bốn trường hợp:

```bash
#!/usr/bin/env bash
set -u
WEB_PORT="${WEB_PORT:-8080}"
if [ -z "${DB_PASSWORD:-}" ]; then
  echo "LOI: thieu bien moi truong DB_PASSWORD" >&2
  exit 1
fi
echo "WEB_PORT=$WEB_PORT"
echo "DB_PASSWORD: da dat"
```

Kết quả bốn lần chạy:

```text
1. Khong dat bien nao:           LOI ... (stderr), exit code: 1
2. DB_PASSWORD=mat-khau-thu ...: WEB_PORT=8080, DB_PASSWORD: da dat, exit code: 0
3. cung them WEB_PORT=8081:      WEB_PORT=8081, DB_PASSWORD: da dat, exit code: 0
4a. DB_PASSWORD=mat-khau-thu roi goi script (khong export): LOI ..., exit code: 1
4b. export DB_PASSWORD roi goi lai:                         WEB_PORT=8080, exit code: 0
```

Khác biệt ở lần 4: biến shell chưa `export` không truyền sang process con (script), nên script thấy `DB_PASSWORD` rỗng. Sau `export` nó nằm trong môi trường của mọi process con. Lần 2 và 3 dùng cú pháp `BIEN=giatri lenh`, vốn chỉ đặt môi trường cho riêng lệnh đó. Chứng minh không lộ mật khẩu: `DB_PASSWORD=mat-khau-thu ./show-config.sh 2>&1 | grep -c "mat-khau-thu"` in `0`. Dọn bằng `unset DB_PASSWORD` và ghi lệnh vào evidence. File `.env.example` chứa `DB_PASSWORD=doi-mat-khau-that` và `WEB_PORT=8080`; `.gitignore` chứa dòng `.env`; kiểm tra bằng `git check-ignore -v source/.env`. Quét secret trước khi nộp bằng hai lệnh trong phần Bằng chứng của bài tập.

#### Gợi ý lời giải nhiệm vụ L2

**Thử thách A – `log-report.sh FILE [TOP_N]`.** Cách tiếp cận: kiểm tra tham số trước khi chạy pipeline vì pipeline với tham số sai cho kết quả rỗng hoặc lỗi khó hiểu. Đã chạy thử:

```bash
#!/usr/bin/env bash
set -u
file="${1:-}"; top="${2:-5}"
if [ -z "$file" ]; then echo "Cach dung: $0 FILE [TOP_N]" >&2; exit 1; fi
if [ ! -f "$file" ]; then echo "Khong tim thay file: $file" >&2; exit 1; fi
case "$top" in ''|*[!0-9]*|0) echo "TOP_N phai la so nguyen duong: $top" >&2; exit 1 ;; esac
echo "== Top $top IP =="
awk '{print $1}' "$file" | sort | uniq -c | sort -nr | head -n "$top"
echo "== Ma HTTP =="
awk '{print $9}' "$file" | sort | uniq -c | sort -nr
echo "== Top $top duong dan loi =="
awk '$9 >= 400 {print $7}' "$file" | sort | uniq -c | sort -nr | head -n "$top"
```

Ba trường hợp lỗi (thiếu FILE, FILE không tồn tại, `TOP_N` là `abc` hoặc `0`) đều thoát mã 1 kèm thông báo ở stderr. Với `TOP_N=2` trên `my-access.log` mẫu: top IP là `10.0.0.5` (6) và `10.0.0.7` (4); top đường dẫn lỗi là `/api/members` (2) và `/api/events` (2). Chú ý khi tự thiết kế log: nếu hạng cuối trong top N bị hòa, `sort -nr` sắp thứ tự hòa theo thứ tự ngược bảng chữ cái của cả dòng, kết quả vẫn xác định nhưng có thể gây nhầm lẫn khi đếm tay; hãy thiết kế log để ranh giới top N không bị hòa. Lý do cần kiểm tra tham số: `set -u` không bắt được chuỗi rỗng, `awk` với file không tồn tại báo lỗi nhưng pipeline vẫn tiếp tục và in tiêu đề trống, `head -n abc` báo lỗi khó hiểu.

**Thử thách B – `resource-check.sh`.** Dùng phiên bản ở lời giải Bài 1 của Buổi 04. Giải thích `awk` bằng lời của mình: ba lệnh `awk` (một trong `free`, một trong `df`) như đã nêu ở trên. Ba lần chạy: mặc định (mã 0), `MEM_LIMIT=1` (in `WARN`, mã 2), `MEM_LIMIT=abc` (lỗi stderr, mã 1).

**Thử thách C – `onboard.sh USER GROUP`.** Mỗi bước kiểm tra tồn tại trước khi làm, nên chạy lại không lỗi và không tạo trùng. Đã chạy thử với `sudo` được thay bằng một wrapper:

```bash
#!/usr/bin/env bash
set -u
user="${1:-}"; group="${2:-}"
if [ -z "$user" ] || [ -z "$group" ]; then echo "Cach dung: $0 USER GROUP" >&2; exit 1; fi
if getent group "$group" >/dev/null; then echo "group $group: da ton tai"; else sudo groupadd "$group" && echo "group $group: da tao"; fi
if id "$user" >/dev/null 2>&1; then echo "user $user: da ton tai"; else sudo useradd -m -s /bin/bash "$user" && echo "user $user: da tao"; fi
if id -nG "$user" | tr ' ' '\n' | grep -qx "$group"; then echo "user $user da thuoc $group"; else sudo usermod -aG "$group" "$user" && echo "da them $user vao $group"; fi
id "$user"
```

Kịch bản chứng minh: thêm user vào một group thứ hai trước, chạy script lần 1 (tạo group mới, thêm user), lần 2 (in `da ton tai`, `da thuoc`), và `id` vẫn còn cả group thứ hai, chứng tỏ `-aG` không làm mất group phụ. Lỗi có thể xảy ra nếu chạy script trong phiên đăng nhập đang mở của chính user vừa thêm: `id` (đọc từ cơ sở dữ liệu group) hiện group mới nhưng `id` của tiến trình hiện tại và các lệnh cần group đó vẫn thất bại cho tới khi đăng nhập lại; kiểm tra bằng `id -nG` (cơ sở dữ liệu) so với `groups` hoặc `ls` thật trong phiên đó. Dọn bằng `userdel -r`, `groupdel`, rồi `getent` để chứng minh.

#### Đáp án 5 câu hỏi kiểm tra

1. `uniq -c` chỉ gộp các dòng liền kề; log có mã 200 xen kẽ mã khác nên mỗi đoạn liền nhau bị đếm riêng. Sửa: thêm `sort` đứng trước `uniq -c`. Tự kiểm tra: cộng tất cả số đếm và so với `wc -l`, tổng phải bằng số dòng.
2. Bash tách dòng lệnh theo khoảng trắng nên `rm` nhận `meeting` và `notes` như hai đối số, mà hai thư mục đó không tồn tại. Thói quen: quote mọi đường dẫn và biến (`"club-workspace/docs/meeting notes"`); chạy `ls` hoặc `echo` với cùng đối số trước lệnh xóa; kiểm tra `pwd`; tránh `rm -rf` khi chưa chắc.
3. Ví dụ `find`: tìm mọi file `.conf` trong dự án để biết cấu hình nằm ở đâu (`find . -name "*.conf"`). Ví dụ `grep`: tìm dòng có `port=` trong một file cấu hình đã biết. Cả hai: muốn biết file `.conf` nào đặt cổng 3000 thì `grep -rn "3000" .` hoặc kết hợp `find . -name "*.conf"` với `grep` trên từng file.
4. Quyền `640` là owner `rw-`, group `r--`, other `---`. Bob (thuộc `dev`) chỉ đọc được, không ghi được. Carol (không thuộc `dev`, nhóm other) không đọc cũng không ghi được. Thư mục chia sẻ nên có group sở hữu là group của nhóm và `chmod 2770`: bit setgid làm file mới thừa hưởng group của thư mục, nên mọi thành viên có quyền nhất quán với file của nhau; nếu thiếu, file mang group cá nhân của người tạo và đồng đội không sửa được. Cần thêm umask phù hợp (002 hoặc 007) để group được ghi.
5. Ba điểm kiểm tra theo thứ tự: (1) `id clb-ops2` xem đã có `clbops` chưa; nếu có mà vẫn lỗi thì phiên cũ chưa nạp group, nhờ đăng nhập lại hoặc dùng `newgrp clbops`; (2) `ls -ld /srv/club-reports` xem owner, group và bit `rwx` của group; (3) `namei -l /srv/club-reports` xem mọi thư mục dọc đường có `x`. Không dùng `chmod 777` vì nó cho cả người ngoài nhóm đọc, ghi, xóa và mất ranh giới. Trong container cũng vậy: process chạy với UID/GID cố định (thường là user không phải root), và volume mount mang quyền của UID/GID phía host; nếu hai bên lệch nhau thì process bị `Permission denied`.

### Hướng dẫn chấm cho mentor

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
