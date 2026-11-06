# Slide buổi 32 – Final Demo & Review

> **Tóm tắt:** Mỗi nhóm demo hệ thống Club Management từ Compose, CI/CD tới Kubernetes, xử lý một sự cố có chủ đích, bảo vệ kỹ thuật, sau đó thực hiện peer review và rút ra bài học. Lệnh lab: [Buổi 32](../../labs/week-16/session-32.md).

## Mục tiêu: demo và bảo vệ kỹ thuật

![Ba mục tiêu: demo 10 phút, xử lý sự cố, bảo vệ kỹ thuật](/slides/img/s32-goals.svg)

::: details Ghi chú cho mentor
- Mỗi thành viên trình bày một đoạn; chạy demo trực tiếp Compose, GitHub Actions và Kubernetes trên kind.
- Chẩn đoán một sự cố có chủ đích ngay trên màn hình; peer review dựa trên bằng chứng, rút ra lessons learned.
:::

---

## Chạy được chưa phải là sẵn sàng bàn giao

![Nhóm bàn giao cho người nhận vận hành tiếp](/slides/img/s32-handover.svg)

::: details Ghi chú cho mentor
- Buổi này đánh giá cả cách xử lý lỗi, không chỉ kết quả cuối.
- Câu hỏi kiểm tra: nếu một thành viên vắng mặt, người khác có vận hành được hệ thống không.
:::

---

## Khái niệm: Demo script

- **Demo script** (kịch bản demo) là tài liệu ghi thứ tự trình diễn, lệnh cần chạy và kết quả mong đợi.
- Ví dụ trong dự án: kịch bản 10 phút từ kiến trúc, Compose, CI/CD tới Kubernetes.

::: details Ghi chú cho mentor
- Kịch bản cũng ghi người phụ trách từng đoạn.
- Kịch bản 10 phút còn gồm sự cố và hỏi đáp.
- Kịch bản giúp demo bám theo luồng của bài toán và giữ đúng thời gian, thay vì theo thứ tự các tệp trong repository.
:::

---

## Demo hiệu quả: chạy thật và nêu rõ điều quan sát được

![So sánh demo kém và demo tốt](/slides/img/s32-demo-compare.svg)

::: details Ghi chú cho mentor
- Cấu trúc demo tốt: đi theo luồng từ bài toán tới bài học, không theo thứ tự tệp.
- Dự phòng: trạng thái sạch, video, ảnh chụp. Khi xảy ra sự cố: nói rõ quan sát, nêu giả thuyết, kiểm chứng; không che giấu hay xóa đi làm lại.
:::

---

## Bảo vệ kỹ thuật: kết luận, lý do, bằng chứng

![Ba bước trả lời hỏi đáp kèm ví dụ Pod tự phục hồi](/slides/img/s32-answer-steps.svg)

::: details Ghi chú cho mentor
- 5 phút hỏi đáp sau demo; mentor đặt câu hỏi "vì sao" thay vì "là gì".
- Mentor chọn bất kỳ thành viên nào trả lời bất kỳ phần nào.
:::

---

## Mỗi phát biểu cần có bằng chứng

| Phát biểu | Bằng chứng |
| --- | --- |
| Dữ liệu không mất | `down` rồi `up`, `GET /api/members` |
| Pipeline chặn mã lỗi | Run thất bại |
| Pod tự phục hồi | `kubectl delete pod` |
| Secret không nằm trong Git | `git ls-files` |

::: details Ghi chú cho mentor
- Dữ liệu không mất: sau `down` rồi `up`, gọi lại `GET /api/members`.
- Pod tự phục hồi: dùng `get pods -w` để quan sát Pod mới.
- Secret không nằm trong Git: `git ls-files` không có Secret thật.
- Pipeline chặn mã lỗi: một run thất bại trong tab Actions.
- Bổ sung: image truy ngược được về commit nhờ tag SHA hoặc phiên bản trên GHCR.
:::

---

## Luồng từ commit tới người dùng

![Developer, GitHub, Actions, GHCR, kind và đường Compose](/slides/img/s32-pipeline.svg)

::: details Ghi chú cho mentor
- Compose phục vụ người dùng tại `localhost:8080`; kind phục vụ người dùng tại `club.localhost`.
- Mỗi thành viên cần giải thích được một đoạn của luồng này.
:::

---

## Kịch bản 10 phút

![Dòng thời gian: kiến trúc, Compose, CI/CD, Kubernetes, sự cố, hỏi đáp](/slides/img/s32-timeline.svg)

::: details Ghi chú cho mentor
- Thứ tự: kiến trúc, Git, Compose, CI/CD, Kubernetes, sự cố, bài học.
- Nhận xét cuối theo ba mục: điều tốt, rủi ro chính, một việc nên làm tiếp.
:::

---

## Demo: Compose rồi Kubernetes

```text
$ docker compose down && docker compose up -d
$ curl localhost:8080/api/members     # dữ liệu còn
$ kubectl scale deployment club-api --replicas=3 -n club
$ kubectl delete pod POD_BACKEND -n club
```

`down -v` làm mất dữ liệu. Pod mới do ReplicaSet tạo.

