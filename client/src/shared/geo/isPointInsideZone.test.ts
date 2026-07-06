import { describe, expect, it } from 'vitest'
import type { BoundingBox } from '../types/domain.types'
import { isPointInsideZone } from './isPointInsideZone'

const zone: BoundingBox = { minLat: -34.612, maxLat: -34.6, minLng: -58.383, maxLng: -58.368 }

describe('isPointInsideZone', () => {
  it('returns true for a point inside the zone', () => {
    expect(isPointInsideZone(-34.606, -58.375, zone)).toBe(true)
  })

  it('returns false for a point clearly outside the zone', () => {
    expect(isPointInsideZone(-34.7, -58.5, zone)).toBe(false)
  })

  it('treats all 4 edges as inclusive', () => {
    expect(isPointInsideZone(zone.minLat, -58.375, zone)).toBe(true)
    expect(isPointInsideZone(zone.maxLat, -58.375, zone)).toBe(true)
    expect(isPointInsideZone(-34.606, zone.minLng, zone)).toBe(true)
    expect(isPointInsideZone(-34.606, zone.maxLng, zone)).toBe(true)
  })

  it('treats all 4 corners as inclusive', () => {
    expect(isPointInsideZone(zone.minLat, zone.minLng, zone)).toBe(true)
    expect(isPointInsideZone(zone.minLat, zone.maxLng, zone)).toBe(true)
    expect(isPointInsideZone(zone.maxLat, zone.minLng, zone)).toBe(true)
    expect(isPointInsideZone(zone.maxLat, zone.maxLng, zone)).toBe(true)
  })

  it('returns false for a point just outside each edge', () => {
    expect(isPointInsideZone(zone.minLat - 0.0001, -58.375, zone)).toBe(false)
    expect(isPointInsideZone(zone.maxLat + 0.0001, -58.375, zone)).toBe(false)
    expect(isPointInsideZone(-34.606, zone.minLng - 0.0001, zone)).toBe(false)
    expect(isPointInsideZone(-34.606, zone.maxLng + 0.0001, zone)).toBe(false)
  })
})
