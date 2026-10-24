# Kịch bản mentor – Buổi 09: Dockerfile

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 09 – Dockerfile](../../labs/week-05/session-09.md). Slide: [Slide buổi 09](../../slides/02-docker/session-09.md). Chấm bài: [Barem và hướng dẫn chấm tuần 5](../grading/week-05.md). Đáp án: [Walkthrough tuần 5](../walkthroughs/week-05.md).
:::

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Buổi 07 và 08: container sống theo PID 1, `-p`, `-e` |
| Kiến thức và demo | 30 phút | Chỉ thị Dockerfile, build context, CMD và ENTRYPOINT; demo 5 bước bên dưới |
| Thực hành | 60 phút | Lab L1 (Phần 1 đến 4), L2 làm ở nhà nếu hết giờ |
| Review | 15 phút | Gọi học viên nhắc lại 1 ý, nhắc nộp `lab-09/` |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai (Buổi 10) dồn vào thực hành, thử thách L2 và review bài làm.

## Ranh giới Buổi 09 và Buổi 10 (đọc trước khi dạy)

Sau cải tổ, mỗi khái niệm chỉ dạy ở một buổi:

| Khái niệm | Dạy ở | Buổi 09 làm gì |
| --- | --- | --- |
| Chỉ thị Dockerfile, `ENV` và `-e`, `EXPOSE` và `-p`, `CMD` và `ENTRYPOINT`, exec form, PID 1 | Buổi 09 | Dạy đầy đủ |
| Build context và lỗi sai thư mục build (tình huống 05) | Buổi 09 | Dạy đầy đủ |
| Layer cache và thứ tự lệnh | Buổi 10 | Dockerfile của Buổi 09 đã viết đúng thứ tự (manifest trước, mã nguồn sau); chỉ nói "lý do học ở Buổi 10" |
| `.dockerignore`, rò rỉ `.env` | Buổi 10 | Không dạy; học viên giữ nguyên `.dockerignore` mẫu của starter-project |
| `USER node` (non-root), `--chown` | Buổi 10 | Không dạy; nhắc "container đang chạy bằng root, sửa ở Buổi 10" |
| Ghim tag, `latest`, digest | Buổi 10 | Dùng `node:22-alpine`, một dòng giải thích, link sang Buổi 10 |

Các phần club-api cũ về cache, `USER node`, `.dockerignore` và thử thách `HEALTHCHECK` đã chuyển sang [Buổi 10 – thử thách thêm](../../labs/week-05/session-10-challenge.md). Bước 3 và 4 của demo bên dưới (sửa một dòng rồi build lại, so sánh root và size) giờ là phần "mồi": cho lớp thấy hiện tượng, nói "buổi sau học vì sao" rồi dừng, đừng giải thích sâu.

## Demo của mentor

Mục đích: cho cả lớp thấy cùng một ứng dụng nhỏ, hai kết quả khác nhau chỉ vì cách viết Dockerfile. Dùng `examples/docker/hello-node/`. Mentor dùng port 3100 để không đụng với lớp.

**Bước 1. Chuẩn bị bản sao để sửa thoải mái.**

```bash
mkdir -p ~/demo && cp -r ~/devops-course/examples/docker/hello-node ~/demo/ && cd ~/demo/hello-node
cat Dockerfile.naive
```

Kết quả mong đợi: Dockerfile ngắn 6 dòng hiệu lực: `FROM node:22`, `WORKDIR /app`, `COPY . .`, `RUN npm install`, `EXPOSE 3000`, `CMD`.

**Bước 2. Build bản "ngây thơ" và chạy.**

```bash
docker build -f Dockerfile.naive -t hello-node:naive .
docker run -d --name demo-naive -p 3100:3000 hello-node:naive
curl -s localhost:3100/health
```

Kết quả mong đợi: build mất vài chục giây (lần đầu kéo image), `curl` in `{"status":"healthy"}`.

**Bước 3. Sửa một dòng mã nguồn rồi build lại.**

