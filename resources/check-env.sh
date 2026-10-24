#!/usr/bin/env bash
# Kiểm tra môi trường học DevOps trong WSL2 Ubuntu.
# Cách chạy:
#   bash resources/check-env.sh        kiểm tra đủ bộ cho cả khóa học
#   bash resources/check-env.sh 2      chỉ đòi những gì cần tới buổi 2 (WSL, git, curl)
#   bash resources/check-env.sh 7      cần tới buổi 7 (thêm Docker; dùng cho các buổi 7 đến 20, ví dụ 9 và 13)
#   bash resources/check-env.sh 21     cần tới buổi 21 (thêm kubectl, kind)
# Script chỉ ĐỌC thông tin, không cài gì, không sửa gì, không cần quyền quản trị.
# Mã thoát: 0 nếu không thiếu công cụ bắt buộc (theo mốc buổi đã chọn), 1 nếu còn thiếu.

# Mốc buổi: mặc định 32 = kiểm tra tất cả. Công cụ cần ở buổi sau mốc này chỉ hiện "DE SAU".
stage="${1:-32}"
case "$stage" in
  ''|*[!0-9]*) echo "Cách dùng: bash resources/check-env.sh [số buổi, ví dụ 2, 7, 21]"; exit 2 ;;
esac

missing_required=0
warnings=0

ok()   { printf '[ OK    ] %-18s %s\n' "$1" "$2"; }
miss() { printf '[ THIEU ] %-18s %s\n' "$1" "$2"; }
warn() { printf '[ CANH BAO ] %-14s %s\n' "$1" "$2"; warnings=$((warnings + 1)); }

# check_tool <tên hiển thị> <lệnh> <cần từ buổi: số, hoặc no = tùy chọn> <lệnh lấy phiên bản> <gợi ý cài>
check_tool() {
  local label="$1" cmd="$2" need="$3" vercmd="$4" hint="$5" ver
  if command -v "$cmd" >/dev/null 2>&1; then
    ver="$(eval "$vercmd" 2>/dev/null | head -n 1 | cut -c1-70)"
    ok "$label" "${ver:-(không đọc được phiên bản)}"
  else
    if [ "$need" != "no" ] && [ "$stage" -ge "$need" ]; then
      miss "$label" "$hint"
      missing_required=1
    elif [ "$need" != "no" ]; then
      printf '[ DE SAU ] %-18s chưa cần ngay, cài khi tới buổi %s. %s\n' "$label" "$need" "$hint"
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
# Số thứ ba là buổi bắt đầu cần công cụ đó (khớp bảng "Cài gì, khi nào" trong setup-guide.md).
check_tool "git"      git     2   "git --version"                          "sudo apt update && sudo apt install -y git"
check_tool "curl"     curl    2   "curl --version"                         "sudo apt install -y curl"
check_tool "docker"   docker  7   "docker --version"                       "cài Docker Desktop và bật WSL integration (setup-guide.md)"
check_tool "kubectl"  kubectl 21  "kubectl version --client"               "xem mục kubectl trong setup-guide.md"
check_tool "kind"     kind    21  "kind version"                           "xem mục kind trong setup-guide.md"
check_tool "node"     node    no  "node --version"                         "chỉ cần nếu chạy test ngoài container: nvm install 22 (buổi 9)"
check_tool "npm"      npm     no  "npm --version"                          "đi kèm Node.js"
check_tool "jq"       jq      no  "jq --version"                           "sudo apt install -y jq"
check_tool "gh"       gh      no  "gh --version"                           "GitHub CLI, xem setup-github.md"
check_tool "psql"     psql    no  "psql --version"                         "sudo apt install -y postgresql-client"

echo
echo "== Docker =="
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    ok "docker compose" "$(docker compose version 2>/dev/null | head -n 1)"
  elif [ "$stage" -ge 7 ]; then
    miss "docker compose" "Compose v2 chưa sẵn sàng (lệnh: docker compose, có dấu cách)"
    missing_required=1
  fi
  if docker info >/dev/null 2>&1; then
    ok "docker daemon" "đang chạy ($(docker info --format 'Server {{.ServerVersion}}, {{.OperatingSystem}}' 2>/dev/null))"
  elif [ "$stage" -ge 7 ]; then
    err_out="$(docker info 2>&1 | tail -n 1)"
    miss "docker daemon" "không kết nối được: $err_out"
    echo "          Gợi ý: mở Docker Desktop, bật Settings > Resources > WSL integration cho distro này."
    echo "          Nếu thấy 'permission denied', xem troubleshooting-setup.md (mục Docker)."
    missing_required=1
  else
    printf '[ DE SAU ] %-18s chưa cần ngay (Docker dùng từ buổi 7)\n' "docker daemon"
  fi
else
  printf '[ DE SAU ] %-18s Docker Desktop cài ở buổi 7\n' "docker"
fi

echo
echo "== Kubernetes =="
if command -v kubectl >/dev/null 2>&1; then
  ctx="$(kubectl config current-context 2>/dev/null)"
  if [ "$ctx" = "kind-club" ]; then
    ok "kubectl context" "kind-club"
  elif [ "$stage" -ge 21 ]; then
    warn "kubectl context" "đang là '${ctx:-chưa có}', cần kind-club. Tạo cluster ở buổi 21: kind create cluster --name club --config ..."
  else
    printf '[ DE SAU ] %-18s context kind-club tạo ở buổi 21 (hiện: %s)\n' "kubectl context" "${ctx:-chưa có}"
  fi
else
  printf '[ DE SAU ] %-18s kubectl cài ở buổi 21\n' "kubectl"
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
  printf '[ GHI CHU ] %-16s chưa có SSH key (làm theo setup-github.md, hoặc dùng HTTPS + gh auth login)\n' "SSH key"
fi

echo
echo "Chú giải: OK = đạt | THIEU = còn thiếu, cần cài | DE SAU = chưa cần ở mốc này | CANH BAO = nên xem, không chặn."
if [ "$missing_required" -eq 0 ]; then
  echo "KET QUA: đủ công cụ bắt buộc tới buổi $stage. Cảnh báo: $warnings"
  exit 0
else
  echo "KET QUA: còn THIEU công cụ bắt buộc. Xem các dòng [ THIEU ] ở trên, rồi mở troubleshooting-setup.md. Cảnh báo: $warnings"
  exit 1
fi
