# Slide buổi 33 – AWS cục bộ với floci

> **Tóm tắt:** Buổi tùy chọn của Lộ trình Nâng cao. Người học chạy floci (bộ giả lập AWS miễn phí) bằng Docker Compose, cấu hình AWS CLI trỏ vào `http://localhost:4566`, rồi tạo S3 bucket và bảng DynamoDB mà không cần tài khoản AWS.

## Mục tiêu của buổi 33

- Sản phẩm: `~/devops-labs/cloud/` có `compose.yaml` chạy floci; bucket `club-assets` chứa `members.csv`; bảng `club-events` chứa một item; dữ liệu còn sau khi khởi động lại.
- Thời gian: khoảng 2 giờ gồm trình bày và thực hành.

::: details Ghi chú cho mentor
- Điều kiện: đã học Buổi 15-20 (CI/CD), Docker và Docker Compose chạy được, đã cài hoặc sẵn sàng cài AWS CLI v2. Buổi này không đụng vào thư mục `club/`.
- Buổi tùy chọn: không có trang lab và không có bài nộp; slide là bài giảng, người học gõ lệnh cùng giảng viên.
- Kiểm tra trước giờ học: `docker --version`, `docker compose version`, `aws --version`. Docker cần từ 23.0 trở lên theo tài liệu cài đặt floci.
- Phân bổ gợi ý: khái niệm 25 phút, thực hành 85 phút, tổng kết 10 phút.
:::

---

## Bài toán thực tế: học cloud mà không muốn trả tiền hay chịu rủi ro

| Vấn đề khi học trên AWS | Hệ quả |
| --- | --- |
| Cần tài khoản và thẻ | Rào cản với sinh viên |
| Quên xóa tài nguyên | Hóa đơn ngoài dự kiến |
| Sai cấu hình | Lộ dữ liệu thật |

::: details Ghi chú cho mentor
- Cần tài khoản và thẻ thanh toán là rào cản đăng ký, nhất là với sinh viên; tài nguyên quên xóa vẫn tính phí; sai cấu hình có thể làm lộ dữ liệu thật, gây rủi ro bảo mật khi mới học.
- Mỗi lệnh gọi qua Internet nên chậm và khó chạy trong CI cho mọi commit.
- Cách dẫn: nhóm CLB muốn thử lưu tệp thành viên lên S3 và ghi sự kiện vào DynamoDB, nhưng chưa có tài khoản AWS.
- Giải pháp của buổi: một bộ giả lập chạy trên máy cá nhân, dùng cùng lệnh `aws` như AWS thật.
:::

---

## Khái niệm: Cloud emulator

![Lệnh aws gửi tới floci tại localhost:4566 thay vì AWS thật](/slides/img/s33-k-cloud-emulator.svg)

- **Cloud emulator** là phần mềm chạy cục bộ, trả lời các lời gọi API giống một dịch vụ cloud thật.
- Ví dụ trong dự án: floci là bộ giả lập AWS mã nguồn mở, chạy trong container Docker.

::: details Ghi chú cho mentor
- Ứng dụng và công cụ dòng lệnh dùng cùng giao thức, nên có thể phát triển và kiểm thử mà không cần tài khoản cloud.
- Floci có giấy phép MIT.
:::

---

## Floci là bộ giả lập, không phải AWS

- Floci mô phỏng API của AWS, không phải hạ tầng AWS; hành vi có thể khác AWS thật.
- Kết quả đúng trên floci chưa bảo đảm đúng trên AWS thật: cần kiểm thử lại trước khi dùng cho hệ thống thật.

::: details Ghi chú cho mentor
- Khác biệt có thể nằm ở chi tiết, giới hạn hoặc thông báo lỗi.
- Một số chức năng chỉ là bản giả lập tối thiểu. Ví dụ theo tài liệu của floci: `RestoreObject` của S3 chỉ trả về `202 Accepted`, và cấu hình replication chỉ được lưu chứ không sao chép object.
- Nhấn mạnh phạm vi: floci dùng để học, phát triển và kiểm thử tự động; không dùng để kết luận về chi phí, hiệu năng, giới hạn dịch vụ hay quyền IAM trên AWS thật.
- Danh sách dịch vụ được hỗ trợ nằm trong README của floci; tài liệu dịch vụ ghi rõ thao tác nào là stub.
:::

---

## Khái niệm: Endpoint

![Cùng lệnh aws gửi tới localhost:4566 (floci) hoặc tới AWS thật](/slides/img/s33-endpoint.svg)

