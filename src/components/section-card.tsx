import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

interface Props {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}

export function SectionCard({ title, value, icon, description }: Props) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">{icon}</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 text-muted-foreground">
          {description}
        </div>
      </CardFooter>
    </Card>
  )
}
