import { Suspense, useMemo } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { AlertTriangle, CircleAlert, CircleX, Crosshair } from 'lucide-react'
import type { DefectTableItem } from '~/types/defects-table.type'
import { SectionCard, SectionCardWrapper } from '~/components/section-card'
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

  const metrics = useMemo(() => {
    const totalBugs = defectsData.filter(
      (defect) => defect.defectType === 'bug',
    ).length
    const openBugs = defectsData.filter(
      (defect) => defect.status === 'open' || defect.status === 'reopened',
    ).length
    const criticalBugs = defectsData.filter(
      (defect) => defect.severity === 'critical',
    ).length
    const unitTestFailures = defectsData.filter((defect) =>
      defect.flags.includes('unit test failure'),
    ).length

    return {
      totalBugs,
      openBugs,
      criticalBugs,
      unitTestFailures,
    }
  }, [defectsData])

  if (defects === undefined) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all bugs and unit test failures
          </p>
        </div>
      </div>
      <SectionCardWrapper>
        <SectionCard
          title="Total Bugs"
          value={metrics.totalBugs}
          icon={<Crosshair />}
          description="All reported issues tracked"
        />
        <SectionCard
          title="Open Bugs"
          value={metrics.openBugs}
          icon={<CircleAlert />}
          description="Active issues requiring attention"
        />
        <SectionCard
          title="Critical Bugs"
          value={metrics.criticalBugs}
          icon={<AlertTriangle />}
          description="Requires immediate attention"
        />
        <SectionCard
          title="Unit Test Failures"
          value={metrics.unitTestFailures}
          icon={<CircleX />}
          description="Unit tests failed"
        />
      </SectionCardWrapper>
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
