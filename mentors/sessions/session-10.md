# Kịch bản mentor – Buổi 10: Image Optimization

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 10 – Image Optimization](../../labs/week-05/session-10.md). Slide: [Slide buổi 10](../../slides/02-docker/session-10.md). Chấm bài: [Barem và hướng dẫn chấm tuần 5](../grading/week-05.md). Đáp án: [Walkthrough tuần 5](../walkthroughs/week-05.md).
:::

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Buổi 09: Dockerfile, build context, CMD và ENTRYPOINT |
| Kiến thức và demo | 30 phút | Layer, cache, `.dockerignore`, multi-stage, non-root, tag; demo 5 bước bên dưới |
| Thực hành | 60 phút | Lab L1 (Phần 1 đến 5), L2 làm sau giờ nếu còn thời gian |
| Review | 15 phút | Đối chiếu bảng so sánh trước/sau của học viên, nhắc nộp `lab-10/` |

Buổi này dồn vào thực hành, thử thách L2 và review bài làm. Thời gian gợi ý cũ của lab: chuẩn bị 5', phần 1 đến 4 khoảng 45', phần 5 dành cho đóng gói và L2 nếu còn thời gian (L2 có thể hoàn thành sau giờ).

## Ranh giới Buổi 09 và Buổi 10 (đọc trước khi dạy)

Buổi 10 sở hữu các khái niệm tối ưu: layer cache và thứ tự lệnh, `.dockerignore`, rò rỉ `.env`, `USER node` và `--chown`, multi-stage, ghim tag và digest. Buổi 09 chỉ giữ Dockerfile chạy được, `ENV`, `CMD`, `ENTRYPOINT`, build context. Khi học viên hỏi về chủ đề thuộc buổi kia, trả lời một câu rồi dẫn link. Các phần club-api của Buổi 09 cũ (cache, `USER node`, `.dockerignore` với `rac.bin`, thử thách `HEALTHCHECK`, so sánh với Dockerfile multi-stage) nằm trong [thử thách thêm của Buổi 10](../../labs/week-05/session-10-challenge.md).

## Demo của mentor

Mentor trình chiếu terminal, dùng thư mục `examples/docker/hello-node/` đã chép vào `~/demo-10`.

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

Câu hỏi cho lớp: "Nếu image này được push lên registry công khai thì chuyện gì xảy ra?"

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

Kết quả mong đợi: kích thước giảm còn khoảng 200-250 MB, và lệnh `cat` báo `No such file or directory`.

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

## Ghi chú giảng viên từ slide (theo slide gốc)

Các ghi chú dưới đây lấy nguyên văn từ slide cũ; slide mới đã gộp lại còn 14 slide và không còn ghi chú.

**Slide gốc 1. Mục tiêu buổi học.** Thời lượng: 2 phút. Nhấn mạnh buổi này lab có số liệu trước/sau: ai cũng phải có bảng so sánh. Hỏi lớp: ai đã từng build image trên 1 GB?

**Slide gốc 2. Vấn đề thực tế.** Kể câu chuyện như tình huống có thật trong CLB. Hỏi: "Nếu image này push lên registry công khai thì ai đọc được mật khẩu?" Thời lượng: 2 phút.

**Slide gốc 3. Layer là bất biến.** Vẽ chồng layer lên bảng. Câu hỏi: "rm ở layer 5 có xóa được dữ liệu ở layer 4 không?" Đáp: chỉ che đi, dữ liệu vẫn nằm trong layer 4. Thời lượng: 3 phút.

**Slide gốc 4. Build cache.** Cho lớp tự sắp xếp 3 lệnh `COPY . .`, `RUN npm ci`, `COPY package*.json ./` trước khi lộ đáp án. Thời lượng: 3 phút.

**Slide gốc 5. Build context và .dockerignore.** Nhắc lại: `.dockerignore` đặt cạnh Dockerfile. Báo trước rằng cuối buổi sẽ cố tình ignore nhầm `package-lock.json` để phá lỗi. Thời lượng: 2 phút.

**Slide gốc 6. Kiến trúc multi-stage.** Đi theo mũi tên từ trái sang phải. Nhấn mạnh: chỉ stage cuối thành image, các stage trước chỉ còn trong build cache. Thời lượng: 3 phút.

