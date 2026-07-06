import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { AssetMarkersLayer } from './AssetMarkersLayer'
import { useMapStore } from '../store/useMapStore'
import type { AssociatedIncident, GeoTaggedAsset } from '../types'

vi.mock('react-leaflet', () => ({
  Marker: ({ children, position }: { children: ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={position.join(',')}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <div data-testid="tooltip">{children}</div>
}))

const ASSET_OK: GeoTaggedAsset = {
  id: 'asset-1',
  type: 'BIN',
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

describe('AssetMarkersLayer', () => {
  it('renders one marker per asset', () => {
    useMapStore.setState({ assets: [ASSET_OK, ASSET_WITH_INCIDENT], incidents: [] })

    render(
      <Theme>
        <AssetMarkersLayer />
      </Theme>
    )

    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('shows "Estado OK" for an asset without an associated incident', () => {
    useMapStore.setState({ assets: [ASSET_OK], incidents: [] })

    render(
      <Theme>
        <AssetMarkersLayer />
      </Theme>
    )

    expect(screen.getByText('Estado OK')).toBeInTheDocument()
  })

  it('shows incident info for an asset with an associated incident', () => {
    useMapStore.setState({ assets: [ASSET_WITH_INCIDENT], incidents: [ASSOCIATED_INCIDENT] })

    render(
      <Theme>
        <AssetMarkersLayer />
      </Theme>
    )

    expect(screen.getByText('Tipo de incidente: OVERFLOW')).toBeInTheDocument()
  })
})
