# Slide buổi 34 – Infrastructure as Code với Terraform trên floci

> **Tóm tắt:** Buổi học mô tả hạ tầng (S3 bucket, DynamoDB table) bằng file Terraform và áp dụng lên floci, một trình giả lập AWS chạy cục bộ. Người học thực hiện `init`, `plan`, `apply`, đổi một thuộc tính, `destroy`, rồi chạy cấu hình đó như một integration test trong GitHub Actions.

## Mục tiêu của buổi 34 (tùy chọn)

**Sản phẩm cuối buổi:** `~/devops-labs/cloud/terraform/` chứa cấu hình Terraform tạo một S3 bucket và một DynamoDB table trên floci, cùng workflow `.github/workflows/terraform-floci.yml` chạy xanh trên pull request.

::: details Ghi chú cho mentor
- Điều kiện cần: đã xong buổi 33 (floci chạy bằng Docker Compose trong `~/devops-labs/cloud/`, AWS CLI hoạt động với `http://localhost:4566`).
- Điều kiện cần: đã học Buổi 17 (service container) và có repository `devops-labs` public để chạy GitHub Actions.
- Thời gian: 15 phút giới thiệu, 90 phút thực hành, 15 phút tổng kết.
- Buổi này tùy chọn, thuộc Phần 6 · Cloud và IaC (tùy chọn) của lộ trình Nâng cao.
- Không cần tài khoản AWS và không phát sinh chi phí; mọi tài nguyên nằm trong floci trên máy người học.
- Mọi lệnh chạy trong WSL, thư mục `~/devops-labs`.
:::

---

## Nhắc lại: khởi động floci

File `~/devops-labs/cloud/compose.yaml` (bản tối thiểu, image ghim phiên bản):

```yaml
services:
  floci:
    image: floci/floci:2.4.0
    ports:
      - "4566:4566"
```

```bash
cd ~/devops-labs/cloud
docker compose up -d
export AWS_ENDPOINT_URL=http://localhost:4566 AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test
aws s3 ls
```

**Kiểm tra: kết quả đúng khi** `docker compose ps` hiện `floci` ở trạng thái running và `aws s3 ls` không báo lỗi kết nối.

::: details Ghi chú cho mentor
- Nếu file của buổi 33 khác bản này (ví dụ có thêm `volumes`), giữ nguyên file của người học; chỉ cần port `4566` và image `floci/floci`.
- Image mặc định ở chế độ lưu trong bộ nhớ: khởi động lại container thì dữ liệu mất. Điều này liên quan đến mục state ở các slide sau.
- Nếu `aws s3 ls` báo lỗi, quay lại các slide lỗi thường gặp của buổi 33.
:::

---

## Bài toán thật: tạo hạ tầng bằng tay không lặp lại được

![So sánh gõ lệnh từng bước với khai báo trong file .tf](/slides/img/s34-manual-vs-iac.svg)

::: details Ghi chú cho mentor
- Tình huống: ở buổi 33, bucket và table được tạo bằng lệnh `aws`. Một thành viên mới muốn dựng cùng môi trường phải gõ lại toàn bộ và không biết lệnh nào đã được dùng.
- Câu hỏi mở đầu: nếu cần 10 bucket giống nhau cho 10 môi trường thì mất bao lâu và sai ở đâu.
:::

---

## Khái niệm: Infrastructure as Code (IaC)

![File main.tf mô tả bucket và table, Terraform tạo ra](/slides/img/s34-k-iac.svg)

- **Infrastructure as Code** (IaC) là cách mô tả tài nguyên hạ tầng bằng file văn bản, thay cho thao tác thủ công.
- Ví dụ trong dự án: `main.tf` mô tả bucket `club-assets-tf` và table `club-events-tf`.

