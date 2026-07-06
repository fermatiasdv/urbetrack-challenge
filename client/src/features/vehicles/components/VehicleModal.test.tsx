import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { VehicleModal } from './VehicleModal'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useVehicleModalStore } from '../store/useVehicleModalStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Vehicle, Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const VEHICLE: Vehicle = {
  id: '1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'MAINTENANCE',
  capacity: 5000,
  zoneId: '1'
}

const ZONES: Zone[] = [{ id: '1', name: 'Palermo' }]

function renderModal() {
  return render(
    <Theme>
      <VehicleModal />
    </Theme>
  )
}

beforeEach(() => {
  useVehiclesStore.setState({ vehicles: [VEHICLE] })
  useVehicleModalStore.setState({ vehicleId: null, mode: null })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('VehicleModal', () => {
  it('renders nothing when there is no vehicle selected', () => {
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes itself without rendering if the selected vehicle no longer exists', () => {
    useVehicleModalStore.getState().open('missing', 'details')
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
  })

  it('opens read-only with "Cerrar"/"Modificar" when mode is "details"', () => {
    useVehicleModalStore.getState().open('1', 'details')
    renderModal()

    expect(screen.getByText('Camión (ABC123)')).toBeInTheDocument()
    expect(screen.getByText('5.000 KG')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modificar' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Patente / Plate')).not.toBeInTheDocument()
  })

  it('opens directly in edit mode with "Cancelar"/"Guardar" when mode is "edit"', () => {
    useVehicleModalStore.getState().open('1', 'edit')
    renderModal()

    expect(screen.getByLabelText('Patente / Plate')).toHaveValue('ABC123')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('"Modificar" switches the read-only view into the edit form', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))

    expect(screen.getByLabelText('Patente / Plate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('blocks "Guardar" and shows an error for an invalid plate', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'edit')
    renderModal()

    const plateInput = screen.getByLabelText('Patente / Plate')
    await user.clear(plateInput)
    await user.type(plateInput, 'INVALID')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Formato de placa inválido')).toBeInTheDocument()
    expect(useVehiclesStore.getState().vehicles[0]).toEqual(VEHICLE)
    expect(useVehicleModalStore.getState().vehicleId).toBe('1')
  })

  it('saves a valid plate to the global store and closes the modal', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'edit')
    renderModal()

    const plateInput = screen.getByLabelText('Patente / Plate')
    await user.clear(plateInput)
    await user.type(plateInput, 'xyz789')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(useVehiclesStore.getState().vehicles[0]).toEqual({ ...VEHICLE, plate: 'XYZ789' })
    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
  })

  it('"Cancelar" discards the draft and closes when opened directly in edit mode', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'edit')
    renderModal()

    const plateInput = screen.getByLabelText('Patente / Plate')
    await user.clear(plateInput)
    await user.type(plateInput, 'ZZZ999')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useVehiclesStore.getState().vehicles[0]).toEqual(VEHICLE)
    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
  })

  it('"Cancelar" returns to the read-only view (without closing) when opened from "details"', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))
    const plateInput = screen.getByLabelText('Patente / Plate')
    await user.clear(plateInput)
    await user.type(plateInput, 'ZZZ999')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useVehicleModalStore.getState().vehicleId).toBe('1')
    expect(screen.queryByLabelText('Patente / Plate')).not.toBeInTheDocument()
    expect(useVehiclesStore.getState().vehicles[0]).toEqual(VEHICLE)
  })

  it('closes without saving when the overlay is dismissed (Escape)', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().open('1', 'edit')
    renderModal()

    const plateInput = screen.getByLabelText('Patente / Plate')
    await user.clear(plateInput)
    await user.type(plateInput, 'ZZZ999')
    await user.keyboard('{Escape}')

    expect(useVehicleModalStore.getState().vehicleId).toBeNull()
    expect(useVehiclesStore.getState().vehicles[0]).toEqual(VEHICLE)
  })
})

describe('VehicleModal create mode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Patente / Plate'), 'DEF456')
    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Camión' }))
    await user.type(screen.getByLabelText('Capacidad (KG)'), '3000')
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Activo' }))
    await user.click(screen.getByRole('combobox', { name: 'Zona' }))
    await user.click(await screen.findByRole('option', { name: 'Palermo' }))
  }

  it('opens the "Agregar Vehículo" form with "Cancelar"/"Crear"', () => {
    useVehicleModalStore.getState().openCreate()
    renderModal()

    expect(screen.getByText('Agregar Vehículo')).toBeInTheDocument()
    expect(screen.getByLabelText('Patente / Plate')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('blocks "Crear" and shows a validation error for an invalid plate', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().openCreate()
    renderModal()

    await user.type(screen.getByLabelText('Patente / Plate'), 'INVALID')
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(screen.getByText('Formato de placa inválido')).toBeInTheDocument()
    expect(useVehicleModalStore.getState().mode).toBe('create')
  })

  it('creates the vehicle via POST, adds it to the store and closes the modal', async () => {
    const user = userEvent.setup()
    const created: Vehicle = {
      id: '2',
      plate: 'DEF456',
      type: 'TRUCK',
      status: 'ACTIVE',
      capacity: 3000,
      zoneId: '1'
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(created)
      })
    )
    useVehicleModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => expect(useVehicleModalStore.getState().mode).toBeNull())
    expect(useVehiclesStore.getState().vehicles).toContainEqual(created)
  })

  it('shows an error and keeps the modal open when the POST fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve(null)
      })
    )
    useVehicleModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('No fue posible crear el vehículo.')).toBeInTheDocument()
    expect(useVehicleModalStore.getState().mode).toBe('create')
    expect(useVehiclesStore.getState().vehicles).toEqual([VEHICLE])
  })

  it('"Cancelar" closes the create form without creating anything', async () => {
    const user = userEvent.setup()
    useVehicleModalStore.getState().openCreate()
    renderModal()

    await user.type(screen.getByLabelText('Patente / Plate'), 'DEF456')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useVehicleModalStore.getState().mode).toBeNull()
    expect(useVehiclesStore.getState().vehicles).toEqual([VEHICLE])
  })
})
