'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'

import type { ChartConfig } from '~/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { useProject } from '~/hooks/use-project'

export const description = 'An interactive bar chart'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function DefectsOvertimeChart() {
  const [projectId] = useProject()
  const result = useQuery(api.defects.getDefectsOvertime, {
    projectId: projectId,
  })

  const chartConfig = React.useMemo<ChartConfig>(() => {
    if (!result?.types) return {}

    const config: ChartConfig = {
      type: {
        label: 'Defect Type',
      },
    }

    result.types.forEach((type, index) => {
      config[type.value] = {
        label: type.label,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })

    return config
  }, [result?.types])

  const totals = React.useMemo(() => {
    if (!result) return {}

    const totalsMap: Record<string, number> = {}

    result.types.forEach((type) => {
      totalsMap[type.value] = result.data.reduce((acc, curr) => {
        const value = (curr as Record<string, any>)[type.value]
        return acc + (typeof value === 'number' ? value : 0)
      }, 0)
    })

    return totalsMap
  }, [result])

  return (
    <Card className="h-full py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Defects Lifecycle Over Time</CardTitle>
          <CardDescription>
            Showing the total count of defects by type over time
          </CardDescription>
        </div>
        {result?.types && result.types.length > 0 && (
          <div className="flex flex-wrap">
            {result.types.map((type) => {
              const totalCount = totals[type.value] || 0
              return (
                <div
                  key={type.value}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-6 sm:py-6"
                  style={{ minWidth: '120px' }}
                >
                  <span className="text-muted-foreground text-xs">
                    {type.label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-2xl">
                    {totalCount.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {!result ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : result.data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={result.data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="type"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }}
                  />
                }
              />
              {result.types.map((type) => (
                <Bar
                  key={type.value}
                  dataKey={type.value}
                  stackId="a"
                  fill={`var(--color-${type.value})`}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
