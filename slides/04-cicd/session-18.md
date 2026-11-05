# Slide Ngày 10 – Publish Club API lên GHCR

> **Tóm tắt:** Khi merge vào `main`, GitHub Actions tự build image club-api, gắn tag theo SHA và đẩy lên GHCR bằng GITHUB_TOKEN. Sau đó người học pull và chạy image đã publish.

## Slide 1: Mục tiêu của Ngày 10

**Sản phẩm cuối ngày:** workflow `.github/workflows/club-publish.yml` và một image công khai `ghcr.io/<tên-tài-khoản>/club-api:sha-xxxxxxx`. Đây là mốc "ship it" của Lộ trình Cơ bản.

Điều kiện cần:

- Đã xong Ngày 9: `club-ci.yml` nằm trên `main` của `devops-labs`.
- Repository `devops-labs` để **public** (GHCR miễn phí cho package public).
- Docker Desktop đang chạy trong WSL.

Thời gian: 15 phút giới thiệu, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Ba việc: workflow publish, tag `sha-` khớp commit, pull và chạy lại image.
- Mọi lệnh chạy trong WSL, thư mục `~/devops-labs`. Thay `OWNER` bằng tên tài khoản GitHub, viết thường.
:::

---

## Slide 2: Bài toán thật: build trên laptop, cùng commit ra hai image

![Hai laptop cho hai image khác nhau, runner sạch cho một image truy vết được](/slides/img/s18-laptop-build.svg)

::: details Ghi chú cho mentor
- Tình huống: một thành viên build `club-api` trên laptop, chạy `docker push` rồi báo đã đẩy bản mới. Một tuần sau không ai biết bản đó build từ commit nào và test đã chạy chưa.
- Mỗi laptop có Node, cache và biến môi trường khác nhau.
- Việc deploy chỉ nên dựa trên câu "chạy image có tag này", không dựa trên "bản mới nhất trên máy của một thành viên".
:::

---

## Slide 3: Khái niệm: Registry và GHCR

- **Registry** là dịch vụ lưu trữ và phân phối image, cho phép nhiều máy cùng `docker push` và `docker pull`.
- **GHCR** (GitHub Container Registry) là registry của GitHub, địa chỉ `ghcr.io`, gắn với tài khoản và repository GitHub.
- Ví dụ trong dự án: image `club-api` được đẩy lên `ghcr.io/OWNER/club-api`.

::: details Ghi chú cho mentor
- GHCR miễn phí cho package public. Tên image phải viết thường.
- Docker Hub là registry mặc định của Docker; hôm nay chỉ dùng GHCR.
:::

---

## Slide 4: Khái niệm: Tag

- **Tag** là nhãn do con người đặt, trỏ tới một phiên bản của image trong repository, ví dụ `sha-3f2a1bc`.
- Một tag có thể bị gán lại sang image khác, vì vậy tên tag nên truy vết được nguồn gốc của image.
- Ví dụ trong dự án: tag `sha-` cộng 7 ký tự đầu của commit cho biết image build từ commit nào.

::: details Ghi chú cho mentor
- Luôn có tag SHA; không dùng `latest` để deploy.
- Không bàn chiến lược tag (học ở Lộ trình Nâng cao).
:::

---

## Slide 5: Khái niệm: Digest

![Một repository trên ghcr.io: tag trỏ tới digest, latest có thể đổi sang digest khác](/slides/img/s18-tag-digest.svg)

- **Digest** là mã băm (`sha256:...`) của nội dung image, được registry tính tự động.
- Nội dung image đổi thì digest đổi; vì vậy digest xác định chính xác một image, còn tag chỉ là nhãn trỏ tới nó.

::: details Ghi chú cho mentor
- Chỉ cần nắm: registry là kho chứa, tag là nhãn, digest là mã băm nội dung.
:::

---

## Slide 6: Khái niệm: GITHUB_TOKEN

![Token tạm của mỗi lần chạy; workflow chỉ contents read, job publish thêm packages write](/slides/img/s18-token.svg)

- **GITHUB_TOKEN** là token xác thực tạm thời do GitHub tự cấp cho mỗi lần chạy workflow.
- Token hết hạn khi job kết thúc, nên không cần tạo hay lưu secret nào.

::: details Ghi chú cho mentor
- `GITHUB_TOKEN` là chìa khóa tạm GitHub cấp cho mỗi lần chạy, nên người học không tạo secret nào.
- Workflow dùng token này để đăng nhập vào GHCR ở step `docker/login-action`.
:::

---

## Slide 7: Khái niệm: Permissions và quyền tối thiểu

- **Permissions** là khóa trong workflow quy định GITHUB_TOKEN được làm gì, ví dụ `contents: read` hoặc `packages: write`.
- **Quyền tối thiểu** (least privilege) là nguyên tắc chỉ cấp đúng quyền cần thiết, để token bị lộ cũng gây thiệt hại nhỏ.
- Ví dụ trong dự án: cấp workflow chỉ có `contents: read`; riêng job `publish` được thêm `packages: write`.

