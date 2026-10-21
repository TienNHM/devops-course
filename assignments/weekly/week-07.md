# Bài tập tuần 7 – Docker Compose

> **Tóm tắt:** Dựng toàn bộ starter-project (frontend, backend, postgres) bằng một file `compose.yaml` cấu hình qua `.env`, thêm healthcheck và restart policy, chứng minh vòng đời dữ liệu bằng log thật, rồi (tùy chọn) tự động hóa backup/restore PostgreSQL.

**Hạn nộp:** trước buổi đầu tiên của tuần 08.
**Hình thức:** Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-13/` và `lab-14/`.
**Bài lab liên quan:** [Buổi 13 – Docker Compose](../../labs/week-07/session-13.md), [Buổi 14 – Production-minded Compose](../../labs/week-07/session-14.md).
**Mẫu nộp bài:** [templates/lab-template.md](../../templates/lab-template.md).

## Bối cảnh

Đến tuần 6 bạn đã tự chạy từng container bằng `docker run`, tự tạo network và volume. Với ba thành phần của ứng dụng Club Management, bạn phải gõ nhiều lệnh dài theo đúng thứ tự, và chỉ cần quên một cờ là API không nối được database. Docker Compose gom toàn bộ mô tả đó vào một file để cả nhóm chạy lại giống hệt nhau bằng một lệnh.

Tuần này bạn làm hai việc nối tiếp nhau. Ở `lab-13/`, bạn dựng hệ thống ba service, hiểu rõ vai trò từng khóa trong `compose.yaml` và vòng đời dữ liệu (`down` khác `down -v`). Ở `lab-14/`, bạn nâng cấp cấu hình theo hướng gần với môi trường thật: healthcheck, `depends_on` có điều kiện, restart policy, và kiểm chứng hành vi khi một service chết hoặc chưa sẵn sàng.

Bài tập chỉ dùng kiến thức của Buổi 13 và Buổi 14. Nếu bị kẹt, đọc lại các phần "Lỗi thường gặp" và "Phá lỗi và debug" của hai bài lab trước khi hỏi mentor. Mọi lệnh chạy trong terminal WSL2, trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Dựng hệ thống ba service bằng Compose

Trong `lab-13/source/`, đưa starter-project vào (hoặc tham chiếu tới bản của bạn) và chạy toàn bộ hệ thống bằng `docker compose up -d --build`.

Tiêu chí hoàn thành:

- `lab-13/source/compose.yaml` có đủ ba service `frontend`, `backend`, `postgres`, một network `club-network` và một volume `postgres-data`. Postgres không publish cổng ra máy chủ.
- Mật khẩu database chỉ xuất hiện trong `.env` (không commit). Repo có `.env.example` chỉ chứa giá trị mẫu, và `.gitignore` chặn `.env`.
- `docker compose config --quiet` thành công (có log, kèm exit code).
- `docker compose ps` cho thấy cả ba service chạy; `curl -s http://localhost:8080/api/members` (hoặc cổng `WEB_PORT` của bạn) trả về JSON có Alice và Bob.
- Có log chứng minh service gọi nhau bằng tên: `docker compose exec` vào `frontend` hoặc `backend` rồi gọi `backend`/`postgres` theo tên service (không dùng IP).

### Nhiệm vụ 2. Chứng minh vòng đời dữ liệu

Thêm một thành viên mới (Carol) vào database, rồi chứng minh dữ liệu sống sót hay mất qua từng thao tác.

Tiêu chí hoàn thành:

- Có đủ ba lần gọi `/api/members` được ghi vào log theo thứ tự: (1) sau khi thêm Carol, (2) sau `docker compose down` rồi `up -d`, (3) sau `docker compose down -v` rồi `up -d`.
- Kết quả (2) còn Carol, kết quả (3) mất Carol. Mỗi lần gọi có dòng lệnh đi kèm ngay phía trên trong cùng file log.
- `report.md` giải thích bằng 3 đến 5 câu vì sao hai kết quả khác nhau, nhắc tới volume `postgres-data` và `init.sql`.

### Nhiệm vụ 3. Healthcheck cho cả ba service và thứ tự khởi động

Trong `lab-14/source/`, nâng cấp `compose.yaml` để mỗi service có healthcheck và thứ tự khởi động dựa trên trạng thái healthy.

Tiêu chí hoàn thành:

- Postgres có healthcheck dùng `pg_isready`; `backend` và `frontend` có healthcheck riêng (có `interval`, `timeout`, `retries`, `start_period`).
- `backend` dùng `depends_on` với `condition: service_healthy` tới `postgres`; `frontend` tương tự tới `backend`.
- `docker compose ps` trong log cho thấy cả ba service `(healthy)`.
- Có log `docker inspect` phần `.State.Health.Log` của ít nhất một service, cho thấy các lần check thực tế.
- `report.md` trả lời bằng lời của bạn: nếu không có `condition: service_healthy` thì lần khởi động đầu có thể sai ở đâu.

