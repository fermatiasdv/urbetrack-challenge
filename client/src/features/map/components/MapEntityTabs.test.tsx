import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { MapEntityTabs } from './MapEntityTabs'

vi.mock('../../assets/components/AssetsTable', () => ({
  AssetsTable: () => <div data-testid="assets-table" />
}))
vi.mock('../../vehicles/components/VehiclesTable', () => ({
  VehiclesTable: () => <div data-testid="vehicles-table" />
}))
vi.mock('../../incidents/components/IncidentsTable', () => ({
  IncidentsTable: () => <div data-testid="incidents-table" />
}))
vi.mock('../../vehicles/api/useVehiclesQuery', () => ({
  useVehiclesQuery: () => ({ isLoading: false })
}))

// `AssetModal`/`VehicleModal`/`IncidentModal` are mounted here since
// docs/specs/fix-map-entity-tabs-modals.md — each calls `useZonesQuery`
// unconditionally (even while closed/rendering `null`), which needs a
// `QueryClientProvider` ancestor and a `fetch` stub, same setup as
// `MapPage.test.tsx`.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderTabs() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Theme>{children}</Theme>
      </QueryClientProvider>
    )
  }
  return render(<MapEntityTabs />, { wrapper })
}

describe('MapEntityTabs', () => {
  it('shows the Activos table by default', () => {
    renderTabs()

    expect(screen.getByTestId('assets-table')).toBeInTheDocument()
    expect(screen.queryByTestId('vehicles-table')).not.toBeInTheDocument()
    expect(screen.queryByTestId('incidents-table')).not.toBeInTheDocument()
  })

  it('switches to the Vehículos tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: /^Vehículos/ }))

    expect(screen.getByTestId('vehicles-table')).toBeInTheDocument()
  })

  it('switches to the Incidentes tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: /^Incidentes/ }))

    expect(screen.getByTestId('incidents-table')).toBeInTheDocument()
  })
})
