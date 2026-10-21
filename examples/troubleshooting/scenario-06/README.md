# Kịch bản 06: Pipeline CI báo đỏ

> **Mức độ:** L1 (Foundation) và L2 (Engineering). **Thời lượng gợi ý:** 40 phút. **Kiến thức:** GitHub Actions, đọc log, `working-directory`, quyền của `GITHUB_TOKEN`, GHCR.

## Bối cảnh

Một thành viên viết workflow CI cho thư viện nhỏ `club-tools` (thư mục `app/`: mã nguồn, test, Dockerfile) rồi đẩy lên GitHub. Workflow gồm hai job: `test` chạy kiểm thử, `publish` build image và đẩy lên GHCR.

File workflow nằm ở `workflow.yml.example`. Để tái hiện, tạo repo riêng tư trong tài khoản của bạn (ví dụ `ts06-lab`), sao chép thư mục `app/` ra gốc repo, đặt workflow vào `.github/workflows/ts06.yml`, rồi push lên nhánh `main`. Không dùng repo thật của dự án nhóm.

## Triệu chứng

Sau khi push, tab Actions hiển thị run đỏ. Email thông báo chỉ ghi `ts06: Run failed`. Cậu ấy kể: "Test chạy ổn trên máy tôi bằng `npm test`".

## Yêu cầu

Làm cho cả hai job xanh. Mỗi lần sửa, ghi lại log của lần chạy trước và log sau khi sửa. Nộp báo cáo gồm 5 mục:

1. Triệu chứng (job nào, step nào, thông báo lỗi chính xác).
2. Nguyên nhân gốc (có thể nhiều hơn một vấn đề, hãy nêu từng vấn đề theo thứ tự xuất hiện).
3. Cách xác minh (đoạn log chứng minh, không chỉ suy đoán từ file YAML).
4. Giải pháp (diff của workflow và lý do).
5. Phòng tránh (làm thế nào bắt lỗi này trước khi push).

Ghi chú L2: giải thích nguyên tắc cấp quyền tối thiểu cho `GITHUB_TOKEN`: bạn đặt quyền ở cấp workflow hay cấp job, và vì sao?

Dọn dẹp khi xong: `bash cleanup.sh`, rồi xóa repo thử nghiệm và package trên GHCR (nếu đã tạo).

<details><summary>Gợi ý</summary>

Khi một job đỏ, mở log và tìm step đầu tiên có dấu x đỏ; các step sau đó không chạy. Nếu step đỏ đầu tiên đã sửa xong mà workflow vẫn đỏ, hãy lặp lại quy trình đọc log: lỗi mới có thể ở job hoặc step khác.

</details>
