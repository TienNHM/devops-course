# Slide buổi 19 – CD và Deployment Strategies

> **Tóm tắt:** Buổi học viết script deploy image từ GHCR lên máy local, có kiểm tra sức khỏe (health check) và tự động rollback. Script chỉ chạy trên máy của người học, không expose máy ra Internet.

Bài lab: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md). Các lệnh của lab nằm trong bài lab, không chép lại ở slide.

## Slide 1: Mục tiêu của buổi học

![Ba mục tiêu: chọn chiến lược, deploy theo tag, rollback](/slides/img/s19-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: phân biệt Continuous Delivery và Continuous Deployment (khóa này dừng ở mức "có người bấm nút").
- Giải thích Recreate, Rolling, Blue/Green, Canary và đánh đổi của từng loại.
- Viết và chạy `deploy-local.sh`: pull theo tag bất biến, chạy Compose, chờ health check; rollback về tag trước bằng một lệnh.
:::

---

## Slide 2: Bài toán: deploy thủ công không có kiểm soát

![SSH vào máy demo, build lại tại chỗ, API chết đúng lúc ban chủ nhiệm xem](/slides/img/s19-ssh-pray.svg)

::: details Ghi chú cho mentor
- Quy trình thủ công: SSH vào máy demo, `git pull`, `docker compose up --build`, rồi chờ kết quả.
- Bản build trên máy của một thành viên dùng phiên bản Node khác; image build lại tại chỗ không có tên cố định, nên không biết quay về commit nào.
:::

---

## Slide 3: Continuous Delivery và Continuous Deployment

| Thuật ngữ | Ý nghĩa | Ai quyết định |
| --- | --- | --- |
| Continuous Integration | Mỗi thay đổi được build và test | Không liên quan |
| Continuous Delivery | Mọi bản qua CI sẵn sàng deploy | Con người bấm nút |
| Continuous Deployment | Bản qua CI tự lên môi trường | Pipeline |

Khóa này dùng Continuous Delivery.

::: details Ghi chú cho mentor
- Máy của người học không expose ra Internet nên GitHub không thể đẩy (push) vào máy đó; vì vậy khóa này dùng mô hình kéo (pull).
:::

---

## Slide 4: Khái niệm: Artifact bất biến

- **Artifact bất biến** là artifact không bao giờ thay đổi nội dung sau khi được tạo ra; với container, artifact là image và được nhận diện bằng tag cố định.
- Nhờ vậy cùng một artifact đi qua staging đến production, và có thể quay lại đúng bản cũ khi cần.
- Ví dụ trong dự án: tag `sha-abc1234` luôn trỏ tới một image; tag `latest` thì đổi nội dung theo thời gian.

---

## Slide 5: Tag nào được dùng để deploy?

| Cách đặt tag | Ví dụ | Dùng để deploy? |
| --- | --- | --- |
| Theo commit | `sha-abc1234` | Nên dùng |
| Theo phiên bản | `v1.2.0` | Nên dùng |
| Trôi nổi | `latest`, `main` | Không |

::: details Ghi chú cho mentor
- Cùng một artifact từ staging đến production: với container, artifact là image.
- `latest` đổi nội dung theo thời gian nên không thể rollback chính xác.
- Digest chắc chắn hơn tag, nhưng tag theo commit là đủ cho khóa này.
:::

---

## Slide 6: Khái niệm: Environment, secret và approval

- **Environment** là tên của nơi triển khai (ví dụ `local`); job khai báo `environment: local`. **Secret** là giá trị nhạy cảm như mật khẩu, được lưu ngoài repository.
- **Approval** là bước duyệt: environment có thể yêu cầu reviewer duyệt trước khi job chạy.
- Ví dụ trong dự án: job deploy dùng `environment: local`; mật khẩu database nằm trong GitHub Secrets hoặc `.env` trên máy đích.

---

## Slide 7: Environment, secret, approval trong workflow

![Workflow chạy qua environment local, job deploy, secrets nằm ngoài repo](/slides/img/s19-environment.svg)

::: details Ghi chú cho mentor
- Secret lưu ở GitHub Secrets hoặc `.env` trên máy đích, không bao giờ nằm trong repository, script hay log.
- Required reviewers có sẵn cho repository public; repository private có thể cần gói trả phí, vì vậy cần kiểm tra tài liệu GitHub về environments.
- Khi không có approval, `workflow_dispatch` đã là thao tác chủ động; nhóm bổ sung thêm quy ước review.
:::

---

## Slide 8: Khái niệm: Deployment strategy

- **Deployment strategy** (chiến lược triển khai) là cách thay bản đang chạy bằng bản mới: Recreate, Rolling, Blue/Green hoặc Canary.
- Mỗi chiến lược đánh đổi giữa thời gian gián đoạn, chi phí tài nguyên và độ phức tạp.
- Ví dụ trong dự án: Compose trên một máy tương ứng với Recreate; Kubernetes Deployment mặc định dùng Rolling.

---

## Slide 9: Bốn chiến lược deploy

![Recreate, Rolling, Blue/Green, Canary với sơ đồ nhỏ cho từng loại](/slides/img/s19-strategies.svg)

::: details Ghi chú cho mentor
- Recreate: có downtime ngắn, chi phí thấp nhất. Rolling: gần như không downtime, cần nhiều replica.
- Blue/Green: không downtime nhưng cần gấp đôi tài nguyên. Canary: cần metrics và router.
- Compose trên một máy là Recreate; Kubernetes Deployment mặc định là Rolling.
:::

---

## Slide 10: Khái niệm: Rollback

- **Rollback** là thao tác đưa hệ thống trở về phiên bản đã chạy ổn định trước đó.
- Rollback cần biết tag đang chạy và tag trước đó, và image của bản cũ phải còn trên registry. Lưu ý: rollback code không rollback database.
- Ví dụ trong dự án: `ROLLBACK=1` gán lại `TAG` bằng `previous` rồi đi qua cùng luồng deploy.

---

## Slide 11: Rollback là thao tác đơn giản và dự đoán được

![Ba trạng thái của current-tag và previous-tag qua hai lần deploy và một lần rollback](/slides/img/s19-rollback-state.svg)

::: details Ghi chú cho mentor
- Điều kiện: biết tag đang chạy và tag trước; image bản cũ còn trên registry (không xóa tag cũ).
- Rollback code không rollback database; nên làm migration theo kiểu thêm trước, xóa sau.
- Câu hỏi: rollback hai lần liên tiếp thì chuyện gì xảy ra? Đáp án: hai bản được hoán đổi.
:::

---

## Slide 12: Kiến trúc deploy local

![Push, CI, publish lên GHCR; deploy-local.sh pull image, compose up, health check, ghi tag hoặc rollback](/slides/img/s19-deploy-flow.svg)

---

## Slide 13: Khái niệm: Self-hosted runner

- **Self-hosted runner** là runner do người dùng tự cài trên máy của mình để thực thi job của GitHub Actions, thay cho runner do GitHub cung cấp.
- Runner chủ động kết nối ra GitHub qua HTTPS để nhận job, nên máy không cần mở cổng cho kết nối đi vào.
- Ví dụ trong dự án: runner trên máy của người học nhận job và chạy `deploy-local.sh`.

---

## Slide 14: Self-hosted runner kết nối ra ngoài

![Runner trên máy bạn gọi ra GitHub qua HTTPS; không có kết nối đi vào](/slides/img/s19-runner-outbound.svg)

::: details Ghi chú cho mentor
- Chuỗi hoạt động: người học chạy workflow với tag `sha-abc1234`, GitHub giao job cho runner, runner chạy `deploy-local.sh`, rồi báo job thành công.
- Chỉ dùng cho repository private, chạy bằng user thường, bật khi cần deploy và tắt khi xong.
- Không đặt secret cá nhân (SSH key, token) trên máy runner.
:::

---

## Slide 15: Khái niệm: Health check

- **Health check** (kiểm tra sức khỏe) là yêu cầu tự động gửi tới ứng dụng để xác nhận nó sẵn sàng phục vụ, ví dụ gọi endpoint `/ready`.
- Kết quả health check quyết định bản deploy được giữ lại hay bị rollback.
- Ví dụ trong dự án: script hỏi `/ready` tối đa 20 lần; đạt thì ghi `current-tag`, thất bại thì in log và rollback.

---

## Slide 16: Health check và file trạng thái

![Vòng hỏi /ready tối đa 20 lần; đạt thì ghi current-tag, fail thì in log và rollback](/slides/img/s19-health-state.svg)

::: details Ghi chú cho mentor
- Khi health fail: in log backend, rollback về `current` nếu có, thoát với mã khác 0.
- Rollback chỉ là gán lại `TAG` bằng `previous` rồi đi qua cùng luồng deploy.
:::

---

## Slide 17: Demo: deploy thành công rồi deploy thất bại

```text
$ OWNER=ten-ban TAG=sha-abc1234 ./deploy-local.sh
[deploy] health OK
$ OWNER=ten-ban TAG=sha-bad0000 ./deploy-local.sh
[deploy] health FAIL, in log backend
[deploy] rollback ve sha-abc1234
```

Sau khoảng 60 giây script báo `health FAIL`; `current-tag` vẫn là bản khỏe.

::: details Ghi chú cho mentor
- Chuẩn bị hai tag: bản khỏe và bản build được nhưng cố ý hỏng (container thoát ngay). Tag `sha-bad0000` ở trên chỉ là ví dụ minh họa.
- Xác nhận bản khỏe đã quay lại bằng `/ready`.
:::

---

## Slide 18: Lab: ba chặng

| Chặng | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | `compose.deploy.yaml` chạy image từ GHCR | `config` thấy tag đúng |
| 2 | Viết `deploy-local.sh`, deploy một tag | `health OK` |
| 3 | Deploy bản hai, rồi `ROLLBACK=1` | `compose ps` đúng tag cũ |

Lệnh chi tiết: [Buổi 19](../../labs/week-10/session-19.md) và [Thử thách L2](../../labs/week-10/session-19-challenge.md).

::: details Ghi chú cho mentor
- Tùy chọn: chặn tag không tồn tại, nối vào `workflow_dispatch` (input `tag` đi qua `env`).
:::

---

## Slide 19: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `unauthorized` hoặc `denied` khi pull | Package Public hoặc `docker login ghcr.io` |
| `manifest unknown` | Kiểm tra tag, owner viết thường |
| `health FAIL` sau khi đổi mật khẩu | Trả lại mật khẩu cũ, không xóa volume |
| Workflow Queued mãi | Không có runner online khớp label |

::: details Ghi chú cho mentor
- Thiếu `DB_PASSWORD`: tạo `.env` cạnh `compose.yaml`. Mật khẩu database được cố định tại thời điểm tạo volume.
- Mở cổng của máy ra Internet là hiểu nhầm về mô hình; dùng runner kết nối ra ngoài.
:::

---

## Slide 20: Tổng kết

![Ba điều cần nhớ: build một lần, cổng sức khỏe, rollback dễ](/slides/img/s19-recap.svg)

Buổi sau: [Buổi 20 – Pipeline Security](session-20.md).

---

## Slide 21: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Managing environments for deployment](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment): duyệt tay trước khi deploy.
- **Tài liệu chính thức:** [Deployments (rolling update)](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment): Kubernetes cập nhật dần, không gián đoạn.
- **Tài liệu chính thức:** [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry): lưu image đã build một lần.
- **Best practice:** [DORA: Continuous delivery](https://dora.dev/capabilities/continuous-delivery/): cách giao phần mềm nhỏ, thường xuyên, ít rủi ro.
- **Best practice:** [Google SRE: Canary release](https://sre.google/workbook/canarying-releases/): thử bản mới trên ít người dùng trước.
