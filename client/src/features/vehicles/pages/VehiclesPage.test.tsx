import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { VehiclesPage } from './VehiclesPage'
import { useVehiclesQuery } from '../api/useVehiclesQuery'
import type { Vehicle } from '../../../shared/types/domain.types'

vi.mock('../api/useVehiclesQuery')

vi.mock('../components/VehicleStatusCards', () => ({
  VehicleStatusCards: () => <div data-testid="vehicle-status-cards" />
}))

vi.mock('../components/VehiclesFilterBar', () => ({
  VehiclesFilterBar: () => <div data-testid="vehicles-filter-bar" />
}))

vi.mock('../components/VehiclesTable', () => ({
  VehiclesTable: () => <div data-testid="vehicles-table" />
}))

vi.mock('../components/VehicleModal', () => ({
  VehicleModal: () => <div data-testid="vehicle-modal" />
}))

const mockedUseVehiclesQuery = vi.mocked(useVehiclesQuery)

function renderPage() {
  return render(
    <Theme>
      <VehiclesPage />
    </Theme>
  )
}

describe('VehiclesPage', () => {
  it('renders the skeleton while the query is loading', () => {
    mockedUseVehiclesQuery.mockReturnValue({
      isLoading: true
    } as unknown as UseQueryResult<Vehicle[]>)

    renderPage()

    expect(screen.getByText('Vehículos')).toBeInTheDocument()
    expect(screen.queryByTestId('vehicle-status-cards')).not.toBeInTheDocument()
  })

  it('renders the vehicle status cards once loading finishes', () => {
    mockedUseVehiclesQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Vehicle[]>)

    renderPage()

    expect(screen.getByTestId('vehicle-status-cards')).toBeInTheDocument()
    expect(screen.getByTestId('vehicles-filter-bar')).toBeInTheDocument()
    expect(screen.getByTestId('vehicles-table')).toBeInTheDocument()
  })

  it('logs a placeholder message when "Agregar Vehículo" is clicked', async () => {
    const user = userEvent.setup()
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    mockedUseVehiclesQuery.mockReturnValue({
      isLoading: false
    } as unknown as UseQueryResult<Vehicle[]>)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar Vehículo' }))

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      'Agregar Vehículo: modal de alta pendiente de un spec futuro'
    )

    consoleInfoSpy.mockRestore()
  })
})
