import { Suspense, useMemo, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { AlertTriangle, CircleAlert, CircleX, Crosshair } from 'lucide-react'
import type { DefectTableItem } from '~/types/defects-table.type'
import type { DashboardFilters as DashboardFiltersType } from '~/components/dashboard/dashboard-filters'
import { SectionCard, SectionCardWrapper } from '~/components/section-card'
import { DefectsTable } from '~/components/defects/defects-table'
import { createDashboardColumns } from '~/components/defects/defects-table-columns'
import { useProject } from '~/hooks/use-project'
import { DashboardFilters } from '~/components/dashboard/dashboard-filters'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const defects = useQuery(api.defects.listDefects)
  const users = useQuery(api.users.listUsers)
  const [projectId] = useProject()

  // Filter state
  const [filters, setFilters] = useState<DashboardFiltersType>({
    severity: null,
    type: null,
    assignedTo: null,
    reporter: null,
    flags: [],
  })

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
        if (projectId !== null && defect.projectId !== projectId) {
          return false
        }

        if (filters.severity !== null && defect.severity !== filters.severity) {
          return false
        }

        if (filters.type !== null && defect.defectType !== filters.type) {
          return false
        }

        if (filters.assignedTo !== null) {
          if (filters.assignedTo === 'unassigned') {
            if (defect.assignedTo) {
              return false
            }
          } else if (defect.assignedTo !== filters.assignedTo) {
            return false
          }
        }

        if (
          filters.reporter !== null &&
          defect.reporterId !== filters.reporter
        ) {
          return false
        }

        if (filters.flags.length > 0) {
          const hasAnyFlag = filters.flags.some((flag) =>
            defect.flags.includes(
              flag as 'unit test failure' | 'content issue',
            ),
          )
          if (!hasAnyFlag) {
            return false
          }
        }

        return true
      })
  }, [defects, projectId, filters])

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
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="shrink-0">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of all bugs and unit test failures
            </p>
          </div>
          <DashboardFilters
            filters={filters}
            users={users}
            onFiltersChange={setFilters}
          />
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

const Table = ({ data }: { data: any }) => {
  const columns = useMemo(() => createDashboardColumns(), [])

  return (
    <div className="mt-6">
      <Suspense fallback={<div>Loading...</div>}>
        <DefectsTable
          data={data}
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
          onAddComment={() => {}}
          viewMode="table"
          showActions={false}
        />
      </Suspense>
    </div>
  )
}
