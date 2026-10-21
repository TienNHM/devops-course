# Đáp án Technical Assessment (chỉ dành cho mentor)

> **Tóm tắt:** Ngân hàng 64 câu hỏi kèm đáp án và giải thích, hướng dẫn sinh đề, đề thực hành giữa khóa và cuối khóa với thang điểm chi tiết, và biện pháp chống gian lận. Không chia sẻ file này cho học viên.

Bản dành cho học viên: [Technical Assessment](../../curriculum/technical-assessment.md). Cách tính điểm tổng hợp: [Đánh giá](../../curriculum/assessment.md).

## 1. Cách dùng tài liệu

- Ngân hàng có 8 chủ đề, mỗi chủ đề 8 câu, mã câu dạng `LX-01`, `GT-01`, `NW-01`, `DK-01`, `CP-01`, `CI-01`, `K8-01`, `TS-01`.
- Độ khó: D1 (nhớ và hiểu), D2 (áp dụng), D3 (phân tích, tình huống).
- Loại: MC (trắc nghiệm một đáp án), TF (đúng/sai kèm giải thích), SC (tình huống, trả lời ngắn).
- Với TF, học viên phải nêu lý do. Chấm 50% cho kết luận đúng, 50% cho giải thích đúng.
- Với SC, chấm theo ý chính ghi trong phần đáp án (mỗi ý có điểm, xem mục thang điểm).

Phân bố ngân hàng:

| Chủ đề | D1 | D2 | D3 | Tổng |
| --- | --- | --- | --- | --- |
| Linux (LX) | 3 | 3 | 2 | 8 |
| Git (GT) | 3 | 3 | 2 | 8 |
| Networking (NW) | 3 | 3 | 2 | 8 |
| Docker (DK) | 2 | 4 | 2 | 8 |
| Compose (CP) | 3 | 3 | 2 | 8 |
| CI/CD (CI) | 3 | 3 | 2 | 8 |
| Kubernetes (K8) | 2 | 4 | 2 | 8 |
| Troubleshooting (TS) | 2 | 3 | 3 | 8 |
| Tổng | 21 | 26 | 17 | 64 |

## 2. Ngân hàng câu hỏi

### 2.1 Linux

**LX-01 (MC, D1).** Lệnh nào in ra thư mục làm việc hiện tại?

- A. `ls`
- B. `cd ~`
- C. `pwd`
- D. `whoami`

Đáp án: C. `pwd` (print working directory). `ls` liệt kê, `cd ~` chuyển về home, `whoami` in tên user.

**LX-02 (MC, D1).** File có quyền `-rw-r-----` (640). Ai được làm gì?

- A. Chủ sở hữu đọc/ghi, nhóm chỉ đọc, người khác không có quyền.
- B. Chủ sở hữu đọc/ghi, mọi người khác đọc.
- C. Chủ sở hữu đọc, nhóm ghi, người khác không có quyền.
- D. Mọi người đọc/ghi.

Đáp án: A. 6 = rw-, 4 = r--, 0 = ---, theo thứ tự owner, group, others.

**LX-03 (TF, D1).** "Toán tử `>` nối thêm nội dung vào cuối file." Đúng hay sai?

Đáp án: Sai. `>` ghi đè (truncate) file, `>>` mới là nối thêm. Ghi đè nhầm file log hay file cấu hình là lỗi phổ biến.

**LX-04 (MC, D2).** Lệnh nào cho biết tiến trình đang lắng nghe cổng TCP 3000 trong WSL?

- A. `df -h`
- B. `free -m`
- C. `ls /proc`
- D. `ss -ltnp | grep 3000`

Đáp án: D. `ss -ltnp` liệt kê socket TCP đang listen kèm process (cần sudo để thấy process của user khác). `df` xem đĩa, `free` xem RAM.

**LX-05 (MC, D2).** Tại sao nên thử `kill PID` trước `kill -9 PID`?

- A. `kill -9` chậm hơn.
- B. `kill` gửi SIGTERM, cho tiến trình cơ hội đóng kết nối và dọn dẹp; `kill -9` gửi SIGKILL, kết thúc ngay không dọn.
- C. `kill -9` chỉ hoạt động với root.
- D. Hai lệnh giống nhau.

Đáp án: B. SIGKILL không thể bắt hoặc xử lý, có thể để lại file tạm hoặc dữ liệu dở dang.

**LX-06 (TF, D2).** "Trên Windows 11 với WSL2, nên đặt repo trong `/mnt/c/Users/...` để Docker build nhanh nhất." Đúng hay sai?

Đáp án: Sai. Filesystem ext4 của WSL (ví dụ `~/projects`) nhanh hơn nhiều và tránh lỗi quyền file, watcher và line ending. `/mnt/c` đi qua lớp 9P nên chậm.

**LX-07 (SC, D3).** Chạy `./deploy.sh` báo `Permission denied` dù file tồn tại. Nguyên nhân, cách sửa? Nếu lỗi là `bad interpreter: /bin/bash^M` thì khác gì?

Đáp án (mỗi ý 1 điểm trên thang 3): (1) Thiếu quyền thực thi; sửa bằng `chmod +x deploy.sh`. (2) Lỗi `^M` là line ending CRLF của Windows trong shebang; sửa bằng `dos2unix deploy.sh` hoặc `sed -i 's/\r$//' deploy.sh`. (3) Phòng ngừa: cấu hình editor/Git dùng LF cho `.sh`.

**LX-08 (MC, D3).** Vì sao `docker logs api 2>&1 | grep -i error` cần `2>&1`?

- A. Để `grep` chạy nhanh hơn.
- B. `docker logs` phát lại stdout và stderr của container ra đúng hai luồng tương ứng; pipe chỉ nhận stdout, nên cần gộp stderr vào.
- C. Để ghi log ra file.
- D. Không cần, có hay không như nhau.

