# Ví dụ Linux: log, quyền và giám sát tài nguyên

Thư mục này phục vụ các buổi về Linux, shell và tự động hóa kiểm tra hệ thống (Tuần 1-2). Mọi lệnh chạy trong WSL2 Ubuntu, trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.

| File | Mục đích |
| --- | --- |
| `access.log` | 260 dòng access log nginx giả lập để thực hành `grep`, `awk`, `sort`, `uniq`, `cut` |
| `permissions-lab.sh` | Sandbox tạo user, group, thư mục dùng chung để thực hành quyền (cần `sudo`) |
| `resource-check.sh` | Script in tải CPU, RAM, disk và cảnh báo khi vượt ngưỡng (mẫu cho challenge tuần 2) |

## Chuẩn bị

```bash
mkdir -p ~/devops-labs && cd ~/devops-labs
cp -r /đường/dẫn/tới/devops-course/examples/linux ./linux-examples
cd linux-examples
```

Nếu bạn đã clone repo giáo trình vào WSL, chỉ cần `cd examples/linux`.

## Phần 1: Phân tích access.log

Mỗi dòng có dạng nginx "combined":

```text
10.0.0.8 - - [10/Mar/2025:08:00:29 +0700] "GET /events HTTP/1.1" 200 2210 "-" "curl/8.5.0"
```

Các trường khi tách bằng khoảng trắng (`awk`): `$1` là IP, `$4` là thời gian, `$6` là method (kèm dấu `"`), `$7` là đường dẫn, `$9` là mã HTTP, `$10` là số byte.

### Bài tập

1. Log có bao nhiêu dòng request?
2. Thống kê số request theo mã HTTP, sắp xếp giảm dần.
3. Liệt kê 5 IP gửi nhiều request nhất.
4. Liệt kê các đường dẫn trả về 404 và số lần xuất hiện.
5. Tìm các request trả về 500. Chúng thuộc endpoint nào?
6. Có một IP hành xử đáng ngờ. Tìm ra IP đó và nêu bằng chứng.
7. Tính tổng số byte đã gửi cho client có IP `192.168.1.10`.
8. Đếm số request mỗi phút trong khoảng 09:00-09:59 để xem có đỉnh bất thường không.

### Đáp án gợi ý

<details><summary>Gợi ý bài 1-3</summary>

```bash
wc -l access.log
```

```text
260 access.log
```

```bash
awk '{print $9}' access.log | sort | uniq -c | sort -rn
```

```text
    188 200
     40 404
     15 304
      6 500
      5 403
      4 400
      2 201
```

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -5
```

Kết quả dòng đầu là `192.168.1.10` với 43 request. Đây là log cố định nên số liệu không đổi giữa các lần chạy.

</details>

<details><summary>Gợi ý bài 4-5</summary>

```bash
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn
grep '" 500 ' access.log
```

Toàn bộ 6 request lỗi 500 đều vào `/api/members`: đây là dấu hiệu API mất kết nối database trong khoảng thời gian đó. Nếu thấy lỗi 500 lặp lại, bước tiếp theo là đọc log của backend, không phải log nginx.

</details>

<details><summary>Gợi ý bài 6</summary>

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3
grep '^203.0.113.99 ' access.log | awk '{print $7}' | sort | uniq -c | sort -rn
grep '^203.0.113.99 ' access.log | awk '{print $9}' | sort | uniq -c
```

IP `203.0.113.99` gửi 30 request trong vòng khoảng một phút, toàn bộ trả 403 hoặc 404, vào các đường dẫn như `/wp-login.php`, `/.env`, `/.git/config`, `/phpmyadmin/`, `/admin`, kèm User-Agent `python-requests/2.31.0`. Đó là hành vi dò quét (scanning), không phải người dùng thật. Hướng xử lý: chặn IP ở tầng firewall hoặc reverse proxy, và rà soát xem các file nhạy cảm như `.env` có thật sự không bị expose.

</details>

<details><summary>Gợi ý bài 7-8</summary>

```bash
awk '$1 == "192.168.1.10" {sum += $10} END {print sum " bytes"}' access.log
awk '{split($4, t, ":"); if (t[2] == "09") c[t[3]]++} END {for (m in c) print "09:" m, c[m]}' access.log | sort
```

Ở bài 8, phút có số request vượt trội chính là phút xảy ra đợt dò quét của IP đáng ngờ.

</details>

### Thử thách thêm

- Viết một script `top-ips.sh` nhận đường dẫn log và số N, in N IP đứng đầu.
- Dùng `tail -f` kết hợp `grep --line-buffered` để theo dõi lỗi 5xx theo thời gian thực trên một file log đang được ghi.

## Phần 2: Quyền, user và group

`permissions-lab.sh` tạo một sandbox riêng với tiền tố `dsclab`: group `dsclab-club`, user `dsclab-alice`, `dsclab-bob`, `dsclab-eve` và thư mục `/srv/dsclab-shared`. Script không đụng tới tài khoản hay thư mục nào khác và có chế độ dọn dẹp.

```bash
sudo ./permissions-lab.sh setup
sudo ./permissions-lab.sh demo
sudo ./permissions-lab.sh cleanup
```

Kết quả mong đợi (rút gọn) của `setup`:

```text
[5/5] Kết quả:
drwxrws--- 2 root dsclab-club 4096 Mar 10 09:00 /srv/dsclab-shared
dsclab-club:x:1001:dsclab-alice,dsclab-bob
```

Chữ `s` trong `rws` là bit setgid. Với `demo`, bạn sẽ thấy: alice tạo file thành công, bob đọc được nhưng chưa ghi được (Permission denied), sau `chmod g+w` thì bob ghi được, còn `dsclab-eve` không vào được thư mục.

### Câu hỏi để giải thích

- Vì sao file `alice.txt` có group là `dsclab-club` mà không phải `dsclab-alice`?
- Quyền `2770` nghĩa là gì ở từng chữ số?
- Vì sao `dsclab-eve` bị chặn dù thư mục nằm ngay trong `/srv`?
- Nếu bỏ bit setgid (`chmod 770`), điều gì xảy ra với group của file mới?

Hãy đọc kỹ từng bước trong script (mỗi bước có chú thích), tự dự đoán kết quả trước khi chạy. Sau khi xong, luôn chạy `cleanup`.

## Phần 3: Giám sát tài nguyên

```bash
chmod +x resource-check.sh
./resource-check.sh
MEM_LIMIT=1 ./resource-check.sh   # ép ngưỡng thấp để thấy cảnh báo
```

Kết quả mong đợi (số liệu của bạn sẽ khác):

```text
load: 0.15 0.10 0.05
mem:  23%
disk: 4%
```

Với `MEM_LIMIT=1` bạn sẽ thấy thêm dòng `WARN: memory above 1%`. Đây là cách kiểm thử logic cảnh báo mà không cần làm cạn RAM thật. Bài tập: mở rộng script để ghi kết quả kèm timestamp vào file `resource.log` và chạy mỗi phút bằng `cron` hoặc vòng `while` có `sleep 60`.
