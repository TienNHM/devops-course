# Slide buổi 20 – Pipeline Security

> **Tóm tắt:** Buổi học rà soát quyền của `GITHUB_TOKEN` theo nguyên tắc least privilege, quản lý secret an toàn và quét image club-api bằng Trivy một lần. SBOM và pin SHA là nội dung nâng cao.

Bài học viên: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Lệnh lab nằm trong bài học, slide không chép lại.

## Mục tiêu của buổi 20

![Ba mục tiêu: quyền tối thiểu, giữ secret, quét image](/slides/img/s20-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: giải thích least privilege và tác động của `permissions:` lên `GITHUB_TOKEN`; rà soát workflow và đưa quyền về mức tối thiểu cho từng job.
- Quét `club-api:1.0.0` bằng Trivy một lần, đọc và phân loại kết quả theo severity.
- Nội dung nâng cao: SBOM CycloneDX, pin action theo commit SHA, chẩn đoán security gate.
:::

---

## Bài toán thực tế: action lạ cộng write-all

![Copy action từ blog, tag v1 bị đổi sang mã độc, token ghi repo bị lạm dụng](/slides/img/s20-supply-chain.svg)

::: details Ghi chú cho mentor
- Tình huống: một thành viên mới sao chép action từ blog và đặt `permissions: write-all` để workflow chạy nhanh. Tác giả action mất tài khoản, tag `v1` bị trỏ sang mã độc.
- Ở lần chạy kế tiếp, mã độc đọc được `GITHUB_TOKEN` có quyền ghi vào repository và package.
:::

---

## Khái niệm: GITHUB_TOKEN

- **`GITHUB_TOKEN`** là token xác thực mà GitHub tạo tự động cho mỗi lần chạy workflow, dùng để gọi API của GitHub.
- Ví dụ trong dự án: job đẩy image lên GHCR cần `packages: write`, job kiểm thử thì không.

::: details Ghi chú cho mentor
- Quyền của token được khai báo bằng khóa `permissions:` trong workflow hoặc trong từng job.
:::

---

## Khái niệm: Least privilege

![Khối permissions contents read và bảng quyền: contents read, các quyền khác none](/slides/img/s20-permissions.svg)

- **Least privilege** (đặc quyền tối thiểu) là nguyên tắc mỗi thành phần chỉ được cấp đúng quyền cần thiết cho công việc của nó.
- Ví dụ trong dự án: workflow khai báo `contents: read` cho mọi job.

::: details Ghi chú cho mentor
- Quyền cấp ở workflow là mức sàn cho mọi job; job cần thêm quyền thì nâng ở cấp job.
- Quyền nào không được khai báo thì đặt là `none`, nên mã độc chạy trong job đó không thể lạm dụng quyền thừa.
- Mỗi thành phần chỉ có quyền đủ để làm việc, trong thời gian đủ để làm việc.
- Quyền mặc định của token phụ thuộc cài đặt của repository, vì vậy cần khai báo `permissions:` tường minh.
- Quyền cấp ở workflow là mức sàn cho mọi job; job chỉ nâng quyền khi thật sự cần.
:::

---

## Ba quyền hay gặp

| Quyền | Khi nào cần |
| --- | --- |
| `contents: read` | checkout mã nguồn |
| `packages: write` | đẩy image lên GHCR |
| `security-events: write` | tải SARIF lên tab Security |

---

## Khái niệm: Secret

- **Secret** là giá trị nhạy cảm (mật khẩu, token, khóa API) mà workflow cần dùng nhưng không được nằm trong mã nguồn.
- Ví dụ trong dự án: mật khẩu cơ sở dữ liệu không được ghi vào YAML hay Dockerfile.

::: details Ghi chú cho mentor
- Mật khẩu cũng không được ghi vào `compose.yaml`.
- GitHub lưu secret mã hóa trong Settings, Secrets and variables, Actions; workflow nhận giá trị lúc chạy.
:::

---

## Secret: nên và không nên

| Nên làm | Không nên làm |
| --- | --- |
| Lưu ở Secrets and variables | Ghi vào YAML hoặc Dockerfile |
| Truyền qua biến môi trường | Truyền qua tham số dòng lệnh |
| Xoay secret khi nghi bị lộ | Cho rằng xóa commit là đủ |

::: details Ghi chú cho mentor
- Nơi lưu: Settings, Secrets and variables, Actions; không ghi secret vào YAML, Dockerfile, `compose.yaml`.
- Truyền qua biến môi trường của đúng bước, không qua tham số dòng lệnh.
- Xoay (đổi) secret ngay khi nghi ngờ bị lộ; xóa commit không đủ để gỡ secret.
- Với repository cục bộ: dùng `.env` và đưa `.env` vào `.gitignore`.
- Không dùng `echo` để in secret, không in toàn bộ `env`.
:::

---

## Che log có giới hạn

![In secret thô thì bị che, in dạng base64 thì lộ chuỗi thật](/slides/img/s20-masking.svg)

::: details Ghi chú cho mentor
- GitHub che secret bằng cách khớp chuỗi; giá trị bị biến đổi (base64, cắt, đảo) sẽ không bị che.
- Minh họa bằng secret giả và xoay secret sau buổi học.
:::

---

## Khái niệm: Script injection

![Tiêu đề PR chứa lệnh bị nhúng vào run: so với đi qua biến môi trường](/slides/img/s20-injection.svg)

- **Script injection** là lỗ hổng trong đó dữ liệu do người dùng kiểm soát được nhúng vào lệnh shell và bị thực thi.
- Ví dụ trong dự án: tiêu đề PR chứa lệnh sẽ chạy nếu nhúng thẳng vào `run:`.

::: details Ghi chú cho mentor
- Bị thực thi như lệnh. Dữ liệu do người dùng kiểm soát gồm tiêu đề PR, tên nhánh, nội dung issue.
- `${{ ... }}` được thay bằng chuỗi trước khi shell chạy. Dữ liệu do người dùng kiểm soát nhúng vào `run:` có thể chèn lệnh.
- Cách an toàn: gán dữ liệu vào biến môi trường rồi dùng `"$BIEN"`.
:::

---

## Cách viết an toàn

```yaml
# Nguy hiểm
- run: echo "PR title is ${{ github.event.pull_request.title }}"

# An toàn
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "PR title is $PR_TITLE"
```

---

## Pin action theo SHA (nâng cao)

| Cách tham chiếu | Bất biến | Khuyến nghị |
| --- | --- | --- |
| `@main` | Không | Không dùng |
| `@v4` | Không | Chấp nhận với action chính thức |
| `@` kèm SHA 40 ký tự | Có | Dùng cho bên thứ ba |

::: details Ghi chú cho mentor
- Tag `@v4` có thể bị di chuyển sang mã khác nên không bất biến.
- Ghi chú phiên bản trong comment; Dependabot có thể tự cập nhật SHA đã pin.
- Nhược điểm: khó đọc và khó cập nhật thủ công.
:::

---

## Khái niệm: CVE và SBOM (nâng cao)

- **CVE** là mã định danh công khai của một lỗ hổng đã công bố; **SBOM** là danh sách thành phần trong một image.
- Ví dụ trong dự án: SBOM của `club-api` có gói bị ảnh hưởng, `club-web` thì không.

::: details Ghi chú cho mentor
- SBOM là viết tắt của software bill of materials.
- Khi có CVE mới, việc tra SBOM cho biết image nào chứa gói bị ảnh hưởng mà không cần quét lại từng image.
:::

---

## SBOM: tra CVE mới trong vài phút (nâng cao)

![CVE mới được tra trên SBOM của từng image: club-api có gói, club-web không](/slides/img/s20-sbom.svg)

::: details Ghi chú cho mentor
- Dependency review (`actions/dependency-review-action`) so sánh các dependency trước và sau PR.
- Repository public được bật sẵn; repository private có thể cần bật dependency graph hoặc tính năng trả phí, vì vậy cần kiểm tra tài liệu của GitHub. Ở môi trường cục bộ dùng `npm audit`.
:::

---

## Khái niệm: Trivy và quét lỗ hổng

- **Trivy** là công cụ mã nguồn mở quét lỗ hổng bảo mật trong image, hệ tệp và mã nguồn.
- Ví dụ trong dự án: Trivy quét image `club-api:1.0.0` và báo số lỗ hổng ở dòng `Total`.

::: details Ghi chú cho mentor
- Công cụ đối chiếu các gói trong image với cơ sở dữ liệu CVE, rồi xếp mỗi lỗ hổng theo mức nghiêm trọng (severity) như HIGH hoặc CRITICAL.
:::

---

## Quét image bằng tệp tar

![docker save ra file tar cho Trivy đọc; không mount docker.sock](/slides/img/s20-scan-tar.svg)

::: details Ghi chú cho mentor
- Việc mount `docker.sock` vào container trao quyền điều khiển Docker daemon, tương đương quyền root trên máy chủ.
- So sánh nhanh: Trivy chạy bằng container, không cần đăng nhập và phổ biến trong CI; Docker Scout có sẵn trong Docker Desktop nhưng cần đăng nhập Docker Hub.
- Mục tiêu không phải là "0 lỗ hổng" mà là hiểu kết quả, ưu tiên và xử lý có chủ đích.
:::

---

## Pipeline an toàn

![Dependency review, test, build, scan, rồi mới push GHCR; chỉ job publish có packages write](/slides/img/s20-pipeline.svg)

---

## Minh họa: đọc kết quả quét

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

## Lỗi: security gate chặn pipeline

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

## Lab: ba phần

| Phần | Việc làm | Mốc hoàn thành |
| --- | --- | --- |
| 1 | Rà soát `permissions` | `report.md` |
| 2 | Quét `club-api:1.0.0` | Khối `Total:` |
| 3 | `git grep` tìm secret | Đã phân loại |

Lệnh đầy đủ: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md).

::: details Ghi chú cho mentor
- Phần 1: rà soát `permissions` của mọi workflow. Phần 2: quét bằng Trivy, kết quả kèm ngày giờ. Phần 3: `git grep` tìm secret lỡ commit, mỗi dòng đều được phân loại. Bảng của phần 1 nằm trong `report.md`.
:::

---

## Tổng kết

![Ba điều cần nhớ: quyền nhỏ, dữ liệu qua biến môi trường, giữ gate](/slides/img/s20-recap.svg)

---

## Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Controlling permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token): đặt quyền tối thiểu cho token.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions): lưu và dùng secret an toàn.
- **Tài liệu chính thức:** [Trivy documentation](https://trivy.dev/latest/docs/): quét lỗ hổng trong image và code.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): danh sách việc cần làm để khóa pipeline.
- **Best practice:** [CI/CD Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): các rủi ro chính của pipeline.
- **Best practice:** [SLSA specification](https://slsa.dev/spec/v1.0/): chuẩn bảo vệ chuỗi cung ứng phần mềm.
