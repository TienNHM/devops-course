# Hướng dẫn chấm tuần 10 – CD & Pipeline Security

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài và bảng điểm ngắn: [Bài tập tuần 10](../../assignments/weekly/week-10.md). Đáp án và hướng dẫn chấm theo từng nhiệm vụ: [Đáp án tuần 10](../walkthroughs/week-10.md). Bài học: [Buổi 19 – CD & Deployment Strategies](../../labs/week-10/session-19.md), [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md).
:::

> **Tóm tắt:** Barem chi tiết (đạt và không đạt), lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp để chấm bài tuần 10.

## Cách kiểm chứng

Mentor kiểm chứng bằng cách đọc evidence, mở workflow và script trong `source/`, chạy lại lệnh kiểm tra trên máy mentor (ví dụ `python3 -m json.tool` cho SBOM, `shellcheck` hoặc đọc `deploy-local.sh`) và đối chiếu với trạng thái thật trên GitHub (lịch sử commit, lần chạy workflow, tab Packages). Output giống hệt bài của bạn khác, hoặc có dấu hiệu chỉnh tay, sẽ bị hỏi lại trực tiếp.

## Barem chi tiết

Tổng 100 điểm, cộng tối đa 10 điểm thưởng từ L2 (trần cuối cùng 110). Phần bắt buộc (nhiệm vụ 1 đến 5) và phần nâng cao (10 điểm) được chấm ở các dòng riêng.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: deploy bằng script | Override đúng, script có kiểm tra biến, từ chối `latest`, health check `/ready`, ghi trạng thái sau khi khỏe; có evidence đầy đủ | Script thiếu health check hoặc ghi trạng thái trước khi khỏe, hoặc không chứng minh được việc từ chối `latest` | 15 |
| Nhiệm vụ 2: bản thứ hai và rollback | Hai tag thật, hai file trạng thái đúng, image sau rollback đúng tag, giải thích đúng hành vi rollback lần hai | Rollback bằng cách sửa tay, tag không khớp Packages, hoặc giải thích sai | 15 |
| Nhiệm vụ 3: rà soát permissions | Có hai commit riêng, bảng rà soát phủ mọi job với lý do cụ thể, cài đặt repo ở mức chỉ đọc | Chỉ một commit, bảng thiếu job hoặc lý do chung chung | 15 |
| Nhiệm vụ 4: quét image một lần | Output quét kèm `Total` theo từng loại, có thời điểm quét, phân tích đúng ít nhất một lỗ hổng (gói nào, có bản vá không, có nằm trên đường xử lý request không) | Không có thời điểm quét, chỉ chạy lệnh mà không phân tích | 10 |
| Nhiệm vụ 5: tìm secret lỡ commit | Có output `git grep`, diễn giải đúng từng dòng (tên biến, giá trị giả hay giá trị thật) | Không giải thích kết quả `git grep` | 5 |
| Nâng cao: quét sâu, SBOM, pin SHA | Quét thêm `--ignore-unfixed` kèm so sánh, SBOM hợp lệ chứa `express` và `pg` kèm số thành phần, phân tích đúng hai cảnh báo cấu hình, SHA 40 ký tự thật kèm comment và workflow xanh | SBOM không phải JSON hợp lệ, SHA sai hoặc là placeholder, không phân tích cảnh báo | 10 |
| Chất lượng `README.md` và `report.md` | 7 câu theo template, ngắn gọn, đúng, nêu nguyên nhân gốc và giới hạn của giải pháp | Sao chép đề bài, trả lời chung chung | 10 |
| Câu hỏi kiểm tra kiến thức | 5 câu trả lời đúng ý và có ví dụ lệnh hoặc cấu hình khi cần (3 điểm mỗi câu) | Sai hoặc bỏ trống | 15 |
| Vệ sinh và quy trình | Không có secret, `.env`, file tar trong repo; PR đúng quy trình, có reviewer | Commit secret hoặc `.env`, thiếu review | 5 |
| L2 thử thách 1 (thưởng) | Tag không tồn tại bị chặn trước khi đụng stack, workflow đủ các khóa an toàn, đầu vào qua `env` | Chặn sau khi đã dừng stack, hoặc nhúng `inputs.tag` thẳng vào `run:` | 4 |
| L2 thử thách 2 (thưởng) | Workflow xanh, quyền tối thiểu, SBOM trong artifact, action bên thứ ba pin SHA, giải thích ngưỡng | Quyền rộng, thiếu SBOM, hoặc không giải thích ngưỡng | 4 |
| L2 thử thách 3 (thưởng) | Báo cáo 5 phần có bằng chứng quét trước và sau, xử lý nguyên nhân thay vì tắt gate | Chỉ nâng ngưỡng hoặc xóa bước quét để gate xanh | 2 |

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình thay cho output lệnh, hoặc evidence không có lệnh đi kèm.
- Deploy bằng `latest` hoặc tag không khớp tag thật trong tab Packages.
- Ghi file trạng thái trước khi health check đạt, hoặc rollback bằng cách sửa tay `compose.yaml`.
- Để placeholder như `SHA_DAY_DU_40_KY_TU` trong workflow, hoặc SHA bị cắt ngắn.
- Dùng `permissions: write-all`, hoặc không khai báo `permissions` và dựa vào mặc định của repo.
- Nhúng `${{ inputs.tag }}` hoặc dữ liệu do người dùng kiểm soát trực tiếp vào `run:`.
- Mount `docker.sock` vào container quét để cho nhanh.
- Commit `.env`, file `.deploy/`, file tar của image, token hoặc mật khẩu; in secret ra log.
- Đăng ký self-hosted runner cho repo public.
- Làm trong `/mnt/c` hoặc chạy lệnh trên PowerShell nhưng ghi là WSL.
- Tắt hoặc xóa bước quét để gate xanh thay vì xử lý nguyên nhân.
- Chỉ mô tả "đã sửa được" mà không nêu nguyên nhân gốc và cách xác minh.
- Sửa tay file evidence cho "đẹp" hơn thực tế.

