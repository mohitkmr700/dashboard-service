"use client"

import * as React from "react"
import { TooltipProps } from "recharts"
import { cn } from "../../lib/utils"

export type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps {
  children: React.ReactNode
  config: ChartConfig
}

export function ChartContainer({ children }: ChartContainerProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  )
}


interface ChartTooltipContentProps extends TooltipProps<number, string> {
  indicator?: "line" | "bar"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "line",
}: ChartTooltipContentProps) {
  if (!active || !payload) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  indicator === "line" ? "h-0.5 w-4" : "h-2 w-2"
                )}
                style={{ backgroundColor: item.color || 'transparent' }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 