#!/usr/bin/env bash
# PostgreSQL + named volume + backup/restore bằng pg_dump.
# Cách dùng: ./postgres-volume.sh up | seed | show | recreate | backup | restore | down
# Mật khẩu lấy từ biến môi trường PGLAB_PASSWORD (ví dụ trong file .env của bạn, không commit).
set -euo pipefail

NAME="pglab"
VOLUME="pglab-data"
IMAGE="postgres:17-alpine"
PORT="${PGLAB_PORT:-35432}"
BACKUP="${BACKUP_FILE:-pglab-backup.sql}"
PGLAB_PASSWORD="${PGLAB_PASSWORD:-}"
need_password() {
  [ -n "$PGLAB_PASSWORD" ] || { echo "Hãy đặt PGLAB_PASSWORD, ví dụ: export PGLAB_PASSWORD=mat-khau-thu-nghiem" >&2; exit 1; }
}

psql_exec() { docker exec -i -e PGPASSWORD="$PGLAB_PASSWORD" "$NAME" psql -U postgres -d clubdb "$@"; }

wait_ready() {
  for _ in $(seq 1 30); do
    if docker exec "$NAME" pg_isready -U postgres -d clubdb >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  echo "Database không sẵn sàng sau 30 giây" >&2; exit 1
}

up() {
  docker run -d --name "$NAME" \
    -e POSTGRES_PASSWORD="$PGLAB_PASSWORD" -e POSTGRES_DB=clubdb \
    -v "${VOLUME}:/var/lib/postgresql/data" \
    -p "127.0.0.1:${PORT}:5432" "$IMAGE" >/dev/null
  wait_ready
  # Lần khởi động đầu, image restart một lần sau khi init; đợi ổn định
  sleep 2; wait_ready
  echo "PostgreSQL chạy, volume=${VOLUME}, cổng host=${PORT}"
}

seed() {
  psql_exec -c "CREATE TABLE IF NOT EXISTS members (id serial PRIMARY KEY, name text NOT NULL);"
  psql_exec -c "INSERT INTO members (name) VALUES ('An'), ('Binh'), ('Chi');"
}

show() { psql_exec -c "SELECT * FROM members ORDER BY id;"; }

recreate() {
  docker rm -f "$NAME" >/dev/null
  echo "Đã xóa container (volume ${VOLUME} vẫn còn). Tạo lại..."
  up
}

backup() {
  docker exec -e PGPASSWORD="$PGLAB_PASSWORD" "$NAME" pg_dump -U postgres -d clubdb > "$BACKUP"
  echo "Đã ghi backup: ${BACKUP} ($(wc -c < "$BACKUP") bytes)"
}

restore() {
  [ -s "$BACKUP" ] || { echo "Không thấy file ${BACKUP}" >&2; exit 1; }
  psql_exec -v ON_ERROR_STOP=1 < "$BACKUP" >/dev/null
  echo "Đã restore từ ${BACKUP}"
}

down() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker volume rm "$VOLUME" >/dev/null 2>&1 || true
  echo "Đã xóa container và volume ${VOLUME}. File backup (nếu có) được giữ lại."
}

case "${1:-}" in
  up|seed|show|recreate|backup|restore) need_password ;;
esac

case "${1:-}" in
  up) up ;; seed) seed ;; show) show ;; recreate) recreate ;;
  backup) backup ;; restore) restore ;; down) down ;;
  *) echo "Cách dùng: $0 {up|seed|show|recreate|backup|restore|down}"; exit 2 ;;
esac
