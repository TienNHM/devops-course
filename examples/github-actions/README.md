# Ví dụ GitHub Actions

Sáu workflow mẫu cho Tuần 9-12. Các file này nằm ở `examples/github-actions/` với đuôi `.yml` và cố ý KHÔNG nằm trong `.github/workflows` của repo giáo trình, để chúng không chạy ngoài ý muốn. Cú pháp YAML của cả sáu file đã được kiểm tra bằng trình parse YAML, nhưng chưa chạy trên GitHub thật.

| File | Mục đích | Buổi liên quan |
| --- | --- | --- |
| `ci-basic.yml` | Checkout, setup Node, `npm ci`, `npm test` | Tuần 9 |
| `ci-matrix.yml` | Matrix nhiều phiên bản Node, `concurrency`, `fail-fast: false` | Tuần 9-10 |
| `ci-integration-postgres.yml` | Test với PostgreSQL service container và healthcheck | Tuần 10 |
| `docker-publish.yml` | Build và push image lên GHCR bằng `GITHUB_TOKEN` | Tuần 11 |
| `security-scan.yml` | `npm audit`, dependency review, quét image bằng Trivy | Tuần 12 |
| `deploy-local-dispatch.yml` | Chạy thủ công, kiểm tra tag trên GHCR, in lệnh deploy local | Tuần 11 |

## Cách dùng

1. Tạo repo của bạn từ `starter-project` (các workflow giả định `backend/`, `frontend/` và `database/` nằm ở gốc repo).
2. Tạo thư mục `.github/workflows/` và chép file muốn thử vào đó.
3. Commit và push lên nhánh `main` (hoặc mở pull request), rồi vào tab Actions của repo để xem kết quả.

```bash
mkdir -p .github/workflows
cp /đường/dẫn/tới/devops-course/examples/github-actions/ci-basic.yml .github/workflows/
git add .github/workflows/ci-basic.yml
git commit -m "Add basic CI workflow"
git push
```

Nếu nhánh mặc định của bạn là `master`, sửa `branches: [main]` cho khớp.

## Những điểm cần hiểu

- `permissions:` khai báo quyền tối thiểu cho `GITHUB_TOKEN`. Chỉ cấp `packages: write` ở job thật sự push image.
- Mật khẩu `ci-only-password` trong `ci-integration-postgres.yml` là giá trị tạm của job CI, không phải secret. Secret thật phải để trong Settings, Secrets and variables, và đọc qua `${{ secrets.TEN_SECRET }}`.
- `docker-publish.yml` không cần token cá nhân: image được đẩy lên `ghcr.io/OWNER/club-api` và `ghcr.io/OWNER/club-web` bằng `GITHUB_TOKEN`. Lần push đầu, package mặc định ở chế độ private; vào trang package để chỉnh quyền truy cập nếu cần kéo image từ máy local (hoặc dùng `docker login ghcr.io` với token cá nhân có quyền `read:packages`, đặt trong biến môi trường, không dán vào lệnh lưu lại lịch sử).
- `deploy-local-dispatch.yml` không truy cập cluster của bạn. Quy trình này giữ nguyên nguyên tắc "không expose máy học viên ra Internet": CI chỉ xác nhận image tồn tại, còn bước triển khai do bạn chạy `examples/kubernetes/deploy-local.sh` trên máy của mình.
- Trong `security-scan.yml`, hãy kiểm tra phiên bản mới nhất của `aquasecurity/trivy-action` và `actions/dependency-review-action` trước khi dùng thật. Tính năng dependency review có thể cần bật Dependency graph trong cài đặt repo.

## Gỡ lỗi khi workflow fail

Đọc log của step đỏ đầu tiên, không đọc từ cuối. Các nguyên nhân phổ biến: sai `working-directory`, thiếu `package-lock.json` khiến `npm ci` lỗi, sai tên nhánh trong `on:`, thiếu quyền `permissions`. Đây là nền tảng cho tình huống lỗi "GitHub Actions fail" trong phần troubleshooting.
