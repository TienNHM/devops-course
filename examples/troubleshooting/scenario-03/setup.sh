#!/usr/bin/env bash
# Dựng hệ thống lỗi: API (cổng 23003) + Postgres.
set -euo pipefail
cd "$(dirname "$0")"
docker compose up -d --build --wait postgres
docker compose up -d --build api
echo "Đã dựng lỗi. Học viên chạy lệnh trong README.md."
