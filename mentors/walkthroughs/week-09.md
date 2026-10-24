# Đáp án tuần 9 – Automated Testing & Docker CI

::: warning Đáp án đối chiếu: học viên chỉ xem sau khi đã nộp bài tuần này
Mentor dùng trang này để chấm bài. Tên tài khoản, run ID, SHA, digest và thời gian trên repo của học viên sẽ khác tài liệu; chấm theo log run và evidence thật của học viên.
:::

> **Tóm tắt:** Hướng dẫn giải Buổi 17 (unit và integration test, report, branch protection) và Buổi 18 (publish image lên GHCR bằng Buildx), kèm đáp án bài tập tuần 9 và hướng dẫn chấm cho mentor.

## Cách dùng tài liệu này

Dùng để đối chiếu cách nghĩ và cách điều tra, không phải để chép lệnh. Mỗi buổi có các phần: đáp án L1, lời giải L2, lời giải phần Phá lỗi và những hiểu lầm hay gặp. Cuối tài liệu là gợi ý cho bài tập tuần và hướng dẫn chấm. Bài gốc: [Buổi 17](../../labs/week-09/session-17.md), [Buổi 18](../../labs/week-09/session-18.md) và [bài tập tuần 9](../../assignments/weekly/week-09.md). Barem: [Hướng dẫn chấm tuần 9](../grading/week-09.md).

Phạm vi đã kiểm chứng: toàn bộ test của Buổi 17 (unit, integration với `postgres:17-alpine` ở cổng riêng, report JUnit, tình huống A). Chưa kiểm chứng vì cần tài khoản GitHub thật: hành vi của GitHub Actions, branch protection, GHCR và cache `type=gha`; phần đó viết theo tài liệu của action. Tình huống B của Buổi 17 và hai tình huống của Buổi 18 mô tả theo log điển hình.

### Buổi 17 – Automated Testing

#### Đáp án các nhiệm vụ L1

1. **Chuẩn bị và Phần 1.** Sau khi chép `backend` và `database` vào `lab-17/source` và `npm ci`, lệnh `npm test` phải báo `pass 1`, `fail 0` (test `/health` có sẵn). Test này không cần PostgreSQL vì `/health` không chạm DB và `pg.Pool` chỉ mở kết nối khi có truy vấn. Đây là mốc xanh để so sánh sau mỗi thay đổi.

2. **Phần 2: `tests/api.test.js` với bốn test mới.** Cấu trúc chuẩn gồm `test.before` mở server cổng ngẫu nhiên (`app.listen(0, "127.0.0.1", ...)`), `test.after` đóng server rồi `pool.end()`, và mỗi test gọi `t.mock.method(pool, "query", ...)` để thay truy vấn bằng hàm giả. Kết quả khi chạy kiểm tra:

   ```text
   ✔ GET /ready returns 200 when database answers
   ✔ GET /ready returns 503 when database fails
   ✔ GET /api/members returns rows from the pool
   ✔ GET /api/members returns 500 when query fails
   ✔ GET /health returns healthy
   ℹ tests 5
   ℹ pass 5
   ℹ fail 0
   ```

   Điểm cần hiểu, không chỉ chép:

   - `t.mock.method` gắn với test context nên `pool.query` tự được khôi phục khi test kết thúc. Nếu tự gán `pool.query = ...` mà không trả lại, các test sau sẽ dùng bản giả.
   - Test nhánh 500 mock thêm `console.error` vì handler `/api/members` ghi lỗi ra console; không mock thì báo cáo chen đầy stack trace dù test vẫn xanh.
   - `pool.end()` và `server.close()` trong `after` là điều kiện để process thoát. Thiếu một trong hai, `npm test` treo.
   - Thứ tự test trong file không quan trọng vì mỗi test tự đặt mock của mình.

