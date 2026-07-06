import { describe, expect, it } from 'vitest'
import { iconBoxStyleFor, secondaryColorFor } from './statusSummaryCard.styles'

describe('iconBoxStyleFor', () => {
  it('returns a distinct style for every color role, including neutral', () => {
    const roles = ['primary', 'success', 'tertiary', 'error', 'neutral'] as const
    const styles = roles.map((role) => iconBoxStyleFor(role))

    for (const style of styles) {
      expect(style.backgroundColor).toBeTruthy()
      expect(style.color).toBeTruthy()
    }
  })
})

describe('secondaryColorFor', () => {
  it('resolves the muted default and every color role', () => {
    expect(secondaryColorFor('muted')).toBeTruthy()
    expect(secondaryColorFor('success')).toBeTruthy()
    expect(secondaryColorFor('neutral')).toBeTruthy()
  })
})
