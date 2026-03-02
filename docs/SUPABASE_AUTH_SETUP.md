# Supabase Auth & Data Setup

This app uses Supabase for auth (magic link + OTP) and for projects/answers when configured.

## 0. Install dependencies

```bash
npm install
```

This installs `@supabase/supabase-js` and `@supabase/ssr`. If you see npm cache permission errors, run `sudo chown -R $(whoami) ~/.npm` and try again.

## 1. Create a Supabase project

- Go to [supabase.com](https://supabase.com) and create a project.
- In **Settings → API**: copy **Project URL** and **anon public** key.

## 2. Environment variables

Add to `.env.local` (and your deployment env):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (existing):

```env
NEXT_PUBLIC_BASE_PATH=
ADMIN_PASSWORD=   # used only when Supabase is NOT set (legacy single-password)
```

## 3. Run the database migration

1. In Supabase Dashboard go to **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql` in this repo.
3. Copy its contents and run the script in the SQL Editor.

This creates:

- `profiles` (with `role`: member, org_admin, platform_admin)
- `organizations` (type: personal, team)
- `organization_members`
- `projects` (with `designs_created_at`)
- `project_answers`
- RLS so users see only their data; org admins see their org; platform admins have read-only access to all.

New users get a **personal org** and **owner** membership via trigger.

## 4. Auth settings in Supabase

- **Authentication → URL Configuration**: set **Site URL** to your app URL (e.g. `https://yourapp.com` or `http://localhost:3000`).
- **Redirect URLs**: add `https://yourapp.com/auth/callback` and `http://localhost:3000/auth/callback` (and add base path if you use one, e.g. `https://yourapp.com/your-base/auth/callback`).
- Enable **Email** (and optionally **Email OTP**) under **Authentication → Providers**.

## 5. Make a user a platform admin

To access `/admin` (support view):

```sql
update public.profiles
set role = 'platform_admin'
where id = 'the-user-uuid';
```

Get the user UUID from **Authentication → Users** in the dashboard.

## 6. Behaviour when Supabase is not set

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set:

- Login uses the legacy single-password flow (`ADMIN_PASSWORD`).
- Projects and answers stay in **localStorage** (no DB).
- Middleware does not require Supabase session.

## 7. Admin / support

- **URL**: `/admin` and `/admin/support`.
- **Access**: only users with `profiles.role = 'platform_admin'`.
- **Support page**: lists all projects, search by org name or user id; “View plan (read-only)” opens the brief with `?impersonate=userId` (read-only experience; full impersonation wiring can be added later).

## 8. Billing (future)

- Schema is ready for **user-level** billing (e.g. `profiles` or `user_billing`) and **org-level** billing (e.g. `organizations.stripe_customer_id`).
- Personal orgs use user-level billing; team orgs use org-level billing.
