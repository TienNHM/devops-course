#!/usr/bin/env bash
# Dựng lỗi: một container "cũ" đang chiếm sẵn port 28081 trên máy.
set -euo pipefail
docker rm -f ts01-legacy-site >/dev/null 2>&1 || true
docker run -d --name ts01-legacy-site -p 28081:80 nginx:1.27-alpine >/dev/null
echo "Đã dựng lỗi. Học viên chạy lệnh trong README.md."
