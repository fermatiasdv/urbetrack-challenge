import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteVehicleAlertDialog } from './DeleteVehicleAlertDialog'
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

function renderDialog(onOpenChange: (open: boolean) => void) {
  return render(
    <Theme>
      <DeleteVehicleAlertDialog vehicle={VEHICLE} open onOpenChange={onOpenChange} />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [VEHICLE] })
})

describe('DeleteVehicleAlertDialog', () => {
  it('shows a confirmation message referencing the plate', () => {
    renderDialog(vi.fn())

    expect(screen.getByText('¿Eliminar vehículo?')).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.plate)).toBeInTheDocument()
  })

  it('removes the vehicle from the store and closes when "Aceptar" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(useVehiclesStore.getState().vehicles).toEqual([])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not remove the vehicle when "No" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(useVehiclesStore.getState().vehicles).toEqual([VEHICLE])
  })
})
