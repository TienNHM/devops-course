# Ngày 9 – GitHub Actions CI cho Club API

Lộ trình Cơ bản · Ngày 9/10 · khoảng 2 giờ

[Slide Ngày 9](../../slides/04-cicd/session-16.md) · [Thử thách thêm](session-16-challenge.md)

> **Tóm tắt:** Viết workflow GitHub Actions tự chạy `npm ci`, `npm test` và build image backend trên mỗi pull request của repo `devops-labs`; bạn thấy check xanh, rồi cố tình làm test đỏ để thấy check đỏ.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** file `.github/workflows/club-ci.yml` chạy xanh trên một pull request, một lần chạy đỏ có chủ đích, và `notes/day-09.md`.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 8 – Docker Compose cho Club](../week-07/session-13.md): `club/` nằm trong `~/devops-labs` và đã merge vào `main`.
- [ ] Repo `devops-labs` để **public**, `git push` được từ WSL (xem [Tài khoản GitHub và repo](../../resources/setup-github.md)).
- [ ] Node.js 22 và Docker Desktop đang chạy trong WSL.
:::

## CI/CD là gì (10 phút)

Cả nhóm CLB cùng sửa Club API. Có bạn push code mà quên chạy test, tối đó cả nhóm kéo code về thì `npm test` đỏ. Cách "nhớ chạy test" không bền vì phụ thuộc trí nhớ từng người.

- **CI (Continuous Integration):** mỗi lần có thay đổi, một máy sạch tự test và build. Không ai phải nhớ.
- **CD (Continuous Delivery/Deployment):** thay đổi đã qua CI thì tự được đóng gói và đưa đi. Ngày 10 bạn làm phần đóng gói.

```text
code  ->  Pull Request  ->  [ test -> build ]  ->  xanh: được merge
                                  |
                                  +-> đỏ: dừng, báo lỗi ngay trên PR
```

Hôm nay bạn làm khung `[ test -> build ]`. GitHub gọi đó là một **workflow**: file YAML trong `.github/workflows/`, gồm **job** (chạy trên một máy ảo sạch gọi là **runner**) và **step** (từng lệnh trong job).

## Bài toán thật

Club API đã có test ở `club/backend/tests/`, nhưng chỉ chạy khi có người nhớ gõ `npm test`. Bạn sẽ để GitHub làm việc đó trên mỗi pull request: chạy test, build image, rồi hiện dấu xanh hoặc đỏ. Máy runner luôn trống, nên nó cũng lộ ra lỗi "chạy được trên máy tôi" như quên commit file.

## Làm

Mọi lệnh chạy trong WSL, thư mục `~/devops-labs` (không dùng `/mnt/c`).

### Bước 1: Kiểm tra test chạy được ở máy bạn

Nếu test đỏ ở local thì CI chắc chắn đỏ, nên chứng minh local xanh trước.

```bash
cd ~/devops-labs
git checkout main
git pull
cd club/backend
npm ci
npm test
cd ~/devops-labs
```

Kết quả mong đợi: `npm test` báo `# pass 1` và `# fail 0`.

::: tip Kiểm tra: bạn đúng khi
`npm test` in `# fail 0` và `ls club/backend` có `package-lock.json`.
:::

### Bước 2: Tạo nhánh và viết workflow

Làm việc trên nhánh riêng như Ngày 3. Workflow luôn nằm ở gốc repo, không nằm trong `club/`.

```bash
git checkout -b day-09-ci
mkdir -p .github/workflows
```

Tạo file `.github/workflows/club-ci.yml`:

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

  build-image:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Build image club-api
        run: docker build -t club-api:ci club/backend
```

Đọc nhanh: `on` là lúc workflow chạy. `checkout` kéo code về runner (runner trống nên phải làm bước này). `working-directory` vì `package.json` nằm ở `club/backend`, không ở gốc repo. `needs: test` nghĩa là chỉ build image khi test xanh. `permissions: contents: read` chỉ cho CI đọc code, đủ dùng.

Nếu nhánh chính của bạn tên `master`, đổi `[main]` thành `[master]`.

::: tip Kiểm tra: bạn đúng khi
File nằm ở `.github/workflows/club-ci.yml` (gốc repo), thụt lề bằng 2 dấu cách, không có tab.
:::

### Bước 3: Đẩy lên và mở Pull Request

```bash
git add .github/workflows/club-ci.yml
git commit -m "ci: run tests and build image on pull request"
git push -u origin day-09-ci
```

Trên GitHub bấm **Compare & pull request**, tạo PR vào `main`. Kéo xuống phần checks của PR, hoặc mở tab **Actions**, chọn run của workflow **Club CI**.

Kết quả mong đợi: hai job `test` và `build-image` có dấu tích xanh. Mở job `test`, bung step `Chạy test`: log có `# pass 1` và `# fail 0`.