- **Endpoint** là địa chỉ URL mà công cụ gọi API (AWS CLI, SDK, Terraform) gửi yêu cầu tới.
- Ví dụ trong dự án: `AWS_ENDPOINT_URL` hoặc `--endpoint-url` đặt endpoint cho AWS CLI.

::: details Ghi chú cho mentor
- Mặc định endpoint là địa chỉ của AWS; đổi endpoint sang `http://localhost:4566` thì cùng lệnh được floci xử lý.
:::

---

## Khái niệm: Thông tin xác thực và region

![Ba biến môi trường giá trị giả để floci chấp nhận](/slides/img/s33-k-credentials.svg)

- **Credentials** gồm `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`; **region** là vùng của dịch vụ.
- Ví dụ trong dự án: floci chấp nhận mọi giá trị không rỗng, nên dùng `test`.
- Lưu ý: không nhập khóa AWS thật.

::: details Ghi chú cho mentor
- Credentials là thông tin xác thực; region là vùng địa lý của dịch vụ. AWS CLI luôn yêu cầu hai giá trị này.
- Ví dụ region: `us-east-1`.
- Đây là giá trị giả; tuyệt đối không nhập khóa AWS thật vào môi trường học.
- Tài liệu floci: credentials có thể là bất kỳ giá trị không rỗng; khóa gồm đúng 12 chữ số sẽ được dùng làm account ID (tính năng cách ly nhiều tài khoản), không cần giới thiệu trong buổi này.
:::

---

## Bước 1 (10 phút): Chuẩn bị thư mục và kiểm tra công cụ

```bash
mkdir -p ~/devops-labs/cloud
cd ~/devops-labs/cloud
docker --version
docker compose version
aws --version
```

