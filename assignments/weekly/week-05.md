# Bài tập tuần 5 – Dockerfile và Image Optimization

> **Tóm tắt:** Nộp lại bằng chứng của hai bài lab: Dockerfile cho `club-api` chạy được, cache hoạt động, `.dockerignore` chặn rò rỉ `.env`, và bảng so sánh image naive với image tối ưu bằng số liệu thật.

**Hạn nộp:** trước buổi đầu tiên của tuần 06.
**Hình thức:** Pull Request vào repo cá nhân `devops-labs`, thư mục `lab-09/` và `lab-10/`.
**Bài lab liên quan:** [Buổi 09 – Dockerfile](../../labs/week-05/session-09.md), [Buổi 10 – Image Optimization](../../labs/week-05/session-10.md). Hub tuần: [Tuần 05](../../labs/week-05/README.md).
**Mẫu nộp bài:** [Mẫu nộp bài lab](../../templates/lab-template.md).

**Bài tập = nộp lại bằng chứng của lab, không có việc mới.** Việc duy nhất ngoài lab là viết `report.md`, `README.md` và mở Pull Request. Chưa cần Compose hay Kubernetes: ở tuần này `/ready` trả `503` là bình thường vì container chưa có database.

## Nhiệm vụ L1 (bắt buộc)

| Nhiệm vụ | Làm ở Phần nào của lab | Giờ ước lượng | Bằng chứng nộp |
| --- | --- | --- | --- |
| 1. Dockerfile `club-api` chạy được | Buổi 09, Phần 1 đến 4 | 0,75 giờ | `lab-09/source/Dockerfile`; log build, `curl /health`, `-e PORT=4000`, `node --version`, lỗi sai context kèm lệnh sửa |
| 2. Chứng minh build cache | Buổi 10, Phần 3 | 0,25 giờ | Hai đoạn log trong `lab-10/evidence/command-output.txt` (có và không có `CACHED`); 3 đến 5 dòng giải thích trong `report.md` |
| 3. `.dockerignore` và rò rỉ bí mật | Buổi 10, Phần 1 và 2 | 0,25 giờ | `.dockerignore`; log `transferring context` và `ls -a /app` trước và sau |
| 4. Đo naive và optimized | Buổi 10, Phần 1 và 3 | 0,5 giờ | `docker image ls`, `docker history` của hai image, `cat /app/.env`, `id`, `time docker build`; bảng so sánh trong `report.md` |
| 5. `club-api:1.0.0` và tag | Buổi 10, Phần 5 | 0,25 giờ | Log build, `docker image ls club-api`, `id`; bảng đối chiếu trong `report.md` |
| Viết `report.md`, `README.md`, mở PR | Cả hai bài | 0,5 giờ | Báo cáo, 5 câu kiểm tra, Pull Request |

Quy ước đặt tên để reviewer chạy lại được: `club-api:lab9`, container `club-api-lab9`, host port 3001; `hello-node` dùng host port 3100.

### Tiêu chí tối thiểu từng nhiệm vụ

**Nhiệm vụ 1 (lab-09).**

- `docker build -t club-api:lab9 .` chạy từ `lab-09/source` thành công; evidence có dòng `naming to docker.io/library/club-api:lab9`.
- Dockerfile ghim base image có phiên bản cụ thể (không dùng `latest`), có `WORKDIR`, `ENV NODE_ENV=production`, `EXPOSE 3000`, `CMD` ở exec form; chép `package.json` và `package-lock.json` trước `npm ci --omit=dev`, mã nguồn sau đó.
- Evidence có output thật của `curl -s localhost:3001/health` chứa `healthy`, log `API listening on port 4000` khi chạy với `-e PORT=4000`, và `docker run --rm club-api:lab9 node --version` in phiên bản bắt đầu bằng `v22`.
- Evidence có dòng lỗi khi build sai thư mục (Phần 4) và lệnh sửa đã chạy lại thành công.

**Nhiệm vụ 2 (lab-10).** Hai đoạn log dùng `--progress=plain`, lọc bằng `grep -E "RUN npm|COPY|CACHED"` hoặc tương đương, sau khi chỉ sửa `server.js`: đoạn A là `Dockerfile.optimized` (bước `npm ci` hiện `CACHED`), đoạn B là `Dockerfile.naive` (không có `CACHED` ở `COPY . .` và `npm install`). Log phải cho thấy rõ lệnh nào đã chạy; `report.md` giải thích vì sao A có cache còn B thì không, dùng thuật ngữ layer và manifest.

**Nhiệm vụ 3 (lab-10).**

- Evidence "trước": `transferring context` khoảng 31 MB và `ls -a /app` có `.env`, `big.bin` (dùng `.env` giả, không phải mật khẩu thật).
- `.dockerignore` loại tối thiểu `node_modules`, `.git`, `.env`, `*.bin`.
- Evidence "sau": `transferring context` chỉ còn rất nhỏ, `ls -a /app` không còn `.env`, `big.bin`.
- `.env` và `big.bin` đã bị xóa khỏi `source/` trước khi commit.