Đáp án: B. Nhiều ứng dụng ghi lỗi ra stderr; thiếu `2>&1` thì dòng lỗi bỏ qua `grep` và hiện thẳng ra terminal.

### 2.2 Git

**GT-01 (MC, D1).** `git add` làm gì?

- A. Đẩy code lên remote.
- B. Tạo commit.
- C. Đưa thay đổi vào staging area.
- D. Tải code từ remote.

Đáp án: C.

**GT-02 (MC, D1).** `git clone URL` làm gì?

- A. Sao chép repo từ remote về máy, kèm lịch sử và cấu hình remote `origin`.
- B. Chỉ tải file mới nhất, không có lịch sử.
- C. Tạo nhánh mới.
- D. Gộp hai nhánh.

Đáp án: A.

**GT-03 (TF, D1).** "`git fetch` tải commit mới và tự động merge vào nhánh hiện tại." Đúng hay sai?

Đáp án: Sai. `fetch` chỉ cập nhật tham chiếu remote (ví dụ `origin/main`), không đổi nhánh làm việc. `git pull` = `fetch` + merge (hoặc rebase).

**GT-04 (MC, D2).** Lệnh nào tạo nhánh mới và chuyển sang đó?

- A. `git branch feature/x`
- B. `git switch -c feature/x`
- C. `git merge feature/x`
- D. `git checkout main`

Đáp án: B. A chỉ tạo nhánh, không chuyển. (`git checkout -b feature/x` cũng đúng nhưng không có trong lựa chọn.)

**GT-05 (SC, D2).** Bạn commit và push file `.env` chứa mật khẩu database. Hành động đúng theo thứ tự ưu tiên?

Đáp án (mỗi ý 1 điểm trên thang 3): (1) Coi mật khẩu đã lộ: đổi (rotate) mật khẩu ngay. (2) Xóa file khỏi tracking (`git rm --cached .env`), thêm `.env` vào `.gitignore`, commit. (3) Nếu cần, xóa khỏi lịch sử bằng công cụ như `git filter-repo` và force push, nhưng không thay thế bước đổi mật khẩu. Chỉ xóa file bằng commit mới là không đủ vì lịch sử vẫn còn secret.

**GT-06 (TF, D2).** "Branch protection có thể bắt buộc status check (CI) đạt trước khi merge PR." Đúng hay sai?

Đáp án: Đúng. Có thể bật Require status checks to pass và Require pull request reviews trong rule của nhánh `main`.

**GT-07 (SC, D3).** Merge báo conflict ở `app.js`. Mô tả các bước xử lý.

Đáp án (mỗi ý 1 điểm trên thang 4): (1) Mở file, tìm các marker `<<<<<<<`, `=======`, `>>>>>>>` và quyết định nội dung cuối cùng, xóa marker. (2) Chạy test hoặc ít nhất khởi động ứng dụng để chắc code còn đúng. (3) `git add app.js`. (4) Hoàn tất merge bằng `git commit` (hoặc `git merge --continue`). Có thể hủy bằng `git merge --abort` nếu muốn làm lại.

**GT-08 (MC, D3).** Một commit lỗi đã được push lên `main` dùng chung. Cách hoàn tác an toàn nhất?

- A. `git reset --hard HEAD~1` rồi `git push --force`.
- B. Xóa repo và clone lại.
- C. `git revert COMMIT` rồi push.
- D. `git commit --amend` rồi push.

Đáp án: C. `revert` tạo commit mới đảo ngược thay đổi, không viết lại lịch sử đã chia sẻ. A, D viết lại lịch sử và làm hỏng bản của người khác.

### 2.3 Networking

**NW-01 (MC, D1).** Cổng mặc định của HTTPS?

- A. 80
- B. 22
- C. 8080
- D. 443

Đáp án: D.

**NW-02 (MC, D1).** `127.0.0.1` (localhost) trỏ tới đâu?

- A. Router.
- B. Chính máy đang chạy tiến trình đó (loopback).
- C. DNS server.
- D. Máy chủ của nhà cung cấp mạng.

Đáp án: B.

**NW-03 (TF, D1).** "DNS chuyển tên miền thành địa chỉ IP." Đúng hay sai?

Đáp án: Đúng. Trong Docker network tùy chỉnh và Kubernetes, DNS nội bộ chuyển tên service thành IP tương ứng.

**NW-04 (MC, D2).** Cổng mặc định của PostgreSQL?

- A. 3306
- B. 5432
- C. 6379
- D. 27017

Đáp án: B. 3306 là MySQL, 6379 Redis, 27017 MongoDB.

**NW-05 (MC, D2).** Lệnh nào chỉ lấy HTTP response header?

- A. `curl -I http://localhost:8080`
- B. `ping localhost`
- C. `curl -o /dev/null`
- D. `nslookup localhost`

Đáp án: A. `-I` gửi HEAD request và in header.

**NW-06 (TF, D2).** "Ứng dụng trong container lắng nghe `127.0.0.1` thì vẫn truy cập được qua cổng đã publish `-p 3000:3000`." Đúng hay sai?

Đáp án: Sai. Traffic đi vào container từ interface mạng của container, không phải loopback của chính nó. Ứng dụng cần listen `0.0.0.0`.

**NW-07 (SC, D3).** `curl localhost:3000/health` từ host chạy được, nhưng trong container frontend, `curl localhost:3000` thất bại. Giải thích và nêu cách đúng.

Đáp án (thang 3): (1) Trong container, `localhost` là chính container đó, không phải host hay container khác. (2) Cách đúng: gọi bằng tên service trên network chung, ví dụ `http://backend:3000`. (3) Hai container phải cùng một network do Compose tạo (hoặc network tự định nghĩa), vì DNS theo tên service hoạt động trên user-defined network.

