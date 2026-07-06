import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { VehicleStatusCards } from './VehicleStatusCards'
import { useVehiclesStore } from '../store/useVehiclesStore'
import type { Vehicle } from '../types/vehicle.types'

const VEHICLES: Vehicle[] = [
  { id: '1', plate: 'ABC123', type: 'TRUCK', status: 'ACTIVE', capacity: 5000, zoneId: '1' },
  { id: '2', plate: 'DEF456', type: 'VAN', status: 'ACTIVE', capacity: 2000, zoneId: '2' },
  { id: '3', plate: 'GHI789', type: 'PICKUP', status: 'MAINTENANCE', capacity: 1000, zoneId: '3' },
  { id: '4', plate: 'JKL012', type: 'VAN', status: 'OUT_OF_SERVICE', capacity: 2000, zoneId: '4' }
]

function renderCards() {
  return render(
    <Theme>
      <VehicleStatusCards />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [] })
})

describe('VehicleStatusCards', () => {
  it('renders the 4 status cards computed from the vehicles store', () => {
    useVehiclesStore.getState().setVehicles(VEHICLES)
    renderCards()

    expect(screen.getByText('Total de Vehículos')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()

    expect(screen.getByText('Activos')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/50% del total de vehículos/)).toBeInTheDocument()

    expect(screen.getByText('En mantenimiento')).toBeInTheDocument()
    expect(screen.getByText(/25% agendados para reparar/)).toBeInTheDocument()

    expect(screen.getByText('Fuera de servicio')).toBeInTheDocument()
    expect(screen.getByText(/25% prioridad crítica/)).toBeInTheDocument()
  })

  it('renders 0-value cards without dividing by zero when there are no vehicles', () => {
    renderCards()

    expect(screen.getAllByText('0')).toHaveLength(4)
    expect(screen.getByText(/0% del total de vehículos/)).toBeInTheDocument()
  })
})
