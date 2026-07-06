import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { IncidentMarkersLayer } from './IncidentMarkersLayer'
import { useMapStore } from '../store/useMapStore'
import { useVehiclesStore } from '../../vehicles/store/useVehiclesStore'
import { useAssignmentsStore } from '../../../shared/services/assignments/useAssignmentsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { AssociatedIncident } from '../types'
import type { Vehicle, Zone } from '../../../shared/types/domain.types'

vi.mock('react-leaflet', () => ({
  Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <div data-testid="tooltip">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div data-testid="popup">{children}</div>
}))

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)
const ZONES: Zone[] = [{ id: '1', name: 'Microcentro' }]

const INDEPENDENT_INCIDENT: AssociatedIncident = {
  id: 'incident-1',
  type: 'LITTERING',
  status: 'IN_PROGRESS',
  description: 'Basural',
  lat: -34.6,
  lng: -58.38,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z',
  derivedZone: 'MICROCENTRO',
  associatedAssetId: null
}

const ASSOCIATED_INCIDENT: AssociatedIncident = {
  ...INDEPENDENT_INCIDENT,
  id: 'incident-2',
  associatedAssetId: 'asset-1'
}

const REPORTED_INDEPENDENT: AssociatedIncident = {
  ...INDEPENDENT_INCIDENT,
  id: 'incident-3',
  status: 'REPORTED'
}

const ACTIVE_VAN: Vehicle = {
  id: 'v1',
  plate: 'DEF456',
  type: 'VAN',
  status: 'ACTIVE',
  capacity: 2000,
  zoneId: '1'
}

function renderLayer() {
  return render(
    <Theme>
      <IncidentMarkersLayer />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
  useAssignmentsStore.setState({ assetToVehicle: {}, incidentToVehicle: {} })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('IncidentMarkersLayer', () => {
  it('renders only incidents without an associated asset', () => {
    useMapStore.setState({ incidents: [INDEPENDENT_INCIDENT, ASSOCIATED_INCIDENT] })

    renderLayer()

    expect(screen.getAllByTestId('marker')).toHaveLength(1)
    expect(screen.getByText('Tipo de incidente: LITTERING')).toBeInTheDocument()
  })

  it('renders nothing when every incident is associated', () => {
    useMapStore.setState({ incidents: [ASSOCIATED_INCIDENT] })

    renderLayer()

    expect(screen.queryAllByTestId('marker')).toHaveLength(0)
  })

  it('offers the assignment control for a REPORTED independent incident (any active vehicle in zone)', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_VAN] })
    useMapStore.setState({ incidents: [REPORTED_INDEPENDENT] })

    renderLayer()

    expect(screen.getByLabelText('Vehículo asignado')).toBeInTheDocument()
  })

  it('does not offer the assignment control for a non-REPORTED incident', () => {
    useVehiclesStore.setState({ vehicles: [ACTIVE_VAN] })
    useMapStore.setState({ incidents: [INDEPENDENT_INCIDENT] })

    renderLayer()

    expect(screen.queryByLabelText('Vehículo asignado')).not.toBeInTheDocument()
  })

  it('still renders while the zones query is loading (zones is undefined)', () => {
    mockedUseZonesQuery.mockReturnValue({ data: undefined } as unknown as UseQueryResult<Zone[]>)
    useMapStore.setState({ incidents: [INDEPENDENT_INCIDENT] })

    renderLayer()

    expect(screen.getAllByTestId('marker')).toHaveLength(1)
  })

  it('assigns the selected vehicle to the incident', async () => {
    const user = userEvent.setup()
    useVehiclesStore.setState({ vehicles: [ACTIVE_VAN] })
    useMapStore.setState({ incidents: [REPORTED_INDEPENDENT] })

    renderLayer()

    await user.click(screen.getByLabelText('Vehículo asignado'))
    await user.click(await screen.findByRole('option', { name: 'Furgoneta (DEF456)' }))

    expect(useAssignmentsStore.getState().incidentToVehicle[REPORTED_INDEPENDENT.id]).toBe(
      ACTIVE_VAN.id
    )
  })

  it('clears the assigned vehicle from the incident', async () => {
    const user = userEvent.setup()
    useVehiclesStore.setState({ vehicles: [ACTIVE_VAN] })
    useAssignmentsStore.setState({
      assetToVehicle: {},
      incidentToVehicle: { [REPORTED_INDEPENDENT.id]: ACTIVE_VAN.id }
    })
    useMapStore.setState({ incidents: [REPORTED_INDEPENDENT] })

    renderLayer()

    await user.click(screen.getByLabelText('Vehículo asignado'))
    await user.click(await screen.findByRole('option', { name: 'Sin asignar' }))

    expect(
      useAssignmentsStore.getState().incidentToVehicle[REPORTED_INDEPENDENT.id]
    ).toBeUndefined()
  })
})
