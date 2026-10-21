# Thuật ngữ

Danh sách 121 thuật ngữ DevOps, Linux, Docker, CI/CD và Kubernetes dùng trong khóa học, sắp xếp theo bảng chữ cái. Mỗi mục có tên tiếng Anh, giải thích ngắn và buổi học nơi thuật ngữ được dùng chính. Xem thêm [Cheatsheets](cheatsheets.md) để tra lệnh.


## A

- **Alpine Linux**: Bản phân phối Linux rất nhỏ, thường dùng làm image nền (ví dụ `node:22-alpine`) để image gọn. Học ở [buổi 9](../labs/week-05/session-09.md).
- **apt**: Trình quản lý gói của Ubuntu/Debian, dùng để cài và cập nhật phần mềm (apt update, apt install). Học ở [buổi 3](../labs/week-02/session-03.md).

## B

- **bash**: Shell mặc định trên Ubuntu, vừa là giao diện dòng lệnh vừa là ngôn ngữ viết script. Học ở [buổi 3](../labs/week-02/session-03.md), [buổi 4](../labs/week-02/session-04.md).
- **Bind mount**: Gắn trực tiếp một thư mục của máy host vào container; phụ thuộc cấu trúc thư mục của host. Học ở [buổi 12](../labs/week-06/session-12.md).
- **Branch (nhánh)**: Dòng lịch sử commit độc lập trong Git, dùng để phát triển tính năng mà không ảnh hưởng nhánh chính. Học ở [buổi 6](../labs/week-03/session-06.md).
- **Branch protection**: Quy tắc của GitHub bắt buộc PR, review hoặc CI xanh trước khi merge vào một nhánh. Học ở [buổi 6](../labs/week-03/session-06.md).
- **Bridge network**: Loại network mặc định của Docker trên một host, nối các container với nhau qua một switch ảo. Học ở [buổi 11](../labs/week-06/session-11.md).
- **Build context**: Thư mục (và nội dung) được gửi cho Docker khi build; COPY chỉ lấy được file nằm trong context. Học ở [buổi 9](../labs/week-05/session-09.md).

## C

- **Layer cache**: Docker dùng lại layer đã build nếu lệnh và dữ liệu đầu vào không đổi, giúp build nhanh hơn. Học ở [buổi 10](../labs/week-05/session-10.md).
- **Continuous Delivery / Deployment**: Tự động hóa việc đưa bản build đã qua kiểm thử tới môi trường chạy (staging hoặc production). Học ở [buổi 19](../labs/week-10/session-19.md).
- **Control groups (cgroups)**: Tính năng kernel Linux giới hạn và đo tài nguyên (CPU, RAM) của một nhóm process; nền tảng cho giới hạn tài nguyên container. Học ở [buổi 7](../labs/week-04/session-07.md), [buổi 26](../labs/week-13/session-26.md).
- **Continuous Integration**: Mỗi lần push hoặc PR, hệ thống tự động build và test để phát hiện lỗi sớm. Học ở [buổi 15](../labs/week-08/session-15.md).
- **Cluster**: Tập hợp các máy (node) do Kubernetes quản lý như một hệ thống; trong khóa học là cluster kind chạy cục bộ. Học ở [buổi 21](../labs/week-11/session-21.md).
- **CMD**: Chỉ thị Dockerfile đặt lệnh mặc định khi chạy container; có thể bị ghi đè khi docker run. Học ở [buổi 9](../labs/week-05/session-09.md).
- **Commit**: Một điểm lưu trong lịch sử Git, gồm thay đổi, tác giả và thông điệp. Học ở [buổi 6](../labs/week-03/session-06.md).
- **Compose file (compose.yaml)**: File YAML mô tả các service, network, volume của một ứng dụng nhiều container. Học ở [buổi 13](../labs/week-07/session-13.md).
- **ConfigMap**: Đối tượng Kubernetes lưu cấu hình không bí mật (key-value) để đưa vào Pod qua biến môi trường hoặc file. Học ở [buổi 25](../labs/week-13/session-25.md).
- **Container**: Process được cô lập (namespace, cgroups) chạy từ một image; nhẹ hơn máy ảo vì dùng chung kernel. Học ở [buổi 7](../labs/week-04/session-07.md).
- **Container registry**: Nơi lưu và phân phối image, ví dụ Docker Hub hoặc GHCR. Học ở [buổi 10](../labs/week-05/session-10.md), [buổi 17](../labs/week-09/session-17.md).
- **kubectl context**: Bộ ba cluster, user, namespace mà kubectl đang trỏ tới; kind tạo context kind-tên. Học ở [buổi 21](../labs/week-11/session-21.md).
- **Control plane**: Thành phần điều khiển cluster (API server, scheduler, controller manager, etcd). Học ở [buổi 21](../labs/week-11/session-21.md).
- **Controller**: Vòng lặp trong Kubernetes liên tục đưa trạng thái thực tế về trạng thái mong muốn. Học ở [buổi 22](../labs/week-11/session-22.md).
- **CrashLoopBackOff**: Trạng thái Pod: container liên tục khởi động rồi thoát lỗi, kubelet chờ lâu dần giữa các lần thử. Học ở [buổi 28](../labs/week-14/session-28.md).
- **curl**: Công cụ dòng lệnh gửi HTTP request, dùng để kiểm tra API và health endpoint. Học ở [buổi 5](../labs/week-03/session-05.md).

