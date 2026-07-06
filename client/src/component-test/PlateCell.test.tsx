import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PlateCell } from './PlateCell'
import { useVehiclesStore } from './useVehiclesStore'
import type { VehicleRow } from './types'

const DEBOUNCE_MS = 700

const vehicle: VehicleRow = {
  id: '1',
  type: 'TRUCK',
  plate: 'ABC123',
  status: 'ACTIVE',
  zoneId: '1',
  lat: 0,
  lng: 0,
  zoneName: 'Microcentro'
}

function renderPlateCell() {
  return render(
    <Theme>
      <PlateCell vehicle={vehicle} />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [vehicle] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PlateCell', () => {
  it('shows a prompt message and blocks the keystroke when the prefix becomes invalid', async () => {
    const user = userEvent.setup()
    renderPlateCell()

    const input = screen.getByLabelText('Patente de 1') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '1')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Formato inválido: solo se acepta AAA111 o AA111AA. Corregí el valor.'
    )
    expect(input.value).toBe('')
  })

  it('shows a debounced full-format error for an incomplete/invalid plate value', async () => {
    vi.useFakeTimers()
    renderPlateCell()

    const input = screen.getByLabelText('Patente de 1') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ABC12' } })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 50)
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Patente inválida. Formatos aceptados: AAA111 o AA111AA.'
    )
  })

  it('commits the plate to the store and blurs the input when Enter is pressed', async () => {
    const user = userEvent.setup()
    renderPlateCell()

    const input = screen.getByLabelText('Patente de 1') as HTMLInputElement
    await user.click(input)
    await user.clear(input)
    await user.type(input, 'xyz999')
    await user.keyboard('{Enter}')

    expect(useVehiclesStore.getState().vehicles.find((v) => v.id === '1')?.plate).toBe('XYZ999')
    expect(input).not.toHaveFocus()
  })
})
