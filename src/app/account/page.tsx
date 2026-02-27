"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useProjects } from "@/context/ProjectContext";
import { getAnswers } from "@/app/quiz/lib/answersStore";
import { getDesignsCreated } from "@/lib/designsCreatedStore";
import { SCOPE_QUESTIONS } from "@/app/quiz/scope/questions";
import { BUDGET_QUESTIONS } from "@/app/quiz/budget/questions";
import { QUESTIONS as TASTE_QUESTIONS } from "@/questions";

export default function AccountPage() {
  const router = useRouter();
  const { projects, currentProjectId, setCurrentProjectId, createProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const getProjectStageLabel = useCallback((projectId: string) => {
    const answers = getAnswers(projectId);
    const hasAnyAnswers = Object.keys(answers).length > 0;
    if (!hasAnyAnswers) return "Draft — quiz not started";

    // Quiz completion = all required questions across Scope, Budget, and Taste have answers
    const allQuestions = [...SCOPE_QUESTIONS, ...BUDGET_QUESTIONS, ...TASTE_QUESTIONS];
    const requiredQuestions = allQuestions.filter((q) => q.required);
    const hasCompletedQuiz = requiredQuestions.every((q) => {
      const val = answers[q.id] ?? [];
      return Array.isArray(val) && val.length > 0;
    });

    const hasDesigns = getDesignsCreated(projectId);
    if (hasDesigns) return "Designed — designs created";

    if (hasCompletedQuiz) return "Project Plan created — quiz complete";

    return "In progress — quiz responses saved";

  }, []);

  const handleCreate = useCallback(() => {
    const name = newProjectName.trim() || "Untitled project";
    createProject(name);
    setNewProjectName("");
    setShowCreate(false);
  }, [newProjectName, createProject]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-10">
          <h1 className="font-[var(--font-playfair)] text-2xl md:text-3xl text-black">
            Account
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Manage your projects and account settings.
          </p>
        </header>

        {/* Projects */}
        <section className="rounded-2xl border border-black/10 bg-white/60 p-6 space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            Projects
          </h2>
          <p className="text-sm text-black/70">
            Switch between projects or create a new one. Each project has its own quiz answers, plan, and design concept.
          </p>

          {projects.length === 0 ? (
            <p className="text-sm text-black/50 italic">No projects yet. Create one to get started.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentProjectId(p.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      currentProjectId === p.id
                        ? "border-black/20 bg-black/5 font-medium"
                        : "border-black/10 hover:bg-black/[0.02]"
                    }`}
                  >
                    <span className="text-black">{p.name}</span>
                    <span className="block text-xs text-black/50 mt-0.5">
                      {getProjectStageLabel(p.id)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showCreate ? (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="flex-1 px-4 py-2 rounded-xl border border-black/20 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/90"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewProjectName(""); }}
                className="px-4 py-2 rounded-xl border border-black/20 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="text-sm font-medium text-black/70 hover:text-black"
            >
              + New project
            </button>
          )}
        </section>

        {/* Payment — placeholder */}
        <section className="rounded-2xl border border-black/10 bg-white/60 p-6 mt-6 space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            Payment
          </h2>
          <p className="text-sm text-black/70">
            Payment management will be available here once we add it. You’ll be able to update payment methods and view billing history.
          </p>
          <p className="text-xs text-black/50 italic">Coming soon.</p>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-medium text-black/70 hover:text-black"
          >
            ← Back to app
          </button>
        </div>
      </div>
    </main>
  );
}
