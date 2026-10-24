# Kịch bản buổi 10: Image Optimization

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 10 – Image Optimization](../../labs/week-05/session-10.md). Slide: [Slide buổi 10](../../slides/02-docker/session-10.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 5](../grading/week-05.md). Đáp án: [Đáp án tuần 5](../walkthroughs/week-05.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 10 trong 120 phút: khung thời gian, ranh giới với Buổi 09, demo 5 bước với `hello-node`, câu hỏi cho lớp và ghi chú theo từng slide.

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Buổi 09: Dockerfile, build context, `CMD` và `ENTRYPOINT` |
| Kiến thức và demo | 30 phút | Slide 1 đến 9: layer, cache, `.dockerignore`, multi-stage, non-root, tag; demo ở Slide 9 |
| Thực hành | 60 phút | Lab L1 (Phần 1 đến 5); L2 làm sau giờ nếu còn thời gian |
| Review | 15 phút | Đối chiếu bảng so sánh trước/sau của học viên, nhắc nộp `lab-10/` |

Buổi này dồn vào thực hành, thử thách L2 và review bài làm. Gợi ý chia giờ lab: chuẩn bị 5 phút, Phần 1 đến 4 khoảng 45 phút, Phần 5 (áp dụng vào `starter-project`) khoảng 10 phút.

## Ranh giới Buổi 09 và Buổi 10

Buổi 10 sở hữu các khái niệm tối ưu: layer cache và thứ tự lệnh, `.dockerignore`, rò rỉ `.env`, `USER node` và `--chown`, multi-stage, ghim tag và digest. Buổi 09 chỉ giữ Dockerfile chạy được, `ENV`, `CMD`, `ENTRYPOINT` và build context. Khi học viên hỏi về chủ đề thuộc buổi kia, trả lời một câu rồi dẫn tới bài đó.

Các phần làm trên `club-api` (cache với `Dockerfile.badorder`, `USER node`, `.dockerignore` với file rác `rac.bin`, viết lại có `HEALTHCHECK`, so sánh với Dockerfile multi-stage của dự án) là Thử thách 5 đến 9 trong [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md). Bài lab bắt buộc dùng `hello-node` cho cache, `.dockerignore`, rò rỉ `.env` và non-root, rồi áp dụng vào `club-api:1.0.0` ở Phần 5.

## Kịch bản demo (Slide 9)

Mentor trình chiếu terminal, dùng thư mục `examples/docker/hello-node/` đã chép vào `~/demo-10`. Tổng thời gian khoảng 9 phút.

**Bước 1. Build bản naive và xem kích thước.** Thư mục mẫu đã có sẵn `.dockerignore` (loại `.env`); ta xóa nó để mô phỏng một dự án chưa biết đến `.dockerignore`.

```bash
mkdir -p ~/demo-10 && cp -r ~/devops-course/examples/docker/hello-node/. ~/demo-10/ && cd ~/demo-10
rm -f .dockerignore
docker build -f Dockerfile.naive -t hello-node:demo-naive .
docker image ls hello-node
```

Kết quả mong đợi (rút gọn, số thật có thể khác):

```text
REPOSITORY   TAG          IMAGE ID       CREATED          SIZE
hello-node   demo-naive   3f1c0a9b7d2e   10 seconds ago   1.6GB
```

Câu hỏi cho lớp: "Ứng dụng chỉ có 1 file server.js và 1 thư viện. Thứ gì làm image nặng như vậy?" (gợi ý: base image Debian đầy đủ.)

**Bước 2. Tạo "rác" trong thư mục và quan sát build context.**

```bash
head -c 30M /dev/zero > big.bin
echo "DB_PASSWORD=do-not-leak" > .env
docker build -f Dockerfile.naive -t hello-node:demo-naive .
```

Trong log tìm dòng `transferring context`:

```text
=> [internal] load build context
=> => transferring context: 31.46MB
```

Chạy thử đọc `.env` từ image:

```bash
docker run --rm hello-node:demo-naive cat /app/.env
```

```text
DB_PASSWORD=do-not-leak
```

Câu hỏi cho lớp: "Nếu image này được push lên registry công khai thì chuyện gì xảy ra?" Giá trị mật khẩu ở đây là giả.

**Bước 3. Sửa code, quan sát cache bị mất.** Thêm một dòng comment vào `server.js`, build lại naive:

```bash
echo "// edit" >> server.js
docker build -f Dockerfile.naive -t hello-node:demo-naive . 2>&1 | grep -E "RUN|COPY|CACHED"
```

Kết quả mong đợi: `COPY . .` và `RUN npm install` đều chạy lại, không có chữ `CACHED` ở hai bước này.

**Bước 4. Thêm `.dockerignore`, build bản optimized, so sánh.**

```bash
printf 'node_modules\n.git\n.env\n*.bin\nDockerfile*\n.dockerignore\n' > .dockerignore
docker build -f Dockerfile.optimized -t hello-node:demo-opt .
docker image ls hello-node
docker run --rm hello-node:demo-opt cat /app/.env
```

Kết quả mong đợi: kích thước giảm còn khoảng 200-250 MB, và lệnh `cat` báo file không tồn tại (thông báo có thể hơi khác tùy phiên bản busybox).

**Bước 5. Chứng minh non-root.**

```bash
docker run --rm -d --name demo10 -p 3100:3000 hello-node:demo-opt
curl -s localhost:3100/
docker rm -f demo10
```

```text
Hello from hello-node (uid=1000)
```

Câu hỏi chốt: "Vì sao sửa một dòng code lần này nhanh hơn? Layer nào được lấy từ cache?" Dọn dẹp: `docker rmi hello-node:demo-naive hello-node:demo-opt`.

## Ghi chú theo slide

Slide buổi 10 có 14 slide. Thời lượng trong ngoặc là thời gian gợi ý.

**Slide 1. Mục tiêu buổi học (2 phút).** Nhấn mạnh buổi này lab có số liệu trước/sau: ai cũng phải có bảng so sánh. Hỏi lớp: ai đã từng build image trên 1 GB?

**Slide 2. Vấn đề thực tế (2 phút).** Kể như tình huống có thật trong CLB. Hỏi: "Nếu image này push lên registry công khai thì ai đọc được mật khẩu?"

**Slide 3. Layer là bất biến (3 phút).** Vẽ chồng layer lên bảng. Hỏi: "`rm` ở layer 5 có xóa được dữ liệu ở layer 4 không?" Đáp: chỉ che đi, dữ liệu vẫn nằm trong layer 4.

**Slide 4. Build cache (3 phút).** Cho lớp tự sắp xếp 3 lệnh `COPY . .`, `RUN npm ci`, `COPY package*.json ./` trước khi lộ đáp án. Nhắc lại với Buổi 09: Dockerfile `club-api` của các em đã viết đúng thứ tự này, giờ ta biết lý do.

**Slide 5. Build context và `.dockerignore` (3 phút).** `.dockerignore` đặt cạnh Dockerfile. Báo trước rằng cuối buổi sẽ cố tình ignore nhầm `package-lock.json` để phá lỗi (Slide 13).

**Slide 6. Kiến trúc multi-stage (3 phút).** Đi theo mũi tên từ trái sang phải. Nhấn mạnh: chỉ stage cuối thành image, các stage trước chỉ còn trong build cache.

**Slide 7. Cách hoạt động của multi-stage và cache (2 phút).** Hỏi: "Nếu tôi sửa `package-lock.json` thì layer nào chạy lại?" Đáp: từ `npm ci` trở đi.

**Slide 8. Base image, non-root, tag (3 phút).** Nhắc: tin số bạn đo bằng `docker image ls`, không tin con số trong slide. Alpine dùng musl nên vài thư viện native có thể lỗi, khi đó dùng `slim`. Từ Buổi 09 học viên đã dùng `node:22-alpine`; hôm nay giải thích vì sao ghim tag.

**Slide 9. Demo (9 phút).** Chạy demo 5 bước ở trên. Slide này không dẫn tới trang nào khác; học viên chỉ cần xem kết quả.

**Slide 10. Lab L1 trong 60 phút (5 phút giới thiệu).** Điểm quan trọng nhất ở Phần 2: sau khi thêm `.dockerignore`, size gần như không đổi vì vấn đề chính là base image. Yêu cầu học viên ghi nhận điều này vào report. Số thứ tự bước (ví dụ `4/4`) có thể khác tùy phiên bản Docker. Nhắc học viên đừng hoảng khi thấy `(health: starting)` trong 30 giây đầu.

**Slide 11. Lab L2, thử thách tự làm (phần còn lại của giờ lab).** Gợi ý nếu bí: bắt đầu từ hai stage, stage `deps` chỉ chép manifest. Nếu `npm ci` báo thiếu lockfile, kiểm tra `.dockerignore`. L2 có thể hoàn thành sau giờ.

**Slide 12. Lỗi thường gặp (2 phút).** Hỏi nhanh: "Triệu chứng nào bạn dễ gặp nhất ở CI?"

**Slide 13. Debug: "not found" dù file có thật (5 phút).** Cho học viên tự điều tra theo thứ tự trên slide trước khi lộ nguyên nhân gốc. Đây là họ lỗi của tình huống 05 (`examples/troubleshooting/scenario-05/`).

**Slide 14. Thử thách cuối buổi và recap (khoảng 7 phút, rồi review).** Đáp án gợi ý cho bốn câu: không, dùng tag `1.0.1` hoặc digest; xem layer nào mất cache và `.dockerignore` thiếu `.git`, `*.md`; `docker run --rm --entrypoint id image`; `.dockerignore` chỉ lọc context nên không thu nhỏ base image. Nhắc nộp bài vào `lab-10/` với bảng so sánh trước/sau, không commit `.env` và `big.bin`.

## Lưu ý riêng cho người dạy

- Từ Docker 29, `docker image ls` có hai cột `DISK USAGE` và `CONTENT SIZE`. Hướng dẫn học viên lấy số ở `DISK USAGE`; chi tiết ở [Đáp án tuần 5](../walkthroughs/week-05.md).
- Sau khi thêm `.dockerignore`, size của image naive gần như không đổi: đây là điểm học viên hay hiểu sai, hãy hỏi lại ở phần review.
- Kết quả `(health: starting)` trong 30 giây đầu là bình thường (`--interval=30s`).
- Học viên làm Thử thách 4 (stage `test`) hay gặp `# tests 0` vì `.dockerignore` của backend loại thư mục `tests`; kiểm tra log có dòng test thật.
- Hướng điều tra lỗi `"/package-lock.json": not found` cho học viên tự đi từng bước (đọc lỗi, `ls`, `cat .dockerignore`); chỉ lộ nguyên nhân gốc sau khi họ đã thử.
