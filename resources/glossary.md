# Thuật ngữ

Danh sách 133 thuật ngữ DevOps, Linux, Docker, CI/CD và Kubernetes dùng trong khóa học, sắp xếp theo bảng chữ cái. Mỗi mục gồm một câu định nghĩa và phần "Đọc thêm" chỉ ra buổi học sử dụng thuật ngữ đó là chính. Xem thêm [Cheatsheets](cheatsheets.md) để tra lệnh và [Terminal 101](terminal-101.md) để làm quen với dòng lệnh.

::: tip Mục lục nhảy
[A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [G](#g) · [H](#h) · [I](#i) · [J](#j) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [R](#r) · [S](#s) · [T](#t) · [U](#u) · [V](#v) · [W](#w) · [Y](#y)

Thuật ngữ tuần 1 đến 4: [DevOps](#d), [SDLC](#s), [IaC](#i), [terminal](#t), [shell](#s), [sudo](#s), [apt](#a), [ssh-agent](#s), [image](#i), [registry](#r), [layer](#l), [daemon](#d), [tag](#t), [volume](#v). Thuật ngữ Kubernetes: [Pod](#p), [Node](#n), [Namespace](#n), [Label](#l), [Selector](#s), [Endpoint](#e), [Ingress](#i).
:::

## A

- **Alpine Linux**: Alpine Linux là một bản phân phối Linux có kích thước nhỏ, thường được dùng làm image nền (ví dụ `node:22-alpine`) để giảm dung lượng image. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).
- **apt**: apt là trình quản lý gói của Ubuntu và Debian, dùng để cài đặt và cập nhật phần mềm (`apt update`, `apt install`). Đọc thêm: [buổi 3](../labs/week-02/session-03.md).

## B

- **bash**: bash là shell mặc định trên Ubuntu, đóng vai trò vừa là giao diện dòng lệnh vừa là ngôn ngữ viết script. Đọc thêm: [buổi 3](../labs/week-02/session-03.md), [buổi 4](../labs/week-02/session-04.md).
- **Bind mount**: Bind mount gắn trực tiếp một thư mục của máy host vào container và phụ thuộc vào cấu trúc thư mục của host. Đọc thêm: [buổi 12](../labs/week-06/session-12.md).
- **Branch (nhánh)**: Branch là một dòng lịch sử commit độc lập trong Git, cho phép phát triển tính năng mà không ảnh hưởng đến nhánh chính. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **Branch protection**: Branch protection là quy tắc của GitHub yêu cầu pull request, review hoặc CI thành công trước khi merge vào một nhánh. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **Bridge network**: Bridge network là loại network mặc định của Docker trên một host, nối các container với nhau qua một switch ảo. Đọc thêm: [buổi 11](../labs/week-06/session-11.md).
- **Build context**: Build context là thư mục và nội dung được gửi cho Docker khi build; chỉ thị COPY chỉ lấy được các file nằm trong context. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).

## C

- **Continuous Delivery / Deployment**: Continuous Delivery / Deployment là việc tự động đưa bản build đã qua kiểm thử đến môi trường chạy (staging hoặc production). Đọc thêm: [buổi 19](../labs/week-10/session-19.md).
- **Control groups (cgroups)**: Control groups (cgroups) là tính năng của kernel Linux dùng để giới hạn và đo tài nguyên (CPU, RAM) của một nhóm process, và là cơ sở của việc giới hạn tài nguyên container. Đọc thêm: [buổi 7](../labs/week-04/session-07.md), [buổi 26](../labs/week-13/session-26.md).
- **Continuous Integration**: Continuous Integration là quy trình trong đó hệ thống tự động build và test sau mỗi lần push hoặc pull request để phát hiện lỗi sớm. Đọc thêm: [buổi 15](../labs/week-08/session-15.md).
- **Cluster**: Cluster là tập hợp các máy (node) được Kubernetes quản lý như một hệ thống thống nhất; trong khóa học, cluster là cluster kind chạy cục bộ. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **CMD**: CMD là chỉ thị Dockerfile đặt lệnh mặc định khi chạy container; lệnh này có thể bị ghi đè khi chạy `docker run`. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).
- **Commit**: Commit là một điểm lưu trong lịch sử Git, gồm các thay đổi, tác giả và thông điệp mô tả. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **Compose file (compose.yaml)**: Compose file là file YAML mô tả các service, network và volume của một ứng dụng nhiều container. Đọc thêm: [buổi 13](../labs/week-07/session-13.md).
- **ConfigMap**: ConfigMap là đối tượng Kubernetes lưu cấu hình không bí mật dưới dạng key-value, để cung cấp cho Pod qua biến môi trường hoặc file. Đọc thêm: [buổi 25](../labs/week-13/session-25.md).
- **Container**: Container là một process được cô lập (bằng namespace và cgroups) chạy từ một image và dùng chung kernel với máy host. Đọc thêm: [buổi 7](../labs/week-04/session-07.md).
- **Container registry**: Container registry là nơi lưu trữ và phân phối image, ví dụ Docker Hub hoặc GHCR. Đọc thêm: [buổi 10](../labs/week-05/session-10.md), [buổi 17](../labs/week-09/session-17.md).
- **kubectl context**: kubectl context là bộ ba cluster, user và namespace mà kubectl đang sử dụng; kind tạo context có tên kind-tên. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **Control plane**: Control plane là tập hợp các thành phần điều khiển cluster (API server, scheduler, controller manager, etcd). Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **Controller**: Controller là vòng lặp điều khiển trong Kubernetes, liên tục đưa trạng thái thực tế về trạng thái mong muốn. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **CrashLoopBackOff**: CrashLoopBackOff là trạng thái của Pod khi container liên tục khởi động rồi thoát với lỗi, và kubelet tăng dần thời gian chờ giữa các lần khởi động lại. Đọc thêm: [buổi 28](../labs/week-14/session-28.md).
- **curl**: curl là công cụ dòng lệnh gửi HTTP request, dùng để kiểm tra API và health endpoint. Đọc thêm: [buổi 5](../labs/week-03/session-05.md).

