# Ngày 11–14 · Sửa lỗi, hoàn thiện, demo

> **Tóm tắt:** Bốn ngày cuối của Lộ trình Cơ bản, mỗi ngày khoảng 2 giờ: bù bài và sửa lỗi, tự gỡ ba tình huống hỏng, dọn dự án cho chạy được từ máy trống, rồi demo 10 phút.

Mười ngày đầu bạn đã làm ra Club app. Bốn ngày này không học thêm công cụ mới. Mục tiêu là **chắc tay**: ngày nào thiếu thì bù, gặp lỗi thì tự sửa, và chứng minh dự án chạy được trên máy khác.

## Ngày 11: Bù bài và làm quen với lỗi

- [ ] Xem lại các ngày chưa xong (bảng ở [Kế hoạch 14 ngày](basic.md#ke-hoach-14-ngay)), làm cho đủ phần "Nộp bài" của mỗi ngày.
- [ ] Làm tình huống [Website không chạy được](../examples/troubleshooting/scenario-01/README.md). Chỉ có triệu chứng, bạn đi tìm nguyên nhân.
- [ ] Làm tình huống [Container tắt ngay sau khi chạy](../examples/troubleshooting/scenario-02/README.md).

Mỗi tình huống ghi vào `notes/day-11.md` năm dòng: triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, cách phòng tránh.

## Ngày 12: Thêm một tình huống và một thử thách

- [ ] Làm tình huống [Dữ liệu biến mất sau khi cập nhật](../examples/troubleshooting/scenario-04/README.md) (liên quan tới volume ở Ngày 7).
- [ ] Chọn **một** thử thách tùy chọn: [Dockerfile](../labs/week-05/session-09-challenge.md), [Compose](../labs/week-07/session-13-challenge.md) hoặc [Publish image](../labs/week-09/session-18-challenge.md).
- [ ] Ghi kết quả vào `notes/day-12.md`.

## Ngày 13: Hoàn thiện dự án

Dự án của bạn phải **chạy được từ máy trống** theo đúng những gì bạn viết trong README.

- [ ] Viết `club/README.md`: dự án làm gì, chạy bằng lệnh nào, mở ở địa chỉ nào.
- [ ] Không còn file bí mật trong Git: `.env` nằm trong `.gitignore`, chỉ có `.env.example`.
- [ ] Clone repo vào một thư mục mới, làm theo đúng README, `docker compose up` chạy được.
- [ ] Workflow CI xanh, image mới nhất có trên GHCR.
- [ ] Vẽ một sơ đồ đơn giản: web, API, database, GitHub Actions, GHCR.

## Ngày 14: Demo 10 phút

Demo cho mentor hoặc bạn cùng lớp, theo thứ tự:

1. **Repo** (2 phút): cho xem cấu trúc, một Pull Request đã merge và check xanh.
2. **Chạy từ máy trống** (3 phút): clone, `docker compose up`, mở trang web, thêm một thành viên.
3. **Image trên GHCR** (2 phút): cho xem package, `docker pull` và chạy thử.
4. **Phá rồi sửa** (3 phút): cố ý làm hỏng một thứ (đổi mật khẩu DB sai, hoặc làm một test đỏ), đọc log, giải thích và sửa.

Cuối buổi mỗi người trả lời hai câu: "Phần nào mình làm tốt nhất?" và "Nếu làm lại, mình sẽ đổi gì?".

## Xong rồi thì sao

- **Muốn học tiếp:** [Lộ trình Nâng cao](advanced.md) đào sâu những phần đã tách ra, rồi sang Kubernetes và dự án cuối khóa.
- **Muốn đưa web lên mạng nhanh:** [Vibe Deploy](../vibe/index.md).
