# Slide buổi 16 – GitHub Actions Basics

> **Tóm tắt:** Viết workflow GitHub Actions chạy npm ci và npm test mỗi lần push hoặc mở pull request, rồi bật cache, tách job và chẩn đoán workflow bị đỏ.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: viết workflow, đọc log, chạy nhanh hơn](/slides/img/s16-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: giải thích workflow, event, job, step, runner, action lồng nhau thế nào; viết `.github/workflows/ci.yml`.
- Đọc log từng step, tìm step làm job thất bại; bật cache và tách job song song.
- Chẩn đoán workflow fail do sai `working-directory` hoặc thiếu `package-lock.json`.
:::

---

## Slide 2: Nhớ chạy test phụ thuộc trí nhớ

![Thứ sáu push quên test, tối cả nhóm gặp test đỏ, GitHub Actions tự chạy test](/slides/img/s16-forgot-test.svg)

::: details Ghi chú cho mentor
- Kể: thứ sáu một bạn push code sửa `/health` nhưng quên chạy test; tối đó cả nhóm kéo code về, `npm test` đỏ.
- "Nhớ chạy test trước khi push" phụ thuộc trí nhớ từng người. GitHub tự chạy test trên máy sạch.
:::

---

## Slide 3: Một file YAML, năm khái niệm

![File ci.yml với chú thích workflow, event, job, runner, step](/slides/img/s16-anatomy.svg)

::: details Ghi chú cho mentor
- Workflow: file YAML trong `.github/workflows/`. Event: khóa `on`. Job: nhóm step trên một runner. Step: lệnh `run` hoặc action `uses`. Runner: máy ảo mới cho mỗi job.
- Ví dụ: `ci.yml`, `push`, `pull_request`, job `test`, `npm ci`, `ubuntu-latest`.
:::

---

## Slide 4: YAML: sai một cấp là lỗi

![So sánh YAML thụt lề đúng và sai, cùng ba cú pháp map, list, run nhiều dòng](/slides/img/s16-yaml-rules.svg)

::: details Ghi chú cho mentor
- Thụt lề bằng dấu cách, không dùng tab. Sai một cấp là workflow lỗi hoặc chạy sai.
- Map: `khóa: giá trị`. List: mỗi phần tử bắt đầu bằng `- `. `run: |` cho nhiều lệnh shell.
:::

---

## Slide 5: Bốn event hay dùng

| Event | Khi nào chạy | Dùng cho |
| --- | --- | --- |
| `push` | Có commit đẩy lên | CI trên nhánh chính |
| `pull_request` | Mở hoặc cập nhật PR | Kiểm tra trước merge |
| `workflow_dispatch` | Bấm chạy thủ công | Chạy lại, thử nghiệm |
| `schedule` | Theo lịch cron | Kiểm tra định kỳ |

---

## Slide 6: Runner, action, quyền tối thiểu

| Thứ cần nhớ | Ví dụ | Lý do |
| --- | --- | --- |
| Runner có nhãn cụ thể | `ubuntu-24.04` | `latest` đổi khi GitHub nâng |
| Action pin theo major | `actions/checkout@v4` | Chỉ dùng nhà phát hành đáng tin |
| Quyền tối thiểu | `contents: read` | CI chỉ đọc code |

::: details Ghi chú cho mentor
- Runner phổ biến: `ubuntu-latest`, `ubuntu-24.04`, `windows-latest`.
- Action là đơn vị tái sử dụng. Pin ít nhất theo major version.
:::

---

## Slide 7: Từ push đến check xanh

![Developer push, GitHub kích hoạt Actions, runner chạy bốn step, ra check xanh hoặc đỏ](/slides/img/s16-flow.svg)

::: details Ghi chú cho mentor
- GitHub đối chiếu event với khóa `on` của mọi file trong `.github/workflows/`. Mỗi job được cấp một runner mới, sạch.
- Step đầu thường là `actions/checkout@v4` vì runner không có source.
- `npm ci` cài đúng theo lock file, báo lỗi nếu thiếu hoặc lệch; dùng trong CI thay `npm install`.
:::

---

## Slide 8: Step đỏ thì job fail

![Checkout và setup xanh, npm test đỏ, bước sau bị bỏ qua](/slides/img/s16-step-fail.svg)

::: details Ghi chú cho mentor
- Step trả exit code khác 0 thì job fail, các step sau bị bỏ qua.
- Hỏi: khi đọc log, bạn tìm step nào trước? (step đỏ đầu tiên)
:::

---

## Slide 9: Demo 1: workflow tối thiểu

```yaml
name: Hello
on: workflow_dispatch
jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello from $GITHUB_REPOSITORY on $RUNNER_OS"
```

Log in tên repo và `Linux`. Nút Run workflow chỉ hiện khi file nằm trên nhánh mặc định.

---

## Slide 10: Demo 1b: runner trống cho đến khi checkout

![So sánh ls khi không có checkout và khi có actions/checkout](/slides/img/s16-checkout-empty.svg)

::: details Ghi chú cho mentor
- Thêm `ls` sau echo: thư mục trống vì chưa có checkout. Thêm `actions/checkout@v4`: `ls` thấy file.
- Đó là khác biệt giữa `uses` và `run`.
:::

---

## Slide 11: Lab: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Workflow `hello` với `workflow_dispatch` | `OS: Linux` |
| 2 (L1) | `ci.yml`: checkout, Node 22, `npm ci`, `npm test` | Run xanh, `# fail 0` |
| 3 | Bật cache với `cache-dependency-path` | Lần 2 khôi phục cache |
| 4 | Job `validate` chạy song song | Hai job xanh |

Lệnh và YAML đầy đủ: [Buổi 16 – GitHub Actions Basics](../../labs/week-08/session-16.md).

::: details Ghi chú cho mentor
- Chuẩn bị: copy backend vào `lab-16/source`, chạy `npm test` local trước để biết trạng thái đúng.
- Hết giờ thì ưu tiên hoàn thành L1 (đến hết Phần 2).
:::

---

## Slide 12: Cache tăng tốc, không đổi kết quả

![Lần một lưu cache, lần hai khôi phục cache từ hash của lock file](/slides/img/s16-cache.svg)

::: details Ghi chú cho mentor
- Cache key tính từ hash của lock file; đổi dependency thì cache làm mới.
- Với dự án nhỏ, chênh lệch có thể chỉ vài giây; điều quan trọng là thấy dòng khôi phục cache.
- Cache chỉ tăng tốc; mất cache thì kết quả vẫn đúng.
:::

---

## Slide 13: Matrix: nhiều phiên bản Node song song

![Job test với matrix node 22 và 24, fail-fast false giữ biến thể còn lại chạy](/slides/img/s16-matrix.svg)

::: details Ghi chú cho mentor
- Matrix tạo `test (22)` và `test (24)` chạy song song.
- `fail-fast: false` để một biến thể fail không hủy biến thể khác.
:::

---

## Slide 14: Debug: sai working-directory

```text
npm error code ENOENT
npm error Could not read package.json
```

Tìm step đỏ đầu tiên, đọc dòng lỗi đầu tiên: lệnh chạy ở gốc repo, `package.json` nằm ở `lab-16/source`.

::: details Ghi chú cho mentor
- Cách phá (Tình huống 06): sai `working-directory`, hoặc ignore `package-lock.json`.
- Điều tra: tìm step đỏ đầu tiên, đọc dòng lỗi đầu tiên, `git ls-files`, tái hiện trên bản clone sạch.
- Nguyên nhân gốc: runner chỉ có thứ đã commit và thứ workflow khai báo.
- Hỏi: dòng nào trong log cho biết nguyên nhân? Sau đó sửa lại cho xanh.
:::

---

## Slide 15: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| Lỗi cú pháp YAML ngay khi mở run | Kiểm tra thụt lề, không dùng tab |
| Cache không bao giờ khôi phục | Chỉ đúng `cache-dependency-path` |
| Test pass local, fail trên CI | Clone sạch, cố định `node-version` |

---

## Slide 16: Recap

![Ba điều cần nhớ: cấu trúc workflow, runner là máy mới, cách đọc workflow đỏ](/slides/img/s16-recap.svg)

Buổi tiếp theo: [Buổi 17 – Automated Testing](session-17.md).
