# Thư viện prompt: bảo mật, chi phí, review, rollback, CI

> **Tóm tắt:** Chín prompt cuối của thư viện (22 đến 30): rà soát bảo mật, giới hạn chi phí, dữ liệu cá nhân, dọn dẹp, README, review diff, rollback, GitHub Actions và MCP ít quyền nhất.

::: tip Bạn làm gì
- **Kết quả:** có prompt sẵn cho các việc cuối trước và sau khi ra mắt, mỗi prompt kèm điều bạn tự kiểm tra.
- **Thời gian:** tra cứu 2 đến 5 phút mỗi prompt.
- **Cần gì trước:** đã đọc phần "Cách dùng" ở [Thư viện prompt](prompt-library.md) (ba quy tắc an toàn) và có `AGENTS.md` trong dự án.
- **Module trước:** [Thư viện prompt](prompt-library.md) (prompt 1 đến 21).
:::

## Bảo mật và chi phí

### 22. Rà soát bảo mật trước khi công khai

- **Mục tiêu:** Lọc những lỗi nguy hiểm nhất trước khi chia sẻ link.
- **Khi nào dùng:** Trước khi đưa link cho người dùng thật.

```text
Hãy rà soát dự án này như người kiểm tra an ninh, chỉ báo cáo, chưa sửa. Kiểm tra: (1) có secret hay khóa trong code hoặc lịch sử gần đây, (2) .env có bị commit không, (3) database có bật RLS hoặc Security Rules chặt không, (4) có endpoint nào cho phép xoá hay sửa dữ liệu mà không kiểm tra người dùng, (5) có thông tin cá nhân nào bị ghi vào log, (6) form có kiểm tra dữ liệu đầu vào không.
Trả lời theo bảng: vấn đề, mức độ, file liên quan, cách sửa.
```

- **Bạn tự kiểm tra:** Với mục nghiêm trọng, tự xác minh lại (đọc file, thử truy cập). Đừng tin báo cáo "không có vấn đề" nếu bạn chưa thử.

### 23. Giới hạn chi phí và hạn mức

- **Mục tiêu:** Không bị hoá đơn bất ngờ.
- **Khi nào dùng:** Dự án có API tính tiền theo lượt (AI, email, lưu trữ) hoặc có thể bị nhiều người truy cập.

```text
Hãy liệt kê mọi nơi dự án có thể phát sinh chi phí theo mức dùng: gọi API trả phí, hàm serverless, băng thông, lưu trữ, database. Với mỗi nơi, đề xuất cách giới hạn: kiểm tra trước khi gọi, giới hạn tần suất (rate limit), giới hạn kích thước tải lên, và tránh vòng lặp gọi API vô hạn trong code.
Nhắc tôi những thiết lập tôi phải tự làm ở trang quản trị của nền tảng như cảnh báo chi tiêu và hạn mức chi tiêu (spending cap) nếu có. Không bật hay mua gói trả phí thay tôi.
```

- **Bạn tự kiểm tra:** Tự vào trang Billing/Usage của từng nền tảng đặt cảnh báo; kiểm tra gói đang dùng là gói miễn phí.

### 24. Rà soát việc gửi dữ liệu cá nhân cho AI

- **Mục tiêu:** Không để dữ liệu thật của người dùng lọt vào prompt hay log.
- **Khi nào dùng:** Dự án có thu thập tên, email, số điện thoại.

```text
Hãy rà soát code và quy trình làm việc của tôi: có chỗ nào dữ liệu cá nhân của người dùng (tên, email, số điện thoại, nội dung tin nhắn) bị ghi vào log, gửi tới dịch vụ bên thứ ba, hoặc nằm trong file mẫu trong repo?
Đề xuất cách thay bằng dữ liệu giả khi gỡ lỗi, che bớt thông tin trong log, và nhắc tôi không dán dữ liệu thật vào bất kỳ prompt nào.
```

- **Bạn tự kiểm tra:** Xem log thật trên nền tảng, đảm bảo không có email hay số điện thoại; repo không chứa file dữ liệu người dùng thật.

### 25. Giảm chi phí và dọn dẹp

- **Mục tiêu:** Giữ mọi thứ trong gói miễn phí và bỏ tài nguyên không dùng.
- **Khi nào dùng:** Sau vài tuần chạy thử, hoặc khi nhận cảnh báo dùng gần hết hạn mức.

```text
Hãy giúp tôi giảm mức dùng: nén ảnh lớn, bật cache cho file tĩnh, bỏ thư viện không dùng, tránh build lại không cần thiết. Liệt kê các tài nguyên trên nền tảng tôi có thể dọn (project thử nghiệm, deployment cũ, bucket trống) để tôi tự xem lại.
Chỉ ĐỀ XUẤT xoá, đừng chạy lệnh xoá nào. Tôi tự quyết định sau khi kiểm tra từng mục.
```

- **Bạn tự kiểm tra:** Xem trang Usage trước và sau; đọc kỹ từng mục trước khi tự xoá, vì xoá database hay project không hoàn tác được.

## Tài liệu, review, rollback và CI