**Nhiệm vụ 4 (lab-10).**

- Log build `hello-node:1.0.0-naive` (kèm `transferring context`), `docker image ls hello-node`, `cat /app/.env` (thấy nội dung), `id` (thấy `uid=0`).
- `docker history` của image naive và `hello-node:1.0.0`; trong `report.md` chỉ ra layer lớn nhất do bạn tạo ra ở mỗi image và layer nào thuộc base.
- Bảng so sánh đúng bốn cột đo được: size (cột `DISK USAGE`), thời gian rebuild sau khi sửa `server.js` (dòng `real` của `time`, đơn vị giây), user chạy tiến trình, có rò `.env` hay không. Mỗi số truy được về một dòng trong `evidence/command-output.txt`.
- Một câu nhận xét giải thích vì sao `.dockerignore` không làm image naive nhỏ đi đáng kể.

**Nhiệm vụ 5 (lab-10).**

- Log `docker build -t club-api:1.0.0 .` từ `starter-project/backend` thành công; `docker image ls club-api` cho thấy `1.0.0`.
- `docker run --rm --entrypoint id club-api:1.0.0` cho thấy `uid=1000(node)`.
- Gắn tag `club-api:1.0` bằng `docker tag`; `docker image ls club-api` cho thấy các tag cùng IMAGE ID.
- Bảng đối chiếu trong `report.md`, mỗi ô là câu trả lời cụ thể dựa trên file thật của dự án: stage nào cài dependency, vì sao `COPY --from=dependencies` đứng trước `COPY . .`, `USER node` đặt ở đâu, mỗi mục trong `.dockerignore` của backend giải quyết vấn đề gì.

## Bảng điểm

Tổng 100 điểm cho L1, cộng tối đa 10 điểm thưởng cho L2. Đạt đủ nhận điểm tối đa, đạt một phần nhận khoảng một nửa, không có hoặc không kiểm chứng được nhận 0.

| Tiêu chí | Điểm |
| --- | --- |
| Nhiệm vụ 1: Dockerfile `club-api` | 20 |
| Nhiệm vụ 2: chứng minh cache | 15 |
| Nhiệm vụ 3: `.dockerignore` và rò rỉ | 15 |
| Nhiệm vụ 4: đo naive và optimized | 20 |
| Nhiệm vụ 5: `club-api:1.0.0` và tag | 10 |
| `report.md` và `README.md` (đủ 7 câu, ghi mức, 5 câu kiểm tra) | 10 |
| Bằng chứng và kỷ luật repo (đúng cấu trúc, evidence là text thật, không secret) | 5 |
| Quy trình nộp (có PR, có review thật) | 5 |
| **Tổng L1** | **100** |
| L2: Thử thách A, B, C | +4, +3, +3 |

## Nhiệm vụ L2 (nâng cao, điểm thưởng)

L2 chỉ chấm khi L1 đạt từ 60 điểm trở lên. Làm tự lực: không chép lại Dockerfile mẫu. Đề chi tiết, gợi ý và lời giải nằm ở [Buổi 09 – thử thách thêm](../../labs/week-05/session-09-challenge.md) và [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md).

- **Thử thách A. `Dockerfile.mine` có HEALTHCHECK:** viết `lab-10/source/hello-node/Dockerfile.mine` từ đầu; ít nhất hai stage, base `node:22-alpine`, `USER node`, không có `.env`; `HEALTHCHECK` gọi `/health` và `docker ps --filter name=hello-mine --format '{{.Names}} {{.Status}}'` hiện `healthy` sau tối đa 1 phút; log sau khi sửa `server.js` có `CACHED` ở `npm ci`; size không lớn hơn `Dockerfile.optimized` quá 10%, hai con số đặt cạnh nhau trong `report.md`.
- **Thử thách B. Stage test:** thêm stage `test` vào bản sao Dockerfile của backend (`lab-10/source/Dockerfile.test`, không sửa Dockerfile gốc); `docker build --target test -f Dockerfile.test -t club-api:test .` chạy được `npm test`, log lưu vào `evidence/test-results.txt`; chứng minh image cuối không chứa devDependencies bằng một lệnh `docker run`; `report.md` giải thích đánh đổi với `.dockerignore` loại `tests`.
- **Thử thách C. Điều tra lỗi và chiến lược tag:** tái hiện lỗi sai build context (Buổi 09) hoặc lỗi `.dockerignore` loại `package-lock.json` (Buổi 10), dán dòng lỗi thật vào evidence; `report.md` nêu nguyên nhân gốc và hai cách sửa khác nhau kèm lệnh build chạy lại thành công; thêm bảng chiến lược tag cho `club-api` với ba bản 1.0.0, 1.0.1, 1.1.0 và tag dùng để deploy.

## Bằng chứng cần nộp

Cấu trúc thư mục theo mẫu lab:

