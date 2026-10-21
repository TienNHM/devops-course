# Bài tập tuần 8 – CI/CD Fundamentals và GitHub Actions

> **Tóm tắt:** Thiết kế pipeline Test, Build, Publish, Deploy cho Club API, chạy bản giả lập bằng shell script để chứng minh gate dừng đúng lúc, rồi viết workflow GitHub Actions thật chạy `npm ci` và `npm test` khi push và pull request, có cache và matrix. Mọi kết quả phải kiểm chứng được qua source, log của script và log của run trên GitHub, không chỉ ảnh chụp màn hình.

**Phạm vi:** [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md) và [Buổi 16 – GitHub Actions Basics](../../labs/week-08/session-16.md). Bài nộp nằm ở hai thư mục `lab-15/` và `lab-16/` trong repository cá nhân.

## Bối cảnh

Từ tuần 9 nhóm capstone sẽ làm việc chung trên một repo. Khi 4 người cùng đẩy code, câu hỏi "bản này có chạy được không" không thể dựa vào máy của từng người. Mentor cần chắc rằng bạn biết thiết kế một pipeline có điều kiện dừng rõ ràng, và biết biến thiết kế đó thành workflow chạy được trên runner sạch của GitHub.

Bài tập tuần này có hai nửa. Nửa đầu (Buổi 15) là thiết kế và giả lập pipeline trên máy. Nửa sau (Buổi 16) là viết workflow thật cho backend của Club API và đọc log khi nó chạy xanh hoặc đỏ. Bạn chỉ cần dùng kiến thức của hai buổi này.

Quy ước làm việc:

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Source là backend của `starter-project/` đã copy vào repo cá nhân (không copy `node_modules`). Không sửa mã backend, chỉ sửa test khi bài yêu cầu làm test đỏ và phải hoàn tác.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.
- Pin phiên bản action (ví dụ `actions/checkout@v4`, `actions/setup-node@v4`) và đặt `permissions` tối thiểu. Không đưa token, mật khẩu hay file `.env` vào repo.

## Nhiệm vụ L1 (bắt buộc)

### Nhiệm vụ 1. Thiết kế và giả lập pipeline (lab-15)

Biến ý tưởng "Test, Build, Publish, Deploy" thành bản thiết kế cụ thể rồi chạy thử phần đầu của nó trên máy.

Yêu cầu:

- Vẽ sơ đồ pipeline có trigger, 4 stage nối tiếp và nhánh "dừng, báo lỗi". Mỗi stage ghi lệnh chính, output (artifact) và điều kiện qua. Lưu file nguồn (`.drawio` hoặc `.mmd`) vào `lab-15/source/` và ảnh xuất ra `lab-15/screenshots/pipeline.png`.
- Viết `lab-15/source/pipeline-spec.md` có bảng đủ 4 stage với các cột: lệnh chính, runner cần, input, output, điều kiện qua. Ghi thêm cách đặt tag image, secret nào cần (chỉ tên, không giá trị) và stage nào có thể chạy song song.
- Viết `lab-15/source/run-pipeline.sh` dùng `set -euo pipefail`, chạy các stage test, build, kiểm tra artifact và in dòng `PIPELINE OK` ở cuối. Chạy script và lưu log.

Tiêu chí hoàn thành:

- [ ] `pipeline-spec.md` có đủ 4 stage, mỗi stage không để trống ô nào.
- [ ] `evidence/command-output.txt` có đủ các dòng `=== STAGE: test ===`, `=== STAGE: build ===`, `# fail 0` và `PIPELINE OK`.
- [ ] Log cho thấy tên image kèm tag cụ thể (không chỉ `latest`) lấy từ `docker image inspect`.
- [ ] Mỗi mũi tên trong sơ đồ cho biết cái gì chảy qua nó (artifact hoặc kết quả).

### Nhiệm vụ 2. Chứng minh gate dừng khi test fail (lab-15)

