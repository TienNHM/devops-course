# Đáp án Tuần 4 – Docker Basics

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Trang này cũng là tài liệu của mentor khi chấm. Học viên mở sau khi đã nộp bài của mình; xem trước sẽ mất phần học quan trọng nhất.
:::

> **Tóm tắt:** Đáp án Buổi 07 (container và kiến trúc Docker) và Buổi 08 (Docker CLI, registry cục bộ, hai tình huống lỗi kinh điển), kèm gợi ý giải bài tập tuần 4. Cách chấm nằm ở [Hướng dẫn chấm Tuần 4](../grading/week-04.md).

## Cách dùng trang này

Chỉ đọc sau khi bạn đã tự làm xong bài lab và bài tập của tuần. Mục đích là đối chiếu cách nghĩ và cách điều tra, không phải chép lệnh: ID container, địa chỉ IP, thời gian, digest và phiên bản kernel trên máy bạn sẽ khác trang này, và mentor chấm theo output thật của máy bạn.

Mỗi buổi có các mục: đáp án L1 theo từng Phần của bài lab, lời giải L2 (thử thách thêm), lời giải phần Phá lỗi nâng cao và những hiểu lầm hay gặp. Cuối trang là gợi ý cho bài tập tuần. Đề gốc nằm ở [Buổi 07 – Container Fundamentals](../../labs/week-04/session-07.md), [Buổi 08 – Docker CLI](../../labs/week-04/session-08.md) và [Bài tập tuần 4](../../assignments/weekly/week-04.md).

Các lệnh trong trang đã được chạy kiểm tra bằng Docker (dùng tên container và cổng riêng để không đụng bài lab). Hai điểm phụ thuộc máy học viên: cách Docker Desktop publish cổng ra Windows và lệnh `ss` trong WSL2 Ubuntu.

## Buổi 07 – Container Fundamentals

### Đáp án L1

**Chuẩn bị.** Cài Docker Desktop (chọn WSL 2), bật WSL integration cho Ubuntu. `wsl -l -v` trong PowerShell cho Ubuntu có `VERSION` bằng `2`. Làm việc trong `~/devops-labs/lab-07`, đường dẫn bắt đầu bằng `/home`, không phải `/mnt/c`. Từ đây mỗi lệnh quan trọng thêm `2>&1 | tee -a evidence/command-output.txt`.

**Phần 1 – kiểm tra cài đặt.**

- `docker version` có cả khối `Client:` và `Server:`. Nếu chỉ có Client và báo lỗi kết nối daemon, Docker Desktop chưa chạy hoặc chưa bật WSL integration cho Ubuntu (Settings, Resources, WSL integration, Apply).
- `docker info` cho `Server Version`, `Storage Driver: overlayfs` hoặc `overlay2`, `Operating System: Docker Desktop`. Nếu cắt bằng `head` thì ghi rõ trong README.
- `docker run --rm hello-world` thành công. Lần đầu có dòng `Unable to find image 'hello-world:latest' locally` rồi mới pull; lần sau image đã có sẵn nên không pull lại. `--rm` xóa container ngay khi thoát. Hai dòng `uname -r` (host và `alpine:3.20`) giống nhau, dạng `6.x.x-microsoft-standard-WSL2`.

**Phần 2 – chạy Nginx.**

```bash
docker pull nginx:1.27-alpine
docker run -d --name lab07-web -p 8081:80 \
  -v "$PWD/source/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8081
```

`docker pull` tách việc tải image khỏi việc chạy. Cờ `-p 8081:80` có dạng `HOST:CONTAINER`: 8081 là cổng bạn truy cập trên máy, 80 là cổng Nginx lắng nghe trong container. `:ro` làm mount chỉ đọc. Dùng đường dẫn tuyệt đối (`$PWD/...`) cho bind mount. `curl` phải in đúng trang có họ tên, không phải "Welcome to nginx!". `source/commands.sh` chứa đúng lệnh `docker run` đã dùng.

**Phần 3 – quan sát container.**

