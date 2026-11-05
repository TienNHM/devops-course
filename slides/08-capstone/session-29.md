# Slide buổi 29 – Architecture & Planning

> **Tóm tắt:** Nhóm Capstone xác định requirement, vẽ kiến trúc, tạo repository từ starter-project, dựng GitHub Projects với backlog có tiêu chí hoàn thành và viết ba ADR đầu tiên. Bài lab đầy đủ và các lệnh: [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md).

## Slide 1: Sản phẩm của buổi 29

![Ba sản phẩm: requirement, kiến trúc cùng repo, backlog cùng ADR](/slides/img/s29-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết: requirement kiểm chứng được; sơ đồ mermaid; repository tạo từ `starter-project/` và chặn `.env` bằng `.gitignore`; GitHub Project có ít nhất 12 Issue với owner, size, milestone; ít nhất 3 ADR so sánh các lựa chọn thực tế.
- Cả nhóm làm chung; trưởng nhóm thao tác, các thành viên khác clone để kiểm tra.
:::

---

## Slide 2: Ôn tập trước khi bắt đầu

- Compose: `docker compose down` giữ volume, `down -v` xóa volume.
- CI trên Pull Request: chạy test, kiểm tra cấu hình, build thử image.
- Kubernetes: Deployment, StatefulSet, Service, Ingress trên kind.

::: details Ghi chú cho mentor
- Mỗi thành viên chọn một mảng công việc sẽ đảm nhận trong nhóm.
- Câu hỏi kiểm tra nhanh: `down -v` khác `down` ở điểm nào.
:::

---

## Slide 3: Hệ quả của việc viết mã khi chưa có kế hoạch

![Từ code ngay đến ba kiểu API, .env lên GitHub, ngày demo không có manifest](/slides/img/s29-chaos.svg)

::: details Ghi chú cho mentor
- Kịch bản thường gặp: nhóm bắt đầu viết mã ngay. Hai tuần sau, API có ba phong cách khác nhau và không ai review mã của người khác; tệp `.env` chứa mật khẩu bị đẩy lên GitHub; đến ngày demo mới phát hiện không ai có manifest Kubernetes chạy được.
- Nguyên nhân gốc: thiếu bức tranh chung, thiếu định nghĩa "hoàn thành" và thiếu người chịu trách nhiệm.
:::

---

## Slide 4: Khái niệm: Requirement kiểm chứng được

- **Requirement** (yêu cầu) là mô tả điều hệ thống phải làm hoặc phải đáp ứng; requirement kiểm chứng được là requirement có thể xác nhận đúng hoặc sai bằng một phép kiểm tra cụ thể.
- Một requirement mơ hồ không có tiêu chí chấm, nên nhóm không thể xác định khi nào công việc đã xong.
- Ví dụ trong dự án: "`GET /api/members/999` trả về 404" kiểm chứng được bằng `curl`; "API chạy tốt" thì không.

---

## Slide 5: Requirement phải kiểm chứng được

![So sánh "API chạy tốt" mơ hồ với GET /api/members/999 trả 404 kiểm chứng bằng curl](/slides/img/s29-requirement.svg)

::: details Ghi chú cho mentor
- Cách viết chưa đạt: "API chạy tốt". Cách viết đạt: "`GET /api/members/999` trả 404 với JSON có trường `error`".
- Ví dụ so sánh: đề thi cần có đáp án để chấm; yêu cầu "làm cho tốt" không có đáp án tương ứng.
:::

---

## Slide 6: Ba loại requirement

| Loại | Ví dụ | Kiểm chứng |
| --- | --- | --- |
| Chức năng | `POST /api/members` trả 201, dữ liệu sai trả 400 | `curl`, test tự động |
| Phi chức năng | Dữ liệu còn sau khi recreate | `down` rồi `up`, GET lại |
| Bảo mật | Không có secret trong Git | `git log -p`, rà soát |

::: details Ghi chú cho mentor
- Nhóm điền đủ F1-F8 trong `docs/requirements.md` và thêm ít nhất 3 dòng phi chức năng (secret, CI chặn merge, scale từ 2 lên 3).
- Không dòng nào dùng từ "tốt", "nhanh" mà thiếu số liệu.
:::

---

## Slide 7: Kiến trúc trả lời bốn câu hỏi

![Bốn câu hỏi: thành phần, kết nối, dữ liệu, đường đi của code](/slides/img/s29-four-questions.svg)

::: details Ghi chú cho mentor
- Bốn câu hỏi: hệ thống có những thành phần nào; các thành phần giao tiếp với nhau ra sao; dữ liệu nằm ở đâu; mã nguồn đi từ máy developer tới nơi chạy bằng đường nào.
- Sơ đồ là tài liệu chung cho cả nhóm; tính chính xác quan trọng hơn tính thẩm mỹ.
- Mỗi mũi tên phải trả lời được câu hỏi "dữ liệu nào đi qua đây".
:::

---

## Slide 8: Starter-project cung cấp sẵn những gì

| Thành phần | Thực tế trong repository |
| --- | --- |
| Frontend | Nginx tĩnh, proxy `/api/` sang `backend:3000`, `club-web:1.0.0` |
| Backend | Node.js 22, Express 5, pg, Deployment `club-api` 2 replicas |
| Database | PostgreSQL, `database/init.sql`, volume `postgres-data` |
| Cấu hình | `.env`, ConfigMap `club-config`, Secret `club-secrets` |

::: details Ghi chú cho mentor
- Đọc `compose.yaml` và `k8s/backend.yaml` để vẽ sơ đồ chính xác, không suy đoán; mentor sẽ đối chiếu.
- Schema `members`: `id`, `name`, `email` (UNIQUE), `created_at`.
:::

---

## Slide 9: Khái niệm: Lát cắt dọc (vertical slice)

- **Lát cắt dọc** là một phần việc đi xuyên qua mọi tầng của hệ thống (API, test, frontend, tài liệu) để tạo ra một kết quả hoàn chỉnh, có thể review và demo.
- Ngược lại, chia việc theo công cụ khiến các phần chỉ ghép được vào cuối, nên lỗi tích hợp xuất hiện muộn.
- Ví dụ trong dự án: Issue "Add DELETE /api/members/:id" gồm route, test, nút Delete trên giao diện và cập nhật README.

---

## Slide 10: Chia việc theo lát cắt dọc

![So sánh chia theo công cụ (ghép muộn) và chia theo kết quả (mỗi lát gồm API, test, frontend, README)](/slides/img/s29-slices.svg)

::: details Ghi chú cho mentor
- Chia theo công cụ (A Docker, B Kubernetes, C Actions) dẫn tới tích hợp muộn.
- Mỗi lát cắt có thể review và demo ngay.
- Quy tắc giới hạn công việc đang làm (WIP): mỗi người tối đa 2 thẻ `In progress`.
:::

---

## Slide 11: Khái niệm: Acceptance criteria

- **Acceptance criteria** (tiêu chí chấp nhận) là danh sách điều kiện cụ thể mà một Issue phải thỏa mãn để được coi là hoàn thành.
- Tiêu chí được viết dưới dạng checklist trong Issue, nên người review có căn cứ khách quan để chấp nhận hoặc trả lại công việc.
- Ví dụ trong dự án: Issue "Add DELETE" có tiêu chí "`DELETE /api/members/1` trả 204" và "id không tồn tại trả 404".

---

## Slide 12: Một Issue đạt chuẩn

![Issue Add DELETE với owner, size, milestone và checklist tiêu chí hoàn thành](/slides/img/s29-issue-card.svg)

::: details Ghi chú cho mentor
- Tiêu đề bắt đầu bằng động từ. Size: S dưới 1 giờ, M 1-3 giờ, L trên 3 giờ (nên tách nhỏ).
- Milestone: M2 cho phần cài đặt, M3 cho kiểm thử trên kind, M4 cho demo, theo tài liệu milestones của Capstone.
- Trường Status của Project: `Backlog`, `Ready`, `In progress`, `In review`, `Done`.
:::

---

## Slide 13: Khái niệm: Definition of Done

- **Definition of Done (DoD)** là tập điều kiện chung mà mọi hạng mục công việc phải đạt trước khi được đánh dấu `Done`.
- Khác với acceptance criteria (riêng cho từng Issue), DoD áp dụng thống nhất cho cả nhóm, ví dụ qua PR template.
- Ví dụ trong dự án: DoD của nhóm gồm bốn điều kiện và được áp dụng qua PR template cho mọi Issue.

---

## Slide 14: Khái niệm: Architecture Decision Record (ADR)

- **ADR** là một tài liệu ngắn ghi lại một quyết định kiến trúc, gồm bối cảnh, các lựa chọn, quyết định và hệ quả.
- Tài liệu này lưu lý do của quyết định, nên các thành viên sau này hiểu được vì sao hệ thống được thiết kế như vậy.
- Ví dụ trong dự án: ADR về chiến lược tag image so sánh các cách đặt tag và nêu rõ điều gì trở nên khó hơn sau quyết định.

---

## Slide 15: Definition of Done và ADR

![DoD gồm bốn điều kiện; ADR gồm bối cảnh, lựa chọn, quyết định, hệ quả](/slides/img/s29-dod-adr.svg)

::: details Ghi chú cho mentor
- ADR: mỗi quyết định một tệp, tối đa một trang, đặt tại `docs/adr/`. Template: `templates/adr-template.md`.
- Không sửa ADR cũ; tạo ADR mới để thay thế.
- Đọc to phần Hệ quả của ADR chiến lược tag và đặt câu hỏi: điều gì khó hơn sau quyết định này.
:::

---

## Slide 16: Kiến trúc mục tiêu

![Developer push lên GitHub, Actions build image lên GHCR, kind cluster chạy Ingress, web, API, Postgres](/slides/img/s29-architecture.svg)

::: details Ghi chú cho mentor
- Nhóm đặt sơ đồ mermaid vào README và bổ sung một thành phần tự quyết định (ví dụ quét image, hoặc cổng `WEB_PORT`).
- Luồng request: Browser, Ingress `club.localhost`, Nginx `club-web`, `/api/` sang `backend:3000`, rồi PostgreSQL; dữ liệu nằm trên PVC nên xóa Pod không làm mất dữ liệu.
- Nhãn mermaid chứa ký tự đặc biệt phải đặt trong ngoặc kép.
:::

---

## Slide 17: Demo: repository nhóm sạch

```bash
cp -a ~/devops-course/starter-project/. ~/club-management/
cd ~/club-management
cp .env.example .env
git init -b main
git check-ignore -v .env
git add . && git status --short | grep -E "\.env$|node_modules" || echo "OK"
```

Việc `.env` bị chặn được chứng minh bằng kết quả lệnh, không dựa vào giả định.

::: details Ghi chú cho mentor
- `cp -a` có dấu chấm cuối để giữ các tệp ẩn. Kết quả mong đợi: dòng `.gitignore:1:.env` rồi `OK`.
- Tạo Issue "Add DELETE /api/members/:id": owner, size M, milestone M2, kéo qua các cột.
- Làm trong WSL (`~/club-management`), không dùng `/mnt/c`.
:::

---

## Slide 18: Lab: năm phần trong 60 phút

| Phần | Nội dung | Phút |
| --- | --- | --- |
| 1-2 | Requirement, repository nhóm từ starter-project | 22 |
| 3 | Kiến trúc và phân vai | 12 |
| 4 | GitHub Projects và backlog | 14 |
| 5 | ADR | 12 |

Lệnh từng bước: [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md).

::: details Ghi chú cho mentor
- Phần 1: 10 phút, phần 2: 12 phút.
- L1: repository sạch, PR đầu tiên, branch protection, 12 Issue, requirement F1-F8, README có sơ đồ và bảng phân vai.
- L2: ADR thứ tư về chiến lược test, sơ đồ phụ thuộc và đường găng, bảng rủi ro.
:::

---

## Slide 19: Phá lỗi: secret bị commit

![Commit C1 chứa .env; xóa ở C2 vẫn còn trong lịch sử; làm đúng: rotate, git rm cached, gitignore](/slides/img/s29-secret.svg)

Kịch bản đầy đủ: [Buổi 29 – Thử thách thêm](../../labs/week-15/session-29-challenge.md).

::: details Ghi chú cho mentor
- Triệu chứng: `git ls-files` liệt kê `.env`, không có thông báo lỗi nào.
- Điều tra: `git check-ignore -v .env`, `git log --oneline --all -- .env`.
- Chỉ thực hành trên repository thử nghiệm.
:::

---

## Slide 20: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| Backlog chỉ có "Làm Docker" | Viết lại theo kết quả, kèm checklist |
| Issue không có tiêu chí hoàn thành | Thêm checklist, áp dụng DoD ở PR template |
| `.env` xuất hiện trong `git status` | `cp -a` giữ tệp ẩn, kiểm tra bằng `check-ignore` |
| PR không tự đóng Issue | Thêm `Closes #12` vào mô tả PR |

::: details Ghi chú cho mentor
- Mermaid không hiển thị: đặt nhãn trong ngoặc kép, rút ngắn nhãn.
:::

---

## Slide 21: Tổng kết và nộp bài

![Ba điều cần nhớ: kiểm chứng được, chia theo kết quả, ADR và rotate](/slides/img/s29-recap.svg)

Nộp bài thư mục `lab-29/`: `evidence/command-output.txt`, `report.md`, `source/`. Buổi sau: [Buổi 30 – Implementation](session-30.md).

::: details Ghi chú cho mentor
- Nộp bài theo template; buổi sau triển khai CRUD, Compose, CI và publish lên GHCR.
- Ví dụ so sánh: ADR là nhật ký lý do của các quyết định, giúp thành viên nhớ được căn cứ sau nhiều tháng.
:::

---

## Slide 22: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Architectural Decision Records](https://adr.github.io/): cách ghi lại quyết định kiến trúc.
- **Tài liệu chính thức:** [Kubernetes Concepts](https://kubernetes.io/docs/concepts/): bản đồ các khái niệm để thiết kế hệ thống.
- **Best practice:** [The Twelve-Factor App](https://12factor.net/): 12 nguyên tắc thiết kế ứng dụng hiện đại.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): lập kế hoạch manifest gọn và dễ bảo trì.
- **Best practice:** [Semantic Versioning](https://semver.org/): đặt số phiên bản dễ hiểu cho release.
