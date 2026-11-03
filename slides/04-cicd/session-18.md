# Slide Ngày 10 – Publish Club API lên GHCR

> **Tóm tắt:** Khi merge vào `main`, GitHub Actions tự build image club-api, gắn tag theo SHA và đẩy lên GHCR bằng GITHUB_TOKEN; bạn pull và chạy image đã publish.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: build trong CI, gắn tag, publish lên GHCR](/slides/img/s18-goals.svg)

::: details Ghi chú cho mentor
- Đây là mốc "ship it" của Lộ trình Cơ bản: từ code đến image công khai.
- Ba việc: workflow publish, tag `sha-` khớp commit, pull và chạy lại image.
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

## Slide 3: Tag trỏ tới digest

![Một repository trên ghcr.io: tag trỏ tới digest, latest có thể đổi sang digest khác](/slides/img/s18-tag-digest.svg)

Tag `sha-3f2a1bc` truy vết về commit. Digest `sha256:...` là mã băm nội dung, không đổi.

::: details Ghi chú cho mentor
- Chỉ cần: registry `ghcr.io`, tag là nhãn, digest là mã băm. Không bàn chiến lược tag (học ở Lộ trình Nâng cao).
- Luôn có tag SHA; không dùng `latest` để deploy.
:::

---

## Slide 4: GITHUB_TOKEN và quyền tối thiểu

![Token tạm của mỗi lần chạy; workflow chỉ contents read, job publish thêm packages write](/slides/img/s18-token.svg)

::: details Ghi chú cho mentor
- GHCR miễn phí cho package public. Tên image phải viết thường; package mới tạo thường mặc định private.
- `GITHUB_TOKEN` cấp cho mỗi lần chạy, hết hạn khi job kết thúc. Quyền điều khiển bằng khóa `permissions`.
- Least privilege: `contents: read` ở cấp workflow, nâng quyền chỉ ở job cần.
:::

---

## Slide 5: Pipeline từ merge đến image

![Push hoặc tag kích hoạt chuỗi checkout, buildx, login, metadata, build-push rồi tới GHCR và docker pull](/slides/img/s18-pipeline.svg)

::: details Ghi chú cho mentor
- Hôm nay dùng phiên bản rút gọn: checkout, login, metadata, build-push (bỏ buildx và cache).
- Login bằng `github.actor` và `GITHUB_TOKEN`; quyền ghi package đến từ khối `permissions`.
:::

---

## Slide 6: Phần lõi của workflow publish

```yaml
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  publish:
    permissions:
      contents: read
      packages: write
```

Đăng nhập: `username: ${{ github.actor }}`, `password: ${{ secrets.GITHUB_TOKEN }}`. Tag: `type=sha`.

::: details Ghi chú cho mentor
- Hỏi lớp: xóa `packages: write` thì bước nào fail? (bước build-push, không phải login)
- YAML đầy đủ nằm ở lab, không chép lại ở slide.
:::

---

## Slide 7: Lab: các bước trong 85 phút

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Build tay `club/backend` | Có image `club-api:local` |
| 2, 3 | Viết `club-publish.yml`, PR, merge | Run Club Publish xanh |
| 4 | So tag `sha-`, đổi package sang Public | Tag khớp commit |
| 5 | Pull, chạy, `curl /health` | `healthy` và digest |
| 6 | Ghi `notes/day-10.md` | Note đã merge |

Lệnh và YAML đầy đủ: [Ngày 10 – Publish Club API lên GHCR](../../labs/week-09/session-18.md).

::: details Ghi chú cho mentor
- Workflow chỉ chạy khi code vào `main`, nên học viên phải merge PR mới thấy run.
- Chuẩn bị: build tay trước để chắc Dockerfile đúng.
:::

---

## Slide 8: Demo: tag trên Packages khớp commit

![Trang package club-api với tag sha-3f2a1bc khớp git rev-parse --short=7 HEAD](/slides/img/s18-ghcr-package.svg)

::: details Ghi chú cho mentor
- Merge một PR nhỏ, mở tab Actions: run xanh, log `pushing manifest for ghcr.io/owner/club-api:sha-xxxxxxx`.
- So tag với `git rev-parse --short=7 HEAD`.
:::

---

## Slide 9: Lỗi 1: thiếu packages: write

![Login xanh nhưng Build and push đỏ với denied hoặc 403](/slides/img/s18-denied-push.svg)

::: details Ghi chú cho mentor
- Điều tra: bước đỏ đầu tiên, rồi mục `GITHUB_TOKEN Permissions` trong Set up job, rồi `permissions` ở cả cấp workflow và job.
- Gốc: token không có quyền ghi package; khai báo cấp job ghi đè cấp workflow.
:::

---

## Slide 10: Pull và chạy image đã publish

```text
$ docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
$ docker run --rm -d -p 3100:3000 ghcr.io/OWNER/club-api:sha-3f2a1bc
$ curl -s http://localhost:3100/health
{"status":"healthy","service":"club-api"}
```

Cổng 3100 để không đụng cổng của stack khác.

---

## Slide 11: Lỗi 2: pull bị từ chối

| Triệu chứng | Cách xử lý |
| --- | --- |
| `denied` hoặc `unauthorized` | Đổi package sang Public |
| Giống lỗi gõ sai tên image | Kiểm tra tên chữ thường và đúng tag |

::: details Ghi chú cho mentor
- Package private làm `docker pull` bị `denied`, trông giống gõ sai tên.
- Không dán PAT vào lệnh; nếu cần giữ private thì đăng nhập bằng PAT `read:packages` qua stdin.
:::

---

## Slide 12: Recap

![Ba điều cần nhớ: truy vết, quyền tối thiểu, đọc đúng lỗi](/slides/img/s18-recap.svg)

Tiếp theo: [Lộ trình Cơ bản, Ngày 11–14: hoàn thiện và demo](../../curriculum/basic.md).

---

## Slide 13: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Docker Build with GitHub Actions](https://docs.docker.com/build/ci/github-actions/): build và push image trong pipeline.
- **Tài liệu chính thức:** [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry): đẩy image lên GHCR.
- **Best practice:** [Docker build best practices](https://docs.docker.com/build/building/best-practices/): viết Dockerfile nhỏ, nhanh, an toàn.
- **Best practice:** [Docker Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html): checklist bảo mật cho container và image.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): dùng token và secret đúng cách.
