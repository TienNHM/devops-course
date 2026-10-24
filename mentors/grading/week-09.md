# Chấm bài tuần 9 – Automated Testing & Docker CI

::: warning Dành cho mentor
Trang này dành cho người chấm; học viên không cần đọc. Đề bài: [Bài tập tuần 9](../../assignments/weekly/week-09.md). Đáp án và hướng dẫn chấm chi tiết: [Walkthrough tuần 9](../walkthroughs/week-09.md). Bài học: [Buổi 17 – Automated Testing](../../labs/week-09/session-17.md) và [Buổi 18 – Docker CI Pipeline](../../labs/week-09/session-18.md).
:::

> **Tóm tắt:** Barem chi tiết (đạt và không đạt), lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp để chấm bài tuần 9.

## Barem chi tiết

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Unit test (Nhiệm vụ 1) | Đủ 4 test mới, `pass 5`, mock đúng cách, process thoát | Thiếu test, test cần DB thật, treo, hoặc kết quả không khớp log | 15 |
| Workflow test và report (Nhiệm vụ 2) | Run xanh, artifact đúng, `if: always()` được chứng minh | Workflow sai chỗ, thiếu artifact, không chứng minh được khi đỏ | 15 |
| Branch protection (Nhiệm vụ 3) | Có PR đỏ bị khóa merge và PR xanh mở khóa, link kiểm chứng được | Chỉ có ảnh chụp, rule chọn sai check hoặc sai nhánh | 15 |
| Workflow publish (Nhiệm vụ 4) | Permissions least privilege, dùng `GITHUB_TOKEN`, tag `sha-` khớp commit | `packages: write` ở cấp workflow, dùng PAT, tag không khớp | 20 |
| Pull và chạy image (Nhiệm vụ 5) | Pull từ GHCR, `/health` healthy, có digest, dọn container | Dùng image build local, thiếu digest, cổng bị cấm | 10 |
| README và report | Trả lời đủ 7 câu, mô tả lỗi và điều tra có thật, đúng cấu trúc thư mục | Thiếu mục, mô tả chung chung hoặc chép từ bài lab | 10 |
| Câu hỏi kiểm tra kiến thức | Trả lời đúng ý, có lập luận | Sai ý hoặc chỉ nêu kết luận | 10 |
| Vệ sinh repo và quy trình | Không có secret, không có `node_modules`, PR có reviewer | Có `.env`, token, hoặc PR chưa review | 5 |
| Tổng L1 | | | 100 |
| L2-A Integration test | Đạt đủ 4 tiêu chí | Thiếu tiêu chí hoặc test phụ thuộc thứ tự | thưởng tối đa 4 |
| L2-B Pipeline hai image, tag, cache | Đạt đủ tiêu chí, có số liệu thời gian | Không có bằng chứng cache hoặc PR vẫn push | thưởng tối đa 4 |
| L2-C Giải thích thiết kế | Có ví dụ gắn với repo của bạn | Chung chung | thưởng tối đa 2 |
| Tổng thưởng L2 | | | tối đa 10 |

Điểm tối đa là 110 (100 điểm L1 và tối đa 10 điểm thưởng L2). Bài không có bằng chứng kiểm chứng được cho một nhiệm vụ thì nhiệm vụ đó tối đa một nửa điểm.

## Lỗi hay bị trừ điểm

- Nộp ảnh chụp màn hình mà không có link run, link PR hay log để kiểm chứng.
- Workflow đặt trong `lab-17/` hoặc `lab-18/` (không nằm ở `.github/workflows/` của gốc repo) nên không hề chạy.
- `packages: write` đặt ở cấp workflow, hoặc dùng PAT thay cho `GITHUB_TOKEN` mà không có lý do.
- Tên image có chữ hoa, hoặc tag `sha-` trong evidence không khớp commit của run.
- Dùng image build local rồi nói là đã pull từ GHCR (evidence thiếu `docker pull` thật hoặc digest).
- Test phụ thuộc thứ tự chạy hay dữ liệu còn sót trong DB; quên đóng server hoặc `pool.end()` làm test treo.
- Commit `node_modules`, `test-results.xml`, `.env`, token hoặc mật khẩu thật.
- Chọn nhầm tên check trong branch protection nên rule không có tác dụng, hoặc chưa từng kiểm chứng rule bằng PR đỏ.
- Chạy cổng bị cấm (3000, 5432, 8080) trong lệnh evidence thay vì cổng riêng của lab (3100, 5433).
- README và report chép nguyên văn từ bài lab, không có lỗi hay số liệu thật của bạn.
- Nộp trễ hạn hoặc PR chưa có người review.

