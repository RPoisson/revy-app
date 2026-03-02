"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setAllowed(false);
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAllowed(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const isAdmin = profile?.role === "platform_admin";
      setAllowed(isAdmin);
      if (!isAdmin) router.replace("/");
    })();
  }, [router]);

  if (allowed === null) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-sm text-black/60">Checking access…</p>
      </main>
    );
  }
  if (!allowed) return null;

  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-[var(--font-playfair)] text-xl text-black">
            Admin — Support
          </h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`${base}/admin`} className="text-black/70 hover:text-black">
              Dashboard
            </Link>
            <Link href={`${base}/admin/support`} className="text-black/70 hover:text-black">
              Projects
            </Link>
            <Link href={`${base}/`} className="text-black/70 hover:text-black">
              Exit admin
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
