# Slide buổi 19 – CD và Deployment Strategies

> **Tóm tắt:** Viết script deploy image từ GHCR lên máy local, có kiểm tra sức khỏe và tự rollback. Chỉ chạy trên máy bạn, không expose máy ra Internet.

Bài học viên: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md). Lệnh lab nằm trong bài học, không chép lại ở slide.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: chọn chiến lược, deploy theo tag, rollback](/slides/img/s19-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: phân biệt Continuous Delivery và Continuous Deployment (khóa này dừng ở "có người bấm nút").
- Giải thích Recreate, Rolling, Blue/Green, Canary và đánh đổi của từng loại.
- Viết và chạy `deploy-local.sh`: pull theo tag bất biến, chạy Compose, chờ health check; rollback về tag trước bằng một lệnh.
:::

---

## Slide 2: Deploy kiểu "cầu nguyện"

![SSH vào máy demo, build lại tại chỗ, API chết đúng lúc ban chủ nhiệm xem](/slides/img/s19-ssh-pray.svg)

::: details Ghi chú cho mentor
- SSH vào máy demo, `git pull`, `docker compose up --build`, rồi cầu nguyện.
- Bản build trên máy bạn Nam dùng Node khác phiên bản; image build lại tại chỗ không có tên cố định, không biết quay về commit nào.
:::

---

## Slide 3: Delivery và Deployment

| Thuật ngữ | Ý nghĩa | Ai quyết định |
| --- | --- | --- |
| Continuous Integration | Mỗi thay đổi được build và test | Không liên quan |
| Continuous Delivery | Mọi bản qua CI sẵn sàng deploy | Con người bấm nút |
| Continuous Deployment | Bản qua CI tự lên môi trường | Pipeline |

Khóa này dùng Continuous Delivery.

::: details Ghi chú cho mentor
- Máy học viên không expose ra Internet nên GitHub không thể "đẩy" vào máy bạn; vì vậy dùng mô hình kéo (pull).
:::

---

## Slide 4: Artifact bất biến: tag nào được deploy?

| Cách đặt tag | Ví dụ | Dùng để deploy? |
| --- | --- | --- |
| Theo commit | `sha-abc1234` | Nên dùng |
| Theo phiên bản | `v1.2.0` | Nên dùng |
| Trôi nổi | `latest`, `main` | Không |

::: details Ghi chú cho mentor
- Cùng một artifact từ staging đến production: với container, artifact là image.
- `latest` đổi nội dung theo thời gian nên không rollback chính xác được.
- Digest chắc chắn hơn tag, nhưng tag theo commit đủ cho khóa này.
:::

---

## Slide 5: Environment, secrets, approval

![Workflow chạy qua environment local, job deploy, secrets nằm ngoài repo](/slides/img/s19-environment.svg)

::: details Ghi chú cho mentor
- Environment là tên nơi deploy (ví dụ `local`); job khai báo `environment: local`. Environment có thể yêu cầu reviewer duyệt trước khi job chạy.
- Secrets lưu ở GitHub Secrets hoặc `.env` trên máy đích, không bao giờ nằm trong repo, script hay log.
- Required reviewers có sẵn cho repo public; repo private có thể cần gói trả phí, hãy kiểm tra tài liệu GitHub về environments.
- Không có approval: `workflow_dispatch` đã là thao tác chủ động, thêm quy ước review của nhóm.
:::

---

## Slide 6: Bốn chiến lược deploy

![Recreate, Rolling, Blue/Green, Canary với sơ đồ nhỏ cho từng loại](/slides/img/s19-strategies.svg)

::: details Ghi chú cho mentor
- Recreate: downtime ngắn, chi phí thấp nhất. Rolling: gần như không downtime, cần nhiều replica.
- Blue/Green: không downtime nhưng gấp đôi tài nguyên. Canary: cần metrics và router.
- Compose trên một máy là Recreate; Kubernetes Deployment mặc định là Rolling.
:::

---

## Slide 7: Rollback tốt là hành động nhàm chán

![Ba trạng thái của current-tag và previous-tag qua hai lần deploy và một lần rollback](/slides/img/s19-rollback-state.svg)

::: details Ghi chú cho mentor
- Cần: biết tag đang chạy và tag trước; image bản cũ còn trên registry (không xóa tag cũ).
- Rollback code không rollback database; làm migration kiểu thêm trước, xóa sau.
- Hỏi: rollback hai lần liên tiếp thì chuyện gì xảy ra? (hoán đổi hai bản)
:::

---

## Slide 8: Kiến trúc deploy local

![Push, CI, publish lên GHCR; deploy-local.sh pull image, compose up, health check, ghi tag hoặc rollback](/slides/img/s19-deploy-flow.svg)

---

## Slide 9: Self-hosted runner kết nối ra

![Runner trên máy bạn gọi ra GitHub qua HTTPS; không có kết nối đi vào](/slides/img/s19-runner-outbound.svg)

::: details Ghi chú cho mentor
- Chuỗi: bạn chạy workflow với tag `sha-abc1234`, GitHub giao job cho runner, runner chạy `deploy-local.sh`, báo job thành công.
- Chỉ cho repo private, chạy bằng user thường, bật khi cần deploy, tắt khi xong.
- Không đặt secret cá nhân (SSH key, token) trên máy runner.
:::

---

## Slide 10: Health check và file trạng thái

![Vòng hỏi /ready tối đa 20 lần; đạt thì ghi current-tag, fail thì in log và rollback](/slides/img/s19-health-state.svg)

::: details Ghi chú cho mentor
- Health fail: in log backend, rollback về `current` nếu có, thoát mã khác 0.
- Rollback chỉ là gán lại `TAG` bằng `previous` rồi đi qua cùng luồng deploy.
:::

---

## Slide 11: Demo: deploy tốt rồi deploy hỏng

```text
$ OWNER=ten-ban TAG=sha-abc1234 ./deploy-local.sh
[deploy] health OK
$ OWNER=ten-ban TAG=sha-bad0000 ./deploy-local.sh
[deploy] health FAIL, in log backend
[deploy] rollback ve sha-abc1234
```

Sau khoảng 60 giây báo `health FAIL`; `current-tag` vẫn là bản khỏe.

::: details Ghi chú cho mentor
- Chuẩn bị hai tag: bản khỏe và bản build được nhưng cố ý hỏng (container thoát ngay). Tag `sha-bad0000` ở trên chỉ là ví dụ minh họa.
- Xác nhận bản khỏe đã quay lại bằng `/ready`.
:::

---

## Slide 12: Lab: ba chặng

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

## Slide 13: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `unauthorized` hoặc `denied` khi pull | Package Public hoặc `docker login ghcr.io` |
| `manifest unknown` | Kiểm tra tag, owner viết thường |
| `health FAIL` sau khi đổi mật khẩu | Trả lại mật khẩu cũ, không xóa volume |
| Workflow Queued mãi | Không có runner online khớp label |

::: details Ghi chú cho mentor
- Thiếu `DB_PASSWORD`: tạo `.env` cạnh `compose.yaml`. Mật khẩu DB cố định lúc tạo volume.
- Mở cổng máy ra Internet là hiểu nhầm mô hình; dùng runner kết nối ra.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: build một lần, cổng sức khỏe, rollback dễ](/slides/img/s19-recap.svg)

Buổi sau: [Buổi 20 – Pipeline Security](session-20.md).
