# Slide Ngày 09 – GitHub Actions CI cho Club API

> **Tóm tắt:** Workflow GitHub Actions tự chạy `npm ci`, `npm test` và build image backend trên mỗi pull request. Người học quan sát check xanh, sau đó cố ý làm test đỏ để thấy CI chặn lỗi.

## Mục tiêu của Ngày 9

**Sản phẩm cuối ngày:** file `.github/workflows/club-ci.yml` chạy xanh trên một pull request, và một lần chạy đỏ có chủ đích.

Điều kiện cần: đã xong Ngày 8, repository `devops-labs` để **public**, Node.js 22 và Docker Desktop chạy trong WSL.

::: details Ghi chú cho mentor
- Đã xong Ngày 8 nghĩa là `club/` nằm trong `~/devops-labs` và đã merge vào `main`.
- Repository `devops-labs` để public và `git push` được từ WSL.
- Thời gian: 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết.
- Mục tiêu: một file `club-ci.yml` chạy test và build image trên mỗi PR.
- Nhấn mạnh: kết quả xanh, đỏ, rồi xanh lại; người học phải quan sát cả hai màu.
- Mọi lệnh chạy trong WSL, thư mục `~/devops-labs` (không dùng `/mnt/c`).
:::

---

## Bài toán thật: chạy test phụ thuộc vào trí nhớ

![Thứ sáu push quên test, tối cả nhóm gặp test đỏ, GitHub Actions tự chạy test](/slides/img/s16-forgot-test.svg)

::: details Ghi chú cho mentor
- Tình huống: vào thứ sáu, một thành viên push code sửa `/health` nhưng quên chạy test; buổi tối cả nhóm kéo code về và `npm test` báo đỏ.
- Club API đã có test ở `club/backend/tests/`, nhưng test chỉ chạy khi có người nhớ gõ `npm test`.
- GitHub chạy test trên máy sạch, nên cũng làm lộ lỗi "chạy được trên máy tôi", ví dụ quên commit file.
:::

---

## Khái niệm: CI/CD

![So sánh làm tay trên laptop với pipeline tự động trên runner sạch](/slides/img/s15-manual-vs-auto.svg)

- **CI** (Continuous Integration, tích hợp liên tục) là thực hành tự động test và build mỗi thay đổi mã nguồn trên máy sạch.
- Ví dụ trong dự án: mỗi PR tự chạy `npm test` và build image.

::: details Ghi chú cho mentor
- **CD** (Continuous Delivery, phân phối liên tục) là phần tự động đóng gói và đưa thay đổi đã qua CI đi tiếp. Ngày 10 thực hiện phần đóng gói.
- Chỉ dùng đúng một hình, không đi sâu Delivery và Deployment (học ở Lộ trình Nâng cao).
- Hôm nay xây khung `[ test -> build ]`: PR xanh thì được merge, PR đỏ thì dừng và báo ngay trên PR.
- Câu hỏi thảo luận: bước nào trong quy trình hôm nay vẫn đang được thực hiện bằng tay.
:::

---

## Khái niệm: Workflow

- **Workflow** là một quy trình tự động của GitHub Actions, được mô tả trong một file YAML đặt ở `.github/workflows/`.
- Ví dụ trong dự án: file `club-ci.yml` là workflow `Club CI` của Club API.

::: details Ghi chú cho mentor
- File mô tả khi nào quy trình chạy và gồm những công việc nào, nên quy trình được lưu cùng mã nguồn và có lịch sử commit.
- YAML là định dạng dữ liệu thụt lề bằng dấu cách, không dùng tab; sai một cấp thụt lề là workflow lỗi.
- Workflow phải nằm ở gốc repository, không nằm trong `club/`.
:::

---

## Khái niệm: Event (trigger)

- **Event** là sự kiện trên repository làm một workflow bắt đầu chạy, ví dụ mở pull request hoặc push lên một nhánh.
- Ví dụ trong dự án: `Club CI` chạy khi mở pull request và khi push vào `main`.

::: details Ghi chú cho mentor
- Workflow khai báo event ở khóa `on`; nhờ đó nó chỉ chạy đúng thời điểm cần kiểm tra.
- Event còn được gọi là trigger (điều kiện kích hoạt); hai từ dùng thay thế được.
- Nếu nhánh chính tên `master` thì phải đổi `[main]` thành `[master]` ở slide sau.
:::