## D

- **Daemon**: Daemon là tiến trình chạy nền, không có giao diện cửa sổ và luôn sẵn sàng nhận yêu cầu; Docker có daemon tên dockerd (xem mục Docker daemon). Ví dụ so sánh: daemon giống nhân viên trực quầy liên tục. Đọc thêm: [buổi 7](../labs/week-04/session-07.md).
- **DaemonSet**: DaemonSet là workload bảo đảm mỗi node chạy một bản sao của Pod, thường dùng cho agent thu thập log hoặc giám sát. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Declarative (khai báo)**: Declarative (khai báo) là cách mô tả trạng thái mong muốn (bằng YAML) thay vì liệt kê từng bước; Kubernetes tự thực hiện để đạt trạng thái đó. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Deployment**: Deployment là workload Kubernetes quản lý nhiều bản sao Pod giống nhau và hỗ trợ rolling update cùng rollback. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **DevOps**: DevOps là văn hóa và tập hợp các thực hành phối hợp giữa phát triển và vận hành để giao phần mềm nhanh và ổn định. Đọc thêm: [buổi 1](../labs/week-01/session-01.md).
- **dig**: dig là công cụ dòng lệnh truy vấn DNS và hiển thị chi tiết kết quả phân giải. Đọc thêm: [buổi 5](../labs/week-03/session-05.md).
- **Domain Name System**: Domain Name System (DNS) là hệ thống phân giải tên miền thành địa chỉ IP; trong Compose và Kubernetes, DNS còn được dùng để tìm service theo tên. Đọc thêm: [buổi 5](../labs/week-03/session-05.md), [buổi 12](../labs/week-06/session-12.md), [buổi 24](../labs/week-12/session-24.md).
- **Docker Compose**: Docker Compose là công cụ chạy ứng dụng nhiều container từ một file compose.yaml bằng lệnh `docker compose`. Đọc thêm: [buổi 13](../labs/week-07/session-13.md).
- **Docker daemon (dockerd)**: Docker daemon (dockerd) là tiến trình nền thực hiện việc build, chạy và quản lý container theo yêu cầu của docker CLI. Đọc thêm: [buổi 7](../labs/week-04/session-07.md).
- **Docker Desktop**: Docker Desktop là ứng dụng cài đặt Docker trên Windows và macOS, tích hợp với WSL2 và cung cấp Docker Engine cùng Compose. Đọc thêm: [buổi 2](../labs/week-01/session-02.md), [buổi 7](../labs/week-04/session-07.md).
- **Docker Engine**: Docker Engine là thành phần cốt lõi của Docker, gồm daemon, API và CLI. Đọc thêm: [buổi 7](../labs/week-04/session-07.md).
- **Dockerfile**: Dockerfile là file văn bản gồm các chỉ thị mô tả cách build một image. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).
- **.dockerignore**: `.dockerignore` là file liệt kê các mục không được đưa vào build context (node_modules, .git, .env). Đọc thêm: [buổi 10](../labs/week-05/session-10.md).
- **Dry run**: Dry run là chế độ chạy thử không áp dụng thay đổi thực tế, ví dụ kubectl apply --dry-run=client. Đọc thêm: [buổi 23](../labs/week-12/session-23.md).

