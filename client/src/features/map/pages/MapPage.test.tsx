import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { MapPage } from './MapPage'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { useMapStore } from '../store/useMapStore'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Rectangle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => ({ removeLayer: vi.fn() })
}))

vi.mock('../components/HeatmapLayer', () => ({
  HeatmapLayer: () => null
}))

vi.mock('../../vehicles/api/useVehiclesQuery', () => ({
  useVehiclesQuery: () => ({ isLoading: false })
}))

vi.mock('../../assets/components/AssetsTable', () => ({
  AssetsTable: () => <div data-testid="assets-table" />
}))
vi.mock('../../vehicles/components/VehiclesTable', () => ({
  VehiclesTable: () => <div data-testid="vehicles-table" />
}))
vi.mock('../../incidents/components/IncidentsTable', () => ({
  IncidentsTable: () => <div data-testid="incidents-table" />
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Theme>
        <MapPage />
      </Theme>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  useAssetsStore.setState({ assets: [], hasHydrated: false })
  useIncidentsStore.setState({ incidents: [], hasHydrated: false })
  useMapStore.setState({
    assets: [],
    incidents: [],
    heatmapEnabled: true,
    heatmapFilters: {
      statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
      types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
    },
    selectedZone: null
  })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([]) })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MapPage', () => {
  it('renders the map, the heatmap legend/filters and the 3 entity tabs', async () => {
    renderPage()

    expect(await screen.findByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('heatmap-legend')).toBeInTheDocument()
    expect(screen.getByTestId('heatmap-filters')).toBeInTheDocument()
    expect(screen.getByTestId('assets-table')).toBeInTheDocument()
  })

  it('hides the heatmap legend/filters when the heatmap is toggled off', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByTestId('map-container')
    await user.click(screen.getByRole('checkbox'))

    expect(screen.queryByTestId('heatmap-legend')).not.toBeInTheDocument()
    expect(screen.queryByTestId('heatmap-filters')).not.toBeInTheDocument()
  })
})
