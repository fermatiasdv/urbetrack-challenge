import { describe, expect, it } from 'vitest'
import { zoneNameFor } from './zoneNameFor'

describe('zoneNameFor', () => {
  it('resolves the zone name from the map', () => {
    const zonesById = new Map([['1', 'Microcentro']])
    expect(zoneNameFor('1', zonesById)).toBe('Microcentro')
  })

  it('falls back to the raw zoneId when the map has no entry (zones still loading)', () => {
    expect(zoneNameFor('9', new Map())).toBe('9')
  })
})
