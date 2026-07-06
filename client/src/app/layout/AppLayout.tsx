import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function AppLayout(): JSX.Element {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