3. **Phần 3: workflow `.github/workflows/lab17-ci.yml`.** Hai điểm hay sai: file phải nằm ở `.github/workflows/` của gốc repo (đặt trong `lab-17/` thì không bao giờ chạy), và `working-directory: lab-17/source/backend` phải khớp với `cache-dependency-path`. Job đặt `name: unit-tests` vì branch protection chọn check theo tên này. Reporter kép trong một lệnh:

   ```bash
   npm test -- --test-reporter=spec --test-reporter-destination=stdout \
     --test-reporter=junit --test-reporter-destination=test-results.xml
   ```

   Step upload cần `if: always()` vì step mặc định bị bỏ qua sau một step đỏ. Chứng minh bằng một run đỏ vẫn có artifact `test-results-unit`. Khi mở `test-results.xml` để đối chiếu, mỗi test là một thẻ `testcase`; số thẻ này phải bằng số test trong `npm test` (5).

4. **Phần 4: branch protection.** Trình tự đúng: workflow phải chạy ít nhất một lần thì check mới xuất hiện trong ô tìm kiếm; bật **Require a pull request before merging** và **Require status checks to pass before merging**; chọn `unit-tests`; sau đó tạo nhánh `break-test` sửa một assert, mở PR và chụp màn hình thông báo "Required statuses must pass before merging" cùng nút Merge bị khóa; sửa lại cho xanh và chụp nút Merge mở. Bằng chứng chính là link PR và log run, ảnh chỉ minh họa. Repo private gói Free không dùng được branch protection; dùng repo public cho bài này hoặc ghi rõ cách thay thế.

#### Lời giải L2

**Phần 5: integration test.** Chạy PostgreSQL cục bộ ở cổng riêng (đề dùng 5433), tạo `tests/members.integration.test.js` bọc trong `describe(..., { skip: !enabled })` với `enabled = process.env.RUN_INTEGRATION === "1"`. Kết quả đã kiểm chứng:

- Có `RUN_INTEGRATION=1`, `DB_PORT` và `DB_PASSWORD` đúng: `tests 7`, `pass 7`, `fail 0` (1 health, 4 unit, 2 integration).
- Không có biến: nhóm integration hiện là `skipped` (dấu `﹣ ... # SKIP`), `tests 5`, `pass 5`, và `npm test` vẫn xanh. Nhờ vậy máy không có DB vẫn chạy được test.

`beforeEach` chạy `TRUNCATE members RESTART IDENTITY` rồi INSERT hai dòng, nên mỗi test tự dựng dữ liệu. Kiểm tra tiêu chí "không phụ thuộc thứ tự": chạy file hai lần liên tiếp và chạy riêng từng test, ví dụ:

```bash
RUN_INTEGRATION=1 DB_PORT=5433 DB_PASSWORD=ci-only-password \
  npm test -- --test-name-pattern="seeded members"
```

Kết quả phải giống chạy cả file.

**Phần 6: job `integration-tests` với `services.postgres`.** Các điểm phải giải thích được:

- `ports: 5432:5432` publish cổng ra runner, nên `DB_HOST: localhost`. Job không dùng `container:`, vì vậy tên `postgres` không phân giải được.
- `--health-cmd "pg_isready -U club -d clubdb"` làm runner chờ DB sẵn sàng trước step đầu tiên. Thiếu nó, test có thể chạy khi DB chưa nhận kết nối và đỏ ngẫu nhiên.
- Mật khẩu `ci-only-password` chỉ sống trong service container tạm; môi trường thật dùng GitHub Secrets.
- Artifact đặt tên `test-results-integration`, khác `test-results-unit`, vì upload-artifact v4 yêu cầu tên duy nhất trong một run.

**Thử thách 1 – nhánh lỗi.** Lời giải đã chạy: đọc `schema` một lần bằng top-level await, chạy lại schema ở đầu `beforeEach`, rồi thêm test:

```js
test("GET /api/members returns 500 when table is missing", async (t) => {
  t.mock.method(console, "error", () => {});
  await pool.query("DROP TABLE members");
  const res = await fetch(`${baseUrl}/api/members`);
  assert.equal(res.status, 500);
});
```

