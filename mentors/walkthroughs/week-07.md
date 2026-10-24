# Walkthrough tuần 7 – Docker Compose

::: warning Dành cho mentor và học viên đã nộp bài
Trang này là đáp án đối chiếu: mentor dùng để chấm, học viên chỉ mở sau khi đã nộp bài của mình.
:::

> **Tóm tắt:** Hướng dẫn giải tuần 7: Compose cho starter-project, healthcheck, restart, secrets, backup và restore PostgreSQL, kèm gợi ý bài tập và hướng dẫn chấm cho mentor.

## Cách dùng tài liệu này

Chỉ đọc sau khi bạn đã tự làm bài lab và bài tập. Hãy đối chiếu kết quả của mình với đáp án để tìm chỗ lệch, không chép nguyên văn: mentor chấm bằng evidence thật trong `evidence/` và có thể hỏi vấn đáp về chính file bạn nộp.

Các lệnh và kết quả dưới đây đã được chạy thử với Docker Engine 29.x, Compose v5 và image `postgres:17-alpine`, `node:22-alpine`. Tên container và tên project của bạn có thể khác (tiền tố là tên thư mục chứa `compose.yaml`). Hai bài lab liên quan: [Buổi 13](../../labs/week-07/session-13.md) và [Buổi 14](../../labs/week-07/session-14.md); đề bài tập: [Bài tập tuần 7](../../assignments/weekly/week-07.md).

Một lưu ý quan trọng về restart policy: với Docker Engine bản mới, lệnh `docker compose kill` hoặc `docker kill` do người dùng gõ được coi là dừng thủ công, container nằm ở `Exited (137)` và `RestartCount` vẫn bằng 0. Vì vậy các bài lab đã được chỉnh để tạo ra một lần thoát bất thường thật (xem Buổi 14, Phần 3).

## Lời giải theo buổi

### Buổi 13 – Docker Compose

#### Đáp án các nhiệm vụ L1

Chuẩn bị. Sao chép starter-project vào thư mục nộp bài và ghi evidence ngay từ đầu:

```bash
mkdir -p ~/devops-labs/lab-13/source ~/devops-labs/lab-13/evidence ~/devops-labs/lab-13/screenshots
cp -r ~/devops-course/starter-project/. ~/devops-labs/lab-13/source/
cd ~/devops-labs/lab-13/source
echo "## Lab 13 evidence" > ../evidence/command-output.txt
```

Phần 1 – `.env` và cấu hình:

1. `cp .env.example .env`, rồi đổi `DB_PASSWORD` thành chuỗi riêng của bạn. `.env.example` chỉ chứa giá trị mẫu (`DB_PASSWORD=change-me-locally`, `WEB_PORT=8080`).
2. Kiểm tra git bỏ qua `.env`:

   ```bash
   cd ~/devops-labs && git check-ignore -v lab-13/source/.env; cd lab-13/source
   ```

   Kết quả đúng là một dòng chỉ ra quy tắc trong `.gitignore`. Không in gì nghĩa là `.env` sẽ bị commit: thêm dòng `.env` vào `.gitignore` ngay.
3. `docker compose config --quiet; echo "exit code: $?"` phải in `exit code: 0`. `docker compose config` (không `--quiet`) in file đã thay biến: bạn thấy `DB_PASSWORD` có giá trị thật và `WEB_PORT` thành số cổng. Nếu xóa `.env` rồi chạy lại, Compose dừng với thông báo `required variable DB_PASSWORD is missing a value: Set DB_PASSWORD in .env`. Đây là bằng chứng cho biểu thức `${DB_PASSWORD:?...}`.

Phần 2 – khởi chạy:

```bash
docker compose up -d --build 2>&1 | tee -a ../evidence/command-output.txt
docker compose ps | tee -a ../evidence/command-output.txt
```

Điều cần thấy trong output: network và volume được tạo, container postgres chuyển `Healthy` trước, rồi mới tới `backend` và `frontend` `Started`. `docker compose ps` phải có `postgres ... (healthy)`; cột PORTS của postgres chỉ có `5432/tcp` (không có mũi tên `->`), nghĩa là không publish ra máy. Log postgres có dòng `running /docker-entrypoint-initdb.d/init.sql`, log backend có `API listening on port 3000`.

Phần 3 – gọi mạng:

```bash
curl -s http://localhost:8080/api/members
docker compose exec backend wget -qO- http://127.0.0.1:3000/health
docker compose exec frontend wget -qO- http://backend:3000/health
docker compose exec postgres psql -U club -d clubdb -c "SELECT id, name FROM members;"
```