::: details Ghi chú cho mentor
- Khai báo `permissions` ở cấp job ghi đè cấp workflow.
- Nâng quyền chỉ ở job thật sự cần.
:::

---

## Slide 8: Bước 1 (10 phút): Build tay trước khi lên CI

Khi build tay lỗi thì CI chắc chắn lỗi.

```bash
cd ~/devops-labs
git checkout main
git pull
docker build -t club-api:local club/backend
docker images | grep club-api
```

**Kiểm tra: kết quả đúng khi** `docker images` có dòng `club-api` với tag `local`.

::: details Ghi chú cho mentor
- Lỗi `failed to read dockerfile`: người học đang đứng sai thư mục, phải chạy từ `~/devops-labs`.
:::

---

## Slide 9: Bước 2 (25 phút): Tạo nhánh và file workflow

Làm trên nhánh riêng. Workflow nằm ở gốc repository, cạnh `club-ci.yml`.

```bash
git checkout -b day-10-publish
```

Tạo `.github/workflows/club-publish.yml` và dán code của 3 slide tiếp theo, nối tiếp nhau.

**Kiểm tra: kết quả đúng khi** `git branch` có dấu `*` ở `day-10-publish`.

::: details Ghi chú cho mentor
- Nếu nhánh chính tên `master`, đổi `[main]` thành `[master]`.
:::

---

## Slide 10: Bước 2: club-publish.yml (phần 1/3)

```yaml
name: Club Publish

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
```

`packages: write` chỉ nằm ở job `publish`, không nằm ở cấp workflow.

::: details Ghi chú cho mentor
- Câu hỏi cho lớp: nếu xóa `packages: write` thì step nào fail (step build-push, không phải step login).
- Khai báo `permissions` ở cấp job ghi đè cấp workflow.
:::

---

## Slide 11: Bước 2: club-publish.yml (phần 2/3)

```yaml
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/club-api
          tags: |
            type=sha
```

`type=sha` tạo tag `sha-` cộng 7 ký tự đầu của commit.

::: details Ghi chú cho mentor
- Đăng nhập bằng `github.actor` và `GITHUB_TOKEN`; không có token hay mật khẩu viết trực tiếp trong file.
- `github.repository_owner` giúp tên image viết đúng; tên chữ hoa gây lỗi `invalid reference format`.
:::

---

## Slide 12: Bước 2: club-publish.yml (phần 3/3)