## D

- **DaemonSet**: Workload đảm bảo mỗi node chạy một Pod (thường cho agent log, giám sát). Học ở [buổi 22](../labs/week-11/session-22.md).
- **Declarative (khai báo)**: Mô tả trạng thái mong muốn (YAML) thay vì liệt kê từng bước; Kubernetes tự thực hiện để đạt trạng thái đó. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Deployment**: Workload Kubernetes quản lý nhiều bản sao Pod giống nhau, hỗ trợ rolling update và rollback. Học ở [buổi 22](../labs/week-11/session-22.md).
- **DevOps**: Văn hóa và tập hợp thực hành phối hợp phát triển và vận hành để giao phần mềm nhanh, ổn định. Học ở [buổi 1](../labs/week-01/session-01.md).
- **dig**: Công cụ truy vấn DNS chi tiết. Học ở [buổi 5](../labs/week-03/session-05.md).
- **Domain Name System**: Hệ thống phân giải tên miền thành địa chỉ IP; trong Compose và Kubernetes còn dùng để tìm service theo tên. Học ở [buổi 5](../labs/week-03/session-05.md), [buổi 12](../labs/week-06/session-12.md), [buổi 24](../labs/week-12/session-24.md).
- **Docker Compose**: Công cụ chạy ứng dụng nhiều container từ một file compose.yaml bằng lệnh docker compose. Học ở [buổi 13](../labs/week-07/session-13.md).
- **Docker daemon (dockerd)**: Tiến trình nền thực hiện việc build, chạy và quản lý container theo yêu cầu của docker CLI. Học ở [buổi 7](../labs/week-04/session-07.md).
- **Docker Desktop**: Ứng dụng cài Docker trên Windows/macOS, tích hợp WSL2; cung cấp Docker Engine và Compose. Học ở [buổi 2](../labs/week-01/session-02.md), [buổi 7](../labs/week-04/session-07.md).
- **Docker Engine**: Thành phần cốt lõi của Docker gồm daemon, API và CLI. Học ở [buổi 7](../labs/week-04/session-07.md).
- **Dockerfile**: File văn bản gồm các chỉ thị mô tả cách build một image. Học ở [buổi 9](../labs/week-05/session-09.md).
- **.dockerignore**: File liệt kê những thứ không đưa vào build context (node_modules, .git, .env). Học ở [buổi 10](../labs/week-05/session-10.md).
- **Dry run**: Chạy thử không áp dụng thay đổi thật, ví dụ kubectl apply --dry-run=client. Học ở [buổi 23](../labs/week-12/session-23.md).

## E