```bash
echo "// sua nhe" >> server.js
docker build -f Dockerfile.naive -t hello-node:naive .
```

Kết quả mong đợi: bước `RUN npm install` chạy lại từ đầu dù `package.json` không đổi, vì `COPY . .` đứng trước và nội dung context đã đổi.

**Bước 4. So sánh với bản tối ưu.**

```bash
docker build -f Dockerfile.optimized -t hello-node:opt .
echo "// sua nua" >> server.js
docker build -f Dockerfile.optimized -t hello-node:opt .
docker image ls hello-node
docker exec demo-naive id
```

Kết quả mong đợi: lần build thứ hai của bản `opt` hiện `CACHED` ở bước cài dependency; bảng image cho thấy `naive` lớn hơn nhiều `opt` (base Debian đầy đủ so với Alpine, cỡ vài trăm MB chênh lệch trở lên); `id` của bản naive in `uid=0(root)`.

**Bước 5. Dọn dẹp.**

```bash
docker rm -f demo-naive
```

Câu hỏi mentor nên hỏi lớp:

- Nếu đổi thứ tự hai dòng `COPY package.json` và `COPY . .`, bạn đoán lần build thứ hai nhanh hay chậm? Vì sao?
- Container naive chạy bằng root: nếu API bị khai thác lỗ hổng thì kẻ tấn công có gì trong tay?
- Bản `opt` không chép `tests/` hay `.git`. Bạn nghĩ một Dockerfile tốt nên chép gì vào image?

## Ghi chú giảng viên từ slide (theo slide gốc)

Các ghi chú dưới đây lấy nguyên văn từ slide cũ; slide mới đã gộp lại còn 13 slide và không còn ghi chú.

**Slide gốc 1. Mục tiêu buổi học.** Ôn 2 phút: container sống theo PID 1, `-p`, `-e`. Nói rõ hôm nay học viên tự viết Dockerfile từ đầu.

**Slide gốc 2. Vấn đề: ai build cũng ra image khác.** Nhấn: CI/CD sau này dùng lại đúng Dockerfile này (từ buổi 13). 2 phút.

**Slide gốc 3. Dockerfile là công thức, image là sản phẩm.** Hỏi: "Chỉ thị nào chạy lúc build, chỉ thị nào chạy lúc run?" Gọi 2 học viên. 3 phút.

**Slide gốc 4. Các chỉ thị chính.** Nhấn mạnh `EXPOSE` không publish cổng; vẫn cần `-p`. 3 phút.

**Slide gốc 5. Build context.** Hỏi: "Nếu build ở thư mục cha của Dockerfile thì lỗi gì?" (để dành cho slide Break). 3 phút.

**Slide gốc 6. Layer cache.** Chỉ vào layer `npm ci` và hỏi: nó phụ thuộc vào file nào? (chỉ hai file manifest). 4 phút. (Sau cải tổ: chỉ hỏi để mồi, phần cache học ở Buổi 10.)

**Slide gốc 7. CMD, ENTRYPOINT, exec form.** Ví dụ gợi ý: một người muốn chạy API, một người muốn vào debug bằng `sh`; `CMD` dễ cho người thứ hai. 3 phút.

**Slide gốc 8. Demo 1 – Dockerfile ngây thơ.** Dùng bản sao ở `~/demo` để sửa thoải mái. Cho lớp đọc `cat Dockerfile.naive` trước khi build: `COPY . .` rồi `RUN npm install`. 3 phút.

**Slide gốc 9. Demo 2 – Sửa một dòng, build lại.** Hỏi: "Nếu đổi thứ tự `COPY package.json` và `COPY . .` thì nhanh hay chậm?" Cho lớp dự đoán rồi mới chiếu bản tối ưu. 3 phút.

**Slide gốc 10. Demo 3 – Bản tối ưu và so sánh.** Hỏi: nếu API bị khai thác lỗ hổng khi chạy bằng root thì kẻ tấn công có gì trong tay? 4 phút.

