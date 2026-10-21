#!/usr/bin/env bash
# Dựng môi trường: Postgres chạy sẵn, đã có bảng members và 3 thành viên.
set -euo pipefail
cd "$(dirname "$0")"
docker compose up -d --wait
docker compose exec -T postgres psql -U club -d clubdb -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE members (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL);
INSERT INTO members (name, email) VALUES
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Carol', 'carol@example.com');
SQL
echo "Đã dựng môi trường. Học viên chạy lệnh trong README.md."
