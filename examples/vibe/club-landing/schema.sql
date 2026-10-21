-- Chạy toàn bộ file này trong Supabase: SQL Editor > New query > dán > Run.
-- Có thể chạy lại nhiều lần (idempotent).

-- 1. Bảng thành viên đăng ký
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  student_id  text,
  interest    text not null default 'general',
  created_at  timestamptz not null default now(),
  constraint members_full_name_len check (char_length(full_name) between 2 and 100),
  constraint members_email_format  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  constraint members_student_len   check (student_id is null or char_length(student_id) <= 30),
  constraint members_interest_ok   check (interest in ('general', 'web', 'ai', 'devops', 'design'))
);

-- Không cho đăng ký trùng email (so sánh không phân biệt hoa thường)
create unique index if not exists members_email_unique on public.members (lower(email));

-- 2. Bảng admin: ai có tên ở đây mới được xem danh sách
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 3. BẬT Row Level Security. Không bật = ai có khóa công khai cũng đọc được hết.
alter table public.members enable row level security;
alter table public.admins  enable row level security;

-- 4. Quyền cấp ở mức bảng (RLS lọc thêm ở mức dòng)
revoke all on public.members from anon, authenticated;
revoke all on public.admins  from anon, authenticated;
grant insert on public.members to anon, authenticated;   -- ai cũng đăng ký được
grant select on public.members to authenticated;         -- chỉ người đăng nhập mới có thể đọc (và còn bị policy lọc)
grant select on public.admins  to authenticated;         -- để admin tự kiểm tra mình có trong danh sách

-- 5. Policy
drop policy if exists "Ai cung dang ky duoc" on public.members;
create policy "Ai cung dang ky duoc"
  on public.members for insert
  to anon, authenticated
  with check (
    char_length(full_name) between 2 and 100
    and char_length(email) <= 200
  );

drop policy if exists "Chi admin duoc xem" on public.members;
create policy "Chi admin duoc xem"
  on public.members for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "Admin xem dong cua minh" on public.admins;
create policy "Admin xem dong cua minh"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Không có policy UPDATE/DELETE: không ai sửa hoặc xóa được qua khóa công khai.

-- 6. Thêm admin (CHẠY RIÊNG sau khi tạo user trong Authentication > Users):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'admin@example.com';
