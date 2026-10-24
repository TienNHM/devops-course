# Contributing

Trang này dành cho người đóng góp và mentor. Học viên bắt đầu ở [Bắt đầu từ đây](curriculum/getting-started.md).

## Bắt đầu

| Bạn là | Đọc |
| --- | --- |
| Học viên | [curriculum/getting-started.md](curriculum/getting-started.md), [curriculum/syllabus.md](curriculum/syllabus.md), [resources/setup-guide.md](resources/setup-guide.md) |
| Mentor | [mentors/index.md](mentors/index.md), [curriculum/assessment.md](curriculum/assessment.md), [examples/troubleshooting-scenarios.md](examples/troubleshooting-scenarios.md) |
| Người mới, muốn đưa sản phẩm AI viết lên mạng nhanh | [vibe/](vibe/) (Vibe Deploy: Vercel, Netlify, Cloudflare, Supabase, Firebase) |
| Người muốn chạy thử app mẫu | [starter-project/](starter-project/) |

## Cấu trúc repository

| Thư mục | Nội dung |
| --- | --- |
| `curriculum/` | Bắt đầu từ đây, lộ trình (syllabus), chuẩn đầu ra, đánh giá |
| `slides/` | 8 bộ slide cho mentor chiếu trên lớp (outline) |
| `labs/week-XX/` | Hub tuần + 32 bài lab theo buổi |
| `assignments/` | Bài tập hàng tuần và capstone |
| `examples/` | Ví dụ Linux, Docker, Compose, Actions, Kubernetes; 10 tình huống lỗi |
| `starter-project/` | Club Management API mẫu (Node.js + PostgreSQL) |
| `vibe/` | Track Vibe Deploy cho người mới và người dùng AI agent |
| `mentors/` | Sổ tay mentor, kịch bản từng buổi, hướng dẫn chấm, đáp án (`walkthroughs/`), pilot, checklist mở khóa |
| `solutions/` | Ghi chú đáp án; `mentor-only/` nên chuyển sang repo private |
| `resources/` | Cài đặt, thuật ngữ, cheatsheet, sách, tài liệu |
| `templates/` | Template lab, assignment, project |

## Quyết định kỹ thuật

Windows 11 + WSL2 Ubuntu · Docker Desktop · kind · GitHub Actions + GHCR · Node.js + PostgreSQL.

## Nguyên tắc kỹ thuật

1. Không cài PostgreSQL trực tiếp lên máy cho lab Docker.
2. Không commit `.env`, password, token, private key.
3. Không dùng `latest` khi cần tái lập kết quả; pin phiên bản image.
4. Không mount Docker socket hoặc cấp quyền privileged tùy tiện.
5. Không chạy cluster nhiều node trên laptop RAM thấp nếu không cần.
6. Không đưa credentials cá nhân vào GitHub Actions.
7. Không dùng production data trong bài thực hành.

## Quy trình

- Mỗi thay đổi đi qua branch + Pull Request, ít nhất một reviewer.
- Lab và assignment viết theo `templates/`.
- Mọi lệnh trong lab phải chạy được trên Windows 11 + WSL2 + Docker Desktop.
- Pin phiên bản image/tool; không dùng `latest`.

## Quy tắc nội dung

- Một slide một ý chính.
- Mỗi lệnh có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi.
- Không commit secret, `.env`, dữ liệu thật.
- Đáp án công khai nằm trong `mentors/walkthroughs/`; đáp án chỉ dành cho mentor đặt ở `solutions/mentor-only/` của repo private.

## Kiểm thử starter project

```bash
cd starter-project/backend && npm ci && npm test
cd .. && cp .env.example .env && docker compose up -d --build
```

## Vai trò

Program Lead (1) · Technical Mentor (2) · Lab Assistant (2) · tỷ lệ 1 mentor : 6–8 học viên khi lab.
