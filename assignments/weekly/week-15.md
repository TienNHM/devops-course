# Bài tập tuần 15 – Capstone Planning & Implementation

> **Tóm tắt:** Cùng nhóm biến đề bài Capstone thành kế hoạch kiểm chứng được, cài đặt CRUD API có test, chạy toàn stack bằng Compose với dữ liệu bền vững, dựng CI trên Pull Request và publish image lên GHCR. Mỗi người nộp bằng chứng từ source, log, kết quả test và lịch sử PR của chính mình.

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Phần việc của nhóm (repo, Project board, `main`) đã làm trong hai buổi lab; bạn chỉ gom lại dấu vết cá nhân: Issue bạn là owner, PR bạn tạo, PR bạn review, lỗi bạn gặp.

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Requirement và repo sạch | [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md), Phần 1-2 | 1 giờ | `requirements.md`, `git check-ignore -v .env`, `git ls-files` lọc `.env` rỗng, `git log` |
| 2. Kiến trúc, phân vai, backlog | [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md), Phần 3-4 | 1 giờ | `README-architecture.md`, bảng đối chiếu sơ đồ, danh sách Issue dạng text |
| 3. Ba ADR | [Buổi 29 – Architecture & Planning](../../labs/week-15/session-29.md), Phần 5 | 1 giờ | ba file ADR, link ba PR, comment của reviewer |
| 4. CRUD API, test và stack | [Buổi 30 – Implementation](../../labs/week-15/session-30.md), Phần 1-3 | 1,5 giờ | `test-results.txt`, bảy lệnh `curl` kèm mã, chuỗi `down` rồi `up` |
| 5. CI, GHCR và quy trình PR | [Buổi 30 – Implementation](../../labs/week-15/session-30.md), Phần 4-5 | 1,5 giờ | `gh run list`, link run xanh, image `sha-` trên GHCR, bảng PR tạo và review |

