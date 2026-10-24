# Hướng dẫn chấm – Tuần 5

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Bài tập học viên: [Bài tập tuần 5](../../assignments/weekly/week-05.md). Đáp án và số liệu tham khảo: [Đáp án tuần 5](../walkthroughs/week-05.md). Kịch bản buổi: [Buổi 09](../sessions/session-09.md), [Buổi 10](../sessions/session-10.md).
:::

> **Tóm tắt:** Thang điểm 100 cho 5 nhiệm vụ L1 của tuần 5 (cộng tối đa 10 điểm thưởng L2), các lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho từng tiêu chí.

## Phạm vi bài nộp

Bài nộp gồm hai thư mục trong repo cá nhân `devops-labs`:

- `lab-09/`: Nhiệm vụ 1, làm trên `club-api` (Buổi 09, Phần 1 đến 4).
- `lab-10/`: Nhiệm vụ 2 đến 5, làm trên `hello-node` và `starter-project/backend` (Buổi 10, Phần 1 đến 5).

Ranh giới giữa hai buổi: Buổi 09 chỉ yêu cầu Dockerfile chạy được (`ENV`, `CMD`, `ENTRYPOINT`, build context), nên bài `lab-09` không có `USER node`, `.dockerignore` tự viết hay bằng chứng cache. Các bằng chứng đó nằm ở `lab-10`. Nếu học viên làm thêm Thử thách 5 đến 9 của Buổi 10 trên `club-api`, ghi nhận như bài thưởng, không trừ điểm L1.

## Thang điểm

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: Dockerfile `club-api` chạy được (`lab-09`) | Build thành công từ `lab-09/source`, ghim phiên bản (`node:22-alpine`), có `WORKDIR`, `ENV NODE_ENV=production`, `EXPOSE`, `CMD` exec form, manifest trước mã nguồn; log có `/health`, `-e PORT=4000`, `node --version` v22, lỗi sai context kèm lệnh sửa | Dùng `latest`, `CMD` shell form, `COPY . .` trước `npm ci`, log thiếu hoặc tự gõ tay, không có lỗi sai context | 20 |
| Nhiệm vụ 2: chứng minh cache (`lab-10`) | Hai đoạn log A và B đối chiếu được: A (`Dockerfile.optimized`) có `CACHED` ngay cạnh `npm ci`, B (`Dockerfile.naive`) không có `CACHED` ở `COPY . .` và `npm install`; giải thích đúng bằng layer và manifest | Chỉ có một đoạn log, `CACHED` thuộc bước khác, giải thích sai nguyên nhân hoặc không có | 15 |
| Nhiệm vụ 3: `.dockerignore` và rò rỉ (`lab-10`) | Log "trước" (`transferring context` khoảng 31 MB, `ls -a /app` có `.env`, `big.bin`) và log "sau" (context rất nhỏ, không còn hai file); `.dockerignore` loại tối thiểu `node_modules`, `.git`, `.env`, `*.bin`; `.env` và `big.bin` đã xóa khỏi `source/` | Thiếu log "trước", `.env` còn trong image hoặc trong repo, ignore luôn `package-lock.json` | 15 |
| Nhiệm vụ 4: đo naive và optimized (`lab-10`) | Bảng so sánh đủ bốn cột (size, thời gian rebuild, user chạy, rò `.env`), mỗi số truy được về log; có `docker history` của hai image và phân tích layer; có một câu giải thích vì sao `.dockerignore` không thu nhỏ image naive | Số liệu không có trong log, thiếu phân tích layer, kết luận không khớp số liệu | 20 |
| Nhiệm vụ 5: `club-api:1.0.0` và tag (`lab-10`) | Log build thành công, `docker image ls club-api` có `1.0.0` và `1.0` cùng IMAGE ID, `id` in `uid=1000(node)`; bảng đối chiếu bám file thật của dự án | Không build được, bảng đối chiếu chung chung hoặc chép đề bài | 10 |
| `report.md` và `README.md` | Đủ 7 câu mỗi lab, ghi rõ mức đã làm (L1 hoặc L2), trả lời đủ 5 câu kiểm tra (câu 1 đến 3 ở `lab-09`, câu 4 đến 5 ở `lab-10`) | Thiếu câu, chép đề bài, không ghi mức | 10 |
| Bằng chứng và kỷ luật repo | Đúng cấu trúc thư mục, evidence là text thật có lệnh, không secret, không `node_modules` | Sai cấu trúc, evidence chỉ là ảnh, có secret hoặc file rác trong repo | 5 |
| Quy trình nộp | Có Pull Request, được một bạn review có nhận xét thật | Push thẳng vào `main` hoặc review chỉ ghi "OK" | 5 |
| **Tổng L1** | | | **100** |
| L2, Thử thách A: `Dockerfile.mine` | Đủ 4 tiêu chí, có log `CACHED` và trạng thái `healthy` | Thiếu `HEALTHCHECK`, size vượt ngưỡng hoặc không có log | +4 |
| L2, Thử thách B: stage test | Chạy được `--target test`, có dòng test thật, chứng minh image cuối sạch devDependencies | Chỉ nêu ý tưởng, không có log test | +3 |
| L2, Thử thách C: debug và tag | Nguyên nhân gốc đúng, hai cách sửa khác nhau, bảng tag hợp lý | Nguyên nhân sai hoặc chỉ có một cách sửa | +3 |
| **Tối đa thưởng** | | | **+10** |