Nếu `aws` chưa có, cài AWS CLI v2 theo [hướng dẫn chính thức](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

**Kiểm tra: kết quả đúng khi** ba lệnh đều in ra phiên bản và không có `command not found`.

::: details Ghi chú cho mentor
- Chạy trong WSL, thư mục `~/devops-labs`, giống các buổi trước.
- `AWS_ENDPOINT_URL` cần AWS CLI v2 đủ mới; nếu phiên bản cũ, dùng `--endpoint-url` ở mỗi lệnh (README floci có ví dụ này).
:::

---

## Bước 2 (10 phút): Viết compose.yaml cho floci

Tạo tệp `~/devops-labs/cloud/compose.yaml`:

```yaml
services:
  floci:
    image: floci/floci:2.4.0
    ports:
      - "4566:4566"
```

Image được ghim vào phiên bản `2.4.0`, không dùng `latest`, để mọi máy chạy cùng một bản.

**Kiểm tra: kết quả đúng khi** `docker compose config` in lại cấu hình mà không báo lỗi.

::: details Ghi chú cho mentor
- README và tài liệu floci dùng `floci/floci:latest` trong ví dụ; tag cố định dạng `x.y.z` được liệt kê trong tài liệu "Image Tags". Bản `2.4.0` là release mới nhất tại thời điểm soạn slide: kiểm tra lại tại trang Releases trước giờ dạy.
- Không thêm `volumes` Docker socket ở đây: S3 và DynamoDB chạy trong tiến trình của floci.
:::

---

## Bước 2: Giải thích tệp compose

![Máy chủ gọi localhost:4566, Docker chuyển tới container floci cung cấp S3 và DynamoDB](/slides/img/s33-compose-ports.svg)

- `image` chọn image floci phiên bản `2.4.0`.
- `ports: "4566:4566"` nối cổng 4566 của máy với cổng 4566 trong container; mọi dịch vụ AWS dùng chung cổng này.

---

## Bước 3 (5 phút): Khởi động floci

```bash
cd ~/devops-labs/cloud
docker compose up -d
docker compose ps
```

Kết quả mong đợi: Docker tải image lần đầu (khoảng 90 MB), sau đó dịch vụ `floci` ở trạng thái chạy và cổng `4566` được ánh xạ.

**Kiểm tra: kết quả đúng khi** `docker compose ps` hiển thị `floci` đang `running` với `0.0.0.0:4566->4566/tcp`.

::: details Ghi chú cho mentor
- Docker Compose v2 dùng cú pháp `docker compose` (có dấu cách), không phải `docker-compose`.
- Nếu mạng chậm, bước tải image có thể mất vài phút: nên cho người học tải trước.
:::

---

## Bước 4 (10 phút): Cấu hình AWS CLI cho endpoint cục bộ

Tạo tệp `~/devops-labs/cloud/floci-env.sh` rồi nạp vào shell hiện tại:

```bash
cat > floci-env.sh <<'EOF'
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
EOF
source floci-env.sh
aws s3 ls
```

**Kiểm tra: kết quả đúng khi** `aws s3 ls` chạy không lỗi và in danh sách rỗng (chưa có bucket).

::: details Ghi chú cho mentor
- Bốn biến này giống phần cấu hình trong README floci.
- Mỗi cửa sổ terminal mới phải chạy lại `source floci-env.sh`; đây là lỗi quên thường gặp.
- Biến chỉ có hiệu lực trong shell, nên không làm lộ gì vào Git.
:::

---

## Khái niệm: S3 bucket và object

![Bucket club-assets chứa các object, mỗi object có một key](/slides/img/s33-s3-model.svg)

- **Amazon S3** là dịch vụ lưu trữ đối tượng: **bucket** chứa các **object**, mỗi object được xác định bằng **key**.
- Ví dụ trong dự án: bucket `club-assets` chứa object có key `members.csv`.

::: details Ghi chú cho mentor
- Bucket là nơi chứa có tên duy nhất; object là một tệp cùng metadata; key là tên đầy đủ của object.
- S3 không có thư mục thật: dấu `/` trong key chỉ là một phần của tên.
:::

---

## Bước 5 (10 phút): Tạo S3 bucket

```bash
aws s3 mb s3://club-assets
aws s3 ls
```

Kết quả mong đợi: dòng `make_bucket: club-assets`, sau đó `aws s3 ls` in một dòng gồm ngày giờ và tên `club-assets`.

**Kiểm tra: kết quả đúng khi** `aws s3 ls` liệt kê bucket `club-assets`.

::: details Ghi chú cho mentor
- `mb` là viết tắt của "make bucket". Trên AWS thật, tên bucket phải duy nhất toàn cầu; trên floci không có xung đột như vậy, đây là một điểm khác biệt cần nhắc.
:::

---

## Bước 6 (10 phút): Tạo và tải lên members.csv

```bash
cat > members.csv <<'EOF'
id,name,email
1,Hung,hung@example.com
2,Lan,lan@example.com
EOF
aws s3 cp members.csv s3://club-assets/members.csv
aws s3 ls s3://club-assets
```

**Kiểm tra: kết quả đúng khi** thấy `upload: ./members.csv to s3://club-assets/members.csv` và tệp xuất hiện trong danh sách kèm kích thước.

::: details Ghi chú cho mentor
- Dữ liệu mẫu tự tạo để không phụ thuộc vào cơ sở dữ liệu. Có thể thay bằng dữ liệu xuất từ `GET /api/members` của Club API nếu lớp có thời gian.
- Không đưa dữ liệu cá nhân thật của thành viên vào tệp mẫu.
:::

---

## Bước 7 (5 phút): Đọc lại object

```bash
aws s3 cp s3://club-assets/members.csv downloaded.csv
diff members.csv downloaded.csv && echo "giong nhau"
aws s3 cp s3://club-assets/members.csv -
```

Lệnh cuối ghi nội dung object ra màn hình (dấu `-` nghĩa là đầu ra chuẩn).

**Kiểm tra: kết quả đúng khi** `diff` không in khác biệt, in `giong nhau`, và nội dung CSV hiện ra.

---

## Khái niệm: DynamoDB table và partition key

![Bảng club-events, mỗi dòng là một item, event_id là khóa](/slides/img/s33-dynamodb-table.svg)

- **Amazon DynamoDB** là cơ sở dữ liệu NoSQL khóa-giá trị: **table** chứa các **item**, **partition key** định danh duy nhất mỗi item.
- Ví dụ trong dự án: bảng `club-events` dùng `event_id` kiểu chuỗi làm partition key.

::: details Ghi chú cho mentor
- Khi tạo bảng chỉ cần khai báo thuộc tính khóa; các thuộc tính khác của item tự do, không cần khai trước.
:::

---

## Bước 8 (10 phút): Tạo bảng club-events

```bash
aws dynamodb create-table \
  --table-name club-events \
  --attribute-definitions AttributeName=event_id,AttributeType=S \
  --key-schema AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
aws dynamodb list-tables
```

**Kiểm tra: kết quả đúng khi** `list-tables` in `club-events` trong `TableNames`.

::: details Ghi chú cho mentor
- Cú pháp giống ví dụ `create-table` trong README floci. `KeyType=HASH` nghĩa là partition key; `AttributeType=S` là kiểu chuỗi.
- `PAY_PER_REQUEST` là chế độ tính phí theo yêu cầu; trên floci không phát sinh chi phí.
:::

---

## Bước 9 (10 phút): Ghi và đọc một item

```bash
aws dynamodb put-item --table-name club-events \
  --item '{"event_id":{"S":"e001"},"title":{"S":"Workshop Docker"}}'
aws dynamodb get-item --table-name club-events \
  --key '{"event_id":{"S":"e001"}}'
```

**Kiểm tra: kết quả đúng khi** `get-item` trả về JSON có `"title": {"S": "Workshop Docker"}`.

::: details Ghi chú cho mentor
- Giải thích `{"S": "..."}`: DynamoDB gắn kiểu cho từng giá trị (`S` là chuỗi).
- Nếu dùng PowerShell thay vì WSL, dấu nháy kép trong JSON cần thoát khác: khuyến nghị chạy trong WSL.
:::

---

## Bước 10 (5 phút): Xem log của floci

```bash
docker compose logs floci
docker compose logs --tail 20 floci
```

Nhật ký ghi lại quá trình khởi động và các yêu cầu đã xử lý; nội dung chi tiết thay đổi theo phiên bản floci.

**Kiểm tra: kết quả đúng khi** lệnh in được các dòng log của container `floci` và không báo `no such service`.

::: details Ghi chú cho mentor
- Log là công cụ đầu tiên khi một lệnh `aws` lỗi: so sánh thời điểm lệnh với dòng log.
- Mẫu log cụ thể không được ghi trong README; người học đọc thực tế trên máy của mình.
:::

---

## Khái niệm: Storage mode (chế độ lưu trữ)

![Chế độ memory mất dữ liệu khi khởi động lại, chế độ persistent ghi vào thư mục data](/slides/img/s33-persistence.svg)

- **Storage mode** là cách floci lưu trạng thái: `memory` giữ trong RAM, `persistent` ghi xuống đĩa.
- Ví dụ trong dự án: `FLOCI_STORAGE_MODE=persistent` cùng thư mục `./data` giữ lại bucket và bảng.

::: details Ghi chú cho mentor
- Ngoài `persistent`, các chế độ `hybrid` và `wal` cũng ghi xuống đĩa.
- Image mặc định chạy chế độ `memory`, nên dữ liệu mất khi container dừng; chế độ `persistent` giữ dữ liệu qua các lần khởi động lại.
:::

---

## Bước 11 (5 phút): Quan sát dữ liệu mất khi khởi động lại

```bash
docker compose down
docker compose up -d
aws s3 ls
aws dynamodb list-tables
```

**Kiểm tra: kết quả đúng khi** cả hai lệnh in danh sách rỗng: bucket `club-assets` và bảng `club-events` đã biến mất.

::: details Ghi chú cho mentor
- Đây là hành vi mong đợi của chế độ `memory` mặc định. Với CI, trạng thái sạch ở mỗi lần chạy là ưu điểm.
- `docker compose down` xóa container; chỉ dừng rồi chạy lại cũng mất dữ liệu ở chế độ này (có thể thử `docker compose restart`).
:::

---

## Bước 12 (10 phút): Bật chế độ persistent

Sửa `compose.yaml` thành:

```yaml
services:
  floci:
    image: floci/floci:2.4.0
    ports:
      - "4566:4566"
    volumes:
      - ./data:/app/data
    environment:
      FLOCI_STORAGE_MODE: persistent
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data
```

Áp dụng, tạo lại dữ liệu rồi khởi động lại container:

```bash
docker compose up -d
aws s3 mb s3://club-assets
aws s3 cp members.csv s3://club-assets/members.csv
docker compose restart floci
aws s3 ls s3://club-assets
```

**Kiểm tra: kết quả đúng khi** sau `restart`, `members.csv` vẫn còn trong bucket và thư mục `data/` có tệp.

::: details Ghi chú cho mentor
- Cấu hình này lấy từ tài liệu "Running with Docker" và "Quick Start" của floci.
- Thêm `data/` vào `.gitignore` nếu thư mục `cloud/` nằm trong repository; không commit dữ liệu giả lập.
- Nếu `aws s3 ls` sau restart lỗi kết nối, đợi vài giây vì container đang khởi động lại.
:::

---

## Lưu ý bảo mật khi dùng floci

- Docker socket tương đương quyền quản trị máy chủ Docker; S3 và DynamoDB không cần socket, nên buổi này không gắn.
- Floci không phải ranh giới bảo mật: không mở cổng 4566 ra mạng chung, không nhập khóa AWS thật.

::: details Ghi chú cho mentor
- Chỉ dịch vụ cần chạy container con (Lambda, RDS, ElastiCache và tương tự) mới cần gắn Docker socket `/var/run/docker.sock`, và README còn dùng `-u root` cho trường hợp đó.
- Chỉ dùng floci trên máy cá nhân.
- Tài liệu floci cảnh báo: Lambda, ElastiCache, RDS, OpenSearch và MSK cần Docker socket; nếu không dùng thì nên bỏ volume này.
- Cổng `4566:4566` trong compose mặc định công bố trên mọi giao diện mạng của máy. Nên nhắc người học dùng máy cá nhân và mạng tin cậy.
:::

---

## Lỗi thường gặp (1/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `port is already allocated` | Cổng bị chiếm | `docker ps` |
| `Could not connect` | Floci chưa chạy | `docker compose ps` |
| `InvalidAccessKeyId` | Thiếu endpoint | `source floci-env.sh` |

::: details Ghi chú cho mentor
- `port is already allocated` hoặc `address already in use` khi `up`: có thể đổi vế trái của cổng, ví dụ `4567:4566`, và đặt lại endpoint.
- `Could not connect to the endpoint URL: "http://localhost:4566/"`: floci chưa chạy hoặc endpoint sai cổng; dùng thêm `docker compose logs floci` và kiểm tra `AWS_ENDPOINT_URL`.
- `InvalidAccessKeyId`: lệnh đang gọi AWS thật vì thiếu endpoint; kiểm tra bằng `echo $AWS_ENDPOINT_URL`.
:::

---

## Lỗi thường gặp (2/2)

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `You must specify a region` | Chưa đặt region | `source floci-env.sh` |
| `Unable to locate credentials` | Thiếu hai biến khóa | Đặt bằng `test` |
| Dữ liệu biến mất | Chế độ `memory` | `persistent` |

::: details Ghi chú cho mentor
- `You must specify a region`: chưa đặt `AWS_DEFAULT_REGION`; chạy `source floci-env.sh` trong terminal mới.
- `Unable to locate credentials`: đặt `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` bằng `test`.
- Bucket và bảng biến mất sau khi chạy lại: đang ở chế độ `memory` mặc định; dùng `FLOCI_STORAGE_MODE=persistent` kèm volume.
- Gợi ý minh họa: cố ý chạy `unset AWS_ENDPOINT_URL` rồi `aws s3 ls` để học viên thấy lỗi `InvalidAccessKeyId` (gọi tới AWS thật bằng khóa giả).
:::

---

## Tự kiểm tra

1. Vì sao kết quả chạy đúng trên floci chưa bảo đảm chạy đúng trên AWS thật?
2. Đổi một biến nào để cùng lệnh `aws s3 ls` chuyển từ AWS thật sang floci?
3. Cần thay đổi gì trong `compose.yaml` để bucket còn lại sau khi khởi động lại container?

::: details Ghi chú cho mentor
- Đáp án 1: floci là bộ giả lập; một số thao tác chỉ là stub và hành vi, giới hạn hay lỗi có thể khác AWS thật.
- Đáp án 2: `AWS_ENDPOINT_URL=http://localhost:4566` (hoặc `--endpoint-url`).
- Đáp án 3: thêm volume `./data:/app/data` và hai biến `FLOCI_STORAGE_MODE=persistent`, `FLOCI_STORAGE_PERSISTENT_PATH=/app/data`.
:::

---

## Tổng kết và tiếp theo

- Floci là bộ giả lập AWS chạy bằng Docker; chỉ cần đổi endpoint sang `http://localhost:4566`.
- Đã tạo bucket S3 và bảng DynamoDB; so sánh chế độ `memory` với `persistent`.
- Hạn chế: chỉ là bộ giả lập.
- Tiếp theo: [Buổi 34 – Infrastructure as Code với Terraform trên floci](session-34.md).

::: details Ghi chú cho mentor
- Buổi 34 mô tả hạ tầng bằng mã và kiểm thử trong CI.
- Đã ghi, rồi đọc lại dữ liệu trong bucket và bảng.
- Cần cẩn trọng với Docker socket và không dùng khóa AWS thật.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Floci trên GitHub](https://github.com/floci-io/floci): README, danh sách dịch vụ và phiên bản.
- **Tài liệu chính thức:** [Tài liệu floci](https://floci.io/floci/): cấu hình, chế độ lưu trữ và cổng.
- **Tài liệu chính thức:** [Cài đặt AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html): hướng dẫn cho từng hệ điều hành.
- **Tài liệu chính thức:** [Amazon S3 là gì](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html): bucket, object và key.
- **Best practice:** [Best practices bảo mật cho S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html): chặn truy cập công khai, mã hóa, phân quyền tối thiểu.
- **Best practice:** [Best practices cho DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html): thiết kế khóa và mô hình dữ liệu.
