# Kịch bản mentor – Buổi 01: DevOps Introduction

::: warning Dành cho mentor
Trang này dành cho người dạy, học viên không cần đọc. Bài học viên: [Buổi 01 – DevOps Introduction](../../labs/week-01/session-01.md). Slide: [Slide Buổi 01 – DevOps Introduction](../../slides/01-foundation/session-01.md). Đáp án và barem: [Đáp án Tuần 1](../walkthroughs/week-01.md), [Hướng dẫn chấm Tuần 1](../grading/week-01.md).
:::

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi đầu của tuần dành nhiều thời gian hơn cho khái niệm và demo; buổi thứ hai dồn vào thực hành, thử thách L2 và review bài làm.

Phân bổ 60 phút lab của Buổi 01: 10 phút bảng `steps.md`, 15 phút sơ đồ thủ công, 10 phút điểm nghẽn, 15 phút sơ đồ tự động, 10 phút bằng chứng. Đi vòng kiểm tra bảng "ai, đầu vào, đầu ra" vì đó là chỗ học viên làm qua loa nhất.

## Lưu ý riêng cho người dạy

- Buổi 01 chưa dạy Git. Học viên nộp bằng upload trên web GitHub hoặc làm theo mục "Git trong 10 phút" của [Bắt đầu từ đây](../../curriculum/getting-started.md). Không bắt buộc `git push` ở buổi này.
- Nói rõ buổi này chưa cài gì; chỉ cần tài khoản GitHub và repo `devops-labs` để PUBLIC.
- Lệnh lab chạy trong Git Bash hoặc WSL, không dùng PowerShell. Nếu có học viên chưa mở được terminal, cho xem [Terminal 101](../../resources/terminal-101.md).
- Phần "Phá lỗi nâng cao" và thử thách L2 của học viên nằm ở [Buổi 01 – Thử thách thêm](../../labs/week-01/session-01-challenge.md). Lời giải L2 mẫu nằm trong [Đáp án Tuần 1](../walkthroughs/week-01.md).

## Demo của mentor

Mục tiêu demo (khoảng 10 phút): cho lớp thấy chi phí của quy trình thủ công và cách một sơ đồ làm lộ điểm nghẽn.

1. Mentor mở slide và kể lại tình huống Nam và Lan. Hỏi lớp: "Bước nào dễ sai nhất? Ai biết bước đó?"
2. Mentor tạo thư mục demo và file sơ đồ đầu tiên:

```bash
mkdir -p ~/demo-lab-01 && cd ~/demo-lab-01
cat > workflow.mmd <<'EOF'
flowchart LR
    A["Dev viết code"] --> B["Nén thư mục"]
    B --> C["Ops giải nén trên server"]
    C --> D["Chạy ứng dụng"]
EOF
cat workflow.mmd
```

Kết quả mong đợi:

```text
flowchart LR
    A["Dev viết code"] --> B["Nén thư mục"]
    B --> C["Ops giải nén trên server"]
    C --> D["Chạy ứng dụng"]
```

3. Dán nội dung này vào mermaid.live để cả lớp thấy sơ đồ được vẽ ra từ văn bản. Điểm cần nhấn mạnh: sơ đồ là text, nằm trong Git, review được. Đây là tư duy "as code" đầu tiên của khóa học.
4. Mentor commit sơ đồ, thêm một dòng (ví dụ bước "Chạy test") rồi xem thay đổi bằng Git:

```bash
git init -q
git add workflow.mmd
git -c user.name=demo -c user.email=demo@example.com commit -q -m "Add manual workflow"
echo '    D --> E["Chạy test"]' >> workflow.mmd
git diff --stat
git log --oneline
```

Kết quả mong đợi (mã commit sẽ khác):

```text
 workflow.mmd | 1 +
 1 file changed, 1 insertion(+)
3f2a9c1 Add manual workflow
```

Điểm cần nhấn mạnh: `git diff` cho thấy đúng dòng nào thay đổi, đó là lợi ích của việc để sơ đồ dưới dạng text.

## Câu hỏi mentor nên hỏi lớp

- Sơ đồ này thiếu thông tin gì? (Gợi ý: không có bước kiểm thử, không có người chịu trách nhiệm, không có đầu vào và đầu ra.)
- Nếu server cài Node.js bản cũ hơn, bước nào phát hiện ra lỗi?
- Nếu deploy 10 lần một ngày, bước nào bạn muốn giao cho máy?

## Ghi chú giảng viên theo slide

Số slide theo [Slide Buổi 01 – DevOps Introduction](../../slides/01-foundation/session-01.md) (bản thu gọn, 14 slide).

**Slide 1 – Mục tiêu buổi học.** Mở buổi trong 2 phút. Nói rõ buổi này chưa cài gì, chỉ cần Git và một repo trống tên `devops-labs`. Hỏi lớp: ai đã từng "gửi file zip qua Zalo cho bạn chạy thử"?

