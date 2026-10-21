#!/usr/bin/env bash
cd "$(dirname "$0")"
docker compose down -v --remove-orphans
docker rmi ts03-api:broken >/dev/null 2>&1 || true
echo "Đã dọn kịch bản 03."