**NW-08 (MC, D3).** Nginx proxy `/api/` tới backend, backend đang tắt. Người dùng thường thấy mã nào?

- A. 404 Not Found
- B. 401 Unauthorized
- C. 502 Bad Gateway
- D. 201 Created

Đáp án: C. Proxy không nhận được phản hồi hợp lệ từ upstream. 404 nghĩa là server có phản hồi nhưng không có tài nguyên.

### 2.4 Docker

**DK-01 (MC, D1).** Image khác container thế nào?

- A. Giống nhau.
- B. Image là template chỉ đọc; container là một instance đang chạy (hoặc đã dừng) tạo từ image.
- C. Container là file, image là tiến trình.
- D. Image chỉ chạy được trên Linux.

Đáp án: B.

**DK-02 (MC, D1).** Lệnh nào liệt kê cả container đã dừng?

- A. `docker ps`
- B. `docker images`
- C. `docker ps -a`
- D. `docker stats`

Đáp án: C.

**DK-03 (TF, D2).** "Dữ liệu ghi trong container không dùng volume sẽ mất khi container bị xóa." Đúng hay sai?

Đáp án: Đúng. Dữ liệu nằm trong writable layer của container và bị xóa cùng container. Dữ liệu cần giữ phải dùng volume hoặc bind mount.

**DK-04 (MC, D2).** `docker run -p 8081:80 nginx:1.27-alpine` có nghĩa gì?

- A. Container cổng 8081 nối vào host cổng 80.
- B. Cổng 8081 của host chuyển tiếp vào cổng 80 của container.
- C. Mở cả 8081 và 80 trên container.
- D. Chạy hai instance.

Đáp án: B. Cú pháp là `host:container`.

**DK-05 (MC, D2).** Vì sao nên `COPY package*.json ./` và `RUN npm ci` trước `COPY . .`?

- A. Để image nhỏ hơn mọi trường hợp.
- B. Để tận dụng layer cache: khi chỉ đổi mã nguồn, layer cài dependency được dùng lại.
- C. Bắt buộc theo cú pháp Docker.
- D. Để chạy không cần mạng.

Đáp án: B.

**DK-06 (TF, D2).** "`EXPOSE 3000` trong Dockerfile publish cổng 3000 ra host." Đúng hay sai?

Đáp án: Sai. `EXPOSE` chỉ là metadata tài liệu. Muốn publish phải dùng `-p` hoặc `ports:` trong Compose.

**DK-07 (MC, D3).** Lợi ích chính của multi-stage build?

- A. Build nhanh gấp đôi.
- B. Image cuối chỉ chứa thứ cần để chạy, không kèm công cụ build, nên nhỏ hơn và bề mặt tấn công nhỏ hơn.
- C. Cho phép chạy nhiều container trong một image.
- D. Tự động quét lỗ hổng.

Đáp án: B.

**DK-08 (SC, D3).** `docker build` báo không tìm thấy file khi `COPY config.json /app/`, dù file có trên máy. Nêu các nguyên nhân thường gặp.

Đáp án (thang 3): (1) File nằm ngoài build context (đường dẫn context khác thư mục chứa file). (2) File bị `.dockerignore` loại trừ. (3) Sai tên hoặc chữ hoa/thường (Linux phân biệt). Cách kiểm tra: xem lệnh `docker build` đang truyền context nào và đọc `.dockerignore`.

### 2.5 Compose

**CP-01 (MC, D1).** Lệnh khởi động stack ở chế độ nền?

- A. `docker compose build`
- B. `docker compose up -d`
- C. `docker compose ps`
- D. `docker compose logs`

Đáp án: B.

**CP-02 (MC, D1).** `docker compose down` (không kèm cờ) xóa gì?

- A. Container và network của project, giữ lại named volume.
- B. Chỉ container, giữ network.
- C. Container, network, volume và image.
- D. Không xóa gì.

Đáp án: A.

**CP-03 (TF, D1).** "`docker compose down -v` xóa cả named volume khai báo trong file." Đúng hay sai?

Đáp án: Đúng. Dữ liệu database trong volume đó mất hoàn toàn; chỉ dùng khi chủ đích reset môi trường.

**CP-04 (MC, D2).** Backend kết nối Postgres trong Compose nên dùng host nào?

- A. `localhost`
- B. IP của host Windows.
- C. Tên service, ví dụ `postgres`.
- D. `0.0.0.0`

Đáp án: C. Compose tạo DNS nội bộ theo tên service.

**CP-05 (MC, D2).** `depends_on` với `condition: service_healthy` có tác dụng gì?

- A. Khởi động service sau khi service phụ thuộc vượt healthcheck.
- B. Tự restart khi service phụ thuộc lỗi.
- C. Chỉ đổi thứ tự hiển thị log.
- D. Mở cổng cho service phụ thuộc.

Đáp án: A. Cần service phụ thuộc có `healthcheck`.

**CP-06 (TF, D2).** "Script `init.sql` trong `/docker-entrypoint-initdb.d` của image postgres chạy lại mỗi lần container khởi động." Đúng hay sai?

Đáp án: Sai. Chỉ chạy khi thư mục dữ liệu còn trống (lần khởi tạo đầu). Nếu volume đã có dữ liệu, script bị bỏ qua.

**CP-07 (SC, D3).** Bạn đổi `POSTGRES_PASSWORD` trong `.env` rồi `docker compose up -d`. Backend vẫn báo sai mật khẩu. Vì sao, và xử lý thế nào?

