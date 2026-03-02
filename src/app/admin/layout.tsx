"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <h2 className="font-[var(--font-playfair)] text-lg text-black">Admin is disabled</h2>
        <p className="text-sm text-black/60">
          Admin tools are disabled until Supabase auth + database are enabled for the product.
        </p>
      </main>
    </div>
  );
}
