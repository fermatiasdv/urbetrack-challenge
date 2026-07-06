import { describe, expect, it } from 'vitest'
import { assetCreateFormSchema } from './assetCreateSchema'

const VALID_PAYLOAD = {
  type: 'BIN',
  status: 'OK',
  address: 'Av. Corrientes 1',
  zoneId: '1',
  lat: '-34.6037',
  lng: '-58.3816'
}

describe('assetCreateFormSchema', () => {
  it('accepts a valid payload and coerces lat/lng to numbers', () => {
    const result = assetCreateFormSchema.safeParse(VALID_PAYLOAD)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lat).toBeCloseTo(-34.6037)
      expect(result.data.lng).toBeCloseTo(-58.3816)
    }
  })

  it('rejects an empty address', () => {
    const result = assetCreateFormSchema.safeParse({ ...VALID_PAYLOAD, address: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty zoneId', () => {
    const result = assetCreateFormSchema.safeParse({ ...VALID_PAYLOAD, zoneId: '' })
    expect(result.success).toBe(false)
  })
})
