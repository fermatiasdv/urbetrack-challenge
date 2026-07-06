import { describe, expect, it } from 'vitest'
import { formatPercentage } from './formatPercentage'

describe('formatPercentage', () => {
  it('returns 0% when total is 0', () => {
    expect(formatPercentage(0, 0)).toBe('0%')
  })

  it('returns an integer percentage without decimals', () => {
    expect(formatPercentage(69, 100)).toBe('69%')
  })

  it('returns one decimal when the result is not an integer', () => {
    expect(formatPercentage(37, 200)).toBe('18.5%')
  })
})
