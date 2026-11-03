# Slide buổi 32 – Final Demo & Review

> **Tóm tắt:** Mỗi nhóm demo hệ thống Club Management từ Compose, CI/CD tới Kubernetes, xử lý một sự cố có chủ đích, bảo vệ kỹ thuật, rồi peer review và rút ra bài học. Lệnh lab: [Buổi 32](../../labs/week-16/session-32.md).

## Slide 1: Hôm nay cả nhóm lên bục

![Ba mục tiêu: demo 10 phút, xử lý sự cố, bảo vệ kỹ thuật](/slides/img/s32-goals.svg)

::: details Ghi chú cho mentor
- Mỗi người nói một đoạn; chạy demo trực tiếp Compose, GitHub Actions và Kubernetes trên kind.
- Chẩn đoán một sự cố có chủ đích ngay trên màn hình; peer review bằng bằng chứng, rút ra lessons learned.
:::

---

## Slide 2: Chạy được chưa phải là sẵn sàng bàn giao

![Nhóm bàn giao cho người nhận vận hành tiếp](/slides/img/s32-handover.svg)

::: details Ghi chú cho mentor
- Buổi này chấm cả cách xử lý lỗi, không chỉ kết quả cuối.
- Hỏi: nếu mai bạn nghỉ, người khác có vận hành được không?
:::

---

## Slide 3: Demo tốt chạy thật và nói to điều mình thấy

![So sánh demo kém và demo tốt](/slides/img/s32-demo-compare.svg)

::: details Ghi chú cho mentor
- Cấu trúc demo tốt: theo luồng bài toán tới bài học, không theo thứ tự file.
- Dự phòng: trạng thái sạch, video, ảnh chụp. Sự cố: nói to, giả thuyết, kiểm chứng; không giấu hay xóa làm lại.
:::

---

## Slide 4: Bảo vệ kỹ thuật: kết luận, lý do, bằng chứng

![Ba bước trả lời hỏi đáp kèm ví dụ Pod tự phục hồi](/slides/img/s32-answer-steps.svg)

::: details Ghi chú cho mentor
- 5 phút hỏi đáp sau demo; mentor hỏi vì sao chứ không hỏi là gì.
- Mentor chọn bất kỳ thành viên trả lời bất kỳ phần nào.
:::

---

## Slide 5: Phát biểu nào cũng cần bằng chứng

| Phát biểu | Bằng chứng |
| --- | --- |
| Dữ liệu không mất | `down` rồi `up`, gọi lại `GET /api/members` |
| Pipeline chặn code lỗi | Một run đỏ trong tab Actions |
| Pod tự phục hồi | `kubectl delete pod`, `get pods -w` |
| Secret không nằm trong Git | `git ls-files` không có Secret thật |

::: details Ghi chú cho mentor
- Thêm: image truy ngược về commit nhờ tag SHA hoặc phiên bản trên GHCR.
:::

---

## Slide 6: Luồng từ commit tới người dùng

![Developer, GitHub, Actions, GHCR, kind và đường Compose](/slides/img/s32-pipeline.svg)

::: details Ghi chú cho mentor
- Compose cho người dùng tại `localhost:8080`; kind cho người dùng tại `club.localhost`.
- Mỗi người trong nhóm nên giải thích được một đoạn của luồng này.
:::

---

## Slide 7: Kịch bản 10 phút

![Dòng thời gian: kiến trúc, Compose, CI/CD, Kubernetes, sự cố, hỏi đáp](/slides/img/s32-timeline.svg)

::: details Ghi chú cho mentor
- Thứ tự: kiến trúc, Git, Compose, CI/CD, Kubernetes, sự cố, bài học.
- Nhận xét cuối theo ba mục: điều tốt, rủi ro chính, một việc nên làm tiếp.
:::

---

## Slide 8: Demo: Compose rồi Kubernetes

