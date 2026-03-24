import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTranslation } from "@/lib/i18n/server"

export const dynamic = "force-dynamic"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const t = await getTranslation()
  const filter = searchParams.filter === 'pending' ? false : null

  let query = supabase
    .from('webhook_events')
    .select('*')
    .in('event_type', ['order.created', 'order.updated'])
    .order('created_at', { ascending: false })

  if (filter === false) {
    query = query.eq('processed', false)
  }

  const { data: rawOrders, error } = await query

  // Deduplicate orders by orderNumber so the UI only shows unique orders
  const ordersMap = new Map()
  if (rawOrders) {
    for (const order of rawOrders) {
      const payload = order.payload || {}
      const orderNumber = payload.number || payload.id || order.external_id
      if (orderNumber && String(orderNumber).trim() !== "undefined") {
        if (!ordersMap.has(orderNumber)) {
          ordersMap.set(orderNumber, order)
        } else {
          // If we already have it, keep the one that is 'processed: true'
          if (!ordersMap.get(orderNumber).processed && order.processed) {
            ordersMap.set(orderNumber, order)
          }
        }
      }
    }
  }
  const orders = Array.from(ordersMap.values())

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90">{t('orders.title')}</h1>
        {filter === false && (
           <Link href="/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors">
              {t('orders.clear_filter')}
           </Link>
        )}
      </div>

      <div className="rounded-[1.25rem] border-0 shadow-[0_2px_20px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
        {orders && orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
             <div className="flex items-center p-4 bg-gray-50/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
               <div className="w-24 pl-2">{t('orders.order')}</div>
               <div className="flex-1">{t('orders.customer')}</div>
               <div className="w-32 text-right pr-4">{t('orders.total')}</div>
               <div className="w-48 text-center">{t('orders.status')}</div>
             </div>
            {orders.map((order) => {
              const payload = order.payload || {}
              const orderNumber = payload.number || payload.id || order.external_id
              const customerName = payload.billing ? `${payload.billing.first_name} ${payload.billing.last_name}` : "Unknown"
              const total = payload.total ? `R$ ${Number(payload.total).toFixed(2)}` : "R$ 0.00"
              const isProcessed = order.processed

              return (
                <div key={order.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:bg-gray-50/50 transition-colors">
                  
                  {/* Order Number */}
                  <div className="w-24 pl-2 font-mono font-semibold text-foreground/80">
                    #{orderNumber}
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                    <span className="font-semibold text-[15px] truncate text-foreground/90">{customerName}</span>
                    <span className="text-xs font-medium text-muted-foreground truncate">{payload.billing?.email}</span>
                  </div>

                  {/* Total */}
                  <div className="w-32 text-right pr-4">
                    <span className="font-bold text-[15px] text-foreground/80">{total}</span>
                  </div>

                  {/* Status / SKUs */}
                  <div className="w-48 flex justify-center items-center gap-2 sm:border-l border-gray-100">
                    {isProcessed ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-0 h-6 px-2 text-[11px] font-bold tracking-wide rounded-md gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('orders.processed')}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-500 border-0 h-6 px-2 text-[11px] font-bold tracking-wide rounded-md gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t('orders.pending')}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Extracted SKUs Mini Preview */}
                  {payload.line_items && Array.isArray(payload.line_items) && (
                    <div className="hidden lg:flex w-64 flex-wrap gap-1 items-center px-4 sm:border-l border-gray-100">
                      {payload.line_items.slice(0, 2).map((li: any, idx: number) => (
                        <span key={idx} className="text-[10px] font-mono text-muted-foreground bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/50 max-w-full truncate">
                          {li.quantity}x {li.sku}
                        </span>
                      ))}
                      {payload.line_items.length > 2 && (
                         <span className="text-[10px] font-bold text-muted-foreground">+{payload.line_items.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Action Link to Products if Pending */}
                  <div className="w-12 flex justify-end pr-2">
                     {!isProcessed && (
                       <Link href="/products" className="p-2 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors" title="Fix Missing Recipe in Products">
                          <ArrowRight className="w-4 h-4" />
                       </Link>
                     )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Package className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <h2 className="text-[15px] font-semibold text-foreground/80 tracking-tight">{t('orders.no_orders')}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('orders.no_orders_desc')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
