import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { VehicleRowActionsMenu } from './VehicleRowActionsMenu'
import { useVehicleModalStore } from '../store/useVehicleModalStore'
import { useVehiclesStore } from '../store/useVehiclesStore'
import type { Vehicle } from '../types/vehicle.types'

const VEHICLE: Vehicle = {
  id: '1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}

function renderMenu() {
  return render(
    <Theme>
      <VehicleRowActionsMenu vehicle={VEHICLE} />
    </Theme>
  )
}

beforeEach(() => {
  useVehicleModalStore.setState({ vehicleId: null, mode: null })
  useVehiclesStore.setState({ vehicles: [VEHICLE] })
})

describe('VehicleRowActionsMenu', () => {
  it('opens the modal store in "details" mode when "Detalles" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el veh.culo abc123/i }))
    await user.click(await screen.findByText('Detalles'))

    expect(useVehicleModalStore.getState()).toMatchObject({ vehicleId: '1', mode: 'details' })
  })

  it('opens the modal store in "edit" mode when "Editar" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el veh.culo abc123/i }))
    await user.click(await screen.findByText('Editar'))

    expect(useVehicleModalStore.getState()).toMatchObject({ vehicleId: '1', mode: 'edit' })
  })

  it('opens the delete dialog when "Eliminar" is selected, without deleting', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el veh.culo abc123/i }))
    await user.click(await screen.findByText('Eliminar'))

    expect(await screen.findByText('¿Eliminar vehículo?')).toBeInTheDocument()
    expect(useVehiclesStore.getState().vehicles).toEqual([VEHICLE])
  })
})
