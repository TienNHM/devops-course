# Kịch bản 01: Website không chạy được

> **Mức độ:** L1 (Foundation). **Thời lượng gợi ý:** 20 phút. **Kiến thức:** Docker, port mapping.

## Bối cảnh

Bạn nhận lại máy của một thành viên cũ trong CLB. Bạn muốn chạy trang web giới thiệu CLB bằng Nginx và truy cập tại `http://localhost:28081`.

Mentor đã chuẩn bị môi trường bằng `setup.sh`. Bạn chỉ cần chạy lệnh dưới đây trong WSL2.

## Triệu chứng

```bash
docker run -d --name ts01-web -p 28081:80 nginx:1.27-alpine
```

Kết quả bạn nhận được:

```text
docker: Error response from daemon: ... Bind for 0.0.0.0:28081 failed: port is already allocated
```

Truy cập `http://localhost:28081` vẫn thấy một trang, nhưng không phải trang bạn vừa chạy lệnh để tạo.

## Yêu cầu

Không đổi lệnh `docker run` cho tới khi bạn hiểu chuyện gì đang xảy ra. Nộp báo cáo gồm 5 mục:

1. Triệu chứng (mô tả bằng lời của bạn, kèm output thật).
2. Nguyên nhân gốc.
3. Cách xác minh (lệnh bạn đã chạy và output chứng minh).
4. Giải pháp (và vì sao giải pháp đó an toàn).
5. Phòng tránh (làm sao để lần sau không gặp lại).

Dọn dẹp khi xong: `bash cleanup.sh`.

<details><summary>Gợi ý</summary>

Câu hỏi nên tự hỏi: ai đang lắng nghe port này, và nó nằm ở đâu trên máy? Hai lệnh `docker ps` và `ss -ltnp` trả lời hai nửa của câu hỏi.

</details>
