import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AssetMarkersLayer } from './AssetMarkersLayer'
import { useMapStore } from '../store/useMapStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useAssignmentsStore } from '../../../shared/services/assignments/useAssignmentsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'
import type { Vehicle, Zone } from '../../../shared/types/domain.types'

vi.mock('react-leaflet', () => ({
  Marker: ({ children, position }: { children: ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={position.join(',')}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <div data-testid="tooltip">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div data-testid="popup">{children}</div>
}))

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)
const ZONES: Zone[] = [{ id: '1', name: 'Microcentro' }]

const ASSET_OK: GeoTaggedAsset = {
  id: 'asset-1',
  type: 'CONTAINER',
  status: 'OK',
  lat: -34.6,
  lng: -58.38,
  address: 'Av. Corrientes 1',
  zoneId: '1',
  derivedZone: 'MICROCENTRO'
}

const ASSET_WITH_INCIDENT: GeoTaggedAsset = {
  id: 'asset-2',
  type: 'BIN',
  status: 'FULL',
  lat: -34.6,
  lng: -58.38,
  address: 'Av. Santa Fe 2',
  zoneId: '1',
  derivedZone: 'MICROCENTRO'
}

const ASSOCIATED_INCIDENT: AssociatedIncident = {
  id: 'incident-1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.6,
  lng: -58.38,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z',
  derivedZone: 'MICROCENTRO',
  associatedAssetId: 'asset-2'
}

const ASSET_OUT_OF_SERVICE: GeoTaggedAsset = {
  id: 'asset-3',
  type: 'BENCH',
  status: 'OUT_OF_SERVICE',
  lat: -34.6,
  lng: -58.38,
  address: 'Av. Callao 3',
  zoneId: '1',
  derivedZone: 'MICROCENTRO'
}

const ACTIVE_TRUCK: Vehicle = {
  id: 'v1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}

const ACTIVE_VAN: Vehicle = {
  id: 'v2',
  plate: 'DEF456',
  type: 'VAN',
  status: 'ACTIVE',
  capacity: 1500,
  zoneId: '1'
}

function renderLayer() {
  return render(
    <Theme>
      <AssetMarkersLayer />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
  useAssignmentsStore.setState({ assetToVehicle: {}, incidentToVehicle: {} })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('AssetMarkersLayer', () => {
  it('renders one marker per asset', () => {
    useMapStore.setState({ assets: [ASSET_OK, ASSET_WITH_INCIDENT], incidents: [] })

    renderLayer()

    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('shows "OK" for an OK asset without an associated incident', () => {
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    renderLayer()

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('shows "Completo" for a FULL asset without an associated incident', () => {
    useMapStore.setState({ assets: [ASSET_WITH_INCIDENT], incidents: [] })

    renderLayer()

    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('shows incident info for an asset with an associated incident', () => {
    useMapStore.setState({ assets: [ASSET_WITH_INCIDENT], incidents: [ASSOCIATED_INCIDENT] })

    renderLayer()

    expect(screen.getByText('Tipo de incidente: OVERFLOW')).toBeInTheDocument()
  })

  it('offers the assignment control in the popup for an OK asset with an eligible vehicle', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    renderLayer()

    expect(screen.getByLabelText('Vehículo asignado')).toBeInTheDocument()
  })

  it('offers the assignment control for a FULL asset', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_VAN] })
    useMapStore.setState({ assets: [ASSET_WITH_INCIDENT], incidents: [] })

    renderLayer()

    expect(screen.getByLabelText('Vehículo asignado')).toBeInTheDocument()
  })

  it('offers the assignment control for a DAMAGED asset', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useMapStore.setState({ assets: [{ ...ASSET_OK, status: 'DAMAGED' }], incidents: [] })

    renderLayer()

    expect(screen.getByLabelText('Vehículo asignado')).toBeInTheDocument()
  })

  it('does not offer the assignment control for an OUT_OF_SERVICE asset', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useMapStore.setState({ assets: [ASSET_OUT_OF_SERVICE], incidents: [] })

    renderLayer()

    expect(screen.queryByLabelText('Vehículo asignado')).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'La asignación de vehículo no está disponible: el activo está fuera de servicio.'
      )
    ).toBeInTheDocument()
  })

  it('still renders while the zones query is loading (zones is undefined)', () => {
    mockedUseZonesQuery.mockReturnValue({ data: undefined } as unknown as UseQueryResult<Zone[]>)
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    renderLayer()

    expect(screen.getAllByTestId('marker')).toHaveLength(1)
  })

  it('assigns the selected vehicle to the asset', async () => {
    const user = userEvent.setup()
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    renderLayer()

    await user.click(screen.getByLabelText('Vehículo asignado'))
    await user.click(await screen.findByRole('option', { name: 'Camión (ABC123)' }))

    expect(useAssignmentsStore.getState().assetToVehicle[ASSET_OK.id]).toBe(ACTIVE_TRUCK.id)
  })

  it('clears the assigned vehicle from the asset', async () => {
    const user = userEvent.setup()
    useVehiclesStore.setState({ vehicles: [ACTIVE_TRUCK] })
    useAssignmentsStore.setState({
      assetToVehicle: { [ASSET_OK.id]: ACTIVE_TRUCK.id },
      incidentToVehicle: {}
    })
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    renderLayer()

    await user.click(screen.getByLabelText('Vehículo asignado'))
    await user.click(await screen.findByRole('option', { name: 'Sin asignar' }))

    expect(useAssignmentsStore.getState().assetToVehicle[ASSET_OK.id]).toBeUndefined()
  })
})
