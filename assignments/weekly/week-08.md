# Bài tập tuần 8 – CI/CD Fundamentals và GitHub Actions

> **Tóm tắt:** Nộp lại bằng chứng của hai bài lab tuần 8: pipeline giả lập có gate dừng khi test đỏ (lab-15) và workflow GitHub Actions thật chạy test, có cache và hai job (lab-16). Không có việc mới ngoài lab.

**Phạm vi:** [Buổi 15 – CI/CD Fundamentals](../../labs/week-08/session-15.md) và [Buổi 16 – GitHub Actions Basics](../../labs/week-08/session-16.md). Bài nộp nằm ở hai thư mục `lab-15/` và `lab-16/` trong repo cá nhân `devops-labs`. Hub tuần: [Tuần 8](../../labs/week-08/README.md).

Bài tập = nộp lại bằng chứng của lab, không có việc mới. Hai thứ cần làm thêm ngoài lab: viết `report.md` và trả lời 5 câu hỏi bên dưới.

## Nhiệm vụ L1 (bắt buộc)

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Thiết kế và giả lập pipeline | Buổi 15, Phần 1, 2 và 3 | 1,5 giờ | `pipeline-spec.md` đủ 4 stage, sơ đồ (file nguồn và `pipeline.png`), `run-pipeline.sh`, log có `=== STAGE: test ===`, `=== STAGE: build ===`, `# fail 0`, `PIPELINE OK` và tag image cụ thể |
| 2. Chứng minh gate dừng khi test fail | Buổi 15, Phần 4 | 0,5 giờ | Log lần chạy đỏ (không có stage build, `exit code` khác 0), log `npm test` xanh sau khi hoàn tác, 2 đến 3 câu về fail fast trong `report.md` |
| 3. Workflow CI thật chạy test | Buổi 16, Chuẩn bị và Phần 1, 2 | 1,5 giờ | `.github/workflows/ci.yml` và `ci.yml.copy`, log local, `git log --oneline`, link run xanh và đoạn log step `Run tests` trong `report.md` |
| 4. Bật cache và tách job | Buổi 16, Phần 3 và 4 | 1 giờ | Log Setup Node.js của hai lần chạy (lần hai khôi phục cache), thời gian `npm ci` hai lần, trang run có hai job `test` và `validate` song song, giải thích artifact khác cache |

Quy ước làm việc:

- Làm trong terminal WSL2 Ubuntu, thư mục nằm trong filesystem của WSL (ví dụ `~/devops-labs`), không dùng `/mnt/c`.
- Source là backend của `starter-project/` đã copy vào repo cá nhân (không copy `node_modules`). Không sửa mã backend, chỉ sửa test khi lab yêu cầu làm test đỏ và phải hoàn tác.
- Ghi lệnh và output thật bằng `2>&1 | tee -a evidence/command-output.txt`. Không sửa tay file evidence.
- Pin phiên bản action (ví dụ `actions/checkout@v4`) và đặt `permissions` tối thiểu. Không đưa token, mật khẩu hay file `.env` vào repo.
- Repo `devops-labs` để public để Actions chạy miễn phí.

## Nhiệm vụ L2 (nâng cao, tùy chọn)

L2 tính điểm thưởng tối đa 10, chỉ làm khi đã xong L1. Mentor chỉ nhận triệu chứng, bạn phải tự tìm nguyên nhân gốc. Đề và gợi ý nằm ở [thử thách L2 buổi 15](../../labs/week-08/session-15-challenge.md) và [thử thách L2 buổi 16](../../labs/week-08/session-16-challenge.md).

