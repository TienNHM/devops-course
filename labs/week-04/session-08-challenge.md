# Buổi 08 – Thử thách thêm và phá lỗi nâng cao

> **Tóm tắt:** Trang tùy chọn của Buổi 08: hai tình huống dựng sẵn (cổng bận, container thoát ngay), thử thách smoke test, các lệnh bổ sung và bài phá lỗi nhầm cổng. Làm ở nhà sau khi xong lab bắt buộc.

Quay lại bài chính: [Buổi 08 – Docker CLI](session-08.md). Lời giải đầy đủ nằm ở [Walkthrough tuần 4](../../mentors/walkthroughs/week-04.md), chỉ mở sau khi nộp bài.

::: warning Tự thử 15 phút trước khi mở gợi ý
Gợi ý xếp từng bậc, từ nhẹ tới rõ. Mentor chỉ đưa triệu chứng; bạn phải tự tìm nguyên nhân gốc.
:::

## Thử thách 1. Giải quyết xung đột cổng (tình huống 01)

Clone repo giáo trình vào `~/devops-course` trong WSL (xem [Tài khoản GitHub và repo devops-labs](../../resources/setup-github.md)) rồi chạy từ thư mục gốc repo đó:

```bash
cd ~/devops-course
bash examples/troubleshooting/scenario-01/setup.sh
```

Sau đó làm theo [tình huống 01](../../examples/troubleshooting/scenario-01/README.md).

Tiêu chí hoàn thành:

- [ ] Chỉ ra bằng lệnh ai đang giữ cổng 28081 (container nào, image nào).
- [ ] Chạy được trang của bạn trên một cổng khác mà không xóa trang đang chạy của người khác khi chưa kiểm tra.
- [ ] Viết báo cáo 5 mục (triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh) trong `report.md`.

::: details Gợi ý bậc 1
Lệnh nào liệt kê container kèm cột cổng? Hãy lọc theo cổng đang bị tranh chấp.
:::

::: details Gợi ý bậc 2
`docker ps` với `--filter publish=PORT` trả lời nhanh. Lệnh `docker run` thất bại có thể để lại một container ở trạng thái `Created`; nó chiếm tên, nên phải dọn trước khi dùng lại tên đó.
:::

::: details Gợi ý bậc 3
Với Docker Desktop, cổng được publish ra Windows nên `ss -ltnp` trong WSL có thể không thấy; nếu `docker ps` không có container nào giữ cổng thì kiểm tra tiến trình Windows bằng `netstat -ano` trong PowerShell. Có hai cách xử lý: đổi cổng host của bạn (an toàn nhất) hoặc dừng container cũ khi bạn chắc chắn nó vô chủ. Dọn dẹp sau cùng bằng `bash examples/troubleshooting/scenario-01/cleanup.sh` (script này cũng xóa `ts01-web`).
:::

## Thử thách 2. Container thoát ngay (tình huống 02)

```bash
cd ~/devops-course
bash examples/troubleshooting/scenario-02/setup.sh
```

Script build image `ts02-notes:broken`; rồi làm theo [tình huống 02](../../examples/troubleshooting/scenario-02/README.md).

Tiêu chí hoàn thành:

- [ ] Lấy được ExitCode và log của container đã thoát.
- [ ] Xác định nguyên nhân gốc bằng cách soi bên trong image mà không cần chạy ứng dụng.
- [ ] Sửa và chạy lại để `curl http://localhost:28082` trả JSON.
- [ ] `report.md` ghi rõ file nào, dòng nào đã đổi và cách phát hiện sớm lỗi này.

::: details Gợi ý bậc 1
Bộ ba chẩn đoán quen thuộc: `docker ps -a`, `docker logs ts02-notes`, `docker inspect`.
:::

::: details Gợi ý bậc 2
Hai lệnh giúp bạn: `docker logs ts02-notes` và `docker run --rm --entrypoint ls ts02-notes:broken -la /app`. So sánh đường dẫn trong thông báo lỗi với những gì thực sự có trong `/app`.
:::

::: details Gợi ý bậc 3
Đối chiếu dòng `COPY` với dòng `CMD` trong Dockerfile của tình huống. Dọn dẹp sau cùng bằng `bash examples/troubleshooting/scenario-02/cleanup.sh` rồi `docker rmi ts02-notes:fixed`. Phòng tránh: sau khi build luôn chạy thử một lần (smoke test) và xem log trước khi giao image; thêm bước đó vào CI.
:::

