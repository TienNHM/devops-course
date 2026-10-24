# Lộ trình 16 tuần

Khóa dành cho sinh viên và người đi làm mới muốn đưa ứng dụng web từ máy mình lên chạy thật, chưa cần biết DevOps trước. Cuối khóa bạn tự dựng được một hệ thống gồm giao diện web, API và cơ sở dữ liệu, có quy trình tự kiểm tra, đóng gói và triển khai, rồi bảo vệ được cách làm của mình. Khóa kéo dài 16 tuần, 32 buổi, mỗi buổi 120 phút (tổng 64 giờ) cộng khoảng 2–3 giờ tự học mỗi tuần.

> **Tóm tắt:** 16 tuần, 32 buổi, 5 giai đoạn: nền tảng Linux và Git, Docker, CI/CD, Kubernetes, dự án cuối khóa. Trang này gộp lịch học và giáo án; chưa bắt đầu thì đọc [Bắt đầu từ đây](getting-started.md).

Triết lý: **Learn, Build, Break, Debug, Deploy, Explain.** Học trên máy của mình (local-first), mỗi buổi đều có phần thực hành.

## Bốn điều cần biết trước

- Mỗi buổi 120 phút gồm 15 phút ôn tập, 30 phút kiến thức, 60 phút thực hành, 15 phút review. Khi tự học, bạn đi theo thứ tự đọc, làm lab, gặp lỗi, tự kiểm tra, nộp bài.
- Mỗi lab có hai mức: L1 (làm theo hướng dẫn) và L2 (tự thiết kế, tự giải thích). Xem [Chuẩn đầu ra](learning-outcomes.md).
- Mỗi tuần có một buổi office hour ngắn để giải đáp lỗi bạn không tự xử lý được.
- Buổi 19 chạy hoàn toàn trên máy bạn (local-only): không mở máy học viên ra Internet. Máy chạy trên GitHub chỉ build và publish image; việc triển khai vào máy local làm bằng script hoặc self-hosted runner nội bộ.

## Năm giai đoạn

**Giai đoạn 1 – Nền tảng (tuần 1–3, 6 buổi).** Bạn làm quen với Linux và terminal, hiểu máy tính nói chuyện với nhau qua mạng thế nào, và dùng Git để lưu lịch sử, làm việc nhóm. Đây là bộ đồ nghề cho mọi giai đoạn sau. Từ khóa: [terminal](../resources/glossary.md), [Git](../resources/glossary.md), [DNS](../resources/glossary.md).

**Giai đoạn 2 – Docker (tuần 4–7, 8 buổi).** Bạn đóng gói ứng dụng vào container để chạy giống nhau trên mọi máy, rồi ghép nhiều container (web, API, cơ sở dữ liệu) thành một hệ thống bằng Docker Compose. Từ khóa: [container](../resources/glossary.md), [image](../resources/glossary.md), [Compose](../resources/glossary.md).

**Giai đoạn 3 – CI/CD (tuần 8–10, 6 buổi).** Bạn để GitHub tự chạy kiểm thử, đóng gói image và đưa lên kho chứa mỗi khi bạn đẩy mã, kèm các thói quen giữ pipeline an toàn. Từ khóa: [CI/CD](../resources/glossary.md), [pipeline](../resources/glossary.md), [registry](../resources/glossary.md).

**Giai đoạn 4 – Kubernetes (tuần 11–14, 8 buổi).** Bạn chạy ứng dụng trên một cụm máy giả lập ngay trên laptop, học cách cấu hình, kiểm tra sức khỏe, lưu dữ liệu, mở ra bên ngoài và sửa lỗi. Từ khóa: [Kubernetes](../resources/glossary.md), [Pod](../resources/glossary.md), [kubectl](../resources/glossary.md).

**Giai đoạn 5 – Dự án cuối khóa (tuần 15–16, 4 buổi).** Bạn làm việc nhóm để ghép toàn bộ những gì đã học thành một sản phẩm, kiểm thử, cố ý gây lỗi để luyện sửa, rồi demo và bảo vệ. Xem [Capstone](../assignments/capstone/README.md).

Muốn đi đường tắt để đưa web lên mạng mà chưa học Kubernetes? Xem nhánh riêng [Vibe Deploy](../vibe/index.md).

## Bảng 16 tuần

