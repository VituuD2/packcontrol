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
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  
  // Fetch orders with their items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Sync Orders</h1>
          <p className="text-muted-foreground">
            View orders imported from WooCommerce and their packaging status.
          </p>
        </div>
        <form action={async () => {
          "use server";
          // Implement force sync logic here calling generic webhook sync
        }}>
          <Button type="submit">
            <RefreshCw className="mr-2 w-4 h-4" /> Force Sync
          </Button>
        </form>
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
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell>
                      {order.status === 'completed' || order.status === 'processed' ? (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Processed</Badge>
                      ) : order.status === 'error' ? (
                         <Badge variant="destructive">Error</Badge>
                      ) : (
                         <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.order_items ? order.order_items.reduce((acc: number, item: any) => acc + Number(item.quantity), 0) : 0} items
                    </TableCell>
                    <TableCell>
                      {/* Usually this data connects with packaging movements. Simplifying for view. */}
                      {order.status === 'processing' ? <span className="text-muted-foreground italic">Pending</span> : 'Auto-deducted'}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.created_at ? format(new Date(order.created_at), 'MMM d, HH:mm') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No orders found. Set up your WooCommerce webhook to start syncing.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  )
}
