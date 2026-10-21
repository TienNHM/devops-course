# Buổi 14 – Production-minded Compose

Tuần 7 · Giai đoạn 2 – Containerization · Slide: [Slide buổi 14](../../slides/03-compose/session-14.md)

> **Tóm tắt:** Nâng compose.yaml từ mức chạy được lên mức đáng tin cậy: healthcheck, thứ tự khởi động, restart, giới hạn tài nguyên, secrets, logging, backup và restore.

## Mục tiêu học tập

- Giải thích vì sao `depends_on` thường không đủ và `condition: service_healthy` giải quyết điều gì.
- Viết được healthcheck cho backend và frontend, chọn đúng `interval`, `timeout`, `retries`, `start_period`.
- Chọn được restart policy phù hợp và kiểm chứng bằng cách làm một container thoát bất thường.
- Cấu hình được resource limits và log rotation, rồi kiểm tra bằng `docker stats` và `docker inspect`.
- Chẩn đoán được lỗi "API chạy nhưng database chưa sẵn sàng" từ `docker compose ps`, `logs` và endpoint `/ready`.
- Thực hiện được backup bằng `pg_dump` và restore vào một database mới, rồi chứng minh dữ liệu còn nguyên.

## Điều kiện cần

- Đã hoàn thành buổi 13: chạy được `starter-project` bằng `docker compose up -d --build`.
- Docker Desktop (WSL2 backend) đang chạy; làm việc trong filesystem của WSL (ví dụ `~/devops-labs/lab-14`), không dùng `/mnt/c`.
- Cổng 8080 (hoặc `WEB_PORT` bạn đặt) và 3000 còn trống.

Kiểm tra nhanh:

```bash
docker --version
docker compose version
docker ps
```

Kết quả mong đợi (rút gọn): Docker 27 trở lên, Compose v2 (`Docker Compose version v2.x.x`), `docker ps` chạy không báo lỗi.

Chuẩn bị thư mục làm việc:

```bash
mkdir -p ~/devops-labs/lab-14 && cd ~/devops-labs/lab-14
cp -r ~/devops-course/starter-project source
cd source
cp .env.example .env
```

Nếu bạn clone giáo trình ở đường dẫn khác, sửa lại `~/devops-course` (trong WSL). File `.env` không được commit. Lưu ý: `lab-13/source` và `lab-14/source` đều có tên thư mục `source` nên cùng tên project Compose (`source`). Hãy chạy `docker compose down` trong `lab-13/source` trước khi bắt đầu để hai lab không dẫm lên container và volume của nhau.

## Vấn đề thực tế

Một buổi sinh hoạt CLB, bạn demo hệ thống quản lý thành viên trên laptop. Bạn chạy `docker compose up -d`, mở trình duyệt ngay lập tức và thấy lỗi 500 vì Postgres còn đang khởi tạo. Chạy lại lần hai thì được. Đến tối máy khởi động lại, container API chết và không tự dậy. Vài tuần sau, thư mục log của Docker chiếm hàng GB. Không có lỗi nào trong số này nằm ở code ứng dụng; chúng nằm ở cách vận hành.

Production-minded Compose không có nghĩa là đưa Compose lên production lớn. Nó có nghĩa là tập thói quen: hệ thống tự cho biết khi nào nó sẵn sàng, tự hồi phục khi lỗi vặt, không ăn hết tài nguyên máy, không để lộ mật khẩu và có đường quay lại khi mất dữ liệu. Những thói quen này chuyển nguyên sang Kubernetes ở Tuần 11 (probe, resource requests/limits, Secret, PVC).

## Khái niệm cốt lõi

### Container "started" khác với service "ready"

Docker chỉ biết tiến trình chính (PID 1) của container có đang chạy hay không. Postgres có thể đã chạy nhưng chưa nhận kết nối vì đang khởi tạo cluster và chạy `init.sql`. Healthcheck là một lệnh Docker chạy định kỳ bên trong container; exit code 0 là healthy, 1 là unhealthy.

| Trạng thái | Ý nghĩa |
| --- | --- |
| `starting` | Đang trong `start_period` hoặc chưa có lần check thành công đầu tiên |
| `healthy` | Lệnh check gần nhất thành công |
| `unhealthy` | Lệnh check thất bại liên tiếp đủ `retries` lần |

Các tham số của `healthcheck`:

