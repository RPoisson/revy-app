"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/context/ProjectContext";

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();

  const [name, setName] = useState("");
  const trimmed = useMemo(() => name.trim(), [name]);
  const canSubmit = trimmed.length > 0;

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-md md:max-w-xl space-y-6">
        <section className="text-center space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Step 1 — Create a project
          </p>
          <h1 className="font-[var(--font-playfair)] text-2xl md:text-3xl leading-tight">
            Name your project
          </h1>
          <p className="text-sm text-black/70 leading-relaxed">
            This helps you keep multiple projects organized (and you can change it later).
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm p-5 md:p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium tracking-wide text-black/70 mb-2">
              Project name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen renovation"
              className="w-full px-4 py-3 rounded-full border border-black/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/20"
              autoFocus
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-black/20 bg-transparent text-sm font-medium hover:bg-black/5 transition"
            >
              Back
            </Link>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                createProject(trimmed);
                router.push("/quiz/scope");
              }}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide disabled:opacity-40 hover:bg-black/90 transition"
            >
              Start Project Quiz
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

