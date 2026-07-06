import { render, screen } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { describe, expect, it } from 'vitest'
import { StatusSummaryCards } from './StatusSummaryCards'
import type { StatusSummaryCardData } from './StatusSummaryCard'
import { Truck } from 'lucide-react'

const CARDS: StatusSummaryCardData[] = [
  {
    key: 'total',
    label: 'Total',
    value: 10,
    icon: Truck,
    secondaryText: '100%',
    iconBoxColorRole: 'primary',
    secondaryTextColorRole: 'muted'
  },
  {
    key: 'ok',
    label: 'OK',
    value: 5,
    icon: Truck,
    secondaryText: '50%',
    iconBoxColorRole: 'success',
    secondaryTextColorRole: 'success'
  }
]

describe('StatusSummaryCards', () => {
  it('renders one StatusSummaryCard per data entry', () => {
    render(
      <Theme>
        <StatusSummaryCards cards={CARDS} />
      </Theme>
    )

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders nothing when there are no cards', () => {
    render(
      <Theme>
        <StatusSummaryCards cards={[]} />
      </Theme>
    )

    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })
})