| Khóa | Ý nghĩa | Gợi ý cho lab |
| --- | --- | --- |
| `test` | Lệnh kiểm tra; dạng `["CMD", ...]` hoặc `["CMD-SHELL", "..."]` | xem bên dưới |
| `interval` | Khoảng cách giữa hai lần check | 5s đến 10s |
| `timeout` | Quá thời gian này thì tính là một lần thất bại | 3s |
| `retries` | Số lần thất bại liên tiếp trước khi `unhealthy` | 3 đến 5 |
| `start_period` | Thời gian khởi động: lỗi trong khoảng này chưa bị tính vào `retries` | 10s đến 30s |

### depends_on với condition

| Cú pháp | Compose chờ điều gì |
| --- | --- |
| `depends_on: [postgres]` | Container `postgres` đã được tạo/khởi động; không chờ ready |
| `condition: service_started` | Giống dạng ngắn |
| `condition: service_healthy` | Healthcheck của dependency đã `healthy` |
| `condition: service_completed_successfully` | Dependency (job một lần) đã thoát với exit code 0 |

Lưu ý: `depends_on` chỉ tác động lúc `docker compose up`. Nếu Postgres khởi động lại giữa chừng, Compose không khởi động lại API. Vì vậy ứng dụng vẫn phải chịu được việc mất kết nối tạm thời (retry, endpoint `/ready`).

### Restart policy

| Policy | Hành vi |
| --- | --- |
| `no` | Không tự khởi động lại (mặc định) |
| `on-failure` | Chỉ khởi động lại khi exit code khác 0 (có thể giới hạn số lần: `on-failure:3`) |
| `always` | Luôn khởi động lại, kể cả sau khi daemon khởi động lại; vẫn chạy lại nếu bạn đã `docker stop` rồi daemon restart |
| `unless-stopped` | Như `always`, nhưng nếu bạn chủ động dừng thì không tự dậy lại |

Restart policy không thay thế healthcheck: container `unhealthy` vẫn chạy, Docker Engine không tự restart nó chỉ vì unhealthy. Restart chỉ xảy ra khi tiến trình thoát.

### Resource limits

Không đặt giới hạn thì một container rò bộ nhớ có thể kéo sập cả WSL2. Trong Compose v2, `deploy.resources.limits` được áp dụng cho `docker compose up` thông thường:

```yaml
deploy:
  resources:
    limits:
      cpus: "0.50"
      memory: 256M
```

Vượt giới hạn CPU thì tiến trình bị làm chậm (throttle); vượt giới hạn memory thì kernel kết thúc tiến trình (OOM kill, exit code 137).

### Secrets và cấu hình nhạy cảm

| Cách | Ưu điểm | Nhược điểm |
| --- | --- | --- |
| `environment` ghi cứng trong YAML | Đơn giản | Mật khẩu nằm trong Git; không chấp nhận được |
| Biến lấy từ `.env` | Đủ cho lab, không commit `.env` | Hiện trong `docker inspect` và `docker compose config` |
| Compose `secrets` (file) | Mật khẩu mount thành file `/run/secrets/ten_secret`, không nằm trong biến môi trường | Ứng dụng phải biết đọc file |

Image `postgres` hỗ trợ biến `POSTGRES_PASSWORD_FILE`. Backend của `starter-project` hiện đọc `DB_PASSWORD` từ biến môi trường, nên trong buổi này bạn áp dụng secrets cho Postgres và thảo luận cách mở rộng cho backend ở thử thách L2.

### Logging

Mặc định driver `json-file` ghi log không giới hạn. Hãy bật rotation:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

Mỗi container tối đa khoảng 30 MB log. Log ứng dụng nên ghi ra stdout/stderr để `docker compose logs` đọc được.

### Backup và restore

Volume không phải là backup: xóa nhầm volume hoặc hỏng đĩa thì mất hết. Với PostgreSQL, `pg_dump` tạo bản dump logic (file SQL) nhất quán trong khi database đang chạy; `psql` nạp lại bản dump đó.

## Kiến trúc và cách hoạt động

```mermaid
flowchart LR
    U[Browser] --> F[frontend]
    F -->|/api/| B[backend]
    B --> P[(postgres)]
    P --- V[(volume postgres-data)]
    B -. wait healthy .-> P
    F -. wait healthy .-> B
```

Chuỗi khởi động sau khi áp dụng bài lab:

