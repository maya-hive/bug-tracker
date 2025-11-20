import { Suspense, useMemo } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { DefectTableItem } from '~/types/defects-table.type'
import { SectionCards } from '~/components/section-cards'
import { DefectsTable } from '~/components/defects/defects-table'
import { useProject } from '~/hooks/use-project'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const defects = useQuery(api.defects.listDefects)
  const [projectId] = useProject()

  const defectsData: Array<DefectTableItem> = useMemo(() => {
    if (defects === undefined) {
      return []
    }

    return defects
      .map((defect) => ({
        _id: defect._id,
        _creationTime: defect._creationTime,
        projectId: defect.projectId,
        projectName: defect.projectName,
        name: defect.name,
        module: defect.module,
        defectType: defect.defectType,
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: defect.assignedToName,
        reporterId: defect.reporterId,
        reporterName: defect.reporterName,
        severity: defect.severity,
        flags: defect.flags,
        status: defect.status,
        comments: defect.comments,
      }))
      .filter((defect) => {
        // If projectId is null (All Projects), show all defects
        if (projectId === null) {
          return true
        }

        // Otherwise, filter by projectId
        return defect.projectId === projectId
      })
  }, [defects, projectId])

  if (defects === undefined) {
    return null
  }

  return (
    <>
      <SectionCards />
      <Table data={defectsData} />
    </>
  )
}

const Table = ({ data }: { data: any }) => (
  <div className="mt-6">
    <Suspense fallback={<div>Loading...</div>}>
      <DefectsTable
        data={data}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddComment={() => {}}
        viewMode="table"
        showActions={false}
      />
    </Suspense>
  </div>
)
