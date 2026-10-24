# Hướng dẫn chấm – Tuần 6

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Bài tập học viên: [Bài tập tuần 6](../../assignments/weekly/week-06.md). Đáp án mẫu: [Đáp án tuần 6](../walkthroughs/week-06.md). Kịch bản buổi: [Buổi 11](../sessions/session-11.md), [Buổi 12](../sessions/session-12.md).
:::

> **Tóm tắt:** Thang điểm 100 cho 5 nhiệm vụ L1 của tuần 6 (cộng tối đa 10 điểm thưởng L2), các lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho từng tiêu chí.

## Phạm vi bài nộp

Bài nộp gồm hai thư mục trong repo cá nhân `devops-labs`:

- `lab-11/`: Nhiệm vụ 1 đến 3 (Buổi 11, Phần 1 đến 4); Phần 5 (tự phá lỗi `DB_HOST=localhost`) được ghi trong `report.md`.
- `lab-12/`: Nhiệm vụ 4 và 5 (Buổi 12, Phần 1 đến 5).

Thử thách L2 lấy từ hai trang thử thách thêm: Thử thách A của Buổi 11 (script isolation), Thử thách B của Buổi 11 và Thử thách A của Buổi 12 (Compose), Thử thách C (điều tra lỗi: `DB_HOST=localhost` hoặc tình huống 04).

## Thang điểm

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: DNS theo tên | Đủ cặp đối chiếu (tên thành công trên `lab-net`, `bad address` trên default bridge), `nslookup` qua `127.0.0.11`, publish `127.0.0.1:18082`, giải thích đúng về tên và IP | Thiếu lần đối chiếu, publish ra mọi interface, giải thích sai | 12 |
| Nhiệm vụ 2: API và Postgres | `/ready` trả ready bằng log thật, `DB_HOST` là tên, Postgres không publish cổng, network chỉ có hai container | Dùng `localhost` hoặc IP, publish 5432, không có log `/ready` | 15 |
| Nhiệm vụ 3: isolation | Tên và IP đều thất bại, connect xong thành công, `inspect` hai network, giải thích đúng | Chỉ chứng minh một chiều, thiếu output, giải thích sai | 10 |
| Nhiệm vụ 4: persistence | Volume đúng đích, dữ liệu sống sót qua `rm -f`, đối chiếu `inspect` với `data_directory`, có `Skipping initialization` | Gắn sai đường dẫn, dữ liệu mất, chỉ dừng container thay vì xóa | 15 |
| Nhiệm vụ 5: backup và restore | Restore vào database rỗng sau khi xóa volume, thấy lại đúng dữ liệu, giải thích đúng về `-i` | Dump rỗng, không xóa volume trước khi restore, chỉ đếm dòng mà không xem dữ liệu | 13 |
| `report.md` và `README.md` | Đủ 7 câu mỗi lab, 5 câu hỏi kiểm tra trả lời bằng lời của bạn, ghi rõ mức đã làm | Thiếu câu, sao chép bài lab, không ghi mức | 15 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc, evidence là text thật có lệnh kèm output, không có `.env` hay mật khẩu, chạy được lệnh quét ở trên | Evidence chỉ là ảnh hoặc gõ tay, có secret trong repo | 10 |
| Quy trình nộp | Có PR, được một bạn review có nhận xét thật | Push thẳng vào `main`, review chỉ ghi "OK" | 10 |
| **Tổng L1** | | | **100** |
| L2: Thử thách A (script isolation) | Tự chạy, PASS/FAIL, thoát khác 0 khi lỗi, tự dọn, hai lần chạy | Cần can thiệp tay, không dọn, chỉ một lần chạy | +4 |
| L2: Thử thách B (Compose) | Hai network đúng, chứng minh `web` không thấy `postgres`, hai lần kiểm tra `down` và `down -v` | Thiếu chứng minh, hard-code mật khẩu | +3 |
| L2: Thử thách C (điều tra lỗi) | Báo cáo đủ 5 mục, mỗi kết luận có log, có kết quả sau khi sửa | Kết luận không có căn cứ, thiếu mục | +3 |
| **Tối đa thưởng** | | | **+10** |

