-- Migration 002: access_status for alpha gating, stripe placeholder on profiles,
-- and project_design_output table (replaces designConceptStore localStorage).

-- =============================================================================
-- PROFILES: add access_status and stripe_customer_id
-- =============================================================================
alter table public.profiles
  add column if not exists access_status text not null default 'pending'
    check (access_status in ('pending', 'active', 'blocked')),
  add column if not exists stripe_customer_id text;

create index if not exists idx_profiles_access_status on public.profiles (access_status);

-- Update trigger so new signups are always pending (explicit, in case default changes)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, access_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- =============================================================================
-- PROJECT_DESIGN_OUTPUT (replaces designConceptStore + designsCreatedStore)
-- =============================================================================
create table if not exists public.project_design_output (
  project_id      uuid primary key references public.projects (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  output          jsonb not null default '{}',
  designs_created boolean not null default false,
  updated_at      timestamptz not null default now()
);

create index if not exists idx_project_design_output_user on public.project_design_output (user_id);

alter table public.project_design_output enable row level security;

create policy "Users can read own design output"
  on public.project_design_output for select using (user_id = auth.uid() or public.is_platform_admin());
create policy "Users can insert own design output"
  on public.project_design_output for insert with check (user_id = auth.uid());
create policy "Users can update own design output"
  on public.project_design_output for update using (user_id = auth.uid());
create policy "Users can delete own design output"
  on public.project_design_output for delete using (user_id = auth.uid());