**Hạn nộp:** trước buổi đầu tiên của tuần 16.
**Hình thức:** Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-29/` và `lab-30/`.
**Đề bài và mốc:** [Đề bài Capstone](../capstone/README.md), [Milestones](../capstone/milestones.md) (bài tập này tương ứng mốc M1 và M2).
**Mẫu nộp bài:** [Mẫu nộp bài lab](../../templates/lab-template.md).
Mentor chấm theo barem; bảng điểm ngắn nằm bên dưới.

## Bảng điểm ngắn

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: Requirement và repo sạch | 15 |
| Nhiệm vụ 2: Kiến trúc, phân vai, backlog | 15 |
| Nhiệm vụ 3: Ba ADR | 12 |
| Nhiệm vụ 4: CRUD, test và stack | 22 |
| Nhiệm vụ 5: CI, GHCR và quy trình PR | 16 |
| Câu hỏi kiểm tra kiến thức | 10 |
| Cấu trúc nộp bài và an toàn (không có secret) | 10 |
| **Tổng bắt buộc** | **100** |
| Nhiệm vụ L2 (A, B, C: +4, +3, +3) | tối đa +10, tổng không vượt quá 110 |

## Bối cảnh

Capstone đòi hỏi nhóm 3 đến 4 người ghép Docker, Compose, GitHub Actions và Kubernetes thành một hệ thống chạy được, và mỗi người phải giải thích được cả hệ thống ở buổi bảo vệ. Rủi ro lớn nhất là thiếu kế hoạch chung và tích hợp muộn. Đây là bài làm nhóm với trách nhiệm cá nhân: repo, Project board và `main` là của cả nhóm, nhưng mỗi bạn nộp một bộ bằng chứng riêng; chỉ có kết quả của nhóm mà không có dấu vết đóng góp cá nhân thì không đạt tiêu chí. Mọi lệnh chạy trong filesystem WSL (ví dụ `~/club-management`, `~/devops-labs`), không dùng `/mnt/c`. Nếu kẹt, đọc bảng Gặp lỗi? của hai bài lab.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Requirement kiểm chứng được và repo nhóm sạch

Tạo repo nhóm từ `starter-project/` và viết requirement sao cho mỗi dòng có một cách kiểm chứng cụ thể.

Tiêu chí hoàn thành:

- `docs/requirements.md` có đủ F1 đến F8 theo [đề bài Capstone](../capstone/README.md) và ít nhất 3 dòng phi chức năng (ví dụ về secret, CI chặn merge, scale 2 lên 3 replicas). Mỗi dòng có cột "Cách kiểm chứng" nêu lệnh hoặc quan sát cụ thể (mã trạng thái, lệnh `curl`, lệnh `kubectl`), và cột Owner.
- Không có requirement nào dùng từ không đo được như "chạy tốt", "nhanh", "ổn định" mà thiếu số liệu hoặc mã trạng thái đi kèm.
- Evidence có output `git check-ignore -v .env` cho thấy `.gitignore` chặn `.env`, được chạy trước commit đầu tiên của repo nhóm; `.env.example` nằm trong repo và chỉ chứa giá trị giả.
- Evidence có `git ls-files | grep -E "(^|/)\.env$"` chạy trên `main` hiện tại của repo nhóm và không in ra gì (kèm một dòng `echo` hoặc ghi chú rằng kết quả rỗng là mong đợi).
- Mọi thành viên trong nhóm đã clone được repo; `git log --format="%h %an %s"` của `main` cho thấy commit đầu tiên "Import starter project as team baseline" (hoặc tương đương).

### Nhiệm vụ 2. Kiến trúc, phân vai và backlog

Biến requirement thành kiến trúc thống nhất, vòng review chéo và một backlog có thể theo dõi.

Tiêu chí hoàn thành:

- `README.md` của repo nhóm có sơ đồ mermaid của nhóm, bắt đầu từ sơ đồ ở buổi 29 và có ít nhất một thành phần hoặc chú thích do nhóm tự bổ sung. Sơ đồ thể hiện được bốn thứ: luồng CI/CD, các thành phần trong cluster, luồng request của người dùng và nơi lưu dữ liệu. Mỗi mũi tên phải có nhãn nói dữ liệu gì đi qua.
- Đối chiếu sơ đồ với hệ thống thật: `report.md` liệt kê ít nhất 3 chi tiết trong sơ đồ (tên Service, cổng, tên network hoặc volume) và lệnh `grep` hoặc `cat` trên `compose.yaml` hay `k8s/` chứng minh chi tiết đó khớp.
- `README.md` có bảng "Thành viên và vai trò" gồm trách nhiệm và reviewer chéo của từng người; vòng review khép kín, không ai review PR của chính mình.
- GitHub Project có các giá trị Status `Backlog`, `Ready`, `In progress`, `In review`, `Done` và các trường Milestone, Owner, Size.
- Ít nhất 12 Issue, trong đó mỗi Issue có tiêu đề bắt đầu bằng động từ, owner, size, milestone (M2, M3 hoặc M4) và checklist tiêu chí hoàn thành có thể kiểm chứng. Không có Issue size L chưa được tách nhỏ, và không ai giữ quá 2 thẻ `In progress` cùng lúc.
- Evidence có danh sách Issue xuất ra dạng text (ví dụ lệnh `gh issue list --limit 30 --state all` hoặc bảng dán từ Project) và `report.md` nêu rõ những Issue bạn là owner.

### Nhiệm vụ 3. Ba ADR có sức nặng

Ghi lại ba quyết định kiến trúc của nhóm bằng [template ADR](../../templates/adr-template.md), đặt tại `docs/adr/`.

Tiêu chí hoàn thành:

- Có ít nhất ba file ADR đánh số (`0001-...md`, `0002-...md`, `0003-...md`) về ba chủ đề khác nhau, ví dụ chiến lược tag image, cách lưu PostgreSQL trên Kubernetes, cách truy cập từ ngoài cluster.
- Mỗi ADR có đủ bốn phần: Bối cảnh, Các lựa chọn đã cân nhắc, Quyết định, Hệ quả. Mục lựa chọn so sánh ít nhất hai phương án thật, mỗi phương án có ưu điểm và nhược điểm riêng. Mục Hệ quả nêu cả điều trở nên dễ hơn lẫn điều trở nên khó hơn, cộng một việc cần làm tiếp.
- Mỗi ADR nằm trong một PR đã merge, reviewer (không phải tác giả) để lại ít nhất một comment câu hỏi trước khi approve và nhóm đã trả lời trong cùng PR.
- Ít nhất một ADR do chính bạn viết hoặc đồng viết; `report.md` ghi tên ADR đó và tóm tắt trong 2 đến 3 câu lý do chọn phương án.

### Nhiệm vụ 4. CRUD API có test và toàn stack chạy được

Hoàn thiện backend theo vai trò của bạn và chứng minh `main` của nhóm chạy từ đầu đến cuối.

Tiêu chí hoàn thành:

- `backend/` của repo nhóm tách tầng dữ liệu để handler nhận `repo` qua tham số, và có đủ `GET /api/members/:id`, `POST`, `PUT`, `DELETE /api/members/:id` với validation. `lab-30/source/` chứa các file bạn trực tiếp viết hoặc sửa (ví dụ `members-repo.js`, `app.js`, `tests/members.test.js`, `index.html`).
- Evidence `lab-30/evidence/test-results.txt` có output đầy đủ của `npm test` với ít nhất 5 test pass và 0 fail, chạy không cần PostgreSQL (tắt hẳn container `postgres` hoặc chạy trước `docker compose up`, và ghi rõ điều này).
- Các test phủ ít nhất bốn tình huống: tạo thành công (201), dữ liệu sai (400), id không tồn tại (404), email trùng (409). Mỗi tình huống có ít nhất một test có tên mô tả được tình huống đó.
- Trên một bản clone sạch của repo nhóm (thư mục mới, `cp .env.example .env`, `docker compose up -d --build`), evidence có `docker compose ps` và các lệnh `curl` kèm mã trạng thái cho bảy kết quả: `POST` 201, `POST` sai dữ liệu 400, `GET` id không tồn tại 404, `GET` id không hợp lệ 400, `PUT` 200, `DELETE` 204, `DELETE` lần hai 404.
- Evidence chứng minh dữ liệu bền vững: thêm một thành viên có email riêng của bạn, chạy `docker compose down` (không có `-v`) rồi `docker compose up -d`, chờ `/ready` trả 200, và `GET /api/members` vẫn có dòng đó.
- Evidence ghi lại một lần email trùng trả 409 (không phải 500) qua `curl` hoặc từ giao diện, kèm một câu giải thích vì sao PostgreSQL báo lỗi này và API xử lý ở đâu.
- Giao diện web ở `http://localhost:8080` (hoặc `WEB_PORT`) thêm và xóa được thành viên; `report.md` ghi ai làm phần này và PR tương ứng. Ảnh chụp chỉ bổ sung cho các log ở trên.