Một gate chưa được thử làm fail thì chưa được tin.

Yêu cầu:

- Sao lưu `tests/health.test.js`, cố tình sửa một assertion cho đỏ, chạy lại `run-pipeline.sh` và ghi `exit code` của script.
- Hoàn tác file test từ bản sao lưu và chạy `npm test` để chứng minh đã xanh lại.
- Giải thích trong `lab-15/report.md` bằng 2 đến 3 câu vì sao stage test phải đứng trước stage build.

Tiêu chí hoàn thành:

- [ ] Evidence có lần chạy đỏ: stage `test` báo `# fail` lớn hơn 0, không có dòng `=== STAGE: build ===` sau đó và `exit code` khác 0.
- [ ] Evidence có lần `npm test` xanh sau khi hoàn tác (`# fail 0`).
- [ ] `git diff` của thư mục `lab-15/source/starter-project/backend/tests` trống tại thời điểm nộp (file test đã trả về nguyên trạng).
- [ ] `report.md` nêu đúng nguyên tắc fail fast và nêu được thứ bị lãng phí nếu build trước test.

### Nhiệm vụ 3. Workflow CI thật chạy test (lab-16)

Chuyển bản thiết kế thành workflow GitHub Actions cho backend.

Yêu cầu:

- Copy `starter-project/backend` vào `lab-16/source/` (kèm `package-lock.json`), chạy `npm ci` và `npm test` cục bộ, lưu log vào evidence.
- Viết `.github/workflows/ci.yml` chạy khi `push` (nhánh chính của repo bạn) và `pull_request`, có `permissions: contents: read`, các step checkout, setup-node với Node 22, `npm ci`, `npm test` đều đặt đúng `working-directory`.
- Đẩy lên GitHub, đạt ít nhất một run xanh. Lưu log run: tải từ trang run (Download log archive) hoặc dùng `gh run view` nếu máy bạn đã cài GitHub CLI và đăng nhập. Chép phần log của step `Run tests` vào evidence.
- Chép `ci.yml` vào `lab-16/source/ci.yml.copy` vì file thật nằm ngoài thư mục lab.

Tiêu chí hoàn thành:

- [ ] `ci.yml` đúng cú pháp YAML (thụt lề 2 dấu cách), đủ 4 step, có `permissions` và action được pin theo phiên bản.
- [ ] Evidence có log local (`npm ci`, `npm test` với `# fail 0`) và `git log --oneline` chứa commit thêm workflow.
- [ ] `report.md` có link tới run xanh và đoạn log của step `Run tests` chứa `# pass` và `# fail 0`.
- [ ] `report.md` giải thích vì sao phải có step checkout và vì sao `working-directory` là `lab-16/source`.

### Nhiệm vụ 4. Bật cache và tách job (lab-16)

Làm pipeline nhanh hơn và tách phần kiểm tra độc lập khỏi phần test.

Yêu cầu:

- Bật `cache: npm` trong `actions/setup-node@v4` kèm `cache-dependency-path` trỏ đúng tới `lab-16/source/package-lock.json`.
- Chạy workflow hai lần (lần hai bằng Re-run all jobs hoặc một commit mới không đổi lock file) và so sánh log step Setup Node.js của hai lần.
- Thêm job thứ hai tên `validate` kiểm tra `package.json` đọc được bằng JSON, chạy song song với job `test`.

Tiêu chí hoàn thành:

- [ ] Log lần chạy đầu và lần chạy hai của step Setup Node.js đều có trong `report.md`; lần hai có dòng cho thấy cache được khôi phục.
- [ ] Trang run hiển thị ít nhất hai job `test` và `validate` đều xanh, không có `needs` giữa hai job này.
- [ ] `report.md` giải thích bằng lời của bạn artifact khác cache ở điểm nào, kèm ví dụ của Club API.
- [ ] Có ghi lại thời gian của step `npm ci` ở hai lần chạy (số giây thật, chênh lệch nhỏ vẫn chấp nhận).

