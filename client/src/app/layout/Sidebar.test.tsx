import { render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'
import { designTokens } from '../styles/tokens'

function renderSidebar(initialPath = '/') {
  const rootRoute = createRootRoute({ component: Sidebar })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] })
  })
  return render(<RouterProvider router={router} />)
}

describe('Sidebar', () => {
  it('renders the header and the five navigation links with their target routes', async () => {
    renderSidebar()

    await screen.findByText('Logistics Manager')
    expect(screen.getByText('Operational Hub')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Mapas/ })).toHaveAttribute('href', '/mapa')
    expect(screen.getByRole('link', { name: /Registro de Activos/ })).toHaveAttribute(
      'href',
      '/activos'
    )
    expect(screen.getByRole('link', { name: /Vehículos/ })).toHaveAttribute('href', '/vehiculos')
    expect(screen.getByRole('link', { name: /Incidentes/ })).toHaveAttribute('href', '/incidentes')
  })

  it('renders the "Report Incident" footer button', async () => {
    renderSidebar()

    await screen.findByText('Logistics Manager')

    expect(screen.getByRole('button', { name: /Report Incident/ })).toBeInTheDocument()
  })

  it('highlights the active route link with the active nav styles', async () => {
    renderSidebar('/mapa')

    const activeLink = await screen.findByRole('link', { name: /Mapas/ })
    expect(activeLink).toHaveStyle({
      backgroundColor: designTokens.colors.secondaryContainer,
      color: designTokens.colors.onSecondaryContainer
    })

    const inactiveLink = screen.getByRole('link', { name: /Dashboard/ })
    expect(inactiveLink).not.toHaveStyle({
      backgroundColor: designTokens.colors.secondaryContainer
    })
  })
})
