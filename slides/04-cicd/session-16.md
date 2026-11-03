# Slide Ngày 09 – GitHub Actions CI cho Club API

> **Tóm tắt:** Viết workflow GitHub Actions tự chạy `npm ci`, `npm test` và build image backend trên mỗi pull request; thấy check xanh, rồi cố tình làm test đỏ.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: viết workflow, đọc log, chạy nhanh hơn](/slides/img/s16-goals.svg)

::: details Ghi chú cho mentor
- Mục tiêu hôm nay: một file `club-ci.yml` chạy test và build image trên mỗi PR.
- Nhấn mạnh: xanh rồi đỏ rồi xanh lại, học viên phải thấy cả hai màu.
:::

---

## Slide 2: Nhớ chạy test phụ thuộc trí nhớ

![Thứ sáu push quên test, tối cả nhóm gặp test đỏ, GitHub Actions tự chạy test](/slides/img/s16-forgot-test.svg)

::: details Ghi chú cho mentor
- Kể: thứ sáu một bạn push code sửa `/health` nhưng quên chạy test; tối đó cả nhóm kéo code về, `npm test` đỏ.
- "Nhớ chạy test trước khi push" phụ thuộc trí nhớ từng người. GitHub tự chạy test trên máy sạch.
:::

---

## Slide 3: CI/CD là gì (10 phút)

![So sánh làm tay trên laptop với pipeline tự động trên runner sạch](/slides/img/s15-manual-vs-auto.svg)

- **CI:** mỗi thay đổi tự được test và build trên máy sạch.
- **CD:** thay đổi đã qua CI tự được đóng gói và đưa đi. Ngày 10 làm phần đóng gói.

::: details Ghi chú cho mentor
- Chỉ dùng đúng một hình, không đi sâu Delivery và Deployment (học ở Lộ trình Nâng cao).
- Hỏi: bước nào trong quy trình hôm nay bạn vẫn đang làm bằng tay?
:::

---

## Slide 4: Một file YAML, năm khái niệm

![File ci.yml với chú thích workflow, event, job, runner, step](/slides/img/s16-anatomy.svg)

::: details Ghi chú cho mentor
- Workflow: file YAML trong `.github/workflows/`. Event: khóa `on`. Job: nhóm step trên một runner. Step: lệnh `run` hoặc action `uses`. Runner: máy ảo mới cho mỗi job.
- YAML thụt lề bằng dấu cách, không dùng tab; sai một cấp là workflow lỗi.
:::

---

## Slide 5: Từ pull request đến check xanh

![Developer push, GitHub kích hoạt Actions, runner chạy bốn step, ra check xanh hoặc đỏ](/slides/img/s16-flow.svg)

::: details Ghi chú cho mentor
- Runner là máy trống nên step đầu là `actions/checkout@v4`.
- `npm ci` cài đúng theo lock file, báo lỗi nếu lệch; dùng trong CI thay `npm install`.
:::

---

## Slide 6: Step đỏ thì job fail

![Checkout và setup xanh, npm test đỏ, bước sau bị bỏ qua](/slides/img/s16-step-fail.svg)

::: details Ghi chú cho mentor
- Step trả exit code khác 0 thì job fail, các step sau và job có `needs` bị bỏ qua.
- Hỏi: khi đọc log, bạn tìm step nào trước? (step đỏ đầu tiên)
:::

---

## Slide 7: Workflow của Club CI

```yaml
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm test
        working-directory: club/backend
  build-image:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t club-api:ci club/backend
```

`working-directory` vì `package.json` nằm ở `club/backend`. `needs: test`: test đỏ thì không build.

::: details Ghi chú cho mentor
- Bản đầy đủ (cache, tên step) nằm ở lab; slide chỉ giữ phần lõi.
- Hỏi: bỏ `working-directory` thì lỗi gì? (không thấy `package.json`)
:::

---

## Slide 8: Demo: xanh rồi đỏ

```text
Club CI / test         ✓  (npm test: pass 1, fail 0)
Club CI / build-image  ✓

# sửa "healthy" thành "unhealthy", push lại:
Club CI / test         ✗  AssertionError: actual healthy, expected unhealthy
Club CI / build-image  -  skipped
```

Đọc log từ dòng lỗi đầu tiên của step đỏ.

::: details Ghi chú cho mentor
- Làm trực tiếp trên PR demo, cho cả lớp thấy dấu X và job bị skipped.
- Hỏi: dòng nào cho biết test nào hỏng? Sau đó sửa lại cho xanh.
:::

---

## Slide 9: Lab: các bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Chạy `npm test` ở local | `# fail 0` |
| 2, 3 | Viết `club-ci.yml`, mở PR | PR xanh, hai job |
| 4 | Sửa test cho sai, push | Check đỏ, `build-image` skipped |
| 5, 6 | Sửa lại, merge, ghi `notes/day-09.md` | Link run xanh và đỏ trong note |

Lệnh và YAML đầy đủ: [Ngày 9 – GitHub Actions CI cho Club API](../../labs/week-08/session-16.md).

---

## Slide 10: Lỗi thường gặp: sai working-directory

```text
npm error code ENOENT
npm error Could not read package.json
```

Tìm step đỏ đầu tiên, đọc dòng lỗi đầu tiên: lệnh chạy ở gốc repo, `package.json` nằm ở `club/backend`.

| Triệu chứng | Cách xử lý |
| --- | --- |
| Lỗi cú pháp YAML ngay khi mở run | Kiểm tra thụt lề, không dùng tab |
| Không thấy workflow trong tab Actions | File phải ở `.github/workflows/` ở gốc repo |
| Pass local, fail trên CI | Chạy `git status`, xem có file chưa commit |

::: details Ghi chú cho mentor
- Nguyên nhân gốc: runner chỉ có thứ đã commit và thứ workflow khai báo.
- Điều tra: `git ls-files club/backend`, tái hiện trên bản clone sạch.
:::

---

## Slide 11: Recap

![Ba điều cần nhớ: cấu trúc workflow, runner là máy mới, cách đọc workflow đỏ](/slides/img/s16-recap.svg)

Ngày tiếp theo: [Ngày 10 – Publish image lên GHCR](session-18.md).

---

## Slide 12: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax): tra cứu cú pháp file YAML workflow.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets): lưu và dùng secret đúng cách.
- **Best practice:** [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): hướng dẫn bảo mật workflow từ GitHub.
- **Best practice:** [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): checklist bảo mật pipeline từ OWASP.
- **Tài liệu chính thức:** [Dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching): làm workflow chạy nhanh hơn.