### Nhiệm vụ 5. CI trên Pull Request và publish GHCR

Dựng pipeline để mọi PR bị kiểm tra tự động và `main` phát hành được image.

Tiêu chí hoàn thành:

- Repo nhóm có `.github/workflows/ci.yml` chạy trên `pull_request` (và `push` lên `main`) với ba lớp kiểm tra: test backend, `docker compose config --quiet`, build thử hai image không push. Workflow không chứa secret thật; mật khẩu giả cho `compose config` nêu rõ là giá trị chỉ dùng cho CI.
- Repo nhóm có `.github/workflows/publish.yml` đã sửa đường dẫn context cho đúng cấu trúc repo (backend và frontend ở gốc), có `permissions` tối thiểu cần thiết và dùng `GITHUB_TOKEN`, không dán token vào file.
- Evidence có link tới ít nhất một lần chạy CI xanh trên PR và một lần chạy publish thành công trên `main`, cộng output text của `gh run list --limit 5` (hoặc bảng chép từ tab Actions) hiển thị trạng thái hoàn tất.
- Evidence cho thấy image `club-api` và `club-web` đã có trên GHCR kèm tag dạng `sha-xxxxxxx`; `report.md` giải thích vì sao không dùng mỗi tag `latest`, và nối lập luận với ADR chiến lược tag của nhóm.
- Mỗi thành viên có ít nhất 1 PR đã merge và đã review 1 PR của người khác. `report.md` có bảng gồm link PR bạn tạo, link PR bạn review, và nhận xét cụ thể bạn đã để lại (tên file hoặc dòng, điều bạn yêu cầu sửa hoặc xác nhận).
- Evidence có một lỗi tích hợp thật mà bạn hoặc nhóm gặp trong quá trình ghép (merge muộn, sai biến môi trường, sai tag, sai context workflow, conflict), theo cấu trúc triệu chứng, bằng chứng (lệnh và output), nguyên nhân gốc, cách sửa, cách phòng tránh.

## Nhiệm vụ L2 (nâng cao)

L2 là điểm thưởng, chỉ chấm khi L1 đã đạt từ 60 điểm trở lên. Nền tảng làm L2 nằm ở [Buổi 29 – Thử thách thêm](../../labs/week-15/session-29-challenge.md) và [Buổi 30 – Mã gợi ý và thử thách](../../labs/week-15/session-30-challenge.md). Không có gợi ý đi kèm; hãy tự dự đoán trước khi chạy lệnh và ghi dự đoán vào `report.md`.

### Thử thách A. Chặn merge khi CI đỏ

Tiêu chí hoàn thành:

