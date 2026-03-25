"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function ConsumptionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col text-muted-foreground/40">
        <svg className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p className="text-sm font-medium">No tracking data available yet</p>
      </div>
    )
  }

  // Collect unique keys from all data objects (excluding 'name')
  const keysSet = new Set<string>()
  data.forEach(d => {
    Object.keys(d).forEach(k => {
      if (k !== 'name') keysSet.add(k)
    })
  })
  const keys = Array.from(keysSet)
  
  // Define a set of pleasing SaaS colors for the lines
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"]

  // Fill in missing keys with 0 so Recharts Area can draw continuous lines instead of sparse dots
  const normalizedData = data.map(d => {
    const newObj = { ...d }
    keys.forEach(k => {
      if (newObj[k] === undefined) newObj[k] = 0
    })
    return newObj
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        {keys.map((key, i) => (
          <Area 
            key={key}
            type="monotone" 
            dataKey={key} 
            stroke={colors[i % colors.length]} 
            strokeWidth={3}
            fill={colors[i % colors.length]}
            fillOpacity={0.15} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
