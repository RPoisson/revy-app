"use client";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AdminSupportPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <h2 className="font-[var(--font-playfair)] text-lg text-black">Projects (disabled)</h2>
      <p className="text-sm text-black/60">
        This admin view depends on Supabase. It’s disabled until Supabase auth + database are enabled.
      </p>
      <a href={`${base}/`} className="text-sm text-black/70 underline hover:text-black">
        Return to app
      </a>
    </main>
  );
}
