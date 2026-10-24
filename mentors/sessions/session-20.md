# Kịch bản buổi 20 – Pipeline Security

::: warning Dành cho mentor
Trang này dành cho người dạy. Bài học viên: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md) và [Phần nâng cao](../../labs/week-10/session-20-challenge.md). Slide: [Slide buổi 20](../../slides/04-cicd/session-20.md). Hướng dẫn chấm: [Hướng dẫn chấm tuần 10](../grading/week-10.md). Đáp án: [Đáp án tuần 10](../walkthroughs/week-10.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 20: khung 120 phút, demo che secret và quét image bằng Trivy, câu hỏi cho lớp, ghi chú theo 14 slide và các lưu ý riêng cho người dạy.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành và review bài làm.

| Phút | Hoạt động | Nội dung |
| --- | --- | --- |
| 0-15 | Ôn tập | Nhắc buổi 19 đã deploy image; hôm nay hỏi image và pipeline đó có an toàn không |
| 15-45 | Kiến thức và demo | Least privilege, secret, script injection, quét image bằng Trivy |
| 45-105 | Thực hành | Lab bắt buộc: Phần 1 (rà soát permissions) khoảng 25', Phần 2 (quét image một lần) khoảng 20', Phần 3 (tìm secret lỡ commit) khoảng 10' |
| 105-120 | Review | Xem evidence, exit ticket |

SBOM, pin SHA và workflow `security.yml` là phần nâng cao ở trang thử thách; nếu lớp chậm thì chỉ cần hoàn thành phần bắt buộc.

## Kịch bản demo

Mục tiêu: cho lớp thấy một workflow "chạy được nhưng nguy hiểm" và một công cụ tìm ra vấn đề trong image.

1. Mở `.github/workflows/publish.yml` của repo giáo trình. Hỏi lớp: "Job nào cần `packages: write`, job nào không?" Chỉ ra quyền được khai báo ở hai cấp.
2. Thêm tạm một bước vào workflow thử nghiệm (dùng secret giả `DEMO_SECRET`) để lộ cách che secret hoạt động:

   ```yaml
   - name: Demo masking
     env:
       DEMO_SECRET: ${{ secrets.DEMO_SECRET }}
     run: |
       echo "raw: $DEMO_SECRET"
       echo "base64: $(echo -n "$DEMO_SECRET" | base64)"
   ```

   Kết quả mong đợi trong log: dòng `raw:` hiện `***`, dòng `base64:` hiện chuỗi base64 thật vì giá trị đã bị biến đổi (không khớp chuỗi bị che). Hỏi lớp: "Che log có thay thế được việc không in secret không?" Xóa bước demo và xoay secret demo sau buổi học.

3. Quét image trước lớp. Không mount `docker.sock` vào container quét (mount socket cho container quyền điều khiển Docker daemon, tương đương root trên máy). Xuất image ra file tar rồi cho Trivy đọc file:

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

   Hỏi: "Có thể ra 0 hôm nay và khác 0 ngày mai không? Vì sao?" (Cơ sở dữ liệu CVE cập nhật liên tục; image không đổi nhưng kiến thức về lỗ hổng thì đổi.)

4. Quét một image cũ để thấy sự khác biệt:

   ```bash
   docker pull node:18-alpine
   docker save node:18-alpine -o /tmp/scan/node18.tar
   docker run --rm \
     -v trivy-cache:/root/.cache/ \
     -v /tmp/scan:/work:ro \
     aquasec/trivy:0.57.1 image --input /work/node18.tar --severity HIGH,CRITICAL
   ```

   Kết quả mong đợi: thường có danh sách CVE (nếu ra 0 thì bỏ `--severity` để thấy cả mức thấp hơn). Hỏi lớp: "Nên làm gì: bỏ qua, nâng base image, hay vá từng gói?"

## Câu hỏi cho lớp

| Câu hỏi | Đáp án ngắn |
| --- | --- |
| Pipeline là nơi có quyền cao nhất trong dự án, vì sao? | Nó đọc source, giữ secret, ghi registry và triển khai. |
| Nếu chỉ khai báo `contents: read`, quyền `packages` là gì? | `none`: quyền không liệt kê đều là none. |
| Che secret trong log có thay thế được việc không in secret không? | Không. Giá trị bị biến đổi (base64, cắt, đảo) không bị che. |
| Tiêu đề PR chứa lệnh shell thì chuyện gì xảy ra ở bản nguy hiểm? | Chuỗi được thay vào `run:` trước khi shell chạy nên lệnh bị chèn. Cách an toàn: qua biến môi trường. |
| Vì sao tag có thể bị di chuyển còn SHA thì không? | Tag là con trỏ do tác giả sửa được; SHA là định danh của commit. |
| Một CVE nghiêm trọng vừa công bố, làm sao biết mình có dùng thư viện đó? | Tra SBOM của từng image. |
| Hôm nay quét ra 0, ngày mai có thể khác 0 không? | Có, vì cơ sở dữ liệu CVE đổi liên tục dù image không đổi. |
| Vì sao cần hai commit riêng khi sửa workflow quyền rộng? | Diff chứng minh việc thu hẹp quyền. |

## Ghi chú theo slide

Slide buổi 20 có 14 slide.

- Slide 1 – Mục tiêu buổi học (2 phút): câu mở đầu: pipeline là nơi có quyền cao nhất trong dự án, vì sao?
- Slide 2 – Vấn đề, action lạ và write-all (3 phút): kể câu chuyện, không nêu tên sự cố cụ thể. Hỏi lớp: bước nào trong kịch bản này có thể chặn được thiệt hại?
- Slide 3 – Least privilege và permissions (3 phút): hỏi nếu chỉ khai báo `contents: read` thì quyền `packages` là gì. Đáp: none.
- Slide 4 – Quyền theo tầng (2 phút): mở `publish.yml` của repo giáo trình, chỉ khai báo ở hai cấp.
- Slide 5 – Secret, làm và không làm (3 phút): nhấn mạnh lịch sử git vẫn giữ secret đã commit.
- Slide 6 – Che secret trong log có giới hạn (4 phút): demo trên workflow thử nghiệm với secret giả. Xóa bước demo và xoay secret demo sau buổi.
- Slide 7 – Script injection (3 phút): hỏi: nếu tiêu đề PR chứa một lệnh shell thì chuyện gì xảy ra ở bản nguy hiểm?
- Slide 8 – Pin action theo SHA, nâng cao (2 phút): hỏi vì sao tag có thể bị di chuyển còn SHA thì không.
- Slide 9 – Dependency review và SBOM, nâng cao (3 phút): hỏi một CVE nghiêm trọng vừa công bố thì bạn tìm ra mình có dùng nó bằng cách nào.
- Slide 10 – Image scanning, Trivy và Docker Scout (2 phút): khóa học dùng Trivy làm mặc định vì không cần đăng nhập.
- Slide 11 – Kiến trúc pipeline an toàn (3 phút): đi theo hai nhánh pass và fail. Nhắc file mẫu `examples/github-actions/security-scan.yml` để đọc sau lab.
- Slide 12 – Demo, đọc kết quả quét (7 phút, theo bước 3 và 4 của kịch bản demo): lần đầu tải database nên chậm. Node 18 đã hết vòng đời hỗ trợ nên là ví dụ tốt về base image cũ.
- Slide 13 – Lỗi, security gate chặn pipeline (5 phút): liên hệ scenario-05 (image build thất bại) về cách điều tra từng bước. Học viên chỉ nhận triệu chứng trước, nguyên nhân sau. Bảng lỗi cuối slide dùng làm bảng tra khi đi quanh lớp.
- Slide 14 – Recap (review 15 phút cuối): exit ticket: mỗi bạn nêu một thay đổi sẽ áp dụng ngay vào workflow của mình.

## Hỗ trợ khi học viên thực hành

- Chuẩn bị: hàm `trivy` chỉ có hiệu lực trong phiên shell hiện tại. Thiếu image `club-api:1.0.0` thì build lại từ `starter-project/backend`.
- Phần 1: yêu cầu hai commit riêng (workflow quyền rộng, rồi bản đã thu hẹp) để diff chứng minh việc thu hẹp quyền.
- Phần 2: nhắc học viên ghi thời điểm quét (`date`) và đọc cột Library trước khi kết luận.
- Phần 3: nhắc xóa commit không xóa lịch sử.
- Phần nâng cao A.3: `trivy config /project/k8s` cho thấy cảnh báo cấu hình; học viên chọn hai cảnh báo để phân tích.
- Phần nâng cao C, pin SHA: SHA placeholder không chạy được nếu để nguyên; học viên phải tra giá trị thật.
- Thử thách `security.yml`: học viên tự viết, không chiếu lời giải. Repo private chưa bật dependency graph thì job dependency review sẽ lỗi: thay bằng `npm audit --omit=dev` và ghi nhận trong report. Action bên thứ ba thêm vào phải pin SHA. Học viên giải thích ngưỡng đã chọn trong `report.md`. Lời giải đầy đủ ở [Đáp án tuần 10](../walkthroughs/week-10.md).
- Tình huống phụ tùy chọn: nhúng `github.head_ref` vào `run:` với tên nhánh chứa dấu nháy để thấy lệnh bị phá.

## Lưu ý riêng cho người dạy

- Buổi này tách rõ phần bắt buộc (permissions, một lần quét image, tìm secret) và phần nâng cao (SBOM, pin SHA, `security.yml`).
- Luôn dùng secret giả cho demo che log; không dùng secret thật của CLB.
- Kết quả quét đổi theo ngày: hãy quét thử trước buổi để biết lớp sẽ thấy gì.
- Dòng cuối README học viên ghi level đã làm (L1 hoặc L2).
