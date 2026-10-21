-- schema.sql: bảng cho ví dụ "đăng ký CLB" trên Supabase (PostgreSQL)
-- Cách dùng: dán vào SQL Editor của Supabase (project DEV), rồi dán tiếp policies.sql.
-- Chạy lại nhiều lần được (idempotent).

-- 1. Bảng đăng ký tham gia: khách chưa đăng nhập được gửi form
create table if not exists public.signups (
  id          bigint generated always as identity primary key,
  full_name   text not null check (char_length(full_name) between 1 and 100),
  email       text not null check (char_length(email) between 3 and 200 and position('@' in email) > 1),
  message     text check (message is null or char_length(message) <= 1000),
  created_at  timestamptz not null default now()
);

-- 2. Bảng hồ sơ thành viên: mỗi người đăng nhập có đúng một dòng của mình
create table if not exists public.members (
  id            bigint generated always as identity primary key,
  user_id       uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 60),
  bio           text check (bio is null or char_length(bio) <= 500),
  created_at    timestamptz not null default now()
);

-- 3. Bảng quản trị viên: ai nằm trong bảng này được đọc danh sách signups
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 4. BẬT Row Level Security cho MỌI bảng trong schema public
alter table public.signups enable row level security;
alter table public.members enable row level security;
alter table public.admins  enable row level security;
