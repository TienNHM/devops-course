#!/usr/bin/env bash
# Dọn sạch kịch bản 01.
docker rm -f ts01-legacy-site ts01-web >/dev/null 2>&1 || true
echo "Đã dọn kịch bản 01."
