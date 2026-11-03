# Tài liệu chính thức

Tài liệu chính thức là nguồn chuẩn; phần cuối trang có thêm best practices và hướng dẫn chuẩn. Cột "Dùng cho" cho biết buổi nên mở tài liệu đó; cột "Mức độ" gợi ý khi nào nên đọc. Nếu lệnh trong khóa học khác với tài liệu, ưu tiên tài liệu theo phiên bản bạn đang cài và báo mentor.

## Nền tảng

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| DevOps roadmap | https://roadmap.sh/devops | [Buổi 01](../labs/week-01/session-01.md), xem lại cuối khóa | Tổng quan |
| WSL | https://learn.microsoft.com/en-us/windows/wsl/ | [Buổi 02](../labs/week-01/session-02.md), cài môi trường | Cơ bản |
| Linux | https://linuxcommand.org/tlcl.php | [Buổi 03](../labs/week-02/session-03.md), [buổi 04](../labs/week-02/session-04.md) | Cơ bản |
| Git | https://git-scm.com/book/en/v2 | [Buổi 06](../labs/week-03/session-06.md) | Cơ bản |
| YAML | https://yaml.org/spec/1.2.2/ | Mọi buổi viết Compose, Actions, Kubernetes | Tra cứu khi cần, khá hàn lâm |

## Docker

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Docker | https://docs.docker.com/get-started/ | [Buổi 07](../labs/week-04/session-07.md), [buổi 08](../labs/week-04/session-08.md) | Cơ bản |
| Docker CLI reference | https://docs.docker.com/reference/cli/docker/ | Tra cứu cờ lệnh ở mọi buổi Docker | Tra cứu |
| Dockerfile reference | https://docs.docker.com/reference/dockerfile/ | [Buổi 09](../labs/week-05/session-09.md), [buổi 10](../labs/week-05/session-10.md) | Cơ bản đến nâng cao |
| Build best practices | https://docs.docker.com/build/building/best-practices/ | [Buổi 10](../labs/week-05/session-10.md), tối ưu image | Nâng cao |
| Docker Compose | https://docs.docker.com/compose/ | [Buổi 13](../labs/week-07/session-13.md), [buổi 14](../labs/week-07/session-14.md) | Cơ bản |
| Compose file reference | https://docs.docker.com/reference/compose-file/ | [Buổi 13](../labs/week-07/session-13.md), tra cứu khóa trong compose.yaml | Tra cứu |

## CI/CD

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| GitHub Actions | https://docs.github.com/en/actions | [Buổi 15](../labs/week-08/session-15.md) đến [buổi 20](../labs/week-10/session-20.md) | Cơ bản |
| GHCR | https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry | [Buổi 17](../labs/week-09/session-17.md) và [buổi 18](../labs/week-09/session-18.md), publish image | Cơ bản đến nâng cao |

## Kubernetes

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Kubernetes tutorials | https://kubernetes.io/docs/tutorials/ | [Buổi 21](../labs/week-11/session-21.md) đến [buổi 24](../labs/week-12/session-24.md) | Cơ bản |
| Kubernetes concepts | https://kubernetes.io/docs/concepts/ | [Buổi 22](../labs/week-11/session-22.md), [buổi 25](../labs/week-13/session-25.md) đến [buổi 28](../labs/week-14/session-28.md) | Cơ bản đến nâng cao |
| kubectl | https://kubernetes.io/docs/reference/kubectl/ | [Buổi 23](../labs/week-12/session-23.md), tra cứu lệnh | Tra cứu |
| kubectl quick reference | https://kubernetes.io/docs/reference/kubectl/quick-reference/ | [Buổi 23](../labs/week-12/session-23.md) và [buổi 24](../labs/week-12/session-24.md) | Tra cứu nhanh |
| Debug trong Kubernetes | https://kubernetes.io/docs/tasks/debug/ | [Buổi 27](../labs/week-14/session-27.md) và [buổi 28](../labs/week-14/session-28.md) | Nâng cao |
| kind | https://kind.sigs.k8s.io/ | [Buổi 21](../labs/week-11/session-21.md), cài và tạo cluster | Cơ bản |

