import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects')({
  component: Projects,
})

function Projects() {
  return <div>Projects</div>
}
