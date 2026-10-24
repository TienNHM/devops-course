# Buổi 17 – Thử thách thêm (L2)

Tuần 9/16 · Giai đoạn 3 – CI/CD & Automation · Buổi 17/32

[Bài học Buổi 17](session-17.md) · [Bài tập tuần 9](../../assignments/weekly/week-09.md) · [Hub tuần 9](README.md)

> **Tóm tắt:** Phần tùy chọn của Buổi 17: integration test với PostgreSQL thật, service container trong GitHub Actions, ba thử thách tự làm và hai tình huống phá lỗi nâng cao.

::: tip Trang này dành cho ai
Chỉ làm sau khi bạn đã hoàn thành L1 của [Buổi 17 – Automated Testing](session-17.md). Mất khoảng 45 đến 60 phút, làm ở nhà. Cần Docker Desktop đang chạy. Đối chiếu đáp án sau khi nộp bài: [trang tuần 9](README.md).
:::

## Tìm hiểu thêm {#tim-hieu-them}

**So sánh unit test và integration test:**

| Tiêu chí | Unit test | Integration test |
| --- | --- | --- |
| Kiểm tra | Một đơn vị logic (route handler, hàm) | Nhiều thành phần chạy cùng nhau (API + PostgreSQL thật) |
| Phụ thuộc ngoài | Thay bằng mock/stub | Dùng dịch vụ thật (container) |
| Tốc độ | Mili giây | Giây (phải khởi động DB) |
| Ổn định | Rất cao | Phụ thuộc môi trường, dễ flaky nếu dữ liệu không được dọn |
| Bắt được lỗi | Logic sai, nhánh lỗi chưa xử lý | SQL sai, schema lệch, cấu hình kết nối sai |
| Ví dụ trong lab | `/ready` trả 503 khi `pool.query` ném lỗi | `/api/members` trả đúng 2 thành viên từ bảng `members` thật |

**Tùy chọn của reporter:** `--test-reporter` và `--test-reporter-destination` chọn định dạng báo cáo (`spec`, `junit`, `tap`, `lcov`) và nơi ghi.

**Luồng đầy đủ khi có cả integration test:**

1. Dev push nhánh `add-api-tests` và mở pull request vào `main`. Event `pull_request` kích hoạt workflow.
2. GitHub tạo runner độc lập cho từng job; các job chạy song song.
3. Job `unit-tests` cài dependency bằng `npm ci`, chạy test với mock pool. Không cần database.
4. Job `integration-tests` khai báo `services.postgres`. Runner khởi động container `postgres:17-alpine`, chờ health check pass, rồi mới chạy các step. Job chạy trực tiếp trên runner nên ứng dụng kết nối qua `localhost:5432`.
5. Mỗi job ghi `test-results.xml` và upload artifact, kể cả khi test fail (`if: always()`).
6. Branch protection đọc kết quả các check. Thiếu một check xanh thì nút Merge bị khóa.

Workflow đầy đủ có sẵn để đối chiếu ở `examples/github-actions/ci-integration-postgres.yml`.

## Phần 5 – Integration test với PostgreSQL thật (25 phút)

Chạy PostgreSQL cục bộ ở cổng 5433 (tránh đụng cổng 5432 của compose nếu bạn đang chạy):

```bash
docker run -d --name lab17-pg \
  -e POSTGRES_USER=club -e POSTGRES_PASSWORD=ci-only-password -e POSTGRES_DB=clubdb \
  -p 5433:5432 postgres:17-alpine
docker exec lab17-pg pg_isready -U club -d clubdb
```

Kết quả mong đợi: `/var/run/postgresql:5432 - accepting connections` (nếu chưa sẵn sàng, chờ vài giây rồi chạy lại).

Tạo `tests/members.integration.test.js`:

