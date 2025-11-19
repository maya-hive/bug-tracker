import { Suspense } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '~/routes/_app/dashboard/datatable/dashboard-table'
import { SectionCards } from '~/components/section-cards'

export const Route = createFileRoute('/_app/dashboard/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <>
      <SectionCards />
      <Table data={data} />
    </>
  )
}

const Table = ({ data }: { data: any }) => (
  <div className="mt-6">
    <Suspense fallback={<div>Loading...</div>}>
      <DataTable data={data} />
    </Suspense>
  </div>
)

const data = [
  {
    id: 1,
    header: 'Cover page',
    type: 'Cover page',
    status: 'In Process',
    target: '18',
  },
  {
    id: 2,
    header: 'Table of contents',
    type: 'Table of contents',
    status: 'Done',
    target: '29',
  },
  {
    id: 3,
    header: 'Executive summary',
    type: 'Narrative',
    status: 'Done',
    target: '10',
  },
  {
    id: 4,
    header: 'Technical approach',
    type: 'Narrative',
    status: 'Done',
    target: '27',
  },
  {
    id: 5,
    header: 'Design',
    type: 'Narrative',
    status: 'In Process',
    target: '2',
  },
  {
    id: 6,
    header: 'Capabilities',
    type: 'Narrative',
    status: 'In Process',
    target: '20',
  },
  {
    id: 7,
    header: 'Integration with existing systems',
    type: 'Narrative',
    status: 'In Process',
    target: '19',
  },
  {
    id: 8,
    header: 'Innovation and Advantages',
    type: 'Narrative',
    status: 'Done',
    target: '25',
  },
  {
    id: 9,
    header: "Overview of EMR's Innovative Solutions",
    type: 'Technical content',
    status: 'Done',
    target: '7',
  },
]
