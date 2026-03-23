"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  { name: "Mon", Bags: 12, Boxes: 4 },
  { name: "Tue", Bags: 19, Boxes: 7 },
  { name: "Wed", Bags: 15, Boxes: 5 },
  { name: "Thu", Bags: 22, Boxes: 10 },
  { name: "Fri", Bags: 30, Boxes: 14 },
  { name: "Sat", Bags: 8, Boxes: 2 },
  { name: "Sun", Bags: 10, Boxes: 3 },
]

export function ConsumptionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle"/>
        <Bar dataKey="Bags" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Boxes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
