# Bài tập tuần 10 – CD & Pipeline Security

> **Tóm tắt:** Nộp lại bằng chứng của hai bài lab: script deploy image từ GHCR có health check và rollback, rồi rà soát quyền workflow, một lần quét image và tìm secret. SBOM và pin SHA là phần nâng cao.

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Việc duy nhất ngoài lab là trả lời 5 câu hỏi kiểm tra ngắn trong `lab-20/report.md`. Phạm vi: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md) và [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Bài nộp nằm ở hai thư mục `lab-19/` và `lab-20/` trong repository cá nhân `devops-labs`. Hub tuần: [Tuần 10 – CD & Pipeline Security](../../labs/week-10/README.md).

## Việc cần nộp

| Nhiệm vụ | Làm ở phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Deploy bằng script | Buổi 19, Chuẩn bị, Phần 1 và Phần 2 | 1 giờ | `config` hợp nhất, log `health OK`, lần chạy `latest` bị từ chối, `curl` hai endpoint, `git check-ignore` |
| 2. Bản thứ hai và rollback | Buổi 19, Phần 3 | 45 phút | `current-tag` và `previous-tag` sau mỗi bước, log rollback, `docker compose ps --format` |
| 3. Rà soát permissions | Buổi 20, Phần 1 | 30 phút | `grep permissions`, `git log` của `demo-wide.yml`, bảng trong `report.md`, ảnh cài đặt |
| 4. Quét image một lần | Buổi 20, Phần 2 | 20 phút | Output quét kèm `Total` và thời điểm quét, 3 ý phân tích trong `report.md` |
| 5. Tìm secret lỡ commit | Buổi 20, Phần 3 | 10 phút | Output `git grep`, phân loại từng dòng trong `report.md` |
| Nâng cao (tùy chọn, 10 điểm) | [Buổi 20 – Phần nâng cao](../../labs/week-10/session-20-challenge.md) | 35 phút | Quét `--ignore-unfixed`, SBOM hợp lệ, 2 cảnh báo `trivy config`, `uses:` pin SHA |
| L2 (tùy chọn, thưởng) | [Buổi 19 – Thử thách L2](../../labs/week-10/session-19-challenge.md), [Buổi 20 – Phần nâng cao](../../labs/week-10/session-20-challenge.md) | 2 đến 3 giờ | Theo từng thử thách bên dưới |

## Bảng điểm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110).

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: deploy bằng script | 15 |
| Nhiệm vụ 2: bản thứ hai và rollback | 15 |
| Nhiệm vụ 3: rà soát permissions | 15 |
| Nhiệm vụ 4: quét image một lần | 10 |
| Nhiệm vụ 5: tìm secret lỡ commit | 5 |
| Nâng cao: quét sâu, SBOM, pin SHA | 10 |
| Chất lượng `README.md` và `report.md` | 10 |
| Câu hỏi kiểm tra kiến thức (3 điểm mỗi câu) | 15 |
| Vệ sinh và quy trình | 5 |
| L2 thử thách 1, 2, 3 (thưởng) | 4, 4, 2 |

Bảng điểm chi tiết dành cho người chấm nằm ở mentor; bạn chỉ cần đảm bảo mỗi tiêu chí hoàn thành dưới đây có evidence thật đi kèm.

## Quy ước làm việc

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Deploy chỉ dùng tag bất biến dạng `sha-abc1234` hoặc `v1.2.0`, không dùng `latest`. Pin phiên bản công cụ, ví dụ `aquasec/trivy:0.57.1`.
- Không mount `docker.sock` vào container quét. Dùng `docker save` rồi đọc file tar.
- Không expose máy ra Internet, không mở cổng nào cho runner.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.
- Thay `your-github-user` và tag trong ví dụ bằng giá trị thật của bạn. Không commit `.env`, mật khẩu, token.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Deploy image từ GHCR bằng script

Yêu cầu: tạo `compose.deploy.yaml` chạy image `club-api` và `club-web` từ GHCR theo hai biến `OWNER` và `TAG`; viết `deploy-local.sh` kiểm tra biến, từ chối `latest`, pull, chạy Compose, chờ health check `/ready` và chỉ ghi tag vào file trạng thái khi health check đạt; đặt `.env` và `.deploy/` vào `.gitignore`.

Tiêu chí hoàn thành:

- [ ] `docker compose -f compose.yaml -f compose.deploy.yaml config` trong evidence hiển thị đúng tên image GHCR kèm tag bạn deploy.
- [ ] Chạy `deploy-local.sh` với tag hợp lệ in dòng báo health OK và thoát mã 0 (evidence có cả `echo $?` hoặc tương đương).
- [ ] Chạy script với `TAG=latest` bị từ chối, thoát mã khác 0, và không có container nào bị đụng tới (evidence có `docker compose ps` trước và sau).
- [ ] `curl` tới `/health` và `/api/members` trong evidence trả kết quả đúng sau deploy.
- [ ] `git check-ignore -v .env .deploy` trong evidence cho thấy cả hai đều bị ignore.

### Nhiệm vụ 2. Deploy bản thứ hai và rollback

Yêu cầu: publish một bản thứ hai (thay đổi nhỏ, vô hại trong backend) để có hai tag khác nhau trên GHCR; deploy tag thứ hai, rồi rollback về tag đầu bằng một lệnh; ghi lại hai file trạng thái sau mỗi bước.

Tiêu chí hoàn thành:

- [ ] Evidence có `current-tag` và `previous-tag` sau lần deploy thứ hai, khớp hai tag thật trong tab Packages.
- [ ] Evidence có output `docker compose ps --format '{{.Service}} {{.Image}}'` sau rollback, cho thấy image đang chạy là tag đầu tiên.
- [ ] Evidence có log của lệnh rollback và trạng thái hai file sau rollback.
- [ ] `lab-19/report.md` mô tả bằng lời của bạn điều gì xảy ra nếu chạy rollback lần thứ hai liên tiếp và vì sao.

### Nhiệm vụ 3. Rà soát permissions của workflow

Yêu cầu: liệt kê mọi khối `permissions` trong `.github/workflows/`; tạo `demo-wide.yml` dùng `permissions: write-all`, commit, rồi sửa về `contents: read` ở một commit riêng; đặt Workflow permissions mặc định của repo ở mức chỉ đọc; lập bảng rà soát trong `lab-20/report.md`.

Tiêu chí hoàn thành:

- [ ] Evidence có output `grep -n -A3 "permissions" .github/workflows/*.yml`.
- [ ] `git log --oneline -- .github/workflows/demo-wide.yml` trong evidence có ít nhất hai commit, và `git diff` giữa hai commit cho thấy dòng `write-all` bị thay.
- [ ] Bảng rà soát phủ mọi workflow và job hiện có (quyền hiện có, quyền cần, lý do cụ thể).
- [ ] Có ảnh chụp trang Settings, Actions, General, mục Workflow permissions (ảnh chỉ để minh họa).

### Nhiệm vụ 4. Quét image một lần

Yêu cầu: xuất `club-api:1.0.0` ra file tar và quét bằng Trivy 0.57.1 (hoặc `docker scout cves`) với mức HIGH và CRITICAL, rồi đọc kết quả như một kỹ sư.

Tiêu chí hoàn thành:

- [ ] Evidence có output quét (các khối `Total:` theo từng loại hoặc danh sách CVE) kèm tổng số lỗ hổng theo mức độ.
- [ ] Evidence hoặc report nêu thời điểm quét, vì kết quả thay đổi theo cơ sở dữ liệu CVE.
- [ ] `report.md` phân tích ít nhất một lỗ hổng: thuộc gói hệ điều hành hay `node-pkg`, có bản vá không, có nằm trên đường xử lý request không.

### Nhiệm vụ 5. Tìm secret lỡ commit

Yêu cầu: chạy `git grep` tìm các từ khóa nhạy cảm trong repo (loại trừ file Markdown và lock) và giải thích từng dòng tìm thấy.

Tiêu chí hoàn thành:

- [ ] Evidence có output `git grep`.
- [ ] `report.md` liệt kê mỗi dòng và kết luận nó là tên biến, giá trị giả hay giá trị thật. Nếu có giá trị thật, ghi cách bạn xoay secret.

## Nâng cao (tùy chọn, 10 điểm)

Làm theo [Buổi 20 – Phần nâng cao](../../labs/week-10/session-20-challenge.md). Tiêu chí hoàn thành:

- [ ] Evidence có output quét thêm với `--ignore-unfixed` và một câu so sánh với lần quét thường.
- [ ] `evidence/club-api-sbom.cdx.json` là JSON hợp lệ (evidence có lệnh kiểm tra như `python3 -m json.tool`), `grep` chứng minh có `express` và `pg`, và có số thành phần đếm bằng lệnh.
- [ ] `report.md` phân tích hai cảnh báo của `trivy config /project/k8s`: nội dung, có đáng sửa không, sửa thế nào, và một câu vì sao severity không phải thước đo rủi ro duy nhất.
- [ ] `grep -n "uses:" .github/workflows/demo-wide.yml` trong evidence có ít nhất một dòng dạng `@` cộng SHA 40 ký tự hex và comment phiên bản; evidence có output `git ls-remote` bạn đã dùng; workflow chạy xanh sau khi pin (mã run trong `README.md`).

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 tính điểm thưởng tối đa 10. Chỉ làm khi đã hoàn thành L1.

### Thử thách 1. Deploy an toàn: chặn tag không tồn tại và nối workflow_dispatch

Bổ sung vào `deploy-local.sh` bước kiểm tra tag có tồn tại trên registry cho cả hai image, chạy trước mọi thao tác đụng vào stack đang chạy; viết workflow `deploy-local.yml` kích hoạt bằng `workflow_dispatch` với input `tag`, có `environment`, `concurrency` và `permissions` tối thiểu. Có thể chạy trên self-hosted runner (chỉ cho repo private, theo quy tắc an toàn của [Buổi 19 – Thử thách L2](../../labs/week-10/session-19-challenge.md)) hoặc dùng phương án thay thế; giải thích lựa chọn trong report.

- [ ] Evidence có một lần deploy với tag không tồn tại: thoát mã khác 0, thông báo rõ ràng, và `docker compose ps` trước/sau cho thấy stack cũ không bị đụng tới.
- [ ] Workflow có đủ `workflow_dispatch` với input `tag`, `environment`, `concurrency`, `permissions`; `inputs.tag` đi vào shell qua biến `env`, không nhúng trực tiếp trong `run:`.
- [ ] Có bằng chứng một lần chạy workflow (hoặc script trong phương án thay thế) thành công: log hoặc mã run.
- [ ] `lab-19/report.md` nêu rủi ro của self-hosted runner và cách bạn giảm thiểu.

### Thử thách 2. Workflow bảo mật tự động

Viết `.github/workflows/security.yml` chạy trên pull request và push vào nhánh chính, quyền cấp workflow là `contents: read`; gồm kiểm tra dependency cho pull request (hoặc phương án thay thế), build rồi quét image với ngưỡng bạn tự chọn, và sinh SBOM tải lên làm artifact lưu 30 ngày; mọi action bên thứ ba pin theo SHA.

- [ ] File workflow trong `source/` đáp ứng các yêu cầu trên; `grep` trong evidence chứng minh không có `${{ }}` chứa dữ liệu người dùng bên trong `run:`.
- [ ] Có một lần chạy xanh và SBOM xuất hiện trong artifact (mã run hoặc ảnh danh sách artifact kèm `retention-days` trong source).
- [ ] `report.md` giải thích ngưỡng đã chọn (mức severity, có dùng `--ignore-unfixed` hay không) và đánh đổi của lựa chọn đó.

### Thử thách 3. Điều tra security gate

Trên một nhánh thử nghiệm, đổi base image của backend sang `node:18-alpine` và quan sát gate của bạn; điều tra theo triệu chứng, xác định nguồn lỗ hổng, kiểm tra có bản vá không, rồi đưa về trạng thái xanh bằng cách xử lý nguyên nhân thay vì tắt gate.

- [ ] Evidence có log quét trước và sau khi xử lý, kèm tổng số lỗ hổng mỗi lần.
- [ ] `report.md` có báo cáo 5 phần: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.
- [ ] Nếu dùng `.trivyignore`, mỗi dòng có lý do và ngày xem xét lại; nếu không dùng, nêu rõ vì sao.

## Bằng chứng cần nộp

Cấu trúc theo [mẫu bài lab](../../templates/lab-template.md), tách làm hai thư mục:

```text
lab-19/
├── README.md              (7 câu theo template, ghi rõ đã làm L1 hay L2)
├── source/
│   ├── compose.deploy.yaml
│   ├── deploy-local.sh
│   ├── .gitignore
│   └── deploy-local.yml   (chỉ khi làm L2 thử thách 1)
├── screenshots/
├── evidence/
│   └── command-output.txt
└── report.md              (rollback, giới hạn với database, rủi ro runner nếu làm L2)
lab-20/
├── README.md
├── source/
│   ├── demo-wide.yml      (bản đã sửa; đã pin SHA nếu làm phần nâng cao)
│   └── security.yml       (chỉ khi làm L2 thử thách 2)
├── screenshots/
│   └── workflow-permissions.png
├── evidence/
│   ├── command-output.txt
│   └── club-api-sbom.cdx.json   (phần nâng cao)
└── report.md              (bảng permissions, phân tích quét, git grep, 5 câu hỏi, báo cáo L2)
```

Không đưa file tar của image, `.env` hay thư mục `.deploy/` vào repo (ví dụ `lab-20/scan-tmp/` phải nằm trong `.gitignore`). Bài của bạn sẽ được kiểm chứng bằng cách đọc evidence, mở workflow và script, và đối chiếu với trạng thái thật trên GitHub, nên hãy để output thật, không chỉnh tay.

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh hoặc cấu hình nếu cần) trong `lab-20/report.md`.

