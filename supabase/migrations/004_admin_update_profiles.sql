-- Allow platform admins to update any profile (for user management: access_status, role)
create policy "Platform admins can update all profiles"
  on public.profiles for update using (public.is_platform_admin());
