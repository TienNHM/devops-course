# Buổi 18 – Thử thách thêm (L2)

Tuần 9/16 · Giai đoạn 3 – CI/CD & Automation · Buổi 18/32

[Bài học Buổi 18](session-18.md) · [Bài tập tuần 9](../../assignments/weekly/week-09.md) · [Hub tuần 9](README.md)

> **Tóm tắt:** Phần tùy chọn của Buổi 18: publish hai image bằng matrix, tag theo git tag, cache type=gha, PR chỉ build, cùng hai tình huống phá lỗi nâng cao với GHCR.

::: tip Trang này dành cho ai
Chỉ làm sau khi bạn đã hoàn thành L1 của [Buổi 18 – Docker CI Pipeline](session-18.md). Làm ở nhà, khoảng 60 phút. Đối chiếu đáp án sau khi nộp bài: [trang tuần 9](README.md).
:::

## Thử thách tự làm (L2)

Làm lần lượt:

1. Publish thêm `club-web` bằng matrix (một job, hai image) giống `.github/workflows/publish.yml` của giáo trình, nhưng bạn phải tự giải thích từng dòng.
2. Thêm tag theo git tag `v*`: khi đẩy tag `v1.0.0` phải có image `club-api:v1.0.0` và `club-web:v1.0.0`.
3. Bật cache `type=gha`. Chạy hai lần liên tiếp (lần hai chỉ đổi một dòng code) và ghi lại thời gian build của hai lần.
4. Với pull request: workflow vẫn build để kiểm tra nhưng không push.
5. Giải thích bằng văn bản (trong `report.md`): vì sao `GITHUB_TOKEN` an toàn hơn Personal Access Token lưu trong secret? Vì sao `packages: write` đặt ở cấp job?

Tiêu chí hoàn thành:

- [ ] Sau khi đẩy tag `v1.0.0`, GHCR có đủ 2 image, mỗi image có tag `v1.0.0` và một tag `sha-`.
- [ ] Log lần chạy thứ hai cho thấy layer được lấy từ cache (dòng có `CACHED` hoặc import cache) và thời gian ngắn hơn lần đầu.
- [ ] PR chỉ build, không tạo package mới.
- [ ] `report.md` có số liệu thời gian trước/sau cache và trả lời câu 5.

::: warning Tự thử trước khi mở gợi ý
Hãy tự thử ít nhất 15 phút trước khi mở gợi ý; đọc log lỗi và tự đoán nguyên nhân sẽ giúp bạn nhớ lâu hơn.
:::

<details><summary>Gợi ý bậc 1 – matrix và tag git</summary>

- Matrix: dùng `strategy.matrix.include` với hai phần tử có `name` và `context`; dùng `matrix.name` trong `images` của `metadata-action` và `matrix.context` trong `context`.
- Tag theo git tag: thêm `tags: ["v*"]` vào `on.push` và dòng `type=ref,event=tag` vào `tags` của `metadata-action`.
- Đẩy git tag: `git tag v1.0.0` rồi `git push origin v1.0.0`.

</details>

<details><summary>Gợi ý bậc 2 – cache và pull request</summary>

- Cache: hai dòng `cache-from: type=gha` và `cache-to: type=gha,mode=max` trong `build-push-action` (với matrix, thêm `scope` riêng cho từng image). Đã có `setup-buildx-action` thì đủ điều kiện.
- Không push trên PR: dùng biểu thức điều kiện cho `push`, và bỏ qua `login-action` bằng `if: github.event_name != 'pull_request'`. Nhớ thêm `pull_request` vào `on`.

</details>

## Phá lỗi nâng cao {#pha-loi-nang-cao}

### Tình huống A – Thiếu quyền packages: write

Cách phá: xóa (hoặc đổi thành `read`) dòng `packages: write` trong job `publish`, commit, push.

Triệu chứng: run đỏ ở bước `Build and push`, log có dòng kiểu `denied: installation not allowed to Create organization package` hoặc `permission_denied: write_package` hoặc `403 Forbidden`. Bước `login` vẫn xanh vì đăng nhập chỉ xác thực danh tính, chưa kiểm tra quyền ghi.

Hướng điều tra:

