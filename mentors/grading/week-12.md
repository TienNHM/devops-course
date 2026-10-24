# Chấm điểm tuần 12 – kubectl và Services

::: warning Dành cho mentor
Trang này dành cho người chấm, học viên không cần đọc. Đề bài: [Bài tập tuần 12](../../assignments/weekly/week-12.md). Đáp án và bằng chứng cần thấy: [Walkthrough tuần 12](../walkthroughs/week-12.md). Kịch bản dạy: [Buổi 23](../sessions/session-23.md), [Buổi 24](../sessions/session-24.md).
:::

> **Tóm tắt:** Barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp cho bài tập tuần 12 (notice-board, Service, DNS, hai tình huống lỗi).

## Barem chấm

Nguyên văn từ đề bài. Tổng 100 điểm, cộng tối đa 10 điểm L2.

| Tiêu chí | Đạt | Không đạt | Điểm |
| --- | --- | --- | --- |
| Nhiệm vụ 1: Manifest và rollout | Manifest tự viết, đủ probe và resources, đúng nhãn, 3/3 Ready, apply lần hai `unchanged` | Thiếu probe hoặc nhãn sai, Pod không Ready, không có bằng chứng idempotent | 15 |
| Nhiệm vụ 2: Quan sát và truy cập | Đủ bốn phần trong `inspect.txt`, jsonpath gọn, có log request `200` qua cổng 8082 | Thiếu phần, output dán từ nguồn khác, không có log request | 15 |
| Nhiệm vụ 3: Điều tra image sai | Tái hiện được lỗi, có Events, chứng minh Pod cũ còn chạy, khôi phục và diff sạch | Chỉ nêu kết luận không có lệnh, không khôi phục, Git khác cluster | 15 |
| Nhiệm vụ 4: Service và DNS | Service đúng cổng, 3 endpoints cổng 80, ba tên DNS cùng ClusterIP, `curl` 200 | `targetPort` sai, thiếu bằng chứng DNS, ClusterIP không khớp | 20 |
| Nhiệm vụ 5: Điều tra Endpoints rỗng | Có ba thời điểm `get endpoints`, so sánh selector với nhãn, nguyên nhân gốc đúng, đã sửa | Thiếu điều tra từng bước, chỉ sửa mà không giải thích, không sửa file nguồn | 20 |
| Chất lượng nộp bài | README đủ 7 câu, cấu trúc thư mục đúng, chạy lại được, không secret, PR có review | Thiếu mục, cấu trúc sai, có thông tin nhạy cảm | 10 |
| Câu hỏi kiểm tra kiến thức | Trả lời đúng ý và bằng lời của mình | Sao chép đề lab, sai khái niệm | 5 |
| Tổng | | | 100 |
| Điểm thưởng L2 | Script đúng ba tình huống; gọi chéo namespace có giải thích; bảng so sánh có bằng chứng | Thiếu mã thoát, thiếu kết quả thất bại | tối đa +10 |

Quy định: nếu có secret hoặc kubeconfig trong repo, bài bị trừ toàn bộ phần "Chất lượng nộp bài" và phải xóa khỏi lịch sử trước khi chấm lại.

## Lỗi hay bị trừ điểm

- Chạy lệnh ở sai namespace (quên `-n club-dev`) rồi kết luận "workload mất".
- Dán screenshot thay cho output text, hoặc output không có dòng lệnh đi kèm.
- `port-forward` trên cổng 8080 hoặc 8081 đã bị chiếm, dẫn tới `address already in use`; đề yêu cầu dùng 8082.
- Để selector Service và nhãn Pod lệch nhau, không kiểm tra `get endpoints` sau khi apply.
- Nhầm `port`, `targetPort` và `containerPort`; dùng `targetPort: 8080` trong khi nginx nghe cổng 80.
- Sửa lỗi bằng `kubectl edit` hoặc `patch` mà không cập nhật manifest, khiến Git và cluster lệch nhau.
- Dùng tag `latest` hoặc quên pin phiên bản image.
- File lỗi nằm chung thư mục với manifest chính và bị `apply -f` cả thư mục.
- Không dọn tài nguyên thử nghiệm (Pod debug, namespace `lab24-x`).
- Commit `~/.kube/config`, token hay file `.env`.

## Lệnh kiểm tra nhanh

Chạy trên máy học viên hoặc trên cluster có đủ tài nguyên nộp (đổi đường dẫn theo repo của học viên):

```bash
kubectl get deployment notice-board -n club-dev
kubectl get pods -n club-dev -l app=notice-board,tier=web
kubectl get endpoints notice-board -n club-dev
kubectl get svc notice-board -n club-dev
kubectl diff -f lab-23/source/notice-board.yaml && echo "no drift"
kubectl diff -f lab-24/source/notice-board-svc.yaml && echo "no drift"
kubectl apply -f lab-23/source/ --dry-run=server
```

