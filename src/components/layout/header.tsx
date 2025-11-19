import { useState } from 'react'
import { Bug, Folders } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ModeToggle } from '~/components/mode-toggle'
import { NavUser } from '~/components/nav-user'
import { UserPresence } from '~/components/user-presence'
import { useAuthUser } from '~/contexts/use-auth-user'
import { NavMenu } from '~/components/layout/nav-menu'
import { CreateProjectDialog } from '~/routes/_app/projects/create-project-dialog'
import { CreateDefectDialog } from '~/routes/_app/defects/create-defect-dialog'

export function TaskHeader() {
  const user = useAuthUser()
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [createDefectOpen, setCreateDefectOpen] = useState(false)

  return (
    <>
      <div className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-3 lg:px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <Bug className="size-6" />
              <h1 className="text-base lg:text-lg font-semibold">
                Bug Tracker
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <UserPresence />
            </div>
            <ModeToggle />
            <NavUser user={user} />
          </div>
        </div>

        <div className="flex items-center justify-between pl-1 pr-3 lg:pl-3 lg:pr-6 py-3 border-t border-border overflow-x-auto">
          <NavMenu />
          <ActionItems
            onCreateProject={() => setCreateProjectOpen(true)}
            onCreateDefect={() => setCreateDefectOpen(true)}
          />
        </div>
      </div>
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
      <CreateDefectDialog
        open={createDefectOpen}
        onOpenChange={setCreateDefectOpen}
      />
    </>
  )
}

const ActionItems = ({
  onCreateProject,
  onCreateDefect,
}: {
  onCreateProject: () => void
  onCreateDefect: () => void
}) => (
  <div className="flex items-center gap-2 shrink-0">
    <Button variant="outline" onClick={onCreateDefect}>
      <Bug className="size-4" />
      Create Defect
    </Button>
    <Button variant="outline" onClick={onCreateProject}>
      <Folders className="size-4" />
      Create Project
    </Button>
  </div>
)