Điểm một tiêu chí chia theo mức: đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0. L2 chỉ chấm khi L1 đạt từ 60 điểm trở lên.

## Lỗi hay bị trừ điểm

- Dùng `FROM node:latest` hoặc `node:22` mà không nói rõ vì sao, trong khi bài lab yêu cầu ghim phiên bản (`node:22-alpine` ở `club-api`) và đo size.
- `COPY . .` đặt trước `npm ci`, hoặc có log nhưng log cho thấy `npm ci` chạy lại mà không giải thích.
- Nhiệm vụ 1 thiếu bằng chứng lỗi sai build context hoặc thiếu lệnh sửa đã chạy lại thành công.
- Chỉ có log "sau" của `.dockerignore`, không có log "trước" nên không chứng minh được rò rỉ.
- Quên xóa `.env`, `big.bin` hoặc `node_modules` trước khi commit; `.dockerignore` loại luôn `package-lock.json` làm build lỗi.
- Bảng so sánh có số liệu không khớp log (ví dụ ghi size 200 MB trong khi log ghi khác), dùng số lấy từ bài giảng thay cho số đo trên máy, hoặc đọc nhầm cột `CONTENT SIZE` thay cho `DISK USAGE`.
- Làm việc trong `/mnt/c` khiến build chậm và sai quyền; evidence không chứng minh được thư mục làm việc.
- `evidence/command-output.txt` rỗng vì quên `tee`, hoặc chỉ dán output mà không có lệnh.
- Chạy bằng root nhưng báo cáo là non-root, hoặc kiểm tra `id` trên image khác với image được nộp. Lưu ý image `club-api:lab9` của Buổi 09 chạy bằng root là đúng; chỉ `hello-node:1.0.0` và `club-api:1.0.0` mới phải là `uid=1000(node)`.
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
grep -n 'port 4000\|v22' lab-09/evidence/command-output.txt
grep -n 'CACHED' lab-10/evidence/command-output.txt | head
grep -n 'uid=' lab-10/evidence/command-output.txt
```

Dòng đầu cho biết evidence có ghi cả lệnh (dòng bắt đầu bằng `$ `). Dòng hai phải thấy `API listening on port 4000` và `v22` ở `lab-09`. Dòng ba phải thấy `CACHED` ngay cạnh bước `npm ci`. Dòng bốn phải thấy `uid=0(root)` của image naive và `uid=1000(node)` của image tối ưu và của `club-api:1.0.0`.

## Câu hỏi vấn đáp và dấu hiệu bài chép

| Tiêu chí | Bằng chứng cần thấy trong evidence | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- | --- |
| Nhiệm vụ 1: Dockerfile `club-api` (20) | Log build kết thúc `naming to docker.io/library/club-api:lab9`, `curl /health` có `healthy`, log `port 4000`, `node --version` v22, lỗi sai context và lệnh sửa; mỗi lệnh kèm output | Dockerfile giống hệt mẫu nhưng log thiếu lệnh; dùng `node:latest`; không có đoạn lỗi context | Vì sao chọn Alpine và ghim `22`? `EXPOSE 3000` có đủ để `curl` từ host không? Vì sao `docker stop` lần đầu mất khoảng 10 giây? |
| Nhiệm vụ 2: chứng minh cache (15) | Hai đoạn log, A có `CACHED` ngay cạnh bước `npm ci`, B không; giữa hai lần build có sửa `server.js` | Chỉ thấy `CACHED` ở bước khác (ví dụ `FROM`); không sửa `server.js` giữa hai lần build; giải thích không nhắc manifest và layer | Sửa `package.json` thêm một thư viện thì layer nào mất cache? Sửa README thì sao? |
| Nhiệm vụ 3: `.dockerignore` và rò rỉ (15) | `transferring context` khoảng 31 MB lúc đầu rồi rất nhỏ; `ls -a /app` có `.env`, `big.bin` rồi không còn; `git ls-files` sạch | Chỉ có log "sau"; `.env` còn trong repo; ignore luôn `package-lock.json` | Image đã build với `.env` rồi, thêm `.dockerignore` xong thì image cũ có sạch không? Nếu đã push thì làm gì? |
| Nhiệm vụ 4: đo naive và optimized (20) | `docker image ls`, `docker history` của hai image, `cat /app/.env`, `id`, dòng `real` của `time`; mỗi số trong bảng truy được về log | Số trong bảng trùng số bài giảng (1.6 GB, 200-250 MB) nhưng log ghi khác; thiếu cột nào đó; nhầm cột `CONTENT SIZE` | Layer nào trong `docker history` của bạn lớn nhất, của ai tạo? Vì sao `.dockerignore` không thu nhỏ image naive? |
| Nhiệm vụ 5: `club-api:1.0.0` và tag (10) | Log build, `docker image ls club-api` có `1.0.0` và `1.0` cùng IMAGE ID, `id` đúng; bảng đối chiếu bám file dự án | Bảng đối chiếu chung chung, không nhắc tên stage `dependencies` và `runtime` | `COPY --from=dependencies` làm gì? Tag `1.0` và `1.0.0` có tốn thêm dung lượng không? |
| `report.md`, `README.md` (10) | Đủ 7 câu, ghi mức L1 hoặc L2, 5 câu kiểm tra trả lời bằng lời riêng | Câu trả lời giống nhau từng chữ giữa các bạn hoặc chép đề bài | Giải thích bằng lời của bạn vì sao `EXPOSE` không đủ để truy cập từ host |
| Bằng chứng, kỷ luật repo (5) | Đúng cấu trúc thư mục, evidence là text thật có lệnh, lệnh quét secret không in gì | Evidence chỉ có ảnh; còn `.env`, `big.bin`, `node_modules` trong repo | Bạn kiểm tra không có secret trong repo bằng lệnh nào? |
| Quy trình nộp (5) | PR có nhận xét cụ thể của người review | Review chỉ ghi "OK"; push thẳng vào `main` | Reviewer đã chạy lại lệnh nào, kết quả ra sao? |
| L2 (thưởng) | `Dockerfile.mine` có `healthy` và `CACHED`; `evidence/test-results.txt` có dòng test thật, không phải `# tests 0` | Stage test xanh nhưng `# tests 0` (tests bị ignore); chép nguyên `Dockerfile.optimized` | Vì sao stage `test` ở bài này không cần devDependencies riêng? |

Gợi ý chung khi vấn đáp: yêu cầu học viên chạy lại một lệnh trong evidence (ví dụ `docker history`) và giải thích từng dòng. Bài hiểu thật sẽ trả lời được vì sao layer `0B` tồn tại; bài chép thường chỉ đọc lại số. Nếu học viên làm thêm Thử thách 6 trên `club-api`, hỏi: nếu đặt `USER node` trước `RUN npm ci` thì điều gì có thể hỏng?
