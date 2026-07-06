import { describe, expect, it } from 'vitest'
import { roundCoordinates } from './roundCoordinates'

describe('roundCoordinates', () => {
  it('rounds a lat/lng pair with more than 4 decimals down to 4 decimals', () => {
    expect(roundCoordinates(-34.60512345, -58.38299876)).toEqual({ lat: -34.6051, lng: -58.383 })
  })

  it('leaves a value with 4 or fewer decimals unchanged', () => {
    expect(roundCoordinates(-34.6, -58.38)).toEqual({ lat: -34.6, lng: -58.38 })
  })

  it('rounds positive coordinates the same way', () => {
    expect(roundCoordinates(34.123456, 58.987654)).toEqual({ lat: 34.1235, lng: 58.9877 })
  })
})