- `docker ps` có `0.0.0.0:8081->80/tcp`. `docker logs lab07-web` có dòng access dạng `"GET / HTTP/1.1" 200` kèm `curl/...` ở cuối: bằng chứng request của bạn tới đúng container. `docker exec lab07-web ls /usr/share/nginx/html` thấy `index.html` (file bạn mount) và `50x.html`.
- `docker exec -it lab07-web sh` rồi `cat /etc/os-release` cho thấy Alpine: container thấy hệ điều hành của image chứ không phải Ubuntu của bạn.
- `docker inspect --format '{{json .Mounts}}' lab07-web` phải có `"Mode":"ro"` và `"RW":false`.
- Chứng minh dữ liệu tạm: `docker exec lab07-web sh -c 'echo "toi la file tam" > /tmp/ghi-chu.txt && cat /tmp/ghi-chu.txt'`, `docker rm -f lab07-web`, chạy lại container (không mount), `docker exec lab07-web cat /tmp/ghi-chu.txt` báo `No such file or directory`. Container mới này không mount `index.html` nên trang là trang Nginx mặc định.

**Phần 4 – dừng, xóa, dọn.** `docker stop` dừng nhưng container vẫn nằm trong `docker ps -a` (trạng thái `Exited`). `docker rm` xóa container (cùng lớp ghi). `docker rmi` xóa image, và sẽ báo lỗi nếu còn container dùng image đó (kể cả đã dừng). Kết thúc với `docker ps -a` không còn container `lab07-`. Lệnh tự kiểm tra `grep -E -c 'Server:|Hello from Docker|"RW":false' ...` in số từ 3 trở lên.

### Lời giải L2

Đề ở [Buổi 07 – Thử thách thêm](../../labs/week-04/session-07-challenge.md).

**Thử thách 1 – kernel dùng chung.**

```bash
uname -r
docker run --rm alpine:3.20 uname -r
docker run --rm ubuntu:24.04 uname -r
```

Cả ba dòng phải giống nhau (kernel của WSL2, dạng `...-microsoft-standard-WSL2`). Giải thích: image chỉ chứa user space (thư viện, công cụ), không chứa kernel; container là process Linux dùng kernel của host, được cô lập bằng namespaces và cgroups. VM mang kernel riêng nên có thể chạy hệ điều hành khác họ. Chú ý: trong Git Bash, `uname -r` của host không phải kernel Linux, nên bài này phải làm trong terminal WSL Ubuntu như đề yêu cầu.

**Thử thách 2 – client, daemon, registry.** Ba bằng chứng thường dùng:

- `docker version`: khối `Client` và khối `Server` tách rời, chứng minh CLI và daemon là hai thành phần.
- `docker info`: dòng `Server Version`, `Operating System: Docker Desktop`, và phần `Registry` cho biết registry mặc định (Docker Hub).
- `docker pull busybox:1.36`: dòng cuối có `docker.io/library/busybox:1.36`, cho biết registry `docker.io`, namespace `library` (image chính thức).

Sơ đồ mermaid tương tự phần Kiến trúc của bài lab: CLI gọi API tới daemon, daemon pull layer từ registry và lưu vào local image store.

**Thử thách 3 – giới hạn tài nguyên.**

```bash
docker run -d --name lab07-limit --memory 64m --cpus 0.5 -p 8082:80 nginx:1.27-alpine
docker stats --no-stream lab07-limit
docker inspect --format '{{.HostConfig.Memory}}' lab07-limit
time docker run --rm alpine:3.20 true
docker rm -f lab07-limit
```

Khi kiểm tra thử: `docker stats` cho Nginx dùng khoảng 11 MiB trên giới hạn 64 MiB, `inspect` in `67108864` (64 nhân 1024 nhân 1024 byte, tức 64 MiB), và `--cpus 0.5` ghi vào cấu hình dưới dạng `500000000` NanoCPUs. `time docker run --rm alpine:3.20 true` mất khoảng hai giây trên máy kiểm thử (chủ yếu là thời gian tạo và dọn container), so với việc boot cả hệ điều hành của VM. Con số của bạn sẽ khác; điều quan trọng là bạn dùng số của mình trong ba gạch đầu dòng so sánh: RAM cấp trước (VM cấp trước cho cả OS, container dùng theo nhu cầu trong giới hạn), thời gian khởi động, mức cô lập (VM mạnh hơn vì kernel riêng).

### Phá lỗi nâng cao

**Tình huống "port is already allocated".** Cách phá: `lab07-web` đang giữ cổng 8081, chạy thêm `docker run -d --name web-b -p 8081:80 nginx:1.27-alpine`.

