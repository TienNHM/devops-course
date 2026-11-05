# Slide Ngày 09 – GitHub Actions CI cho Club API

> **Tóm tắt:** Viết workflow GitHub Actions tự chạy `npm ci`, `npm test` và build image backend trên mỗi pull request; thấy check xanh, rồi cố tình làm test đỏ.

## Slide 1: Hôm nay bạn làm ra gì

**Sản phẩm cuối ngày:** file `.github/workflows/club-ci.yml` chạy xanh trên một pull request, và một lần chạy đỏ có chủ đích.

Cần có:

- Đã xong Ngày 8: `club/` nằm trong `~/devops-labs`, đã merge vào `main`.
- Repo `devops-labs` để **public**, `git push` được từ WSL.
- Node.js 22 và Docker Desktop đang chạy trong WSL.

Thời gian: 15 phút giới thiệu, 85 phút làm, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Mục tiêu hôm nay: một file `club-ci.yml` chạy test và build image trên mỗi PR.
- Nhấn mạnh: xanh rồi đỏ rồi xanh lại, học viên phải thấy cả hai màu.
- Mọi lệnh chạy trong WSL, thư mục `~/devops-labs` (không dùng `/mnt/c`).
:::

---

## Slide 2: Bài toán thật: nhớ chạy test phụ thuộc trí nhớ

![Thứ sáu push quên test, tối cả nhóm gặp test đỏ, GitHub Actions tự chạy test](/slides/img/s16-forgot-test.svg)

::: details Ghi chú cho mentor
- Kể: thứ sáu một bạn push code sửa `/health` nhưng quên chạy test; tối đó cả nhóm kéo code về, `npm test` đỏ.
- Club API đã có test ở `club/backend/tests/`, nhưng chỉ chạy khi có người nhớ gõ `npm test`.
- GitHub tự chạy test trên máy sạch, nên cũng lộ ra lỗi "chạy được trên máy tôi" như quên commit file.
:::

---

## Slide 3: CI/CD là gì (10 phút)

![So sánh làm tay trên laptop với pipeline tự động trên runner sạch](/slides/img/s15-manual-vs-auto.svg)

- **CI:** mỗi thay đổi tự được test và build trên máy sạch.
- **CD:** thay đổi đã qua CI tự được đóng gói và đưa đi. Ngày 10 làm phần đóng gói.

::: details Ghi chú cho mentor
- Chỉ dùng đúng một hình, không đi sâu Delivery và Deployment (học ở Lộ trình Nâng cao).
- Hôm nay làm khung `[ test -> build ]`: PR xanh thì được merge, đỏ thì dừng và báo ngay trên PR.
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

## Slide 5: Bước 1 (10 phút): Test phải xanh ở máy bạn

Test đỏ ở local thì CI chắc chắn đỏ. Chứng minh local xanh trước.

```bash
cd ~/devops-labs
git checkout main
git pull
cd club/backend
npm ci
npm test
cd ~/devops-labs
```

**Kiểm tra: bạn đúng khi** `npm test` in `# pass 1` và `# fail 0`.

::: details Ghi chú cho mentor
- Nếu thiếu `package-lock.json` trong `club/backend` thì CI sẽ đỏ ở `npm ci`; kiểm tra bằng `ls club/backend`.
- Ai chưa merge `club/` vào `main` thì quay lại hoàn thành Ngày 8 trước.
:::

---

## Slide 6: Bước 2 (30 phút): Tạo nhánh và thư mục workflow

Làm việc trên nhánh riêng như Ngày 3. Workflow nằm ở gốc repo, không nằm trong `club/`.

```bash
git checkout -b day-09-ci
mkdir -p .github/workflows
```

Tạo file `.github/workflows/club-ci.yml` và dán code của 3 slide tiếp theo, nối tiếp nhau.

**Kiểm tra: bạn đúng khi** `git branch` có dấu `*` ở `day-09-ci`.

::: details Ghi chú cho mentor
- Nếu nhánh chính của học viên tên `master`, đổi `[main]` thành `[master]` ở slide sau.
- Gợi ý mở file bằng `code .github/workflows/club-ci.yml` trong VS Code (WSL).
:::

---

## Slide 7: Bước 2: club-ci.yml (phần 1/3)

```yaml
name: Club CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
```

`checkout` kéo code về runner. Runner là máy trống nên phải có bước này.

