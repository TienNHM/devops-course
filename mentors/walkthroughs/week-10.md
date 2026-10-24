# Đáp án tuần 10 – CD & Pipeline Security

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng trang này để chấm bài. Tag, digest, số lỗ hổng và thời gian trên máy học viên sẽ khác tài liệu; chấm theo output thật của máy học viên.
:::

> **Tóm tắt:** Hướng dẫn giải Buổi 19 (deploy local bằng script, health check, rollback, workflow_dispatch) và Buổi 20 (permissions, quét image, SBOM, pin SHA), kèm đáp án bài tập và hướng dẫn chấm.

## Cách dùng tài liệu này

Dùng để đối chiếu cách nghĩ và cách điều tra, không phải để chép lệnh. Mỗi buổi có các phần: đáp án L1, đáp án phần nâng cao hoặc lời giải L2, lời giải phần Phá lỗi và những hiểu lầm hay gặp. Cuối tài liệu là gợi ý cho bài tập tuần, hướng dẫn chấm và mã lời giải L2. Bài gốc: [Buổi 19](../../labs/week-10/session-19.md), [Buổi 20](../../labs/week-10/session-20.md) và [bài tập tuần 10](../../assignments/weekly/week-10.md). Barem: [Hướng dẫn chấm tuần 10](../grading/week-10.md).

Phạm vi đã kiểm chứng bằng Docker (tên container, mạng, volume và cổng riêng): `deploy-local.sh` với các tình huống từ chối `latest`, deploy lần một và hai, rollback, rollback lần hai, deploy bản hỏng tự rollback, tag không tồn tại, đổi mật khẩu; quét Trivy 0.57.1, SBOM, `trivy config` và `git ls-remote`. Registry được thay bằng registry cục bộ tạm thời, logic script giữ nguyên. Chưa kiểm chứng: workflow trên GitHub Actions, self-hosted runner, environment và required reviewers, Dependabot và dependency review.

### Buổi 19 – CD & Deployment Strategies

#### Đáp án các nhiệm vụ L1

1. **Chuẩn bị.** Chép `compose.yaml`, `backend`, `frontend`, `database` vào `lab-19/source`, tạo `.env` có `DB_PASSWORD`, `WEB_PORT`, `COMPOSE_PROJECT_NAME`, và thêm `.env`, `.deploy/` vào `.gitignore`. Kiểm tra `git check-ignore -v .env .deploy` in ra hai dòng khớp quy tắc. Package GHCR để Public, hoặc `docker login ghcr.io` với PAT có `read:packages` (nhập token khi được hỏi, không viết vào file).

2. **Phần 1: `compose.deploy.yaml`.** Override chỉ khai báo `image` cho hai service, dùng cú pháp `${OWNER:?Set OWNER}` và `${TAG:?Set TAG}` để Compose báo lỗi ngay khi thiếu biến. Kiểm tra hợp nhất:

   ```bash
   OWNER=your-github-user TAG=sha-abc1234 \
     docker compose -f compose.yaml -f compose.deploy.yaml config | grep "image:"
   ```

   Phải thấy hai image GHCR kèm đúng tag và `postgres:17-alpine`. Compose gộp theo tên service: service có cả `build` (từ file gốc) lẫn `image` (từ override), và `up --no-build` chọn dùng image.

3. **Phần 2: `deploy-local.sh`.** Các chốt của script, cũng là chỗ mentor soi:

   - `set -euo pipefail` và `: "${OWNER:?...}" "${TAG:?...}"`: dừng ngay khi thiếu biến.
   - Từ chối `latest` và tag rỗng bằng mã thoát 2, trước khi chạm vào Docker.
   - `docker compose pull backend frontend` rồi `up -d --no-build`.
   - Health check dùng `/ready` (chạy `SELECT 1`), tối đa 20 lần cách nhau 3 giây. `/health` chỉ trả JSON tĩnh nên không bắt được lỗi kết nối DB.
   - Chỉ ghi `current-tag` (và `previous-tag`) sau khi health check đạt.
   - Khi thất bại: in log backend, rollback về `current` nếu có và khác tag vừa thử, thoát mã 1.

   Kết quả đã kiểm chứng ở lần deploy đầu:

   ```text
   [deploy] pull image tag sha-aaa1111
   [deploy] compose up
   [deploy] health OK
   [deploy] ghi trang thai: current=sha-aaa1111 previous=none
   ```

   `curl /health` trả `{"status":"healthy","service":"club-api"}` và `/api/members` trả hai dòng Alice, Bob của `init.sql`. Evidence cho `latest`: chạy `OWNER=... TAG=latest ./deploy-local.sh; echo "exit=$?"` cho thông báo từ chối và `exit=2`, và `docker compose ps` trước/sau giống hệt nhau.