| Thử thách | Làm ở đâu | Bằng chứng nộp |
| --- | --- | --- |
| 1. Matrix, `needs` và job `build-image` | Buổi 16, thử thách L2 | YAML có `strategy.matrix` (2 phiên bản Node.js), `fail-fast: false`, `needs`; link một run mà `test` đỏ làm `build-image` bị skipped, kèm ảnh |
| 2. Pull request đỏ và Tình huống 06 | Buổi 16, thử thách L2 và Phá lỗi nâng cao | Link PR đỏ rồi xanh; báo cáo 5 phần (triệu chứng, nguyên nhân gốc, cách xác minh, giải pháp, phòng tránh) kèm dòng log đầu tiên báo lỗi và bằng chứng clone sạch; xem [Tình huống 06 – Workflow fail](../../examples/troubleshooting/scenario-06/README.md) |
| 3. Môi trường và build một lần | Buổi 15, thử thách L2 | `environments.md` (dev, staging, production với trigger, gate, rollback), lý do chọn Delivery hay Deployment (ít nhất 3), `run-pipeline.sh` chỉ build một lần, 2 gate bổ sung |

## Bảng điểm

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2. Tiêu chí chi tiết do mentor giữ.

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: thiết kế và giả lập pipeline | 15 |
| Nhiệm vụ 2: gate dừng khi fail | 15 |
| Nhiệm vụ 3: workflow CI | 20 |
| Nhiệm vụ 4: cache và tách job | 15 |
| Chất lượng `README.md` và `report.md` | 10 |
| Câu hỏi kiểm tra kiến thức (5 câu, 3 điểm mỗi câu) | 15 |
| Vệ sinh và quy trình (không secret, không `node_modules`, có review) | 10 |
| L2 (thưởng): thử thách 1 là 4, thử thách 2 là 3, thử thách 3 là 3 | tối đa 10 |

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu, kèm lệnh hoặc đoạn YAML nếu cần) trong `lab-16/report.md`.

1. Continuous Integration, Continuous Delivery và Continuous Deployment khác nhau ở điểm nào? Với Club API hiện chỉ có test cho `/health`, bạn chọn mô hình nào cho production và vì sao?
2. Workflow, job, step và runner khác nhau thế nào? Vì sao hai job trong cùng một workflow không dùng chung được thư mục file với nhau và bạn chuyển dữ liệu giữa chúng bằng cách nào?
3. Vì sao CI dùng `npm ci` thay cho `npm install`? Điều gì xảy ra nếu bạn quên commit `package-lock.json`?
4. Cache của `actions/setup-node` lấy gì làm key? Khi bạn thêm một dependency mới thì lần chạy kế tiếp xảy ra điều gì? Cache khác artifact ở điểm nào?
5. Check CI trên PR đỏ ở step `npm ci` nhưng local chạy tốt. Nêu ba việc bạn kiểm tra tiếp theo theo thứ tự và mỗi việc cho bạn biết điều gì.

## Cấu trúc bài nộp

Theo [mẫu lab](../../templates/lab-template.md), tách làm hai thư mục:

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
└── report.md              (giải thích gate; phần L2 nếu có)
lab-16/
├── README.md
├── source/                (backend đã copy, package-lock.json, ci.yml.copy)
├── screenshots/           (run xanh; check đỏ trên PR nếu làm L2)
├── evidence/
│   └── command-output.txt
└── report.md              (link run, log, nguyên nhân gốc, 5 câu trả lời)
```

Ảnh chụp màn hình chỉ để minh họa, không thay thế log: luôn dán đoạn log liên quan. Link run không truy cập được hoặc log không khớp với workflow trong repo sẽ bị hỏi lại trực tiếp.

## Quy trình nộp

1. Trong repository cá nhân (ví dụ `devops-labs`), tạo nhánh mới, ví dụ `week-08`.
2. Thêm hai thư mục `lab-15/` và `lab-16/` theo cấu trúc ở trên. File workflow thật nằm ở `.github/workflows/ci.yml`; workflow cần nằm trên nhánh mặc định để các run hiển thị đầy đủ, vì vậy hãy ghi rõ trong mô tả PR bạn đã chạy run ở nhánh nào.
3. Push nhánh và mở Pull Request vào nhánh chính của repo cá nhân. Mô tả PR nêu đã làm L1 hay L2 và dán link các run xanh, run đỏ.
4. Nhờ một bạn review. Reviewer để lại ít nhất hai nhận xét cụ thể (một điểm tốt, một điểm cần cải thiện) và bạn phản hồi hoặc sửa theo.
5. Gửi link PR cho mentor. Mentor chấm trên PR và để lại nhận xét.
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
