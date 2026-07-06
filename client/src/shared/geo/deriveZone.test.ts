import { describe, expect, it } from 'vitest'
import { deriveZone } from './deriveZone'
import { ZONES } from './zones'

/** A point strictly inside a zone's box (midpoint of its lat/lng ranges). */
function midpointOf(zone: (typeof ZONES)[keyof typeof ZONES]) {
  return {
    lat: (zone.minLat + zone.maxLat) / 2,
    lng: (zone.minLng + zone.maxLng) / 2
  }
}

describe('deriveZone', () => {
  it.each(Object.entries(ZONES))('resolves %s for a point inside its bounding box', (name, box) => {
    const { lat, lng } = midpointOf(box)
    expect(deriveZone(lat, lng)).toBe(name)
  })

  it('returns null for a point in the gap between two adjacent zones (Recoleta/Palermo)', () => {
    // Recoleta maxLat -34.585 / Palermo minLat -34.584: -34.5845 falls strictly between both.
    expect(deriveZone(-34.5845, -58.39)).toBeNull()
  })

  it('returns null for a point clearly outside BA_BOUNDS', () => {
    expect(deriveZone(-10, -10)).toBeNull()
  })

  it('rounds coordinates with more than 4 decimals before evaluating (CA-06)', () => {
    // Microcentro box: minLat -34.612, maxLng -58.368. This raw value rounds to
    // exactly (-34.612, -58.368), the zone's south-east corner.
    expect(deriveZone(-34.61204999, -58.36795001)).toBe('MICROCENTRO')
  })

  it('accepts only (lat, lng) — no zoneId parameter in its signature (CA-05)', () => {
    expect(deriveZone.length).toBe(2)
  })
})
