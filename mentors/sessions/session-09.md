# Kịch bản buổi 09: Dockerfile

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 09 – Dockerfile](../../labs/week-05/session-09.md). Slide: [Slide buổi 09](../../slides/02-docker/session-09.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 5](../grading/week-05.md). Đáp án: [Đáp án tuần 5](../walkthroughs/week-05.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 09 trong 120 phút: khung thời gian, ranh giới với Buổi 10, demo 5 bước với `hello-node`, câu hỏi cho lớp và ghi chú theo từng slide.

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Buổi 07 và 08: container sống theo PID 1, `-p`, `-e` |
| Kiến thức và demo | 30 phút | Slide 1 đến 9: chỉ thị Dockerfile, build context, `CMD` và `ENTRYPOINT`; demo ở Slide 9 |
| Thực hành | 60 phút | Lab L1 (Phần 1 đến 4); L2 làm ở nhà nếu hết giờ |
| Review | 15 phút | Slide 12 và 13: gọi học viên nhắc lại 1 ý, nhắc nộp `lab-09/` |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo. Buổi 10 dồn vào thực hành, thử thách L2 và review bài làm.

## Ranh giới Buổi 09 và Buổi 10

Mỗi khái niệm chỉ dạy ở một buổi. Khi học viên hỏi về chủ đề của buổi kia, trả lời một câu rồi dẫn tới bài đó.

| Khái niệm | Dạy ở | Buổi 09 làm gì |
| --- | --- | --- |
| Chỉ thị Dockerfile, `ENV` và `-e`, `EXPOSE` và `-p`, `CMD` và `ENTRYPOINT`, exec form, PID 1 | Buổi 09 | Dạy đầy đủ |
| Build context và lỗi sai thư mục build (tình huống 05) | Buổi 09 | Dạy đầy đủ |
| Layer cache và thứ tự lệnh | Buổi 10 | Dockerfile của Buổi 09 đã viết đúng thứ tự (manifest trước, mã nguồn sau); chỉ nói "lý do học ở Buổi 10" |
| `.dockerignore`, rò rỉ `.env` | Buổi 10 | Không dạy; học viên giữ nguyên `.dockerignore` mẫu của `starter-project` |
| `USER node` (non-root), `--chown` | Buổi 10 | Không dạy; nhắc "container đang chạy bằng root, sửa ở Buổi 10" |
| Ghim tag, `latest`, digest | Buổi 10 | Dùng `node:22-alpine`, một dòng giải thích, trỏ sang Buổi 10 |

Các nội dung về cache trên `club-api`, `USER node`, `.dockerignore` với file rác, `HEALTHCHECK` và so sánh với Dockerfile multi-stage nằm ở [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md). Bước 3 và 4 của demo (sửa một dòng rồi build lại, so sánh root và size) chỉ là phần "mồi": cho lớp thấy hiện tượng, nói "buổi sau học vì sao" rồi dừng, không giải thích sâu.

## Kịch bản demo (Slide 9)

Mục đích: cho cả lớp thấy cùng một ứng dụng nhỏ, hai kết quả khác nhau chỉ vì cách viết Dockerfile. Dùng `examples/docker/hello-node/`. Mentor dùng port 3100 để không đụng với lớp. Tổng thời gian khoảng 9 phút.

**Bước 1. Chuẩn bị bản sao để sửa thoải mái.**

```bash
mkdir -p ~/demo && cp -r ~/devops-course/examples/docker/hello-node ~/demo/ && cd ~/demo/hello-node
cat Dockerfile.naive
```

Kết quả mong đợi: Dockerfile ngắn 6 dòng hiệu lực: `FROM node:22`, `WORKDIR /app`, `COPY . .`, `RUN npm install`, `EXPOSE 3000`, `CMD`. Cho lớp đọc trước khi build và để ý thứ tự `COPY . .` rồi `RUN npm install`.

**Bước 2. Build bản "ngây thơ" và chạy.**

```bash
docker build -f Dockerfile.naive -t hello-node:naive .
docker run -d --name demo-naive -p 3100:3000 hello-node:naive
curl -s localhost:3100/health
```

Kết quả mong đợi: build mất vài chục giây (lần đầu kéo image), `curl` in `{"status":"healthy"}`.

**Bước 3. Sửa một dòng mã nguồn rồi build lại (mồi).**

```bash
echo "// sua nhe" >> server.js
docker build -f Dockerfile.naive -t hello-node:naive .
```

Kết quả mong đợi: bước `RUN npm install` chạy lại từ đầu dù `package.json` không đổi, vì `COPY . .` đứng trước và nội dung context đã đổi. Chỉ nêu hiện tượng, hẹn Buổi 10.

**Bước 4. So sánh với bản tối ưu (mồi).**

```bash
docker build -f Dockerfile.optimized -t hello-node:opt .
echo "// sua nua" >> server.js
docker build -f Dockerfile.optimized -t hello-node:opt .
docker image ls hello-node
docker exec demo-naive id
```

Kết quả mong đợi: lần build thứ hai của bản `opt` hiện `CACHED` ở bước cài dependency; bảng image cho thấy `naive` lớn hơn nhiều `opt` (base Debian đầy đủ so với Alpine, chênh vài trăm MB trở lên); `id` của bản naive in `uid=0(root)`.

**Bước 5. Dọn dẹp.**

```bash
docker rm -f demo-naive
```

Câu hỏi cho lớp:

- Nếu đổi thứ tự hai dòng `COPY package.json` và `COPY . .`, bạn đoán lần build thứ hai nhanh hay chậm? Vì sao?
- Container naive chạy bằng root: nếu API bị khai thác lỗ hổng thì kẻ tấn công có gì trong tay?
- Bản `opt` không chép `tests/` hay `.git`. Bạn nghĩ một Dockerfile tốt nên chép gì vào image?

## Ghi chú theo slide

Slide buổi 09 có 13 slide. Thời lượng trong ngoặc là thời gian gợi ý.

**Slide 1. Mục tiêu buổi học (2 phút).** Ôn nhanh: container sống theo PID 1, `-p`, `-e`. Nói rõ hôm nay học viên tự viết Dockerfile từ đầu. Dòng cuối của slide báo trước phần dành cho Buổi 10: cache, `.dockerignore`, `USER node`, tag.

**Slide 2. Vấn đề: ai build cũng ra image khác (2 phút).** Nhấn: CI/CD sau này (từ Buổi 15) dùng lại đúng Dockerfile này.

**Slide 3. Dockerfile là công thức, image là sản phẩm (3 phút).** Hỏi: "Chỉ thị nào chạy lúc build, chỉ thị nào chạy lúc run?" Gọi 2 học viên. Chốt: `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata.

**Slide 4. Các chỉ thị chính (3 phút).** Nhấn mạnh `EXPOSE` không publish cổng, vẫn cần `-p`. `ENV` không đặt secret.

**Slide 5. Build context (4 phút).** Hỏi: "Nếu build ở thư mục cha của Dockerfile thì lỗi gì?" Để dành đáp án cho Slide 11.

**Slide 6. Từ source đến container (2 phút).** Đi theo sơ đồ từ trái sang phải. Chỉ vào layer `npm ci` và hỏi: nó phụ thuộc vào file nào? (chỉ hai file manifest). Đây chỉ là câu hỏi mồi; phần cache học ở Buổi 10.

**Slide 7. CMD, ENTRYPOINT, exec form (3 phút).** Ví dụ gợi ý: một người muốn chạy API, một người muốn vào debug bằng `sh`; `CMD` dễ cho người thứ hai.

**Slide 8. PID 1 và docker stop (2 phút).** Nói trước kết quả sẽ thấy ở lab Phần 3: `docker stop` mất khoảng 10 giây, `--init` dưới 1 giây. Cách sửa tận gốc là bắt `SIGTERM` trong mã, như `examples/docker/hello-node/server.js`.

**Slide 9. Demo (9 phút).** Chạy demo 5 bước ở trên. Cho lớp dự đoán trước khi bước 3 và bước 4 chạy. Nếu thiếu giờ, bỏ bước 4 và chỉ nói "buổi sau ta sửa".

**Slide 10. Lab, bốn phần (5 phút giới thiệu).** Nhắc: image `club-api:lab9`, container `club-api-lab9`, cổng host 3001. `/ready` trả `503` ở Phần 1 vì chưa có PostgreSQL; bình thường ở buổi này, Buổi 11 và 12 sẽ nối DB. Lỗi hay gặp đầu buổi: học viên chưa clone repo giáo trình vào WSL, nên kiểm tra `ls ~/devops-course/starter-project/backend` trước. Phần 2 dùng `sleep 1` trước `docker logs` nếu log trống và dọn `docker rm -f club-api-port`.

**Slide 11. Break: build sai context, tình huống 05 (5 phút).** Cho lớp tự điều tra bằng `pwd`, `ls` trước khi gợi ý. Học viên chỉ nhận triệu chứng như ở `examples/troubleshooting/scenario-05`, mentor không nói trước nguyên nhân. Phòng tránh: ghi lệnh build chuẩn vào README hoặc CI.

**Slide 12. Lỗi thường gặp (2 phút).** Chọn 2 dòng liên quan đến lỗi lớp vừa gặp trong lab.

**Slide 13. Recap và thử thách (khoảng 15 phút review).** Gọi học viên nhắc lại 1 ý. Nhắc nộp `lab-09/` theo mẫu lab, không commit `.env`. Gợi ý cho thử thách ở nhà, câu điều tra build context: context và `working-directory` trong workflow, `.dockerignore`, file có được commit không, phân biệt hoa thường. Buổi sau: tối ưu image.

## Lưu ý riêng cho người dạy

- `/ready` trả `503` là kết quả đúng của tuần này. Nếu học viên hoảng, nhắc lại: chưa có Postgres.
- `docker stop` mất khoảng 10 giây vì `server.js` của backend không bắt `SIGTERM`. Đây là phần dạy về PID 1 và exec form; thử `--init` để thấy dừng dưới 1 giây.
- Lệnh `time docker stop` chỉ có ý nghĩa nếu container đang chạy; nhắc học viên chạy lại container trước khi đo.
- Học viên làm trong `/mnt/c` sẽ build chậm và sai quyền: kiểm tra `pwd` ngay đầu buổi.
- Kịch bản sai build context: học viên chỉ nhận triệu chứng. Hướng điều tra đầy đủ nằm trong phần "Phá lỗi nâng cao" của [Buổi 09 – thử thách thêm](../../labs/week-05/session-09-challenge.md) và trong [Đáp án tuần 5](../walkthroughs/week-05.md).
