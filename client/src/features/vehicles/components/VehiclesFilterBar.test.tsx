import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { VehiclesFilterBar } from './VehiclesFilterBar'
import { useVehicleFiltersStore } from '../store/useVehicleFiltersStore'
import { DEFAULT_VEHICLE_FILTERS } from '../utils/vehicleFilters'
import type { Zone } from '../types/zone.types'

const ZONES: Zone[] = [
  { id: '1', name: 'Microcentro' },
  { id: '2', name: 'Palermo' }
]

function renderFilterBar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Theme>{children}</Theme>
      </QueryClientProvider>
    )
  }
  return render(<VehiclesFilterBar />, { wrapper })
}

beforeEach(() => {
  useVehicleFiltersStore.setState(DEFAULT_VEHICLE_FILTERS)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(ZONES)
    })
  )
})

describe('VehiclesFilterBar', () => {
  it('updates the plate filter as the user types', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.type(screen.getByPlaceholderText('ABC-1234'), 'ABC')

    expect(useVehicleFiltersStore.getState().plate).toBe('ABC')
  })

  it('updates the type filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Camión' }))

    expect(useVehicleFiltersStore.getState().type).toBe('TRUCK')
  })

  it('updates the capacity filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Capacidad' }))
    await user.click(await screen.findByRole('option', { name: 'Más de 2.000 KG' }))

    expect(useVehicleFiltersStore.getState().capacity).toBe('GT_2000')
  })

  it('updates the status filter when an option is selected', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Activo' }))

    expect(useVehicleFiltersStore.getState().status).toBe('ACTIVE')
  })

  it('shows "Todas las zonas" when no zone is selected, and updates on selection', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    expect(screen.getByRole('button', { name: 'Zona' })).toHaveTextContent('Todas las zonas')

    await user.click(screen.getByRole('button', { name: 'Zona' }))
    await user.click(await screen.findByText('Microcentro'))

    expect(useVehicleFiltersStore.getState().zoneIds).toEqual(['1'])
  })

  it('resets every filter to its default when "Restablecer" is clicked', async () => {
    const user = userEvent.setup()
    renderFilterBar()
    useVehicleFiltersStore.getState().setPlate('ABC')
    useVehicleFiltersStore.getState().setType('VAN')

    await user.click(screen.getByRole('button', { name: 'Restablecer' }))

    expect(useVehicleFiltersStore.getState()).toMatchObject(DEFAULT_VEHICLE_FILTERS)
  })
})
