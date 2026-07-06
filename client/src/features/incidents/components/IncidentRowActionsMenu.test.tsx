import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { IncidentRowActionsMenu } from './IncidentRowActionsMenu'
import { useIncidentModalStore } from '../store/useIncidentModalStore'
import { useIncidentsStore } from '../store/useIncidentsStore'
import type { Incident } from '../../../shared/types/domain.types'

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

function renderMenu() {
  return render(
    <Theme>
      <IncidentRowActionsMenu incident={INCIDENT} />
    </Theme>
  )
}

beforeEach(() => {
  useIncidentModalStore.setState({ incidentId: null, mode: null })
  useIncidentsStore.setState({ incidents: [INCIDENT] })
})

describe('IncidentRowActionsMenu', () => {
  it('opens the modal store in "details" mode when "Detalles" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el incidente/i }))
    await user.click(await screen.findByText('Detalles'))

    expect(useIncidentModalStore.getState()).toMatchObject({ incidentId: '1', mode: 'details' })
  })

  it('opens the modal store in "edit" mode when "Editar" is selected', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el incidente/i }))
    await user.click(await screen.findByText('Editar'))

    expect(useIncidentModalStore.getState()).toMatchObject({ incidentId: '1', mode: 'edit' })
  })

  it('opens the delete dialog when "Eliminar" is selected, without deleting', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /acciones para el incidente/i }))
    await user.click(await screen.findByText('Eliminar'))

    expect(await screen.findByText('¿Eliminar incidente?')).toBeInTheDocument()
    expect(useIncidentsStore.getState().incidents).toEqual([INCIDENT])
  })
})