### Nhiệm vụ 4. Restart policy và hành vi khi DB dừng

Kiểm chứng bằng thực nghiệm chứ không chỉ đọc tài liệu.

Tiêu chí hoàn thành:

- Mỗi service có khóa `restart` được chọn có chủ đích (nêu lý do trong `report.md`).
- Log cho thấy một lần backend thoát bất thường (ví dụ gọi `/api/members` rồi `docker compose stop postgres`, hoặc OOM kill) làm backend tự chạy lại (kèm kết quả `docker inspect` của `RestartCount` và tên policy), trong khi `docker compose stop backend` làm nó nằm yên ở trạng thái `Exited`. Lưu ý Docker Engine bản mới không restart container sau lệnh `docker compose kill`; nếu bạn thử `kill`, hãy ghi lại kết quả thật và giải thích.
- Log cho thấy khi tạm dừng `postgres`: `/health` của backend trả mã 200 còn `/ready` trả 503 (ghi mã trạng thái bằng `curl -s -o /dev/null -w "%{http_code}\n"`), rồi trở lại 200 sau khi chạy lại postgres.
- `report.md` giải thích khác biệt giữa `/health` và `/ready` và nên chọn endpoint nào cho healthcheck của Compose (3 đến 5 câu, có nêu hệ quả).

### Nhiệm vụ 5. Break -> Debug: healthcheck quá ngặt

Tự gây một lỗi có kiểm soát theo tình huống trong Buổi 14, rồi điều tra như trong một sự cố thật.

Tiêu chí hoàn thành:

- Bạn sửa một tham số healthcheck (ví dụ `timeout`, `retries`, đường dẫn kiểm tra hoặc `start_period`) khiến service bị `unhealthy` hoặc chặn service phụ thuộc. Ghi lại thay đổi bằng `git diff` trong log.
- `report.md` có mục Break -> Debug gồm bốn phần: triệu chứng quan sát được, các lệnh bạn đã dùng để điều tra (`docker compose ps`, `logs`, `inspect`), nguyên nhân gốc, cách sửa và cách phòng tránh.
- Log cho thấy trạng thái trước khi sửa (`unhealthy` hoặc chặn khởi động) và sau khi sửa (`healthy`), có `exit code:` của lệnh kiểm tra.
- Bạn trả cấu hình về trạng thái đúng và `docker compose ps` lại sạch (healthy) trước khi nộp.

## Nhiệm vụ L2 (nâng cao)

Làm tối đa 2 trong 3 thử thách. Mỗi thử thách có tiêu chí riêng; phần này là điểm thưởng, tối đa 10 điểm.

### Thử thách A. Backup và restore PostgreSQL có kiểm chứng

Viết `lab-14/source/backup.sh` và `lab-14/source/restore.sh`.

Tiêu chí hoàn thành:

- `backup.sh` tạo file `backups/clubdb-YYYYmmdd-HHMMSS.sql` từ container postgres bằng `pg_dump`, từ chối lưu file rỗng, và chỉ giữ 5 bản mới nhất.
- Script không chứa mật khẩu và chạy được từ thư mục khác (dùng `cd "$(dirname "$0")"`); dùng `set -euo pipefail`.
- Log chạy `backup.sh` bảy lần cho kết quả `ls backups | wc -l` bằng `5`.
- `restore.sh` nhận đường dẫn file backup làm tham số, restore vào một database trống, và log cho thấy dữ liệu (Carol) quay lại sau khi bạn cố tình xóa nó. Thư mục `backups/` có trong `.gitignore`.

### Thử thách B. Secret cho Postgres bằng file

Thay biến `POSTGRES_PASSWORD` bằng cơ chế đọc mật khẩu từ file.

Tiêu chí hoàn thành:

- `compose.yaml` dùng khóa `secrets` và biến `POSTGRES_PASSWORD_FILE` cho postgres; file mật khẩu nằm trong thư mục bị `.gitignore` chặn.
- `docker compose config` hoặc `docker inspect` của postgres không còn giá trị mật khẩu ở dạng biến môi trường thường.
- Hệ thống vẫn khởi động sạch từ volume mới và `/ready` của backend trả 200.
- `report.md` nêu một giới hạn của cách này (ví dụ file vẫn nằm trên đĩa máy chủ, backend vẫn cần mật khẩu theo cách khác).

### Thử thách C. Resource limits và OOM có kiểm soát