Chạy lại schema trong `beforeEach` (đặt trước `TRUNCATE`, phần chèn dữ liệu mẫu giữ như cũ) và đọc `schema` một lần ở đầu file:

```js
const schema = await readFile(new URL("../../database/init.sql", import.meta.url), "utf8");

beforeEach(async () => {
  await pool.query(schema);
  await pool.query("TRUNCATE members RESTART IDENTITY");
  // ...insert dữ liệu mẫu như cũ
});
```

Với test này tổng là `tests 8`, `pass 8` khi bật integration. Vì sao phải chạy lại schema trong `beforeEach`: nếu không, test chạy sau test DROP sẽ lỗi ở bước `TRUNCATE` vì bảng không còn, tức là bạn vừa tạo đúng lỗi phụ thuộc thứ tự mà bài đang dạy tránh. Cách khác: bọc test DROP trong một transaction rồi rollback, hoặc dùng schema riêng cho từng file test.

Nếu sau này có nhiều file integration cùng dùng một DB, các file chạy trong process riêng song song theo mặc định của `node --test`, nên cần `--test-concurrency=1` hoặc mỗi file một schema.

**Thử thách 2 – job summary.** Lưu ý khi kiểm tra: ở Node 22 thẻ gốc của JUnit chỉ là `testsuites` không có thuộc tính nào, nên lấy số liệu từ các thẻ con. Đề đã được sửa theo hướng này:

```yaml
      - name: Summarize results
        if: always()
        run: |
          {
            echo "### Test results"
            echo "- Số test case: $(grep -c '<testcase' test-results.xml)"
            echo "- Số test thất bại: $(grep -c '<failure' test-results.xml)"
          } >> "$GITHUB_STEP_SUMMARY"
```

Đặt sau step chạy test, có `if: always()`. Đã kiểm tra trên file `test-results.xml` chạy cục bộ: 8 thẻ `testcase`; khi một test đỏ có đúng một thẻ `failure`.

**Thử thách 3 – giải thích.** Ý chính của câu trả lời tốt: unit test nhanh, ổn định và bắt lỗi logic nhánh nhưng mock luôn trả dữ liệu đúng nên không bắt được SQL sai hay schema lệch; integration test chậm hơn nhưng bắt được các lỗi đó. Với `POST /api/members` nên thêm: gửi hợp lệ trả 201 và truy vấn lại thấy dòng mới; gửi trùng email trả lỗi (bảng có ràng buộc `UNIQUE`, cần xác định mã 409 hoặc 400); gửi thiếu trường trả 400 và không ghi vào DB. Mỗi ý phải có ví dụ gắn với repo của học viên (tên file, tên job), không phải câu chung chung.

#### Lời giải phần Phá lỗi và debug

**Tình huống A – test pass khi chạy riêng, fail khi chạy chung.** Sau khi bỏ `TRUNCATE`, thêm `ON CONFLICT (email) DO NOTHING` và test "inserts Carol" đứng trước, kết quả đã kiểm chứng khi chạy cả file:

```text
✔ inserts Carol
✔ GET /ready returns 200 with a live database
✖ GET /api/members returns seeded members in id order
  actual:   [ 'Alice', 'Bob', 'Carol' ]
  expected: [ 'Alice', 'Bob' ]
```

Cây điều tra:

1. Chạy lại cả file nhiều lần và trên DB mới: kết quả đổi theo trạng thái DB thì nghi dữ liệu bẩn.
2. So sánh chạy riêng với chạy chung (`--test-name-pattern`): khác nhau nghĩa là có test khác để lại trạng thái.
3. Xem dữ liệu thật: `docker exec lab17-pg psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id"` thấy Carol.
4. Tìm test ghi dữ liệu mà không dọn: "inserts Carol".