::: details Ghi chú cho mentor
- Cách tiếp cận **khai báo** (declarative) chỉ nêu trạng thái mong muốn; công cụ tự tính các bước cần làm. File nằm trong Git nên có lịch sử và review được.
- Phân biệt: script `bash` gọi `aws ...` là mệnh lệnh (làm bước nào, theo thứ tự nào); Terraform là khai báo (kết quả cuối phải như thế nào).
- Chạy lại cùng một file nhiều lần cho cùng một kết quả; đây là tính chất cần nhấn mạnh.
:::

---

## Khái niệm: Terraform, provider và resource

![Provider aws trỏ về floci qua endpoints, thiếu endpoint thì đi ra AWS thật](/slides/img/s34-provider-endpoint.svg)

- **Terraform** là công cụ IaC đọc file `.tf` để tạo, sửa, xóa tài nguyên; **provider** là plugin gọi API của một nền tảng; **resource** mô tả một tài nguyên.
- Ví dụ trong dự án: provider `hashicorp/aws`, resource `aws_s3_bucket`.

::: details Ghi chú cho mentor
- File `.tf` viết bằng ngôn ngữ HCL; provider ở đây là `hashicorp/aws`.
- Provider gửi request tới **endpoint** (địa chỉ API); mặc định là AWS thật, nên cần khai báo lại `http://localhost:4566`.
- Terraform không biết gì về AWS; toàn bộ kiến thức về API nằm trong provider, được tải về khi chạy `terraform init`.
- Nhấn mạnh hình: nếu thiếu endpoint cho một dịch vụ thì request của dịch vụ đó có thể đi ra AWS thật.
:::

---

## Lưu ý: floci là trình giả lập, không phải AWS

- floci mô phỏng API của AWS, không phải dịch vụ AWS thật; hành vi có thể khác.
- Cấu hình chạy được trên floci chưa chắc đúng trên AWS thật: cần thử trên tài khoản AWS thử nghiệm trước khi triển khai.

::: details Ghi chú cho mentor
- floci được dùng để phát triển và kiểm thử, phù hợp cho kiểm tra nhanh và CI.
- Ví dụ khác biệt có thể gặp: chính sách IAM, giới hạn dịch vụ, tên bucket duy nhất toàn cầu trên AWS.
- Danh sách dịch vụ và mức hỗ trợ nằm trong trang Services của tài liệu floci; hai dịch vụ dùng hôm nay (S3, DynamoDB) được floci hỗ trợ.
- Khi một lệnh lỗi trên floci mà chắc chắn đúng với AWS, đó có thể là khác biệt của trình giả lập; kiểm tra trang services trước khi kết luận.
:::

---

## Bước 1 (10 phút): Cài và kiểm tra Terraform

Cài Terraform trong WSL theo hướng dẫn chính thức: `https://developer.hashicorp.com/terraform/install` (chọn mục Linux và bản phân phối đang dùng). Sau đó kiểm tra:

```bash
terraform version
```

Kết quả mong đợi (số phiên bản có thể khác):

```text
Terraform v1.x.x
on linux_amd64
```

**Kiểm tra: kết quả đúng khi** lệnh in dòng bắt đầu bằng `Terraform v1.`.

::: details Ghi chú cho mentor
- Cài trong WSL, không cài trên Windows, để dùng cùng shell với Docker và AWS CLI.
- Nếu `terraform: command not found` sau khi cài, mở terminal mới để PATH được nạp lại.
- Nếu máy đã có Terraform thì bỏ qua cài đặt, chỉ chạy `terraform version`.
:::

---

## Bước 2 (10 phút): provider.tf, phần 1/2

```bash
mkdir -p ~/devops-labs/cloud/terraform
cd ~/devops-labs/cloud/terraform
```

Tạo file `provider.tf` với nội dung sau, nối tiếp slide tiếp theo:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = "test"
  secret_key = "test"