4. **Phần 3: bản thứ hai và rollback.** Trình tự trạng thái đã kiểm chứng (A là bản đầu, B là bản thứ hai):

   | Bước | Lệnh | current-tag | previous-tag |
   | --- | --- | --- | --- |
   | Deploy A | `TAG=A ./deploy-local.sh` | A | không có file |
   | Deploy B | `TAG=B ./deploy-local.sh` | B | A |
   | Rollback | `ROLLBACK=1 ./deploy-local.sh` | A | B |
   | Rollback lần hai | `ROLLBACK=1 ./deploy-local.sh` | B | A |

   Sau rollback, `docker compose ps --format '{{.Service}} {{.Image}}'` cho `backend` và `frontend` dùng tag A. Rollback chỉ là deploy với tag cũ nên đi qua đúng đường pull, up, health check, ghi trạng thái. Hệ quả mà học viên phải mô tả trong `report.md`: rollback hai lần liên tiếp không "lùi thêm một bước" mà hoán đổi hai bản, vì mỗi lần thành công `current` được đẩy sang `previous`. Muốn lùi sâu hơn cần lưu lịch sử nhiều tag.

#### Lời giải L2

**Thử thách 1 – chặn tag không tồn tại.** Lời giải: thêm vòng `docker manifest inspect` cho `club-api` và `club-web` ngay sau `export OWNER TAG`, thoát mã 3 nếu thiếu. Đã kiểm chứng với tag giả: `exit=3`, thông báo rõ ràng, và `docker compose ps` trước/sau cho thấy backend, frontend, postgres vẫn `Up` với cùng thời gian chạy (stack không bị đụng tới). Vì sao đặt trước `compose pull`: mọi bước đụng vào stack đang chạy phải đứng sau mọi kiểm tra có thể thất bại. Khi chạy trên GHCR thật, lệnh này cũng thất bại nếu thiếu quyền pull, nên thông báo nên nói "không tìm thấy hoặc không có quyền".

**Workflow `deploy-local.yml`.** Các khóa phải có và vì sao:

- `workflow_dispatch` với input `tag` kiểu string, bắt buộc.
- `permissions: contents: read`: job chỉ cần checkout.
- `concurrency` với `cancel-in-progress: false`: hai deploy không chạy chồng; deploy đang chạy không bị hủy giữa chừng.
- `environment: local` để gắn secret `DB_PASSWORD` và (nếu có) required reviewers.
- Giá trị `inputs.tag` đi qua `env: TAG: ${{ inputs.tag }}`, không nhúng trong `run:`, nên chỉ là dữ liệu trong shell.
- `STATE_DIR` đặt ngoài workspace (`$HOME/.club-deploy`) vì `actions/checkout` dọn cả file bị ignore (`.env`, `.deploy/`).

Ghi chú về self-hosted runner: chỉ cho repo private, user thường không root, bật khi cần, không mở cổng; runner chủ động gọi ra GitHub qua HTTPS nên không cần cổng vào. Phương án thay thế hợp lệ: workflow trên hosted runner chỉ kiểm tra (validate compose, kiểm tra tag bằng `docker manifest inspect`) và chạy script thủ công, nhưng học viên phải nêu lý do và rủi ro trong `report.md`.

Chứng cứ cho L2: một lần chạy workflow (hoặc script) thành công và một lần deploy tag sai bị chặn mà stack cũ vẫn chạy.

#### Lời giải phần Phá lỗi và debug

**Tình huống: đổi `DB_PASSWORD` trong `.env` rồi deploy lại cùng tag.** Đã kiểm chứng: script in `health FAIL, in log backend`, thoát mã 1; `/health` vẫn `healthy` nhưng `/ready` trả `{"status":"not-ready"}` mã 503. Backend chỉ in `API listening on port 3000`, không in lỗi của `/ready`; thủ phạm nằm ở log postgres:

```text
FATAL:  password authentication failed for user "club"
```

Cây điều tra:

1. `docker compose ps`: backend `Up`, postgres `healthy`. Container sống nhưng `/ready` 503 nghĩa là app không dùng được DB.
2. `docker compose logs --tail 50 postgres` thấy `password authentication failed for user "club"`. Nếu là `ECONNREFUSED` thì xem log backend và trạng thái postgres.
3. So sánh mật khẩu backend đang dùng (`docker compose exec backend env`, lọc `DB_`) với mật khẩu lúc khởi tạo volume. `POSTGRES_PASSWORD` chỉ có tác dụng ở lần khởi tạo volume đầu tiên.
4. `docker volume ls`: volume `postgres-data` của project vẫn còn, tức DB giữ mật khẩu cũ.

Nguyên nhân gốc: mật khẩu trong database được cố định khi tạo volume; đổi `.env` làm backend gửi mật khẩu mới trong khi DB vẫn chờ mật khẩu cũ. Script không rollback vì tag trùng bản đang chạy và lỗi nằm ở cấu hình chứ không ở image, nên `ROLLBACK=1` cũng vô ích. Sửa: trả `.env` về mật khẩu cũ rồi chạy lại cùng tag. Muốn đổi mật khẩu thật: đổi trong database (`ALTER USER`) trước rồi mới đổi `.env`. Không xóa volume để "sửa nhanh" vì mất dữ liệu.

