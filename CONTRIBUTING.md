# Contributing

## Quy trình
- Mỗi thay đổi đi qua branch + Pull Request, ít nhất một reviewer.
- Lab và assignment viết theo `templates/`.
- Mọi lệnh trong lab phải chạy được trên Windows 11 + WSL2 + Docker Desktop.
- Pin phiên bản image/tool; không dùng `latest`.

## Quy tắc nội dung
- Một slide một ý chính.
- Mỗi lệnh có ví dụ đầu vào, kết quả mong đợi và tình huống lỗi.
- Không commit secret, `.env`, dữ liệu thật.
- Đáp án chỉ đặt trong `solutions/` của repo mentor private.

## Kiểm thử starter project
```bash
cd starter-project/backend && npm ci && npm test
cd .. && cp .env.example .env && docker compose up -d --build
```

## Vai trò
Program Lead (1) · Technical Mentor (2) · Lab Assistant (2) · tỷ lệ 1 mentor : 6–8 học viên khi lab.