Đáp án (thang 3): (1) Volume đã được khởi tạo với mật khẩu cũ; biến `POSTGRES_PASSWORD` chỉ có tác dụng ở lần init đầu. (2) Cách giữ dữ liệu: đổi mật khẩu bằng `ALTER USER` trong psql cho khớp. (3) Môi trường dev có thể reset bằng `docker compose down -v` (mất dữ liệu) rồi `up -d`.

**CP-08 (MC, D3).** Lệnh nào kiểm tra cú pháp và in ra cấu hình sau khi thay biến môi trường?

- A. `docker compose config`
- B. `docker compose top`
- C. `docker compose events`
- D. `docker compose pause`

Đáp án: A.

### 2.6 CI/CD

**CI-01 (MC, D1).** Continuous Integration là gì?

- A. Triển khai thủ công mỗi tuần.
- B. Tích hợp code thường xuyên và tự động build, test mỗi thay đổi.
- C. Viết tài liệu tự động.
- D. Giám sát production.

Đáp án: B.

**CI-02 (MC, D1).** File workflow GitHub Actions nằm ở đâu?

- A. `.github/workflows/` với đuôi `.yml` hoặc `.yaml`
- B. `workflows/` ở gốc repo
- C. `.actions/`
- D. `.git/hooks/`

Đáp án: A.

**CI-03 (TF, D1).** "`on: pull_request` chạy workflow khi mở hoặc cập nhật PR." Đúng hay sai?

Đáp án: Đúng (mặc định gồm các sự kiện opened, synchronize, reopened).

**CI-04 (MC, D2).** `needs: build` trong một job có nghĩa gì?

- A. Job này chạy sau khi job `build` thành công.
- B. Job này cài công cụ build.
- C. Hai job chạy song song.
- D. Job này bị bỏ qua nếu `build` thành công.

Đáp án: A.

**CI-05 (MC, D2).** Cách đúng để dùng token trong workflow?

- A. Ghi thẳng vào YAML.
- B. Commit vào file `.env`.
- C. Lưu trong repository Secrets (hoặc dùng `GITHUB_TOKEN` có sẵn) và tham chiếu qua context `secrets`.
- D. Đặt trong tên nhánh.

Đáp án: C. Secret không được nằm trong repo.

**CI-06 (TF, D2).** "Để push image lên GHCR bằng `GITHUB_TOKEN`, job cần quyền `packages: write`." Đúng hay sai?

Đáp án: Đúng. Khai báo `permissions` ở workflow hoặc job (ví dụ `contents: read` và `packages: write`). Ngoài ra repo/package cần cho phép Actions ghi.

**CI-07 (MC, D3).** Vì sao nên đặt `permissions: contents: read` ở cấp workflow rồi chỉ nâng quyền cho job cần thiết?

- A. Để workflow chạy nhanh hơn.
- B. Theo nguyên tắc least privilege: giảm thiệt hại nếu một step hoặc action bị khai thác.
- C. Bắt buộc, nếu không workflow không chạy.
- D. Để tiết kiệm phút chạy.

Đáp án: B.

**CI-08 (SC, D3).** Workflow chạy `npm ci` trên Actions thất bại với thông báo `package.json and package-lock.json are not in sync`, trong khi máy bạn chạy được. Nguyên nhân, cách sửa, và điều cần kiểm tra thêm?

Đáp án (thang 3): (1) Lockfile đã commit không khớp `package.json` (hoặc chưa commit lockfile mới). (2) Chạy `npm install` trong thư mục backend, commit `package-lock.json`. (3) Kiểm tra `working-directory` trỏ đúng `starter-project/backend` và phiên bản Node của workflow khớp với local (Node 22).

### 2.7 Kubernetes

**K8-01 (MC, D1).** Đơn vị nhỏ nhất có thể triển khai trong Kubernetes?

- A. Container
- B. Node
- C. Pod
- D. Namespace

Đáp án: C.

**K8-02 (MC, D1).** Deployment quản lý Pod bằng gì, và mang lại gì?

- A. Quản lý qua ReplicaSet, hỗ trợ scale, rolling update và rollback.
- B. Chỉ tạo một Pod duy nhất.
- C. Chỉ dùng để lưu dữ liệu.
- D. Chỉ để định tuyến traffic.

Đáp án: A.

**K8-03 (TF, D2).** "IP của Pod giữ nguyên khi Pod bị tạo lại." Đúng hay sai?

Đáp án: Sai. Pod mới thường nhận IP mới. Vì vậy cần Service (IP và DNS ổn định) để các thành phần gọi nhau.

**K8-04 (MC, D2).** Loại Service mặc định, chỉ truy cập được trong cluster?

- A. NodePort
- B. LoadBalancer
- C. ExternalName
- D. ClusterIP

Đáp án: D.

**K8-05 (MC, D2).** Readiness probe thất bại thì chuyện gì xảy ra?

- A. Container bị restart.
- B. Pod bị xóa vĩnh viễn.
- C. Pod bị loại khỏi danh sách endpoint của Service (không nhận traffic), nhưng không bị restart.
- D. Node bị cô lập.

Đáp án: C. Liveness probe thất bại mới dẫn tới restart container.

**K8-06 (TF, D2).** "Giá trị trong Kubernetes Secret được mã hóa mặc định nên an toàn khi commit lên Git." Đúng hay sai?

Đáp án: Sai. Giá trị chỉ mã hóa base64 (dễ giải mã) và etcd mặc định có thể không mã hóa. Không commit Secret thật; commit file `secret.example.yaml` chứa placeholder.

**K8-07 (MC, D3).** Vì sao image `club-api:1.0.0` build trên Docker Desktop vẫn cần `kind load docker-image`?

- A. Kind node là container có containerd riêng, không thấy image trong Docker của host.
- B. Vì image chưa được push lên Internet cho mọi người.
- C. Vì Kubernetes không chạy image local.
- D. Chỉ để đổi tên image.

