# Hướng dẫn chấm – Tuần 8

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 8](../../assignments/weekly/week-08.md). Đáp án: [Đáp án tuần 8](../walkthroughs/week-08.md). Kịch bản buổi: [Buổi 15](../sessions/session-15.md) và [Buổi 16](../sessions/session-16.md).
:::

> **Tóm tắt:** Thang điểm 100 cho 4 nhiệm vụ L1 của tuần 8 (cộng tối đa 10 điểm thưởng L2), tiêu chí hoàn thành chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho từng tiêu chí.

## Phạm vi bài nộp

Bài nộp gồm hai thư mục trong repo cá nhân `devops-labs`:

- `lab-15/`: Nhiệm vụ 1 và 2 (Buổi 15, Phần 1 đến 4), làm bằng sơ đồ, đặc tả và script giả lập, chưa cần Kubernetes.
- `lab-16/`: Nhiệm vụ 3 và 4 (Buổi 16, Phần 1 đến 4), làm bằng workflow GitHub Actions thật.

Thử thách L2: Thử thách 1 (matrix, `needs`, `build-image`) và Thử thách 2 (PR đỏ, tình huống 06) lấy từ [Buổi 16 – thử thách](../../labs/week-08/session-16-challenge.md); Thử thách 3 (môi trường và build một lần) lấy từ [Buổi 15 – thử thách](../../labs/week-08/session-15-challenge.md).

## Cách kiểm chứng nhanh

Mentor kiểm chứng bằng cách đọc workflow trong repo, mở link run và đối chiếu với log bạn dán, chạy lại `run-pipeline.sh` trên máy mentor và đọc lịch sử commit. Link run không truy cập được hoặc log không khớp với workflow trong repo sẽ bị hỏi lại trực tiếp. Ảnh chụp màn hình chỉ để minh họa, không thay thế log.

Lệnh kiểm tra nhanh trên bản clone bài nộp:

```bash
grep -c "=== STAGE: test ===" lab-15/evidence/command-output.txt
grep -E "PIPELINE OK|# fail" lab-15/evidence/command-output.txt
git diff --stat -- lab-15/source/starter-project/backend/tests
diff .github/workflows/ci.yml lab-16/source/ci.yml.copy
git ls-files | grep -E "node_modules|\.env$" || echo "sạch"
```

## Thang điểm

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

## Tiêu chí hoàn thành chi tiết

### Nhiệm vụ 1

- [ ] `pipeline-spec.md` có đủ 4 stage, mỗi stage không để trống ô nào.
- [ ] `evidence/command-output.txt` có đủ các dòng `=== STAGE: test ===`, `=== STAGE: build ===`, `# fail 0` và `PIPELINE OK`.
- [ ] Log cho thấy tên image kèm tag cụ thể (không chỉ `latest`) lấy từ `docker image inspect`.
- [ ] Mỗi mũi tên trong sơ đồ cho biết cái gì chảy qua nó (artifact hoặc kết quả).

### Nhiệm vụ 2

- [ ] Evidence có lần chạy đỏ: stage `test` báo `# fail` lớn hơn 0, không có dòng `=== STAGE: build ===` sau đó và `exit code` khác 0.
- [ ] Evidence có lần `npm test` xanh sau khi hoàn tác (`# fail 0`).
- [ ] `git diff` của thư mục `lab-15/source/starter-project/backend/tests` trống tại thời điểm nộp (file test đã trả về nguyên trạng).
- [ ] `report.md` nêu đúng nguyên tắc fail fast và nêu được thứ bị lãng phí nếu build trước test.

### Nhiệm vụ 3

- [ ] `ci.yml` đúng cú pháp YAML (thụt lề 2 dấu cách), đủ 4 step, có `permissions` và action được pin theo phiên bản.
- [ ] Evidence có log local (`npm ci`, `npm test` với `# fail 0`) và `git log --oneline` chứa commit thêm workflow.
- [ ] `report.md` có link tới run xanh và đoạn log của step `Run tests` chứa `# pass` và `# fail 0`.
- [ ] `report.md` giải thích vì sao phải có step checkout và vì sao `working-directory` là `lab-16/source`.

### Nhiệm vụ 4