#### Những hiểu lầm hay gặp

- Dùng `latest` rồi tin rằng "rollback về bản trước" có nghĩa; `latest` không nhớ bản trước.
- Ghi `current-tag` trước khi health check, khiến rollback trỏ vào bản hỏng.
- Dùng `/health` làm cổng chặn nên bản hỏng kết nối DB vẫn "khỏe".
- Nghĩ rollback code hoàn tác cả dữ liệu hoặc migration. Không: cần migration tương thích ngược (thêm trước, xóa sau) hoặc backup.
- Nghĩ phải mở cổng máy cá nhân để GitHub deploy vào. Runner gọi ra, không có kết nối đi vào.
- Gắn self-hosted runner cho repo public, cho người lạ chạy code qua pull request.
- Tưởng bản hỏng sẽ để lại log backend: container thoát ngay có thể không in gì, cần xem thêm `docker compose ps -a` và mã thoát.
- Chạy workflow rồi thấy mất `.env` và `.deploy/` vì `actions/checkout` dọn thư mục làm việc.
- Dùng cổng 3000 hoặc 8080 trong lệnh evidence khi máy đang chạy stack khác.

### Buổi 20 – Pipeline Security

#### Đáp án các nhiệm vụ L1

1. **Phần 1: rà soát permissions.** Lệnh `grep -n -A3 "permissions" .github/workflows/*.yml` liệt kê mọi khối. Bảng rà soát mẫu (học viên điền theo workflow thật của mình, lý do phải cụ thể):

   | Workflow | Job | Hiện có | Cần | Lý do |
   | --- | --- | --- | --- | --- |
   | `lab17-ci.yml` | `unit-tests`, `integration-tests` | `contents: read` | `contents: read` | chỉ checkout và chạy test; upload artifact dùng token riêng của runner, không cần quyền ghi repo |
   | `publish.yml` | `publish` | workflow `contents: read`, job thêm `packages: write` | giữ nguyên | đẩy image lên GHCR; chỉ job này ghi package |
   | `deploy-local.yml` | `deploy` | `contents: read` | `contents: read` | checkout, deploy do script trên runner làm |
   | `demo-wide.yml` (trước khi sửa) | `hello` | `write-all` | `contents: read` | chỉ `echo` và checkout |

   Cài đặt repo: Settings, Actions, General, Workflow permissions chọn "Read repository contents and packages permissions". Lý do: workflow mới quên khai báo vẫn không có quyền ghi.

   Với `demo-wide.yml`, hai commit riêng: commit một có `permissions: write-all`, commit hai thay bằng `permissions: contents: read`. Evidence: `git log --oneline -- .github/workflows/demo-wide.yml` có ít nhất hai dòng, và `git diff` giữa hai commit thấy dòng `write-all` bị thay.

2. **Phần 2: quét image.** Cách an toàn là `docker save` rồi cho Trivy đọc file tar qua `--input`, không mount `docker.sock`. Kết quả đã kiểm chứng ngày 21/10/2026 trên image `club-api:1.0.0` (Alpine 3.24, Node 22) bằng Trivy 0.57.1:

   ```text
   club-api.tar (alpine 3.24.2)   Total: 0 (HIGH: 0, CRITICAL: 0)
   Node.js (node-pkg)             Total: 11 (HIGH: 11, CRITICAL: 0)
   ```

   Với `--ignore-unfixed` còn 10 lỗ hổng HIGH: một lỗ hổng chưa có bản vá bị lọc. Quét `--severity CRITICAL --ignore-unfixed --exit-code 1` cho mã thoát 0. Đọc kỹ cột Library và đường dẫn: các gói bị báo nằm trong `usr/local/lib/node_modules/npm/node_modules/...` (ví dụ `brace-expansion`, `pacote`, `picomatch`), tức là npm đi kèm base image `node:22-alpine`, không phải `express` hay `pg` của ứng dụng, và runtime không gọi tới npm khi phục vụ request. Đó chính là ví dụ cho ý "severity chưa phải rủi ro thực tế". Cách xử lý hợp lý: build lại trên bản base image mới hơn, hoặc cân nhắc loại npm khỏi stage runtime (chưa kiểm chứng trong tài liệu này); ghi nhận rủi ro có thời hạn nếu chưa xử lý được.

   Số liệu của học viên sẽ khác vì cơ sở dữ liệu CVE đổi liên tục; mentor yêu cầu học viên ghi thời điểm quét (lệnh `date` trong evidence). Lưu ý với Trivy 0.57.1: kết quả in thành từng khối có dòng `Total`, không có bảng "Report Summary".