Cây điều tra:

1. Đọc thông báo: `Bind for 0.0.0.0:8081 failed: port is already allocated`. Lỗi nói rõ cổng host 8081.
2. `docker ps --format "table {{.Names}}\t{{.Ports}}"` cho thấy container nào đang map `8081`. Đây là thủ phạm thường gặp nhất.
3. Nếu không có container nào, kiểm tra process của host: `ss -ltnp | grep 8081` trong WSL, hoặc `netstat -ano | findstr :8081` trong PowerShell.
4. `docker ps -a` cho thấy container `web-b` ở trạng thái `Created` còn sót lại (lệnh `docker run` thất bại vẫn tạo container nhưng không start được).

Nguyên nhân gốc: một cổng host chỉ có một process lắng nghe; hai container có thể cùng nghe cổng 80 bên trong của riêng mình nhưng không thể cùng publish một cổng host. Sửa: `docker rm web-b` rồi chạy lại với cổng host khác (`-p 8083:80`). Phòng tránh: một dải cổng cho mỗi bài lab, luôn đặt `--name`, chạy `docker ps` trước khi publish cổng.

**Tình huống trùng tên container.** Lệnh `docker run --name lab07-web` lần hai báo `Conflict. The container name "/lab07-web" is already in use`. Tên container là duy nhất trong một daemon kể cả khi container đã dừng. Sửa: `docker rm -f lab07-web` hoặc đặt tên khác. Dọn sau khi thử: `docker rm -f lab07-web web-b`.

### Hiểu lầm hay gặp

- Nghĩ container là máy ảo nhỏ có kernel riêng. Thực chất là process Linux được cô lập.
- Nhầm thứ tự trong `-p`: bên trái là host, bên phải là container.
- Tin rằng dữ liệu ghi trong container sẽ còn sau khi `docker rm`. Lớp ghi bị xóa cùng container; cần volume (Buổi 12).
- Sửa file `index.html` bằng editor (hoặc `sed -i`) rồi thấy container vẫn hiển thị nội dung cũ khi mount một file đơn lẻ, vì editor thay file bằng file mới (đổi inode). Ghi đè bằng `cat > index.html` hoặc mount cả thư mục.
- Nhầm `docker rm` với `docker rmi`, hoặc cố xóa image khi còn container dùng nó.
- Dùng `latest` trong tài liệu và CI, làm kết quả không tái lập.
- Chạy lab trong `/mnt/c`, gây sai đường dẫn và sai quyền file.

## Buổi 08 – Docker CLI

### Đáp án L1

**Chuẩn bị.** Tạo `~/devops-labs/lab-08`, `docker ps -a --format '{{.Names}}' | head` chạy không lỗi. Mọi container của lab có tên bắt đầu bằng `lab08-`; cổng dùng là 8088 (web) và 5001 (registry).

**Phần 1 – chạy và kiểm tra container.**

```bash
docker run -d --name lab08-web -p 8088:80 nginx:1.27-alpine
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8088
```

Kết quả `200`. `docker ps` phải có `0.0.0.0:8088->80/tcp` (bản Docker mới in thêm dòng IPv6 `[::]:8088`). Với log: `docker logs -f --tail 5 lab08-web` rồi tạo request ở terminal khác, mỗi lần thêm một dòng `GET / HTTP/1.1" 200`; `Ctrl+C` thoát mà container vẫn chạy. `docker exec -it lab08-web sh` rồi `ps` cho thấy `nginx: master process` ở PID 1; thoát shell không làm container dừng vì shell chỉ là tiến trình phụ do `exec` tạo. `docker inspect --format 'status={{.State.Status}} started={{.State.StartedAt}} ip=...' lab08-web` in `status=running`, thời điểm bắt đầu và IP nội bộ kiểu `172.17.0.x`.

**Phần 2 – dừng, chạy lại, xóa.**

```bash
docker stop lab08-web
docker inspect --format 'exit={{.State.ExitCode}} {{.State.Status}}' lab08-web
docker start lab08-web
docker rm lab08-web 2>&1 | tee -a evidence/command-output.txt
docker rm -f lab08-web 2>&1 | tee -a evidence/command-output.txt
```