## E

- **End-to-end (E2E) test**: End-to-end (E2E) test là kiểm thử toàn bộ luồng từ giao diện đến database, mô phỏng cách người dùng thực sử dụng hệ thống. Đọc thêm: [buổi 17](../labs/week-09/session-17.md).
- **Endpoint**: Endpoint là địa chỉ mà API cung cấp (như /health); trong Kubernetes, Endpoints là danh sách địa chỉ IP của các Pod phía sau một Service. Đọc thêm: [buổi 24](../labs/week-12/session-24.md).
- **ENTRYPOINT**: ENTRYPOINT là chỉ thị Dockerfile đặt tiến trình cố định của container; CMD thường cung cấp tham số mặc định cho tiến trình đó. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).
- **Environment variable (biến môi trường)**: Environment variable (biến môi trường) là cặp tên-giá trị dùng để truyền cấu hình cho process, như DB_HOST hoặc DB_PASSWORD. Đọc thêm: [buổi 4](../labs/week-02/session-04.md), [buổi 9](../labs/week-05/session-09.md).
- **etcd**: etcd là kho key-value của control plane, lưu toàn bộ trạng thái của cluster. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **Exit code**: Exit code là số mà process trả về khi kết thúc; giá trị 0 nghĩa là thành công, giá trị khác 0 nghĩa là lỗi (137 thường nghĩa là process bị dừng do hết RAM). Đọc thêm: [buổi 8](../labs/week-04/session-08.md).
- **EXPOSE**: EXPOSE là chỉ thị Dockerfile ghi chú cổng mà ứng dụng sử dụng và không tự publish cổng ra host. Đọc thêm: [buổi 9](../labs/week-05/session-09.md).

## G

- **GitHub Container Registry (ghcr.io)**: GitHub Container Registry (ghcr.io) là registry image của GitHub, tích hợp phân quyền với repository và GITHUB_TOKEN. Đọc thêm: [buổi 17](../labs/week-09/session-17.md).
- **GitHub Actions**: GitHub Actions là nền tảng CI/CD của GitHub, chạy workflow khi có sự kiện trong repository. Đọc thêm: [buổi 15](../labs/week-08/session-15.md).
- **GITHUB_TOKEN**: GITHUB_TOKEN là token tạm thời do GitHub cấp cho mỗi lần chạy workflow, với quyền được kiểm soát bằng khóa permissions. Đọc thêm: [buổi 19](../labs/week-10/session-19.md).
- **Graceful shutdown**: Graceful shutdown là cách dừng ứng dụng đúng quy trình: nhận SIGTERM, ngừng nhận request mới, hoàn tất công việc đang xử lý rồi thoát. Đọc thêm: [buổi 8](../labs/week-04/session-08.md), [buổi 26](../labs/week-13/session-26.md).