Đáp án: A. Giải pháp thay thế là push lên registry mà cluster truy cập được.

**K8-08 (SC, D3).** PVC của Postgres ở `Pending`, chưa có Pod nào dùng nó, trên cluster kind. Bạn có nên lo không? Kiểm tra gì?

Đáp án (thang 3): (1) Không chắc là lỗi: StorageClass mặc định của kind (`standard`) dùng chế độ `WaitForFirstConsumer`, PVC chỉ được bind khi có Pod dùng nó và được schedule. (2) Kiểm tra bằng `kubectl get storageclass` và `kubectl describe pvc`. (3) Nếu Pod đã chạy mà PVC vẫn `Pending`, đọc event để tìm nguyên nhân (không có StorageClass phù hợp, tên sai, dung lượng không thỏa).

### 2.8 Troubleshooting

**TS-01 (MC, D1).** Bước đầu tiên khi một container thoát bất thường?

- A. Cài lại Docker Desktop.
- B. Đọc `docker logs` và exit code (`docker inspect` hoặc `docker ps -a`).
- C. Xóa image.
- D. Khởi động lại máy.

Đáp án: B. Làm theo triệu chứng, không đoán.

**TS-02 (MC, D1).** Lệnh nào cho biết event giải thích vì sao Pod không chạy?

- A. `kubectl get nodes`
- B. `kubectl version`
- C. `kubectl config view`
- D. `kubectl describe pod TEN_POD`

Đáp án: D. Mục Events ở cuối cho biết scheduling, pull image, probe lỗi.

**TS-03 (TF, D2).** "`CrashLoopBackOff` nghĩa là Kubernetes không kéo được image." Đúng hay sai?

Đáp án: Sai. Không kéo được image là `ErrImagePull` rồi `ImagePullBackOff`. `CrashLoopBackOff` là container khởi động rồi thoát liên tục; xem `kubectl logs --previous`.

**TS-04 (MC, D2).** Pod `Pending`, event: "0/1 nodes are available: 1 Insufficient memory". Nguyên nhân?

- A. Image sai tag.
- B. Probe sai đường dẫn.
- C. Secret thiếu key.
- D. `resources.requests.memory` lớn hơn bộ nhớ còn trống của node.

Đáp án: D. Giảm requests hoặc tăng tài nguyên node.

**TS-05 (SC, D2).** `docker run -d ubuntu:24.04` thoát ngay (`Exited (0)`). Vì sao, và làm thế nào để container tồn tại?

Đáp án (thang 2): (1) Tiến trình chính (mặc định `bash`) không có terminal tương tác nên kết thúc ngay; container sống bằng vòng đời tiến trình chính. (2) Chạy một tiến trình dài hạn thật sự (ví dụ `sleep infinity` cho thử nghiệm, hoặc dịch vụ thật) hoặc dùng `-it`.

**TS-06 (SC, D3).** Bước đăng nhập và push image lên `ghcr.io` trong Actions trả về `denied` hoặc unauthorized, bước build trước đó thành công. Nêu các nguyên nhân cần kiểm tra.

Đáp án (thang 3): (1) Thiếu `permissions: packages: write` trong job. (2) Sai username hoặc token trong bước login (dùng `github.actor` và `GITHUB_TOKEN`). (3) Tên image sai dạng (cần `ghcr.io/OWNER/TEN`, owner viết thường) hoặc package đã tồn tại với quyền ghi chưa cấp cho repo.

**TS-07 (SC, D3).** Pod backend `0/1 Running`; `/health` trả 200 nhưng `/ready` trả 503. Chuỗi kiểm tra hợp lý?

Đáp án (thang 4): (1) Hiểu `/ready` kiểm tra kết nối DB, nên nghi lỗi DB. (2) `kubectl logs` của backend để đọc lỗi kết nối. (3) Kiểm tra Service `postgres` có endpoint, Pod postgres Ready. (4) Kiểm tra Secret `club-secrets` đúng key `db-password` và giá trị khớp với postgres. Sau khi sửa, Pod chuyển `1/1`.

**TS-08 (MC, D3).** `docker compose up` báo `port is already allocated` cho cổng 8080. Cách xử lý đúng?

- A. Kill ngẫu nhiên mọi tiến trình.
- B. Xóa Docker.
- C. Xác định tiến trình hoặc container đang giữ cổng (`ss -ltnp`, `docker ps`, hoặc `netstat -ano` trên Windows), rồi dừng nó hoặc đổi cổng host (biến `WEB_PORT`).
- D. Đổi cổng trong container.

Đáp án: C. Nguyên nhân gốc là xung đột cổng trên host, đổi cổng trong container không giải quyết.

## 3. Hướng dẫn sinh đề

### 3.1 Đề lý thuyết giữa khóa (15 câu, 30 điểm, 2 điểm/câu)

Chọn từ chủ đề LX, GT, NW, DK, CP, CI và một ít TS. Dùng bảng phân bổ:

| Chủ đề | Số câu | Gợi ý độ khó |
| --- | --- | --- |
| Linux | 2 | 1 D1, 1 D2 |
| Git | 2 | 1 D1, 1 D2 |
| Networking | 2 | 1 D1, 1 D2 |
| Docker | 3 | 1 D1, 1 D2, 1 D3 |
| Compose | 3 | 1 D1, 1 D2, 1 D3 |
| CI/CD | 2 | 1 D1, 1 D2 |
| Troubleshooting | 1 | D2 |

Chỉ dùng loại MC và TF trong đề giữa khóa (chấm nhanh). Không dùng K8 vì chưa học. Cơ cấu độ khó: 6 câu D1, 6 câu D2, 3 câu D3.

