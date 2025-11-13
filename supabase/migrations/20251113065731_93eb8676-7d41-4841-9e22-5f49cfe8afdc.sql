-- Part 1: Create Role Enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Part 2: Create user_roles Table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Part 3: Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Part 4: RLS Policies for user_roles (users can view their own roles)
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Admins can view all roles
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Only admins can insert roles
create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Only admins can delete roles
create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Part 5: Create Security Definer Function to Check Roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Part 6: Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- Part 7: Update RLS Policies on celebrities table
-- Drop old permissive policies
drop policy if exists "Authenticated users can insert celebrities" on public.celebrities;
drop policy if exists "Authenticated users can update celebrities" on public.celebrities;
drop policy if exists "Authenticated users can delete celebrities" on public.celebrities;

-- Create new admin-only policies
create policy "Only admins can insert celebrities"
on public.celebrities
for insert
to authenticated
with check (public.is_admin());

create policy "Only admins can update celebrities"
on public.celebrities
for update
to authenticated
using (public.is_admin());

create policy "Only admins can delete celebrities"
on public.celebrities
for delete
to authenticated
using (public.is_admin());