- **End-to-end (E2E) test**: Kiểm thử toàn bộ luồng từ giao diện tới database, gần với người dùng thật. Học ở [buổi 17](../labs/week-09/session-17.md).
- **Endpoint**: Địa chỉ mà API cung cấp (như /health); trong Kubernetes, Endpoints là danh sách IP Pod đứng sau Service. Học ở [buổi 24](../labs/week-12/session-24.md).
- **ENTRYPOINT**: Chỉ thị Dockerfile đặt tiến trình cố định của container; CMD thường làm tham số cho nó. Học ở [buổi 9](../labs/week-05/session-09.md).
- **Environment variable (biến môi trường)**: Cặp tên-giá trị truyền cấu hình cho process, như DB_HOST hay DB_PASSWORD. Học ở [buổi 4](../labs/week-02/session-04.md), [buổi 9](../labs/week-05/session-09.md).
- **etcd**: Kho key-value của control plane, lưu toàn bộ trạng thái cluster. Học ở [buổi 21](../labs/week-11/session-21.md).
- **Exit code**: Số process trả về khi kết thúc; 0 là thành công, khác 0 là lỗi (137 thường là bị kill do hết RAM). Học ở [buổi 8](../labs/week-04/session-08.md).
- **EXPOSE**: Chỉ thị Dockerfile ghi chú cổng ứng dụng dùng; không tự publish cổng ra host. Học ở [buổi 9](../labs/week-05/session-09.md).

## G

- **GitHub Container Registry (ghcr.io)**: Registry image của GitHub, tích hợp quyền với repo và GITHUB_TOKEN. Học ở [buổi 17](../labs/week-09/session-17.md).
- **GitHub Actions**: Nền tảng CI/CD của GitHub chạy workflow khi có sự kiện trong repo. Học ở [buổi 15](../labs/week-08/session-15.md).
- **GITHUB_TOKEN**: Token tạm do GitHub cấp cho mỗi run, quyền được kiểm soát bằng khóa permissions. Học ở [buổi 19](../labs/week-10/session-19.md).
- **Graceful shutdown**: Dừng ứng dụng đúng cách: nhận SIGTERM, ngừng nhận request mới, hoàn tất việc đang làm rồi thoát. Học ở [buổi 8](../labs/week-04/session-08.md), [buổi 26](../labs/week-13/session-26.md).

## H

- **Health check**: Kiểm tra định kỳ xem dịch vụ còn khỏe không; trong Docker là HEALTHCHECK, trong Kubernetes là probe. Học ở [buổi 14](../labs/week-07/session-14.md), [buổi 26](../labs/week-13/session-26.md).

## I

- **Idempotent (bất biến khi lặp)**: Chạy lại nhiều lần vẫn cho cùng kết quả, như kubectl apply hoặc script triển khai tốt. Học ở [buổi 20](../labs/week-10/session-20.md).
- **Image**: Gói bất biến gồm filesystem và metadata dùng để tạo container, gồm nhiều layer. Học ở [buổi 7](../labs/week-04/session-07.md), [buổi 9](../labs/week-05/session-09.md).
- **ImagePullBackOff**: Trạng thái Pod: không tải được image (sai tên/tag, chưa nạp vào kind, thiếu quyền), kubelet thử lại với thời gian chờ tăng dần. Học ở [buổi 28](../labs/week-14/session-28.md).
- **imagePullPolicy**: Quy định khi nào kubelet tải image (Always, IfNotPresent, Never); ảnh hưởng tới image nạp bằng kind load. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Immutable infrastructure**: Không sửa trực tiếp server hay container đang chạy; muốn thay đổi thì build bản mới và thay thế. Học ở [buổi 9](../labs/week-05/session-09.md), [buổi 20](../labs/week-10/session-20.md).
- **Infrastructure as Code (IaC)**: Mô tả hạ tầng và cấu hình bằng file có thể lưu trong Git, review và tái tạo; Compose và manifest Kubernetes là ví dụ. Học ở [buổi 1](../labs/week-01/session-01.md), [buổi 13](../labs/week-07/session-13.md).
- **Ingress**: Tài nguyên Kubernetes định tuyến HTTP từ ngoài vào Service theo host và path, cần Ingress controller. Học ở [buổi 27](../labs/week-14/session-27.md).
- **Ingress controller**: Thành phần (như ingress-nginx) thực thi các quy tắc Ingress. Học ở [buổi 27](../labs/week-14/session-27.md).
- **Init container**: Container chạy xong trước khi container chính của Pod khởi động, thường dùng để chuẩn bị dữ liệu hoặc chờ dependency. Học ở [buổi 25](../labs/week-13/session-25.md).
- **Integration test**: Kiểm thử nhiều thành phần chạy cùng nhau, ví dụ API với database thật. Học ở [buổi 18](../labs/week-09/session-18.md).

