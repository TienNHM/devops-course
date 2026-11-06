# Slide buổi 01 – DevOps Introduction

> **Tóm tắt:** Buổi học trình bày DevOps như một văn hóa và một quy trình phối hợp, vẽ đường đi của mã nguồn từ laptop đến server bằng Mermaid, xác định các điểm nghẽn thủ công và cách khắc phục bằng CI/CD và IaC. Bài lab tương ứng: [Buổi 01 – DevOps Introduction](../../labs/week-01/session-01.md).

## Mục tiêu của buổi học

![Ba mục tiêu: hiểu DevOps, vẽ quy trình, tìm điểm nghẽn](/slides/img/s01-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ, không đọc từng dòng.
- Mục tiêu đầy đủ: giải thích DevOps là gì và không phải là gì; phân biệt CI, Continuous Delivery, Continuous Deployment; vẽ workflow bằng Mermaid (mỗi bước có người thực hiện, đầu vào, đầu ra); chỉ ra ít nhất 3 điểm nghẽn; nộp bài đúng cấu trúc `lab-01/`.
- Câu hỏi mở đầu: ai từng gửi mã nguồn qua Zalo rồi nhận phản hồi "máy tôi chạy được"?
:::

---

## Bài toán thực tế: "chạy được trên máy tôi"

![Nam gửi zip qua Zalo, Lan chạy trên server và gặp lỗi](/slides/img/s01-works-on-my-machine.svg)

::: details Ghi chú cho mentor
- Tình huống: Nam viết xong tính năng, nén thư mục, gửi qua Zalo cho Lan. Lan cài Node.js khác phiên bản và quên biến môi trường `DB_PASSWORD`.
- Ứng dụng lỗi, hai người mất một buổi tối để suy đoán nguyên nhân, và lần sau lỗi lặp lại tương tự.
- Gốc rễ nằm ở quy trình, không nằm ở mã nguồn: các bước không được ghi lại, môi trường mỗi nơi khác nhau, không có kiểm thử trước khi đưa lên server, và hai người ở hai đầu không chung trách nhiệm.
:::

---

## Khái niệm: SDLC

![Plan, Code, Build, Test, Release, Deploy, Operate rồi phản hồi quay lại Plan](/slides/img/s01-sdlc-loop.svg)

- **SDLC** (vòng đời phát triển phần mềm) là chuỗi giai đoạn của một phần mềm, từ lập kế hoạch đến vận hành.
- Ví dụ trong dự án: ứng dụng CLB đi từ Plan đến Operate với endpoint `GET /api/members`.

::: details Ghi chú cho mentor
- SDLC viết đầy đủ là Software Development Life Cycle.
- Phản hồi từ giai đoạn vận hành quay lại giai đoạn lập kế hoạch, nên các giai đoạn tạo thành một vòng lặp.
- Chi tiết ví dụ với ứng dụng CLB: Plan (ban chủ nhiệm cần danh sách thành viên), Code (endpoint `GET /api/members`), Build (cài dependency, đóng gói image), Test (test `GET /health`), Release (tag `1.0.0`), Deploy (server của CLB), Operate (xem log, kiểm tra `/ready`).
- So sánh: mô hình waterfall là dây chuyền một chiều; quy trình hiện đại là vòng lặp có phản hồi.
:::

---

## Dev và Ops có hai mục tiêu đối lập

![Dev muốn ra tính năng nhanh, Ops muốn ổn định, code bị ném qua tường](/slides/img/s01-dev-ops-wall.svg)

::: details Ghi chú cho mentor
- Dev lo ngại bị chặn phát hành; Ops lo ngại thay đổi làm sập hệ thống.
- Khi hai nhóm tách rời: Dev chuyển mã sang Ops mà không phối hợp, Ops từ chối thay đổi.
- DevOps đặt hai nhóm vào một mục tiêu chung: giao giá trị nhanh và an toàn.
:::

---

## Khái niệm: DevOps

![Cộng tác, tự động hóa, đo lường, phản hồi nhanh](/slides/img/s01-principles.svg)

- **DevOps** là văn hóa và thực hành giúp nhóm Dev và Ops cùng chịu trách nhiệm đưa phần mềm đến người dùng.
- Ví dụ trong dự án: Dev và Ops của CLB cùng phụ trách một bản phát hành.

::: details Ghi chú cho mentor
- Lưu ý: Docker và Kubernetes là công cụ, không phải bản thân DevOps.
- Bốn nguyên tắc: cộng tác, tự động hóa, đo lường, phản hồi nhanh.
- DevOps cũng không phải vai trò của một người làm mọi việc.
- Ví dụ so sánh: nhóm bếp và nhóm phục vụ cùng chịu trách nhiệm về bữa ăn.
- Hiểu nhầm thường gặp: "DevOps là Docker/Kubernetes" (đó là công cụ), "DevOps là một người làm tất cả" (đó là cách làm việc của cả đội).
:::

---

## Khái niệm: CI, Continuous Delivery và Continuous Deployment

![CI chỉ build và test; Delivery cần người duyệt; Deployment tự deploy](/slides/img/s01-ci-cd-levels.svg)

- **CI** (Continuous Integration) là thực hành tự động build và test mã nguồn mỗi khi có thay đổi được push.
- Ví dụ trong dự án: GitHub Actions tự build và test mỗi lần push.

::: details Ghi chú cho mentor
- **Continuous Delivery** giữ mọi bản đã qua kiểm thử ở trạng thái sẵn sàng phát hành, và một người duyệt quyết định thời điểm deploy.
- **Continuous Deployment** tự động deploy bản đó, không cần thao tác thủ công.
- CI: mỗi lần push, hệ thống tự build và test. Delivery: bản qua test luôn sẵn sàng, người duyệt bấm nút cuối. Deployment: bản qua test tự deploy, không ai bấm.
- Khóa học dùng GitHub Actions cho CI và GHCR để lưu image. Việc deploy vào máy cá nhân dùng script, không đưa ra Internet.
- Câu hỏi: với ứng dụng ngân hàng, nên chọn mức nào và vì sao?
:::

---

## Khái niệm: IaC

![compose.yaml mô tả frontend, backend, postgres và chạy giống nhau ở mọi máy](/slides/img/s01-iac.svg)

- **IaC** (Infrastructure as Code) là cách mô tả hạ tầng và môi trường chạy bằng tệp văn bản được quản lý trong Git.
- Ví dụ trong dự án: `compose.yaml` mô tả frontend, backend và postgres.

::: details Ghi chú cho mentor
- Vì cấu hình được viết thành tệp, hạ tầng có thể tái lập, review như mã nguồn và khôi phục nhanh.
- Thư mục `k8s/` mô tả cùng hệ thống trên Kubernetes.
- Ví dụ so sánh: công thức được viết ra giấy thay vì nằm trong trí nhớ của một người.
- Lợi ích: tái lập được, review như mã nguồn, khôi phục nhanh.
:::

---

## Quy trình thủ công và vòng lặp lỗi

![Dev nén gửi, Ops cài và chạy, lỗi thì hỏi lại dev, lặp lại](/slides/img/s01-manual-flow.svg)

::: details Ghi chú cho mentor
- Chỉ vào vòng màu đỏ: cài, chạy, lỗi, hỏi lại, suy đoán. Đây là chi phí ẩn của quy trình thủ công.
- Câu hỏi: bước nào chỉ tồn tại trong đầu một người?
:::

---

## Khái niệm: Pipeline, registry và health check

- **Pipeline** là chuỗi bước tự động chạy theo thứ tự (build, test, đóng gói, deploy); bước thất bại thì các bước sau dừng.
- Ví dụ trong dự án: GitHub Actions là pipeline, GHCR là registry.

::: details Ghi chú cho mentor
- Health check trong dự án là `/health`.
- **Registry** là nơi lưu các artifact (ở đây là image) có phiên bản.
- **Health check** là yêu cầu kiểm tra rằng ứng dụng đã chạy thật; dự án dùng `/health` và `/ready`.
:::

---

## Quy trình tự động: cổng test chặn lỗi

![Push, CI build và test, đạt thì đóng gói, registry, deploy, health check](/slides/img/s01-auto-flow.svg)

::: details Ghi chú cho mentor
- Push: thay đổi có lịch sử và người chịu trách nhiệm.
- CI: cùng một quy trình mỗi lần chạy, nên loại bỏ sai khác giữa các máy.
- Cổng test: test thất bại thì pipeline dừng, không có image lỗi nào được phát hành.
- Registry: artifact bất biến, có phiên bản.
- Health check: xác nhận ứng dụng hoạt động thật (`/health`, `/ready`).
:::

---

## Demo: sơ đồ dạng văn bản và `git diff`

```diff
 flowchart LR
     A["Dev: viết code"] --> B["Dev: nén và gửi file"]
+    B --> T["Dev: chạy test"]
```

Sơ đồ Mermaid là văn bản nằm trong Git: sau khi commit, lệnh `git diff` chỉ ra đúng dòng thay đổi để review.

::: details Ghi chú cho mentor
- Viết sơ đồ Mermaid 4 bước thành tệp `.mmd`, dán vào mermaid.live để xem hình.
- Commit tệp, thêm một dòng "Chạy test", rồi xem `git diff`.
- Mã commit của người học sẽ khác ví dụ trên màn hình; điều này là bình thường.
:::

---

## Lab buổi 01

| Mức | Việc | Mốc |
| --- | --- | --- |
| L1, 60 phút | Bảng 9 bước, 2 sơ đồ | `lab-01/` |
| L2, ở nhà | Đề xuất workflow | `proposal.md` |

Lab: [Buổi 01 – DevOps Introduction](../../labs/week-01/session-01.md); thử thách: [Buổi 01 – Thử thách thêm](../../labs/week-01/session-01-challenge.md).

::: details Ghi chú cho mentor
- L1 gồm bảng 9 bước, 2 sơ đồ và 3 điểm nghẽn; mốc xong là `lab-01/` đủ tệp, 2 ảnh, evidence. L2 là đề xuất workflow cho dự án CLB thật.
- L1: bảng 9 bước (người thực hiện, đầu vào, đầu ra), sơ đồ thủ công, 3 điểm nghẽn, sơ đồ tự động, bằng chứng.
- L2: có số liệu ước lượng, rủi ro và 2 chỉ số đo.
:::

---

## Lỗi thường gặp

| Triệu chứng | Cách sửa |
| --- | --- |
| `Syntax error` | Nhãn trong dấu nháy kép |
| Không rõ người làm | Thêm `Dev:` hoặc `Ops:` |
| Hỏi "Node bản mấy" | Ghi vào README |
| Terminal hiện `>` | Nhập `EOF` hoặc Ctrl+C |

::: details Ghi chú cho mentor
- Mermaid báo `Syntax error` khi nhãn chưa đặt trong dấu nháy kép; sơ đồ chỉ có hộp mà không rõ ai thực hiện thì thêm `Dev:` hoặc `Ops:` vào nhãn.
- Đầy đủ: người cùng nhóm hỏi "lệnh nào, Node bản mấy" thì ghi vào README, `compose.yaml`, `.env.example`; terminal hiện `>` thì nhập `EOF` rồi nhấn Enter, hoặc nhấn Ctrl+C.
- Nhãn có dấu ngoặc mà không đặt trong dấu nháy kép sẽ bị parser hiểu là ký hiệu hình dạng nút.
- Mỗi câu hỏi của người cùng nhóm là một thông tin ngầm chưa được viết ra (tribal knowledge).
- Dấu `>` ở đầu dòng nghĩa là heredoc đang chờ dòng `EOF`.
:::

---

## Thử thách tính chi phí

Nhóm push 15 lần mỗi ngày, mỗi lần deploy thủ công mất 10 phút.

Câu hỏi: chi phí mỗi tuần (5 ngày) là bao nhiêu, và bước nào nên được tự động hóa trước?

::: details Ghi chú cho mentor
- Đáp án: 15 x 10 phút x 5 ngày = 750 phút, tức 12,5 giờ mỗi tuần.
- Bước deploy lặp lại nhiều nhất và tốn thời gian nhất nên được tự động hóa trước.
:::

---

## Tổng kết

![Ba điều cần nhớ: văn hóa, CI/CD và IaC, điểm nghẽn trước](/slides/img/s01-recap.svg)

Buổi tiếp theo: dựng WSL2, Git và SSH key ([Slide buổi 02](session-02.md)).

::: details Ghi chú cho mentor
- Delivery cần người duyệt, Deployment thì tự động.
- Mỗi bước trong quy trình phải có người thực hiện, đầu vào và đầu ra.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [What is DevOps? (Microsoft Learn)](https://learn.microsoft.com/en-us/devops/what-is-devops): giải thích DevOps dễ hiểu cho người mới.
- **Tài liệu chính thức:** [DevOps Roadmap](https://roadmap.sh/devops): bản đồ kỹ năng để biết mình học đến đâu.
- **Best practice:** [Google SRE Book: Introduction](https://sre.google/sre-book/introduction/): cách Google vận hành hệ thống ổn định.
- **Best practice:** [The Twelve-Factor App](https://12factor.net/): 12 nguyên tắc xây ứng dụng dễ triển khai.
