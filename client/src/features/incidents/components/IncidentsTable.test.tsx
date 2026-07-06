import { fireEvent, render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { IncidentsTable } from './IncidentsTable'
import { useIncidentsStore } from '../store/useIncidentsStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Incident, Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const FIRST_INCIDENT: Incident = {
  id: '1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.60371234,
  lng: -58.38161234,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

const SECOND_INCIDENT: Incident = {
  id: '2',
  type: 'DAMAGE',
  status: 'RESOLVED',
  description: 'Banco roto',
  lat: -34.5875,
  lng: -58.4205,
  zoneId: '2',
  createdAt: '2024-01-14T14:20:00Z'
}

const INCIDENTS: Incident[] = [FIRST_INCIDENT, SECOND_INCIDENT]

const ZONES: Zone[] = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' }
]

function renderTable() {
  return render(
    <Theme>
      <IncidentsTable />
    </Theme>
  )
}

beforeEach(() => {
  useIncidentsStore.setState({ incidents: [] })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('IncidentsTable', () => {
  it('renders one row per incident with translated type, status, zone, coordinates', () => {
    useIncidentsStore.getState().setIncidents(INCIDENTS)
    renderTable()

    expect(screen.getAllByTestId('incident-row')).toHaveLength(2)

    expect(screen.getByText('Desbordamiento')).toBeInTheDocument()
    expect(screen.getByText('Reportado')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()
    expect(screen.getByText('Contenedor desbordado')).toBeInTheDocument()
    expect(screen.getByText('-34.6037')).toBeInTheDocument()
    expect(screen.getByText('-58.3816')).toBeInTheDocument()

    expect(screen.getByText('Daño')).toBeInTheDocument()
    expect(screen.getByText('Resuelto')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
  })

  it('falls back to the raw zoneId while zones have not loaded yet', () => {
    mockedUseZonesQuery.mockReturnValue({ data: undefined } as unknown as UseQueryResult<Zone[]>)
    useIncidentsStore.getState().setIncidents([FIRST_INCIDENT])
    renderTable()

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders no rows when there are no incidents', () => {
    renderTable()

    expect(screen.queryAllByTestId('incident-row')).toHaveLength(0)
  })

  it('paginates at 15 rows per page and navigates to the next page', () => {
    const manyIncidents: Incident[] = Array.from({ length: 17 }, (_, index) => ({
      id: `${index + 1}`,
      type: 'OVERFLOW',
      status: 'REPORTED',
      description: `Incidente ${index + 1}`,
      lat: -34.6,
      lng: -58.4,
      zoneId: '1',
      createdAt: '2024-01-15T10:30:00Z'
    }))
    useIncidentsStore.getState().setIncidents(manyIncidents)
    renderTable()

    expect(screen.getAllByTestId('incident-row')).toHaveLength(15)
    expect(screen.getByText('Mostrando 1–15 de 17')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Página siguiente'))

    expect(screen.getAllByTestId('incident-row')).toHaveLength(2)
    expect(screen.getByText('Mostrando 16–17 de 17')).toBeInTheDocument()
  })
})
