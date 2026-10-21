#!/usr/bin/env bash
# Kiểm tra môi trường học DevOps trong WSL2 Ubuntu.
# Cách chạy:  bash resources/check-env.sh
# Mã thoát: 0 nếu không thiếu công cụ bắt buộc, 1 nếu có công cụ bắt buộc bị thiếu.

missing_required=0
warnings=0

ok()   { printf '[ OK    ] %-18s %s\n' "$1" "$2"; }
miss() { printf '[ THIEU ] %-18s %s\n' "$1" "$2"; }
warn() { printf '[ CANH BAO ] %-14s %s\n' "$1" "$2"; warnings=$((warnings + 1)); }

# check_tool <tên hiển thị> <lệnh> <bắt buộc: yes|no> <lệnh lấy phiên bản> <gợi ý cài>
check_tool() {
  local label="$1" cmd="$2" required="$3" vercmd="$4" hint="$5" ver
  if command -v "$cmd" >/dev/null 2>&1; then
    ver="$(eval "$vercmd" 2>/dev/null | head -n 1 | cut -c1-70)"
    ok "$label" "${ver:-(không đọc được phiên bản)}"
  else
    if [ "$required" = "yes" ]; then
      miss "$label" "$hint"
      missing_required=1
    else
      printf '[ THIEU ] %-18s (tùy chọn) %s\n' "$label" "$hint"
    fi
  fi
}

echo "== Hệ điều hành =="
if grep -qi microsoft /proc/version 2>/dev/null; then
  if [ -n "$WSL_DISTRO_NAME" ]; then
    ok "WSL" "đang chạy trong WSL (distro: $WSL_DISTRO_NAME)"
  else
    ok "WSL" "đang chạy trong WSL"
  fi
else
  warn "WSL" "không phát hiện WSL. Khóa học này giả định Windows 11 + WSL2 Ubuntu"
fi

if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  ok "Distro" "${PRETTY_NAME:-unknown}"
fi

# WSL1 không có kernel Linux thật; /proc/version của WSL2 chứa "WSL2"
if grep -qi 'wsl2' /proc/version 2>/dev/null; then
  ok "WSL phiên bản" "WSL2"
elif grep -qi microsoft /proc/version 2>/dev/null; then
  warn "WSL phiên bản" "có thể đang là WSL1. Chạy trong PowerShell: wsl -l -v, rồi wsl --set-version <tên distro> 2"
fi

echo
echo "== Tài nguyên =="
if [ -r /proc/meminfo ]; then
  mem_kb="$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)"
  mem_mb=$((mem_kb / 1024))
  swap_kb="$(awk '/^SwapTotal:/ {print $2}' /proc/meminfo)"
  swap_mb=$((swap_kb / 1024))
  ok "RAM cho WSL" "${mem_mb} MB (swap ${swap_mb} MB)"
  if [ "$mem_mb" -lt 2800 ]; then
    warn "RAM cho WSL" "dưới 3 GB: Docker/kind sẽ rất chật. Xem mục .wslconfig trong setup-guide"
  fi
fi
cpus="$(nproc 2>/dev/null)"
[ -n "$cpus" ] && ok "CPU" "${cpus} nhân logic"
free_gb="$(df -Pk "$HOME" 2>/dev/null | awk 'NR==2 {printf "%d", $4/1024/1024}')"
if [ -n "$free_gb" ]; then
  ok "Ổ đĩa trống" "${free_gb} GB tại $HOME"
  if [ "$free_gb" -lt 20 ]; then
    warn "Ổ đĩa trống" "dưới 20 GB: image và volume Docker có thể làm đầy đĩa"
  fi
fi

echo
echo "== Vị trí làm việc =="
case "$PWD" in
  /mnt/*) warn "Thư mục hiện tại" "đang ở $PWD (ổ Windows). Hãy làm việc trong ~/ để tránh chậm I/O" ;;
  *) ok "Thư mục hiện tại" "$PWD" ;;
esac

echo
echo "== Công cụ =="
check_tool "git"      git     yes "git --version"                          "sudo apt update && sudo apt install -y git"
check_tool "curl"     curl    yes "curl --version"                         "sudo apt install -y curl"
check_tool "docker"   docker  yes "docker --version"                       "cài Docker Desktop và bật WSL integration"
check_tool "kubectl"  kubectl yes "kubectl version --client"               "xem mục kubectl trong setup-guide"
check_tool "kind"     kind    yes "kind version"                           "xem mục kind trong setup-guide"
check_tool "node"     node    yes "node --version"                         "cài bằng nvm: nvm install 22"
check_tool "npm"      npm     yes "npm --version"                          "đi kèm Node.js"
check_tool "jq"       jq      no  "jq --version"                           "sudo apt install -y jq"
check_tool "gh"       gh      no  "gh --version"                           "GitHub CLI, xem setup-guide"
check_tool "psql"     psql    no  "psql --version"                         "sudo apt install -y postgresql-client"

echo
echo "== Docker =="
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    ok "docker compose" "$(docker compose version 2>/dev/null | head -n 1)"
  else
    miss "docker compose" "Compose v2 chưa sẵn sàng (lệnh: docker compose, có dấu cách)"
    missing_required=1
  fi
  if docker info >/dev/null 2>&1; then
    ok "docker daemon" "đang chạy ($(docker info --format 'Server {{.ServerVersion}}, {{.OperatingSystem}}' 2>/dev/null))"
  else
    err_out="$(docker info 2>&1 | tail -n 1)"
    miss "docker daemon" "không kết nối được: $err_out"
    echo "          Gợi ý: mở Docker Desktop, bật Settings > Resources > WSL integration cho distro này."
    echo "          Nếu thấy 'permission denied', xem docs troubleshooting-setup.md."
    missing_required=1
  fi
fi

echo
echo "== Git =="
gname="$(git config --global user.name 2>/dev/null)"
gmail="$(git config --global user.email 2>/dev/null)"
if [ -n "$gname" ] && [ -n "$gmail" ]; then
  ok "git user" "$gname <$gmail>"
else
  warn "git user" "chưa cấu hình. Chạy: git config --global user.name \"Tên\" và git config --global user.email \"email\""
fi
if ls "$HOME"/.ssh/id_*.pub >/dev/null 2>&1; then
  ok "SSH key" "có khóa công khai trong ~/.ssh"
else
  printf '[ GHI CHU ] %-16s chưa có SSH key (tùy chọn nếu dùng HTTPS + gh auth login)\n' "SSH key"
fi

echo
if [ "$missing_required" -eq 0 ]; then
  echo "KET QUA: đủ công cụ bắt buộc. Cảnh báo: $warnings"
  exit 0
else
  echo "KET QUA: còn THIEU công cụ bắt buộc. Xem các dòng [ THIEU ] ở trên. Cảnh báo: $warnings"
  exit 1
fi