```text
$ docker compose down && docker compose up -d
$ curl localhost:8080/api/members     # dữ liệu còn
$ kubectl scale deployment club-api --replicas=3 -n club
$ kubectl delete pod POD_BACKEND -n club
```

`down -v` sẽ làm mất dữ liệu. Pod mới do ReplicaSet tạo.

::: details Ghi chú cho mentor
- Compose: ba service `running`, `postgres` healthy.
- Kubernetes: scale lên 3 rồi về 2, xóa Pod và quan sát Pod mới.
- Sự cố sai tag image: Pod mới `ImagePullBackOff`, Pod cũ vẫn phục vụ, `rollout undo` khôi phục.
:::

---

## Slide 9: Lab Phần 1: preflight và phân vai

![Checklist kiểm tra máy và chuẩn bị dự phòng](/slides/img/s32-preflight.svg)

::: details Ghi chú cho mentor
- Chọn trạng thái xuất phát: (a) chưa apply manifest, triển khai ngay trên màn hình, hoặc (b) đã triển khai sẵn.
- Ghi tên người nói cho từng đoạn, mỗi người ít nhất một đoạn.
- Video chỉ dùng khi sự cố mạng và phải báo mentor.
:::

---

## Slide 10: Lab Phần 2: sự cố do mentor chọn

![Vòng sự cố, nói to, log và events, giả thuyết kiểm chứng](/slides/img/s32-incident-loop.svg)

::: details Ghi chú cho mentor
- CI/CD trong demo: mở run xanh, một run đỏ đã sửa, package trên GHCR, giải thích `packages: write`.
- Mentor chọn một trong ba loại: sai tag image, sai mật khẩu DB, readiness fail.
:::

---

## Slide 11: Lab Phần 3 và 4: hỏi đáp, peer review

| Phần | Việc làm | Lưu ý |
| --- | --- | --- |
| 3 | Hỏi đáp 5 phút | Trả lời bằng bằng chứng |
| 4 | Peer review từng bạn | Kèm link PR hoặc Issue |
| 4 | Lessons learned | Ghi vào `report.md` |

::: details Ghi chú cho mentor
- Câu hỏi mẫu: liveness và readiness khác gì, `down` và `down -v`, Secret có thực sự bí mật không.
- Không chia sẻ nội dung peer review với nhau.
- Lessons learned: điều tốt, điều chưa tốt, điều sẽ làm khác.
:::

---

## Slide 12: Phá lỗi: mất dữ liệu trước demo

![down giữ volume, down -v xóa volume](/slides/img/s32-down-v.svg)

Phòng tránh: chỉ dùng `down`, có script seed, sao lưu `pg_dump`.

::: details Ghi chú cho mentor
- Triệu chứng: giao diện mở bình thường, chỉ còn dữ liệu mẫu từ `init.sql`.
- Không "dọn dẹp" sát giờ demo.
- Hướng điều tra đầy đủ: phần Phá lỗi nâng cao của [Buổi 32](../../labs/week-16/session-32.md).
:::

---

## Slide 13: Challenge L2: failure injection tự chọn

| Yêu cầu | Chi tiết |
| --- | --- |
| Failure injection | Có giả thuyết trước khi chạy |
| Đề xuất cải tiến | 3 mục cho hệ thống, 2 cho khóa học |
| Câu hỏi | Nút thắt đầu tiên; đổi gì khi rời kind |

::: details Ghi chú cho mentor
- Ví dụ: xóa Pod `postgres-0`, ép backend crash, làm hỏng probe.
- Đề xuất cải tiến cần có ưu tiên.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: chạy thật, có bằng chứng, cẩn thận down -v](/slides/img/s32-recap.svg)

Nộp `lab-32/`; peer review gửi riêng cho mentor.

::: details Ghi chú cho mentor
- Cả nhóm phải hiểu toàn bộ hệ thống.
- Khi lỗi: nói to điều thấy, đọc log và events, giả thuyết, kiểm chứng.
- `down -v` và xóa PVC làm mất dữ liệu, chỉ dùng có chủ ý.
:::
