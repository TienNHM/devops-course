# Ngày 10 – Publish Club API lên GHCR

Lộ trình Cơ bản · Ngày 10/10 · khoảng 2 giờ

[Slide Ngày 10](../../slides/04-cicd/session-18.md) · [Thử thách thêm](session-18-challenge.md)

> **Tóm tắt:** Khi merge vào `main`, GitHub Actions tự build image Club API, gắn tag `sha-<short>` và đẩy lên GHCR bằng `GITHUB_TOKEN`; bạn `docker pull` và `docker run` chính image đã publish.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** workflow `.github/workflows/club-publish.yml`, một image `ghcr.io/<tên-bạn>/club-api:sha-xxxxxxx` công khai, và `notes/day-10.md`. Đây là mốc "ship it" của Lộ trình Cơ bản.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 9 – GitHub Actions CI cho Club API](../week-08/session-16.md): `club-ci.yml` nằm trên `main` của `devops-labs`.
- [ ] Repo `devops-labs` để **public** (GHCR miễn phí cho package public). Xem [Tài khoản GitHub và repo](../../resources/setup-github.md).
- [ ] Docker Desktop đang chạy trong WSL.
:::

## Bài toán thật

Một bạn trong CLB build image `club-api` trên laptop, gõ `docker push` rồi báo "mình đã đẩy bản mới". Tuần sau không ai biết image đó build từ commit nào, và test đã chạy chưa. Hôm nay bạn đổi cách làm: mỗi lần code vào `main`, một runner sạch build image từ đúng commit đó, gắn tag theo commit (SHA) rồi đẩy lên **registry** (kho chứa image) của GitHub gọi là **GHCR** (`ghcr.io`).

## Làm

Mọi lệnh chạy trong WSL, thư mục `~/devops-labs`. Thay `OWNER` bằng tên tài khoản GitHub của bạn, viết thường.

### Bước 1: Kiểm tra build tay trước khi lên CI

Nếu build tay lỗi thì CI chắc chắn lỗi.

```bash
cd ~/devops-labs
git checkout main
git pull
docker build -t club-api:local club/backend
docker images | grep club-api
```

Kết quả mong đợi: một dòng `club-api` với tag `local`.

