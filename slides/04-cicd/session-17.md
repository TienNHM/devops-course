# Slide buổi 17 – Automated Testing

> **Tóm tắt:** Viết unit test (mock pool) bằng node:test, chạy trong GitHub Actions và dùng branch protection để chặn merge khi CI đỏ. Integration test với Postgres là phần tùy chọn.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: viết test, chạy tự động, khóa merge](/slides/img/s17-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Hỏi: ai từng merge xong mới biết code hỏng?
:::

---

## Slide 2: Merge xong mới biết lỗi

![Bạn A sửa SQL, merge, cả nhóm gặp lỗi 500](/slides/img/s17-no-gate.svg)

::: details Ghi chú cho mentor
- Kể câu chuyện: bạn A đổi câu SQL trong `/api/members`, chạy thử máy mình thấy ổn rồi merge.
- Tối đó cả nhóm `docker compose up` thì API trả 500, không ai biết thay đổi nào gây lỗi.
:::

---

## Slide 3: Unit test và integration test

![So sánh unit test dùng mock và integration test dùng DB thật](/slides/img/s17-unit-vs-integration.svg)

::: details Ghi chú cho mentor
- Nhiều unit test nhanh làm nền, vài integration test cho đường đi quan trọng.
- Ví von: unit test như thử từng bóng đèn, integration test như bật cả hệ thống điện.
:::

---

## Slide 4: Mock: diễn viên đóng thế cho database

![Mock thay pool.query thật bằng bản giả trả rows có sẵn](/slides/img/s17-mock.svg)

::: details Ghi chú cho mentor
- `t.mock.method` gắn với test context nên tự khôi phục khi test kết thúc.
- Hạn chế: nếu mock luôn trả dữ liệu đúng thì SQL sai vẫn không bị phát hiện.
:::

---

## Slide 5: node:test có sẵn trong Node 22

```js
import { test } from "node:test";
import assert from "node:assert/strict";

test("GET /ready returns 200", async (t) => {
  t.mock.method(pool, "query", async () => ({ rows: [{ "?column?": 1 }] }));
  const res = await fetch(`${baseUrl}/ready`);
  assert.equal(res.status, 200);
});
```

Không cần cài Jest hay Mocha. Chạy bằng `node --test`.

---

## Slide 6: Chạy test: mốc xanh đầu tiên

```text
$ npm test -- --test-reporter=spec
✔ GET /health returns ok
✔ GET /ready returns 200 when database answers
✔ GET /ready returns 503 when database fails
✔ GET /api/members returns rows from the pool
✔ GET /api/members returns 500 when query fails
ℹ tests 5   ℹ pass 5   ℹ fail 0
```

Đúng khi: 5 dấu `✔`, `fail 0`, lệnh tự thoát.

---

## Slide 7: Từ pull request đến nút Merge

![PR chạy job unit-tests, upload báo cáo, đi qua cổng branch protection](/slides/img/s17-ci-gate.svg)

::: details Ghi chú cho mentor
- JUnit XML là file có cấu trúc: số test pass và fail, thời gian từng test.
- `if: always()` để báo cáo vẫn được upload khi test đỏ.
:::

---

## Slide 8: Demo 1: đỏ rồi xanh

```text
$ npm test
✖ GET /ready returns 200 when database answers
  AssertionError: Expected values to be strictly equal:
  actual: 503
  expected: 200
ℹ pass 4   ℹ fail 1
```

Sửa lại `assert` cho đúng, chạy lại: `fail 0`.

::: details Ghi chú cho mentor
- Cố ý sửa một `assert` rồi chạy lại, đọc `AssertionError` (actual và expected).
- Hỏi: dòng nào cho biết test hỏng ở đâu?
- Câu hỏi: test `/health` có cần PostgreSQL không? Vì sao?
:::

---

## Slide 9: Demo 2: nút Merge bị khóa

![Merge bị khóa khi CI đỏ, mở khi CI xanh](/slides/img/s17-merge-locked.svg)

::: details Ghi chú cho mentor
- Mở Settings, Branches của repo demo, cho xem rule đang bật.
- Mở một PR có check đỏ rồi một PR xanh để so sánh.
:::

---

## Slide 10: Lab L1: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Chạy test có sẵn | `pass 1` |
| 2 | Viết 4 unit test với mock | `pass 5` |
| 3 | Workflow + upload report | Run xanh trên Actions |
| 4 | Branch protection | PR đỏ bị khóa Merge |

Lệnh và code đầy đủ: [Buổi 17 – Automated Testing](../../labs/week-09/session-17.md).

---

## Slide 11: Tùy chọn: service container cho integration test

![Job gọi Postgres qua localhost; host postgres bị ENOTFOUND](/slides/img/s17-service-container.svg)

::: details Ghi chú cho mentor
- Khai báo `services.postgres` với image `postgres:17-alpine`; `--health-cmd` làm runner chờ Postgres sẵn sàng.
- Job chạy trực tiếp trên runner nên host là `localhost` và cổng đã map trong `ports`.
- Tên `postgres` chỉ phân giải được khi job chạy trong `container:`.
:::

---

## Slide 12: Debug A: test pass riêng, fail chung

```text
$ npm test -- --test-name-pattern="list"   → pass
$ npm test                                 → fail
  expected 1 row, got 2 rows
```

Nguyên nhân gốc: các test dùng chung DB mà không đưa DB về trạng thái đã biết.

::: details Ghi chú cho mentor
- Cách phá: bỏ `TRUNCATE` khỏi `beforeEach`, thêm một test chèn dữ liệu.
- Điều tra: so sánh chạy riêng và chạy chung, xem dữ liệu thật trong DB.
- Cách sửa: mỗi test tự dựng dữ liệu của mình, không dựa vào thứ tự chạy.
:::

---

## Slide 13: Debug B: không kết nối được service container

```text
Error: getaddrinfo ENOTFOUND postgres
```

`ENOTFOUND` là lỗi phân giải tên, không phải sai mật khẩu hay timeout. Job chạy trên runner thì dùng `DB_HOST: localhost`.

::: details Ghi chú cho mentor
- Cách phá: đổi `DB_HOST: localhost` thành `DB_HOST: postgres`.
- Triệu chứng: job đỏ trong khi container Postgres vẫn khởi động bình thường.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: unit nhanh, CI chạy mỗi PR, phải chặn merge](/slides/img/s17-recap.svg)

Buổi tiếp theo: [Buổi 18 – Docker CI Pipeline](session-18.md).

---

## Slide 15: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Node.js test runner](https://nodejs.org/docs/latest-v22.x/api/test.html): cách viết và chạy unit test bằng Node.
- **Tài liệu chính thức:** [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions): tra cứu từng khóa trong file workflow.
- **Tài liệu chính thức:** [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule): chặn merge khi CI đỏ.
- **Best practice:** [DORA: Continuous integration](https://dora.dev/capabilities/continuous-integration/): thói quen CI tốt của các đội mạnh.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): giữ workflow CI an toàn.