Sau `docker stop`: `docker ps -a` hiện `Exited (0)`, và `exit=0 exited`, vì Nginx nhận SIGTERM và thoát êm. Nếu bạn thấy `137` thì container bị SIGKILL do không thoát trong 10 giây; nên giải thích nguyên nhân. Lệnh `docker rm` đầu báo `cannot remove container "lab08-web": container is running: stop the container before removing or force remove`. Docker từ chối để tránh làm mất dịch vụ ngoài ý muốn; `-f` là hành động có chủ đích. Dòng lỗi này phải nằm trong evidence, nên cả hai lệnh đều cần `tee -a`. Container dùng một lần: `docker run --rm --name lab08-once alpine:3.20 echo "xin chao CLB"` in dòng chữ, rồi `docker ps -a --filter name=lab08-once` chỉ còn dòng tiêu đề.

**Phần 3 – biến môi trường và container thoát ngay.**

```bash
docker run -d --name lab08-pg postgres:17-alpine
docker ps -a --filter name=lab08-pg
docker inspect --format 'exit={{.State.ExitCode}}' lab08-pg
docker logs lab08-pg 2>&1 | head -4
```

Kết quả: `Exited (1)`, `exit=1`, và log có `Error: Database is uninitialized and superuser password is not specified.` Nguyên nhân gốc được xác minh từ log, không đoán: image Postgres từ chối khởi tạo cơ sở dữ liệu khi thiếu `POSTGRES_PASSWORD`. Sau đó:

```bash
docker rm lab08-pg
docker run -d --name lab08-pg -e POSTGRES_PASSWORD=lab_only_password -e POSTGRES_DB=club postgres:17-alpine
until [ "$(docker logs lab08-pg 2>&1 | grep -c 'ready to accept connections')" -ge 2 ]; do sleep 1; done
docker exec lab08-pg pg_isready -U postgres
docker exec lab08-pg psql -U postgres -d club -c "SELECT version();"
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' lab08-pg | grep POSTGRES_DB
```

Mong đợi `accepting connections`, một dòng phiên bản PostgreSQL 17, và `POSTGRES_DB=club`. Evidence không được chứa dòng `POSTGRES_PASSWORD=...` từ `inspect` chưa lọc. Dọn bằng `docker rm -f lab08-pg`.

**Phần 4 – tag và push lên registry cục bộ.**

```bash
docker run -d --name lab08-registry -p 5001:5000 registry:2.8.3
curl -s http://localhost:5001/v2/_catalog
docker tag nginx:1.27-alpine localhost:5001/club/nginx:1.27-alpine
docker push localhost:5001/club/nginx:1.27-alpine
curl -s http://localhost:5001/v2/_catalog
curl -s http://localhost:5001/v2/club/nginx/tags/list
```

Cần thấy `{"repositories":[]}` trước khi push, rồi `{"repositories":["club/nginx"]}` và `{"name":"club/nginx","tags":["1.27-alpine"]}` sau khi push, cùng dòng `digest: sha256:...`. `docker tag` chỉ tạo thêm một tên trỏ cùng image; phần `localhost:5001/` quyết định nơi push. Docker mới có thể in thêm dòng thông tin về multi-platform khi push; không ảnh hưởng kết quả. Dọn: `docker rm -fv lab08-registry` (cờ `-v` xóa volume ẩn của registry), `docker image rm localhost:5001/club/nginx:1.27-alpine`; rồi `docker ps -a --filter name=lab08-` chỉ còn dòng tiêu đề.

### Lời giải L2

Đề ở [Buổi 08 – Thử thách thêm](../../labs/week-04/session-08-challenge.md).

**Thử thách 1 – xung đột cổng (tình huống 01).** Cách tiếp cận: không sửa lệnh `docker run` trước khi hiểu chuyện gì đang xảy ra.

1. Tìm ai giữ cổng: `docker ps --filter publish=28081 --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'` cho `ts01-legacy-site` từ `nginx:1.27-alpine`.
2. Nhận ra lệnh thất bại để lại container `ts01-web` ở trạng thái `Created`: `docker ps -a --filter name=ts01-web`. Phải `docker rm ts01-web` trước khi dùng lại tên.
3. Chạy trang của bạn trên cổng khác: `docker run -d --name ts01-web -p 28091:80 nginx:1.27-alpine`, rồi `curl` kiểm tra mã 200.