- [ ] Log lần chạy đầu và lần chạy hai của step Setup Node.js đều có trong `report.md`; lần hai có dòng cho thấy cache được khôi phục.
- [ ] Trang run hiển thị ít nhất hai job `test` và `validate` đều xanh, không có `needs` giữa hai job này.
- [ ] `report.md` giải thích bằng lời của bạn artifact khác cache ở điểm nào, kèm ví dụ của Club API.
- [ ] Có ghi lại thời gian của step `npm ci` ở hai lần chạy (số giây thật, chênh lệch nhỏ vẫn chấp nhận).

### L2 thử thách 1 – Matrix, `needs` và job build-image

- [ ] Job `test` dùng `strategy.matrix` với tối thiểu hai phiên bản Node.js đang được hỗ trợ và đặt `fail-fast: false`.
- [ ] Có job `build-image` với `needs` trỏ tới `test` và `validate`; run xanh cho thấy đủ ba nhóm job và `build-image` chạy sau cùng.
- [ ] Chứng minh `needs` hoạt động: ghi lại một run mà `test` đỏ làm `build-image` bị bỏ qua (skipped), kèm link run và ảnh chụp.
- [ ] `report.md` nêu số job do matrix tạo ra và vì sao `fail-fast: false` hữu ích khi học.

### L2 thử thách 2 – Pull request đỏ và Tình huống 06

- [ ] Có link PR cho thấy check đỏ ở bước chạy test, và run xanh sau khi sửa trên cùng PR.
- [ ] `report.md` có mục báo cáo 5 phần của tình huống 06: triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh.
- [ ] Phần xác minh trích đúng dòng log đầu tiên báo lỗi và nói rõ lỗi xảy ra trước hay trong lệnh `npm`.
- [ ] Có bằng chứng tái hiện trên bản clone sạch (lệnh `git clone` vào thư mục mới và kết quả `npm ci` hoặc `git ls-files`).

### L2 thử thách 3 – Môi trường và build một lần

- [ ] `lab-15/source/environments.md` có bảng 3 môi trường dev, staging, production với trigger deploy, gate (test nào, ai duyệt) và cách rollback.
- [ ] `report.md` chọn Continuous Delivery hoặc Continuous Deployment cho production của Club API, có ít nhất 3 lý do dựa trên rủi ro và độ phủ test hiện có.
- [ ] `run-pipeline.sh` đã sửa để image chỉ build một lần; evidence có đúng một lệnh `docker build` dù pipeline "deploy" cho cả 3 môi trường (script phải in lệnh ra log, ví dụ `echo "+ docker build ..."`, rồi kiểm tra bằng `grep -c`).
- [ ] Đề xuất 2 gate bổ sung và nêu mỗi gate chặn loại lỗi nào.

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

## Câu hỏi kiểm tra kiến thức (học viên trả lời trong `lab-16/report.md`)

1. Continuous Integration, Continuous Delivery và Continuous Deployment khác nhau ở điểm nào? Với Club API hiện chỉ có test cho `/health`, bạn chọn mô hình nào cho production và vì sao?
2. Workflow, job, step và runner khác nhau thế nào? Vì sao hai job trong cùng một workflow không dùng chung được thư mục file với nhau và bạn chuyển dữ liệu giữa chúng bằng cách nào?
3. Vì sao CI dùng `npm ci` thay cho `npm install`? Điều gì xảy ra nếu bạn quên commit `package-lock.json`?
4. Cache của `actions/setup-node` lấy gì làm key? Khi bạn thêm một dependency mới thì lần chạy kế tiếp xảy ra điều gì? Cache khác artifact ở điểm nào?
5. Check CI trên PR đỏ ở step `npm ci` nhưng local chạy tốt. Nêu ba việc bạn kiểm tra tiếp theo theo thứ tự và mỗi việc cho bạn biết điều gì.

Đáp án gợi ý cho 5 câu nằm trong [Đáp án tuần 8](../walkthroughs/week-08.md).

## Câu hỏi vấn đáp và dấu hiệu bài chép

