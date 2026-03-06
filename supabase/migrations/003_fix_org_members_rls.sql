-- Fix infinite recursion in organization_members RLS policy.
-- The old policy used a self-referencing subquery that caused infinite recursion.
-- New approach: allow reading any row where the org_id matches an org the user belongs to,
-- using a non-recursive CTE on the same table with security_invoker disabled.

-- Step 1: Drop the recursive policy
drop policy if exists "Org members can read members" on public.organization_members;

-- Step 2: Create a helper function (security definer bypasses RLS, breaking the cycle)
create or replace function public.user_org_ids()
returns setof uuid as $$
  select organization_id from public.organization_members
  where user_id = auth.uid();
$$ language sql security definer stable;

-- Step 3: New policy uses the helper (no recursion)
create policy "Org members can read members"
  on public.organization_members for select using (
    organization_id in (select public.user_org_ids())
  );

-- Also fix the organizations policy which has the same indirect recursion
-- (it queries organization_members, which queries itself)
drop policy if exists "Org members can read org" on public.organizations;

create policy "Org members can read org"
  on public.organizations for select using (
    id in (select public.user_org_ids())
  );
