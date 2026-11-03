# Slide buổi 30 – Implementation

> **Tóm tắt:** Nhóm hoàn thiện CRUD API có test, giao diện web, Compose, CI trên Pull Request và publish image lên GHCR bằng PR nhỏ và review chéo, đạt mốc M2. Bài lab đầy đủ và lệnh: [Buổi 30 – Implementation](../../labs/week-15/session-30.md).

## Slide 1: Hôm nay nhóm bạn đạt mốc M2

![Ba mục tiêu: CRUD có test, Compose và CI, PR nhỏ có review](/slides/img/s30-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: `GET /api/members/:id`, `POST`, `PUT`, `DELETE` có validation và mã trạng thái đúng.
- Ít nhất 5 test chạy bằng `npm test` mà không cần PostgreSQL.
- Chạy cả stack bằng Compose, chứng minh dữ liệu còn sau recreate; CI trên Pull Request và publish GHCR.
:::

---

## Slide 2: Ôn nhanh trước khi code

```text
$ git status -sb
## main...origin/main
$ git check-ignore .env
.env
```

Mỗi nhóm xác nhận cây Git sạch và `.env` bị `.gitignore` chặn.

::: details Ghi chú cho mentor
- Ôn kế hoạch buổi 29: ai giữ vai trò nào, Issue nào ở cột Ready.
- Ôn `git switch -c`, `git push -u`, mở PR, review.
- Ôn Dockerfile multi-stage của backend và healthcheck Postgres.
:::

---

## Slide 3: Ghép vào phút cuối thì lỗi dồn thành một cục

![Backend, frontend, Compose ghép phút cuối cho ra mọi thứ đỏ](/slides/img/s30-big-bang.svg)

::: details Ghi chú cho mentor
- Mỗi người code rất lâu trên máy riêng, ghép vào phút cuối.
- API đổi tên trường mà frontend không biết; Compose thiếu biến môi trường.
- CI chưa từng chạy nên không ai biết test đang đỏ; lỗi tích hợp không gỡ nổi trong 30 phút cuối.
:::

---

## Slide 4: Lát cắt dọc: mỗi người một việc

![Bốn vai trò A B C D, mỗi vai có lệnh kiểm chứng riêng](/slides/img/s30-slices.svg)

::: details Ghi chú cho mentor
- Thứ tự: A tách tầng dữ liệu, CRUD, test; B form thêm, xóa; C Compose, volume; D CI, publish GHCR.
- Một PR một việc, diff dưới khoảng 200 dòng, mô tả "đã kiểm chứng bằng lệnh nào".
:::

---

## Slide 5: Tách tầng dữ liệu để test không cần DB

![Handler chỉ gọi repo; production dùng repo SQL, test dùng repo giả](/slides/img/s30-repo-layer.svg)

```js
export function createApp(repo = pgMembersRepo, db = pool) { /* ... */ }
```

::: details Ghi chú cho mentor
- Handler gọi thẳng `pool.query` thì test cần PostgreSQL thật.
- Handler chỉ nói chuyện với `repo`: list, get, create, update, remove.
- Đây là dependency injection đơn giản: truyền phụ thuộc qua tham số hàm.
:::

---

## Slide 6: Mã trạng thái là một phần hợp đồng API

![Thành công 200, 201, 204; lỗi 400, 404, 409](/slides/img/s30-status-codes.svg)

::: details Ghi chú cho mentor
- `GET /api/members/:id`: 200; lỗi 400 id sai, 404 không có.
- `POST`: 201; lỗi 400 dữ liệu sai, 409 trùng email. `PUT`: 200; lỗi 400, 404, 409. `DELETE`: 204 không body; lỗi 400, 404.
- `email` là UNIQUE; PostgreSQL báo trùng bằng mã `23505`, API đổi thành 409 thay vì 500.
:::

---

## Slide 7: Ba lớp kiểm tra trước khi merge

![Logic, cấu hình, đóng gói đi qua branch protection](/slides/img/s30-three-checks.svg)

::: details Ghi chú cho mentor
- Logic: `npm test`. Cấu hình: `docker compose config --quiet`. Đóng gói: `docker build` trong CI với `push: false`.
- Branch protection chặn merge khi CI đỏ.
:::

---

## Slide 8: Một request POST đi qua những đâu

![Browser, club-web, club-api, postgres và đường trả về 201](/slides/img/s30-request-flow.svg)

::: details Ghi chú cho mentor
- Luồng làm việc: thành viên nhóm tạo nhánh và PR, CI xanh cộng một approval thì vào `main`, `publish.yml` đẩy `club-api` và `club-web` lên GHCR.
- Truy vấn tham số hóa (`$1`, `$2`) an toàn trước SQL injection.
- Express 5 tự chuyển lỗi handler async vào middleware lỗi: `23505` thành 409, JSON hỏng thành 400, lỗi khác thành 500 và ghi log, không lộ chi tiết nội bộ.
:::

---

## Slide 9: Tham số hóa, không nối chuỗi SQL

```js
// SAI: nối chuỗi, dính SQL injection
pool.query(`INSERT INTO members(name) VALUES ('${name}')`);

// ĐÚNG: giá trị đi qua $1, $2
pool.query("INSERT INTO members(name, email) VALUES ($1, $2) RETURNING *", [name, email]);
```

Lỗi `23505` thành 409, không lộ chi tiết lỗi cho client.

---

## Slide 10: Demo: một route, một PR, CI chặn merge

```text
$ npm test
✖ GET /api/members/:id returns 200
  actual: 404   expected: 200
ℹ pass 4   ℹ fail 1
# thêm route, chạy lại
ℹ pass 5   ℹ fail 0
```

Mở PR, xem tab Checks; push commit làm test đỏ: nút Merge bị chặn.

::: details Ghi chú cho mentor
- Hiện trạng: starter-project chỉ có `GET`, `POST` trả 404.
- Tạo nhánh, thêm duy nhất `GET /api/members/:id` cùng một test; nhờ một học viên approve.
:::

---

## Slide 11: Lab: bốn vai trò làm song song

| Vai | Việc chính | Mốc xong |
| --- | --- | --- |
| A | `members-repo.js`, CRUD, test | `npm test` xanh |
| B | Form thêm, nút Delete | Thêm, xóa trên web |
| C | `down` rồi `up` | Dữ liệu còn |
| D | `ci.yml`, `publish.yml` | Run xanh |

Lệnh và mã gợi ý: [Buổi 30 – Implementation](../../labs/week-15/session-30.md), [Mã gợi ý và thử thách](../../labs/week-15/session-30-challenge.md).

::: details Ghi chú cho mentor
- A: `createApp(repo, db)`, `validateMember`, `parseId`, test với repo giả.
- B: dùng `textContent`, không dùng `innerHTML` để tránh XSS.
- C: chứng minh F8 bằng vòng `down` rồi `up`, chờ `/ready` trước khi đọc dữ liệu.
- D: `ci.yml` ba job (`test`, `validate-compose`, `build-images` với `push: false`) và `publish.yml` sửa context.
:::

---

## Slide 12: Review chéo rồi merge theo thứ tự

![Vòng review A, D, C, B và thứ tự merge A, B, C, D](/slides/img/s30-review-ring.svg)

::: details Ghi chú cho mentor
- Vòng review A, D, C, B, A: kéo nhánh về, chạy lệnh trong mô tả PR, để lại một nhận xét cụ thể.
- Merge theo thứ tự A, B, C, D rồi rebase.
- Dừng stack cũ trước khi thử clone sạch vì trùng cổng 3000 và 8080.
- Người chưa từng đụng vào code chạy theo README: không chạy được thì dự án chưa xong.
:::

---

## Slide 13: Phá lỗi: đổi tên trường API

![API đổi name thành full_name, test xanh nhưng bảng trống](/slides/img/s30-contract-break.svg)

::: details Ghi chú cho mentor
- Đổi tên trường API (`name` thành `full_name`): API 200, giao diện trống, test cũ vẫn xanh.
- Phòng tránh: ghi contract trong README, test khẳng định tên trường, smoke test với PostgreSQL thật.
:::

---

## Slide 14: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `POST` trả `400 Invalid JSON body` | Thêm header Content-Type |
| `POST` trả 500 khi email trùng | Đổi mã `23505` thành 409 |
| Frontend báo 502 | `docker compose ps`, restart frontend |
| Push GHCR bị `denied` | Kiểm tra `packages: write`, login |

::: details Ghi chú cho mentor
- `400 Invalid JSON body`: chạy curl trong WSL nếu PowerShell làm hỏng dấu nháy.
- Thêm cột mà DB không có: `down -v` rồi `up` (local), dùng migration nếu đã có dữ liệu.
:::

---

## Slide 15: Recap và nộp bài

![Ba điều cần nhớ: PR nhỏ, tách repo, CI là cổng chặn](/slides/img/s30-recap.svg)

Nộp `lab-30/`: output `npm test`, `docker compose ps`, curl CRUD, `report.md`, không có secret.

::: details Ghi chú cho mentor
- Thử thách L2: tag semver, chặn merge khi test đỏ, chạy thử trên kind.
- Buổi sau: kiểm thử triển khai, failure injection, checklist bảo mật.
:::
