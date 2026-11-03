# Slide buổi 15 – CI/CD Fundamentals

> **Tóm tắt:** Phân biệt CI, Continuous Delivery và Continuous Deployment, nắm các thành phần của pipeline, rồi thiết kế và chạy thử pipeline Test, Build, Publish, Deploy cho Club API bằng một shell script.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: phân biệt CI/CD, thiết kế pipeline, chặn lỗi](/slides/img/s15-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Chi tiết mục tiêu: phân biệt CI, Delivery, Deployment bằng ví dụ Club API; giải thích trigger, runner, job, step, artifact, gate.
- Vẽ pipeline Test, Build, Publish, Deploy với input, output, điều kiện dừng; chạy pipeline giả lập; chẩn đoán pipeline "xanh nhưng vẫn deploy lỗi".
- Hỏi: ai từng nghe "máy tôi chạy được"?
:::

---

## Slide 2: "Máy tôi chạy được" rồi API trả 500

![Bạn A sửa API, bạn B build trên laptop, sáng hôm sau API lỗi 500](/slides/img/s15-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Bạn A sửa `/api/members`, chạy thử trên máy rồi push. Bạn B build image trên laptop, gắn `latest`, gửi mentor deploy.
- Bản build của B không chứa thay đổi của A. Không ai biết image đang chạy được build từ commit nào.
:::

---

## Slide 3: Làm tay thay bằng quy trình tự động

![So sánh làm tay trên laptop với pipeline tự động trên runner sạch](/slides/img/s15-manual-vs-auto.svg)

::: details Ghi chú cho mentor
- Nguyên nhân chung: kiểm tra, build, deploy phụ thuộc con người và máy cá nhân.
- CI/CD chạy trên môi trường sạch, mỗi lần để lại log và artifact.
- Hôm nay: nghĩ và thiết kế pipeline trước khi viết code (buổi 16 mới viết workflow thật).
:::

---

## Slide 4: CI, Delivery, Deployment: ai bấm nút cuối?

![Ba hàng pipeline cho thấy CI dừng ở build, Delivery có bước duyệt, Deployment tự động](/slides/img/s15-ci-cd-cd.svg)

::: details Ghi chú cho mentor
- Khác nhau ở đúng một chỗ: có cổng duyệt bằng tay trước production hay không.
- Ví von: Delivery là xe sẵn sàng trước cửa chờ bạn bấm khởi động; Deployment là xe tự chạy.
- CLB nhỏ nên bắt đầu với Delivery.
:::

---

## Slide 5: Pipeline có năm thành phần

![Trigger, runner chứa job và step, artifact, gate](/slides/img/s15-components.svg)

| Thành phần | Ví dụ Club API |
| --- | --- |
| Trigger | push, PR, tag `v1.0.0` |
| Runner, Job, Step | `ubuntu-latest`, `npm ci`, `npm test` |
| Artifact, Gate | image `club-api`, test pass |

---

## Slide 6: Năm nguyên tắc thiết kế

![Fail fast, build once, tag theo SHA, secret ngoài code, pipeline là code](/slides/img/s15-principles.svg)

::: details Ghi chú cho mentor
- Fail fast: stage rẻ (test) đứng trước stage đắt (build image).
- Build once, deploy many: một image đi qua mọi môi trường, thứ chạy ở production là thứ đã test.
- Artifact khác cache: artifact là thành phẩm cần giữ, cache chỉ để tăng tốc và mất đi thì pipeline vẫn đúng.
:::

---

## Slide 7: Pipeline mục tiêu của Club API

![Trigger, Test, Build, Publish, Deploy dev, Approval, Production, với nhánh dừng khi test fail](/slides/img/s15-pipeline.svg)

::: details Ghi chú cho mentor
- Test pass mới build; test fail thì dừng và báo lỗi. Ghi tên artifact lên từng mũi tên khi tự vẽ.
- Approval từ chối thì cũng dừng. Đây là điểm Delivery khác Deployment.
:::

---

## Slide 8: Mỗi job chạy trên một runner riêng

![Hai runner không chung ổ đĩa, dữ liệu đi qua artifact hoặc registry](/slides/img/s15-runners.svg)

::: details Ghi chú cho mentor
- Runner không chia sẻ file hệ thống. Dữ liệu giữa các job đi qua artifact, cache hoặc registry.
- Hỏi: job build cần mã đã biên dịch từ job test thì làm sao truyền?
:::

---

## Slide 9: Demo 1: xem một pipeline thật

- Tab Actions của repo giáo trình, run của workflow `CI`.
- Sự kiện nào kích hoạt? Push lên `main` hoặc `master`, mọi PR.
- `test` và `validate-compose` chạy song song vì độc lập.

::: details Ghi chú cho mentor
- Mở thêm workflow `Publish images`: artifact là image `club-api`, `club-web` trên GHCR.
- Hỏi lớp: sự kiện nào làm workflow chạy?
:::

---

## Slide 10: Demo 2: test pass trên máy đã đủ chưa?

```text
$ cd backend && npm ci && npm test
# pass 1
# fail 0
```

Thiếu: cùng Node chưa chắc, chưa build image, chưa ai review, không có bản ghi.

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: vậy đã đủ để deploy chưa?
- Gợi ý trả lời: cần runner sạch, build image, review, và log ai chạy gì lúc nào.
:::

---

## Slide 11: Lab: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Vẽ pipeline 4 stage + nhánh dừng | `pipeline.png` |
| 2 | Đặc tả stage trong `pipeline-spec.md` | Không ô trống |
| 3 | Chạy `run-pipeline.sh` | `PIPELINE OK` |
| 4 | Làm test đỏ | Không có stage build |

Lệnh đầy đủ: [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md).

---

## Slide 12: Chạy xanh: log mong đợi

```text
=== STAGE: test ===
# pass 1
# fail 0
=== STAGE: build ===
=== STAGE: verify-artifact ===
=== STAGE: publish (mô phỏng) ===
PIPELINE OK: club-api:2026...
```

Đúng khi: có `# fail 0`, tag cụ thể (không chỉ `latest`), dòng cuối `PIPELINE OK`.

::: details Ghi chú cho mentor
- `set -euo pipefail` làm script dừng ngay khi một lệnh trả mã khác 0, giống runner dừng pipeline.
- `npm ci` cài đúng theo `package-lock.json`, nên tái lập được.
:::

---

## Slide 13: Chạy đỏ: pipeline phải dừng trước build

```text
=== STAGE: test ===
# fail 1
$ echo "exit code: ${PIPESTATUS[0]}"
exit code: 1
```

Không có dòng `=== STAGE: build ===`. Lấy mã thoát bằng `PIPESTATUS[0]`, không dùng `$?` sau `tee`.

::: details Ghi chú cho mentor
- Cách phá: đổi `"healthy"` thành `"unhealthy"` trong `assert.deepEqual` của `tests/health.test.js`, nhớ sao lưu trước.
- Sau khi chứng minh, hoàn tác và chạy `npm test` để thấy `# fail 0` trở lại.
:::

---

## Slide 14: Debug: pipeline xanh nhưng bản deploy lỗi

![Mã thoát bị nuốt bởi || true nên gate mở dù test đỏ](/slides/img/s15-swallowed-exit.svg)

::: details Ghi chú cho mentor
- Triệu chứng: script in `PIPELINE OK` dù log có `# fail` lớn hơn 0.
- Điều tra: đọc log từ trên xuống, tìm `|| true` hoặc `set +e`, chạy riêng `npm test` rồi xem mã thoát, kiểm tra thứ tự stage.
- Gốc: mã thoát bị nuốt nên gate không phân biệt pass và fail. Gate bị vô hiệu hóa nguy hiểm hơn không có gate: tạo cảm giác an toàn giả.
:::

---

## Slide 15: Lỗi thường gặp

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

## Slide 16: Recap

![Ba điều cần nhớ: cổng duyệt, pipeline có gate, đừng tắt gate](/slides/img/s15-recap.svg)

Buổi tiếp theo: [Buổi 16 – GitHub Actions Basics](session-16.md).
