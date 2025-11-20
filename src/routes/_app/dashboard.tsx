import { Suspense } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { DefectTableItem } from '../../components/defects/defects-table.types'
import { SectionCards } from '~/components/section-cards'
import { DefectsTable } from '~/components/defects/defects-table'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const defects = useQuery(api.defects.listDefects)

  if (defects === undefined) {
    return null
  }

  const defectsData: Array<DefectTableItem> = defects.map((defect) => ({
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
      />
    </Suspense>
  </div>
)