Nguyên nhân gốc: các test dùng chung một database và không có bước đưa DB về trạng thái đã biết. Sửa: khôi phục `TRUNCATE ... RESTART IDENTITY` trong `beforeEach`. Phòng tránh: mỗi test tự dựng dữ liệu, không giả định test khác đã chạy, và chạy tuần tự (`--test-concurrency=1`) nếu nhiều file cùng dùng DB. Lưu ý chạy riêng lần hai sau một lần chạy cả file vẫn đỏ vì Carol còn trong DB; chỉ DB mới tạo lại mới cho kết quả xanh.

**Tình huống B – job không kết nối được service container.** Đổi `DB_HOST: localhost` thành `postgres`: log có `getaddrinfo ENOTFOUND postgres` ở bước chạy test, trong khi bước khởi tạo container vẫn thành công. Cây điều tra:

1. Mở bước khởi tạo container: Postgres healthy thì vấn đề nằm ở phía kết nối, không phải DB chưa sẵn sàng.
2. Đọc mã lỗi: `ENOTFOUND` là lỗi phân giải tên; sai mật khẩu sẽ là `password authentication failed`, DB chưa lên sẽ là `ECONNREFUSED` hoặc timeout.
3. Hỏi: job chạy trực tiếp trên runner hay trong `container:`? Tên service chỉ phân giải được khi job nằm trong network Docker cùng service.

Nguyên nhân gốc: job chạy trên runner nên service chỉ truy cập được qua `localhost` và cổng đã map trong `ports`. Sửa lại `DB_HOST: localhost`. Phòng tránh: đặt host và cổng ở một chỗ (khối `env` của job) và giữ health check.

#### Những hiểu lầm hay gặp

- Nghĩ unit test xanh nghĩa là API nối được DB thật. Mock không kiểm tra host, mật khẩu, schema hay cú pháp SQL.
- Tự gán `pool.query = ...` thay cho `t.mock.method`, làm bản giả rò rỉ sang test khác.
- Quên `pool.end()` hoặc `server.close()` nên process không thoát.
- Đặt workflow trong `lab-17/` rồi thắc mắc vì sao Actions không chạy.
- Chọn nhầm tên check trong branch protection (ví dụ tên workflow thay vì tên job), hoặc áp dụng rule cho nhánh khác. Rule sai trông giống rule đúng cho đến khi có người merge code đỏ.
- Path filter trên workflow có check bắt buộc làm check kẹt ở "Expected - Waiting for status".
- Quên `if: always()` nên không có report đúng lúc cần nhất.
- Mô tả "đã chạy integration" nhưng evidence thiếu `RUN_INTEGRATION=1` hoặc `DB_PORT=5433`.

### Buổi 18 – Docker CI Pipeline

#### Đáp án các nhiệm vụ L1

1. **Chuẩn bị và build tay.** Chép `backend` và `frontend` vào `lab-18/source`, xóa `node_modules`, rồi `docker build` hai image thử. Build tay lỗi thì CI chắc chắn lỗi, nên sửa ở bước này trước.

2. **Phần 1: workflow publish `club-api`.** Bộ khung đúng gồm: `permissions: contents: read` ở cấp workflow, job `publish` nâng lên `contents: read` cộng `packages: write`, các bước theo thứ tự checkout, `setup-buildx-action`, `login-action` (username `github.actor`, password `secrets.GITHUB_TOKEN`), `metadata-action` với `type=sha`, rồi `build-push-action` với `context: lab-18/source/backend`. Không có PAT hay secret tự tạo. Tên image lấy từ `github.repository_owner` và được `metadata-action` đưa về chữ thường.

3. **Phần 2: đọc log.** Mở run mới nhất, job `publish`; ở bước `Build and push` có dòng kiểu `pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx`. Khi run đỏ, đọc bước đỏ đầu tiên chứ không phải bước cuối. Chép tên workflow, dòng push và tag vào `evidence/command-output.txt`.

4. **Phần 3: kiểm tra package.** Tag `sha-xxxxxxx` phải trùng 7 ký tự đầu của `git rev-parse --short=7 HEAD` tại commit đã kích hoạt run. Mentor đối chiếu bằng cách mở commit của run, không chỉ nhìn evidence. Package mới thường private; đổi sang Public ở Package settings nếu muốn pull không cần đăng nhập.

