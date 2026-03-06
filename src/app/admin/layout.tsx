"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium ${active ? "text-black" : "text-black/60 hover:text-black"}`}
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "platform_admin");
      });
  }, [user, supabase]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-sm text-black/50">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-black/70">You don&apos;t have admin access.</p>
          <Link href="/" className="text-sm font-medium text-black/60 hover:text-black underline">
            Return to app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-[var(--font-playfair)] text-xl text-black">
            Admin
          </h1>
          <nav className="flex items-center gap-6">
            <AdminNavLink href="/admin">Users</AdminNavLink>
            <AdminNavLink href="/admin/support">Projects</AdminNavLink>
            <Link href="/" className="text-sm text-black/50 hover:text-black">
              Exit admin
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