3. **Phần 3: `git grep` tìm secret.** Trên `starter-project` các dòng tìm thấy là tên biến hoặc giá trị giả: `DB_PASSWORD` và `POSTGRES_PASSWORD` trong `compose.yaml`, `password: process.env.DB_PASSWORD || "change-me"` trong `backend/db.js` (giá trị mặc định giả, đáng ghi nhận là rủi ro nếu ai quên đặt biến), `secretKeyRef` trong `k8s/*.yaml`, `change-me-locally` trong `.env.example` và `k8s/secret.example.yaml`. Trong repo học viên thêm `secrets.GITHUB_TOKEN`, `secrets.DB_PASSWORD` và `ci-only-password` của lab 17. Mỗi dòng phải được phân loại là tên biến, giá trị giả hay giá trị thật. Nếu có giá trị thật thì coi như đã lộ: xoay ngay, xóa khỏi code, nhớ rằng xóa commit không xóa lịch sử.

#### Đáp án phần nâng cao

Tương ứng [Buổi 20 – Phần nâng cao](../../labs/week-10/session-20-challenge.md). **Phần A.1** (`--ignore-unfixed`): xem số liệu ở mục quét image ở trên; với `--ignore-unfixed` số lỗ hổng HIGH giảm vì lỗ hổng chưa có bản vá bị lọc.

- **Phần A.3: `trivy config /project/k8s`.** Đã chạy: lệnh quét 7 file, báo lỗi cấu hình ở bốn file; `backend.yaml` 12, `frontend.yaml` 14, `postgres.yaml` 13 và `configmap.yaml` 1. Trong lúc Trivy tải bộ luật có thể in vài dòng `ERROR` về một file `.rego`; đó là nhiễu của bộ luật cloud, không ảnh hưởng kết quả Kubernetes. Ba ví dụ để học viên chọn hai cảnh báo phân tích:

   - `AVD-KSV-0014` (HIGH, `readOnlyRootFilesystem`): đáng sửa. Đặt `securityContext.readOnlyRootFilesystem: true` và nếu ứng dụng cần ghi thì mount `emptyDir` cho thư mục đó (Nginx và Postgres cần thêm thư mục ghi, nên với hai service này phải thử kỹ).
   - `AVD-KSV-0012` (MEDIUM, `runAsNonRoot`): đáng sửa cho `club-api` vì Dockerfile đã có `USER node`; manifest chưa khai báo nên Trivy không biết. Thêm `runAsNonRoot: true` và `runAsUser` lớn hơn 10000 nếu image cho phép.
   - `AVD-KSV-01010` (MEDIUM, ConfigMap bị coi là chứa dữ liệu nhạy cảm vì khóa `DB_PORT`): có thể coi là báo nhầm. Số cổng không phải bí mật; thứ cần bảo vệ là mật khẩu, và nó đã nằm trong Secret. Đây là ví dụ cho việc phải đọc nội dung cảnh báo thay vì chạy theo severity.

   Học viên chọn hai cảnh báo bất kỳ miễn là phân tích có lý lẽ: nội dung, có đáng sửa không, sửa thế nào.

- **Phần B: SBOM.** Lệnh `--format cyclonedx --output /work/evidence/club-api-sbom.cdx.json` sinh file khoảng 378 KB. Đã kiểm chứng: JSON hợp lệ, `bomFormat` là `CycloneDX` (specVersion 1.6), 296 thành phần `"type": "library"` (tổng 297 gồm cả thành phần hệ điều hành), thấy `express` 5.3.0 và `pg` 8.23.1 (phiên bản của học viên có thể khác). Lệnh kiểm tra JSON: `python3 -m json.tool lab-20/evidence/club-api-sbom.cdx.json > /dev/null && echo valid` hoặc `jq . ... > /dev/null`. Đếm thành phần: `grep -c '"type": "library"' ...`. SBOM liệt kê cả dependency gián tiếp mà học viên không tự khai báo trong `package.json`.

- **Phần C: pin SHA.** Lệnh `git ls-remote https://github.com/actions/checkout 'refs/tags/v4.2.2*'` ngày 21/10/2026 cho đúng một dòng: `11bd71901bbe5b1630ceea73d27597364c9af683` kèm `refs/tags/v4.2.2` (tag nhẹ nên không có dòng `^{}`). Dòng `uses:` sau khi pin:

   ```yaml
   - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
   ```

   SHA phải đủ 40 ký tự, thuộc đúng repo action và workflow phải chạy xanh sau khi pin. Học viên phải tự chạy `git ls-remote`, không chép SHA từ tài liệu; mentor đối chiếu với trang Releases. Placeholder `SHA_DAY_DU_40_KY_TU` còn trong workflow là lỗi bị trừ điểm.

#### Lời giải L2

**Thử thách: `security.yml`.** Lời giải có các chốt sau: `permissions: contents: read` ở cấp workflow, không job nào cần ghi; job `dependency-review` chỉ chạy khi `github.event_name == 'pull_request'` với `fail-on-severity: high` (repo private chưa bật dependency graph thì thay bằng `npm audit --omit=dev` và ghi vào report); job `image-scan` build, `docker save`, sinh SBOM trước rồi quét với `--severity CRITICAL --ignore-unfixed --exit-code 1`, upload SBOM với `if: always()` và `retention-days: 30`; Trivy chạy bằng container với `--input`, không mount `docker.sock`. Action bên thứ ba phải pin SHA; `actions/` chính chủ có thể giữ tag nhưng pin SHA vẫn tốt hơn. Không có `${{ }}` chứa dữ liệu người dùng trong `run:`; kiểm bằng `grep -n '\${{' .github/workflows/security.yml` rồi đọc từng dòng nằm trong `run:`.

