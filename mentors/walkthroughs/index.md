# Walkthrough: hướng dẫn giải 16 tuần

> **Tóm tắt:** Mục lục các walkthrough của khóa DevOps, gồm đáp án gợi ý cho lab, bài tập tuần và hướng dẫn chấm, chỉ đọc sau khi đã tự làm.

::: warning Dành cho mentor
Đây là đáp án của khóa: mentor dùng để đối chiếu khi chấm; học viên chỉ xem sau khi đã nộp bài của tuần đó.
:::

## Cảnh báo: tự làm trước khi đọc

::: danger Học viên chỉ xem sau khi nộp bài
Đọc đáp án trước khi tự làm sẽ lấy mất phần học quan trọng nhất. Mentor nhắc học viên mở trang này sau khi đã nộp bài của tuần tương ứng (hub tuần có mục "Đối chiếu đáp án").
:::

Walkthrough chỉ nên mở sau khi tuần học đã kết thúc và bạn đã nộp bài. Hãy tự làm lab và bài tập, tự gặp lỗi và tự gỡ lỗi trước. Đọc đáp án quá sớm sẽ lấy mất phần học quan trọng nhất của DevOps: điều tra và chẩn đoán.

- Dùng walkthrough để đối chiếu cách tiếp cận, không chép lệnh hay kết quả. Evidence nộp phải là output thật từ máy của bạn.
- Mentor sẽ hỏi vấn đáp về bài bạn nộp. Bài chép đáp án thường không giải thích được vì sao chọn cách đó.
- Một vấn đề thường có nhiều cách giải đúng. Cách khác với walkthrough chưa chắc là sai.
- Tuần 15 và 16 (capstone) chỉ có hướng tiếp cận, checklist và câu hỏi bảo vệ, không có mã nguồn đáp án.

## Mục lục

| Tuần | Walkthrough | Buổi |
| --- | --- | --- |
| 1 | [DevOps Workflow và môi trường phát triển](./week-01.md) | 01, 02 |
| 2 | [Linux Essentials](./week-02.md) | 03, 04 |
| 3 | [Networking và Git Collaboration](./week-03.md) | 05, 06 |
| 4 | [Docker Basics](./week-04.md) | 07, 08 |
| 5 | [Dockerfile và Image Optimization](./week-05.md) | 09, 10 |
| 6 | [Networking và Persistent Storage](./week-06.md) | 11, 12 |
| 7 | [Docker Compose](./week-07.md) | 13, 14 |
| 8 | [CI/CD Fundamentals và GitHub Actions](./week-08.md) | 15, 16 |
| 9 | [Automated Testing & Docker CI](./week-09.md) | 17, 18 |
| 10 | [CD & Pipeline Security](./week-10.md) | 19, 20 |
| 11 | [Kubernetes Setup và Workloads](./week-11.md) | 21, 22 |
| 12 | [kubectl và Services](./week-12.md) | 23, 24 |
| 13 | [Configuration, Resources & Health](./week-13.md) | 25, 26 |
| 14 | [Storage, Ingress & Operations](./week-14.md) | 27, 28 |
| 15 | [Capstone: lập kế hoạch và triển khai](./week-15.md) | 29, 30 |
| 16 | [Capstone: kiểm thử, gỡ lỗi và bảo vệ](./week-16.md) | 31, 32 |

## Cấu trúc mỗi walkthrough

Mỗi file gồm lời giải theo từng buổi (đáp án L1, lời giải L2, phần phá lỗi, hiểu lầm thường gặp), gợi ý lời giải bài tập tuần và hướng dẫn chấm dành cho mentor. Đề bài gốc nằm ở [các hub tuần](../../labs/week-01/README.md) (thư mục `labs/`) và [bài tập tuần](../../assignments/weekly/week-01.md) (thư mục `assignments/weekly/`). Barem chấm chi tiết nằm ở [Mentor: chấm bài tuần 01](../grading/week-01.md) và các tuần sau, kịch bản dạy từng buổi nằm ở [Mentor: kịch bản buổi 01](../sessions/session-01.md).
