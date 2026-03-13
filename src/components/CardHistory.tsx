import { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { History, Trash2, Download, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCards, deleteCardsBatch } from "@/lib/api";
import { CardData, CardCategory } from "@/types/card";
import { exportToExcel } from "@/lib/exportExcel";
import { format } from "date-fns";

interface HistoryGroup {
  date: string;
  cards: (CardData & { id: string })[];
}

const CATEGORIES: CardCategory[] = ["manufacturer", "wholesaler", "retailer", "supplier", "vvip"];

export const CardHistory = forwardRef(function CardHistory(_props, ref) {
  const [groups, setGroups] = useState<HistoryGroup[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchCards();
      const rows = data.cards || [];

      const grouped: Record<string, (CardData & { id: string })[]> = {};
      rows.forEach((row: any) => {
        const dateKey = format(new Date(row.extracted_at), "MMM dd, yyyy");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          id: row.id,
          serial_number: row.serial_number,
          company_name: row.company_name,
          owner_name: row.owner_name,
          designation: row.designation,
          address: row.address,
          city: row.city,
          state: row.state,
          pin_code: row.pin_code,
          phone_numbers: row.phone_numbers || [],
          email: row.email,
          website: row.website,
          category: (row.category as CardCategory) || "manufacturer",
        });
      });

      setGroups(Object.entries(grouped).map(([date, cards]) => ({ date, cards })));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ refresh: fetchHistory }));

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return groups
      .map((group) => {
        const filtered = group.cards.filter((card) => {
          const matchesCategory = categoryFilter === "all" || card.category === categoryFilter;
          if (!matchesCategory) return false;
          if (!q) return true;
          return (
            card.company_name?.toLowerCase().includes(q) ||
            card.city?.toLowerCase().includes(q) ||
            card.owner_name?.toLowerCase().includes(q)
          );
        });
        return { ...group, cards: filtered };
      })
      .filter((group) => group.cards.length > 0);
  }, [groups, searchQuery, categoryFilter]);

  const handleDeleteGroup = async (date: string) => {
    const group = groups.find((g) => g.date === date);
    if (!group) return;
    const ids = group.cards.map((c) => c.id);
    try {
      await deleteCardsBatch(ids);
      setGroups((prev) => prev.filter((g) => g.date !== date));
    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">Loading history…</div>
    );
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">History</h2>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, owner, or city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && filteredGroups.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">No cards match your search.</div>
      )}

      <div className="space-y-2">
        {filteredGroups.map((group) => (
          <div
            key={group.date}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedDate(expandedDate === group.date ? null : group.date)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{group.date}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {group.cards.length} card{group.cards.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToExcel(group.cards);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.date);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                {expandedDate === group.date ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {expandedDate === group.date && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-border"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Owner</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">City</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Phone</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.cards.map((card) => (
                        <tr key={card.id} className="border-t border-border/50">
                          <td className="px-3 py-2 text-foreground">{card.company_name || "—"}</td>
                          <td className="px-3 py-2 text-foreground">{card.owner_name || "—"}</td>
                          <td className="px-3 py-2 text-foreground">{card.city || "—"}</td>
                          <td className="px-3 py-2 text-foreground">{card.phone_numbers?.join(", ") || "—"}</td>
                          <td className="px-3 py-2">
                            <span className="capitalize bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                              {card.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
});