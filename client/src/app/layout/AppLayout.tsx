import { Outlet } from '@tanstack/react-router'
import { Box } from '@radix-ui/themes'
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar'

export function AppLayout(): JSX.Element {
  return (
    <Box minHeight="100vh">
      <Sidebar />
      <Box ml={SIDEBAR_WIDTH} p="6">
        <Outlet />
      </Box>
    </Box>
  )
}