5. **Phần 4: pull và chạy.** Trình tự cần thấy trong evidence: `docker rmi club-api:1.0.0` (chứng minh image local không còn), `docker pull ghcr.io/OWNER/club-api:sha-...` có dòng `Status:`, chạy trên cổng 3100, `curl` `/health` trả `{"status":"healthy","service":"club-api"}`, `docker inspect --format '{{index .RepoDigests 0}}' ...` in `@sha256:`, rồi `docker rm -f lab18-api`. Lệnh `docker inspect` chỉ có `RepoDigests` khi image đến từ `docker pull` hoặc `push`; image build local sẽ báo lỗi hoặc rỗng, đó là cách mentor phân biệt. `/health` chạy mà không cần DB vì endpoint chỉ trả JSON tĩnh.

#### Lời giải L2

Lời giải tham khảo. Phần học viên phải tự giải thích từng dòng:

- **Matrix (`strategy.matrix.include`)** cho hai phần tử `club-api` và `club-web`, mỗi phần tử có `name` và `context`; `${{ matrix.name }}` đi vào `images`, `${{ matrix.context }}` vào `context`. Một job, hai lần chạy song song.
- **Tag theo git tag**: cần cả hai thứ, `tags: ["v*"]` trong `on.push` và dòng `type=ref,event=tag` trong `metadata-action`. Thiếu một trong hai thì không có tag `v1.0.0`. Khi đẩy tag, `type=sha` vẫn sinh thêm tag `sha-`, nên mỗi image có đủ hai tag như tiêu chí.
- **Cache**: `cache-from: type=gha,scope=...` và `cache-to: type=gha,scope=...,mode=max`. `mode=max` lưu cả layer của stage trung gian `dependencies` (chứa `npm ci`), nên lần sau bỏ qua `npm ci` nếu `package-lock.json` không đổi. Mỗi image một `scope`, nếu không hai job matrix ghi đè cache của nhau.
- **Pull request chỉ build**: `if: github.event_name != 'pull_request'` cho bước login và `push: ${{ github.event_name != 'pull_request' }}`. Token của PR từ fork không có quyền ghi.

Workflow L2 đầy đủ (lời giải tham khảo). Trên sự kiện `pull_request`, GITHUB_TOKEN của PR từ fork không có quyền ghi nên không push và không login; build vẫn chạy để bắt lỗi Dockerfile sớm.

```yaml
name: Publish images

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:

permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        include:
          - name: club-api
            context: lab-18/source/backend
          - name: club-web
            context: lab-18/source/frontend
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        if: github.event_name != 'pull_request'
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/${{ matrix.name }}
          tags: |
            type=sha
            type=ref,event=tag

      - uses: docker/build-push-action@v6
        with:
          context: ${{ matrix.context }}
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha,scope=${{ matrix.name }}
          cache-to: type=gha,scope=${{ matrix.name }},mode=max
```

Gợi ý từng bậc cho học viên bị kẹt: matrix dùng `strategy.matrix.include` với hai phần tử có `name` và `context`; tag theo git tag cần `tags: ["v*"]` trong `on.push` và `type=ref,event=tag`; cache cần hai dòng `type=gha` (với matrix thêm `scope` riêng cho từng image); PR không push bằng biểu thức điều kiện cho `push` và `if: github.event_name != 'pull_request'` cho login; đẩy git tag bằng `git tag v1.0.0` rồi `git push origin v1.0.0`.

Cách tìm bằng chứng cache trong log lần chạy thứ hai: dòng có `CACHED` hoặc `importing cache manifest from gha`. Học viên phải ghi thời gian hai run kèm link và trích đúng dòng đó; số liệu trùng tài liệu hay trùng bạn khác là dấu hiệu bất thường.