- Branch protection hoặc ruleset của `main` yêu cầu PR, ít nhất 1 approval và các check `test`, `validate-compose`, `build-images` (hoặc tên tương đương trong workflow của nhóm). Nếu gói tài khoản không hỗ trợ, `report.md` nêu rõ giới hạn, cách nhóm thay thế bằng quy ước và cách mentor kiểm chứng qua lịch sử.
- Có một PR cố ý làm test đỏ: evidence có link PR và output text hoặc ảnh cho thấy nút merge bị chặn bởi check lỗi; sau đó PR được sửa, check xanh và PR được merge.
- `report.md` phân tích: check nào bắt lỗi, bắt ở bước nào, và một loại lỗi mà ba check hiện tại không bắt được.

### Thử thách B. Tag semver truy vết được

Tiêu chí hoàn thành:

- Đẩy tag Git `v1.1.0` (hoặc phiên bản nhóm chọn) và workflow publish tạo thêm tag semver cho image. Evidence có `git tag`, link lần chạy workflow do tag kích hoạt và trang Packages hiển thị tag mới.
- Evidence có lệnh `docker pull` hoặc `docker manifest inspect` cho image theo tag SHA và theo tag semver, chứng minh hai tag trỏ tới cùng một digest (hoặc giải thích có căn cứ nếu khác nhau).
- `report.md` mô tả quy trình rollback chính xác về một phiên bản cũ bằng tag và nêu điều gì phải sửa trong manifest.

### Thử thách C. Chạy bản mới trên kind

Tiêu chí hoàn thành:

- Build `club-api:1.1.0` từ code hiện tại của nhóm, nạp vào cluster kind, triển khai bằng manifest trong `k8s/` với `image` đã cập nhật. Evidence có `kubectl get pods -n club` thấy Pod của `club-api` ở trạng thái `Running` và `kubectl rollout status` thành công.
- Evidence có một lệnh `POST /api/members` thành công qua `kubectl port-forward` hoặc Ingress, kèm mã trạng thái 201, và `GET` lại thấy bản ghi vừa tạo.
- `report.md` nêu ít nhất hai điểm khác nhau giữa chạy bằng Compose và chạy trên Kubernetes mà nhóm đã gặp (khởi tạo database, biến môi trường, cách nạp image), mỗi điểm kèm bằng chứng từ log hoặc lệnh.

## Bằng chứng cần nộp

Cấu trúc thư mục theo mẫu lab:

```text
lab-29/
├── README.md
├── report.md
├── source/
│   ├── requirements.md
│   ├── adr/
│   │   ├── 0001-....md
│   │   ├── 0002-....md
│   │   └── 0003-....md
│   └── README-architecture.md
├── screenshots/
│   └── project-board.png
└── evidence/
    └── command-output.txt
lab-30/
├── README.md
├── report.md
├── source/
│   ├── members-repo.js
│   ├── app.js
│   ├── tests/
│   │   └── members.test.js
│   ├── index.html
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
├── screenshots/
│   └── actions-and-packages.png
└── evidence/
    ├── command-output.txt
    └── test-results.txt
```

Chỉ đưa vào `source/` các file bạn trực tiếp viết hoặc sửa; nếu phần của bạn là một phần diff nhỏ, ghi tên file và link commit hoặc PR trong `report.md`. `README-architecture.md` là bản sao phần kiến trúc và bảng phân vai từ README của repo nhóm.

Bằng chứng theo từng nhiệm vụ:

| Nhiệm vụ | Bằng chứng bắt buộc |
| --- | --- |
| 1 | `lab-29/source/requirements.md`; evidence có `git check-ignore -v .env`, kết quả rỗng của `git ls-files` lọc `.env`, `git log --format="%h %an %s"`; link repo nhóm |
| 2 | `lab-29/source/README-architecture.md`; `report.md` có bảng đối chiếu sơ đồ với `compose.yaml` hoặc `k8s/`; evidence có danh sách Issue dạng text; ảnh `project-board.png` chỉ bổ sung |
| 3 | `lab-29/source/adr/` có đủ ba file; `report.md` có link ba PR ADR và một comment của reviewer cùng câu trả lời của nhóm |
| 4 | `lab-30/source/` các file của bạn; `lab-30/evidence/test-results.txt`; evidence có `docker compose ps`, bảy lệnh `curl` kèm mã trạng thái, chuỗi thêm, `down`, `up`, đọc lại dữ liệu |
| 5 | `lab-30/source/workflows/`; evidence có `gh run list` hoặc bảng Actions, link run xanh, trang hoặc lệnh xác nhận image GHCR; `report.md` có bảng PR tạo và PR review cùng một lỗi tích hợp theo 5 bước |
| L2-A | Link PR đỏ rồi xanh; cấu hình branch protection ở dạng text hoặc ảnh; phân tích trong `report.md` |
| L2-B | `git tag`, link run theo tag, so sánh digest hai tag |
| L2-C | Output `kubectl` (get pods, rollout status), lệnh `POST` và `GET` kèm mã trạng thái, so sánh Compose và Kubernetes |

