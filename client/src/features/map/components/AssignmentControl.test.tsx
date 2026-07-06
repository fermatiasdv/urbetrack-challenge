import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it, vi } from 'vitest'
import { AssignmentControl } from './AssignmentControl'
import type { Vehicle } from '../../../shared/types/domain.types'

const TRUCK: Vehicle = {
  id: 'v1',
  plate: 'ABC123',
  type: 'TRUCK',
  status: 'ACTIVE',
  capacity: 5000,
  zoneId: '1'
}

function renderControl(props: Partial<Parameters<typeof AssignmentControl>[0]> = {}) {
  return render(
    <Theme>
      <AssignmentControl
        eligibleVehicles={[TRUCK]}
        assignedVehicleId={null}
        onAssign={vi.fn()}
        onClear={vi.fn()}
        {...props}
      />
    </Theme>
  )
}

describe('AssignmentControl', () => {
  it('shows a fallback message when there are no eligible vehicles and nothing assigned', () => {
    renderControl({ eligibleVehicles: [] })

    expect(screen.getByText('No hay vehículos disponibles para asignar.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Vehículo asignado')).not.toBeInTheDocument()
  })

  it('renders the select when there are eligible vehicles', () => {
    renderControl()

    expect(screen.getByLabelText('Vehículo asignado')).toBeInTheDocument()
  })

  it('reflects the currently assigned vehicle in the trigger', () => {
    renderControl({ assignedVehicleId: 'v1' })

    expect(screen.getByText('Camión (ABC123)')).toBeInTheDocument()
  })

  it('shows "Sin asignar" in the trigger when nothing is assigned', () => {
    renderControl()

    expect(screen.getByText('Sin asignar')).toBeInTheDocument()
  })
})