Câu 5 của L2 (viết trong `report.md`): `GITHUB_TOKEN` được cấp riêng cho từng lần chạy, hết hạn khi job kết thúc và bị giới hạn bởi khối `permissions`; PAT gắn với một người, sống lâu và thường rộng quyền nên lộ là hậu quả lớn. `packages: write` đặt ở cấp job để các job khác (nếu thêm sau này) không tự có quyền ghi package, đúng nguyên tắc least privilege.

#### Lời giải phần Phá lỗi và debug

**Tình huống A – thiếu `packages: write`.** Run đỏ ở `Build and push`, log có `denied`, `permission_denied: write_package` hoặc `403 Forbidden`; bước login vẫn xanh vì đăng nhập chỉ xác thực danh tính. Cây điều tra:

1. Tìm bước đỏ đầu tiên, đọc dòng lỗi cuối của bước đó.
2. `denied` hoặc `403` khi push, trong khi bước build đã chạy xong: nghi quyền token, không phải Dockerfile.
3. Mở Set up job, mục `GITHUB_TOKEN Permissions` để xem token thật sự có quyền gì.
4. Đọc khối `permissions` ở cả cấp workflow và cấp job (cấp job ghi đè cấp workflow). Repo thuộc tổ chức thì kiểm tra thêm Settings, Actions, General, Workflow permissions.

Nguyên nhân gốc: token thiếu `packages: write`, hoặc package đã tồn tại và thuộc repo khác. Phòng tránh: khai báo `permissions` tường minh và đọc mục `GITHUB_TOKEN Permissions` khi gặp lỗi quyền.

**Tình huống B – pull bị từ chối do package private.** Sau `docker logout ghcr.io`, `docker pull` báo `denied` hoặc `unauthorized` (thông báo giống hệt khi gõ sai tên). Cây điều tra: tên image có chữ thường và đúng tag không; mở trang package xem visibility; nếu private thì đăng nhập bằng PAT classic có `read:packages` hoặc đổi sang Public. Nguyên nhân gốc: package private chỉ cho người đã xác thực và có quyền. Đăng nhập an toàn bằng token qua stdin:

```bash
read -rs GHCR_TOKEN && export GHCR_TOKEN
echo "$GHCR_TOKEN" | docker login ghcr.io -u OWNER --password-stdin
```

Không dán PAT vào lệnh hay file. Luyện thêm: `examples/troubleshooting/scenario-06` và `scenario-07`.

#### Những hiểu lầm hay gặp

- Nghĩ login xanh nghĩa là push sẽ được. Login chỉ xác thực, quyền ghi nằm ở `permissions`.
- Tag `latest` là "bản mới nhất". Tag là con trỏ đổi được; digest mới bất biến.
- Tự ghép tag bằng tên tài khoản có chữ hoa, gây `invalid reference format`.
- Bỏ `scope` cache nên club-api và club-web ghi đè cache của nhau.
- `docker pull` thành công nhưng đang chạy image build local cùng tên vì chưa `docker rmi`.
- Đặt `packages: write` ở cấp workflow cho "tiện".
- Dùng cổng 3000, 5432 hoặc 8080 trong lệnh evidence thay vì cổng riêng (3100, 5433).

### Bài tập tuần

#### Nhiệm vụ 1 – Unit test cho API

Gợi ý lời giải: `tests/api.test.js` như phần L1 trên. Mentor kiểm: bốn test mới đều dùng `t.mock.method`, test nhánh lỗi mock `console.error`, `npm ci && npm test` cho `pass 5`, `fail 0` và process tự thoát, không có `node_modules` hay `test-results.xml` trong commit.

#### Nhiệm vụ 2 – Workflow test và report

Gợi ý: `lab17-ci.yml` ở `.github/workflows/`, job `unit-tests`, `permissions: contents: read`, reporter `spec` cộng `junit`, upload `test-results-unit` với `if: always()`. Cần hai run: một xanh có artifact, một đỏ (nhánh cố ý sai) vẫn có artifact. Số `testcase` trong XML phải bằng số test của `npm test`.

#### Nhiệm vụ 3 – Chặn merge khi CI đỏ