## H

- **Health check**: Health check là việc kiểm tra định kỳ trạng thái hoạt động của dịch vụ; trong Docker là HEALTHCHECK, trong Kubernetes là probe. Đọc thêm: [buổi 14](../labs/week-07/session-14.md), [buổi 26](../labs/week-13/session-26.md).
- **Heredoc**: Heredoc là cú pháp ghi nhiều dòng vào file từ terminal bằng `cat > file <<EOF ... EOF`. Đọc thêm: [Terminal 101](terminal-101.md).
- **Home directory (thư mục ~)**: Home directory là thư mục cá nhân của người dùng trong Linux, ví dụ `/home/tien`, viết tắt là `~`; khóa học đặt `~/devops-course` và `~/devops-labs` tại đây. Đọc thêm: [Terminal 101](terminal-101.md), [buổi 3](../labs/week-02/session-03.md).

## I

- **Idempotent (bất biến khi lặp)**: Idempotent (bất biến khi lặp) mô tả thao tác cho cùng một kết quả dù được chạy nhiều lần, như kubectl apply. Đọc thêm: [buổi 20](../labs/week-10/session-20.md).
- **Image**: Image là gói bất biến gồm filesystem và metadata dùng để tạo container, được cấu thành từ nhiều layer. Đọc thêm: [buổi 7](../labs/week-04/session-07.md), [buổi 9](../labs/week-05/session-09.md).
- **ImagePullBackOff**: ImagePullBackOff là trạng thái của Pod khi không tải được image (sai tên hoặc tag, chưa nạp vào kind, thiếu quyền), và kubelet thử lại với thời gian chờ tăng dần. Đọc thêm: [buổi 28](../labs/week-14/session-28.md).
- **imagePullPolicy**: imagePullPolicy quy định thời điểm kubelet tải image (Always, IfNotPresent, Never) và ảnh hưởng đến image được nạp bằng kind load. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Immutable infrastructure**: Immutable infrastructure là nguyên tắc không sửa trực tiếp server hoặc container đang chạy; khi cần thay đổi thì build bản mới và thay thế bản cũ. Đọc thêm: [buổi 9](../labs/week-05/session-09.md), [buổi 20](../labs/week-10/session-20.md).
- **Infrastructure as Code (IaC)**: Infrastructure as Code (IaC) là cách mô tả hạ tầng và cấu hình bằng file có thể lưu trong Git, review và tái tạo; Compose và manifest Kubernetes là các ví dụ. Đọc thêm: [buổi 1](../labs/week-01/session-01.md), [buổi 13](../labs/week-07/session-13.md).
- **Ingress**: Ingress là tài nguyên Kubernetes định tuyến HTTP từ bên ngoài vào Service theo host và path, và cần có Ingress controller để hoạt động. Đọc thêm: [buổi 27](../labs/week-14/session-27.md).
- **Ingress controller**: Ingress controller là thành phần (như ingress-nginx) thực thi các quy tắc được khai báo trong Ingress. Đọc thêm: [buổi 27](../labs/week-14/session-27.md).
- **Init container**: Init container là container chạy đến khi hoàn thành trước khi các container chính của Pod khởi động, thường dùng để chuẩn bị dữ liệu hoặc chờ dependency. Đọc thêm: [buổi 25](../labs/week-13/session-25.md).
- **Integration test**: Integration test là kiểm thử nhiều thành phần chạy cùng nhau, ví dụ API với database thật. Đọc thêm: [buổi 18](../labs/week-09/session-18.md).

## J

- **Job**: Job là một nhóm step chạy trên cùng một runner trong workflow GitHub Actions. Đọc thêm: [buổi 16](../labs/week-08/session-16.md).
- **Job (Kubernetes)**: Job (Kubernetes) là workload chạy Pod cho đến khi hoàn thành một tác vụ hữu hạn. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).

## K

