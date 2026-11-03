# Slide buổi 01 – DevOps Introduction

> **Tóm tắt:** Hiểu DevOps là văn hóa và quy trình, vẽ đường đi của code từ laptop đến server bằng Mermaid, chỉ ra điểm nghẽn thủ công và cách tự động hóa bằng CI/CD và IaC. Bài lab tương ứng: [Buổi 01 – DevOps Introduction](../../labs/week-01/session-01.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: hiểu DevOps, vẽ quy trình, tìm điểm nghẽn](/slides/img/s01-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: giải thích DevOps là gì và không phải là gì; phân biệt CI, Continuous Delivery, Continuous Deployment; vẽ workflow bằng Mermaid (mỗi bước có ai làm, đầu vào, đầu ra); chỉ ra ít nhất 3 điểm nghẽn; nộp bài đúng cấu trúc `lab-01/`.
- Hỏi: ai từng gửi code cho bạn qua Zalo rồi nghe câu "máy tôi chạy được"?
:::

---

## Slide 2: "Chạy được trên máy tôi"

![Nam gửi zip qua Zalo, Lan chạy trên server và gặp lỗi](/slides/img/s01-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Kể chuyện: Nam viết xong tính năng, nén thư mục, gửi qua Zalo cho Lan. Lan cài Node.js khác phiên bản, quên biến môi trường `DB_PASSWORD`.
- Ứng dụng lỗi, hai bạn mất một buổi tối để đoán nguyên nhân, lần sau lặp lại y hệt.
- Gốc rễ nằm ở quy trình, không ở code: không ai viết ra các bước, môi trường mỗi nơi một kiểu, không có kiểm thử trước khi đưa lên server, hai người ở hai đầu không chung trách nhiệm.
:::

---

## Slide 3: SDLC là một vòng lặp

![Plan, Code, Build, Test, Release, Deploy, Operate rồi phản hồi quay lại Plan](/slides/img/s01-sdlc-loop.svg)

::: details Ghi chú cho mentor
- Ví dụ với ứng dụng CLB: Plan (ban chủ nhiệm cần danh sách thành viên), Code (endpoint `GET /api/members`), Build (cài dependency, đóng gói image), Test (test `GET /health`), Release (tag `1.0.0`), Deploy (server của CLB), Operate (xem log, kiểm tra `/ready`).
- Ví von: ngày xưa là dây chuyền một chiều (waterfall), nay là vòng lặp có phản hồi.
:::

---

## Slide 4: Dev và Ops kéo về hai phía

![Dev muốn ra tính năng nhanh, Ops muốn ổn định, code bị ném qua tường](/slides/img/s01-dev-ops-wall.svg)

::: details Ghi chú cho mentor
- Dev sợ bị chặn không được phát hành; Ops sợ thay đổi làm sập hệ thống.
- Khi tách rời: Dev ném code qua tường, Ops từ chối thay đổi.
- DevOps đặt chung một mục tiêu: giao giá trị nhanh và an toàn.
:::

---

## Slide 5: Văn hóa DevOps: 4 nguyên tắc

![Cộng tác, tự động hóa, đo lường, phản hồi nhanh](/slides/img/s01-principles.svg)

::: details Ghi chú cho mentor
- Ví von: đội bếp và phục vụ cùng chịu trách nhiệm bữa ăn, không phải bếp nấu xong rồi ném đĩa qua cửa sổ.
- Hiểu nhầm hay gặp: "DevOps là Docker/Kubernetes" (đó là công cụ), "DevOps là một người làm hết" (đó là cách làm việc của cả đội).
:::

---

## Slide 6: CI, Delivery, Deployment: ai bấm nút cuối?

![CI chỉ build và test; Delivery cần người duyệt; Deployment tự deploy](/slides/img/s01-ci-cd-levels.svg)

::: details Ghi chú cho mentor
- CI: mỗi lần push, tự build và test. Delivery: bản qua test luôn sẵn sàng, người duyệt bấm nút cuối. Deployment: bản qua test tự deploy, không ai bấm.
- Khóa này: GitHub Actions cho CI, GHCR chứa image. Deploy vào máy cá nhân dùng script, không expose ra Internet.
- Hỏi: nếu ứng dụng ngân hàng, bạn chọn mức nào?
:::

---

## Slide 7: IaC: hạ tầng là file trong Git

![compose.yaml mô tả frontend, backend, postgres và chạy giống nhau ở mọi máy](/slides/img/s01-iac.svg)

::: details Ghi chú cho mentor
- IaC (Infrastructure as Code): mô tả hạ tầng và môi trường bằng file văn bản trong Git.
- Ví von: công thức nấu ăn viết ra giấy thay vì nằm trong trí nhớ của một đầu bếp.
- Sau này thư mục `k8s/` mô tả cùng hệ thống trên Kubernetes.
- Lợi ích: tái lập được, review như code, khôi phục nhanh.
:::

---

## Slide 8: Quy trình thủ công và vòng lặp lỗi

![Dev nén gửi, Ops cài và chạy, lỗi thì hỏi lại dev, lặp lại](/slides/img/s01-manual-flow.svg)

::: details Ghi chú cho mentor
- Chỉ vào vòng đỏ: cài, chạy, lỗi, hỏi lại, đoán. Đó là chi phí ẩn.
- Hỏi: bước nào chỉ nằm trong đầu một người?
:::

---

## Slide 9: Quy trình tự động: cổng test chặn lỗi

![Push, CI build và test, đạt thì đóng gói, registry, deploy, health check](/slides/img/s01-auto-flow.svg)

::: details Ghi chú cho mentor
- Push: thay đổi có lịch sử và người chịu trách nhiệm.
- CI: cùng một quy trình mỗi lần, hết "khác máy".
- Cổng test: test fail thì dừng, không có image lỗi nào phát hành.
- Registry: artifact bất biến, có phiên bản.
- Health check: xác nhận sống thật (`/health`, `/ready`).
:::

---

## Slide 10: Demo: sơ đồ là text, git diff chỉ đúng dòng đổi

```diff
 flowchart LR
     A["Dev: viết code"] --> B["Dev: nén và gửi file"]
+    B --> T["Dev: chạy test"]
```

Sơ đồ nằm trong Git: commit rồi `git diff` để review.

::: details Ghi chú cho mentor
- Viết sơ đồ Mermaid 4 bước thành file `.mmd`, dán vào mermaid.live để thấy hình.
- Commit file, thêm một dòng "Chạy test", rồi xem `git diff`.
- Mã commit của bạn sẽ khác ví dụ trên màn hình, đó là bình thường.
:::

---

## Slide 11: Lab buổi 01

| Mức | Việc làm | Mốc xong |
| --- | --- | --- |
| L1, 60 phút | Bảng 9 bước, 2 sơ đồ, 3 điểm nghẽn | `lab-01/` đủ file, 2 ảnh, evidence |
| L2, ở nhà | Đề xuất workflow cho dự án CLB thật | `proposal.md` |

Làm theo bài [Buổi 01 – DevOps Introduction](../../labs/week-01/session-01.md); thử thách ở [Buổi 01 – Thử thách thêm](../../labs/week-01/session-01-challenge.md).

::: details Ghi chú cho mentor
- L1: bảng 9 bước (ai làm, đầu vào, đầu ra), sơ đồ thủ công, 3 điểm nghẽn, sơ đồ tự động, bằng chứng.
- L2: có số liệu ước lượng, rủi ro và 2 chỉ số đo.
:::

---

## Slide 12: Lỗi thường gặp

| Triệu chứng | Cách sửa |
| --- | --- |
| Mermaid báo `Syntax error` | Đặt mọi nhãn trong nháy kép |
| Sơ đồ chỉ có hộp, không biết ai làm | Thêm `Dev:` hoặc `Ops:` vào nhãn |
| Bạn cùng bàn hỏi "lệnh nào, Node bản mấy" | Ghi vào README, `compose.yaml`, `.env.example` |
| Terminal hiện `>` mãi, không chạy tiếp | Gõ `EOF` rồi Enter, hoặc Ctrl+C |

::: details Ghi chú cho mentor
- Nhãn có ngoặc không đặt trong nháy kép thì parser hiểu ngoặc là ký hiệu hình dạng nút.
- Mỗi câu hỏi của bạn cùng bàn là một thông tin ngầm chưa viết ra (tribal knowledge).
- Dấu `>` ở đầu dòng nghĩa là heredoc đang chờ dòng `EOF`.
:::

---

## Slide 13: Thử thách tính chi phí

Nhóm push 15 lần mỗi ngày, mỗi lần deploy tay mất 10 phút.

Chi phí mỗi tuần (5 ngày) là bao nhiêu? Bước nào nên tự động hóa trước?

::: details Ghi chú cho mentor
- Đáp án: 15 x 10 phút x 5 ngày = 750 phút, tức 12,5 giờ mỗi tuần.
- Bước deploy lặp nhiều nhất và tốn thời gian nhất nên tự động hóa trước.
:::

---

## Slide 14: Recap

![Ba điều cần nhớ: văn hóa, CI/CD và IaC, điểm nghẽn trước](/slides/img/s01-recap.svg)

Buổi tiếp theo: dựng WSL2, Git và SSH key ([Slide buổi 02](session-02.md)).

::: details Ghi chú cho mentor
- Delivery cần người duyệt, Deployment thì tự động.
- Mỗi bước trong quy trình phải có người làm, đầu vào và đầu ra.
:::