```

::: details Ghi chú cho mentor
- `required_providers` chọn provider `hashicorp/aws` và giới hạn phiên bản `~> 6.0`, theo hướng dẫn Terraform của floci.
- `access_key = "test"` là giá trị giả, floci chấp nhận mọi giá trị không rỗng. Không đặt khóa AWS thật vào file này.
:::

---

## Bước 2: provider.tf, phần 2/2

Dán tiếp ngay dưới, giữ đúng thụt lề:

```hcl
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    dynamodb = "http://localhost:4566"
    s3       = "http://localhost:4566"
  }
}
```

Mỗi dịch vụ dùng trong cấu hình cần một dòng trong `endpoints`.

**Kiểm tra: kết quả đúng khi** file có đúng một khối `terraform` và một khối `provider "aws"`, dấu `}` đóng đủ.

::: details Ghi chú cho mentor
- Ba cờ `skip_*` bảo provider không gọi STS và metadata API của AWS thật để xác thực; floci không cần các bước đó.
- `s3_use_path_style = true` dùng địa chỉ dạng `localhost:4566/<bucket>` thay cho `<bucket>.localhost`, vốn không phân giải được.
- Nguồn: trang Terraform with Floci của floci và tài liệu AWS provider (Custom Service Endpoints).
:::

---

## Bước 3 (10 phút): main.tf

Tạo file `main.tf` trong cùng thư mục:

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "club-assets-tf"
}

resource "aws_dynamodb_table" "events" {
  name         = "club-events-tf"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
```

**Kiểm tra: kết quả đúng khi** thư mục có `provider.tf` và `main.tf` (`ls`).

::: details Ghi chú cho mentor
- Tên có hậu tố `-tf` để không trùng bucket `club-assets` và table `club-events` đã tạo bằng AWS CLI ở buổi 33.
- Chuỗi `assets` và `events` là tên nội bộ trong Terraform (`aws_s3_bucket.assets`), khác tên tài nguyên thật.
- `hash_key` là khóa phân vùng (partition key) của table; `type = "S"` nghĩa là chuỗi.
:::

---

## Khái niệm: State

![Plan so sánh file .tf, terraform.tfstate và tài nguyên thật; không commit tfstate](/slides/img/s34-state.svg)

- **State** là file ghi lại các tài nguyên Terraform đã tạo và thuộc tính của chúng.
- Ví dụ trong dự án: sau `apply`, `terraform.tfstate` có bucket và table.
- Lưu ý: không commit state.

::: details Ghi chú cho mentor
- State mặc định là `terraform.tfstate` và có thể chứa giá trị nhạy cảm, nên không được commit.
- Terraform so sánh file `.tf`, state và tài nguyên thật để biết cần thay đổi gì.
- Nếu mất state, Terraform coi như chưa tạo gì và sẽ thử tạo lại; nếu tài nguyên đã tồn tại thì báo lỗi trùng.
- Backend S3 và khóa bằng DynamoDB là cách lưu state dùng chung cho nhóm; tài liệu floci có ví dụ, nhưng buổi này dùng state cục bộ.
:::

---

## Khái niệm: Plan và apply

![Chu trình init, plan, apply, destroy với file state](/slides/img/s34-plan-apply.svg)

- **Plan** (`terraform plan`) là bản xem trước các thay đổi; **apply** (`terraform apply`) thực hiện đúng các thay đổi đó rồi cập nhật state.
- Ví dụ trong dự án: lần plan đầu tiên báo hai tài nguyên sẽ được thêm.

::: details Ghi chú cho mentor
- Plan liệt kê tài nguyên sẽ tạo (`+`), sửa tại chỗ (`~`) hoặc xóa (`-`) mà chưa làm gì.
- Tách hai bước giúp người review thấy tác động trước khi chạy.
- `terraform destroy` là apply theo chiều ngược lại: xóa mọi tài nguyên trong state.
- Trong CI dùng `-auto-approve` vì không có người gõ `yes`; ở local nên đọc plan trước.
:::

---

## Bước 4 (10 phút): init và plan

```bash
terraform init
terraform validate
terraform plan
```

`init` tải provider từ Internet (lần đầu mất vài chục giây). `validate` kiểm tra cú pháp. `plan` in kế hoạch:

