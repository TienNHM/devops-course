#!/usr/bin/env bash
docker rm -f ts05-api >/dev/null 2>&1 || true
docker rmi -f ts05-api:1.0.0 >/dev/null 2>&1 || true
echo "Đã dọn kịch bản 05."