## Ứng dụng mẫu

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Node.js | https://nodejs.org/docs/latest-v22.x/api/ | Đọc mã backend, [buổi 09](../labs/week-05/session-09.md) và capstone | Tra cứu |
| Express | https://expressjs.com/ | Mở rộng API ở capstone ([buổi 29](../labs/week-15/session-29.md)) | Cơ bản |
| PostgreSQL 17 | https://www.postgresql.org/docs/17/ | [Buổi 12](../labs/week-06/session-12.md), [buổi 14](../labs/week-07/session-14.md) (database, backup) | Tra cứu |

## Best practices và hướng dẫn chuẩn

Các nguồn dưới đây nói về cách làm đúng, không chỉ cách dùng công cụ. Đọc sau khi bạn đã chạy được lab.

### Git và làm việc nhóm

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Pro Git: Branching Workflows | https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows | [Buổi 06](../labs/week-03/session-06.md), chia nhánh theo quy trình | Cơ bản |
| Atlassian: so sánh Git workflow | https://www.atlassian.com/git/tutorials/comparing-workflows | [Buổi 06](../labs/week-03/session-06.md), chọn workflow cho nhóm | Cơ bản |
| GitHub flow | https://docs.github.com/en/get-started/using-github/github-flow | [Buổi 06](../labs/week-03/session-06.md), nhánh và pull request | Cơ bản |
| About protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches | [Buổi 06](../labs/week-03/session-06.md), [buổi 16](../labs/week-08/session-16.md), bảo vệ nhánh main | Nâng cao |
| Conventional Commits | https://www.conventionalcommits.org/en/v1.0.0/ | [Buổi 06](../labs/week-03/session-06.md), viết commit message rõ ràng | Cơ bản |
| Semantic Versioning | https://semver.org/ | [Buổi 18](../labs/week-09/session-18.md), đặt tag cho image | Cơ bản |

### Linux

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| CIS Benchmarks | https://www.cisecurity.org/cis-benchmarks | [Buổi 04](../labs/week-02/session-04.md), tham khảo cấu hình an toàn | Tra cứu |
| Ubuntu Server: Introduction to security | https://documentation.ubuntu.com/server/explanation/intro-to/security/ | [Buổi 04](../labs/week-02/session-04.md), tổng quan bảo mật server | Cơ bản |
| OpenSSH manual pages | https://www.openssh.com/manual.html | [Buổi 04](../labs/week-02/session-04.md), cấu hình SSH và khóa | Tra cứu |
| ufw (tường lửa) | https://manpages.ubuntu.com/manpages/noble/man8/ufw.8.html | [Buổi 05](../labs/week-03/session-05.md), mở và đóng port | Tra cứu |
| systemd.service | https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html | [Buổi 04](../labs/week-02/session-04.md), quản lý service | Tra cứu |

### Docker và Compose

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Building best practices | https://docs.docker.com/build/building/best-practices/ | [Buổi 09](../labs/week-05/session-09.md), [buổi 10](../labs/week-05/session-10.md), viết Dockerfile tốt | Nâng cao |
| Docker Engine security | https://docs.docker.com/engine/security/ | [Buổi 10](../labs/week-05/session-10.md), hiểu rủi ro của container | Nâng cao |
| OWASP Docker Security Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html | [Buổi 10](../labs/week-05/session-10.md), danh sách kiểm tra bảo mật | Nâng cao |
| Use Compose in production | https://docs.docker.com/compose/how-tos/production/ | [Buổi 14](../labs/week-07/session-14.md), Compose cho môi trường thật | Nâng cao |
| Control startup order trong Compose | https://docs.docker.com/compose/how-tos/startup-order/ | [Buổi 14](../labs/week-07/session-14.md), healthcheck và depends_on | Cơ bản |
| The Twelve-Factor App | https://12factor.net/ | [Buổi 13](../labs/week-07/session-13.md), [buổi 25](../labs/week-13/session-25.md), cấu hình qua biến môi trường | Cơ bản |

### CI/CD và bảo mật pipeline

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| GitHub Actions: Secure use reference | https://docs.github.com/en/actions/reference/security/secure-use | [Buổi 20](../labs/week-10/session-20.md), bảo mật workflow | Nâng cao |
| Using secrets in GitHub Actions | https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets | [Buổi 16](../labs/week-08/session-16.md), [buổi 20](../labs/week-10/session-20.md), dùng secret an toàn | Cơ bản |
| OWASP CI/CD Security Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html | [Buổi 20](../labs/week-10/session-20.md), rủi ro trong pipeline | Nâng cao |
| OWASP Secrets Management Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | [Buổi 20](../labs/week-10/session-20.md), quản lý secret | Nâng cao |
| SLSA | https://slsa.dev/ | [Buổi 20](../labs/week-10/session-20.md), bảo vệ chuỗi cung ứng phần mềm | Nâng cao |
| OpenSSF Scorecard | https://scorecard.dev/ | [Buổi 20](../labs/week-10/session-20.md), chấm điểm bảo mật repo | Tra cứu |

