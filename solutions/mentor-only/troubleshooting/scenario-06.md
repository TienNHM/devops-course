# Đáp án 06: GitHub Actions fail

Đề bài dành cho học viên: [Kịch bản 06](../../../examples/troubleshooting/scenario-06/README.md).

> Trạng thái kiểm chứng: phần `working-directory` được mô phỏng bằng Docker (thư mục sai không tồn tại, thư mục đúng chạy `npm ci` và `npm test` thành công). Việc chạy workflow thật trên GitHub, thông báo lỗi chính xác của runner và lỗi quyền GHCR chưa được chạy trong quá trình biên soạn. Hãy chạy thử một lần trước buổi học và đối chiếu từng đoạn log bên dưới.

## Nguyên nhân gốc

Có hai lỗi xếp lớp, lỗi sau chỉ lộ ra khi lỗi trước được sửa.

1. Job `test`: các step `npm ci` và `npm test` đặt `working-directory: services/api`, nhưng thư mục đó không tồn tại trong repo. Mã nguồn nằm ở `app/`. Runner không thể khởi động step, job đỏ ngay ở step đầu tiên dùng thư mục sai, các step sau không chạy và job `publish` bị bỏ qua (do `needs: test`).
2. Job `publish`: workflow đặt `permissions: contents: read` ở cấp workflow, nên `GITHUB_TOKEN` không có quyền `packages: write`. Đăng nhập GHCR có thể thành công nhưng bước đẩy image bị từ chối.

Ngoài ra, workflow đã xử lý sẵn một bẫy thường gặp: tên image GHCR phải viết thường, nên chủ repo có chữ hoa (ví dụ tên người dùng có chữ hoa) cần chuyển về chữ thường như step `Set image name`.

## Lệnh điều tra theo thứ tự

1. Mở tab Actions, chọn run đỏ, chọn job `test`, tìm step đầu tiên có dấu x đỏ.
2. Đọc log step `Install dependencies`. Dự kiến thông báo có dạng:

```text
Error: An error occurred trying to start process '/usr/bin/bash' with working directory '/home/runner/work/ts06-lab/ts06-lab/services/api'. No such file or directory
```

3. Đối chiếu với cấu trúc repo: `git ls-files | head -20` hoặc xem thư mục trong tab Code. Thấy `app/package.json` và không có `services/api`.
4. Tái hiện cục bộ không cần push (đã kiểm chứng ý tưởng bằng Docker):

```bash
docker run --rm -v "$PWD:/r" -w /r node:22-alpine sh -c 'cd services/api'
```

Output mong đợi: `can't cd to services/api: No such file or directory`.

5. Sau khi sửa lỗi 1, mở lại job `publish`, đọc step `docker/build-push-action`. Dự kiến thấy lỗi dạng `403 Forbidden` hoặc `denied` khi đẩy lên `ghcr.io`. Nội dung chính xác có thể khác tùy phiên bản; điều chắc chắn là lỗi xuất hiện ở bước push chứ không ở bước build.

## Cách sửa

Lỗi 1 (đã kiểm chứng với `app/`: `npm ci` và `npm test` qua):

```diff
       - name: Install dependencies
-        working-directory: services/api
+        working-directory: app
         run: npm ci

       - name: Run tests
-        working-directory: services/api
+        working-directory: app
         run: npm test
```

Lỗi 2, chỉ cấp quyền ghi package cho job cần nó (chưa chạy trên GitHub):

```diff
   publish:
     needs: test
     runs-on: ubuntu-latest
+    permissions:
+      contents: read
+      packages: write
     steps:
```

Khi một job khai báo `permissions` riêng, mọi quyền không liệt kê đều bị đặt thành `none`, vì vậy phải ghi cả `contents: read` để `actions/checkout` hoạt động trong repo riêng tư.

## Cách xác minh đã sửa

- Tab Actions: cả hai job `test` và `publish` xanh.
- Trang Packages của tài khoản có `ts06-app` với tag là mã commit.
- Đọc log step `Run tests` thấy `pass 1` và `fail 0`.

Lưu ý dọn dẹp: package đẩy lên GHCR mặc định riêng tư; học viên nên xóa package và repo thử nghiệm sau khi xong.

## Phòng tránh

- Chạy cùng lệnh ở cùng thư mục trên máy trước khi push (đúng `working-directory`).
- Dùng linter cho workflow, ví dụ `actionlint`, và xem kỹ log của lần chạy đầu tiên.
- Đặt quyền tối thiểu: `permissions: contents: read` ở cấp workflow, nâng quyền ở cấp job khi thật sự cần.
- Dùng `workflow_dispatch` để chạy thủ công và thử nghiệm nhanh.
- Tách job `test` khỏi `publish` và chỉ publish trên nhánh chính, như workflow mẫu của giáo trình.

## Câu hỏi mentor

1. Vì sao job `publish` không chạy khi `test` đỏ? (`needs`.)
2. `working-directory` ảnh hưởng đến những loại step nào? Có áp dụng cho `uses:` không? (Không: chỉ áp dụng cho step `run`.)
3. `GITHUB_TOKEN` là gì, vòng đời của nó, vì sao tốt hơn dùng personal access token?
4. Vì sao đặt quyền ở cấp job an toàn hơn cấp workflow?
5. Làm sao đọc log nhanh: bật debug logging, tải log, chạy lại job lỗi? Khi đó nên lưu ý gì về secrets trong log?

## Thang chấm (điều chỉnh)

| Mục | Điểm tối đa | Ghi chú riêng |
| --- | --- | --- |
| Triệu chứng | 10 | Nêu đúng job và step đỏ đầu tiên |
| Nguyên nhân gốc | 30 | 15 điểm cho lỗi thư mục, 15 điểm cho lỗi quyền |
| Cách xác minh | 25 | Trích log thật của từng lần chạy |
| Giải pháp | 20 | Sửa tối thiểu; cấp quyền ở cấp job, không `write-all` |
| Phòng tránh | 15 | Linter, chạy cục bộ, quyền tối thiểu |
| Thưởng L2 | 10 | Giải thích nguyên tắc quyền tối thiểu |
