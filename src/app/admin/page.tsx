"use client";

import Link from "next/link";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-sm text-black/70 mb-6">
        Use the Support page to search projects by org or account and view plans (read-only) for support.
      </p>
      <Link
        href={`${base}/admin/support`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90"
      >
        Open Projects list
      </Link>
    </main>
  );
}
