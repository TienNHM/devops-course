# Hướng dẫn chấm – Tuần 4

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Bài tập của học viên: [Bài tập tuần 4](../../assignments/weekly/week-04.md). Đáp án: [Đáp án Tuần 4](../walkthroughs/week-04.md). Kịch bản buổi: [Kịch bản Buổi 07](../sessions/session-07.md), [Kịch bản Buổi 08](../sessions/session-08.md).
:::

> **Tóm tắt:** Thang điểm chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh, bằng chứng cần thấy và câu hỏi vấn đáp cho bài tập tuần 4 (Docker cơ bản). Tổng 100 điểm L1, thưởng tối đa 10 điểm L2.

## Thang điểm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110).

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: môi trường Docker | Đủ output, giải thích đúng kernel dùng chung | Thiếu Server hoặc giải thích sai | 10 |
| Nhiệm vụ 2: Nginx, port, bind mount | `curl` đúng trang, có log, có Mounts chỉ đọc, chứng minh dữ liệu tạm | Thiếu một trong các bằng chứng | 15 |
| Nhiệm vụ 3: vòng đời và inspect | Đủ chuỗi run, stop, start, rm lỗi, rm -f, `--rm` với output thật | Thiếu bước hoặc không có thông báo lỗi `rm` | 20 |
| Nhiệm vụ 4: biến môi trường, thoát ngay | Có cả lần thất bại (kèm nguyên nhân từ log) và lần thành công; inspect đã lọc | Không có bằng chứng thất bại, hoặc lộ mật khẩu | 15 |
| Nhiệm vụ 5: registry cục bộ | Push (có `digest: sha256:...`), catalog và tags đều có; đã dọn sạch | Tên image thiếu địa chỉ registry hoặc thiếu bằng chứng | 10 |
| Chất lượng `README.md` và `report.md` | 7 câu theo template, ngắn gọn, đúng, có nguyên nhân gốc | Sao chép đề bài, trả lời chung chung | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng ý và có ví dụ lệnh khi cần (3 điểm mỗi câu) | Sai hoặc bỏ trống | 15 |
| Vệ sinh và quy trình | Dọn sạch tài nguyên, không có secret, PR đúng quy trình, có reviewer | Còn container `lab0*`, commit `.env` hoặc secret, thiếu review | 5 |
| **Tổng L1** | | | **100** |
| L2 thử thách 1 (thưởng) | Xác định đúng thủ phạm, không xóa bừa, đủ báo cáo 5 phần | Thiếu bằng chứng hoặc xóa trước khi kiểm tra | +3 |
| L2 thử thách 2 (thưởng) | Có Dockerfile đã sửa, chạy được, nguyên nhân chứng minh từ bên trong image | Chỉ nêu kết luận, không có bằng chứng | +4 |
| L2 thử thách 3 (thưởng) | Số liệu đo thật, quy đổi đúng, so sánh dựa trên số liệu | Số liệu lấy từ bài giảng hoặc không đo | +3 |
| **Tối đa thưởng** | | | **+10** |

Bước "xóa bản cục bộ rồi pull lại từ `localhost:5001`" của Nhiệm vụ 5 thuộc phần thử thách thêm của bài học. Khi chấm, coi đây là điểm cộng, không trừ điểm nếu thiếu.

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình thay cho output lệnh, hoặc evidence không có lệnh đi kèm.
- Làm trong `/mnt/c` hoặc chạy lệnh trên PowerShell nhưng ghi là WSL.
- Dùng `latest` hoặc không ghi tag image.
- Quên `-d` nên terminal bị chiếm, hoặc quên `--name` nên tên container ngẫu nhiên khó tra cứu.
- Dán nguyên output `docker inspect` chứa biến môi trường nhạy cảm, hoặc commit `.env`, mật khẩu, token.
- Để sót container, image tạm hoặc registry `lab0*` sau khi nộp.
- Chỉ mô tả "đã sửa được" mà không nêu nguyên nhân gốc và cách xác minh.
- Xóa hoặc dừng container không phải của mình khi chưa kiểm tra chủ sở hữu (L2 thử thách 1).
- Gán cổng host đã bận rồi bỏ qua lỗi thay vì điều tra (xem [tình huống 01](../../examples/troubleshooting/scenario-01/README.md)).
- Sửa tay file evidence cho "đẹp" hơn thực tế.

## Lệnh kiểm tra nhanh

Chạy trên máy học viên (hoặc nhờ học viên chia sẻ màn hình) trước khi mở evidence:

```bash
docker ps -a --filter name=lab0
docker image ls
docker images --filter reference='localhost:5001/*'
ls lab-07 lab-08
grep -n "POSTGRES_PASSWORD" lab-08/evidence/command-output.txt
```

Cách đọc: `docker ps -a --filter name=lab0` phải chỉ còn dòng tiêu đề; lệnh `grep` chỉ được thấy dòng `POSTGRES_PASSWORD` trong output lỗi của container thoát ngay (nguyên văn thông báo của image), không được thấy dòng `POSTGRES_PASSWORD=...` do `docker inspect` chưa lọc.

Mentor kiểm chứng bằng cách đọc evidence, chạy lại `commands.sh` trên máy mentor và đối chiếu với trạng thái thật trên máy học viên (ví dụ `docker image ls`, `docker ps -a`). Output giống hệt bài của bạn khác, hoặc có dấu hiệu bị chỉnh tay, sẽ bị hỏi lại trực tiếp.

## Bằng chứng theo nhiệm vụ