Giải thích ngưỡng (phần `report.md`): ngưỡng CRITICAL kèm `--ignore-unfixed` chặn được thứ xử lý ngay (có bản vá) mà không làm pipeline đỏ vĩnh viễn vì lỗ hổng chưa có bản vá; đánh đổi là HIGH không chặn, nên cần quét định kỳ và theo dõi riêng. Quan sát thực tế khi kiểm chứng: với `club-api:1.0.0` hôm nay không có CRITICAL nên gate xanh dù có 10 HIGH có bản vá nằm trong npm của base image; học viên chọn ngưỡng HIGH sẽ thấy gate đỏ, và cần giải thích vì sao các HIGH đó có thể xử lý bằng nâng base image chứ không phải sửa code. Đánh đổi nào cũng được chấp nhận miễn có lập luận.

**Thử thách 3: điều tra security gate.** Đổi cả hai `FROM` trong Dockerfile sang `node:18-alpine`. Đã kiểm chứng ngày 21/10/2026 trên image build từ Node 18:

```text
alpine 3.21.3      Total: 21 (HIGH: 19, CRITICAL: 2)
Node.js (node-pkg) Total: 23 (HIGH: 22, CRITICAL: 1)
```

Với `--severity CRITICAL --ignore-unfixed --exit-code 1`, mỗi khối còn lại 2 và 1 CRITICAL đều đã có bản vá, mã thoát 1, gate đỏ. Báo cáo 5 phần điển hình: triệu chứng (job `image-scan` đỏ, code không đổi, test xanh); nguyên nhân gốc (base image Node 18 hết vòng đời hỗ trợ, chứa gói có CVE đã biết); cách xác minh (đọc dòng `Total`, xác định lỗ hổng thuộc gói hệ điều hành hay `node-pkg`, đọc cột Fixed Version, chạy lại cục bộ cùng lệnh); giải pháp (đổi về `node:22-alpine`, quét lại thấy số lượng giảm rõ, gate xanh); phòng tránh (base image còn hỗ trợ và pin phiên bản, Dependabot cho `docker` và `npm`, quét theo lịch). Nếu học viên dùng `.trivyignore`, mỗi dòng phải có CVE, lý do và ngày xem xét lại (chú thích bằng dòng bắt đầu bằng `#`); tắt gate hoặc xóa bước quét là không đạt. Kết quả phụ thuộc thời điểm quét: nếu gate không đỏ, hạ ngưỡng xuống HIGH hoặc bỏ `--ignore-unfixed` để quan sát cơ chế chặn và ghi nhận điều đó.

#### Lời giải phần Phá lỗi và debug

**Tình huống: security gate chặn pipeline.** Triệu chứng: job `image-scan` đỏ ở bước quét với exit code 1 và bảng CVE; build và test vẫn xanh. Cây điều tra:

1. Mở log bước Scan image, đọc dòng `Total:` và các dòng CRITICAL đầu tiên.
2. Xác định lỗ hổng thuộc gói hệ điều hành (`alpine`) hay `node-pkg` qua cột Library và Target.
3. Xem cột Fixed Version: có bản vá không; nếu có thì vá bằng nâng base image hay nâng dependency.
4. Tái lập cục bộ với đúng lệnh và phiên bản Trivy, rồi thử `--ignore-unfixed` để biết phần nào xử lý được.
5. Đổi về `node:22-alpine`, quét lại và so sánh.

Nguyên nhân gốc: base image cũ không còn được bảo trì; pipeline đã làm đúng việc. Xử lý nguyên nhân thay vì tắt gate.

**Tình huống phụ (script injection).** Nhúng `github.head_ref` trực tiếp vào `run:` rồi mở PR từ nhánh có dấu nháy và dấu chấm phẩy làm lệnh bị phá, vì biểu thức được thay bằng chuỗi trước khi shell chạy. Sửa bằng cách gán qua `env` và dùng `"$BIEN"` trong shell. Phần này chưa chạy trên GitHub Actions trong lần kiểm chứng.

#### Những hiểu lầm hay gặp