- **kind (Kubernetes IN Docker)**: kind (Kubernetes IN Docker) là công cụ tạo cluster Kubernetes chạy trong container Docker, dùng cho học tập và kiểm thử. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **kubeconfig**: kubeconfig là file cấu hình (mặc định `~/.kube/config`) chứa thông tin về cluster, user và context cho kubectl. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **kubectl**: kubectl là công cụ dòng lệnh điều khiển cluster Kubernetes thông qua API server. Đọc thêm: [buổi 23](../labs/week-12/session-23.md).
- **kubelet**: kubelet là agent chạy trên mỗi node, bảo đảm các container của Pod chạy đúng như mô tả. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **Kubernetes (K8s)**: Kubernetes (K8s) là hệ thống điều phối container, hỗ trợ lập lịch, tự phục hồi, mở rộng và cập nhật không gián đoạn. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).

## L

- **Label**: Label là cặp key-value gắn vào tài nguyên Kubernetes để nhóm và chọn lọc tài nguyên. Đọc thêm: [buổi 23](../labs/week-12/session-23.md).
- **Layer**: Layer là một lớp thay đổi filesystem trong image, được tạo ra bởi các chỉ thị như RUN hoặc COPY. Ví dụ so sánh: image giống một chồng giấy trong suốt, trong đó mỗi layer là một tờ. Đọc thêm: [buổi 10](../labs/week-05/session-10.md).
- **Layer cache**: Layer cache là cơ chế Docker dùng lại layer đã build nếu lệnh và dữ liệu đầu vào không đổi, giúp build nhanh hơn. Đọc thêm: [buổi 10](../labs/week-05/session-10.md).
- **Limits (giới hạn tài nguyên)**: Limits (giới hạn tài nguyên) là mức tối đa CPU và RAM mà container được sử dụng; container vượt giới hạn RAM sẽ bị OOMKilled. Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Liveness probe**: Liveness probe kiểm tra container còn hoạt động hay không; nếu thất bại, kubelet khởi động lại container. Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Load balancer**: Load balancer phân phối request đến nhiều bản sao của một dịch vụ; Service trong Kubernetes cân bằng tải giữa các Pod. Đọc thêm: [buổi 24](../labs/week-12/session-24.md).

## M

- **Manifest**: Manifest là file YAML mô tả tài nguyên Kubernetes, được áp dụng bằng kubectl apply. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Matrix (build matrix)**: Matrix (build matrix) là cấu hình của GitHub Actions cho phép chạy cùng một job với nhiều tổ hợp tham số, như nhiều phiên bản Node. Đọc thêm: [buổi 18](../labs/week-09/session-18.md).
- **Multi-stage build**: Multi-stage build là Dockerfile có nhiều stage, trong đó kết quả build ở một stage được chép sang image cuối, giúp image nhỏ gọn. Đọc thêm: [buổi 10](../labs/week-05/session-10.md).

## N

- **Namespace (Kubernetes)**: Namespace (Kubernetes) là không gian tên logic chia cluster thành các vùng riêng biệt; khóa học dùng namespace club. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Namespace (Linux)**: Namespace (Linux) là tính năng của kernel cô lập những gì một process nhìn thấy (process, mạng, mount) và cùng với cgroups tạo nên container. Đọc thêm: [buổi 7](../labs/week-04/session-07.md).
- **Node**: Node là máy (vật lý hoặc ảo) trong cluster dùng để chạy Pod; với kind, mỗi node là một container Docker. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **NodePort**: NodePort là loại Service mở một cổng cố định trên mọi node. Đọc thêm: [buổi 24](../labs/week-12/session-24.md).
- **Non-root user**: Non-root user là cách chạy container bằng user thông thường thay vì root để giảm rủi ro khi container bị khai thác. Đọc thêm: [buổi 10](../labs/week-05/session-10.md), [buổi 19](../labs/week-10/session-19.md).
- **npm ci**: npm ci cài dependency đúng theo package-lock.json một cách sạch và tái lập được, phù hợp cho CI và Dockerfile. Đọc thêm: [buổi 10](../labs/week-05/session-10.md), [buổi 16](../labs/week-08/session-16.md).

