import * as XLSX from "xlsx";
import { CardData, CardCategory } from "@/types/card";

const sheetNames: Record<CardCategory, string> = {
  manufacturer: "Manufacturers",
  wholesaler: "Wholesalers",
  retailer: "Retailers",
  supplier: "Suppliers",
  vvip: "VVIPs",
};

const fieldMap: { header: string; key: keyof CardData; format?: (v: any) => string }[] = [
  { header: "S.No", key: "serial_number" },
  { header: "Company Name", key: "company_name" },
  { header: "Owner Name", key: "owner_name" },
  { header: "Designation", key: "designation" },
  { header: "Address", key: "address" },
  { header: "City", key: "city" },
  { header: "State", key: "state" },
  { header: "Pin Code", key: "pin_code" },
  { header: "Phone Numbers", key: "phone_numbers", format: (v) => (Array.isArray(v) ? v.join(", ") : String(v || "")) },
  { header: "Email", key: "email" },
  { header: "Website", key: "website" },
];

export function exportToExcel(cards: CardData[]) {
  const wb = XLSX.utils.book_new();
  const allCategories: CardCategory[] = ["manufacturer", "wholesaler", "retailer", "supplier", "vvip"];

  allCategories.forEach((cat) => {
    const filtered = cards.filter((c) => c.category === cat);
    const headers = fieldMap.map((f) => f.header);

    const rows = filtered.map((card, i) =>
      fieldMap.map((f) => {
        if (f.key === "serial_number") return i + 1;
        const value = card[f.key];
        return f.format ? f.format(value) : (value ?? "");
      })
    );

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths based on content
    ws["!cols"] = fieldMap.map((f) => ({
      wch: f.key === "serial_number" ? 6 : f.key === "address" ? 35 : f.key === "phone_numbers" ? 22 : f.key === "company_name" || f.key === "email" ? 25 : 18,
    }));

    XLSX.utils.book_append_sheet(wb, ws, sheetNames[cat]);
  });

  XLSX.writeFile(wb, "visiting_cards.xlsx");
}
