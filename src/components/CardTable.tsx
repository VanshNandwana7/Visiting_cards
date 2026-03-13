import { CardData, CardCategory } from "@/types/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const categories: { value: CardCategory; label: string }[] = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "retailer", label: "Retailer" },
  { value: "supplier", label: "Supplier" },
  { value: "vvip", label: "VVIP" },
];

interface CardTableProps {
  cards: CardData[];
  onUpdateCard: (index: number, field: keyof CardData, value: any) => void;
  onDeleteCard: (index: number) => void;
}

export function CardTable({ cards, onUpdateCard, onDeleteCard }: CardTableProps) {
  if (cards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full overflow-x-auto rounded-2xl border border-border shadow-card bg-card"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="w-12 text-center font-semibold text-foreground">S.No</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[150px]">Company</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[130px]">Owner</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[120px]">Designation</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[180px]">Address</TableHead>
            <TableHead className="font-semibold text-foreground">City</TableHead>
            <TableHead className="font-semibold text-foreground">State</TableHead>
            <TableHead className="font-semibold text-foreground">Pin Code</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[140px]">Phone</TableHead>
            <TableHead className="font-semibold text-foreground">Email</TableHead>
            <TableHead className="font-semibold text-foreground">Website</TableHead>
            <TableHead className="font-semibold text-foreground w-[140px]">Category</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card, idx) => (
            <TableRow key={idx} className="hover:bg-secondary/30 transition-colors">
              <TableCell className="text-center font-medium text-muted-foreground">{card.serial_number}</TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.company_name}
                  onChange={(e) => onUpdateCard(idx, "company_name", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.owner_name}
                  onChange={(e) => onUpdateCard(idx, "owner_name", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.designation}
                  onChange={(e) => onUpdateCard(idx, "designation", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.address}
                  onChange={(e) => onUpdateCard(idx, "address", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.city}
                  onChange={(e) => onUpdateCard(idx, "city", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.state}
                  onChange={(e) => onUpdateCard(idx, "state", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.pin_code}
                  onChange={(e) => onUpdateCard(idx, "pin_code", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.phone_numbers.join(", ")}
                  onChange={(e) => onUpdateCard(idx, "phone_numbers", e.target.value.split(",").map(s => s.trim()))}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.email}
                  onChange={(e) => onUpdateCard(idx, "email", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <input
                  className="w-full bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5"
                  value={card.website}
                  onChange={(e) => onUpdateCard(idx, "website", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={card.category}
                  onValueChange={(val) => onUpdateCard(idx, "category", val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => onDeleteCard(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
