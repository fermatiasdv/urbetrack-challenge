import { describe, expect, it } from 'vitest'
import { HeatmapFilterSchema } from './heatmapFilterSchema'
import { ZoneSchema } from './zoneSchema'

describe('HeatmapFilterSchema', () => {
  it('accepts a valid combination of statuses and types', () => {
    const result = HeatmapFilterSchema.safeParse({
      statuses: ['REPORTED'],
      types: ['OVERFLOW', 'DAMAGE']
    })

    expect(result.success).toBe(true)
  })

  it('accepts empty arrays (nothing selected)', () => {
    expect(HeatmapFilterSchema.safeParse({ statuses: [], types: [] }).success).toBe(true)
  })

  it('rejects an invalid status value', () => {
    const result = HeatmapFilterSchema.safeParse({ statuses: ['UNKNOWN'], types: [] })

    expect(result.success).toBe(false)
  })
})

describe('ZoneSchema', () => {
  it('accepts each of the 5 supported zones', () => {
    for (const zone of ['MICROCENTRO', 'PALERMO', 'RECOLETA', 'BELGRANO', 'CABALLITO']) {
      expect(ZoneSchema.safeParse(zone).success).toBe(true)
    }
  })

  it('rejects an unsupported zone', () => {
    expect(ZoneSchema.safeParse('ONCE').success).toBe(false)
  })
})
