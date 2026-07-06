import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { IncidentMarkersLayer } from './IncidentMarkersLayer'
import { useMapStore } from '../store/useMapStore'
import type { AssociatedIncident } from '../types'

vi.mock('react-leaflet', () => ({
  Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <div data-testid="tooltip">{children}</div>
}))

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

function renderLayer() {
  return render(
    <Theme>
      <IncidentMarkersLayer />
    </Theme>
  )
}

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
})