```js
import { describe, test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { app } from "../app.js";
import { pool } from "../db.js";

const enabled = process.env.RUN_INTEGRATION === "1";

describe("members API with real PostgreSQL", { skip: !enabled }, () => {
  let server;
  let baseUrl;

  before(async () => {
    const schema = await readFile(
      new URL("../../database/init.sql", import.meta.url),
      "utf8"
    );
    await pool.query(schema);
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE members RESTART IDENTITY");
    await pool.query(
      "INSERT INTO members (name, email) VALUES ($1, $2), ($3, $4)",
      ["Alice", "alice@example.com", "Bob", "bob@example.com"]
    );
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  test("GET /ready returns 200 with a live database", async () => {
    const res = await fetch(`${baseUrl}/ready`);
    assert.equal(res.status, 200);
  });

  test("GET /api/members returns seeded members in id order", async () => {
    const res = await fetch(`${baseUrl}/api/members`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(
      body.map((m) => m.name),
      ["Alice", "Bob"]
    );
  });
});
```

Chạy từ `lab-17/source/backend`:

```bash
RUN_INTEGRATION=1 DB_PORT=5433 DB_PASSWORD=ci-only-password npm test -- --test-reporter=spec
```

Kết quả mong đợi (rút gọn): `tests 7`, `pass 7`, `fail 0`. Nếu bỏ `RUN_INTEGRATION=1`, cả nhóm `members API with real PostgreSQL` hiển thị `skipped` (con số tổng có thể khác chút tùy phiên bản Node): nhờ vậy `npm test` vẫn chạy được trên máy không có DB.

Vì sao `TRUNCATE ... RESTART IDENTITY` trong `beforeEach`: mỗi test tự dựng dữ liệu mình cần, nên kết quả không phụ thuộc test nào chạy trước. Đây là cách phòng lỗi "phụ thuộc thứ tự" ở phần phá lỗi bên dưới.

Dọn container khi làm xong phần này (hoặc sau khi làm xong Tình huống A bên dưới):

```bash
docker rm -f lab17-pg
```

::: tip Kiểm tra: bạn đúng khi
Có `RUN_INTEGRATION=1` thì thấy `pass 7`, `fail 0`; không có biến thì nhóm DB là `skipped` và lệnh vẫn xanh. Gặp `ECONNREFUSED` hoặc `password authentication failed`: xem bảng ở cuối trang.
:::

## Phần 6 – Service container trong Actions và upload report (20 phút)

Thêm job thứ hai vào cùng file `lab17-ci.yml` (cùng cấp với `unit-tests`):

```yaml
  integration-tests:
    name: integration-tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: lab-17/source/backend
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_USER: club
          POSTGRES_PASSWORD: ci-only-password
          POSTGRES_DB: clubdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U club -d clubdb"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    env:
      RUN_INTEGRATION: "1"
      DB_HOST: localhost
      DB_PORT: "5432"
      DB_NAME: clubdb
      DB_USER: club
      DB_PASSWORD: ci-only-password
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: lab-17/source/backend/package-lock.json

      - run: npm ci

      - name: Run integration tests
        run: >
          npm test --
          --test-reporter=spec --test-reporter-destination=stdout
          --test-reporter=junit --test-reporter-destination=test-results.xml

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-integration
          path: lab-17/source/backend/test-results.xml
```

Các điểm cần giải thích được:

- `ports: 5432:5432` map cổng container ra runner, nên `DB_HOST` là `localhost`.
- `--health-cmd` làm runner chờ Postgres sẵn sàng trước khi chạy step đầu tiên; thiếu nó, test có thể chạy khi DB chưa nhận kết nối.
- Mật khẩu `ci-only-password` chỉ tồn tại trong service container tạm thời của CI. Với DB thật hoặc môi trường khác, dùng GitHub Secrets, không ghi vào file.

Job này chạy toàn bộ test (cả unit lẫn integration) vì `RUN_INTEGRATION=1` chỉ bật thêm nhóm test dùng DB. Push, đợi cả hai job xanh, rồi vào **Settings > Branches** và thêm `integration-tests` vào danh sách required checks.

::: tip Kiểm tra: bạn đúng khi
Run có hai job `unit-tests` và `integration-tests` đều xanh, có hai artifact `test-results-unit` và `test-results-integration`, và `integration-tests` nằm trong required checks.
:::

## Thử thách tự làm (L2)

Mỗi thử thách có gợi ý. Tự thử 15 phút trước khi mở gợi ý.

### Thử thách 1 – Coverage nhánh lỗi