## O

- **OOMKilled**: OOMKilled là trạng thái container bị kernel dừng vì vượt giới hạn bộ nhớ (exit code 137). Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Orchestration**: Orchestration là việc tự động hóa triển khai, mở rộng và phục hồi nhiều container; Kubernetes là hệ thống phổ biến nhất. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).

## P

- **Pending**: Pending là trạng thái của Pod đã được tạo nhưng chưa chạy, thường do chưa được lập lịch hoặc đang chờ volume. Đọc thêm: [buổi 28](../labs/week-14/session-28.md).
- **Permissions (GitHub Actions)**: Permissions (GitHub Actions) là khóa trong workflow giới hạn quyền của GITHUB_TOKEN; nên đặt ở mức tối thiểu cần thiết. Đọc thêm: [buổi 19](../labs/week-10/session-19.md).
- **Permissions (quyền file)**: Permissions (quyền file) là quyền đọc, ghi và thực thi (rwx) được gán cho user, group và others. Đọc thêm: [buổi 4](../labs/week-02/session-04.md).
- **PersistentVolume (PV)**: PersistentVolume (PV) là tài nguyên lưu trữ trong cluster, tồn tại độc lập với vòng đời của Pod. Đọc thêm: [buổi 27](../labs/week-14/session-27.md).
- **PersistentVolumeClaim (PVC)**: PersistentVolumeClaim (PVC) là yêu cầu lưu trữ của người dùng; Kubernetes gắn PVC với một PV phù hợp. Đọc thêm: [buổi 27](../labs/week-14/session-27.md).
- **Pipe (đường ống)**: Pipe (đường ống) là ký hiệu `|` dùng đầu ra của lệnh này làm đầu vào của lệnh kế tiếp, ví dụ `ls | wc -l`. Đọc thêm: [buổi 3](../labs/week-02/session-03.md), [buổi 4](../labs/week-02/session-04.md).
- **Pipeline**: Pipeline là chuỗi các bước tự động từ commit đến triển khai (build, test, publish, deploy). Đọc thêm: [buổi 15](../labs/week-08/session-15.md).
- **Pod**: Pod là đơn vị triển khai nhỏ nhất trong Kubernetes, gồm một hoặc nhiều container dùng chung mạng và volume. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **Port forwarding**: Port forwarding chuyển tiếp một cổng trên máy cục bộ đến Pod hoặc Service (kubectl port-forward). Đọc thêm: [buổi 23](../labs/week-12/session-23.md).
- **Port mapping (publish)**: Port mapping (publish) gắn một cổng của host với một cổng của container bằng docker run -p host:container. Đọc thêm: [buổi 7](../labs/week-04/session-07.md), [buổi 11](../labs/week-06/session-11.md).
- **Probe**: Probe là phép kiểm tra trạng thái container do kubelet thực hiện, gồm liveness, readiness và startup. Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Prompt**: Prompt là dòng chữ cuối cùng trong terminal (như `tien@laptop:~$`), cho biết shell đang chờ nhận lệnh. Đọc thêm: [Terminal 101](terminal-101.md).
- **Pull Request (PR)**: Pull Request (PR) là đề nghị gộp một nhánh trên GitHub, nơi diễn ra review và chạy CI. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).

## R