**Slide gốc 7. Cách hoạt động của multi-stage và cache.** Hỏi: "Nếu tôi sửa package-lock.json thì layer nào chạy lại?" Đáp: từ `npm ci` trở đi. Thời lượng: 2 phút.

**Slide gốc 8. Base image, non-root, tag.** Nhắc: tin số bạn đo bằng `docker image ls`, không tin con số trong slide. Alpine dùng musl nên vài thư viện native có thể lỗi, khi đó dùng slim. Thời lượng: 3 phút.

**Slide gốc 9. Demo 1 - Baseline naive.** Gợi ý đáp án: base image Debian đầy đủ. Số thật của máy bạn sẽ khác, miễn là trên 1 GB. Thời lượng: 3 phút.

**Slide gốc 10. Demo 2 - Rò rỉ .env và context phình to.** Dừng lại ở kết quả `cat`. Hỏi lớp: "Nếu push công khai thì sao?" Giá trị mật khẩu ở đây là giả. Thời lượng: 3 phút.

**Slide gốc 11. Demo 3 - Mất cache rồi sửa.** Thông báo lỗi của `cat` có thể hơi khác tùy phiên bản busybox, ý chính là file không tồn tại. Size mong đợi khoảng 200-250 MB. Câu chốt: "Vì sao lần này nhanh hơn, layer nào lấy từ cache?" Dọn: `docker rmi hello-node:demo-naive hello-node:demo-opt`. Thời lượng: 5 phút.

**Slide gốc 12. Hands-on L1 - Baseline, .dockerignore, so sánh.** Lưu ý quan trọng: sau khi thêm `.dockerignore`, size gần như không đổi vì vấn đề chính là base image. Yêu cầu học viên ghi nhận điều này vào report. Thời lượng: 20 phút.

**Slide gốc 13. Hands-on L1 - Optimized và starter-project.** Số thứ tự bước (`4/4`) có thể khác tùy phiên bản Docker. Nhắc học viên đừng hoảng khi thấy `(health: starting)` trong 30 giây đầu. Thời lượng: 20 phút.

**Slide gốc 14. Hands-on L2 - Thử thách tự làm.** Gợi ý nếu bí: bắt đầu từ hai stage, stage `deps` chỉ chép manifest. Nếu `npm ci` báo thiếu lockfile, kiểm tra `.dockerignore`. L2 có thể hoàn thành sau giờ. Thời lượng: phần còn lại của giờ lab.

**Slide gốc 15. Lỗi thường gặp.** Hỏi nhanh: "Triệu chứng nào bạn dễ gặp nhất ở CI?" Thời lượng: 2 phút.

**Slide gốc 16. Debug - "not found" dù file có thật.** Cho học viên tự điều tra theo thứ tự trên trước khi lộ nguyên nhân. Đây là họ lỗi của tình huống 05 (`examples/troubleshooting/scenario-05/`). Thời lượng: 5 phút.

**Slide gốc 17. Thử thách cuối buổi.** Đáp án gợi ý: không, dùng tag `1.0.1` hoặc digest; xem layer nào mất cache và `.dockerignore` thiếu `.git`, `*.md`; `docker run --rm --entrypoint id image`; nó chỉ lọc context. Thời lượng: 5 phút.

**Slide gốc 18. Recap.** Nhắc nộp bài vào `lab-10/` với bảng so sánh trước/sau, không commit `.env` và `big.bin`. Thời lượng: 2 phút.

## Lưu ý riêng cho người dạy

- Từ Docker 29, `docker image ls` có hai cột `DISK USAGE` và `CONTENT SIZE`. Hướng dẫn học viên lấy số ở `DISK USAGE`; xem thêm [Walkthrough tuần 5](../walkthroughs/week-05.md).
- Sau khi thêm `.dockerignore`, size của image naive gần như không đổi: đây là điểm học viên hay hiểu sai, hãy hỏi lại ở phần review.
- Kết quả `(health: starting)` trong 30 giây đầu là bình thường (`--interval=30s`).
- Học viên làm L2 thử thách 4 (stage test) hay gặp `# tests 0` vì `.dockerignore` của backend loại thư mục `tests`; kiểm tra log có dòng test thật.
- Hướng điều tra lỗi `"/package-lock.json": not found` cho học viên tự đi từng bước (đọc lỗi, `ls`, `cat .dockerignore`); chỉ lộ nguyên nhân gốc sau khi họ đã thử.