Viết thêm một integration test chứng minh API trả 500 khi bảng `members` không tồn tại (ví dụ `DROP TABLE members` trong test rồi tạo lại ở `after`/`beforeEach`).

- Tiêu chí hoàn thành: test pass cả cục bộ lẫn trong Actions, các test khác không bị ảnh hưởng, không có test phụ thuộc thứ tự.

<details><summary>Gợi ý (tự thử 15 phút trước khi mở)</summary>

`beforeEach` hiện chạy `TRUNCATE members`, sẽ lỗi nếu bảng đã bị xóa. Hãy chạy lại schema (`init.sql` dùng `CREATE TABLE IF NOT EXISTS`) ở đầu `beforeEach` trước khi `TRUNCATE`, và nhớ mock `console.error` để log không nhiễu.

Bạn cần đọc nội dung schema ở đầu file (ESM cho phép top-level await) để cả `before` lẫn `beforeEach` dùng lại.

</details>

### Thử thách 2 – Job summary

Thêm step in số test pass/fail vào trang tóm tắt của workflow run.

- Tiêu chí hoàn thành: trang run hiển thị một đoạn tóm tắt kết quả test, kể cả khi test fail.

<details><summary>Gợi ý (tự thử 15 phút trước khi mở)</summary>

Ghi nội dung Markdown vào file có đường dẫn trong biến môi trường `GITHUB_STEP_SUMMARY`. Với `node --test`, dòng `ℹ pass` và `ℹ fail` có trong output của reporter `spec`; hoặc `grep` trong `test-results.xml`. Trong JUnit XML của Node 22, mỗi test là một thẻ `testcase` nằm trên một dòng riêng và test hỏng có thẻ con `failure`; thẻ gốc `testsuites` không có thuộc tính đếm nên đừng lấy số liệu từ nó. Đặt step sau step chạy test và nhớ `if: always()`.

</details>

### Thử thách 3 – Giải thích

Trong `README.md` (câu 3 và 7), giải thích vì sao cần cả unit test lẫn integration test, và đề xuất một test nữa nên thêm khi capstone có `POST /api/members`.

## Phá lỗi nâng cao {#pha-loi-nang-cao}

### Tình huống A – Test pass khi chạy riêng, fail khi chạy chung

Cách phá: trong file integration, xóa dòng `TRUNCATE` khỏi `beforeEach` (giữ INSERT nhưng thêm `ON CONFLICT (email) DO NOTHING` vào câu lệnh để không đụng ràng buộc UNIQUE), rồi thêm trước test danh sách một test chèn thêm thành viên:

```js
test("inserts Carol", async () => {
  await pool.query(
    "INSERT INTO members (name, email) VALUES ('Carol', 'carol@example.com') ON CONFLICT (email) DO NOTHING"
  );
});
```

Triệu chứng: chạy cả file, test `returns seeded members in id order` fail với `AssertionError` (expected `['Alice','Bob']`, actual có thêm `Carol`). Nếu bạn tạo lại container DB mới (`docker rm -f lab17-pg` rồi chạy lại lệnh ở Phần 5) và chạy riêng bằng `--test-name-pattern="seeded members"` thì test lại pass. Nhưng chạy riêng lần nữa sau một lần chạy cả file thì lại fail, vì Carol đã nằm lại trong DB: kết quả phụ thuộc lịch sử của DB.

Hướng điều tra:

1. Chạy lại cả file nhiều lần và chạy trên DB mới: kết quả đổi theo trạng thái DB thì nghi dữ liệu bẩn.
2. So sánh chạy riêng và chạy chung: nếu khác nhau, có test khác để lại trạng thái.
3. Vào DB xem dữ liệu thật:

   ```bash
   docker exec lab17-pg psql -U club -d clubdb -c "SELECT id, name FROM members ORDER BY id"
   ```

4. Tìm test ghi dữ liệu mà không dọn.

Nguyên nhân gốc: các test dùng chung một database và không có bước đưa DB về trạng thái đã biết. Cách phòng: mỗi test tự dựng dữ liệu (`TRUNCATE ... RESTART IDENTITY` trong `beforeEach`), không giả định test khác đã chạy, và nếu có nhiều file cùng dùng DB thì chạy tuần tự bằng `--test-concurrency=1`.