### 3.2 Đề lý thuyết cuối khóa (20 câu, 40 điểm, 2 điểm/câu)

| Chủ đề | Số câu |
| --- | --- |
| Kubernetes (K8) | 7 |
| Troubleshooting (TS) | 4 |
| CI/CD (CI) | 3 |
| Docker + Compose | 3 |
| Networking | 1 |
| Linux + Git | 2 |

Cơ cấu độ khó: 5 câu D1, 8 câu D2, 7 câu D3, trong đó ít nhất 3 câu loại SC. Câu SC chấm theo thang trong ngân hàng, quy đổi về tối đa 2 điểm (ví dụ thang 3 thì mỗi ý 0,67 điểm, làm tròn tới 0,5).

### 3.3 Quy tắc chung

1. Không dùng lại cùng một đề cho hai cohort liên tiếp; tráo thứ tự đáp án A, B, C, D ở câu MC giữa các phiên bản (A/B).
2. Mỗi đề có tối đa 1 câu cùng mã chủ đề cho mỗi mức độ khó nếu số câu của chủ đề đó dưới 3.
3. Tạo hai phiên bản đề (A và B) để học viên ngồi cạnh nhau khác đề. Phiên bản B lấy câu khác mã nhưng cùng chủ đề và cùng độ khó.
4. Rà soát đề: đủ 8 chủ đề (cuối khóa), không có hai câu cùng kiểm một kiến thức, tổng điểm đúng.
5. Sau mỗi kỳ, ghi lại câu có tỉ lệ đúng dưới 30% hoặc trên 95% để chỉnh độ khó hoặc loại bỏ.
6. Câu lý thuyết trong đề không đi kèm đáp án mẫu của mục này khi phát cho học viên; chỉ công bố đáp án sau khi đóng khiếu nại.

## 4. Đề thực hành giữa khóa (60 phút, 70 điểm)

### 4.1 Chuẩn bị

- Tạo thư mục `exam-mid` từ `starter-project/backend` và `starter-project/frontend`, xóa `Dockerfile` của backend, `.dockerignore` và `compose.yaml`. Giữ `database/init.sql`.
- Mỗi học viên làm trong WSL2, thư mục thuộc filesystem của WSL.
- Máy đã cache sẵn image `node:22-alpine`, `postgres:17-alpine`, `nginx:1.27-alpine` để tránh phụ thuộc mạng. Kiểm tra trước giờ thi bằng `docker pull` các tag này.
- Cấp một bảng tham số (xem mục 6) cho mỗi học viên.

### 4.2 Đề bài (phát cho học viên)

Bạn nhận ứng dụng của một CLB: backend Node.js, frontend Nginx, database Postgres. Thực hiện:

1. Phần A, Dockerfile cho backend (25 điểm): multi-stage, pin phiên bản base, chạy non-root, có `.dockerignore`, tận dụng layer cache. Đặt tên image theo tham số đề.
2. Phần B, Compose (30 điểm): ba service, network riêng có tên theo tham số, volume có tên cho postgres, healthcheck cho postgres, backend chờ postgres khỏe, cấu hình qua `.env` (không hard-code mật khẩu), `restart: unless-stopped` cho backend, cổng web theo tham số.
3. Phần C, Kiểm chứng (10 điểm): `curl` tới `/health` và `/api/members` qua frontend; chứng minh dữ liệu còn sau `docker compose down` rồi `up -d`; chứng minh dữ liệu mất sau `down -v` và giải thích vì sao.
4. Phần D, Giải thích (5 điểm): trả lời miệng hoặc viết vào `NOTES.md` ba câu hỏi ở mục 4.4.

Phân bổ thời gian gợi ý: đọc đề 5 phút, Dockerfile 20 phút, Compose 25 phút, kiểm chứng 7 phút, giải thích 3 phút.

### 4.3 Thang điểm chi tiết

| Phần | Tiêu chí | Điểm |
| --- | --- | --- |
| A | `docker build` thành công, image đúng tên | 5 |
| A | Base image có tag cụ thể (không `latest`) | 3 |
| A | Multi-stage: stage cài dependency tách khỏi stage chạy, không mang công cụ build vào image cuối | 5 |
| A | Chạy bằng user không phải root (kiểm bằng `docker run --rm IMAGE id`) | 5 |
| A | `.dockerignore` loại `node_modules`, `.git`, `.env` | 3 |
| A | Thứ tự layer tận dụng cache (copy manifest và cài dependency trước khi copy mã) | 4 |
| B | Cả ba service lên (`docker compose ps`) | 5 |
| B | Network có tên theo tham số, service gọi nhau bằng tên | 3 |
| B | Postgres dùng named volume đúng đường dẫn dữ liệu | 5 |
| B | Healthcheck postgres và `depends_on` với `service_healthy` | 6 |
| B | Mật khẩu và cổng đọc từ `.env`, có `.env.example`, `.env` không nằm trong repo | 4 |
| B | `restart` đặt đúng | 2 |
| B | Cổng web đúng tham số, frontend truy cập được | 5 |
| C | `/health` và `/api/members` trả đúng qua frontend | 4 |
| C | Chứng minh dữ liệu còn sau `down`/`up -d` | 3 |
| C | Giải thích đúng hiện tượng mất dữ liệu sau `down -v` | 3 |
| D | Ba câu giải thích | 5 |

Tổng: 25 + 30 + 10 + 5 = 70 điểm. Điểm giữa khóa (thang 100) = điểm trắc nghiệm (tối đa 30) + điểm thực hành (tối đa 70).

Quy ước trừ điểm: có secret thật hoặc mật khẩu cố định trong file được commit: trừ 3 điểm ở mục `.env`. Chạy root nhưng có giải thích hợp lý (ví dụ dev nhanh): không cho điểm mục non-root nhưng không trừ thêm.

