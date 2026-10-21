#!/usr/bin/env bash
# permissions-lab.sh - Sandbox an toàn để thực hành user, group, quyền file (Tuần 1-2).
#
# Chỉ tạo/xóa những thứ có tiền tố "dsclab" (user dsclab-alice, dsclab-bob,
# group dsclab-club, thư mục /srv/dsclab-shared). Không đụng tới user/group/thư mục khác.
#
# Cách dùng (trong WSL2 Ubuntu):
#   sudo ./permissions-lab.sh setup     # tạo sandbox
#   sudo ./permissions-lab.sh demo      # chạy thử các tình huống quyền
#   sudo ./permissions-lab.sh cleanup   # dọn sạch mọi thứ đã tạo
set -euo pipefail

GROUP="dsclab-club"
USERS=("dsclab-alice" "dsclab-bob")
OUTSIDER="dsclab-eve"
SHARED="/srv/dsclab-shared"

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Cần quyền root. Chạy lại bằng: sudo $0 $*" >&2
    exit 1
  fi
}

setup() {
  echo "[1/5] Tạo group ${GROUP}"
  getent group "$GROUP" >/dev/null || groupadd "$GROUP"

  echo "[2/5] Tạo user (không có mật khẩu, không đăng nhập được) và thêm vào group"
  for u in "${USERS[@]}"; do
    id "$u" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$u"
    usermod -aG "$GROUP" "$u"
  done
  id "$OUTSIDER" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$OUTSIDER"

  echo "[3/5] Tạo thư mục dùng chung ${SHARED}"
  mkdir -p "$SHARED"
  chown root:"$GROUP" "$SHARED"

  echo "[4/5] Đặt quyền 2770: rwx cho owner và group, không cho người ngoài; bit setgid (2) để file mới kế thừa group"
  chmod 2770 "$SHARED"

  echo "[5/5] Kết quả:"
  ls -ld "$SHARED"
  getent group "$GROUP"
}

demo() {
  [ -d "$SHARED" ] || { echo "Chưa setup. Chạy: sudo $0 setup" >&2; exit 1; }

  echo "== alice tạo file trong thư mục chung (thành công vì alice thuộc ${GROUP})"
  sudo -u dsclab-alice bash -c "echo 'ghi chú của alice' > ${SHARED}/alice.txt"
  ls -l "${SHARED}/alice.txt"
  echo "   Lưu ý: group của file là ${GROUP} nhờ bit setgid trên thư mục."

  echo "== bob đọc và ghi file của alice (đọc được; ghi bị từ chối vì file có quyền 644 -> group chỉ có r)"
  sudo -u dsclab-bob cat "${SHARED}/alice.txt"
  sudo -u dsclab-bob bash -c "echo thêm >> ${SHARED}/alice.txt" 2>&1 || echo "   -> Permission denied (đúng như dự kiến)"

  echo "== Cho group quyền ghi: chmod g+w"
  chmod g+w "${SHARED}/alice.txt"
  sudo -u dsclab-bob bash -c "echo 'bob bổ sung' >> ${SHARED}/alice.txt" && echo "   -> bob ghi thành công"

  echo "== eve (không thuộc group) không vào được thư mục chung"
  sudo -u "$OUTSIDER" ls "$SHARED" 2>&1 || echo "   -> Permission denied (đúng như dự kiến)"

  echo "== Nội dung file cuối cùng:"
  cat "${SHARED}/alice.txt"
}

cleanup() {
  echo "Dọn sandbox..."
  for u in "${USERS[@]}" "$OUTSIDER"; do
    if id "$u" >/dev/null 2>&1; then userdel --remove "$u" 2>/dev/null || true; fi
  done
  if getent group "$GROUP" >/dev/null; then groupdel "$GROUP"; fi
  # Chỉ xóa đúng đường dẫn sandbox, kiểm tra trước khi rm
  if [ "$SHARED" = "/srv/dsclab-shared" ] && [ -d "$SHARED" ]; then rm -rf -- "$SHARED"; fi
  echo "Xong. Kiểm tra: getent group ${GROUP}  (không in gì là đã sạch)"
}

case "${1:-}" in
  setup)   require_root "$@"; setup ;;
  demo)    require_root "$@"; demo ;;
  cleanup) require_root "$@"; cleanup ;;
  *) echo "Cách dùng: sudo $0 {setup|demo|cleanup}"; exit 2 ;;
esac
