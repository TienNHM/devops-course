# Buổi 09 – Thử thách thêm

[Buổi 09 – Dockerfile](session-09.md) · [Bài tập tuần 5](../../assignments/weekly/week-05.md) · [Hub tuần 5](README.md)

> **Tóm tắt:** Thử thách L2 và phá lỗi nâng cao của Buổi 09: giải thích CMD và ENTRYPOINT, điều tra lỗi sai build context. Tùy chọn, làm ở nhà sau khi xong lab bắt buộc.

## Thử thách thêm (L2, tùy chọn, làm ở nhà)

::: warning Tự thử 15 phút trước khi mở
Mở gợi ý hoặc lời giải quá sớm làm mất phần học. Hãy tự thử ít nhất 15 phút.
:::

**Thử thách 1. Giải thích CMD và ENTRYPOINT.** Trong `report.md`, viết một đoạn ngắn (5-8 dòng) giải thích: khi nào bạn chọn `CMD`, khi nào chọn `ENTRYPOINT`, vì sao dùng exec form; kèm bằng chứng lệnh `docker run` bạn đã thử ở Phần 3.

::: details Gợi ý
Nghĩ về hai người dùng image: một người muốn chạy API, một người muốn vào debug bằng `sh`. Với `CMD`, người thứ hai chỉ cần thêm lệnh sau tên image. Với `ENTRYPOINT`, họ phải nhớ `--entrypoint`. Về exec form, hãy so sánh PID 1 và tín hiệu khi `docker stop`.
:::

::: details Lời giải
Chọn `CMD ["node", "server.js"]` cho ứng dụng vì mặc định phải chạy API nhưng vẫn dễ ghi đè (`docker run image sh`) khi debug. Chọn `ENTRYPOINT` khi image đóng vai một công cụ luôn chạy một chương trình và người dùng chỉ đổi tham số, và có thể kết hợp với `CMD` làm tham số mặc định. Exec form không qua `/bin/sh -c`, nên process của ứng dụng nhận trực tiếp tín hiệu từ `docker stop`; shell form thêm một lớp shell và có thể làm tín hiệu không đến được ứng dụng.
:::

**Thử thách 2. Điều tra lỗi sai build context.** Làm mục "Phá lỗi nâng cao" ở cuối trang này, ghi kết quả vào `report.md`. Tiêu chí: nêu được nguyên nhân gốc và hai cách sửa khác nhau.

**Thử thách 3. Dockerfile cho club-api tối ưu hơn.** Thêm cache đúng thứ tự, `USER node`, `.dockerignore`, `HEALTHCHECK` và so sánh với Dockerfile multi-stage của dự án. Phần này cần kiến thức của Buổi 10 nên nằm ở [Buổi 10 – thử thách thêm](session-10-challenge.md).

## Phá lỗi nâng cao {#pha-loi-nang-cao}

**Tình huống: build thất bại vì sai build context.** Liên quan tới Tình huống 05 trong `examples/troubleshooting/scenario-05/` (mentor phát đề, chỉ cung cấp triệu chứng).

**Cách phá.** Đứng ở thư mục cha của `source` rồi build:

```bash
cd ~/devops-labs/lab-09
docker build -t club-api:lab9 .
```

**Triệu chứng.**

```text
ERROR: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

Nếu bạn chỉ định `-f source/Dockerfile` nhưng vẫn để context là `.` ở thư mục cha, Dockerfile được tìm thấy nhưng bước `COPY package.json package-lock.json ./` báo lỗi dạng `"/package.json": not found`.

```bash
docker build -f source/Dockerfile -t club-api:lab9 .
```

**Hướng điều tra từng bước.**

1. Đọc kỹ dòng lỗi đầu tiên: đang thiếu Dockerfile hay thiếu file trong `COPY`?
2. Chạy `pwd` và `ls`: bạn đang đứng ở đâu, Dockerfile và `package.json` nằm ở thư mục nào?
3. Nhớ lại: đối số cuối của `docker build` là context; `COPY` tìm file theo context, không theo vị trí Dockerfile.
4. Thử hai cách: đổi thư mục (`cd source`) hoặc giữ vị trí nhưng trỏ rõ `-f source/Dockerfile` và context `source`.

```bash
docker build -f source/Dockerfile -t club-api:lab9 source
```

**Nguyên nhân gốc.** Context không chứa các file mà Dockerfile tham chiếu. Lỗi nằm ở lệnh build, không phải ở nội dung Dockerfile.

**Cách phòng tránh.** Luôn build từ thư mục chứa Dockerfile hoặc ghi rõ cả `-f` lẫn context; đưa lệnh build chuẩn vào README; ghi lệnh vào script hoặc CI để không phụ thuộc trí nhớ.

## Tìm hiểu thêm: build diễn ra thế nào

**Build diễn ra thế nào.** (1) Docker CLI nén thư mục context và gửi cho builder; context càng lớn càng chậm. (2) Builder đọc Dockerfile từ `FROM`, kéo base image `node:22-alpine` nếu chưa có. (3) Mỗi `COPY`, `RUN` tạo một layer mới. (4) `ENV`, `EXPOSE`, `CMD` chỉ ghi metadata. (5) `docker run` tạo container từ image, thêm một lớp ghi mỏng và chạy `CMD` (hoặc `ENTRYPOINT` cộng `CMD`).
