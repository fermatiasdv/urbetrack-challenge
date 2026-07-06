import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { VehiclesTable } from './VehiclesTable'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Vehicle } from '../../../shared/types/domain.types'
import type { Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const FIRST_VEHICLE: Vehicle = {
  id: '1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5500,
  zoneId: '1'
}

const SECOND_VEHICLE: Vehicle = {
  id: '2',
  plate: 'DEF456',
  type: 'VAN',
  status: 'MAINTENANCE',
  capacity: 1200,
  zoneId: '2'
}

const VEHICLES: Vehicle[] = [FIRST_VEHICLE, SECOND_VEHICLE]

const ZONES: Zone[] = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' }
]

function renderTable() {
  return render(
    <Theme>
      <VehiclesTable />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('VehiclesTable', () => {
  it('renders one row per vehicle with translated type, capacity, status and zone name', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)
    renderTable()

    expect(screen.getAllByTestId('vehicle-row')).toHaveLength(2)

    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText('Camión')).toBeInTheDocument()
    expect(screen.getByText('5.500 KG')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()

    expect(screen.getByText('DEF456')).toBeInTheDocument()
    expect(screen.getByText('Furgoneta')).toBeInTheDocument()
    expect(screen.getByText('1.200 KG')).toBeInTheDocument()
    expect(screen.getByText('En mantenimiento')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
  })

  it('falls back to the raw zoneId while zones have not loaded yet', () => {
    mockedUseZonesQuery.mockReturnValue({ data: undefined } as unknown as UseQueryResult<Zone[]>)
    useVehiclesStore.getState().setVehicles([FIRST_VEHICLE])
    renderTable()

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders no rows when there are no vehicles', () => {
    renderTable()

    expect(screen.queryAllByTestId('vehicle-row')).toHaveLength(0)
  })
})