---

## Khái niệm: Job và step

- **Job** là một nhóm step chạy tuần tự trên cùng một runner. **Step** là một lệnh shell (`run`) hoặc một action (`uses`).
- Ví dụ trong dự án: job `test` gồm các step checkout, cài Node, `npm ci`, `npm test`.

::: details Ghi chú cho mentor
- **Action** là một đơn vị tái sử dụng do GitHub hoặc cộng đồng viết sẵn, ví dụ `actions/checkout`.
- Job `build-image` chạy sau job `test`.
- Các job chạy song song mặc định; từ khóa `needs` tạo thứ tự giữa các job.
- Một step trả exit code khác 0 thì step đó đỏ và job fail.
:::

---

## Khái niệm: Runner

- **Runner** là máy ảo do GitHub cung cấp để thực thi một job; mỗi job nhận một máy mới.
- Ví dụ trong dự án: `runs-on: ubuntu-latest` chọn runner Ubuntu cho cả hai job.

::: details Ghi chú cho mentor
- Máy này chưa có mã nguồn của dự án, vì vậy workflow phải tự lấy code và cài công cụ cần dùng.
- Runner chỉ có thứ đã được commit và thứ workflow khai báo. Đây là lý do CI phát hiện lỗi "chạy được trên máy tôi".
:::

---

## Một file YAML, năm khái niệm

![File ci.yml với chú thích workflow, event, job, runner, step](/slides/img/s16-anatomy.svg)

::: details Ghi chú cho mentor
- Workflow: file YAML trong `.github/workflows/`. Event: khóa `on`. Job: nhóm step trên một runner. Step: lệnh `run` hoặc action `uses`. Runner: máy ảo mới cho mỗi job.
- YAML thụt lề bằng dấu cách, không dùng tab; sai một cấp là workflow lỗi.
:::

---

## Bước 1 (10 phút): Test phải xanh ở máy local

Khi test đỏ ở local thì CI chắc chắn đỏ. Vì vậy cần chứng minh local xanh trước.

```bash
cd ~/devops-labs
git checkout main
git pull
cd club/backend
npm ci
npm test
cd ~/devops-labs
```

**Kiểm tra: kết quả đúng khi** `npm test` in `# pass 1` và `# fail 0`.

::: details Ghi chú cho mentor
- Nếu thiếu `package-lock.json` trong `club/backend` thì CI sẽ đỏ ở `npm ci`; kiểm tra bằng `ls club/backend`.
- Người học chưa merge `club/` vào `main` cần hoàn thành Ngày 8 trước.
:::

---

## Bước 2 (30 phút): Tạo nhánh và thư mục workflow

Làm việc trên nhánh riêng như Ngày 3. Workflow nằm ở gốc repository, không nằm trong `club/`.

```bash
git checkout -b day-09-ci
mkdir -p .github/workflows
```

Tạo file `.github/workflows/club-ci.yml` và dán code của 3 slide tiếp theo, nối tiếp nhau.

**Kiểm tra: kết quả đúng khi** `git branch` có dấu `*` ở `day-09-ci`.

::: details Ghi chú cho mentor
- Nếu nhánh chính của người học tên `master`, đổi `[main]` thành `[master]` ở slide sau.
- Gợi ý mở file bằng `code .github/workflows/club-ci.yml` trong VS Code (WSL).
:::

---

## Bước 2: club-ci.yml (phần 1/3)

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

Action `checkout` kéo code về runner. Runner là máy trống nên cần step này.

::: details Ghi chú cho mentor
- `on` xác định lúc workflow chạy: mở PR hoặc push vào `main`.
- `permissions: contents: read` chỉ cho CI quyền đọc code, đủ cho nhu cầu hiện tại.
:::

---

## Bước 2: club-ci.yml (phần 2/3)

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

`working-directory` cần thiết vì `package.json` nằm ở `club/backend`, không ở gốc repository.

::: details Ghi chú cho mentor
- `npm ci` cài đúng theo `package-lock.json` và báo lỗi nếu lock file lệch; trong CI dùng lệnh này thay cho `npm install`.
- Dòng `cache` giúp các lần chạy sau tải dependency nhanh hơn.
- Dán tiếp ngay dưới `checkout`, giữ đúng thụt lề 6 dấu cách.
:::

