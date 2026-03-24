import { Search, History } from "lucide-react"
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
import { EditMovementDialog } from "@/components/movements/edit-movement-dialog"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function MovementsPage() {
  const supabase = await createClient()

  let movements: any[] = []
  try {
    const { data } = await supabase
      .from('packaging_movements')
      .select(`
        *,
        packaging_items(name, sku_internal, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) movements = data
  } catch (error) {
    console.error("Failed to fetch movements", error)
  }

  async function editMovement(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const id = formData.get('id') as string
    const movement_type = formData.get('movement_type') as string
    const quantity = Number(formData.get('quantity'))
    const source_id = formData.get('source_id') as string

    // In a real ERP, editing a movement should also recalculate the current_stock
    // of the packaging_item, which is complex and usually requires a DB function/trigger.
    // For this MVP, we explicitly update the movement record.
    const { error } = await supabaseServer.from('packaging_movements').update({
      movement_type,
      quantity,
      source_id
    }).eq("id", id)

    if (!error) revalidatePath('/movements')
    else throw new Error(error.message)
  }

  async function deleteMovement(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const id = formData.get('id') as string
    
    // DB Trigger usually handles stock adjustments on DELETE.
    const { error } = await supabaseServer.from('packaging_movements').delete().eq("id", id)
    if (!error) revalidatePath('/movements')
    else throw new Error(error.message)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Stock Movements Ledger</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search movements by reference..." className="pl-9 h-10 w-full bg-background/50 border-border/80 rounded-lg shadow-sm" />
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
         {movements.length > 0 ? (
           <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] font-semibold text-muted-foreground">Direction</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Material Item</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Qty</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Source</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Reference</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground">Date Logged</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((mov) => {
                  const dateObj = new Date(mov.created_at)
                  const formattedDate = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }).format(dateObj)

                  return (
                    <TableRow key={mov.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell>
                        {mov.movement_type === 'out' ? (
                           <Badge className="bg-red-50 text-red-700 border-red-200/50 uppercase tracking-wider text-[10px] shadow-none">Out</Badge>
                        ) : mov.movement_type === 'in' ? (
                           <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/50 uppercase tracking-wider text-[10px] shadow-none">In</Badge>
                        ) : (
                           <Badge className="bg-orange-50 text-orange-700 border-orange-200/50 uppercase tracking-wider text-[10px] shadow-none">Adj</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {mov.packaging_items?.name || "Unknown"}
                        <span className="block text-xs font-mono text-muted-foreground/60">{mov.packaging_items?.sku_internal}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold tabular-nums tracking-tight ${mov.movement_type === 'out' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {mov.movement_type === 'out' ? '-' : '+'}{mov.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">{mov.packaging_items?.unit}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm uppercase text-xs font-semibold">{mov.source_type || "system"}</TableCell>
                      <TableCell className="text-foreground/80 font-medium text-sm">{mov.source_id || "-"}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formattedDate}
                      </TableCell>
                      <TableCell>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditMovementDialog movement={mov} editAction={editMovement} deleteAction={deleteMovement} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
         ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground/60">
               <History className="h-12 w-12 mb-4 opacity-20" />
               <h3 className="text-lg font-semibold text-foreground/80 tracking-tight">No Movements Found</h3>
            </div>
         )}
      </div>
    </div>
  )
}