**Slide 2 – Vấn đề "chạy được trên máy tôi" và gốc rễ.**

- Kể câu chuyện khoảng 2 phút, giọng thật. Câu hỏi cho lớp: bước nào dễ sai nhất, và ai biết bước đó? Chờ 2 đến 3 câu trả lời trước khi sang slide sau.
- Nhấn mạnh: code của Nam không sai. Câu hỏi: nếu Nam nghỉ học thì ai biết cách deploy? Dẫn sang khái niệm tribal knowledge, sẽ gặp lại ở phần Phá lỗi.

**Slide 3 – SDLC.** Đi nhanh một vòng, 2 phút. Điểm cần nói: hiện đại là vòng lặp, phản hồi từ Operate quay về Plan. Waterfall chỉ đi một chiều.

**Slide 4 – Dev và Ops.** Hỏi lớp: nếu bạn là Ops và nhận 10 bản code mỗi ngày không có test, bạn phản ứng thế nào? Dẫn tới việc "ops tham gia từ sớm, dev hiểu cách chạy thật".

**Slide 5 – Văn hóa DevOps.** Hỏi: DevOps là chức danh hay văn hóa? Nhiều bạn sẽ trả lời "DevOps là Docker". Sửa nhẹ nhàng: Docker là công cụ, văn hóa mới là gốc.

**Slide 6 – CI, Continuous Delivery, Continuous Deployment.** Đây là slide học viên hay nhầm nhất, dành 3 phút. Ví dụ: nút "Approve" trong workflow là Delivery; merge xong tự lên production là Deployment. Hỏi lại cuối buổi.

**Slide 7 – Infrastructure as Code.** Chưa đi sâu cú pháp, chỉ cho thấy hạ tầng có thể là một file. Câu hỏi: nếu server hỏng, bạn dựng lại từ trí nhớ hay từ file?

**Slide 8 – Sơ đồ quy trình thủ công.** Chỉ vào vòng lặp lỗi. Hỏi: bước nào phụ thuộc trí nhớ của một người? Bước nào chờ người khác?

**Slide 9 – Sơ đồ quy trình tự động và cách hoạt động.**

- Đây là đích đến của 16 tuần. Mỗi hộp là một buổi hoặc một cụm buổi. Không cần giải thích công cụ ở đây.
- Mỗi dòng gắn với một điểm đau ở sơ đồ thủ công. Hỏi lớp: dòng nào giải quyết lỗi "thiếu biến môi trường"? (Gợi ý: IaC và health check.)

**Slide 10 – Demo: sơ đồ là text và git diff.**

- Khoảng 4 phút cho phần sơ đồ. Nhấn mạnh: sơ đồ nằm trong Git, review được, đây là tư duy "as code" đầu tiên. Câu hỏi: sơ đồ này thiếu thông tin gì?
- Khoảng 3 phút cho phần `git diff`. Nếu Git báo "Author identity unknown", dùng `-c user.name` như trong demo hoặc cấu hình ở bài lab. Câu hỏi: nếu deploy 10 lần một ngày, bước nào muốn giao cho máy?

**Slide 11 – Lab L1 và L2.**

- L1: phân bổ 60 phút như ở phần Khung thời gian. Đi vòng kiểm tra bảng "ai, đầu vào, đầu ra".
- L2: gợi ý cho học viên bắt đầu từ câu "lần deploy gần nhất mất bao lâu và vì sao". Chọn giải pháp nhỏ nhất giải được vấn đề, ví dụ một workflow chạy test mỗi lần push.

**Slide 12 – Lỗi thường gặp và phá lỗi.**

- Mermaid: cho học viên tự phá lỗi này trong 3 phút. Cách điều tra: đọc số dòng báo lỗi, xóa từng dòng gần đó, kiểm tra ký tự đặc biệt.
- Git: nhắc không dán token vào bất kỳ file nào trong repo. Nếu push cần đăng nhập, dùng Git Credential Manager hoặc đợi sau Buổi 02 khi có SSH key.
- Hoạt động 5 phút theo cặp (đưa sơ đồ cho bạn cùng bàn "triển khai"): kết luận kiến thức nằm trong đầu một người là rủi ro, đưa nó vào Git là bước đầu của IaC.

**Slide 13 – Challenge.** Cho lớp 2 phút tính, rồi mở gợi ý. Mở rộng: sau khi tự động, cần đo gì để chứng minh cải thiện?

**Slide 14 – Recap.** Hỏi nhanh 3 câu để chốt: DevOps có phải chức danh không? Delivery khác Deployment ở đâu? IaC giải quyết vấn đề gì? Nhắc hạn nộp `lab-01/`.
