import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it } from 'vitest'
import { AssetTooltip } from './AssetTooltip'
import type { AssociatedIncident } from '../types'
import type { AssetStatus } from '../../../shared/types/domain.types'

const INCIDENT: AssociatedIncident = {
  id: '1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.6,
  lng: -58.38,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z',
  derivedZone: 'MICROCENTRO',
  associatedAssetId: 'asset-1'
}

function renderTooltip(associatedIncident: AssociatedIncident | null, assetStatus: AssetStatus) {
  return render(
    <Theme>
      <AssetTooltip associatedIncident={associatedIncident} assetStatus={assetStatus} />
    </Theme>
  )
}

describe('AssetTooltip', () => {
  it('shows "OK" for an OK asset with no associated incident', () => {
    renderTooltip(null, 'OK')

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('shows "Completo" for a FULL asset with no associated incident', () => {
    renderTooltip(null, 'FULL')

    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('shows "Dañado" for a DAMAGED asset with no associated incident', () => {
    renderTooltip(null, 'DAMAGED')

    expect(screen.getByText('Dañado')).toBeInTheDocument()
  })

  it('shows "Fuera de servicio" for an OUT_OF_SERVICE asset with no associated incident', () => {
    renderTooltip(null, 'OUT_OF_SERVICE')

    expect(screen.getByText('Fuera de servicio')).toBeInTheDocument()
  })

  it('shows the incident type and status when there is one, regardless of asset status', () => {
    renderTooltip(INCIDENT, 'FULL')

    expect(screen.getByText('Tipo de incidente: OVERFLOW')).toBeInTheDocument()
    expect(screen.getByText('Estado del incidente: REPORTED')).toBeInTheDocument()
  })
})
