# Điều kiện mở khóa

> **Tóm tắt:** Checklist có thể tick để xác nhận khóa DevOps sẵn sàng khai giảng. Điều kiện cốt lõi: một mentor clone repo và chạy toàn bộ lab từ máy mới, không cần can thiệp ngoài hướng dẫn.

Điều kiện mở khóa theo [ROADMAP](../ROADMAP.md): một mentor clone repo và chạy toàn bộ lab từ máy mới, không cần can thiệp ngoài hướng dẫn. Trang này chia điều kiện đó thành các mục kiểm tra cụ thể theo từng giai đoạn. Cách dùng: sao chép trang này vào một Issue "Launch readiness", mentor chạy kiểm tra tick từng mục và ghi bằng chứng (link Issue, đoạn log).

Quy tắc: một mục chỉ được tick khi có người khác ngoài tác giả đã xác nhận. Mục nào chưa tick là lý do để chưa mở khóa.

## Giai đoạn 0: Điều kiện nền

- [ ] Có Program Lead, tối thiểu 2 Technical Mentor và 2 Lab Assistant đã qua [đào tạo](handbook.md).
- [ ] Máy "mới" để kiểm tra: một máy Windows 11 hoặc máy ảo chưa cài môi trường phát triển, ghi lại cấu hình (RAM, CPU, ổ đĩa).
- [ ] Repo giáo trình truy cập được, nhánh chính ổn định, CI xanh.
- [ ] Repo đáp án private đã tạo và chỉ mentor có quyền (xem [Quản lý repo giáo trình](repo-governance.md)).
- [ ] Không có file bí mật, `.env` hay token trong lịch sử Git của repo giáo trình.

## Giai đoạn 1: Môi trường (Tuần 1 đến 3)

- [ ] Clone repo và mở site tài liệu từ máy mới.
- [ ] Cài WSL2 và Ubuntu theo [Setup Guide](../resources/setup-guide.md), không cần bước nào ngoài hướng dẫn.
- [ ] Các lệnh kiểm tra môi trường (`git --version`, `node --version`) chạy đúng.
- [ ] Lab tuần 1 (SDLC, deployment workflow, cài WSL2) hoàn thành.
- [ ] Lab Linux Essentials (tuần 2) hoàn thành, mọi lệnh chạy được trong WSL.
- [ ] Lab Networking và Git Collaboration (tuần 3) hoàn thành, gồm tạo PR và giải conflict trên GitHub thật.
- [ ] Mọi assignment tuần 1 đến 3 có đề rõ ràng và rubric.

## Giai đoạn 2: Docker (Tuần 4 đến 7)

- [ ] Cài Docker Desktop với WSL integration, `docker version` và `docker compose version` chạy đúng.
- [ ] Lab Docker Basics (run, inspect, logs, exec) hoàn thành.
- [ ] Dockerfile của backend build được, image chạy, `GET /health` trả kết quả đúng.
- [ ] Lab network và volume hoàn thành; kiểm thử persistence đúng như tài liệu.
- [ ] `docker compose up -d --build` trong `starter-project` chạy đủ ba service từ máy mới, frontend mở được qua `WEB_PORT`.
- [ ] Backup và restore database theo lab (L2) chạy được.
- [ ] Năm tình huống lỗi Docker (01 đến 05) có bản "broken", bản "fixed" và ba mức gợi ý trong repo private, và đã được một mentor khác giải thử.
- [ ] Kiểm tra trên máy 8 GB: toàn bộ lab Docker chạy được.

## Giai đoạn 3: CI/CD (Tuần 8 đến 10)

- [ ] Workflow `.github/workflows/ci.yml` chạy xanh trên repo thật.
- [ ] Workflow `publish.yml` đẩy image lên GHCR được từ tài khoản GitHub cá nhân của người kiểm tra.
- [ ] Lab tuần 8, 9, 10 hoàn thành, gồm phần phân quyền (`permissions`) và pipeline security.
- [ ] Học viên có cách kiểm tra khi Actions fail (tình huống lỗi 06) và có bản "broken" sẵn sàng.
- [ ] Phiên bản action đã ghim (ví dụ `actions/checkout@v4`), không dùng tham chiếu trôi nổi.
- [ ] Không tài liệu nào yêu cầu lưu token thật vào repo; có hướng dẫn dùng Secrets và `GITHUB_TOKEN`.

## Giai đoạn 4: Kubernetes (Tuần 11 đến 14)

