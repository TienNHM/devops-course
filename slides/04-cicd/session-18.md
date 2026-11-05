# Slide Ngày 10 – Publish Club API lên GHCR

> **Tóm tắt:** Khi merge vào `main`, GitHub Actions tự build image club-api, gắn tag theo SHA và đẩy lên GHCR bằng GITHUB_TOKEN; bạn pull và chạy image đã publish.

## Slide 1: Hôm nay bạn làm ra gì

**Sản phẩm cuối ngày:** workflow `.github/workflows/club-publish.yml` và một image công khai `ghcr.io/<tên-bạn>/club-api:sha-xxxxxxx`. Đây là mốc "ship it" của Lộ trình Cơ bản.

Cần có:

- Đã xong Ngày 9: `club-ci.yml` nằm trên `main` của `devops-labs`.
- Repo `devops-labs` để **public** (GHCR miễn phí cho package public).
- Docker Desktop đang chạy trong WSL.

Thời gian: 15 phút giới thiệu, 85 phút làm, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Ba việc: workflow publish, tag `sha-` khớp commit, pull và chạy lại image.
- Mọi lệnh chạy trong WSL, thư mục `~/devops-labs`. Thay `OWNER` bằng tên tài khoản GitHub, viết thường.
:::

---

## Slide 2: Bài toán thật: build trên laptop, cùng commit hai image

![Hai laptop cho hai image khác nhau, runner sạch cho một image truy vết được](/slides/img/s18-laptop-build.svg)

::: details Ghi chú cho mentor
- Một bạn build `club-api` trên laptop, `docker push` rồi báo "mình đã đẩy bản mới". Một tuần sau không ai biết build từ commit nào, test đã chạy chưa.
- Mỗi laptop có Node, cache, biến môi trường khác nhau.
- Deploy chỉ nên nói "chạy image có tag này", không phải "chạy bản mới nhất trên máy bạn Nam".
:::

---

## Slide 3: Tag trỏ tới digest

![Một repository trên ghcr.io: tag trỏ tới digest, latest có thể đổi sang digest khác](/slides/img/s18-tag-digest.svg)

Tag `sha-3f2a1bc` truy vết về commit. Digest `sha256:...` là mã băm nội dung, không đổi.

::: details Ghi chú cho mentor
- Chỉ cần: registry `ghcr.io` (kho chứa image của GitHub), tag là nhãn, digest là mã băm. Không bàn chiến lược tag (học ở Lộ trình Nâng cao).
- Luôn có tag SHA; không dùng `latest` để deploy.
:::

---

## Slide 4: GITHUB_TOKEN và quyền tối thiểu

![Token tạm của mỗi lần chạy; workflow chỉ contents read, job publish thêm packages write](/slides/img/s18-token.svg)

::: details Ghi chú cho mentor
- `GITHUB_TOKEN` là chìa khóa tạm GitHub cấp cho mỗi lần chạy, hết hạn khi job kết thúc, nên học viên không tạo secret nào.
- Quyền điều khiển bằng khóa `permissions`. Least privilege: `contents: read` ở cấp workflow, nâng quyền chỉ ở job cần.
- GHCR miễn phí cho package public. Tên image phải viết thường.
:::

---

## Slide 5: Bước 1 (10 phút): Build tay trước khi lên CI

Build tay lỗi thì CI chắc chắn lỗi.

```bash
cd ~/devops-labs
git checkout main
git pull
docker build -t club-api:local club/backend
docker images | grep club-api
```

**Kiểm tra: bạn đúng khi** `docker images` có dòng `club-api` với tag `local`.

::: details Ghi chú cho mentor
- Lỗi `failed to read dockerfile`: học viên đang đứng sai thư mục, phải chạy từ `~/devops-labs`.
:::

---

## Slide 6: Bước 2 (25 phút): Tạo nhánh và file workflow

Làm trên nhánh riêng. Workflow nằm ở gốc repo, cạnh `club-ci.yml`.

```bash
git checkout -b day-10-publish
```

Tạo `.github/workflows/club-publish.yml` và dán code của 3 slide tiếp theo, nối tiếp nhau.

