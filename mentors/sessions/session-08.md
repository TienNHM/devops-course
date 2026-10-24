# Kịch bản mentor – Buổi 08: Docker CLI

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 08 – Docker CLI](../../labs/week-04/session-08.md). Slide: [Slide buổi 08](../../slides/02-docker/session-08.md). Chấm bài: [Barem và hướng dẫn chấm tuần 4](../grading/week-04.md). Đáp án: [Walkthrough tuần 4](../walkthroughs/week-04.md).
:::

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Buổi 07: image, container, registry, `-p HOST:CONTAINER` |
| Kiến thức và demo | 30 phút | Vòng đời container, cờ `docker run`, bộ lệnh quan sát; demo 5 bước bên dưới (khoảng 10 phút) |
| Thực hành | 60 phút | Lab L1 (Phần 1 đến 3 khoảng 25 phút, Phần 4 khoảng 10 phút), L2 khoảng 25 phút |
| Review | 15 phút | Trả lời câu hỏi ôn đầu buổi, nhắc dọn container và nộp bài |

Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Ghi chú về bài học viên đã cải tổ: bài L1 chỉ giữ 10 lệnh Docker (`run`, `ps`, `logs`, `exec`, `inspect`, `stop`, `start`, `rm`, `tag`, `push`). `docker port`, `docker stats`, `docker pull` và bước xóa bản cục bộ rồi pull lại nằm trong phần "Thử thách thêm". Hai tình huống 01 và 02 nằm trong bảng Gặp lỗi? và phần L2.

## Demo của mentor