- **Readiness probe**: Readiness probe kiểm tra container đã sẵn sàng nhận lưu lượng hay chưa; nếu thất bại, Pod bị loại khỏi Service nhưng không bị khởi động lại. Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Rebase**: Rebase là thao tác viết lại lịch sử bằng cách dời các commit của một nhánh lên một điểm khác; không dùng trên nhánh dùng chung. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **Registry**: Registry là kho lưu trữ và phân phối image Docker (Docker Hub, GHCR). Xem thêm mục Container registry. Đọc thêm: [buổi 10](../labs/week-05/session-10.md), [buổi 17](../labs/week-09/session-17.md).
- **Repository (repo)**: Repository là thư mục dự án có lịch sử được Git theo dõi; trên GitHub, repository là nơi lưu mã nguồn của dự án, như `devops-labs`. Đọc thêm: [buổi 1](../labs/week-01/session-01.md), [buổi 6](../labs/week-03/session-06.md).
- **ReplicaSet**: ReplicaSet là controller duy trì số lượng Pod như mong muốn và thường do Deployment tạo ra. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Requests (yêu cầu tài nguyên)**: Requests (yêu cầu tài nguyên) là lượng CPU và RAM tối thiểu mà Pod cần để được lập lịch lên một node. Đọc thêm: [buổi 26](../labs/week-13/session-26.md).
- **Restart policy**: Restart policy quy định Docker hoặc Kubernetes có khởi động lại container khi container thoát hay không. Đọc thêm: [buổi 8](../labs/week-04/session-08.md), [buổi 14](../labs/week-07/session-14.md).
- **Rollback**: Rollback là việc quay về phiên bản trước khi bản mới gặp lỗi (kubectl rollout undo). Đọc thêm: [buổi 20](../labs/week-10/session-20.md), [buổi 23](../labs/week-12/session-23.md).
- **Rolling update**: Rolling update là cách cập nhật dần từng Pod sang phiên bản mới để dịch vụ không bị gián đoạn. Đọc thêm: [buổi 22](../labs/week-11/session-22.md).
- **Root cause (nguyên nhân gốc)**: Root cause (nguyên nhân gốc) là nguyên nhân sâu xa gây ra lỗi, khác với triệu chứng quan sát được và là mục tiêu của mọi bài troubleshooting. Đọc thêm: [buổi 8](../labs/week-04/session-08.md), [buổi 28](../labs/week-14/session-28.md).
- **Runner**: Runner là máy thực thi job của GitHub Actions; ubuntu-latest là runner do GitHub cung cấp. Đọc thêm: [buổi 15](../labs/week-08/session-15.md).

## S

- **Scheduler**: Scheduler là thành phần quyết định Pod chạy trên node nào dựa trên tài nguyên và các ràng buộc. Đọc thêm: [buổi 21](../labs/week-11/session-21.md).
- **SDLC (Software Development Life Cycle)**: Vòng đời phát triển phần mềm gồm các giai đoạn: lên yêu cầu, thiết kế, viết mã, kiểm thử, phát hành, vận hành rồi lặp lại; DevOps làm vòng này ngắn và liền mạch hơn. Đọc thêm: [buổi 1](../labs/week-01/session-01.md).
- **Secret**: Secret là đối tượng Kubernetes lưu dữ liệu nhạy cảm dưới dạng base64, vốn chỉ là cách biểu diễn chứ không phải mã hóa nên cần kiểm soát quyền truy cập; khóa học dùng Secret club-secrets. Đọc thêm: [buổi 25](../labs/week-13/session-25.md).
- **Selector**: Selector là biểu thức chọn tài nguyên theo label; Service dùng selector để tìm Pod. Đọc thêm: [buổi 23](../labs/week-12/session-23.md).
- **Service**: Service là địa chỉ ổn định và cân bằng tải cho một nhóm Pod, có thể truy cập theo tên DNS. Đọc thêm: [buổi 24](../labs/week-12/session-24.md).
- **Service (Compose)**: Service (Compose) là một thành phần được khai báo trong compose.yaml, ví dụ frontend, backend, postgres. Đọc thêm: [buổi 13](../labs/week-07/session-13.md).
- **Shell**: Shell là chương trình đọc các lệnh nhập trong terminal và thực thi chúng; bash là shell mặc định của Ubuntu. Ví dụ so sánh: shell giống phiên dịch viên giữa người dùng và hệ điều hành. Đọc thêm: [buổi 3](../labs/week-02/session-03.md).
- **SIGKILL**: SIGKILL là tín hiệu buộc dừng process ngay lập tức và process không thể bắt tín hiệu này. Đọc thêm: [buổi 8](../labs/week-04/session-08.md).
- **SIGTERM**: SIGTERM là tín hiệu yêu cầu process dừng đúng quy trình; docker stop và Kubernetes gửi tín hiệu này trước. Đọc thêm: [buổi 8](../labs/week-04/session-08.md), [buổi 26](../labs/week-13/session-26.md).
- **Smoke test**: Smoke test là kiểm tra nhanh sau triển khai để xác nhận chức năng cốt lõi hoạt động, như gọi /health. Đọc thêm: [buổi 20](../labs/week-10/session-20.md).
- **Software supply chain (chuỗi cung ứng phần mềm)**: Software supply chain (chuỗi cung ứng phần mềm) là toàn bộ mã, thư viện, công cụ và image tạo nên sản phẩm, cần được bảo vệ khỏi thành phần độc hại. Đọc thêm: [buổi 20](../labs/week-10/session-20.md).
- **SSH**: SSH là giao thức truy cập từ xa an toàn, cũng được dùng để xác thực với Git. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **ssh-agent**: ssh-agent là chương trình nền giữ khóa SSH đã mở khóa trong bộ nhớ, giúp chỉ phải nhập passphrase một lần thay vì mỗi lần dùng Git. Đọc thêm: [buổi 6](../labs/week-03/session-06.md).
- **StatefulSet**: StatefulSet là workload dành cho ứng dụng có trạng thái (như database), cấp cho Pod danh tính và volume ổn định; trong khóa học, StatefulSet dùng cho postgres. Đọc thêm: [buổi 27](../labs/week-14/session-27.md).
- **sudo**: sudo là tiền tố chạy một lệnh với quyền quản trị (root), như `sudo apt install git`; chỉ dùng khi được hướng dẫn. Đọc thêm: [buổi 2](../labs/week-01/session-02.md), [Terminal 101](terminal-101.md).

