// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/context/ProjectContext";

export default function QuizIntroPage() {
  const router = useRouter();
  const { projects, setCurrentProjectId } = useProjects();

  return (
    <main className="min-h-screen bg-[var(--background)] text-neutral-900 px-4 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        <header className="text-center space-y-3 mb-8">
          <h1 className="font-[var(--font-playfair)] text-3xl md:text-4xl leading-tight">
            Let’s get clarity on your project, together.
          </h1>
          <p className="text-sm text-black/70 leading-relaxed max-w-2xl mx-auto">
            Choose a project to continue the quiz, or create a new one.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCurrentProjectId(p.id);
                router.push("/quiz/scope");
              }}
              className="text-left rounded-2xl border border-black/10 bg-white/60 hover:bg-white/70 transition p-5 md:p-6"
            >
              <h2 className="font-[var(--font-playfair)] text-lg text-black truncate">
                {p.name}
              </h2>
              <p className="text-xs text-black/50 mt-1 capitalize">
                {p.status}
              </p>
              <p className="text-sm text-black/70 mt-4">
                Continue Project Quiz →
              </p>
            </button>
          ))}

          <Link
            href="/create-project"
            className="rounded-2xl border border-dashed border-black/20 bg-transparent hover:bg-black/5 transition p-5 md:p-6 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-black/50">
                New project
              </p>
              <h2 className="font-[var(--font-playfair)] text-lg text-black mt-2">
                Create a new project
              </h2>
              <p className="text-sm text-black/70 mt-2">
                Name your project, then start the quiz.
              </p>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition">
                Begin Project
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