Kết quả đúng: JSON có Alice và Bob; hai lệnh `wget` đều trả `{"status":"healthy","service":"club-api"}`; `psql` in 2 dòng. Lệnh `exec frontend ... http://backend:3000/health` là bằng chứng gọi theo tên service, không dùng IP.

Phần 4 – vòng đời dữ liệu (ba lần gọi theo đúng thứ tự mà Nhiệm vụ 2 yêu cầu):

```bash
docker compose exec postgres psql -U club -d clubdb \
  -c "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com');"
curl -s http://localhost:8080/api/members          # (1) có Alice, Bob, Carol
docker compose down && docker compose up -d && sleep 5
curl -s http://localhost:8080/api/members          # (2) vẫn có Carol
docker compose down -v && docker compose up -d && sleep 15
curl -s http://localhost:8080/api/members          # (3) chỉ còn Alice, Bob
```

Vì sao: `down` xóa container và network nhưng giữ named volume `postgres-data`, và `init.sql` không chạy lại vì thư mục dữ liệu đã có. `down -v` xóa cả volume, lần `up` sau khởi tạo cụm mới và chạy lại `init.sql` (chỉ có Alice và Bob). Nếu lần gọi (3) trả lỗi hoặc rỗng, chờ thêm vài giây: sau khi tạo volume mới, postgres cần thời gian khởi tạo và backend có thể tạm trả 500.

Checklist L1 đạt khi có đủ: `.env` không bị git theo dõi, `ps` có ba service chạy, `/api/members` trả đúng, một lệnh `exec` gọi theo tên service, ba lần gọi dữ liệu, và file `evidence/command-output.txt`.

#### Lời giải L2

Thử thách A – viết `compose.mine.yaml` không nhìn file gốc. Cách tiếp cận: làm từng service một và chạy `docker compose -f compose.mine.yaml config` sau mỗi lần thêm, theo thứ tự postgres, backend, frontend vì service sau phụ thuộc service trước. Một lời giải đạt đủ tiêu chí:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U club -d clubdb"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - club-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    environment:
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: clubdb
      DB_USER: club
      DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - club-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
    ports:
      - "${WEB_PORT:-8080}:80"
    depends_on:
      - backend
    networks:
      - club-network
    restart: unless-stopped

networks:
  club-network:

volumes:
  postgres-data:
```

Chạy: `docker compose down` bản gốc trước, rồi `docker compose -f compose.mine.yaml -p lab13mine up -d --build`. Bản này bỏ `ports` của backend nên không đụng cổng 3000 (bản gốc publish cổng này để học viên gọi trực tiếp); đó là một lựa chọn hợp lý, vì frontend đã proxy `/api/` tới backend. Vì dùng `-p lab13mine`, volume là volume mới (`lab13mine_postgres-data`) nên bảng được tạo lại bằng `init.sql`.

Vì sao chọn vậy: `condition: service_healthy` chỉ đặt cho backend vì chỉ backend cần DB sẵn sàng; frontend chỉ cần container backend tồn tại để nginx phân giải được tên `backend`. Cách khác: dùng `env_file` thay cho `environment` của backend, hoặc thêm `start_period` cho healthcheck của postgres. Ba lỗi hay gặp khi viết từ đầu: `DB_HOST: localhost`, quên mount `init.sql` (API trả 500 vì không có bảng `members`), hoặc publish `5432:5432` cho postgres.

Thử thách B – đổi cổng. Đặt `WEB_PORT=8081` trong `.env` rồi `docker compose up -d`. Compose so sánh cấu hình và chỉ tạo lại container `frontend` (cổng publish đổi), còn `backend` và `postgres` giữ nguyên. Chỉ sửa `.env` là đủ vì `ports` dùng biểu thức `${WEB_PORT:-8080}`, Compose thay biến lúc đọc file. Cách tạm thời: `WEB_PORT=8081 docker compose up -d` (biến của shell được ưu tiên hơn `.env`). Kiểm tra bằng `docker compose ps` thấy `0.0.0.0:8081->80/tcp`.

Thử thách C – restart policy. Lưu ý quan trọng: `docker compose kill backend` không làm container chạy lại trên Docker Engine bản mới (đã kiểm chứng: `Exited (137)`, `RestartCount 0`). Cách tạo thoát bất thường thật trong bài này:

```bash
curl -s http://localhost:3000/api/members > /dev/null
docker compose stop postgres
sleep 5
docker compose ps -a backend
docker inspect --format '{{.RestartCount}} {{.HostConfig.RestartPolicy.Name}}' $(docker compose ps -q backend)
docker compose start postgres
```

Kết quả đúng: backend `Up` vài giây, đầu ra `1 unless-stopped`. Nguyên nhân: `curl` làm pool giữ một kết nối nhàn rỗi; postgres dừng thì kết nối bị ngắt, `db.js` chưa lắng nghe sự kiện `error` của `pg.Pool` nên Node ném lỗi chưa bắt và thoát; `unless-stopped` dựng lại container. So sánh: `docker compose stop backend` là dừng chủ động nên backend nằm yên ở `Exited` cho tới khi `start` hoặc `up -d`. Cần nói rõ restart policy không sửa lỗi gốc: nếu lỗi lặp lại, container quay vòng khởi động.

#### Lời giải phần Phá lỗi và debug: đổi mật khẩu nhưng API lỗi DB

Cây điều tra:

1. `docker compose ps`: mọi service vẫn `Up`, postgres `healthy`. Loại trừ giả thuyết container chết.
2. `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/members` trả `500` (hoặc `502` nếu backend đang khởi động lại). Request tới được backend nhưng backend lỗi khi truy vấn.
3. `docker compose logs --tail=30 backend` có `error: password authentication failed for user "club"`.
4. `docker compose logs --tail=30 postgres` có `FATAL: password authentication failed for user "club"`. Hai phía cùng báo: backend đã tới được postgres và bị từ chối, nên không phải lỗi mạng hay DNS.
5. `docker compose exec backend printenv DB_PASSWORD` cho thấy mật khẩu mới; mật khẩu trong database vẫn là mật khẩu cũ.

Nguyên nhân gốc: `POSTGRES_PASSWORD` chỉ được dùng khi khởi tạo thư mục dữ liệu lần đầu. Sau khi sửa `.env` và `up -d`, Compose tạo lại cả postgres lẫn backend với biến mới, nhưng volume `postgres-data` giữ nguyên mật khẩu đặt từ đầu. Đổi biến môi trường không đổi mật khẩu bên trong dữ liệu đã tồn tại.

Cách sửa, hai hướng:

- Giữ dữ liệu: `docker compose exec postgres psql -U club -d clubdb -c "ALTER USER club PASSWORD 'mat-khau-moi';"` (kết nối qua socket nội bộ nên không cần mật khẩu cũ). Sau đó `/api/members` trả 200 mà không cần restart backend. Đã kiểm chứng.
- Chấp nhận mất dữ liệu: trả `.env` về giá trị cũ, hoặc `down -v` rồi `up -d`.

Phòng tránh: coi đổi mật khẩu là một thao tác riêng gồm hai nơi (`.env` và database), ghi vào README; không sửa `.env` tùy tiện trên môi trường đang có dữ liệu. Sau bài nhớ khôi phục `.env`.

#### Những hiểu lầm hay gặp

- Nghĩ `depends_on` ngắn gọn là chờ postgres sẵn sàng. Thực tế chỉ đảm bảo container đã được start; cần `healthcheck` cùng `condition: service_healthy`.
- Dùng `localhost` làm `DB_HOST`. Mỗi container có network namespace riêng, `localhost` là chính backend.
- Nghĩ `down` luôn mất dữ liệu, hoặc `down -v` chỉ xóa container. Phân biệt rõ: volume chỉ mất khi có `-v`.
- Sửa `init.sql` rồi `up -d` mà dữ liệu không đổi: script chỉ chạy khi thư mục dữ liệu trống.
- Cho rằng `ports` là điều kiện để các container nói chuyện. Trong cùng network chúng gọi nhau qua cổng container; `ports` chỉ để publish ra máy chủ.
- Dùng `docker-compose` (v1) thay cho `docker compose`, hoặc làm việc trong `/mnt/c` nên chậm và lỗi quyền.
- Nghĩ rằng `docker compose kill` luôn kích hoạt restart policy. Xem lưu ý ở đầu tài liệu.

### Buổi 14 – Production-minded Compose

#### Đáp án các nhiệm vụ L1

Chuẩn bị: `docker compose down` trong `lab-13/source` để hai lab không dẫm lên nhau (cùng tên project `source`), rồi `cp -r ~/devops-course/starter-project source`, `cp .env.example .env` trong `lab-14`.

Phần 1 – quan sát healthcheck postgres. Terminal 2 chạy `watch -n 1 docker compose ps`; terminal 1 chạy `docker compose down -v` rồi `docker compose up -d --build`. Bạn thấy postgres ở `(health: starting)` trong vài giây, backend chưa chạy (hoặc `Created`). Backend chưa chạy dù không có `sleep` vì `depends_on` có `condition: service_healthy` bắt Compose chờ. Lịch sử check:

```bash
docker inspect --format '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' $(docker compose ps -q postgres)
```

Kết quả đúng là các dòng `0 /var/run/postgresql:5432 - accepting connections`. Gọi `curl -s http://localhost:3000/api/members` thấy Alice và Bob.