## J

- **Job**: Một nhóm step chạy trên cùng một runner trong workflow GitHub Actions. Học ở [buổi 16](../labs/week-08/session-16.md).
- **Job (Kubernetes)**: Workload chạy Pod tới khi hoàn thành một tác vụ hữu hạn. Học ở [buổi 22](../labs/week-11/session-22.md).

## K

- **kind (Kubernetes IN Docker)**: Công cụ tạo cluster Kubernetes chạy trong container Docker, dùng cho học tập và kiểm thử. Học ở [buổi 21](../labs/week-11/session-21.md).
- **kubeconfig**: File cấu hình (mặc định `~/.kube/config`) chứa thông tin cluster, user, context cho kubectl. Học ở [buổi 21](../labs/week-11/session-21.md).
- **kubectl**: CLI điều khiển cluster Kubernetes thông qua API server. Học ở [buổi 23](../labs/week-12/session-23.md).
- **kubelet**: Agent chạy trên mỗi node, bảo đảm container của Pod chạy đúng mô tả. Học ở [buổi 21](../labs/week-11/session-21.md).
- **Kubernetes (K8s)**: Hệ thống điều phối container: lập lịch, tự phục hồi, mở rộng, cập nhật không gián đoạn. Học ở [buổi 21](../labs/week-11/session-21.md).

## L

- **Label**: Cặp key-value gắn vào tài nguyên Kubernetes để nhóm và chọn lọc. Học ở [buổi 23](../labs/week-12/session-23.md).
- **Layer**: Một lớp thay đổi filesystem trong image, tạo ra bởi mỗi chỉ thị như RUN hay COPY. Học ở [buổi 10](../labs/week-05/session-10.md).
- **Limits (giới hạn tài nguyên)**: Mức tối đa CPU/RAM container được dùng; vượt RAM sẽ bị OOMKilled. Học ở [buổi 26](../labs/week-13/session-26.md).
- **Liveness probe**: Kiểm tra container còn sống không; thất bại thì kubelet khởi động lại container. Học ở [buổi 26](../labs/week-13/session-26.md).
- **Load balancer**: Phân phối request tới nhiều bản sao dịch vụ; Service Kubernetes cân bằng tải giữa các Pod. Học ở [buổi 24](../labs/week-12/session-24.md).

## M

- **Manifest**: File YAML mô tả tài nguyên Kubernetes để kubectl apply. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Matrix (build matrix)**: Cấu hình GitHub Actions chạy cùng job với nhiều tổ hợp tham số, như nhiều phiên bản Node. Học ở [buổi 18](../labs/week-09/session-18.md).
- **Multi-stage build**: Dockerfile có nhiều stage để build ở stage này và chỉ chép kết quả sang image cuối, giúp image nhỏ và sạch. Học ở [buổi 10](../labs/week-05/session-10.md).

## N

- **Namespace (Kubernetes)**: Không gian tên logic chia cluster thành các vùng riêng; khóa học dùng namespace club. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Namespace (Linux)**: Tính năng kernel cô lập những gì process nhìn thấy (process, mạng, mount); cùng cgroups tạo nên container. Học ở [buổi 7](../labs/week-04/session-07.md).
- **Node**: Máy (thật hoặc ảo) trong cluster chạy Pod; với kind, mỗi node là một container Docker. Học ở [buổi 21](../labs/week-11/session-21.md).
- **NodePort**: Loại Service mở một cổng cố định trên mọi node. Học ở [buổi 24](../labs/week-12/session-24.md).
- **Non-root user**: Chạy container bằng user thường thay vì root để giảm rủi ro nếu bị khai thác. Học ở [buổi 10](../labs/week-05/session-10.md), [buổi 19](../labs/week-10/session-19.md).
- **npm ci**: Cài dependency đúng theo package-lock.json, sạch và tái lập được; thích hợp cho CI và Dockerfile. Học ở [buổi 10](../labs/week-05/session-10.md), [buổi 16](../labs/week-08/session-16.md).

## O

