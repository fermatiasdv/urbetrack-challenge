import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AssetHeatmapFilters } from './AssetHeatmapFilters'
import { useMapStore } from '../store/useMapStore'

beforeEach(() => {
  useMapStore.setState({
    assetHeatmapFilters: {
      statuses: ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE'],
      types: ['CONTAINER', 'BIN', 'BENCH']
    }
  })
})

function renderFilters() {
  return render(
    <Theme>
      <AssetHeatmapFilters />
    </Theme>
  )
}

describe('AssetHeatmapFilters', () => {
  it('shows "Todos" on both triggers when everything is selected', () => {
    renderFilters()

    expect(screen.getByRole('button', { name: 'Estado de activo del heatmap' })).toHaveTextContent(
      'Todos'
    )
    expect(screen.getByRole('button', { name: 'Tipo de activo del heatmap' })).toHaveTextContent(
      'Todos'
    )
  })

  it('narrows the status filter when a single status is unchecked via the store', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Estado de activo del heatmap' }))
    await user.click(await screen.findByText('Completo'))

    expect(useMapStore.getState().assetHeatmapFilters.statuses).toEqual([
      'OK',
      'DAMAGED',
      'OUT_OF_SERVICE'
    ])
  })

  it('narrows the type filter when a single type is unchecked via the store', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Tipo de activo del heatmap' }))
    await user.click(await screen.findByText('Cesto'))

    expect(useMapStore.getState().assetHeatmapFilters.types).toEqual(['CONTAINER', 'BENCH'])
  })

  it('clears every status when "Todos" is unchecked', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Estado de activo del heatmap' }))
    const todosCheckboxes = await screen.findAllByRole('checkbox', { name: 'Todos' })
    await user.click(todosCheckboxes[0]!)

    expect(useMapStore.getState().assetHeatmapFilters.statuses).toEqual([])
  })

  it('does not touch the incident filters', async () => {
    const user = userEvent.setup()
    useMapStore.setState({
      heatmapFilters: {
        statuses: ['REPORTED', 'IN_PROGRESS', 'RESOLVED'],
        types: ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
      }
    })
    renderFilters()

    await user.click(screen.getByRole('button', { name: 'Estado de activo del heatmap' }))
    await user.click(await screen.findByText('Completo'))

    expect(useMapStore.getState().heatmapFilters.statuses).toEqual([
      'REPORTED',
      'IN_PROGRESS',
      'RESOLVED'
    ])
  })
})
