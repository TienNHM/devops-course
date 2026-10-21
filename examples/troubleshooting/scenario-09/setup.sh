#!/usr/bin/env bash
# Yêu cầu: cluster kind đang chạy và kubectl trỏ đúng cluster.
set -euo pipefail
cd "$(dirname "$0")"
kubectl apply -f deployment.yaml
echo "Đã dựng lỗi. Học viên chạy lệnh trong README.md."
