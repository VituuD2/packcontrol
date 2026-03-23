import { RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
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


export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Sync Orders</h1>
          <p className="text-muted-foreground">
            View orders imported from WooCommerce and their packaging status.
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 w-4 h-4" /> Force Sync
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-xl border shadow-sm bg-card p-0 overflow-hidden">
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items Sold</TableHead>
                <TableHead>Packaging Consumed</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mock Row 1 */}
              <TableRow>
                <TableCell className="font-medium">#1024</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Processed</Badge>
                </TableCell>
                <TableCell>3 items</TableCell>
                <TableCell>1x Bag M, 2x Box G</TableCell>
                <TableCell className="text-right">Today, 14:30</TableCell>
              </TableRow>
              {/* Mock Row 2 */}
              <TableRow>
                <TableCell className="font-medium">#1023</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Processed</Badge>
                </TableCell>
                <TableCell>1 item</TableCell>
                <TableCell>1x Bag P</TableCell>
                <TableCell className="text-right">Today, 12:15</TableCell>
              </TableRow>
              {/* Mock Row 3 */}
              <TableRow>
                <TableCell className="font-medium">#1022</TableCell>
                <TableCell>
                  <Badge variant="destructive">Error</Badge>
                </TableCell>
                <TableCell>2 items</TableCell>
                <TableCell className="text-muted-foreground italic">Pending</TableCell>
                <TableCell className="text-right">Today, 10:05</TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </div>
    </div>
  )
}