Đặt giới hạn bộ nhớ cho backend và quan sát hành vi.

Tiêu chí hoàn thành:

- Đặt giới hạn bộ nhớ quá thấp, có log `docker inspect` cho `OOMKilled` hoặc exit code 137 (hoặc ghi lại chính xác những gì xảy ra nếu máy bạn cho kết quả khác, kèm giải thích).
- Chọn giá trị cuối cùng dựa trên đo đạc `docker stats --no-stream`, không đoán; ghi số liệu vào `report.md`.
- Compose vẫn cho ba service `(healthy)` với giá trị cuối cùng.

## Bằng chứng cần nộp

Cấu trúc thư mục theo mẫu lab:

```text
lab-13/
├── README.md
├── report.md
├── source/
│   ├── compose.yaml
│   ├── .env.example
│   └── .gitignore
├── screenshots/
└── evidence/
    ├── command-output.txt
    └── test-results.txt
lab-14/
├── README.md
├── report.md
├── source/
│   ├── compose.yaml
│   ├── .env.example
│   ├── backup.sh            (L2, Thử thách A)
│   ├── restore.sh           (L2, Thử thách A)
│   └── .gitignore
├── screenshots/
└── evidence/
    ├── command-output.txt
    └── test-results.txt
```

Bằng chứng theo từng nhiệm vụ:

| Nhiệm vụ | Bằng chứng bắt buộc |
| --- | --- |
| 1 | `compose.yaml`, `.env.example`; log `docker compose config --quiet` kèm exit code, `docker compose ps`, `curl /api/members`, lệnh `exec` gọi service theo tên; `git ls-files` hoặc `git status` chứng minh `.env` không bị theo dõi |
| 2 | Ba lần gọi `/api/members` kèm lệnh `down`, `down -v`, `up -d` trong `lab-13/evidence/command-output.txt`; giải thích trong `report.md` |
| 3 | `lab-14/source/compose.yaml` có healthcheck và `depends_on` điều kiện; log `docker compose ps` (healthy) và `docker inspect` Health Log |
| 4 | Log thoát bất thường so với `stop`, `RestartCount`, mã HTTP của `/health` và `/ready` khi postgres dừng và khi chạy lại; ghi vào `lab-14/evidence/test-results.txt` |
| 5 | `git diff` của thay đổi gây lỗi, log trước và sau khi sửa, mục Break -> Debug trong `lab-14/report.md` |
| L2-A | `backup.sh`, `restore.sh`, log chạy bảy lần và `ls backups` đếm 5 file, log restore và `/api/members` sau restore |
| L2-B | `compose.yaml` dùng `secrets`, log `docker inspect` không lộ mật khẩu, `/ready` 200 |
| L2-C | Log `OOMKilled`/exit code, số liệu `docker stats`, giá trị cuối cùng và lý giải |

Quy ước: mỗi lệnh trong `command-output.txt` được ghi dưới dạng dòng bắt đầu bằng `$ ` rồi tới output thật. Ảnh chụp màn hình chỉ bổ trợ, không thay cho log và source. Đừng đưa mật khẩu thật vào log; che giá trị nhạy cảm trước khi nộp.

## Barem chấm

| Tiêu chí | Mô tả đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: hệ thống ba service chạy bằng Compose | `compose.yaml` đủ service, network, volume; mật khẩu nằm ở `.env`; `/api/members` trả dữ liệu; có log gọi theo tên service | Thiếu service, mật khẩu hard-code, hoặc không có log chạy thật | 20 |
| Nhiệm vụ 2: vòng đời dữ liệu | Ba lần gọi theo đúng thứ tự, kết quả (2) còn Carol, (3) mất Carol; giải thích đúng | Thiếu lần gọi, sai thứ tự, hoặc giải thích không nhắc tới volume | 15 |
| Nhiệm vụ 3: healthcheck và `depends_on` điều kiện | Cả ba service healthy, `condition: service_healthy` đúng, có Health Log | Thiếu healthcheck của một service hoặc `depends_on` chưa có điều kiện | 20 |
| Nhiệm vụ 4: restart policy và `/health`, `/ready` | Log thoát bất thường và `stop` đối chiếu đúng; mã 200 và 503 đúng; giải thích đúng | Chỉ nêu lý thuyết, không có log thực nghiệm | 15 |
| Nhiệm vụ 5: Break -> Debug | Có diff, triệu chứng, quy trình điều tra, nguyên nhân gốc và cách phòng tránh | Chỉ mô tả cách sửa, không có quy trình điều tra | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng và ngắn gọn trong `report.md` (2 điểm mỗi câu) | Sai ý chính hoặc sao chép nguyên văn từ bài lab | 10 |
| Chất lượng nộp bài và an toàn | Cấu trúc thư mục đúng, README trả lời 7 câu của template, không lộ secret, PR được review | Thiếu README, commit `.env` hoặc secret | 10 |
| Tổng | | | 100 |
| Điểm thưởng L2 | Mỗi thử thách đạt đủ tiêu chí cộng tối đa 5 điểm; tổng thưởng tối đa 10 | Thiếu tiêu chí đo được thì không cộng | +10 |