Gợi ý: bật Require a pull request và Require status checks với `unit-tests`. Bằng chứng: link một PR đỏ bị khóa nút Merge, link PR đã sửa xanh, ảnh danh sách required checks. Nếu repo private gói Free, học viên phải giải thích hợp lý việc đổi sang public hoặc phương án thay thế.

#### Nhiệm vụ 4 – Workflow publish `club-api`

Gợi ý: như Phần 1 của Buổi 18. Kiểm tra: `permissions` cấp workflow chỉ `contents: read`, `packages: write` ở cấp job, không PAT, tên image chữ thường, tag `sha-` khớp `git rev-parse --short=7 HEAD` của commit kích hoạt run (cả hai ghi trong evidence).

#### Nhiệm vụ 5 – Pull và chạy image đã publish

Gợi ý: xóa image local, pull theo tag `sha-`, chạy cổng 3100, `curl /health`, `docker inspect` lấy digest, dọn container. Digest phải khớp trang package trên GHCR.

#### Nhiệm vụ L2

- **A (integration test):** như Phần 5 và 6 của Buổi 17. Kiểm: có và không có `RUN_INTEGRATION=1`; chạy hai lần và chạy riêng bằng `--test-name-pattern` cho kết quả giống nhau; job `integration-tests` xanh với artifact `test-results-integration`; có test nhánh 500 khi thiếu bảng và không làm hỏng test khác.
- **B (hai image, tag, cache):** như lời giải L2 Buổi 18. Kiểm: tag `v1.0.0` và một tag `sha-` trên cả hai image; PR không tạo package mới; hai link run, thời gian và dòng log chứng minh cache.
- **C (giải thích thiết kế):** các ý nêu ở Thử thách 3 của Buổi 17 và câu 5 của L2 Buổi 18, mỗi ý kèm ví dụ gắn với repo của học viên.

#### Đáp án 5 câu hỏi kiểm tra

1. Không. Mock chỉ cho handler nhận dữ liệu đúng nên SQL sai không bị phát hiện; câu truy vấn thật chỉ được thực thi khi có PostgreSQL. Integration test bắt được SQL sai, schema lệch và cấu hình kết nối sai.
2. Step mặc định bị bỏ qua khi step trước đỏ, mà report cần nhất khi test đỏ nên phải `if: always()`. Hai job upload artifact v4 trong cùng một run phải có tên khác nhau (`test-results-unit` và `test-results-integration`) vì tên phải duy nhất.
3. Ít nhất ba nguyên nhân: chưa bật Require status checks (xem Settings, Branches); chọn sai tên check hoặc chưa từng chạy nên không chọn được (so với tên job trong tab Checks); rule áp dụng sai nhánh (pattern `main` so với nhánh mặc định thật); người có quyền admin được phép bỏ qua rule; check bị bỏ qua do path filter. Mỗi nguyên nhân kiểm bằng một bước cụ thể trong cài đặt hoặc trong tab Checks của PR.
4. Tag là nhãn có thể trỏ sang image khác; digest là mã băm nội dung, bất biến. `latest` hôm nay và tuần sau có thể là hai image khác nhau nên không tái lập được bản phát hành; dùng tag `sha-` hoặc digest.
5. Kiểm tra quyền của token: khối `permissions` ở cấp workflow và cấp job, cùng mục `GITHUB_TOKEN Permissions` trong log Set up job. Login thành công chỉ chứng minh danh tính, chưa chứng minh có quyền ghi package.

### Hướng dẫn chấm cho mentor

