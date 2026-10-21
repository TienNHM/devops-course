#!/usr/bin/env bash
# Kịch bản 06 không tạo tài nguyên Docker. Xoá image kiểm thử cục bộ (nếu có).
docker rmi -f ts06-app:local >/dev/null 2>&1 || true
echo "Đã dọn kịch bản 06. Nhớ xoá workflow ts06.yml và package ts06-app (nếu đã tạo) trong repo cá nhân."