1. Tìm bước đỏ đầu tiên, đọc dòng lỗi cuối cùng của bước đó.
2. Thấy `denied` hoặc `403` khi push: nghi ngờ quyền token, không phải Dockerfile (vì bước build đã chạy xong).
3. Mở tab Actions, run lỗi, mục Set up job, phần `GITHUB_TOKEN Permissions` để xem token thực sự có quyền gì.
4. Kiểm tra khối `permissions` ở cả cấp workflow và cấp job; khai báo ở cấp job ghi đè cấp workflow.
5. Với repo thuộc tổ chức, kiểm tra thêm Settings, Actions, General, Workflow permissions.

Nguyên nhân gốc: token không có quyền `packages: write`, hoặc package đã tồn tại và được gán cho repo khác nên repo này không được ghi. Cách phòng tránh: luôn khai báo `permissions` tường minh; dùng một workflow mẫu đã chạy tốt; đọc mục `GITHUB_TOKEN Permissions` khi lỗi quyền.

### Tình huống B – Pull bị từ chối do package private

Cách phá: để package ở chế độ private, đăng xuất rồi pull:

```bash
docker logout ghcr.io
docker pull ghcr.io/OWNER/club-api:sha-3f2a1bc
```

Triệu chứng: `Error response from daemon: denied` hoặc `unauthorized` (có thể giống lỗi khi gõ sai tên image).

Hướng điều tra: (1) kiểm tra tên image có viết thường và đúng tag không; (2) mở trang package xem visibility; (3) nếu private, đăng nhập bằng PAT có quyền `read:packages` hoặc đổi sang public.

Nguyên nhân gốc: package private chỉ cho người có quyền pull sau khi xác thực. Cách phòng tránh: quyết định visibility có chủ đích; không bao giờ dán PAT vào lệnh hay commit. Đăng nhập bằng PAT classic có quyền `read:packages` (GHCR chưa hỗ trợ fine-grained PAT cho việc này), đưa token qua stdin từ biến môi trường để không nằm trong lịch sử lệnh:

```bash
read -rs GHCR_TOKEN && export GHCR_TOKEN
echo "$GHCR_TOKEN" | docker login ghcr.io -u OWNER --password-stdin
```

Liên quan tới buổi này còn có kịch bản `examples/troubleshooting/scenario-06` (GitHub Actions fail) và `scenario-07` (ImagePullBackOff) để luyện thêm.

## Câu hỏi thêm

1. Vì sao cần `docker/login-action` trước `build-push-action` khi `push: true`?

   ::: details Đáp án gợi ý
   Registry chỉ nhận push từ danh tính đã xác thực. Login lưu thông tin xác thực để Buildx push lên `ghcr.io`.
   :::

2. `cache-to: type=gha,mode=max` khác `mode=min` thế nào, và vì sao chọn `max` cho Dockerfile multi-stage?

   ::: details Đáp án gợi ý
   `min` chỉ lưu layer của stage cuối; `max` lưu cả layer của các stage trung gian. Stage `dependencies` (chạy `npm ci`) là phần tốn thời gian nhất nên cần được cache.
   :::

## Gặp lỗi trong phần này?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Không thấy tag `v1.0.0` | Workflow thiếu `tags: ["v*"]` ở `on.push` hoặc thiếu `type=ref,event=tag` | Bổ sung cả hai, đẩy lại git tag |
| Mỗi lần build đều chậm, không có cache | Thiếu `setup-buildx-action` hoặc thiếu `cache-from`/`cache-to` | Thêm Buildx và hai dòng cache `type=gha` |
| Cache của club-api và club-web ghi đè nhau | Dùng chung scope cache | Thêm `scope` riêng cho mỗi image |
| PR vẫn tạo package hoặc login lỗi trên PR | Thiếu điều kiện cho `push` và `login-action` | Dùng `github.event_name != 'pull_request'` |

## Tài liệu tham khảo {#tai-lieu}

- [Publishing Docker images (GitHub Docs)](https://docs.github.com/en/actions/use-cases-and-examples/publishing-packages/publishing-docker-images)
- [GitHub Actions cache backend (Docker Docs)](https://docs.docker.com/build/cache/backends/gha/)
- [Automatic token authentication (GitHub Docs)](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication)

Quay lại bài chính: [Buổi 18 – Docker CI Pipeline](session-18.md). Buổi tiếp theo: [Buổi 19 – CD & Deployment Strategies](../week-10/session-19.md).