::: details Ghi chú cho mentor
- Compose: ba service `running`, `postgres` healthy.
- Kubernetes: scale lên 3 rồi về 2, xóa Pod và quan sát Pod mới.
- Sự cố sai tag image: Pod mới `ImagePullBackOff`, Pod cũ vẫn phục vụ, `rollout undo` khôi phục.
:::

---

## Lab Phần 1: preflight và phân vai

![Checklist kiểm tra máy và chuẩn bị dự phòng](/slides/img/s32-preflight.svg)

::: details Ghi chú cho mentor
- Chọn trạng thái xuất phát: (a) chưa apply manifest, triển khai ngay trên màn hình, hoặc (b) đã triển khai sẵn.
- Ghi tên người trình bày cho từng đoạn, mỗi người ít nhất một đoạn.
- Video chỉ dùng khi có sự cố mạng và phải báo mentor.
:::

---

## Lab Phần 2: sự cố do mentor chọn

![Vòng sự cố, nói to, log và events, giả thuyết kiểm chứng](/slides/img/s32-incident-loop.svg)

::: details Ghi chú cho mentor
- CI/CD trong demo: mở một run xanh, một run thất bại đã được sửa, package trên GHCR, giải thích `packages: write`.
- Mentor chọn một trong ba loại: sai tag image, sai mật khẩu DB, readiness thất bại.
:::

---

## Khái niệm: Postmortem và lessons learned

- **Postmortem** là bản ghi một sự cố sau khi xử lý xong, gồm tác động, nguyên nhân gốc và cách xử lý.
- Ví dụ trong dự án: lessons learned trong `report.md`.

::: details Ghi chú cho mentor
- Bản ghi còn nêu các việc cần làm tiếp nhằm ngăn sự cố tái diễn.
- Lessons learned trong `report.md` nêu điều tốt, điều chưa tốt và điều sẽ làm khác.
- Mục tiêu là học từ hệ thống và quy trình chứ không quy lỗi cho cá nhân, nên bản ghi tập trung vào sự kiện và bằng chứng.
:::

---

## Lab Phần 3 và 4: hỏi đáp, peer review

| Phần | Việc làm | Lưu ý |
| --- | --- | --- |
| 3 | Hỏi đáp 5 phút | Có bằng chứng |
| 4 | Peer review từng thành viên | Kèm liên kết PR |
| 4 | Lessons learned | Ghi vào `report.md` |

::: details Ghi chú cho mentor
- Phần 3: trả lời bằng bằng chứng. Phần 4: liên kết kèm theo là PR hoặc Issue.
- Câu hỏi mẫu: liveness và readiness khác nhau thế nào, `down` và `down -v` khác nhau ở đâu, Secret có thực sự bí mật không.
- Không chia sẻ nội dung peer review giữa các thành viên.
- Lessons learned: điều tốt, điều chưa tốt, điều sẽ làm khác.
:::

---

## Phá lỗi: mất dữ liệu trước demo

![down giữ volume, down -v xóa volume](/slides/img/s32-down-v.svg)

Phòng tránh: chỉ dùng `down`, có script seed, sao lưu bằng `pg_dump`.

::: details Ghi chú cho mentor
- Triệu chứng: giao diện mở bình thường, chỉ còn dữ liệu mẫu từ `init.sql`.
- Không "dọn dẹp" hệ thống sát giờ demo.
- Hướng điều tra đầy đủ: phần Phá lỗi nâng cao của [Buổi 32](../../labs/week-16/session-32.md).
:::

---

## Challenge L2: failure injection tự chọn

| Yêu cầu | Chi tiết |
| --- | --- |
| Failure injection | Có giả thuyết trước khi chạy |
| Đề xuất cải tiến | 3 mục cho hệ thống, 2 cho khóa học |
| Câu hỏi | Nút thắt đầu tiên; đổi gì khi rời kind |

::: details Ghi chú cho mentor
- Ví dụ: xóa Pod `postgres-0`, ép backend crash, làm hỏng probe.
- Đề xuất cải tiến cần có thứ tự ưu tiên.
:::

---

## Tổng kết và nộp bài

![Ba điều cần nhớ: chạy thật, có bằng chứng, cẩn thận down -v](/slides/img/s32-recap.svg)

Nộp bài thư mục `lab-32/`; peer review gửi riêng cho mentor.

::: details Ghi chú cho mentor
- Cả nhóm phải hiểu toàn bộ hệ thống.
- Khi gặp lỗi: nêu rõ điều quan sát được, đọc log và events, đưa ra giả thuyết, kiểm chứng.
- `down -v` và xóa PVC làm mất dữ liệu, chỉ dùng khi có chủ ý.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [kubectl Quick Reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/): tra lệnh nhanh khi demo.
- **Tài liệu chính thức:** [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes): viết README giúp người khác chạy được dự án.
- **Best practice:** [Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/): review sự cố không đổ lỗi cá nhân.
- **Best practice:** [Architectural Decision Records](https://adr.github.io/): ghi lại vì sao chọn giải pháp.
- **Best practice:** [Kubernetes Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/): tự kiểm tra bảo mật trước khi nộp.