| Tuần | Giai đoạn | Chủ đề | Kết quả bạn làm được | Hub tuần | Bài tập |
| --- | --- | --- | --- | --- | --- |
| 01 | 1 | DevOps Workflow và môi trường học | Vẽ được quy trình đưa ứng dụng lên server; có WSL2 Ubuntu chạy được | [Tuần 01](../labs/week-01/README.md) | [Bài tập](../assignments/weekly/week-01.md) |
| 02 | 1 | Linux Essentials | Quản lý file, process, user, phân quyền bằng dòng lệnh | [Tuần 02](../labs/week-02/README.md) | [Bài tập](../assignments/weekly/week-02.md) |
| 03 | 1 | Networking và Git | Kiểm tra kết nối mạng; làm việc với branch, Pull Request, giải quyết conflict | [Tuần 03](../labs/week-03/README.md) | [Bài tập](../assignments/weekly/week-03.md) |
| 04 | 2 | Docker Basics | Chạy, xem, gỡ lỗi một container | [Tuần 04](../labs/week-04/README.md) | [Bài tập](../assignments/weekly/week-04.md) |
| 05 | 2 | Dockerfile và tối ưu image | Đóng gói API thành image gọn nhẹ | [Tuần 05](../labs/week-05/README.md) | [Bài tập](../assignments/weekly/week-05.md) |
| 06 | 2 | Mạng và lưu trữ trong Docker | Cho container nói chuyện với nhau; giữ dữ liệu khi container bị tạo lại | [Tuần 06](../labs/week-06/README.md) | [Bài tập](../assignments/weekly/week-06.md) |
| 07 | 2 | Docker Compose | Chạy web, API và Postgres bằng một lệnh, có kiểm tra sức khỏe | [Tuần 07](../labs/week-07/README.md) | [Bài tập](../assignments/weekly/week-07.md) |
| 08 | 3 | CI/CD và GitHub Actions | Workflow tự chạy kiểm thử khi đẩy mã | [Tuần 08](../labs/week-08/README.md) | [Bài tập](../assignments/weekly/week-08.md) |
| 09 | 3 | Kiểm thử tự động và Docker CI | Chặn mã lỗi trước khi merge; tự publish image lên GHCR | [Tuần 09](../labs/week-09/README.md) | [Bài tập](../assignments/weekly/week-09.md) |
| 10 | 3 | CD và bảo mật pipeline | Triển khai local bằng script; kiểm tra quyền của workflow | [Tuần 10](../labs/week-10/README.md) | [Bài tập](../assignments/weekly/week-10.md) |
| 11 | 4 | Kubernetes cơ bản | Tạo cụm kind `club`, triển khai Deployment đầu tiên | [Tuần 11](../labs/week-11/README.md) | [Bài tập](../assignments/weekly/week-11.md) |
| 12 | 4 | kubectl và Service | Quản lý workload; kết nối web với API qua Service và DNS | [Tuần 12](../labs/week-12/README.md) | [Bài tập](../assignments/weekly/week-12.md) |
| 13 | 4 | Cấu hình, tài nguyên, sức khỏe | Tách cấu hình khỏi image; đặt giới hạn và probe | [Tuần 13](../labs/week-13/README.md) | [Bài tập](../assignments/weekly/week-13.md) |
| 14 | 4 | Lưu trữ, Ingress, vận hành | Chạy Postgres với PVC, mở Ingress, tự sửa workload lỗi | [Tuần 14](../labs/week-14/README.md) | [Bài tập](../assignments/weekly/week-14.md) |
| 15 | 5 | Capstone: lập kế hoạch và triển khai | Hoàn thiện ứng dụng và quy trình tự động của nhóm | [Tuần 15](../labs/week-15/README.md) | [Bài tập](../assignments/weekly/week-15.md) |
| 16 | 5 | Capstone: kiểm thử và bảo vệ | Demo, báo cáo, xử lý sự cố được giao | [Tuần 16](../labs/week-16/README.md) | [Bài tập](../assignments/weekly/week-16.md) |

Thử thách nâng cao (L2) của từng tuần nằm ở cuối các bài lab, làm ở nhà nếu bạn muốn đi sâu hơn. Danh sách đầy đủ ở ngay bên dưới.

::: details Thử thách nâng cao (L2) theo tuần

| Tuần | Thử thách L2 |
| --- | --- |
| 01 | Đề xuất DevOps workflow cho dự án CLB |
| 02 | Viết shell script kiểm tra tài nguyên |
| 03 | Thiết lập branch protection |
| 04 | Debug container không khởi động |
| 05 | Multi-stage build, non-root |
| 06 | Kiểm thử persistence và network isolation |
| 07 | Backup database và restore |
| 08 | Tách jobs và artifacts |
| 09 | Cache và integration test với service container |
| 10 | Image scanning và SBOM |
| 11 | Cluster nhiều node, rolling update |
| 12 | Kiểm thử service discovery |
| 13 | Mô phỏng OOMKilled và probe fail |
| 14 | Phục hồi workload bị lỗi |
| 15 | CI/CD và deployment automation |
| 16 | Failure injection và recovery |

:::

## Tiêu chí hoàn thành khóa