Quy tắc chung: evidence là output thật của lệnh (có dòng lệnh đi kèm), không chỉnh sửa số liệu; có thể dùng `tee -a evidence/command-output.txt` hoặc `script` để ghi lại phiên làm việc. Thông tin như email của bạn trong dữ liệu thử nghiệm là giá trị giả, không dùng email hay mật khẩu thật. Không đưa `.env`, token hay mật khẩu thật vào bất kỳ file nộp nào.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2-4 câu mỗi câu) trong mục "Câu hỏi kiểm tra" của `lab-30/report.md`.

1. Vì sao "API chạy tốt" không phải một requirement tốt? Viết lại nó thành một requirement kiểm chứng được cho `DELETE /api/members/:id`.
2. Vì sao truyền `repo` vào `createApp` giúp `npm test` chạy được mà không cần PostgreSQL, và test kiểu này không bắt được loại lỗi nào của SQL thật?
3. Email trùng nên trả 409 chứ không phải 500. Lỗi nào của PostgreSQL gây ra tình huống này và bước nào trong API biến nó thành 409?
4. `docker compose down` và `docker compose down -v` khác nhau thế nào về dữ liệu, và tại sao thêm cột mới vào `database/init.sql` không làm database cũ có cột đó?
5. Một PR có CI xanh nhưng sau khi merge, workflow publish đỏ. Hãy nêu ba điều bạn kiểm tra đầu tiên và vì sao trigger của hai workflow có thể cho kết quả khác nhau.

## Quy trình nộp

1. Tạo branch từ `main` trong repo cá nhân `devops-labs`, ví dụ `week-15`.
2. Hoàn thành `lab-29/` và `lab-30/` theo cấu trúc ở trên, commit nhiều lần với thông điệp rõ ràng. Phần việc của nhóm vẫn đi qua PR vào repo nhóm; repo cá nhân chỉ chứa bằng chứng và link.
3. Mở Pull Request vào `main` của repo cá nhân; mô tả PR ghi rõ đã làm L1 hay cả L2, kèm link repo nhóm và Project board.
4. Nhờ một bạn review theo [mẫu peer review](../../templates/peer-review-template.md); sửa theo góp ý hợp lý.
5. Sau khi PR có review, mentor chấm theo barem trên, đối chiếu với lịch sử PR và commit trong repo nhóm.
6. Hạn nộp: trước buổi đầu tiên của tuần 16. Nộp muộn cần báo mentor trước hạn.

## Checklist trước khi nộp

- [ ] `docs/requirements.md` có F1 đến F8 và ít nhất 3 dòng phi chức năng, mỗi dòng có cách kiểm chứng cụ thể
- [ ] `git check-ignore -v .env` có output, `.env` không nằm trong `git ls-files`
- [ ] README của repo nhóm có sơ đồ mermaid đã đối chiếu với `compose.yaml` hoặc `k8s/` và bảng phân vai có reviewer chéo
- [ ] GitHub Project có đủ cột Status và trường Milestone, Owner, Size; ít nhất 12 Issue có checklist hoàn thành
- [ ] Có ba ADR đủ bốn phần, mỗi ADR nằm trong PR đã merge có reviewer comment
- [ ] `npm test` có ít nhất 5 test pass, chạy không cần PostgreSQL, output nằm trong `evidence/test-results.txt`
- [ ] Bảy lệnh `curl` CRUD kèm mã trạng thái và kiểm tra dữ liệu sau `down` rồi `up` đều có output thật
- [ ] CI xanh trên ít nhất một PR, publish thành công trên `main`, image có tag `sha-` trên GHCR
- [ ] Mỗi thành viên có PR đã merge và đã review một PR khác; `report.md` có link và nhận xét cụ thể
- [ ] `report.md` có một lỗi tích hợp đã chẩn đoán và trả lời đủ 5 câu hỏi kiểm tra
- [ ] `README.md` của mỗi lab trả lời đủ 7 mục theo template và đánh dấu L1/L2
- [ ] Không commit `.env`, password, token, private key hay Secret chứa giá trị thật
- [ ] PR vào repo cá nhân đã được ít nhất một bạn review và nộp trước hạn
