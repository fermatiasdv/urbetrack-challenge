import { act } from 'react'
import { render, screen } from '@testing-library/react'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { routeTree } from './routes'
import { router } from './router'

function createTestRouter(initialPath: string) {
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  return createRouter({ routeTree, history })
}

/**
 * `VehiclesPage` uses `@tanstack/react-query` (see
 * docs/feature/02-vehicle-statuscard.md), same as the real app composition in
 * `main.tsx` (`QueryClientProvider` above the router). Mirrors the pattern
 * already used in `component-test/VehiclesTable.test.tsx`.
 */
function renderRouter(testRouter: ReturnType<typeof createTestRouter>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={testRouter} />
    </QueryClientProvider>
  )
}

const SCREENS: readonly { path: string; legend: string }[] = [
  { path: '/mapa', legend: 'Mapa' },
  { path: '/activos', legend: 'Activos' },
  { path: '/vehiculos', legend: 'Vehículos' },
  { path: '/incidentes', legend: 'Incidentes' }
]

describe('routeTree', () => {
  it('registers the root layout plus the five expected screens', () => {
    expect(routeTree.children).toHaveLength(5)
  })
})

describe('router', () => {
  it('exposes the app router built from routeTree', () => {
    expect(router.routeTree.children).toHaveLength(5)
  })
})

describe('router integration', () => {
  it('renders the Dashboard legend on the initial route', async () => {
    const testRouter = createTestRouter('/')
    renderRouter(testRouter)

    await screen.findByRole('heading', { name: 'Dashboard' })
  })

  it('keeps the sidebar mounted (same DOM node) while navigating between screens', async () => {
    const testRouter = createTestRouter('/')
    renderRouter(testRouter)

    await screen.findByRole('heading', { name: 'Dashboard' })
    const sidebar = screen.getByRole('navigation')

    for (const { path, legend } of SCREENS) {
      await act(async () => {
        await testRouter.navigate({ to: path })
      })
      await screen.findByRole('heading', { name: legend })
      expect(screen.getByRole('navigation')).toBe(sidebar)
    }
  })
})
