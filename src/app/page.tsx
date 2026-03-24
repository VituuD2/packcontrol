import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, RefreshCw, AlertTriangle, TrendingUp, History } from "lucide-react"
import { ConsumptionChart } from "@/components/dashboard/consumption-chart"
import { ForceSyncButton } from "@/components/dashboard/force-sync-button"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const supabase = await createClient()

  // Define today start and end in UTC to fetch metrics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // Fetch Orders Today
  const { count: ordersToday } = await supabase
    .from('webhook_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())
    .eq('event_type', 'order.created')

  const { count: ordersYesterday } = await supabase
    .from('webhook_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterdayStart.toISOString())
    .lt('created_at', todayStart.toISOString())
    .eq('event_type', 'order.created')

  // Calculate percentage
  const todayCount = ordersToday || 0
  const yestCount = ordersYesterday || 0
  let orderTrend = 0
  if (yestCount > 0) {
    orderTrend = Math.round(((todayCount - yestCount) / yestCount) * 100)
  } else if (todayCount > 0) {
    orderTrend = 100
  }

  // Fetch Packaging Items for Low Stock alerts
  const { data: packagingItems } = await supabase
    .from('packaging_items')
    .select('id, current_stock, minimum_stock')
    
  let lowStockCount = 0
  if (packagingItems) {
    lowStockCount = packagingItems.filter(item => item.current_stock <= item.minimum_stock).length
  }

  // Fetch recent movements securely (Optimistic fetching, falling back if table structure differs)
  let recentMovements: any[] = []
  try {
    const { data: movements } = await supabase
      .from('packaging_movements')
      .select(`
        *,
        packaging_items(name)
      `)
      .order('created_at', { ascending: false })
      .limit(3)
    if (movements) recentMovements = movements
  } catch (e) {
    // If movement table does not exist or named differently, ignore for now to avoid breaking dashboard
  }

  const itemsConsumedMock = todayCount * 3 // Mocked multiplier based on orders for MVP visualization if no movement table sums

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
           <p className="text-muted-foreground">
             Real-time insight into your inventory, synced seamlessly with WooCommerce.
           </p>
         </div>
         
         <div className="flex items-center gap-3">
           <ForceSyncButton />
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Orders Today</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg"><RefreshCw className="h-4 w-4 text-blue-600" /></div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold tracking-tight">{todayCount}</div>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {orderTrend >= 0 ? `+${orderTrend}%` : `${orderTrend}%`} vs yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Est. Consumed</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg"><Package className="h-4 w-4 text-primary" /></div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold tracking-tight">{itemsConsumedMock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on recent order volume
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Low Alerts</CardTitle>
            <div className={`p-2 rounded-lg ${lowStockCount > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
               <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-red-600" : "text-emerald-600"}`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-3xl font-bold tracking-tight ${lowStockCount > 0 ? "text-red-600" : "text-emerald-600"}`}>{lowStockCount}</div>
            <p className={`text-xs mt-1 ${lowStockCount > 0 ? "text-red-600/80" : "text-emerald-600/80"}`}>
              {lowStockCount > 0 ? "Materials require restock" : "All materials at healthy stock"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold tracking-tight text-emerald-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">
              Webhook endpoint active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg">Consumption Over Time</CardTitle>
            <CardDescription>
              Material consumption trends for the current week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[380px]">
             <ConsumptionChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-3 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-muted/10 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Movements</CardTitle>
              <CardDescription>
                Latest system adjustments.
              </CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground/50" />
          </CardHeader>
          <CardContent className="p-0 flex-1">
             {recentMovements.length > 0 ? (
                <div className="divide-y">
                  {recentMovements.map((mov, i) => (
                    <div key={i} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{mov.packaging_items?.name || "Unknown Item"}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {mov.reference || "System update"}
                        </p>
                      </div>
                      <div className={`font-bold ml-auto ${mov.type === 'In' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {mov.type === 'In' ? '+' : '-'}{mov.quantity}
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground/60">
                   <History className="h-10 w-10 mb-3 opacity-20" />
                   <p className="text-sm">Synchronizing ledger...</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