Tóm tắt: điểm Final Project tối thiểu 60/100, hoàn thành ít nhất 80% bài lab bắt buộc, và điểm Technical Assessment tối thiểu 50/100. Trọng số, xếp loại, nộp trễ và khiếu nại xem [Đánh giá](assessment.md). Hai bài kiểm tra xem [Technical Assessment](technical-assessment.md); thang chấm dự án cuối khóa xem [Rubric chấm Capstone](capstone-rubric.md).

## Chi tiết 32 buổi

::: details Mở bảng chi tiết từng buổi (nội dung và lab của 32 buổi)

### Giai đoạn 1 – Nền tảng

Tuần 1–3 · 6 buổi · 12 giờ · Linux, Terminal, Networking, Git, GitHub

| Buổi | Chủ đề | Nội dung chính | Lab thực hành |
| --- | --- | --- | --- |
| [01](../labs/week-01/session-01.md) | DevOps Introduction | SDLC, DevOps culture, Dev vs Ops, CI/CD, Infrastructure as Code, deployment lifecycle | Vẽ quy trình triển khai một ứng dụng từ máy lập trình đến server |
| [02](../labs/week-01/session-02.md) | Development Environment | Windows, WSL2, Linux, Terminal, Shell, package manager, filesystem | Cài WSL2 Ubuntu, thiết lập môi trường thực hành |
| [03](../labs/week-02/session-03.md) | Linux CLI | `pwd`, `ls`, `cd`, `find`, `grep`, `cat`, `less`, `head`, `tail`, piping | Tạo cấu trúc thư mục, tìm kiếm file, phân tích log |
| [04](../labs/week-02/session-04.md) | Linux Administration | User, Group, chmod, chown, process, systemctl, environment variables | Tạo user, phân quyền thư mục, quản lý process |
| [05](../labs/week-03/session-05.md) | Networking Fundamentals | IP, subnet, DNS, TCP/UDP, port, HTTP/HTTPS, localhost, loopback | Dùng `ping`, `curl`, `nslookup`, `ss` kiểm tra kết nối |
| [06](../labs/week-03/session-06.md) | Git & GitHub Workflow | Repository, commit, branch, merge, PR, conflict, code review, `.gitignore` | Tạo repository nhóm, thực hành feature branch và Pull Request |

**Sản phẩm bàn giao**

- Repository cá nhân
- Linux CLI Cheat Sheet
- Sơ đồ Git workflow
- Báo cáo thực hành networking
- Pull Request đầu tiên được review

### Giai đoạn 2 – Docker

Tuần 4–7 · 8 buổi · 16 giờ · Docker, Dockerfile, Image, Volume, Network, Compose

| Buổi | Chủ đề | Nội dung chính | Lab thực hành |
| --- | --- | --- | --- |
| [07](../labs/week-04/session-07.md) | Container Fundamentals | VM vs Container, Docker Architecture, Docker Engine, Image, Container, Registry | Cài Docker Desktop, chạy container Nginx |
| [08](../labs/week-04/session-08.md) | Docker CLI | `docker run`, `ps`, `exec`, `inspect`, `logs`, `stop`, `rm`, `pull`, `push` | Chạy, kiểm tra và debug một container |
| [09](../labs/week-05/session-09.md) | Dockerfile | FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD, ENTRYPOINT, build context | Viết Dockerfile cho Node.js API |
| [10](../labs/week-05/session-10.md) | Image Optimization | Image layers, caching, `.dockerignore`, multi-stage build, image tagging | Tối ưu Docker Image và so sánh kích thước |
| [11](../labs/week-06/session-11.md) | Container Networking | Bridge network, port mapping, container DNS, network isolation | Cho hai container giao tiếp qua Docker Network |
| [12](../labs/week-06/session-12.md) | Persistent Storage | Volume, bind mount, tmpfs, database persistence, backup | Chạy PostgreSQL và đảm bảo dữ liệu không mất khi recreate container |
| [13](../labs/week-07/session-13.md) | Docker Compose | Compose YAML, services, depends_on, environment, networks, volumes | Khởi chạy Frontend + API + PostgreSQL |
| [14](../labs/week-07/session-14.md) | Production-minded Compose | Healthcheck, restart, resource limits, secrets, logging, troubleshooting | Hoàn thiện hệ thống Compose, xử lý lỗi database chưa sẵn sàng |

**Sản phẩm bàn giao**

- Dockerfile cho ứng dụng
- .dockerignore
- compose.yaml
- PostgreSQL volume persistence
- Tài liệu giải thích kiến trúc container

### Giai đoạn 3 – CI/CD

Tuần 8–10 · 6 buổi · 12 giờ · GitHub Actions, GHCR, automated testing, image publishing, pipeline security