- **OOMKilled**: Container bị kernel dừng vì vượt giới hạn bộ nhớ (exit code 137). Học ở [buổi 26](../labs/week-13/session-26.md).
- **Orchestration**: Tự động hóa việc triển khai, mở rộng, phục hồi nhiều container; Kubernetes là hệ thống phổ biến nhất. Học ở [buổi 21](../labs/week-11/session-21.md).

## P

- **Pending**: Trạng thái Pod đã được tạo nhưng chưa chạy, thường do chưa lập lịch được hoặc chờ volume. Học ở [buổi 28](../labs/week-14/session-28.md).
- **Permissions (GitHub Actions)**: Khóa trong workflow giới hạn quyền của GITHUB_TOKEN; nên đặt tối thiểu. Học ở [buổi 19](../labs/week-10/session-19.md).
- **Permissions (quyền file)**: Quyền đọc, ghi, thực thi (rwx) cho user, group, others. Học ở [buổi 4](../labs/week-02/session-04.md).
- **PersistentVolume (PV)**: Tài nguyên lưu trữ trong cluster, tồn tại độc lập với vòng đời Pod. Học ở [buổi 27](../labs/week-14/session-27.md).
- **PersistentVolumeClaim (PVC)**: Yêu cầu lưu trữ của Pod; Kubernetes gắn PVC với một PV phù hợp. Học ở [buổi 27](../labs/week-14/session-27.md).
- **Pipeline**: Chuỗi các bước tự động từ commit tới triển khai (build, test, publish, deploy). Học ở [buổi 15](../labs/week-08/session-15.md).
- **Pod**: Đơn vị triển khai nhỏ nhất trong Kubernetes, gồm một hoặc nhiều container dùng chung mạng và volume. Học ở [buổi 21](../labs/week-11/session-21.md).
- **Port forwarding**: Chuyển một cổng trên máy bạn tới Pod hoặc Service (kubectl port-forward). Học ở [buổi 23](../labs/week-12/session-23.md).
- **Port mapping (publish)**: Gắn cổng host với cổng container bằng docker run -p host:container. Học ở [buổi 7](../labs/week-04/session-07.md), [buổi 11](../labs/week-06/session-11.md).
- **Probe**: Kiểm tra sức khỏe container do kubelet thực hiện: liveness, readiness, startup. Học ở [buổi 26](../labs/week-13/session-26.md).
- **Pull Request (PR)**: Đề nghị gộp nhánh trên GitHub, nơi diễn ra review và chạy CI. Học ở [buổi 6](../labs/week-03/session-06.md).

## R

- **Readiness probe**: Kiểm tra container sẵn sàng nhận lưu lượng chưa; thất bại thì Pod bị loại khỏi Service nhưng không bị restart. Học ở [buổi 26](../labs/week-13/session-26.md).
- **Rebase**: Viết lại lịch sử bằng cách dời các commit của nhánh lên điểm khác; không dùng trên nhánh dùng chung. Học ở [buổi 6](../labs/week-03/session-06.md).
- **ReplicaSet**: Controller giữ số lượng Pod như mong muốn; thường do Deployment tạo ra. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Requests (yêu cầu tài nguyên)**: Lượng CPU/RAM tối thiểu Pod cần để được lập lịch lên node. Học ở [buổi 26](../labs/week-13/session-26.md).
- **Restart policy**: Quy định Docker hoặc Kubernetes có khởi động lại container khi nó thoát hay không. Học ở [buổi 8](../labs/week-04/session-08.md), [buổi 14](../labs/week-07/session-14.md).
- **Rollback**: Quay về phiên bản trước khi bản mới gặp lỗi (kubectl rollout undo). Học ở [buổi 20](../labs/week-10/session-20.md), [buổi 23](../labs/week-12/session-23.md).
- **Rolling update**: Cập nhật dần từng Pod sang phiên bản mới để dịch vụ không gián đoạn. Học ở [buổi 22](../labs/week-11/session-22.md).
- **Root cause (nguyên nhân gốc)**: Nguyên nhân sâu xa gây ra lỗi, khác với triệu chứng nhìn thấy; mục tiêu của mọi bài troubleshooting. Học ở [buổi 8](../labs/week-04/session-08.md), [buổi 28](../labs/week-14/session-28.md).
- **Runner**: Máy thực thi job của GitHub Actions; ubuntu-latest là runner do GitHub cung cấp. Học ở [buổi 15](../labs/week-08/session-15.md).

