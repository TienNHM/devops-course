# Slide buổi 20 – Pipeline Security

> **Tóm tắt:** Rà soát quyền GITHUB_TOKEN theo least privilege, quản lý secret an toàn và quét image club-api bằng Trivy một lần. SBOM và pin SHA là phần nâng cao.

Bài học viên: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md). Lệnh lab nằm trong bài học, không chép lại ở slide.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: quyền tối thiểu, giữ secret, quét image](/slides/img/s20-goals.svg)

::: details Ghi chú cho mentor
- Chi tiết mục tiêu: giải thích least privilege và tác động của `permissions:` lên `GITHUB_TOKEN`; rà soát workflow, đưa quyền về mức tối thiểu cho từng job.
- Quét `club-api:1.0.0` bằng Trivy một lần, đọc và phân loại theo severity.
- Nâng cao: SBOM CycloneDX, pin action theo commit SHA, chẩn đoán security gate.
:::

---

## Slide 2: Action lạ cộng write-all

![Copy action từ blog, tag v1 bị đổi sang mã độc, token ghi repo bị lạm dụng](/slides/img/s20-supply-chain.svg)

::: details Ghi chú cho mentor
- Kể: thành viên mới copy một action từ blog, đặt `permissions: write-all` cho nhanh. Tác giả mất tài khoản, tag `v1` bị trỏ sang mã độc.
- Lần chạy kế tiếp, mã đó đọc được `GITHUB_TOKEN` có quyền ghi vào repo và package.
:::

---

## Slide 3: Least privilege: không ghi là none

![Khối permissions contents read và bảng quyền: contents read, các quyền khác none](/slides/img/s20-permissions.svg)

::: details Ghi chú cho mentor
- Mỗi thành phần chỉ có quyền đủ để làm việc, trong thời gian đủ để làm việc.
- Quyền mặc định của token phụ thuộc cài đặt repo; hãy khai báo `permissions:` tường minh.
- Quyền cấp workflow là mức sàn cho mọi job; job chỉ nâng quyền khi thật sự cần.
:::

---

## Slide 4: Ba quyền hay gặp

| Quyền | Khi nào cần |
| --- | --- |
| `contents: read` | checkout code |
| `packages: write` | đẩy image lên GHCR |
| `security-events: write` | upload SARIF vào tab Security |

---

## Slide 5: Secret: làm và không làm

| Làm | Không làm |
| --- | --- |
| Lưu ở Settings, Secrets and variables, Actions | Ghi secret vào YAML, Dockerfile, `compose.yaml` |
| Truyền qua biến môi trường của đúng bước | Truyền qua tham số dòng lệnh |
| Xoay ngay khi nghi ngờ lộ | Tin rằng "xóa commit là xong" |

::: details Ghi chú cho mentor
- Với repo local: dùng `.env` và để `.env` trong `.gitignore`.
- Không `echo` secret, không in `env`.
:::

---

## Slide 6: Che log có giới hạn

![In secret thô thì bị che, in dạng base64 thì lộ chuỗi thật](/slides/img/s20-masking.svg)

::: details Ghi chú cho mentor
- GitHub che secret theo kiểu khớp chuỗi; giá trị bị biến đổi (base64, cắt, đảo) sẽ không bị che.
- Demo bằng secret giả, xoay sau buổi.
:::

---

## Slide 7: Script injection

![Tiêu đề PR chứa lệnh bị nhúng vào run: so với đi qua biến môi trường](/slides/img/s20-injection.svg)

::: details Ghi chú cho mentor
- `${{ ... }}` được thay bằng chuỗi trước khi shell chạy. Dữ liệu người dùng kiểm soát (tiêu đề PR, tên nhánh, nội dung issue) nhúng vào `run:` có thể chèn lệnh.
- Cách an toàn: gán vào biến môi trường rồi dùng `"$BIEN"`.
:::

---

## Slide 8: Cách viết an toàn

```yaml
# Nguy hiểm
- run: echo "PR title is ${{ github.event.pull_request.title }}"

# An toàn
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "PR title is $PR_TITLE"
```

---

## Slide 9: Pin action theo SHA (nâng cao)

| Cách tham chiếu | Bất biến | Khuyến nghị |
| --- | --- | --- |
| `@main` | Không | Không dùng |
| `@v4` | Không, tag di chuyển được | Chấp nhận với action chính thức |
| `@` kèm SHA 40 ký tự | Có | Dùng cho bên thứ ba |

