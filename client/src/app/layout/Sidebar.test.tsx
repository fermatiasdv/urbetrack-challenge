import { render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

function renderSidebar() {
  const rootRoute = createRootRoute({ component: Sidebar })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] })
  })
  return render(<RouterProvider router={router} />)
}

describe('Sidebar', () => {
  it('renders the URBETRACK logo and the five navigation links with their target routes', async () => {
    renderSidebar()

    await screen.findByText('URBETRACK')

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('href', '/mapa')
    expect(screen.getByRole('link', { name: 'Activos' })).toHaveAttribute('href', '/activos')
    expect(screen.getByRole('link', { name: 'Vehículos' })).toHaveAttribute('href', '/vehiculos')
    expect(screen.getByRole('link', { name: 'Incidentes' })).toHaveAttribute('href', '/incidentes')
  })
})