```text
Terraform has been successfully initialized!
Success! The configuration is valid.
Plan: 2 to add, 0 to change, 0 to destroy.
```

**Kiểm tra: kết quả đúng khi** ba dòng trên xuất hiện và `plan` không báo lỗi kết nối.

::: details Ghi chú cho mentor
- `init` tạo thư mục `.terraform/` và file `.terraform.lock.hcl` (khóa phiên bản provider; nên commit file này).
- Ba dòng trên là trích từ output dài hơn; người học sẽ thấy thêm danh sách thuộc tính của từng tài nguyên.
- Lỗi thường gặp ở bước này: thiếu Internet khi `init`, hoặc floci chưa chạy khi `plan` (xem slide lỗi).
:::

---

## Bước 5 (10 phút): apply và kiểm tra bằng AWS CLI

```bash
terraform apply
aws s3 ls
aws dynamodb list-tables
terraform state list
```

Nhập `yes` khi `apply` hỏi xác nhận.

```text
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
```

**Kiểm tra: kết quả đúng khi** `aws s3 ls` có `club-assets-tf`, `list-tables` có `club-events-tf`, và `terraform state list` in hai dòng `aws_...`.

::: details Ghi chú cho mentor
- Điểm cần nhấn mạnh: cùng một bucket được nhìn từ hai phía, Terraform (state) và AWS CLI (floci).
- Nếu `aws` báo lỗi kết nối, kiểm tra biến `AWS_ENDPOINT_URL` còn được export trong terminal hiện tại.
:::

---

## Bước 6 (15 phút): Đổi một thuộc tính và đọc plan

Trong `main.tf`, thêm khối `tags` vào resource bucket, rồi chạy `terraform plan`:

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "club-assets-tf"

  tags = {
    Course = "devops"
  }
}
```

```text
  # aws_s3_bucket.assets will be updated in-place
  ~ resource "aws_s3_bucket" "assets" {
      ~ tags = { + "Course" = "devops" }
    }