::: details Ghi chú cho mentor
- Ghi chú phiên bản trong comment; Dependabot có thể tự cập nhật SHA đã pin.
- Nhược điểm: khó đọc, khó cập nhật thủ công.
:::

---

## Slide 10: SBOM: CVE mới, tra trong vài phút (nâng cao)

![CVE mới được tra trên SBOM của từng image: club-api có gói, club-web không](/slides/img/s20-sbom.svg)

::: details Ghi chú cho mentor
- Dependency review (`actions/dependency-review-action`) so sánh dependency trước và sau PR.
- Repo public bật sẵn; repo private có thể cần bật dependency graph hoặc tính năng trả phí, hãy kiểm tra tài liệu GitHub. Tại local dùng `npm audit`.
:::

---

## Slide 11: Quét image bằng file tar

![docker save ra file tar cho Trivy đọc; không mount docker.sock](/slides/img/s20-scan-tar.svg)

::: details Ghi chú cho mentor
- Mount `docker.sock` cho container quyền điều khiển Docker daemon, tương đương root trên máy bạn.
- So sánh nhanh: Trivy chạy bằng container, không cần đăng nhập, rất phổ biến trong CI; Docker Scout có trong Docker Desktop nhưng cần đăng nhập Docker Hub.
- Mục tiêu không phải "0 lỗ hổng" mà là hiểu, ưu tiên, xử lý có chủ đích.
:::

---

## Slide 12: Pipeline an toàn

![Dependency review, test, build, scan, rồi mới push GHCR; chỉ job publish có packages write](/slides/img/s20-pipeline.svg)

---

## Slide 13: Demo: đọc kết quả quét

```text
club-api.tar (alpine 3.xx)
Total: 0 (HIGH: 0, CRITICAL: 0)

Node.js (node-pkg)
Total: 3 (HIGH: 3, CRITICAL: 0)
```

Mỗi loại thành phần một khối `Total`. Số này đổi theo ngày dù image không đổi.

::: details Ghi chú cho mentor
- Cơ sở dữ liệu CVE đổi liên tục: hôm nay ra 0, ngày mai có thể khác 0.
- Quét thêm một image cũ (`node:18-alpine`) rồi hỏi lớp: bỏ qua, nâng base image, hay vá từng gói?
- Đọc cột Library: gói npm đi kèm base image khác với `express` hay `pg` của ứng dụng.
:::

---

## Slide 14: Lỗi: security gate chặn pipeline

```text
job image-scan: đỏ
Total: 5 (HIGH: 5, CRITICAL: 0)
exit code 1        (job test vẫn xanh)
```

Pipeline làm đúng việc. Nâng base image; nếu phải chấp nhận, ghi vào `.trivyignore` kèm lý do và ngày xem xét lại.

::: details Ghi chú cho mentor
- Điều tra: đọc dòng `Total:`; gói hệ điều hành hay `node-pkg`; cột Fixed Version; chạy lại cục bộ với `--ignore-unfixed`.
- Gốc: base image cũ, hết hỗ trợ. Không tắt gate.
- Lỗi khác: `denied: permission_denied` khi push thì thêm `packages: write` vào đúng job publish; `Resource not accessible by integration` thì thêm đúng một quyền thiếu ở cấp job; Trivy lỗi tải DB hoặc timeout thì chạy lại, giữ volume `trivy-cache`.
:::

---

## Slide 15: Lab: ba phần

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Rà soát `permissions` mọi workflow | Bảng trong `report.md` |
| 2 | Quét `club-api:1.0.0` bằng Trivy | Khối `Total:` kèm ngày giờ |
| 3 | `git grep` tìm secret lỡ commit | Mỗi dòng đã phân loại |

Lệnh đầy đủ: [Buổi 20 – Pipeline Security](../../labs/week-10/session-20.md).

---

## Slide 16: Recap

![Ba điều cần nhớ: quyền nhỏ, dữ liệu qua biến môi trường, giữ gate](/slides/img/s20-recap.svg)

---

## Slide 17: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Controlling permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token): đặt quyền tối thiểu cho token.
- **Tài liệu chính thức:** [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions): lưu và dùng secret an toàn.
- **Tài liệu chính thức:** [Trivy documentation](https://trivy.dev/latest/docs/): quét lỗ hổng trong image và code.
- **Best practice:** [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions): danh sách việc cần làm để khóa pipeline.
- **Best practice:** [CI/CD Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html): các rủi ro chính của pipeline.
- **Best practice:** [SLSA specification](https://slsa.dev/spec/v1.0/): chuẩn bảo vệ chuỗi cung ứng phần mềm.
