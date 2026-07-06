import { describe, expect, it } from 'vitest'
import { distanceMeters } from './distanceMeters'

describe('distanceMeters', () => {
  it('returns 0 for two identical points', () => {
    const point = { lat: -34.6037, lng: -58.3816 }

    expect(distanceMeters(point, point)).toBe(0)
  })

  it('is symmetric regardless of argument order', () => {
    const a = { lat: -34.6037, lng: -58.3816 }
    const b = { lat: -34.6, lng: -58.38 }

    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 6)
  })

  it('matches a known reference distance (~111.19m per 0.001° of latitude)', () => {
    const a = { lat: 0, lng: 0 }
    const b = { lat: 0.001, lng: 0 }

    expect(distanceMeters(a, b)).toBeCloseTo(111.19, 0)
  })

  it('returns a larger distance for farther-apart points', () => {
    const origin = { lat: -34.6037, lng: -58.3816 }
    const near = { lat: -34.6038, lng: -58.3816 }
    const far = { lat: -34.62, lng: -58.4 }

    expect(distanceMeters(origin, far)).toBeGreaterThan(distanceMeters(origin, near))
  })
})
