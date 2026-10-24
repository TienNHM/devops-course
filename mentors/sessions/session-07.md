# Kịch bản mentor – Buổi 07: Container Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 07 – Container Fundamentals](../../labs/week-04/session-07.md). Slide: [Slide buổi 07](../../slides/02-docker/session-07.md). Chấm bài: [Barem và hướng dẫn chấm tuần 4](../grading/week-04.md). Đáp án: [Walkthrough tuần 4](../walkthroughs/week-04.md).
:::

## Khung thời gian buổi 120 phút

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Giai đoạn 1: terminal WSL, process, port, HTTP |
| Kiến thức và demo | 30 phút | Khái niệm (VM và container, image, kiến trúc Docker) rồi demo 5 bước bên dưới |
| Thực hành | 60 phút | Lab L1, học viên xong sớm làm thử thách L2 |
| Review | 15 phút | Gọi 2 học viên nhắc lại 1 ý, nhắc nộp bài |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo. Với lớp tự học, học viên làm thẳng phần Làm lab.

Ghi chú về bài học viên đã cải tổ: phần giải thích khái niệm dùng ví von (nhà hàng, công thức và chiếc bánh) để người mới theo kịp; bảng so sánh VM và container, namespaces, cgroups, sơ đồ luồng `docker run` nằm trong mục "Tìm hiểu thêm" gập sẵn, mentor mở ra khi lớp hỏi sâu.

## Demo của mentor

Mentor chiếu màn hình terminal WSL Ubuntu và thực hiện lần lượt. Mỗi bước dừng lại hỏi lớp trước khi gõ Enter.

**Bước 1. Client và server là hai thứ khác nhau.**

```bash
docker version
```

Kết quả mong đợi (rút gọn, số phiên bản có thể khác):

```text
Client:
 Version:           27.x.x
 OS/Arch:           linux/amd64
Server: Docker Desktop
 Engine:
  Version:          27.x.x
  OS/Arch:          linux/amd64
```

Câu hỏi cho lớp: "Vì sao có hai khối Client và Server? Nếu tắt Docker Desktop thì khối nào mất?" (Khối Server báo lỗi không kết nối được daemon.)

**Bước 2. Container đầu tiên.**

```bash
docker run --rm hello-world
```

Kết quả mong đợi: đoạn chữ bắt đầu bằng `Hello from Docker!` kèm giải thích 4 bước (client liên hệ daemon, pull image, tạo container, stream output).

Câu hỏi: "Dòng `Unable to find image 'hello-world:latest' locally` nghĩa là gì? Lần chạy thứ hai sẽ khác thế nào?"

**Bước 3. Cùng kernel với host.**

```bash
uname -r
docker run --rm alpine:3.20 uname -r
```

Kết quả mong đợi: hai dòng giống nhau, dạng `5.15.x-microsoft-standard-WSL2` hoặc `6.x.x-microsoft-standard-WSL2`.

Câu hỏi: "Alpine là một distro khác, vì sao kernel giống hệt? Điều này nói gì về container so với VM?"

**Bước 4. Nginx, port mapping và bind mount.**

```bash
cd ~/devops-labs
mkdir -p demo && cd demo
cat > index.html <<'EOF'
<h1>Xin chào từ container Nginx</h1>
EOF
docker run -d --name nginx-demo -p 8081:80 \
  -v "$PWD/index.html:/usr/share/nginx/html/index.html:ro" \
  nginx:1.27-alpine
curl -s http://localhost:8081
```

Kết quả mong đợi: `docker run` in một chuỗi ID dài, `curl` in `<h1>Xin chào từ container Nginx</h1>`.

Câu hỏi: "Sửa file `index.html` trên host rồi `curl` lại, nội dung có đổi không? Vì sao không cần build lại image?" (Lưu ý: khi mount một file đơn lẻ, các editor thay file bằng file mới như `sed -i` hoặc vim có thể làm container vẫn thấy nội dung cũ do đổi inode. Hãy sửa bằng `cat > index.html` hoặc `echo ... >`, hoặc mount cả thư mục.)

**Bước 5. Nhìn vào bên trong.**

```bash
docker ps
docker top nginx-demo
docker exec nginx-demo ps
```

Kết quả mong đợi: `docker ps` thấy `0.0.0.0:8081->80/tcp`; bên trong container `nginx: master process` là PID 1.

Mentor tổng kết: ví dụ đầy đủ có sẵn ở `examples/docker/nginx-demo/` (README và `index.html`, dùng cổng 38080 thay cho 8081 trong lab). Cuối demo dọn bằng `docker rm -f nginx-demo`.

## Ghi chú giảng viên theo từng slide

Nguyên văn "Ghi chú giảng viên" (số slide theo bản trước khi thu gọn, các slide Demo, Lab, Break, Challenge đã được gộp trong bản mới) của [Slide buổi 07](../../slides/02-docker/session-07.md).

