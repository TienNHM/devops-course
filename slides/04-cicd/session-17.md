# Slide buổi 17 – Automated Testing

> **Tóm tắt:** Buổi học hướng dẫn viết unit test (mock pool) bằng `node:test`, chạy test trong GitHub Actions và dùng branch protection để chặn merge khi CI đỏ. Integration test với Postgres là phần tùy chọn.

## Mục tiêu của buổi học

![Ba mục tiêu: viết test, chạy tự động, khóa merge](/slides/img/s17-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Câu hỏi mở đầu: ai đã từng merge xong mới biết code hỏng?
:::

---

## Bài toán: chỉ biết lỗi sau khi merge

![Thành viên A sửa SQL, merge, cả nhóm gặp lỗi 500](/slides/img/s17-no-gate.svg)

::: details Ghi chú cho mentor
- Tình huống: thành viên A đổi câu SQL trong `/api/members`, chạy thử trên máy mình thấy ổn rồi merge.
- Tối đó cả nhóm chạy `docker compose up` thì API trả 500, không ai biết thay đổi nào gây lỗi.
:::

---

## Khái niệm: Unit test

![Unit test chạy club-api riêng, không dùng PostgreSQL](/slides/img/s17-k-unit-test.svg)

- **Unit test** là bài kiểm tra tự động cho một đơn vị mã nhỏ, chạy độc lập với thành phần bên ngoài.
- Ví dụ trong dự án: test `GET /health` kiểm tra API trả `ok`, không cần PostgreSQL.

::: details Ghi chú cho mentor
- Đơn vị mã nhỏ là một hàm hoặc một route.
- Vì không phụ thuộc database hay mạng, unit test chạy nhanh và cho kết quả lặp lại được.
:::

---

## Khái niệm: Integration test

![Integration test chạy club-api cùng PostgreSQL thật](/slides/img/s17-k-integration-test.svg)

- **Integration test** là bài kiểm tra nhiều thành phần chạy cùng nhau, ví dụ API kết nối tới database thật.
- Ví dụ trong dự án: truy vấn `/api/members` chạy trên PostgreSQL thật thay vì dữ liệu giả.

::: details Ghi chú cho mentor
- Loại test này phát hiện lỗi ở chỗ nối giữa các thành phần, nhưng chậm hơn và cần môi trường dựng sẵn.
:::

---

## Unit test và integration test

![So sánh unit test dùng mock và integration test dùng DB thật](/slides/img/s17-unit-vs-integration.svg)

::: details Ghi chú cho mentor
- Nhiều unit test nhanh làm nền, thêm vài integration test cho các đường đi quan trọng.
- Ví dụ so sánh: unit test kiểm tra từng bóng đèn, integration test bật cả hệ thống điện.
:::

---

## Khái niệm: Mock

![Mock thay pool.query thật bằng bản giả trả rows](/slides/img/s17-k-mock.svg)

- **Mock** là đối tượng giả thay một thành phần thật khi test, trả dữ liệu định sẵn.
- Ví dụ trong dự án: `pool.query` được thay bằng bản giả trả `rows` có sẵn.

::: details Ghi chú cho mentor
- Nhờ mock, test không cần database thật nên chạy nhanh và ổn định.
- Lưu ý: mock luôn trả dữ liệu đúng thì SQL sai vẫn lọt.
- Nếu mock luôn trả dữ liệu đúng thì câu SQL sai vẫn không bị phát hiện; vì vậy cần thêm integration test.
:::

---

## Mock thay thế database

![Mock thay pool.query thật bằng bản giả trả rows có sẵn](/slides/img/s17-mock.svg)

::: details Ghi chú cho mentor
- `t.mock.method` gắn với test context nên tự khôi phục khi test kết thúc.
- Hạn chế: nếu mock luôn trả dữ liệu đúng thì SQL sai vẫn không bị phát hiện.
:::

---

## node:test có sẵn trong Node 22

```js
import { test } from "node:test";
import assert from "node:assert/strict";

test("GET /ready returns 200", async (t) => {
  t.mock.method(pool, "query", async () => ({ rows: [{ "?column?": 1 }] }));
  const res = await fetch(`${baseUrl}/ready`);
  assert.equal(res.status, 200);
});
```

Không cần cài Jest hay Mocha. Chạy test bằng `node --test`.

---

## Chạy test: mốc xanh đầu tiên

```text
$ npm test -- --test-reporter=spec
✔ GET /health returns ok
✔ GET /ready returns 200 when database answers
✔ GET /ready returns 503 when database fails
✔ GET /api/members returns rows from the pool
✔ GET /api/members returns 500 when query fails
ℹ tests 5   ℹ pass 5   ℹ fail 0
```

Kiểm tra: kết quả đúng khi có 5 dấu `✔`, `fail 0` và lệnh tự thoát.

---

## Khái niệm: Branch protection

![PR xanh mở Merge, PR đỏ khóa Merge](/slides/img/s17-k-branch-protection.svg)

- **Branch protection** (bảo vệ nhánh) là bộ quy tắc của GitHub cho một nhánh, ví dụ bắt buộc status check xanh trước khi merge.
- Ví dụ trong dự án: `main` yêu cầu job `unit-tests` xanh; PR đỏ bị khóa Merge.

::: details Ghi chú cho mentor
- Quy tắc này biến kết quả CI thành điều kiện bắt buộc: pull request có check đỏ không thể merge.
:::

---

## Từ pull request đến nút Merge

![PR chạy job unit-tests, upload báo cáo, đi qua cổng branch protection](/slides/img/s17-ci-gate.svg)

::: details Ghi chú cho mentor
- JUnit XML là file có cấu trúc: số test pass và fail, thời gian từng test.
- `if: always()` giúp báo cáo vẫn được upload khi test đỏ.
:::

---

## Demo 1: từ đỏ sang xanh

```text
$ npm test
✖ GET /ready returns 200 when database answers
  AssertionError: Expected values to be strictly equal:
  actual: 503
  expected: 200
ℹ pass 4   ℹ fail 1
```

Sửa lại `assert` cho đúng rồi chạy lại: kết quả đúng khi có `fail 0`.

::: details Ghi chú cho mentor
- Cố ý sửa một `assert` rồi chạy lại, sau đó đọc `AssertionError` (actual và expected).
- Câu hỏi: dòng nào cho biết test hỏng ở đâu?
- Câu hỏi: test `/health` có cần PostgreSQL không, và vì sao?
:::

---

## Demo 2: nút Merge bị khóa

![Merge bị khóa khi CI đỏ, mở khi CI xanh](/slides/img/s17-merge-locked.svg)

::: details Ghi chú cho mentor
- Mở Settings, Branches của repository demo, cho xem rule đang bật.
- Mở một PR có check đỏ rồi một PR có check xanh để so sánh.
:::

---

## Lab L1: bốn phần trong 60 phút

| Phần | Mốc xong |
| --- | --- |
| 1. Chạy test | `pass 1` |
| 2. Unit test | `pass 5` |
| 3. Workflow | Run xanh |
| 4. Branch rule | PR đỏ bị khóa |

Lệnh và code đầy đủ: [Buổi 17 – Automated Testing](../../labs/week-09/session-17.md).

::: details Ghi chú cho mentor
- Phần 1 chạy test có sẵn. Phần 2 viết 4 unit test với mock; phần 3 gồm workflow và upload report, mốc xong là run xanh trên Actions.
- Phần 4: PR đỏ bị khóa nút Merge.
:::

---

## Khái niệm: Service container

![Container postgres chạy cùng job test](/slides/img/s17-k-service-container.svg)

- **Service container** là container phụ mà GitHub Actions khởi động cùng job, dùng để cung cấp dịch vụ như database cho test.
- Ví dụ trong dự án: `services.postgres` dùng image `postgres:17-alpine` cho integration test (phần tùy chọn).

::: details Ghi chú cho mentor
- Cấu hình `--health-cmd` làm runner chờ dịch vụ sẵn sàng rồi mới chạy các step của job.
:::

---

## Tùy chọn: service container cho integration test

![Job gọi Postgres qua localhost; host postgres bị ENOTFOUND](/slides/img/s17-service-container.svg)

::: details Ghi chú cho mentor
- Khai báo `services.postgres` với image `postgres:17-alpine`; `--health-cmd` làm runner chờ Postgres sẵn sàng.
- Job chạy trực tiếp trên runner nên host là `localhost` và cổng đã map trong `ports`.
- Tên `postgres` chỉ phân giải được khi job chạy trong `container:`.
:::

---

## Debug A: test pass khi chạy riêng, fail khi chạy chung

```text
$ npm test -- --test-name-pattern="list"   → pass
$ npm test                                 → fail
  expected 1 row, got 2 rows
```

Nguyên nhân gốc: các test dùng chung database mà không đưa database về trạng thái đã biết.

::: details Ghi chú cho mentor
- Cách tạo lỗi: bỏ `TRUNCATE` khỏi `beforeEach`, thêm một test chèn dữ liệu.
- Điều tra: so sánh kết quả chạy riêng và chạy chung, xem dữ liệu thật trong database.
- Cách sửa: mỗi test tự dựng dữ liệu của mình, không dựa vào thứ tự chạy.
:::

---

## Debug B: không kết nối được service container

```text
Error: getaddrinfo ENOTFOUND postgres
```

`ENOTFOUND` là lỗi phân giải tên, không phải sai mật khẩu hay hết thời gian chờ. Khi job chạy trực tiếp trên runner, đặt `DB_HOST: localhost`.

::: details Ghi chú cho mentor
- Cách tạo lỗi: đổi `DB_HOST: localhost` thành `DB_HOST: postgres`.
- Triệu chứng: job đỏ trong khi container Postgres vẫn khởi động bình thường.
:::

---

## Tổng kết

![Ba điều cần nhớ: unit nhanh, CI chạy mỗi PR, phải chặn merge](/slides/img/s17-recap.svg)

Buổi tiếp theo: [Buổi 18 – Docker CI Pipeline](session-18.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Node.js test runner](https://nodejs.org/docs/latest-v22.x/api/test.html): cách viết và chạy unit test bằng Node.
- **Tài liệu chính thức:** [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions): tra cứu từng khóa trong file workflow.
- **Tài liệu chính thức:** [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule): chặn merge khi CI đỏ.
- **Best practice:** [DORA: Continuous integration](https://dora.dev/capabilities/continuous-integration/): thói quen CI tốt của các đội mạnh.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): giữ workflow CI an toàn.
