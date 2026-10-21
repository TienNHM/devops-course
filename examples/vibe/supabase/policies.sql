-- policies.sql: quyền truy cập (grant) và policy RLS. Chạy SAU schema.sql.
-- Nguyên tắc: mặc định đóng hết, chỉ mở đúng thứ cần.

-- A. Thu hồi quyền mặc định, sau đó cấp lại từng quyền tối thiểu
revoke all on public.signups from anon, authenticated;
revoke all on public.members from anon, authenticated;
revoke all on public.admins  from anon, authenticated;

grant insert on public.signups to anon, authenticated;
grant select on public.signups to authenticated;          -- policy bên dưới chỉ cho admin đọc
grant select, insert, update, delete on public.members to authenticated;
grant select on public.admins to authenticated;

-- B. signups: ai cũng gửi form được, KHÔNG ai đọc được trừ admin
drop policy if exists "signups_insert_public" on public.signups;
create policy "signups_insert_public"
  on public.signups for insert
  to anon, authenticated
  with check (true);

drop policy if exists "signups_select_admin" on public.signups;
create policy "signups_select_admin"
  on public.signups for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

-- C. members: người đã đăng nhập xem được danh sách, chỉ sửa được hồ sơ của mình
drop policy if exists "members_select_authenticated" on public.members;
create policy "members_select_authenticated"
  on public.members for select
  to authenticated
  using (true);

drop policy if exists "members_insert_own" on public.members;
create policy "members_insert_own"
  on public.members for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "members_update_own" on public.members;
create policy "members_update_own"
  on public.members for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "members_delete_own" on public.members;
create policy "members_delete_own"
  on public.members for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- D. admins: mỗi người chỉ thấy dòng của chính mình; thêm admin làm bằng SQL Editor
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Thêm admin (chạy tay trong SQL Editor, thay bằng UUID của bạn ở Authentication > Users):
-- insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000000');