Phần 2 – healthcheck backend, frontend. `compose.yaml` hoàn chỉnh sau Phần 2 đến 4 (chưa có secrets, thêm ở L2). Phần mới so với bản gốc là `healthcheck`, `depends_on` của frontend, `deploy`, `logging`:

```yaml
services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "${WEB_PORT:-8080}:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:80/ || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s
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
    networks:
      - club-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    environment:
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: clubdb
      DB_USER: club
      DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
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
    networks:
      - club-network
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: clubdb
      POSTGRES_USER: club
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in .env}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U club -d clubdb"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - club-network
    restart: unless-stopped

networks:
  club-network:

volumes:
  postgres-data:
```

Kiểm tra: `docker compose config --quiet && echo "YAML OK"`, `docker compose up -d`, sau khoảng 15 đến 25 giây `docker compose ps` phải cho cả ba `(healthy)`. Dùng `127.0.0.1` trong healthcheck để tránh `localhost` phân giải sang IPv6.

Phần 3 – restart policy. Không dùng `docker compose kill` (không kích hoạt restart trên Docker Engine bản mới). Dùng chuỗi lệnh sau:

```bash
curl -s http://localhost:3000/api/members > /dev/null
docker compose stop postgres
sleep 5
docker compose ps -a backend
docker inspect --format '{{.RestartCount}} {{.HostConfig.RestartPolicy.Name}}' $(docker compose ps -q backend)
docker compose start postgres
```

Kết quả đúng: backend `Up` vài giây, `1 unless-stopped`. Sau đó `docker compose stop backend` đưa backend về `Exited` và nó không tự dậy; `docker compose start backend` chạy lại. Nếu bạn vẫn thử `kill`, hãy ghi lại kết quả thật (`Exited (137)`, `RestartCount 0`) và nêu giải thích: lệnh kill do người dùng gõ được coi là dừng thủ công.

Nhiệm vụ `/health` so với `/ready` khi dừng postgres (Nhiệm vụ 4 của bài tập):

```bash
docker compose stop postgres
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ready
docker compose start postgres
```

Kết quả đúng: `200` rồi `503`; sau khi postgres healthy lại, `/ready` trả `200`. Nếu pool đang giữ kết nối nhàn rỗi, backend có thể crash và được dựng lại ngay sau khi postgres dừng, nên `/health` có thể lỗi ngắn rồi trả `200` trở lại. Gọi lệnh `curl` lại sau vài giây.

Phần 4 – giới hạn và log: sau `docker compose up -d`, `docker inspect --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}} {{.HostConfig.LogConfig.Config}}' $(docker compose ps -q backend)` phải in `268435456 500000000 map[max-file:3 max-size:10m]`, và `docker stats --no-stream` hiện giới hạn `256MiB` ở cột MEM USAGE / LIMIT của backend.

#### Lời giải L2

Phần 5 – secret cho Postgres. Các bước: tạo `secrets/db_password.txt` bằng `printf '%s'` (không để dòng mới ở cuối, nếu không mật khẩu có thêm ký tự xuống dòng), thêm `secrets/` vào `.gitignore`, xóa dòng `POSTGRES_PASSWORD`, thêm `POSTGRES_PASSWORD_FILE: /run/secrets/db_password` và khóa `secrets` cho service, rồi khai báo khối `secrets` cấp cao nhất trỏ tới file. Kiểm chứng đúng khi:

```bash
docker compose exec postgres sh -c 'ls -l /run/secrets && echo "POSTGRES_PASSWORD=[${POSTGRES_PASSWORD}]"'
curl -s http://localhost:3000/ready
```

in ra file `db_password`, `POSTGRES_PASSWORD=[]` và `{"status":"ready"}`. Phải khởi động từ volume mới (`down -v` trước) thì mật khẩu mới được áp dụng. Giới hạn của cách này: file vẫn nằm trên đĩa máy chủ nên phải được `.gitignore` và phân quyền; backend vẫn nhận mật khẩu qua biến môi trường trừ khi sửa `db.js`.

