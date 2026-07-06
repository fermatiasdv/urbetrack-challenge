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
  it('renders the header and the four navigation links with their target routes', async () => {
    renderSidebar()

    await screen.findByText('Logistics Manager')
    expect(screen.getByText('Operational Hub')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Mapas/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Registro de Activos/ })).toHaveAttribute(
      'href',
      '/activos'
    )
    expect(screen.getByRole('link', { name: /Vehículos/ })).toHaveAttribute('href', '/vehiculos')
    expect(screen.getByRole('link', { name: /Incidentes/ })).toHaveAttribute('href', '/incidentes')
  })

  it('renders the "Reportar incidente" footer button', async () => {
    renderSidebar()

    await screen.findByText('Logistics Manager')

    expect(screen.getByRole('button', { name: /Reportar incidente/ })).toBeInTheDocument()
  })

  it('highlights the active route link with the active nav styles', async () => {
    renderSidebar('/')

    const activeLink = await screen.findByRole('link', { name: /Mapas/ })
    expect(activeLink).toHaveStyle({
      backgroundColor: designTokens.colors.secondaryContainer,
      color: designTokens.colors.onSecondaryContainer
    })

    const inactiveLink = screen.getByRole('link', { name: /Registro de Activos/ })
    expect(inactiveLink).not.toHaveStyle({
      backgroundColor: designTokens.colors.secondaryContainer
    })
  })

  it('keeps the same Radix Button variant across active and inactive nav links, so the box size does not change on selection', async () => {
    renderSidebar('/')

    const activeLink = await screen.findByRole('link', { name: /Mapas/ })
    const inactiveLink = screen.getByRole('link', { name: /Registro de Activos/ })

    expect(activeLink.className).toContain('rt-variant-ghost')
    expect(inactiveLink.className).toContain('rt-variant-ghost')
    expect(activeLink.className).not.toContain('rt-variant-soft')
  })
})
