# Barem và hướng dẫn chấm – Tuần 5

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Bài tập học viên: [Bài tập tuần 5](../../assignments/weekly/week-05.md). Đáp án mẫu và số liệu tham khảo: [Walkthrough tuần 5](../walkthroughs/week-05.md). Kịch bản dạy: [Buổi 09](../sessions/session-09.md), [Buổi 10](../sessions/session-10.md).
:::

## Điều chỉnh sau cải tổ (đọc trước khi chấm)

Bài tập đã được gọn lại theo ranh giới mới của hai buổi: Buổi 09 chỉ dạy Dockerfile chạy được; cache, `.dockerignore`, `USER node` và tag chuyển hết sang Buổi 10. Năm nhiệm vụ và thang điểm giữ nguyên, nhưng bằng chứng nằm ở chỗ khác so với bảng nguyên văn bên dưới:

| Tiêu chí | Trước cải tổ | Sau cải tổ |
| --- | --- | --- |
| Nhiệm vụ 1 | `lab-09`, gồm cả `USER node` và `id` | `lab-09`; không còn yêu cầu `USER node` (chuyển sang Nhiệm vụ 4 và 5); thêm yêu cầu ghi `-e PORT=4000` và lỗi sai build context |
| Nhiệm vụ 2 (cache) | `lab-09`, đoạn B dùng `Dockerfile.badorder` trên club-api | `lab-10`, đoạn A là `Dockerfile.optimized`, đoạn B là `Dockerfile.naive` trên hello-node; không cần `Dockerfile.badorder` |
| Nhiệm vụ 3 (rò rỉ) | `lab-09`, file rác `rac.bin` 100 MB | `lab-10`, file rác `big.bin` 30 MB, `.env` giả (cùng thư mục `source/hello-node`) |
| Nhiệm vụ 4, 5 | `lab-10` | Không đổi; `id` của image tối ưu và `club-api:1.0.0` là bằng chứng non-root |

Khi đối chiếu bảng nguyên văn, hiểu `rac.bin` là `big.bin`, `lab-09` ở Nhiệm vụ 2 và 3 là `lab-10`, `Dockerfile.badorder` là `Dockerfile.naive`. Đáp án mẫu Phần 2, 3, 5 của Buổi 09 trong walkthrough nay tương ứng với các phần của Buổi 10 (xem ghi chú đối chiếu ở đầu walkthrough).

## Barem chi tiết (nguyên văn)

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: Dockerfile `club-api` | Build thành công, ghim phiên bản, đúng thứ tự manifest rồi mã nguồn, `USER node`, exec form; `/health` và `id` có trong log thật | Dùng `latest`, chạy root, `COPY . .` trước `npm ci`, log thiếu hoặc tự gõ tay | 20 |
| Nhiệm vụ 2: chứng minh cache | Hai đoạn log A và B đối chiếu được, có `CACHED` ở A và không có ở B, giải thích đúng | Chỉ có một đoạn log, giải thích sai nguyên nhân hoặc không có | 15 |
| Nhiệm vụ 3: `.dockerignore` và rò rỉ | Có đủ log trước và sau, `.dockerignore` hợp lý, `.env` và `rac.bin` không còn trong repo | Thiếu log "trước", `.env` còn trong image hoặc trong repo | 15 |
| Nhiệm vụ 4: đo naive và optimized | Bảng so sánh đủ bốn cột, mỗi số truy được về log, có phân tích layer từ `docker history` | Số liệu không có trong log, thiếu phân tích layer, kết luận không khớp số liệu | 20 |
| Nhiệm vụ 5: `club-api:1.0.0` và tag | Build thành công, `id` đúng, tag cùng IMAGE ID, bảng đối chiếu bám file thật của dự án | Không build được, bảng đối chiếu chung chung hoặc chép đề bài | 10 |
| `report.md` và `README.md` | Đủ 7 câu mỗi lab, ghi rõ mức đã làm, trả lời đủ 5 câu kiểm tra | Thiếu câu, chép đề bài, không ghi mức | 10 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc thư mục, evidence là text thật, không secret, không `node_modules` | Sai cấu trúc, evidence chỉ là ảnh, có secret hoặc file rác trong repo | 5 |
| Quy trình nộp | Có PR, được một bạn review có nhận xét thật | Push thẳng vào `main` hoặc review chỉ ghi "OK" | 5 |
| **Tổng L1** | | | **100** |
| L2: Thử thách A (`Dockerfile.mine`) | Đủ 4 tiêu chí, có log `CACHED` và trạng thái `healthy` | Thiếu `HEALTHCHECK`, size vượt ngưỡng hoặc không có log | +4 |
| L2: Thử thách B (stage test) | Chạy được `--target test`, chứng minh image cuối sạch devDependencies | Chỉ nêu ý tưởng, không có log test | +3 |
| L2: Thử thách C (debug và tag) | Nguyên nhân gốc đúng, hai cách sửa khác nhau, bảng tag hợp lý | Nguyên nhân sai hoặc chỉ có một cách sửa | +3 |
| **Tối đa thưởng** | | | **+10** |