```mermaid
sequenceDiagram
    participant C as Compose
    participant P as postgres
    participant B as backend
    participant F as frontend
    C->>P: start
    loop moi 5s
        C->>P: pg_isready
    end
    P-->>C: healthy
    C->>B: start
    loop moi 10s
        C->>B: wget /health
    end
    B-->>C: healthy
    C->>F: start
```

Giải thích từng bước:

1. Compose tạo network và volume, khởi động `postgres` trước vì cả hai service kia (trực tiếp hoặc gián tiếp) phụ thuộc vào nó.
2. Docker chạy `pg_isready` mỗi 5 giây (trong `compose.yaml` gốc là `retries: 5`, chưa có `start_period`; bạn có thể thêm `start_period` cho postgres nếu muốn). Lưu ý: `pg_isready` có thể báo sẵn sàng sớm khi server tạm thời của bước khởi tạo đã nhận kết nối qua socket, nên sau `down -v` hãy chờ vài giây trước khi truy vấn.
3. Khi `healthy`, Compose khởi động `backend`. Backend có healthcheck riêng gọi `/health`.
4. Khi backend `healthy`, Compose mới khởi động `frontend`, nên người dùng không bao giờ thấy trang web trỏ vào API chưa chạy.
5. Nếu một container thoát bất thường, restart policy khởi động lại nó; Compose không chạy lại các service phụ thuộc.

## Demo của mentor

Mục tiêu: cho lớp thấy sự khác nhau giữa "started" và "ready". Dùng `starter-project` nguyên bản (chưa sửa).

1. Mở hai terminal WSL. Ở terminal B, theo dõi trạng thái; ở terminal A, dọn môi trường và chạy lại từ đầu:

   ```bash
   # Terminal B
   cd ~/devops-labs/lab-14/source
   watch -n 1 docker compose ps
   ```

   ```bash
   # Terminal A
   cd ~/devops-labs/lab-14/source
   docker compose down -v
   docker compose up -d --build
   ```

   Kết quả mong đợi (rút gọn): ở terminal B, `postgres` hiện `Up ... (health: starting)` trong vài giây đầu, `backend` và `frontend` chưa xuất hiện (hoặc `Created`) vì backend chờ postgres healthy. Lệnh `up -d` ở terminal A cũng chỉ trả về sau khi postgres healthy và backend đã được start. Nếu chạy `docker compose ps` ngay sau `up -d` trong cùng một terminal, bạn sẽ thấy mọi thứ đã `Up`, nên cần terminal thứ hai để quan sát khoảng chờ.

   Câu hỏi cho lớp: "Vì sao backend chưa chạy dù ta không viết sleep ở đâu cả?"

2. Khi `up -d` đã xong, xem lại ở terminal A (dừng `watch` bằng `Ctrl+C`):

   ```bash
   docker compose ps
   ```

   Kết quả mong đợi: `postgres` `(healthy)`, `backend` và `frontend` `Up`.

3. Xem cấu hình healthcheck thật sự Docker đang dùng:

   ```bash
   docker inspect --format '{{json .State.Health}}' $(docker compose ps -q postgres)
   ```

   Kết quả mong đợi: JSON có `"Status":"healthy"` và danh sách `Log` các lần chạy `pg_isready`.

4. Tạo tình huống DB mất giữa chừng, rồi hỏi lớp dự đoán trước khi chạy:

   ```bash
   docker compose stop postgres
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/health
   curl -s -w "\n%{http_code}\n" http://localhost:3000/ready
   docker compose start postgres
   ```

   Kết quả mong đợi: `/health` trả `200` (tiến trình sống), `/ready` trả `503` với `{"status":"not-ready"}`. Sau khi `start postgres` và chờ healthy, `/ready` trả `200`.

   Điểm chốt: "sống" (liveness) khác "sẵn sàng phục vụ" (readiness). Đây chính là hai loại probe của Kubernetes.

   Lưu ý cho mentor: `db.js` chưa lắng nghe sự kiện `error` của `pg.Pool`. Nếu lúc postgres dừng, pool đang giữ một kết nối nhàn rỗi, tiến trình Node có thể crash và được `restart: unless-stopped` dựng lại (trong thời gian đó `/health` có thể tạm lỗi). Đây là cơ hội để nói về vai trò của restart policy, và là gợi ý cải tiến cho capstone (`pool.on("error", ...)`).