## Nhiệm vụ L2 (nâng cao / Advanced Challenge)

L2 tính điểm thưởng tối đa 10. Chỉ làm khi đã hoàn thành L1. Mentor chỉ nhận triệu chứng, bạn phải tự tìm nguyên nhân gốc.

### Thử thách 1. Matrix, `needs` và job build-image

Mở rộng workflow để chạy trên nhiều phiên bản Node.js và chỉ build image khi mọi kiểm tra đã xanh.

Tiêu chí hoàn thành:

- [ ] Job `test` dùng `strategy.matrix` với tối thiểu hai phiên bản Node.js đang được hỗ trợ và đặt `fail-fast: false`.
- [ ] Có job `build-image` với `needs` trỏ tới `test` và `validate`; run xanh cho thấy đủ ba nhóm job và `build-image` chạy sau cùng.
- [ ] Chứng minh `needs` hoạt động: ghi lại một run mà `test` đỏ làm `build-image` bị bỏ qua (skipped), kèm link run và ảnh chụp.
- [ ] `report.md` nêu số job do matrix tạo ra và vì sao `fail-fast: false` hữu ích khi học.

### Thử thách 2. Pull request đỏ và Tình huống 06

Tạo nhánh `feature/break-test`, làm một test đỏ, mở pull request để thấy check đỏ, sau đó sửa. Xử lý [Tình huống 06 – Workflow fail](../../examples/troubleshooting/scenario-06/README.md) theo báo cáo 5 phần.

Tiêu chí hoàn thành:

- [ ] Có link PR cho thấy check đỏ ở bước chạy test, và run xanh sau khi sửa trên cùng PR.
- [ ] `report.md` có mục báo cáo 5 phần của tình huống 06: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.
- [ ] Phần xác minh trích đúng dòng log đầu tiên báo lỗi và nói rõ lỗi xảy ra trước hay trong lệnh `npm`.
- [ ] Có bằng chứng tái hiện trên bản clone sạch (lệnh `git clone` vào thư mục mới và kết quả `npm ci` hoặc `git ls-files`).

### Thử thách 3. Môi trường và build một lần

Tiêu chí hoàn thành:

- [ ] `lab-15/source/environments.md` có bảng 3 môi trường dev, staging, production với trigger deploy, gate (test nào, ai duyệt) và cách rollback.
- [ ] `report.md` chọn Continuous Delivery hoặc Continuous Deployment cho production của Club API, có ít nhất 3 lý do dựa trên rủi ro và độ phủ test hiện có.
- [ ] `run-pipeline.sh` đã sửa để image chỉ build một lần; evidence có đúng một lệnh `docker build` dù pipeline "deploy" cho cả 3 môi trường (script phải in lệnh ra log, ví dụ `echo "+ docker build ..."`, rồi kiểm tra bằng `grep -c`).
- [ ] Đề xuất 2 gate bổ sung và nêu mỗi gate chặn loại lỗi nào.

## Bằng chứng cần nộp

Cấu trúc theo [templates/lab-template.md](../../templates/lab-template.md), tách làm hai thư mục:

```text
lab-15/
├── README.md              (7 câu theo template, ghi rõ đã làm L1 hay L2)
├── source/
│   ├── starter-project/   (bản sao, không có node_modules)
│   ├── pipeline.mmd       (hoặc pipeline.drawio)
│   ├── pipeline-spec.md
│   ├── run-pipeline.sh
│   └── environments.md    (chỉ khi làm L2 thử thách 3)
├── screenshots/
│   └── pipeline.png       (chỉ minh họa)
├── evidence/
│   └── command-output.txt
└── report.md              (câu hỏi kiểm tra, giải thích gate; phần L2 nếu có)
lab-16/
├── README.md
├── source/                (backend đã copy, package-lock.json, ci.yml.copy)
├── screenshots/           (run xanh; check đỏ trên PR nếu làm L2)
├── evidence/
│   └── command-output.txt
└── report.md              (link run, log, nguyên nhân gốc, 5 câu trả lời)
```

