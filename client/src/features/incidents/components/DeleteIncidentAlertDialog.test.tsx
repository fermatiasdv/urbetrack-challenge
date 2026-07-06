import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteIncidentAlertDialog } from './DeleteIncidentAlertDialog'
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

function renderDialog(onOpenChange: (open: boolean) => void) {
  return render(
    <Theme>
      <DeleteIncidentAlertDialog incident={INCIDENT} open onOpenChange={onOpenChange} />
    </Theme>
  )
}

beforeEach(() => {
  useIncidentsStore.setState({ incidents: [INCIDENT] })
})

describe('DeleteIncidentAlertDialog', () => {
  it('shows a confirmation message referencing the incident', () => {
    renderDialog(vi.fn())

    expect(screen.getByText('¿Eliminar incidente?')).toBeInTheDocument()
    expect(screen.getByText('Desbordamiento')).toBeInTheDocument()
  })

  it('removes the incident from the store and closes when "Aceptar" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(useIncidentsStore.getState().incidents).toEqual([])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not remove the incident when "No" is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog(onOpenChange)

    await user.click(screen.getByRole('button', { name: 'No' }))

    expect(useIncidentsStore.getState().incidents).toEqual([INCIDENT])
  })
})