Phần 6 – backup và restore:

```bash
docker compose exec -T postgres pg_dump -U club -d clubdb > ../backups/clubdb-$(date +%Y%m%d).sql
docker compose down -v && docker compose up -d && sleep 10
BACKUP=$(ls -1t ../backups/clubdb-*.sql | head -n 1)
docker compose exec -T postgres psql -U club -d postgres -c "CREATE DATABASE clubdb_restore;"
docker compose exec -T postgres psql -U club -d clubdb_restore < "$BACKUP"
docker compose exec -T postgres psql -U club -d clubdb_restore -c "SELECT id, name FROM members ORDER BY id;"
```

Kết quả đúng: file `.sql` lớn hơn 0 byte, dòng đầu có `-- PostgreSQL database dump`; `clubdb_restore` có 3 dòng gồm Carol (trước đó đã `INSERT` Carol vào `clubdb`). Nếu thử nạp dump vào `clubdb` đã có bảng, psql báo `relation "members" already exists` và `duplicate key value violates unique constraint "members_pkey"`; dữ liệu cũ không đổi, đó là lý do thực tế nên restore vào database trống hoặc `DROP TABLE` trước.

Thử thách 1 – `/health` hay `/ready` cho healthcheck. Chọn `/health` cho Compose. Nếu dùng `/ready`, khi DB dừng backend thành `unhealthy` sau `retries` lần; `frontend` đã chạy nên không bị dừng (`depends_on` chỉ tác động lúc `up`), nhưng restart policy không xử lý `unhealthy`, nên backend không được dựng lại, còn lần `up` sau sẽ bị chặn vì dependency không healthy. `/ready` phù hợp làm readiness probe (Kubernetes), `/health` làm liveness.

Thử thách 2 – OOM. Đặt `memory: 8M` cho backend (rồi `docker compose up -d`) thì kernel OOM kill tiến trình: `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}} {{.RestartCount}}'` cho `true 137` và số restart tăng liên tục, trạng thái `restarting`. Với `16M`, Node idle dùng khoảng 14 MiB nên có thể vẫn chạy được trên máy bạn; đó là kết quả hợp lệ nếu bạn ghi đúng số liệu `docker stats`. Giá trị cuối cùng nên có biên an toàn lớn so với mức đo (đo thực tế khoảng 14 MiB lúc rảnh), ví dụ `256M`, kèm lý giải rằng tải thật cao hơn lúc rảnh.

Thử thách 3 – `backup.sh`: script mẫu (`set -euo pipefail`, `cd "$(dirname "$0")"`, kiểm tra `test -s`, giữ 5 bản bằng `ls -1t ... | tail -n +6 | xargs -r rm --`). Đặt `backup.sh` cạnh `compose.yaml` (trong `source/`) để `docker compose` tìm đúng project:

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

Chạy bảy lần cách nhau hơn một giây (tên file có giờ phút giây) rồi `ls backups | wc -l` phải ra `5`. Script không chứa mật khẩu vì dùng socket nội bộ của container. Một `restore.sh` tốt nhận đường dẫn làm tham số, kiểm tra file tồn tại, tạo database trống mới rồi nạp, in số dòng bảng `members`.

Thử thách 4 – secret cho backend. Hướng làm: trong `db.js` đọc mật khẩu từ file nếu có `DB_PASSWORD_FILE`:

```js
import fs from "node:fs";
import pg from "pg";

const password = process.env.DB_PASSWORD_FILE
  ? fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim()
  : process.env.DB_PASSWORD || "change-me";

export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "clubdb",
  user: process.env.DB_USER || "club",
  password
});
```

Trong `compose.yaml`, backend bỏ `DB_PASSWORD`, thêm `DB_PASSWORD_FILE: /run/secrets/db_password` và `secrets: [db_password]`. Tiêu chí kiểm chứng: `docker compose exec backend env` không còn mật khẩu và `/ready` trả 200. Lưu ý quyền đọc file: backend chạy bằng user `node`, nên file secret phải đọc được với user đó (trên Linux gốc, file `600` của user khác sẽ gây `EACCES`).

#### Lời giải phần Phá lỗi và debug: healthcheck quá ngặt

Gây lỗi: backend `interval: 2s`, `timeout: 1s`, `retries: 1`, bỏ `start_period`, test trỏ `/healthz`.

Cây điều tra:

