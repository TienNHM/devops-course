# Slide buổi 18 – Docker CI Pipeline

> **Tóm tắt:** Dùng GitHub Actions với Buildx để tự động build image club-api, gắn tag theo SHA và git tag, bật cache và publish lên GHCR bằng GITHUB_TOKEN.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: build trong CI, gắn tag, publish lên GHCR](/slides/img/s18-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: phân biệt image tag, digest, registry; viết workflow dùng `login-action`, `metadata-action`, `build-push-action`.
- Hiểu `GITHUB_TOKEN` và quyền `packages: write` theo least privilege.
- Bật cache `type=gha` và đo thời gian build (tùy chọn); pull image vừa publish và kiểm tra `/health`.
:::

---

## Slide 2: Build trên laptop: cùng commit, hai image

![Hai laptop cho hai image khác nhau, runner sạch cho một image truy vết được](/slides/img/s18-laptop-build.svg)

::: details Ghi chú cho mentor
- Build tay trên laptop: không biết bản đang chạy từ commit nào, ai build, test chạy chưa.
- Mỗi laptop có Node, cache, biến môi trường khác nhau.
- Deploy chỉ nên nói "chạy image có tag này", không phải "chạy bản mới nhất trên máy bạn Nam".
:::

---

## Slide 3: Image, tag, digest, registry

![Một repository trên ghcr.io: tag trỏ tới digest, latest có thể đổi sang digest khác](/slides/img/s18-tag-digest.svg)

| Khái niệm | Ví dụ |
| --- | --- |
| Registry, repository | `ghcr.io`, `ghcr.io/ten-ban/club-api` |
| Tag (con trỏ), digest (mã băm) | `sha-3f2a1bc`, `sha256:...` |

---

## Slide 4: Chiến lược tag

| Tag | Khi nào tạo | Mục đích |
| --- | --- | --- |
| `sha-xxxxxxx` | Mọi push vào nhánh chính | Truy vết về commit |
| `v1.2.0` | Khi đẩy git tag `v1.2.0` | Bản phát hành cho con người |
| `latest` hoặc tên nhánh | Tùy chọn | Thử nghiệm, không deploy |

Luôn có tag SHA, kể cả khi đã có tag phiên bản.

---

## Slide 5: GITHUB_TOKEN và quyền tối thiểu

![Token tạm của mỗi lần chạy; workflow chỉ contents read, job publish thêm packages write](/slides/img/s18-token.svg)

::: details Ghi chú cho mentor
- GHCR (`ghcr.io`): registry tích hợp GitHub, miễn phí cho package public. Tên image phải viết thường; package mới tạo thường mặc định private.
- `GITHUB_TOKEN` cấp cho mỗi lần chạy, hết hạn khi job kết thúc. Quyền điều khiển bằng khóa `permissions`.
- Least privilege: `contents: read` ở cấp workflow, nâng quyền chỉ ở job cần.
:::

---

## Slide 6: Buildx và cache layer

![Lần một build mọi layer, lần hai lấy layer npm ci từ cache](/slides/img/s18-cache.svg)

::: details Ghi chú cho mentor
- Buildx là CLI của BuildKit; `docker/setup-buildx-action` cài builder trên runner.
- Runner là máy mới mỗi lần chạy nên cache layer cục bộ mất; lưu cache ở dịch vụ của Actions.
- `mode=max` lưu cả layer trung gian, như stage `dependencies` (chạy `npm ci`) của club-api.
:::

---

## Slide 7: Ba action Docker chính thức

![login-action, metadata-action, build-push-action và quy tắc tag](/slides/img/s18-actions-chain.svg)

::: details Ghi chú cho mentor
- `docker/login-action@v3`, `docker/metadata-action@v5`, `docker/build-push-action@v6`.
- `metadata-action` nhận quy tắc (`type=sha`, `type=ref,event=tag`) rồi tự tính tag, và sinh label OCI để GHCR liên kết package với repo.
:::

---

## Slide 8: Pipeline từ push đến image

![Push hoặc tag kích hoạt chuỗi checkout, buildx, login, metadata, build-push rồi tới GHCR và docker pull](/slides/img/s18-pipeline.svg)

::: details Ghi chú cho mentor
- Login bằng `github.actor` và `GITHUB_TOKEN`; quyền ghi package đến từ khối `permissions`.
- Build đọc cache, push các tag, ghi cache mới. Học viên pull về, chạy thử, so sánh digest.
:::

---

## Slide 9: Phần lõi của workflow publish

```yaml
permissions:
  contents: read
jobs:
  publish:
    permissions:
      contents: read
      packages: write
```

Đăng nhập: `username: ${{ github.actor }}`, `password: ${{ secrets.GITHUB_TOKEN }}`.

::: details Ghi chú cho mentor
- Hỏi lớp: xóa `packages: write` thì bước nào fail? (bước Build and push, không phải login)
- YAML đầy đủ nằm ở lab, không chép lại ở slide.
:::

---

## Slide 10: Demo: tag trên Packages khớp commit

![Trang package club-api với tag sha-3f2a1bc khớp git rev-parse --short=7 HEAD](/slides/img/s18-ghcr-package.svg)

::: details Ghi chú cho mentor
- Push một commit nhỏ, mở tab Actions: run xanh, log `pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx`.
- Push lần hai: nhanh hơn vì layer `npm ci` lấy từ cache.
:::

---

## Slide 11: Lab L1: bốn phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Viết workflow publish club-api | `packages: write` ở cấp job |
| 2, 3 | Chạy pipeline, so tag `sha-`, đổi Public | Tag khớp commit |
| 4 | Pull, chạy, kiểm tra `/health` | Ghi digest vào evidence |

Lệnh và YAML đầy đủ: [Buổi 18 – Docker CI Pipeline](../../labs/week-09/session-18.md).

::: details Ghi chú cho mentor
- Chuẩn bị: chép source, build tay hai image để chắc Dockerfile đúng trước khi lên CI.
:::

---

## Slide 12: Lỗi 1: thiếu packages: write

![Login xanh nhưng Build and push đỏ với denied hoặc 403](/slides/img/s18-denied-push.svg)

::: details Ghi chú cho mentor
- Điều tra: bước đỏ đầu tiên, rồi mục `GITHUB_TOKEN Permissions` trong Set up job, rồi `permissions` ở cả cấp workflow và job.
- Gốc: token không có quyền ghi package; khai báo cấp job ghi đè cấp workflow.
:::

---

## Slide 13: Pull và chạy image đã publish

```text
$ docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
$ docker run --rm -d -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
$ curl -s http://localhost:3100/health
{"status":"healthy","service":"club-api"}
```

Cổng 3100 để không đụng cổng 3000 của stack khác.

---

## Slide 14: Lỗi 2: pull bị từ chối

| Triệu chứng | Cách xử lý |
| --- | --- |
| `denied` hoặc `unauthorized` | Đổi package sang Public |
| Giống lỗi gõ sai tên image | Kiểm tra tên chữ thường và đúng tag |
| Cần giữ private | Đăng nhập bằng PAT `read:packages` qua stdin |

::: details Ghi chú cho mentor
- Package private làm `docker pull` bị `denied`, trông giống gõ sai tên.
- Không dán PAT vào lệnh; nhập qua stdin hoặc khi được hỏi.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: truy vết, quyền tối thiểu, đọc đúng lỗi](/slides/img/s18-recap.svg)

Buổi sau: [Buổi 19 – CD & Deployment Strategies](session-19.md).

---

## Slide 16: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker Build with GitHub Actions](https://docs.docker.com/build/ci/github-actions/): build và push image trong pipeline.
- **Tài liệu chính thức:** [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry): đẩy image lên GHCR.
- **Best practice:** [Docker build best practices](https://docs.docker.com/build/building/best-practices/): viết Dockerfile nhỏ, nhanh, an toàn.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật cho container và image.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): dùng token và secret đúng cách.
