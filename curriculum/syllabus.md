# Syllabus – From Code to Deployment

16 tuần · 32 buổi · 2 buổi/tuần · 120 phút/buổi · 64 giờ · Local-first · Hands-on

Triết lý: **Learn → Build → Break → Debug → Deploy → Explain.**

Quy ước mỗi buổi: 15' ôn tập, 30' kiến thức, 60' thực hành, 15' review.
Mỗi bài lab có hai mức: **L1 – Foundation** và **L2 – Engineering** (xem [learning-outcomes.md](learning-outcomes.md)).

Lưu ý buổi 19: khóa học local-only, không expose máy học viên ra Internet. Hosted runner chỉ build/publish image; triển khai vào máy local bằng script hoặc self-hosted runner nội bộ.

## Phase 1 – Engineering Foundation

Tuần 1–3 · 6 buổi · 12 giờ · Linux, Terminal, Networking, Git, GitHub

| Buổi | Chủ đề | Nội dung | Hands-on Lab |
| --- | --- | --- | --- |
| 01 | DevOps Introduction | SDLC, DevOps culture, Dev vs Ops, CI/CD, Infrastructure as Code, deployment lifecycle | Vẽ quy trình triển khai một ứng dụng từ máy lập trình đến server |
| 02 | Development Environment | Windows, WSL2, Linux, Terminal, Shell, package manager, filesystem | Cài WSL2 Ubuntu, thiết lập môi trường thực hành |
| 03 | Linux CLI | `pwd`, `ls`, `cd`, `find`, `grep`, `cat`, `less`, `head`, `tail`, piping | Tạo cấu trúc thư mục, tìm kiếm file, phân tích log |
| 04 | Linux Administration | User, Group, chmod, chown, process, systemctl, environment variables | Tạo user, phân quyền thư mục, quản lý process |
| 05 | Networking Fundamentals | IP, subnet, DNS, TCP/UDP, port, HTTP/HTTPS, localhost, loopback | Dùng `ping`, `curl`, `nslookup`, `ss` kiểm tra kết nối |
| 06 | Git & GitHub Workflow | Repository, commit, branch, merge, PR, conflict, code review, `.gitignore` | Tạo repository nhóm, thực hành feature branch và Pull Request |

**Deliverables**

- Repository cá nhân
- Linux CLI Cheat Sheet
- Sơ đồ Git workflow
- Báo cáo thực hành networking
- Pull Request đầu tiên được review


## Phase 2 – Docker & Containerization

Tuần 4–7 · 8 buổi · 16 giờ · Docker, Dockerfile, Image, Volume, Network, Compose

| Buổi | Chủ đề | Nội dung | Hands-on Lab |
| --- | --- | --- | --- |
| 07 | Container Fundamentals | VM vs Container, Docker Architecture, Docker Engine, Image, Container, Registry | Cài Docker Desktop, chạy container Nginx |
| 08 | Docker CLI | `docker run`, `ps`, `exec`, `inspect`, `logs`, `stop`, `rm`, `pull`, `push` | Chạy, kiểm tra và debug một container |
| 09 | Dockerfile | FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD, ENTRYPOINT, build context | Viết Dockerfile cho Node.js API |
| 10 | Image Optimization | Image layers, caching, `.dockerignore`, multi-stage build, image tagging | Tối ưu Docker Image và so sánh kích thước |
| 11 | Container Networking | Bridge network, port mapping, container DNS, network isolation | Cho hai container giao tiếp qua Docker Network |
| 12 | Persistent Storage | Volume, bind mount, tmpfs, database persistence, backup | Chạy PostgreSQL và đảm bảo dữ liệu không mất khi recreate container |
| 13 | Docker Compose | Compose YAML, services, depends_on, environment, networks, volumes | Khởi chạy Frontend + API + PostgreSQL |
| 14 | Production-minded Compose | Healthcheck, restart, resource limits, secrets, logging, troubleshooting | Hoàn thiện hệ thống Compose, xử lý lỗi database chưa sẵn sàng |

**Deliverables**

- Dockerfile cho ứng dụng
- .dockerignore
- compose.yaml
- PostgreSQL volume persistence
- Tài liệu giải thích kiến trúc container


## Phase 3 – CI/CD & Automation