Plan: 0 to add, 1 to change, 0 to destroy.
```

**Kiểm tra: kết quả đúng khi** plan báo `0 to add, 1 to change, 0 to destroy`.

::: details Ghi chú cho mentor
- Output thật dài hơn (có thêm dòng `tags_all`); đoạn trên là bản rút gọn.
- Nếu thao tác gắn tag lỗi trên floci, đây là ví dụ về khác biệt của trình giả lập: ghi lại thông báo lỗi và chuyển sang thuộc tính khác của bucket.
:::

---

## Bước 6: Apply thay đổi và đọc ký hiệu

| Ký hiệu | Ý nghĩa |
| --- | --- |
| `+` | Tạo mới |
| `~` | Sửa tại chỗ |
| `-` | Xóa |
| `-/+` | Thay thế |

```bash
terraform apply
aws s3api get-bucket-tagging --bucket club-assets-tf
```

**Kiểm tra:** `apply` báo `0 added, 1 changed, 0 destroyed`; `get-bucket-tagging` hiện khóa `Course`.

::: details Ghi chú cho mentor
- Ký hiệu `-/+` nghĩa là xóa rồi tạo lại tài nguyên.
- Thử thêm: đổi `bucket = "club-assets-tf"` rồi chạy `plan`: kết quả là `-/+` vì tên bucket không sửa tại chỗ được. Không `apply` thay đổi này.
- Đọc plan trước khi apply là thói quen chính của buổi: ký hiệu `-` và `-/+` cần được chú ý nhất.
:::

---

## Bước 7 (5 phút): Không commit state

```bash
printf '.terraform/\nterraform.tfstate\nterraform.tfstate.backup\n' > .gitignore
git status --short -uall
```

**Kiểm tra: kết quả đúng khi** danh sách có `.gitignore`, `.terraform.lock.hcl`, `main.tf`, `provider.tf` và không có `terraform.tfstate` hay thư mục `.terraform/`.

::: details Ghi chú cho mentor
- `.terraform/` chứa provider đã tải (rất nặng) và không thuộc về repository.
- `.terraform.lock.hcl` nên được commit để mọi máy và CI dùng cùng phiên bản provider.
- Nếu `terraform.tfstate` lỡ được commit: gỡ khỏi Git bằng `git rm --cached` và coi mọi giá trị trong file là đã lộ.
:::

---

## Bước 8 (5 phút): destroy

```bash
terraform destroy
aws dynamodb list-tables
```

Nhập `yes` khi được hỏi.

```text
Destroy complete! Resources: 2 destroyed.
```

**Kiểm tra: kết quả đúng khi** `list-tables` không còn `club-events-tf` và `aws s3 ls` không còn `club-assets-tf`.

::: details Ghi chú cho mentor
- Sau `destroy`, các file `.tf` vẫn còn; chạy lại `apply` sẽ dựng lại đúng hạ tầng đó. Đây là lợi ích chính của IaC.
- Cho người học thử `terraform apply` thêm một lần nếu còn thời gian, rồi `destroy` lại.
:::

---

## Lưu ý an toàn: Docker socket và quyền root

- S3 và DynamoDB chạy bên trong floci, không cần Docker socket.
- Docker socket tương đương quyền root trên máy chủ Docker; không mount khi không cần.
- floci không phải ranh giới bảo mật: không mở cổng `4566` ra mạng chung.

::: details Ghi chú cho mentor
- Compose file của buổi này chỉ publish cổng `4566`.
- Một số dịch vụ của floci (ví dụ Lambda, RDS, giao diện web console) khởi động container khác nên cần mount `/var/run/docker.sock`.
- floci chỉ dùng trên máy cá nhân.
- README floci nêu rõ các dịch vụ chạy bằng Docker thật cần Docker socket; web console cũng dùng cách này.
- Service container trong GitHub Actions ở các slide sau cũng không mount socket.
:::

---

## Bước 9 (15 phút): Workflow integration test, phần 1/3

![Job trên runner gọi floci chạy như service container qua localhost:4566](/slides/img/s34-ci-job.svg)

Khái niệm đã học ở Buổi 17: service container là container chạy cùng job. Tạo nhánh và file workflow:

```bash
cd ~/devops-labs
git checkout -b day-34-terraform
mkdir -p .github/workflows
```

**Kiểm tra: kết quả đúng khi** `git branch` có dấu `*` ở `day-34-terraform`.

::: details Ghi chú cho mentor
- Nhắc lại: job chạy trực tiếp trên runner nên gọi service container qua `localhost` và cổng đã map (xem [Buổi 17](../04-cicd/session-17.md)).
- Nếu nhánh chính tên `master`, đổi tên nhánh trong các lệnh `git` tương ứng.
:::

---

## Bước 9: terraform-floci.yml, phần 1/3

Tạo `.github/workflows/terraform-floci.yml`:

```yaml
name: Terraform on floci

on:
  pull_request:

permissions:
  contents: read

jobs:
  terraform-test:
    runs-on: ubuntu-latest
    services:
      floci:
        image: floci/floci:2.4.0
        ports:
          - 4566:4566
```

Khối `services` khởi động floci cạnh job và map cổng `4566` ra `localhost` của runner.

::: details Ghi chú cho mentor
- Image ghim `2.4.0` để kết quả CI lặp lại được; không dùng `latest`.
- Dựa trên tài liệu GitHub về service container: job chạy trực tiếp trên runner thì dùng `ports` và truy cập qua `localhost`.
:::

---

## Bước 9: terraform-floci.yml, phần 2/3

Dán tiếp, thụt lề 4 dấu cách cho `env` và `steps`:

```yaml
    env:
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_DEFAULT_REGION: us-east-1
      AWS_ENDPOINT_URL: http://localhost:4566
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Chờ floci sẵn sàng
        run: |
          for i in $(seq 1 30); do
            aws s3 ls > /dev/null 2>&1 && exit 0
            sleep 2
          done
          exit 1