### 26. Viết README cho dự án

- **Mục tiêu:** Người khác (và bạn tương lai) biết dự án chạy ra sao.
- **Khi nào dùng:** Sau khi dự án chạy được.

```text
Hãy viết README.md tiếng Việt cho dự án này gồm: dự án là gì, ảnh chụp hoặc link demo (để trống chỗ link), cách chạy ở máy, cách deploy, danh sách biến môi trường (chỉ tên, trỏ tới .env.example), và quy tắc an toàn (không commit .env).
Không đưa bất kỳ giá trị khóa hay URL nội bộ nào. Dùng ngôn ngữ cho người mới.
```

- **Bạn tự kiểm tra:** Làm theo README từng bước trên thư mục mới; không có secret trong file.

### 27. Review diff trước khi commit

- **Mục tiêu:** Bắt lỗi và rủi ro trước khi code vào repo.
- **Khi nào dùng:** Trước mỗi lần commit lớn hoặc sau khi agent sửa nhiều file.

```text
Hãy chạy git diff và review thay đổi chưa commit như một người rà soát khó tính. Chỉ ra: file nào chứa thứ trông như secret hay khóa, thay đổi nào làm yếu bảo mật (bỏ kiểm tra quyền, mở rule, tắt lint), file nào thêm vào mà không liên quan tới việc tôi nhờ, và thay đổi nào có thể làm hỏng deploy.
Đừng commit. Trả lời bằng danh sách ngắn, kèm tên file và dòng.
```

- **Bạn tự kiểm tra:** Tự chạy `git diff --stat` và đọc ít nhất các file nhạy cảm (workflow, cấu hình bảo mật, rules).

### 28. Rollback khi bản mới bị lỗi

- **Mục tiêu:** Đưa trang về bản tốt gần nhất nhanh nhất, rồi mới tìm nguyên nhân.
- **Khi nào dùng:** Production vừa deploy bị hỏng.

```text
Bản deploy mới nhất lên [NỀN TẢNG] bị lỗi: [MÔ TẢ]. Ưu tiên khôi phục trước, tìm nguyên nhân sau.
Hãy cho tôi cách quay về deployment trước đó theo tài liệu chính thức của nền tảng (qua dashboard hoặc CLI), kèm lưu ý về gói miễn phí nếu có giới hạn. Sau khi tôi khôi phục, giúp tôi so sánh hai commit để tìm nguyên nhân. Đừng chạy git push --force hay xoá deployment.
```

- **Bạn tự kiểm tra:** Mở lại URL production thấy bản cũ chạy tốt; không xoá lịch sử Git. Với database đã đổi cấu trúc, hỏi kỹ trước, vì quay lại code không quay lại dữ liệu.

### 29. Tạo GitHub Actions để deploy

- **Mục tiêu:** Có quy trình tự kiểm tra rồi deploy, quyền tối thiểu.
- **Khi nào dùng:** Muốn chạy test hoặc build trước khi deploy.

```text
Hãy viết .github/workflows/deploy.yml cho dự án này: chạy khi push lên main, cài dependency, build, chạy test nếu có, rồi deploy lên [NỀN TẢNG].
Yêu cầu: khai báo permissions tối thiểu, lấy token từ secrets (chỉ tên, ví dụ NỀN_TẢNG_API_TOKEN), không in secret ra log, không dùng pull_request_target, ghim phiên bản cho action bên thứ ba.
Sau khi viết, tự review lại file theo danh sách trên và liệt kê tên các secret tôi phải tự tạo trong Settings của repo.
```

- **Bạn tự kiểm tra:** Đọc từng dòng workflow; tự tạo secret trong GitHub (hoặc `gh secret set`); xem tab Actions, log không in ra giá trị bí mật.

### 30. Thiết lập kết nối MCP ít quyền nhất

- **Mục tiêu:** Cấu hình MCP chỉ đọc, giới hạn phạm vi.
- **Khi nào dùng:** Muốn agent tự xem log và trạng thái deploy.

```text
Tôi muốn kết nối MCP của [NỀN TẢNG] để bạn xem log và trạng thái deploy. Hãy đọc tài liệu chính thức của nền tảng và đề xuất cấu hình ít quyền nhất: chỉ đọc nếu có, giới hạn một project, chỉ bật nhóm công cụ cần thiết, giữ xác nhận từng thao tác.
Chỉ đưa cho tôi lệnh hoặc nội dung cấu hình, tôi tự chạy và tự đăng nhập OAuth. Đừng yêu cầu token từ tôi. Liệt kê những thao tác bạn sẽ KHÔNG làm qua MCP (xoá, đổi cấu hình thanh toán, đọc secret).
```

- **Bạn tự kiểm tra:** Đối chiếu URL với tài liệu chính thức; sau khi kết nối, xem danh sách công cụ và quyền được cấp; đặt chế độ xác nhận trong công cụ agent.

## Tiếp theo

Quay lại [Thư viện prompt](prompt-library.md), tra [CLI cheatsheet](cli-cheatsheet.md), hoặc đọc [Tên miền, bảo mật, production](07-domain-security-production.md).
