import { describe, expect, it } from 'vitest'
import { ZONES, zoneNameFor } from './types'

describe('zoneNameFor', () => {
  it('returns the mapped zone name for a known zoneId', () => {
    expect(zoneNameFor('1')).toBe(ZONES['1'])
  })

  it('falls back to the raw zoneId when it has no mapping', () => {
    expect(zoneNameFor('unknown-zone')).toBe('unknown-zone')
  })
})