| Buổi | Chủ đề | Nội dung chính | Lab thực hành |
| --- | --- | --- | --- |
| [15](../labs/week-08/session-15.md) | CI/CD Fundamentals | Continuous Integration, Delivery, Deployment, Pipeline, Artifact, Runner, Trigger | Vẽ CI/CD pipeline cho ứng dụng |
| [16](../labs/week-08/session-16.md) | GitHub Actions Basics | Workflow, YAML, Events, Jobs, Steps, Runner, Marketplace Actions | Viết workflow tự động chạy khi push code |
| [17](../labs/week-09/session-17.md) | Automated Testing | Unit Test, Integration Test, Test Report, Build Validation | Thiết lập test trước khi merge |
| [18](../labs/week-09/session-18.md) | Docker CI Pipeline | Docker Build, Buildx, cache, tagging, GHCR, authentication | Tự động build và publish image lên GHCR |
| [19](../labs/week-10/session-19.md) | CD & Deployment Strategies | Continuous Deployment, environment, secrets, approval, rollback, deployment strategy | Viết workflow/script deploy image lên môi trường local |
| [20](../labs/week-10/session-20.md) | Pipeline Security | Least Privilege, permissions, secret management, dependency scanning, SBOM, image scanning | Kiểm tra workflow permissions và quét image |

**Sản phẩm bàn giao**

- .github/workflows/ci.yml
- .github/workflows/publish.yml
- Docker image trên GHCR
- Test report
- Tài liệu giải thích pipeline

### Giai đoạn 4 – Kubernetes

Tuần 11–14 · 8 buổi · 16 giờ · Kubernetes, kubectl, Workloads, Networking, Storage, Troubleshooting

| Buổi | Chủ đề | Nội dung chính | Lab thực hành |
| --- | --- | --- | --- |
| [21](../labs/week-11/session-21.md) | Kubernetes Introduction | Container orchestration, architecture, Control Plane, Worker Node, API Server, Scheduler, etcd, kubelet | Cài kind và tạo cluster local |
| [22](../labs/week-11/session-22.md) | Pods & Deployments | Pod lifecycle, YAML manifest, ReplicaSet, Deployment, labels, selectors | Deploy API lên Kubernetes |
| [23](../labs/week-12/session-23.md) | kubectl Fundamentals | Context, namespace, get, describe, apply, delete, logs, exec, port-forward | Quản lý workload bằng kubectl |
| [24](../labs/week-12/session-24.md) | Kubernetes Services | ClusterIP, NodePort, LoadBalancer, Service Discovery, DNS | Kết nối Frontend với Backend thông qua Service |
| [25](../labs/week-13/session-25.md) | Configuration Management | ConfigMap, Secret, environment variables, mounted configuration | Tách cấu hình khỏi Docker Image |
| [26](../labs/week-13/session-26.md) | Resource & Health | Requests, Limits, Liveness, Readiness, Startup Probe, QoS | Mô phỏng OOMKilled và lỗi healthcheck |
| [27](../labs/week-14/session-27.md) | Storage & Ingress | PV, PVC, StorageClass, Ingress Controller, HTTP routing | Deploy PostgreSQL với PVC và cấu hình ingress |
| [28](../labs/week-14/session-28.md) | Kubernetes Operations | Rollout, rollback, scale, events, troubleshooting, CrashLoopBackOff, ImagePullBackOff | Phá lỗi một cluster mẫu và khôi phục hệ thống |

**Sản phẩm bàn giao**

- Kubernetes Deployment manifests
- Service manifests
- ConfigMap và Secret
- PVC cho database
- Ingress
- Troubleshooting report

### Giai đoạn 5 – Dự án cuối khóa

Tuần 15–16 · 4 buổi · 8 giờ · Hoàn thiện sản phẩm, kiểm thử, trình bày, đánh giá

| Buổi | Chủ đề | Nội dung chính | Lab thực hành |
| --- | --- | --- | --- |
| [29](../labs/week-15/session-29.md) | Architecture & Planning | Requirement, architecture, container design, CI/CD design, task breakdown | Thiết kế kiến trúc và chia task cho nhóm |
| [30](../labs/week-15/session-30.md) | Implementation | Docker, Compose, Kubernetes, GitHub Actions, testing | Hoàn thiện dự án |
| [31](../labs/week-16/session-31.md) | Testing & Troubleshooting | Deployment test, failure injection, logs, security checklist, performance basics | Kiểm thử và khắc phục các lỗi được giao |
| [32](../labs/week-16/session-32.md) | Final Demo & Review | Product demo, pipeline walkthrough, architecture presentation, lessons learned | Trình bày sản phẩm và bảo vệ kỹ thuật |

**Sản phẩm bàn giao**

- Repository nhóm hoàn chỉnh
- README + Architecture Diagram
- Demo + technical defense

:::
