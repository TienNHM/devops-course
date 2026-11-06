# Slide buổi 30 – Implementation

> **Tóm tắt:** Nhóm hoàn thiện CRUD API có test, giao diện web, Compose, CI trên Pull Request và publish image lên GHCR bằng các PR nhỏ kèm review chéo, qua đó đạt mốc M2. Bài lab đầy đủ và các lệnh: [Buổi 30 – Implementation](../../labs/week-15/session-30.md).

## Mục tiêu: đạt mốc M2

![Ba mục tiêu: CRUD có test, Compose và CI, PR nhỏ có review](/slides/img/s30-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu đầy đủ: `GET /api/members/:id`, `POST`, `PUT`, `DELETE` có validation và mã trạng thái đúng.
- Ít nhất 5 test chạy bằng `npm test` mà không cần PostgreSQL.
- Chạy toàn bộ stack bằng Compose, chứng minh dữ liệu còn sau recreate; CI trên Pull Request và publish lên GHCR.
:::

---

## Ôn tập trước khi viết mã

```text
$ git status -sb
## main...origin/main
$ git check-ignore .env
.env
```

Mỗi nhóm xác nhận cây Git sạch và `.env` bị `.gitignore` chặn.

::: details Ghi chú cho mentor
- Ôn kế hoạch buổi 29: vai trò của từng thành viên, Issue nào ở cột Ready.
- Ôn `git switch -c`, `git push -u`, mở PR, review.
- Ôn Dockerfile multi-stage của backend và healthcheck của Postgres.
:::

---

## Ghép nối vào phút cuối làm lỗi dồn lại

![Backend, frontend, Compose ghép phút cuối cho ra mọi thứ đỏ](/slides/img/s30-big-bang.svg)

::: details Ghi chú cho mentor
- Kịch bản thường gặp: mỗi thành viên viết mã trên máy riêng trong thời gian dài rồi ghép vào phút cuối.
- API đổi tên trường mà frontend không được thông báo; Compose thiếu biến môi trường.
- CI chưa từng chạy nên không ai biết test đang thất bại; lỗi tích hợp không thể xử lý hết trong 30 phút cuối.
:::

---

## Lát cắt dọc: mỗi thành viên một phần việc

![Bốn vai trò A B C D, mỗi vai có lệnh kiểm chứng riêng](/slides/img/s30-slices.svg)

::: details Ghi chú cho mentor
- Thứ tự: A tách tầng dữ liệu, CRUD, test; B form thêm, xóa; C Compose, volume; D CI, publish GHCR.
- Một PR một việc, diff dưới khoảng 200 dòng, mô tả nêu rõ "đã kiểm chứng bằng lệnh nào".
:::

---

## Khái niệm: Dependency injection

- **Dependency injection** là kỹ thuật truyền thành phần mà hàm cần dùng qua tham số, thay vì để hàm tự tạo.
- Ví dụ trong dự án: `createApp(repo)` nhận repo SQL khi chạy thật, repo giả khi `npm test`.

::: details Ghi chú cho mentor
- Dependency injection còn được gọi là tiêm phụ thuộc.
- Nhờ đó production có thể truyền thành phần thật, còn test truyền thành phần giả, nên test không cần cơ sở dữ liệu.
:::

---

## Tách tầng dữ liệu để test không cần DB

![Handler chỉ gọi repo; production dùng repo SQL, test dùng repo giả](/slides/img/s30-repo-layer.svg)

```js
export function createApp(repo = pgMembersRepo, db = pool) { /* ... */ }
```

::: details Ghi chú cho mentor
- Nếu handler gọi trực tiếp `pool.query` thì test cần PostgreSQL thật.
- Handler chỉ giao tiếp với `repo`: list, get, create, update, remove.
- Đây là dependency injection ở dạng đơn giản: truyền phụ thuộc qua tham số hàm.
:::

---

## Khái niệm: API contract và mã trạng thái

- **API contract** là thỏa thuận giữa backend và client về đường dẫn, tên trường và mã trạng thái HTTP của từng phản hồi.
- Ví dụ trong dự án: `POST` trả 201; dữ liệu sai 400; email trùng 409.

::: details Ghi chú cho mentor
- API contract còn được gọi là hợp đồng API.
- Khi một bên đổi contract mà bên kia không biết, giao diện hoặc client sẽ hỏng dù API vẫn trả về phản hồi thành công.
:::

---

## Mã trạng thái là một phần hợp đồng API

![Thành công 200, 201, 204; lỗi 400, 404, 409](/slides/img/s30-status-codes.svg)

::: details Ghi chú cho mentor
- `GET /api/members/:id`: 200; lỗi 400 khi id sai, 404 khi không có.
- `POST`: 201; lỗi 400 khi dữ liệu sai, 409 khi trùng email. `PUT`: 200; lỗi 400, 404, 409. `DELETE`: 204 không có body; lỗi 400, 404.
- `email` là UNIQUE; PostgreSQL báo trùng bằng mã `23505`, API chuyển thành 409 thay vì 500.
:::

---

## Khái niệm: Branch protection

- **Branch protection** là tập quy tắc của GitHub yêu cầu điều kiện, như CI thành công hoặc approval, trước khi merge vào một nhánh.
- Ví dụ trong dự án: nhánh `main` chặn nút Merge khi CI thất bại.

::: details Ghi chú cho mentor
- Branch protection còn được gọi là bảo vệ nhánh.
- Quy tắc này ngăn mã chưa được kiểm tra đi vào nhánh chính, kể cả khi người thao tác vô ý.
:::

---

## Ba lớp kiểm tra trước khi merge

![Logic, cấu hình, đóng gói đi qua branch protection](/slides/img/s30-three-checks.svg)

::: details Ghi chú cho mentor
- Logic: `npm test`. Cấu hình: `docker compose config --quiet`. Đóng gói: `docker build` trong CI với `push: false`.
- Branch protection chặn merge khi CI thất bại.
:::

---

## Một request POST đi qua những thành phần nào

![Browser, club-web, club-api, postgres và đường trả về 201](/slides/img/s30-request-flow.svg)

::: details Ghi chú cho mentor
- Luồng làm việc: thành viên nhóm tạo nhánh và PR, CI xanh cộng một approval thì PR vào `main`, `publish.yml` đẩy `club-api` và `club-web` lên GHCR.
- Truy vấn tham số hóa (`$1`, `$2`) an toàn trước SQL injection.
- Express 5 tự chuyển lỗi của handler async vào middleware lỗi: `23505` thành 409, JSON hỏng thành 400, lỗi khác thành 500 và được ghi log, không để lộ chi tiết nội bộ.
:::

---

## Khái niệm: SQL injection và truy vấn tham số hóa

- **SQL injection** là lỗ hổng do nối dữ liệu người dùng vào câu lệnh SQL; **truy vấn tham số hóa** gửi giá trị riêng biệt.
- Ví dụ trong dự án: `INSERT INTO members(name, email) VALUES ($1, $2)` nhận giá trị.

::: details Ghi chú cho mentor
- SQL injection xảy ra khi dữ liệu người dùng được nối vào câu lệnh SQL và bị hiểu như một phần của câu lệnh.
- Truy vấn tham số hóa gửi câu lệnh và giá trị riêng biệt (`$1`, `$2`), nên giá trị luôn được xử lý như dữ liệu.
- Trong ví dụ trên, mảng giá trị chứa `name` và `email`.
:::

---

## Tham số hóa, không nối chuỗi SQL

```js
// SAI: nối chuỗi, dính SQL injection
pool.query(`INSERT INTO members(name) VALUES ('${name}')`);

// ĐÚNG: giá trị đi qua $1, $2
pool.query("INSERT INTO members(name, email) VALUES ($1, $2) RETURNING *", [name, email]);
```

Lỗi `23505` được chuyển thành 409, không để lộ chi tiết lỗi cho client.

---

## Demo: một route, một PR, CI chặn merge

```text
$ npm test
✖ GET /api/members/:id returns 200
  actual: 404   expected: 200
ℹ pass 4   ℹ fail 1
# thêm route, chạy lại
ℹ pass 5   ℹ fail 0
```

Mở PR, xem tab Checks; push commit làm test thất bại thì nút Merge bị chặn.

::: details Ghi chú cho mentor
- Hiện trạng: starter-project chỉ có `GET`, `POST` trả 404.
- Tạo nhánh, chỉ thêm `GET /api/members/:id` cùng một test; nhờ một học viên approve.
:::

---

## Lab: bốn vai trò làm song song

| Vai | Việc chính |
| --- | --- |
| A | `members-repo.js`, CRUD, test |
| B | Form thêm, nút Delete |
| C | `down` rồi `up` |
| D | `ci.yml`, `publish.yml` |

Lệnh và mã gợi ý: [Buổi 30 – Implementation](../../labs/week-15/session-30.md), [Mã gợi ý và thử thách](../../labs/week-15/session-30-challenge.md).

::: details Ghi chú cho mentor
- Mốc xong: A `npm test` xanh; B thêm, xóa trên web; C dữ liệu còn; D run xanh.
- A: `createApp(repo, db)`, `validateMember`, `parseId`, test với repo giả.
- B: dùng `textContent`, không dùng `innerHTML` để tránh XSS.
- C: chứng minh F8 bằng vòng `down` rồi `up`, chờ `/ready` trước khi đọc dữ liệu.
- D: `ci.yml` ba job (`test`, `validate-compose`, `build-images` với `push: false`) và `publish.yml` sửa context.
:::

---

## Review chéo rồi merge theo thứ tự

![Vòng review A, D, C, B và thứ tự merge A, B, C, D](/slides/img/s30-review-ring.svg)

::: details Ghi chú cho mentor
- Vòng review A, D, C, B, A: lấy nhánh về, chạy lệnh trong mô tả PR, để lại một nhận xét cụ thể.
- Merge theo thứ tự A, B, C, D rồi rebase.
- Dừng stack cũ trước khi thử clone sạch vì trùng cổng 3000 và 8080.
- Một thành viên chưa từng sửa mã chạy theo README; nếu không chạy được thì dự án chưa hoàn thành.
:::

---

## Phá lỗi: đổi tên trường API

![API đổi name thành full_name, test xanh nhưng bảng trống](/slides/img/s30-contract-break.svg)

::: details Ghi chú cho mentor
- Đổi tên trường API (`name` thành `full_name`): API trả 200, giao diện trống, test cũ vẫn xanh.
- Phòng tránh: ghi contract trong README, viết test khẳng định tên trường, chạy smoke test với PostgreSQL thật.
:::

---

## Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `400 Invalid JSON body` | Thêm header Content-Type |
| 500 khi email trùng | `23505` thành 409 |
| Frontend báo 502 | `docker compose ps` |
| Push GHCR `denied` | Kiểm tra `packages: write` |

::: details Ghi chú cho mentor
- `POST` trả `400 Invalid JSON body`: thêm header Content-Type.
- `POST` trả 500 khi email trùng: đổi mã `23505` thành 409.
- Frontend báo 502: chạy `docker compose ps` rồi restart frontend.
- Push GHCR bị `denied`: kiểm tra `packages: write` và đăng nhập.
- `400 Invalid JSON body`: chạy curl trong WSL nếu PowerShell làm hỏng dấu nháy.
- Khi thêm cột mà DB chưa có: `down -v` rồi `up` (môi trường local); dùng migration nếu đã có dữ liệu.
:::

---

## Tổng kết và nộp bài

![Ba điều cần nhớ: PR nhỏ, tách repo, CI là cổng chặn](/slides/img/s30-recap.svg)

Nộp bài thư mục `lab-30/`: output `npm test`, `docker compose ps`, curl CRUD, `report.md`, không chứa secret.

::: details Ghi chú cho mentor
- Thử thách L2: tag semver, chặn merge khi test thất bại, chạy thử trên kind.
- Buổi sau: kiểm thử triển khai, failure injection, checklist bảo mật.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker build best practices](https://docs.docker.com/build/building/best-practices/): viết Dockerfile nhỏ, nhanh, an toàn.
- **Tài liệu chính thức:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): giữ pipeline CI/CD an toàn.
- **Best practice:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): quy ước viết commit message rõ ràng.
- **Best practice:** [Semantic Versioning](https://semver.org/): quy tắc đặt phiên bản cho image và release.
- **Best practice:** [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật khi dùng container.