5. Xem restart policy bằng một lần thoát bất thường thật (không dùng `docker compose kill`, vì Docker Engine bản mới coi lệnh kill do người dùng gõ là dừng thủ công và không restart; đã kiểm chứng với 29.x):

   ```bash
   curl -s http://localhost:3000/api/members > /dev/null
   docker compose stop postgres
   sleep 5
   docker compose ps -a backend
   docker compose start postgres
   ```

   Kết quả mong đợi: backend `Up` với thời gian chạy vài giây (Node thoát vì pool nhận lỗi kết nối bị ngắt, rồi `unless-stopped` dựng lại). Lưu ý: `docker compose stop backend` là dừng chủ động nên không tự dậy lại.

Câu hỏi mentor nên hỏi: "Healthcheck của backend nên gọi `/health` hay `/ready`? Nếu gọi `/ready` thì khi DB chết, backend thành `unhealthy`, frontend có bị ảnh hưởng không?"

## Hands-on lab

Thời lượng tham khảo: 60 phút (Phần 1 đến 3 khoảng 30 phút cho L1; Phần 4 đến 6 cùng thử thách L2 khoảng 30 phút).

### Chuẩn bị

```bash
cd ~/devops-labs/lab-14/source
grep -n "DB_PASSWORD" .env
git status --short 2>/dev/null | head -3
mkdir -p ../evidence
docker compose down -v
```

Kết quả mong đợi: `.env` có dòng `DB_PASSWORD=...`. Từ đây, mọi lệnh quan trọng hãy ghi vào `../evidence/command-output.txt`, ví dụ `docker compose ps | tee -a ../evidence/command-output.txt`.

### Phần 1 – Quan sát healthcheck của postgres (L1)

1. Mở terminal thứ hai, chạy `watch -n 1 docker compose ps` trong `~/devops-labs/lab-14/source`. Ở terminal chính, chạy hệ thống:

   ```bash
   docker compose up -d --build
   ```

   Nhấn `Ctrl+C` ở terminal thứ hai khi `postgres` thành `healthy` và `backend` đã `Up`. Vì sao: bạn thấy trực tiếp khoảng chênh giữa container chạy và service sẵn sàng. (`up -d` tự chờ postgres healthy rồi mới start backend, nên nếu chỉ chạy `watch` sau khi `up -d` kết thúc thì bạn sẽ bỏ lỡ khoảng đó.)

2. Đọc lịch sử check:

   ```bash
   docker inspect --format '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' $(docker compose ps -q postgres)
   ```

   Kết quả mong đợi: các dòng dạng `0 /var/run/postgresql:5432 - accepting connections`.

3. Kiểm tra API đọc được dữ liệu:

   ```bash
   curl -s http://localhost:3000/api/members
   ```

   Kết quả mong đợi: JSON có Alice và Bob.

### Phần 2 – Thêm healthcheck cho backend và frontend (L1)

Image backend (`node:22-alpine`) và frontend (`nginx:alpine`) đều có `wget` của BusyBox, nên không cần cài thêm gì. Dùng `127.0.0.1` thay vì `localhost` để tránh trường hợp `localhost` phân giải sang IPv6 trong khi ứng dụng chỉ lắng nghe IPv4.

Sửa `compose.yaml`, thêm vào service `backend`:

```yaml
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
```

Thêm vào service `frontend`, đồng thời đổi `depends_on` của nó:

```yaml
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:80/ || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Áp dụng và kiểm tra:

```bash
docker compose config --quiet && echo "YAML OK"
docker compose up -d
docker compose ps
```

Kết quả mong đợi: `YAML OK`; sau khoảng 15 đến 25 giây cả ba service `(healthy)`. Vì sao `config --quiet`: bắt lỗi thụt lề và khóa sai trước khi chạy.

### Phần 3 – Kiểm chứng restart policy (L1)

```bash
curl -s http://localhost:3000/api/members > /dev/null
docker compose stop postgres
sleep 5
docker compose ps -a backend
docker inspect --format '{{.RestartCount}} {{.HostConfig.RestartPolicy.Name}}' $(docker compose ps -q backend)
docker compose start postgres
```

Kết quả mong đợi: backend `Up` với thời gian chạy vài giây, đầu ra `1 unless-stopped` (hoặc số lần restart tương ứng). Lệnh `curl` đầu tiên tạo một kết nối nhàn rỗi trong pool; khi postgres dừng, kết nối đó bị ngắt, backend chưa bắt sự kiện `error` của pool nên Node thoát với mã khác 0 và policy dựng lại container. Lưu ý: Docker Engine bản mới (đã kiểm chứng với 29.x) coi `docker compose kill` là dừng thủ công, container nằm ở `Exited (137)` và `RestartCount` vẫn là 0, nên bài này không dùng `kill`. Sau đó thử `docker compose stop backend`, xác nhận nó nằm yên ở `Exited`, rồi `docker compose start backend`.

### Phần 4 – Resource limits và logging (L2 một phần)

Thêm vào service `backend` (và tương tự cho `frontend`, `postgres` với giá trị bạn tự chọn):

```yaml
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 256M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