- [ ] Cài `kubectl` và `kind` từ máy mới theo hướng dẫn chính thức, có phiên bản được ghim trong tài liệu.
- [ ] Tạo cluster bằng `starter-project/k8s/kind-config.yaml` thành công.
- [ ] Build image `club-api:1.0.0` và `club-web:1.0.0`, nạp vào kind bằng `kind load docker-image`.
- [ ] Áp dụng toàn bộ manifest trong `starter-project/k8s/` (namespace, configmap, secret từ `secret.example.yaml`, postgres, backend, frontend, ingress) và các Pod đạt trạng thái Ready.
- [ ] Truy cập ứng dụng qua Ingress với host `club.localhost`, API trả dữ liệu từ database.
- [ ] Lab kubectl, Service, DNS, ConfigMap, Secret, probe, limits, PVC, Ingress hoàn thành.
- [ ] Bốn tình huống lỗi Kubernetes (07 đến 10) có bản "broken" và bản "fixed" đã kiểm thử trên cluster kind thật.
- [ ] Kiểm tra trên máy 8 GB: cluster kind một node chạy được theo hướng dẫn máy yếu.
- [ ] Đây là mục từng được ghi "manifests chưa chạy thử trên kind" trong ROADMAP: xác nhận đã được chạy thử trên kind thật và đã cập nhật ROADMAP.

## Giai đoạn 5: Capstone và vận hành khóa

- [ ] [Capstone](../assignments/capstone/README.md) có đề, các mốc, rubric và tiêu chí chấm theo [cách đánh giá](../curriculum/assessment.md).
- [ ] Một mentor tự làm capstone từ `starter-project` (thêm POST, PUT, DELETE cho `/api/members`, test, CI, Compose, Kubernetes) trong thời gian hợp lý cho nhóm 3 đến 4 người.
- [ ] Mẫu báo cáo, demo và technical defense sẵn sàng.
- [ ] GitHub Projects, Milestones, nhãn và Discussions đã thiết lập theo [Sổ tay mục 12](handbook.md).
- [ ] Templates `lab-template.md`, `assignment-template.md`, `project-template.md` dùng được.
- [ ] Lịch office hour hằng tuần đã xác định.

## Giai đoạn 6: Pilot và chất lượng

- [ ] Hoàn thành [pilot](pilot-plan.md) và đạt tiêu chí go.
- [ ] Mọi Issue `pilot` mức blocker đã đóng.
- [ ] `node scripts/check-lessons.mjs` chạy toàn repo báo OK.
- [ ] Build site tài liệu thành công và triển khai trên GitHub Pages.
- [ ] Rà soát độc lập toàn bộ lệnh: mọi lệnh có "kết quả mong đợi" cho các lệnh quan trọng.
- [ ] Không còn nhắc đến thư mục `solutions/` trong trang dành cho học viên.
- [ ] `CHANGELOG.md` ghi phiên bản v1.0 và `CONTRIBUTING.md` cập nhật.

## Giai đoạn 7: Sẵn sàng khai giảng

- [ ] Phòng học, mạng và image pre-pull theo [Runbook](session-runbook.md) đã kiểm tra tại phòng thật.
- [ ] Danh sách học viên, nhóm, người phụ trách, máy cấu hình thấp đã rà.
- [ ] Thông báo khai giảng, yêu cầu chuẩn bị trước (tài khoản GitHub, bật ảo hóa, cài WSL2) đã gửi.
- [ ] Phương án dự phòng mạng, máy, người trực đã chuẩn bị.
- [ ] Program Lead ký xác nhận Go và ghi vào Issue "Launch readiness".

## Bài kiểm tra chấp nhận cuối cùng

Đây là bài kiểm tra quyết định. Thực hiện bởi một mentor chưa từng làm lab đó, trên máy mới, có người quan sát và ghi giờ.

- [ ] Clone repo giáo trình về máy mới.
- [ ] Làm lần lượt tất cả lab bắt buộc của 16 tuần, chỉ theo hướng dẫn trong repo.
- [ ] Không có bước nào phải hỏi người khác hoặc tra cứu ngoài tài liệu được dẫn link.
- [ ] Mọi chỗ bị kẹt được ghi thành Issue, sửa, và chạy lại đến khi không còn kẹt.
- [ ] Tổng hợp thời gian thực tế và so sánh với [lịch học](../curriculum/schedule.md).

Chỉ khi toàn bộ mục trên được tick, điều kiện mở khóa được coi là đạt.