Evidence cụ thể theo nhiệm vụ:

| Nhiệm vụ | Evidence bắt buộc |
| --- | --- |
| 1 | `pipeline-spec.md`, sơ đồ (nguồn và ảnh), log `run-pipeline.sh` thành công trong `lab-15/evidence/command-output.txt` |
| 2 | Log lần chạy đỏ kèm `exit code`, log `npm test` sau khi hoàn tác, đoạn giải thích trong `report.md` |
| 3 | `.github/workflows/ci.yml` và `source/ci.yml.copy`, log local, `git log --oneline`, link và đoạn log run xanh trong `lab-16/report.md` |
| 4 | Log Setup Node.js của hai lần chạy, ảnh hoặc mô tả hai job song song, thời gian `npm ci` |
| L2 | Output hoặc link mà từng tiêu chí L2 yêu cầu |

Mentor kiểm chứng bằng cách đọc workflow trong repo, mở link run và đối chiếu với log bạn dán, chạy lại `run-pipeline.sh` trên máy mentor và đọc lịch sử commit. Link run không truy cập được hoặc log không khớp với workflow trong repo sẽ bị hỏi lại trực tiếp. Ảnh chụp màn hình chỉ để minh họa, không thay thế log.

## Barem chấm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110).

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: thiết kế và giả lập pipeline | Sơ đồ và spec đủ 4 stage, script chạy được, log có `PIPELINE OK` và tag cụ thể | Thiếu stage, thiếu output hoặc điều kiện qua, không có log | 15 |
| Nhiệm vụ 2: gate dừng khi fail | Log đỏ không có stage build, `exit code` khác 0, test đã hoàn tác và xanh lại | Chỉ mô tả bằng lời, hoặc để lại test hỏng | 15 |
| Nhiệm vụ 3: workflow CI | `ci.yml` đúng, có `permissions`, pin action, run xanh có link và log | Workflow không chạy, thiếu checkout hoặc `working-directory`, không có link run | 20 |
| Nhiệm vụ 4: cache và tách job | Có log cache hai lần, hai job song song xanh, giải thích artifact và cache | Cache không hoạt động mà không giải thích, hoặc `validate` phụ thuộc job khác | 15 |
| Chất lượng `README.md` và `report.md` | 7 câu theo template, ngắn gọn, đúng, nêu nguyên nhân gốc khi có lỗi | Sao chép đề bài, trả lời chung chung | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng ý và dẫn chứng bằng lệnh hoặc đoạn YAML khi cần (3 điểm mỗi câu) | Sai hoặc bỏ trống | 15 |
| Vệ sinh và quy trình | Không có secret hay `.env`, không commit `node_modules`, PR đúng quy trình, có reviewer | Có secret, thiếu `package-lock.json` hoặc thiếu review | 10 |
| L2 thử thách 1 (thưởng) | Matrix, `needs`, có run chứng minh job bị skipped | Có YAML nhưng không có run chứng minh | 4 |
| L2 thử thách 2 (thưởng) | PR đỏ rồi xanh, báo cáo 5 phần, tái hiện bằng clone sạch | Chỉ nêu kết luận, không trích log | 3 |
| L2 thử thách 3 (thưởng) | Bảng môi trường hợp lý, chỉ một lệnh `docker build`, 2 gate có lý do | Lý do chung chung, log có nhiều hơn một `docker build` | 3 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh hoặc đoạn YAML nếu cần) trong `lab-16/report.md`.

