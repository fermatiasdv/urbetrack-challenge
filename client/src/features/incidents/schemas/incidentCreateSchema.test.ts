import { describe, expect, it } from 'vitest'
import { incidentCreateFormSchema } from './incidentCreateSchema'

const VALID_PAYLOAD = {
  type: 'OVERFLOW',
  description: 'Contenedor desbordado',
  zoneId: '1',
  lat: '-34.6037',
  lng: '-58.3816'
}

describe('incidentCreateFormSchema', () => {
  it('accepts a valid payload and coerces lat/lng to numbers', () => {
    const result = incidentCreateFormSchema.safeParse(VALID_PAYLOAD)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lat).toBeCloseTo(-34.6037)
      expect(result.data.lng).toBeCloseTo(-58.3816)
    }
  })

  it('rejects an empty description', () => {
    const result = incidentCreateFormSchema.safeParse({ ...VALID_PAYLOAD, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty zoneId', () => {
    const result = incidentCreateFormSchema.safeParse({ ...VALID_PAYLOAD, zoneId: '' })
    expect(result.success).toBe(false)
  })
})