::: details Ghi chú cho mentor
- `on` là lúc workflow chạy: mở PR hoặc push vào `main`.
- `permissions: contents: read` chỉ cho CI đọc code, đủ dùng.
:::

---

## Slide 8: Bước 2: club-ci.yml (phần 2/3)

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: club/backend/package-lock.json

      - name: Cài dependency
        working-directory: club/backend
        run: npm ci

      - name: Chạy test
        working-directory: club/backend
        run: npm test
```

`working-directory` vì `package.json` nằm ở `club/backend`, không ở gốc repo.

::: details Ghi chú cho mentor
- `npm ci` cài đúng theo `package-lock.json`, báo lỗi nếu lock file lệch; dùng trong CI thay `npm install`.
- Dòng `cache` giúp lần chạy sau tải dependency nhanh hơn.
- Dán tiếp ngay dưới `checkout`, giữ đúng thụt lề 6 dấu cách.
:::

---

## Slide 9: Bước 2: club-ci.yml (phần 3/3)

```yaml
  build-image:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Build image club-api
        run: docker build -t club-api:ci club/backend
```

`needs: test`: test đỏ thì không build image.

**Kiểm tra: bạn đúng khi** file ở `.github/workflows/club-ci.yml`, thụt lề 2 dấu cách, không có tab.

::: details Ghi chú cho mentor
- `build-image` thụt lề cùng cấp với `test` (2 dấu cách).
- Hỏi: bỏ `working-directory` thì lỗi gì? (không thấy `package.json`)
:::

---

## Slide 10: Bước 3 (15 phút): Đẩy lên và mở Pull Request

```bash
git add .github/workflows/club-ci.yml
git commit -m "ci: run tests and build image on pull request"
git push -u origin day-09-ci
```

Trên GitHub bấm **Compare & pull request**, tạo PR vào `main`.

**Kiểm tra: bạn đúng khi** PR xuất hiện và phần checks bắt đầu chạy.

::: details Ghi chú cho mentor
- Nếu không có nút Compare & pull request: tab Pull requests, New pull request, chọn `day-09-ci`.
:::

---

## Slide 11: Bước 3: Đọc kết quả check xanh

![Developer push, GitHub kích hoạt Actions, runner chạy bốn step, ra check xanh hoặc đỏ](/slides/img/s16-flow.svg)

Mở tab **Actions**, chọn run **Club CI**, mở job `test`, bung step `Chạy test`: log có `# pass 1` và `# fail 0`.

**Kiểm tra: bạn đúng khi** PR hiện "All checks have passed" và `build-image` chạy sau `test`.

::: details Ghi chú cho mentor
- Cho cả lớp xem hai job nối nhau: `test` xanh rồi mới tới `build-image`.
- Chờ khoảng 1-2 phút; nếu chưa thấy gì thì kiểm tra tab Actions có bị tắt không.
:::

---

## Slide 12: Bước 4 (20 phút): Làm test đỏ để thấy CI chặn lỗi

CI chỉ có giá trị khi nó báo đỏ đúng lúc. Mở `club/backend/tests/health.test.js`.

Trong dòng `assert.deepEqual`, đổi `"healthy"` thành `"unhealthy"`. Lưu file.

**Kiểm tra: bạn đúng khi** file đã sửa nhưng chưa commit (`git status` hiện `modified`).

::: details Ghi chú cho mentor
- Cố ý làm hỏng một test: học viên cần quen với việc đọc log đỏ chứ không sợ nó.
:::

---

## Slide 13: Bước 4: Kiểm tra đỏ ở local rồi push

```bash
cd club/backend && npm test; cd ~/devops-labs
git add club/backend/tests/health.test.js
git commit -m "test: break health test on purpose"
git push
```

Đợi workflow chạy lại trên PR. Job `test` có dấu X đỏ, `build-image` bị bỏ qua (skipped).

**Kiểm tra: bạn đúng khi** `npm test` in `# fail 1` ở local và PR hiện check đỏ.

::: details Ghi chú cho mentor
- Nếu `npm test` thoát lỗi thì `; cd ~/devops-labs` vẫn chạy, nên lệnh `git add` luôn đúng thư mục.
- Chờ run mới trong tab Actions hoặc trên PR.
:::

---

## Slide 14: Bước 4: Step đỏ thì job fail

![Checkout và setup xanh, npm test đỏ, bước sau bị bỏ qua](/slides/img/s16-step-fail.svg)

Mở step `Chạy test`, đọc `AssertionError` với `actual` và `expected`.