### Tình huống B – Job không kết nối được service container

Cách phá: trong job `integration-tests`, đổi `DB_HOST: localhost` thành `DB_HOST: postgres` (tên service), push.

Triệu chứng: job đỏ, log có lỗi dạng `getaddrinfo ENOTFOUND postgres` ở bước chạy test, container Postgres vẫn khởi động bình thường ở bước "Initialize containers".

Hướng điều tra:

1. Mở step "Initialize containers" (hoặc "Set up job"): Postgres có healthy không? Nếu có, vấn đề nằm ở phía kết nối.
2. Đọc `ENOTFOUND`: đây là lỗi phân giải tên, không phải lỗi mật khẩu hay timeout.
3. Tự hỏi: job chạy trực tiếp trên runner hay trong container (`container:`)? Tên `postgres` chỉ phân giải được từ job chạy trong container cùng network.

Nguyên nhân gốc: khi job chạy trực tiếp trên runner, service được truy cập qua `localhost` và cổng đã map trong `ports`. Cách phòng: ghi rõ trong workflow cách kết nối, đặt host/port qua biến `env` ở một chỗ, và dùng health check để loại trừ nguyên nhân DB chưa sẵn sàng.

Mở rộng: so sánh với `examples/troubleshooting/scenario-06` (GitHub Actions fail) về cách đọc log từ step lỗi đầu tiên.

## Câu hỏi thêm

1. `t.mock.method` khác gì việc tự gán `pool.query = ...`?

   ::: details Đáp án gợi ý
   `t.mock.method` tự khôi phục method gốc khi test kết thúc và ghi lại số lần gọi. Gán trực tiếp phải tự khôi phục, dễ làm rò rỉ sang test khác.
   :::

2. Tình huống: test `list members` pass trên máy bạn nhưng đỏ trong CI, trên CI DB luôn mới. Bạn nghi điều gì?

   ::: details Đáp án gợi ý
   Test phụ thuộc dữ liệu cục bộ còn sót lại (hoặc thứ tự chạy) thay vì tự dựng dữ liệu. Trên CI DB trống nên thiếu dữ liệu mà test giả định có sẵn. Sửa bằng cách seed dữ liệu trong `beforeEach`.
   :::

3. Vì sao cần `--health-cmd` cho service container Postgres?

   ::: details Đáp án gợi ý
   Container "chạy" không có nghĩa Postgres đã nhận kết nối. Health check làm runner chờ tới khi `pg_isready` thành công, tránh test fail ngẫu nhiên vì kết nối quá sớm.
   :::

4. Trong job chạy trực tiếp trên runner, vì sao `DB_HOST` là `localhost` mà không phải `postgres`?

   ::: details Đáp án gợi ý
   Service được publish qua `ports` ra máy runner. Tên `postgres` chỉ phân giải được trong network Docker của job chạy bằng `container:`.
   :::

## Gặp lỗi trong phần này?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:5432` khi test cục bộ | Chưa chạy DB, hoặc DB ở cổng 5433 nhưng quên `DB_PORT=5433` | Chạy `docker ps`, đặt đúng `DB_PORT` |
| `password authentication failed for user "club"` | `DB_PASSWORD` không khớp `POSTGRES_PASSWORD` | Đồng bộ biến ở workflow và container |
| `getaddrinfo ENOTFOUND postgres` | `DB_HOST` đặt tên service trong job chạy trên runner | Đặt `DB_HOST: localhost` |
| Hai job upload artifact báo trùng tên | Artifact v4 yêu cầu tên duy nhất trong một run | Dùng `test-results-unit` và `test-results-integration` |
| Container `lab17-pg` đã tồn tại khi chạy lại `docker run` | Lần trước chưa dọn | `docker rm -f lab17-pg` rồi chạy lại |

Quay lại bài chính: [Buổi 17 – Automated Testing](session-17.md). Buổi tiếp theo: [Buổi 18 – Docker CI Pipeline](session-18.md).

## Tài liệu tham khảo {#tai-lieu}

- [GitHub Actions: Creating PostgreSQL service containers](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers)
- [GitHub Docs: Workflow commands, job summaries](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)