## S

- **Scheduler**: Thành phần quyết định Pod chạy trên node nào dựa vào tài nguyên và ràng buộc. Học ở [buổi 21](../labs/week-11/session-21.md).
- **Secret**: Đối tượng Kubernetes lưu dữ liệu nhạy cảm (lưu dạng base64, đây chỉ là cách biểu diễn chứ không phải mã hóa nên cần kiểm soát quyền truy cập); khóa học dùng Secret club-secrets. Học ở [buổi 25](../labs/week-13/session-25.md).
- **Selector**: Biểu thức chọn tài nguyên theo label; Service dùng selector để tìm Pod. Học ở [buổi 23](../labs/week-12/session-23.md).
- **Service**: Địa chỉ ổn định và cân bằng tải cho một nhóm Pod; có thể gọi theo tên DNS. Học ở [buổi 24](../labs/week-12/session-24.md).
- **Service (Compose)**: Một thành phần trong compose.yaml, ví dụ frontend, backend, postgres. Học ở [buổi 13](../labs/week-07/session-13.md).
- **SIGKILL**: Tín hiệu buộc dừng process ngay lập tức, không thể bắt. Học ở [buổi 8](../labs/week-04/session-08.md).
- **SIGTERM**: Tín hiệu yêu cầu process dừng nhẹ nhàng; docker stop và Kubernetes gửi tín hiệu này trước. Học ở [buổi 8](../labs/week-04/session-08.md), [buổi 26](../labs/week-13/session-26.md).
- **Smoke test**: Kiểm tra nhanh sau triển khai để chắc chắn chức năng cốt lõi chạy, như gọi /health. Học ở [buổi 20](../labs/week-10/session-20.md).
- **Software supply chain (chuỗi cung ứng phần mềm)**: Toàn bộ mã, thư viện, công cụ và image dẫn tới sản phẩm; cần bảo vệ khỏi thành phần độc hại. Học ở [buổi 20](../labs/week-10/session-20.md).
- **SSH**: Giao thức truy cập từ xa an toàn, cũng dùng để xác thực với Git. Học ở [buổi 6](../labs/week-03/session-06.md).
- **StatefulSet**: Workload cho ứng dụng có trạng thái (như database), cho Pod danh tính và volume ổn định; trong khóa học dùng cho postgres. Học ở [buổi 27](../labs/week-14/session-27.md).

## T

- **Tag**: Nhãn gắn vào image (club-api:1.0.0) hoặc commit Git để đánh dấu phiên bản. Học ở [buổi 10](../labs/week-05/session-10.md).
- **Test pyramid**: Mô hình khuyên nhiều unit test, vừa phải integration test, ít E2E test. Học ở [buổi 17](../labs/week-09/session-17.md).
- **Troubleshooting**: Quy trình quan sát, giả thuyết, kiểm chứng để tìm và sửa lỗi. Học ở [buổi 8](../labs/week-04/session-08.md), [buổi 28](../labs/week-14/session-28.md).

## U

- **Unit test**: Kiểm thử một đơn vị nhỏ (hàm, module) tách biệt khỏi phần còn lại. Học ở [buổi 17](../labs/week-09/session-17.md).

## V

- **Volume**: Nơi lưu dữ liệu tồn tại ngoài vòng đời container; Docker named volume hoặc Kubernetes volume. Học ở [buổi 12](../labs/week-06/session-12.md).

## W

- **Workflow**: File YAML trong .github/workflows mô tả quy trình tự động của GitHub Actions. Học ở [buổi 15](../labs/week-08/session-15.md).
- **WSL2**: Windows Subsystem for Linux 2, chạy kernel Linux thật trong Windows; môi trường làm việc chính của khóa học. Học ở [buổi 2](../labs/week-01/session-02.md).

## Y

- **YAML**: Định dạng dữ liệu dựa trên thụt lề, dùng cho Compose, Kubernetes và GitHub Actions. Học ở [buổi 13](../labs/week-07/session-13.md).