Mở link run và PR thật, đối chiếu SHA với lịch sử commit, tải artifact về xem. Điểm tối đa của một tiêu chí không được cho nếu chỉ có ảnh chụp màn hình hoặc output có dấu hiệu chỉnh tay. Kiểm tra chéo nên làm: tag `sha-` so với commit của run; số `testcase` trong artifact so với `npm test`; digest so với trang package.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: unit test (15) | `evidence/test-results.txt` có `pass 5`, `fail 0`; file `tests/api.test.js` dùng `t.mock.method`; chạy lại `npm ci && npm test` được | Test gọi DB thật; gán trực tiếp `pool.query`; không có `pool.end()` nên treo; tổng số test không khớp log | Vì sao mock `console.error` trong test nhánh 500? Điều gì xảy ra nếu bỏ `pool.end()`? |
| Nhiệm vụ 2: workflow và report (15) | Link run xanh và run đỏ; artifact `test-results-unit` có ở cả hai; `if: always()` | Workflow nằm trong `lab-17/`; chỉ có run xanh; số testcase trong XML khác `npm test` | Vì sao step upload cần `if: always()`? Vì sao `working-directory` phải khớp `cache-dependency-path`? |
| Nhiệm vụ 3: branch protection (15) | Link PR đỏ bị khóa và PR xanh mở khóa; ảnh required checks có `unit-tests` | Chỉ có ảnh; rule chọn tên workflow thay vì tên job; rule áp dụng nhầm nhánh | Làm sao biết rule thật sự có tác dụng? Admin có bỏ qua được rule không? |
| Nhiệm vụ 4: workflow publish (20) | Khối `permissions` (workflow chỉ đọc, job có `packages: write`); dùng `secrets.GITHUB_TOKEN`; dòng push manifest; `sha-` khớp `git rev-parse --short=7 HEAD` | `packages: write` ở cấp workflow; có PAT; tag không khớp commit; tên image chữ hoa | Nếu xóa `packages: write` thì bước nào đỏ và vì sao login vẫn xanh? Vì sao tên image phải chữ thường? |
| Nhiệm vụ 5: pull và chạy (10) | `docker rmi`, `docker pull` có `Status:`, `curl` healthy cổng 3100, digest, container đã dọn | Thiếu `docker pull`; digest không có `@sha256`; dùng cổng 3000 hoặc 8080 | Digest khác tag ở điểm nào? Vì sao `/health` chạy mà không cần DB? |
| README và report (10) | Đủ 7 câu; một lỗi thật với cây điều tra, nguyên nhân gốc, cách phòng | Chép nguyên văn bài lab; không có lỗi hay số liệu của riêng học viên | Chọn một lỗi trong report và yêu cầu tái hiện nhanh. |
| Câu hỏi kiểm tra (10) | Năm câu trả lời có lập luận, ví dụ gắn với repo | Trả lời giống từng chữ với bài khác; chỉ nêu kết luận | Câu 3: yêu cầu liệt kê ba nguyên nhân và chỉ chỗ kiểm tra từng cái trên GitHub. |
| Vệ sinh và quy trình (5) | Không `node_modules`, `test-results.xml`, `.env`, token; PR có reviewer | Có secret hoặc `.env` trong commit; PR không có review | Chạy `git log --stat` và `git grep -i token` trên repo của học viên. |
| L2-A integration test (4) | Output có và không có `RUN_INTEGRATION=1`; chạy riêng bằng `--test-name-pattern`; job `integration-tests` xanh; test nhánh 500 | Test phụ thuộc thứ tự; không có `TRUNCATE` hay dọn dữ liệu; thiếu health check cho service | Vì sao test này không phụ thuộc test khác? Nếu thêm file integration thứ hai thì cần gì? |
| L2-B pipeline hai image (4) | Run theo tag `v1.0.0`; GHCR có hai image mỗi image hai tag; run PR bỏ qua login; thời gian hai run kèm dòng `CACHED` | Không có dòng cache; PR vẫn push; thiếu `scope` | Nếu bỏ `scope` thì điều gì xảy ra? Vì sao `mode=max`? |
| L2-C giải thích (2) | Giải thích có ví dụ gắn với repo | Chung chung, giống bài lab | Test nào bạn thêm khi có `POST /api/members` và vì sao? |

Hai lưu ý khi chấm: run ID, SHA và digest phải thuộc repo của chính học viên; và bài không có bằng chứng kiểm chứng được cho một nhiệm vụ thì nhiệm vụ đó tối đa một nửa điểm, theo barem của đề.
