import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Theme } from '@radix-ui/themes'
import { beforeEach, describe, expect, it } from 'vitest'
import { HeatmapToggle } from './HeatmapToggle'
import { useMapStore } from '../store/useMapStore'

beforeEach(() => {
  useMapStore.setState({ heatmapEnabled: false })
})

function renderToggle() {
  return render(
    <Theme>
      <HeatmapToggle />
    </Theme>
  )
}

describe('HeatmapToggle', () => {
  it('reflects the current heatmapEnabled state', () => {
    renderToggle()

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('toggles heatmapEnabled when clicked', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('checkbox'))

    expect(useMapStore.getState().heatmapEnabled).toBe(true)
  })

  it('shows the "Mapa de calor" title and its subtitle', () => {
    renderToggle()

    expect(screen.getByText('Mapa de calor')).toBeInTheDocument()
    expect(screen.getByText('Visualiza intensidad en el mapa')).toBeInTheDocument()
  })
})