1. `docker compose up -d` báo `dependency failed to start: container ... is unhealthy`; `docker compose ps -a` cho thấy backend `Up (unhealthy)` và frontend ở `Created` (không bao giờ được start vì chờ `service_healthy`).
2. Đọc lịch sử check:

   ```bash
   docker inspect --format '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' $(docker compose ps -q backend)
   ```

   Output có `1 wget: server returned error: HTTP/1.1 404 Not Found`. Mã lỗi là 404, tức ứng dụng sống nhưng đường dẫn sai.
3. Tái hiện tay: `docker compose exec backend wget -S -O /dev/null http://127.0.0.1:3000/healthz` cho `404`; thử `/health` thì thành công.
4. Đối chiếu `app.js`: chỉ có `/health` và `/ready`.

Nguyên nhân gốc: lệnh check trỏ vào đường dẫn không tồn tại. Các tham số ngặt (`retries: 1`, không `start_period`) làm lỗi bị tuyên bố ngay thay vì được cho thời gian; chúng không phải nguyên nhân chính nhưng khiến triệu chứng xuất hiện tức thì. Sửa: đổi lại thành `/health` và đưa `interval`, `timeout`, `retries`, `start_period` về giá trị hợp lý, rồi `docker compose up -d` để thấy `(healthy)` và frontend được tạo. Phòng tránh: chạy tay lệnh check trước khi đưa vào YAML, để `start_period` bao trùm thời gian khởi động, `timeout` lớn hơn thời gian phản hồi bình thường vài lần.

#### Những hiểu lầm hay gặp

- Nghĩ container `unhealthy` sẽ được Docker tự restart. Restart policy chỉ chạy khi tiến trình thoát.
- Nghĩ `depends_on` điều kiện còn tác dụng sau khi hệ thống đã chạy. Nó chỉ tác động lúc `up`; postgres restart giữa chừng thì Compose không restart backend, hệ thống phục hồi nhờ pool tạo kết nối mới (nếu backend không crash).
- Dùng `localhost` trong healthcheck; dùng `127.0.0.1`.
- Quên `-T` khi `exec ... pg_dump > file`, dẫn tới TTY chèn ký tự điều khiển và file dump hỏng.
- Coi volume là backup. Xóa volume hoặc hỏng đĩa là mất sạch; backup là file dump đã được restore thử.
- Đổi `POSTGRES_PASSWORD_FILE` mà vẫn đăng nhập bằng mật khẩu cũ: volume cũ giữ mật khẩu cũ.
- Đặt cả `POSTGRES_PASSWORD` và `POSTGRES_PASSWORD_FILE`: image postgres từ chối khởi động.
- Đổi `deploy.resources` mà không `up -d` lại nên giới hạn không có hiệu lực.

## Bài tập và chấm bài

### Bài tập tuần

Phần này gợi ý cách tiếp cận cho từng nhiệm vụ của [bài tập tuần 7](../../assignments/weekly/week-07.md). Nhiệm vụ 1 và 2 nằm ở `lab-13/`, nhiệm vụ 3 đến 5 ở `lab-14/`.

#### Nhiệm vụ L1

Nhiệm vụ 1 (hệ thống ba service). Làm theo Buổi 13 Phần 1 đến 3. Điểm cần thấy trong bài:

- `compose.yaml` có đủ ba service, network `club-network`, volume `postgres-data`; postgres không có khóa `ports`; mật khẩu viết dưới dạng `${DB_PASSWORD:?...}`.
- `.env.example` chỉ có giá trị mẫu; `git ls-files` không liệt kê `.env`, `git check-ignore -v` chỉ ra quy tắc.
- Log `docker compose config --quiet` kèm `exit code: 0`; `docker compose ps`; `curl` trả Alice và Bob; một lệnh `exec` gọi `backend` hoặc `postgres` bằng tên.

Nhiệm vụ 2 (vòng đời dữ liệu). Ba lần gọi đúng thứ tự như ở Buổi 13 Phần 4. `report.md` đạt khi 3 đến 5 câu nêu: `down` xóa container và network nhưng giữ named volume `postgres-data`; `init.sql` chỉ chạy khi thư mục dữ liệu trống nên Carol còn; `down -v` xóa volume nên `init.sql` chạy lại từ đầu và Carol mất.

Nhiệm vụ 3 (healthcheck và thứ tự khởi động). Dùng `compose.yaml` ở phần đáp án Buổi 14. `report.md` nên nêu: nếu không có `condition: service_healthy`, backend có thể khởi động khi postgres còn đang khởi tạo cụm và chạy `init.sql`, kết nối bị từ chối hoặc bảng `members` chưa có, API lỗi 500 "lúc được lúc không" tùy tốc độ khởi động. Log phải có `docker compose ps` với cả ba `(healthy)` và `docker inspect` Health Log của ít nhất một service.