## Lệnh kiểm tra nhanh

Chạy trên bản clone repo của học viên (trong WSL). Thay `OWNER` bằng tên tài khoản viết thường.

```bash
# Nhiệm vụ 1: chạy lại unit test trên source đã nộp (mong đợi pass 5, fail 0, process tự thoát)
cd lab-17/source/backend && npm ci && npm test -- --test-reporter=spec

# Nhiệm vụ 1: có node_modules, test-results.xml hay .env bị commit không
git ls-files | grep -E "node_modules|test-results.xml|\.env" || echo "sạch"

# Nhiệm vụ 2: workflow có nằm đúng chỗ và có if: always() không
ls .github/workflows && grep -n "always()" .github/workflows/lab17-ci.yml

# Nhiệm vụ 4: permissions ở cấp workflow và cấp job, có PAT không
grep -n -B1 -A3 "permissions" .github/workflows/publish.yml
grep -n "secrets\." .github/workflows/publish.yml

# Nhiệm vụ 4: SHA của commit để đối chiếu với tag sha- trong evidence
git log --oneline -5
git rev-parse --short=7 HEAD

# Nhiệm vụ 5: image chỉ có RepoDigests khi đến từ docker pull
docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/OWNER/club-api:sha-xxxxxxx

# Vệ sinh repo: tìm token lọt vào lịch sử
git grep -i -n -E "ghp_|token|password" -- . ":(exclude)*.lock" | head
```

Kiểm tra chéo nên làm: tag `sha-` so với commit của run; số thẻ `testcase` trong artifact so với số test của `npm test` (5); digest so với trang package trên GHCR.

## Câu hỏi vấn đáp

| Nhiệm vụ | Câu hỏi |
| --- | --- |
| 1 | Vì sao mock `console.error` trong test nhánh 500? Điều gì xảy ra nếu bỏ `pool.end()`? |
| 2 | Vì sao step upload cần `if: always()`? Vì sao `working-directory` phải khớp `cache-dependency-path`? |
| 3 | Làm sao biết rule thật sự có tác dụng? Admin có bỏ qua được rule không? |
| 4 | Nếu xóa `packages: write` thì bước nào đỏ và vì sao login vẫn xanh? Vì sao tên image phải chữ thường? |
| 5 | Digest khác tag ở điểm nào? Vì sao `/health` chạy mà không cần DB? |
| README và report | Chọn một lỗi trong report và yêu cầu tái hiện nhanh. |
| Câu hỏi kiểm tra | Câu 3: yêu cầu liệt kê ba nguyên nhân PR đỏ vẫn merge được và chỉ chỗ kiểm tra từng cái trên GitHub. |
| Vệ sinh | Chạy `git log --stat` và `git grep -i token` trên repo của học viên. |
| L2-A | Vì sao test này không phụ thuộc test khác? Nếu thêm file integration thứ hai thì cần gì? |
| L2-B | Nếu bỏ `scope` thì điều gì xảy ra? Vì sao `mode=max`? |
| L2-C | Test nào bạn thêm khi có `POST /api/members` và vì sao? |

## Dấu hiệu bài chép hoặc không hiểu

- Test gọi DB thật trong phần unit; gán trực tiếp `pool.query`; không có `pool.end()` nên treo; tổng số test không khớp log.
- Workflow nằm trong `lab-17/`; chỉ có run xanh; số `testcase` trong XML khác `npm test`.
- Chỉ có ảnh; rule chọn tên workflow thay vì tên job; rule áp dụng nhầm nhánh.
- `packages: write` ở cấp workflow; có PAT; tag không khớp commit; tên image chữ hoa.
- Thiếu `docker pull`; digest không có `@sha256`; dùng cổng 3000 hoặc 8080.
- Số liệu thời gian cache trùng tài liệu hoặc trùng bạn khác; run ID, SHA, digest không thuộc repo của học viên.
