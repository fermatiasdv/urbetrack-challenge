import { describe, expect, it } from 'vitest'
import type { BoundingBox } from '../types/domain.types'
import { ZONES } from './zones'

function overlaps(a: BoundingBox, b: BoundingBox): boolean {
  const latOverlap = a.minLat < b.maxLat && b.minLat < a.maxLat
  const lngOverlap = a.minLng < b.maxLng && b.minLng < a.maxLng
  return latOverlap && lngOverlap
}

describe('ZONES', () => {
  it('defines exactly 5 supported zones (CA-01)', () => {
    expect(Object.keys(ZONES)).toHaveLength(5)
    expect(Object.keys(ZONES).sort()).toEqual(
      ['BELGRANO', 'CABALLITO', 'MICROCENTRO', 'PALERMO', 'RECOLETA'].sort()
    )
  })

  it('has no intersection between any pair of zones (CA-02)', () => {
    const entries = Object.entries(ZONES)

    for (const [nameA, boxA] of entries) {
      for (const [nameB, boxB] of entries) {
        if (nameA >= nameB) continue // unordered pairs only, skip self-comparison

        expect.soft(overlaps(boxA, boxB), `${nameA} overlaps ${nameB}`).toBe(false)
      }
    }
  })

  it('every box is well-formed (min < max on both axes)', () => {
    for (const box of Object.values(ZONES)) {
      expect(box.minLat).toBeLessThan(box.maxLat)
      expect(box.minLng).toBeLessThan(box.maxLng)
    }
  })
})