Ghi chú chấm: mentor có thể chạy lại `docker compose up -d` từ `source/` của bạn trên máy khác. Bài nộp không chạy lại được chỉ nhận tối đa một nửa điểm của các nhiệm vụ liên quan.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) trong phần cuối của `lab-14/report.md`, bằng lời của bạn.

1. `depends_on` mặc định khác gì `depends_on` có `condition: service_healthy`? Cho một ví dụ lỗi mà cách mặc định gây ra.
2. Vì sao dữ liệu PostgreSQL còn sau `docker compose down` nhưng mất sau `docker compose down -v`?
3. Trong Compose, các service gọi nhau bằng tên (ví dụ `postgres`) hoạt động nhờ đâu, và vì sao cấu hình `DB_HOST: localhost` trong backend là sai?
4. Khi nào `restart: unless-stopped` giúp được bạn, và khi nào nó che giấu một lỗi thật?
5. Vì sao không nên publish cổng của postgres ra máy chủ trong dự án này, và cách nào đưa mật khẩu vào cấu hình mà không commit nó?

## Lỗi hay bị trừ điểm

- Commit file `.env`, password hoặc token vào repo (trừ nặng ở tiêu chí an toàn).
- `compose.yaml` ghi sẵn mật khẩu thật thay vì dùng biến từ `.env`.
- Log không có dòng lệnh đi kèm, hoặc output được gõ tay thay vì lấy từ lần chạy thật.
- Chỉ nộp ảnh chụp màn hình, không có `source/` và `evidence/`.
- `depends_on` thiếu `condition`, nên chỉ đảm bảo thứ tự khởi động chứ không đảm bảo sẵn sàng.
- Dùng `localhost` để healthcheck hoặc kết nối DB giữa các container thay vì `127.0.0.1` (trong healthcheck) hoặc tên service.
- Publish cổng postgres ra máy chủ, gây xung đột với PostgreSQL cài sẵn.
- Làm việc trong `/mnt/c` hoặc dùng `docker-compose` (v1) thay vì `docker compose`.
- Gây lỗi ở Nhiệm vụ 5 nhưng không trả cấu hình về trạng thái đúng trước khi nộp.
- Nộp file backup hoặc thư mục secret vào repo.
- Trả lời câu hỏi kiểm tra bằng cách chép lại đoạn văn của bài lab.

## Quy trình nộp

1. Tạo branch trong repo cá nhân, ví dụ `git switch -c week-07`.
2. Hoàn thành `lab-13/` và `lab-14/` theo cấu trúc ở trên, commit nhiều lần với thông điệp rõ ràng.
3. Chạy lại `docker compose up -d` từ `source/` trên một thư mục sạch để chắc chắn bài chạy lại được.
4. Push branch và mở Pull Request vào nhánh chính của repo cá nhân.
5. Nhờ một bạn review PR: người review đối chiếu với barem, để lại ít nhất 2 nhận xét cụ thể (một điểm tốt, một điểm cần sửa).
6. Sửa theo nhận xét, rồi gắn mentor vào PR để chấm.
7. Hạn nộp: trước buổi đầu tiên của tuần 08.

## Checklist trước khi nộp

- [ ] `lab-13/` và `lab-14/` có đủ `README.md`, `report.md`, `source/`, `evidence/`
- [ ] `README.md` trả lời 7 câu hỏi trong template và đánh dấu level đã làm
- [ ] `docker compose config --quiet` thành công trên cả hai `compose.yaml`
- [ ] `docker compose up -d` chạy lại được từ `source/` và cả ba service `(healthy)`
- [ ] `evidence/command-output.txt` chứa lệnh và kết quả thật, mỗi lệnh có dòng `$ `
- [ ] Log đủ ba lần gọi `/api/members` cho Nhiệm vụ 2 và mã 200/503 cho Nhiệm vụ 4
- [ ] Mục Break -> Debug trong `report.md` có triệu chứng, điều tra, nguyên nhân gốc, phòng tránh
- [ ] Đã trả lời 5 câu hỏi kiểm tra kiến thức
- [ ] Không commit `.env`, `secrets/`, backup, password, token, private key
- [ ] PR đã được ít nhất một bạn review
