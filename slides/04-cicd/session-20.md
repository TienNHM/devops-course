# Slide buổi 20 – Pipeline Security

> **Tóm tắt:** Buổi học rà soát quyền của `GITHUB_TOKEN` theo nguyên tắc least privilege, quản lý secret an toàn và quét image club-api bằng Trivy một lần. SBOM và pin SHA là nội dung nâng cao.

Bài học viên: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Lệnh lab nằm trong bài học, slide không chép lại.

## Slide 1: Mục tiêu của buổi 20

![Ba mục tiêu: quyền tối thiểu, giữ secret, quét image](/slides/img/s20-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: giải thích least privilege và tác động của `permissions:` lên `GITHUB_TOKEN`; rà soát workflow và đưa quyền về mức tối thiểu cho từng job.
- Quét `club-api:1.0.0` bằng Trivy một lần, đọc và phân loại kết quả theo severity.
- Nội dung nâng cao: SBOM CycloneDX, pin action theo commit SHA, chẩn đoán security gate.
:::

---

## Slide 2: Bài toán thực tế: action lạ cộng write-all

![Copy action từ blog, tag v1 bị đổi sang mã độc, token ghi repo bị lạm dụng](/slides/img/s20-supply-chain.svg)

::: details Ghi chú cho mentor
- Tình huống: một thành viên mới sao chép action từ blog và đặt `permissions: write-all` để workflow chạy nhanh. Tác giả action mất tài khoản, tag `v1` bị trỏ sang mã độc.
- Ở lần chạy kế tiếp, mã độc đọc được `GITHUB_TOKEN` có quyền ghi vào repository và package.
:::

---

## Slide 3: Khái niệm: GITHUB_TOKEN

- **`GITHUB_TOKEN`** là token xác thực mà GitHub tạo tự động cho mỗi lần chạy workflow, dùng để workflow gọi API của GitHub.
- Quyền của token được khai báo bằng khóa `permissions:` trong workflow hoặc trong từng job.
- Ví dụ trong dự án: job đẩy image lên GHCR cần quyền `packages: write`, còn job kiểm thử thì không.

---

## Slide 4: Khái niệm: Least privilege

![Khối permissions contents read và bảng quyền: contents read, các quyền khác none](/slides/img/s20-permissions.svg)

- **Least privilege** (đặc quyền tối thiểu) là nguyên tắc mỗi thành phần chỉ được cấp đúng quyền cần thiết cho công việc của nó.
- Quyền nào không được khai báo thì đặt là `none`, nên mã độc chạy trong job đó không thể lạm dụng quyền thừa.
- Ví dụ trong dự án: workflow khai báo `contents: read` ở cấp workflow, job nào cần thêm quyền mới tự nâng ở cấp job.

::: details Ghi chú cho mentor
- Mỗi thành phần chỉ có quyền đủ để làm việc, trong thời gian đủ để làm việc.
- Quyền mặc định của token phụ thuộc cài đặt của repository, vì vậy cần khai báo `permissions:` tường minh.
- Quyền cấp ở workflow là mức sàn cho mọi job; job chỉ nâng quyền khi thật sự cần.
:::

---

## Slide 5: Ba quyền hay gặp

| Quyền | Khi nào cần |
| --- | --- |
| `contents: read` | checkout mã nguồn |
| `packages: write` | đẩy image lên GHCR |
| `security-events: write` | tải SARIF lên tab Security |

---

## Slide 6: Khái niệm: Secret

- **Secret** là giá trị nhạy cảm (mật khẩu, token, khóa API) mà workflow cần dùng nhưng không được xuất hiện trong mã nguồn.
- GitHub lưu secret mã hóa trong Settings, Secrets and variables, Actions; workflow nhận giá trị lúc chạy.
- Ví dụ trong dự án: mật khẩu cơ sở dữ liệu không được ghi vào YAML, Dockerfile hay `compose.yaml`.

---

## Slide 7: Secret: nên và không nên

| Nên làm | Không nên làm |
| --- | --- |
| Lưu ở Settings, Secrets and variables, Actions | Ghi secret vào YAML, Dockerfile, `compose.yaml` |
| Truyền qua biến môi trường của đúng bước | Truyền qua tham số dòng lệnh |
| Xoay (đổi) secret ngay khi nghi ngờ bị lộ | Cho rằng xóa commit là đủ để gỡ secret |

::: details Ghi chú cho mentor
- Với repository cục bộ: dùng `.env` và đưa `.env` vào `.gitignore`.
- Không dùng `echo` để in secret, không in toàn bộ `env`.
:::

---

## Slide 8: Che log có giới hạn

![In secret thô thì bị che, in dạng base64 thì lộ chuỗi thật](/slides/img/s20-masking.svg)

::: details Ghi chú cho mentor
- GitHub che secret bằng cách khớp chuỗi; giá trị bị biến đổi (base64, cắt, đảo) sẽ không bị che.
- Minh họa bằng secret giả và xoay secret sau buổi học.
:::

---

## Slide 9: Khái niệm: Script injection

![Tiêu đề PR chứa lệnh bị nhúng vào run: so với đi qua biến môi trường](/slides/img/s20-injection.svg)

- **Script injection** là lỗ hổng trong đó dữ liệu do người dùng kiểm soát (tiêu đề PR, tên nhánh, nội dung issue) được nhúng vào lệnh shell và bị thực thi như lệnh.
- Biểu thức `${{ ... }}` được thay bằng chuỗi trước khi shell chạy, nên dữ liệu có thể chèn thêm lệnh vào `run:`.
- Ví dụ trong dự án: tiêu đề PR chứa lệnh sẽ chạy trong job nếu được nhúng trực tiếp vào bước `run:`.

::: details Ghi chú cho mentor
- `${{ ... }}` được thay bằng chuỗi trước khi shell chạy. Dữ liệu do người dùng kiểm soát nhúng vào `run:` có thể chèn lệnh.
- Cách an toàn: gán dữ liệu vào biến môi trường rồi dùng `"$BIEN"`.
:::

---

## Slide 10: Cách viết an toàn

```yaml
# Nguy hiểm
- run: echo "PR title is ${{ github.event.pull_request.title }}"

# An toàn
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "PR title is $PR_TITLE"
```

---

## Slide 11: Pin action theo SHA (nâng cao)

| Cách tham chiếu | Bất biến | Khuyến nghị |
| --- | --- | --- |
| `@main` | Không | Không dùng |
| `@v4` | Không, tag di chuyển được | Chấp nhận với action chính thức |
| `@` kèm SHA 40 ký tự | Có | Dùng cho bên thứ ba |

::: details Ghi chú cho mentor
- Ghi chú phiên bản trong comment; Dependabot có thể tự cập nhật SHA đã pin.
- Nhược điểm: khó đọc và khó cập nhật thủ công.
:::

---

## Slide 12: Khái niệm: CVE và SBOM (nâng cao)

- **CVE** là mã định danh công khai cho một lỗ hổng bảo mật đã được công bố. **SBOM** (software bill of materials) là danh sách các thành phần có trong một phần mềm hoặc image.
- Khi có CVE mới, việc tra SBOM cho biết image nào chứa gói bị ảnh hưởng mà không cần quét lại từng image.
- Ví dụ trong dự án: SBOM của `club-api` liệt kê gói bị ảnh hưởng, còn SBOM của `club-web` thì không.

---

## Slide 13: SBOM: tra CVE mới trong vài phút (nâng cao)

![CVE mới được tra trên SBOM của từng image: club-api có gói, club-web không](/slides/img/s20-sbom.svg)

::: details Ghi chú cho mentor
- Dependency review (`actions/dependency-review-action`) so sánh các dependency trước và sau PR.
- Repository public được bật sẵn; repository private có thể cần bật dependency graph hoặc tính năng trả phí, vì vậy cần kiểm tra tài liệu của GitHub. Ở môi trường cục bộ dùng `npm audit`.
:::

---

## Slide 14: Khái niệm: Trivy và quét lỗ hổng

- **Trivy** là công cụ mã nguồn mở quét lỗ hổng bảo mật trong image, hệ tệp và mã nguồn.
- Công cụ đối chiếu các gói trong image với cơ sở dữ liệu CVE, rồi xếp mỗi lỗ hổng theo mức nghiêm trọng (severity) như HIGH hoặc CRITICAL.
- Ví dụ trong dự án: Trivy quét image `club-api:1.0.0` và báo số lỗ hổng ở dòng `Total`.

---

## Slide 15: Quét image bằng tệp tar

![docker save ra file tar cho Trivy đọc; không mount docker.sock](/slides/img/s20-scan-tar.svg)

::: details Ghi chú cho mentor
- Việc mount `docker.sock` vào container trao quyền điều khiển Docker daemon, tương đương quyền root trên máy chủ.
- So sánh nhanh: Trivy chạy bằng container, không cần đăng nhập và phổ biến trong CI; Docker Scout có sẵn trong Docker Desktop nhưng cần đăng nhập Docker Hub.
- Mục tiêu không phải là "0 lỗ hổng" mà là hiểu kết quả, ưu tiên và xử lý có chủ đích.
:::

---

## Slide 16: Pipeline an toàn

![Dependency review, test, build, scan, rồi mới push GHCR; chỉ job publish có packages write](/slides/img/s20-pipeline.svg)

---

## Slide 17: Minh họa: đọc kết quả quét

```text
club-api.tar (alpine 3.xx)
Total: 0 (HIGH: 0, CRITICAL: 0)

Node.js (node-pkg)
Total: 3 (HIGH: 3, CRITICAL: 0)
```

Mỗi loại thành phần có một khối `Total`. Số này thay đổi theo ngày dù image không đổi.

::: details Ghi chú cho mentor
- Cơ sở dữ liệu CVE thay đổi liên tục: hôm nay kết quả là 0, ngày mai có thể khác 0.
- Quét thêm một image cũ (`node:18-alpine`) rồi đặt câu hỏi cho lớp: bỏ qua, nâng base image hay vá từng gói.
- Đọc cột Library: gói npm đi kèm base image khác với `express` hay `pg` của ứng dụng.
:::

---

## Slide 18: Lỗi: security gate chặn pipeline

```text
job image-scan: đỏ
Total: 5 (HIGH: 5, CRITICAL: 0)
exit code 1        (job test vẫn xanh)
```

Pipeline hoạt động đúng thiết kế. Nâng base image; nếu bắt buộc chấp nhận lỗ hổng, ghi vào `.trivyignore` kèm lý do và ngày xem xét lại.

::: details Ghi chú cho mentor
- Điều tra: đọc dòng `Total:`; xác định gói hệ điều hành hay `node-pkg`; xem cột Fixed Version; chạy lại cục bộ với `--ignore-unfixed`.
- Nguyên nhân gốc: base image cũ, hết hỗ trợ. Không tắt gate.
- Lỗi khác: `denied: permission_denied` khi push thì thêm `packages: write` vào đúng job publish; `Resource not accessible by integration` thì thêm đúng một quyền còn thiếu ở cấp job; Trivy lỗi tải cơ sở dữ liệu hoặc timeout thì chạy lại và giữ volume `trivy-cache`.
:::

---

## Slide 19: Lab: ba phần

| Phần | Việc làm | Mốc hoàn thành |
| --- | --- | --- |
| 1 | Rà soát `permissions` của mọi workflow | Bảng trong `report.md` |
| 2 | Quét `club-api:1.0.0` bằng Trivy | Khối `Total:` kèm ngày giờ |
| 3 | `git grep` tìm secret lỡ commit | Mỗi dòng đã được phân loại |

Lệnh đầy đủ: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md).

---

## Slide 20: Tổng kết

![Ba điều cần nhớ: quyền nhỏ, dữ liệu qua biến môi trường, giữ gate](/slides/img/s20-recap.svg)

---

## Slide 21: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Controlling permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token): đặt quyền tối thiểu cho token.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions): lưu và dùng secret an toàn.
- **Tài liệu chính thức:** [Trivy documentation](https://trivy.dev/latest/docs/): quét lỗ hổng trong image và code.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): danh sách việc cần làm để khóa pipeline.
- **Best practice:** [CI/CD Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): các rủi ro chính của pipeline.
- **Best practice:** [SLSA specification](https://slsa.dev/spec/v1.0/): chuẩn bảo vệ chuỗi cung ứng phần mềm.
