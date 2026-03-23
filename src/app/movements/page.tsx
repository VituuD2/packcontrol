import { History, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"


export default function MovementsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
        <p className="text-muted-foreground">
          Detailed immutable log of all inventory additions and reductions.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search movements..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-xl border shadow-sm bg-card p-0 overflow-hidden">
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Out</Badge></TableCell>
                <TableCell className="font-medium">Bag M (Verde)</TableCell>
                <TableCell className="font-bold text-red-600">-1</TableCell>
                <TableCell>System (Order)</TableCell>
                <TableCell className="text-muted-foreground">#1024</TableCell>
                <TableCell className="text-right">FormatDate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">In</Badge></TableCell>
                <TableCell className="font-medium">Box G</TableCell>
                <TableCell className="font-bold text-emerald-600">+100</TableCell>
                <TableCell>Manual Adjustment</TableCell>
                <TableCell className="text-muted-foreground">Admin Restock</TableCell>
                <TableCell className="text-right">FormatDate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </div>
    </div>
  )
}