## Lệnh kiểm tra nhanh

Chạy trong bản clone repo của học viên (thay đường dẫn cho đúng):

```bash
# Nhiệm vụ 1-2: file trạng thái, ignore, image đang chạy
git check-ignore -v .env .deploy
cat .deploy/current-tag .deploy/previous-tag
docker compose ps --format '{{.Service}} {{.Image}}'

# Nhiệm vụ 3: quyền workflow và lịch sử demo-wide.yml
grep -n -A3 "permissions" .github/workflows/*.yml
git log --oneline -- .github/workflows/demo-wide.yml

# Nâng cao: SBOM hợp lệ, có express và pg, đếm thành phần
python3 -m json.tool lab-20/evidence/club-api-sbom.cdx.json > /dev/null && echo valid
grep -c '"type": "library"' lab-20/evidence/club-api-sbom.cdx.json
grep -m5 '"name": "express"\|"name": "pg"' lab-20/evidence/club-api-sbom.cdx.json

# Nâng cao (pin SHA) và nhiệm vụ 5: SHA 40 ký tự, không placeholder, không secret
grep -n "uses:" .github/workflows/demo-wide.yml
git grep -n "SHA_DAY_DU_40_KY_TU"
git grep -i password
git ls-files | grep -E '\.env$|\.tar$|\.deploy'
```

Ba kiểm tra chéo nên làm: hai tag trong evidence khớp tab Packages; thời điểm quét trong evidence hợp lý với số liệu (cơ sở dữ liệu CVE đổi theo ngày, kết quả giống hệt bài khác là dấu hiệu bất thường); và `demo-wide.yml` có hai commit riêng với SHA 40 ký tự ở bản cuối.

## Câu hỏi vấn đáp gợi ý

Dùng khi nghi ngờ bài chép hoặc muốn kiểm tra mức hiểu. Bảng kèm bằng chứng cần thấy và dấu hiệu bài chép nằm ở mục "Hướng dẫn chấm cho mentor" của [Đáp án tuần 10](../walkthroughs/week-10.md).

1. Vì sao dùng `/ready` thay vì `/health`? Điều gì xảy ra nếu ghi `current-tag` trước health check?
2. Chạy rollback lần hai thì ra gì và vì sao? Rollback có hoàn tác dữ liệu không?
3. Nếu xóa khối `permissions` thì token có quyền gì? Vì sao `packages: write` đặt ở cấp job?
4. Vì sao có HIGH nhưng không cần sửa code của bạn? Vì sao `--ignore-unfixed` có ích và rủi ro của nó là gì?
5. Vì sao SHA an toàn hơn tag? Nếu `git grep` thấy giá trị thật thì làm gì?
6. Chọn một mục trong report và yêu cầu học viên tái hiện nhanh.
7. Câu 2 và 4 của bài kiểm tra: yêu cầu giải thích bằng ví dụ lệnh hoặc workflow cụ thể.
8. L2: vì sao kiểm tra tag phải đứng trước `compose pull`? Rủi ro của self-hosted runner? Vì sao chọn ngưỡng quét này và nó bỏ sót gì? Nếu gate không đỏ thì quan sát cơ chế chặn bằng cách nào?