Vì sao đổi cổng thay vì xóa container cũ: container cũ có thể là của người khác. Chỉ `docker stop` hoặc `docker rm` sau khi xác nhận với chủ của nó. Nếu `docker ps` không có container nào giữ cổng thì mới kiểm tra process Windows bằng `netstat -ano`; với Docker Desktop, cổng publish có thể không hiện trong `ss` ở WSL. Báo cáo 5 mục: triệu chứng (lỗi `port is already allocated` và trang cũ vẫn hiện), nguyên nhân gốc (một cổng host chỉ gán cho một tiến trình), cách xác minh (output của `docker ps --filter publish=...`), giải pháp (đổi cổng và dọn container `Created`), phòng tránh (đặt tên, `docker ps` trước khi chạy, ghi cổng vào tài liệu hoặc `.env`). Dọn: `bash examples/troubleshooting/scenario-01/cleanup.sh` (script này cũng xóa `ts01-web`).

**Thử thách 2 – container thoát ngay (tình huống 02).** Cây điều tra:

1. `docker ps` trống; `docker ps -a` cho `Exited (1)`; `docker inspect --format 'exit={{.State.ExitCode}}' ts02-notes` cho `exit=1`.
2. `docker logs ts02-notes` có `Error: Cannot find module '/app/src/server.js'`.
3. Soi bên trong image mà không chạy ứng dụng: `docker run --rm --entrypoint ls ts02-notes:broken -la /app`. Chỉ có `server.js` và `package.json`, không có thư mục `src`.
4. Đối chiếu Dockerfile: `COPY package.json server.js ./` nhưng `CMD ["node", "src/server.js"]`.

Sửa dòng cuối thành `CMD ["node", "server.js"]`, build lại và chạy:

```bash
docker rm -f ts02-notes
docker build -t ts02-notes:fixed examples/troubleshooting/scenario-02
docker run -d --name ts02-notes -p 28082:3000 ts02-notes:fixed
curl http://localhost:28082
```

Kết quả `{"status":"healthy","service":"club-notes"}`. Cách khác cũng đúng: giữ `CMD` và sửa `COPY` để đưa `server.js` vào `src/`. Phòng tránh: smoke test sau khi build (chạy container một lần, kiểm tra log và `curl`) và đưa bước đó vào CI. Dọn: `bash examples/troubleshooting/scenario-02/cleanup.sh` rồi `docker rmi ts02-notes:fixed`.

**Thử thách 3 – smoke test và checklist chẩn đoán.** Checklist 3 bước mẫu cho container thoát ngay: (1) `docker ps -a` xem trạng thái và ExitCode; (2) `docker logs TÊN` đọc lỗi của PID 1; (3) `docker inspect --format ...` xem `Config.Cmd` hoặc `Config.Env` (lọc đúng dòng cần, không lộ mật khẩu). Lấy ExitCode và biến mà không lộ mật khẩu: `docker inspect --format 'exit={{.State.ExitCode}}' lab08-pg` và `docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' lab08-pg | grep POSTGRES_DB`. Một smoke test tối thiểu để đưa vào `commands.sh` (chỉ là gợi ý):

```bash
docker run -d --name lab08-smoke -p 28099:80 nginx:1.27-alpine
sleep 2
docker ps --filter name=lab08-smoke --format '{{.Status}}'
docker logs lab08-smoke 2>&1 | tail -n 3
curl -fsS http://localhost:28099 > /dev/null && echo "SMOKE OK" || echo "SMOKE FAIL"
docker rm -f lab08-smoke
```

**Lệnh bổ sung và pull lại từ registry cục bộ.** `docker port lab08-web` in `80/tcp -> 0.0.0.0:8088` (bản Docker mới có thể in thêm dòng `[::]:8088`); `docker stats --no-stream lab08-web` in bảng CPU và RAM rất nhỏ. Với registry cục bộ ở Phần 4, xóa bản cục bộ rồi pull lại:

```bash
docker image rm localhost:5001/club/nginx:1.27-alpine
docker pull localhost:5001/club/nginx:1.27-alpine
docker images --filter reference='localhost:5001/*'
```

Pull thành công từ registry cục bộ, image xuất hiện lại. Đây là điểm cộng khi chấm, không bắt buộc.