---

## Bước 2: club-ci.yml (phần 3/3)

```yaml
  build-image:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Build image club-api
        run: docker build -t club-api:ci club/backend
```

Khai báo `needs: test` nghĩa là khi test đỏ thì job này không chạy, nên không build image từ code lỗi.

**Kiểm tra: kết quả đúng khi** file nằm ở `.github/workflows/club-ci.yml`, thụt lề 2 dấu cách, không có tab.

::: details Ghi chú cho mentor
- `build-image` thụt lề cùng cấp với `test` (2 dấu cách).
- Câu hỏi: nếu bỏ `working-directory` thì lỗi gì xuất hiện (không tìm thấy `package.json`).
:::

---

## Khái niệm: Status check

- **Status check** là kết quả (xanh hoặc đỏ) mà một workflow báo về commit hoặc pull request sau khi chạy xong.
- Ví dụ trong dự án: PR hiện "All checks have passed" khi cả `test` và `build-image` xanh.

::: details Ghi chú cho mentor
- Kết quả hiển thị ngay trên pull request, nên người review biết thay đổi đã qua kiểm tra tự động hay chưa trước khi merge.
- Một repository có thể cấu hình bắt buộc check xanh mới được merge; nội dung này thuộc Lộ trình Nâng cao.
:::

---

## Bước 3 (15 phút): Đẩy lên và mở Pull Request

```bash
git add .github/workflows/club-ci.yml
git commit -m "ci: run tests and build image on pull request"
git push -u origin day-09-ci
```

Trên GitHub chọn **Compare & pull request**, tạo PR vào `main`.

**Kiểm tra: kết quả đúng khi** PR xuất hiện và phần checks bắt đầu chạy.

::: details Ghi chú cho mentor
- Nếu không có nút Compare & pull request: vào tab Pull requests, chọn New pull request, chọn `day-09-ci`.
:::

---

## Bước 3: Đọc kết quả check xanh

![Developer push, GitHub kích hoạt Actions, runner chạy bốn step, ra check xanh hoặc đỏ](/slides/img/s16-flow.svg)

Mở tab **Actions**, chọn run **Club CI**, mở job `test`, bung step `Chạy test`: log có `# pass 1` và `# fail 0`.

**Kiểm tra: kết quả đúng khi** PR hiện "All checks have passed" và `build-image` chạy sau `test`.

::: details Ghi chú cho mentor
- Cho cả lớp xem hai job nối nhau: `test` xanh rồi mới tới `build-image`.
- Chờ khoảng 1-2 phút; nếu chưa thấy gì thì kiểm tra tab Actions có bị tắt hay không.
:::

---

## Bước 4 (20 phút): Làm test đỏ để thấy CI chặn lỗi

CI chỉ có giá trị khi nó báo đỏ đúng lúc. Mở `club/backend/tests/health.test.js`.

Trong dòng `assert.deepEqual`, đổi `"healthy"` thành `"unhealthy"`. Lưu file.

**Kiểm tra: kết quả đúng khi** file đã sửa nhưng chưa commit (`git status` hiện `modified`).

::: details Ghi chú cho mentor
- Cố ý làm hỏng một test để người học quen với việc đọc log đỏ thay vì e ngại nó.
:::

---

## Bước 4: Kiểm tra đỏ ở local rồi push

```bash
cd club/backend && npm test; cd ~/devops-labs
git add club/backend/tests/health.test.js
git commit -m "test: break health test on purpose"
git push
```

Chờ workflow chạy lại trên PR. Job `test` có dấu X đỏ, `build-image` bị bỏ qua (skipped).

**Kiểm tra: kết quả đúng khi** `npm test` in `# fail 1` ở local và PR hiện check đỏ.

::: details Ghi chú cho mentor
- Nếu `npm test` thoát lỗi thì `; cd ~/devops-labs` vẫn chạy, nên lệnh `git add` luôn đúng thư mục.
- Chờ run mới trong tab Actions hoặc trên PR.
:::

---

## Bước 4: Step đỏ thì job fail

![Checkout và setup xanh, npm test đỏ, bước sau bị bỏ qua](/slides/img/s16-step-fail.svg)

Mở step `Chạy test`, đọc `AssertionError` với `actual` và `expected`.

