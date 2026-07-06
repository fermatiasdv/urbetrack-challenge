import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MapEntityTabs } from './MapEntityTabs'

vi.mock('../../assets/components/AssetsTable', () => ({
  AssetsTable: () => <div data-testid="assets-table" />
}))
vi.mock('../../vehicles/components/VehiclesTable', () => ({
  VehiclesTable: () => <div data-testid="vehicles-table" />
}))
vi.mock('../../incidents/components/IncidentsTable', () => ({
  IncidentsTable: () => <div data-testid="incidents-table" />
}))
vi.mock('../../vehicles/api/useVehiclesQuery', () => ({
  useVehiclesQuery: () => ({ isLoading: false })
}))

function renderTabs() {
  return render(
    <Theme>
      <MapEntityTabs />
    </Theme>
  )
}

describe('MapEntityTabs', () => {
  it('shows the Activos table by default', () => {
    renderTabs()

    expect(screen.getByTestId('assets-table')).toBeInTheDocument()
    expect(screen.queryByTestId('vehicles-table')).not.toBeInTheDocument()
    expect(screen.queryByTestId('incidents-table')).not.toBeInTheDocument()
  })

  it('switches to the Vehículos tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: /^Vehículos/ }))

    expect(screen.getByTestId('vehicles-table')).toBeInTheDocument()
  })

  it('switches to the Incidentes tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: /^Incidentes/ }))

    expect(screen.getByTestId('incidents-table')).toBeInTheDocument()
  })
})