```text
lab-09/
├── README.md
├── report.md
├── source/
│   ├── Dockerfile
│   └── (mã nguồn backend, không có node_modules, .env)
├── screenshots/
│   └── health-ok.png
└── evidence/
    └── command-output.txt
lab-10/
├── README.md
├── report.md
├── source/
│   └── hello-node/
│       ├── .dockerignore
│       ├── Dockerfile.mine        (L2, Thử thách A)
│       └── Dockerfile.test        (L2, Thử thách B, nếu để cạnh backend thì ghi rõ vị trí)
├── screenshots/
│   └── image-sizes.png
└── evidence/
    ├── command-output.txt
    └── test-results.txt           (L2, Thử thách B)
```

Nguyên tắc: ảnh chụp màn hình chỉ bổ trợ; mọi nhiệm vụ phải kiểm chứng được bằng Dockerfile và log dạng text. Ghi lệnh cùng output (dòng bắt đầu bằng `$ ` cho lệnh) và dùng `2>&1 | tee -a ...` để log không bị rỗng. `README.md` của mỗi lab trả lời đủ 7 câu theo mẫu và ghi rõ đã làm L1 hay L2. `report.md` của `lab-10` chứa phần giải thích cache, bảng so sánh, phân tích layer và bảng đối chiếu.

Trước khi nộp, tự kiểm tra bí mật và file rác (kết quả mong đợi: không in ra dòng nào):

```bash
cd ~/devops-labs
git ls-files | grep -E '(^|/)(\.env|rac\.bin|big\.bin)$'
git ls-files | grep -E '(^|/)node_modules/'
grep -rIl "BEGIN OPENSSH PRIVATE KEY" . --exclude-dir=.git
```

## Câu hỏi kiểm tra kiến thức

Trả lời ngắn (2 đến 4 câu mỗi câu) bằng lời của bạn trong `report.md`: câu 1 đến 3 ở `lab-09/report.md`, câu 4 đến 5 ở `lab-10/report.md`.

1. `EXPOSE 3000` có làm cho `curl localhost:3000` từ máy host chạy được không? Nếu không thì cần thêm gì khi `docker run`?
2. Vì sao `COPY package.json package-lock.json ./` phải đứng trước `COPY . .`? Khi một layer mất cache thì các layer phía sau xử lý ra sao?
3. Đồng đội báo "build ở máy mình thì được, ở CI báo COPY không tìm thấy `package.json`". Nêu ba điểm bạn kiểm tra đầu tiên, theo thứ tự.
4. Vì sao `RUN rm -rf` ở layer sau không làm image nhỏ lại? Multi-stage build giải quyết vấn đề đó bằng cách nào?
5. Tag `latest` có đảm bảo là bản mới nhất không? Với `club-api`, bạn deploy bằng tag nào và vì sao?

## Quy trình nộp

1. Tạo branch từ `main` trong repo cá nhân:

```bash
cd ~/devops-labs
git switch main
git switch -c week-05
```

2. Làm bài, commit theo từng nhiệm vụ với message rõ nghĩa (ví dụ `Add lab-09 Dockerfile and evidence`).
3. Push branch và mở Pull Request vào `main` của chính repo cá nhân:

```bash
git push -u origin week-05
```

4. Nhờ một bạn trong CLB review: ít nhất 2 nhận xét cụ thể (một điểm tốt, một điểm cần sửa); nên thử chạy lại `docker build` từ `source/`. Bạn sửa theo nhận xét hợp lý và trả lời từng nhận xét.
5. Gắn mentor làm reviewer và dán link PR vào kênh nộp bài của lớp. Nộp muộn bị trừ theo quy định trong [Đánh giá](../../curriculum/assessment.md).

## Checklist trước khi nộp

- [ ] `lab-09/` và `lab-10/` có đúng cấu trúc thư mục, có `README.md` (7 câu), `report.md`, `source/`, `screenshots/`, `evidence/`
- [ ] `docker build -t club-api:lab9 .` chạy được từ `lab-09/source`, Dockerfile ghim phiên bản, `CMD` ở exec form
- [ ] Evidence có hai đoạn log cache (có và không có `CACHED`) cùng giải thích trong `report.md`
- [ ] Evidence có log `transferring context` và `ls -a /app` trước và sau khi thêm `.dockerignore`
- [ ] Bảng so sánh naive và optimized có đủ size, thời gian rebuild, user chạy, rò `.env`; mỗi số truy được về log
- [ ] `docker history` của cả hai image có trong evidence, layer lớn nhất đã được phân tích
- [ ] `club-api:1.0.0` đã build, `id` cho thấy `node`, tag `1.0` cùng IMAGE ID
- [ ] 5 câu hỏi kiểm tra kiến thức đã được trả lời trong `report.md`
- [ ] Đã chạy các lệnh kiểm tra bí mật và không có kết quả; không commit `.env`, `big.bin`, `node_modules`, password, token, private key
- [ ] Ghi rõ mức đã làm (L1 hoặc L2) cuối `README.md`; đã dọn container và image tạm
- [ ] Đã mở Pull Request, được ít nhất một bạn review, mentor đã được gắn