**Slide gốc 11. Lab – chuẩn bị.** Chủ ý xóa `.dockerignore` mẫu để học viên tự thấy vì sao cần nó. Lỗi hay gặp: học viên chưa clone repo giáo trình vào WSL. 5 phút. (Sau cải tổ: bài học viên không còn xóa `.dockerignore` mẫu; việc đó chuyển sang Buổi 10. Lỗi hay gặp vẫn đúng: kiểm tra `ls ~/devops-course/starter-project/backend` trước.)

**Slide gốc 12. Lab – Dockerfile đầu tiên.** `/ready` là 503 vì chưa có PostgreSQL; bình thường ở buổi này, buổi 11 và 12 sẽ nối DB. 12 phút.

**Slide gốc 13. Lab – tối ưu cache.** Cho học viên tự đo hai lần build (trước và sau sửa Dockerfile) để thấy khác biệt. 10 phút. (Chuyển sang Buổi 10.)

**Slide gốc 14. Lab – ENV và USER an toàn.** `USER node` đặt sau `npm ci` để bước cài vẫn có quyền ghi. Nhắc `sleep 1` trước `docker logs` nếu log trống, và dọn `docker rm -f club-api-port`. 10 phút. (Phần `ENV` và `-e` ở lại Buổi 09; `USER node` chuyển sang Buổi 10.)

**Slide gốc 15. Lab – CMD, ENTRYPOINT và dừng gọn.** Cách sửa tận gốc là bắt `SIGTERM` trong mã, như `examples/docker/hello-node/server.js`. 10 phút.

**Slide gốc 16. Lab – .dockerignore và file lọt vào image.** Đây là slide gây ấn tượng nhất: ai pull image đều đọc được `.env`. Bỏ `tests` khỏi image runtime là chủ ý, test chạy ở CI. 8 phút. (Chuyển sang Buổi 10; dùng slide này làm demo ở đó.)

**Slide gốc 17. Lab – L1 và L2.** Gợi ý HEALTHCHECK: Alpine có `wget` (BusyBox) nhưng không có `curl`; dùng `127.0.0.1` thay `localhost`; dùng `--start-period`. Buổi 10 sẽ đi sâu multi-stage.

**Slide gốc 18. Break – build sai context (tình huống 05).** Cho lớp tự điều tra bằng `pwd`, `ls` trước khi gợi ý. Học viên chỉ nhận triệu chứng như ở `examples/troubleshooting/scenario-05`. Phòng tránh: ghi lệnh build chuẩn vào README hoặc CI. 5 phút.

**Slide gốc 19. Lỗi thường gặp.** Chọn 2 dòng liên quan đến lỗi lớp vừa gặp trong lab. 2 phút.

**Slide gốc 20. Challenge.** Gợi ý cho câu cuối: context và `working-directory` trong workflow, `.dockerignore`, file có được commit không, phân biệt hoa thường. Giao về nhà.

**Slide gốc 21. Recap.** Gọi học viên nhắc lại 1 ý. Nhắc nộp `lab-09/` theo `templates/lab-template.md`, không commit `.env`. Buổi sau: tối ưu image với multi-stage. 15 phút review.

## Lưu ý riêng cho người dạy

- `/ready` trả `503` là kết quả đúng của tuần này. Nếu học viên hoảng, nhắc lại: chưa có Postgres.
- `docker stop` mất khoảng 10 giây vì `server.js` của backend không bắt `SIGTERM`. Đây là phần dạy về PID 1 và exec form; thử `--init` để thấy dừng dưới 1 giây.
- Lệnh `time docker stop` chỉ có ý nghĩa nếu container đang chạy; nhắc học viên chạy lại container trước khi đo.
- Học viên làm trong `/mnt/c` sẽ build chậm và sai quyền: kiểm tra `pwd` ngay đầu buổi.
- Kịch bản sai build context: học viên chỉ nhận triệu chứng, mentor không nói trước nguyên nhân. Hướng điều tra đầy đủ nằm trong phần "Phá lỗi nâng cao" của bài học viên và trong [Walkthrough tuần 5](../walkthroughs/week-05.md).