1. Khác biệt giữa Continuous Delivery và Continuous Deployment là gì? Khóa học này chọn loại nào và vì sao việc deploy vào máy local phải là hành động chủ động?
2. Vì sao script chỉ ghi `current-tag` sau khi health check đạt, và vì sao dùng `/ready` thay vì `/health` để chờ? Rollback code có đưa dữ liệu trong database về như cũ không?
3. Khi workflow khai báo `permissions:` chỉ có `contents: read`, các quyền khác như `packages` có giá trị gì? Job nào trong pipeline của bạn thật sự cần `packages: write` và vì sao nên khai báo ở cấp job?
4. Vì sao pin action theo SHA an toàn hơn theo tag? Nhược điểm là gì và khắc phục thế nào? Vì sao tiêu đề của một pull request không được nhúng trực tiếp vào `run:`?
5. SBOM giúp trả lời câu hỏi gì khi một CVE mới được công bố? Image quét sạch hôm qua nhưng hôm nay báo HIGH dù không ai đổi code: giải thích, và pipeline nên bổ sung gì.

## Quy trình nộp

1. Trong repository cá nhân (ví dụ `devops-labs`), tạo nhánh mới, ví dụ `week-10`.
2. Thêm hai thư mục `lab-19/` và `lab-20/` theo cấu trúc ở trên, commit với thông điệp rõ ràng. Riêng `demo-wide.yml` cần hai commit riêng (rộng quyền, rồi đã sửa).
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm theo bảng điểm trên PR và để lại nhận xét.
6. **Hạn nộp:** trước buổi đầu tiên của tuần 11.

## Checklist trước khi nộp

- [ ] `lab-19/` và `lab-20/` đúng cấu trúc theo mẫu bài lab
- [ ] `README.md` mỗi thư mục trả lời đủ 7 câu và ghi rõ đã làm L1 hay L2
- [ ] `evidence/command-output.txt` được sinh bằng `tee`, chứa lệnh và output thật của cả 5 nhiệm vụ
- [ ] Deploy bằng tag bất biến, không có `latest`; hai tag trong evidence khớp tab Packages
- [ ] `deploy-local.sh` chỉ ghi `current-tag` sau khi health check đạt
- [ ] `demo-wide.yml` có hai commit riêng, bản cuối dùng `contents: read`
- [ ] `report.md` có bảng permissions, phân tích quét, phân loại `git grep` và câu trả lời 5 câu hỏi
- [ ] Không commit `.env`, `.deploy/`, file tar, mật khẩu, token, private key; đã chạy lại `git grep`
- [ ] Nếu làm phần nâng cao hoặc L2: đủ evidence theo từng tiêu chí ở trên
- [ ] PR đã được ít nhất một bạn review và bạn đã phản hồi
