// Source List — Studio Coordinator Agent.
// Master list of all material selections from moodboard + decision detail tables.
// Route: app.studiorevy.com/sourcelist
//
// Data: Currently uses placeholder list. To wire the loop — fetch from your API/DB
// that merges (a) design concept / moodboard / decision-detail selections with
// (b) material specifications from your database per room/slot/category.

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProjectRequiredGuard } from "@/components/ProjectRequiredGuard";
import { useProjects } from "@/context/ProjectContext";
import { getDesignsCreated } from "@/lib/designsCreatedStore";
import {
  getPlaceholderSourceList,
  type SourceItem,
} from "./sourceListData";
import { exportSourceListCSV } from "./exportUtils";
import { SourceListExecutiveSummary } from "./ExecutiveSummary";
import { SourceListTable } from "./SourceListTable";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);

export default function SourceListPage() {
  const { currentProjectId } = useProjects();
  const designsCreated = getDesignsCreated(currentProjectId);
  // Replace with API/DB fetch when ready; data can be built from design concept + DB specs
  const allItems: SourceItem[] = useMemo(() => getPlaceholderSourceList(), []);

  const rooms = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.room))).sort(),
    [allItems]
  );

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => (selectedRoom ? allItems.filter((i) => i.room === selectedRoom) : allItems),
    [allItems, selectedRoom]
  );

  const grandTotal = filteredItems.reduce((s, i) => s + i.totalCost, 0);

  const handleExportCSV = () => {
    exportSourceListCSV(filteredItems);
  };

  return (
    <ProjectRequiredGuard>
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-black/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-16 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-[var(--font-playfair)] text-2xl md:text-3xl leading-snug text-black">
                Source List
              </h1>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/50 mt-1">
                Project Procurement
              </p>
            </div>
            {designsCreated && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black/20 bg-white text-black text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-16 py-6 space-y-6">
        {!designsCreated && (
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
              <p className="font-medium">No designs created yet</p>
              <p className="mt-1 text-amber-800/90">
                You have a project plan but haven&apos;t generated designs. Go to your{" "}
                <Link href="/brief" className="underline font-medium hover:no-underline">
                  Project Plan
                </Link>{" "}
                and click <strong>Create Designs</strong> to generate them.
              </p>
            </div>
          </div>
        )}

        {designsCreated && (
          <>
            <SourceListExecutiveSummary />

            {/* Room filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-black/50 mr-1">
                Room:
              </span>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className={`h-7 px-3 rounded-md text-xs font-medium border transition-colors ${
                  selectedRoom === null
                    ? "bg-black text-white border-black"
                    : "bg-white border-black/20 text-black hover:bg-black/5"
                }`}
              >
                All
              </button>
              {rooms.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`h-7 px-3 rounded-md text-xs font-medium border transition-colors ${
                    selectedRoom === room
                      ? "bg-black text-white border-black"
                      : "bg-white border-black/20 text-black hover:bg-black/5"
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>

            <SourceListTable items={filteredItems} />

            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-6 py-4 shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-black/60">
                  {filteredItems.length} line items
                  {selectedRoom ? ` in ${selectedRoom}` : " across 3 phases"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-black/50 block">Total</span>
                <p className="font-[var(--font-playfair)] text-lg font-bold text-black">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
    </ProjectRequiredGuard>
  );
}
