"use client"

import nextDynamic from "next/dynamic"
import { BarChart3 } from "lucide-react"

const LazyChart = nextDynamic(
  () => import('./consumption-chart').then(mod => mod.ConsumptionChart),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-muted/40 w-full h-full rounded-xl flex items-center justify-center text-muted-foreground/40">
         <BarChart3 className="w-8 h-8 opacity-20" />
      </div>
    )
  }
)

export function ChartWrapper({ data }: { data: any[] }) {
  return <LazyChart data={data} />
}
