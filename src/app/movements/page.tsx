import { Search, History } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
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
import { getTranslation } from "@/lib/i18n/server"

export const dynamic = "force-dynamic"

export default async function MovementsPage(props: { searchParams: Promise<any> }) {
  const params = await props.searchParams
  const query = params?.q || ""

  const supabase = await createClient()
  const t = await getTranslation()

  let movements: any[] = []
  try {
    let dbQuery = supabase
      .from('packaging_movements')
      .select(`
        *,
        packaging_items(name, sku_internal, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
      
    if (query) {
      dbQuery = dbQuery.or(`source_id.ilike.%${query}%,source_type.ilike.%${query}%`)
    }
    
    const { data } = await dbQuery
    
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
        <h1 className="text-3xl font-bold tracking-tight">{t('movements.title')}</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput placeholder="Search movements..." />
      </div>

      <div className="rounded-2xl bg-card/60 dark:bg-[#141415] border-border/80 dark:border-white/[0.04] shadow-sm dark:shadow-none bg-card/60 backdrop-blur-md overflow-hidden">
         {movements.length > 0 ? (
           <Table>
              <TableHeader className="bg-muted/30 dark:bg-white/[0.04]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] font-semibold text-muted-foreground dark:text-[#A1A1AA]">{t('movements.type')}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground dark:text-[#A1A1AA]">{t('movements.item')}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground dark:text-[#A1A1AA]">{t('movements.quantity')}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground dark:text-[#A1A1AA]">{t('movements.source')}</TableHead>
                  <TableHead className="font-semibold text-muted-foreground dark:text-[#A1A1AA]">Reference</TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground dark:text-[#A1A1AA]">{t('movements.date')}</TableHead>
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
                    <TableRow key={mov.id} className="group hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        {mov.movement_type === 'out' ? (
                           <Badge className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/50 dark:border-red-500/20 uppercase tracking-wider text-[10px] shadow-none">{t('movements.out')}</Badge>
                        ) : mov.movement_type === 'in' ? (
                           <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-wider text-[10px] shadow-none">{t('movements.in')}</Badge>
                        ) : (
                           <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20 uppercase tracking-wider text-[10px] shadow-none">Adj</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {mov.packaging_items?.name || t('dashboard.unknown_item')}
                        <span className="block text-xs font-mono text-muted-foreground dark:text-[#A1A1AA]/60">{mov.packaging_items?.sku_internal}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold tabular-nums tracking-tight ${mov.movement_type === 'out' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {mov.movement_type === 'out' ? '-' : '+'}{mov.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground dark:text-[#A1A1AA] ml-1">{mov.packaging_items?.unit}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground dark:text-[#A1A1AA] text-sm uppercase text-xs font-semibold">{mov.source_type || t('movements.system')}</TableCell>
                      <TableCell className="text-foreground/80 dark:text-[#E2E2E2] font-medium text-sm">{mov.source_id || "-"}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground dark:text-[#A1A1AA]">
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
            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground dark:text-[#A1A1AA]/60">
               <History className="h-12 w-12 mb-4 opacity-20" />
               <h3 className="text-lg font-semibold text-foreground/80 dark:text-[#E2E2E2] tracking-tight">{t('movements.no_data')}</h3>
            </div>
         )}
      </div>
    </div>
  )
}
