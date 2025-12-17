'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
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

const chartConfig = {
  count: {
    label: 'Defects',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function DefectSeverityRadar() {
  const [projectId] = useProject()
  const data = useQuery(api.defects.getDefectSeverityDistribution, {
    projectId: projectId,
  })

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b items-center pb-4">
          <CardTitle>Defect Severity Distribution</CardTitle>
          <CardDescription>
            Showing the distribution of defects by severity
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex items-center justify-center min-h-[250px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b items-center pb-4">
        <CardTitle>Defect Severity Distribution</CardTitle>
        <CardDescription>
          Showing the distribution of defects by severity
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-visible">
        <div className="overflow-visible">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <RadarChart data={data} margin={{ right: 20, left: 20 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="severity" />
              <PolarGrid />
              <Radar
                dataKey="count"
                fill="var(--color-count)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
