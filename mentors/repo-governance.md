# Quản lý repo giáo trình

> **Tóm tắt:** Quy tắc duy trì repo giáo trình qua nhiều thế hệ: đóng góp nội dung, quy trình thay đổi, versioning curriculum, changelog, tách repo private chứa đáp án, cập nhật phiên bản công cụ mỗi kỳ và kiểm tra link định kỳ.

::: warning Dành cho mentor
Trang này dành cho người quản lý nội dung khóa; học viên không cần đọc.
:::

Tài liệu này mở rộng [CONTRIBUTING](https://github.com/TienNHM/devops-course/blob/master/CONTRIBUTING.md). Người chịu trách nhiệm cuối cùng là Program Lead.

## 1. Cấu trúc và chủ sở hữu nội dung

| Thư mục | Nội dung | Người duyệt |
| --- | --- | --- |
| `curriculum/` | Syllabus, lịch học, chuẩn đầu ra, đánh giá | Program Lead |
| `labs/` | Bài lab 32 buổi | Technical Mentor |
| `assignments/` | Assignment hằng tuần và capstone | Technical Mentor |
| `slides/` | Slide theo phase | Technical Mentor |
| `starter-project/` | Ứng dụng xuyên suốt (backend, frontend, database, Compose, k8s) | Technical Mentor, Lab Assistant chạy kiểm thử |
| `examples/` | Ví dụ lệnh, workflow, tình huống lỗi | Technical Mentor |
| `templates/` | Mẫu lab, assignment, project, ADR, peer review | Program Lead |
| `resources/` | Setup guide, cheatsheet, tài liệu tham khảo | Lab Assistant, Technical Mentor duyệt |
| `mentors/` | Sổ tay, kịch bản buổi, barem chấm, đáp án (walkthroughs) | Program Lead |
| `.github/workflows/` | CI và publish mẫu | Technical Mentor |

Mỗi phần nội dung nên có một chủ sở hữu rõ ràng để hỏi khi có thay đổi. Danh sách này cập nhật mỗi kỳ.

### 1.1 Quy ước cấu trúc mới

Nội dung được sắp theo người học và tuần học, nội dung của người dạy tách riêng:

| Loại trang | Đường dẫn | Ai đọc | Ghi chú |
| --- | --- | --- | --- |
| Cổng vào học viên | `curriculum/getting-started.md`, `curriculum/syllabus.md` | Học viên | `schedule.md` chỉ trỏ về syllabus |
| Hub tuần | `labs/week-XX/README.md` | Học viên | 40 đến 70 dòng: mục tiêu, bảng Trước, Trong, Sau buổi, link slide, bài tập, đáp án |
| Bài học | `labs/week-XX/session-NN.md` | Học viên | Mục tiêu 200 đến 300 dòng, không quá 350; thử thách L2 tách ra `session-NN-challenge.md` nếu dài |
| Bài tập tuần | `assignments/weekly/week-XX.md` | Học viên | Bài tập là nộp lại bằng chứng của lab, đầu trang có bảng nhiệm vụ |
| Slide | `slides/<deck>/session-NN.md` | Học viên, mentor | Chỉ khái niệm, sơ đồ, demo outline, recap; không chép lệnh lab |
| Kịch bản buổi | `mentors/sessions/session-NN.md` | Mentor | Demo của mentor, câu hỏi cho lớp, khung thời gian, ghi chú giảng viên |
| Barem chấm | `mentors/grading/week-XX.md` | Mentor | Barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh, câu hỏi vấn đáp |
| Đáp án | `mentors/walkthroughs/week-XX.md` | Mentor, học viên sau khi nộp bài | Nằm trong website, hub tuần link tới |
| Tra cứu | `resources/` (setup-guide, setup-github, terminal-101, glossary, troubleshooting-setup, cheatsheets) | Học viên | `setup-guide.md` là nguồn duy nhất cho các bước cài |
| Mentor-only | `solutions/mentor-only/` | Mentor | Ngoài build (`srcExclude`), nên chuyển repo private |

Mọi trang trong `mentors/` mở đầu bằng khối `::: warning Dành cho mentor`. Trang học viên không chứa "Demo của mentor", "Câu hỏi mentor nên hỏi lớp", khung thời gian giảng viên, lời giải L2 hay barem; các phần đó nằm ở `mentors/`.

Môi trường thống nhất mọi trang phải khớp: repo giáo trình clone vào `~/devops-course` trong WSL; repo cá nhân `devops-labs` để public; cluster kind tên `club`, context `kind-club` (từ buổi 21); `postgres:17-alpine`; image `club-api:1.0.0`, `club-web:1.0.0`; namespace `club`; service Compose `frontend`, `backend`, `postgres`; port web 8080.


## 2. Quy trình thay đổi nội dung

### 2.1 Mọi thay đổi đi qua Pull Request

- Không push trực tiếp vào nhánh chính. Bật branch protection cho nhánh chính: yêu cầu PR, ít nhất một approval, CI xanh.
- Tên nhánh: `docs/ten-ngan`, `lab/week-XX-ten-ngan`, `fix/ten-ngan`, `starter/ten-ngan`.
- Thông điệp commit ngắn, nêu rõ thay đổi (ví dụ: `Fix Compose healthcheck command in lab 14`).

### 2.2 Phân loại thay đổi

| Loại | Ví dụ | Quy trình |
| --- | --- | --- |
| Sửa nhỏ | Chính tả, link hỏng, làm rõ câu chữ | PR một reviewer, merge nhanh |
| Sửa lab hoặc lệnh | Đổi lệnh, thêm bước, đổi kết quả mong đợi | PR, người review phải chạy lại lệnh trên máy sạch, ghi vào PR |
| Thay đổi starter project | Sửa Dockerfile, Compose, manifests, code backend | PR, chạy lại toàn bộ lab bị ảnh hưởng (xem 2.4), cập nhật CHANGELOG |
| Thay đổi cấu trúc | Đổi thứ tự buổi, thêm hoặc bỏ lab, đổi trọng số đánh giá | Issue thảo luận trước, Program Lead duyệt, tăng phiên bản (mục 3) |

### 2.3 Quy trình chi tiết cho một thay đổi lab

1. Mở Issue mô tả vấn đề (nhãn `doc-bug`, `lab`, `starter`, `enhancement`).
2. Tạo nhánh, sửa nội dung theo [mẫu lab](../templates/lab-template.md): mô tả vấn đề, kiến thức, các bước, kết quả mong đợi, lỗi thường gặp, cách khắc phục, cải tiến.
3. Chạy kiểm tra định dạng:

```bash
node scripts/check-lessons.mjs labs/week-04
```

4. Chạy lại lab trên môi trường sạch, dán kết quả vào mô tả PR.
5. Mở PR, gán reviewer; reviewer chạy lại lệnh thay đổi, không chỉ đọc.
6. Merge, đóng Issue, thêm dòng vào mục Unreleased của CHANGELOG nếu thay đổi có ảnh hưởng tới học viên.

### 2.4 Bảng ảnh hưởng của starter project

Khi sửa một file của `starter-project/`, chạy lại các lab liên quan:

| File sửa | Chạy lại |
| --- | --- |
| `backend/` (code, Dockerfile) | Lab Dockerfile, Compose, CI, Kubernetes backend, `npm test` |
| `frontend/` (Nginx, HTML) | Lab Compose, Kubernetes frontend, Ingress |
| `database/init.sql` | Lab network và volume, Compose, PVC, StatefulSet |
| `compose.yaml` | Lab Compose, backup và restore, các tình huống lỗi 01 đến 04 |
| `k8s/*.yaml` | Lab Kubernetes từ tuần 11 đến 14, tình huống lỗi 07 đến 10 |
| `.github/workflows/*.yml` | Lab CI/CD tuần 8 đến 10, tình huống lỗi 06 |

### 2.5 Checklist cho người review PR

- [ ] Lệnh trong PR đã được chạy lại trên Windows 11 với WSL2, làm việc trong filesystem của WSL.
- [ ] Image và công cụ có phiên bản được ghim, không dùng `latest` ở ví dụ cần tái lập.
- [ ] Không có secret, token, mật khẩu thật. Dùng placeholder và nhắc `.env` không commit.
- [ ] Mỗi lệnh quan trọng có "kết quả mong đợi" hợp lý, không bịa output.
- [ ] Không nhắc hay link tới `solutions/` trong trang dành cho học viên (link tới `mentors/walkthroughs/` từ hub tuần là ngoại lệ được phép).
- [ ] Link nội bộ trỏ tới file `.md` tồn tại, đã chạy `node scripts/check-lessons.mjs`.
- [ ] Văn phong rõ ràng, thuật ngữ kỹ thuật giữ tiếng Anh, lệnh và YAML để nguyên.

### 2.6 Checklist cập nhật khi đổi nội dung

Khi sửa một bài học, đi hết danh sách này trong cùng một PR:

- [ ] Bài học `labs/week-XX/session-NN.md`: còn dưới 350 dòng, mục "Làm lab" bắt đầu trước dòng khoảng 100, có đủ khối "Buổi này bạn làm gì".
- [ ] Hub tuần `labs/week-XX/README.md` khớp tên bài và link.
- [ ] Slide `slides/<deck>/session-NN.md` khớp khái niệm, không chép lệnh lab.
- [ ] Bài tập tuần `assignments/weekly/week-XX.md`: bảng nhiệm vụ trỏ đúng Phần của lab.
- [ ] Kịch bản `mentors/sessions/session-NN.md` khớp demo và thời gian mới.
- [ ] Barem `mentors/grading/week-XX.md` và đáp án `mentors/walkthroughs/week-XX.md` khớp bài tập, lệnh kiểm tra nhanh còn chạy đúng.
- [ ] Nếu đổi bước cài: sửa `resources/setup-guide.md` (nguồn duy nhất), các trang khác chỉ link.
- [ ] Nếu đổi thuật ngữ: cập nhật `resources/glossary.md`.
- [ ] Nếu đổi phiên bản công cụ, tên image, namespace hoặc tên cluster: rà toàn repo theo môi trường thống nhất ở mục 1.1.
- [ ] Chạy `node scripts/check-lessons.mjs` cho các file đã sửa.
- [ ] Ghi vào `CHANGELOG.md`.

## 3. Versioning curriculum

Curriculum có phiên bản theo dạng `vMAJOR.MINOR.PATCH`, ví dụ `v1.0.0`:

| Thành phần | Khi nào tăng | Ví dụ |
| --- | --- | --- |
| MAJOR | Đổi cấu trúc khóa: số tuần, thứ tự phase, công nghệ nền (ví dụ thay kind bằng công cụ khác) | v2.0.0 khi chuyển sang cấu trúc 20 tuần |
| MINOR | Thêm hoặc đổi lab, đổi phiên bản công cụ có ảnh hưởng đến lệnh, thêm tình huống lỗi | v1.1.0 khi nâng Node hoặc PostgreSQL major và sửa các lab liên quan |
| PATCH | Sửa lỗi, chính tả, link, làm rõ | v1.0.1 |

Quy tắc phát hành:

- Mỗi khóa (cohort) ghi rõ phiên bản dùng. Không đổi MAJOR hay MINOR giữa chừng khóa, trừ khi là sửa lỗi chặn.
- Phiên bản v1.0 được phát hành sau khi đạt [Điều kiện mở khóa](launch-checklist.md) và hoàn thành [pilot](pilot-plan.md).
- Phát hành bằng Git tag và GitHub Release:

```bash
git switch main
git pull
git tag -a v1.0.0 -m "Curriculum v1.0.0"
git push origin v1.0.0
```

- Học viên của khóa cũ có thể tham khảo tài liệu ở tag tương ứng.

## 4. Changelog

`CHANGELOG.md` ghi mọi thay đổi có ý nghĩa với học viên và mentor. Dùng các nhóm: Added, Changed, Fixed, Removed, Security. Mẫu:

```markdown
## v1.1.0 - 2027-02-10
### Changed
- Nâng phiên bản image cơ sở của starter project, cập nhật lab 05 và 14.
### Fixed
- Sửa kết quả mong đợi của lab 13.
### Added
- Thêm tình huống lỗi phụ cho buổi Kubernetes.
```

Quy tắc:

- Thay đổi vào mục `Unreleased` khi merge PR; chuyển sang mục có phiên bản khi phát hành.
- Mỗi dòng viết từ góc nhìn của người dùng tài liệu: thay đổi gì và ảnh hưởng gì.
- Ghi rõ phiên bản công cụ thay đổi (Docker, Kubernetes, kind, Node, PostgreSQL, actions).
- Không ghi chi tiết nhạy cảm về đáp án.

## 5. Repo private chứa đáp án (solutions)

Đáp án, bản "fixed" của tình huống lỗi và hướng dẫn xử lý chi tiết không được nằm trong repo công khai của giáo trình, vì học viên có thể đọc trước và làm mất mục đích của phần Break và L2.

### 5.1 Cấu trúc đề xuất

Tạo một repo private riêng (ví dụ `devops-course-solutions`) trong cùng organization, chỉ mentor có quyền đọc:

```text
devops-course-solutions/
  README.md
  labs/
    week-01/
    week-02/
  assignments/
  capstone/
    reference-solution/
  troubleshooting/
    scenario-01/
      broken/
      fixed/
      hints.md
      root-cause.md
  CHANGELOG.md
```

### 5.2 Quy tắc

- Chỉ Program Lead cấp quyền truy cập và rà danh sách quyền mỗi kỳ.
- Mỗi thư mục lab có cùng cấu trúc với repo giáo trình để dễ đối chiếu.
- Ghi phiên bản curriculum mà đáp án khớp (ví dụ trong `README.md` của repo private).
- Khi sửa lab công khai, cập nhật đáp án tương ứng trong cùng đợt.
- Không copy đáp án vào Issue, Discussions công khai, hay PR của học viên. Khi phản hồi, chỉ hướng dẫn cách tìm.
- Nếu đáp án từng bị đẩy nhầm lên repo công khai: coi như đã lộ, thay đổi đề bài hoặc dữ liệu của bài đó, và xóa khỏi lịch sử theo hướng dẫn của GitHub (tìm "removing sensitive data from a repository" trong tài liệu GitHub). Báo Program Lead.
- Trang dành cho học viên không nhắc đến thư mục `solutions/` hay repo đáp án. Ngoại lệ có chủ đích: walkthroughs (`mentors/walkthroughs/`) nằm trong website và hub tuần có mục "Đối chiếu đáp án (mở sau khi nộp bài)"; chúng không chứa mã nguồn bản tham chiếu capstone. Phần chuẩn bị Break cho mentor chỉ mô tả quy trình, không chứa nguyên nhân gốc.

### 5.3 Quy trình đồng bộ

1. Sau mỗi thay đổi lab ở repo công khai, người sửa mở PR tương ứng ở repo private.
2. Trước mỗi khóa, mentor chạy kiểm tra: mỗi lab bắt buộc và mỗi tình huống lỗi có đáp án khớp với phiên bản hiện hành.
3. Sau khóa học, thêm đáp án mới hoặc cách giải thay thế mà học viên sáng tạo ra (với sự đồng ý của họ).

## 6. Cập nhật phiên bản công cụ mỗi kỳ

Công cụ thay đổi liên tục. Trước mỗi khóa (khoảng 4 tuần trước khai giảng) thực hiện một lượt rà soát phiên bản.

### 6.1 Danh sách cần rà

| Thành phần | Nơi ghi phiên bản | Cần kiểm tra |
| --- | --- | --- |
| Node.js (image `node:22-alpine`) | `starter-project/backend/Dockerfile`, `ci.yml` | Còn trong giai đoạn hỗ trợ (LTS) không |
| Nginx (`nginx:1.27-alpine`) | `starter-project/frontend/Dockerfile` | Có phiên bản ổn định mới hơn không |
| PostgreSQL (`postgres:17-alpine`) | `compose.yaml`, `k8s/postgres.yaml` | Còn hỗ trợ không, thay đổi tương thích dữ liệu |
| Docker Desktop, Compose v2 | `resources/setup-guide.md` | Giao diện và đường dẫn cài đặt thay đổi |
| Kubernetes, kind, kubectl | Lab Kubernetes, `k8s/kind-config.yaml` | Phiên bản kind hỗ trợ, tag `kindest/node` |
| GitHub Actions | `.github/workflows/*.yml` | `actions/checkout`, `actions/setup-node`, `docker/build-push-action` |
| Dependency npm | `starter-project/backend/package.json` | Cảnh báo bảo mật, bản vá |
| VitePress và dependency của site | `package.json` | Cập nhật và build lại site |

### 6.2 Quy trình

1. Mở Issue "Tool refresh kỳ XX" kèm bảng trên.
2. Với mỗi thành phần, kiểm tra tài liệu chính thức và ghi chú phát hành. Không cập nhật theo trí nhớ.
3. Nâng phiên bản trên nhánh riêng, ưu tiên bản ổn định. Chỉ nâng MAJOR khi có lý do rõ ràng.
4. Chạy lại toàn bộ chuỗi kiểm tra trên máy sạch:

```bash
cd starter-project/backend
npm ci
npm test
cd ..
cp .env.example .env
docker compose up -d --build
docker compose ps
docker compose down
```

Kết quả mong đợi: test của backend đạt, ba service lên chạy, và dọn dẹp xong không còn container thừa. Sau đó tạo cluster kind, nạp image, áp dụng `k8s/` và kiểm tra Pod Ready, đúng như [điều kiện mở khóa](launch-checklist.md).

5. Sửa các lab, kết quả mong đợi và ảnh chụp lệch phiên bản.
6. Ghi vào CHANGELOG và tăng phiên bản theo mục 3.
7. Cập nhật đáp án trong repo private.

### 6.3 Quy tắc ghim phiên bản

- Image trong ví dụ và manifest luôn có tag cụ thể, không dùng `latest`.
- Action trong workflow dùng phiên bản major cố định (ví dụ `actions/checkout@v4`) hoặc commit SHA với mức bảo mật cao hơn.
- Công cụ cài trên máy học viên: ghi phiên bản đã kiểm thử trong Setup Guide, nói rõ có thể dùng bản mới hơn nhưng lệnh chỉ được kiểm chứng ở phiên bản đã ghi.

## 7. Kiểm tra link và định dạng định kỳ

Dùng script của repo để phát hiện lỗi định dạng và link nội bộ hỏng:

```bash
node scripts/check-lessons.mjs
```

Script chỉ đọc, không sửa file. Có thể truyền thư mục hoặc file cụ thể:

```bash
node scripts/check-lessons.mjs mentors labs/week-01
```

Script bắt: thẻ giống HTML hoặc Vue ngoài code, `{{ }}` ngoài code, link tương đối tới file `.md` không tồn tại, thiếu tiêu đề `# `, code fence chưa đóng, và bài lab thiếu dòng tóm tắt.

Lịch kiểm tra:

| Tần suất | Việc | Người làm |
| --- | --- | --- |
| Mỗi PR | Chạy script cho file đã sửa | Tác giả, reviewer xác nhận |
| Hằng tuần trong khóa | Chạy toàn repo, mở Issue nếu có lỗi | Lab Assistant |
| Mỗi kỳ, trước khai giảng | Chạy toàn repo, build site, rà link ngoài | Technical Mentor |

Script không kiểm tra link ra ngoài (URL `https`). Mỗi kỳ, rà thủ công các link tài liệu chính thức quan trọng (Docker, Kubernetes, kind, GitHub, Microsoft) bằng cách mở từng link hoặc dùng công cụ kiểm tra link ngoài mà nhóm chọn. Link hỏng ghi vào Issue và thay bằng nguồn chính thức mới.

Gợi ý tự động hóa: thêm một job trong `.github/workflows/ci.yml` chạy `node scripts/check-lessons.mjs` trên mỗi PR (cần Node.js, không cần cài dependency). Trước khi thêm, kiểm tra workflow hiện có và thảo luận với Technical Mentor.

## 8. Quản lý Issue, nhãn và vòng đời góp ý

| Nhãn | Ý nghĩa |
| --- | --- |
| `doc-bug` | Lỗi, thiếu hoặc mơ hồ trong tài liệu |
| `starter` | Liên quan đến starter project |
| `env-issue` | Lỗi môi trường, không phải lỗi học viên |
| `enhancement` | Đề xuất cải tiến |
| `pilot` | Phát hiện trong pilot |
| `blocker` | Chặn học viên tiếp tục |
| `good-first-issue` | Việc nhỏ cho thành viên mới đóng góp |

Vòng đời: tiếp nhận, phân loại (trong 3 ngày), gán người, sửa qua PR, xác nhận bởi người báo hoặc reviewer, đóng. Lỗi `blocker` được xử lý trong 24 giờ trong thời gian khóa chạy.

Học viên và cựu học viên được khuyến khích đóng góp: sửa lỗi, bổ sung tình huống lỗi, dịch hoặc cải thiện ví dụ. Ghi nhận đóng góp trong CHANGELOG hoặc danh sách người đóng góp.

## 9. Chuyển giao giữa các thế hệ

- [ ] Program Lead mới có quyền admin trên repo giáo trình và repo private.
- [ ] Danh sách chủ sở hữu nội dung (mục 1) đã cập nhật.
- [ ] Các Issue mở được rà, đóng hoặc chuyển cho người mới.
- [ ] Bản phát hành mới nhất đã được tag và có CHANGELOG đầy đủ.
- [ ] Tool refresh của kỳ tới đã có Issue và người phụ trách.
- [ ] Bảo đảm CI xanh, site tài liệu build được và triển khai được.
- [ ] Danh sách mentor và lịch đào tạo mentor mới (xem [Sổ tay mục 17](handbook.md)) đã bàn giao.