- Khai báo `permissions` chỉ có `contents: read` rồi tưởng `packages` vẫn mặc định. Mọi quyền không liệt kê là `none`.
- Tin rằng GitHub che secret thì được phép in secret. Che chỉ khớp chuỗi; giá trị bị base64 hoặc cắt vẫn lộ.
- Chạy theo severity: coi mọi CRITICAL đều khẩn cấp và mọi HIGH đều bỏ qua, mà không xem gói có nằm trên đường xử lý request không.
- Mount `docker.sock` vào container quét cho nhanh; làm vậy trao quyền điều khiển Docker daemon, tương đương root.
- Pin theo SHA bị cắt ngắn hoặc để placeholder; hoặc pin SHA của một repo khác.
- Tin rằng "0 lỗ hổng hôm nay" là mãi mãi. Cơ sở dữ liệu CVE cập nhật liên tục nên cần quét định kỳ.
- Gate đỏ thì thêm `|| true` hoặc xóa bước quét thay vì tìm nguyên nhân.
- Dùng `${{ github.event.pull_request.title }}` thẳng trong `run:`.
- Đặt `write-all` "cho chắc" rồi quên sửa lại.

### Bài tập tuần

#### Nhiệm vụ 1 – Deploy image từ GHCR bằng script

Gợi ý: `compose.deploy.yaml`, `deploy-local.sh` và `.gitignore` như Phần 1 và 2 của Buổi 19. Mentor kiểm: `config` hiển thị đúng tên image kèm tag; lần deploy hợp lệ in `health OK` và `echo $?` bằng 0; `TAG=latest` bị từ chối (mã khác 0, `docker compose ps` trước và sau giống nhau); `curl` `/health` và `/api/members` đúng; `git check-ignore -v .env .deploy` cho hai dòng.

#### Nhiệm vụ 2 – Bản thứ hai và rollback

Gợi ý: bảng trạng thái ở Phần 3 của Buổi 19. Evidence cần: `current-tag` và `previous-tag` sau lần deploy hai khớp hai tag thật trong tab Packages; log rollback; `docker compose ps --format '{{.Service}} {{.Image}}'` cho thấy tag đầu; hai file sau rollback. Phần `report.md`: rollback lần hai hoán đổi hai bản thay vì lùi thêm, vì mỗi lần thành công `current` được ghi sang `previous`.

#### Nhiệm vụ 3 – Rà soát permissions

Gợi ý: bảng ở Buổi 20. Mentor kiểm: `grep permissions` trong evidence; `git log --oneline -- .github/workflows/demo-wide.yml` có ít nhất hai commit và `git diff` thấy `write-all` bị thay; bảng phủ mọi workflow và job, mỗi hàng có lý do cụ thể; ảnh Workflow permissions chỉ để minh họa.

#### Nhiệm vụ 4 – Quét image một lần

Gợi ý: Phần 2 của Buổi 20. Mentor kiểm: output quét kèm dòng `Total` theo từng loại thành phần; thời điểm quét (`date`); 3 ý phân tích trong `report.md` (gói hệ điều hành hay `node-pkg`, có bản vá không, có nằm trên đường xử lý request không) cho ít nhất một lỗ hổng, hoặc ghi "không có lỗ hổng" kèm thời điểm quét.

#### Nhiệm vụ 5 – Tìm secret lỡ commit

Gợi ý: Phần 3 của Buổi 20. Mentor kiểm: output `git grep`; `report.md` phân loại từng dòng (tên biến, giá trị giả hay giá trị thật); không còn giá trị thật trong repo.

#### Phần nâng cao (10 điểm)

Gợi ý: Phần A, B, C của [Buổi 20 – Phần nâng cao](../../labs/week-10/session-20-challenge.md). Mentor kiểm: output quét cả hai chế độ (có và không có `--ignore-unfixed`) kèm `Total` và so sánh; SBOM là JSON hợp lệ (lệnh kiểm tra trong evidence) có `express` và `pg`, kèm số thành phần đếm bằng lệnh; phân tích hai cảnh báo `trivy config` có nội dung, có đáng sửa không, sửa thế nào và một câu về việc severity không phải thước đo duy nhất; output `git ls-remote` do học viên tự chạy; dòng `uses:` có SHA 40 ký tự hex kèm comment phiên bản; mã run xanh sau khi pin.

#### Nhiệm vụ L2

- **Thử thách 1 (deploy an toàn):** kiểm tra tag tồn tại trước mọi thao tác đụng stack (mã 3 và stack cũ vẫn `Up`); workflow đủ `workflow_dispatch` với input `tag`, `environment`, `concurrency`, `permissions`; `inputs.tag` qua `env`; report nêu rủi ro self-hosted runner và cách giảm.
- **Thử thách 2 (`security.yml`):** quyền workflow chỉ đọc, dependency review chỉ trên PR, quét image với ngưỡng có giải thích, SBOM giữ 30 ngày, action bên thứ ba pin SHA.
- **Thử thách 3 (điều tra gate):** log quét trước và sau kèm tổng số, báo cáo 5 phần như trên, xử lý nguyên nhân thay vì tắt gate.

#### Đáp án 5 câu hỏi kiểm tra