Tuần 8–10 · 6 buổi · 12 giờ · GitHub Actions, GHCR, automated testing, image publishing, pipeline security

| Buổi | Chủ đề | Nội dung | Hands-on Lab |
| --- | --- | --- | --- |
| 15 | CI/CD Fundamentals | Continuous Integration, Delivery, Deployment, Pipeline, Artifact, Runner, Trigger | Vẽ CI/CD pipeline cho ứng dụng |
| 16 | GitHub Actions Basics | Workflow, YAML, Events, Jobs, Steps, Runner, Marketplace Actions | Viết workflow tự động chạy khi push code |
| 17 | Automated Testing | Unit Test, Integration Test, Test Report, Build Validation | Thiết lập test trước khi merge |
| 18 | Docker CI Pipeline | Docker Build, Buildx, cache, tagging, GHCR, authentication | Tự động build và publish image lên GHCR |
| 19 | CD & Deployment Strategies | Continuous Deployment, environment, secrets, approval, rollback, deployment strategy | Viết workflow/script deploy image lên môi trường local |
| 20 | Pipeline Security | Least Privilege, permissions, secret management, dependency scanning, SBOM, image scanning | Kiểm tra workflow permissions và quét image |

**Deliverables**

- .github/workflows/ci.yml
- .github/workflows/publish.yml
- Docker image trên GHCR
- Test report
- Tài liệu giải thích pipeline


## Phase 4 – Kubernetes & kubectl

Tuần 11–14 · 8 buổi · 16 giờ · Kubernetes, kubectl, Workloads, Networking, Storage, Troubleshooting

| Buổi | Chủ đề | Nội dung | Hands-on Lab |
| --- | --- | --- | --- |
| 21 | Kubernetes Introduction | Container orchestration, architecture, Control Plane, Worker Node, API Server, Scheduler, etcd, kubelet | Cài kind và tạo cluster local |
| 22 | Pods & Deployments | Pod lifecycle, YAML manifest, ReplicaSet, Deployment, labels, selectors | Deploy API lên Kubernetes |
| 23 | kubectl Fundamentals | Context, namespace, get, describe, apply, delete, logs, exec, port-forward | Quản lý workload bằng kubectl |
| 24 | Kubernetes Services | ClusterIP, NodePort, LoadBalancer, Service Discovery, DNS | Kết nối Frontend với Backend thông qua Service |
| 25 | Configuration Management | ConfigMap, Secret, environment variables, mounted configuration | Tách cấu hình khỏi Docker Image |
| 26 | Resource & Health | Requests, Limits, Liveness, Readiness, Startup Probe, QoS | Mô phỏng OOMKilled và lỗi healthcheck |
| 27 | Storage & Ingress | PV, PVC, StorageClass, Ingress Controller, HTTP routing | Deploy PostgreSQL với PVC và cấu hình ingress |
| 28 | Kubernetes Operations | Rollout, rollback, scale, events, troubleshooting, CrashLoopBackOff, ImagePullBackOff | Phá lỗi một cluster mẫu và khôi phục hệ thống |

**Deliverables**

- Kubernetes Deployment manifests
- Service manifests
- ConfigMap và Secret
- PVC cho database
- Ingress
- Troubleshooting report


## Phase 5 – Capstone Project

Tuần 15–16 · 4 buổi · 8 giờ · Hoàn thiện sản phẩm, kiểm thử, trình bày, đánh giá

| Buổi | Chủ đề | Nội dung | Hands-on Lab |
| --- | --- | --- | --- |
| 29 | Architecture & Planning | Requirement, architecture, container design, CI/CD design, task breakdown | Thiết kế kiến trúc và chia task cho nhóm |
| 30 | Implementation | Docker, Compose, Kubernetes, GitHub Actions, testing | Hoàn thiện dự án |
| 31 | Testing & Troubleshooting | Deployment test, failure injection, logs, security checklist, performance basics | Kiểm thử và khắc phục các lỗi được giao |
| 32 | Final Demo & Review | Product demo, pipeline walkthrough, architecture presentation, lessons learned | Trình bày sản phẩm và bảo vệ kỹ thuật |

**Deliverables**

- Repository nhóm hoàn chỉnh
- README + Architecture Diagram
- Demo + technical defense
