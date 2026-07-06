import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it } from 'vitest'
import { HeatmapLegend } from './HeatmapLegend'

describe('HeatmapLegend', () => {
  it('shows the 3 incident statuses with their labels', () => {
    render(
      <Theme>
        <HeatmapLegend />
      </Theme>
    )

    expect(screen.getByText('Reportado')).toBeInTheDocument()
    expect(screen.getByText('En Progreso')).toBeInTheDocument()
    expect(screen.getByText('Resuelto')).toBeInTheDocument()
  })
})
