# Ngày 11–14 · Sửa lỗi, hoàn thiện, demo

> **Tóm tắt:** Bốn ngày cuối của Lộ trình Cơ bản, mỗi ngày khoảng 2 giờ: bù ngày chưa xong, tự gỡ ba tình huống hỏng, dựng lại dự án từ đầu, dọn dự án cho chạy được từ máy trống, rồi demo 10 phút.

Mười ngày đầu bạn đã làm ra Club app. Bốn ngày này không học thêm công cụ mới. Mục tiêu là **chắc tay**: ngày nào thiếu thì bù, gặp lỗi thì tự sửa, và chứng minh dự án chạy được trên máy khác.

## Ngày 11: Bù ngày và làm quen với lỗi

- [ ] Xem lại các ngày chưa xong (bảng ở [Kế hoạch 14 ngày](basic.md#ke-hoach-14-ngay)), làm cho đủ các bước của ngày đó.
- [ ] Làm tình huống [Website không chạy được](../examples/troubleshooting/scenario-01/README.md). Chỉ có triệu chứng, bạn đi tìm nguyên nhân.
- [ ] Làm tình huống [Container tắt ngay sau khi chạy](../examples/troubleshooting/scenario-02/README.md).

Mỗi tình huống, tự nói được năm điều: triệu chứng, nguyên nhân gốc, cách xác minh, cách sửa, cách phòng tránh.

## Ngày 12: Một tình huống nữa và làm lại từ đầu

- [ ] Làm tình huống [Dữ liệu biến mất sau khi cập nhật](../examples/troubleshooting/scenario-04/README.md) (liên quan tới volume ở Ngày 7).
- [ ] **Làm lại từ đầu, không nhìn slide:** tạo thư mục mới, viết lại Dockerfile của API, rồi viết `compose.yaml` chạy web, API và database. Chỗ nào kẹt thì mở slide của ngày đó để xem lại.

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