```bash
docker compose up -d
docker stats --no-stream
docker inspect --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}} {{.HostConfig.LogConfig.Config}}' $(docker compose ps -q backend)
```

Kết quả mong đợi: cột `MEM USAGE / LIMIT` của backend hiện giới hạn `256MiB`; dòng inspect có dạng `268435456 500000000 map[max-file:3 max-size:10m]`. Gợi ý giá trị: `256M` cho backend và frontend, `512M` cho postgres. Vì sao: giới hạn có hiệu lực thật chứ không chỉ nằm trong file YAML.

### Phần 5 – Secrets cho Postgres (L2 một phần)

Tạo file secret (không commit) và sửa service `postgres`:

```bash
mkdir -p secrets
printf '%s' "$(grep '^DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r')" > secrets/db_password.txt
echo "secrets/" >> .gitignore
```

Trong service `postgres`, thay dòng `POSTGRES_PASSWORD: ...` bằng `POSTGRES_PASSWORD_FILE` (xóa hẳn `POSTGRES_PASSWORD`, vì image postgres từ chối khởi động khi đặt cả hai):

```yaml
  postgres:
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
```

Ở cuối file `compose.yaml` thêm khối cấp cao nhất:

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Chú ý: mật khẩu chỉ được áp dụng khi volume còn trống. Nếu volume đã có dữ liệu, Postgres giữ mật khẩu cũ. Vì mật khẩu trong file giống hệt `DB_PASSWORD`, backend vẫn kết nối được; hãy kiểm chứng:

```bash
docker compose up -d
docker compose exec postgres sh -c 'ls -l /run/secrets && echo "POSTGRES_PASSWORD=[${POSTGRES_PASSWORD}]"'
curl -s http://localhost:3000/api/members | head -c 120
```

Kết quả mong đợi: file `db_password` tồn tại, `POSTGRES_PASSWORD=[]` (biến rỗng, mật khẩu không nằm trong env), API vẫn trả dữ liệu.

### Phần 6 – Backup và restore (L2 một phần)

1. Thêm một thành viên để có dữ liệu phân biệt, rồi backup:

   ```bash
   docker compose exec -T postgres psql -U club -d clubdb -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
   mkdir -p ../backups
   docker compose exec -T postgres pg_dump -U club -d clubdb > ../backups/clubdb-$(date +%Y%m%d).sql
   ls -l ../backups
   head -n 5 ../backups/clubdb-*.sql
   ```

   Kết quả mong đợi: file `.sql` lớn hơn 0 byte, dòng đầu có `-- PostgreSQL database dump`. Dùng `-T` để Compose không cấp TTY, tránh làm hỏng đầu ra khi chuyển hướng.

2. Giả lập mất dữ liệu:

   ```bash
   docker compose down -v
   docker compose up -d
   sleep 10
   curl -s http://localhost:3000/api/members
   ```

   Kết quả mong đợi: chỉ còn Alice và Bob (Carol đã mất vì volume bị xóa, `init.sql` nạp lại dữ liệu mẫu).

3. Restore thử vào một database mới để kiểm chứng bản backup dùng được (cách an toàn, không đụng database đang chạy):

   ```bash
   BACKUP=$(ls -1t ../backups/clubdb-*.sql | head -n 1)
   docker compose exec -T postgres psql -U club -d postgres -c "CREATE DATABASE clubdb_restore;"
   docker compose exec -T postgres psql -U club -d clubdb_restore < "$BACKUP"
   docker compose exec -T postgres psql -U club -d clubdb_restore -c "SELECT id, name FROM members ORDER BY id;"
   ```

   Kết quả mong đợi: bảng trong `clubdb_restore` có 3 dòng gồm Carol. Dùng biến `BACKUP` vì chuyển hướng `<` với ký tự đại diện cho nhiều file sẽ báo `ambiguous redirect`.