### Phá lỗi nâng cao: nhầm cổng container

```bash
docker run -d --name lab08-broken -p 8088:8088 nginx:1.27-alpine
curl -sS --max-time 3 http://localhost:8088 || echo "FAILED"
```

Triệu chứng: container `Up` nhưng `curl` báo `Empty reply from server` (`curl: (52)`); tùy hệ thống có thể là `Connection reset by peer`. Cây điều tra:

1. `docker ps` cho `Up`: tiến trình sống, vấn đề ở mạng.
2. `docker logs lab08-broken`: không có lỗi vì Nginx hoạt động bình thường, chỉ chưa nhận được request nào.
3. `docker port lab08-broken` cho `8088/tcp -> 0.0.0.0:8088`: Docker chuyển tiếp vào cổng 8088 của container.
4. `docker exec lab08-broken netstat -ltn` cho thấy Nginx nghe `0.0.0.0:80`, không phải 8088.

Nguyên nhân gốc: ánh xạ cổng trỏ vào một cổng mà ứng dụng không nghe. Sửa bằng `-p 8088:80`. Phòng tránh: đọc tài liệu image để biết cổng ứng dụng, kiểm tra bằng `docker exec ... netstat -ltn` và luôn `curl` sau khi chạy. Dọn: `docker rm -f lab08-broken`. Hai tình huống 01 và 02 ở L2 cũng là phần "Break, Debug" bắt buộc theo đề tuần.

### Hiểu lầm hay gặp

- Thấy `docker ps` trống rồi kết luận container chưa được tạo. `docker ps` chỉ liệt kê container đang chạy; dùng `docker ps -a`.
- Quên `-d` nên terminal bị chiếm và tưởng container treo.
- Nghĩ `docker exec` rồi `exit` làm container dừng. Container sống theo PID 1.
- Dán nguyên `docker inspect` của container có biến mật khẩu vào báo cáo; phải lọc bằng `--format`.
- Tin rằng `docker logs` mất khi container thoát. Log chỉ mất khi container bị xóa.
- Với Postgres: chạy `psql` ngay khi log mới có một dòng `ready to accept connections`. Image khởi động một server tạm rồi khởi động lại server thật, nên cần đợi dòng đó xuất hiện hai lần (vòng `until` trong bài lab).
- `docker push ten-ban/club-api:1.0.0` không đi tới registry cục bộ vì thiếu địa chỉ registry. Docker hiểu là Docker Hub (lệnh nhắm tới `docker.io/ten-ban/club-api`). Phải `docker tag` sang `localhost:5001/ten-ban/club-api:1.0.0` rồi push.
- Xóa hoặc dừng container của người khác khi chưa kiểm tra chủ sở hữu.

## Bài tập tuần

Đề: [Bài tập tuần 4](../../assignments/weekly/week-04.md). Dưới đây là gợi ý lời giải năm nhiệm vụ L1, L2 và đáp án 5 câu hỏi kiểm tra.

### Nhiệm vụ 1 – Môi trường Docker

```bash
cd ~/devops-labs/lab-07
docker version 2>&1 | tee -a evidence/command-output.txt
docker info 2>&1 | head -30 | tee -a evidence/command-output.txt
docker run --rm hello-world 2>&1 | tee -a evidence/command-output.txt
uname -r | tee -a evidence/command-output.txt
docker run --rm alpine:3.20 uname -r | tee -a evidence/command-output.txt
```

Hai dòng `uname -r` giống nhau. Giải thích 2 đến 3 câu: container chỉ là process của kernel Linux host (kernel WSL2), image Alpine chỉ cung cấp user space. Lưu ý `docker info` bị cắt bằng `head` thì ghi rõ trong README.

### Nhiệm vụ 2 – Nginx, port mapping, bind mount

Làm Phần 2 và 3 của Buổi 07 (container `lab07-web`), rồi thu thập bằng chứng:

```bash
curl -s http://localhost:8081 | tee -a evidence/command-output.txt
docker logs lab07-web 2>&1 | tee -a evidence/command-output.txt
docker exec lab07-web ls /usr/share/nginx/html | tee -a evidence/command-output.txt
docker inspect --format '{{json .Mounts}}' lab07-web | tee -a evidence/command-output.txt
```