Mentor kiểm chứng bằng cách đọc workflow trong repo, mở link run và đối chiếu với log học viên dán, chạy lại `run-pipeline.sh` và đọc lịch sử commit. Link run không truy cập được hoặc log không khớp workflow trong repo thì hỏi lại trực tiếp.

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: thiết kế và giả lập | `pipeline-spec.md` đủ ô; log `run-pipeline.sh` có đủ stage, `# fail 0`, `PIPELINE OK`, tag cụ thể; sơ đồ có nhãn trên mũi tên | Spec giữ nguyên bảng mẫu của lab, không thêm tag, secret, song song; log không có mốc thời gian khác nhau giữa các lần chạy | Output của stage Build là gì và đi đâu tiếp? Vì sao tag bằng commit SHA tốt hơn `latest`? Secret nào cần và lưu ở đâu? |
| Nhiệm vụ 2: gate dừng khi fail | Log đỏ: `# fail` lớn hơn 0, không có stage build, `exit code` khác 0; log `npm test` xanh sau hoàn tác; `git diff` thư mục `tests` trống | Chỉ có lần chạy xanh; `exit code` lấy bằng `$?` nên luôn 0; để lại test hỏng | Vì sao `exit code` phải lấy từ `PIPESTATUS[0]`? Nếu em thêm `|| true` sau `npm test` thì chuyện gì xảy ra? Build trước test lãng phí gì? |
| Nhiệm vụ 3: workflow CI | `ci.yml` và `ci.yml.copy` giống nhau; `permissions`, pin action, `working-directory`; link run xanh khớp với commit; log step Run tests | Link run thuộc repo khác hoặc commit không khớp; log đã chỉnh tay; thiếu checkout; dùng `npm install` | Nếu bỏ checkout thì step nào đỏ đầu tiên và vì sao? Vì sao `working-directory` là `lab-16/source`? Vì sao `contents: read` là đủ? |
| Nhiệm vụ 4: cache và tách job | Log Setup Node.js hai lần, lần hai khôi phục cache; thời gian `npm ci` hai lần; run có `test` và `validate` song song | Hai đoạn log giống hệt nhau; `cache-dependency-path` sai mà không nhận ra; `validate` có `needs` | Key của cache lấy từ đâu? Thêm dependency thì chuyện gì xảy ra? Cache khác artifact thế nào, cho ví dụ của Club API? |
| `README.md` và `report.md` | 7 câu theo template, nêu nguyên nhân gốc khi có lỗi | Sao chép đề bài, chung chung | Chọn một lỗi em gặp: em đọc log ở đâu đầu tiên và xác minh bằng lệnh nào? |
| Câu hỏi kiểm tra kiến thức | 5 câu đúng ý, có lệnh hoặc YAML dẫn chứng | Trùng câu chữ với lab; không có dẫn chứng | Hỏi câu 5 với một tình huống mới (PR đỏ ở step `npm test` chỉ trên Node 24) |
| Vệ sinh và quy trình | Có `package-lock.json`, không có `node_modules`, `.env`, token; PR có reviewer | `git ls-files` thấy `node_modules`; thiếu lock file; không có phản hồi review | Em làm gì nếu lỡ commit token? (Thu hồi token trước, rồi mới xóa khỏi lịch sử.) |
| L2, Thử thách 1: matrix, `needs`, `build-image` | YAML có `strategy.matrix` (2 phiên bản), `fail-fast: false`, `needs`; link run `build-image` bị skipped | Có YAML nhưng không có run chứng minh; không biết matrix tạo mấy job | Matrix tạo mấy job? Khi `test (24)` đỏ thì `build-image` ra sao và vì sao? |
| L2, Thử thách 2: PR đỏ và tình huống 06 | Link PR đỏ rồi xanh; báo cáo 5 phần; dòng log đầu tiên báo lỗi; bằng chứng clone sạch | Chỉ có kết luận, không trích log; sửa nhiều thứ một lúc không biết cái nào có tác dụng | Lỗi xảy ra trước khi chạy `npm` hay trong `npm`? Em biết bằng dòng log nào? |
| L2, Thử thách 3: môi trường và build một lần | `environments.md` đủ trigger, gate, rollback; `grep -c` ra 1 với dòng lệnh build được in ra log; hai gate có lý do | Log có nhiều hơn một lệnh build; lý do chung chung ("cho an toàn") | Nếu production cần quay lui, em deploy lại cái gì? Vì sao điều đó chỉ làm được khi tag bất biến? |

Gợi ý chung khi vấn đáp: yêu cầu học viên mở log của chính họ và chỉ ra dòng đầu tiên cho biết trạng thái của pipeline; bài hiểu thật giải thích được vì sao gate dừng đúng chỗ.

## Quy trình nộp và hạn

Học viên nộp bằng Pull Request trong repo cá nhân (nhánh `week-08` hoặc tương đương), có ít nhất một bạn review với hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và phản hồi theo. Hạn nộp: trước buổi đầu tiên của tuần 9. Nếu học viên ghi rõ run chạy ở nhánh nào trong mô tả PR thì chấp nhận (workflow cần nằm trên nhánh mặc định để các run hiển thị đầy đủ).