Điểm một tiêu chí được chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0.

## Lỗi hay bị trừ điểm (nguyên văn)

- Dùng `FROM node:latest` hoặc `node:22` mà không nói rõ vì sao, trong khi bài lab yêu cầu ghim phiên bản và đo size.
- `COPY . .` đặt trước `npm ci`, hoặc có log nhưng log cho thấy `npm ci` chạy lại mà không giải thích.
- Chỉ có log "sau" của `.dockerignore`, không có log "trước" nên không chứng minh được rò rỉ.
- Quên xóa `.env`, `rac.bin`, `big.bin` hoặc `node_modules` trước khi commit; ngoài ra `.dockerignore` loại luôn `package-lock.json` làm build lỗi.
- Bảng so sánh có số liệu không khớp log (ví dụ ghi size 200 MB trong khi log ghi khác), hoặc dùng số lấy từ bài giảng thay cho số đo trên máy.
- Làm việc trong `/mnt/c` khiến build chậm và sai quyền; evidence không chứng minh được thư mục làm việc.
- `evidence/command-output.txt` rỗng vì quên `tee`, hoặc chỉ dán output mà không có lệnh.
- Chạy bằng root nhưng báo cáo là non-root, hoặc kiểm tra `id` trên image khác với image được nộp.
- Đặt secret thật vào `ENV`, `COPY` hoặc commit lên repo; ảnh chụp màn hình lộ thông tin cá nhân.
- Nộp ảnh thay cho log text; push thẳng vào `main`, không có PR hoặc không có người review.

## Lệnh kiểm tra nhanh

Chạy trong bản clone repo `devops-labs` của học viên (kết quả mong đợi: không in ra dòng nào):

```bash
cd ~/devops-labs
git ls-files | grep -E '(^|/)(\.env|rac\.bin|big\.bin)$'
git ls-files | grep -E '(^|/)node_modules/'
grep -rIl "BEGIN OPENSSH PRIVATE KEY" . --exclude-dir=.git
```

Kiểm tra bổ sung cho mentor (đọc nhanh evidence, không phải chạy lại cả lab):

```bash
cd ~/devops-labs
grep -c '^\$ ' lab-09/evidence/command-output.txt lab-10/evidence/command-output.txt
grep -n 'CACHED' lab-10/evidence/command-output.txt | head
grep -n 'uid=' lab-09/evidence/command-output.txt lab-10/evidence/command-output.txt
```

Dòng đầu cho biết evidence có ghi cả lệnh (dòng bắt đầu bằng `$ `); dòng hai phải thấy `CACHED` ngay cạnh bước `npm ci`; dòng ba phải thấy `uid=0(root)` của image naive và `uid=1000(node)` của image tối ưu.

## Hướng dẫn chấm và câu hỏi vấn đáp (nguyên văn từ walkthrough)