**Kiểm tra: bạn đúng khi** bạn chỉ ra được dòng log nói test nào hỏng.

::: details Ghi chú cho mentor
- Step trả exit code khác 0 thì job fail, các step sau và job có `needs` bị bỏ qua.
- Hỏi: khi đọc log, bạn tìm step nào trước? (step đỏ đầu tiên, rồi dòng lỗi đầu tiên của nó)
:::

---

## Slide 15: Bước 5 (10 phút): Sửa lại cho xanh rồi merge

Đổi lại thành `"healthy"` trong `health.test.js`, rồi:

```bash
git add club/backend/tests/health.test.js
git commit -m "test: restore health test"
git push
```

Đợi run mới xanh, bấm **Merge pull request** trên GitHub. Rồi cập nhật máy bạn:

```bash
git checkout main
git pull
```

**Kiểm tra: bạn đúng khi** PR có ba commit, check cuối xanh, và `git log --oneline -n 5` trên `main` có commit workflow.

::: details Ghi chú cho mentor
- Học viên đã thấy đủ chu kỳ xanh, đỏ, xanh trên cùng một PR.
- Đây là mốc xong của Ngày 9; phần còn lại là lỗi thường gặp và tự kiểm tra.
:::

---

## Slide 16: Lỗi thường gặp 1: sai working-directory

```text
npm error code ENOENT
npm error Could not read package.json
```

Lệnh chạy ở gốc repo, nhưng `package.json` nằm ở `club/backend`. Thêm `working-directory: club/backend` vào step.

::: details Ghi chú cho mentor
- Cách đọc log: tìm step có dấu X đầu tiên, rồi đọc từ dòng lỗi đầu tiên của step đó.
- Nếu `npm ci` báo thiếu lock file: chạy `git ls-files club/backend` để xem `package-lock.json` đã commit chưa.
- Nếu step setup-node báo không tìm thấy lock file: `cache-dependency-path` sai, phải là `club/backend/package-lock.json`.
:::

---

## Slide 17: Lỗi thường gặp 2: workflow không chạy hoặc YAML lỗi

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Tab Actions không có Club CI | File sai chỗ hoặc sai đuôi | Đặt ở `.github/workflows/`, đuôi `.yml` |
| Lỗi cú pháp YAML khi mở run | Thụt lề sai hoặc dùng tab | Dùng 2 dấu cách, sửa đúng cấp |

::: details Ghi chú cho mentor
- Workflow phải nằm ở gốc repo, không nằm trong `club/`.
- Nếu nhánh chính tên `master` mà workflow ghi `[main]` thì push vào `master` không kích hoạt.
:::

---

## Slide 18: Lỗi thường gặp 3: pass ở local, đỏ trên CI

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Test pass ở máy bạn, đỏ trên CI | Quên commit file, hoặc khác phiên bản Node | Chạy `git status`; giữ `node-version: 22` |
| `docker build` đỏ: không thấy Dockerfile | Context sai | Kiểm tra `club/backend/Dockerfile` đã commit |

::: details Ghi chú cho mentor
- Nguyên gốc: runner chỉ có thứ đã commit và thứ workflow khai báo.
- Điều tra: `git ls-files club/backend`, tái hiện trên bản clone sạch.
:::

---

## Slide 19: Tự kiểm tra

1. Vì sao runner cần `actions/checkout`?
2. Vì sao dùng `npm ci` thay cho `npm install` trong CI?
3. `needs: test` làm gì khi test đỏ?

::: details Ghi chú cho mentor
- 1: Runner là máy trống, chưa có code. `checkout` kéo code của commit đang chạy về.
- 2: `npm ci` cài đúng theo `package-lock.json` và báo lỗi nếu lock file lệch, nên kết quả lặp lại được.
- 3: Job `build-image` bị bỏ qua, nên không có image nào được build từ code đang hỏng.
:::

---

## Slide 20: Tiếp theo

Ngày 10 mở rộng pipeline: khi merge vào `main`, CI tự đẩy image lên registry. Xem [Ngày 10 – Publish Club API lên GHCR](session-18.md).

---

## Slide 21: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax): tra cứu cú pháp file YAML workflow.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets): lưu và dùng secret đúng cách.
- **Best practice:** [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): hướng dẫn bảo mật workflow từ GitHub.
- **Best practice:** [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): checklist bảo mật pipeline từ OWASP.
- **Tài liệu chính thức:** [Dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching): làm workflow chạy nhanh hơn.