1. Continuous Delivery: mọi bản qua CI luôn sẵn sàng, con người quyết định deploy. Continuous Deployment: pipeline tự deploy, không cần con người. Khóa học dùng Delivery: máy local không có IP public và không được expose, nên hosted runner không đẩy vào được, và deploy vào máy là hành động có chủ đích (chạy script hoặc `workflow_dispatch`).
2. Chỉ ghi `current-tag` sau khi health check đạt để file trạng thái luôn là bản đã xác nhận chạy được; nếu ghi trước, rollback có thể trỏ vào bản hỏng. Dùng `/ready` vì nó chạy `SELECT 1` nên bắt được lỗi kết nối DB, còn `/health` chỉ trả JSON tĩnh. Rollback code không đưa dữ liệu hay schema về như cũ; cần migration tương thích ngược hoặc backup.
3. Là `none`: khai báo `permissions` thì mọi quyền không liệt kê bị tắt. Job publish (đẩy image lên GHCR) cần `packages: write`; khai báo ở cấp job để các job khác không tự có quyền ghi, đúng least privilege.
4. Tag có thể bị trỏ sang commit khác (nên action bị chiếm vẫn chạy mã độc dưới tag cũ), SHA thì bất biến. Nhược điểm là khó đọc và khó cập nhật; khắc phục bằng comment phiên bản và Dependabot tự cập nhật SHA. Tiêu đề PR do người dùng kiểm soát; biểu thức được thay bằng chuỗi trước khi shell chạy nên tiêu đề chứa lệnh sẽ được thực thi. Gán qua `env` rồi dùng `"$PR_TITLE"`.
5. SBOM cho biết image chứa gói nào, phiên bản nào, nên trả lời nhanh "ta có dùng gói đó không và ở image nào". Hôm qua sạch hôm nay HIGH vì cơ sở dữ liệu CVE cập nhật liên tục: lỗ hổng mới được công bố cho gói đã nằm sẵn trong image. Pipeline nên bổ sung quét theo lịch (schedule), Dependabot cập nhật base image và dependency, và lưu SBOM mỗi build.

### Hướng dẫn chấm cho mentor

Chạy lại các lệnh kiểm tra trên máy mentor nếu có thể (`python3 -m json.tool` cho SBOM, `shellcheck` hoặc đọc `deploy-local.sh`), và đối chiếu với trạng thái thật trên GitHub (lịch sử commit, run, tab Packages). Điểm tối đa của một tiêu chí không được cho nếu thiếu output thật hoặc output có dấu hiệu chỉnh tay (timestamp, thứ tự lệnh, tag không khớp Packages).

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: deploy bằng script (15) | `config` hợp nhất đúng image và tag; `health OK` kèm mã thoát 0; `latest` bị từ chối kèm mã thoát khác 0 và `compose ps` trước/sau; `curl` hai endpoint; `git check-ignore` | Script ghi trạng thái trước health check; health check dùng `/health`; không có bằng chứng từ chối `latest` | Vì sao dùng `/ready`? Điều gì xảy ra nếu ghi `current-tag` trước health check? |
| Nhiệm vụ 2: bản hai và rollback (15) | Hai tag thật khớp Packages; hai file trạng thái sau từng bước; `docker compose ps --format` cho thấy tag đầu sau rollback; log rollback | Rollback bằng cách sửa tay `compose.yaml` hoặc `TAG`; tag giả; mô tả sai hành vi rollback lần hai | Chạy rollback lần hai thì ra gì và vì sao? Rollback có hoàn tác dữ liệu không? |
| Nhiệm vụ 3: permissions (15) | `grep permissions`; `git log` có hai commit cho `demo-wide.yml`; `git diff` thấy `write-all` bị thay; bảng phủ mọi job với lý do cụ thể | Chỉ một commit; bảng thiếu job; lý do kiểu "cần để chạy"; ảnh thay cho output | Nếu xóa khối `permissions` thì token có quyền gì? Vì sao `packages: write` ở cấp job? |
| Nhiệm vụ 4: quét image một lần (10) | Output quét kèm `Total` theo từng loại; thời điểm quét; 3 ý phân tích cho ít nhất một lỗ hổng (gói nào, có bản vá không, có nằm trên đường xử lý request không) | Không có thời điểm quét; chỉ chạy lệnh mà không phân tích; số liệu giống bạn khác | Vì sao có HIGH nhưng không cần sửa code của bạn? |
| Nhiệm vụ 5: tìm secret lỡ commit (5) | Output `git grep`; phân loại từng dòng là tên biến, giá trị giả hay giá trị thật | Không giải thích kết quả; không phân biệt tên biến với giá trị thật | Nếu `git grep` thấy giá trị thật thì làm gì? |
| Nâng cao: quét sâu, SBOM, pin SHA (10) | `--ignore-unfixed` kèm so sánh; JSON hợp lệ có `express`, `pg` và số thành phần; phân tích đúng hai cảnh báo cấu hình; SHA 40 ký tự thật kèm comment; run xanh | SBOM không phải JSON hợp lệ; SHA cắt ngắn hoặc placeholder; `git ls-remote` không có trong evidence; không phân tích cảnh báo | Vì sao `--ignore-unfixed` có ích và rủi ro của nó là gì? Vì sao SHA an toàn hơn tag? |
| README và report (10) | Đủ 7 câu; nêu nguyên nhân gốc và giới hạn của giải pháp | Sao chép đề bài; chung chung | Chọn một mục trong report và yêu cầu tái hiện nhanh. |
| Câu hỏi kiểm tra (15) | Năm câu đúng ý, có lệnh hoặc cấu hình minh họa (3 điểm mỗi câu) | Trả lời giống từng chữ với bài khác; chỉ nêu kết luận | Câu 2 và 4: yêu cầu giải thích bằng ví dụ lệnh hoặc workflow cụ thể. |
| Vệ sinh và quy trình (5) | Không `.env`, `.deploy/`, file tar, token; PR có reviewer | `.env` hoặc tar trong repo; thiếu review | Chạy `git ls-files` và `git grep -i password` trên repo học viên. |
| L2 thử thách 1 (4) | Tag giả bị chặn mã 3 và stack cũ vẫn `Up`; workflow đủ khóa; `inputs.tag` qua `env`; chứng cứ một lần chạy | Kiểm tra tag sau khi đã dừng stack; `inputs.tag` nhúng trong `run:`; runner cho repo public | Vì sao kiểm tra tag phải đứng trước `compose pull`? Rủi ro của self-hosted runner? |
| L2 thử thách 2 (4) | Workflow xanh; quyền tối thiểu; SBOM trong artifact với `retention-days: 30`; pin SHA; ngưỡng có giải thích | Quyền rộng; không có SBOM; mount `docker.sock`; không giải thích ngưỡng | Vì sao chọn ngưỡng này và nó bỏ sót gì? |
| L2 thử thách 3 (2) | Log quét trước và sau kèm tổng số; báo cáo 5 phần; `.trivyignore` có lý do và ngày xem xét lại hoặc nêu rõ không dùng | Chỉ nâng ngưỡng hoặc xóa bước quét để gate xanh | Nếu gate không đỏ thì bạn quan sát cơ chế chặn bằng cách nào? |

