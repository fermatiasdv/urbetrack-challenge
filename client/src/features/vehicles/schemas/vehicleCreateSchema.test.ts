import { describe, expect, it } from 'vitest'
import { vehicleCreateFormSchema } from './vehicleCreateSchema'

const VALID_PAYLOAD = {
  plate: 'ABC123',
  type: 'TRUCK',
  capacity: '5000',
  status: 'ACTIVE',
  zoneId: '1'
}

describe('vehicleCreateFormSchema', () => {
  it('accepts a valid payload and coerces capacity to a number', () => {
    const result = vehicleCreateFormSchema.safeParse(VALID_PAYLOAD)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.capacity).toBe(5000)
    }
  })

  it('rejects an invalid plate', () => {
    const result = vehicleCreateFormSchema.safeParse({ ...VALID_PAYLOAD, plate: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-positive capacity', () => {
    const result = vehicleCreateFormSchema.safeParse({ ...VALID_PAYLOAD, capacity: '0' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty zoneId', () => {
    const result = vehicleCreateFormSchema.safeParse({ ...VALID_PAYLOAD, zoneId: '' })
    expect(result.success).toBe(false)
  })
})