Phần Mounts phải có `"Mode":"ro"` và `"RW":false`. Chứng minh dữ liệu tạm như Bước 3.4 của Buổi 07. `commands.sh` chứa đúng lệnh `docker run` đã dùng.

### Nhiệm vụ 3 – Vòng đời và `docker inspect`

Chuỗi cần có trong evidence theo thứ tự (Phần 1 và 2 của Buổi 08): `run`, `inspect` (`running`), `curl` 200, `stop`, `inspect` (`exited`, `exit=0`), `docker ps -a` (`Exited (0)`), `start`, `curl` 200, `docker rm` lỗi, `docker rm -f`, rồi container `--rm`:

```bash
docker run --rm --name lab08-once alpine:3.20 echo "xin chao CLB"
docker ps -a --filter name=lab08-once
```

Lệnh đầu in dòng chữ, lệnh sau chỉ còn dòng tiêu đề. README giải thích: `stop` dừng và giữ container, `rm` xóa container, `image rm` xóa image (và bị từ chối nếu còn container dùng).

### Nhiệm vụ 4 – Biến môi trường và container thoát ngay

Làm Phần 3 của Buổi 08 (lần thất bại rồi lần thành công, `inspect` đã lọc). Evidence cần: `Exited (1)`, dòng lỗi của log, `accepting connections`, kết quả `SELECT`, và không có dòng `POSTGRES_PASSWORD=...`. README nêu nguyên nhân gốc (thiếu `POSTGRES_PASSWORD`) và cách xác minh (đọc log).

### Nhiệm vụ 5 – Registry cục bộ

Làm Phần 4 của Buổi 08. Evidence cần có dòng `digest: sha256:...` của lần `push`, hai lệnh `curl` vào registry và `docker ps -a --filter name=lab0` chỉ còn dòng tiêu đề sau khi dọn. Nếu học viên làm thêm bước xóa bản cục bộ rồi pull lại (xem Lời giải L2 của Buổi 08) thì cộng điểm thưởng, không bắt buộc.

### Nhiệm vụ L2

- **Thử thách 1 và 2.** Xem lời giải L2 của Buổi 08. Báo cáo 5 mục phải dùng output thật của học viên.
- **Thử thách 3.** Xem Thử thách 3 của Buổi 07. Với tên container `lab07-limit`, quy đổi 67108864 byte chia cho 1048576 bằng 64 MiB. Số đo RAM và thời gian là của máy học viên; không chấp nhận số chép từ tài liệu.

### Đáp án 5 câu hỏi kiểm tra

1. VM có kernel riêng chạy trên hypervisor, cô lập mạnh; container dùng chung kernel của host và chỉ được cô lập bằng namespaces và cgroups. `uname -r` trong Alpine và trên host WSL giống nhau vì container không có kernel riêng, image chỉ có user space.
2. Cổng 9000 trên máy bạn được chuyển tiếp vào cổng 80 trong container, nơi Nginx lắng nghe. Nếu viết `-p 9000:9000` thì container `Up` nhưng Nginx nghe cổng 80, nên `curl` báo `Empty reply from server` hoặc connection reset. Kiểm tra bằng `docker port` (thấy cổng 9000 được ánh xạ) và `docker exec TÊN netstat -ltn` (thấy Nginx nghe `0.0.0.0:80`).
3. Ba lệnh theo thứ tự: `docker ps -a` (xem trạng thái và `Exited` kèm mã), `docker logs api` (xem lỗi của tiến trình chính), rồi `docker inspect api` (xem `State`, `Config.Cmd`, `Config.Env`) hoặc `docker run --rm --entrypoint sh -it club-api:1.0.0` để soi bên trong image.
4. Dữ liệu ghi trong container nằm ở lớp ghi tạm và bị xóa cùng container khi `docker rm`. Dừng rồi `start` lại thì dữ liệu còn. Cách khắc phục cho database là volume (hoặc bind mount); sẽ học ở Buổi 12.
5. Tên image phải chứa địa chỉ registry; không có thì Docker hiểu là Docker Hub. Cần `docker tag ten-ban/club-api:1.0.0 localhost:5001/ten-ban/club-api:1.0.0` rồi push tên mới. Không dùng `latest` vì nó trỏ tới nội dung khác nhau theo thời điểm pull nên kết quả không tái lập và khó truy vết lỗi.
