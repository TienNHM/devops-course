# Bài tập tuần 10 – CD & Pipeline Security

> **Tóm tắt:** Viết script deploy image theo tag bất biến từ GHCR lên máy local có health check và rollback, rồi rà soát bảo mật pipeline: thu hẹp quyền của `GITHUB_TOKEN`, quét image bằng Trivy (hoặc Docker Scout), sinh SBOM và pin action theo SHA. Mọi kết quả phải kiểm chứng được qua source, log và file sinh ra, không chỉ ảnh chụp màn hình.

**Phạm vi:** [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md) và [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Bài nộp nằm ở hai thư mục `lab-19/` và `lab-20/` trong repository cá nhân.

## Bối cảnh

Đến tuần 9 bạn đã có pipeline CI và workflow publish đẩy `club-api` và `club-web` lên GHCR. Tuần này mentor muốn biết bạn có đưa được một bản build lên môi trường chạy một cách lặp lại được, quay lại được khi hỏng, và có biết pipeline của mình đang cho phép những gì hay không.

Bài tập mô phỏng việc của một người phụ trách release của CLB: nhận một tag image, deploy lên máy demo local, xử lý khi bản mới không khỏe, sau đó rà soát để pipeline không trở thành điểm yếu của cả dự án. Bạn chỉ cần dùng kiến thức của Buổi 19 và 20.

Quy ước làm việc:

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Deploy chỉ dùng tag bất biến dạng `sha-abc1234` hoặc `v1.2.0`, không dùng `latest`. Pin phiên bản công cụ, ví dụ `aquasec/trivy:0.57.1`.
- Không mount `docker.sock` vào container quét. Dùng `docker save` rồi đọc file tar.
- Không expose máy ra Internet, không mở cổng nào cho runner.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.
- Thay `your-github-user` và tag trong ví dụ bằng giá trị thật của bạn. Không commit `.env`, mật khẩu, token.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Deploy image từ GHCR bằng script

Dựng quy trình deploy một lệnh cho stack của starter-project.

Yêu cầu:

- Tạo `compose.deploy.yaml` (override) để Compose chạy image `club-api` và `club-web` từ GHCR theo hai biến `OWNER` và `TAG`, thay vì build tại chỗ.
- Viết `deploy-local.sh` thực hiện: kiểm tra biến bắt buộc, từ chối tag `latest`, pull image, chạy Compose, chờ health check bằng endpoint `/ready`, và chỉ ghi tag vào file trạng thái khi health check đạt.
- Đặt `.env` và `.deploy/` vào `.gitignore`.

Tiêu chí hoàn thành:

- [ ] `docker compose -f compose.yaml -f compose.deploy.yaml config` trong evidence hiển thị đúng tên image GHCR kèm tag bạn deploy.
- [ ] Chạy `deploy-local.sh` với tag hợp lệ in dòng báo health OK và thoát mã 0 (evidence có cả lệnh `echo $?` hoặc tương đương).
- [ ] Chạy script với `TAG=latest` bị từ chối, thoát mã khác 0, và không có container nào bị đụng tới (evidence có `docker compose ps` trước và sau).
- [ ] `curl` tới `/health` và `/api/members` trong evidence trả kết quả đúng sau deploy.
- [ ] `git check-ignore -v .env .deploy` trong evidence cho thấy cả hai đều bị ignore.

### Nhiệm vụ 2. Deploy bản thứ hai và rollback

Chứng minh bạn quay lại được bản trước bằng đúng cơ chế đã dùng để deploy.

Yêu cầu:

- Publish một bản thứ hai (đổi một thay đổi nhỏ, vô hại trong backend, push, chờ workflow publish xong) để có hai tag khác nhau trên GHCR.
- Deploy tag thứ hai, rồi rollback về tag đầu bằng một lệnh.
- Ghi lại nội dung hai file trạng thái sau mỗi bước.

Tiêu chí hoàn thành:

- [ ] Evidence có `current-tag` và `previous-tag` sau lần deploy thứ hai, với giá trị khớp hai tag thật trong tab Packages.
- [ ] Evidence có output `docker compose ps --format '{{.Service}} {{.Image}}'` sau rollback, cho thấy image đang chạy là tag đầu tiên.
- [ ] Evidence có log của lệnh rollback và trạng thái hai file sau rollback.
- [ ] `lab-19/report.md` mô tả bằng lời của bạn điều gì xảy ra nếu chạy rollback lần thứ hai liên tiếp và vì sao.

### Nhiệm vụ 3. Rà soát permissions của workflow

Đưa quyền của `GITHUB_TOKEN` về mức tối thiểu và lập hồ sơ rà soát.

Yêu cầu:

- Liệt kê mọi khối `permissions` trong `.github/workflows/` của repo cá nhân.
- Tạo workflow thử nghiệm `demo-wide.yml` dùng `permissions: write-all`, commit, rồi sửa về `contents: read` ở một commit riêng.
- Đặt Workflow permissions mặc định của repo ở mức chỉ đọc.
- Lập bảng rà soát trong `lab-20/report.md` cho từng workflow và từng job: quyền hiện có, quyền thật sự cần, lý do.

Tiêu chí hoàn thành:

- [ ] Evidence có output `grep -n -A3 "permissions" .github/workflows/*.yml`.
- [ ] `git log --oneline -- .github/workflows/demo-wide.yml` trong evidence có ít nhất hai commit, và `git diff` giữa hai commit cho thấy dòng `write-all` bị thay.
- [ ] Bảng rà soát trong `report.md` phủ mọi workflow và job hiện có; mỗi hàng có cột lý do cụ thể, không ghi chung chung.
- [ ] Có ảnh chụp trang Settings, Actions, General, mục Workflow permissions (ảnh chỉ để minh họa, nội dung kiểm chứng nằm ở các mục trên).

### Nhiệm vụ 4. Quét image và sinh SBOM

Đọc kết quả quét như một kỹ sư, không chỉ chạy lệnh.

Yêu cầu:

- Xuất `club-api:1.0.0` ra file tar và quét bằng Trivy 0.57.1 (hoặc `docker scout cves`) với mức HIGH và CRITICAL. Quét thêm một lần với `--ignore-unfixed` và so sánh.
- Sinh SBOM CycloneDX cho image và xác nhận trong đó có gói `express` và `pg`.
- Quét thư mục `starter-project/k8s` bằng `trivy config`, chọn hai cảnh báo để phân tích.

Tiêu chí hoàn thành:

- [ ] Evidence có output quét (các khối `Total:` theo từng loại hoặc danh sách CVE) và dòng cho biết tổng số lỗ hổng theo mức độ, ở cả hai chế độ (có và không có `--ignore-unfixed`).
- [ ] `evidence/club-api-sbom.cdx.json` là JSON hợp lệ (evidence có lệnh kiểm tra, ví dụ `python3 -m json.tool` hoặc `jq .`) và `grep` trong evidence chứng minh có `express` và `pg`.
- [ ] Evidence có số thành phần của SBOM đếm bằng lệnh.
- [ ] `report.md` có phân tích hai cảnh báo cấu hình: nội dung cảnh báo, có đáng sửa không, sửa thế nào, và một câu giải thích vì sao severity không phải thước đo rủi ro duy nhất.
- [ ] Bạn nêu rõ trong evidence hoặc report thời điểm quét, vì kết quả thay đổi theo cơ sở dữ liệu CVE.

### Nhiệm vụ 5. Pin action theo SHA và tìm secret lỡ commit

Siết chặt chuỗi cung ứng của workflow và kiểm tra vệ sinh secret.

Yêu cầu:

- Tra SHA đầy đủ 40 ký tự của một tag action bằng `git ls-remote`, rồi pin action đó trong `demo-wide.yml` kèm comment phiên bản.
- Chạy `git grep` tìm các từ khóa nhạy cảm trong repo (loại trừ file Markdown và lock) và giải thích từng dòng tìm thấy.

Tiêu chí hoàn thành:

- [ ] `grep -n "uses:" .github/workflows/demo-wide.yml` trong evidence có ít nhất một dòng dạng `@` cộng SHA 40 ký tự hex và comment phiên bản.
- [ ] Evidence có output `git ls-remote` bạn đã dùng để tra SHA.
- [ ] Workflow `demo-wide.yml` chạy xanh trên GitHub sau khi pin (link hoặc mã run trong `README.md`).
- [ ] Evidence có output `git grep`; `report.md` liệt kê mỗi dòng tìm thấy và kết luận nó là tên biến hay là giá trị thật. Nếu có giá trị thật, ghi cách bạn xoay secret.

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 tính điểm thưởng tối đa 10. Chỉ làm khi đã hoàn thành L1.

### Thử thách 1. Deploy an toàn: chặn tag không tồn tại và nối workflow_dispatch

Yêu cầu:

- Bổ sung vào `deploy-local.sh` bước kiểm tra tag có tồn tại trên registry cho cả hai image, chạy trước mọi thao tác đụng vào stack đang chạy.
- Viết workflow `deploy-local.yml` kích hoạt bằng `workflow_dispatch` với input `tag`, khai báo `environment`, `concurrency` chặn hai lần deploy chạy chồng nhau và `permissions` tối thiểu. Có thể chạy trên self-hosted runner (chỉ cho repo private, theo quy tắc an toàn của Buổi 19) hoặc dùng phương án thay thế nêu trong bài lab; giải thích lựa chọn trong report.

Tiêu chí hoàn thành:

- [ ] Evidence có một lần deploy với tag không tồn tại: thoát mã khác 0, thông báo rõ ràng, và `docker compose ps` trước/sau cho thấy stack cũ không bị đụng tới.
- [ ] Workflow có đủ `workflow_dispatch` với input `tag`, `environment`, `concurrency`, `permissions`; giá trị `inputs.tag` đi vào shell qua biến `env`, không nhúng trực tiếp trong `run:`.
- [ ] Có bằng chứng một lần chạy workflow (hoặc lần chạy script trong phương án thay thế) thành công: log hoặc mã run.
- [ ] `lab-19/report.md` nêu rủi ro của self-hosted runner và cách bạn giảm thiểu.

### Thử thách 2. Workflow bảo mật tự động

Yêu cầu:

- Viết `.github/workflows/security.yml` chạy trên pull request và push vào nhánh chính với quyền cấp workflow là `contents: read`.
- Workflow gồm: kiểm tra dependency cho pull request (hoặc phương án thay thế nếu repo không hỗ trợ), build rồi quét image với ngưỡng bạn tự chọn, và sinh SBOM tải lên làm artifact lưu 30 ngày.
- Mọi action bên thứ ba được pin theo SHA.

Tiêu chí hoàn thành:

- [ ] File workflow trong `source/` đáp ứng các yêu cầu trên; `grep` trong evidence chứng minh không có `${{ }}` chứa dữ liệu người dùng bên trong `run:`.
- [ ] Có một lần chạy xanh và SBOM xuất hiện trong artifact (mã run hoặc ảnh chụp danh sách artifact kèm `retention-days` trong source).
- [ ] `report.md` giải thích ngưỡng đã chọn (mức severity, có dùng `--ignore-unfixed` hay không) và đánh đổi của lựa chọn đó.

### Thử thách 3. Điều tra security gate

Yêu cầu:

- Trên một nhánh thử nghiệm, đổi base image của backend sang `node:18-alpine` và quan sát gate của bạn.
- Điều tra theo triệu chứng: gate đỏ (hoặc xanh nếu thời điểm quét chưa có CVE phù hợp), xác định nguồn lỗ hổng, kiểm tra có bản vá không, rồi đưa về trạng thái xanh bằng cách xử lý nguyên nhân thay vì tắt gate.

Tiêu chí hoàn thành:

- [ ] Evidence có log quét trước và sau khi xử lý, kèm tổng số lỗ hổng mỗi lần.
- [ ] `report.md` có báo cáo 5 phần: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.
- [ ] Nếu bạn dùng `.trivyignore`, mỗi dòng có lý do và ngày xem xét lại; nếu không dùng, nêu rõ vì sao.

## Bằng chứng cần nộp

Cấu trúc theo [templates/lab-template.md](../../templates/lab-template.md), tách làm hai thư mục:

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
└── report.md              (rollback, giới hạn với database, câu hỏi kiểm tra)
lab-20/
├── README.md
├── source/
│   ├── demo-wide.yml      (bản đã sửa và đã pin SHA)
│   └── security.yml       (chỉ khi làm L2 thử thách 2)
├── screenshots/
│   └── workflow-permissions.png
├── evidence/
│   ├── command-output.txt
│   └── club-api-sbom.cdx.json
└── report.md              (bảng permissions, 2 cảnh báo cấu hình, câu hỏi kiểm tra, báo cáo L2)
```

Không đưa file tar của image, `.env` hay thư mục `.deploy/` vào repo (ví dụ `lab-20/scan-tmp/` phải nằm trong `.gitignore`).

Evidence cụ thể theo nhiệm vụ:

| Nhiệm vụ | Evidence bắt buộc |
| --- | --- |
| 1 | `docker compose config` đã hợp nhất, log deploy thành công, lần chạy `latest` bị từ chối, `curl` hai endpoint, `git check-ignore` |
| 2 | Log deploy lần hai, hai file trạng thái, log rollback, `docker compose ps --format` |
| 3 | `grep permissions`, `git log` và `git diff` của `demo-wide.yml`, bảng rà soát trong `report.md` |
| 4 | Output quét hai chế độ, SBOM kèm lệnh kiểm tra JSON và đếm thành phần, phân tích hai cảnh báo cấu hình |
| 5 | `git ls-remote`, dòng `uses:` đã pin, mã run xanh, `git grep` và diễn giải |
| L2 | Output mà từng tiêu chí L2 yêu cầu |

Mentor kiểm chứng bằng cách đọc evidence, mở workflow và script trong `source/`, chạy lại lệnh kiểm tra trên máy mentor (ví dụ `python3 -m json.tool` cho SBOM, `shellcheck` hoặc đọc `deploy-local.sh`) và đối chiếu với trạng thái thật trên GitHub (lịch sử commit, lần chạy workflow, tab Packages). Output giống hệt bài của bạn khác, hoặc có dấu hiệu chỉnh tay, sẽ bị hỏi lại trực tiếp.

## Barem chấm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110).

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: deploy bằng script | Override đúng, script có kiểm tra biến, từ chối `latest`, health check `/ready`, ghi trạng thái sau khi khỏe; có evidence đầy đủ | Script thiếu health check hoặc ghi trạng thái trước khi khỏe, hoặc không chứng minh được việc từ chối `latest` | 15 |
| Nhiệm vụ 2: bản thứ hai và rollback | Hai tag thật, hai file trạng thái đúng, image sau rollback đúng tag, giải thích đúng hành vi rollback lần hai | Rollback bằng cách sửa tay, tag không khớp Packages, hoặc giải thích sai | 15 |
| Nhiệm vụ 3: rà soát permissions | Có hai commit riêng, bảng rà soát phủ mọi job với lý do cụ thể, cài đặt repo ở mức chỉ đọc | Chỉ một commit, bảng thiếu job hoặc lý do chung chung | 15 |
| Nhiệm vụ 4: quét image và SBOM | Quét hai chế độ, SBOM hợp lệ chứa `express` và `pg`, phân tích đúng hai cảnh báo cấu hình | SBOM không phải JSON hợp lệ, thiếu một chế độ quét, hoặc không phân tích cảnh báo | 15 |
| Nhiệm vụ 5: pin SHA và rà secret | SHA 40 ký tự thật kèm comment, workflow xanh, diễn giải đúng từng dòng `git grep` | SHA sai hoặc là placeholder, không giải thích kết quả `git grep` | 10 |
| Chất lượng `README.md` và `report.md` | 7 câu theo template, ngắn gọn, đúng, nêu nguyên nhân gốc và giới hạn của giải pháp | Sao chép đề bài, trả lời chung chung | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng ý và có ví dụ lệnh hoặc cấu hình khi cần (3 điểm mỗi câu) | Sai hoặc bỏ trống | 15 |
| Vệ sinh và quy trình | Không có secret, `.env`, file tar trong repo; PR đúng quy trình, có reviewer | Commit secret hoặc `.env`, thiếu review | 5 |
| L2 thử thách 1 (thưởng) | Tag không tồn tại bị chặn trước khi đụng stack, workflow đủ các khóa an toàn, đầu vào qua `env` | Chặn sau khi đã dừng stack, hoặc nhúng `inputs.tag` thẳng vào `run:` | 4 |
| L2 thử thách 2 (thưởng) | Workflow xanh, quyền tối thiểu, SBOM trong artifact, action bên thứ ba pin SHA, giải thích ngưỡng | Quyền rộng, thiếu SBOM, hoặc không giải thích ngưỡng | 4 |
| L2 thử thách 3 (thưởng) | Báo cáo 5 phần có bằng chứng quét trước và sau, xử lý nguyên nhân thay vì tắt gate | Chỉ nâng ngưỡng hoặc xóa bước quét để gate xanh | 2 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh hoặc cấu hình nếu cần) trong `lab-20/report.md`.

1. Khác biệt giữa Continuous Delivery và Continuous Deployment là gì? Khóa học này chọn loại nào và vì sao việc deploy vào máy local phải là hành động chủ động?
2. Vì sao script chỉ ghi `current-tag` sau khi health check đạt, và vì sao dùng `/ready` thay vì `/health` để chờ? Rollback code có đưa dữ liệu trong database về như cũ không?
3. Khi workflow khai báo `permissions:` chỉ có `contents: read`, các quyền khác như `packages` có giá trị gì? Job nào trong pipeline của bạn thật sự cần `packages: write` và vì sao nên khai báo ở cấp job?
4. Vì sao pin action theo SHA an toàn hơn theo tag? Nhược điểm là gì và khắc phục thế nào? Vì sao tiêu đề của một pull request không được nhúng trực tiếp vào `run:`?
5. SBOM giúp trả lời câu hỏi gì khi một CVE mới được công bố? Image quét sạch hôm qua nhưng hôm nay báo HIGH dù không ai đổi code: giải thích, và pipeline nên bổ sung gì.

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình thay cho output lệnh, hoặc evidence không có lệnh đi kèm.
- Deploy bằng `latest` hoặc tag không khớp tag thật trong tab Packages.
- Ghi file trạng thái trước khi health check đạt, hoặc rollback bằng cách sửa tay `compose.yaml`.
- Để placeholder như `SHA_DAY_DU_40_KY_TU` trong workflow, hoặc SHA bị cắt ngắn.
- Dùng `permissions: write-all`, hoặc không khai báo `permissions` và dựa vào mặc định của repo.
- Nhúng `${{ inputs.tag }}` hoặc dữ liệu do người dùng kiểm soát trực tiếp vào `run:`.
- Mount `docker.sock` vào container quét để cho nhanh.
- Commit `.env`, file `.deploy/`, file tar của image, token hoặc mật khẩu; in secret ra log.
- Đăng ký self-hosted runner cho repo public.
- Làm trong `/mnt/c` hoặc chạy lệnh trên PowerShell nhưng ghi là WSL.
- Tắt hoặc xóa bước quét để gate xanh thay vì xử lý nguyên nhân.
- Chỉ mô tả "đã sửa được" mà không nêu nguyên nhân gốc và cách xác minh.
- Sửa tay file evidence cho "đẹp" hơn thực tế.

## Quy trình nộp

1. Trong repository cá nhân (ví dụ `devops-labs`), tạo nhánh mới, ví dụ `week-10`.
2. Thêm hai thư mục `lab-19/` và `lab-20/` theo cấu trúc ở trên, commit với thông điệp rõ ràng. Riêng `demo-wide.yml` cần hai commit riêng (trạng thái rộng quyền, rồi trạng thái đã sửa).
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm theo barem trên PR và để lại nhận xét.
6. **Hạn nộp:** trước buổi đầu tiên của tuần 11.

## Checklist trước khi nộp

- [ ] `lab-19/` và `lab-20/` đúng cấu trúc theo `templates/lab-template.md`
- [ ] `README.md` mỗi thư mục trả lời đủ 7 câu và ghi rõ đã làm L1 hay L2
- [ ] `evidence/command-output.txt` được sinh bằng `tee`, chứa lệnh và output thật của cả 5 nhiệm vụ
- [ ] Deploy bằng tag bất biến, không có `latest`; hai tag trong evidence khớp tab Packages
- [ ] `deploy-local.sh` chỉ ghi `current-tag` sau khi health check đạt
- [ ] `demo-wide.yml` có hai commit riêng, bản cuối dùng `contents: read` và action pin theo SHA 40 ký tự
- [ ] `club-api-sbom.cdx.json` là JSON hợp lệ và có `express`, `pg`
- [ ] `report.md` có bảng permissions, phân tích hai cảnh báo cấu hình và câu trả lời 5 câu hỏi
- [ ] Không commit `.env`, `.deploy/`, file tar, mật khẩu, token, private key; đã chạy lại `git grep`
- [ ] Nếu làm L2: workflow `deploy-local.yml` và `security.yml` đúng yêu cầu, báo cáo 5 phần của thử thách 3
- [ ] PR đã được ít nhất một bạn review và bạn đã phản hồi