**Kiểm tra: bạn đúng khi** `git branch` có dấu `*` ở `day-10-publish`.

::: details Ghi chú cho mentor
- Nếu nhánh chính tên `master`, đổi `[main]` thành `[master]`.
:::

---

## Slide 7: Bước 2: club-publish.yml (phần 1/3)

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

`packages: write` chỉ nằm ở job `publish`, không ở cấp workflow.

::: details Ghi chú cho mentor
- Hỏi lớp: xóa `packages: write` thì bước nào fail? (bước build-push, không phải login)
- Khai báo `permissions` ở cấp job ghi đè cấp workflow.
:::

---

## Slide 8: Bước 2: club-publish.yml (phần 2/3)

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
- Login bằng `github.actor` và `GITHUB_TOKEN`; không có token hay mật khẩu viết thẳng trong file.
- `github.repository_owner` giúp tên image viết đúng; tên chữ hoa gây lỗi `invalid reference format`.
:::

---

## Slide 9: Bước 2: club-publish.yml (phần 3/3)

```yaml
      - uses: docker/build-push-action@v6
        with:
          context: club/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

`context: club/backend` vì Dockerfile nằm ở đó.

**Kiểm tra: bạn đúng khi** file ở `.github/workflows/club-publish.yml` (gốc repo), thụt lề 2 dấu cách, và không có token viết thẳng.

::: details Ghi chú cho mentor
- Dán tiếp ngay dưới `type=sha`, giữ thụt lề 6 dấu cách cho dấu `-`.
:::

---

## Slide 10: Bước 3 (15 phút): Đẩy lên, mở PR, merge

Workflow này chỉ chạy khi code vào `main`, nên bạn phải merge PR.

```bash
git add .github/workflows/club-publish.yml
git commit -m "ci: publish club-api image to GHCR on main"
git push -u origin day-10-publish
```

Trên GitHub mở PR vào `main`. Check `Club CI` của Ngày 9 phải xanh, rồi bấm **Merge pull request**.

::: details Ghi chú cho mentor
- Workflow publish chỉ chạy khi code vào `main`, nên học viên phải merge mới thấy run.
:::

---

## Slide 11: Bước 3: Xem run Club Publish

Mở tab **Actions**, chọn run **Club Publish**, mở step `build-push-action`:

```text
pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx
```

**Kiểm tra: bạn đúng khi** run xanh và log có dòng `pushing manifest` với tên image chữ thường.

::: details Ghi chú cho mentor
- Nếu workflow không chạy sau khi merge: file sai chỗ, hoặc tên nhánh khác `[main]`.
:::

---

## Slide 12: Bước 4 (15 phút): Tag khớp commit

Cập nhật `main` và lấy 7 ký tự đầu của commit:

```bash
git checkout main
git pull
git rev-parse --short=7 HEAD
```

Trên trang repo, cột bên phải, mục **Packages**, mở `club-api`.

**Kiểm tra: bạn đúng khi** tag `sha-xxxxxxx` trên GitHub khớp 7 ký tự trên.

::: details Ghi chú cho mentor
- Nếu học viên merge bằng nút Merge, commit mới nhất trên `main` chính là commit đã build.
:::

---

## Slide 13: Bước 4: Đổi package sang Public

![Trang package club-api với tag sha-3f2a1bc khớp git rev-parse --short=7 HEAD](/slides/img/s18-ghcr-package.svg)

Vào **Package settings**, kéo xuống Danger Zone, đổi visibility sang **Public**.

**Kiểm tra: bạn đúng khi** trang package hiện nhãn Public.

::: details Ghi chú cho mentor
- Image không chứa bí mật nên làm Public được.
- Package mới tạo thường là private; bỏ bước này thì `docker pull` bị `denied`.
:::

---

## Slide 14: Bước 5 (20 phút): Pull image đã publish

Xóa image local để chắc bạn lấy từ registry. Thay `OWNER` và tag bằng giá trị thật.

```bash
docker rmi club-api:local
docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
```

**Kiểm tra: bạn đúng khi** có dòng `Status: Downloaded newer image for ghcr.io/owner/club-api:sha-3f2a1bc`.

::: details Ghi chú cho mentor
- Gõ `OWNER` chữ thường. Nếu `denied` thì quay lại slide Public.
:::

---

## Slide 15: Bước 5: Chạy image và đọc digest

```bash
docker run --rm -d --name club-api-ghcr -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
sleep 2
curl -s http://localhost:3100/health
docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/OWNER/club-api:sha-3f2a1bc
docker rm -f club-api-ghcr
```

`curl` trả `{"status":"healthy","service":"club-api"}`. `docker inspect` in tên image kèm `@sha256:`.

**Kiểm tra: bạn đúng khi** có `"status":"healthy"` và một dòng chứa `@sha256:`.

::: details Ghi chú cho mentor
- Cổng 3100 để không đụng cổng của stack khác. `/health` chạy được dù không có Postgres vì endpoint này không truy vấn database.
- Tag có thể bị trỏ sang image khác, còn digest (mã băm nội dung) thì không đổi.
- Cổng 3100 đã bị chiếm: `docker rm -f club-api-ghcr` rồi chạy lại.
:::

---

## Slide 16: Lỗi thường gặp 1: thiếu packages: write

![Login xanh nhưng Build and push đỏ với denied hoặc 403](/slides/img/s18-denied-push.svg)

Thêm `packages: write` vào job `publish`, rồi chạy lại.

::: details Ghi chú cho mentor
- Điều tra: bước đỏ đầu tiên, rồi mục `GITHUB_TOKEN Permissions` trong Set up job, rồi `permissions` ở cả cấp workflow và job.
- Gốc: token không có quyền ghi package; login thành công không có nghĩa là có quyền ghi.
:::

---

## Slide 17: Lỗi thường gặp 2: pull bị từ chối

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `denied` hoặc `unauthorized` | Package đang private | Đổi package sang Public |
| Trông giống lỗi gõ sai | Sai tên hoặc tag | Kiểm tra tên chữ thường và đúng tag |

::: details Ghi chú cho mentor
- Package private làm `docker pull` bị `denied`, trông giống gõ sai tên.
- Không dán PAT vào lệnh; nếu cần giữ private thì đăng nhập bằng PAT `read:packages` qua stdin.
:::

---

## Slide 18: Lỗi thường gặp 3: tên image và Dockerfile

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `invalid reference format` | Tên image có chữ hoa | Dùng `github.repository_owner` hoặc viết thường |
| `failed to read dockerfile` | `context` hoặc thư mục sai | Chắc `club/backend/Dockerfile` tồn tại; chạy từ `~/devops-labs` |

::: details Ghi chú cho mentor
- Workflow không chạy sau merge: file phải ở `.github/workflows/` ở gốc repo và tên nhánh khớp `[main]`.
:::

---

## Slide 19: Tự kiểm tra

1. Vì sao image build trong CI tốt hơn image build trên laptop?
2. Login xanh nhưng bước push báo `denied`. Bạn kiểm tra gì đầu tiên?
3. Người khác `docker pull` bị `unauthorized` dù image tồn tại. Hai nguyên nhân có thể?

::: details Ghi chú cho mentor
- 1: CI build từ một commit sạch trên runner mới, nên truy vết được về commit và ai cũng cho cùng kết quả. Laptop có Node, cache và biến môi trường khác nhau.
- 2: Quyền của token: khối `permissions` ở cấp job và cấp workflow.
- 3: Package đang private, hoặc tên image hay tag sai. Xác minh trên trang package: visibility và danh sách tag.
:::

---

## Slide 20: Tiếp theo

Bạn đã đi hết đường từ code đến image công khai. Ngày 11-14 là phần hoàn thiện và demo: xem [Kế hoạch Ngày 11–14](../../curriculum/basic-wrapup.md).

---

## Slide 21: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker Build with GitHub Actions](https://docs.docker.com/build/ci/github-actions/): build và push image trong pipeline.
- **Tài liệu chính thức:** [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry): đẩy image lên GHCR.
- **Best practice:** [Docker build best practices](https://docs.docker.com/build/building/best-practices/): viết Dockerfile nhỏ, nhanh, an toàn.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật cho container và image.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): dùng token và secret đúng cách.