Nhiệm vụ 4 (restart và `/health`, `/ready`). Mỗi service có `restart: unless-stopped` và lý do, ví dụ: tự dựng lại khi sập nhưng tôn trọng thao tác dừng chủ động của người vận hành. Evidence thoát bất thường dùng chuỗi lệnh ở Buổi 14 Phần 3 (không dùng `kill`), kèm `stop backend` đối chứng. Mã `200`/`503` ghi bằng `curl -s -o /dev/null -w "%{http_code}\n"`. `report.md` giải thích: `/health` cho biết tiến trình còn sống, `/ready` cho biết đã phục vụ được (truy vấn DB thành công); chọn `/health` cho healthcheck của Compose vì nếu dùng `/ready` thì lỗi DB làm backend `unhealthy` mà Compose không tự sửa được, và lần `up` sau sẽ bị chặn.

Nhiệm vụ 5 (Break -> Debug). Chấp nhận nhiều cách gây lỗi miễn có `git diff`: sai đường dẫn kiểm tra, `timeout` quá nhỏ, `retries: 1`, bỏ `start_period`. Mẫu chuẩn là lời giải phần Phá lỗi của Buổi 14. Điều cần thấy: triệu chứng, các lệnh điều tra (`ps`, `logs`, `inspect` Health Log, chạy tay lệnh check), nguyên nhân gốc, cách sửa, cách phòng tránh, và trạng thái cuối `(healthy)`.

#### Nhiệm vụ L2

- Thử thách A: `backup.sh` và `restore.sh` như lời giải Thử thách 3. Cần log bảy lần chạy với `ls backups | wc -l` ra `5`, và log restore cho thấy Carol trở lại sau khi bị xóa cố ý. `backups/` trong `.gitignore`.
- Thử thách B: `compose.yaml` dùng `secrets` và `POSTGRES_PASSWORD_FILE`, file mật khẩu trong thư mục bị ignore, `docker inspect` không còn `POSTGRES_PASSWORD` thông thường, khởi động từ volume mới và `/ready` 200. Giới hạn: file vẫn trên đĩa máy chủ, backend vẫn cần mật khẩu theo cách khác.
- Thử thách C: `docker inspect` cho `OOMKilled` hoặc exit 137 (thử 8M nếu 16M không bị kill), số liệu `docker stats --no-stream`, giá trị cuối cùng có lý giải và ba service `(healthy)`.

#### Đáp án 5 câu hỏi kiểm tra

1. Mặc định `depends_on` chỉ đảm bảo thứ tự khởi động container; với `condition: service_healthy` Compose chờ healthcheck của dependency báo healthy. Ví dụ lỗi của cách mặc định: backend start khi postgres chưa nhận kết nối nên truy vấn đầu tiên lỗi hoặc bảng `members` chưa có.
2. `down` xóa container và network nhưng giữ named volume, dữ liệu nằm trong volume nên còn. `down -v` xóa cả volume nên mất dữ liệu và lần `up` sau khởi tạo mới (`init.sql` chạy lại).
3. Compose tạo network bridge cho project và DNS nội bộ phân giải tên service ra IP container. `DB_HOST: localhost` sai vì `localhost` trong container backend là chính nó, không phải postgres.
4. `unless-stopped` giúp khi tiến trình thoát bất thường vì lỗi tạm thời (kết nối DB bị ngắt, sập hiếm gặp) và khi máy khởi động lại. Nó che giấu lỗi thật khi container sập lặp đi lặp lại: trạng thái trông bình thường nhưng `RestartCount` tăng liên tục, cần xem log và `RestartCount`.
5. Không publish cổng postgres vì tránh xung đột với PostgreSQL trên máy, giảm bề mặt tấn công (chỉ container trong network truy cập được), backend vẫn gọi qua `postgres:5432`. Đưa mật khẩu vào cấu hình mà không commit: dùng `.env` (đã `.gitignore`, repo chỉ có `.env.example`), tốt hơn là secret dạng file.

### Hướng dẫn chấm cho mentor