| Tiêu chí | Bằng chứng cần thấy trong evidence/ | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Dockerfile club-api (20) | Log build kết thúc đúng tên image, `curl /health`, `id` có `uid=1000(node)`, `node --version` v22; lệnh có kèm output | Dockerfile giống hệt đáp án mẫu nhưng log thiếu lệnh; `id` lấy từ image khác tên; dùng `node:latest` | Nếu đặt `USER node` trước `RUN npm ci` thì điều gì có thể hỏng? Vì sao bạn chọn Alpine? |
| Chứng minh cache (15) | Hai đoạn log, A có `CACHED` ngay cạnh bước `npm ci`, B không; `Dockerfile.badorder` có `COPY . .` trước `npm ci` | Chỉ thấy `CACHED` ở bước khác (ví dụ `FROM`); không sửa `server.js` giữa hai lần build; giải thích không nhắc manifest và layer | Sửa `package.json` thêm một thư viện thì layer nào mất cache? Sửa README thì sao? |
| `.dockerignore` và rò rỉ (15) | `transferring context` khoảng 100 MB lúc đầu rồi rất nhỏ; `ls -a /app` có `.env` rồi không còn; `git ls-files` sạch | Chỉ có log "sau"; `.env` còn trong repo; ignore luôn `package-lock.json` | Image đã build với `.env` rồi, thêm `.dockerignore` xong thì image cũ có sạch không? Nếu đã push thì làm gì? |
| Đo naive và optimized (20) | `docker image ls`, `docker history` của hai image, `cat /app/.env`, `id`, dòng `real` của `time`; mỗi số trong bảng truy được về log | Số trong bảng trùng số bài giảng (1.6 GB, 200-250 MB) nhưng log ghi khác; thiếu cột nào đó; nhầm cột `CONTENT SIZE` | Layer nào trong `docker history` của bạn lớn nhất, của ai tạo? Vì sao `.dockerignore` không thu nhỏ image naive? |
| `club-api:1.0.0` và tag (10) | Log build, `docker image ls club-api` có `1.0.0` và `1.0` cùng IMAGE ID, `id` đúng; bảng đối chiếu bám file dự án | Bảng đối chiếu chung chung, không nhắc tên stage `dependencies` và `runtime` | `COPY --from=dependencies` làm gì? Tag `1.0` và `1.0.0` có tốn thêm dung lượng không? |
| `report.md`, `README.md` (10) | Đủ 7 câu, ghi mức L1 hoặc L2, 5 câu kiểm tra trả lời bằng lời riêng | Câu trả lời giống nhau từng chữ giữa các bạn hoặc chép đề bài | Giải thích bằng lời của bạn vì sao `EXPOSE` không đủ để truy cập từ host |
| Bằng chứng, kỷ luật repo (5) | Đúng cấu trúc thư mục, evidence là text thật có lệnh, lệnh quét secret không in gì | Evidence chỉ có ảnh; còn `.env`, `rac.bin`, `big.bin`, `node_modules` trong repo | Bạn kiểm tra không có secret trong repo bằng lệnh nào? |
| Quy trình nộp (5) | PR có nhận xét cụ thể của người review | Review chỉ ghi "OK"; push thẳng vào `main` | Reviewer đã chạy lại lệnh nào, kết quả ra sao? |
| L2 (thưởng) | `Dockerfile.mine` có `healthy` và `CACHED`; `evidence/test-results.txt` có dòng test thật, không phải `# tests 0` | Stage test xanh nhưng `# tests 0` (tests bị ignore); chép nguyên `Dockerfile.optimized` | Vì sao stage `test` ở bài này không cần devDependencies riêng? |

Gợi ý chung khi vấn đáp: yêu cầu học viên chạy lại một lệnh trong evidence (ví dụ `docker history`) và giải thích từng dòng. Bài hiểu thật sẽ trả lời được vì sao layer `0B` tồn tại; bài chép thường chỉ đọc lại số.