4. Khôi phục dữ liệu cho database đang phục vụ API:

   ```bash
   docker compose exec -T postgres psql -U club -d clubdb -c "DROP TABLE members;"
   docker compose exec -T postgres psql -U club -d clubdb < "$BACKUP"
   curl -s http://localhost:3000/api/members
   docker compose exec -T postgres psql -U club -d postgres -c "DROP DATABASE clubdb_restore;"
   ```

   Kết quả mong đợi: danh sách có Carol trở lại. Vì sao `DROP TABLE` trước: bản dump chứa `CREATE TABLE`, nếu bảng đã tồn tại thì restore báo lỗi `already exists`. Trong thực tế bạn sẽ restore vào database trống thay vì xóa bảng.

### L1 – Foundation: checklist hoàn thành

- [ ] `docker compose ps` cho thấy `postgres`, `backend`, `frontend` đều `(healthy)`.
- [ ] Giải thích được (bằng lời của bạn) vì sao `backend` chờ `postgres`.
- [ ] Làm backend thoát bất thường (dừng postgres khi pool có kết nối nhàn rỗi) và thấy nó tự khởi động lại với `RestartCount` tăng; `docker compose stop backend` thì không.
- [ ] `/health` trả 200 và `/ready` trả 503 khi bạn tạm dừng `postgres`.
- [ ] Đã lưu đầu ra các lệnh chính vào `evidence/command-output.txt`.

### L2 – Engineering: thử thách tự làm

Hoàn thành tối thiểu 3 trong 4 thử thách. Tiêu chí hoàn thành nằm trong từng mục.

1. **Healthcheck có chủ đích.** Đổi healthcheck của backend sang `/ready` và so sánh hành vi khi DB dừng. Tiêu chí: giải thích bằng 3 đến 5 câu trong `report.md` nên chọn `/health` hay `/ready` cho healthcheck của Compose và vì sao.
2. **OOM có kiểm soát.** Đặt `memory: 16M` cho backend, quan sát điều gì xảy ra, rồi trả về giá trị hợp lý. Tiêu chí: có ảnh chụp/log `docker inspect` cho `OOMKilled` hoặc exit code 137, và giá trị cuối cùng có lý giải dựa trên `docker stats`.
3. **Backup tự động.** Viết script `backup.sh` tạo file `clubdb-YYYYmmdd-HHMMSS.sql`, giữ lại 5 bản gần nhất. Tiêu chí: chạy 7 lần còn đúng 5 file; script không chứa mật khẩu.
4. **Secret cho backend.** Làm cho backend đọc mật khẩu từ file (ví dụ nếu có `DB_PASSWORD_FILE` thì đọc file) và bỏ `DB_PASSWORD` khỏi môi trường của backend. Tiêu chí: `docker compose exec backend env` không còn mật khẩu và `/ready` trả 200.

<details>
<summary>Gợi ý</summary>

- Thử thách 1: với `/ready`, khi DB dừng backend chuyển `unhealthy` sau `retries` lần. Vì `frontend` chỉ chờ lúc khởi động nên nó không bị dừng, nhưng nếu chạy lại `up` thì thứ tự sẽ bị chặn.
- Thử thách 2: `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' ID`. Node idle dùng khoảng 14 MiB nên 16M có thể vẫn chạy được (đã kiểm chứng); nếu không thấy `OOMKilled`, hạ xuống 8M, lúc đó backend bị OOM kill (exit 137) và `RestartCount` tăng liên tục.
- Thử thách 3: trong thư mục chứa backup, `ls -1t clubdb-*.sql | tail -n +6 | xargs -r rm --` xóa các bản cũ hơn 5 bản gần nhất.
- Thử thách 4: trong `db.js`, đọc bằng `fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim()` khi biến này có mặt; thêm `secrets:` cho service backend.

</details>

<details>
<summary>Lời giải tham khảo (thử thách 3)</summary>

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p backups
out="backups/clubdb-$(date +%Y%m%d-%H%M%S).sql"
docker compose exec -T postgres pg_dump -U club -d clubdb > "$out"
test -s "$out" || { echo "backup rong"; rm -f "$out"; exit 1; }
ls -1t backups/clubdb-*.sql | tail -n +6 | xargs -r rm --
echo "OK: $out"
```

Đặt `backup.sh` cạnh `compose.yaml` (trong `source/`) để `docker compose` tìm đúng project. Lệnh xác nhận: chạy `bash backup.sh` bảy lần (cách nhau hơn 1 giây) rồi `ls backups | wc -l` phải ra `5`.

</details>

Ví dụ tham khảo hoàn chỉnh nằm trong `examples/compose/healthcheck-restart/`; hãy tự làm trước khi so sánh.

## Phá lỗi và debug

### Tình huống: healthcheck quá ngặt

Cách phá: sửa healthcheck của backend thành `interval: 2s`, `timeout: 1s`, `retries: 1`, bỏ `start_period`, và trỏ vào đường dẫn sai `http://127.0.0.1:3000/healthz`.

