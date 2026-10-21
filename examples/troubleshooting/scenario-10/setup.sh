#!/usr/bin/env bash
# Yêu cầu: cluster kind đang chạy (đặt KIND_CLUSTER nếu tên khác "kind"), kubectl, Docker.
set -euo pipefail
cd "$(dirname "$0")"
CLUSTER="${KIND_CLUSTER:-kind}"
docker build -q -t club-api:1.0.0 ../../../starter-project/backend
kind load docker-image club-api:1.0.0 --name "$CLUSTER"
kubectl apply -f deployment.yaml
echo "Đã dựng lỗi. Học viên chạy lệnh trong README.md."
