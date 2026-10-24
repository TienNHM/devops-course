# Buổi 04 – Thử thách thêm (L2)

[Quay lại Buổi 04 – Linux Administration](session-04.md) · [Hub tuần](README.md)

> **Tóm tắt:** Thử thách tùy chọn của Buổi 04: script resource-check.sh, chạy script như service systemd, ghi chú về chmod 777 và phá lỗi nâng cao về group chưa có hiệu lực.

::: tip Dùng khi nào
Chỉ làm sau khi đã xong checklist L1 của [Buổi 04 – Linux Administration](session-04.md). Làm ở nhà, không bắt buộc. Nếu đã dọn user `clb-dev1` ở cuối lab, tạo lại trước khi làm Bài 2. Đáp án đầy đủ dành cho mentor, học viên đối chiếu sau khi nộp bài trong [Hub tuần](README.md).
:::

## Bài 1: Script kiểm tra tài nguyên (khoảng 10 phút)

Viết `source/resource-check.sh` in tải CPU, % RAM, % disk và cảnh báo khi vượt ngưỡng; ngưỡng đọc từ biến môi trường `MEM_LIMIT`, `DISK_LIMIT` (mặc định 85). Tiêu chí hoàn thành:

- [ ] Script có `set -euo pipefail`, chạy được bằng `bash source/resource-check.sh`.
- [ ] Đặt `MEM_LIMIT=1 bash source/resource-check.sh` thì in dòng `WARN`.
- [ ] Bạn giải thích được từng lệnh `awk` trong script (không chép nguyên mẫu mà không hiểu).

Bạn có thể tham khảo bản mẫu `examples/linux/resource-check.sh` sau khi tự thử.

::: warning Tự thử 15 phút trước khi mở gợi ý
Mở gợi ý quá sớm làm bạn mất cơ hội luyện cách nghĩ.
:::

<details>
<summary>Gợi ý</summary>

- RAM: `free | awk '/Mem:/ {printf "%d", $3/$2*100}'` (cột used chia cột total).
- Disk: `df / | awk 'NR==2 {gsub("%","",$5); print $5}'`.
- Giá trị mặc định cho biến: `${MEM_LIMIT:-85}`.
- Với `set -e`, câu `[ "$a" -ge "$b" ] && echo ...` trả mã khác 0 khi điều kiện sai; cuối script nên có `exit 0` hoặc dùng `if ... then ... fi`.

</details>

## Bài 2: Chạy script như một service systemd (khoảng 10 phút)

Điều kiện: `systemctl is-system-running` trả về `running` hoặc `degraded`. Nếu báo lỗi hoặc `offline`, bật systemd cho WSL.

::: danger Ghi đè /etc/wsl.conf và tắt WSL
Lệnh `tee` dưới đây **ghi đè** `/etc/wsl.conf`; nếu file đã có nội dung, hãy thêm mục `[boot]` bằng trình soạn thảo thay vì ghi đè. `wsl --shutdown` tắt mọi bản WSL đang chạy, nên lưu công việc và đóng terminal khác trước. Xem trước nội dung hiện có bằng `cat /etc/wsl.conf`.
:::

```bash
cat /etc/wsl.conf
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[boot]
systemd=true
EOF
```

Sau đó chạy `wsl --shutdown` trong PowerShell của Windows, mở lại Ubuntu.

Yêu cầu: tạo unit `club-resource-check.service` chạy script mỗi 30 giây. Tiêu chí hoàn thành:

- [ ] `systemctl status club-resource-check` hiển thị `active (running)`.
- [ ] `sudo journalctl -u club-resource-check -n 5 --no-pager` thấy output của script.
- [ ] Service chạy bằng user `clb-dev1` (tạo lại user nếu đã dọn), không phải root.
- [ ] Khi `sudo kill -9` process chính, systemd tự khởi động lại.

<details>
<summary>Gợi ý</summary>