::: tip Kiểm tra: bạn đúng khi
PR hiện "All checks have passed" và `build-image` chạy sau `test`.
:::

### Bước 4: Làm test đỏ để thấy CI chặn lỗi

CI chỉ có giá trị khi nó báo đỏ đúng lúc. Sửa test cho sai: mở `club/backend/tests/health.test.js`, đổi `"healthy"` thành `"unhealthy"` trong dòng `assert.deepEqual`. Kiểm tra nó đỏ ở local, rồi push:

```bash
cd club/backend && npm test; cd ~/devops-labs
git add club/backend/tests/health.test.js
git commit -m "test: break health test on purpose"
git push
```

Quay lại PR, đợi workflow chạy lại. Kết quả mong đợi: job `test` có dấu X đỏ, job `build-image` bị bỏ qua (skipped) vì `needs: test`. Mở step `Chạy test` để đọc `AssertionError` với `actual` và `expected`.

::: tip Kiểm tra: bạn đúng khi
PR hiện check đỏ, nút merge cảnh báo, và bạn chỉ ra được dòng log nói test nào hỏng.
:::

### Bước 5: Sửa lại cho xanh rồi merge

Hoàn tác thay đổi (đổi lại thành `"healthy"`), commit, push:

```bash
git add club/backend/tests/health.test.js
git commit -m "test: restore health test"
git push
```

Đợi run mới xanh, rồi bấm **Merge pull request** trên GitHub. Cập nhật máy bạn:

```bash
git checkout main
git pull
```

::: tip Kiểm tra: bạn đúng khi
PR có đủ ba commit, check cuối cùng xanh, và `git log --oneline -n 5` trên `main` có commit workflow.
:::

### Bước 6: Ghi note và commit

Tạo `notes/day-09.md` (thư mục `notes/` nằm ở gốc `devops-labs`). Ghi: link tới run xanh, link tới run đỏ, và 2-3 câu trả lời "vì sao `build-image` bị skipped ở run đỏ?".

```bash
git checkout -b day-09-notes
git add notes/day-09.md
git commit -m "docs: add day 09 note"
git push -u origin day-09-notes
```

Mở PR và merge như thường.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Tab Actions không có workflow Club CI | File không nằm ở `.github/workflows/`, hoặc đuôi sai | Kiểm tra đường dẫn ở gốc repo, đuôi `.yml` |
| Lỗi cú pháp YAML ngay khi mở run | Thụt lề sai hoặc dùng tab | Dùng 2 dấu cách, sửa đúng cấp |
| `npm ci` báo không tìm thấy `package.json` hoặc `package-lock.json` | Thiếu `working-directory: club/backend`, hoặc lock file chưa commit | Thêm `working-directory`, chạy `git ls-files club/backend` để kiểm tra lock file |
| Step setup-node đỏ, báo không tìm thấy lock file | `cache-dependency-path` sai | Đặt đúng `club/backend/package-lock.json` |
| Test pass ở máy bạn nhưng đỏ trên CI | Quên commit file, hoặc khác phiên bản Node | Đọc dòng lỗi đầu tiên, chạy `git status`, giữ `node-version: 22` |
| `docker build` đỏ: không thấy Dockerfile | Context sai | Kiểm tra `club/backend/Dockerfile` có tồn tại và đã commit |

Mẹo đọc log: tìm step có dấu X đầu tiên, rồi đọc từ dòng lỗi đầu tiên của step đó.

## Nộp bài

- [ ] `.github/workflows/club-ci.yml` đã merge vào `main` của `devops-labs`.
- [ ] `notes/day-09.md` có link run xanh, link run đỏ và câu trả lời về job bị skipped.
- [ ] PR của bạn có lịch sử xanh, đỏ, rồi xanh lại.
- [ ] Không có token, mật khẩu hay file `.env` trong commit.

## Tự kiểm tra

1. Vì sao runner cần `actions/checkout`?
2. Vì sao dùng `npm ci` thay cho `npm install` trong CI?
3. `needs: test` làm gì khi test đỏ?

::: details Đáp án gợi ý
1. Runner là máy trống, chưa có code. `checkout` kéo code của commit đang chạy về.
2. `npm ci` cài đúng theo `package-lock.json` và báo lỗi nếu lock file lệch, nên kết quả lặp lại được.
3. Job `build-image` bị bỏ qua, nên không có image nào được build từ code đang hỏng.
:::

## Tiếp theo

[Ngày 10 – Publish image lên GHCR](../week-09/session-18.md): khi merge vào `main`, CI tự đẩy image lên registry.

::: details Tài liệu tham khảo
- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understanding-github-actions)
- [npm Docs: npm ci](https://docs.npmjs.com/cli/commands/npm-ci)
- [Node.js: Test runner](https://nodejs.org/api/test.html)
:::
