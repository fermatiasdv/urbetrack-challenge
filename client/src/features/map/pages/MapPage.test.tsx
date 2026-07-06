import { act, render, screen, waitFor } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { MapPage } from './MapPage'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useIncidentsStore } from '../../../shared/services/incidents/useIncidentsStore'
import { useMapStore } from '../store/useMapStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import type { SupportedZone, Vehicle } from '../../../shared/types/domain.types'

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

// Real `zoneId`s (docs/verified-scope.md §2.1), used so `useSyncAssignmentStore`
// (wired into `MapPage` since docs/feature/12-availability-alert.md "Revisión
// 2026-07-06") can translate a vehicle's `zoneId` into its `SupportedZone`.
const ZONE_ID_BY_SUPPORTED_ZONE: Record<SupportedZone, string> = {
  MICROCENTRO: '1',
  PALERMO: '2',
  RECOLETA: '3',
  BELGRANO: '4',
  CABALLITO: '5'
}

const ZONES_RESPONSE = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' },
  { id: '3', name: 'Recoleta' },
  { id: '4', name: 'Belgrano' },
  { id: '5', name: 'Caballito' }
]

function activeVehicleIn(zone: SupportedZone, id: string): Vehicle {
  return {
    id,
    plate: `AA${id}00AA`,
    type: 'TRUCK',
    status: 'ACTIVE',
    capacity: 5000,
    zoneId: ZONE_ID_BY_SUPPORTED_ZONE[zone]
  }
}

// One ACTIVE vehicle per zone — baseline where every zone has availability,
// so no `AvailabilityAlert` renders by default.
function fullFleet(): Vehicle[] {
  return (Object.keys(ZONE_ID_BY_SUPPORTED_ZONE) as SupportedZone[]).map((zone, index) =>
    activeVehicleIn(zone, `v-${index}`)
  )
}

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
  // `useVehiclesQuery` is mocked above, so hydration never runs here: tests
  // seed `useVehiclesStore` directly. Defaults to a full fleet (no alerts);
  // individual tests override this before rendering.
  useVehiclesStore.setState({ vehicles: fullFleet(), hasHydrated: true })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(url.includes('/zones') ? ZONES_RESPONSE : [])
      })
    )
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

  it('renders AvailabilityAlert below the map and above MapEntityTabs (CA-06)', async () => {
    // Drop Microcentro's vehicle so exactly 1 zone is unavailable.
    useVehiclesStore.setState({
      vehicles: fullFleet().filter((vehicle) => vehicle.id !== 'v-0'),
      hasHydrated: true
    })

    renderPage()

    const mapContainer = await screen.findByTestId('map-container')
    const alert = await screen.findByRole('alert')
    const tabs = screen.getByTestId('assets-table')

    expect(alert).toHaveTextContent('No hay vehículos disponibles para Microcentro')

    const position = mapContainer.compareDocumentPosition(alert)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const alertVsTabs = alert.compareDocumentPosition(tabs)
    expect(alertVsTabs & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('reacts to vehicle changes end-to-end via useSyncAssignmentStore (CA-08)', async () => {
    renderPage()
    await screen.findByTestId('map-container')

    // Baseline: full fleet, no zone without an ACTIVE vehicle.
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())

    // "Te quedaste sin vehículos" en Palermo: se borra su único vehículo ACTIVE.
    act(() => {
      useVehiclesStore.getState().removeVehicle('v-1')
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No hay vehículos disponibles para Palermo'
      )
    })

    // Aparece un vehículo ACTIVE nuevo en esa zona: la alerta desaparece sola.
    act(() => {
      useVehiclesStore.getState().addVehicle(activeVehicleIn('PALERMO', 'v-new'))
    })

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