## T

- **Tag**: Tag là nhãn gắn vào image (club-api:1.0.0) hoặc commit Git để đánh dấu một phiên bản. Đọc thêm: [buổi 10](../labs/week-05/session-10.md).
- **Terminal**: Terminal là cửa sổ để nhập lệnh cho máy tính thay vì dùng chuột; khóa học dùng Windows Terminal với PowerShell và Ubuntu. Đọc thêm: [Terminal 101](terminal-101.md).
- **Test pyramid**: Test pyramid là mô hình khuyến nghị có nhiều unit test, vừa phải integration test và ít E2E test. Đọc thêm: [buổi 17](../labs/week-09/session-17.md).
- **Troubleshooting**: Troubleshooting là quy trình quan sát, đặt giả thuyết và kiểm chứng để tìm và sửa lỗi. Đọc thêm: [buổi 8](../labs/week-04/session-08.md), [buổi 28](../labs/week-14/session-28.md).

## U

- **Unit test**: Unit test là kiểm thử một đơn vị nhỏ (hàm, module) tách biệt khỏi phần còn lại của hệ thống. Đọc thêm: [buổi 17](../labs/week-09/session-17.md).

## V

- **Volume**: Volume là nơi lưu dữ liệu tồn tại độc lập với vòng đời container, như Docker named volume hoặc Kubernetes volume. Đọc thêm: [buổi 12](../labs/week-06/session-12.md).

## W

- **Workflow**: Workflow là file YAML trong .github/workflows mô tả quy trình tự động của GitHub Actions. Đọc thêm: [buổi 15](../labs/week-08/session-15.md).
- **WSL2**: WSL2 (Windows Subsystem for Linux 2) chạy kernel Linux thực trong Windows và là môi trường làm việc chính của khóa học. Đọc thêm: [buổi 2](../labs/week-01/session-02.md).

## Y

- **YAML**: YAML là định dạng dữ liệu dựa trên thụt lề, được dùng cho Compose, Kubernetes và GitHub Actions. Đọc thêm: [buổi 13](../labs/week-07/session-13.md).
