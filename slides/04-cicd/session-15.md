# Slide buổi 15 – CI/CD Fundamentals

> **Tóm tắt:** Buổi học phân biệt Continuous Integration, Continuous Delivery và Continuous Deployment, trình bày các thành phần của pipeline, sau đó thiết kế và chạy thử pipeline Test, Build, Publish, Deploy cho Club API bằng một shell script.

## Slide 1: Mục tiêu của buổi học

![Ba mục tiêu: phân biệt CI/CD, thiết kế pipeline, chặn lỗi](/slides/img/s15-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Chi tiết mục tiêu: phân biệt CI, Delivery, Deployment bằng ví dụ Club API; giải thích trigger, runner, job, step, artifact, gate.
- Vẽ pipeline Test, Build, Publish, Deploy với input, output, điều kiện dừng; chạy pipeline giả lập; chẩn đoán pipeline "xanh nhưng vẫn deploy lỗi".
- Câu hỏi mở đầu: ai đã từng gặp tình huống "máy tôi chạy được"?
:::

---

## Slide 2: Bài toán: "máy tôi chạy được" nhưng API trả 500

![Thành viên A sửa API, thành viên B build trên laptop, sáng hôm sau API lỗi 500](/slides/img/s15-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Thành viên A sửa `/api/members`, chạy thử trên máy rồi push. Thành viên B build image trên laptop, gắn `latest`, gửi mentor deploy.
- Bản build của B không chứa thay đổi của A. Không ai biết image đang chạy được build từ commit nào.
:::

---

## Slide 3: Thay thao tác thủ công bằng quy trình tự động

![So sánh làm tay trên laptop với pipeline tự động trên runner sạch](/slides/img/s15-manual-vs-auto.svg)

::: details Ghi chú cho mentor
- Nguyên nhân chung: kiểm tra, build, deploy phụ thuộc vào con người và máy cá nhân.
- CI/CD chạy trên môi trường sạch, mỗi lần chạy để lại log và artifact.
- Buổi này thiết kế pipeline trước khi viết code; workflow thật được viết ở buổi 16.
:::

---

## Slide 4: Khái niệm: Continuous Integration, Delivery và Deployment

- **Continuous Integration (CI, tích hợp liên tục)** là thực hành tích hợp thay đổi vào nhánh chung thường xuyên, mỗi lần tích hợp được build và test tự động.
- **Continuous Delivery** giữ cho mọi bản đã qua CI luôn sẵn sàng phát hành, nhưng một người quyết định bấm nút đưa lên production. **Continuous Deployment** bỏ bước duyệt tay đó.
- Ví dụ trong dự án: một câu lạc bộ nhỏ như Club API nên bắt đầu với Continuous Delivery.

::: details Ghi chú cho mentor
- Ba khái niệm khác nhau ở đúng một điểm: có cổng duyệt bằng tay trước production hay không.
- Ví dụ so sánh: Delivery là xe đã sẵn sàng chờ người bấm khởi động; Deployment là xe tự chạy.
:::

---

## Slide 5: CI, Delivery, Deployment: ai thực hiện bước cuối?

![Ba hàng pipeline cho thấy CI dừng ở build, Delivery có bước duyệt, Deployment tự động](/slides/img/s15-ci-cd-cd.svg)

::: details Ghi chú cho mentor
- Khác biệt nằm ở đúng một chỗ: có cổng duyệt bằng tay trước production hay không.
- Câu lạc bộ nhỏ nên bắt đầu với Delivery.
:::

---

## Slide 6: Khái niệm: Pipeline

- **Pipeline** là chuỗi các stage (giai đoạn) chạy theo thứ tự, đưa một thay đổi mã nguồn từ commit đến bản phát hành.
- Mỗi stage có input, output và điều kiện dừng; khi một stage thất bại, các stage sau không chạy.
- Ví dụ trong dự án: pipeline của Club API gồm Test, Build, Publish và Deploy.

---

## Slide 7: Khái niệm: Artifact

- **Artifact** là thành phẩm do một stage tạo ra và được giữ lại để các stage sau sử dụng. Với container, artifact là image.
- Lưu ý: artifact khác cache. Artifact là thành phẩm cần giữ; cache chỉ giúp tăng tốc, và mất cache thì pipeline vẫn cho kết quả đúng.
- Ví dụ trong dự án: image `club-api` do stage Build tạo ra và stage Publish đẩy lên registry.

::: details Ghi chú cho mentor
- Mỗi job chạy trên một runner riêng nên dữ liệu giữa các job đi qua artifact, cache hoặc registry.
:::

---

## Slide 8: Khái niệm: Gate

- **Gate** (cổng kiểm soát) là điều kiện mà pipeline phải thỏa mãn trước khi chuyển sang stage tiếp theo, ví dụ test pass hoặc có người duyệt.
- Gate ngăn một thay đổi chưa đạt yêu cầu đi tiếp, nhờ đó lỗi được phát hiện ở stage sớm và rẻ nhất.
- Ví dụ trong dự án: test pass là điều kiện để build; approval là điều kiện để deploy lên production.

---

## Slide 9: Pipeline gồm năm thành phần

![Trigger, runner chứa job và step, artifact, gate](/slides/img/s15-components.svg)

| Thành phần | Ví dụ Club API |
| --- | --- |
| Trigger | push, PR, tag `v1.0.0` |
| Runner, Job, Step | `ubuntu-latest`, `npm ci`, `npm test` |
| Artifact, Gate | image `club-api`, test pass |

Trigger (event), runner, job và step đã được giới thiệu ở lộ trình Basic, buổi GitHub Actions CI.

---

## Slide 10: Năm nguyên tắc thiết kế

![Fail fast, build once, tag theo SHA, secret ngoài code, pipeline là code](/slides/img/s15-principles.svg)

::: details Ghi chú cho mentor
- Fail fast: stage rẻ (test) đứng trước stage đắt (build image).
- Build once, deploy many: một image đi qua mọi môi trường, nên thứ chạy ở production chính là thứ đã được test.
- Artifact khác cache: artifact là thành phẩm cần giữ, cache chỉ để tăng tốc và mất đi thì pipeline vẫn đúng.
:::

---

## Slide 11: Pipeline mục tiêu của Club API

![Trigger, Test, Build, Publish, Deploy dev, Approval, Production, với nhánh dừng khi test fail](/slides/img/s15-pipeline.svg)

::: details Ghi chú cho mentor
- Test pass thì mới build; test fail thì dừng và báo lỗi. Khi tự vẽ, ghi tên artifact lên từng mũi tên.
- Approval bị từ chối cũng làm pipeline dừng. Đây là điểm Delivery khác Deployment.
:::

---

## Slide 12: Mỗi job chạy trên một runner riêng

![Hai runner không chung ổ đĩa, dữ liệu đi qua artifact hoặc registry](/slides/img/s15-runners.svg)

::: details Ghi chú cho mentor
- Các runner không chia sẻ file hệ thống. Dữ liệu giữa các job đi qua artifact, cache hoặc registry.
- Câu hỏi: nếu job build cần mã đã biên dịch từ job test thì truyền bằng cách nào?
:::

---

## Slide 13: Demo 1: quan sát một pipeline thật

- Mở tab Actions của repository giáo trình, chọn một run của workflow `CI`.
- Sự kiện kích hoạt workflow: push lên `main` hoặc `master`, và mọi pull request.
- Hai job `test` và `validate-compose` chạy song song vì chúng độc lập với nhau.

::: details Ghi chú cho mentor
- Mở thêm workflow `Publish images`: artifact là image `club-api` và `club-web` trên GHCR.
- Câu hỏi cho lớp: sự kiện nào làm workflow chạy?
:::

---

## Slide 14: Demo 2: test pass trên máy local đã đủ chưa?

```text
$ cd backend && npm ci && npm test
# pass 1
# fail 0
```

Còn thiếu: chưa chắc cùng phiên bản Node, chưa build image, chưa có review, chưa có bản ghi lịch sử.

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: kết quả này đã đủ để deploy chưa?
- Đáp án gợi ý: cần runner sạch, build image, review, và log ghi lại ai chạy gì vào lúc nào.
:::

---

## Slide 15: Lab: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Vẽ pipeline 4 stage + nhánh dừng | `pipeline.png` |
| 2 | Đặc tả stage trong `pipeline-spec.md` | Không ô trống |
| 3 | Chạy `run-pipeline.sh` | `PIPELINE OK` |
| 4 | Làm test đỏ | Không có stage build |

Lệnh đầy đủ: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md).

---

## Slide 16: Chạy xanh: log mong đợi

```text
=== STAGE: test ===
# pass 1
# fail 0
=== STAGE: build ===
=== STAGE: verify-artifact ===
=== STAGE: publish (mô phỏng) ===
PIPELINE OK: club-api:2026...
```

Kiểm tra: kết quả đúng khi có `# fail 0`, có tag cụ thể (không chỉ `latest`) và dòng cuối là `PIPELINE OK`.

::: details Ghi chú cho mentor
- `set -euo pipefail` làm script dừng ngay khi một lệnh trả mã khác 0, tương tự cách runner dừng pipeline.
- `npm ci` cài đúng theo `package-lock.json`, nên kết quả tái lập được.
:::

---

## Slide 17: Chạy đỏ: pipeline phải dừng trước build

```text
=== STAGE: test ===
# fail 1
$ echo "exit code: ${PIPESTATUS[0]}"
exit code: 1
```

Log không có dòng `=== STAGE: build ===`. Mã thoát được lấy bằng `PIPESTATUS[0]`, không dùng `$?` sau `tee`.

::: details Ghi chú cho mentor
- Cách tạo lỗi: đổi `"healthy"` thành `"unhealthy"` trong `assert.deepEqual` của `tests/health.test.js`; sao lưu file trước khi sửa.
- Sau khi chứng minh, hoàn tác và chạy `npm test` để thấy `# fail 0` trở lại.
:::

---

## Slide 18: Debug: pipeline xanh nhưng bản deploy lỗi

![Mã thoát bị nuốt bởi || true nên gate mở dù test đỏ](/slides/img/s15-swallowed-exit.svg)

::: details Ghi chú cho mentor
- Triệu chứng: script in `PIPELINE OK` dù log có `# fail` lớn hơn 0.
- Điều tra: đọc log từ trên xuống, tìm `|| true` hoặc `set +e`, chạy riêng `npm test` rồi xem mã thoát, kiểm tra thứ tự stage.
- Nguyên nhân gốc: mã thoát bị nuốt nên gate không phân biệt được pass và fail. Một gate bị vô hiệu hóa nguy hiểm hơn việc không có gate, vì nó tạo ra cảm giác an toàn giả.
:::

---

## Slide 19: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| Một job gộp mọi thứ | Tách test, build, publish, deploy |
| Không biết image từ commit nào | Tag theo SHA hoặc phiên bản |
| Stage sau không thấy file stage trước | Truyền qua artifact hoặc registry |

::: details Ghi chú cho mentor
- Thử thách L2: 3 môi trường dev, staging, production; production chỉ nhận image đã chạy ổn ở staging.
- Gợi ý: tag bất biến, smoke test sau deploy, gate approval.
:::

---

## Slide 20: Tổng kết

![Ba điều cần nhớ: cổng duyệt, pipeline có gate, đừng tắt gate](/slides/img/s15-recap.svg)

Buổi tiếp theo: [Buổi 16 – GitHub Actions Basics](session-16.md).

---

## Slide 21: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understanding-github-actions): khái niệm cơ bản về workflow và job.
- **Tài liệu chính thức:** [npm ci](https://docs.npmjs.com/cli/commands/npm-ci): cài dependency sạch và lặp lại được trong CI.
- **Best practice:** [Continuous Integration (Martin Fowler)](https://martinfowler.com/articles/continuousIntegration.html): nguyên tắc CI kinh điển.
- **Best practice:** [Google SRE: Release Engineering](https://sre.google/sre-book/release-engineering/): cách phát hành phần mềm ổn định.
- **Best practice:** [CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): bảo mật pipeline theo OWASP.