**Kiểm tra: kết quả đúng khi** chỉ ra được dòng log cho biết test nào hỏng.

::: details Ghi chú cho mentor
- Step trả exit code khác 0 thì job fail; các step sau và các job có `needs` bị bỏ qua.
- Câu hỏi: khi đọc log, cần tìm step nào trước (step đỏ đầu tiên, sau đó là dòng lỗi đầu tiên của step đó).
:::

---

## Bước 5 (10 phút): Sửa lại cho xanh rồi merge

Đổi lại thành `"healthy"` trong `health.test.js`, rồi chạy:

```bash
git add club/backend/tests/health.test.js
git commit -m "test: restore health test"
git push
```

Chờ run mới xanh, chọn **Merge pull request** trên GitHub. Sau đó cập nhật máy local:

```bash
git checkout main
git pull
```

**Kiểm tra: kết quả đúng khi** PR có ba commit, check cuối xanh, và `git log --oneline -n 5` trên `main` có commit workflow.

::: details Ghi chú cho mentor
- Người học đã quan sát đủ chu kỳ xanh, đỏ, xanh trên cùng một PR.
- Đây là mốc hoàn thành của Ngày 9; phần còn lại là lỗi thường gặp và tự kiểm tra.
:::

---

## Lỗi thường gặp 1: sai working-directory

```text
npm error code ENOENT
npm error Could not read package.json
```

Lệnh chạy ở gốc repository, nhưng `package.json` nằm ở `club/backend`. Thêm `working-directory: club/backend` vào step.

::: details Ghi chú cho mentor
- Cách đọc log: tìm step có dấu X đầu tiên, sau đó đọc từ dòng lỗi đầu tiên của step đó.
- Nếu `npm ci` báo thiếu lock file: chạy `git ls-files club/backend` để xem `package-lock.json` đã được commit chưa.
- Nếu step setup-node báo không tìm thấy lock file: `cache-dependency-path` sai, giá trị đúng là `club/backend/package-lock.json`.
:::

---

## Lỗi thường gặp 2: workflow không chạy hoặc YAML lỗi

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Tab Actions thiếu Club CI | File sai chỗ hoặc đuôi | Đặt ở `.github/workflows/`, đuôi `.yml` |
| Lỗi cú pháp YAML | Thụt lề sai hoặc dùng tab | Dùng 2 dấu cách |

::: details Ghi chú cho mentor
- Workflow phải nằm ở gốc repository, không nằm trong `club/`.
- Nếu nhánh chính tên `master` mà workflow ghi `[main]` thì push vào `master` không kích hoạt workflow.
:::

---

## Lỗi thường gặp 3: pass ở local, đỏ trên CI

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Pass ở local, đỏ trên CI | Quên commit file, hoặc khác Node | Chạy `git status`; giữ `node-version: 22` |
| `docker build` không thấy Dockerfile | Context sai | Commit `club/backend/Dockerfile` |

::: details Ghi chú cho mentor
- Nguyên nhân gốc: runner chỉ có thứ đã commit và thứ workflow khai báo.
- Điều tra: `git ls-files club/backend`, tái hiện trên một bản clone sạch.
:::

---

## Tự kiểm tra

1. Vì sao runner cần `actions/checkout`?
2. Vì sao CI dùng `npm ci` thay cho `npm install`?
3. `needs: test` có tác dụng gì khi test đỏ?

::: details Ghi chú cho mentor
- 1: Runner là máy trống, chưa có code. `checkout` kéo code của commit đang chạy về.
- 2: `npm ci` cài đúng theo `package-lock.json` và báo lỗi nếu lock file lệch, nên kết quả lặp lại được.
- 3: Job `build-image` bị bỏ qua, nên không có image nào được build từ code đang hỏng.
:::

---

## Tiếp theo

Ngày 10 mở rộng pipeline: khi merge vào `main`, CI tự đẩy image lên registry. Xem [Ngày 10 – Publish Club API lên GHCR](session-18.md).

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax): tra cứu cú pháp file YAML workflow.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets): lưu và dùng secret đúng cách.
- **Best practice:** [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): hướng dẫn bảo mật workflow từ GitHub.
- **Best practice:** [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): checklist bảo mật pipeline từ OWASP.
- **Tài liệu chính thức:** [Dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching): làm workflow chạy nhanh hơn.