Ghi chú: 12 + 15 + 10 + 15 + 13 + 15 + 10 + 10 = 100. Việc dọn dẹp tài nguyên (có output `docker ps -a`, `docker network ls`, `docker volume ls`) được tính vào mục "Bằng chứng và kỷ luật repo": còn tài nguyên thừa hoặc dùng `volume prune` xóa nhầm thì mất phần điểm của mục đó. Điểm một tiêu chí được chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0.

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 60 điểm trở lên.

## Lỗi hay bị trừ điểm

- Dùng `localhost` hoặc IP container làm `DB_HOST`, hoặc publish cổng 5432 ra host trong khi không cần.
- Chứng minh isolation chỉ bằng tên mà bỏ qua gọi bằng IP, hoặc quên `-T` nên lệnh treo và không có output.
- "Chứng minh persistence" bằng `docker stop` hoặc `docker restart` thay vì xóa hẳn container (`docker rm -f`).
- Gắn volume sai đường dẫn (ví dụ `/var/lib/postgres/data`), hoặc dùng anonymous volume mà không biết.
- Kiểm tra restore chỉ bằng số dòng, không xem nội dung; hoặc quên `-i` ở `docker exec` nên bảng vẫn trống.
- Chạy `docker compose down -v` hoặc `docker volume prune` trên máy mà không kiểm tra kỹ, xóa nhầm dữ liệu của mình hoặc của dự án khác.
- Dùng image `latest`, hoặc không ghim phiên bản (`postgres:17-alpine`, `nginx:1.27-alpine`).
- Commit `.env`, mật khẩu, hoặc để mật khẩu hiện trong output nộp.
- Làm việc trong `/mnt/c` hoặc bind mount dữ liệu Postgres vào thư mục dưới `/mnt/c`.
- `command-output.txt` gõ tay hoặc chỉ có output mà không có lệnh; chỉ nộp ảnh chụp màn hình.
- Push thẳng vào `main`, không có PR hoặc người review chỉ ghi "OK".

## Lệnh kiểm tra nhanh

Quét tệp nhạy cảm (kết quả mong đợi: không in ra dòng nào). Đây là lệnh học viên cũng được yêu cầu tự chạy:

```bash
cd ~/devops-labs
git ls-files | grep -E '(^|/)\.env$'
grep -rIn -E 'POSTGRES_PASSWORD=[^$"]|DB_PASSWORD=[^$"]' lab-11 lab-12 --exclude=.env.example
```

Nếu `grep` thứ hai in ra dòng chứa mật khẩu giả của lab, yêu cầu học viên thay bằng tham chiếu biến (`$DB_PASSWORD`) trong file và log nộp.

Kiểm tra nhanh evidence có đủ dấu hiệu chính (mỗi lệnh nên in ít nhất một dòng):

```bash
cd ~/devops-labs
grep -n "bad address" lab-11/evidence/command-output.txt
grep -n "127.0.0.11" lab-11/evidence/command-output.txt
grep -n '"status":"ready"' lab-11/evidence/command-output.txt
grep -n "Skipping initialization" lab-12/evidence/command-output.txt
grep -n "data_directory" lab-12/evidence/command-output.txt
grep -c "latest" lab-11/source/*.yaml lab-12/source/*.yaml 2>/dev/null
```

Dòng cuối mong đợi in `0` cho mỗi file compose (không dùng image `latest`).

