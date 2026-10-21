#!/usr/bin/env bash
# Prints CPU load, memory and disk usage; warns above thresholds (Week 2 challenge sample).
set -euo pipefail
MEM_LIMIT=${MEM_LIMIT:-85}
DISK_LIMIT=${DISK_LIMIT:-85}

mem=$(free | awk '/Mem:/ {printf "%d", $3/$2*100}')
disk=$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')
echo "load: $(cut -d' ' -f1-3 /proc/loadavg)"
echo "mem:  ${mem}%"
echo "disk: ${disk}%"
[ "$mem" -ge "$MEM_LIMIT" ] && echo "WARN: memory above ${MEM_LIMIT}%"
[ "$disk" -ge "$DISK_LIMIT" ] && echo "WARN: disk above ${DISK_LIMIT}%"
exit 0
