#!/usr/bin/env bash
docker rm -f ts02-notes >/dev/null 2>&1 || true
docker rmi -f ts02-notes:broken >/dev/null 2>&1 || true
echo "Đã dọn kịch bản 02."
