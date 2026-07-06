import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it } from 'vitest'
import { AssetTooltip } from './AssetTooltip'
import type { AssociatedIncident } from '../types'

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

function renderTooltip(associatedIncident: AssociatedIncident | null) {
  return render(
    <Theme>
      <AssetTooltip associatedIncident={associatedIncident} />
    </Theme>
  )
}

describe('AssetTooltip', () => {
  it('shows "Estado OK" when there is no associated incident', () => {
    renderTooltip(null)

    expect(screen.getByText('Estado OK')).toBeInTheDocument()
  })

  it('shows the incident type and status when there is one', () => {
    renderTooltip(INCIDENT)

    expect(screen.getByText('Tipo de incidente: OVERFLOW')).toBeInTheDocument()
    expect(screen.getByText('Estado del incidente: REPORTED')).toBeInTheDocument()
  })
})