### 4.4 Câu hỏi giải thích (Phần D)

1. Vì sao backend trong Compose kết nối DB bằng tên service mà không dùng `localhost`? (2 điểm: container có network namespace riêng, DNS nội bộ theo tên service.)
2. `depends_on` thường khác `depends_on` với `service_healthy` thế nào? (2 điểm: thường chỉ đảm bảo thứ tự khởi động, không đảm bảo sẵn sàng.)
3. Vì sao `init.sql` không chạy lại khi bạn recreate postgres mà volume vẫn còn? (1 điểm: chỉ chạy khi thư mục dữ liệu trống.)

### 4.5 Gợi ý đáp án mẫu (Dockerfile và Compose rút gọn)

Đây là hướng đúng, không phải bản duy nhất. Điều chỉnh tên theo tham số của từng đề.

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks: [exam-net]

  backend:
    build: ./backend
    image: ${API_IMAGE}
    environment:
      DB_HOST: postgres
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks: [exam-net]

  frontend:
    build: ./frontend
    ports:
      - "${WEB_PORT}:80"
    depends_on:
      - backend
    networks: [exam-net]

volumes:
  pgdata:

networks:
  exam-net:
```

Lưu ý khi chấm: tên biến `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` khớp với `starter-project/backend/db.js` và `compose.yaml` của starter-project tại thời điểm viết. Backend nghe cổng qua biến `PORT` (mặc định theo `server.js`). Nếu bạn đổi code backend, đối chiếu lại đề. Hãy chạy thử toàn bộ đáp án mẫu trên máy chuẩn bị trước kỳ thi.

## 5. Đề thực hành cuối khóa (90 phút, 60 điểm)

### 5.1 Chuẩn bị

- Mỗi học viên một namespace riêng, ví dụ `exam-01`, `exam-02`, trên cụm kind của chính học viên hoặc cụm chung do mentor dựng (với cụm chung, giới hạn quyền theo namespace bằng RBAC).
- Mentor chuẩn bị bộ manifest gốc (từ thư mục `k8s/` của starter-project) và áp dụng các lỗi theo bảng dưới. Mỗi đề chọn 5 lỗi trong 6 lỗi.
- Image `club-api:1.0.0` và `club-web:1.0.0` đã được nạp vào cụm bằng `kind load docker-image`.
- Cung cấp cho học viên: kubeconfig, tên namespace, danh sách triệu chứng (không có nguyên nhân), mẫu `NOTES.md`.

### 5.2 Danh sách lỗi

| Mã | Triệu chứng học viên nhận | Nguyên nhân gốc (mentor gieo) | Cách sửa đúng | Kiểm chứng |
| --- | --- | --- | --- | --- |
| F1 | Pod `ErrImagePull` rồi `ImagePullBackOff` | Tag image sai (ví dụ `club-api:1.0.1` hoặc sai tên) | Sửa `image` về tag có trong cụm | Pod `Running`, `READY 1/1` |
| F2 | Service có nhưng `kubectl get endpoints` rỗng, gọi Service timeout | Label trong `selector` của Service không khớp label Pod | Sửa selector hoặc label cho khớp | Endpoint có IP Pod, `curl` qua Service được |
| F3 | Pod `Running` nhưng `0/1`, log backend bình thường | Readiness probe trỏ sai đường dẫn hoặc cổng (ví dụ `/healthz`) | Sửa probe về `/ready` cổng 3000 | Pod `1/1` |
| F4 | Pod `CreateContainerConfigError` | `secretKeyRef` dùng sai tên key (ví dụ `db-pass` thay vì `db-password`) | Sửa tên key hoặc Secret cho khớp | Pod khởi động, `/ready` trả 200 |
| F5 | Pod `Pending` | `resources.requests` quá lớn (ví dụ 64Gi bộ nhớ) | Giảm requests về mức hợp lý | Pod được schedule và `Running` |
| F6 | Truy cập `club.localhost` trả 404 hoặc 503 | Ingress trỏ sai tên Service hoặc cổng backend | Sửa `service.name` hoặc `port.number` | `curl -H` host (hoặc trình duyệt) trả đúng |

Ghi chú cho mentor: F4 hiển thị trạng thái `CreateContainerConfigError` khi key không tồn tại trong Secret, phần chi tiết nằm ở event của `kubectl describe pod`. F6 chỉ kiểm chứng được nếu cụm có ingress controller và cổng map đúng theo `kind-config.yaml`; nếu không dùng ingress trong kỳ thi thì thay F6 bằng lỗi cổng `targetPort` của Service sai (Service không tới được Pod).

### 5.3 Đề bài (phát cho học viên)

Ứng dụng CLB trong namespace của bạn đang hỏng. Với mỗi triệu chứng được giao: xác định nguyên nhân gốc, sửa, chứng minh đã sửa. Không xóa namespace, không tạo lại cụm. Bạn được sửa manifest và áp dụng lại bằng `kubectl apply`. Ghi lại vào `NOTES.md`: lệnh đã dùng, nguyên nhân gốc, cách sửa, cách phòng ngừa.

### 5.4 Thang điểm

Mỗi lỗi 10 điểm, 5 lỗi là 50 điểm, cộng 10 điểm tổng hợp.

| Tiêu chí mỗi lỗi | Điểm |
| --- | --- |
| Xác định đúng nguyên nhân gốc bằng lệnh quan sát (`get`, `describe`, `logs`, `events`), không đoán | 4 |
| Sửa đúng ở nguồn (manifest), không vá tạm bằng `kubectl edit` mà không cập nhật file | 4 |
| Kiểm chứng bằng lệnh phù hợp (không chỉ nhìn một lần) | 2 |

Tổng hợp (10 điểm): `NOTES.md` rõ ràng, có timeline (3 điểm); nêu được cách phòng ngừa cho từng lỗi (3 điểm); thứ tự điều tra hợp lý, có ưu tiên (2 điểm); thao tác sạch, không để lại tài nguyên thừa hoặc thay đổi ngoài phạm vi (2 điểm).

Giảm điểm: nếu học viên sửa được nhưng không giải thích đúng nguyên nhân khi mentor hỏi, giảm tối đa 4 điểm ở lỗi đó. Nếu dùng gợi ý từ mentor, trừ 2 điểm mỗi lần ở lỗi liên quan.

Điểm cuối khóa (thang 100) = điểm lý thuyết (tối đa 40) + điểm thực hành (tối đa 60).

### 5.5 Gợi ý nhanh từng lỗi (cho mentor)

- F1: `kubectl describe pod` cho event "Failed to pull image ... not found". Phân biệt với trường hợp cần `kind load docker-image` (image có tag đúng nhưng chưa nạp vào cluster).
- F2: `kubectl get endpoints TEN_SERVICE`; so `kubectl get svc -o yaml` (`selector`) với `kubectl get pods --show-labels`.
- F3: `kubectl describe pod` cho event "Readiness probe failed: HTTP probe failed with statuscode: 404"; xác nhận bằng `kubectl exec` hoặc `port-forward` tới `/ready`.
- F4: `kubectl describe pod` cho event dạng "couldn't find key ... in Secret"; kiểm `kubectl get secret -o yaml` để xem tên key.
- F5: `kubectl describe pod` cho event `FailedScheduling` "Insufficient memory".
- F6: `kubectl describe ingress`, `kubectl get endpoints` cho Service được trỏ tới.

Chỉ chắc chắn các thông điệp event ở mức ý nghĩa; chữ chính xác có thể khác theo phiên bản Kubernetes, hãy chạy thử từng lỗi trên cụm chuẩn bị đề trước ngày thi.

## 6. Chống gian lận: đổi tham số đề

### 6.1 Bảng tham số đề giữa khóa

Mỗi học viên nhận một dòng. Ví dụ:

| Mã đề | Tên image | Cổng web | Tên network | Tên volume | DB name | User trong container |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | `exam-api:m1` | 8101 | `net-m1` | `data-m1` | `club_m1` | `node` |
| M2 | `exam-api:m2` | 8102 | `net-m2` | `data-m2` | `club_m2` | `appuser` (tự tạo) |
| M3 | `exam-api:m3` | 8103 | `net-m3` | `data-m3` | `club_m3` | `node` |
| M4 | `exam-api:m4` | 8104 | `net-m4` | `data-m4` | `club_m4` | `appuser` (tự tạo) |

Biến thể bổ sung (chọn 1 cho mỗi đề): thêm biến môi trường `APP_NAME` hiển thị ở `/health`; bắt buộc healthcheck backend trong Compose; thêm cột `email` vào bảng; đổi thời gian `interval` của healthcheck. Không dùng cổng 8080, 3000, 5432, 80, 443 để tránh xung đột với môi trường học.

### 6.2 Bảng tham số đề cuối khóa

- Chọn 5 trong 6 lỗi (F1 đến F6) theo tổ hợp khác nhau cho mỗi học viên hoặc mỗi nhóm hai người ngồi cạnh nhau (ví dụ M1 bỏ F6, M2 bỏ F5, M3 bỏ F4, ...).
- Đổi giá trị cụ thể: tag sai là `1.0.1`, `1.0.0-rc`, hoặc sai tên `club-apii`; tên key Secret sai khác nhau; label sai khác nhau; probe trỏ `/healthz`, `/readyz` hoặc cổng `8080`.
- Đổi tên namespace và tên Deployment theo mã đề.
- Gieo lỗi bằng script riêng của mentor (đừng để học viên thấy script) và lưu bảng tổ hợp vào file chấm điểm cục bộ.

### 6.3 Biện pháp khác

1. Giám sát: mentor đi lại phòng thi, kiểm tra màn hình ngẫu nhiên; không mở chatbot AI hay diễn đàn.
2. Vấn đáp ngắn 2 đến 3 phút trên ít nhất 30% bài, chọn ngẫu nhiên, để xác minh học viên hiểu bài mình nộp.
3. So sánh `NOTES.md` và lịch sử lệnh (`history`) của học viên: nếu hai bài giống nhau bất thường (cùng lỗi chính tả, cùng thứ tự lệnh dài), gọi vấn đáp.
4. Lấy dấu thời gian commit trên nhánh `assessment`; commit ngoài giờ thi không được tính.
5. Dùng hai phiên bản đề A/B cho lý thuyết và đổi thứ tự câu.
6. Ngân hàng được bổ sung 10 đến 15 câu mới sau mỗi khóa; không công bố đáp án đầy đủ cho học viên.
7. Phát hiện gian lận: ghi biên bản, điểm phần liên quan bằng 0 ở lần đầu, báo trưởng ban học thuật. Ưu tiên xử lý bằng trao đổi trước khi kết luận.

## 7. Rà soát trước kỳ thi

- [ ] Chạy thử toàn bộ đáp án mẫu và đề thực hành trên một máy sạch (WSL2, Docker Desktop, kind).
- [ ] Đối chiếu tên biến môi trường và đường dẫn với `starter-project`.
- [ ] Đã in hoặc gửi đúng bảng tham số cho từng học viên.
- [ ] Đã pull trước image cần thiết, kiểm tra không phụ thuộc mạng.
- [ ] Đã tạo hai phiên bản đề lý thuyết A/B.
- [ ] Đã công bố thể thức, quy định, giờ và địa điểm cho học viên ít nhất 1 tuần trước.