```bash
docker compose up -d
docker compose ps
```

Triệu chứng: `backend` ở `(health: starting)` rồi `(unhealthy)`; `frontend` không bao giờ được tạo (vì chờ `service_healthy`), lệnh `up` báo `dependency failed to start: container ... is unhealthy`.

Hướng điều tra:

1. `docker compose ps` để xác định service nào unhealthy.
2. Xem log của healthcheck:

   ```bash
   docker inspect --format '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' $(docker compose ps -q backend)
   ```

   Output có dạng `wget: server returned error: HTTP/1.1 404 Not Found` (nội dung chính xác phụ thuộc phiên bản BusyBox).
3. Chạy tay lệnh check trong container để tái hiện: `docker compose exec backend wget -S -O /dev/null http://127.0.0.1:3000/health`.
4. Đối chiếu đường dẫn trong `app.js` (`/health`, `/ready`).

Nguyên nhân gốc: lệnh check sai đường dẫn, cộng với thông số quá ngặt (`retries: 1`, không `start_period`) khiến một lần chậm cũng bị coi là chết.

Phòng tránh: chạy tay lệnh check trước khi đưa vào YAML; để `start_period` bao trùm thời gian khởi động thật; `timeout` lớn hơn thời gian phản hồi bình thường vài lần.

### Tình huống liên quan

Hãy làm thêm tình huống "API không kết nối được DB" trong `examples/troubleshooting/` (scenario-03) và tình huống "database mất dữ liệu sau recreate" (scenario-04): chỉ đọc triệu chứng, tự tìm nguyên nhân gốc.

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| Backend báo lỗi 500 ngay sau `up` | Dùng `depends_on` dạng ngắn, không chờ Postgres ready | Thêm healthcheck cho `postgres` và `condition: service_healthy` |
| Healthcheck luôn `unhealthy` dù ứng dụng chạy | Thiếu `wget`/`curl` trong image, hoặc check vào `localhost` bị phân giải sang IPv6 | Chạy tay lệnh check bằng `docker compose exec`; dùng `127.0.0.1`; chọn công cụ có sẵn trong image |
| `dependency failed to start` khi `up` | Dependency chuyển `unhealthy` | `docker compose ps`, đọc `.State.Health.Log`, sửa lệnh hoặc tăng `start_period` |
| `POSTGRES_PASSWORD_FILE` đổi mà vẫn đăng nhập bằng mật khẩu cũ | Volume đã được khởi tạo, Postgres chỉ đặt mật khẩu lần đầu | Đổi mật khẩu bằng `ALTER USER`, hoặc `down -v` nếu chấp nhận mất dữ liệu |
| Container thoát với exit code 137 | Vượt giới hạn memory (OOM kill) hoặc bị kill | `docker inspect` xem `OOMKilled`; tăng limit hoặc sửa rò rỉ bộ nhớ |
| File backup rỗng hoặc có ký tự lạ | Thiếu `-T` khi dùng `docker compose exec` với chuyển hướng | Dùng `exec -T`; kiểm tra `test -s` |
| Restore báo `relation already exists` | Nạp dump vào database đã có bảng | Restore vào database trống hoặc `DROP TABLE` trước |
| Cổng database lộ ra mạng | Publish `5432:5432` không cần thiết | Bỏ `ports` của postgres; backend truy cập qua network nội bộ |
| Thay đổi `deploy.resources` không thấy hiệu lực | Chưa recreate container | Chạy lại `docker compose up -d` rồi kiểm tra bằng `docker inspect` |

## Tự kiểm tra

1. `depends_on: [postgres]` đảm bảo điều gì và không đảm bảo điều gì?
2. Khác biệt giữa `restart: always` và `restart: unless-stopped`?
3. Vì sao container `unhealthy` không tự được Docker restart, và bạn có thể xử lý thế nào?
4. Vì sao lưu mật khẩu vào file secret an toàn hơn biến môi trường, và giới hạn của cách này là gì?
5. Tại sao phải dùng `docker compose exec -T` khi chạy `pg_dump > file`?
6. Tình huống: sau `docker compose up -d`, API trả 503 ở `/ready` trong 20 giây rồi tự ổn. Bạn kết luận gì và có cần sửa không?
7. Tình huống: dịch vụ đang chạy tốt thì Postgres bị restart. Frontend và backend có bị Compose khởi động lại không? Hệ thống phục hồi thế nào?

