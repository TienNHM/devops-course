# Slide buổi 29 – Architecture & Planning

> **Tóm tắt:** Nhóm Capstone chốt requirement, vẽ kiến trúc, tạo repo từ starter-project, dựng GitHub Projects có backlog kèm tiêu chí hoàn thành và viết ba ADR đầu tiên. Bài lab đầy đủ và lệnh: [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md).

## Slide 1: Hôm nay nhóm bạn tạo ra gì

![Ba sản phẩm: requirement, kiến trúc cùng repo, backlog cùng ADR](/slides/img/s29-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết: requirement kiểm chứng được; sơ đồ mermaid; repo từ `starter-project/` chặn `.env` bằng `.gitignore`; GitHub Project ít nhất 12 Issue có owner, size, milestone; ít nhất 3 ADR so sánh lựa chọn thật.
- Cả nhóm làm cùng nhau; trưởng nhóm thao tác, người khác clone để kiểm tra.
:::

---

## Slide 2: Ôn nhanh trước khi bắt đầu

- Compose: `docker compose down` giữ volume, `down -v` xóa volume.
- CI trên Pull Request: test, validate, build thử image.
- Kubernetes: Deployment, StatefulSet, Service, Ingress trên kind.

::: details Ghi chú cho mentor
- Mỗi người chọn một mảng sẽ nhận trong nhóm.
- Hỏi nhanh: `down -v` khác `down` ở điểm nào?
:::

---

## Slide 3: Code ngay không kế hoạch

![Từ code ngay đến ba kiểu API, .env lên GitHub, ngày demo không có manifest](/slides/img/s29-chaos.svg)

::: details Ghi chú cho mentor
- Nhóm hào hứng, mở máy code ngay. Hai tuần sau: ba kiểu API khác nhau, không ai review ai; `.env` chứa mật khẩu bị đẩy lên GitHub; ngày demo mới biết không ai có manifest Kubernetes chạy được.
- Nguyên nhân gốc: thiếu bức tranh chung, thiếu định nghĩa "xong", thiếu người chịu trách nhiệm.
:::

---

## Slide 4: Requirement phải kiểm chứng được

![So sánh "API chạy tốt" mơ hồ với GET /api/members/999 trả 404 kiểm chứng bằng curl](/slides/img/s29-requirement.svg)

::: details Ghi chú cho mentor
- Xấu: "API chạy tốt". Tốt: "`GET /api/members/999` trả 404 với JSON có trường `error`".
- Ví von: đề thi có đáp án; "làm cho tốt" không có đáp án để chấm.
:::

---

## Slide 5: Ba loại requirement

| Loại | Ví dụ | Kiểm chứng |
| --- | --- | --- |
| Chức năng | `POST /api/members` trả 201, sai dữ liệu trả 400 | `curl`, test tự động |
| Phi chức năng | Dữ liệu còn sau recreate | `down` rồi `up`, GET lại |
| Bảo mật | Không có secret trong Git | `git log -p`, rà soát |

::: details Ghi chú cho mentor
- Nhóm điền đủ F1-F8 trong `docs/requirements.md` và thêm ít nhất 3 dòng phi chức năng (secret, CI chặn merge, scale 2 lên 3).
- Không dòng nào dùng từ "tốt", "nhanh" mà thiếu số liệu.
:::

---

## Slide 6: Kiến trúc trả lời bốn câu hỏi

![Bốn câu hỏi: thành phần, kết nối, dữ liệu, đường đi của code](/slides/img/s29-four-questions.svg)

::: details Ghi chú cho mentor
- Có những thành phần nào? Chúng nói chuyện với nhau ra sao? Dữ liệu nằm ở đâu? Code đi từ máy developer tới nơi chạy bằng đường nào?
- Ví von: bản đồ khu phố cả nhóm cùng nhìn; vẽ đúng quan trọng hơn vẽ đẹp.
- Mỗi mũi tên phải trả lời được "dữ liệu gì đi qua đây".
:::

---

## Slide 7: Starter-project đã có sẵn gì

| Thành phần | Thực tế trong repo |
| --- | --- |
| Frontend | Nginx tĩnh, proxy `/api/` sang `backend:3000`, `club-web:1.0.0` |
| Backend | Node.js 22, Express 5, pg, Deployment `club-api` 2 replicas |
| Database | PostgreSQL, `database/init.sql`, volume `postgres-data` |
| Cấu hình | `.env`, ConfigMap `club-config`, Secret `club-secrets` |

::: details Ghi chú cho mentor
- Đọc nhanh `compose.yaml` và `k8s/backend.yaml` để vẽ cho đúng, không đoán; mentor sẽ đối chiếu.
- Schema `members`: `id`, `name`, `email` (UNIQUE), `created_at`.
:::

---

## Slide 8: Chia việc theo lát cắt dọc

![So sánh chia theo công cụ (ghép muộn) và chia theo kết quả (mỗi lát gồm API, test, frontend, README)](/slides/img/s29-slices.svg)

::: details Ghi chú cho mentor
- Chia theo công cụ (A Docker, B Kubernetes, C Actions) dẫn tới tích hợp muộn.
- Mỗi lát cắt review và demo được ngay.
- Quy tắc WIP: mỗi người tối đa 2 thẻ `In progress`.
:::

---

## Slide 9: Một Issue tốt trông như thế nào

![Issue Add DELETE với owner, size, milestone và checklist tiêu chí hoàn thành](/slides/img/s29-issue-card.svg)

::: details Ghi chú cho mentor
- Tiêu đề bắt đầu bằng động từ. Size: S dưới 1 giờ, M 1-3 giờ, L trên 3 giờ (nên tách).
- Milestone: M2 cho phần cài đặt, M3 cho kiểm thử trên kind, M4 cho demo, theo tài liệu milestones của Capstone.
- Trường Status của Project: `Backlog`, `Ready`, `In progress`, `In review`, `Done`.
:::

---

## Slide 10: Definition of Done và ADR

![DoD gồm bốn điều kiện; ADR gồm bối cảnh, lựa chọn, quyết định, hệ quả](/slides/img/s29-dod-adr.svg)

::: details Ghi chú cho mentor
- ADR: một quyết định một file, tối đa một trang, đặt tại `docs/adr/`. Template: `templates/adr-template.md`.
- Không sửa ADR cũ; tạo ADR mới thay thế.
- Đọc to phần Hệ quả của ADR chiến lược tag: "Điều gì khó hơn sau quyết định này?"
:::

---

## Slide 11: Kiến trúc mục tiêu

![Developer push lên GitHub, Actions build image lên GHCR, kind cluster chạy Ingress, web, API, Postgres](/slides/img/s29-architecture.svg)

::: details Ghi chú cho mentor
- Nhóm dán sơ đồ mermaid vào README và thêm một thành phần tự quyết (ví dụ quét image, hoặc cổng `WEB_PORT`).
- Luồng request: Browser, Ingress `club.localhost`, Nginx `club-web`, `/api/` sang `backend:3000`, rồi PostgreSQL; dữ liệu nằm trên PVC nên xóa Pod không mất dữ liệu.
- Nhãn mermaid có ký tự đặc biệt phải đặt trong ngoặc kép.
:::

---

## Slide 12: Demo: repo nhóm sạch

```bash
cp -a ~/devops-course/starter-project/. ~/club-management/
cd ~/club-management
cp .env.example .env
git init -b main
git check-ignore -v .env
git add . && git status --short | grep -E "\.env$|node_modules" || echo "OK"
```

Chứng minh `.env` bị chặn bằng lệnh, không bằng niềm tin.

::: details Ghi chú cho mentor
- `cp -a` có dấu chấm cuối để giữ file ẩn. Kết quả mong đợi: dòng `.gitignore:1:.env` rồi `OK`.
- Tạo Issue "Add DELETE /api/members/:id": owner, size M, milestone M2, kéo qua các cột.
- Làm trong WSL (`~/club-management`), không dùng `/mnt/c`.
:::

---

## Slide 13: Lab: năm phần trong 60 phút

| Phần | Nội dung | Phút |
| --- | --- | --- |
| 1-2 | Requirement, repo nhóm từ starter-project | 22 |
| 3 | Kiến trúc và phân vai | 12 |
| 4 | GitHub Projects và backlog | 14 |
| 5 | ADR | 12 |

Lệnh từng bước: [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md).

::: details Ghi chú cho mentor
- Phần 1: 10 phút, phần 2: 12 phút.
- L1: repo sạch, PR đầu tiên, branch protection, 12 Issue, requirement F1-F8, README có sơ đồ và bảng phân vai.
- L2: ADR thứ tư về chiến lược test, sơ đồ phụ thuộc và đường găng, bảng rủi ro.
:::

---

## Slide 14: Phá lỗi: secret bị commit

![Commit C1 chứa .env; xóa ở C2 vẫn còn trong lịch sử; làm đúng: rotate, git rm cached, gitignore](/slides/img/s29-secret.svg)

Kịch bản đầy đủ: [Buổi 29 – Thử thách thêm](../../labs/week-15/session-29-challenge.md).

::: details Ghi chú cho mentor
- Triệu chứng: `git ls-files` in ra `.env`, không có thông báo lỗi nào.
- Điều tra: `git check-ignore -v .env`, `git log --oneline --all -- .env`.
- Chỉ thực hành trên repo thử nghiệm.
:::

---

## Slide 15: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| Backlog chỉ có "Làm Docker" | Viết lại theo kết quả, kèm checklist |
| Issue không có tiêu chí hoàn thành | Thêm checklist, áp DoD ở PR template |
| `.env` hiện trong `git status` | `cp -a` giữ file ẩn, kiểm tra `check-ignore` |
| PR không tự đóng Issue | Thêm `Closes #12` vào mô tả PR |

::: details Ghi chú cho mentor
- Mermaid không hiển thị: đặt nhãn trong ngoặc kép, rút ngắn nhãn.
:::

---

## Slide 16: Recap và nộp bài

![Ba điều cần nhớ: kiểm chứng được, chia theo kết quả, ADR và rotate](/slides/img/s29-recap.svg)

Nộp `lab-29/`: `evidence/command-output.txt`, `report.md`, `source/`. Buổi sau: [Buổi 30 – Implementation](session-30.md).

::: details Ghi chú cho mentor
- Nộp bài theo template; buổi sau triển khai CRUD, Compose, CI, publish GHCR.
- Ví von ADR: nhật ký "vì sao ta chọn vậy" để sáu tháng sau còn nhớ.
:::

---

## Slide 17: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Architectural Decision Records](https://adr.github.io/): cách ghi lại quyết định kiến trúc.
- **Tài liệu chính thức:** [Kubernetes Concepts](https://kubernetes.io/docs/concepts/): bản đồ các khái niệm để thiết kế hệ thống.
- **Best practice:** [The Twelve-Factor App](https://12factor.net/): 12 nguyên tắc thiết kế ứng dụng hiện đại.
- **Best practice:** [Kubernetes Configuration Good Practices](https://kubernetes.io/docs/concepts/configuration/overview/): lập kế hoạch manifest gọn và dễ bảo trì.
- **Best practice:** [Semantic Versioning](https://semver.org/): đặt số phiên bản dễ hiểu cho release.
