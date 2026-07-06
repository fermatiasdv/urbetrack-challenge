import { Outlet } from '@tanstack/react-router'
import { Box } from '@radix-ui/themes'
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar'
import { useReconcileAssignments } from '../../shared/services/assignments/useReconcileAssignments'

export function AppLayout(): JSX.Element {
  // Mounted here — the only component present on every route — so stale
  // vehicle↔activo/incidente assignments are pruned regardless of the current
  // screen (docs/feature/maps-asign-vehicle.md §2).
  useReconcileAssignments()

  return (
    <Box minHeight="100vh">
      <Sidebar />
      <Box ml={SIDEBAR_WIDTH} p="6">
        <Outlet />
      </Box>
    </Box>
  )
}
