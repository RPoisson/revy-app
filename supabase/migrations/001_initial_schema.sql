-- Rêvy initial schema: auth, orgs, projects, project_answers, RLS.
-- Run this in Supabase SQL Editor after enabling Auth.
-- Requires: Supabase project created, Auth enabled.

-- =============================================================================
-- PROFILES (extends auth.users; role for platform_admin)
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'member' check (role in ('member', 'org_admin', 'platform_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_email on public.profiles (email);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- ORGANIZATIONS (personal = single user; team = multi-user / designer-licensed)
-- =============================================================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'personal' check (type in ('personal', 'team')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_organizations_type on public.organizations (type);

-- =============================================================================
-- ORGANIZATION MEMBERS (user belongs to org with a role)
-- =============================================================================
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists idx_org_members_org on public.organization_members (organization_id);
create index if not exists idx_org_members_user on public.organization_members (user_id);

-- =============================================================================
-- PROJECTS (belong to user and org; designs_created_at for "Create Designs" state)
-- =============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Untitled project',
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'complete', 'archived')),
  designs_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_org on public.projects (organization_id);
create index if not exists idx_projects_user on public.projects (user_id);
create index if not exists idx_projects_created_at on public.projects (created_at desc);

-- =============================================================================
-- PROJECT_ANSWERS (quiz answers per project; one row per project)
-- =============================================================================
create table if not exists public.project_answers (
  project_id uuid primary key references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_answers_user on public.project_answers (user_id);

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_answers enable row level security;

-- Helper: is the current user a platform admin?
create or replace function public.is_platform_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'platform_admin'
  );
$$ language sql security definer stable;

-- Helper: is the current user a member of org with admin/owner role?
create or replace function public.is_org_admin(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
    and role in ('owner', 'admin')
  );
$$ language sql security definer stable;

-- PROFILES: user can read/update own; platform_admin can read all
create policy "Users can read own profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());
create policy "Platform admins can read all profiles"
  on public.profiles for select using (public.is_platform_admin());

-- ORGANIZATIONS: members can read; platform_admin can read all
create policy "Org members can read org"
  on public.organizations for select using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id and user_id = auth.uid()
    )
  );
create policy "Platform admins can read all orgs"
  on public.organizations for select using (public.is_platform_admin());

-- ORGANIZATION_MEMBERS: members can read; org admin/owner can add/remove (optional, for later)
create policy "Org members can read members"
  on public.organization_members for select using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id and om.user_id = auth.uid()
    )
  );
create policy "Platform admins can read all org members"
  on public.organization_members for select using (public.is_platform_admin());

-- PROJECTS: owner or org admin can read; owner can insert/update/delete; platform_admin read-only
create policy "Users can read projects in their orgs"
  on public.projects for select using (
    user_id = auth.uid()
    or public.is_org_admin(organization_id)
    or public.is_platform_admin()
  );
create policy "Users can insert own projects"
  on public.projects for insert with check (user_id = auth.uid());
create policy "Users can update own projects"
  on public.projects for update using (user_id = auth.uid());
create policy "Users can delete own projects"
  on public.projects for delete using (user_id = auth.uid());

-- PROJECT_ANSWERS: same as projects; platform_admin read-only
create policy "Users can read answers for accessible projects"
  on public.project_answers for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_answers.project_id and (p.user_id = auth.uid() or public.is_org_admin(p.organization_id))
    )
    or public.is_platform_admin()
  );
create policy "Users can insert own project answers"
  on public.project_answers for insert with check (user_id = auth.uid());
create policy "Users can update own project answers"
  on public.project_answers for update using (user_id = auth.uid());
create policy "Users can delete own project answers"
  on public.project_answers for delete using (user_id = auth.uid());

-- =============================================================================
-- CREATE PERSONAL ORG ON FIRST LOGIN (optional: run from app instead)
-- This trigger creates a personal org when a user is added to profiles.
-- =============================================================================
create or replace function public.create_personal_org_for_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  insert into public.organizations (name, type)
  values (coalesce(nullif(trim(new.full_name), ''), new.email, 'Personal'), 'personal')
  returning id into new_org_id;
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_create_personal_org on public.profiles;
create trigger on_profile_created_create_personal_org
  after insert on public.profiles
  for each row execute procedure public.create_personal_org_for_new_user();