Mentor có thể chạy lại `docker compose up -d` từ `source/` của học viên. Bài không chạy lại được chỉ nhận tối đa một nửa điểm các nhiệm vụ liên quan (theo ghi chú chấm của bài tập).

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1 – ba service | `command-output.txt` có `config --quiet` kèm exit code, `ps`, `curl`, lệnh `exec` theo tên; `compose.yaml`, `.env.example` | Tên container y hệt ví dụ của đề (`starter-project-...`) dù thư mục khác tên; giải thích từng khóa chép lại câu của lab | Vì sao backend gọi `postgres` mà không gọi `localhost`? Nếu bỏ `networks`, hệ thống có còn chạy không và vì sao? Lệnh nào cho em thấy mật khẩu đã được thay vào YAML? |
| Nhiệm vụ 2 – vòng đời dữ liệu | Ba lần gọi theo đúng thứ tự, mỗi lần có dòng lệnh ngay trên; kết quả (2) còn Carol, (3) mất Carol | Kết quả được gõ tay (không có mốc thời gian, thiếu lệnh `down -v`); giải thích không nhắc `init.sql` | Sau `down -v` vì sao Alice và Bob vẫn xuất hiện? Nếu sửa `init.sql` thêm một người và chỉ chạy `up -d`, dữ liệu có đổi không? |
| Nhiệm vụ 3 – healthcheck, `depends_on` | `ps` có ba `(healthy)`; `inspect` Health Log với dòng `accepting connections`; `condition: service_healthy` đúng chỗ | Có `healthcheck` nhưng `depends_on` vẫn dạng ngắn; không giải thích được vì sao frontend chờ backend | `start_period` để làm gì? Khi nào `depends_on` điều kiện không còn tác dụng? Vì sao frontend không cần chờ backend khỏe mà vẫn cần backend được tạo trước? |
| Nhiệm vụ 4 – restart, `/health`, `/ready` | Log thoát bất thường với `RestartCount` tăng, `stop backend` đứng yên, mã `200` và `503`, rồi `200` | Chỉ có `kill` mà `RestartCount` vẫn 0 nhưng báo đã restart; mã HTTP không có lệnh `curl` đi kèm; kết luận ngược (chọn `/ready` mà không nêu hệ quả) | Vì sao `kill` bằng tay không làm container chạy lại, còn crash thật thì có? Khi DB dừng, endpoint nào đổi trạng thái và vì sao? Container `unhealthy` có tự restart không? |
| Nhiệm vụ 5 – Break -> Debug | `git diff` thay đổi gây lỗi, log trước và sau, Health Log, mục Break -> Debug đủ bốn phần | Chỉ có cách sửa, không có quy trình điều tra; nguyên nhân gốc mô tả mơ hồ ("cấu hình sai"); không trả cấu hình về đúng | Em đọc lỗi ở đâu đầu tiên? Cách chạy tay lệnh check trong container là gì? Nếu chỉ tăng `retries` mà không sửa đường dẫn thì chuyện gì xảy ra? |
| Câu hỏi kiểm tra kiến thức | 5 câu ngắn gọn bằng lời học viên | Văn phong và thứ tự ý trùng đoạn văn của lab | Hỏi lại câu 4 hoặc 5 bằng một tình huống mới (ví dụ máy khởi động lại, backend sập mỗi 10 giây) |
| Chất lượng nộp và an toàn | Không có `.env`, `secrets/`, backup trong commit; README đủ 7 câu; có reviewer | `git log -p` hoặc `git ls-files` thấy `.env`, mật khẩu trong evidence | Nếu lỡ commit `.env` thì em làm gì (gỡ khỏi git, đổi mật khẩu, kiểm tra lịch sử)? |
| L2-A backup và restore | Log bảy lần chạy và `ls backups` ra 5 file; restore thấy Carol; `set -euo pipefail`, không có mật khẩu | Script không từ chối file rỗng; restore vào chính database đang chạy mà không giải thích; thiếu `-T` | Vì sao dùng `-T`? Vì sao nên restore vào database trống? Làm sao biết bản backup dùng được mà không chờ lúc sự cố? |
| L2-B secret cho Postgres | `compose.yaml` có `secrets` và `POSTGRES_PASSWORD_FILE`; `inspect` không lộ mật khẩu; `/ready` 200 | Giữ nguyên volume cũ nên không chứng minh được mật khẩu mới; nêu giới hạn chung chung | Vì sao phải khởi động từ volume mới? Backend đang đọc mật khẩu từ đâu? |
| L2-C OOM | Log `OOMKilled` hoặc exit 137 (hoặc ghi rõ kết quả khác và giải thích), số liệu `docker stats` | Giá trị cuối cùng không dựa trên đo đạc | Đặt giới hạn thấp hơn mức đo thì chuyện gì xảy ra với restart policy? |
