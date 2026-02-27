"use client";

type StockStatus = "In Stock" | "Low Stock" | "Made to Order" | "Backordered";

const statusStyles: Record<StockStatus, string> = {
  "In Stock": "bg-emerald-50 text-emerald-800",
  "Low Stock": "bg-amber-50 text-amber-800",
  "Made to Order": "bg-sky-50 text-sky-800",
  Backordered: "bg-red-50 text-red-800",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? "bg-black/5 text-black/70"
      }`}
    >
      {status}
    </span>
  );
}
