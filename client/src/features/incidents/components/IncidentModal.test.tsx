import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseQueryResult } from '@tanstack/react-query'
import { IncidentModal } from './IncidentModal'
import { useIncidentsStore } from '../store/useIncidentsStore'
import { useIncidentModalStore } from '../store/useIncidentModalStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import type { Incident, Zone } from '../../../shared/types/domain.types'

vi.mock('../../../shared/services/useZonesQuery')

const mockedUseZonesQuery = vi.mocked(useZonesQuery)

const INCIDENT: Incident = {
  id: '1',
  type: 'OVERFLOW',
  status: 'REPORTED',
  description: 'Contenedor desbordado',
  lat: -34.6037,
  lng: -58.3816,
  zoneId: '1',
  createdAt: '2024-01-15T10:30:00Z'
}

const ZONES: Zone[] = [{ id: '1', name: 'Microcentro' }]

function renderModal() {
  return render(
    <Theme>
      <IncidentModal />
    </Theme>
  )
}

beforeEach(() => {
  useIncidentsStore.setState({ incidents: [INCIDENT] })
  useIncidentModalStore.setState({ incidentId: null, mode: null })
  mockedUseZonesQuery.mockReturnValue({ data: ZONES } as unknown as UseQueryResult<Zone[]>)
})

describe('IncidentModal', () => {
  it('renders nothing when there is no mode set', () => {
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes itself without rendering if the selected incident no longer exists', () => {
    useIncidentModalStore.getState().open('missing', 'details')
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useIncidentModalStore.getState().incidentId).toBeNull()
  })

  it('opens read-only with "Cerrar"/"Modificar" when mode is "details"', () => {
    useIncidentModalStore.getState().open('1', 'details')
    renderModal()

    expect(screen.getByText('Desbordamiento')).toBeInTheDocument()
    expect(screen.getByText('Microcentro')).toBeInTheDocument()
    expect(screen.getByText('Contenedor desbordado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modificar' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
  })

  it('opens directly in edit mode with "Cancelar"/"Guardar" when mode is "edit"', () => {
    useIncidentModalStore.getState().open('1', 'edit')
    renderModal()

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('"Modificar" switches the read-only view into the edit form', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('saves the selected status to the global store and closes the modal', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().open('1', 'edit')
    renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Resuelto' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(useIncidentsStore.getState().incidents[0]).toEqual({ ...INCIDENT, status: 'RESOLVED' })
    expect(useIncidentModalStore.getState().incidentId).toBeNull()
  })

  it('"Cancelar" discards the draft and closes when opened directly in edit mode', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().open('1', 'edit')
    renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Resuelto' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useIncidentsStore.getState().incidents[0]).toEqual(INCIDENT)
    expect(useIncidentModalStore.getState().incidentId).toBeNull()
  })

  it('"Cancelar" returns to the read-only view (without closing) when opened from "details"', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().open('1', 'details')
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Modificar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useIncidentModalStore.getState().incidentId).toBe('1')
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
    expect(useIncidentsStore.getState().incidents[0]).toEqual(INCIDENT)
  })

  it('closes without saving when the overlay is dismissed (Escape)', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().open('1', 'edit')
    renderModal()

    await user.keyboard('{Escape}')

    expect(useIncidentModalStore.getState().incidentId).toBeNull()
    expect(useIncidentsStore.getState().incidents[0]).toEqual(INCIDENT)
  })
})

describe('IncidentModal create mode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('combobox', { name: 'Tipo' }))
    await user.click(await screen.findByRole('option', { name: 'Basural' }))
    await user.type(screen.getByLabelText('Descripción'), 'Residuos acumulados')
    await user.click(screen.getByRole('combobox', { name: 'Zona' }))
    await user.click(await screen.findByRole('option', { name: 'Microcentro' }))
    await user.type(screen.getByLabelText('Latitud'), '-34.6')
    await user.type(screen.getByLabelText('Longitud'), '-58.4')
  }

  it('opens the "Agregar Incidente" form with "Cancelar"/"Crear"', () => {
    useIncidentModalStore.getState().openCreate()
    renderModal()

    expect(screen.getByText('Agregar Incidente')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })

  it('blocks "Crear" and shows a validation error for an empty description', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().openCreate()
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('La descripción es obligatoria')).toBeInTheDocument()
    expect(useIncidentModalStore.getState().mode).toBe('create')
  })

  it('creates the incident via POST, adds it to the store and closes the modal', async () => {
    const user = userEvent.setup()
    const created: Incident = {
      id: '2',
      type: 'LITTERING',
      status: 'REPORTED',
      description: 'Residuos acumulados',
      zoneId: '1',
      lat: -34.6,
      lng: -58.4,
      createdAt: '2024-01-16T00:00:00Z'
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(created)
      })
    )
    useIncidentModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => expect(useIncidentModalStore.getState().mode).toBeNull())
    expect(useIncidentsStore.getState().incidents).toContainEqual(created)
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
    useIncidentModalStore.getState().openCreate()
    renderModal()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText('No fue posible crear el incidente.')).toBeInTheDocument()
    expect(useIncidentModalStore.getState().mode).toBe('create')
    expect(useIncidentsStore.getState().incidents).toEqual([INCIDENT])
  })

  it('"Cancelar" closes the create form without creating anything', async () => {
    const user = userEvent.setup()
    useIncidentModalStore.getState().openCreate()
    renderModal()

    await user.type(screen.getByLabelText('Descripción'), 'Residuos acumulados')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(useIncidentModalStore.getState().mode).toBeNull()
    expect(useIncidentsStore.getState().incidents).toEqual([INCIDENT])
  })
})