## Câu hỏi vấn đáp và dấu hiệu bài chép

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| DNS theo tên (12) | `lab-net`, `wget` và `nslookup` có `127.0.0.11`, `bad address` từ default bridge, `curl -sI` 200 ở `127.0.0.1:18082`, `docker port` rỗng | Không có lần đối chiếu default bridge; publish dạng `-p 18082:80` (mọi interface) mà không nhận ra; lỗi `bad address` dán nhưng không có lệnh | Vì sao default bridge không phân giải tên? `127.0.0.11` nằm ở đâu? |
| API và Postgres (15) | `docker build` dòng cuối, `docker network inspect club-net` đúng hai container, `/ready` ready, `/api/members`, `docker port` Postgres rỗng; không lộ mật khẩu | `DB_HOST` là IP hoặc `localhost`; có `-p 5432:5432`; `/api/members` chép từ bài lab mà log không khớp tên container | Nếu tôi đổi tên container Postgres thì API còn kết nối được không? Vì sao không cần publish 5432? |
| Isolation (10) | Ba lần gọi (tên thất bại, IP thất bại với `-T`, sau connect thành công) và `docker inspect` thấy hai network | Chỉ thử bằng tên; không có timeout nào; giải thích cho rằng "do DNS" cho cả trường hợp IP | Vì sao gọi bằng IP cũng thất bại? Sau `connect`, container có hai IP hay một? |
| Persistence (15) | `rm -f` container (không phải `stop`), `docker volume ls`, SELECT trước và sau, log có `Skipping initialization`, `inspect` Mounts khớp `SHOW data_directory;` | Dữ liệu y hệt Alice, Bob, Carol; thiếu `Skipping initialization`; chứng minh bằng `restart` | Nếu volume gắn vào `/var/lib/postgres/data` (thiếu `ql`) thì chuyện gì xảy ra? Làm sao phát hiện? |
| Backup và restore (13) | `backup.sql` có dữ liệu riêng của học viên, output sau `volume rm` (rỗng hoặc thiếu bảng), `COPY 3` khi restore, `SELECT` đúng dữ liệu | Chỉ đếm số dòng; không xóa volume trước khi restore; giải thích về `-i` mơ hồ | Nếu bỏ `-i` thì lệnh trả mã thoát gì, vì sao? Vì sao `pg_dump` tốt hơn chép thô thư mục dữ liệu? |
| `report.md`, `README.md` (15) | Đủ 7 câu mỗi lab, 5 câu kiểm tra bằng lời riêng, ghi mức L1 hoặc L2 | Văn phong giống hệt bài lab hoặc giống bạn khác | Tóm tắt bằng lời của bạn sự khác nhau giữa named volume, bind mount và tmpfs |
| Bằng chứng, kỷ luật repo (10) | Evidence là text thật kèm lệnh, `git ls-files` không có `.env`, quét secret sạch, có `docker ps -a`, `docker network ls`, `docker volume ls` sau khi dọn | Còn `.env`; mật khẩu hiện trong output; evidence chỉ có ảnh; dùng `docker volume prune` xóa dữ liệu dự án khác | Bạn dọn tài nguyên như thế nào mà không ảnh hưởng volume của dự án khác? |
| Quy trình nộp (10) | PR có nhận xét cụ thể | Review chỉ ghi "OK"; push thẳng vào `main` | Reviewer đã chạy lại lệnh nào? |
| L2 (thưởng) | Script PASS hoặc FAIL, thoát khác 0 khi sai, tự dọn, hai lần chạy; Compose với `web` không phân giải được `postgres`; báo cáo 5 mục có log | Script chỉ chạy được khi có can thiệp tay; `web` vẫn thấy `postgres` do để chung network; dùng `localhost` trong `wget` rồi ghi nhận "API hỏng" | Compose của bạn khác `docker run` ở chỗ nào về network? `down` khác `down -v` thế nào? |

Gợi ý chung khi vấn đáp: nhờ học viên mô tả bằng lời đường đi của một gói tin từ `curl` trên host tới Postgres (host, port mapping, API, DNS nhúng, Postgres), và giải thích hậu quả của `docker volume rm` với bản backup của chính họ. Bài hiểu thật nói được lỗi nằm ở đâu khi hai đường dẫn (mount và `data_directory`) khác nhau.

Năm câu hỏi kiểm tra kiến thức của bài tập (học viên trả lời trong `report.md`; đáp án mẫu ở [Đáp án tuần 6](../walkthroughs/week-06.md)):

1. API trong container có `DB_HOST=localhost` và log báo `ECONNREFUSED 127.0.0.1:5432` dù Postgres đang chạy. Vì sao lỗi xảy ra, và bạn kiểm tra gì đầu tiên?
2. `-p 127.0.0.1:13000:3000` khác `-p 13000:3000` ở điểm nào về bảo mật? Khi nào bạn không cần `-p` cho một container?
3. Làm sao cho một container đang chạy nói chuyện được với container ở network khác mà không tạo lại nó? Nêu lệnh.
4. `docker volume ls` cho thấy volume của dự án, nhưng dữ liệu vẫn mất sau `down` rồi `up`. Hãy nêu hai nguyên nhân khả dĩ và hai lệnh để phân biệt chúng.
5. Bạn đổi `POSTGRES_PASSWORD` trong file compose rồi `up` lại, nhưng mật khẩu cũ vẫn là mật khẩu đang dùng. Giải thích vì sao và nêu cách đổi mật khẩu mà không mất dữ liệu.