**Slide 1. Mục tiêu buổi học.** Mở bài 2 phút. Nói rõ: hôm nay chỉ cần container Nginx chạy được và hiểu nền tảng; Dockerfile để buổi 09. Hỏi lớp ai đã cài Docker Desktop trước.

**Slide 2. Vấn đề: "máy tôi chạy được mà".** Kể lại tình huống bằng một ví dụ thật của CLB. Hỏi: "Ai từng gặp câu này?" (3 phút). Dẫn tới: đóng gói app cùng runtime.

**Slide 3. Container giải quyết thế nào.** Chưa vào chi tiết kỹ thuật. Nhấn mạnh "đóng gói + chạy giống nhau". 2 phút.

**Slide 4. VM và container.** Chỉ vào dòng Kernel nhiều nhất. Lưu ý: trên Windows, "kernel của host" là kernel Linux của WSL2. Hỏi: "Container Linux có chạy được bằng kernel Windows không?" (không). 4 phút.

**Slide 5. Container thực chất là gì.** Không đi sâu kernel. Chỉ cần học viên nhớ: process được cô lập bằng namespaces và giới hạn bằng cgroups. 3 phút.

**Slide 6. Image, container, registry.** Ví von: image như class, container như object. Hỏi: "Vì sao `latest` không có nghĩa là mới nhất thật sự?" 3 phút.

**Slide 7. Kiến trúc Docker.** Câu hỏi: nếu tắt Docker Desktop thì `docker version` mất khối nào? (Server). 3 phút.

**Slide 8. Luồng khi gõ docker run.** Đi từng mũi tên, dừng ở bước "chưa có thì pull". Liên hệ dòng `Unable to find image locally` ở demo. 3 phút.

**Slide 9. Demo 1 – Client và server.** Chạy trên màn hình chiếu, lớp dự đoán trước khi Enter. Nếu chỉ thấy Client và báo lỗi kết nối: Docker Desktop chưa chạy hoặc chưa bật WSL integration. 4 phút.

**Slide 10. Demo 2 – Cùng kernel với host.** Hỏi: "Điều này nói gì về container so với VM?" Chốt: container dùng chung kernel. 3 phút.

**Slide 11. Demo 3 – Nginx, port mapping, bind mount.** Lưu ý khi mount file đơn lẻ: sửa bằng `sed -i` hoặc vim có thể đổi inode nên container vẫn thấy nội dung cũ; sửa bằng `echo ... >` hoặc mount cả thư mục. 4 phút.

**Slide 12. Demo 4 – Nhìn vào bên trong.** Chuyển sang lab. Nhắc: đây là phần Break nhẹ đầu tiên sẽ làm ở slide lỗi. 2 phút.

**Slide 13. Hands-on lab – chuẩn bị.** Đi vòng kiểm tra từng bàn: ai báo `docker: command not found` thì chưa bật WSL integration. 10 phút (60 phút lab tổng).

**Slide 14. Hands-on lab – L1 Foundation.** Mentor đi quanh lớp. Học viên xong sớm làm L2. Nhắc ghi output vào evidence. 35 phút.

**Slide 15. Hands-on lab – L2 Engineering.** Gợi ý nếu kẹt: trong `docker info` tìm dòng `Registry`; `docker inspect --format` cho thấy `HostConfig.Memory` bằng `67108864`. Nhắc dọn `docker rm -f web-limit`.

**Slide 16. Break – "port is already allocated".** Cho lớp tự điều tra 5 phút trước khi giải thích. Nguyên nhân gốc: một cổng host chỉ một process lắng nghe. Sửa: `docker rm web-b`, chạy lại với `-p 8083:80`. Tình huống tương tự: scenario-01.

**Slide 17. Lỗi thường gặp.** Chọn 2 dòng hay gặp nhất trong lớp để nói kỹ. 2 phút.

**Slide 18. Challenge.** Giao về nhà hoặc cho nhóm làm nhanh. Tiêu chí: có số liệu đo thật, không chỉ lý thuyết.

**Slide 19. Recap.** Gọi 2 học viên tự nhắc lại 1 ý. Nhắc nộp bài vào `lab-07/` theo `templates/lab-template.md`. Buổi sau: Docker CLI. 15 phút review tổng.

## Lưu ý riêng cho người dạy

- Người mới thường nhầm container với máy ảo nhỏ. Dùng ví von "chiếc hộp cơm đóng sẵn" (đồ ăn cùng gia vị, ăn ở đâu cũng giống nhau) và "bếp dùng chung" (kernel) để sửa lại.
- Lệnh `docker run` ở Phần Gặp lỗi? của bài học viên chỉ hướng dẫn nhận biết lỗi; phần tự tạo lỗi "port is already allocated" nằm trong mục "Phá lỗi nâng cao" gập sẵn. Cho lớp tự điều tra 5 phút trước khi giải thích.
- Học viên tự học nên làm trong terminal WSL Ubuntu: Git Bash trả `uname -r` của Windows, sai mục đích bài.
