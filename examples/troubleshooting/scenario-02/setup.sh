#!/usr/bin/env bash
# Build image ts02-notes:broken. Học viên tự chạy container theo README.
set -euo pipefail
cd "$(dirname "$0")"
docker build -q -t ts02-notes:broken .
echo "Đã build ts02-notes:broken. Học viên chạy lệnh trong README.md."
