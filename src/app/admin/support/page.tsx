"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  organization_id: string;
  user_id: string;
  // Supabase join may return an array depending on relationship config
  organizations: { name: string } | { name: string }[] | null;
};

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminSupportPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrg, setSearchOrg] = useState("");
  const [searchAccount, setSearchAccount] = useState("");

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, name, status, created_at, organization_id, user_id, organizations(name)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setProjects(data as unknown as ProjectRow[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = projects;
    if (searchOrg.trim()) {
      const q = searchOrg.trim().toLowerCase();
      list = list.filter(
        (p) => {
          const org = p.organizations;
          const names = Array.isArray(org) ? org.map((o) => o?.name).filter(Boolean) : [org?.name].filter(Boolean);
          return names.some((n) => String(n).toLowerCase().includes(q));
        }
      );
    }
    if (searchAccount.trim()) {
      const q = searchAccount.trim().toLowerCase();
      list = list.filter(
        (p) => p.user_id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, searchOrg, searchAccount]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-black/60">Loading projects…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="font-[var(--font-playfair)] text-lg text-black">
        All projects (read-only)
      </h2>
      <p className="text-xs text-black/60">
        View plans for support. Impersonation (view as user/org) is read-only; no write access.
      </p>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black/60">Search by org name</span>
          <input
            type="text"
            value={searchOrg}
            onChange={(e) => setSearchOrg(e.target.value)}
            placeholder="Org name"
            className="px-3 py-2 rounded-lg border border-black/15 bg-white text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black/60">Search by account (user id)</span>
          <input
            type="text"
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            placeholder="User ID"
            className="px-3 py-2 rounded-lg border border-black/15 bg-white text-sm min-w-[200px]"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-black/5 text-left">
              <th className="px-4 py-3 font-medium text-black/60">Project</th>
              <th className="px-4 py-3 font-medium text-black/60">Org</th>
              <th className="px-4 py-3 font-medium text-black/60">User ID</th>
              <th className="px-4 py-3 font-medium text-black/60">Status</th>
              <th className="px-4 py-3 font-medium text-black/60">Created</th>
              <th className="px-4 py-3 font-medium text-black/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                <td className="px-4 py-3 text-black">{p.name}</td>
                <td className="px-4 py-3 text-black/70">
                  {Array.isArray(p.organizations)
                    ? (p.organizations[0]?.name ?? "—")
                    : (p.organizations?.name ?? "—")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-black/60 truncate max-w-[140px]">{p.user_id}</td>
                <td className="px-4 py-3 text-black/70">{p.status}</td>
                <td className="px-4 py-3 text-black/60">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`${base}/brief?impersonate=${p.user_id}`}
                    className="text-black/70 hover:text-black underline text-xs"
                  >
                    View plan (read-only)
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-black/50">No projects match.</p>
      )}
    </main>
  );
}
