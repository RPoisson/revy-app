"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  access_status: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "blocked">("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, access_status, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateAccess = useCallback(
    async (userId: string, status: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ access_status: status })
        .eq("id", userId);
      if (error) {
        console.error("Failed to update access:", error.message);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, access_status: status } : u))
      );
    },
    [supabase]
  );

  const updateRole = useCallback(
    async (userId: string, role: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) {
        console.error("Failed to update role:", error.message);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    },
    [supabase]
  );

  const filtered = filter === "all" ? users : users.filter((u) => u.access_status === filter);
  const pendingCount = users.filter((u) => u.access_status === "pending").length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[var(--font-playfair)] text-lg text-black">User Management</h2>
          <p className="text-sm text-black/60 mt-1">
            {users.length} total users{pendingCount > 0 && ` \u00b7 ${pendingCount} pending approval`}
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "active", "blocked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-black text-white border-black"
                  : "bg-white text-black/70 border-black/15 hover:bg-black/5"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-black/50">Loading users...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-black/50 italic">No users found.</p>
      ) : (
        <div className="rounded-2xl border border-black/10 bg-white/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 text-black">{u.email ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-black/70">{u.full_name || "\u2014"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === "platform_admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-black/5 text-black/60"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.access_status === "active"
                        ? "bg-green-100 text-green-800"
                        : u.access_status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {u.access_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black/50 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== user?.id && (
                      <div className="flex gap-1.5">
                        {u.access_status !== "active" && (
                          <button
                            type="button"
                            onClick={() => updateAccess(u.id, "active")}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          >
                            Approve
                          </button>
                        )}
                        {u.access_status !== "blocked" && (
                          <button
                            type="button"
                            onClick={() => updateAccess(u.id, "blocked")}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            Block
                          </button>
                        )}
                        {u.access_status === "blocked" && (
                          <button
                            type="button"
                            onClick={() => updateAccess(u.id, "pending")}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