- Copy script vào `/opt/club/resource-check.sh` và `chmod 755`; user của service phải đọc và thực thi được cả đường dẫn.
- Unit `Type=simple` cần một tiến trình chạy mãi: bọc script trong `bash -c 'while true; do ...; sleep 30; done'`.
- Sau khi tạo hoặc sửa unit phải chạy `sudo systemctl daemon-reload`.
- Lấy PID chính để thử tự khởi động lại bằng `systemctl show -p MainPID --value club-resource-check`. Gặp `status=203/EXEC` thì kiểm tra đường dẫn `ExecStart` và quyền `chmod 755`.

</details>

## Bài 3: Ghi chú về quyền

Tự viết `source/permissions-notes.md` (5 dòng) giải thích vì sao không dùng `chmod 777` cho `/srv/club-shared` và bạn dùng cơ chế nào thay thế. Bản script tham khảo cho các thao tác quyền: `examples/linux/permissions-lab.sh`.

## Phá lỗi nâng cao

Tình huống: user mới được thêm vào group nhưng vẫn bị `Permission denied`. Tạo lại môi trường nếu đã dọn:

```bash
getent group clbdev > /dev/null || sudo groupadd clbdev
sudo useradd -m -s /bin/bash clb-dev3
sudo mkdir -p /srv/club-shared && sudo chown root:clbdev /srv/club-shared && sudo chmod 2770 /srv/club-shared
sudo -u clb-dev3 ls /srv/club-shared
```

Triệu chứng: `ls: cannot open directory '/srv/club-shared': Permission denied`, dù bạn "chắc chắn" đã cấp quyền cho nhóm. Hướng điều tra theo từng bước:

1. Xem user có thực sự thuộc group không: `id clb-dev3`. Nếu không thấy `clbdev`, user chưa được thêm.
2. Xem quyền thư mục và owner: `ls -ld /srv/club-shared`. Group phải là `clbdev` và có `rwx`.
3. Xem mọi thư mục dọc đường đi: `namei -l /srv/club-shared`. Một thư mục cha thiếu `x` cũng gây lỗi.
4. Sửa đúng gốc: `sudo usermod -aG clbdev clb-dev3`, rồi kiểm tra bằng một phiên mới: `sudo -u clb-dev3 ls /srv/club-shared`.
5. Nếu user đã đăng nhập sẵn, phiên hiện tại vẫn mang danh sách group cũ. Phải đăng xuất rồi đăng nhập lại (hoặc `newgrp clbdev`) thì group mới có hiệu lực. Với bản thân bạn trong WSL, mở terminal mới (hoặc `wsl --shutdown` nếu cần).

Nguyên nhân gốc: kernel dùng danh sách group được nạp lúc phiên bắt đầu; sửa `/etc/group` không đổi các phiên đang chạy. Cách phòng tránh: ghi quy trình onboarding thành script, luôn kiểm tra bằng `id` trong phiên mới, và tuyệt đối không "chữa cháy" bằng `chmod 777`, vì làm vậy xóa luôn ranh giới giữa nhóm và người ngoài. Dọn: `sudo userdel -r clb-dev3`.

## Câu hỏi tình huống thêm

1. Thành viên mới báo `Permission denied` ở thư mục dự án dù bạn đã `usermod -aG` cho bạn ấy từ 10 phút trước. Bạn làm gì đầu tiên?
2. Vì sao service nên chạy bằng user riêng thay vì root?

<details>
<summary>Đáp án gợi ý</summary>

1. Chạy `id` trong terminal của bạn ấy: nếu chưa thấy group thì phiên cũ chưa nạp group; yêu cầu đăng nhập lại. Sau đó kiểm tra `ls -ld` và `namei -l`. Không `chmod 777`.
2. Nguyên tắc quyền tối thiểu: nếu service bị khai thác, kẻ tấn công chỉ có quyền của user đó. Đây cũng là lý do Dockerfile của backend starter-project dùng user không phải root.

</details>
