import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { HeatmapFilters } from './HeatmapFilters'
import { useMapStore } from '../store/useMapStore'

beforeEach(() => {
  useMapStore.setState({
    heatmapFilters: {
      statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
      types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
    }
  })
})

function renderFilters() {
  return render(
    <Theme>
      <HeatmapFilters />
    </Theme>
  )
}

describe('HeatmapFilters', () => {
  it('shows "Todos" on both triggers when everything is selected', () => {
    renderFilters()

    expect(screen.getByRole('button', { name: 'Estado del heatmap' })).toHaveTextContent('Todos')
    expect(screen.getByRole('button', { name: 'Tipo de incidente del heatmap' })).toHaveTextContent(
      'Todos'
    )
  })

  it('narrows the status filter when a single status is unchecked via the store', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Estado del heatmap' }))
    await user.click(await screen.findByText('Reportado'))

    expect(useMapStore.getState().heatmapFilters.statuses).toEqual(['IN_PROGRESS', 'RESOLVED'])
  })

  it('clears every status when "Todos" is unchecked', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Estado del heatmap' }))
    const todosCheckboxes = await screen.findAllByRole('checkbox', { name: 'Todos' })
    await user.click(todosCheckboxes[0]!)

    expect(useMapStore.getState().heatmapFilters.statuses).toEqual([])
  })

  it('narrows the type filter when a single type is unchecked via the store', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Tipo de incidente del heatmap' }))
    await user.click(await screen.findByText('Desbordamiento'))

    expect(useMapStore.getState().heatmapFilters.types).toEqual(['DAMAGE', 'LITTERING', 'OTHER'])
  })

  it('clears every type when "Todos" is unchecked in the type popover', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Tipo de incidente del heatmap' }))
    const todosCheckbox = await screen.findByRole('checkbox', { name: 'Todos' })
    await user.click(todosCheckbox)

    expect(useMapStore.getState().heatmapFilters.types).toEqual([])
  })
})
