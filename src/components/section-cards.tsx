import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Bugs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,247
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Increased this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            All reported issues tracked
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Bugs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            342
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -12%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 12% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Active issues requiring attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Resolved This Week</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            89
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircle2 />
              +15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong resolution rate <CheckCircle2 className="size-4" />
          </div>
          <div className="text-muted-foreground">Bugs fixed in last 7 days</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Critical Bugs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            23
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <AlertTriangle />
              -5
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            High priority issues <AlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Requires immediate attention
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
