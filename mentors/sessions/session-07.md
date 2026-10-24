# Kịch bản Buổi 07 – Container Fundamentals

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 07 – Container Fundamentals](../../labs/week-04/session-07.md). Slide: [Slide buổi 07 – Container Fundamentals](../../slides/02-docker/session-07.md). Hướng dẫn chấm: [Hướng dẫn chấm Tuần 4](../grading/week-04.md). Đáp án: [Đáp án Tuần 4](../walkthroughs/week-04.md).
:::

> **Tóm tắt:** Kịch bản dạy Buổi 07: khung thời gian, demo 5 bước (client và server, container đầu tiên, kernel dùng chung, Nginx với port mapping và bind mount, nhìn vào bên trong), câu hỏi cho lớp và ghi chú theo từng slide (14 slide).

## Khung thời gian

| Phần | Thời lượng | Nội dung |
| --- | --- | --- |
| Ôn tập | 15 phút | Ôn Giai đoạn 1: terminal WSL, process, port, HTTP |
| Kiến thức và demo | 30 phút | Khái niệm (VM và container, image, kiến trúc Docker) rồi demo 5 bước bên dưới |
| Thực hành | 60 phút | Lab L1: Chuẩn bị 5', Phần 1 (kiểm tra cài đặt) 10', Phần 2 (chạy Nginx) 10', Phần 3 (quan sát container) 15', Phần 4 (dừng, xóa, dọn) 5'; phần còn lại cho checklist và evidence. Học viên xong sớm làm thử thách L2 |
| Review | 15 phút | Gọi 2 học viên nhắc lại 1 ý, nhắc nộp bài |

Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo. Với lớp tự học, học viên làm thẳng phần Làm lab.

## Lưu ý cho người dạy

- Bài học viên giải thích khái niệm bằng ví von nhà hàng (container là suất ăn, image là công thức, daemon là bếp trưởng, registry là kho công thức). Bảng so sánh VM và container, namespaces, cgroups, tag và digest nằm trong mục "Tìm hiểu thêm" gập sẵn; mở ra khi lớp hỏi sâu. Sơ đồ chi tiết luồng `docker run` nằm ở [Buổi 07 – Thử thách thêm](../../labs/week-04/session-07-challenge.md).
- Người mới thường nhầm container với máy ảo nhỏ. Dùng ví von "chiếc hộp cơm đóng sẵn" (đồ ăn cùng gia vị, ăn ở đâu cũng giống nhau) và "bếp dùng chung" (kernel) để sửa lại.
- Lệnh `docker run` ở bảng "Gặp lỗi?" của bài học viên chỉ giúp nhận biết lỗi; phần tự tạo lỗi "port is already allocated" và trùng tên container nằm ở mục "Phá lỗi nâng cao" của trang thử thách. Cho lớp tự điều tra 5 phút trước khi giải thích.
- Học viên làm trong terminal WSL Ubuntu: Git Bash trả `uname -r` của Windows, sai mục đích bài.
- Demo dùng container `nginx-demo` ở cổng 8081, trùng cổng của lab (`lab07-web`). Dọn demo bằng `docker rm -f nginx-demo` trước khi học viên bắt đầu lab.

## Kịch bản demo

Mentor chiếu màn hình terminal WSL Ubuntu và thực hiện lần lượt. Mỗi bước dừng lại hỏi lớp trước khi gõ Enter. Bước 1 đến 3 ứng với slide 9, bước 4 và 5 ứng với slide 10.

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

Câu hỏi: "Sửa file `index.html` trên host rồi `curl` lại, nội dung có đổi không? Vì sao không cần build lại image?" Lưu ý: khi mount một file đơn lẻ, các editor thay file bằng file mới như `sed -i` hoặc vim có thể làm container vẫn thấy nội dung cũ do đổi inode. Hãy sửa bằng `cat > index.html` hoặc `echo ... >`, hoặc mount cả thư mục.

**Bước 5. Nhìn vào bên trong.**

```bash
docker ps
docker top nginx-demo
docker exec nginx-demo ps
```

Kết quả mong đợi: `docker ps` thấy `0.0.0.0:8081->80/tcp`; bên trong container `nginx: master process` là PID 1.

Mentor tổng kết: ví dụ đầy đủ có sẵn ở `examples/docker/nginx-demo/` (README và `index.html`, dùng cổng 38080 thay cho 8081 trong lab). Cuối demo dọn bằng `docker rm -f nginx-demo`.

## Câu hỏi cho lớp

- Vì sao có hai khối Client và Server trong `docker version`? Tắt Docker Desktop thì khối nào mất?
- Dòng `Unable to find image ... locally` nghĩa là gì? Lần chạy thứ hai khác thế nào?
- Alpine là distro khác, vì sao `uname -r` giống hệt host? Điều này nói gì về container so với VM?
- Sửa `index.html` trên host rồi `curl` lại, nội dung có đổi không? Vì sao không cần build lại image?
- Container Linux có chạy được bằng kernel Windows không? (Không; trên Windows, kernel của host là kernel Linux của WSL2.)
- Vì sao `latest` không có nghĩa là mới nhất thật sự?

