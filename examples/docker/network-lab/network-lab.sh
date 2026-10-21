#!/usr/bin/env bash
# Thực hành user-defined network: hai container giao tiếp với nhau bằng tên.
# Cách dùng: ./network-lab.sh up | test | down
set -euo pipefail

NET="dsc-net"
SERVER="dsc-web"
IMAGE="nginx:1.27-alpine"
CLIENT_IMAGE="alpine:3.20"

up() {
  docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET"
  docker rm -f "$SERVER" >/dev/null 2>&1 || true
  docker run -d --name "$SERVER" --network "$NET" "$IMAGE" >/dev/null
  echo "Đã tạo network ${NET} và container ${SERVER} (không publish cổng nào ra host)."
}

test_it() {
  echo "== 1. Từ client trong CÙNG network, gọi bằng tên container"
  docker run --rm --network "$NET" "$CLIENT_IMAGE" wget -qO- "http://${SERVER}/" | head -n 4
  echo
  echo "== 2. Từ client ở network mặc định (bridge): không phân giải được tên"
  if docker run --rm "$CLIENT_IMAGE" wget -T 3 -qO- "http://${SERVER}/" >/dev/null 2>&1; then
    echo "Bất ngờ: gọi được. Kiểm tra lại cấu hình."
  else
    echo "Thất bại như dự kiến: bridge mặc định không có DNS theo tên container."
  fi
  echo
  echo "== 3. Container ${SERVER} có publish cổng ra host không?"
  docker port "$SERVER" || true
  echo "(không in gì nghĩa là không có cổng nào được publish)"
}

down() {
  docker rm -f "$SERVER" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  echo "Đã dọn dẹp."
}

case "${1:-}" in
  up) up ;;
  test) test_it ;;
  down) down ;;
  *) echo "Cách dùng: $0 {up|test|down}"; exit 2 ;;
esac