```

::: details Ghi chú cho mentor
- Service container cần vài giây để nhận kết nối; vòng chờ thử `aws s3 ls` tối đa 30 lần cách nhau 2 giây, hết thời gian thì step đỏ.
- Các giá trị `test` là giả, không phải secret.
- Runner `ubuntu-latest` thường có sẵn AWS CLI; nếu thiếu, thêm một step cài AWS CLI theo tài liệu chính thức.
:::

---

## Bước 9: terraform-floci.yml, phần 3/3

```yaml
      - name: Terraform init và apply
        working-directory: cloud/terraform
        run: |
          terraform init
          terraform apply -auto-approve
      - name: Kiểm tra tài nguyên
        run: |
          aws s3api head-bucket --bucket club-assets-tf
          aws dynamodb describe-table --table-name club-events-tf
```

Mỗi lệnh trả mã thoát khác 0 thì step đỏ, job đỏ và pull request bị chặn.

**Kiểm tra: kết quả đúng khi** file nằm ở `.github/workflows/terraform-floci.yml`, thụt lề 2 dấu cách, không có tab.

::: details Ghi chú cho mentor
- `working-directory: cloud/terraform` phải khớp vị trí file `.tf` trong repository.
- Step cuối là integration test thật: nó kiểm tra tài nguyên tồn tại trên floci, độc lập với việc `apply` báo thành công.
:::

---

## Bước 10 (15 phút): Chạy xanh, rồi làm đỏ có chủ đích

```bash
git add cloud/terraform/main.tf cloud/terraform/provider.tf cloud/terraform/.gitignore cloud/terraform/.terraform.lock.hcl .github/workflows/terraform-floci.yml
git commit -m "ci: test terraform config against floci"
git push -u origin day-34-terraform
```

Mở pull request vào `main`, chờ check xanh. Sau đó đổi `club-assets-tf` trong lệnh `head-bucket` thành `club-assets-missing`, commit, push.

**Kiểm tra: kết quả đúng khi** lần đầu PR hiện "All checks have passed", lần sau step `Kiểm tra tài nguyên` đỏ.

::: details Ghi chú cho mentor
- Đổi lại tên bucket đúng, push, và xác nhận check xanh trở lại trước khi kết thúc.
- Nếu step `terraform init` đỏ vì thiếu file lock, kiểm tra `.terraform.lock.hcl` đã được commit chưa (`git ls-files cloud/terraform`).
- Nếu step chờ floci đỏ, mở log của phần `Initialize containers` để xem container floci có khởi động không.
:::

---

## Lỗi thường gặp 1: Terraform gọi ra AWS thật

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Lỗi `validating provider credentials` | Thiếu cờ `skip_*` | Thêm ba cờ |
| Không thấy credential | Thiếu khóa | Đặt `test` |
| Một dịch vụ lỗi | Thiếu endpoint | Thêm vào `endpoints` |

::: details Ghi chú cho mentor
- Lỗi `validating provider credentials` hoặc gọi STS: thiếu `skip_credentials_validation` hoặc `skip_requesting_account_id`; thêm đủ ba cờ `skip_*` như ở phần 2/2 của `provider.tf`.
- Báo không tìm thấy credential: khai báo giá trị `test` cho `access_key` và `secret_key` trong provider.
- Một dịch vụ lỗi, dịch vụ khác chạy: thiếu dòng endpoint cho dịch vụ đó; thêm dịch vụ vào khối `endpoints`.
- Quy tắc: mỗi dịch vụ AWS dùng trong cấu hình cần một dòng endpoint; theo tài liệu floci, endpoint phải được khai báo cho từng dịch vụ.
- Nếu nghi ngờ request đi ra Internet, ngắt mạng rồi chạy `terraform plan`: cấu hình đúng vẫn chạy được.
- Thông báo lỗi thật có thể khác từng phiên bản provider; tìm theo cụm từ khóa trong bảng.
:::

---

## Lỗi thường gặp 2: S3, kết nối và state

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Lỗi DNS `.localhost` | Địa chỉ S3 virtual-hosted | `s3_use_path_style = true` |
| `connection refused` | floci chưa chạy | `docker compose up -d` |
| Plan tạo lại tài nguyên | State lệch (drift) | `terraform apply` |

::: details Ghi chú cho mentor
- Lỗi DNS: provider dùng địa chỉ S3 kiểu virtual-hosted; đặt `s3_use_path_style = true`.
- `connection refused` tới `localhost:4566`: floci chưa chạy hoặc chưa sẵn sàng trong CI; chạy `docker compose up -d`, và trong CI giữ vòng chờ.
- Plan muốn tạo lại tài nguyên đã có trong state: khởi động lại floci làm mất tài nguyên (state lệch, gọi là drift); chạy `terraform apply` để tạo lại, hoặc xóa `terraform.tfstate*` để bắt đầu mới.
- Drift là tình trạng thực tế khác với state; nguyên nhân phổ biến là ai đó đổi tài nguyên bằng tay, ở đây là floci mất dữ liệu khi khởi động lại.
- Chỉ xóa `terraform.tfstate*` khi toàn bộ tài nguyên là của môi trường thử nghiệm cục bộ.
:::

---

## Tự kiểm tra

1. Vì sao cần `endpoints` và `s3_use_path_style` khi dùng provider `aws` với floci?
2. Vì sao không commit `terraform.tfstate` nhưng nên commit `.terraform.lock.hcl`?
3. Trong workflow, step nào làm job đỏ khi hạ tầng sai, và vì sao?

::: details Ghi chú cho mentor
- 1: Mặc định provider gọi AWS thật; `endpoints` chuyển request về `localhost:4566`. Địa chỉ S3 kiểu `bucket.localhost` không phân giải được nên cần path style.
- 2: State có thể chứa giá trị nhạy cảm và thay đổi theo từng máy. File lock chỉ ghi phiên bản provider, giúp mọi máy và CI dùng cùng phiên bản.
- 3: Step `Kiểm tra tài nguyên` (và `terraform apply` nếu lỗi): lệnh trả mã thoát khác 0 thì step đỏ, các step sau bị bỏ qua và job fail.
:::

---

## Tổng kết

- IaC mô tả hạ tầng bằng file trong Git; Terraform tạo thay đổi bằng `plan` rồi `apply`.
- Provider `aws` cần `endpoints` về `localhost:4566` và các cờ `skip_*`.
- State không được commit; `.terraform.lock.hcl` nên được commit.
- floci phù hợp cho integration test trong CI, không thay thế kiểm tra trên AWS thật.

::: details Ghi chú cho mentor
- Terraform đọc file, so với state rồi mới tạo thay đổi.
- floci chạy trong CI nhờ service container.
- Đây là buổi cuối của Phần 6 · Cloud và IaC (tùy chọn).
- Gợi ý đào sâu cho người học quan tâm: backend S3 với khóa DynamoDB do floci hỗ trợ (xem tài liệu Terraform của floci), và các dịch vụ khác như SQS.
:::

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [floci: Terraform with Floci](https://github.com/floci-io/floci/blob/main/docs/getting-started/terraform.md): cấu hình provider và ví dụ resource chạy trên floci.
- **Tài liệu chính thức:** [Terraform: Install](https://developer.hashicorp.com/terraform/install): cài Terraform theo từng hệ điều hành.
- **Tài liệu chính thức:** [AWS provider: Custom Service Endpoints](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/custom-service-endpoints): cách trỏ provider tới endpoint tùy chỉnh.
- **Tài liệu chính thức:** [GitHub Actions: About service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers): chạy container phụ trợ trong workflow.
- **Best practice:** [Terraform: Manage sensitive data in state](https://developer.hashicorp.com/terraform/language/state/sensitive-data): vì sao state phải được bảo vệ.
- **Best practice:** [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html): nguyên tắc thiết kế hạ tầng trên AWS.