Điều cần thấy: `READY 3/3`, đúng 3 Pod `Running`, `get endpoints` có đúng 3 địa chỉ cổng `80`, `CLUSTER-IP` khớp ClusterIP trong evidence `nslookup`, hai lệnh `diff` in `no drift`, và `apply --dry-run=server` không báo lỗi (chứng minh manifest chạy từ thư mục sạch).

Gợi ý chấm nhanh (từ walkthrough):

- Đối chiếu ClusterIP, tên Pod và IP giữa các file evidence: những giá trị này phải nhất quán trong cùng một lần làm; không nhất quán là dấu hiệu bài ghép hoặc tự gõ.
- Kiểm tra `kubectl diff` sạch: học viên có thể chạy lại trên máy của mình với repo đã nộp.
- Điểm L2 chỉ tính khi L1 từ 70: thử thách A cần ba lần chạy kèm mã thoát; thử thách B cần cả lần thất bại và thành công kèm `resolv.conf`; thử thách C cần bảng so sánh có lệnh thật.
- Lưu ý khi chấm bài làm trong `source/`: nếu `exported.yaml` hay file lỗi nằm cạnh `notice-board.yaml`, thì `kubectl apply -f lab-23/source/` sẽ áp dụng cả chúng; đây là một lý do đề yêu cầu `broken/`.

## Dấu hiệu bài chép hoặc không hiểu, và câu hỏi vấn đáp

Nguyên văn từ hướng dẫn chấm trong walkthrough, bổ sung bằng chứng cần thấy ở [Walkthrough tuần 12](../walkthroughs/week-12.md).

| Tiêu chí | Dấu hiệu bài chép hoặc không hiểu | Câu hỏi vấn đáp |
| --- | --- | --- |
| NV1: manifest và rollout (15) | Manifest giống `demo-web.yaml` chỉ đổi tên, vẫn `namespace: club`; thiếu `tier: web`; không có bằng chứng `unchanged` | Idempotent là gì? Vì sao `selector` phải khớp nhãn template? Nếu bỏ readinessProbe thì rollout khác gì? |
| NV2: quan sát và truy cập (15) | Tên Pod hoặc IP trong `inspect.txt` không khớp với `get pods`; log không có `HEAD` hoặc `GET` do curl; dùng cổng 8080 | Vì sao log chỉ ở một trong ba Pod? Vì sao phải lọc `kube-probe`? Khi nào dùng `-o jsonpath` thay cho `-o yaml`? |
| NV3: điều tra image sai (15) | Dùng đúng `nginx:1.99-nope` của lab; chỉ ghi "sai tag"; bỏ bước sửa Git; `undo` nhưng manifest vẫn còn tag lỗi | Vì sao dịch vụ chưa sập? Nếu `maxUnavailable` là 100% thì sao? Vì sao đặt file lỗi ở `broken/`? |
| NV4: Service và DNS (20) | `targetPort: 8080`; ClusterIP trong nslookup khác `get svc` (bài ghép từ nhiều lần chạy); giải thích ba cổng chung chung | Gọi `notice-board:80` có được không và vì sao? ClusterIP có tồn tại trên node nào không? Điều gì đổi khi Pod bị tạo lại? |
| NV5: Endpoints rỗng (20) | Dùng lại selector `club-apii` của lab; sửa bằng `patch` mà file còn sai; thiếu bước từ ngoài vào trong | Vì sao Nginx hoặc client nhận lỗi dù Pod `Running`? Selector đúng nhưng Endpoints vẫn rỗng thì kiểm tra gì? Phân biệt với `targetPort` sai thế nào? |
| Chất lượng nộp bài (10) | Thiếu mục, `~/.kube/config` trong repo (trừ toàn bộ phần này) | Chạy lại từ đầu cần những lệnh nào theo thứ tự? |
| Câu hỏi kiến thức (5) | Chép nguyên đề hoặc đáp án lab; sai khái niệm (ví dụ cho rằng Pod fail readiness bị restart) | Bảo học viên giải thích lại câu 4 bằng ví dụ khác |

## Lưu ý về phạm vi chấm

Hai lab của tuần dùng `demo-web` (buổi 23) và Service `backend` của starter-project (buổi 24) nên không chấm; chỉ chấm bài tập tuần với workload `notice-board`. Nếu học viên nộp bằng chứng của lab thay vì `notice-board`, đó là dấu hiệu chép: yêu cầu làm lại đúng tên trong bảng thông số của đề.