::: tip Kiểm tra: bạn đúng khi
`docker images` có `club-api  local`. Lỗi `failed to read dockerfile`: bạn đang đứng sai thư mục (xem [Gặp lỗi?](#gap-loi)).
:::

### Bước 2: Viết workflow publish

Làm trên nhánh riêng, workflow nằm ở gốc repo cạnh `club-ci.yml`.

```bash
git checkout -b day-10-publish
```

Tạo `.github/workflows/club-publish.yml`:

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

      - uses: docker/build-push-action@v6
        with:
          context: club/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

Vì sao như vậy: `GITHUB_TOKEN` là chìa khóa tạm GitHub cấp cho mỗi lần chạy, hết hạn khi job xong, nên bạn không tạo secret nào. Quyền của nó điều khiển bằng `permissions`: cả workflow chỉ đọc, riêng job `publish` được thêm `packages: write` để đẩy image. `type=sha` tạo tag `sha-` cộng 7 ký tự đầu của commit. Nếu nhánh chính tên `master`, đổi `[main]` thành `[master]`.

::: tip Kiểm tra: bạn đúng khi
File ở `.github/workflows/club-publish.yml` (gốc repo), `packages: write` chỉ xuất hiện trong job `publish`, và không có token hay mật khẩu viết thẳng trong file.
:::

### Bước 3: Đẩy lên, mở PR, merge

Workflow này chạy khi code vào `main`, nên bạn cần merge PR.

```bash
git add .github/workflows/club-publish.yml
git commit -m "ci: publish club-api image to GHCR on main"
git push -u origin day-10-publish
```

Trên GitHub mở PR vào `main`. Check `Club CI` của Ngày 9 chạy và phải xanh. Sau đó bấm **Merge pull request**, rồi vào tab **Actions**: run mới của workflow **Club Publish** xuất hiện.

Kết quả mong đợi: các step xanh, và step `build-push-action` có log dạng `pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx`.

::: tip Kiểm tra: bạn đúng khi
Run **Club Publish** xanh và log có dòng `pushing manifest` với tên image chữ thường.
:::

### Bước 4: Kiểm tra package và đổi sang Public

Cập nhật `main` ở máy bạn và lấy 7 ký tự đầu của commit:

```bash
git checkout main
git pull
git rev-parse --short=7 HEAD
```

Trên trang repo, cột bên phải, mục **Packages**, mở `club-api`. Tag `sha-xxxxxxx` phải khớp 7 ký tự trên (nếu bạn merge bằng nút Merge, commit mới nhất trên `main` chính là commit đã build). Tiếp theo vào **Package settings**, kéo xuống Danger Zone, đổi visibility sang **Public**. Image của bạn không chứa bí mật nên làm được. Package mới tạo thường là private và `docker pull` sẽ bị `denied` nếu bạn bỏ bước này.

::: tip Kiểm tra: bạn đúng khi
Tag `sha-` khớp `git rev-parse --short=7 HEAD`, và trang package hiện nhãn Public.
:::

### Bước 5: Pull và chạy image đã publish

Xóa image local để chắc bạn lấy từ registry, rồi pull (thay `OWNER` và tag bằng giá trị thật):

```bash
docker rmi club-api:local
docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
```

Kết quả mong đợi: Docker tải các layer rồi in `Status: Downloaded newer image for ghcr.io/owner/club-api:sha-3f2a1bc`. Chạy và kiểm tra:

```bash
docker run --rm -d --name club-api-ghcr -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
sleep 2
curl -s http://localhost:3100/health
docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/OWNER/club-api:sha-3f2a1bc
docker rm -f club-api-ghcr
```

Kết quả mong đợi: `curl` trả `{"status":"healthy","service":"club-api"}`; `docker inspect` in tên image kèm `@sha256:` và chuỗi digest. Tag có thể bị trỏ sang image khác, còn digest (mã băm nội dung) thì không đổi. Cổng 3100 để không đụng cổng của stack khác. `/health` chạy được dù không có Postgres vì endpoint này không truy vấn database.

::: tip Kiểm tra: bạn đúng khi
`curl` in `"status":"healthy"` và `docker inspect` in một dòng có `@sha256:`.
:::

### Bước 6: Ghi note và commit

Tạo `notes/day-10.md` (ở gốc `devops-labs`). Ghi: tag `sha-` của image, digest, link run xanh của Club Publish, và 2-3 câu trả lời "vì sao deploy nên nói 'chạy image tag này' thay vì 'chạy bản trên máy bạn Nam'?".

```bash
git checkout -b day-10-notes
git add notes/day-10.md
git commit -m "docs: add day 10 note"
git push -u origin day-10-notes
```

Mở PR và merge như thường. Workflow publish sẽ chạy thêm một lần với tag mới; đó là bình thường.

## Gặp lỗi? {#gap-loi}

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `denied`, `permission_denied: write_package` hoặc `403` ở step build-push (login vẫn xanh) | Thiếu `packages: write` ở cấp job | Thêm quyền vào job `publish`, chạy lại; xem mục `GITHUB_TOKEN Permissions` ở step Set up job |
| `docker pull` báo `denied` hoặc `unauthorized` | Package đang private, hoặc gõ sai tên hay tag | Đổi package sang Public (Bước 4); kiểm tra tên chữ thường và tag |
| `invalid reference format` | Tên image có chữ hoa | Dùng `github.repository_owner` trong `metadata-action` hoặc viết thường tên |
| `failed to read dockerfile` hoặc `no such file` | `context` hay thư mục sai | Chắc rằng `club/backend/Dockerfile` tồn tại; chạy lệnh từ `~/devops-labs` |
| Workflow không chạy sau khi merge | File không ở `.github/workflows/` ở gốc repo, hoặc tên nhánh khác `[main]` | Đưa file về đúng chỗ, sửa tên nhánh |
| Cổng 3100 đã bị chiếm | Container cũ còn chạy | `docker rm -f club-api-ghcr` rồi chạy lại |

## Nộp bài

- [ ] `.github/workflows/club-publish.yml` đã merge vào `main` của `devops-labs`.
- [ ] Trên GHCR có image `club-api` với tag `sha-` khớp commit và package là Public.
- [ ] `notes/day-10.md` có tag, digest, link run xanh và câu trả lời.
- [ ] Không có token, PAT, mật khẩu hay file `.env` trong commit.

## Tự kiểm tra

1. Vì sao image build trong CI tốt hơn image build trên laptop?
2. Login xanh nhưng bước push báo `denied`. Bạn kiểm tra gì đầu tiên?
3. Người khác `docker pull` bị `unauthorized` dù image tồn tại. Hai nguyên nhân có thể?

::: details Đáp án gợi ý
1. CI build từ một commit sạch trên runner mới, nên truy vết được về commit và ai cũng cho cùng kết quả. Laptop có Node, cache và biến môi trường khác nhau.
2. Quyền của token: khối `permissions` ở cấp job và cấp workflow. Login thành công không có nghĩa là có quyền ghi.
3. Package đang private, hoặc tên image hay tag sai. Xác minh trên trang package: visibility và danh sách tag.
:::

## Tiếp theo

Bạn đã đi hết đường từ code đến image công khai. Xem phần cuối của [Lộ trình Cơ bản](../../curriculum/basic.md) ("Ngày 11–14: hoàn thiện và demo").

::: details Tài liệu tham khảo
- [Working with the Container registry (GitHub Docs)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [docker/metadata-action](https://github.com/docker/metadata-action)
:::
