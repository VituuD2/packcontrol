import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Package, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, History, BarChart3, Clock, CheckCircle2 } from "lucide-react"
import { ChartWrapper as ConsumptionChart } from "@/components/dashboard/chart-wrapper"
import { ForceSyncButton } from "@/components/dashboard/force-sync-button"
import { createClient } from "@/lib/supabase/server"
import { getTranslation } from "@/lib/i18n/server"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const supabase = await createClient()
  const t = await getTranslation()

  // Define today start and end in UTC to fetch metrics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // Fetch All-time Orders Processed (Distinct by external_id)
  const { data: allProcessedEvents } = await supabase
    .from('webhook_events')
    .select('external_id')
    .eq('processed', true)
    
  // Deduplicate using a Set
  const uniqueProcessIds = new Set(allProcessedEvents?.map(e => e.external_id).filter(Boolean))
  const todayCount = uniqueProcessIds.size
  const orderTrend = 0 // Trend Disabled for All-Time count

  // Fetch Pending Webhooks
  const { count: pendingCount } = await supabase
    .from('webhook_events')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'processing', 'failed'])
    
  const unprocessedOrdersCount = pendingCount || 0

  // Fetch Specifically Failed Webhooks (for detailed alert if needed)
  const { count: failedCount } = await supabase
    .from('webhook_events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
  
  const permanentlyFailedCount = failedCount || 0

  // Fetch Packaging Items for Low Stock alerts
  const { data: packagingItems } = await supabase
    .from('packaging_items')
    .select('id, name, current_stock, minimum_stock')
    
  let lowStockCount = 0
  if (packagingItems) {
    lowStockCount = packagingItems.filter(item => item.current_stock <= item.minimum_stock).length
  }

  // Fetch recent movements securely (Optimistic fetching)
  let recentMovements: any[] = []
  let sevenDayMovements: any[] = []
  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  try {
    const { data: movements } = await supabase
      .from('packaging_movements')
      .select(`
        *,
        packaging_items(name)
      `)
      .order('created_at', { ascending: false })
      .gte('created_at', sevenDaysAgo.toISOString())
      
    if (movements) {
      const normalizedMovements = movements.map(m => ({ ...m, movement_type: m.movement_type?.toLowerCase() || '' }))
      recentMovements = normalizedMovements.slice(0, 5)
      sevenDayMovements = normalizedMovements
    }
  } catch (e) {
    // Silent fail if table not exist yet in local setup
  }

  // Generate chart data dynamically
  const chartDataMap: Record<string, any> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d)
    chartDataMap[dayName] = { name: dayName }
  }

  // Fetch ALL out movements for the global totalItemsConsumed metric
  const { data: allOutMovements } = await supabase
    .from('packaging_movements')
    .select('quantity')
    .eq('movement_type', 'out')
    
  let totalItemsConsumed = 0
  if (allOutMovements) {
      totalItemsConsumed = allOutMovements.reduce((acc, mov) => acc + (mov.quantity || 0), 0)
  }

  sevenDayMovements.forEach(mov => {
    if (mov.movement_type === 'out') {
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(mov.created_at))
      const itemName = mov.packaging_items?.name || "Other"
      chartDataMap[dayName][itemName] = (chartDataMap[dayName][itemName] || 0) + mov.quantity
    }
  })
  
  // Convert map to array for the chart
  // Only use if there is actual Out data, else empty array
  const hasOutData = sevenDayMovements.some(m => m.movement_type === 'out')
  const chartData = hasOutData ? Object.values(chartDataMap) : []

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto p-2">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold tracking-tight text-foreground/90 dark:text-[#EDEDED]">{t('dashboard.title')}</h1>
         <ForceSyncButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/orders" className="block outline-none ring-0">
          <Card className="rounded-[1.25rem] border-0 dark:border dark:border-border shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card p-2 flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-accent/30 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5 pt-5">
              <span className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">{t('dashboard.orders')}</span>
              <div className="p-2 bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl"><RefreshCw className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="px-5 pb-5 mt-auto">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold tracking-tighter">{todayCount}</span>
                {orderTrend !== 0 && (
                  <span className={`flex items-center text-xs font-semibold mb-1 ${orderTrend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {orderTrend > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {Math.abs(orderTrend)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/movements" className="block outline-none ring-0">
          <Card className="rounded-[1.25rem] border-0 dark:border dark:border-border shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card p-2 flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-accent/30 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5 pt-5">
              <span className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">{t('dashboard.consumption')}</span>
              <div className="p-2 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-xl"><Package className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="px-5 pb-5 mt-auto">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold tracking-tighter">{totalItemsConsumed}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/packaging" className="block outline-none ring-0">
          <Card className="rounded-[1.25rem] border-0 dark:border dark:border-border shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card p-2 flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-accent/30 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5 pt-5">
              <span className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">{t('dashboard.alerts')}</span>
              <div className={`p-2 rounded-xl ${lowStockCount > 0 ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
                 {lowStockCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 mt-auto">
              <div className={`flex items-end gap-3`}>
                <span className={`text-4xl font-extrabold tracking-tighter ${lowStockCount > 0 ? "text-rose-500" : "text-emerald-500"}`}>{lowStockCount}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/orders?filter=pending" className="block outline-none ring-0">
          <Card className="rounded-[1.25rem] border-0 dark:border dark:border-border shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card p-2 flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-accent/30 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5 pt-5">
              <span className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase">{t('dashboard.pending_sync')}</span>
              <div className={`p-2 rounded-xl ${unprocessedOrdersCount > 0 ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
                 {unprocessedOrdersCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 mt-auto">
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-extrabold tracking-tighter ${unprocessedOrdersCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>{unprocessedOrdersCount}</span>
              </div>
              {unprocessedOrdersCount > 0 && <span className="text-xs font-semibold text-amber-500 mt-1 block">{t('dashboard.orders_missing')}</span>}
              {permanentlyFailedCount > 0 && (
                <div className="mt-2 p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <span className="text-[11px] font-bold text-rose-500 block uppercase tracking-wider mb-1">{permanentlyFailedCount} falhas persistentes</span>
                  <p className="text-[10px] text-rose-400/80 leading-tight">Verifique se todos os produtos possuem regras de embalagem configuradas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="col-span-8 rounded-[1.25rem] border-0 dark:border dark:border-white/[0.04] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-[#141415] p-2">
          <CardHeader className="flex flex-row items-center gap-2 px-6 pt-6 pb-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-[15px] font-bold text-foreground">Market Statistics</h2>
            <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </CardHeader>
          <CardContent className="pt-2 px-6 h-[400px]">
             <ConsumptionChart data={chartData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-4 rounded-[1.25rem] border-0 dark:border dark:border-white/[0.04] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-[#141415] p-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50/50 dark:border-border">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              <h2 className="text-[15px] font-bold text-foreground">History</h2>
            </div>
          </CardHeader>
          <CardContent className="p-2 flex-1 pt-2">
             {recentMovements.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {recentMovements.map((mov, i) => (
                    <div key={i} className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                      <div className={`p-2 rounded-xl mr-3 ${mov.movement_type === 'in' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                         {mov.movement_type === 'in' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5 flex-1 w-full overflow-hidden">
                        <p className="text-[13px] font-bold leading-none text-foreground/80 truncate">{mov.packaging_items?.name || "Unknown Item"}</p>
                        <p className="text-[11px] font-medium text-muted-foreground/60 flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {mov.source_id || "System update"}
                        </p>
                      </div>
                      <div className={`font-bold text-[14px] ml-auto ${mov.movement_type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {mov.movement_type === 'in' ? '+' : '-'}{mov.quantity}
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center p-12 h-full gap-2 text-muted-foreground/40">
                   <History className="w-8 h-8 opacity-20" />
                   <span className="text-xs font-medium">No recent transactions</span>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