<details>
<summary>Đáp án</summary>

1. Đảm bảo container dependency đã được khởi động trước; không đảm bảo ứng dụng bên trong đã sẵn sàng nhận kết nối.
2. Cả hai tự khởi động lại khi thoát; `unless-stopped` không khởi động lại container mà bạn đã chủ động dừng khi daemon Docker khởi động lại, còn `always` thì có.
3. Restart chỉ kích hoạt khi tiến trình thoát; `unhealthy` chỉ là trạng thái. Có thể để ứng dụng tự thoát khi lỗi nặng, dùng công cụ giám sát bên ngoài, hoặc dùng Kubernetes (liveness probe) ở các tuần sau.
4. Secret không hiện trong `docker inspect` hay danh sách biến môi trường của tiến trình con, và không bị in nhầm vào log. Giới hạn: ứng dụng phải biết đọc file, và file trên host vẫn phải được bảo vệ, không commit.
5. Không có `-T`, Compose cấp TTY, có thể chèn ký tự điều khiển/CRLF vào luồng và làm hỏng file dump hoặc làm lệnh báo lỗi stdin không phải TTY.
6. Đó là thời gian Postgres khởi tạo; hành vi bình thường. Không cần sửa code, nhưng nên có healthcheck và `depends_on` để người dùng không nhìn thấy khoảng đó.
7. Không; `depends_on` chỉ tác động lúc `up`. Pool kết nối của backend sẽ lỗi trong lúc DB tắt (`/ready` 503) rồi tạo kết nối mới khi DB lên, nên API tự phục hồi mà không cần restart.

</details>

## Nộp bài

Nộp vào `lab-14/` trong repository cá nhân (ví dụ `devops-labs`), theo `templates/lab-template.md`:

- [ ] `README.md` trả lời đủ 7 câu hỏi của template (giải quyết vấn đề gì, kiến thức, các bước, kết quả mong đợi, lỗi đã gặp, cách khắc phục, cải thiện) và đánh dấu level đã làm (L1/L2).
- [ ] `source/` chứa `compose.yaml` đã sửa (healthcheck cho cả 3 service, restart, limits, logging, secrets), `.env.example`, và `backup.sh` nếu làm L2.
- [ ] `evidence/command-output.txt` gồm đầu ra của `docker compose ps` (healthy), `docker inspect` Health Log, `docker stats --no-stream`, lệnh backup và restore kèm kết quả `curl /api/members`.
- [ ] `report.md` mô tả tình huống Break -> Debug (healthcheck quá ngặt): triệu chứng, cách điều tra, nguyên nhân gốc, cách phòng tránh.
- [ ] `screenshots/` (nếu có) chỉ bổ trợ; không thay cho log và source.
- [ ] Đã kiểm tra: không commit `.env`, `secrets/`, hay file backup chứa dữ liệu nhạy cảm (`git status` sạch các mục đó).

## Recap

- Container chạy chưa có nghĩa là service sẵn sàng: dùng healthcheck và `condition: service_healthy`.
- `depends_on` chỉ tác động lúc khởi động; ứng dụng vẫn phải chịu được mất kết nối tạm thời.
- `/health` (còn sống) khác `/ready` (sẵn sàng phục vụ); đây là nền tảng của liveness và readiness probe trong Kubernetes.
- `restart: unless-stopped` hồi phục khi tiến trình thoát, nhưng không xử lý trạng thái `unhealthy`.
- Luôn đặt giới hạn tài nguyên và log rotation để một container lỗi không làm sập cả máy.
- Không đưa mật khẩu vào Git; ưu tiên secret dạng file khi image hỗ trợ.
- Volume không phải backup: tập `pg_dump` và thử restore thật trước khi cần đến nó.

## Tài liệu tham khảo

- [Compose file: services (healthcheck, depends_on, restart, deploy)](https://docs.docker.com/reference/compose-file/services/)
- [Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/)
- [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Resource constraints for containers](https://docs.docker.com/engine/containers/resource_constraints/)
- [JSON File logging driver](https://docs.docker.com/engine/logging/drivers/json-file/)
- [PostgreSQL: pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html)
