import { createFileRoute } from '@tanstack/react-router'
import { TaskHeader } from '~/components/layout/header'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-screen">
      <TaskHeader />
      <main className="w-full h-full overflow-x-auto"></main>
    </div>
  )
}
