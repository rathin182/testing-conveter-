import RoleDashboard from '@/components/admin/RoleDashboard'
import DashboardShell from '@/components/layout/DashboardShell'

import React from 'react'

const page = () => {
  return (
    <DashboardShell><RoleDashboard role="ENGINEER" /></DashboardShell>
  )
}

export default page