## Ghi chú theo slide

Số slide theo [Slide buổi 07 – Container Fundamentals](../../slides/02-docker/session-07.md) (14 slide).

**Slide 1 – Mục tiêu buổi học.** Mở bài 2 phút. Nói rõ: hôm nay chỉ cần container Nginx chạy được và hiểu nền tảng; Dockerfile để Buổi 09. Hỏi lớp ai đã cài Docker Desktop trước.

**Slide 2 – Vấn đề: "máy tôi chạy được mà".** Kể lại tình huống bằng một ví dụ thật của CLB. Hỏi: "Ai từng gặp câu này?" (3 phút). Dẫn tới: đóng gói app cùng runtime.

**Slide 3 – Container giải quyết thế nào.** Chưa vào chi tiết kỹ thuật. Nhấn mạnh "đóng gói + chạy giống nhau". 2 phút.

**Slide 4 – VM và container.** Chỉ vào dòng Kernel nhiều nhất. Lưu ý: trên Windows, "kernel của host" là kernel Linux của WSL2. Hỏi: "Container Linux có chạy được bằng kernel Windows không?" (Không.) 4 phút.

**Slide 5 – Container thực chất là gì.** Không đi sâu kernel. Chỉ cần học viên nhớ: process được cô lập bằng namespaces và giới hạn bằng cgroups. 3 phút.

**Slide 6 – Image, container, registry.** Ví von: image như công thức, container như một suất ăn nấu ra từ công thức đó. Hỏi: "Vì sao `latest` không có nghĩa là mới nhất thật sự?" 3 phút.

**Slide 7 – Kiến trúc Docker.** Câu hỏi: nếu tắt Docker Desktop thì `docker version` mất khối nào? (Server.) 3 phút.

**Slide 8 – Luồng khi gõ `docker run`.** Đi từng mũi tên, dừng ở bước "chưa có thì pull". Liên hệ dòng `Unable to find image locally` ở demo. 3 phút.

**Slide 9 – Demo 1: Client, server, kernel dùng chung.** Bước 1 đến 3 của phần Kịch bản demo. Chạy trên màn hình chiếu, lớp dự đoán trước khi Enter. Nếu chỉ thấy Client và báo lỗi kết nối: Docker Desktop chưa chạy hoặc chưa bật WSL integration. Hỏi: "Điều này nói gì về container so với VM?" Chốt: container dùng chung kernel. 7 phút.

**Slide 10 – Demo 2: Nginx, port mapping, bind mount.** Bước 4 và 5 của phần Kịch bản demo. Nhắc lưu ý khi mount file đơn lẻ (editor đổi inode). Chốt `-p HOST:CONTAINER` và `nginx: master process` là PID 1. Chuyển sang lab. 6 phút.

**Slide 11 – Hands-on lab.**

- Chuẩn bị (5 phút): đi vòng kiểm tra từng bàn; ai báo `docker: command not found` thì chưa bật WSL integration.
- Phần 1 đến 4: Mentor đi quanh lớp. Nhắc ghi output vào evidence bằng `2>&1 | tee -a`. Phần 3 có thí nghiệm "file tạm biến mất khi xóa container", nối sang volume ở Buổi 12.
- Học viên xong sớm làm L2 ở trang thử thách. Gợi ý nếu kẹt: trong `docker info` tìm dòng `Registry`; `docker inspect --format` cho thấy `HostConfig.Memory` bằng `67108864`. Nhắc dọn `docker rm -f lab07-limit`.

**Slide 12 – Lỗi hay gặp: "port is already allocated".** Cho lớp tự điều tra 5 phút trước khi giải thích. Nguyên nhân gốc: một cổng host chỉ một process lắng nghe. Lệnh gây lỗi nằm ở trang thử thách (`lab07-web` giữ cổng 8081, `web-b` chạy cùng cổng). Sửa: `docker rm web-b`, chạy lại với `-p 8083:80`. Chọn 2 dòng hay gặp nhất trong bảng "Gặp lỗi?" để nói kỹ. Tình huống tương tự: tình huống 01 ở Buổi 08.

**Slide 13 – Thử thách.** Giao về nhà hoặc cho nhóm làm nhanh. Tiêu chí: có số liệu đo thật, không chỉ lý thuyết.

**Slide 14 – Recap.** Gọi 2 học viên tự nhắc lại 1 ý. Nhắc nộp bài vào `lab-07/` theo `templates/lab-template.md`. Buổi sau: Docker CLI. 15 phút review tổng.