Mục tiêu (khoảng 10 phút trong phần 30'): cho lớp thấy một vòng đời hoàn chỉnh và một lỗi thoát ngay. Mentor chạy trên màn hình chiếu, lớp dự đoán trước khi Enter.

1. Chạy nginx nền và kiểm tra.

```bash
docker run -d --name demo-web -p 8088:80 nginx:1.27-alpine
docker ps
curl -I http://localhost:8088
```

Kết quả mong đợi: `docker ps` có một dòng `demo-web` trạng thái `Up`, cột PORTS có `0.0.0.0:8088->80/tcp`; `curl -I` trả `HTTP/1.1 200 OK`.

Hỏi lớp: "Cổng 8088 nằm ở máy hay trong container? Nếu mình đổi thành `-p 8088:8088` thì chuyện gì xảy ra?" (Đáp: nginx nghe cổng 80 trong container nên kết nối tới 8088 bên trong sẽ không có ai trả lời.)

2. Xem log và đi vào trong.

```bash
docker logs --tail 5 demo-web
docker exec demo-web wget -qO- http://localhost
docker exec -it demo-web sh
# trong container:
ps
exit
```

Kết quả mong đợi: log có các dòng khởi động của nginx và một dòng truy cập GET từ `curl`; `wget` in ra HTML "Welcome to nginx!"; `ps` cho thấy `nginx: master process` là PID 1.

Hỏi lớp: "Mình exit shell, container có chết không? Vì sao?" (Đáp: không, shell chỉ là tiến trình phụ do `exec` tạo; PID 1 vẫn là nginx.)

3. Soi chi tiết bằng inspect.

```bash
docker inspect --format '{{.State.Status}} exit={{.State.ExitCode}}' demo-web
docker inspect --format '{{.Config.Image}} {{json .NetworkSettings.Ports}}' demo-web
```

Kết quả mong đợi: `running exit=0` và tên image kèm JSON ánh xạ cổng `80/tcp`.

4. Cho một container thoát ngay (không có biến bắt buộc).

```bash
docker run -d --name demo-pg postgres:17-alpine
docker ps
docker ps -a --filter name=demo-pg
docker logs demo-pg
```

Kết quả mong đợi: `docker ps` không thấy `demo-pg`; `docker ps -a` hiển thị `Exited (1)`; log có dòng `Error: Database is uninitialized and superuser password is not specified.`

Hỏi lớp: "Container đã chết, mình còn xem được log không? Cần sửa gì?" Sau đó sửa:

```bash
docker rm demo-pg
docker run -d --name demo-pg -e POSTGRES_PASSWORD=demo_only_password postgres:17-alpine
docker ps --filter name=demo-pg
```

Kết quả mong đợi: lần này `demo-pg` ở trạng thái `Up`. Mật khẩu ở đây chỉ là giá trị minh họa cho demo, không dùng cho dự án thật.

5. Dừng và dọn dẹp.

```bash
docker stop demo-web demo-pg
docker rm demo-web demo-pg
docker ps -a --filter name=demo-
```

Kết quả mong đợi: hai tên được in lại sau mỗi lệnh; lệnh cuối chỉ còn dòng tiêu đề.

## Ghi chú giảng viên theo từng slide

Nguyên văn "Ghi chú giảng viên" (số slide theo bản trước khi thu gọn, các slide Demo, Lab, Break, Challenge đã được gộp trong bản mới) của [Slide buổi 08](../../slides/02-docker/session-08.md).

**Slide 1. Mục tiêu buổi học.** Mở bài 2 phút, ôn nhanh buổi 07: image, container, registry, `-p HOST:CONTAINER`. Hỏi 1 câu ôn: "docker stop khác docker rm thế nào?" (để dành trả lời cuối buổi).

**Slide 2. Vấn đề: chạy rồi mà không thấy gì.** Các lệnh hôm nay là họ hàng của `kubectl logs`, `exec`, `describe` ở tuần sau. 2 phút.

**Slide 3. Image và container.** Nhắc lại ngắn. Nếu lớp còn mơ hồ, quay lại ví von class và object. 2 phút.

**Slide 4. Vòng đời container.** Hỏi: "Container Exited còn xem log được không?" (được, tới khi bị xóa). 3 phút.

**Slide 5. Cú pháp docker run.** Cờ `-it` dành cho shell tương tác. Nhấn mạnh quên `-d` thì terminal bị chiếm, nhiều bạn tưởng container treo. 3 phút.

**Slide 6. Bộ lệnh quan sát và điều khiển.** Không đọc hết bảng; để học viên chụp màn hình làm cheatsheet. 2 phút.

**Slide 7. Tên image đầy đủ.** Liên hệ: sau này push `ghcr.io/TEN-BAN/club-api:1.0.0` cũng cùng cơ chế. 2 phút.

**Slide 8. Kiến trúc: CLI, daemon, registry.** Câu hỏi: thoát shell của `exec` thì container có chết không? Vì sao? (không, PID 1 vẫn là nginx). 2 phút.

**Slide 9. Demo 1 – Chạy, kiểm tra, vào trong.** Đáp án: nginx nghe cổng 80 nên kết nối tới 8088 trong container không ai trả lời. Đây cũng là tình huống Break của buổi. 4 phút.

**Slide 10. Demo 2 – inspect với format.** Cảnh báo: inspect hiển thị cả biến môi trường chứa mật khẩu. 3 phút.

**Slide 11. Demo 3 – Container thoát ngay.** Mật khẩu chỉ để demo, không dùng cho dự án thật (dự án thật dùng `.env` không commit). Hỏi lớp: container đã chết còn xem log không? 4 phút.

**Slide 12. Demo 4 – Dừng và dọn.** Chốt phần demo, chuyển sang lab. 2 phút.

**Slide 13. Lab – chuẩn bị và quy ước.** Nếu cổng 8088 đã bận ở máy học viên, đó chính là tình huống 01: cho họ sang slide Break. 5 phút.

**Slide 14. Lab – L1 phần 1 đến 3.** Nhắc: Postgres in `ready to accept connections` hai lần vì có server tạm khi khởi tạo; chờ lần hai rồi mới `psql`. 25 phút.

**Slide 15. Lab – L1 phần 4: registry cục bộ.** Phần này chuẩn bị cho GHCR ở tuần CI/CD: khác ở chỗ có xác thực. 10 phút.

**Slide 16. Lab – L2 Engineering.** Gợi ý cho tình huống 01: `docker ps --filter publish=28081`; nếu không có container giữ cổng thì kiểm tra tiến trình Windows bằng `netstat -ano`. Tình huống 02: `docker logs` và `docker run --rm --entrypoint ls IMAGE -la /app`. 25 phút.

**Slide 17. Break – nhầm cổng container.** Nguyên nhân gốc: ánh xạ vào cổng 8088 trong container nhưng nginx nghe 80. Sửa: `-p 8088:80`. Dọn `docker rm -f lab08-broken`. 4 phút.

**Slide 18. Lỗi thường gặp.** Hỏi: "Push tới registry cục bộ thiếu gì thì đi nhầm Docker Hub?" (địa chỉ registry trong tên). 2 phút.

**Slide 19. Challenge.** Gợi ý: smoke test sẽ trở thành một bước trong CI ở tuần sau. Giao về nhà.

**Slide 20. Recap.** Trả lời câu hỏi ôn đầu buổi (`stop` và `rm`). Nhắc dọn container `lab08-` và nộp `lab-08/`. Buổi sau: Dockerfile. 15 phút review.

## Lưu ý riêng cho người dạy

- Cổng host của lab: 8088 (web) và 5001 (registry cục bộ). Nếu học viên báo bận cổng, đó chính là tình huống 01; hướng họ sang cách điều tra thay vì đổi cổng ngay.
- Tình huống 01 và 02 ở L2 là phần Break, Debug bắt buộc theo đề gốc. Mentor chỉ đưa triệu chứng, không đưa nguyên nhân. Chạy `setup.sh` từ thư mục gốc repo giáo trình `~/devops-course` trong WSL.
- Học viên với Docker Desktop: cổng publish ra Windows nên `ss -ltnp` trong WSL có thể không thấy; nếu `docker ps` không có container nào giữ cổng thì kiểm tra tiến trình Windows bằng `netstat -ano` trong PowerShell.
- Nhắc học viên không dán output `docker inspect` chưa lọc vào báo cáo vì có thể chứa biến môi trường nhạy cảm.