| Nhiệm vụ | Evidence bắt buộc trong `command-output.txt` |
| --- | --- |
| 1 | `docker version`, `docker info` (rút gọn được), `hello-world`, hai dòng `uname -r` |
| 2 | `docker run`, `curl`, `docker logs`, `docker exec ls`, `inspect` phần Mounts, thử nghiệm file tạm |
| 3 | `inspect --format`, `stop`, `docker ps -a`, lỗi `docker rm`, `rm -f`, container `--rm` |
| 4 | `docker ps -a` và `docker logs` của lần thất bại, `pg_isready`, truy vấn `SELECT`, `inspect` đã lọc |
| 5 | `push` (có `digest: sha256:...`), hai lệnh `curl` vào registry, kiểm tra dọn dẹp (pull lại là điểm cộng) |
| L2 | Output mà từng tiêu chí L2 yêu cầu |

## Bằng chứng và câu hỏi vấn đáp theo tiêu chí

Điểm tối đa của một tiêu chí không được cho nếu thiếu output thật hoặc output có dấu hiệu chỉnh tay.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: môi trường Docker (10) | Khối `Client:` và `Server:`, `Hello from Docker!`, hai dòng `uname -r` giống nhau | `uname -r` lấy từ Windows hoặc Git Bash; hai dòng khác nhau mà không giải thích; không có khối Server | Vì sao Alpine và Ubuntu image cho cùng `uname -r`? Nếu tắt Docker Desktop thì khối nào mất? |
| Nhiệm vụ 2: Nginx, port, bind mount (15) | `curl` đúng trang có họ tên; log có dòng access của chính request; `ls` thấy `index.html`; `inspect` có `RW:false`; thử nghiệm file tạm cho thấy mất file | Nội dung trang là trang Nginx mặc định; log không có request nào; không có output file tạm | Sửa `index.html` trên máy thì trang có đổi không, vì sao? Nếu bỏ `:ro` thì khác gì? |
| Nhiệm vụ 3: vòng đời và inspect (20) | Chuỗi `running`, `exited`, `exit=0`, thông báo lỗi `docker rm` khi đang chạy, `rm -f`, container `--rm` biến mất; `curl` 200 trước và sau | Thiếu thông báo lỗi `rm`; dòng lỗi dán tay không có lệnh đi kèm; timestamp `StartedAt` không khớp thứ tự lệnh | `docker stop` làm gì với tiến trình bên trong? Vì sao `rm` từ chối container đang chạy? |
| Nhiệm vụ 4: biến môi trường, thoát ngay (15) | `Exited (1)`, log có `POSTGRES_PASSWORD`, sau đó `accepting connections` và kết quả `SELECT`; `inspect` đã lọc | Chỉ có lần thành công; `inspect` lộ dòng `POSTGRES_PASSWORD`; kết luận nguyên nhân không dẫn từ log | Làm sao bạn biết nguyên nhân mà không đoán? Vì sao phải đợi hai dòng `ready to accept connections`? |
| Nhiệm vụ 5: registry cục bộ (10) | `digest: sha256:...`, catalog có `club/nginx`, tags có `1.27-alpine`, dọn sạch `lab08-registry` (pull lại từ `localhost:5001` là điểm cộng) | Image tên không có `localhost:5001`; không có dòng `digest`; còn registry sau khi nộp | `docker tag` có sao chép dữ liệu không? Điều gì quyết định nơi `push` đi tới? |
| README và report (10) | Đủ 7 câu, có nguyên nhân gốc và cách xác minh | Sao chép nguyên văn đề hoặc bài giảng; thiếu nguyên nhân gốc | Chọn một lỗi trong report và yêu cầu tái hiện nhanh trên máy. |
| Câu hỏi kiểm tra (15) | Năm câu trả lời có lệnh minh họa khi cần | Trả lời giống từng chữ với bài khác; sai thứ tự `HOST:CONTAINER` | Câu 3 và câu 5: yêu cầu học viên gõ lệnh thật trên máy thay vì nói. |
| Vệ sinh và quy trình (5) | `docker ps -a --filter name=lab0` chỉ còn tiêu đề; không có secret; PR có review | Còn container hoặc registry `lab0*`; có `.env` hoặc `inspect` chưa lọc | Chạy ngay `docker ps -a` trên máy học viên. |
| L2 thử thách 1 (3) | Output `docker ps --filter publish=28081` chỉ đúng thủ phạm; dọn container `Created`; không xóa container cũ khi chưa kiểm tra | Xóa `ts01-legacy-site` ngay; không giải thích | Nếu container đó là của người khác thì làm gì? |
| L2 thử thách 2 (4) | ExitCode, log, `ls` trong image, Dockerfile đã sửa, `curl` ra JSON | Chỉ nêu kết luận; không có lệnh soi image | Có cách sửa khác không? Smoke test nên đặt ở đâu trong CI? |
| L2 thử thách 3 (3) | `docker stats`, `inspect` ra 67108864, số đo `time` của máy học viên | Số trùng với tài liệu; quy đổi sai | Vì sao VM không "nhẹ" bằng container ở số liệu bạn vừa đo? |

## Lưu ý khi chấm

- Hai kiểm tra chéo nên làm: giá trị `StartedAt` và ID container trong evidence phải khớp thứ tự lệnh, và kết quả `uname -r` phải là kernel WSL2 chứ không phải của Windows.
- Tên container của L1 theo quy ước `lab07-` và `lab08-` (`lab07-web`, `lab08-web`, `lab08-pg`, `lab08-registry`); thử thách 3 của Buổi 07 dùng `lab07-limit`. Tên khác quy ước thì khó lọc bằng `--filter name=lab0`, nhắc nhưng không trừ điểm nặng.
- Học viên làm L2 thử thách 1 và 2 phải chạy `cleanup.sh` của từng tình huống (và `docker rmi ts02-notes:fixed`) trước khi nộp.
