"use client";

import type { SourceItem } from "./sourceListData";
import { phaseConfig } from "./sourceListData";
import { PhaseBadge } from "./PhaseBadge";
import { StockBadge } from "./StockBadge";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

function ItemRow({ item }: { item: SourceItem }) {
  const config = phaseConfig[item.phase];
  return (
    <tr className="border-b border-black/10 hover:bg-black/[0.02] transition-colors text-xs">
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-black">{config.label}</span>
          <PhaseBadge phase={item.phase} tag={config.tag} className="w-fit" />
        </div>
      </td>
      <td className="px-3 py-3 text-black/70">{item.room}</td>
      <td className="px-3 py-3 font-medium text-black max-w-[180px]">{item.productName}</td>
      <td className="px-3 py-3 text-black/60 font-mono text-[11px]">{item.itemId}</td>
      <td className="px-3 py-3 text-black">{item.vendor}</td>
      <td className="px-3 py-3 text-black/70">{item.manufacturer}</td>
      <td className="px-3 py-3 text-black/70 font-mono text-[11px]">{item.sku}</td>
      <td className="px-3 py-3">
        {item.directLink !== "#" && item.directLink ? (
          <a
            href={item.directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-600 hover:underline"
          >
            Link
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="text-black/50">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-black">{item.finish}</td>
      <td className="px-3 py-3 text-black/70">{item.material}</td>
      <td className="px-3 py-3 text-black/70">{item.dimensions}</td>
      <td className="px-3 py-3 text-center text-black">{item.quantity}</td>
      <td className="px-3 py-3 text-right text-black">{formatCurrency(item.unitPrice)}</td>
      <td className="px-3 py-3 text-right font-medium text-black">{formatCurrency(item.totalCost)}</td>
      <td className="px-3 py-3 text-black/70">{item.tradeDiscount}</td>
      <td className="px-3 py-3 text-black/70">{item.leadTime}</td>
      <td className="px-3 py-3">
        <StockBadge status={item.stockStatus} />
      </td>
    </tr>
  );
}

interface SourceListTableProps {
  items: SourceItem[];
}

export function SourceListTable({ items }: SourceListTableProps) {
  const sorted = [...items].sort((a, b) => a.phase - b.phase);

  return (
    <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/10 bg-black/5 text-[11px] font-semibold uppercase tracking-wider text-black/60">
              <th className="px-3 py-3">Phase</th>
              <th className="px-3 py-3">Room</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Item ID</th>
              <th className="px-3 py-3">Vendor</th>
              <th className="px-3 py-3">Mfr.</th>
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">Link</th>
              <th className="px-3 py-3">Finish/Color</th>
              <th className="px-3 py-3">Material</th>
              <th className="px-3 py-3">Dimensions</th>
              <th className="px-3 py-3 text-center">Qty</th>
              <th className="px-3 py-3 text-right">Unit Price</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3">Discount</th>
              <th className="px-3 py-3">Lead Time</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