1. Continuous Integration, Continuous Delivery và Continuous Deployment khác nhau ở điểm nào? Với Club API hiện chỉ có test cho `/health`, bạn chọn mô hình nào cho production và vì sao?
2. Workflow, job, step và runner khác nhau thế nào? Vì sao hai job trong cùng một workflow không dùng chung được thư mục file với nhau và bạn chuyển dữ liệu giữa chúng bằng cách nào?
3. Vì sao CI dùng `npm ci` thay cho `npm install`? Điều gì xảy ra nếu bạn quên commit `package-lock.json`?
4. Cache của `actions/setup-node` lấy gì làm key? Khi bạn thêm một dependency mới thì lần chạy kế tiếp xảy ra điều gì? Cache khác artifact ở điểm nào?
5. Check CI trên PR đỏ ở step `npm ci` nhưng local chạy tốt. Nêu ba việc bạn kiểm tra tiếp theo theo thứ tự và mỗi việc cho bạn biết điều gì.

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình thay cho log, hoặc link run mà không dán đoạn log liên quan.
- Làm trong `/mnt/c`, hoặc chạy `npm test` trên Windows rồi ghi là WSL.
- Dùng `npm install` trong workflow thay cho `npm ci`, hoặc thêm `package-lock.json` vào `.gitignore`.
- Workflow thiếu `actions/checkout`, hoặc đặt sai `working-directory` nên chỉ chạy được khi sửa tay.
- Nuốt mã thoát của lệnh kiểm tra (ví dụ thêm `|| true` sau `npm test`) khiến pipeline xanh dù test đỏ.
- Không pin phiên bản action, dùng `permissions: write-all` hoặc cấp quyền rộng hơn nhu cầu.
- Để lại test đã bị làm hỏng trong nhánh chính, hoặc không hoàn tác sau phần thử nghiệm gate.
- Commit `node_modules`, `.env`, token hoặc mật khẩu.
- Chỉ viết "đã sửa được" mà không nêu nguyên nhân gốc, dòng log chứng minh và cách phòng tránh.
- Sửa tay file evidence cho "đẹp" hơn thực tế.

## Quy trình nộp

1. Trong repository cá nhân (ví dụ `devops-labs`), tạo nhánh mới, ví dụ `week-08`.
2. Thêm hai thư mục `lab-15/` và `lab-16/` theo cấu trúc ở trên. File workflow thật nằm ở `.github/workflows/ci.yml` của chính repo; workflow cần nằm trên nhánh mặc định để các run hiển thị đầy đủ, vì vậy hãy ghi rõ trong mô tả PR bạn đã chạy run ở nhánh nào.
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2 và dán link các run xanh, run đỏ.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm theo barem trên PR và để lại nhận xét.
6. **Hạn nộp:** trước buổi đầu tiên của tuần 9.

## Checklist trước khi nộp

- [ ] `lab-15/` và `lab-16/` đúng cấu trúc theo `templates/lab-template.md`
- [ ] `README.md` mỗi thư mục trả lời đủ 7 câu và ghi rõ đã làm L1 hay L2
- [ ] `lab-15/evidence/command-output.txt` được sinh bằng `tee`, có cả lần chạy xanh và lần chạy đỏ của pipeline giả lập
- [ ] File test đã hoàn tác, `npm test` xanh ở trạng thái nộp
- [ ] `.github/workflows/ci.yml` có `permissions`, action pin theo phiên bản, `npm ci` và đúng `working-directory`
- [ ] `lab-16/source/ci.yml.copy` trùng với workflow thật
- [ ] `lab-16/report.md` có link run xanh, đoạn log Setup Node.js hai lần chạy và 5 câu trả lời
- [ ] `package-lock.json` đã được commit, `node_modules` và `.env` không có trong repo
- [ ] Không commit token, mật khẩu, private key
- [ ] Nếu làm L2: link run bị skipped do `needs`, link PR đỏ rồi xanh, báo cáo 5 phần, `environments.md`
- [ ] PR đã được ít nhất một bạn review và bạn đã phản hồi
