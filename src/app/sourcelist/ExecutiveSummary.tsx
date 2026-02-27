"use client";

import { PhaseBadge } from "./PhaseBadge";
import { phaseConfig, phaseCategories } from "./sourceListData";

export function SourceListExecutiveSummary() {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
      <div className="flex items-start gap-3 mb-5">
        <div className="rounded-lg bg-black/10 p-2.5">
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div>
          <h2 className="font-[var(--font-playfair)] text-lg font-semibold text-black">
            Procurement Roadmap
          </h2>
          <p className="text-sm text-black/60 mt-0.5">
            To prevent construction delays, items are organized by project phase.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {([1, 2, 3] as const).map((phase) => {
          const config = phaseConfig[phase];
          const categories = phaseCategories[phase];
          return (
            <div
              key={phase}
              className="flex flex-col gap-3 rounded-xl border border-black/10 bg-[var(--background)] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-black">{config.label}</span>
                <PhaseBadge phase={phase} tag={config.tag} />
              </div>
              <p className="text-xs text-black/60">{config.description}</p>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.name} className="text-xs">
                    <span className="font-medium text-black">{cat.name}</span>
                    <p className="text-black/60 mt-0.5 leading-relaxed">{cat.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
