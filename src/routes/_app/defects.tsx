import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/defects')({
  component: Defects,
})

function Defects() {
  return <div>Defects</div>
}