Ba kiểm tra chéo nên làm: hai tag trong evidence khớp tab Packages; thời điểm quét trong evidence hợp lý với số liệu (cơ sở dữ liệu CVE đổi theo ngày, kết quả giống hệt bài khác là dấu hiệu bất thường); và `demo-wide.yml` có hai commit riêng với SHA 40 ký tự ở bản cuối.

### Phụ lục – Mã lời giải L2

Mã đầy đủ cho hai thử thách L2, để mentor đối chiếu. Học viên tự thử trước khi xem.

#### Buổi 19 – chặn tag không tồn tại

Thêm đoạn sau vào `deploy-local.sh`, ngay sau khi `export OWNER TAG`:

```bash
for img in club-api club-web; do
  if ! docker manifest inspect "ghcr.io/${OWNER}/${img}:${TAG}" > /dev/null 2>&1; then
    log "KHONG tim thay ghcr.io/${OWNER}/${img}:${TAG}, huy deploy (stack hien tai khong bi dong vao)"
    exit 3
  fi
done
```

Kiểm thử:

```bash
OWNER=your-github-user TAG=sha-khongtontai ./deploy-local.sh; echo "exit=$?"
docker compose ps
```

Kết quả mong đợi: `exit=3` và các service cũ vẫn `Up`.

Trong workflow, biến `TAG` được truyền qua `env` nên giá trị người dùng nhập chỉ là chuỗi dữ liệu trong shell. Script đã đặt trong dấu nháy nên không bị tách lệnh.

#### Buổi 20 – workflow security.yml

```yaml
name: Security

on:
  pull_request:
  push:
    branches: [main, master]

permissions:
  contents: read

jobs:
  dependency-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high

  image-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t club-api:ci starter-project/backend

      - name: Export image to tar
        run: |
          mkdir -p scan sbom
          docker save club-api:ci -o scan/club-api.tar

      - name: Generate SBOM
        run: |
          docker run --rm \
            -v "$PWD/scan:/scan:ro" \
            -v "$PWD/sbom:/out" \
            aquasec/trivy:0.57.1 image --input /scan/club-api.tar \
            --format cyclonedx --output /out/club-api.cdx.json

      - name: Scan image
        run: |
          docker run --rm \
            -v "$PWD/scan:/scan:ro" \
            aquasec/trivy:0.57.1 image --input /scan/club-api.tar \
            --severity CRITICAL --ignore-unfixed --exit-code 1

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: club-api-sbom
          path: sbom/club-api.cdx.json
          retention-days: 30
```

Lưu ý: nếu repo private và không bật dependency graph, job `dependency-review` sẽ lỗi; ghi nhận trong `report.md` và thay bằng `npm audit --omit=dev` ở thư mục `starter-project/backend`. Bước SBOM đặt trước bước scan và `upload-artifact` có `if: always()` để luôn có SBOM kể cả khi scan thất bại. Lời giải không mount `docker.sock`: image được xuất ra tar rồi Trivy đọc file. Với action bên thứ ba bạn thêm vào, đổi `@v...` thành SHA.
