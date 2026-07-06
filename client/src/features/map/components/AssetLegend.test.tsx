import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it } from 'vitest'
import { AssetLegend } from './AssetLegend'

describe('AssetLegend', () => {
  it('shows the 4 asset statuses with their labels', () => {
    render(
      <Theme>
        <AssetLegend />
      </Theme>
    )

    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Completo')).toBeInTheDocument()
    expect(screen.getByText('Dañado')).toBeInTheDocument()
    expect(screen.getByText('Fuera de servicio')).toBeInTheDocument()
  })
})