### Kubernetes

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Configuration Good Practices | https://kubernetes.io/docs/concepts/configuration/overview/ | [Buổi 22](../labs/week-11/session-22.md), [buổi 25](../labs/week-13/session-25.md), viết manifest tốt | Cơ bản |
| Pod Security Standards | https://kubernetes.io/docs/concepts/security/pod-security-standards/ | [Buổi 28](../labs/week-14/session-28.md), mức bảo mật cho Pod | Nâng cao |
| Resource Management for Pods and Containers | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ | [Buổi 26](../labs/week-13/session-26.md), requests và limits | Cơ bản |
| Liveness, Readiness và Startup Probes | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | [Buổi 26](../labs/week-13/session-26.md), kiểm tra sức khỏe Pod | Cơ bản |
| Good practices for Kubernetes Secrets | https://kubernetes.io/docs/concepts/security/secrets-good-practices/ | [Buổi 25](../labs/week-13/session-25.md), dùng Secret an toàn | Nâng cao |

### Bảo mật ứng dụng

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ | [Buổi 20](../labs/week-10/session-20.md), [buổi 30](../labs/week-15/session-30.md), 10 rủi ro web phổ biến | Cơ bản |
| OWASP Cheat Sheet Series | https://cheatsheetseries.owasp.org/ | [Buổi 30](../labs/week-15/session-30.md), tra cứu theo chủ đề bảo mật | Tra cứu |
| SPDX | https://spdx.dev/ | [Buổi 20](../labs/week-10/session-20.md), chuẩn SBOM (danh sách thành phần phần mềm) | Tra cứu |
| CycloneDX | https://cyclonedx.org/ | [Buổi 20](../labs/week-10/session-20.md), chuẩn SBOM khác | Tra cứu |

### Vận hành và xử lý sự cố

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Google SRE: Postmortem Culture | https://sre.google/sre-book/postmortem-culture/ | [Buổi 31](../labs/week-16/session-31.md), [buổi 32](../labs/week-16/session-32.md), viết báo cáo sau sự cố | Nâng cao |
| Google SRE: Monitoring Distributed Systems | https://sre.google/sre-book/monitoring-distributed-systems/ | [Buổi 28](../labs/week-14/session-28.md), nên theo dõi chỉ số nào | Nâng cao |
| Atlassian Incident Management Handbook | https://www.atlassian.com/incident-management/handbook | [Buổi 31](../labs/week-16/session-31.md), quy trình xử lý sự cố | Cơ bản |
| PagerDuty Incident Response | https://response.pagerduty.com/ | [Buổi 31](../labs/week-16/session-31.md), vai trò khi có sự cố | Nâng cao |

### Viết tài liệu và quyết định kiến trúc

| Chủ đề | Link | Dùng cho | Mức độ |
| --- | --- | --- | --- |
| Architectural Decision Records | https://adr.github.io/ | [Buổi 29](../labs/week-15/session-29.md), ghi lại quyết định thiết kế | Cơ bản |
| Make a README | https://www.makeareadme.com/ | [Buổi 30](../labs/week-15/session-30.md), [buổi 32](../labs/week-16/session-32.md), viết README | Cơ bản |
| Write the Docs: documentation guide | https://www.writethedocs.org/guide/ | [Buổi 32](../labs/week-16/session-32.md), viết tài liệu cho người đọc | Nâng cao |
| Keep a Changelog | https://keepachangelog.com/en/1.1.0/ | [Buổi 18](../labs/week-09/session-18.md), ghi lại thay đổi giữa các phiên bản | Cơ bản |
| About READMEs (GitHub) | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes | [Buổi 30](../labs/week-15/session-30.md), README hiển thị trên GitHub | Cơ bản |

Tài liệu chính thức là nguồn chuẩn; sách để đào sâu ([danh sách sách](books.md)), video để minh họa, lab để đánh giá năng lực. Khi quên lệnh, xem [Cheatsheets](cheatsheets.md); khi gặp từ lạ, xem [Thuật ngữ](glossary.md).