## Thử thách 3. Smoke test và checklist chẩn đoán

- Chạy lại Postgres của Phần 3 (không truyền `POSTGRES_PASSWORD`) và tự viết checklist 3 bước chẩn đoán container thoát ngay.
- Dùng `docker inspect --format` lấy `ExitCode` và `Config.Env` (chỉ dòng `POSTGRES_DB`) mà không lộ mật khẩu.
- Đưa lệnh smoke test (chạy thử rồi xem log) vào `commands.sh` trong thư mục `source/`; smoke test sẽ trở thành một bước trong CI ở tuần sau.

## Lệnh bổ sung và pull lại từ registry cục bộ

Các bước này không bắt buộc ở L1 để giữ số lệnh vừa sức, nhưng hữu ích.

```bash
docker run -d --name lab08-web -p 8088:80 nginx:1.27-alpine
docker port lab08-web
docker stats --no-stream lab08-web
docker rm -f lab08-web
```

Kết quả mong đợi: `docker port` in `80/tcp -> 0.0.0.0:8088` (bản Docker mới có thể in thêm dòng `[::]:8088` cho IPv6) và `docker stats` in bảng CPU/MEM rất nhỏ.

Với registry cục bộ ở Phần 4 (chạy lại `lab08-registry` nếu đã xóa), thử xóa bản cục bộ rồi pull lại từ registry của bạn:

```bash
docker image rm localhost:5001/club/nginx:1.27-alpine
docker pull localhost:5001/club/nginx:1.27-alpine
docker images --filter reference='localhost:5001/*'
```

Kết quả mong đợi: pull thành công từ registry cục bộ, image xuất hiện lại. Dọn dẹp: `docker rm -fv lab08-registry` rồi `docker image rm localhost:5001/club/nginx:1.27-alpine`.

## Phá lỗi nâng cao: nhầm cổng container

Cách phá (container vẫn `Up` nhưng không truy cập được):

```bash
docker run -d --name lab08-broken -p 8088:8088 nginx:1.27-alpine
docker ps --filter name=lab08-broken
curl -sS --max-time 3 http://localhost:8088 || echo "FAILED"
```

Triệu chứng: container ở trạng thái `Up`, nhưng `curl` báo `Recv failure: Connection reset by peer` hoặc `Empty reply from server`, in thêm `FAILED`.

Hướng điều tra theo bước:

1. Container có chạy không? `docker ps` cho `Up`: tiến trình sống, vấn đề nằm ở mạng.
2. Log có gì lạ không? `docker logs lab08-broken`: không có lỗi, vì Nginx hoạt động bình thường.
3. Ánh xạ cổng thế nào? `docker port lab08-broken` cho `8088/tcp -> 0.0.0.0:8088`: cổng container được khai báo là 8088.
4. Tiến trình thực sự nghe cổng nào? `docker exec lab08-broken netstat -ltn` (busybox) cho thấy `0.0.0.0:80`.

Nguyên nhân gốc: Docker chuyển tiếp cổng host 8088 vào cổng 8088 của container, trong khi Nginx nghe cổng 80. Sửa bằng `-p 8088:80`. Phòng tránh: đọc tài liệu image để biết cổng ứng dụng nghe, kiểm tra bằng `docker exec ... netstat`, và luôn kiểm thử bằng `curl` sau khi chạy. Dọn dẹp: `docker rm -f lab08-broken`. Tổng quan thêm về các tình huống dựng sẵn ở [Troubleshooting examples](../../examples/troubleshooting/README.md).

## Đọc thêm: câu hỏi nhanh

- Gõ `docker exec -it web sh` rồi `exit`, container có dừng không? Không: shell là tiến trình phụ do `exec` tạo; container sống theo PID 1.
- Vì sao không nên dùng tag `latest` trong bài cần tái lập? Vì `latest` trỏ tới phiên bản mới nhất tại thời điểm pull, nên hai người ở hai thời điểm có thể nhận hai image khác nhau, kết quả không tái lập và lỗi khó truy vết.

## Tài liệu tham khảo

- [docker run – Docker CLI reference](https://docs.docker.com/reference/cli/docker/container/run/)
- [docker container logs](https://docs.docker.com/reference/cli/docker/container/logs/)
- [docker container exec](https://docs.docker.com/reference/cli/docker/container/exec/)
- [docker inspect](https://docs.docker.com/reference/cli/docker/inspect/)
- [docker image push](https://docs.docker.com/reference/cli/docker/image/push/)
- [Publishing and exposing ports](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/)