```yaml
      - uses: docker/build-push-action@v6
        with:
          context: club/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

`context: club/backend` vì Dockerfile nằm ở thư mục đó.

**Kiểm tra: kết quả đúng khi** file nằm ở `.github/workflows/club-publish.yml` (gốc repository), thụt lề 2 dấu cách, và không có token viết trực tiếp.

::: details Ghi chú cho mentor
- Dán tiếp ngay dưới `type=sha`, giữ thụt lề 6 dấu cách cho dấu `-`.
:::

---

## Slide 13: Bước 3 (15 phút): Đẩy lên, mở PR, merge

Workflow này chỉ chạy khi code vào `main`, nên cần merge PR.

```bash
git add .github/workflows/club-publish.yml
git commit -m "ci: publish club-api image to GHCR on main"
git push -u origin day-10-publish
```

Trên GitHub mở PR vào `main`. Check `Club CI` của Ngày 9 phải xanh, sau đó chọn **Merge pull request**.

::: details Ghi chú cho mentor
- Workflow publish chỉ chạy khi code vào `main`, nên người học phải merge mới thấy run.
:::

---

## Slide 14: Bước 3: Xem run Club Publish

Mở tab **Actions**, chọn run **Club Publish**, mở step `build-push-action`:

```text
pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx
```

**Kiểm tra: kết quả đúng khi** run xanh và log có dòng `pushing manifest` với tên image chữ thường.

::: details Ghi chú cho mentor
- Nếu workflow không chạy sau khi merge: file sai chỗ, hoặc tên nhánh khác `[main]`.
:::

---

## Slide 15: Bước 4 (15 phút): Tag khớp commit

Cập nhật `main` và lấy 7 ký tự đầu của commit:

```bash
git checkout main
git pull
git rev-parse --short=7 HEAD
```

Trên trang repository, cột bên phải, mục **Packages**, mở `club-api`.

**Kiểm tra: kết quả đúng khi** tag `sha-xxxxxxx` trên GitHub khớp 7 ký tự trên.

::: details Ghi chú cho mentor
- Nếu merge bằng nút Merge, commit mới nhất trên `main` chính là commit đã build.
:::

---

## Slide 16: Bước 4: Đổi package sang Public

![Trang package club-api với tag sha-3f2a1bc khớp git rev-parse --short=7 HEAD](/slides/img/s18-ghcr-package.svg)

Vào **Package settings**, kéo xuống Danger Zone, đổi visibility sang **Public**.

**Kiểm tra: kết quả đúng khi** trang package hiện nhãn Public.

::: details Ghi chú cho mentor
- Image không chứa bí mật nên có thể để Public.
- Package mới tạo thường là private; bỏ qua bước này thì `docker pull` bị `denied`.
:::

---

## Slide 17: Bước 5 (20 phút): Pull image đã publish

Xóa image local để bảo đảm image được lấy từ registry. Thay `OWNER` và tag bằng giá trị thật.

```bash
docker rmi club-api:local
docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
```

**Kiểm tra: kết quả đúng khi** có dòng `Status: Downloaded newer image for ghcr.io/owner/club-api:sha-3f2a1bc`.

::: details Ghi chú cho mentor
- Gõ `OWNER` chữ thường. Nếu gặp `denied` thì quay lại slide đổi package sang Public.
:::

---

## Slide 18: Bước 5: Chạy image và đọc digest

```bash
docker run --rm -d --name club-api-ghcr -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
sleep 2
curl -s http://localhost:3100/health
docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/OWNER/club-api:sha-3f2a1bc
docker rm -f club-api-ghcr
```

`curl` trả `{"status":"healthy","service":"club-api"}`. `docker inspect` in tên image kèm `@sha256:`.

**Kiểm tra: kết quả đúng khi** có `"status":"healthy"` và một dòng chứa `@sha256:`.

::: details Ghi chú cho mentor
- Cổng 3100 được chọn để không đụng cổng của stack khác. `/health` chạy được dù không có Postgres vì endpoint này không truy vấn database.
- Tag có thể bị trỏ sang image khác, còn digest (mã băm nội dung) thì không đổi.
- Nếu cổng 3100 đã bị chiếm: chạy `docker rm -f club-api-ghcr` rồi chạy lại.
:::

---

## Slide 19: Lỗi thường gặp 1: thiếu packages: write

![Login xanh nhưng Build and push đỏ với denied hoặc 403](/slides/img/s18-denied-push.svg)

Thêm `packages: write` vào job `publish`, sau đó chạy lại.

::: details Ghi chú cho mentor
- Điều tra: step đỏ đầu tiên, rồi mục `GITHUB_TOKEN Permissions` trong Set up job, rồi `permissions` ở cả cấp workflow và cấp job.
- Nguyên nhân gốc: token không có quyền ghi package; đăng nhập thành công không có nghĩa là có quyền ghi.
:::

---

## Slide 20: Lỗi thường gặp 2: pull bị từ chối

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `denied` hoặc `unauthorized` | Package đang private | Đổi package sang Public |
| Trông giống lỗi gõ sai | Sai tên hoặc tag | Kiểm tra tên chữ thường và đúng tag |

::: details Ghi chú cho mentor
- Package private làm `docker pull` bị `denied`, trông giống lỗi gõ sai tên.
- Không dán PAT vào lệnh; nếu cần giữ private thì đăng nhập bằng PAT `read:packages` qua stdin.
:::

---

## Slide 21: Lỗi thường gặp 3: tên image và Dockerfile

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `invalid reference format` | Tên image có chữ hoa | Dùng `github.repository_owner` hoặc viết thường |
| `failed to read dockerfile` | `context` hoặc thư mục sai | Chắc `club/backend/Dockerfile` tồn tại; chạy từ `~/devops-labs` |

::: details Ghi chú cho mentor
- Workflow không chạy sau merge: file phải ở `.github/workflows/` ở gốc repository và tên nhánh khớp `[main]`.
:::

---

## Slide 22: Tự kiểm tra

1. Vì sao image build trong CI đáng tin hơn image build trên laptop?
2. Step login xanh nhưng step push báo `denied`. Cần kiểm tra điều gì đầu tiên?
3. Người khác `docker pull` bị `unauthorized` dù image tồn tại. Nêu hai nguyên nhân có thể.

::: details Ghi chú cho mentor
- 1: CI build từ một commit sạch trên runner mới, nên truy vết được về commit và ai cũng nhận cùng kết quả. Laptop có Node, cache và biến môi trường khác nhau.
- 2: Quyền của token: khối `permissions` ở cấp job và cấp workflow.
- 3: Package đang private, hoặc tên image hay tag sai. Xác minh trên trang package: visibility và danh sách tag.
:::

---

## Slide 23: Tiếp theo

Người học đã đi hết đường từ code đến image công khai. Ngày 11-14 là phần hoàn thiện và demo: xem [Kế hoạch Ngày 11–14](../../curriculum/basic-wrapup.md).

---

## Slide 24: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker Build with GitHub Actions](https://docs.docker.com/build/ci/github-actions/): build và push image trong pipeline.
- **Tài liệu chính thức:** [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry): đẩy image lên GHCR.
- **Best practice:** [Docker build best practices](https://docs.docker.com/build/building/best-practices/): viết Dockerfile nhỏ, nhanh, an toàn.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật cho container và image.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): dùng token và secret đúng cách.
