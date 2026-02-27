import type { SourceItem } from "./sourceListData";
import { phaseConfig } from "./sourceListData";

export function exportSourceListCSV(items: SourceItem[], filename = "source-list-procurement.csv") {
  const headers = [
    "Phase",
    "Category",
    "Room",
    "Product Name",
    "Item ID",
    "Vendor",
    "Manufacturer",
    "SKU",
    "Direct Link",
    "Finish/Color",
    "Material",
    "Dimensions",
    "Quantity",
    "Unit Price",
    "Total Cost",
    "Trade Discount",
    "Lead Time",
    "Stock Status",
  ];

  const rows = [...items]
    .sort((a, b) => a.phase - b.phase)
    .map((item) => [
      `${phaseConfig[item.phase].label} (${phaseConfig[item.phase].tag})`,
      item.category,
      item.room,
      item.productName,
      item.itemId,
      item.vendor,
      item.manufacturer,
      item.sku,
      item.directLink,
      item.finish,
      item.material,
      item.dimensions,
      item.quantity,
      item.unitPrice,
      item.totalCost,
      item.tradeDiscount,
      item.leadTime,
      item.stockStatus,
    ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
